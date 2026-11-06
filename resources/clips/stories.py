# Builds out/story-<name>.html: animated Strange Politics stories driven by window.setT(t), with sound from window.SFX.
# Each story is a few big moments with one headline apiece, then the end card. Facts come from the politics-strange lessons.
# Usage: python3 stories.py && node render-anim.mjs out/story-<name>.html <seconds from LENGTHS> ~/Videos/Nous/nous-politics-<name>.mp4
import json, math, os, random, re
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'store-shots', 'fonts')
SIMFX = os.path.abspath(os.path.join(HERE, '..', '..', 'wwwroot', 'js', 'simfx.js'))
ACCENT, BLUE, RED, INK = '#9A7417', '#3D5BD9', '#D44A3A', '#2A211B'
LENGTHS = {'virginia-tie': 14.6, '27th': 15.0, 'ostraka': 14.2}

BASE_CSS = f"""
@font-face{{font-family:'Fraunces';font-weight:600;src:url('file://{FONTS}/fraunces-latin-600-normal.woff2') format('woff2')}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden}}
body{{background:radial-gradient(1000px 800px at 50% 8%,#FBF8F2 0%,#F4EFE6 55%,#EAE3D7 100%);font-family:'Noto Sans',sans-serif;color:{INK};position:relative}}
.k{{position:absolute;left:0;right:0;top:118px;text-align:center;font:700 30px 'Noto Sans',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:{ACCENT}}}
.h{{position:absolute;left:60px;right:60px;top:170px;height:260px;display:flex;align-items:center;justify-content:center;text-align:center;
  font:600 92px/1.04 'Fraunces',Georgia,serif;letter-spacing:-0.015em;text-wrap:balance;opacity:0}}
.h em{{font-style:normal;color:{ACCENT}}}
.cap{{position:absolute;z-index:10;left:90px;right:90px;top:1560px;text-align:center;font:600 46px/1.3 'Noto Sans',sans-serif;color:#5A4D42;text-wrap:balance;opacity:0}}
.abs{{position:absolute}}
#end{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;text-align:center;
  background:radial-gradient(1000px 800px at 50% 30%,#FBF8F2 0%,#F4EFE6 60%,#EAE3D7 100%);opacity:0;z-index:50}}
#end .icon{{width:220px;height:220px;border-radius:50px;box-shadow:0 30px 70px rgba(42,33,27,.25);overflow:hidden}}
#end .icon img{{width:100%;height:100%}} #end .word{{width:360px}}
#end h2{{font:600 96px/1 'Fraunces',Georgia,serif;color:{ACCENT};margin-top:20px}}
#end p{{font-size:44px;font-weight:600;color:#5A4D42;max-width:860px;line-height:1.28;text-wrap:balance}}
#end .cta{{margin-top:10px;padding:26px 60px;border-radius:60px;background:{ACCENT};color:#fff;font-size:44px;font-weight:800}}
"""

END = f"""<div id="end"><div class="icon"><img src="file://{HERE}/nous-icon.svg"></div><img class="word" src="file://{HERE}/nous-wordmark.svg">
<h2>Strange Politics</h2><p>%s</p><div class="cta">Free on Google Play</div></div>"""

