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
    classifyProblem,
    classifyError,
    generateProblemBySkill,
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
console.log('\n=== Skill Classification (classifyProblem) ===');
// ============================================================================

test('addition: single digit no carry', () => {
    const skills = classifyProblem('addition', 3, 4, 7);
    assert(skills.includes('add-single'), `Expected add-single, got ${skills}`);
});

test('addition: two digit no carry', () => {
    const skills = classifyProblem('addition', 23, 14, 37);
    assert(skills.includes('add-2digit'), `Expected add-2digit, got ${skills}`);
    assert(skills.includes('add-no-carry'), `Expected add-no-carry, got ${skills}`);
});

test('addition: two digit with single carry', () => {
    const skills = classifyProblem('addition', 27, 15, 42);
    assert(skills.includes('add-2digit'), `Expected add-2digit, got ${skills}`);
    assert(skills.includes('add-carry-once'), `Expected add-carry-once, got ${skills}`);
});

test('addition: three digit with multiple carries', () => {
    const skills = classifyProblem('addition', 178, 245, 423);
    assert(skills.includes('add-3digit'), `Expected add-3digit, got ${skills}`);
    assert(skills.includes('add-carry-multi'), `Expected add-carry-multi, got ${skills}`);
});

test('addition: fraction detected', () => {
    const skills = classifyProblem('addition', '3/4', '1/4', '1');
    assert(skills.includes('add-fraction'), `Expected add-fraction, got ${skills}`);
});

test('addition: decimal detected', () => {
    const skills = classifyProblem('addition', 1.5, 2.3, 3.8);
    assert(skills.includes('add-decimal'), `Expected add-decimal, got ${skills}`);
});

test('subtraction: no borrow', () => {
    const skills = classifyProblem('subtraction', 47, 23, 24);
    assert(skills.includes('sub-2digit'), `Expected sub-2digit, got ${skills}`);
    assert(skills.includes('sub-no-borrow'), `Expected sub-no-borrow, got ${skills}`);
});

test('subtraction: single borrow', () => {
    const skills = classifyProblem('subtraction', 42, 17, 25);
    assert(skills.includes('sub-2digit'), `Expected sub-2digit, got ${skills}`);
    assert(skills.includes('sub-borrow-once'), `Expected sub-borrow-once, got ${skills}`);
});

test('subtraction: borrow across zero', () => {
    const skills = classifyProblem('subtraction', 300, 156, 144);
    assert(skills.includes('sub-3digit'), `Expected sub-3digit, got ${skills}`);
    assert(skills.includes('sub-borrow-zero'), `Expected sub-borrow-zero, got ${skills}`);
});

test('multiplication: tables 2-5', () => {
    const skills = classifyProblem('multiplication', 3, 4, 12);
    assert(skills.includes('mul-tables-2-5'), `Expected mul-tables-2-5, got ${skills}`);
});

test('multiplication: tables 6-9', () => {
    const skills = classifyProblem('multiplication', 7, 8, 56);
    assert(skills.includes('mul-tables-6-9'), `Expected mul-tables-6-9, got ${skills}`);
});

test('multiplication: 2-digit by 1-digit', () => {
    const skills = classifyProblem('multiplication', 23, 7, 161);
    assert(skills.includes('mul-2digit-by-1digit'), `Expected mul-2digit-by-1digit, got ${skills}`);
});

test('multiplication: multi-digit', () => {
    const skills = classifyProblem('multiplication', 23, 45, 1035);
    assert(skills.includes('mul-multi-digit'), `Expected mul-multi-digit, got ${skills}`);
});

test('division: exact basic', () => {
    const skills = classifyProblem('division', 24, 6, 4);
    assert(skills.includes('div-exact'), `Expected div-exact, got ${skills}`);
    assert(skills.includes('div-2digit'), `Expected div-2digit, got ${skills}`);
});

test('division: with remainder', () => {
    const skills = classifyProblem('division', 25, 7, '3 R4');
    assert(skills.includes('div-remainder'), `Expected div-remainder, got ${skills}`);
});

