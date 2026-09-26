using System.Text.RegularExpressions;
using MathVoyager.Data;
using MathVoyager.Models;

namespace MathVoyager.Services;

public class QuizEngine : IQuizEngine
{
    private readonly IContentRepository _contentRepo;
    private readonly Random _random = new();

    public QuizEngine(IContentRepository contentRepo)
    {
        _contentRepo = contentRepo;
    }

    public async Task<List<Question>> GenerateQuizAsync(string topicId, string? lessonId = null, int count = 5)
    {
        List<Question> pool;
        if (lessonId != null)
            pool = await _contentRepo.GetQuestionsForLessonAsync(topicId, lessonId);
        else
            pool = await _contentRepo.GetQuestionsAsync(topicId);

        return pool.OrderBy(_ => _random.Next()).Take(count).ToList();
    }

    public async Task<List<Question>> GenerateMixedQuizAsync(IEnumerable<string>? completedTopicIds = null, int count = 5)
    {
        var topics = await _contentRepo.GetTopicsAsync();
        var topicFilter = completedTopicIds?.ToHashSet();
        var allQuestions = new List<Question>();

        foreach (var topic in topics)
        {
            if (topicFilter != null && !topicFilter.Contains(topic.Id))
                continue;
            var questions = await _contentRepo.GetQuestionsAsync(topic.Id);
            allQuestions.AddRange(questions);
        }

        return allQuestions.OrderBy(_ => _random.Next()).Take(count).ToList();
    }

    public async Task<List<Question>> GenerateLearnedQuizAsync(
        IEnumerable<string>? completedLessonIds,
        IEnumerable<string>? completedTopicIds,
        IEnumerable<string>? engagedTopicIds,
        int count = 5)
    {
        var lessonSet = completedLessonIds?.ToHashSet() ?? new HashSet<string>();
        var topicSet = completedTopicIds?.ToHashSet() ?? new HashSet<string>();
        var engagedSet = engagedTopicIds?.ToHashSet() ?? new HashSet<string>();

        var topics = await _contentRepo.GetTopicsAsync();
        var pool = new List<Question>();
        var seen = new HashSet<string>();

        void Add(IEnumerable<Question> qs)
        {
            foreach (var q in qs)
                if (seen.Add(q.Id)) pool.Add(q);
        }

        // Tier 1: questions belonging to lessons the user finished. Completing a lesson
        // records answers under its topic, so the touched topics are enough; only scan
        // every topic's file when there is no topic signal at all.
        if (lessonSet.Count > 0)
        {
            var touched = topicSet.Union(engagedSet).ToHashSet();
            foreach (var topic in touched.Count > 0 ? topics.Where(t => touched.Contains(t.Id)) : topics)
            {
                var qs = await _contentRepo.GetQuestionsAsync(topic.Id);
                Add(qs.Where(q => lessonSet.Contains(q.LessonId)));
            }
        }

        // Tier 2: any question from a fully-completed topic
        if (pool.Count < count && topicSet.Count > 0)
        {
            foreach (var topic in topics.Where(t => topicSet.Contains(t.Id)))
                Add(await _contentRepo.GetQuestionsAsync(topic.Id));
        }

        // Tier 3: topics the user has at least answered something in
        if (pool.Count < count && engagedSet.Count > 0)
        {
            foreach (var topic in topics.Where(t => engagedSet.Contains(t.Id)))
                Add(await _contentRepo.GetQuestionsAsync(topic.Id));
        }

        return pool.OrderBy(_ => _random.Next()).Take(count).ToList();
    }

