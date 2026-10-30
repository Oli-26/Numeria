using MathVoyager.Services;

namespace MathVoyager.Tests;

public class QuizResumeTests
{
    private static QuizSessionState Saved(int answered, int currentIndex) => new()
    {
        QuestionIds = Enumerable.Range(0, 5).Select(i => $"q{i}").ToList(),
        CurrentIndex = currentIndex,
        UserAnswers = Enumerable.Range(0, answered).Select(i => $"a{i}").ToList(),
        Results = Enumerable.Range(0, answered).Select(i => i % 2 == 0).ToList()
    };

    [Theory]
    [InlineData(0, 0, 0)]   // nothing answered yet
    [InlineData(3, 3, 3)]   // tapped Next after the third answer
    [InlineData(3, 2, 3)]   // closed after answering the third, before Next: resume on the fourth, not the answered third
    [InlineData(5, 4, 4)]   // answered everything, closed before results: re-ask the last one rather than run past the end
    [InlineData(6, 4, 4)]   // a state already holding a duplicate answer (saved by older versions) no longer crashes
    public void ResumesAtTheFirstUnansweredQuestion_NeverPastTheLast(int answered, int currentIndex, int expected) =>
        Assert.Equal(expected, Saved(answered, currentIndex).AnswersToResume(5));
}
