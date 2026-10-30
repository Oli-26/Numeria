# Citation gap pass (cloud batches)

The Nous app (this repo) teaches about 300 topics. Every lesson is meant to carry sources: a `<sup class="cite">`
marker after a sentence, backed by a checked quote from a real source. Many lessons still have none. Your job is to
give each lesson in your batch **at least one, ideally two, verified citations** (in different concepts where
possible). You do not edit the app's lesson files; you write citation rows that are checked against the live page
and applied later by the maintainer.

Your batch number is in your prompt; `tools/gap/batches.json` lists, per batch, the topics and the uncited lessons.

## Steps, per topic

1. Read `wwwroot/data/<topic-id>/lessons.json`. Work only on the lessons listed for you (concept ids start with the
   lesson id, e.g. `hpre-03-c2`). Get each concept's plain text with
   `python3 -c "import sys,json; sys.path.insert(0,'tools/gap'); from plaintext import plain; [print(c['id'],'|',plain(c['contentHtml'])) for l in json.load(open('wwwroot/data/<topic-id>/lessons.json')) for c in l['concepts']]"`.
2. For each lesson pick specific, checkable claims: dates, numbers, names, who found or argued what, definitions
   stated as facts. A claim must be copied **exactly** from the concept's plain text (5 to 40 words, no `\(` maths).
3. Find a source that states the claim with WebSearch and WebFetch. Ask WebFetch for the exact sentence verbatim.
   One good page often supports several claims, so reuse pages.
4. Write rows to `gap-rows/<topic-id>/citations.json`, a JSON array of
   `{"concept_id", "claim", "quote", "url", "title", "container", "authors", "year", "doi"}`. `quote` is one or two
   sentences copied exactly from the page (no footnote markers, at most about 300 characters).
5. Run `python3 tools/gap/check_rows.py <topic-id>`. It fetches each page the way the final check does (plain HTTP, no
   JavaScript, robots.txt obeyed) and confirms the quote is on it. Fix or drop failing rows until all pass. A page
   that fails here is unusable even if WebFetch could read it.

## Sources

- Good: SEP and IEP; MacTutor; university, museum and government pages (NASA, NIST, NIH, NOAA, USGS, CDC, ONS);
  Nobel Prize pages; open-access papers (pmc.ncbi.nlm.nih.gov, PLOS, arXiv abstract pages); World History
  Encyclopedia; Encyclopedia.com; Smithsonian Magazine; Quanta; Project Gutenberg and archive.org texts.
- Never: Wikipedia or mirrors, Britannica, OpenStax (asks not to be ingested by AI) or LibreTexts copies of it, Q&A
  sites, Reddit, Medium, blogs, homework sites, AI-written pages, or facts seen only in a search snippet.

## When a source disagrees

Do not cite a claim that good sources contradict. Add it to `gap-rows/<topic-id>/contradicted.json` as
`{"concept_id", "claim", "source_says", "url", "quote"}`. Only clear factual errors.

## Rules

- Change nothing outside `gap-rows/`. Never commit `.gap-cache/`.
- Never use an em dash in anything you write.
- When done: commit `gap-rows/` on a new branch named `gap/batch-<N>` and push it. Do not open a pull request and do
  not touch main. Finish with a short report: per topic, rows passing and target lessons covered.
