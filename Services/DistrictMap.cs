namespace MathVoyager.Services;

// The Gerrymander lab's state: 49 voters on a 7x7 grid, split 25 Blue to 24 Red, carved into 7 districts of 7.
// A map is an int[49] of district numbers, row by row.
public static class DistrictMap
{
    public const int Side = 7, Cells = Side * Side, Districts = 7, Size = 7, ToWin = Size / 2 + 1;

    // A blue city on the west side, red countryside around it.
    public static readonly bool[] Blue = Parse("rrrrBBr/rBBBBBr/rBBBBrr/BBBBBrr/rBBBBrr/BBBBrrr/rrrrBrr");

    // Found by a search over contiguous equal-population plans: the most compact map for each result.
    public static readonly IReadOnlyDictionary<string, int[]> Presets = new Dictionary<string, int[]>
    {
        // Close contests everywhere; Blue's majority of votes becomes a 4-3 majority of seats.
        ["neutral"] = Renumber(new[] { 6, 6, 1, 1, 0, 0, 0, 6, 6, 1, 1, 0, 0, 0, 6, 6, 1, 1, 2, 2, 0, 6, 5, 1, 2, 2, 2, 2, 5, 5, 4, 4, 4, 2, 3, 5, 5, 4, 4, 3, 3, 3, 5, 5, 4, 4, 3, 3, 3 }),
        // Red packed into the south-east corner, the rest cracked into six 4-3 Blue wins.
        ["blue"] = Renumber(new[] { 6, 2, 2, 2, 0, 0, 0, 6, 6, 2, 2, 0, 0, 0, 6, 6, 2, 1, 1, 1, 0, 6, 6, 2, 1, 1, 1, 1, 3, 3, 3, 5, 5, 4, 4, 3, 3, 5, 5, 5, 4, 4, 3, 3, 5, 5, 4, 4, 4 }),
        // Blue's city core packed into one 7-0 district, the rest cracked into six 4-3 Red wins.
        ["red"] = Renumber(new[] { 5, 5, 5, 5, 0, 0, 0, 4, 5, 5, 5, 3, 0, 0, 4, 4, 1, 1, 3, 0, 0, 4, 1, 1, 1, 3, 3, 3, 4, 1, 1, 2, 2, 3, 3, 4, 6, 6, 2, 2, 2, 2, 4, 6, 6, 6, 6, 6, 2 }),
    };

    public static int BlueVoters => Blue.Count(b => b);

    private static bool[] Parse(string rows) => rows.Replace("/", "").Select(ch => ch == 'B').ToArray();

    // Numbers districts in reading order of their first cell, so District 1 is always the top-left one.
    public static int[] Renumber(int[] map)
    {
        var next = new Dictionary<int, int>();
        foreach (var d in map) if (!next.ContainsKey(d)) next[d] = next.Count;
        return map.Select(d => next[d]).ToArray();
    }

    public static IEnumerable<int> Neighbours(int i)
    {
        int r = i / Side, c = i % Side;
        if (r > 0) yield return i - Side;
        if (r < Side - 1) yield return i + Side;
        if (c > 0) yield return i - 1;
        if (c < Side - 1) yield return i + 1;
    }

    public static int CountIn(int[] map, int d) => map.Count(x => x == d);

    public static bool Contiguous(int[] map, int d)
    {
        var start = Array.IndexOf(map, d);
        if (start < 0) return false;
        var seen = new HashSet<int> { start };
        var stack = new Stack<int>(seen);
        while (stack.Count > 0)
            foreach (var n in Neighbours(stack.Pop()))
                if (map[n] == d && seen.Add(n)) stack.Push(n);
        return seen.Count == CountIn(map, d);
    }

    public static bool IsValid(int[] map) =>
        Enumerable.Range(0, Districts).All(d => CountIn(map, d) == Size && Contiguous(map, d));