    public QuizResult ValidateAnswer(Question question, string userAnswer)
    {
        bool correct;

        if (question.Type == QuestionType.FillIn)
        {
            correct = IsFillInCorrect(question, userAnswer);
        }
        else if (question.Type == QuestionType.NumericInput)
        {
            correct = IsNumericCorrect(question, userAnswer);
        }
        else if (question.Type == QuestionType.MultipleSelect)
        {
            correct = IsMultipleSelectCorrect(question, userAnswer);
        }
        else if (question.Type == QuestionType.Categorize)
        {
            correct = IsCategorizeCorrect(question, userAnswer);
        }
        else
        {
            var normalized = NormalizeBasic(userAnswer);
            correct = normalized == NormalizeBasic(question.CorrectAnswer ?? "");
        }

        return new QuizResult
        {
            Question = question,
            UserAnswer = userAnswer,
            IsCorrect = correct,
            XpEarned = correct ? question.XpReward : 0
        };
    }

    private bool IsFillInCorrect(Question question, string userAnswer)
    {
        // Collect all acceptable forms
        var acceptable = new List<string>();
        if (question.CorrectAnswer != null)
            acceptable.Add(question.CorrectAnswer);
        if (question.AcceptableAnswers != null)
            acceptable.AddRange(question.AcceptableAnswers);

        var userNorm = NormalizeMath(userAnswer);

        // Check against each acceptable answer
        foreach (var answer in acceptable)
        {
            if (NormalizeMath(answer) == userNorm)
                return true;
        }

        // Numeric / fraction cross-compare. Handles "16" vs "16.00", "1/6" vs "0.167", "1/4" vs "25%".
        if (TryParseAsValue(userAnswer, out double userVal))
        {
            foreach (var answer in acceptable)
            {
                if (TryParseAsValue(answer, out double ansVal) && Math.Abs(userVal - ansVal) <= FillInTolerance(answer, ansVal))
                    return true;
            }
        }

        // Generate additional equivalent forms and check
        foreach (var answer in acceptable)
        {
            if (MathExpressionsEquivalent(userAnswer, answer))
                return true;
        }

        return false;
    }

    // Integer answers (counts, years) stay near-exact; anything else gets 1% relative slack
    // so small magnitudes are not swamped by an absolute tolerance.
    private static double FillInTolerance(string answerLiteral, double value) =>
        Regex.IsMatch(answerLiteral.Trim(), @"^-?\d+$") ? 0.01 : Math.Max(Math.Abs(value) * 0.01, 1e-9);

    private bool IsNumericCorrect(Question q, string userAnswer)
    {
        if (!TryParseNumeric(userAnswer, out double userVal)) return false;
        if (!TryParseNumeric(q.CorrectAnswer ?? "", out double targetVal)) return false;
        var tol = q.Tolerance ?? Math.Max(Math.Abs(targetVal) * 0.01, 1e-6);
        return Math.Abs(userVal - targetVal) <= tol;
    }

    private bool IsMultipleSelectCorrect(Question q, string userAnswer)
    {
        // userAnswer is a "|"-joined set of selected option strings.
        var selected = (userAnswer ?? "").Split('|', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim()).Where(s => s.Length > 0).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var correct = (q.AcceptableAnswers ?? new List<string>())
            .Select(s => s.Trim()).Where(s => s.Length > 0).ToHashSet(StringComparer.OrdinalIgnoreCase);
        return selected.SetEquals(correct);
    }

