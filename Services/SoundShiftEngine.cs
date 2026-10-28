using System.Text;

namespace MathVoyager.Services;

// Applies historical sound laws to phonemic transcriptions segment by segment. Each rule reads its
// whole input form and rewrites every matching segment at once, so a rule never feeds itself.
// Diacritics are handled with a small hand-made decomposition table: string.Normalize is not
// dependable under InvariantGlobalization.
public static class SoundShiftEngine
{
    public enum Law { Grimm, VowelShift, HighGerman }

    public sealed record Blocked(int Index, string Segment, string Reason);

    public sealed record Step(string Name, string Environment, bool IsOther,
        IReadOnlyList<string> Before, IReadOnlyList<string> After,
        IReadOnlyList<int> ChangedBefore, IReadOnlyList<int> ChangedAfter,
        IReadOnlyList<Blocked> Blocked)
    {
        public bool Fired => ChangedBefore.Count > 0 || ChangedAfter.Count > 0;
    }

    public sealed record Derivation(IReadOnlyList<string> Source, IReadOnlyList<int> Unknown,
        IReadOnlyList<Step> Steps, IReadOnlyList<string> LawOutput, IReadOnlyList<string> Output)
    {
        public string OutputText => Join(Output);
        public bool LawChanged => Steps.Any(s => !s.IsOther && s.Fired);
    }

    // Target/OtherNote: Grimm only, the Proto-Germanic form and the non-Grimm changes that reach it.
    // Sister: the cognate in another branch (Grimm) or the modern German word (High German).
    // Spelling: Middle English or Old High German spelling of the source or result.
    public sealed record Preset(string Word, string Source, string? Target = null, string? OtherNote = null,
        string? Sister = null, string? Spelling = null, string Note = "");

    private const char Acute = '́', Macron = '̄', Ring = '̥';

    private static readonly (string Pre, string Dec)[] Composed =
    {
        ("á", "á"), ("é", "é"), ("í", "í"), ("ó", "ó"), ("ú", "ú"),
        ("ā", "ā"), ("ē", "ē"), ("ī", "ī"), ("ō", "ō"), ("ū", "ū"),
        ("ḗ", "ḗ"), ("ṓ", "ṓ"),
        ("ḱ", "ḱ"), ("ǵ", "ǵ"),
        ("ą", "ą"), ("ǫ", "ǫ"), ("ǭ", "ǭ"),
        ("ŕ", "ŕ"), ("ḿ", "ḿ"), ("ń", "ń"),
    };

    private static readonly Dictionary<char, string> DecomposeMap = Composed.ToDictionary(p => p.Pre[0], p => p.Dec);
    private static readonly (string Pre, string Dec)[] ComposeOrder = Composed.OrderByDescending(p => p.Dec.Length).ToArray();

    // ---------- Grimm's Law and Verner's Law ----------

    private static readonly Dictionary<string, string> Voiceless = Pairs("p f", "t θ", "k x", "ḱ x", "kʷ xʷ");
    private static readonly Dictionary<string, string> Voiced = Pairs("b p", "d t", "g k", "ǵ k", "gʷ kʷ");
    private static readonly Dictionary<string, string> Breathy = Pairs("bʰ b", "dʰ d", "gʰ g", "ǵʰ g", "gʷʰ gʷ");
    private static readonly Dictionary<string, string> VernerMap = Pairs("f b", "θ d", "x g", "xʷ gʷ", "s z");

    private static readonly HashSet<string> PieStops = Voiceless.Keys.Concat(Voiced.Keys).Concat(Breathy.Keys).ToHashSet();
    private static readonly HashSet<string> VoicelessObstruents = Voiceless.Keys.Concat(Voiceless.Values).Append("s").ToHashSet();
    private static readonly HashSet<string> PieOther = new[]
        { "s", "m", "n", "r", "l", "y", "w", "h₁", "h₂", "h₃", "m̥", "n̥", "r̥", "l̥", "-" }
        .Select(Canon).ToHashSet();

