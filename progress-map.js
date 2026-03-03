/**
 * Progress Map — Gamified Learning Journey
 * Displays a visual plant-growth path showing child's progress through pages.
 * Read-only: reads from existing completions, weekly_assignments, children collections.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROGRESS_CONFIG = {
    math: {
        subtypes: ['addition', 'subtraction', 'multiplication', 'division'],
        labels: {
            addition: 'Addition',
            subtraction: 'Subtraction',
            multiplication: 'Multiplication',
            division: 'Division'
        },
        iconKeys: {
            addition: 'addition',
            subtraction: 'subtraction',
            multiplication: 'multiplication',
            division: 'division'
        },
        totalPages: 150,
        pagesPerDifficulty: 50,
        groupSize: 7,      // Full: 7 pages per node
        demoGroupSize: 2,   // Demo: 2 pages per node
        assessmentPerSubtype: true,
        navigateFn: 'loadOperationWorksheet'
    },
    english: {
        subtypes: ['writing', 'easy', 'medium', 'hard'],
        labels: {
            writing: 'Writing',
            easy: 'Vocab Easy',
            medium: 'Vocab Medium',
            hard: 'Vocab Hard'
        },
        iconKeys: {
            writing: 'writingPen',
            easy: 'vocab',
            medium: 'vocab',
            hard: 'vocab'
        },
        totalPages: 50,
        pagesPerDifficulty: 50,
        groupSize: 7,
        demoGroupSize: 2,
        assessmentPerSubtype: false,
        navigateFn: 'loadWorksheetNew'
    }
};

// Plant growth stages mapped to progress fraction
const PLANT_STAGES = [
    { name: 'seed',       threshold: 0.00 },
    { name: 'sprout',     threshold: 0.10 },
    { name: 'seedling',   threshold: 0.25 },
    { name: 'young',      threshold: 0.40 },
    { name: 'small-tree', threshold: 0.60 },
    { name: 'big-tree',   threshold: 0.80 },
    { name: 'flowering',  threshold: 0.95 }
];

// ============================================================================
// PLANT SVG RENDERERS
// ============================================================================

function getPlantSVG(stage, size) {
    size = size || 44;
    const svgs = {
        'seed': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <defs>
                <linearGradient id="seed-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#a1887f"/>
                    <stop offset="50%" stop-color="#795548"/>
                    <stop offset="100%" stop-color="#5d4037"/>
                </linearGradient>
                <linearGradient id="seed-soil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8d6e63"/>
                    <stop offset="100%" stop-color="#5d4037"/>
                </linearGradient>
                <radialGradient id="seed-shine" cx="0.35" cy="0.3" r="0.5">
                    <stop offset="0%" stop-color="white" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="white" stop-opacity="0"/>
                </radialGradient>
            </defs>
            <ellipse cx="25" cy="42" rx="14" ry="5" fill="url(#seed-soil)" opacity="0.6"/>
            <ellipse cx="25" cy="30" rx="9" ry="11" fill="url(#seed-body)"/>
            <ellipse cx="25" cy="30" rx="9" ry="11" fill="url(#seed-shine)"/>
            <path d="M25 19 Q25 28 25 41" stroke="#4e342e" stroke-width="0.8" fill="none" opacity="0.4"/>
            <path d="M25 38 Q27 42 26 46" stroke="#6d4c41" stroke-width="1.2" fill="none" opacity="0.5"/>
            <path d="M25 20 Q23 14 20 10" stroke="#66bb6a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <circle cx="19.5" cy="9.5" r="1.5" fill="#81c784" opacity="0.7"/>
        </svg>`,
        'sprout': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <defs>
                <linearGradient id="sprout-stem" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#43a047"/>
                    <stop offset="50%" stop-color="#66bb6a"/>
                    <stop offset="100%" stop-color="#43a047"/>
                </linearGradient>
                <linearGradient id="sprout-leaf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#81c784"/>
                    <stop offset="100%" stop-color="#4caf50"/>
                </linearGradient>
                <linearGradient id="sprout-soil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8d6e63"/>
                    <stop offset="100%" stop-color="#5d4037"/>
                </linearGradient>
            </defs>
            <ellipse cx="25" cy="43" rx="12" ry="4.5" fill="url(#sprout-soil)" opacity="0.5"/>
            <path d="M25 39 Q25 30 25 24" stroke="url(#sprout-stem)" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M25 27 Q18 22 14 24 Q17 20 25 24" fill="url(#sprout-leaf)"/>
            <path d="M25 27 Q32 22 36 24 Q33 20 25 24" fill="url(#sprout-leaf)"/>
            <path d="M25 27 L19 23" stroke="#388e3c" stroke-width="0.5" opacity="0.5"/>
            <path d="M25 27 L31 23" stroke="#388e3c" stroke-width="0.5" opacity="0.5"/>
            <circle cx="16" cy="22" r="1.2" fill="#b3e5fc" opacity="0.7"/>
        </svg>`,
        'seedling': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <defs>
                <linearGradient id="sdlg-stem" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#388e3c"/>
                    <stop offset="50%" stop-color="#4caf50"/>
                    <stop offset="100%" stop-color="#388e3c"/>
                </linearGradient>
                <linearGradient id="sdlg-leaf1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#81c784"/>
                    <stop offset="100%" stop-color="#43a047"/>
                </linearGradient>
                <linearGradient id="sdlg-leaf2" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#a5d6a7"/>
                    <stop offset="100%" stop-color="#66bb6a"/>
                </linearGradient>
                <linearGradient id="sdlg-soil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8d6e63"/>
                    <stop offset="100%" stop-color="#5d4037"/>
                </linearGradient>
            </defs>
            <ellipse cx="25" cy="44" rx="12" ry="4" fill="url(#sdlg-soil)" opacity="0.5"/>
            <path d="M25 42 Q25 30 25 17" stroke="url(#sdlg-stem)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
            <path d="M25 21 Q16 16 11 18 Q15 13 25 18" fill="url(#sdlg-leaf1)"/>
            <path d="M25 21 Q34 16 39 18 Q35 13 25 18" fill="url(#sdlg-leaf1)"/>
            <path d="M25 30 Q17 26 13 28 Q16 23 25 27" fill="url(#sdlg-leaf2)"/>
            <path d="M25 30 Q33 26 37 28 Q34 23 25 27" fill="url(#sdlg-leaf2)"/>
            <path d="M25 21 L17 16" stroke="#2e7d32" stroke-width="0.5" opacity="0.4"/>
            <path d="M25 21 L33 16" stroke="#2e7d32" stroke-width="0.5" opacity="0.4"/>
            <path d="M25 30 L18 26" stroke="#388e3c" stroke-width="0.5" opacity="0.4"/>
            <path d="M25 30 L32 26" stroke="#388e3c" stroke-width="0.5" opacity="0.4"/>
        </svg>`,
        'young': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <defs>
                <linearGradient id="yng-stem" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#33691e"/>
                    <stop offset="50%" stop-color="#558b2f"/>
                    <stop offset="100%" stop-color="#33691e"/>
                </linearGradient>
                <linearGradient id="yng-leaf-a" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#81c784"/>
                    <stop offset="100%" stop-color="#388e3c"/>
                </linearGradient>
                <linearGradient id="yng-leaf-b" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#a5d6a7"/>
                    <stop offset="100%" stop-color="#4caf50"/>
                </linearGradient>
                <linearGradient id="yng-leaf-c" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stop-color="#c8e6c9"/>
                    <stop offset="100%" stop-color="#66bb6a"/>
                </linearGradient>
            </defs>
            <ellipse cx="25" cy="45" rx="13" ry="4" fill="#8d6e63" opacity="0.35"/>
            <path d="M25 43 Q25 30 25 12" stroke="url(#yng-stem)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
            <path d="M25 16 Q14 10 9 13 Q13 7 25 13" fill="url(#yng-leaf-a)"/>
            <path d="M25 16 Q36 10 41 13 Q37 7 25 13" fill="url(#yng-leaf-a)"/>
            <path d="M25 24 Q15 19 10 22 Q14 16 25 21" fill="url(#yng-leaf-b)"/>
            <path d="M25 24 Q35 19 40 22 Q36 16 25 21" fill="url(#yng-leaf-b)"/>
            <path d="M25 33 Q17 29 12 31 Q16 26 25 30" fill="url(#yng-leaf-c)"/>
            <path d="M25 33 Q33 29 38 31 Q34 26 25 30" fill="url(#yng-leaf-c)"/>
            <path d="M25 16 L16 11" stroke="#2e7d32" stroke-width="0.5" opacity="0.35"/>
            <path d="M25 16 L34 11" stroke="#2e7d32" stroke-width="0.5" opacity="0.35"/>
            <path d="M25 24 L16 19" stroke="#2e7d32" stroke-width="0.5" opacity="0.35"/>
            <path d="M25 24 L34 19" stroke="#2e7d32" stroke-width="0.5" opacity="0.35"/>
        </svg>`,
        'small-tree': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <defs>
                <linearGradient id="st-trunk" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#5d4037"/>
                    <stop offset="30%" stop-color="#795548"/>
                    <stop offset="70%" stop-color="#6d4c41"/>
                    <stop offset="100%" stop-color="#4e342e"/>
                </linearGradient>
                <radialGradient id="st-canopy1" cx="0.5" cy="0.6" r="0.55">
                    <stop offset="0%" stop-color="#43a047"/>
                    <stop offset="100%" stop-color="#2e7d32"/>
                </radialGradient>
                <radialGradient id="st-canopy2" cx="0.4" cy="0.4" r="0.5">
                    <stop offset="0%" stop-color="#66bb6a"/>
                    <stop offset="100%" stop-color="#388e3c"/>
                </radialGradient>
                <radialGradient id="st-canopy3" cx="0.5" cy="0.3" r="0.5">
                    <stop offset="0%" stop-color="#81c784"/>
                    <stop offset="100%" stop-color="#4caf50"/>
                </radialGradient>
            </defs>
            <ellipse cx="25" cy="45" rx="15" ry="4" fill="#6d4c41" opacity="0.25"/>
            <rect x="21" y="24" width="8" height="20" rx="3" fill="url(#st-trunk)"/>
            <path d="M22 30 L22 38" stroke="#4e342e" stroke-width="0.6" opacity="0.3"/>
            <path d="M26 28 L26 40" stroke="#4e342e" stroke-width="0.6" opacity="0.3"/>
            <ellipse cx="25" cy="20" rx="18" ry="14" fill="url(#st-canopy1)"/>
            <ellipse cx="17" cy="16" rx="9" ry="8" fill="url(#st-canopy2)"/>
            <ellipse cx="33" cy="16" rx="9" ry="8" fill="url(#st-canopy2)"/>
            <ellipse cx="25" cy="11" rx="10" ry="8" fill="url(#st-canopy3)"/>
            <ellipse cx="20" cy="10" rx="3" ry="2" fill="white" opacity="0.1"/>
        </svg>`,
        'big-tree': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <defs>
                <linearGradient id="bt-trunk" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#4e342e"/>
                    <stop offset="25%" stop-color="#6d4c41"/>
                    <stop offset="75%" stop-color="#5d4037"/>
                    <stop offset="100%" stop-color="#3e2723"/>
                </linearGradient>
                <radialGradient id="bt-canopy1" cx="0.5" cy="0.6" r="0.55">
                    <stop offset="0%" stop-color="#388e3c"/>
                    <stop offset="100%" stop-color="#1b5e20"/>
                </radialGradient>
                <radialGradient id="bt-canopy2" cx="0.4" cy="0.4" r="0.5">
                    <stop offset="0%" stop-color="#4caf50"/>
                    <stop offset="100%" stop-color="#2e7d32"/>
                </radialGradient>
                <radialGradient id="bt-canopy3" cx="0.5" cy="0.3" r="0.5">
                    <stop offset="0%" stop-color="#66bb6a"/>
                    <stop offset="100%" stop-color="#388e3c"/>
                </radialGradient>
                <radialGradient id="bt-highlight" cx="0.3" cy="0.25" r="0.4">
                    <stop offset="0%" stop-color="white" stop-opacity="0.12"/>
                    <stop offset="100%" stop-color="white" stop-opacity="0"/>
                </radialGradient>
            </defs>
            <ellipse cx="25" cy="46" rx="17" ry="4" fill="#5d4037" opacity="0.25"/>
            <rect x="19" y="25" width="12" height="20" rx="4" fill="url(#bt-trunk)"/>
            <path d="M21 28 L21 40" stroke="#3e2723" stroke-width="0.7" opacity="0.3"/>
            <path d="M25 26 L25 42" stroke="#3e2723" stroke-width="0.7" opacity="0.25"/>
            <path d="M28 30 L28 38" stroke="#3e2723" stroke-width="0.7" opacity="0.3"/>
            <path d="M19 35 Q14 37 12 40" stroke="#5d4037" stroke-width="1.5" fill="none" opacity="0.4" stroke-linecap="round"/>
            <path d="M31 35 Q36 37 38 40" stroke="#5d4037" stroke-width="1.5" fill="none" opacity="0.4" stroke-linecap="round"/>
            <ellipse cx="25" cy="19" rx="21" ry="17" fill="url(#bt-canopy1)"/>
            <ellipse cx="14" cy="15" rx="10" ry="9" fill="url(#bt-canopy2)"/>
            <ellipse cx="36" cy="15" rx="10" ry="9" fill="url(#bt-canopy2)"/>
            <ellipse cx="25" cy="9" rx="13" ry="10" fill="url(#bt-canopy3)"/>
            <ellipse cx="25" cy="14" rx="20" ry="14" fill="url(#bt-highlight)"/>
        </svg>`,
        'flowering': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <defs>
                <linearGradient id="fl-trunk" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#4e342e"/>
                    <stop offset="25%" stop-color="#6d4c41"/>
                    <stop offset="75%" stop-color="#5d4037"/>
                    <stop offset="100%" stop-color="#3e2723"/>
                </linearGradient>
                <radialGradient id="fl-canopy1" cx="0.5" cy="0.6" r="0.55">
                    <stop offset="0%" stop-color="#388e3c"/>
                    <stop offset="100%" stop-color="#1b5e20"/>
                </radialGradient>
                <radialGradient id="fl-canopy2" cx="0.4" cy="0.4" r="0.5">
                    <stop offset="0%" stop-color="#4caf50"/>
                    <stop offset="100%" stop-color="#2e7d32"/>
                </radialGradient>
                <radialGradient id="fl-canopy3" cx="0.5" cy="0.3" r="0.5">
                    <stop offset="0%" stop-color="#66bb6a"/>
                    <stop offset="100%" stop-color="#388e3c"/>
                </radialGradient>
                <radialGradient id="fl-flower" cx="0.4" cy="0.35" r="0.5">
                    <stop offset="0%" stop-color="#f8bbd0"/>
                    <stop offset="100%" stop-color="#e91e63"/>
                </radialGradient>
            </defs>
            <ellipse cx="25" cy="46" rx="17" ry="4" fill="#5d4037" opacity="0.25"/>
            <rect x="19" y="25" width="12" height="20" rx="4" fill="url(#fl-trunk)"/>
            <path d="M21 28 L21 40" stroke="#3e2723" stroke-width="0.7" opacity="0.3"/>
            <path d="M25 26 L25 42" stroke="#3e2723" stroke-width="0.7" opacity="0.25"/>
            <path d="M19 35 Q14 37 12 40" stroke="#5d4037" stroke-width="1.5" fill="none" opacity="0.4" stroke-linecap="round"/>
            <path d="M31 35 Q36 37 38 40" stroke="#5d4037" stroke-width="1.5" fill="none" opacity="0.4" stroke-linecap="round"/>
            <ellipse cx="25" cy="19" rx="21" ry="17" fill="url(#fl-canopy1)"/>
            <ellipse cx="14" cy="15" rx="10" ry="9" fill="url(#fl-canopy2)"/>
            <ellipse cx="36" cy="15" rx="10" ry="9" fill="url(#fl-canopy2)"/>
            <ellipse cx="25" cy="9" rx="13" ry="10" fill="url(#fl-canopy3)"/>
            <g>
                <circle cx="11" cy="13" r="3.5" fill="url(#fl-flower)" opacity="0.9"/>
                <circle cx="11" cy="13" r="2.5" fill="#f48fb1" opacity="0.5"/>
                <circle cx="11" cy="13" r="1" fill="#fff176"/>
            </g>
            <g>
                <circle cx="38" cy="11" r="3" fill="url(#fl-flower)" opacity="0.9"/>
                <circle cx="38" cy="11" r="2" fill="#f48fb1" opacity="0.5"/>
                <circle cx="38" cy="11" r="0.9" fill="#fff176"/>
            </g>
            <g>
                <circle cx="25" cy="4" r="3.2" fill="url(#fl-flower)" opacity="0.9"/>
                <circle cx="25" cy="4" r="2.2" fill="#f48fb1" opacity="0.5"/>
                <circle cx="25" cy="4" r="1" fill="#fff176"/>
            </g>
            <g>
                <circle cx="18" cy="22" r="2.8" fill="url(#fl-flower)" opacity="0.85"/>
                <circle cx="18" cy="22" r="1.8" fill="#f48fb1" opacity="0.5"/>
                <circle cx="18" cy="22" r="0.8" fill="#fff176"/>
            </g>
            <g>
                <circle cx="33" cy="20" r="3" fill="url(#fl-flower)" opacity="0.85"/>
                <circle cx="33" cy="20" r="2" fill="#f48fb1" opacity="0.5"/>
                <circle cx="33" cy="20" r="0.9" fill="#fff176"/>
            </g>
            <circle cx="8" cy="38" r="1.5" fill="#f8bbd0" opacity="0.5"/>
            <circle cx="42" cy="35" r="1.2" fill="#f8bbd0" opacity="0.4"/>
        </svg>`
    };
    return svgs[stage] || svgs['seed'];
}

function getPlantStage(fraction) {
    let stage = 'seed';
    for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
        if (fraction >= PLANT_STAGES[i].threshold) {
            stage = PLANT_STAGES[i].name;
            break;
        }
    }
    return stage;
}

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Load all completions for a child in a given module from Firestore.
 * @param {string} childId
 * @param {string} module - 'math' or 'english'
 * @returns {Promise<Array>} Array of completion objects
 */
