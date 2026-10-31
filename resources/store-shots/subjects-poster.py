# Writes posters/subjects.html: every subject as a disc on two rings round the Nous mark, joined by the app's real
# cross-subject topic links (topic-graph.json). The most linked subjects take the inner ring; slots are ordered to keep
# linked subjects close. Usage: python3 subjects-poster.py  (then node compose.mjs)
import json, math, os, random, re, collections
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HERE, '..', '..'))
data = lambda p: json.load(open(os.path.join(APP, 'wwwroot', 'data', p)))

domains = data('domains.json')
hues = dict(re.findall(r'"(\w+)" => "(#[0-9A-Fa-f]{6})"', open(os.path.join(APP, 'Models/SubjectHues.cs')).read()))
icons = dict(re.findall(r'^\s*"([\w-]+)" => "(.*?)",\s*$', open(os.path.join(APP, 'Components/Icon.razor')).read(), re.M))
mark = open(os.path.join(APP, 'wwwroot', 'nous-icon.svg')).read()
short = {'cs': 'Computing', 'materials': 'Materials', 'politics': 'Politics', 'misc': 'Esoterica'}
topic_dom = {t['id']: t['domain'] for t in data('topics.json')}
topics = collections.Counter(topic_dom.values())
links = collections.Counter()
for e in data('topic-graph.json')['edges']:
    a, b = topic_dom.get(e['from']), topic_dom.get(e['to'])
    if a and b and a != b and 'scratch' not in (a, b): links[tuple(sorted((a, b)))] += 1
degree = collections.Counter()
for (a, b), n in links.items(): degree[a] += n; degree[b] += n

W, H, CX, CY = 1080, 1920, 540, 1030
R_IN, R_OUT, DISC = (222, 290), (418, 505), 54  # (x, y) radii: the rings are ovals to use the tall frame
ids = [d['id'] for d in domains]
inner = sorted(ids, key=lambda i: -degree[i])[:6]
outer = [i for i in ids if i not in inner]
ring = lambda r, n, off: [(CX + r[0] * math.cos(off + 2 * math.pi * k / n - math.pi / 2), CY + r[1] * math.sin(off + 2 * math.pi * k / n - math.pi / 2)) for k in range(n)]
slots_in, slots_out = ring(R_IN, len(inner), math.pi / len(inner)), ring(R_OUT, len(outer), 0)

def cost(order_in, order_out):
    pos = {**dict(zip(order_in, slots_in)), **dict(zip(order_out, slots_out))}
    return sum(n * math.dist(pos[a], pos[b]) for (a, b), n in links.items())
random.seed(7)
best = (cost(inner, outer), inner[:], outer[:])
for _ in range(40000):
    oi, oo = best[1][:], best[2][:]
    lst = oi if random.random() < 0.3 else oo
    i, j = random.sample(range(len(lst)), 2); lst[i], lst[j] = lst[j], lst[i]
    c = cost(oi, oo)
    if c < best[0]: best = (c, oi, oo)
pos = {**dict(zip(best[1], slots_in)), **dict(zip(best[2], slots_out))}

top = max(links.values())
edges = []
for k, ((a, b), n) in enumerate(sorted(links.items(), key=lambda x: x[1])):
    (x1, y1), (x2, y2) = pos[a], pos[b]
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    qx, qy = mx + (CX - mx) * 0.35, my + (CY - my) * 0.35  # bow each link towards the centre
    w = 1.6 + 7 * (n / top) ** 0.6
    op = 0.14 + 0.56 * (n / top) ** 0.5
    edges.append(f'<linearGradient id="g{k}" gradientUnits="userSpaceOnUse" x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y2:.0f}">'
                 f'<stop offset="0" stop-color="{hues[a]}"/><stop offset="1" stop-color="{hues[b]}"/></linearGradient>'
                 f'<path class="edge" data-a="{a}" data-b="{b}" data-n="{n}" d="M{x1:.0f},{y1:.0f} Q{qx:.0f},{qy:.0f} {x2:.0f},{y2:.0f}" stroke="url(#g{k})" stroke-width="{w:.1f}" stroke-opacity="{op:.2f}" fill="none" stroke-linecap="round"/>')

