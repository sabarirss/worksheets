/**
 * GleeGrow Application Constants & Shared Helpers
 * Single source of truth for all configuration values used across modules.
 * Load this file BEFORE any module generator scripts.
 */

// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

const APP_CONFIG = {
    // Brand
    BRAND_NAME: 'GleeGrow',
    TAGLINE: 'Happy Learning!',
    PRIMARY_COLOR: '#28a745',
    TAGLINE_COLOR: '#999',
    GRADIENT_START: '#667eea',
    GRADIENT_END: '#764ba2',

    // Age Groups (ordered from youngest to oldest)
    AGE_GROUPS: ['4-5', '6', '7', '8', '9+', '10+'],

    // Difficulty Levels
    DIFFICULTIES: ['easy', 'medium', 'hard'],

    // Level System
    TOTAL_LEVELS: 12,

    // Module Page Counts
    PAGES: {
        MATH_PER_OPERATION: 150,
        APTITUDE_PER_TYPE: 50,
        ENGLISH_WRITING: 20,
        STORIES_DEMO: 2,
    },

    // Demo Mode
    DEMO_LIMIT: 2,

    // Page Access Control
    PAGE_ACCESS: {
        DEMO_PAGE_COUNT: 2,
        WEEKLY_PAGE_COUNT: 7,
    },

    // Assessment
    ASSESSMENT: {
        QUESTION_COUNT: 10,
        YOUNGER_QUESTIONS: 5,
        CURRENT_QUESTIONS: 5,
        SCORE_TOO_HARD: 30,     // Below this: assign easier content
        SCORE_TOO_EASY: 75,     // Above this: assign harder content
    },

    // Completion
    COMPLETION_THRESHOLD: 95,   // Percentage required to mark page complete

    // Canvas / Drawing
    CANVAS: {
        BG_COLOR: '#f8f9ff',
        RED_LINE: '#e74c3c',
        BLUE_LINE: '#3498db',
        FONT_SIZE: '24px',
    },

    // FOUC Prevention
    FOUC_TRANSITION: '0.1s',

    // Firebase Collections
    COLLECTIONS: {
        USERS: 'users',
        CHILDREN: 'children',
        WORKSHEETS: 'worksheets',
        COMPLETIONS: 'completions',
        CHILD_SESSIONS: 'child_sessions',
    },

    // LocalStorage Keys
    STORAGE_KEYS: {
        SELECTED_CHILD: 'selectedChild',
        SELECTED_CHILD_ID: 'selectedChildId',
        ADMIN_LEVEL: 'admin_level_selections',
        ADMIN_DEMO_PREVIEW: 'adminDemoPreview',
        ADMIN_INITIALIZED: 'adminInitialized',
    },

    // Math Operations
    MATH_OPERATIONS: ['addition', 'subtraction', 'multiplication', 'division'],
    OPERATION_SYMBOLS: {
        'addition': '+',
        'subtraction': '−',
        'multiplication': '×',
        'division': '÷'
    },

    // Age Group Map (numeric age → age group string)
    AGE_TO_GROUP: {
        '4': '4-5', '5': '4-5',
        '6': '6', '7': '7', '8': '8',
        '9': '9+', '10': '10+', '11': '10+', '12': '10+', '13': '10+'
    },
};

// ============================================================================
// SHARED HELPER FUNCTIONS
// ============================================================================

/**
 * Check if the app is in demo mode for the current user/child.
 * Admins can toggle demo preview; children inherit from parent's package.
 * @returns {boolean} True if in demo mode
 */
function isDemoMode() {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user) return true;

    // Admin demo preview toggle
    if (user.role === 'admin') {
        return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_DEMO_PREVIEW) === 'true';
    }

    // Get selected child's version
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) return true;

    return (child.version || 'demo') === 'demo';
}

/**
 * Get the page/item limit based on demo mode.
 * @param {number} fullCount - The full version count
 * @returns {number} Demo limit (2) or full count
 */
function getDemoLimit(fullCount) {
    return isDemoMode() ? Math.min(APP_CONFIG.DEMO_LIMIT, fullCount) : fullCount;
}

/**
 * Get age group string from a numeric age.
 * @param {number|string} age - Child's age
 * @returns {string} Age group string (e.g., '4-5', '6', '7', '8', '9+', '10+')
 */
function getAgeGroupFromAge(age) {
    return APP_CONFIG.AGE_TO_GROUP[String(age)] || '6';
}

/**
 * Sanitize a string for safe HTML display (prevent XSS).
 * @param {string} str - Input string
 * @returns {string} Escaped HTML string
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

console.log('App constants and shared helpers loaded');
