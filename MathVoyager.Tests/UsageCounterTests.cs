using System.Net;
using System.Text.Json;
using MathVoyager.Models;
using MathVoyager.Services;
using Microsoft.JSInterop;

namespace MathVoyager.Tests;

// The privacy promise for usage counts: only content ids leave the device, only for finished days, and nothing at all
// once the player turns the switch off.
public class UsageCounterTests
{
    [Fact]
    public async Task FinishedDay_SendsOnlyCountsKeyedByContentId_ThenClears()
    {
        var (counter, storage, http) = Make(share: true, tally: """{"Day":"2000-01-01","Counts":{"topic:scratch-fire":2}}""");

        await counter.FlushAsync();

        var body = Assert.Single(http.Bodies);
        using var doc = JsonDocument.Parse(body);
        Assert.Equal(["counts"], doc.RootElement.EnumerateObject().Select(p => p.Name));
        Assert.Equal(2, doc.RootElement.GetProperty("counts").GetProperty("topic:scratch-fire").GetInt32());
        Assert.False(storage.Items.ContainsKey("nous-usage"));
    }

    [Fact]
    public async Task TodaysTally_IsNotSentYet()
    {
        var (counter, _, http) = Make(share: true, tally: null);
        await counter.CountAsync("topic", "scratch-fire");

        await counter.FlushAsync();

        Assert.Empty(http.Bodies);
    }

    [Fact]
    public async Task SwitchedOff_CountsNothing_AndDropsAnUnsentTally()
    {
        var (counter, storage, http) = Make(share: false, tally: """{"Day":"2000-01-01","Counts":{"topic:scratch-fire":2}}""");

        await counter.CountAsync("topic", "scratch-water");
        await counter.FlushAsync();

        Assert.Empty(http.Bodies);
        Assert.False(storage.Items.ContainsKey("nous-usage"));
    }

    [Fact]
    public async Task FailedSend_KeepsTheTallyForTheNextLaunch()
    {
        var (counter, storage, http) = Make(share: true, tally: """{"Day":"2000-01-01","Counts":{"topic:scratch-fire":2}}""");
        http.Status = HttpStatusCode.ServiceUnavailable;

        await counter.FlushAsync();

        Assert.Contains("\"topic:scratch-fire\":2", storage.Items["nous-usage"]);
        Assert.Contains("2000-01-01", storage.Items["nous-usage"]);
    }

    [Fact]
    public async Task NoConnection_FailsSilently_AndKeepsTheTally()
    {
        var (counter, storage, http) = Make(share: true, tally: """{"Day":"2000-01-01","Counts":{"topic:scratch-fire":2}}""");
        http.Offline = true;

        await counter.FlushAsync();
        await counter.CountAsync("topic", "scratch-water");

        Assert.Contains("\"topic:scratch-fire\":2", storage.Items["nous-usage"]);
        Assert.Contains("\"topic:scratch-water\":1", storage.Items["nous-usage"]);
    }

    private static (UsageCounter, MemoryStorage, RecordingHandler) Make(bool share, string? tally)
    {
        var storage = new MemoryStorage();
        storage.Items["mathvoyager_profile"] = JsonSerializer.Serialize(new UserProfile { SchemaVersion = 2, ShareUsageCounts = share });
        if (tally != null) storage.Items["nous-usage"] = tally;
        var handler = new RecordingHandler();
        var counter = new UsageCounter(storage, new ProgressService(storage, null!), new HttpClient(handler));
        return (counter, storage, handler);
    }

    private sealed class MemoryStorage : IJSRuntime
    {
        public Dictionary<string, string> Items { get; } = new();

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
        {
            var key = args?.FirstOrDefault() as string ?? "";
            switch (identifier)
            {
                case "localStorage.getItem":
                    return new((TValue)(object?)Items.GetValueOrDefault(key)!);
                case "localStorage.setItem":
                    Items[key] = (string)args![1]!;
                    break;
                case "localStorage.removeItem":
                    Items.Remove(key);
                    break;
            }
            return new(default(TValue)!);
        }

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args) =>
            InvokeAsync<TValue>(identifier, args);
    }

    private sealed class RecordingHandler : HttpMessageHandler
    {
        public List<string> Bodies { get; } = new();
        public HttpStatusCode Status { get; set; } = HttpStatusCode.OK;
        public bool Offline { get; set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (Offline) throw new HttpRequestException("No such host is known.");
            Bodies.Add(await request.Content!.ReadAsStringAsync(cancellationToken));
            return new HttpResponseMessage(Status);
        }
    }
}
