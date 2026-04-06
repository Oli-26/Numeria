namespace MathVoyager.Services;

public interface IThemeService
{
    Task<string> GetActiveThemeAsync();
    Task ApplyThemeAsync(string themeId);
}
