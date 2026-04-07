namespace MathVoyager.Models;

public class UserProfile
{
    public string DisplayName { get; set; } = "Mathematician";
    public string SelectedAvatar { get; set; } = "default";
    public string SelectedTitle { get; set; } = "";
    public string SelectedTheme { get; set; } = "default";
    public int TotalXp { get; set; }
    public int Points { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public string LastActivityDate { get; set; } = "";
    public List<string> LessonsCompleted { get; set; } = new();
    public List<string> TopicsCompleted { get; set; } = new();
    public List<QuizRecord> QuizHistory { get; set; } = new();
    public List<string> AchievementsUnlocked { get; set; } = new();
    public List<string> ShopPurchases { get; set; } = new();
    public List<string> ConceptsViewed { get; set; } = new();
    public Dictionary<string, int> DailyXpLog { get; set; } = new();

    // Enhanced stats
    public int TotalQuestionsAnswered { get; set; }
    public int TotalCorrectAnswers { get; set; }
    public Dictionary<string, TopicStats> TopicStatistics { get; set; } = new();
    public int TotalStudyMinutes { get; set; }
    public string? LastSessionStart { get; set; }
    public int HintsUsed { get; set; }
    public int XpBoostsActive { get; set; }
    public int XpBoostMultiplier { get; set; } = 1;
    public int StreakFreezeDays { get; set; }
    public List<string> SuggestedTopicIds { get; set; } = new();
    public List<string> ChallengesCompleted { get; set; } = new();

    // Spaced repetition
    public List<ReviewCard> ReviewQueue { get; set; } = new();

    // Daily challenge
    public string? DailyChallengeDate { get; set; }
    public bool DailyChallengeCompleted { get; set; }

    // Completion cards
    public List<CompletionCard> CompletionCards { get; set; } = new();

    // Mastery
    public Dictionary<string, int> TopicMastery { get; set; } = new();
    // 0 = not started, 1 = Apprentice, 2 = Adept, 3 = Master, 4 = Grandmaster

    // Fortune cookies
    public List<string> ViewedCookieDates { get; set; } = new();
}

public class CompletionCard
{
    public string TopicId { get; set; } = "";
    public string EarnedDate { get; set; } = "";
}

public class ReviewCard
{
    public string QuestionId { get; set; } = "";
    public string TopicId { get; set; } = "";
    public string LessonId { get; set; } = "";
    public string NextReview { get; set; } = "";
    public double Interval { get; set; } = 1;
    public double EaseFactor { get; set; } = 2.5;
    public int Repetitions { get; set; }
}

public class TopicStats
{
    public int QuestionsAnswered { get; set; }
    public int CorrectAnswers { get; set; }
    public int QuizzesTaken { get; set; }
    public int BestScore { get; set; }
    public int TotalXpEarned { get; set; }
}

public class QuizRecord
{
    public string QuizId { get; set; } = "";
    public string? TopicId { get; set; }
    public int Score { get; set; }
    public int QuestionsCount { get; set; }
    public int CorrectCount { get; set; }
    public string Date { get; set; } = "";
    public int XpEarned { get; set; }
}
