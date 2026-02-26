/**
 * Error Tracker — Adaptive Learning Foundation
 *
 * Logs per-problem errors and maintains aggregated skill profiles.
 * Called by validators.js after each math submission.
 *
 * Firestore paths:
 *   children/{childId}/error_log/{auto-id}     — per-submission error details
 *   children/{childId}/skill_profile/{operation} — aggregated skill stats
 */

const { classifyProblem, classifyError } = require('./shared/math-engine');

/**
 * Log per-problem errors for a submission.
 * Only stores incorrect answers to minimize document size.
 *
 * @param {Firestore} db
 * @param {string} childId
 * @param {string} operation
 * @param {number} absolutePage
 * @param {string} ageGroup
 * @param {Array} problems - Generated problems with { a, b, answer }
 * @param {Array} feedback - Grading results with { correct, expected, userAnswer }
 */
async function logErrors(db, childId, operation, absolutePage, ageGroup, problems, feedback) {
    const errors = [];

    for (let i = 0; i < feedback.length; i++) {
        if (!feedback[i].correct) {
            const p = problems[i];
            errors.push({
                problemIndex: i,
                a: p.a,
                b: p.b,
                correctAnswer: p.answer,
                userAnswer: feedback[i].userAnswer,
                skills: classifyProblem(operation, p.a, p.b, p.answer),
                errorPatterns: classifyError(operation, p.a, p.b, p.answer, feedback[i].userAnswer)
            });
        }
    }

    // Determine difficulty from absolute page
    let difficulty = 'easy';
    if (absolutePage > 100) difficulty = 'hard';
    else if (absolutePage > 50) difficulty = 'medium';

    const correctCount = feedback.filter(f => f.correct).length;
    const score = Math.round((correctCount / feedback.length) * 100);

    await db.collection('children').doc(childId)
        .collection('error_log').add({
            operation,
            absolutePage,
            ageGroup,
            difficulty,
            score,
            correctCount,
            totalProblems: feedback.length,
            errorCount: errors.length,
            errors,
            timestamp: require('firebase-admin').firestore.FieldValue.serverTimestamp()
        });
}

/**
 * Update the aggregated skill profile for a child's operation.
 * Increments attempt/error counters and maintains recent error examples.
 *
 * @param {Firestore} db
 * @param {string} childId
 * @param {string} operation
 * @param {Array} problems - Generated problems
 * @param {Array} feedback - Grading results
 */
async function updateSkillProfile(db, childId, operation, problems, feedback) {
    const profileRef = db.collection('children').doc(childId)
        .collection('skill_profile').doc(operation);

    const FieldValue = require('firebase-admin').firestore.FieldValue;

    // Classify all problems and tally per-skill attempts/errors
    const skillTally = {};
    const errorPatternTally = {};

    for (let i = 0; i < problems.length; i++) {
        const p = problems[i];
        const skills = classifyProblem(operation, p.a, p.b, p.answer);
        const isError = !feedback[i].correct;

        for (const skill of skills) {
            if (!skillTally[skill]) {
                skillTally[skill] = { attempts: 0, errors: 0, errorExample: null };
            }
            skillTally[skill].attempts++;
            if (isError) {
                skillTally[skill].errors++;
                skillTally[skill].errorExample = {
                    a: p.a,
                    b: p.b,
                    correctAnswer: p.answer,
                    userAnswer: feedback[i].userAnswer,
                    date: new Date().toISOString().split('T')[0]
                };
            }
        }

        // Track error patterns (how the child got it wrong)
        if (isError) {
            const errPatterns = classifyError(operation, p.a, p.b, p.answer, feedback[i].userAnswer);
            for (const pattern of errPatterns) {
                if (!errorPatternTally[pattern]) {
                    errorPatternTally[pattern] = { count: 0, examples: [] };
                }
                errorPatternTally[pattern].count++;
                if (errorPatternTally[pattern].examples.length < 3) {
                    errorPatternTally[pattern].examples.push({
                        a: p.a, b: p.b,
                        correct: p.answer,
                        wrote: feedback[i].userAnswer
                    });
                }
            }
        }
    }

    // Read current profile to merge
    const profileDoc = await profileRef.get();
    const currentProfile = profileDoc.exists ? profileDoc.data() : { skills: {}, totalAttempted: 0, totalErrors: 0 };

    const skills = currentProfile.skills || {};
    let totalAttempted = currentProfile.totalAttempted || 0;
    let totalErrors = currentProfile.totalErrors || 0;

    for (const [skill, tally] of Object.entries(skillTally)) {
        const existing = skills[skill] || { attempts: 0, errors: 0, recentErrors: [] };

        const newAttempts = existing.attempts + tally.attempts;
        const newErrors = existing.errors + tally.errors;

        // Maintain recent errors (keep last 5)
        let recentErrors = existing.recentErrors || [];
        if (tally.errorExample) {
            recentErrors = [tally.errorExample, ...recentErrors].slice(0, 5);
        }

        skills[skill] = {
            attempts: newAttempts,
            errors: newErrors,
            errorRate: newAttempts > 0 ? Math.round((newErrors / newAttempts) * 100) / 100 : 0,
            lastError: tally.errors > 0 ? FieldValue.serverTimestamp() : (existing.lastError || null),
            recentErrors
        };

        totalAttempted += tally.attempts;
        totalErrors += tally.errors;
    }

    // Merge error patterns into profile
    const existingPatterns = currentProfile.errorPatterns || {};
    for (const [pattern, tally] of Object.entries(errorPatternTally)) {
        const existing = existingPatterns[pattern] || { count: 0, recentExamples: [] };
        existingPatterns[pattern] = {
            count: existing.count + tally.count,
            recentExamples: [...tally.examples, ...(existing.recentExamples || [])].slice(0, 5)
        };
    }

    await profileRef.set({
        skills,
        errorPatterns: existingPatterns,
        totalAttempted,
        totalErrors,
        overallErrorRate: totalAttempted > 0 ? Math.round((totalErrors / totalAttempted) * 100) / 100 : 0,
        lastUpdated: FieldValue.serverTimestamp()
    }, { merge: true });
}

module.exports = { logErrors, updateSkillProfile };
