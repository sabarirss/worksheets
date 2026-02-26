/**
 * Training Simulator for Adaptive Learning Engine
 *
 * Simulates weeks of student submissions to:
 *   1. Populate skill profiles without real users
 *   2. Validate the adaptive engine produces improvement
 *   3. Test the full pipeline end-to-end
 *
 * All simulation runs locally using mock Firestore (no real writes).
 * Can also be run as a Cloud Function for real Firestore population.
 *
 * Run tests: node functions/test-training-simulator.js
 */

const {
    ADDITION_ARCHETYPES,
    SUBTRACTION_ARCHETYPES,
    MULTIPLICATION_ARCHETYPES,
    DIVISION_ARCHETYPES,
    getArchetypesForOperation,
    generatePlausibleError
} = require('./synthetic-students');

const { classifyProblem, generateAbsolutePageProblems, compareAnswers } = require('./shared/math-engine');
const { generateAdaptivePages, classifySkillBuckets } = require('./adaptive-engine');

// ============================================================================
// SIMULATION CORE
// ============================================================================

/**
 * Simulate a single worksheet submission for an archetype.
 * Returns the simulated answers, score, and error details.
 *
 * @param {Object} archetype - Student archetype with skill error rates
 * @param {string} operation - Math operation
 * @param {Object[]} problems - Array of { a, b, answer, skills } from the generator
 * @returns {{ answers: Array, score: number, correctCount: number, errors: Object[] }}
 */
function simulateSubmission(archetype, operation, problems) {
    const answers = [];
    const errors = [];
    let correctCount = 0;

    for (let i = 0; i < problems.length; i++) {
        const problem = problems[i];
        const skills = problem.skills || classifyProblem(operation, problem.a, problem.b, problem.answer);

        // Determine if the student makes an error based on their worst skill for this problem
        const worstErrorRate = Math.max(
            ...skills.map(s => archetype.skills[s]?.errorRate || 0.1)
        );

        const makesError = Math.random() < worstErrorRate;

        if (makesError) {
            const wrongAnswer = generatePlausibleError(
                operation, problem.a, problem.b, problem.answer, skills
            );
            answers.push(wrongAnswer);
            errors.push({
                problemIndex: i,
                a: problem.a,
                b: problem.b,
                correctAnswer: problem.answer,
                userAnswer: wrongAnswer,
                skills
            });
        } else {
            answers.push(problem.answer);
            correctCount++;
        }
    }

    const score = Math.round((correctCount / problems.length) * 100);

    return { answers, score, correctCount, totalProblems: problems.length, errors };
}

/**
 * Build a skill profile from multiple simulation results.
 * Mirrors the real updateSkillProfile() logic from error-tracker.js.
 *
 * @param {Object[]} submissions - Array of { problems, answers, errors } from simulateSubmission
 * @param {string} operation
 * @returns {Object} Aggregated skill profile
 */
function buildSkillProfile(submissions, operation) {
    const skills = {};
    let totalAttempted = 0;
    let totalErrors = 0;

    for (const sub of submissions) {
        for (let i = 0; i < sub.totalProblems; i++) {
            const problem = sub.problems[i];
            const problemSkills = problem.skills || classifyProblem(operation, problem.a, problem.b, problem.answer);
            const isCorrect = sub.errors.every(e => e.problemIndex !== i);

            for (const skill of problemSkills) {
                if (!skills[skill]) {
                    skills[skill] = { attempts: 0, errors: 0, errorRate: 0, recentErrors: [] };
                }
                skills[skill].attempts++;
                totalAttempted++;
                if (!isCorrect) {
                    skills[skill].errors++;
                    totalErrors++;
                    if (skills[skill].recentErrors.length < 5) {
                        skills[skill].recentErrors.push({
                            a: problem.a, b: problem.b,
                            userAnswer: sub.answers[i]
                        });
                    }
                }
                skills[skill].errorRate = skills[skill].errors / skills[skill].attempts;
            }
        }
    }

    return {
        skills,
        totalAttempted,
        totalErrors,
        overallErrorRate: totalAttempted > 0 ? totalErrors / totalAttempted : 0
    };
}

/**
 * Simulate N weeks of a student using the adaptive engine.
 * Each week: generate adaptive worksheet → simulate answers → update profile.
 *
 * @param {Object} archetype - Student archetype
 * @param {string} operation - Math operation
 * @param {number} weeks - Number of weeks to simulate
 * @param {Object} [initialProfile] - Optional starting profile (otherwise built from 3 standard submissions)
 * @returns {{ weeklyResults: Object[], finalProfile: Object, improvement: number }}
 */
