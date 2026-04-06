using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MathVoyager.Services;

public class LeaderboardService : ILeaderboardService
{
    private readonly HttpClient _http;

    // Dreamlo codes -- replace with your own from https://dreamlo.com
    // Private code: for adding scores (keep secret in a real app, but fine for sideloaded)
    // Public code: for reading scores
    private const string PrivateCode = "REPLACE_WITH_YOUR_PRIVATE_CODE";
    private const string PublicCode = "REPLACE_WITH_YOUR_PUBLIC_CODE";
    private const string BaseUrl = "http://dreamlo.com/lb";

    public bool IsConfigured => PrivateCode != "REPLACE_WITH_YOUR_PRIVATE_CODE";

    public LeaderboardService(HttpClient http)
    {
        _http = http;
    }

    public async Task<bool> SubmitScoreAsync(string name, int score, int level, string extra)
    {
        if (!IsConfigured) return false;

        try
        {
            // Sanitize name: dreamlo uses name as key, no slashes or special chars
            var safeName = name.Replace("/", "").Replace("\\", "").Replace(" ", "_").Trim();
            if (string.IsNullOrEmpty(safeName)) safeName = "Anonymous";

            var url = $"{BaseUrl}/{PrivateCode}/add/{safeName}/{score}/{level}/{Uri.EscapeDataString(extra)}";
            var response = await _http.GetAsync(url);
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
            var url = $"{BaseUrl}/{PublicCode}/json";
            var json = await _http.GetStringAsync(url);
            return ParseLeaderboard(json);
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
            var safeName = name.Replace("/", "").Replace("\\", "").Replace(" ", "_").Trim();
            var url = $"{BaseUrl}/{PublicCode}/json?name={safeName}";
            var json = await _http.GetStringAsync(url);
            var entries = ParseLeaderboard(json);
            return entries.FirstOrDefault();
        }
        catch
        {
            return null;
        }
    }

    private static List<LeaderboardEntry> ParseLeaderboard(string json)
    {
        try
        {
            var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (!root.TryGetProperty("dreamlo", out var dreamlo))
                return new();
            if (!dreamlo.TryGetProperty("leaderboard", out var lb))
                return new();

            var entries = new List<LeaderboardEntry>();

            // Can be an array or single object
            if (lb.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in lb.EnumerateArray())
                    entries.Add(ParseEntry(item));
            }
            else if (lb.ValueKind == JsonValueKind.Object)
            {
                entries.Add(ParseEntry(lb));
            }

            return entries.OrderByDescending(e => e.Score).ToList();
        }
        catch
        {
            return new();
        }
    }

    private static LeaderboardEntry ParseEntry(JsonElement el)
    {
        return new LeaderboardEntry
        {
            Name = el.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "",
            Score = el.TryGetProperty("score", out var s) ? s.GetInt32() : 0,
            Seconds = el.TryGetProperty("seconds", out var sec) ? sec.GetInt32() : 0,
            Text = el.TryGetProperty("text", out var t) ? t.GetString() ?? "" : "",
            Date = el.TryGetProperty("date", out var d) ? d.GetString() ?? "" : ""
        };
    }

    /// Demo data shown when Dreamlo isn't configured yet
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
