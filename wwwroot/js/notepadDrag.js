window.NotepadDrag = (function () {
    var STORAGE_KEY = 'notepad-pos-v1';
    var DRAG_THRESHOLD = 6;
    var initialized = false;

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function applyPos(wrapper, x, y) {
        var rect = wrapper.getBoundingClientRect();
        var maxX = window.innerWidth - rect.width - 4;
        var maxY = window.innerHeight - rect.height - 4;
        x = clamp(x, 4, Math.max(4, maxX));
        y = clamp(y, 4, Math.max(4, maxY));
        wrapper.style.left = x + 'px';
        wrapper.style.top = y + 'px';
        wrapper.style.right = 'auto';
        wrapper.style.bottom = 'auto';
    }

    function loadPos() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var p = JSON.parse(raw);
            if (typeof p.x === 'number' && typeof p.y === 'number') return p;
        } catch (e) {}
        return null;
    }

    function savePos(x, y) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x, y: y })); } catch (e) {}
    }

    function init(wrapper) {
        if (!wrapper) return;
        if (wrapper.dataset.draggableInit === '1') {
            // Re-apply saved pos in case wrapper was re-created
            var p = loadPos();
            if (p) applyPos(wrapper, p.x, p.y);
            return;
        }
        wrapper.dataset.draggableInit = '1';

        var button = wrapper.querySelector('.notepad-toggle');
        if (!button) return;

        var saved = loadPos();
        if (saved) applyPos(wrapper, saved.x, saved.y);

        var dragging = false;
        var moved = false;
        var startX = 0, startY = 0;
        var originX = 0, originY = 0;
        var pointerId = null;

        function onPointerDown(e) {
            // Only primary button / touch / pen
            if (e.button !== undefined && e.button !== 0) return;
            // Don't start drag if panel is open and user clicks inside textarea/header
            if (e.target.closest && e.target.closest('.notepad-panel')) return;

            dragging = true;
            moved = false;
            pointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            var rect = wrapper.getBoundingClientRect();
            originX = rect.left;
            originY = rect.top;
            try { button.setPointerCapture(e.pointerId); } catch (err) {}
        }

        function onPointerMove(e) {
            if (!dragging || e.pointerId !== pointerId) return;
            var dx = e.clientX - startX;
            var dy = e.clientY - startY;
            if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
            moved = true;
            e.preventDefault();
            applyPos(wrapper, originX + dx, originY + dy);
        }

        function onPointerUp(e) {
            if (!dragging || e.pointerId !== pointerId) return;
            dragging = false;
            try { button.releasePointerCapture(e.pointerId); } catch (err) {}
            if (moved) {
                var rect = wrapper.getBoundingClientRect();
                savePos(rect.left, rect.top);
            }
            // Suppress the click that follows a drag, otherwise toggles notepad.
            if (moved) {
                var suppress = function (ev) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    button.removeEventListener('click', suppress, true);
                };
                button.addEventListener('click', suppress, true);
                // Safety: remove after a tick in case click never fires.
                setTimeout(function () {
                    button.removeEventListener('click', suppress, true);
                }, 400);
            }
            pointerId = null;
        }

        button.addEventListener('pointerdown', onPointerDown);
        button.addEventListener('pointermove', onPointerMove);
        button.addEventListener('pointerup', onPointerUp);
        button.addEventListener('pointercancel', onPointerUp);

        if (!initialized) {
            initialized = true;
            window.addEventListener('resize', function () {
                var p = loadPos();
                if (!p) return;
                var w = document.querySelector('.notepad-wrapper');
                if (w) applyPos(w, p.x, p.y);
            });
        }
    }

    return { init: init };
})();
