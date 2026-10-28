# Change log: voice rewrite and fixes

The change swarm returned 2,991 of 2,991 assigned concepts. Every change was validated by script before being applied to `wwwroot/data/*/lessons.json`. Full before/after for every concept is in `changes.jsonl`; the review swarm works from that file.

| Status | Concepts |
|---|---:|
| applied | 2,688 |
| flagged | 295 |
| unchanged | 8 |
| rejected | 0 |
| not returned | 0 |

"Flagged" changes are applied but need a closer look. Rejected changes were not applied.

**Flags:** names missing (111), fix changed too much (74), length (55), numbers missing (40), figure removed (25), figure text edited (5), hype word left (3)

## Spot checks (16)

A spread of lesson 1 rewrites across subjects, some targeted fixes and some flagged changes.

### `bio-cell-01-c1` (rewrite, flagged)

*Rewrote in plain voice, fixed the comma splice, cut the checkpoint closer, and deleted the mismatched DNA figure.*  
Flags: figure removed

**Before**

> Every cell is enclosed by a cell membrane : a double layer of fat molecules called a phospholipid bilayer . It's selectively permeable : small molecules like oxygen and water cross freely, but large or charged molecules need special transport proteins. This control is essential, without it, cell contents would simply diffuse into the surroundings. Embedded in the membrane are proteins acting as channels, pumps, receptors, and ID badges. The membrane is less a wall and more a sophisticated checkpoint.

**After**

> Every cell membrane is a double layer of fat molecules, called a phospholipid bilayer , that wraps the whole cell. The membrane is selectively permeable. Small molecules like oxygen and water cross freely, but large or charged molecules need special transport proteins. Without that control, cell contents would diffuse into the surroundings. Embedded in the membrane are proteins that act as channels, pumps, receptors, and ID badges.

### `bio-cell-01-c2` (rewrite, applied)

*Replaced the control-center and blueprint metaphors with direct statements, kept one bold term, removed a colon. Figure unchanged.*

**Before**

> The nucleus is the cell's control center. It contains DNA : the molecular blueprint that codes for every protein the cell makes. DNA is bundled into chromosomes . Humans have 46 chromosomes (23 pairs) in every body cell. Only eukaryotic cells (animals, plants, fungi, protists) have nuclei. Prokaryotic cells (bacteria, archaea) keep their DNA loose in the cytoplasm: they're simpler and far more ancient.

**After**

> The nucleus directs the cell's protein synthesis through gene expression. It contains DNA, which codes for every protein the cell makes. DNA is bundled into chromosomes. Humans have 46 chromosomes (23 pairs) in every body cell. Only eukaryotic cells (animals, plants, fungi, protists) have nuclei. Prokaryotic cells (bacteria, archaea) keep their DNA loose in the cytoplasm. They are simpler and far more ancient.

### `bio-cell-01-c3` (rewrite, applied)

*Removed power-plant and currency metaphors, 'Curiously' and 'key'; one bold term; colons removed. Figure unchanged.*

**Before**

> Mitochondria are the cell's power plants. They convert food (glucose) into ATP , the energy currency that powers every cellular process. Curiously, mitochondria have their own DNA and were likely once free-living bacteria swallowed by an ancestral cell: the endosymbiotic theory . Other key organelles: ribosomes (build proteins), endoplasmic reticulum (protein/lipid factory), Golgi apparatus (packaging and shipping), lysosomes (waste disposal).

**After**

> Mitochondria convert food (glucose) into ATP, the energy carrier that powers every cellular process. Mitochondria have their own DNA and were likely once free-living bacteria swallowed by an ancestral cell, an idea called the endosymbiotic theory. Other organelles include ribosomes (build proteins), the endoplasmic reticulum (protein/lipid factory), the Golgi apparatus (packaging and shipping), and lysosomes (waste disposal).

### `hist-anc-01-c3` (rewrite, applied)

*Dropped the restating closer and all bold, removed the colon in paragraph two; facts kept.*

**Before**