async function getCompletionsForModule(childId, module) {
    if (!childId) return [];

    try {
        const snapshot = await firebase.firestore().collection('completions')
            .where('childId', '==', childId)
            .where('module', '==', module)
            .get();

        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error loading completions for module:', error);
        return [];
    }
}

/**
 * Load progress data for the progress map.
 */
async function loadProgressData(module, subtype) {
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    const isAdmin = window.currentUserRole === 'admin';
    const config = PROGRESS_CONFIG[module];
    if (!config) return null;

    // Assessment data
    let assessmentDone = false;
    let assessmentLevel = null;
    let assessmentScore = null;
    const assessmentSubject = config.assessmentPerSubtype ? subtype : module;

    if (child) {
        assessmentDone = typeof hasCompletedAssessment === 'function'
            ? await hasCompletedAssessment(child.id, assessmentSubject) : false;
        assessmentLevel = typeof getAssignedLevel === 'function'
            ? await getAssignedLevel(child.id, assessmentSubject) : null;
        if (assessmentDone) {
            const data = typeof getAssessmentData === 'function'
                ? await getAssessmentData(child.id) : null;
            if (data && data.assessments && data.assessments[assessmentSubject]) {
                assessmentScore = data.assessments[assessmentSubject].score;
            }
        }
    } else if (isAdmin) {
        assessmentDone = true;
        assessmentLevel = 11;
        assessmentScore = 100;
    }

    // Completions
    let completions = [];
    if (child) {
        completions = await getCompletionsForModule(child.id, module);
    }

    // Filter completions for this subtype (math: by operation in identifier; english: by difficulty)
    const subtypeCompletions = completions.filter(c => {
        if (!c.identifier) return false;
        if (module === 'math') {
            return c.identifier.startsWith(subtype + '-') || c.identifier.includes(subtype);
        }
        // English: identifiers contain the difficulty or 'writing'
        return c.identifier.includes(subtype);
    });

    // Weekly assignment data
    let weeklyDone = 0;
    let weeklyTotal = 7;
    let accessiblePages = [];
    let accessMode = 'admin';

    if (child && typeof getAccessiblePages === 'function') {
        const access = await getAccessiblePages(child.id, module);
        accessiblePages = access.pages || [];
        accessMode = access.mode || 'full';
        if (!access.pending && access.assignment) {
            const modAssignment = module === 'math'
                ? access.assignment.math : access.assignment.english;
            if (modAssignment) {
                weeklyTotal = modAssignment.totalPages || modAssignment.pages.length;
                weeklyDone = modAssignment.completedCount || 0;
            }
        }
    } else if (isAdmin) {
        accessiblePages = [];
        for (let i = 1; i <= config.totalPages; i++) accessiblePages.push(i);
        accessMode = 'admin';
    }

    // Stats
    const stats = calculateStats(subtypeCompletions);
    const streak = calculateStreak(completions);

    return {
        module, subtype, config,
        assessmentDone, assessmentLevel, assessmentScore,
        completions: subtypeCompletions,
        weeklyDone, weeklyTotal,
        accessiblePages, accessMode,
        stats, streak,
        isAdmin, child
    };
}

