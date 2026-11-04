// Gerrymander: the pen draws the new district lines, then the count goes district by district: each voter ticks as it
// is counted, the district takes its winner's color and its seat pops into the delegation, and then the result is called.
// In "Your map" mode a drag that starts inside a district pulls the voters it crosses into that district.
window.Gerrymander = (function () {
    var SWEEP = 560, VOTE = 48, HOLD = 170, FREQ = { b: 1046, r: 698 };
    var run = null;

    SimFx.addVoice('pen', function (ctx, out, t, o) {
        var d = o.dur || 0.5, n = ctx.createBufferSource(), b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * (d + 0.06)), ctx.sampleRate), x = b.getChannelData(0);
        for (var i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1;
        n.buffer = b;
        var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.freq || 2800; f.Q.value = 1.2;
        var g = ctx.createGain(), peak = o.gain || 0.05, m = Math.max(2, Math.round(d / 0.08));
        g.gain.setValueAtTime(0.0001, t);
        // A marker on paper: the hiss swells and dips with each short stroke.
        for (var k = 1; k <= m; k++) g.gain.linearRampToValueAtTime(peak * (k % 2 ? 1 : 0.3), t + d * k / m);
        g.gain.linearRampToValueAtTime(0.0001, t + d + 0.04);
        n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + d + 0.06);
    });

    // Undoes everything a count changed, so Blazor's own classes and attributes show again.
    function stop() {
        if (!run) return;
        run.dead = true;
        run.timers.forEach(clearTimeout);
        run.anims.forEach(function (a) { try { a.cancel(); } catch (e) { } });
        run.undo.forEach(function (f) { f(); });
        run = null;
    }

    function count(stage, results, plan) {
        stop();
        if (!stage || !results || !plan || !stage.querySelector) return;
        var svg = stage.querySelector('svg'), r = run = { dead: false, timers: [], anims: [], undo: [] };
        var cells = [], dots = [];
        [].forEach.call(svg.querySelectorAll('.gm-cell'), function (e) { cells[+e.dataset.i] = e; });
        [].forEach.call(svg.querySelectorAll('.gm-voter'), function (e) { dots[+e.dataset.i] = e; });
        var clip = svg.querySelector('.gm-sweep');
        var all = function (sel) { return [].slice.call(stage.querySelectorAll(sel)).concat([].slice.call(results.querySelectorAll(sel))); };
        var seats = all('.gm-seat').sort(function (a, b) { return a.dataset.order - b.dataset.order; });
        var tiles = all('.gm-dtile'), called = all('.gm-call');
        var ds = plan.districts || [], reduced = SimFx.reducedMotion();
        var wait = function (ms) { return new Promise(function (res) { r.timers.push(setTimeout(res, ms)); }); };
        var hold = function (el) { var a = el.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'forwards' }); r.anims.push(a); return a; };

        r.undo.push(function () {
            cells.forEach(function (c) { if (c) { c.style.fill = ''; c.style.transition = ''; } });
            dots.forEach(function (d) { if (d) d.style.opacity = ''; });
            if (clip) clip.setAttribute('width', '720');
        });
        var declare = function () {
            if (!reduced) called.forEach(function (e, k) {
                r.anims.push(e.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
                    { duration: 380, delay: k * 140, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' }));
            });
            SimFx.play('thunk', { gain: 0.42 });
            SimFx.haptic('medium');
            r.undo.forEach(function (f) { f(); });
            r.undo = [];
        };

        if (reduced) {
            ds.forEach(function (d, k) { SimFx.play('pop', { from: 300 + k * 30, to: 640 + k * 50, gain: 0.06, delay: 0.09 * k, key: 'gm-seat' + k }); });
            r.timers.push(setTimeout(declare, 90 * ds.length + 60));
            return;
        }

        cells.forEach(function (c) { c.style.transition = 'none'; c.style.fill = 'var(--bg-surface)'; });
        dots.forEach(function (d) { d.style.opacity = '0.45'; });
        var heldSeats = seats.map(hold), heldTiles = tiles.map(hold), heldCalls = called.map(hold);
        svg.getBoundingClientRect();
        cells.forEach(function (c) { c.style.transition = 'fill .28s ease-out'; });

        var lines = plan.sweep && clip ? new Promise(function (res) {
            clip.setAttribute('width', '0');
            SimFx.play('pen', { dur: SWEEP / 1000, gain: 0.05 });
            SimFx.haptic('light');
            var t0 = performance.now();
            requestAnimationFrame(function step(now) {
                if (r.dead) return;
                var u = Math.min(1, (now - t0) / SWEEP), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
                clip.setAttribute('width', (720 * e).toFixed(1));
                if (u < 1) requestAnimationFrame(step); else res();
            });
        }) : Promise.resolve();

        lines.then(async function () {
            await wait(plan.sweep ? 160 : 60);
            for (var k = 0; k < ds.length; k++) {
                if (r.dead) return;
                var d = ds[k];
                for (var j = 0; j < d.cells.length; j++) {
                    var dot = dots[d.cells[j]];
                    if (dot) {
                        dot.style.opacity = '1';
                        r.anims.push(dot.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 200, easing: 'ease-out' }));
                    }
                    SimFx.play('tick', { freq: FREQ[d.blue[j] ? 'b' : 'r'] * (1 + j * 0.04), gain: 0.045, decay: 0.05 });
                    await wait(VOTE);
                    if (r.dead) return;
                }
                d.cells.forEach(function (i) { if (cells[i]) cells[i].style.fill = ''; });
                if (heldSeats[k]) {
                    heldSeats[k].cancel();
                    r.anims.push(seats[k].animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1.35)', offset: 0.6 }, { opacity: 1, transform: 'none' }],
                        { duration: 260, easing: 'ease-out' }));
                }
                if (heldTiles[k]) {
                    heldTiles[k].cancel();
                    r.anims.push(tiles[k].animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' }));
                }
                SimFx.play('pop', { from: 300 + k * 30, to: 640 + k * 50, gain: 0.07, key: 'gm-seat' + k });
                // A packed district lands heavier: that side's surplus votes are the ones the map wastes.
                if (d.packed) SimFx.play('thunk', { gain: 0.16, delay: 0.03 });
                SimFx.haptic(d.packed ? 'medium' : 'light');
                await wait(HOLD);
            }
            if (r.dead) return;
            heldCalls.forEach(function (a) { a.cancel(); });
            declare();
        });
    }

    function attach(stage, ref) {
        if (!stage || !stage.addEventListener || stage._gm) return;
        stage._gm = true;
        var active = false, last = -1, lx = 0, ly = 0;
        var cellAt = function (x, y) {
            var el = document.elementFromPoint(x, y);
            return el && el.classList && el.classList.contains('gm-cell') ? +el.dataset.i : -1;
        };
        var over = function (i) {
            if (i < 0 || i === last) return;
            last = i;
            ref.invokeMethodAsync('StrokeOver', i).then(function (ok) {
                if (!ok) return;
                SimFx.haptic('select');
                SimFx.play('tick', { freq: 1500, gain: 0.05, decay: 0.03, gap: 0.02, key: 'gm-move' });
            }).catch(function () { });
        };
        stage.addEventListener('pointerdown', function (e) {
            if (!stage.classList.contains('gm-drawing')) return;
            var i = cellAt(e.clientX, e.clientY);
            if (i < 0) return;
            e.preventDefault();
            stop();
            active = true; last = i; lx = e.clientX; ly = e.clientY;
            try { stage.setPointerCapture(e.pointerId); } catch (x) { }
            ref.invokeMethodAsync('StrokeStart', i).catch(function () { });
            SimFx.haptic('light');
        });
        stage.addEventListener('pointermove', function (e) {
            if (!active) return;
            // Samples along the drag so a fast finger still crosses every cell in between.
            var dx = e.clientX - lx, dy = e.clientY - ly, n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 10));
            for (var s = 1; s <= n; s++) over(cellAt(lx + dx * s / n, ly + dy * s / n));
            lx = e.clientX; ly = e.clientY;
        });
        var end = function () {
            if (!active) return;
            active = false; last = -1;
            ref.invokeMethodAsync('StrokeEnd').catch(function () { });
        };
        stage.addEventListener('pointerup', end);
        stage.addEventListener('pointercancel', end);
    }

    return { attach: attach, count: count, stop: stop };
})();
