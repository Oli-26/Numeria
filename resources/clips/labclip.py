# Editorial cut of a lab recording, in the style of the course teasers: a Fraunces headline per beat on the cream page, the
# lab cropped into a card that the camera moves across, a caption under it, the app's own sound, then the end card.
# Beats come from record.mjs recordings; see labcuts.py for the cuts.
import os, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw
from edit import Source, smooth, FF

W, H, FPS = 1080, 1920, 30
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'store-shots', 'fonts')
CHROME = os.path.expanduser('~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
CX, CY, CW, CH, CR = 60, 450, 960, 1180, 44   # the card the lab shows through
FADE, END = 0.36, 2.4
FLOOR = 1370   # recording y where the app's bottom nav (and its raised centre button) starts; the camera never shows below it

PAGE = """<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Fraunces';font-weight:600;src:url('file://%(fonts)s/fraunces-latin-600-normal.woff2') format('woff2')}
*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}
body{background:radial-gradient(1000px 800px at 50%% 8%%,#FBF8F2 0%%,#F4EFE6 55%%,#EAE3D7 100%%);font-family:'Noto Sans',sans-serif;color:#2A211B}
.k{position:absolute;left:0;right:0;top:118px;text-align:center;font:700 30px 'Noto Sans',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:%(accent)s}
.h{position:absolute;left:60px;right:60px;top:166px;height:250px;display:flex;align-items:center;justify-content:center;text-align:center;
  font:600 88px/1.04 'Fraunces',Georgia,serif;letter-spacing:-0.015em;text-wrap:balance}
.h em{font-style:normal;color:%(accent)s}
.card{position:absolute;left:%(cx)dpx;top:%(cy)dpx;width:%(cw)dpx;height:%(ch)dpx;border-radius:%(cr)dpx;background:#fff;
  box-shadow:0 0 0 2px rgba(42,33,27,.08),0 40px 90px rgba(70,45,25,.22),0 10px 26px rgba(70,45,25,.14)}
.c{position:absolute;left:80px;right:80px;top:%(capy)dpx;text-align:center;font:600 42px/1.25 'Noto Sans',sans-serif;color:#5A4D42;text-wrap:balance}
</style><div class="k">%(kicker)s</div><div class="h"><div>%(head)s</div></div><div class="card"></div><div class="c">%(cap)s</div>"""

END_PAGE = """<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Fraunces';font-weight:600;src:url('file://%(fonts)s/fraunces-latin-600-normal.woff2') format('woff2')}
*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}
body{background:radial-gradient(1000px 800px at 50%% 30%%,#FBF8F2 0%%,#F4EFE6 60%%,#EAE3D7 100%%);font-family:'Noto Sans',sans-serif;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;text-align:center}
.icon{width:220px;height:220px;border-radius:50px;box-shadow:0 30px 70px rgba(42,33,27,.25);overflow:hidden}.icon img{width:100%%;height:100%%}
.word{width:360px}h2{font:600 96px/1 'Fraunces',Georgia,serif;color:%(accent)s;margin-top:20px}
p{font-size:42px;font-weight:600;color:#5A4D42;max-width:820px;line-height:1.28;text-wrap:balance}
.cta{margin-top:10px;padding:26px 60px;border-radius:60px;background:%(accent)s;color:#fff;font-size:44px;font-weight:800}
</style><div class="icon"><img src="file://%(here)s/nous-icon.svg"></div><img class="word" src="file://%(here)s/nous-wordmark.svg">
<h2>%(title)s</h2><p>%(line)s</p><div class="cta">Free on Google Play</div>"""


def page_png(html, path):
    f = path + '.html'; open(f, 'w').write(html)
    subprocess.run([CHROME, '--headless=new', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1920',
                    '--allow-file-access-from-files', '--virtual-time-budget=1500', '--screenshot=' + path, 'file://' + f], check=True, capture_output=True)
    return Image.open(path).convert('RGB')


class Beat:
    """Plays source time t0..t1 over dur seconds. cam: keyframes (u, cx, cy, w) in source pixels, u in 0..1 over the beat;
    the visible window keeps the card's aspect, so w alone sets the zoom."""
    def __init__(self, src, t0, t1, head, cap='', dur=None, cam=((0, 390, 780, 780),)):
        self.src, self.t0, self.t1, self.head, self.cap, self.cam = src, t0, t1, head, cap, cam
        self.dur = dur or (t1 - t0)

    def view(self, u):
        ks = self.cam
        if u <= ks[0][0]: return ks[0][1:]
        for a, b in zip(ks, ks[1:]):
            if u <= b[0]:
                k = smooth((u - a[0]) / (b[0] - a[0]))
                return tuple(x + (y - x) * k for x, y in zip(a[1:], b[1:]))
        return ks[-1][1:]

    def frame(self, t):
        u = t / self.dur
        img = self.src.at(self.t0 + (self.t1 - self.t0) * u)
        cx, cy, w = self.view(u)
        h = w * CH / CW
        fw, fh = img.size[0], min(img.size[1], FLOOR)
        if h > fh: h = fh; w = h * CW / CH
        x = min(max(cx - w / 2, 0), fw - w); y = min(max(cy - h / 2, 0), fh - h)
        return img.crop((int(x), int(y), int(x + w), int(y + h))).resize((CW, CH), Image.LANCZOS)


def _audio(beats, starts, total, out):
    sr = 44100
    mix = np.zeros(int((total + 0.5) * sr), dtype=np.float32)
    cache = {}
    for b, s in zip(beats, starts):
        p = os.path.join(b.src.folder, 'audio.wav')
        if not os.path.exists(p): continue
        if p not in cache:
            with wave.open(p) as w: cache[p] = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32767
        a = cache[p]
        seg = a[int(b.t0 * sr):int(b.t1 * sr)]
        if len(seg) < 2: continue
        n = int(b.dur * sr)
        seg = np.interp(np.linspace(0, len(seg) - 1, n), np.arange(len(seg)), seg)   # sped-up beats rise in pitch, like a tape
        fade = min(n // 2, int(0.02 * sr)); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        i = int(s * sr); mix[i:i + n] += seg[:len(mix) - i]
    peak = np.abs(mix).max()
    if peak > 0: mix *= min(16.0, 0.7 / peak)
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())


def render(beats, out, kicker, accent, title, line, work):
    os.makedirs(work, exist_ok=True)
    common = dict(fonts=FONTS, accent=accent, cx=CX, cy=CY, cw=CW, ch=CH, cr=CR, capy=CY + CH + 46, kicker=kicker)
    bgs = [page_png(PAGE % dict(common, head=b.head, cap=b.cap), os.path.join(work, f'bg{i}.png')) for i, b in enumerate(beats)]
    blank = page_png(PAGE % dict(common, head='', cap=''), os.path.join(work, 'blank.png'))
    end = page_png(END_PAGE % dict(fonts=FONTS, here=HERE, accent=accent, title=title, line=line), os.path.join(work, 'end.png'))
    mask = Image.new('L', (CW, CH), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, CW - 1, CH - 1], radius=CR, fill=255)
    starts, acc = [], 0.0
    for b in beats: starts.append(acc); acc += b.dur
    body, total = acc, acc + END
    wav = os.path.join(work, 'mix.wav'); _audio(beats, starts, total, wav)
    proc = subprocess.Popen([FF, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                             '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
                             '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-shortest', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    def beat_frame(k, t):
        img = bgs[k].copy(); img.paste(beats[k].frame(t), (CX, CY), mask); return img
    for i in range(int(round(total * FPS))):
        t = i / FPS
        if t >= body:
            img = end if t - body >= 0.4 else Image.blend(beat_frame(len(beats) - 1, beats[-1].dur - 1e-3), end, smooth((t - body) / 0.4))
        else:
            k = max(j for j, s in enumerate(starts) if s <= t + 1e-9)
            img = beat_frame(k, t - starts[k])
            if k > 0 and t - starts[k] < FADE and beats[k].head != beats[k - 1].head:
                # Old words fade out, then new ones in, so two headlines never sit on top of each other.
                a = (t - starts[k]) / FADE
                bg = Image.blend(bgs[k - 1], blank, smooth(a * 2)) if a < .5 else Image.blend(blank, bgs[k], smooth(a * 2 - 1))
                bg.paste(beats[k].frame(t - starts[k]), (CX, CY), mask); img = bg
        proc.stdin.write(img.tobytes())
    proc.stdin.close(); proc.wait()
    print(out, f'{total:.1f}s', os.path.getsize(out) // 1024, 'KB')
