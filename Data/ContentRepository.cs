using System.Net.Http.Json;
using MathVoyager.Models;

namespace MathVoyager.Data;

public class ContentRepository : IContentRepository
{
    private readonly HttpClient _http;
    private List<Topic>? _topics;
    private List<Domain>? _domains;
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

    public async Task<List<Topic>> GetTopicsByDomainAsync(string domainId)
    {
        var topics = await GetTopicsAsync();
        return topics.Where(t => string.Equals(t.Domain, domainId, StringComparison.OrdinalIgnoreCase)).ToList();
    }

    public async Task<List<Domain>> GetDomainsAsync()
    {
        _domains ??= await _http.GetFromJsonAsync<List<Domain>>("data/domains.json") ?? new();
        return _domains;
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
            try
            {
                var lessons = await _http.GetFromJsonAsync<List<Lesson>>($"data/{topicId}/lessons.json") ?? new();
                _lessons[topicId] = lessons.OrderBy(l => l.Order).ToList();
            }
            catch
            {
                _lessons[topicId] = new();
            }
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
            try
            {
                _questions[topicId] = await _http.GetFromJsonAsync<List<Question>>($"data/{topicId}/questions.json") ?? new();
            }
            catch
            {
                _questions[topicId] = new();
            }
        }
        return _questions[topicId];
    }

    public async Task<List<Question>> GetQuestionsForLessonAsync(string topicId, string lessonId)
    {
        var all = await GetQuestionsAsync(topicId);
        return all.Where(q => q.LessonId == lessonId).ToList();
    }

    private readonly Dictionary<string, List<Question>> _masteryQuestions = new();

    public async Task<List<Question>> GetMasteryQuestionsAsync(string topicId)
    {
        if (!_masteryQuestions.ContainsKey(topicId))
        {
            try
            {
                _masteryQuestions[topicId] = await _http.GetFromJsonAsync<List<Question>>($"data/{topicId}/mastery-questions.json") ?? new();
            }
            catch
            {
                _masteryQuestions[topicId] = new();
            }
        }
        return _masteryQuestions[topicId];
    }

    private List<SynthesisQuiz>? _synthesisQuizzes;

    public async Task<List<SynthesisQuiz>> GetSynthesisQuizzesAsync()
    {
        _synthesisQuizzes ??= await _http.GetFromJsonAsync<List<SynthesisQuiz>>("data/synthesis-quizzes.json") ?? new();
        return _synthesisQuizzes;
    }

    public async Task<SynthesisQuiz?> GetSynthesisQuizAsync(string id)
    {
        var quizzes = await GetSynthesisQuizzesAsync();
        return quizzes.FirstOrDefault(q => q.Id == id);
    }
}
