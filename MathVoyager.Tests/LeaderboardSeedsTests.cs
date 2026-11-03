using MathVoyager.Services;

namespace MathVoyager.Tests;

public class LeaderboardSeedsTests
{
    private static readonly DateTime Day = new(2026, 11, 20);

    [Fact]
    public void EveryDeviceSeesTheSameBoardOnTheSameDay()
    {
        var a = LeaderboardSeeds.For(Day).Select(e => (e.Name, e.Score, e.Date));
        var b = LeaderboardSeeds.For(Day).Select(e => (e.Name, e.Score, e.Date));
        Assert.Equal(a, b);
    }

    [Fact]
    public void ClimbersRiseOverTimeButStayInTheLowAndMidBands()
    {
        var now = LeaderboardSeeds.For(Day).ToDictionary(e => e.Name, e => e.Score);
        var later = LeaderboardSeeds.For(Day.AddDays(60)).ToDictionary(e => e.Name, e => e.Score);
        Assert.Contains(now.Keys, n => later[n] > now[n]);
        Assert.All(now.Keys, n => Assert.True(later[n] >= now[n]));
        Assert.All(LeaderboardSeeds.For(Day.AddYears(10)), e => Assert.True(e.Score <= 5200));
        Assert.Contains(LeaderboardSeeds.For(Day), e => e.Score < 200);
    }

    [Fact]
    public void LevelAndTopicsFollowTheScore()
    {
        foreach (var e in LeaderboardSeeds.For(Day))
        {
            Assert.Equal((int)Math.Floor(Math.Sqrt(e.Score / 50.0)) + 1, e.Seconds);
            Assert.True(e.IsSeed);
            Assert.Equal(e.Name, LeaderboardService.SanitizeName(e.Name));
        }
    }

    [Fact]
    public void AvatarsAreOnesTheBoardCanShow()
    {
        foreach (var e in LeaderboardSeeds.For(Day).Where(e => e.Avatar != null))
            Assert.Equal(e.Avatar, HallOfFame.PostableId(e.Avatar));
    }

    [Fact]
    public void ARealPlayerWithASeedsNameReplacesTheSeed()
    {
        var real = new List<LeaderboardEntry> { new() { Name = "Bex", Score = 50 }, new() { Name = "Oli", Score = 9889 } };
        var board = LeaderboardSeeds.Merge(real, Day, 50);
        var bex = Assert.Single(board, e => LeaderboardRanks.Key(e.Name) == "bex");
        Assert.False(bex.IsSeed);
        Assert.Equal(50, bex.Score);
    }

    [Fact]
    public void MergedBoardIsSortedAndTrimmed()
    {
        var real = new List<LeaderboardEntry> { new() { Name = "Oli", Score = 9889 }, new() { Name = "Jaithe", Score = 116 } };
        var board = LeaderboardSeeds.Merge(real, Day, 5);
        Assert.Equal(5, board.Count);
        Assert.Equal("Oli", board[0].Name);
        Assert.Equal(board.OrderByDescending(e => e.Score).Select(e => e.Score), board.Select(e => e.Score));
    }
}
