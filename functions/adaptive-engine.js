/**
 * Adaptive Learning Engine — Core Worksheet Generation
 *
 * Reads a child's skill_profile and generates personalized worksheets
 * targeting weak areas with a 60/30/10 distribution (weak/medium/strong).
 *
 * Firestore paths:
 *   children/{childId}/skill_profile/{operation} — input (skill stats)
 *   adaptive_worksheets/{auto-id}               — output (generated worksheets)
 *
 * Called by:
 *   - Admin manually via generateAdaptiveWorksheet callable
 *   - scheduledWeeklyGeneration (Phase 4)
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const { generateProblemBySkill, classifyProblem, hashCode, levelToAgeGroup, getAgeGroupFromAge } = require('./shared/math-engine');
const { bootstrapSkillProfile } = require('./synthetic-students');

// Distribution: what percentage of problems target each skill bucket
const DISTRIBUTION = {
    weak: 0.60,     // 60% of problems target weak skills
    medium: 0.30,   // 30% target medium skills
    strong: 0.10    // 10% target strong skills (maintenance)
};

// Thresholds for classifying skills
const THRESHOLDS = {
    weak: 0.30,     // errorRate > 30% = weak
    medium: 0.10    // errorRate > 10% = medium, <= 10% = strong
};

const PROBLEMS_PER_PAGE = 20;
const PAGES_PER_WEEK = 7;

// ============================================================================
// CORE: Classify skills into buckets based on error rates
// ============================================================================

/**
 * Classify skills from a skill_profile into weak/medium/strong buckets.
 * @param {Object} skills - The skills map from skill_profile document
 * @returns {{ weak: string[], medium: string[], strong: string[], untested: string[] }}
 */
function classifySkillBuckets(skills) {
    const buckets = { weak: [], medium: [], strong: [], untested: [] };

    for (const [skill, data] of Object.entries(skills)) {
        if (!data.attempts || data.attempts < 3) {
            buckets.untested.push(skill);
        } else if (data.errorRate > THRESHOLDS.weak) {
            buckets.weak.push(skill);
        } else if (data.errorRate > THRESHOLDS.medium) {
            buckets.medium.push(skill);
        } else {
            buckets.strong.push(skill);
        }
    }

    return buckets;
}

// ============================================================================
// CORE: Generate adaptive worksheet pages
// ============================================================================

/**
 * Generate a full week of adaptive worksheet pages.
 *
 * @param {string} operation - 'addition', etc.
 * @param {string} ageGroup - '4-5', '6', etc.
 * @param {Object} skillProfile - The skill_profile document data
 * @param {string} baseSeed - Base seed string for deterministic generation
 * @returns {{ pages: Array, reasoning: Object }}
 */
