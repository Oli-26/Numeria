// MathVoyager Canvas Visualization Engine
window.MathCanvas = {
    canvases: {},

    init: function (canvasId, width, height) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Logical drawing space stays (width × height) — all existing draw code
        // still uses these as coordinates. The bitmap is sized from the canvas's
        // actual CSS box at devicePixelRatio (with mild supersampling), and the
        // 2D context is transformed so logical → physical pixels stays crisp.
        canvas.style.aspectRatio = width + ' / ' + height;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.maxWidth = Math.round(width * 1.8) + 'px';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';

        var rect = canvas.getBoundingClientRect();
        var cssW = rect.width || width;
        var cssH = cssW * (height / width);

        var dpr = window.devicePixelRatio || 1;
        var ss = Math.max(dpr, 2); // supersample at least 2x even on low-DPR desktops
        var bw = Math.max(1, Math.round(cssW * ss));
        var bh = Math.max(1, Math.round(cssH * ss));
        canvas.width = bw;
        canvas.height = bh;

        var ctx = canvas.getContext('2d');
        ctx.setTransform(bw / width, 0, 0, bh / height, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        this.canvases[canvasId] = { canvas: canvas, ctx: ctx, width: width, height: height, dpr: ss, cssW: cssW, cssH: cssH };
        return true;
    },

    clear: function (canvasId) {
        var c = this.canvases[canvasId];
        if (!c) return;
        c.ctx.clearRect(0, 0, c.width, c.height);
    },

    drawAxes: function (canvasId, config) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;
        var cx = c.width / 2;
        var cy = c.height / 2;
        var scaleX = config.scaleX || 40;
        var scaleY = config.scaleY || 40;

        // Grid lines
        ctx.strokeStyle = 'rgba(74, 95, 224, 0.10)';
        ctx.lineWidth = 1.2;
        for (var x = cx % scaleX; x < c.width; x += scaleX) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke();
        }
        for (var y = cy % scaleY; y < c.height; y += scaleY) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(26, 26, 46, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(c.width, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, c.height); ctx.stroke();

        // Labels
        ctx.fillStyle = 'rgba(26, 26, 46, 0.6)';
        ctx.font = '600 13px system-ui';
        ctx.textAlign = 'center';
        var range = Math.floor(c.width / 2 / scaleX);
        for (var i = -range; i <= range; i++) {
            if (i === 0) continue;
            ctx.fillText(i, cx + i * scaleX, cy + 18);
        }
        var rangeY = Math.floor(c.height / 2 / scaleY);
        ctx.textAlign = 'right';
        for (var j = -rangeY; j <= rangeY; j++) {
            if (j === 0) continue;
            ctx.fillText(-j, cx - 8, cy + j * scaleY + 5);
        }
    },

    drawFunction: function (canvasId, points, color, lineWidth) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;

        ctx.strokeStyle = color || '#4A5FE0';
        ctx.lineWidth = lineWidth || 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        var first = true;
        for (var i = 0; i < points.length; i++) {
            var px = points[i][0];
            var py = points[i][1];
            if (isNaN(py) || !isFinite(py)) { first = true; continue; }
            if (first) { ctx.moveTo(px, py); first = false; }
            else { ctx.lineTo(px, py); }
        }
        ctx.stroke();
    },

    drawVector: function (canvasId, originX, originY, endX, endY, color, label) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;

        ctx.strokeStyle = color || '#4A5FE0';
        ctx.fillStyle = color || '#4A5FE0';
        ctx.lineWidth = 2.5;

        // Line
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        var angle = Math.atan2(endY - originY, endX - originX);
        var headLen = 12;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headLen * Math.cos(angle - 0.4), endY - headLen * Math.sin(angle - 0.4));
        ctx.lineTo(endX - headLen * Math.cos(angle + 0.4), endY - headLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();

        // Label
        if (label) {
            ctx.font = 'bold 14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(label, endX + 16 * Math.cos(angle + 0.5), endY + 16 * Math.sin(angle + 0.5));
        }
    },

    drawPoint: function (canvasId, x, y, radius, color, label) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;

        ctx.fillStyle = color || '#EF5350';
        ctx.beginPath();
        ctx.arc(x, y, radius || 5, 0, Math.PI * 2);
        ctx.fill();

        if (label) {
            ctx.font = '600 13px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y - 11);
        }
    },

    drawRect: function (canvasId, x, y, w, h, fillColor, strokeColor) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, y, w, h);
        }
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
        }
    },

    drawText: function (canvasId, text, x, y, color, fontSize, align) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;
        ctx.fillStyle = color || '#1A1A2E';
        ctx.font = '500 ' + (fontSize || 14) + 'px system-ui';
        ctx.textAlign = align || 'center';
        ctx.fillText(text, x, y);
    },

    // Draw a shape from a set of points (polygon)
    drawShape: function (canvasId, points, fillColor, strokeColor, lineWidth) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;

        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.closePath();

        if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
        if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth || 2; ctx.stroke(); }
    },

    drawGlowPath: function (canvasId, points, color, lineWidth, glowRadius, glowAlpha) {
        var c = this.canvases[canvasId];
        if (!c || !points || points.length < 2) return;
        var ctx = c.ctx;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        var passes = [
            { w: (lineWidth || 2) + (glowRadius || 8) * 1.4, a: (glowAlpha || 0.18) },
            { w: (lineWidth || 2) + (glowRadius || 8) * 0.8, a: (glowAlpha || 0.18) * 1.6 },
            { w: (lineWidth || 2) + (glowRadius || 8) * 0.3, a: (glowAlpha || 0.18) * 2.4 },
            { w: lineWidth || 2, a: 1 }
        ];
        for (var p = 0; p < passes.length; p++) {
            ctx.globalAlpha = Math.min(passes[p].a, 1);
            ctx.strokeStyle = color || '#4A5FE0';
            ctx.lineWidth = passes[p].w;
            ctx.beginPath();
            var first = true;
            for (var i = 0; i < points.length; i++) {
                var px = points[i][0], py = points[i][1];
                if (isNaN(py) || !isFinite(py)) { first = true; continue; }
                if (first) { ctx.moveTo(px, py); first = false; } else { ctx.lineTo(px, py); }
            }
            ctx.stroke();
        }
        ctx.restore();
    },

    drawGlowShape: function (canvasId, points, fillColor, strokeColor, lineWidth, glowRadius, glowAlpha) {
        var c = this.canvases[canvasId];
        if (!c || !points || points.length < 2) return;
        var ctx = c.ctx;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
            ctx.closePath();
            ctx.fill();
        }
        if (strokeColor) {
            var passes = [
                { w: (lineWidth || 2) + (glowRadius || 8) * 1.4, a: (glowAlpha || 0.18) },
                { w: (lineWidth || 2) + (glowRadius || 8) * 0.7, a: (glowAlpha || 0.18) * 1.6 },
                { w: lineWidth || 2, a: 1 }
            ];
            for (var p = 0; p < passes.length; p++) {
                ctx.globalAlpha = Math.min(passes[p].a, 1);
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = passes[p].w;
                ctx.beginPath();
                ctx.moveTo(points[0][0], points[0][1]);
                for (var k = 1; k < points.length; k++) ctx.lineTo(points[k][0], points[k][1]);
                ctx.closePath();
                ctx.stroke();
            }
        }
        ctx.restore();
    },

    drawRadialGlow: function (canvasId, x, y, innerR, outerR, color, alpha) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;
        ctx.save();
        var g = ctx.createRadialGradient(x, y, Math.max(innerR, 0), x, y, Math.max(outerR, innerR + 1));
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = alpha == null ? 1 : alpha;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, outerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawGradientFill: function (canvasId, points, x0, y0, x1, y1, stops) {
        var c = this.canvases[canvasId];
        if (!c || !points || points.length < 3) return;
        var ctx = c.ctx;
        ctx.save();
        var g = ctx.createLinearGradient(x0, y0, x1, y1);
        for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (var k = 1; k < points.length; k++) ctx.lineTo(points[k][0], points[k][1]);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    drawGlowPoint: function (canvasId, x, y, radius, color, glowColor, glowRadius) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;
        ctx.save();
        var gr = glowRadius || radius * 3;
        var g = ctx.createRadialGradient(x, y, 0, x, y, gr);
        g.addColorStop(0, glowColor || color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, gr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawRoundRect: function (canvasId, x, y, w, h, r, fillColor, strokeColor, lineWidth) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;
        var rad = Math.min(r || 4, w / 2, h / 2);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.lineTo(x + w - rad, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
        ctx.lineTo(x + w, y + h - rad);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
        ctx.lineTo(x + rad, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
        ctx.lineTo(x, y + rad);
        ctx.quadraticCurveTo(x, y, x + rad, y);
        ctx.closePath();
        if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
        if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth || 1; ctx.stroke(); }
        ctx.restore();
    },

    drawCanvasBackground: function (canvasId, stops) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;
        ctx.save();
        var g = ctx.createLinearGradient(0, 0, 0, c.height);
        for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.restore();
    },

    drawStarfield: function (canvasId, count, seed) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;
        ctx.save();
        var s = seed || 42;
        function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
        for (var i = 0; i < count; i++) {
            var x = rnd() * c.width;
            var y = rnd() * c.height * 0.85;
            var r = rnd() * 1.2 + 0.2;
            var a = rnd() * 0.6 + 0.2;
            ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    },

    drawDashedPath: function (canvasId, points, color, lineWidth, dashOn, dashOff) {
        var c = this.canvases[canvasId];
        if (!c || !points || points.length < 2) return;
        var ctx = c.ctx;
        ctx.save();
        ctx.setLineDash([dashOn || 4, dashOff || 4]);
        ctx.strokeStyle = color || '#888';
        ctx.lineWidth = lineWidth || 1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
        ctx.stroke();
        ctx.restore();
    },

    drawArc: function (canvasId, cx, cy, r, startAngle, endAngle, color, lineWidth) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;
        ctx.save();
        ctx.strokeStyle = color || '#888';
        ctx.lineWidth = lineWidth || 1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.stroke();
        ctx.restore();
    },

    drawCircleFill: function (canvasId, cx, cy, r, fillColor, strokeColor, lineWidth) {
        var c = this.canvases[canvasId];
        if (!c) return;
        var ctx = c.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
        if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth || 1; ctx.stroke(); }
        ctx.restore();
    },

    // Animate a value change (generic)
    animate: function (canvasId, dotNetRef, callbackMethod, fromVal, toVal, durationMs) {
        var start = performance.now();
        var c = this.canvases[canvasId];
        if (!c) return;

        function step(time) {
            var t = Math.min((time - start) / durationMs, 1);
            var eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
            var val = fromVal + (toVal - fromVal) * eased;
            dotNetRef.invokeMethodAsync(callbackMethod, val);
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    },

    // ── Interactive visualization framework ────────────────────────
    // Each interactive viz registers a state object on canvases[id].interactive
    // with shape: { rafId, listeners: [{el,type,fn}], extra }
    // dispose() cancels animation + removes listeners.

    startInteractive: function (canvasId, type, config) {
        this.dispose(canvasId);
        var c = this.canvases[canvasId];
        if (!c) return;
        c.interactive = { rafId: 0, listeners: [], state: {} };
        var fn = window.MathInteractive && window.MathInteractive[type];
        if (typeof fn === 'function') {
            try { fn(c, config || {}); } catch (e) { console.error('viz error', type, e); }
        }
    },

    dispose: function (canvasId) {
        var c = this.canvases[canvasId];
        if (!c || !c.interactive) return;
        var i = c.interactive;
        if (i.rafId) cancelAnimationFrame(i.rafId);
        if (i.listeners) {
            for (var k = 0; k < i.listeners.length; k++) {
                var L = i.listeners[k];
                try { L.el.removeEventListener(L.type, L.fn); } catch (e) {}
            }
        }
        c.interactive = null;
    },

    destroy: function (canvasId) {
        this.dispose(canvasId);
        delete this.canvases[canvasId];
    },

    // Managed window-level event listeners with DotNetObjectReference.
    // Stores handler references for proper cleanup.
    _windowListeners: {},

    addWindowListener: function (eventName, methodName, dotNetRef) {
        var key = eventName + ':' + methodName;
        if (this._windowListeners[key]) {
            window.removeEventListener(eventName, this._windowListeners[key]);
        }
        var handler = function (e) {
            dotNetRef.invokeMethodAsync(methodName, e.detail);
        };
        window.addEventListener(eventName, handler);
        this._windowListeners[key] = handler;
    },

    removeWindowListener: function (eventName, methodName) {
        var key = eventName + ':' + methodName;
        var handler = this._windowListeners[key];
        if (handler) {
            window.removeEventListener(eventName, handler);
            delete this._windowListeners[key];
        }
    }
};

// Helper used by interactive viz to register listeners + raf
window.MathInteractive = window.MathInteractive || {};
window.MathInteractive._addListener = function (c, el, type, fn, opts) {
    el.addEventListener(type, fn, opts);
    c.interactive.listeners.push({ el: el, type: type, fn: fn });
};
window.MathInteractive._raf = function (c, fn) {
    function loop(t) {
        if (!c.interactive) return;
        fn(t);
        c.interactive.rafId = requestAnimationFrame(loop);
    }
    c.interactive.rafId = requestAnimationFrame(loop);
};

// Convert pointer event to canvas-local logical coords (the same space we draw in)
// Drawing space is the W,H stored in canvases[id] (set by init). CSS may scale the
// canvas to a different on-screen size, so map by ratio.
window.MathInteractive._pos = function (canvas, ev) {
    var rect = canvas.getBoundingClientRect();
    var x, y;
    if (ev.touches && ev.touches.length) {
        x = ev.touches[0].clientX - rect.left;
        y = ev.touches[0].clientY - rect.top;
    } else if (ev.changedTouches && ev.changedTouches.length) {
        x = ev.changedTouches[0].clientX - rect.left;
        y = ev.changedTouches[0].clientY - rect.top;
    } else {
        x = ev.clientX - rect.left;
        y = ev.clientY - rect.top;
    }
    // Find the logical width we draw in (stored on init)
    var c = MathCanvas.canvases[canvas.id];
    var logicalW = c ? c.width : rect.width;
    var logicalH = c ? c.height : rect.height;
    var sx = rect.width ? logicalW / rect.width : 1;
    var sy = rect.height ? logicalH / rect.height : 1;
    return { x: x * sx, y: y * sy };
};

// ── Individual interactive visualizations ──────────────────────────

