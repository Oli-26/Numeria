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
}
