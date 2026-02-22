/**
 * Assessment & Level Test Cloud Functions
 *
 * Server-side assessment validation and level advancement.
 * Prevents client-side manipulation of assessment scores and levels.
 *
 * Functions:
 *   - submitAssessment (callable)
 *   - submitLevelTest (callable)
 *   - checkLevelTestEligibility (callable)
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const {
    generateSeededAssessmentQuestions,
    generateSeededLevelTestQuestions,
    determineLevelFromScore,
    compareAnswers,
    getAgeGroupFromAge,
    ageAndDifficultyToLevel
} = require('./shared/math-engine');

const LEVEL_TEST_CONFIG = {
    MIN_WEEKS: 4,
    MIN_AVG_SCORE: 85,
    PASS_SCORE: 90,
    TOTAL_QUESTIONS: 10
};

// ============================================================================
// HELPER: Get week string
// ============================================================================

function getWeekString(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ============================================================================
// HELPER: Verify caller owns the child
// ============================================================================

async function verifyChildAccess(db, callerUid, childId) {
    const childDoc = await db.collection('children').doc(childId).get();
    if (!childDoc.exists) {
        throw new HttpsError('not-found', 'Child not found');
    }

    const childData = childDoc.data();
    const userDoc = await db.collection('users').doc(callerUid).get();
    const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

    if (childData.parent_uid !== callerUid && !isAdmin) {
        throw new HttpsError('permission-denied', 'Not authorized for this child');
    }

    return { childData, isAdmin };
}

// ============================================================================
// FUNCTION: submitAssessment
// ============================================================================

const submitAssessment = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, subject, operation, answers } = request.data;

        if (!childId || !operation || !Array.isArray(answers)) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, operation, answers');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Verify access
        const { childData } = await verifyChildAccess(db, callerUid, childId);

        const ageGroup = getAgeGroupFromAge(childData.age || 6);

        // Generate the same assessment questions server-side (deterministic by childId + operation)
        const questions = generateSeededAssessmentQuestions(operation, ageGroup, childId);

        if (questions.length === 0) {
            throw new HttpsError('internal', 'Failed to generate assessment questions');
        }

        // Grade answers
        let correct = 0;
        const feedback = [];

        for (let i = 0; i < questions.length; i++) {
            const correctAnswer = questions[i].answer;
            const userAnswer = i < answers.length ? answers[i] : null;

            let isCorrect = false;
            if (userAnswer !== null && userAnswer !== undefined && userAnswer !== '') {
                if (subject === 'english') {
                    isCorrect = String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase();
                } else {
                    isCorrect = Number(userAnswer) === Number(correctAnswer);
                }
            }

            if (isCorrect) correct++;
            feedback.push({ correct: isCorrect, expected: correctAnswer });
        }

        // Calculate score and determine level
        const scorePercentage = Math.round((correct / questions.length) * 100);
        const levelResult = determineLevelFromScore(scorePercentage, ageGroup);

        // Save assessment result to Firestore (server-authoritative)
        await db.collection('children').doc(childId).update({
            [`assessmentData.${operation}`]: {
                level: levelResult.level,
                score: scorePercentage,
                ageGroup: levelResult.ageGroup,
                difficulty: levelResult.difficulty,
                date: admin.firestore.FieldValue.serverTimestamp(),
                taken: true,
                validatedBy: 'server'
            },
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        logger.info(`Assessment validated: ${childId} ${operation} = ${scorePercentage}% -> Level ${levelResult.level}`);

        return {
            score: scorePercentage,
            correct,
            total: questions.length,
            level: levelResult.level,
            ageGroup: levelResult.ageGroup,
            difficulty: levelResult.difficulty,
            reason: levelResult.reason,
            feedback
        };
    }
);

// ============================================================================
// FUNCTION: checkLevelTestEligibility
// ============================================================================

const checkLevelTestEligibility = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, module } = request.data;

        if (!childId || !module) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, module');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Verify access
        const { childData } = await verifyChildAccess(db, callerUid, childId);

        // Get recent weekly assignments
        const assignments = await db.collection('weekly_assignments')
            .where('childId', '==', childId)
            .orderBy('createdAt', 'desc')
            .limit(8)
            .get();

        if (assignments.empty) {
            return { eligible: false, reason: 'No weekly assignments completed yet', weeksCompleted: 0 };
        }

        // Calculate completed weeks and average scores
        let completedWeeks = 0;
        let totalScore = 0;

        assignments.forEach(doc => {
            const a = doc.data();
            const moduleData = a[module];
            if (!moduleData || !moduleData.pages) return;

            const allDone = moduleData.completedCount >= moduleData.totalPages;
            if (!allDone) return;

            const scores = moduleData.pages
                .filter(p => p.completed && p.score > 0)
                .map(p => p.score);

            if (scores.length > 0) {
                const weekAvg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
                totalScore += weekAvg;
                completedWeeks++;
            }
        });

        const avgScore = completedWeeks > 0 ? Math.round(totalScore / completedWeeks) : 0;

        // Get current level from assessment data
        let currentLevel = 1;
        const operation = module === 'math' ? 'addition' : 'english';
        if (childData.assessmentData?.[operation]?.level) {
            currentLevel = childData.assessmentData[operation].level;
        }

        // Check max level
        const maxLevel = 12;
        if (currentLevel >= maxLevel) {
            return {
                eligible: false,
                reason: 'Already at maximum level!',
                weeksCompleted: completedWeeks,
                avgScore,
                currentLevel
            };
        }

        // Check minimum weeks
        if (completedWeeks < LEVEL_TEST_CONFIG.MIN_WEEKS) {
            return {
                eligible: false,
                reason: `Need ${LEVEL_TEST_CONFIG.MIN_WEEKS} completed weeks (have ${completedWeeks})`,
                weeksCompleted: completedWeeks,
                avgScore,
                currentLevel
            };
        }

        // Check minimum average score
        if (avgScore < LEVEL_TEST_CONFIG.MIN_AVG_SCORE) {
            return {
                eligible: false,
                reason: `Average score ${avgScore}% is below ${LEVEL_TEST_CONFIG.MIN_AVG_SCORE}% threshold`,
                weeksCompleted: completedWeeks,
                avgScore,
                currentLevel
            };
        }

        // Check if test already taken this week
        const weekStr = getWeekString(new Date());
        const recentTest = await db.collection('level_tests')
            .where('childId', '==', childId)
            .where('module', '==', module)
            .where('week', '==', weekStr)
            .limit(1)
            .get();

        if (!recentTest.empty) {
            const testData = recentTest.docs[0].data();
            return {
                eligible: false,
                reason: testData.passed
                    ? 'Already passed this week\'s test!'
                    : 'Already attempted this week. Try again next week.',
                weeksCompleted: completedWeeks,
                avgScore,
                currentLevel,
                lastTestScore: testData.score
            };
        }

        return {
            eligible: true,
            reason: 'Ready for level-up test!',
            weeksCompleted: completedWeeks,
            avgScore,
            currentLevel
        };
    }
);

// ============================================================================
// FUNCTION: submitLevelTest
// ============================================================================

const submitLevelTest = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, module, answers } = request.data;

        if (!childId || !module || !Array.isArray(answers)) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, module, answers');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Verify access
        const { childData } = await verifyChildAccess(db, callerUid, childId);

        // Verify eligibility first
        const ageGroup = getAgeGroupFromAge(childData.age || 6);
        const weekStr = getWeekString(new Date());

        // Determine operation
        const age = childData.age || 6;
        let operation = 'addition';
        if (age >= 9) operation = 'division';
        else if (age >= 8) operation = 'multiplication';
        else if (age >= 7) operation = 'subtraction';

        // Get current level
        let currentLevel = 1;
        const assessmentOp = module === 'math' ? operation : 'english';
        if (childData.assessmentData?.[assessmentOp]?.level) {
            currentLevel = childData.assessmentData[assessmentOp].level;
        }

        // Generate the same test questions server-side
        const questions = generateSeededLevelTestQuestions(operation, ageGroup, childId, weekStr);

        if (questions.length === 0) {
            throw new HttpsError('internal', 'Failed to generate test questions');
        }

        // Grade answers
        let correct = 0;
        const feedback = [];

        questions.forEach((q, idx) => {
            const userAnswer = idx < answers.length ? answers[idx] : null;
            let isCorrect = false;

            if (userAnswer !== null && userAnswer !== undefined && userAnswer !== '') {
                if (module === 'math') {
                    isCorrect = Number(userAnswer) === Number(q.answer);
                } else {
                    isCorrect = String(userAnswer).toLowerCase() === String(q.answer).toLowerCase();
                }
            }

            if (isCorrect) correct++;
            feedback.push({ correct: isCorrect, expected: q.answer, difficulty: q.difficulty });
        });

        const score = Math.round((correct / questions.length) * 100);
        const passed = score >= LEVEL_TEST_CONFIG.PASS_SCORE;
        const newLevel = passed ? currentLevel + 1 : currentLevel;

        // Save test result to Firestore (server-authoritative)
        await db.collection('level_tests').add({
            childId,
            module,
            operation,
            week: weekStr,
            currentLevel,
            newLevel,
            score,
            correct,
            total: questions.length,
            passed,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            validatedBy: 'server',
            questions: questions.map((q, idx) => ({
                difficulty: q.difficulty,
                answer: q.answer,
                userAnswer: idx < answers.length ? answers[idx] : null
            }))
        });

        // If passed, advance the child's level (server-authoritative)
        if (passed) {
            await db.collection('children').doc(childId).update({
                [`assessmentData.${assessmentOp}.level`]: newLevel,
                [`currentLevel.${module}`]: newLevel,
                [`levelHistory.${module}`]: admin.firestore.FieldValue.arrayUnion({
                    level: newLevel,
                    date: new Date().toISOString(),
                    source: 'level_test',
                    validatedBy: 'server'
                }),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });

            logger.info(`Level advanced: ${childId} ${module} ${currentLevel} -> ${newLevel}`);
        }

        logger.info(`Level test validated: ${childId} ${module} = ${score}% (${correct}/${questions.length}) passed=${passed}`);

        return {
            score,
            correct,
            total: questions.length,
            passed,
            currentLevel,
            newLevel,
            feedback
        };
    }
);

module.exports = {
    submitAssessment,
    submitLevelTest,
    checkLevelTestEligibility
};
