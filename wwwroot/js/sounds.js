window.Sounds = {
    ctx: null,
    _muted: false,
    getCtx() {
        if (this._muted) return null;
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    },

    playCorrect() {
        try {
            var ctx = this.getCtx();
            [523.25, 659.25].forEach(function (freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.1);
                osc.stop(ctx.currentTime + i * 0.1 + 0.15);
            });
        } catch (e) { }
    },

    playWrong() {
        try {
            var ctx = this.getCtx();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 150;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) { }
    },

    playLevelUp() {
        try {
            var ctx = this.getCtx();
            // Triumphant C-E-G-C arpeggio with reverb-like tail
            [523.25, 659.25, 783.99, 1046.5].forEach(function (freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.4);
            });
            // Shimmer overtone
            var osc2 = ctx.createOscillator();
            var g2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.value = 2093;
            g2.gain.setValueAtTime(0.06, ctx.currentTime + 0.36);
            g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
            osc2.connect(g2);
            g2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.36);
            osc2.stop(ctx.currentTime + 0.9);
        } catch (e) { }
    },

    playClick() {
        try {
            var ctx = this.getCtx();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) { }
    },

    // Achievement unlock — magical ascending shimmer
    playAchievement() {
        try {
            var ctx = this.getCtx();
            [880, 1108.7, 1318.5, 1760].forEach(function (freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.08);
                osc.stop(ctx.currentTime + i * 0.08 + 0.3);
            });
            // Sparkle high note
            var osc2 = ctx.createOscillator();
            var g2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.value = 3520;
            g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.3);
            g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc2.connect(g2);
            g2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.3);
            osc2.stop(ctx.currentTime + 0.6);
        } catch (e) { }
    },

    // Shop purchase — satisfying cha-ching
    playPurchase() {
        try {
            var ctx = this.getCtx();
            // Coin drop: two metallic tings
            [1200, 1600].forEach(function (freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.1);
                osc.stop(ctx.currentTime + i * 0.1 + 0.2);
            });
        } catch (e) { }
    },

    // Navigation tap — soft pop
    playNav() {
        try {
            var ctx = this.getCtx();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.06);
        } catch (e) { }
    },

    // Streak milestone — warm ascending chord
    playStreak() {
        try {
            var ctx = this.getCtx();
            [440, 554.37, 659.25].forEach(function (freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.06);
                osc.stop(ctx.currentTime + i * 0.06 + 0.25);
            });
        } catch (e) { }
    },

    // Quiz complete — triumphant fanfare
    playComplete() {
        try {
            var ctx = this.getCtx();
            // G-B-D-G major chord arpeggiated
            [392, 493.88, 587.33, 784].forEach(function (freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.14, ctx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.1);
                osc.stop(ctx.currentTime + i * 0.1 + 0.5);
            });
        } catch (e) { }
    },

    // Card reveal — soft whoosh
    playReveal() {
        try {
            var ctx = this.getCtx();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);
        } catch (e) { }
    },

    // XP tick — quick ascending pip (for count-up animations)
    playXpTick() {
        try {
            var ctx = this.getCtx();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.03);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.04);
        } catch (e) { }
    },

    // Release the AudioContext to free system audio resources.
    close() {
        if (this.ctx) {
            try { this.ctx.close(); } catch (e) { }
            this.ctx = null;
        }
    }
};

// Init mute state from localStorage
try { Sounds._muted = localStorage.getItem('nous-sound-muted') === 'true'; } catch(e) {}

// ── Confetti system ──
window.Confetti = {
    launch(count) {
        var container = document.getElementById('confetti-container');
        if (!container) return;
        var colors = ['#7eb4ff', '#b48cff', '#ff8ec6', '#4CAF50', '#FFD080', '#EF5350', '#4A5FE0'];
        for (var i = 0; i < (count || 60); i++) {
            var piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.width = (Math.random() * 8 + 5) + 'px';
            piece.style.height = (Math.random() * 8 + 5) + 'px';
            piece.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
            piece.style.animationDelay = (Math.random() * 0.5) + 's';
            if (Math.random() > 0.5) piece.style.borderRadius = '50%';
            container.appendChild(piece);
        }
        setTimeout(function () {
            while (container.firstChild) container.removeChild(container.firstChild);
        }, 3500);
    }
};

// ── Animated counter ──
window.AnimCounter = {
    run(elementId, endVal, duration, prefix, suffix) {
        var el = document.getElementById(elementId);
        if (!el) return;
        var start = 0;
        var dur = duration || 600;
        var pre = prefix || '';
        var suf = suffix || '';
        var startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / dur, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            var current = Math.round(start + (endVal - start) * eased);
            el.textContent = pre + current.toLocaleString() + suf;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
};

// ── XP float popup ──
window.XpFloat = {
    show(amount, x, y) {
        var el = document.createElement('div');
        el.className = 'xp-float';
        el.textContent = '+' + amount + ' XP';
        el.style.left = (x || window.innerWidth / 2 - 30) + 'px';
        el.style.top = (y || window.innerHeight / 2) + 'px';
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 1300);
    }
};