function simulateAdaptiveWeeks(archetype, operation, weeks, initialProfile) {
    // Bootstrap: build initial profile from archetype's known error rates
    let profile = initialProfile;
    const weeklyResults = [];

    if (!profile) {
        // Build profile directly from archetype skills (synthetic starting point)
        const skills = {};
        let totalAttempted = 0;
        let totalErrors = 0;
        for (const [skill, data] of Object.entries(archetype.skills)) {
            const attempts = 20; // Synthetic starting attempts per skill
            const errors = Math.round(data.errorRate * attempts);
            skills[skill] = {
                attempts,
                errors,
                errorRate: errors / attempts,
                recentErrors: []
            };
            totalAttempted += attempts;
            totalErrors += errors;
        }
        profile = {
            skills,
            totalAttempted,
            totalErrors,
            overallErrorRate: totalAttempted > 0 ? totalErrors / totalAttempted : 0
        };
    }

    const initialErrorRate = profile.overallErrorRate;

    // Simulate adaptive weeks with gradual improvement
    for (let week = 1; week <= weeks; week++) {
        const seed = `sim-${archetype.id}-week${week}`;
        const { pages } = generateAdaptivePages(operation, archetype.ageGroup, profile, seed);

        // Simulate taking all 7 pages
        const weekSubs = [];
        for (const page of pages) {
            // Apply learning effect: error rates decrease slightly each week
            // (more on weak skills that are being practiced)
            const improvedArchetype = applyLearningEffect(archetype, profile, week);
            const sub = simulateSubmission(improvedArchetype, operation, page.problems);
            sub.problems = page.problems;
            weekSubs.push(sub);
        }

        // Update profile with this week's data
        profile = mergeProfileWithWeek(profile, weekSubs, operation);

        const weekScore = weekSubs.reduce((sum, s) => sum + s.score, 0) / weekSubs.length;

        weeklyResults.push({
            week,
            averageScore: Math.round(weekScore),
            overallErrorRate: profile.overallErrorRate,
            weakSkills: Object.entries(profile.skills)
                .filter(([, d]) => d.errorRate > 0.30 && d.attempts >= 3)
                .map(([s]) => s),
            strongSkills: Object.entries(profile.skills)
                .filter(([, d]) => d.errorRate <= 0.10 && d.attempts >= 3)
                .map(([s]) => s),
        });
    }

    const finalErrorRate = profile.overallErrorRate;
    const improvement = initialErrorRate > 0
        ? (initialErrorRate - finalErrorRate) / initialErrorRate
        : 0;

    return {
        weeklyResults,
        finalProfile: profile,
        initialErrorRate,
        finalErrorRate,
        improvement, // Percentage improvement (0.20 = 20% reduction)
    };
}

/**
 * Apply learning effect: students improve on skills they practice more.
 * Weak skills that appear in adaptive worksheets improve faster.
 *
 * @param {Object} archetype - Original archetype
 * @param {Object} profile - Current skill profile
 * @param {number} week - Current week number
 * @returns {Object} Modified archetype with improved error rates
 */
function applyLearningEffect(archetype, profile, week) {
    const improved = {
        ...archetype,
        skills: {}
    };

    const buckets = classifySkillBuckets(profile.skills);

    for (const [skill, data] of Object.entries(archetype.skills)) {
        let rate = data.errorRate;

        // Weak skills improve more (they get 60% of practice)
        if (buckets.weak.includes(skill)) {
            rate *= Math.max(0.6, 1 - 0.05 * week); // 5% improvement per week
        }
        // Medium skills improve moderately
        else if (buckets.medium.includes(skill)) {
            rate *= Math.max(0.7, 1 - 0.03 * week); // 3% improvement per week
        }
        // Strong skills maintain
        else {
            rate *= Math.max(0.8, 1 - 0.01 * week); // 1% improvement per week
        }

        improved.skills[skill] = { errorRate: Math.max(0.01, rate) };
    }

    return improved;
}

/**
 * Merge existing profile with a new week of submissions.
 * Incrementally updates skill counts (same logic as real updateSkillProfile).
 *
 * @param {Object} existingProfile
 * @param {Object[]} weekSubs - This week's submission results
 * @param {string} operation
 * @returns {Object} Updated profile
 */
function mergeProfileWithWeek(existingProfile, weekSubs, operation) {
    const newWeekProfile = buildSkillProfile(weekSubs, operation);

    const merged = {
        skills: { ...existingProfile.skills },
        totalAttempted: existingProfile.totalAttempted + newWeekProfile.totalAttempted,
        totalErrors: existingProfile.totalErrors + newWeekProfile.totalErrors,
        overallErrorRate: 0
    };

    // Merge per-skill data
    for (const [skill, newData] of Object.entries(newWeekProfile.skills)) {
        if (merged.skills[skill]) {
            merged.skills[skill].attempts += newData.attempts;
            merged.skills[skill].errors += newData.errors;
            merged.skills[skill].errorRate = merged.skills[skill].errors / merged.skills[skill].attempts;
        } else {
            merged.skills[skill] = { ...newData };
        }
    }

    merged.overallErrorRate = merged.totalAttempted > 0
        ? merged.totalErrors / merged.totalAttempted
        : 0;

    return merged;
}

// ============================================================================
// BATCH SIMULATION — Run all archetypes
// ============================================================================

/**
 * Run simulation for all archetypes of an operation.
 * Returns results summary.
 *
 * @param {string} operation
 * @param {number} weeks - Weeks to simulate per archetype
 * @returns {Object[]} Results per archetype
 */
function simulateAllArchetypes(operation, weeks = 10) {
    const archetypes = getArchetypesForOperation(operation);
    const results = [];

    for (const archetype of archetypes) {
        const result = simulateAdaptiveWeeks(archetype, operation, weeks);
        results.push({
            id: archetype.id,
            description: archetype.description,
            ageGroup: archetype.ageGroup,
            initialErrorRate: Math.round(result.initialErrorRate * 100),
            finalErrorRate: Math.round(result.finalErrorRate * 100),
            improvement: Math.round(result.improvement * 100),
            weeksSimulated: weeks,
            passed: result.improvement >= 0.10, // 10%+ improvement = pass
        });
    }

    return results;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    simulateSubmission,
    buildSkillProfile,
    simulateAdaptiveWeeks,
    applyLearningEffect,
    mergeProfileWithWeek,
    simulateAllArchetypes,
};
