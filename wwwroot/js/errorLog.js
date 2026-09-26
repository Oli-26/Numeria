(function () {
    var KEY = 'nous-error-log';
    var MAX = 200;

    function read() {
        try {
            var raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function write(entries) {
        try {
            localStorage.setItem(KEY, JSON.stringify(entries));
        } catch (e) { /* quota — drop */ }
    }

    function add(source, message, stack) {
        var entries = read();
        entries.push({
            t: Date.now(),
            source: source || 'unknown',
            message: String(message || '').slice(0, 2000),
            stack: stack ? String(stack).slice(0, 4000) : ''
        });
        if (entries.length > MAX) entries.splice(0, entries.length - MAX);
        write(entries);
    }

    window.NousErrorLog = {
        get: function () { return read(); },
        clear: function () { write([]); },
        count: function () { return read().length; },
        add: add
    };

    window.addEventListener('error', function (e) {
        add('window.error', e.message, e.error && e.error.stack ? e.error.stack : (e.filename + ':' + e.lineno));
    });

    window.addEventListener('unhandledrejection', function (e) {
        var r = e.reason;
        var msg = r && r.message ? r.message : String(r);
        var stack = r && r.stack ? r.stack : '';
        add('unhandledrejection', msg, stack);
    });

    var origError = console.error.bind(console);
    console.error = function () {
        try {
            var parts = [];
            for (var i = 0; i < arguments.length; i++) {
                var a = arguments[i];
                if (a instanceof Error) {
                    parts.push(a.message);
                    if (a.stack) parts.push(a.stack);
                } else if (typeof a === 'object') {
                    try { parts.push(JSON.stringify(a)); } catch (_) { parts.push(String(a)); }
                } else {
                    parts.push(String(a));
                }
            }
            add('console.error', parts.join(' '), '');
        } catch (_) { /* never break console */ }
        origError.apply(console, arguments);
    };

    // Keep Blazor's error overlay hidden even if its runtime tries to show it.
    function suppressBlazorErrorUi() {
        var el = document.getElementById('blazor-error-ui');
        if (el) el.style.display = 'none';
    }
    document.addEventListener('DOMContentLoaded', function () {
        suppressBlazorErrorUi();
        var el = document.getElementById('blazor-error-ui');
        if (el && window.MutationObserver) {
            var mo = new MutationObserver(function () {
                if (el.style.display !== 'none') {
                    add('blazor', 'Blazor unhandled error (overlay suppressed)', '');
                    el.style.display = 'none';
                }
            });
            mo.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        }
    });
})();