function generateAdaptivePages(operation, ageGroup, skillProfile, baseSeed) {
    const skills = skillProfile.skills || {};
    const buckets = classifySkillBuckets(skills);

    // Merge untested into medium (give them moderate exposure)
    const effectiveMedium = [...buckets.medium, ...buckets.untested];

    // If no weak skills, redistribute
    const hasWeak = buckets.weak.length > 0;
    const hasMedium = effectiveMedium.length > 0;
    const hasStrong = buckets.strong.length > 0;

    // Calculate per-page problem distribution
    const weakCount = hasWeak ? Math.round(PROBLEMS_PER_PAGE * DISTRIBUTION.weak) : 0;
    const mediumCount = hasMedium ? Math.round(PROBLEMS_PER_PAGE * DISTRIBUTION.medium) : 0;
    const strongCount = PROBLEMS_PER_PAGE - weakCount - mediumCount;

    // Redistribute if a bucket is empty
    let finalWeak = weakCount, finalMedium = mediumCount, finalStrong = strongCount;
    if (!hasWeak) {
        finalMedium += finalWeak;
        finalWeak = 0;
    }
    if (!hasMedium) {
        finalStrong += finalMedium;
        finalMedium = 0;
    }
    if (!hasStrong && hasMedium) {
        finalMedium += finalStrong;
        finalStrong = 0;
    }

    const pages = [];

    for (let pageNum = 1; pageNum <= PAGES_PER_WEEK; pageNum++) {
        const problems = [];
        const pageSeed = hashCode(`${baseSeed}-page${pageNum}`);
        let seedCounter = 0;

        // Generate weak-targeted problems
        for (let i = 0; i < finalWeak; i++) {
            const skill = buckets.weak[i % buckets.weak.length];
            const problem = generateProblemBySkill(operation, ageGroup, skill, pageSeed + seedCounter);
            if (problem) {
                problems.push({
                    a: problem.a,
                    b: problem.b,
                    answer: problem.answer,
                    skills: problem.skills,
                    targetBucket: 'weak'
                });
            }
            seedCounter++;
        }

        // Generate medium-targeted problems
        for (let i = 0; i < finalMedium; i++) {
            const skill = effectiveMedium.length > 0
                ? effectiveMedium[i % effectiveMedium.length]
                : buckets.weak.length > 0
                    ? buckets.weak[i % buckets.weak.length]
                    : null;
            if (skill) {
                const problem = generateProblemBySkill(operation, ageGroup, skill, pageSeed + seedCounter);
                if (problem) {
                    problems.push({
                        a: problem.a,
                        b: problem.b,
                        answer: problem.answer,
                        skills: problem.skills,
                        targetBucket: 'medium'
                    });
                }
            }
            seedCounter++;
        }

        // Generate strong-targeted problems (maintenance)
        for (let i = 0; i < finalStrong; i++) {
            const pool = hasStrong ? buckets.strong : (hasMedium ? effectiveMedium : buckets.weak);
            if (pool.length > 0) {
                const skill = pool[i % pool.length];
                const problem = generateProblemBySkill(operation, ageGroup, skill, pageSeed + seedCounter);
                if (problem) {
                    problems.push({
                        a: problem.a,
                        b: problem.b,
                        answer: problem.answer,
                        skills: problem.skills,
                        targetBucket: 'strong'
                    });
                }
            }
            seedCounter++;
        }

        // Deterministic shuffle
        const shuffleSeed = pageSeed + 99999;
        let shuffleState = shuffleSeed;
        for (let i = problems.length - 1; i > 0; i--) {
            shuffleState = (shuffleState * 9301 + 49297) % 233280;
            const j = Math.floor((shuffleState / 233280) * (i + 1));
            [problems[i], problems[j]] = [problems[j], problems[i]];
        }

        pages.push({
            pageNumber: pageNum,
            problems
        });
    }

    // Build reasoning metadata
    const reasoning = {
        weakSkills: buckets.weak.map(s => ({
            skill: s,
            errorRate: skills[s]?.errorRate || 0,
            attempts: skills[s]?.attempts || 0,
            problemCount: finalWeak > 0 ? Math.ceil(finalWeak / Math.max(buckets.weak.length, 1)) : 0
        })),
        mediumSkills: effectiveMedium.map(s => ({
            skill: s,
            errorRate: skills[s]?.errorRate || 0,
            attempts: skills[s]?.attempts || 0
        })),
        strongSkills: buckets.strong.map(s => ({
            skill: s,
            errorRate: skills[s]?.errorRate || 0,
            attempts: skills[s]?.attempts || 0
        })),
        totalProblems: pages.reduce((sum, p) => sum + p.problems.length, 0),
        distribution: {
            weak: finalWeak * PAGES_PER_WEEK,
            medium: finalMedium * PAGES_PER_WEEK,
            strong: finalStrong * PAGES_PER_WEEK
        },
        profileSummary: {
            totalAttempted: skillProfile.totalAttempted || 0,
            totalErrors: skillProfile.totalErrors || 0,
            overallErrorRate: skillProfile.overallErrorRate || 0
        }
    };

    return { pages, reasoning };
}

