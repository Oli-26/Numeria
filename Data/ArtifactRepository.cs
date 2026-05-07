using System.Net.Http.Json;
using MathVoyager.Models;

namespace MathVoyager.Data;

public class ArtifactRepository : IArtifactRepository
{
    private readonly HttpClient _http;
    private List<Artifact>? _cache;

    public ArtifactRepository(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<Artifact>> GetArtifactsAsync()
    {
        _cache ??= await _http.GetFromJsonAsync<List<Artifact>>("data/run-artifacts.json") ?? new();
        return _cache;
    }

    public async Task<Artifact?> GetArtifactAsync(string id)
    {
        var all = await GetArtifactsAsync();
        return all.FirstOrDefault(a => a.Id == id);
    }
}
