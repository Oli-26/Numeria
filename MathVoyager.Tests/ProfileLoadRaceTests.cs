using System.Text.Json;
using MathVoyager.Models;
using MathVoyager.Services;
using Microsoft.JSInterop;

namespace MathVoyager.Tests;

public class ProfileLoadRaceTests
{
    // Reproducer: Home raised the streak and saved it, then a caller holding a second copy from the same startup
    // load saved that copy and put yesterday's streak back.
    [Fact]
    public async Task ConcurrentFirstLoads_ShareOneProfile_SoASaveCannotBeUndoneByAStaleCopy()
    {
        var js = new GatedStorage(JsonSerializer.Serialize(new UserProfile { SchemaVersion = 2, CurrentStreak = 3 }));
        var progress = new ProgressService(js, null!);

        var layoutLoad = progress.GetProfileAsync();
        var homeLoad = progress.GetProfileAsync();
        Assert.False(layoutLoad.IsCompleted, "the gate should hold the first load open");
        js.Release();
        var layoutCopy = await layoutLoad;
        var homeCopy = await homeLoad;

        Assert.Same(homeCopy, layoutCopy);
        homeCopy.CurrentStreak = 4;
        await progress.SaveProfileAsync(homeCopy);
        await progress.SaveProfileAsync(layoutCopy);
        Assert.Equal(4, (await progress.GetProfileAsync()).CurrentStreak);
    }

    // localStorage.getItem stays pending until Release, so both loads are in flight together.
    private sealed class GatedStorage(string json) : IJSRuntime
    {
        private readonly TaskCompletionSource gate = new();
        public void Release() => gate.SetResult();

        public async ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
        {
            if (identifier == "localStorage.getItem")
            {
                await gate.Task;
                return (TValue)(object)json;
            }
            return default!;
        }

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args) =>
            InvokeAsync<TValue>(identifier, args);
    }
}
