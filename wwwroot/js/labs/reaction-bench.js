// Reaction Bench vessel: each reaction plays out over a couple of seconds with what you would actually see, then idles.
// Scenes are drawn in a 280x170 space; spec comes from ReactionBenchPage (scene, metal, fuel, color, vigor, haze).
(function () {
    var W = 280, H = 170, run = null;
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var ease = function (x) { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); };
    var WATER = 'rgba(140,185,230,0.30)';
    // Vessel scenes are drawn a little larger than their layout space so the glassware fills the stage.
    function zoom(g) { g.translate(140, 92); g.scale(1.2, 1.2); g.translate(-140, -92); }
    function ink(c, name, fb) { var v = getComputedStyle(c).getPropertyValue(name).trim(); return v || fb; }

    function beaker(g, r, top) {
        var x = 90, y = 34, w = 100, h = 118;
        if (top !== undefined) {
            g.fillStyle = r.liquid || WATER;
            g.beginPath(); g.moveTo(x + 1, top); g.lineTo(x + w - 1, top); g.lineTo(x + w - 1, y + h - 8);
            g.quadraticCurveTo(x + w - 1, y + h - 1, x + w - 8, y + h - 1); g.lineTo(x + 8, y + h - 1);
            g.quadraticCurveTo(x + 1, y + h - 1, x + 1, y + h - 8); g.closePath(); g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 1;
            g.beginPath(); g.moveTo(x + 2, top); g.lineTo(x + w - 2, top); g.stroke();
        }
        g.strokeStyle = r.glass; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x, y + 4); g.lineTo(x, y + h - 8); g.quadraticCurveTo(x, y + h, x + 8, y + h);
        g.lineTo(x + w - 8, y + h); g.quadraticCurveTo(x + w, y + h, x + w, y + h - 8); g.lineTo(x + w, y + 4); g.lineTo(x + w + 4, y); g.stroke();
        g.globalAlpha = 0.35; g.lineWidth = 1;
        for (var k = 1; k <= 3; k++) { g.beginPath(); g.moveTo(x + w - 14, y + h - k * 26); g.lineTo(x + w - 4, y + h - k * 26); g.stroke(); }
        g.globalAlpha = 1;
    }
    function flame(g, x, y, h, wdt, outer, inner, t) {
        if (h <= 0.5) return;
        var f = 1 + Math.sin(t * 23) * 0.06 + Math.sin(t * 37) * 0.04, hh = h * f, sway = Math.sin(t * 9) * 1.5;
        var grd = g.createLinearGradient(0, y, 0, y - hh);
        grd.addColorStop(0, outer); grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.beginPath(); g.moveTo(x - wdt, y); g.quadraticCurveTo(x - wdt * 1.1, y - hh * 0.5, x + sway, y - hh); g.quadraticCurveTo(x + wdt * 1.1, y - hh * 0.5, x + wdt, y); g.closePath(); g.fill();
        if (inner) {
            g.fillStyle = inner;
            g.beginPath(); g.moveTo(x - wdt * 0.45, y); g.quadraticCurveTo(x - wdt * 0.5, y - hh * 0.3, x + sway * 0.5, y - hh * 0.5); g.quadraticCurveTo(x + wdt * 0.5, y - hh * 0.3, x + wdt * 0.45, y); g.closePath(); g.fill();
        }
    }
    function bubbles(g, r, dt, rate, sources, top, color) {
        r.acc = (r.acc || 0) + rate * dt;
        while (r.acc >= 1) { r.acc--; var s = sources(); r.bs.push({ x: s[0], y: s[1], v: rnd(28, 55), w: rnd(0, 6), sz: rnd(1.2, 2.6) }); }
        g.strokeStyle = color || 'rgba(255,255,255,0.9)'; g.lineWidth = 1;
        r.bs = r.bs.filter(function (b) {
            b.y -= b.v * dt; var x = b.x + Math.sin(b.y * 0.2 + b.w) * 1.2;
            if (b.y <= top) return false;
            g.beginPath(); g.arc(x, b.y, b.sz, 0, 7); g.stroke();
            return true;
        });
    }

    var scenes = {
        // An alkali metal skates on water, fizzing; potassium sets its hydrogen alight with a lilac flame.
        skate: {
            start: function (s) {
                var k = s.metal === 'K';
                SimFx.play('fizz', { dur: 2.4, gain: k ? 0.09 : 0.065 });
                SimFx.haptic(k ? 'medium' : 'light');
                if (k) {
                    SimFx.play('boom', { dur: 0.25, gain: 0.14, delay: 0.35 });
                    setTimeout(function () { SimFx.haptic('heavy'); }, 350);
                    for (var i = 0; i < 5; i++) SimFx.play('pop', { from: 260, to: 700, gain: 0.06, delay: rnd(0.5, 2.1), key: 'rb-pop' + i });
                }
            },
            draw: function (g, r, t, dt, s) {
                var top = 80; beaker(g, r, top);
                var life = s.metal === 'K' ? 2.2 : 2.6, rad = 7 * (1 - Math.min(1, t / life));
                var x = 140 + 34 * Math.sin(t * 2.4 + Math.sin(t * 5.3)) + Math.sin(t * 31) * 1.2, y = top - 1.5;
                if (rad > 0.3) {
                    r.trail = r.trail || [];
                    r.trail.push({ x: x, y: top, a: 1 });
                }
                (r.trail || []).forEach(function (p) { p.a -= dt * 1.6; p.x += rnd(-0.4, 0.4); });
                r.trail = (r.trail || []).filter(function (p) { return p.a > 0; });
                g.fillStyle = '#ffffff';
                r.trail.forEach(function (p) { g.globalAlpha = p.a * 0.5; g.beginPath(); g.arc(p.x, p.y + rnd(-1, 1), 1.2, 0, 7); g.fill(); });
                g.globalAlpha = 1;
                if (rad > 0.3) {
                    if (s.metal === 'K' && t > 0.35) flame(g, x, y - rad * 0.6, 30 * ease((t - 0.35) / 0.25), 8, 'rgba(197,140,255,0.95)', 'rgba(236,214,255,0.9)', t);
                    g.fillStyle = '#C9CDD3'; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
                    g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(x - rad * 0.3, y - rad * 0.35, rad * 0.35, 0, 7); g.fill();
                }
                return t < 3.2;
            },
        },
        flame: {
            start: function (s) {
                SimFx.play('click', { gain: 0.12, delay: 0.1 });
                if (s.fuel === 'H2') { SimFx.play('boom', { dur: 0.35, gain: 0.5, delay: 0.3 }); SimFx.play('crack', { gain: 0.25, delay: 0.3 }); setTimeout(function () { SimFx.haptic('heavy'); }, 300); return; }
                SimFx.play('boom', { dur: 0.7, gain: s.fuel === 'Mg' ? 0.25 : 0.17, delay: 0.22 });
                if (s.fuel === 'Mg') SimFx.play('fizz', { dur: 2, freq: 7000, gain: 0.05, delay: 0.25 });
                setTimeout(function () { SimFx.haptic('medium'); }, 220);
            },
            draw: function (g, r, t, dt, s) {
                var grow = ease((t - 0.22) / 0.6), cx = 140, base = 128;
                if (s.fuel === 'H2') {
                    // A jar of hydrogen and oxygen: a flash, a bang, and droplets of water on the glass.
                    beaker(g, r);
                    var f = t > 0.3 ? Math.max(0, 1 - (t - 0.3) / 0.45) : 0;
                    if (f > 0) {
                        var rg = g.createRadialGradient(cx, 95, 2, cx, 95, 30 + (1 - f) * 70);
                        rg.addColorStop(0, 'rgba(255,250,230,' + f + ')'); rg.addColorStop(1, 'rgba(255,220,160,0)');
                        g.fillStyle = rg; g.fillRect(0, 0, W, H);
                    }
                    if (t > 0.6) {
                        r.drops = r.drops || Array.from({ length: 30 }, function (_, i) { return [i % 2 ? rnd(92, 104) : rnd(176, 188), rnd(42, 146), rnd(1.2, 2.6), rnd(0, 0.8)]; });
                        r.drops.forEach(function (d) {
                            var a = Math.min(1, (t - 0.6 - d[3]) * 2); if (a <= 0) return;
                            g.globalAlpha = a; g.fillStyle = 'rgba(110,160,220,0.75)'; g.beginPath(); g.arc(d[0], d[1], d[2], 0, 7); g.fill();
                            g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(d[0] - d[2] * 0.3, d[1] - d[2] * 0.3, d[2] * 0.35, 0, 7); g.fill();
                        });
                        g.globalAlpha = 1;
                    }
                    return t < 2.5;
                }
                if (t > 0.08 && t < 0.3) { g.fillStyle = '#FFD45A'; for (var k = 0; k < 4; k++) { g.beginPath(); g.arc(cx + rnd(-7, 7), base - rnd(0, 6), 1, 0, 7); g.fill(); } }
                if (s.fuel === 'CH4') {
                    g.fillStyle = r.glass; g.fillRect(cx - 6, base, 12, 30);
                    flame(g, cx, base, 46 * grow, 8, 'rgba(70,120,255,0.75)', 'rgba(40,70,220,0.95)', t);
                } else if (s.fuel === 'EtOH') {
                    g.fillStyle = r.glass; g.beginPath(); g.ellipse(cx, base + 6, 26, 6, 0, 0, 7); g.fill();
                    flame(g, cx, base + 2, 40 * grow, 20, 'rgba(110,150,255,0.6)', 'rgba(255,214,120,0.35)', t);
                } else if (s.fuel === 'Glu') {
                    g.fillStyle = r.glass; g.beginPath(); g.ellipse(cx, base + 10, 28, 5, 0, 0, 7); g.fill();
                    var brown = ease(t / 3);
                    g.fillStyle = 'rgb(' + Math.round(250 - 140 * brown) + ',' + Math.round(246 - 170 * brown) + ',' + Math.round(240 - 210 * brown) + ')';
                    g.fillRect(cx - 9, base - 8, 18, 16);
                    flame(g, cx, base - 6, 44 * grow, 13, 'rgba(255,150,40,0.9)', 'rgba(255,225,120,0.95)', t);
                } else if (s.fuel === 'Mg') {
                    g.strokeStyle = '#B9BEC6'; g.lineWidth = 2.5;
                    var len = 60 * (1 - 0.6 * ease((t - 0.25) / 3));
                    g.beginPath(); g.moveTo(cx - 40, base - 20); g.lineTo(cx - 40 + len, base - 20 - len * 0.35); g.stroke();
                    if (grow > 0) {
                        var tx = cx - 40 + len, ty = base - 20 - len * 0.35, glare = g.createRadialGradient(tx, ty, 1, tx, ty, 40 * grow);
                        glare.addColorStop(0, 'rgba(255,255,255,1)'); glare.addColorStop(0.25, 'rgba(255,255,255,0.85)'); glare.addColorStop(1, 'rgba(255,255,255,0)');
                        g.fillStyle = glare; g.beginPath(); g.arc(tx, ty, 40 * grow, 0, 7); g.fill();
                        r.smoke = r.smoke || [];
                        if (Math.random() < 0.5) r.smoke.push({ x: tx, y: ty, a: 0.5, s: rnd(3, 6) });
                        g.fillStyle = '#FFFFFF';
                        r.smoke = r.smoke.filter(function (p) { p.y -= 22 * dt; p.x += rnd(-0.5, 0.8); p.s += 6 * dt; p.a -= dt * 0.35; g.globalAlpha = Math.max(0, p.a) * 0.6; g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.fill(); return p.a > 0; });
                        g.globalAlpha = 1;
                    }
                }
                return true;
            },
        },
        // Two clear solutions meet and the insoluble salt clouds out, then settles to the bottom.
        precip: {
            start: function (s) {
                SimFx.play('tick', { freq: 1500, gain: 0.05, delay: 0.15 });
                SimFx.play('tick', { freq: 220, gain: 0.06, decay: 0.25, delay: 2.3 });
                setTimeout(function () { SimFx.haptic('light'); }, 300);
            },
            draw: function (g, r, t, dt, s) {
                var top = 70, col = s.color || '#f4f4f4';
                beaker(g, r, top);
                if (s.nail) {
                    g.strokeStyle = '#6E7176'; g.lineWidth = 4; g.beginPath(); g.moveTo(118, 50); g.lineTo(158, 140); g.stroke();
                    g.strokeStyle = 'rgba(220,222,226,' + ease(t / 2.5) * 0.9 + ')'; g.lineWidth = 5; g.setLineDash([2, 3]);
                    g.beginPath(); g.moveTo(127, 74); g.lineTo(156, 138); g.stroke(); g.setLineDash([]);
                } else if (t > 0.12 && t < 0.7) {
                    g.strokeStyle = 'rgba(200,220,240,0.8)'; g.lineWidth = 2.5;
                    g.beginPath(); g.moveTo(150, 22); g.lineTo(150, top); g.stroke();
                }
                if (!r.ps) {
                    r.ps = Array.from({ length: 70 }, function (_, i) {
                        var a = rnd(0, 6.28), n = s.nail ? rnd(0.25, 1) : 0;
                        return s.nail ? { born: rnd(0.2, 2.2), x: 127 + 30 * n, y: 74 + 64 * n, vx: rnd(-6, 6), vy: rnd(0, 8), fx: rnd(98, 182), fy: rnd(140, 147) }
                            : { born: rnd(0.3, 0.9), x: 150, y: top + 3, vx: Math.cos(a) * rnd(10, 40), vy: Math.abs(Math.sin(a)) * rnd(8, 30), fx: rnd(98, 182), fy: rnd(139, 147) };
                    });
                }
                var haze = s.nail ? 0 : Math.max(0, Math.min(1, (t - 0.3) / 0.5)) * (1 - 0.7 * ease((t - 1.2) / 2));
                if (haze > 0) { g.fillStyle = col; g.globalAlpha = haze * 0.22; g.fillRect(92, top + 1, 96, 150 - top - 1); g.globalAlpha = 1; }
                var settled = ease((t - 1.2) / 2.2);
                if (settled > 0) { g.fillStyle = col; g.globalAlpha = settled * 0.9; g.fillRect(92, 147 - settled * 5, 96, settled * 5); g.globalAlpha = 1; }
                g.fillStyle = col;
                r.ps.forEach(function (p) {
                    if (t < p.born) return;
                    var u = t - p.born, sink = ease((u - 0.5) / 2);
                    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94;
                    var x = p.x + (p.fx - p.x) * sink * 0.15, y = p.y + (p.fy - p.y) * sink;
                    p.x = x; p.y = Math.min(y, 148);
                    g.globalAlpha = 0.85; g.beginPath(); g.arc(p.x, p.y, 1.6, 0, 7); g.fill();
                });
                g.globalAlpha = 1;
                return t < 4;
            },
        },
        // Ammonia and hydrogen chloride drift toward each other down a tube; the white ring forms nearer the HCl end,
        // because the lighter ammonia travels faster.
        smoke: {
            start: function () { SimFx.play('tick', { freq: 700, gain: 0.05, decay: 0.2, delay: 1.2 }); setTimeout(function () { SimFx.haptic('light'); }, 1200); },
            draw: function (g, r, t, dt, s) {
                var x0 = 28, x1 = 252, y = 80, meet = x0 + 0.595 * (x1 - x0);
                g.strokeStyle = r.glass; g.lineWidth = 2; g.beginPath(); g.roundRect(x0, y - 13, x1 - x0, 26, 13); g.stroke();
                g.fillStyle = r.muted; g.font = '600 11px system-ui, sans-serif'; g.textAlign = 'center';
                g.fillText('NH₃', x0 + 14, y + 32); g.fillText('HCl', x1 - 14, y + 32);
                g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(x0 + 2, y - 10, 12, 20); g.fillRect(x1 - 14, y - 10, 12, 20);
                var front = ease(t / 1.3);
                for (var i = 0; i < 18; i++) {
                    var u = ((i * 0.37 + t * 0.6) % 1) * front;
                    g.fillStyle = 'rgba(120,170,255,0.5)'; g.beginPath(); g.arc(x0 + 14 + u * (meet - x0 - 14), y + Math.sin(i * 3 + t * 4) * 7, 1.4, 0, 7); g.fill();
                    g.fillStyle = 'rgba(160,230,140,0.5)'; g.beginPath(); g.arc(x1 - 14 - u * (x1 - 14 - meet), y + Math.cos(i * 2 + t * 4) * 7, 1.4, 0, 7); g.fill();
                }
                var ring = ease((t - 1.1) / 1.2);
                if (ring > 0) {
                    var rg = g.createRadialGradient(meet, y, 1, meet, y, 16);
                    rg.addColorStop(0, 'rgba(255,255,255,' + 0.95 * ring + ')'); rg.addColorStop(1, 'rgba(255,255,255,0)');
                    g.fillStyle = rg; g.fillRect(meet - 18, y - 12, 36, 24);
                }
                return t < 3;
            },
        },
        // Bubbles of gas off a metal (or from yeast), with chlorine's yellow-green haze where it forms.
        gas: {
            start: function (s) {
                SimFx.play('bubble', { n: Math.round(5 + s.vigor * 16), dur: 2.4, gain: 0.05 + s.vigor * 0.03 });
                if (s.haze) SimFx.play('fizz', { dur: 1.8, gain: 0.035, freq: 3500 });
                SimFx.haptic(s.vigor > 0.6 ? 'medium' : 'light');
            },
            draw: function (g, r, t, dt, s) {
                var top = 72;
                if (s.metal === 'Yeast') r.liquid = 'rgba(214,190,140,0.32)';
                beaker(g, r, top);
                var shrink = s.metal === 'Mg' ? 1 - 0.55 * ease(t / 4) : 1, src;
                if (s.metal === 'Mg') {
                    g.strokeStyle = '#B9BEC6'; g.lineWidth = 2;
                    g.beginPath(); for (var k = 0; k <= 20; k++) { var u = k / 20; g.lineTo(140 - 22 * shrink + u * 44 * shrink, 142 - Math.abs(Math.sin(u * 9)) * 6); } g.stroke();
                    src = function () { return [140 + rnd(-22, 22) * shrink, rnd(134, 142)]; };
                } else if (s.metal === 'Fe') {
                    g.fillStyle = '#55585E'; for (var j = 0; j < 26; j++) { g.beginPath(); g.arc(118 + ((j * 37) % 44), 146 - (j % 3) * 1.5, 1.4, 0, 7); g.fill(); }
                    src = function () { return [rnd(118, 162), 144]; };
                } else {
                    src = function () { return [rnd(98, 182), rnd(120, 148)]; };
                }
                var rate = (s.metal === 'Yeast' ? 10 : 6 + s.vigor * 40) * (t < 0.3 ? t / 0.3 : 1);
                bubbles(g, r, dt, rate, src, top + 1, s.metal === 'Yeast' ? 'rgba(255,250,235,0.9)' : null);
                if (s.metal === 'Yeast') { var foam = 7 * ease(t / 3); g.fillStyle = 'rgba(250,240,215,0.95)'; g.fillRect(91, top - foam + 1, 98, foam); }
                if (s.haze) {
                    var a = ease(t / 2.2) * 0.4, hz = g.createLinearGradient(0, 30, 0, top);
                    hz.addColorStop(0, 'rgba(201,217,91,0)'); hz.addColorStop(1, 'rgba(201,217,91,' + a + ')');
                    g.fillStyle = hz; g.fillRect(92, 30 + Math.sin(t * 2) * 2, 96, top - 30);
                }
                return true;
            },
        },
        // Neutralization: nothing to see in the liquid, but the thermometer climbs.
        heat: {
            start: function () { [600, 760, 940].forEach(function (f, i) { SimFx.play('tick', { freq: f, gain: 0.05, delay: 0.35 + i * 0.4 }); }); SimFx.haptic('light'); },
            draw: function (g, r, t, dt) {
                var top = 64; beaker(g, r, top);
                var x = 174, rise = 0.35 + 0.4 * ease((t - 0.2) / 1.6);
                g.strokeStyle = r.glass; g.lineWidth = 1.2; g.beginPath(); g.roundRect(x - 3, 30, 6, 108, 3); g.stroke();
                g.fillStyle = '#D9483B'; g.beginPath(); g.arc(x, 138, 5, 0, 7); g.fill();
                g.fillRect(x - 1.5, 138 - rise * 104, 3, rise * 104);
                g.strokeStyle = 'rgba(230,140,90,0.45)'; g.lineWidth = 1.2;
                for (var i = 0; i < 4; i++) {
                    var u = ((t * 0.5 + i * 0.25) % 1), y0 = top - 4 - u * 34;
                    g.globalAlpha = Math.sin(u * Math.PI) * ease(t / 1.2);
                    g.beginPath(); for (var k = 0; k <= 10; k++) g.lineTo(110 + i * 16 + Math.sin(k * 1.2 + t * 6 + i) * 2.2, y0 - k * 1.6); g.stroke();
                }
                g.globalAlpha = 1;
                return true;
            },
        },
        // Heated copper blackens from the edges as copper oxide forms.
        copperBlack: {
            start: function () { SimFx.play('boom', { dur: 0.5, gain: 0.1 }); SimFx.haptic('light'); },
            draw: function (g, r, t) {
                var d = ease((t - 0.3) / 2.6);
                g.fillStyle = r.glass; g.fillRect(134, 130, 12, 30);
                flame(g, 140, 130, 30, 7, 'rgba(70,120,255,0.75)', 'rgba(40,70,220,0.95)', t);
                var x = 100, y = 78, w = 80, h = 14;
                g.fillStyle = '#C8753A'; g.fillRect(x, y, w, h);
                var gr = g.createLinearGradient(x, 0, x + w, 0), a = Math.min(1, d * 1.6);
                gr.addColorStop(0, 'rgba(26,26,26,' + a + ')'); gr.addColorStop(0.5, 'rgba(26,26,26,' + Math.max(0, d * 1.6 - 0.6) + ')'); gr.addColorStop(1, 'rgba(26,26,26,' + a + ')');
                g.fillStyle = gr; g.fillRect(x, y, w, h);
                return true;
            },
        },
        // Copper wire in silver nitrate: silver crystals grow on the wire and the solution turns blue.
        copperSilver: {
            start: function () { SimFx.play('tick', { freq: 1200, gain: 0.04 }); SimFx.haptic('light'); },
            draw: function (g, r, t) {
                var blue = ease(t / 3.2) * 0.45;
                r.liquid = 'rgba(' + Math.round(140 - 97 * blue / 0.45) + ',' + Math.round(185 - 74 * blue / 0.45) + ',' + Math.round(230 - 16 * blue / 0.45) + ',' + (0.3 + blue * 0.5) + ')';
                beaker(g, r, 62);
                g.strokeStyle = '#C8753A'; g.lineWidth = 2.5; g.beginPath();
                for (var k = 0; k <= 40; k++) { var u = k / 40; g.lineTo(140 + Math.sin(u * 30) * 9, 40 + u * 100); } g.stroke();
                r.xt = r.xt || Array.from({ length: 34 }, function () { var u = rnd(0.25, 1); return [140 + Math.sin(u * 30) * 9, 40 + u * 100, rnd(0, 6.28), rnd(4, 9), rnd(0, 1.5)]; });
                g.strokeStyle = 'rgba(225,228,232,0.95)'; g.lineWidth = 1.2;
                r.xt.forEach(function (c) { var L = c[3] * ease((t - c[4]) / 2); if (L <= 0) return; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] + Math.cos(c[2]) * L, c[1] + Math.sin(c[2]) * L); g.stroke(); });
                return true;
            },
        },
        // Rusting is slow: shown as a time-lapse of patches spreading where the nail meets water and air.
        rust: {
            start: function () { SimFx.haptic('light'); },
            draw: function (g, r, t) {
                beaker(g, r, 100);
                g.strokeStyle = '#7C8086'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(112, 60); g.lineTo(168, 140); g.stroke(); g.lineCap = 'butt';
                r.sp = r.sp || Array.from({ length: 26 }, function () { var u = rnd(0.45, 0.8); return [112 + 56 * u + rnd(-2, 2), 60 + 80 * u + rnd(-2, 2), rnd(1.5, 3.5), rnd(0, 2)]; });
                g.fillStyle = '#A0522D';
                r.sp.forEach(function (p) { var a = ease((t - p[3]) / 1.5); if (a > 0) { g.globalAlpha = a; g.beginPath(); g.arc(p[0], p[1], p[2] * a, 0, 7); g.fill(); } });
                g.globalAlpha = 1; g.fillStyle = r.muted; g.font = 'italic 10px system-ui, sans-serif'; g.textAlign = 'left';
                g.fillText('time-lapse', 36, 26);
                return t < 4;
            },
        },
        // Electrolysis: hydrogen collects at the negative electrode twice as fast as oxygen at the positive one.
        split: {
            start: function () { SimFx.play('bubble', { n: 12, dur: 2.5, gain: 0.04 }); SimFx.haptic('light'); },
            draw: function (g, r, t, dt) {
                var top = 58; beaker(g, r, top);
                var tubes = [[118, 'H₂', '−', 2], [162, 'O₂', '+', 1]];
                tubes.forEach(function (tb) {
                    var x = tb[0], gas = 46 * ease(t / 6) * tb[3] / 2;
                    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x - 9, 48, 18, gas);
                    g.strokeStyle = r.glass; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 9, 128); g.lineTo(x - 9, 48); g.arc(x, 48, 9, Math.PI, 0); g.lineTo(x + 9, 128); g.stroke();
                    g.fillStyle = r.muted; g.fillRect(x - 1.5, 112, 3, 34);
                    g.font = '700 11px system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(tb[1], x, 28); g.fillText(tb[2], x, 156);
                });
                r.bs2 = r.bs2 || [];
                if (Math.random() < 0.5) { r.bs2.push({ x: 118 + rnd(-3, 3), y: 112, v: rnd(25, 40) }); if (Math.random() < 0.5) r.bs2.push({ x: 162 + rnd(-3, 3), y: 112, v: rnd(25, 40) }); }
                g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1;
                r.bs2 = r.bs2.filter(function (b) { b.y -= b.v * dt; g.beginPath(); g.arc(b.x, b.y, 1.4, 0, 7); g.stroke(); return b.y > 52 + 10; });
                return true;
            },
        },
        // Dissolving or simply mixing: grains shrink away, or the liquids swirl; no new substance.
        none: {
            start: function () { SimFx.play('tick', { freq: 500, gain: 0.04, decay: 0.12 }); },
            draw: function (g, r, t, dt, s) {
                beaker(g, r, 66);
                var sw = 1 - ease(t / 3);
                g.strokeStyle = 'rgba(255,255,255,' + 0.6 * sw + ')'; g.lineWidth = 1.2;
                for (var i = 0; i < 3; i++) { g.beginPath(); g.ellipse(140, 104, 34 - i * 10, 12 - i * 3, 0, t * 3 + i, t * 3 + i + 3.5); g.stroke(); }
                if (s.grains) {
                    r.gr = r.gr || Array.from({ length: 16 }, function () { return [rnd(104, 176), rnd(140, 147), rnd(2.5, 4)]; });
                    g.fillStyle = 'rgba(255,255,255,0.9)';
                    r.gr.forEach(function (p) { var z = p[2] * (1 - ease(t / 2.8)); if (z > 0.2) g.fillRect(p[0] - z / 2, p[1] - z / 2, z, z); });
                }
                return t < 3.2;
            },
        },
    };

    function frame(now) {
        var r = run; if (!r) return;
        if (!document.body.contains(r.c)) { run = null; return; }
        var dt = Math.min(0.05, (now - r.last) / 1000); r.last = now; r.t += dt;
        var c = r.c, dpr = window.devicePixelRatio || 1, cw = c.clientWidth, ch = c.clientHeight, sc = cw / W;
        if (c.width !== Math.round(cw * dpr)) { c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); }
        var g = c.getContext('2d'); g.setTransform(dpr * sc, 0, 0, dpr * sc, 0, 0); g.clearRect(0, 0, W, H);
        if (r.scene !== scenes.smoke) zoom(g);
        var more = r.scene.draw(g, r, r.t, dt, r.s);
        if (more || r.t < 6) r.raf = requestAnimationFrame(frame);
    }

    window.RbLab = {
        run: function (id, spec) {
            var c = document.getElementById(id); if (!c) return;
            if (run && run.raf) cancelAnimationFrame(run.raf);
            var scene = scenes[spec.scene] || scenes.none;
            run = { c: c, s: spec, scene: scene, t: 0, last: performance.now(), bs: [], glass: ink(c, '--text-muted', '#8a7f74'), muted: ink(c, '--text-muted', '#8a7f74') };
            try { scene.start(spec); } catch (e) { }
            if (window.SimFx && SimFx.reducedMotion()) {
                // Skip the playback: draw the scene as it looks once it has settled.
                var dpr = window.devicePixelRatio || 1; c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(c.clientHeight * dpr);
                var gg = c.getContext('2d'); gg.setTransform(dpr * c.clientWidth / W, 0, 0, dpr * c.clientWidth / W, 0, 0);
                if (scene !== scenes.smoke) zoom(gg);
                for (var i = 1; i <= 90; i++) { gg.clearRect(0, 0, W, H); scene.draw(gg, run, i / 30, 1 / 30, spec); }
                run = null; return;
            }
            run.raf = requestAnimationFrame(frame);
        },
    };
})();
