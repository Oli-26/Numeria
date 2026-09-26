using MathVoyager.Data;
using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class ExprEvalTests
{
    private static double E(string expr, double x = 0, double p = 0) =>
        ExprEval.Eval(expr, new Dictionary<string, double> { ["x"] = x, ["p"] = p });

    [Theory]
    [InlineData("1 + 2 * 3", 7)]
    [InlineData("(1 + 2) * 3", 9)]
    [InlineData("2 ^ 3 ^ 2", 512)]
    [InlineData("-2 ^ 2", -4)]
    [InlineData("100 - x + p", 97)]
    [InlineData("1 / (1 - 0.8)", 5)]
    [InlineData("max(1, x, 2)", 3)]
    [InlineData("sqrt(16) + abs(-1)", 5)]
    [InlineData("2e3", 2000)]
    public void Evaluates(string expr, double expected) => Assert.Equal(expected, E(expr, x: 3, p: 0), 9);

    [Theory]
    [InlineData("1 +")]
    [InlineData("foo(2)")]
    [InlineData("y + 1")]
    [InlineData("(1 + 2")]
    public void Garbage_IsNaN(string expr) => Assert.True(double.IsNaN(E(expr)));
}

public class ShuffleTests
{
    [Fact]
    public void LetterReferencingOptions_AreNeverShuffled()
    {
        var opts = new List<string> { "One", "Two", "Three", "Both B and C" };
        for (int i = 0; i < 30; i++)
        {
            var q = new Question { Options = new List<string>(opts) };
            ContentRepository.ShuffleOptionsInPlace(new[] { q });
            Assert.Equal(opts, q.Options);
        }
    }

    [Fact]
    public void AllOfTheAbove_StaysLast()
    {
        for (int i = 0; i < 30; i++)
        {
            var q = new Question { Options = new List<string> { "A thing", "Another", "A third", "All of the above" } };
            ContentRepository.ShuffleOptionsInPlace(new[] { q });
            Assert.Equal("All of the above", q.Options![^1]);
            Assert.Equal(4, q.Options.Distinct().Count());
        }
    }
}

public class ConceptMatcherTests
{
    private static Lesson L() => new()
    {
        Id = "l1",
        Concepts = new()
        {
            new Concept { Id = "c1", Title = "Mitochondria", ContentHtml = "<p>Mitochondria make ATP by respiration in the cell.</p>" },
            new Concept { Id = "c2", Title = "The Nucleus", ContentHtml = "<p>The nucleus stores DNA and chromosomes in the cell.</p>" },
        }
    };

    [Fact]
    public void PicksConceptWithDistinctiveOverlap()
    {
        var q = new Question { LessonId = "l1", Prompt = "Which organelle stores the cell's DNA?", CorrectAnswer = "Nucleus" };
        Assert.Equal("c2", ConceptMatcher.BestConceptId(q, L()));
    }

    [Fact]
    public void ExplicitConceptId_IsKept()
    {
        var q = new Question { LessonId = "l1", ConceptId = "c1", Prompt = "Where is DNA stored?" };
        ConceptMatcher.Assign(new[] { q }, new[] { L() });
        Assert.Equal("c1", q.ConceptId);
    }

    [Fact]
    public void NoOverlap_FallsBackToFirstConcept()
    {
        var q = new Question { LessonId = "l1", Prompt = "Zzz?" };
        Assert.Equal("c1", ConceptMatcher.BestConceptId(q, L()));
    }
}

public class ContentExtrasTests
{
    [Fact]
    public void ApplyExtras_LayersFieldsWithoutOverwritingInlineContent()
    {
        var lesson = new Lesson
        {
            Id = "l1",
            Concepts = new() { new Concept { Id = "c1", ContentHtml = "std", ModelSummary = "inline" } }
        };
        var extras = new Dictionary<string, ConceptExtra>
        {
            ["c1"] = new()
            {
                ModelSummary = "overlay",
                ContentHtmlDeep = "deep",
                VisualizationType = "timeline",
                Discovery = new Question { Id = "d", Type = QuestionType.TrueOrFalse, CorrectAnswer = "True" }
            }
        };

        ContentRepository.ApplyExtras(new[] { lesson }, extras);
        var c = lesson.Concepts[0];

        Assert.Equal("inline", c.ModelSummary);
        Assert.Equal("deep", c.ContentHtmlDeep);
        Assert.Equal("timeline", c.VisualizationType);
        Assert.Equal("l1", c.Discovery!.LessonId);
        Assert.Equal("c1", c.Discovery.ConceptId);
    }
}

public class SimulatorCatalogTests
{
    [Fact]
    public void PlacesSimulatorOnBestMatchingConcept()
    {
        var lesson = new Lesson
        {
            Concepts = new()
            {
                new Concept { Id = "c1", Title = "Intro", ContentHtml = "Markets exist." },
                new Concept { Id = "c2", Title = "Equilibrium", ContentHtml = "Supply meets demand at equilibrium; a price ceiling causes shortage." },
            }
        };
        var placed = SimulatorCatalog.PlaceInLesson(lesson, "econ-micro");
        Assert.True(placed.ContainsKey("c2"));
        Assert.Equal("/market-sim", placed["c2"].Route);
        Assert.False(placed.ContainsKey("c1"));
    }

