using MathVoyager.Services;

namespace MathVoyager.Tests;

public class PhaseModelTests
{
    private const double Atm = PhaseSubstance.Atm;

    private static PhaseSubstance Sub(string name) => name switch
    {
        "water" => PhaseModel.Water,
        "co2" => PhaseModel.CarbonDioxide,
        "he" => PhaseModel.Helium,
        "fe" => PhaseModel.Iron,
        _ => throw new ArgumentException(name),
    };

    [Theory]
    [InlineData("water", 260, Atm, PhaseKind.Solid)]
    [InlineData("water", 300, Atm, PhaseKind.Liquid)]
    [InlineData("water", 380, Atm, PhaseKind.Gas)]
    [InlineData("water", 700, 3e7, PhaseKind.Supercritical)]
    [InlineData("water", 700, 1e6, PhaseKind.Gas)]
    [InlineData("water", 600, 3e7, PhaseKind.Liquid)]
    [InlineData("water", 272, 1e8, PhaseKind.Liquid)]
    [InlineData("water", 250, 100, PhaseKind.Solid)]
    [InlineData("water", 250, 50, PhaseKind.Gas)]
    [InlineData("co2", 180, Atm, PhaseKind.Solid)]
    [InlineData("co2", 200, Atm, PhaseKind.Gas)]
    // Vapour pressure of CO2 at 250 K is about 1.8 MPa, so 1 MPa is still gas there.
    [InlineData("co2", 250, 1e6, PhaseKind.Gas)]
    [InlineData("co2", 250, 3e6, PhaseKind.Liquid)]
    [InlineData("co2", 330, 1e7, PhaseKind.Supercritical)]
    [InlineData("he", 2.0, Atm, PhaseKind.HeliumII)]
    [InlineData("he", 3.0, Atm, PhaseKind.HeliumI)]
    [InlineData("he", 5.0, Atm, PhaseKind.Gas)]
    [InlineData("he", 1.0, 5e6, PhaseKind.Solid)]
    [InlineData("he", 1.0, 1e3, PhaseKind.HeliumII)]
    [InlineData("he", 6.0, 2e6, PhaseKind.Supercritical)]
    [InlineData("fe", 1500, Atm, PhaseKind.Solid)]
    [InlineData("fe", 2000, Atm, PhaseKind.Liquid)]
    [InlineData("fe", 3500, Atm, PhaseKind.Gas)]
    public void Classify_KnownStates(string name, double t, double p, PhaseKind expected)
    {
        Assert.Equal(expected, Sub(name).Classify(t, p).Kind);
    }

    [Fact]
    public void VapourCurves_PassThroughAnchorsExactly()
    {
        AssertClose(Atm, PhaseModel.Water.VapourPressure(373.124));
        AssertClose(Atm, PhaseModel.Iron.VapourPressure(3134));
        AssertClose(Atm, PhaseModel.CarbonDioxide.VapourPressure(194.686));
        AssertClose(Atm, PhaseModel.Helium.VapourPressure(Helium4.BoilT));
        foreach (var s in PhaseModel.All)
            AssertClose(s.CriticalP, s.VapourPressure(s.CriticalT));
        foreach (var s in new[] { PhaseModel.Water, PhaseModel.CarbonDioxide, PhaseModel.Iron })
        {
            AssertClose(s.TripleP, s.SublimationPressure(s.TripleT));
            AssertClose(s.TripleP, s.LiquidVapourPressure(s.TripleT));
        }
    }

    [Fact]
    public void MeltingLines_WaterLeansLeft_OthersRight()
    {
        Assert.True(PhaseModel.Water.MeltingTemperature(1e7) < PhaseModel.Water.TripleT);
        Assert.True(PhaseModel.CarbonDioxide.MeltingTemperature(1e7) > PhaseModel.CarbonDioxide.TripleT);
        Assert.True(PhaseModel.Iron.MeltingTemperature(1e9) > PhaseModel.Iron.TripleT);
    }

    [Fact]
    public void Helium_NeverSolidAtOneAtmosphere_OnlyWhenSqueezed()
    {
        var he = PhaseModel.Helium;
        for (var t = he.MinT; t <= he.MaxT; t += 0.05)
            Assert.NotEqual(PhaseKind.Solid, he.Classify(t, Atm).Kind);
        Assert.NotEqual(PhaseKind.Solid, he.Classify(0.5, 2.4e6).Kind);
        Assert.Equal(PhaseKind.Solid, he.Classify(0.5, 2.6e6).Kind);
    }

    [Fact]
    public void Ranges_ContainCriticalPointAndDefaults()
    {
        foreach (var s in PhaseModel.All)
        {
            Assert.InRange(s.CriticalT, s.MinT, s.MaxT);
            Assert.InRange(Math.Log10(s.CriticalP), s.MinLogP, s.MaxLogP);
            Assert.InRange(s.DefaultT, s.MinT, s.MaxT);
            Assert.InRange(Math.Log10(s.DefaultP), s.MinLogP, s.MaxLogP);
        }
    }

    [Fact]
    public void RegionLabels_SitInsideTheirRegion()
    {
        foreach (var s in PhaseModel.All)
            foreach (var l in s.Labels)
            {
                Assert.True(s.Classify(l.T, l.P).Kind == l.Kind, $"{s.Name} label '{l.Text}' is not in its region");
                Assert.InRange(l.T, s.MinT, s.MaxT);
                Assert.InRange(Math.Log10(l.P), s.MinLogP, s.MaxLogP);
            }
    }

    [Fact]
    public void DrawnCurves_SeparateDifferentPhases()
    {
        foreach (var s in PhaseModel.All)
            foreach (var c in s.Curves().Where(c => c.Kind != CurveKind.CriticalEdge))
                for (var i = 1; i < c.Points.Count - 1; i++)
                {
                    var (t, p) = c.Points[i];
                    var lp = Math.Log10(p);
                    if (lp < s.MinLogP || lp > s.MaxLogP || t < s.MinT || t > s.MaxT) continue;
                    var above = s.Classify(t, p * 1.01).Kind;
                    var below = s.Classify(t, p * 0.99).Kind;
                    Assert.True(above != below, $"{s.Name} {c.Kind} at {t} K, {p} Pa: {above} on both sides");
                }
    }

    [Theory]
    [InlineData(101325, "101 kPa")]
    [InlineData(999700, "1 MPa")]
    [InlineData(611.657, "612 Pa")]
    [InlineData(0.164, "0.164 Pa")]
    [InlineData(2.2064e7, "22.1 MPa")]
    [InlineData(1e-5, "under 0.001 Pa")]
    public void FormatPressure_UsesSiPrefixes(double p, string expected)
    {
        Assert.Equal(expected, PhaseModel.FormatPressure(p));
    }

    private static void AssertClose(double expected, double actual) =>
        Assert.True(Math.Abs(actual / expected - 1) < 1e-9, $"expected {expected}, got {actual}");
}
