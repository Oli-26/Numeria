# Change log: voice pass

896 concepts processed so far: the 32-concept trial plus 864 of 864 in the full pass. Every change was validated by script before being applied to `wwwroot/data/*/lessons.json`. Full before/after for every concept is in `changes.jsonl`; the review swarm works from that file.

| Status | Concepts |
|---|---:|
| applied | 841 |
| flagged | 40 |
| unchanged | 15 |
| reverted | 0 |
| rejected | 0 |

"Flagged" changes are applied but need a closer look. Rejected changes were not applied.

**Flags:** names missing (21), names added (16), hype word left (3), numbers missing (1)

**Review verdicts:** ok (788), fixed (76)

**Warmth (881 concepts):** speaks to the reader 175 -> 466; uses contractions 527 -> 769; colons per 100 words 0.45 -> 0.33

## Spot checks (12)

A spread of lesson 1 rewrites across subjects, some targeted fixes and some flagged changes.

### `bio-cell-01-c1` (rewrite, applied)

*Moves 2, 3, 6, 8: 'your cells' (not widened), plain idea then term, contractions, ends on the ID badges.*

**Before**

> Every cell membrane is a double layer of fat molecules, called a phospholipid bilayer , that wraps the whole cell. The membrane is selectively permeable. Small molecules like oxygen and water cross freely, but large or charged molecules need special transport proteins. Without that control, cell contents would diffuse into the surroundings. Embedded in the membrane are proteins that act as channels, pumps, receptors, and ID badges.

**After**

> Your cells are each wrapped in a cell membrane , a double layer of fat molecules called the phospholipid bilayer . It's selectively permeable, which means it's choosy about what gets through. Small molecules like oxygen and water cross freely, but large or charged ones need special transport proteins. Without that control, everything inside the cell would diffuse into its surroundings. Proteins embedded in the membrane do different jobs. Some act as channels, some as pumps, some as receptors, and some as ID badges.

### `bio-cell-01-c2` (rewrite, applied)

*Moves 2, 6, 8: reader addressed on chromosomes (same claim as original), contractions, ends on prokaryote fact; figure untouched.*

**Before**

> The nucleus directs the cell's protein synthesis through gene expression. It contains DNA, which codes for every protein the cell makes. DNA is bundled into chromosomes. Humans have 46 chromosomes (23 pairs) in every body cell. Only eukaryotic cells (animals, plants, fungi, protists) have nuclei. Prokaryotic cells (bacteria, archaea) keep their DNA loose in the cytoplasm. They are simpler and far more ancient.

**After**

> The nucleus is where a cell's DNA sits, and it directs the cell's protein synthesis through gene expression. That DNA codes for every protein the cell makes. DNA is bundled into chromosomes. You have 46 of them (23 pairs) in every body cell. Only eukaryotic cells (animals, plants, fungi, protists) have nuclei. Prokaryotic cells (bacteria, archaea) keep their DNA loose in the cytoplasm, and they're simpler and far more ancient.

### `bio-cell-01-c3` (rewrite, applied)

