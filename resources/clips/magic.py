# Builds out/magic.html: a 16.5 s "coming soon" teaser for the Pick a Card course, driven by window.setT(t).
# A card is chosen, the deck turns as a ring under two cuts while the key card stays beside it, the deal finds it,
# then the course map and the end card. The method shown is the course's own (magic-keycard, lesson 1).
# On-screen text uses US spelling, like the social posts (resources/social/README.md).
# Usage: python3 magic.py && node render-anim.mjs out/magic.html 16.5 ~/Videos/Nous/nous-pick-a-card.mp4
import os
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'store-shots', 'fonts')
GREEN, GOLD, KEY = '#2E6B4F', '#C9971E', '#C8562B'

N, R, CX, CY = 16, 300, 540, 930
ring = ''
for i in range(N):
    a = 360 * i / N
    inner = {0: ('7', '♣', 'key'), 1: ('Q', '♥', 'chosen')}.get(i)
    face = (f'<rect class="face {inner[2]}" x="-34" y="-50" width="68" height="100" rx="9"/>'
            f'<text class="rk{" red" if inner[1] in "♥♦" else ""}" y="-10">{inner[0]}</text>'
            f'<text class="st{" red" if inner[1] in "♥♦" else ""}" y="30">{inner[1]}</text>') if inner else \
           '<rect class="back" x="-34" y="-50" width="68" height="100" rx="9"/>'
    ring += f'<g transform="rotate({a}) translate(0 {-R})">{face}</g>'
DEAL = [('3', '♠', ''), ('9', '♦', ''), ('7', '♣', 'key'), ('Q', '♥', 'chosen')]
deal = ''.join(f'<div class="card{" red" if s in "♥♦" else ""} {cls}" id="d{i}"><b>{r}</b><span>{s}</span></div>' for i, (r, s, cls) in enumerate(DEAL))
SKILLS = [('Self-working', ['The Key Card', 'Tricks That Do Themselves']), ('Sleights', ['Shuffles and Controls', 'Lifts and Forces']),
          ('The mind', ['Misdirection', 'Masters and Cheats'])]