> Both Mesopotamia and Egypt shared a recipe: predictable river floods + fertile soil + a long growing season . Reliable agriculture produced food surpluses. Surpluses meant some people didn't have to farm: they could specialize as priests, soldiers, scribes, artisans. Specialization enabled cities, hierarchies, writing, and centralized states. This pattern, civilization clustering around great rivers, also produced the Indus Valley (Harappa, Mohenjo-daro) and Yellow River civilizations independently. The same conditions reliably yield similar outcomes.

**After**

> Mesopotamia and Egypt shared the same ingredients: predictable river floods, fertile soil and a long growing season. Reliable agriculture produced food surpluses, which meant some people didn't have to farm. They could specialize as priests, soldiers, scribes or artisans, and specialization enabled cities, hierarchies, writing and centralized states. The same pattern, civilization clustering around great rivers, also produced the Indus Valley civilization (Harappa, Mohenjo-daro) and the Yellow River civilization independently.

### `py-01-c2` (rewrite, applied)

*Removed 'This is' openers and colon-led benefit lists, reduced bold to one term, kept all facts.*

**Before**

> Python doesn't care about an object's declared type, only about whether it supports the operations you perform on it. "If it walks like a duck and quacks like a duck, it's a duck." A function that calls len(x) works on any object that defines __len__ : list, string, dict, set, NumPy array, your custom class. This is structural typing at runtime , in contrast to Java's nominal typing ("this object IS a List"). The benefits: massive code reuse, lightweight protocols, easy mocking in tests. The costs: errors only show up when you hit the offending line, not at compile time. Type errors that would be caught instantly in Java surface only after a function is actually invoked. Modern Python adds type hints (PEP 484, 2014) that look like def add(x: int, y: int) -> int: return x + y . The runtime ignores them; tools like mypy , pyright , and pyre use them for static analysis. Hints are widely adopted in modern Python (FastAPI, Pydantic, large codebases) and bring back many compile-time guarantees without sacrificing duck typing's flexibility.

**After**

> Python doesn't care about an object's declared type, only about whether it supports the operations you perform on it. "If it walks like a duck and quacks like a duck, it's a duck." A function that calls len(x) works on any object that defines __len__ : list, string, dict, set, NumPy array, your custom class. Python uses structural typing at runtime , in contrast to Java's nominal typing ("this object IS a List"). The benefits are heavy code reuse, lightweight protocols, and easy mocking in tests. The cost is that errors only show up when you hit the offending line, not at compile time. Type errors that would be caught instantly in Java surface only after a function is actually invoked. Modern Python adds type hints (PEP 484, 2014) that look like def add(x: int, y: int) -> int: return x + y . The runtime ignores them, and tools like mypy, pyright, and pyre use them for static analysis. Hints are widely adopted in modern Python (FastAPI, Pydantic, large codebases) and bring back many compile-time guarantees without sacrificing duck typing's flexibility.

### `hist-tech-01-c2` (rewrite, applied)

*Removed the 'most consequential' claim, tightened sentences, kept the single bold term and all regions and facts.*

**Before**

> The single most consequential technological transition in human history was the Neolithic Revolution , the shift from foraging to settled agriculture, which began independently in at least seven world regions: The Fertile Crescent (~10,000 BCE): wheat, barley, lentils, sheep, goats. China: millet (north) and rice (south), pigs. Mesoamerica: maize, beans, squash. The Andes: potatoes, quinoa, llamas. New Guinea, Sub-Saharan Africa, and eastern North America also saw independent domestications. Settled life made possible long-term storage, division of labour, larger populations, and eventually cities. It also brought new problems: zoonotic disease (smallpox, measles, influenza), shorter average stature than foragers, and new forms of inequality. Pottery, weaving, brewing, and irrigation followed within a few thousand years.

**After**

> The Neolithic Revolution was the shift from foraging to settled agriculture, and it began independently in at least seven world regions: The Fertile Crescent (~10,000 BCE): wheat, barley, lentils, sheep, goats. China: millet (north) and rice (south), pigs. Mesoamerica: maize, beans, squash. The Andes: potatoes, quinoa, llamas. New Guinea, Sub-Saharan Africa, and eastern North America also saw independent domestications. Settled life made long-term storage, division of labour, larger populations, and eventually cities possible. It also brought zoonotic disease (smallpox, measles, influenza), shorter average stature than foragers, and new forms of inequality. Pottery, weaving, brewing, and irrigation followed within a few thousand years.

