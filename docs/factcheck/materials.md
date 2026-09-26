# Fact-check: Materials

Topics covered: mat-structure, mat-mechanical, mat-phases, mat-transitions, mat-functional, mat-biomaterials, mat-nanomaterials, mat-topological-materials (8 topics)
Concepts checked: 153
Questions checked: 333
Fixed: 45
Flagged: 20

## Fixed

- mat-structure / mat-str-01-c2: "iron's ferromagnetism vanishes when it transforms from BCC to FCC at 912 °C" -> BCC α-Fe ferromagnetic up to its Curie point (770 °C); FCC γ-Fe (above 912 °C) is not (ferromagnetism is lost at 770 °C, well before the 912 °C transformation)
- mat-structure / mat-str-04-c3: "Cu-Al-rich zones in 7075 aluminium" -> "Mg-Zn-rich precipitates in 7075" (7075 is Al-Zn-Mg-Cu; Cu-Al zones are 2xxx/duralumin)
- mat-structure / mat-str-q09: "(111) plane that contains all three cube body diagonals" -> "plane perpendicular to a cube body diagonal" ((111) contains no body diagonal)
- mat-mechanical / mat-mec-01-c3: rubber/diamond gap "because their bond stiffness differs by exactly that much" -> notes rubber stiffness is largely entropic (misconception)
- mat-mechanical / mat-mec-04-c1: 10 GPa ideal vs "a few tens of MPa: a thousand times weaker" -> "hundreds of times" (internal arithmetic)
- mat-mechanical / mat-mec-05-c3: blades above 1100 °C "close to two-thirds of melting point" -> "roughly 85–90 % of absolute melting point"
- mat-mechanical / mat-mec-q22: "Aluminium and titanium alloys do not show an endurance limit" -> "Aluminium and copper" (Ti alloys, like steels, generally do)
- mat-mechanical / mat-mec-q13: explanation "Mohs cannot distinguish an aluminium alloy and a hardened steel" -> "two steels given different heat treatments" (Al ~3 vs hardened steel ~7-8 is resolvable)
- mat-phases / mat-pha-02-c1: "The two solidus lines meet at the eutectic point" -> "liquidus lines"
- mat-transitions / mat-tra-01-c1: "One element, six radically different solids" -> "five" (five listed)
- mat-transitions / mat-tra-02-c2: "anything sharper than first order falls under continuous transitions" -> "anything without a latent heat"
- mat-transitions / mat-tra-05-c2: natural rubber T_g −70 °C "is why rubber goes hard in the freezer" -> freezer (−18 °C) is above T_g; replaced with liquid-nitrogen example
- mat-transitions / mat-tra-q23: "Why does natural rubber become hard and brittle in a freezer? (below T_g)" -> "...shatter after a dip in liquid nitrogen" (same reason: freezer is above T_g)
- mat-transitions / mat-tra-05-c1: "Zr-Cu-Ni-Ti-Be quenched at 10⁶ K/s" -> bulk glass-formers need only ~1 K/s (contradicted mat-tra-q24)
- mat-biomaterials / biom-01-c2: "no one has yet built a long-lived implantable CGM" -> notes Eversense fully implanted sensor (months, up to a year from 2024) (outdated)
- mat-biomaterials / biom-08-c2: "Genentech's Lupron Depot ... and Risperdal Consta deliver once-monthly" -> no Genentech; Risperdal Consta is every two weeks
- mat-biomaterials / biom-05-c3: "Jenny Jiang's group" -> "Shaoyi Jiang's group" (carboxybetaine zwitterion work)
- mat-biomaterials / biom-06-c1 and biom-q48: ABSORB III "11% TLF at 3 years vs 7.9%" -> "at 2 years" (11.0 vs 7.9 is the 2-year result)
- mat-biomaterials / biom-06-c3: Humacyte HAV "with Phase 3 trauma data" -> FDA-approved Dec 2024 as Symvess (outdated)
- mat-biomaterials / biom-07-c3: "porcine SIS and dermis (Alloderm)" -> "human cadaveric dermis (Alloderm)"
- mat-biomaterials / biom-07-c3: "Ott's 2008 rat heart, Taylor's lungs and kidneys" -> "Ott and Taylor's 2008 rat heart, later lungs and kidneys" (Taylor co-led the heart work; lungs/kidneys were Ott/Niklason)
- mat-biomaterials / biom-q69: explanation "Doris Taylor's group did related work on lungs and kidneys" -> corrected attribution as above
- mat-biomaterials / biom-09-c2: "Vacanti's tissue-engineered trachea (Macchiarini)" -> "Macchiarini's tissue-engineered tracheas" (misattribution)
- mat-biomaterials / biom-09-c3: "Lewis carbohydrate-glass" -> "Miller and Chen's carbohydrate glass, Lewis's fugitive inks"
- mat-biomaterials / biom-q16: FindTheError answer 5 -> 4 (step 4 "pure-Mg screw will dissolve cleanly" is the false inference the explanation refutes; step 5 follows)
- mat-nanomaterials / nano-01-c2: "Halve the dot's size and the bandgap energy quadruples" -> "confinement energy quadruples"
- mat-nanomaterials / nano-02-c2: "IBM's 2019 RV16X-NANO" -> "MIT's" (Shulaker lab)
- mat-nanomaterials / nano-10-c1 and nano-q73: nano-TiO₂ "probable Group 2B" -> "possible (Group 2B)" (2B = possibly carcinogenic)
- mat-nanomaterials / nano-07-c3: "787/A350 primary structures use small fractions of CNT or graphene" -> recast as a research target (not in production primary structure)
- mat-nanomaterials / nano-08-c2: ALD "every cycle deposits exactly one atomic layer" -> fixed self-limited increment, often a fraction of a monolayer (misconception)
- mat-nanomaterials / nano-q58: prompt and explanation "deposits exactly one atomic layer per cycle" -> "fixed, sub-monolayer increment"
- mat-nanomaterials / nano-q12: two correct options ((9,0) and (11,5) both metallic) -> option (11,5) replaced by (11,4); explanation rewritten
- mat-nanomaterials / nano-q24: planted step "MoS₂/WSe₂ lattice constants differ by less than 1%" -> "about 4%" (second false step)
- mat-nanomaterials / nano-q56: step 5 "Mechanical strength does increase" contradicted the explanation (second error) -> "Conductivity does increase further"
- mat-topological-materials / topm-03-c1 (math): "ν = 1 ⇔ sgn(M) ≠ sgn(B)" -> "M/B > 0" (with d₃ = M − Bk², topology needs same signs; HgTe has B < 0, M < 0)
- mat-topological-materials / topm-q19: answer True -> False, explanation rewritten (same sign error)
- mat-topological-materials / topm-q24: explanation "ν = 1 ⇔ sgn(M) ≠ sgn(B), M/B < 0" -> "M/B > 0"
- mat-topological-materials / topm-03-c2 and topm-q20: plateau "width-independent over an order of magnitude (250 nm to 1 μm)" -> "same for 0.5 μm and 1 μm devices"; q20 prompt "two-terminal" -> "four-terminal longitudinal"
- mat-topological-materials / topm-05-c2: "Schindler et al., Nature 2018" -> "Nature Physics 2018"
- mat-topological-materials / topm-05-c3 and topm-q39: "~37,000 ICSD entries" -> "roughly 27,000 stoichiometric materials"
- mat-topological-materials / topm-05-c3: "2022 update extended this to all 1651 magnetic space groups via MAGNDATA" -> magnetic extension was Xu et al. Nature 2020; 2022 update (Science) was nonmagnetic
- mat-topological-materials / topm-06-c2: "K(T²) = ℤ ⊕ ℤ², K(T³) = ℤ³ ⊕ ℤ⁴" -> "K⁰(T²) = ℤ², K⁰(T³) = ℤ⁴"; math expression restricted to even k
- mat-topological-materials / topm-07-c1: MnBi₂Te₄ "(Bi₂Te₃ blocks alternating with septuple layers)" -> stacked septuple layers (that describes MnBi₄Te₇); "highest QAH temperature observed" -> removed (doped films reached ~2 K)
- mat-topological-materials / topm-07-c3: "Wang, Hasan, and collaborators (Science 2018, 2020)" -> "Wang, Gao, Ding" (Hasan not on those papers)
- mat-topological-materials / topm-q56: "Bulk preserves combined PT-symmetry" -> S = Θτ₁/₂ (the symmetry protecting the AFM TI); dropped "thinning destroys the AFM"

