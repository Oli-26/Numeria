# 14.5 s showcase cut to a 128 BPM beat (31 beats), on the beat from the first frame: the Knowledge Graph bursting to every topic, eight labs, lessons and sources, the tree view.
# Record first: node record.mjs RECDIR cut-graph cut-gerrymander cut-cosmic cut-front-page cut-era-map cut-reaction cut-doge-win cut-cell cut-trolley lesson cut-sources
#   (cut-graph, cut-doge-win and cut-sources are in rec/cuts-showcase.mjs)
# Usage: python3 showcase.py RECDIR OUT.mp4   (also writes OUT-silent.mp4, for posts that add a trending sound)
import os, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from edit import *

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = os.path.expanduser('~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
REC, OUT = sys.argv[1], sys.argv[2]
CARDS = os.path.join(REC, '_showcase'); os.makedirs(CARDS, exist_ok=True)
BEAT = 60 / 128
SR = 44100

BASE = "*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}body{font-family:'Fira Sans',sans-serif}"
DARK = "body{background:radial-gradient(900px 700px at 50% 40%,#3A2A20 0%,#17130F 70%);color:#FBF6EC}"
def shot(name, css, body):
    f = os.path.join(CARDS, name + '.html')
    open(f, 'w').write(f'<!doctype html><meta charset="utf-8"><style>{BASE}{css}</style>{body}')
    subprocess.run([CHROME, '--headless=new', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1920',
                    '--screenshot=' + os.path.join(CARDS, name + '.png'), 'file://' + f], check=True, capture_output=True)
    return os.path.join(CARDS, name + '.png')

word = open(os.path.join(HERE, 'nous-wordmark.svg')).read().replace('#2A211B', '#FBF6EC')
open(os.path.join(CARDS, 'wordmark-light.svg'), 'w').write(word)
END_CSS = DARK + (".c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:38px;text-align:center}"
           ".i{width:220px;height:220px;border-radius:50px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.5)}.i img{width:100%;height:100%}"
           ".w{width:400px}.s{display:flex;flex-direction:column;gap:6px;font-size:84px;font-weight:800;color:#FBF6EC;line-height:1.05}.s b{color:#E07A45;font-weight:900}"
           "p{font-size:44px;font-weight:700;color:#D9CBB8}"
           ".cta{margin-top:12px;padding:30px 64px;border-radius:70px;background:#B4552F;color:#fff;font-size:54px;font-weight:900}.x{visibility:hidden}")
# The end card builds on the beat: logo, then each figure, then the call to action; hidden parts keep their space so nothing shifts.
def end_card(k):
    x = lambda i: '' if k >= i else ' class="x"'
    return shot(f'end{k}', END_CSS, f'<div class="c"><div class="i"><img src="file://{HERE}/nous-icon.svg"></div><img class="w" src="file://{CARDS}/wordmark-light.svg">'
                f'<div class="s"><span{x(1)}><b>22</b> labs</span><span{x(2)}><b>327</b> topics</span><span{x(3)}><b>2,070</b> lessons</span></div>'
                f'<p{x(4)}>No ads. No account. Works offline.</p><div{x(4)}><div class="cta">Free on Google Play</div></div></div>')
END_STEPS = [(0, 1), (1, .5), (2, .5), (3, 1), (4, 2)]   # (state, beats)
CTA_BEAT = 3


def badge(text):
    f = ImageFont.truetype(HEAVY, 54)
    b = f.getbbox(text); w, h = b[2] - b[0] + 56, b[3] - b[1] + 34
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=h // 2, fill=(23, 19, 15, 225))
    d.text((28 - b[0], 17 - b[1]), text, font=f, fill=(251, 246, 236))
    return img


# (recording, t0, t1, subject, what you do, zoom, centre y as a fraction), two beats each; the zoom crops to the lab's visual
LABS = [
    ('cut-gerrymander', 11.3, 14.6, 'Politics', 'rig the map 6 to 1', 1.12, .40),
    ('cut-cosmic', 0.5, 6.2, 'Physics', 'zoom out to\nthe universe', 1.45, .30),
    ('cut-front-page', 7.9, 9.3, 'Media', 'slant the headline', 1.2, .40),
    ('cut-era-map', 4.0, 9.0, 'History', 'watch empires\nrise and fall', 1.3, .26),
    ('cut-reaction', 7.2, 9.4, 'Chemistry', 'run real reactions', 1.7, .36),
    ('cut-doge-win', 8.6, 11.0, 'Venice', 'elect a doge', 1.12, .52),
    ('cut-cell', 4.4, 6.6, 'Biology', 'tour a cell', 1.45, .26),
    ('cut-trolley', 0.6, 3.0, 'Philosophy', 'pull the lever?', 1.0, .42),
]
LINE_Y = {'cut-doge-win': 480, 'cut-cosmic': 1820}   # the medal and the zoom view sit where the line usually goes
VIEW = {'cut-doge-win': ((0, 1.12, .5, .42), (1, 1.2, .5, .527))}   # follows the ladder down to the medal
# Keeps the window above the app's bottom nav, which starts about 1400 px down the 1560 px recording.
def max_cy(zoom): return (1400 - 780 / zoom * H / W / 2) / 1560
LABS_BADGE = badge('22 labs')

src = lambda n: Source(os.path.join(REC, n))
G = src('cut-graph')
segs = [Clip(G, 0.6, 2.0, dur=2 * BEAT, view=((0, 1.0, .5, .44), (1, 1.04, .5, .44)), flash=0.0,
             overlays=[Caption('One app.\nEvery subject.', 0.0, style='tiktok', y=1560), Caption('327 topics', 0.3, style='pill', y=330)])]
for rec, t0, t1, subject, line, zoom, cy in LABS:
    cy = min(cy, max_cy(zoom * 1.06))
    segs.append(Clip(src(rec), t0, t1, dur=2 * BEAT, view=VIEW.get(rec, ((0, zoom, .5, cy), (1, zoom * 1.06, .5, cy))),
                     overlays=[Caption(subject, 0.03, style='pill', y=330), Overlay(LABS_BADGE, 0.0, None, W - 150, 210),
                               Caption(line, 0.12, style='tiktok', y=LINE_Y.get(rec, 1600))]))
segs.append(Clip(src('lesson'), 0.6, 3.6, dur=2 * BEAT, view=((0, 1.15, .5, .38), (1, 1.22, .5, .38)),
                 overlays=[Caption('2,070 lessons', 0.03, style='pill', y=330), Caption('guess first,\nthen learn why', 0.12, style='tiktok', y=1600)]))
segs.append(Clip(src('cut-sources'), 0.3, 2.6, dur=2 * BEAT, view=((0, 1.0, .5, .44), (1, 1.06, .5, .44)),
                 overlays=[Caption('5,000+ sources', 0.03, style='pill', y=330), Caption('every fact cited', 0.12, style='tiktok', y=1600)]))
segs.append(Clip(G, 3.3, 5.6, dur=4 * BEAT, view=((0, 1.0, .5, .44), (1, 1.05, .5, .44)),
                 overlays=[Caption('All connected', 0.05, style='pill', y=330), Caption('watch it grow\nas you learn', 0.2, style='tiktok', y=1600)]))
for i, (k, beats) in enumerate(END_STEPS):
    segs.append(Card(end_card(k), beats * BEAT, punch=1.2 if i == 0 else 1.03, flash=0.6 if i == 0 else 0.0))

silent = os.path.join(CARDS, 'video.mp4')
render(segs, silent)
starts, acc = [], 0.0
for sg in segs: starts.append(acc); acc += sg.dur
TOTAL = acc


# ── the beat: four on the floor from the first frame, offbeat bass, a pad ducked by the kick, a riser into the end ──
rng = np.random.default_rng(3)
def lowpass(x, cut):
    a = np.exp(-2 * np.pi * np.asarray(cut, dtype=np.float64) / SR) * np.ones(len(x))
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a[i]) * x[i] + a[i] * acc; y[i] = acc
    return y
