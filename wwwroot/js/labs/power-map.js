// Power Map: the election-night count. Ballots are counted left to right across the voter histogram while the tallies
// climb, runoff rounds hand an eliminated candidate's voters to their next choice, seats fill in D'Hondt order, and then
// the winner is called.
window.PowerMap = (function () {
    var SWEEP = 1200, ROUND = 600, SEAT = 95, NEUTRAL = 'var(--text-muted)';
    var run = null;

    // Undoes everything a count changed, so Blazor's own attributes show again.
    function stop() {
        if (!run) return;
        run.dead = true;
        run.timers.forEach(clearTimeout);
        run.anims.forEach(function (a) { try { a.cancel(); } catch (e) { } });
        run.undo.forEach(function (f) { f(); });
        run = null;
    }

    function pct(v) { return Math.round(v * 1000) / 10 + '%'; }

    function count(stage, results, plan) {
        stop();
        if (!stage || !results || !plan || !stage.querySelector) return;
        var svg = stage.querySelector('svg'), r = run = { dead: false, timers: [], anims: [], undo: [] };
        var bins = [].slice.call(svg.querySelectorAll('.pm-bin')), cands = svg.querySelectorAll('.pm-cand');
        var front = svg.querySelector('.pm-front'), label = svg.querySelector('.pm-round');
        var rows = [].slice.call(results.querySelectorAll('.pm-bar-row'));
        var fills = rows.map(function (x) { return x.querySelector('.pm-bar-fill'); });
        var texts = rows.map(function (x) { var s = x.querySelector('.pm-pct'); return s && s.firstChild; });
        var seats = [].slice.call(results.querySelectorAll('.pm-seat')).sort(function (a, b) { return a.dataset.order - b.dataset.order; });
        var called = [results.querySelector('.pm-winner'), results.querySelector('.pm-detail')].filter(Boolean);
        var widths = fills.map(function (f) { return f.style.width; }), words = texts.map(function (t) { return t ? t.nodeValue : ''; });
        var N = bins.length, nc = rows.length, rounds = plan.rounds || [], reduced = SimFx.reducedMotion();
        if (N !== plan.hist.length) { run = null; return; }

        var cum = [], tal = [], acc = 0, sums = new Array(nc).fill(0);
        for (var i = 0; i < N; i++) {
            acc += plan.hist[i]; cum.push(acc);
            for (var c = 0; c < nc; c++) sums[c] += plan.contrib[i][c] || 0;
            tal.push(sums.slice());
        }
        var cur = plan.colors.slice();

        r.undo.push(function () {
            bins.forEach(function (b) { b.style.transition = b.style.fill = b.style.opacity = ''; });
            [].forEach.call(cands, function (g) { g.style.transition = g.style.opacity = ''; });
            if (label) label.textContent = '';
        });
        var settle = function () {
            fills.forEach(function (f, k) { f.style.transition = ''; f.style.width = widths[k]; });
            texts.forEach(function (t, k) { if (t) t.nodeValue = words[k]; });
            called.forEach(function (e) { e.style.opacity = ''; });
            if (front) { front.style.opacity = ''; front.removeAttribute('transform'); }
        };
        r.undo.push(settle);
        var wait = function (ms) { return new Promise(function (res) { r.timers.push(setTimeout(res, ms)); }); };
        var declare = function () {
            settle();
            if (!reduced) called.forEach(function (e, k) {
                r.anims.push(e.animate([{ opacity: 0, transform: 'translateX(-14px)' }, { opacity: 1, transform: 'none' }],
                    { duration: 360, delay: k * 120, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' }));
            });
            SimFx.play('thunk', { gain: 0.42 });
            SimFx.haptic('medium');
            // Runoff results stay on the histogram until the next change; everything else hands back to Blazor's colors.
            if (!rounds.length) { r.undo.forEach(function (f) { f(); }); r.undo = []; }
        };

        if (reduced) {
            rounds.forEach(function (rd, k) {
                bins.forEach(function (b, i) { if (rd.colors[i] && rd.colors[i] !== cur[i]) { b.style.fill = rd.colors[i]; cur[i] = rd.colors[i]; } });
                if (cands[rd.cand]) cands[rd.cand].style.opacity = '0.35';
                SimFx.play('click', { gain: 0.14, delay: 0.25 * k });
            });
            if (rounds.length && label) label.textContent = plan.final || '';
            seats.forEach(function (s, j) { SimFx.play('pop', { from: 300 + j * 25, to: 640 + j * 40, gain: 0.06, delay: 0.08 * j, key: 'pm-seat' + j }); });
            r.timers.push(setTimeout(declare, 250 * rounds.length + 80 * seats.length));
            return;
        }

        bins.forEach(function (b) { b.style.transition = 'none'; b.style.fill = NEUTRAL; b.style.opacity = '0.22'; });
        fills.forEach(function (f) { f.style.transition = 'width 0.12s linear'; f.style.width = '0%'; });
        texts.forEach(function (t) { if (t) t.nodeValue = '0%'; });
        called.forEach(function (e) { e.style.opacity = '0'; });
        var held = seats.map(function (s) { var a = s.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'forwards' }); r.anims.push(a); return a; });
        svg.getBoundingClientRect();
        bins.forEach(function (b) { b.style.transition = 'fill .16s ease-out, opacity .16s ease-out'; });
        if (front) front.style.opacity = '0.7';

        var t0 = performance.now(), done = 0, mark = 0.05;
        new Promise(function (res) {
            requestAnimationFrame(function step(now) {
                if (r.dead) return;
                var u = Math.min(1, (now - t0) / SWEEP), k = Math.min(N, Math.floor(u * N + 0.5));
                for (; done < k; done++) { bins[done].style.fill = cur[done]; bins[done].style.opacity = '0.55'; }
                if (front) front.setAttribute('transform', 'translate(' + (20 + 280 * u).toFixed(1) + ' 0)');
                var frac = done ? cum[done - 1] / plan.total : 0;
                // A tick for every 5% of ballots counted: sparse at the fringes, a rattle through the crowded middle.
                for (; mark <= frac + 1e-9 && mark < 1.001; mark += 0.05) SimFx.play('tick', { freq: 720 + 520 * mark, gain: 0.05, decay: 0.04, gap: 0.03 });
                fills.forEach(function (f, c) {
                    var v = done ? tal[done - 1][c] : 0;
                    f.style.width = (v * 100).toFixed(2) + '%';
                    if (texts[c]) texts[c].nodeValue = pct(v);
                });
                if (u < 1) requestAnimationFrame(step); else res();
            });
        }).then(async function () {
            if (front) front.style.opacity = '0';
            await wait(180);
            for (var k = 0; k < rounds.length; k++) {
                if (r.dead) return;
                var rd = rounds[k], moved = [];
                bins.forEach(function (b, i) { if (rd.colors[i] && rd.colors[i] !== cur[i]) moved.push(i); });
                if (label) label.textContent = rd.label;
                SimFx.play('click', { gain: 0.15 });
                SimFx.haptic('light');
                moved.forEach(function (i) { bins[i].style.opacity = '0.08'; });
                if (cands[rd.cand]) { cands[rd.cand].style.transition = 'opacity .25s'; cands[rd.cand].style.opacity = '0.3'; }
                await wait(ROUND * 0.42);
                if (r.dead) return;
                // The eliminated candidate's voters reappear in the color of their next choice, nearest first.
                moved.forEach(function (i, j) {
                    bins[i].style.transitionDelay = (j * 0.02) + 's';
                    bins[i].style.fill = rd.colors[i]; bins[i].style.opacity = '0.55'; cur[i] = rd.colors[i];
                });
                SimFx.play('tick', { freq: 520, gain: 0.05, decay: 0.08, delay: 0.05 });
                await wait(ROUND * 0.58);
                moved.forEach(function (i) { bins[i].style.transitionDelay = ''; });
            }
            if (r.dead) return;
            if (rounds.length && label) label.textContent = plan.final || '';
            if (seats.length) {
                seats.forEach(function (s, j) {
                    held[j].cancel();
                    r.anims.push(s.animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1.3)', offset: 0.6 }, { opacity: 1, transform: 'none' }],
                        { duration: 260, delay: j * SEAT, easing: 'ease-out', fill: 'backwards' }));
                    SimFx.play('pop', { from: 300 + j * 25, to: 640 + j * 40, gain: 0.06, delay: j * SEAT / 1000 + 0.06, key: 'pm-seat' + j });
                });
                await wait(seats.length * SEAT + 220);
                if (r.dead) return;
            }
            declare();
        });
    }

    return {
        attach: function (stage) {
            if (!stage || !stage.addEventListener || stage._pm) return;
            stage._pm = true;
            stage.addEventListener('input', function (e) {
                if (e.target.type !== 'range') return;
                stop();
                SimFx.detent('pm-pos', Math.round(+e.target.value * 100), 10, 1500);
            });
        },
        count: count,
    };
})();