// 1. Projectile launcher with energy bars
window.MathInteractive['projectile-launcher'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.launchX = 40; s.launchY = H - 40;
    s.dragging = false; s.flying = false;
    s.proj = { x: s.launchX, y: s.launchY, vx: 0, vy: 0 };
    s.aim = { x: s.launchX + 60, y: s.launchY - 60 };
    s.g = 200; // px/s^2
    s.trail = [];
    s.E0 = 0;
    var lastT = performance.now();

    function reset() {
        s.flying = false;
        s.proj = { x: s.launchX, y: s.launchY, vx: 0, vy: 0 };
        s.trail = [];
    }
    function startDrag(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(c.canvas, ev);
        if (!s.flying) { s.dragging = true; s.aim = p; }
    }
    function moveDrag(ev) {
        if (!s.dragging) return;
        ev.preventDefault();
        s.aim = window.MathInteractive._pos(c.canvas, ev);
    }
    function endDrag(ev) {
        if (!s.dragging) return;
        s.dragging = false;
        var dx = s.launchX - s.aim.x;
        var dy = s.launchY - s.aim.y;
        var k = 2.0;
        s.proj.x = s.launchX; s.proj.y = s.launchY;
        s.proj.vx = dx * k; s.proj.vy = dy * k;
        s.flying = true;
        s.trail = [];
        var v2 = s.proj.vx * s.proj.vx + s.proj.vy * s.proj.vy;
        s.E0 = 0.5 * v2 + s.g * (H - s.launchY) * 1; // baseline
    }
    var canvas = c.canvas;
    var add = window.MathInteractive._addListener;
    add(c, canvas, 'mousedown', startDrag);
    add(c, canvas, 'mousemove', moveDrag);
    add(c, canvas, 'mouseup', endDrag);
    add(c, canvas, 'mouseleave', endDrag);
    add(c, canvas, 'touchstart', startDrag, { passive: false });
    add(c, canvas, 'touchmove', moveDrag, { passive: false });
    add(c, canvas, 'touchend', endDrag);

    window.MathInteractive._raf(c, function (t) {
        var dt = Math.min((t - lastT) / 1000, 0.033);
        lastT = t;
        if (s.flying) {
            s.proj.vy += s.g * dt;
            s.proj.x += s.proj.vx * dt;
            s.proj.y += s.proj.vy * dt;
            s.trail.push({ x: s.proj.x, y: s.proj.y });
            if (s.trail.length > 200) s.trail.shift();
            if (s.proj.y > H - 16 || s.proj.x > W + 8 || s.proj.x < -8) {
                s.flying = false;
                setTimeout(reset, 1200);
            }
        }
        // Render
        ctx.fillStyle = '#0c0e1a';
        ctx.fillRect(0, 0, W, H);
        // Ground
        ctx.fillStyle = 'rgba(74,95,224,0.15)';
        ctx.fillRect(0, H - 16, W, 16);
        // Trail
        ctx.strokeStyle = 'rgba(180,140,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var i = 0; i < s.trail.length; i++) {
            var p = s.trail[i];
            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        // Aim arrow
        if (!s.flying) {
            ctx.strokeStyle = '#ff8ec6';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(s.launchX, s.launchY);
            ctx.lineTo(s.aim.x, s.aim.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        // Projectile
        ctx.fillStyle = '#7eb4ff';
        ctx.beginPath();
        ctx.arc(s.proj.x, s.proj.y, 7, 0, Math.PI * 2);
        ctx.fill();
        // Launcher pad
        ctx.fillStyle = '#b48cff';
        ctx.fillRect(s.launchX - 12, s.launchY + 4, 24, 6);

        // Energy bars
        var v2 = s.proj.vx * s.proj.vx + s.proj.vy * s.proj.vy;
        var height = Math.max(0, H - 16 - s.proj.y);
        var KE = 0.5 * v2;
        var PE = s.g * height;
        var total = KE + PE;
        var maxE = Math.max(total, s.E0, 1);
        var barW = 14, barX = W - 50;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(barX, 30, barW, 100);
        ctx.fillRect(barX + 22, 30, barW, 100);
        ctx.fillStyle = '#7eb4ff';
        ctx.fillRect(barX, 130 - KE / maxE * 100, barW, KE / maxE * 100);
        ctx.fillStyle = '#ff8ec6';
        ctx.fillRect(barX + 22, 130 - PE / maxE * 100, barW, PE / maxE * 100);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('KE', barX + barW / 2, 142);
        ctx.fillText('PE', barX + 22 + barW / 2, 142);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('Drag to aim & launch', 10, 18);
        ctx.textAlign = 'right';
        ctx.fillText('Energy is conserved', W - 6, 18);
    });
};

// 2. Lens ray tracer (thin lens equation)
window.MathInteractive['lens-ray-tracer'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.cx = W / 2; s.cy = H / 2;
    s.f = 70;          // focal length (px)
    s.objX = 100;       // object distance from lens (px), positive to the left
    s.objH = 50;        // object height
    s.dragging = null;

    function obj() { return { x: s.cx - s.objX, y: s.cy - s.objH }; }

    function startDrag(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(c.canvas, ev);
        var o = obj();
        if (Math.hypot(p.x - o.x, p.y - o.y) < 22) s.dragging = 'obj';
        else if (Math.abs(p.y - s.cy) < 30 && Math.abs(p.x - (s.cx + s.f)) < 22) s.dragging = 'f';
    }
    function moveDrag(ev) {
        if (!s.dragging) return;
        ev.preventDefault();
        var p = window.MathInteractive._pos(c.canvas, ev);
        if (s.dragging === 'obj') {
            s.objX = Math.max(20, Math.min(W / 2 - 20, s.cx - p.x));
            s.objH = Math.max(10, Math.min(H / 2 - 30, s.cy - p.y));
        } else if (s.dragging === 'f') {
            s.f = Math.max(20, Math.min(W / 2 - 30, p.x - s.cx));
        }
    }
    function endDrag() { s.dragging = null; }
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    add(c, canvas, 'mousedown', startDrag);
    add(c, canvas, 'mousemove', moveDrag);
    add(c, canvas, 'mouseup', endDrag);
    add(c, canvas, 'touchstart', startDrag, { passive: false });
    add(c, canvas, 'touchmove', moveDrag, { passive: false });
    add(c, canvas, 'touchend', endDrag);

    window.MathInteractive._raf(c, function () {
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Optical axis
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(10, s.cy); ctx.lineTo(W - 10, s.cy); ctx.stroke();
        // Lens
        ctx.strokeStyle = '#7eb4ff'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(s.cx, s.cy, 6, H / 2 - 20, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Foci
        ctx.fillStyle = '#ff8ec6';
        ctx.beginPath(); ctx.arc(s.cx + s.f, s.cy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(s.cx - s.f, s.cy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('F', s.cx + s.f, s.cy + 14);
        ctx.fillText('F', s.cx - s.f, s.cy + 14);

        // Object (arrow)
        var o = obj();
        ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(o.x, s.cy); ctx.lineTo(o.x, o.y); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(o.x - 5, o.y + 8);
        ctx.lineTo(o.x + 5, o.y + 8);
        ctx.closePath(); ctx.fillStyle = '#b48cff'; ctx.fill();

        // Thin lens equation: 1/do + 1/di = 1/f
        var doD = s.objX, fD = s.f;
        var di = (doD === fD) ? Infinity : (doD * fD) / (doD - fD);
        var M = -di / doD;       // magnification
        var imgX = s.cx + di;
        var imgH = s.objH * M;   // negative = inverted
        var imgY = s.cy - imgH;

        // Ray 1: parallel from object top → through F on far side
        ctx.strokeStyle = 'rgba(255,142,198,0.7)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(s.cx, o.y);
        ctx.lineTo(s.cx + s.f * 5, o.y + (s.cy - o.y) * 5);
        ctx.stroke();
        // Ray 2: through center, undeviated
        ctx.strokeStyle = 'rgba(126,180,255,0.7)';
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        var slope = (s.cy - o.y) / (s.cx - o.x);
        ctx.lineTo(W - 10, o.y + slope * (W - 10 - o.x));
        ctx.stroke();
        // Ray 3: through near F → out parallel
        ctx.strokeStyle = 'rgba(180,140,255,0.7)';
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        var slope3 = (s.cy - o.y) / ((s.cx - s.f) - o.x);
        var hitY = o.y + slope3 * (s.cx - o.x);
        ctx.lineTo(s.cx, hitY);
        ctx.lineTo(W - 10, hitY);
        ctx.stroke();

        // Image
        if (isFinite(di) && imgX > 10 && imgX < W - 10) {
            var col = di > 0 ? '#ffd166' : 'rgba(255,209,102,0.4)'; // virtual is faded
            ctx.strokeStyle = col; ctx.lineWidth = 2.5;
            if (di < 0) ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(imgX, s.cy); ctx.lineTo(imgX, imgY); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(imgX, imgY);
            ctx.lineTo(imgX - 5, imgY + (imgH > 0 ? 8 : -8));
            ctx.lineTo(imgX + 5, imgY + (imgH > 0 ? 8 : -8));
            ctx.closePath(); ctx.fillStyle = col; ctx.fill();
            ctx.setLineDash([]);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('Drag arrow & focal point', 8, 16);
        ctx.textAlign = 'right';
        var info = 'do=' + doD.toFixed(0) + '  f=' + fD.toFixed(0) +
                   '  di=' + (isFinite(di) ? di.toFixed(0) : '∞') +
                   '  M=' + M.toFixed(2);
        ctx.fillText(info, W - 8, H - 8);
    });
};

// 3. Particle in a box: standing waves
window.MathInteractive['particle-in-box'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.n = 1;
    var t0 = performance.now();
    var L = W - 60, x0 = 30, yMid = H / 2;

    function setN(n) { s.n = n; }
    var btnHit = function (p) {
        for (var i = 0; i < 6; i++) {
            var bx = 8 + i * 32, by = H - 32;
            if (p.x >= bx && p.x <= bx + 28 && p.y >= by && p.y <= by + 24) return i + 1;
        }
        return 0;
    };
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        var k = btnHit(p);
        if (k) setN(k);
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    window.MathInteractive._raf(c, function (t) {
        var dt = (t - t0) / 1000;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Box walls
        ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, 30); ctx.lineTo(x0, H - 50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0 + L, 30); ctx.lineTo(x0 + L, H - 50); ctx.stroke();
        // Axis
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0, yMid); ctx.lineTo(x0 + L, yMid); ctx.stroke();

        // Wavefunction ψ_n(x) = sin(nπx/L), oscillates with energy E_n ∝ n²
        var omega = s.n * s.n * 1.5;
        var phase = Math.cos(omega * dt);
        var amp = (H / 2 - 60) * 0.8;
        // Probability density |ψ|² (constant in time for stationary states)
        ctx.fillStyle = 'rgba(126,180,255,0.18)';
        ctx.beginPath();
        ctx.moveTo(x0, yMid);
        for (var i = 0; i <= 200; i++) {
            var xn = i / 200;
            var px = x0 + xn * L;
            var psi = Math.sin(s.n * Math.PI * xn);
            var py = yMid - amp * psi * psi;
            ctx.lineTo(px, py);
        }
        ctx.lineTo(x0 + L, yMid); ctx.closePath(); ctx.fill();
        // Wavefunction itself (oscillating sign)
        ctx.strokeStyle = '#ff8ec6'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (var j = 0; j <= 200; j++) {
            var xn2 = j / 200;
            var px2 = x0 + xn2 * L;
            var psi2 = Math.sin(s.n * Math.PI * xn2) * phase;
            var py2 = yMid - amp * psi2;
            if (j === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
        }
        ctx.stroke();

        // Buttons
        for (var b = 0; b < 6; b++) {
            var bx = 8 + b * 32, by = H - 32, k = b + 1;
            ctx.fillStyle = (k === s.n) ? '#7eb4ff' : 'rgba(255,255,255,0.08)';
            ctx.fillRect(bx, by, 28, 24);
            ctx.fillStyle = (k === s.n) ? '#0c0e1a' : 'rgba(255,255,255,0.7)';
            ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            ctx.fillText('n=' + k, bx + 14, by + 16);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('ψ_n(x) = √(2/L) sin(nπx/L)', 8, 16);
        ctx.textAlign = 'right';
        ctx.fillText('E_n ∝ n² = ' + (s.n * s.n), W - 8, 16);
    });
};

// 4. Maxwell's demon
window.MathInteractive['maxwell-demon'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.demonOn = false;
    s.measureCost = 0;
    s.particles = [];
    s.gateOpen = false;
    var holeY = H / 2, holeH = 24;
    for (var i = 0; i < 60; i++) {
        var fast = Math.random() < 0.5;
        s.particles.push({
            x: Math.random() * (W - 40) + 20,
            y: Math.random() * (H - 60) + 30,
            vx: (Math.random() - 0.5) * (fast ? 220 : 80),
            vy: (Math.random() - 0.5) * (fast ? 220 : 80)
        });
    }
    var lastT = performance.now();
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 40 && p.x < W / 2) s.demonOn = !s.demonOn;
        if (p.y > H - 40 && p.x > W / 2) {
            // reset
            s.particles.length = 0;
            for (var i = 0; i < 60; i++) {
                var fast = Math.random() < 0.5;
                s.particles.push({
                    x: Math.random() * (W - 40) + 20,
                    y: Math.random() * (H - 60) + 30,
                    vx: (Math.random() - 0.5) * (fast ? 220 : 80),
                    vy: (Math.random() - 0.5) * (fast ? 220 : 80)
                });
            }
            s.measureCost = 0;
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    window.MathInteractive._raf(c, function (t) {
        var dt = Math.min((t - lastT) / 1000, 0.05); lastT = t;
        var midX = W / 2;
        for (var i = 0; i < s.particles.length; i++) {
            var p = s.particles[i];
            p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.x < 14) { p.x = 14; p.vx = -p.vx; }
            if (p.x > W - 14) { p.x = W - 14; p.vx = -p.vx; }
            if (p.y < 24) { p.y = 24; p.vy = -p.vy; }
            if (p.y > H - 50) { p.y = H - 50; p.vy = -p.vy; }
            // Wall in middle with hole
            var crossing = (p.x > midX - 4 && p.x < midX + 4 && p.vx > 0) ||
                           (p.x > midX - 4 && p.x < midX + 4 && p.vx < 0);
            if (Math.abs(p.x - midX) < 4) {
                var inHole = Math.abs(p.y - holeY) < holeH;
                if (inHole) {
                    var speed = Math.hypot(p.vx, p.vy);
                    var fast = speed > 150;
                    var goingRight = p.vx > 0;
                    var allow = !s.demonOn || (goingRight ? fast : !fast);
                    if (!allow) { p.vx = -p.vx; }
                    else if (s.demonOn) s.measureCost += 0.05;
                } else {
                    p.vx = -p.vx;
                }
            }
        }
        // Draw
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Wall
        ctx.fillStyle = 'rgba(180,140,255,0.4)';
        ctx.fillRect(midX - 2, 24, 4, holeY - holeH - 24);
        ctx.fillRect(midX - 2, holeY + holeH, 4, H - 50 - (holeY + holeH));
        // Particles
        for (var k = 0; k < s.particles.length; k++) {
            var pk = s.particles[k];
            var sp = Math.hypot(pk.vx, pk.vy);
            var col = sp > 150 ? '#ff8ec6' : '#7eb4ff';
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(pk.x, pk.y, 4, 0, Math.PI * 2); ctx.fill();
        }
        // Compute side stats
        var leftHot = 0, leftCold = 0, rightHot = 0, rightCold = 0;
        for (var m = 0; m < s.particles.length; m++) {
            var pm = s.particles[m];
            var hot = Math.hypot(pm.vx, pm.vy) > 150;
            if (pm.x < midX) (hot ? leftHot++ : leftCold++);
            else (hot ? rightHot++ : rightCold++);
        }
        // Buttons
        ctx.fillStyle = s.demonOn ? '#7eb4ff' : 'rgba(255,255,255,0.1)';
        ctx.fillRect(8, H - 36, W / 2 - 16, 28);
        ctx.fillStyle = s.demonOn ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(s.demonOn ? 'Demon ON' : 'Demon OFF (tap)', W / 4, H - 18);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(W / 2 + 8, H - 36, W / 2 - 16, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('Reset', W * 0.75, H - 18);

        // Stats
        ctx.font = '10px system-ui'; ctx.textAlign = 'left';
        ctx.fillStyle = '#ff8ec6';
        ctx.fillText('hot ' + leftHot, 6, 14);
        ctx.fillStyle = '#7eb4ff';
        ctx.fillText('cold ' + leftCold, 6, 26);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ff8ec6';
        ctx.fillText('hot ' + rightHot, W - 6, 14);
        ctx.fillStyle = '#7eb4ff';
        ctx.fillText('cold ' + rightCold, W - 6, 26);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('measure cost ≈ ' + s.measureCost.toFixed(1) + ' kT bits', W / 2, 18);
    });
};

// 5. Atomic orbitals
window.MathInteractive['atomic-orbitals'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.orbital = '1s';
    var orbitals = ['1s', '2s', '2p', '3p', '3d'];
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        for (var i = 0; i < orbitals.length; i++) {
            var bx = 6 + i * (W / 5), by = H - 30;
            if (p.x >= bx && p.x <= bx + W / 5 - 4 && p.y >= by && p.y <= by + 24) {
                s.orbital = orbitals[i];
            }
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    function densityAt(x, y, kind) {
        var r = Math.hypot(x, y);
        if (kind === '1s') return Math.exp(-r * 0.05);
        if (kind === '2s') {
            var u = r * 0.04;
            var node = (1 - u);
            return node * node * Math.exp(-u);
        }
        if (kind === '2p') {
            var u2 = r * 0.04;
            return Math.pow(y, 2) * 0.0005 * Math.exp(-u2);
        }
        if (kind === '3p') {
            var u3 = r * 0.025;
            var node3 = (1 - u3 * 0.5);
            return Math.pow(y, 2) * 0.0005 * node3 * node3 * Math.exp(-u3);
        }
        if (kind === '3d') {
            var theta = Math.atan2(y, x);
            return Math.pow(Math.cos(2 * theta), 2) * Math.exp(-r * 0.025) * (r * 0.03);
        }
        return 0;
    }

    var lastT = 0;
    window.MathInteractive._raf(c, function (t) {
        if (t - lastT < 50) return; // throttle
        lastT = t;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var cx = W / 2, cy = (H - 30) / 2;
        var step = 4;
        for (var py = 0; py < H - 30; py += step) {
            for (var px = 0; px < W; px += step) {
                var x = px - cx, y = py - cy;
                var d = densityAt(x, y, s.orbital);
                if (d > 0.005) {
                    var alpha = Math.min(1, d * 4);
                    ctx.fillStyle = 'rgba(180,140,255,' + alpha + ')';
                    ctx.fillRect(px, py, step, step);
                }
            }
        }
        // Nucleus
        ctx.fillStyle = '#ff8ec6';
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
        // Buttons
        for (var i = 0; i < orbitals.length; i++) {
            var bx = 6 + i * (W / 5), by = H - 30;
            var bw = W / 5 - 4;
            ctx.fillStyle = (orbitals[i] === s.orbital) ? '#7eb4ff' : 'rgba(255,255,255,0.08)';
            ctx.fillRect(bx, by, bw, 24);
            ctx.fillStyle = (orbitals[i] === s.orbital) ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(orbitals[i], bx + bw / 2, by + 16);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('Electron probability cloud', 6, 14);
    });
};

// 6. Periodic trends heatmap
window.MathInteractive['periodic-trends'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.prop = 'electronegativity';
    // Periodic table (first 4 rows, simplified placement). Each entry: [symbol, group(1-18), period(1-4), Z, EN, IE(eV), radius(pm)]
    var elements = [
        ['H',1,1,1,2.20,13.6,53],['He',18,1,2,0,24.6,31],
        ['Li',1,2,3,0.98,5.4,167],['Be',2,2,4,1.57,9.3,112],
        ['B',13,2,5,2.04,8.3,87],['C',14,2,6,2.55,11.3,67],['N',15,2,7,3.04,14.5,56],
        ['O',16,2,8,3.44,13.6,48],['F',17,2,9,3.98,17.4,42],['Ne',18,2,10,0,21.6,38],
        ['Na',1,3,11,0.93,5.1,190],['Mg',2,3,12,1.31,7.6,145],
        ['Al',13,3,13,1.61,6.0,118],['Si',14,3,14,1.90,8.2,111],['P',15,3,15,2.19,10.5,98],
        ['S',16,3,16,2.58,10.4,88],['Cl',17,3,17,3.16,13.0,79],['Ar',18,3,18,0,15.8,71],
        ['K',1,4,19,0.82,4.3,243],['Ca',2,4,20,1.00,6.1,194],
        ['Ga',13,4,31,1.81,6.0,136],['Ge',14,4,32,2.01,7.9,125],['As',15,4,33,2.18,9.8,114],
        ['Se',16,4,34,2.55,9.8,103],['Br',17,4,35,2.96,11.8,94],['Kr',18,4,36,3.00,14.0,88]
    ];
    var props = [
        { key: 'electronegativity', label: 'EN', idx: 4, max: 4 },
        { key: 'ionization', label: 'IE', idx: 5, max: 25 },
        { key: 'radius', label: 'Radius', idx: 6, max: 250 }
    ];
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        for (var i = 0; i < props.length; i++) {
            var bx = 6 + i * (W / 3), by = H - 26, bw = W / 3 - 4;
            if (p.x >= bx && p.x <= bx + bw && p.y >= by && p.y <= by + 22) s.prop = props[i].key;
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    var lastT = 0;
    window.MathInteractive._raf(c, function (t) {
        if (t - lastT < 80) return; lastT = t;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var cellW = (W - 16) / 18;
        var cellH = (H - 50) / 4;
        var prop = props.find(function (p) { return p.key === s.prop; });
        for (var i = 0; i < elements.length; i++) {
            var e = elements[i];
            var g = e[1], pd = e[2], val = e[prop.idx];
            var x = 8 + (g - 1) * cellW;
            var y = 4 + (pd - 1) * cellH;
            var ratio = Math.min(1, val / prop.max);
            // Color: low → blue, high → magenta
            var r = Math.round(126 + ratio * (255 - 126));
            var g2 = Math.round(180 - ratio * (180 - 142));
            var b = Math.round(255 - ratio * (255 - 198));
            ctx.fillStyle = 'rgb(' + r + ',' + g2 + ',' + b + ')';
            ctx.fillRect(x, y, cellW - 2, cellH - 2);
            ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(e[0], x + cellW / 2, y + cellH / 2);
            ctx.font = '8px system-ui';
            ctx.fillText(val.toFixed(1), x + cellW / 2, y + cellH / 2 + 10);
        }
        // Buttons
        for (var b2 = 0; b2 < props.length; b2++) {
            var bx = 6 + b2 * (W / 3), by = H - 26, bw = W / 3 - 4;
            ctx.fillStyle = (props[b2].key === s.prop) ? '#7eb4ff' : 'rgba(255,255,255,0.08)';
            ctx.fillRect(bx, by, bw, 22);
            ctx.fillStyle = (props[b2].key === s.prop) ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(props[b2].label, bx + bw / 2, by + 15);
        }
    });
};

// 7. Cell anatomy (clickable parts)
window.MathInteractive['cell-anatomy'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.selected = null;
    var parts = [
        { id: 'membrane', label: 'Cell Membrane', desc: 'Phospholipid bilayer; selective barrier.', shape: 'border' },
        { id: 'nucleus', label: 'Nucleus', desc: 'Houses DNA; controls gene expression.', x: 0.55, y: 0.5, r: 35 },
        { id: 'mito', label: 'Mitochondrion', desc: 'Powerhouse — makes ATP via respiration.', x: 0.25, y: 0.35, r: 18 },
        { id: 'mito2', label: 'Mitochondrion', desc: 'Powerhouse — makes ATP via respiration.', x: 0.75, y: 0.7, r: 18 },
        { id: 'er', label: 'Endoplasmic Reticulum', desc: 'Folds proteins (rough) and lipids (smooth).', x: 0.4, y: 0.3, r: 14 },
        { id: 'golgi', label: 'Golgi Apparatus', desc: 'Sorts and packages proteins for export.', x: 0.3, y: 0.7, r: 14 },
        { id: 'ribo', label: 'Ribosome', desc: 'Synthesizes proteins from mRNA.', x: 0.65, y: 0.25, r: 6 },
        { id: 'lyso', label: 'Lysosome', desc: 'Digestive enzymes; recycles waste.', x: 0.8, y: 0.4, r: 8 }
    ];
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        s.selected = null;
        for (var i = parts.length - 1; i >= 0; i--) {
            var pt = parts[i];
            if (pt.shape === 'border') continue;
            var px = pt.x * W, py = pt.y * (H - 60) + 10;
            if (Math.hypot(p.x - px, p.y - py) < pt.r + 6) { s.selected = pt; return; }
        }
        // Border tap
        var cx = W / 2, cy = (H - 60) / 2 + 10, ra = W * 0.45, rb = (H - 60) * 0.45;
        var dx = (p.x - cx) / ra, dy = (p.y - cy) / rb;
        if (dx * dx + dy * dy > 0.75 && dx * dx + dy * dy < 1.15) {
            s.selected = parts[0];
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    var lastT = 0;
    window.MathInteractive._raf(c, function (t) {
        if (t - lastT < 50) return; lastT = t;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var cx = W / 2, cy = (H - 60) / 2 + 10, ra = W * 0.45, rb = (H - 60) * 0.45;
        // Cytoplasm
        ctx.fillStyle = 'rgba(126,180,255,0.12)';
        ctx.beginPath(); ctx.ellipse(cx, cy, ra, rb, 0, 0, Math.PI * 2); ctx.fill();
        // Membrane
        ctx.strokeStyle = (s.selected && s.selected.id === 'membrane') ? '#ff8ec6' : '#b48cff';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(cx, cy, ra, rb, 0, 0, Math.PI * 2); ctx.stroke();
        // Organelles
        for (var i = 1; i < parts.length; i++) {
            var pt = parts[i];
            var px = pt.x * W, py = pt.y * (H - 60) + 10;
            var sel = s.selected && s.selected === pt;
            if (pt.id === 'nucleus') {
                ctx.fillStyle = sel ? '#ff8ec6' : 'rgba(180,140,255,0.5)';
                ctx.beginPath(); ctx.arc(px, py, pt.r, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 2; ctx.stroke();
                // Nucleolus
                ctx.fillStyle = '#7b4dff';
                ctx.beginPath(); ctx.arc(px + 6, py - 4, 6, 0, Math.PI * 2); ctx.fill();
            } else if (pt.id.indexOf('mito') === 0) {
                ctx.fillStyle = sel ? '#ff8ec6' : '#ffd166';
                ctx.beginPath(); ctx.ellipse(px, py, pt.r, pt.r * 0.55, 0.4, 0, Math.PI * 2); ctx.fill();
            } else if (pt.id === 'er') {
                ctx.strokeStyle = sel ? '#ff8ec6' : '#7eb4ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (var k = 0; k < 5; k++) {
                    ctx.moveTo(px - 25, py - 10 + k * 5);
                    ctx.bezierCurveTo(px - 10, py - 14 + k * 5, px + 10, py - 6 + k * 5, px + 25, py - 10 + k * 5);
                }
                ctx.stroke();
            } else if (pt.id === 'golgi') {
                ctx.strokeStyle = sel ? '#ff8ec6' : '#a3e4d7';
                ctx.lineWidth = 2;
                for (var g = 0; g < 4; g++) {
                    ctx.beginPath();
                    ctx.arc(px, py + g * 4 - 6, 16 - g * 2, Math.PI * 0.1, Math.PI * 0.9);
                    ctx.stroke();
                }
            } else {
                ctx.fillStyle = sel ? '#ff8ec6' : '#76d7c4';
                ctx.beginPath(); ctx.arc(px, py, pt.r, 0, Math.PI * 2); ctx.fill();
            }
        }
        // Info panel
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, H - 50, W, 50);
        ctx.fillStyle = '#ff8ec6'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
        if (s.selected) {
            ctx.fillText(s.selected.label, 8, H - 32);
            ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '11px system-ui';
            ctx.fillText(s.selected.desc, 8, H - 14);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '11px system-ui';
            ctx.fillText('Tap an organelle to learn what it does.', 8, H - 24);
        }
    });
};

// 8. Punnett square animator
window.MathInteractive['punnett-square'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.p1 = ['A', 'a']; s.p2 = ['A', 'a'];
    s.offspring = []; // animate filling
    s.tally = { 'AA': 0, 'Aa': 0, 'aa': 0 };
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    var p1Opts = [['A','A'], ['A','a'], ['a','a']];
    var p2Opts = [['A','A'], ['A','a'], ['a','a']];
    var p1Idx = 1, p2Idx = 1;
    function genotypeKey(a, b) {
        var both = (a + b).split('').sort(function (x, y) {
            return x === y ? 0 : (x === 'A' ? -1 : 1);
        }).join('');
        return both;
    }
    function spawn() {
        var a = s.p1[Math.floor(Math.random() * 2)];
        var b = s.p2[Math.floor(Math.random() * 2)];
        var key = genotypeKey(a, b);
        s.tally[key] = (s.tally[key] || 0) + 1;
        s.offspring.push({ a: a, b: b, t: 0 });
    }
    function reset() {
        s.tally = { 'AA': 0, 'Aa': 0, 'aa': 0 };
        s.offspring = [];
    }
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        // Top buttons: parent selection
        if (p.y < 28) {
            if (p.x < W / 2) { p1Idx = (p1Idx + 1) % 3; s.p1 = p1Opts[p1Idx]; reset(); }
            else { p2Idx = (p2Idx + 1) % 3; s.p2 = p2Opts[p2Idx]; reset(); }
            return;
        }
        // Bottom buttons
        if (p.y > H - 30) {
            if (p.x < W / 2) {
                for (var i = 0; i < 8; i++) spawn();
            } else reset();
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = (t - lastT) / 1000; lastT = t;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Top buttons
        ctx.fillStyle = 'rgba(126,180,255,0.18)'; ctx.fillRect(4, 4, W / 2 - 8, 24);
        ctx.fillRect(W / 2 + 4, 4, W / 2 - 8, 24);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('Parent 1: ' + s.p1.join('') + ' (tap)', W / 4, 20);
        ctx.fillText('Parent 2: ' + s.p2.join('') + ' (tap)', W * 0.75, 20);

        // 2x2 grid
        var gx = 30, gy = 40, gs = Math.min(W - 60, H - 110) / 2;
        ctx.font = 'bold 14px system-ui';
        ctx.fillStyle = '#7eb4ff'; ctx.textAlign = 'center';
        ctx.fillText(s.p2[0], gx + gs * 0.5, gy - 6);
        ctx.fillText(s.p2[1], gx + gs * 1.5, gy - 6);
        ctx.fillText(s.p1[0], gx - 12, gy + gs * 0.5 + 5);
        ctx.fillText(s.p1[1], gx - 12, gy + gs * 1.5 + 5);
        for (var r = 0; r < 2; r++) {
            for (var c2 = 0; c2 < 2; c2++) {
                var key = genotypeKey(s.p1[r], s.p2[c2]);
                ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 1.5;
                ctx.strokeRect(gx + c2 * gs, gy + r * gs, gs, gs);
                ctx.fillStyle = (key === 'aa') ? '#ff8ec6' : '#7eb4ff';
                ctx.font = 'bold 18px system-ui';
                ctx.fillText(key, gx + c2 * gs + gs / 2, gy + r * gs + gs / 2 + 6);
            }
        }
        // Offspring animation column on right
        var col = gx + gs * 2 + 16;
        var avail = W - col - 8;
        if (avail > 30) {
            ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
            ctx.fillText('Offspring:', col, gy + 6);
            for (var i = 0; i < s.offspring.length; i++) {
                var o = s.offspring[i];
                o.t = Math.min(1, o.t + dt * 4);
                var py = gy + 16 + i * 14;
                if (py > H - 40) break;
                var key2 = genotypeKey(o.a, o.b);
                ctx.fillStyle = (key2 === 'aa') ? '#ff8ec6' : '#7eb4ff';
                ctx.globalAlpha = o.t;
                ctx.fillText(key2, col, py);
                ctx.globalAlpha = 1;
            }
        }
        // Bottom: tally + buttons
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
        var total = s.tally.AA + s.tally.Aa + s.tally.aa;
        var line = 'AA:' + s.tally.AA + '  Aa:' + s.tally.Aa + '  aa:' + s.tally.aa;
        if (total) line += '  (' + total + ')';
        ctx.fillText(line, 8, H - 38);

        ctx.fillStyle = 'rgba(126,180,255,0.18)'; ctx.fillRect(4, H - 28, W / 2 - 8, 24);
        ctx.fillRect(W / 2 + 4, H - 28, W / 2 - 8, 24);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('+ 8 offspring', W / 4, H - 12);
        ctx.fillText('Reset', W * 0.75, H - 12);
    });
};

// 9. Genetic drift (Wright-Fisher)
window.MathInteractive['genetic-drift'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.popN = 30;
    s.runs = [];
    s.gen = 0;
    s.maxGen = 80;
    s.running = false;
    var lineCount = 6;

    function newRun() {
        s.runs = [];
        for (var i = 0; i < lineCount; i++) s.runs.push([0.5]);
        s.gen = 0;
    }
    newRun();

    function step() {
        if (s.gen >= s.maxGen) { s.running = false; return; }
        for (var i = 0; i < s.runs.length; i++) {
            var r = s.runs[i], p = r[r.length - 1];
            if (p === 0 || p === 1) { r.push(p); continue; }
            // sample N alleles binomially
            var k = 0;
            for (var n = 0; n < s.popN; n++) if (Math.random() < p) k++;
            r.push(k / s.popN);
        }
        s.gen++;
    }
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 30) {
            if (p.x < W / 3) { s.popN = 10; newRun(); s.running = true; }
            else if (p.x < 2 * W / 3) { s.popN = 30; newRun(); s.running = true; }
            else { s.popN = 100; newRun(); s.running = true; }
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    var stepTimer = 0, lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = (t - lastT) / 1000; lastT = t;
        if (s.running) {
            stepTimer += dt;
            while (stepTimer > 0.06) { step(); stepTimer -= 0.06; }
        }
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Axes
        var pad = 24, plotH = H - 50 - pad;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + plotH); ctx.lineTo(W - 10, pad + plotH); ctx.stroke();
        // Lines
        var palette = ['#7eb4ff', '#ff8ec6', '#b48cff', '#ffd166', '#76d7c4', '#a3e4d7'];
        for (var i = 0; i < s.runs.length; i++) {
            var r = s.runs[i];
            ctx.strokeStyle = palette[i % palette.length]; ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (var g = 0; g < r.length; g++) {
                var px = pad + (g / s.maxGen) * (W - pad - 10);
                var py = pad + (1 - r[g]) * plotH;
                if (g === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
        ctx.fillText('p=1', pad - 4, pad + 4);
        ctx.fillText('0.5', pad - 4, pad + plotH / 2 + 4);
        ctx.fillText('0', pad - 4, pad + plotH + 4);
        ctx.textAlign = 'center';
        ctx.fillText('generation →', W / 2, H - 36);
        // Buttons
        var labels = ['N=10', 'N=30', 'N=100'];
        for (var b = 0; b < 3; b++) {
            var bx = b * (W / 3) + 4, by = H - 26, bw = W / 3 - 8;
            ctx.fillStyle = (s.popN === [10,30,100][b]) ? '#7eb4ff' : 'rgba(255,255,255,0.08)';
            ctx.fillRect(bx, by, bw, 22);
            ctx.fillStyle = (s.popN === [10,30,100][b]) ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(labels[b], bx + bw / 2, by + 15);
        }
        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('Allele frequency drift (gen ' + s.gen + ')', 6, 14);
    });
};

// 10. Predator-prey (Lotka-Volterra)
window.MathInteractive['predator-prey'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.alpha = 1.0; s.beta = 0.5; s.gamma = 0.5; s.delta = 0.4;
    s.x = 1.5; s.y = 1.0; // prey, predator
    s.history = [];
    var lastT = performance.now();
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 32) {
            // 4 sliders/buttons across the bottom
            var which = Math.floor(p.x / (W / 4));
            // toggle between two presets
            if (which === 0) s.alpha = (s.alpha > 1.0) ? 0.7 : 1.4;
            else if (which === 1) s.beta = (s.beta > 0.5) ? 0.3 : 0.8;
            else if (which === 2) s.gamma = (s.gamma > 0.5) ? 0.3 : 0.8;
            else s.delta = (s.delta > 0.4) ? 0.25 : 0.6;
            s.history = [];
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    window.MathInteractive._raf(c, function (t) {
        var dt = Math.min((t - lastT) / 1000, 0.04); lastT = t;
        // Lotka-Volterra: dx/dt = αx − βxy ; dy/dt = δxy − γy
        var dx = (s.alpha * s.x - s.beta * s.x * s.y) * dt;
        var dy = (s.delta * s.x * s.y - s.gamma * s.y) * dt;
        s.x = Math.max(0.01, s.x + dx);
        s.y = Math.max(0.01, s.y + dy);
        s.history.push({ x: s.x, y: s.y });
        if (s.history.length > 600) s.history.shift();

        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Two panels: time series (left) and phase plot (right)
        var midX = W / 2 - 4;
        // Left axes
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, 8); ctx.lineTo(20, H - 36); ctx.lineTo(midX - 2, H - 36); ctx.stroke();
        // Find scale
        var maxV = 0.5;
        for (var i = 0; i < s.history.length; i++) {
            if (s.history[i].x > maxV) maxV = s.history[i].x;
            if (s.history[i].y > maxV) maxV = s.history[i].y;
        }
        // Draw time series
        function plotLine(arr, key, color) {
            ctx.strokeStyle = color; ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (var i = 0; i < arr.length; i++) {
                var px = 20 + (i / 600) * (midX - 22);
                var py = (H - 36) - (arr[i][key] / maxV) * (H - 44);
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        plotLine(s.history, 'x', '#7eb4ff');
        plotLine(s.history, 'y', '#ff8ec6');
        // Phase plot
        var rx = midX + 8, ry = 8, rW = W - rx - 6, rH = H - 44;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.moveTo(rx, ry + rH); ctx.lineTo(rx + rW, ry + rH); ctx.moveTo(rx, ry); ctx.lineTo(rx, ry + rH); ctx.stroke();
        ctx.strokeStyle = 'rgba(180,140,255,0.4)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (var k = 0; k < s.history.length; k++) {
            var h = s.history[k];
            var px = rx + (h.x / maxV) * rW;
            var py = ry + rH - (h.y / maxV) * rH;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = '#ff8ec6';
        var hx = rx + (s.x / maxV) * rW, hy = ry + rH - (s.y / maxV) * rH;
        ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();

        // Labels
        ctx.font = '10px system-ui'; ctx.textAlign = 'left';
        ctx.fillStyle = '#7eb4ff'; ctx.fillText('prey x', 24, 14);
        ctx.fillStyle = '#ff8ec6'; ctx.fillText('pred y', 24, 26);
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('phase', rx + 4, 14);

        // Buttons
        var lbls = ['α ' + s.alpha.toFixed(1), 'β ' + s.beta.toFixed(1), 'γ ' + s.gamma.toFixed(1), 'δ ' + s.delta.toFixed(1)];
        for (var b = 0; b < 4; b++) {
            var bx = b * (W / 4) + 4, by = H - 28, bw = W / 4 - 8;
            ctx.fillStyle = 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx, by, bw, 24);
            ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(lbls[b], bx + bw / 2, by + 16);
        }
    });
};

// 11. Action potential (Hodgkin-Huxley simplified)
window.MathInteractive['action-potential'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.history = []; // {t, V}
    s.simT = 0;
    s.spikeT = -10;
    var lastT = performance.now();
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 30) {
            s.spikeT = s.simT;
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    function voltageAt(tau) {
        // tau = ms since stimulus
        if (tau < 0) return -70;
        if (tau < 1) return -70 + tau * 50; // depolarization to -20
        if (tau < 2) return -20 + (tau - 1) * 60; // peak +40
        if (tau < 4) return 40 - (tau - 2) * 60; // repolarization
        if (tau < 8) return -80 + (tau - 4) * 2.5; // hyperpolarized → recover
        return -70;
    }

    window.MathInteractive._raf(c, function (t) {
        var dt = Math.min((t - lastT) / 1000, 0.05) * 1000; // ms
        lastT = t;
        s.simT += dt;
        var V = voltageAt(s.simT - s.spikeT);
        s.history.push({ t: s.simT, V: V });
        while (s.history.length && s.history[0].t < s.simT - 60) s.history.shift();
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Axes
        var pad = 30, plotH = H - 50 - pad;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + plotH); ctx.lineTo(W - 10, pad + plotH); ctx.stroke();
        // V scale: -90 to +50 mV
        function vy(V) { return pad + (50 - V) / 140 * plotH; }
        // Threshold line
        ctx.strokeStyle = 'rgba(255,209,102,0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(pad, vy(-55)); ctx.lineTo(W - 10, vy(-55)); ctx.stroke();
        ctx.setLineDash([]);
        // Voltage trace
        ctx.strokeStyle = '#7eb4ff'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (var i = 0; i < s.history.length; i++) {
            var h = s.history[i];
            var px = pad + ((h.t - (s.simT - 60)) / 60) * (W - pad - 10);
            var py = vy(h.V);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
        ctx.fillText('+50', pad - 4, vy(50) + 3);
        ctx.fillText('0', pad - 4, vy(0) + 3);
        ctx.fillText('-70', pad - 4, vy(-70) + 3);
        ctx.fillStyle = '#ffd166'; ctx.fillText('thresh', pad - 4, vy(-55) - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('membrane potential (mV)', 6, 14);
        // Stimulate button
        ctx.fillStyle = '#ff8ec6'; ctx.fillRect(W / 2 - 60, H - 28, 120, 22);
        ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('Stimulate!', W / 2, H - 12);
    });
};

// 12. Fourier builder
window.MathInteractive['fourier-builder'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.harmonics = [{ n: 1, amp: 1.0 }];
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        // Bottom buttons
        if (p.y > H - 32) {
            // 5 buttons: add 1st, 3rd, 5th, square preset, clear
            var which = Math.floor(p.x / (W / 5));
            if (which === 0) toggleHarmonic(1, 1);
            else if (which === 1) toggleHarmonic(3, 1 / 3);
            else if (which === 2) toggleHarmonic(5, 1 / 5);
            else if (which === 3) {
                s.harmonics = [{n:1,amp:1},{n:3,amp:1/3},{n:5,amp:1/5},{n:7,amp:1/7},{n:9,amp:1/9}];
            } else s.harmonics = [];
        }
    }
    function toggleHarmonic(n, amp) {
        var found = -1;
        for (var i = 0; i < s.harmonics.length; i++) if (s.harmonics[i].n === n) { found = i; break; }
        if (found >= 0) s.harmonics.splice(found, 1);
        else s.harmonics.push({ n: n, amp: amp });
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    window.MathInteractive._raf(c, function () {
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Top: time domain
        var topY = 14, topH = (H - 50) * 0.6;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(8, topY + topH / 2); ctx.lineTo(W - 8, topY + topH / 2); ctx.stroke();
        ctx.strokeStyle = '#7eb4ff'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (var i = 0; i <= 200; i++) {
            var x = i / 200 * 4 * Math.PI;
            var y = 0;
            for (var k = 0; k < s.harmonics.length; k++) {
                y += s.harmonics[k].amp * Math.sin(s.harmonics[k].n * x);
            }
            var px = 8 + (i / 200) * (W - 16);
            var py = topY + topH / 2 - y * topH * 0.35;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('time domain', 8, 12);

        // Bottom: spectrum
        var spY = topY + topH + 8, spH = (H - 50) - topH - 14;
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText('spectrum', 8, spY - 2);
        var maxN = 11;
        for (var n = 1; n <= maxN; n += 2) {
            var bx = 8 + ((n - 1) / 2) * ((W - 16) / 6);
            var bw = (W - 16) / 6 - 4;
            var amp = 0;
            for (var j = 0; j < s.harmonics.length; j++) if (s.harmonics[j].n === n) amp = s.harmonics[j].amp;
            var bh = Math.abs(amp) * spH;
            ctx.fillStyle = amp ? '#ff8ec6' : 'rgba(255,255,255,0.08)';
            ctx.fillRect(bx, spY + spH - bh, bw, bh);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.strokeRect(bx, spY, bw, spH);
            ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
            ctx.fillText('n=' + n, bx + bw / 2, spY + spH + 10);
        }

        // Buttons
        var labels = ['n=1', 'n=3', 'n=5', 'square', 'clear'];
        for (var b = 0; b < 5; b++) {
            var bx2 = b * (W / 5) + 2, by = H - 28, bw2 = W / 5 - 4;
            ctx.fillStyle = 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx2, by, bw2, 24);
            ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(labels[b], bx2 + bw2 / 2, by + 16);
        }
    });
};

// 13. Chaos game → Sierpinski
window.MathInteractive['chaos-game-sierpinski'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    var topY = 24;
    var verts = [
        { x: W / 2, y: topY },
        { x: 20, y: H - 40 },
        { x: W - 20, y: H - 40 }
    ];
    s.point = { x: W / 2, y: H / 2 };
    s.count = 0;
    s.running = true;
    s.speed = 50;
    // Image buffer rendered persistently
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function reset() {
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        s.count = 0;
        s.point = { x: W / 2, y: H / 2 };
    }
    reset();
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 30) {
            if (p.x < W / 3) { s.running = !s.running; }
            else if (p.x < 2 * W / 3) { s.speed = (s.speed === 50) ? 500 : 50; }
            else reset();
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    window.MathInteractive._raf(c, function () {
        if (s.running) {
            for (var k = 0; k < s.speed; k++) {
                var v = verts[Math.floor(Math.random() * 3)];
                s.point.x = (s.point.x + v.x) / 2;
                s.point.y = (s.point.y + v.y) / 2;
                ctx.fillStyle = 'rgba(180,140,255,0.7)';
                ctx.fillRect(s.point.x, s.point.y, 1.5, 1.5);
                s.count++;
            }
        }
        // Overlay vertices each frame in a small region (do not clear background)
        ctx.fillStyle = 'rgba(12,14,26,0.7)';
        ctx.fillRect(0, 0, W, 18);
        ctx.fillRect(0, H - 30, W, 30);
        ctx.fillStyle = '#ff8ec6';
        for (var i = 0; i < verts.length; i++) {
            ctx.beginPath(); ctx.arc(verts[i].x, verts[i].y, 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('points: ' + s.count, 6, 14);
        // Buttons
        var labels = [s.running ? 'Pause' : 'Play', 'Speed×' + (s.speed === 50 ? '1' : '10'), 'Reset'];
        for (var b = 0; b < 3; b++) {
            var bx = b * (W / 3) + 4, by = H - 26, bw = W / 3 - 8;
            ctx.fillStyle = 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx, by, bw, 22);
            ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(labels[b], bx + bw / 2, by + 15);
        }
    });
};

// 14. Central Limit Theorem dice histogram
window.MathInteractive['clt-dice'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.nDice = 1;
    s.bins = {};
    s.total = 0;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function rollOne() {
        var sum = 0;
        for (var i = 0; i < s.nDice; i++) sum += Math.floor(Math.random() * 6) + 1;
        s.bins[sum] = (s.bins[sum] || 0) + 1;
        s.total++;
    }
    function reset() { s.bins = {}; s.total = 0; }
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 30) {
            var which = Math.floor(p.x / (W / 5));
            if (which === 0) { s.nDice = 1; reset(); }
            else if (which === 1) { s.nDice = 2; reset(); }
            else if (which === 2) { s.nDice = 5; reset(); }
            else if (which === 3) { s.nDice = 20; reset(); }
            else { for (var k = 0; k < 200; k++) rollOne(); }
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    window.MathInteractive._raf(c, function () {
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var minSum = s.nDice, maxSum = 6 * s.nDice;
        var range = maxSum - minSum + 1;
        var pad = 20, plotH = H - 50 - pad;
        var barW = (W - pad - 8) / range;
        var maxCt = 1;
        for (var k in s.bins) if (s.bins[k] > maxCt) maxCt = s.bins[k];
        for (var i = 0; i < range; i++) {
            var sum = minSum + i;
            var ct = s.bins[sum] || 0;
            var h = (ct / maxCt) * plotH;
            ctx.fillStyle = '#7eb4ff';
            ctx.fillRect(pad + i * barW + 1, pad + plotH - h, barW - 2, h);
        }
        // Overlay normal curve target
        if (s.nDice >= 2 && s.total > 50) {
            var mean = 3.5 * s.nDice;
            var variance = (35 / 12) * s.nDice;
            var sd = Math.sqrt(variance);
            ctx.strokeStyle = '#ff8ec6'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (var x = 0; x <= 200; x++) {
                var sx = minSum + (x / 200) * (maxSum - minSum);
                var ny = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((sx - mean) / sd, 2));
                // Normal density needs to be scaled so peak ≈ peak bar
                var peak = 1 / (sd * Math.sqrt(2 * Math.PI));
                var py = pad + plotH - (ny / peak) * plotH * 0.95;
                var px = pad + (x / 200) * (W - pad - 8);
                if (x === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
        ctx.fillText(s.nDice + ' dice  ·  ' + s.total + ' rolls', 6, 14);
        ctx.textAlign = 'right';
        ctx.fillText('range ' + minSum + '-' + maxSum, W - 6, 14);
        // Buttons
        var labels = ['1', '2', '5', '20', '+200'];
        for (var b = 0; b < 5; b++) {
            var bx = b * (W / 5) + 2, by = H - 28, bw = W / 5 - 4;
            var active = (b < 4 && s.nDice === [1, 2, 5, 20][b]);
            ctx.fillStyle = active ? '#7eb4ff' : 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx, by, bw, 24);
            ctx.fillStyle = active ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(labels[b], bx + bw / 2, by + 16);
        }
    });
};

// 15. BFS / DFS animation
// 16. Time dilation — two light clocks (rest vs moving), v/c slider
window.MathInteractive['time-dilation'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.beta = 0.6; // v/c
    s.t = 0; s.tickRest = 0; s.tickMove = 0;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function setBeta(p) {
        var sx = 12, sw = W - 24, sy = H - 30;
        if (p.y >= sy - 6 && p.y <= sy + 18) {
            s.beta = Math.max(0, Math.min(0.99, (p.x - sx) / sw));
        }
    }
    function tap(ev) { ev.preventDefault(); setBeta(window.MathInteractive._pos(canvas, ev)); s.dragging = true; }
    function move(ev) { if (!s.dragging) return; ev.preventDefault(); setBeta(window.MathInteractive._pos(canvas, ev)); }
    function up() { s.dragging = false; }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'mousemove', move);
    add(c, canvas, 'mouseup', up);
    add(c, canvas, 'touchstart', tap, { passive: false });
    add(c, canvas, 'touchmove', move, { passive: false });
    add(c, canvas, 'touchend', up);

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = Math.min((t - lastT) / 1000, 0.05); lastT = t;
        var gamma = 1 / Math.sqrt(1 - s.beta * s.beta);
        s.t += dt;
        // photon period (round trip) = 1s for rest clock
        var phaseR = (s.t % 1) / 1;
        var phaseM = ((s.t / gamma) % 1) / 1;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Two clocks
        var clockH = H - 70, mid = H / 2;
        var leftX = W * 0.25, rightX = W * 0.72;
        var clockTop = 30, clockBot = clockTop + 90;
        function drawClock(cx, phase, label, tr) {
            ctx.strokeStyle = 'rgba(126,180,255,0.5)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx - 18, clockTop); ctx.lineTo(cx + 18, clockTop); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx - 18, clockBot); ctx.lineTo(cx + 18, clockBot); ctx.stroke();
            // photon
            var py = phase < 0.5 ? clockTop + (phase * 2) * (clockBot - clockTop) : clockBot - ((phase - 0.5) * 2) * (clockBot - clockTop);
            ctx.fillStyle = '#ffd166';
            ctx.beginPath(); ctx.arc(cx, py, 5, 0, Math.PI * 2); ctx.fill();
            // path
            ctx.strokeStyle = 'rgba(255,209,102,0.3)';
            ctx.beginPath(); ctx.moveTo(cx, clockTop + 4); ctx.lineTo(cx, clockBot - 4); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(label, cx, clockBot + 16);
            ctx.font = '11px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.65)';
            ctx.fillText('ticks: ' + tr.toFixed(1), cx, clockBot + 30);
        }
        // Tally ticks
        if (phaseR < 0.05) { /* approx tick boundary */ }
        s.tickRest = s.t;
        s.tickMove = s.t / gamma;
        drawClock(leftX, phaseR, 'rest frame', s.tickRest);
        // Moving clock — also slanted photon path visualization
        ctx.save();
        var slant = s.beta * 30;
        ctx.strokeStyle = 'rgba(126,180,255,0.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(rightX - 18, clockTop); ctx.lineTo(rightX + 18, clockTop); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rightX - 18 + slant, clockBot); ctx.lineTo(rightX + 18 + slant, clockBot); ctx.stroke();
        var pmY = phaseM < 0.5 ? clockTop + (phaseM * 2) * (clockBot - clockTop) : clockBot - ((phaseM - 0.5) * 2) * (clockBot - clockTop);
        var slantX = (pmY - clockTop) / (clockBot - clockTop) * slant;
        ctx.fillStyle = '#ffd166';
        ctx.beginPath(); ctx.arc(rightX + slantX, pmY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,209,102,0.3)';
        ctx.beginPath(); ctx.moveTo(rightX, clockTop + 4); ctx.lineTo(rightX + slant, clockBot - 4); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('moving frame', rightX + slant / 2, clockBot + 16);
        ctx.font = '11px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.fillText('ticks: ' + s.tickMove.toFixed(1), rightX + slant / 2, clockBot + 30);
        ctx.restore();
        // Title and gamma
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '12px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('v/c = ' + s.beta.toFixed(2) + '   γ = ' + gamma.toFixed(2), 8, 16);
        // Slider
        var sx = 12, sw = W - 24, sy = H - 30;
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sx, sy, sw, 8);
        ctx.fillStyle = '#7eb4ff'; ctx.fillRect(sx, sy, s.beta * sw, 8);
        var hx = sx + s.beta * sw;
        ctx.fillStyle = '#ff8ec6';
        ctx.beginPath(); ctx.arc(hx, sy + 4, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('drag to change v/c', W / 2, sy - 4);
    });
};

// 17. Length contraction — ruler shrinks with v/c slider
window.MathInteractive['length-contraction'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.beta = 0.5;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function setBeta(p) {
        var sx = 12, sw = W - 24, sy = H - 30;
        if (p.y >= sy - 6 && p.y <= sy + 18) {
            s.beta = Math.max(0, Math.min(0.99, (p.x - sx) / sw));
        }
    }
    function tap(ev) { ev.preventDefault(); setBeta(window.MathInteractive._pos(canvas, ev)); s.dragging = true; }
    function move(ev) { if (!s.dragging) return; ev.preventDefault(); setBeta(window.MathInteractive._pos(canvas, ev)); }
    function up() { s.dragging = false; }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'mousemove', move);
    add(c, canvas, 'mouseup', up);
    add(c, canvas, 'touchstart', tap, { passive: false });
    add(c, canvas, 'touchmove', move, { passive: false });
    add(c, canvas, 'touchend', up);

    var t0 = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var elapsed = (t - t0) / 1000;
        var gamma = 1 / Math.sqrt(1 - s.beta * s.beta);
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Rest ruler (top)
        var L0 = Math.min(W - 60, 320);
        var topY = 50;
        ctx.fillStyle = 'rgba(126,180,255,0.25)';
        ctx.fillRect((W - L0) / 2, topY, L0, 32);
        ctx.strokeStyle = '#7eb4ff'; ctx.lineWidth = 2;
        ctx.strokeRect((W - L0) / 2, topY, L0, 32);
        // Tick marks
        for (var i = 0; i <= 10; i++) {
            var tx = (W - L0) / 2 + i * (L0 / 10);
            ctx.beginPath(); ctx.moveTo(tx, topY); ctx.lineTo(tx, topY + 8); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('rest frame  L₀ = 1.00', W / 2, topY - 6);
        // Contracted ruler (bottom) — moving
        var Lc = L0 / gamma;
        var botY = topY + 90;
        // Position animates moving across screen
        var px = ((elapsed * 60 * (s.beta + 0.1)) % (W + L0)) - L0 / 2;
        px = Math.min(W - Lc - 10, Math.max(10, px));
        ctx.fillStyle = 'rgba(255,142,198,0.25)';
        ctx.fillRect(px, botY, Lc, 32);
        ctx.strokeStyle = '#ff8ec6'; ctx.lineWidth = 2;
        ctx.strokeRect(px, botY, Lc, 32);
        for (var j = 0; j <= 10; j++) {
            var tx2 = px + j * (Lc / 10);
            ctx.beginPath(); ctx.moveTo(tx2, botY); ctx.lineTo(tx2, botY + 8); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('moving frame  L = ' + (1 / gamma).toFixed(2), W / 2, botY + 52);
        // Velocity arrow
        ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px + Lc + 4, botY + 16); ctx.lineTo(px + Lc + 24, botY + 16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + Lc + 24, botY + 16); ctx.lineTo(px + Lc + 18, botY + 12); ctx.lineTo(px + Lc + 18, botY + 20); ctx.closePath();
        ctx.fillStyle = '#ffd166'; ctx.fill();
        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('v/c = ' + s.beta.toFixed(2) + '   γ = ' + gamma.toFixed(2) + '   L = L₀/γ', 8, 16);
        // Slider
        var sx = 12, sw = W - 24, sy = H - 30;
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sx, sy, sw, 8);
        ctx.fillStyle = '#ff8ec6'; ctx.fillRect(sx, sy, s.beta * sw, 8);
        var hx = sx + s.beta * sw;
        ctx.fillStyle = '#7eb4ff';
        ctx.beginPath(); ctx.arc(hx, sy + 4, 9, 0, Math.PI * 2); ctx.fill();
    });
};

// 18. EM wave propagation — E and B oscillating perpendicular
window.MathInteractive['em-wave'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.t = 0;
    s.polarization = 'linear';
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 32) {
            if (p.x < W / 2) s.polarization = 'linear';
            else s.polarization = 'circular';
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = (t - lastT) / 1000; lastT = t;
        s.t += dt;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var midY = (H - 40) / 2 + 10;
        // Propagation axis arrow
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, midY); ctx.lineTo(W - 20, midY); ctx.stroke();
        // Arrow tip
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath(); ctx.moveTo(W - 20, midY); ctx.lineTo(W - 28, midY - 4); ctx.lineTo(W - 28, midY + 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
        ctx.fillText('direction of travel →', W - 30, midY - 6);

        var k = 0.06, omega = 4;
        var amp = Math.min(60, (H - 80) / 3);
        // Sample arrows along axis
        var step = 16;
        for (var x = 30; x < W - 20; x += step) {
            var phase = k * x - omega * s.t;
            var Ey, Bz;
            if (s.polarization === 'linear') {
                Ey = -Math.sin(phase) * amp;
                Bz = -Math.sin(phase) * amp * 0.7;
            } else {
                Ey = -Math.sin(phase) * amp;
                Bz = -Math.cos(phase) * amp * 0.7;
            }
            // E vector (vertical, blue)
            ctx.strokeStyle = '#7eb4ff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x, midY); ctx.lineTo(x, midY + Ey); ctx.stroke();
            // B vector (perpendicular, magenta) drawn as foreshortened (skewed in 3D-ish)
            var bx = x + Bz * 0.5; // skew "out of page" direction
            var by = midY - Bz * 0.4; // tilt
            ctx.strokeStyle = '#ff8ec6';
            ctx.beginPath(); ctx.moveTo(x, midY); ctx.lineTo(bx, by); ctx.stroke();
        }
        // Draw smooth E curve overlay
        ctx.strokeStyle = 'rgba(126,180,255,0.5)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var xx = 20; xx < W - 20; xx += 2) {
            var ph = k * xx - omega * s.t;
            var ey = -Math.sin(ph) * amp;
            if (xx === 20) ctx.moveTo(xx, midY + ey); else ctx.lineTo(xx, midY + ey);
        }
        ctx.stroke();
        // Legend
        ctx.fillStyle = '#7eb4ff'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('E (electric)', 8, 16);
        ctx.fillStyle = '#ff8ec6'; ctx.fillText('B (magnetic)', 8, 30);
        // Buttons
        var modes = ['linear', 'circular'];
        for (var b = 0; b < 2; b++) {
            var bx2 = b * (W / 2) + 4, by2 = H - 28, bw = W / 2 - 8;
            ctx.fillStyle = (s.polarization === modes[b]) ? '#7eb4ff' : 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx2, by2, bw, 24);
            ctx.fillStyle = (s.polarization === modes[b]) ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(modes[b], bx2 + bw / 2, by2 + 16);
        }
    });
};

// 19. HR diagram — clickable stars on luminosity vs temperature
window.MathInteractive['hr-diagram'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    // Stars: [name, T (K), log L (solar), category]
    s.stars = [
        ['Sun', 5778, 0, 'MS'],
        ['Sirius A', 9940, 1.4, 'MS'],
        ['Vega', 9602, 1.7, 'MS'],
        ['Proxima', 3042, -2.7, 'MS'],
        ['Barnard', 3134, -2.5, 'MS'],
        ['Rigel', 12100, 5.1, 'SG'],
        ['Betelgeuse', 3500, 5.0, 'RG'],
        ['Aldebaran', 3910, 2.8, 'RG'],
        ['Arcturus', 4286, 2.3, 'RG'],
        ['Procyon B', 7740, -2.7, 'WD'],
        ['Sirius B', 25200, -2.0, 'WD'],
        ['Spica', 22400, 4.0, 'MS'],
        ['Deneb', 8525, 5.3, 'SG'],
        ['Alpha Cen B', 5260, -0.3, 'MS']
    ];
    s.selected = null;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    var pad = 30, plotR = W - pad - 8, plotB = H - 50;
    // T axis: high to low, log scale 30000..2500
    function tx(T) { return pad + (Math.log10(30000) - Math.log10(T)) / (Math.log10(30000) - Math.log10(2500)) * (plotR - pad); }
    function ty(L) { return 16 + (5.5 - L) / (5.5 - (-3)) * (plotB - 16); }
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        s.selected = null;
        for (var i = 0; i < s.stars.length; i++) {
            var st = s.stars[i];
            var x = tx(st[1]), y = ty(st[2]);
            if (Math.hypot(p.x - x, p.y - y) < 14) { s.selected = st; break; }
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    var lastT = 0;
    window.MathInteractive._raf(c, function (t) {
        if (t - lastT < 60) return; lastT = t;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Background regions
        // Main sequence diagonal band
        ctx.fillStyle = 'rgba(126,180,255,0.08)';
        ctx.beginPath();
        ctx.moveTo(tx(30000), ty(5));
        ctx.lineTo(tx(2500), ty(-3));
        ctx.lineTo(tx(2500), ty(-2));
        ctx.lineTo(tx(30000), ty(6));
        ctx.closePath(); ctx.fill();
        // Giants region
        ctx.fillStyle = 'rgba(255,142,198,0.08)';
        ctx.fillRect(tx(6000), ty(4), tx(2500) - tx(6000), ty(1) - ty(4));
        // White dwarfs region
        ctx.fillStyle = 'rgba(255,209,102,0.08)';
        ctx.fillRect(tx(30000), ty(-1), tx(5000) - tx(30000), ty(-3) - ty(-1));
        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, 16); ctx.lineTo(pad, plotB); ctx.lineTo(plotR, plotB); ctx.stroke();
        // Region labels
        ctx.fillStyle = 'rgba(126,180,255,0.5)'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('main sequence', tx(7000), ty(2.0));
        ctx.fillStyle = 'rgba(255,142,198,0.6)';
        ctx.fillText('giants', tx(3800), ty(3.2));
        ctx.fillStyle = 'rgba(255,209,102,0.7)';
        ctx.fillText('white dwarfs', tx(15000), ty(-2));
        // Stars
        for (var i = 0; i < s.stars.length; i++) {
            var st = s.stars[i];
            var x = tx(st[1]), y = ty(st[2]);
            // Color by T
            var T = st[1];
            var col;
            if (T > 10000) col = '#9bb5ff';
            else if (T > 7000) col = '#cad7ff';
            else if (T > 5500) col = '#fff4e8';
            else if (T > 4000) col = '#ffd2a1';
            else col = '#ff9c6e';
            var sel = (s.selected === st);
            ctx.fillStyle = col;
            var rr = sel ? 8 : 5;
            ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
            if (sel) {
                ctx.strokeStyle = '#ff8ec6'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(x, y, rr + 3, 0, Math.PI * 2); ctx.stroke();
            }
        }
        // Axis labels
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('Temperature (K) →  hot ←', W / 2, plotB + 14);
        ctx.save(); ctx.translate(8, plotB / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText('log L / L☉', 0, 0); ctx.restore();
        // Axis ticks
        ctx.font = '9px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
        var tks = [30000, 10000, 6000, 4000, 2500];
        for (var k = 0; k < tks.length; k++) ctx.fillText(tks[k], tx(tks[k]), plotB + 14);
        ctx.textAlign = 'right';
        for (var L = -3; L <= 5; L += 2) ctx.fillText(L, pad - 2, ty(L) + 3);
        // Info bar
        ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, H - 30, W, 30);
        if (s.selected) {
            var st = s.selected;
            var cat = { 'MS': 'main sequence', 'RG': 'red giant', 'SG': 'supergiant', 'WD': 'white dwarf' }[st[3]];
            ctx.fillStyle = '#ff8ec6'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
            ctx.fillText(st[0], 8, H - 14);
            ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '11px system-ui';
            ctx.fillText('T = ' + st[1] + ' K   log L = ' + st[2].toFixed(1) + '   ' + cat, 80, H - 14);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText('Tap a star to inspect.', W / 2, H - 12);
        }
    });
};

// 20. Reynolds flow — flow past cylinder; Re slider
window.MathInteractive['reynolds-flow'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.Re = 100;
    s.particles = [];
    s.t = 0;
    var cyl = { x: W * 0.35, y: (H - 40) / 2 + 10, r: 22 };
    for (var i = 0; i < 220; i++) {
        s.particles.push({
            x: Math.random() * W,
            y: Math.random() * (H - 40) + 10,
            life: Math.random() * 5
        });
    }
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function setRe(p) {
        var sx = 12, sw = W - 24, sy = H - 30;
        if (p.y >= sy - 6 && p.y <= sy + 18) {
            var f = Math.max(0, Math.min(1, (p.x - sx) / sw));
            // Log scale 1..10000
            s.Re = Math.pow(10, f * 4);
        }
    }
    function tap(ev) { ev.preventDefault(); setRe(window.MathInteractive._pos(canvas, ev)); s.dragging = true; }
    function move(ev) { if (!s.dragging) return; ev.preventDefault(); setRe(window.MathInteractive._pos(canvas, ev)); }
    function up() { s.dragging = false; }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'mousemove', move);
    add(c, canvas, 'mouseup', up);
    add(c, canvas, 'touchstart', tap, { passive: false });
    add(c, canvas, 'touchmove', move, { passive: false });
    add(c, canvas, 'touchend', up);

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = Math.min((t - lastT) / 1000, 0.04); lastT = t;
        s.t += dt;
        // Advect particles. Velocity field depends on Re.
        var u0 = 60;
        var vortexFreq = 0;
        var turbulence = 0;
        if (s.Re < 10) { vortexFreq = 0; turbulence = 0; }
        else if (s.Re < 80) { vortexFreq = 0; turbulence = 0.05; }
        else if (s.Re < 1000) { vortexFreq = 0.4 + s.Re / 3000; turbulence = 0.1; }
        else { vortexFreq = 0.8; turbulence = 0.5 + Math.min(1, (s.Re - 1000) / 5000); }

        for (var i = 0; i < s.particles.length; i++) {
            var p = s.particles[i];
            // Background flow with potential-flow style perturbation around cylinder
            var dx = p.x - cyl.x, dy = p.y - cyl.y;
            var r2 = dx * dx + dy * dy;
            var r = Math.sqrt(r2);
            var u = u0, v = 0;
            if (r > cyl.r) {
                // Doublet flow: u = U(1 + a²(y²-x²)/r⁴), v = -U·2a²xy/r⁴ approximately
                var a2 = cyl.r * cyl.r;
                u = u0 * (1 - a2 * (dx * dx - dy * dy) / (r2 * r2));
                v = -u0 * 2 * a2 * dx * dy / (r2 * r2);
            } else {
                // Inside — push out
                u = 0; v = 0;
                p.x = cyl.x - cyl.r - 4;
            }
            // Vortex shedding behind cylinder
            if (vortexFreq > 0 && p.x > cyl.x + cyl.r) {
                var shed = Math.sin(s.t * vortexFreq * 6 - (p.x - cyl.x) * 0.05) * 30 * vortexFreq;
                v += shed;
            }
            if (turbulence > 0) {
                u += (Math.random() - 0.5) * 30 * turbulence;
                v += (Math.random() - 0.5) * 30 * turbulence;
            }
            p.x += u * dt;
            p.y += v * dt;
            p.life -= dt;
            if (p.x > W + 4 || p.life < 0) {
                p.x = -2; p.y = Math.random() * (H - 40) + 10;
                p.life = 4 + Math.random() * 3;
            }
            if (p.y < 8 || p.y > H - 38) p.y = Math.random() * (H - 40) + 10;
        }
        // Draw
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Particles as streaks
        for (var k = 0; k < s.particles.length; k++) {
            var pk = s.particles[k];
            var dx2 = pk.x - cyl.x, dy2 = pk.y - cyl.y;
            if (dx2 * dx2 + dy2 * dy2 < cyl.r * cyl.r) continue;
            var speed = Math.min(1, Math.abs(pk.x - cyl.x) / 300);
            var col = s.Re < 80 ? 'rgba(126,180,255,0.7)' : s.Re < 1000 ? 'rgba(255,209,102,0.7)' : 'rgba(255,142,198,0.6)';
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(pk.x, pk.y, 1.6, 0, Math.PI * 2); ctx.fill();
        }
        // Cylinder
        ctx.fillStyle = 'rgba(180,140,255,0.6)';
        ctx.beginPath(); ctx.arc(cyl.x, cyl.y, cyl.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 2; ctx.stroke();
        // Regime label
        var regime = s.Re < 10 ? 'creeping (Stokes)' : s.Re < 80 ? 'laminar' : s.Re < 1000 ? 'Kármán vortex street' : 'turbulent wake';
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('Re = ' + Math.round(s.Re) + '   ' + regime, 8, 16);
        // Slider (log-scale)
        var sx = 12, sw = W - 24, sy = H - 30;
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sx, sy, sw, 8);
        var f = Math.log10(s.Re) / 4;
        ctx.fillStyle = '#7eb4ff'; ctx.fillRect(sx, sy, f * sw, 8);
        var hx = sx + f * sw;
        ctx.fillStyle = '#ff8ec6';
        ctx.beginPath(); ctx.arc(hx, sy + 4, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('Re=1', sx, sy - 3);
        ctx.textAlign = 'right'; ctx.fillText('10⁴', sx + sw, sy - 3);
    });
};

