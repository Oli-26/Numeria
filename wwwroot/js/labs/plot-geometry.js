// Plot Geometry: the arc as a melody. A new work's curve morphs out of the last one, then a playhead walks it and each
// beat sounds a note pitched by its tension, so the climax is the highest note.
window.PlotLab = (function () {
    var MORPH = 500, TRAVEL = 2500;
    // Two octaves of the major pentatonic from middle C: any run of beats sounds like a tune.
    var SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
    function freq(t) { return 261.63 * Math.pow(2, SCALE[Math.round(Math.max(0, Math.min(100, t)) / 10)] / 12); }

    function note(t, peak, delay) {
        SimFx.play('tone', { freq: freq(t), dur: peak ? 0.75 : 0.36, gain: peak ? 0.12 : 0.085, delay: delay || 0, key: 'pg-note', gap: 0.05 });
        if (peak) SimFx.play('tone', { freq: freq(t) / 2, dur: 0.8, gain: 0.05, type: 'sine', delay: delay || 0, key: 'pg-root' });
    }

    function yAt(pts, x) {
        if (x <= pts[0].x) return pts[0].y;
        for (var i = 1; i < pts.length; i++) if (x <= pts[i].x) {
            var a = pts[i - 1], b = pts[i];
            return a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x);
        }
        return pts[pts.length - 1].y;
    }

    // Path length from the start to x, for drawing the curve behind the playhead.
    function lengthAt(pts, x) {
        var L = 0;
        for (var i = 1; i < pts.length; i++) {
            var a = pts[i - 1], b = pts[i], seg = Math.hypot(b.x - a.x, b.y - a.y);
            if (x >= b.x) { L += seg; continue; }
            if (x > a.x) L += seg * (x - a.x) / (b.x - a.x);
            break;
        }
        return L;
    }

    function setD(svg, p, d) { p.line.setAttribute('d', d); p.ghost.setAttribute('d', d); svg._wrote = d; }

    function parts(svg) {
        return {
            line: svg.querySelector('.pg-line'), ghost: svg.querySelector('.pg-ghost'),
            head: svg.querySelector('.pg-head'), dot: svg.querySelector('.pg-head-dot'),
            pts: [].slice.call(svg.querySelectorAll('.pg-pt')), labs: [].slice.call(svg.querySelectorAll('.pg-lab')),
        };
    }

    // Puts the chart back to its resting state: full curve, every point and label showing, no playhead.
    function rest(svg) {
        var p = parts(svg);
        svg._playing = false;
        if (svg._final) setD(svg, p, svg._final);
        p.line.style.strokeDasharray = '';
        p.head.style.opacity = p.dot.style.opacity = '';
        p.pts.concat(p.labs).forEach(function (e) { e.style.opacity = ''; e.style.transition = ''; });
    }

    function play(svg, pts, morph, dn) {
        if (!svg || !svg.querySelector || !pts || pts.length < 2) return;
        var gen = svg._gen = (svg._gen || 0) + 1, prev = svg._pts, dom = svg.querySelector('.pg-line').getAttribute('d');
        // If Blazor has not rewritten the path since a morph frame, the resting shape is the one already known.
        svg._final = svg._wrote && dom === svg._wrote && svg._final ? svg._final : dom;
        rest(svg);
        svg._pts = pts;
        var p = parts(svg), final = svg._final, reduced = SimFx.reducedMotion();
        var peak = pts.reduce(function (m, q, i) { return q.t > pts[m].t ? i : m; }, 0);
        var card = svg.parentNode && svg.parentNode.querySelector('.pg-beat');
        var alive = function () { return svg._gen === gen && svg.isConnected; };
        svg._playing = true;

        var reach = function (i) {
            note(pts[i].t, i === peak);
            SimFx.haptic(i === peak ? 'medium' : 'light');
            if (!reduced) {
                var c = p.pts[i], l = p.labs[i];
                if (c) { c.style.opacity = ''; c.animate([{ transform: 'scale(.2)' }, { transform: i === peak ? 'scale(2)' : 'scale(1.6)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: i === peak ? 420 : 300, easing: 'ease-out' }); }
                if (l) { l.style.transition = 'opacity .25s'; l.style.opacity = ''; }
            }
            if (dn) dn.invokeMethodAsync('FollowBeat', i).then(function () {
                if (card && !reduced && alive()) card.animate([{ opacity: 0.35, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' });
            }).catch(function () { });
        };

        if (reduced) {
            var gap = TRAVEL / (pts.length - 1);
            pts.forEach(function (q, i) { setTimeout(function () { if (alive()) reach(i); if (i === pts.length - 1) svg._playing = false; }, i * gap); });
            return;
        }

        p.pts.concat(p.labs).forEach(function (e) { e.style.transition = 'none'; e.style.opacity = '0'; });

        var travel = function () {
            if (!alive()) return;
            var total = lengthAt(pts, pts[pts.length - 1].x) + 1, next = 0, x0 = pts[0].x, x1 = pts[pts.length - 1].x, t0 = performance.now();
            p.line.style.strokeDasharray = '0 ' + total;
            p.head.style.opacity = '0.8'; p.dot.style.opacity = '1';
            requestAnimationFrame(function step(now) {
                if (!alive()) return;
                var u = Math.min(1, (now - t0) / TRAVEL), x = x0 + (x1 - x0) * u;
                p.line.style.strokeDasharray = lengthAt(pts, x).toFixed(1) + ' ' + total;
                p.head.setAttribute('transform', 'translate(' + x.toFixed(1) + ' 0)');
                p.dot.setAttribute('cx', x.toFixed(1)); p.dot.setAttribute('cy', yAt(pts, x).toFixed(1));
                while (next < pts.length && x >= pts[next].x - 0.01) reach(next++);
                if (u < 1) return requestAnimationFrame(step);
                setTimeout(function () { if (alive()) rest(svg); }, 450);
            });
        };

        if (!morph || !prev || prev.length < 2) return void setTimeout(travel, 120);
        // Sample both curves on the union of their beat positions plus a grid, so neither loses a corner mid-morph.
        var xs = pts.concat(prev).map(function (q) { return q.x; });
        for (var g = 0; g <= 40; g++) xs.push(20 + g * 8);
        xs = xs.map(function (x) { return Math.round(x * 100) / 100; }).sort(function (a, b) { return a - b; }).filter(function (x, i, a) { return i === 0 || x !== a[i - 1]; });
        var ya = xs.map(function (x) { return yAt(prev, x); }), yb = xs.map(function (x) { return yAt(pts, x); }), m0 = performance.now();
        requestAnimationFrame(function step(now) {
            if (!alive()) return;
            var u = Math.min(1, (now - m0) / MORPH), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
            var d = xs.map(function (x, i) { return (i ? 'L' : 'M') + x.toFixed(1) + ',' + (ya[i] + (yb[i] - ya[i]) * e).toFixed(1); }).join(' ');
            setD(svg, p, d);
            if (u < 1) return requestAnimationFrame(step);
            setD(svg, p, final);
            setTimeout(travel, 140);
        });
    }

    return {
        attach: function (svg, pts) {
            if (!svg || !svg.addEventListener || svg._pg) return;
            svg._pg = true; svg._pts = pts;
            // A tap stops the playback where it is and plays the tapped beat's own note.
            svg.addEventListener('pointerdown', function (e) {
                var c = e.target.closest && e.target.closest('.pg-pt');
                if (!c) return;
                if (svg._playing) { svg._gen++; rest(svg); }
                note(+c.dataset.t, c.dataset.peak === '1');
                SimFx.haptic(c.dataset.peak === '1' ? 'medium' : 'light');
            });
        },
        play: play,
    };
})();
