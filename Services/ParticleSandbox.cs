using System.Globalization;

namespace MathVoyager.Services;

// Energies are centre-of-mass kinetic energies, so the outcome depends only on the pair and the band:
// a proton hitting an electron is the same collision as an electron hitting a proton.
public enum Band { KeV, MeV, GeV, TeV }

public enum PKind { Electron, Muon, Neutrino, Photon, Nucleon, Meson, Quark, Gluon, Remnant, Boson, Nucleus }

public enum TrackStyle { Charged, Neutral, Jet, Recoil }

// Charge and baryon number are stored in thirds so quarks stay integral.
public sealed record Particle(string Symbol, string Name, PKind Kind, int Charge3, int Lepton, int Baryon3)
{
    public TrackStyle Style => Kind switch
    {
        PKind.Quark or PKind.Gluon or PKind.Remnant => TrackStyle.Jet,
        PKind.Nucleus => TrackStyle.Recoil,
        _ => Charge3 != 0 ? TrackStyle.Charged : TrackStyle.Neutral,
    };
}

public sealed record Track(Particle P, double Angle);
public sealed record Product(Particle P, string Description);
public sealed record Reaction(string Note, IReadOnlyList<Particle> Before, IReadOnlyList<Particle> After);

public sealed record Outcome(string Title, IReadOnlyList<Track> Tracks, IReadOnlyList<Product> Products,
    string Explanation, IReadOnlyList<Reaction> Also)
{
    public IReadOnlyList<Particle> After => Tracks.Select(t => t.P).ToList();
}

public sealed record Collision(string Beam, string Target, Band Band, string Setup, IReadOnlyList<Particle> Before, Outcome Outcome);
public sealed record Cell(Collision? Hit, string? Reason);
public sealed record Choice(string Id, string Label, Particle Particle);
public readonly record struct Totals(int Charge3, int Lepton, int Baryon3);

public static class Particles
{
    public static readonly Particle Electron = new("e⁻", "electron", PKind.Electron, -3, 1, 0);
    public static readonly Particle Positron = new("e⁺", "positron", PKind.Electron, 3, -1, 0);
    public static readonly Particle MuMinus = new("μ⁻", "muon", PKind.Muon, -3, 1, 0);
    public static readonly Particle MuPlus = new("μ⁺", "antimuon", PKind.Muon, 3, -1, 0);
    public static readonly Particle NuE = new("νₑ", "electron neutrino", PKind.Neutrino, 0, 1, 0);
    public static readonly Particle AntiNuE = new("ν̄ₑ", "electron antineutrino", PKind.Neutrino, 0, -1, 0);
    public static readonly Particle Photon = new("γ", "photon", PKind.Photon, 0, 0, 0);
    public static readonly Particle Proton = new("p", "proton", PKind.Nucleon, 3, 0, 3);
    public static readonly Particle AntiProton = new("p̄", "antiproton", PKind.Nucleon, -3, 0, -3);
    public static readonly Particle Neutron = new("n", "neutron", PKind.Nucleon, 0, 0, 3);
    public static readonly Particle PiPlus = new("π⁺", "positive pion", PKind.Meson, 3, 0, 0);
    public static readonly Particle PiMinus = new("π⁻", "negative pion", PKind.Meson, -3, 0, 0);
    public static readonly Particle PiZero = new("π⁰", "neutral pion", PKind.Meson, 0, 0, 0);
    public static readonly Particle Up = new("u", "up quark jet", PKind.Quark, 2, 0, 1);
    public static readonly Particle AntiUp = new("ū", "anti-up quark jet", PKind.Quark, -2, 0, -1);
    public static readonly Particle Down = new("d", "down quark jet", PKind.Quark, -1, 0, 1);
    public static readonly Particle AntiDown = new("d̄", "anti-down quark jet", PKind.Quark, 1, 0, -1);
    public static readonly Particle Top = new("t", "top quark", PKind.Quark, 2, 0, 1);
    public static readonly Particle AntiTop = new("t̄", "top antiquark", PKind.Quark, -2, 0, -1);
    public static readonly Particle Gluon = new("g", "gluon jet", PKind.Gluon, 0, 0, 0);
    public static readonly Particle RemnantUud = new("uud", "proton remnant", PKind.Remnant, 3, 0, 3);
    public static readonly Particle RemnantUd = new("ud", "proton remnant", PKind.Remnant, 1, 0, 2);
    public static readonly Particle RemnantUu = new("uu", "proton remnant", PKind.Remnant, 4, 0, 2);
    public static readonly Particle WPlus = new("W⁺", "W boson", PKind.Boson, 3, 0, 0);
    public static readonly Particle WMinus = new("W⁻", "W boson", PKind.Boson, -3, 0, 0);
    public static readonly Particle Z = new("Z", "Z boson", PKind.Boson, 0, 0, 0);
    public static readonly Particle Higgs = new("H", "Higgs boson", PKind.Boson, 0, 0, 0);
    public static readonly Particle Hydrogen = new("¹H", "hydrogen atom", PKind.Nucleus, 0, 1, 3);
    public static readonly Particle Deuteron = new("²H", "deuteron", PKind.Nucleus, 3, 0, 6);
    public static readonly Particle Carbon = new("C", "carbon-12 atom (6 e⁻)", PKind.Nucleus, 0, 6, 36);
    public static readonly Particle CarbonIon = new("C⁺", "carbon ion (5 e⁻)", PKind.Nucleus, 3, 5, 36);
    public static readonly Particle Carbon11 = new("¹¹C", "carbon-11 atom (6 e⁻)", PKind.Nucleus, 0, 6, 33);
    public static readonly Particle CarbonDebris = new("C*", "carbon fragments and their 6 e⁻", PKind.Nucleus, 0, 6, 36);
    public static readonly Particle C12Nucleus = new("¹²C", "carbon-12 nucleus", PKind.Nucleus, 18, 0, 36);
    public static readonly Particle N13Nucleus = new("¹³N", "nitrogen-13 nucleus", PKind.Nucleus, 21, 0, 39);
}

public static class ParticleSandbox
{
    public static readonly IReadOnlyList<Band> Bands = new[] { Band.KeV, Band.MeV, Band.GeV, Band.TeV };

    public static readonly IReadOnlyList<Choice> Beams = new[]
    {
        new Choice("e-", "Electron", Particles.Electron),
        new Choice("e+", "Positron", Particles.Positron),
        new Choice("p", "Proton", Particles.Proton),
        new Choice("gamma", "Photon", Particles.Photon),
        new Choice("antinu", "Antineutrino", Particles.AntiNuE),
    };

    public static readonly IReadOnlyList<Choice> Targets = new[]
    {
        new Choice("e-", "Electron", Particles.Electron),
        new Choice("p", "Proton", Particles.Proton),
        new Choice("atom", "Carbon atom", Particles.Carbon),
    };

