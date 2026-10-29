namespace MathVoyager.Services;

// Ranks seen on the last leaderboard visit, kept on the device, give each row its up or down arrow.
public static class LeaderboardRanks
{
    // Names are stored sanitised, so a display name is compared in the form it would be posted under.
    public static string Key(string? name) => LeaderboardService.SanitizeName(name ?? "").ToLowerInvariant();

    public static Dictionary<string, int> Of(IReadOnlyList<LeaderboardEntry> entries)
    {
        var ranks = new Dictionary<string, int>();
        for (int i = 0; i < entries.Count; i++) ranks.TryAdd(Key(entries[i].Name), i + 1);
        return ranks;
    }

    // Places climbed since the last visit (negative for a drop); null when there is nothing to compare against.
    public static int? Moved(IReadOnlyDictionary<string, int>? previous, string name, int rank) =>
        previous != null && previous.TryGetValue(Key(name), out var before) ? before - rank : null;

    public static bool IsNew(IReadOnlyDictionary<string, int>? previous, string name) =>
        previous is { Count: > 0 } && !previous.ContainsKey(Key(name));
}
