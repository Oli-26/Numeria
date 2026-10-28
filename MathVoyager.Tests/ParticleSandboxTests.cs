using MathVoyager.Services;

namespace MathVoyager.Tests;

public class ParticleSandboxTests
{
    private static IEnumerable<(Choice Beam, Choice Target, Band Band, Cell Cell)> AllCells() =>
        from b in ParticleSandbox.Beams
        from t in ParticleSandbox.Targets
        from band in ParticleSandbox.Bands
        select (b, t, band, ParticleSandbox.Lookup(b.Id, t.Id, band));

    [Fact]
    public void EveryComboIsEitherAnOutcomeOrDisabledWithAReason()
    {
        foreach (var (b, t, band, cell) in AllCells())
        {
            var label = $"{b.Id}|{t.Id}|{band}";
            Assert.True((cell.Hit == null) != (cell.Reason == null), label);
            if (cell.Reason != null)
            {
                Assert.False(string.IsNullOrWhiteSpace(cell.Reason), label);
                Assert.NotEqual("Not available.", cell.Reason);
            }
        }
    }

    [Fact]
    public void EveryBeamTargetPairHasAnEnabledEnergy()
    {
        foreach (var b in ParticleSandbox.Beams)
        foreach (var t in ParticleSandbox.Targets)
            Assert.Contains(ParticleSandbox.Bands, band => ParticleSandbox.Lookup(b.Id, t.Id, band).Hit != null);
    }

    [Fact]
    public void BeforeMatchesTheChosenBeamAndTarget()
    {
        foreach (var (b, t, _, cell) in AllCells())
        {
            if (cell.Hit == null) continue;
            Assert.Equal(new[] { b.Particle, t.Particle }, cell.Hit.Before);
        }
    }

    [Fact]
    public void EveryOutcomeAndAlternativeConservesChargeLeptonAndBaryonNumber()
    {
        foreach (var c in ParticleSandbox.AllCollisions)
        {
            Assert.Equal(ParticleSandbox.Sum(c.Before), ParticleSandbox.Sum(c.Outcome.After));
            foreach (var r in c.Outcome.Also)
                Assert.True(ParticleSandbox.Sum(r.Before) == ParticleSandbox.Sum(r.After), $"{c.Outcome.Title}: {r.Note}");
        }
    }

    [Fact]
    public void ProductsOnlyNameParticlesThatAreDrawn()
    {
        foreach (var c in ParticleSandbox.AllCollisions)
        {
            Assert.NotEmpty(c.Outcome.Products);
            foreach (var pr in c.Outcome.Products)
                Assert.Contains(pr.P, c.Outcome.After);
            foreach (var p in c.Outcome.After.Distinct())
                Assert.Contains(c.Outcome.Products, pr => pr.P == p);
        }
    }

    [Fact]
    public void TwoBodyFinalStatesAreBackToBack()
    {
        foreach (var c in ParticleSandbox.AllCollisions.Where(c => c.Outcome.Tracks.Count == 2))
        {
            var d = Math.Abs(c.Outcome.Tracks[0].Angle - c.Outcome.Tracks[1].Angle) % 360;
            Assert.True(Math.Abs(d - 180) < 0.01, c.Outcome.Title);
        }
    }

    [Fact]
    public void AllTracksAndLabelsStayInsideTheViewBox()
    {
        foreach (var c in ParticleSandbox.AllCollisions)
        foreach (var tr in c.Outcome.Tracks)
        {
            var sh = ParticleSandboxGeometry.Shape(tr, c.Band);
            foreach (var (x, y) in sh.Points.Append((sh.LabelX, sh.LabelY)))
            {
                Assert.InRange(x, 0, ParticleSandboxGeometry.W);
                Assert.InRange(y, 0, ParticleSandboxGeometry.H);
            }
        }
    }

