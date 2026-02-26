/**
 * Unit tests for error-tracker.js
 *
 * Run: node functions/test-error-tracker.js
 *
 * Tests error logging and skill profile update logic with Firestore mocks.
 */

const assert = require('assert');
const { generatePageProblems, classifyProblem } = require('./shared/math-engine');

let passed = 0;
let failed = 0;
const tests = [];

function test(name, fn) {
    tests.push({ name, fn });
}

async function runTests() {
    for (const { name, fn } of tests) {
        try {
            await fn();
            console.log(`  \u2713 ${name}`);
            passed++;
        } catch (error) {
            console.log(`  \u2717 ${name}`);
            console.log(`    Error: ${error.message}`);
            failed++;
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
    console.log(`${'='.repeat(50)}`);

    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\nAll tests PASSED!\n');
    }
}

// ============================================================================
// Mock Firestore for testing logErrors and updateSkillProfile
// ============================================================================

function createMockDb() {
    const stored = {};

    return {
        _stored: stored,
        collection(name) {
            return {
                doc(id) {
                    const docPath = `${name}/${id}`;
                    return {
                        collection(subName) {
                            const subPath = `${docPath}/${subName}`;
                            return {
                                doc(subId) {
                                    const fullPath = `${subPath}/${subId}`;
                                    return {
                                        get: async () => ({
                                            exists: !!stored[fullPath],
                                            data: () => stored[fullPath] || null
                                        }),
                                        set: async (data, options) => {
                                            if (options && options.merge) {
                                                stored[fullPath] = { ...(stored[fullPath] || {}), ...data };
                                            } else {
                                                stored[fullPath] = data;
                                            }
                                        }
                                    };
                                },
                                add: async (data) => {
                                    const autoId = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                                    const fullPath = `${subPath}/${autoId}`;
                                    stored[fullPath] = data;
                                    return { id: autoId };
                                }
                            };
                        }
                    };
                }
            };
        }
    };
}

// Patch firebase-admin for module import
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
    return originalRequire.apply(this, arguments);
};

const { logErrors, updateSkillProfile } = require('./error-tracker');

// Restore original require
Module.prototype.require = originalRequire;

// ============================================================================
console.log('=== Error Logging Tests ===');
// ============================================================================

test('logErrors stores only incorrect answers', async () => {
    const db = createMockDb();
    const problems = [
        { a: 23, b: 14, answer: 37 },
        { a: 27, b: 15, answer: 42 },
        { a: 10, b: 5, answer: 15 },
        { a: 33, b: 9, answer: 42 }
    ];
    const feedback = [
        { correct: true, expected: 37, userAnswer: 37 },
        { correct: false, expected: 42, userAnswer: 32 },
        { correct: true, expected: 15, userAnswer: 15 },
        { correct: false, expected: 42, userAnswer: 40 }
    ];

    await logErrors(db, 'child1', 'addition', 5, '6', problems, feedback);

    const errorLogKeys = Object.keys(db._stored).filter(k => k.includes('error_log'));
    assert.strictEqual(errorLogKeys.length, 1, 'Should have 1 error_log doc');

    const errorLog = db._stored[errorLogKeys[0]];
    assert.strictEqual(errorLog.operation, 'addition');
    assert.strictEqual(errorLog.absolutePage, 5);
    assert.strictEqual(errorLog.errorCount, 2, 'Should have 2 errors');
    assert.strictEqual(errorLog.errors.length, 2);
    assert.strictEqual(errorLog.errors[0].problemIndex, 1);
    assert.strictEqual(errorLog.errors[0].userAnswer, 32);
    assert.strictEqual(errorLog.errors[0].correctAnswer, 42);
    assert.strictEqual(errorLog.errors[1].problemIndex, 3);
    assert(Array.isArray(errorLog.errors[0].skills), 'Each error should have skills array');
});