    // What stops a hand-drawn map from being counted, in district order.
    public static List<string> Problems(int[] map)
    {
        var list = new List<string>();
        for (int d = 0; d < Districts; d++)
        {
            var n = CountIn(map, d);
            if (n != Size) list.Add($"District {d + 1} has {n} voter{(n == 1 ? "" : "s")}");
            else if (!Contiguous(map, d)) list.Add($"District {d + 1} is in pieces");
        }
        return list;
    }

    // Pulls a voter into district d across its border. Refused unless the voter touches d and its own district keeps
    // at least one voter, so no district can vanish.
    public static bool TryMove(int[] map, int cell, int d)
    {
        if (cell < 0 || cell >= Cells || d < 0 || d >= Districts || map[cell] == d) return false;
        if (CountIn(map, map[cell]) <= 1 || !Neighbours(cell).Any(n => map[n] == d)) return false;
        map[cell] = d;
        return true;
    }

    public readonly record struct Tally(int Blue, int Red)
    {
        public int Total => Blue + Red;
        // 'b', 'r', or '=' for a tie (only possible on an unfinished map).
        public char Winner => Blue > Red ? 'b' : Red > Blue ? 'r' : '=';
    }

    public static Tally[] Tallies(int[] map)
    {
        var t = new Tally[Districts];
        for (int i = 0; i < Cells; i++)
        {
            var d = map[i];
            t[d] = Blue[i] ? t[d] with { Blue = t[d].Blue + 1 } : t[d] with { Red = t[d].Red + 1 };
        }
        return t;
    }

    public sealed record Outcome(int BlueSeats, int RedSeats, int WastedBlue, int WastedRed)
    {
        // Positive favours Blue: Red wasted more votes than Blue, as a share of all votes cast.
        public double EfficiencyGap => (WastedRed - WastedBlue) / (double)Cells;
    }

    // A wasted vote is one cast for a loser, or for a winner beyond the ToWin votes they needed.
    public static Outcome Score(int[] map)
    {
        int bs = 0, rs = 0, wb = 0, wr = 0;
        foreach (var t in Tallies(map))
        {
            if (t.Winner == 'b') { bs++; wb += t.Blue - ToWin; wr += t.Red; }
            else if (t.Winner == 'r') { rs++; wr += t.Red - ToWin; wb += t.Blue; }
        }
        return new Outcome(bs, rs, wb, wr);
    }

    // A wash shade (0-2) per district, so neighbouring districts with the same winner never share a shade.
    public static int[] Shades(int[] map)
    {
        var t = Tallies(map);
        var shade = new int[Districts];
        for (int d = 0; d < Districts; d++)
        {
            var taken = new HashSet<int>();
            for (int i = 0; i < Cells; i++)
                if (map[i] == d)
                    foreach (var n in Neighbours(i))
                        if (map[n] < d && t[map[n]].Winner == t[d].Winner) taken.Add(shade[map[n]]);
            while (taken.Contains(shade[d])) shade[d]++;
            shade[d] %= 3;
        }
        return shade;
    }

    // Border segments between cells of different districts plus the outer edge, as an SVG path in cell units.
    public static string BorderPath(int[] map, double cell)
    {
        var sb = new System.Text.StringBuilder();
        string F(double v) => v.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture);
        void Seg(double x1, double y1, double x2, double y2) => sb.Append('M').Append(F(x1)).Append(' ').Append(F(y1)).Append('L').Append(F(x2)).Append(' ').Append(F(y2));
        for (int i = 0; i < Cells; i++)
        {
            int r = i / Side, c = i % Side;
            double x = c * cell, y = r * cell;
            if (r == 0 || map[i - Side] != map[i]) Seg(x, y, x + cell, y);
            if (c == 0 || map[i - 1] != map[i]) Seg(x, y, x, y + cell);
            if (r == Side - 1) Seg(x, y + cell, x + cell, y + cell);
            if (c == Side - 1) Seg(x + cell, y, x + cell, y + cell);
        }
        return sb.ToString();
    }
}
