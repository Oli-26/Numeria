using Microsoft.JSInterop;
using MathVoyager.Models;

namespace MathVoyager.Services;

public class NotificationService : INotificationService
{
    private readonly IJSRuntime _js;
    private readonly IProgressService _progress;
    private readonly IReviewService _review;

    public NotificationService(IJSRuntime js, IProgressService progress, IReviewService review)
    {
        _js = js;
        _progress = progress;
        _review = review;
    }

    public async Task<bool> RequestPermissionAsync()
    {
        try
        {
            return await _js.InvokeAsync<bool>("Notifications.requestPermission");
        }
        catch
        {
            return false;
        }
    }

    public async Task ScheduleDailyStreakReminderAsync(TimeSpan timeOfDay)
    {
        try
        {
            var profile = await _progress.GetProfileAsync();
            if (!profile.NotificationsEnabled || !profile.StreakReminderEnabled) return;

            await _js.InvokeVoidAsync(
                "Notifications.scheduleDailyReminder",
                timeOfDay.Hours,
                timeOfDay.Minutes,
                "Keep your streak alive!",
                profile.CurrentStreak > 0
                    ? $"You're on a {profile.CurrentStreak}-day streak. Don't break it!"
                    : "Start a new learning streak today."
            );
        }
        catch { /* bridge unavailable or permission denied — fail silently */ }
    }

    public async Task ScheduleReviewReminderAsync()
    {
        try
        {
            var profile = await _progress.GetProfileAsync();
            if (!profile.NotificationsEnabled || !profile.ReviewReminderEnabled) return;

            var dueCount = await _review.GetDueCountAsync();
            if (dueCount <= 0) return;

            // Schedule for this evening (19:00) unless we're already past 18:00 —
            // in that case fire in 30 minutes so the user sees it soon.
            var now = DateTime.Now;
            var target = now.Date.AddHours(19);
            if (now >= target) target = now.AddMinutes(30);

            var deltaMinutes = (int)(target - now).TotalMinutes;

            await _js.InvokeVoidAsync(
                "Notifications.scheduleReviewReminder",
                deltaMinutes,
                "Review cards due",
                dueCount == 1
                    ? "You have 1 card waiting for review."
                    : $"You have {dueCount} cards waiting for review."
            );
        }
        catch { /* fail silently */ }
    }

    public async Task DisableAllAsync()
    {
        try
        {
            await _js.InvokeVoidAsync("Notifications.cancelAll");
        }
        catch { }

        var profile = await _progress.GetProfileAsync();
        profile.NotificationsEnabled = false;
        await _progress.SaveProfileAsync(profile);
    }

    public async Task RefreshSchedulesAsync()
    {
        try
        {
            var profile = await _progress.GetProfileAsync();
            if (!profile.NotificationsEnabled) return;

            // Cancel existing to avoid duplicate pending notifications.
            await _js.InvokeVoidAsync("Notifications.cancelAll");

            if (profile.StreakReminderEnabled && !string.IsNullOrWhiteSpace(profile.DailyReminderTime))
            {
                var parts = profile.DailyReminderTime.Split(':');
                if (parts.Length == 2 &&
                    int.TryParse(parts[0], out int h) &&
                    int.TryParse(parts[1], out int m))
                {
                    await ScheduleDailyStreakReminderAsync(new TimeSpan(h, m, 0));
                }
            }

            if (profile.ReviewReminderEnabled)
            {
                await ScheduleReviewReminderAsync();
            }
        }
        catch { }
    }
}
