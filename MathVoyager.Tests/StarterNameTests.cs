using MathVoyager.Services;

namespace MathVoyager.Tests;

public class StarterNameTests
{
    [Fact]
    public void LongestCombination_FitsTheLeaderboardKeyUnchanged()
    {
        var longest = $"{StarterName.Adjectives.MaxBy(a => a.Length)} {StarterName.Animals.MaxBy(a => a.Length)} 999";
        Assert.True(longest.Length <= 20, longest);
        Assert.Equal(longest.Replace(' ', '_'), LeaderboardService.SanitizeName(longest));
    }

    [Fact]
    public void Generate_NeverGivesTheNewPlayerDefault()
    {
        var rng = new Random(7);
        var names = Enumerable.Range(0, 500).Select(_ => StarterName.Generate(rng)).ToList();
        Assert.DoesNotContain("Mathematician", names);
        Assert.All(names, n => Assert.Matches(@"^[A-Z][a-z]+ [A-Z][a-z]+ [1-9]\d{1,2}$", n));
        Assert.True(names.Distinct().Count() > 450);
    }
}
