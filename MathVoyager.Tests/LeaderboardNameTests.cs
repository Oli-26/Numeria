using MathVoyager.Services;

namespace MathVoyager.Tests;

public class LeaderboardNameTests
{
    [Theory]
    [InlineData("Alice%2Fscore", "Alice2Fscore")]
    [InlineData("../leaderboard", "leaderboard")]
    [InlineData("a.b$c#d[e]f/g\\h", "abcdefgh")]
    [InlineData("x?print=silent&y", "xprintsilenty")]
    [InlineData("Robert'); DROP TABLE--", "Robert_DROP_TABLE--")]
    [InlineData("  Dark Lord  ", "Dark_Lord")]
    [InlineData("Zoë_99", "Zoë_99")]
    [InlineData("%%%", "Anonymous")]
    [InlineData("", "Anonymous")]
    public void SanitizeName_KeepsOnlySafeKeyCharacters(string input, string expected) =>
        Assert.Equal(expected, LeaderboardService.SanitizeName(input));

    [Fact]
    public void SanitizeName_CapsLength() =>
        Assert.Equal(20, LeaderboardService.SanitizeName(new string('a', 50)).Length);
}
