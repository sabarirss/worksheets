/**
 * Input Mode Manager
 * Manages user preference for input method: keyboard or pencil
 * Pencil mode (canvas handwriting) is only available for Full version users
 */

// Global state
window.inputMode = 'keyboard'; // Default for all users
window.userVersion = 'demo'; // Will be updated when user data loads

/**
 * Initialize input mode from localStorage
 */
function initializeInputMode() {
    const child = getSelectedChild();
    if (!child) {
        console.log('No child selected, using default keyboard mode');
        window.inputMode = 'keyboard';
        return;
    }

    // Load saved preference
    const saved = localStorage.getItem(`inputMode_${child.id}`);

    // Default to keyboard
    if (!saved) {
        window.inputMode = 'keyboard';
    } else {
        // Only allow pencil mode if Full version
        if (saved === 'pencil' && window.userVersion !== 'full') {
            console.log('Pencil mode requested but user is not Full version, defaulting to keyboard');
            window.inputMode = 'keyboard';
        } else {
            window.inputMode = saved;
        }
    }

    console.log('Input mode initialized:', window.inputMode);
    updateInputModeUI();
}

/**
 * Set input mode (keyboard or pencil)
 * Only allows pencil for Full version users
 */
function setInputMode(mode) {
    // Validate mode
    if (mode !== 'keyboard' && mode !== 'pencil') {
        console.error('Invalid input mode:', mode);
        return false;
    }

    // Check if pencil mode is allowed
    if (mode === 'pencil' && window.userVersion !== 'full') {
        alert('✨ Pencil Mode is a Full Version feature!\n\nUpgrade to Full Version to use handwriting recognition with your iPad/tablet pencil.');
        return false;
    }

    // Save preference
    const child = getSelectedChild();
    if (child) {
        localStorage.setItem(`inputMode_${child.id}`, mode);
    }

    window.inputMode = mode;
    console.log('Input mode changed to:', mode);

    updateInputModeUI();
    return true;
}

/**
 * Get current input mode
 */
function getInputMode() {
    return window.inputMode || 'keyboard';
}

/**
 * Check if pencil mode is active
 */
function isPencilMode() {
    return window.inputMode === 'pencil';
}

/**
 * Check if pencil mode is available for current user
 */
function isPencilModeAvailable() {
    return window.userVersion === 'full';
}

/**
 * Update UI to reflect current input mode
 */
function updateInputModeUI() {
    const toggle = document.getElementById('input-mode-toggle');
    if (!toggle) return;

    const keyboardBtn = toggle.querySelector('.keyboard-btn');
    const pencilBtn = toggle.querySelector('.pencil-btn');

    if (!keyboardBtn || !pencilBtn) return;

    // Update active state
    if (window.inputMode === 'keyboard') {
        keyboardBtn.classList.add('active');
        pencilBtn.classList.remove('active');
    } else {
        keyboardBtn.classList.remove('active');
        pencilBtn.classList.add('active');
    }

    // Disable pencil button for non-Full users
    if (!isPencilModeAvailable()) {
        pencilBtn.style.opacity = '0.5';
        pencilBtn.style.cursor = 'not-allowed';
        pencilBtn.title = 'Full Version Only';
    } else {
        pencilBtn.style.opacity = '1';
        pencilBtn.style.cursor = 'pointer';
        pencilBtn.title = 'Use iPad/Tablet Pencil';
    }
}

/**
 * Create input mode toggle UI
 * Call this after user data is loaded
 */
function createInputModeToggle() {
    const container = document.getElementById('input-mode-container');
    if (!container) {
        console.warn('Input mode container not found');
        return;
    }

    const html = `
        <div id="input-mode-toggle" class="input-mode-toggle">
            <button class="mode-btn keyboard-btn active" onclick="setInputMode('keyboard')" title="Use Keyboard">
                ⌨️ Keyboard
            </button>
            <button class="mode-btn pencil-btn" onclick="setInputMode('pencil')" title="Use iPad/Tablet Pencil">
                ✏️ Pencil
            </button>
        </div>
    `;

    container.innerHTML = html;
    updateInputModeUI();
}

/**
 * Set user version (called when user data loads)
 */
function setUserVersion(version) {
    window.userVersion = version || 'demo';
    console.log('User version set to:', window.userVersion);

    // Re-validate input mode
    if (window.inputMode === 'pencil' && window.userVersion !== 'full') {
        console.log('User downgraded or version changed, switching to keyboard mode');
        window.inputMode = 'keyboard';
        const child = getSelectedChild();
        if (child) {
            localStorage.setItem(`inputMode_${child.id}`, 'keyboard');
        }
    }

    updateInputModeUI();
}

// Initialize on page load
console.log('Input mode manager loaded');
