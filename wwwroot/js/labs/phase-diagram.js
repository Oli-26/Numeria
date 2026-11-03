// Phase Diagram sample vial: particles that settle into a lattice, pool under a sloshing surface, fly free, or fill the
// vial as a supercritical fluid, easing between states as the marker crosses a boundary.
(function () {
    var N = 30, st = { c: null, kind: 'Liquid', prev: null, mix: 1, heat: 0.5, ps: [], raf: 0, last: 0, t: 0 };

    function lattice(i) {
        var cols = 5, row = Math.floor(i / cols), col = i % cols;
        return { x: 0.18 + (col + (row % 2) * 0.5) * 0.15, y: 0.9 - row * 0.1 };
    }
    function init() {
        st.ps = [];
        for (var i = 0; i < N; i++) {
            var l = lattice(i);
            st.ps.push({ x: l.x, y: l.y, vx: (Math.random() - 0.5) * 0.01, vy: (Math.random() - 0.5) * 0.01 });
        }
    }
    function liquidish(k) { return k === 'Liquid' || k === 'HeliumI' || k === 'HeliumII'; }
    function surface(x, t) { return 0.42 + Math.sin(x * 7 + t * 3.1) * 0.018 + Math.sin(x * 3 - t * 1.7) * 0.012; }

    function step(dt) {
        var k = st.kind, h = 0.35 + st.heat * 0.9, reduced = window.SimFx && SimFx.reducedMotion();
        st.ps.forEach(function (p, i) {
            if (k === 'Solid') {
                var l = lattice(i), j = 0.004 + st.heat * 0.006;
                p.vx += (l.x - p.x) * 0.18; p.vy += (l.y - p.y) * 0.18;
                p.vx *= 0.55; p.vy *= 0.55;
                if (!reduced) { p.vx += (Math.random() - 0.5) * j; p.vy += (Math.random() - 0.5) * j; }
            } else if (liquidish(k)) {
                var top = surface(p.x, st.t) + 0.04;
                p.vx += (Math.random() - 0.5) * 0.004 * h; p.vy += (Math.random() - 0.5) * 0.004 * h + 0.0012;
                if (p.y < top) p.vy += (top - p.y) * 0.25;
                p.vx *= 0.93; p.vy *= 0.93;
            } else {
                var sp = k === 'Gas' ? 0.016 * h : 0.008 * h;
                var v = Math.hypot(p.vx, p.vy) || 1e-6;
                p.vx += (p.vx / v) * (sp - v) * 0.2 + (Math.random() - 0.5) * 0.002;
                p.vy += (p.vy / v) * (sp - v) * 0.2 + (Math.random() - 0.5) * 0.002;
            }
            if (reduced && k !== 'Solid') { p.vx *= 0.2; p.vy *= 0.2; }
            p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
            if (p.x < 0.1) { p.x = 0.1; p.vx = Math.abs(p.vx); }
            if (p.x > 0.9) { p.x = 0.9; p.vx = -Math.abs(p.vx); }
            if (p.y < 0.07) { p.y = 0.07; p.vy = Math.abs(p.vy); }
            if (p.y > 0.93) { p.y = 0.93; p.vy = -Math.abs(p.vy); }
        });
    }

    function drawFill(g, k, a, W, H, vx, vy, vw, vh) {
        if (a <= 0.01) return;
        g.save(); g.globalAlpha = a;
        if (k === 'Solid') {
            g.fillStyle = 'rgba(255,255,255,0.32)';
            g.fillRect(vx, vy + vh * 0.42, vw, vh * 0.58);
            g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1;
            for (var i = 0; i < 4; i++) {
                var x = vx + vw * (0.2 + i * 0.2), y = vy + vh * (0.55 + (i % 2) * 0.15);
                g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x + 5, y); g.moveTo(x - 2.5, y - 4.3); g.lineTo(x + 2.5, y + 4.3);
                g.moveTo(x + 2.5, y - 4.3); g.lineTo(x - 2.5, y + 4.3); g.stroke();
            }
        } else if (liquidish(k)) {
            g.fillStyle = 'rgba(255,255,255,0.3)';
            g.beginPath(); g.moveTo(vx, vy + vh);
            for (var s = 0; s <= 20; s++) { var u = s / 20; g.lineTo(vx + u * vw, vy + vh * surface(u, st.t)); }
            g.lineTo(vx + vw, vy + vh); g.closePath(); g.fill();
            if (k === 'HeliumII') {
                // Superfluid helium creeps up the walls as a thin film.
                g.fillStyle = 'rgba(255,255,255,0.45)';
                g.fillRect(vx, vy + vh * 0.06, 2.2, vh * 0.4); g.fillRect(vx + vw - 2.2, vy + vh * 0.06, 2.2, vh * 0.4);
            }
        } else if (k === 'Supercritical') {
            var sh = 0.22 + Math.sin(st.t * 5) * 0.05;
            var gr = g.createLinearGradient(0, vy, 0, vy + vh);
            gr.addColorStop(0, 'rgba(255,255,255,' + (sh * 0.8).toFixed(3) + ')');
            gr.addColorStop(0.5, 'rgba(255,255,255,' + (sh + 0.08).toFixed(3) + ')');
            gr.addColorStop(1, 'rgba(255,255,255,' + (sh * 0.9).toFixed(3) + ')');
            g.fillStyle = gr; g.fillRect(vx, vy, vw, vh);
        }
        g.restore();
    }

    function frame(now) {
        var c = st.c;
        if (!c || !document.body.contains(c)) { st.c = null; st.raf = 0; return; }
        var dt = Math.min(0.05, st.last ? (now - st.last) / 1000 : 0.016); st.last = now; st.t += dt;
        st.mix = Math.min(1, st.mix + dt / 0.45);
        step(dt);
        var dpr = window.devicePixelRatio || 1, W = c.clientWidth, H = c.clientHeight;
        if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
        var g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
        var vx = 8, vy = 10, vw = W - 16, vh = H - 18;
        g.save(); g.beginPath(); g.roundRect(vx, vy, vw, vh, [3, 3, 12, 12]); g.clip();
        if (st.prev && st.mix < 1) drawFill(g, st.prev, 1 - st.mix, W, H, vx, vy, vw, vh);
        drawFill(g, st.kind, st.mix, W, H, vx, vy, vw, vh);
        if (st.kind === 'HeliumI' && !(window.SimFx && SimFx.reducedMotion())) {
            g.fillStyle = 'rgba(255,255,255,0.7)';
            for (var b = 0; b < 5; b++) {
                var u = ((st.t * 0.7 + b * 0.23) % 1), bx = vx + vw * (0.2 + 0.6 * ((b * 0.37) % 1)), by = vy + vh * (0.95 - u * 0.5);
                g.beginPath(); g.arc(bx, by, 1.6, 0, 7); g.fill();
            }
        }
        g.fillStyle = 'rgba(255,255,255,0.92)';
        st.ps.forEach(function (p) { g.beginPath(); g.arc(vx + p.x * vw, vy + p.y * vh, 2.4, 0, 7); g.fill(); });
        g.restore();
        g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.6;
        g.beginPath(); g.roundRect(vx, vy, vw, vh, [3, 3, 12, 12]); g.stroke();
        g.beginPath(); g.moveTo(vx - 4, vy); g.lineTo(vx + vw + 4, vy); g.stroke();
        st.raf = requestAnimationFrame(frame);
    }

    window.PdLab = {
        mount: function (id) {
            var c = document.getElementById(id);
            if (!c || c === st.c) return;
            st.c = c; st.last = 0;
            if (!st.ps.length) init();
            if (!st.raf) st.raf = requestAnimationFrame(frame);
        },
        set: function (kind, heat) {
            if (kind !== st.kind) { st.prev = st.kind; st.kind = kind; st.mix = 0; }
            st.heat = heat;
        },
        // Crossing a phase line: freezing cracks, boiling bubbles, sublimation hisses, anything else ticks.
        cross: function (from, to) {
            if (!window.SimFx) return;
            var o = { key: 'pd-cross', gap: 0.15 };
            if (to === 'Solid') { SimFx.play('crack', o); SimFx.haptic('medium'); }
            else if (to === 'Gas' && liquidish(from)) { SimFx.play('bubble', Object.assign({ n: 9, dur: 0.45 }, o)); SimFx.haptic('medium'); }
            else if (to === 'Gas' && from === 'Solid') { SimFx.play('fizz', Object.assign({ dur: 0.45, gain: 0.05 }, o)); SimFx.haptic('medium'); }
            else { SimFx.play('tick', Object.assign({ freq: 620, gain: 0.07, decay: 0.08 }, o)); SimFx.haptic('select'); }
        },
    };
})();
