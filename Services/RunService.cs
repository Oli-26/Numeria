using System.Text.Json;
using Microsoft.JSInterop;
using MathVoyager.Data;
using MathVoyager.Models;

namespace MathVoyager.Services;

public class RunService : IRunService
{
    private readonly IJSRuntime _js;
    private readonly IContentRepository _content;
    private readonly IArtifactRepository _artifacts;
    private readonly IProgressService _progress;

    private const int FloorCount = 8;
    private const int MaxColsPerFloor = 3;
    private const int EliteFloor = 4; // 0-indexed: floors 0..7, floor index 4 (5th) is forced Elite
    private const int BossFloor = 7;

    public RunService(IJSRuntime js, IContentRepository content, IArtifactRepository artifacts, IProgressService progress)
    {
        _js = js;
        _content = content;
        _artifacts = artifacts;
        _progress = progress;
    }

    private string Key(string topicId) => $"nous_run_{topicId}";

    public async Task<RunState?> GetActiveRunAsync(string topicId)
    {
        // Returns the saved run regardless of status (Active, Won, Lost).
        // Callers should check Status if they need only active runs.
        var json = await _js.InvokeAsync<string?>("localStorage.getItem", Key(topicId));
        if (string.IsNullOrEmpty(json)) return null;
        try
        {
            var run = JsonSerializer.Deserialize<RunState>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            if (run != null)
                run.SeenQuestionIds = run.SeenQuestionIds.Select(id => ProfileMigration.RemapForTopic(run.TopicId, id)).ToList();
            return run;
        }
        catch (Exception ex) { await _js.LogErrorAsync("RunService.deserialize", ex); }
        return null;
    }