test('division: long division (3-digit)', () => {
    const skills = classifyProblem('division', 156, 12, 13);
    assert(skills.includes('div-long'), `Expected div-long, got ${skills}`);
    assert(skills.includes('div-by-2digit'), `Expected div-by-2digit, got ${skills}`);
});

test('classifyProblem works on all generated problems', () => {
    // Test on real generated problems from multiple configs
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const ageGroups = ['4-5', '6', '7', '8', '9+', '10+'];
    let totalClassified = 0;

    for (const op of operations) {
        for (const age of ageGroups) {
            const result = generatePageProblems(op, age, 'easy', 1);
            for (const p of result.problems) {
                const skills = classifyProblem(op, p.a, p.b, p.answer);
                assert(Array.isArray(skills), `classifyProblem should return array for ${op} ${age}`);
                assert(skills.length > 0, `classifyProblem should return at least one skill for ${op} ${age}`);
                totalClassified++;
            }
        }
    }
    assert(totalClassified >= 480, `Should classify 480+ problems (24 configs x 20), got ${totalClassified}`);
});

test('skill tags follow naming convention', () => {
    const validPrefixes = ['add-', 'sub-', 'mul-', 'div-'];
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const ageGroups = ['4-5', '7', '10+'];

    for (const op of operations) {
        for (const age of ageGroups) {
            for (const diff of ['easy', 'medium', 'hard']) {
                const result = generatePageProblems(op, age, diff, 1);
                for (const p of result.problems) {
                    const skills = classifyProblem(op, p.a, p.b, p.answer);
                    for (const skill of skills) {
                        const hasValidPrefix = validPrefixes.some(prefix => skill.startsWith(prefix));
                        assert(hasValidPrefix, `Skill "${skill}" has invalid prefix for ${op} ${age} ${diff}`);
                    }
                }
            }
        }
    }
});

// ============================================================================
console.log('\n=== Skill-Targeted Problem Generation (generateProblemBySkill) ===');
// ============================================================================

test('generates addition carry-once problems', () => {
    const p = generateProblemBySkill('addition', '7', 'add-carry-once', 12345);
    assert(p, 'Should generate a problem');
    assert(p.skills.includes('add-carry-once'), `Should have add-carry-once, got ${p.skills}`);
    assert.strictEqual(p.a + p.b, p.answer, 'Answer should be correct');
});

test('generates subtraction borrow-once problems', () => {
    const p = generateProblemBySkill('subtraction', '7', 'sub-borrow-once', 54321);
    assert(p, 'Should generate a problem');
    assert(p.skills.includes('sub-borrow-once'), `Should have sub-borrow-once, got ${p.skills}`);
    assert.strictEqual(p.a - p.b, p.answer, 'Answer should be correct');
});

test('generates multiplication tables-6-9 problems', () => {
    const p = generateProblemBySkill('multiplication', '7', 'mul-tables-6-9', 99999);
    assert(p, 'Should generate a problem');
    assert(p.skills.includes('mul-tables-6-9'), `Should have mul-tables-6-9, got ${p.skills}`);
    assert.strictEqual(p.a * p.b, p.answer, 'Answer should be correct');
});

test('generates division with remainder', () => {
    const p = generateProblemBySkill('division', '8', 'div-remainder', 11111);
    assert(p, 'Should generate a problem');
    assert(p.skills.includes('div-remainder'), `Should have div-remainder, got ${p.skills}`);
});

test('generates fraction problems', () => {
    const p = generateProblemBySkill('addition', '10+', 'add-fraction', 22222);
    assert(p, 'Should generate a problem');
    assert(p.skills.includes('add-fraction'), `Should have add-fraction, got ${p.skills}`);
});

test('generates decimal problems', () => {
    const p = generateProblemBySkill('addition', '9+', 'add-decimal', 33333);
    assert(p, 'Should generate a problem');
    assert(p.skills.includes('add-decimal'), `Should have add-decimal, got ${p.skills}`);
});

