// Renders an HTML animation frame by frame: calls window.setT(t) per frame and pipes PNGs into ffmpeg, with a silent
// audio track so every platform accepts the upload. Usage: node render-anim.mjs page.html seconds out.mp4 [fps]
import { createRequire } from 'module'; import { spawn } from 'child_process'; import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = createRequire('/home/oli/.npm/_npx/705bc6b22212b352/node_modules/')('playwright-core');
const FF = '/home/oli/.local/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const [page, secs, out, fpsArg] = process.argv.slice(2); const fps = +(fpsArg || 30), frames = Math.round(+secs * fps);
const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell', args: ['--allow-file-access-from-files'] });
try {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(pathToFileURL(path.resolve(page)).href); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  if (!(await p.evaluate(() => typeof window.setT === 'function'))) throw new Error('page has no window.setT: ' + errors.join('; '));
  for (let i = 0; i < frames; i++) {
    await p.evaluate(t => window.setT(t), i / fps);
    const buf = await p.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stdout.write(`${i}/${frames} `);
  }
} finally { await browser.close(); ff.stdin.end(); }
await new Promise(r => ff.on('close', r)); console.log('\nwrote', out);
