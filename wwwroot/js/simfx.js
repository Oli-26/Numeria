// Sound, haptics and small motion helpers for the labs.
// Each sound is a voice (ctx, out, t, o) that builds a short WebAudio graph, so the same voice plays live or, while a promo
// recording is running (window.__simfxRecord), is logged and later rendered offline into the recording's audio track.
(function () {
    var live = null, master = null, last = {}, detents = {};
    function muted() { return window.Sounds && window.Sounds._muted; }
    function reduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

    var noiseCache = new WeakMap();
    function noise(ctx) {
        var b = noiseCache.get(ctx);
        if (!b) {
            b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
            var d = b.getChannelData(0);
            for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            noiseCache.set(ctx, b);
        }
        var s = ctx.createBufferSource(); s.buffer = b; s.loop = true; return s;
    }
    function env(ctx, t, attack, peak, decay) {
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
        return g;
    }
    function osc(ctx, out, t, type, f0, f1, glide, g) {
        var o = ctx.createOscillator(); o.type = type;
        o.frequency.setValueAtTime(f0, t);
        if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + glide);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + 2);
        return o;
    }
    function burst(ctx, out, t, type, freq, q, g, dur) {
        var n = noise(ctx), f = ctx.createBiquadFilter();
        f.type = type; f.frequency.value = freq; f.Q.value = q;
        n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + dur);
    }

    var voices = {
        // Short pitched blip: detents, counters, detector hits.
        tick: function (ctx, out, t, o) { osc(ctx, out, t, o.type || 'triangle', o.freq || 880, 0, 0, env(ctx, t, 0.003, o.gain || 0.08, o.decay || 0.06)); },
        // A held note, for sonified values (the sorting race).
        tone: function (ctx, out, t, o) {
            var d = o.dur || 0.09;
            osc(ctx, out, t, o.type || 'triangle', o.freq || 440, 0, 0, env(ctx, t, 0.004, o.gain || 0.05, d));
        },
        click: function (ctx, out, t, o) { burst(ctx, out, t, 'highpass', o.freq || 3000, 0.7, env(ctx, t, 0.001, o.gain || 0.16, 0.018), 0.05); },
        // Heavy mechanical stop: a lever, a switch.
        thunk: function (ctx, out, t, o) {
            osc(ctx, out, t, 'sine', 150, 48, 0.16, env(ctx, t, 0.004, o.gain || 0.4, 0.24));
            burst(ctx, out, t, 'lowpass', 900, 0.8, env(ctx, t, 0.001, 0.2, 0.05), 0.08);
        },
        // Snap of a bond or a part locking in.
        pop: function (ctx, out, t, o) { osc(ctx, out, t, 'sine', o.from || 320, o.to || 1150, 0.045, env(ctx, t, 0.002, o.gain || 0.16, 0.08)); },
        // Crackling hiss, for a vigorous reaction; o.dur seconds.
        fizz: function (ctx, out, t, o) {
            var d = o.dur || 0.9, g = ctx.createGain(), n = noise(ctx), f = ctx.createBiquadFilter();
            f.type = 'bandpass'; f.frequency.value = o.freq || 4800; f.Q.value = 0.8;
            g.gain.setValueAtTime(0.0001, t);
            for (var k = 0; k * 0.018 < d; k++) g.gain.setValueAtTime((o.gain || 0.09) * (0.25 + Math.random() * 0.75) * Math.min(1, (d - k * 0.018) / 0.25), t + k * 0.018);
            g.gain.setValueAtTime(0.0001, t + d);
            n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + d + 0.05);
        },
        // Rising blips, for gas coming out of solution; o.n bubbles over o.dur.
        bubble: function (ctx, out, t, o) {
            var n = o.n || 7, d = o.dur || 0.8;
            for (var i = 0; i < n; i++) {
                var at = t + Math.random() * d, f = 380 + Math.random() * 520;
                osc(ctx, out, at, 'sine', f, f * 1.9, 0.05, env(ctx, at, 0.003, o.gain || 0.07, 0.06));
            }
        },
        // Sharp snap, for freezing or a crystal forming.
        crack: function (ctx, out, t, o) {
            burst(ctx, out, t, 'bandpass', 2200, 2.5, env(ctx, t, 0.001, o.gain || 0.3, 0.07), 0.1);
            osc(ctx, out, t, 'square', 2600, 900, 0.03, env(ctx, t, 0.001, 0.03, 0.04));
        },
        // Two-note bell: a goal reached (molecule named, race won).
        chime: function (ctx, out, t, o) {
            var f = o.freq || 660;
            [f, f * 1.5, f * 2].forEach(function (x, i) { osc(ctx, out, t + i * 0.07, 'sine', x, 0, 0, env(ctx, t + i * 0.07, 0.004, (o.gain || 0.07) / (1 + i * 0.4), 0.55)); });
        },
        // Low rumble that swells and fades, for a collision or a flame catching.
        boom: function (ctx, out, t, o) {
            var d = o.dur || 0.5;
            burst(ctx, out, t, 'lowpass', 220, 0.9, env(ctx, t, 0.01, o.gain || 0.35, d), d + 0.1);
            osc(ctx, out, t, 'sine', 90, 40, d, env(ctx, t, 0.005, (o.gain || 0.35) * 0.8, d * 0.8));
        },
    };

    function liveCtx() {
        if (muted()) return null;
        if (!live) {
            live = new (window.AudioContext || window.webkitAudioContext)();
            master = live.createGain(); master.gain.value = 0.9; master.connect(live.destination);
        }
        if (live.state === 'suspended') live.resume();
        return live;
    }

    window.SimFx = {
        // play('tick', { freq: 900, gap: 0.03 }): gap drops repeats of the same voice closer together than that many seconds.
        play: function (name, o) {
            o = o || {};
            var v = voices[name]; if (!v) return;
            var now = Date.now() / 1000, key = o.key || name;
            if (o.gap && last[key] && now - last[key] < o.gap) return;
            last[key] = now;
            if (window.__simfxRecord) { (window.__sfxLog = window.__sfxLog || []).push({ at: now + (o.delay || 0), name: name, o: o }); return; }
            var ctx = liveCtx(); if (!ctx) return;
            try { v(ctx, master, ctx.currentTime + 0.005 + (o.delay || 0), o); } catch (e) { }
        },
        // Registers an extra voice (ctx, out, t, o) from a lab's own script; it then plays and records like the built-in ones.
        addVoice: function (name, fn) { voices[name] = fn; },
        haptic: function (kind) { try { if (window.Haptics && window.Haptics[kind || 'light']) window.Haptics[kind || 'light'](); } catch (e) { } },
        // A felt and heard notch each time value crosses a multiple of step, as on a stepped dial.
        detent: function (key, value, step, freq) {
            var k = Math.floor(value / (step || 1));
            if (detents[key] === undefined) { detents[key] = k; return false; }
            if (detents[key] === k) return false;
            detents[key] = k;
            this.haptic('select'); this.play('tick', { freq: freq || 1400, gain: 0.05, decay: 0.03, key: 'detent-' + key });
            return true;
        },
        resetDetent: function (key) { delete detents[key]; },
        reducedMotion: reduced,
        // Re-runs a CSS animation class on an element (by id or element).
        pulse: function (el, cls) {
            el = typeof el === 'string' ? document.getElementById(el) : el;
            if (!el || reduced()) return;
            el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
        },
        // Counts an element's number from its current value to `to`.
        countTo: function (el, to, ms, decimals, prefix, suffix) {
            el = typeof el === 'string' ? document.getElementById(el) : el;
            if (!el) return;
            var fmt = function (x) { return (prefix || '') + x.toLocaleString('en-US', { minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0 }) + (suffix || ''); };
            var from = parseFloat((el.textContent || '').replace(/[^0-9.\-]/g, '')) || 0;
            if (reduced() || !ms) { el.textContent = fmt(to); return; }
            var t0 = performance.now();
            (function step(now) {
                var u = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - u, 3);
                el.textContent = fmt(from + (to - from) * e);
                if (u < 1) requestAnimationFrame(step);
            })(t0);
        },
        // Renders everything logged since t0 (seconds, Date.now() clock) into a mono 16-bit WAV, as base64. Used by record.mjs.
        renderLog: function (t0, secs) {
            var sr = 44100, log = window.__sfxLog || [];
            var oc = new OfflineAudioContext(1, Math.ceil((secs + 1) * sr), sr), out = oc.createGain();
            out.gain.value = 0.9; out.connect(oc.destination);
            log.forEach(function (e) { var t = e.at - t0; if (t >= 0 && t < secs) try { voices[e.name](oc, out, t, e.o); } catch (x) { } });
            return oc.startRendering().then(function (buf) {
                var d = buf.getChannelData(0), n = Math.ceil(secs * sr), b = new ArrayBuffer(44 + n * 2), v = new DataView(b);
                var w = function (o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
                w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
                v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
                w(36, 'data'); v.setUint32(40, n * 2, true);
                for (var i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i] || 0)) * 32767, true);
                var bytes = new Uint8Array(b), s = '';
                for (var j = 0; j < bytes.length; j += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(j, j + 0x8000));
                return btoa(s);
            });
        },
    };
})();
