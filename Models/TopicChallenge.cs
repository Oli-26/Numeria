namespace MathVoyager.Models;

public class TopicChallenge
{
    public string Id { get; set; } = "";
    public string TopicId { get; set; } = "";
    public string Title { get; set; } = "";
    public int Difficulty { get; set; } = 1;
    public string Problem { get; set; } = "";
    public string? ProblemMath { get; set; }
    public string? Hint { get; set; }
    public string FinalAnswer { get; set; } = "";
    public List<string> AnswerVariants { get; set; } = new();
    public string? SolutionMath { get; set; }
    public List<string> Walkthrough { get; set; } = new();
    public int XpReward { get; set; } = 50;
}
