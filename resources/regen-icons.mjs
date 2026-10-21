import sharp from 'sharp';
import { readFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { dirname } from 'path';

// Store art (play-store-icon-*.png, icon.png, feature-graphic.png) are hand-made masters and are not regenerated.
// The SVG sources here come from gen-logo.py.

const ROOT = '/home/oli/Documents/Code/Math';
const RES = `${ROOT}/resources`;
const MIPMAP_BASE = `${ROOT}/android/app/src/main/res`;
const WWW = `${ROOT}/wwwroot`;
const CREAM = { r: 244, g: 239, b: 230, alpha: 1 };

const fgSvg = readFileSync(`${RES}/icon-foreground.svg`);
const bgSvg = readFileSync(`${RES}/icon-background.svg`);
const onlySvg = readFileSync(`${RES}/icon-only.svg`);
const markSvg = readFileSync(`${WWW}/nous-mark.svg`);

const densities = [
  { name: 'ldpi',    adaptive:  81, legacy: 36 },
  { name: 'mdpi',    adaptive: 108, legacy: 48 },
  { name: 'hdpi',    adaptive: 162, legacy: 72 },
  { name: 'xhdpi',   adaptive: 216, legacy: 96 },
  { name: 'xxhdpi',  adaptive: 324, legacy: 144 },
  { name: 'xxxhdpi', adaptive: 432, legacy: 192 },
];

function ensureDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

async function renderSvg(svg, size, out, { circle = false } = {}) {
  ensureDir(out);
  let pipeline = sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  if (circle) {
    const mask = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
    );
    pipeline = pipeline.composite([{ input: mask, blend: 'dest-in' }]);
  }
  await pipeline.png().toFile(out);
  console.log('  →', out.replace(ROOT + '/', ''));
}

// Logo centred on cream, sized to a fraction of the shorter side.
async function renderSplash(out) {
  const { width, height } = await sharp(out).metadata();
  const h = Math.round(Math.min(width, height) * 0.3);
  const mark = await sharp(markSvg, { density: 384 }).resize({ height: h }).png().toBuffer();
  await sharp({ create: { width, height, channels: 4, background: CREAM } })
    .composite([{ input: mark, gravity: 'center' }])
    .png().toFile(out);
  console.log('  →', out.replace(ROOT + '/', ''));
}

console.log('Adaptive icon (foreground + background): 6 densities');
for (const d of densities) {
  await renderSvg(fgSvg, d.adaptive, `${MIPMAP_BASE}/mipmap-${d.name}/ic_launcher_foreground.png`);
  await renderSvg(bgSvg, d.adaptive, `${MIPMAP_BASE}/mipmap-${d.name}/ic_launcher_background.png`);
}

console.log('\nLegacy launcher (square + round): 6 densities');
for (const d of densities) {
  await renderSvg(onlySvg, d.legacy, `${MIPMAP_BASE}/mipmap-${d.name}/ic_launcher.png`);
  await renderSvg(onlySvg, d.legacy, `${MIPMAP_BASE}/mipmap-${d.name}/ic_launcher_round.png`, { circle: true });
}

console.log('\nLegacy splash (pre-Android 12): every existing drawable*/splash.png, size kept');
for (const dir of readdirSync(MIPMAP_BASE).filter(n => n.startsWith('drawable')).sort()) {
  const out = `${MIPMAP_BASE}/${dir}/splash.png`;
  if (existsSync(out)) await renderSplash(out);
}

console.log('\nWeb icons');
await renderSvg(onlySvg, 64, `${WWW}/favicon.png`);
await renderSvg(onlySvg, 192, `${WWW}/icon-192.png`);
const maskable = `${WWW}/icon-512-maskable.png`;
await sharp(bgSvg, { density: 384 }).resize(512, 512)
  .composite([{ input: await sharp(fgSvg, { density: 384 }).resize(512, 512).png().toBuffer() }])
  .png().toFile(maskable);
console.log('  →', maskable.replace(ROOT + '/', ''));

console.log('\nDone.');
