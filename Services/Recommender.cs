using MathVoyager.Models;

namespace MathVoyager.Services;

public class TopicSuggestion
{
    public Topic Topic { get; set; } = null!;
    public string Reason { get; set; } = "";
    public string? Why { get; set; }
}

// Pure graph logic behind home recommendations, echoes and the daily pick.
public static class Recommender
{
    public static HashSet<string> KnownTopics(UserProfile p) =>
        p.TopicStatistics.Keys.Concat(p.TopicsCompleted).ToHashSet();

    public static bool IsLocked(Topic t, IReadOnlyList<TopicEdge> edges, UserProfile p) =>
        t.Tier > 1 && edges.Any(e => e.To == t.Id && e.Type == "prereq" && !p.TopicsCompleted.Contains(e.From));

    private static DateTime LastTouched(UserProfile p, string topicId)
    {
        var last = p.QuizHistory.Where(q => q.TopicId == topicId).Select(q => q.Date).DefaultIfEmpty("").Max();
        return DateTime.TryParse(last, out var d) ? d : DateTime.MinValue;
    }

    public static List<Topic> Continue(List<Topic> topics, UserProfile p, int take = 3)
    {
        var byId = topics.ToDictionary(t => t.Id);
        return p.TopicStatistics.Keys
            .Where(id => byId.ContainsKey(id) && !p.TopicsCompleted.Contains(id))
            .OrderByDescending(id => LastTouched(p, id))
            .Take(take)
            .Select(id => byId[id])
            .ToList();
    }

    // Unstarted, unlocked topics one hop from what the learner knows, scored by edge strength.
    // otherFields=true keeps only topics in a different domain from the topic that leads to them.
    public static List<TopicSuggestion> NextSteps(List<Topic> topics, IReadOnlyList<TopicEdge> edges, UserProfile p,
        bool otherFields, int take = 3)
    {
        var byId = topics.ToDictionary(t => t.Id);
        var known = KnownTopics(p);
        var scores = new Dictionary<string, (double score, TopicEdge edge, string via, int links)>();

        foreach (var e in edges)
        {
            foreach (var (src, dst) in new[] { (e.From, e.To), (e.To, e.From) })
            {
                if (!known.Contains(src) || known.Contains(dst)) continue;
                if (!byId.TryGetValue(dst, out var target) || !byId.TryGetValue(src, out var from)) continue;
                if (otherFields == (from.Domain == target.Domain)) continue;
                if (IsLocked(target, edges, p)) continue;

                // A prereq that points forward from something finished is the strongest signal.
                var s = e.Strength + (e.Type == "prereq" && e.From == src && p.TopicsCompleted.Contains(src) ? 0.5 : 0);
                if (!scores.TryGetValue(dst, out var cur)) scores[dst] = (s, e, from.Name, 1);
                else if (s > cur.score) scores[dst] = (s, e, from.Name, cur.links + 1);
                else scores[dst] = (cur.score, cur.edge, cur.via, cur.links + 1);
            }
        }

        return scores
            .OrderByDescending(kv => kv.Value.score + 0.1 * (kv.Value.links - 1))
            .ThenBy(kv => kv.Key, StringComparer.Ordinal)
            .Take(take)
            .Select(kv => new TopicSuggestion
            {
                Topic = byId[kv.Key],
                Reason = (kv.Value.edge.Type == "prereq" && kv.Value.edge.From != kv.Key ? "Builds on " : "Connects to ") + kv.Value.via,
                Why = kv.Value.edge.Why
            })
            .ToList();
    }

    public static List<Echo> Echoes(string topicId, List<Topic> topics, IReadOnlyList<TopicEdge> edges,
        List<SynthesisQuiz> synthesis, int take = 2)
    {
        var byId = topics.ToDictionary(t => t.Id);
        if (!byId.TryGetValue(topicId, out var self)) return new();
        var result = new List<Echo>();

        var edgeEcho = edges
            .Where(e => e.From == topicId || e.To == topicId)
            .Select(e => (e, other: e.From == topicId ? e.To : e.From))
            .Where(x => byId.TryGetValue(x.other, out var o) && o.Domain != self.Domain && !string.IsNullOrEmpty(x.e.Why))
            .OrderByDescending(x => x.e.Strength)
            .ThenBy(x => x.other, StringComparer.Ordinal)
            .Select(x => new Echo { TopicId = x.other, TopicName = byId[x.other].Name, Domain = byId[x.other].Domain, Why = x.e.Why! })
            .ToList();

        var syn = synthesis.FirstOrDefault(s => s.RequiredTopicIds.Contains(topicId));
        if (edgeEcho.Count > 0) result.Add(edgeEcho[0]);
        if (syn != null)
        {
            var otherId = syn.RequiredTopicIds.FirstOrDefault(id => id != topicId && byId.TryGetValue(id, out var o) && o.Domain != self.Domain)
                          ?? syn.RequiredTopicIds.First(id => id != topicId);
            if (byId.TryGetValue(otherId, out var other) && result.All(r => r.TopicId != otherId))
                result.Add(new Echo
                {
                    TopicId = otherId, TopicName = other.Name, Domain = other.Domain,
                    Why = syn.Description, SynthesisQuizId = syn.Id, SynthesisTitle = syn.Title
                });
        }
        foreach (var e in edgeEcho.Skip(1))
        {
            if (result.Count >= take) break;
            if (result.All(r => r.TopicId != e.TopicId)) result.Add(e);
        }
        return result.Take(take).ToList();
    }

    public static int DateSeed(DateTime date) => date.Year * 10000 + date.Month * 100 + date.Day;

    // Frontier first (continuing topics and one-hop neighbours); falls back to beginner topics.
    public static List<string> DailyCandidates(List<Topic> topics, IReadOnlyList<TopicEdge> edges, UserProfile p)
    {
        var candidates = Continue(topics, p, 5).Select(t => t.Id)
            .Concat(NextSteps(topics, edges, p, otherFields: false, take: 5).Select(s => s.Topic.Id))
            .Concat(NextSteps(topics, edges, p, otherFields: true, take: 5).Select(s => s.Topic.Id))
            .Distinct()
            .ToList();
        if (candidates.Count == 0)
        {
            var preferred = p.SuggestedTopicIds.Where(id => topics.Any(t => t.Id == id)).ToList();
            candidates = preferred.Count > 0
                ? preferred
                : topics.Where(t => t.Tier <= 1 && !p.TopicsCompleted.Contains(t.Id)).Select(t => t.Id).OrderBy(id => id, StringComparer.Ordinal).ToList();
        }
        return candidates;
    }

    public static string? PickDailyTopic(List<string> candidates, DateTime date) =>
        candidates.Count == 0 ? null : candidates[new Random(DateSeed(date)).Next(candidates.Count)];

    public static Lesson? NextLesson(List<Lesson> lessons, UserProfile p) =>
        lessons.OrderBy(l => l.Order).FirstOrDefault(l => l.Concepts.Count > 0 && !p.LessonsCompleted.Contains(l.Id));
}
