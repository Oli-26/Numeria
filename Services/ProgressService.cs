using System.Text.Json;
using Microsoft.JSInterop;
using MathVoyager.Data;
using MathVoyager.Models;

namespace MathVoyager.Services;

public class ProgressService : IProgressService
{
    private readonly IJSRuntime _js;
    private readonly IContentRepository _contentRepo;
    private UserProfile? _cachedProfile;
    private const string StorageKey = "mathvoyager_profile";

    public ProgressService(IJSRuntime js, IContentRepository contentRepo)
    {
        _js = js;
        _contentRepo = contentRepo;
    }

    public async Task<UserProfile> GetProfileAsync()
    {
        if (_cachedProfile != null) return _cachedProfile;

        var json = await _js.InvokeAsync<string?>("localStorage.getItem", StorageKey);
        if (json != null)
        {
            _cachedProfile = JsonSerializer.Deserialize<UserProfile>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new UserProfile();
        }
        else
        {
            _cachedProfile = new UserProfile();
        }
        return _cachedProfile;
    }

    public async Task SaveProfileAsync(UserProfile profile)
    {
        _cachedProfile = profile;
        var json = JsonSerializer.Serialize(profile, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        await _js.InvokeVoidAsync("localStorage.setItem", StorageKey, json);
    }

    public async Task MarkConceptViewedAsync(string conceptId)
    {
        var profile = await GetProfileAsync();
        if (!profile.ConceptsViewed.Contains(conceptId))
        {
            profile.ConceptsViewed.Add(conceptId);
            await SaveProfileAsync(profile);
        }
    }

    public async Task MarkLessonCompletedAsync(string lessonId)
    {
        var profile = await GetProfileAsync();
        if (!profile.LessonsCompleted.Contains(lessonId))
        {
            profile.LessonsCompleted.Add(lessonId);
            await SaveProfileAsync(profile);
        }
    }

    public async Task RecordQuizResultAsync(string quizId, string? topicId, int score, int correctCount, int totalCount, int xpEarned)
    {
        var profile = await GetProfileAsync();
        profile.QuizHistory.Add(new QuizRecord
        {
            QuizId = quizId,
            TopicId = topicId,
            Score = score,
            CorrectCount = correctCount,
            QuestionsCount = totalCount,
            Date = DateTime.Now.ToString("yyyy-MM-dd"),
            XpEarned = xpEarned
        });

        // Update topic stats
        if (topicId != null)
        {
            if (!profile.TopicStatistics.ContainsKey(topicId))
                profile.TopicStatistics[topicId] = new TopicStats();

            var ts = profile.TopicStatistics[topicId];
            ts.QuizzesTaken++;
            ts.TotalXpEarned += xpEarned;
            if (score > ts.BestScore) ts.BestScore = score;
        }

        await SaveProfileAsync(profile);
    }

    public async Task RecordQuestionAnsweredAsync(string? topicId, bool correct)
    {
        var profile = await GetProfileAsync();
        profile.TotalQuestionsAnswered++;
        if (correct) profile.TotalCorrectAnswers++;

        if (topicId != null)
        {
            if (!profile.TopicStatistics.ContainsKey(topicId))
                profile.TopicStatistics[topicId] = new TopicStats();

            var ts = profile.TopicStatistics[topicId];
            ts.QuestionsAnswered++;
            if (correct) ts.CorrectAnswers++;
        }

        await SaveProfileAsync(profile);
    }

    public async Task<double> GetTopicProgressAsync(string topicId)
    {
        var profile = await GetProfileAsync();
        var lessons = await _contentRepo.GetLessonsAsync(topicId);
        if (lessons.Count == 0) return 0;

        var completed = lessons.Count(l => profile.LessonsCompleted.Contains(l.Id));
        return (double)completed / lessons.Count * 100;
    }

    public async Task UpdateStreakAsync()
    {
        var profile = await GetProfileAsync();
        var today = DateTime.Now.ToString("yyyy-MM-dd");
        var yesterday = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd");

        if (profile.LastActivityDate == today) return;

        if (profile.LastActivityDate == yesterday)
        {
            profile.CurrentStreak++;
        }
        else if (!string.IsNullOrEmpty(profile.LastActivityDate)
            && DateTime.TryParse(profile.LastActivityDate, out var lastDate))
        {
            var missedDays = (int)(DateTime.Now.Date - lastDate.Date).TotalDays - 1;
            if (missedDays > 0 && profile.StreakFreezeDays >= missedDays && profile.CurrentStreak > 0)
            {
                // Consume one freeze per missed day
                profile.StreakFreezeDays -= missedDays;
                profile.CurrentStreak++;
            }
            else
            {
                profile.CurrentStreak = 1;
            }
        }
        else
        {
            profile.CurrentStreak = 1;
        }

        if (profile.CurrentStreak > profile.LongestStreak)
            profile.LongestStreak = profile.CurrentStreak;

        profile.LastActivityDate = today;
        await SaveProfileAsync(profile);
    }

    public async Task StartSessionAsync()
    {
        var profile = await GetProfileAsync();
        profile.LastSessionStart = DateTime.Now.ToString("o");
        await SaveProfileAsync(profile);
    }

    public async Task TickSessionTimeAsync()
    {
        var profile = await GetProfileAsync();
        if (profile.LastSessionStart != null && DateTime.TryParse(profile.LastSessionStart, out var start))
        {
            var elapsed = Math.Min((int)(DateTime.Now - start).TotalMinutes, 30);
            if (elapsed > 0)
            {
                profile.TotalStudyMinutes += elapsed;
                profile.LastSessionStart = DateTime.Now.ToString("o");
                await SaveProfileAsync(profile);
            }
        }
    }

    public async Task ResetProgressAsync()
    {
        _cachedProfile = new UserProfile();
        await SaveProfileAsync(_cachedProfile);
    }
}
