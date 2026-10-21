// Renders posts/*.json (and fortune cookies) into post-ready PNGs. See README.md.
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import fs from 'fs'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const { chromium } = createRequire('/home/oli/.npm/_npx/705bc6b22212b352/node_modules/')('playwright-core');

export const WEB_URL = 'nous-9vy.pages.dev';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.mathvoyager.app';

// TikTok overlays its caption and buttons on the lower and right edges, so text stays inside these insets.
const SIZES = {
  tiktok: { w: 1080, h: 1920, pad: { top: 230, right: 150, bottom: 470, left: 90 }, title: 100, h2: 78, body: 52 },
  feed: { w: 1080, h: 1350, pad: { top: 110, right: 100, bottom: 120, left: 100 }, title: 90, h2: 68, body: 46 },
};

const file = rel => pathToFileURL(path.join(ROOT, rel)).href;
// Escapes HTML and keeps a number on the same line as its unit ("1,400 m", "25 km").
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/(\d) (m|km|cm|mm|kg|g|BCE|CE|AD|BC|percent|years)\b/g, '$1&nbsp;$2');
const pad2 = n => String(n).padStart(2, '0');
const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'wwwroot/data/topics.json'), 'utf8'));
const domains = JSON.parse(fs.readFileSync(path.join(ROOT, 'wwwroot/data/domains.json'), 'utf8'));
const lessonIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'wwwroot/data/lesson-index.json'), 'utf8'));

