// Completion Manager - Central system for tracking worksheet completion
// Handles 95% threshold, navigation blocking, and level progression

/**
 * COMPLETION RULES:
 *
 * Math, English, Aptitude:
 * - Requires 95% or higher score to mark as completed
 * - Must complete current page before accessing next page
 * - Must complete all pages in level before unlocking next level
 *
 * Drawing, German Stories:
 * - Manual completion (user clicks "Mark as Done")
 * - No score validation
 * - Can navigate freely
 */

// Module completion requirements
const COMPLETION_RULES = {
    'math': { requiresScore: true, threshold: 95, sequentialPages: true, sequentialLevels: true },
    'english': { requiresScore: true, threshold: 95, sequentialPages: true, sequentialLevels: true },
    'aptitude': { requiresScore: true, threshold: 95, sequentialPages: true, sequentialLevels: true },
    'drawing': { requiresScore: false, sequentialPages: false, sequentialLevels: false },
    'german': { requiresScore: false, sequentialPages: false, sequentialLevels: false },
    'german-kids': { requiresScore: false, sequentialPages: false, sequentialLevels: false },
    'stories': { requiresScore: false, sequentialPages: false, sequentialLevels: false },
    'eq': { requiresScore: false, sequentialPages: false, sequentialLevels: false }
};

// Get completion rule for module
function getCompletionRule(module) {
    return COMPLETION_RULES[module] || { requiresScore: false, sequentialPages: false, sequentialLevels: false };
}

/**
 * Check if a page meets completion criteria
 * @param {string} module - Module name (math, english, aptitude, etc.)
 * @param {number} score - Score percentage (0-100)
 * @param {boolean} manuallyMarked - Whether user manually marked as done
 * @returns {object} - { completed: boolean, reason: string }
 */
function isPageCompleted(module, score, manuallyMarked = false) {
    const rule = getCompletionRule(module);

    if (!rule.requiresScore) {
        // Manual completion modules
        return {
            completed: manuallyMarked,
            reason: manuallyMarked ? 'Manually marked as complete' : 'Not marked as complete yet'
        };
    }

    // Score-based modules
    if (score >= rule.threshold) {
        return {
            completed: true,
            reason: `Score ${score}% meets ${rule.threshold}% threshold ✓`
        };
    }

    return {
        completed: false,
        reason: `Score ${score}% is below ${rule.threshold}% threshold. Try again!`
    };
}

/**
 * Save page completion to Firestore
 * @param {string} module - Module name
 * @param {string} identifier - Page identifier (e.g., "addition-level1-page1")
 * @param {object} data - Completion data
 */
async function savePageCompletion(module, identifier, data) {
    const user = getCurrentUser && getCurrentUser();
    if (!user) {
        console.error('No user logged in');
        return false;
    }

    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) {
        console.error('No child profile selected');
        return false;
    }

    try {
        const completionId = `${child.email || user.email}_${module}_${identifier}`;

        const completionData = {
            completionId: completionId,
            childId: child.id,
            childEmail: child.email || user.email,
            module: module,
            identifier: identifier,
            score: data.score || 0,
            correctCount: data.correctCount || 0,
            totalProblems: data.totalProblems || 0,
            completed: data.completed || false,
            manuallyMarked: data.manuallyMarked || false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            elapsedTime: data.elapsedTime || '00:00',
            attempts: data.attempts || 1
        };

        await firebase.firestore().collection('completions').doc(completionId).set(completionData, { merge: true });

        console.log(`Saved completion: ${completionId}`, completionData);
        return true;

    } catch (error) {
        console.error('Error saving completion:', error);
        return false;
    }
}

/**
 * Load page completion from Firestore
 * @param {string} module - Module name
 * @param {string} identifier - Page identifier
 * @returns {object|null} - Completion data or null
 */
async function loadPageCompletion(module, identifier) {
    const user = getCurrentUser && getCurrentUser();
    if (!user) return null;

    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) return null;

    try {
        const completionId = `${child.email || user.email}_${module}_${identifier}`;
        const doc = await firebase.firestore().collection('completions').doc(completionId).get();

        if (doc.exists) {
            return doc.data();
        }

        return null;

    } catch (error) {
        console.error('Error loading completion:', error);
        return null;
    }
}

/**
 * Get all completions for a module/level
 * @param {string} module - Module name
 * @param {string} levelPrefix - Level prefix (e.g., "addition-level1")
 * @returns {Array} - Array of completion objects
 */
async function getCompletionsForLevel(module, levelPrefix) {
    const user = getCurrentUser && getCurrentUser();
    if (!user) return [];

    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) return [];

    try {
        const childEmail = child.email || user.email;
        const completions = await firebase.firestore().collection('completions')
            .where('childEmail', '==', childEmail)
            .where('module', '==', module)
            .get();

        // Filter by level prefix
        const filtered = completions.docs
            .map(doc => doc.data())
            .filter(c => c.identifier.startsWith(levelPrefix));

        return filtered;

    } catch (error) {
        console.error('Error loading level completions:', error);
        return [];
    }
}

/**
 * Check if user can access a page (navigation blocking)
 * @param {string} module - Module name
 * @param {number} pageNumber - Page number to access
 * @param {number} currentPage - Current page number
 * @param {string} identifierPrefix - Module-specific identifier prefix (e.g., "addition-level1")
 * @returns {object} - { allowed: boolean, reason: string }
 */
