namespace MathVoyager.Models;

public class SynthesisQuiz
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Theme { get; set; } = "#4A5FE0";
    public List<string> Domains { get; set; } = new();
    public List<Question> Questions { get; set; } = new();
}
