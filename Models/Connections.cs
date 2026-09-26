namespace MathVoyager.Models;

public class TopicGraphData
{
    public List<TopicGraphNode> Nodes { get; set; } = new();
    public List<TopicEdge> Edges { get; set; } = new();
}

public class TopicGraphNode
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Domain { get; set; } = "";
}

public class TopicEdge
{
    public string From { get; set; } = "";
    public string To { get; set; } = "";
    public string Type { get; set; } = "prereq";
    public double Strength { get; set; }
    public string? Why { get; set; }
}

public class LearningPath
{
    public string Id { get; set; } = "";
    public string Question { get; set; } = "";
    public string Hook { get; set; } = "";
    public string Icon { get; set; } = "compass";
    public List<PathStep> Steps { get; set; } = new();
}

public class PathStep
{
    public string TopicId { get; set; } = "";
    public string LessonId { get; set; } = "";
    // Why this lesson comes next in the story
    public string Note { get; set; } = "";
}

public class BigQuestion
{
    public string Id { get; set; } = "";
    public string Question { get; set; } = "";
    public string Blurb { get; set; } = "";
    public string Icon { get; set; } = "compass";
    public List<string> PathIds { get; set; } = new();
    public List<PathStep> Lessons { get; set; } = new();
    public List<string> SimulatorRoutes { get; set; } = new();
    public List<string> TopicIds { get; set; } = new();
    public List<OpenProblemTour> Tours { get; set; } = new();
}

public class OpenProblemTour
{
    public string Title { get; set; } = "";
    public string Status { get; set; } = "";
    public List<TourStop> Stops { get; set; } = new();
}

public class TourStop
{
    public string Heading { get; set; } = "";
    public string Html { get; set; } = "";
}

public class SimulatorInfo
{
    public string Route { get; set; } = "";
    public string Name { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Domain { get; set; } = "";
    public string Blurb { get; set; } = "";
    public List<string> TopicIds { get; set; } = new();
}

public class DailyPick
{
    public Topic Topic { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
    public string Hook { get; set; } = "";
    public string Reason { get; set; } = "";
}

public class Echo
{
    public string TopicId { get; set; } = "";
    public string TopicName { get; set; } = "";
    public string Domain { get; set; } = "";
    public string Why { get; set; } = "";
    public string? SynthesisQuizId { get; set; }
    public string? SynthesisTitle { get; set; }
}
