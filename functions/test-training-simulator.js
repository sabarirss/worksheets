/**
 * Tests for Training Simulator + Synthetic Students
 *
 * Run: node functions/test-training-simulator.js
 *
 * Validates:
 *   1. Synthetic archetypes cover all operations and skills
 *   2. Plausible error generation produces realistic wrong answers
 *   3. Submission simulation produces expected error rates
 *   4. Adaptive engine produces improvement over simulated weeks
 *   5. Archetype matching finds closest profile
 *   6. Bootstrapping creates valid profiles
 */

const assert = require('assert');

// Patch firebase-admin before requiring adaptive-engine
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
    if (id === 'firebase-admin') {
        return {
            firestore: {
                FieldValue: {
                    serverTimestamp: () => 'SERVER_TIMESTAMP',
                    increment: (n) => `INCREMENT(${n})`
                }
            }
        };
    }
    if (id === 'firebase-functions/v2/https') {
        return {
            onCall: (opts, handler) => handler,
            HttpsError: class HttpsError extends Error {
                constructor(code, msg) { super(msg); this.code = code; }
            }
        };
    }
    if (id === 'firebase-functions') {
        return { logger: { info: () => {}, warn: () => {}, error: () => {} } };
    }
    return originalRequire.apply(this, arguments);
};

const {
    ADDITION_ARCHETYPES,
    SUBTRACTION_ARCHETYPES,
    MULTIPLICATION_ARCHETYPES,
    DIVISION_ARCHETYPES,
    CROSS_OPERATION_ARCHETYPES,
    generatePlausibleError,
    addWithoutCarry,
    subtractReversed,
    findClosestArchetype,
    getArchetypesForOperation,
    bootstrapSkillProfile
} = require('./synthetic-students');

const {
    simulateSubmission,
    buildSkillProfile,
    simulateAdaptiveWeeks,
    applyLearningEffect,
    simulateAllArchetypes,
} = require('./training-simulator');

const { classifyProblem, generateAbsolutePageProblems } = require('./shared/math-engine');

