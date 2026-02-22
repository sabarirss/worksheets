/**
 * Answer Validation Cloud Functions
 *
 * Server-authoritative validation for Math, English, and Aptitude modules.
 * Regenerates deterministic questions server-side, grades answers, writes to Firestore.
 *
 * Functions:
 *   - validateMathSubmission (callable)
 *   - validateEnglishSubmission (callable)
 *   - validateAptitudeSubmission (callable)
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const { generateAbsolutePageProblems, compareAnswers, getAgeGroupFromAge } = require('./shared/math-engine');

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
        if (!childId || !operation || !absolutePage || !Array.isArray(answers)) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, operation, absolutePage, answers');
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

        // Determine ageGroup from child's assessment or DOB
        const ageGroup = childData.assessmentData?.[operation]?.ageGroup
            || getAgeGroupFromAge(childData.age || 6);

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

        logger.info(`Math submission validated: ${childId} p${absolutePage} = ${score}% (${correctCount}/${totalProblems})`);

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
// ============================================================================

const validateAptitudeSubmission = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, problemType, difficulty, answers, problemData, elapsedTime } = request.data;

        if (!childId || !problemType || !difficulty) {
            throw new HttpsError('invalid-argument', 'Missing required fields: childId, problemType, difficulty');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Verify access
        const { childData } = await verifyChildAccess(db, callerUid, childId);
        const childEmail = childData.email || `${childData.name}@child`;

        // Aptitude uses different answer types per problem type
        let correctCount = 0;
        let evaluatedCount = 0;

        if (Array.isArray(answers) && Array.isArray(problemData)) {
            for (let i = 0; i < problemData.length; i++) {
                const problem = problemData[i];
                const userAnswer = i < answers.length ? answers[i] : null;

                // Skip logic-type problems (manual review)
                if (problem.type === 'logic') continue;

                // Maze: any completion counts
                if (problem.type === 'maze') {
                    if (userAnswer === 'completed') correctCount++;
                    evaluatedCount++;
                    continue;
                }

                // Button-based and counting: compare answer
                evaluatedCount++;
                if (userAnswer !== null && userAnswer !== undefined && userAnswer !== '') {
                    if (String(userAnswer).trim() === String(problem.answer).trim()) {
                        correctCount++;
                    }
                }
            }
        }

        const score = evaluatedCount > 0 ? Math.round((correctCount / evaluatedCount) * 100) : 0;
        const completed = score >= COMPLETION_THRESHOLD;

        const identifier = `${problemType}-${difficulty}`;
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
        const updatedPages = moduleData.pages.map(page => {
            const pageKey = module === 'math' ? 'absolutePage' : 'pageIndex';
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
    validateEnglishSubmission,
    validateAptitudeSubmission
};
