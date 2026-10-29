using MathVoyager.Components;
using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class HallOfFameCardTests
{
    private static readonly string Fallback = Icon.PathFor("no-such-icon");

    [Fact]
    public void EveryFigure_HasARealEmblem_AndItsIdRoundTrips()
    {
        foreach (var d in HallOfFame.Domains)
            foreach (var f in HallOfFame.ForDomain(d))
            {
                var card = HallOfFame.Card(d, f);
                Assert.NotEqual(Fallback, Icon.PathFor(card.Emblem));
                Assert.True(HallOfFame.Same(card, HallOfFame.Resolve(card.Id)), $"{card.Id} does not resolve back to {f.Name}");
            }
    }

    [Theory]
    [InlineData("avatar-euler", "math", "Euler")]
    [InlineData("avatar-curie", "physics", "Curie")]
    [InlineData("avatar-hypatia", "math", "Hypatia")]
    public void ShopAvatarsBoughtEarlier_StillResolve(string id, string domain, string name)
    {
        var card = HallOfFame.Resolve(id);
        Assert.NotNull(card);
        Assert.Equal((domain, name), (card!.Domain, card.Name));
        Assert.NotEqual(Fallback, Icon.PathFor(card.Emblem));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("default")]
    [InlineData("hof:math/nobody")]
    [InlineData("<script>")]
    public void UnknownIds_FallBackToTheInitial(string? id) => Assert.Null(HallOfFame.Resolve(id));

    [Fact]
    public void Unlocked_ListsOnlyOwnedHallsAndAvatars_WithoutDuplicates()
    {
        var profile = new UserProfile { ShopPurchases = new() { HallOfFame.UnlockId("math"), "avatar-euler", "avatar-curie" } };
        var cards = HallOfFame.Unlocked(profile);

        Assert.Equal(HallOfFame.ForDomain("math").Count + 1, cards.Count);
        Assert.All(cards, c => Assert.True(c.Domain == "math" || c.Name == "Curie"));
        Assert.Single(cards, c => c.Name == "Euler");
        Assert.Empty(HallOfFame.Unlocked(new UserProfile { ShopPurchases = new() }));
    }

    private static readonly Dictionary<string, Topic> Topics = new()
    {
        ["calculus"] = new Topic { Id = "calculus", Name = "Calculus", Domain = "math", Color = "#4A90D9", Difficulty = "Advanced → Graduate" },
        ["bio-cell"] = new Topic { Id = "bio-cell", Name = "Cell Biology", Domain = "biology", Color = "#5B8A3C", Difficulty = "Beginner → Intermediate" },
    };

    [Fact]
    public void TopicCardIds_ResolveOnlyAgainstKnownTopics()
    {
        var card = HallOfFame.Resolve("card:calculus", Topics);
        Assert.NotNull(card);
        Assert.Equal(("calculus", "gold"), (card!.TopicId, card.Tier));
        Assert.Null(HallOfFame.Resolve("card:calculus"));
        Assert.Null(HallOfFame.Resolve("card:not-a-topic", Topics));
    }

    [Theory]
    [InlineData("card:calculus", "card:calculus")]
    [InlineData("hof:math/euler", "hof:math/euler")]
    [InlineData("card:<script>", null)]
    [InlineData("card:", null)]
    [InlineData("default", null)]
    public void PostableId_KeepsOnlyWellFormedIds(string id, string? expected) => Assert.Equal(expected, HallOfFame.PostableId(id));

    [Fact]
    public void EarnedTopicCards_NewestFirst_SkippingRetiredTopics()
    {
        var profile = new UserProfile { CompletionCards = new()
        {
            new CompletionCard { TopicId = "bio-cell", EarnedDate = "2026-09-01" },
            new CompletionCard { TopicId = "retired-topic", EarnedDate = "2026-10-01" },
            new CompletionCard { TopicId = "calculus", EarnedDate = "2026-10-20" },
        } };

        var cards = HallOfFame.EarnedTopicCards(profile, Topics);

        Assert.Equal(new[] { "calculus", "bio-cell" }, cards.Select(c => c.TopicId));
        Assert.True(HallOfFame.Same(cards[0], HallOfFame.Resolve("card:calculus", Topics)));
        Assert.False(HallOfFame.Same(cards[0], cards[1]));
    }

    [Fact]
    public void TopicArtInner_DropsTheSvgWrapper()
    {
        foreach (var id in Topics.Keys.Append("unknown-topic"))
        {
            var inner = TopicArt.Inner(id);
            Assert.DoesNotContain("<svg", inner);
            Assert.DoesNotContain("</svg>", inner);
            Assert.NotEmpty(inner);
        }
    }
}
