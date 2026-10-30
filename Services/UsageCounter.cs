using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.JSInterop;

namespace MathVoyager.Services;

// Anonymous usage counts (see privacy.md): tallies of which subjects, topics, lessons and courses get opened, kept on
// the device and sent at most once a day to workers/usage with no identifier of any kind. With the Settings switch
// off, nothing is counted, kept or sent.
public class UsageCounter : IUsageCounter
{
    private const string Endpoint = "https://nous-usage.brightonleftcontact.workers.dev/count";
    private const string StorageKey = "nous-usage";
    private readonly IJSRuntime _js;
    private readonly IProgressService _progress;
    private readonly HttpClient _http;

    private class Tally
    {
        public string Day { get; set; } = "";
        public Dictionary<string, int> Counts { get; set; } = new();
    }

    public UsageCounter(IJSRuntime js, IProgressService progress, HttpClient http)
    {
        _js = js;
        _progress = progress;
        _http = http;
    }

    public async Task CountAsync(string kind, string id)
    {
        try
        {
            if (!(await _progress.GetProfileAsync()).ShareUsageCounts) return;
            var tally = await LoadAsync();
            var key = $"{kind}:{id}";
            tally.Counts[key] = tally.Counts.GetValueOrDefault(key) + 1;
            await _js.InvokeVoidAsync("localStorage.setItem", StorageKey, JsonSerializer.Serialize(tally));
        }
        catch { /* counting must never get in the way of the app */ }
    }

    // Only a finished day is sent, so no request reveals when during the day anything happened.
    public async Task FlushAsync()
    {
        try
        {
            var tally = await LoadAsync();
            if (tally.Counts.Count == 0 || tally.Day == Today) return;
            if (!(await _progress.GetProfileAsync()).ShareUsageCounts) { await ClearAsync(); return; }
            // Take the tally out before sending, so counts made while the request is in flight start a fresh one.
            await ClearAsync();
            var sent = false;
            try { sent = (await _http.PostAsJsonAsync(Endpoint, new { counts = tally.Counts })).IsSuccessStatusCode; }
            catch { /* offline */ }
            if (!sent) await MergeBackAsync(tally);
        }
        catch { }
    }

    public async Task ClearAsync()
    {
        try { await _js.InvokeVoidAsync("localStorage.removeItem", StorageKey); }
        catch { }
    }

    // A failed send goes back into storage, keeping its older day so it is retried at the next launch.
    private async Task MergeBackAsync(Tally unsent)
    {
        var current = await LoadAsync();
        foreach (var (key, n) in current.Counts) unsent.Counts[key] = unsent.Counts.GetValueOrDefault(key) + n;
        await _js.InvokeVoidAsync("localStorage.setItem", StorageKey, JsonSerializer.Serialize(unsent));
    }

    private static string Today => DateTime.Now.ToString("yyyy-MM-dd");

    private async Task<Tally> LoadAsync()
    {
        var json = await _js.InvokeAsync<string?>("localStorage.getItem", StorageKey);
        var tally = string.IsNullOrEmpty(json) ? null : JsonSerializer.Deserialize<Tally>(json);
        return tally ?? new Tally { Day = Today };
    }
}