    private bool IsCategorizeCorrect(Question q, string userAnswer)
    {
        // userAnswer is "item=>bucket;item=>bucket;..." — must equal q.CategoryItems exactly.
        if (q.CategoryItems == null) return false;
        var pairs = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var part in (userAnswer ?? "").Split(';', StringSplitOptions.RemoveEmptyEntries))
        {
            var idx = part.IndexOf("=>");
            if (idx < 0) return false;
            pairs[part[..idx].Trim()] = part[(idx + 2)..].Trim();
        }
        if (pairs.Count != q.CategoryItems.Count) return false;
        foreach (var kv in q.CategoryItems)
        {
            if (!pairs.TryGetValue(kv.Key, out var b) || !string.Equals(b, kv.Value, StringComparison.OrdinalIgnoreCase))
                return false;
        }
        return true;
    }

    /// <summary>
    /// Normalizes a math expression aggressively for comparison.
    /// Handles coefficient ordering, implicit multiplication, parentheses, etc.
    /// </summary>
    private static string NormalizeMath(string expr)
    {
        var s = expr.Trim().ToLowerInvariant();

        // Remove all whitespace
        s = Regex.Replace(s, @"\s+", "");

        // Normalize multiplication: × · * all become *
        s = s.Replace("\u00d7", "*").Replace("\u00b7", "*").Replace("·", "*");

        // Remove unnecessary outer parentheses
        s = StripOuterParens(s);

        // Normalize common superscripts to ^
        s = s.Replace("\u00b2", "^2").Replace("\u00b3", "^3").Replace("\u2074", "^4")
             .Replace("\u2075", "^5").Replace("\u2076", "^6");

        // Remove unnecessary * between coefficient and variable: 3*x -> 3x
        s = Regex.Replace(s, @"(\d)\*([a-z])", "$1$2");

        // Remove unnecessary * between variable and ^: x*^ -> x^
        s = Regex.Replace(s, @"([a-z])\*\^", "$1^");

        // Normalize: (x^3)/3 -> x^3/3
        s = StripOuterParens(s);

        // Remove redundant parentheses around single terms: (x^2) -> x^2
        s = Regex.Replace(s, @"\(([a-z]\^\d+)\)", "$1");
        s = Regex.Replace(s, @"\((\d+)\)", "$1");

        s = s.Replace("+c", "+C");

        return s;
    }

    /// <summary>
    /// Basic normalization for non-math answers (multiple choice, etc.)
    /// </summary>
    private static string NormalizeBasic(string s)
    {
        return s.Trim().ToLowerInvariant().Replace(" ", "");
    }

    /// <summary>
    /// Check if two math expressions are likely equivalent through various rewritings.
    /// </summary>
    private static bool MathExpressionsEquivalent(string user, string expected)
    {
        var u = NormalizeMath(user);
        var e = NormalizeMath(expected);

        if (u == e) return true;

        // Generate variants of the expected answer and check
        var variants = GenerateVariants(expected);
        foreach (var v in variants)
        {
            if (NormalizeMath(v) == u)
                return true;
        }

        // Generate variants of user answer and check against expected
        var userVariants = GenerateVariants(user);
        foreach (var v in userVariants)
        {
            if (NormalizeMath(v) == e)
                return true;
        }

        return false;
    }

    /// <summary>
    /// Generate equivalent forms of a math expression.
    /// </summary>
    private static List<string> GenerateVariants(string expr)
    {
        var variants = new List<string>();
        var s = expr.Trim().ToLowerInvariant().Replace(" ", "");

        // x^3/3 <-> (1/3)x^3 <-> 1/3*x^3 <-> (x^3)/3
        // Match patterns like "x^N/M" and generate "1/Mx^N" and "(1/M)x^N"
        var fracMatch = Regex.Match(s, @"^([a-z])\^(\d+)/(\d+)$");
        if (fracMatch.Success)
        {
            var v = fracMatch.Groups[1].Value;
            var exp = fracMatch.Groups[2].Value;
            var denom = fracMatch.Groups[3].Value;
            variants.Add($"(1/{denom}){v}^{exp}");
            variants.Add($"1/{denom}*{v}^{exp}");
            variants.Add($"1/{denom}{v}^{exp}");
            variants.Add($"({v}^{exp})/{denom}");
        }

        // Match "(1/M)x^N" or "1/Mx^N" and generate "x^N/M"
        var coeffMatch = Regex.Match(s, @"^\(?1/(\d+)\)?([a-z])\^(\d+)$");
        if (coeffMatch.Success)
        {
            var denom = coeffMatch.Groups[1].Value;
            var v = coeffMatch.Groups[2].Value;
            var exp = coeffMatch.Groups[3].Value;
            variants.Add($"{v}^{exp}/{denom}");
            variants.Add($"({v}^{exp})/{denom}");
        }

        // Match "Ax^N" coefficient forms: "6x" <-> "6*x", "6 x"
        var termMatch = Regex.Match(s, @"^(\d+)([a-z].*)$");
        if (termMatch.Success)
        {
            var coeff = termMatch.Groups[1].Value;
            var rest = termMatch.Groups[2].Value;
            variants.Add($"{coeff}*{rest}");
            variants.Add($"{coeff} {rest}");
        }

        // Handle +C variants
        if (s.Contains("+c"))
        {
            variants.Add(s.Replace("+c", " + C"));
            variants.Add(s.Replace("+c", " +C"));
            variants.Add(s.Replace("+c", "+ C"));
        }

        // Tuple notation: (3, 2) <-> (3,2) <-> 3,2
        var tupleMatch = Regex.Match(s, @"^\(?(-?[\d.]+),\s*(-?[\d.]+)\)?$");
        if (tupleMatch.Success)
        {
            var a = tupleMatch.Groups[1].Value;
            var b = tupleMatch.Groups[2].Value;
            variants.Add($"({a}, {b})");
            variants.Add($"({a},{b})");
            variants.Add($"{a},{b}");
            variants.Add($"{a}, {b}");
        }

        // Sum notation: "7+13" <-> "13+7" (for commutative sums)
        var sumMatch = Regex.Match(s, @"^(\d+)\+(\d+)$");
        if (sumMatch.Success)
        {
            variants.Add($"{sumMatch.Groups[2].Value}+{sumMatch.Groups[1].Value}");
        }

        // Common word variants
        if (s == "yes") variants.AddRange(new[] { "y", "true", "yeah" });
        if (s == "no") variants.AddRange(new[] { "n", "false", "nope" });

        return variants;
    }

    private static string StripOuterParens(string s)
    {
        while (s.Length >= 2 && s[0] == '(' && s[^1] == ')')
        {
            // Make sure these parens actually match (not like "(a)+(b)")
            int depth = 0;
            bool matched = true;
            for (int i = 0; i < s.Length - 1; i++)
            {
                if (s[i] == '(') depth++;
                else if (s[i] == ')') depth--;
                if (depth == 0) { matched = false; break; }
            }
            if (matched) s = s[1..^1];
            else break;
        }
        return s;
    }

    private static bool TryParseAsValue(string s, out double val)
    {
        if (TryParseNumeric(s, out val)) return true;
        if (TryEvalFraction(s, out val)) return true;
        return false;
    }

    private static bool TryParseNumeric(string s, out double val)
    {
        s = s.Trim().Replace(" ", "");
        return double.TryParse(s, System.Globalization.NumberStyles.Float,
            System.Globalization.CultureInfo.InvariantCulture, out val);
    }

    private static bool TryEvalFraction(string s, out double val)
    {
        val = 0;
        s = s.Trim().Replace(" ", "");

        // Handle simple fractions like "1/6", "3/4", "-2/3"
        var match = Regex.Match(s, @"^(-?\d+\.?\d*)/(-?\d+\.?\d*)$");
        if (match.Success)
        {
            if (double.TryParse(match.Groups[1].Value, out double num) &&
                double.TryParse(match.Groups[2].Value, out double den) &&
                den != 0)
            {
                val = num / den;
                return true;
            }
        }

        // Handle percentages like "25%" -> 0.25
        if (s.EndsWith('%') && double.TryParse(s[..^1], out double pct))
        {
            val = pct / 100;
            return true;
        }

        return false;
    }

    public int CalculateQuizXp(List<QuizResult> results, int streak)
    {
        var baseXp = results.Sum(r => r.XpEarned);
        var allCorrect = results.Count > 0 && results.All(r => r.IsCorrect);
        var bonus = allCorrect ? 50 : 0;
        var multiplier = 1.0 + Math.Min(streak * 0.1, 1.0);
        return (int)Math.Floor((baseXp + bonus) * multiplier);
    }
}
