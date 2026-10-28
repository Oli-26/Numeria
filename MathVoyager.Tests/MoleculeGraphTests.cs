using MathVoyager.Services;

namespace MathVoyager.Tests;

public class MoleculeGraphTests
{
    public static IEnumerable<object[]> LibraryNames() => MoleculeLibrary.All.Select(m => new object[] { m.Name });

    [Theory]
    [MemberData(nameof(LibraryNames))]
    public void LibraryMolecule_IsValenceCompleteAndMatchesItsLabel(string name)
    {
        var m = MoleculeLibrary.Get(name);
        var g = m.Graph;

        Assert.True(g.IsComplete, $"{name} has {g.OpenValenceTotal} open valence(s)");
        Assert.Equal(1, g.ComponentCount());
        for (int i = 0; i < g.Atoms.Count; i++)
            Assert.True(g.BondOrderSum(i) <= MoleculeGraph.MaxValence(g.Atoms[i].Element), $"{name}: atom {i} over valence");

        var label = MoleculeGraph.ParseFormula(m.Formula);
        Assert.True(MoleculeGraph.SameComposition(label, g.Composition()), $"{name}: built {g.HillFormula()}, label {m.Formula}");
        Assert.Equal(MoleculeGraph.HillFormula(label), g.HillFormula());
    }

    [Theory]
    [MemberData(nameof(LibraryNames))]
    public void LibraryMolecule_FitsCanvasWithoutStackedAtoms(string name)
    {
        var atoms = MoleculeLibrary.Get(name).Graph.Atoms;
        foreach (var a in atoms)
        {
            Assert.InRange(a.X, MoleculeGraph.Edge, MoleculeGraph.Width - MoleculeGraph.Edge);
            Assert.InRange(a.Y, MoleculeGraph.Edge, MoleculeGraph.Height - MoleculeGraph.Edge);
        }
        for (int i = 0; i < atoms.Count; i++)
            for (int j = i + 1; j < atoms.Count; j++)
                Assert.True(Math.Sqrt(Math.Pow(atoms[i].X - atoms[j].X, 2) + Math.Pow(atoms[i].Y - atoms[j].Y, 2)) >= MoleculeGraph.MinSpacing,
                    $"{name}: atoms {i} and {j} overlap");
    }

    [Theory]
    [MemberData(nameof(LibraryNames))]
    public void LibraryMolecule_RecognisesItself(string name)
    {
        var r = MoleculeLibrary.Recognise(MoleculeLibrary.Get(name).Graph.Clone());
        Assert.Equal(MatchKind.Exact, r.Kind);
        Assert.Equal(name, r.Molecule!.Name);
    }

    [Fact]
    public void Aspirin_HasCarboxylOrthoToEster()
    {
        // Indices follow the library definition: ring carbons 0-5, carboxyl C 6, ester O 9.
        var g = MoleculeLibrary.Get("Aspirin").Graph;
        Assert.True(g.BondBetween(0, 6) >= 0);
        Assert.True(g.BondBetween(1, 9) >= 0);
        Assert.True(g.BondBetween(0, 1) >= 0);
    }

    [Fact]
    public void SetBond_RefusesBondsBeyondValence()
    {
        var g = new MoleculeGraph();
        g.AddAtom("H", 100, 100);
        g.AddAtom("C", 150, 100);
        g.AddAtom("C", 200, 100);

        Assert.Null(g.SetBond(0, 1, 1));
        Assert.Equal("H can form at most 1 bond.", g.SetBond(0, 2, 1));
        Assert.NotNull(g.SetBond(0, 1, 2));
        Assert.Single(g.Bonds);

        Assert.Null(g.SetBond(1, 2, 3));
        Assert.Equal(0, g.OpenValence(1));
        g.AddAtom("H", 150, 140);
        Assert.Equal("C can form at most 4 bonds.", g.SetBond(3, 1, 1));
        Assert.Equal(2, g.Bonds.Count);
    }

