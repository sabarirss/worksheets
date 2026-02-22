// Weekly Assignment Manager
// Generates and tracks 7 Math + 7 English worksheets per week per child

/**
 * WEEKLY ASSIGNMENT SYSTEM
 *
 * Each week, every child gets:
 * - 7 Math worksheet pages at their current level
 * - 7 English worksheet pages at their current level
 *
 * Assignments auto-generate on Monday (or first access of the week).
 * Progress is tracked in Firestore under the 'weekly_assignments' collection.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const WEEKLY_CONFIG = {
    MATH_PAGES_PER_WEEK: 7,
    ENGLISH_PAGES_PER_WEEK: 7,
    // Week starts on Monday (ISO standard)
    WEEK_START_DAY: 1, // 0=Sunday, 1=Monday
};

// ============================================================================
// WEEK UTILITIES
// ============================================================================

/**
 * Get ISO week string for a given date (YYYY-Www format).
 * @param {Date} date
 * @returns {string} e.g., "2026-W08"
 */
function getWeekString(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Get the Monday of the current week.
 * @param {Date} date
 * @returns {Date}
 */
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get the Sunday of the current week.
 * @param {Date} date
 * @returns {Date}
 */
function getWeekEnd(date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}

// ============================================================================
// ASSIGNMENT GENERATION
// ============================================================================

/**
 * Get the child's current math operation and starting page.
 * Uses assessment level or defaults to age-appropriate level.
 * @param {object} child - Selected child object
 * @returns {object} { operation, startPage, ageGroup, difficulty }
 */
function getChildMathPosition(child) {
    const age = child.age || 6;
    const ageGroup = typeof getAgeGroupFromAge === 'function'
        ? getAgeGroupFromAge(age)
        : (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.AGE_TO_GROUP[String(age)] || '6' : '6');

    // Try to get assigned level from assessment
    let assignedLevel = null;
    if (typeof getAssignedLevel === 'function') {
        assignedLevel = getAssignedLevel(child.id, 'math');
    }

    // Determine starting page from level or default to page 1
    let startPage = 1;
    let difficulty = 'easy';
    let operation = 'addition'; // Default operation

    if (assignedLevel) {
        // Convert level to absolute page: levels 1-4=easy, 5-8=medium, 9-12=hard
        if (assignedLevel <= 4) {
            difficulty = 'easy';
            startPage = (assignedLevel - 1) * 12 + 1; // Spread across easy pages
        } else if (assignedLevel <= 8) {
            difficulty = 'medium';
            startPage = 50 + (assignedLevel - 5) * 12 + 1;
        } else {
            difficulty = 'hard';
            startPage = 100 + (assignedLevel - 9) * 12 + 1;
        }
    }

    // Determine which operation based on age
    if (age <= 5) {
        operation = 'addition';
    } else if (age <= 6) {
        operation = 'addition'; // Still mostly addition at 6
    } else if (age <= 7) {
        operation = 'subtraction';
    } else if (age <= 8) {
        operation = 'multiplication';
    } else {
        operation = 'division';
    }

    return { operation, startPage, ageGroup, difficulty };
}

/**
 * Get the child's current English content position.
 * @param {object} child - Selected child object
 * @returns {object} { ageGroup, difficulty, startPage }
 */
function getChildEnglishPosition(child) {
    const age = child.age || 6;
    const ageGroup = typeof getAgeGroupFromAge === 'function'
        ? getAgeGroupFromAge(age)
        : (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.AGE_TO_GROUP[String(age)] || '6' : '6');

    let assignedLevel = null;
    if (typeof getAssignedLevel === 'function') {
        assignedLevel = getAssignedLevel(child.id, 'english');
    }

    let difficulty = 'easy';
    let startPage = 1;

    if (assignedLevel) {
        if (assignedLevel <= 4) {
            difficulty = 'easy';
        } else if (assignedLevel <= 8) {
            difficulty = 'medium';
        } else {
            difficulty = 'hard';
        }
    }

    return { ageGroup, difficulty, startPage };
}

/**
 * Generate weekly assignment pages for a child.
 * Picks 7 consecutive pages starting from the child's last completed page.
 * @param {object} child - Selected child object
 * @param {string} weekStr - Week identifier (e.g., "2026-W08")
 * @returns {object} Assignment data
 */
function generateWeeklyAssignment(child, weekStr) {
    const mathPos = getChildMathPosition(child);
    const englishPos = getChildEnglishPosition(child);

    // Generate math page list (7 consecutive pages)
    const mathPages = [];
    for (let i = 0; i < WEEKLY_CONFIG.MATH_PAGES_PER_WEEK; i++) {
        const page = mathPos.startPage + i;
        if (page <= 150) { // Max pages
            mathPages.push({
                absolutePage: page,
                operation: mathPos.operation,
                completed: false,
                score: 0
            });
        }
    }

    // Generate english page list (7 pages)
    const englishPages = [];
    for (let i = 0; i < WEEKLY_CONFIG.ENGLISH_PAGES_PER_WEEK; i++) {
        englishPages.push({
            pageIndex: englishPos.startPage + i,
            ageGroup: englishPos.ageGroup,
            difficulty: englishPos.difficulty,
            completed: false,
            score: 0
        });
    }

    return {
        childId: child.id,
        childName: child.name,
        week: weekStr,
        weekStart: getWeekStart(new Date()).toISOString(),
        weekEnd: getWeekEnd(new Date()).toISOString(),
        math: {
            operation: mathPos.operation,
            difficulty: mathPos.difficulty,
            ageGroup: mathPos.ageGroup,
            pages: mathPages,
            completedCount: 0,
            totalPages: mathPages.length
        },
        english: {
            ageGroup: englishPos.ageGroup,
            difficulty: englishPos.difficulty,
            pages: englishPages,
            completedCount: 0,
            totalPages: englishPages.length
        },
        status: 'active',
        createdAt: new Date().toISOString()
    };
}

// ============================================================================
// FIRESTORE OPERATIONS
// ============================================================================

/**
 * Load current week's assignment for a child from Firestore.
 * If no assignment exists, generates one.
 * @param {string} childId
 * @returns {object|null} Assignment data
 */
async function loadWeeklyAssignment(childId) {
    if (!childId) return null;

    const weekStr = getWeekString(new Date());
    const docId = `${childId}_${weekStr}`;

    try {
        const doc = await firebase.firestore()
            .collection('weekly_assignments')
            .doc(docId)
            .get();

        if (doc.exists) {
            return { id: docId, ...doc.data() };
        }

        // No assignment exists for this week - generate one
        const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
        if (!child || child.id !== childId) return null;

        const assignment = generateWeeklyAssignment(child, weekStr);
        await firebase.firestore()
            .collection('weekly_assignments')
            .doc(docId)
            .set(assignment);

        console.log('Generated new weekly assignment for', child.name, weekStr);
        return { id: docId, ...assignment };

    } catch (error) {
        console.error('Error loading weekly assignment:', error);
        return null;
    }
}

/**
 * Update assignment progress when a page is completed.
 * Called from worksheet completion handlers.
 * @param {string} module - 'math' or 'english'
 * @param {object} pageData - { absolutePage, score, completed } for math, { pageIndex, score, completed } for english
 */
async function updateAssignmentProgress(module, pageData) {
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) return;

    const weekStr = getWeekString(new Date());
    const docId = `${child.id}_${weekStr}`;

    try {
        const doc = await firebase.firestore()
            .collection('weekly_assignments')
            .doc(docId)
            .get();

        if (!doc.exists) return;

        const assignment = doc.data();
        const moduleData = assignment[module];
        if (!moduleData || !moduleData.pages) return;

        // Find the matching page and update it
        let updated = false;
        const pageKey = module === 'math' ? 'absolutePage' : 'pageIndex';

        moduleData.pages.forEach(page => {
            if (page[pageKey] === pageData[pageKey] && !page.completed) {
                if (pageData.completed) {
                    page.completed = true;
                    page.score = pageData.score || 0;
                    page.completedAt = new Date().toISOString();
                    moduleData.completedCount = (moduleData.completedCount || 0) + 1;
                    updated = true;
                }
            }
        });

        if (updated) {
            // Check if all assignments for both modules are complete
            const mathDone = assignment.math.completedCount >= assignment.math.totalPages;
            const englishDone = assignment.english.completedCount >= assignment.english.totalPages;

            const updateData = {
                [module]: moduleData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (mathDone && englishDone) {
                updateData.status = 'completed';
                updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();
            }

            await firebase.firestore()
                .collection('weekly_assignments')
                .doc(docId)
                .update(updateData);

            console.log(`Updated ${module} assignment progress:`, moduleData.completedCount, '/', moduleData.totalPages);
        }

    } catch (error) {
        console.error('Error updating assignment progress:', error);
    }
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

/**
 * Render the weekly assignment progress card on the home page.
 * Shows how many of the 7+7 pages are completed this week.
 * @param {HTMLElement} container - Container element to render into
 */
async function renderWeeklyProgress(container) {
    if (!container) return;

    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) {
        container.style.display = 'none';
        return;
    }

    const assignment = await loadWeeklyAssignment(child.id);
    if (!assignment) {
        container.style.display = 'none';
        return;
    }

    const mathDone = assignment.math.completedCount || 0;
    const mathTotal = assignment.math.totalPages || WEEKLY_CONFIG.MATH_PAGES_PER_WEEK;
    const englishDone = assignment.english.completedCount || 0;
    const englishTotal = assignment.english.totalPages || WEEKLY_CONFIG.ENGLISH_PAGES_PER_WEEK;
    const totalDone = mathDone + englishDone;
    const totalAll = mathTotal + englishTotal;
    const percentage = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

    const weekEnd = new Date(assignment.weekEnd);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((weekEnd - now) / (1000 * 60 * 60 * 24)));

    let statusText = '';
    let statusColor = '#667eea';
    if (assignment.status === 'completed') {
        statusText = 'All Done!';
        statusColor = '#28a745';
    } else if (daysLeft <= 1) {
        statusText = 'Due Today!';
        statusColor = '#dc3545';
    } else {
        statusText = `${daysLeft} days left`;
    }

    container.innerHTML = `
        <div class="weekly-progress-card" style="
            background: white;
            border-radius: 16px;
            padding: 20px 24px;
            margin: 15px 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border-left: 5px solid ${statusColor};
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 1.1em; color: #333;">This Week's Practice</h3>
                <span style="font-size: 0.85em; color: ${statusColor}; font-weight: bold;">${statusText}</span>
            </div>

            <div style="background: #f0f0f0; border-radius: 10px; height: 12px; margin-bottom: 15px; overflow: hidden;">
                <div style="
                    background: linear-gradient(90deg, ${statusColor}, ${statusColor}cc);
                    height: 100%;
                    width: ${percentage}%;
                    border-radius: 10px;
                    transition: width 0.5s ease;
                "></div>
            </div>

            <div style="display: flex; gap: 20px; justify-content: center;">
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 1.6em; font-weight: bold; color: ${mathDone >= mathTotal ? '#28a745' : '#667eea'};">
                        ${mathDone}/${mathTotal}
                    </div>
                    <div style="font-size: 0.85em; color: #666;">Math Pages</div>
                </div>
                <div style="width: 1px; background: #ddd;"></div>
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 1.6em; font-weight: bold; color: ${englishDone >= englishTotal ? '#28a745' : '#667eea'};">
                        ${englishDone}/${englishTotal}
                    </div>
                    <div style="font-size: 0.85em; color: #666;">English Pages</div>
                </div>
            </div>

            ${percentage === 100 ? `
                <div style="text-align: center; margin-top: 12px; padding: 8px; background: #d4edda; border-radius: 8px; color: #28a745; font-weight: bold;">
                    Great work this week! Keep it up!
                </div>
            ` : ''}
        </div>
    `;

    container.style.display = 'block';
}