test('logErrors handles perfect score (no errors)', async () => {
    const db = createMockDb();
    const problems = [
        { a: 3, b: 4, answer: 7 },
        { a: 5, b: 2, answer: 7 }
    ];
    const feedback = [
        { correct: true, expected: 7, userAnswer: 7 },
        { correct: true, expected: 7, userAnswer: 7 }
    ];

    await logErrors(db, 'child1', 'addition', 1, '4-5', problems, feedback);

    const storedKeys = Object.keys(db._stored).filter(k => k.includes('error_log'));
    const errorLog = db._stored[storedKeys[0]];
    assert.strictEqual(errorLog.errorCount, 0);
    assert.strictEqual(errorLog.errors.length, 0);
    assert.strictEqual(errorLog.score, 100);
});

test('logErrors correctly maps difficulty from absolutePage', async () => {
    const db = createMockDb();
    const problems = [{ a: 3, b: 4, answer: 7 }];
    const feedback = [{ correct: true, expected: 7, userAnswer: 7 }];

    await logErrors(db, 'child1', 'addition', 5, '6', problems, feedback);
    let keys = Object.keys(db._stored).filter(k => k.includes('error_log'));
    assert.strictEqual(db._stored[keys[keys.length - 1]].difficulty, 'easy');

    await logErrors(db, 'child1', 'addition', 75, '6', problems, feedback);
    keys = Object.keys(db._stored).filter(k => k.includes('error_log'));
    assert.strictEqual(db._stored[keys[keys.length - 1]].difficulty, 'medium');

    await logErrors(db, 'child1', 'addition', 120, '6', problems, feedback);
    keys = Object.keys(db._stored).filter(k => k.includes('error_log'));
    assert.strictEqual(db._stored[keys[keys.length - 1]].difficulty, 'hard');
});

test('logErrors includes skill tags from classifyProblem', async () => {
    const db = createMockDb();
    const problems = [{ a: 27, b: 15, answer: 42 }];
    const feedback = [{ correct: false, expected: 42, userAnswer: 32 }];

    await logErrors(db, 'child1', 'addition', 5, '7', problems, feedback);

    const storedKeys = Object.keys(db._stored).filter(k => k.includes('error_log'));
    const errorLog = db._stored[storedKeys[0]];
    const errorSkills = errorLog.errors[0].skills;
    assert(errorSkills.includes('add-carry-once'), `Expected add-carry-once in ${errorSkills}`);
});

// ============================================================================
console.log('\n=== Skill Profile Tests ===');
// ============================================================================

test('updateSkillProfile creates new profile for first submission', async () => {
    const db = createMockDb();
    const problems = [
        { a: 23, b: 14, answer: 37 },
        { a: 27, b: 15, answer: 42 },
        { a: 10, b: 5, answer: 15 }
    ];
    const feedback = [
        { correct: true, expected: 37, userAnswer: 37 },
        { correct: false, expected: 42, userAnswer: 32 },
        { correct: true, expected: 15, userAnswer: 15 }
    ];

    await updateSkillProfile(db, 'child1', 'addition', problems, feedback);

    const profilePath = 'children/child1/skill_profile/addition';
    const profile = db._stored[profilePath];
    assert(profile, 'Profile should be created');
    assert(profile.skills, 'Profile should have skills');
    assert(profile.totalAttempted > 0, 'Total attempted should be > 0');
    assert(profile.totalErrors > 0, 'Total errors should be > 0');
});

test('updateSkillProfile tracks error rates correctly', async () => {
    const db = createMockDb();
    const problems = [
        { a: 23, b: 14, answer: 37 },  // no carry
        { a: 27, b: 15, answer: 42 },  // carry
        { a: 31, b: 12, answer: 43 },  // no carry
        { a: 28, b: 16, answer: 44 }   // carry
    ];
    const feedback = [
        { correct: true, expected: 37, userAnswer: 37 },
        { correct: false, expected: 42, userAnswer: 32 },
        { correct: true, expected: 43, userAnswer: 43 },
        { correct: true, expected: 44, userAnswer: 44 }
    ];

    await updateSkillProfile(db, 'child1', 'addition', problems, feedback);

    const profile = db._stored['children/child1/skill_profile/addition'];
    const skills = profile.skills;

    // Carry skill should have errors, no-carry should not
    const carrySkill = skills['add-carry-once'];
    const noCarrySkill = skills['add-no-carry'];
    if (carrySkill && noCarrySkill) {
        assert(carrySkill.errorRate > noCarrySkill.errorRate,
            `Carry error rate (${carrySkill.errorRate}) should be > no-carry (${noCarrySkill.errorRate})`);
    }
});

