import subprocess, sys
from PIL import Image
FF = '/home/oli/.local/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
src, out, ts = sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3:]]
ims = []
for i, t in enumerate(ts):
    p = f'/tmp/claude-1000/-home-oli/495e297c-62d7-4828-a441-56fd9fb6ee91/scratchpad/clips/_st{i}.png'
    subprocess.run([FF, '-loglevel', 'error', '-y', '-ss', str(t), '-i', src, '-frames:v', '1', p], check=True)
    ims.append(Image.open(p).resize((216, 384)))
W = Image.new('RGB', (222 * len(ims), 384), (255, 255, 255))
for i, im in enumerate(ims): W.paste(im, (i * 222, 0))
W.save(out)
