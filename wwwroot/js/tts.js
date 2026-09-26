// tts.js — Web Speech API wrapper for Nous
// Exposes window.TTS with: getVoices, speak, pause, resume, stop, isSpeaking

(function () {
    'use strict';

    var synth = window.speechSynthesis;
    var _currentUtterance = null;
    var _supported = !!(synth && window.SpeechSynthesisUtterance);

    // ── LaTeX → spoken English ────────────────────────────────────────────────
    var LATEX_REPLACEMENTS = [
        // Fractions  \frac{a}{b} → "a over b"
        [/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 over $2'],
        // Square root  \sqrt{x} → "square root of x"
        [/\\sqrt\{([^}]*)\}/g, 'square root of $1'],
        // nth root  \sqrt[n]{x} → "nth root of x"
        [/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '$1th root of $2'],
        // Superscript  x^{2} → "x squared", x^{3} → "x cubed", else "x to the n"
        [/\^{2}/g, ' squared'],
        [/\^{3}/g, ' cubed'],
        [/\^\{([^}]*)\}/g, ' to the power of $1'],
        [/\^(\d+)/g, ' to the power of $1'],
        // Subscript  x_{n} → "x sub n"
        [/\_\{([^}]*)\}/g, ' sub $1'],
        [/\_(\w)/g, ' sub $1'],
        // Greek letters
        [/\\alpha/g, 'alpha'], [/\\beta/g, 'beta'], [/\\gamma/g, 'gamma'],
        [/\\delta/g, 'delta'], [/\\epsilon/g, 'epsilon'], [/\\theta/g, 'theta'],
        [/\\lambda/g, 'lambda'], [/\\mu/g, 'mu'], [/\\pi/g, 'pi'],
        [/\\sigma/g, 'sigma'], [/\\phi/g, 'phi'], [/\\psi/g, 'psi'],
        [/\\omega/g, 'omega'], [/\\rho/g, 'rho'], [/\\tau/g, 'tau'],
        [/\\eta/g, 'eta'], [/\\zeta/g, 'zeta'], [/\\xi/g, 'xi'],
        [/\\kappa/g, 'kappa'], [/\\nu/g, 'nu'],
        // Capital Greek
        [/\\Gamma/g, 'Gamma'], [/\\Delta/g, 'Delta'], [/\\Theta/g, 'Theta'],
        [/\\Lambda/g, 'Lambda'], [/\\Sigma/g, 'Sigma'], [/\\Phi/g, 'Phi'],
        [/\\Omega/g, 'Omega'],
        // Operators & relations
        [/\\times/g, 'times'], [/\\cdot/g, 'dot'], [/\\div/g, 'divided by'],
        [/\\pm/g, 'plus or minus'], [/\\mp/g, 'minus or plus'],
        [/\\leq/g, 'less than or equal to'], [/\\geq/g, 'greater than or equal to'],
        [/\\neq/g, 'not equal to'], [/\\approx/g, 'approximately'],
        [/\\equiv/g, 'equivalent to'], [/\\sim/g, 'similar to'],
        [/\\infty/g, 'infinity'], [/\\partial/g, 'partial'],
        [/\\nabla/g, 'del'], [/\\forall/g, 'for all'], [/\\exists/g, 'there exists'],
        [/\\in/g, 'in'], [/\\notin/g, 'not in'],
        [/\\subset/g, 'subset of'], [/\\supset/g, 'superset of'],
        [/\\cup/g, 'union'], [/\\cap/g, 'intersection'],
        [/\\emptyset/g, 'empty set'], [/\\varnothing/g, 'empty set'],
        // Integrals / sums
        [/\\int_{([^}]*)}^{([^}]*)}/g, 'integral from $1 to $2 of'],
        [/\\int/g, 'integral'],
        [/\\sum_{([^}]*)}^{([^}]*)}/g, 'sum from $1 to $2 of'],
        [/\\sum/g, 'sum'],
        [/\\prod/g, 'product'],
        [/\\lim_{([^}]*)}/g, 'limit as $1'],
        [/\\lim/g, 'limit'],
        // Trig
        [/\\sin/g, 'sine'], [/\\cos/g, 'cosine'], [/\\tan/g, 'tangent'],
        [/\\arcsin/g, 'arcsine'], [/\\arccos/g, 'arccosine'],
        [/\\arctan/g, 'arctangent'], [/\\log/g, 'log'], [/\\ln/g, 'natural log'],
        [/\\exp/g, 'exp'], [/\\max/g, 'max'], [/\\min/g, 'min'],
        // Vectors / norms
        [/\\vec\{([^}]*)\}/g, 'vector $1'],
        [/\\hat\{([^}]*)\}/g, '$1 hat'],
        [/\\bar\{([^}]*)\}/g, '$1 bar'],
        [/\\dot\{([^}]*)\}/g, '$1 dot'],
        [/\\left\|([^|]*)\\\|right\|/g, 'absolute value of $1'],
        // Matrices/braces
        [/\\begin\{[^}]*\}/g, ''], [/\\end\{[^}]*\}/g, ''],
        [/\\left[\(\[\{]/g, ''], [/\\right[\)\]\}]/g, ''],
        [/\\\\/g, ', '],  // line break in matrices → pause
        // Remaining backslash commands
        [/\\[a-zA-Z]+/g, ''],
        // Braces (stripped last, after substitution)
        [/[{}]/g, ''],
    ];

    function latexToSpeech(latex) {
        var text = latex;
        // x^2 shorthand (no braces)
        text = text.replace(/\^2\b/g, ' squared');
        text = text.replace(/\^3\b/g, ' cubed');
        for (var i = 0; i < LATEX_REPLACEMENTS.length; i++) {
            text = text.replace(LATEX_REPLACEMENTS[i][0], LATEX_REPLACEMENTS[i][1]);
        }
        // Collapse whitespace
        return text.replace(/\s{2,}/g, ' ').trim();
    }

    // ── HTML → plain text ─────────────────────────────────────────────────────
    function htmlToText(html) {
        // Insert pause markers at block boundaries to preserve sentence flow
        var result = html
            .replace(/<\/p>/gi, ' . ')
            .replace(/<br\s*\/?>/gi, ' . ')
            .replace(/<\/li>/gi, ' . ')
            .replace(/<\/h[1-6]>/gi, '. ')
            .replace(/<[^>]+>/g, ' ');   // strip all remaining tags

        // Decode common HTML entities
        result = result
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');

        return result.replace(/\s{2,}/g, ' ').trim();
    }

    // ── Build the full speakable text for a concept ───────────────────────────
    function buildConceptText(concept) {
        var parts = [];

        parts.push(concept.title || '');

        if (concept.contentHtml) {
            parts.push(htmlToText(concept.contentHtml));
        }

        if (concept.mathExpressions && concept.mathExpressions.length > 0) {
            concept.mathExpressions.forEach(function (expr, idx) {
                parts.push('Expression ' + (idx + 1) + ': ' + latexToSpeech(expr));
            });
        }

        return parts.filter(Boolean).join('. ');
    }

    // ── Voice helpers ─────────────────────────────────────────────────────────
    // Android WebView loads voices asynchronously.
    function getVoicesWhenReady(callback) {
        if (!synth) { callback([]); return; }
        var voices = synth.getVoices();
        if (voices.length > 0) {
            callback(voices);
        } else {
            // Wait for voiceschanged event
            synth.addEventListener('voiceschanged', function onChanged() {
                synth.removeEventListener('voiceschanged', onChanged);
                callback(synth.getVoices());
            });
            // Fallback: 1 s timeout in case the event never fires
            setTimeout(function () { callback(synth.getVoices()); }, 1000);
        }
    }

    // Auto-pick a calm, natural-sounding English voice when the user has not
    // chosen one explicitly. Heuristics, in priority order:
    //   1. Apple female "natural" voices (Samantha, Karen, Moira, etc.)
    //   2. Microsoft "Natural" voices (Aria, Jenny, Libby, Sonia, Natasha…)
    //   3. Google premium female voices by their internal IDs
    //   4. Any voice whose name contains "female"
    //   5. Network/cloud voice (usually higher quality than embedded)
    //   6. First English voice available
    function pickGentleVoice() {
        if (!synth) return null;
        var voices = synth.getVoices();
        if (!voices || voices.length === 0) return null;

        var en = voices.filter(function (v) {
            return v.lang && v.lang.toLowerCase().indexOf('en') === 0;
        });
        if (en.length === 0) en = voices;

        var preferred = [
            'samantha', 'karen', 'moira', 'tessa', 'fiona', 'allison', 'ava', 'serena', 'susan',
            'aria', 'jenny', 'libby', 'sonia', 'natasha',
            'en-gb-x-gbc', 'en-gb-x-gbb', 'en-gb-x-rjs',
            'en-us-x-iol', 'en-us-x-iom', 'en-us-x-tpc',
            'female'
        ];
        for (var i = 0; i < preferred.length; i++) {
            var key = preferred[i];
            var hit = en.find(function (v) { return v.name && v.name.toLowerCase().indexOf(key) !== -1; });
            if (hit) return hit;
        }
        var network = en.find(function (v) { return v.localService === false; });
        if (network) return network;
        return en[0];
    }

    // ── Public API ────────────────────────────────────────────────────────────
    window.TTS = {
        supported: _supported,

        /**
         * Returns Promise<Array<{name:string, lang:string}>>
         */
        getVoices: function () {
            return new Promise(function (resolve) {
                if (!_supported) { resolve([]); return; }
                getVoicesWhenReady(function (voices) {
                    resolve(voices.map(function (v) {
                        return { name: v.name, lang: v.lang };
                    }));
                });
            });
        },

        /**
         * Speaks a concept object. Returns a Promise that resolves when
         * speech ends (or rejects on error / if not supported).
         * concept: { title, contentHtml, mathExpressions[] }
         * opts:    { rate, voice, lang }
         */
        speakConcept: function (concept, opts) {
            return new Promise(function (resolve, reject) {
                if (!_supported) { resolve(); return; }

                opts = opts || {};
                var text = buildConceptText(concept);
                if (!text) { resolve(); return; }

                // Cancel any in-progress speech
                if (synth.speaking) synth.cancel();

                var utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = typeof opts.rate === 'number' ? opts.rate : 1.0;
                utterance.pitch = typeof opts.pitch === 'number' ? opts.pitch : 0.95;
                utterance.lang = opts.lang || 'en-US';

                // Resolve voice by name if given, otherwise auto-pick a gentle default
                if (opts.voice) {
                    var voices = synth.getVoices();
                    var match = voices.find(function (v) {
                        return v.name === opts.voice;
                    });
                    if (match) utterance.voice = match;
                } else {
                    var gentle = pickGentleVoice();
                    if (gentle) utterance.voice = gentle;
                }

                utterance.onend = function () { _currentUtterance = null; resolve(); };
                utterance.onerror = function (e) {
                    _currentUtterance = null;
                    // "interrupted" is not a real error — caller cancelled
                    if (e.error === 'interrupted' || e.error === 'canceled') {
                        resolve();
                    } else {
                        reject(new Error('TTS error: ' + e.error));
                    }
                };

                _currentUtterance = utterance;
                synth.speak(utterance);
            });
        },

        /**
         * Speaks a plain-text string directly.
         */
        speak: function (text, opts) {
            return new Promise(function (resolve, reject) {
                if (!_supported || !text) { resolve(); return; }

                opts = opts || {};
                if (synth.speaking) synth.cancel();

                var utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = typeof opts.rate === 'number' ? opts.rate : 1.0;
                utterance.pitch = typeof opts.pitch === 'number' ? opts.pitch : 0.95;
                utterance.lang = opts.lang || 'en-US';

                if (opts.voice) {
                    var voices = synth.getVoices();
                    var match = voices.find(function (v) { return v.name === opts.voice; });
                    if (match) utterance.voice = match;
                } else {
                    var gentle = pickGentleVoice();
                    if (gentle) utterance.voice = gentle;
                }

                utterance.onend = function () { _currentUtterance = null; resolve(); };
                utterance.onerror = function (e) {
                    _currentUtterance = null;
                    if (e.error === 'interrupted' || e.error === 'canceled') {
                        resolve();
                    } else {
                        reject(new Error('TTS error: ' + e.error));
                    }
                };

                _currentUtterance = utterance;
                synth.speak(utterance);
            });
        },

        pause: function () {
            if (synth && synth.speaking) synth.pause();
        },

        resume: function () {
            if (synth && synth.paused) synth.resume();
        },

        stop: function () {
            _currentUtterance = null;
            if (synth) synth.cancel();
        },

        isSpeaking: function () {
            return !!(synth && (synth.speaking || synth.pending));
        },

        isPaused: function () {
            return !!(synth && synth.paused);
        }
    };
})();
