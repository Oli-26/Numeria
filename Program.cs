using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using MathVoyager;
using MathVoyager.Data;
using MathVoyager.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

builder.Services.AddScoped<IContentRepository, ContentRepository>();
builder.Services.AddScoped<IAchievementRepository, AchievementRepository>();
builder.Services.AddScoped<IShopRepository, ShopRepository>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<IGamificationService, GamificationService>();
builder.Services.AddScoped<IQuizEngine, QuizEngine>();
builder.Services.AddScoped<IThemeService, ThemeService>();
builder.Services.AddScoped<IVisualizationService, VisualizationService>();
builder.Services.AddScoped<ISessionStateService, SessionStateService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();

await builder.Build().RunAsync();
