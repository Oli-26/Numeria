// The event display develops like a detector readout: tracks grow from the vertex, light a hit on each tracker layer they
// cross, and leave energy in the calorimeter band where a real calorimeter would stop them (never muons or neutrinos).
window.ParticleLab = {
    develop: function (id) {
        var svg = document.getElementById(id);
        if (!svg || !window.SimFx) return;
        var ns = 'http://www.w3.org/2000/svg', hitsG = svg.querySelector('.ps-hits'), cellsG = svg.querySelector('.ps-cells') || hitsG;
        var reduce = SimFx.reducedMotion(), T0 = reduce ? 0 : 700, LAYERS = [30, 52, 74], CAL = 91;
        var stops = { Electron: 1, Photon: 1, Nucleon: 1, Meson: 1, Quark: 1, Gluon: 1, Remnant: 1, Boson: 1 };

        setTimeout(function () { SimFx.play('boom', { dur: 0.45, gain: 0.32 }); SimFx.haptic('heavy'); }, T0);

        var tracks = [].slice.call(svg.querySelectorAll('path[data-style]')).map(function (p, i) {
            var st = p.dataset.style, kind = p.dataset.kind, q = +p.dataset.q, L = p.getTotalLength();
            var hits = [], next = 0, far = { d: 0, x: 200, y: 100 };
            for (var k = 0; k <= 80; k++) {
                var pt = p.getPointAtLength(L * k / 80), d = Math.hypot(pt.x - 200, pt.y - 100);
                if (d > far.d) far = { d: d, x: pt.x, y: pt.y };
                if (st === 'Charged' && next < LAYERS.length && d >= LAYERS[next]) { hits.push({ u: k / 80, x: pt.x, y: pt.y }); next++; }
            }
            return {
                p: p, st: st, kind: kind, q: q, hits: hits, far: far, color: p.getAttribute('stroke'),
                start: T0 + 80 + i * 60, dur: st === 'Charged' ? 650 : st === 'Jet' ? 520 : st === 'Recoil' ? 260 : 600,
                shown: 0, done: false
            };
        });

        function hit(t, h) {
            var c = document.createElementNS(ns, 'circle');
            c.setAttribute('cx', h.x.toFixed(1)); c.setAttribute('cy', h.y.toFixed(1)); c.setAttribute('r', '2.4');
            c.setAttribute('fill', t.color); c.setAttribute('class', 'ps-hit');
            hitsG.appendChild(c);
        }
        function finish(t) {
            if (stops[t.kind] && t.far.d >= 70) {
                var a = Math.atan2(t.far.y - 100, t.far.x - 200), w = (t.st === 'Jet' ? 13 : 5) * Math.PI / 180;
                var x1 = 200 + CAL * Math.cos(a - w), y1 = 100 + CAL * Math.sin(a - w), x2 = 200 + CAL * Math.cos(a + w), y2 = 100 + CAL * Math.sin(a + w);
                var arc = document.createElementNS(ns, 'path');
                arc.setAttribute('d', 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + CAL + ',' + CAL + ' 0 0 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1));
                arc.setAttribute('stroke', t.color); arc.setAttribute('stroke-width', '9'); arc.setAttribute('fill', 'none'); arc.setAttribute('class', 'ps-cell');
                cellsG.appendChild(arc);
            }
            if (t.st === 'Jet') { SimFx.play('click', { gain: 0.12, key: 'ps-' + t.start }); SimFx.play('tick', { freq: 620, gain: 0.08, decay: 0.09, key: 'ps-j' + t.start }); }
            else if (t.st === 'Charged') SimFx.play('tick', { freq: t.q > 0 ? 1650 : 1250, gain: 0.08, decay: 0.05, key: 'ps-' + t.start });
            else if (t.kind === 'Photon') SimFx.play('tick', { freq: 2100, gain: 0.06, decay: 0.04, key: 'ps-' + t.start });
        }

        if (reduce) {
            tracks.forEach(function (t) {
                t.p.style.strokeDashoffset = '0'; t.p.style.opacity = '1';
                t.hits.forEach(function (h) { hit(t, h); });
                finish(t);
            });
            return;
        }
        svg.classList.add('ps-live');
        var t0 = performance.now();
        (function frame(now) {
            var ms = now - t0, live = false;
            tracks.forEach(function (t) {
                if (t.done) return;
                live = true;
                var x = Math.max(0, Math.min(1, (ms - t.start) / t.dur)), u = 1 - (1 - x) * (1 - x);
                if (t.st === 'Charged') t.p.style.strokeDashoffset = (1 - u).toFixed(4);
                else {
                    t.p.style.opacity = u.toFixed(3);
                    if (t.st === 'Jet') { t.p.style.transformOrigin = '200px 100px'; t.p.style.transform = 'scale(' + (0.15 + 0.85 * u).toFixed(3) + ')'; }
                }
                while (t.shown < t.hits.length && t.hits[t.shown].u <= u) hit(t, t.hits[t.shown++]);
                if (x >= 1) { t.done = true; finish(t); }
            });
            if (live && svg.isConnected) requestAnimationFrame(frame);
        })(t0);
    }
};
