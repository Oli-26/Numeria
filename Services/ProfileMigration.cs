using System.Text.RegularExpressions;
using MathVoyager.Models;

namespace MathVoyager.Services;

// Lesson, concept and question ids used to collide between topic pairs. One topic of each pair was
// renamed; profiles saved before that store the old, ambiguous ids and are remapped here on load.
public static class ProfileMigration
{
    public const int CurrentSchemaVersion = 1;

    // Lesson counts are a snapshot of each topic at rename time: old lesson numbers above
    // OwnerLessons existed only in the renamed topic, so they are unambiguous.
    public sealed record TopicRename(string TopicId, string OwnerTopicId, string OldPrefix, string NewPrefix, int OwnerLessons);

    public static readonly IReadOnlyList<TopicRename> Renames = new[]
    {
        new TopicRename("cs-compilers", "computation", "comp", "cc", OwnerLessons: 8),
        new TopicRename("cs-networking-advanced", "cs-networks", "net", "neta", OwnerLessons: 5),
        new TopicRename("history-medicine", "history-medieval", "hist-med", "hmed", OwnerLessons: 8),
    };

    private enum Owner { Original, Renamed, Both }

    private static Match MatchOld(TopicRename r, string id) =>
        Regex.Match(id, $@"^{Regex.Escape(r.OldPrefix)}-(?:(?<n>\d+)(?:-c\d+)?|q\d+)$");

    private static string Rewrite(TopicRename r, string id) => r.NewPrefix + id[r.OldPrefix.Length..];

    // For stores already scoped to one topic (review cards, notes, session, runs): no guessing needed.
    public static string RemapForTopic(string? topicId, string id)
    {
        foreach (var r in Renames)
            if (r.TopicId == topicId && MatchOld(r, id).Success) return Rewrite(r, id);
        return id;
    }

    public static bool Migrate(UserProfile p)
    {
        if (p.SchemaVersion >= CurrentSchemaVersion) return false;
        foreach (var r in Renames) MigrateTopic(p, r);
        p.SchemaVersion = CurrentSchemaVersion;
        return true;
    }

    private static void MigrateTopic(UserProfile p, TopicRename r)
    {
        // Resolve ownership before rewriting the topic-scoped evidence below.
        p.LessonsCompleted = Resolve(p, r, p.LessonsCompleted);
        p.ConceptsViewed = Resolve(p, r, p.ConceptsViewed);

        foreach (var c in p.ReviewQueue.Where(c => c.TopicId == r.TopicId))
        {
            c.QuestionId = RemapForTopic(r.TopicId, c.QuestionId);
            c.LessonId = RemapForTopic(r.TopicId, c.LessonId);
            if (c.ConceptId != null) c.ConceptId = RemapForTopic(r.TopicId, c.ConceptId);
        }

        foreach (var q in p.QuizHistory.Where(q => q.TopicId == r.TopicId))
            q.QuizId = RemapForTopic(r.TopicId, q.QuizId);

        foreach (var key in p.ConceptNotes.Keys.ToList())
        {
            var note = p.ConceptNotes[key];
            if (note.TopicId != r.TopicId) continue;
            note.LessonId = RemapForTopic(r.TopicId, note.LessonId);
            var newKey = RemapForTopic(r.TopicId, key);
            if (newKey == key) continue;
            p.ConceptNotes.Remove(key);
            p.ConceptNotes[newKey] = note;
        }
    }

    private static List<string> Resolve(UserProfile p, TopicRename r, List<string> ids)
    {
        var result = new List<string>();
        foreach (var id in ids)
        {
            var m = MatchOld(r, id);
            if (!m.Success || !m.Groups["n"].Success) { Add(result, id); continue; }

            var lessonId = $"{r.OldPrefix}-{m.Groups["n"].Value}";
            var owner = int.Parse(m.Groups["n"].Value) > r.OwnerLessons ? Owner.Renamed : Decide(p, r, lessonId);
            if (owner != Owner.Renamed) Add(result, id);
            if (owner != Owner.Original) Add(result, Rewrite(r, id));
        }
        return result;
    }

    private static void Add(List<string> list, string id)
    {
        if (!list.Contains(id)) list.Add(id);
    }

    // Lesson-level evidence first; failing that, whether the learner has touched only the renamed
    // topic. Anything still ambiguous stays with the original owner.
    private static Owner Decide(UserProfile p, TopicRename r, string oldLessonId)
    {
        var inRenamed = UsedLesson(p, r.TopicId, oldLessonId);
        var inOwner = UsedLesson(p, r.OwnerTopicId, oldLessonId);
        if (inRenamed && inOwner) return Owner.Both;
        if (inRenamed) return Owner.Renamed;
        if (inOwner) return Owner.Original;
        return Touched(p, r.TopicId) && !Touched(p, r.OwnerTopicId) ? Owner.Renamed : Owner.Original;
    }

    private static bool UsedLesson(UserProfile p, string topicId, string lessonId) =>
        p.TopicsCompleted.Contains(topicId)
        || p.ReviewQueue.Any(c => c.TopicId == topicId && c.LessonId == lessonId)
        || p.QuizHistory.Any(q => q.TopicId == topicId && q.QuizId == lessonId)
        || p.ConceptNotes.Values.Any(n => n.TopicId == topicId && n.LessonId == lessonId);

    private static bool Touched(UserProfile p, string topicId) =>
        p.TopicStatistics.ContainsKey(topicId)
        || p.TopicsCompleted.Contains(topicId)
        || p.TopicMastery.ContainsKey(topicId)
        || p.ReviewQueue.Any(c => c.TopicId == topicId)
        || p.QuizHistory.Any(q => q.TopicId == topicId)
        || p.ConceptNotes.Values.Any(n => n.TopicId == topicId);
}
