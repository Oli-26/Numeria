using MathVoyager.Models;

namespace MathVoyager.Services;

// From Scratch: a survival-to-rebuilding course kept apart from the subjects (domain "scratch" is not in domains.json).
// The story map in Pages/FromScratchPage.razor is drawn from this list; a skill whose topic is not in topics.json yet
// shows as coming soon.
public static class FromScratch
{
    public const string Domain = "scratch";

    public record Skill(string TopicId, string Name, string Color, string[] Needs);

    public record Chapter(int Number, string Title, string Span, int StartDay, int EndDay, Skill[] Skills);

    public static readonly Chapter[] Chapters =
    {
        new(1, "The first 72 hours", "Days 0 to 3", 0, 3, new Skill[]
        {
            new("scratch-fire", "Fire", "#C8562B", Array.Empty<string>()),
            new("scratch-water", "Water", "#3A7CA5", new[] { "scratch-fire" }),
            new("scratch-shelter", "Shelter", "#5B7F3A", Array.Empty<string>()),
            new("scratch-firstaid", "First Aid", "#B8323A", Array.Empty<string>()),
        }),
        new(2, "The first month", "Days 3 to 30", 3, 30, new Skill[]
        {
            new("scratch-cordage", "Knots and Tools", "#8A6A3B", Array.Empty<string>()),
            new("scratch-food", "Food", "#2F7F78", new[] { "scratch-cordage" }),
            new("scratch-navigation", "Finding Your Way", "#4A5F9A", Array.Empty<string>()),
        }),
        new(3, "The first year", "Days 30 to 365", 30, 365, new Skill[]
        {
            new("scratch-building", "Building", "#9A6B3F", new[] { "scratch-shelter" }),
            new("scratch-chemistry", "Chemistry", "#6F5BA0", new[] { "scratch-fire" }),
            new("scratch-metal", "Metalwork", "#5E6670", new[] { "scratch-chemistry" }),
            new("scratch-power", "Electricity", "#C9971E", new[] { "scratch-metal" }),
        }),
    };

    public static bool IsScratch(Topic? t) => t?.Domain == Domain;

    public static Skill? Find(string topicId) =>
        Chapters.SelectMany(c => c.Skills).FirstOrDefault(s => s.TopicId == topicId);

    // A skill opens once every skill it builds on is finished; the tree is the point of the course.
    public static bool IsOpen(Skill s, UserProfile p) => s.Needs.All(p.TopicsCompleted.Contains);

    // Each chapter's share of the year fills as its lessons are done: the first 72 hours, then the month, then the year.
    public static int DaysSurvived(UserProfile p, IReadOnlyDictionary<string, List<Lesson>> lessonsByTopic, int lessonsPerSkill = 5)
    {
        double days = 0;
        foreach (var ch in Chapters)
        {
            var total = ch.Skills.Sum(s => lessonsByTopic.TryGetValue(s.TopicId, out var ls) ? ls.Count : lessonsPerSkill);
            var done = ch.Skills.Sum(s => lessonsByTopic.TryGetValue(s.TopicId, out var ls) ? ls.Count(l => p.LessonsCompleted.Contains(l.Id)) : 0);
            days += (ch.EndDay - ch.StartDay) * (total == 0 ? 0 : (double)done / total);
        }
        return (int)Math.Floor(days);
    }

    public static string Mood(int day) => day switch
    {
        0 => "You wake up cold and alone, with one match. Fire first.",
        < 3 => "Night is coming. Keep the fire alive and find water.",
        < 30 => "You made it through the first days. Now make it last.",
        < 365 => "Something like a home is taking shape.",
        _ => "A whole year. You built all of this from scratch."
    };
}
