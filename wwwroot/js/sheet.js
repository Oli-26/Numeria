// Bottom sheet glue: locks page scroll, and routes Escape, Android back and a downward swipe to the open sheet's close.
(function () {
    var html = document.documentElement;
    var DISMISS_PX = 90;

    window.NousSheet = {
        _ref: null,
        get isOpen() { return this._ref !== null; },

        open: function (dotNetRef, sheet) {
            this._ref = dotNetRef;
            html.classList.add('sheet-open');
            if (sheet && !sheet._nousDrag) {
                sheet._nousDrag = true;
                bindDrag(sheet);
            }
        },

        close: function () {
            this._ref = null;
            html.classList.remove('sheet-open');
        },

        requestClose: function () {
            if (this._ref) this._ref.invokeMethodAsync('RequestClose');
        }
    };

    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && window.NousSheet.isOpen) window.NousSheet.requestClose();
    });

    // Drag only starts when the sheet is scrolled to the top, so a downward swipe mid-list still scrolls the list.
    function bindDrag(sheet) {
        var startY = 0, dy = 0, dragging = false;

        sheet.addEventListener('touchstart', function (e) {
            if (sheet.scrollTop > 0 || e.touches.length !== 1) return;
            startY = e.touches[0].clientY;
            dy = 0;
            dragging = true;
        }, { passive: true });

        sheet.addEventListener('touchmove', function (e) {
            if (!dragging) return;
            dy = Math.max(0, e.touches[0].clientY - startY);
            sheet.style.transition = 'none';
            sheet.style.transform = dy > 0 ? 'translateY(' + dy + 'px)' : '';
        }, { passive: true });

        sheet.addEventListener('touchend', function () {
            if (!dragging) return;
            dragging = false;
            sheet.style.transition = '';
            if (dy > DISMISS_PX) {
                // The closing animation starts from where the finger left the sheet.
                sheet.style.setProperty('--hub-drag', dy + 'px');
                window.NousSheet.requestClose();
            } else {
                sheet.style.transform = '';
            }
        });
    }
})();
