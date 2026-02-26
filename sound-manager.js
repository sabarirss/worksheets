// Sound Effects Manager
// Plays short sound effects for answer feedback and completion
// Respects user preference stored in localStorage

const SOUND_ENABLED_KEY = 'gleegrow_sound_enabled';

// Base64-encoded minimal sound effects (no external files needed)
// These are tiny synthesized tones using AudioContext
const SoundManager = {
    _ctx: null,

    isEnabled() {
        const stored = localStorage.getItem(SOUND_ENABLED_KEY);
        // Default to enabled if not set
        return stored === null ? true : stored === 'true';
    },

    setEnabled(enabled) {
        localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
    },

    _getContext() {
        if (!this._ctx) {
            try {
                this._ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return null;
            }
        }
        return this._ctx;
    },

    _playTone(frequency, duration, type, volume) {
        if (!this.isEnabled()) return;
        const ctx = this._getContext();
        if (!ctx) return;

        // Resume context if suspended (mobile autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = type || 'sine';
            osc.frequency.value = frequency;
            gain.gain.value = volume || 0.15;
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Silently fail
        }
    },

    correct() {
        // Rising two-note chime
        this._playTone(523, 0.15, 'sine', 0.12);
        setTimeout(() => this._playTone(659, 0.2, 'sine', 0.12), 100);
    },

    incorrect() {
        // Low soft tone
        this._playTone(220, 0.25, 'triangle', 0.08);
    },

    complete() {
        // Celebratory ascending arpeggio
        this._playTone(523, 0.15, 'sine', 0.1);
        setTimeout(() => this._playTone(659, 0.15, 'sine', 0.1), 120);
        setTimeout(() => this._playTone(784, 0.15, 'sine', 0.1), 240);
        setTimeout(() => this._playTone(1047, 0.3, 'sine', 0.12), 360);
    },

    click() {
        this._playTone(800, 0.05, 'sine', 0.06);
    }
};

function playSound(type) {
    if (typeof SoundManager !== 'undefined' && SoundManager[type]) {
        SoundManager[type]();
    }
}
