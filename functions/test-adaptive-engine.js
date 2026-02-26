/**
 * Unit tests for adaptive-engine.js
 *
 * Run: node functions/test-adaptive-engine.js
 *
 * Tests the core adaptive logic (skill buckets, problem distribution, page generation).
 * All tests run locally with no Firebase calls.
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
    classifySkillBuckets,
    generateAdaptivePages,
    DISTRIBUTION,
    THRESHOLDS,
    PROBLEMS_PER_PAGE,
    PAGES_PER_WEEK
} = require('./adaptive-engine');

Module.prototype.require = originalRequire;

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        const result = fn();
        if (result && typeof result.then === 'function') {
            // Skip async for now, all our tests are sync
        }
        console.log(`  \u2713 ${name}`);
        passed++;
    } catch (error) {
        console.log(`  \u2717 ${name}`);
        console.log(`    Error: ${error.message}`);
        failed++;
    }
}

// ============================================================================
console.log('=== Skill Bucket Classification ===');
// ============================================================================

test('classifies weak skills (errorRate > 30%)', () => {
    const skills = {
        'add-carry-once': { attempts: 20, errors: 10, errorRate: 0.50 },
        'add-no-carry': { attempts: 20, errors: 1, errorRate: 0.05 }
    };
    const buckets = classifySkillBuckets(skills);
    assert(buckets.weak.includes('add-carry-once'), 'High error rate should be weak');
    assert(buckets.strong.includes('add-no-carry'), 'Low error rate should be strong');
});

test('classifies medium skills (10-30%)', () => {
    const skills = {
        'add-carry-once': { attempts: 20, errors: 4, errorRate: 0.20 }
    };
    const buckets = classifySkillBuckets(skills);
    assert(buckets.medium.includes('add-carry-once'), '20% error rate should be medium');
});

test('classifies untested skills (< 3 attempts)', () => {
    const skills = {
        'add-carry-once': { attempts: 2, errors: 1, errorRate: 0.50 }
    };
    const buckets = classifySkillBuckets(skills);
    assert(buckets.untested.includes('add-carry-once'), 'Low attempts should be untested');
});

test('handles empty skills', () => {
    const buckets = classifySkillBuckets({});
    assert.strictEqual(buckets.weak.length, 0);
    assert.strictEqual(buckets.medium.length, 0);
    assert.strictEqual(buckets.strong.length, 0);
    assert.strictEqual(buckets.untested.length, 0);
});

test('boundary: exactly 30% error rate is medium, not weak', () => {
    const skills = {
        'add-carry-once': { attempts: 10, errors: 3, errorRate: 0.30 }
    };
    const buckets = classifySkillBuckets(skills);
    // 0.30 is NOT > 0.30, so it should be medium
    assert(buckets.medium.includes('add-carry-once'), '30% exactly should be medium');
});

test('boundary: exactly 10% error rate is strong, not medium', () => {
    const skills = {
        'add-carry-once': { attempts: 10, errors: 1, errorRate: 0.10 }
    };
    const buckets = classifySkillBuckets(skills);
    assert(buckets.strong.includes('add-carry-once'), '10% exactly should be strong');
});

// ============================================================================
console.log('\n=== Adaptive Page Generation ===');
// ============================================================================

test('generates correct number of pages', () => {
    const profile = {
        skills: {
            'add-carry-once': { attempts: 30, errors: 15, errorRate: 0.50 },
            'add-no-carry': { attempts: 30, errors: 1, errorRate: 0.03 }
        },
        totalAttempted: 60,
        totalErrors: 16
    };

    const { pages } = generateAdaptivePages('addition', '7', profile, 'test-seed');
    assert.strictEqual(pages.length, PAGES_PER_WEEK, `Should have ${PAGES_PER_WEEK} pages`);
});

test('each page has ~20 problems', () => {
    const profile = {
        skills: {
            'add-carry-once': { attempts: 30, errors: 15, errorRate: 0.50 },
            'add-no-carry': { attempts: 30, errors: 1, errorRate: 0.03 },
            'add-2digit': { attempts: 30, errors: 5, errorRate: 0.17 }
        },
        totalAttempted: 90,
        totalErrors: 21
    };

    const { pages } = generateAdaptivePages('addition', '7', profile, 'test-seed');
    for (const page of pages) {
        assert(page.problems.length >= 15, `Page ${page.pageNumber} should have >= 15 problems, got ${page.problems.length}`);
        assert(page.problems.length <= 25, `Page ${page.pageNumber} should have <= 25 problems, got ${page.problems.length}`);
    }
});

test('problems target weak skills more than strong skills', () => {
    const profile = {
        skills: {
            'add-carry-once': { attempts: 30, errors: 15, errorRate: 0.50 },
            'add-no-carry': { attempts: 30, errors: 1, errorRate: 0.03 }
        },
        totalAttempted: 60,
        totalErrors: 16
    };

    const { pages, reasoning } = generateAdaptivePages('addition', '7', profile, 'test-seed');

    // Count problems by target bucket across all pages
    let weakCount = 0, strongCount = 0;
    for (const page of pages) {
        for (const p of page.problems) {
            if (p.targetBucket === 'weak') weakCount++;
            if (p.targetBucket === 'strong') strongCount++;
        }
    }

    assert(weakCount > strongCount, `Weak problems (${weakCount}) should outnumber strong (${strongCount})`);
});

test('reasoning includes skill breakdown', () => {
    const profile = {
        skills: {
            'add-carry-once': { attempts: 30, errors: 15, errorRate: 0.50 },
            'add-no-carry': { attempts: 30, errors: 1, errorRate: 0.03 }
        },
        totalAttempted: 60,
        totalErrors: 16
    };

    const { reasoning } = generateAdaptivePages('addition', '7', profile, 'test-seed');

    assert(Array.isArray(reasoning.weakSkills), 'Should have weakSkills array');
    assert(Array.isArray(reasoning.strongSkills), 'Should have strongSkills array');
    assert(reasoning.weakSkills.length > 0, 'Should have at least one weak skill');
    assert(reasoning.totalProblems > 0, 'Should have totalProblems');
    assert(reasoning.distribution, 'Should have distribution');
});

test('all generated problems have valid answers', () => {
    const profile = {
        skills: {
            'add-carry-once': { attempts: 30, errors: 15, errorRate: 0.50 },
            'add-no-carry': { attempts: 30, errors: 1, errorRate: 0.03 },
            'add-3digit': { attempts: 20, errors: 4, errorRate: 0.20 }
        },
        totalAttempted: 80,
        totalErrors: 20
    };

    const { pages } = generateAdaptivePages('addition', '7', profile, 'test-seed');
    for (const page of pages) {
        for (const p of page.problems) {
            assert(p.answer !== undefined, `Problem should have answer: ${JSON.stringify(p)}`);
            assert(p.a !== undefined, `Problem should have a: ${JSON.stringify(p)}`);
            assert(p.b !== undefined, `Problem should have b: ${JSON.stringify(p)}`);
            assert(Array.isArray(p.skills), `Problem should have skills array`);
        }
    }
});

test('generation is deterministic with same seed', () => {
    const profile = {
        skills: {
            'mul-tables-6-9': { attempts: 30, errors: 12, errorRate: 0.40 },
            'mul-tables-2-5': { attempts: 30, errors: 2, errorRate: 0.07 }
        },
        totalAttempted: 60,
        totalErrors: 14
    };

    const result1 = generateAdaptivePages('multiplication', '7', profile, 'same-seed');
    const result2 = generateAdaptivePages('multiplication', '7', profile, 'same-seed');

    assert.strictEqual(result1.pages[0].problems[0].a, result2.pages[0].problems[0].a);
    assert.strictEqual(result1.pages[0].problems[0].b, result2.pages[0].problems[0].b);
});

test('different seeds produce different worksheets', () => {
    const profile = {
        skills: {
            'mul-tables-6-9': { attempts: 30, errors: 12, errorRate: 0.40 },
            'mul-tables-2-5': { attempts: 30, errors: 2, errorRate: 0.07 }
        },
        totalAttempted: 60,
        totalErrors: 14
    };

    const result1 = generateAdaptivePages('multiplication', '7', profile, 'seed-A');
    const result2 = generateAdaptivePages('multiplication', '7', profile, 'seed-B');

    // Different seeds should produce different problems (extremely unlikely to match)
    let differences = 0;
    for (let i = 0; i < Math.min(result1.pages[0].problems.length, result2.pages[0].problems.length); i++) {
        if (result1.pages[0].problems[i].a !== result2.pages[0].problems[i].a) differences++;
    }
    assert(differences > 0, 'Different seeds should produce different problems');
});

test('works for all four operations', () => {
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const skillsByOp = {
        addition: { 'add-carry-once': { attempts: 20, errors: 8, errorRate: 0.40 } },
        subtraction: { 'sub-borrow-once': { attempts: 20, errors: 8, errorRate: 0.40 } },
        multiplication: { 'mul-tables-6-9': { attempts: 20, errors: 8, errorRate: 0.40 } },
        division: { 'div-remainder': { attempts: 20, errors: 8, errorRate: 0.40 } }
    };

    for (const op of operations) {
        const profile = { skills: skillsByOp[op], totalAttempted: 20, totalErrors: 8 };
        const { pages } = generateAdaptivePages(op, '8', profile, `test-${op}`);
        assert.strictEqual(pages.length, PAGES_PER_WEEK, `${op} should have ${PAGES_PER_WEEK} pages`);
        assert(pages[0].problems.length > 0, `${op} page 1 should have problems`);
    }
});

test('handles profile with only strong skills', () => {
    const profile = {
        skills: {
            'add-no-carry': { attempts: 50, errors: 1, errorRate: 0.02 },
            'add-carry-once': { attempts: 50, errors: 2, errorRate: 0.04 }
        },
        totalAttempted: 100,
        totalErrors: 3
    };

    const { pages, reasoning } = generateAdaptivePages('addition', '7', profile, 'strong-only');
    assert.strictEqual(pages.length, PAGES_PER_WEEK);
    assert(pages[0].problems.length > 0, 'Should still generate problems');
    assert.strictEqual(reasoning.weakSkills.length, 0, 'No weak skills expected');
});

test('handles profile with only weak skills', () => {
    const profile = {
        skills: {
            'sub-borrow-once': { attempts: 20, errors: 12, errorRate: 0.60 },
            'sub-borrow-zero': { attempts: 20, errors: 10, errorRate: 0.50 }
        },
        totalAttempted: 40,
        totalErrors: 22
    };

    const { pages, reasoning } = generateAdaptivePages('subtraction', '8', profile, 'weak-only');
    assert.strictEqual(pages.length, PAGES_PER_WEEK);
    assert(pages[0].problems.length > 0, 'Should still generate problems');
    assert(reasoning.weakSkills.length > 0, 'Should have weak skills');
});

// ============================================================================
console.log('\n=== Distribution Validation ===');
// ============================================================================

test('distribution constants are valid', () => {
    const total = DISTRIBUTION.weak + DISTRIBUTION.medium + DISTRIBUTION.strong;
    assert(Math.abs(total - 1.0) < 0.001, `Distribution should sum to ~1.0, got ${total}`);
});

test('problems per page is 20', () => {
    assert.strictEqual(PROBLEMS_PER_PAGE, 20);
});

test('pages per week is 7', () => {
    assert.strictEqual(PAGES_PER_WEEK, 7);
});

test('weak threshold is 30%', () => {
    assert.strictEqual(THRESHOLDS.weak, 0.30);
});

test('medium threshold is 10%', () => {
    assert.strictEqual(THRESHOLDS.medium, 0.10);
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
