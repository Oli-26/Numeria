/**
 * notifications.js — Capacitor LocalNotifications bridge for Numeria.
 *
 * Exposes window.Notifications with a consistent API.
 * Falls back gracefully:
 *   - On Android/iOS via Capacitor: uses @capacitor/local-notifications
 *   - On web preview: uses the browser Notification API where available
 *   - Elsewhere: no-ops silently
 */
(function () {
    'use strict';

    // Stable ID seeds so re-scheduling replaces rather than duplicates.
    var STREAK_NOTIFICATION_ID = 1001;
    var REVIEW_NOTIFICATION_BASE_ID = 2001;

    function isCapacitorAvailable() {
        return typeof window !== 'undefined' &&
            window.Capacitor &&
            window.Capacitor.isNativePlatform &&
            window.Capacitor.isNativePlatform();
    }

    // ------------------------------------------------------------------ //
    //  Capacitor implementation
    // ------------------------------------------------------------------ //
    var capacitorImpl = {
        _plugin: null,

        _getPlugin: async function () {
            if (this._plugin) return this._plugin;
            try {
                var mod = await import('/node_modules/@capacitor/local-notifications/dist/esm/index.js').catch(function () {
                    // Capacitor bundles the plugin into the global scope when using the CLI sync path.
                    return null;
                });
                // Try the global injected by capacitor sync (Android WebView)
                if (!mod && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
                    this._plugin = window.Capacitor.Plugins.LocalNotifications;
                } else if (mod && mod.LocalNotifications) {
                    this._plugin = mod.LocalNotifications;
                } else {
                    this._plugin = null;
                }
            } catch (e) {
                this._plugin = null;
            }
            return this._plugin;
        },

        requestPermission: async function () {
            var p = await this._getPlugin();
            if (!p) return false;
            try {
                var result = await p.requestPermissions();
                return result && result.display === 'granted';
            } catch (e) {
                return false;
            }
        },

        scheduleDailyReminder: async function (hourOfDay, minuteOfDay, title, body) {
            var p = await this._getPlugin();
            if (!p) return;
            try {
                // Cancel any previous streak notification first.
                await p.cancel({ notifications: [{ id: STREAK_NOTIFICATION_ID }] }).catch(function () { });

                var now = new Date();
                var fire = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourOfDay, minuteOfDay, 0, 0);
                // If today's slot has already passed, start tomorrow.
                if (fire <= now) {
                    fire.setDate(fire.getDate() + 1);
                }

                await p.schedule({
                    notifications: [{
                        id: STREAK_NOTIFICATION_ID,
                        title: title,
                        body: body,
                        schedule: {
                            at: fire,
                            repeats: true,
                            every: 'day'
                        },
                        sound: null,
                        smallIcon: 'ic_launcher_foreground',
                        iconColor: '#4a5fe0'
                    }]
                });
            } catch (e) {
                console.warn('[Notifications] scheduleDailyReminder failed:', e);
            }
        },

        scheduleReviewReminder: async function (deltaMinutes, title, body) {
            var p = await this._getPlugin();
            if (!p) return;
            try {
                await p.cancel({ notifications: [{ id: REVIEW_NOTIFICATION_BASE_ID }] }).catch(function () { });

                var fire = new Date(Date.now() + deltaMinutes * 60 * 1000);
                await p.schedule({
                    notifications: [{
                        id: REVIEW_NOTIFICATION_BASE_ID,
                        title: title,
                        body: body,
                        schedule: { at: fire },
                        sound: null,
                        smallIcon: 'ic_launcher_foreground',
                        iconColor: '#4a5fe0'
                    }]
                });
            } catch (e) {
                console.warn('[Notifications] scheduleReviewReminder failed:', e);
            }
        },

        cancelAll: async function () {
            var p = await this._getPlugin();
            if (!p) return;
            try {
                var pending = await p.getPending();
                if (pending && pending.notifications && pending.notifications.length > 0) {
                    await p.cancel({ notifications: pending.notifications.map(function (n) { return { id: n.id }; }) });
                }
            } catch (e) {
                console.warn('[Notifications] cancelAll failed:', e);
            }
        },

        getPending: async function () {
            var p = await this._getPlugin();
            if (!p) return [];
            try {
                var result = await p.getPending();
                return (result && result.notifications) ? result.notifications : [];
            } catch (e) {
                return [];
            }
        }
    };

    // ------------------------------------------------------------------ //
    //  Web (browser Notification API) fallback
    // ------------------------------------------------------------------ //
    var webImpl = {
        requestPermission: async function () {
            if (!('Notification' in window)) return false;
            try {
                var perm = await Notification.requestPermission();
                return perm === 'granted';
            } catch (e) {
                return false;
            }
        },

        scheduleDailyReminder: async function (hourOfDay, minuteOfDay, title, body) {
            // Web can only show immediate notifications — schedule for "today at time"
            // if in the future, else skip (no persistent scheduling in browser).
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            var now = new Date();
            var fire = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourOfDay, minuteOfDay, 0, 0);
            if (fire <= now) return; // already passed today, skip
            var delay = fire - now;
            setTimeout(function () {
                try { new Notification(title, { body: body, icon: '/numeria-icon.svg' }); } catch (e) { }
            }, delay);
        },

        scheduleReviewReminder: async function (deltaMinutes, title, body) {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            setTimeout(function () {
                try { new Notification(title, { body: body, icon: '/numeria-icon.svg' }); } catch (e) { }
            }, deltaMinutes * 60 * 1000);
        },

        cancelAll: async function () {
            // Browser Notification API has no way to cancel scheduled notifications.
        },

        getPending: async function () {
            return [];
        }
    };

    // ------------------------------------------------------------------ //
    //  No-op fallback (safe default when neither is available)
    // ------------------------------------------------------------------ //
    var noopImpl = {
        requestPermission: async function () { return false; },
        scheduleDailyReminder: async function () { },
        scheduleReviewReminder: async function () { },
        cancelAll: async function () { },
        getPending: async function () { return []; }
    };

    // ------------------------------------------------------------------ //
    //  Public API — select implementation lazily on first call
    // ------------------------------------------------------------------ //
    var _impl = null;

    function getImpl() {
        if (_impl) return _impl;
        if (isCapacitorAvailable()) {
            _impl = capacitorImpl;
        } else if ('Notification' in window) {
            _impl = webImpl;
        } else {
            _impl = noopImpl;
        }
        return _impl;
    }

    window.Notifications = {
        requestPermission: function () { return getImpl().requestPermission(); },
        scheduleDailyReminder: function (h, m, title, body) { return getImpl().scheduleDailyReminder(h, m, title, body); },
        scheduleReviewReminder: function (deltaMinutes, title, body) { return getImpl().scheduleReviewReminder(deltaMinutes, title, body); },
        cancelAll: function () { return getImpl().cancelAll(); },
        getPending: function () { return getImpl().getPending(); }
    };
})();
