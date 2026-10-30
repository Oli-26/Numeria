namespace MathVoyager.Models;

// A course from courses.json: a story map of skills kept apart from the subjects. Its topics carry the course's
// domain, which is not in domains.json, so they never show in the Subjects list or the home grid.
public class Course
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Kicker { get; set; } = "";
    public string Blurb { get; set; } = "";
    public string Premise { get; set; } = "";
    public string Domain { get; set; } = "";
    // TopicArt key drawn on the course's cards and hub button.
    public string Icon { get; set; } = "";
    public string Accent { get; set; } = "";
    // Null means free; otherwise the store item that unlocks it.
    public CoursePrice? Price { get; set; }
    // "bundled" ships in wwwroot/data; "remote" is reserved for paid content downloaded after purchase.
    public string Source { get; set; } = "bundled";
    public CourseMeter Meter { get; set; } = new();
    public List<CourseChapter> Chapters { get; set; } = new();

    public IEnumerable<CourseSkill> Skills => Chapters.SelectMany(c => c.Skills);
    public CourseSkill? FindSkill(string topicId) => Skills.FirstOrDefault(s => s.TopicId == topicId);
    // The meter runs from 0 to the last chapter's end; inner chapter ends are drawn as ticks.
    public int MeterMax => Chapters.Count == 0 ? 0 : Chapters.Max(c => c.End);
    public IEnumerable<int> MeterTicks => Chapters.Select(c => c.End).Where(e => e > 0 && e < MeterMax).Distinct();
}

public class CoursePrice
{
    public string Sku { get; set; } = "";
    public string Display { get; set; } = "";
}

public class CourseMeter
{
    public string Kicker { get; set; } = "";
    // {n} is the meter value, {max} the meter's end.
    public string Label { get; set; } = "{n}";
    public string AriaLabel { get; set; } = "{n} of {max}";
    public List<string> Fill { get; set; } = new();
    // Assumed lesson count for a skill whose topic has no lessons yet, so the meter does not jump when it lands.
    public int LessonsPerSkill { get; set; } = 5;
    // The first mood whose Below is above the value wins; the last one usually has no Below.
    public List<CourseMood> Moods { get; set; } = new();

    public string Format(string template, int n, int max) => template.Replace("{n}", n.ToString()).Replace("{max}", max.ToString());
}

public class CourseMood
{
    public int? Below { get; set; }
    public string Text { get; set; } = "";
}

public class CourseChapter
{
    public int Number { get; set; }
    public string Title { get; set; } = "";
    public string Span { get; set; } = "";
    public int Start { get; set; }
    public int End { get; set; }
    public List<CourseSkill> Skills { get; set; } = new();
}

public class CourseSkill
{
    public string TopicId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Color { get; set; } = "";
    public List<string> Needs { get; set; } = new();
}

public enum SkillState { Soon, Locked, Open, Done }
