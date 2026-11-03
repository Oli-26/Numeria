// Records scripted sessions of the publish build as JPEG frames plus times.json, the input compose.py and edit.py expect.
// Usage: node record.mjs OUTDIR name [name...]     (names are keys of SCRIPTS below or of rec/*.mjs default exports; OUTDIR/<name>/ gets frames/ and times.json)
// A script is { route, profile?, setup?(h), run(h) }: profile is merged into the stored profile before the route loads,
// setup runs before recording starts, run is what gets recorded. PUBLISH=dir records a different publish output.
//        node record.mjs OUTDIR --shot route [route...]   (one still per route, for finding scroll offsets)
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
const { chromium } = createRequire('/home/oli/.npm/_npx/705bc6b22212b352/node_modules/')('playwright-core');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.env.PUBLISH || path.join(HERE, '../../publish'), 'wwwroot');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.dat': 'application/octet-stream' };
const srv = http.createServer((req, res) => {
  let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(ROOT, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const [OUT, ...names] = process.argv.slice(2);

// A soft dot shows each tap, since a recording has no finger.
const TAPS = `addEventListener('pointerdown', e => { const d = document.createElement('div');
  d.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;' +
    'background:rgba(180,85,47,.28);border:2px solid rgba(180,85,47,.55);left:' + e.clientX + 'px;top:' + e.clientY + 'px;transition:transform .45s ease-out,opacity .45s ease-out';
  document.body.appendChild(d); requestAnimationFrame(() => requestAnimationFrame(() => { d.style.transform = 'scale(1.8)'; d.style.opacity = '0'; }));
  setTimeout(() => d.remove(), 600); }, true);`;
const CSS = '*:focus,*:focus-visible{outline:none!important}.web-banner{display:none!important}::-webkit-scrollbar{display:none}';

const settle = async (page, ms = 1800) => { await page.waitForSelector('#splash', { state: 'detached', timeout: 60000 }).catch(() => {}); await page.waitForTimeout(ms); };

function helpers(page) {
  const h = {
    wait: ms => page.waitForTimeout(ms),
    go: async (route, ms) => { await page.goto(base + route); await settle(page, ms); await page.addStyleTag({ content: CSS }); },
    // In-app navigation, so a recording never shows the splash screen.
    nav: async (route, ms = 1400) => { await page.evaluate(r => Blazor.navigateTo(r), route); await page.waitForTimeout(ms); },
    // Taps the centre of the first visible match, through the mouse so the tap dot shows.
    tap: async (sel, after = 700) => {
      const el = page.locator(sel).first(); await el.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
      let b = await el.boundingBox(); if (!b) throw new Error('no box for ' + sel);
      // The app's bottom nav is fixed over the last ~90 px, so a target behind it is scrolled clear before the tap.
      const vh = page.viewportSize().height, under = b.y + b.height / 2 - (vh - 100);
      if (under > 0) { await page.evaluate(d => scrollBy(0, d), under + 40); await page.waitForTimeout(150); b = await el.boundingBox(); }
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up();
      await page.waitForTimeout(after);
    },
    // Eased scroll of the window (or a selector's scroll container) by px over ms.
    scroll: (px, ms = 900) => page.evaluate(([px, ms]) => new Promise(done => {
      const y0 = scrollY, t0 = performance.now(), ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      const step = now => { const u = Math.min(1, (now - t0) / ms); scrollTo(0, y0 + px * ease(u)); u < 1 ? requestAnimationFrame(step) : done(); };
      requestAnimationFrame(step);
    }), [px, ms]),
    scrollTo: (sel, off = 80, ms = 900) => page.evaluate(([sel, off]) => { const e = document.querySelector(sel); return e ? e.getBoundingClientRect().top - off : 0; }, [sel, off]).then(px => h.scroll(px, ms)),
    eval: (fn, arg) => page.evaluate(fn, arg),
    // Taps a point given as fractions of an element's box, for widgets drawn on a canvas.
    tapAt: async (sel, fx, fy, after = 700) => {
      const b = await page.locator(sel).first().boundingBox(); if (!b) throw new Error('no box for ' + sel);
      await page.mouse.move(b.x + b.width * fx, b.y + b.height * fy); await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up();
      await page.waitForTimeout(after);
    },
    // Drags between two points given as fractions of an element's box, in steps so the page sees a real drag.
    drag: async (sel, fx0, fy0, fx1, fy1, ms = 900, after = 500) => {
      const b = await page.locator(sel).first().boundingBox(); if (!b) throw new Error('no box for ' + sel);
      const n = Math.max(2, Math.round(ms / 16)), x0 = b.x + b.width * fx0, y0 = b.y + b.height * fy0, x1 = b.x + b.width * fx1, y1 = b.y + b.height * fy1;
      await page.mouse.move(x0, y0); await page.mouse.down();
      for (let i = 1; i <= n; i++) { const u = i / n, e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; await page.mouse.move(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e); await page.waitForTimeout(16); }
      await page.mouse.up(); await page.waitForTimeout(after);
    },
    page,
    snap: name => page.screenshot({ path: path.join(OUT, name + '.png') }),
  };
  return h;
}

const PROFILE = {
  totalXp: 2140, points: 4200, currentStreak: 12, longestStreak: 15, totalQuestionsAnswered: 184, totalCorrectAnswers: 151, totalStudyMinutes: 320,
  lessonsCompleted: ['calc-01', 'calc-02', 'phys-part-01', 'econ-micro-01', 'bio-eco-01', 'hpre-01', 'rcrg-01', 'sfire-01', 'sfire-02', 'sfire-03', 'sfire-04', 'sfire-05',
    'said-01', 'sshelter-01', 'sshelter-02', 'sshelter-03', 'sshelter-04', 'sshelter-05', 'swater-01', 'swater-02', 'swater-03'],
  topicsCompleted: ['scratch-fire', 'scratch-shelter'], currentDomain: 'history',
};

const SCRIPTS = {
  // Guess first: commit to an answer, see how far off intuition is, then read on.
  lesson: { route: '/topic/chem-atoms/lesson/chem-atom-01', async run(h) {
    await h.wait(800);
    await h.tap('text=About 1 metre', 2600);
    await h.tap('text=Read on', 1000);
    await h.scroll(220, 900); await h.wait(300);
    await h.scroll(-220, 400);
    await h.tap('.concept-dot >> nth=2', 1200);
    await h.scrollTo('canvas', 140, 1200); await h.wait(700);
    for (const fx of [.3, .5, .7, .9]) await h.tapAt('canvas', fx, .955, 1000);
    await h.wait(400);
  } },
  // Spend points in the shop and the app re-skins on the spot.
  unlocks: { route: '/shop', async run(h) {
    await h.wait(1200);
    await h.tap('.shop-card:has-text("Chalkboard") .buy-btn', 1900);
    await h.tap('.shop-card:has-text("Neon Glow") .buy-btn', 1900);
    await h.tap('.tab:has-text("Frames")', 900);
    await h.tap('.shop-card:has-text("Holographic") .buy-btn', 1500);
    await h.tap('.tab:has-text("Flames")', 900);
    await h.tap('.shop-card:has-text("Prism") .buy-btn', 1500);
    await h.nav('/', 2400);
  } },
};

for (const f of fs.existsSync(path.join(HERE, 'rec')) ? fs.readdirSync(path.join(HERE, 'rec')).filter(f => f.endsWith('.mjs')) : [])
  Object.assign(SCRIPTS, (await import(pathToFileURL(path.join(HERE, 'rec', f)).href)).default);

const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  await ctx.addInitScript(TAPS);
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('ERR', e.message));
  await page.goto(base + '/'); await settle(page, 3000);
  if (page.url().includes('/welcome')) {
    await page.click('text=Get Started'); await page.waitForTimeout(400);
    await page.fill('.ob-input', 'Sam'); await page.click('text=Next'); await page.waitForTimeout(400);
    await page.click('.ob-domain-card >> nth=0'); await page.click('text=Next'); await page.waitForTimeout(400);
    await page.click('.ob-topic-card >> nth=0'); await page.click('button:has-text("Next")'); await page.waitForTimeout(400);
    await page.click('text=Start Learning'); await settle(page, 2000);
  }
  await page.evaluate(seed => {
    const p = JSON.parse(localStorage.getItem('mathvoyager_profile'));
    Object.assign(p, seed, { lastActivityDate: new Date().toISOString().slice(0, 10) });
    localStorage.setItem('mathvoyager_profile', JSON.stringify(p));
  }, PROFILE);
  const h = helpers(page);

  if (names[0] === '--shot') {
    fs.mkdirSync(OUT, { recursive: true });
    for (const r of names.slice(1)) {
      await h.go(r, 2400); const f = path.join(OUT, r.replace(/\W+/g, '_') + '.png');
      await page.screenshot({ path: f, fullPage: true }); console.log('shot', f);
    }
  } else for (const name of names) {
    const dir = path.join(OUT, name, 'frames'); fs.rmSync(path.join(OUT, name), { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const sc = SCRIPTS[name]; if (!sc) throw new Error('no script ' + name);
    if (sc.profile) await page.evaluate(o => { const p = JSON.parse(localStorage.getItem('mathvoyager_profile')); Object.assign(p, o); localStorage.setItem('mathvoyager_profile', JSON.stringify(p)); }, sc.profile);
    await h.go(sc.route, 2400);
    if (sc.setup) await sc.setup(h);
    // Screencast frames come at CSS pixels in headless Chrome, so capture device-pixel screenshots in a loop instead.
    const times = []; let n = 0, stop = false;
    const t0 = Date.now() / 1000;
    const grab = (async () => {
      while (!stop) {
        const t = Date.now() / 1000 - t0;
        const buf = await page.screenshot({ type: 'jpeg', quality: 90, caret: 'initial' });
        times.push(+t.toFixed(4)); fs.writeFileSync(path.join(dir, String(++n).padStart(5, '0') + '.jpg'), buf);
      }
    })();
    await page.evaluate(() => { window.__simfxRecord = true; window.__sfxLog = []; });
    await sc.run(h);
    stop = true; await grab;
    const end = Date.now() / 1000 - t0;
    // The labs' sound effects were logged instead of played; render them into a track that lines up with the frames.
    const wav = await page.evaluate(([a, b]) => window.SimFx && window.__sfxLog.length ? SimFx.renderLog(a, b) : null, [t0, end]);
    await page.evaluate(() => { window.__simfxRecord = false; });
    if (wav) fs.writeFileSync(path.join(OUT, name, 'audio.wav'), Buffer.from(wav, 'base64'));
    fs.writeFileSync(path.join(OUT, name, 'times.json'), JSON.stringify({ times, end }));
    console.log(name, n, 'frames', end.toFixed(1) + 's');
  }
} finally { await browser.close(); srv.close(); }
