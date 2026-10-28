using System.Net.Http.Json;
using System.Text.RegularExpressions;
using MathVoyager.Models;
using MathVoyager.Services;

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

    private Dictionary<string, ConceptExtra>? _conceptExtras;

    // concept-extras.json layers optional content (discovery prompts, depth layers, visuals,
    // model summaries) onto concepts without rewriting every lessons.json.
    private async Task<Dictionary<string, ConceptExtra>> GetConceptExtrasAsync()
    {
        if (_conceptExtras != null) return _conceptExtras;
        try { _conceptExtras = await _http.GetFromJsonAsync<Dictionary<string, ConceptExtra>>("data/concept-extras.json") ?? new(); }
        catch { _conceptExtras = new(); }
        return _conceptExtras;
    }

    public static void ApplyExtras(IEnumerable<Lesson> lessons, IReadOnlyDictionary<string, ConceptExtra> extras)
    {
        foreach (var lesson in lessons)
        foreach (var c in lesson.Concepts)
        {
            if (!extras.TryGetValue(c.Id, out var x)) continue;
            c.Discovery ??= x.Discovery;
            c.ModelSummary ??= x.ModelSummary;
            c.ContentHtmlSimple ??= x.ContentHtmlSimple;
            c.ContentHtmlDeep ??= x.ContentHtmlDeep;
            c.SimulatorRoute ??= x.SimulatorRoute;
            if (x.VisualizationType != null)
            {
                c.VisualizationType = x.VisualizationType;
                c.VisualizationConfig = x.VisualizationConfig;
            }
            if (c.Discovery != null)
            {
                c.Discovery.LessonId = lesson.Id;
                c.Discovery.ConceptId = c.Id;
            }
        }
    }

    // Only topics whose lessons carry citation markers have a citations.json, so others never request one.
    private async Task<Dictionary<string, List<Citation>>> GetCitationsAsync(string topicId, List<Lesson> lessons)
    {
        if (!lessons.Any(l => l.Concepts.Any(c => c.ContentHtml.Contains("class=\"cite\"")))) return new();
        try { return await _http.GetFromJsonAsync<Dictionary<string, List<Citation>>>($"data/{topicId}/citations.json") ?? new(); }
        catch { return new(); }
    }

    public static void ApplyCitations(IEnumerable<Lesson> lessons, IReadOnlyDictionary<string, List<Citation>> citations)
    {
        foreach (var c in lessons.SelectMany(l => l.Concepts))
            if (citations.TryGetValue(c.Id, out var list)) c.Citations = list;
    }

    private Dictionary<string, List<string>>? _lessonIndex;

    // A small id index, so progress can be counted without downloading and parsing every lessons.json.
    public async Task<List<string>> GetLessonIdsAsync(string topicId)
    {
        if (_lessonIndex == null)
        {
            try { _lessonIndex = await _http.GetFromJsonAsync<Dictionary<string, List<string>>>("data/lesson-index.json") ?? new(); }
            catch { _lessonIndex = new(); }
        }
        return _lessonIndex.TryGetValue(topicId, out var ids) ? ids : (await GetLessonsAsync(topicId)).Select(l => l.Id).ToList();
    }

    public async Task<List<Lesson>> GetLessonsAsync(string topicId)
    {
        if (!_lessons.ContainsKey(topicId))
        {
            try
            {
                var lessons = await _http.GetFromJsonAsync<List<Lesson>>($"data/{topicId}/lessons.json") ?? new();
                ApplyExtras(lessons, await GetConceptExtrasAsync());
                ApplyCitations(lessons, await GetCitationsAsync(topicId, lessons));
                ShuffleOptionsInPlace(lessons.SelectMany(l => l.Concepts).Where(c => c.Discovery != null).Select(c => c.Discovery!));
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
                var loaded = await _http.GetFromJsonAsync<List<Question>>($"data/{topicId}/questions.json") ?? new();
                foreach (var q in loaded) q.TopicId = topicId;
                ConceptMatcher.Assign(loaded, await GetLessonsAsync(topicId));
                ShuffleOptionsInPlace(loaded);
                _questions[topicId] = loaded;
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
                var loaded = await _http.GetFromJsonAsync<List<Question>>($"data/{topicId}/mastery-questions.json") ?? new();
                foreach (var q in loaded) q.TopicId = topicId;
                ShuffleOptionsInPlace(loaded);
                _masteryQuestions[topicId] = loaded;
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
        if (_synthesisQuizzes == null)
        {
            _synthesisQuizzes = await _http.GetFromJsonAsync<List<SynthesisQuiz>>("data/synthesis-quizzes.json") ?? new();
            foreach (var sq in _synthesisQuizzes)
                ShuffleOptionsInPlace(sq.Questions);
        }
        return _synthesisQuizzes;
    }

    // Options that point at other options by letter cannot survive a shuffle at all;
    // "all/none of the above" can, as long as they stay last.
    private static readonly Regex LetterReference =
        new(@"^\s*(both|either|neither|only)?\s*\(?[a-e]\)?\s*(and|or|nor|&|,)\s*\(?[a-e]\)?\s*(only)?\s*$", RegexOptions.IgnoreCase);
    private static readonly Regex AnchoredLast =
        new(@"\b(all|none|both|neither) of the (above|previous)\b", RegexOptions.IgnoreCase);

    public static void ShuffleOptionsInPlace(IEnumerable<Question> questions)
    {
        foreach (var q in questions)
        {
            if (q.Options is not { Count: > 1 }) continue;
            if (q.Options.Any(o => LetterReference.IsMatch(o))) continue;

            var movable = q.Options.Where(o => !AnchoredLast.IsMatch(o)).ToArray();
            Random.Shared.Shuffle(movable);
            q.Options = movable.Concat(q.Options.Where(o => AnchoredLast.IsMatch(o))).ToList();
        }
    }

    public async Task<SynthesisQuiz?> GetSynthesisQuizAsync(string id)
    {
        var quizzes = await GetSynthesisQuizzesAsync();
        return quizzes.FirstOrDefault(q => q.Id == id);
    }
}
