namespace MathVoyager.Services;

public sealed class MolAtom
{
    public MolAtom(string element, double x, double y)
    {
        Element = element;
        X = x;
        Y = y;
    }

    public string Element { get; }
    public double X { get; internal set; }
    public double Y { get; internal set; }
}

public readonly record struct MolBond(int A, int B, int Order)
{
    public bool Joins(int atom) => A == atom || B == atom;
    public int Other(int atom) => A == atom ? B : A;
}

// Pure model behind the Molecule Builder: atoms on a 400x300 canvas, bonds of order 1-3,
// valence rules, Hill formulas and graph isomorphism for recognising what was built.
public sealed class MoleculeGraph
{
    public const double Width = 400, Height = 300, Edge = 16;
    public const double MinSpacing = 26, HydrogenBondLength = 32;

    // Neutral-atom valences; S and P can also expand their octet.
    private static readonly Dictionary<string, int[]> Valences = new()
    {
        ["H"] = new[] { 1 },
        ["C"] = new[] { 4 },
        ["N"] = new[] { 3 },
        ["O"] = new[] { 2 },
        ["F"] = new[] { 1 },
        ["Cl"] = new[] { 1 },
        ["S"] = new[] { 2, 4, 6 },
        ["P"] = new[] { 3, 5 },
    };

    private static readonly Dictionary<string, int> ValenceElectrons = new()
    {
        ["H"] = 1, ["C"] = 4, ["N"] = 5, ["O"] = 6, ["F"] = 7, ["Cl"] = 7, ["S"] = 6, ["P"] = 5,
    };

    private readonly List<MolAtom> atoms = new();
    private readonly List<MolBond> bonds = new();

    public IReadOnlyList<MolAtom> Atoms => atoms;
    public IReadOnlyList<MolBond> Bonds => bonds;

    public static bool IsKnownElement(string element) => Valences.ContainsKey(element);

    public static int MaxValence(string element) => Valences[element][^1];

    public MoleculeGraph Clone()
    {
        var g = new MoleculeGraph();
        foreach (var a in atoms) g.atoms.Add(new MolAtom(a.Element, a.X, a.Y));
        g.bonds.AddRange(bonds);
        return g;
    }

    public void Clear()
    {
        atoms.Clear();
        bonds.Clear();
    }

    // ---- Valence ----

    public int BondOrderSum(int atom)
    {
        var sum = 0;
        foreach (var b in bonds) if (b.Joins(atom)) sum += b.Order;
        return sum;
    }

    public int Degree(int atom) => bonds.Count(b => b.Joins(atom));

    // Bonds still needed to reach the nearest allowed valence at or above the current bond count.
    public int OpenValence(int atom)
    {
        var used = BondOrderSum(atom);
        foreach (var v in Valences[atoms[atom].Element])
            if (v >= used) return v - used;
        return 0;
    }

    // Valence electrons not in bonds pair up, except the unpaired ones still open for bonding.
    public int LonePairs(int atom)
    {
        var used = BondOrderSum(atom);
        return Math.Max(0, (ValenceElectrons[atoms[atom].Element] - used - OpenValence(atom)) / 2);
    }

    public int OpenValenceTotal => Enumerable.Range(0, atoms.Count).Sum(OpenValence);

    public bool IsComplete => atoms.Count > 0 && OpenValenceTotal == 0;

    public int ComponentCount()
    {
        var seen = new bool[atoms.Count];
        var count = 0;
        for (int start = 0; start < atoms.Count; start++)
        {
            if (seen[start]) continue;
            count++;
            var stack = new Stack<int>();
            stack.Push(start);
            seen[start] = true;
            while (stack.Count > 0)
            {
                var i = stack.Pop();
                foreach (var b in bonds)
                {
                    if (!b.Joins(i)) continue;
                    var j = b.Other(i);
                    if (seen[j]) continue;
                    seen[j] = true;
                    stack.Push(j);
                }
            }
        }
        return count;
    }

    // ---- Editing ----

    public bool CanPlace(double x, double y, int ignore = -1)
    {
        for (int i = 0; i < atoms.Count; i++)
        {
            if (i == ignore) continue;
            if (Distance(atoms[i].X, atoms[i].Y, x, y) < MinSpacing) return false;
        }
        return true;
    }

