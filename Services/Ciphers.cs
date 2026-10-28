using System.Globalization;
using System.Text;

namespace MathVoyager.Services;

// Classical ciphers over A-Z. Case is folded to upper; every other character passes through
// unchanged and does not advance a keyword.
public static class Ciphers
{
    private static char Shift(char c, int by)
    {
        if (c < 'A' || c > 'Z') return c;
        return (char)('A' + (((c - 'A' + by) % 26) + 26) % 26);
    }

    private static string MapLetters(string text, Func<char, int, char> f)
    {
        var sb = new StringBuilder(text.Length);
        int k = 0;
        foreach (var raw in text)
        {
            var c = char.ToUpperInvariant(raw);
            if (c >= 'A' && c <= 'Z') sb.Append(f(c, k++));
            else sb.Append(c);
        }
        return sb.ToString();
    }

    private static int[] KeyShifts(string key)
    {
        var shifts = key.ToUpperInvariant().Where(ch => ch >= 'A' && ch <= 'Z').Select(ch => ch - 'A').ToArray();
        if (shifts.Length == 0) throw new ArgumentException("Key needs at least one letter.", nameof(key));
        return shifts;
    }

    public static string Caesar(string text, int shift) => MapLetters(text, (c, _) => Shift(c, shift));

    public static string Atbash(string text) => MapLetters(text, (c, _) => (char)('Z' - (c - 'A')));

    public static string Vigenere(string text, string key, bool decrypt = false)
    {
        var ks = KeyShifts(key);
        return MapLetters(text, (c, i) => Shift(c, decrypt ? -ks[i % ks.Length] : ks[i % ks.Length]));
    }

    // C = K - P (mod 26); the same operation decrypts.
    public static string Beaufort(string text, string key)
    {
        var ks = KeyShifts(key);
        return MapLetters(text, (c, i) => (char)('A' + (((ks[i % ks.Length] - (c - 'A')) % 26) + 26) % 26));
    }

    // Shape 0-8: cell of a tic-tac-toe grid (row-major). Shape 9-12: wedge of an X (top, left, right, bottom).
    // Letters A-I, J-R use the grid without/with a dot; S-V, W-Z the X without/with a dot.
    public readonly record struct PigpenGlyph(int Shape, bool Dot);

    public static PigpenGlyph PigpenFor(char letter)
    {
        var i = char.ToUpperInvariant(letter) - 'A';
        if (i < 0 || i > 25) throw new ArgumentOutOfRangeException(nameof(letter));
        if (i < 18) return new PigpenGlyph(i % 9, i >= 9);
        return new PigpenGlyph(9 + (i - 18) % 4, i >= 22);
    }

    public static char PigpenLetter(PigpenGlyph g)
    {
        var i = g.Shape < 9 ? g.Shape + (g.Dot ? 9 : 0) : 18 + (g.Shape - 9) + (g.Dot ? 4 : 0);
        return (char)('A' + i);
    }

    // Null entries are word gaps.
    public static List<PigpenGlyph?> PigpenEncode(string text) =>
        text.Select(c => char.IsLetter(c) ? (PigpenGlyph?)PigpenFor(c) : null).ToList();

    public static string PigpenDecode(IEnumerable<PigpenGlyph?> glyphs) =>
        new(glyphs.Select(g => g is { } v ? PigpenLetter(v) : ' ').ToArray());

    public static string PigpenSvg(PigpenGlyph g, int size = 28)
    {
        const int lo = 2, hi = 10, mid = 6;
        var sb = new StringBuilder();
        var inv = CultureInfo.InvariantCulture;
        void Line(double x1, double y1, double x2, double y2) =>
            sb.Append(string.Format(inv, "<line x1=\"{0}\" y1=\"{1}\" x2=\"{2}\" y2=\"{3}\"/>", x1, y1, x2, y2));

        double dx = mid, dy = mid;
        if (g.Shape < 9)
        {
            int r = g.Shape / 3, c = g.Shape % 3;
            if (c > 0) Line(lo, lo, lo, hi);
            if (c < 2) Line(hi, lo, hi, hi);
            if (r > 0) Line(lo, lo, hi, lo);
            if (r < 2) Line(lo, hi, hi, hi);
        }
        else
        {
            switch (g.Shape)
            {
                case 9: Line(mid, mid, lo, lo); Line(mid, mid, hi, lo); dy = 3.5; break;
                case 10: Line(mid, mid, lo, lo); Line(mid, mid, lo, hi); dx = 3.5; break;
                case 11: Line(mid, mid, hi, lo); Line(mid, mid, hi, hi); dx = 8.5; break;
                default: Line(mid, mid, lo, hi); Line(mid, mid, hi, hi); dy = 8.5; break;
            }
        }
        var dot = g.Dot ? string.Format(inv, "<circle cx=\"{0}\" cy=\"{1}\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/>", dx, dy) : "";
        return string.Format(inv,
            "<svg viewBox=\"0 0 12 12\" width=\"{0}\" height=\"{0}\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" aria-hidden=\"true\">{1}{2}</svg>",
            size, sb, dot);
    }
}

