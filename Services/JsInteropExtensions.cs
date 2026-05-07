using Microsoft.JSInterop;

namespace MathVoyager.Services;

public static class JsInteropExtensions
{
    public static async ValueTask TryInvokeVoidAsync(this IJSRuntime js, string identifier, params object?[] args)
    {
        try
        {
            await js.InvokeVoidAsync(identifier, args);
        }
        catch (Exception ex)
        {
            await LogAsync(js, identifier, ex);
        }
    }

    public static async ValueTask<T?> TryInvokeAsync<T>(this IJSRuntime js, string identifier, params object?[] args)
    {
        try
        {
            return await js.InvokeAsync<T>(identifier, args);
        }
        catch (Exception ex)
        {
            await LogAsync(js, identifier, ex);
            return default;
        }
    }

    public static async ValueTask LogErrorAsync(this IJSRuntime js, string source, Exception ex)
    {
        try
        {
            await js.InvokeVoidAsync("PhineErrorLog.add", source, ex.Message, ex.ToString());
        }
        catch { /* logger itself broken — give up */ }
    }

    private static async ValueTask LogAsync(IJSRuntime js, string identifier, Exception ex)
    {
        try
        {
            await js.InvokeVoidAsync("PhineErrorLog.add", $"js:{identifier}", ex.Message, ex.ToString());
        }
        catch { /* logger itself broken — give up */ }
    }
}
