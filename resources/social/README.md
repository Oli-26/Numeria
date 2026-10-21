# Social posts

Turns app content into ready-to-post images for TikTok, Instagram, X and Reddit.

```
node resources/social/render.mjs --zip           # every post, both sizes, plus out/nous-posts.zip
node resources/social/render.mjs cargo-cults     # one post
node resources/social/render.mjs --cookies 12 history   # 12 single-image fact cards from the history cookies
```

Output (git-ignored) is sorted by posting order:
- `out/tiktok/01-<id>/01-<id>-01.png`: 1080x1920, TikTok photo mode
- `out/feed/01-<id>/...`: 1080x1350, Instagram, X and Reddit
- `out/captions/01-<id>.txt`: caption and hashtags, X post, Reddit title, links

Files are dated a second apart in that order, so phone galleries show them in sequence after unzipping.

## Post files

`posts/<id>.json`:

```json
{
  "id": "cargo-cults",
  "order": 1,
  "topicId": "religion-cargo-cults",
  "lessonIds": ["rcrg-01"],
  "slides": [
    { "kicker": "Cargo Cults", "title": "The hook, under 70 characters" },
    { "title": "Short slide heading", "body": "One idea, under 230 characters." }
  ],
  "caption": "TikTok / Instagram caption",
  "hashtags": ["history", "anthropology"],
  "xPost": "Under 270 characters",
  "redditTitle": "A plain, accurate title"
}
```

The first slide is the cover. The renderer adds a final slide pointing to the topic in Nous.
Every claim must come from the app's own lessons (which are fact-checked); no em dashes; US spelling.
