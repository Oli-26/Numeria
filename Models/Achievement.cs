namespace MathVoyager.Models;

public class Achievement
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Icon { get; set; } = "";
    public int XpReward { get; set; }
    public AchievementCondition Condition { get; set; } = new();
}

public class AchievementCondition
{
    public string Type { get; set; } = "";
    public int? Count { get; set; }
    public int? Days { get; set; }
    public int? Threshold { get; set; }
    public string? TopicId { get; set; }
}
