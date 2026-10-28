namespace MathVoyager.Services;

public enum MarketIntervention { None, Ceiling, Floor, Tax, Quota }

// Linear demand P = A - B*Q and supply P = C + D*Q, with B and D positive.
public sealed record MarketCurves(double A, double B, double C, double D)
{
    public double DemandPrice(double q) => A - B * q;
    public double SupplyPrice(double q) => C + D * q;
    public double QuantityDemanded(double p) => Math.Max(0, (A - p) / B);
    public double QuantitySupplied(double p) => Math.Max(0, (p - C) / D);
}

// BuyerPrice is what buyers pay per unit; SellerPrice is what sellers keep (for a quota, the
// cost of the last unit). Surplus areas assume the units that do trade go to the buyers who
// value them most and come from the sellers with the lowest costs.
public sealed record MarketOutcome(
    double EquilibriumQuantity,
    double EquilibriumPrice,
    double MaxSurplus,
    bool Binding,
    double Quantity,
    double BuyerPrice,
    double SellerPrice,
    double Shortage,
    double Excess,
    double ConsumerSurplus,
    double ProducerSurplus,
    double TaxRevenue,
    double QuotaRent,
    double DeadweightLoss)
{
    public bool Trades => Quantity > 0;
    public double TotalSurplus => ConsumerSurplus + ProducerSurplus + TaxRevenue + QuotaRent;
}

public static class MarketModel
{
    public static MarketOutcome Solve(MarketCurves m, MarketIntervention kind, double level)
    {
        if (m.B <= 0 || m.D <= 0) throw new ArgumentOutOfRangeException(nameof(m), "Curve slopes must be positive.");
        if (m.A <= m.C)
            return new(0, double.NaN, 0, false, 0, double.NaN, double.NaN, 0, 0, 0, 0, 0, 0, 0);

        var qStar = (m.A - m.C) / (m.B + m.D);
        var pStar = m.DemandPrice(qStar);
        var maxSurplus = 0.5 * (m.A - m.C) * qStar;

        double q = qStar, buyer = pStar, seller = pStar, shortage = 0, excess = 0;
        var binding = true;
        switch (kind)
        {
            case MarketIntervention.Ceiling when level < pStar:
                q = m.QuantitySupplied(level);
                shortage = m.QuantityDemanded(level) - q;
                buyer = seller = level;
                break;
            case MarketIntervention.Floor when level > pStar:
                q = m.QuantityDemanded(level);
                excess = m.QuantitySupplied(level) - q;
                buyer = seller = level;
                break;
            case MarketIntervention.Tax when level > 0:
                q = Math.Max(0, (m.A - m.C - level) / (m.B + m.D));
                buyer = m.DemandPrice(q);
                seller = m.SupplyPrice(q);
                break;
            case MarketIntervention.Quota when level < qStar:
                q = Math.Max(0, level);
                buyer = m.DemandPrice(q);
                seller = m.SupplyPrice(q);
                break;
            default:
                binding = false;
                break;
        }

        var cs = q * (m.A - buyer) - 0.5 * m.B * q * q;
        var ps = q * (seller - m.C) - 0.5 * m.D * q * q;
        var wedge = q * (buyer - seller);
        var dwl = binding ? Math.Max(0, maxSurplus - cs - ps - wedge) : 0;
        return new(qStar, pStar, maxSurplus, binding, q, buyer, seller, shortage, excess, cs, ps,
            kind == MarketIntervention.Tax ? wedge : 0,
            kind == MarketIntervention.Quota ? wedge : 0,
            dwl);
    }
}
