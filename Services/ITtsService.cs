using MathVoyager.Models;

namespace MathVoyager.Services;

public class TtsVoice
{
    public string Name { get; set; } = "";
    public string Lang { get; set; } = "";
}

public interface ITtsService
{
    Task<List<TtsVoice>> GetVoicesAsync();
    Task SpeakConceptAsync(Concept concept, double rate = 1.0, string? voice = null, CancellationToken cancellationToken = default);
    Task PauseAsync();
    Task ResumeAsync();
    Task StopAsync();
    Task<bool> IsSpeakingAsync();
    Task<bool> IsPausedAsync();
    Task<bool> IsSupportedAsync();
}
