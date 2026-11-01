# Builds out/memory.html: a 16.5 s "coming soon" teaser for the Memory Palace course, driven by window.setT(t).
# A shuffled spread of cards, each card walked into a room of a house, the card-to-picture system, the course map,
# then the end card. Every claim is from the course's own cited lessons (memory-loci, memory-cards).
# On-screen text uses US spelling, like the social posts (resources/social/README.md).
# Usage: python3 memory.py && node render-anim.mjs out/memory.html 16.5 ~/Videos/Nous/nous-memory-palace.mp4
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'store-shots', 'fonts')

# The first eight cards walk the route; their pictures follow the course's card system (memory-cards).
CARDS = [('7', '♥', 'rock'), ('K', '♠', 'pirate'), ('A', '♣', 'cat'), ('Q', '♥', 'bride'), ('5', '♦', 'doll'),
         ('9', '♣', 'cop'), ('2', '♠', 'snow'), ('J', '♦', 'jewel thief'),
         ('10', '♥', ''), ('5', '♣', ''), ('8', '♦', ''), ('3', '♠', ''), ('6', '♥', '')]
# Floor plan in page pixels: the plan's box starts at (90, 470) and is 900 x 960.
PX, PY = 90, 470
LOCI = [(450, 905), (150, 800), (150, 450), (225, 185), (675, 185), (750, 450), (750, 800), (450, 495)]
ROOMS = [(0, 0, 450, 340, 'Bedroom'), (450, 0, 450, 340, 'Study'), (0, 340, 300, 300, 'Dining'),
         (300, 340, 300, 300, 'Stairs'), (600, 340, 300, 300, 'Utility'), (0, 640, 300, 320, 'Lounge'),
         (300, 640, 300, 320, 'Hall'), (600, 640, 300, 320, 'Kitchen')]
SKILLS = [('First rooms', ['How Memory Works', 'Vivid Images', 'Your First Palace']),
          ('Systems', ['Numbers', 'Names and Words', 'Card Images']),
          ('The whole deck', ['The Art of Memory', 'The Whole Deck'])]

red = lambda s: s in '♥♦'
cards = ''.join(f'<div class="card{" red" if red(s) else ""}" id="c{i}"><b>{r}</b><i>{s}</i><span>{s}</span></div>'
                for i, (r, s, _) in enumerate(CARDS))
labels = ''.join(f'<div class="lbl" id="l{i}" style="left:{PX + x}px;top:{PY + y + 30}px">{w}</div>'
                 for i, ((_, _, w), (x, y)) in enumerate(zip(CARDS, LOCI)))
rooms = ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}"/><text x="{x + 18}" y="{y + 36}">{n}</text>' for x, y, w, h, n in ROOMS)
route = 'M' + ' L'.join(f'{x} {y}' for x, y in LOCI)
dots = ''.join(f'<g class="dot" id="d{i}" transform="translate({x} {y})"><circle r="22"/><text y="8">{i + 1}</text></g>' for i, (x, y) in enumerate(LOCI))
rows = [('7', '♥', '47', 'rock', 'hearts 4, seven 7'), ('A', '♣', '71', 'cat', 'clubs 7, ace 1'), ('K', '♠', 'king', 'pirate', 'spades dig for treasure')]
system = ''.join(f'''<div class="row" id="r{i}"><div class="mini{" red" if red(s) else ""}"><b>{r}</b><span>{s}</span></div>
<div class="arr">→</div><div class="chip">{n}</div><div class="arr">→</div><div class="pic">{w}<small>{why}</small></div></div>''' for i, (r, s, n, w, why) in enumerate(rows))
k = 0
chapters = ''
for title, names in SKILLS:
    pills = ''
    for n in names:
        pills += f'<div class="pill" id="p{k}">{n}</div>'; k += 1
    chapters += f'<div class="chap"><h3>{title}</h3><div class="pills">{pills}</div></div>'

