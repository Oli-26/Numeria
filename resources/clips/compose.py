# compose.py CLIPDIR "Headline with <b>accent</b>" OUT.mp4 : phone recording in a 1080x1920 frame, headline above, end card after.
import json, os, subprocess, sys, glob
from PIL import Image, ImageDraw
FF = '/home/oli/.local/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
CHROME = os.path.expanduser('~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
HERE = os.path.dirname(os.path.abspath(__file__))
clip, headline, out = sys.argv[1], sys.argv[2], sys.argv[3]
X, Y, W, H, R = 180, 430, 720, 1440, 50   # phone screen window
END = 2.2
CSS = """*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}
body{background:radial-gradient(1100px 800px at 20% 8%,#F9E7D6 0%,rgba(249,231,214,0) 60%),radial-gradient(900px 900px at 95% 85%,#EBD9C2 0%,rgba(235,217,194,0) 60%),#F4EFE6;
font-family:system-ui,'Noto Sans',sans-serif;color:#2A211B}"""

def shot(html, path):
    f = path + '.html'
    open(f, 'w').write('<!doctype html><meta charset="utf-8"><style>' + CSS + '</style>' + html)
    subprocess.run([CHROME, '--headless=new', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1920',
                    '--screenshot=' + path, 'file://' + f], check=True, capture_output=True)

bg = os.path.join(clip, 'bg.png')
shot(f"""<style>h1{{position:absolute;left:70px;right:70px;top:150px;height:240px;display:flex;align-items:center;justify-content:center;text-align:center;
font-size:76px;line-height:1.08;font-weight:800;letter-spacing:-1.5px;text-wrap:balance}} h1 b{{color:#B4552F;font-weight:800}}
.phone{{position:absolute;left:{X-14}px;top:{Y-14}px;width:{W+28}px;height:{H+28}px;border-radius:{R+14}px;background:#231D18;
box-shadow:0 40px 90px rgba(42,33,27,.28),0 0 0 2px #3A312A inset}}</style><h1><span>{headline}</span></h1><div class="phone"></div>""", bg)

end = os.path.join(clip, 'end.png')
shot(f"""<style>.c{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;text-align:center}}
.icon{{width:260px;height:260px;border-radius:58px;box-shadow:0 30px 70px rgba(42,33,27,.25);overflow:hidden}} .icon img{{width:100%;height:100%}}
.word{{width:420px}} p{{font-size:46px;font-weight:600;color:#5A4D42;max-width:820px;line-height:1.25}}
.cta{{margin-top:14px;padding:26px 54px;border-radius:60px;background:#B4552F;color:#fff;font-size:44px;font-weight:800}}</style>
<div class="c"><div class="icon"><img src="file://{HERE}/nous-icon.svg"></div><img class="word" src="file://{HERE}/nous-wordmark.svg">
<p>Short lessons on the strange stuff.</p><div class="cta">Free on Google Play</div></div>""", end)

# The window is cut out of the frame so the recording shows through with rounded corners.
frame = Image.open(bg).convert('RGBA')
mask = Image.new('L', frame.size, 255)
ImageDraw.Draw(mask).rounded_rectangle([X, Y, X + W - 1, Y + H - 1], radius=R, fill=0)
frame.putalpha(mask)
frame_png = os.path.join(clip, 'frame.png'); frame.save(frame_png)

t = json.load(open(os.path.join(clip, 'times.json')))
times, dur = t['times'], t['end']
files = sorted(glob.glob(os.path.join(clip, 'frames', '*.jpg')))
lst = os.path.join(clip, 'list.txt')
with open(lst, 'w') as f:
    f.write('ffconcat version 1.0\n')
    for i, p in enumerate(files):
        d = (times[i + 1] if i + 1 < len(times) else dur) - times[i]
        f.write(f"file '{p}'\nduration {max(d, 0.001):.4f}\n")
    f.write(f"file '{files[-1]}'\n")
total = dur + END - 0.4
fc = (f"[1:v]fps=30,scale={W}:{H}:flags=lanczos,setpts=PTS-STARTPTS[s];[0:v][s]overlay={X}:{Y}:shortest=1[a];"
      f"[a][2:v]overlay=0:0,format=yuv420p,setsar=1[main];[3:v]format=yuv420p,setsar=1[e];"
      f"[main][e]xfade=transition=fade:duration=0.4:offset={dur - 0.4:.3f},format=yuv420p[v]")
cmd = [FF, '-y', '-loglevel', 'error',
       '-loop', '1', '-framerate', '30', '-t', f'{dur:.3f}', '-i', bg,
       '-f', 'concat', '-safe', '0', '-i', lst,
       '-loop', '1', '-framerate', '30', '-t', f'{dur:.3f}', '-i', frame_png,
       '-loop', '1', '-framerate', '30', '-t', f'{END}', '-i', end,
       '-f', 'lavfi', '-t', f'{total:.3f}', '-i', 'anullsrc=r=44100:cl=stereo',
       '-filter_complex', fc, '-map', '[v]', '-map', '4:a',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30',
       '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', out]
subprocess.run(cmd, check=True)
print(out, f'{total:.1f}s', os.path.getsize(out) // 1024, 'KB')
