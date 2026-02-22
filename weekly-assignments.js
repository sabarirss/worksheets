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
    // New assignments unlock Monday at 4pm local time
    GENERATION_HOUR: 16, // 4pm
    GENERATION_DAY: 1,   // Monday
    // Consecutive incomplete weeks before lockout
    LOCKOUT_THRESHOLD: 2,
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
// GENERATION GATE & LOCKOUT
// ============================================================================

/**
 * Check if new assignment generation is allowed.
 * Returns true only if current time is past Monday 4pm local time for the current week.
 * @returns {boolean}
 */
function isAssignmentGenerationAllowed() {
    const now = new Date();
    const weekStart = getWeekStart(now); // Monday 00:00

    // Generation unlocks at Monday GENERATION_HOUR (4pm)
    const unlockTime = new Date(weekStart);
    unlockTime.setHours(WEEKLY_CONFIG.GENERATION_HOUR, 0, 0, 0);

    return now >= unlockTime;
}

/**
 * Check if a child is locked out due to consecutive incomplete weeks.
 * @param {string} childId
 * @returns {Promise<{locked: boolean, consecutiveWeeks: number}>}
 */
async function checkLockoutStatus(childId) {
    try {
        const snapshot = await firebase.firestore()
            .collection('weekly_assignments')
            .where('childId', '==', childId)
            .orderBy('createdAt', 'desc')
            .limit(WEEKLY_CONFIG.LOCKOUT_THRESHOLD)
            .get();

        if (snapshot.size < WEEKLY_CONFIG.LOCKOUT_THRESHOLD) {
            return { locked: false, consecutiveWeeks: 0 };
        }

        const docs = snapshot.docs.map(d => d.data());
        // Check that the most recent N assignments are all incomplete
        const allIncomplete = docs.every(a => a.status !== 'completed');

        return {
            locked: allIncomplete,
            consecutiveWeeks: allIncomplete ? WEEKLY_CONFIG.LOCKOUT_THRESHOLD : 0
        };
    } catch (error) {
        console.warn('Error checking lockout status:', error.message);
        return { locked: false, consecutiveWeeks: 0 };
    }
}

/**
 * Load the most recent incomplete (active) assignment for carryover.
 * @param {string} childId
 * @returns {Promise<object|null>} Assignment with isCarryover flag, or null
 */
async function loadPreviousIncompleteAssignment(childId) {
    try {
        const snapshot = await firebase.firestore()
            .collection('weekly_assignments')
            .where('childId', '==', childId)
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data(), isCarryover: true };
    } catch (error) {
        console.warn('Error loading previous incomplete assignment:', error.message);
        return null;
    }
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
 * Picks 7 consecutive pages starting from where the previous week left off.
 * Ensures no page is repeated across weeks (progressive curriculum).
 *
 * @param {object} child - Selected child object
 * @param {string} weekStr - Week identifier (e.g., "2026-W08")
 * @param {object|null} previousAssignment - Previous week's assignment (if any)
 * @returns {object} Assignment data
 */