function page(size, inner) {
  const s = SIZES[size], p = s.pad;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: Fraunces; font-weight: 600; src: url('${file('resources/store-shots/fonts/fraunces-latin-600-normal.woff2')}') format('woff2'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${s.w}px; height: ${s.h}px; overflow: hidden; }
  body { background: #F4EFE6; color: #2A211B; font-family: 'Noto Sans', 'Fira Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  .frame { position: absolute; top: ${p.top}px; right: ${p.right}px; bottom: ${p.bottom}px; left: ${p.left}px;
    display: flex; flex-direction: column; justify-content: center; }
  .kicker { font-size: ${s.body * 0.66}px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #B4552F; margin-bottom: 28px; }
  h1 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: ${s.title}px; line-height: 1.06; letter-spacing: -0.01em; text-wrap: balance; }
  h2 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: ${s.h2}px; line-height: 1.1; text-wrap: balance; margin-bottom: 30px; }
  p { font-size: ${s.body}px; line-height: 1.45; color: #3A2F27; text-wrap: pretty; }
  p + p { margin-top: 22px; }
  .rule { width: 96px; height: 6px; background: #B4552F; border-radius: 3px; margin: 40px 0; }
  .count { position: absolute; top: ${p.top - 70}px; right: ${p.right}px; font-size: ${s.body * 0.56}px; color: #8A7B6C; letter-spacing: 0.06em; }
  .brand { position: absolute; left: ${p.left}px; bottom: ${p.bottom - 90}px; display: flex; align-items: center; gap: 14px; opacity: 0.9; }
  .brand img.mark { height: 52px; } .brand img.word { height: 30px; }
  .swipe { position: absolute; right: ${p.right}px; bottom: ${p.bottom - 82}px; font-size: ${s.body * 0.6}px; font-weight: 700; color: #B4552F; }
  .cta-mark { height: 140px; align-self: flex-start; margin-bottom: 40px; }
  .link { font-size: ${s.body * 0.92}px; font-weight: 700; color: #B4552F; margin-top: 34px; }
  .muted { color: #8A7B6C; font-size: ${s.body * 0.72}px; margin-top: 14px; }
  </style></head><body>${inner}</body></html>`;
}

const brand = `<div class="brand"><img class="mark" src="${file('wwwroot/nous-mark.svg')}"><img class="word" src="${file('wwwroot/nous-wordmark.svg')}"></div>`;

function slidesFor(post, size) {
  const topic = topics.find(t => t.id === post.topicId);
  const total = post.slides.length + 1;
  const out = post.slides.map((sl, i) => i === 0
    ? page(size, `<div class="frame">${sl.kicker ? `<div class="kicker">${esc(sl.kicker)}</div>` : ''}<h1>${esc(sl.title)}</h1>${sl.body ? `<div class="rule"></div><p>${esc(sl.body)}</p>` : ''}</div>${brand}<div class="swipe">Swipe →</div>`)
    : page(size, `<div class="count">${i + 1} / ${total}</div><div class="frame"><h2>${esc(sl.title)}</h2>${String(sl.body).split('\n').map(b => `<p>${esc(b)}</p>`).join('')}</div>${brand}`));
  const lessons = lessonIndex[post.topicId]?.length;
  out.push(page(size, `<div class="count">${total} / ${total}</div><div class="frame">
    <img class="cta-mark" src="${file('wwwroot/nous-mark.svg')}">
    <div class="kicker">Want the full story?</div>
    <h2>${esc(topic?.name ?? 'Stories the textbooks skip')}</h2>
    <p>${lessons ? `${lessons} short lessons on this in Nous.` : 'Hundreds of short lessons in Nous.'} Free, no account needed.</p>
    <div class="link">${WEB_URL}</div>
    <div class="muted">Follow for more stories the textbooks skip</div></div>`));
  return out;
}

function cookieSlide(cookie, subject, size) {
  return page(size, `<div class="frame">
    <div class="kicker">${esc(subject)}</div><h2 style="font-size:${SIZES[size].h2 * 0.92}px;line-height:1.22">${esc(cookie.text)}</h2>
    <div class="rule"></div><p class="muted" style="margin-top:0">A daily fortune cookie from Nous · ${WEB_URL}</p></div>${brand}`);
}

async function shoot(browser, htmls, dir, name, size) {
  fs.mkdirSync(dir, { recursive: true });
  const pg = await browser.newPage({ viewport: { width: SIZES[size].w, height: SIZES[size].h } });
  for (const [i, html] of htmls.entries()) {
    const tmp = path.join(dir, '_slide.html');
    fs.writeFileSync(tmp, html);
    await pg.goto(pathToFileURL(tmp).href); await pg.evaluate(() => document.fonts.ready);
    const over = await pg.evaluate(() => { const f = document.querySelector('.frame'); return f && f.scrollHeight > f.clientHeight + 2 ? f.scrollHeight - f.clientHeight : 0; });
    if (over) console.warn(`  WARN ${name} ${size} slide ${i + 1}: text overflows by ${over}px; shorten it`);
    await pg.screenshot({ path: path.join(dir, `${name}-${pad2(i + 1)}.png`) });
    fs.unlinkSync(tmp);
  }
  await pg.close();
}

// Phone galleries sort unpacked images by date, so stamp files in name order, 2 s apart (zip stores times to 2 s).
function stampInOrder(dir) {
  const files = [];
  (function walk(d) { for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : files.push(p); } })(dir);
  const start = Math.floor(Date.now() / 2000) * 2 - files.length * 2;
  files.forEach((f, i) => fs.utimesSync(f, start + i * 2, start + i * 2));
}

const args = process.argv.slice(2);
const zip = args.includes('--zip');
const rest = args.filter(a => a !== '--zip');
const OUT = path.join(HERE, 'out');
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
try {
  if (rest[0] === '--cookies') {
    const count = Number(rest[1] || 10), domain = rest[2] || 'history';
    const cookies = JSON.parse(fs.readFileSync(path.join(ROOT, `wwwroot/data/fortunes/${domain}.json`), 'utf8'));
    const subject = domains.find(d => d.id === domain)?.name ?? domain;
    const step = Math.max(1, Math.floor(cookies.length / count));
    const picked = cookies.filter((_, i) => i % step === 0).slice(0, count);
    for (const size of Object.keys(SIZES))
      await shoot(browser, picked.map(c => cookieSlide(c, subject, size)), path.join(OUT, 'cookies', domain, size), `cookie-${domain}`, size);
    console.log(`${picked.length} ${subject} cookie cards -> ${path.join(OUT, 'cookies', domain)}`);
  } else {
    const dir = path.join(HERE, 'posts');
    const posts = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.id.localeCompare(b.id));
    const chosen = rest.length ? posts.filter(p => rest.includes(p.id)) : posts;
    if (!rest.length) for (const d of ['tiktok', 'feed', 'captions']) fs.rmSync(path.join(OUT, d), { recursive: true, force: true });
    for (const post of chosen) {
      const name = `${pad2(posts.indexOf(post) + 1)}-${post.id}`;
      for (const size of Object.keys(SIZES)) await shoot(browser, slidesFor(post, size), path.join(OUT, size, name), name, size);
      fs.mkdirSync(path.join(OUT, 'captions'), { recursive: true });
      fs.writeFileSync(path.join(OUT, 'captions', `${name}.txt`), [
        'CAPTION (TikTok / Instagram)', `${post.caption}\n\n${post.hashtags.map(h => '#' + h).join(' ')}`, '',
        'X', `${post.xPost}\n${WEB_URL}`, '',
        'REDDIT TITLE', post.redditTitle, '',
        'LINKS', `This topic on the web: https://${WEB_URL}/topic/${post.topicId}`, `Web: https://${WEB_URL}`, `Google Play: ${PLAY_URL}`, ''].join('\n'));
      console.log(`${name}: ${post.slides.length + 1} slides`);
    }
  }
} finally { await browser.close(); }

stampInOrder(OUT);
if (zip) {
  const target = path.join(OUT, 'nous-posts.zip');
  fs.rmSync(target, { force: true });
  const parts = ['tiktok', 'feed', 'captions', 'cookies'].filter(d => fs.existsSync(path.join(OUT, d)));
  execFileSync('zip', ['-qr', target, ...parts], { cwd: OUT });
  console.log(`zip -> ${target}`);
}
