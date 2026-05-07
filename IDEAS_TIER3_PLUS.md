# Topic Ideas — Backlog & Future Tiers

Companion to `TODO_TIER3.md`. Holds Tier 3 candidates not yet queued, plus speculative Tier 4 (Expert) and Tier 5 (Frontier) sketches.

---

## Tier 3 Backlog (proposed but not in build queue)

### Math (all 16 deferred — none in current queue)

| id | scope | gate |
|----|-------|------|
| `math-algebraic-topology` | Singular & cellular homology, cohomology rings, Poincaré duality, Eilenberg–MacLane, spectral seq intro | topology, group-theory |
| `math-algebraic-geometry` | Varieties, sheaves, schemes, divisors, Riemann–Roch | number-theory, complex-analysis, group-theory |
| `math-lie-theory` | Matrix Lie groups, exp map, root systems, Cartan classification | group-theory, differential-geometry |
| `math-representation-theory` | Reps of finite groups, characters, Schur, induced reps | group-theory, linear-algebra |
| `math-functional-analysis` | Banach/Hilbert, bounded operators, spectral theorem, Sobolev | linear-algebra, complex-analysis |
| `math-measure-theory` | σ-algebras, Lebesgue, Radon–Nikodym, Lp, weak convergence | calculus, set-theory, probability |
| `math-stochastic-analysis` | Brownian motion, Itô, SDEs, Girsanov, martingales | probability, differential-equations, math-measure-theory |
| `math-pde-advanced` | Sobolev embedding, weak solutions, elliptic regularity, dispersive | differential-equations, fourier-analysis, math-functional-analysis |
| `math-category-theory` | Functors, natural transformations, limits, adjunctions, Yoneda, monads | group-theory, set-theory, topology |
| `math-model-theory` | Structures, types, ω-stability, o-minimality, Hrushovski | set-theory, math-category-theory |
| `math-analytic-nt` | ζ & L-functions, PNT, sieves, circle method | number-theory, complex-analysis |
| `math-algebraic-nt` | Number fields, ramification, class groups, local fields | number-theory, math-algebraic-geometry |
| `math-symplectic` | Symplectic forms, Darboux, momentum maps, Floer intro | differential-geometry, math-lie-theory |
| `math-ergodic` | Birkhoff, mixing, entropy, equidistribution (Furstenberg) | math-measure-theory |
| `math-info-geometry` | Statistical manifolds, Fisher metric, dual connections | differential-geometry, probability |
| `math-hott` | Dependent types, identity types, univalence, cubical, Lean | math-category-theory, computation |

### Physics (deferred)

| id | scope | gate |
|----|-------|------|
| `physics-stat-mech` | Ensembles, partition fns, phase transitions, Ising, RG flow | physics-thermodynamics, probability |
| `physics-many-body` | Second quantization, Green's fns, Hartree–Fock, BCS, DMFT | physics-condensed-matter, physics-quantum |
| `physics-cosmology` | FRW, CMB, inflation, structure formation, dark sector | physics-relativity, physics-astrophysics |
| `physics-quantum-info` | Qubits, entanglement, channels, codes, Bell | physics-quantum |
| `physics-string-intro` | Bosonic & superstring action, compactification, AdS/CFT taste | physics-qft, physics-gr-advanced |
| `physics-soft-matter` | Polymers, colloids, liquid crystals, active matter | physics-condensed-matter, physics-fluids |
| `physics-atomic-mol` | Fine/hyperfine, lasers, cold atoms, BEC, cavity QED | physics-quantum, physics-optics |

### Chemistry (deferred)

| id | scope | gate |
|----|-------|------|
| `chem-supramolecular` | Host–guest, self-assembly, MOFs, COFs, molecular machines | chem-organic, chem-physical |
| `chem-electrochem` | Nernst, Butler–Volmer, voltammetry, batteries, fuel cells | chem-physical, chem-analytical |
| `chem-photochem` | Excited states, Jablonski, Marcus theory, photocatalysis | chem-physical, physics-optics |
| `chem-medchem` | SAR, drug design, ADME, fragment-based, PROTACs | chem-pharma, chem-biochemistry |
| `chem-nano` | Quantum dots, carbon allotropes, plasmonics, synthesis | chem-surface, mat-functional |
| `chem-asymmetric` | Chirality, stereoselectivity, organocatalysis, enzyme catalysis | chem-organic |

