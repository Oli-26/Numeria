using MathVoyager.Models;

namespace MathVoyager.Services;

public static class SimulatorCatalog
{
    private sealed record Entry(SimulatorInfo Info, string[] Keywords);

    private static Entry E(string route, string name, string icon, string domain, string blurb, string[] topics, string[] keywords) =>
        new(new SimulatorInfo { Route = route, Name = name, Icon = icon, Domain = domain, Blurb = blurb, TopicIds = topics.ToList() }, keywords);

    private static readonly List<Entry> Entries = new()
    {
        E("/particle-sandbox", "Particle Sandbox", "rocket", "physics", "Fire beams at targets and watch collisions and decays.",
            new[] { "physics-particle", "physics-nuclear", "physics-qft", "chem-nuclear" },
            new[] { "particle", "collision", "collider", "accelerator", "decay", "quark", "lepton", "boson", "hadron", "neutrino", "muon" }),
        E("/cosmic-scale", "Cosmic Scale", "target", "physics", "Zoom from the Planck length to the observable universe.",
            new[] { "physics-astrophysics", "physics-relativity", "physics-solar", "dimensional-analysis", "mat-nanomaterials", "geo-astrobiology" },
            new[] { "order of magnitude", "orders of magnitude", "planck length", "light-year", "light year", "parsec", "galaxy", "galaxies", "observable universe", "nanometre", "nanometer", "scale" }),
        E("/evolution-sim", "Evolution Simulator", "trending-up", "biology", "Apply selection pressure and watch traits drift.",
            new[] { "bio-evolution", "bio-genetics", "bio-ecology", "misc-memetics" },
            new[] { "natural selection", "selection", "genetic drift", "drift", "fitness", "allele", "mutation", "adaptation", "population" }),
        E("/cell-tour", "Cell Tour", "search", "biology", "Explore cross-sections of animal, plant and bacterial cells.",
            new[] { "bio-cell", "bio-microbiology", "bio-mol-genetics", "chem-biochemistry", "bio-botany" },
            new[] { "organelle", "mitochondri", "nucleus", "cell membrane", "ribosome", "chloroplast", "cytoplasm", "prokaryot", "eukaryot", "endoplasmic" }),
        E("/reaction-bench", "Reaction Bench", "fire", "chemistry", "Combine reagents and watch what happens.",
            new[] { "chem-atoms", "chem-inorganic", "chem-organic", "chem-physical", "chem-green", "chem-analytical" },
            new[] { "reaction", "reagent", "acid", "precipitat", "oxidation", "reduction", "redox", "combustion", "catalyst" }),
        E("/molecule-builder", "Molecule Builder", "puzzle", "chemistry", "Drag atoms and bonds to construct molecules.",
            new[] { "chem-organic", "chem-atoms", "chem-biochemistry", "chem-quantum-chem", "chem-polymers", "chem-pharma" },
            new[] { "covalent", "bond", "molecule", "valence", "lewis", "functional group", "isomer", "hybridi" }),
        E("/deep-time", "Deep Time Scroller", "clock", "geology", "Scroll through Earth's 4.5 billion year history.",
            new[] { "geology-stratigraphy", "geology-paleontology", "bio-evolution", "geo-astrobiology", "geology-tectonics", "history-environmental" },
            new[] { "million years", "billion years", "eon", "extinction", "fossil", "cambrian", "precambrian", "jurassic", "cretaceous", "stratigraph", "geologic time" }),
        E("/rock-id", "Rock ID", "search", "geology", "Identify samples from their properties.",
            new[] { "geology-mineralogy", "geology-volcanism", "geology-metals", "geo-geochem", "mat-structure" },
            new[] { "mineral", "igneous", "sedimentary", "metamorphic", "rock", "hardness", "lustre", "luster", "cleavage", "crystal" }),
        E("/era-map", "Era Map", "calendar", "history", "Slide through time and watch empires rise and fall.",
            new[] { "history-ancient", "history-medieval", "history-early-modern", "history-modern", "history-twentieth", "history-islamic-world", "history-east-asian", "history-south-asian", "history-african", "history-pre-columbian", "history-russian", "politics-empire" },
            new[] { "empire", "dynasty", "caliphate", "conquest", "kingdom", "territory", "expansion" }),
        E("/trade-routes", "Trade Route Tracer", "trending-up", "history", "Follow the Silk Road, the spice routes and more.",
            new[] { "history-economic", "history-exploration", "history-medieval", "history-islamic-world", "history-east-asian", "econ-international" },
            new[] { "silk road", "spice", "trade route", "merchant", "caravan", "maritime trade", "trade" }),
        E("/trolley-lab", "Trolley Lab", "puzzle", "philosophy", "Branching ethical dilemmas that build your moral profile.",
            new[] { "philosophy-ethics", "philosophy-mind", "cs-ai-ml" },
            new[] { "trolley", "utilitarian", "consequential", "deontolog", "virtue", "dilemma", "moral" }),
        E("/sound-shift", "Sound Shift Sim", "speech", "linguistics", "Apply Grimm's Law and the Great Vowel Shift to words.",
            new[] { "ling-historical", "ling-phonetics", "lit-medieval-renaissance" },
            new[] { "grimm", "vowel shift", "sound change", "proto-indo-european", "cognate", "consonant" }),
        E("/phase-diagram", "Phase Diagram Explorer", "flask", "materials", "Drag temperature and pressure, watch substances change state.",
            new[] { "mat-phases", "mat-transitions", "chem-physical", "physics-thermodynamics" },
            new[] { "phase diagram", "triple point", "critical point", "melting", "boiling", "sublimation", "eutectic", "phase" }),
        E("/algorithm-race", "Algorithm Race", "code", "cs", "Race sorting algorithms head to head.",
            new[] { "cs-algorithms", "cs-data-structures", "computation", "cs-lang-python" },
            new[] { "sorting", "quicksort", "merge sort", "heap", "big-o", "big o", "complexity", "algorithm" }),
        E("/cipher-decoder", "Cipher Decoder", "eye", "misc", "Six layered puzzles, from Caesar to Cicada.",
            new[] { "cs-cryptography", "misc-cicada3301", "misc-undeciphered", "misc-numberstations", "number-theory", "cs-security" },
            new[] { "cipher", "caesar", "encrypt", "decrypt", "vigen", "substitution", "cryptanalysis" }),
        E("/power-map", "Power Map", "balance-scale", "politics", "Median voters, plurality versus proportional, simulated elections.",
            new[] { "politics-institutions", "politics-comparative", "politics-theory", "econ-political-economy" },
            new[] { "median voter", "electoral", "election", "proportional", "plurality", "ballot", "voting", "voter" }),
        E("/market-sim", "Market Sim", "coin", "economics", "Supply and demand sliders, taxes, ceilings and deadweight loss.",
            new[] { "econ-micro", "econ-public", "econ-environmental", "econ-industrial-org", "econ-labor" },
            new[] { "supply", "demand", "equilibrium", "price ceiling", "price floor", "deadweight", "surplus", "elasticity", "tax" }),
        E("/front-page", "Front Page Builder", "antenna", "media", "Pick headlines and captions; the newsroom rates the framing.",
            new[] { "media-journalism", "media-bias", "media-propaganda", "media-misinformation", "media-press-freedom", "media-theory" },
            new[] { "headline", "framing", "front page", "caption", "agenda-setting", "editor", "bias" }),
        E("/plot-geometry", "Plot Geometry", "quill", "literature", "Freytag's pyramid traced through famous works.",
            new[] { "lit-novel", "lit-drama", "lit-narrative-theory", "lit-short-fiction", "lit-shakespeare" },
            new[] { "freytag", "rising action", "climax", "denouement", "exposition", "plot", "five-act", "five act" }),
        E("/etymology", "Etymology Tracer", "scroll", "linguistics", "Trace English words back to their Indo-European roots.",
            new[] { "ling-historical", "ling-morphology", "ling-semantics" },
            new[] { "etymolog", "indo-european", "loanword", "borrowed", "root", "latin", "greek" }),
    };

