// Recording for the Doge Machine cut (politics_cuts.py).
const share = (h, v) => h.eval(v => {
  const i = document.querySelector('.dg-council input'); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true }));
}, v);

export default {
  'cut-doge-machine': { route: '/doge-machine?seed=13', async setup(h) {
    await h.wait(800);
    await share(h, 60); await h.wait(500);
    await h.scrollTo('.dg-stage', 12, 1); await h.wait(400);
  }, async run(h) {
    await h.wait(700);
    await h.tap('.dg-go', 9800);
    await h.scrollTo('.dg-results', 12, 1400); await h.wait(3200);
  } },
};
