using MathVoyager.Models;

namespace MathVoyager.Services;

public interface IReviewService
{
    Task AddToReviewAsync(string questionId, string topicId, string lessonId, bool wasCorrect, string? conceptId = null);
    Task<List<ReviewCard>> GetDueCardsAsync(int limit = 10);
    Task UpdateCardAsync(string questionId, bool correct, string? conceptId = null);
    Task<int> GetDueCountAsync();
}
