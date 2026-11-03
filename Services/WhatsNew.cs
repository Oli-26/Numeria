namespace MathVoyager.Services;

public sealed class WhatsNewItem
{
    public string Text { get; set; } = "";
    public string? Icon { get; set; }
    public string? Link { get; set; }
    public string? Action { get; set; }
}

public sealed class WhatsNewEntry
{
    public string Version { get; set; } = "";
    public string Date { get; set; } = "";
    public string Title { get; set; } = "";
    public List<WhatsNewItem> Items { get; set; } = new();
}

// Release notes from data/whatsnew.json, and which of them a player has not seen yet.
public static class WhatsNew
{
    // "5.9.0-preview" and "5.9.0" are the same release; a missing part counts as 0, so "5.1" equals "5.1.0".
    public static int Compare(string a, string b)
    {
        var x = Parts(a); var y = Parts(b);
        for (int i = 0; i < Math.Max(x.Length, y.Length); i++)
        {
            var c = (i < x.Length ? x[i] : 0).CompareTo(i < y.Length ? y[i] : 0);
            if (c != 0) return c;
        }
        return 0;
    }

    public static string Clean(string version) => version.Split('-', ' ')[0].Trim();

    // "5.9.0" reads as "5.9"; "5.7.1" stays as it is.
    public static string Short(string version)
    {
        var v = Clean(version);
        return v.Count(c => c == '.') == 2 && v.EndsWith(".0") ? v[..^2] : v;
    }

    private static int[] Parts(string v) =>
        Clean(v).Split('.').Select(p => int.TryParse(p, out var n) ? n : 0).ToArray();

    // On launch: the newest entry at or below the running version that is newer than the last one seen, plus a few
    // other unseen ones to mention. A brand-new player sees none, since everything is new to them. Someone updating
    // from before this screen existed (nothing seen yet) gets the latest entry and the one before it.
    public static (WhatsNewEntry? Show, List<WhatsNewEntry> Earlier) Pending(
        IReadOnlyList<WhatsNewEntry> entries, string current, string? seen, bool newPlayer)
    {
        if (newPlayer) return (null, new());
        var unseen = entries
            .Where(e => Compare(e.Version, current) <= 0 && (seen == null || Compare(e.Version, seen) > 0))
            .OrderByDescending(e => e, Comparer<WhatsNewEntry>.Create((a, b) => Compare(a.Version, b.Version)))
            .ToList();
        if (unseen.Count == 0) return (null, new());
        return (unseen[0], unseen.Skip(1).Take(seen == null ? 1 : 3).ToList());
    }
}
