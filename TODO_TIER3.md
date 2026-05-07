# Tier 3 Topics — Build Queue

Selected advanced topics to author. Each gated by listed prerequisites (Tier 1/2 topics already in `wwwroot/data/`). Difficulty target: `Advanced → Graduate`. Suggested 8–12 lessons per topic.

Status legend: `[ ]` not started · `[~]` drafting · `[x]` shipped (json + lessons + added to topics.json/topic-graph.json).

---

## Computer Science (6)

- [ ] **`cs-compilers`** — Compilers
  - Scope: lexing, parsing (LL/LR), AST, IR, SSA, dataflow, register allocation, optimization passes, LLVM, JIT, GC interplay.
  - Prereqs: `cs-paradigms`, `cs-data-structures`, `cs-algorithms`.
  - Capstone lesson: build a toy language → x86/LLVM IR.

- [ ] **`cs-cryptography`** — Cryptography
  - Scope: symmetric (AES internals, modes, AEAD), asymmetric (RSA, ECC math), hashes & MACs, KDFs, TLS handshake, ZK proofs, lattice-based / post-quantum, side-channel awareness.
  - Prereqs: `cs-security`, `number-theory`.

- [ ] **`cs-deep-learning`** — Deep Learning Internals
  - Scope: backprop derivation, optimizers (SGD→AdamW→Lion), normalization, attention & transformers, tokenization, training stability, scaling laws, MoE, RLHF/DPO, inference (KV cache, speculative decoding).
  - Prereqs: `cs-ai-ml`, `linear-algebra`, `probability`.

- [ ] **`cs-quantum-computing`** — Quantum Computing
  - Scope: qubits & gates, circuits, QFT, Shor, Grover, phase estimation, VQE/QAOA, error correction (surface codes), hardware (superconducting, ion trap, neutral atom).
  - Prereqs: `physics-quantum`, `cs-algorithms`, `linear-algebra`.

- [ ] **`cs-networking-advanced`** — Network Internals
  - Scope: TCP congestion control (Reno→BBR), QUIC, BGP & routing, SDN, P4, DPDK/XDP, RDMA, datacenter fabrics, observability (eBPF).
  - Prereqs: `cs-networks`, `cs-systems`.

- [ ] **`cs-information-theory`** — Information Theory
  - Scope: entropy & mutual info, source coding (Huffman, arithmetic), channel capacity, Shannon's theorems, error-correcting codes (Hamming, Reed–Solomon, LDPC), rate-distortion, Kolmogorov complexity, MDL.
  - Prereqs: `probability`, `cs-algorithms`.

## History (4)

- [ ] **`history-historiography`** — Historiography & Method
  - Scope: source criticism, schools (Annales, Marxist, Cambridge, microhistory, global), bias & positionality, oral history, digital history.
  - Prereqs: any 3 history Tier 2 topics.

- [ ] **`history-environmental`** — Environmental History
  - Scope: Anthropocene origins, Columbian Exchange ecology, climate-driven collapse cases (Bronze Age, LIA), industrial pollution, modern climate politics.
  - Prereqs: `history-modern`, `history-of-science` (or `geology-paleontology`).

- [ ] **`history-warfare`** — Military History & Strategy
  - Scope: tactics evolution (phalanx → combined arms → drones), logistics primacy, Clausewitz/Sun Tzu, RMA, nuclear strategy, insurgency & COIN.
  - Prereqs: `history-twentieth`, `history-industrial`.

- [ ] **`history-genocide-atrocity`** — Genocide & Atrocity Studies
  - Scope: Lemkin & UN definition, comparative cases (Armenia, Holocaust, Cambodia, Rwanda, Bosnia), perpetrator/bystander psych, prevention & R2P.
  - Prereqs: `history-twentieth`.

## Philosophy (1)