    public static string BandLabel(Band b) => b switch
    {
        Band.KeV => "keV",
        Band.MeV => "MeV",
        Band.GeV => "GeV",
        _ => "TeV",
    };

    public static Cell Lookup(string beam, string target, Band band) =>
        Table.TryGetValue((beam, target, band), out var cell) ? cell : new Cell(null, "Not available.");

    public static IEnumerable<Collision> AllCollisions => Table.Values.Where(c => c.Hit != null).Select(c => c.Hit!);

    public static Totals Sum(IEnumerable<Particle> ps)
    {
        int q = 0, l = 0, b = 0;
        foreach (var p in ps) { q += p.Charge3; l += p.Lepton; b += p.Baryon3; }
        return new Totals(q, l, b);
    }

    public static string Thirds(int v) => v % 3 == 0 ? Signed(v / 3) : $"{(v < 0 ? "−" : "+")}{Math.Abs(v)}/3";

    public static string Signed(int v) => v == 0 ? "0" : v > 0 ? $"+{v}" : $"−{-v}";

    public static string Equation(IEnumerable<Particle> before, IEnumerable<Particle> after) =>
        $"{string.Join(" + ", before.Select(p => p.Symbol))} → {string.Join(" + ", after.Select(p => p.Symbol))}";

    private static Particle Of(IReadOnlyList<Choice> list, string id) => list.First(c => c.Id == id).Particle;

    private static readonly Dictionary<(string, string, Band), Cell> Table = Build();

    private static Track T(Particle p, double angle) => new(p, angle);
    private static Product Pr(Particle p, string d) => new(p, d);
    private static Reaction R(string note, Particle[] before, Particle[] after) => new(note, before, after);
    private static Outcome O(string title, Track[] tracks, Product[] products, string explanation, params Reaction[] also) =>
        new(title, tracks, products, explanation, also);

