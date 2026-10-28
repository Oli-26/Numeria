# Writing style: avoiding AI tells

Lessons should read like a knowledgeable person explaining something, not like a template being filled in. A user said a first lesson "felt AI-ish". When the whole corpus was measured (5,615 concepts across 290 topics, October 2026), the cause turned out to be structure and rhythm rather than vocabulary: em dashes were already gone and words like *delve*, *tapestry* and *realm* appear in under 4% of concepts.

Every writer and fact-checker brief should point here. The numbers show how common each tell was at the time of the audit; the goal is to bring them down, not to hit zero by mechanical find-and-replace.

## Voice

Nous sounds like a warm friend who has just learned something and wants to tell you about it. The enthusiasm lives in **what** they choose to tell you, not in excited wording. A model told to "sound enthusiastic" produces hype adjectives and exclamation marks, which are the strongest AI tells we measured, so the rules below are strict.

1. **Lead with the most interesting concrete thing.** A striking number, a strange detail or a person's story does the work an adjective can't.
2. **Talk to the reader.** Use "you" where it fits, contractions, and plain words. Introduce jargon only when it earns its place, and define it the first time.
3. **No hype words.** Not amazing, incredible, fascinating, mind-blowing, remarkable, stunning or beautiful-as-praise. No "Let's dive in", "Fun fact:", "Buckle up", "Here's the cool part" or "Isn't that cool?".
4. **No exclamation marks.** None. A quota of one per lesson turns into exactly one per lesson.
5. **Match the subject.** Warm but sober for disease, war, slavery and atrocities. For advanced topics the warmth comes from clarity and from showing why an idea matters. Lightness only where the material is light.
6. **Accuracy beats excitement.** No superlatives, "firsts" or "most important ever" claims unless a source backs them. Don't add a fact to make a passage livelier unless you can source it.
7. **Let the material set the shape.** Paragraph counts and list lengths follow the content, not a template.

The rewriting brief, with concrete moves and five worked examples across subjects, is [VOICE_BRIEF.md](VOICE_BRIEF.md).

### Voice examples

Technical topic. Before:

> A complex number has the form z = a + bi, where a is the real part, b is the imaginary part, and i is the square root of -1. The Argand plane (or complex plane) plots complex numbers as points: the horizontal axis is the real part, the vertical axis is the imaginary part. So z = 3 + 2i sits at the point (3, 2). This simple idea, treating numbers as points in a plane, unlocks an entire universe of mathematics that is impossibly beautiful.

After:

> A complex number looks like z = a + bi. The a is its real part, b is its imaginary part, and i is the square root of −1. The easiest way to picture one is as a point on a flat map, with the real part along the horizontal axis and the imaginary part up the vertical. So z = 3 + 2i sits at the point (3, 2). That map is called the Argand plane, or the complex plane, and most of this topic happens on it.

Grave topic. Before:

> … Crucially, Britain compensated slave owners for their 'loss of property', £20 million (equivalent to roughly £17 billion today), but provided nothing to the formerly enslaved. This compensation was financed by government debt not fully paid off until 2015.

After:

> When Britain abolished slavery, it paid compensation to the slave owners for their "loss of property": £20 million, roughly £17 billion today. The people who had been enslaved received nothing. The government borrowed the money, and that debt was not fully paid off until 2015.

No hype, no "crucially". The facts are allowed to land on their own.

## The ten signs

### 1. Everything comes in threes
88% of lessons have exactly 3 concepts, 68% of concepts are exactly 3 paragraphs, and 47% contain an "X, Y, and Z" list. Readers feel the template even when they can't name it.

**Fix:** let the material decide the length. Some concepts need one paragraph, some need five. Use lists of two or four when that is what the facts give you.

### 2. Recap rhetoric
34% of concepts end on a short, quotable line that restates the point; 5% use openers such as "This is why…", "This means…" or "The key idea is…".

> The membrane is less a wall and more a sophisticated checkpoint.

**Fix:** end on a concrete fact, an example or a genuine open question, or just stop. Trust the reader to have understood the paragraph they just read.

### 3. Colons everywhere
1.68 colons per 100 words, four to eight times the rate in normal edited prose. Some of this is a scar from the em-dash purge, which swapped dashes for colons.

> Every cell is enclosed by a cell membrane: a double layer of fat molecules…

**Fix:** write plain sentences ("called", "which", brackets). At most one colon per paragraph, and only before a list or a formal definition.

### 4. Hype adjectives
*Fascinating, remarkable, elegant, sophisticated, surprisingly, powerful* appear in 10% of concepts.

> Many materials have surprisingly rich phase diagrams.

**Fix:** delete the adjective and state the fact that would make the reader surprised.

### 5. Asserting importance instead of showing it
*Crucial, essential, vital, fundamental, key* appear in 7.5% of concepts.

> This control is essential…

**Fix:** say what goes wrong without it. Technical uses ("essential amino acids", "public key") are fine.

### 6. Stock metaphors
*Powerhouse, power plant, blueprint, energy currency, control centre, building blocks, workhorse.* Only 3.5% overall but bunched in beginner topics: the first Cell Biology lesson uses four.

**Fix:** one fresh, specific comparison, or none.

### 7. "Not X, but Y" reframes
*Not merely, not just, isn't X it's Y, less X more Y* appear in about 4% of concepts. They argue against a view nobody held.

> Power, for Foucault, is not only repressive, it is productive.

**Fix:** state Y directly.

### 8. Rhetorical questions answered immediately
In 9% of concepts.

> Why these and not others? Three is the smallest count that…

**Fix:** keep a question only if a reader would genuinely wonder it at that point. Otherwise make it a statement.

### 9. Bold confetti
About 3 bold phrases per concept on average; 34% have four or more. When everything is emphasised, nothing is.

**Fix:** bold only the term being defined, usually once per concept.

### 10. Signs nobody proofread it
Figures that don't match their concept (a DNA double helix illustrating "The Cell Membrane"; a karyotype illustrating "DNA Replication"), and comma splices left behind by scripted edits ("This control is essential, without it, cell contents…").

**Fix:** check every figure against its concept by eye, and re-read any passage a script has touched.

## Worked example

Before (first concept of Cell Biology, showing six of the ten):

> Every cell is enclosed by a **cell membrane**: a double layer of fat molecules called a *phospholipid bilayer*. It's **selectively permeable**: small molecules like oxygen and water cross freely, but large or charged molecules need special transport proteins. This control is essential, without it, cell contents would simply diffuse into the surroundings. Embedded in the membrane are proteins acting as channels, pumps, receptors, and ID badges. The membrane is less a wall and more a sophisticated checkpoint.

After (same facts):

> Every cell is wrapped in a membrane made of two layers of fat molecules, called the **phospholipid bilayer**. Small molecules such as oxygen and water pass straight through it. Larger or charged ones, like sugars and salt ions, can only cross through proteins set into the membrane. Some are open channels; others are pumps that use energy. Without that control, everything inside the cell would drift out.

## Checklist before a lesson ships

- Does the length follow the material, or is it three of everything?
- Does any concept end by restating itself?
- More than one colon in a paragraph?
- Any adjective telling the reader how to feel?
- Any "crucial/essential/vital" that could become a consequence?
- Any stock metaphor?
- Any "not X, but Y" with an X nobody believed?
- Any question the next sentence answers?
- More than one bold term per concept?
- Does every figure show what its concept is about?
