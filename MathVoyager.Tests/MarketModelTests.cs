using MathVoyager.Services;

namespace MathVoyager.Tests;

public class MarketModelTests
{
    // Demand P = 120 - Q, supply P = 20 + Q: Q* = 50, P* = 70, total surplus 2500.
    private static readonly MarketCurves Default = new(120, 1, 20, 1);

    private static MarketOutcome Solve(MarketIntervention kind, double level) => MarketModel.Solve(Default, kind, level);

    [Fact]
    public void FreeMarket_FindsEquilibriumAndSplitsSurplus()
    {
        var r = Solve(MarketIntervention.None, 0);
        Assert.Equal(50, r.EquilibriumQuantity, 6);
        Assert.Equal(70, r.EquilibriumPrice, 6);
        Assert.Equal(2500, r.MaxSurplus, 6);
        Assert.False(r.Binding);
        Assert.Equal(50, r.Quantity, 6);
        Assert.Equal(1250, r.ConsumerSurplus, 6);
        Assert.Equal(1250, r.ProducerSurplus, 6);
        Assert.Equal(0, r.DeadweightLoss, 6);
    }

    [Fact]
    public void BindingCeiling_TradesQuantitySuppliedAndLosesTriangle()
    {
        var r = Solve(MarketIntervention.Ceiling, 50);
        Assert.True(r.Binding);
        Assert.Equal(30, r.Quantity, 6);
        Assert.Equal(40, r.Shortage, 6);
        Assert.Equal(50, r.BuyerPrice, 6);
        Assert.Equal(50, r.SellerPrice, 6);
        Assert.Equal(1650, r.ConsumerSurplus, 6);
        Assert.Equal(450, r.ProducerSurplus, 6);
        Assert.Equal(400, r.DeadweightLoss, 6);
    }

    [Fact]
    public void BindingFloor_TradesQuantityDemandedAndLosesTriangle()
    {
        var r = Solve(MarketIntervention.Floor, 90);
        Assert.True(r.Binding);
        Assert.Equal(30, r.Quantity, 6);
        Assert.Equal(40, r.Excess, 6);
        Assert.Equal(450, r.ConsumerSurplus, 6);
        Assert.Equal(1650, r.ProducerSurplus, 6);
        Assert.Equal(400, r.DeadweightLoss, 6);
    }

    [Fact]
    public void Tax_DrivesWedgeBetweenBuyerAndSellerPrice()
    {
        var r = Solve(MarketIntervention.Tax, 20);
        Assert.Equal(40, r.Quantity, 6);
        Assert.Equal(80, r.BuyerPrice, 6);
        Assert.Equal(60, r.SellerPrice, 6);
        Assert.Equal(800, r.TaxRevenue, 6);
        Assert.Equal(800, r.ConsumerSurplus, 6);
        Assert.Equal(800, r.ProducerSurplus, 6);
        Assert.Equal(100, r.DeadweightLoss, 6);
    }

    [Fact]
    public void Tax_BurdenFallsMoreOnTheSteeperSide()
    {
        // Demand twice as steep as supply: buyers bear 2/3 of a 30 tax.
        var m = new MarketCurves(120, 2, 20, 1);
        var r = MarketModel.Solve(m, MarketIntervention.Tax, 30);
        Assert.Equal(20, r.BuyerPrice - r.EquilibriumPrice, 6);
        Assert.Equal(10, r.EquilibriumPrice - r.SellerPrice, 6);
    }

    [Fact]
    public void TaxAboveGapBetweenIntercepts_ShutsMarketDown()
    {
        var r = Solve(MarketIntervention.Tax, 200);
        Assert.Equal(0, r.Quantity, 6);
        Assert.False(r.Trades);
        Assert.Equal(0, r.TaxRevenue, 6);
        Assert.Equal(0, r.ConsumerSurplus, 6);
        Assert.Equal(0, r.ProducerSurplus, 6);
        Assert.Equal(2500, r.DeadweightLoss, 6);
        Assert.True(r.BuyerPrice <= Default.A);
    }

    [Fact]
    public void BindingQuota_CreatesRentAndLosesTriangle()
    {
        var r = Solve(MarketIntervention.Quota, 30);
        Assert.Equal(30, r.Quantity, 6);
        Assert.Equal(90, r.BuyerPrice, 6);
        Assert.Equal(50, r.SellerPrice, 6);
        Assert.Equal(1200, r.QuotaRent, 6);
        Assert.Equal(450, r.ConsumerSurplus, 6);
        Assert.Equal(450, r.ProducerSurplus, 6);
        Assert.Equal(400, r.DeadweightLoss, 6);
    }

    [Theory]
    [InlineData(MarketIntervention.Ceiling, 80)]
    [InlineData(MarketIntervention.Floor, 60)]
    [InlineData(MarketIntervention.Quota, 60)]
    [InlineData(MarketIntervention.Tax, 0)]
    public void NonBindingIntervention_LeavesMarketAlone(MarketIntervention kind, double level)
    {
        var r = Solve(kind, level);
        Assert.False(r.Binding);
        Assert.Equal(50, r.Quantity, 6);
        Assert.Equal(70, r.BuyerPrice, 6);
        Assert.Equal(2500, r.TotalSurplus, 6);
        Assert.Equal(0, r.DeadweightLoss, 6);
    }

    [Fact]
    public void NoOverlapBetweenCurves_MeansNoTrade()
    {
        var r = MarketModel.Solve(new MarketCurves(40, 1, 50, 1), MarketIntervention.None, 0);
        Assert.Equal(0, r.Quantity);
        Assert.Equal(0, r.MaxSurplus);
        Assert.Equal(0, r.DeadweightLoss);
    }

    [Fact]
    public void SurplusAlwaysAddsUpAndLossIsTheMissingTriangle()
    {
        var rng = new Random(7);
        var kinds = Enum.GetValues<MarketIntervention>();
        for (var i = 0; i < 500; i++)
        {
            var m = new MarketCurves(60 + rng.NextDouble() * 100, 0.4 + rng.NextDouble() * 2, rng.NextDouble() * 50, 0.4 + rng.NextDouble() * 2);
            var kind = kinds[rng.Next(kinds.Length)];
            var r = MarketModel.Solve(m, kind, rng.NextDouble() * (kind == MarketIntervention.Quota ? 200 : 160));

            Assert.True(r.ConsumerSurplus >= -1e-9 && r.ProducerSurplus >= -1e-9);
            Assert.True(r.DeadweightLoss <= r.MaxSurplus + 1e-9);
            if (r.Trades) Assert.True(r.BuyerPrice <= m.A + 1e-9);
            Assert.Equal(r.MaxSurplus, r.TotalSurplus + r.DeadweightLoss, 6);
            var missing = r.EquilibriumQuantity - r.Quantity;
            Assert.Equal(0.5 * (m.B + m.D) * missing * missing, r.DeadweightLoss, 6);
        }
    }
}
