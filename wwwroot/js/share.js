/**
 * share.js — native share for the share-progress canvas.
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

    window.PhineShare = {
        // Returns 'shared' | 'copied' | 'cancelled' | 'unsupported'
        shareCanvas: async function (canvasId, title, text) {
            try {
                var blob = await canvasToBlob(canvasId);
                var file = new File([blob], 'phine-progress.png', { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: title || 'My Phine progress',
                            text: text || ''
                        });
                        return 'shared';
                    } catch (e) {
                        // AbortError when user cancels the sheet — not a failure.
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
                console.warn('[PhineShare] failed:', e);
                return 'unsupported';
            }
        }
    };
})();
