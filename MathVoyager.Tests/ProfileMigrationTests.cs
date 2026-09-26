using System.Text.Json;
using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class ProfileMigrationTests
{
    private static readonly JsonSerializerOptions Read = new() { PropertyNameCaseInsensitive = true };
    private static readonly JsonSerializerOptions Write = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    // Saved before the rename: no schemaVersion, old ambiguous ids.
    private const string OldProfileJson = """
    {
      "displayName": "Ada",
      "lessonsCompleted": ["comp-01", "comp-02", "comp-09", "net-01", "net-06", "hist-med-02", "calc-01"],
      "conceptsViewed": ["comp-01-c1", "comp-02-c1", "comp-09-c2", "net-06-c1", "hist-med-02-c3", "calc-01-c1"],
      "reviewQueue": [
        { "questionId": "comp-q05", "conceptId": "comp-02-c1", "topicId": "cs-compilers", "lessonId": "comp-02", "nextReview": "2026-01-01" },
        { "questionId": "comp-q01", "topicId": "computation", "lessonId": "comp-01", "nextReview": "2026-01-01" }
      ],
      "quizHistory": [
        { "quizId": "comp-01", "topicId": "computation", "score": 80 },
        { "quizId": "comp-02", "topicId": "cs-compilers", "score": 100 },
        { "quizId": "synth-1", "topicId": null, "score": 50 }
      ],
      "topicStatistics": { "computation": {}, "cs-compilers": {}, "cs-networking-advanced": {} },
      "conceptNotes": {
        "hist-med-02-c3": { "topicId": "history-medicine", "lessonId": "hist-med-02", "text": "mine" },
        "comp-01-c1": { "topicId": "computation", "lessonId": "comp-01", "text": "keep" }
      }
    }
    """;

    private static UserProfile Load(string json) => JsonSerializer.Deserialize<UserProfile>(json, Read)!;

    [Fact]
    public void OldProfile_IsRemappedUsingStoredTopicContext()
    {
        var p = Load(OldProfileJson);
        Assert.Equal(0, p.SchemaVersion);

        Assert.True(ProfileMigration.Migrate(p));

        Assert.Equal(ProfileMigration.CurrentSchemaVersion, p.SchemaVersion);
        // comp-01: quiz record ties it to computation; comp-02: card + quiz tie it to cs-compilers;
        // comp-09/net-06 only ever existed in the renamed topic; net-01: only cs-networking-advanced was
        // ever touched; hist-med-02: the note ties it to history-medicine.
        Assert.Equal(new[] { "comp-01", "cc-02", "cc-09", "neta-01", "neta-06", "hmed-02", "calc-01" }, p.LessonsCompleted);
        Assert.Equal(new[] { "comp-01-c1", "cc-02-c1", "cc-09-c2", "neta-06-c1", "hmed-02-c3", "calc-01-c1" }, p.ConceptsViewed);

        var cc = p.ReviewQueue.Single(c => c.TopicId == "cs-compilers");
        Assert.Equal(("cc-q05", "cc-02-c1", "cc-02"), (cc.QuestionId, cc.ConceptId, cc.LessonId));
        var comp = p.ReviewQueue.Single(c => c.TopicId == "computation");
        Assert.Equal(("comp-q01", null, "comp-01"), (comp.QuestionId, comp.ConceptId, comp.LessonId));

        Assert.Equal(new[] { "comp-01", "cc-02", "synth-1" }, p.QuizHistory.Select(q => q.QuizId));

        Assert.Equal(new[] { "comp-01-c1", "hmed-02-c3" }, p.ConceptNotes.Keys.OrderBy(k => k));
        Assert.Equal("hmed-02", p.ConceptNotes["hmed-02-c3"].LessonId);
        Assert.Equal("mine", p.ConceptNotes["hmed-02-c3"].Text);
    }

    [Fact]
    public void BothTopicsTouched_NoLessonEvidence_StaysWithOriginalOwner()
    {
        var p = Load("""
        { "lessonsCompleted": ["net-02"], "conceptsViewed": ["net-02-c1"],
          "topicStatistics": { "cs-networks": {}, "cs-networking-advanced": {} } }
        """);
        ProfileMigration.Migrate(p);
        Assert.Equal(new[] { "net-02" }, p.LessonsCompleted);
        Assert.Equal(new[] { "net-02-c1" }, p.ConceptsViewed);
    }

    [Fact]
    public void NeitherTopicTouched_StaysWithOriginalOwner()
    {
        var p = Load("""{ "lessonsCompleted": ["hist-med-01"], "conceptsViewed": ["hist-med-01-c2"] }""");
        ProfileMigration.Migrate(p);
        Assert.Equal(new[] { "hist-med-01" }, p.LessonsCompleted);
        Assert.Equal(new[] { "hist-med-01-c2" }, p.ConceptsViewed);
    }

    [Fact]
    public void EvidenceInBothTopics_KeepsCompletionInBoth()
    {
        var p = Load("""
        { "lessonsCompleted": ["comp-03"], "conceptsViewed": ["comp-03-c2"],
          "quizHistory": [ { "quizId": "comp-03", "topicId": "computation" }, { "quizId": "comp-03", "topicId": "cs-compilers" } ] }
        """);
        ProfileMigration.Migrate(p);
        Assert.Equal(new[] { "comp-03", "cc-03" }, p.LessonsCompleted);
        Assert.Equal(new[] { "comp-03-c2", "cc-03-c2" }, p.ConceptsViewed);
        Assert.Equal(new[] { "comp-03", "cc-03" }, p.QuizHistory.Select(q => q.QuizId));
    }

    [Fact]
    public void CompletedTopic_ClaimsItsLessons()
    {
        var p = Load("""{ "lessonsCompleted": ["hist-med-04"], "topicsCompleted": ["history-medicine"], "topicStatistics": { "history-medieval": {} } }""");
        ProfileMigration.Migrate(p);
        Assert.Equal(new[] { "hmed-04" }, p.LessonsCompleted);
    }

    [Fact]
    public void Migration_IsIdempotent_AndSkippedOnceVersioned()
    {
        var p = Load(OldProfileJson);
        ProfileMigration.Migrate(p);
        var once = JsonSerializer.Serialize(p, Write);

        Assert.False(ProfileMigration.Migrate(p));
        p.SchemaVersion = 0;
        ProfileMigration.Migrate(p);
        Assert.Equal(once, JsonSerializer.Serialize(p, Write));

        var reloaded = Load(once);
        Assert.False(ProfileMigration.Migrate(reloaded));
        Assert.Equal(once, JsonSerializer.Serialize(reloaded, Write));
    }

    [Fact]
    public void Migration_NeverDropsEntries()
    {
        var before = Load(OldProfileJson);
        var after = Load(OldProfileJson);
        ProfileMigration.Migrate(after);
        Assert.True(after.LessonsCompleted.Count >= before.LessonsCompleted.Count);
        Assert.True(after.ConceptsViewed.Count >= before.ConceptsViewed.Count);
        Assert.Equal(before.ReviewQueue.Count, after.ReviewQueue.Count);
        Assert.Equal(before.QuizHistory.Count, after.QuizHistory.Count);
        Assert.Equal(before.ConceptNotes.Count, after.ConceptNotes.Count);
    }

    [Fact]
    public void RemapForTopic_OnlyTouchesTheRenamedTopicsOldIds()
    {
        Assert.Equal("neta-q12", ProfileMigration.RemapForTopic("cs-networking-advanced", "net-q12"));
        Assert.Equal("net-q12", ProfileMigration.RemapForTopic("cs-networks", "net-q12"));
        Assert.Equal("neta-03", ProfileMigration.RemapForTopic("cs-networking-advanced", "neta-03"));
        Assert.Equal("comp-01", ProfileMigration.RemapForTopic(null, "comp-01"));
        Assert.Equal("mastery-comp-1", ProfileMigration.RemapForTopic("cs-compilers", "mastery-comp-1"));
    }

    [Fact]
    public void SavedSession_ForRenamedTopic_IsRemapped()
    {
        var s = new SessionState
        {
            ActiveTopicId = "cs-compilers", ActiveLessonId = "comp-04",
            QuizState = new QuizSessionState { TopicId = "cs-compilers", LessonId = "comp-04", QuestionIds = { "comp-q30", "comp-q31" } }
        };
        SessionStateService.RemapIds(s);
        Assert.Equal("cc-04", s.ActiveLessonId);
        Assert.Equal("cc-04", s.QuizState!.LessonId);
        Assert.Equal(new[] { "cc-q30", "cc-q31" }, s.QuizState.QuestionIds);
    }
}