    private static readonly Rule[] GrimmRules =
    {
        new("Grimm 1: voiceless stops become fricatives",
            "p t k kʷ → f θ x xʷ (ḱ too). Not after s, and not after another stop.",
            Map(Voiceless, (s, i) => i == 0 ? null
                : s[i - 1] == "s" ? "after s: sp, st, sk never shift"
                : PieStops.Contains(s[i - 1]) ? "after another stop: only the first stop of a cluster shifts"
                : null)),
        new("Grimm 2: voiced stops lose their voice",
            "b d g gʷ → p t k kʷ (ǵ too), everywhere.",
            Map(Voiced)),
        new("Grimm 3: breathy stops become plain voiced",
            "bʰ dʰ gʰ gʷʰ → b d g gʷ (ǵʰ too). Between vowels these were fricatives.",
            Map(Breathy)),
    };

    private static readonly Rule VernerRule = new("Verner's Law",
        "f θ x xʷ s → b d g gʷ z, except word-initially, beside a voiceless consonant, or straight after the accented syllable.",
        Verner);

    // ---------- Great Vowel Shift ----------

    private static readonly Rule[] VowelShiftRules =
    {
        new("Other change: final -e lost",
            "Unstressed final ə dropped in late Middle English, around the time the shift began. The letter e stayed in the spelling.",
            (s, i) => i > 0 && i == s.Count - 1 && s[i] == "ə" ? To("") : default, IsOther: true),
        new("Shift 1: iː and uː become diphthongs",
            "iː → əɪ, uː → əʊ. The highest long vowels break first.",
            Map(Pairs("iː əɪ", "uː əʊ"))),
        new("Shift 2: eː and oː rise",
            "eː → iː, oː → uː, into the places left empty by step 1.",
            Map(Pairs("eː iː", "oː uː"))),
        new("Shift 3: the open vowels rise",
            "aː → ɛː, ɛː → eː, ɔː → oː. Each moves up one step.",
            Map(Pairs("aː ɛː", "ɛː eː", "ɔː oː"))),
        new("Later: diphthongs open, ɛː words merge",
            "əɪ → aɪ, əʊ → aʊ. eː (from Middle English ɛː) → iː, so meat joins meet; ɛː (from Middle English aː) → eː.",
            Map(Pairs("əɪ aɪ", "əʊ aʊ", "eː iː", "ɛː eː"))),
        new("Later: mid vowels become diphthongs",
            "eː → eɪ, oː → oʊ (British English has əʊ).",
            Map(Pairs("eː eɪ", "oː oʊ"))),
    };

    // ---------- High German consonant shift ----------

    private const string KeepsK = "Standard German keeps k here (kx only in southern dialects)";

    private static readonly Rule[] HighGermanRules =
    {
        new("Shift 1: affricates",
            "p t → pf ts at the start of a word, when doubled, and after a resonant (mp; nt lt rt). Not after s, f or h.",
            HgAffricate),
        new("Shift 2: fricatives after vowels",
            "p t k → ff ss xx after a vowel (single f s x after a long vowel or at the end); p after l or r → f.",
            HgFricative),
        new("Shift 3: d → t",
            "d → t throughout. Upper German did this fully, and Standard German follows it.",
            Map(Pairs("d t"))),
    };

    // ---------- presets ----------

