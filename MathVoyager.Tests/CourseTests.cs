using System.Net;
using System.Text.Json;
using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

// courses.json drives every course map; these guard its data and the rules CoursePage draws from it.
public class CourseTests
{
    private static readonly JsonSerializerOptions Opts = new() { PropertyNameCaseInsensitive = true };
    private static readonly string Root = FindRoot();

    private static string FindRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "MathVoyager.csproj"))) dir = dir.Parent;
        return Path.Combine(dir!.FullName, "wwwroot");
    }

    private static T Load<T>(string rel) => JsonSerializer.Deserialize<T>(File.ReadAllText(Path.Combine(Root, "data", rel)), Opts)!;

    // Serves wwwroot from disk so CourseService loads through its real HttpClient path.
    private sealed class DiskHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage req, CancellationToken ct)
        {
            var path = Path.Combine(Root, req.RequestUri!.AbsolutePath.TrimStart('/'));
            return Task.FromResult(File.Exists(path)
                ? new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(File.ReadAllText(path)) }
                : new HttpResponseMessage(HttpStatusCode.NotFound));
        }
    }

    private static CourseService Service() => new(new HttpClient(new DiskHandler()) { BaseAddress = new Uri("http://localhost/") });

    private static List<Lesson> Lessons(params string[] ids) => ids.Select(id => new Lesson { Id = id }).ToList();

    // A two-chapter course over 0..10: a then b (b needs a) in chapter 1 to day 4, c needs b in chapter 2.
    private static Course Sample(CoursePrice? price = null) => new()
    {
        Id = "sample",
        Domain = "sample",
        Price = price,
        Meter = new CourseMeter
        {
            LessonsPerSkill = 2,
            Moods = new() { new() { Below = 1, Text = "start" }, new() { Below = 4, Text = "early" }, new() { Text = "late" } },
        },
        Chapters = new()
        {
            new() { Number = 1, Start = 0, End = 4, Skills = new()
            {
                new() { TopicId = "a" },
                new() { TopicId = "b", Needs = new() { "a" } },
            }},
            new() { Number = 2, Start = 4, End = 10, Skills = new() { new() { TopicId = "c", Needs = new() { "b" } } } },
        },
    };

    [Fact]
    public async Task Service_LoadsCourses_AndFindsTheCourseForATopic()
    {
        var svc = Service();
        var courses = await svc.GetCoursesAsync();
        Assert.NotEmpty(courses);
        Assert.Equal(courses.Count, courses.Select(c => c.Id).Distinct().Count());

        var fs = await svc.GetCourseAsync("from-scratch");
        Assert.NotNull(fs);
        Assert.Same(fs, await svc.GetCourseForTopicAsync(new Topic { Id = "scratch-fire", Domain = "scratch" }));
        Assert.Null(await svc.GetCourseForTopicAsync(new Topic { Id = "calculus", Domain = "math" }));
        Assert.Null(await svc.GetCourseForTopicAsync(null));
        Assert.Null(await svc.GetCourseAsync("no-such-course"));
    }

    [Fact]
    public void CoursesJson_IsConsistent_WithTopicsAndDomains()
    {
        var courses = Load<List<Course>>("courses.json");
        var topics = Load<List<Topic>>("topics.json").ToDictionary(t => t.Id);
        var domainIds = Load<List<Domain>>("domains.json").Select(d => d.Id).ToHashSet();

        Assert.All(courses, c =>
        {
            Assert.False(string.IsNullOrWhiteSpace(c.Title), $"{c.Id} has no title");
            Assert.False(string.IsNullOrWhiteSpace(c.Domain), $"{c.Id} has no domain");
            // A course's domain stays out of domains.json so its topics never join the Subjects list.
            Assert.DoesNotContain(c.Domain, domainIds);
            Assert.Contains(c.Source, new[] { "bundled", "remote" });
            if (c.Price != null) Assert.False(string.IsNullOrWhiteSpace(c.Price.Sku), $"{c.Id} has a price with no sku");
            Assert.NotEmpty(c.Chapters);

            var skillIds = c.Skills.Select(s => s.TopicId).ToList();
            Assert.Equal(skillIds.Count, skillIds.Distinct().Count());
            Assert.All(c.Skills, s =>
            {
                Assert.All(s.Needs, n => Assert.Contains(n, skillIds));
                // A skill may be coming soon, but a topic that exists must be marked with the course's domain.
                if (topics.TryGetValue(s.TopicId, out var t)) Assert.Equal(c.Domain, t.Domain);
            });
            Assert.All(c.Chapters, ch => Assert.True(ch.End > ch.Start, $"{c.Id} chapter {ch.Number} is empty"));
            Assert.All(c.Chapters.Zip(c.Chapters.Skip(1)), p => Assert.Equal(p.First.End, p.Second.Start));
        });
    }

    [Fact]
    public void CoursesJson_Prerequisites_HaveNoCycles()
    {
        foreach (var c in Load<List<Course>>("courses.json"))
        {
            var needs = c.Skills.ToDictionary(s => s.TopicId, s => s.Needs);
            var done = new HashSet<string>();
            // Peel off skills whose needs are all met; anything left over sits on a cycle and could never open.
            while (needs.Keys.Except(done).FirstOrDefault(k => needs[k].All(done.Contains)) is { } next) done.Add(next);
            Assert.Equal(needs.Count, done.Count);
        }
    }

    [Fact]
    public void FromScratch_KeepsItsMap()
    {
        var fs = Load<List<Course>>("courses.json").Single(c => c.Id == "from-scratch");
        Assert.Equal("scratch", fs.Domain);
        Assert.Null(fs.Price);
        Assert.Equal(new[] { 4, 3, 4 }, fs.Chapters.Select(c => c.Skills.Count));
        Assert.Equal(365, fs.MeterMax);
        Assert.Equal(new[] { 3, 30 }, fs.MeterTicks);
        Assert.Equal("Day 12", fs.Meter.Format(fs.Meter.Label, 12, fs.MeterMax));
        Assert.Equal("12 of 365 days survived", fs.Meter.Format(fs.Meter.AriaLabel, 12, fs.MeterMax));
        Assert.Equal(new[] { "scratch-chemistry" }, fs.FindSkill("scratch-metal")!.Needs);
        Assert.StartsWith("You wake up", CourseService.MoodOf(fs, 0));
        Assert.StartsWith("Night is coming", CourseService.MoodOf(fs, 2));
        Assert.StartsWith("You made it", CourseService.MoodOf(fs, 3));
        Assert.StartsWith("Something like a home", CourseService.MoodOf(fs, 364));
        Assert.StartsWith("A whole year", CourseService.MoodOf(fs, 365));
    }

    [Fact]
    public void SkillState_FollowsPrerequisites()
    {
        var course = Sample();
        var lessons = new Dictionary<string, List<Lesson>> { ["a"] = Lessons("a1"), ["b"] = Lessons("b1") };
        var p = new UserProfile();
        SkillState Of(string id) => CourseService.SkillStateOf(course.FindSkill(id)!, p, lessons);

        Assert.Equal(SkillState.Open, Of("a"));
        Assert.Equal(SkillState.Locked, Of("b"));
        Assert.Equal(SkillState.Soon, Of("c"));

        p.TopicsCompleted.Add("a");
        Assert.Equal(SkillState.Done, Of("a"));
        Assert.Equal(SkillState.Open, Of("b"));

        // Finishing what it needs does not open a skill whose topic has not landed yet.
        p.TopicsCompleted.Add("b");
        Assert.Equal(SkillState.Soon, Of("c"));
    }

    [Fact]
    public void SkillState_NeedsEveryPrerequisite()
    {
        var skill = new CourseSkill { TopicId = "d", Needs = new() { "a", "b" } };
        var lessons = new Dictionary<string, List<Lesson>> { ["d"] = Lessons("d1") };
        var p = new UserProfile { TopicsCompleted = new() { "a" } };
        Assert.Equal(SkillState.Locked, CourseService.SkillStateOf(skill, p, lessons));
        p.TopicsCompleted.Add("b");
        Assert.Equal(SkillState.Open, CourseService.SkillStateOf(skill, p, lessons));
    }

    [Fact]
    public void Meter_FillsEachChaptersShare()
    {
        var course = Sample();
        // c has no topic yet, so chapter 2 assumes LessonsPerSkill (2) lessons for it.
        var lessons = new Dictionary<string, List<Lesson>> { ["a"] = Lessons("a1", "a2"), ["b"] = Lessons("b1", "b2") };
        var p = new UserProfile();
        Assert.Equal(0, CourseService.MeterValueOf(course, p, lessons));

        p.LessonsCompleted.AddRange(new[] { "a1", "a2", "b1" });
        Assert.Equal(3, CourseService.MeterValueOf(course, p, lessons));

        p.LessonsCompleted.Add("b2");
        Assert.Equal(4, CourseService.MeterValueOf(course, p, lessons));

        lessons["c"] = Lessons("c1", "c2", "c3");
        p.LessonsCompleted.Add("c1");
        Assert.Equal(6, CourseService.MeterValueOf(course, p, lessons));
        p.LessonsCompleted.AddRange(new[] { "c2", "c3" });
        Assert.Equal(10, CourseService.MeterValueOf(course, p, lessons));
    }

    [Fact]
    public void Mood_PicksTheFirstThresholdAboveTheValue()
    {
        var course = Sample();
        Assert.Equal("start", CourseService.MoodOf(course, 0));
        Assert.Equal("early", CourseService.MoodOf(course, 1));
        Assert.Equal("early", CourseService.MoodOf(course, 3));
        Assert.Equal("late", CourseService.MoodOf(course, 4));
        Assert.Equal("", CourseService.MoodOf(new Course(), 4));
    }

    [Fact]
    public void Entitlements_FreeIsAlwaysOwned_PaidNeedsTheProfile()
    {
        var p = new UserProfile();
        Assert.True(CourseEntitlements.IsOwned(Sample(), p));

        var paid = Sample(new CoursePrice { Sku = "course.sample", Display = "£2.99" });
        Assert.False(CourseEntitlements.IsOwned(paid, p));
        p.CoursesOwned.Add("sample");
        Assert.True(CourseEntitlements.IsOwned(paid, p));
    }
}
