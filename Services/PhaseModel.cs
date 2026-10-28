using System.Globalization;

namespace MathVoyager.Services;

public enum PhaseKind { Solid, Liquid, Gas, Supercritical, HeliumI, HeliumII }

public readonly record struct PhaseResult(PhaseKind Kind, string Why);

// Where to print a region's name on the diagram; T in K, P in Pa.
public readonly record struct PhaseLabel(PhaseKind Kind, string Text, double T, double P);

public readonly record struct PhaseMarker(string Name, double T, double P, bool Major, bool Estimate = false, bool LabelLeft = false, bool LabelBelow = false);

public enum CurveKind { Sublimation, Melting, Vapour, Lambda, CriticalEdge }

public sealed record PhaseCurve(CurveKind Kind, IReadOnlyList<(double T, double P)> Points);

public abstract class PhaseSubstance
{
    public const double Atm = 101325;
    protected const double R = 8.314462618;

    public required string Name { get; init; }
    public required double MinT { get; init; }
    public required double MaxT { get; init; }
    public double TStep { get; init; } = 1;
    public required double MinLogP { get; init; }
    public required double MaxLogP { get; init; }
    public required double DefaultT { get; init; }
    public double DefaultP { get; init; } = Atm;
    public required double CriticalT { get; init; }
    public required double CriticalP { get; init; }
    public bool CriticalIsEstimate { get; init; }
    public required string Note { get; init; }
    public required IReadOnlyList<PhaseLabel> Labels { get; init; }

    public double MaxP => Math.Pow(10, MaxLogP);

    public abstract PhaseResult Classify(double t, double p);

    // Pressure of the gas boundary at temperature t: sublimation below the triple point, boiling above.
    public abstract double VapourPressure(double t);

    public abstract IReadOnlyList<PhaseCurve> Curves();

    public abstract IReadOnlyList<PhaseMarker> Markers();

    protected PhaseResult Supercritical() => new(PhaseKind.Supercritical,
        $"Beyond the critical point ({PhaseModel.FormatTemperature(CriticalT)}, {PhaseModel.FormatPressure(CriticalP)}): liquid and gas merge into one fluid, dense like a liquid but flowing like a gas.");

    protected PhaseResult HotGas() => new(PhaseKind.Gas,
        $"Hotter than the critical temperature ({PhaseModel.FormatTemperature(CriticalT)}), so no pressure can condense a separate liquid. Below {PhaseModel.FormatPressure(CriticalP)} it is an ordinary compressible gas.");

    protected PhaseResult Boiling(double pv) => new(PhaseKind.Gas,
        $"Below the vapour pressure at this temperature ({PhaseModel.FormatPressure(pv)}), so any liquid would boil away: it is a gas.");

    protected IEnumerable<PhaseCurve> CriticalEdges()
    {
        yield return new(CurveKind.CriticalEdge, [(CriticalT, CriticalP), (CriticalT, MaxP)]);
        yield return new(CurveKind.CriticalEdge, [(CriticalT, CriticalP), (MaxT, CriticalP)]);
    }

    // ln P is linear in 1/T between neighbouring anchors (Clausius-Clapeyron with a piecewise-constant latent heat),
    // so the curve passes exactly through every anchor, including the 1 atm boiling point.
    protected static double ClausiusInterpolate((double T, double P)[] anchors, double t)
    {
        var i = 0;
        while (i < anchors.Length - 2 && t > anchors[i + 1].T) i++;
        var (t0, p0) = anchors[i];
        var (t1, p1) = anchors[i + 1];
        var f = (1 / t - 1 / t0) / (1 / t1 - 1 / t0);
        return Math.Exp(Math.Log(p0) + f * (Math.Log(p1) - Math.Log(p0)));
    }

    protected static List<(double T, double P)> SampleT(double t0, double t1, Func<double, double> pOfT, int n = 60)
    {
        var pts = new List<(double, double)>(n + 1);
        for (var i = 0; i <= n; i++)
        {
            var t = t0 + (t1 - t0) * i / n;
            pts.Add((t, pOfT(t)));
        }
        return pts;
    }

    protected static List<(double T, double P)> SampleLogP(double p0, double p1, Func<double, double> tOfP, int n = 40)
    {
        var pts = new List<(double, double)>(n + 1);
        double l0 = Math.Log10(p0), l1 = Math.Log10(p1);
        for (var i = 0; i <= n; i++)
        {
            var p = Math.Pow(10, l0 + (l1 - l0) * i / n);
            pts.Add((tOfP(p), p));
        }
        return pts;
    }
}