/**
 * Calculate stats from completions.
 */
function calculateStats(completions) {
    const completed = completions.filter(c => c.completed);
    const totalProblems = completions.reduce((sum, c) => sum + (c.totalProblems || 0), 0);
    const totalCorrect = completions.reduce((sum, c) => sum + (c.correctCount || 0), 0);
    const accuracy = totalProblems > 0 ? Math.round((totalCorrect / totalProblems) * 100) : 0;

    // Stars: 3 stars for 95%+, 2 stars for 85%+, 1 star for completion
    let totalStars = 0;
    completed.forEach(c => {
        const score = c.score || 0;
        if (score >= 95) totalStars += 3;
        else if (score >= 85) totalStars += 2;
        else totalStars += 1;
    });

    return { totalStars, totalProblems, accuracy, completedPages: completed.length };
}

/**
 * Calculate streak (consecutive practice days from today, looking backward).
 */
function calculateStreak(completions) {
    if (completions.length === 0) return 0;

    // Get unique dates (YYYY-MM-DD) of completions
    const dates = new Set();
    completions.forEach(c => {
        if (c.timestamp) {
            let d;
            if (c.timestamp.toDate) {
                d = c.timestamp.toDate();
            } else if (c.timestamp.seconds) {
                d = new Date(c.timestamp.seconds * 1000);
            } else {
                d = new Date(c.timestamp);
            }
            if (!isNaN(d.getTime())) {
                dates.add(d.toISOString().split('T')[0]);
            }
        }
    });

    if (dates.size === 0) return 0;

    // Count backward from today
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dates.has(dateStr)) {
            streak++;
        } else if (i > 0) {
            break; // Allow today to be missing (haven't practiced yet today)
        }
    }

    return streak;
}