## Flagged (not edited)

- mat-mechanical / mat-mec-03-c1, mat-mec-q13: "most engineering metals fall in Mohs 4–6" is shaky (Al ~2.5–3, hardened steel ~7–8); answer option relies on it
- mat-functional / mat-fun-05-c2, mat-fun-q24: microcapsule self-healing "now used" in vehicle paints and aerospace coatings, "already protect cars, aircraft" looks overstated
- mat-functional / mat-fun-05-c3, mat-fun-q23: nacre "1000× tougher than aragonite": work-of-fracture figures are usually ~3000×, K_IC only ~10×; depends on metric
- mat-biomaterials / biom-03-c1: BIOLOX delta "~75% alumina + 25% zirconia" (commonly cited ~82/17 vol%); Prozyr "~400 heads" figure unverified
- mat-biomaterials / biom-04-c3: Seri Surgical Scaffold "acquired and discontinued" history unverified
- mat-biomaterials / biom-05-c3: ">3-month subcutaneous performance" was for zwitterionic hydrogels resisting capsule, unclear it was a working sensor
- mat-biomaterials / biom-q56: step 5 ("vascularization will follow naturally") is arguably a second error
- mat-nanomaterials / nano-02-c2: CNTs as reinforcement "(Tesla S)" unverified
- mat-nanomaterials / nano-02-c3: Sc₃N@C₈₀ as MRI contrast basis (Gd₃N@C₈₀ derivatives are the usual candidates); GO membranes for "RO desalination" is research-stage
- mat-nanomaterials / nano-05-c3: Pt nanocubes "{100} most active for oxygen reduction" is electrolyte-dependent
- mat-nanomaterials / nano-06-c2: "MetroSpec" portable SERS readers (possible invented product); AuroLase "late-stage clinical trials" (pilot/pivotal stage)
- mat-nanomaterials / nano-06-c3: magnetite single-domain size "~20 nm" (usually ~50–80 nm; ~20–25 nm is the superparamagnetic limit); T_B ≈ 200 K for 10 nm Fe₃O₄ seems high
- mat-nanomaterials / nano-10-c3: "CNT composites cut 15-30% car body mass" unsupported
- mat-nanomaterials / nano-q32: step 5 ("one synthesis gives all three colours at high purity") is arguably also false
- mat-nanomaterials / nano-q64: steps 4-5 ("X-ray sources are well established", "easily build") are as wrong as the keyed step 6
- mat-topological-materials / topm-02-c1, topm-q11, topm-q16: weak-TI surface states "vulnerable to dislocations" is backwards (dislocations bind helical modes; fragility is to translation-breaking/dimerisation); q16 keyed answer still defensible
- mat-topological-materials / topm-02-c2: Bi₂Se₃ surface "dominates transport at room temperature in clean samples" overstated
- mat-topological-materials / topm-07-c1: MnPtBi, NdSb as intrinsic magnetic TIs questionable
- mat-topological-materials / topm-07-c2: TME measurement citation (Mogi, Science 2017 / Nat Phys 2022) and "frequency-doubling regime" unverified
- mat-structure / mat-str-02-c1: C-centred cubic "equivalent to a smaller primitive lattice" (it reduces to primitive tetragonal); harmless

## Systemic notes

- The five core topics (structure, mechanical, phases, transitions, functional) were largely accurate; errors were isolated number or wording slips.
- The three advanced topics (biomaterials, nanomaterials, topological) carried most errors: misattributed people/labs (IBM vs MIT, Jenny vs Shaoyi Jiang, Vacanti vs Macchiarini, Hasan, Lewis), product/status claims gone stale (Eversense, Humacyte approval) and journal/year slips. Worth a second pass on any remaining named product or company claim.
- topological-materials had a genuine sign error in the BHZ criterion propagated consistently across lesson math, a True/False item and a FindTheError explanation; consistent-but-wrong content is hard to catch by internal cross-checks.
- FindTheError items in biomaterials/nanomaterials often contain a second false step; several fixed, three flagged.
