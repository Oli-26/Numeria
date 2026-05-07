using System.Text.Json.Serialization;

namespace MathVoyager.Models;

public class Question
{
    public string Id { get; set; } = "";
    public string LessonId { get; set; } = "";

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public QuestionType Type { get; set; }

    public int Difficulty { get; set; }
    public string Prompt { get; set; } = "";
    public string? MathExpression { get; set; }
    public List<string>? Options { get; set; }
    public string? CorrectAnswer { get; set; }
    public List<string>? AcceptableAnswers { get; set; }
    public List<MatchPair>? Pairs { get; set; }
    public List<string>? Steps { get; set; }
    public string? Explanation { get; set; }
    public int XpReward { get; set; }
    public string? VisualizationType { get; set; }
    public Dictionary<string, object>? VisualizationConfig { get; set; }

    // NumericInput
    public double? Tolerance { get; set; }
    public string? Unit { get; set; }

    // Categorize: ordered list of bucket labels; CategoryItems maps each item -> correct bucket
    public List<string>? Categories { get; set; }
    public Dictionary<string, string>? CategoryItems { get; set; }
}

public class MatchPair
{
    public string Left { get; set; } = "";
    public string Right { get; set; } = "";
}
