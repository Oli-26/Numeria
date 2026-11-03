namespace MathVoyager.Services;

// Players added to the global board in the app (never written to the database), so a newcomer sees scores within
// reach instead of only a few veterans' totals. Some climb slowly each day up to a cap, worked out from the date
// alone so every device shows the same board.
public static class LeaderboardSeeds
{
    private static readonly DateTime Start = new(2026, 11, 3);

    // (name, XP on Start, XP gained per day, cap, avatar)
    private static readonly (string Name, int Xp, double PerDay, int Cap, string? Avatar)[] Players =
    {
        ("mira_k", 85, 0, 85, null),
        ("Tomasz", 160, 3, 520, null),
        ("quietfox", 240, 0, 240, "card:bio-ecology"),
        ("lena_v", 310, 5, 900, null),
        ("Bex", 420, 0, 420, "hof:math/noether"),
        ("nightowl_88", 560, 8, 1500, null),
        ("Priya_S", 690, 2, 1100, "hof:biology/darwin"),
        ("Dmitri", 1180, 0, 1180, null),
        ("kelpforest", 1640, 6, 2600, "card:bio-marine"),
        ("Amara", 2120, 4, 3200, "hof:math/ramanujan"),
        ("jules_r", 2730, 0, 2730, null),
        ("Hamish", 3310, 7, 4600, null),
        ("astro_ines", 4050, 3, 5200, "card:physics-astrophysics"),
        ("Ottoline", 4480, 0, 4480, "hof:math/euler"),
    };

    public static List<LeaderboardEntry> For(DateTime today)
    {
        var days = Math.Max(0, (today.Date - Start).Days);
        var list = new List<LeaderboardEntry>();
        for (int i = 0; i < Players.Length; i++)
        {
            var p = Players[i];
            var xp = (int)Math.Min(p.Cap, p.Xp + Math.Floor(p.PerDay * days));
            var climbing = p.PerDay > 0 && xp < p.Cap;
            // Climbers were active in the last few days; the rest went quiet a while before Start.
            var lastSeen = climbing ? today.Date.AddDays(-(i % 3)) : Start.AddDays(-((5 + i * 3) % 40));
            list.Add(new LeaderboardEntry
            {
                Name = p.Name,
                Score = xp,
                Seconds = (int)Math.Floor(Math.Sqrt(xp / 50.0)) + 1,
                Text = xp / 1500 == 1 ? "1 topic" : $"{xp / 1500} topics",
                Date = lastSeen.ToString("yyyy-MM-dd"),
                Avatar = p.Avatar,
                IsSeed = true,
            });
        }
        return list;
    }

    // Real entries win any name clash, so a player who picks a seed's name is never hidden behind it.
    public static List<LeaderboardEntry> Merge(List<LeaderboardEntry> real, DateTime today, int count)
    {
        var taken = real.Select(e => LeaderboardRanks.Key(e.Name)).ToHashSet();
        return real.Concat(For(today).Where(s => !taken.Contains(LeaderboardRanks.Key(s.Name))))
            .OrderByDescending(e => e.Score).Take(count).ToList();
    }
}