    [Fact]
    public void NeutralParticlesAreDrawnStraightAndDashed()
    {
        Assert.Equal(TrackStyle.Neutral, Particles.Photon.Style);
        Assert.Equal(TrackStyle.Neutral, Particles.AntiNuE.Style);
        Assert.Equal(TrackStyle.Neutral, Particles.Neutron.Style);
        Assert.Equal(TrackStyle.Charged, Particles.Positron.Style);
        Assert.Equal(TrackStyle.Jet, Particles.Gluon.Style);
        Assert.Equal(TrackStyle.Recoil, Particles.CarbonIon.Style);
    }

    [Fact]
    public void ChargesBendOppositeWaysAndLessAtHigherEnergy()
    {
        double EndY(Particle p, Band b) => ParticleSandboxGeometry.Shape(new Track(p, 0), b).Points[^1].Y;

        Assert.True(EndY(Particles.Positron, Band.MeV) > ParticleSandboxGeometry.Vy);
        Assert.True(EndY(Particles.Electron, Band.MeV) < ParticleSandboxGeometry.Vy);

        var bends = ParticleSandbox.Bands.Select(b => ParticleSandboxGeometry.Vy - EndY(Particles.Electron, b)).ToList();
        for (var i = 1; i < bends.Count; i++)
            Assert.True(bends[i] < bends[i - 1]);
    }

    [Fact]
    public void KeyOutcomesAreThePhysicallyCorrectProcess()
    {
        string Title(string b, string t, Band band) => ParticleSandbox.Lookup(b, t, band).Hit!.Outcome.Title;

        Assert.Contains("Møller", Title("e-", "e-", Band.MeV));
        Assert.Contains("Bhabha", Title("e+", "e-", Band.MeV));
        Assert.Equal(new[] { Particles.Photon, Particles.Photon }, ParticleSandbox.Lookup("e+", "e-", Band.KeV).Hit!.Outcome.After);
        Assert.Contains("Photoelectric", Title("gamma", "atom", Band.KeV));
        Assert.Contains("Compton", Title("gamma", "atom", Band.MeV));
        Assert.Contains("Pair production", Title("gamma", "atom", Band.GeV));
        Assert.Contains("Inverse beta decay", Title("antinu", "p", Band.MeV));
        Assert.Contains("Deep inelastic", Title("e-", "p", Band.GeV));
        Assert.Contains("PETRA", ParticleSandbox.Lookup("e+", "e-", Band.GeV).Hit!.Outcome.Explanation);
        Assert.Contains("one collision in a billion", ParticleSandbox.Lookup("p", "p", Band.TeV).Hit!.Outcome.Explanation);
        Assert.Contains("proposed", Title("e+", "e-", Band.TeV));
        Assert.Null(ParticleSandbox.Lookup("e-", "e-", Band.TeV).Hit);
    }

    [Fact]
    public void ElectronMeetingElectronNeverAnnihilates()
    {
        foreach (var band in ParticleSandbox.Bands)
        {
            var hit = ParticleSandbox.Lookup("e-", "e-", band).Hit;
            if (hit == null) continue;
            Assert.Equal(2, hit.Outcome.After.Count(p => p == Particles.Electron));
        }
    }

    [Fact]
    public void LedgerFormatsThirds()
    {
        Assert.Equal("0", ParticleSandbox.Thirds(0));
        Assert.Equal("+1", ParticleSandbox.Thirds(3));
        Assert.Equal("−2/3", ParticleSandbox.Thirds(-2));
        Assert.Equal("+4/3", ParticleSandbox.Thirds(4));
        Assert.Equal("−1", ParticleSandbox.Signed(-1));
    }

    [Fact]
    public void NoEmDashesInAnyText()
    {
        var texts = new List<string>();
        foreach (var (_, _, _, cell) in AllCells())
        {
            if (cell.Reason != null) texts.Add(cell.Reason);
            if (cell.Hit is not { } c) continue;
            texts.Add(c.Setup);
            texts.Add(c.Outcome.Title);
            texts.Add(c.Outcome.Explanation);
            texts.AddRange(c.Outcome.Products.Select(p => p.Description + p.P.Name));
            texts.AddRange(c.Outcome.Also.Select(r => r.Note));
        }
        Assert.DoesNotContain(texts, s => s.Contains('—'));
    }
}
