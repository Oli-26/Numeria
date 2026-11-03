# Builds out/scratch.html: a 17 s promo for the From Scratch survival course, driven by window.setT(t).
# Night falls on one match, the flame shows what really burns, a clear pot of water hides what can kill, then the
# survival journal counts to a year while the skills unlock in course order, then the end card.
# Every claim is from the course's own cited lessons (sfire-01, swater-03, swater-04) and courses.json.
# On-screen text uses US spelling, like the social posts (resources/social/README.md).
# Usage: python3 scratch.py && node render-anim.mjs out/scratch.html 17 ~/Videos/Nous/nous-from-scratch.mp4
import json, math, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..')
FONTS = os.path.join(HERE, '..', 'store-shots', 'fonts')
ACCENT, GOLD = '#C8562B', '#C9971E'

course = next(c for c in json.load(open(os.path.join(ROOT, 'wwwroot', 'data', 'courses.json'))) if c['id'] == 'from-scratch')
art = dict(re.findall(r'"(scratch-[a-z]+)" => Svg\("(.*?)"\),', open(os.path.join(ROOT, 'Services', 'TopicArt.cs')).read()))
MOODS = [[m.get('below', 10 ** 6), m['text']] for m in course['meter']['moods']]
# Unlock order respects each skill's `needs`: Water after Fire, Food after Knots, Building after Shelter, and so on.
ORDER = ['scratch-fire', 'scratch-shelter', 'scratch-water', 'scratch-firstaid', 'scratch-cordage', 'scratch-navigation',
         'scratch-food', 'scratch-building', 'scratch-chemistry', 'scratch-metal', 'scratch-power']
skills = {s['topicId']: s for ch in course['chapters'] for s in ch['skills']}
assert all(ORDER.index(n) < ORDER.index(s) for s in ORDER for n in skills[s]['needs'])

chapters = ''
for ch in course['chapters']:
    pills = ''.join(f'<div class="pill" id="p-{s["topicId"]}" style="--c:{s["color"]}"><svg viewBox="0 0 32 32" fill="none">'
                    f'{art[s["topicId"]]}</svg>{s["name"]}</div>' for s in ch['skills'])
    chapters += f'<div class="chap"><h3>{ch["title"]}<span>{ch["span"]}</span></h3><div class="pills">{pills}</div></div>'


def flame(i, x, y, w, h):
    return (f'<g class="tongue" id="{i}" data-x="{x}" data-y="{y}" data-w="{w}" data-h="{h}">'
            '<path fill="url(#fo)" d="M0 0C-.36 0-.46-.3-.36-.52C-.27-.72-.1-.78 0-1C.04-.8.2-.7.3-.52C.42-.32.36 0 0 0Z"/>'
            '<path fill="url(#fi)" d="M0 0C-.2 0-.25-.17-.19-.3C-.13-.42-.04-.46 0-.6C.03-.47.12-.41.16-.3C.22-.17.19 0 0 0Z"/></g>')


GERMS = [('rod', 470, 590, 20), ('rod', 600, 560, -35), ('rod', 560, 700, 60), ('coc', 445, 680, 0), ('coc', 640, 660, 0),
         ('rod', 520, 640, -70), ('vib', 610, 735, 0), ('vib', 470, 520, 30), ('coc', 545, 510, 0)]
germs = ''
for k, (kind, x, y, r) in enumerate(GERMS):
    body = {'rod': '<rect x="-34" y="-12" width="68" height="24" rx="12" fill="#8BA24A" stroke="#5E7330" stroke-width="3"/>',
            'coc': '<circle r="12" fill="#C08A4A" stroke="#8A5E2C" stroke-width="3"/><circle cx="22" cy="6" r="12" fill="#C08A4A" stroke="#8A5E2C" stroke-width="3"/>'
                   '<circle cx="8" cy="-18" r="12" fill="#C08A4A" stroke="#8A5E2C" stroke-width="3"/>',
            'vib': '<path d="M-30 6C-14-14 6 14 26-6" fill="none" stroke="#6F8FB0" stroke-width="12" stroke-linecap="round"/>'}[kind]
    germs += f'<g class="germ" id="g{k}" data-x="{x}" data-y="{y}" data-r="{r}">{body}</g>'

