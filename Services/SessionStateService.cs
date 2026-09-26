using System.Text.Json;
using Microsoft.JSInterop;

namespace MathVoyager.Services;

public class SessionStateService : ISessionStateService
{
    private readonly IJSRuntime _js;
    private const string StorageKey = "mathvoyager_session";

    public SessionStateService(IJSRuntime js)
    {
        _js = js;
    }

    public async Task SaveLessonStateAsync(string topicId, string lessonId, int conceptIndex, bool inQuiz)
    {
        var state = await LoadOrCreate();
        state.ActiveTopicId = topicId;
        state.ActiveLessonId = lessonId;
        state.ConceptIndex = conceptIndex;
        state.InQuiz = inQuiz;
        await Save(state);
    }

    public async Task SaveQuizStateAsync(QuizSessionState quizState)
    {
        var state = await LoadOrCreate();
        state.QuizState = quizState;
        state.InQuiz = true;
        await Save(state);
    }

    public async Task<SessionState?> LoadSessionStateAsync()
    {
        try
        {
            var json = await _js.InvokeAsync<string?>("localStorage.getItem", StorageKey);
            if (json == null) return null;
            var state = JsonSerializer.Deserialize<SessionState>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            if (state != null) RemapIds(state);
            return state;
        }
        catch
        {
            return null;
        }
    }

    public async Task ClearSessionStateAsync()
    {
        await _js.InvokeVoidAsync("localStorage.removeItem", StorageKey);
    }

    public static void RemapIds(SessionState state)
    {
        if (state.ActiveLessonId != null)
            state.ActiveLessonId = ProfileMigration.RemapForTopic(state.ActiveTopicId, state.ActiveLessonId);
        if (state.QuizState is { } q)
        {
            if (q.LessonId != null) q.LessonId = ProfileMigration.RemapForTopic(q.TopicId, q.LessonId);
            q.QuestionIds = q.QuestionIds.Select(id => ProfileMigration.RemapForTopic(q.TopicId, id)).ToList();
        }
    }

    private async Task<SessionState> LoadOrCreate()
    {
        var existing = await LoadSessionStateAsync();
        return existing ?? new SessionState();
    }

    private async Task Save(SessionState state)
    {
        var json = JsonSerializer.Serialize(state, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        await _js.InvokeVoidAsync("localStorage.setItem", StorageKey, json);
    }
}
