// Parent Mode - Age-verified module management for non-admin users

let isParentMode = false;
let currentUser = null;

/**
 * Initialize parent mode UI
 */
function initializeParentMode(userData) {
    currentUser = userData;

    // Don't show parent mode for admin users
    if (userData.role === 'admin') {
        document.getElementById('parent-mode-btn').style.display = 'none';
        return;
    }

    // Show parent mode button
    document.getElementById('parent-mode-btn').style.display = 'block';

    // Check if already in parent mode (session storage)
    const parentModeSession = sessionStorage.getItem('parentMode');
    if (parentModeSession === 'true') {
        enableParentMode();
    }
}

/**
 * Show parent mode verification modal
 */
function showParentModeVerification() {
    document.getElementById('parent-mode-modal').classList.add('active');

    // Set max date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dob-input').max = today;
    document.getElementById('dob-input').value = '';
    document.getElementById('dob-error').style.display = 'none';
}

/**
 * Close parent mode modal
 */
function closeParentModeModal() {
    document.getElementById('parent-mode-modal').classList.remove('active');
}

/**
 * Verify age and enable parent mode
 */
function verifyAndEnableParentMode() {
    const dobInput = document.getElementById('dob-input').value;
    const errorMsg = document.getElementById('dob-error');

    if (!dobInput) {
        errorMsg.textContent = 'Please select your date of birth';
        errorMsg.style.display = 'block';
        return;
    }

    // Calculate age
    const dob = new Date(dobInput);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    // Check if age is 25 or more
    if (age < 25) {
        errorMsg.textContent = 'Parent Mode is only available for users 25 years or older';
        errorMsg.style.display = 'block';
        return;
    }

    // Age verified - enable parent mode
    sessionStorage.setItem('parentMode', 'true');
    closeParentModeModal();
    enableParentMode();
}

/**
 * Enable parent mode
 */
function enableParentMode() {
    isParentMode = true;

    // Update button
    const parentModeBtn = document.getElementById('parent-mode-btn');
    parentModeBtn.textContent = '🔓 Exit Parent Mode';
    parentModeBtn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

    // Show all modules
    showAllModules();

    // Show module management panel
    showModuleManagement();

    // Show notification
    showNotification('Parent Mode Enabled', 'You can now manage module access');
}

/**
 * Disable parent mode
 */
function disableParentMode() {
    isParentMode = false;
    sessionStorage.removeItem('parentMode');

    // Update button
    const parentModeBtn = document.getElementById('parent-mode-btn');
    parentModeBtn.textContent = '🔒 Parent Mode';
    parentModeBtn.style.background = '';

    // Hide module management panel
    hideModuleManagement();

    // Restore normal module visibility
    initializeUserInterface(currentUser);

    // Show notification
    showNotification('Parent Mode Disabled', 'Student view restored');
}

/**
 * Toggle parent mode
 */
function toggleParentMode() {
    if (isParentMode) {
        disableParentMode();
    } else {
        showParentModeVerification();
    }
}

/**
 * Show all modules (parent mode)
 * Note: German (B1) module is excluded - only admins can manage it
 */
function showAllModules() {
    const allModuleButtons = [
        'button[onclick*="showMathLevels()"]',
        'button[onclick*="english.html"]',
        'button[onclick*="aptitude.html"]',
        'button[onclick*="stories.html"]',
        'button[onclick*="emotional-quotient.html"]',
        'button[onclick*="drawing.html"]',
        'button[onclick*="german-kids.html"]'
        // German B1 module intentionally excluded - admin-only
    ];

    allModuleButtons.forEach(selector => {
        const btn = document.querySelector(selector);
        if (btn) btn.style.display = '';
    });

    // Keep German module visibility based on user's actual permission
    const germanBtn = document.querySelector('button[onclick*="german.html"]');
    if (germanBtn && !currentUser.modules.german) {
        germanBtn.style.display = 'none';
    }
}

/**
 * Show module management panel
 */
