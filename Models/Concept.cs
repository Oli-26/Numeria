namespace MathVoyager.Models;

public class Concept
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string ContentHtml { get; set; } = "";
    public List<string> MathExpressions { get; set; } = new();
    public string? VisualizationType { get; set; }
    public Dictionary<string, object>? VisualizationConfig { get; set; }

    // Optional depth layers; the reader falls back to ContentHtml when a layer is missing.
    public string? ContentHtmlSimple { get; set; }
    public string? ContentHtmlDeep { get; set; }

    // Guess-before-reveal: when set, the learner answers this before the content is shown.
    public Question? Discovery { get; set; }

    // One or two sentence reference answer for "explain it back".
    public string? ModelSummary { get; set; }

    // Overrides the simulator derived from the topic mapping.
    public string? SimulatorRoute { get; set; }
}

public class ConceptExtra
{
    public Question? Discovery { get; set; }
    public string? ModelSummary { get; set; }
    public string? ContentHtmlSimple { get; set; }
    public string? ContentHtmlDeep { get; set; }
    public string? SimulatorRoute { get; set; }
    public string? VisualizationType { get; set; }
    public Dictionary<string, object>? VisualizationConfig { get; set; }
}