// ============================================================================
// NODE TREE BUILDER
// ============================================================================

/**
 * Build the node tree for the progress path.
 */
function buildNodeTree(data) {
    const { config, accessMode, accessiblePages, completions, assessmentDone } = data;
    const isDemo = accessMode === 'demo';
    const isAdmin = accessMode === 'admin';
    const groupSize = isDemo ? config.demoGroupSize : config.groupSize;
    const totalPages = config.totalPages;

    const nodes = [];

    // Assessment node
    nodes.push({
        type: 'assessment',
        state: assessmentDone ? 'completed' : 'current',
        title: 'Assessment',
        subtitle: assessmentDone
            ? `Level ${data.assessmentLevel || '?'} — ${data.assessmentScore || 0}%`
            : 'Take your assessment',
        score: data.assessmentScore || 0
    });

    if (!assessmentDone && !isAdmin) {
        // Only show assessment node if not done — everything else locked
        const lockedNode = {
            type: 'group',
            state: 'locked',
            difficulty: 'easy',
            title: 'Pages 1–' + groupSize,
            subtitle: 'Complete assessment first',
            startPage: 1,
            endPage: groupSize,
            score: 0,
            pagesCompleted: 0,
            pagesTotal: groupSize
        };
        nodes.push(lockedNode);
        return nodes;
    }

    // Build page group nodes for each difficulty
    const difficulties = [
        { name: 'easy', offset: 0 },
        { name: 'medium', offset: 50 },
        { name: 'hard', offset: 100 }
    ];

    // For English, pages are 1-50 in a single difficulty (the subtype IS the difficulty)
    const isEnglishSubtype = data.module === 'english';

    let foundCurrent = false;

    if (isEnglishSubtype) {
        // English: single range 1-50
        const maxPages = config.totalPages;
        for (let start = 1; start <= maxPages; start += groupSize) {
            const end = Math.min(start + groupSize - 1, maxPages);
            const node = buildGroupNode(data, start, end, null, accessiblePages, completions, isAdmin, isDemo, foundCurrent);
            nodes.push(node);
            if (node.state === 'current') foundCurrent = true;
        }
    } else {
        // Math: 3 difficulty sections (easy 1-50, medium 51-100, hard 101-150)
        for (const diff of difficulties) {
            // Section header
            nodes.push({ type: 'section', difficulty: diff.name, title: diff.name.charAt(0).toUpperCase() + diff.name.slice(1) });

            for (let rel = 1; rel <= 50; rel += groupSize) {
                const relEnd = Math.min(rel + groupSize - 1, 50);
                const absStart = diff.offset + rel;
                const absEnd = diff.offset + relEnd;
                const node = buildGroupNode(data, absStart, absEnd, diff.name, accessiblePages, completions, isAdmin, isDemo, foundCurrent);
                nodes.push(node);
                if (node.state === 'current') foundCurrent = true;
            }
        }
    }

    // Demo: add upgrade prompt after first accessible group
    if (isDemo) {
        // Find index of last non-locked group node
        let lastAccessibleIdx = -1;
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].type === 'group' && nodes[i].state !== 'locked') {
                lastAccessibleIdx = i;
                break;
            }
        }
        if (lastAccessibleIdx >= 0 && lastAccessibleIdx < nodes.length - 1) {
            nodes.splice(lastAccessibleIdx + 1, 0, { type: 'upgrade' });
            // Remove subsequent locked nodes to keep it clean in demo
            const removeFrom = lastAccessibleIdx + 2;
            nodes.splice(removeFrom);
        }
    }

    return nodes;
}

