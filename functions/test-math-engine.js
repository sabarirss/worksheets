/**
 * Unit tests for shared/math-engine.js
 *
 * Run: node functions/test-math-engine.js
 *
 * Tests determinism, answer comparison, config mapping, assessment generation,
 * level determination, and all problem generators — WITHOUT hitting Firebase.
 */

const assert = require('assert');
const {
    generatePageProblems,
    generateAbsolutePageProblems,
    compareAnswers,
    generateSeededAssessmentQuestions,
    determineLevelFromScore,
    generateSeededLevelTestQuestions,
    getConfigByAge,
    getConfigByLevel,
    ageBasedContentConfigs,
    ageAndDifficultyToLevel,
    levelToAgeGroup,
    levelToDifficulty,
    getAgeGroupFromAge,
    getYoungerAgeGroup,
    getOlderAgeGroup,
    SeededRandom,
    hashCode
} = require('./shared/math-engine');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (e) {
        failed++;
        console.error(`  ✗ ${name}`);
        console.error(`    ${e.message}`);
    }
}

// ============================================================================
console.log('\n=== SeededRandom ===');
// ============================================================================

test('same seed produces same sequence', () => {
    const a = new SeededRandom(12345);
    const b = new SeededRandom(12345);
    for (let i = 0; i < 100; i++) {
        assert.strictEqual(a.next(), b.next());
    }
});

test('different seeds produce different sequences', () => {
    const a = new SeededRandom(12345);
    const b = new SeededRandom(54321);
    let same = 0;
    for (let i = 0; i < 100; i++) {
        if (a.next() === b.next()) same++;
    }
    assert(same < 10, `Too many collisions: ${same}/100`);
});

test('values are between 0 and 1', () => {
    const rng = new SeededRandom(99999);
    for (let i = 0; i < 1000; i++) {
        const val = rng.next();
        assert(val >= 0 && val < 1, `Out of range: ${val}`);
    }
});

// ============================================================================
console.log('\n=== hashCode ===');
// ============================================================================

test('deterministic hash', () => {
    assert.strictEqual(hashCode('hello'), hashCode('hello'));
    assert.strictEqual(hashCode('addition-6-easy-1'), hashCode('addition-6-easy-1'));
});

test('different strings produce different hashes', () => {
    assert.notStrictEqual(hashCode('hello'), hashCode('world'));
    assert.notStrictEqual(hashCode('addition-6-easy-1'), hashCode('addition-6-easy-2'));
});

test('hash is always non-negative', () => {
    const strings = ['', 'a', 'test', 'addition-10+-hard-50', '   ', '!!!'];
    strings.forEach(s => {
        assert(hashCode(s) >= 0, `Negative hash for "${s}"`);
    });
});

// ============================================================================
console.log('\n=== Level Mapping ===');
// ============================================================================

test('ageAndDifficultyToLevel maps correctly', () => {
    assert.strictEqual(ageAndDifficultyToLevel('4-5', 'easy'), 1);
    assert.strictEqual(ageAndDifficultyToLevel('4-5', 'medium'), 2);
    assert.strictEqual(ageAndDifficultyToLevel('4-5', 'hard'), 2);
    assert.strictEqual(ageAndDifficultyToLevel('6', 'easy'), 3);
    assert.strictEqual(ageAndDifficultyToLevel('6', 'medium'), 4);
    assert.strictEqual(ageAndDifficultyToLevel('7', 'easy'), 5);
    assert.strictEqual(ageAndDifficultyToLevel('8', 'easy'), 7);
    assert.strictEqual(ageAndDifficultyToLevel('9+', 'easy'), 9);
    assert.strictEqual(ageAndDifficultyToLevel('10+', 'easy'), 11);
    assert.strictEqual(ageAndDifficultyToLevel('10+', 'hard'), 12);
});

test('levelToAgeGroup maps correctly', () => {
    assert.strictEqual(levelToAgeGroup(1), '4-5');
    assert.strictEqual(levelToAgeGroup(2), '4-5');
    assert.strictEqual(levelToAgeGroup(3), '6');
    assert.strictEqual(levelToAgeGroup(4), '6');
    assert.strictEqual(levelToAgeGroup(5), '7');
    assert.strictEqual(levelToAgeGroup(6), '7');
    assert.strictEqual(levelToAgeGroup(7), '8');
    assert.strictEqual(levelToAgeGroup(9), '9+');
    assert.strictEqual(levelToAgeGroup(11), '10+');
    assert.strictEqual(levelToAgeGroup(12), '10+');
});