    public string? AddAtom(string element, double x, double y)
    {
        if (!IsKnownElement(element)) throw new ArgumentException($"Unknown element {element}", nameof(element));
        if (!CanPlace(x, y)) return "Too close to another atom.";
        atoms.Add(new MolAtom(element, x, y));
        return null;
    }

    public bool MoveAtom(int atom, double x, double y)
    {
        if (!CanPlace(x, y, atom)) return false;
        atoms[atom].X = x;
        atoms[atom].Y = y;
        return true;
    }

    public int BondBetween(int a, int b) => bonds.FindIndex(x => (x.A == a && x.B == b) || (x.A == b && x.B == a));

    // Adds a bond, or changes the order of an existing one. Returns a short reason when refused.
    public string? SetBond(int a, int b, int order)
    {
        if (a == b) return "An atom cannot bond to itself.";
        if (order is < 1 or > 3) throw new ArgumentOutOfRangeException(nameof(order));
        var existing = BondBetween(a, b);
        var previous = existing >= 0 ? bonds[existing].Order : 0;
        foreach (var atom in new[] { a, b })
        {
            var element = atoms[atom].Element;
            var max = MaxValence(element);
            if (BondOrderSum(atom) - previous + order > max)
                return $"{element} can form at most {max} bond{(max == 1 ? "" : "s")}.";
        }
        if (existing >= 0) bonds[existing] = new MolBond(a, b, order);
        else bonds.Add(new MolBond(a, b, order));
        return null;
    }

    public void RemoveBond(int index) => bonds.RemoveAt(index);

    public void RemoveAtom(int atom)
    {
        bonds.RemoveAll(b => b.Joins(atom));
        for (int k = 0; k < bonds.Count; k++)
        {
            var b = bonds[k];
            bonds[k] = new MolBond(b.A > atom ? b.A - 1 : b.A, b.B > atom ? b.B - 1 : b.B, b.Order);
        }
        atoms.RemoveAt(atom);
    }

    // Adds H to every open valence on non-hydrogen atoms. Returns how many could not be placed.
    public int FillHydrogens()
    {
        var missing = 0;
        var heavyCount = atoms.Count;
        for (int i = 0; i < heavyCount; i++)
        {
            if (atoms[i].Element == "H") continue;
            var open = OpenValence(i);
            if (open == 0) continue;
            var angles = Degree(i) == 0
                ? LoneAtomSlots(open, LonePairs(i)).Take(open)
                : SpreadAngles(NeighborAngles(i), open);
            foreach (var angle in angles)
                if (!TryPlaceHydrogen(i, angle)) missing++;
        }
        return missing;
    }

    private bool TryPlaceHydrogen(int parent, double angle)
    {
        var p = atoms[parent];
        foreach (var length in new[] { HydrogenBondLength, HydrogenBondLength + 10 })
        {
            foreach (var delta in new[] { 0, 15, -15, 30, -30, 45, -45, 60, -60 })
            {
                var rad = (angle + delta) * Math.PI / 180;
                var x = p.X + length * Math.Cos(rad);
                var y = p.Y + length * Math.Sin(rad);
                if (x < Edge || x > Width - Edge || y < Edge || y > Height - Edge || !CanPlace(x, y)) continue;
                atoms.Add(new MolAtom("H", x, y));
                bonds.Add(new MolBond(parent, atoms.Count - 1, 1));
                return true;
            }
        }
        return false;
    }

    // ---- Geometry ----

    // Distance from the point to the atom's drawn edge (negative inside it); radius null means the centre.
    public double DistanceToAtom(int atom, double x, double y, Func<string, double>? radius = null) =>
        Distance(atoms[atom].X, atoms[atom].Y, x, y) - (radius?.Invoke(atoms[atom].Element) ?? 0);

    public double DistanceToBond(int bond, double x, double y)
    {
        var a = atoms[bonds[bond].A];
        var b = atoms[bonds[bond].B];
        return SegmentDistance(x, y, a.X, a.Y, b.X, b.Y);
    }

    public int AtomAt(double x, double y, double reach, Func<string, double>? radius = null)
    {
        var best = -1;
        var bestDist = reach;
        for (int i = 0; i < atoms.Count; i++)
        {
            var d = DistanceToAtom(i, x, y, radius);
            if (d <= bestDist) { best = i; bestDist = d; }
        }
        return best;
    }

    public int BondAt(double x, double y, double reach)
    {
        var best = -1;
        var bestDist = reach;
        for (int k = 0; k < bonds.Count; k++)
        {
            var d = DistanceToBond(k, x, y);
            if (d <= bestDist) { best = k; bestDist = d; }
        }
        return best;
    }