    public static readonly IReadOnlyList<Preset> GrimmPresets = new Preset[]
    {
        new("foot", "pṓds", "fōts", "Accent mark dropped: Germanic fixed the stress on the first syllable.",
            "Latin pēs (stem ped-)", Note: "Latin kept p and d; Germanic turned them into f and t. Old English fōt."),
        new("three", "tréyes", "θrīz", "-eye- contracted to ī; accent mark dropped.",
            "Latin trēs", Note: "Verner's Law voiced the final s to z, because the accent was not on the syllable before it."),
        new("brother", "bʰréh₂tēr", "brōθēr", "eh₂ became ā, then Germanic ā became ō; accent mark dropped.",
            "Latin frāter", Note: "Latin f also comes from PIE bʰ, which Germanic turned into b. The accent sat on the root, right before θ, so Verner's Law left it alone: Old English brōþor, against fæder."),
        new("ten", "déḱm̥", "texun", "Syllabic m̥ became um, then final m became n; accent mark dropped.",
            "Latin decem", Note: "The accent fell on the syllable just before x, so Verner's Law did not voice it. The h later dropped out in English."),
        new("knee", "ǵnéwom", "knewą", "o became a, and final -om became nasal -ą; accent mark dropped.",
            "Latin genū", Note: "Latin genū continues *ǵénu, Germanic the form *ǵnew- of the same root. The k was still pronounced in Old English cnēo."),
        new("guest", "gʰóstis", "gastiz", "o became a; accent mark dropped.",
            "Latin hostis", Note: "st did not shift, and the final s became z by Verner's Law. Latin h is also from PIE gʰ. Modern guest owes its g- to Old Norse gestr."),
        new("what", "kʷód", "xʷat", "o became a; accent mark dropped.",
            "Latin quod", Note: "xʷ was later written hw (Old English hwæt), now wh."),
        new("father", "ph₂tḗr", "fadēr", "h₂ between consonants became a; accent mark dropped.",
            "Latin pater", Note: "Grimm made t into θ, but the accent came after it, so Verner's Law voiced it: Proto-Germanic *fadēr, Old English fæder. The th of father is a much later English change (around 1500), not Grimm's θ."),
        new("hundred", "ḱm̥tóm", "xundą", "m̥ became um, m became n before d, and final -om became -ą; accent mark dropped.",
            "Latin centum", Note: "Latin c spells k. The syllable before θ was unaccented, so Verner's Law voiced it to d. Old English had both hund and hundred."),
        new("star", "h₂ster-", "ster-", "The initial laryngeal h₂ was lost.",
            "Latin stella, Greek astḗr", Note: "Shown as a stem. t after s never shifted, so st stays st. Greek a- is a trace of the lost laryngeal."),
        new("eight", "oḱtṓw", "axtōu", "o became a, and final -ōw became -ōu; accent mark dropped.",
            "Latin octō", Note: "Only the first stop of a cluster shifts: ḱt became xt, not xθ. Old English eahta."),
        new("water", "wód-", "wat-", "o became a; accent mark dropped.",
            "Greek hýdōr", Note: "Shown as stems, because the endings differ. Greek continues the grade *ud- of the same root, without the w."),
    };

    public static readonly IReadOnlyList<Preset> VowelShiftPresets = new Preset[]
    {
        new("bite", "biːtə", Spelling: "bite", Note: "Long i broke into a diphthong. The e is still written but has been silent since late Middle English."),
        new("house", "huːs", Spelling: "hous", Note: "Middle English wrote uː as ou, a French habit, so the spelling kept ou while the vowel became aʊ."),
        new("meet", "meːtə", Spelling: "mete", Note: "eː rose to iː, so ee now spells the sound iː."),
        new("food", "foːd", Spelling: "fode", Note: "oː rose to uː, which is why oo spells the sound uː."),
        new("meat", "mɛːtə", Spelling: "mete", Note: "ɛː rose to eː and later merged with iː, so meat now sounds like meet; ea records the old difference. A few words such as great and break stopped at eɪ."),
        new("name", "naːmə", Spelling: "name", Note: "aː climbed to eː, then became the diphthong eɪ."),
        new("stone", "stɔːn", Spelling: "stoon", Note: "ɔː rose to oː, then became oʊ (British əʊ). Old English had stān."),
        new("mouse", "muːs", Spelling: "mous", Note: "Same path as house. German Maus made a similar change on its own."),
    };

