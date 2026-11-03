using System.Text.Json;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class WhatsNewTests
{
    private static List<WhatsNewEntry> Entries(params string[] versions) =>
        versions.Select(v => new WhatsNewEntry { Version = v, Title = "T" + v }).ToList();

    [Theory]
    [InlineData("5.9.0", "5.8.0", 1)]
    [InlineData("5.1", "5.1.0", 0)]
    [InlineData("5.1.1", "5.1", 1)]
    [InlineData("5.10.0", "5.9.0", 1)]
    [InlineData("5.9.0-preview", "5.9.0", 0)]
    [InlineData("4.9", "5.0", -1)]
    public void VersionsCompareByNumberNotText(string a, string b, int sign) =>
        Assert.Equal(sign, Math.Sign(WhatsNew.Compare(a, b)));

    [Theory]
    [InlineData("5.9.0", "5.9")]
    [InlineData("5.7.1", "5.7.1")]
    [InlineData("5.1", "5.1")]
    [InlineData("5.9.0-preview", "5.9")]
    public void ShortVersionDropsATrailingZero(string v, string expected) => Assert.Equal(expected, WhatsNew.Short(v));

    [Fact]
    public void ANewPlayerSeesNothing()
    {
        var (show, earlier) = WhatsNew.Pending(Entries("5.9.0", "5.8.0"), "5.9.0", null, newPlayer: true);
        Assert.Null(show);
        Assert.Empty(earlier);
    }

    [Fact]
    public void UpdatingFromBeforeTheScreenExistedShowsTheLatestAndMentionsOneMore()
    {
        var (show, earlier) = WhatsNew.Pending(Entries("5.9.0", "5.8.0", "5.7.1"), "5.9.0", null, newPlayer: false);
        Assert.Equal("5.9.0", show!.Version);
        Assert.Equal(new[] { "5.8.0" }, earlier.Select(e => e.Version));
    }

    [Fact]
    public void SkippingSeveralUpdatesListsTheOnesInBetween()
    {
        var (show, earlier) = WhatsNew.Pending(Entries("6.0.0", "5.9.0", "5.8.0", "5.7.1"), "6.0.0", "5.7.1", newPlayer: false);
        Assert.Equal("6.0.0", show!.Version);
        Assert.Equal(new[] { "5.9.0", "5.8.0" }, earlier.Select(e => e.Version));
    }

    [Fact]
    public void NothingWhenAlreadySeenOrNotesAreAheadOfTheInstall()
    {
        Assert.Null(WhatsNew.Pending(Entries("5.9.0", "5.8.0"), "5.9.0", "5.9.0", false).Show);
        // Notes written for a release the phone does not have yet stay hidden until it does.
        var (show, _) = WhatsNew.Pending(Entries("5.9.0", "5.8.0"), "5.8.0", "5.7.1", false);
        Assert.Equal("5.8.0", show!.Version);
    }

    private static string RepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "MathVoyager.csproj"))) dir = dir.Parent;
        return dir!.FullName;
    }

    [Fact]
    public void TheNotesFileIsValidAndCoversTheCurrentVersion()
    {
        var path = Path.Combine(RepoRoot(), "wwwroot", "data", "whatsnew.json");
        var entries = JsonSerializer.Deserialize<List<WhatsNewEntry>>(File.ReadAllText(path), new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
        Assert.NotEmpty(entries);
        Assert.All(entries, e =>
        {
            Assert.False(string.IsNullOrWhiteSpace(e.Title));
            Assert.NotEmpty(e.Items);
            Assert.Matches(@"^\d{4}-\d{2}-\d{2}$", e.Date);
            Assert.All(e.Items, i => Assert.DoesNotContain("—", i.Text));
        });
        Assert.Equal(entries.Count, entries.Select(e => WhatsNew.Clean(e.Version)).Distinct().Count());
        // A release whose version has no entry would show nothing new, so a version bump needs its notes.
        var gradle = File.ReadAllText(Path.Combine(RepoRoot(), "android", "app", "build.gradle"));
        var appVersion = System.Text.RegularExpressions.Regex.Match(gradle, "versionName \"([^\"]+)\"").Groups[1].Value;
        Assert.Contains(entries, e => WhatsNew.Compare(e.Version, appVersion) == 0);
    }
}