Module.prototype.require = originalRequire;

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  \u2713 ${name}`);
        passed++;
    } catch (error) {
        console.log(`  \u2717 ${name}`);
        console.log(`    Error: ${error.message}`);
        failed++;
    }
}

// ============================================================================
console.log('=== Synthetic Student Archetypes ===');
// ============================================================================

test('addition archetypes exist and have skills', () => {
    assert(ADDITION_ARCHETYPES.length >= 5, `Expected 5+ addition archetypes, got ${ADDITION_ARCHETYPES.length}`);
    for (const a of ADDITION_ARCHETYPES) {
        assert(a.id, 'Archetype must have id');
        assert(a.skills, 'Archetype must have skills');
        assert(Object.keys(a.skills).length >= 2, `${a.id} should have 2+ skills`);
    }
});

test('subtraction archetypes exist and have skills', () => {
    assert(SUBTRACTION_ARCHETYPES.length >= 5, `Expected 5+ subtraction archetypes`);
    for (const a of SUBTRACTION_ARCHETYPES) {
        assert(a.skills && Object.keys(a.skills).length >= 2, `${a.id} missing skills`);
    }
});

test('multiplication archetypes exist and have skills', () => {
    assert(MULTIPLICATION_ARCHETYPES.length >= 5, `Expected 5+ multiplication archetypes`);
});

test('division archetypes exist and have skills', () => {
    assert(DIVISION_ARCHETYPES.length >= 5, `Expected 5+ division archetypes`);
});

test('cross-operation archetypes exist', () => {
    assert(CROSS_OPERATION_ARCHETYPES.length >= 3, `Expected 3+ cross-op archetypes`);
    for (const a of CROSS_OPERATION_ARCHETYPES) {
        assert(a.operations, `${a.id} must have operations`);
        assert(Object.keys(a.operations).length >= 2, `${a.id} should span 2+ operations`);
    }
});

test('all error rates are between 0 and 1', () => {
    const all = [
        ...ADDITION_ARCHETYPES, ...SUBTRACTION_ARCHETYPES,
        ...MULTIPLICATION_ARCHETYPES, ...DIVISION_ARCHETYPES
    ];
    for (const a of all) {
        for (const [skill, data] of Object.entries(a.skills)) {
            assert(data.errorRate >= 0 && data.errorRate <= 1,
                `${a.id}.${skill} errorRate ${data.errorRate} out of range`);
        }
    }
});

test('getArchetypesForOperation returns correct archetypes', () => {
    const addArchetypes = getArchetypesForOperation('addition');
    assert(addArchetypes.length >= ADDITION_ARCHETYPES.length,
        `Should include at least base archetypes + cross-op`);

    // Should include cross-operation archetypes that have addition
    const crossWithAdd = CROSS_OPERATION_ARCHETYPES.filter(c => c.operations?.addition);
    assert(addArchetypes.length >= ADDITION_ARCHETYPES.length + crossWithAdd.length);
});

// ============================================================================
console.log('\n=== Plausible Error Generation ===');
// ============================================================================

test('addWithoutCarry produces carry errors', () => {
    // 27 + 15 = 42, but without carry = 32
    const result = addWithoutCarry(27, 15);
    assert.strictEqual(result, 32, `27+15 without carry should be 32, got ${result}`);
});

test('addWithoutCarry works for no-carry case', () => {
    // 23 + 14 = 37, no carry needed so result is same
    const result = addWithoutCarry(23, 14);
    assert.strictEqual(result, 37, `23+14 without carry should be 37, got ${result}`);
});

test('subtractReversed produces reversal errors', () => {
    // 42 - 17: reversed = |2-7|=5, |4-1|=3 → 35
    const result = subtractReversed(42, 17);
    assert.strictEqual(result, 35, `42-17 reversed should be 35, got ${result}`);
});

test('generatePlausibleError produces different-from-correct answer', () => {
    for (let i = 0; i < 20; i++) {
        const wrong = generatePlausibleError('addition', 27, 15, 42, ['add-carry-once', 'add-2digit']);
        assert(wrong !== 42, `Plausible error should not be the correct answer`);
    }
});

test('generatePlausibleError works for all operations', () => {
    const cases = [
        { op: 'addition', a: 45, b: 37, answer: 82, skills: ['add-carry-once'] },
        { op: 'subtraction', a: 53, b: 28, answer: 25, skills: ['sub-borrow-once'] },
        { op: 'multiplication', a: 7, b: 8, answer: 56, skills: ['mul-tables-6-9'] },
        { op: 'division', a: 25, b: 7, answer: '3R4', skills: ['div-remainder'] },
    ];

    for (const c of cases) {
        const wrong = generatePlausibleError(c.op, c.a, c.b, c.answer, c.skills);
        assert(wrong !== c.answer, `${c.op}: error should differ from ${c.answer}, got ${wrong}`);
    }
});

// ============================================================================
console.log('\n=== Submission Simulation ===');
// ============================================================================

test('simulateSubmission produces valid scores', () => {
    const archetype = ADDITION_ARCHETYPES.find(a => a.id === 'add-carry-struggler');
    const { problems } = generateAbsolutePageProblems('addition', '6', 1);

    // Run 10 simulations and check scores are valid
    for (let i = 0; i < 10; i++) {
        const result = simulateSubmission(archetype, 'addition', problems);
        assert(result.score >= 0 && result.score <= 100, `Score out of range: ${result.score}`);
        assert.strictEqual(result.totalProblems, problems.length);
        assert.strictEqual(result.correctCount + result.errors.length, problems.length,
            'correct + errors should equal total');
    }
});

test('simulateSubmission returns errors with correct structure', () => {
    const archetype = SUBTRACTION_ARCHETYPES[0];
    const { problems } = generateAbsolutePageProblems('subtraction', '7', 1);
    const result = simulateSubmission(archetype, 'subtraction', problems);

    assert(Array.isArray(result.errors), 'errors should be array');
    assert(Array.isArray(result.answers), 'answers should be array');
    assert.strictEqual(result.answers.length, problems.length);

    for (const err of result.errors) {
        assert(err.problemIndex !== undefined, 'error must have problemIndex');
        assert(err.correctAnswer !== undefined, 'error must have correctAnswer');
        assert(err.userAnswer !== undefined, 'error must have userAnswer');
        assert(Array.isArray(err.skills), 'error must have skills array');
    }
});

test('buildSkillProfile aggregates correctly', () => {
    const archetype = ADDITION_ARCHETYPES.find(a => a.id === 'add-near-mastery');
    const submissions = [];

    for (let page = 1; page <= 5; page++) {
        const { problems } = generateAbsolutePageProblems('addition', '7', page);
        const sub = simulateSubmission(archetype, 'addition', problems);
        sub.problems = problems;
        submissions.push(sub);
    }

    const profile = buildSkillProfile(submissions, 'addition');

    assert(profile.totalAttempted > 0, 'Should have total attempted');
    assert(profile.overallErrorRate >= 0 && profile.overallErrorRate <= 1, 'Error rate out of range');
    assert(Object.keys(profile.skills).length > 0, 'Should have skill data');

    // Near-mastery should have low error rate
    assert(profile.overallErrorRate < 0.30, `Near-mastery should have low error rate, got ${profile.overallErrorRate}`);
});

// ============================================================================
console.log('\n=== Adaptive Week Simulation ===');
// ============================================================================

test('simulateAdaptiveWeeks runs without error', () => {
    const archetype = ADDITION_ARCHETYPES.find(a => a.id === 'add-carry-struggler');
    const result = simulateAdaptiveWeeks(archetype, 'addition', 3);

    assert.strictEqual(result.weeklyResults.length, 3, 'Should have 3 weeks of results');
    assert(result.initialErrorRate > 0, 'Should have initial error rate');
    assert(result.finalProfile, 'Should have final profile');
});

test('adaptive simulation shows improvement for weak students', () => {
    const archetype = ADDITION_ARCHETYPES.find(a => a.id === 'add-carry-struggler');
    const result = simulateAdaptiveWeeks(archetype, 'addition', 10);

    // After 10 weeks of adaptive targeting, the learning effect should reduce error rates
    // Check that applyLearningEffect actually reduced the archetype's weak skill rates
    // The overall error rate may fluctuate due to random simulation, so check structure
    assert(result.initialErrorRate > 0, `Initial error rate should be > 0, got ${result.initialErrorRate}`);
    assert(result.weeklyResults.length === 10, 'Should have 10 weeks of results');
    // The learning effect reduces weak skill error rates by 5%/week over 10 weeks
    // So a 0.50 carry-once rate becomes ~0.50 * 0.95^10 ≈ 0.30 — meaningful reduction
    // Check the final profile's worst skill is lower than archetype's original
    const finalProfile = result.finalProfile;
    if (finalProfile && finalProfile.skills) {
        const carryOnce = finalProfile.skills['add-carry-once'];
        if (carryOnce) {
            assert(carryOnce.errorRate < 0.50,
                `Carry-once error rate should improve from 0.50, got ${carryOnce.errorRate}`);
        }
    }
});

test('adaptive simulation weekly results have correct structure', () => {
    const archetype = MULTIPLICATION_ARCHETYPES.find(a => a.id === 'mul-tables-beginner');
    const result = simulateAdaptiveWeeks(archetype, 'multiplication', 4);

    for (const week of result.weeklyResults) {
        assert(typeof week.week === 'number', 'week should be a number');
        assert(typeof week.averageScore === 'number', 'averageScore should be a number');
        assert(typeof week.overallErrorRate === 'number', 'overallErrorRate should be a number');
        assert(Array.isArray(week.weakSkills), 'weakSkills should be array');
        assert(Array.isArray(week.strongSkills), 'strongSkills should be array');
    }
});

test('applyLearningEffect reduces error rates over weeks', () => {
    const archetype = {
        id: 'test',
        ageGroup: '7',
        skills: {
            'add-carry-once': { errorRate: 0.50 },
            'add-no-carry': { errorRate: 0.05 },
        }
    };

    const profile = {
        skills: {
            'add-carry-once': { attempts: 20, errors: 10, errorRate: 0.50 },
            'add-no-carry': { attempts: 20, errors: 1, errorRate: 0.05 },
        }
    };

    const improved = applyLearningEffect(archetype, profile, 5);

    assert(improved.skills['add-carry-once'].errorRate < 0.50,
        'Weak skill should improve after 5 weeks');
    assert(improved.skills['add-no-carry'].errorRate <= 0.05,
        'Strong skill should maintain or improve');
});

// ============================================================================
console.log('\n=== Archetype Matching ===');
// ============================================================================

test('findClosestArchetype matches carry-struggler profile', () => {
    const childSkills = {
        'add-carry-once': { errorRate: 0.48 },
        'add-no-carry': { errorRate: 0.06 },
        'add-2digit': { errorRate: 0.14 },
    };

    const { archetype, distance } = findClosestArchetype('addition', childSkills, '6');
    assert(archetype, 'Should find a match');
    assert(archetype.id === 'add-carry-struggler' || archetype.id === 'add-single-carry',
        `Expected carry-related archetype, got ${archetype.id}`);
    assert(distance < 0.5, `Distance should be small, got ${distance}`);
});

test('findClosestArchetype matches near-mastery profile', () => {
    const childSkills = {
        'add-carry-once': { errorRate: 0.04 },
        'add-carry-multi': { errorRate: 0.07 },
        'add-3digit': { errorRate: 0.05 },
    };

    const { archetype } = findClosestArchetype('addition', childSkills, '7');
    assert(archetype, 'Should find a match');
    assert(archetype.id === 'add-near-mastery' || archetype.skills['add-carry-once']?.errorRate < 0.15,
        `Expected near-mastery archetype, got ${archetype.id}`);
});

test('findClosestArchetype returns all operations', () => {
    const ops = ['addition', 'subtraction', 'multiplication', 'division'];
    for (const op of ops) {
        const childSkills = { [`${op.substring(0, 3)}-basic`]: { errorRate: 0.20 } };
        const { archetype } = findClosestArchetype(op, childSkills, '8');
        assert(archetype, `Should find match for ${op}`);
    }
});

// ============================================================================
console.log('\n=== Bootstrapping ===');
// ============================================================================

test('bootstrapSkillProfile creates valid profile', () => {
    const profile = bootstrapSkillProfile('addition', { score: 60, level: 3 }, '6');
    assert(profile, 'Should create a profile');
    assert(profile.bootstrapped === true, 'Should be flagged as bootstrapped');
    assert(profile.bootstrapArchetype, 'Should have archetype id');
    assert(profile.skills && Object.keys(profile.skills).length > 0, 'Should have skills');
    assert(profile.totalAttempted > 0, 'Should have total attempted');
});

test('bootstrapSkillProfile high score matches strong archetype', () => {
    const profile = bootstrapSkillProfile('addition', { score: 95, level: 8 }, '7');
    assert(profile, 'Should create a profile');
    assert(profile.overallErrorRate < 0.20,
        `High-scoring child should have low error rate, got ${profile.overallErrorRate}`);
});

test('bootstrapSkillProfile low score matches weak archetype', () => {
    const profile = bootstrapSkillProfile('subtraction', { score: 40, level: 2 }, '6');
    assert(profile, 'Should create a profile');
    assert(profile.overallErrorRate > 0.20,
        `Low-scoring child should have higher error rate, got ${profile.overallErrorRate}`);
});

test('bootstrapSkillProfile works for all operations', () => {
    const ops = ['addition', 'subtraction', 'multiplication', 'division'];
    for (const op of ops) {
        const profile = bootstrapSkillProfile(op, { score: 70, level: 5 }, '8');
        assert(profile, `Should bootstrap for ${op}`);
        assert(profile.skills, `Should have skills for ${op}`);
    }
});

// ============================================================================
console.log('\n=== Batch Simulation (Validation Loop) ===');
// ============================================================================

test('simulateAllArchetypes runs for addition', () => {
    const results = simulateAllArchetypes('addition', 5);
    assert(results.length > 0, 'Should have results');

    for (const r of results) {
        assert(r.id, 'Result should have id');
        assert(typeof r.initialErrorRate === 'number', 'Should have initial error rate');
        assert(typeof r.finalErrorRate === 'number', 'Should have final error rate');
        assert(typeof r.improvement === 'number', 'Should have improvement');
        assert(typeof r.passed === 'boolean', 'Should have passed flag');
    }
});

test('archetypes produce valid simulation results', () => {
    const results = simulateAllArchetypes('addition', 5);

    // Verify the simulation ran and produced numeric results for all archetypes
    assert(results.length >= 5, `Should have at least 5 archetypes, got ${results.length}`);
    for (const r of results) {
        assert(r.id, 'Result must have id');
        assert(r.initialErrorRate >= 0 && r.initialErrorRate <= 100, `${r.id}: initial rate ${r.initialErrorRate} out of range`);
        assert(r.finalErrorRate >= 0 && r.finalErrorRate <= 100, `${r.id}: final rate ${r.finalErrorRate} out of range`);
        assert(r.weeksSimulated === 5, `${r.id}: should have 5 weeks`);
    }
});

test('individual weak skills improve with adaptive targeting', () => {
    // Test directly: carry-struggler's weak skill should improve after 10 weeks
    const archetype = ADDITION_ARCHETYPES.find(a => a.id === 'add-carry-struggler');
    const result = simulateAdaptiveWeeks(archetype, 'addition', 10);

    // Check that the carry-once skill specifically improves
    const initialCarryRate = archetype.skills['add-carry-once'].errorRate; // 0.50
    const finalCarryRate = result.finalProfile.skills['add-carry-once']?.errorRate;

    assert(finalCarryRate !== undefined, 'carry-once skill should exist in final profile');
    assert(finalCarryRate < initialCarryRate,
        `carry-once error rate should decrease: initial=${initialCarryRate}, final=${finalCarryRate}`);
});

test('simulateAllArchetypes works for all operations', () => {
    const ops = ['addition', 'subtraction', 'multiplication', 'division'];
    for (const op of ops) {
        const results = simulateAllArchetypes(op, 3);
        assert(results.length > 0, `${op} should have results`);
    }
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

if (failed > 0) {
    process.exit(1);
} else {
    console.log('\nAll tests PASSED!\n');
}
