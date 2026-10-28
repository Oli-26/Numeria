using System.Text.Json;
using MathVoyager.Models;
using MathVoyager.Services;

namespace MathVoyager.Tests;

public class ProofGraderTests
{
    private static readonly JsonSerializerOptions Opts = new() { PropertyNameCaseInsensitive = true };

    private static List<ProofChallenge> Proofs()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "MathVoyager.csproj"))) dir = dir.Parent;
        var path = Path.Combine(dir!.FullName, "wwwroot", "data", "proof-challenges.json");
        return JsonSerializer.Deserialize<List<ProofChallenge>>(File.ReadAllText(path), Opts)!;
    }

    [Fact]
    public void EveryProof_AcceptsItsCorrectOrder_AndAfterIdsExist()
    {
        foreach (var c in Proofs())
        {
            var order = c.CorrectOrder;
            Assert.True(ProofGrader.IsCorrect(c, order), c.Id);
            foreach (var b in c.AvailableBlocks.Where(b => b.After != null))
            {
                Assert.Contains(b.Id, order);
                foreach (var dep in b.After!) Assert.Contains(dep, order);
            }
            foreach (var d in c.AvailableBlocks.Where(b => b.Type == "distractor"))
                Assert.DoesNotContain(d.Id, order);
        }
    }

    [Fact]
    public void InterchangeableSteps_AcceptEitherOrder()
    {
        var p = Proofs().Single(c => c.Id == "proof-04");
        var swapped = p.CorrectOrder.ToList();
        (swapped[2], swapped[3]) = (swapped[3], swapped[2]);
        Assert.True(ProofGrader.IsCorrect(p, swapped));
    }

    [Fact]
    public void DependentSteps_AndDistractors_AreRejected()
    {
        var p = Proofs().Single(c => c.Id == "proof-04");
        var bad = p.CorrectOrder.ToList();
        (bad[1], bad[2]) = (bad[2], bad[1]);
        Assert.False(ProofGrader.IsCorrect(p, bad));

        var withDistractor = p.CorrectOrder.ToList();
        withDistractor[^1] = "p04-x1";
        Assert.False(ProofGrader.IsCorrect(p, withDistractor));
        Assert.False(ProofGrader.IsCorrect(p, p.CorrectOrder.Take(4).ToList()));
    }
}
