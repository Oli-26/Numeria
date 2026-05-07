namespace MathVoyager.Models;

public class Resource
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Authors { get; set; } = "";
    public List<string> TopicIds { get; set; } = new();
    public string Type { get; set; } = "book"; // textbook | book | paper | lecture-notes | video | article | course
    public int? Year { get; set; }
    public string? Url { get; set; }
    public string Note { get; set; } = "";
}
