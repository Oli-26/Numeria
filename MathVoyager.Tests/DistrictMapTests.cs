using MathVoyager.Services;

namespace MathVoyager.Tests;

public class DistrictMapTests
{
    [Fact]
    public void State_IsSplit25To24()
    {
        Assert.Equal(DistrictMap.Cells, DistrictMap.Blue.Length);
        Assert.Equal(25, DistrictMap.BlueVoters);
    }

    [Theory]
    [InlineData("neutral", 4)]
    [InlineData("blue", 6)]
    [InlineData("red", 1)]
    public void Presets_AreLegalMaps_WithTheirAdvertisedResult(string name, int blueSeats)
    {
        var map = DistrictMap.Presets[name];
        Assert.True(DistrictMap.IsValid(map), string.Join("; ", DistrictMap.Problems(map)));
        Assert.Empty(DistrictMap.Problems(map));
        var o = DistrictMap.Score(map);
        Assert.Equal(blueSeats, o.BlueSeats);
        Assert.Equal(DistrictMap.Districts - blueSeats, o.RedSeats);
        Assert.Equal(map, DistrictMap.Renumber(map));
    }

    [Fact]
    public void Gerrymanders_PackOneDistrict_AndWinTheRestByOne()
    {
        var blue = DistrictMap.Tallies(DistrictMap.Presets["blue"]);
        Assert.Equal(6, blue.Count(t => t.Blue == 4));
        Assert.Contains(blue, t => t.Red >= 6);

        var red = DistrictMap.Tallies(DistrictMap.Presets["red"]);
        Assert.Equal(6, red.Count(t => t.Red == 4));
        Assert.Contains(red, t => t.Blue == 7);
    }

    [Fact]
    public void Score_CountsWastedVotes()
    {
        // Blue's map: Red wastes 3 in each of six 4-3 losses and 2 in its 6-1 win; Blue wastes the 1 vote in Red's district.
        var o = DistrictMap.Score(DistrictMap.Presets["blue"]);
        Assert.Equal(1, o.WastedBlue);
        Assert.Equal(20, o.WastedRed);
        Assert.True(o.EfficiencyGap > 0.3);
        Assert.True(DistrictMap.Score(DistrictMap.Presets["red"]).EfficiencyGap < -0.3);
    }

    [Fact]
    public void TryMove_NeedsABorder_AndNeverEmptiesADistrict()
    {
        var map = (int[])DistrictMap.Presets["neutral"].Clone();
        var cell = Enumerable.Range(0, DistrictMap.Cells).First(i => DistrictMap.Neighbours(i).Any(n => map[n] != map[i]));
        var far = Enumerable.Range(0, DistrictMap.Districts).First(d => d != map[cell] && DistrictMap.Neighbours(cell).All(n => map[n] != d));
        Assert.False(DistrictMap.TryMove(map, cell, far));

        var next = DistrictMap.Neighbours(cell).Select(n => map[n]).First(d => d != map[cell]);
        Assert.True(DistrictMap.TryMove(map, cell, next));
        Assert.False(DistrictMap.IsValid(map));
        Assert.Contains(DistrictMap.Problems(map), p => p.Contains("8 voters"));

        var lone = new int[DistrictMap.Cells];
        lone[0] = 1;
        for (int i = 1; i < DistrictMap.Cells; i++) lone[i] = 0;
        Assert.False(DistrictMap.TryMove(lone, 0, 0));
    }

    [Theory]
    [InlineData("neutral")]
    [InlineData("blue")]
    [InlineData("red")]
    public void Shades_TellApartNeighboursWithTheSameWinner(string name)
    {
        var map = DistrictMap.Presets[name];
        var t = DistrictMap.Tallies(map);
        var shade = DistrictMap.Shades(map);
        for (int i = 0; i < DistrictMap.Cells; i++)
            foreach (var n in DistrictMap.Neighbours(i))
                if (map[n] != map[i] && t[map[n]].Winner == t[map[i]].Winner)
                    Assert.NotEqual(shade[map[i]], shade[map[n]]);
    }

    [Fact]
    public void BorderPath_DrawsTheOuterEdge_ForASingleDistrict()
    {
        var path = DistrictMap.BorderPath(new int[DistrictMap.Cells], 10);
        Assert.Equal(4 * DistrictMap.Side, path.Count(ch => ch == 'M'));
    }
}