    public static readonly IReadOnlyList<Preset> HighGermanPresets = new Preset[]
    {
        new("apple", "appul", Sister: "Apfel", Spelling: "apful", Note: "Doubled pp became the affricate pf."),
        new("water", "watar", Sister: "Wasser", Spelling: "wazzar", Note: "t after a vowel became a double fricative, which Old High German spelled zz."),
        new("tide", "tīd", Sister: "Zeit", Spelling: "zīt", Note: "Initial t became ts (spelled z) and d became t. English tide once meant 'time' too, as in Yuletide."),
        new("make", "makōn", Sister: "machen", Spelling: "mahhōn", Note: "k after a vowel became xx, spelled hh and later ch."),
        new("pepper", "pepar", Sister: "Pfeffer", Spelling: "pfeffar", Note: "An early loan from Latin piper, borrowed before the shift and so caught by it: initial p → pf, middle p → ff."),
        new("day", "dag", Sister: "Tag", Spelling: "tag", Note: "d became t. English softened the g instead (Old English dæg)."),
        new("open", "opan", Sister: "offen", Spelling: "offan", Note: "p after a vowel became ff."),
        new("ten", "tehan", Sister: "zehn", Spelling: "zehan", Note: "Initial t became ts, spelled z."),
        new("two", "twai", Sister: "zwei", Spelling: "zwei", Note: "Initial t became ts. The vowels differ because English and German kept different forms of the numeral."),
        new("heart", "herta", Sister: "Herz", Spelling: "herza", Note: "t after r became ts, spelled z."),
    };

    public static IReadOnlyList<Preset> Presets(Law law) => law switch
    {
        Law.Grimm => GrimmPresets,
        Law.VowelShift => VowelShiftPresets,
        _ => HighGermanPresets,
    };

    // ---------- running ----------

    public static Derivation Run(Law law, Preset preset, bool verner = true) => Run(law, preset.Source, verner, preset);

    public static Derivation Run(Law law, string source, bool verner = true, Preset? preset = null)
    {
        var segs = Tokenize(source, pie: law == Law.Grimm, geminates: law == Law.HighGerman);
        var unknown = law == Law.Grimm
            ? Enumerable.Range(0, segs.Count).Where(i => !IsKnownPie(segs[i])).ToList()
            : new List<int>();

        var steps = new List<Step>();
        IReadOnlyList<string> form = segs, lawOutput = segs;
        foreach (var rule in RulesFor(law, verner))
        {
            var step = Apply(rule, form);
            steps.Add(step);
            form = step.After;
            if (!rule.IsOther) lawOutput = form;
        }

        // Without Verner the Grimm output cannot reach the attested form; bridging that gap here would credit Verner's work to "other changes".
        if (law == Law.Grimm && verner && preset?.Target is { } target)
        {
            var goal = Tokenize(target);
            if (!goal.SequenceEqual(form))
            {
                steps.Add(OtherStep(preset.OtherNote ?? "", form, goal));
                form = goal;
            }
        }
        return new Derivation(segs, unknown, steps, lawOutput, form);
    }

    private static IEnumerable<Rule> RulesFor(Law law, bool verner) => law switch
    {
        Law.Grimm => verner ? GrimmRules.Append(VernerRule) : GrimmRules,
        Law.VowelShift => VowelShiftRules,
        _ => HighGermanRules,
    };

    private static Step Apply(Rule rule, IReadOnlyList<string> before)
    {
        var after = new List<string>();
        var changedBefore = new List<int>();
        var changedAfter = new List<int>();
        var blocked = new List<Blocked>();
        for (var i = 0; i < before.Count; i++)
        {
            var o = rule.Apply(before, i);
            if (o.To is { } to && to != before[i])
            {
                changedBefore.Add(i);
                if (to.Length > 0)
                {
                    changedAfter.Add(after.Count);
                    after.Add(to);
                }
                continue;
            }
            if (o.Why is { } why) blocked.Add(new Blocked(i, before[i], why));
            after.Add(before[i]);
        }
        return new Step(rule.Name, rule.Environment, rule.IsOther, before, after, changedBefore, changedAfter, blocked);
    }

    // Aligns the two forms (longest common subsequence) so only the segments that really differ are highlighted.
    private static Step OtherStep(string note, IReadOnlyList<string> before, IReadOnlyList<string> after)
    {
        int n = before.Count, m = after.Count;
        var lcs = new int[n + 1, m + 1];
        for (var i = n - 1; i >= 0; i--)
            for (var j = m - 1; j >= 0; j--)
                lcs[i, j] = before[i] == after[j] ? lcs[i + 1, j + 1] + 1 : Math.Max(lcs[i + 1, j], lcs[i, j + 1]);

        var keptBefore = new HashSet<int>();
        var keptAfter = new HashSet<int>();
        for (int i = 0, j = 0; i < n && j < m;)
        {
            if (before[i] == after[j]) { keptBefore.Add(i++); keptAfter.Add(j++); }
            else if (lcs[i + 1, j] >= lcs[i, j + 1]) i++;
            else j++;
        }
        return new Step("Other changes (not Grimm's Law)", note, true, before, after,
            Enumerable.Range(0, n).Where(i => !keptBefore.Contains(i)).ToList(),
            Enumerable.Range(0, m).Where(j => !keptAfter.Contains(j)).ToList(),
            Array.Empty<Blocked>());
    }

