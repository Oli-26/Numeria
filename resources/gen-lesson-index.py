"""Writes wwwroot/data/lesson-index.json: lesson ids per topic, in lesson order.
Home reads this instead of every lessons.json to show progress. Rerun after adding or removing lessons
(ContentDataTests fails while it is stale)."""
import json, os

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'wwwroot', 'data')
index = {}
for t in json.load(open(os.path.join(DATA, 'topics.json'))):
    path = os.path.join(DATA, t['id'], 'lessons.json')
    if os.path.exists(path):
        index[t['id']] = [l['id'] for l in sorted(json.load(open(path)), key=lambda l: l['order'])]
with open(os.path.join(DATA, 'lesson-index.json'), 'w') as f:
    json.dump(index, f, separators=(',', ':'))
print(f'{len(index)} topics, {sum(map(len, index.values()))} lessons')
