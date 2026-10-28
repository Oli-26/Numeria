namespace MathVoyager.Services;

public enum EvoTrait { Lightness, Size, Speed }

public sealed class TraitSelection
{
    public bool Selected { get; set; }
    public double Target { get; set; } = 1.0;
    public double Strength { get; set; } = 0.6;
}

// Trait values live in [0, 1]: lightness 0 = black, 1 = pale; size and speed 0 = smallest/slowest.
public sealed record Organism(double[] Traits, double X, double Y)
{
    public double this[EvoTrait t] => Traits[(int)t];
}

public sealed record GenStats(double[] Mean, double?[] Target);

// Wright-Fisher style: viability selection, then N offspring each copy a survivor drawn with
// replacement, then undirected mutation. Lightness is selected toward the background (camouflage).
public sealed class EvolutionModel
{
    public const int TraitCount = 3;
    public const double BaseSurvival = 0.75;
    public const double MaxStrength = 0.9;
    public const int MinPopulation = 10;
    public const int MaxPopulation = 300;
    public const double FieldSize = 300;
    private const double Margin = 8;
    private const double PositionJitter = 14;

    private Random rng = new(1);
    private int populationSize = 100;

    public TraitSelection[] Selection { get; } =
        Enumerable.Range(0, TraitCount).Select(_ => new TraitSelection()).ToArray();

    public double Background { get; set; } = 0.5;
    public double MutationSd { get; set; } = 0.02;
    public double[] StartMean { get; } = { 0.5, 0.5, 0.5 };
    public double StartSd { get; set; } = 0.15;

    public int PopulationSize
    {
        get => populationSize;
        set => populationSize = Math.Clamp(value, MinPopulation, MaxPopulation);
    }

    public int Seed { get; private set; }
    public int Generation { get; private set; }
    public List<Organism> Population { get; private set; } = new();
    public List<Organism> Casualties { get; private set; } = new();
    public int? LastSurvivors { get; private set; }
    public int LastCount { get; private set; }
    public List<GenStats> History { get; private set; } = new();
    public bool Extinct => Population.Count == 0;

    public void Reset(int seed)
    {
        Seed = seed;
        rng = new Random(seed);
        Generation = 0;
        LastSurvivors = null;
        LastCount = 0;
        Casualties = new List<Organism>();
        Population = Enumerable.Range(0, PopulationSize).Select(_ => new Organism(
            Enumerable.Range(0, TraitCount).Select(i => Reflect(StartMean[i] + StartSd * Gaussian())).ToArray(),
            Margin + rng.NextDouble() * (FieldSize - 2 * Margin),
            Margin + rng.NextDouble() * (FieldSize - 2 * Margin))).ToList();
        History = new List<GenStats> { Stats() };
    }

    public double TargetOf(EvoTrait t) => t == EvoTrait.Lightness ? Background : Selection[(int)t].Target;

    public bool IsSelected(EvoTrait t) => Selection[(int)t].Selected;

    public double SurvivalProbability(Organism o)
    {
        double p = BaseSurvival;
        for (int i = 0; i < TraitCount; i++)
        {
            var sel = Selection[i];
            if (!sel.Selected) continue;
            double s = Math.Clamp(sel.Strength, 0, MaxStrength);
            double mismatch = Math.Clamp(Math.Abs(o.Traits[i] - TargetOf((EvoTrait)i)), 0, 1);
            p *= 1 - s * mismatch;
        }
        return p;
    }

    public void Step()
    {
        if (Extinct) return;

        var survivors = new List<Organism>();
        var casualties = new List<Organism>();
        foreach (var o in Population)
            (rng.NextDouble() < SurvivalProbability(o) ? survivors : casualties).Add(o);

        LastCount = Population.Count;
        LastSurvivors = survivors.Count;
        Casualties = casualties;
        Generation++;

        if (survivors.Count == 0)
        {
            Population = new List<Organism>();
            return;
        }

        var next = new List<Organism>(PopulationSize);
        for (int k = 0; k < PopulationSize; k++)
        {
            var parent = survivors[rng.Next(survivors.Count)];
            var traits = new double[TraitCount];
            for (int i = 0; i < TraitCount; i++)
                traits[i] = MutationSd > 0 ? Reflect(parent.Traits[i] + MutationSd * Gaussian()) : parent.Traits[i];
            next.Add(new Organism(traits,
                ReflectPosition(parent.X + PositionJitter * Gaussian()),
                ReflectPosition(parent.Y + PositionJitter * Gaussian())));
        }
        Population = next;
        History.Add(Stats());
    }

    public double Mean(EvoTrait t) => Population.Count == 0 ? double.NaN : Population.Average(o => o[t]);

    private GenStats Stats() => new(
        Enumerable.Range(0, TraitCount).Select(i => Mean((EvoTrait)i)).ToArray(),
        Enumerable.Range(0, TraitCount).Select(i => IsSelected((EvoTrait)i) ? TargetOf((EvoTrait)i) : (double?)null).ToArray());

    private double Gaussian()
    {
        double u1 = 1.0 - rng.NextDouble();
        double u2 = rng.NextDouble();
        return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2);
    }

    // Reflecting (not clamping) at the edges keeps mutation unbiased instead of piling values on 0 and 1.
    private static double Reflect(double v)
    {
        for (int i = 0; i < 4 && (v < 0 || v > 1); i++)
            v = v < 0 ? -v : 2 - v;
        return Math.Clamp(v, 0, 1);
    }

    private static double ReflectPosition(double v) =>
        Margin + Reflect((v - Margin) / (FieldSize - 2 * Margin)) * (FieldSize - 2 * Margin);
}