def env(n, k): return np.exp(-np.arange(n) / SR * k)
def kick():   # saturated so its harmonics carry on phone speakers, which drop most of the energy under 150 Hz
    t = np.arange(int(0.38 * SR)) / SR
    ph = 2 * np.pi * np.cumsum(50 + 190 * np.exp(-t * 28)) / SR
    body = np.tanh(2.6 * np.sin(ph)) * np.exp(-t * 8) * 0.8
    knock = lowpass(rng.standard_normal(len(t)), 3000) * np.exp(-t * 90) * 0.9
    return body + knock
def hat(k=70): n = int(0.06 * SR); x = np.diff(rng.standard_normal(n + 1)); return x * env(n, k) * 0.18
def clap():   # noise band-passed to 0.9-3.5 kHz, with three quick onsets
    n = int(0.25 * SR); x = rng.standard_normal(n); x = lowpass(x, 3500) - lowpass(x, 900); e = env(n, 22)
    for d in (0.0, 0.012, 0.024): e[int(d * SR):] += 0.6 * env(n - int(d * SR), 120)
    return x * e * 0.9
def saw(f, n): t = np.arange(n) / SR; return 2 * ((t * f) % 1) - 1
def impact():
    n = int(1.6 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.4) * 1.1 + \
           lowpass(rng.standard_normal(n), 2500) * np.exp(-t * 3.5) * 0.9