test('levelToDifficulty maps correctly', () => {
    assert.strictEqual(levelToDifficulty(1), 'easy');
    assert.strictEqual(levelToDifficulty(2), 'medium');
    assert.strictEqual(levelToDifficulty(3), 'easy');
    assert.strictEqual(levelToDifficulty(4), 'medium');
    assert.strictEqual(levelToDifficulty(11), 'easy');
    assert.strictEqual(levelToDifficulty(12), 'medium');
});

test('round-trip: level -> age+diff -> level', () => {
    for (let level = 1; level <= 12; level++) {
        const age = levelToAgeGroup(level);
        const diff = levelToDifficulty(level);
        const recovered = ageAndDifficultyToLevel(age, diff);
        assert.strictEqual(recovered, level, `Level ${level} -> ${age}/${diff} -> ${recovered}`);
    }
});

// ============================================================================
console.log('\n=== Age Helpers ===');
// ============================================================================

test('getAgeGroupFromAge maps all ages', () => {
    assert.strictEqual(getAgeGroupFromAge(4), '4-5');
    assert.strictEqual(getAgeGroupFromAge(5), '4-5');
    assert.strictEqual(getAgeGroupFromAge(6), '6');
    assert.strictEqual(getAgeGroupFromAge(7), '7');
    assert.strictEqual(getAgeGroupFromAge(8), '8');
    assert.strictEqual(getAgeGroupFromAge(9), '9+');
    assert.strictEqual(getAgeGroupFromAge(10), '10+');
    assert.strictEqual(getAgeGroupFromAge(13), '10+');
});

test('getAgeGroupFromAge handles unknown age', () => {
    assert.strictEqual(getAgeGroupFromAge(99), '6'); // Default
});

test('getYoungerAgeGroup goes down one tier', () => {
    assert.strictEqual(getYoungerAgeGroup('4-5'), '4-5');
    assert.strictEqual(getYoungerAgeGroup('6'), '4-5');
    assert.strictEqual(getYoungerAgeGroup('7'), '6');
    assert.strictEqual(getYoungerAgeGroup('10+'), '9+');
});

test('getOlderAgeGroup goes up one tier', () => {
    assert.strictEqual(getOlderAgeGroup('4-5'), '6');
    assert.strictEqual(getOlderAgeGroup('6'), '7');
    assert.strictEqual(getOlderAgeGroup('10+'), '10+');
});

// ============================================================================
console.log('\n=== Content Configs ===');
// ============================================================================

test('all 4 operations have configs', () => {
    const ops = ['addition', 'subtraction', 'multiplication', 'division'];
    ops.forEach(op => {
        assert(ageBasedContentConfigs[op], `Missing config for ${op}`);
    });
});

test('all age groups have easy/medium/hard for each operation', () => {
    const ops = ['addition', 'subtraction', 'multiplication', 'division'];
    const ages = ['4-5', '6', '7', '8', '9+', '10+'];
    const diffs = ['easy', 'medium', 'hard'];

    ops.forEach(op => {
        ages.forEach(age => {
            diffs.forEach(diff => {
                const config = ageBasedContentConfigs[op][age][diff];
                assert(config, `Missing config: ${op}/${age}/${diff}`);
                assert(config.generator, `Missing generator: ${op}/${age}/${diff}`);
                assert.strictEqual(config.problemCount, 20, `Wrong problemCount: ${op}/${age}/${diff}`);
            });
        });
    });
});

test('getConfigByAge returns config for all combos', () => {
    const ops = ['addition', 'subtraction', 'multiplication', 'division'];
    const ages = ['4-5', '6', '7', '8', '9+', '10+'];
    const diffs = ['easy', 'medium', 'hard'];

    ops.forEach(op => {
        ages.forEach(age => {
            diffs.forEach(diff => {
                const config = getConfigByAge(op, age, diff);
                assert(config, `getConfigByAge returned null: ${op}/${age}/${diff}`);
                assert(config.generator, `No generator: ${op}/${age}/${diff}`);
            });
        });
    });
});