    // Directions (degrees, SVG y-down) from an atom to each bonded neighbour.
    public List<double> NeighborAngles(int atom)
    {
        var a = atoms[atom];
        var list = new List<double>();
        foreach (var b in bonds)
        {
            if (!b.Joins(atom)) continue;
            var o = atoms[b.Other(atom)];
            list.Add(Normalize(Math.Atan2(o.Y - a.Y, o.X - a.X) * 180 / Math.PI));
        }
        return list;
    }

    // Puts `count` new directions into the widest gaps between existing bonds, spread evenly.
    public static List<double> SpreadAngles(IReadOnlyList<double> occupied, int count)
    {
        var result = new List<double>();
        if (count <= 0) return result;
        if (occupied.Count == 0)
        {
            var start = 90 - (count - 1) * 180.0 / count;
            for (int i = 0; i < count; i++) result.Add(Normalize(start + i * 360.0 / count));
            return result;
        }
        var sorted = occupied.Select(Normalize).OrderBy(a => a).ToList();
        var n = sorted.Count;
        var sizes = new double[n];
        for (int k = 0; k < n; k++)
            sizes[k] = n == 1 ? 360 : (k == n - 1 ? sorted[0] + 360 : sorted[k + 1]) - sorted[k];
        var alloc = new int[n];
        for (int c = 0; c < count; c++)
        {
            var best = 0;
            for (int k = 1; k < n; k++)
                if (sizes[k] / (alloc[k] + 1) > sizes[best] / (alloc[best] + 1) + 1e-9) best = k;
            alloc[best]++;
        }
        for (int k = 0; k < n; k++)
            for (int j = 1; j <= alloc[k]; j++)
                result.Add(Normalize(sorted[k] + sizes[k] * j / (alloc[k] + 1)));
        return result;
    }

    // Evenly spaced directions for an unbonded atom: the bond slots come first and are centred on
    // "down", so a lone O fills to a bent water with its lone pairs above.
    public static List<double> LoneAtomSlots(int bondSlots, int pairSlots)
    {
        var total = bondSlots + pairSlots;
        var result = new List<double>();
        if (total == 0) return result;
        var start = 90 - Math.Max(0, bondSlots - 1) * 180.0 / total;
        for (int i = 0; i < total; i++) result.Add(Normalize(start + i * 360.0 / total));
        return result;
    }

    // ---- Formula ----

    public Dictionary<string, int> Composition()
    {
        var counts = new Dictionary<string, int>();
        foreach (var a in atoms) counts[a.Element] = counts.GetValueOrDefault(a.Element) + 1;
        return counts;
    }

    public string HillFormula() => HillFormula(Composition());

    // Hill order: C then H then the rest alphabetically; without carbon everything is alphabetical.
    public static string HillFormula(IReadOnlyDictionary<string, int> counts)
    {
        var parts = new List<string>();
        var rest = counts.Keys.ToList();
        if (counts.ContainsKey("C"))
        {
            parts.Add(Part("C", counts["C"]));
            rest.Remove("C");
            if (counts.TryGetValue("H", out var h))
            {
                parts.Add(Part("H", h));
                rest.Remove("H");
            }
        }
        foreach (var el in rest.OrderBy(k => k, StringComparer.Ordinal)) parts.Add(Part(el, counts[el]));
        return string.Concat(parts);
    }

    private static string Part(string element, int count) => count == 1 ? element : $"{element}{count}";

    // Parses formulas such as "C2H5OH" or "CO(NH2)2" into element counts.
    public static Dictionary<string, int> ParseFormula(string formula)
    {
        var i = 0;
        var counts = ParseGroup(formula, ref i);
        if (i != formula.Length) throw new FormatException($"Unexpected ')' in {formula}");
        return counts;
    }

    private static Dictionary<string, int> ParseGroup(string f, ref int i)
    {
        var counts = new Dictionary<string, int>();
        while (i < f.Length && f[i] != ')')
        {
            Dictionary<string, int> part;
            if (f[i] == '(')
            {
                i++;
                part = ParseGroup(f, ref i);
                if (i >= f.Length) throw new FormatException($"Unclosed '(' in {f}");
                i++;
            }
            else if (char.IsUpper(f[i]))
            {
                var start = i++;
                while (i < f.Length && char.IsLower(f[i])) i++;
                part = new Dictionary<string, int> { [f[start..i]] = 1 };
            }
            else throw new FormatException($"Unexpected '{f[i]}' in {f}");

            var digits = i;
            while (i < f.Length && char.IsDigit(f[i])) i++;
            var n = i > digits ? int.Parse(f[digits..i]) : 1;
            foreach (var kv in part) counts[kv.Key] = counts.GetValueOrDefault(kv.Key) + kv.Value * n;
        }
        return counts;
    }

