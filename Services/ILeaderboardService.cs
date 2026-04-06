namespace MathVoyager.Services;

public class LeaderboardEntry
{
    public string Name { get; set; } = "";
    public int Score { get; set; }
    public int Seconds { get; set; }
    public string Text { get; set; } = "";
    public string Date { get; set; } = "";
}

public interface ILeaderboardService
{
    Task<bool> SubmitScoreAsync(string name, int score, int level, string extra);
    Task<List<LeaderboardEntry>> GetLeaderboardAsync(int count = 50);
    Task<LeaderboardEntry?> GetPlayerScoreAsync(string name);
    bool IsConfigured { get; }
}
