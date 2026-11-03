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
    // A crisp tick, for detents and taps. On Android the plugin's selectionChanged does nothing until selectionStart has been
    // called, and then gives a 100 ms buzz, so a short one-shot stands in for it there.
    select() {
        if (!this._enabled) return;
        try {
            var h = this._cap();
            if (h && h.vibrate && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android') h.vibrate({ duration: 10 });
            else if (h && h.selectionChanged) { h.selectionStart(); h.selectionChanged(); }
            else if (navigator.vibrate) navigator.vibrate(5);
        } catch (e) { }
    }
};

try { Haptics._enabled = localStorage.getItem('nous-haptics-off') !== 'true'; } catch (e) { }