- [ ] **`philosophy-postmodernism`** — Postmodernism
  - Scope: Lyotard's incredulity toward metanarratives, Baudrillard simulacra, Jameson cultural logic, Rorty ironism, critiques (Sokal, realist replies). Distinct from existing `philosophy-poststructuralism` — focus on cultural/epistemic side.
  - Prereqs: `philosophy-poststructuralism`, `philosophy-epistemology`.

## Esoterica (3)

- [ ] **`misc-cult-dynamics`** — Cult & High-Control Group Dynamics
  - Scope: BITE model, Lifton's 8 criteria, recruitment funnels, milieu control, exit & deprogramming, comparative cases (Peoples Temple, Aum, NXIVM, modern online cults).
  - Prereqs: `misc-memetics`, `misc-conspiracy`.

- [ ] **`misc-occult-history`** — Western Esotericism
  - Scope: Hermeticism, alchemy as proto-chemistry, Kabbalah reception, Rosicrucianism, Theosophy, Golden Dawn, Crowley, occult revival aesthetics.
  - Prereqs: `misc-numerology`, `history-of-religion`.

- [ ] **`misc-hyperstition`** — Hyperstition & Memetic Engineering
  - Scope: CCRU origins, self-fulfilling fictions, egregores, viral religions, NRx/accelerationism diffusion, modern hyperstition (cryptocurrency mythologies, AI doom/utopia).
  - Prereqs: `misc-memetics`, `misc-simulation`.

## Materials (2)

- [ ] **`mat-biomaterials`** — Biomaterials
  - Scope: biocompatibility, hydrogels, tissue scaffolds, implant materials (Ti, PEEK), drug delivery vehicles, regulatory landscape.
  - Prereqs: `mat-functional`, `bio-cell`.

- [ ] **`mat-nanomaterials`** — Nanomaterials
  - Scope: 2D materials (graphene, TMDCs), nanowires & quantum confinement, nanocomposites, plasmonics, synthesis (CVD, colloidal), characterization (AFM, TEM).
  - Prereqs: `mat-structure`, `chem-surface`.

## Geology (2)

- [ ] **`geo-geochem`** — Geochemistry & Isotopes
  - Scope: trace element partitioning, radiogenic systems (U-Pb, Rb-Sr, Sm-Nd), stable isotopes (δ¹⁸O, δ¹³C), geochronology, source fingerprinting.
  - Prereqs: `geology-mineralogy`, `chem-analytical`.

- [ ] **`geo-astrobiology`** — Astrobiology
  - Scope: habitability zones, biosignatures (chem & spectral), extremophiles, origin-of-life chemistry (RNA world, hydrothermal vents), Mars/Europa/Enceladus targets.
  - Prereqs: `geology-paleontology`, `bio-microbiology`.

## Biology (3)

- [ ] **`bio-mol-genetics`** — Molecular Genetics & Epigenetics
  - Scope: chromatin & nucleosomes, DNA methylation, histone marks, ncRNA classes, CRISPR mechanism deep dive, gene regulatory networks, imprinting, transgenerational effects.
  - Prereqs: `bio-genetics`, `bio-cell`.

- [ ] **`bio-cancer`** — Cancer Biology
  - Scope: hallmarks of cancer (Hanahan & Weinberg), oncogenes & TS genes, clonal evolution, tumor microenvironment, metastasis, immune evasion, therapy classes (chemo, targeted, IO, CAR-T).
  - Prereqs: `bio-cell`, `bio-immunology`.

- [ ] **`bio-synthetic`** — Synthetic Biology
  - Scope: genetic circuits (toggles, oscillators), BioBricks/MoClo, metabolic engineering, directed evolution, xenobiology, genome writing, biosafety/containment.
  - Prereqs: `bio-mol-genetics` (or `bio-genetics`), `bio-microbiology`.

## Chemistry (3)

