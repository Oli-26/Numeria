// Front Page Builder: the slant gauge's needle and the page going to press. Both wait until they are on screen and the
// scrolling has stopped, so a headline picked at the top of the page still prints, and swings the needle, when the
// reader scrolls down to it.
window.FrontPage = (function () {
    var LO = -7, HI = 7, waiting = [], listening = false, still = 0;

    function deg(v) { return -90 + (Math.max(LO, Math.min(HI, v)) - LO) / (HI - LO) * 180; }

    function inView(el) {
        var b = el.getBoundingClientRect(), bottom = innerHeight - 80;
        return Math.min(b.bottom, bottom) - Math.max(b.top, 0) >= Math.min(b.height, bottom) * 0.8;
    }

    function onScroll() { clearTimeout(still); still = setTimeout(check, 140); }

    function check() {
        waiting = waiting.filter(function (w) {
            if (!w.el.isConnected) return false;
            if (!inView(w.el)) return true;
            w.fn(); return false;
        });
        if (!waiting.length && listening) { removeEventListener('scroll', onScroll); listening = false; }
    }

    function whenSeen(el, fn) {
        waiting = waiting.filter(function (w) { return w.el !== el; });
        if (inView(el)) return fn();
        waiting.push({ el: el, fn: fn });
        if (!listening) { addEventListener('scroll', onScroll, { passive: true }); listening = true; }
    }

    var WET = { filter: 'blur(2.4px)', transform: 'translate(1.5px, 2px)', opacity: 0.4 };

    // Until it prints, a changed page sits blurred like wet ink.
    function wet(paper) {
        if (paper._wet || SimFx.reducedMotion()) return;
        paper._wet = paper.animate([WET, WET], { duration: 1, fill: 'forwards' });
    }

    function press(paper) {
        if (paper._wet) { paper._wet.cancel(); paper._wet = null; }
        SimFx.play('thunk', { gain: 0.34 });
        SimFx.play('click', { gain: 0.08, freq: 1800, delay: 0.05 });
        SimFx.haptic('medium');
        if (SimFx.reducedMotion()) return;
        paper.animate([WET, { filter: 'blur(0.7px)', transform: 'translate(0.4px, 0.5px)', opacity: 0.85, offset: 0.45 }, { filter: 'blur(0)', transform: 'none', opacity: 1 }],
            { duration: 420, easing: 'cubic-bezier(.25,.7,.3,1)' });
    }

    // A damped spring: louder pages (higher sensation) ring longer before the needle settles.
    function swing(arm, to, sensation) {
        var from = arm._v == null ? LO : arm._v;
        arm._v = to;
        if (arm._raf) cancelAnimationFrame(arm._raf);
        var set = function (v) { arm.setAttribute('transform', 'rotate(' + deg(v).toFixed(2) + ')'); };
        if (from === to) return;
        if (SimFx.reducedMotion()) {
            set(to);
            for (var m = 0; m < Math.abs(to - from); m++) SimFx.play('tick', { freq: 1500, gain: 0.05, decay: 0.03, delay: 0.05 * m, key: 'fp-mark' + m });
            SimFx.haptic('select');
            return;
        }
        var w = 2 * Math.PI * 1.5, z = Math.max(0.24, 0.5 - 0.03 * (sensation || 0)), wd = w * Math.sqrt(1 - z * z);
        var t0 = performance.now(), prev = from;
        arm._raf = requestAnimationFrame(function step(now) {
            var t = (now - t0) / 1000, e = Math.exp(-z * w * t);
            var v = to + (from - to) * e * (Math.cos(wd * t) + z * w / wd * Math.sin(wd * t));
            // A detent at every whole mark the needle passes, overshoots included.
            var lo = Math.min(prev, v), hi = Math.max(prev, v);
            for (var m = Math.ceil(lo); m <= Math.floor(hi); m++) {
                if (m === prev || m < LO || m > HI) continue;
                SimFx.play('tick', { freq: m === 0 ? 1100 : 1500, gain: 0.05, decay: 0.03, gap: 0.025, key: 'fp-mark' });
                SimFx.haptic('select');
            }
            prev = v;
            set(v);
            if (t < 0.25 || Math.abs(v - to) > 0.01 || Math.abs(from - to) * e > 0.01) arm._raf = requestAnimationFrame(step);
            else { set(to); arm._raf = 0; }
        });
    }

    return {
        update: function (mock, gauge, lean, sensation) {
            var paper = mock && mock.querySelector && mock.querySelector('.fp-paper');
            if (paper) { wet(paper); whenSeen(mock, function () { press(paper); }); }
            var arm = gauge && gauge.querySelector && gauge.querySelector('.fp-needle-arm');
            if (arm) whenSeen(gauge, function () { setTimeout(function () { swing(arm, lean, sensation); }, 450); });
        },
    };
})();
