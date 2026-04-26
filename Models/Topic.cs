namespace MathVoyager.Models;

public class Topic
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "";
    public int LessonCount { get; set; }
    public string Difficulty { get; set; } = "";
    public string Domain { get; set; } = "math";
}

public class Domain
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Icon { get; set; } = "";
}
