// Tapping a citation marker in a lesson shows its source in a small card beside it. The card copies the
// matching entry from the section's Sources list, which Blazor renders (and escapes).
(function () {
    var pop = null;

    function close() {
        if (pop) {
            pop.remove();
            pop = null;
        }
    }

    function show(mark) {
        var content = mark.closest('[id^="concept-content-"]');
        var item = content && document.getElementById('cite-' + content.id.slice('concept-content-'.length) + '-' + mark.dataset.cite);
        if (!item) return;
        pop = document.createElement('div');
        pop.className = 'cite-pop';
        pop.setAttribute('role', 'dialog');
        pop.innerHTML = item.innerHTML;
        document.body.appendChild(pop);
        var r = mark.getBoundingClientRect();
        var w = Math.min(320, window.innerWidth - 24);
        pop.style.width = w + 'px';
        pop.style.left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12)) + 'px';
        // Below the marker if it fits above the bottom bar, otherwise above it.
        var top = r.bottom + 8;
        if (top + pop.offsetHeight > window.innerHeight - 90) top = Math.max(12, r.top - 8 - pop.offsetHeight);
        pop.style.top = top + 'px';
    }

    document.addEventListener('click', function (e) {
        var link = e.target.closest && e.target.closest('a.source-link');
        if (link) {
            // The Android WebView ignores target="_blank", so open sources the way the rest of the app opens links.
            e.preventDefault();
            window.open(link.href, '_blank');
            return;
        }
        var mark = e.target.closest && e.target.closest('sup.cite');
        if (mark) {
            e.preventDefault();
            close();
            show(mark);
            return;
        }
        if (pop && !pop.contains(e.target)) close();
    }, true);

    window.addEventListener('scroll', close, true);
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
    });
})();
