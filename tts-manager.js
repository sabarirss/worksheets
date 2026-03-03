// GleeGrow TTS Manager — Provider-based architecture
// Swap providers without changing any consumer code.
//
// Current provider: WebSpeechProvider (free, on-device, no data leaves browser)
//
// To upgrade to a paid provider:
//   1. Create a new provider object matching the TTSProvider interface below
//   2. Call TTSManager.registerProvider('myProvider', MyProvider)
//   3. Call TTSManager.setActiveProvider('myProvider')
//   That's it — all consumer code (stories-generator.js, etc.) stays unchanged.
//
// TTSProvider interface (each provider must implement):
//   .isSupported()          → boolean
//   .isSpeaking()           → boolean
//   .isPaused()             → boolean
//   .speak(text, opts)      → void   opts: { rate, pitch, lang, onEnd, onError }
//   .pause()                → void
//   .resume()               → void
//   .stop()                 → void
//   .name                   → string (display name)

var TTSManager = (function() {
    'use strict';

    // =========================================================================
    // CONFIGURATION
    // =========================================================================

    var STORAGE_KEY = 'gleegrow_tts_enabled';
    var PROVIDER_KEY = 'gleegrow_tts_provider';

    // Category-specific speaking rates (kid-friendly defaults)
    var CATEGORY_RATES = {
        bedtime: 0.75,
        animals: 0.85,
        nature: 0.85,
        family: 0.85,
        adventures: 0.9,
        learning: 0.85
    };

    // =========================================================================
    // PROVIDER REGISTRY
    // =========================================================================

    var providers = {};
    var activeProviderKey = 'webSpeech';

    function registerProvider(key, provider) {
        providers[key] = provider;
    }

    function setActiveProvider(key) {
        if (!providers[key]) {
            console.warn('TTSManager: provider "' + key + '" not registered');
            return false;
        }
        activeProviderKey = key;
        localStorage.setItem(PROVIDER_KEY, key);
        return true;
    }

    function getActiveProvider() {
        return providers[activeProviderKey] || null;
    }

    function getProviderName() {
        var p = getActiveProvider();
        return p ? (p.name || activeProviderKey) : 'none';
    }

    function listProviders() {
        return Object.keys(providers).map(function(key) {
            return { key: key, name: providers[key].name || key, supported: providers[key].isSupported() };
        });
    }

    // =========================================================================
    // BUILT-IN PROVIDER: Web Speech API (free, on-device)
    // =========================================================================

    var WebSpeechProvider = (function() {
        var synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
        var currentUtterance = null;

        return {
            name: 'Browser (Free)',

            isSupported: function() {
                return !!synth;
            },

            isSpeaking: function() {
                return synth ? synth.speaking : false;
            },

            isPaused: function() {
                return synth ? synth.paused : false;
            },

            speak: function(text, opts) {
                this.stop();
                opts = opts || {};
                if (!text || !synth) return;

                currentUtterance = new SpeechSynthesisUtterance(text);
                currentUtterance.rate = opts.rate || 0.85;
                currentUtterance.pitch = opts.pitch || 1.1;
                currentUtterance.lang = opts.lang || 'en-US';

                if (opts.onEnd) currentUtterance.onend = opts.onEnd;
                if (opts.onError) currentUtterance.onerror = opts.onError;

                synth.speak(currentUtterance);
            },

            pause: function() {
                if (synth && synth.speaking && !synth.paused) {
                    synth.pause();
                }
            },

            resume: function() {
                if (synth && synth.paused) {
                    synth.resume();
                }
            },

            stop: function() {
                if (synth) {
                    synth.cancel();
                }
                currentUtterance = null;
            }
        };
    })();

    // Register the built-in provider
    registerProvider('webSpeech', WebSpeechProvider);

    // Restore saved provider preference
    var savedProvider = typeof localStorage !== 'undefined' ? localStorage.getItem(PROVIDER_KEY) : null;
    if (savedProvider && providers[savedProvider]) {
        activeProviderKey = savedProvider;
    }

    // =========================================================================
    // UTILITY
    // =========================================================================

    // Strip HTML tags to get plain text
    function stripHTML(html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return (tmp.textContent || tmp.innerText || '').trim();
    }

    // =========================================================================
    // PUBLIC FACADE — consumer code calls these (never changes)
    // =========================================================================

    function isSupported() {
        var p = getActiveProvider();
        return p ? p.isSupported() : false;
    }

    function isEnabled() {
        var val = localStorage.getItem(STORAGE_KEY);
        return val === null ? true : val === 'true';
    }

    function setEnabled(enabled) {
        localStorage.setItem(STORAGE_KEY, String(!!enabled));
    }

    function isSpeaking() {
        var p = getActiveProvider();
        return p ? p.isSpeaking() : false;
    }

    function isPaused() {
        var p = getActiveProvider();
        return p ? p.isPaused() : false;
    }

    function rateForCategory(category) {
        return CATEGORY_RATES[category] || 0.85;
    }

    /**
     * Speak text aloud via the active provider.
     * @param {string} text - Plain text or HTML to speak
     * @param {Object} opts - { rate, pitch, lang, onEnd, onError }
     */
    function speak(text, opts) {
        if (!isSupported() || !isEnabled()) return;

        var p = getActiveProvider();
        if (!p) return;

        var plainText = stripHTML(text);
        if (!plainText) return;

        p.speak(plainText, opts || {});
    }

    function pause() {
        var p = getActiveProvider();
        if (p) p.pause();
    }

    function resume() {
        var p = getActiveProvider();
        if (p) p.resume();
    }

    function stop() {
        var p = getActiveProvider();
        if (p) p.stop();
    }

    // =========================================================================
    // EXPORT
    // =========================================================================

    return {
        // Consumer API (unchanged — stories-generator.js uses these)
        isSupported: isSupported,
        isEnabled: isEnabled,
        setEnabled: setEnabled,
        isSpeaking: isSpeaking,
        isPaused: isPaused,
        rateForCategory: rateForCategory,
        speak: speak,
        pause: pause,
        resume: resume,
        stop: stop,
        STORAGE_KEY: STORAGE_KEY,

        // Provider management API (for adding paid providers)
        registerProvider: registerProvider,
        setActiveProvider: setActiveProvider,
        getProviderName: getProviderName,
        listProviders: listProviders
    };
})();
