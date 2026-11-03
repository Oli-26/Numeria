// Rock ID field kit: a steel scratch and a drop of dilute acid, played over the hand specimen in its 200x140 space.
// Both return a promise that settles when the test has played out, so the page can then record the result.
(function () {
    var NS = 'http://www.w3.org/2000/svg';
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var reduced = function () { return window.SimFx && SimFx.reducedMotion(); };
    function el(tag, attrs, parent) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }
    function layer(clip) {
        var host = document.getElementById('rk-fx'); if (!host) return null;
        var svg = host.querySelector('svg') || el('svg', { viewBox: '0 0 200 140' }, host);
        return { host: host, svg: svg, on: el('g', { 'clip-path': 'url(#' + clip + ')' }, svg) };
    }
    function anim(ms, fn) {
        return new Promise(function (done) {
            if (reduced()) { fn(1); done(); return; }
            var t0 = performance.now();
            (function step(now) { var u = Math.min(1, (now - t0) / ms); fn(u); u < 1 ? requestAnimationFrame(step) : done(); })(t0);
        });
    }
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduced() ? 0 : ms); }); };
    function note(host, text) {
        Array.prototype.forEach.call(host.querySelectorAll('.rk-note'), function (n) { n.remove(); });
        var d = document.createElement('div'); d.className = 'rk-note'; d.textContent = text; host.appendChild(d);
        requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('on'); }); });
        setTimeout(function () { d.classList.remove('on'); setTimeout(function () { d.remove(); }, 400); }, 2200);
    }

    // The stroke runs across the specimen's upper face on a gentle curve.
    function along(u) {
        var x0 = 44, y0 = 46, cx = 100, cy = 50, x1 = 152, y1 = 76, v = 1 - u;
        return [v * v * x0 + 2 * v * u * cx + u * u * x1, v * v * y0 + 2 * v * u * cy + u * u * y1];
    }
    function strokeTo(u) {
        var d = '', n = Math.max(1, Math.round(u * 40));
        for (var i = 0; i <= n; i++) { var p = along(u * i / n); d += (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }
        return d;
    }

    window.RockLab = {
        scratch: async function (clip, hardness) {
            var L = layer(clip); if (!L) return;
            var soft = hardness < 5.5, lines = [];
            if (soft) {
                lines.push(el('path', { fill: 'none', stroke: 'rgba(255,255,255,.5)', 'stroke-width': 1.2, 'stroke-linecap': 'round', transform: 'translate(0 1.3)' }, L.on));
                lines.push(el('path', { fill: 'none', stroke: 'rgba(25,16,8,.75)', 'stroke-width': hardness <= 2 ? 3 : 2.2, 'stroke-linecap': 'round' }, L.on));
            } else {
                lines.push(el('path', { fill: 'none', stroke: '#b4bac0', 'stroke-width': 1.3, 'stroke-linecap': 'round', 'stroke-dasharray': '9 3 3 4', opacity: 0.9 }, L.on));
            }
            var tool = el('g', {}, L.svg);
            el('path', { d: 'M0,0 L5,-2.5 L40,-33 L35,-38 L1,-5 Z', fill: '#9aa1a8', stroke: '#596067', 'stroke-width': 0.6 }, tool);
            el('path', { d: 'M4,-3 L38,-34', stroke: '#eef1f4', 'stroke-width': 0.9, 'stroke-linecap': 'round' }, tool);
            el('rect', { x: 36, y: -50, width: 9, height: 22, rx: 2, fill: '#5b3b26', transform: 'rotate(41 40 -38)' }, tool);

            if (soft) {
                for (var i = 0; i < 8; i++) SimFx.play('click', { freq: 1600 + Math.random() * 2600, gain: 0.1 + Math.random() * 0.08, delay: 0.04 + i * 0.085 + Math.random() * 0.03, key: 'rk-scr' + i });
                SimFx.haptic('light'); setTimeout(function () { SimFx.haptic('light'); }, 320);
            } else {
                SimFx.play('tick', { freq: 2700, gain: 0.07, decay: 0.05 });
                SimFx.play('tick', { freq: 3300, gain: 0.04, decay: 0.09, delay: 0.32, key: 'rk-skate' });
                SimFx.haptic('light');
            }
            var powder = soft ? el('g', {}, L.on) : null, lastDust = 0;
            await anim(760, function (u) {
                var d = strokeTo(u), p = along(u);
                lines.forEach(function (l) { l.setAttribute('d', d); });
                tool.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')');
                if (powder && u - lastDust > 0.04) {
                    lastDust = u;
                    for (var k = 0; k < 2; k++) el('circle', { cx: (p[0] + rnd(-2.5, 2.5)).toFixed(1), cy: (p[1] + rnd(0.5, 3.5)).toFixed(1), r: rnd(0.35, 0.9).toFixed(2), fill: 'rgba(255,255,255,.65)' }, powder);
                }
            });
            note(L.host, soft ? (hardness >= 5 ? 'Just scratches' : 'Leaves a groove') : 'Too hard to scratch');
            await anim(260, function (u) { tool.setAttribute('opacity', (1 - u).toFixed(2)); });
            tool.remove();
            await wait(300);
        },

        // kind: 'strong' (calcite), 'weak' (dolomite) or 'none'.
        acid: async function (clip, kind) {
            var L = layer(clip); if (!L) return;
            var cx = 104 + rnd(-8, 8), cy = 62;
            var drop = el('path', { d: 'M0,-8 C3,-3 4.2,0 4.2,2.4 A4.2,4.2 0 0 1 -4.2,2.4 C-4.2,0 -3,-3 0,-8Z', fill: 'rgba(214,234,244,.92)', stroke: 'rgba(70,105,130,.7)', 'stroke-width': 0.6 }, L.svg);
            await anim(420, function (u) { drop.setAttribute('transform', 'translate(' + cx.toFixed(1) + ' ' + (-12 + (cy - 2 + 12) * u * u).toFixed(1) + ')'); });
            drop.remove();
            SimFx.play('pop', { from: 1100, to: 520, gain: 0.05 });

            var big = kind !== 'none', SX = kind === 'strong' ? 19 : 13, SY = kind === 'strong' ? 9.5 : 6.5;
            var spot = el('ellipse', { cx: cx, cy: cy, rx: 0, ry: 0, fill: big ? 'rgba(30,20,10,.16)' : 'rgba(220,236,246,.38)', stroke: 'rgba(255,255,255,.6)', 'stroke-width': 0.7 }, L.on);
            await anim(260, function (u) { var e = 1 - Math.pow(1 - u, 3); spot.setAttribute('rx', ((big ? SX : 5.2) * e).toFixed(2)); spot.setAttribute('ry', ((big ? SY : 3.6) * e).toFixed(2)); });

            if (kind === 'none') {
                el('ellipse', { cx: cx - 1.6, cy: cy - 1.4, rx: 1.4, ry: 0.8, fill: '#fff', opacity: 0.85 }, L.on);
                note(L.host, 'No reaction');
                await wait(900);
                return;
            }

            var strong = kind === 'strong', dur = strong ? 2.4 : 1.6, rate = strong ? 90 : 6;
            SimFx.play('fizz', { dur: dur, gain: strong ? 0.09 : 0.03, freq: strong ? 4800 : 5600 });
            SimFx.play('bubble', { n: strong ? 16 : 3, dur: dur, gain: strong ? 0.06 : 0.04 });
            SimFx.haptic('light');
            if (strong) { setTimeout(function () { SimFx.haptic('light'); }, 600); setTimeout(function () { SimFx.haptic('light'); }, 1300); }
            note(L.host, strong ? 'Fizzes' : 'Barely fizzes');

            var froth = el('g', {}, L.on), live = [];
            if (reduced()) {
                for (var i = 0; i < (strong ? 40 : 4); i++) {
                    var a = rnd(0, 6.3), k = Math.sqrt(Math.random());
                    el('circle', { cx: (cx + Math.cos(a) * SX * k).toFixed(1), cy: (cy + Math.sin(a) * SY * k).toFixed(1), r: rnd(0.6, 2).toFixed(2), fill: 'rgba(255,255,255,.4)', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 0.45 }, froth);
                }
                await wait(dur * 1000);
                return;
            }
            var acc = 0, t0 = performance.now(), last = t0;
            await new Promise(function (done) {
                (function step(now) {
                    var dt = Math.min(0.05, (now - last) / 1000), t = (now - t0) / 1000; last = now;
                    if (t < dur) acc += rate * dt * (strong ? Math.min(1, 0.3 + t) * Math.min(1, (dur - t) * 1.5) : 1);
                    while (acc >= 1) {
                        acc--;
                        var a = rnd(0, 6.3), k = Math.sqrt(Math.random()), rise = Math.random() < 0.6;
                        live.push({ x: cx + Math.cos(a) * SX * k, y: cy + Math.sin(a) * SY * k, r: rnd(0.6, strong ? 2.4 : 1.3), v: rise ? rnd(14, 34) : rnd(0, 3), age: 0, life: rise ? rnd(0.5, 0.95) : rnd(0.25, 0.6),
                                    e: el('circle', { fill: 'rgba(255,255,255,.35)', stroke: 'rgba(255,255,255,.9)', 'stroke-width': 0.45 }, froth) });
                    }
                    live = live.filter(function (b) {
                        b.age += dt;
                        if (b.age >= b.life) { b.e.remove(); return false; }
                        var u = b.age / b.life;
                        b.e.setAttribute('cx', (b.x + Math.sin(b.age * 14 + b.r) * 0.6).toFixed(1));
                        b.e.setAttribute('cy', (b.y - b.v * b.age).toFixed(1));
                        b.e.setAttribute('r', (b.r * (1 + u * 0.5)).toFixed(2));
                        b.e.setAttribute('opacity', (u > 0.8 ? (1 - u) * 5 : 1).toFixed(2));
                        return true;
                    });
                    if (t < dur || live.length) requestAnimationFrame(step); else done();
                })(t0);
            });
        },
    };
})();