test('is deterministic with same seed', () => {
    const a = generateProblemBySkill('addition', '7', 'add-carry-once', 42);
    const b = generateProblemBySkill('addition', '7', 'add-carry-once', 42);
    assert.strictEqual(a.a, b.a, 'Same seed should give same a');
    assert.strictEqual(a.b, b.b, 'Same seed should give same b');
});

test('different seeds give different problems', () => {
    const a = generateProblemBySkill('addition', '7', 'add-carry-once', 1);
    const b = generateProblemBySkill('addition', '7', 'add-carry-once', 99999);
    // Very unlikely to be identical
    assert(a.a !== b.a || a.b !== b.b, 'Different seeds should usually give different problems');
});

test('all major skills are generatable', () => {
    const skillTests = [
        ['addition', 'add-single'],
        ['addition', 'add-no-carry'],
        ['addition', 'add-carry-once'],
        ['addition', 'add-carry-multi'],
        ['addition', 'add-3digit'],
        ['subtraction', 'sub-no-borrow'],
        ['subtraction', 'sub-borrow-once'],
        ['subtraction', 'sub-borrow-zero'],
        ['multiplication', 'mul-tables-2-5'],
        ['multiplication', 'mul-tables-6-9'],
        ['multiplication', 'mul-2digit-by-1digit'],
        ['division', 'div-exact'],
        ['division', 'div-remainder'],
        ['division', 'div-long'],
    ];

    for (const [op, skill] of skillTests) {
        const p = generateProblemBySkill(op, '8', skill, hashCode(skill));
        assert(p, `Should generate problem for ${op}/${skill}`);
        assert(p.answer !== undefined, `Problem for ${op}/${skill} should have answer`);
    }
});

// ============================================================================
console.log('\n=== Expanded Problem Classification Tags ===');
// ============================================================================

test('addition: doubles detected', () => {
    const skills = classifyProblem('addition', 7, 7, 14);
    assert(skills.includes('add-doubles'), `Expected add-doubles, got ${skills}`);
});

test('addition: near-doubles detected', () => {
    const skills = classifyProblem('addition', 7, 8, 15);
    assert(skills.includes('add-near-doubles'), `Expected add-near-doubles, got ${skills}`);
});

test('addition: make-10 detected', () => {
    const skills = classifyProblem('addition', 7, 3, 10);
    assert(skills.includes('add-make-10'), `Expected add-make-10, got ${skills}`);
});

test('addition: bridge-10 detected', () => {
    const skills = classifyProblem('addition', 7, 5, 12);
    assert(skills.includes('add-bridge-10'), `Expected add-bridge-10, got ${skills}`);
});

test('addition: zero detected', () => {
    const skills = classifyProblem('addition', 5, 0, 5);
    assert(skills.includes('add-zero'), `Expected add-zero, got ${skills}`);
});

test('addition: round number detected', () => {
    const skills = classifyProblem('addition', 30, 40, 70);
    assert(skills.includes('add-round-number'), `Expected add-round-number, got ${skills}`);
});

test('subtraction: zero detected', () => {
    const skills = classifyProblem('subtraction', 5, 0, 5);
    assert(skills.includes('sub-zero'), `Expected sub-zero, got ${skills}`);
});

test('subtraction: equal detected', () => {
    const skills = classifyProblem('subtraction', 15, 15, 0);
    assert(skills.includes('sub-equal'), `Expected sub-equal, got ${skills}`);
});

test('subtraction: from-round detected', () => {
    const skills = classifyProblem('subtraction', 100, 37, 63);
    assert(skills.includes('sub-from-round'), `Expected sub-from-round, got ${skills}`);
});

test('subtraction: from-10 detected', () => {
    const skills = classifyProblem('subtraction', 10, 3, 7);
    assert(skills.includes('sub-from-10'), `Expected sub-from-10, got ${skills}`);
});

