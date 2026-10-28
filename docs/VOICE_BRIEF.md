# Voice pass brief

This is the brief for rewriting lessons in the Nous voice. It builds on [WRITING_STYLE.md](WRITING_STYLE.md), which defines the voice and the ten AI tells. Read that first.

## Why a second pass

The 5.0 pass removed the tells (colons in lesson 1s fell from 2.23 to 0.52 per 100 words, punchline closers and mismatched figures are gone) but the voice stayed flat: the share of lesson 1 concepts that speak to the reader barely moved (176 to 183 of 894). The brief told writers what not to do and asked them to keep every fact, so they played safe. This brief gives them **moves to make**, with worked examples, while keeping the fact rules exactly as strict.

## Moves

1. **Open on the most concrete thing already in the material.** A number, a place, a person, a moment. If it is buried in paragraph three, bring it to the front.
2. **Put the reader in it.** "Every cell in your body", "you've met numbers on a line". Most concepts should speak to the reader at least once. Grave subjects are the exception (move 10).
3. **Plain idea first, term second.** "a double layer of fat molecules, called the phospholipid bilayer", not "the phospholipid bilayer is a double layer of fat molecules".
4. **Use the lesson's own example instead of placeholders.** If the lesson talks about wine and cloth, don't say "X and Y".
5. **Unpack jargon with an everyday gloss.** "(3, 2), three steps right and two up." A gloss explains what is already there. It never adds a number, name, date or claim.
6. **Contractions and active verbs.** It's, doesn't, wasn't. Wraps, carries, switches on, rather than "is enclosed by" or "is transported".
7. **Vary the rhythm.** Let a short sentence land after a long one, now and then. Not in every paragraph.
8. **End on a fact, an example or a bridge to the next idea.** Never on a summary of what was just said.
9. **Bold each defined term once.** Usually that is one term per concept.
10. **Grave subjects stay plain.** Disease, war, slavery, genocide: specific, sober, no "you", no flourishes. Let the facts carry the weight.

## Hard rules (unchanged)

- **Facts are fixed.** Keep every number, name, date, term and example. Add none, even true ones. Reordering, merging, splitting and cutting filler are fine.
- **Framing must not widen a claim.** "Put the reader in it" is where facts slip. The trial turned "DNA stores hereditary information in all known life" into "Every cell in your body stores its hereditary information as DNA", which is false (mature red blood cells have none). Say "your cells", not "every cell in your body", unless the original already makes the universal claim.
- Keep every `<figure>` block, maths expression, entity, link and attribute exactly as it is.
- No em dashes, no exclamation marks (factorials such as n! are fine), at most one colon per paragraph.
- No hype words, no "Here's…", "Let's…", "Fun fact", and no question that the next sentence answers.

## Self-check before returning a concept

- Does the first sentence contain something concrete?
- Is the reader addressed at least once (unless the subject is grave)?
- Is there at least one contraction?
- Is every number, name and date from the original still there, and nothing new added?
- Is the last sentence a fact, an example or a bridge, not a recap?

## Worked examples

Each "before" is the live 5.0 text. Each "after" uses only facts already in it.

### Beginner science: The Cell Membrane (`bio-cell-01-c1`)

Before:

> Every cell membrane is a double layer of fat molecules, called a phospholipid bilayer, that wraps the whole cell. The membrane is selectively permeable. Small molecules like oxygen and water cross freely, but large or charged molecules need special transport proteins. Without that control, cell contents would diffuse into the surroundings. Embedded in the membrane are proteins that act as channels, pumps, receptors, and ID badges.

After:

> Every cell in your body is wrapped in a membrane, a double layer of fat molecules called the **phospholipid bilayer**.
>
> It's choosy about what gets through. Small molecules like oxygen and water cross freely, but large or charged ones can't get in or out without help from special transport proteins. Without that control, everything inside the cell would diffuse away into its surroundings.
>
> Those proteins sit right in the membrane and do different jobs. Some are channels, some are pumps, some are receptors, and some work like ID badges.

