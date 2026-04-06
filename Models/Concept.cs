namespace MathVoyager.Models;

public class Concept
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string ContentHtml { get; set; } = "";
    public List<string> MathExpressions { get; set; } = new();
    public string? VisualizationType { get; set; }
    public Dictionary<string, object>? VisualizationConfig { get; set; }
}