    private static Outcome Verner(IReadOnlyList<string> s, int i)
    {
        if (!VernerMap.TryGetValue(s[i], out var to)) return default;
        if (i == 0) return Block("word-initial: Verner's Law never applies there");
        if (VoicelessObstruents.Contains(s[i - 1])) return Block($"next to voiceless {Show(s[i - 1])}: the cluster stays voiceless");
        if (i + 1 < s.Count && VoicelessObstruents.Contains(s[i + 1])) return Block($"next to voiceless {Show(s[i + 1])}: the cluster stays voiceless");
        if (!s.Any(IsAccentedNucleus)) return Block("no accent marked, so Verner's Law cannot be judged");
        var n = PrecedingNucleus(s, i);
        if (n < 0) return Block("no syllable before it");
        if (IsAccentedNucleus(s[n])) return Block("the accent was on the syllable just before: stays voiceless");
        return To(to);
    }

    private static Outcome HgAffricate(IReadOnlyList<string> s, int i)
    {
        var seg = s[i];
        switch (seg)
        {
            case "pp": return To("pf");
            case "tt": return To("ts");
            case "kk": return Block(KeepsK);
            case not ("p" or "t" or "k"): return default;
        }
        var prev = i > 0 ? s[i - 1] : null;
        if (prev is "s" or "f" or "h" or "x") return Block("after s, f or h: unshifted (st, ft, ht)");
        var inPlace = prev is null || (seg == "p" ? prev == "m" : prev is "n" or "l" or "r");
        if (!inPlace) return default;
        return seg == "k" ? Block(KeepsK) : To(seg == "p" ? "pf" : "ts");
    }

    private static Outcome HgFricative(IReadOnlyList<string> s, int i)
    {
        var seg = s[i];
        if (seg is not ("p" or "t" or "k") || i == 0) return default;
        var prev = s[i - 1];
        if (seg == "p" && (prev is "l" or "r")) return To("f");
        if (!IsVowel(prev)) return default;
        var f = seg switch { "p" => "f", "t" => "s", _ => "x" };
        return To(IsLong(prev) || i == s.Count - 1 ? f : f + f);
    }

    // ---------- segments ----------

    public static List<string> Tokenize(string text, bool pie = false, bool geminates = false)
    {
        var s = Decompose(text.Trim().ToLowerInvariant());
        var segs = new List<string>();
        var i = 0;
        while (i < s.Length)
        {
            var c = s[i++];
            if (char.IsWhiteSpace(c) || c is '*' or '/') continue;
            if (IsMark(c) || IsModifier(c)) { segs.Add(c.ToString()); continue; }

            var marks = new List<char>();
            var mods = new StringBuilder();
            while (i < s.Length)
            {
                var n = s[i];
                if (IsMark(n)) marks.Add(n);
                else if (IsModifier(n)) mods.Append(n);
                else if (pie && n == 'h' && (c is 'b' or 'd' or 'g') && !mods.ToString().Contains('ʰ')) mods.Append('ʰ');
                else if (pie && c == 'h' && (n is >= '1' and <= '3') && mods.Length == 0) mods.Append((char)('₀' + (n - '0')));
                else break;
                i++;
            }
            var seg = c + string.Concat(marks.OrderBy(MarkRank)) + mods;
            if (geminates && seg.Length == 1 && i < s.Length && s[i] == c && !IsVowel(seg)) { seg += c; i++; }
            segs.Add(seg);
        }
        return segs;
    }

