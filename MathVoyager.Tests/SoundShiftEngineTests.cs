using MathVoyager.Services;
using static MathVoyager.Services.SoundShiftEngine;

namespace MathVoyager.Tests;

public class SoundShiftEngineTests
{
    private static Preset Find(IReadOnlyList<Preset> list, string word) => list.Single(p => p.Word == word);
    private static string C(string text) => Canonical(text);

    // word, form after Grimm + Verner, Proto-Germanic after the other changes
    public static readonly TheoryData<string, string, string> GrimmCases = new()
    {
        { "foot", "fṓts", "fōts" },
        { "three", "θréyez", "θrīz" },
        { "brother", "bréh₂θēr", "brōθēr" },
        { "ten", "téxm̥", "texun" },
        { "knee", "knéwom", "knewą" },
        { "guest", "góstiz", "gastiz" },
        { "what", "xʷót", "xʷat" },
        { "father", "fh₂dḗr", "fadēr" },
        { "hundred", "xm̥dóm", "xundą" },
        { "star", "h₂ster-", "ster-" },
        { "eight", "oxtṓw", "axtōu" },
        { "water", "wót-", "wat-" },
    };

    [Theory]
    [MemberData(nameof(GrimmCases))]
    public void Grimm_preset_reaches_expected_forms(string word, string afterLaws, string protoGermanic)
    {
        var d = Run(Law.Grimm, Find(GrimmPresets, word));

        Assert.Empty(d.Unknown);
        Assert.Equal(C(afterLaws), Join(d.LawOutput));
        Assert.Equal(C(protoGermanic), d.OutputText);
        Assert.Equal(C(protoGermanic), C(Find(GrimmPresets, word).Target!));
    }

    [Fact]
    public void Every_grimm_preset_is_tested()
    {
        var tested = GrimmCases.Select(row => (string)row[0]).OrderBy(w => w);
        Assert.Equal(tested, GrimmPresets.Select(p => p.Word).OrderBy(w => w));
    }

    [Fact]
    public void Other_changes_are_a_separate_step_never_credited_to_grimm()
    {
        var d = Run(Law.Grimm, Find(GrimmPresets, "father"));

        var other = d.Steps.Last();
        Assert.True(other.IsOther);
        Assert.Equal(C("fh₂dḗr"), Join(other.Before));
        Assert.All(d.Steps.Take(d.Steps.Count - 1), s => Assert.False(s.IsOther));
    }

    [Theory]
    [InlineData("father", "fh₂θḗr")]
    [InlineData("hundred", "xm̥θóm")]
    [InlineData("three", "θréyes")]
    [InlineData("guest", "góstis")]
    public void Without_verner_grimm_alone_misses_the_attested_consonant(string word, string grimmOnly)
    {
        var d = Run(Law.Grimm, Find(GrimmPresets, word), verner: false);

        Assert.Equal(C(grimmOnly), d.OutputText);
        Assert.DoesNotContain(d.Steps, s => s.IsOther);
    }

    [Fact]
    public void Accent_on_preceding_syllable_blocks_verner()
    {
        var d = Run(Law.Grimm, Find(GrimmPresets, "brother"));
        var verner = d.Steps.Single(s => s.Name == "Verner's Law");

        Assert.False(verner.Fired);
        Assert.Contains(verner.Blocked, b => b.Segment == "θ" && b.Reason.Contains("accent"));
    }

    [Fact]
    public void Grimm_steps_do_not_feed_each_other()
    {
        // d devoices to t in step 2, after step 1 has already run, so it must not go on to θ.
        Assert.Equal(C("té"), Run(Law.Grimm, "dé").OutputText);
        Assert.Equal(C("b"), Run(Law.Grimm, "bʰ").OutputText);
    }