### Biology (deferred)

| id | scope | gate |
|----|-------|------|
| `bio-systems` | Network motifs, flux balance, stochastic gene expr, omics | bio-cell, bio-genetics, graph-theory |
| `bio-bioinformatics` | Alignment (BWT, HMM), phylogenetics, GWAS, variant calling | bio-genetics, cs-algorithms |
| `bio-structural` | Cryo-EM, X-ray, AlphaFold, protein dynamics | bio-cell, chem-biochemistry |
| `bio-comp-neuro` | Hodgkin–Huxley, integrate-and-fire, neural coding, attractors | bio-neuroscience, differential-equations |
| `bio-evo-devo` | Hox, body plan evolution, modularity, evolvability | bio-evolution, bio-developmental |
| `bio-microbiome` | 16S, shotgun seq, host–microbe, dysbiosis | bio-microbiology, bio-bioinformatics |
| `bio-population` | Wright–Fisher, coalescent, neutral theory, FST | bio-evolution, probability |

### Geology (deferred)

| id | scope | gate |
|----|-------|------|
| `geo-geophysics` | Seismology, gravity, geomagnetism, mantle tomography | geology-tectonics, physics-mechanics |
| `geo-paleoclimate` | Ice cores, δ¹⁸O, Milankovitch, deep-time states | geology-stratigraphy, geology-hydrology |
| `geo-planetary` | Mars, Moon, icy moons, Venus, exoplanet surfaces | geology-tectonics, geology-volcanism |
| `geo-geomorphology` | Erosion laws, landscape evolution, glacial/fluvial/coastal | geology-tectonics, geology-hydrology |
| `geo-econ-mining` | Ore genesis, hydrocarbons, critical minerals, exploration | geology-metals, geology-mineralogy |
| `geo-natural-hazards` | EQ rupture physics, tsunami, volcanic risk, forecasting | geology-tectonics, geology-volcanism |

### Materials (deferred)

| id | scope | gate |
|----|-------|------|
| `mat-electronic` | Band engineering, semiconductors, ferroelectrics, spintronics | mat-structure, physics-condensed-matter |
| `mat-composites` | Fiber-reinforced, laminate theory, fracture mech, fatigue | mat-mechanical, mat-phases |
| `mat-energy` | Battery cathodes, PV, thermoelectrics, hydrogen storage | mat-functional, chem-electrochem |
| `mat-comp-materials` | DFT for solids, MD, phase-field, ICME, materials informatics | mat-structure, chem-quantum-chem |
| `mat-metallurgy` | Steels, superalloys, processing-microstructure-property, AM | mat-mechanical, mat-transitions, geology-metals |

### CS (deferred)

| id | scope | gate |
|----|-------|------|
| `cs-pl-theory` | Lambda calc, type systems, semantics, effects | cs-paradigms, set-theory |
| `cs-formal-methods` | Hoare, model checking (TLA+, SPIN), Coq/Lean, separation logic | cs-pl-theory, philosophy-logic |
| `cs-distributed-advanced` | Consensus (Raft, Paxos, BFT), CRDTs, Spanner-style | cs-systems, cs-databases |
| `cs-graphics` | Rasterization, ray tracing, BRDFs, real-time PBR | cs-algorithms, linear-algebra |
| `cs-databases-internals` | LSM vs B-tree, MVCC, query planning, columnar, vector DBs | cs-databases, cs-systems |
| `cs-os-internals` | Schedulers, VM deep, eBPF, microkernels, hypervisors | cs-os, cs-systems |
| `cs-game-theory-cs` | Equilibria, mechanism design, auctions, price of anarchy | cs-algorithms, probability |

### History (deferred)

