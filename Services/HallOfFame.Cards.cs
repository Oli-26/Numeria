using System.Text.RegularExpressions;
using MathVoyager.Models;

namespace MathVoyager.Services;

public static partial class HallOfFame
{
    // A wearable avatar; Id is what UserProfile.SelectedAvatar stores. TopicId is set for an earned Hall of Cards card,
    // which draws the topic's art in a tier-coloured rim instead of a figure's emblem.
    public record AvatarCard(string Id, string Name, string Domain, string Color, string Emblem, string? TopicId = null, string? Tier = null);

    private const string TopicCardPrefix = "card:";
    private static readonly Regex TopicCardIdPattern = new("^card:[a-z0-9-]{1,60}$");

    public static AvatarCard TopicCard(Topic t) =>
        new(TopicCardPrefix + t.Id, t.Name, t.Domain, t.Color, "", t.Id, TopicArt.Tier(t.Difficulty));

    // Topic cards the player has earned, newest first.
    public static List<AvatarCard> EarnedTopicCards(UserProfile profile, IReadOnlyDictionary<string, Topic> topics) =>
        profile.CompletionCards.OrderByDescending(c => c.EarnedDate).Select(c => c.TopicId).Distinct()
            .Where(topics.ContainsKey).Select(id => TopicCard(topics[id])).ToList();

    // The id to send to the leaderboard, or null. Topic card ids are checked by shape, so posting never waits on content.
    public static string? PostableId(string? id) =>
        id != null && TopicCardIdPattern.IsMatch(id) ? id : Resolve(id)?.Id;

    public static readonly string[] Domains =
        { "math", "philosophy", "physics", "biology", "chemistry", "geology", "history", "linguistics", "materials", "cs", "misc", "politics", "economics", "media", "literature" };

    public static string UnlockId(string domain) => $"unlock-halloffame-{domain}";

    public static string Slug(string name) => Regex.Replace(name.ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');

    public static AvatarCard Card(string domain, Figure f) =>
        new($"hof:{domain}/{Slug(f.Name)}", f.Name, domain, f.Color, emblems.GetValueOrDefault($"{domain}/{f.Name}", DomainEmblem(domain)));

    // The card for a saved avatar id, or null for the default initial. Takes Hall of Fame ids, older shop avatar ids,
    // and topic card ids (these resolve only when the topics are passed in).
    public static AvatarCard? Resolve(string? id, IReadOnlyDictionary<string, Topic>? topics = null)
    {
        if (string.IsNullOrEmpty(id)) return null;
        if (id.StartsWith(TopicCardPrefix))
            return topics != null && topics.TryGetValue(id[TopicCardPrefix.Length..], out var topic) ? TopicCard(topic) : null;
        if (id.StartsWith("hof:"))
        {
            var parts = id[4..].Split('/', 2);
            var f = parts.Length == 2 ? ForDomain(parts[0]).FirstOrDefault(x => Slug(x.Name) == parts[1]) : null;
            return f == null ? null : Card(parts[0], f);
        }
        if (!shopAvatars.TryGetValue(id, out var s)) return null;
        var inHall = s.InHall ? ForDomain(s.Domain).FirstOrDefault(x => x.Name == s.Name) : null;
        return inHall != null
            ? Card(s.Domain, inHall)
            : new AvatarCard(id, s.Name, s.Domain, ForDomain(s.Domain).FirstOrDefault()?.Color ?? "#6B5E50",
                emblems.GetValueOrDefault($"{s.Domain}/{s.Name}", DomainEmblem(s.Domain)));
    }

    // Cards the player can wear: every figure in a Hall of Fame they have unlocked, plus shop avatars they bought.
    public static List<AvatarCard> Unlocked(UserProfile profile)
    {
        var cards = new List<AvatarCard>();
        foreach (var d in Domains.Where(d => profile.ShopPurchases.Contains(UnlockId(d))))
            cards.AddRange(ForDomain(d).OrderBy(f => f.Birth).Select(f => Card(d, f)));
        foreach (var id in profile.ShopPurchases.Where(shopAvatars.ContainsKey))
            if (Resolve(id) is { } c && !cards.Any(x => Same(x, c))) cards.Add(c);
        return cards;
    }

    // A legacy shop id and a Hall of Fame id can name the same figure.
    public static bool Same(AvatarCard? a, AvatarCard? b) =>
        a != null && b != null && (a.TopicId != null || b.TopicId != null ? a.Id == b.Id : a.Domain == b.Domain && a.Name == b.Name);

    private static string DomainEmblem(string domain) => domain switch
    {
        "philosophy" => "philosophy",
        "physics" => "atom",
        "biology" => "dna-strand",
        "chemistry" => "benzene",
        "geology" => "mountain",
        "history" => "scroll",
        "linguistics" => "speech-bubbles",
        "materials" => "crystal-cluster",
        "cs" => "code",
        "misc" => "eye",
        "politics" => "balance-scale",
        "economics" => "coin",
        "media" => "antenna",
        "literature" => "quill",
        _ => "integral"
    };
}
