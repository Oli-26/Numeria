# Fact-check: MATH field

- Topics covered (19): calculus, linear-algebra, topology, number-theory, probability, group-theory, graph-theory, differential-geometry, set-theory, fractals, fourier-analysis, complex-analysis, computation, philosophy-of-math, combinatorics, differential-equations, dimensional-analysis, math-langlands-intro, math-operator-algebras
- Concepts checked: 477 (159 lessons)
- Questions checked: 1155
- Items fixed: 59
- Items flagged (not edited): 26

## Fixed

- calculus / calc-q01: "0 would mean the limit doesn't exist" -> "0 is what the numerator alone gives at x=2" (distractor rationale was false)
- topology / topo-q03: distractor "Euler characteristic 0" -> "Euler characteristic 2" (the old distractor was also true, so two options were correct); explanation updated
- topology / topo-q05: "removing the crossing point ... splits it into 4 segments, ... circle ... 2 segments" -> "2 separate pieces ... circle stays in one piece" (wrong component counts)
- topology / topo-q40: "Fundamental group π₁" as the step above homology groups -> "Cohomology ring" (π₁ does not determine higher homology, so the ordering was false); explanation updated
- number-theory / nt-07-c2: "μ the identity element" -> "μ the inverse of the constant function 1 (Dirichlet convolution)" (the identity is ε, not μ)
- group-theory / grp-08-c3: "Galois discovered this at age 20, the night before he died" -> "developed these ideas as a teenager; the night before ... he wrote a letter summarizing them" (a common myth)
- group-theory / grp-q27: "gcd(3-1,5-1)=2 ... by the classification theorem" -> "3 does not divide 5-1, so Sylow gives Z15" (the reasoning was wrong)
- group-theory / grp-q28: the prompt now says "applying the left permutation first"; removed the self-contradicting "wait, recalculating" explanation (with the usual right-to-left convention, the distractor (1 3 2) is also correct)
- graph-theory / gt-08-c2: "R(5,5) between 43 and 48" -> "43 and 46" (Angeltveit-McKay 2024)
- graph-theory / gt-q57: F=3 moved into step 3 ("Count the faces: F = 3") so the keyed step 3 is actually the error (it had been stated as given data in step 1)
- differential-geometry / dg-03-c1: "shape operator = (EG-F²)⁻¹ times II coefficients" -> "I⁻¹·II" (the adjugate was missing)
- differential-geometry / dg-03-c2: "soap bubble spanning a wire frame" -> "soap film" (bubbles have H ≠ 0)
- differential-geometry / dg-07-c2: "scalar curvature = the average of sectional curvatures" -> "up to a factor n(n-1)"; "In higher dimensions Ricci carries less info" -> "in 3D Ricci determines Riemann; in 4+ it carries less" (false for n=3)
- differential-geometry / dg-q53: pair "Average of all sectional curvatures" -> "Proportional to the average sectional curvature"
- differential-geometry / dg-q43: distractor "It makes the result coordinate-independent" -> "It makes the result a scalar" (the old distractor was defensibly correct)
- set-theory / st-05-c3: "ω^ω = finite sequences under lexicographic order" -> "ordered by length, then lexicographically" (pure lex order is not a well-order)
- set-theory / st-q08: "parallels how addition distributes over multiplication" -> "unlike arithmetic ... both distributive laws hold" (a false analogy)
- fractals / frac-04-c2: connected-Julia example "c = -0.7 + 0.27i" -> "c = i (dendrite)" (-0.7+0.27i escapes, so it lies outside M and its Julia set is dust)
- fractals / frac-05-c2, frac-q34: Lorenz "discovered chaos in 1963" -> "in 1961 (published 1963)"
- fractals / frac-05-c3, frac-q47: "r ≈ 3.45: 2 values; r ≈ 3.54: 4 values" -> "3 < r < 3.45: 2; 3.45 < r < 3.54: 4" (at r=3.45 the 4-cycle has already begun); pair and explanation updated
- fourier-analysis / four-06-c3, four-q47, four-q46: Auto-Tune "analyzes via FFT" -> "detects pitch using autocorrelation" (Hildebrand's method); q47 option and answer changed consistently
- fourier-analysis / four-q14: step 2 "Σ sin(nx)/n for n=1,2,3" -> "odd n=1,3,5" (it was a second error); explanation trimmed
- complex-analysis / cx-q34: "n negative-power terms" -> "Negative powers down to (z-z0)^(-n), and none lower" (1/z² has only one; this contradicted cx-q39); option and answer changed consistently
- computation / comp-05-c1: "2^n for n = 100 > atoms in universe" -> "n = 300" (2^100 ≈ 1.3e30 is far below 1e80)
- computation / comp-05-c3: "Karp showed 21 other ... including ... TSP" -> "Karp (1972) listed 21 (incl. SAT) ... Hamiltonian Cycle, Subset Sum; TSP follows"
- computation / comp-06-c1: "most important master's thesis-turned-paper" (the 1948 paper) -> the 1937 switching-circuits master's thesis
- computation / comp-08-c3: "For 80 years" -> "For decades"; "1985 Feynman and Deutsch proposed" -> "early 1980s Feynman; 1985 Deutsch"
- computation / comp-q40: step 3 "would prove P != NP" -> "P = NP" (it was a second error besides the keyed step 1)
- philosophy-of-math / phil-02-c1: "no reliance on diagrams" -> "at least in principle (Euclid leaned on diagrams; Hilbert 1899)"; "Declaration opens with 'self-evident truths'" -> "appeals to"
- philosophy-of-math / phil-03-c3, phil-q19: "Wigner quipped ... Platonists on weekdays" -> Davis and Hersh (misattribution)
- philosophy-of-math / phil-05-c1, phil-q39: "on the very day Hilbert spoke (8 Sept 1930) Gödel announced" -> "the day before" (Gödel spoke on 7 Sept)
- philosophy-of-math / phil-q61: removed "Kronecker called Cantor's work a 'disease'" (misattributed quote)
- philosophy-of-math / phil-q64: "Zermelo formalizes set theory (ZFC)" -> "Zermelo (1908; later extended to ZFC)"
- combinatorics / comb-03-c2: "Dirichlet proved ... n²+1 monotone subsequence" -> Erdős-Szekeres theorem (1935)
- combinatorics / comb-07-c2: "Sudoku is three overlapping Latin squares" -> "one Latin square of order 9 plus a box constraint"
- combinatorics / comb-07-c3: "conjectured by Steiner and proved by Kirkman in 1847" -> "Kirkman 1847; Steiner raised it independently in 1853" (wrong chronology)
- combinatorics / comb-08-c2: "(16 + 0 + 4 + 0)/4 = 6" -> "(16 + 2 + 4 + 2)/4 = 6" (the arithmetic was wrong)
- combinatorics / comb-08-c3, comb-q60: R(5,5) upper bound 48 -> 46 (text and formula)
- combinatorics / comb-q20: option "sum to 2n" -> "sum to 2n+1" (the old option was false, which made "All of the above" wrong); explanation rewritten
- differential-equations / de-01-c2: superposition "if y1, y2 are solutions" -> "solve a linear homogeneous equation" (false for nonhomogeneous)
- dimensional-analysis / dim-05-c2: "m_e e⁴/(ħ² ε₀²) ≈ 27.2 eV" -> "m_e e⁴/((4πε₀)² ħ²)" (it was off by (4π)² ≈ 158)
- math-langlands-intro / lang-05-c3: totally-real potential modularity attributed to "Allen et al. 2018 (ten authors)" -> "Taylor and others" (the ten-author paper is about CM fields); formula label updated
- math-langlands-intro / lang-06-c3: Arthur 2013 "refining earlier work of Mok" -> "later extended by Mok to unitary groups" (reversed order)
- math-langlands-intro / lang-07-c3, lang-q52: 2024 geometric Langlands proof "for GL_n" -> "for any reductive group G"
- math-langlands-intro / lang-q13: "best unconditional bound is 7/64" -> "λ ≥ 1/4 - (7/64)², about 0.238"
- math-langlands-intro / lang-q35: "mod-ℓ rep is reducible after level lowering" -> "level-lowers to weight 2, level 2, where no forms exist"
- math-langlands-intro / lang-q39: "proved automorphy of elliptic curves over imaginary quadratic fields" -> "potential automorphy over CM fields" (it overstated the result under a True key)
- math-operator-algebras / opa-01-c1: inner-product formula antilinear in the first slot -> linear in the first slot (it contradicted the Riesz and GNS formulas in the same lessons)
- math-operator-algebras / opa-03-c3: "non-type-I (type II/III) algebras have no trace" -> "type III" (type II factors have traces; this contradicted opa-07-c3 and opa-q30)
- math-operator-algebras / opa-04-c1: "commutant is a unital *-subalgebra" -> "unital subalgebra (a *-subalgebra when S is self-adjoint)"
- math-operator-algebras / opa-07-c1: KMS "ω(σ_{iβ}(x)y)=ω(yx), β=-1" and formula "ω(σ_{-i}(x)y)" -> "ω(x σ_{iβ}(y)) = ω(yx), β = -1" (checked against a finite-dimensional ρ; the old form fails); formula label is now β = -1

## Flagged (not edited)

- graph-theory / gt-06-c3: Cheeger λ₂/2 ≤ h ≤ √(2λ₂) is stated for L = D - A. That form holds for the normalized Laplacian/conductance (or d-regular graphs with scaling); the combinatorial version needs a d_max factor
- graph-theory / gt-07-c1: "G(n,p) ... introduced in 1959" credited to Erdős-Rényi. Erdős-Rényi 1959 is G(n,M); G(n,p) is Gilbert 1959. This is a common conflation
- group-theory / grp-04-c3: "Group theory proved ≤20 moves". It was a 2010 computer search using coset decomposition; wording is loose
- number-theory / nt-01-c1: Euclid's infinitude proof "by contradiction". Historians note the original is direct/constructive. Pedantic
- topology / topo-q71: V=6, E=15, F=8 is not a valid triangulation either (3F ≠ 2E); the keyed step 5 is fine
- fourier-analysis / four-q24: the keyed "error" (½[0+0] vs ½[0−0]) is not a real error, since the result is identical; the question is weak
- fourier-analysis / four-08-c1, four-q58: "Ptolemy ... Fourier approximation of elliptical orbits". Geocentric paths are not ellipses; this is a popular simplification
- fractals / frac-08-c2: "Your cell phone likely contains a fractal antenna". Doubtful as a general claim; most phones use other antenna types
- computation / comp-07-c3: "drill a 2mm hole through a CD and it still plays" is folklore. CIRC corrects bursts of roughly 2.5 mm of track, which is not a drilled hole
- dimensional-analysis / dim-05-c1, dim-q21: Mars Climate Orbiter "100 km too close" (sources give about 57 km actual vs about 140-226 km planned) and "$327 million" (that is the whole Mars Surveyor '98 program; the orbiter alone was about $125M). Not verified
- differential-geometry / dg-08-c2: Einstein's "biggest blunder" is presented as fact; it is only reported via Gamow
- differential-geometry / dg-07-c2: the Ricci contraction R^k_{ikj} sign depends on convention; left alone
- philosophy-of-math / phil-q42: "non-Euclidean geometry had no physical motivation whatsoever". Overstated (Gauss and Lobachevsky considered physical space)
- philosophy-of-math / phil-08-c1: "contemporaries called his work a 'disease'". The quote is usually misattributed to Poincaré
- set-theory / st-q64: step 6 ("if F proves ¬G ... contradicting consistency") actually needs ω-consistency (or Rosser's trick)
- group-theory / grp-q57: the keyed step 4 gives the right number (6) with wrong reasoning; the explanation is awkward but correct
- math-langlands-intro / lang-02-c2, lang-q15: the double coset GL2(Q)\GL2(A)/K_f Z(R)° omits SO(2), so it is not literally Γ₀(N)\H
- math-langlands-intro / lang-02-c3: "Gelfand-Piatetski-Shapiro multiplicity one" for GL_n is usually credited to Shalika / Piatetski-Shapiro
- math-langlands-intro / lang-03-c3: "Langlands-Rapoport descents" listed as a functoriality specialization; doubtful
- math-langlands-intro / lang-04-c2: "Even Maass forms are conjectured to give Galois reps" (only λ = 1/4 algebraic ones); "Deligne-Serre ... Artin conjecture follows" has the direction backwards (Artin needs Galois -> modular)
- math-langlands-intro / lang-04-c3: "Calegari-Geraghty machinery for ten-dimensional reps" is unclear or garbled
- math-langlands-intro / lang-05-c2: gap "took fourteen months to repair" (about 12-13 months from discovery; 15 from the announcement)
- math-operator-algebras / opa-05-c3: "finite-index hyperfinite subfactors are classified by standard invariants" needs amenability/finite depth (Popa); "first cases of L(G)≅L(H) ⇒ G≅H ... property (T)" is loosely attributed (Ioana-Popa-Vaes 2013, not property T groups)
- math-operator-algebras / opa-07-c2: "non-commutative Lance-Lp spaces" looks garbled
- math-operator-algebras / opa-07-c3, opa-q53: "Connes-Sugita cocycle" (usually just the Connes cocycle) and "Buchholz, Driessler, Wollenberg" attribution unverified
- math-operator-algebras / opa-06-c3 vs opa-q39: the free group factor problem is dated "open since 1969" in one place and "Murray-von Neumann (1943)" in the other

## Systemic notes

- The core undergraduate topics (calculus, linear algebra, probability, number theory, complex analysis, DEs) are solid; errors there were mostly in question explanations, not answer keys.
- The weakest areas are dates and attributions (Lorenz 1961/1963, the Gödel/Hilbert day, the Davis-Hersh quote, Steiner/Kirkman, Dirichlet vs Erdős-Szekeres, Shannon's thesis) and "latest record" figures (R(5,5) ≤ 46 appeared in two topics).
- Several FindTheError / MultipleChoice items had a second defensible answer (topo-q03, dg-q43, grp-q28, four-q14, comp-q40, comb-q20). Worth a targeted pass over the FindTheError items in other fields.
- math-langlands-intro and math-operator-algebras are research-level and dense with names and dates; several unverifiable attributions remain flagged. Treat them as lower-confidence content.
- The fractals lesson on Julia sets used a popular image parameter (-0.7+0.27i) that is actually outside the Mandelbrot set; popular "Julia set" constants should not be labeled connected without checking.
