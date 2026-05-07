window.Haptics = {
    _enabled: true,
    setEnabled(v) { this._enabled = !!v; },
    _cap() {
        return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
    },
    light() {
        if (!this._enabled) return;
        try {
            var h = this._cap();
            if (h && h.impact) h.impact({ style: 'LIGHT' });
            else if (navigator.vibrate) navigator.vibrate(10);
        } catch (e) { }
    },
    medium() {
        if (!this._enabled) return;
        try {
            var h = this._cap();
            if (h && h.impact) h.impact({ style: 'MEDIUM' });
            else if (navigator.vibrate) navigator.vibrate(20);
        } catch (e) { }
    },
    heavy() {
        if (!this._enabled) return;
        try {
            var h = this._cap();
            if (h && h.impact) h.impact({ style: 'HEAVY' });
            else if (navigator.vibrate) navigator.vibrate([0, 30]);
        } catch (e) { }
    },
    success() {
        if (!this._enabled) return;
        try {
            var h = this._cap();
            if (h && h.notification) h.notification({ type: 'SUCCESS' });
            else if (navigator.vibrate) navigator.vibrate([0, 15, 40, 15]);
        } catch (e) { }
    },
    warning() {
        if (!this._enabled) return;
        try {
            var h = this._cap();
            if (h && h.notification) h.notification({ type: 'WARNING' });
            else if (navigator.vibrate) navigator.vibrate([0, 30, 50, 30]);
        } catch (e) { }
    },
    error() {
        if (!this._enabled) return;
        try {
            var h = this._cap();
            if (h && h.notification) h.notification({ type: 'ERROR' });
            else if (navigator.vibrate) navigator.vibrate([0, 50, 60, 50]);
        } catch (e) { }
    },
    select() {
        if (!this._enabled) return;
        try {
            var h = this._cap();
            if (h && h.selectionChanged) h.selectionChanged();
            else if (navigator.vibrate) navigator.vibrate(5);
        } catch (e) { }
    }
};
