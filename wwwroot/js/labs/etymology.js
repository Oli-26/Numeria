// Etymology Tracer: the tree is traced back in time, from the modern English word up its line of ancestors to the root,
// one generation at a time; then the sister and cousin branches fan out from that line. Older nodes sound lower.
window.Etymology = (function () {
    var run = 0, GEN = 200, DRAW = 170;

    function pitch(depth) { return 240 * Math.pow(2, depth * 0.5); }

    function draw(edge, upward, ms) {
        var line = edge.querySelector('line');
        edge.classList.add('on');
        if (!line || !line.getTotalLength || !line.animate) return;
        var L = line.getTotalLength();
        line.style.strokeDasharray = L + ' ' + L;
        // A negative offset reveals the line from its far end, the child, so the stroke grows up toward the parent.
        line.animate([{ strokeDashoffset: upward ? -L : L }, { strokeDashoffset: 0 }], { duration: ms, easing: 'ease-out', fill: 'forwards' });
    }

    // Keeps the newest node in view when the tree is wider than the screen.
    function follow(wrap, g) {
        if (!wrap || wrap.scrollWidth <= wrap.clientWidth + 2) return;
        var w = wrap.getBoundingClientRect(), b = g.getBoundingClientRect(), pad = 12;
        var dx = b.left < w.left + pad ? b.left - w.left - pad : b.right > w.right - pad ? b.right - w.right + pad : 0;
        if (dx) wrap.scrollBy({ left: dx, behavior: 'smooth' });
    }

    return {
        trace: function (svg) {
            if (!svg || !svg.querySelectorAll || !window.SimFx) return;
            var token = ++run, reduced = SimFx.reducedMotion(), wrap = svg.parentElement;
            var nodes = {}, edges = {};
            [].forEach.call(svg.querySelectorAll('.etym-n'), function (g) {
                nodes[g.dataset.id] = { g: g, id: g.dataset.id, parent: g.dataset.parent || null, depth: +g.dataset.depth || 0, main: !!g.dataset.main };
                g.classList.remove('on');
            });
            [].forEach.call(svg.querySelectorAll('.etym-e'), function (e) {
                edges[e.dataset.child] = e; e.classList.remove('on');
                var l = e.querySelector('line'); if (l) { l.getAnimations && l.getAnimations().forEach(function (a) { a.cancel(); }); l.style.strokeDasharray = ''; }
            });
            var all = Object.keys(nodes).map(function (k) { return nodes[k]; });
            var main = all.filter(function (n) { return n.main; })[0] || all[all.length - 1];
            if (!main) return;

            var chain = [main], seen = {};
            seen[main.id] = 1;
            while (chain[chain.length - 1].parent && nodes[chain[chain.length - 1].parent] && !seen[chain[chain.length - 1].parent]) {
                var up = nodes[chain[chain.length - 1].parent]; seen[up.id] = 1; chain.push(up);
            }

            // The branches off the line, wave by wave outward; within a wave, older first, then left to right.
            var waves = [], frontier = chain;
            while (true) {
                var ids = frontier.map(function (n) { return n.id; });
                var next = all.filter(function (n) { return !seen[n.id] && ids.indexOf(n.parent) >= 0; });
                if (!next.length) break;
                next.sort(function (a, b) { return a.depth - b.depth || a.g.getBBox().x - b.g.getBBox().x; });
                next.forEach(function (n) { seen[n.id] = 1; });
                waves.push(next); frontier = next;
            }
            all.forEach(function (n) { if (!seen[n.id]) { seen[n.id] = 1; (waves[waves.length - 1] || (waves[0] = [])).push(n); } });

            // The trace starts at the bottom of the tree, so bring the whole tree above the bottom nav first.
            var box = (wrap || svg).getBoundingClientRect(), floor = window.innerHeight - 100;
            var dy = box.bottom > floor ? Math.min(box.bottom - floor, box.top - 64) : 0;
            if (dy > 4) window.scrollBy({ top: dy, behavior: reduced ? 'auto' : 'smooth' });
            var events = [], at = dy > 4 && !reduced ? 420 : 80;
            var pop = function (n, t, light, upward) {
                events.push({ t: t, fn: function () {
                    if (edges[n.id] && !upward) draw(edges[n.id], false, reduced ? 0 : DRAW);
                } });
                events.push({ t: t + (upward ? 0 : DRAW), fn: function () {
                    n.g.classList.add('on');
                    if (!reduced) follow(wrap, n.g);
                    var f = pitch(n.depth);
                    if (light) SimFx.play('tick', { freq: f * 1.5, gain: 0.04, decay: 0.05, key: 'et-l' + n.id });
                    else SimFx.play('pop', { from: f * 0.55, to: f, gain: 0.13, key: 'et-' + n.id });
                } });
            };

            pop(main, at, false, true);
            for (var k = 1; k < chain.length; k++) {
                var child = chain[k - 1];
                if (edges[child.id]) edges[child.id].classList.add('etym-trace');
                (function (edge, t) { events.push({ t: t, fn: function () { if (edge) draw(edge, true, reduced ? 0 : DRAW); } }); })(edges[child.id], at + (k - 1) * GEN + 60);
                pop(chain[k], at + (k - 1) * GEN + 60 + DRAW, false, true);
            }
            var rootAt = at + (chain.length - 2) * GEN + 60 + DRAW;
            if (chain.length > 1) events.push({ t: rootAt + 20, fn: function () { SimFx.play('thunk', { gain: 0.34 }); SimFx.haptic('medium'); } });

            var t = rootAt + 320;
            waves.forEach(function (wave) {
                wave.forEach(function (n, i) { pop(n, t + i * 90, true, false); });
                t += (wave.length - 1) * 90 + DRAW + 90;
            });

            if (reduced) svg.classList.add('etym-still'); else svg.classList.remove('etym-still');
            if (wrap && !reduced) wrap.scrollLeft = 0;

            events.sort(function (a, b) { return a.t - b.t; });
            if (reduced) {
                // No motion: the whole tree shows at once, and the trace is heard rather than seen.
                all.forEach(function (n) { n.g.classList.add('on'); });
                Object.keys(edges).forEach(function (k) { edges[k].classList.add('on'); });
                chain.forEach(function (n, k) { SimFx.play('pop', { from: pitch(n.depth) * 0.55, to: pitch(n.depth), gain: 0.13, delay: k * 0.2, key: 'et-' + n.id }); });
                if (chain.length > 1) { SimFx.play('thunk', { gain: 0.34, delay: (chain.length - 1) * 0.2 + 0.02 }); SimFx.haptic('medium'); }
                return;
            }
            var t0 = performance.now(), i = 0;
            (function step(now) {
                if (token !== run || !svg.isConnected) return;
                while (i < events.length && events[i].t <= now - t0) events[i++].fn();
                if (i < events.length) requestAnimationFrame(step);
            })(t0);
        },
    };
})();