public enum CipherKind { Caesar, Atbash, Vigenere, Beaufort, Pigpen, Layered }

public sealed record CipherPuzzle(CipherKind Kind, string Type, string Hint, string Plaintext, string Lore, string? Key = null)
{
    // Pigpen has no text ciphertext; see Glyphs.
    public string Ciphertext => Kind switch
    {
        CipherKind.Caesar => Ciphers.Caesar(Plaintext, 3),
        CipherKind.Atbash => Ciphers.Atbash(Plaintext),
        CipherKind.Vigenere => Ciphers.Vigenere(Plaintext, Key!),
        CipherKind.Beaufort => Ciphers.Beaufort(Plaintext, Key!),
        CipherKind.Layered => Ciphers.Atbash(Ciphers.Caesar(Plaintext, 5)),
        _ => ""
    };

    public List<Ciphers.PigpenGlyph?> Glyphs => Kind == CipherKind.Pigpen ? Ciphers.PigpenEncode(Plaintext) : new();

    // The solver's route from the shown cipher back to text.
    public string Decode() => Kind switch
    {
        CipherKind.Caesar => Ciphers.Caesar(Ciphertext, -3),
        CipherKind.Atbash => Ciphers.Atbash(Ciphertext),
        CipherKind.Vigenere => Ciphers.Vigenere(Ciphertext, Key!, decrypt: true),
        CipherKind.Beaufort => Ciphers.Beaufort(Ciphertext, Key!),
        CipherKind.Layered => Ciphers.Caesar(Ciphers.Atbash(Ciphertext), -5),
        _ => Ciphers.PigpenDecode(Glyphs)
    };

    public bool Accepts(string answer) => Normalize(answer) == Normalize(Plaintext);

    private static string Normalize(string s) =>
        new(s.Where(c => !char.IsWhiteSpace(c)).Select(char.ToUpperInvariant).ToArray());
}

public static class CipherPuzzles
{
    public static readonly IReadOnlyList<CipherPuzzle> All = new List<CipherPuzzle>
    {
        new(CipherKind.Caesar, "Caesar / ROT-3",
            "Each letter shifted forward by 3. Roll back. The most famous cipher in history.",
            "THE RAVEN KNOWS",
            "Suetonius reports that Julius Caesar wrote private letters with each letter shifted three places along the alphabet."),
        new(CipherKind.Atbash, "Atbash",
            "Reverse alphabet: A and Z swap, B and Y swap, and so on. Hebrew scribes used it too: in Jeremiah 25:26, \"Sheshach\" is Atbash for Babel.",
            "THE OBSERVER",
            "Atbash appears in the Hebrew Bible itself: Jeremiah's \"Sheshach\" is generally read as Babel (Babylon) written in Atbash."),
        new(CipherKind.Vigenere, "Vigenere (key: CICADA)",
            "Repeat the keyword <strong>CICADA</strong> under the letters of the ciphertext (skip the gaps between words). Subtract each key letter from each cipher letter (A=0).",
            "THE TIDE WALKS HOME",
            "Vigenere resisted attack for roughly three centuries, until Babbage and Kasiski each found a way in during the 19th century.",
            "CICADA"),
        new(CipherKind.Pigpen, "Pigpen",
            "Each glyph is the shape of its cell. Two tic-tac-toe grids hold A to R (the second grid's letters carry a dot), and two X shapes hold S to Z (again, the second X is dotted). The key below shows the layout.",
            "HIDDEN",
            "Pigpen is associated with Freemasons from the 18th century; Union prisoners held in Confederate prisons are among its best-attested users."),
        new(CipherKind.Beaufort, "Beaufort variant",
            "Like Vigenere reversed. Key: <strong>TWILIGHT</strong>. For each letter, subtract the cipher letter from the key letter (A=0).",
            "THE LAST LIGHT",
            "Named for Francis Beaufort, the Royal Navy hydrographer. It is reciprocal: the same operation encrypts and decrypts.",
            "TWILIGHT"),
        new(CipherKind.Layered, "Layered (Atbash, then Caesar -5)",
            "Two layers. First reverse the alphabet (Atbash), then shift each result back by 5. Patient work.",
            "EYES ARE OPEN",
            "Cicada 3301 used layered ciphers to gate progress through its puzzles. Nobody has publicly confirmed who set them or why.")
    };
}
