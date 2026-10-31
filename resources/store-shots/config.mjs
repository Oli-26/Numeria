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
  shots: [
    { src: 'raw/art.png', title: 'Stories the textbooks *skip*', sub: 'Hidden skulls, lost gospels, cargo cults' },
    { poster: 'posters/subjects.html', title: 'Nineteen subjects, *all connected*' },
    { src: 'raw/scratch.png', title: 'Survive, then *rebuild*', sub: 'A survival course: fire, water, shelter, metal, power' },
    { src: 'raw/diagram.png', title: 'See how it *works*', sub: 'Clear diagrams, from knots to batteries' },
    { src: 'raw/guess.png', title: 'Guess first, *then learn why*', sub: 'Predictions that make ideas stick' },
    { src: 'raw/sources.png', title: 'Facts you can *check*', sub: '4,600 citations to papers, books and museums' },
    { src: 'raw/bigq.png', title: 'Chase the *big questions*', sub: 'Where physics, biology and philosophy meet' },
    { src: 'raw/home.png', title: 'A fresh *pick every day*', sub: 'Streaks, XP and a daily challenge' },
  ],
};