// A substance with an ordinary solid-liquid-gas triple point.
public sealed class TriplePointSubstance : PhaseSubstance
{
    public required double TripleT { get; init; }
    public required double TripleP { get; init; }
    public bool TripleIsEstimate { get; init; }
    public double? BoilT { get; init; }
    // Normal sublimation point, for substances whose triple-point pressure is above 1 atm.
    public double? SublimeT { get; init; }
    public double SublimationEnthalpy { get; init; }
    public required double MeltSlope { get; init; }

    private double SublimationSlope => SublimeT is double ts
        ? Math.Log(TripleP / Atm) / (1 / ts - 1 / TripleT)
        : SublimationEnthalpy / R;

    private (double T, double P)[] VapourAnchors => BoilT is double tb
        ? [(TripleT, TripleP), (tb, Atm), (CriticalT, CriticalP)]
        : [(TripleT, TripleP), (CriticalT, CriticalP)];

    public double SublimationPressure(double t) => TripleP * Math.Exp(-SublimationSlope * (1 / t - 1 / TripleT));

    public double LiquidVapourPressure(double t) => ClausiusInterpolate(VapourAnchors, t);

    public override double VapourPressure(double t) => t < TripleT ? SublimationPressure(t) : LiquidVapourPressure(t);

    public double MeltingTemperature(double p) => TripleT + (p - TripleP) / MeltSlope;

    public override PhaseResult Classify(double t, double p)
    {
        if (p >= TripleP)
        {
            var tm = MeltingTemperature(p);
            if (t < tm)
                return new(PhaseKind.Solid, $"Colder than the melting point at this pressure ({PhaseModel.FormatTemperature(tm)}), so it holds a rigid crystal.");
        }
        else if (t < TripleT)
        {
            var ps = SublimationPressure(t);
            return p > ps
                ? new(PhaseKind.Solid, $"Above the solid's vapour pressure ({PhaseModel.FormatPressure(ps)}). Below the triple-point pressure no liquid can exist, so warming it makes it sublime.")
                : new(PhaseKind.Gas, $"Below the solid's vapour pressure here ({PhaseModel.FormatPressure(ps)}), so the solid sublimes into gas.");
        }

        if (t >= CriticalT) return p >= CriticalP ? Supercritical() : HotGas();

        // Only reachable when the melting line leans left, as it does for water.
        if (t < TripleT)
            return new(PhaseKind.Liquid, $"Squeezing has pushed the melting point down to {PhaseModel.FormatTemperature(MeltingTemperature(p))}, so it is liquid below its usual freezing point.");

        var pv = LiquidVapourPressure(t);
        return p > pv
            ? new(PhaseKind.Liquid, $"Warmer than the melting point and above the vapour pressure ({PhaseModel.FormatPressure(pv)}), so it stays condensed but flows.")
            : Boiling(pv);
    }

    public override IReadOnlyList<PhaseCurve> Curves()
    {
        var curves = new List<PhaseCurve>
        {
            new(CurveKind.Sublimation, SampleT(MinT, TripleT, SublimationPressure)),
            new(CurveKind.Melting, SampleLogP(TripleP, MaxP, MeltingTemperature)),
            new(CurveKind.Vapour, SampleT(TripleT, CriticalT, LiquidVapourPressure, 80)),
        };
        curves.AddRange(CriticalEdges());
        return curves;
    }

    public override IReadOnlyList<PhaseMarker> Markers()
    {
        var list = new List<PhaseMarker> { new("Triple point", TripleT, TripleP, true, TripleIsEstimate) };
        if (BoilT is double tb)
        {
            list.Add(new("Melts at 1 atm", MeltingTemperature(Atm), Atm, false));
            list.Add(new("Boils at 1 atm", tb, Atm, false));
        }
        if (SublimeT is double ts) list.Add(new("Sublimes at 1 atm", ts, Atm, false));
        list.Add(new("Critical point", CriticalT, CriticalP, true, CriticalIsEstimate, LabelLeft: true));
        return list;
    }
}

// Helium-4 never has solid, liquid and gas together: it stays liquid down to 0 K under its own vapour
// pressure, and the liquid splits into normal He I and superfluid He II along the lambda line.
public sealed class Helium4 : PhaseSubstance
{
    public const double LambdaT = 2.1768, LambdaP = 5041.8;
    public const double UpperLambdaT = 1.763, UpperLambdaP = 3.013e6;
    public const double BoilT = 4.222;
    public const double MinMeltP = 2.53e6;
    private const double FlatMeltT = 1.0;
    private const double LatentOverR = 7.196;
    // Approximate Simon-type rise of the melting pressure above the upper lambda point.
    private const double SimonA = 1.731e6, SimonC = 1.555;