HELPERS = """
const clamp = x => Math.min(1, Math.max(0, x)), lerp = (a, b, x) => a + (b - a) * x;
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = x => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const $ = id => document.getElementById(id);
let T = 0;
const win = (t0, t1, t2, t3) => Math.min(easeOut((T - t0) / (t1 - t0)), 1 - easeOut((T - t2) / (t3 - t2)));
// A headline or caption fades and rises in, and fades out.
const show = (id, t0, t1, rise = 26) => { const o = win(t0, t0 + .45, t1 - .3, t1); const e = $(id); e.style.opacity = o;
  e.style.transform = `translateY(${(1 - easeOut((T - t0) / .45)) * rise}px)`; return o; };
const set = (id, css) => Object.assign($(id).style, css);
// Story sounds, built on SimFx's voice API so render-anim.mjs can render them offline.
const nz = (ctx, d) => { const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * d), ctx.sampleRate), x = b.getChannelData(0);
  for (let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; const s = ctx.createBufferSource(); s.buffer = b; return s; };
const envG = (ctx, t, a, p, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); return g; };
const filt = (ctx, type, f, q) => { const x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q || 1; return x; };
SimFx.addVoice('scratch', (ctx, out, t, o) => { const d = o.dur || .13, s = nz(ctx, d + .03), f = filt(ctx, 'bandpass', o.freq || 3400, 1.6), g = envG(ctx, t, .012, o.gain || .14, d);
  s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + d + .03); });
SimFx.addVoice('clink', (ctx, out, t, o) => { [1, 2.76, 5.4].forEach((m, i) => { const x = ctx.createOscillator(); x.type = 'sine'; x.frequency.value = (o.freq || 1300) * m;
  const g = envG(ctx, t, .002, (o.gain || .09) / (1 + i), .3 / (1 + i * .5)); x.connect(g); g.connect(out); x.start(t); x.stop(t + .5); }); });
SimFx.addVoice('stamp', (ctx, out, t, o) => { const p = o.gain || .4, s = nz(ctx, .14), f = filt(ctx, 'lowpass', 1100), g = envG(ctx, t, .002, p, .1);
  s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + .16);
  const x = ctx.createOscillator(); x.type = 'sine'; x.frequency.setValueAtTime(150, t); x.frequency.exponentialRampToValueAtTime(55, t + .14);
  const g2 = envG(ctx, t, .003, p * .9, .16); x.connect(g2); g2.connect(out); x.start(t); x.stop(t + .25); });
SimFx.addVoice('whoosh', (ctx, out, t, o) => { const d = o.dur || .35, s = nz(ctx, d), f = filt(ctx, 'bandpass', 500, .8);
  f.frequency.setValueAtTime(o.from || 380, t); f.frequency.exponentialRampToValueAtTime(o.to || 2600, t + d);
  const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(o.gain || .07, t + d * .6); g.gain.linearRampToValueAtTime(.0001, t + d);
  s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + d); });
SimFx.addVoice('clack', (ctx, out, t, o) => { const f0 = o.freq || 900, s = nz(ctx, .05), f = filt(ctx, 'bandpass', f0 * 2.2, 3), g = envG(ctx, t, .001, o.gain || .12, .04);
  s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + .06);
  const x = ctx.createOscillator(); x.type = 'triangle'; x.frequency.setValueAtTime(f0, t); x.frequency.exponentialRampToValueAtTime(f0 * .7, t + .06);
  const g2 = envG(ctx, t, .002, (o.gain || .12) * .7, .07); x.connect(g2); g2.connect(out); x.start(t); x.stop(t + .1); });
SimFx.addVoice('splash', (ctx, out, t, o) => { const d = .6, s = nz(ctx, d), f = filt(ctx, 'lowpass', 1600, .7), g = envG(ctx, t, .01, o.gain || .22, d);
  f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(300, t + d); s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + d); });
"""


def page(name, css, body, js, sfx, end_line):
    # A headline is one flex item, so its accent words wrap with the rest of the line.
    body = re.sub(r'(<div class="h" id="h\d">)(.*?)(</div>)', r'\1<span>\2</span>\3', body)
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE_CSS}{css}</style>
<script src="file://{SIMFX}"></script></head><body><div class="k">Strange Politics</div>
{body}{END % end_line}
<script>{HELPERS}
window.SFX = {json.dumps(sfx)};
window.setT = t => {{ T = t;
{js}
  $('end').style.opacity = easeOut((t - {LENGTHS[name] - 2.0:.2f}) / .5);
}};
window.setT(0);
</script></body></html>"""
    assert '—' not in html
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    open(os.path.join(HERE, 'out', f'story-{name}.html'), 'w').write(html)
    print(f'wrote out/story-{name}.html ({LENGTHS[name]} s)')


def S(t, name, **o): return {'t': round(t, 3), 'name': name, 'o': o}


# ── Virginia 2017: a one-vote recount lead, a court makes it a tie, two film canisters in a bowl, one comes out ──
def virginia():
    rows, seats = [(5, 220), (6, 270), (7, 320), (8, 370), (9, 420)], []
    total_r = sum(r for _, r in rows)
    counts = [round(100 * r / total_r) for _, r in rows]; counts[-1] += 100 - sum(counts)
    for (k, r), n in zip(rows, counts):
        for i in range(n):
            a = math.pi * (1 - i / (n - 1))
            seats.append((a, 540 + r * math.cos(a), 1290 - r * math.sin(a)))
    seats.sort(key=lambda s: -s[0])
    seat_html = ''.join(f'<circle class="seat {"d" if i < 49 else "t" if i == 49 else "r"}" id="s{i}" cx="{x:.1f}" cy="{y:.1f}" r="19"/>' for i, (_, x, y) in enumerate(seats))
    order = sorted(range(100), key=lambda i: seats[i][0], reverse=True)

    css = f"""
