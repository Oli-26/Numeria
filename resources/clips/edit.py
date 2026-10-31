# Fast-cut editor: renders a timeline of title cards and app recordings frame by frame (PIL) and pipes it to ffmpeg.
import bisect, glob, json, math, os, random, subprocess
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
FF = '/home/oli/.local/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
HEAVY = '/usr/share/fonts/opentype/fira/FiraSans-Heavy.otf'
XBOLD = '/usr/share/fonts/opentype/fira/FiraSans-ExtraBold.otf'
EMOJI = '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'
ORANGE = (180, 85, 47)


def ease_out(x): return 1 - (1 - min(max(x, 0), 1)) ** 3
def smooth(x): x = min(max(x, 0), 1); return x * x * (3 - 2 * x)


class Source:
    def __init__(self, folder):
        t = json.load(open(os.path.join(folder, 'times.json')))
        self.times, self.end = t['times'], t['end']
        self.files = sorted(glob.glob(os.path.join(folder, 'frames', '*.jpg')))

    @lru_cache(maxsize=48)
    def frame(self, i): return Image.open(self.files[i]).convert('RGB')

    def at(self, t): return self.frame(max(0, bisect.bisect_right(self.times, t) - 1))


# ── captions and stickers: pre-rendered RGBA, popped in with an overshoot ──
def caption_img(text, style):
    lines = text.split('\n')
    if style == 'tiktok':      # TikTok's own text style: black on white boxes
        f = ImageFont.truetype(XBOLD, 78); pad, gap, fg, box = (34, 18), 8, (0, 0, 0), (255, 255, 255)
    elif style == 'pill':      # brand pill
        f = ImageFont.truetype(HEAVY, 84); pad, gap, fg, box = (40, 20), 10, (255, 255, 255), ORANGE
        lines = [l.upper() for l in lines]
    else:                      # meme impact: white with a heavy outline
        f = ImageFont.truetype(HEAVY, 140); pad, gap, fg, box = (0, 0), 0, (255, 255, 255), None
        lines = [l.upper() for l in lines]
    sizes = [f.getbbox(l) for l in lines]
    widths = [b[2] - b[0] + 2 * pad[0] for b in sizes]
    lh = max(b[3] - b[1] for b in sizes) + 2 * pad[1]
    img = Image.new('RGBA', (max(widths) + 40, len(lines) * (lh + gap) + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, (l, b, w) in enumerate(zip(lines, sizes, widths)):
        x, y = (img.width - w) // 2, 20 + i * (lh + gap)
        if box:
            d.rounded_rectangle([x, y, x + w, y + lh], radius=22, fill=box)
            d.text((x + pad[0] - b[0], y + pad[1] - b[1]), l, font=f, fill=fg)
        else:
            d.text((x - b[0], y - b[1]), l, font=f, fill=fg, stroke_width=11, stroke_fill=(0, 0, 0))
    if style != 'impact':
        shadow = Image.new('RGBA', img.size, (0, 0, 0, 0)); shadow.putalpha(img.getchannel('A').point(lambda a: a * 0.35))
        shadow = shadow.filter(ImageFilter.GaussianBlur(10))
        base = Image.new('RGBA', img.size, (0, 0, 0, 0)); base.alpha_composite(shadow, (0, 8)); base.alpha_composite(img)
        img = base
    return img


def emoji_img(ch, size):
    f = ImageFont.truetype(EMOJI, 109)
    img = Image.new('RGBA', (140, 140), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((6, 6), ch, font=f, embedded_color=True)
    return img.crop(img.getbbox()).resize((size, size), Image.LANCZOS)


def pop_scale(t):
    if t < 0: return 0
    if t < 0.12: return 0.45 + 0.75 * ease_out(t / 0.12)      # up to 1.2
    if t < 0.24: return 1.2 - 0.2 * smooth((t - 0.12) / 0.12)
    return 1.0


class Overlay:
    def __init__(self, img, at, until, x, y, rot=0.0):
        self.img, self.at, self.until, self.x, self.y, self.rot = img, at, until, x, y, rot

    def draw(self, canvas, t):
        if t < self.at or (self.until is not None and t >= self.until): return
        s = pop_scale(t - self.at)
        if s <= 0: return
        im = self.img.resize((max(1, int(self.img.width * s)), max(1, int(self.img.height * s))), Image.BILINEAR)
        if self.rot: im = im.rotate(self.rot, resample=Image.BICUBIC, expand=True)
        canvas.alpha_composite(im, (int(self.x - im.width / 2), int(self.y - im.height / 2)))


def Caption(text, at, until=None, style='tiktok', y=330, x=W / 2, rot=0.0):
    return Overlay(caption_img(text, style), at, until, x, y, rot)


def Sticker(ch, at, x, y, size=230, until=None, rot=-8.0):
    return Overlay(emoji_img(ch, size), at, until, x, y, rot)


# ── segments ──
class Seg:
    punch, flash, flash_colour = 1.10, 0.55, (255, 255, 255)

    def __init__(self, dur, overlays=(), shakes=(), punch=None, flash=None, flash_colour=None):
        self.dur, self.overlays, self.shakes = dur, list(overlays), list(shakes)
        if punch is not None: self.punch = punch
        if flash is not None: self.flash = flash
        if flash_colour: self.flash_colour = flash_colour

    def punch_at(self, t): return 1 + (self.punch - 1) * (1 - ease_out(t / 0.22))


class Card(Seg):
    def __init__(self, img, dur, **kw):
        super().__init__(dur, **kw)
        self.img = Image.open(img).convert('RGB') if isinstance(img, str) else img

    def base(self, t):
        z = self.punch_at(t)
        if z == 1: return self.img.copy()
        w, h = W / z, H / z
        return self.img.crop((int((W - w) / 2), int((H - h) / 2), int((W + w) / 2), int((H + h) / 2))).resize((W, H), Image.BILINEAR)


class Clip(Seg):
    # view: keyframes (u, zoom, cx, cy) over the segment, u in 0..1, centre as a fraction of the recording
    def __init__(self, src, t0, t1, dur=None, view=((0, 1.0, .5, .5),), **kw):
        super().__init__(dur if dur else t1 - t0, **kw)
        self.src, self.t0, self.t1, self.view = src, t0, t1, view

    def cam(self, u):
        ks = self.view
        if u <= ks[0][0]: return ks[0][1:]
        for a, b in zip(ks, ks[1:]):
            if u <= b[0]:
                k = smooth((u - a[0]) / (b[0] - a[0]))
                return tuple(x + (y - x) * k for x, y in zip(a[1:], b[1:]))
        return ks[-1][1:]

    def base(self, t):
        u = t / self.dur
        frame = self.src.at(self.t0 + (self.t1 - self.t0) * u)
        zoom, cx, cy = self.cam(u)
        zoom *= self.punch_at(t)
        fw, fh = frame.size
        w = fw / zoom; h = w * H / W
        if h > fh: h = fh; w = h * W / H
        x = min(max(cx * fw - w / 2, 0), fw - w); y = min(max(cy * fh - h / 2, 0), fh - h)
        return frame.crop((int(x), int(y), int(x + w), int(y + h))).resize((W, H), Image.LANCZOS if zoom < 1.25 else Image.BICUBIC)


def render(segments, out, seed=7):
    rnd = random.Random(seed)
    total = sum(s.dur for s in segments)
    n = int(round(total * FPS))
    proc = subprocess.Popen([FF, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                             '-f', 'lavfi', '-t', f'{total:.3f}', '-i', 'anullsrc=r=44100:cl=stereo',
                             '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k',
                             '-shortest', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    starts, acc = [], 0
    for s in segments: starts.append(acc); acc += s.dur
    for i in range(n):
        t = i / FPS
        k = max(j for j, st in enumerate(starts) if st <= t + 1e-9)
        seg, lt = segments[k], t - starts[k]
        img = seg.base(lt)
        for (a, d, amp) in seg.shakes:
            if a <= lt < a + d:
                dx, dy = rnd.randint(-amp, amp), rnd.randint(-amp, amp)
                shifted = Image.new('RGB', (W, H)); shifted.paste(img.resize((W + 2 * amp, H + 2 * amp)), (dx - amp, dy - amp)); img = shifted
        if seg.flash and lt < 0.12:
            img = Image.blend(img, Image.new('RGB', (W, H), seg.flash_colour), seg.flash * (1 - lt / 0.12))
        canvas = img.convert('RGBA')
        for o in seg.overlays: o.draw(canvas, lt)
        proc.stdin.write(canvas.convert('RGB').tobytes())
    proc.stdin.close(); proc.wait()
    print(out, f'{total:.1f}s', os.path.getsize(out) // 1024, 'KB')
