# Voice pass progress

Lesson 1 of every topic, rewritten with [VOICE_BRIEF.md](../VOICE_BRIEF.md) and checked by a reviewer against the original.

- Batches finished: **88 of 88** (3 lessons each), plus the 10-lesson trial
- Concepts: applied 841, flagged 40, unchanged 15
- Review verdicts: ok 788, fixed 76
- Next batch: none, the pass is complete

## Resuming in a new session

Tooling and inputs live in `~/.local/share/nous-voice-pass/`. Batches are numbered in `batch_lessons.json`; a batch counts as done once all its lessons appear in `changes.jsonl`. To resume, run the workflow script `~/.local/share/nous-voice-pass/nous-voice-chunk.js` (args: dir = that folder's `batches`, start, count, guide, brief) for the remaining batches, then `python3 ~/.local/share/nous-voice-pass/apply_full.py <journal> --merge` and `python3 ~/.local/share/nous-voice-pass/progress.py`.

Remaining batches: none
