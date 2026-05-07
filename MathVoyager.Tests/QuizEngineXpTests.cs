using MathVoyager.Data;
using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class QuizEngineXpTests
{
    private static QuizEngine NewEngine() => new(new StubRepo());

    private static QuizResult R(int xp, bool correct = true) => new()
    {
        Question = new Question { Id = "q", XpReward = xp },
        IsCorrect = correct,
        XpEarned = correct ? xp : 0
    };

    // NOTE: empty results currently award the 50 perfect-bonus because
    // List.All() on empty returns true. Likely a bug — flagged for review.
    // Test pins current behavior so any future fix is intentional.
    [Fact]
    public void EmptyResults_AwardsPerfectBonus_PossibleBug()
    {
        Assert.Equal(50, NewEngine().CalculateQuizXp(new(), 0));
        Assert.Equal(75, NewEngine().CalculateQuizXp(new(), 5));
    }

    [Fact]
    public void AllCorrect_AppliesPerfectBonusAndStreakMultiplier()
    {
        // 3 correct × 10 = 30 base, +50 perfect = 80, streak 0 → ×1.0 → 80
        var results = new List<QuizResult> { R(10), R(10), R(10) };
        Assert.Equal(80, NewEngine().CalculateQuizXp(results, 0));

        // streak 5 → ×1.5 → 120
        Assert.Equal(120, NewEngine().CalculateQuizXp(results, 5));
    }

    [Fact]
    public void OneWrong_DropsBonusKeepsBaseAndMultiplier()
    {
        // 2 correct (10 each = 20) + 1 wrong (0). No perfect bonus. streak 0 → 20
        var results = new List<QuizResult> { R(10), R(10), R(10, correct: false) };
        Assert.Equal(20, NewEngine().CalculateQuizXp(results, 0));

        // streak 3 → ×1.3 → 26
        Assert.Equal(26, NewEngine().CalculateQuizXp(results, 3));
    }

    [Fact]
    public void StreakMultiplier_CapsAt2x()
    {
        var results = new List<QuizResult> { R(10) };  // 10 base + 50 bonus = 60
        // streak 10 → ×2.0 → 120
        Assert.Equal(120, NewEngine().CalculateQuizXp(results, 10));
        // streak 100 also caps at ×2.0 → 120
        Assert.Equal(120, NewEngine().CalculateQuizXp(results, 100));
    }

    [Fact]
    public void StreakMultiplier_FloorRounding()
    {
        // 1 correct × 7 = 7 base + 50 bonus = 57, streak 1 → ×1.1 → 62.7 → floor 62
        var results = new List<QuizResult> { R(7) };
        Assert.Equal(62, NewEngine().CalculateQuizXp(results, 1));
    }

    private sealed class StubRepo : IContentRepository
    {
        public Task<List<Topic>> GetTopicsAsync() => Task.FromResult(new List<Topic>());
        public Task<List<Topic>> GetTopicsByDomainAsync(string d) => Task.FromResult(new List<Topic>());
        public Task<List<Domain>> GetDomainsAsync() => Task.FromResult(new List<Domain>());
        public Task<Topic?> GetTopicAsync(string t) => Task.FromResult<Topic?>(null);
        public Task<List<Lesson>> GetLessonsAsync(string t) => Task.FromResult(new List<Lesson>());
        public Task<Lesson?> GetLessonAsync(string t, string l) => Task.FromResult<Lesson?>(null);
        public Task<List<Question>> GetQuestionsAsync(string t) => Task.FromResult(new List<Question>());
        public Task<List<Question>> GetQuestionsForLessonAsync(string t, string l) => Task.FromResult(new List<Question>());
        public Task<List<Question>> GetMasteryQuestionsAsync(string t) => Task.FromResult(new List<Question>());
        public Task<List<SynthesisQuiz>> GetSynthesisQuizzesAsync() => Task.FromResult(new List<SynthesisQuiz>());
        public Task<SynthesisQuiz?> GetSynthesisQuizAsync(string id) => Task.FromResult<SynthesisQuiz?>(null);
    }
}