/**
 * Build a single page-group node.
 */
function buildGroupNode(data, absStart, absEnd, difficulty, accessiblePages, completions, isAdmin, isDemo, foundCurrent) {
    const pagesInGroup = [];
    for (let p = absStart; p <= absEnd; p++) pagesInGroup.push(p);

    // Count completed pages in this group
    let pagesCompleted = 0;
    let totalScore = 0;
    pagesInGroup.forEach(page => {
        const comp = findCompletionForPage(data, page, completions);
        if (comp && comp.completed) {
            pagesCompleted++;
            totalScore += (comp.score || 0);
        }
    });

    const pagesTotal = pagesInGroup.length;
    const avgScore = pagesCompleted > 0 ? Math.round(totalScore / pagesCompleted) : 0;
    const allCompleted = pagesCompleted >= pagesTotal;

    // Determine state
    let state;
    if (isAdmin) {
        state = allCompleted ? 'completed' : 'current';
    } else if (allCompleted) {
        state = 'completed';
    } else if (!foundCurrent && hasAnyAccessiblePage(pagesInGroup, accessiblePages)) {
        state = 'current';
    } else {
        state = 'locked';
    }

    // Stars for completed: 3 if avg >= 95, 2 if >= 85, 1 otherwise
    let stars = 0;
    if (allCompleted) {
        if (avgScore >= 95) stars = 3;
        else if (avgScore >= 85) stars = 2;
        else stars = 1;
    }

    // Determine plant growth stage based on position in total
    const fraction = absEnd / (data.config.totalPages || 150);
    const plantStage = getPlantStage(fraction);

    return {
        type: 'group',
        state,
        difficulty: difficulty || data.subtype,
        title: `Pages ${absStart}–${absEnd}`,
        subtitle: allCompleted
            ? `${avgScore}%`
            : state === 'current'
                ? `${pagesCompleted}/${pagesTotal} done`
                : '',
        startPage: absStart,
        endPage: absEnd,
        score: avgScore,
        stars,
        pagesCompleted,
        pagesTotal,
        plantStage
    };
}

