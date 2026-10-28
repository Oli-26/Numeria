# Citation strategy

Goal: inline citations for the factual claims in lessons, so readers can check what they read. Every citation must be real and must actually say what it is cited for; a fake or mismatched citation is worse than none.

## What readers see

- A small superscript number after a cited claim: `<sup class="cite" data-cite="N">N</sup>` in `contentHtml`.
- Tapping it opens a card (`wwwroot/js/cite.js`) with the reference, the supporting sentence from the source, and "Open source".
- Each section ends with a collapsible "Sources (N)" list (`Pages/LessonPage.razor`).
- Citation data lives in `wwwroot/data/<topic>/citations.json` (concept id → list of citations), merged by `ContentRepository.ApplyCitations`. It is only fetched when a topic's lessons contain markers.
- Text-to-speech skips the markers; the voice brief tells rewrites to keep each marker with its claim.

## Pipeline (per chunk)

1. **Finder** (Sonnet, WebSearch and WebFetch): per concept, picks the 1 to 3 claims that most need a source (numbers, dates, attributions, quotes, surprising claims), quotes each claim exactly from the lesson, opens a reputable source and copies a supporting sentence word for word. Reports unsourced claims and claims a source contradicts.
2. **Reviewer** (Sonnet, independent): re-opens every source and accepts only if it exists, is reputable, contains the quote and supports the claim exactly.
3. **Script** (`apply_cite.py`): claim is an exact substring of the lesson; source domain is not banned (Wikipedia, blogs, Q&A sites, content farms); DOI resolves in Crossref with matching title and year; the quote appears on the live page or PDF. Only citations passing reviewer and script are applied. Markers are inserted after the claim (past closing tags and punctuation) and numbered in reading order.

## Pilot results (10 first lessons, 32 sections)

- 41 proposed, 26 accepted (63%); 20 of 32 sections got at least one citation. Report: `PILOT.md`.
- 2 claims contradicted by sources, both fixed (gene count; Krstić ruling).
- Reviewer rejections often show lesson wording that goes further than its sources; together with the 33 unsourced claims these are candidates for softer wording.
- Cost: about 0.95M agent tokens per 10 lessons.

## Full run (not started)

- Scope: lesson 1 of every remaining topic: 264 lessons, 864 sections. About 25M agent tokens, so several 5-hour windows.
- Chunks: 10 lessons per chunk (finder and reviewer per lesson). After each chunk, run the apply step, then the next chunk. The batch builder skips lessons that already have citations, so a stopped run resumes cleanly.
- Planned additions: a second search round for unsourced claims, and an accuracy pass that fixes contradicted claims and softens overstated wording as they turn up.

## How to run a chunk

Tooling lives in `~/.local/share/nous-cite/` (`plaintext.py`, `build_batches.py`, `apply_cite.py`, `nous-citation-chunk.js`).

```
python3 ~/.local/share/nous-cite/build_batches.py ~/.local/share/nous-cite/full first-lessons
# Workflow: scriptPath ~/.local/share/nous-cite/nous-citation-chunk.js
#   args { dir: "~/.local/share/nous-cite/full/batches" (absolute path), start: 0, count: 10 }
python3 ~/.local/share/nous-cite/apply_cite.py <workflow journal.jsonl> ~/.local/share/nous-cite/full/concepts.json docs/citations/CHUNK-<n>.md
```

Rebuild the batches at the start of each session (lessons may have changed), and re-check contradicted claims by hand before editing lessons. Network steps (the apply script's Crossref and page checks) need the sandbox disabled.
