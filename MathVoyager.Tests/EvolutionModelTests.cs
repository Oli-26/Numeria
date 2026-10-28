using MathVoyager.Services;

namespace MathVoyager.Tests;

public class EvolutionModelTests
{
    private static Organism O(double l, double s, double v) => new(new[] { l, s, v }, 0, 0);

    private static EvolutionModel AllSelected(double strength)
    {
        var m = new EvolutionModel { Background = 0.2 };
        foreach (var sel in m.Selection)
        {
            sel.Selected = true;
            sel.Strength = strength;
            sel.Target = 1.0;
        }
        return m;
    }

    [Fact]
    public void StrengthZero_SurvivalIsIndependentOfTraits()
    {
        var m = AllSelected(0);
        foreach (var o in new[] { O(0, 0, 0), O(1, 1, 1), O(0.2, 1, 0), O(0.9, 0.1, 0.5) })
            Assert.Equal(EvolutionModel.BaseSurvival, m.SurvivalProbability(o), 12);
    }

    [Fact]
    public void NeutralTraits_IgnoreStrength()
    {
        var m = new EvolutionModel();
        foreach (var sel in m.Selection) sel.Strength = 0.9;
        Assert.Equal(EvolutionModel.BaseSurvival, m.SurvivalProbability(O(0, 0, 0)), 12);
        Assert.Equal(EvolutionModel.BaseSurvival, m.SurvivalProbability(O(1, 0.5, 1)), 12);
    }

    [Fact]
    public void WorstMismatch_StillSurvivesSometimes()
    {
        var m = AllSelected(5.0);
        double p = m.SurvivalProbability(O(1.0, 0, 0));
        double floor = 1 - EvolutionModel.MaxStrength;
        Assert.True(p > 0);
        Assert.Equal(EvolutionModel.BaseSurvival * (1 - EvolutionModel.MaxStrength * 0.8) * floor * floor, p, 12);
    }

    [Fact]
    public void OneBadTrait_DoesNotZeroTheOthers()
    {
        var m = AllSelected(0.5);
        double good = m.SurvivalProbability(O(0.2, 1, 1));
        double badSpeed = m.SurvivalProbability(O(0.2, 1, 0));
        Assert.Equal(good * 0.5, badSpeed, 12);
    }

    [Fact]
    public void Step_KeepsPopulationAtN_AndTraitsInRange()
    {
        var m = new EvolutionModel { PopulationSize = 50, MutationSd = 0.1 };
        m.Selection[1].Selected = true;
        m.Reset(7);
        for (int g = 0; g < 40; g++)
        {
            m.Step();
            Assert.Equal(50, m.Population.Count);
            Assert.Equal(m.LastCount, m.LastSurvivors + m.Casualties.Count);
            Assert.All(m.Population, o => Assert.All(o.Traits, v => Assert.InRange(v, 0.0, 1.0)));
            Assert.All(m.Population, o =>
            {
                Assert.InRange(o.X, 0.0, EvolutionModel.FieldSize);
                Assert.InRange(o.Y, 0.0, EvolutionModel.FieldSize);
            });
        }
        Assert.Equal(41, m.History.Count);
    }

    [Fact]
    public void Selection_MovesMeanTowardTarget()
    {
        var m = new EvolutionModel { PopulationSize = 150, MutationSd = 0.02 };
        m.StartMean[(int)EvoTrait.Size] = 0.3;
        m.Selection[(int)EvoTrait.Size].Selected = true;
        m.Selection[(int)EvoTrait.Size].Target = 1.0;
        m.Selection[(int)EvoTrait.Size].Strength = 0.6;
        m.Reset(3);
        for (int g = 0; g < 40; g++) m.Step();
        Assert.True(m.Mean(EvoTrait.Size) > 0.6, $"mean size {m.Mean(EvoTrait.Size):F3}");
    }

    [Fact]
    public void Camouflage_TargetsTheBackground()
    {
        var m = new EvolutionModel { PopulationSize = 150, MutationSd = 0.03, Background = 0.15 };
        m.StartMean[(int)EvoTrait.Lightness] = 0.8;
        m.Selection[(int)EvoTrait.Lightness].Selected = true;
        m.Selection[(int)EvoTrait.Lightness].Strength = 0.7;
        m.Reset(11);
        for (int g = 0; g < 60; g++) m.Step();
        Assert.True(m.Mean(EvoTrait.Lightness) < 0.4, $"mean lightness {m.Mean(EvoTrait.Lightness):F3}");
    }

    [Fact]
    public void NoMutation_OffspringCopySurvivors()
    {
        var m = new EvolutionModel { PopulationSize = 30, MutationSd = 0 };
        m.Selection[2].Selected = true;
        m.Reset(5);
        var before = m.Population.ToList();
        m.Step();
        var survivors = before.Except(m.Casualties).Select(o => string.Join(",", o.Traits)).ToHashSet();
        Assert.All(m.Population, o => Assert.Contains(string.Join(",", o.Traits), survivors));
    }

    [Fact]
    public void SameSeed_ReproducesRun_DifferentSeedsDrift()
    {
        double FinalMean(int seed)
        {
            var m = new EvolutionModel { PopulationSize = 20, MutationSd = 0.01 };
            m.Reset(seed);
            for (int g = 0; g < 60; g++) m.Step();
            return m.Mean(EvoTrait.Lightness);
        }

        Assert.Equal(FinalMean(42), FinalMean(42));
        var finals = Enumerable.Range(1, 8).Select(FinalMean).ToList();
        Assert.True(finals.Max() - finals.Min() > 0.1, string.Join(" ", finals.Select(v => v.ToString("F3"))));
    }

    [Fact]
    public void PopulationSizeChange_AppliesNextGeneration()
    {
        var m = new EvolutionModel { PopulationSize = 40 };
        m.Reset(9);
        m.PopulationSize = 120;
        Assert.Equal(40, m.Population.Count);
        m.Step();
        Assert.Equal(120, m.Population.Count);
        m.PopulationSize = 5000;
        Assert.Equal(EvolutionModel.MaxPopulation, m.PopulationSize);
    }
}
