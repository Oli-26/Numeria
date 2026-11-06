const FONT = new URL('./fonts/fraunces-latin-600-normal.woff2', import.meta.url).href;

export default {
  deliver: '/home/oli/Documents/Code/Math/android/app/src/main/play/listings/en-US/graphics/phone-screenshots',
  theme: {
    fontFace: `@font-face{font-family:'Fraunces';font-weight:600;src:url('${FONT}') format('woff2')}`,
    font: "'Fraunces', Georgia, serif", weight: 600, size: 84, tracking: '-0.01em',
    subFont: "'Noto Sans', 'Fira Sans', sans-serif", subSize: 38,
    fg: '#2A211B', accent: '#B4552F', sub: '#5A4D42',
    bg: 'radial-gradient(1000px 800px at 50% 8%, #FBF8F2 0%, #F4EFE6 55%, #EAE3D7 100%)',
    rim: 'rgba(42,33,27,.10)', bezel: '#2A211B', shadow: 'rgba(70,45,25,.22)',
  },
  // Labs lead: they are what the shorts show, so a visitor from a short lands on what they just saw.
  shots: [
    { src: 'raw/lab-gerrymander.png', title: 'Same voters, *6–1 either way*', sub: 'Redraw seven districts and watch who wins' },
    { src: 'raw/lab-doge-ladder.png', title: 'Elect a doge *the Venetian way*', sub: 'Ten rounds of lottery and ballot' },
    { poster: 'posters/subjects.html', title: 'Nineteen subjects, *all connected*' },
    { poster: 'posters/labs.html', title: '22 labs you can *play with*' },
    { src: 'raw/guess.png', title: 'Guess first, *then learn why*', sub: 'Predictions that make ideas stick' },
    { src: 'raw/art.png', title: 'Stories the textbooks *skip*', sub: 'Hidden skulls, lost gospels, cargo cults' },
    { src: 'raw/scratch.png', title: 'Survive, then *rebuild*', sub: 'A survival course: fire, water, shelter, metal, power' },
    { src: 'raw/sources.png', title: 'Facts you can *check*', sub: 'Over 5,000 citations to papers, books and museums' },
  ],
  // Custom store listing for visitors from the politics shorts (Play Console, unique URL): node compose.mjs --set politics
  politics: [
    { src: 'raw/lab-gerrymander.png', title: 'Same voters, *6–1 either way*', sub: 'Redraw seven districts and watch who wins' },
    { src: 'raw/lab-doge-ladder.png', title: 'Elect a doge *the Venetian way*', sub: 'Ten rounds of lottery and ballot' },
    { src: 'raw/lab-power-map.png', title: 'Same votes, *different winners*', sub: 'Count them four ways and watch the seats move' },
    { src: 'raw/lab-front-page.png', title: 'Same event, *a slanted page*', sub: 'Pick the words, then see the slant' },
    { src: 'raw/strange-topic.png', title: 'The *strangest* politics', sub: 'Government by lottery, rigged ballots, coin-toss elections' },
    { poster: 'posters/labs.html', title: '22 labs you can *play with*' },
    { poster: 'posters/subjects.html', title: 'Nineteen subjects, *all connected*' },
    { src: 'raw/sources.png', title: 'Facts you can *check*', sub: 'Over 5,000 citations to papers, books and museums' },
  ],
  // Copy out-feature/feature.png to graphics/feature-graphic/feature-graphic.png. It is also the promo video's cover,
  // and Play draws a play button over its centre.
  feature: [{ name: 'feature', poster: 'posters/feature.html', w: 1024, h: 500, title: 'Feature graphic' }],
  // Candidates to swap into the eight above (Play allows eight phone screenshots).
  extra: [
    { name: 'diagram', src: 'raw/diagram.png', title: 'See how it *works*', sub: 'Clear diagrams, from knots to batteries' },
    { name: 'bigq', src: 'raw/bigq.png', title: 'Chase the *big questions*', sub: 'Where physics, biology and philosophy meet' },
    { name: 'home', src: 'raw/home.png', title: 'A fresh *pick every day*', sub: 'Streaks, XP and a daily challenge' },
    { name: 'magic', src: 'raw/magic.png', title: 'Learn real *card magic*', sub: 'A free course: 30 tricks with an ordinary deck' },
    { name: 'memory', src: 'raw/memory.png', title: 'Memorize a *shuffled deck*', sub: 'A free course in the 2,500-year-old art of memory' },
    { name: 'orbitals', src: 'raw/orbitals.png', title: 'Ideas you can *play with*', sub: 'Interactive diagrams inside the lessons' },
    { name: 'unlocks', src: 'raw/shop.png', title: 'Earn it, *make it yours*', sub: 'Unlock themes, frames and flames as you learn' },
  ],
};