Moves: 2 (your body), 3 (plain idea, then the term), 6 (choosy, can't), 8 (ends on the ID badges, not a summary).

### Astronomy: Star Formation (`phys-astro-01-c1`)

Before:

> Stars form when cold molecular gas clouds, mostly hydrogen, collapse under gravity. As the cloud collapses it heats up, and if the core reaches ~10 million K, hydrogen fusion ignites and the star begins its life. The Hertzsprung-Russell (HR) diagram plots stellar luminosity (brightness) against surface temperature. …

After:

> A star starts as a cold cloud of gas, mostly hydrogen, collapsing under its own gravity. As it falls inward it heats up, and if the core reaches about 10 million K, hydrogen fusion switches on. That's when the star begins its life.
>
> Astronomers sort stars with the **Hertzsprung-Russell diagram**, which plots how bright a star is against how hot its surface is. Most stars land on one diagonal band, the main sequence, running from cool, dim red stars to hot, bright blue ones. Where a star sits on that band comes down almost entirely to its mass.
>
> The Sun is a middle-aged G-type star on the main sequence, a yellow dwarf. It's more massive than most stars, because most stars are small red dwarfs.

Moves: 1 (the collapsing cloud), 5 ("how bright … how hot" glosses luminosity and temperature), 6 (switches on, sort, land). Kept: ~10 million K, G-type, yellow dwarf, red dwarfs.

### Economics: Comparative Advantage (`econ-intl-01-c1`)

Before:

> A country has an absolute advantage when it can produce more of something with the same resources than another country can. In Ricardo's example, Portugal has an absolute advantage over England in both wine and cloth. … Every hour spent producing X is an hour not spent producing Y, so even a country that is more productive at both should specialize in the one where its advantage is relatively larger.

After:

> In 1817 Ricardo showed that two countries can both gain from trade even when one of them is better at producing everything.
>
> His example was Portugal and England. With the same resources, Portugal could make more wine and more cloth than England, which gave it an **absolute advantage** in both.
>
> What matters is opportunity cost. Every hour Portugal spends making cloth is an hour it doesn't spend making wine. A country has a **comparative advantage** in a good when it gives up less to produce it than the other country does. So even a country that's more productive at both should specialize where its lead is relatively larger.

Moves: 1 (opens on Ricardo's surprising result instead of a definition), 4 (wine and cloth instead of X and Y), 3 (the idea, then the term), 9 (two terms are defined, so two are bold).

### Maths: The Argand Plane (`cx-01-c1`)

Before:

> A complex number looks like z = a + bi. The a is its real part, b is its imaginary part, and i is the square root of -1. Complex numbers can be plotted as points on a plane, with the real part along the horizontal axis and the imaginary part up the vertical axis. So z = 3 + 2i sits at the point (3, 2). This plane is called the Argand plane, or the complex plane.

After:

> You've met numbers on a line. Complex numbers need a whole plane.
>
> A complex number looks like z = a + bi, where a is the real part, b is the imaginary part, and i is the square root of −1. To picture one, treat it as a point, with the real part along the horizontal axis and the imaginary part up the vertical. So z = 3 + 2i is the point (3, 2), three steps right and two up. That flat map of numbers is called the **Argand plane**, or the complex plane.

Moves: 2 (you've met), 7 (two short sentences, then a long paragraph), 5 (three steps right and two up).

### Grave subject: Abolition (`hist-ind-04-c3`)

Before:

> The Industrial Revolution's prosperity rested partly on enslavement. The transatlantic slave trade had transported approximately 12.5 million Africans to the Americas between 1500 and 1870; perhaps 1.8 million died in transit (the Middle Passage). … Britain compensated slave owners for their 'loss of property', £20 million (equivalent to roughly £17 billion today), but provided nothing to the formerly enslaved. This compensation was financed by government debt not fully paid off until 2015.

After:

> Part of the Industrial Revolution's wealth was built on slavery. Between 1500 and 1870, the transatlantic slave trade carried about 12.5 million Africans to the Americas, and perhaps 1.8 million of them died on the crossing known as the Middle Passage.
>
> Britain abolished the slave trade in 1807, largely through the campaigns of William Wilberforce and formerly enslaved activists such as Olaudah Equiano, and ended slavery across its empire in 1833. In the United States, slavery ended after the Civil War (1861–1865) with the 13th Amendment in 1865.
>
> When Britain abolished slavery, it paid the slave owners £20 million for their 'loss of property', roughly £17 billion today. The people who had been enslaved received nothing. The government borrowed the money, and the debt wasn't fully paid off until 2015.

Moves: 10 (no "you", no flourish), 6 (carried, ended, borrowed), 7 ("The people who had been enslaved received nothing." stands alone). Every figure and date is kept.

## Scope for the next pass

- **Voice:** lesson 1 of every topic (894 concepts), rewritten again from the live 5.0 text with this brief.
- **Repairs:** the 295 changes flagged in the 5.0 pass, checked against their originals in `docs/ai-tells/changes.jsonl`, restoring any dropped facts.
- **Measures for the review swarm:** reader addressed (unless grave), contractions present, every number, name and date retained, no new ones, and the WRITING_STYLE checklist.