| id | scope | gate |
|----|-------|------|
| `history-diplomatic` | Westphalia, Congress system, Cold War, post-1991 order | history-early-modern, history-twentieth |
| `history-intellectual` | Enlightenment, romanticism, modernism, ideologies | history-of-science, philosophy-german-idealism |
| `history-cultural` | Daily life, foodways, dress, material culture | history-medieval, history-early-modern |
| `history-decolonization` | African/Asian independence, neocolonialism, Bandung | history-african, history-south-asian, history-modern |

### Linguistics (all deferred — none in current queue)

| id | scope | gate |
|----|-------|------|
| `ling-psycholing` | Sentence processing, parsing, eye-tracking, aphasia | ling-syntax, ling-semantics |
| `ling-neuroling` | Broca/Wernicke, ERPs, imaging, lateralization | ling-psycholing, bio-neuroscience |
| `ling-comp-ling` | Parsers, distributional semantics, transformers as ling tools | ling-syntax, cs-ai-ml |
| `ling-acquisition` | L1 stages, poverty of stimulus, critical period, L2 | ling-phonetics, ling-morphology |
| `ling-typology` | Word order, alignment, universals, areal features | ling-syntax, ling-historical |
| `ling-formal-semantics` | Montague, type-logical, dynamic, DRT | ling-semantics, set-theory |
| `ling-sign-languages` | ASL/BSL phonology, syntax in space, modality | ling-phonetics, ling-syntax |
| `ling-writing-systems` | Alphabet/abugida/syllabary/logograph, decipherment | ling-historical, ling-morphology |
| `ling-cognitive` | Conceptual metaphor, frames, construction grammar | ling-semantics |

### Philosophy (deferred)

| id | scope | gate |
|----|-------|------|
| `philosophy-political` | Hobbes→Rawls→Nozick, justice, liberty, democratic theory | philosophy-ethics |
| `philosophy-science` | Demarcation, Kuhn, Lakatos, realism, scientific explanation | philosophy-epistemology, philosophy-logic |
| `philosophy-language` | Frege, Russell, Wittgenstein, Kripke, Grice, speech acts | philosophy-logic, philosophy-metaphysics |
| `philosophy-religion` | God arguments, problem of evil, faith/reason | philosophy-metaphysics, philosophy-epistemology |
| `philosophy-tech-ai` | AI ethics, alignment, agency, surveillance, transhumanism | philosophy-mind, philosophy-ethics |
| `philosophy-feminist` | Gender, care ethics, intersectionality, epistemic injustice | philosophy-ethics, philosophy-epistemology |
| `philosophy-history` | Hegel, Vico, narrativism, historiography critique | philosophy-german-idealism, philosophy-marxism |
| `philosophy-action` | Reasons, intentions, compatibilism, Frankfurt cases | philosophy-mind, philosophy-ethics |
| `philosophy-applied-ethics` | Bioethics, animal, environmental, business | philosophy-ethics |
| `philosophy-modal-logic` | S4/S5, intuitionist, paraconsistent, fuzzy, deontic | philosophy-logic |

### Esoterica (deferred)

| id | scope | gate |
|----|-------|------|
| `misc-pseudohistory` | Hancock/Atlantis/ancient aliens — argument-failure anatomy | misc-conspiracy, misc-ouparts, misc-lostcities |
| `misc-uap-modern` | 1947→2017, sociology of belief, signal vs noise, govt programs | misc-coldwarpsi, misc-conspiracy |
| `misc-deep-state-claims` | MKUltra (real) vs QAnon (not) — separating ops from mythology | misc-coldwarpsi, misc-conspiracy |
| `misc-cryptids-zoology` | Methodology critique, real rediscoveries vs persistent myths | misc-vanishings, misc-lostcities |

### Cross-domain capstones (deferred)

