window.DrawPad = (function () {
    var pads = {};

    function init(canvasId) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;
        if (pads[canvasId]) destroy(canvasId);

        var ctx = canvas.getContext('2d');
        var pad = {
            canvas: canvas,
            ctx: ctx,
            strokes: [],
            current: null,
            drawing: false,
            color: getInkColor(),
            width: 2.2
        };

        function resize() {
            var dpr = window.devicePixelRatio || 1;
            var rect = canvas.getBoundingClientRect();
            var w = rect.width || canvas.clientWidth;
            var h = rect.height || canvas.clientHeight;
            canvas.width = Math.max(1, Math.floor(w * dpr));
            canvas.height = Math.max(1, Math.floor(h * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            redraw();
        }

        function redraw() {
            var rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);
            for (var i = 0; i < pad.strokes.length; i++) drawStroke(pad.strokes[i]);
            if (pad.current) drawStroke(pad.current);
        }

        function drawStroke(s) {
            if (!s.points || s.points.length === 0) return;
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(s.points[0].x, s.points[0].y);
            for (var i = 1; i < s.points.length; i++) {
                ctx.lineTo(s.points[i].x, s.points[i].y);
            }
            ctx.stroke();
        }

        function pos(ev) {
            var rect = canvas.getBoundingClientRect();
            var x = (ev.clientX !== undefined ? ev.clientX : (ev.touches && ev.touches[0].clientX)) - rect.left;
            var y = (ev.clientY !== undefined ? ev.clientY : (ev.touches && ev.touches[0].clientY)) - rect.top;
            return { x: x, y: y };
        }

        function start(ev) {
            ev.preventDefault();
            pad.drawing = true;
            pad.color = getInkColor();
            pad.current = { points: [pos(ev)], color: pad.color, width: pad.width };
            redraw();
        }

        function move(ev) {
            if (!pad.drawing || !pad.current) return;
            ev.preventDefault();
            pad.current.points.push(pos(ev));
            redraw();
        }

        function end(ev) {
            if (!pad.drawing) return;
            ev.preventDefault();
            pad.drawing = false;
            if (pad.current && pad.current.points.length > 0) {
                pad.strokes.push(pad.current);
            }
            pad.current = null;
            redraw();
        }

        var _touchPreventStart = function (e) { e.preventDefault(); };
        var _touchPreventMove = function (e) { e.preventDefault(); };

        canvas.addEventListener('pointerdown', start);
        canvas.addEventListener('pointermove', move);
        canvas.addEventListener('pointerup', end);
        canvas.addEventListener('pointercancel', end);
        canvas.addEventListener('pointerleave', end);
        canvas.addEventListener('touchstart', _touchPreventStart, { passive: false });
        canvas.addEventListener('touchmove', _touchPreventMove, { passive: false });

        pad._cleanup = function () {
            canvas.removeEventListener('pointerdown', start);
            canvas.removeEventListener('pointermove', move);
            canvas.removeEventListener('pointerup', end);
            canvas.removeEventListener('pointercancel', end);
            canvas.removeEventListener('pointerleave', end);
            canvas.removeEventListener('touchstart', _touchPreventStart);
            canvas.removeEventListener('touchmove', _touchPreventMove);
            window.removeEventListener('resize', onResize);
        };

        function onResize() { resize(); }
        window.addEventListener('resize', onResize);

        pad.resize = resize;
        pad.redraw = redraw;
        pads[canvasId] = pad;
        resize();
    }

    function getInkColor() {
        try {
            var c = getComputedStyle(document.body).getPropertyValue('--text-primary').trim();
            return c || '#222';
        } catch (e) { return '#222'; }
    }

    function clear(canvasId) {
        var pad = pads[canvasId];
        if (!pad) return;
        pad.strokes = [];
        pad.current = null;
        pad.redraw();
    }

    function undo(canvasId) {
        var pad = pads[canvasId];
        if (!pad) return;
        pad.strokes.pop();
        pad.redraw();
    }

    function destroy(canvasId) {
        var pad = pads[canvasId];
        if (!pad) return;
        if (pad._cleanup) pad._cleanup();
        delete pads[canvasId];
    }

    return { init: init, clear: clear, undo: undo, destroy: destroy };
})();
