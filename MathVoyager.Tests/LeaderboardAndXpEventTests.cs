using MathVoyager.Data;
using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class LeaderboardAndXpEventTests
{
    private static List<LeaderboardEntry> Board(params string[] names) =>
        names.Select((n, i) => new LeaderboardEntry { Name = n, Score = 1000 - i }).ToList();

    [Fact]
    public void Moved_ComparesAgainstTheLastVisit()
    {
        var before = LeaderboardRanks.Of(Board("Ada", "Kurt", "Rosa"));

        Assert.Equal(2, LeaderboardRanks.Moved(before, "Rosa", 1));
        Assert.Equal(-1, LeaderboardRanks.Moved(before, "Ada", 2));
        Assert.Equal(0, LeaderboardRanks.Moved(before, "Kurt", 2));
        Assert.Null(LeaderboardRanks.Moved(before, "Mo", 4));
        Assert.Null(LeaderboardRanks.Moved(null, "Ada", 1));
    }

    [Fact]
    public void IsNew_OnlyOnceThereIsAPreviousVisit()
    {
        var before = LeaderboardRanks.Of(Board("Ada"));
        Assert.True(LeaderboardRanks.IsNew(before, "Mo"));
        Assert.False(LeaderboardRanks.IsNew(before, "Ada"));
        Assert.False(LeaderboardRanks.IsNew(null, "Mo"));
        Assert.False(LeaderboardRanks.IsNew(new Dictionary<string, int>(), "Mo"));
    }

    [Theory]
    [InlineData("Ada Lovelace", "Ada_Lovelace")]
    [InlineData("sam!", "Sam")]
    [InlineData("  Kurt ", "kurt")]
    public void Key_MatchesADisplayNameToItsPostedForm(string display, string posted) =>
        Assert.Equal(LeaderboardRanks.Key(posted), LeaderboardRanks.Key(display));

    [Fact]
    public async Task AwardXp_RaisesXpAwarded_WithTotalsEitherSide()
    {
        var service = new GamificationService(new ProgressStub(new UserProfile { TotalXp = 400 }), new NoAchievements());
        var seen = new List<GamificationEvent>();
        service.XpAwarded += seen.Add;

        await service.AwardXpAsync(120);

        var e = Assert.Single(seen);
        Assert.Equal((120, 400, 520), (e.XpAwarded, e.PreviousTotalXp, e.TotalXp));
        Assert.True(e.LeveledUp);
        Assert.Equal(4, e.NewLevel);
    }

    private sealed class NoAchievements : IAchievementRepository
    {
        public Task<List<Achievement>> GetAchievementsAsync() => Task.FromResult(new List<Achievement>());
    }

    private sealed class ProgressStub(UserProfile profile) : IProgressService
    {
        public Task<UserProfile> GetProfileAsync() => Task.FromResult(profile);
        public Task SaveProfileAsync(UserProfile p) => Task.CompletedTask;
        public Task MarkConceptViewedAsync(string conceptId) => Task.CompletedTask;
        public Task MarkLessonCompletedAsync(string lessonId) => Task.CompletedTask;
        public Task RecordQuizResultAsync(string quizId, string? topicId, int score, int correctCount, int totalCount, int xpEarned) => Task.CompletedTask;
        public Task RecordQuestionAnsweredAsync(string? topicId, bool correct) => Task.CompletedTask;
        public Task<double> GetTopicProgressAsync(string topicId) => Task.FromResult(0.0);
        public Task UpdateStreakAsync() => Task.CompletedTask;
        public Task StartSessionAsync() => Task.CompletedTask;
        public Task TickSessionTimeAsync() => Task.CompletedTask;
        public Task ResetProgressAsync() => Task.CompletedTask;
    }
}