| id | scope | gate |
|----|-------|------|
| `xd-mathematical-physics` | Variational principles, gauge math, path integrals as math | math-pde-advanced, math-lie-theory, physics-qft |
| `xd-comp-cognitive-science` | Embodied cog, predictive processing, computational accounts of mind | bio-comp-neuro, cs-deep-learning, philosophy-mind |
| `xd-econ-history-quant` | Cliometrics, growth models, network finance history | history-economic, probability, cs-algorithms |
| `xd-philosophy-of-physics` | Interpretations of QM, time, spacetime substantivalism | physics-quantum, physics-relativity, philosophy-science |
| `xd-bioethics` | Enhancement, gene editing, end-of-life, dual-use research | bio-cancer or bio-synthetic, philosophy-applied-ethics |
| `xd-historical-linguistics-genomics` | Indo-European, Bantu expansion, Polynesian, ancient DNA × phylogenetics | ling-historical, bio-population |

---

## Tier 4 — Expert sketches

Narrow specializations gated by ≥2 Tier 3 in the same domain (or close cousins). Research-adjacent; reading current textbook + survey level.

### Math
- **Langlands Program (intro)** — automorphic forms ↔ Galois reps, function-field analogue. [math-algebraic-nt, math-representation-theory]
- **∞-Categories & Higher Algebra** — quasi-categories, Lurie's HTT, derived AG taste. [math-category-theory, math-algebraic-topology]
- **Perfectoid Spaces & p-adic Hodge Theory** — Scholze's program, tilting equivalence. [math-algebraic-nt, math-algebraic-geometry]
- **Geometric Group Theory** — hyperbolic groups, Gromov, asymptotic invariants. [math-representation-theory, topology]
- **Operator Algebras** — C*- and von Neumann algebras, type classification, free probability. [math-functional-analysis, math-measure-theory]

### Physics
- **Lattice QFT** — Wilson action, Monte Carlo, confinement, hadron spectroscopy. [physics-qft]
- **Conformal Bootstrap** — crossing, OPE, numerical bootstrap of CFTs. [physics-qft]
- **Holography / AdS-CFT (deep)** — dictionary, entanglement entropy, RT formula. [physics-string-intro, physics-gr-advanced]
- **Topological Phases** — anyons, fractional QH, topological order, TQFT. [physics-many-body, math-algebraic-topology]
- **Precision Tests of Fundamental Physics** — EDM, anomalous moments, atomic clocks. [physics-atomic-mol, physics-particle]

### Chemistry
- **Single-Molecule Spectroscopy** — FRET, optical tweezers, sm-FCS workflows. [chem-spectroscopy, chem-photochem]
- **Attosecond / Ultrafast Chemistry** — pump-probe, electron dynamics, HHG. [chem-photochem, physics-optics]
- **Enzyme Mechanisms (deep)** — transition-state theory in proteins, QM/MM. [chem-quantum-chem, chem-biochemistry]

### Biology
- **Aging Biology** — hallmarks, senescence, telomere, mitochondrial theory, interventions. [bio-cell, bio-mol-genetics]
- **Neuroimmunology** — microglia, BBB, neuroinflammation, gut-brain. [bio-immunology, bio-neuroscience]
- **Organoids & Tissue Engineering** — gastruloids, brain organoids, vascularization. [bio-developmental, bio-synthetic]
- **Whole-Cell Modeling** — Karr-style integrative simulation. [bio-systems, bio-bioinformatics]

### Geology
- **Geodynamo & Deep Mantle Dynamics** — paleomagnetism, core-mantle coupling. [geo-geophysics, geology-tectonics]
- **Exoplanet Interiors & Habitability** — interior structure modeling, ocean worlds. [geo-planetary, geo-astrobiology]

### Materials
- **High-Entropy Alloys** — phase stability, mech behavior, design principles. [mat-metallurgy, mat-phases]
- **Topological Materials** — TIs, Weyl semimetals, k-theoretic classification. [mat-electronic, math-algebraic-topology]
- **Metamaterials & Photonic Crystals** — neg-index, cloaking, transformation optics. [mat-functional, physics-optics]

