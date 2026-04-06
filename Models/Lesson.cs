namespace MathVoyager.Models;

public class Lesson
{
    public string Id { get; set; } = "";
    public string TopicId { get; set; } = "";
    public int Order { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public int XpReward { get; set; }
    public List<Concept> Concepts { get; set; } = new();
    public List<string> QuizQuestionIds { get; set; } = new();
    public string? PuzzleId { get; set; }
}
