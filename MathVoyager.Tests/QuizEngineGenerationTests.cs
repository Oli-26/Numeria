using MathVoyager.Data;
using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class QuizEngineGenerationTests
{
    [Fact]
    public async Task GenerateLearned_Tier1_ReturnsLessonScopedQuestions()
    {
        var repo = new SeedRepo();
        repo.AddTopic("alg", lessons: new[] { "lesson1", "lesson2" });
        repo.AddQuestion("alg", "lesson1", "q-a1");
        repo.AddQuestion("alg", "lesson1", "q-a2");
        repo.AddQuestion("alg", "lesson2", "q-b1");

        var qs = await new QuizEngine(repo).GenerateLearnedQuizAsync(
            completedLessonIds: new[] { "lesson1" },
            completedTopicIds: null,
            engagedTopicIds: null,
            count: 10);

        Assert.Equal(2, qs.Count);
        Assert.All(qs, q => Assert.Equal("lesson1", q.LessonId));
    }

    [Fact]
    public async Task GenerateLearned_Tier2_FillsFromCompletedTopics()
    {
        var repo = new SeedRepo();
        repo.AddTopic("alg", lessons: new[] { "l1" });
        repo.AddQuestion("alg", "l1", "q-a1");
        repo.AddQuestion("alg", "l1", "q-a2");
        repo.AddQuestion("alg", "l1", "q-a3");

        // No completed lessons. Tier 1 yields 0 → tier 2 fills from completed topic.
        var qs = await new QuizEngine(repo).GenerateLearnedQuizAsync(
            completedLessonIds: null,
            completedTopicIds: new[] { "alg" },
            engagedTopicIds: null,
            count: 5);

        Assert.Equal(3, qs.Count);
    }

    [Fact]
    public async Task GenerateLearned_Tier3_FillsFromEngagedTopicsOnly()
    {
        var repo = new SeedRepo();
        repo.AddTopic("geom", lessons: new[] { "g1" });
        repo.AddQuestion("geom", "g1", "g-q1");
        repo.AddQuestion("geom", "g1", "g-q2");

        var qs = await new QuizEngine(repo).GenerateLearnedQuizAsync(
            completedLessonIds: null,
            completedTopicIds: null,
            engagedTopicIds: new[] { "geom" },
            count: 5);

        Assert.Equal(2, qs.Count);
    }

    [Fact]
    public async Task GenerateLearned_Dedupes_AcrossTiers()
    {
        var repo = new SeedRepo();
        repo.AddTopic("alg", lessons: new[] { "l1" });
        repo.AddQuestion("alg", "l1", "q-shared");

        // Same question would appear in tier 1, tier 2, AND tier 3.
        var qs = await new QuizEngine(repo).GenerateLearnedQuizAsync(
            completedLessonIds: new[] { "l1" },
            completedTopicIds: new[] { "alg" },
            engagedTopicIds: new[] { "alg" },
            count: 10);

        Assert.Single(qs);
    }

    [Fact]
    public async Task GenerateLearned_EmptyInputs_ReturnsEmpty()
    {
        var repo = new SeedRepo();
        repo.AddTopic("alg", lessons: new[] { "l1" });
        repo.AddQuestion("alg", "l1", "q1");

        var qs = await new QuizEngine(repo).GenerateLearnedQuizAsync(null, null, null, count: 5);
        Assert.Empty(qs);
    }

    [Fact]
    public async Task GenerateLearned_RespectsCount()
    {
        var repo = new SeedRepo();
        repo.AddTopic("alg", lessons: new[] { "l1" });
        for (int i = 0; i < 20; i++) repo.AddQuestion("alg", "l1", $"q{i}");

        var qs = await new QuizEngine(repo).GenerateLearnedQuizAsync(
            completedLessonIds: new[] { "l1" },
            completedTopicIds: null,
            engagedTopicIds: null,
            count: 7);

        Assert.Equal(7, qs.Count);
    }

    [Fact]
    public async Task GenerateMixed_FiltersByCompletedTopics()
    {
        var repo = new SeedRepo();
        repo.AddTopic("alg", lessons: new[] { "l1" });
        repo.AddTopic("geom", lessons: new[] { "g1" });
        repo.AddQuestion("alg", "l1", "alg-q1");
        repo.AddQuestion("alg", "l1", "alg-q2");
        repo.AddQuestion("geom", "g1", "geom-q1");

        var qs = await new QuizEngine(repo).GenerateMixedQuizAsync(
            completedTopicIds: new[] { "alg" },
            count: 10);

        Assert.Equal(2, qs.Count);
        Assert.All(qs, q => Assert.StartsWith("alg-", q.Id));
    }

    [Fact]
    public async Task GenerateMixed_NullFilter_IncludesAll()
    {
        var repo = new SeedRepo();
        repo.AddTopic("alg", lessons: new[] { "l1" });
        repo.AddTopic("geom", lessons: new[] { "g1" });
        repo.AddQuestion("alg", "l1", "alg-q1");
        repo.AddQuestion("geom", "g1", "geom-q1");

        var qs = await new QuizEngine(repo).GenerateMixedQuizAsync(null, count: 10);
        Assert.Equal(2, qs.Count);
    }

    [Fact]
    public async Task GenerateQuiz_ByLesson_OnlyReturnsLessonQuestions()
    {
        var repo = new SeedRepo();
        repo.AddTopic("alg", lessons: new[] { "l1", "l2" });
        repo.AddQuestion("alg", "l1", "l1-q1");
        repo.AddQuestion("alg", "l1", "l1-q2");
        repo.AddQuestion("alg", "l2", "l2-q1");
        repo.LessonScopedQuestions["alg/l1"] = new List<Question>
        {
            new() { Id = "l1-q1", LessonId = "l1" },
            new() { Id = "l1-q2", LessonId = "l1" }
        };

        var qs = await new QuizEngine(repo).GenerateQuizAsync("alg", "l1", count: 10);
        Assert.Equal(2, qs.Count);
        Assert.All(qs, q => Assert.Equal("l1", q.LessonId));
    }

    private sealed class SeedRepo : IContentRepository
    {
        private readonly List<Topic> _topics = new();
        private readonly Dictionary<string, List<Question>> _topicQuestions = new();
        private readonly Dictionary<string, List<Lesson>> _topicLessons = new();
        public Dictionary<string, List<Question>> LessonScopedQuestions { get; } = new();

        public void AddTopic(string id, string[] lessons)
        {
            _topics.Add(new Topic { Id = id, Name = id });
            _topicLessons[id] = lessons.Select(l => new Lesson { Id = l, Title = l }).ToList();
            _topicQuestions[id] = new List<Question>();
        }

        public void AddQuestion(string topicId, string lessonId, string qId)
        {
            _topicQuestions[topicId].Add(new Question { Id = qId, LessonId = lessonId });
        }

        public Task<List<Topic>> GetTopicsAsync() => Task.FromResult(_topics);
        public Task<List<Topic>> GetTopicsByDomainAsync(string d) => Task.FromResult(_topics);
        public Task<List<Domain>> GetDomainsAsync() => Task.FromResult(new List<Domain>());
        public Task<Topic?> GetTopicAsync(string topicId) => Task.FromResult(_topics.FirstOrDefault(t => t.Id == topicId));
        public Task<List<Lesson>> GetLessonsAsync(string topicId) =>
            Task.FromResult(_topicLessons.TryGetValue(topicId, out var l) ? l : new List<Lesson>());
        public Task<Lesson?> GetLessonAsync(string topicId, string lessonId) =>
            Task.FromResult(_topicLessons.TryGetValue(topicId, out var l) ? l.FirstOrDefault(x => x.Id == lessonId) : null);
        public Task<List<Question>> GetQuestionsAsync(string topicId) =>
            Task.FromResult(_topicQuestions.TryGetValue(topicId, out var q) ? q : new List<Question>());
        public Task<List<Question>> GetQuestionsForLessonAsync(string topicId, string lessonId) =>
            Task.FromResult(LessonScopedQuestions.TryGetValue($"{topicId}/{lessonId}", out var q) ? q : new List<Question>());
        public Task<List<Question>> GetMasteryQuestionsAsync(string topicId) => Task.FromResult(new List<Question>());
        public Task<List<SynthesisQuiz>> GetSynthesisQuizzesAsync() => Task.FromResult(new List<SynthesisQuiz>());
        public Task<SynthesisQuiz?> GetSynthesisQuizAsync(string id) => Task.FromResult<SynthesisQuiz?>(null);
    }
}
