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
  ['art', '/topic/art-looking/lesson/artlook-06', '!img[src$="the-ambassadors.webp"]', 16],
  ['scratch', '/from-scratch', null, 0, 3500],
  ['diagram', '/topic/scratch-metal/lesson/smetal-02', '.diagram', 14],
  ['guess', '/topic/chem-atoms/lesson/chem-atom-01'],
  ['subjects', '/domains'],
  ['sources', '/topic/scratch-power/lesson/spower-02', 'details.sources', 330, 2600, "document.querySelectorAll('details.sources').forEach(d => d.open = true)"],
  ['bigq', '/big-questions'],
  ['home', '/'],
];
// Alternates for the listing (node capture.mjs extra): [name, route, sel, offset, wait, js, pre, after].
// pre edits the stored profile before the page loads; after runs once the page is scrolled into place.
const seed = (o, add = {}) => `(() => { const p = JSON.parse(localStorage.getItem('mathvoyager_profile')); const o = ${JSON.stringify(o)}, add = ${JSON.stringify(add)};
  for (const k in add) p[k] = [...new Set([...(p[k] || []), ...add[k]])]; Object.assign(p, o); localStorage.setItem('mathvoyager_profile', JSON.stringify(p)); })()`;
const range = (pre, n) => Array.from({ length: n }, (_, i) => `${pre}-0${i + 1}`);
const EXTRA = [
  ['magic', '/course/pick-a-card', null, 0, 3000, null,
    seed({}, { lessonsCompleted: [...range('mkey', 5), ...range('mmath', 3), ...range('mmind', 5), ...range('mimg', 5), ...range('mloci', 2)], topicsCompleted: ['magic-keycard', 'memory-mind', 'memory-images'] })],
  ['memory', '/course/memory-palace', null, 0, 3000],
  ['orbitals', '/topic/chem-atoms/lesson/chem-atom-01', '!canvas', 300, 2200, null, null,
    `(async () => { const c = document.querySelector('canvas'), b = c.getBoundingClientRect();
      c.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: b.left + b.width * .9, clientY: b.top + b.height * .955 }));
      await new Promise(r => setTimeout(r, 900)); })()`],
  ['shop', '/shop', null, 0, 2600, null,
    seed({ selectedTheme: 'neon', selectedFrame: 'holo', selectedFlame: 'rainbow', points: 1850 }, { shopPurchases: ['theme-chalkboard', 'theme-neon', 'theme-aurora', 'frame-holo', 'flame-rainbow'] })],
];
// Labs at their signature moment (node capture.mjs labs). Each js runs the lab and waits for its animation to finish.
// text is a JS expression, so a loop variable works as well as a quoted label.
const tap = (sel, text) => `[...document.querySelectorAll('${sel}')].find(b => b.textContent.includes(${text})).click()`;
const pause = ms => `await new Promise(r => setTimeout(r, ${ms}))`;
const pick = (i, v) => `(s => { s.value = '${v}'; s.dispatchEvent(new Event('change', { bubbles: true })); })(document.querySelectorAll('.pm-row select')[${i}])`;
// Seed 25 at 60%: mixed rounds until the faction takes the last vote and the doge.
const doge = `(async () => { const i = document.querySelector('.dg-council input'); i.value = 60; i.dispatchEvent(new Event('input', { bubbles: true }));
  ${pause(600)}; document.querySelector('.dg-go').click(); ${pause(13000)}; })()`;
const LABS = [
  ['lab-gerrymander', '/gerrymander', '.gm-stage', 12, 6000, `(async () => { ${tap('.gm-mode', "'Red draws'")}; ${pause(6500)}; })()`],
  ['lab-doge', '/doge-machine?seed=25', '.dg-council', 12, 2500, doge],
  ['lab-doge-ladder', '/doge-machine?seed=25', '.dg-row:nth-child(2)', 8, 2500, doge],
  // The page ends soon after the stage, so pad it to let the stage scroll to the top.
  ['lab-power-map', '/power-map', '.pm-stage', 12, 2600, `(async () => { document.querySelector('main, body').style.paddingBottom = '700px'; ${pick(1, '3')}; ${pause(2600)}; ${pick(2, 'proportional')}; ${pause(3500)}; })()`],
  ['lab-front-page', '/front-page', '.fp-mock', 12, 2600, `(async () => {
    for (const t of ['CITIZENS GATHER FOR RALLY', 'Crowd assembles ahead', 'RIOT POLICE CONFRONT MOB', 'Vandals smash storefronts', 'They were destroying everything']) { ${tap('.fp-option', 't')}; ${pause(500)}; }
    ${pause(2500)}; })()`],
  ['strange-topic', '/topic/politics-strange'],
];
const settle = async (page, ms = 1800) => { await page.waitForSelector('#splash', { state: 'detached', timeout: 60000 }).catch(() => {}); await page.waitForTimeout(ms); };
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
      lessonsCompleted: ['calc-01', 'calc-02', 'phys-part-01', 'econ-micro-01', 'bio-eco-01', 'hpre-01', 'rcrg-01', 'sfire-01', 'sfire-02', 'sfire-03', 'sfire-04', 'sfire-05', 'said-01', 'sshelter-01', 'sshelter-02', 'sshelter-03', 'sshelter-04', 'sshelter-05', 'swater-01', 'swater-02', 'swater-03'], topicsCompleted: ['scratch-fire', 'scratch-shelter'], pathsStarted: ['earth-old'],
      currentDomain: 'history', lastActivityDate: new Date().toISOString().slice(0, 10) });
    localStorage.setItem('mathvoyager_profile', JSON.stringify(p));
  });
  const css = '*:focus,*:focus-visible{outline:none!important}.web-banner{display:none!important}';
  const shots = process.argv[2] === 'explore' ? JSON.parse(process.argv[3]) : process.argv[2] === 'extra' ? EXTRA : process.argv[2] === 'labs' ? LABS : SHOTS;
  for (let [n, u, sel, off, wait, js, pre, after] of shots) {
    if (pre) await page.evaluate(pre);
    await page.goto(base + u); await settle(page, wait || 2200);
    if (js) { await page.evaluate(js); await page.waitForTimeout(400); }
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
    if (after) await page.evaluate(after);
    await shot(n, process.argv[2] === 'explore' && !sel);
  }
} finally { await browser.close(); srv.close(); }
