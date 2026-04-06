using Microsoft.JSInterop;

namespace MathVoyager.Services;

public class ThemeService : IThemeService
{
    private readonly IJSRuntime _js;
    private readonly IProgressService _progress;

    public ThemeService(IJSRuntime js, IProgressService progress)
    {
        _js = js;
        _progress = progress;
    }

    public async Task<string> GetActiveThemeAsync()
    {
        var profile = await _progress.GetProfileAsync();
        return profile.SelectedTheme;
    }

    public async Task ApplyThemeAsync(string themeId)
    {
        var profile = await _progress.GetProfileAsync();
        profile.SelectedTheme = themeId;
        await _progress.SaveProfileAsync(profile);
        await _js.InvokeVoidAsync("applyTheme", themeId);
    }
}
