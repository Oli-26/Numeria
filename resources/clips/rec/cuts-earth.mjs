// Recordings for the Geology and History lab cuts in labcuts_earth.py: each starts on the lab, scrolled to its stage.
const at = (sel, off) => async h => { await h.wait(600); await h.scrollTo(sel, off, 1); await h.wait(500); };
// Moves the timeline under the pinned gauge with a transform rather than scrolling the window: headless captures draw
// fixed layers a frame behind a moving scroll, which made the gauge bob. DeepTime.sync reads it exactly as it reads a scroll.
const drill = (h, px, ms) => h.eval(([px, ms]) => new Promise(done => {
  const sc = document.getElementById('dt-scroller'), els = [sc, document.querySelector('.dt-runout')];
  if (px === null) { const rows = sc.querySelectorAll('.dt-row'); px = rows[rows.length - 1].getBoundingClientRect().top + 31 - (document.getElementById('dt-gauge').getBoundingClientRect().bottom + 27); }
  const d0 = +(sc.dataset.fy || 0), t0 = performance.now(), ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const step = now => {
    const u = Math.min(1, (now - t0) / ms), d = d0 + px * ease(u);
    els.forEach(e => { e.style.transform = 'translateY(' + (-d).toFixed(1) + 'px)'; }); sc.dataset.fy = d;
    DeepTime.sync(); u < 1 ? requestAnimationFrame(step) : done();
  };
  requestAnimationFrame(step);
}), [px, ms]);

export default {
  'cut-deep-time': { route: '/deep-time', setup: at('.dt-gauge', -4), async run(h) {
    await h.wait(600);
    await drill(h, 1500, 2600); await h.wait(500);
    await drill(h, 1900, 2800); await h.wait(500);
    await drill(h, null, 3400); await h.wait(2200);
  } },
  'cut-rock-id': { route: '/rock-id?sample=Limestone', setup: at('.rock-sample-card', 64), async run(h) {
    await h.wait(500);
    await h.tap('button:has-text("Drop of acid")', 3500);
    await h.tap('button:has-text("Scratch with steel")', 1900);
    await h.nav('/rock-id?sample=Granite', 700); await h.scrollTo('.rock-sample-card', 64, 1); await h.wait(500);
    await h.tap('button:has-text("Scratch with steel")', 1900);
    await h.tap('button:has-text("Drop of acid")', 2200);
  } },
  'cut-trade-routes': { route: '/trade-routes', setup: at('.trt-route-chips', 56), async run(h) {
    await h.wait(400);
    await h.tap('.trt-route-chips .chip:has-text("Silk Road")', 500);
    await h.tap('button:has-text("Play caravan")', 6900);
    await h.tap('.trt-route-chips .chip:has-text("Maritime Spice Route")', 500);
    await h.tap('button:has-text("Play caravan")', 6900);
  } },
};
