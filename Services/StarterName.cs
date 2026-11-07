namespace MathVoyager.Services;

// A ready-made display name so onboarding never has to ask. The number keeps players apart on the leaderboard,
// which is keyed by name; every combination fits its 20-character limit.
public static class StarterName
{
    public static readonly string[] Adjectives =
    {
        "Curious", "Wandering", "Bright", "Quiet", "Bold", "Clever", "Restless", "Keen", "Patient", "Lucky",
        "Calm", "Gentle", "Swift", "Wise", "Merry", "Brave", "Nimble", "Sunny", "Eager", "Wild"
    };

    public static readonly string[] Animals =
    {
        "Owl", "Fox", "Heron", "Otter", "Raven", "Lynx", "Moth", "Badger", "Wren", "Hare",
        "Newt", "Crow", "Finch", "Marten", "Gecko", "Ibis", "Puffin", "Stoat", "Lemur", "Tapir"
    };

    public static string Generate(Random rng) =>
        $"{Adjectives[rng.Next(Adjectives.Length)]} {Animals[rng.Next(Animals.Length)]} {rng.Next(10, 1000)}";
}