*Moves 2, 5, 6: reader addressed ('you'll meet'), organelle glosses as verbs, contractions; figure untouched.*

**Before**

> Mitochondria convert food (glucose) into ATP, the energy carrier that powers every cellular process. Mitochondria have their own DNA and were likely once free-living bacteria swallowed by an ancestral cell, an idea called the endosymbiotic theory. Other organelles include ribosomes (build proteins), the endoplasmic reticulum (protein/lipid factory), the Golgi apparatus (packaging and shipping), and lysosomes (waste disposal).

**After**

> Mitochondria convert food (glucose) into ATP, the energy carrier that powers every cellular process. Mitochondria have their own DNA, and they were likely once free-living bacteria swallowed by an ancestral cell, an idea called the endosymbiotic theory. Other organelles you'll meet include ribosomes, which build proteins; the endoplasmic reticulum, a protein/lipid factory; the Golgi apparatus, which handles packaging and shipping; and lysosomes, which handle waste disposal.

### `hist-ea-01-c1` (rewrite, applied)

*Opened on 221 BCE and Qin Shi Huang, active verbs, contraction-free but varied rhythm, ended on the 'Han' name fact; bold Qin kept.*

**Before**

> The Qin dynasty (221-206 BCE) unified China for the first time under Qin Shi Huang, who standardized writing, measurements, currency, and the legal code. He also built the first version of the Great Wall and was buried with the Terracotta Army. The Han dynasty (206 BCE-220 CE) consolidated and expanded. Confucianism became the state ideology and the Silk Road opened to the west. Han influence went so deep that ethnic Chinese still call themselves 'Han'.

**After**

> In 221 BCE one man, Qin Shi Huang, unified China for the first time, founding the Qin dynasty (221-206 BCE). He standardized writing, measurements, currency, and the legal code. He also built the first version of the Great Wall, and he was buried with the Terracotta Army. The Han dynasty (206 BCE-220 CE) consolidated and expanded what Qin had started. Confucianism became the state ideology and the Silk Road opened to the west. Han influence went so deep that ethnic Chinese still call themselves 'Han'.

### `rs-01-c1` (rewrite, applied)

*Moves 2, 6: reader addressed, contractions, active phrasing on moves; all facts and code kept.*

**Before**

> Rust (Graydon Hoare, Mozilla, first stable 2015) is built around ownership . Every value has exactly one owner, a variable. When the owner goes out of scope, the value is dropped, which means its destructor runs and its memory is freed. This is RAII enforced by the compiler. Assignment moves. let s1 = String::from("hello"); let s2 = s1; transfers ownership, so s2 now owns the string and s1 is no longer usable. Using s1 is a compile error ("value moved here"). C++ copies by default and garbage-collected languages use reference semantics, so this works differently from both. Because the compiler knows precisely when each resource is freed, it can prevent use-after-free, double-free, and many concurrency bugs at compile time. There is no garbage collector and no runtime cost, only rules the compiler enforces.

**After**

> Rust (Graydon Hoare, Mozilla, first stable 2015) is built around ownership . Every value has exactly one owner, a variable. When the owner goes out of scope, the value is dropped, which means its destructor runs and its memory is freed. This is RAII enforced by the compiler. Assignment moves. After let s1 = String::from("hello"); let s2 = s1; , ownership has transferred, so s2 owns the string and s1 is no longer usable. Using s1 is a compile error ("value moved here"). C++ copies by default and garbage-collected languages use reference semantics, so this works differently from both. Because the compiler knows precisely when each resource is freed, it can prevent use-after-free, double-free, and many concurrency bugs at compile time. There's no garbage collector and no runtime cost, only rules the compiler enforces.

### `war-01-c2` (rewrite, applied)

*Opened on Clausewitz's life, split dense sentences, contractions and active verbs, kept all terms, dates and names, ended on the Jomini rebuke.*

**Before**

> Carl von Clausewitz (1780-1831), a Prussian officer who served against Napoleon, wrote Vom Kriege ( On War ), published posthumously in 1832 by his widow. The book is unfinished and often opaque, yet it is cited almost universally in Western writing on war. Clausewitz's central proposition is that war is the continuation of politics by other means . War has no internal logic of its own. It is an instrument of policy, and its conduct must be subordinated to political ends. He distinguishes absolute war , an abstract ideal of unlimited violence, from real war , which is constrained by friction, exhaustion, terrain, and political restraint. His enduring contributions include the concepts of fog of war (uncertainty about enemy and friendly positions), friction (the accumulation of small obstacles that derail plans), the culminating point of victory (where an offensive becomes vulnerable), and the centre of gravity (the source of an enemy's power). Clausewitz also rejected systematic doctrines that promised victory through fixed rules, a quiet rebuke to his contemporary Antoine-Henri Jomini.

