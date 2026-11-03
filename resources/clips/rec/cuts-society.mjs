// Recordings for the society lab cuts (labcuts_society.py): each starts on the lab itself, scrolled to its stage.
const at = (sel, off) => async h => { await h.wait(600); await h.scrollTo(sel, off, 1); await h.wait(500); };
// Sets a <select> the way a person would, through its change event, without scrolling it into view.
const choose = (h, sel, i, v) => h.eval(([sel, i, v]) => {
  const s = document.querySelectorAll(sel)[i]; s.value = v; s.dispatchEvent(new Event('change', { bubbles: true }));
}, [sel, i, v]);

// Eased scroll that brings the nth match of a CSS selector to off px below the top of the screen.
const scrollToNth = (h, sel, n, off, ms) => h.eval(([sel, n, off]) => document.querySelectorAll(sel)[n].getBoundingClientRect().top - off, [sel, n, off]).then(px => h.scroll(px, ms));

export default {
  'cut-power-map': { route: '/power-map', async setup(h) {
    await h.wait(600);
    await choose(h, '.pm-row select', 1, '3'); await h.wait(2600);
    await h.scrollTo('.pm-stage', 12, 1); await h.wait(500);
  }, async run(h) {
    await h.wait(500);
    await h.drag('.pm-stage input[type=range]', .25, .5, .42, .5, 1100, 2700);
    await choose(h, '.pm-row select', 2, 'irv'); await h.wait(3100);
    await choose(h, '.pm-row select', 2, 'proportional'); await h.wait(3500);
  } },
  'cut-front-page': { route: '/front-page', async setup(h) {
    await h.wait(600);
    await h.tap('.fp-option:has-text("CITIZENS GATHER FOR RALLY")', 300);
    await h.tap('.fp-option:has-text("Crowd assembles ahead")', 300);
    await scrollToNth(h, '.fp-slot', 2, 12, 1); await h.wait(500);
  }, async run(h) {
    await h.wait(400);
    await h.tap('.fp-option:has-text("The city will weather this")', 500);
    await h.scrollTo('.fp-mock', 12, 900); await h.wait(2000);
    await h.scrollTo('.fp-slot', 12, 900); await h.wait(150);
    await h.tap('.fp-option:has-text("RIOT POLICE CONFRONT MOB")', 400);
    await scrollToNth(h, '.fp-slot', 1, 150, 500);
    await h.tap('.fp-option:has-text("Vandals smash storefronts")', 350);
    await h.tap('.fp-option:has-text("They were destroying everything")', 350);
    await h.scrollTo('.fp-mock', 12, 900); await h.wait(3200);
  } },
  'cut-plot': { route: '/plot-geometry', setup: at('.pg-grid', 110), async run(h) {
    await h.wait(400);
    await h.tap('.pg-chip:has-text("Beowulf")', 3700);
    await h.tap('.pg-chip:has-text("Pride and Prejudice")', 3800);
    await h.tap('.pg-chip:has-text("The Odyssey")', 3600);
  } },
};