// 21. Carnot cycle — PV diagram with animated piston
window.MathInteractive['carnot-cycle'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.Th = 600; s.Tc = 300;
    s.t = 0;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function setT(p) {
        var sx = 12, sw = (W / 2) - 24, sy = H - 30;
        if (p.y >= sy - 6 && p.y <= sy + 18) {
            if (p.x < W / 2) {
                s.Tc = 100 + Math.max(0, Math.min(1, (p.x - sx) / sw)) * 400; // 100..500
            } else {
                var sx2 = W / 2 + 12;
                s.Th = 200 + Math.max(0, Math.min(1, (p.x - sx2) / sw)) * 800; // 200..1000
            }
            if (s.Th <= s.Tc) s.Th = s.Tc + 50;
        }
    }
    function tap(ev) { ev.preventDefault(); setT(window.MathInteractive._pos(canvas, ev)); s.dragging = true; }
    function move(ev) { if (!s.dragging) return; ev.preventDefault(); setT(window.MathInteractive._pos(canvas, ev)); }
    function up() { s.dragging = false; }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'mousemove', move);
    add(c, canvas, 'mouseup', up);
    add(c, canvas, 'touchstart', tap, { passive: false });
    add(c, canvas, 'touchmove', move, { passive: false });
    add(c, canvas, 'touchend', up);

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = (t - lastT) / 1000; lastT = t;
        s.t = (s.t + dt * 0.25) % 1;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Left: piston, Right: PV diagram
        var midX = W * 0.4;
        // Piston box
        var pX = 40, pY = 30, pW = midX - 60, pH = H - 100;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
        ctx.strokeRect(pX, pY, pW, pH);
        // Stage 0..0.25: isothermal expansion at Th
        // 0.25..0.5: adiabatic expansion
        // 0.5..0.75: isothermal compression at Tc
        // 0.75..1: adiabatic compression
        var V; // 0..1
        var Tcur;
        if (s.t < 0.25) { V = 0.3 + (s.t / 0.25) * 0.3; Tcur = s.Th; }
        else if (s.t < 0.5) { V = 0.6 + ((s.t - 0.25) / 0.25) * 0.3; Tcur = s.Th + ((s.t - 0.25) / 0.25) * (s.Tc - s.Th); }
        else if (s.t < 0.75) { V = 0.9 - ((s.t - 0.5) / 0.25) * 0.3; Tcur = s.Tc; }
        else { V = 0.6 - ((s.t - 0.75) / 0.25) * 0.3; Tcur = s.Tc + ((s.t - 0.75) / 0.25) * (s.Th - s.Tc); }
        // Piston position
        var pistonY = pY + pH - V * pH;
        // Gas
        var heat = (Tcur - 200) / 800;
        ctx.fillStyle = 'rgba(255,142,198,' + (0.2 + 0.4 * heat) + ')';
        ctx.fillRect(pX + 2, pistonY, pW - 4, pY + pH - pistonY - 2);
        // Particles
        var nParticles = 14;
        for (var i = 0; i < nParticles; i++) {
            var px = pX + 6 + ((i * 17 + s.t * 1000) % (pW - 12));
            var py = pistonY + 4 + ((i * 13 + s.t * 800) % (pY + pH - pistonY - 8));
            ctx.fillStyle = '#ff8ec6';
            ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
        }
        // Piston itself
        ctx.fillStyle = '#b48cff';
        ctx.fillRect(pX, pistonY - 6, pW, 6);
        // Reservoir labels
        var stage = ['isothermal expansion (hot)', 'adiabatic expansion', 'isothermal compression (cold)', 'adiabatic compression'][Math.floor(s.t * 4)];
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left';
        ctx.fillText(stage, 8, 18);
        ctx.font = '11px system-ui';
        ctx.fillText('T = ' + Math.round(Tcur) + ' K', 8, pY + pH + 18);

        // PV diagram on right
        var dx = midX + 20, dy = 30, dw = W - dx - 14, dh = H - 100;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx, dy + dh); ctx.lineTo(dx + dw, dy + dh); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('V →', dx + dw / 2, dy + dh + 14);
        ctx.save(); ctx.translate(dx - 10, dy + dh / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('P', 0, 0); ctx.restore();
        // Plot Carnot cycle: P = nRT/V; Th and Tc isotherms
        function px(V) { return dx + (V - 0.25) * dw / 0.7; }
        function pyP(P) { return dy + dh - (P - 0.5) * dh / 4.5; }
        // Th isotherm (V=0.3 to 0.6)
        ctx.strokeStyle = '#ff8ec6'; ctx.lineWidth = 2; ctx.beginPath();
        for (var V1 = 0.3; V1 <= 0.6; V1 += 0.01) { var p = s.Th / 600 / V1; var X = px(V1), Y = pyP(p); if (V1 === 0.3) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
        ctx.stroke();
        // Adiabatic 1: V=0.6→0.9
        ctx.strokeStyle = '#ffd166'; ctx.beginPath();
        for (var V2 = 0.6; V2 <= 0.9; V2 += 0.01) {
            var fr = (V2 - 0.6) / 0.3;
            var Tx = s.Th + fr * (s.Tc - s.Th);
            var Px = Tx / 600 / V2;
            var X2 = px(V2), Y2 = pyP(Px);
            if (V2 === 0.6) ctx.moveTo(X2, Y2); else ctx.lineTo(X2, Y2);
        }
        ctx.stroke();
        // Tc isotherm: V=0.9→0.6
        ctx.strokeStyle = '#7eb4ff'; ctx.beginPath();
        for (var V3 = 0.6; V3 <= 0.9; V3 += 0.01) { var p3 = s.Tc / 600 / V3; var X3 = px(V3), Y3 = pyP(p3); if (V3 === 0.6) ctx.moveTo(X3, Y3); else ctx.lineTo(X3, Y3); }
        ctx.stroke();
        // Adiabatic 2: V=0.6→0.3
        ctx.strokeStyle = '#76d7c4'; ctx.beginPath();
        for (var V4 = 0.3; V4 <= 0.6; V4 += 0.01) {
            var fr2 = (V4 - 0.3) / 0.3;
            var Tx2 = s.Tc + fr2 * (s.Th - s.Tc);
            var Px2 = Tx2 / 600 / V4;
            var X4 = px(V4), Y4 = pyP(Px2);
            if (V4 === 0.3) ctx.moveTo(X4, Y4); else ctx.lineTo(X4, Y4);
        }
        ctx.stroke();
        // Current state dot
        var P = Tcur / 600 / V;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(px(V), pyP(P), 4, 0, Math.PI * 2); ctx.fill();
        // Efficiency
        var eta = 1 - s.Tc / s.Th;
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'right';
        ctx.fillText('η = 1 − Tc/Th = ' + (eta * 100).toFixed(1) + '%', W - 10, 18);

        // Sliders
        var sw = (W / 2) - 24;
        // Tc slider
        var sxA = 12, syS = H - 30;
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sxA, syS, sw, 8);
        var fc = (s.Tc - 100) / 400;
        ctx.fillStyle = '#7eb4ff'; ctx.fillRect(sxA, syS, fc * sw, 8);
        ctx.fillStyle = '#7eb4ff';
        ctx.beginPath(); ctx.arc(sxA + fc * sw, syS + 4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('Tc=' + Math.round(s.Tc), sxA, syS - 3);
        // Th slider
        var sxB = W / 2 + 12;
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sxB, syS, sw, 8);
        var fh = (s.Th - 200) / 800;
        ctx.fillStyle = '#ff8ec6'; ctx.fillRect(sxB, syS, fh * sw, 8);
        ctx.fillStyle = '#ff8ec6';
        ctx.beginPath(); ctx.arc(sxB + fh * sw, syS + 4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('Th=' + Math.round(s.Th), sxB, syS - 3);
    });
};

