using System.Text.Json.Serialization;

namespace MathVoyager.Models;

public enum RunNodeType
{
    Enemy,
    Elite,
    Boss
}

public enum RunStatus
{
    Active,
    Won,
    Lost
}

public class RunNode
{
    public int Floor { get; set; }
    public int Col { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public RunNodeType Type { get; set; }

    public bool Visited { get; set; }
    public List<int> Edges { get; set; } = new(); // column indices on next floor
}

public class RunState
{
    public string TopicId { get; set; } = "";
    public int Seed { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public RunStatus Status { get; set; } = RunStatus.Active;

    public int Lives { get; set; } = 3;
    public int MaxLives { get; set; } = 3;

    public int CurrentFloor { get; set; } = 0;
    public int? CurrentCol { get; set; } // null = no node yet picked on this floor

    public List<List<RunNode>> Map { get; set; } = new();

    public List<string> ArtifactIds { get; set; } = new();

    // Per-run consumable flags
    public bool RetryUsed { get; set; }       // Noether's Symmetry — once per run
    public int FloorHintFreebiesUsed { get; set; } // Tracks per-encounter, reset on new node
    public bool DiagonalUsedThisFloor { get; set; }

    public List<string> SeenQuestionIds { get; set; } = new();

    public int TotalCorrect { get; set; }
    public int TotalWrong { get; set; }
    public int XpEarnedSoFar { get; set; }
}

public class Artifact
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Icon { get; set; } = "sparkles";
}
