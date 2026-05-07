using MathVoyager.Models;

namespace MathVoyager.Data;

public interface IChallengeRepository
{
    Task<List<ProofChallenge>> GetProofChallengesAsync();
    Task<List<MistakeChallenge>> GetMistakeChallengesAsync();
    Task<List<TopicChallenge>> GetTopicChallengesAsync(string topicId);
}
