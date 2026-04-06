namespace MathVoyager.Services;

public interface IVisualizationService
{
    Task InitCanvasAsync(string canvasId, int width, int height);
    Task ClearCanvasAsync(string canvasId);
    Task DrawAxesAsync(string canvasId, double scaleX = 40, double scaleY = 40);
    Task DrawFunctionAsync(string canvasId, double[][] points, string color = "#4A5FE0", double lineWidth = 2.5);
    Task DrawVectorAsync(string canvasId, double originX, double originY, double endX, double endY, string color = "#4A5FE0", string? label = null);
    Task DrawPointAsync(string canvasId, double x, double y, double radius = 5, string color = "#EF5350", string? label = null);
    Task DrawRectAsync(string canvasId, double x, double y, double w, double h, string? fillColor = null, string? strokeColor = null);
    Task DrawTextAsync(string canvasId, string text, double x, double y, string color = "#1A1A2E", int fontSize = 14, string align = "center");
    Task DrawShapeAsync(string canvasId, double[][] points, string? fillColor = null, string? strokeColor = null, double lineWidth = 2);
}
