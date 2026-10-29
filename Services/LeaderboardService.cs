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

    public async Task<bool> SubmitScoreAsync(string name, int score, int level, string extra, string? avatar = null)
    {
        if (!IsConfigured) return false;

        try
        {
            var safeName = SanitizeName(name);
            // Only a known card id is ever stored, so the field cannot carry arbitrary text.
            var safeAvatar = HallOfFame.Resolve(avatar)?.Id;
            var url = $"{FirebaseUrl}/leaderboard/{Uri.EscapeDataString(safeName)}.json";

            // Check existing score: only update if new score is higher
            var existing = await GetPlayerScoreAsync(name);
            if (existing != null && score <= existing.Score)
            {
                // A higher score under this name is someone else's (or from before a progress reset), so leave it alone.
                if (score < existing.Score || existing.Avatar == safeAvatar) return true;
                // Same score as posted means it is our own entry: show the new avatar. PATCH leaves the score alone.
                var patched = await _http.PatchAsync(url, JsonContent.Create(new { avatar = safeAvatar }));
                return patched.IsSuccessStatusCode;
            }

            var entry = new LeaderboardEntry
            {
                Name = safeName,
                Score = score,
                Seconds = level,
                Text = extra,
                Date = DateTime.Now.ToString("yyyy-MM-dd"),
                Avatar = safeAvatar
            };

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
            var url = $"{FirebaseUrl}/leaderboard/{Uri.EscapeDataString(safeName)}.json";
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

    // Names become database keys and URL path segments, so keep only letters, digits, _ and -.
    // A raw "%2F" would otherwise decode to "/" and write inside another player's entry.
    public static string SanitizeName(string name)
    {
        var chars = name.Trim().Replace(' ', '_').Where(c => char.IsLetterOrDigit(c) || c is '_' or '-').Take(20).ToArray();
        return chars.Length == 0 ? "Anonymous" : new string(chars);
    }

    // One malformed entry must not blank the whole board, so entries are parsed one by one.
    private static List<LeaderboardEntry> ParseEntries(string json)
    {
        var entries = new List<LeaderboardEntry>();
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Object) return entries;
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            foreach (var prop in doc.RootElement.EnumerateObject())
            {
                try
                {
                    var e = prop.Value.Deserialize<LeaderboardEntry>(options);
                    if (e != null && !string.IsNullOrWhiteSpace(e.Name)) entries.Add(e);
                }
                catch (JsonException) { }
            }
        }
        catch (JsonException) { }
        return entries.OrderByDescending(e => e.Score).ToList();
    }
}