### `phil-eth-01-c1` (rewrite, applied)

*Removed bold labels, colons and the 'not merely' contrasts; kept all branches and examples.*

**Before**

> Ethics (or moral philosophy) is the systematic study of what makes actions right or wrong, what kinds of people we ought to be, and what makes lives go well. It is divided into three main branches: Normative ethics : theories about what is right, utilitarianism, deontology, virtue ethics. Metaethics : questions about the nature of moral claims, are they true or false? Objective or subjective? Applied ethics : using moral theory to address real problems, bioethics, business ethics, environmental ethics. Ethics is not merely a matter of custom or law; a society can have unjust laws and a morally monstrous culture. Philosophy asks what we ought to do, not merely what we do.

**After**

> Ethics (or moral philosophy) is the systematic study of what makes actions right or wrong, what kinds of people we ought to be, and what makes lives go well. It has three main branches. Normative ethics covers theories about what is right, such as utilitarianism, deontology and virtue ethics. Metaethics covers the nature of moral claims, and asks whether they are true or false, objective or subjective. Applied ethics uses moral theory to address real problems, such as bioethics, business ethics and environmental ethics. Custom and law don't settle ethics, since a society can have unjust laws and a morally monstrous culture. Philosophy asks what we ought to do, whatever we in fact do.

### `calc-01-c2` (rewrite, applied)

*Removed exclamation mark and bold confetti; merged sentences and kept all facts.*

**Before**

> Sometimes a function approaches different values depending on which direction you come from. The left-hand limit is what happens as you approach from below (from the left on the number line). The right-hand limit is from above. A limit only exists if both sides agree!

**After**

> A function can approach different values depending on which direction you come from. The left-hand limit is the value you approach from below, which is the left side of the number line. The right-hand limit is the value you approach from above. A limit exists only when both sides agree.

### `chem-org-01-c3` (rewrite, applied)

*Dropped the bold labels and colons inside the list, writing each hydrocarbon class as plain sentences.*

**Before**

> The simplest organics contain only C and H. Their names follow systematic IUPAC rules based on the chain length and bond type: Alkanes , all single bonds (saturated): methane, ethane, propane. Formula CₙH₂ₙ₊₂. Very unreactive except combustion. Alkenes , one or more C=C double bonds: ethene (ethylene, CH₂=CH₂). Formula CₙH₂ₙ (with one double bond). Reactive at the double bond via addition reactions. Alkynes , one C≡C triple bond: ethyne (acetylene, C₂H₂). Very reactive; used in welding torches. The degree of unsaturation (double/triple bonds, rings) tells you how many hydrogens are 'missing' relative to the saturated formula.

**After**

> The simplest organics contain only C and H. Their names follow systematic IUPAC rules based on the chain length and bond type: Alkanes have all single bonds (saturated), as in methane, ethane and propane. Their formula is CₙH₂ₙ₊₂, and they are very unreactive except for combustion. Alkenes have one or more C=C double bonds, as in ethene (ethylene, CH₂=CH₂). The formula is CₙH₂ₙ with one double bond, and they react at the double bond by addition reactions. Alkynes have one C≡C triple bond, as in ethyne (acetylene, C₂H₂). They are very reactive and are used in welding torches. The degree of unsaturation (double/triple bonds, rings) tells you how many hydrogens are 'missing' relative to the saturated formula.

### `phil-03-c3` (fix, applied)

*Removed the 'isn't just academic' contrast and stated the practical effects directly.*

**Before**