function generateWeeklyAssignment(child, weekStr, previousAssignment) {
    const mathPos = getChildMathPosition(child);
    const englishPos = getChildEnglishPosition(child);

    const MAX_MATH_PAGES = 150;
    const MAX_ENGLISH_PAGES = 50;

    // Determine math start page: continue from where previous week ended
    let mathStartPage = mathPos.startPage;
    let mathOperation = mathPos.operation;
    let mathDifficulty = mathPos.difficulty;

    if (previousAssignment && previousAssignment.math && previousAssignment.math.pages.length > 0) {
        const prevMathPages = previousAssignment.math.pages;
        const lastAssignedPage = Math.max(...prevMathPages.map(p => p.absolutePage));
        mathStartPage = lastAssignedPage + 1;
        // Carry forward operation and difficulty from previous week
        mathOperation = previousAssignment.math.operation || mathPos.operation;
        mathDifficulty = previousAssignment.math.difficulty || mathPos.difficulty;

        // If we've gone past max pages, wrap around with next difficulty
        if (mathStartPage > MAX_MATH_PAGES) {
            if (mathDifficulty === 'easy') {
                mathDifficulty = 'medium';
                mathStartPage = 51;
            } else if (mathDifficulty === 'medium') {
                mathDifficulty = 'hard';
                mathStartPage = 101;
            } else {
                // Completed all difficulties - cycle back to easy page 1
                mathDifficulty = 'easy';
                mathStartPage = 1;
            }
        }
    }

    // Generate math page list (7 consecutive pages)
    const mathPages = [];
    for (let i = 0; i < WEEKLY_CONFIG.MATH_PAGES_PER_WEEK; i++) {
        const page = mathStartPage + i;
        if (page <= MAX_MATH_PAGES) {
            mathPages.push({
                absolutePage: page,
                operation: mathOperation,
                completed: false,
                score: 0
            });
        }
    }

    // Determine english start page: continue from where previous week ended
    let englishStartPage = englishPos.startPage;
    let englishDifficulty = englishPos.difficulty;
    let englishAgeGroup = englishPos.ageGroup;

    if (previousAssignment && previousAssignment.english && previousAssignment.english.pages.length > 0) {
        const prevEngPages = previousAssignment.english.pages;
        const lastAssignedPage = Math.max(...prevEngPages.map(p => p.pageIndex));
        englishStartPage = lastAssignedPage + 1;
        englishDifficulty = previousAssignment.english.difficulty || englishPos.difficulty;
        englishAgeGroup = previousAssignment.english.ageGroup || englishPos.ageGroup;

        // If we've gone past max english pages, advance difficulty
        if (englishStartPage > MAX_ENGLISH_PAGES) {
            if (englishDifficulty === 'easy') {
                englishDifficulty = 'medium';
                englishStartPage = 1;
            } else if (englishDifficulty === 'medium') {
                englishDifficulty = 'hard';
                englishStartPage = 1;
            } else {
                // Completed all - cycle back
                englishDifficulty = 'easy';
                englishStartPage = 1;
            }
        }
    }

    // Generate english page list (7 pages)
    const englishPages = [];
    for (let i = 0; i < WEEKLY_CONFIG.ENGLISH_PAGES_PER_WEEK; i++) {
        const pageIndex = englishStartPage + i;
        if (pageIndex <= MAX_ENGLISH_PAGES) {
            englishPages.push({
                pageIndex: pageIndex,
                ageGroup: englishAgeGroup,
                difficulty: englishDifficulty,
                completed: false,
                score: 0
            });
        }
    }

    return {
        childId: child.id,
        childName: child.name,
        week: weekStr,
        weekStart: getWeekStart(new Date()).toISOString(),
        weekEnd: getWeekEnd(new Date()).toISOString(),
        math: {
            operation: mathOperation,
            difficulty: mathDifficulty,
            ageGroup: mathPos.ageGroup,
            pages: mathPages,
            completedCount: 0,
            totalPages: mathPages.length
        },
        english: {
            ageGroup: englishAgeGroup,
            difficulty: englishDifficulty,
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
        // Check if this week's assignment already exists
        const doc = await firebase.firestore()
            .collection('weekly_assignments')
            .doc(docId)
            .get();

        if (doc.exists) {
            return { id: docId, ...doc.data() };
        }

        // No assignment for this week yet

        // 1. Check generation gate: before Monday 4pm, show previous incomplete
        if (!isAssignmentGenerationAllowed()) {
            console.log('Before Monday 4pm — no new assignment generation');
            const carryover = await loadPreviousIncompleteAssignment(childId);
            if (carryover) return carryover;
            // No previous incomplete either — nothing to show
            return null;
        }

        // 2. Check lockout: 2+ consecutive incomplete weeks
        const lockout = await checkLockoutStatus(childId);
        if (lockout.locked) {
            console.log(`Child ${childId} locked out: ${lockout.consecutiveWeeks} consecutive incomplete weeks`);

            // Create lockout notification
            const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
            const parentUid = firebase.auth().currentUser?.uid;
            if (child && parentUid && typeof createNotification === 'function') {
                createNotification(
                    childId, parentUid,
                    'lockout',
                    'Worksheets Paused',
                    `Complete previous weeks\' worksheets before new ones unlock.`,
                    '', {}
                );
            }

            // Return null to trigger lockout UI
            return null;
        }

        // 3. Generate new assignment
        const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
        if (!child || child.id !== childId) return null;

        // Look up the most recent previous assignment to continue from where it left off
        let previousAssignment = null;
        try {
            const prevDocs = await firebase.firestore()
                .collection('weekly_assignments')
                .where('childId', '==', childId)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (!prevDocs.empty) {
                previousAssignment = prevDocs.docs[0].data();
                console.log('Found previous assignment from', previousAssignment.week);
            }
        } catch (prevError) {
            console.warn('Could not load previous assignment:', prevError.message);
        }

        const assignment = generateWeeklyAssignment(child, weekStr, previousAssignment);
        assignment.generatedBy = 'client';
        assignment.notificationSent = false;

        await firebase.firestore()
            .collection('weekly_assignments')
            .doc(docId)
            .set(assignment);

        console.log('Generated new weekly assignment for', child.name, weekStr,
            '- Math pages:', assignment.math.pages.map(p => p.absolutePage).join(','),
            '- English pages:', assignment.english.pages.map(p => p.pageIndex).join(','));

        // 4. Create new_sheets notification
        const parentUid = firebase.auth().currentUser?.uid;
        if (parentUid && typeof createNotification === 'function') {
            createNotification(
                childId, parentUid,
                'new_sheets',
                'New Worksheets Ready!',
                `${child.name} has ${assignment.math.totalPages} Math and ${assignment.english.totalPages} English pages for this week.`,
                'index',
                { weekStr }
            );

            // Mark notification as sent
            await firebase.firestore()
                .collection('weekly_assignments')
                .doc(docId)
                .update({ notificationSent: true });
        }

        return { id: docId, ...assignment };

    } catch (error) {
        console.error('Error loading weekly assignment:', error);
        return null;
    }
}

/**
 * Generate a child's first weekly assignment immediately after assessment completion.
 * Bypasses the Monday 4pm gate since this is the initial assignment.
 * Creates a notification to inform the user their sheets are ready.
 * @param {object} child - Selected child object
 * @returns {Promise<object|null>} The generated assignment, or null if already exists
 */
async function generateFirstWeeklyAssignment(child) {
    if (!child || !child.id) return null;

    const weekStr = getWeekString(new Date());
    const docId = `${child.id}_${weekStr}`;

    try {
        // Check if assignment already exists for this week
        const existing = await firebase.firestore()
            .collection('weekly_assignments')
            .doc(docId)
            .get();

        if (existing.exists) {
            console.log('Weekly assignment already exists for', child.name, weekStr);
            return { id: docId, ...existing.data() };
        }

        // Generate assignment (no gate check — this is triggered by assessment completion)
        const assignment = generateWeeklyAssignment(child, weekStr, null);
        assignment.generatedBy = 'assessment_completion';
        assignment.notificationSent = false;

        await firebase.firestore()
            .collection('weekly_assignments')
            .doc(docId)
            .set(assignment);

        console.log('Generated first weekly assignment after assessment for', child.name, weekStr,
            '- Math pages:', assignment.math.pages.map(p => p.absolutePage).join(','),
            '- English pages:', assignment.english.pages.map(p => p.pageIndex).join(','));

        // Create notification for new sheets
        const parentUid = firebase.auth().currentUser?.uid;
        if (parentUid && typeof createNotification === 'function') {
            createNotification(
                child.id, parentUid,
                'new_sheets',
                'Worksheets Ready!',
                `${child.name}'s first worksheets are ready: ${assignment.math.totalPages} Math and ${assignment.english.totalPages} English pages this week.`,
                'index',
                { weekStr, source: 'assessment_completion' }
            );

            await firebase.firestore()
                .collection('weekly_assignments')
                .doc(docId)
                .update({ notificationSent: true });
        }

        return { id: docId, ...assignment };
    } catch (error) {
        console.error('Error generating first weekly assignment:', error);
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

    // Weekly assignments are full version only
    const childVersion = child.version || 'demo';
    if (childVersion !== 'full') {
        container.style.display = 'none';
        return;
    }

    const assignment = await loadWeeklyAssignment(child.id);

    // Handle lockout state (assignment is null + lockout active)
    if (!assignment) {
        const lockout = await checkLockoutStatus(child.id);
        if (lockout.locked) {
            container.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 20px 24px;
                    margin: 15px 0;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                    border-left: 5px solid #dc3545;
                ">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                        <span style="font-size: 1.5em;">&#128274;</span>
                        <h3 style="margin: 0; font-size: 1.1em; color: #dc3545;">Worksheets Paused</h3>
                    </div>
                    <p style="color: #666; margin: 0; font-size: 0.95em; line-height: 1.5;">
                        ${child.name} has ${lockout.consecutiveWeeks}+ weeks of incomplete worksheets.
                        Please complete previous weeks' assignments before new ones unlock.
                    </p>
                </div>
            `;
            container.style.display = 'block';
            return;
        }

        container.style.display = 'none';
        return;
    }

    // Handle carryover state (showing last week's incomplete assignment)
    const isCarryover = assignment.isCarryover === true;

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

    // Format the due date for display
    const dueDateStr = weekEnd.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

    let statusText = '';
    let statusColor = '#667eea';
    if (isCarryover) {
        statusText = 'From Last Week';
        statusColor = '#ff9800';
    } else if (assignment.status === 'completed') {
        statusText = 'All Done!';
        statusColor = '#28a745';
    } else if (daysLeft === 0) {
        statusText = 'Due Today!';
        statusColor = '#dc3545';
    } else {
        statusText = `Due ${dueDateStr}`;
    }

    let carryoverBanner = '';
    if (isCarryover) {
        carryoverBanner = `
            <div style="text-align: center; margin-bottom: 12px; padding: 10px; background: #fff3e0; border-radius: 8px; color: #e65100; font-weight: 600; font-size: 0.9em;">
                &#9888;&#65039; Complete last week's sheets before new ones unlock (Monday 4pm)
            </div>
        `;
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
                <h3 style="margin: 0; font-size: 1.1em; color: #333;">${isCarryover ? 'Incomplete Practice' : "This Week's Practice"}</h3>
                <span style="font-size: 0.85em; color: ${statusColor}; font-weight: bold;">${statusText}</span>
            </div>

            ${carryoverBanner}

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

// ============================================================================
// PAGE ACCESS CONTROL
// ============================================================================

/**
 * Get the accessible pages for a child based on their mode (demo/admin/full).
 * Single source of truth for which pages a child can access.
 *
 * @param {string} childId - The child's ID
 * @param {string} module - 'math' or 'english'
 * @returns {Promise<object>} Access info:
 *   - pages: number[] (list of accessible absolute page numbers)
 *   - minPage: number (lowest accessible page)
 *   - maxPage: number (highest accessible page)
 *   - totalAccessible: number (count of accessible pages)
 *   - mode: 'demo' | 'admin' | 'full'
 *   - pending: boolean (true if no assignment available yet)
 *   - pendingReason: string (reason if pending)
 */
async function getAccessiblePages(childId, module = 'math') {
    const isAdmin = window.currentUserRole === 'admin';
    const maxPages = module === 'math' ? 150 : 50;

    // Admin: unrestricted access
    if (isAdmin) {
        const allPages = [];
        for (let i = 1; i <= maxPages; i++) allPages.push(i);
        return {
            pages: allPages,
            minPage: 1,
            maxPage: maxPages,
            totalAccessible: maxPages,
            mode: 'admin',
            pending: false,
        };
    }

    // Demo: fixed 2 pages
    if (typeof isDemoMode === 'function' && isDemoMode()) {
        const demoCount = APP_CONFIG.PAGE_ACCESS.DEMO_PAGE_COUNT;
        const pages = [];
        for (let i = 1; i <= demoCount; i++) pages.push(i);
        return {
            pages: pages,
            minPage: 1,
            maxPage: demoCount,
            totalAccessible: demoCount,
            mode: 'demo',
            pending: false,
        };
    }

    // Full version: get weekly assignment pages
    if (!childId) {
        return { pages: [], minPage: 0, maxPage: 0, totalAccessible: 0, mode: 'full', pending: true, pendingReason: 'No child selected' };
    }

    try {
        const assignment = await loadWeeklyAssignment(childId);

        if (!assignment) {
            // Check if locked out or before generation time
            const lockout = await checkLockoutStatus(childId);
            if (lockout.locked) {
                return {
                    pages: [],
                    minPage: 0,
                    maxPage: 0,
                    totalAccessible: 0,
                    mode: 'full',
                    pending: true,
                    pendingReason: 'lockout',
                    lockoutWeeks: lockout.consecutiveWeeks,
                };
            }

            // Before Monday 4pm or no assignment generated
            return {
                pages: [],
                minPage: 0,
                maxPage: 0,
                totalAccessible: 0,
                mode: 'full',
                pending: true,
                pendingReason: 'no_assignment',
            };
        }

        // Extract pages from assignment
        let pages = [];
        if (module === 'math' && assignment.math && assignment.math.pages) {
            pages = assignment.math.pages.map(p => p.absolutePage).sort((a, b) => a - b);
        } else if (module === 'english' && assignment.english && assignment.english.pages) {
            pages = assignment.english.pages.map(p => p.pageIndex).sort((a, b) => a - b);
        }

        if (pages.length === 0) {
            return { pages: [], minPage: 0, maxPage: 0, totalAccessible: 0, mode: 'full', pending: true, pendingReason: 'no_pages' };
        }

        return {
            pages: pages,
            minPage: pages[0],
            maxPage: pages[pages.length - 1],
            totalAccessible: pages.length,
            mode: 'full',
            pending: false,
            assignment: assignment,
        };
    } catch (error) {
        console.error('Error getting accessible pages:', error);
        return { pages: [], minPage: 0, maxPage: 0, totalAccessible: 0, mode: 'full', pending: true, pendingReason: 'error' };
    }
}

console.log('Weekly assignment manager loaded');