    public static string Show(string segment)
    {
        var sb = new StringBuilder();
        for (var i = 0; i < segment.Length;)
        {
            var hit = ComposeOrder.FirstOrDefault(p => string.CompareOrdinal(segment, i, p.Dec, 0, p.Dec.Length) == 0);
            if (hit.Dec is null) sb.Append(segment[i++]);
            else { sb.Append(hit.Pre); i += hit.Dec.Length; }
        }
        return sb.ToString();
    }

    public static string Join(IEnumerable<string> segments) => string.Concat(segments.Select(Show));

    public static string Canonical(string text, Law law = Law.VowelShift) =>
        Join(Tokenize(text, pie: law == Law.Grimm, geminates: law == Law.HighGerman));

    public static bool IsKnownPie(string seg)
    {
        if (PieStops.Contains(seg) || PieOther.Contains(seg)) return true;
        if (IsSyllabic(seg)) return seg.Length == 3 && seg[2] == Acute;
        if (seg.Length == 0 || "aeiouə".IndexOf(seg[0]) < 0) return false;
        return seg.Skip(1).All(c => c is Macron or Acute) && seg.Length <= 3;
    }

    private static int PrecedingNucleus(IReadOnlyList<string> s, int i)
    {
        for (var j = i - 1; j >= 0; j--)
        {
            if (IsVowel(s[j]) || IsSyllabic(s[j])) return j;
            // A laryngeal between consonants was itself a syllable (*ph₂tḗr, pronounced roughly pətḗr).
            if (IsLaryngeal(s[j]) && j > 0 && j + 1 < s.Count && IsConsonant(s[j - 1]) && IsConsonant(s[j + 1])) return j;
        }
        return -1;
    }

    private static bool IsVowel(string seg) => seg.Length > 0 && "aeiouəɛɔɪʊæ".IndexOf(seg[0]) >= 0;
    private static bool IsSyllabic(string seg) => seg.Length > 1 && "mnrl".IndexOf(seg[0]) >= 0 && seg[1] == Ring;
    private static bool IsLaryngeal(string seg) => seg.Length == 2 && seg[0] == 'h' && seg[1] is >= '₁' and <= '₃';
    private static bool IsConsonant(string seg) => seg.Length > 0 && seg != "-" && !IsVowel(seg) && !IsSyllabic(seg);
    private static bool IsLong(string seg) => seg.Contains(Macron) || seg.Contains('ː');
    private static bool IsAccentedNucleus(string seg) => (IsVowel(seg) || IsSyllabic(seg)) && seg.Contains(Acute);

    private static bool IsMark(char c) => c is >= '̀' and <= 'ͯ';
    private static bool IsModifier(char c) => c is 'ʰ' or 'ʷ' or 'ː' or (>= '₁' and <= '₃');
    private static int MarkRank(char c) => c switch { '̥' or '̨' or '̩' => 0, Macron => 1, Acute => 2, _ => 3 };

    private static string Decompose(string text)
    {
        var sb = new StringBuilder(text.Length);
        foreach (var c in text)
        {
            if (DecomposeMap.TryGetValue(c, out var dec)) sb.Append(dec);
            else sb.Append(c);
        }
        return sb.ToString();
    }

    // Glues multi-letter sounds (əɪ, pf) into one segment, as rule outputs are stored.
    private static string Canon(string seg) => string.Concat(Tokenize(seg));

    private static Dictionary<string, string> Pairs(params string[] pairs) =>
        pairs.Select(p => p.Split(' ')).ToDictionary(p => Canon(p[0]), p => Canon(p[1]));

    // ---------- rule plumbing ----------

    private readonly record struct Outcome(string? To, string? Why);
    private static Outcome To(string seg) => new(seg, null);
    private static Outcome Block(string why) => new(null, why);

    private sealed record Rule(string Name, string Environment, Func<IReadOnlyList<string>, int, Outcome> Apply, bool IsOther = false);

    private static Func<IReadOnlyList<string>, int, Outcome> Map(Dictionary<string, string> map,
        Func<IReadOnlyList<string>, int, string?>? exception = null) =>
        (s, i) => !map.TryGetValue(s[i], out var to) ? default
            : exception?.Invoke(s, i) is { } why ? Block(why)
            : To(to);
}
