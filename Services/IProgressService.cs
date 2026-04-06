using MathVoyager.Models;

namespace MathVoyager.Services;

public interface IProgressService
{
    Task<UserProfile> GetProfileAsync();
    Task SaveProfileAsync(UserProfile profile);
    Task MarkConceptViewedAsync(string conceptId);
    Task MarkLessonCompletedAsync(string lessonId);
    Task RecordQuizResultAsync(string quizId, string? topicId, int score, int correctCount, int totalCount, int xpEarned);
    Task RecordQuestionAnsweredAsync(string? topicId, bool correct);
    Task<double> GetTopicProgressAsync(string topicId);
    Task UpdateStreakAsync();
    Task StartSessionAsync();
    Task TickSessionTimeAsync();
    Task ResetProgressAsync();
}