- [ ] **`chem-organometallic`** — Organometallics & Catalysis
  - Scope: M–C bonding, 18-electron rule, oxidative addition / reductive elimination, σ-bond metathesis, key catalytic cycles (hydrogenation, hydroformylation, Pd cross-coupling, olefin metathesis).
  - Prereqs: `chem-organic`, `chem-inorganic`.

- [ ] **`chem-quantum-chem`** — Quantum Chemistry
  - Scope: HF derivation, basis sets, electron correlation, DFT (functionals zoo), post-HF (MP2, CCSD(T)), TDDFT for excited states, multireference methods, software practice (ORCA, Gaussian, Psi4).
  - Prereqs: `chem-physical`, `chem-computational`, `physics-quantum`.

- [ ] **`chem-spectroscopy`** — Advanced Spectroscopy
  - Scope: 1D/2D NMR (COSY, HSQC, NOESY), solid-state NMR, IR/Raman selection rules, mass spec fragmentation patterns, EPR, X-ray (XPS, XAS), structure elucidation workflows.
  - Prereqs: `chem-analytical`, `chem-atoms`.

## Physics (4)

- [ ] **`physics-plasma`** — Plasma Physics
  - Scope: Debye shielding & quasineutrality, single-particle motion, MHD, kinetic theory (Vlasov), waves & instabilities, magnetic confinement (tokamak), inertial confinement, astrophysical plasmas.
  - Prereqs: `physics-electromagnetism`, `physics-fluids`.

- [ ] **`physics-qft`** — Quantum Field Theory
  - Scope: canonical quantization & path integrals, scalar/spinor/gauge fields, Feynman rules, QED at one loop, renormalization, SSB & Higgs, Standard Model overview, anomalies (taste).
  - Prereqs: `physics-quantum`, `physics-relativity`, `physics-particle`.

- [ ] **`physics-gr-advanced`** — General Relativity (Advanced)
  - Scope: tensor calculus refresher, Einstein equations derivation, Schwarzschild & Kerr, geodesics & tests, FRW cosmology, gravitational waves, black hole thermodynamics, ADM/initial-value formulation.
  - Prereqs: `physics-relativity`, `differential-geometry`.

- [ ] **`physics-nonlinear`** — Nonlinear Dynamics & Chaos
  - Scope: fixed points & stability, bifurcations (saddle-node, Hopf, period-doubling), Lyapunov exponents, strange attractors (Lorenz, Rössler), KAM, route to turbulence, applications.
  - Prereqs: `physics-mechanics`, `differential-equations`, `fractals`.

---

## Authoring checklist (per topic)

Apply each item before flipping `[ ]` → `[x]`:

1. Add entry to `wwwroot/data/topics.json` (id, name, description, icon, color, lessonCount, difficulty, domain).
2. Add prereq edges to `wwwroot/data/topic-graph.json`.
3. Create `wwwroot/data/<topic-id>/` directory with `lessons.json` (8–12 lessons, mix of concept + worked examples + challenges).
4. Add at least 3 entries to `formula-codex.json` if domain warrants formulas.
5. Add 2+ proof / synthesis-quiz entries where applicable.
6. Verify icon exists in `Components/Icon.razor` (add SVG if new).
7. Build, sideload to POCO X5 Pro, test topic gating logic on device.

## Tier integration TODO

- [ ] Add `tier: int` and `prerequisites: string[]` fields to `topics.json` schema.
- [ ] Update `Models/UserProfile.cs` and topic-unlock logic to enforce tier gating.
- [ ] Update `Pages/TopicPage.razor` and topic list pages to display tier + locked state.
- [ ] Reserve Tier 4 (Expert) and Tier 5 (Frontier) tiers for future content.

## Counts

| Domain | Topics queued |
|--------|---------------|
| CS | 6 |
| History | 4 |
| Philosophy | 1 |
| Esoterica | 3 |
| Materials | 2 |
| Geology | 2 |
| Biology | 3 |
| Chemistry | 3 |
| Physics | 4 |
| **Total** | **28** |
