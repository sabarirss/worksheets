/**
 * Demo Data Seeder for GleeGrow
 *
 * Creates 5 demo child accounts under the admin user with different
 * performance profiles. Seeds 4 weeks of historical data + current week
 * (partial) so admin can see progress trends.
 *
 * Profiles:
 *   1. Aria Star      (Age 5, Addition L2)    — Consistent: 85-100% every page
 *   2. Ben Average    (Age 7, Subtraction L5) — Average: 60-80%
 *   3. Clara Struggle (Age 6, Addition L3)    — Poor: 25-50%
 *   4. Danny Roller   (Age 8, Multiply L7)    — Highs & Lows: alternating weeks
 *   5. Emma Random    (Age 9, Division L9)    — Inconsistent: skips, spikes, dips
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { generatePageProblems, levelToAgeGroup, levelToDifficulty, classifyProblem } = require('./shared/math-engine');

const DEMO_CHILDREN = [
    {
        name: 'Aria Star',
        dob: '2021-03-15',
        gender: 'girl',
        operation: 'addition',
        level: 2,
        pattern: 'consistent',
        theme: 'rainbow'
    },
    {
        name: 'Ben Average',
        dob: '2019-06-10',
        gender: 'boy',
        operation: 'subtraction',
        level: 5,
        pattern: 'average',
        theme: 'forest'
    },
    {
        name: 'Clara Struggle',
        dob: '2020-01-20',
        gender: 'girl',
        operation: 'addition',
        level: 3,
        pattern: 'poor',
        theme: 'candy'
    },
    {
        name: 'Danny Roller',
        dob: '2018-08-05',
        gender: 'boy',
        operation: 'multiplication',
        level: 7,
        pattern: 'highs_and_lows',
        theme: 'space'
    },
    {
        name: 'Emma Random',
        dob: '2017-11-12',
        gender: 'girl',
        operation: 'division',
        level: 9,
        pattern: 'inconsistent',
        theme: 'dinosaur'
    }
];

/**
 * Deterministic score generator based on performance pattern.
 * Returns correctCount (0-20) or -1 for skipped days.
 *
 * Scores are calibrated so progress is VISIBLE in the dashboard:
 * - "completed" = score >= 95% (19+ out of 20)
 * - Each pattern produces a mix of completed and attempted pages
 */
function getCorrectCount(pattern, weekIndex, dayIndex) {
    const seed = weekIndex * 7 + dayIndex;
    switch (pattern) {
        case 'consistent':
            return 19 + (seed % 2); // 19, 20 → 95-100% → ALL completed
        case 'average':
            // Mix of completed (19-20) and close (16-18) → ~40% completed
            return 16 + (seed % 5); // 16, 17, 18, 19, 20 → 80-100%
        case 'poor':
            // Mostly low but improving → shows attempted but few completed
            return 8 + (seed % 8); // 8-15 → 40-75%, occasionally 15/20
        case 'highs_and_lows':
            if (weekIndex % 2 === 0) return 19 + (seed % 2); // high: 19, 20 → ALL completed
            return 10 + (seed % 5); // low: 10-14 → 50-70% → none completed
        case 'inconsistent':
            if (seed % 5 === 0) return -1; // skip ~20%
            if (seed % 3 === 0) return 19 + (seed % 2); // great ~27% → completed
            return 7 + (seed % 7); // poor ~53% → 35-65%
        default:
            return 15;
    }
}

/**
 * Get ISO week string (e.g., "2026-W09") for a date.
 */
function getWeekString(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Get Monday of the week containing the given date.
 */
function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(9, 0, 0, 0); // 9 AM for realistic timestamp
    return d;
}

/**
 * Build week objects for past N weeks + current partial week.
 */