// 22. SN1 vs SN2 — toggle mechanism, animate nucleophile attack
window.MathInteractive['sn1-sn2'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.mode = 'sn2';
    s.t = 0;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 32) {
            if (p.x < W / 2) s.mode = 'sn2';
            else s.mode = 'sn1';
            s.t = 0;
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = (t - lastT) / 1000; lastT = t;
        s.t = (s.t + dt * 0.3) % 1;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var cx = W / 2, cy = (H - 60) / 2 + 10;
        // Central carbon
        ctx.fillStyle = '#b48cff';
        ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('C', cx, cy + 4);
        // Three R groups (R, R', R'')
        var rs = [
            { ang: -2 * Math.PI / 3, label: 'R' },
            { ang: 2 * Math.PI / 3, label: "R'" },
            { ang: Math.PI, label: "R''" }
        ];
        if (s.mode === 'sn2') {
            // Backside attack: Nu approaches from left, LG leaves to right
            // t: 0..0.4 approach; 0.4..0.6 transition state (planar); 0.6..1 product
            var nuX, lgX;
            if (s.t < 0.4) { nuX = cx - 100 + s.t * 180; lgX = cx + 30; }
            else if (s.t < 0.6) { nuX = cx - 16; lgX = cx + 16 + (s.t - 0.4) * 60; }
            else { nuX = cx - 30; lgX = cx + 60 + (s.t - 0.6) * 100; }
            // Inversion: bonds flip orientation
            var inv = Math.min(1, s.t / 0.6);
            ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
            for (var i = 0; i < rs.length; i++) {
                var ang = rs[i].ang + (inv - 0.5) * 0.6;
                var rx = cx + Math.cos(ang) * 38, ry = cy + Math.sin(ang) * 38;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx, ry); ctx.stroke();
                ctx.fillStyle = '#7eb4ff';
                ctx.beginPath(); ctx.arc(rx, ry, 10, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 10px system-ui';
                ctx.fillText(rs[i].label, rx, ry + 3);
            }
            // Nucleophile (Nu-)
            ctx.fillStyle = '#76d7c4';
            ctx.beginPath(); ctx.arc(nuX, cy, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 11px system-ui';
            ctx.fillText('Nu', nuX, cy + 3);
            // Bond Nu—C if close
            if (Math.abs(nuX - cx) < 30) {
                ctx.strokeStyle = '#76d7c4'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(nuX + 12, cy); ctx.lineTo(cx - 16, cy); ctx.stroke();
            }
            // Leaving group (LG)
            ctx.fillStyle = '#ff8ec6';
            ctx.beginPath(); ctx.arc(lgX, cy, 11, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 10px system-ui';
            ctx.fillText('LG', lgX, cy + 3);
            // C—LG bond if close
            if (lgX - cx < 60) {
                ctx.strokeStyle = 'rgba(255,142,198,' + Math.max(0.2, 1 - s.t * 1.5) + ')';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx + 16, cy); ctx.lineTo(lgX - 11, cy); ctx.stroke();
            }
            ctx.fillStyle = '#ff8ec6'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText('Backside attack → inversion of stereochemistry (Walden inversion)', W / 2, H - 44);
        } else {
            // SN1: LG leaves first → carbocation → Nu attacks from either side
            var step = s.t < 0.35 ? 0 : (s.t < 0.55 ? 1 : 2);
            // R groups
            ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
            for (var i2 = 0; i2 < rs.length; i2++) {
                var rx2 = cx + Math.cos(rs[i2].ang) * 38, ry2 = cy + Math.sin(rs[i2].ang) * 38;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx2, ry2); ctx.stroke();
                ctx.fillStyle = '#7eb4ff';
                ctx.beginPath(); ctx.arc(rx2, ry2, 10, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 10px system-ui';
                ctx.fillText(rs[i2].label, rx2, ry2 + 3);
            }
            if (step === 0) {
                // LG leaving
                var lgX2 = cx + 30 + s.t * 200;
                ctx.fillStyle = '#ff8ec6';
                ctx.beginPath(); ctx.arc(lgX2, cy, 11, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
                ctx.fillText('LG', lgX2, cy + 3);
                ctx.strokeStyle = 'rgba(255,142,198,' + Math.max(0.2, 1 - s.t * 3) + ')'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx + 16, cy); ctx.lineTo(lgX2 - 11, cy); ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '11px system-ui';
                ctx.fillText('Step 1: leaving group departs (slow, rate-determining)', W / 2, H - 44);
            } else if (step === 1) {
                // Carbocation — flat
                ctx.fillStyle = '#ffd166'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
                ctx.fillText('+', cx + 18, cy - 12);
                ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '11px system-ui';
                ctx.fillText('Carbocation intermediate (planar, sp²)', W / 2, H - 44);
            } else {
                // Nu attacks from either side equally — show two products
                var sub = (s.t - 0.55) / 0.45;
                var nuTopX = cx - 80 + sub * 80, nuTopY = cy - 80 + sub * 80;
                var nuBotX = cx + 80 - sub * 80, nuBotY = cy + 80 - sub * 80;
                ctx.fillStyle = '#76d7c4';
                ctx.beginPath(); ctx.arc(nuTopX, nuTopY, 10, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(nuBotX, nuBotY, 10, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
                ctx.fillText('Nu', nuTopX, nuTopY + 3);
                ctx.fillText('Nu', nuBotX, nuBotY + 3);
                ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '11px system-ui';
                ctx.fillText('Nu attacks both faces → racemic mixture', W / 2, H - 44);
            }
        }
        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
        ctx.fillText(s.mode === 'sn2' ? 'SN2 — concerted, bimolecular' : 'SN1 — stepwise, unimolecular', 8, 16);
        // Buttons
        var modes = ['sn2', 'sn1'];
        var labels = ['SN2', 'SN1'];
        for (var b = 0; b < 2; b++) {
            var bx = b * (W / 2) + 4, by = H - 28, bw = W / 2 - 8;
            ctx.fillStyle = (s.mode === modes[b]) ? '#7eb4ff' : 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx, by, bw, 24);
            ctx.fillStyle = (s.mode === modes[b]) ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(labels[b], bx + bw / 2, by + 16);
        }
    });
};

