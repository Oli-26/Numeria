namespace MathVoyager.Services;

public class SessionState
{
    public string? ActiveTopicId { get; set; }
    public string? ActiveLessonId { get; set; }
    public int ConceptIndex { get; set; }
    public bool InQuiz { get; set; }
    public QuizSessionState? QuizState { get; set; }
}

public class QuizSessionState
{
    public string? TopicId { get; set; }
    public string? LessonId { get; set; }
    public List<string> QuestionIds { get; set; } = new();
    public int CurrentIndex { get; set; }
    public int CorrectCount { get; set; }
    public int WrongCount { get; set; }
    public List<string> UserAnswers { get; set; } = new();
    public List<bool> Results { get; set; } = new();
}

public interface ISessionStateService
{
    Task SaveLessonStateAsync(string topicId, string lessonId, int conceptIndex, bool inQuiz);
    Task SaveQuizStateAsync(QuizSessionState state);
    Task<SessionState?> LoadSessionStateAsync();
    Task ClearSessionStateAsync();
}
