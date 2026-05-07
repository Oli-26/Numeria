using MathVoyager.Services;

namespace MathVoyager.Tests;

public class GamificationLevelTests
{
    private static GamificationService NewService() => new(null!, null!);

    // Level formula: floor(sqrt(xp/50)) + 1
    // Threshold for level N: (N-1)^2 * 50

    [Theory]
    [InlineData(0, 1)]
    [InlineData(49, 1)]
    [InlineData(50, 2)]      // boundary: 1^2 * 50
    [InlineData(199, 2)]
    [InlineData(200, 3)]     // boundary: 2^2 * 50
    [InlineData(450, 4)]     // 3^2 * 50
    [InlineData(800, 5)]     // 4^2 * 50
    [InlineData(1250, 6)]    // 5^2 * 50
    [InlineData(5000, 11)]
    public void GetLevel_BoundaryValues(int xp, int expected)
    {
        Assert.Equal(expected, NewService().GetLevel(xp));
    }

    [Theory]
    [InlineData(1, 50)]      // 1^2 * 50
    [InlineData(2, 200)]     // 2^2 * 50
    [InlineData(3, 450)]
    [InlineData(10, 5000)]
    public void GetXpForNextLevel(int currentLevel, int expected)
    {
        Assert.Equal(expected, NewService().GetXpForNextLevel(currentLevel));
    }

    [Theory]
    [InlineData(0, 0)]       // level 1, threshold 0
    [InlineData(49, 49)]     // still level 1
    [InlineData(50, 0)]      // just hit level 2, progress = 0
    [InlineData(150, 100)]   // level 2, 150-50
    [InlineData(200, 0)]     // level 3 boundary
    [InlineData(300, 100)]   // level 3, 300-200
    public void GetXpProgressInLevel(int totalXp, int expected)
    {
        Assert.Equal(expected, NewService().GetXpProgressInLevel(totalXp));
    }

    [Theory]
    [InlineData(0, 1.0)]
    [InlineData(1, 1.1)]
    [InlineData(5, 1.5)]
    [InlineData(10, 2.0)]    // cap
    [InlineData(50, 2.0)]    // still capped
    [InlineData(1000, 2.0)]
    public void GetStreakMultiplier_CapsAt2x(int streak, double expected)
    {
        Assert.Equal(expected, NewService().GetStreakMultiplier(streak), 3);
    }

    [Fact]
    public void Level_NeverNegativeOrZero()
    {
        // Sanity: GetLevel always >= 1 even at xp=0
        Assert.Equal(1, NewService().GetLevel(0));
    }

    [Fact]
    public void Progress_PlusXpToNext_EqualsTotalDelta()
    {
        // Invariant: progress-in-level + xp-needed-for-next = level threshold span
        var svc = NewService();
        int xp = 312;
        int level = svc.GetLevel(xp);
        int progress = svc.GetXpProgressInLevel(xp);
        int nextLevelThreshold = svc.GetXpForNextLevel(level);
        int currentLevelThreshold = (level - 1) * (level - 1) * 50;
        Assert.Equal(progress, xp - currentLevelThreshold);
        Assert.Equal(nextLevelThreshold - currentLevelThreshold, level * level * 50 - currentLevelThreshold);
    }
}
