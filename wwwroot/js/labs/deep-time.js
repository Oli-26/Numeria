// Deep Time drill core: a sticky gauge reads whichever event sits at its line as the page scrolls. The age rolls,
// the band label flips at eon and era boundaries, and at the present the core zooms into its last sliver.
(function () {
    var st = null;
    var FULL = 4540, NEAR = 66, ZOOM_BELOW = 4e5;
    var LABEL = { hadean: 'Hadean eon', archean: 'Archean eon', proterozoic: 'Proterozoic eon', paleozoic: 'Paleozoic era', mesozoic: 'Mesozoic era', cenozoic: 'Cenozoic era' };
    var COLOR = { hadean: '#1a1a1a', archean: '#4a4a4a', proterozoic: '#7B3FA0', paleozoic: '#2E8B57', mesozoic: '#E67E22', cenozoic: '#F1C40F' };
    var eonOf = function (e) { return e === 'paleozoic' || e === 'mesozoic' || e === 'cenozoic' ? 'phanerozoic' : e; };
    var $ = function (id) { return document.getElementById(id); };

    function fmt(a) {
        if (a < 1.5) return ['Today', ''];
        if (a >= 1e9) return [(a / 1e9).toFixed(2), 'billion years ago'];
        if (a >= 1e6) return [(a / 1e6).toFixed(a < 1e7 ? 1 : 0), 'million years ago'];
        var r = a >= 1e4 ? 1000 : a >= 1000 ? 100 : 1;
        return [(Math.round(a / r) * r).toLocaleString('en-US'), 'years ago'];
    }

    // Lays the core out for a window of the last w million years.
    function layout(w) {
        st.w = w;
        st.segs.forEach(function (s) {
            var a = +s.dataset.start, b = +s.dataset.end;
            s.style.left = ((w - a) / w * 100) + '%'; s.style.width = ((a - b) / w * 100) + '%';
        });
        st.humans.style.width = 'max(1px, ' + (0.3 / w * 100) + '%)';
        placeMark();
    }
    function placeMark() { st.mark.style.left = Math.max(0, Math.min(100, (1 - st.age / 1e6 / st.w) * 100)) + '%'; }

    function zoomTo(w, instant) {
        if (st.zoomRaf) cancelAnimationFrame(st.zoomRaf);
        st.target = w;
        $('dt-g-scale').textContent = w < FULL ? 'Zoomed to the last 66 million years' : 'All 4.54 billion years, to scale';
        st.gauge.classList.toggle('dt-zoomed', w < FULL);
        if (instant || SimFx.reducedMotion()) { layout(w); return; }
        var from = Math.log(st.w), to = Math.log(w), t0 = performance.now();
        (function step(now) {
            var u = Math.min(1, (now - t0) / 900), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
            layout(Math.exp(from + (to - from) * e));
            st.zoomRaf = u < 1 ? requestAnimationFrame(step) : 0;
        })(t0);
    }

    function setEon(e, animate) {
        var el = $('dt-g-eon'); if (!el || el.dataset.eon === e) return;
        el.dataset.eon = e; el.textContent = LABEL[e] || e;
        el.style.background = 'color-mix(in oklab, ' + (COLOR[e] || '#555') + ' 65%, black)';
        if (animate) SimFx.pulse(el, 'dt-flip');
    }

    // Pinned with position: fixed rather than sticky, which lags a frame behind fast scrolls on some WebViews.
    function pin() {
        var r = st.slot.getBoundingClientRect(), on = r.top < 0;
        if (on) {
            st.slot.style.height = st.gauge.offsetHeight + 'px';
            st.gauge.style.left = (r.left - 16) + 'px'; st.gauge.style.width = (r.width + 32) + 'px';
        } else { st.slot.style.height = ''; st.gauge.style.left = ''; st.gauge.style.width = ''; }
        st.gauge.classList.toggle('dt-pinned', on);
    }

    // Leaves just enough room after the timeline for its last event to reach the gauge line.
    function sizeRunout() {
        var run = document.querySelector('.dt-runout'), rows = st.scroller.querySelectorAll('.dt-row');
        if (!run || !rows.length) return;
        var last = rows[rows.length - 1].getBoundingClientRect().top + scrollY;
        var doc = document.documentElement.scrollHeight - run.offsetHeight;
        run.style.height = Math.max(0, last + 31 - (st.gauge.offsetHeight + 27) + innerHeight - doc) + 'px';
    }

    function update() {
        st.raf = 0;
        if (!document.body.contains(st.gauge)) { stop(); return; }
        pin();
        var rows = st.scroller.querySelectorAll('.dt-row'), n = rows.length;
        if (!n) return;
        var line = st.gauge.getBoundingClientRect().bottom + 27, i = -1, y0 = 0, y1 = 0;
        for (var k = 0; k < n; k++) {
            var y = rows[k].getBoundingClientRect().top + 25;
            if (y <= line) { i = k; y0 = y; } else { y1 = y; break; }
        }
        var ageAt = function (j) { return +rows[j].dataset.age; };
        var age;
        if (i < 0) age = ageAt(0);
        else if (i >= n - 1) age = ageAt(n - 1);
        else {
            var f = Math.max(0, Math.min(1, (line - y0) / Math.max(1, y1 - y0)));
            age = Math.exp(Math.log(ageAt(i)) + (Math.log(ageAt(i + 1)) - Math.log(ageAt(i))) * f);
        }
        st.age = age;
        var txt = fmt(age);
        if (st.num.textContent !== txt[0]) st.num.textContent = txt[0];
        if (st.unit.textContent !== txt[1]) st.unit.textContent = txt[1];
        placeMark();

        var row = i >= 0 ? rows[i] : null;
        if (row !== st.row) {
            if (st.row) st.row.classList.remove('dt-now');
            if (row) row.classList.add('dt-now');
            var was = st.idx, eon = rows[Math.max(0, i)].dataset.eon;
            if (!st.silent && was !== i) {
                var lo = Math.max(0, Math.min(was, i)), hi = Math.max(was, i), eonCross = false, eraCross = false;
                for (var j = lo + 1; j <= hi && j < n; j++) {
                    var a = rows[j - 1].dataset.eon, b = rows[j].dataset.eon;
                    if (eonOf(a) !== eonOf(b)) eonCross = true; else if (a !== b) eraCross = true;
                }
                if (eonCross) { SimFx.play('thunk', { gain: 0.34, gap: 0.12 }); SimFx.haptic('medium'); }
                else if (eraCross) { SimFx.play('crack', { gain: 0.2, gap: 0.12 }); SimFx.haptic('medium'); }
                else if (row) SimFx.play('tick', { freq: 420 + Math.max(0, i) * 18, gain: 0.045, decay: 0.05, gap: 0.06 });
                if (i === n - 1 && was < i) { SimFx.play('chime', { freq: 660, gain: 0.06, delay: 0.12 }); SimFx.haptic('success'); }
            }
            setEon(eon, !st.silent);
            st.row = row; st.idx = i;
        }
        var want = age < ZOOM_BELOW ? NEAR : FULL;
        if (want !== st.target) zoomTo(want, st.silent);
        st.silent = false;
    }

    function onScroll() { if (st && !st.raf) st.raf = requestAnimationFrame(update); }
    function onResize() { if (st) sizeRunout(); onScroll(); }
    function stop() {
        if (!st) return;
        window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
        if (st.raf) cancelAnimationFrame(st.raf);
        if (st.zoomRaf) cancelAnimationFrame(st.zoomRaf);
        st = null;
    }

    window.DeepTime = {
        // Safe to call after every render: re-reads the rows without sounding the change.
        init: function () {
            var gauge = $('dt-gauge'); if (!gauge) return;
            if (!st || st.gauge !== gauge) {
                stop();
                st = { gauge: gauge, slot: $('dt-gauge-slot'), scroller: $('dt-scroller'), num: $('dt-g-num'), unit: $('dt-g-unit'), mark: $('dt-g-mark'), humans: $('dt-g-humans'),
                       segs: Array.prototype.slice.call(gauge.querySelectorAll('.dt-g-seg')), w: FULL, target: FULL, age: 4.54e9, idx: -1, row: null };
                window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onResize);
                layout(FULL);
            }
            Array.prototype.forEach.call(document.querySelectorAll('.dt-row.dt-now'), function (r) { r.classList.remove('dt-now'); });
            st.silent = true; st.row = undefined;
            if (st.raf) cancelAnimationFrame(st.raf);
            sizeRunout();
            update();
        },
        // Re-reads the gauge now, for content moved by something other than a scroll.
        sync: function () { if (!st) return; if (st.raf) cancelAnimationFrame(st.raf); update(); },
        dispose: stop,
    };
})();
