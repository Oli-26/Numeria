// Composes captioned 1080x1920 Play Store phone screenshots from raw captures.
// Usage: node compose.mjs            (reads ./config.mjs, writes ./out/N.png and copies to config.deliver)
// Needs playwright-core (npx cache) + its headless Chromium, and sharp (Math/node_modules) to flatten alpha.
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire('/home/oli/.npm/_npx/705bc6b22212b352/node_modules/')('playwright-core');
const sharp = createRequire('/home/oli/Documents/Code/Math/node_modules/')('sharp');
const cfg = (await import(pathToFileURL(path.join(HERE, 'config.mjs')))).default;
const W = 1080, H = 1920;
const t = cfg.theme;
const PHONE_W = t.phoneW || 800, BEZEL = 18, PHONE_TOP = t.phoneTop || 500;
const SCREEN_W = PHONE_W - 2 * BEZEL;

// *word* in a caption renders in the accent colour.
const mark = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*(.+?)\*/g, '<em>$1</em>');

function html(shot, imgW) {
  const src = path.resolve(HERE, shot.src);
  const crop = shot.cropTop ?? cfg.cropTop ?? 0;
  const scale = SCREEN_W / imgW;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  ${t.fontFace || ''}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:${t.bg};position:relative;font-family:${t.subFont || t.font};-webkit-font-smoothing:antialiased}
  .deco{position:absolute;inset:0;pointer-events:none}
  .cap{position:absolute;left:70px;right:70px;top:${t.capTop || 118}px;text-align:center}
  h1{font-family:${t.font};font-weight:${t.weight || 800};font-size:${t.size || 82}px;line-height:1.06;color:${t.fg};letter-spacing:${t.tracking || '-0.01em'};${t.h1Extra || ''}}
  h1{text-wrap:balance}
  h1 em{white-space:nowrap;font-style:normal;color:${t.accent}}
  p{text-wrap:balance;margin-top:${t.subGap || 26}px;font-size:${t.subSize || 38}px;line-height:1.3;color:${t.sub};font-weight:${t.subWeight || 500}}
  .phone{position:absolute;left:${(W - PHONE_W) / 2}px;top:${PHONE_TOP}px;width:${PHONE_W}px;height:${H}px;
    border-radius:72px;background:${t.bezel || '#07080b'};padding:${BEZEL}px;
    box-shadow:0 0 0 2px ${t.rim || 'rgba(255,255,255,.14)'}, 0 50px 110px ${t.shadow || 'rgba(0,0,0,.55)'}, 0 12px 30px ${t.shadow || 'rgba(0,0,0,.35)'}}
  .screen{width:100%;height:100%;border-radius:56px;overflow:hidden;background:#000;position:relative}
  .screen img{position:absolute;left:0;top:${-crop * scale}px;width:${SCREEN_W}px}
  </style></head><body>
  <div class="deco">${t.deco || ''}</div>
  <div class="cap"><h1>${mark(shot.title)}</h1>${shot.sub ? `<p>${mark(shot.sub)}</p>` : ''}</div>
  <div class="phone"><div class="screen"><img src="${pathToFileURL(src)}"></div></div>
  </body></html>`;
}

const outDir = path.join(HERE, 'out');
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) fs.unlinkSync(path.join(outDir, f));
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const [i, shot] of cfg.shots.entries()) {
    const meta = await sharp(path.resolve(HERE, shot.src)).metadata();
    const tmp = path.join(outDir, `_page${i + 1}.html`);
    fs.writeFileSync(tmp, html(shot, meta.width));
    await page.goto(pathToFileURL(tmp).href); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(250);
    const over = await page.evaluate(() => { const c = document.querySelector('.cap').getBoundingClientRect(), p = document.querySelector('.phone').getBoundingClientRect(); return c.bottom > p.top - 24 ? `caption bottom ${c.bottom} vs phone ${p.top}` : null; });
    if (over) console.warn(`WARN ${i + 1}: ${over}`);
    const buf = await page.screenshot({ type: 'png' });
    await sharp(buf).flatten({ background: '#000' }).removeAlpha().png().toFile(path.join(outDir, `${i + 1}.png`));
    fs.unlinkSync(tmp);
    console.log(`${i + 1}.png  ${shot.title.replace(/\*/g, '')}`);
  }
} finally { await browser.close(); }
if (cfg.deliver && process.argv[2] !== '--no-deliver') {
  fs.mkdirSync(cfg.deliver, { recursive: true });
  for (const f of fs.readdirSync(cfg.deliver)) if (/\.(png|jpe?g)$/i.test(f)) fs.unlinkSync(path.join(cfg.deliver, f));
  cfg.shots.forEach((_, i) => fs.copyFileSync(path.join(outDir, `${i + 1}.png`), path.join(cfg.deliver, `${i + 1}.png`)));
  console.log('delivered to', cfg.deliver);
}
