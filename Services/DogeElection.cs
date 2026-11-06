namespace MathVoyager.Services;

// The Doge Machine lab: Venice's 1268 procedure for electing its doge, ten rounds that alternate drawing lots with votes,
// run on a Great Council split between one faction and everyone else.
public static class DogeElection
{
    public enum Kind { Lot, Vote, Doge }
    public enum Rule { Drawn, Faction, Rivals, Mixed }
    public enum Winner { Faction, Rival, Compromise }

    // Need: for a vote, how many of the electors had to approve each name; for the doge, votes out of the 41.
    public sealed record Step(Kind Kind, int Size, int Need);

    public static readonly Step[] Steps =
    {
        new(Kind.Lot, 30, 0), new(Kind.Lot, 9, 0), new(Kind.Vote, 40, 7), new(Kind.Lot, 12, 0), new(Kind.Vote, 25, 9),
        new(Kind.Lot, 9, 0), new(Kind.Vote, 45, 7), new(Kind.Lot, 11, 0), new(Kind.Vote, 41, 9), new(Kind.Doge, 1, 25),
    };

    public const int Council = 480;

    // Members: who is in the group, faction first-to-last in the order the lot drew them (or a shuffle, for a vote).
    public sealed record Round(Step Step, bool[] Members, Rule Rule)
    {
        public int FactionCount => Members.Count(m => m);
    }

    public sealed record Election(Round[] Rounds, Winner Doge);

    // A deliberately simple model of a vote: a bloc that holds enough electors to approve names on its own names only its
    // own people; when neither side can, every name needs votes from both, so the group comes out mixed like its electors.
    public static Election Run(int factionSeats, Random rng)
    {
        factionSeats = Math.Clamp(factionSeats, 0, Council);
        var rounds = new List<Round>();
        int n = Council, f = factionSeats;
        foreach (var step in Steps)
        {
            if (step.Kind == Kind.Doge)
            {
                var w = f >= step.Need ? Winner.Faction : n - f >= step.Need ? Winner.Rival : Winner.Compromise;
                rounds.Add(new Round(step, Array.Empty<bool>(), Rule.Drawn));
                return new Election(rounds.ToArray(), w);
            }
            bool[] members;
            var rule = Rule.Drawn;
            if (step.Kind == Kind.Lot)
            {
                members = new bool[step.Size];
                int left = n, fl = f;
                for (int i = 0; i < step.Size; i++)
                {
                    members[i] = rng.Next(left) < fl;
                    if (members[i]) fl--;
                    left--;
                }
            }
            else
            {
                int count;
                if (f >= step.Need) { rule = Rule.Faction; count = step.Size; }
                else if (n - f >= step.Need) { rule = Rule.Rivals; count = 0; }
                else
                {
                    rule = Rule.Mixed;
                    count = 0;
                    for (int i = 0; i < step.Size; i++) if (rng.Next(n) < f) count++;
                }
                count = Math.Clamp(count, Math.Max(0, step.Size - (Council - factionSeats)), Math.Min(step.Size, factionSeats));
                members = Shuffle(Enumerable.Range(0, step.Size).Select(i => i < count).ToArray(), rng);
            }
            rounds.Add(new Round(step, members, rule));
            n = step.Size;
            f = members.Count(m => m);
        }
        throw new InvalidOperationException("Steps must end with the doge.");
    }

    public sealed record Odds(double Faction, double Rival, double Compromise);

    public static Odds Simulate(int factionSeats, int runs, int seed)
    {
        var rng = new Random(seed);
        int fw = 0, rw = 0;
        for (int i = 0; i < runs; i++)
        {
            var w = Run(factionSeats, rng).Doge;
            if (w == Winner.Faction) fw++; else if (w == Winner.Rival) rw++;
        }
        return new Odds(fw / (double)runs, rw / (double)runs, (runs - fw - rw) / (double)runs);
    }

    // The faction's chance of its own doge at every 5% share of the council, for the lab's chart.
    public static readonly int[] CurveShares = Enumerable.Range(1, 19).Select(k => k * 5).ToArray();

    private static double[]? curve;
    public static double[] Curve => curve ??= CurveShares.Select(p => Simulate(Seats(p), 3000, 1268 + p).Faction).ToArray();

    public static int Seats(int percent) => (int)Math.Round(Council * percent / 100.0);

    private static bool[] Shuffle(bool[] a, Random rng)
    {
        for (int i = a.Length - 1; i > 0; i--)
        {
            int j = rng.Next(i + 1);
            (a[i], a[j]) = (a[j], a[i]);
        }
        return a;
    }
}
