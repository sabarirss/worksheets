// Profile Selector Component
// Manages child profile selection across all module pages

// Initialize profile selector when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeProfileSelector();
});

// Initialize the profile selector component
async function initializeProfileSelector() {
    // Wait for Firebase auth to initialize
    firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            await loadProfileSelector(user.uid);
        }
    });
}

// Load and render the profile selector
async function loadProfileSelector(parentUid) {
    const container = document.getElementById('profile-selector-container');
    if (!container) {
        console.warn('Profile selector container not found');
        return;
    }

    try {
        // Load all children for this parent
        // Note: Not using orderBy to avoid requiring created_at field on old documents
        const snapshot = await firebase.firestore()
            .collection('children')
            .where('parent_uid', '==', parentUid)
            .get();

        if (snapshot.empty) {
            // No children found - hide container (redirect will happen from index.html)
            // Don't show error on index.html since redirect is triggered separately
            container.style.display = 'none';
            console.log('No children profiles found - container hidden');
            return;
        }

        // Get all children and sort by created_at if available
        const children = [];
        snapshot.forEach(doc => {
            children.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort by created_at if field exists, otherwise keep original order
        children.sort((a, b) => {
            if (a.created_at && b.created_at) {
                return b.created_at.toMillis() - a.created_at.toMillis();
            }
            return 0;
        });

        // Get currently selected child from localStorage
        const currentChild = getSelectedChild();
        let selectedChildId = currentChild ? currentChild.id : null;

        // If no child selected or selected child doesn't exist, select first child
        if (!selectedChildId || !children.find(c => c.id === selectedChildId)) {
            selectChild(children[0].id, children[0]);
            selectedChildId = children[0].id;
        }

        // Render the profile selector
        renderProfileSelector(container, children, selectedChildId);

    } catch (error) {
        console.error('Error loading profile selector:', error);
        console.error('Error details:', error.code, error.message);

        // Hide container instead of showing error
        // This allows index.html redirect to work properly
        container.style.display = 'none';

        // If it's a permission error, the user likely needs to create children
        if (error.code === 'permission-denied') {
            console.log('Permission denied - user may need to create children profiles');
        }
    }
}

// Render empty state when no children exist
function renderEmptyState(container) {
    container.innerHTML = `
        <div class="profile-selector-empty">
            <span class="empty-icon">👶</span>
            <button class="add-child-link" onclick="window.location.href='children-profiles.html'">
                ➕ Add Child Profile
            </button>
        </div>
    `;
}

// Render the profile selector dropdown
function renderProfileSelector(container, children, selectedChildId) {
    const selectedChild = children.find(c => c.id === selectedChildId);

    if (!selectedChild) {
        renderEmptyState(container);
        return;
    }

    const avatar = getChildAvatar(selectedChild.gender);

    container.innerHTML = `
        <div class="profile-selector">
            <div class="profile-selector-current" onclick="toggleProfileDropdown()">
                <span class="profile-avatar">${avatar}</span>
                <div class="profile-info">
                    <span class="profile-name">${selectedChild.name}</span>
                    <span class="profile-age">Age ${selectedChild.age}</span>
                </div>
                <span class="dropdown-arrow">▼</span>
            </div>
            <div class="profile-dropdown" id="profile-dropdown" style="display: none;">
                ${children.map(child => renderChildOption(child, selectedChildId)).join('')}
                <div class="profile-dropdown-divider"></div>
                <div class="profile-dropdown-item add-child-item" onclick="window.location.href='children-profiles.html'">
                    ➕ Manage Profiles
                </div>
            </div>
        </div>
    `;

    // Close dropdown when clicking outside
    document.addEventListener('click', closeProfileDropdownOutside);
}

// Render a child option in the dropdown
function renderChildOption(child, selectedChildId) {
    const avatar = getChildAvatar(child.gender);
    const isSelected = child.id === selectedChildId;

    return `
        <div class="profile-dropdown-item ${isSelected ? 'selected' : ''}" style="display: flex; align-items: center; justify-content: space-between;">
            <div onclick="selectChildFromDropdown('${child.id}', '${child.name}', ${child.age}, '${child.gender}')" style="display: flex; align-items: center; gap: 12px; flex: 1; padding-right: 10px;">
                <span class="profile-avatar">${avatar}</span>
                <div class="profile-info">
                    <span class="profile-name">${child.name}</span>
                    <span class="profile-age">Age ${child.age}</span>
                </div>
                ${isSelected ? '<span class="check-mark">✓</span>' : ''}
            </div>
            <button onclick="event.stopPropagation(); openChildSettings('${child.id}', '${child.name}')" style="background: none; border: none; padding: 8px; cursor: pointer; font-size: 1.2em; color: #667eea; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" title="Child Settings">
                ⚙️
            </button>
        </div>
    `;
}

// Get avatar emoji based on gender
function getChildAvatar(gender) {
    if (gender === 'boy') return '👦';
    if (gender === 'girl') return '👧';
    return '👶';
}

// Toggle dropdown visibility
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    if (!dropdown) return;

    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
}

// Close dropdown when clicking outside
function closeProfileDropdownOutside(event) {
    const selector = document.querySelector('.profile-selector');
    const dropdown = document.getElementById('profile-dropdown');

    if (!selector || !dropdown) return;

    if (!selector.contains(event.target)) {
        dropdown.style.display = 'none';
    }
}

// Select a child from the dropdown
function selectChildFromDropdown(childId, name, age, gender) {
    selectChild(childId, { name, age, gender });

    // Reload the profile selector to update UI
    const user = firebase.auth().currentUser;
    if (user) {
        loadProfileSelector(user.uid);
    }

    // Close dropdown
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// Select a child and store in localStorage
function selectChild(childId, childData) {
    // Store with both keys for backwards compatibility
    localStorage.setItem('selectedChildId', childId);
    localStorage.setItem('selectedChild', JSON.stringify({
        id: childId,
        ...childData
    }));
    console.log('Selected child:', childData.name, 'ID:', childId);

    // Initialize input mode for this child (if input mode manager is loaded)
    if (typeof initializeInputMode === 'function') {
        initializeInputMode();
    }

    // Create session for single-device enforcement (if session manager is loaded)
    if (typeof createChildSession === 'function') {
        createChildSession(childId);
    }

    // Start activity tracking (if session manager is loaded)
    if (typeof startActivityTracking === 'function') {
        startActivityTracking();
    }
}

// Get the currently selected child
// Returns: { id, name, age, gender, grade, date_of_birth } or null
function getSelectedChild() {
    const childDataStr = localStorage.getItem('selectedChild');

    if (!childDataStr) {
        return null;
    }

    try {
        const childData = JSON.parse(childDataStr);
        return childData;
    } catch (error) {
        console.error('Error parsing selected child data:', error);
        return null;
    }
}

// Check if a child is selected
function isChildSelected() {
    return getSelectedChild() !== null;
}

// Clear selected child (useful for logout)
function clearSelectedChild() {
    localStorage.removeItem('selectedChildId');
    localStorage.removeItem('selectedChild');

    // Clear child session (if session manager is loaded)
    if (typeof clearChildSession === 'function') {
        clearChildSession();
    }

    // Stop activity tracking (if session manager is loaded)
    if (typeof stopActivityTracking === 'function') {
        stopActivityTracking();
    }
}

// Open child settings modal
function openChildSettings(childId, childName) {
    // Close profile dropdown
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.style.display = 'none';

    // Get current input mode for this child
    const currentMode = localStorage.getItem(`inputMode_${childId}`) || 'keyboard';

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'child-settings-modal';
    modal.innerHTML = `
        <div class="child-settings-modal-overlay" onclick="closeChildSettings()"></div>
        <div class="child-settings-modal-content">
            <div class="child-settings-header">
                <h2>⚙️ ${childName}'s Settings</h2>
                <button class="close-btn" onclick="closeChildSettings()">✕</button>
            </div>

            <div class="child-settings-body">
                <div class="settings-section">
                    <h3>Input Mode</h3>
                    <p class="settings-description">Choose how ${childName} will answer questions</p>

                    <div class="input-mode-options">
                        <div class="input-mode-option ${currentMode === 'keyboard' ? 'selected' : ''}"
                             onclick="selectInputMode('${childId}', 'keyboard')">
                            <div class="mode-icon">⌨️</div>
                            <div class="mode-label">Keyboard</div>
                            <div class="mode-desc">Type answers with keyboard</div>
                        </div>

                        <div class="input-mode-option ${currentMode === 'pencil' ? 'selected' : ''}"
                             onclick="selectInputMode('${childId}', 'pencil')">
                            <div class="mode-icon">✏️</div>
                            <div class="mode-label">Pencil</div>
                            <div class="mode-desc">Draw answers with stylus</div>
                            ${window.userVersion !== 'full' ? '<div class="mode-badge">Full Version Only</div>' : ''}
                        </div>
                    </div>
                </div>
            </div>

            <div class="child-settings-footer">
                <button class="settings-close-btn" onclick="closeChildSettings()">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Close child settings modal
function closeChildSettings() {
    const modal = document.getElementById('child-settings-modal');
    if (modal) {
        modal.remove();
    }
}

// Select input mode for child
function selectInputMode(childId, mode) {
    // Check if pencil mode is allowed
    if (mode === 'pencil' && window.userVersion !== 'full') {
        alert('Pencil Mode is a Full Version feature!\n\nUpgrade to Full Version to unlock:\n✏️ Handwriting input for all modules\n📊 Advanced analytics\n🎯 Personalized learning paths');
        return;
    }

    // Save the preference
    localStorage.setItem(`inputMode_${childId}`, mode);

    // Update global state if this is the currently selected child
    const selectedChild = getSelectedChild();
    if (selectedChild && selectedChild.id === childId) {
        if (typeof setInputMode === 'function') {
            setInputMode(mode);
        } else {
            window.inputMode = mode;
        }
    }

    // Update UI
    const options = document.querySelectorAll('.input-mode-option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.input-mode-option').classList.add('selected');

    console.log(`Input mode set to ${mode} for child ${childId}`);
}

// Add styles for the profile selector
const profileSelectorStyles = document.createElement('style');
profileSelectorStyles.textContent = `
    /* Profile Selector Styles */
    #profile-selector-container {
        margin-left: auto;
    }

    .profile-selector {
        position: relative;
        min-width: 200px;
    }

    .profile-selector-current {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s;
        border: 2px solid transparent;
    }

    .profile-selector-current:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
    }

    .profile-avatar {
        font-size: 1.8em;
        line-height: 1;
    }

    .profile-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
    }

    .profile-name {
        font-weight: bold;
        font-size: 1em;
        color: white;
    }

    .profile-age {
        font-size: 0.85em;
        opacity: 0.9;
        color: white;
    }

    .dropdown-arrow {
        color: white;
        font-size: 0.8em;
        transition: transform 0.3s;
    }

    .profile-selector-current:hover .dropdown-arrow {
        transform: translateY(2px);
    }

    .profile-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        min-width: 250px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .profile-dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 15px;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 1px solid #f0f0f0;
    }

    .profile-dropdown-item:last-child {
        border-bottom: none;
    }

    .profile-dropdown-item:hover {
        background: #f8f9fa;
    }

    .profile-dropdown-item.selected {
        background: #e3f2fd;
    }

    .profile-dropdown-item .profile-avatar {
        font-size: 1.5em;
    }

    .profile-dropdown-item .profile-info {
        flex: 1;
    }

    .profile-dropdown-item .profile-name {
        color: #2c3e50;
        font-size: 0.95em;
    }

    .profile-dropdown-item .profile-age {
        color: #666;
        font-size: 0.85em;
    }

    .check-mark {
        color: #4caf50;
        font-weight: bold;
        font-size: 1.2em;
    }

    .profile-dropdown-divider {
        height: 1px;
        background: #ddd;
        margin: 5px 0;
    }

    .add-child-item {
        color: #667eea;
        font-weight: bold;
        justify-content: center;
    }

    .add-child-item:hover {
        background: #f0f4ff;
    }

    .profile-selector-empty {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        border: 2px dashed rgba(255, 255, 255, 0.5);
    }

    .empty-icon {
        font-size: 1.8em;
    }

    .add-child-link {
        background: rgba(255, 255, 255, 0.9);
        color: #667eea;
        border: none;
        padding: 8px 15px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s;
        font-size: 0.9em;
    }

    .add-child-link:hover {
        background: white;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
        .profile-selector {
            min-width: 160px;
        }

        .profile-selector-current {
            padding: 8px 12px;
            gap: 8px;
        }

        .profile-avatar {
            font-size: 1.5em;
        }

        .profile-name {
            font-size: 0.9em;
        }

        .profile-age {
            font-size: 0.8em;
        }

        .profile-dropdown {
            min-width: 220px;
            max-height: 300px;
        }

        .profile-dropdown-item {
            padding: 10px 12px;
            gap: 10px;
        }
    }

    @media (max-width: 480px) {
        .profile-selector {
            min-width: 140px;
        }

        .profile-selector-current {
            padding: 6px 10px;
        }

        .profile-avatar {
            font-size: 1.3em;
        }

        .profile-name {
            font-size: 0.85em;
        }

        .profile-age {
            font-size: 0.75em;
        }

        .profile-dropdown {
            right: -10px;
            left: -10px;
            width: auto;
            min-width: auto;
        }
    }

    /* Child Settings Modal Styles */
    #child-settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .child-settings-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
    }

    .child-settings-modal-content {
        position: relative;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .child-settings-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 25px 30px;
        border-bottom: 2px solid #f0f0f0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px 20px 0 0;
    }

    .child-settings-header h2 {
        margin: 0;
        color: white;
        font-size: 1.5em;
    }

    .child-settings-header .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 1.5em;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .child-settings-header .close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
    }

    .child-settings-body {
        padding: 30px;
    }

    .settings-section {
        margin-bottom: 25px;
    }

    .settings-section h3 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.2em;
    }

    .settings-description {
        color: #666;
        margin: 0 0 20px 0;
        font-size: 0.95em;
    }

    .input-mode-options {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }

    .input-mode-option {
        flex: 1;
        min-width: 180px;
        padding: 20px;
        border: 3px solid #e0e0e0;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s;
        text-align: center;
        position: relative;
    }

    .input-mode-option:hover {
        border-color: #667eea;
        background: #f8f9ff;
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
    }

    .input-mode-option.selected {
        border-color: #667eea;
        background: linear-gradient(135deg, #667eea15, #764ba215);
        box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
    }

    .mode-icon {
        font-size: 3em;
        margin-bottom: 10px;
    }

    .mode-label {
        font-weight: bold;
        font-size: 1.1em;
        color: #333;
        margin-bottom: 5px;
    }

    .mode-desc {
        font-size: 0.9em;
        color: #666;
    }

    .mode-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff9800;
        color: white;
        font-size: 0.7em;
        font-weight: bold;
        padding: 4px 8px;
        border-radius: 10px;
        white-space: nowrap;
    }

    .child-settings-footer {
        padding: 20px 30px;
        border-top: 2px solid #f0f0f0;
        text-align: right;
    }

    .settings-close-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 10px;
        font-size: 1.1em;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
    }

    .settings-close-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    @media (max-width: 600px) {
        .input-mode-options {
            flex-direction: column;
        }

        .input-mode-option {
            min-width: auto;
        }

        .child-settings-modal-content {
            width: 95%;
        }

        .child-settings-header {
            padding: 20px;
        }

        .child-settings-body {
            padding: 20px;
        }
    }
`;

document.head.appendChild(profileSelectorStyles);
