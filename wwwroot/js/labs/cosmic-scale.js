// The exponent readout rolls through every power of ten between two scales, one notch each, pitched lower as things get bigger.
window.CosmicLab = (function () {
    var shown = null, timer = null;
    function freq(n) { return 2400 * Math.pow(2, -(n + 35) / 62 * 3.5); }
    function notch(n) { SimFx.haptic('select'); SimFx.play('tick', { freq: freq(n), gain: 0.085, decay: 0.04, key: 'cosmic-notch' }); }
    function show(n, dir) {
        var e = document.getElementById('cz-exp'), m = document.getElementById('cz-mono');
        if (e && e.firstChild) { e.firstChild.nodeValue = String(n); if (dir) SimFx.pulse(e, dir > 0 ? 'cz-roll-up' : 'cz-roll-down'); }
        if (m && m.firstChild) m.firstChild.nodeValue = (n < 0 ? '-' : '+') + String(Math.abs(n)).padStart(2, '0');
    }
    return {
        roll: function (from, to) {
            if (!window.SimFx) return;
            var cur = timer && shown !== null ? shown : from;
            clearInterval(timer); timer = null;
            if (cur === to) { shown = to; show(to, 0); return; }
            if (SimFx.reducedMotion()) { shown = to; show(to, 0); notch(to); return; }
            var dir = Math.sign(to - cur), stepMs = Math.max(18, Math.min(90, 700 / Math.abs(to - cur)));
            shown = cur; show(cur, 0);
            timer = setInterval(function () {
                shown += dir;
                show(shown, dir);
                notch(shown);
                if (shown === to) { clearInterval(timer); timer = null; }
            }, stepMs);
        }
    };
})();