// 23. Michaelis-Menten — slider for [S], M-M curve, inhibitor toggle
window.MathInteractive['michaelis-menten'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.S = 5; // [S] mM
    s.Vmax = 1.0;
    s.Km = 4;
    s.inhibitor = 'none'; // none, competitive, noncompetitive
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function setS(p) {
        var sx = 12, sw = W - 24, sy = H - 30;
        if (p.y >= sy - 6 && p.y <= sy + 18) {
            s.S = Math.max(0, Math.min(1, (p.x - sx) / sw)) * 30;
        }
    }
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 60 && p.y < H - 36) {
            // Inhibitor buttons row
            if (p.x < W / 3) s.inhibitor = 'none';
            else if (p.x < 2 * W / 3) s.inhibitor = 'competitive';
            else s.inhibitor = 'noncompetitive';
        } else {
            setS(p); s.dragging = true;
        }
    }
    function move(ev) { if (!s.dragging) return; ev.preventDefault(); setS(window.MathInteractive._pos(canvas, ev)); }
    function up() { s.dragging = false; }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'mousemove', move);
    add(c, canvas, 'mouseup', up);
    add(c, canvas, 'touchstart', tap, { passive: false });
    add(c, canvas, 'touchmove', move, { passive: false });
    add(c, canvas, 'touchend', up);

    var lastT = 0;
    window.MathInteractive._raf(c, function (t) {
        if (t - lastT < 30) return; lastT = t;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var pad = 30, plotR = W - pad - 8, plotB = H - 64;
        // Compute parameters with inhibitor
        var Vmax = s.Vmax, Km = s.Km;
        if (s.inhibitor === 'competitive') Km = s.Km * 2.5;
        else if (s.inhibitor === 'noncompetitive') Vmax = s.Vmax * 0.5;
        var v = Vmax * s.S / (Km + s.S);
        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, 16); ctx.lineTo(pad, plotB); ctx.lineTo(plotR, plotB); ctx.stroke();
        // Vmax line
        var vmaxY = 16 + (1 - s.Vmax / 1.2) * (plotB - 16);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(pad, vmaxY); ctx.lineTo(plotR, vmaxY); ctx.stroke();
        var vmaxYI = 16 + (1 - Vmax / 1.2) * (plotB - 16);
        if (s.inhibitor === 'noncompetitive') {
            ctx.strokeStyle = 'rgba(255,142,198,0.5)';
            ctx.beginPath(); ctx.moveTo(pad, vmaxYI); ctx.lineTo(plotR, vmaxYI); ctx.stroke();
        }
        ctx.setLineDash([]);
        // No-inhibitor curve (reference)
        ctx.strokeStyle = 'rgba(126,180,255,0.4)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var Sp = 0; Sp <= 30; Sp += 0.3) {
            var vRef = s.Vmax * Sp / (s.Km + Sp);
            var X = pad + (Sp / 30) * (plotR - pad);
            var Y = 16 + (1 - vRef / 1.2) * (plotB - 16);
            if (Sp === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        }
        ctx.stroke();
        // Current curve
        ctx.strokeStyle = '#ff8ec6'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (var S2 = 0; S2 <= 30; S2 += 0.3) {
            var vc = Vmax * S2 / (Km + S2);
            var X2 = pad + (S2 / 30) * (plotR - pad);
            var Y2 = 16 + (1 - vc / 1.2) * (plotB - 16);
            if (S2 === 0) ctx.moveTo(X2, Y2); else ctx.lineTo(X2, Y2);
        }
        ctx.stroke();
        // Current operating point
        var opX = pad + (s.S / 30) * (plotR - pad);
        var opY = 16 + (1 - v / 1.2) * (plotB - 16);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(opX, opY, 5, 0, Math.PI * 2); ctx.fill();
        // Vertical line at [S]
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(opX, opY); ctx.lineTo(opX, plotB); ctx.stroke();
        ctx.setLineDash([]);
        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('[S] (mM) →', W / 2, plotB + 14);
        ctx.save(); ctx.translate(8, plotB / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('v (rate)', 0, 0); ctx.restore();
        // Title and stats
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('[S] = ' + s.S.toFixed(1) + '   v = ' + v.toFixed(2) + '   Km = ' + Km.toFixed(1), 8, 16);
        // Inhibitor buttons
        var inhibs = ['none', 'competitive', 'noncompetitive'];
        var inhLabels = ['no inhibitor', 'competitive', 'non-comp.'];
        for (var b = 0; b < 3; b++) {
            var bx = b * (W / 3) + 4, by = H - 60, bw = W / 3 - 8;
            ctx.fillStyle = (s.inhibitor === inhibs[b]) ? '#7eb4ff' : 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx, by, bw, 22);
            ctx.fillStyle = (s.inhibitor === inhibs[b]) ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(inhLabels[b], bx + bw / 2, by + 14);
        }
        // [S] slider
        var sx = 12, sw = W - 24, sy = H - 30;
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sx, sy, sw, 8);
        var f = s.S / 30;
        ctx.fillStyle = '#ff8ec6'; ctx.fillRect(sx, sy, f * sw, 8);
        ctx.fillStyle = '#7eb4ff';
        ctx.beginPath(); ctx.arc(sx + f * sw, sy + 4, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('drag [S]', W / 2, sy - 3);
    });
};

