export default {
  deliver: '/home/oli/Documents/Code/Math/android/app/src/main/play/listings/en-US/graphics/phone-screenshots',
  theme: {
    font: "'Noto Serif', Georgia, serif", weight: 700, size: 80, tracking: '0',
    subFont: "'Noto Sans', 'Fira Sans', sans-serif", subSize: 37,
    fg: '#fff3d6', accent: '#ffd76a', sub: '#c8bfe6',
    bg: 'radial-gradient(900px 700px at 50% 12%, #3b2a7a 0%, #1d1a52 45%, #0e1030 100%)',
    rim: 'rgba(255,215,106,.35)', bezel: '#08091c', shadow: 'rgba(0,0,20,.6)',
    // star field plus a faint constellation, echoing the constellation-N logo
    deco: (() => {
      let s = '<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">', seed = 7;
      const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 140; i++) s += `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 1920).toFixed(0)}" r="${(0.8 + r() * 2).toFixed(1)}" fill="#fff" fill-opacity="${(0.15 + r() * 0.45).toFixed(2)}"/>`;
      const pts = [[70, 520], [170, 400], [120, 250], [960, 180], [1010, 330], [900, 460], [1020, 560]];
      s += '<g stroke="#ffd76a" stroke-opacity=".28" stroke-width="2.5" fill="none"><polyline points="70,520 170,400 120,250"/><polyline points="960,180 1010,330 900,460 1020,560"/></g>';
      for (const [x, y] of pts) s += `<circle cx="${x}" cy="${y}" r="7" fill="#ffd76a" fill-opacity=".55"/>`;
      return s + '</svg>';
    })(),
  },
  shots: [
    { src: 'raw/bigq.png', title: 'Chase the *big questions*', sub: 'Where physics, biology and philosophy meet' },
    { src: 'raw/graph.png', title: 'Everything is *connected*', sub: 'Every topic on one map of knowledge' },
    { src: 'raw/guess.png', title: 'Guess first, *then learn why*', sub: 'Predictions that make ideas stick' },
    { src: 'raw/tryit.png', title: 'Play with *live simulators*', sub: 'Drag a slider, watch the idea move' },
    { src: 'raw/path.png', title: 'Follow one question *across fields*', sub: 'Guided paths through many subjects' },
    { src: 'raw/home.png', title: 'A fresh *pick every day*', sub: 'Streaks, XP and daily challenges' },
  ],
};
