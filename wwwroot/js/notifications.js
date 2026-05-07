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

    // Branded notification channel — registered once per install.
    var CHANNEL_ID = 'phine_reminders';
    var CHANNEL_NAME = 'Phine reminders';
    var CHANNEL_DESC = 'Daily streak nudges and review reminders.';
    var BRAND_COLOR = '#FFD76A'; // gold accent matching the app icon
    var SMALL_ICON = 'ic_stat_phine';
    var LARGE_ICON = 'ic_launcher';

    function isCapacitorAvailable() {
        return typeof window !== 'undefined' &&
            window.Capacitor &&
            window.Capacitor.isNativePlatform &&
            window.Capacitor.isNativePlatform();
    }

    // ------------------------------------------------------------------ //
    //  Capacitor implementation
    // ------------------------------------------------------------------ //
    // Deep-link bridge — when the user taps a notification, Capacitor fires
    // localNotificationActionPerformed with the original notification's `extra`
    // payload. We stash the target route in sessionStorage so the Blazor app
    // can navigate on cold start, and dispatch a 'phine:deeplink' event for
    // warm taps where the WebView is already alive.
    function _routeFromAction(action) {
        try {
            var n = action && action.notification;
            return n && n.extra && n.extra.route ? String(n.extra.route) : null;
        } catch (e) { return null; }
    }

    function _stashRoute(route) {
        if (!route) return;
        try { sessionStorage.setItem('phine_pending_deeplink', route); } catch (e) { }
        try { window.dispatchEvent(new CustomEvent('phine:deeplink', { detail: route })); } catch (e) { }
    }

    // Action type IDs registered with the plugin. Tapping a button on the
    // notification fires localNotificationActionPerformed with these actionIds:
    //   review_now -> deep-link to /review
    //   snooze_1h  -> reschedule the same reminder 60 min from now
    var ACTION_REVIEW = 'PHINE_REVIEW';
    var ACTION_STREAK = 'PHINE_STREAK';

    var capacitorImpl = {
        _plugin: null,
        _channelEnsured: false,
        _actionsEnsured: false,
        _listenerAttached: false,

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

        _ensureActionTypes: async function (p) {
            if (this._actionsEnsured || !p || typeof p.registerActionTypes !== 'function') return;
            try {
                await p.registerActionTypes({
                    types: [
                        {
                            id: ACTION_REVIEW,
                            actions: [
                                { id: 'review_now', title: 'Review now' },
                                { id: 'snooze_1h', title: 'Snooze 1h' }
                            ]
                        },
                        {
                            id: ACTION_STREAK,
                            actions: [
                                { id: 'open_app',  title: 'Open Phine' },
                                { id: 'snooze_1h', title: 'Later' }
                            ]
                        }
                    ]
                });
                this._actionsEnsured = true;
            } catch (e) {
                // Older plugin or platform without registerActionTypes — ignore.
                this._actionsEnsured = true;
            }
        },

        _ensureListener: function (p) {
            if (this._listenerAttached || !p || typeof p.addListener !== 'function') return;
            var self = this;
            try {
                p.addListener('localNotificationActionPerformed', async function (action) {
                    var actionId = action && action.actionId;
                    var notif = action && action.notification;
                    var extra = (notif && notif.extra) || {};
                    var route = extra.route || null;

                    // Snooze: re-fire the same notification 60 min from now.
                    if (actionId === 'snooze_1h' && extra.snoozeKind && notif) {
                        try {
                            if (extra.snoozeKind === 'review') {
                                await self.scheduleReviewReminder(60, notif.title, notif.body, route);
                            } else if (extra.snoozeKind === 'streak') {
                                // Streak fires daily on a clock — reschedule 1h ahead today.
                                var soon = new Date(Date.now() + 60 * 60 * 1000);
                                await self.scheduleDailyReminder(soon.getHours(), soon.getMinutes(), notif.title, notif.body, route);
                            }
                        } catch (e) { /* ignore reschedule failure */ }
                        return;
                    }

                    // Tap or "open"/"review now" — route to the target screen.
                    if (route) _stashRoute(route);
                });
                this._listenerAttached = true;
            } catch (e) { /* listener API unavailable; ignore */ }
        },

        // Android 8+ requires a channel for any custom styling (color, importance,
        // vibration). Register once; safe to call repeatedly.
        _ensureChannel: async function (p) {
            if (this._channelEnsured || !p || typeof p.createChannel !== 'function') return;
            try {
                await p.createChannel({
                    id: CHANNEL_ID,
                    name: CHANNEL_NAME,
                    description: CHANNEL_DESC,
                    importance: 4,           // HIGH — heads-up banner on lock screen
                    visibility: 1,           // PUBLIC
                    lights: true,
                    lightColor: BRAND_COLOR,
                    vibration: true
                });
                this._channelEnsured = true;
            } catch (e) {
                // createChannel is a no-op on iOS; ignore.
                this._channelEnsured = true;
            }
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
                await this._ensureChannel(p);
                await this._ensureActionTypes(p);
                this._ensureListener(p);
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
                        channelId: CHANNEL_ID,
                        smallIcon: SMALL_ICON,
                        largeIcon: LARGE_ICON,
                        iconColor: BRAND_COLOR,
                        actionTypeId: ACTION_STREAK,
                        autoCancel: true,
                        ongoing: false,
                        extra: { route: route || '/', snoozeKind: 'streak' }
                    }]
                });
            } catch (e) {
                console.warn('[Notifications] scheduleDailyReminder failed:', e);
            }
        },

        scheduleReviewReminder: async function (deltaMinutes, title, body, route) {
            var p = await this._getPlugin();
            if (!p) return;
            try {
                await this._ensureChannel(p);
                await this._ensureActionTypes(p);
                this._ensureListener(p);
                await p.cancel({ notifications: [{ id: REVIEW_NOTIFICATION_BASE_ID }] }).catch(function () { });

                var fire = new Date(Date.now() + deltaMinutes * 60 * 1000);
                await p.schedule({
                    notifications: [{
                        id: REVIEW_NOTIFICATION_BASE_ID,
                        title: title,
                        body: body,
                        schedule: { at: fire },
                        channelId: CHANNEL_ID,
                        smallIcon: SMALL_ICON,
                        largeIcon: LARGE_ICON,
                        iconColor: BRAND_COLOR,
                        actionTypeId: ACTION_REVIEW,
                        autoCancel: true,
                        ongoing: false,
                        extra: { route: route || '/review', snoozeKind: 'review' }
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

        scheduleDailyReminder: async function (hourOfDay, minuteOfDay, title, body, _route) {
            // Web can only show immediate notifications — schedule for "today at time"
            // if in the future, else skip (no persistent scheduling in browser).
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            var now = new Date();
            var fire = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourOfDay, minuteOfDay, 0, 0);
            if (fire <= now) return; // already passed today, skip
            var delay = fire - now;
            setTimeout(function () {
                try { new Notification(title, { body: body, icon: '/phine-icon.svg' }); } catch (e) { }
            }, delay);
        },

        scheduleReviewReminder: async function (deltaMinutes, title, body, _route) {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            setTimeout(function () {
                try { new Notification(title, { body: body, icon: '/phine-icon.svg' }); } catch (e) { }
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
        scheduleDailyReminder: function (h, m, title, body, route) { return getImpl().scheduleDailyReminder(h, m, title, body, route); },
        scheduleReviewReminder: function (deltaMinutes, title, body, route) { return getImpl().scheduleReviewReminder(deltaMinutes, title, body, route); },
        cancelAll: function () { return getImpl().cancelAll(); },
        getPending: function () { return getImpl().getPending(); },
        // Pop the route stashed when a notification was tapped (cold-start path).
        consumePendingDeepLink: function () {
            try {
                var r = sessionStorage.getItem('phine_pending_deeplink');
                if (r) sessionStorage.removeItem('phine_pending_deeplink');
                return r;
            } catch (e) { return null; }
        }
    };
})();
