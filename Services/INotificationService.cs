namespace MathVoyager.Services;

public interface INotificationService
{
    Task<bool> RequestPermissionAsync();
    Task ScheduleDailyStreakReminderAsync(TimeSpan timeOfDay);
    Task ScheduleReviewReminderAsync();
    Task DisableAllAsync();
    Task RefreshSchedulesAsync();
}
