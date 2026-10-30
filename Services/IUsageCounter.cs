namespace MathVoyager.Services;

public interface IUsageCounter
{
    // kind is "subject", "topic", "lesson" or "course"; id is the content id, never anything about the player.
    Task CountAsync(string kind, string id);
    Task FlushAsync();
    Task ClearAsync();
}
