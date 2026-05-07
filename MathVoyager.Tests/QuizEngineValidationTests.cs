using MathVoyager.Data;
using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class QuizEngineValidationTests
{
    private static QuizEngine NewEngine() => new(new StubContentRepository());

    private static Question MC(string correct, int xp = 10) => new()
    {
        Id = "q1", Type = QuestionType.MultipleChoice, CorrectAnswer = correct, XpReward = xp
    };

    private static Question Fill(string correct, List<string>? acceptable = null, int xp = 10) => new()
    {
        Id = "q1", Type = QuestionType.FillIn, CorrectAnswer = correct,
        AcceptableAnswers = acceptable, XpReward = xp
    };

    private static Question Numeric(string correct, double? tol = null, int xp = 10) => new()
    {
        Id = "q1", Type = QuestionType.NumericInput, CorrectAnswer = correct,
        Tolerance = tol, XpReward = xp
    };

    // ---------- MultipleChoice / default path ----------

    [Theory]
    [InlineData("Apple", "apple", true)]
    [InlineData("Apple", "APPLE", true)]
    [InlineData("Apple", " apple ", true)]
    [InlineData("Apple", "banana", false)]
    [InlineData("two words", "TwoWords", true)]   // basic strips spaces
    public void MultipleChoice_BasicNormalization(string correct, string user, bool expected)
    {
        var r = NewEngine().ValidateAnswer(MC(correct), user);
        Assert.Equal(expected, r.IsCorrect);
        Assert.Equal(expected ? 10 : 0, r.XpEarned);
    }

    // ---------- FillIn: math equivalence ----------

    [Theory]
    [InlineData("x^2", "X^2")]
    [InlineData("x^2", "x²")]
    [InlineData("3x", "3*x")]
    [InlineData("3x", "3 x")]
    [InlineData("(x^2)", "x^2")]
    [InlineData("x^3/3", "(x^3)/3")]
    [InlineData("x^3/3", "(1/3)x^3")]
    [InlineData("x^3/3 + C", "x^3/3+C")]
    [InlineData("x^3/3 + C", "x^3/3+c")]
    public void FillIn_MathEquivalence(string correct, string user)
    {
        var r = NewEngine().ValidateAnswer(Fill(correct), user);
        Assert.True(r.IsCorrect, $"expected '{user}' == '{correct}'");
    }

    [Theory]
    [InlineData("x^2", "x^3")]
    [InlineData("3x", "4x")]
    public void FillIn_RejectsWrong(string correct, string user)
    {
        var r = NewEngine().ValidateAnswer(Fill(correct), user);
        Assert.False(r.IsCorrect);
        Assert.Equal(0, r.XpEarned);
    }

    [Fact]
    public void FillIn_AcceptableAnswersList()
    {
        var q = Fill("yes", new List<string> { "y", "true" });
        var eng = NewEngine();
        Assert.True(eng.ValidateAnswer(q, "yes").IsCorrect);
        Assert.True(eng.ValidateAnswer(q, "y").IsCorrect);
        Assert.True(eng.ValidateAnswer(q, "true").IsCorrect);
        Assert.False(eng.ValidateAnswer(q, "maybe").IsCorrect);
    }

    [Theory]
    [InlineData("16", "16.0", true)]
    [InlineData("16", "16.00", true)]
    [InlineData("16", "15.999", true)]      // within 0.001
    [InlineData("16", "16.5", false)]
    public void FillIn_NumericFuzz(string correct, string user, bool expected)
    {
        var r = NewEngine().ValidateAnswer(Fill(correct), user);
        Assert.Equal(expected, r.IsCorrect);
    }

    [Theory]
    [InlineData("1/6", "0.167", true)]
    [InlineData("1/4", "25%", true)]
    [InlineData("1/2", "0.5", true)]
    [InlineData("1/2", "0.6", false)]
    public void FillIn_FractionEquivalence(string correct, string user, bool expected)
    {
        var r = NewEngine().ValidateAnswer(Fill(correct), user);
        Assert.Equal(expected, r.IsCorrect);
    }

    [Theory]
    [InlineData("(3, 2)", "3,2", true)]
    [InlineData("(3, 2)", "(3,2)", true)]
    [InlineData("(3, 2)", "3, 2", true)]
    public void FillIn_TupleVariants(string correct, string user, bool expected)
    {
        var r = NewEngine().ValidateAnswer(Fill(correct), user);
        Assert.Equal(expected, r.IsCorrect);
    }

    // ---------- NumericInput ----------

    [Theory]
    [InlineData("100", null, "100", true)]
    [InlineData("100", null, "101", true)]    // default 1% of 100 = 1.0
    [InlineData("100", null, "102", false)]   // outside 1%
    [InlineData("100", 5.0, "104", true)]
    [InlineData("100", 5.0, "106", false)]
    [InlineData("0", null, "0.0000001", true)]    // tiny default tol
    [InlineData("0", null, "0.001", false)]
    public void Numeric_Tolerance(string correct, double? tol, string user, bool expected)
    {
        var r = NewEngine().ValidateAnswer(Numeric(correct, tol), user);
        Assert.Equal(expected, r.IsCorrect);
    }

    [Fact]
    public void Numeric_RejectsNonNumericInput()
    {
        var r = NewEngine().ValidateAnswer(Numeric("42"), "abc");
        Assert.False(r.IsCorrect);
    }

    // ---------- MultipleSelect ----------

    [Fact]
    public void MultipleSelect_OrderInsensitive()
    {
        var q = new Question
        {
            Id = "q1", Type = QuestionType.MultipleSelect,
            AcceptableAnswers = new List<string> { "a", "b", "c" },
            XpReward = 10
        };
        var eng = NewEngine();
        Assert.True(eng.ValidateAnswer(q, "a|b|c").IsCorrect);
        Assert.True(eng.ValidateAnswer(q, "c|b|a").IsCorrect);
        Assert.True(eng.ValidateAnswer(q, "A|B|C").IsCorrect);
        Assert.False(eng.ValidateAnswer(q, "a|b").IsCorrect);          // missing
        Assert.False(eng.ValidateAnswer(q, "a|b|c|d").IsCorrect);      // extra
        Assert.False(eng.ValidateAnswer(q, "").IsCorrect);
    }

    // ---------- Categorize ----------

    [Fact]
    public void Categorize_ExactMappingRequired()
    {
        var q = new Question
        {
            Id = "q1", Type = QuestionType.Categorize,
            CategoryItems = new Dictionary<string, string>
            {
                { "apple", "fruit" }, { "carrot", "veg" }
            },
            XpReward = 10
        };
        var eng = NewEngine();
        Assert.True(eng.ValidateAnswer(q, "apple=>fruit;carrot=>veg").IsCorrect);
        Assert.True(eng.ValidateAnswer(q, "carrot=>veg;apple=>fruit").IsCorrect);
        Assert.True(eng.ValidateAnswer(q, "APPLE=>FRUIT;CARROT=>VEG").IsCorrect);
        Assert.False(eng.ValidateAnswer(q, "apple=>veg;carrot=>fruit").IsCorrect);
        Assert.False(eng.ValidateAnswer(q, "apple=>fruit").IsCorrect);     // incomplete
        Assert.False(eng.ValidateAnswer(q, "apple-fruit;carrot-veg").IsCorrect); // bad sep
    }

    [Fact]
    public void Categorize_NullCategoryItemsRejects()
    {
        var q = new Question { Id = "q1", Type = QuestionType.Categorize, XpReward = 10 };
        var r = NewEngine().ValidateAnswer(q, "anything");
        Assert.False(r.IsCorrect);
    }

    // ---------- XpEarned wiring ----------

    [Fact]
    public void Correct_AwardsXpWrong_AwardsZero()
    {
        var eng = NewEngine();
        var q = MC("yes", xp: 25);
        Assert.Equal(25, eng.ValidateAnswer(q, "yes").XpEarned);
        Assert.Equal(0, eng.ValidateAnswer(q, "no").XpEarned);
    }

    private sealed class StubContentRepository : IContentRepository
    {
        public Task<List<Topic>> GetTopicsAsync() => Task.FromResult(new List<Topic>());
        public Task<List<Topic>> GetTopicsByDomainAsync(string domainId) => Task.FromResult(new List<Topic>());
        public Task<List<Domain>> GetDomainsAsync() => Task.FromResult(new List<Domain>());
        public Task<Topic?> GetTopicAsync(string topicId) => Task.FromResult<Topic?>(null);
        public Task<List<Lesson>> GetLessonsAsync(string topicId) => Task.FromResult(new List<Lesson>());
        public Task<Lesson?> GetLessonAsync(string topicId, string lessonId) => Task.FromResult<Lesson?>(null);
        public Task<List<Question>> GetQuestionsAsync(string topicId) => Task.FromResult(new List<Question>());
        public Task<List<Question>> GetQuestionsForLessonAsync(string topicId, string lessonId) => Task.FromResult(new List<Question>());
        public Task<List<Question>> GetMasteryQuestionsAsync(string topicId) => Task.FromResult(new List<Question>());
        public Task<List<SynthesisQuiz>> GetSynthesisQuizzesAsync() => Task.FromResult(new List<SynthesisQuiz>());
        public Task<SynthesisQuiz?> GetSynthesisQuizAsync(string id) => Task.FromResult<SynthesisQuiz?>(null);
    }
}
