using System.Text.Json;
using MathVoyager.Data;
using MathVoyager.Models;

namespace MathVoyager.Tests;

// Guards the static JSON the app ships: every id a feature file points at must exist.
public class ContentDataTests
{
    private static readonly JsonSerializerOptions Opts = new() { PropertyNameCaseInsensitive = true };
    private static readonly string Data = FindData();

    private static string FindData()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "MathVoyager.csproj"))) dir = dir.Parent;
        return Path.Combine(dir!.FullName, "wwwroot", "data");
    }

    private static T Load<T>(string rel) => JsonSerializer.Deserialize<T>(File.ReadAllText(Path.Combine(Data, rel)), Opts)!;

    private static List<Topic> Topics => Load<List<Topic>>("topics.json");

    private static List<Lesson> Lessons(string topicId) =>
        File.Exists(Path.Combine(Data, topicId, "lessons.json")) ? Load<List<Lesson>>(Path.Combine(topicId, "lessons.json")) : new();

    [Fact]
    public void Graph_CoversEveryTopic_AndEveryEdgeHasAWhy()
    {
        var ids = Topics.Select(t => t.Id).ToHashSet();
        var graph = Load<TopicGraphData>("topic-graph.json");
        Assert.All(graph.Edges, e =>
        {
            Assert.Contains(e.From, ids);
            Assert.Contains(e.To, ids);
            Assert.False(string.IsNullOrWhiteSpace(e.Why), $"{e.From}->{e.To} has no why");
        });
        var touched = graph.Edges.SelectMany(e => new[] { e.From, e.To }).ToHashSet();
        Assert.Empty(ids.Where(id => !touched.Contains(id)));
    }

    [Fact]
    public void Paths_AndBigQuestions_PointAtRealLessons()
    {
        var steps = Load<List<LearningPath>>("paths.json").SelectMany(p => p.Steps)
            .Concat(Load<List<BigQuestion>>("big-questions.json").SelectMany(b => b.Lessons));
        Assert.All(steps, s => Assert.Contains(Lessons(s.TopicId), l => l.Id == s.LessonId));

        var pathIds = Load<List<LearningPath>>("paths.json").Select(p => p.Id).ToHashSet();
        Assert.All(Load<List<BigQuestion>>("big-questions.json"), b =>
        {
            Assert.All(b.PathIds, id => Assert.Contains(id, pathIds));
            Assert.All(b.SimulatorRoutes, r => Assert.NotNull(MathVoyager.Services.SimulatorCatalog.ByRoute(r)));
        });
    }

    [Fact]
    public void ConceptExtras_TargetExistingConcepts_WithValidDiscoveries()
    {
        var extras = Load<Dictionary<string, ConceptExtra>>("concept-extras.json");
        var concepts = Topics.SelectMany(t => Lessons(t.Id).SelectMany(l => l.Concepts.Select(c => (c.Id, l.Id)))).ToList();
        foreach (var (id, x) in extras)
        {
            Assert.Contains(concepts, c => c.Item1 == id);
            if (x.Discovery is { Type: QuestionType.MultipleChoice } d)
                Assert.Contains(d.CorrectAnswer, d.Options!);
            if (x.VisualizationType != null)
                Assert.Contains(x.VisualizationType, MathVoyager.Components.DataWidget.Types);
        }
    }

    [Fact]
    public void EveryLessonWithConcepts_HasQuizQuestions()
    {
        var missing = new List<string>();
        foreach (var t in Topics)
        {
            var qPath = Path.Combine(Data, t.Id, "questions.json");
            var qs = File.Exists(qPath) ? Load<List<Question>>(Path.Combine(t.Id, "questions.json")) : new();
            foreach (var l in Lessons(t.Id).Where(l => l.Concepts.Count > 0))
                if (!qs.Any(q => q.LessonId == l.Id)) missing.Add($"{t.Id}/{l.Id}");
        }
        Assert.Empty(missing);
    }

    // Progress, review cards and notes key on these ids globally, so a clash leaks progress between topics.
    [Fact]
    public void LessonConceptAndQuestionIds_AreGloballyUnique()
    {
        var seen = new Dictionary<string, string>();
        var clashes = new List<string>();
        void Claim(string id, string where)
        {
            if (!seen.TryAdd(id, where)) clashes.Add($"{id}: {seen[id]} vs {where}");
        }
        foreach (var t in Topics)
        {
            foreach (var l in Lessons(t.Id))
            {
                Claim(l.Id, t.Id);
                foreach (var c in l.Concepts) Claim(c.Id, t.Id);
            }
            foreach (var file in new[] { "questions.json", "mastery-questions.json" })
                if (File.Exists(Path.Combine(Data, t.Id, file)))
                    foreach (var q in Load<List<Question>>(Path.Combine(t.Id, file))) Claim(q.Id, t.Id);
            if (File.Exists(Path.Combine(Data, t.Id, "challenges.json")))
                foreach (var ch in Load<List<TopicChallenge>>(Path.Combine(t.Id, "challenges.json"))) Claim(ch.Id, t.Id);
        }
        Assert.Empty(clashes);
    }

    [Fact]
    public void RenamedTopics_NoLongerUseTheirOldPrefix()
    {
        foreach (var r in MathVoyager.Services.ProfileMigration.Renames)
        {
            var lessons = Lessons(r.TopicId);
            Assert.NotEmpty(lessons);
            Assert.All(lessons, l => Assert.StartsWith(r.NewPrefix + "-", l.Id));
            Assert.Contains(Lessons(r.OwnerTopicId), l => l.Id.StartsWith(r.OldPrefix + "-"));
        }
    }

    [Fact]
    public void ShopNoLongerSellsSimulators()
    {
        var shop = Load<List<ShopItem>>("shop.json");
        foreach (var sim in MathVoyager.Services.SimulatorCatalog.All)
            Assert.DoesNotContain(shop, i => i.UnlockData.TryGetValue("feature", out var f) && "/" + f == sim.Route);
    }
}