/**
 * Find a completion record matching a given absolute page.
 */
function findCompletionForPage(data, absolutePage, completions) {
    // Completion identifiers are like "addition-level5-page3" or "writing-page1"
    // We need to match by page number
    for (const c of completions) {
        if (!c.identifier) continue;
        // Extract page number from identifier
        const match = c.identifier.match(/page(\d+)/);
        if (match) {
            const pageNum = parseInt(match[1], 10);
            // For math, page numbers in identifiers are relative to difficulty
            // absolutePage 1-50 = easy, 51-100 = medium, 101-150 = hard
            if (data.module === 'math') {
                // Identifier might be like "addition-easy-page5" or "addition-level1-page5"
                // We check if the identifier contains the difficulty hint
                let identDifficulty = null;
                if (c.identifier.includes('-easy-')) identDifficulty = 'easy';
                else if (c.identifier.includes('-medium-')) identDifficulty = 'medium';
                else if (c.identifier.includes('-hard-')) identDifficulty = 'hard';

                let identAbsPage = pageNum;
                if (identDifficulty === 'medium') identAbsPage = pageNum + 50;
                else if (identDifficulty === 'hard') identAbsPage = pageNum + 100;

                if (identAbsPage === absolutePage) return c;
            } else {
                if (pageNum === absolutePage) return c;
            }
        }
    }
    return null;
}

/**
 * Check if any page in a group is accessible.
 */
function hasAnyAccessiblePage(pages, accessiblePages) {
    if (!accessiblePages || accessiblePages.length === 0) return false;
    return pages.some(p => accessiblePages.includes(p));
}

// ============================================================================
// RENDERING
// ============================================================================

/**
 * Main entry point — show the progress map.
 */
async function showProgressMap(module, subtype) {
    console.log('showProgressMap:', module, subtype);

    // Hide other sections
    const subjectSelection = document.querySelector('.subject-selection');
    const operations = document.getElementById('math-operations');
    const typeSelection = document.getElementById('type-selection');

    if (subjectSelection) subjectSelection.style.display = 'none';
    if (operations) operations.style.display = 'none';
    if (typeSelection) typeSelection.style.display = 'none';

    // Hide greeting banner — only shown on home/subject selection
    const greetingBanner = document.getElementById('greeting-banner');
    if (greetingBanner) greetingBanner.style.display = 'none';

    // Show container
    const container = document.getElementById('progress-map-container');
    if (!container) {
        console.error('progress-map-container not found');
        return;
    }
    container.style.display = 'block';
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">Loading your progress...</div>';

    // Load data
    const data = await loadProgressData(module, subtype);
    if (!data) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;">Error loading progress data.</div>';
        return;
    }

    // Build node tree
    const nodes = buildNodeTree(data);

    // Render
    renderProgressMap(container, data, nodes);
}

