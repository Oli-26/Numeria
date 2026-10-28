namespace MathVoyager.Services;

public sealed record LibraryMolecule(string Name, string Formula, MoleculeGraph Graph, string? Note = null);

public enum MatchKind
{
    None,
    // Same atoms and bonds as a library molecule.
    Exact,
    // Same connectivity, double bonds placed as another resonance structure.
    Resonance,
    // Complete molecule with a library molecule's formula but a different structure.
    Isomer,
    // Right atoms for a library molecule, not yet bonded into a complete molecule.
    SameAtoms,
}

public sealed record Recognition(MatchKind Kind, LibraryMolecule? Molecule)
{
    public static readonly Recognition Nothing = new(MatchKind.None, null);
    public bool IsMatch => Kind is MatchKind.Exact or MatchKind.Resonance;
}

public static class MoleculeLibrary
{
    // Heavy atoms and their bonds; hydrogens are filled in by MoleculeGraph.FillHydrogens unless listed.
    public static IReadOnlyList<LibraryMolecule> All { get; } = new List<LibraryMolecule>
    {
        Make("Water", "H2O", new[] { ("O", 200.0, 135.0) }, Array.Empty<(int, int, int)>()),

        Make("Methane", "CH4", new[] { ("C", 200.0, 150.0) }, Array.Empty<(int, int, int)>()),

        Make("Ammonia", "NH3", new[] { ("N", 200.0, 140.0) }, Array.Empty<(int, int, int)>()),

        Make("Carbon dioxide", "CO2",
            new[] { ("C", 200.0, 150.0), ("O", 154.0, 150.0), ("O", 246.0, 150.0) },
            new[] { (0, 1, 2), (0, 2, 2) }),

        Make("Methanol", "CH3OH",
            new[] { ("C", 180.0, 150.0), ("O", 226.0, 150.0) },
            new[] { (0, 1, 1) }),

        Make("Ethanol", "C2H5OH",
            new[] { ("C", 150.0, 160.0), ("C", 194.0, 140.0), ("O", 238.0, 160.0) },
            new[] { (0, 1, 1), (1, 2, 1) }),

        Make("Ethene", "C2H4",
            new[] { ("C", 178.0, 150.0), ("C", 222.0, 150.0) },
            new[] { (0, 1, 2) }),

        Make("Ethyne", "C2H2",
            new[] { ("C", 178.0, 150.0), ("C", 222.0, 150.0) },
            new[] { (0, 1, 3) }),

        Make("Formaldehyde", "CH2O",
            new[] { ("C", 200.0, 165.0), ("O", 200.0, 119.0) },
            new[] { (0, 1, 2) }),

        Make("Hydrogen peroxide", "H2O2",
            new[] { ("O", 178.0, 150.0), ("O", 222.0, 150.0), ("H", 155.4, 127.4), ("H", 244.6, 172.6) },
            new[] { (0, 1, 1), (0, 2, 1), (1, 3, 1) }),

        Make("Urea", "CO(NH2)2",
            new[] { ("C", 200.0, 140.0), ("O", 200.0, 94.0), ("N", 163.6, 161.0), ("N", 236.4, 161.0) },
            new[] { (0, 1, 2), (0, 2, 1), (0, 3, 1) }),

        Make("Acetic acid", "CH3COOH",
            new[] { ("C", 160.0, 165.0), ("C", 204.0, 145.0), ("O", 204.0, 99.0), ("O", 248.0, 165.0) },
            new[] { (0, 1, 1), (1, 2, 2), (1, 3, 1) }),

        Make("Glycine", "C2H5NO2",
            new[] { ("N", 130.0, 165.0), ("C", 174.0, 145.0), ("C", 218.0, 165.0), ("O", 218.0, 211.0), ("O", 262.0, 145.0) },
            new[] { (0, 1, 1), (1, 2, 1), (2, 3, 2), (2, 4, 1) }),

        Make("Benzene", "C6H6",
            new[]
            {
                ("C", 200.0, 108.0), ("C", 236.4, 129.0), ("C", 236.4, 171.0),
                ("C", 200.0, 192.0), ("C", 163.6, 171.0), ("C", 163.6, 129.0),
            },
            new[] { (0, 1, 2), (1, 2, 1), (2, 3, 2), (3, 4, 1), (4, 5, 2), (5, 0, 1) }),

        // Open chain CHO-(CHOH)4-CH2OH drawn left to right.
        Make("Glucose", "C6H12O6",
            new[]
            {
                ("C", 50.0, 150.0), ("C", 109.0, 150.0), ("C", 168.0, 150.0),
                ("C", 227.0, 150.0), ("C", 286.0, 150.0), ("C", 345.0, 150.0),
                ("O", 50.0, 104.0), ("O", 109.0, 196.0), ("O", 168.0, 104.0),
                ("O", 227.0, 196.0), ("O", 286.0, 196.0), ("O", 345.0, 196.0),
            },
            new[]
            {
                (0, 1, 1), (1, 2, 1), (2, 3, 1), (3, 4, 1), (4, 5, 1),
                (0, 6, 2), (1, 7, 1), (2, 8, 1), (3, 9, 1), (4, 10, 1), (5, 11, 1),
            },
            "Open-chain form. In water, most glucose curls up into a six-membered ring."),

        // 1,3,7-trimethylxanthine: a six-membered ring fused to a five-membered ring through C4-C5.
        Make("Caffeine", "C8H10N4O2",
            new[]
            {
                ("N", 158.6, 134.0), ("C", 158.6, 176.0), ("N", 195.0, 197.0), ("C", 231.4, 176.0),
                ("C", 231.4, 134.0), ("C", 195.0, 113.0), ("N", 271.3, 121.0), ("C", 296.0, 155.0),
                ("N", 271.3, 189.0), ("O", 122.2, 197.0), ("O", 195.0, 71.0),
                ("C", 122.2, 113.0), ("C", 195.0, 239.0), ("C", 284.3, 81.1),
            },
            new[]
            {
                (0, 1, 1), (1, 2, 1), (2, 3, 1), (3, 4, 2), (4, 5, 1), (5, 0, 1),
                (4, 6, 1), (6, 7, 1), (7, 8, 2), (8, 3, 1),
                (1, 9, 2), (5, 10, 2),
                (0, 11, 1), (2, 12, 1), (6, 13, 1),
            }),

        // Benzene ring with the carboxylic acid and the acetyl ester on neighbouring (ortho) carbons.
        Make("Aspirin", "C9H8O4",
            new[]
            {
                ("C", 150.0, 135.0), ("C", 184.6, 155.0), ("C", 184.6, 195.0),
                ("C", 150.0, 215.0), ("C", 115.4, 195.0), ("C", 115.4, 155.0),
                ("C", 150.0, 93.0), ("O", 113.6, 72.0), ("O", 186.4, 72.0),
                ("O", 221.0, 134.0), ("C", 257.4, 155.0), ("O", 257.4, 197.0), ("C", 293.8, 134.0),
            },
            new[]
            {
                (0, 1, 2), (1, 2, 1), (2, 3, 2), (3, 4, 1), (4, 5, 2), (5, 0, 1),
                (0, 6, 1), (6, 7, 2), (6, 8, 1),
                (1, 9, 1), (9, 10, 1), (10, 11, 2), (10, 12, 1),
            }),
    };