    // Below the lambda point an ideal vapour over a liquid with a constant latent heat gives P ~ T^2.5 exp(-L/RT);
    // a plain Clausius-Clapeyron line would be several times too low by 1 K.
    public override double VapourPressure(double t) => t < LambdaT
        ? LambdaP * Math.Pow(t / LambdaT, 2.5) * Math.Exp(-LatentOverR * (1 / t - 1 / LambdaT))
        : ClausiusInterpolate([(LambdaT, LambdaP), (BoilT, Atm), (CriticalT, CriticalP)], t);

    public double MeltingPressure(double t)
    {
        if (t <= FlatMeltT) return MinMeltP;
        if (t <= UpperLambdaT) return MinMeltP + (t - FlatMeltT) / (UpperLambdaT - FlatMeltT) * (UpperLambdaP - MinMeltP);
        return UpperLambdaP + SimonA * (Math.Pow(t, SimonC) - Math.Pow(UpperLambdaT, SimonC));
    }

    // Straight line in P between the two lambda points; the real line curves slightly.
    public static double LambdaTemperature(double p) =>
        LambdaT + (p - LambdaP) * (UpperLambdaT - LambdaT) / (UpperLambdaP - LambdaP);

    public override PhaseResult Classify(double t, double p)
    {
        var pm = MeltingPressure(t);
        if (p >= pm)
            return new(PhaseKind.Solid, $"Above the melting pressure at this temperature ({PhaseModel.FormatPressure(pm)}). Helium only freezes when squeezed, never by cooling alone.");
        if (t >= CriticalT) return p >= CriticalP ? Supercritical() : HotGas();

        var pv = VapourPressure(t);
        if (p <= pv) return Boiling(pv);

        var tl = LambdaTemperature(p);
        return t < tl
            ? new(PhaseKind.HeliumII, $"Colder than the lambda line ({PhaseModel.FormatTemperature(tl)} at this pressure): a superfluid that flows with zero viscosity and creeps up container walls.")
            : new(PhaseKind.HeliumI, $"Above the vapour pressure ({PhaseModel.FormatPressure(pv)}) but warmer than the lambda line ({PhaseModel.FormatTemperature(tl)}): an ordinary, if very cold, liquid.");
    }

    public override IReadOnlyList<PhaseCurve> Curves()
    {
        var meltPts = SampleT(MinT, MaxT, MeltingPressure, 80);
        meltPts.RemoveAll(pt => pt.P > MaxP * 1.5);
        var curves = new List<PhaseCurve>
        {
            new(CurveKind.Vapour, SampleT(MinT, CriticalT, VapourPressure, 80)),
            new(CurveKind.Melting, meltPts),
            new(CurveKind.Lambda, SampleLogP(LambdaP, UpperLambdaP, LambdaTemperature)),
        };
        curves.AddRange(CriticalEdges());
        return curves;
    }

    public override IReadOnlyList<PhaseMarker> Markers() =>
    [
        new("Lambda point", LambdaT, LambdaP, true),
        new("Upper lambda point", UpperLambdaT, UpperLambdaP, true, LabelLeft: true, LabelBelow: true),
        new("Boils at 1 atm", BoilT, Atm, false),
        new("Critical point", CriticalT, CriticalP, true, LabelLeft: true),
    ];
}

public static class PhaseModel
{
    public static readonly TriplePointSubstance Water = new()
    {
        Name = "Water",
        MinT = 200, MaxT = 900, MinLogP = -1, MaxLogP = 8, DefaultT = 293,
        TripleT = 273.16, TripleP = 611.657,
        BoilT = 373.124,
        CriticalT = 647.096, CriticalP = 2.2064e7,
        SublimationEnthalpy = 51060,
        // Clausius-Clapeyron for ice Ih: 6.01 kJ/mol over a volume change of -1.63 cm3/mol at 273 K.
        MeltSlope = -1.35e7,
        Note = "The ice line leans left: ice is less dense than liquid water, so squeezing ice can melt it. Only a few other substances do this, such as gallium, bismuth, silicon, germanium and antimony. On this log scale the lean looks slight, under 10 K by 100 MPa. Above about 210 MPa, off the top of this chart, denser forms of ice take over.",
        Labels =
        [
            new(PhaseKind.Solid, "Ice", 229, 3e6),
            new(PhaseKind.Liquid, "Liquid", 390, 3e6),
            new(PhaseKind.Gas, "Vapour", 520, 30),
            new(PhaseKind.Supercritical, "Supercritical", 790, 5e7),
        ],
    };