def riser(beats):
    n = int(beats * BEAT * SR); u = np.linspace(0, 1, n)
    return lowpass(rng.standard_normal(n), 300 + 9000 * u ** 2) * u ** 2 * 0.55 + np.sin(2 * np.pi * np.cumsum(220 + 900 * u ** 2) / SR) * u ** 3 * 0.12

def beat_track():
    nb = int(round(TOTAL / BEAT)); mix = np.zeros(int((TOTAL + 2) * SR))
    def put(x, at):
        i = int(at * SR); mix[i:i + len(x)] += x[:len(mix) - i]
    cuts = [round(st / BEAT) for st in starts]
    layers, end = cuts[-1 - len(END_STEPS)], cuts[-len(END_STEPS)]
    last = end + CTA_BEAT
    roots = [110.0, 87.31, 130.81, 98.0]                     # A, F, C, G
    chords = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (261.63, 329.63, 392.0), (196.0, 246.94, 293.66)]
    kicks = []
    for b in range(nb):
        t = b * BEAT
        groove = b < last
        if groove:
            put(kick(), t); kicks.append(t)
            if b % 2 == 1: put(clap(), t)
            for k in (0.5,) if b < layers else (0.25, 0.5, 0.75):
                put(hat(), t + k * BEAT)
            r = roots[(b // 4) % 4]; n = int(0.42 * BEAT * SR)
            put(lowpass(saw(r, n) + 0.7 * saw(r * 2.005, n) + 0.4 * saw(r * 3.01, n), 1800) * env(n, 7) * 0.6, t + 0.5 * BEAT)
        c = chords[(b // 4) % 4]; n = int(BEAT * SR)
        pad = sum(saw(f, n) + saw(f * 1.004, n) for f in c) / 6
        put(lowpass(pad, 2400 if groove else 900) * (0.3 if b < last else 0.0), t)
    for at in (0, end): put(impact(), at * BEAT)
    put(impact() * 0.6, last * BEAT)
    put(riser(end - layers), layers * BEAT)
    n = int(2.2 * SR); c = chords[0]
    put(lowpass(sum(saw(f, n) + saw(f * 1.004, n) for f in c) / 6, 1600) * env(n, 1.6) * 0.3, last * BEAT)
    duck = np.ones(len(mix))
    for t in kicks:
        i = int(t * SR); n = min(int(BEAT * SR), len(duck) - i); duck[i:i + n] = 1 - 0.55 * env(n, 9)
    mix *= duck
    return mix[:int((TOTAL + 0.3) * SR)]


def write(x, path):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
def mux(wav, out):
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-ac', '2',
                    '-shortest', '-movflags', '+faststart', out], check=True)

music = beat_track(); music /= np.abs(music).max()
write(np.tanh(2.0 * music) * 0.95, os.path.join(CARDS, 'mix.wav')); mux(os.path.join(CARDS, 'mix.wav'), OUT)
write(np.zeros_like(music), os.path.join(CARDS, 'quiet.wav')); mux(os.path.join(CARDS, 'quiet.wav'), OUT.replace('.mp4', '-silent.mp4'))
print(OUT, f'{TOTAL:.1f}s, {len(segs)} cuts')