    [Fact]
    public void SetBond_ChangingOrderCountsOnlyTheNewOrder()
    {
        var g = new MoleculeGraph();
        g.AddAtom("C", 100, 100);
        g.AddAtom("O", 150, 100);

        Assert.Null(g.SetBond(0, 1, 1));
        Assert.Null(g.SetBond(0, 1, 2));
        Assert.Single(g.Bonds);
        Assert.Equal(2, g.Bonds[0].Order);
        Assert.Equal("O can form at most 2 bonds.", g.SetBond(0, 1, 3));
    }

    [Fact]
    public void Sulfur_CanExpandItsOctet()
    {
        var g = new MoleculeGraph();
        g.AddAtom("S", 200, 150);
        Assert.Equal(2, g.OpenValence(0));
        for (int k = 0; k < 6; k++)
        {
            var angle = k * Math.PI / 3;
            g.AddAtom("F", 200 + 40 * Math.Cos(angle), 150 + 40 * Math.Sin(angle));
            Assert.Null(g.SetBond(0, k + 1, 1));
            if (k == 2) Assert.Equal(1, g.OpenValence(0));
        }
        Assert.True(g.IsComplete);
        Assert.Equal("F6S", g.HillFormula());
    }

    [Fact]
    public void HandBuiltWater_IsRecognised()
    {
        var g = new MoleculeGraph();
        g.AddAtom("O", 200, 150);
        g.AddAtom("H", 170, 175);
        g.AddAtom("H", 230, 175);
        Assert.Equal(MatchKind.SameAtoms, MoleculeLibrary.Recognise(g).Kind);

        g.SetBond(0, 1, 1);
        g.SetBond(0, 2, 1);

        var r = MoleculeLibrary.Recognise(g);
        Assert.Equal(MatchKind.Exact, r.Kind);
        Assert.Equal("Water", r.Molecule!.Name);
        Assert.Equal(2, g.LonePairs(0));
    }

    [Fact]
    public void FillHydrogens_TurnsALoneCarbonIntoMethane()
    {
        var g = new MoleculeGraph();
        g.AddAtom("C", 200, 150);
        Assert.Equal(0, g.FillHydrogens());
        Assert.Equal("Methane", MoleculeLibrary.Recognise(g).Molecule!.Name);
    }

    [Fact]
    public void DimethylEther_IsAnIsomerOfEthanol()
    {
        var g = new MoleculeGraph();
        g.AddAtom("C", 150, 150);
        g.AddAtom("O", 200, 150);
        g.AddAtom("C", 250, 150);
        g.SetBond(0, 1, 1);
        g.SetBond(1, 2, 1);
        Assert.Equal(0, g.FillHydrogens());

        var ethanol = MoleculeLibrary.Get("Ethanol").Graph;
        Assert.Equal("C2H6O", g.HillFormula());
        Assert.True(MoleculeGraph.SameComposition(g.Composition(), ethanol.Composition()));
        Assert.False(g.IsIsomorphicTo(ethanol));
        Assert.False(g.IsIsomorphicTo(ethanol, compareOrders: false));

        var r = MoleculeLibrary.Recognise(g);
        Assert.Equal(MatchKind.Isomer, r.Kind);
        Assert.Equal("Ethanol", r.Molecule!.Name);
    }

    [Fact]
    public void Aspirin_WithShiftedRingDoubleBonds_IsTheSameMoleculeAsAResonanceForm()
    {
        var g = MoleculeLibrary.Get("Aspirin").Graph.Clone();
        var ring = new[] { (0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 0) };
        foreach (var (a, b) in ring) Assert.Null(g.SetBond(a, b, 1));
        foreach (var (a, b) in new[] { (1, 2), (3, 4), (5, 0) }) Assert.Null(g.SetBond(a, b, 2));

        var r = MoleculeLibrary.Recognise(g);
        Assert.Equal(MatchKind.Resonance, r.Kind);
        Assert.Equal("Aspirin", r.Molecule!.Name);
    }

    [Fact]
    public void IncompleteSkeleton_IsNotRecognisedAsTheMolecule()
    {
        // Benzene's ring and hydrogens with only single bonds leaves every carbon one bond short.
        var g = MoleculeLibrary.Get("Benzene").Graph.Clone();
        foreach (var (a, b) in new[] { (0, 1), (2, 3), (4, 5) }) g.SetBond(a, b, 1);

        Assert.False(g.IsComplete);
        Assert.Equal(6, g.OpenValenceTotal);
        Assert.Equal(MatchKind.SameAtoms, MoleculeLibrary.Recognise(g).Kind);
    }