    private static Dictionary<(string, string, Band), Cell> Build()
    {
        var t = new Dictionary<(string, string, Band), Cell>();
        void On(string b, string tg, Band band, Outcome o, string setup) =>
            t[(b, tg, band)] = new Cell(new Collision(b, tg, band, setup, new[] { Of(Beams, b), Of(Targets, tg) }, o), null);
        void Off(string b, string tg, Band band, string reason) => t[(b, tg, band)] = new Cell(null, reason);

        var e = Particles.Electron; var ep = Particles.Positron; var p = Particles.Proton; var n = Particles.Neutron;
        var g = Particles.Photon; var nub = Particles.AntiNuE; var nu = Particles.NuE; var c = Particles.Carbon;
        var cIon = Particles.CarbonIon;

        // ---- electron and positron on electrons ----
        var moller = O("Møller scattering",
            new[] { T(e, -40), T(e, 140) },
            new[] { Pr(e, "Both electrons come out again. Charge −2 and lepton number +2 cannot change, and there is no antiparticle here to annihilate with.") },
            "Two electrons can only repel: they swap a virtual photon and fly apart, back to back in the centre-of-mass frame. "
            + "Because the two are identical, quantum mechanics cannot tell which is which, and that changes the angles they come out at. "
            + "Christian Møller worked out the theory in 1932, and some of the first colliders, in the 1960s, collided electrons with electrons to test it. "
            + "A tiny contribution from the Z boson makes left- and right-spinning electrons scatter slightly differently, which precision Møller experiments use to measure the weak force.",
            R("Sometimes a photon is radiated as well (bremsstrahlung).", new[] { e, e }, new[] { e, e, g }));
        On("e-", "e-", Band.KeV, moller, "A keV electron meets another electron, as when a fast electron knocks one out of an atom.");
        On("e-", "e-", Band.MeV, moller, "Electrons with MeV of collision energy, fast enough that relativity matters.");
        On("e-", "e-", Band.GeV, moller, "Two electron beams colliding head on.");
        Off("e-", "e-", Band.TeV, "No electron-electron collider has ever run at TeV energies.");

        On("e+", "e-", Band.KeV, O("Annihilation into two photons",
            new[] { T(g, -30), T(g, 150) },
            new[] { Pr(g, "Two gamma rays of 511 keV each, back to back. A single photon could not carry zero total momentum, so at least two are needed.") },
            "A slow positron meets its antiparticle. Their charges (+1 and −1) cancel, and so do their lepton numbers (−1 and +1), "
            + "so nothing stops them turning completely into light: all 1.022 MeV of rest energy becomes two photons flying in exactly opposite directions. "
            + "At keV speeds most close encounters still just deflect the positron, but the slower it goes, the likelier annihilation becomes.",
            R("If the pair first forms ortho-positronium (spins aligned), three photons come out instead.", new[] { ep, e }, new[] { g, g, g })),
            "A slow positron, with only keV of energy, meets an electron.");

        On("e+", "e-", Band.MeV, O("Bhabha scattering",
            new[] { T(ep, -35), T(e, 145) },
            new[] { Pr(ep, "The positron, scattered."), Pr(e, "The electron, scattered. Opposite charges, so the two tracks bend the same way.") },
            "At MeV energies a positron passing an electron usually just scatters off it: Bhabha scattering, worked out by Homi Bhabha in 1936. "
            + "Unlike Møller scattering there is a second route, in which the pair briefly annihilates into a virtual photon that turns straight back into an electron and a positron. "
            + "Now and then they annihilate for real in flight, and above about 0.2 GeV they can even turn into a muon pair. "
            + "Colliders use Bhabha scattering to count how many collisions they deliver.",
            R("In-flight annihilation: two photons, back to back in the centre-of-mass frame.", new[] { ep, e }, new[] { g, g })),
            "A positron with MeV energy meets an electron.");

        On("e+", "e-", Band.GeV, O("Quark and gluon jets",
            new[] { T(Particles.Up, -80), T(Particles.AntiUp, 40), T(Particles.Gluon, 160) },
            new[]
            {
                Pr(Particles.Up, "Quark jet: a narrow spray of hadrons, mostly pions, following the quark."),
                Pr(Particles.AntiUp, "Antiquark jet, balancing the quark's charge and baryon number."),
                Pr(Particles.Gluon, "Gluon jet: the third jet, from a gluon radiated by the quark."),
            },
            "The electron and positron annihilate into a virtual photon or Z boson, which makes a new particle-antiparticle pair. "
            + "Here it is a quark and an antiquark. Neither can escape alone (colour confinement), so each turns into a jet of hadrons. "
            + "Usually there are two back-to-back jets, but sometimes a quark radiates a hard gluon and a third jet appears: "
            + "three-jet events at the PETRA collider at DESY in 1979 were the first direct evidence for the gluon. "
            + "At a few GeV and below the quarks make only a handful of mesons rather than clear jets.",
            R("Above about 0.2 GeV: a muon pair.", new[] { ep, e }, new[] { Particles.MuPlus, Particles.MuMinus }),
            R("At 91 GeV the collision energy matches the Z boson's mass and the rate shoots up. LEP at CERN ran on this peak from 1989; the Z's measured width showed there are exactly three kinds of light neutrino.",
                new[] { ep, e }, new[] { Particles.Z }),
            R("Above about 161 GeV (twice the W mass): pairs of W bosons. LEP reached 209 GeV by 2000.",
                new[] { ep, e }, new[] { Particles.WPlus, Particles.WMinus })),
            "Positron and electron beams collide head on at about 30 GeV, PETRA's range.");

        On("e+", "e-", Band.TeV, O("W boson pairs (proposed colliders)",
            new[] { T(ep, -50), T(nu, -15), T(Particles.Down, 130), T(Particles.AntiUp, 165) },
            new[]
            {
                Pr(ep, "From the W⁺ decay."),
                Pr(nu, "The W⁺'s other product. It leaves no trace and shows up only as missing momentum."),
                Pr(Particles.Down, "One of two jets from the W⁻ decay."),
                Pr(Particles.AntiUp, "The other W⁻ jet."),
            },
            "No electron-positron collider has run at TeV energies: LEP's record was 209 GeV. "
            + "Linear colliders such as the ILC and CLIC have been proposed to reach from a few hundred GeV up to a few TeV, and the Standard Model predicts clearly what they would see. "
            + "The commonest heavy product is a pair of W bosons, each decaying within about 10⁻²⁵ s. "
            + "Drawn here, the W⁺ became a positron and a neutrino and the W⁻ became two jets.",
            R("From about 0.35 TeV: pairs of top quarks, the heaviest known particle.", new[] { ep, e }, new[] { Particles.Top, Particles.AntiTop }),
            R("Higgs bosons: alongside a Z (best near 0.25 TeV) or, at TeV energies, by W boson fusion, which also gives off a neutrino and an antineutrino.",
                new[] { ep, e }, new[] { nu, nub, Particles.Higgs })),
            "Positron and electron beams colliding at TeV energies, as proposed linear colliders would.");

        // ---- electron and positron on protons (and protons on electrons) ----
        var coulombEp = O("Coulomb scattering",
            new[] { T(e, -35), T(p, 145) },
            new[]
            {
                Pr(e, "Swings around the proton and leaves in a new direction."),
                Pr(p, "Recoils with the same momentum, but it is 1836 times heavier, so it barely moves."),
            },
            "Opposite charges attract, so the electron curves around the proton: the attractive counterpart of Rutherford scattering. "
            + "At keV energies it is far too slow to see inside the proton, which looks like a point charge. "
            + "Slowed to a few electronvolts it can instead be captured into a hydrogen atom, giving off a photon. "
            + "That is how the first atoms formed, about 380,000 years after the Big Bang.",
            R("Capture into hydrogen, at electronvolt energies rather than keV.", new[] { e, p }, new[] { Particles.Hydrogen, g }));

        var elasticEp = O("Elastic scattering: the proton's size",
            new[] { T(e, -50), T(p, 130) },
            new[]
            {
                Pr(e, "Scattered electron. How many go to each angle encodes how the proton's charge is spread out."),
                Pr(p, "Recoiling proton, still intact."),
            },
            "The electron bounces off the whole proton without breaking it. "
            + "Towards hundreds of MeV its wavelength becomes smaller than the proton, and fewer electrons scatter to wide angles than a point charge would allow: the proton has a size. "
            + "Robert Hofstadter's team at Stanford measured it this way in the 1950s, finding a charge radius of about 0.8 femtometres (1961 Nobel Prize).",
            R("Above about 0.8 MeV the weak force can turn the pair into a neutron and a neutrino (electron capture). It is extremely rare here, but in a collapsing star's core it turns protons into neutrons.",
                new[] { e, p }, new[] { nu, n }),
            R("From about 0.3 GeV the electron can lift the proton into the short-lived Delta resonance, which falls apart into a nucleon and a pion.",
                new[] { e, p }, new[] { e, n, Particles.PiPlus }));

        Outcome Dis(Particle lepton)
        {
            var word = lepton == e ? "electron" : "positron";
            var cc = lepton == e
                ? R("At HERA's hardest collisions a W boson can be exchanged instead, turning the electron into a neutrino and a u quark into a d quark.",
                    new[] { e, p }, new[] { nu, Particles.Down, Particles.RemnantUd })
                : R("At HERA's hardest collisions a W boson can be exchanged instead, turning the positron into an antineutrino and a d quark into a u quark.",
                    new[] { ep, p }, new[] { nub, Particles.Up, Particles.RemnantUu });
            return O("Deep inelastic scattering: quarks",
                new[] { T(lepton, -35), T(Particles.Up, 45), T(Particles.RemnantUd, 168) },
                new[]
                {
                    Pr(lepton, $"The scattered {word}, kicked hard. Its angle and energy reveal what it hit."),
                    Pr(Particles.Up, "The struck quark, knocked out of the proton. It turns into a jet of hadrons."),
                    Pr(Particles.RemnantUd, "The rest of the proton (two quarks), carrying on along the beam as a spray of hadrons."),
                },
                $"The {word} now has enough energy to see inside the proton. Instead of bouncing off the whole proton, it hits one quark and shatters the proton. "
                + "In 1968 the SLAC-MIT experiment found far more hard, wide-angle scatters than a smooth proton would allow: the proton contains point-like parts, soon identified as quarks (1990 Nobel Prize). "
                + "HERA at DESY (1992 to 2007) collided electrons and positrons with protons at about 0.3 TeV. "
                + "At its hardest collisions W exchange became as common as photon exchange: a direct view of the electromagnetic and weak forces merging. "
                + "At the low end of this band the proton is mostly lifted into short-lived excited states (resonances) instead.",
                cc);
        }

        const string noEpCollider = "No electron-proton collider has reached TeV collision energies: HERA, the only one so far, peaked at about 0.3 TeV. The proposed LHeC would reach about 1.2 TeV.";
        On("e-", "p", Band.KeV, coulombEp, "A keV electron passes a proton.");
        On("e-", "p", Band.MeV, elasticEp, "Electrons with hundreds of MeV hit protons, as in Hofstadter's Stanford experiments.");
        On("e-", "p", Band.GeV, Dis(e), "Electrons hit protons: SLAC in 1968 reached a few GeV of collision energy, HERA about 300 GeV.");
        Off("e-", "p", Band.TeV, noEpCollider);

        const string mirror = "A proton hits an electron. In the centre-of-mass frame this is exactly the same collision as an electron hitting a proton: it does not matter which one you call the beam.";
        On("p", "e-", Band.KeV, coulombEp, mirror);
        On("p", "e-", Band.MeV, elasticEp, mirror);
        On("p", "e-", Band.GeV, Dis(e), mirror + " HERA collided proton and electron beams head on.");
        Off("p", "e-", Band.TeV, noEpCollider);

        On("e+", "p", Band.KeV, O("Coulomb repulsion",
            new[] { T(ep, -30), T(p, 150) },
            new[]
            {
                Pr(ep, "Turned away by the proton's charge."),
                Pr(p, "Recoils slightly."),
            },
            "A positron is antimatter, but only the electron is its antiparticle, so it cannot annihilate with a proton. "
            + "Both are positive, so they repel, and at keV energies the positron is turned away long before it gets close. "
            + "This is Rutherford scattering, the same repulsion that turned alpha particles back from gold nuclei."),
            "A keV positron approaches a proton.");

        On("e+", "p", Band.MeV, O("Elastic scattering",
            new[] { T(ep, -50), T(p, 130) },
            new[]
            {
                Pr(ep, "Scattered positron."),
                Pr(p, "Recoiling proton, intact."),
            },
            "Like an electron, a positron with MeV energy bounces off the whole proton, and towards hundreds of MeV the scattering pattern reveals the proton's size. "
            + "Comparing positron and electron scattering exposes subtle effects, such as two photons being exchanged at once, that matter for precise measurements of the proton."),
            "Positrons with hundreds of MeV hit protons.");

        On("e+", "p", Band.GeV, Dis(ep), "Positrons hit protons with GeV collision energies. HERA collided both electrons and positrons with protons.");
        Off("e+", "p", Band.TeV, noEpCollider);

        // ---- electron and positron on atoms ----
        On("e-", "atom", Band.KeV, O("Ionisation and X-rays",
            new[] { T(e, -30), T(e, 90), T(cIon, 210) },
            new[]
            {
                Pr(e, "Two electrons leave: the incoming one, deflected and slowed, and one knocked out of the atom."),
                Pr(cIon, "The carbon atom, now an ion with one electron missing."),
            },
            "Most keV electrons lose energy by knocking electrons out of atoms (ionisation). "
            + "If an innermost electron is knocked out, the atom refills the hole and either throws out another electron (the Auger effect, usual in light atoms like carbon) "
            + "or emits an X-ray whose energy fingerprints the element (usual in heavy atoms like tungsten). "
            + "Electrons braking in the nucleus's field also give off a smooth spread of X-rays (bremsstrahlung). "
            + "An X-ray tube is exactly this: keV electrons slamming into a heavy-metal target. Wilhelm Röntgen discovered X-rays with such a tube in 1895.",
            R("Bremsstrahlung: the electron brakes near the nucleus and radiates an X-ray.", new[] { e, c }, new[] { e, g, c })),
            "Electrons of tens of keV hit carbon atoms, as in an X-ray tube (which uses a heavier metal).");

        On("e-", "atom", Band.MeV, O("Bremsstrahlung",
            new[] { T(e, -30), T(g, 20), T(c, 170) },
            new[]
            {
                Pr(e, "The electron, deflected and slowed."),
                Pr(g, "A gamma-ray photon, radiated as the electron is braked."),
                Pr(c, "The carbon atom. Its nucleus absorbs the recoil."),
            },
            "Passing close to a nucleus, the electron is sharply deflected and radiates a photon: bremsstrahlung, German for braking radiation. "
            + "In heavy elements this becomes the main way MeV electrons lose energy (in tungsten above about 10 MeV); in light ones like carbon, knocking out electrons still wins until higher energies. "
            + "Radiotherapy machines fire electrons of a few MeV to about 20 MeV at a tungsten target to make their X-ray beams."),
            "MeV electrons pass through carbon.");

        Outcome Shower(Particle lepton)
        {
            var word = lepton == e ? "electron" : "positron";
            return O("First step of an electromagnetic shower",
                new[] { T(lepton, -20), T(g, 18), T(c, 185) },
                new[]
                {
                    Pr(lepton, $"The {word} keeps most of its energy and will radiate again further on."),
                    Pr(g, "A hard photon. Near the next nucleus it will turn into an electron-positron pair."),
                    Pr(c, "The atom absorbs a little recoil."),
                },
                $"At GeV energies and above, each close pass by a nucleus can make the {word} radiate a hard photon. "
                + "That photon soon converts into an electron and a positron, which radiate in turn, so the number of particles roughly doubles every radiation length (about 19 cm in carbon, 0.56 cm in lead) "
                + "until the energy is shared among thousands of slow particles. "
                + "The calorimeters in collider detectors measure energy this way, and cosmic electrons and gamma rays make showers like this in the atmosphere.",
                R("What the photon does next, at the next atom.", new[] { g, c }, new[] { ep, e, c }));
        }

        On("e-", "atom", Band.GeV, Shower(e), "GeV electrons hit a block of matter, such as a detector's calorimeter.");
        On("e-", "atom", Band.TeV, Shower(e), "TeV electrons, such as cosmic-ray electrons, hit matter.");

        var pet = O("Positronium, then annihilation",
            new[] { T(g, -60), T(g, 120), T(cIon, 30) },
            new[]
            {
                Pr(g, "Two 511 keV gamma rays, flying off in opposite directions."),
                Pr(cIon, "The atom has lost one electron to annihilation, so it is now an ion."),
            },
            "A positron entering matter first slows down, knocking electrons about. Nearly at rest, it often pairs up with an electron as positronium, a tiny atom with no nucleus, before the two annihilate. "
            + "Two 511 keV photons fly out back to back. A PET scanner rings the patient with detectors and places each annihilation on the line joining two simultaneous hits; "
            + "the positrons come from a tracer such as a sugar labelled with fluorine-18. "
            + "Lepton number balances: the positron's −1 cancels one of carbon's six electrons, leaving five.",
            R("Ortho-positronium (spins aligned) decays into three photons instead, though in matter it usually meets another electron first.",
                new[] { ep, c }, new[] { g, g, g, cIon }));
        On("e+", "atom", Band.KeV, pet, "A slow positron enters material made of carbon atoms.");
        On("e+", "atom", Band.MeV, pet, "A positron from a PET tracer (fluorine-18 emits them with up to 0.63 MeV) enters tissue, which is mostly carbon, hydrogen and oxygen.");
        On("e+", "atom", Band.GeV, Shower(ep), "A GeV positron hits matter.");
        On("e+", "atom", Band.TeV, Shower(ep), "A TeV positron hits matter.");

        // ---- photons ----
        var compton = O("Compton scattering",
            new[] { T(g, -40), T(e, 140) },
            new[]
            {
                Pr(g, "Scattered photon, with less energy (a longer wavelength) the wider it bounces."),
                Pr(e, "The recoiling electron, carrying the energy the photon lost."),
            },
            "The photon bounces off the electron like a billiard ball, handing over some energy and momentum. "
            + "Arthur Compton saw this in 1923 with X-rays on graphite: the scattered X-rays had longer wavelengths, by an amount set only by the angle. "
            + "That only makes sense if light comes in particles that carry momentum (1927 Nobel Prize). "
            + "At keV the photon keeps almost all its energy; at MeV it can hand most of it to the electron, and in the laboratory it scatters mostly forward.",
            R("Above about 1 MeV of collision energy the photon can instead turn into an electron-positron pair in the electron's field, and at higher energies this takes over.",
                new[] { g, e }, new[] { e, e, ep }));
        On("gamma", "e-", Band.KeV, compton, "An X-ray photon of about 20 keV hits an electron, as in Compton's 1923 experiment.");
        On("gamma", "e-", Band.MeV, compton, "A gamma ray with MeV energy hits an electron.");

        var triplet = O("Pair production on an electron",
            new[] { T(e, -100), T(ep, 20), T(e, 140) },
            new[]
            {
                Pr(e, "Two electrons leave: the original one, kicked, and the new one."),
                Pr(ep, "The new positron. Matter and antimatter appear together, so charge and lepton number still add up."),
            },
            "With this much energy the photon usually converts into an electron-positron pair in the field of the electron instead of simply bouncing off it. "
            + "Three charged tracks come out, which is why this is called triplet production. "
            + "Light becomes matter: making the pair needs at least 1.022 MeV of collision energy, the pair's rest energy. "
            + "Compton scattering still happens, but it gets rarer as the energy rises.",
            R("Above about 0.21 GeV a muon pair can appear instead, but far more rarely.", new[] { g, e }, new[] { e, Particles.MuPlus, Particles.MuMinus }));
        On("gamma", "e-", Band.GeV, triplet, "A high-energy gamma ray meets an electron.");
        On("gamma", "e-", Band.TeV, triplet, "A photon meets an electron at TeV collision energy. No machine yet collides photons with electrons this hard, but pair production is still expected to dominate.");

        On("gamma", "p", Band.KeV, O("Thomson scattering off a proton",
            new[] { T(g, -40), T(p, 140) },
            new[]
            {
                Pr(g, "The photon bounces off with its energy almost unchanged."),
                Pr(p, "The proton, nudged."),
            },
            "The photon's oscillating electric field shakes the proton, which re-radiates: Thomson scattering, the low-energy limit of Compton scattering. "
            + "A proton is 1836 times heavier than an electron, so it is shaken far less and scatters about 3.4 million times less light (the rate goes as one over the mass squared). "
            + "That is why it is electrons, not nuclei, that scatter X-rays in matter."),
            "A keV X-ray hits a proton.");

        On("gamma", "p", Band.MeV, O("Pion photoproduction: the Delta",
            new[] { T(n, -40), T(Particles.PiPlus, 140) },
            new[]
            {
                Pr(n, "A neutron. Neutral, so it leaves no track."),
                Pr(Particles.PiPlus, "A positive pion, made from the photon's energy."),
            },
            "Below about 140 MeV the photon can only scatter off the proton. Above it there is enough energy to make a pion, "
            + "and near 300 MeV the photon lifts the proton into a short-lived excited state, the Delta(1232) resonance, which falls apart into a nucleon and a pion: here a neutron and a positive pion. "
            + "The same collision limits cosmic rays: protons above about 5 × 10¹⁹ eV meet photons of the cosmic microwave background with enough collision energy to make pions, and lose energy doing so "
            + "(the GZK limit, predicted in 1966).",
            R("The Delta decays to a proton and a neutral pion about twice as often.", new[] { g, p }, new[] { p, Particles.PiZero }),
            R("Below about 140 MeV: Compton scattering off the proton.", new[] { g, p }, new[] { g, p })),
            "Gamma rays of a few hundred MeV hit protons.");

        var hadronicPhoton = O("Photon acting like a hadron",
            new[] { T(Particles.PiPlus, -12), T(Particles.PiMinus, -50), T(p, 150) },
            new[]
            {
                Pr(Particles.PiPlus, "One of two pions from a ρ⁰ meson, which decays almost at once."),
                Pr(Particles.PiMinus, "The other pion from the ρ⁰."),
                Pr(p, "The proton, scattered but intact."),
            },
            "A high-energy photon spends part of its time as a quark-antiquark pair, so it often hits the proton the way a hadron would. "
            + "One of the commonest outcomes knocks out a ρ⁰ meson and leaves the proton intact; the ρ⁰ decays into two pions. "
            + "Many other collisions shatter the proton into jets. "
            + "HERA at DESY studied this at up to about 0.3 TeV, and at the LHC photons radiated by one beam hit protons in the other at even higher energies.");
        On("gamma", "p", Band.GeV, hadronicPhoton, "High-energy photons hit protons, as at the HERA collider.");
        On("gamma", "p", Band.TeV, hadronicPhoton, "Photons from one LHC beam hit protons in the other.");

        On("gamma", "atom", Band.KeV, O("Photoelectric effect",
            new[] { T(e, -40), T(cIon, 140) },
            new[]
            {
                Pr(e, "Photoelectron: it gets the photon's energy minus the energy that bound it to the atom."),
                Pr(cIon, "The ion left behind, with a hole in an inner shell that is soon refilled."),
            },
            "The atom absorbs the photon completely and throws out one of its electrons. "
            + "A free electron cannot do this alone, because it could not conserve both energy and momentum, so the rest of the atom takes up the recoil. "
            + "Einstein explained the effect in 1905, for ultraviolet light on metals, by saying light comes in quanta: the work cited for his 1921 Nobel Prize. "
            + "At X-ray energies the chance rises steeply with atomic number, which is why bones (calcium) show up on X-ray images against soft tissue (mostly carbon, oxygen and hydrogen)."),
            "An X-ray photon of a few keV hits a carbon atom.");

        On("gamma", "atom", Band.MeV, O("Compton scattering off an atom",
            new[] { T(g, -35), T(e, 145), T(cIon, 90) },
            new[]
            {
                Pr(g, "The scattered photon, carrying on with less energy."),
                Pr(e, "A Compton electron, knocked free."),
                Pr(cIon, "The atom, ionised but otherwise untouched."),
            },
            "At MeV energies the atom's electrons are so loosely bound by comparison that the photon scatters off one as if it were free. "
            + "This is the main way gamma rays of this energy interact in light materials like carbon, water and tissue. "
            + "Above 1.022 MeV the photon can instead turn into an electron-positron pair near the nucleus; that takes over at tens of MeV in carbon (and at a few MeV in lead). "
            + "Gamma-ray shielding and radiotherapy doses both depend on this balance.",
            R("Pair production near the nucleus, which takes over at tens of MeV.", new[] { g, c }, new[] { ep, e, c })),
            "A gamma ray of a few MeV hits a carbon atom.");

        var pair = O("Pair production",
            new[] { T(ep, -20), T(e, 25), T(c, 180) },
            new[]
            {
                Pr(ep, "The positron."),
                Pr(e, "The electron. The pair shares the photon's energy, and their tracks bend opposite ways."),
                Pr(c, "The nucleus takes a little recoil; without it the photon could not convert and conserve momentum."),
            },
            "The photon turns into an electron and a positron in the strong electric field near the nucleus: light becoming matter, with the 1.022 MeV threshold far behind. "
            + "Charge (0 = +1 − 1) and lepton number (0 = −1 + 1) balance because matter and antimatter appear together. "
            + "Each new particle then radiates more photons, starting a shower. "
            + "The Fermi space telescope detects GeV gamma rays by letting them convert in thin tungsten sheets and tracking the pair, while ground telescopes see the light from showers that TeV gamma rays make in the air.");
        On("gamma", "atom", Band.GeV, pair, "A GeV gamma ray hits matter, as in the Fermi space telescope.");
        On("gamma", "atom", Band.TeV, pair, "A TeV gamma ray from space hits the upper atmosphere.");

        // ---- protons ----
        On("p", "p", Band.KeV, O("Repulsion, and very rarely fusion",
            new[] { T(p, -35), T(p, 145) },
            new[] { Pr(p, "Both protons fly apart again, turned back by their electric repulsion.") },
            "Two protons repel, and at keV energies they almost never get close enough for the strong force to grab them. "
            + "Almost never is not never: quantum tunnelling occasionally gets them through the barrier, and then, far more rarely still, the weak force turns one proton into a neutron while they touch, making deuterium. "
            + "This is the first step of the proton-proton chain that powers the Sun, whose core is about 15 million degrees (around 1 keV). "
            + "It is so slow that a proton in the Sun's core typically waits billions of years before it fuses, which is why the Sun lasts so long.",
            R("The fusion route, worked out by Hans Bethe and Charles Critchfield in 1938. The positron's lepton number −1 is balanced by the neutrino's +1.",
                new[] { p, p }, new[] { Particles.Deuteron, ep, nu })),
            "Protons with keV energies, like those in the core of the Sun.");

        On("p", "p", Band.MeV, O("Elastic scattering",
            new[] { T(p, -45), T(p, 135) },
            new[] { Pr(p, "Both protons bounce off intact.") },
            "Now the protons get close enough for the strong nuclear force to act, but there is not yet enough energy to make anything new: "
            + "they simply bounce, through a mix of electric repulsion and short-range nuclear attraction. "
            + "Hideki Yukawa explained that short range in 1935 by proposing that a new particle carries the force: the pion. "
            + "Above about 140 MeV of collision energy (about 280 MeV of beam energy on a proton at rest) there is enough energy to make real pions.",
            R("Above about 140 MeV the protons can stick together as a deuteron and throw out a pion.", new[] { p, p }, new[] { Particles.Deuteron, Particles.PiPlus })),
            "Protons with tens of MeV of collision energy.");

        On("p", "p", Band.GeV, O("Pion production",
            new[] { T(p, -15), T(Particles.PiMinus, 57), T(Particles.PiZero, 129), T(p, 201), T(Particles.PiPlus, 273) },
            new[]
            {
                Pr(p, "Two protons survive: baryon number 2 must be kept."),
                Pr(Particles.PiPlus, "Charged pions, the lightest mesons, made from the collision energy."),
                Pr(Particles.PiMinus, "Its negative partner keeps the total charge at +2."),
                Pr(Particles.PiZero, "A neutral pion. It leaves no track and decays almost at once into two photons."),
            },
            "Now there is energy to spare, and E = mc² turns it into new particles: mostly pions, each made of a quark and an antiquark. "
            + "Kaons, which contain strange quarks, appear too. "
            + "Charge, baryon number and lepton number still balance exactly: two protons go in, two protons and three pions with total charge 0 come out. "
            + "With about 2 GeV of collision energy, two protons can even make a proton-antiproton pair: that is how the antiproton was discovered at Berkeley's Bevatron in 1955.",
            R("Antiproton production. Baryon number: 1 + 1 → 1 + 1 + 1 − 1.", new[] { p, p }, new[] { p, p, p, Particles.AntiProton })),
            "Protons with a few GeV of collision energy.");

        On("p", "p", Band.TeV, O("LHC: jets, and very rarely a Higgs",
            new[] { T(Particles.Gluon, -60), T(Particles.Gluon, 120), T(Particles.RemnantUud, 6), T(Particles.RemnantUud, 186) },
            new[]
            {
                Pr(Particles.Gluon, "Two gluons scattered hard, each becoming a jet of dozens of hadrons."),
                Pr(Particles.RemnantUud, "What is left of each proton carries on along the beam pipe."),
            },
            "At the LHC (13.6 TeV) each collision is really between single quarks or gluons inside the protons, each carrying a share of the energy. "
            + "Most collisions are glancing and spray soft particles along the beam; the commonest hard ones scatter two gluons or quarks into back-to-back jets. "
            + "Heavy particles are rare: only about one collision in a billion makes a Higgs boson, mostly by two gluons fusing. "
            + "The Higgs lives about 10⁻²² s, and only about 0.2% of Higgs bosons decay into two photons, the clean signal that, with decays into four leptons, let ATLAS and CMS announce the discovery in 2012. "
            + "That is why the LHC makes about a billion collisions every second.",
            R("About one collision in a billion: two gluons fuse into a Higgs boson, which here decays into two photons.",
                new[] { p, p }, new[] { g, g, Particles.RemnantUud, Particles.RemnantUud })),
            "Proton beams colliding head on at the LHC, 13.6 TeV.");

        On("p", "atom", Band.KeV, O("Ionisation",
            new[] { T(p, -20), T(e, 70), T(cIon, 200) },
            new[]
            {
                Pr(p, "The proton, slightly slowed."),
                Pr(e, "An electron knocked out of the atom."),
                Pr(cIon, "The carbon ion left behind."),
            },
            "At keV energies a proton mostly knocks electrons off atoms, losing a little energy each time; slow ones often grab an electron and travel as hydrogen for a while. "
            + "It almost never reaches the nucleus, because the electric repulsion between them is a barrier about 2 MeV high. "
            + "In hot stars protons occasionally tunnel through it, and proton capture on carbon-12 starts the CNO cycle, the main fusion route in stars somewhat heavier than the Sun.",
            R("The first step of the CNO cycle, inside stars.", new[] { p, Particles.C12Nucleus }, new[] { Particles.N13Nucleus, g })),
            "Protons with keV energies enter carbon.");

        On("p", "atom", Band.MeV, O("Rutherford scattering",
            new[] { T(p, -60), T(c, 120) },
            new[]
            {
                Pr(p, "The proton, thrown through a large angle by a close pass by the nucleus."),
                Pr(c, "The carbon atom recoils."),
            },
            "MeV protons punch through the electron clouds. Most pass far from the nucleus and are barely deflected, but the rare close pass by the tiny, dense nucleus throws the proton through a large angle. "
            + "This is how Hans Geiger and Ernest Marsden, firing alpha particles at gold foil in 1909, revealed the nucleus, which Rutherford explained in 1911. "
            + "Along the way the proton loses energy to electrons faster and faster as it slows, so it stops at a sharp depth (the Bragg peak). "
            + "Proton therapy, with beams of about 70 to 250 MeV, uses this to deliver its dose to a tumour and spare the tissue beyond.",
            R("A few protons knock a neutron out of a nucleus, making carbon-11. It emits positrons, so a PET scan can check where the beam went.",
                new[] { p, c }, new[] { p, n, Particles.Carbon11 })),
            "Protons with tens to hundreds of MeV enter carbon, as in proton therapy.");

        On("p", "atom", Band.GeV, O("Spallation",
            new[] { T(p, -20), T(n, 30), T(Particles.PiPlus, 100), T(Particles.PiMinus, -110), T(Particles.Carbon11, 200) },
            new[]
            {
                Pr(p, "The proton carries on, having lost some energy."),
                Pr(n, "A neutron knocked out of the nucleus."),
                Pr(Particles.PiPlus, "A positive pion, made from the collision energy."),
                Pr(Particles.PiMinus, "Its negative partner, so the new pions carry no net charge."),
                Pr(Particles.Carbon11, "The battered nucleus, one neutron short: carbon-11."),
            },
            "A GeV proton is fast enough to hit individual protons and neutrons inside the nucleus, knocking them out and making pions; a heavier nucleus would then boil off more neutrons. "
            + "This is spallation. Spallation neutron sources such as ISIS in the UK, SNS in the US and ESS in Sweden fire protons of around a GeV at heavy-metal targets, each proton freeing a few dozen neutrons for studying materials. "
            + "Cosmic-ray spallation in space made much of the lithium and most of the beryllium and boron in the universe."),
            "Protons with around a GeV hit carbon nuclei.");

        On("p", "atom", Band.TeV, O("Cosmic-ray air shower",
            new[] { T(p, -6), T(Particles.PiPlus, -55), T(Particles.PiMinus, 35), T(Particles.PiZero, 95), T(Particles.PiPlus, -120), T(Particles.PiMinus, 150), T(Particles.CarbonDebris, 205) },
            new[]
            {
                Pr(p, "A leading proton keeps much of the energy."),
                Pr(Particles.PiPlus, "Positive pions. Many decay into muons, which reach the ground."),
                Pr(Particles.PiMinus, "Negative pions. With the positive ones and the leading proton, the charge still adds up to +1."),
                Pr(Particles.PiZero, "Neutral pions decay at once into gamma rays, which start electromagnetic showers."),
                Pr(Particles.CarbonDebris, "What is left of the nucleus breaks into fragments."),
            },
            "Cosmic-ray protons with TeV energies and beyond hit nuclei of nitrogen and oxygen (much like carbon) high in the atmosphere. "
            + "Each collision makes a burst of pions, which hit more nuclei or decay, and the cascade grows into an air shower: at the very highest energies, billions of particles spread over many square kilometres. "
            + "Victor Hess discovered cosmic rays on balloon flights in 1912, and the muon was discovered in cosmic-ray showers in 1936.",
            R("Each neutral pion decays into two photons.", new[] { Particles.PiZero }, new[] { g, g })),
            "A cosmic-ray proton with tens of TeV or more hits a nucleus high in the atmosphere.");

        // ---- electron antineutrinos ----
        Off("antinu", "e-", Band.KeV, "Antineutrinos with only keV of energy, such as those from tritium decay, interact far too rarely to detect.");
        On("antinu", "e-", Band.MeV, O("Antineutrino-electron scattering",
            new[] { T(nub, -30), T(e, 150) },
            new[]
            {
                Pr(nub, "Leaves again, unseen."),
                Pr(e, "The recoiling electron: the only thing a detector sees."),
            },
            "The antineutrino feels only the weak force (and gravity), so it scatters off the electron extremely rarely. "
            + "Two weak processes add up: Z boson exchange, open to any neutrino, and W boson exchange, possible because the electron and the electron antineutrino belong to the same family. "
            + "It was first seen with reactor antineutrinos in the 1970s. "
            + "Lepton number stays 0: the antineutrino's −1 cancels the electron's +1, before and after."),
            "Reactor antineutrinos (a few MeV) pass through a detector's electrons.");

        On("antinu", "e-", Band.GeV, O("Glashow resonance: making a W boson",
            new[] { T(Particles.Down, -60), T(Particles.AntiUp, 120) },
            new[]
            {
                Pr(Particles.Down, "One of two jets: the W⁻ decays into a quark and an antiquark about two-thirds of the time."),
                Pr(Particles.AntiUp, "The other jet."),
            },
            "An electron antineutrino and an electron can merge into a single W⁻ boson, which needs the collision energy to match the W's mass, about 80 GeV: a resonance, predicted by Sheldon Glashow in 1960. "
            + "With the electron at rest that takes an antineutrino of about 6.3 PeV (6.3 × 10¹⁵ eV). "
            + "In 2021 the IceCube detector, a cubic kilometre of Antarctic ice, reported a particle shower of about that energy, consistent with this process. "
            + "The W⁻ lives about 10⁻²⁵ s. Away from 80 GeV the pair simply scatters again.",
            R("About one time in nine the W⁻ decays back into an electron and an electron antineutrino.", new[] { nub, e }, new[] { e, nub })),
            "The collision energy is tuned to the W boson's mass, about 80 GeV.");
        Off("antinu", "e-", Band.TeV, "TeV collision energies with an electron at rest need antineutrinos of about 10¹⁸ eV, and no experiment has studied such collisions.");

        Off("antinu", "p", Band.KeV, "Below about 1.8 MeV an antineutrino cannot turn a proton into a neutron and a positron, and elastic scattering at keV energies is far too rare to detect.");
        On("antinu", "p", Band.MeV, O("Inverse beta decay",
            new[] { T(ep, -40), T(n, 140) },
            new[]
            {
                Pr(ep, "Annihilates within nanoseconds, giving a flash of light."),
                Pr(n, "Neutral, so it wanders until a nucleus captures it microseconds later, giving a second flash."),
            },
            "The antineutrino turns the proton into a neutron and emits a positron: inverse beta decay. "
            + "It needs at least 1.8 MeV, because a neutron plus a positron weigh more than a proton. "
            + "Clyde Cowan and Frederick Reines used it at the Savannah River reactor in 1956 to make the first detection of the (anti)neutrino: "
            + "the positron's flash followed, a few microseconds later, by the neutron's capture flash, a two-step signature that almost nothing else imitates. "
            + "Reactor neutrino detectors still use it."),
            "Reactor antineutrinos (a few MeV) hit protons in water.");

        var disNu = O("Deep inelastic antineutrino scattering",
            new[] { T(ep, -35), T(Particles.Down, 45), T(Particles.RemnantUd, 168) },
            new[]
            {
                Pr(ep, "The antineutrino became a positron by emitting a W⁻ boson."),
                Pr(Particles.Down, "The struck u quark absorbed the W⁻ and became a d quark, now a jet."),
                Pr(Particles.RemnantUd, "The rest of the proton."),
            },
            "The antineutrino emits a W⁻ boson that hits a single quark inside the proton, changing a u quark into a d quark, and comes out as a positron. "
            + "Neutrino scattering like this confirmed the quark picture, and in 1973 the Gargamelle bubble chamber at CERN saw collisions in which the neutrino stays a neutrino (Z exchange), the first sign of the neutral weak current. "
            + "At the low end of this band the proton often survives as a neutron instead (quasi-elastic scattering). "
            + "At TeV collision energies, reached by PeV antineutrinos from space seen by IceCube, the antineutrino mostly hits the short-lived quark-antiquark pairs inside the proton, and even the Earth becomes opaque to them.",
            R("Neutral current: the antineutrino stays an antineutrino and just knocks a quark out (Z exchange).", new[] { nub, p }, new[] { nub, Particles.Up, Particles.RemnantUd }));
        On("antinu", "p", Band.GeV, disNu, "Antineutrinos with GeV collision energies hit protons (accelerator beams are mostly the muon kind, which make a muon instead of a positron).");
        On("antinu", "p", Band.TeV, disNu, "Antineutrinos from space with PeV energies hit protons in Antarctic ice, giving TeV collision energies.");

        const string sameAsProton = "At this energy the antineutrino hits a single proton or neutron inside the nucleus: choose the proton target to see it.";
        Off("antinu", "atom", Band.KeV, "Antineutrinos with only keV of energy interact far too rarely to detect.");
        On("antinu", "atom", Band.MeV, O("Coherent scattering off the nucleus",
            new[] { T(nub, -30), T(c, 150) },
            new[]
            {
                Pr(nub, "Carries on, unseen."),
                Pr(c, "The whole atom recoils, with only about a keV of kinetic energy."),
            },
            "At a few MeV the antineutrino's wavelength is bigger than the nucleus, so through Z exchange it scatters off the whole nucleus at once, "
            + "and the rate grows roughly as the number of neutrons squared. "
            + "This coherent elastic scattering was predicted in 1974 and first observed in 2017 by the COHERENT experiment, using neutrinos from a spallation source and a detector of about 15 kg, tiny by neutrino standards. "
            + "The only signal is the nucleus's feeble recoil. At tens of MeV and above, the coherence fades and it starts hitting individual protons and neutrons."),
            "Antineutrinos of a few MeV pass through carbon.");
        Off("antinu", "atom", Band.GeV, sameAsProton);
        Off("antinu", "atom", Band.TeV, sameAsProton);

        return t;
    }
}

