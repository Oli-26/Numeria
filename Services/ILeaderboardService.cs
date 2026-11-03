namespace MathVoyager.Services;

public class LeaderboardEntry
{
    public string Name { get; set; } = "";
    public int Score { get; set; }
    public int Seconds { get; set; }
    public string Text { get; set; } = "";
    public string Date { get; set; } = "";
    // A HallOfFame card id; anything that does not resolve to a known card is shown as the initial.
    public string? Avatar { get; set; }
    // Added in the app by LeaderboardSeeds, never stored; such an entry is never "you" and never makes a name taken.
    [System.Text.Json.Serialization.JsonIgnore]
    public bool IsSeed { get; init; }
}

public interface ILeaderboardService
{
    Task<bool> SubmitScoreAsync(string name, int score, int level, string extra, string? avatar = null);
    // Null means the leaderboard could not be loaded (offline/error); an empty
    // list means it loaded fine and there are no scores yet.
    Task<List<LeaderboardEntry>?> GetLeaderboardAsync(int count = 50);
    Task<LeaderboardEntry?> GetPlayerScoreAsync(string name);
    bool IsConfigured { get; }
}