html = '''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Fraunces';font-weight:600;src:url('file://%FONTS%/fraunces-latin-600-normal.woff2') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden}
body{background:radial-gradient(1000px 800px at 50% 8%, #FBF8F2 0%, #F4EFE6 55%, #EAE3D7 100%);font-family:'Noto Sans',sans-serif;color:#2A211B;position:relative}
#night{position:absolute;inset:0;background:radial-gradient(900px 1000px at 50% 55%, #2B2019 0%, #120E0B 72%)}
#glow{position:absolute;left:540px;top:900px;width:1100px;height:1100px;margin:-550px 0 0 -550px;border-radius:50%;
  background:radial-gradient(closest-side, rgba(242,164,58,.42), rgba(200,86,43,.16) 45%, rgba(200,86,43,0) 100%);opacity:0}
.h{position:absolute;left:70px;right:70px;top:150px;text-align:center;font:600 84px/1.06 'Fraunces',Georgia,serif;letter-spacing:-0.01em;text-wrap:balance;opacity:0}
.h em{font-style:normal;color:%ACCENT%}
#h0{color:#FBF6EC;top:300px;font-size:104px} #h0 em{color:#E9944F}
.cap{position:absolute;left:90px;right:90px;top:1540px;text-align:center;font:500 42px/1.3 'Noto Sans',sans-serif;color:#5A4D42;text-wrap:balance;opacity:0}
#k0{color:#D9CBB8;top:1500px}
svg.scene{position:absolute;left:0;top:0;opacity:0}
.lbl{font:600 36px 'Noto Sans',sans-serif;fill:#5A4D42} .lbl.c{text-anchor:middle} .lbl.r{text-anchor:end}
.lead{stroke:#9A8C7E;stroke-width:3;fill:none;stroke-dasharray:2 8;stroke-linecap:round}
.gas{fill:none;stroke:#8E99A3;stroke-width:5;stroke-linecap:round;stroke-dasharray:14 14}
#journal{position:absolute;left:70px;right:70px;top:330px;padding:36px 44px 40px;border-radius:30px;background:#FFFDF9;border:2px solid #E3DACB;
  box-shadow:0 18px 40px rgba(70,45,25,.12);opacity:0}
#journal .kick{font:700 30px 'Noto Sans',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:%ACCENT%}
#journal .day{font:600 104px/1.1 'Fraunces',Georgia,serif;margin-top:6px}
#journal .mood{font:italic 400 38px/1.3 Georgia,serif;color:#5A4D42;min-height:100px;margin-top:4px;text-wrap:balance}
#journal .bar{margin-top:26px;height:16px;border-radius:8px;background:#EDE5D8;overflow:hidden}
#journal .bar i{display:block;height:100%;width:0;border-radius:8px;background:linear-gradient(90deg,%ACCENT%,%GOLD%)}
#map{position:absolute;left:70px;right:70px;top:790px;opacity:0}
.chap{margin-top:44px} .chap:first-child{margin-top:0}
.chap h3{font:600 30px 'Noto Sans',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9A8C7E;margin-bottom:18px}
.chap h3 span{margin-left:18px;letter-spacing:.02em;text-transform:none;font-weight:500;color:#B3A797}
.pills{display:flex;flex-wrap:wrap;gap:16px}
.pill{display:flex;align-items:center;gap:12px;padding:14px 28px 14px 18px;border-radius:999px;border:3px solid #CFC5B6;color:#7A6B5E;
  font:600 36px 'Noto Sans',sans-serif;background:#FBF8F2}
.pill svg{width:44px;height:44px;color:#A99B8B}
.pill.on{border-color:var(--c);background:var(--c);color:#fff} .pill.on svg{color:#fff}
#end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;text-align:center;
  background:radial-gradient(1000px 800px at 50% 30%, #FBF8F2 0%, #F4EFE6 60%, #EAE3D7 100%);opacity:0}
#end .icon{width:220px;height:220px;border-radius:50px;box-shadow:0 30px 70px rgba(42,33,27,.25);overflow:hidden}
#end .icon img{width:100%;height:100%} #end .word{width:360px}
#end h2{font:600 96px/1 'Fraunces',Georgia,serif;color:%ACCENT%;margin-top:20px}
#end p{font-size:42px;font-weight:600;color:#5A4D42;max-width:820px;line-height:1.28;text-wrap:balance}
#end .cta{margin-top:10px;padding:26px 60px;border-radius:60px;background:%ACCENT%;color:#fff;font-size:44px;font-weight:800}
</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs>
<linearGradient id="fo" x1="0" y1="0" x2="0" y2="-1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F2A43A"/><stop offset=".55" stop-color="#E07A2E"/><stop offset="1" stop-color="%ACCENT%"/></linearGradient>
<linearGradient id="fi" x1="0" y1="0" x2="0" y2="-.6" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF4CF"/><stop offset="1" stop-color="#F6C453"/></linearGradient>
<clipPath id="lensclip"><circle cx="540" cy="630" r="168"/></clipPath>
</defs></svg>
<div id="night"></div><div id="glow"></div>
<div class="h" id="h0">Day 0.<br><em>One match.</em></div>
<div class="cap" id="k0">%MOOD0%</div>
<svg class="scene" id="s-match" width="1080" height="1920" viewBox="0 0 1080 1920"><g id="match">
<rect x="529" y="985" width="22" height="330" rx="5" fill="#E2C08D"/><rect x="529" y="985" width="7" height="330" fill="#F0D6AA"/>
<ellipse cx="540" cy="982" rx="21" ry="30" fill="#9E2B2B"/>%MFLAME%</g>
<g id="sparks">%SPARKS%</g></svg>
<div class="h" id="h1">Wood does not <em>burn</em></div>
<div class="cap" id="k1">Heat cooks gas out of the wood. The flames are that gas burning in the air.</div>
<svg class="scene" id="s-fire" width="1080" height="1920" viewBox="0 0 1080 1920">
<g id="gas"><path class="gas" d="M470 1150q-14-30 0-56"/><path class="gas" d="M520 1150q14-30 0-56"/><path class="gas" d="M570 1150q-14-30 0-56"/><path class="gas" d="M620 1150q14-30 0-56"/></g>
%FIRE%
<g><rect x="270" y="1160" width="540" height="112" rx="56" fill="#8A5A3B"/><path d="M330 1190h230M380 1222h300M300 1248h170M600 1186h150" stroke="#6E4630" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="772" cy="1216" rx="36" ry="56" fill="#C99A6B"/><ellipse cx="772" cy="1216" rx="22" ry="36" fill="none" stroke="#A97A4E" stroke-width="4"/>
<ellipse cx="772" cy="1216" rx="9" ry="15" fill="none" stroke="#A97A4E" stroke-width="4"/></g>
<g class="note" id="n1"><text class="lbl" x="70" y="760">Gas + air burn:</text><text class="lbl" x="70" y="806">that is the flame</text><path class="lead" d="M250 828Q330 880 400 900"/></g>
<g class="note" id="n2"><text class="lbl r" x="1010" y="1040">Gas comes out</text><text class="lbl r" x="1010" y="1086">of the hot wood</text><path class="lead" d="M760 1100Q700 1124 650 1124"/></g>
<g class="note" id="n3"><text class="lbl c" x="540" y="1350">The wood itself is not alight</text></g></svg>
<div class="h" id="h2">Clear water can <em>kill</em></div>
<div class="cap" id="k2a">The things in water that kill people are far too small to see.</div>
<div class="cap" id="k2b">At a boil, every germ in it that can make you ill dies within seconds.</div>
<svg class="scene" id="s-water" width="1080" height="1920" viewBox="0 0 1080 1920">
<path d="M380 1338l320-44M380 1294l320 44" stroke="#6E4630" stroke-width="16" stroke-linecap="round"/>
%POTFIRE%
<g id="steam" fill="none" stroke="#B9AFA2" stroke-width="10" stroke-linecap="round"><path d="M470 990q-24-40 0-80t0-80"/><path d="M560 990q24-40 0-80t0-80"/><path d="M640 990q-24-40 0-80t0-80"/></g>
<path d="M300 1030V1220Q300 1268 348 1268H732Q780 1268 780 1220V1030Z" fill="#5E6670"/><path d="M300 1030V1220Q300 1268 348 1268H372Q330 1268 330 1220V1030Z" fill="#737C86"/>
<path d="M300 1060H246Q228 1060 228 1078V1084Q228 1100 246 1100H300M780 1060H834Q852 1060 852 1078V1084Q852 1100 834 1100H780" fill="none" stroke="#4C535B" stroke-width="12"/>
<ellipse cx="540" cy="1030" rx="244" ry="50" fill="#4C535B"/><ellipse cx="540" cy="1034" rx="226" ry="40" fill="#BFDCEA"/>
<ellipse cx="480" cy="1026" rx="90" ry="12" fill="#E3F0F6" opacity=".9"/>
<g id="bubbles">%BUBBLES%</g>
<g id="lens"><path d="M418 750L590 1034M662 750L590 1034" stroke="#9A8C7E" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>
<circle cx="540" cy="630" r="168" fill="#EAF4F9"/><g clip-path="url(#lensclip)">%GERMS%</g>
<circle cx="540" cy="630" r="168" fill="none" stroke="#2A211B" stroke-width="14"/><circle cx="590" cy="1034" r="20" fill="none" stroke="#2A211B" stroke-width="5"/></g></svg>
<div class="h" id="h3">Survive, then <em>rebuild</em></div>
<div id="journal"><div class="kick">%KICKER%</div><div class="day" id="day">Day 0</div><div class="mood" id="mood"></div><div class="bar"><i id="bar"></i></div></div>
<div id="map">%CHAPTERS%</div>
<div class="cap" id="k3">%PREMISE%</div>
<div id="end"><div class="icon"><img src="file://%HERE%/nous-icon.svg"></div><img class="word" src="file://%HERE%/nous-wordmark.svg">
<h2>%TITLE%</h2><p>Learn to survive, then rebuild: fire, water, shelter, metal, power.</p><div class="cta">Free on Google Play</div></div>
<script>
const clamp = x => Math.min(1, Math.max(0, x)), lerp = (a, b, x) => a + (b - a) * x;
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3), easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const $ = id => document.getElementById(id);
const MOODS = %MOODS%, ORDER = %ORDER%;
let T = 0;
const fade = (id, t0, t1, t2, t3) => { const o = Math.min(easeOut((T - t0) / (t1 - t0)), 1 - easeOut((T - t2) / (t3 - t2))); $(id).style.opacity = o; return o; };
const tongue = (id, grow, ph) => {
  const g = $(id), d = g.dataset, f = 1 + .06 * Math.sin(T * 13 + ph) + .04 * Math.sin(T * 21 + ph * 2), sk = 4 * Math.sin(T * 7 + ph);
  g.setAttribute('transform', `translate(${d.x} ${d.y}) skewX(${sk.toFixed(2)}) scale(${(d.w * grow * (2 - f)).toFixed(2)} ${(d.h * grow * f).toFixed(2)})`);
};
window.setT = t => {
  T = t;
  // Night, one match.
  $('night').style.opacity = 1 - easeOut((t - 3.0) / .6);
  fade('h0', .2, .7, 2.9, 3.2); fade('k0', 1.5, 1.9, 2.9, 3.2);
  fade('s-match', .3, .7, 3.0, 3.4);
  $('match').setAttribute('transform', `translate(0 ${lerp(260, 0, easeOut((t - .3) / .7)).toFixed(1)}) rotate(${lerp(-10, -4, easeOut((t - .3) / .9)).toFixed(2)} 540 1150)`);
  const lit = easeOut((t - 1.25) / .45);
  tongue('mf', lit, 0);
  $('sparks').style.opacity = Math.sin(Math.PI * clamp((t - 1.15) / .35));
  $('sparks').setAttribute('transform', `translate(540 970) scale(${lerp(.4, 1.3, clamp((t - 1.15) / .35)).toFixed(2)})`);
  $('glow').style.opacity = lit * (1 - easeOut((t - 3.0) / .6)) * (.9 + .1 * Math.sin(t * 11));
  // What actually burns.
  fade('h1', 3.4, 3.9, 6.7, 7.0); fade('k1', 4.1, 4.6, 6.7, 7.0); fade('s-fire', 3.2, 3.7, 6.7, 7.0);
  const big = easeOut((t - 3.3) / .7);
  ['f0', 'f1', 'f2', 'f3'].forEach((id, i) => tongue(id, big, i * 1.7));
  $('gas').style.strokeDashoffset = (t * 40).toFixed(1);
  [['n1', 4.9], ['n2', 5.3], ['n3', 5.7]].forEach(([id, a]) => $(id).style.opacity = easeOut((t - a) / .4));
  // Clear water, invisible germs, a rolling boil.
  fade('h2', 7.0, 7.5, 10.3, 10.6); fade('k2a', 7.6, 8.0, 8.95, 9.15); fade('k2b', 9.15, 9.5, 10.3, 10.6); fade('s-water', 6.9, 7.4, 10.3, 10.6);
  const ls = easeOut((t - 7.6) / .5);
  $('lens').style.opacity = ls; $('lens').setAttribute('transform', `translate(540 630) scale(${lerp(.6, 1, ls).toFixed(3)}) translate(-540 -630)`);
  const boil = easeOut((t - 8.7) / .5);
  ['pf0', 'pf1', 'pf2'].forEach((id, i) => tongue(id, boil, i * 2.1));
  document.querySelectorAll('.germ').forEach((g, i) => {
    const d = g.dataset, gone = easeInOut((t - 9.3 - i * .08) / .35), w = 6 * Math.sin(t * 3 + i * 1.3);
    g.setAttribute('transform', `translate(${+d.x + w} ${+d.y + 5 * Math.cos(t * 2.4 + i)}) rotate(${+d.r + 8 * Math.sin(t * 2 + i)}) scale(${(1 - gone).toFixed(3)})`);
    g.style.opacity = 1 - gone;
  });
  const steam = easeOut((t - 9.1) / .6);
  $('steam').querySelectorAll('path').forEach((p, i) => {
    const u = ((t * .55 + i * .33) % 1);
    p.setAttribute('transform', `translate(0 ${(-u * 70).toFixed(1)})`); p.style.opacity = steam * Math.sin(Math.PI * u) * .8;
  });
  document.querySelectorAll('#bubbles circle').forEach((c, i) => {
    const u = ((t * 1.4 + i * .37) % 1); c.setAttribute('r', (c.dataset.r * Math.sin(Math.PI * u)).toFixed(1)); c.style.opacity = boil;
  });
  // The journal counts the days while the skills unlock.
  fade('h3', 10.55, 11.0, 14.7, 15.0); fade('journal', 10.6, 11.05, 14.7, 15.0); fade('map', 10.65, 11.1, 14.7, 15.0); fade('k3', 11.8, 12.3, 14.7, 15.0);
  const day = Math.round(lerp(0, 3, easeInOut((t - 11.1) / .6)) + lerp(0, 27, easeInOut((t - 11.9) / .8)) + lerp(0, 335, easeInOut((t - 12.9) / 1.0)));
  $('day').textContent = 'Day ' + day;
  $('mood').textContent = MOODS.find(m => day < m[0])[1];
  const prog = day <= 3 ? day / 3 / 3 : day <= 30 ? 1 / 3 + (day - 3) / 27 / 3 : 2 / 3 + (day - 30) / 335 / 3;
  $('bar').style.width = (prog * 100).toFixed(2) + '%';
  const at = [11.15, 11.3, 11.45, 11.6, 12.05, 12.3, 12.55, 13.05, 13.3, 13.55, 13.8];
  ORDER.forEach((id, i) => {
    const p = $('p-' + id), on = t >= at[i]; p.classList.toggle('on', on);
    p.style.transform = `scale(${on ? 1 + .1 * Math.sin(Math.PI * clamp((t - at[i]) / .3)) : 1})`;
  });
  $('end').style.opacity = easeOut((t - 14.75) / .5);
};
document.querySelectorAll('.tongue').forEach(g => g.setAttribute('transform', 'scale(0)'));
window.setT(0);
</script></body></html>'''

