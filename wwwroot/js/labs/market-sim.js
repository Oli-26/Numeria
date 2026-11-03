// Market Sim: tweened readouts (elements carry their target text in data-tw), slider detents, and the deadweight drain.
window.MarketLab = {
    attach: function (root) {
        if (!root || !root.querySelectorAll || root._msObs) return;
        var set = function (el, tween) {
            var target = el.getAttribute('data-tw') || '', m = /^(\D*?)(-?[\d,]*\.?\d+)(.*)$/.exec(target);
            if (el._raf) cancelAnimationFrame(el._raf);
            if (!m) { el.textContent = target; el._v = null; return; }
            var to = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, group = m[2].indexOf(',') >= 0 || to >= 1000;
            var fmt = function (x) { return m[1] + (group ? x.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : x.toFixed(dec)) + m[3]; };
            var from = el._v;
            el._v = to;
            if (!tween || from == null || from === to || SimFx.reducedMotion()) { el.textContent = target; return; }
            var t0 = performance.now();
            (function step(now) {
                var u = Math.min(1, (now - t0) / 380), e = 1 - Math.pow(1 - u, 3);
                el.textContent = u < 1 ? fmt(from + (to - from) * e) : target;
                if (u < 1) el._raf = requestAnimationFrame(step);
            })(t0);
        };
        root.querySelectorAll('[data-tw]').forEach(function (el) { set(el, false); });
        root._msObs = new MutationObserver(function (muts) {
            muts.forEach(function (mu) {
                if (mu.type === 'attributes') set(mu.target, true);
                else mu.addedNodes.forEach(function (n) {
                    if (n.nodeType !== 1) return;
                    if (n.hasAttribute('data-tw')) set(n, false);
                    n.querySelectorAll('[data-tw]').forEach(function (e) { set(e, false); });
                });
            });
        });
        root._msObs.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-tw'] });
        root.addEventListener('input', function (e) {
            var t = e.target;
            if (t.type !== 'range') return;
            var step = +t.step || 1, k = Math.max(1, Math.round((+t.max - +t.min) / step / 14));
            SimFx.detent('ms-' + t.id, +t.value, step * k, 1500);
        });
    },
    // Falling ticks, one per column of lost trades, outermost first; then a soft click as the loss is drawn in.
    drain: function (n) {
        for (var j = 0; j < n; j++) SimFx.play('tick', { freq: 980 - j * 35, gain: 0.045, decay: 0.05, delay: 0.2 + 0.07 * j, key: 'ms-d' + j });
        SimFx.play('click', { gain: 0.1, delay: 0.2 + 0.07 * n + 0.5 });
        SimFx.haptic('light');
    },
};