### CS
- **Geometric / Equivariant Deep Learning** — group-theoretic NN design, graph nets. [cs-deep-learning, math-representation-theory]
- **Theoretical ML** — VC dim, NTK, mean-field, generalization theory. [cs-deep-learning, math-functional-analysis]
- **Programming Language Implementation Frontier** — effect systems, dependent types in practice (Lean 4, Idris). [cs-pl-theory, cs-formal-methods]
- **Concurrency Theory** — π-calculus, session types, CRDT theory. [cs-distributed-advanced, cs-pl-theory]

### History
- **Big History / Deep History methods** — multi-scale, energy-flow narratives, Christian/Smail. [history-historiography, history-environmental]
- **Cliodynamics** — Turchin, structural-demographic theory, secular cycles. [history-historiography, math-stochastic-analysis or probability]

### Linguistics
- **Macro-typology & Language Universals** — large-scale databases (WALS, Glottolog), evolutionary models. [ling-typology, ling-historical]
- **Computational Phylogenetics of Languages** — Bayesian dating, Indo-European debates. [ling-historical, bio-bioinformatics]

### Philosophy
- **Formal Epistemology** — Bayesian, dynamic epistemic logic, knowledge bases. [philosophy-epistemology, philosophy-modal-logic]
- **Experimental Philosophy** — empirical methods on intuitions, replication issues. [philosophy-science, philosophy-mind]
- **Philosophy of Mathematics (frontier)** — neologicism, structuralism deep, indispensability. [philosophy-of-math, philosophy-language]

### Esoterica
- **Cognitive Science of Belief** — agency detection, pattern bias, motivated reasoning roots. [misc-conspiracy, misc-cult-dynamics]
- **Parapsychology Methodology Critique** — Ganzfeld history, replication record, decline effect. [misc-coldwarpsi, misc-deep-state-claims]

---

## Tier 5 — Frontier sketches

Open problems, conjectural, or genuinely contested. Treat as "explore the question" rather than "master the technique." Reading at survey-paper / preprint level.

### Math
- **Riemann Hypothesis & ζ-function landscape** — what's known, current attacks, related conjectures.
- **P vs NP** — barriers (relativization, natural proofs, algebraization), modern landscape.
- **Hodge Conjecture / BSD / Yang–Mills mass gap** — Millennium-Problem state-of-art.
- **Foundations Multiverse** — set-theoretic vs HoTT vs categorical foundations as live debate.

### Physics
- **Quantum Gravity Approaches Compared** — strings vs LQG vs causal sets vs asymptotic safety.
- **Beyond Standard Model** — SUSY status post-LHC, dark matter candidates landscape, neutrino mass mechanism.
- **Foundations of QM** — measurement, many-worlds vs Bohmian vs QBism vs spontaneous collapse, recent no-go theorems.
- **Hard Problem of Time** — emergence of time in quantum gravity, Page–Wootters, thermal time hypothesis.

### Chemistry
- **Origin of Life Chemistry** — RNA-world vs metabolism-first vs alkaline-vent scenarios, current synthesis attempts.
- **De novo Chemical Life** — minimal cell, xenobiology, alternative biochemistries.

### Biology
- **Substrate of Consciousness** — IIT vs GWT vs higher-order, neural correlates frontier.
- **Origin of the Genetic Code** — frozen accident vs adaptive, codon assignment evolution.
- **Reverse Aging Frontier** — Yamanaka in vivo, partial reprogramming, longevity escape velocity claims.

### Geology / Planetary
- **Snowball Earth & Cryogenian Resolution** — competing models, deglaciation triggers.
- **Earth's Earliest Billion Years (Hadean–Archean)** — when life began, when plate tectonics started.
- **Ocean Worlds Biosignature Search** — Europa Clipper, Enceladus return, what counts as evidence.

### Materials
- **Room-Temperature Superconductivity** — hydride high-pressure results, scrutiny, theory roadmap.
- **Programmable Matter & Active Materials** — claytronics, self-reconfiguring, theoretical limits.

### CS
- **AGI Alignment Frontier** — interpretability, scalable oversight, deception, agent foundations open problems.
- **Post-Quantum Standardization** — lattice/code/isogeny landscape, SIKE break lessons, NIST round-by-round.
- **Hardness of Average-Case Problems** — cryptographic foundations under shifting assumptions.
- **Neuromorphic Computing Frontier** — spiking nets, in-memory compute, energy-efficiency frontier.

