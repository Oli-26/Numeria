using MathVoyager.Models;

namespace MathVoyager.Services;

public class QuizResult
{
    public Question Question { get; set; } = null!;
    public string UserAnswer { get; set; } = "";
    public bool IsCorrect { get; set; }
    public int XpEarned { get; set; }
}

public interface IQuizEngine
{
    Task<List<Question>> GenerateQuizAsync(string topicId, string? lessonId = null, int count = 5);
    Task<List<Question>> GenerateMixedQuizAsync(IEnumerable<string>? completedTopicIds = null, int count = 5);
    Task<List<Question>> GenerateLearnedQuizAsync(
        IEnumerable<string>? completedLessonIds,
        IEnumerable<string>? completedTopicIds,
        IEnumerable<string>? engagedTopicIds,
        int count = 5);
    QuizResult ValidateAnswer(Question question, string userAnswer);
    int CalculateQuizXp(List<QuizResult> results, int streak);
}