test('updateSkillProfile accumulates across multiple submissions', async () => {
    const db = createMockDb();
    const problems = [{ a: 27, b: 15, answer: 42 }];
    // classifyProblem returns ['add-2digit', 'add-carry-once'] for this — 2 skills per problem

    // First submission: error
    await updateSkillProfile(db, 'child1', 'addition', problems,
        [{ correct: false, expected: 42, userAnswer: 32 }]);

    let profile = db._stored['children/child1/skill_profile/addition'];
    // totalAttempted counts per-skill: 1 problem x 2 skills = 2
    assert(profile.totalAttempted >= 1, `Should have >= 1 attempted, got ${profile.totalAttempted}`);
    assert(profile.totalErrors >= 1, `Should have >= 1 error, got ${profile.totalErrors}`);

    // Second submission: correct
    await updateSkillProfile(db, 'child1', 'addition', problems,
        [{ correct: true, expected: 42, userAnswer: 42 }]);

    profile = db._stored['children/child1/skill_profile/addition'];
    // After 2 submissions, totalAttempted = 2 per skill = 4 total
    assert(profile.totalAttempted >= 2, `Should have >= 2 attempted after 2 submissions, got ${profile.totalAttempted}`);
    // Errors only from first submission
    assert(profile.totalErrors >= 1, `Should still have >= 1 error, got ${profile.totalErrors}`);
    // Error rate should be ~0.5 (1 error per 2 attempts per skill)
    assert(profile.overallErrorRate === 0.5, `Error rate should be 0.5, got ${profile.overallErrorRate}`);
});

test('updateSkillProfile maintains recent errors (max 5)', async () => {
    const db = createMockDb();
    const problem = { a: 27, b: 15, answer: 42 };

    for (let i = 0; i < 7; i++) {
        await updateSkillProfile(db, 'child1', 'addition', [problem],
            [{ correct: false, expected: 42, userAnswer: 30 + i }]);
    }

    const profile = db._stored['children/child1/skill_profile/addition'];
    for (const skill of Object.values(profile.skills)) {
        if (skill.recentErrors && skill.recentErrors.length > 0) {
            assert(skill.recentErrors.length <= 5,
                `Recent errors should be <= 5, got ${skill.recentErrors.length}`);
        }
    }
});

test('updateSkillProfile handles all four operations', async () => {
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const testProblems = {
        addition: [{ a: 27, b: 15, answer: 42 }],
        subtraction: [{ a: 42, b: 17, answer: 25 }],
        multiplication: [{ a: 7, b: 8, answer: 56 }],
        division: [{ a: 24, b: 6, answer: 4 }]
    };

    for (const op of operations) {
        const db = createMockDb();
        await updateSkillProfile(db, 'child1', op, testProblems[op],
            [{ correct: false, expected: testProblems[op][0].answer, userAnswer: 0 }]);

        const profile = db._stored[`children/child1/skill_profile/${op}`];
        assert(profile, `Profile should exist for ${op}`);
        assert(Object.keys(profile.skills).length > 0, `Skills should be tagged for ${op}`);
    }
});

test('updateSkillProfile works with real generated problems', async () => {
    const db = createMockDb();
    const { problems } = generatePageProblems('addition', '7', 'medium', 1);

    // Simulate 80% correct (4 wrong out of 20)
    const feedback = problems.map((p, i) => ({
        correct: i >= 4,
        expected: p.answer,
        userAnswer: i >= 4 ? p.answer : 0
    }));

    await updateSkillProfile(db, 'child1', 'addition', problems, feedback);

    const profile = db._stored['children/child1/skill_profile/addition'];
    // totalAttempted counts per-skill tags (each problem has 2+ skills)
    assert(profile.totalAttempted >= 20, `Should have >= 20 skill-attempts, got ${profile.totalAttempted}`);
    assert(profile.totalErrors >= 4, `Should have >= 4 skill-errors, got ${profile.totalErrors}`);
    assert(profile.overallErrorRate > 0, `Error rate should be > 0`);
    assert(profile.overallErrorRate < 1, `Error rate should be < 1`);
});

