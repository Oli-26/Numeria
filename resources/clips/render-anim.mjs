// Renders an HTML animation frame by frame: calls window.setT(t) per frame and pipes PNGs into ffmpeg.
// A page that loads simfx.js and sets window.SFX = [{ t, name, o }] gets those sounds rendered offline as its audio track;
// any other page gets a silent track, so every platform accepts the upload.
// Usage: node render-anim.mjs page.html seconds out.mp4 [fps]
import { createRequire } from 'module'; import { spawn } from 'child_process'; import fs from 'fs'; import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = createRequire('/home/oli/.npm/_npx/705bc6b22212b352/node_modules/')('playwright-core');
const FF = '/home/oli/.local/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const [page, secs, out, fpsArg] = process.argv.slice(2); const fps = +(fpsArg || 30), frames = Math.round(+secs * fps);
const video = out + '.video.mp4', wavPath = out + '.wav';
const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', video], { stdio: ['pipe', 'inherit', 'inherit'] });
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell', args: ['--allow-file-access-from-files'] });
let wav = null;
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
  wav = await p.evaluate(s => window.SFX && window.SimFx ? (window.__sfxLog = window.SFX.map(e => ({ at: e.t, name: e.name, o: e.o || {} })), SimFx.renderLog(0, s)) : null, +secs);
  if (errors.length) console.log('\npage errors:', errors.join('; '));
} finally { await browser.close(); ff.stdin.end(); }
await new Promise(r => ff.on('close', r));
// Peak-normalised, like labclip's mix, so a story plays as loud as the lab cuts.
const normalise = b => { let peak = 0; for (let i = 44; i + 1 < b.length; i += 2) peak = Math.max(peak, Math.abs(b.readInt16LE(i)));
  const k = peak ? Math.min(16, 0.7 * 32767 / peak) : 1; for (let i = 44; i + 1 < b.length; i += 2) b.writeInt16LE(Math.round(b.readInt16LE(i) * k), i); return b; };
const audio = wav ? (fs.writeFileSync(wavPath, normalise(Buffer.from(wav, 'base64'))), ['-i', wavPath]) : ['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo'];
await new Promise((res, rej) => spawn(FF, ['-y', '-loglevel', 'error', '-i', video, ...audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
  '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', c => c ? rej(new Error('mux failed')) : res()));
fs.rmSync(video, { force: true }); fs.rmSync(wavPath, { force: true });
console.log('\nwrote', out);