> The Platonism-Formalism debate cuts to the heart of what mathematics is . Is it the science of abstract objects (Platonism)? A formal game with symbols (Formalism)? The disagreement isn't just academic: it affects how mathematicians approach their work, which methods they consider legitimate, and what counts as an answer to a mathematical question. Consider an unsolved problem like the Goldbach Conjecture (every even number greater than 2 is the sum of two primes). A Platonist says: this is either true or false; there's a fact of the matter, we just don't know it yet. A strict formalist says: it's meaningless to call it "true" or "false" until we have a proof or refutation within some formal system. Truth is provability. In practice, most mathematicians are working Platonists : they talk and think as if they're exploring an objective mathematical world. But when pressed on philosophical foundations, many retreat to a more formalist or pragmatist position. Philip Davis and Reuben Hersh famously quipped that the typical working mathematician is a Platonist on weekdays and a formalist on Sundays. Neither view is fully satisfying alone. Platonism explains the feeling of discovery but struggles with how we access abstract objects. Formalism explains the rigor of proof but struggles with meaning and applicability. This tension has driven the development of several alternative philosophies of mathematics (logicism, intuitionism, structuralism) each attempting to resolve the debate from a different angle.

**After**

> The Platonism-Formalism debate cuts to the heart of what mathematics is . Is it the science of abstract objects (Platonism)? A formal game with symbols (Formalism)? The disagreement affects how mathematicians approach their work, which methods they consider legitimate, and what counts as an answer to a mathematical question. Consider an unsolved problem like the Goldbach Conjecture (every even number greater than 2 is the sum of two primes). A Platonist says: this is either true or false; there's a fact of the matter, we just don't know it yet. A strict formalist says: it's meaningless to call it "true" or "false" until we have a proof or refutation within some formal system. Truth is provability. In practice, most mathematicians are working Platonists : they talk and think as if they're exploring an objective mathematical world. But when pressed on philosophical foundations, many retreat to a more formalist or pragmatist position. Philip Davis and Reuben Hersh famously quipped that the typical working mathematician is a Platonist on weekdays and a formalist on Sundays. Neither view is fully satisfying alone. Platonism explains the feeling of discovery but struggles with how we access abstract objects. Formalism explains the rigor of proof but struggles with meaning and applicability. This tension has driven the development of several alternative philosophies of mathematics (logicism, intuitionism, structuralism) each attempting to resolve the debate from a different angle.

### `phys-em-08-c3` (fix, applied)

*Deleted the closing flourish 'held up for 160 years and counting'.*

**Before**

> EM theory is tested every day in technology: GPS satellites broadcast precisely timed microwaves; MRI flips proton spins with radio pulses and reads back the relaxation; CMB measurements probe the universe at 160 GHz. Wireless power transfer uses inductive (close range) or resonant (medium range) coupling. Metamaterials engineer effective permittivities and permeabilities far beyond natural values, enabling cloaking demonstrations and superlenses. The same equations Maxwell wrote in the 1860s drive every smartphone, every radar, every fiber-optic cable. They've held up for 160 years and counting.

**After**

> EM theory is tested every day in technology: GPS satellites broadcast precisely timed microwaves; MRI flips proton spins with radio pulses and reads back the relaxation; CMB measurements probe the universe at 160 GHz. Wireless power transfer uses inductive (close range) or resonant (medium range) coupling. Metamaterials engineer effective permittivities and permeabilities far beyond natural values, enabling cloaking demonstrations and superlenses. The same equations Maxwell wrote in the 1860s drive every smartphone, every radar, every fiber-optic cable.

### `pol-ins-05-c3` (fix, applied)

*Replaced the stock 'one of the central institutional debates' closing with 'is still debated'.*

**Before**

