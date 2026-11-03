// Recordings for the lab cuts of the word labs (labcuts_words.py): each starts on the lab, scrolled to its stage.
const at = (sel, off) => async h => { await h.wait(600); await h.scrollTo(sel, off, 1); await h.wait(500); };
const type = async (h, text) => { await h.tap('.cd-input', 200); await h.page.keyboard.type(text, { delay: 45 }); await h.wait(250); };

export default {
  'cut-cipher': { route: '/cipher-decoder', setup: at('.cd-puzzle', 70), async run(h) {
    await h.wait(500);
    await type(h, 'the raven knows');
    await h.tap('.cd-actions button:has-text("Submit")', 2300);
    await h.tap('.cd-nav button:has-text("Next")', 600);
    await type(h, 'the observed');
    await h.tap('.cd-actions button:has-text("Submit")', 900);
    await h.tap('.cd-actions button:has-text("Reveal")', 2200);
    for (let i = 0; i < 4; i++) await h.tap('.cd-nav button:has-text("Next")', 260);
    await h.wait(400);
    await h.tap('.cd-actions button:has-text("Reveal")', 3400);
  } },
  // The tree sits just above the bottom nav, with the last rows of word chips above it.
  'cut-etymology': { route: '/etymology', async setup(h) {
    await h.wait(600); await h.tap('.etym-chip:text-is("father")', 2800);
    await h.eval(() => scrollBy(0, document.querySelector('.etym-tree-wrap').getBoundingClientRect().bottom - 672)); await h.wait(500);
  }, async run(h) {
    await h.wait(400);
    await h.tap('.etym-chip:text-is("wheel")', 3300);
    await h.tap('.etym-chip:text-is("tea")', 3100);
    await h.tap('.etym-chip:text-is("star")', 3400);
  } },
  'cut-sound-shift': { route: '/sound-shift', setup: at('.ss-laws', 70), async run(h) {
    await h.wait(400);
    await h.tap('.ss-preset:has-text("father")', 3400);
    await h.tap('.ss-law:has-text("Great Vowel Shift")', 3600);
    await h.tap('.ss-preset:has-text("name")', 4400);
  } },
};
