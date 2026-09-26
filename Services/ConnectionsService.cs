using System.Net.Http.Json;
using MathVoyager.Data;
using MathVoyager.Models;

namespace MathVoyager.Services;

public interface IConnectionsService
{
    Task<TopicGraphData> GetGraphAsync();
    Task<List<LearningPath>> GetPathsAsync();
    Task<LearningPath?> GetPathAsync(string id);
    Task<List<BigQuestion>> GetBigQuestionsAsync();
    Task<List<Resource>> GetResourcesAsync();
    Task<List<Echo>> GetEchoesAsync(string topicId, int take = 2);
    Task<DailyPick?> GetDailyPickAsync(UserProfile profile, DateTime date);
}

public class ConnectionsService : IConnectionsService
{
    private readonly HttpClient _http;
    private readonly IContentRepository _content;
    private TopicGraphData? _graph;
    private List<LearningPath>? _paths;
    private List<BigQuestion>? _bigQuestions;
    private List<Resource>? _resources;

    public ConnectionsService(HttpClient http, IContentRepository content)
    {
        _http = http;
        _content = content;
    }

    public async Task<TopicGraphData> GetGraphAsync()
    {
        if (_graph != null) return _graph;
        try { _graph = await _http.GetFromJsonAsync<TopicGraphData>("data/topic-graph.json") ?? new(); }
        catch { _graph = new(); }
        return _graph;
    }

    public async Task<List<LearningPath>> GetPathsAsync()
    {
        if (_paths != null) return _paths;
        try { _paths = await _http.GetFromJsonAsync<List<LearningPath>>("data/paths.json") ?? new(); }
        catch { _paths = new(); }
        return _paths;
    }

    public async Task<LearningPath?> GetPathAsync(string id) =>
        (await GetPathsAsync()).FirstOrDefault(p => p.Id == id);

    public async Task<List<BigQuestion>> GetBigQuestionsAsync()
    {
        if (_bigQuestions != null) return _bigQuestions;
        try { _bigQuestions = await _http.GetFromJsonAsync<List<BigQuestion>>("data/big-questions.json") ?? new(); }
        catch { _bigQuestions = new(); }
        return _bigQuestions;
    }

    public async Task<List<Resource>> GetResourcesAsync()
    {
        if (_resources != null) return _resources;
        try { _resources = await _http.GetFromJsonAsync<List<Resource>>("data/topic-resources.json") ?? new(); }
        catch { _resources = new(); }
        return _resources;
    }

    public async Task<List<Echo>> GetEchoesAsync(string topicId, int take = 2)
    {
        var graph = await GetGraphAsync();
        var topics = await _content.GetTopicsAsync();
        List<SynthesisQuiz> synthesis;
        try { synthesis = await _content.GetSynthesisQuizzesAsync(); }
        catch { synthesis = new(); }
        return Recommender.Echoes(topicId, topics, graph.Edges, synthesis, take);
    }

    public async Task<DailyPick?> GetDailyPickAsync(UserProfile profile, DateTime date)
    {
        var topics = await _content.GetTopicsAsync();
        var graph = await GetGraphAsync();
        var candidates = Recommender.DailyCandidates(topics, graph.Edges, profile);
        var rng = new Random(Recommender.DateSeed(date));

        // A candidate topic can be exhausted or empty; walk the seeded order until one yields a lesson.
        foreach (var topicId in candidates.OrderBy(_ => rng.Next()))
        {
            var topic = topics.FirstOrDefault(t => t.Id == topicId);
            if (topic == null) continue;
            var lesson = Recommender.NextLesson(await _content.GetLessonsAsync(topicId), profile);
            if (lesson == null) continue;

            var paths = await GetPathsAsync();
            var path = paths.FirstOrDefault(p => p.Steps.Any(s => s.LessonId == lesson.Id && s.TopicId == topicId));
            var discovery = lesson.Concepts.FirstOrDefault(c => c.Discovery != null)?.Discovery?.Prompt;
            var hook = discovery ?? path?.Question ?? lesson.Description;
            var reason = profile.TopicStatistics.ContainsKey(topicId)
                ? $"Next up in {topic.Name}"
                : profile.TopicStatistics.Count > 0 ? $"One step beyond what you know: {topic.Name}" : $"A good place to start: {topic.Name}";
            return new DailyPick { Topic = topic, Lesson = lesson, Hook = hook, Reason = reason };
        }
        return null;
    }
}
