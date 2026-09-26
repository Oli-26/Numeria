using System.Net.Http.Json;
using System.Text.Json;

namespace MathVoyager.Services;

public class LeaderboardService : ILeaderboardService
{
    private readonly HttpClient _http;

    // Replace with your Firebase Realtime Database URL
    private const string FirebaseUrl = "https://numerialeaderboard-default-rtdb.firebaseio.com";

    public bool IsConfigured => FirebaseUrl != "REPLACE_WITH_YOUR_FIREBASE_URL";

    public LeaderboardService(HttpClient http)
    {
        _http = http;
    }

    public async Task<bool> SubmitScoreAsync(string name, int score, int level, string extra)
    {
        if (!IsConfigured) return false;

        try
        {
            var safeName = SanitizeName(name);

            // Check existing score — only update if new score is higher
            var existing = await GetPlayerScoreAsync(name);
            if (existing != null && score <= existing.Score)
                return true;

            var entry = new LeaderboardEntry
            {
                Name = safeName,
                Score = score,
                Seconds = level,
                Text = extra,
                Date = DateTime.Now.ToString("yyyy-MM-dd")
            };

            var url = $"{FirebaseUrl}/leaderboard/{safeName}.json";
            var response = await _http.PutAsJsonAsync(url, entry);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public async Task<List<LeaderboardEntry>?> GetLeaderboardAsync(int count = 50)
    {
        if (!IsConfigured) return new List<LeaderboardEntry>();

        try
        {
            var url = $"{FirebaseUrl}/leaderboard.json?orderBy=\"score\"&limitToLast={count}";
            var json = await _http.GetStringAsync(url);
            return ParseEntries(json);
        }
        catch
        {
            return null;
        }
    }

    public async Task<LeaderboardEntry?> GetPlayerScoreAsync(string name)
    {
        if (!IsConfigured) return null;

        try
        {
            var safeName = SanitizeName(name);
            var url = $"{FirebaseUrl}/leaderboard/{safeName}.json";
            var json = await _http.GetStringAsync(url);
            if (json == "null") return null;

            return JsonSerializer.Deserialize<LeaderboardEntry>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch
        {
            return null;
        }
    }

    private static string SanitizeName(string name)
    {
        // Firebase keys cannot contain . $ # [ ] /
        var safe = name.Replace(".", "").Replace("$", "").Replace("#", "")
                       .Replace("[", "").Replace("]", "").Replace("/", "")
                       .Replace("\\", "").Replace(" ", "_").Trim();
        return string.IsNullOrEmpty(safe) ? "Anonymous" : safe;
    }

    private static List<LeaderboardEntry> ParseEntries(string json)
    {
        try
        {
            if (json == "null") return new();

            var dict = JsonSerializer.Deserialize<Dictionary<string, LeaderboardEntry>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (dict == null) return new();

            return dict.Values
                .OrderByDescending(e => e.Score)
                .ToList();
        }
        catch
        {
            return new();
        }
    }

}