**After**

> Carl von Clausewitz (1780-1831) was a Prussian officer who served against Napoleon. He wrote Vom Kriege ( On War ), which his widow published after his death in 1832. The book is unfinished and often opaque, yet it's cited almost universally in Western writing on war. Clausewitz's central proposition is that war is the continuation of politics by other means . War has no internal logic of its own. It's an instrument of policy, and its conduct must be subordinated to political ends. He distinguishes absolute war , an abstract ideal of unlimited violence, from real war , which is constrained by friction, exhaustion, terrain, and political restraint. His enduring contributions include the fog of war (uncertainty about enemy and friendly positions), friction (the accumulation of small obstacles that derail plans), the culminating point of victory (where an offensive becomes vulnerable), and the centre of gravity (the source of an enemy's power). Clausewitz also rejected systematic doctrines that promised victory through fixed rules, a quiet rebuke to his contemporary Antoine-Henri Jomini.

### `phil-log-01-c2` (rewrite, applied)

*Led with the example, then defined soundness from it; contractions and merged paragraphs.*

**Before**

> An argument is valid if the conclusion must be true whenever the premises are true. Validity is about structure, not truth. An argument is sound if it is valid and all its premises are actually true. 'All cats can fly. Whiskers is a cat. So Whiskers can fly' is valid, because the form works, but not sound, because premise 1 is false. Validity is necessary but not sufficient for a good argument.

**After**

> An argument is valid if the conclusion must be true whenever the premises are true. Validity is about structure, not truth. 'All cats can fly. Whiskers is a cat. So Whiskers can fly' is valid, because the form works. It isn't sound, because premise 1 is false. An argument is sound if it is valid and all its premises are actually true. So validity is necessary but not sufficient for a good argument.

### `chem-anly-01-c1` (rewrite, applied)

*Contractions, reader addressed, active verbs; all definitions, error classes and examples preserved; ends on Grubbs' test.*

**Before**

> Accuracy is how close a measurement is to the true (accepted) value, and it is judged by systematic error (bias). Precision is how reproducible measurements are, meaning how closely repeated measurements agree with each other, and it is judged by random error (scatter). The two are easily confused. A method can be precise but inaccurate, consistently wrong in the same direction because of systematic error. It can be accurate but imprecise, with results scattered around the true value. Ideally it is both. Errors fall into three classes. Systematic errors are consistent bias (faulty calibration, contamination, wrong standard), and they can be identified and corrected. Random errors are unpredictable scatter from uncontrolled variables, and averaging replicate measurements reduces them. Gross errors are blunders, which statistical tests like Grubbs' test can discard.

**After**

> Accuracy is how close a measurement is to the true (accepted) value, and it's judged by systematic error (bias). Precision is how reproducible measurements are, meaning how closely repeated measurements agree with each other, and it's judged by random error (scatter). The two are easy to mix up. A method can be precise but inaccurate, consistently wrong in the same direction because of systematic error. It can be accurate but imprecise, with results scattered around the true value. You want both. Errors fall into three classes. Systematic errors are consistent bias (faulty calibration, contamination, wrong standard), and they can be identified and corrected. Random errors are unpredictable scatter from uncontrolled variables, and averaging replicate measurements reduces them. Gross errors are blunders, and statistical tests like Grubbs' test can discard them.

### `omet-01-c2` (rewrite, applied)

*Moves 2, 3, 6: opened with plain idea before term, merged ferrocene facts, contractions; kept the closing sequence of steps.*

**Before**

