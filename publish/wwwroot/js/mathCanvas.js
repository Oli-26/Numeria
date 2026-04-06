// MathVoyager Canvas Visualization Engine
window.MathCanvas = {
    canvases: {},

    init: function (canvasId, width, height) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;

        var dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        this.canvases[canvasId] = { canvas: canvas, ctx: ctx, width: width, height: height, dpr: dpr };
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
        ctx.strokeStyle = 'rgba(74, 95, 224, 0.08)';
        ctx.lineWidth = 1;
        for (var x = cx % scaleX; x < c.width; x += scaleX) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke();
        }
        for (var y = cy % scaleY; y < c.height; y += scaleY) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(26, 26, 46, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(c.width, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, c.height); ctx.stroke();

        // Labels
        ctx.fillStyle = 'rgba(26, 26, 46, 0.5)';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        var range = Math.floor(c.width / 2 / scaleX);
        for (var i = -range; i <= range; i++) {
            if (i === 0) continue;
            ctx.fillText(i, cx + i * scaleX, cy + 16);
        }
        var rangeY = Math.floor(c.height / 2 / scaleY);
        ctx.textAlign = 'right';
        for (var j = -rangeY; j <= rangeY; j++) {
            if (j === 0) continue;
            ctx.fillText(-j, cx - 6, cy + j * scaleY + 4);
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
            ctx.font = 'bold 13px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(label, endX + 15 * Math.cos(angle + 0.5), endY + 15 * Math.sin(angle + 0.5));
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
            ctx.font = '12px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y - 10);
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
        ctx.font = (fontSize || 14) + 'px system-ui';
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
    }
};
