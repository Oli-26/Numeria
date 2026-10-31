# Builds out/connects.html: the store poster (../store-shots/posters/subjects.html) as a 13 s animation driven by
# window.setT(t): subjects pop in, then every cross-subject link draws in, weakest first, ending on the strongest pair.
# Usage: python3 connects.py && node render-anim.mjs out/connects.html 13 ~/Videos/Nous/nous-connects.mp4
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
poster = open(os.path.join(HERE, '..', 'store-shots', 'posters', 'subjects.html')).read()
poster = poster.replace('<h1>Nineteen subjects, <em>all connected</em></h1>', '<h1><span id="h1a">Nineteen subjects,</span> <em id="h1b">all connected</em></h1>')
poster = re.sub(r'<p>(Over \d+ topics[^<]*)</p>', r'<p id="sub">\1</p>', poster)
poster = re.sub(r'<div class="badge">.*?</div></div>', '<div class="badge" id="count"><div><b><span id="n">0</span> links</b><span>between subjects, and counting</span></div></div>', poster, flags=re.S)
end = f'''<div id="end"><div class="icon"><img src="file://{HERE}/nous-icon.svg"></div><img class="word" src="file://{HERE}/nous-wordmark.svg">
<p>Strange history and big ideas.</p><div class="cta">Free on Google Play</div></div>'''
css = '''<style>
#end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;text-align:center;
  background:radial-gradient(1000px 800px at 50% 30%, #FBF8F2 0%, #F4EFE6 60%, #EAE3D7 100%);opacity:0}
#end .icon{width:260px;height:260px;border-radius:58px;box-shadow:0 30px 70px rgba(42,33,27,.25);overflow:hidden}
#end .icon img{width:100%;height:100%} #end .word{width:420px}
#end p{font-size:46px;font-weight:600;color:#5A4D42;max-width:820px;line-height:1.25;margin:0}
#end .cta{margin-top:14px;padding:26px 54px;border-radius:60px;background:#B4552F;color:#fff;font-size:44px;font-weight:800}
#count{padding:22px 44px} #count b{font-size:38px}
</style>'''
script = '''<script>
const clamp = x => Math.min(1, Math.max(0, x)), lerp = (a, b, x) => a + (b - a) * x;
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const edges = [...document.querySelectorAll('.edge')], nodes = [...document.querySelectorAll('.node')];
const mark = document.querySelector('[clip-path]'), markDisc = mark.previousElementSibling;
edges.forEach(e => { e.L = e.getTotalLength(); e.n = +e.dataset.n; e.w = +e.getAttribute('stroke-width'); e.op = +e.getAttribute('stroke-opacity'); e.style.strokeDasharray = e.L; });
nodes.forEach(g => g.base = g.getAttribute('transform'));
// Inner ring first, then the outer ring clockwise from the top, so the map fills in like a reveal.
const cy = 1030, cx = 540, ang = g => { const [x, y] = g.base.match(/[\\d.]+/g).map(Number); return [Math.hypot(x - cx, (y - cy) * 0.82), (Math.atan2(y - cy, x - cx) + Math.PI * 2.5) % (Math.PI * 2)]; };
nodes.sort((a, b) => { const A = ang(a), B = ang(b); return (A[0] > 330) - (B[0] > 330) || A[1] - B[1]; });
const strongest = edges[edges.length - 1], pair = [strongest.dataset.a, strongest.dataset.b];
const E0 = 2.7, E1 = 7.4, DRAW = 0.7;
window.setT = t => {
  document.getElementById('h1a').style.opacity = easeOut(t / 0.6);
  const hb = document.getElementById('h1b'); hb.style.opacity = easeOut((t - 2.9) / 0.5); hb.style.display = 'inline-block'; hb.style.transform = `translateY(${lerp(30, 0, easeOut((t - 2.9) / 0.5))}px)`;
  const sub = document.getElementById('sub'); sub.style.opacity = easeOut((t - 8.6) / 0.6);
  const ms = back((t - 0.15) / 0.5); [mark, markDisc].forEach(m => { m.style.transformOrigin = `${cx}px ${cy}px`; m.style.transform = `scale(${ms})`; });
  nodes.forEach((g, i) => {
    const s = back((t - 0.5 - i * 0.11) / 0.42);
    const hot = pair.includes(g.dataset.id) ? 1 + 0.12 * Math.sin(Math.PI * clamp((t - 8.0) / 1.2)) : 1;
    g.setAttribute('transform', `${g.base} scale(${(s * hot).toFixed(4)})`);
    g.style.opacity = clamp(s * 3);
  });
  let n = 0;
  edges.forEach((e, k) => {
    const start = E0 + (E1 - E0) * (k / (edges.length - 1)) ** 0.8;
    const p = easeOut((t - start) / DRAW);
    e.style.strokeDashoffset = e.L * (1 - p);
    if (t >= start) n += Math.round(e.n * clamp((t - start) / DRAW));
    if (e === strongest) { const glow = Math.sin(Math.PI * clamp((t - 8.0) / 1.2)); e.setAttribute('stroke-width', (e.w * (1 + glow)).toFixed(1)); e.setAttribute('stroke-opacity', Math.min(1, e.op + glow * 0.4).toFixed(2)); }
  });
  document.getElementById('n').textContent = n;
  const c = document.getElementById('count'); c.style.opacity = easeOut((t - 2.6) / 0.4); c.style.transform = `translateX(-50%) translateY(${lerp(40, 0, easeOut((t - 2.6) / 0.4))}px)`;
  document.getElementById('end').style.opacity = easeOut((t - 10.3) / 0.6);
};
window.setT(0);
</script>'''
html = poster.replace('</head>', css + '</head>').replace('</body>', end + script + '</body>')
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
open(os.path.join(HERE, 'out', 'connects.html'), 'w').write(html)
print('wrote out/connects.html')
