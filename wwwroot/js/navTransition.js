(function () {
    var html = document.documentElement;
    html.dataset.navDir = 'forward';
    window.addEventListener('popstate', function () {
        html.dataset.navDir = 'back';
        clearTimeout(window._navDirTimer);
        window._navDirTimer = setTimeout(function () {
            html.dataset.navDir = 'forward';
        }, 450);
    });
})();
