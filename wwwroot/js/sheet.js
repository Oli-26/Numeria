// Bottom sheet glue: locks page scroll, moves focus into the sheet and back, and routes Escape,
// Android back and a downward swipe to the open sheet's close.
(function () {
    var html = document.documentElement;
    var DISMISS_PX = 90;
    // Same breakpoint at which HubSheet becomes a centred dialog; dragging only makes sense as a bottom sheet.
    var bottomSheet = window.matchMedia('(max-width: 1023px)');

    window.NousSheet = {
        _ref: null,
        _sheet: null,
        _returnFocus: null,
        get isOpen() { return this._ref !== null; },

        open: function (dotNetRef, sheet) {
            this._ref = dotNetRef;
            this._sheet = sheet;
            html.classList.add('sheet-open');
            if (!sheet) return;
            // Reopening mid-close reuses the same element, so clear whatever a dismissing swipe left on it.
            sheet.style.transform = '';
            sheet.style.transition = '';
            sheet.style.removeProperty('--hub-drag');
            if (!sheet._nousDrag) {
                sheet._nousDrag = true;
                bindDrag(sheet);
            }
            if (!sheet.contains(document.activeElement)) this._returnFocus = document.activeElement;
            sheet.focus({ preventScroll: true });
        },

        close: function () {
            this._ref = null;
            this._sheet = null;
            html.classList.remove('sheet-open');
            var back = this._returnFocus;
            this._returnFocus = null;
            if (back && back.focus && document.contains(back)) back.focus({ preventScroll: true });
        },

        requestClose: function () {
            if (this._ref) this._ref.invokeMethodAsync('RequestClose');
        }
    };

    window.addEventListener('keydown', function (e) {
        var ns = window.NousSheet;
        if (!ns.isOpen) return;
        if (e.key === 'Escape') {
            ns.requestClose();
            return;
        }
        if (e.key !== 'Tab' || !ns._sheet) return;
        // Keep keyboard focus inside the dialog, as aria-modal promises.
        var items = ns._sheet.querySelectorAll('a[href], button:not([disabled])');
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1], at = document.activeElement;
        if (!ns._sheet.contains(at) || (e.shiftKey && (at === first || at === ns._sheet))) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
        } else if (!e.shiftKey && at === last) {
            e.preventDefault();
            first.focus();
        }
    });

    // A drag starts only with the list scrolled to the top, so a downward swipe mid-list still scrolls it.
    function bindDrag(sheet) {
        var startY = 0, dy = 0, dragging = false;

        function release(dismiss) {
            dragging = false;
            sheet.style.transition = '';
            if (dismiss) {
                // The closing animation starts from where the finger left the sheet.
                sheet.style.setProperty('--hub-drag', dy + 'px');
                window.NousSheet.requestClose();
            } else {
                sheet.style.transform = '';
            }
        }

        sheet.addEventListener('touchstart', function (e) {
            if (!bottomSheet.matches || sheet.scrollTop > 0 || e.touches.length !== 1) return;
            startY = e.touches[0].clientY;
            dy = 0;
            dragging = true;
        }, { passive: true });

        sheet.addEventListener('touchmove', function (e) {
            if (!dragging) return;
            // Once the list has scrolled, the gesture belongs to the scroll.
            if (sheet.scrollTop > 0) {
                release(false);
                return;
            }
            dy = Math.max(0, e.touches[0].clientY - startY);
            sheet.style.transition = 'none';
            sheet.style.transform = dy > 0 ? 'translateY(' + dy + 'px)' : '';
        }, { passive: true });

        sheet.addEventListener('touchend', function () {
            if (dragging) release(dy > DISMISS_PX);
        });

        sheet.addEventListener('touchcancel', function () {
            if (dragging) release(false);
        });
    }
})();
