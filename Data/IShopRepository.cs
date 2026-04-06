using MathVoyager.Models;

namespace MathVoyager.Data;

public interface IShopRepository
{
    Task<List<ShopItem>> GetShopItemsAsync();
    Task<List<ShopItem>> GetShopItemsByCategoryAsync(string category);
}
