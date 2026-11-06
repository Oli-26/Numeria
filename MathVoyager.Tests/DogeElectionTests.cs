using MathVoyager.Services;

namespace MathVoyager.Tests;

public class DogeElectionTests
{
    [Fact]
    public void Steps_FollowThe1268Procedure()
    {
        var plan = DogeElection.Steps.Select(s => $"{s.Kind}{s.Size}").ToArray();
        Assert.Equal(new[] { "Lot30", "Lot9", "Vote40", "Lot12", "Vote25", "Lot9", "Vote45", "Lot11", "Vote41", "Doge1" }, plan);
        Assert.Equal(25, DogeElection.Steps[^1].Need);
    }

    [Fact]
    public void Run_ProducesEachGroupAtItsSize_AndLotsOnlyDrawFromTheGroupBefore()
    {
        var rng = new Random(3);
        for (int k = 0; k < 200; k++)
        {
            var e = DogeElection.Run(DogeElection.Seats(55), rng);
            Assert.Equal(DogeElection.Steps.Length, e.Rounds.Length);
            int prevSize = DogeElection.Council, prevFaction = DogeElection.Seats(55);
            foreach (var r in e.Rounds.SkipLast(1))
            {
                Assert.Equal(r.Step.Size, r.Members.Length);
                if (r.Step.Kind == DogeElection.Kind.Lot)
                {
                    Assert.InRange(r.FactionCount, Math.Max(0, r.Step.Size - (prevSize - prevFaction)), Math.Min(r.Step.Size, prevFaction));
                }
                prevSize = r.Step.Size;
                prevFaction = r.FactionCount;
            }
        }
    }

    [Fact]
    public void AVote_GoesToWhicheverSideCanApproveNamesAlone()
    {
        var rng = new Random(5);
        for (int k = 0; k < 300; k++)
        {
            var e = DogeElection.Run(DogeElection.Seats(50), rng);
            for (int i = 1; i < e.Rounds.Length - 1; i++)
            {
                var r = e.Rounds[i];
                if (r.Step.Kind != DogeElection.Kind.Vote) continue;
                var electors = e.Rounds[i - 1];
                var expected = electors.FactionCount >= r.Step.Need ? DogeElection.Rule.Faction
                    : electors.Members.Length - electors.FactionCount >= r.Step.Need ? DogeElection.Rule.Rivals : DogeElection.Rule.Mixed;
                Assert.Equal(expected, r.Rule);
                if (r.Rule == DogeElection.Rule.Faction) Assert.All(r.Members, m => Assert.True(m));
                if (r.Rule == DogeElection.Rule.Rivals) Assert.All(r.Members, m => Assert.False(m));
            }
            var final = e.Rounds[^2];
            var want = final.FactionCount >= 25 ? DogeElection.Winner.Faction : 41 - final.FactionCount >= 25 ? DogeElection.Winner.Rival : DogeElection.Winner.Compromise;
            Assert.Equal(want, e.Doge);
        }
    }

    [Fact]
    public void AWholeCouncil_AlwaysWins_AndNoSeatsNeverDoes()
    {
        Assert.Equal(1.0, DogeElection.Simulate(DogeElection.Council, 50, 1).Faction);
        Assert.Equal(0.0, DogeElection.Simulate(0, 50, 1).Faction);
    }

    [Fact]
    public void Curve_RisesWithShare_AndStaysFarFromAStraightVote()
    {
        var c = DogeElection.Curve;
        Assert.Equal(DogeElection.CurveShares.Length, c.Length);
        for (int i = 2; i < c.Length; i += 2) Assert.True(c[i] > c[i - 2], $"curve dips at {DogeElection.CurveShares[i]}%");
        int at60 = Array.IndexOf(DogeElection.CurveShares, 60), at30 = Array.IndexOf(DogeElection.CurveShares, 30);
        Assert.InRange(c[at60], 0.45, 0.75);
        Assert.InRange(c[at30], 0.05, 0.3);
    }
}