function buildWeeks(numPastWeeks) {
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const weeks = [];

    // Past complete weeks
    for (let i = numPastWeeks; i >= 1; i--) {
        const refDate = new Date(now);
        refDate.setDate(refDate.getDate() - i * 7);
        const monday = getMonday(refDate);
        const weekStr = getWeekString(monday);
        const days = [];
        for (let d = 0; d < 7; d++) {
            const day = new Date(monday);
            day.setDate(day.getDate() + d);
            day.setHours(15 + (d % 3), d * 7 % 60, 0, 0); // Varied times
            days.push(day);
        }
        weeks.push({ weekStr, monday, days, daysAvailable: 7 });
    }

    // Current week (partial)
    const currentMonday = getMonday(now);
    const currentWeekStr = getWeekString(currentMonday);
    const currentDays = [];
    for (let d = 0; d <= currentDayOfWeek; d++) {
        const day = new Date(currentMonday);
        day.setDate(day.getDate() + d);
        day.setHours(15 + (d % 3), d * 7 % 60, 0, 0);
        currentDays.push(day);
    }
    weeks.push({
        weekStr: currentWeekStr,
        monday: currentMonday,
        days: currentDays,
        daysAvailable: currentDayOfWeek + 1
    });

    return weeks;
}

/**
 * Seed demo children with 4 weeks of historical data.
 */
