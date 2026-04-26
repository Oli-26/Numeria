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

    public async Task<List<LeaderboardEntry>> GetLeaderboardAsync(int count = 50)
    {
        if (!IsConfigured) return GetDemoData();

        try
        {
            var url = $"{FirebaseUrl}/leaderboard.json?orderBy=\"score\"&limitToLast={count}";
            var json = await _http.GetStringAsync(url);
            return ParseEntries(json);
        }
        catch
        {
            return GetDemoData();
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

    private static List<LeaderboardEntry> GetDemoData()
    {
        return new List<LeaderboardEntry>
        {
            new() { Name = "Euler_Fan", Score = 12500, Seconds = 15, Text = "7 topics" },
            new() { Name = "GaussLover", Score = 9800, Seconds = 12, Text = "5 topics" },
            new() { Name = "TopologyNerd", Score = 7200, Seconds = 10, Text = "4 topics" },
            new() { Name = "PrimeSieve", Score = 5500, Seconds = 8, Text = "3 topics" },
            new() { Name = "IntegralKing", Score = 4100, Seconds = 7, Text = "3 topics" },
            new() { Name = "MatrixMaster", Score = 3200, Seconds = 6, Text = "2 topics" },
            new() { Name = "ProofWriter", Score = 2400, Seconds = 5, Text = "2 topics" },
            new() { Name = "NewLearner", Score = 800, Seconds = 3, Text = "1 topic" },
        };
    }
}