    public static bool SameComposition(IReadOnlyDictionary<string, int> a, IReadOnlyDictionary<string, int> b) =>
        a.Count == b.Count && a.All(kv => b.TryGetValue(kv.Key, out var n) && n == kv.Value);

    // ---- Isomorphism ----

    // True when some one-to-one atom mapping preserves elements and bonds. With compareOrders false,
    // bond orders are ignored, so shifted double bonds in a ring (another resonance form) still match.
    public bool IsIsomorphicTo(MoleculeGraph other, bool compareOrders = true)
    {
        var n = atoms.Count;
        if (n != other.atoms.Count || bonds.Count != other.bonds.Count) return false;
        var sigA = Signatures(compareOrders);
        var sigB = other.Signatures(compareOrders);
        if (!sigA.OrderBy(s => s, StringComparer.Ordinal).SequenceEqual(sigB.OrderBy(s => s, StringComparer.Ordinal)))
            return false;

        var ma = OrderMatrix(compareOrders);
        var mb = other.OrderMatrix(compareOrders);
        var order = SearchOrder(sigA);
        var map = new int[n];
        var used = new bool[n];

        bool Extend(int k)
        {
            if (k == n) return true;
            var i = order[k];
            for (int j = 0; j < n; j++)
            {
                if (used[j] || sigA[i] != sigB[j]) continue;
                var ok = true;
                for (int q = 0; q < k && ok; q++)
                {
                    var p = order[q];
                    ok = ma[i, p] == mb[j, map[p]];
                }
                if (!ok) continue;
                map[i] = j;
                used[j] = true;
                if (Extend(k + 1)) return true;
                used[j] = false;
            }
            return false;
        }

        return Extend(0);
    }

    private string[] Signatures(bool withOrders)
    {
        var sig = new string[atoms.Count];
        for (int i = 0; i < atoms.Count; i++)
        {
            var orders = bonds.Where(b => b.Joins(i)).Select(b => withOrders ? b.Order : 1).OrderBy(o => o);
            sig[i] = atoms[i].Element + ":" + string.Concat(orders);
        }
        return sig;
    }

    private int[,] OrderMatrix(bool withOrders)
    {
        var m = new int[atoms.Count, atoms.Count];
        foreach (var b in bonds)
        {
            var v = withOrders ? b.Order : 1;
            m[b.A, b.B] = v;
            m[b.B, b.A] = v;
        }
        return m;
    }

    // Breadth-first from the rarest atom kind, so each atom after the first is constrained by a mapped neighbour.
    private int[] SearchOrder(string[] sig)
    {
        var rarity = sig.GroupBy(s => s).ToDictionary(g => g.Key, g => g.Count());
        var seen = new bool[atoms.Count];
        var order = new List<int>();
        foreach (var root in Enumerable.Range(0, atoms.Count).OrderBy(i => rarity[sig[i]]))
        {
            if (seen[root]) continue;
            var queue = new Queue<int>();
            queue.Enqueue(root);
            seen[root] = true;
            while (queue.Count > 0)
            {
                var i = queue.Dequeue();
                order.Add(i);
                foreach (var b in bonds)
                {
                    if (!b.Joins(i)) continue;
                    var j = b.Other(i);
                    if (seen[j]) continue;
                    seen[j] = true;
                    queue.Enqueue(j);
                }
            }
        }
        return order.ToArray();
    }

    // ---- Helpers ----

    private static double Normalize(double degrees) => ((degrees % 360) + 360) % 360;

    private static double Distance(double x1, double y1, double x2, double y2) =>
        Math.Sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

    private static double SegmentDistance(double px, double py, double ax, double ay, double bx, double by)
    {
        var dx = bx - ax;
        var dy = by - ay;
        var len2 = dx * dx + dy * dy;
        var t = len2 < 1e-9 ? 0 : Math.Clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
        return Distance(px, py, ax + t * dx, ay + t * dy);
    }
}
