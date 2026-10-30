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

    // How many saved answers to keep on resume, which is also the question to resume at. The state is saved as soon
    // as a question is answered but CurrentIndex only moves on Next, so a quiz closed between the two would come back
    // on an answered question; answering it again duplicated the result, and a later restore indexed past the end.
    // Resuming at the first unanswered question (never past the last) keeps one result per question.
    public int AnswersToResume(int questionCount) =>
        Math.Max(0, Math.Min(Math.Min(UserAnswers.Count, Results.Count), questionCount - 1));
}

public interface ISessionStateService
{
    Task SaveLessonStateAsync(string topicId, string lessonId, int conceptIndex, bool inQuiz);
    Task SaveQuizStateAsync(QuizSessionState state);
    Task<SessionState?> LoadSessionStateAsync();
    Task ClearSessionStateAsync();
}
