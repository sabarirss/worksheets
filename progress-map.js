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
            addition: '➕ Addition',
            subtraction: '➖ Subtraction',
            multiplication: '✖️ Multiplication',
            division: '➗ Division'
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
            writing: '✏️ Writing',
            easy: '📝 Vocab Easy',
            medium: '📝 Vocab Medium',
            hard: '📝 Vocab Hard'
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
            <ellipse cx="25" cy="30" rx="12" ry="10" fill="#8B6914"/>
            <text x="25" y="35" text-anchor="middle" font-size="14" fill="white" font-weight="bold">?</text>
            <path d="M25 20 Q25 12 20 8" stroke="#4caf50" stroke-width="2" fill="none"/>
        </svg>`,
        'sprout': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <rect x="23" y="25" width="4" height="18" rx="2" fill="#66bb6a"/>
            <ellipse cx="19" cy="26" rx="7" ry="4" fill="#81c784" transform="rotate(-30 19 26)"/>
            <ellipse cx="31" cy="26" rx="7" ry="4" fill="#81c784" transform="rotate(30 31 26)"/>
            <ellipse cx="25" cy="44" rx="10" ry="4" fill="#8d6e63" opacity="0.3"/>
        </svg>`,
        'seedling': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <rect x="23" y="18" width="4" height="25" rx="2" fill="#43a047"/>
            <ellipse cx="16" cy="22" rx="8" ry="4" fill="#66bb6a" transform="rotate(-35 16 22)"/>
            <ellipse cx="34" cy="22" rx="8" ry="4" fill="#66bb6a" transform="rotate(35 34 22)"/>
            <ellipse cx="17" cy="30" rx="7" ry="3.5" fill="#81c784" transform="rotate(-25 17 30)"/>
            <ellipse cx="33" cy="30" rx="7" ry="3.5" fill="#81c784" transform="rotate(25 33 30)"/>
            <ellipse cx="25" cy="44" rx="10" ry="4" fill="#8d6e63" opacity="0.3"/>
        </svg>`,
        'young': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <rect x="22" y="14" width="6" height="28" rx="3" fill="#388e3c"/>
            <ellipse cx="14" cy="18" rx="9" ry="4.5" fill="#4caf50" transform="rotate(-40 14 18)"/>
            <ellipse cx="36" cy="18" rx="9" ry="4.5" fill="#4caf50" transform="rotate(40 36 18)"/>
            <ellipse cx="13" cy="26" rx="8" ry="4" fill="#66bb6a" transform="rotate(-30 13 26)"/>
            <ellipse cx="37" cy="26" rx="8" ry="4" fill="#66bb6a" transform="rotate(30 37 26)"/>
            <ellipse cx="15" cy="34" rx="7" ry="3.5" fill="#81c784" transform="rotate(-20 15 34)"/>
            <ellipse cx="35" cy="34" rx="7" ry="3.5" fill="#81c784" transform="rotate(20 35 34)"/>
            <ellipse cx="25" cy="44" rx="12" ry="4" fill="#8d6e63" opacity="0.3"/>
        </svg>`,
        'small-tree': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <rect x="21" y="22" width="8" height="22" rx="3" fill="#5d4037"/>
            <ellipse cx="25" cy="18" rx="18" ry="14" fill="#388e3c"/>
            <ellipse cx="18" cy="15" rx="8" ry="7" fill="#43a047"/>
            <ellipse cx="32" cy="15" rx="8" ry="7" fill="#43a047"/>
            <ellipse cx="25" cy="10" rx="10" ry="8" fill="#4caf50"/>
            <ellipse cx="25" cy="45" rx="14" ry="4" fill="#8d6e63" opacity="0.3"/>
        </svg>`,
        'big-tree': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <rect x="20" y="24" width="10" height="20" rx="4" fill="#4e342e"/>
            <ellipse cx="25" cy="18" rx="20" ry="16" fill="#2e7d32"/>
            <ellipse cx="16" cy="14" rx="10" ry="8" fill="#388e3c"/>
            <ellipse cx="34" cy="14" rx="10" ry="8" fill="#388e3c"/>
            <ellipse cx="25" cy="8" rx="12" ry="9" fill="#43a047"/>
            <ellipse cx="25" cy="45" rx="16" ry="4" fill="#8d6e63" opacity="0.3"/>
        </svg>`,
        'flowering': `<svg width="${size}" height="${size}" viewBox="0 0 50 50">
            <rect x="20" y="24" width="10" height="20" rx="4" fill="#4e342e"/>
            <ellipse cx="25" cy="18" rx="20" ry="16" fill="#2e7d32"/>
            <ellipse cx="16" cy="14" rx="10" ry="8" fill="#388e3c"/>
            <ellipse cx="34" cy="14" rx="10" ry="8" fill="#388e3c"/>
            <ellipse cx="25" cy="8" rx="12" ry="9" fill="#43a047"/>
            <circle cx="12" cy="12" r="4" fill="#f48fb1"/>
            <circle cx="38" cy="10" r="3.5" fill="#ff80ab"/>
            <circle cx="25" cy="4" r="3" fill="#f06292"/>
            <circle cx="18" cy="22" r="3" fill="#ff80ab"/>
            <circle cx="33" cy="20" r="3.5" fill="#f48fb1"/>
            <circle cx="12" cy="12" r="1.5" fill="#fff176"/>
            <circle cx="38" cy="10" r="1.2" fill="#fff176"/>
            <circle cx="25" cy="4" r="1.2" fill="#fff176"/>
            <ellipse cx="25" cy="45" rx="16" ry="4" fill="#8d6e63" opacity="0.3"/>
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

    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) return [];

    try {
        const childEmail = child.email;
        if (!childEmail) return [];

        const snapshot = await firebase.firestore().collection('completions')
            .where('childEmail', '==', childEmail)
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
            if (modAssignment && modAssignment.pages) {
                weeklyTotal = modAssignment.pages.length;
                weeklyDone = modAssignment.pages.filter(p => p.completed).length;
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
    html += '<button class="pm-back-btn" onclick="hideProgressMap(\'' + module + '\')">&#8592; Back to Subjects</button>';
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
    let html = '<div class="pm-tabs">';
    config.subtypes.forEach(st => {
        const isActive = st === activeSubtype;
        const label = config.labels[st] || st;
        html += `<button class="pm-tab${isActive ? ' active' : ''}" onclick="switchProgressTab('${module}','${st}')">${label}</button>`;
    });
    html += '</div>';
    return html;
}

/**
 * Render the 4-stat cards.
 */
function renderStatsBar(stats, streak) {
    return `<div class="pm-stats">
        <div class="pm-stat-card">
            <span class="pm-stat-icon">&#x1F525;</span>
            <span class="pm-stat-value">${streak}</span>
            <span class="pm-stat-label">day streak</span>
        </div>
        <div class="pm-stat-card">
            <span class="pm-stat-icon">&#x2B50;</span>
            <span class="pm-stat-value">${stats.totalStars}</span>
            <span class="pm-stat-label">stars</span>
        </div>
        <div class="pm-stat-card">
            <span class="pm-stat-icon">&#x1F4DD;</span>
            <span class="pm-stat-value">${stats.totalProblems}</span>
            <span class="pm-stat-label">solved</span>
        </div>
        <div class="pm-stat-card">
            <span class="pm-stat-icon">&#x1F3AF;</span>
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
                <circle class="pm-ring-bg" cx="28" cy="28" r="${radius}"/>
                <circle class="pm-ring-fill" cx="28" cy="28" r="${radius}"
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

    const icon = node.state === 'completed'
        ? getPlantSVG('seed', 44)
        : '<svg width="44" height="44" viewBox="0 0 50 50"><circle cx="25" cy="25" r="18" fill="#667eea" opacity="0.2"/><text x="25" y="32" text-anchor="middle" font-size="22" fill="#667eea">&#x1F4CB;</text></svg>';

    return `<div class="pm-node assessment ${stateClass}" ${clickHandler}>
        <div class="pm-node-icon">${icon}</div>
        <div class="pm-node-info">
            <div class="pm-node-title">${escapeHtml(node.title)}</div>
            <div class="pm-node-subtitle">${escapeHtml(node.subtitle)}</div>
        </div>
        ${node.state === 'completed' ? '<div class="pm-node-stars">&#x2705;</div>' : ''}
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

    let rightContent = '';
    if (node.state === 'completed' && node.stars > 0) {
        rightContent = `<div class="pm-node-stars">${'&#x2B50;'.repeat(node.stars)}</div>`;
    } else if (node.state === 'locked') {
        rightContent = '<div class="pm-node-lock">&#x1F512;</div>';
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
