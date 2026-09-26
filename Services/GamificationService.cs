using MathVoyager.Data;
using MathVoyager.Models;

namespace MathVoyager.Services;

public class GamificationService : IGamificationService
{
    private readonly IProgressService _progress;
    private readonly IAchievementRepository _achievementRepo;

    public GamificationService(IProgressService progress, IAchievementRepository achievementRepo)
    {
        _progress = progress;
        _achievementRepo = achievementRepo;
    }

    public int GetLevel(int totalXp)
    {
        return (int)Math.Floor(Math.Sqrt(totalXp / 50.0)) + 1;
    }

    public int GetXpForNextLevel(int currentLevel)
    {
        return currentLevel * currentLevel * 50;
    }

    public int GetXpProgressInLevel(int totalXp)
    {
        var level = GetLevel(totalXp);
        var xpForCurrentLevel = (level - 1) * (level - 1) * 50;
        return totalXp - xpForCurrentLevel;
    }

    public double GetStreakMultiplier(int streak)
    {
        return 1.0 + Math.Min(streak * 0.1, 1.0);
    }

    public async Task<GamificationEvent> AwardXpAsync(int amount)
    {
        var profile = await _progress.GetProfileAsync();
        var oldLevel = GetLevel(profile.TotalXp);

        profile.TotalXp += amount;
        profile.Points += amount;

        var today = DateTime.Now.ToString("yyyy-MM-dd");
        if (profile.DailyXpLog.ContainsKey(today))
            profile.DailyXpLog[today] += amount;
        else
            profile.DailyXpLog[today] = amount;

        // Prune entries older than 90 days
        var cutoff = DateTime.Now.AddDays(-90).ToString("yyyy-MM-dd");
        var staleKeys = profile.DailyXpLog.Keys.Where(k => string.Compare(k, cutoff, StringComparison.Ordinal) < 0).ToList();
        foreach (var key in staleKeys)
            profile.DailyXpLog.Remove(key);

        var newLevel = GetLevel(profile.TotalXp);
        if (newLevel > oldLevel)
        {
            var levelBonus = newLevel * 25;
            profile.Points += levelBonus;
        }

        await _progress.SaveProfileAsync(profile);

        var newAchievements = await CheckAchievementsAsync();

        return new GamificationEvent
        {
            XpAwarded = amount,
            PointsAwarded = amount,
            LeveledUp = newLevel > oldLevel,
            NewLevel = newLevel,
            NewAchievements = newAchievements
        };
    }

    public async Task<bool> SpendPointsAsync(int amount)
    {
        var profile = await _progress.GetProfileAsync();
        if (profile.Points < amount) return false;
        profile.Points -= amount;
        await _progress.SaveProfileAsync(profile);
        return true;
    }

    public async Task<List<Achievement>> CheckAchievementsAsync()
    {
        var profile = await _progress.GetProfileAsync();
        var allAchievements = await _achievementRepo.GetAchievementsAsync();
        var newlyUnlocked = new List<Achievement>();

        foreach (var achievement in allAchievements)
        {
            if (profile.AchievementsUnlocked.Contains(achievement.Id)) continue;

            if (IsAchievementEarned(achievement, profile))
            {
                profile.AchievementsUnlocked.Add(achievement.Id);
                profile.TotalXp += achievement.XpReward;
                profile.Points += achievement.XpReward;
                newlyUnlocked.Add(achievement);
            }
        }

        if (newlyUnlocked.Count > 0)
            await _progress.SaveProfileAsync(profile);

        return newlyUnlocked;
    }

    private static bool IsAchievementEarned(Achievement achievement, UserProfile profile)
    {
        var c = achievement.Condition;
        return c.Type switch
        {
            "lessons-completed" => profile.LessonsCompleted.Count >= (c.Count ?? 0),
            "perfect-quiz" => profile.PerfectQuizCount >= (c.Count ?? 0),
            "streak" => profile.CurrentStreak >= (c.Days ?? 0),
            "longest-streak" => profile.LongestStreak >= (c.Days ?? 0),
            "topic-completed" => profile.TopicsCompleted.Contains(c.TopicId ?? ""),
            "total-xp" => profile.TotalXp >= (c.Threshold ?? 0),
            "shop-purchases" => profile.ShopPurchases.Count(p => p != "theme-dark") >= (c.Count ?? 0),
            _ => false
        };
    }
}