// ============================================================================
console.log('\n=== Error Pattern Tracking ===');
// ============================================================================

test('logErrors includes errorPatterns in each error', async () => {
    const db = createMockDb();
    const problems = [{ a: 27, b: 15, answer: 42 }];
    const feedback = [{ correct: false, expected: 42, userAnswer: 32 }];

    await logErrors(db, 'child1', 'addition', 5, '7', problems, feedback);

    const storedKeys = Object.keys(db._stored).filter(k => k.includes('error_log'));
    const errorLog = db._stored[storedKeys[0]];
    const error = errorLog.errors[0];
    assert(Array.isArray(error.errorPatterns), 'Error should have errorPatterns array');
    assert(error.errorPatterns.includes('err-carry-forgot'),
        `Expected err-carry-forgot in ${error.errorPatterns}`);
});

test('updateSkillProfile stores errorPatterns aggregation', async () => {
    const db = createMockDb();
    const problems = [
        { a: 27, b: 15, answer: 42 },
        { a: 42, b: 19, answer: 61 }
    ];
    const feedback = [
        { correct: false, expected: 42, userAnswer: 32 },  // carry forgot
        { correct: false, expected: 61, userAnswer: 62 }   // off-by-one
    ];

    await updateSkillProfile(db, 'child1', 'addition', problems, feedback);

    const profile = db._stored['children/child1/skill_profile/addition'];
    assert(profile.errorPatterns, 'Profile should have errorPatterns');
    // Should have at least err-carry-forgot pattern tracked
    const patterns = Object.keys(profile.errorPatterns);
    assert(patterns.length > 0, `Should have at least 1 error pattern, got ${patterns.length}`);
});

test('errorPatterns accumulate with examples across submissions', async () => {
    const db = createMockDb();
    const problem = { a: 27, b: 15, answer: 42 };

    // Three submissions, all with carry-forgot errors
    for (let i = 0; i < 3; i++) {
        await updateSkillProfile(db, 'child1', 'addition', [problem],
            [{ correct: false, expected: 42, userAnswer: 32 }]);
    }

    const profile = db._stored['children/child1/skill_profile/addition'];
    const carryForgot = profile.errorPatterns['err-carry-forgot'];
    assert(carryForgot, 'Should track err-carry-forgot pattern');
    assert(carryForgot.count === 3, `Should have 3 occurrences, got ${carryForgot.count}`);
    assert(carryForgot.recentExamples.length <= 5, 'Examples should be capped at 5');
});

// ============================================================================
console.log('\n=== Integration: classifyProblem + error-tracker ===');
// ============================================================================

test('errors from generated problems have valid skill tags', async () => {
    const db = createMockDb();
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const ageGroups = ['4-5', '7', '10+'];

    for (const op of operations) {
        for (const age of ageGroups) {
            const { problems } = generatePageProblems(op, age, 'easy', 1);
            const feedback = problems.map(p => ({
                correct: false, expected: p.answer, userAnswer: 0
            }));

            await logErrors(db, 'child1', op, 1, age, problems, feedback);
        }
    }

    const errorLogs = Object.entries(db._stored)
        .filter(([k]) => k.includes('error_log'))
        .map(([, v]) => v);

    assert(errorLogs.length >= 12, `Should have >=12 error logs, got ${errorLogs.length}`);

    for (const log of errorLogs) {
        for (const error of log.errors) {
            assert(Array.isArray(error.skills), 'Error should have skills array');
            assert(error.skills.length > 0, 'Error should have at least one skill');
        }
    }
});

// Run all tests
runTests();
