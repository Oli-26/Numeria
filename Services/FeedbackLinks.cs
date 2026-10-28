namespace MathVoyager.Services;

// mailto links for reader feedback, so mistake reports and topic requests land in one inbox with context attached.
public static class FeedbackLinks
{
    public const string Email = "flirpgames@gmail.com";

    public static string Mailto(string subject, string body) =>
        $"mailto:{Email}?subject={Uri.EscapeDataString(subject)}&body={Uri.EscapeDataString(body)}";

    public static string TopicRequest(string? browsingSubject) =>
        Mailto("Nous topic request",
            (browsingSubject != null ? $"Subject I was browsing: {browsingSubject}\n\n" : "")
            + "Topic or subject I'd like to see:\n\nWhat I'd want to learn about it:\n\n");
}
