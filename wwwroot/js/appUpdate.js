// In-app updates through Google Play (the @capawesome/capacitor-app-update plugin). On launch, if Play has a newer
// version, Play's own "update available" prompt appears and the update downloads in the background; once it is
// downloaded, Blazor's UpdateBanner offers a restart. Only installs from Play can update this way.
(function () {
    var AVAILABLE = 2, DOWNLOADED = 11;
    // Play's auto-update usually gets there first, so only ask once a phone has been behind for a couple of days,
    // and ask about the same version at most every few days.
    var MIN_STALE_DAYS = 2, REASK_MS = 3 * 864e5, ASKED_KEY = 'nous-update-asked';
    // A release published with update priority 4 or 5 (play { updatePriority } in build.gradle) is installed before use.
    var URGENT = 4;

    function plugin() {
        var c = window.Capacitor;
        return c && c.isNativePlatform && c.isNativePlatform() && c.Plugins && c.Plugins.AppUpdate;
    }

    function recentlyAsked(code) {
        try {
            var a = JSON.parse(localStorage.getItem(ASKED_KEY) || 'null');
            return a && a.code === code && Date.now() - a.at < REASK_MS;
        } catch (e) { return false; }
    }

    window.NousUpdate = {
        check: async function (dotNetRef) {
            var p = plugin();
            if (!p) return;
            try {
                var info = await p.getAppUpdateInfo();
                if (info.installStatus === DOWNLOADED) { dotNetRef.invokeMethodAsync('OnUpdateReady'); return; }
                if (info.updateAvailability !== AVAILABLE) return;
                if ((info.updatePriority || 0) >= URGENT && info.immediateUpdateAllowed) { await p.performImmediateUpdate(); return; }
                if (!info.flexibleUpdateAllowed) return;
                var stale = info.clientVersionStalenessDays;
                if (stale != null && stale < MIN_STALE_DAYS) return;
                if (recentlyAsked(info.availableVersionCode)) return;
                try { localStorage.setItem(ASKED_KEY, JSON.stringify({ code: info.availableVersionCode, at: Date.now() })); } catch (e) { }
                await p.addListener('onFlexibleUpdateStateChange', function (state) {
                    if (state.installStatus === DOWNLOADED) dotNetRef.invokeMethodAsync('OnUpdateReady');
                });
                await p.startFlexibleUpdate();
            } catch (e) { /* not installed from Play, offline, or Play declined: nothing to offer */ }
        },

        // Installs the downloaded update; Android restarts the app into the new version.
        restart: function () {
            var p = plugin();
            if (p) p.completeFlexibleUpdate().catch(function () { });
        }
    };
})();
