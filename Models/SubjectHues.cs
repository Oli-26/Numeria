namespace MathVoyager.Models;

// One hue per subject; keep in step with the html[data-domain] --domain-rgb values in site.css.
public static class SubjectHues
{
    public const string Fallback = "#5B6ABF";

    public static string For(string id) => id switch
    {
        "math" => "#5B6ABF",
        "philosophy" => "#8E63B5",
        "physics" => "#4A90D9",
        "biology" => "#2ECC71",
        "chemistry" => "#E91E63",
        "geology" => "#8D6E63",
        "materials" => "#607D8B",
        "history" => "#C4813A",
        "linguistics" => "#FF7043",
        "cs" => "#26A69A",
        "misc" => "#5E35B1",
        "economics" => "#16A085",
        "politics" => "#3949AB",
        "media" => "#0277BD",
        "literature" => "#8E2C40",
        "religion" => "#A23B72",
        "psychology" => "#C0509E",
        "sociology" => "#D4A017",
        "scratch" => "#C8562B",
        "art" => "#6F8F3A",
        _ => Fallback
    };
}