### History
- **Counterfactual History as Method** — when (if ever) is it rigorous?
- **Long-Cycle / Civilizational-Collapse Theories** — Tainter, Diamond, comparative validity.

### Linguistics
- **Proto-World / Ultraconservative Phylogenies** — Nostratic, Greenberg, Atkinson — what's defensible?
- **Origin of Language** — gestural vs vocal, when, why, what evidence could ever settle it.

### Philosophy
- **Hard Problem of Consciousness** — explanatory gap, illusionism vs panpsychism vs mysterianism.
- **Free Will Frontier** — neuroscience challenges (Libet etc.) vs compatibilist replies, modern empirical debate.
- **Multiverse Metaphysics** — modal realism, level-N multiverses, anthropic reasoning, measure problem.
- **Simulation Hypothesis as Live Question** — Bostrom's argument, computability constraints, falsifiability claims.

### Esoterica
- **Anomalous Cognition Evidence Audit** — meta-analyses, Bem's furor, what would change minds.
- **Consciousness & Esoteric Claims Interface** — where philosophy of mind meets perennial-philosophy traditions without going woo.

---

## Notes

- Tier 4 needs ≥2 Tier 3 prereqs in domain (or close cousin domain). Lock until both done.
- Tier 5 should read as "tour of the frontier" rather than "master this." Lessons can be more essay/discussion format than problem-set format.
- Reserve room above Tier 5 if needed (e.g. "Active Research") but probably overkill.
- Cross-domain capstones cleanly become Tier 4 candidates if both feeder topics are themselves Tier 3.

---

## Plain-English Explanations — Tier 4

You've mastered the field; now you pick a corner of it that researchers actively argue about.

### Math
- **Langlands Program** — Grand unified theory of math. Claims primes, symmetry groups, and weird infinite-dimensional functions are secretly the same thing. Pieces of it win Fields Medals.
- **∞-Categories** — Normal category theory tracks "things and maps between them." ∞-categories also track "maps between maps between maps...forever." Modern algebraic topology and AG built on this.
- **Perfectoid Spaces** — Scholze's machinery (Fields '18) for moving problems between number theory and geometry over weird p-adic fields. Made several previously stuck problems tractable.
- **Geometric Group Theory** — Treat groups as geometric objects. Word lengths become distances; groups grow into shapes. Big idea: a group's geometry remembers its algebra.
- **Operator Algebras** — Linear algebra for infinite-dimensional spaces, the math substrate of QM. Includes free probability, used in random matrix theory.

### Physics
- **Lattice QFT** — Can't solve QCD with pen and paper, so simulate spacetime as a grid and brute-force. How proton mass got computed from first principles.
- **Conformal Bootstrap** — Solve theories purely from symmetry + consistency, no Lagrangian needed. Modern revival has nailed down 3D Ising critical exponents to absurd precision.
- **Holography (AdS/CFT deep)** — Quantum gravity inside a region equals an ordinary quantum theory on its boundary. Cleanest known toy model of quantum gravity.
- **Topological Phases** — Phases of matter not classified by symmetry breaking but by topology. Source of fractional quantum Hall, anyons, and topological qubit hopes.
- **Precision Tests** — Build experiments so precise (atomic clocks, electron EDM) that tiny deviations from Standard Model show up. Currently the best place to spot new physics.

### Chemistry
- **Single-Molecule Spectroscopy** — Watch one molecule at a time instead of averages. Reveals heterogeneity bulk methods hide.
- **Attosecond Chemistry** — Time-resolve electron motion (10⁻¹⁸ s). Watch chemical bonds form, not just before/after snapshots.
- **Enzyme Mechanisms (deep)** — Use QM/MM hybrids to simulate why enzymes catalyze 10²⁰× faster than bare chemistry. Active controversy: tunneling? dynamics? electrostatics?