sparks = ''.join(f'<path d="M0 0L{70 * math.cos(a):.1f} {70 * math.sin(a):.1f}" stroke="#F6C453" stroke-width="6" stroke-linecap="round"/>'
                 for a in [i * 0.785 + 0.3 for i in range(8)])
bubbles = ''.join(f'<circle cx="{x}" cy="{y}" data-r="{r}" r="0" fill="#EAF4F9" stroke="#8FB7CC" stroke-width="3"/>'
                  for x, y, r in [(400, 1036, 12), (470, 1050, 9), (540, 1022, 14), (610, 1046, 10), (680, 1030, 12), (500, 1016, 8), (640, 1012, 9)])
for k, v in {'%FONTS%': FONTS, '%HERE%': HERE, '%ACCENT%': ACCENT, '%GOLD%': GOLD, '%MOOD0%': MOODS[0][1], '%SPARKS%': sparks,
             '%MFLAME%': flame('mf', 540, 1000, 130, 210),
             '%FIRE%': flame('f1', 430, 1060, 230, 300) + flame('f2', 650, 1060, 230, 320) + flame('f0', 540, 1062, 330, 470) + flame('f3', 545, 1062, 150, 210),
             '%POTFIRE%': flame('pf0', 430, 1320, 150, 190) + flame('pf2', 650, 1320, 150, 200) + flame('pf1', 540, 1320, 200, 250),
             '%BUBBLES%': bubbles, '%GERMS%': germs, '%KICKER%': course['meter']['kicker'], '%CHAPTERS%': chapters,
             '%PREMISE%': course['premise'].split('. ', 1)[1], '%TITLE%': course['title'],
             '%MOODS%': json.dumps(MOODS), '%ORDER%': json.dumps(ORDER)}.items():
    html = html.replace(k, v)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
open(os.path.join(HERE, 'out', 'scratch.html'), 'w').write(html)
print('wrote out/scratch.html')
