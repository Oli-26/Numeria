using MathVoyager.Services;

namespace MathVoyager.Tests;

public class CipherTests
{
    public static IEnumerable<object[]> PuzzleIndexes() =>
        Enumerable.Range(0, CipherPuzzles.All.Count).Select(i => new object[] { i });

    [Theory]
    [MemberData(nameof(PuzzleIndexes))]
    public void PuzzleRoundTrips(int i)
    {
        var p = CipherPuzzles.All[i];
        Assert.Equal(p.Plaintext, p.Decode());
        Assert.True(p.Accepts(p.Plaintext));
        Assert.True(p.Accepts("  " + p.Plaintext.ToLowerInvariant().Replace(" ", "") + " "));
        Assert.False(p.Accepts(p.Plaintext + "X"));
        if (p.Kind == CipherKind.Pigpen)
        {
            Assert.Equal("", p.Ciphertext);
            Assert.Equal(p.Plaintext.Length, p.Glyphs.Count);
        }
        else
        {
            Assert.NotEqual(p.Plaintext, p.Ciphertext);
            Assert.Equal(p.Plaintext.Select(c => c == ' ').ToArray(), p.Ciphertext.Select(c => c == ' ').ToArray());
        }
    }

    [Fact]
    public void BeaufortKeyDiffersFromPlaintext()
    {
        var p = CipherPuzzles.All.Single(x => x.Kind == CipherKind.Beaufort);
        Assert.NotEqual(p.Key, p.Plaintext.Replace(" ", ""));
        Assert.Contains(p.Ciphertext, c => c != 'A' && c != ' ');
    }

    [Fact]
    public void PlaintextsAreLettersAndSpacesOnly()
    {
        foreach (var p in CipherPuzzles.All)
            Assert.All(p.Plaintext, c => Assert.True(c == ' ' || (c >= 'A' && c <= 'Z')));
    }

    [Fact]
    public void KnownVectors()
    {
        Assert.Equal("WKH", Ciphers.Caesar("THE", 3));
        Assert.Equal("GSV", Ciphers.Atbash("THE"));
        Assert.Equal("LXFOPVEFRNHR", Ciphers.Vigenere("ATTACKATDAWN", "LEMON"));
    }

    [Fact]
    public void PigpenIsABijection()
    {
        var seen = new HashSet<Ciphers.PigpenGlyph>();
        for (var c = 'A'; c <= 'Z'; c++)
        {
            var g = Ciphers.PigpenFor(c);
            Assert.True(seen.Add(g));
            Assert.Equal(c, Ciphers.PigpenLetter(g));
        }
    }
}