// ============================================================================
// CLOUD FUNCTION: generateAdaptiveWorksheet (callable, admin-only)
// ============================================================================

const generateAdaptiveWorksheetCF = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, operation, week } = request.data;

        if (!childId || !operation) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, operation');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Verify admin access
        const userDoc = await db.collection('users').doc(callerUid).get();
        const isAdmin = userDoc.exists && userDoc.data().role === 'admin';
        if (!isAdmin) {
            throw new HttpsError('permission-denied', 'Admin access required');
        }

        // Get child data
        const childDoc = await db.collection('children').doc(childId).get();
        if (!childDoc.exists) {
            throw new HttpsError('not-found', 'Child not found');
        }
        const childData = childDoc.data();

        // Determine age group from assessment level
        const assessedLevel = childData.assessmentData?.[operation]?.level;
        const ageGroup = assessedLevel
            ? levelToAgeGroup(assessedLevel)
            : getAgeGroupFromAge(childData.age || 6);

        // Load skill profile (or bootstrap from archetype if insufficient data)
        const profileDoc = await db.collection('children').doc(childId)
            .collection('skill_profile').doc(operation).get();

        let skillProfile;
        let wasBootstrapped = false;

        if (!profileDoc.exists || (profileDoc.data().totalAttempted || 0) < 20) {
            // Bootstrap from closest archetype using assessment data
            const assessmentScore = childData.assessmentData?.[operation]?.score || 50;
            const assessmentLevel = childData.assessmentData?.[operation]?.level || 1;

            skillProfile = bootstrapSkillProfile(operation, {
                score: assessmentScore,
                level: assessmentLevel
            }, ageGroup);

            if (!skillProfile) {
                throw new HttpsError('failed-precondition',
                    'Could not bootstrap skill profile: no matching archetype found');
            }

            wasBootstrapped = true;
            logger.info(`Bootstrapped skill profile for ${childId} from archetype ${skillProfile.bootstrapArchetype}`);
        } else {
            skillProfile = profileDoc.data();
        }
        const weekStr = week || getCurrentWeekStr();
        const baseSeed = `adaptive-${childId}-${operation}-${weekStr}`;

        // Generate adaptive pages
        const { pages, reasoning } = generateAdaptivePages(operation, ageGroup, skillProfile, baseSeed);

        // Store in Firestore
        const worksheetRef = await db.collection('adaptive_worksheets').add({
            childId,
            childName: childData.name || 'Unknown',
            operation,
            ageGroup,
            week: weekStr,
            status: 'pending_review',
            pages,
            reasoning,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            generatedBy: wasBootstrapped ? 'adaptive-engine-bootstrapped' : 'adaptive-engine',
            bootstrapArchetype: wasBootstrapped ? skillProfile.bootstrapArchetype : null,
            reviewedAt: null,
            reviewedBy: null,
            adminNotes: null,
            deliveredAt: null
        });

        logger.info(`Adaptive worksheet generated: ${worksheetRef.id} for child ${childId} (${operation})`);

        return {
            worksheetId: worksheetRef.id,
            reasoning,
            pageCount: pages.length,
            totalProblems: reasoning.totalProblems
        };
    }
);

// ============================================================================
// CLOUD FUNCTION: approveAdaptiveWorksheet (callable, admin-only)
// ============================================================================