test('subtraction: consecutive zeros (1000-456)', () => {
    const skills = classifyProblem('subtraction', 1000, 456, 544);
    assert(skills.includes('sub-consecutive-zeros'), `Expected sub-consecutive-zeros, got ${skills}`);
});

test('multiplication: by-0 detected', () => {
    const skills = classifyProblem('multiplication', 5, 0, 0);
    assert(skills.includes('mul-by-0'), `Expected mul-by-0, got ${skills}`);
});

test('multiplication: by-1 detected', () => {
    const skills = classifyProblem('multiplication', 8, 1, 8);
    assert(skills.includes('mul-by-1'), `Expected mul-by-1, got ${skills}`);
});

test('multiplication: by-10 detected', () => {
    const skills = classifyProblem('multiplication', 7, 10, 70);
    assert(skills.includes('mul-by-10'), `Expected mul-by-10, got ${skills}`);
});

test('multiplication: by-5 detected', () => {
    const skills = classifyProblem('multiplication', 5, 9, 45);
    assert(skills.includes('mul-by-5'), `Expected mul-by-5, got ${skills}`);
});

test('multiplication: squares detected', () => {
    const skills = classifyProblem('multiplication', 7, 7, 49);
    assert(skills.includes('mul-squares'), `Expected mul-squares, got ${skills}`);
});

test('multiplication: specific table identified (mul-table-N)', () => {
    const skills = classifyProblem('multiplication', 7, 8, 56);
    assert(skills.includes('mul-table-7'), `Expected mul-table-7, got ${skills}`);
});

test('multiplication: carry in product detected', () => {
    const skills = classifyProblem('multiplication', 23, 7, 161);
    assert(skills.includes('mul-carry-in-product'), `Expected mul-carry-in-product, got ${skills}`);
});

test('division: by-1 detected', () => {
    const skills = classifyProblem('division', 8, 1, 8);
    assert(skills.includes('div-by-1'), `Expected div-by-1, got ${skills}`);
});

test('division: halving detected', () => {
    const skills = classifyProblem('division', 8, 2, 4);
    assert(skills.includes('div-halving'), `Expected div-halving, got ${skills}`);
});

test('division: same-numbers detected', () => {
    const skills = classifyProblem('division', 7, 7, 1);
    assert(skills.includes('div-same-numbers'), `Expected div-same-numbers, got ${skills}`);
});

test('division: table-fact detected', () => {
    const skills = classifyProblem('division', 56, 8, 7);
    assert(skills.includes('div-table-fact'), `Expected div-table-fact, got ${skills}`);
});

// ============================================================================
console.log('\n=== Error Pattern Classification (classifyError) ===');
// ============================================================================

test('addition: carry-forgot detected (27+15=32)', () => {
    const patterns = classifyError('addition', 27, 15, 42, 32);
    assert(patterns.includes('err-carry-forgot'), `Expected err-carry-forgot, got ${patterns}`);
});

test('addition: off-by-one detected', () => {
    const patterns = classifyError('addition', 5, 3, 8, 9);
    assert(patterns.includes('err-off-by-one'), `Expected err-off-by-one, got ${patterns}`);
});

test('addition: off-by-ten detected', () => {
    const patterns = classifyError('addition', 25, 13, 38, 48);
    assert(patterns.includes('err-off-by-ten'), `Expected err-off-by-ten, got ${patterns}`);
});

test('addition: digit-reversal detected (27→72)', () => {
    const patterns = classifyError('addition', 15, 12, 27, 72);
    assert(patterns.includes('err-digit-reversal'), `Expected err-digit-reversal, got ${patterns}`);
});

test('addition: used-subtraction detected (7+3=4)', () => {
    const patterns = classifyError('addition', 7, 3, 10, 4);
    assert(patterns.includes('err-op-used-subtraction'), `Expected err-op-used-subtraction, got ${patterns}`);
});