async function seedDemoData(callerUid) {
    const db = admin.firestore();

    // Verify admin
    const userDoc = await db.collection('users').doc(callerUid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admin can seed demo data');
    }

    // Check for existing demo children (prevent duplicates)
    const existing = await db.collection('children')
        .where('parent_uid', '==', callerUid)
        .where('isDemo', '==', true)
        .limit(1).get();
    if (!existing.empty) {
        throw new HttpsError('already-exists',
            'Demo children already exist. Clear them first before re-seeding.');
    }

    const weeks = buildWeeks(4);
    const results = [];

    for (const childDef of DEMO_CHILDREN) {
        const childRef = db.collection('children').doc();
        const childId = childRef.id;
        const ageGroup = levelToAgeGroup(childDef.level);
        const difficulty = levelToDifficulty(childDef.level);

        // Build skill tracking for this child
        const skillData = {};
        let totalStars = 0;
        let totalSolved = 0;
        let totalCorrect = 0;

        // Use batched writes (max 500 per batch)
        let batch = db.batch();
        let batchCount = 0;

        async function commitIfNeeded() {
            if (batchCount >= 490) {
                await batch.commit();
                batch = db.batch();
                batchCount = 0;
            }
        }

        // Create child document
        const childAge = childDef.level <= 2 ? 5 : childDef.level <= 4 ? 6
            : childDef.level <= 6 ? 7 : childDef.level <= 8 ? 8 : 9;
        batch.set(childRef, {
            name: childDef.name,
            parent_uid: callerUid,
            date_of_birth: childDef.dob,
            gender: childDef.gender,
            age: childAge,
            version: 'full',
            theme: childDef.theme,
            inputMode: 'keyboard',
            assignedModules: {
                math: true, english: true, aptitude: true,
                stories: true, drawing: true, eq: true
            },
            enabledModules: {
                math: true, english: true, aptitude: true,
                stories: true, drawing: true, eq: true
            },
            assessmentData: {
                [childDef.operation]: {
                    level: childDef.level,
                    score: 75,
                    date: new Date().toISOString(),
                    taken: true
                }
            },
            avatar: { totalStarsEarned: 0 },
            isDemo: true,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        batchCount++;

        // Process each week
        for (let w = 0; w < weeks.length; w++) {
            const week = weeks[w];
            const mathPages = [];
            let weekCompletedCount = 0;

            for (let d = 0; d < 7; d++) {
                const absolutePage = w * 7 + d + 1;
                const dayAvailable = d < week.daysAvailable;

                let correctCount = dayAvailable
                    ? getCorrectCount(childDef.pattern, w, d)
                    : -1; // future day

                const skipped = correctCount === -1;
                const score = skipped ? 0 : Math.round((correctCount / 20) * 100);
                const pageCompleted = !skipped && score >= 95;

                if (!skipped && dayAvailable) {
                    // Create completion document
                    const identifier = `${childDef.operation}-level${childDef.level}-page${absolutePage}`;
                    const completionRef = db.collection('completions').doc(`${childId}_math_${identifier}`);
                    batch.set(completionRef, {
                        completionId: `${childId}_math_${identifier}`,
                        childId,
                        module: 'math',
                        identifier,
                        score,
                        correctCount,
                        totalProblems: 20,
                        completed: pageCompleted,
                        manuallyMarked: false,
                        timestamp: admin.firestore.Timestamp.fromDate(week.days[d]),
                        attempts: 1,
                        elapsedTime: `${3 + (d % 5)}:${String(10 + d * 7).padStart(2, '0')}`
                    });
                    batchCount++;
                    await commitIfNeeded();

                    totalSolved += 20;
                    totalCorrect += correctCount;
                    if (pageCompleted) {
                        weekCompletedCount++;
                        // Match actual star awards (completion-manager.js):
                        // 3 stars for ≥95%, 2 for ≥85%, 1 for completed
                        if (score >= 95) totalStars += 3;
                        else if (score >= 85) totalStars += 2;
                        else totalStars += 1;
                    }

                    // Track skill data from actual problems
                    try {
                        const problems = generatePageProblems(
                            childDef.operation, ageGroup, difficulty, absolutePage
                        );
                        for (let p = 0; p < 20; p++) {
                            const prob = problems[p];
                            if (!prob) continue;
                            const skills = classifyProblem(childDef.operation, prob.a, prob.b);
                            const isWrong = p >= correctCount; // last N problems are "wrong"
                            for (const skill of skills) {
                                if (!skillData[skill]) {
                                    skillData[skill] = { attempts: 0, errors: 0 };
                                }
                                skillData[skill].attempts++;
                                if (isWrong) skillData[skill].errors++;
                            }
                        }
                    } catch (e) {
                        // generatePageProblems may not work for all combos; skip
                    }
                }

                mathPages.push({
                    absolutePage,
                    operation: childDef.operation,
                    completed: pageCompleted,
                    score: skipped ? 0 : score
                });
            }

            // Create weekly assignment document
            const weekEnd = new Date(week.monday);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            // English pages — also seed progress (varied by pattern)
            const engPages = [];
            let engCompletedCount = 0;
            for (let d = 0; d < 7; d++) {
                const engPageNum = w * 7 + d + 1;
                const dayAvailable = d < week.daysAvailable;

                // English scores are slightly lower than math (different subject)
                let engCorrect = dayAvailable
                    ? Math.max(0, getCorrectCount(childDef.pattern, w, d) - 2 - (d % 3))
                    : -1;
                if (engCorrect < 0) engCorrect = -1;
                const engSkipped = engCorrect === -1;
                const engScore = engSkipped ? 0 : Math.round((engCorrect / 20) * 100);
                const engPageDone = !engSkipped && engScore >= 95;

                if (!engSkipped && dayAvailable) {
                    const engIdentifier = `english-${ageGroup}-${difficulty}-page${engPageNum}`;
                    const engCompRef = db.collection('completions')
                        .doc(`${childId}_english_${engIdentifier}`);
                    batch.set(engCompRef, {
                        completionId: `${childId}_english_${engIdentifier}`,
                        childId,
                        module: 'english',
                        identifier: engIdentifier,
                        score: engScore,
                        correctCount: engCorrect,
                        totalProblems: 20,
                        completed: engPageDone,
                        manuallyMarked: false,
                        timestamp: admin.firestore.Timestamp.fromDate(week.days[d]),
                        attempts: 1,
                        elapsedTime: `${4 + (d % 4)}:${String(15 + d * 5).padStart(2, '0')}`
                    });
                    batchCount++;
                    await commitIfNeeded();
                    if (engPageDone) {
                        engCompletedCount++;
                        // Count English stars for avatar.totalStarsEarned
                        if (engScore >= 95) totalStars += 3;
                        else if (engScore >= 85) totalStars += 2;
                        else totalStars += 1;
                    }
                }

                engPages.push({
                    pageIndex: engPageNum,
                    ageGroup,
                    difficulty,
                    completed: engPageDone,
                    score: engSkipped ? 0 : engScore
                });
            }

            const assignmentRef = db.collection('weekly_assignments')
                .doc(`${childId}_${week.weekStr}`);
            const completedPages = mathPages.filter(p => p.completed).length;
            batch.set(assignmentRef, {
                childId,
                childName: childDef.name,
                week: week.weekStr,
                weekStart: week.monday.toISOString(),
                weekEnd: weekEnd.toISOString(),
                status: completedPages === 7 ? 'completed'
                    : completedPages > 0 ? 'partial' : 'active',
                generatedBy: 'demo_seed',
                notificationSent: true,
                createdAt: admin.firestore.Timestamp.fromDate(week.monday),
                math: {
                    operation: childDef.operation,
                    difficulty,
                    ageGroup,
                    pages: mathPages,
                    completedCount: weekCompletedCount,
                    totalPages: 7
                },
                english: {
                    ageGroup,
                    difficulty,
                    pages: engPages,
                    completedCount: engCompletedCount,
                    totalPages: 7
                }
            });
            batchCount++;
            await commitIfNeeded();
        }

        // Add aptitude and stories completions for multi-module progress
        const extraModules = [
            { module: 'aptitude', types: ['patterns', 'sequences', 'matching', 'logic', 'counting'] },
            { module: 'stories', types: ['animals', 'adventures', 'family'] }
        ];
        for (const mod of extraModules) {
            const numPages = mod.module === 'aptitude' ? 8 : 4; // aptitude: more, stories: fewer
            for (let p = 0; p < numPages; p++) {
                const extraSeed = p + mod.types.length;
                const extraCorrect = Math.max(3, getCorrectCount(childDef.pattern, 0, p));
                if (extraCorrect === -1) continue;
                const extraScore = Math.round((extraCorrect / 20) * 100);
                const extraDone = extraScore >= 95;
                const extraType = mod.types[p % mod.types.length];
                const extraId = `${extraType}-${ageGroup}-page${p + 1}`;
                const extraRef = db.collection('completions')
                    .doc(`${childId}_${mod.module}_${extraId}`);
                // Spread timestamps across past 3 weeks
                const extraDate = new Date(weeks[Math.min(p % 3, weeks.length - 1)].monday);
                extraDate.setDate(extraDate.getDate() + (p % 7));
                extraDate.setHours(14 + (p % 4), p * 11 % 60, 0, 0);
                batch.set(extraRef, {
                    completionId: `${childId}_${mod.module}_${extraId}`,
                    childId,
                    module: mod.module,
                    identifier: extraId,
                    score: extraScore,
                    correctCount: extraCorrect,
                    totalProblems: 20,
                    completed: extraDone,
                    manuallyMarked: false,
                    timestamp: admin.firestore.Timestamp.fromDate(extraDate),
                    attempts: 1,
                    elapsedTime: `${2 + (p % 3)}:${String(20 + p * 3).padStart(2, '0')}`
                });
                // Count stars for extra modules
                if (extraDone) {
                    if (extraScore >= 95) totalStars += 3;
                    else if (extraScore >= 85) totalStars += 2;
                    else totalStars += 1;
                }
                batchCount++;
                await commitIfNeeded();
            }
        }

        // Create skill profile
        const skillProfile = {};
        for (const [skill, data] of Object.entries(skillData)) {
            skillProfile[skill] = {
                attempts: data.attempts,
                errors: data.errors,
                errorRate: data.attempts > 0 ? +(data.errors / data.attempts).toFixed(4) : 0,
                lastError: null,
                recentErrors: []
            };
        }

        const totalAttempted = Object.values(skillData)
            .reduce((sum, s) => sum + s.attempts, 0);
        const totalErrors = Object.values(skillData)
            .reduce((sum, s) => sum + s.errors, 0);

        const profileRef = db.collection('children').doc(childId)
            .collection('skill_profile').doc(childDef.operation);
        batch.set(profileRef, {
            skills: skillProfile,
            totalAttempted,
            totalErrors,
            overallErrorRate: totalAttempted > 0
                ? +(totalErrors / totalAttempted).toFixed(4) : 0,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        batchCount++;

        // Update child with accumulated stars
        batch.update(childRef, {
            'avatar.totalStarsEarned': totalStars
        });
        batchCount++;

        // Commit remaining writes for this child
        if (batchCount > 0) {
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
        }

        results.push({
            childId,
            name: childDef.name,
            pattern: childDef.pattern,
            operation: childDef.operation,
            level: childDef.level,
            theme: childDef.theme,
            totalPages: totalSolved / 20,
            accuracy: totalSolved > 0
                ? Math.round((totalCorrect / totalSolved) * 100) : 0,
            stars: totalStars
        });
    }

    return { success: true, children: results };
}

/**
 * Clear all demo children and their associated data.
 */
async function clearDemoData(callerUid) {
    const db = admin.firestore();

    const userDoc = await db.collection('users').doc(callerUid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admin can clear demo data');
    }

    const demoChildren = await db.collection('children')
        .where('parent_uid', '==', callerUid)
        .where('isDemo', '==', true)
        .get();

    if (demoChildren.empty) {
        return { success: true, message: 'No demo data to clear', deletedCount: 0 };
    }

    let deletedCount = 0;

    for (const childDoc of demoChildren.docs) {
        const childId = childDoc.id;
        let batch = db.batch();
        let batchCount = 0;

        async function commitIfNeeded() {
            if (batchCount >= 490) {
                await batch.commit();
                batch = db.batch();
                batchCount = 0;
            }
        }

        // Delete completions
        const completions = await db.collection('completions')
            .where('childId', '==', childId).get();
        for (const doc of completions.docs) {
            batch.delete(doc.ref);
            batchCount++;
            await commitIfNeeded();
        }

        // Delete weekly assignments
        const assignments = await db.collection('weekly_assignments')
            .where('childId', '==', childId).get();
        for (const doc of assignments.docs) {
            batch.delete(doc.ref);
            batchCount++;
            await commitIfNeeded();
        }

        // Delete skill profiles (subcollection)
        const profiles = await db.collection('children').doc(childId)
            .collection('skill_profile').get();
        for (const doc of profiles.docs) {
            batch.delete(doc.ref);
            batchCount++;
            await commitIfNeeded();
        }

        // Delete error logs (subcollection)
        const errorLogs = await db.collection('children').doc(childId)
            .collection('error_log').get();
        for (const doc of errorLogs.docs) {
            batch.delete(doc.ref);
            batchCount++;
            await commitIfNeeded();
        }

        // Delete adaptive worksheets
        const adaptive = await db.collection('adaptive_worksheets')
            .where('childId', '==', childId).get();
        for (const doc of adaptive.docs) {
            batch.delete(doc.ref);
            batchCount++;
            await commitIfNeeded();
        }

        // Delete notifications
        const notifications = await db.collection('notifications')
            .where('childId', '==', childId).get();
        for (const doc of notifications.docs) {
            batch.delete(doc.ref);
            batchCount++;
            await commitIfNeeded();
        }

        // Delete child document
        batch.delete(childDoc.ref);
        batchCount++;

        if (batchCount > 0) {
            await batch.commit();
        }

        deletedCount++;
    }

    return {
        success: true,
        message: `Cleared ${deletedCount} demo children and all associated data`,
        deletedCount
    };
}

// Cloud Function definitions
const seedDemoChildrenCF = onCall(
    { region: 'europe-west1', memory: '512MiB', timeoutSeconds: 120 },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }
        return seedDemoData(request.auth.uid);
    }
);

const clearDemoChildrenCF = onCall(
    { region: 'europe-west1', memory: '256MiB', timeoutSeconds: 60 },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }
        return clearDemoData(request.auth.uid);
    }
);

module.exports = {
    seedDemoChildrenCF,
    clearDemoChildrenCF,
    seedDemoData,
    clearDemoData,
    DEMO_CHILDREN,
    getCorrectCount
};
