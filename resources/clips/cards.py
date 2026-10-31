import json, os, subprocess
S = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(S, 'cards2')
CHROME = os.path.expanduser('~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
BASE = "*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}body{font-family:'Fira Sans',sans-serif}"
def shot(name, css, body):
    f = os.path.join(OUT, name + '.html')
    open(f, 'w').write(f'<!doctype html><meta charset="utf-8"><style>{BASE}{css}</style>{body}')
    subprocess.run([CHROME, '--headless=new', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1920',
                    '--screenshot=' + os.path.join(OUT, name + '.png'), 'file://' + f], check=True, capture_output=True)
DARK = "body{background:radial-gradient(900px 700px at 50% 40%,#3A2A20 0%,#17130F 70%);color:#FBF6EC}"
hook = ".h{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center}.h div{font-size:132px;font-weight:900;line-height:1.02;letter-spacing:-3px}.o{color:#E07A45}"
shot('hook1', DARK + hook, '<div class="h"><div>School<br>skipped</div><div class="o" style="visibility:hidden">the weird<br>stuff.</div></div>')
shot('hook2', DARK + hook, '<div class="h"><div>School<br>skipped</div><div class="o">the weird<br>stuff.</div></div>')
labels = {'religion-cargo-cults': 'Cargo cults', 'misc-undeciphered': 'Undeciphered scripts', 'misc-numberstations': 'Number stations',
          'religion-forgeries': 'Sacred forgeries', 'misc-lostcities': 'Lost cities', 'misc-vanishings': 'Famous vanishings'}
topics = json.load(open(os.path.join(S, 'hook-topics.json')))
for tid, label in labels.items():
    t = topics[tid]
    css = (f"body{{background:radial-gradient(800px 800px at 50% 42%,color-mix(in srgb,{t['color']} 30%,#FBF6EC) 0%,color-mix(in srgb,{t['color']} 10%,#FBF6EC) 70%)}}"
           ".c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:70px}"
           f".a{{width:560px;height:560px;color:{t['color']};filter:drop-shadow(0 18px 40px color-mix(in srgb,{t['color']} 45%,transparent))}}"
           ".l{font-size:108px;font-weight:900;color:#2A211B;letter-spacing:-2px;text-align:center;max-width:960px;line-height:1.04}")
    svg = f"<svg viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' style='width:100%;height:100%'>{t['svg']}</svg>"
    shot('flash-' + tid, css, f'<div class="c"><div class="a">{svg}</div><div class="l">{label}</div></div>')
word = open(os.path.join(S, 'nous-wordmark.svg')).read().replace('#2A211B', '#FBF6EC')
open(os.path.join(OUT, 'wordmark-light.svg'), 'w').write(word)
end = DARK + (".c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;text-align:center}"
              ".i{width:300px;height:300px;border-radius:66px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.5)}.i img{width:100%;height:100%}"
              ".w{width:470px}p{font-size:52px;font-weight:700;color:#D9CBB8;max-width:860px;line-height:1.2}"
              ".cta{margin-top:10px;padding:30px 64px;border-radius:70px;background:#B4552F;color:#fff;font-size:54px;font-weight:900}")
shot('end', end, f'<div class="c"><div class="i"><img src="file://{S}/nous-icon.svg"></div><img class="w" src="file://{OUT}/wordmark-light.svg">'
     '<p>Short lessons on the strange stuff.</p><div class="cta">Free on Google Play</div></div>')
print(sorted(f for f in os.listdir(OUT) if f.endswith('.png')))
