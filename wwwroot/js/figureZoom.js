// Tapping a lesson figure opens it full screen, where it can be pinched, dragged and double-tapped to zoom.
// The page viewport disables browser zoom, so the scaling here is done with a CSS transform.
(function () {
    var view = null, img = null;
    var scale = 1, x = 0, y = 0;
    var pointers = {}, start = null, lastTap = 0, moved = false;

    function apply() {
        img.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
    }

    function clamp() {
        // Keep some of the picture on screen however far it is dragged.
        var w = img.offsetWidth * scale, h = img.offsetHeight * scale;
        var mx = Math.max(0, (w - window.innerWidth) / 2 + 40), my = Math.max(0, (h - window.innerHeight) / 2 + 40);
        x = Math.max(-mx, Math.min(mx, x));
        y = Math.max(-my, Math.min(my, y));
    }

    function zoomAt(s, cx, cy) {
        var ns = Math.max(1, Math.min(6, s));
        // Zoom about the point under the finger: offsets are measured from the screen centre.
        var ox = cx - window.innerWidth / 2, oy = cy - window.innerHeight / 2;
        x = ox - (ox - x) * ns / scale;
        y = oy - (oy - y) * ns / scale;
        scale = ns;
        if (scale === 1) { x = 0; y = 0; }
        clamp();
        apply();
    }

    function close() {
        if (!view) return;
        view.remove();
        view = img = null;
        pointers = {};
    }

    function open(source) {
        close();
        scale = 1; x = 0; y = 0;
        view = document.createElement('div');
        view.className = 'figure-zoom';
        view.setAttribute('role', 'dialog');
        view.setAttribute('aria-label', source.alt || 'Figure');
        img = document.createElement('img');
        img.src = source.currentSrc || source.src;
        img.alt = source.alt || '';
        img.draggable = false;
        var btn = document.createElement('button');
        btn.className = 'figure-zoom-close';
        btn.setAttribute('aria-label', 'Close');
        btn.textContent = '×';
        btn.addEventListener('click', function (e) { e.stopPropagation(); close(); });
        view.appendChild(img);
        view.appendChild(btn);
        var cap = source.closest('figure') && source.closest('figure').querySelector('figcaption');
        if (cap) {
            var c = document.createElement('div');
            c.className = 'figure-zoom-caption';
            c.textContent = cap.textContent;
            view.appendChild(c);
        }
        view.addEventListener('pointerdown', down);
        view.addEventListener('pointermove', move);
        view.addEventListener('pointerup', up);
        view.addEventListener('pointercancel', up);
        view.addEventListener('wheel', function (e) {
            e.preventDefault();
            zoomAt(scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY);
        }, { passive: false });
        document.body.appendChild(view);
    }

    function pair() {
        var p = Object.keys(pointers).map(function (k) { return pointers[k]; });
        return { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), cx: (p[0].x + p[1].x) / 2, cy: (p[0].y + p[1].y) / 2 };
    }

    function down(e) {
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        moved = false;
        var n = Object.keys(pointers).length;
        if (n === 2) { var p = pair(); start = { d: p.d, s: scale }; }
        else if (n === 1) start = { px: e.clientX, py: e.clientY, x: x, y: y };
    }

    function move(e) {
        if (!pointers[e.pointerId]) return;
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        var n = Object.keys(pointers).length;
        if (n === 2 && start && start.d) {
            var p = pair();
            moved = true;
            zoomAt(start.s * p.d / start.d, p.cx, p.cy);
        } else if (n === 1 && start && start.px !== undefined) {
            var dx = e.clientX - start.px, dy = e.clientY - start.py;
            if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
            if (scale > 1) { x = start.x + dx; y = start.y + dy; clamp(); apply(); }
        }
    }

    function up(e) {
        delete pointers[e.pointerId];
        var n = Object.keys(pointers).length;
        if (n === 1) {
            var k = Object.keys(pointers)[0];
            start = { px: pointers[k].x, py: pointers[k].y, x: x, y: y };
            return;
        }
        if (n > 0 || moved) return;
        var now = Date.now();
        if (now - lastTap < 300) {
            lastTap = 0;
            zoomAt(scale > 1 ? 1 : 2.5, e.clientX, e.clientY);
        } else {
            lastTap = now;
            // A single tap outside the picture closes the viewer, once the double-tap window has passed.
            var onImage = e.target === img;
            setTimeout(function () { if (lastTap === now && !onImage && scale === 1) close(); }, 300);
        }
    }

    document.addEventListener('click', function (e) {
        var fig = e.target.closest && e.target.closest('.concept-figure img');
        if (fig && !view) { e.preventDefault(); open(fig); }
    });

    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
    });
    window.addEventListener('popstate', close);

    window.NousFigureZoom = { get isOpen() { return !!view; }, close: close };
})();