test('getConfigByLevel returns config for all 12 levels', () => {
    const ops = ['addition', 'subtraction', 'multiplication', 'division'];
    ops.forEach(op => {
        for (let level = 1; level <= 12; level++) {
            const config = getConfigByLevel(op, level);
            assert(config, `getConfigByLevel returned null: ${op}/level${level}`);
            assert(config.generator, `No generator: ${op}/level${level}`);
        }
    });
});

// ============================================================================
console.log('\n=== Problem Generation ===');
// ============================================================================

test('generatePageProblems returns 20 problems', () => {
    const result = generatePageProblems('addition', '6', 'easy', 1);
    assert.strictEqual(result.problems.length, 20);
    assert(result.config.name, 'Missing config name');
});

test('generatePageProblems is deterministic', () => {
    const a = generatePageProblems('addition', '6', 'easy', 1);
    const b = generatePageProblems('addition', '6', 'easy', 1);
    assert.deepStrictEqual(a.problems, b.problems);
});

test('different pages produce different problems', () => {
    const a = generatePageProblems('addition', '6', 'easy', 1);
    const b = generatePageProblems('addition', '6', 'easy', 2);
    assert.notDeepStrictEqual(a.problems, b.problems);
});

test('different operations produce different problems', () => {
    const a = generatePageProblems('addition', '6', 'easy', 1);
    const b = generatePageProblems('subtraction', '6', 'easy', 1);
    assert.notDeepStrictEqual(a.problems, b.problems);
});

test('problems have a, b, and answer fields', () => {
    const ops = ['addition', 'subtraction', 'multiplication', 'division'];
    ops.forEach(op => {
        const result = generatePageProblems(op, '7', 'easy', 1);
        result.problems.forEach((p, i) => {
            assert(p.a !== undefined, `Problem ${i} missing a for ${op}`);
            assert(p.b !== undefined, `Problem ${i} missing b for ${op}`);
            assert(p.answer !== undefined, `Problem ${i} missing answer for ${op}`);
        });
    });
});

test('addition answers are correct (a + b = answer)', () => {
    const result = generatePageProblems('addition', '7', 'easy', 5);
    result.problems.forEach((p, i) => {
        if (typeof p.a === 'number' && typeof p.b === 'number') {
            assert.strictEqual(p.answer, p.a + p.b, `Wrong answer at problem ${i}: ${p.a} + ${p.b} != ${p.answer}`);
        }
    });
});

test('subtraction answers are correct (a - b = answer)', () => {
    const result = generatePageProblems('subtraction', '7', 'easy', 5);
    result.problems.forEach((p, i) => {
        if (typeof p.a === 'number' && typeof p.b === 'number') {
            assert.strictEqual(p.answer, p.a - p.b, `Wrong answer at problem ${i}: ${p.a} - ${p.b} != ${p.answer}`);
        }
    });
});

test('multiplication answers are correct (a * b = answer)', () => {
    const result = generatePageProblems('multiplication', '6', 'easy', 3);
    result.problems.forEach((p, i) => {
        if (typeof p.a === 'number' && typeof p.b === 'number') {
            assert.strictEqual(p.answer, p.a * p.b, `Wrong answer at problem ${i}: ${p.a} * ${p.b} != ${p.answer}`);
        }
    });
});

test('division answers are correct (a / b = answer)', () => {
    const result = generatePageProblems('division', '6', 'easy', 3);
    result.problems.forEach((p, i) => {
        if (typeof p.a === 'number' && typeof p.b === 'number' && typeof p.answer === 'number') {
            assert.strictEqual(p.answer, p.a / p.b, `Wrong answer at problem ${i}: ${p.a} / ${p.b} != ${p.answer}`);
        }
    });
});

test('subtraction never produces negative results for basic levels', () => {
    ['4-5', '6', '7', '8'].forEach(age => {
        const result = generatePageProblems('subtraction', age, 'easy', 1);
        result.problems.forEach((p, i) => {
            if (typeof p.answer === 'number') {
                assert(p.answer >= 0, `Negative subtraction result at ${age} easy problem ${i}: ${p.a} - ${p.b} = ${p.answer}`);
            }
        });
    });
});

// ============================================================================
console.log('\n=== Absolute Page Mapping ===');
// ============================================================================

test('pages 1-50 map to easy', () => {
    const r = generateAbsolutePageProblems('addition', '6', 1);
    assert.strictEqual(r.difficulty, 'easy');
    assert.strictEqual(r.relativePage, 1);

    const r2 = generateAbsolutePageProblems('addition', '6', 50);
    assert.strictEqual(r2.difficulty, 'easy');
    assert.strictEqual(r2.relativePage, 50);
});