    [Fact]
    public void ExplicitRoute_Wins_EvenOutsideMappedTopics()
    {
        var lesson = new Lesson { Concepts = new() { new Concept { Id = "c1", SimulatorRoute = "/deep-time" } } };
        Assert.Equal("/deep-time", SimulatorCatalog.PlaceInLesson(lesson, "calculus")["c1"].Route);
    }

    [Fact]
    public void UnmappedTopic_WithoutKeywords_GetsNothing()
    {
        var lesson = new Lesson { Concepts = new() { new Concept { Id = "c1", Title = "Limits", ContentHtml = "Approach a value." } } };
        Assert.Empty(SimulatorCatalog.PlaceInLesson(lesson, "calculus"));
    }
}

public class RecommenderTests
{
    private static readonly List<Topic> Topics = new()
    {
        new() { Id = "calc", Name = "Calculus", Domain = "math", Tier = 1 },
        new() { Id = "de", Name = "Diff Eq", Domain = "math", Tier = 2 },
        new() { Id = "mech", Name = "Mechanics", Domain = "physics", Tier = 1 },
        new() { Id = "econ", Name = "Economics", Domain = "economics", Tier = 1 },
    };

    private static readonly List<TopicEdge> Edges = new()
    {
        new() { From = "calc", To = "de", Type = "prereq", Strength = 0.9, Why = "Derivatives are the language of ODEs." },
        new() { From = "calc", To = "mech", Type = "related", Strength = 0.8, Why = "Newton invented calculus for motion." },
        new() { From = "mech", To = "econ", Type = "related", Strength = 0.3, Why = "Equilibrium ideas." },
    };

    [Fact]
    public void NextSteps_SameField_RespectsLocks()
    {
        var p = new UserProfile();
        p.TopicStatistics["calc"] = new TopicStats();

        // de is tier 2 and calc is not completed yet, so it is locked.
        Assert.Empty(Recommender.NextSteps(Topics, Edges, p, otherFields: false));

        p.TopicsCompleted.Add("calc");
        var next = Recommender.NextSteps(Topics, Edges, p, otherFields: false);
        Assert.Equal("de", Assert.Single(next).Topic.Id);
        Assert.StartsWith("Builds on", next[0].Reason);
    }

    [Fact]
    public void NextSteps_OtherFields_CarriesWhy()
    {
        var p = new UserProfile();
        p.TopicStatistics["calc"] = new TopicStats();
        var nearby = Recommender.NextSteps(Topics, Edges, p, otherFields: true);
        var s = Assert.Single(nearby);
        Assert.Equal("mech", s.Topic.Id);
        Assert.Equal("Newton invented calculus for motion.", s.Why);
    }

    [Fact]
    public void Echoes_PreferCrossDomainEdgesAndSynthesis()
    {
        var syn = new List<SynthesisQuiz>
        {
            new() { Id = "syn", Title = "Syn", Description = "Cross", RequiredTopicIds = new() { "calc", "econ" } }
        };
        var echoes = Recommender.Echoes("calc", Topics, Edges, syn);
        Assert.Equal(2, echoes.Count);
        Assert.Equal("mech", echoes[0].TopicId);
        Assert.Equal("syn", echoes[1].SynthesisQuizId);
    }

    [Fact]
    public void DailyPick_IsStableForADate()
    {
        var candidates = new List<string> { "a", "b", "c", "d", "e" };
        var day = new DateTime(2026, 9, 25);
        Assert.Equal(Recommender.PickDailyTopic(candidates, day), Recommender.PickDailyTopic(candidates, day));
    }

    [Fact]
    public void DailyCandidates_NewUser_FallsBackToTierOne()
    {
        var c = Recommender.DailyCandidates(Topics, Edges, new UserProfile());
        Assert.DoesNotContain("de", c);
        Assert.Contains("calc", c);
    }

    [Fact]
    public void NextLesson_SkipsCompletedAndStubs()
    {
        var p = new UserProfile();
        p.LessonsCompleted.Add("l1");
        var lessons = new List<Lesson>
        {
            new() { Id = "l1", Order = 1, Concepts = new() { new Concept() } },
            new() { Id = "l2", Order = 2 },
            new() { Id = "l3", Order = 3, Concepts = new() { new Concept() } },
        };
        Assert.Equal("l3", Recommender.NextLesson(lessons, p)!.Id);
    }
}

public class QuizHistoryTrimTests
{
    [Fact]
    public void Trim_FoldsOldRecordsIntoAggregates()
    {
        var p = new UserProfile();
        for (int i = 0; i < 10; i++)
            p.QuizHistory.Add(new QuizRecord { Score = i == 0 ? 100 : 50 });

        ProgressService.TrimQuizHistory(p, max: 4);

        Assert.Equal(4, p.QuizHistory.Count);
        Assert.Equal(10, p.TotalQuizCount);
        Assert.Equal(1, p.PerfectQuizCount);
        Assert.Equal(100, p.BestQuizScore);
        Assert.Equal(55, p.AverageQuizScore);
    }
}
