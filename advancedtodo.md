# Advanced Tier Backlog (Tier 4 / Tier 5)

Carry-over from the curated 20-topic plan after pausing mid-build. **9 done, 11 remaining.**

## Done (9)

| # | Topic | Tier | Domain |
|---|-------|------|--------|
| 1 | `math-langlands-intro` | 4 | math |
| 2 | `physics-lattice-qft` | 4 | physics |
| 3 | `physics-holography-adscft` | 4 | physics |
| 4 | `physics-topological-phases` | 4 | physics |
| 5 | `cs-theoretical-ml` | 4 | cs |
| 6 | `cs-geometric-dl` | 4 | cs |
| 7 | `bio-aging-biology` | 4 | biology |
| 8 | `chem-single-molecule-spec` | 4 | chemistry |
| 9 | `math-operator-algebras` | 4 | math |

## Remaining — Tier 4 (3)

| Topic | Domain | Prereqs | Notes |
|-------|--------|---------|-------|
| `mat-topological-materials` | materials | `mat-structure`, `physics-condensed-matter`, `physics-topological-phases` | Topological insulators, Weyl/Dirac semimetals, k-theory classification, real materials (Bi₂Se₃, HgTe, TaAs) |
| `philosophy-formal-epistemology` | philosophy | `philosophy-epistemology`, `philosophy-logic`, `probability` | Bayesian epistemology, dynamic epistemic logic, peer disagreement, modeling rational belief |
| `bio-comp-neuro-deep` | biology | `bio-neuroscience`, `bio-comp-neuro` (Tier 3, doesn't exist yet — substitute `cs-deep-learning` or `differential-equations`) | Hodgkin-Huxley deep, spiking nets, NEST/Brian2, attractor networks, predictive processing |

## Remaining — Tier 5 (8)

Tier 5 = open-problem tours. More essay-shape than skill-shape; lessons can be 4-6 of pure exposition + question types skewed to ConceptMatch/FillIn over MultipleChoice.

| Topic | Domain | Anchor question |
|-------|--------|------------------|
| `math-riemann-hypothesis` | math | Where do non-trivial zeros of ζ(s) lie? Most-wanted unsolved. |
| `math-p-vs-np` | math | Is finding answers fundamentally harder than checking them? Barriers themselves are theorems. |
| `physics-quantum-gravity-approaches` | physics | Strings vs LQG vs Causal Sets vs Asymptotic Safety — comparative tour. |
| `physics-foundations-of-qm` | physics | Many-Worlds, Bohmian, QBism, GRW, Copenhagen — same predictions, different ontology. |
| `bio-consciousness-substrate` | biology | IIT vs GWT vs HOT — adversarial collaborations slowly distinguishing them. |
| `cs-agi-alignment` | cs | Subproblems: interpretability, scalable oversight, deception detection. Empirical and conceptual. |
| `philosophy-hard-problem-consciousness` | philosophy | Why is there *something it is like* to see red? Even a perfect brain map doesn't obviously explain it. |
| `geo-ocean-worlds-biosignatures` | geology | Europa Clipper era. What chemical pattern would actually count as evidence? |

## Format reminder

For each remaining topic, the agent prompt template that worked is:
- 5-7 lessons, 3 concepts each, 150-250 words contentHtml
- 8 questions per lesson, skewed harder (mostly difficulty 2-3)
- xpReward 140-200 lessons, 25-40 questions
- Heavy LaTeX double-escaped where domain warrants (math/physics)
- Tier 5: lessons can be 4-6, more essay-shape; difficulty stays in 2-3 range
- Each agent returns: TOPICS_JSON_ENTRY, TOPIC_GRAPH_NODE, TOPIC_GRAPH_EDGES
- New icon per topic (note in agent return for integration)

## How to resume

Spawn one agent per topic (the proven low-burn pattern). Prereqs must reference existing graph nodes — check `topic-graph.json` before declaring; substitute or skip dangling ones.

After each agent returns, integrate via Python script:
```python
import json
t = json.load(open('wwwroot/data/topics.json'))
t.append({...new topic entry...})
# similar for topic-graph.json nodes + edges
# add icon SVG to Components/Icon.razor
```

Cumulative state when paused: **207 topics** (9 Tier 4), **189 graph nodes**, **375 edges**, no dangling refs.