public sealed record TrackShape(TrackStyle Style, string Path, double LabelX, double LabelY, IReadOnlyList<(double X, double Y)> Points);

// Tracks are drawn in a 400 x 200 view box from a vertex at its centre, in the centre-of-mass frame.
public static class ParticleSandboxGeometry
{
    public const double W = 400, H = 200, Vx = 200, Vy = 100;
    private const double Len = 82, RecoilLen = 16, JetHalfAngle = 9, LabelGap = 10;

    // Unit-charge bending radius: higher bands mean more momentum, so straighter tracks.
    public static double Radius(Band b) => b switch
    {
        Band.KeV => 34,
        Band.MeV => 55,
        Band.GeV => 140,
        _ => 600,
    };

    public static string F(double v) => v.ToString("F1", CultureInfo.InvariantCulture);

    private static (double X, double Y) Dir(double deg)
    {
        var a = deg * Math.PI / 180;
        return (Math.Cos(a), Math.Sin(a));
    }

    public static TrackShape Shape(Track t, Band band)
    {
        var style = t.P.Style;
        var (dx, dy) = Dir(t.Angle);
        var pts = new List<(double X, double Y)> { (Vx, Vy) };
        string path;
        (double X, double Y) labelFrom;

        switch (style)
        {
            case TrackStyle.Charged:
            {
                // Field out of the screen: positive charges turn clockwise (increasing screen angle).
                var sign = t.P.Charge3 > 0 ? 1 : -1;
                var r = Radius(band) * 3 / Math.Abs(t.P.Charge3);
                var sweep = Math.Min(Len, 0.7 * Math.PI * r) / r;
                var th = t.Angle * Math.PI / 180;
                const int steps = 28;
                for (var i = 1; i <= steps; i++)
                {
                    var phi = sweep * i / steps;
                    pts.Add((Vx + sign * r * (Math.Sin(th + sign * phi) - Math.Sin(th)),
                             Vy + sign * r * (Math.Cos(th) - Math.Cos(th + sign * phi))));
                }
                path = "M" + string.Join(" L", pts.Select(q => $"{F(q.X)},{F(q.Y)}"));
                labelFrom = pts[^1];
                break;
            }
            case TrackStyle.Jet:
            {
                var (ax, ay) = Dir(t.Angle - JetHalfAngle);
                var (bx, by) = Dir(t.Angle + JetHalfAngle);
                var p1 = (Vx + Len * ax, Vy + Len * ay);
                var tip = (Vx + (Len + 8) * dx, Vy + (Len + 8) * dy);
                var p2 = (Vx + Len * bx, Vy + Len * by);
                pts.Add(p1); pts.Add(tip); pts.Add(p2);
                path = $"M{F(Vx)},{F(Vy)} L{F(p1.Item1)},{F(p1.Item2)} Q{F(tip.Item1)},{F(tip.Item2)} {F(p2.Item1)},{F(p2.Item2)} Z";
                labelFrom = tip;
                break;
            }
            default:
            {
                var len = style == TrackStyle.Recoil ? RecoilLen : Len;
                var end = (Vx + len * dx, Vy + len * dy);
                pts.Add(end);
                path = $"M{F(Vx)},{F(Vy)} L{F(end.Item1)},{F(end.Item2)}";
                labelFrom = end;
                break;
            }
        }

        var ox = labelFrom.X - Vx; var oy = labelFrom.Y - Vy;
        var d = Math.Sqrt(ox * ox + oy * oy);
        var (ux, uy) = d > 1 ? (ox / d, oy / d) : (dx, dy);
        var lx = Math.Clamp(labelFrom.X + LabelGap * ux, 10, W - 10);
        var ly = Math.Clamp(labelFrom.Y + LabelGap * uy, 10, H - 8);
        return new TrackShape(style, path, lx, ly, pts);
    }
}
