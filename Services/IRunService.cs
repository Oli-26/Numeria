using MathVoyager.Models;

namespace MathVoyager.Services;

public interface IRunService
{
    Task<RunState?> GetActiveRunAsync(string topicId);
    Task<RunState> StartRunAsync(string topicId, List<string> chosenArtifactIds);
    Task<List<Artifact>> RollStartingArtifactsAsync(int count = 3);
    Task SaveRunAsync(RunState run);
    Task EnterNodeAsync(RunState run, int col);
    Task<int> ApplyDamageAsync(RunState run, int damage);
    Task CompleteEncounterAsync(RunState run, bool boss);
    Task<int> AwardRunRewardsAsync(RunState run);
    Task AbandonRunAsync(string topicId);

    // Encounter helpers
    int GetEncounterQuestionCount(RunState run, RunNodeType nodeType);
    Task<List<Question>> RollQuestionsForNodeAsync(RunState run, RunNodeType nodeType);
}
