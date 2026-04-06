using System.Net.Http.Json;
using MathVoyager.Models;

namespace MathVoyager.Data;

public class ContentRepository : IContentRepository
{
    private readonly HttpClient _http;
    private List<Topic>? _topics;
    private readonly Dictionary<string, List<Lesson>> _lessons = new();
    private readonly Dictionary<string, List<Question>> _questions = new();

    public ContentRepository(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<Topic>> GetTopicsAsync()
    {
        _topics ??= await _http.GetFromJsonAsync<List<Topic>>("data/topics.json") ?? new();
        return _topics;
    }

    public async Task<Topic?> GetTopicAsync(string topicId)
    {
        var topics = await GetTopicsAsync();
        return topics.FirstOrDefault(t => t.Id == topicId);
    }

    public async Task<List<Lesson>> GetLessonsAsync(string topicId)
    {
        if (!_lessons.ContainsKey(topicId))
        {
            var lessons = await _http.GetFromJsonAsync<List<Lesson>>($"data/{topicId}/lessons.json") ?? new();
            _lessons[topicId] = lessons.OrderBy(l => l.Order).ToList();
        }
        return _lessons[topicId];
    }

    public async Task<Lesson?> GetLessonAsync(string topicId, string lessonId)
    {
        var lessons = await GetLessonsAsync(topicId);
        return lessons.FirstOrDefault(l => l.Id == lessonId);
    }

    public async Task<List<Question>> GetQuestionsAsync(string topicId)
    {
        if (!_questions.ContainsKey(topicId))
        {
            _questions[topicId] = await _http.GetFromJsonAsync<List<Question>>($"data/{topicId}/questions.json") ?? new();
        }
        return _questions[topicId];
    }

    public async Task<List<Question>> GetQuestionsForLessonAsync(string topicId, string lessonId)
    {
        var all = await GetQuestionsAsync(topicId);
        return all.Where(q => q.LessonId == lessonId).ToList();
    }
}
