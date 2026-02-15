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
 * For admins: uses admin's own input mode from their profile
 * For parents: uses selected child's input mode
 */
async function initializeInputMode() {
    // Check if user is admin
    const isAdmin = await checkIfAdmin();

    if (isAdmin) {
        console.log('Admin user detected, loading admin input mode');
        await initializeAdminInputMode();
        return;
    }

    // For non-admin users, use child's preference
    const child = getSelectedChild();
    if (!child) {
        console.log('No child selected, using default keyboard mode');
        window.inputMode = 'keyboard';
        return;
    }

    // Get child's version and input mode from child object (loaded from Firestore)
    window.childVersion = child.version || 'demo';
    console.log('Child version:', window.childVersion);

    // Use input mode from child object (which comes from Firestore)
    const saved = child.inputMode || 'keyboard';
    console.log('Saved input mode:', saved);

    // Only allow pencil mode if child has Full version
    if (saved === 'pencil' && window.childVersion !== 'full') {
        console.log('Pencil mode requested but child does not have Full version, defaulting to keyboard');
        window.inputMode = 'keyboard';
    } else {
        window.inputMode = saved;
    }

    console.log('Input mode initialized:', window.inputMode);
    updateInputModeUI();
}

/**
 * Initialize input mode for admin users
 * Admins don't have children, so we use their own profile settings
 */
async function initializeAdminInputMode() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log('No user authenticated');
            window.inputMode = 'keyboard';
            return;
        }

        // Get admin's input mode from Firestore
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            console.log('Admin user document not found');
            window.inputMode = 'keyboard';
            return;
        }

        const userData = userDoc.data();
        const savedMode = userData.inputMode || 'keyboard';

        // Admins always have full access (no version restriction)
        window.inputMode = savedMode;
        window.childVersion = 'full'; // Admins always have full access

        console.log('Admin input mode initialized:', window.inputMode);
        updateInputModeUI();
    } catch (error) {
        console.error('Error initializing admin input mode:', error);
        window.inputMode = 'keyboard';
    }
}

/**
 * Check if current user is admin
 */
async function checkIfAdmin() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return false;

        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists) return false;

        const userData = userDoc.data();
        return userData.role === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

/**
 * Set input mode (keyboard or pencil)
 * For admins: saves to their own profile
 * For parents: saves per child, only allows pencil for children with Full version
 */
async function setInputMode(mode) {
    // Validate mode
    if (mode !== 'keyboard' && mode !== 'pencil') {
        console.error('Invalid input mode:', mode);
        return false;
    }

    // Check if user is admin
    const isAdmin = await checkIfAdmin();

    if (isAdmin) {
        // Admin: save to their own profile
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                console.error('No user authenticated');
                return false;
            }

            await firebase.firestore().collection('users').doc(user.uid).update({
                inputMode: mode,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });

            window.inputMode = mode;
            window.childVersion = 'full'; // Admins always have full access
            console.log('Admin input mode changed to:', mode);

            updateInputModeUI();
            return true;
        } catch (error) {
            console.error('Error saving admin input mode:', error);
            return false;
        }
    }

    // Non-admin: save per child to Firestore
    const child = getSelectedChild();
    if (!child) {
        console.error('No child selected');
        return false;
    }

    // Fetch fresh child data from Firestore to check current version
    try {
        const childDoc = await firebase.firestore().collection('children').doc(child.id).get();
        if (!childDoc.exists) {
            console.error('Child document not found in Firestore');
            alert('Child profile not found. Please refresh the page.');
            return false;
        }

        const childData = childDoc.data();
        const childVersion = childData.version || 'demo';

        // Check if pencil mode is allowed for this child
        if (mode === 'pencil' && childVersion !== 'full') {
            alert(`✨ Pencil Mode is a Full Version feature!\n\nUpgrade ${child.name}'s profile to Full Version to use handwriting recognition with your iPad/tablet pencil.`);
            return false;
        }

        // Save preference per child to Firestore
        await firebase.firestore().collection('children').doc(child.id).update({
            inputMode: mode,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.inputMode = mode;
        window.childVersion = childVersion;
        console.log('Input mode changed to:', mode, 'for child:', child.name);

        updateInputModeUI();
        return true;
    } catch (error) {
        console.error('Error saving input mode:', error);
        alert('Failed to save input mode preference');
        return false;
    }
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
 * Creates in .user-actions div before version badge
 */
function createInputModeToggle() {
    // Remove existing toggle if present
    const existingToggle = document.getElementById('input-mode-toggle');
    if (existingToggle) {
        existingToggle.remove();
    }

    // Find user-actions container
    const userActions = document.querySelector('.user-actions');
    if (!userActions) {
        console.warn('User actions container not found');
        return;
    }

    // Create toggle element
    const toggleDiv = document.createElement('div');
    toggleDiv.id = 'input-mode-toggle';
    toggleDiv.className = 'input-mode-toggle';
    toggleDiv.innerHTML = `
        <button class="mode-btn keyboard-btn active" onclick="setInputMode('keyboard')" title="Use Keyboard">
            ⌨️ Keyboard
        </button>
        <button class="mode-btn pencil-btn" onclick="setInputMode('pencil')" title="Use iPad/Tablet Pencil">
            ✏️ Pencil
        </button>
    `;

    // Insert before version badge (first child of user-actions)
    userActions.insertBefore(toggleDiv, userActions.firstChild);

    updateInputModeUI();
}

/**
 * Set child version (called when child is selected)
 */
async function setUserVersion(version) {
    window.childVersion = version || 'demo';
    console.log('Child version set to:', window.childVersion);

    // Re-validate input mode
    if (window.inputMode === 'pencil' && window.childVersion !== 'full') {
        console.log('Child does not have Full version, switching to keyboard mode');
        window.inputMode = 'keyboard';
        const child = getSelectedChild();
        if (child) {
            try {
                await firebase.firestore().collection('children').doc(child.id).update({
                    inputMode: 'keyboard',
                    updated_at: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('Input mode reset to keyboard in Firestore');
            } catch (error) {
                console.error('Error resetting input mode:', error);
            }
        }
    }

    updateInputModeUI();
}

// Initialize on page load
console.log('Input mode manager loaded');