> Hapticity describes how many contiguous atoms of a ligand bond to the metal, and is written with the Greek letter eta (η). An η^1-allyl bonds through one carbon; an η^3-allyl uses all three carbons of the C3 unit. Cyclopentadienyl can be η^1 (sigma-bonded, one C) or η^5 (pentahapto, sandwich-style). Ferrocene, Fe(η^5-C5H5)2, has both Cp rings bound through all five carbons. Its 1951 sandwich structure launched the field. Dibenzenechromium uses η^6 arenes. The 'ring slip' phenomenon (η^5 → η^3 → η^1) lets a coordinatively saturated metal open a coordination site for a new ligand without ejecting Cp entirely. Hapticity also controls electron count. An η^5-Cp donates five electrons (covalent counting) or six (ionic counting, as Cp^-). Changing hapticity changes the number of electrons the metal sees, which is how a stable 18-electron complex transiently becomes a reactive 16-electron species. Slip the Cp, open a site, bind a substrate, slip it back.

**After**

> When a ligand attaches to a metal through neighbouring atoms, hapticity says how many. It counts the contiguous atoms of the ligand that bond to the metal, and it's written with the Greek letter eta (η). An η^1-allyl bonds through one carbon; an η^3-allyl uses all three carbons of the C3 unit. Cyclopentadienyl can be η^1 (sigma-bonded, one C) or η^5 (pentahapto, sandwich-style). Ferrocene, Fe(η^5-C5H5)2, has both Cp rings bound through all five carbons, and its 1951 sandwich structure launched the field. Dibenzenechromium uses η^6 arenes. The 'ring slip' phenomenon (η^5 → η^3 → η^1) lets a coordinatively saturated metal open a coordination site for a new ligand without ejecting Cp entirely. Hapticity also controls electron count. An η^5-Cp donates five electrons (covalent counting) or six (ionic counting, as Cp^-). Changing hapticity changes the number of electrons the metal sees, which is how a stable 18-electron complex transiently becomes a reactive 16-electron species. Slip the Cp, open a site, bind a substrate, slip it back.

### `gchm-01-c1` (rewrite, flagged)

*Reordered the opening around the Sun-meteorite match, addressed the reader in the plotting step, added a contraction, kept the Allende date as the closer.*  
Flags: names added: Sun's

**Before**

> The composition of the Sun (excluding H, He, and other volatiles) agrees to within roughly a factor of two, for nearly all elements, with that of the most primitive meteorites, the CI carbonaceous chondrites like Orgueil and Ivuna. CI chondrites never melted, never differentiated, and have escaped major thermal processing since 4.567 Ga. They are our closest available sample of average solar-system non-volatile matter . Geochemists therefore normalise rock compositions to CI to look for enrichments and depletions. Plotting Element/CI ratio against atomic number on a log scale immediately reveals the volatile depletion of Earth, the iron enrichment of the core, and the depletion of moderately siderophile elements in the silicate mantle from core formation. The reference Allende meteorite (CV3) gave the first robust Pb-Pb isochron, yielding 4.566 ± 0.002 Ga, a number that anchors the entire solar-system chronology.

**After**

> Leave out H, He, and other volatiles, and the Sun's composition agrees to within roughly a factor of two, for nearly all elements, with that of the most primitive meteorites, the CI carbonaceous chondrites like Orgueil and Ivuna. CI chondrites never melted, never differentiated, and have escaped major thermal processing since 4.567 Ga. They're our closest available sample of average solar-system non-volatile matter . Geochemists therefore normalise rock compositions to CI to look for enrichments and depletions. Plot Element/CI ratio against atomic number on a log scale and you immediately see the volatile depletion of Earth, the iron enrichment of the core, and the depletion of moderately siderophile elements in the silicate mantle from core formation. The reference Allende meteorite (CV3) gave the first robust Pb-Pb isochron, yielding 4.566 ± 0.002 Ga, a number that anchors the entire solar-system chronology.

### `lit-comp-01-c1` (rewrite, flagged)

*Led with the 1827 moment and the quotation, plain contraction, kept every name and date; ends on the temporary-isolation point.*  
Flags: names added: That's

**Before**

