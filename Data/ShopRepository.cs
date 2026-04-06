using System.Net.Http.Json;
using MathVoyager.Models;

namespace MathVoyager.Data;

public class ShopRepository : IShopRepository
{
    private readonly HttpClient _http;
    private List<ShopItem>? _items;

    public ShopRepository(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<ShopItem>> GetShopItemsAsync()
    {
        _items ??= await _http.GetFromJsonAsync<List<ShopItem>>("data/shop.json") ?? new();
        return _items;
    }

    public async Task<List<ShopItem>> GetShopItemsByCategoryAsync(string category)
    {
        var items = await GetShopItemsAsync();
        return items.Where(i => i.Category == category).ToList();
    }
}