### Biology
- **Aging Biology** — Aging isn't one thing; it's ~12 hallmarks (telomeres, senescence, mitochondria, etc.). Field figuring out which are causes vs. symptoms.
- **Neuroimmunology** — Brain has its own immune system (microglia). Implicated in depression, Alzheimer's, autism. Hot field.
- **Organoids** — Mini-brains and mini-guts grown in dishes. Replacing animal models for some research; raising consciousness ethics questions.
- **Whole-Cell Modeling** — Simulate every molecule in a cell. Done once for *Mycoplasma* (Karr 2012). Goal: predictive biology.

### Geology
- **Geodynamo & Deep Mantle** — Why Earth has a magnetic field, why it flips, what's happening 2900 km down. Reconstructed from paleomagnetism + seismology.
- **Exoplanet Interiors** — Given mass + radius, what is the planet made of? Rocky? Water world? Determines habitability bets.

### Materials
- **High-Entropy Alloys** — Mix 5+ metals in roughly equal amounts. Counterintuitively forms single phases with extreme strength/temperature properties. Active design space.
- **Topological Materials** — Insulators that conduct only on their surface, due to topology not chemistry. Possible substrate for fault-tolerant quantum computers.
- **Metamaterials** — Engineered microstructures behaving like materials with properties no natural material has (negative refraction, cloaking).

### CS
- **Geometric / Equivariant DL** — Build neural nets respecting the symmetries of the data (rotations, permutations). AlphaFold uses this. Dramatically more sample-efficient.
- **Theoretical ML** — Why does deep learning work? Neural Tangent Kernel, mean-field, double descent — current attempts at a real theory.
- **PL Implementation Frontier** — Languages where types prove your code correct (Lean 4, Idris, dependent Haskell). Math + code merging.
- **Concurrency Theory** — Formal models for "many things happening at once" — π-calculus, session types. Underlies CRDTs and modern distributed protocols.

### History
- **Big History / Deep History** — Zoom out to 13.8B years or 200,000-year human story. Methodology: how do you do rigorous narrative at that scale?
- **Cliodynamics** — Treat history quantitatively. Turchin claims to predict societal instability cycles using demographic data. Controversial but testable.

### Linguistics
- **Macro-typology** — Use giant databases (WALS) to ask what's a true universal vs. an accident.
- **Computational Phylogenetics of Languages** — Borrow methods from bioinformatics to date language families. Indo-European homeland debates ride on these.

### Philosophy
- **Formal Epistemology** — Treat belief as math (Bayesian probabilities, dynamic logic). What does rational updating actually look like?
- **Experimental Philosophy** — Run surveys/experiments on what people's intuitions actually are. Traditional philosophy assumed "we all think X" without checking.
- **Phil of Math (frontier)** — Are numbers real? Modern positions (neologicism, structuralism) refining the old Platonist vs formalist debate.

### Esoterica
- **Cognitive Science of Belief** — Why conspiracies and cults grip people? Hyperactive agency detection, pattern bias — actual neuroscience of belief formation.
- **Parapsychology Methodology Critique** — Audit the experiments (Ganzfeld, Bem 2011). Why "positive" results vanish under preregistration.

---

## Plain-English Explanations — Tier 5

Nobody knows the answer. Lessons here are guided tours of a debate, not mastery of a technique.

### Math
- **Riemann Hypothesis** — Where do the zeros of the zeta function lie? If all on a specific line, primes well-behaved. Most-wanted unsolved problem.
- **P vs NP** — Is finding answers fundamentally harder than checking them? Likely yes; nobody can prove it; the proof barriers themselves are theorems.
- **Hodge / BSD / Yang-Mills** — Other Millennium Problems. Each connects geometry, NT, or physics to a precise unproven claim worth $1M.
- **Foundations Multiverse** — Should math be built on sets (ZFC), types (HoTT), or categories? Not bookkeeping; the choice affects what's provable.

