using MathVoyager.Models;

namespace MathVoyager.Services;

public class ReviewService : IReviewService
{
    private readonly IProgressService _progress;

    public ReviewService(IProgressService progress)
    {
        _progress = progress;
    }

    public async Task AddToReviewAsync(string questionId, string topicId, string lessonId, bool wasCorrect)
    {
        var profile = await _progress.GetProfileAsync();
        var existing = profile.ReviewQueue.FirstOrDefault(r => r.QuestionId == questionId);

        if (existing != null)
        {
            // Already tracked, update will happen via UpdateCardAsync
            return;
        }

        profile.ReviewQueue.Add(new ReviewCard
        {
            QuestionId = questionId,
            TopicId = topicId,
            LessonId = lessonId,
            NextReview = wasCorrect
                ? DateTime.Now.AddDays(3).ToString("yyyy-MM-dd")
                : DateTime.Now.ToString("yyyy-MM-dd"), // review immediately if wrong
            Interval = wasCorrect ? 3 : 0.5,
            EaseFactor = 2.5,
            Repetitions = wasCorrect ? 1 : 0
        });

        await _progress.SaveProfileAsync(profile);
    }

    public async Task UpdateCardAsync(string questionId, bool correct)
    {
        var profile = await _progress.GetProfileAsync();
        var card = profile.ReviewQueue.FirstOrDefault(r => r.QuestionId == questionId);
        if (card == null) return;

        // SM-2 inspired algorithm
        if (correct)
        {
            card.Repetitions++;
            if (card.Repetitions == 1)
                card.Interval = 1;
            else if (card.Repetitions == 2)
                card.Interval = 3;
            else
                card.Interval = card.Interval * card.EaseFactor;

            card.EaseFactor = Math.Max(1.3, card.EaseFactor + 0.1);
        }
        else
        {
            card.Repetitions = 0;
            card.Interval = 0.5; // review again soon
            card.EaseFactor = Math.Max(1.3, card.EaseFactor - 0.2);
        }

        card.NextReview = DateTime.Now.AddDays(card.Interval).ToString("yyyy-MM-dd");
        await _progress.SaveProfileAsync(profile);
    }

    public async Task<List<ReviewCard>> GetDueCardsAsync(int limit = 10)
    {
        var profile = await _progress.GetProfileAsync();
        var today = DateTime.Now.ToString("yyyy-MM-dd");

        return profile.ReviewQueue
            .Where(r => string.Compare(r.NextReview, today, StringComparison.Ordinal) <= 0)
            .OrderBy(r => r.NextReview)
            .ThenBy(r => r.EaseFactor) // hardest first
            .Take(limit)
            .ToList();
    }

    public async Task<int> GetDueCountAsync()
    {
        var profile = await _progress.GetProfileAsync();
        var today = DateTime.Now.ToString("yyyy-MM-dd");
        return profile.ReviewQueue.Count(r => string.Compare(r.NextReview, today, StringComparison.Ordinal) <= 0);
    }
}
