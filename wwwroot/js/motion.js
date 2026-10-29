(function () {
    function reduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function call(obj, fn) { try { if (window[obj] && window[obj][fn]) window[obj][fn](); } catch (e) { } }
    function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

    // ── XP fly: the reward badge bursts into orbs that land in a level ring at the top corner ──
    var queue = [], busy = false;

    // The page marks its reward badge with data-xp-source; it may render a moment after the award.
    async function waitForSource() {
        // Results screens can take a couple of seconds to render after saving, so wait well past that.
        for (var t = 0; t < 60; t++) {
            var els = document.querySelectorAll('[data-xp-source]');
            for (var i = els.length - 1; i >= 0; i--) {
                var r = els[i].getBoundingClientRect();
                if (r.width > 0 && r.bottom > 0 && r.top < window.innerHeight) return els[i];
            }
            await sleep(50);
        }
        return null;
    }

    function buildHud() {
        var h = document.createElement('div');
        h.className = 'xp-hud';
        h.setAttribute('aria-hidden', 'true');
        // pathLength 100 lets the ring's fill be set as a plain percentage.
        h.innerHTML = '<svg class="xp-hud-ring" viewBox="0 0 48 48"><circle class="bg" cx="24" cy="24" r="21"/>' +
            '<circle class="fg" cx="24" cy="24" r="21" pathLength="100"/></svg><span class="xp-hud-lvl"></span>';
        document.body.appendChild(h);
        return h;
    }

    function setLevel(h, p) { h.querySelector('.xp-hud-lvl').textContent = p.level; }
    function setBar(h, frac) { h.querySelector('.xp-hud-ring .fg').style.strokeDashoffset = 100 - Math.max(0, Math.min(1, frac)) * 100; }

    function flyOrb(sx, sy, tx, ty, onLand) {
        var orb = document.createElement('div');
        orb.className = 'xp-orb';
        document.body.appendChild(orb);
        var at = function (x, y, s) { return 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%) scale(' + s + ')'; };
        // Burst a little way out from the badge, then swing out to the side on the way up so orbs clear the text.
        var a = Math.random() * Math.PI * 2, r = 20 + Math.random() * 22;
        var bx = sx + Math.cos(a) * r, by = sy + Math.sin(a) * r;
        var cx = Math.min(window.innerWidth - 8, Math.max(bx, tx) + 20 + Math.random() * 50), cy = by - (by - ty) * 0.25;
        var frames = [{ transform: at(sx, sy, .3), opacity: 0, offset: 0, easing: 'ease-out' }, { transform: at(bx, by, 1.15), opacity: 1, offset: .2 }];
        for (var k = 1; k <= 10; k++) {
            var u = Math.pow(k / 10, 1.5);
            var x = (1 - u) * (1 - u) * bx + 2 * (1 - u) * u * cx + u * u * tx;
            var y = (1 - u) * (1 - u) * by + 2 * (1 - u) * u * cy + u * u * ty;
            frames.push({ transform: at(x, y, 1.15 - .6 * k / 10), opacity: 1, offset: .2 + .8 * k / 10 });
        }
        var done = false, land = function () { if (done) return; done = true; orb.remove(); onLand(); };
        try { orb.animate(frames, { duration: 760 + Math.random() * 140, fill: 'forwards' }).onfinish = land; }
        catch (e) { land(); }
        setTimeout(land, 1400);
    }

    async function run(o) {
        var from = o.from, to = o.to, levelUp = to.level > from.level;
        if (reduced()) {
            if (levelUp) { call('Sounds', 'playLevelUp'); call('Haptics', 'heavy'); }
            return;
        }
        var src = await waitForSource(), temp = null;
        if (!src) {
            temp = src = document.createElement('div');
            src.className = 'xp-badge xp-temp';
            src.textContent = '+' + o.xp + ' XP';
            document.body.appendChild(src);
        }
        var h = buildHud();
        setLevel(h, from);
        h.classList.add('reset');
        setBar(h, from.xpInLevel / from.xpNeeded);
        void h.offsetWidth;
        h.classList.remove('reset');
        h.classList.add('show');
        // Some pages move on right after the award, so remember where the badge was in case it is gone by launch time.
        var s = src.getBoundingClientRect();
        restart(src, 'xp-stamp');
        await sleep(420);

        if (src.isConnected) s = src.getBoundingClientRect();
        var t = h.getBoundingClientRect();
        var sx = s.left + s.width / 2, sy = s.top + s.height / 2, tx = t.left + t.width / 2, ty = t.top + t.height / 2;
        var n = Math.max(5, Math.min(12, Math.round(o.xp / 15)));
        var startFrac = from.xpInLevel / from.xpNeeded, endFrac = levelUp ? 1 : to.xpInLevel / to.xpNeeded;
        await new Promise(function (resolve) {
            var landed = 0;
            for (var i = 0; i < n; i++) {
                setTimeout(function () {
                    flyOrb(sx, sy, tx, ty, function () {
                        landed++;
                        var k = landed / n;
                        setBar(h, startFrac + (endFrac - startFrac) * k);
                        restart(h, 'hit');
                        // Every other orb, so a burst of twelve doesn't turn into one long buzz.
                        if (landed % 2 === 1 || landed === n) { call('Haptics', 'light'); call('Sounds', 'playXpTick'); }
                        if (landed === n) resolve();
                    });
                }, i * 70);
            }
        });

        if (levelUp) {
            await sleep(200);
            h.classList.add('reset');
            setLevel(h, to);
            setBar(h, to.xpInLevel / to.xpNeeded);
            void h.offsetWidth;
            h.classList.remove('reset');
            restart(h, 'level-up');
            var banner = document.createElement('div');
            banner.className = 'xp-hud-banner';
            banner.textContent = 'Level ' + to.level + '!';
            h.appendChild(banner);
            call('Sounds', 'playLevelUp');
            call('Haptics', 'heavy');
            if (window.Confetti) window.Confetti.launch(60);
            await sleep(1900);
        } else {
            await sleep(1100);
        }
        h.classList.remove('show');
        if (temp) temp.classList.add('out');
        await sleep(400);
        h.remove();
        if (temp) temp.remove();
    }

    async function drain() {
        if (busy) return;
        busy = true;
        while (queue.length) { try { await run(queue.shift()); } catch (e) { } }
        busy = false;
    }

    window.XpFly = {
        play: function (xp, fromLevel, fromIn, fromNeed, toLevel, toIn, toNeed) {
            queue.push({ xp: xp, from: { level: fromLevel, xpInLevel: fromIn, xpNeeded: fromNeed }, to: { level: toLevel, xpInLevel: toIn, xpNeeded: toNeed } });
            drain();
        }
    };

    // ── Count-up: numbers marked data-count roll up from zero ──
    // Only the existing text node's value changes, so Blazor's reference to it stays valid; it is left alone if Blazor re-renders it mid-count.
    window.CountUp = {
        run: async function (selector, duration) {
            if (reduced()) return;
            var root = null;
            for (var t = 0; t < 20 && !root; t++) { root = document.querySelector(selector); if (!root) await sleep(50); }
            if (!root) return;
            root.querySelectorAll('[data-count]').forEach(function (el) {
                var node = el.firstChild;
                if (!node || node.nodeType !== 3) return;
                var final = node.nodeValue, target = parseInt(final.replace(/[^0-9]/g, ''), 10);
                if (!(target > 0)) return;
                var sep = (final.match(/\d(\D)\d{3}/) || [])[1] || '';
                var pre = final.match(/^\D*/)[0], post = final.match(/\D*$/)[0];
                var fmt = function (v) { return sep ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, sep) : String(v); };
                var dur = duration || 700, start = null, last = null;
                function step(ts) {
                    if (last !== null && node.nodeValue !== last) return;
                    if (start === null) start = ts;
                    var p = Math.min((ts - start) / dur, 1);
                    last = p < 1 ? pre + fmt(Math.round(target * (1 - Math.pow(1 - p, 3)))) + post : final;
                    node.nodeValue = last;
                    if (p < 1) requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
            });
        }
    };
})();
