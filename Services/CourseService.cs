using System.Net.Http.Json;
using MathVoyager.Models;

namespace MathVoyager.Services;

// Loads courses.json and works out where the learner stands on each course's story map (Pages/CoursePage.razor).
// A skill whose topic is not in topics.json yet shows as coming soon.
public class CourseService : ICourseService
{
    private readonly HttpClient _http;
    private List<Course>? _courses;

    public CourseService(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<Course>> GetCoursesAsync()
    {
        _courses ??= await _http.GetFromJsonAsync<List<Course>>("data/courses.json") ?? new();
        return _courses;
    }

    public async Task<Course?> GetCourseAsync(string courseId) =>
        (await GetCoursesAsync()).FirstOrDefault(c => c.Id == courseId);

    public async Task<Course?> GetCourseForTopicAsync(Topic? topic) =>
        topic == null ? null : (await GetCoursesAsync()).FirstOrDefault(c => c.Domain == topic.Domain);

    public SkillState StateOf(CourseSkill skill, UserProfile profile, IReadOnlyDictionary<string, List<Lesson>> lessonsByTopic) =>
        SkillStateOf(skill, profile, lessonsByTopic);

    public int MeterValue(Course course, UserProfile profile, IReadOnlyDictionary<string, List<Lesson>> lessonsByTopic) =>
        MeterValueOf(course, profile, lessonsByTopic);

    public string Mood(Course course, int value) => MoodOf(course, value);

    // A skill opens once every skill it builds on is finished; the tree is the point of the course.
    public static SkillState SkillStateOf(CourseSkill skill, UserProfile profile, IReadOnlyDictionary<string, List<Lesson>> lessonsByTopic)
    {
        if (!lessonsByTopic.ContainsKey(skill.TopicId)) return SkillState.Soon;
        if (profile.TopicsCompleted.Contains(skill.TopicId)) return SkillState.Done;
        return skill.Needs.All(profile.TopicsCompleted.Contains) ? SkillState.Open : SkillState.Locked;
    }

    // Each chapter's share of the meter fills as its lessons are done (for From Scratch: the first 72 hours, then the
    // month, then the year).
    public static int MeterValueOf(Course course, UserProfile profile, IReadOnlyDictionary<string, List<Lesson>> lessonsByTopic)
    {
        var perSkill = course.Meter.LessonsPerSkill;
        double value = 0;
        foreach (var ch in course.Chapters)
        {
            var total = ch.Skills.Sum(s => lessonsByTopic.TryGetValue(s.TopicId, out var ls) ? ls.Count : perSkill);
            var done = ch.Skills.Sum(s => lessonsByTopic.TryGetValue(s.TopicId, out var ls) ? ls.Count(l => profile.LessonsCompleted.Contains(l.Id)) : 0);
            value += (ch.End - ch.Start) * (total == 0 ? 0 : (double)done / total);
        }
        return (int)Math.Floor(value);
    }

    public static string MoodOf(Course course, int value) =>
        course.Meter.Moods.FirstOrDefault(m => m.Below == null || value < m.Below)?.Text ?? "";
}

public class CourseEntitlements : ICourseEntitlements
{
    private readonly ICourseService _courses;
    private readonly IProgressService _progress;

    public CourseEntitlements(ICourseService courses, IProgressService progress)
    {
        _courses = courses;
        _progress = progress;
    }

    public async Task<bool> IsOwnedAsync(string courseId)
    {
        var course = await _courses.GetCourseAsync(courseId);
        return course != null && IsOwned(course, await _progress.GetProfileAsync());
    }

    // No billing yet: CoursesOwned is only ever filled by a future purchase flow.
    public static bool IsOwned(Course course, UserProfile profile) =>
        course.Price == null || profile.CoursesOwned.Contains(course.Id);
}