/**
 * Render the full progress map into the container.
 */
function renderProgressMap(container, data, nodes) {
    const { module, subtype, config, stats, streak } = data;

    let html = '';

    // Back button — goes directly to subject selection (no intermediate operations page)
    html += '<div class="pm-back-row">';
    html += '<button class="back-btn-icon" onclick="hideProgressMap(\'' + module + '\')" title="Back to Subjects"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg></button>';
    html += '</div>';

    // Tabs
    html += renderTabs(module, subtype, config);

    // Stats bar
    html += renderStatsBar(stats, streak);

    // Weekly ring
    html += renderWeeklyRing(data.weeklyDone, data.weeklyTotal);

    // Path
    html += '<div class="pm-path">';
    nodes.forEach((node, idx) => {
        if (node.type === 'section') {
            html += `<div class="pm-section-header">${escapeHtml(node.title)}</div>`;
        } else if (node.type === 'upgrade') {
            html += renderUpgradePrompt();
        } else if (node.type === 'assessment') {
            html += renderAssessmentNode(node, module, subtype, data);
        } else if (node.type === 'group') {
            html += renderGroupNode(node, module, subtype, idx);
        }
    });
    html += '</div>';

    container.innerHTML = html;
}

/**
 * Render tabs for switching between subtypes.
 */
function renderTabs(module, activeSubtype, config) {
    var gi = typeof GleeIcons !== 'undefined' ? GleeIcons : null;
    let html = '<div class="pm-tabs">';
    config.subtypes.forEach(st => {
        const isActive = st === activeSubtype;
        const label = config.labels[st] || st;
        const iconKey = config.iconKeys && config.iconKeys[st];
        const iconHtml = (gi && iconKey) ? gi.get(iconKey, 16, isActive ? 'white' : 'var(--color-primary)') + ' ' : '';
        html += `<button class="pm-tab${isActive ? ' active' : ''}" onclick="switchProgressTab('${module}','${st}')">${iconHtml}${label}</button>`;
    });
    html += '</div>';
    return html;
}

/**
 * Render the 4-stat cards.
 */
function renderStatsBar(stats, streak) {
    var gi = typeof GleeIcons !== 'undefined' ? GleeIcons : null;
    return `<div class="pm-stats">
        <div class="pm-stat-card">
            <span class="pm-stat-icon">${gi ? gi.get('fire', 20, 'var(--color-warning)') : '&#x1F525;'}</span>
            <span class="pm-stat-value">${streak}</span>
            <span class="pm-stat-label">day streak</span>
        </div>
        <div class="pm-stat-card">
            <span class="pm-stat-icon">${gi ? gi.get('star', 20, '#fbbf24') : '&#x2B50;'}</span>
            <span class="pm-stat-value">${stats.totalStars}</span>
            <span class="pm-stat-label">stars</span>
        </div>
        <div class="pm-stat-card">
            <span class="pm-stat-icon">${gi ? gi.get('chart', 20, 'var(--color-primary)') : '&#x1F4DD;'}</span>
            <span class="pm-stat-value">${stats.totalProblems}</span>
            <span class="pm-stat-label">solved</span>
        </div>
        <div class="pm-stat-card">
            <span class="pm-stat-icon">${gi ? gi.get('target', 20, 'var(--color-success)') : '&#x1F3AF;'}</span>
            <span class="pm-stat-value">${stats.accuracy}%</span>
            <span class="pm-stat-label">accuracy</span>
        </div>
    </div>`;
}

/**
 * Render the weekly progress ring.
 */
function renderWeeklyRing(done, total) {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const fraction = total > 0 ? done / total : 0;
    const dashoffset = circumference * (1 - fraction);

    return `<div class="pm-weekly">
        <span class="pm-weekly-label">This Week</span>
        <div class="pm-weekly-ring">
            <svg viewBox="0 0 56 56">
                <defs>
                    <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="var(--color-primary, #667eea)"/>
                        <stop offset="100%" stop-color="var(--color-success, #4caf50)"/>
                    </linearGradient>
                </defs>
                <circle class="pm-ring-bg" cx="28" cy="28" r="${radius}"/>
                <circle class="pm-ring-fill" cx="28" cy="28" r="${radius}"
                    stroke="url(#ring-grad)"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${dashoffset}"/>
            </svg>
            <span class="pm-weekly-count">${done}/${total}</span>
        </div>
        <span class="pm-weekly-text">pages completed</span>
    </div>`;
}

/**
 * Render the assessment node.
 */
