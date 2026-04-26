namespace MathVoyager.Models;

public class ShopItem
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Category { get; set; } = "";
    public int Price { get; set; }
    public string Icon { get; set; } = "";
    public Dictionary<string, string> UnlockData { get; set; } = new();
    // Null means universal (shown in all domains). Non-null restricts to that domain.
    public string? Domain { get; set; }
}
