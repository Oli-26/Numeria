# Fast-cut montage of the subject labs with their own sound, from record.mjs recordings of the rec/cuts.mjs scripts.
# Usage: python3 labs.py RECDIR OUT.mp4   (RECDIR holds cut-<name>/ folders)
import os, subprocess, sys
from edit import *
from labclip import _audio

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = os.path.expanduser('~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
REC, OUT = sys.argv[1], sys.argv[2]
CARDS = os.path.join(REC, '_cards'); os.makedirs(CARDS, exist_ok=True)

BASE = "*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}body{font-family:'Fira Sans',sans-serif}"
DARK = "body{background:radial-gradient(900px 700px at 50% 40%,#3A2A20 0%,#17130F 70%);color:#FBF6EC}"
def shot(name, css, body):
    f = os.path.join(CARDS, name + '.html')
    open(f, 'w').write(f'<!doctype html><meta charset="utf-8"><style>{BASE}{css}</style>{body}')
    subprocess.run([CHROME, '--headless=new', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1920',
                    '--screenshot=' + os.path.join(CARDS, name + '.png'), 'file://' + f], check=True, capture_output=True)
    return os.path.join(CARDS, name + '.png')

hook = ".h{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center}.h div{font-size:132px;font-weight:900;line-height:1.02;letter-spacing:-3px}.o{color:#E07A45}"
HOOK1 = shot('hook1', DARK + hook, '<div class="h"><div>Every<br>subject</div><div class="o" style="visibility:hidden">has a<br>lab.</div></div>')
HOOK2 = shot('hook2', DARK + hook, '<div class="h"><div>Every<br>subject</div><div class="o">has a<br>lab.</div></div>')
word = open(os.path.join(HERE, 'nous-wordmark.svg')).read().replace('#2A211B', '#FBF6EC')
open(os.path.join(CARDS, 'wordmark-light.svg'), 'w').write(word)
END = shot('end', DARK + (".c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;text-align:center}"
           ".i{width:300px;height:300px;border-radius:66px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.5)}.i img{width:100%;height:100%}"
           ".w{width:470px}p{font-size:52px;font-weight:700;color:#D9CBB8;max-width:860px;line-height:1.2}"
           ".cta{margin-top:10px;padding:30px 64px;border-radius:70px;background:#B4552F;color:#fff;font-size:54px;font-weight:900}"),
           f'<div class="c"><div class="i"><img src="file://{HERE}/nous-icon.svg"></div><img class="w" src="file://{CARDS}/wordmark-light.svg">'
           '<p>Short lessons on the strange stuff.</p><div class="cta">Free on Google Play</div></div>')

# (recording, t0, t1, subject, what you do, zoom, centre y as a fraction); centres keep the window above the app's bottom nav
LABS = [
    ('cut-particle', 2.6, 4.4, 'Physics', 'smash particles', 1.0, .28),
    ('cut-evolution', 5.0, 8.0, 'Biology', 'watch moths evolve', 1.0, .41),
    ('cut-era-map', 4.0, 9.0, 'History', 'watch empires\nrise and fall', 1.0, .36),
    ('cut-reaction', 1.6, 3.4, 'Chemistry', 'drop potassium in water', 1.3, .37),
    ('cut-pi', 4.6, 9.6, 'Mathematics', 'what if pi was 4?', 1.0, .53),
    ('cut-market', 7.3, 10.4, 'Economics', 'tax a market', 1.0, .45),
    ('cut-race', 0.4, 3.0, 'Computer Science', 'hear the sorts race', 1.0, .55),
    ('cut-phase', 0.5, 4.6, 'Material Science', 'melt, boil, freeze', 1.0, .30),
    ('cut-cell', 0.4, 3.0, 'Biology', 'tour a cell', 1.0, .47),
    ('cut-molecule', 6.4, 9.0, 'Chemistry', 'build ethanol', 1.0, .45),
    ('cut-trolley', 0.6, 3.0, 'Philosophy', 'pull the lever?', 1.0, .42),
    ('cut-cosmic', 0.5, 6.2, 'Physics', 'zoom out to\nthe universe', 1.0, .33),
]

segs = [Card(HOOK1, 0.5, punch=1.15, flash=0.0), Card(HOOK2, 0.7, punch=1.10)]
for rec, t0, t1, subject, line, zoom, cy in LABS:
    cy = min(cy, .44)   # a full-width window centred lower than this reaches the app's bottom nav
    segs.append(Clip(Source(os.path.join(REC, rec)), t0, t1, dur=min(t1 - t0, 1.7), view=((0, zoom, .5, cy), (1, zoom * 1.06, .5, cy)),
                     overlays=[Caption(subject, 0.05, style='pill', y=300), Caption(line, 0.2, style='tiktok', y=1600)]))
segs.append(Card(END, 1.8, punch=1.2, flash=0.6))
silent = os.path.join(CARDS, 'video.mp4')
render(segs, silent)
starts, acc = [], 0.0
for sg in segs: starts.append(acc); acc += sg.dur
clips = [(sg, st) for sg, st in zip(segs, starts) if isinstance(sg, Clip)]
wav = os.path.join(CARDS, 'mix.wav')
_audio([c for c, _ in clips], [st for _, st in clips], acc, wav)
subprocess.run([FF, '-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-ac', '2',
                '-shortest', '-movflags', '+faststart', OUT], check=True)
print(OUT, f'{acc:.1f}s with sound')