function renderAssessmentNode(node, module, subtype, data) {
    const stateClass = node.state === 'completed' ? 'completed' : 'current';
    const clickHandler = node.state === 'completed'
        ? '' // Completed assessments don't navigate
        : `onclick="handleAssessmentClick('${module}','${subtype}')"`;

    var gi = typeof GleeIcons !== 'undefined' ? GleeIcons : null;
    const icon = node.state === 'completed'
        ? getPlantSVG('seed', 44)
        : (gi ? gi.circled('clipboard', 44, 'var(--color-primary-10)', 'var(--color-primary)') : '<svg width="44" height="44" viewBox="0 0 50 50"><circle cx="25" cy="25" r="18" fill="var(--color-primary)" opacity="0.2"/><text x="25" y="32" text-anchor="middle" font-size="22" fill="var(--color-primary)">&#x1F4CB;</text></svg>');

    return `<div class="pm-node assessment ${stateClass}" ${clickHandler}>
        <div class="pm-node-icon">${icon}</div>
        <div class="pm-node-info">
            <div class="pm-node-title">${escapeHtml(node.title)}</div>
            <div class="pm-node-subtitle">${escapeHtml(node.subtitle)}</div>
        </div>
        ${node.state === 'completed' ? '<div class="pm-node-stars">' + (gi ? gi.get('check', 20, 'var(--color-success)') : '&#x2705;') + '</div>' : ''}
    </div>`;
}

/**
 * Render a page-group node.
 */
function renderGroupNode(node, module, subtype, idx) {
    const stateClass = node.state;
    const plantSVG = getPlantSVG(node.plantStage || 'seed', 44);

    let clickHandler = '';
    if (node.state === 'completed' || node.state === 'current') {
        clickHandler = `onclick="handleNodeClick('${module}','${subtype}',${node.startPage},'${node.state}')"`;
    } else if (node.state === 'locked') {
        clickHandler = `onclick="showLockedToast()"`;
    }

    var gi2 = typeof GleeIcons !== 'undefined' ? GleeIcons : null;
    let rightContent = '';
    if (node.state === 'completed' && node.stars > 0) {
        var starIcon = gi2 ? gi2.get('star', 16, '#fbbf24', {fill: '#fbbf24', strokeWidth: '0'}) : '&#x2B50;';
        rightContent = `<div class="pm-node-stars">${starIcon.repeat(node.stars)}</div>`;
    } else if (node.state === 'locked') {
        rightContent = '<div class="pm-node-lock">' + (gi2 ? gi2.get('lock', 18, '#999') : '&#x1F512;') + '</div>';
    }

    return `<div class="pm-node ${stateClass}" ${clickHandler}>
        <div class="pm-node-icon">${plantSVG}</div>
        <div class="pm-node-info">
            <div class="pm-node-title">${escapeHtml(node.title)}</div>
            <div class="pm-node-subtitle">${escapeHtml(node.subtitle)}</div>
        </div>
        ${rightContent}
    </div>`;
}

/**
 * Render the demo upgrade prompt.
 */
function renderUpgradePrompt() {
    return `<div class="pm-upgrade-prompt">
        <p>Unlock all pages with the Full Version!</p>
        <button class="pm-upgrade-btn" onclick="window.location.href='settings'">Upgrade Now</button>
    </div>`;
}

// ============================================================================
// INTERACTION
// ============================================================================

/**
 * Handle click on a page-group node.
 */
function handleNodeClick(module, subtype, startPage, state) {
    console.log('handleNodeClick:', module, subtype, startPage, state);

    // Hide progress map
    const container = document.getElementById('progress-map-container');
    if (container) container.style.display = 'none';

    if (module === 'math') {
        // Call the existing loadOperationWorksheet which handles assessment + access
        if (typeof loadOperationWorksheet === 'function') {
            loadOperationWorksheet(subtype);
        }
    } else if (module === 'english') {
        // Call the existing English worksheet loader
        if (typeof loadWorksheetNew === 'function') {
            loadWorksheetNew(subtype);
        }
    }
}

/**
 * Handle click on assessment node.
 */
function handleAssessmentClick(module, subtype) {
    const container = document.getElementById('progress-map-container');
    if (container) container.style.display = 'none';

    if (module === 'math') {
        if (typeof showAssessmentGate === 'function') {
            showAssessmentGate(subtype);
        }
    } else if (module === 'english') {
        const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
        if (child && typeof showEnglishAssessmentGate === 'function') {
            showEnglishAssessmentGate(child);
        }
    }
}

/**
 * Switch between tabs (operations / types).
 */
function switchProgressTab(module, subtype) {
    showProgressMap(module, subtype);
}

/**
 * Hide progress map, return to subject selection.
 */
function hideProgressMap(module) {
    const container = document.getElementById('progress-map-container');
    if (container) container.style.display = 'none';

    // Return to subject selection for both Math and English
    if (typeof showSubjects === 'function') {
        showSubjects();
    } else {
        // Fallback: show subject selection directly
        const subjectSelection = document.querySelector('.subject-selection');
        if (subjectSelection) subjectSelection.style.display = 'block';
    }
}

/**
 * Show a toast notification for locked nodes.
 */
function showLockedToast(msg) {
    msg = msg || 'Complete current pages first!';

    // Remove existing toast
    let toast = document.querySelector('.pm-toast');
    if (toast) toast.remove();

    toast = document.createElement('div');
    toast.className = 'pm-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    // Trigger show
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto-hide after 2.5s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

console.log('Progress map loaded');