    public static LibraryMolecule Get(string name) => All.First(m => m.Name == name);

    public static Recognition Recognise(MoleculeGraph graph)
    {
        if (graph.Atoms.Count == 0) return Recognition.Nothing;
        var composition = graph.Composition();
        var candidates = All.Where(m => MoleculeGraph.SameComposition(composition, m.Graph.Composition())).ToList();
        if (candidates.Count == 0) return Recognition.Nothing;
        if (!graph.IsComplete || graph.ComponentCount() > 1) return new(MatchKind.SameAtoms, candidates[0]);

        foreach (var m in candidates)
            if (graph.IsIsomorphicTo(m.Graph)) return new(MatchKind.Exact, m);
        foreach (var m in candidates)
            if (graph.IsIsomorphicTo(m.Graph, compareOrders: false)) return new(MatchKind.Resonance, m);
        return new(MatchKind.Isomer, candidates[0]);
    }

    private static LibraryMolecule Make(string name, string formula, (string El, double X, double Y)[] atoms,
        (int A, int B, int Order)[] bonds, string? note = null)
    {
        var g = new MoleculeGraph();
        foreach (var (el, x, y) in atoms)
        {
            var error = g.AddAtom(el, x, y);
            if (error != null) throw new InvalidOperationException($"{name}: {el} at ({x}, {y}): {error}");
        }
        foreach (var (a, b, order) in bonds)
        {
            var error = g.SetBond(a, b, order);
            if (error != null) throw new InvalidOperationException($"{name}: bond {a}-{b}: {error}");
        }
        var unplaced = g.FillHydrogens();
        if (unplaced > 0) throw new InvalidOperationException($"{name}: no room for {unplaced} hydrogen(s)");
        return new LibraryMolecule(name, formula, g, note);
    }
}