    public async Task SaveRunAsync(RunState run)
    {
        var json = JsonSerializer.Serialize(run, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        await _js.InvokeVoidAsync("localStorage.setItem", Key(run.TopicId), json);
    }

    public async Task AbandonRunAsync(string topicId)
    {
        await _js.InvokeVoidAsync("localStorage.removeItem", Key(topicId));
    }

    public async Task<List<Artifact>> RollStartingArtifactsAsync(int count = 3)
    {
        var all = await _artifacts.GetArtifactsAsync();
        var rng = new Random();
        return all.OrderBy(_ => rng.Next()).Take(count).ToList();
    }

    public async Task<RunState> StartRunAsync(string topicId, List<string> chosenArtifactIds)
    {
        var seed = Random.Shared.Next();
        var run = new RunState
        {
            TopicId = topicId,
            Seed = seed,
            ArtifactIds = chosenArtifactIds,
            Map = GenerateMap(seed),
        };

        // Apply start-of-run artifact effects
        if (run.ArtifactIds.Contains("hilbert-hotel"))
        {
            run.MaxLives = 4;
            run.Lives = 4;
        }

        var profile = await _progress.GetProfileAsync();
        profile.RunsAttempted++;
        await _progress.SaveProfileAsync(profile);

        await SaveRunAsync(run);
        return run;
    }

    public async Task EnterNodeAsync(RunState run, int col)
    {
        run.CurrentCol = col;
        run.FloorHintFreebiesUsed = 0;
        run.DiagonalUsedThisFloor = false;
        await SaveRunAsync(run);
    }

    public async Task<int> ApplyDamageAsync(RunState run, int damage)
    {
        // Galois's Duel: first wrong answer of run does no damage
        if (run.ArtifactIds.Contains("galois-duel") && run.TotalWrong == 1 && damage > 0)
        {
            // We're called after TotalWrong was incremented, so check ==1 after increment
            return 0;
        }

        // Gödel's Incompleteness: if would die, survive at 1 (single use, removed after)
        if (run.ArtifactIds.Contains("godel-incompleteness") && run.Lives - damage <= 0)
        {
            run.Lives = 1;
            run.ArtifactIds.Remove("godel-incompleteness");
            await SaveRunAsync(run);
            return damage;
        }

        run.Lives = Math.Max(0, run.Lives - damage);
        if (run.Lives == 0)
        {
            run.Status = RunStatus.Lost;
        }
        await SaveRunAsync(run);
        return damage;
    }

    public async Task CompleteEncounterAsync(RunState run, bool boss)
    {
        if (run.Status != RunStatus.Active) return;

        if (run.CurrentCol.HasValue)
        {
            var node = run.Map[run.CurrentFloor][run.CurrentCol.Value];
            node.Visited = true;
        }

        if (boss)
        {
            run.Status = RunStatus.Won;
        }
        else
        {
            run.CurrentFloor++;
            run.CurrentCol = null;
        }

        await SaveRunAsync(run);
    }

    public async Task<int> AwardRunRewardsAsync(RunState run)
    {
        var baseXp = run.TotalCorrect * 5 + 200; // boss bonus baked in

        // Multipliers
        var mult = 1.0;
        if (run.ArtifactIds.Contains("euler-identity")) mult += 0.25;
        if (run.ArtifactIds.Contains("turing-tape")) mult += 0.50;

        var xp = (int)(baseXp * mult);
        run.XpEarnedSoFar += xp;

        var profile = await _progress.GetProfileAsync();
        if (run.Status == RunStatus.Won)
        {
            if (!profile.RunSeals.Contains(run.TopicId))
                profile.RunSeals.Add(run.TopicId);
            profile.RunsWon++;
        }
        await _progress.SaveProfileAsync(profile);
        return xp;
    }

    public int GetEncounterQuestionCount(RunState run, RunNodeType nodeType)
    {
        var pythagoras = run.ArtifactIds.Contains("pythagoras-triangle");
        return nodeType switch
        {
            RunNodeType.Enemy => 1,
            RunNodeType.Elite => pythagoras ? 2 : 3,
            RunNodeType.Boss => 3,
            _ => 1,
        };
    }

    public async Task<List<Question>> RollQuestionsForNodeAsync(RunState run, RunNodeType nodeType)
    {
        var supportedTypes = new[] {
            QuestionType.MultipleChoice, QuestionType.FillIn,
            QuestionType.TrueOrFalse, QuestionType.VisualIdentify,
            QuestionType.MultipleSelect, QuestionType.NumericInput
        };

        List<Question> pool;
        if (nodeType == RunNodeType.Enemy)
        {
            pool = await _content.GetQuestionsAsync(run.TopicId);
        }
        else
        {
            pool = await _content.GetMasteryQuestionsAsync(run.TopicId);
            if (pool.Count == 0)
            {
                var regular = await _content.GetQuestionsAsync(run.TopicId);
                pool = regular.Where(q => q.Difficulty >= 2).ToList();
            }
        }

        pool = pool.Where(q => supportedTypes.Contains(q.Type) && !run.SeenQuestionIds.Contains(q.Id)).ToList();

        var count = GetEncounterQuestionCount(run, nodeType);
        if (pool.Count < count)
        {
            // Allow re-using seen questions when pool exhausted
            var fallback = await _content.GetQuestionsAsync(run.TopicId);
            fallback = fallback.Where(q => supportedTypes.Contains(q.Type)).ToList();
            pool.AddRange(fallback);
        }

        var rng = new Random(run.Seed * 31 + run.CurrentFloor * 7 + (run.CurrentCol ?? 0));
        var picked = pool.OrderBy(_ => rng.Next()).Take(count).ToList();

        foreach (var p in picked)
        {
            if (!run.SeenQuestionIds.Contains(p.Id)) run.SeenQuestionIds.Add(p.Id);
        }
        await SaveRunAsync(run);

        return picked;
    }

    private List<List<RunNode>> GenerateMap(int seed)
    {
        var rng = new Random(seed);
        var map = new List<List<RunNode>>();

        for (int f = 0; f < FloorCount; f++)
        {
            var cols = f == BossFloor ? 1 : (f == 0 ? 2 : rng.Next(2, MaxColsPerFloor + 1));
            var floor = new List<RunNode>();
            for (int c = 0; c < cols; c++)
            {
                var type = RunNodeType.Enemy;
                if (f == BossFloor) type = RunNodeType.Boss;
                else if (f == EliteFloor) type = RunNodeType.Elite;
                else if (f > 0 && rng.NextDouble() < 0.15) type = RunNodeType.Elite;

                floor.Add(new RunNode { Floor = f, Col = c, Type = type });
            }
            map.Add(floor);
        }

        // Wire edges: each node connects to 1-2 nodes on next floor (overlapping)
        for (int f = 0; f < FloorCount - 1; f++)
        {
            var cur = map[f];
            var next = map[f + 1];
            foreach (var node in cur)
            {
                // Map column proportionally to next floor's columns
                var ratio = next.Count == 1 ? 0 : (double)node.Col / Math.Max(1, cur.Count - 1);
                var center = next.Count == 1 ? 0 : (int)Math.Round(ratio * (next.Count - 1));
                var edges = new HashSet<int> { center };
                if (next.Count > 1)
                {
                    var off = rng.Next(0, 2) == 0 ? -1 : 1;
                    var alt = Math.Clamp(center + off, 0, next.Count - 1);
                    if (alt != center) edges.Add(alt);
                }
                node.Edges = edges.OrderBy(x => x).ToList();
            }

            // Ensure every node on next floor is reachable from at least one node on current floor
            var reachable = cur.SelectMany(n => n.Edges).ToHashSet();
            for (int c = 0; c < next.Count; c++)
            {
                if (!reachable.Contains(c))
                {
                    var nearest = cur.OrderBy(n => Math.Abs(n.Col - c)).First();
                    if (!nearest.Edges.Contains(c))
                    {
                        nearest.Edges.Add(c);
                        nearest.Edges = nearest.Edges.OrderBy(x => x).ToList();
                    }
                }
            }
        }

        return map;
    }
}
