using MathVoyager.Models;

namespace MathVoyager.Services;

public class ReviewService : IReviewService
{
    private readonly IProgressService _progress;

    // A card answered right first time gets one confirming review and then leaves the queue;
    // cards that were ever missed stay until their interval is this long.
    public const double RetireIntervalDays = 120;
    public const int MaxQueue = 800;

    public ReviewService(IProgressService progress)
    {
        _progress = progress;
    }

    private static ReviewCard? Find(UserProfile profile, string questionId, string? conceptId) =>
        (conceptId != null ? profile.ReviewQueue.FirstOrDefault(r => r.ConceptId == conceptId) : null)
        ?? profile.ReviewQueue.FirstOrDefault(r => r.QuestionId == questionId);

    public async Task AddToReviewAsync(string questionId, string topicId, string lessonId, bool wasCorrect, string? conceptId = null)
    {
        var profile = await _progress.GetProfileAsync();
        var existing = Find(profile, questionId, conceptId);

        if (existing != null)
        {
            existing.ConceptId ??= conceptId;
            existing.QuestionId = questionId;
            await UpdateCardAsync(questionId, wasCorrect, conceptId);
            return;
        }

        profile.ReviewQueue.Add(new ReviewCard
        {
            QuestionId = questionId,
            ConceptId = conceptId,
            TopicId = topicId,
            LessonId = lessonId,
            NextReview = wasCorrect
                ? DateTime.Now.AddDays(3).ToString("yyyy-MM-dd")
                : DateTime.Now.ToString("yyyy-MM-dd"), // review immediately if wrong
            Interval = wasCorrect ? 3 : 0.5,
            EaseFactor = 2.5,
            Repetitions = wasCorrect ? 1 : 0,
            Lapses = wasCorrect ? 0 : 1
        });

        EnforceCap(profile);
        await _progress.SaveProfileAsync(profile);
    }

    public async Task UpdateCardAsync(string questionId, bool correct, string? conceptId = null)
    {
        var profile = await _progress.GetProfileAsync();
        var card = Find(profile, questionId, conceptId);
        if (card == null) return;

        // A correct answer before the card is due (e.g. a second question on the same concept in
        // one quiz) is not a spaced recall, so it does not advance the schedule.
        if (correct && string.Compare(card.NextReview, DateTime.Now.ToString("yyyy-MM-dd"), StringComparison.Ordinal) > 0)
            return;

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

            if ((card.Lapses == 0 && card.Repetitions >= 2) || card.Interval >= RetireIntervalDays)
            {
                profile.ReviewQueue.Remove(card);
                await _progress.SaveProfileAsync(profile);
                return;
            }
        }
        else
        {
            card.Repetitions = 0;
            card.Lapses++;
            card.Interval = 0.5; // review again soon
            card.EaseFactor = Math.Max(1.3, card.EaseFactor - 0.2);
        }

        card.NextReview = DateTime.Now.AddDays(card.Interval).ToString("yyyy-MM-dd");
        await _progress.SaveProfileAsync(profile);
    }

    // Drops the most mature cards first; the ones still being learned are what the queue is for.
    private static void EnforceCap(UserProfile profile)
    {
        var excess = profile.ReviewQueue.Count - MaxQueue;
        if (excess <= 0) return;
        foreach (var c in profile.ReviewQueue.OrderByDescending(c => c.Interval).ThenBy(c => c.Lapses).Take(excess).ToList())
            profile.ReviewQueue.Remove(c);
    }

    public async Task<List<ReviewCard>> GetDueCardsAsync(int limit = 10)
    {
        var profile = await _progress.GetProfileAsync();
        var today = DateTime.Now.ToString("yyyy-MM-dd");

        var due = profile.ReviewQueue
            .Where(r => string.Compare(r.NextReview, today, StringComparison.Ordinal) <= 0)
            .OrderBy(r => r.NextReview)
            .ThenBy(r => r.EaseFactor) // hardest first
            .Take(limit)
            .ToList();
        return Interleave(due);
    }

    // Round-robin across topics so consecutive cards come from different topics where possible,
    // keeping each topic's own priority order.
    public static List<ReviewCard> Interleave(List<ReviewCard> cards)
    {
        var groups = cards.GroupBy(c => c.TopicId).Select(g => new Queue<ReviewCard>(g)).ToList();
        var result = new List<ReviewCard>(cards.Count);
        while (result.Count < cards.Count)
            foreach (var g in groups)
                if (g.Count > 0) result.Add(g.Dequeue());
        return result;
    }

    public async Task<int> GetDueCountAsync()
    {
        var profile = await _progress.GetProfileAsync();
        var today = DateTime.Now.ToString("yyyy-MM-dd");
        return profile.ReviewQueue.Count(r => string.Compare(r.NextReview, today, StringComparison.Ordinal) <= 0);
    }
}