> Goethe coined the term Weltliteratur in 1827, in conversation with his secretary Eckermann. He had just been reading a Chinese novel in translation, and he told Eckermann: 'National literature is now a rather unmeaning term; the epoch of world literature is at hand.' The remark turned out to be prophetic. Goethe was sensing the increasing circulation of literary works across linguistic and national boundaries through translation, print, and trade, and it would prove unstoppable. By 1827 he was already reading Persian poetry, Indian drama, Chinese fiction, Serbian folk songs. For Goethe, Weltliteratur meant a continuous, expanding conversation, with literatures encountering each other and being changed by the encounter. The German tradition read Persian; the French read German; the Russian read French; the Chinese eventually read all of them. On this view, a single 'national' literature in isolation was a temporary historical situation rather than a permanent natural fact.

**After**

> In 1827, Goethe had just been reading a Chinese novel in translation when he told his secretary Eckermann: 'National literature is now a rather unmeaning term; the epoch of world literature is at hand.' That's when he coined the term Weltliteratur . The remark turned out to be prophetic. Goethe was sensing the increasing circulation of literary works across linguistic and national boundaries through translation, print, and trade, and it would prove unstoppable. By 1827 he was already reading Persian poetry, Indian drama, Chinese fiction, Serbian folk songs. For Goethe, Weltliteratur meant a continuous, expanding conversation, with literatures encountering each other and being changed by the encounter. The German tradition read Persian; the French read German; the Russian read French; the Chinese eventually read all of them. On this view, a single 'national' literature in isolation was a temporary historical situation rather than a permanent natural fact.

### `med-mis-01-c1` (rewrite, flagged)

*Opened on the 2017 report, addressed the reader in the misinformation example, contractions, kept the question as a plain two-part test.*  
Flags: names missing: Derakhshan's

**Before**

> The most influential framework for thinking about information disorders comes from Claire Wardle and Hossein Derakhshan's 2017 Council of Europe report Information Disorder . It sorts information into three categories using two questions: whether the information is false, and whether it is intended to harm. Misinformation is false information shared without intent to harm. A user shares a news story they believe to be true but which is in fact incorrect. Disinformation is false information deliberately created and spread to cause harm, such as Russian Internet Research Agency posts, fabricated 'news' sites and deliberate hoaxes. Malinformation is genuine information shared in ways designed to cause harm, such as leaked private communications, doxing and decontextualised true claims. The typology matters because the right response differs for each. Misinformation can sometimes be addressed through better journalism, public-education campaigns, and platform interventions like context labels. Disinformation requires identifying coordinated campaigns and the actors behind them, which is investigative work. Malinformation raises distinct civil-liberties questions because the underlying information is true, and the harm comes from how it is deployed. Using 'fake news' or 'misinformation' as catch-all terms, as casual usage often does, blurs these categories and produces both bad analysis and bad policy responses.

**After**

> In 2017 Claire Wardle and Hossein Derakhshan published a Council of Europe report, Information Disorder , that became the most influential framework for thinking about the subject. It sorts information into three categories using two questions: whether the information is false, and whether it is intended to harm. Misinformation is false information shared without intent to harm. Say you share a news story you believe to be true but which is in fact incorrect. Disinformation is false information deliberately created and spread to cause harm, such as Russian Internet Research Agency posts, fabricated 'news' sites and deliberate hoaxes. Malinformation is genuine information shared in ways designed to cause harm, such as leaked private communications, doxing and decontextualised true claims. The typology matters because the right response differs for each. Misinformation can sometimes be addressed through better journalism, public-education campaigns, and platform interventions like context labels. Disinformation requires identifying coordinated campaigns and the actors behind them, which is investigative work. Malinformation raises distinct civil-liberties questions because the underlying information is true, and the harm comes from how it's deployed. Using 'fake news' or 'misinformation' as catch-all terms, as casual usage often does, blurs these categories and produces both bad analysis and bad policy responses.

