using MathVoyager.Models;

namespace MathVoyager.Services;

public class GamificationEvent
{
    public bool LeveledUp { get; set; }
    public int NewLevel { get; set; }
    public int XpAwarded { get; set; }
    public int PointsAwarded { get; set; }
    public List<Achievement> NewAchievements { get; set; } = new();
}

// XpNeeded is the size of the current level, not the total XP at which the next level starts.
public readonly record struct LevelProgress(int Level, int XpInLevel, int XpNeeded)
{
    public double Percent => XpNeeded > 0 ? (double)XpInLevel / XpNeeded * 100 : 0;
}

public interface IGamificationService
{
    int GetLevel(int totalXp);
    int GetXpForNextLevel(int currentLevel);
    int GetXpProgressInLevel(int totalXp);
    LevelProgress GetLevelProgress(int totalXp);
    double GetStreakMultiplier(int streak);
    Task<GamificationEvent> AwardXpAsync(int amount);
    Task<bool> SpendPointsAsync(int amount);
    Task<List<Achievement>> CheckAchievementsAsync();
}