async function canAccessPage(module, pageNumber, currentPage, identifierPrefix) {
    const rule = getCompletionRule(module);

    // Non-sequential modules allow free navigation
    if (!rule.sequentialPages) {
        return { allowed: true, reason: 'Free navigation allowed' };
    }

    // Can always go back
    if (pageNumber <= currentPage) {
        return { allowed: true, reason: 'Can navigate to previous pages' };
    }

    // Check if previous page is completed using module-specific identifier format
    const previousPage = pageNumber - 1;
    const identifier = identifierPrefix
        ? `${identifierPrefix}-page${previousPage}`
        : `${module}-page${previousPage}`;
    const completion = await loadPageCompletion(module, identifier);

    if (!completion || !completion.completed) {
        return {
            allowed: false,
            reason: `Complete page ${previousPage} first (requires ${rule.threshold}% score)`
        };
    }

    return { allowed: true, reason: 'Previous page completed' };
}

/**
 * Check if user can access a level
 * @param {string} module - Module name
 * @param {number} level - Level number to access
 * @returns {object} - { allowed: boolean, reason: string, completion: object }
 */
async function canAccessLevel(module, level) {
    const rule = getCompletionRule(module);

    // Non-sequential modules allow free navigation
    if (!rule.sequentialLevels) {
        return { allowed: true, reason: 'Free navigation allowed', completion: null };
    }

    // Level 1 is always accessible
    if (level === 1) {
        return { allowed: true, reason: 'Starting level', completion: null };
    }

    // Check if previous level is fully completed
    const previousLevel = level - 1;
    const levelCompletion = await getLevelCompletion(module, previousLevel);

    if (!levelCompletion.completed) {
        return {
            allowed: false,
            reason: `Complete all pages in Level ${previousLevel} first (${levelCompletion.completedPages}/${levelCompletion.totalPages} done)`,
            completion: levelCompletion
        };
    }

    return { allowed: true, reason: 'Previous level completed', completion: levelCompletion };
}

/**
 * Get level completion status
 * @param {string} module - Module name
 * @param {number} level - Level number
 * @returns {object} - { completed: boolean, completedPages: number, totalPages: number }
 */
async function getLevelCompletion(module, level) {
    // This is a placeholder - actual implementation will vary by module
    // Each module needs to define how many pages per level

    const levelPrefix = `${module}-level${level}`;
    const completions = await getCompletionsForLevel(module, levelPrefix);

    const completedPages = completions.filter(c => c.completed).length;

    // Estimate total pages (this should come from module configuration)
    const totalPages = estimateTotalPages(module, level);

    return {
        completed: completedPages >= totalPages && totalPages > 0,
        completedPages: completedPages,
        totalPages: totalPages,
        completions: completions
    };
}

/**
 * Get total pages for a module/level based on actual app configuration.
 * Uses APP_CONFIG page counts when available.
 * @param {string} module - Module name
 * @param {number} level - Level number (used for math operation-specific counts)
 * @returns {number} - Total pages for this module/level
 */
function estimateTotalPages(module, level) {
    // Use APP_CONFIG values if available
    if (typeof APP_CONFIG !== 'undefined') {
        const pages = APP_CONFIG.PAGES;
        switch (module) {
            case 'math': return pages.MATH_PER_OPERATION || 150;
            case 'aptitude': return pages.APTITUDE_PER_TYPE || 50;
            case 'english': return pages.ENGLISH_WRITING || 20;
            case 'stories': return pages.STORIES_DEMO || 10;
            default: break;
        }
    }
    // Fallback estimates for modules without APP_CONFIG entries
    const estimates = {
        'math': 150,
        'english': 20,
        'aptitude': 50,
        'drawing': 5,
        'german': 5,
        'german-kids': 5,
        'stories': 10,
        'eq': 10
    };
    return estimates[module] || 10;
}

/**
 * Get visual indicator for page completion
 * @param {boolean} completed - Whether page is completed
 * @param {number} score - Score percentage
 * @returns {string} - HTML for indicator
 */
function getCompletionIndicator(completed, score = 0) {
    if (completed) {
        return '<span class="completion-badge completed" title="Completed!">✓</span>';
    }
    if (score > 0 && score < 95) {
        return `<span class="completion-badge partial" title="Score: ${score}% - Need 95%">⚠️ ${score}%</span>`;
    }
    return '<span class="completion-badge incomplete" title="Not completed">○</span>';
}

/**
 * Add completion indicator styles to document
 */
function injectCompletionStyles() {
    if (document.getElementById('completion-styles')) return;

    const style = document.createElement('style');
    style.id = 'completion-styles';
    style.textContent = `
        .completion-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.9em;
            font-weight: bold;
            margin-left: 8px;
        }

        .completion-badge.completed {
            background: #4CAF50;
            color: white;
        }

        .completion-badge.partial {
            background: #FF9800;
            color: white;
        }

        .completion-badge.incomplete {
            background: #E0E0E0;
            color: #999;
        }

        .page-locked {
            opacity: 0.5;
            pointer-events: none;
            position: relative;
        }

        .page-locked::after {
            content: '🔒 Complete previous page first';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: bold;
        }

        .level-locked {
            opacity: 0.5;
            pointer-events: none;
            cursor: not-allowed;
        }

        .level-locked::after {
            content: '🔒 Locked';
            display: inline-block;
            margin-left: 10px;
            color: #999;
        }

        .completion-message {
            padding: 15px 20px;
            border-radius: 10px;
            margin: 15px 0;
            font-weight: bold;
            text-align: center;
        }

        .completion-message.success {
            background: #4CAF50;
            color: white;
        }

        .completion-message.failure {
            background: #f44336;
            color: white;
        }

        .completion-message.partial {
            background: #FF9800;
            color: white;
        }
    `;

    document.head.appendChild(style);
}

// Initialize styles when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCompletionStyles);
} else {
    injectCompletionStyles();
}

console.log('Completion manager loaded - 95% threshold enforcement active');
