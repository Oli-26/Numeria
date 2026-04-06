using Microsoft.JSInterop;

namespace MathVoyager.Services;

public class VisualizationService : IVisualizationService
{
    private readonly IJSRuntime _js;

    public VisualizationService(IJSRuntime js)
    {
        _js = js;
    }

    public async Task InitCanvasAsync(string canvasId, int width, int height)
    {
        await _js.InvokeVoidAsync("MathCanvas.init", canvasId, width, height);
    }

    public async Task ClearCanvasAsync(string canvasId)
    {
        await _js.InvokeVoidAsync("MathCanvas.clear", canvasId);
    }

    public async Task DrawAxesAsync(string canvasId, double scaleX = 40, double scaleY = 40)
    {
        await _js.InvokeVoidAsync("MathCanvas.drawAxes", canvasId, new { scaleX, scaleY });
    }

    public async Task DrawFunctionAsync(string canvasId, double[][] points, string color = "#4A5FE0", double lineWidth = 2.5)
    {
        await _js.InvokeVoidAsync("MathCanvas.drawFunction", canvasId, points, color, lineWidth);
    }

    public async Task DrawVectorAsync(string canvasId, double originX, double originY, double endX, double endY, string color = "#4A5FE0", string? label = null)
    {
        await _js.InvokeVoidAsync("MathCanvas.drawVector", canvasId, originX, originY, endX, endY, color, label);
    }

    public async Task DrawPointAsync(string canvasId, double x, double y, double radius = 5, string color = "#EF5350", string? label = null)
    {
        await _js.InvokeVoidAsync("MathCanvas.drawPoint", canvasId, x, y, radius, color, label);
    }

    public async Task DrawRectAsync(string canvasId, double x, double y, double w, double h, string? fillColor = null, string? strokeColor = null)
    {
        await _js.InvokeVoidAsync("MathCanvas.drawRect", canvasId, x, y, w, h, fillColor, strokeColor);
    }

    public async Task DrawTextAsync(string canvasId, string text, double x, double y, string color = "#1A1A2E", int fontSize = 14, string align = "center")
    {
        await _js.InvokeVoidAsync("MathCanvas.drawText", canvasId, text, x, y, color, fontSize, align);
    }

    public async Task DrawShapeAsync(string canvasId, double[][] points, string? fillColor = null, string? strokeColor = null, double lineWidth = 2)
    {
        await _js.InvokeVoidAsync("MathCanvas.drawShape", canvasId, points, fillColor, strokeColor, lineWidth);
    }
}
