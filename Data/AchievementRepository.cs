using System.Net.Http.Json;
using MathVoyager.Models;

namespace MathVoyager.Data;

public class AchievementRepository : IAchievementRepository
{
    private readonly HttpClient _http;
    private List<Achievement>? _achievements;

    public AchievementRepository(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<Achievement>> GetAchievementsAsync()
    {
        _achievements ??= await _http.GetFromJsonAsync<List<Achievement>>("data/achievements.json") ?? new();
        return _achievements;
    }
}