    [Fact]
    public void HillFormula_PutsCarbonFirstOnlyWhenPresent()
    {
        Assert.Equal("H3N", MoleculeLibrary.Get("Ammonia").Graph.HillFormula());
        Assert.Equal("C2H6O", MoleculeLibrary.Get("Ethanol").Graph.HillFormula());
        Assert.Equal("CH4N2O", MoleculeGraph.HillFormula(MoleculeGraph.ParseFormula("CO(NH2)2")));
        Assert.Equal("C2H4O2", MoleculeGraph.HillFormula(MoleculeGraph.ParseFormula("CH3COOH")));
    }

    [Fact]
    public void LonePairs_FollowFromUnbondedElectrons()
    {
        Assert.Equal(1, MoleculeLibrary.Get("Ammonia").Graph.LonePairs(0));
        var co2 = MoleculeLibrary.Get("Carbon dioxide").Graph;
        Assert.Equal(0, co2.LonePairs(0));
        Assert.Equal(2, co2.LonePairs(1));

        var g = new MoleculeGraph();
        g.AddAtom("N", 200, 150);
        Assert.Equal(1, g.LonePairs(0));
        Assert.Equal(3, g.OpenValence(0));
    }

    [Fact]
    public void Atoms_CannotStack()
    {
        var g = new MoleculeGraph();
        Assert.Null(g.AddAtom("C", 100, 100));
        Assert.Null(g.AddAtom("C", 150, 100));
        Assert.NotNull(g.AddAtom("O", 110, 105));
        Assert.False(g.MoveAtom(1, 105, 100));
        Assert.True(g.MoveAtom(1, 160, 120));
        Assert.Equal(2, g.Atoms.Count);
    }

    [Fact]
    public void RemoveAtom_DropsItsBondsAndKeepsOthersConnected()
    {
        var g = MoleculeLibrary.Get("Ethanol").Graph.Clone();
        var bondsBefore = g.Bonds.Count;
        var oxygen = g.Atoms.ToList().FindIndex(a => a.Element == "O");
        var degree = g.Degree(oxygen);

        g.RemoveAtom(oxygen);

        Assert.Equal(bondsBefore - degree, g.Bonds.Count);
        Assert.All(g.Bonds, b => Assert.True(b.A < g.Atoms.Count && b.B < g.Atoms.Count));
        Assert.Equal(2, g.ComponentCount());
    }

    [Fact]
    public void RemoveBond_RemovesOnlyThatBond()
    {
        var g = MoleculeLibrary.Get("Water").Graph.Clone();
        g.RemoveBond(0);
        Assert.Equal(3, g.Atoms.Count);
        Assert.Single(g.Bonds);
        Assert.Equal(1, g.OpenValence(0));
    }

    [Fact]
    public void HitTesting_FindsNearestAtomAndBond()
    {
        var g = new MoleculeGraph();
        g.AddAtom("C", 100, 100);
        g.AddAtom("C", 160, 100);
        g.SetBond(0, 1, 1);

        Assert.Equal(1, g.AtomAt(155, 104, 20));
        Assert.Equal(-1, g.AtomAt(130, 140, 20));
        Assert.Equal(0, g.BondAt(130, 104, 8));
        Assert.Equal(-1, g.BondAt(130, 120, 8));

        // Midway along a short C-H bond the line is nearer than either drawn atom edge.
        var ch = new MoleculeGraph();
        ch.AddAtom("C", 100, 100);
        ch.AddAtom("H", 132, 100);
        ch.SetBond(0, 1, 1);
        Func<string, double> radius = el => el == "H" ? 10 : 14;
        Assert.Equal(0, ch.AtomAt(116, 100, 6, radius));
        Assert.Equal(2, ch.DistanceToAtom(0, 116, 100, radius), 6);
        Assert.Equal(0, ch.DistanceToBond(0, 116, 100), 6);
        Assert.Equal(-1, ch.AtomAt(116, 100, 1, radius));
    }
}
