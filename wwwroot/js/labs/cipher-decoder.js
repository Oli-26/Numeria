// Cipher Decoder: the decryption roll. Each letter turns like a cipher wheel from its cipher letter to the plain one,
// left to right; a layered puzzle stops on the middle layer before the second turn. Pigpen glyphs flip over into letters.
window.CipherDecoder = (function () {
    var run = 0, STAGGER = 70, STEP = 42, MAXSTEPS = 8;
    var A = 65;
    function isLetter(c) { return c >= 'A' && c <= 'Z'; }

    // Shortest way round the wheel, at most MAXSTEPS visible stops.
    function path(from, to) {
        var a = from.charCodeAt(0) - A, b = to.charCodeAt(0) - A, d = ((b - a) % 26 + 26) % 26;
        if (d > 13) d -= 26;
        var n = Math.min(Math.abs(d), MAXSTEPS), out = [];
        for (var k = 1; k <= n; k++) out.push(String.fromCharCode(A + ((a + Math.round(k * d / n)) % 26 + 26) % 26));
        return out;
    }

    function cell(ch) {
        var s = document.createElement('span');
        s.className = 'cd-l'; s.textContent = ch;
        return s;
    }

    // Lays the line out as words of letter cells, so it wraps between words only.
    function build(el, text) {
        el.textContent = '';
        var cells = [], word = null;
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (ch === ' ') { word = null; el.appendChild(document.createTextNode(' ')); cells.push(null); continue; }
            if (!word) { word = document.createElement('span'); word.className = 'cd-w'; el.appendChild(word); }
            var c = cell(ch); word.appendChild(c); cells.push(c);
        }
        return cells;
    }

    function schedule(events, token, done) {
        events.sort(function (a, b) { return a.t - b.t; });
        var t0 = performance.now(), i = 0;
        (function step(now) {
            if (token !== run) return;
            var t = now - t0;
            while (i < events.length && events[i].t <= t) events[i++].fn();
            if (i < events.length) requestAnimationFrame(step); else if (done) done();
        })(t0);
    }

    function nudge(c) {
        if (c.animate) c.animate([{ transform: 'translateY(-38%)', opacity: 0.35 }, { transform: 'none', opacity: 1 }], { duration: STEP, easing: 'ease-out' });
    }

    function land(c, cls) {
        c.classList.remove('cd-mid', 'cd-plain'); c.classList.add(cls);
        if (c.animate && !SimFx.reducedMotion()) c.animate([{ transform: 'scale(1.28)' }, { transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.3,1.6,.6,1)' });
    }

    // One pass of the wheel over every letter: from layer `from` to layer `to`, starting at `at` ms. Returns its end time.
    function pass(events, cells, from, to, at, final, letters) {
        var li = 0, end = at;
        cells.forEach(function (c, i) {
            if (!c || !isLetter(to[i])) return;
            var start = at + li * STAGGER, stops = from[i] === to[i] ? [] : path(from[i], to[i]);
            var freq = (final ? 523 : 330) * Math.pow(2, li / Math.max(1, letters - 1));
            stops.forEach(function (ch, k) {
                events.push({ t: start + k * STEP, fn: function () { c.textContent = ch; nudge(c); SimFx.play('click', { gain: 0.07, freq: 4200, gap: 0.028, key: 'cd-roll' }); } });
            });
            var t = start + stops.length * STEP;
            events.push({ t: t, fn: function () { c.textContent = to[i]; land(c, final ? 'cd-plain' : 'cd-mid'); SimFx.play('tick', { freq: freq, gain: final ? 0.07 : 0.05, decay: 0.07, key: 'cd-land' + li }); } });
            end = Math.max(end, t);
            li++;
        });
        return end;
    }

    function finish(events, t) {
        events.push({ t: t + 120, fn: function () { SimFx.play('chime', { freq: 784, gain: 0.08 }); SimFx.haptic('success'); } });
    }

    return {
        // layers: [ciphertext, middle?, plaintext] as upper-case strings of equal length.
        decode: function (el, layers) {
            if (!el || !window.SimFx) return;
            var token = ++run, reduced = SimFx.reducedMotion(), events = [];
            var letters = layers[0].replace(/[^A-Z]/g, '').length;
            var cells = build(el, layers[0]);
            el.classList.add('cd-rolled');
            if (reduced) {
                build(el, layers[layers.length - 1]).forEach(function (c) { if (c) c.classList.add('cd-plain'); });
                for (var li = 0; li < letters; li++) SimFx.play('tick', { freq: 523 * Math.pow(2, li / Math.max(1, letters - 1)), gain: 0.06, decay: 0.07, delay: li * 0.05, key: 'cd-land' + li });
                SimFx.play('chime', { freq: 784, gain: 0.08, delay: letters * 0.05 + 0.1 }); SimFx.haptic('success');
                return;
            }
            var t = 120;
            for (var k = 1; k < layers.length; k++) {
                var final = k === layers.length - 1;
                t = pass(events, cells, layers[k - 1], layers[k], t, final, letters);
                if (!final) t += 360;
            }
            finish(events, t);
            schedule(events, token);
        },
        // Pigpen has no letters to roll from, so each glyph flips over and comes back as its letter.
        flip: function (el, plain) {
            if (!el || !window.SimFx) return;
            var token = ++run, reduced = SimFx.reducedMotion(), events = [];
            var glyphs = [].slice.call(el.querySelectorAll('.cd-glyph')), letters = plain.replace(/[^A-Z]/g, '').split('');
            el.classList.add('cd-rolled');
            letters.forEach(function (ch, i) {
                var g = glyphs[i]; if (!g) return;
                var freq = 523 * Math.pow(2, i / Math.max(1, letters.length - 1));
                var swap = function () { g.innerHTML = ''; var c = cell(ch); g.appendChild(c); c.classList.add('cd-plain'); };
                if (reduced) { swap(); SimFx.play('tick', { freq: freq, gain: 0.06, decay: 0.07, delay: i * 0.05, key: 'cd-land' + i }); return; }
                var t = 120 + i * (STAGGER + 40);
                events.push({ t: t, fn: function () {
                    SimFx.play('click', { gain: 0.08, freq: 3600, key: 'cd-roll' });
                    if (g.animate) g.animate([{ transform: 'none' }, { transform: 'rotateX(90deg)' }], { duration: 110, easing: 'ease-in' });
                } });
                events.push({ t: t + 110, fn: function () {
                    swap();
                    if (g.animate) g.animate([{ transform: 'rotateX(-90deg)' }, { transform: 'none' }], { duration: 150, easing: 'ease-out' });
                    SimFx.play('tick', { freq: freq, gain: 0.07, decay: 0.07, key: 'cd-land' + i });
                } });
            });
            if (reduced) { SimFx.play('chime', { freq: 784, gain: 0.08, delay: letters.length * 0.05 + 0.1 }); SimFx.haptic('success'); return; }
            finish(events, 120 + letters.length * (STAGGER + 40) + 150);
            schedule(events, token);
        },
        solvedAgain: function () { SimFx.play('chime', { freq: 784, gain: 0.08 }); SimFx.haptic('success'); },
        wrong: function (input) {
            if (!window.SimFx) return;
            SimFx.play('thunk', { gain: 0.32 }); SimFx.haptic('error');
            if (input) { input.classList.remove('cd-flash'); void input.offsetWidth; input.classList.add('cd-flash'); }
        },
        cancel: function () { run++; },
    };
})();