/**
 * Render assignment history for parent view.
 * @param {HTMLElement} container
 * @param {string} childId
 * @param {number} weeksBack - How many weeks of history to show
 */
async function renderAssignmentHistory(container, childId, weeksBack = 4) {
    if (!container || !childId) return;

    try {
        const assignments = await firebase.firestore()
            .collection('weekly_assignments')
            .where('childId', '==', childId)
            .orderBy('createdAt', 'desc')
            .limit(weeksBack)
            .get();

        if (assignments.empty) {
            container.innerHTML = '<p style="color: #999; text-align: center;">No assignment history yet.</p>';
            return;
        }

        let html = '<div class="assignment-history">';
        assignments.forEach(doc => {
            const a = doc.data();
            const mathPct = a.math.totalPages > 0
                ? Math.round((a.math.completedCount / a.math.totalPages) * 100)
                : 0;
            const engPct = a.english.totalPages > 0
                ? Math.round((a.english.completedCount / a.english.totalPages) * 100)
                : 0;
            const totalPct = Math.round(((a.math.completedCount + a.english.completedCount) /
                (a.math.totalPages + a.english.totalPages)) * 100);

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
                    <div>
                        <strong>${a.week}</strong>
                        <span style="font-size: 0.85em; color: ${a.status === 'completed' ? '#28a745' : '#999'}; margin-left: 8px;">
                            ${a.status === 'completed' ? 'Completed' : 'Incomplete'}
                        </span>
                    </div>
                    <div style="display: flex; gap: 15px; font-size: 0.9em;">
                        <span>Math: ${mathPct}%</span>
                        <span>English: ${engPct}%</span>
                        <strong>${totalPct}%</strong>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading assignment history:', error);
        container.innerHTML = '<p style="color: #cc0000;">Failed to load history.</p>';
    }
}

// ============================================================================
// INTEGRATION HOOKS
// ============================================================================

/**
 * Hook into math worksheet completion to update assignment.
 * Call this from worksheet-generator.js after a page is submitted with >= 95%.
 * @param {string} operation - Math operation
 * @param {number} absolutePage - Absolute page number (1-150)
 * @param {number} score - Score percentage
 * @param {boolean} completed - Whether threshold was met
 */
function onMathPageCompleted(operation, absolutePage, score, completed) {
    if (completed) {
        updateAssignmentProgress('math', {
            absolutePage: absolutePage,
            score: score,
            completed: true
        });
    }
}

/**
 * Hook into English worksheet completion to update assignment.
 * Call this from english-generator.js after a page is submitted with >= 95%.
 * @param {number} pageIndex - Page index
 * @param {number} score - Score percentage
 * @param {boolean} completed - Whether threshold was met
 */
function onEnglishPageCompleted(pageIndex, score, completed) {
    if (completed) {
        updateAssignmentProgress('english', {
            pageIndex: pageIndex,
            score: score,
            completed: true
        });
    }
}

console.log('Weekly assignment manager loaded');