// 24. Reaction rate — bar chart [A], [B] over time, k slider, order toggle
window.MathInteractive['reaction-rate'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.k = 0.05; // rate constant
    s.order = 1;
    s.A = 1.0; s.B = 0.0;
    s.history = [];
    s.t = 0;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function setK(p) {
        var sx = 12, sw = W - 24, sy = H - 30;
        if (p.y >= sy - 6 && p.y <= sy + 18) {
            s.k = Math.max(0.005, Math.min(0.5, (p.x - sx) / sw * 0.5));
        }
    }
    function reset() { s.A = 1.0; s.B = 0.0; s.history = []; s.t = 0; }
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 60 && p.y < H - 36) {
            if (p.x < W / 3) { s.order = 1; reset(); }
            else if (p.x < 2 * W / 3) { s.order = 2; reset(); }
            else reset();
        } else {
            setK(p); s.dragging = true;
        }
    }
    function move(ev) { if (!s.dragging) return; ev.preventDefault(); setK(window.MathInteractive._pos(canvas, ev)); }
    function up() { s.dragging = false; }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'mousemove', move);
    add(c, canvas, 'mouseup', up);
    add(c, canvas, 'touchstart', tap, { passive: false });
    add(c, canvas, 'touchmove', move, { passive: false });
    add(c, canvas, 'touchend', up);

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = Math.min((t - lastT) / 1000, 0.05); lastT = t;
        s.t += dt;
        // Step
        var rate = s.order === 1 ? s.k * s.A : s.k * s.A * s.A;
        s.A = Math.max(0, s.A - rate * dt);
        s.B = 1 - s.A;
        s.history.push({ t: s.t, A: s.A, B: s.B });
        if (s.history.length > 600) s.history.shift();

        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Bar chart on left
        var barX = 16, barY = 30, barW = 30, maxH = H - 100;
        // [A]
        var aH = s.A * maxH;
        ctx.fillStyle = '#7eb4ff';
        ctx.fillRect(barX, barY + maxH - aH, barW, aH);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('[A]', barX + barW / 2, barY + maxH + 14);
        ctx.fillText(s.A.toFixed(2), barX + barW / 2, barY - 4);
        // [B]
        var bH = s.B * maxH;
        ctx.fillStyle = '#ff8ec6';
        ctx.fillRect(barX + 50, barY + maxH - bH, barW, bH);
        ctx.fillText('[B]', barX + 50 + barW / 2, barY + maxH + 14);
        ctx.fillText(s.B.toFixed(2), barX + 50 + barW / 2, barY - 4);
        // Time series on right
        var plotX = 130, plotR = W - 8, plotT = 30, plotB = H - 70;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(plotX, plotT); ctx.lineTo(plotX, plotB); ctx.lineTo(plotR, plotB); ctx.stroke();
        // Plot
        function plotLine(key, color) {
            ctx.strokeStyle = color; ctx.lineWidth = 2;
            ctx.beginPath();
            for (var i = 0; i < s.history.length; i++) {
                var h = s.history[i];
                var X = plotX + (h.t / 60) * (plotR - plotX);
                var Y = plotT + (1 - h[key]) * (plotB - plotT);
                if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
            }
            ctx.stroke();
        }
        plotLine('A', '#7eb4ff');
        plotLine('B', '#ff8ec6');
        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
        var rateExpr = s.order === 1 ? 'rate = k[A]' : 'rate = k[A]²';
        ctx.fillText(rateExpr + '   k = ' + s.k.toFixed(3) + '   t = ' + s.t.toFixed(1) + 's', 130, 18);
        // Buttons
        var ords = [1, 2];
        for (var b = 0; b < 2; b++) {
            var bx = b * (W / 3) + 4, by = H - 60, bw = W / 3 - 8;
            ctx.fillStyle = (s.order === ords[b]) ? '#7eb4ff' : 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx, by, bw, 22);
            ctx.fillStyle = (s.order === ords[b]) ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
            ctx.fillText('order ' + ords[b], bx + bw / 2, by + 14);
        }
        var bx2 = 2 * (W / 3) + 4, by2 = H - 60, bw2 = W / 3 - 8;
        ctx.fillStyle = 'rgba(126,180,255,0.18)';
        ctx.fillRect(bx2, by2, bw2, 22);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('reset', bx2 + bw2 / 2, by2 + 14);
        // k slider
        var sx = 12, sw = W - 24, sy = H - 30;
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sx, sy, sw, 8);
        var f = s.k / 0.5;
        ctx.fillStyle = '#ff8ec6'; ctx.fillRect(sx, sy, f * sw, 8);
        ctx.fillStyle = '#7eb4ff';
        ctx.beginPath(); ctx.arc(sx + f * sw, sy + 4, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('drag k', W / 2, sy - 3);
    });
};