.panel{{position:absolute;top:520px;width:430px;height:430px;border-radius:36px;background:#FFFDF9;box-shadow:0 24px 60px rgba(42,33,27,.16);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-top:16px solid;opacity:0}}
.panel .nm{{font:600 60px 'Fraunces',Georgia,serif}} .panel .pt{{font:700 32px 'Noto Sans',sans-serif;letter-spacing:.08em;color:#8A7C6E}}
.panel .n{{font:600 118px 'Fraunces',Georgia,serif;font-variant-numeric:tabular-nums;margin-top:18px}}
#pl{{left:90px;border-color:{BLUE}}} #pr{{left:560px;border-color:{RED}}}
.lead{{position:absolute;top:990px;left:0;right:0;text-align:center;font:700 44px 'Noto Sans',sans-serif;color:#5A4D42;opacity:0}}
#tie{{position:absolute;left:540px;top:740px;width:520px;margin-left:-260px;text-align:center;font:900 190px/1 'Noto Sans',sans-serif;color:{ACCENT};
  border:16px solid {ACCENT};border-radius:30px;background:rgba(251,248,242,.88);opacity:0;letter-spacing:.06em}}
.can{{position:absolute;width:150px;height:215px;margin:-107px 0 0 -75px;opacity:0}}
.can .body{{position:absolute;left:10px;right:10px;top:32px;bottom:0;border-radius:10px 10px 16px 16px;background:linear-gradient(90deg,#1C1916,#45403A 45%,#1C1916)}}
.can .lid{{position:absolute;left:0;right:0;top:0;height:42px;border-radius:12px;background:linear-gradient(90deg,#8D949C,#D3D8DD 45%,#8D949C)}}
.slipn{{position:absolute;font:700 46px 'Noto Sans',sans-serif;letter-spacing:.06em;transform:translateX(-50%);white-space:nowrap;opacity:0;
  padding:8px 18px;background:#FFFDF9;border-radius:8px;box-shadow:0 6px 14px rgba(42,33,27,.15)}}
#bowl{{position:absolute;left:0;top:0;opacity:0;transform-origin:540px 1240px}}
#slip{{position:absolute;left:540px;top:860px;width:760px;height:220px;margin-left:-380px;background:#FFFDF9;border-radius:14px;
  box-shadow:0 24px 50px rgba(42,33,27,.2);display:flex;align-items:center;justify-content:center;font:600 150px 'Fraunces',Georgia,serif;
  letter-spacing:.04em;color:{INK};transform-origin:50% 50%;opacity:0;overflow:hidden}}
#house{{position:absolute;left:0;top:0;opacity:0}}
.seat{{transform-box:fill-box;transform-origin:center}} .seat.d{{fill:{BLUE}}} .seat.r{{fill:{RED}}} .seat.t{{fill:#B9AE9F}}
#score{{position:absolute;top:1340px;left:0;right:0;text-align:center;font:600 120px 'Fraunces',Georgia,serif;opacity:0}}
"""
    body = f"""
<div class="h" id="h1">A tie for control of <em>Virginia's House</em></div>
<div class="h" id="h2">So they drew a name <em>from a bowl</em></div>
<div class="h" id="h3">One canister <em>comes out</em></div>
<div class="h" id="h4">Control of the House: <em>51 to 49</em></div>
<div class="panel" id="pl"><div class="nm">Simonds</div><div class="pt">DEMOCRAT</div><div class="n" id="nl">11,400</div></div>
<div class="panel" id="pr"><div class="nm">Yancey</div><div class="pt">REPUBLICAN</div><div class="n" id="nr">11,400</div></div>
<div class="lead" id="lead1">After the recount: ahead by one vote</div>
<div class="lead" id="lead2">Then a court counts one more ballot</div>
<div id="tie">TIE</div>
<div class="slipn" id="n1" style="left:380px;top:560px;color:{BLUE}">SIMONDS</div>
<div class="slipn" id="n2" style="left:700px;top:560px;color:{RED}">YANCEY</div>
<div class="can" id="c1"><div class="body"></div><div class="lid"></div></div>
<div class="can" id="c2"><div class="body"></div><div class="lid"></div></div>
<svg id="bowl" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs><linearGradient id="bg" x1="0" x2="1"><stop offset="0" stop-color="#1F4E8C"/><stop offset=".5" stop-color="#3C7BC8"/><stop offset="1" stop-color="#1F4E8C"/></linearGradient></defs>
  <ellipse cx="540" cy="1110" rx="300" ry="62" fill="#163B6B"/>
  <path d="M240 1110 Q250 1330 540 1350 Q830 1330 840 1110 Q690 1172 540 1172 Q390 1172 240 1110 Z" fill="url(#bg)"/>
  <ellipse cx="540" cy="1110" rx="300" ry="62" fill="none" stroke="#5E97DA" stroke-width="10"/>
  <ellipse cx="540" cy="1370" rx="150" ry="20" fill="rgba(42,33,27,.12)"/>
</svg>
<div id="slip">YANCEY</div>
<svg id="house" width="1080" height="1920" viewBox="0 0 1080 1920">{seat_html}</svg>
<div id="score"><span style="color:{RED}">51</span> <span style="color:#B9AE9F">–</span> <span style="color:{BLUE}">49</span></div>
<div class="cap" id="k4">Settled on January 4, 2018</div>
"""
    js = f"""
  show('h1', .1, 3.7); show('h2', 3.7, 7.0); show('h3', 7.0, 9.8); show('h4', 9.8, 12.7); show('k4', 10.9, 12.7);
  const po = win(.2, .6, 3.6, 3.9);
  ['pl', 'pr'].forEach((id, i) => set(id, {{ opacity: po, transform: `translateY(${{(1 - easeOut((t - .2 - i * .1) / .5)) * 60}}px)` }}));
  const u = easeOut((t - .5) / 1.6), fmt = n => n.toLocaleString('en-US');
  $('nl').textContent = fmt(Math.round(lerp(11400, 11608, u)));
  const plus = t >= 2.75;
  $('nr').textContent = fmt(plus ? 11608 : Math.round(lerp(11400, 11607, u)));
  set('nr', {{ transform: `scale(${{1 + .22 * Math.sin(Math.PI * clamp((t - 2.75) / .3))}})`, color: plus ? '{ACCENT}' : '{INK}' }});
  set('lead1', {{ opacity: win(2.05, 2.25, 2.6, 2.75) }}); set('lead2', {{ opacity: win(2.6, 2.8, 3.5, 3.8) }});
  set('tie', {{ opacity: clamp((t - 3.0) / .08) * (1 - easeOut((t - 3.6) / .3)), transform: `rotate(-8deg) scale(${{lerp(2.3, 1, easeOut((t - 3.0) / .22))}})` }});
  // Canisters: names go in, lids close, both drop into the bowl, the bowl is shaken, one comes back out.
  const no = win(3.9, 4.2, 4.6, 4.8);
  set('n1', {{ opacity: no, transform: `translate(-50%, ${{easeInOut((t - 4.3) / .4) * 70}}px)` }});
  set('n2', {{ opacity: no, transform: `translate(-50%, ${{easeInOut((t - 4.35) / .4) * 70}}px)` }});
  set('bowl', {{ opacity: win(3.9, 4.3, 9.6, 9.9), transform: `rotate(${{Math.sin((t - 5.6) * 26) * 4 * clamp((t - 5.6) / .2) * (1 - clamp((t - 6.6) / .2))}}deg)` }});
  [[1, 380, 4.9], [2, 700, 5.15]].forEach(([k, x0, td]) => {{
    const c = $('c' + k), d = easeInOut((t - td) / .45), out = k === 2 ? easeOut((t - 7.05) / .55) : 0;
    const x = lerp(x0, k === 1 ? 500 : 580, d), y = lerp(720, 1110, d * d) - out * 430, rot = lerp(0, k === 1 ? -50 : 40, d) * (1 - out);
    const sunk = d >= 1 && out === 0;
    c.style.left = (k === 2 && out > 0 ? lerp(580, 540, out) : x) + 'px'; c.style.top = y + 'px';
    c.style.opacity = clamp((t - 3.95) / .3) * (sunk ? 0 : 1) * (k === 2 ? 1 - easeOut((t - 7.9) / .25) : 1 - clamp((t - 9.6) / .3));
    c.style.transform = `rotate(${{rot}}deg) scale(${{k === 2 ? lerp(1, 1.5, out) : 1}})`;
    c.querySelector('.lid').style.transform = `translateY(${{(k === 2 ? -easeOut((t - 7.7) / .25) * 80 : 0)}}px)`;
  }});
  const sl = easeOut((t - 7.95) / .45);
  set('slip', {{ opacity: clamp((t - 7.9) / .1) * (1 - easeOut((t - 9.55) / .3)), transform: `scaleX(${{lerp(.08, 1, sl)}}) scaleY(${{lerp(.6, 1, sl)}})` }});
  // The House: 49 Democrats, 50 Republicans and the tied seat, which goes red.
  set('house', {{ opacity: win(9.8, 10.1, 99, 100) }});
  const ord = {json.dumps(order)};
  ord.forEach((s, k) => {{ const e = $('s' + s), a = back((t - 9.9 - k * .006) / .3); e.style.transform = `scale(${{a}})`; }});
  const tied = $('s49'), flip = t >= 10.9;
  tied.setAttribute('class', 'seat ' + (flip ? 'r' : 't'));
  tied.style.transform = `scale(${{flip ? 1 + .9 * Math.sin(Math.PI * clamp((t - 10.9) / .35)) : 1 + .25 * Math.sin(t * 9) * clamp((t - 10.2) / .2)}})`;
  set('score', {{ opacity: easeOut((t - 11.05) / .35), transform: `scale(${{lerp(.7, 1, back((t - 11.05) / .4))}})` }});
"""
    sfx = [S(.25, 'whoosh', gain=.05)]
    for i in range(26):
        u = i / 25
        sfx.append(S(.5 + 1.6 * (1 - (1 - u) ** 1.6), 'tick', freq=700 + 500 * u, gain=.05, decay=.04))
    sfx += [S(2.75, 'pop', **{'from': 500, 'to': 1300, 'gain': .12}), S(3.0, 'stamp', gain=.45),
            S(4.3, 'scratch', freq=2400, dur=.25, gain=.06), S(4.6, 'click', gain=.18), S(4.65, 'click', gain=.18),
            S(5.3, 'clink', freq=1250, gain=.1), S(5.58, 'clink', freq=1420, gain=.1)]
    sfx += [S(5.7 + i * .085, 'clink', freq=1100 + (i % 3) * 180, gain=.05) for i in range(10)]
    sfx += [S(7.05, 'whoosh', gain=.08, dur=.45), S(7.75, 'pop', **{'from': 300, 'to': 900, 'gain': .14}), S(7.95, 'scratch', freq=1800, dur=.35, gain=.08),
            S(8.25, 'chime', freq=523, gain=.1)]
    sfx += [S(9.9 + k * .006 * 6, 'tick', freq=600 + k * 8, gain=.025, decay=.03) for k in range(0, 100, 6)]
    sfx += [S(10.9, 'thunk', gain=.4), S(10.92, 'pop', **{'from': 400, 'to': 1100, 'gain': .12}), S(11.1, 'chime', freq=392, gain=.08)]
    page('virginia-tie', css, body, js, sfx, 'Government by lottery, pottery ballots, elections drawn from a bowl.')


# ── The 27th Amendment: proposed in 1789, forgotten, a C on a term paper, letters to the states, ratified in 1992, and the A ──
def amendment():
    env = ''.join(f'<div class="env" id="e{i}"></div>' for i in range(10))
    css = f"""
#parch{{position:absolute;left:190px;top:520px;width:700px;height:480px;border-radius:12px;background:linear-gradient(160deg,#F3E4C4,#E6D0A3);
  box-shadow:0 26px 60px rgba(42,33,27,.2);padding:54px 60px;opacity:0;transform-origin:50% 50%}}
#parch h3{{font:600 50px/1.1 'Fraunces',Georgia,serif;color:#5B4320;text-align:center;margin-bottom:26px}}
#parch p{{font:italic 30px/1.55 'DejaVu Serif',Georgia,serif;color:#6E5530;text-align:center}}
#seal{{position:absolute;right:46px;bottom:-34px;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#C0473A,#8E2A20);
  box-shadow:0 8px 18px rgba(42,33,27,.3)}}
#year{{position:absolute;left:0;right:0;top:1110px;text-align:center;font:600 250px/1 'Fraunces',Georgia,serif;font-variant-numeric:tabular-nums;opacity:0}}
#paper{{position:absolute;left:230px;top:500px;width:620px;height:800px;background:#FFFEFB;border-radius:10px;box-shadow:0 30px 70px rgba(42,33,27,.22);
  padding:70px 64px;opacity:0;transform-origin:50% 0}}
#paper .ln{{height:4px;background:#D8E3F0;margin:44px 0 0}} #paper .ln.s{{width:62%}}
#paper .t{{font:700 40px 'Noto Sans',sans-serif;color:#2F3B52}} #paper .nm{{font:500 32px 'Noto Sans',sans-serif;color:#6A7387;margin-top:10px}}
#grade{{position:absolute;left:600px;top:520px;font:italic 700 300px/1 'DejaVu Serif',Georgia,serif;color:#C33A2C;opacity:0;transform-origin:50% 60%}}
#gradeA{{position:absolute;left:470px;top:1000px;font:italic 700 300px/1 'DejaVu Serif',Georgia,serif;color:#2E8B57;opacity:0;transform-origin:50% 60%}}
#strike{{position:absolute;left:585px;top:690px;height:20px;width:0;background:#2A211B;border-radius:10px;transform:rotate(-24deg);transform-origin:0 50%;opacity:0}}
.env{{position:absolute;width:120px;height:80px;margin:-40px 0 0 -60px;border-radius:8px;background:#FFFDF9;border:4px solid #CDBFA8;opacity:0;
  background-image:linear-gradient(155deg,transparent 48%,#CDBFA8 49%,#CDBFA8 52%,transparent 53%),linear-gradient(25deg,transparent 48%,#CDBFA8 49%,#CDBFA8 52%,transparent 53%)}}
#bar{{position:absolute;left:120px;right:120px;top:1250px;height:70px;border-radius:35px;background:#E3DACB;overflow:hidden;opacity:0}}
#bar i{{display:block;height:100%;width:0;background:{ACCENT};border-radius:35px}}
#mark{{position:absolute;left:{120 + 840 * .76:.0f}px;top:1225px;width:8px;height:120px;background:{INK};border-radius:4px;opacity:0}}
#barlbl{{position:absolute;left:0;right:0;top:1360px;text-align:center;font:700 44px 'Noto Sans',sans-serif;color:#5A4D42;opacity:0}}
#rat{{position:absolute;left:540px;top:1080px;width:760px;margin-left:-380px;text-align:center;font:900 110px/1.1 'Noto Sans',sans-serif;color:{ACCENT};
  border:14px solid {ACCENT};border-radius:28px;padding:16px 0;background:rgba(251,248,242,.9);opacity:0;letter-spacing:.05em}}
"""
    body = f"""
<div class="h" id="h1">A pay amendment from <em>1789</em></div>
<div class="h" id="h2">Then forgotten for <em>193 years</em></div>
<div class="h" id="h3">A student's paper on it <em>got a C</em></div>
<div class="h" id="h4">So he got the states <em>to ratify it</em></div>
<div class="h" id="h5">And his C? <em>Now an A</em></div>
<div id="parch"><h3>Congressional Pay</h3><p>No law, varying the compensation for the services of the Senators and Representatives, shall take effect, until an election of Representatives shall have intervened.</p><div id="seal"></div></div>
<div id="year">1789</div>
<div id="paper"><div class="t">Government class, 1982</div><div class="nm">Gregory Watson</div>
{''.join('<div class="ln"></div>' if i % 4 != 3 else '<div class="ln s"></div>' for i in range(11))}</div>
<div id="grade">C</div><div id="strike"></div><div id="gradeA">A</div>
{env}
<div id="bar"><i id="fill"></i></div><div id="mark"></div><div id="barlbl">Three-fourths of the states</div>
<div id="rat">RATIFIED 1992</div>
<div class="cap" id="k4">202 years after it was proposed</div>
<div class="cap" id="k5">His grade was changed in 2017</div>
"""
    js = f"""
  show('h1', .1, 3.2); show('h2', 3.2, 5.8); show('h3', 5.8, 8.4); show('h4', 8.4, 11.0); show('h5', 11.0, 13.1);
  show('k4', 10.3, 11.1); show('k5', 11.9, 13.1);
  const fadeAge = easeInOut((t - 3.4) / 1.8);
  set('parch', {{ opacity: win(.15, .55, 5.3, 5.8), filter: `grayscale(${{fadeAge * .9}}) blur(${{fadeAge * 2}}px)`,
    transform: `rotate(${{-2 + fadeAge * 4}}deg) translateY(${{(1 - easeOut((t - .15) / .5)) * 50 + fadeAge * 60}}px) scale(${{1 - fadeAge * .08}})` }});
  // The year rolls from 1789 to 1982 (slow, then fast, then slow), and later on to 1992.
  const y = t < 8 ? lerp(1789, 1982, easeInOut((t - 3.3) / 2.2)) : lerp(1982, 1992, easeInOut((t - 8.7) / 1.5));
  $('year').textContent = Math.round(y);
  const ys = t < 5.8 ? 1 : lerp(1, .5, easeInOut((t - 5.8) / .4));
  set('year', {{ opacity: Math.min(easeOut((t - .5) / .4), 1 - easeOut((t - 10.15) / .15)), transform: `translateY(${{t < 5.8 ? 0 : lerp(0, 330, easeInOut((t - 5.8) / .4))}}px) scale(${{ys}})`,
    color: t > 10.1 ? '{ACCENT}' : '{INK}' }});
  // The term paper slides in, takes its C, steps aside for the campaign, and comes back for the A.
  const pin = easeOut((t - 5.9) / .45), aside = easeInOut((t - 8.4) / .4), back2 = easeInOut((t - 11.0) / .45);
  const px = lerp(700, 0, pin) + lerp(0, -230, aside) * (1 - back2), sc = lerp(1, .55, aside * (1 - back2));
  set('paper', {{ opacity: clamp(pin * 2), transform: `translateX(${{px}}px) translateY(${{lerp(0, -40, aside * (1 - back2))}}px) scale(${{sc}}) rotate(${{lerp(6, -2, pin)}}deg)` }});
  const g = clamp((t - 6.9) / .06);
  set('grade', {{ opacity: g * (1 - aside * (1 - back2)), transform: `rotate(-12deg) scale(${{lerp(2.2, 1, easeOut((t - 6.9) / .2))}})` }});
  set('strike', {{ opacity: clamp((t - 11.6) / .05), width: lerp(0, 300, easeOut((t - 11.6) / .3)) + 'px' }});
  set('gradeA', {{ opacity: clamp((t - 12.0) / .06), transform: `rotate(-8deg) scale(${{lerp(1.9, 1, back((t - 12.0) / .3))}})` }});
  // Letters fly out to the states while the bar fills to three-fourths.
  for (let i = 0; i < 10; i++) {{
    const e = $('e' + i), u = easeInOut((t - 8.7 - i * .14) / .7), x0 = 330, y0 = 700, x1 = 460 + (i % 5) * 120, y1 = 1180 - Math.floor(i / 5) * 18;
    e.style.left = lerp(x0, x1, u) + 'px'; e.style.top = (lerp(y0, y1, u) - Math.sin(Math.PI * u) * 260) + 'px';
    e.style.opacity = clamp(u * 6) * (1 - clamp((u - .9) * 10)); e.style.transform = `rotate(${{lerp(-20, 15, u)}}deg)`;
  }}
  const bo = win(8.6, 8.9, 10.0, 10.2);
  set('bar', {{ opacity: bo }}); set('mark', {{ opacity: bo }}); set('barlbl', {{ opacity: bo }});
  $('fill').style.width = lerp(22, 76, easeInOut((t - 8.8) / 1.4)) + '%';
  set('rat', {{ opacity: clamp((t - 10.2) / .06) * (1 - easeOut((t - 10.85) / .25)), transform: `rotate(-6deg) scale(${{lerp(2.1, 1, easeOut((t - 10.2) / .2))}})` }});
"""
    sfx = [S(.2, 'whoosh', gain=.05), S(.55, 'stamp', gain=.2)]
    k, prev = 0, 1789
    for i in range(1, 60):
        tt = 3.3 + 2.2 * i / 60
        yv = round(1789 + 193 * (lambda x: 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2)(i / 60))
        if yv != prev and (yv - prev >= 3 or i % 3 == 0): sfx.append(S(tt, 'tick', freq=520 + (yv - 1789) * 2.4, gain=.04, decay=.03)); prev = yv
    sfx += [S(5.9, 'whoosh', gain=.08, dur=.4), S(6.9, 'stamp', gain=.45)]
    sfx += [S(8.7 + i * .14, 'whoosh', gain=.035, dur=.3, **{'from': 700, 'to': 3000}) for i in range(10)]
    sfx += [S(8.8 + 1.4 * i / 14, 'tick', freq=700 + i * 40, gain=.035, decay=.03) for i in range(15)]
    sfx += [S(10.2, 'stamp', gain=.45), S(10.3, 'chime', freq=523, gain=.09), S(11.6, 'scratch', freq=1600, dur=.28, gain=.09),
            S(12.0, 'pop', **{'from': 400, 'to': 1200, 'gain': .14}), S(12.05, 'chime', freq=659, gain=.1)]
    page('27th', css, body, js, sfx, 'Government by lottery, pottery ballots, elections drawn from a bowl.')


# ── Themistocles' ostraka: a name scratched on a shard, 190 of them in a well, sorted into the 14 hands that wrote them ──
def ostraka():
    rng = random.Random(482)
    def shard_path(w, h):
        n, pts = 9, []
        for i in range(n):
            a = 2 * math.pi * i / n + rng.uniform(-.25, .25)
            r = rng.uniform(.72, 1.0)
            pts.append((w / 2 + math.cos(a) * w / 2 * r, h / 2 + math.sin(a) * h / 2 * r))
        return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + ' Z'
    # 190 shards: a 10 x 19 grid, then 14 clusters (the hands) of uneven size.
    sizes = [rng.randint(9, 18) for _ in range(14)]
    while sum(sizes) != 190:
        i = rng.randrange(14); sizes[i] += 1 if sum(sizes) < 190 else -1
        sizes[i] = max(6, sizes[i])
    hand = [h for h, n in enumerate(sizes) for _ in range(n)]; rng.shuffle(hand)
    grid = [(135 + (i % 10) * 90, 520 + (i // 10) * 50) for i in range(190)]
    centers = [(200 + (h % 4) * 227, 560 + (h // 4) * 225) for h in range(14)]
    placed, slot = [], [0] * 14
    for i in range(190):
        h = hand[i]; k = slot[h]; slot[h] += 1
        cx, cy = centers[h]
        placed.append((cx - 75 + (k % 4) * 50, cy - 70 + (k // 4) * 34))
    hues = [8, 28, 46, 90, 140, 170, 195, 215, 240, 265, 290, 315, 335, 355]
    shards = ''.join(f'<path class="sh" id="o{i}" d="{shard_path(64, 40)}" style="--h:{hues[hand[i]]}"/>' for i in range(190))
    labels = ''.join(f'<text class="hl" id="l{h}" x="{centers[h][0]}" y="{centers[h][1] + 108}">{h + 1}</text>' for h in range(14))
    order = list(range(190)); rng.shuffle(order); drop_at = {i: 3.4 + 2.0 * k / 190 for k, i in enumerate(order)}
    big = shard_path(780, 470)
    letters = 'ΘΕΜΙΣΘΟΚΛΕΣ'
    css = f"""
#bigsvg{{position:absolute;left:0;top:0;opacity:0}}
.big{{fill:#B9643C;stroke:#8E4425;stroke-width:6}}
.gl{{font:400 70px 'DejaVu Sans',sans-serif;fill:#2B1A12;letter-spacing:4px;opacity:0}}
#field{{position:absolute;left:0;top:0}}
.sh{{fill:hsl(18 52% 50%);stroke:hsl(18 50% 34%);stroke-width:2.5;transform-box:fill-box;transform-origin:center;opacity:0}}
.sorted .sh{{fill:hsl(var(--h) 55% 56%);stroke:hsl(var(--h) 50% 32%)}}
.hl{{font:700 40px 'Noto Sans',sans-serif;fill:#5A4D42;text-anchor:middle;opacity:0}}
#count{{position:absolute;left:0;right:0;top:1480px;text-align:center;font:600 150px 'Fraunces',Georgia,serif;opacity:0;font-variant-numeric:tabular-nums}}
#well{{position:absolute;left:0;top:0;opacity:0}}
"""
    glyphs = ''.join(f'<tspan id="g{i}">{c}</tspan>' for i, c in enumerate(letters))
    body = f"""
<div class="h" id="h1">Athens voted leaders out <em>on pottery</em></div>
<div class="h" id="h2">One well held <em>190 of them</em></div>
<div class="h" id="h3">Written by just <em>14 hands</em></div>
<div class="h" id="h4">Ballots made in bulk. <em>Never cast.</em></div>
<div class="cap" id="k1">The name is Themistocles</div>
<div class="cap" id="k4">Found down a well on the Acropolis, 1937</div>
<svg id="well" width="1080" height="1920" viewBox="0 0 1080 1920">
  <rect x="300" y="1180" width="480" height="330" fill="#3A2E25"/><rect x="300" y="1180" width="480" height="330" fill="url(#wg)"/>
  <defs><linearGradient id="wg" x1="0" x2="1"><stop offset="0" stop-color="rgba(0,0,0,.45)"/><stop offset=".5" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,.45)"/></linearGradient></defs>
  <rect x="250" y="1150" width="580" height="50" rx="10" fill="#9C8F80"/><rect x="0" y="1170" width="300" height="750" fill="#D8CDBD"/><rect x="780" y="1170" width="300" height="750" fill="#D8CDBD"/><rect x="0" y="1510" width="1080" height="410" fill="#D8CDBD"/>
</svg>
<svg id="field" width="1080" height="1920" viewBox="0 0 1080 1920">{shards}{labels}</svg>
<svg id="bigsvg" width="1080" height="1920" viewBox="0 0 1080 1920"><g id="bigg" transform="translate(150 640)">
  <path class="big" d="{big}"/><text class="gl" id="gtxt" x="390" y="260" text-anchor="middle">{glyphs}</text></g></svg>
<div id="count">0</div>
"""
    js = f"""
  show('h1', .1, 3.1); show('h2', 3.1, 6.3); show('h3', 6.3, 9.4); show('h4', 9.4, 12.2); show('k1', 2.2, 3.1); show('k4', 10.6, 12.2);
  // The name is scratched in letter by letter, then the big shard shrinks into the pile.
  const bo = easeOut((t - .2) / .4), shrink = easeInOut((t - 3.0) / .5);
  set('bigsvg', {{ opacity: bo * (1 - shrink) }});
  $('bigg').setAttribute('transform', `translate(${{lerp(150, 450, shrink)}} ${{lerp(640, 560, shrink)}}) scale(${{lerp(1, .1, shrink)}})`);
  $('gtxt').style.opacity = 1;
  for (let i = 0; i < {len(letters)}; i++) $('g' + i).style.opacity = clamp((t - .7 - i * .13) / .08);
  const sorted = t >= 6.5, sink = easeInOut((t - 9.9) / .9);
  $('field').classList.toggle('sorted', sorted);
  const G = {json.dumps(grid)}, P = {json.dumps(placed)}, D = {json.dumps([drop_at[i] for i in range(190)])}, H = {json.dumps(hand)};
  let landed = 0;
  for (let i = 0; i < 190; i++) {{
    const e = $('o' + i), d = easeOut((t - D[i]) / .35); if (t >= D[i] + .2) landed++;
    const m = easeInOut((t - 6.45 - H[i] * .045) / .7);
    let x = lerp(G[i][0], P[i][0], m), y = lerp(G[i][1], P[i][1], m) - (1 - d) * 520;
    y = lerp(y, 1330 + (i % 7) * 22, sink); x = lerp(x, 540 + ((i * 37) % 300) - 150, sink);
    e.style.opacity = clamp(d * 3);
    e.style.transform = `translate(${{x - 32}}px, ${{y - 20}}px) rotate(${{(i * 47) % 50 - 25 + (1 - d) * 90}}deg) scale(${{lerp(1, .5, sink)}})`;
  }}
  set('count', {{ opacity: win(3.4, 3.7, 6.2, 6.5) }}); $('count').textContent = Math.min(190, Math.round(landed));
  for (let h = 0; h < 14; h++) $('l' + h).style.opacity = clamp((t - 7.3 - h * .08) / .15) * (1 - clamp((t - 9.5) / .3));
  set('well', {{ opacity: win(9.5, 9.85, 99, 100) }});
"""
    sfx = [S(.2, 'whoosh', gain=.05)]
    sfx += [S(.7 + i * .13, 'scratch', freq=2900 + (i % 3) * 400, dur=.1, gain=.11) for i in range(len(letters))]
    sfx += [S(3.0, 'whoosh', gain=.06, dur=.45, **{'from': 2400, 'to': 500})]
    for k, i in enumerate(order):
        if k % 5 == 0: sfx.append(S(drop_at[i] + .3, 'clack', freq=780 + (k % 9) * 40, gain=.08))
    sfx += [S(6.45, 'whoosh', gain=.07, dur=.7)]
    sfx += [S(7.3 + h * .08, 'pop', **{'from': 300 + h * 25, 'to': 700 + h * 45, 'gain': .07}) for h in range(14)]
    sfx += [S(8.5, 'thunk', gain=.3), S(9.9, 'whoosh', gain=.08, dur=.8, **{'from': 1800, 'to': 300}), S(10.7, 'splash', gain=.28)]
    page('ostraka', css, body, js, sfx, 'Government by lottery, pottery ballots, elections drawn from a bowl.')


virginia(); amendment(); ostraka()