### Physics
- **Quantum Gravity Approaches** — Strings vs Loop QG vs Causal Sets vs Asymptotic Safety. Nobody has a complete theory; competing programs disagree on basic ontology.
- **Beyond Standard Model** — Why these specific particles? Where's dark matter? Why is gravity so weak? SUSY was front-runner; LHC didn't find it; field reorienting.
- **Foundations of QM** — Many-Worlds, Bohmian, QBism, GRW, Copenhagen. Same predictions for current experiments. Disagreement metaphysical — for now.
- **Hard Problem of Time** — In quantum gravity, time may not be fundamental. So why do we experience time? Maybe entanglement with a clock subsystem. Speculative.

### Chemistry
- **Origin of Life** — RNA world? Metabolism first? Hydrothermal vents? Each has half the story. Synthesis of working protocells now possible step-by-step but not end-to-end.
- **De novo Chemical Life** — Minimal genomes (Venter), synthetic ribosomes, alternative nucleobases. Could life run on non-DNA chemistry?

### Biology
- **Consciousness Substrate** — IIT (Tononi) vs Global Workspace vs higher-order theories. Recent adversarial collaborations slowly distinguishing them.
- **Origin of Genetic Code** — Why does GCA mean alanine? Frozen accident, or did chemistry select it? Active reconstruction work.
- **Reverse Aging** — Partial Yamanaka factor reprogramming reverses some aging marks in mice. Whether this scales to humans is open.

### Geology
- **Snowball Earth** — Did Earth fully freeze 700 Mya? Evidence solid; deglaciation mechanism isn't.
- **Hadean–Archean** — When did life start? When did plate tectonics start? Rocks that old are rare and beat up.
- **Ocean Worlds Biosignatures** — Europa Clipper (2024) and Enceladus return missions. What chemical pattern would actually count as evidence of life?

### Materials
- **Room-Temp Superconductors** — Hydride results at extreme pressures (LK-99 was a bust). Whether ambient-pressure RTS is physically possible is unsettled.
- **Programmable Matter** — Materials that reconfigure on command. Currently macroscopic robots; molecular-scale feasibility is open.

### CS
- **AGI Alignment** — Can we build aligned superintelligence? Subproblems: interpretability, scalable oversight, deception detection. Empirical and conceptual.
- **Post-Quantum Crypto** — Lattice-based schemes leading; SIKE was broken in 2022 reminding us this isn't settled.
- **Average-Case Hardness** — Crypto rests on problems being hard *on average*, not worst case. Foundations shakier than people assume.
- **Neuromorphic Computing** — Brains run on 20W; GPT-4 doesn't. Can we build chips computing like neurons? Hardware exists; software stack doesn't.

### History
- **Counterfactual History** — "What if Hitler won?" — fun, but is it rigorous? Some philosophers say yes for limited claims; most historians say no.
- **Civilizational Collapse Theories** — Tainter (complexity), Diamond (environment), Turchin (demographic). Comparative tests weak; everyone still arguing.

### Linguistics
- **Proto-World** — Was there ever one ancestor language? Some methods (Greenberg, Ruhlen) claim deep links across continents; mainstream historical linguistics says noise.
- **Origin of Language** — When and why did humans start talking? No fossil record for syntax. Possibly unanswerable.

### Philosophy
- **Hard Problem of Consciousness** — Why is there *something it is like* to see red? Even a perfect brain map doesn't obviously explain experience. Or does it?
- **Free Will Frontier** — Libet experiments, neural prediction of decisions. Compatibilists say it doesn't matter; libertarians say it does.
- **Multiverse Metaphysics** — Cosmological multiverse, QM many-worlds, Tegmark mathematical multiverse. Science, philosophy, or neither?
- **Simulation Hypothesis** — Bostrom: if civilizations simulate ancestors, most "people" are sims, so we probably are. Argument tight; testability contested.

### Esoterica
- **Anomalous Cognition Audit** — Meta-analyses of psi experiments (Bem 2011 was the flashpoint). Decline effect, publication bias, replication landscape.
- **Consciousness × Esoteric Traditions** — Phil of mind meets contemplative traditions (Buddhist phenomenology, Advaita) without going woo.