nodes = []
for d in domains:
    x, y = pos[d['id']]; hue = hues.get(d['id'], '#5B6ABF')
    name = short.get(d['id'], d['name'])
    nodes.append(f'<g class="node" data-id="{d["id"]}" transform="translate({x:.0f},{y:.0f})">'
                 f'<circle r="{DISC + 7}" fill="#FBF8F2" filter="url(#sh)"/><circle r="{DISC}" fill="{hue}"/>'
                 f'<svg x="-27" y="-27" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" style="color:#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{icons.get(d["icon"], "")}</svg>'
                 f'<text y="{DISC + 40}" class="nm">{name}</text><text y="{DISC + 70}" class="ct">{topics[d["id"]]} topics</text></g>')

inner_mark = re.sub(r'^.*?<svg[^>]*>', '', mark, flags=re.S).rsplit('</svg>', 1)[0]
vb = re.search(r'viewBox="([^"]+)"', mark).group(1)
font = os.path.join(HERE, 'fonts', 'fraunces-latin-600-normal.woff2')
total_topics = sum(topics.values())
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:'Fraunces';font-weight:600;src:url('file://{font}') format('woff2')}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden}}
body{{background:radial-gradient(1000px 800px at 50% 8%, #FBF8F2 0%, #F4EFE6 55%, #EAE3D7 100%);font-family:'Noto Sans',sans-serif;position:relative}}
.cap{{position:absolute;left:70px;right:70px;top:118px;text-align:center}}
h1{{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:84px;line-height:1.06;color:#2A211B;letter-spacing:-0.01em;text-wrap:balance}}
h1 em{{font-style:normal;color:#B4552F;white-space:nowrap}}
p{{margin-top:26px;font-size:38px;line-height:1.3;color:#5A4D42;font-weight:500;text-wrap:balance}}
svg.map{{position:absolute;left:0;top:0}}
.nm{{font:600 25px 'Noto Sans',sans-serif;fill:#2A211B;text-anchor:middle;paint-order:stroke;stroke:#F2ECE2;stroke-width:9px;stroke-linejoin:round}}
.ct{{font:500 21px 'Noto Sans',sans-serif;fill:#7A6B5E;text-anchor:middle;paint-order:stroke;stroke:#F2ECE2;stroke-width:8px;stroke-linejoin:round}}
.badge{{position:absolute;left:50%;transform:translateX(-50%);bottom:64px;display:flex;align-items:center;gap:22px;padding:22px 40px 22px 24px;
  background:#FBF8F2;border:3px solid #C8562B;border-radius:999px;box-shadow:0 14px 34px rgba(70,45,25,.18);white-space:nowrap}}
.badge .d{{width:74px;height:74px;border-radius:50%;background:#C8562B;display:flex;align-items:center;justify-content:center}}
.badge b{{display:block;font:600 34px 'Fraunces',Georgia,serif;color:#2A211B}}
.badge span{{font-size:25px;color:#5A4D42}}
</style></head><body>
<div class="cap"><h1>Nineteen subjects, <em>all connected</em></h1><p>Over {total_topics // 100 * 100} topics, linked into one map of knowledge</p></div>
<svg class="map" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs><filter id="sh" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#46301c" flood-opacity=".22"/></filter></defs>
<ellipse cx="{CX}" cy="{CY}" rx="{R_OUT[0]}" ry="{R_OUT[1]}" fill="none" stroke="#2A211B" stroke-opacity=".07" stroke-width="2" stroke-dasharray="3 10"/>
<ellipse cx="{CX}" cy="{CY}" rx="{R_IN[0]}" ry="{R_IN[1]}" fill="none" stroke="#2A211B" stroke-opacity=".07" stroke-width="2" stroke-dasharray="3 10"/>
<clipPath id="mk"><circle cx="{CX}" cy="{CY}" r="74"/></clipPath>
{''.join(edges)}
<circle cx="{CX}" cy="{CY}" r="92" fill="#FBF8F2" filter="url(#sh)"/>
<g clip-path="url(#mk)"><svg x="{CX - 84}" y="{CY - 84}" width="168" height="168" viewBox="{vb}">{inner_mark}</svg></g>
{''.join(nodes)}
</svg>
<div class="badge"><div class="d"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" style="color:#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">{icons.get("fire", "")}</svg></div>
<div><b>Plus From Scratch</b><span>A survival course: fire to electricity</span></div></div>
</body></html>'''
open(os.path.join(HERE, 'posters', 'subjects.html'), 'w').write(html)
print('inner', best[1]); print('outer', best[2]); print('links', len(links), 'topics', total_topics)