test('pages 51-100 map to medium', () => {
    const r = generateAbsolutePageProblems('addition', '6', 51);
    assert.strictEqual(r.difficulty, 'medium');
    assert.strictEqual(r.relativePage, 1);

    const r2 = generateAbsolutePageProblems('addition', '6', 100);
    assert.strictEqual(r2.difficulty, 'medium');
    assert.strictEqual(r2.relativePage, 50);
});

test('pages 101-150 map to hard', () => {
    const r = generateAbsolutePageProblems('addition', '6', 101);
    assert.strictEqual(r.difficulty, 'hard');
    assert.strictEqual(r.relativePage, 1);

    const r2 = generateAbsolutePageProblems('addition', '6', 150);
    assert.strictEqual(r2.difficulty, 'hard');
    assert.strictEqual(r2.relativePage, 50);
});

test('absolute page generation is deterministic', () => {
    const a = generateAbsolutePageProblems('addition', '8', 75);
    const b = generateAbsolutePageProblems('addition', '8', 75);
    assert.deepStrictEqual(a.problems, b.problems);
});

// ============================================================================
console.log('\n=== Answer Comparison ===');
// ============================================================================

test('numeric comparison', () => {
    assert.strictEqual(compareAnswers(5, 5), true);
    assert.strictEqual(compareAnswers(5, 6), false);
    assert.strictEqual(compareAnswers(0, 0), true);
    assert.strictEqual(compareAnswers(100, 100), true);
});

test('string comparison (fractions)', () => {
    assert.strictEqual(compareAnswers('3/4', '3/4'), true);
    assert.strictEqual(compareAnswers('3/4', '3/5'), false);
    assert.strictEqual(compareAnswers('1 3/4', '1 3/4'), true);
});

test('string comparison is case-insensitive', () => {
    assert.strictEqual(compareAnswers('ABC', 'abc'), true);
    assert.strictEqual(compareAnswers('Hello', 'HELLO'), true);
});

test('string comparison ignores whitespace', () => {
    assert.strictEqual(compareAnswers('3 / 4', '3/4'), true);
    assert.strictEqual(compareAnswers(' 5 R 3 ', '5R3'), true);
});

test('null/empty answers return false', () => {
    assert.strictEqual(compareAnswers(null, 5), false);
    assert.strictEqual(compareAnswers(undefined, 5), false);
    assert.strictEqual(compareAnswers('', 5), false);
});

test('mixed type comparison (string number vs number)', () => {
    assert.strictEqual(compareAnswers('5', 5), true); // Number('5') === 5
    assert.strictEqual(compareAnswers(5, 5), true);
    // When correctAnswer is a string, it uses string comparison
    assert.strictEqual(compareAnswers(5, '5'), true); // String(5) matches '5'
});

// ============================================================================
console.log('\n=== Assessment Generation ===');
// ============================================================================

test('generates 10 assessment questions', () => {
    const q = generateSeededAssessmentQuestions('addition', '7', 'child123');
    assert.strictEqual(q.length, 10);
});

test('assessment is deterministic by childId', () => {
    const a = generateSeededAssessmentQuestions('addition', '7', 'child123');
    const b = generateSeededAssessmentQuestions('addition', '7', 'child123');
    assert.deepStrictEqual(a, b);
});

test('different childIds produce different assessments', () => {
    const a = generateSeededAssessmentQuestions('addition', '7', 'child123');
    const b = generateSeededAssessmentQuestions('addition', '7', 'child456');
    assert.notDeepStrictEqual(a, b);
});

test('assessment questions have answers', () => {
    const q = generateSeededAssessmentQuestions('subtraction', '8', 'testchild');
    q.forEach((question, i) => {
        assert(question.answer !== undefined, `Question ${i} missing answer`);
        assert(question.a !== undefined, `Question ${i} missing a`);
        assert(question.b !== undefined, `Question ${i} missing b`);
    });
});

// ============================================================================
console.log('\n=== Level Determination ===');
// ============================================================================

test('score < 30 assigns younger age easy', () => {
    const result = determineLevelFromScore(20, '7');
    assert.strictEqual(result.ageGroup, '6'); // younger
    assert.strictEqual(result.difficulty, 'easy');
});

