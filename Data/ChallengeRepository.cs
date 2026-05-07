using System.Net.Http.Json;
using MathVoyager.Models;

namespace MathVoyager.Data;

public class ChallengeRepository : IChallengeRepository
{
    private readonly HttpClient _http;
    private List<ProofChallenge>? _proofs;
    private List<MistakeChallenge>? _mistakes;
    private readonly Dictionary<string, List<TopicChallenge>> _topicChallenges = new();

    public ChallengeRepository(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<ProofChallenge>> GetProofChallengesAsync()
    {
        _proofs ??= await _http.GetFromJsonAsync<List<ProofChallenge>>("data/proof-challenges.json") ?? new();
        return _proofs;
    }

    public async Task<List<MistakeChallenge>> GetMistakeChallengesAsync()
    {
        _mistakes ??= await _http.GetFromJsonAsync<List<MistakeChallenge>>("data/mistake-challenges.json") ?? new();
        return _mistakes;
    }

    public async Task<List<TopicChallenge>> GetTopicChallengesAsync(string topicId)
    {
        if (!_topicChallenges.ContainsKey(topicId))
        {
            try
            {
                _topicChallenges[topicId] = await _http.GetFromJsonAsync<List<TopicChallenge>>($"data/{topicId}/challenges.json") ?? new();
            }
            catch
            {
                _topicChallenges[topicId] = new();
            }
        }
        return _topicChallenges[topicId];
    }
}
