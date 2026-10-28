# Citation pilot report

10 lessons, 864 concepts. Proposed 24 citations; **19 accepted** after the reviewer and script checks.

| Check | Count |
|---|---:|
| accepted via quote on page | 15 |
| accepted via Crossref DOI | 4 |
| rejected: quote not found on page | 3 |
| rejected: reviewer | 2 |

## Contradicted by a source (1)

These are likely errors in the lessons.

- `ds-01-c1`: "Python's list, Java's ArrayList, C++'s std::vector and Go's slices are all dynamic arrays (which double in capacity when full)."  
  Source says: Harvard CS107 lecture 19 notes that CPython lists use a dynamic array but 'The growth factor is less than 2!' (pattern 0, 4, 8, 16, 24, 32, 40, 52, 64, 76), so not all double. Minor nuance for the lesson. (https://harvard-iacs.github.io/2020-CS107/lectures/lecture19/notebook)

## Accepted citations (19)

- `spec-01-c3` "NOE intensities scale as r−6, which turns 2D NOESY spectra into a distance ruler used to determine solution structures of proteins"  
  Northwestern University IMSERC. Protein NMR guide (eNMR), NOE section. Northwestern University Integrated Molecular Structure Education and Research Center. (quote on page)
- `chem-surf-01-c2` "The lotus effect (θ > 150°) is superhydrophobic."  
  Qinghua Luo, Jiao Peng, Xiaoyu Chen, Hui Zhang, Xia Deng, Shiwei Jin, Hai Zhu (2022). Recent Advances in Multifunctional Mechanical–Chemical Superhydrophobic Materials. Frontiers in Bioengineering and Biotechnology. (Crossref DOI)
- `comb-01-c1` "and the two tasks are mutually exclusive (no overlap), then you can do one or the other in m + n ways."  
  University of Washington, Paul G. Allen School of Computer Science & Engineering (CSE 312) (2021). Lecture 1: Intro and Counting Rules (annotated slides, CSE 312 Summer 2021). University of Washington CSE 312. (quote on page)
- `comb-01-c1` "if you have to do Task A in m ways AND then Task B in n ways, the total number of combined outcomes is m × n."  
  University of Washington, Paul G. Allen School of Computer Science & Engineering (CSE 312) (2021). Lecture 1: Intro and Counting Rules (annotated slides, CSE 312 Summer 2021). University of Washington CSE 312. (quote on page)
- `comb-01-c3` "In set notation, if S is the universal set and A is the set of "bad" outcomes, then the count of "good" outcomes is |S| − |A|."  
  Alex Tsun (Stanford CS109 course notes, from Probability & Statistics with Applications to Computing) (2018). Chapter 1. Combinatorial Theory, 1.1: So You Think You Can Count?. Stanford University CS109 course materials. (quote on page)
- `cx-01-c1` "That flat map of numbers is called the Argand plane, or the complex plane."  
  Eric W. Weisstein. Argand Diagram. MathWorld, Wolfram Research. (quote on page)
- `cx-01-c3` "In polar form, z_1 · z_2 means multiplying the moduli and adding the arguments, so multiplication rotates and scales."  
  Jay Abramson (2021). Precalculus 2e, 8.5 Polar Form of Complex Numbers. OpenStax, Rice University. (quote on page)
- `ai-01-c3` "data leakage, information from the test set sneaking into training, which makes the model look better than it is"  
  Sayash Kapoor, Arvind Narayanan (2023). Leakage and the reproducibility crisis in machine-learning-based science. Patterns (arXiv preprint version opened). (Crossref DOI)
- `ai-01-c3` "with time-series data, shuffled splits that let the future leak into the past"  
  Sayash Kapoor, Arvind Narayanan (2023). Leakage and the reproducibility crisis in machine-learning-based science. Patterns (arXiv preprint version opened). (Crossref DOI)
- `algo-01-c1` "Formally, f(n) = O(g(n)) means there exist constants c and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀."  
  Ruth Anderson (University of Washington, CSE332) (2025). CSE332: Data Structures & Parallelism, Lecture 2: Algorithm Analysis. University of Washington, Paul G. Allen School of Computer Science & Engineering. (quote on page)
- `algo-01-c2` "O(n log n) is the best a comparison sort can do."  
  Stanford University CS 161 course staff (2018). Lecture 6: Sorting lower bounds and O(n)-time sorting. Stanford University, CS 161 Design and Analysis of Algorithms. (quote on page)
- `algo-01-c3` "A single dynamic array append is usually O(1) but occasionally triggers an O(n) resize."  
  Carnegie Mellon University 15-451/651 course staff (2022). Lecture #3: Amortized Analysis. Carnegie Mellon University, 15-451/651 Design & Analysis of Algorithms. (quote on page)
- `clean-01-c1` "Phil Karlton's quip, "there are only two hard things in computer science: cache invalidation and naming things""  
  Martin Fowler (2009). TwoHardThings. martinfowler.com. (quote on page)
- `clean-01-c3` "Modern languages ship with auto-formatters: gofmt for Go"  
  The Go Authors (2013). go fmt your code. The Go Blog (go.dev). (quote on page)
- `cc-01-c1` "The same rule made >> a long-standing problem in C++ template parsing."  
  Daveed Vandevoorde (2005). Right Angle Brackets (N1757/05-0017). ISO/IEC JTC1/SC22/WG21 C++ Standards Committee papers. (quote on page)
- `cc-01-c3` "Python's lexer tracks indentation levels on a stack and synthesizes virtual INDENT and DEDENT tokens."  
  Python Software Foundation (2026). Lexical analysis: Indentation. The Python Language Reference, docs.python.org. (quote on page)
- `crypt-01-c1` "The best known attack on AES-128 (biclique, 2011) reduces complexity to 2^126.1, barely better than brute force."  
  Andrey Bogdanov, Dmitry Khovratovich, Christian Rechberger (2011). Biclique Cryptanalysis of the Full AES. ASIACRYPT 2011 (Cryptology ePrint Archive 2011/449). (quote on page)
- `crypt-01-c3` "A 2016 study (Böck et al.) found TLS servers on the internet that actually repeated GCM nonces, plus tens of thousands more that used random nonces and were at risk of collision."  
  Hanno Böck, Aaron Zauner, Sean Devlin, Juraj Somorovsky, Philipp Jovanovic (2016). Nonce-Disrespecting Adversaries: Practical Forgery Attacks on GCM in TLS. 10th USENIX Workshop on Offensive Technologies (WOOT 16). (quote on page)
- `crypt-01-c3` "In TLS 1.3, AES-128-GCM is mandatory to implement and ChaCha20-Poly1305 is recommended."  
  E. Rescorla (IETF) (2018). RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3. RFC Editor / IETF. (Crossref DOI)

## No source found (31)

- `clean-01-c2`: "Good comments explain why, not what." (Opinion/best-practice claim; no allowed-source page opened that states it. Lesson makes no specific numbers or attributions to source.)
- `clean-01-c3`: "If your codebase uses get_user in 95% of places and fetchUser in 5%, fix the 5%." (Illustrative hypothetical, not a factual claim needing a source.)
- `cc-01-c2`: "The classical pipeline is regex → NFA (Thompson's construction) → DFA (subset construction) → minimized DFA (Hopcroft's algorithm)." (Could not open an allowed source (ACM DOI page for Thompson 1968 returned 403; Britannica returned 403).)
- `cc-01-c2`: "Kleene's theorem says every regular expression has an equivalent nondeterministic finite automaton (NFA), and every NFA has an equivalent deterministic finite automaton (DFA)." (No reputable page opened that states it.)
- `cc-01-c1`: "Production compilers such as rustc, clang and V8 usually hand-write their lexers, for speed and good error messages" (No opened reputable source found.)
- `cx-01-c3`: "Multiply a number by i and it rotates 90 degrees counterclockwise." (No opened source stated it directly; only inferable from the product rule. Britannica returned 403.)
- `ds-01-c1`: "The CPU's cache loads memory in 64-byte lines, so walking through an array in order prefetches efficiently." (No reputable page opened that states this; searches focused on other claims.)
- `ds-01-c1`: "dynamic arrays, which double in capacity when full, giving amortized O(1) append at the cost of occasional copy operations." (JMU CS240 page left the bound blank; Toronto PDF unreadable; Harvard page gives only O(n) total for n appends, not an explicit amortized O(1) sentence.)
- `ds-01-c3`: "Cache effects make even O(n) array operations beat O(1) linked-list operations until n is large." (The Stroustrup page does not state the size crossover; no source opened for it.)
- `crypt-01-c2`: "POODLE (2014) and Lucky Thirteen (2013) exploited this in TLS." (Ran out of budget for a full check. The Lucky Thirteen page (isg.rhul.ac.uk) supports the 2013 date for a CBC attack on TLS. It is a timing attack on MAC-then-encrypt padding, and I found no source for POODLE in this session. Treat the pair as unsourced.)
- `crypt-01-c3`: "Joux's 2006 "forbidden attack" formalized this." (No source opened in this session.)
- `crypt-01-c1`: "AES-128, AES-192 and AES-256 differ only in key length and round count (10, 12 and 14)." (Likely supported by NIST FIPS 197, but I did not open it.)
- `algo-01-c3`: "Quicksort's worst case is O(n²), yet it's faster than mergesort in practice because its average case is good and its constants are tiny." (Princeton algs4 (Sedgewick and Wayne) confirms the ~N²/2 worst case and that quicksort is fast in typical applications, but I found no opened source that makes the specific mergesort comparison; the CMU lecture citation also supports only the amortized-cost part, not the 'O(1) amortized' wording exactly (it states constant amortized cost of 3 compares).)
- `algo-01-c2`: "O(n²) is 10¹², which takes minutes to hours. O(2ⁿ) is more than the number of atoms in the universe" (No source opened that states the atoms-in-the-universe comparison or the runtime estimate; these are illustrative arithmetic claims.)
- `chem-surf-01-c1`: "Liquid water has γ ≈ 0.072 J/m², high enough that drops pull into spheres" (Only the Engineering ToolBox page (non-authoritative, no named author) was opened, showing 0.0728 N/m at 20 °C. The IAPWS release was opened but its values were not readable. No allowed source was verified.)
- `chem-surf-01-c1`: "Mercury's γ ≈ 0.5 J/m² is higher still, and it beads on glass." (Only the Engineering ToolBox page (0.485 N/m at 25 °C) was opened, which is not an allowed source. Britannica returned 403. The 'beads on glass' part was not sourced.)
- `chem-surf-01-c1`: "A 2-nm gold particle has about 50% of its atoms at the surface" (No source was found or opened for this specific figure.)
- `chem-surf-01-c3`: "Gold is inert in bulk, but it's a catalyst as 5-nm nanoparticles." (Search snippets (Haruta, Catalysis Today 1997, DOI 10.1016/s0920-5861(96)00208-8) suggest support, but the paper and other candidate pages returned 404 or 403 and could not be opened.)
- `chem-surf-01-c3`: "Silver melts at 962 °C as bulk but at ~700 K as 4-nm clusters." (No source opened. Search results showed a molecular dynamics study with melting of about 1000 K for ~4.8 nm Ag particles, so the ~700 K figure looks doubtful.)
- `chem-surf-01-c2`: "Young's equation balances the three interfacial tensions at the contact line, γ_sv = γ_sl + γ_lv cos θ." (No page stating Young's equation was opened this session.)
- `ai-01-c1`: "Machine learning is the discipline of building algorithms that improve from data without explicit programming." (The Samuel 1959 paper (DOI 10.1147/rd.33.0210) is a scanned PDF I could not read, and the usual 'without being explicitly programmed' wording is reportedly a later paraphrase. Britannica returned 403.)
- `ai-01-c2`: "Overfitting happens when the model learns noise in the training data and then fails to generalize." (The Goodfellow et al. Deep Learning book page and the Stanford ESL PDF could not be read or were not found. The only readable source was not a permitted type.)
- `ai-01-c3`: "Divide the training data into k folds, train on k-1, validate on the held-out fold, and rotate." (I only opened the scikit-learn documentation, which is software documentation and not an allowed source type. I could not open ESL or another textbook.)
- `comb-01-c2`: "In general, choosing k items from n with repetition gives nk sequences." (Sources opened (Grinnell CSC 208 reading, Stanford CS109 notes) only show specific cases such as 21 x 21 x 21 x 21, not the general n^k statement in words.)
- `comb-01-c2`: "That product is a falling factorial, written n(n-1)(n-2)...(n-k+1)." (Grinnell CSC 208 reading gives n x (n-1) x ... x (n-k+1) for sequences without replacement but does not use the term falling factorial; the only page that did (nLab) is a wiki, not an allowed source.)
- `comb-01-c3`: "strings with NO vowels = 213 = 9,261; so strings with at least one vowel = 17,576 − 9,261 = 8,315." (Pure arithmetic (26^3=17,576; 21^3=9,261; difference 8,315, all correct); no source needed or found for this specific example.)
- `spec-01-c1`: "At 600 MHz and 298 K, the upper-state excess is only ~5×10−5." (No opened reputable page states this figure. Nanalysis (company blog) gives only a 400 MHz ratio of 1.000064; my own calculation gives about 4.8e-5, consistent, but no citable source.)
- `spec-01-c1`: "13C at 1.1 % natural abundance is so much harder than 1H" (Only found on a drugfuture.com mirror of USP <1761>, not an official host, so not cited.)
- `spec-01-c2`: "referenced (for 1H and 13C) to TMS at 0 ppm" (Only found on a drugfuture.com mirror of USP, not an official host; Britannica returned 403.)
- `spec-01-c2`: "3JHH obeys the Karplus relation, J(θ) = A cos2θ + B cosθ + C" (Karplus 1959 abstract opened (J. Chem. Phys. 30, 11) but does not state the dihedral cos2 relation; ACS 1963 paper returned 403; remaining pages were Wikipedia or mirrors.)
- `spec-01-c3`: "13C of a quaternary carbon can have T1 > 30 s" (Northwestern IMSERC says only that d1 may need to be longer for quaternary carbons; no opened source gives 30 s. The ~5·T1 recycle delay was found only on the USP mirror.)

## Rejected (5)

- `spec-01-c1` "13C at the same field precesses near 150 MHz, because γ(13C) is roughly a quarte": quote not found on page (https://nmr.rider.edu/nmr/NMR_tutor/pages/record/record_b4.html)
- `spec-01-c1` "The resulting precession frequency is called the Larmor frequency, ν0 = γB0/2π.": quote not found on page (https://nmr.rider.edu/nmr/NMR_tutor/pages/record/record_b4.html)
- `cx-01-c2` "Set θ = π and you get Euler's identity, eiπ + 1 = 0, which ties together the fiv": quote not found on page (https://mathworld.wolfram.com/EulerFormula.html)
- `clean-01-c3` "Once you commit to one, formatting debates evaporate": reviewer: The Go blog's 'never have a debate about spacing or brace position' line is about gofmt only. The lesson claim is a general statement about committing to any formatter, so the source is narrower than the claim. (https://go.dev/blog/gofmt)
- `ds-01-c3` "Bjarne Stroustrup's talk showed arrays beating linked lists up to large sizes, s": reviewer: Page exists and the quote is present, but it does not support the claim. The post is a short FAQ blurb that says nothing about cache lines or 64 bytes, and it does not say arrays beat linked lists up to large sizes. It only recommends vector by default and says maps are slower than vectors. It is also a blog-staff summary, not the talk itself. Claim is too specific for the source. (https://isocpp.org/blog/2014/06/stroustrup-lists)
