// Trolley Lab: the lever, the trolley's run down the chosen track, and the verdict stamps.
window.TrolleyLab = {
    run: function (svg, mode, choice) {
        if (!svg || !svg.querySelector) return;
        var trolley = svg.querySelector('.tl-trolley'), reduced = SimFx.reducedMotion();
        var route, start = 0, dur = 1450;
        if (mode === 'bridge') {
            route = choice === 0 ? [[30, 70], [137, 70]] : [[30, 70], [236, 70]];
            if (choice === 0) {
                var s = svg.querySelector('.tl-stranger');
                SimFx.haptic('heavy');
                if (s && !reduced) {
                    s.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(0,-6px)', offset: 0.25 }, { transform: 'translate(0,35px)' }],
                        { duration: 420, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' });
                } else if (s) s.setAttribute('transform', 'translate(0 35)');
                SimFx.play('thunk', { delay: 0.4 });
                dur = 1150;
            }
        } else {
            var b = choice === 0 ? [30, 60, 243.6, 40.8] : [30, 60, 243.6, 79.2];
            route = [[b[0], b[1]], [150, 60], [b[2], b[3]]];
            if (choice === 0) {
                SimFx.play('thunk'); SimFx.haptic('heavy');
                var arm = svg.querySelector('.tl-lever-arm');
                if (arm && !reduced) arm.animate([{ transform: 'rotate(-32deg)' }, { transform: 'rotate(38deg)' }, { transform: 'rotate(32deg)' }],
                    { duration: 220, easing: 'cubic-bezier(.4,0,.6,1.4)', fill: 'forwards' });
                else if (arm) arm.setAttribute('transform', 'rotate(32)');
                var ba = svg.querySelector('.tl-blade-a'), bb = svg.querySelector('.tl-blade-b');
                setTimeout(function () { if (ba) ba.setAttribute('opacity', '1'); if (bb) bb.setAttribute('opacity', '0'); }, reduced ? 0 : 140);
                start = 260;
            } else start = 120;
        }
        var lens = [], total = 0;
        for (var i = 1; i < route.length; i++) {
            var l = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]);
            lens.push(l); total += l;
        }
        var place = function (d) {
            for (var k = 0; k < lens.length; k++) {
                if (d <= lens[k] || k === lens.length - 1) {
                    var a = route[k], c = route[k + 1], u = Math.min(1, d / lens[k]);
                    var ang = Math.atan2(c[1] - a[1], c[0] - a[0]) * 180 / Math.PI;
                    trolley.setAttribute('transform', 'translate(' + (a[0] + (c[0] - a[0]) * u).toFixed(2) + ' ' + (a[1] + (c[1] - a[1]) * u).toFixed(2) + ') rotate(' + ang.toFixed(2) + ')');
                    return;
                }
                d -= lens[k];
            }
        };
        var dimFig = function () {
            var f = svg.querySelector(choice === 0 ? '.tl-fig-a' : '.tl-fig-b');
            if (f) f.classList.add('tl-fig-dim');
        };
        if (reduced) { place(total); dimFig(); SimFx.play('click', { delay: start / 1000 }); return; }
        // Rail joints every 15 units: the clacks slow down as the trolley brakes.
        var joint = 15, nextJoint = joint, t0 = null;
        setTimeout(function () {
            requestAnimationFrame(function step(now) {
                if (t0 === null) t0 = now;
                var u = Math.min(1, (now - t0) / dur), d = total * (1 - Math.pow(1 - u, 2.4));
                place(d);
                while (d >= nextJoint) { SimFx.play('tick', { freq: 210, type: 'square', gain: 0.035, decay: 0.035, gap: 0.02 }); nextJoint += joint; }
                if (u < 1 && svg.isConnected) requestAnimationFrame(step);
                else { SimFx.play('click', { gain: 0.12 }); SimFx.haptic('light'); dimFig(); }
            });
        }, start);
    },
    // One soft tick per framework card as it flips in, pitched by whether it agrees.
    verdicts: function (kinds, base) {
        var f = { agrees: 1180, differs: 520, divided: 780 };
        kinds.forEach(function (k, i) { SimFx.play('tick', { freq: f[k] || 780, gain: 0.06, delay: base + 0.14 * i + 0.22, key: 'tl-v' + i }); });
    },
};
