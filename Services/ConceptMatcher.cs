using System.Text.RegularExpressions;
using MathVoyager.Models;

namespace MathVoyager.Services;

// Questions only carry a LessonId, so the concept each one tests is inferred from word overlap.
// Words shared by every concept in the lesson carry no signal and are weighted to zero.
public static class ConceptMatcher
{
    private static readonly Regex Word = new(@"[a-z][a-z'\-]{2,}", RegexOptions.Compiled);
    private static readonly HashSet<string> Stop = new(StringComparer.Ordinal)
    {
        "the","and","for","that","this","with","from","are","was","were","which","what","when","where",
        "who","whom","why","how","its","into","than","then","they","them","their","there","these","those",
        "has","have","had","not","but","can","could","would","should","will","one","two","each","also",
        "more","most","such","only","other","some","any","all","about","over","between","because","being",
        "been","does","did","his","her","him","she","our","your","you","out","both","same","like","very",
        "true","false","following","correct","answer","called","known","term","used","best","describes"
    };

    public static HashSet<string> Tokens(string? text)
    {
        var set = new HashSet<string>(StringComparer.Ordinal);
        if (string.IsNullOrEmpty(text)) return set;
        var plain = Regex.Replace(text, "<[^>]+>", " ").ToLowerInvariant();
        foreach (Match m in Word.Matches(plain))
        {
            var w = m.Value.Trim('\'', '-');
            if (w.Length < 3 || Stop.Contains(w)) continue;
            set.Add(w.Length > 4 && w.EndsWith('s') ? w[..^1] : w);
        }
        return set;
    }

    public static string QuestionText(Question q) =>
        string.Join(" ", new[] { q.Prompt, q.CorrectAnswer, q.Explanation }
            .Concat(q.AcceptableAnswers ?? new())
            .Concat(q.Pairs?.SelectMany(p => new[] { p.Left, p.Right }) ?? Enumerable.Empty<string>())
            .Where(s => !string.IsNullOrEmpty(s)));

    public static string? BestConceptId(Question q, Lesson lesson)
    {
        if (lesson.Concepts.Count == 0) return null;
        if (lesson.Concepts.Count == 1) return lesson.Concepts[0].Id;

        var qTokens = Tokens(QuestionText(q));
        var conceptTokens = lesson.Concepts
            .Select(c => (c, title: Tokens(c.Title), body: Tokens(c.Title + " " + c.ContentHtml)))
            .ToList();

        var n = conceptTokens.Count;
        string? best = null;
        double bestScore = 0;
        foreach (var (c, title, body) in conceptTokens)
        {
            double score = 0;
            foreach (var t in qTokens)
            {
                if (!body.Contains(t)) continue;
                var df = conceptTokens.Count(x => x.body.Contains(t));
                var weight = 1.0 - (df - 1.0) / n;
                score += weight * (title.Contains(t) ? 3 : 1);
            }
            if (score > bestScore) { bestScore = score; best = c.Id; }
        }
        return best ?? lesson.Concepts[0].Id;
    }

    public static void Assign(IEnumerable<Question> questions, IEnumerable<Lesson> lessons)
    {
        var byId = lessons.ToDictionary(l => l.Id);
        foreach (var q in questions)
        {
            if (!string.IsNullOrEmpty(q.ConceptId)) continue;
            if (byId.TryGetValue(q.LessonId, out var lesson))
                q.ConceptId = BestConceptId(q, lesson);
        }
    }
}