> The 20th century saw a sustained expansion of what is sometimes called the 'administrative state' : the network of executive-branch agencies that implement, interpret, and to some extent make law within the framework of legislative authorisation. The US independent regulatory agencies (Federal Reserve, FCC, SEC, FTC, EPA) are particular examples; equivalents exist across most advanced economies (the Bank of England, Ofcom, Bafin, AMF, the European Commission's directorates-general). The intellectual case for the administrative state rests on the limits of legislative competence. Modern industrial societies require regulation of activities (financial markets, telecommunications, pharmaceutical safety, environmental quality) whose technical complexity exceeds what legislators can effectively oversee. Delegating regulatory authority to expert agencies is the standard solution. The case against the administrative state: articulated by writers including Philip Hamburger ( Is Administrative Law Unlawful? , 2014), Gary Lawson , and the broader 'major questions doctrine' jurisprudence in the US, argues that delegation has gone too far, undermining democratic accountability and constitutional separation of powers. The contemporary US restructuring of the administrative state: Loper Bright's overturn of Chevron, the 'major questions doctrine' applied in cases like West Virginia v. EPA (2022), the 2025 Schedule F implementation, the substantial reductions in agency staffing under the Trump administration: represents one of the major institutional transformations underway in the late 2020s. The European response has been broadly opposite, with the EU AI Act, DSA, DMA, and other regulatory expansions extending agency authority. Which approach produces better outcomes (for democratic accountability, regulatory effectiveness, and economic performance) is one of the central institutional debates of the period, with implications well beyond either jurisdiction's borders.

**After**

> The 20th century saw a sustained expansion of what is sometimes called the 'administrative state' : the network of executive-branch agencies that implement, interpret, and to some extent make law within the framework of legislative authorisation. The US independent regulatory agencies (Federal Reserve, FCC, SEC, FTC, EPA) are particular examples; equivalents exist across most advanced economies (the Bank of England, Ofcom, Bafin, AMF, the European Commission's directorates-general). The intellectual case for the administrative state rests on the limits of legislative competence. Modern industrial societies require regulation of activities (financial markets, telecommunications, pharmaceutical safety, environmental quality) whose technical complexity exceeds what legislators can effectively oversee. Delegating regulatory authority to expert agencies is the standard solution. The case against the administrative state: articulated by writers including Philip Hamburger ( Is Administrative Law Unlawful? , 2014), Gary Lawson , and the broader 'major questions doctrine' jurisprudence in the US, argues that delegation has gone too far, undermining democratic accountability and constitutional separation of powers. The contemporary US restructuring of the administrative state: Loper Bright's overturn of Chevron, the 'major questions doctrine' applied in cases like West Virginia v. EPA (2022), the 2025 Schedule F implementation, the substantial reductions in agency staffing under the Trump administration: represents one of the major institutional transformations underway in the late 2020s. The European response has been broadly opposite, with the EU AI Act, DSA, DMA, and other regulatory expansions extending agency authority. Which approach produces better outcomes (for democratic accountability, regulatory effectiveness, and economic performance) is still debated, with implications well beyond either jurisdiction's borders.

### `phys-thermo-02-c2` (fix, applied)

*Replaced 'one of the most profound' with a direct statement of what the law says.*

**Before**

> The Second Law is one of the most profound in all of science: in any spontaneous process, the total entropy of the universe never decreases. Heat flows from hot to cold, not the reverse. Perfume spreads through a room but never spontaneously reconcentrates. These are the Second Law in action. No process can be 100% efficient at converting heat to work. Some energy is always 'wasted' as low-grade heat. This limits steam engines, power plants, and refrigerators alike.

**After**

> The Second Law says that in any spontaneous process, the total entropy of the universe never decreases. Heat flows from hot to cold, not the reverse. Perfume spreads through a room but never spontaneously reconcentrates. These are the Second Law in action. No process can be 100% efficient at converting heat to work. Some energy is always 'wasted' as low-grade heat. This limits steam engines, power plants, and refrigerators alike.

### `hist-pre-02-c2` (fix, flagged)

*Replaced the superlative 'most sophisticated writing system' with a plain statement that they wrote in a logosyllabic script.*  
Flags: names missing: Americas'

**Before**

> The Maya developed the Americas' most sophisticated writing system: a complex logosyllabic script. Inscriptions on stelae, codices, and pottery record dynasties, alliances, wars, rituals. Spanish missionaries destroyed nearly all Maya codices in the 16th century, considering them 'works of the devil'. Only four survive today. Decipherment progressed slowly through the 20th century, accelerating dramatically after Russian linguist Yuri Knorozov's insights in the 1950s. Today most Maya texts can be read.

**After**

> The Maya wrote in a logosyllabic script. Inscriptions on stelae, codices, and pottery record dynasties, alliances, wars, rituals. Spanish missionaries destroyed nearly all Maya codices in the 16th century, considering them 'works of the devil'. Only four survive today. Decipherment progressed slowly through the 20th century, accelerating dramatically after Russian linguist Yuri Knorozov's insights in the 1950s. Today most Maya texts can be read.

### `bio-mar-01-c1` (rewrite, flagged)

*Rewrote in full sentences with one bold term and fewer colons; deleted the kelp forest figure that does not show depth zones.*  
Flags: figure removed

**Before**

> The ocean is layered. The top ~200 m, the photic zone , gets enough sunlight for photosynthesis. Below 200 m: aphotic zone , where life relies on detritus from above (or chemosynthesis at hydrothermal vents). Deeper still: bathyal (200-2000 m), abyssal (2000-6000 m), and hadal (>6000 m). Pressure rises 1 atm per 10 m. Temperature drops to ~2-4 °C in the deep. Most ocean volume is dark, cold, and high-pressure. The abyss covers ~60% of Earth's surface area: by far the planet's largest habitat.

**After**

> The ocean is layered. The top ~200 m is the photic zone , where there is enough sunlight for photosynthesis. Below 200 m lies the aphotic zone, where life relies on detritus from above (or chemosynthesis at hydrothermal vents). Deeper still are the bathyal (200-2000 m), abyssal (2000-6000 m) and hadal (>6000 m) zones. Pressure rises 1 atm per 10 m, and temperature drops to ~2-4 °C in the deep. Most ocean volume is dark, cold and high-pressure. The abyss covers ~60% of Earth's surface area, by far the planet's largest habitat.

### `dl-07-c2` (fix, flagged)

*Replaced 'reshaped LLM training plans across the industry' with the concrete shift toward smaller models and more tokens.*  
Flags: names missing: LLM

**Before**

> Scaling laws describe how loss decreases as you scale model size N , dataset size D , and compute C . Kaplan et al. (2020) derived early laws and concluded that, given a compute budget, you should mostly scale model size and let data lag. Chinchilla (Hoffmann et al., 2022) re-ran the analysis with better training methodology and found the opposite: at equal compute, you should train smaller models on more tokens. The optimal ratio is roughly 20 tokens per parameter . Gopher (280B params, 300B tokens) was severely undertrained; Chinchilla (70B params, 1.4T tokens) outperformed it at equal compute. This single result reshaped LLM training plans across the industry. Modern open models pushed the ratio further. LLaMA 2 used about 28 tokens/param; LLaMA 3 70B used roughly 215 tokens/param (15T tokens). The reason: at inference time, smaller-but-trained-longer models are far cheaper to serve than larger-but-undertrained ones. The Chinchilla ratio is compute-optimal for training; for total lifetime cost (training + serving), undertraining is even worse. Scaling laws also predict where transitions occur (emergence of capabilities, where loss curves bend) and inform decisions worth millions of dollars per training run.

**After**

> Scaling laws describe how loss decreases as you scale model size N , dataset size D , and compute C . Kaplan et al. (2020) derived early laws and concluded that, given a compute budget, you should mostly scale model size and let data lag. Chinchilla (Hoffmann et al., 2022) re-ran the analysis with better training methodology and found the opposite: at equal compute, you should train smaller models on more tokens. The optimal ratio is roughly 20 tokens per parameter . Gopher (280B params, 300B tokens) was severely undertrained; Chinchilla (70B params, 1.4T tokens) outperformed it at equal compute. Training plans since then have shifted toward smaller models trained on more tokens. Modern open models pushed the ratio further. LLaMA 2 used about 28 tokens/param; LLaMA 3 70B used roughly 215 tokens/param (15T tokens). The reason: at inference time, smaller-but-trained-longer models are far cheaper to serve than larger-but-undertrained ones. The Chinchilla ratio is compute-optimal for training; for total lifetime cost (training + serving), undertraining is even worse. Scaling laws also predict where transitions occur (emergence of capabilities, where loss curves bend) and inform decisions worth millions of dollars per training run.

