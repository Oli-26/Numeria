// Recordings for the editorial lab cuts (labcuts.py): each starts on the lab itself, scrolled to its stage.
const at = (sel, off) => async h => { await h.wait(600); await h.scrollTo(sel, off, 1); await h.wait(500); };

export default {
  'cut-evolution': { route: '/evolution-sim', setup: at('.evo-canvas-wrap', 150), async run(h) {
    await h.tap('button:has-text("Sooty bark")', 400);
    await h.tap('button:has-text("Run")', 4200);
    await h.tap('button:has-text("Clean bark")', 4800);
  } },
  'cut-era-map': { route: '/era-map', async setup(h) { await h.wait(600); await h.tap('.era-tick >> nth=2', 1200); await h.scroll(48, 1); await h.wait(400); }, async run(h) {
    await h.wait(700);
    for (let i = 3; i <= 12; i++) await h.tap(`.era-tick >> nth=${i}`, 1150);
    await h.wait(900);
  } },
  'cut-market': { route: '/market-sim', setup: at('#ms-da', 40), async run(h) {
    await h.wait(500);
    await h.drag('#ms-da', .6, .5, .9, .5, 1300, 400);
    await h.drag('#ms-da', .9, .5, .5, .5, 1300, 700);
    await h.tap('#ms-kind', 250); await h.page.selectOption('#ms-kind', 'Tax'); await h.wait(2400);
    await h.drag('#ms-level', .3, .5, .55, .5, 1500, 1500);
  } },
  'cut-trolley': { route: '/trolley-lab', setup: at('.tl-tag', 20), async run(h) {
    await h.wait(500);
    await h.tap('.tl-actions button >> nth=0', 2700);
    await h.scroll(330, 900); await h.wait(2200);
    await h.tap('button:has-text("Next dilemma")', 60);
    await h.eval(() => { const e = document.querySelector('.tl-tag'); scrollTo(0, e.getBoundingClientRect().top + scrollY - 20); }); await h.wait(1200);
    await h.tap('.tl-actions button >> nth=0', 2700);
  } },
  'cut-reaction': { route: '/reaction-bench', setup: at('.rb-tray-actions', 420), async run(h) {
    const pick = async (...names) => { for (const n of names) await h.tap(`.reagent-name:text-is("${n}")`, 350); };
    const react = async (ms) => { await h.tap('.rb-tray-actions .btn-accent', 120); await h.scrollTo('.rb-viz', 60, 450); await h.wait(ms); };
    await pick('Potassium', 'Water'); await react(3400);
    await h.tap('.rb-tray-actions .btn-ghost:has-text("Clear")', 400);
    await pick('Silver nitrate', 'Potassium iodide'); await react(3600);
    await h.tap('.rb-tray-actions .btn-ghost:has-text("Clear")', 400);
    await pick('Magnesium', 'Hydrochloric acid'); await react(3200);
  } },
  'cut-molecule': { route: '/molecule-builder', setup: at('.mb-canvas', 230), async run(h) {
    await h.wait(400);
    await h.tap('.mb-elem:has-text("C") >> nth=0', 300);
    await h.tapAt('.mb-canvas', .3, .62, 450); await h.tapAt('.mb-canvas', .5, .38, 450);
    await h.tap('.mb-elem:has-text("O")', 300); await h.tapAt('.mb-canvas', .72, .6, 600);
    await h.tap('.mb-mode:has-text("Bond")', 350);
    await h.tapAt('.mb-canvas', .3, .62, 300); await h.tapAt('.mb-canvas', .5, .38, 600);
    await h.tapAt('.mb-canvas', .5, .38, 300); await h.tapAt('.mb-canvas', .72, .6, 800);
    await h.tap('button:has-text("Fill hydrogens")', 3200);
  } },
  'cut-phase': { route: '/phase-diagram', setup: at('#pd-vial', 30), async run(h) {
    await h.wait(500);
    await h.drag('.pd-svg', .45, .35, .12, .35, 1300, 1100);
    await h.drag('.pd-svg', .12, .35, .85, .35, 1600, 1100);
    await h.drag('.pd-svg', .85, .35, .95, .05, 1000, 1500);
  } },
  'cut-cell': { route: '/cell-tour', setup: at('.ct-cell', 150), async run(h) {
    await h.wait(500);
    await h.tap('[aria-label="Mitochondrion"] >> nth=0', 2000);
    await h.tap('[aria-label="Golgi Apparatus"] >> nth=0', 2000);
    await h.tap('button:has-text("Plant Cell")', 1300);
    await h.tap('[aria-label="Chloroplast"] >> nth=0', 2200);
  } },
  'cut-race': { route: '/algorithm-race', async setup(h) {
    await h.wait(600);
    await h.eval(() => { const r = document.querySelector('.ar-row input[type=range]'); r.value = 8; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); });
    await h.scrollTo('.ar-actions', 220, 1); await h.wait(500);
  }, async run(h) {
    await h.wait(400);
    await h.tap('button:has-text("Start race")', 10500);
  } },
  'cut-particle': { route: '/particle-sandbox', setup: at('.ps-config', 70), async run(h) {
    await h.wait(400);
    await h.tap('.ps-chip:has-text("Positron")', 350); await h.tap('.ps-chip:has-text("GeV")', 350);
    await h.tap('.ps-collide-btn', 100); await h.scrollTo('.ps-result', 60, 500); await h.wait(2600);
    await h.scrollTo('.ps-config', 70, 600);
    await h.tap('.ps-chip:has-text("Proton") >> nth=0', 300); await h.tap('.ps-chip:has-text("Proton") >> nth=1', 300); await h.tap('.ps-chip:has-text("TeV")', 350);
    await h.tap('.ps-collide-btn', 100); await h.scrollTo('.ps-result', 60, 500); await h.wait(2900);
  } },
  'cut-cosmic': { route: '/cosmic-scale', setup: at('#cz-exp', 90), async run(h) {
    await h.wait(500);
    await h.drag('.cosmic-slider', .55, .5, .99, .5, 3200, 900);
    await h.drag('.cosmic-slider', .99, .5, .01, .5, 3800, 1000);
  } },
  'cut-pi': { route: '/playground', profile: { shopPurchases: ['theme-dark', 'unlock-playground'] }, async setup(h) {
    await h.wait(600); await h.tap('.experiment-card:has-text("Pi Was Different")', 1300);
  }, async run(h) {
    await h.wait(400);
    await h.drag('#pi-slider', .25, .5, .02, .5, 1400, 700);
    await h.drag('#pi-slider', .02, .5, .98, .5, 2600, 900);
    await h.tap('button:has-text("p = 2")', 1600);
  } },
};
