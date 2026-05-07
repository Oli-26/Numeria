using Microsoft.JSInterop;
using MathVoyager.Models;

namespace MathVoyager.Services;

public class TtsService : ITtsService
{
    private readonly IJSRuntime _js;

    public TtsService(IJSRuntime js)
    {
        _js = js;
    }

    public async Task<bool> IsSupportedAsync()
    {
        try
        {
            return await _js.InvokeAsync<bool>("eval", "!!(window.TTS && window.TTS.supported)");
        }
        catch
        {
            return false;
        }
    }

    public async Task<List<TtsVoice>> GetVoicesAsync()
    {
        try
        {
            // TTS.getVoices() returns a Promise<Array<{name,lang}>> — Blazor JS interop
            // awaits Promise-returning functions automatically.
            var voices = await _js.InvokeAsync<TtsVoice[]>("TTS.getVoices");
            return voices?.ToList() ?? new List<TtsVoice>();
        }
        catch
        {
            return new List<TtsVoice>();
        }
    }

    public async Task SpeakConceptAsync(Concept concept, double rate = 1.0, string? voice = null, CancellationToken cancellationToken = default)
    {
        if (cancellationToken.IsCancellationRequested) return;

        try
        {
            // Build a plain object that JS can read
            var conceptObj = new
            {
                title = concept.Title,
                contentHtml = concept.ContentHtml,
                mathExpressions = concept.MathExpressions
            };

            var opts = new
            {
                rate,
                voice = voice ?? ""
            };

            // Use a TaskCompletionSource so we can cancel mid-speech
            var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);

            var speakTask = _js.InvokeAsync<object>("TTS.speakConcept", conceptObj, opts).AsTask();
            var cancelTask = Task.Delay(Timeout.Infinite, cts.Token);

            var completed = await Task.WhenAny(speakTask, cancelTask);
            if (completed == cancelTask)
            {
                await StopAsync();
            }
            else
            {
                await speakTask; // propagate any exception
            }
        }
        catch (OperationCanceledException)
        {
            await StopAsync();
        }
        catch
        {
            // Degrade gracefully — TTS unavailable or blocked
        }
    }

    public async Task PauseAsync()
    {
        await _js.TryInvokeVoidAsync("TTS.pause");
    }

    public async Task ResumeAsync()
    {
        await _js.TryInvokeVoidAsync("TTS.resume");
    }

    public async Task StopAsync()
    {
        await _js.TryInvokeVoidAsync("TTS.stop");
    }

    public async Task<bool> IsSpeakingAsync()
    {
        try { return await _js.InvokeAsync<bool>("TTS.isSpeaking"); }
        catch { return false; }
    }

    public async Task<bool> IsPausedAsync()
    {
        try { return await _js.InvokeAsync<bool>("TTS.isPaused"); }
        catch { return false; }
    }
}
