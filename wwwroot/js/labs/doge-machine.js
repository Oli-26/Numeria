// Doge Machine: replays one election round by round. A lot draws its names one ball at a time out of the urn; a vote
// shows who controlled it, then fills its group in one sweep. The doge comes last, with the bell.
window.DogeMachine = (function () {
    var run = null;

    // A wooden ball knocking out of the urn: a damped click with a short hollow body under it.
    SimFx.addVoice('ball', function (ctx, out, t, o) {
        var f0 = o.freq || 620, peak = o.gain || 0.1, d = 0.06;
        var n = ctx.createBufferSource(), b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * d), ctx.sampleRate), x = b.getChannelData(0);
        for (var i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / x.length, 5);
        n.buffer = b;
        var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f0 * 2.6; bp.Q.value = 2.2;
        var ng = ctx.createGain(); ng.gain.value = peak;
        n.connect(bp); bp.connect(ng); ng.connect(out); n.start(t); n.stop(t + d);
        var s = ctx.createOscillator(), g = ctx.createGain();
        s.type = 'sine';
        s.frequency.setValueAtTime(f0, t); s.frequency.exponentialRampToValueAtTime(f0 * 0.8, t + 0.07);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak * 0.9, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
        s.connect(g); g.connect(out); s.start(t); s.stop(t + 0.12);
    });

    // Undoes everything a replay changed, so Blazor's own classes and attributes show again.
    function stop() {
        if (!run) return;
        run.dead = true;
        run.timers.forEach(clearTimeout);
        run.anims.forEach(function (a) { try { a.cancel(); } catch (e) { } });
        run = null;
    }

    function play(stage, plan) {
        stop();
        if (!stage || !plan || !stage.querySelector) return;
        var r = run = { dead: false, timers: [], anims: [] }, reduced = SimFx.reducedMotion();
        var rows = [].slice.call(stage.querySelectorAll('.dg-row:not(.dg-final)')), doge = stage.querySelector('.dg-doge');
        var medal = doge && doge.querySelector('.dg-medal'), calls = [].slice.call(stage.querySelectorAll('.dg-call'));
        var wait = function (ms) { return new Promise(function (res) { r.timers.push(setTimeout(res, ms)); }); };
        var hold = function (el) { var a = el.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'forwards' }); r.anims.push(a); return a; };
        var show = function (held, el, frames, ms) { held.cancel(); r.anims.push(el.animate(frames, { duration: ms, easing: 'ease-out' })); };
        var fade = [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }];
        var bell = function () {
            SimFx.play('chime', { freq: 392, gain: 0.09 });
            SimFx.play('thunk', { gain: 0.3 });
            SimFx.haptic('medium');
        };

        if (reduced) { bell(); return; }

        var parts = rows.map(function (row) {
            return {
                row: row,
                dots: [].slice.call(row.querySelectorAll('.dg-dot')).map(function (d) { return { el: d, held: hold(d) }; }),
                verdict: row.querySelector('.dg-verdict'), count: row.querySelector('.dg-count'),
            };
        });
        parts.forEach(function (p) {
            if (p.verdict) p.vHeld = hold(p.verdict);
            if (p.count) p.cHeld = hold(p.count);
        });
        var medalHeld = medal && hold(medal), callsHeld = calls.map(hold);
        // Keeps the round being drawn on screen, clear of the bottom nav.
        var focus = function (el) {
            var b = el.getBoundingClientRect(), vh = window.innerHeight;
            if (b.top < 70) window.scrollBy({ top: b.top - 90, behavior: 'smooth' });
            else if (b.bottom > vh - 110) window.scrollBy({ top: b.bottom - (vh - 130), behavior: 'smooth' });
        };

        (async function () {
            for (var i = 0; i < plan.rounds.length; i++) {
                if (r.dead) return;
                var round = plan.rounds[i], p = parts[i];
                focus(p.row);
                r.anims.push(p.row.animate([{ backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)' }, { backgroundColor: 'transparent' }],
                    { duration: 900, easing: 'ease-out' }));
                if (round.kind === 'lot') {
                    // The bigger the group, the faster the boy draws, so every lot takes about the same time.
                    var step = Math.max(28, Math.min(85, 720 / p.dots.length));
                    for (var k = 0; k < p.dots.length; k++) {
                        if (r.dead) return;
                        var mine = round.members[k];
                        show(p.dots[k].held, p.dots[k].el, [{ opacity: 0, transform: 'translateY(-6px) scale(.4)' }, { opacity: 1, transform: 'scale(1.3)', offset: .6 }, { opacity: 1, transform: 'none' }], 200);
                        SimFx.play('ball', { freq: mine ? 760 : 560, gain: 0.09 });
                        if (k % 3 === 0) SimFx.haptic('select');
                        await wait(step);
                    }
                } else {
                    await wait(220);
                    if (r.dead) return;
                    if (p.vHeld) show(p.vHeld, p.verdict, fade, 260);
                    var all = round.rule === 'faction' || round.rule === 'rivals';
                    SimFx.play('tick', { freq: round.rule === 'faction' ? 988 : round.rule === 'rivals' ? 523 : 740, gain: 0.08, decay: 0.12 });
                    SimFx.haptic(all ? 'medium' : 'light');
                    await wait(280);
                    for (var j = 0; j < p.dots.length; j++) {
                        if (r.dead) return;
                        show(p.dots[j].held, p.dots[j].el, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'none' }], 160);
                        if (j % 4 === 0) SimFx.play('tick', { freq: round.members[j] ? 1320 : 990, gain: 0.03, decay: 0.03 });
                        await wait(9);
                    }
                }
                if (p.cHeld) show(p.cHeld, p.count, fade, 220);
                SimFx.play('pop', { from: 300 + i * 40, to: 700 + i * 60, gain: 0.05, key: 'dg-row' + i });
                await wait(190);
            }
            if (r.dead) return;
            if (doge) focus(doge);
            await wait(420);
            if (r.dead) return;
            if (medalHeld) show(medalHeld, medal, [{ opacity: 0, transform: 'scale(.3) rotate(-20deg)' }, { opacity: 1, transform: 'scale(1.15)', offset: .65 }, { opacity: 1, transform: 'none' }], 520);
            bell();
            callsHeld.forEach(function (a, k) { a.cancel(); r.anims.push(calls[k].animate(fade, { duration: 380, delay: 160 + k * 140, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' })); });
            run = null;
        })();
    }

    return { play: play, stop: stop };
})();