// 25. Central dogma — DNA → RNA → protein animation
window.MathInteractive['central-dogma'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.t = 0;
    s.stage = 0; // 0=transcription, 1=translation
    var bases = 'AUGCAUUGGCCAACGAGGUAA';
    var dna = bases.replace(/U/g, 'T');
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 32) {
            if (p.x < W / 3) { s.stage = 0; s.t = 0; }
            else if (p.x < 2 * W / 3) { s.stage = 1; s.t = 0; }
            else s.t = 0;
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = (t - lastT) / 1000; lastT = t;
        s.t = (s.t + dt * 0.15) % 1;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var baseColor = { A: '#ff8ec6', T: '#76d7c4', U: '#76d7c4', G: '#ffd166', C: '#7eb4ff' };
        if (s.stage === 0) {
            // Transcription: DNA strand (top) → RNA being built
            var dnaY = 50, rnaY = 110;
            var step = Math.min(20, (W - 30) / dna.length);
            var pol = Math.floor(s.t * dna.length);
            // DNA bases
            ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            for (var i = 0; i < dna.length; i++) {
                var x = 16 + i * step;
                ctx.fillStyle = baseColor[dna[i]] || '#fff';
                ctx.beginPath(); ctx.arc(x, dnaY, 7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0c0e1a';
                ctx.fillText(dna[i], x, dnaY + 4);
            }
            // DNA backbone
            ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(16, dnaY); ctx.lineTo(16 + (dna.length - 1) * step, dnaY); ctx.stroke();
            // Polymerase
            var polX = 16 + pol * step;
            ctx.fillStyle = 'rgba(180,140,255,0.5)';
            ctx.beginPath(); ctx.arc(polX, dnaY + 30, 18, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui';
            ctx.fillText('Pol', polX, dnaY + 33);
            // RNA being built
            for (var j = 0; j < pol; j++) {
                var rx = 16 + j * step;
                var rnaB = bases[j];
                ctx.fillStyle = baseColor[rnaB] || '#fff';
                ctx.beginPath(); ctx.arc(rx, rnaY, 7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 12px system-ui';
                ctx.fillText(rnaB, rx, rnaY + 4);
            }
            // RNA backbone
            if (pol > 0) {
                ctx.strokeStyle = 'rgba(255,209,102,0.5)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(16, rnaY); ctx.lineTo(16 + (pol - 1) * step, rnaY); ctx.stroke();
            }
            ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
            ctx.fillText('Transcription: DNA → mRNA', 8, 18);
            ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText('DNA template', 8, dnaY - 12);
            ctx.fillText('mRNA (T → U)', 8, rnaY + 18);
        } else {
            // Translation: mRNA at top with codons; ribosome reads, builds protein
            var rnaY = 50, protY = 130;
            var step = Math.min(18, (W - 30) / bases.length);
            var pos = Math.floor(s.t * (bases.length - 2)); // codon position
            var codonStart = Math.floor(pos / 3) * 3;
            // mRNA bases
            ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            for (var i2 = 0; i2 < bases.length; i2++) {
                var x2 = 16 + i2 * step;
                var inCodon = (i2 >= codonStart && i2 < codonStart + 3);
                ctx.fillStyle = inCodon ? '#fff' : (baseColor[bases[i2]] || '#fff');
                ctx.beginPath(); ctx.arc(x2, rnaY, inCodon ? 8 : 6, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0c0e1a';
                ctx.fillText(bases[i2], x2, rnaY + 4);
            }
            ctx.strokeStyle = 'rgba(255,209,102,0.5)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(16, rnaY); ctx.lineTo(16 + (bases.length - 1) * step, rnaY); ctx.stroke();
            // Ribosome
            var riboX = 16 + (codonStart + 1) * step;
            ctx.fillStyle = 'rgba(126,180,255,0.4)';
            ctx.beginPath(); ctx.arc(riboX, rnaY + 40, 28, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui';
            ctx.fillText('Rib', riboX, rnaY + 44);
            // Protein chain
            var codonTable = { 'AUG': 'Met', 'CAU': 'His', 'UGG': 'Trp', 'CCA': 'Pro', 'ACG': 'Thr', 'AGG': 'Arg', 'UAA': '*' };
            var nCodons = Math.floor(codonStart / 3) + 1;
            var aaColors = ['#7eb4ff', '#ff8ec6', '#ffd166', '#76d7c4', '#b48cff', '#a3e4d7', '#ff9c6e'];
            for (var k = 0; k < nCodons; k++) {
                var codon = bases.substr(k * 3, 3);
                var aa = codonTable[codon] || '?';
                if (aa === '*') break;
                var ax = 30 + k * 36;
                ctx.fillStyle = aaColors[k % aaColors.length];
                ctx.beginPath(); ctx.arc(ax, protY, 14, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 10px system-ui';
                ctx.fillText(aa, ax, protY + 3);
                if (k > 0) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(ax - 36 + 14, protY); ctx.lineTo(ax - 14, protY); ctx.stroke();
                }
            }
            ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
            ctx.fillText('Translation: mRNA → protein', 8, 18);
            ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText('mRNA codons', 8, rnaY - 12);
            ctx.fillText('amino acids', 8, protY + 24);
        }
        // Buttons
        var labels = ['Transcription', 'Translation', 'Restart'];
        for (var b = 0; b < 3; b++) {
            var bx = b * (W / 3) + 4, by = H - 28, bw = W / 3 - 8;
            var active = (b < 2 && s.stage === b);
            ctx.fillStyle = active ? '#7eb4ff' : 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx, by, bw, 24);
            ctx.fillStyle = active ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(labels[b], bx + bw / 2, by + 16);
        }
    });
};

// 26. Antibody binding — drag antigen to Y-shaped antibody, lock-key fit
window.MathInteractive['antibody-binding'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.antigens = [];
    // Generate three antigens of different shapes; only one fits
    var shapes = ['triangle', 'square', 'pentagon'];
    var fitShape = shapes[1];
    for (var i = 0; i < 3; i++) {
        s.antigens.push({
            x: 30 + i * 70,
            y: H - 80,
            shape: shapes[i],
            bound: false,
            dragging: false
        });
    }
    s.bindCount = 0;
    var ab = { x: W / 2, y: 70, fit: fitShape };
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        for (var i = 0; i < s.antigens.length; i++) {
            var a = s.antigens[i];
            if (a.bound) continue;
            if (Math.hypot(p.x - a.x, p.y - a.y) < 22) { a.dragging = true; s.dragIdx = i; return; }
        }
    }
    function move(ev) {
        if (s.dragIdx === undefined) return;
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        var a = s.antigens[s.dragIdx];
        a.x = p.x; a.y = p.y;
    }
    function up() {
        if (s.dragIdx === undefined) return;
        var a = s.antigens[s.dragIdx];
        a.dragging = false;
        // Check binding sites — top of arms
        var sites = [{ x: ab.x - 30, y: ab.y - 24 }, { x: ab.x + 30, y: ab.y - 24 }];
        for (var k = 0; k < sites.length; k++) {
            var site = sites[k];
            if (Math.hypot(a.x - site.x, a.y - site.y) < 22 && a.shape === ab.fit) {
                a.bound = true;
                a.x = site.x; a.y = site.y;
                s.bindCount++;
            }
        }
        s.dragIdx = undefined;
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'mousemove', move);
    add(c, canvas, 'mouseup', up);
    add(c, canvas, 'touchstart', tap, { passive: false });
    add(c, canvas, 'touchmove', move, { passive: false });
    add(c, canvas, 'touchend', up);

    function drawShape(x, y, shape, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        if (shape === 'triangle') {
            ctx.moveTo(x, y - 16); ctx.lineTo(x + 14, y + 10); ctx.lineTo(x - 14, y + 10);
        } else if (shape === 'square') {
            ctx.moveTo(x - 14, y - 12); ctx.lineTo(x + 14, y - 12); ctx.lineTo(x + 14, y + 12); ctx.lineTo(x - 14, y + 12);
        } else {
            for (var k = 0; k < 5; k++) {
                var a = -Math.PI / 2 + k * Math.PI * 2 / 5;
                if (k === 0) ctx.moveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
                else ctx.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
            }
        }
        ctx.closePath(); ctx.fill();
    }
    function drawSocket(x, y, shape) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        if (shape === 'triangle') {
            ctx.moveTo(x, y - 16); ctx.lineTo(x + 14, y + 10); ctx.lineTo(x - 14, y + 10); ctx.closePath();
        } else if (shape === 'square') {
            ctx.rect(x - 14, y - 12, 28, 24);
        } else {
            for (var k = 0; k < 5; k++) {
                var a = -Math.PI / 2 + k * Math.PI * 2 / 5;
                if (k === 0) ctx.moveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
                else ctx.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
            }
            ctx.closePath();
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    var lastT = 0;
    window.MathInteractive._raf(c, function (t) {
        if (t - lastT < 30) return; lastT = t;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Y-shaped antibody
        ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        // Stem
        ctx.beginPath(); ctx.moveTo(ab.x, ab.y); ctx.lineTo(ab.x, ab.y + 50); ctx.stroke();
        // Arms
        ctx.beginPath(); ctx.moveTo(ab.x, ab.y); ctx.lineTo(ab.x - 30, ab.y - 24); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ab.x, ab.y); ctx.lineTo(ab.x + 30, ab.y - 24); ctx.stroke();
        // Binding sockets at top of arms (shape of antigen that fits)
        drawSocket(ab.x - 30, ab.y - 24, ab.fit);
        drawSocket(ab.x + 30, ab.y - 24, ab.fit);
        // Antigens
        var colors = { triangle: '#ff8ec6', square: '#7eb4ff', pentagon: '#ffd166' };
        for (var i = 0; i < s.antigens.length; i++) {
            var a = s.antigens[i];
            var col = colors[a.shape];
            if (a.bound) col = '#76d7c4';
            drawShape(a.x, a.y, a.shape, col);
        }
        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('Antibody-antigen specificity', 8, 16);
        ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText('Drag antigens to the binding sites — only matching shapes lock in.', 8, 32);
        ctx.fillText('bound: ' + s.bindCount + '/2', 8, H - 12);
    });
};

// 27. French flag morphogen — Wolpert gradient with thresholds
window.MathInteractive['french-flag'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.t1 = 0.66; // upper threshold (% of max)
    s.t2 = 0.33; // lower threshold
    s.draggingT1 = false; s.draggingT2 = false;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    var pad = 30;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        var fieldT = 30, fieldB = H - 80;
        var y1 = fieldB - s.t1 * (fieldB - fieldT);
        var y2 = fieldB - s.t2 * (fieldB - fieldT);
        if (Math.abs(p.y - y1) < 12 && p.x > pad && p.x < W - pad) s.draggingT1 = true;
        else if (Math.abs(p.y - y2) < 12 && p.x > pad && p.x < W - pad) s.draggingT2 = true;
    }
    function move(ev) {
        if (!s.draggingT1 && !s.draggingT2) return;
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        var fieldT = 30, fieldB = H - 80;
        var newT = Math.max(0, Math.min(1, (fieldB - p.y) / (fieldB - fieldT)));
        if (s.draggingT1) s.t1 = Math.max(s.t2 + 0.05, newT);
        else if (s.draggingT2) s.t2 = Math.min(s.t1 - 0.05, newT);
    }
    function up() { s.draggingT1 = false; s.draggingT2 = false; }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'mousemove', move);
    add(c, canvas, 'mouseup', up);
    add(c, canvas, 'touchstart', tap, { passive: false });
    add(c, canvas, 'touchmove', move, { passive: false });
    add(c, canvas, 'touchend', up);

    var lastT = 0;
    window.MathInteractive._raf(c, function (t) {
        if (t - lastT < 40) return; lastT = t;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var fieldT = 30, fieldB = H - 80;
        var fieldL = pad, fieldR = W - pad, fieldW = fieldR - fieldL;
        // Cells colored by concentration → fate
        var nCells = 20;
        var cellW = fieldW / nCells;
        for (var i = 0; i < nCells; i++) {
            // Concentration drops left to right (exponential)
            var conc = Math.exp(-i / 8);
            var fate, fillCol;
            if (conc > s.t1) { fate = 'A'; fillCol = '#ff8ec6'; }
            else if (conc > s.t2) { fate = 'B'; fillCol = '#fff4e8'; }
            else { fate = 'C'; fillCol = '#7eb4ff'; }
            // Cell
            ctx.fillStyle = fillCol;
            ctx.fillRect(fieldL + i * cellW + 1, fieldB - 30, cellW - 2, 26);
            // Concentration plot above cells
            var py = fieldB - conc * (fieldB - fieldT);
            ctx.fillStyle = 'rgba(180,140,255,' + conc + ')';
            ctx.fillRect(fieldL + i * cellW, py, cellW, fieldB - py - 30);
        }
        // Concentration curve
        ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (var x = 0; x <= fieldW; x += 2) {
            var conc2 = Math.exp(-x / fieldW * 2.5);
            var X = fieldL + x;
            var Y = fieldB - conc2 * (fieldB - fieldT);
            if (x === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        }
        ctx.stroke();
        // Threshold lines
        var y1 = fieldB - s.t1 * (fieldB - fieldT);
        var y2 = fieldB - s.t2 * (fieldB - fieldT);
        ctx.strokeStyle = '#ff8ec6'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(fieldL, y1); ctx.lineTo(fieldR, y1); ctx.stroke();
        ctx.strokeStyle = '#7eb4ff';
        ctx.beginPath(); ctx.moveTo(fieldL, y2); ctx.lineTo(fieldR, y2); ctx.stroke();
        ctx.setLineDash([]);
        // Threshold handles
        ctx.fillStyle = '#ff8ec6';
        ctx.beginPath(); ctx.arc(fieldR + 8, y1, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7eb4ff';
        ctx.beginPath(); ctx.arc(fieldR + 8, y2, 7, 0, Math.PI * 2); ctx.fill();
        // Labels
        ctx.fillStyle = '#ff8ec6'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
        ctx.fillText('θ₁ = ' + s.t1.toFixed(2), fieldR - 4, y1 - 4);
        ctx.fillStyle = '#7eb4ff';
        ctx.fillText('θ₂ = ' + s.t2.toFixed(2), fieldR - 4, y2 - 4);
        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('Morphogen gradient — French flag model', 8, 16);
        ctx.font = '10px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText('drag thresholds to reshape fate map', 8, H - 12);
        // Region key
        ctx.fillStyle = '#ff8ec6'; ctx.fillRect(8, fieldB - 30, 14, 14);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('fate A', 26, fieldB - 18);
        ctx.fillStyle = '#fff4e8'; ctx.fillRect(72, fieldB - 30, 14, 14);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('fate B', 90, fieldB - 18);
        ctx.fillStyle = '#7eb4ff'; ctx.fillRect(136, fieldB - 30, 14, 14);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('fate C', 154, fieldB - 18);
    });
};

// 28. Tectonic boundaries — toggle divergent/convergent/transform
window.MathInteractive['tectonic-boundaries'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.mode = 'divergent';
    s.t = 0;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 32) {
            if (p.x < W / 3) s.mode = 'divergent';
            else if (p.x < 2 * W / 3) s.mode = 'convergent';
            else s.mode = 'transform';
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = (t - lastT) / 1000; lastT = t;
        s.t = (s.t + dt * 0.3) % 1;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var groundY = H - 60;
        var midX = W / 2;
        // Sky
        ctx.fillStyle = 'rgba(126,180,255,0.05)';
        ctx.fillRect(0, 0, W, groundY - 40);
        // Mantle
        ctx.fillStyle = 'rgba(255,142,198,0.15)';
        ctx.fillRect(0, groundY, W, H - groundY);
        if (s.mode === 'divergent') {
            // Two plates moving apart, magma rises
            var sep = 30 + s.t * 60;
            // Left plate
            ctx.fillStyle = '#7eb4ff';
            ctx.fillRect(0, groundY - 30, midX - sep / 2, 30);
            // Right plate
            ctx.fillRect(midX + sep / 2, groundY - 30, W - midX - sep / 2, 30);
            // Magma rising
            ctx.fillStyle = 'rgba(255,142,198,0.7)';
            ctx.beginPath();
            ctx.moveTo(midX - sep / 2, groundY);
            ctx.lineTo(midX + sep / 2, groundY);
            ctx.lineTo(midX + sep / 4, groundY - 24);
            ctx.lineTo(midX - sep / 4, groundY - 24);
            ctx.closePath(); ctx.fill();
            // New crust forming
            ctx.fillStyle = '#ff8ec6';
            ctx.fillRect(midX - sep / 2 + 2, groundY - 4, sep - 4, 4);
            // Arrows
            drawArrow(ctx, midX - sep / 2 - 30, groundY - 15, midX - sep / 2 - 50, groundY - 15, '#ffd166');
            drawArrow(ctx, midX + sep / 2 + 30, groundY - 15, midX + sep / 2 + 50, groundY - 15, '#ffd166');
            // Title
            ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            ctx.fillText('Divergent — mid-ocean ridge / rift valley', W / 2, 24);
            ctx.font = '11px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.65)';
            ctx.fillText('Plates pull apart; magma rises and creates new crust.', W / 2, 42);
        } else if (s.mode === 'convergent') {
            // Subduction: ocean plate (right) under continental (left)
            var push = s.t * 30;
            // Continent (thicker)
            ctx.fillStyle = '#a3e4d7';
            ctx.beginPath();
            ctx.moveTo(0, groundY - 30);
            ctx.lineTo(midX - 10 + push * 0.1, groundY - 30);
            ctx.lineTo(midX - 10 + push * 0.1, groundY - 50);
            ctx.lineTo(midX - 50 + push * 0.1, groundY - 70);
            ctx.lineTo(midX - 80, groundY - 30);
            ctx.lineTo(0, groundY - 30); ctx.closePath(); ctx.fill();
            ctx.lineTo(0, groundY); ctx.fillRect(0, groundY - 30, midX - 10 + push * 0.1, 30);
            // Mountain on continent
            ctx.fillStyle = '#76d7c4';
            ctx.beginPath();
            ctx.moveTo(midX - 80, groundY - 30);
            ctx.lineTo(midX - 50 + push * 0.1, groundY - 70);
            ctx.lineTo(midX - 10 + push * 0.1, groundY - 50);
            ctx.lineTo(midX - 10 + push * 0.1, groundY - 30);
            ctx.closePath(); ctx.fill();
            // Ocean plate, subducting
            ctx.fillStyle = '#7eb4ff';
            ctx.beginPath();
            ctx.moveTo(midX - 5 + push * 0.1, groundY - 22);
            ctx.lineTo(W, groundY - 22);
            ctx.lineTo(W, groundY);
            ctx.lineTo(midX + 30 + push * 0.1, groundY);
            ctx.lineTo(midX - 25 + push * 0.1, groundY + 50);
            ctx.lineTo(midX - 25 + push * 0.1, groundY + 30);
            ctx.lineTo(midX - 5 + push * 0.1, groundY - 8);
            ctx.closePath(); ctx.fill();
            // Volcano
            ctx.fillStyle = 'rgba(255,142,198,0.8)';
            ctx.beginPath();
            ctx.arc(midX - 35 + push * 0.1, groundY + 30, 8, 0, Math.PI * 2); ctx.fill();
            // Arrows
            drawArrow(ctx, 30, groundY - 15, 50, groundY - 15, '#ffd166');
            drawArrow(ctx, W - 30, groundY - 15, W - 50, groundY - 15, '#ffd166');
            ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            ctx.fillText('Convergent — subduction zone / mountain belt', W / 2, 24);
            ctx.font = '11px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.65)';
            ctx.fillText('Plates collide; one dives below — trench, volcanoes, mountains.', W / 2, 42);
        } else {
            // Transform: plates slide past, fault between
            var slide = s.t * 30;
            // Top half slides left, bottom slides right (horizontal fault)
            ctx.fillStyle = '#7eb4ff';
            ctx.fillRect(-slide, groundY - 60, W, 30);
            ctx.fillStyle = '#a3e4d7';
            ctx.fillRect(slide, groundY - 30, W, 30);
            // Fault line
            ctx.strokeStyle = '#ff8ec6'; ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            ctx.beginPath(); ctx.moveTo(0, groundY - 30); ctx.lineTo(W, groundY - 30); ctx.stroke();
            ctx.setLineDash([]);
            // Arrows
            drawArrow(ctx, midX, groundY - 50, midX - 30, groundY - 50, '#ffd166');
            drawArrow(ctx, midX, groundY - 12, midX + 30, groundY - 12, '#ffd166');
            ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            ctx.fillText('Transform — strike-slip fault', W / 2, 24);
            ctx.font = '11px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.65)';
            ctx.fillText('Plates slide past each other (e.g. San Andreas) — earthquakes.', W / 2, 42);
        }
        // Buttons
        var modes = ['divergent', 'convergent', 'transform'];
        var labels = ['Divergent', 'Convergent', 'Transform'];
        for (var b = 0; b < 3; b++) {
            var bx = b * (W / 3) + 4, by = H - 28, bw = W / 3 - 8;
            ctx.fillStyle = (s.mode === modes[b]) ? '#7eb4ff' : 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx, by, bw, 24);
            ctx.fillStyle = (s.mode === modes[b]) ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(labels[b], bx + bw / 2, by + 16);
        }
    });
    function drawArrow(ctx, x1, y1, x2, y2, color) {
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        var ang = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 8 * Math.cos(ang - 0.4), y2 - 8 * Math.sin(ang - 0.4));
        ctx.lineTo(x2 - 8 * Math.cos(ang + 0.4), y2 - 8 * Math.sin(ang + 0.4));
        ctx.closePath(); ctx.fill();
    }
};

