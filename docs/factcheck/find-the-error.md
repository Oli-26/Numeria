# FindTheError audit

Scope: every `type: "FindTheError"` item in `wwwroot/data/<topic>/questions.json` and
`mastery-questions.json`. No `challenges.json` file contains FindTheError items.

`correctAnswer` is a **1-based** step number stored as a string (QuizComponent.razor compares it
against `stepIndex + 1`). Every item was validated against that convention.

Rule enforced: the keyed step is the *first* false step, and the explanation says why. The quiz UI
tells the learner "find the first mistake, later steps will be wrong too", so a later step that is
false only because it inherits the keyed error is acceptable. What is not acceptable, and what was
fixed: a false step *earlier* than the key, an independent second false step, a keyed step that is
actually true, or an explanation that names the wrong step or hedges about which step is wrong.

## Counts

| | |
|---|---|
| checked | 483 |
| OK, no change | 430 |
| fixed a second or earlier false step (key unchanged) | 27 |
| fixed the key (and its explanation) | 15 |
| rewritten in place (same id, same lesson) | 5 |
| explanation-only correction | 6 |
| items in excluded topics, deferred | 31 |

All edited files re-parse as JSON. Every FindTheError item across all 514 items (including the
excluded topics) has an integer-valued `correctAnswer` string within `1..len(steps)`. No em dashes
were introduced; pre-existing ones in untouched explanation text were left alone.

## Changes

### Fixed a second or earlier false step

- bio-cancer / canc-q48: step 2 claimed all distant organs get comparable blood flow, which is
  false and sat before the keyed reasoning error; now states that liver, lung and bone marrow are
  all richly perfused.
- bio-synthetic / synb-q48: step 3 had a 10^6-variant library screened one variant at a time, which
  is itself the error a reader would flag; now screens about 10^4 in a plate assay.