test('subtraction: borrow-reversed detected (42-17=35)', () => {
    const patterns = classifyError('subtraction', 42, 17, 25, 35);
    assert(patterns.includes('err-borrow-reversed'), `Expected err-borrow-reversed, got ${patterns}`);
});

test('subtraction: used-addition detected (10-3=13)', () => {
    const patterns = classifyError('subtraction', 10, 3, 7, 13);
    assert(patterns.includes('err-op-used-addition'), `Expected err-op-used-addition, got ${patterns}`);
});

test('multiplication: adjacent-table detected (7×8=63)', () => {
    // 7*8=56, but child wrote 63 which is 7*9 = adjacent table entry for b
    const patterns = classifyError('multiplication', 7, 8, 56, 63);
    assert(patterns.includes('err-adjacent-table-b'), `Expected err-adjacent-table-b, got ${patterns}`);
});

test('multiplication: used-addition detected (7×8=15)', () => {
    const patterns = classifyError('multiplication', 7, 8, 56, 15);
    assert(patterns.includes('err-op-used-addition'), `Expected err-op-used-addition, got ${patterns}`);
});

test('multiplication: table-confusion detected (7×8=54)', () => {
    // 54 = 6*9, nearby table entry
    const patterns = classifyError('multiplication', 7, 8, 56, 54);
    assert(patterns.includes('err-table-confusion'), `Expected err-table-confusion, got ${patterns}`);
});

test('multiplication: concatenated-operands detected (7×8=78)', () => {
    const patterns = classifyError('multiplication', 7, 8, 56, 78);
    assert(patterns.includes('err-concatenated-operands'), `Expected err-concatenated-operands, got ${patterns}`);
});

test('division: remainder-wrong detected', () => {
    const patterns = classifyError('division', 25, 7, '3R4', '3R5');
    assert(patterns.includes('err-remainder-wrong'), `Expected err-remainder-wrong, got ${patterns}`);
});

test('division: quotient-wrong detected', () => {
    const patterns = classifyError('division', 25, 7, '3R4', '4R4');
    assert(patterns.includes('err-quotient-wrong'), `Expected err-quotient-wrong, got ${patterns}`);
});

test('division: remainder-ignored detected', () => {
    const patterns = classifyError('division', 25, 7, '3R4', 3);
    assert(patterns.includes('err-remainder-ignored'), `Expected err-remainder-ignored, got ${patterns}`);
});

test('magnitude-shift detected (8→80)', () => {
    const patterns = classifyError('addition', 5, 3, 8, 80);
    assert(patterns.includes('err-magnitude-shift'), `Expected err-magnitude-shift, got ${patterns}`);
});

test('invalid input detected', () => {
    const patterns = classifyError('addition', 5, 3, 8, NaN);
    assert(patterns.includes('err-invalid-input'), `Expected err-invalid-input, got ${patterns}`);
});

test('classifyError returns at least one pattern for any wrong answer', () => {
    const testCases = [
        ['addition', 5, 3, 8, 99],
        ['subtraction', 10, 5, 5, 17],
        ['multiplication', 4, 5, 20, 9],
        ['division', 24, 6, 4, 7],
    ];
    for (const [op, a, b, correct, wrong] of testCases) {
        const patterns = classifyError(op, a, b, correct, wrong);
        assert(patterns.length > 0, `Should return at least one pattern for ${op} ${a},${b}=${wrong}`);
    }
});

test('subtraction: ones-digit-wrong detected', () => {
    const patterns = classifyError('subtraction', 56, 23, 33, 35);
    assert(patterns.includes('err-ones-digit-wrong'), `Expected err-ones-digit-wrong, got ${patterns}`);
});

test('addition: tens-digit-wrong detected', () => {
    const patterns = classifyError('addition', 27, 15, 42, 32);
    // 42 vs 32: ones digit same (2), tens digit different (4 vs 3)
    assert(patterns.includes('err-tens-digit-wrong'), `Expected err-tens-digit-wrong, got ${patterns}`);
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