// 29. Eruption styles — viscosity & gas sliders, magma cross-section
window.MathInteractive['eruption-styles'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.viscosity = 0.3; // 0=low (basaltic), 1=high (rhyolitic)
    s.gas = 0.4;       // 0=dry, 1=high
    s.t = 0;
    s.particles = [];
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function setSlider(p) {
        var sx = 12, sw = (W / 2) - 24, sy1 = H - 56, sy2 = H - 30;
        if (Math.abs(p.y - sy1 - 4) < 12) {
            if (p.x < W / 2) s.viscosity = Math.max(0, Math.min(1, (p.x - sx) / sw));
            else s.gas = Math.max(0, Math.min(1, (p.x - W / 2 - 12) / sw));
        } else if (Math.abs(p.y - sy2 - 4) < 12) {
            if (p.x < W / 2) s.viscosity = Math.max(0, Math.min(1, (p.x - sx) / sw));
            else s.gas = Math.max(0, Math.min(1, (p.x - W / 2 - 12) / sw));
        }
    }
    function tap(ev) { ev.preventDefault(); setSlider(window.MathInteractive._pos(canvas, ev)); s.dragging = true; }
    function move(ev) { if (!s.dragging) return; ev.preventDefault(); setSlider(window.MathInteractive._pos(canvas, ev)); }
    function up() { s.dragging = false; }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'mousemove', move);
    add(c, canvas, 'mouseup', up);
    add(c, canvas, 'touchstart', tap, { passive: false });
    add(c, canvas, 'touchmove', move, { passive: false });
    add(c, canvas, 'touchend', up);

    var lastT = performance.now();
    window.MathInteractive._raf(c, function (t) {
        var dt = Math.min((t - lastT) / 1000, 0.04); lastT = t;
        s.t += dt;
        // Explosivity: high viscosity + high gas = explosive
        var explosivity = s.viscosity * 0.6 + s.gas * 0.4;
        // Spawn particles
        var nSpawn = 1 + Math.floor(explosivity * 4);
        if (Math.random() < explosivity * 0.9 + 0.1) {
            for (var k = 0; k < nSpawn; k++) {
                var spread = 2 + explosivity * 60;
                var spd = 30 + explosivity * 200;
                s.particles.push({
                    x: W / 2 + (Math.random() - 0.5) * 6,
                    y: H - 80,
                    vx: (Math.random() - 0.5) * spread,
                    vy: -spd * (0.5 + Math.random() * 0.5),
                    life: 2 + Math.random() * 2,
                    type: explosivity > 0.5 ? 'ash' : 'lava'
                });
            }
        }
        // Update particles
        for (var i = s.particles.length - 1; i >= 0; i--) {
            var p = s.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 90 * dt; // gravity
            p.life -= dt;
            if (p.life < 0 || p.y > H - 60) s.particles.splice(i, 1);
        }
        // Cap
        if (s.particles.length > 300) s.particles.splice(0, s.particles.length - 300);

        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Sky gradient
        var grd = ctx.createLinearGradient(0, 0, 0, H - 60);
        grd.addColorStop(0, '#0c0e1a');
        grd.addColorStop(1, 'rgba(255,142,198,' + (0.05 + explosivity * 0.15) + ')');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H - 60);
        // Volcano cone
        ctx.fillStyle = '#3a3a5a';
        ctx.beginPath();
        ctx.moveTo(W / 2 - 110, H - 60);
        ctx.lineTo(W / 2 - 16, H - 80);
        ctx.lineTo(W / 2 + 16, H - 80);
        ctx.lineTo(W / 2 + 110, H - 60);
        ctx.closePath(); ctx.fill();
        // Magma chamber
        ctx.fillStyle = 'rgba(255,142,198,0.6)';
        ctx.beginPath(); ctx.ellipse(W / 2, H - 30, 50, 18, 0, 0, Math.PI * 2); ctx.fill();
        // Conduit
        ctx.fillStyle = 'rgba(255,142,198,0.6)';
        ctx.fillRect(W / 2 - 8, H - 80, 16, 50);
        // Particles
        for (var j = 0; j < s.particles.length; j++) {
            var pj = s.particles[j];
            if (pj.type === 'ash') {
                ctx.fillStyle = 'rgba(80,80,90,' + Math.min(1, pj.life / 2) + ')';
                ctx.beginPath(); ctx.arc(pj.x, pj.y, 2, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = '#ff8ec6';
                ctx.beginPath(); ctx.arc(pj.x, pj.y, 2.5, 0, Math.PI * 2); ctx.fill();
            }
        }
        // For low explosivity — lava flow on side
        if (explosivity < 0.4) {
            ctx.strokeStyle = '#ff8ec6'; ctx.lineWidth = 6; ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(W / 2 + 8, H - 80);
            ctx.quadraticCurveTo(W / 2 + 50, H - 70, W / 2 + 95, H - 62);
            ctx.stroke();
        }
        // Style label
        var styleName = explosivity < 0.3 ? 'Hawaiian (effusive)' :
                        explosivity < 0.55 ? 'Strombolian' :
                        explosivity < 0.75 ? 'Vulcanian' : 'Plinian (explosive)';
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(styleName, W / 2, 18);
        // Sliders
        var sx = 12, sw = (W / 2) - 24;
        var sy1 = H - 56, sy2 = H - 30;
        // Viscosity
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sx, sy1, sw, 8);
        ctx.fillStyle = '#ffd166'; ctx.fillRect(sx, sy1, s.viscosity * sw, 8);
        ctx.fillStyle = '#ffd166';
        ctx.beginPath(); ctx.arc(sx + s.viscosity * sw, sy1 + 4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('viscosity', sx, sy1 - 3);
        // Gas
        var sxG = W / 2 + 12;
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sxG, sy1, sw, 8);
        ctx.fillStyle = '#ff8ec6'; ctx.fillRect(sxG, sy1, s.gas * sw, 8);
        ctx.fillStyle = '#ff8ec6';
        ctx.beginPath(); ctx.arc(sxG + s.gas * sw, sy1 + 4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '10px system-ui';
        ctx.fillText('gas', sxG, sy1 - 3);
        // Bottom row: same labels for affordance
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('low ← viscosity → high', sx + sw / 2, sy2 + 14);
        ctx.fillText('dry ← gas → wet', sxG + sw / 2, sy2 + 14);
    });
};

// 30. Truth tables — interactive operator selection
window.MathInteractive['truth-tables'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    s.op = 'AND';
    var ops = ['AND', 'OR', 'NOT', 'IMP', 'IFF', 'XOR'];
    var symbols = { AND: '∧', OR: '∨', NOT: '¬', IMP: '→', IFF: '↔', XOR: '⊕' };
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 32) {
            var bw = W / 6;
            var idx = Math.floor(p.x / bw);
            if (idx >= 0 && idx < 6) s.op = ops[idx];
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });
    function compute(p, q) {
        if (s.op === 'AND') return p && q;
        if (s.op === 'OR') return p || q;
        if (s.op === 'NOT') return !p;
        if (s.op === 'IMP') return !p || q;
        if (s.op === 'IFF') return p === q;
        if (s.op === 'XOR') return p !== q;
    }

    var lastT = 0;
    window.MathInteractive._raf(c, function (t) {
        if (t - lastT < 80) return; lastT = t;
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        var unary = (s.op === 'NOT');
        // Title
        var expr;
        if (unary) expr = '¬p';
        else expr = 'p ' + symbols[s.op] + ' q';
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(expr, W / 2, 30);
        // Build table
        var rows = unary ? [[1], [0]] : [[1, 1], [1, 0], [0, 1], [0, 0]];
        var nCols = unary ? 2 : 3;
        var tableW = Math.min(W - 40, 300);
        var colW = tableW / nCols;
        var tableX = (W - tableW) / 2;
        var headerY = 56, rowH = 32;
        // Header
        ctx.fillStyle = 'rgba(126,180,255,0.2)';
        ctx.fillRect(tableX, headerY, tableW, rowH);
        ctx.fillStyle = '#7eb4ff'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
        if (unary) {
            ctx.fillText('p', tableX + colW / 2, headerY + 22);
            ctx.fillText('¬p', tableX + colW + colW / 2, headerY + 22);
        } else {
            ctx.fillText('p', tableX + colW / 2, headerY + 22);
            ctx.fillText('q', tableX + colW + colW / 2, headerY + 22);
            ctx.fillText(expr, tableX + 2 * colW + colW / 2, headerY + 22);
        }
        // Rows
        for (var i = 0; i < rows.length; i++) {
            var rY = headerY + (i + 1) * rowH;
            ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)';
            ctx.fillRect(tableX, rY, tableW, rowH);
            var p = rows[i][0];
            var q = unary ? null : rows[i][1];
            var r = unary ? compute(p, null) : compute(p, q);
            ctx.font = '14px system-ui'; ctx.textAlign = 'center';
            ctx.fillStyle = p ? '#7eb4ff' : 'rgba(255,255,255,0.5)';
            ctx.fillText(p ? 'T' : 'F', tableX + colW / 2, rY + 22);
            if (!unary) {
                ctx.fillStyle = q ? '#7eb4ff' : 'rgba(255,255,255,0.5)';
                ctx.fillText(q ? 'T' : 'F', tableX + colW + colW / 2, rY + 22);
            }
            ctx.fillStyle = r ? '#ff8ec6' : 'rgba(255,255,255,0.5)';
            ctx.font = 'bold 14px system-ui';
            ctx.fillText(r ? 'T' : 'F', tableX + (nCols - 1) * colW + colW / 2, rY + 22);
        }
        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
        for (var ci = 0; ci <= nCols; ci++) {
            ctx.beginPath();
            ctx.moveTo(tableX + ci * colW, headerY);
            ctx.lineTo(tableX + ci * colW, headerY + (rows.length + 1) * rowH);
            ctx.stroke();
        }
        for (var ri = 0; ri <= rows.length + 1; ri++) {
            ctx.beginPath();
            ctx.moveTo(tableX, headerY + ri * rowH);
            ctx.lineTo(tableX + tableW, headerY + ri * rowH);
            ctx.stroke();
        }
        // Op buttons
        for (var b = 0; b < 6; b++) {
            var bx = b * (W / 6), by = H - 28, bw = W / 6 - 2;
            ctx.fillStyle = (s.op === ops[b]) ? '#7eb4ff' : 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx + 1, by, bw, 24);
            ctx.fillStyle = (s.op === ops[b]) ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(symbols[ops[b]], bx + bw / 2 + 1, by + 17);
        }
    });
};

window.MathInteractive['bfs-dfs'] = function (c, cfg) {
    var ctx = c.ctx, W = c.width, H = c.height;
    var s = c.interactive.state;
    // Build a small graph
    var cx = W / 2, cy = (H - 40) / 2 + 8;
    s.nodes = [
        { x: cx, y: cy - 70, id: 0 },
        { x: cx - 80, y: cy - 20, id: 1 },
        { x: cx + 80, y: cy - 20, id: 2 },
        { x: cx - 100, y: cy + 60, id: 3 },
        { x: cx - 30, y: cy + 70, id: 4 },
        { x: cx + 30, y: cy + 70, id: 5 },
        { x: cx + 100, y: cy + 60, id: 6 }
    ];
    s.edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,4],[5,6]];
    s.adj = [];
    for (var i = 0; i < s.nodes.length; i++) s.adj.push([]);
    for (var e = 0; e < s.edges.length; e++) { s.adj[s.edges[e][0]].push(s.edges[e][1]); s.adj[s.edges[e][1]].push(s.edges[e][0]); }
    s.mode = 'bfs';
    s.queue = [0]; s.stack = [0];
    s.visited = new Set();
    s.discovered = new Set([0]);
    s.order = [];
    s.done = false;
    var lastStep = 0;
    var add = window.MathInteractive._addListener, canvas = c.canvas;
    function reset() {
        s.queue = [0]; s.stack = [0];
        s.visited = new Set();
        s.discovered = new Set([0]);
        s.order = [];
        s.done = false;
    }
    function step() {
        if (s.done) return;
        if (s.mode === 'bfs') {
            if (!s.queue.length) { s.done = true; return; }
            var u = s.queue.shift();
            if (s.visited.has(u)) return step();
            s.visited.add(u); s.order.push(u);
            for (var i = 0; i < s.adj[u].length; i++) {
                var v = s.adj[u][i];
                if (!s.discovered.has(v)) { s.discovered.add(v); s.queue.push(v); }
            }
        } else {
            if (!s.stack.length) { s.done = true; return; }
            var u2 = s.stack.pop();
            if (s.visited.has(u2)) return step();
            s.visited.add(u2); s.order.push(u2); s.discovered.add(u2);
            for (var j = s.adj[u2].length - 1; j >= 0; j--) {
                var v2 = s.adj[u2][j];
                if (!s.visited.has(v2)) { s.discovered.add(v2); s.stack.push(v2); }
            }
        }
    }
    function tap(ev) {
        ev.preventDefault();
        var p = window.MathInteractive._pos(canvas, ev);
        if (p.y > H - 32) {
            if (p.x < W / 3) { s.mode = 'bfs'; reset(); }
            else if (p.x < 2 * W / 3) { s.mode = 'dfs'; reset(); }
            else reset();
        }
    }
    add(c, canvas, 'mousedown', tap);
    add(c, canvas, 'touchstart', tap, { passive: false });

    window.MathInteractive._raf(c, function (t) {
        if (t - lastStep > 700) { step(); lastStep = t; }
        ctx.fillStyle = '#0c0e1a'; ctx.fillRect(0, 0, W, H);
        // Edges
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5;
        for (var i = 0; i < s.edges.length; i++) {
            var a = s.nodes[s.edges[i][0]], b = s.nodes[s.edges[i][1]];
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        // Nodes
        for (var n = 0; n < s.nodes.length; n++) {
            var nd = s.nodes[n];
            var col;
            if (s.visited.has(n)) col = '#7eb4ff';
            else if (s.discovered.has(n)) col = '#ffd166';
            else col = 'rgba(255,255,255,0.2)';
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(nd.x, nd.y, 14, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0c0e1a'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(n.toString(), nd.x, nd.y + 4);
        }
        // Order display
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
        ctx.fillText('order: ' + s.order.join(' → '), 6, 14);
        // Buttons
        var labels = ['BFS', 'DFS', 'Reset'];
        for (var b = 0; b < 3; b++) {
            var bx = b * (W / 3) + 4, by = H - 28, bw = W / 3 - 8;
            var active = (b < 2 && s.mode === ['bfs', 'dfs'][b]);
            ctx.fillStyle = active ? '#7eb4ff' : 'rgba(126,180,255,0.18)';
            ctx.fillRect(bx, by, bw, 24);
            ctx.fillStyle = active ? '#0c0e1a' : 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
            ctx.fillText(labels[b], bx + bw / 2, by + 16);
        }
    });
};
