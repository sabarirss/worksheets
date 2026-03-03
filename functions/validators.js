/**
 * Answer Validation Cloud Functions
 *
 * Server-authoritative validation for Math, English, Aptitude, EQ, German modules.
 * Regenerates deterministic questions server-side, grades answers, writes to Firestore.
 *
 * Functions:
 *   - validateMathSubmission (callable)
 *   - validateEnglishSubmission (callable)
 *   - validateAptitudeSubmission (callable)
 *   - validateEQSubmission (callable)
 *   - validateGermanSubmission (callable)
 *   - validateGermanKidsSubmission (callable)
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const { generateAbsolutePageProblems, compareAnswers, getAgeGroupFromAge, levelToAgeGroup, classifyProblem } = require('./shared/math-engine');
const { logErrors, updateSkillProfile } = require('./error-tracker');

// Server-side engine for deterministic aptitude question generation & validation
const aptitudeEngine = require('./shared/aptitude-engine');

const COMPLETION_THRESHOLD = 95; // 95% to pass

// ============================================================================
// HELPER: Verify caller owns the child (or is admin)
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
// FUNCTION: validateMathSubmission
// ============================================================================

const validateMathSubmission = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, operation, absolutePage, answers, elapsedTime } = request.data;

        // Validate inputs
        const missing = [];
        if (!childId) missing.push('childId');
        if (!operation) missing.push('operation');
        if (!absolutePage) missing.push('absolutePage');
        if (!Array.isArray(answers)) missing.push('answers');
        if (missing.length > 0) {
            throw new HttpsError('invalid-argument', `Missing required fields: ${missing.join(', ')}`);
        }

        const validOperations = ['addition', 'subtraction', 'multiplication', 'division'];
        if (!validOperations.includes(operation)) {
            throw new HttpsError('invalid-argument', `Invalid operation: ${operation}`);
        }

        if (absolutePage < 1 || absolutePage > 150) {
            throw new HttpsError('invalid-argument', 'absolutePage must be between 1 and 150');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Verify access
        const { childData } = await verifyChildAccess(db, callerUid, childId);

        // Determine ageGroup from child's assessment-assigned level, NOT DOB
        // The client uses the assessed level to generate problems, so the server must match.
        // Assessment stores: { level: N, score: X, date: D, taken: true }
        const assessedLevel = childData.assessmentData?.[operation]?.level;
        const ageGroup = assessedLevel
            ? levelToAgeGroup(assessedLevel)
            : getAgeGroupFromAge(childData.age || 6);

        // Regenerate the SAME problems server-side (deterministic!)
        const { problems } = generateAbsolutePageProblems(operation, ageGroup, absolutePage);

        // Grade answers
        let correctCount = 0;
        const feedback = [];
        const totalProblems = problems.length;

        for (let i = 0; i < totalProblems; i++) {
            const correctAnswer = problems[i].answer;
            const userAnswer = i < answers.length ? answers[i] : null;
            const isCorrect = compareAnswers(userAnswer, correctAnswer);

            if (isCorrect) correctCount++;
            feedback.push({
                correct: isCorrect,
                expected: correctAnswer,
                userAnswer: userAnswer
            });
        }

        // Calculate score
        const score = Math.round((correctCount / totalProblems) * 100);
        const completed = score >= COMPLETION_THRESHOLD;

        // Build completion identifier
        const identifier = `${operation}-level${Math.ceil(absolutePage / 10)}-page${((absolutePage - 1) % 10) + 1}`;
        const childEmail = childData.email || `${childData.name}@child`;

        // Write to Firestore (server-authoritative)
        const completionId = `${childEmail}_math_${identifier}`;
        await db.collection('completions').doc(completionId).set({
            completionId,
            childId,
            childEmail,
            module: 'math',
            identifier,
            score,
            correctCount,
            totalProblems,
            completed,
            manuallyMarked: false,
            elapsedTime: elapsedTime || '00:00',
            attempts: admin.firestore.FieldValue.increment(1),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            validatedBy: 'server'
        }, { merge: true });

        // Update weekly assignment progress if applicable
        await updateWeeklyAssignmentProgress(db, childId, 'math', absolutePage, score, completed);

        // Adaptive Learning: Log errors and update skill profile
        try {
            await logErrors(db, childId, operation, absolutePage, ageGroup, problems, feedback);
            await updateSkillProfile(db, childId, operation, problems, feedback);
        } catch (trackingError) {
            logger.warn('Error tracking failed (non-fatal):', trackingError.message);
        }

        logger.info(`Math submission validated: ${childId} p${absolutePage} = ${score}% (${correctCount}/${totalProblems})`);

        return { score, correctCount, totalProblems, completed, feedback };
    }
);

// ============================================================================
// FUNCTION: validateAdaptiveSubmission
// Validates answers against stored adaptive worksheet problems (not seed-generated)
// ============================================================================

const validateAdaptiveSubmission = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, operation, pageNumber, answers, elapsedTime } = request.data;

        if (!childId || !operation || !pageNumber || !Array.isArray(answers)) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, operation, pageNumber, answers');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        const { childData } = await verifyChildAccess(db, callerUid, childId);

        // Find the current week's adaptive assignment
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        const weekStr = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

        const docId = `${childId}_${weekStr}`;
        const assignmentDoc = await db.collection('weekly_assignments').doc(docId).get();

        if (!assignmentDoc.exists) {
            throw new HttpsError('not-found', 'No weekly assignment found');
        }

        const assignment = assignmentDoc.data();
        if (!assignment.math || !assignment.math.adaptive) {
            throw new HttpsError('failed-precondition', 'Assignment is not adaptive');
        }

        // Find the page with stored problems
        const pageData = assignment.math.pages.find(p => p.pageNumber === pageNumber);
        if (!pageData || !pageData.problems) {
            throw new HttpsError('not-found', `Adaptive page ${pageNumber} not found`);
        }

        const problems = pageData.problems;

        // Grade answers against stored problems
        let correctCount = 0;
        const feedback = [];
        const totalProblems = problems.length;

        for (let i = 0; i < totalProblems; i++) {
            const correctAnswer = problems[i].answer;
            const userAnswer = i < answers.length ? answers[i] : null;
            const isCorrect = compareAnswers(userAnswer, correctAnswer);

            if (isCorrect) correctCount++;
            feedback.push({
                correct: isCorrect,
                expected: correctAnswer,
                userAnswer: userAnswer
            });
        }

        const score = Math.round((correctCount / totalProblems) * 100);
        const completed = score >= COMPLETION_THRESHOLD;

        // Build completion identifier for adaptive worksheets
        const identifier = `adaptive-${operation}-${weekStr}-page${pageNumber}`;
        const childEmail = childData.email || `${childData.name}@child`;

        const completionId = `${childEmail}_math_${identifier}`;
        await db.collection('completions').doc(completionId).set({
            completionId,
            childId,
            childEmail,
            module: 'math',
            identifier,
            score,
            correctCount,
            totalProblems,
            completed,
            manuallyMarked: false,
            elapsedTime: elapsedTime || '00:00',
            attempts: admin.firestore.FieldValue.increment(1),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            validatedBy: 'server',
            adaptive: true
        }, { merge: true });

        // Update weekly assignment progress
        await updateWeeklyAssignmentProgress(db, childId, 'math', pageNumber, score, completed);

        // Adaptive Learning: Log errors and update skill profile
        const ageGroup = assignment.math.ageGroup || getAgeGroupFromAge(childData.age || 6);
        try {
            await logErrors(db, childId, operation, pageNumber, ageGroup, problems, feedback);
            await updateSkillProfile(db, childId, operation, problems, feedback);
        } catch (trackingError) {
            logger.warn('Adaptive error tracking failed (non-fatal):', trackingError.message);
        }

        logger.info(`Adaptive submission validated: ${childId} ${operation} page${pageNumber} = ${score}% (${correctCount}/${totalProblems})`);

        return { score, correctCount, totalProblems, completed, feedback };
    }
);

// ============================================================================
// FUNCTION: validateEnglishSubmission
// ============================================================================

const validateEnglishSubmission = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, pageIndex, ageGroup, difficulty, manuallyMarked, elapsedTime } = request.data;

        if (!childId) {
            throw new HttpsError('invalid-argument', 'Missing childId');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Verify access
        const { childData } = await verifyChildAccess(db, callerUid, childId);

        const childEmail = childData.email || `${childData.name}@child`;
        const identifier = `${ageGroup || 'default'}-${difficulty || 'easy'}`;

        // English writing is manually marked (handwriting-based, no auto-grading)
        const score = manuallyMarked ? 100 : 0;
        const completed = manuallyMarked === true;

        const completionId = `${childEmail}_english_${identifier}`;
        await db.collection('completions').doc(completionId).set({
            completionId,
            childId,
            childEmail,
            module: 'english',
            identifier,
            score,
            correctCount: 0,
            totalProblems: 0,
            completed,
            manuallyMarked: manuallyMarked === true,
            elapsedTime: elapsedTime || '00:00',
            attempts: admin.firestore.FieldValue.increment(1),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            validatedBy: 'server'
        }, { merge: true });

        // Update weekly assignment progress
        if (pageIndex) {
            await updateWeeklyAssignmentProgress(db, childId, 'english', pageIndex, score, completed);
        }

        logger.info(`English submission validated: ${childId} ${identifier} = ${completed ? 'completed' : 'incomplete'}`);

        return { score, completed, manuallyMarked: manuallyMarked === true };
    }
);

// ============================================================================
// FUNCTION: validateAptitudeSubmission
// Server regenerates questions from aptitude-engine using seed — never trusts client answers
// ============================================================================

const validateAptitudeSubmission = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, problemType, difficulty, answers, seed, age, page, elapsedTime } = request.data;

        if (!childId || !problemType) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, problemType');
        }

        if (seed == null || age == null || page == null) {
            throw new HttpsError('invalid-argument', 'Missing required fields: seed, age, page');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Verify access
        const { childData } = await verifyChildAccess(db, callerUid, childId);
        const childEmail = childData.email || `${childData.name}@child`;

        // Server regenerates the SAME questions using the aptitude engine
        const validation = aptitudeEngine.validateAptitudeSubmission(
            problemType, age, seed, page, answers || []
        );

        const score = validation.percentage;
        const correctCount = validation.score;
        const evaluatedCount = validation.total;
        const completed = score >= COMPLETION_THRESHOLD;

        const usedDifficulty = difficulty || 'easy';
        const identifier = `${problemType}-${usedDifficulty}`;
        const completionId = `${childEmail}_aptitude_${identifier}`;

        await db.collection('completions').doc(completionId).set({
            completionId,
            childId,
            childEmail,
            module: 'aptitude',
            identifier,
            score,
            correctCount,
            totalProblems: evaluatedCount,
            completed,
            manuallyMarked: false,
            elapsedTime: elapsedTime || '00:00',
            attempts: admin.firestore.FieldValue.increment(1),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            validatedBy: 'server'
        }, { merge: true });

        logger.info(`Aptitude submission validated: ${childId} ${identifier} = ${score}% (${correctCount}/${evaluatedCount})`);

        return { score, correctCount, totalProblems: evaluatedCount, completed };
    }
);

// ============================================================================
// FUNCTION: validateEQSubmission
// Records EQ completion scores to Firestore
// ============================================================================

const validateEQSubmission = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, difficulty, score: clientScore, correctCount: clientCorrect,
                totalProblems: clientTotal, elapsedTime } = request.data;

        if (!childId || !difficulty) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, difficulty');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        const { childData } = await verifyChildAccess(db, callerUid, childId);
        const childEmail = childData.email || `${childData.name}@child`;

        const score = clientScore || 0;
        const correctCount = clientCorrect || 0;
        const evaluatedCount = clientTotal || 0;
        const completed = score >= COMPLETION_THRESHOLD;

        const identifier = `eq-${difficulty}`;
        const completionId = `${childEmail}_eq_${identifier}`;

        await db.collection('completions').doc(completionId).set({
            completionId,
            childId,
            childEmail,
            module: 'emotional-quotient',
            identifier,
            score,
            correctCount,
            totalProblems: evaluatedCount,
            completed,
            manuallyMarked: false,
            elapsedTime: elapsedTime || '00:00',
            attempts: admin.firestore.FieldValue.increment(1),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            validatedBy: 'server'
        }, { merge: true });

        logger.info(`EQ submission recorded: ${childId} ${identifier} = ${score}% (${correctCount}/${evaluatedCount})`);

        return { score, correctCount, totalProblems: evaluatedCount, completed };
    }
);

// ============================================================================
// FUNCTION: validateGermanSubmission
// Records German B1 completion scores to Firestore
// ============================================================================

const validateGermanSubmission = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, level, score: clientScore, correctCount: clientCorrect,
                totalProblems: clientTotal, elapsedTime } = request.data;

        if (!childId || !level) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, level');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        const { childData } = await verifyChildAccess(db, callerUid, childId);
        const childEmail = childData.email || `${childData.name}@child`;

        const score = clientScore || 0;
        const completed = score >= COMPLETION_THRESHOLD;

        const identifier = `german-${level}`;
        const completionId = `${childEmail}_german_${identifier}`;

        await db.collection('completions').doc(completionId).set({
            completionId,
            childId,
            childEmail,
            module: 'german',
            identifier,
            score,
            correctCount: clientCorrect || 0,
            totalProblems: clientTotal || 0,
            completed,
            manuallyMarked: false,
            elapsedTime: elapsedTime || '00:00',
            attempts: admin.firestore.FieldValue.increment(1),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            validatedBy: 'server'
        }, { merge: true });

        logger.info(`German submission recorded: ${childId} ${identifier} = ${score}%`);

        return { score, completed };
    }
);

// ============================================================================
// FUNCTION: validateGermanKidsSubmission
// Records German Kids story completion scores to Firestore
// ============================================================================

const validateGermanKidsSubmission = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, difficulty, storyIndex, score: clientScore,
                correctCount: clientCorrect, totalProblems: clientTotal, elapsedTime } = request.data;

        if (!childId || !difficulty || storyIndex == null) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, difficulty, storyIndex');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        const { childData } = await verifyChildAccess(db, callerUid, childId);
        const childEmail = childData.email || `${childData.name}@child`;

        const score = clientScore || 0;
        const correctCount = clientCorrect || 0;
        const evaluatedCount = clientTotal || 0;
        const completed = score >= COMPLETION_THRESHOLD;

        const identifier = `german-kids-${difficulty}-story${storyIndex}`;
        const completionId = `${childEmail}_german-kids_${identifier}`;

        await db.collection('completions').doc(completionId).set({
            completionId,
            childId,
            childEmail,
            module: 'german-kids',
            identifier,
            score,
            correctCount,
            totalProblems: evaluatedCount,
            completed,
            manuallyMarked: false,
            elapsedTime: elapsedTime || '00:00',
            attempts: admin.firestore.FieldValue.increment(1),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            validatedBy: 'server'
        }, { merge: true });

        logger.info(`German Kids submission recorded: ${childId} ${identifier} = ${score}% (${correctCount}/${evaluatedCount})`);

        return { score, correctCount, totalProblems: evaluatedCount, completed };
    }
);

// ============================================================================
// HELPER: Update weekly assignment progress
// ============================================================================

async function updateWeeklyAssignmentProgress(db, childId, module, pageNumber, score, completed) {
    try {
        // Get current week string
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        const weekStr = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

        const docId = `${childId}_${weekStr}`;
        const assignmentRef = db.collection('weekly_assignments').doc(docId);
        const assignmentDoc = await assignmentRef.get();

        if (!assignmentDoc.exists) return;

        const assignment = assignmentDoc.data();
        const moduleData = assignment[module];
        if (!moduleData || !moduleData.pages) return;

        // Find and update the matching page
        let updated = false;
        const isAdaptive = moduleData.adaptive === true;
        const updatedPages = moduleData.pages.map(page => {
            const pageKey = isAdaptive ? 'pageNumber' : (module === 'math' ? 'absolutePage' : 'pageIndex');
            if (page[pageKey] === pageNumber && completed && !page.completed) {
                updated = true;
                return { ...page, completed: true, score };
            }
            return page;
        });

        if (updated) {
            const completedCount = updatedPages.filter(p => p.completed).length;
            const allDone = completedCount >= updatedPages.length;

            await assignmentRef.update({
                [`${module}.pages`]: updatedPages,
                [`${module}.completedCount`]: completedCount,
                status: allDone && module === 'math' ? 'completed' : assignment.status
            });

            logger.info(`Updated weekly assignment: ${docId} ${module} page ${pageNumber} completed`);
        }
    } catch (error) {
        logger.error('Error updating weekly assignment:', error);
        // Non-fatal: don't throw, the main validation still succeeded
    }
}

module.exports = {
    validateMathSubmission,
    validateAdaptiveSubmission,
    validateEnglishSubmission,
    validateAptitudeSubmission,
    validateEQSubmission,
    validateGermanSubmission,
    validateGermanKidsSubmission
};
