namespace MathVoyager.Models;

public class ProofChallenge
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string TopicId { get; set; } = "";
    public int Difficulty { get; set; } = 1;
    public string Goal { get; set; } = "";
    public string? GoalMath { get; set; }
    public List<ProofBlock> AvailableBlocks { get; set; } = new();
    public List<string> CorrectOrder { get; set; } = new();
    public List<string> GivenIds { get; set; } = new();
    public string Explanation { get; set; } = "";
    public int XpReward { get; set; } = 40;
}

public class ProofBlock
{
    public string Id { get; set; } = "";
    public string Text { get; set; } = "";
    public string? MathExpression { get; set; }
    public string Type { get; set; } = "step"; // "given", "step", "conclusion", "distractor"
}

public class MistakeChallenge
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string TopicId { get; set; } = "";
    public int Difficulty { get; set; } = 1;
    public string Setup { get; set; } = "";
    public string? SetupMath { get; set; }
    public List<MistakeStep> Steps { get; set; } = new();
    public int ErrorStep { get; set; }
    public string ErrorExplanation { get; set; } = "";
    public string CorrectReasoning { get; set; } = "";
    public int XpReward { get; set; } = 35;
}

public class MistakeStep
{
    public int Number { get; set; }
    public string Text { get; set; } = "";
    public string? MathExpression { get; set; }
}