const approveAdaptiveWorksheetCF = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { worksheetId, adminNotes } = request.data;
        if (!worksheetId) {
            throw new HttpsError('invalid-argument', 'Missing worksheetId');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Verify admin
        const userDoc = await db.collection('users').doc(callerUid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            throw new HttpsError('permission-denied', 'Admin access required');
        }

        const worksheetRef = db.collection('adaptive_worksheets').doc(worksheetId);
        const worksheetDoc = await worksheetRef.get();
        if (!worksheetDoc.exists) {
            throw new HttpsError('not-found', 'Worksheet not found');
        }

        const worksheet = worksheetDoc.data();
        if (worksheet.status !== 'pending_review') {
            throw new HttpsError('failed-precondition', `Worksheet is ${worksheet.status}, not pending_review`);
        }

        // Update status
        await worksheetRef.update({
            status: 'approved',
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
            reviewedBy: userDoc.data().email || callerUid,
            adminNotes: adminNotes || null
        });

        // Deliver as weekly assignment
        await deliverApprovedWorksheet(db, worksheet, worksheetId);

        // Create notification
        const dedup = `adaptive_ready_${worksheet.childId}_${worksheet.week}_${worksheet.operation}`;
        await db.collection('notifications').doc(dedup).set({
            type: 'adaptive_worksheet_ready',
            childId: worksheet.childId,
            parentUid: null, // will be resolved by client
            message: `New personalized ${worksheet.operation} worksheets ready for ${worksheet.childName}!`,
            week: worksheet.week,
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        logger.info(`Adaptive worksheet approved: ${worksheetId}`);
        return { success: true, worksheetId };
    }
);

// ============================================================================
// CLOUD FUNCTION: rejectAdaptiveWorksheet (callable, admin-only)
// ============================================================================

const rejectAdaptiveWorksheetCF = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { worksheetId, adminNotes } = request.data;
        if (!worksheetId) {
            throw new HttpsError('invalid-argument', 'Missing worksheetId');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        const userDoc = await db.collection('users').doc(callerUid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            throw new HttpsError('permission-denied', 'Admin access required');
        }

        const worksheetRef = db.collection('adaptive_worksheets').doc(worksheetId);
        const worksheetDoc = await worksheetRef.get();
        if (!worksheetDoc.exists) {
            throw new HttpsError('not-found', 'Worksheet not found');
        }

        await worksheetRef.update({
            status: 'rejected',
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
            reviewedBy: userDoc.data().email || callerUid,
            adminNotes: adminNotes || 'Rejected by admin'
        });

        logger.info(`Adaptive worksheet rejected: ${worksheetId}`);
        return { success: true, worksheetId };
    }
);

// ============================================================================
// HELPER: Deliver approved worksheet as weekly assignment
// ============================================================================

async function deliverApprovedWorksheet(db, worksheet, worksheetId) {
    const docId = `${worksheet.childId}_${worksheet.week}`;

    const assignment = {
        childId: worksheet.childId,
        childName: worksheet.childName,
        week: worksheet.week,
        math: {
            operation: worksheet.operation,
            ageGroup: worksheet.ageGroup,
            adaptive: true,
            pages: worksheet.pages.map((p, i) => ({
                pageNumber: i + 1,
                problems: p.problems,
                completed: false,
                score: 0
            })),
            completedCount: 0,
            totalPages: worksheet.pages.length
        },
        status: 'active',
        generatedBy: 'adaptive-engine',
        adaptiveWorksheetId: worksheetId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('weekly_assignments').doc(docId).set(assignment, { merge: true });

    // Update adaptive worksheet status to delivered
    await db.collection('adaptive_worksheets').doc(worksheetId).update({
        status: 'delivered',
        deliveredAt: admin.firestore.FieldValue.serverTimestamp()
    });
}

// ============================================================================
// HELPER: Get current week string
// ============================================================================

function getCurrentWeekStr() {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Cloud Functions
    generateAdaptiveWorksheetCF,
    approveAdaptiveWorksheetCF,
    rejectAdaptiveWorksheetCF,

    // Pure functions (for testing)
    classifySkillBuckets,
    generateAdaptivePages,
    deliverApprovedWorksheet,
    DISTRIBUTION,
    THRESHOLDS,
    PROBLEMS_PER_PAGE,
    PAGES_PER_WEEK
};
