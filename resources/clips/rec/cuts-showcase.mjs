// Recordings for the showcase montage (showcase.py).
const share = (h, v) => h.eval(v => {
  const i = document.querySelector('.dg-council input'); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true }));
}, v);
const scope = (h, v) => h.eval(v => { const s = document.querySelector('.gc-subject'); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); }, v);

export default {
  // Seed 25 at 60%: the faction takes the last vote and the doge.
  'cut-doge-win': { route: '/doge-machine?seed=25', async setup(h) {
    await h.wait(800);
    await share(h, 60); await h.wait(500);
    await h.scrollTo('.dg-stage', 12, 1); await h.wait(400);
  }, async run(h) {
    await h.wait(500);
    await h.tap('.dg-go', 12500);
    await h.scrollTo('.dg-results', 12, 1200); await h.wait(2200);
  } },
  // A fast scroll down one lesson's opened source list.
  'cut-sources': { route: '/topic/scratch-power/lesson/spower-02', async setup(h) {
    await h.eval(() => document.querySelectorAll('details.sources').forEach(d => d.open = true));
    await h.scrollTo('details.sources', 330, 1); await h.wait(500);
  }, async run(h) {
    await h.wait(300);
    await h.scroll(2600, 2200); await h.wait(300);
  } },
  'cut-graph': { route: '/graph', async setup(h) { await h.wait(2200); }, async run(h) {
    await h.wait(700);
    await scope(h, 'all'); await h.wait(2600); await h.snap('g-all');
    await h.tap('.gc-layout button:has-text("Layers")', 2600); await h.snap('g-layers');
    await h.tap('.gc-layout button:has-text("Web")', 1800);
  } },
};
