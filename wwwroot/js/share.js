/**
 * share.js: native share for the share-progress canvas.
 *
 * Tries Web Share API with files (Android Chrome / WebView 89+, iOS Safari 15+).
 * Falls back to clipboard image. Final fallback: clipboard text.
 */
(function () {
    'use strict';

    function canvasToBlob(canvasId) {
        return new Promise(function (resolve, reject) {
            var c = document.getElementById(canvasId);
            if (!c || !c.toBlob) {
                reject(new Error('canvas not found'));
                return;
            }
            c.toBlob(function (blob) {
                if (!blob) reject(new Error('toBlob returned null'));
                else resolve(blob);
            }, 'image/png');
        });
    }

    function loadImage(src) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = function () { resolve(null); };
            img.src = src;
        });
    }

    function wrap(ctx, text, maxWidth) {
        var lines = [], line = '';
        text.split(/\s+/).forEach(function (word) {
            var next = line ? line + ' ' + word : word;
            if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = word; }
            else line = next;
        });
        if (line) lines.push(line);
        return lines;
    }

    // A 1080x1350 cream card in the style of the social posts; shrinks the type until the text fits.
    async function drawCookieCard(canvasId, opts) {
        var c = document.getElementById(canvasId);
        var ctx = c.getContext('2d');
        var W = 1080, H = 1350, X = 110, maxW = W - 2 * X;
        c.width = W; c.height = H;
        ctx.fillStyle = '#F4EFE6';
        ctx.fillRect(0, 0, W, H);

        var size = 66, lines;
        do {
            ctx.font = '600 ' + size + 'px Georgia, "Noto Serif", serif';
            lines = wrap(ctx, opts.text, maxW);
            size -= 4;
        } while (lines.length * size * 1.3 > 760 && size > 34);
        size += 4;
        var lineH = size * 1.3, blockH = 64 + lines.length * lineH + 110;
        var y = Math.max(150, (H - blockH) / 2 - 40);

        ctx.textBaseline = 'top';
        ctx.fillStyle = '#B4552F';
        ctx.font = '700 30px "Noto Sans", Roboto, sans-serif';
        ctx.letterSpacing = '4px';
        ctx.fillText((opts.label || 'Fortune cookie').toUpperCase(), X, y);
        ctx.letterSpacing = '0px';
        y += 64;

        ctx.fillStyle = '#2A211B';
        ctx.font = '600 ' + size + 'px Georgia, "Noto Serif", serif';
        lines.forEach(function (l) { ctx.fillText(l, X, y); y += lineH; });

        y += 36;
        ctx.fillStyle = '#B4552F';
        ctx.fillRect(X, y, 96, 6);
        ctx.fillStyle = '#8A7B6C';
        ctx.font = '400 30px "Noto Sans", Roboto, sans-serif';
        ctx.fillText(opts.footer || 'A daily fortune cookie from Nous', X, y + 34);

        var mark = await loadImage('nous-mark.svg'), word = await loadImage('nous-wordmark.svg');
        if (mark) ctx.drawImage(mark, X, H - 150, 52 * mark.width / mark.height, 52);
        if (word) ctx.drawImage(word, X + 66, H - 140, 30 * word.width / word.height, 30);
    }

    window.NousShare = {
        drawCookieCard: drawCookieCard,

        // Returns 'shared' | 'copied' | 'cancelled' | 'unsupported'
        shareCanvas: async function (canvasId, title, text, fileName) {
            try {
                var blob = await canvasToBlob(canvasId);
                var file = new File([blob], fileName || 'nous-progress.png', { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: title || 'My Nous progress',
                            text: text || ''
                        });
                        return 'shared';
                    } catch (e) {
                        // AbortError when user cancels the sheet: not a failure.
                        if (e && e.name === 'AbortError') return 'cancelled';
                        // fall through to clipboard
                    }
                }

                // Clipboard image fallback
                if (navigator.clipboard && window.ClipboardItem) {
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        return 'copied';
                    } catch (e) { /* fall through */ }
                }

                return 'unsupported';
            } catch (e) {
                console.warn('[NousShare] failed:', e);
                return 'unsupported';
            }
        }
    };
})();
