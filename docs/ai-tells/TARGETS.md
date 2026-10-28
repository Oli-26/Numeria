# AI-tells audit: target points

Audit of all 5,615 concepts in 274 topics against [WRITING_STYLE.md](../WRITING_STYLE.md). 103 Haiku agents each read one batch and recorded every case with an exact quote; a script then checked each quote against the real lesson text and dropped any it could not find. Structural signs (threes, colons, bold) are counted by script, not by the agents.

- Findings kept: **3,237** (140 high, 1,696 medium, 1,401 low)
- Dropped as unverifiable: 19 (quote not found in the lesson text)
- Dropped as extraction artifacts: 387 (text my extraction mangled: line breaks, lists and tables the agents could not see)
- Full list: `findings.jsonl` (one case per line). Scores per lesson: `lesson-scores.csv`.

| Sign | Cases | Concepts affected |
|---|---:|---:|
| hype | 1,002 | 898 |
| recap | 812 | 783 |
| importance | 457 | 438 |
| reframe | 431 | 409 |
| proofread | 235 | 222 |
| metaphor | 211 | 204 |
| rhetorical | 89 | 89 |

## Corpus-wide targets

- **Threes:** 68% of concepts are exactly 3 paragraphs; 48% contain an "X, Y, and Z" list.
- **Colons:** 1.68 per 100 words; 1,695 concepts are above 2.5.
- **Bold:** 1,886 concepts have four or more bold phrases.

## 1. Fix first: proofreading errors (235)

Wrong figures, comma splices and broken text. These read as "nobody checked it" more than any style tell.

