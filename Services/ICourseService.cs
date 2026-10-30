using MathVoyager.Models;

namespace MathVoyager.Services;

public interface ICourseService
{
    Task<List<Course>> GetCoursesAsync();
    Task<Course?> GetCourseAsync(string courseId);
    Task<Course?> GetCourseForTopicAsync(Topic? topic);
    SkillState StateOf(CourseSkill skill, UserProfile profile, IReadOnlyDictionary<string, List<Lesson>> lessonsByTopic);
    int MeterValue(Course course, UserProfile profile, IReadOnlyDictionary<string, List<Lesson>> lessonsByTopic);
    string Mood(Course course, int value);
}

public interface ICourseEntitlements
{
    // Free courses are always owned; a paid one is owned once its id is in the profile's CoursesOwned.
    Task<bool> IsOwnedAsync(string courseId);
}
