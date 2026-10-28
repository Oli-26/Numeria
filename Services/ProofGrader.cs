using MathVoyager.Models;

namespace MathVoyager.Services;

public static class ProofGrader
{
    public static bool IsCorrect(ProofChallenge challenge, IReadOnlyList<string> chosen)
    {
        var correct = challenge.CorrectOrder;
        if (chosen.Count != correct.Count || !chosen.ToHashSet().SetEquals(correct)) return false;

        var position = new Dictionary<string, int>();
        for (int i = 0; i < chosen.Count; i++) position[chosen[i]] = i;

        for (int i = 1; i < correct.Count; i++)
        {
            var block = challenge.AvailableBlocks.FirstOrDefault(b => b.Id == correct[i]);
            var needed = block?.After ?? new List<string> { correct[i - 1] };
            if (needed.Any(dep => position[dep] >= position[correct[i]])) return false;
        }
        return true;
    }
}
