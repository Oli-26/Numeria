using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class ReviewServiceTests
{
    [Fact]
    public async Task AddToReview_Correct_SchedulesIn3Days()
    {
        var stub = new InMemoryProgress();
        var svc = new ReviewService(stub);

        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: true);
        var card = stub.Profile.ReviewQueue.Single();

        Assert.Equal(3, card.Interval);
        Assert.Equal(1, card.Repetitions);
        Assert.Equal(2.5, card.EaseFactor);
        Assert.Equal(DateTime.Now.AddDays(3).ToString("yyyy-MM-dd"), card.NextReview);
    }

    [Fact]
    public async Task AddToReview_Incorrect_SchedulesToday()
    {
        var stub = new InMemoryProgress();
        var svc = new ReviewService(stub);

        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: false);
        var card = stub.Profile.ReviewQueue.Single();

        Assert.Equal(0.5, card.Interval);
        Assert.Equal(0, card.Repetitions);
        Assert.Equal(DateTime.Now.ToString("yyyy-MM-dd"), card.NextReview);
    }

    [Fact]
    public async Task AddToReview_Duplicate_DoesNotAddAgain()
    {
        var stub = new InMemoryProgress();
        var svc = new ReviewService(stub);

        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: true);
        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: false);

        Assert.Single(stub.Profile.ReviewQueue);
    }

    [Fact]
    public async Task AddToReview_AlreadyTracked_UpdatesCardInstead()
    {
        var stub = new InMemoryProgress();
        var svc = new ReviewService(stub);

        // First answer: correct -> repetitions 1, interval 3, ease 2.5
        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: true);
        // Second answer on the same question: wrong -> should reschedule via UpdateCardAsync,
        // not be silently dropped.
        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: false);

        var card = stub.Profile.ReviewQueue.Single();
        Assert.Equal(0, card.Repetitions);
        Assert.Equal(0.5, card.Interval);
        Assert.Equal(2.3, card.EaseFactor, 3);
    }

    [Fact]
    public async Task UpdateCard_Correct_FirstRep_IntervalOne()
    {
        var stub = WithCard(repetitions: 0, interval: 0.5, ease: 2.5);
        var svc = new ReviewService(stub);

        await svc.UpdateCardAsync("q1", correct: true);
        var card = stub.Profile.ReviewQueue.Single();

        Assert.Equal(1, card.Repetitions);
        Assert.Equal(1, card.Interval);
        Assert.Equal(2.6, card.EaseFactor, 3);
    }

    [Fact]
    public async Task UpdateCard_Correct_SecondRep_IntervalThree()
    {
        var stub = WithCard(repetitions: 1, interval: 1, ease: 2.5);
        var svc = new ReviewService(stub);

        await svc.UpdateCardAsync("q1", correct: true);
        var card = stub.Profile.ReviewQueue.Single();

        Assert.Equal(2, card.Repetitions);
        Assert.Equal(3, card.Interval);
    }

    [Fact]
    public async Task UpdateCard_Correct_ThirdPlusRep_MultipliesByEase()
    {
        var stub = WithCard(repetitions: 2, interval: 3, ease: 2.5);
        var svc = new ReviewService(stub);

        await svc.UpdateCardAsync("q1", correct: true);
        var card = stub.Profile.ReviewQueue.Single();

        Assert.Equal(3, card.Repetitions);
        Assert.Equal(7.5, card.Interval, 3); // 3 * 2.5
        Assert.Equal(2.6, card.EaseFactor, 3);
    }

    [Fact]
    public async Task UpdateCard_Incorrect_ResetsRepsAndShortInterval()
    {
        var stub = WithCard(repetitions: 5, interval: 30, ease: 2.5);
        var svc = new ReviewService(stub);

        await svc.UpdateCardAsync("q1", correct: false);
        var card = stub.Profile.ReviewQueue.Single();

        Assert.Equal(0, card.Repetitions);
        Assert.Equal(0.5, card.Interval);
        Assert.Equal(2.3, card.EaseFactor, 3);
    }

    [Fact]
    public async Task UpdateCard_EaseFactor_FlooredAt1_3()
    {
        var stub = WithCard(repetitions: 1, interval: 1, ease: 1.4);
        var svc = new ReviewService(stub);

        await svc.UpdateCardAsync("q1", correct: false);
        Assert.Equal(1.3, stub.Profile.ReviewQueue.Single().EaseFactor, 3);

        // Another wrong won't drop below 1.3
        await svc.UpdateCardAsync("q1", correct: false);
        Assert.Equal(1.3, stub.Profile.ReviewQueue.Single().EaseFactor, 3);
    }

    [Fact]
    public async Task UpdateCard_MissingCard_NoOp()
    {
        var stub = new InMemoryProgress();
        var svc = new ReviewService(stub);

        await svc.UpdateCardAsync("nonexistent", correct: true);
        Assert.Empty(stub.Profile.ReviewQueue);
    }

    [Fact]
    public async Task GetDueCards_FiltersFutureAndOrdersByDate()
    {
        var stub = new InMemoryProgress();
        var today = DateTime.Now.ToString("yyyy-MM-dd");
        var yesterday = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd");
        var tomorrow = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd");

        stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = "due-today", NextReview = today, EaseFactor = 2.5 });
        stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = "overdue", NextReview = yesterday, EaseFactor = 2.5 });
        stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = "future", NextReview = tomorrow, EaseFactor = 2.5 });

        var due = await new ReviewService(stub).GetDueCardsAsync();

        Assert.Equal(2, due.Count);
        Assert.Equal("overdue", due[0].QuestionId);   // earliest first
        Assert.Equal("due-today", due[1].QuestionId);
        Assert.DoesNotContain(due, c => c.QuestionId == "future");
    }

    [Fact]
    public async Task GetDueCards_WithinSameDate_OrdersByEaseFactorAsc()
    {
        var stub = new InMemoryProgress();
        var today = DateTime.Now.ToString("yyyy-MM-dd");

        stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = "easy", NextReview = today, EaseFactor = 2.8 });
        stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = "hard", NextReview = today, EaseFactor = 1.4 });
        stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = "mid", NextReview = today, EaseFactor = 2.2 });

        var due = await new ReviewService(stub).GetDueCardsAsync();

        Assert.Equal("hard", due[0].QuestionId);
        Assert.Equal("mid", due[1].QuestionId);
        Assert.Equal("easy", due[2].QuestionId);
    }

    [Fact]
    public async Task GetDueCards_RespectsLimit()
    {
        var stub = new InMemoryProgress();
        var today = DateTime.Now.ToString("yyyy-MM-dd");
        for (int i = 0; i < 20; i++)
            stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = $"q{i}", NextReview = today, EaseFactor = 2.5 });

        var due = await new ReviewService(stub).GetDueCardsAsync(limit: 5);
        Assert.Equal(5, due.Count);
    }

    [Fact]
    public async Task GetDueCount_MatchesGetDueCardsLength()
    {
        var stub = new InMemoryProgress();
        var today = DateTime.Now.ToString("yyyy-MM-dd");
        var tomorrow = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd");

        stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = "a", NextReview = today });
        stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = "b", NextReview = today });
        stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = "c", NextReview = tomorrow });

        var svc = new ReviewService(stub);
        Assert.Equal(2, await svc.GetDueCountAsync());
    }

    [Fact]
    public async Task ConceptCard_SecondQuestionOnSameConcept_UpdatesSameCard()
    {
        var stub = new InMemoryProgress();
        var svc = new ReviewService(stub);

        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: false, conceptId: "c1");
        await svc.AddToReviewAsync("q2", "alg", "lesson1", wasCorrect: false, conceptId: "c1");

        var card = stub.Profile.ReviewQueue.Single();
        Assert.Equal("c1", card.ConceptId);
        Assert.Equal("q2", card.QuestionId);
        Assert.Equal(2, card.Lapses);
    }

    [Fact]
    public async Task LegacyCard_WithoutConcept_IsUpgradedWhenAnsweredAgain()
    {
        var stub = WithCard(repetitions: 0, interval: 0.5, ease: 2.5);
        var svc = new ReviewService(stub);

        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: false, conceptId: "c9");

        var card = stub.Profile.ReviewQueue.Single();
        Assert.Equal("c9", card.ConceptId);
    }

    [Fact]
    public async Task CorrectFirstTime_GraduatesAfterOneConfirmingReview()
    {
        var stub = new InMemoryProgress();
        var svc = new ReviewService(stub);
        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: true, conceptId: "c1");

        // Simulate the card falling due, then being recalled.
        stub.Profile.ReviewQueue.Single().NextReview = DateTime.Now.ToString("yyyy-MM-dd");
        await svc.UpdateCardAsync("q1", correct: true, conceptId: "c1");

        Assert.Empty(stub.Profile.ReviewQueue);
    }

    [Fact]
    public async Task CorrectAnswer_BeforeDue_DoesNotAdvanceSchedule()
    {
        var stub = new InMemoryProgress();
        var svc = new ReviewService(stub);
        await svc.AddToReviewAsync("q1", "alg", "lesson1", wasCorrect: true, conceptId: "c1");
        await svc.AddToReviewAsync("q2", "alg", "lesson1", wasCorrect: true, conceptId: "c1");

        var card = stub.Profile.ReviewQueue.Single();
        Assert.Equal(1, card.Repetitions);
        Assert.Equal(3, card.Interval);
    }

    [Fact]
    public async Task LongInterval_RetiresCard()
    {
        var stub = WithCard(repetitions: 5, interval: 60, ease: 2.5);
        var svc = new ReviewService(stub);

        await svc.UpdateCardAsync("q1", correct: true);

        Assert.Empty(stub.Profile.ReviewQueue);
    }

    [Fact]
    public async Task Queue_IsCapped_DroppingMostMatureCards()
    {
        var stub = new InMemoryProgress();
        for (int i = 0; i < ReviewService.MaxQueue; i++)
            stub.Profile.ReviewQueue.Add(new ReviewCard { QuestionId = $"old{i}", Interval = i == 0 ? 90 : 1, NextReview = "2999-01-01" });
        var svc = new ReviewService(stub);

        await svc.AddToReviewAsync("new", "alg", "lesson1", wasCorrect: false);

        Assert.Equal(ReviewService.MaxQueue, stub.Profile.ReviewQueue.Count);
        Assert.DoesNotContain(stub.Profile.ReviewQueue, c => c.QuestionId == "old0");
        Assert.Contains(stub.Profile.ReviewQueue, c => c.QuestionId == "new");
    }

    [Fact]
    public void Interleave_AlternatesTopicsAndKeepsPriorityWithinTopic()
    {
        var cards = new List<ReviewCard>
        {
            new() { QuestionId = "a1", TopicId = "a" },
            new() { QuestionId = "a2", TopicId = "a" },
            new() { QuestionId = "a3", TopicId = "a" },
            new() { QuestionId = "b1", TopicId = "b" },
            new() { QuestionId = "c1", TopicId = "c" },
        };

        var order = ReviewService.Interleave(cards).Select(c => c.QuestionId).ToArray();

        Assert.Equal(new[] { "a1", "b1", "c1", "a2", "a3" }, order);
    }

    private static InMemoryProgress WithCard(int repetitions, double interval, double ease)
    {
        var stub = new InMemoryProgress();
        stub.Profile.ReviewQueue.Add(new ReviewCard
        {
            QuestionId = "q1",
            TopicId = "alg",
            LessonId = "lesson1",
            NextReview = DateTime.Now.ToString("yyyy-MM-dd"),
            Interval = interval,
            EaseFactor = ease,
            Repetitions = repetitions,
            // A card that has been missed before, so it follows the full schedule instead of graduating.
            Lapses = 1
        });
        return stub;
    }

    private sealed class InMemoryProgress : IProgressService
    {
        public UserProfile Profile { get; } = new();
        public Task<UserProfile> GetProfileAsync() => Task.FromResult(Profile);
        public Task SaveProfileAsync(UserProfile profile) => Task.CompletedTask;
        public Task MarkConceptViewedAsync(string c) => Task.CompletedTask;
        public Task MarkLessonCompletedAsync(string l) => Task.CompletedTask;
        public Task RecordQuizResultAsync(string a, string? b, int c, int d, int e, int f) => Task.CompletedTask;
        public Task RecordQuestionAnsweredAsync(string? t, bool c) => Task.CompletedTask;
        public Task<double> GetTopicProgressAsync(string t) => Task.FromResult(0.0);
        public Task UpdateStreakAsync() => Task.CompletedTask;
        public Task StartSessionAsync() => Task.CompletedTask;
        public Task TickSessionTimeAsync() => Task.CompletedTask;
        public Task ResetProgressAsync() => Task.CompletedTask;
    }
}