    public static IReadOnlyList<SimulatorInfo> All { get; } = Entries.Select(e => e.Info).ToList();

    public static SimulatorInfo? ByRoute(string? route) =>
        route == null ? null : All.FirstOrDefault(s => s.Route == route);

    public static List<SimulatorInfo> ForTopic(string topicId) =>
        All.Where(s => s.TopicIds.Contains(topicId)).ToList();

    // conceptId -> simulator. An explicit Concept.SimulatorRoute wins; otherwise each simulator mapped to
    // the topic goes on the one concept whose text mentions its keywords most, if any does.
    public static Dictionary<string, SimulatorInfo> PlaceInLesson(Lesson lesson, string topicId)
    {
        var placed = new Dictionary<string, SimulatorInfo>();
        foreach (var c in lesson.Concepts)
        {
            var explicitSim = ByRoute(c.SimulatorRoute);
            if (explicitSim != null) placed[c.Id] = explicitSim;
        }

        foreach (var entry in Entries.Where(e => e.Info.TopicIds.Contains(topicId)))
        {
            if (placed.Values.Contains(entry.Info)) continue;
            Concept? best = null;
            var bestHits = 0;
            foreach (var c in lesson.Concepts)
            {
                if (placed.ContainsKey(c.Id)) continue;
                var text = (c.Title + " " + c.ContentHtml).ToLowerInvariant();
                var hits = entry.Keywords.Sum(k => CountOccurrences(text, k));
                if (hits > bestHits) { bestHits = hits; best = c; }
            }
            if (best != null && bestHits >= 2) placed[best.Id] = entry.Info;
        }
        return placed;
    }

    private static int CountOccurrences(string text, string term)
    {
        int count = 0, i = 0;
        while ((i = text.IndexOf(term, i, StringComparison.Ordinal)) >= 0) { count++; i += term.Length; }
        return count;
    }
}
