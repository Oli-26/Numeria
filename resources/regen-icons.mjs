import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const ROOT = '/home/oli/Documents/Code/Math';
const RES = `${ROOT}/resources`;
const MIPMAP_BASE = `${ROOT}/android/app/src/main/res`;

const fgSvg = readFileSync(`${RES}/icon-foreground.svg`);
const bgSvg = readFileSync(`${RES}/icon-background.svg`);
const onlySvg = readFileSync(`${RES}/icon-only.svg`);
const featureSvg = readFileSync(`${RES}/feature-graphic.svg`);

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

async function renderRect(svg, w, h, out) {
  ensureDir(out);
  await sharp(svg, { density: 192 }).resize(w, h, { fit: 'fill' }).png().toFile(out);
  console.log('  →', out.replace(ROOT + '/', ''));
}

console.log('Adaptive icon (foreground + background) — 5 densities');
for (const d of densities) {
  await renderSvg(fgSvg, d.adaptive, `${MIPMAP_BASE}/mipmap-${d.name}/ic_launcher_foreground.png`);
  await renderSvg(bgSvg, d.adaptive, `${MIPMAP_BASE}/mipmap-${d.name}/ic_launcher_background.png`);
}

console.log('\nLegacy launcher (square + round) — 5 densities');
for (const d of densities) {
  await renderSvg(onlySvg, d.legacy, `${MIPMAP_BASE}/mipmap-${d.name}/ic_launcher.png`);
  await renderSvg(onlySvg, d.legacy, `${MIPMAP_BASE}/mipmap-${d.name}/ic_launcher_round.png`, { circle: true });
}

console.log('\nStore icons');
await renderSvg(onlySvg, 512,  `${RES}/play-store-icon-512.png`);
await renderSvg(onlySvg, 1024, `${RES}/play-store-icon-1024.png`);
await renderSvg(onlySvg, 1024, `${RES}/icon.png`);

console.log('\nFeature graphic (1024×500)');
await renderRect(featureSvg, 1024, 500, `${RES}/feature-graphic.png`);
await renderRect(featureSvg, 1024, 500, `${RES}/play-store-feature-graphic-1024x500.png`);

console.log('\nDone.');