html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:'Fraunces';font-weight:600;src:url('file://{FONTS}/fraunces-latin-600-normal.woff2') format('woff2')}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden}}
body{{background:radial-gradient(1000px 800px at 50% 8%, #FBF8F2 0%, #F4EFE6 55%, #EAE3D7 100%);font-family:'Noto Sans',sans-serif;color:#2A211B;position:relative}}
.h{{position:absolute;left:70px;right:70px;top:150px;text-align:center;font:600 84px/1.06 'Fraunces',Georgia,serif;letter-spacing:-0.01em;text-wrap:balance;opacity:0}}
.h em{{font-style:normal;color:#5B4B9A}}
.card{{position:absolute;left:0;top:0;width:150px;height:210px;margin:-105px 0 0 -75px;border-radius:16px;background:#FFFDF9;
  border:2px solid #E3DACB;box-shadow:0 12px 26px rgba(42,33,27,.22);color:#2A211B;opacity:0}}
.card.red,.mini.red{{color:#B8323A}}
.card b{{position:absolute;left:14px;top:8px;font:600 46px 'Fraunces',Georgia,serif}}
.card i{{position:absolute;left:18px;top:60px;font:normal 30px 'DejaVu Sans',sans-serif}}
.card span{{position:absolute;left:0;right:0;top:62px;text-align:center;font:normal 100px 'DejaVu Sans',sans-serif}}
svg.plan{{position:absolute;left:{PX}px;top:{PY}px;opacity:0;overflow:visible}}
.plan rect{{fill:#FBF8F2;stroke:#2A211B;stroke-opacity:.55;stroke-width:5}}
.plan text{{font:500 26px 'Noto Sans',sans-serif;fill:#7A6B5E}}
.plan #route{{fill:none;stroke:#5B4B9A;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:4 16}}
.plan #routeMask{{fill:none;stroke:#fff;stroke-width:30;stroke-linecap:round;stroke-linejoin:round}}
.dot circle{{fill:#5B4B9A}} .dot text{{font:700 24px 'Noto Sans',sans-serif;fill:#fff;text-anchor:middle}}
.lbl{{position:absolute;transform:translateX(-50%);font:600 34px 'Fraunces',Georgia,serif;color:#5B4B9A;white-space:nowrap;opacity:0;
  background:#FBF8F2;padding:0 10px;border-radius:10px}}
#system{{position:absolute;left:70px;right:70px;top:600px;display:flex;flex-direction:column;gap:90px}}
.cap{{position:absolute;left:90px;right:90px;top:1540px;text-align:center;font:500 42px/1.3 'Noto Sans',sans-serif;color:#5A4D42;text-wrap:balance;opacity:0}}
.row{{display:flex;align-items:center;gap:26px;opacity:0}}
.mini{{width:130px;height:182px;border-radius:14px;background:#FFFDF9;border:2px solid #E3DACB;box-shadow:0 10px 22px rgba(42,33,27,.18);
  position:relative;flex:none}}
.mini b{{position:absolute;left:12px;top:6px;font:600 40px 'Fraunces',Georgia,serif}}
.mini span{{position:absolute;left:0;right:0;top:50px;text-align:center;font:normal 86px 'DejaVu Sans',sans-serif}}
.arr{{font:600 54px 'Noto Sans',sans-serif;color:#9A8C7E}}
.chip{{min-width:150px;padding:18px 26px;border-radius:22px;background:#EDE8F6;color:#5B4B9A;font:600 56px 'Fraunces',Georgia,serif;text-align:center}}
.pic{{font:600 64px 'Fraunces',Georgia,serif;color:#2A211B;display:flex;flex-direction:column}}
.pic small{{font:500 26px 'Noto Sans',sans-serif;color:#7A6B5E;margin-top:4px}}
#course{{position:absolute;left:70px;right:70px;top:420px;opacity:0}}
#course .sub{{text-align:center;font-size:38px;line-height:1.3;color:#5A4D42;font-weight:500;text-wrap:balance}}
.chap{{margin-top:56px}}
.chap h3{{font:600 30px 'Noto Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9A8C7E;margin-bottom:18px}}
.pills{{display:flex;flex-wrap:wrap;gap:16px}}
.pill{{padding:18px 30px;border-radius:999px;border:3px solid #CFC5B6;color:#7A6B5E;font:600 36px 'Noto Sans',sans-serif;background:#FBF8F2}}
.pill.on{{border-color:#5B4B9A;background:#5B4B9A;color:#fff}}
#meter{{margin-top:70px}}
#meter .bar{{height:34px;border-radius:999px;background:#E6DED2;overflow:hidden}}
#meter .fill{{height:100%;width:0;background:linear-gradient(90deg,#5B4B9A,#C9971E)}}
#meter p{{margin-top:16px;display:flex;justify-content:space-between;font:600 32px 'Noto Sans',sans-serif;color:#5A4D42}}
#end{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;text-align:center;
  background:radial-gradient(1000px 800px at 50% 30%, #FBF8F2 0%, #F4EFE6 60%, #EAE3D7 100%);opacity:0}}
#end .icon{{width:220px;height:220px;border-radius:50px;box-shadow:0 30px 70px rgba(42,33,27,.25);overflow:hidden}}
#end .icon img{{width:100%;height:100%}} #end .word{{width:360px}}
#end h2{{font:600 96px/1 'Fraunces',Georgia,serif;color:#5B4B9A;margin-top:20px}}
#end p{{font-size:42px;font-weight:600;color:#5A4D42;max-width:820px;line-height:1.28;text-wrap:balance}}
#end .cta{{margin-top:10px;padding:26px 60px;border-radius:60px;background:#5B4B9A;color:#fff;font-size:44px;font-weight:800}}
</style></head><body>
<div class="h" id="h1">Can you memorize a <em>shuffled deck?</em></div>
<div class="h" id="h2">Put every card <em>in a room</em> you know</div>
<div class="h" id="h3">Every card becomes <em>a picture</em></div>
<div class="h" id="h4"><em>Memory Palace</em></div>
<div class="cap" id="k1">Fifty-two strangers in a random order</div>
<div class="cap" id="k2">Walk the route, and the cards come back in order</div>
<div class="cap" id="k3">Learn the 52 pictures once, then use them for every deck</div>
<svg class="plan" id="plan" width="900" height="960" viewBox="0 0 900 960">{rooms}
<mask id="m" maskUnits="userSpaceOnUse"><path id="routeMask" d="{route}"/></mask><path id="route" d="{route}" mask="url(#m)"/>{dots}</svg>
{cards}{labels}
<div id="system">{system}</div>
<div id="course"><p class="sub">The 2,500-year-old trick behind memory champions, in eight skills</p>{chapters}
<div id="meter"><div class="bar"><div class="fill" id="fill"></div></div><p><span>Deck in memory</span><span id="n">0 of 52 cards</span></p></div></div>
<div id="end"><div class="icon"><img src="file://{HERE}/nous-icon.svg"></div><img class="word" src="file://{HERE}/nous-wordmark.svg">
<h2>Memory Palace</h2><p>Build a palace in your head, then memorize a whole shuffled deck.</p><div class="cta">Coming soon</div></div>
<script>
const clamp = x => Math.min(1, Math.max(0, x)), lerp = (a, b, x) => a + (b - a) * x;
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3), easeInOut = x => {{ x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }};
const back = x => {{ x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }};
const $ = id => document.getElementById(id);
const LOCI = {json.dumps([[PX + x, PY + y] for x, y in LOCI])};
// A seeded scatter, so every render gives the same "shuffled" spread.
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const N = {len(CARDS)}, spread = [...Array(N)].map((_, i) => {{
  const a = (i / N) * Math.PI * 2 + rnd() * .5, r = 150 + rnd() * 230;
  return [540 + Math.cos(a) * r * 1.05, 980 + Math.sin(a) * r * 1.2, (rnd() - .5) * 70];
}});
const route = $('routeMask'), RL = route.getTotalLength(); route.style.strokeDasharray = RL;
const fade = (id, t0, t1, t2, t3) => {{ const o = Math.min(easeOut((T - t0) / (t1 - t0)), 1 - easeOut((T - t2) / (t3 - t2))); $(id).style.opacity = o; return o; }};
let T = 0;
window.setT = t => {{
  T = t;
  fade('h1', .1, .7, 3.0, 3.4); fade('k1', 1.4, 1.9, 3.0, 3.4); fade('k2', 5.4, 5.9, 7.5, 7.9); fade('k3', 9.6, 10.1, 10.7, 11.0); fade('h2', 3.3, 3.9, 7.5, 7.9); fade('h3', 7.9, 8.4, 10.7, 11.0); fade('h4', 10.9, 11.4, 99, 100);
  const plan = fade('plan', 3.3, 3.9, 7.5, 7.9);
  route.style.strokeDashoffset = RL * (1 - easeInOut((t - 3.7) / 1.0));
  LOCI.forEach((_, i) => {{ const s = back((t - 3.8 - i * .1) / .35); $('d' + i).setAttribute('transform', `translate(${{LOCI[i][0] - {PX}}} ${{LOCI[i][1] - {PY}}}) scale(${{s.toFixed(3)}})`); }});
  for (let i = 0; i < N; i++) {{
    const c = $('c' + i), [sx, sy, sr] = spread[i];
    const enter = easeOut((t - .3 - i * .1) / .5);
    let x = sx, y = lerp(sy + 900, sy, enter), r = sr * enter, s = 1, o = clamp(enter * 2);
    if (i < 8) {{
      const go = easeInOut((t - 4.9 - i * .3) / .5), [lx, ly] = LOCI[i];
      x = lerp(x, lx, go); y = lerp(y, ly - 72, go); r = lerp(r, 0, go); s = lerp(1, .52, go);
      $('l' + i).style.opacity = Math.min(easeOut((t - 5.3 - i * .3) / .3), 1 - easeOut((t - 7.5) / .4));
      o *= 1 - easeOut((t - 7.5) / .4);
    }} else o *= 1 - easeOut((t - 3.2) / .4);
    c.style.opacity = o;
    c.style.transform = `translate(${{x.toFixed(1)}}px,${{y.toFixed(1)}}px) rotate(${{r.toFixed(2)}}deg) scale(${{s.toFixed(3)}})`;
  }}
  [0, 1, 2].forEach(i => {{ const o = Math.min(easeOut((t - 8.4 - i * .6) / .4), 1 - easeOut((t - 10.7) / .3)); const r = $('r' + i);
    r.style.opacity = o; r.style.transform = `translateX(${{lerp(60, 0, easeOut((t - 8.4 - i * .6) / .4))}}px)`; }});
  fade('course', 11.1, 11.6, 99, 100);
  for (let k = 0; k < 8; k++) $('p' + k).classList.toggle('on', t >= 11.8 + k * .22);
  const m = easeInOut((t - 11.8) / 1.9); $('fill').style.width = (m * 100) + '%'; $('n').textContent = Math.round(m * 52) + ' of 52 cards';
  $('end').style.opacity = easeOut((t - 14.0) / .6);
}};
window.setT(0);
</script></body></html>'''
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
open(os.path.join(HERE, 'out', 'memory.html'), 'w').write(html)
print('wrote out/memory.html')
