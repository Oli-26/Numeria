// Trade Route Tracer journey: the map zooms to the route, a traveler draws the line in behind it, each stop lights up
// with its role as the traveler arrives, and the map eases back out at the end. Coordinates are the map's 1000x500 space.
(function () {
    var NS = 'http://www.w3.org/2000/svg', runId = 0;
    var reduced = function () { return window.SimFx && SimFx.reducedMotion(); };
    function el(tag, attrs, parent) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }
    var ease = function (u) { return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };

    function getBox(svg) { var v = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number); return { x: v[0], y: v[1], w: v[2], h: v[3] }; }
    function setBox(svg, b) {
        svg.setAttribute('viewBox', b.x.toFixed(2) + ' ' + b.y.toFixed(2) + ' ' + b.w.toFixed(2) + ' ' + b.h.toFixed(2));
        // City names stay about 10 px on screen once zoomed in, never smaller than the map's own 9 units.
        svg.style.setProperty('--trt-fs', Math.max(9, 10.5 * b.w / (svg.clientWidth || 342)).toFixed(2) + 'px');
    }
    // The route's bounds plus room for labels, widened to the map's 2:1 shape and kept on the map.
    function fit(pts, grow) {
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        pts.forEach(function (p) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        var w = Math.max(260, (x1 - x0) + 90, ((y1 - y0) + 70) * 2) * (grow || 1);
        w = Math.min(1000, w); var h = w / 2;
        return { x: Math.max(0, Math.min(1000 - w, cx - w / 2)), y: Math.max(0, Math.min(500 - h, cy - h / 2)), w: w, h: h };
    }
    function tweenBox(svg, to, ms, alive) {
        var from = getBox(svg);
        if (reduced() || !ms) { setBox(svg, to); return Promise.resolve(); }
        var t0 = performance.now();
        return new Promise(function (done) {
            (function step(now) {
                if (!alive()) { done(); return; }
                var u = Math.min(1, (now - t0) / ms), e = ease(u), b = {};
                ['x', 'y', 'w', 'h'].forEach(function (k) { b[k] = from[k] + (to[k] - from[k]) * e; });
                setBox(svg, b);
                u < 1 ? requestAnimationFrame(step) : done();
            })(t0);
        });
    }

    function popNote(top, stop, color, svg) {
        var old = top.querySelector('.trt-pop'); if (old) old.remove();
        if (!stop.note) return;
        var b = getBox(svg), k = b.w / (svg.clientWidth || 342), fs = 10.5 * k, pad = 5 * k;
        var g = el('g', { class: 'trt-pop' }, top);
        var r = el('rect', { rx: 3 * k, fill: 'rgba(40,25,8,0.9)', stroke: color, 'stroke-width': 0.8 * k }, g);
        var t = el('text', { fill: '#fdf6e3', 'font-size': fs, 'font-family': 'serif', 'font-style': 'italic' }, g);
        t.textContent = stop.note;
        var w = t.getComputedTextLength() + pad * 2, h = fs + pad * 1.6;
        var x = stop.x + 11 * k + w <= b.x + b.w - 4 * k ? stop.x + 11 * k : stop.x - 11 * k - w;
        x = Math.max(b.x + 4 * k, x);
        var y = Math.max(b.y + 4 * k, Math.min(b.y + b.h - h - 4 * k, stop.y - h - 8 * k));
        r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', w); r.setAttribute('height', h);
        t.setAttribute('x', x + pad); t.setAttribute('y', y + h / 2 + fs * 0.34);
        if (!reduced()) { g.style.opacity = 0; requestAnimationFrame(function () { g.style.transition = 'opacity .2s ease'; g.style.opacity = 1; }); }
        setTimeout(function () { g.style.transition = 'opacity .3s ease'; g.style.opacity = 0; setTimeout(function () { g.remove(); }, 320); }, 1250);
    }

    function arrive(i, svg, top, stop, color) {
        var city = svg.querySelector('.trt-city[data-i="' + i + '"]');
        if (city) city.classList.add('trt-lit');
        SimFx.play('tick', { freq: 520 * Math.pow(2, Math.min(i, 12) * 2 / 12), gain: 0.075, decay: 0.08, key: 'trt-stop' });
        SimFx.haptic('light');
        popNote(top, stop, color, svg);
    }

    window.TradeLab = {
        // spec: { circuit, color, stops: [{ x, y, note }] }. Resolves when the journey ends or is replaced.
        play: async function (spec) {
            var my = ++runId, svg = document.getElementById('trt-map'), path = document.getElementById('trt-active');
            if (!svg || !path) return;
            var alive = function () { return my === runId && document.body.contains(svg); };
            var line = document.getElementById('trt-fx-line'), top = document.getElementById('trt-fx-top');
            line.innerHTML = ''; top.innerHTML = '';
            svg.classList.add('trt-journey');
            Array.prototype.forEach.call(svg.querySelectorAll('.trt-city'), function (c) { c.classList.remove('trt-lit'); });

            var L = path.getTotalLength(), N = Math.max(60, Math.ceil(L / 3)), pts = [];
            for (var i = 0; i <= N; i++) { var p = path.getPointAtLength(L * i / N); pts.push({ x: p.x, y: p.y }); }
            var stops = spec.stops, at = [], from = 0;
            stops.forEach(function (s, si) {
                var best = from, bd = 1e9;
                for (var j = from; j <= N; j++) { var d = Math.hypot(pts[j].x - s.x, pts[j].y - s.y); if (d < bd) { bd = d; best = j; } }
                at.push(best); from = best;
            });
            if (spec.circuit) at.push(N);

            await tweenBox(svg, fit(pts), 700, alive);
            if (!alive()) return;

            var drawn = el('polyline', { fill: 'none', stroke: spec.color, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }, line);
            var wake = [0, 1, 2].map(function (k) { return el('circle', { fill: spec.color, opacity: 0.45 - k * 0.12 }, top); });
            var dot = el('circle', { fill: spec.color, stroke: '#fdf6e3', 'stroke-width': 2.2, 'vector-effect': 'non-scaling-stroke' }, top);
            var pointsTo = function (j) { var s = ''; for (var q = 0; q <= j; q++) s += pts[q].x.toFixed(1) + ',' + pts[q].y.toFixed(1) + ' '; return s; };

            if (reduced()) {
                drawn.setAttribute('points', pointsTo(N));
                var end = pts[N], k0 = getBox(svg).w / (svg.clientWidth || 342);
                dot.setAttribute('cx', end.x); dot.setAttribute('cy', end.y); dot.setAttribute('r', 6 * k0);
                wake.forEach(function (w) { w.remove(); });
                stops.forEach(function (s, si) {
                    var city = svg.querySelector('.trt-city[data-i="' + si + '"]'); if (city) city.classList.add('trt-lit');
                    SimFx.play('tick', { freq: 520 * Math.pow(2, Math.min(si, 12) * 2 / 12), gain: 0.075, decay: 0.08, delay: si * 0.12, key: 'trt-stop' + si });
                });
                SimFx.haptic('light');
                SimFx.play('chime', { freq: 660, gain: 0.07, delay: stops.length * 0.12 + 0.1 }); SimFx.haptic('success');
                setBox(svg, fit(pts, 1.3));
                return;
            }

            // Time plan: travel at a steady pace, pausing briefly at each stop.
            var travel = Math.max(3, Math.min(5.5, L / 150)), dwell = 0.25, legs = [], t = 0;
            for (var a = 0; a < at.length; a++) {
                legs.push({ j: at[a], t: t, stop: a < stops.length ? a : -1 });
                t += dwell;
                if (a + 1 < at.length) t += travel * (at[a + 1] - at[a]) / N;
            }
            var total = t, t0 = performance.now(), lit = 0;
            var posAt = function (sec) {
                for (var q = 0; q < legs.length; q++) {
                    var lg = legs[q];
                    if (sec < lg.t + dwell || q === legs.length - 1) return lg.j;
                    var nx = legs[q + 1];
                    if (sec < nx.t) return lg.j + (nx.j - lg.j) * (sec - lg.t - dwell) / (nx.t - lg.t - dwell);
                }
                return N;
            };
            await new Promise(function (done) {
                (function step(now) {
                    if (!alive()) { done(); return; }
                    var sec = (now - t0) / 1000, j = Math.min(N, posAt(sec)), ji = Math.floor(j), f = j - ji;
                    var p = ji < N ? { x: pts[ji].x + (pts[ji + 1].x - pts[ji].x) * f, y: pts[ji].y + (pts[ji + 1].y - pts[ji].y) * f } : pts[N];
                    drawn.setAttribute('points', pointsTo(ji) + p.x.toFixed(1) + ',' + p.y.toFixed(1));
                    var k = getBox(svg).w / (svg.clientWidth || 342);
                    dot.setAttribute('cx', p.x.toFixed(1)); dot.setAttribute('cy', p.y.toFixed(1)); dot.setAttribute('r', (6.5 * k).toFixed(2));
                    wake.forEach(function (w, wi) {
                        var q = Math.max(0, ji - (wi + 1) * Math.max(2, Math.round(7 * k / (L / N))));
                        w.setAttribute('cx', pts[q].x.toFixed(1)); w.setAttribute('cy', pts[q].y.toFixed(1)); w.setAttribute('r', ((4.2 - wi * 1.1) * k).toFixed(2));
                    });
                    while (lit < stops.length && sec >= legs[lit].t) { arrive(lit, svg, top, stops[lit], spec.color); lit++; }
                    if (sec < total) requestAnimationFrame(step); else done();
                })(t0);
            });
            if (!alive()) return;
            wake.forEach(function (w) { w.remove(); });
            SimFx.play('chime', { freq: 660, gain: 0.07 });
            SimFx.haptic('success');
            await tweenBox(svg, fit(pts, 1.3), 800, alive);
        },
    };
})();