| Concept | Quote | Note |
|---|---|---|
| `ads-06-c3` | It does not directly resolve the information paradox, we still don't know how information escapes | Comma splice; join with a semicolon or split into two sentences. |
| `bio-ana-05-c1` | Vesalius De Humani Corporis Fabrica muscular figure showing body musculature | Figure shows muscular system; concept is the skeletal system. Replace figure. |
| `bio-cell-01-c1` | This control is essential, without it, cell contents would simply diffuse into the surroundings | Comma splice; use a semicolon or two sentences. |
| `bio-cell-01-c1` | DNA double helix structure with labeled bases | Figure alt is DNA, but concept is the cell membrane; replace figure. |
| `bio-evo-08-c3` | Denisovans, modern non-Africans carry 1-4% Neanderthal DNA | Comma splice; needs a full stop or a conjunction. |
| `bio-gen-01-c3` | Human karyotype showing all 46 chromosomes arranged in pairs | Karyotype figure does not illustrate DNA replication; replace. |
| `bio-imm-05-c1` | can unleash off-target | Garbled sentence; missing noun, e.g. 'autoimmune attacks'. |
| `bio-imm-05-c1` | COVID-19 vaccine vial and syringe ready for administration | Figure alt text is about vaccines, not checkpoint inhibitors; replace the image. |
| `bio-mic-01-c2` | Electron micrograph of Streptococcus pyogenes bacteria in characteristic chain formation | Figure shows Streptococcus, but concept is about archaea |
| `bio-neuro-01-c1` | dendrites (branching input receivers (receive signals from other neurons), the cell body (soma) contains the nucleus and metabolic machinery) | Unbalanced nested parentheses garble the region list; rewrite the sentence. |
| `bio-neuro-03-c1` | Santiago Ramón y Cajal's drawings of cortical neurons showing axons and dendrites | Neuron drawing figure does not match the brain-regions concept; replace figure. |
| `biom-04-c2` | PLGA copolymers tune anywhere between (50:50 PLGA degrades in ~1-2 months) | Garbled sentence: 'between' has no endpoints; name the two ends. |
| `cc-02-c1` | or multiplication?, requires the parser to know whether a is a typedef | Garbled punctuation: question mark then comma; should be one sentence. |
| `chem-org-08-c1` | It also enables analog studies, once you can build the molecule, you can build variants | Comma splice; use a colon after 'studies'. |
| `chem-surf-04-c3` | separated by amorphous regions, its tunable properties come from | Comma splice; use a semicolon or 'and'. |
| `dim-02-c1` | If a car covers 120 km in 2 h: | Colon introduces a worked calculation that is absent from the text. |
| `dim-02-c3` | are defined by Taylor series: | Colon introduces the Taylor series formula, which is missing. |
| `econ-crypto-01-c4` | Bitcoin price history chart over years | Figure alt shows price history; concept is about mining economics |
| `econ-demo-04-c2` | Either Congress acts in advance (politically painful (phase-in period helps), or it acts at the cliff (very painful) no phase-in for affected retirees) | Broken nested parentheses; sentence garbled, missing closure and clause break |
| `econ-demo-05-c3` | World map of total fertility rate by country | Figure is about fertility, not female labor participation; move to fertility concept |
| `econ-demo-06-c3` | To developing countries, three times official development assistance | Sentence fragment with no verb; needs a full clause |
| `econ-econ-04-c2` | The textbook competitive model assumes monopsony-free labor markets, when employers have wage-setting power, modest minimum wage increases can raise employment, not lower it | Comma splice; should read 'but when employers have wage-setting power'. |
| `econ-env-04-c5` | may be $X; the expected damage from a 5% probability of civilizational collapse is also $X | Placeholder $X left in text; insert the actual figures or a worked example. |
| `econ-fin-06-c2` | F = S·e^(r-y)T | Broken formula: exponent should be (r−y)T, i.e. e^((r−y)T). |
| `econ-hot-01-c4` | The basic question, when should markets work alone?: has been with economics ever since | Broken punctuation: '?:' and garbled sentence; rewrite as one clause |
| `econ-lab-04-c4` | can prevent hysteresis from setting in, what looks like 'overheating' may simply be preventing | Comma splice joining two clauses; needs a colon or full stop. |
| `econ-lab-05-c1` | some employers have a 'taste' for discrimination, they pay extra | Comma splice; use a colon or split into two sentences. |
| `econ-macro-01-c2` | The three measures rarely match exactly in practice, measurement error creates | Comma splice; use a semicolon or colon before measurement error. |
| `econ-macro-05-c3` | essential for stability, if the central bank doesn't raise real rates when inflation rises | Comma splice; needs a colon or semicolon before if. |
| `econ-macro-05-c5` | Anchoring expectations is the goal, when households and firms believe | Comma splice; use a colon or split the sentence. |
| `econ-micro-02-c2` | perfectly inelastic (vertical curve, ε = 0 (buyers will pay anything) and perfectly elastic | Unbalanced parentheses and missing separator; rewrite as two clear cases. |
| `geo-hydro-03-c2` | ASTER satellite image of the Kilauea 2018 East Rift Zone eruption | Figure shows a volcano; concept is aquifers and depletion |
| `geo-met-05-c3` | Recycling will not be enough alone, primary mining has to expand | Comma splice; use a semicolon or split the sentence |
| `geo-min-03-c2` | This is why: | Dangling signpost with no content after it |
| `geo-strat-05-c2` | of the oceans, each foram shell is a thermometer for its era | Comma splice; use a semicolon or split the sentence |
| `geo-tec-04-c1` | Mount St. Helens eruption plume, May 18 1980 | Figure shows a volcano; concept is Earth's internal layers |
| `hfor-05-c2` | Hunnic troops,. Resettled near Geneva | Stray comma and period before sentence; should be 'Hunnic troops. Resettled'. |
| `hist-20c-05-c1` | Buzz Aldrin on the lunar surface, Apollo 11, July 1969 | Apollo figure mismatches Vietnam/Mao/Asia concept; replace figure |
| `hist-20c-09-c2` | Both sides drew lessons: | Colon introduces no lessons; the next paragraph is unrelated |
| `hist-ind-02-c2` | The Iron Bridge at Coalbrookdale, Shropshire, 1781 | Cast-iron 1781 bridge does not illustrate steel/Bessemer concept; replace figure. |
| `hist-ind-05-c1` | The Crystal Palace, Hyde Park, Great Exhibition 1851 | Exhibition building does not illustrate nationalism concept; replace figure. |
| `hist-isl-03-c3` | Interior of the Alhambra palace, Granada, Spain | Figure is Alhambra; concept is Mughals. Replace image. |
| `hist-isl-04-c3` | The Dome of the Rock, Jerusalem | Figure is Jerusalem; concept is Iran, Iraq, Gulf. Replace image. |
| `hist-med-05-c1` | The Magna Carta, 1215, British Library | Figure alt is Magna Carta but concept is 14th-century crises; wrong image or alt. |
| `hist-med-06-c1` | Scene from the Bayeux Tapestry, Battle of Hastings 1066 | Figure alt shows Norman Conquest but concept is Byzantine continuity; wrong figure. |
| `hist-pre-03-c3` | a massive Indigenous coalition led by Spanish capitalizing on Aztec rivalries | Garbled grammar: 'led by Spanish capitalizing'; should read Spaniards. |
| `hist-pre-05-c3` | Map of the Inca Empire (Tawantinsuyu) at its greatest extent, c. 1525 | Figure alt text is an Inca map; concept covers the Columbian Exchange. |
| `hist-rel-03-c3` | Aerial view of Angkor Wat, Cambodia | Figure alt is Angkor Wat but concept is Islam; wrong figure for this concept. |
| `info-04-c3` | so so SNR has logarithmic returns while bandwidth has linear returns | Duplicated word 'so so'; delete one |
| `la-09-c1` | Not every matrix is diagonalizable, when eigenvalues repeat, there may not be enough independent eigenvectors | Comma splice; needs a colon, semicolon or two sentences |
| `lang-05-c1` | it would violate Serre's conjecture on modular Galois representations, which Ribet (1990) proved sufficient | Garbled: comma splice, dangling 'it', Ribet clause misattached to Serre's conjecture. |
| `lit-myth-03-c5` | atmosphere. the wizard Gandalf | Lowercase sentence after period, fragment list; needs a verb or new sentence |
| `lit-shake-03-c4` | for either reading, Henry is a calculating politician | Comma splice; use a colon or period. |
| `mat-str-05-c3` | at the relevant length scale, often a single inclusion or pore can determine the strength of an entire forging | Comma splice; use a semicolon or split into two sentences |
| `med-bias-01-c3` | the BBC's reviews of impartiality after Brexit and Covid coverage: is to insist that truth is a higher journalistic value than balance | Garbled sentence: two colons split subject from verb; rebuild |
| `med-sc-05-c3` | transparent corrections, works imperfectly | Garbled sentence: list ends in a comma before a verb; lost clause or stray comma. |
| `med-th-02-c2` | that the homogeneity has political consequences: survive even when one rejects the specific aesthetic judgements | Garbled clause: colon then verb with no subject; should read 'that ... consequences survive'. |
| `misc-cwp-04-c1` | In 1995 the CIA, transferred Stargate's evaluation to the American Institutes for Research (AIR) | Stray comma splits subject and verb; remove comma after CIA. |
| `nano-03-c2` | devices, sandwiching channels between hBN sheets boosts mobility by orders of magnitude | Comma splice; needs a period or semicolon before sandwiching |
| `nano-03-c2` | surface terminations ( (OH,) O, (F), making them exceptional electrodes | Garbled termination list and stray parentheses; also closing paren after non-metal |
| `omet-04-c2` | The Pd-Cu redox couple is what makes the cycle catalytic in both metals, without it, you would need stoichiometric oxidant | Comma splice; should be a semicolon or 'Without it, you would need...'. |
| `omet-09-c3` | for bulky ligands, without them, a SPhos-Pd complex looks too high in energy | Comma splice; use a semicolon or start a new sentence. |
| `phil-ph-01-c2` | and the noema (the object as it is meant in that act) the perceived-as-such | Unclosed parenthesis and missing punctuation; garbled noesis/noema sentence |
| `phys-astro-02-c3` | Hubble Ultra Deep Field (nearly 10,000 galaxies in a tiny patch of sky | Figure alt text has an unclosed parenthesis. |
| `phys-mech-03-c1` | On Earth's surface, simplifies to weight | Missing subject; likely 'it simplifies to weight'. |
| `plas-10-c1` | The heliosphere shields Earth from most galactic cosmic rays, without it, surface life would face | Comma splice; split into two sentences after 'rays.' |
| `pol-emp-01-c3` | The empire's institutional sophistication, the arthashastra attributed to Kautilya is one of the most detailed surviving treatises | Garbled appositive; needs dashes or parentheses around the Kautilya clause. |
| `pol-ins-01-c2` | messier than the doctrine suggests, great powers have always had more sovereignty | Comma splice; use a semicolon or split into two sentences. |
| `pol-ins-01-c2` | the International Criminal Court, each represents partial qualifications | Garbled list of subjects with no clear verb; rewrite as one full sentence. |
| `pol-ir-02-c3` | deep economic interdependence, but the pattern itself is stable | Broken sentence: 'but' clause stuck onto the list; rewrite the sentence. |
| `pol-ir-02-c3` | peace in the short run, democratising states may, in fact, be more conflict-prone | Comma splice; use a semicolon or split the sentence. |
| `pol-ir-03-c1` | even what counts as a state: are socially constructed | Double colon garbles the sentence; use a comma or dash-free list punctuation. |
| `pol-ir-03-c3` | Critical theory in this sense: descended from the Frankfurt School | Colon makes the subject unparseable; rewrite as a complete sentence. |
| `pol-sec-03-c2` | has been one of the major historical events of the early 21st century | Garbled: cost list is subject, but 'cost' is not an event |
| `psych-clin-04-c3` | chlorpromazine (strong D2 blockade, more motor side effects) and second-generation | Unclosed parenthesis and missing separator in the antipsychotic list. |
| `py-04-c1` | Why exists? | Garbled question; should read Why does it exist? |
| `qc-08-c3` | then arbitrarily long quantum computations are possible at polynomial overhead, by recursively concatenating codes or by increasing surface-code distance, we drive the logical error rate down exponentially with overhead | Garbled comma splice; main clause is lost. Split and restructure. |
| `rlch-02-c3` | who would not renounce their faith, were burned below the castle | Comma splice: stray comma separates subject from verb; delete it. |
| `soc-race-02-c1` | the Virginia slave codes of 1705 are a key example, that hardened a distinction | Garbled sentence: stray comma splits subject from verb; needs restructuring. |
| `spec-02-c2` | gyromagnetic ratio ratio | Duplicated word; should read gyromagnetic ratio |
| `bio-bot-02-c1` | (in thylakoid membranes (split water, generate ATP and NADPH) and Calvin cycle (in stroma) | Unbalanced nested parentheses garble the sentence; rewrite as two clauses |
| `bio-bot-03-c2` | Cross-section of leaf epidermis showing stomata and epidermal cells under light microscopy | Alt says cross-section but caption shows epidermal surface; fix alt text |
| `bio-dev-02-c2` | Drosophila embryo showing pair-rule gene expression pattern in alternating stripes | Pair-rule segmentation figure does not illustrate Hox identity genes. |
| `bio-dev-04-c3` | AER (apical ectodermal ridge (drives elongation via FGFs), ZPA (zone of polarizing activity) | Unbalanced parentheses; AER gloss swallows the ZPA clause. |
| `bio-gen-02-c3` | Agarose gel electrophoresis showing DNA bands separated by size | Gel electrophoresis does not illustrate mutation effects; replace. |
| `bio-gen-07-c2` | Genetic drift is strongest in small populations: explains why | Fragment after colon has no subject; write 'This explains why'. |
| `bio-mar-04-c2` | Whale shark Rhincodon typus swimming with its large open mouth | Whale shark is a fish; concept covers marine mammals |
| `bio-mic-03-c1` | Bacterial colonies on an agar plate, each visible spot is millions of bacteria | Comma splice in caption; use a colon or split into two sentences |
| `bio-neuro-04-c2` | Memory consolidation takes hours to years, sleep is critical | Comma splice; split into two sentences. |
| `bio-vir-01-c2` | (+)ssRNA (poliovirus, SARS-CoV-2 (directly translatable), (-)ssRNA (flu, rabies) needs transcription first) | Unbalanced parentheses; (-)ssRNA entry garbled into the list. |
| `canc-08-c1` | delivers ablative single doses (e.g., 18 Gy × 3) | 'Single doses' contradicts '× 3' fractionation; fix wording. |
| `canc-10-c3` | approved 2018 across all solid tumors regardless of origin, pediatric infantile fibrosarcoma | Garbled list; GIST NTRK claim also doubtful, verify source. |
| `chem-anly-06-c1` | oligosaccharides, laser blasts a co-crystallized matrix to release ions | Sentence garbled; list item and clause merged. |
| `chem-atom-01-c1` | Most of an atom is empty space, if a hydrogen atom's nucleus were a marble | Comma splice; use a colon or split the sentence. |
| `chem-atom-08-c2` | Positive ΔE° means spontaneous; coupled with ΔG° = -nFE° | Dangling fragment; state that ΔG° = -nFE° links the two. |
| `chem-org-06-c3` | Kurt Alder, 1928 Nobel 1950 | Ambiguous; say discovery year and Nobel year separately. |
| `chem-org-07-c1` | birth defects: drove home the point | Sentence fragment after colon; restore a subject and verb. |
| `chem-phys-08-c3` | Bringing all three concepts together (surface tension, colloids, capillarity) physical chemistry of interfaces shapes everyday phenomena | Fragment spliced into subject; needs a comma and verb after 'together'. |
| `comb-04-c3` | The result is the elegant product formula shown below | Refers to a formula that is absent; 'elegant' is hype too. |
| `comp-01-c2` | The DFA may have exponentially more states, an NFA with n states might need up to 2^n DFA states | Comma splice; split into two sentences or bracket the NFA clause. |
| `comp-08-c3` | and in 1985 David Deutsch described a universal quantum computer, and it turned out to be genuinely different | Run-on with unclear 'it'; split into two sentences. |
| `crypt-05-c2` | Argon2id (hybrid (first half independent, second half dependent) recommended default) | Unbalanced nested parentheses; likely a punctuation edit gone wrong. |
| `cult-03-c2` | The diagnostic is not the rules themselves, monasteries have rules, but who imposes them | Garbled comma splice; needs 'since' or a semicolon restructure |
| `cx-04-c3` | its values on a surrounding contour: | Colon introduces a formula that is missing from the text. |
| `cx-06-c1` | equals 2\pi i times the sum of all the residues inside: | Colon introduces a missing formula; raw LaTeX escape in prose. |
| `dg-05-c1` | of Riemannian geometry, it encodes all intrinsic geometric information | Comma splice; join with a colon or semicolon. |
| `dg-06-c3` | infinitesimal parallelograms close, if you parallel transport two vectors | Garbled clause: comma misused where a colon is needed before the example. |
| `econ-crypto-05-c5` | stablecoin reserves earn interest rate; the spread funds operations | Garbled phrase; likely should be 'earn the interest rate' |
| `econ-demo-06-c3` | remittances are countercyclical to recipient countries, they often rise when the home economy is hit | Comma splice; use a semicolon or split the sentence |
| `econ-econ-06-c1` | you can separate between variation (differences across units at a given time) from within variation | Garbled terms; rewrite as between-variation and within-variation. |
| `econ-fin-02-c5` | This is no accident, if a high-return asset existed without high risk | Garbled comma splice from punctuation edit; reword as a complete sentence. |
| `econ-fin-07-c5` | the lesson isn't 'avoid stocks', long-run real returns have been ~6-7% for over a century | Comma splice; needs a colon or a full sentence break. |
| `econ-intl-04-c1` | World map of international trade flows | Figure alt shows trade map; concept covers balance-of-payments accounting |
| `econ-macro-01-c1` | Five words do a lot of work | Says five words but lists four terms; fix count or wording. |
| `econ-micro-02-c3` | Gasoline is inelastic this week, you still need to drive to work | Comma splice; use a semicolon, dash-free, or split into two sentences. |
| `econ-micro-05-c2` | plus a chunk of mutually beneficial trades simply doesn't happen, the deadweight loss | Comma-joined appositive reads as a splice; separate the deadweight loss clause. |
| `envh-10-c2` | a 2025 update added ocean acidification as a seventh | Contradicts the nine-commons list, which already includes ocean acidification; fix count or wording. |
| `geo-strat-02-c3` | Pleistocene glacial lake varve laminations in coastal Scotland | Varves are annual laminae, not graded or event beds |
| `hist-ea-05-c2` | automation and immigration of women into the workforce help but only partly | Wrong term: 'immigration of women'; likely meant women's workforce entry. |
| `hist-em-07-c1` | The system was integrated, disrupting any segment threatened the others | Garbled clause; reads as a missing comma or dropped words. |
| `hist-ind-06-c2` | Defeated Qing China (1895) and Russia (1905) in wars | Sentence fragment with no subject; should name Japan as subject. |
| `hist-pre-02-c3` | Maya hieroglyphic inscriptions at Palenque | Figure shows writing; concept is about collapse. Swap for a collapse-related image. |
| `info-04-c3` | about 10⁻²⁰ watts, a billion-billionth of a flashlight | 10^-20 is a hundredth of a billion-billionth, not equal |
| `info-07-c3` | benefits from joint design, losing a key reference frame is much worse than losing a B-frame | Comma splice joining two clauses; use a semicolon or period |
| `info-08-c2` | statements of the form "K(x) > N", randomness has a built-in unprovability | Comma splice; use a colon or split the sentence |
| `lang-03-c1` | L-functions are not auxiliary tools, they are images of automorphic representations | Comma splice joining two independent clauses; use a semicolon or full stop. |
| `ling-sem-02-c1` | Entailments are part of a word's meaning, testing them is a key tool in semantic analysis | Comma splice; use a semicolon or split, and drop 'key'. |
| `ling-soc-03-c1` | Voy al store porque necesito some milk.' (Spanish-English switching: 'I'm going to the store because I need some milk.'), Spanglish, common in US Latino communities | Sentence fragment with no main verb; make it a full sentence. |
| `lit-rus-04-c5` | Notes from his immediate descendants run through Hamsun's Hunger | Garbled: 'Notes' is the title, not a person; reword. |
| `lqft-02-c3` | theory?, is answered Yes | Garbled sentence with stray comma after question mark. |
| `lsan-03-c1` | Line up a few everyday words in Sanskrit, Greek, Latin and Old English and the family shows itself: | Colon introduces a word table that is absent; restore table or cut colon. |
| `mat-fun-04-c3` | These are not yet practical materials, the pressures are unattainable in any everyday device | Comma splice; use a semicolon or split into two sentences |
| `med-bc-01-c3` | in faux-news-bulletin format: became part of broadcasting mythology | Second colon splits subject from verb; garbled sentence, restructure. |
| `med-bias-03-c2` | Audiences are not coerced into thinking about what the press covers, they have the option to ignore the news entirely | Comma splice; use a semicolon or full stop |
| `med-dig-04-c3` | is partly correct, bypassing platforms produces less platform risk, but partly misleading | Comma splice joins two clauses; use a colon or semicolon after 'correct'. |
| `med-jour-06-c3` | Britain's Sunday Times "Insight" team: have funded long-form | Second colon splits the list from its verb; garbled sentence |
| `med-pf-01-c1` | Milton's case was not for unlimited speech, he excluded Catholics from his tolerance | Comma splice; use a semicolon or split the sentence. |
| `med-th-05-c1` | Postman is not naïve about the 19th century, he acknowledges the limits of newspaper-era discourse | Comma splice; needs a semicolon or 'and'. |
| `med-th-06-c3` | The geopolitical dimension, Castells was always attentive to the East Asian developmental states | Garbled sentence: subject split by comma; the main verb 'anticipates' lacks a clear subject. |
| `med-th-06-c3` | Subsequent decade has produced more complicated assessments | Missing article: should read 'The subsequent decade'. |
| `mgen-05-c1` | single multi-domain effector, these are the engineering workhorses | Comma splice; use a colon or split the sentence |
| `nlin-07-c1` | The phenomenon is universal, fireflies in Southeast Asia flash in unison | Comma splice in list of examples; use a colon or separate sentences. |
| `opa-01-c1` | Hilbert spaces are self-dual | Comma splice after the Riesz clause; use a full stop |
| `opa-04-c3` | this is the algebra's noncommutative Lebesgue measure | Comma splice after the trace identity; use a semicolon or full stop |
| `opa-07-c2` | The result reframes the field, finite-matrix approximations are not enough to capture all II_1 factors | Comma splice; needs a full stop or semicolon |
| `para-05-c1` | This model is powerful and fast, it maps directly to multi-core hardware | Comma splice; use a semicolon or split the sentence. |
| `phil-01-c3` | The idea that mathematicians discover rather than invent truths: that pi was 3.14159... long before any human computed it: is essentially Platonic | Two colons break the sentence; subject and verb separated |
| `phil-04-c2` | to algorithms, if you prove something exists constructively, you've implicitly given a recipe for computing it | Comma splice; needs colon or full stop after 'algorithms' |
| `phil-06-c3` | unreasonable flexibility of mathematics, with enough mathematical tools available, it would be surprising | Comma splice; needs colon or full stop before 'with enough' |
| `phil-aes-02-c2` | This is not objectivism, there is no mind-independent beauty, but it allows for aesthetic criticism and learning | Comma splice; use a semicolon or split into two sentences |
| `phil-ea-02-c3` | His radical equalising of perspectives, 'this' and 'that' depend on the standpoint of judgement | Garbled sentence; missing verb or clause boundary after 'perspectives' |
| `phil-gi-05-c3` | Hegel was no naive optimist, history is a 'slaughter-bench | Comma splice; use a colon or split the sentence. |
| `phil-mind-04-c2` | Problem: misrepresentation, if I see a horse in the dark and think 'cow', horses cause cow-thoughts; | Garbled sentence: 'Problem:' clause merged with conditional; rewrite |
| `phil-mx-03-c1` | use-value (it satisfies some human want (bread feeds, coats warm) | Unbalanced parentheses in use-value and exchange-value sentence. |
| `phys-astro-01-c1` | it heats up, if the core reaches ~10 million K | Comma splice with misplaced 'if' clause; needs a semicolon or restructure. |
| `phys-astro-01-c2` | converted to ~3.8 × 10²⁶ watts | Fragment; the sentence has no main verb or subject. |
| `phys-astro-02-c3` | The Hubble Ultra Deep Field) a 1-million-second exposure | Caption has a stray closing parenthesis where an opening one belongs. |
| `phys-em-01-c3` | like contour lines on a map relative to the steepest slope direction | Garbled simile; rewrite as a clear analogy. |
| `phys-em-03-c1` | in equation 4, without it the equations were inconsistent | Comma splice; needs a semicolon or restructure. |
| `phys-qm-04-c3` | any eavesdropping is detectable, measuring a quantum state disturbs it | Comma splice; use a semicolon or a full stop. |
| `phys-qm-07-c1` | survives because it's an extremum of S, neighboring paths share its phase | Comma splice; use a semicolon or split into two sentences. |
| `phys-thermo-08-c3` | Landauer's slogan, drilled into computer scientists ever since | Sentence fragment with no main verb. |
| `plas-04-c2` | ITER will host a host of Alfvén-eigenmode instabilities | Duplicated 'host of' from automated edit; rewrite as 'ITER will host'. |
| `pol-cmp-02-c3` | Show elections, packaged courts, and captured media perform the symbolism of democratic accountability | Garbled subject: "Show" reads as a verb; likely meant "Staged elections". |
| `pol-cmp-05-c1` | much-cited verdict: "modern democracy is unthinkable save in terms of parties", captures the consensus: | Ungrammatical quote-plus-colon splice; rewrite as one clean sentence. |
| `pol-geo-07-c1` | the 2024–25 collapse of the Assad regime in Syria, each event has reshaped the regional order | Comma splice ends a semicolon list; needs a full sentence or colon before 'each event' |
| `pol-nat-01-c1` | and others: disagree about specific mechanisms | Garbled sentence: second colon before verb after theorist list; fix punctuation |
| `pol-pe-01-c1` | Capitalism is best defined not by markets alone, markets predate capitalism by millennia, but by | Comma splice from punctuation edit; needs dashes or a separate sentence. |
| `pol-rev-05-c2` | Selma to Montgomery marches (1965): combined legal litigation | Garbled sentence: double colon, no main verb; split into two sentences. |
| `pol-th-02-c1` | Smith was a moral philosopher, not a market fundamentalist, he warned about merchants conspiring against the public | Comma splice; use a semicolon or split the sentence |
| `pol-th-07-c1` | The wave metaphor is contested, many of these debates overlap and recur | Comma splice; use a semicolon or split the sentence |
| `pomo-07-c2` | is not that postmodernism is wrong about everything, it has correctly registered | Comma splice; needs a semicolon or 'but' |
| `psych-beh-01-c2` | extinction does not erase the original learning, it suppresses it | Comma splice; use a semicolon or split into two sentences. |
| `psych-perc-01-c3` | a confident one cries wolf, both can be equally sensitive but differ in criterion | Comma splice; 'both' dangles. Split into two sentences. |
| `psych-soc-01-c1` | up to about three or four, beyond that, additional confederates added little | Comma splice; use a semicolon or period after 'four'. |
| `psych-soc-03-c1` | We are not passive observers of our own attitudes, when actions and beliefs clash, beliefs often shift to follow behaviour | Comma splice; needs a semicolon or period before 'when'. |
| `psych-soc-04-c1` | The decisive intervention was not contact alone, bringing the groups together for meals only intensified hostility | Comma splice with a broken contrast; split into two sentences. |
| `psych-soc-05-c2` | often ignoring base rates, the 'Linda problem' is a famous demonstration | Comma splice; needs a period or semicolon before 'the Linda problem'. |
| `qc-02-c2` | They are eigenstates of correlated observables, measuring one qubit instantly tells you | Comma splice; join with a semicolon or rewrite as two sentences. |
| `qc-09-c2` | Photons don't decohere in flight, they're naturally suited to networking | Comma splice; use a semicolon or split the sentence. |
| `qchem-10-c3` | the field is wary, an opaque neural network inside a quantum-mechanical calculation is hard to debug | Comma splice; needs a colon or semicolon after 'wary'. |
| `qft-02-c1` | are not separate solutions to be discarded, both are required for a Hermitian field | Comma splice; use a semicolon or split the sentence. |
| `qft-06-c2` | ln(...) − ...] | Formula left unfinished with placeholders; write out the full cross section. |
| `soc-net-04-c3` | Power-law fits are sometimes overstated, Aaron Clauset and colleagues argue many networks fit | Comma splice from punctuation edit; use a colon or parentheses. |
| `synb-06-c2` | Phage display (George Smith, 1985 Nobel Prize 2018) | Garbled attribution; 1985 paper and 2018 prize run together. |
| `synb-07-c1` | what's the minimum gene set for a free-living cell?, drove the 2016 follow-up | Stray comma after question mark breaks the sentence. |
| `topp-05-c2` | Semiconductor nanowires with strong spin-orbit coupling, in proximity to an s-wave superconductor, in a Zeeman field, the celebrated Lutchyn-Sau-Das Sarma proposal (2010), can also realize the Kitaev chain | Garbled sentence; appositive dangles; split into two sentences. |
| `topp-05-c3` | no single experiment will be definitive, instead, a coherent suite | Comma splice; use a semicolon or 'but rather'. |
| `war-07-c3` | a tactical defeat for the Viet Cong, they suffered enormous casualties | Comma splice; use a semicolon or split the sentence |
| `ads-03-c2` | where χ = 2 − 2g is the Euler character of the surface | Term is 'Euler characteristic', not 'character'. |
| `aging-02-c1` | roughly ~50 population doublings | Redundant 'roughly ~'; keep one approximation marker. |
| `astb-05-c1` | subglacial lakes, atacama soils, sulfuric Rio Tinto | Lowercase proper noun; capitalise Atacama. |
| `bio-imm-01-c1` | recognize PAMPs (pathogen-associated molecular patterns) (broad signatures of microbes | Stacked parentheses; restructure as a dash-free clause or two sentences. |
| `bio-imm-03-c2` | Diagram of T-cell activation by antigen-presenting cell showing TCR-MHC interaction | Generic activation figure; concept is killer T cells, so use a cytotoxic example. |
| `bio-mar-01-c1` | Kelp forest underwater showing giant kelp fronds and diverse fish life | Kelp forest figure does not illustrate ocean depth zones |
| `bio-mar-04-c3` | Migrations are vulnerable to many disturbances, fishing nets, climate-driven shifts in prey distribution | List lacks colon or 'and' before items; reads as a splice |
| `canc-10-c3` | dostarlimab (dMMR endometrial → broader) | Stray arrow fragment; finish the entry or delete it. |
| `chem-anly-02-c1` | the indicator's pKin should be within the steep portion of the curve | Garbled symbol 'pKin'; should be the indicator's pKa. |
| `chem-anly-06-c2` | Several physics, all sorting ions by m/z: | Ungrammatical; should read 'Several physical principles'. |
| `chem-atom-03-c3` | predicted missing elements (and even their properties (gallium, germanium)) | Nested parentheses make the examples ambiguous; restructure. |
| `chem-atom-07-c2` | Sudden jumps reveal closed-shell stability, losing an electron | Comma splice; use a period or semicolon. |
| `chem-org-04-c1` | Its polarisation, carbon is δ+ because oxygen is more electronegative, makes the carbon | Garbled subject from comma insertion; rewrite as one clause. |
| `clean-04-c2` | Smells aren't bugs, the code might work fine, but they signal that something is off | Comma splice; use a semicolon or two sentences. |
| `comp-02-c1` | exactly what DFAs and NFAs recognize | Semicolon-led fragment; make it a full clause. |
| `cx-01-c2` | z = re^{i\theta} | Raw LaTeX escape left in prose; render as math. |
| `dg-04-c2` | parallel transport is trivial, just slide the vector | Comma splice with imperative; use a semicolon or a dash-free clause. |
| `econ-crypto-05-c5` | stablecoins are a major non-trivial buyer of T-bills | Awkward stacked qualifiers; use 'a major buyer' |
| `econ-econ-06-c1` | As opposed to cross-sectional data (one period, many units) or pure time-series (one unit, many periods) | Sentence fragment; attach it to the previous sentence. |
| `econ-env-01-c5` | Polices include protected areas | Misspelling: should be "Policies". |
| `econ-md-06-c3` | This affects designs choices | Garbled phrase; should read 'This affects design choices'. |
| `gchm-09-c3` | still has ~roughly 0.5–1% of chondritic abundances | Duplicated hedge '~roughly'; keep one qualifier. |
| `geo-tec-01-c3` | Map of Earth's tectonic plate boundaries | Boundary map does not illustrate drivers of plate motion |
| `hist-afr-05-c3` | Nelson Mandela, 1994 | Mandela figure only loosely matches the conflict and politics concept; consider a closer image. |
| `hist-em-04-c2` | The Taj Mahal (completed 1653), commissioned by Mughal Emperor Shah Jahan | Caption completion date 1653 conflicts with text's 1631–1648. |
| `hist-med-04-c3` | Islamic learning reached medieval Europe through three main routes: | Says three routes but four follow (Spain, Sicily, Crusades, Toledo); fix count. |
| `hist-pre-03-c1` | Aztec Sun Stone (Calendar Stone), National Anthropology Museum, Mexico City | Sun Stone is not about Tenochtitlan's founding or rise; weak match. |
| `hist-pre-04-c1` | Machu Picchu, Peru | Citadel photo weakly matches empire extent and roads; consider a map. |
| `hpre-04-c2` | Africa sorghum, pearl millet and African rice | Elliptical list with no verb after "Africa"; reads as garbled, add the verb. |
| `info-04-c3` | For continuous channels with additive white Gaussian noise (AWGN) (the standard model | Missing comma after the parenthetical AWGN aside |
| `lsan-04-c2` | keeping the syllable's weight: | Colon introduces the two sound changes, which are not enumerated after it. |
| `misc-cicada-03-c2` | This narrowed candidate explanations: a single hobbyist couldn't easily do it | Ungrammatical; should read 'This narrowed the candidate explanations'. |
| `misc-num-01-c3` | So 666 was originally specific cipher | Missing article: 'a specific cipher'. |
| `para-01-c2` | hide the details of how behind a name that says what | Garbled phrasing; rewrite as 'hide how behind a name that says what'. |
| `phil-ea-03-c2` | The snake is not nothing, it produces fear, but it is not what is really there | Comma splice; use a semicolon or full stop |
| `phys-astro-07-c2` | The fastest known spin at over 700 Hz; | Fragment; missing verb. |
| `phys-astro-08-c2` | A computer simulation of the cosmic web, each bright knot is an entire galaxy | Caption comma splice; needs a colon or dash-free restructure. |
| `phys-bio-05-c1` | with near 100% efficiency: through a forest of pigment molecules | Colon splits the clause awkwardly; sentence reads garbled. |
| `phys-em-06-c2` | wave a magnet near a coil and current flows | Misused verb; likely meant 'move a magnet'. |
| `pol-ir-04-c3` | withdrawals (Paris climate, WHO, JCPOA, UN Human Rights Council) reasserted under his second term | Missing auxiliary; reads as garbled, likely 'were reasserted'. |
| `psych-evo-02-c3` | most people fail, only around 10–25% reason correctly | Comma splice; use a full clause such as 'only 10–25% reason correctly'. |
| `qchem-05-c2` | KS orbitals are not the same as physical molecular orbitals, they're defined by a fictitious system | Comma splice; use a semicolon or split the sentence. |
| `spec-08-c3` | coordination geometry (Pre-edge intensity | Mid-sentence capital in parenthetical; lowercase or restructure |
| `sys-02-c2` | Implemented by acknowledgments and retries, if the consumer doesn't ack, the producer resends | Comma splice; use a colon or 'and' before the conditional clause. |
| `topp-03-c2` | and 2018 Banerjee et al. measured its thermal Hall conductance | Missing 'in' before the year; broken grammar. |
| `war-08-c2` | widely attributed to a US-Israeli operation, that destroyed Iranian uranium centrifuges | Stray comma before relative clause; attach it to Stuxnet directly |

## 2. First lessons, worst first (top 40 of 274)

Lesson 1 of each topic is what a new user meets first, so these come before everything else.

| Lesson | Title | Score | Signs | Worst line |
|---|---|---:|---|---|
| `bio-cell-01` | Anatomy of a Cell | 35 | metaphor 4, proofread 2, hype 2, recap 1, importance 1 | This control is essential, without it, cell contents would simply diffuse into the surroundings |
| `econ-crypto-01` | Blockchain Incentives | 22 | hype 3, proofread 1, reframe 1 | Bitcoin price history chart over years |
| `pol-ins-01` | The Modern State | 22 | importance 3, proofread 2, recap 1, hype 1 | messier than the doctrine suggests, great powers have always had more sovereignty |
| `econ-pe-01` | Public Choice Theory | 20 | reframe 3, hype 2, importance 2 | One striking implication: rational ignorance |
| `cx-01` | The Complex Plane | 19 | hype 3, proofread 1, importance 1, rhetorical 1 | that is impossibly beautiful |
| `econ-intl-01` | Comparative Advantage | 18 | hype 2, rhetorical 2, reframe 2 | Ricardo's brilliant insight in 1817 |
| `econ-macro-01` | National Income & GDP | 18 | proofread 2 | The three measures rarely match exactly in practice, measurement error creates |
| `pol-nat-01` | Origins of Nationalism | 18 | hype 2, recap 2, importance 1, reframe 1, proofread 1 | and others: disagree about specific mechanisms |
| `comp-01` | Finite Automata | 17 | hype 4, proofread 1, rhetorical 1, recap 1 | The DFA may have exponentially more states, an NFA with n states might need up to 2^n DFA states |
| `lit-comp-01` | World Literature as Concept | 17 | hype 2, recap 2, reframe 1, rhetorical 1 | Several forces have made the contemporary moment unusually intense for world literature |
| `econ-io-01` | Market Structure | 16 | importance 1 | This is one of the most consequential current debates in economics |
| `econ-micro-01` | Supply & Demand | 16 | recap 2, reframe 1 | At its core, demand is a relationship |
| `ling-sem-01` | Meaning, Reference, and Sense | 16 | recap 3, reframe 1, rhetorical 1 | This explains why 'the morning star is the evening star' is informative |
| `lit-drama-01` | Origins of Theater | 16 | recap 3, importance 2, hype 1 | The fundamental theatrical situation |
| `opa-01` | Hilbert Spaces and Bounded Operators | 16 | metaphor 1, proofread 1, recap 1, reframe 1 | Hilbert spaces are self-dual |
| `bio-gen-01` | The Language of DNA | 15 | importance 3, proofread 1 | Human karyotype showing all 46 chromosomes arranged in pairs |
| `econ-dev-01` | Economic Growth Models | 15 | importance 2, metaphor 1, recap 1 | Robert Solow's 1956 model is the workhorse of growth economics |
| `econ-hot-01` | Mercantilists & Physiocrats | 15 | proofread 1, rhetorical 1 | The basic question, when should markets work alone?: has been with economics ever since |
| `lit-cl-01` | Homer & Greek Epic | 15 | hype 5, reframe 2, recap 1 | They're sophisticated, psychologically acute, structurally complex |
| `phil-01` | The Pythagorean Vision | 15 | hype 2, reframe 1, proofread 1, importance 1 | The idea that mathematicians discover rather than invent truths: that pi was 3.14159... long before any human computed it: is essentially Platonic |
| `neta-01` | TCP Congestion Control: Reno to CUBIC | 14 | metaphor 1, hype 1, importance 1, recap 1 | introduced the cornerstone idea: AIMD |
| `econ-env-01` | Externalities & Pollution | 14 | reframe 1, hype 1, recap 1, proofread 1 | A surprising result for non-economists |
| `econ-mb-01` | What Is Money? | 14 | recap 2, hype 1 | This sounds fragile but works remarkably well |
| `lang-01` | The Langlands Philosophy | 14 | hype 2, importance 1, reframe 1 | one of the two or three deepest organizing visions in modern mathematics |
| `med-bias-01` | What is Media Bias? | 14 | reframe 1, proofread 1 | the BBC's reviews of impartiality after Brexit and Covid coverage: is to insist that truth is a higher journalistic value than balance |
| `med-bc-01` | The Radio Age | 14 | hype 2, recap 1, importance 1, proofread 1 | in faux-news-bulletin format: became part of broadcasting mythology |
| `pol-emp-01` | Ancient & Classical Empires | 14 | recap 1, hype 1, proofread 1 | The empire's institutional sophistication, the arthashastra attributed to Kautilya is one of the most detailed surviving treatises |
| `psych-perc-01` | Psychophysics: Measuring the Mind | 14 | hype 2, metaphor 1, proofread 1 | a confident one cries wolf, both can be equally sensitive but differ in criterion |
| `bio-mic-01` | The Three Domains | 13 | proofread 1 | Electron micrograph of Streptococcus pyogenes bacteria in characteristic chain formation |
| `comb-01` | Counting Principles | 13 | importance 2, metaphor 1, hype 1 | The two most fundamental tools in combinatorics |
| `econ-demo-01` | Population & Economic Growth | 13 | hype 1, importance 1 | demography moves slowly but inexorably |
| `econ-econ-01` | OLS Regression | 13 | importance 1, recap 1 | OLS without a credible identification story is just descriptive correlation |
| `ling-syn-01` | Constituents and Phrase Structure | 13 | importance 1, reframe 1, hype 1 | Constituency is fundamental: |
| `lit-pc-01` | Empire & the Literary | 13 | reframe 2, recap 1, metaphor 1 | Empire is in the canon whether the canon acknowledges it or not |
| `lit-shake-01` | Shakespeare's World | 13 | recap 2, hype 1, reframe 1 | he is also genuinely extraordinary |
| `nlin-01` | Phase Space and Fixed Points | 13 | recap 2, hype 2, importance 1 | Dimension is destiny |
| `qft-01` | Why Fields? From Particles to Operators | 13 | recap 2, importance 1, reframe 1, hype 1 | This oscillator picture is the entire conceptual core of free QFT |
| `bio-neuro-01` | The Neuron | 12 | proofread 1 | dendrites (branching input receivers (receive signals from other neurons), the cell body (soma) contains the nucleus and metabolic machinery) |
| `py-01` | Dynamic Typing and Duck Typing | 12 | reframe 1, recap 1, importance 1 | The deeper insight: Python is full of small, sharp edges |
| `para-01` | Imperative & Procedural Programming | 12 | metaphor 1, proofread 1 | The core building blocks are simple |

## 3. Worst lessons overall (top 40)

| Lesson | Title | Score | Signs | Worst line |
|---|---|---:|---|---|
| `bio-cell-01` | Anatomy of a Cell | 35 | metaphor 4, proofread 2, hype 2, recap 1, importance 1 | This control is essential, without it, cell contents would simply diffuse into the surroundings |
| `comp-03` | Turing Machines | 27 | hype 7, metaphor 2, reframe 1 | And he succeeded beyond anyone's imagination |
| `econ-macro-05` | Monetary Policy | 27 | proofread 2, importance 1, hype 1 | essential for stability, if the central bank doesn't raise real rates when inflation rises |
| `econ-micro-02` | Elasticity | 25 | proofread 2, importance 1, hype 1, reframe 1, recap 1 | perfectly inelastic (vertical curve, ε = 0 (buyers will pay anything) and perfectly elastic |
| `comp-02` | Regular Expressions & Grammars | 23 | hype 5, recap 1, proofread 1, metaphor 1 | Regular expressions are a compact, elegant notation |
| `plas-10` | Astrophysical Plasmas | 23 | hype 3, proofread 1, metaphor 1, importance 1, recap 1 | The heliosphere shields Earth from most galactic cosmic rays, without it, surface life would face |
| `comp-08` | Lambda Calculus & Modern Computation | 22 | hype 2, metaphor 1, proofread 1, reframe 1, recap 1 | and in 1985 David Deutsch described a universal quantum computer, and it turned out to be genuinely different |
| `info-04` | Channel Capacity and the Noisy Channel Theorem | 22 | proofread 3, hype 2, importance 1, recap 1 | so so SNR has logarithmic returns while bandwidth has linear returns |
| `econ-crypto-01` | Blockchain Incentives | 22 | hype 3, proofread 1, reframe 1 | Bitcoin price history chart over years |
| `econ-crypto-05` | Stablecoins & Monetary Theory | 22 | proofread 2, recap 1 | stablecoin reserves earn interest rate; the spread funds operations |
| `lit-mod-05` | Kafka & European Modernism | 22 | recap 3, reframe 3, hype 1 | Each unforgettable, each unsettling |
| `pol-ins-01` | The Modern State | 22 | importance 3, proofread 2, recap 1, hype 1 | messier than the doctrine suggests, great powers have always had more sovereignty |
| `bio-imm-05` | Immunotherapy | 21 | hype 3, proofread 2 | can unleash off-target |
| `cc-02` | Parsing and Grammars | 21 | hype 2, proofread 1, importance 1, metaphor 1 | or multiplication?, requires the parser to know whether a is a typedef |
| `econ-demo-06` | Migration Economics | 21 | proofread 2, importance 1, hype 1 | To developing countries, three times official development assistance |
| `econ-fin-06` | Derivatives & Options | 21 | hype 2, proofread 1 | F = S·e^(r-y)T |
| `econ-md-06` | Algorithmic Mechanism Design | 21 | hype 3, recap 1, proofread 1 | The lesson: pure theoretical optimality often gives way to computational and operational simplicity in real markets |
| `pol-ir-03` | Constructivism & Critical IR | 21 | proofread 2, reframe 2 | even what counts as a state: are socially constructed |
| `info-08` | Kolmogorov Complexity and MDL | 20 | hype 5, proofread 1, reframe 1 | statements of the form "K(x) > N", randomness has a built-in unprovability |
| `econ-demo-05` | Fertility & Family Economics | 20 | hype 2, proofread 1 | World map of total fertility rate by country |
| `econ-micro-04` | Producer Theory & Costs | 20 | importance 3, metaphor 1 | is a workhorse: flexible enough to capture most cases |
| `econ-pe-01` | Public Choice Theory | 20 | reframe 3, hype 2, importance 2 | One striking implication: rational ignorance |
| `econ-pe-05` | Institutions & Property Rights | 20 | reframe 2, importance 2, hype 2 | It's not the natural state; it's a hard-won achievement |
| `lit-comp-02` | Translation as Reading | 20 | recap 3, hype 1, reframe 1 | The art lies in calibration |
| `qchem-05` | Density Functional Theory: Hohenberg-Kohn and Kohn-Sham | 19 | hype 4, metaphor 1, proofread 1, rhetorical 1, reframe 1 | The remarkable thing is how well even crude approximations work in practice |
| `cx-01` | The Complex Plane | 19 | hype 3, proofread 1, importance 1, rhetorical 1 | that is impossibly beautiful |
| `comp-04` | Computability & Undecidability | 19 | reframe 2, recap 2, importance 1, rhetorical 1, hype 1, metaphor 1 | Far from being a defeat, this is one of the deepest insights in human intellectual history |
| `econ-beh-05` | Nudges & Choice Architecture | 19 | hype 3, reframe 1, recap 1 | Defaults are extraordinarily cheap and effective policy levers |
| `econ-lab-05` | Discrimination & Inequality | 19 | proofread 1, reframe 1 | some employers have a 'taste' for discrimination, they pay extra |
| `lit-myth-03` | Norse Mythology | 19 | proofread 1 | atmosphere. the wizard Gandalf |
| `lit-poetry-05` | Schools & Movements | 19 | recap 3 | Whether you love or distrust Modernism, you're still operating in its wake |
| `lang-05` | Modularity and Wiles-Taylor | 19 | metaphor 2, proofread 1, recap 1, hype 1 | it would violate Serre's conjecture on modular Galois representations, which Ribet (1990) proved sufficient |
| `dim-02` | Dimensional Algebra | 18 | proofread 2, hype 1, recap 1 | If a car covers 120 km in 2 h: |
| `econ-demo-02` | Aging Populations | 18 | importance 2, metaphor 2, hype 1 | This is the largest demographic shift in human history |
| `econ-env-04` | Discounting the Future | 18 | recap 2, proofread 1 | may be $X; the expected damage from a 5% probability of civilizational collapse is also $X |
| `econ-fin-07` | Stock Markets & Equity | 18 | hype 1, proofread 1, reframe 1 | the lesson isn't 'avoid stocks', long-run real returns have been ~6-7% for over a century |
| `econ-intl-01` | Comparative Advantage | 18 | hype 2, rhetorical 2, reframe 2 | Ricardo's brilliant insight in 1817 |
| `econ-macro-01` | National Income & GDP | 18 | proofread 2 | The three measures rarely match exactly in practice, measurement error creates |
| `phil-08` | Infinity, Existence & The Multiverse of Math | 18 | importance 2, hype 2, reframe 2, recap 1 | was philosophically stunning |
| `pol-ir-02` | Liberalism in IR | 18 | proofread 2, hype 1, reframe 1, importance 1 | deep economic interdependence, but the pattern itself is stable |

## 4. Most repeated wording

Phrases the agents flagged most often. Useful for targeted edits, but rewrite in context rather than find-and-replace.

- **hype:** powerful (63), remarkable (48), striking (43), beautiful (43), remarkably (32), profound (29), sophisticated (27), elegant (23), surprising (23), surprisingly (20), stunning (16), astonishing (13)
- **importance:** key (79), essential (43), fundamental (41), crucially (33), crucial (31), critical (16), pivotal (3), fundamentally (3), critically (1), vital (1)
- **metaphor:** workhorse (38), cornerstone (13), backbone (11), building blocks (8), blueprint (6), key (2), currency (2), control center (1), power plants (1), essentially (1), building block (1), fundamental (1)
- **reframe:** is not (79), isn't (59), not just (23), rather than (9), not merely (7), not only (2)
- **recap:** this is why (57), this means (15), the key insight (3), this matters (2), this explains (2), the key idea (2), this makes (1), at its core (1)

## 5. Topics, worst first (top 30 of 274)

| Topic | Score | Score per lesson |
|---|---:|---:|
| `computation` | 147 | 18.4 |
| `econ-crypto` | 86 | 17.2 |
| `econ-micro` | 103 | 17.2 |
| `econ-demographics` | 101 | 16.8 |
| `econ-macro` | 100 | 16.7 |
| `philosophy-of-math` | 124 | 15.5 |
| `econ-political-economy` | 75 | 15.0 |
| `econ-mech-design` | 87 | 14.5 |
| `math-operator-algebras` | 101 | 14.4 |
| `econ-development` | 72 | 14.4 |
| `econ-environmental` | 72 | 14.4 |
| `lit-drama` | 85 | 14.2 |
| `econ-finance` | 99 | 14.1 |
| `econ-labor` | 68 | 13.6 |
| `lit-comparative` | 65 | 13.0 |
| `lit-modernism` | 78 | 13.0 |
| `econ-international` | 77 | 12.8 |
| `lit-mythology` | 77 | 12.8 |
| `cs-paradigms` | 64 | 12.8 |
| `econ-money-banking` | 89 | 12.7 |
| `econ-history-thought` | 75 | 12.5 |
| `lit-russian` | 74 | 12.3 |
| `econ-game-theory` | 72 | 12.0 |
| `politics-international` | 72 | 12.0 |
| `econ-industrial-org` | 59 | 11.8 |
| `set-theory` | 94 | 11.8 |
| `cs-lang-cpp` | 57 | 11.4 |
| `lit-poetry` | 68 | 11.3 |
| `cs-information-theory` | 112 | 11.2 |
| `cs-lang-python` | 56 | 11.2 |
