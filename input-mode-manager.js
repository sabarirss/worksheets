/**
 * Input Mode Manager
 * Manages user preference for input method: keyboard or pencil
 * Pencil mode (canvas handwriting) is only available for Full version users
 */

// Global state
window.inputMode = 'keyboard'; // Default for all users
window.childVersion = 'demo'; // Will be updated when child is selected

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

    // Get child's version
    window.childVersion = child.version || 'demo';
    console.log('Child version:', window.childVersion);

    // Load saved preference
    const saved = localStorage.getItem(`inputMode_${child.id}`);

    // Default to keyboard
    if (!saved) {
        window.inputMode = 'keyboard';
    } else {
        // Only allow pencil mode if child has Full version
        if (saved === 'pencil' && window.childVersion !== 'full') {
            console.log('Pencil mode requested but child does not have Full version, defaulting to keyboard');
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
 * Only allows pencil for children with Full version
 */
function setInputMode(mode) {
    // Validate mode
    if (mode !== 'keyboard' && mode !== 'pencil') {
        console.error('Invalid input mode:', mode);
        return false;
    }

    const child = getSelectedChild();
    if (!child) {
        console.error('No child selected');
        return false;
    }

    // Check if pencil mode is allowed for this child
    const childVersion = child.version || 'demo';
    if (mode === 'pencil' && childVersion !== 'full') {
        alert(`✨ Pencil Mode is a Full Version feature!\n\nUpgrade ${child.name}'s profile to Full Version to use handwriting recognition with your iPad/tablet pencil.`);
        return false;
    }

    // Save preference per child
    localStorage.setItem(`inputMode_${child.id}`, mode);

    window.inputMode = mode;
    window.childVersion = childVersion;
    console.log('Input mode changed to:', mode, 'for child:', child.name);

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
 * Check if pencil mode is available for current child
 */
function isPencilModeAvailable() {
    const child = getSelectedChild();
    if (!child) return false;

    const childVersion = child.version || 'demo';
    return childVersion === 'full';
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
 * Set child version (called when child is selected)
 */
function setUserVersion(version) {
    window.childVersion = version || 'demo';
    console.log('Child version set to:', window.childVersion);

    // Re-validate input mode
    if (window.inputMode === 'pencil' && window.childVersion !== 'full') {
        console.log('Child does not have Full version, switching to keyboard mode');
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