k, chapters = 0, ''
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
.h em{{font-style:normal;color:{GREEN}}}
.cap{{position:absolute;left:90px;right:90px;top:1540px;text-align:center;font:500 42px/1.3 'Noto Sans',sans-serif;color:#5A4D42;text-wrap:balance;opacity:0}}
svg.ring{{position:absolute;left:0;top:0;opacity:0}}
.back{{fill:#2F5D8A;stroke:#FFFDF9;stroke-width:4}}
.face{{fill:#FFFDF9;stroke-width:5}} .face.key{{stroke:{KEY}}} .face.chosen{{stroke:{GOLD}}}
.rk{{font:600 34px 'Fraunces',Georgia,serif;text-anchor:middle;fill:#2A211B}} .st{{font:normal 40px 'DejaVu Sans',sans-serif;text-anchor:middle;fill:#2A211B}}
.red{{fill:#B8323A;color:#B8323A}}
#cutline{{stroke:#B8323A;stroke-width:6;stroke-dasharray:14 10;stroke-linecap:round}}
#cutlbl{{font:700 34px 'Noto Sans',sans-serif;fill:#B8323A;text-anchor:middle}}
.tag{{position:absolute;font:600 36px 'Fraunces',Georgia,serif;opacity:0;white-space:nowrap;transform:translateX(-50%)}}
.card{{position:absolute;top:820px;width:170px;height:238px;margin-left:-85px;border-radius:18px;background:#FFFDF9;border:3px solid #E3DACB;
  box-shadow:0 12px 26px rgba(42,33,27,.22);opacity:0}}
.card b{{position:absolute;left:14px;top:6px;font:600 52px 'Fraunces',Georgia,serif}}
.card span{{position:absolute;left:0;right:0;top:66px;text-align:center;font:normal 110px 'DejaVu Sans',sans-serif}}
.card.key{{border:6px solid {KEY}}} .card.chosen{{border:6px solid {GOLD}}}
#pick{{position:absolute;left:540px;top:900px;width:220px;height:308px;margin:-154px 0 0 -110px;border-radius:22px;opacity:0;transform-style:preserve-3d}}
#pick .f,#pick .b{{position:absolute;inset:0;border-radius:22px;backface-visibility:hidden;box-shadow:0 16px 34px rgba(42,33,27,.25)}}
#pick .b{{background:#2F5D8A;border:6px solid #FFFDF9}}
#pick .f{{background:#FFFDF9;border:6px solid {GOLD};transform:rotateY(180deg);color:#B8323A}}
#pick .f b{{position:absolute;left:18px;top:8px;font:600 64px 'Fraunces',Georgia,serif}}
#pick .f span{{position:absolute;left:0;right:0;top:86px;text-align:center;font:normal 140px 'DejaVu Sans',sans-serif}}
.fan{{position:absolute;left:540px;top:1000px;width:150px;height:210px;margin:-105px 0 0 -75px;border-radius:16px;background:#2F5D8A;
  border:5px solid #FFFDF9;box-shadow:0 8px 18px rgba(42,33,27,.2);transform-origin:50% 160%;opacity:0}}
#course{{position:absolute;left:70px;right:70px;top:420px;opacity:0}}
#course .sub{{text-align:center;font-size:38px;line-height:1.3;color:#5A4D42;font-weight:500;text-wrap:balance}}
.chap{{margin-top:56px}}
.chap h3{{font:600 30px 'Noto Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9A8C7E;margin-bottom:18px}}
.pills{{display:flex;flex-wrap:wrap;gap:16px}}
.pill{{padding:18px 30px;border-radius:999px;border:3px solid #CFC5B6;color:#7A6B5E;font:600 36px 'Noto Sans',sans-serif;background:#FBF8F2}}
.pill.on{{border-color:{GREEN};background:{GREEN};color:#fff}}
#end{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;text-align:center;
  background:radial-gradient(1000px 800px at 50% 30%, #FBF8F2 0%, #F4EFE6 60%, #EAE3D7 100%);opacity:0}}
#end .icon{{width:220px;height:220px;border-radius:50px;box-shadow:0 30px 70px rgba(42,33,27,.25);overflow:hidden}}
#end .icon img{{width:100%;height:100%}} #end .word{{width:360px}}
#end h2{{font:600 96px/1 'Fraunces',Georgia,serif;color:{GREEN};margin-top:20px}}
#end p{{font-size:42px;font-weight:600;color:#5A4D42;max-width:820px;line-height:1.28;text-wrap:balance}}
#end .cta{{margin-top:10px;padding:26px 60px;border-radius:60px;background:{GREEN};color:#fff;font-size:44px;font-weight:800}}
</style></head><body>
<div class="h" id="h1">Pick a card. <em>Any card.</em></div>
<div class="h" id="h2">Cut the deck <em>anywhere</em></div>
<div class="h" id="h3">Deal until <em>your key</em></div>
<div class="h" id="h4"><em>Pick a Card</em></div>
<div class="cap" id="k1">It goes back, right under a card you secretly know</div>
<div class="cap" id="k2">A cut only changes where the circle opens. Your key card stays right next to theirs.</div>
<div class="cap" id="k3">The card after your key is theirs. No sleight of hand needed.</div>
{''.join(f'<div class="fan" id="f{i}"></div>' for i in range(9))}
<div id="pick"><div class="b"></div><div class="f"><b>Q</b><span>♥</span></div></div>
<svg class="ring" id="ring" width="1080" height="1920" viewBox="0 0 1080 1920">
<g id="spin" transform="translate({CX} {CY})">{ring}</g>
<line id="cutline" x1="{CX}" y1="{CY - R - 110}" x2="{CX}" y2="{CY - R + 80}"/><text id="cutlbl" x="{CX}" y="{CY - R - 128}">cut</text></svg>
<div class="tag" id="tk" style="color:{KEY}">key</div><div class="tag" id="tc" style="color:{GOLD}">theirs</div>
{deal}
<div id="course"><p class="sub">Card magic and sleight of hand with an ordinary deck, and the science of why it fools people</p>{chapters}</div>
<div id="end"><div class="icon"><img src="file://{HERE}/nous-icon.svg"></div><img class="word" src="file://{HERE}/nous-wordmark.svg">
<h2>Pick a Card</h2><p>Learn real tricks with an ordinary deck, and why they fool people.</p><div class="cta">Coming soon</div></div>
<script>
const clamp = x => Math.min(1, Math.max(0, x)), lerp = (a, b, x) => a + (b - a) * x;
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3), easeInOut = x => {{ x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }};
const $ = id => document.getElementById(id);
let T = 0;
const fade = (id, t0, t1, t2, t3) => {{ const o = Math.min(easeOut((T - t0) / (t1 - t0)), 1 - easeOut((T - t2) / (t3 - t2))); $(id).style.opacity = o; return o; }};
const R = {R}, CX = {CX}, CY = {CY}, N = {N};
window.setT = t => {{
  T = t;
  fade('h1', .1, .6, 2.9, 3.3); fade('k1', 1.6, 2.0, 2.9, 3.3);
  fade('h2', 3.2, 3.7, 7.4, 7.8); fade('k2', 4.0, 4.5, 7.4, 7.8);
  fade('h3', 7.7, 8.2, 10.6, 10.9); fade('k3', 9.4, 9.9, 10.6, 10.9);
  fade('h4', 10.8, 11.3, 99, 100); fade('course', 11.0, 11.5, 99, 100);
  for (let i = 0; i < 9; i++) {{
    const f = $('f' + i), o = easeOut((t - .1 - i * .04) / .4) * (1 - easeOut((t - 2.6) / .4));
    f.style.opacity = o; f.style.transform = `rotate(${{lerp(0, (i - 4) * 9, easeOut((t - .2) / .6))}}deg)`;
  }}
  // The chosen card rises out of the fan, turns over, then goes back face down.
  const pk = $('pick'), up = easeOut((t - .9) / .5), flip = easeInOut((t - 1.3) / .5) - easeInOut((t - 2.3) / .4);
  pk.style.opacity = clamp(up * 3) * (1 - easeOut((t - 2.7) / .4));
  pk.style.transform = `translateY(${{lerp(80, -120, up) + lerp(0, 160, easeInOut((t - 2.4) / .5))}}px) perspective(1400px) rotateY(${{flip * 180}}deg)`;
  pk.querySelector('.f').style.transform = `rotateY(180deg)`;
  // The deck as a ring: two cuts turn it, the dashed line marks where the deck now opens.
  const ringO = fade('ring', 3.3, 3.8, 7.4, 7.8);
  const ang = -11.25 + 120 * easeInOut((t - 4.6) / 1.0) + 135 * easeInOut((t - 6.0) / 1.0);
  $('spin').setAttribute('transform', `translate(${{CX}} ${{CY}}) rotate(${{ang.toFixed(2)}})`);
  const cutO = Math.max(Math.sin(Math.PI * clamp((t - 4.4) / 1.4)), Math.sin(Math.PI * clamp((t - 5.8) / 1.4)));
  $('cutline').style.opacity = cutO; $('cutlbl').style.opacity = cutO;
  const at = (i, extra) => {{ const a = (ang + 360 * i / N) * Math.PI / 180, r = R + extra; return [CX + Math.sin(a) * r, CY - Math.cos(a) * r]; }};
  [['tk', 0], ['tc', 1]].forEach(([id, i]) => {{ const [x, y] = at(i, 110); const e = $(id); e.style.left = x + 'px'; e.style.top = (y - 24) + 'px';
    e.style.opacity = ringO * easeOut((t - 3.9) / .4); }});
  // The deal: faces turn up one by one until the key, then theirs.
  for (let i = 0; i < 4; i++) {{
    const c = $('d' + i), d = easeOut((t - 8.0 - i * .45) / .35);
    c.style.left = (180 + i * 240) + 'px'; c.style.opacity = d * (1 - easeOut((t - 10.6) / .3));
    c.style.transform = `translateY(${{lerp(-200, 0, d)}}px) scale(${{i === 3 ? 1 + .08 * Math.sin(Math.PI * clamp((t - 9.6) / .8)) : 1}})`;
  }}
  for (let p = 0; p < 6; p++) $('p' + p).classList.toggle('on', t >= 11.8 + p * .3);
  $('end').style.opacity = easeOut((t - 14.0) / .6);
}};
window.setT(0);
</script></body></html>'''
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
open(os.path.join(HERE, 'out', 'magic.html'), 'w').write(html)
print('wrote out/magic.html')
