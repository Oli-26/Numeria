// Captures raw phone screens from the Blazor publish build on a short-lived in-process server.
// node capture.mjs [explore]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/home/oli/.npm/_npx/705bc6b22212b352/node_modules/');
const { chromium } = require('playwright-core');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../publish/wwwroot'), OUT = path.join(HERE, 'raw');
const types = { '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm','.woff2':'font/woff2','.dat':'application/octet-stream','.webmanifest':'application/manifest+json' };
const srv = http.createServer((req, res) => {
  let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(ROOT, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port;
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const SHOTS = [
  ['home', '/'],
  ['guess', '/topic/chem-atoms/lesson/chem-atom-01'],
  ['tryit', '/topic/econ-micro/lesson/econ-micro-01', '!.try-it-card', 470],
  ['path', '/path/earth-old'],
  ['bigq', '/big-questions'],
  ['graph', '/graph'],
];
const settle = async (page, ms = 1800) => { await page.waitForSelector('.initial-loader, #app .loading-progress', { state: 'detached', timeout: 60000 }).catch(() => {}); await page.waitForTimeout(ms); };
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('ERR', e.message));
  const shot = async (n, full) => { await page.screenshot({ path: `${OUT}/${n}.png`, fullPage: !!full }); console.log('shot', n); };
  await page.goto(base + '/'); await settle(page, 3000);
  console.log('url', page.url());
  if (page.url().includes('/welcome')) {
    await page.click('text=Get Started'); await page.waitForTimeout(400);
    await page.fill('.ob-input', 'Sam'); await page.click('text=Next'); await page.waitForTimeout(400);
    await page.click('.ob-domain-card >> nth=0'); await page.click('text=Next'); await page.waitForTimeout(400);
    await page.click('.ob-topic-card >> nth=0'); await page.click('button:has-text("Next")'); await page.waitForTimeout(400);
    await page.click('text=Start Learning'); await settle(page, 2000);
  }
  // Seed a plausible week-old learner so the home screen is not empty.
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('mathvoyager_profile'));
    Object.assign(p, { totalXp: 640, points: 420, currentStreak: 6, longestStreak: 9, totalQuestionsAnswered: 58, totalCorrectAnswers: 47, totalStudyMinutes: 95,
      lessonsCompleted: ['calc-01', 'calc-02', 'phys-part-01', 'econ-micro-01', 'bio-eco-01'], pathsStarted: ['earth-old'] });
    localStorage.setItem('mathvoyager_profile', JSON.stringify(p));
  });
  const css = '*:focus,*:focus-visible{outline:none!important}';
  const shots = process.argv[2] === 'explore' ? JSON.parse(process.argv[3]) : SHOTS;
  for (let [n, u, sel, off] of shots) {
    await page.goto(base + u); await settle(page, 2200);
    await page.addStyleTag({ content: css });
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    if (sel && sel.startsWith('!')) {
      sel = sel.slice(1);
      for (let i = 0; i < 8 && !(await page.$(sel)); i++) {
        const skip = await page.$('text=Skip the guess'); if (skip) { await skip.click(); await page.waitForTimeout(500); }
        await page.click('button:has-text("Next")').catch(() => {}); await page.waitForTimeout(900);
      }
    }
    if (sel) { await page.evaluate(([s, o]) => { const e = document.querySelector(s); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - (o || 80)); }, [sel, off]); await page.waitForTimeout(700); }
    await shot(n, process.argv[2] === 'explore' && !sel);
  }
} finally { await browser.close(); srv.close(); }