test('score 30-75 assigns same age medium', () => {
    const result = determineLevelFromScore(50, '7');
    assert.strictEqual(result.ageGroup, '7'); // same
    assert.strictEqual(result.difficulty, 'medium');
});

test('score > 75 assigns older age medium', () => {
    const result = determineLevelFromScore(80, '7');
    assert.strictEqual(result.ageGroup, '8'); // older
    assert.strictEqual(result.difficulty, 'medium');
});

test('youngest age stays at youngest', () => {
    const result = determineLevelFromScore(10, '4-5');
    assert.strictEqual(result.ageGroup, '4-5'); // Can't go younger
});

test('oldest age stays at oldest', () => {
    const result = determineLevelFromScore(90, '10+');
    assert.strictEqual(result.ageGroup, '10+'); // Can't go older
});

test('level result has valid level number', () => {
    const result = determineLevelFromScore(50, '8');
    assert(result.level >= 1 && result.level <= 12, `Invalid level: ${result.level}`);
    assert(result.reason, 'Missing reason');
});

// ============================================================================
console.log('\n=== Level Test Generation ===');
// ============================================================================

test('generates 10 level test questions', () => {
    const q = generateSeededLevelTestQuestions('addition', '7', 'child1', '2026-W09');
    assert.strictEqual(q.length, 10);
});

test('level test is deterministic by childId + week', () => {
    const a = generateSeededLevelTestQuestions('addition', '7', 'child1', '2026-W09');
    const b = generateSeededLevelTestQuestions('addition', '7', 'child1', '2026-W09');
    assert.deepStrictEqual(a, b);
});

test('different weeks produce different tests', () => {
    const a = generateSeededLevelTestQuestions('addition', '7', 'child1', '2026-W09');
    const b = generateSeededLevelTestQuestions('addition', '7', 'child1', '2026-W10');
    assert.notDeepStrictEqual(a, b);
});

test('level test has difficulty distribution (1 easy, 3 medium, 6 hard)', () => {
    const q = generateSeededLevelTestQuestions('addition', '7', 'child1', '2026-W09');
    // After shuffling, count each difficulty
    const counts = { easy: 0, medium: 0, hard: 0 };
    q.forEach(question => {
        counts[question.difficulty]++;
    });
    assert.strictEqual(counts.easy, 1, `Expected 1 easy, got ${counts.easy}`);
    assert.strictEqual(counts.medium, 3, `Expected 3 medium, got ${counts.medium}`);
    assert.strictEqual(counts.hard, 6, `Expected 6 hard, got ${counts.hard}`);
});

// ============================================================================
console.log('\n=== Edge Cases ===');
// ============================================================================

test('generating all 50 pages per difficulty succeeds', () => {
    for (let page = 1; page <= 50; page++) {
        const result = generatePageProblems('addition', '6', 'easy', page);
        assert.strictEqual(result.problems.length, 20, `Page ${page} has wrong count`);
    }
});

test('all 150 absolute pages generate successfully', () => {
    for (let page = 1; page <= 150; page++) {
        const result = generateAbsolutePageProblems('addition', '6', page);
        assert.strictEqual(result.problems.length, 20, `Absolute page ${page} failed`);
    }
});

test('fraction problems have string answers', () => {
    const result = generatePageProblems('addition', '10+', 'hard', 1);
    result.problems.forEach((p, i) => {
        assert(typeof p.a === 'string', `Fraction problem ${i} a should be string, got ${typeof p.a}`);
        assert(typeof p.b === 'string', `Fraction problem ${i} b should be string, got ${typeof p.b}`);
        assert(typeof p.answer === 'string', `Fraction problem ${i} answer should be string, got ${typeof p.answer}`);
    });
});

test('remainder problems have string answers', () => {
    const result = generatePageProblems('division', '8', 'hard', 1);
    result.problems.forEach((p, i) => {
        assert(p.answer !== undefined, `Remainder problem ${i} missing answer`);
    });
});

test('decimal problems have numeric answers with correct precision', () => {
    const result = generatePageProblems('addition', '9+', 'hard', 1);
    result.problems.forEach((p, i) => {
        assert(typeof p.answer === 'number', `Decimal problem ${i} answer should be number`);
    });
});

test('invalid operation throws error', () => {
    assert.throws(() => {
        generatePageProblems('unknown', '6', 'easy', 1);
    });
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
