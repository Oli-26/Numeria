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

public interface IGamificationService
{
    int GetLevel(int totalXp);
    int GetXpForNextLevel(int currentLevel);
    int GetXpProgressInLevel(int totalXp);
    double GetStreakMultiplier(int streak);
    Task<GamificationEvent> AwardXpAsync(int amount);
    Task<bool> SpendPointsAsync(int amount);
    Task<List<Achievement>> CheckAchievementsAsync();
}
