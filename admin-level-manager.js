// Admin Level Selection Manager
// Manages admin's level selections per module for content filtering

/**
 * Get all admin level selections from localStorage
 * @returns {Object} Object with module names as keys and level numbers as values
 */
function getAdminLevelSelections() {
    const stored = localStorage.getItem('admin_level_selections');
    return stored ? JSON.parse(stored) : {};
}

/**
 * Get admin's selected level for a specific module
 * @param {string} module - Module name (e.g., 'math', 'english', 'aptitude')
 * @returns {string|null} Level number (1-12) or null for "All Levels"
 */
function getAdminLevelForModule(module) {
    const selections = getAdminLevelSelections();
    const level = selections[module] || null;
    console.log(`Admin level for ${module}:`, level || 'All Levels');
    return level;
}

/**
 * Save admin's level selection for a module
 * @param {string} module - Module name
 * @param {string} level - Level number (1-12) or empty string for "All Levels"
 */
function saveAdminLevelSelection(module, level) {
    const selections = getAdminLevelSelections();
    selections[module] = level || null;
    localStorage.setItem('admin_level_selections', JSON.stringify(selections));
    console.log(`Admin level for ${module} saved:`, level || 'All Levels');
}

/**
 * Check if user is admin and has a level selected for the current module
 * @param {string} module - Module name
 * @returns {Object} { isAdmin: boolean, level: string|null }
 */
function checkAdminLevelAccess(module) {
    const isAdmin = window.currentUserRole === 'admin';
    const level = isAdmin ? getAdminLevelForModule(module) : null;

    return {
        isAdmin,
        level,
        hasLevelRestriction: isAdmin && level !== null
    };
}

/**
 * Get the age group and difficulty for a given level number
 * @param {number} level - Level number (1-12)
 * @returns {Object} { ageGroup: string, difficulty: string }
 */
function getLevelDetails(level) {
    level = parseInt(level);

    const mapping = {
        1: { ageGroup: '4-5', difficulty: 'easy' },
        2: { ageGroup: '4-5', difficulty: 'medium' },
        3: { ageGroup: '6', difficulty: 'easy' },
        4: { ageGroup: '6', difficulty: 'medium' },
        5: { ageGroup: '7', difficulty: 'easy' },
        6: { ageGroup: '7', difficulty: 'medium' },
        7: { ageGroup: '8', difficulty: 'easy' },
        8: { ageGroup: '8', difficulty: 'medium' },
        9: { ageGroup: '9+', difficulty: 'easy' },
        10: { ageGroup: '9+', difficulty: 'medium' },
        11: { ageGroup: '10+', difficulty: 'easy' },
        12: { ageGroup: '10+', difficulty: 'hard' }
    };

    return mapping[level] || { ageGroup: '6', difficulty: 'easy' };
}

/**
 * Get display name for a level
 * @param {number} level - Level number (1-12)
 * @returns {string} Display name
 */
function getLevelDisplayName(level) {
    const names = {
        1: 'Level 1 - Basic Foundations',
        2: 'Level 2 - Pre-K Advanced',
        3: 'Level 3 - Kindergarten Basics',
        4: 'Level 4 - Kindergarten Advanced',
        5: 'Level 5 - 1st Grade Basics',
        6: 'Level 6 - 1st Grade Advanced',
        7: 'Level 7 - 2nd Grade Basics',
        8: 'Level 8 - 2nd Grade Advanced',
        9: 'Level 9 - 3rd Grade Basics',
        10: 'Level 10 - 4th Grade Advanced',
        11: 'Level 11 - Advanced Basics',
        12: 'Level 12 - Pre-Teen Advanced'
    };
    return names[level] || `Level ${level}`;
}

/**
 * Show level indicator banner in module (if admin has level selected)
 * @param {string} module - Module name
 * @param {HTMLElement} container - Container element to prepend banner to
 */
function showAdminLevelIndicator(module, container) {
    const access = checkAdminLevelAccess(module);

    if (access.hasLevelRestriction) {
        const existingBanner = container.querySelector('.admin-level-banner');
        if (existingBanner) existingBanner.remove();

        const banner = document.createElement('div');
        banner.className = 'admin-level-banner';
        banner.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 1.1em;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        `;
        banner.innerHTML = `
            📊 Admin Mode: Viewing ${getLevelDisplayName(access.level)}
            <a href="admin.html" style="color: #ffd93d; text-decoration: underline; margin-left: 15px; font-weight: normal;">Change Level</a>
        `;

        container.insertBefore(banner, container.firstChild);
    }
}

console.log('Admin level manager loaded');
