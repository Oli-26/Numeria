// Sound Shift Sim: history played back on one big word. Rule by rule, the sounds a rule changes lift away and the new
// ones drop in; untouched sounds hold still. Each rule ticks a step lower than the last, like links in a chain shift.
window.SoundShift = (function () {
    var run = 0, STEP = 720, LEAVE = 220, DROP = 320;

    function span(text, cls) { var s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }

    function sizeFor(data) {
        var n = Math.max(data.src.length, Math.max.apply(null, data.steps.map(function (s) { return s.after.length; }).concat([0])));
        return n > 14 ? 'ss-sz-s' : n > 9 ? 'ss-sz-m' : '';
    }

    function lay(word, segs, open, close) {
        word.textContent = '';
        var o = span(open, 'ss-mark'), c = span(close, 'ss-mark');
        word.appendChild(o);
        var cells = segs.map(function (t) { var s = span(t, 'ss-sg'); word.appendChild(s); return s; });
        word.appendChild(c);
        return { cells: cells, open: o, close: c };
    }

    function live(card, n) {
        if (!card) return;
        [].forEach.call(card.querySelectorAll('.ss-rule.ss-live'), function (r) { r.classList.remove('ss-live'); });
        var r = n == null ? null : card.querySelector('.ss-rule[data-step="' + n + '"]');
        if (r) r.classList.add('ss-live');
    }

    return {
        // data: { open, close, srcOpen, srcClose, src: [...], srcLabel, label, steps: [{ n, name, before, after, cb, ca }] }
        stage: function (word, data, play) {
            if (!word || !window.SimFx) return;
            var token = ++run, reduced = SimFx.reducedMotion();
            var stage = word.closest('.ss-stage'), cap = stage && stage.querySelector('.ss-stage-cap'), card = document.querySelector('.ss-result');
            live(card, null);
            var setCap = function (t) { if (cap) cap.textContent = t; };
            word.classList.remove('ss-sz-s', 'ss-sz-m');
            if (!data || !data.src.length) { word.textContent = ''; setCap(''); return; }
            var sz = sizeFor(data); if (sz) word.classList.add(sz);
            var last = data.steps.length ? data.steps[data.steps.length - 1].after : data.src;
            if (!play) { lay(word, last, data.open, data.close); setCap(data.label); return; }

            var row = lay(word, data.src, data.srcOpen, data.srcClose), cur = row.cells;
            setCap(data.srcLabel);
            var events = [], t = 380;

            data.steps.forEach(function (st, k) {
                var freq = 1175 * Math.pow(2, -2 * k / 12), gone = [];
                events.push({ t: t, fn: function () {
                    live(card, st.n); setCap(st.name);
                    cur.forEach(function (c) { c.classList.remove('ss-new'); });
                    st.cb.forEach(function (i) {
                        var c = cur[i]; if (!c) return;
                        gone.push(c);
                        if (!reduced && c.animate) c.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-0.55em)', opacity: 0 }], { duration: LEAVE, easing: 'ease-in', fill: 'forwards' });
                    });
                    if (!st.ca.length) SimFx.play('tick', { freq: freq, gain: 0.06, decay: 0.06, key: 'ss-k' });
                } });
                events.push({ t: t + (reduced ? 0 : LEAVE), fn: function () {
                    var keep = cur.filter(function (c, i) { return st.cb.indexOf(i) < 0; });
                    var was = keep.map(function (c) { return c.getBoundingClientRect().left; });
                    gone.forEach(function (c) { c.remove(); });
                    var k2 = 0, next = st.after.map(function (txt, j) {
                        if (st.ca.indexOf(j) < 0 && k2 < keep.length) return keep[k2++];
                        return span(txt, 'ss-sg ss-new');
                    });
                    next.forEach(function (c) { row.close.parentNode.insertBefore(c, row.close); });
                    cur = next;
                    keep.forEach(function (c, i) {
                        var dx = was[i] - c.getBoundingClientRect().left;
                        if (!reduced && dx && c.animate) c.animate([{ transform: 'translateX(' + dx + 'px)' }, { transform: 'none' }], { duration: 240, easing: 'ease-out' });
                    });
                    st.ca.forEach(function (j, m) {
                        var c = next[j]; if (!c) return;
                        if (!reduced && c.animate) c.animate([{ transform: 'translateY(-0.6em)', opacity: 0 }, { transform: 'none', opacity: 1 }],
                            { duration: DROP, delay: m * 50, easing: 'cubic-bezier(.3,1.45,.6,1)', fill: 'backwards' });
                        SimFx.play('tick', { freq: freq, gain: 0.07, decay: 0.07, delay: m * 0.05, key: 'ss-k' + m });
                    });
                } });
                t += STEP;
            });

            events.push({ t: t + 80, fn: function () {
                live(card, null); setCap(data.label);
                row.open.textContent = data.open; row.close.textContent = data.close;
                SimFx.play('chime', { freq: 784, gain: 0.08 }); SimFx.haptic('success');
                if (!reduced && word.animate) word.animate([{ transform: 'scale(1.06)' }, { transform: 'none' }], { duration: 320, easing: 'ease-out' });
            } });

            var t0 = performance.now(), i = 0;
            (function step(now) {
                if (token !== run || !word.isConnected) { if (token === run) live(card, null); return; }
                while (i < events.length && events[i].t <= now - t0) events[i++].fn();
                if (i < events.length) requestAnimationFrame(step);
            })(t0);
        },
        key: function () { if (window.SimFx) { SimFx.play('click', { gain: 0.1, gap: 0.02 }); SimFx.haptic('select'); } },
    };
})();