    public static readonly TriplePointSubstance CarbonDioxide = new()
    {
        Name = "CO₂",
        MinT = 150, MaxT = 350, MinLogP = 2, MaxLogP = 8, DefaultT = 190,
        TripleT = 216.592, TripleP = 517950,
        SublimeT = 194.686,
        CriticalT = 304.128, CriticalP = 7.3773e6,
        MeltSlope = 4.7e6,
        Note = "At 1 atm solid CO₂ never melts: dry ice sublimes straight to gas at 194.7 K (-78.5 °C). Liquid CO₂ only exists above its triple-point pressure of 5.18 bar (518 kPa), which is why it is stored in pressurised cylinders.",
        Labels =
        [
            new(PhaseKind.Solid, "Dry ice", 182, 3e6),
            new(PhaseKind.Liquid, "Liquid", 248, 5e6),
            new(PhaseKind.Gas, "Gas", 270, 1e4),
            new(PhaseKind.Supercritical, "Super-\ncritical", 328, 2.5e7),
        ],
    };

    public static readonly Helium4 Helium = new()
    {
        Name = "Helium-4",
        MinT = 0.5, MaxT = 6.5, TStep = 0.01, MinLogP = 0, MaxLogP = 7, DefaultT = 4.0,
        CriticalT = 5.1953, CriticalP = 227460,
        Note = "Helium-4 has no point where solid, liquid and gas meet. Zero-point motion keeps it liquid down to absolute zero under its own vapour pressure; it only freezes when squeezed above about 25 bar (2.5 MPa). Below the lambda line the liquid becomes He II, a superfluid. The melting curve above 1.8 K is approximate.",
        Labels =
        [
            new(PhaseKind.Solid, "Solid", 1.1, 5.6e6),
            new(PhaseKind.HeliumII, "He II\nsuperfluid", 1.3, 1e4),
            new(PhaseKind.HeliumI, "He I", 3.2, 6e5),
            new(PhaseKind.Gas, "Gas", 4.0, 300),
            new(PhaseKind.Supercritical, "Super-\ncritical", 5.85, 2e6),
        ],
    };

    public static readonly TriplePointSubstance Iron = new()
    {
        Name = "Iron",
        MinT = 300, MaxT = 13000, TStep = 10, MinLogP = -2, MaxLogP = 10, DefaultT = 300,
        TripleT = 1811, TripleP = 3.5, TripleIsEstimate = true,
        BoilT = 3134,
        CriticalT = 9250, CriticalP = 8.75e8, CriticalIsEstimate = true,
        SublimationEnthalpy = 4.1e5,
        // Melting point rises roughly 30 K per GPa near 1 atm.
        MeltSlope = 3.3e7,
        Note = "Solid iron changes crystal form at 1185 K and 1667 K (at 1 atm); this chart lumps those forms together. The critical point is only an estimate: it lies far beyond what experiments can hold steady, and published values differ by more than 1000 K. Earth's inner core stays solid at roughly 5000 to 6000 K because the pressure there is about 330 to 360 GPa, far above the top of this chart.",
        Labels =
        [
            new(PhaseKind.Solid, "Solid", 950, 1e8),
            new(PhaseKind.Liquid, "Liquid", 4200, 3e8),
            new(PhaseKind.Gas, "Gas", 6000, 100),
            new(PhaseKind.Supercritical, "Supercritical", 11125, 3e9),
        ],
    };

    public static IReadOnlyList<PhaseSubstance> All { get; } = [Water, CarbonDioxide, Helium, Iron];

    public static string FormatPressure(double p)
    {
        if (double.IsNaN(p) || p <= 0) return "0 Pa";
        if (p < 1e-3) return "under 0.001 Pa";
        var scale = Math.Pow(10, Math.Floor(Math.Log10(p)) - 2);
        var r = Math.Round(p / scale) * scale;
        string[] units = ["Pa", "kPa", "MPa", "GPa"];
        var i = 0;
        while (i < units.Length - 1 && r >= 1000) { r /= 1000; i++; }
        return r.ToString("G3", CultureInfo.InvariantCulture) + " " + units[i];
    }

    public static string FormatTemperature(double t) =>
        t.ToString(t < 10 ? "0.00#" : t < 1000 ? "0.#" : "0", CultureInfo.InvariantCulture) + " K";
}