- chem-quantum-chem / qchem-q16: step 3 already drew the false conclusion ("correlation is
  negligible") that step 4 is keyed for; step 3 now just states that correlation is a small
  fraction of the total energy.
- chem-quantum-chem / qchem-q48: steps 3 and 4 duplicated the keyed reporting error; they now
  record a functional choice and a single calculation, leaving step 5 the only false claim.
- chem-spectroscopy / spec-q80: step 5 overclaimed the folded conformation before the keyed
  "no controls needed" step; softened to "consistent with".
- complex-analysis / mastery-ca-4: step 4 wrote "f(2)" for the power series, the very abuse the
  explanation calls meaningless; it now evaluates the continuation g(2).
- cs-clean-code / mastery-clean-6: step 4 was itself the design error (adding a method per
  provider); steps 4 and 5 now split into a fact and the LSP-violating decision that is keyed.
- cs-clean-code / clean-q16: step 1 asserted "functions with one parameter are best", a false
  absolute ahead of the key; now states that Clean Code advises keeping parameter counts small.
- cs-databases / db-q37: step 3 ("CP systems are inferior") was false before the keyed step; now a
  true observation about AP popularity.
- cs-deep-learning / dl-q56: steps 3 and 4 both pre-empted the keyed inference-cost error; step 3
  now claims only training-compute optimality and step 4 states the token ratio as a fact.
- cs-geometric-dl / gdl-q08: step 5 claimed state-of-the-art accuracy, contradicting the
  explanation; now the model plateaus short of published accuracy.
- cs-geometric-dl / gdl-q48: step 5 claimed state-of-the-art accuracy while the keyed step says the
  loss is wrong; now reports sloppy local geometry.
- cs-lang-csharp / csharp-q08: step 2 asserted structs are allocated on the stack (false for struct
  fields of a class); reworded to avoiding heap allocation for locals.
- cs-lang-rust / rs-q37: steps 4 and 5 described runtime data races that safe Rust cannot produce;
  they now show the compiler rejecting the share with the Send/Sync error.
- cs-theoretical-ml / tml-q24: step 6 asserted the NTK prediction matched reality, an independent
  falsehood the old explanation half-admitted; step 6 now reports the mismatch, explanation tidied.
- differential-geometry / mastery-dg-11: step 5's classification of 3D solitons omitted the Bryant
  soliton and was therefore false ahead of the key; the list now names it.
- geo-geochem / gchm-q64: step 3 ("OIB are simply less depleted MORB") was false before the keyed
  two-component claim; now a true statement about overlap in the Sr-Nd array.
- geo-geochem / gchm-q80: step 5 said modern Earth lacks oxygen photochemistry, which is false;
  now states that sulfur MIF was active at 3 Ga and is absent today, so only the keyed inversion is
  wrong.
- mat-nanomaterials / nano-q32: step 5 claimed high purity for all three colours, which the keyed
  step 6 denies; softened to "can in principle cover all three colours".
- mat-nanomaterials / nano-q64: step 5 claimed a 1 nm X-ray tool could easily be built, false ahead
  of the keyed "lack of investment" claim; now says the resolution formula alone would permit it.
- math-operator-algebras / opa-q24: step 4 asserted all pure states come from the same vector, false
  before the keyed step; now states the true vector-state form.
- misc-hyperstition / hypr-q72: steps 2 and 3 leapt to a shared mechanism ahead of the keyed
  "therefore magic is real"; both now state the shared techniques and a possible common mechanism.
- physics-lattice-qft / lqft-q08: step 1 claimed continuum QFT is mathematically rigorous, which is
  false and precedes the key; now says it is defined perturbatively.
- physics-lattice-qft / lqft-q48: step 1 stated the proton mass *is* the rest energy of three
  quarks, i.e. the keyed error one step early; now just says a proton contains three valence quarks.
- physics-plasma / plas-q16: step 4 ("no drifts exist along field lines") was garbled and false;
  now states that particles stream freely along field lines.
- physics-topological-phases / topp-q40: step 4 already declared the qubit decoherence-free; now
  claims only that the finite-length splitting contributes negligible dephasing.
- physics-topological-phases / topp-q48: step 2 said the Haldane edge states carry charge and resist
  any local perturbation, both false; now scoped to symmetry-respecting perturbations.

### Fixed the key

- calculus / mastery-calc-5: key 1 -> 3. Step 1 is only the problem statement; the error is applying
  the FTC across the singularity at x = 0 in step 3. Explanation rewritten.
- chem-quantum-chem / qchem-q40: key 5 -> 3. Steps 3 and 4 already assert systematic improvability,
  so the first false step is 3 ("modern DFT is converging on the one true functional").
- chem-single-molecule-spec / smol-q24: key 6 -> 4. The unjustified claim is concluding three states
  from a likelihood increase (step 4); step 6 only fails to check K = 2.
- chem-spectroscopy / spec-q48: key 6 -> 5. "Definitively caffeine" is the false step; explanation
  also corrected, since the old one cited C7H8N4O2 compounds as isomers of caffeine.
- chem-spectroscopy / spec-q64: key 3 -> 4. Step 3 is a true observation about a survey scan; the
  error is concluding from it that the surface contains no oxygen.
- cs-geometric-dl / gdl-q16: key 4 -> 5. Step 4 is just adding a linear head; the false claim is
  that its output is equivariant (Schur's lemma forces it to vanish).
- cs-lang-csharp / csharp-q16: key 1 -> 5. Step 1 is ordinary LINQ; the error is the expectation in
  step 5 that a re-enumerated lazy query returns the same result.
- differential-equations / mastery-de-6: key 6 -> 5. Since sin(pi - x) = sin(x), both pieces of the
  Green's function are multiples of sin(x), so the matching in step 5 cannot be done at all;
  explanation rewritten around the vanishing Wronskian and the Fredholm alternative.
- geo-geochem / gchm-q48: key 6 -> 5, with steps 5 and 6 reordered so the false premise (ice volume
  is irrelevant) precedes the conclusion it supports.
- geo-geochem / gchm-q56: key 6 -> 5, same reordering: "erosion can be ignored" is now the premise
  and "exactly 50 ka" the conclusion.
- graph-theory / mastery-gt-11: key 5 -> 6. Marcus-Spielman-Srivastava proved bipartite Ramanujan
  graphs exist for every degree, so step 5 is true; the false claim is that explicit optimal
  expanders are known for all degrees. Explanation rewritten.
- misc-occult-history / occ-q40: key 5 -> 3. "Burned for defending science against superstition" is
  the first false step; explanation now covers steps 3 to 5.
- physics-gr-advanced / gr-q16: key 3 -> 2. The explanation's own point (contraction throws away the
  Weyl tensor) refutes step 2, which precedes the keyed step.
- physics-nonlinear / nlin-q24: key 5 -> 4. The false belief is "r > r_infinity implies chaotic"
  (step 4); step 5 only follows from it.
- physics-qft / qft-q48: key 4 -> 5. Explanation was hedged between the two; it now pins step 5,
  since a gauge-dependent cross section means the calculation is wrong, not the physics.

### Rewritten in place

- chem-spectroscopy / spec-q72: the old keyed step was true in principle, which the explanation
  admitted. Rewritten around the same lesson (a VCD assignment needs a quantitative similarity
  index over a conformer ensemble, not a partial sign match), key 6 -> 5.
- cs-lang-cpp / mastery-cpp-6: the old steps described an exception inside `process` leaking a
  pointer the shared_ptr already owned, which cannot happen. Rewritten as the genuine pre-C++17
  interleaved-argument leak, key stays 3, explanation rewritten.
- cs-theoretical-ml / tml-q08: the old arithmetic did not hold together (d and the bound were both
  wrong, and the explanation contradicted itself about whether the bound was about 0.3 or vacuous).
  Rewritten so steps 1 to 5 are a correct vacuous-bound calculation and step 6 is the false
  conclusion that VC theory is approximately right; key 4 -> 6.
- fourier-analysis / four-q24: the old keyed step was a true equation (a sign typo that changed
  nothing), so the item had no genuine error. Rewritten with a consequential error, a wrong value
  for the integral of cos(x) over [-pi, pi], giving a wrong nonzero answer; key 5 -> 4.
- geo-astrobiology / astb-q56: "Therefore Mars has life" preceded the keyed false premise about
  abiotic methane. Steps reordered so the false premise comes first; key 4 -> 3.

### Explanation-only corrections

- bio-cancer / canc-q72: explanation hedged that step 4 was "the most clearly incorrect" while
  keying step 3; it now pins step 3 and treats 4 and 5 as inherited.
- cs-algorithms / algo-q31: removed the "or at least misleading" hedge about the keyed step.
- cs-quantum-computing / qc-q24: explanation contained literal `<em>` tags, which Razor escapes and
  shows to the learner; markup removed.
- history-genocide-atrocity / gnoc-q72: garbled closing clause ("steps 4 and 5 together (with step
  5 standing)") rewritten.
- geo-astrobiology / astb-q40, astb-q80: explanations contained literal `&mdash;` entities, shown
  raw by the renderer; replaced with commas (no em dashes).

## Excluded topics, deferred to a later pass

`history-medicine` and `history-medieval` contain no FindTheError items. The remaining four
excluded topics hold 31 items, none of them inspected or edited here:

- computation: mastery-comp-9 (mastery-questions.json); comp-q15, comp-q24, comp-q32, comp-q40,
  comp-q48, comp-q64 (questions.json)
- cs-compilers: cc-q08, cc-q16, cc-q24, cc-q32, cc-q40, cc-q48, cc-q56, cc-q64, cc-q72
  (questions.json)
- cs-networking-advanced: neta-q08, neta-q16, neta-q24, neta-q32, neta-q40, neta-q48, neta-q56,
  neta-q64, neta-q72 (questions.json)
- cs-networks: mastery-net-6 (mastery-questions.json); net-q08, net-q16, net-q24, net-q31, net-q37
  (questions.json)