function showModuleManagement() {
    const modules = currentUser.modules || {};

    const managementHTML = `
        <div id="module-management-panel" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            margin: 20px 0;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        ">
            <h3 style="margin: 0 0 20px 0; font-size: 1.5em; text-align: center;">
                👨‍👩‍👧‍👦 Parent Mode - Manage Package Access
            </h3>
            <p style="text-align: center; margin-bottom: 20px; opacity: 0.9;">
                Enable or disable modules for your child. Changes are saved automatically.
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="module-toggle">
                    <label style="display: flex; align-items: center; font-size: 1.1em; cursor: pointer; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px; transition: all 0.3s;">
                        <input type="checkbox" id="toggle-math" ${modules.math ? 'checked' : ''} onchange="toggleModule('math', this.checked)" style="width: 20px; height: 20px; margin-right: 10px; cursor: pointer;">
                        <span>📐 Mathematics</span>
                    </label>
                </div>
                <div class="module-toggle">
                    <label style="display: flex; align-items: center; font-size: 1.1em; cursor: pointer; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px; transition: all 0.3s;">
                        <input type="checkbox" id="toggle-english" ${modules.english ? 'checked' : ''} onchange="toggleModule('english', this.checked)" style="width: 20px; height: 20px; margin-right: 10px; cursor: pointer;">
                        <span>📚 English</span>
                    </label>
                </div>
                <div class="module-toggle">
                    <label style="display: flex; align-items: center; font-size: 1.1em; cursor: pointer; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px; transition: all 0.3s;">
                        <input type="checkbox" id="toggle-aptitude" ${modules.aptitude ? 'checked' : ''} onchange="toggleModule('aptitude', this.checked)" style="width: 20px; height: 20px; margin-right: 10px; cursor: pointer;">
                        <span>🧩 Aptitude</span>
                    </label>
                </div>
                <div class="module-toggle">
                    <label style="display: flex; align-items: center; font-size: 1.1em; cursor: pointer; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px; transition: all 0.3s;">
                        <input type="checkbox" id="toggle-stories" ${modules.stories ? 'checked' : ''} onchange="toggleModule('stories', this.checked)" style="width: 20px; height: 20px; margin-right: 10px; cursor: pointer;">
                        <span>📖 Stories</span>
                    </label>
                </div>
                <div class="module-toggle">
                    <label style="display: flex; align-items: center; font-size: 1.1em; cursor: pointer; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px; transition: all 0.3s;">
                        <input type="checkbox" id="toggle-emotional-quotient" ${modules['emotional-quotient'] ? 'checked' : ''} onchange="toggleModule('emotional-quotient', this.checked)" style="width: 20px; height: 20px; margin-right: 10px; cursor: pointer;">
                        <span>❤️ EQ</span>
                    </label>
                </div>
                <div class="module-toggle">
                    <label style="display: flex; align-items: center; font-size: 1.1em; cursor: pointer; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px; transition: all 0.3s;">
                        <input type="checkbox" id="toggle-drawing" ${modules.drawing ? 'checked' : ''} onchange="toggleModule('drawing', this.checked)" style="width: 20px; height: 20px; margin-right: 10px; cursor: pointer;">
                        <span>🎨 Drawing</span>
                    </label>
                </div>
                <div class="module-toggle">
                    <label style="display: flex; align-items: center; font-size: 1.1em; cursor: pointer; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px; transition: all 0.3s;">
                        <input type="checkbox" id="toggle-german-kids" ${modules['german-kids'] ? 'checked' : ''} onchange="toggleModule('german-kids', this.checked)" style="width: 20px; height: 20px; margin-right: 10px; cursor: pointer;">
                        <span>🇩🇪 German Kids</span>
                    </label>
                </div>
            </div>
        </div>
    `;

    // Insert before subject selection
    const subjectSelection = document.querySelector('.subject-selection');
    if (subjectSelection && !document.getElementById('module-management-panel')) {
        subjectSelection.insertAdjacentHTML('beforebegin', managementHTML);
    }
}

/**
 * Hide module management panel
 */
function hideModuleManagement() {
    const panel = document.getElementById('module-management-panel');
    if (panel) {
        panel.remove();
    }
}

/**
 * Toggle module access
 */
async function toggleModule(moduleName, enabled) {
    try {
        // Get current user's Firebase auth
        const firebaseUser = firebase.auth().currentUser;
        if (!firebaseUser) {
            showNotification('Error', 'Not authenticated', 'error');
            return;
        }

        // Find user document by email
        const userQuery = await firebase.firestore().collection('users')
            .where('email', '==', firebaseUser.email.toLowerCase())
            .limit(1)
            .get();

        if (userQuery.empty) {
            showNotification('Error', 'User not found', 'error');
            return;
        }

        const userDoc = userQuery.docs[0];
        const updates = {};
        updates[`modules.${moduleName}`] = enabled;

        // Update Firestore
        await userDoc.ref.update(updates);

        // Update local user object
        currentUser.modules[moduleName] = enabled;

        // Show success notification
        showNotification(
            'Package Updated',
            `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} ${enabled ? 'enabled' : 'disabled'}`,
            'success'
        );

    } catch (error) {
        console.error('Error updating module:', error);
        showNotification('Error', 'Failed to update module access', 'error');
    }
}

/**
 * Show notification
 */
function showNotification(title, message, type = 'success') {
    const bgColor = type === 'error' ? '#e74c3c' : '#4caf50';

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: bold;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div style="font-size: 1.2em; margin-bottom: 5px;">${title}</div>
        <div style="opacity: 0.9;">${message}</div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .module-toggle label:hover {
        background: rgba(255,255,255,0.3) !important;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);