    [Fact]
    public void Stop_after_s_and_second_stop_of_cluster_do_not_shift()
    {
        var star = Run(Law.Grimm, "h₂stḗr").Steps[0];
        Assert.Contains(star.Blocked, b => b.Segment == "t" && b.Reason.Contains("after s"));

        var eight = Run(Law.Grimm, "oḱtṓw").Steps[0];
        Assert.Contains(eight.Blocked, b => b.Segment == "t" && b.Reason.Contains("cluster"));
        Assert.Equal(C("oxtṓw"), Join(eight.After));
    }

    [Fact]
    public void Ascii_shortcuts_match_palette_symbols()
    {
        Assert.Equal(Tokenize("bʰréh₂tēr", pie: true), Tokenize("*bhréh2tēr", pie: true));
        Assert.Equal(Tokenize("gʷʰ", pie: true), Tokenize("gʷh", pie: true));
        Assert.Single(Tokenize("ḗ"));
        Assert.Equal(Tokenize("ḗ"), Tokenize("ḗ"));
    }

    [Fact]
    public void Unknown_symbols_are_flagged()
    {
        var d = Run(Law.Grimm, "frāter");

        Assert.Equal(new[] { 0 }, d.Unknown);
        Assert.Equal("f", d.Source[0]);
    }

    [Fact]
    public void Word_with_no_affected_sound_reports_no_change()
    {
        var d = Run(Law.Grimm, "h₁ésti");

        Assert.False(d.LawChanged);
        Assert.Contains(d.Steps[0].Blocked, b => b.Segment == "t");
    }

    [Fact]
    public void Verner_needs_an_accent_mark()
    {
        var d = Run(Law.Grimm, "pater");

        Assert.Equal(C("faθer"), d.OutputText);
        Assert.Contains(d.Steps.Last().Blocked, b => b.Reason.Contains("no accent"));
    }

    [Theory]
    [InlineData("bite", "baɪt")]
    [InlineData("house", "haʊs")]
    [InlineData("meet", "miːt")]
    [InlineData("food", "fuːd")]
    [InlineData("meat", "miːt")]
    [InlineData("name", "neɪm")]
    [InlineData("stone", "stoʊn")]
    [InlineData("mouse", "maʊs")]
    public void Vowel_shift_preset_gives_modern_ipa(string word, string modern)
    {
        Assert.Equal(C(modern), Run(Law.VowelShift, Find(VowelShiftPresets, word)).OutputText);
    }

    [Fact]
    public void Vowel_shift_presets_are_all_tested_and_chain_shifts_once()
    {
        Assert.Equal(8, VowelShiftPresets.Count);
        // oː reaches uː after the old uː has diphthongised, so food never becomes faʊd.
        var food = Run(Law.VowelShift, Find(VowelShiftPresets, "food"));
        Assert.Equal(1, food.Steps.Count(s => s.Fired));
    }

    [Fact]
    public void Final_e_loss_is_marked_as_other_change()
    {
        var name = Run(Law.VowelShift, Find(VowelShiftPresets, "name"));

        Assert.True(name.Steps[0].IsOther);
        Assert.True(name.Steps[0].Fired);
        Assert.Equal(C("naːm"), Join(name.Steps[0].After));
    }

    [Theory]
    [InlineData("apple", "apful")]
    [InlineData("water", "wassar")]
    [InlineData("tide", "tsīt")]
    [InlineData("make", "maxxōn")]
    [InlineData("pepper", "pfeffar")]
    [InlineData("day", "tag")]
    [InlineData("open", "offan")]
    [InlineData("ten", "tsehan")]
    [InlineData("two", "tswai")]
    [InlineData("heart", "hertsa")]
    public void High_german_preset_gives_old_high_german(string word, string ohg)
    {
        Assert.Equal(C(ohg), Run(Law.HighGerman, Find(HighGermanPresets, word)).OutputText);
    }

    [Fact]
    public void High_german_presets_are_all_tested_and_k_stays_initially()
    {
        Assert.Equal(10, HighGermanPresets.Count);
        var korn = Run(Law.HighGerman, "korn");
        Assert.Equal(C("korn"), korn.OutputText);
        Assert.Contains(korn.Steps[0].Blocked, b => b.Segment == "k");
    }
}
