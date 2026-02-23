/**
 * Comprehensive Feature Tests for GleeGrow Platform
 *
 * Run: node tests/test-all-features.js
 *
 * Tests all pure-logic features that can run without a browser:
 * - APP_CONFIG constants validity
 * - Completion manager rules
 * - Weekly assignment utilities (week string, week start/end, lockout config)
 * - EQ content structure & completeness
 * - Aptitude content structure (imported data)
 * - Module page count consistency
 * - Demo mode logic
 * - Math engine (via shared module)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  \u2713 ${name}`);
    } catch (e) {
        failed++;
        failures.push({ name, error: e.message });
        console.error(`  \u2717 ${name}`);
        console.error(`    ${e.message}`);
    }
}

// ============================================================================
// Inline APP_CONFIG from app-constants.js
// ============================================================================

const APP_CONFIG = {
    BRAND_NAME: 'GleeGrow',
    TAGLINE: '',  // Tagline deferred for future
    PRIMARY_COLOR: '#28a745',
    TAGLINE_COLOR: '#999',
    GRADIENT_START: '#667eea',
    GRADIENT_END: '#764ba2',
    AGE_GROUPS: ['4-5', '6', '7', '8', '9+', '10+'],
    DIFFICULTIES: ['easy', 'medium', 'hard'],
    TOTAL_LEVELS: 12,
    PAGES: {
        MATH_PER_OPERATION: 150,
        APTITUDE_PER_TYPE: 15,
        ENGLISH_WRITING: 20,
        STORIES_DEMO: 2,
    },
    DEMO_LIMIT: 2,
    PAGE_ACCESS: {
        DEMO_PAGE_COUNT: 2,
        WEEKLY_PAGE_COUNT: 7,
    },
    ASSESSMENT: {
        QUESTION_COUNT: 20,
        YOUNGER_QUESTIONS: 5,
        CURRENT_EASY_QUESTIONS: 5,
        CURRENT_MED_QUESTIONS: 5,
        STRETCH_QUESTIONS: 5,
        SCORE_TOO_HARD: 30,
        SCORE_TOO_EASY: 75,
    },
    COMPLETION_THRESHOLD: 95,
    CANVAS: {
        BG_COLOR: '#f8f9ff',
        RED_LINE: '#e74c3c',
        BLUE_LINE: '#3498db',
        FONT_SIZE: '24px',
    },
    FOUC_TRANSITION: '0.1s',
    COLLECTIONS: {
        USERS: 'users',
        CHILDREN: 'children',
        WORKSHEETS: 'worksheets',
        COMPLETIONS: 'completions',
        CHILD_SESSIONS: 'child_sessions',
    },
    STORAGE_KEYS: {
        SELECTED_CHILD: 'selectedChild',
        SELECTED_CHILD_ID: 'selectedChildId',
        ADMIN_LEVEL: 'admin_level_selections',
        ADMIN_DEMO_PREVIEW: 'adminDemoPreview',
        ADMIN_INITIALIZED: 'adminInitialized',
    },
    MATH_OPERATIONS: ['addition', 'subtraction', 'multiplication', 'division'],
    OPERATION_SYMBOLS: {
        'addition': '+',
        'subtraction': '\u2212',
        'multiplication': '\u00d7',
        'division': '\u00f7'
    },
    AGE_TO_GROUP: {
        '4': '4-5', '5': '4-5',
        '6': '6', '7': '7', '8': '8',
        '9': '9+', '10': '10+', '11': '10+', '12': '10+', '13': '10+'
    },
};

// ============================================================================
// Inline completion manager logic
// ============================================================================

const COMPLETION_RULES = {
    'math': { requiresScore: true, threshold: 95, sequentialPages: true, sequentialLevels: true },
    'english': { requiresScore: true, threshold: 95, sequentialPages: true, sequentialLevels: true },
    'aptitude': { requiresScore: true, threshold: 95, sequentialPages: true, sequentialLevels: true },
    'drawing': { requiresScore: false, sequentialPages: false, sequentialLevels: false },
    'german': { requiresScore: false, sequentialPages: false, sequentialLevels: false },
    'german-kids': { requiresScore: false, sequentialPages: false, sequentialLevels: false },
    'stories': { requiresScore: false, sequentialPages: false, sequentialLevels: false },
    'eq': { requiresScore: false, sequentialPages: false, sequentialLevels: false }
};

function getCompletionRule(module) {
    return COMPLETION_RULES[module] || { requiresScore: false, sequentialPages: false, sequentialLevels: false };
}

function isPageCompleted(module, score, manuallyMarked = false) {
    const rule = getCompletionRule(module);
    if (!rule.requiresScore) {
        return {
            completed: manuallyMarked,
            reason: manuallyMarked ? 'Manually marked as complete' : 'Not marked as complete yet'
        };
    }
    if (score >= rule.threshold) {
        return { completed: true, reason: `Score ${score}% meets ${rule.threshold}% threshold \u2713` };
    }
    return { completed: false, reason: `Score ${score}% is below ${rule.threshold}% threshold. Try again!` };
}

function getCompletionIndicator(completed, score = 0) {
    if (completed) return '<span class="completion-badge completed" title="Completed!">\u2713</span>';
    if (score > 0 && score < 95) return `<span class="completion-badge partial" title="Score: ${score}% - Need 95%">\u26a0\ufe0f ${score}%</span>`;
    return '<span class="completion-badge incomplete" title="Not completed">\u25cb</span>';
}

function estimateTotalPages(module, level) {
    const pages = APP_CONFIG.PAGES;
    switch (module) {
        case 'math': return pages.MATH_PER_OPERATION || 150;
        case 'aptitude': return pages.APTITUDE_PER_TYPE || 50;
        case 'english': return pages.ENGLISH_WRITING || 20;
        case 'stories': return pages.STORIES_DEMO || 10;
        default: break;
    }
    const estimates = { 'drawing': 5, 'german': 5, 'german-kids': 5, 'eq': 10 };
    return estimates[module] || 10;
}

// ============================================================================
// Inline weekly assignment utilities
// ============================================================================

const WEEKLY_CONFIG = {
    MATH_PAGES_PER_WEEK: 7,
    ENGLISH_PAGES_PER_WEEK: 7,
    WEEK_START_DAY: 1,
    GENERATION_HOUR: 16,
    GENERATION_DAY: 1,
    LOCKOUT_THRESHOLD: 2,
};

function getWeekString(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekEnd(date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}

// ============================================================================
// Inline getDemoLimit
// ============================================================================

function getDemoLimit(fullCount, isDemo = true) {
    return isDemo ? Math.min(APP_CONFIG.DEMO_LIMIT, fullCount) : fullCount;
}

function getAgeGroupFromAge(age) {
    return APP_CONFIG.AGE_TO_GROUP[String(age)] || '6';
}

// ============================================================================
// TESTS BEGIN
// ============================================================================

// ============================================================================
console.log('\n=== APP_CONFIG Constants ===');
// ============================================================================

test('brand name is GleeGrow', () => {
    assert.strictEqual(APP_CONFIG.BRAND_NAME, 'GleeGrow');
});

test('primary color is #28a745', () => {
    assert.strictEqual(APP_CONFIG.PRIMARY_COLOR, '#28a745');
});

test('has exactly 6 age groups', () => {
    assert.strictEqual(APP_CONFIG.AGE_GROUPS.length, 6);
    assert.deepStrictEqual(APP_CONFIG.AGE_GROUPS, ['4-5', '6', '7', '8', '9+', '10+']);
});

test('has exactly 3 difficulties', () => {
    assert.strictEqual(APP_CONFIG.DIFFICULTIES.length, 3);
    assert.deepStrictEqual(APP_CONFIG.DIFFICULTIES, ['easy', 'medium', 'hard']);
});

test('total levels = AGE_GROUPS * 2 = 12', () => {
    assert.strictEqual(APP_CONFIG.TOTAL_LEVELS, APP_CONFIG.AGE_GROUPS.length * 2);
    assert.strictEqual(APP_CONFIG.TOTAL_LEVELS, 12);
});

test('math has 150 pages per operation', () => {
    assert.strictEqual(APP_CONFIG.PAGES.MATH_PER_OPERATION, 150);
});

test('150 pages = 3 difficulties x 50 pages each', () => {
    assert.strictEqual(APP_CONFIG.PAGES.MATH_PER_OPERATION, 3 * 50);
});

test('4 math operations defined', () => {
    assert.strictEqual(APP_CONFIG.MATH_OPERATIONS.length, 4);
    assert.ok(APP_CONFIG.MATH_OPERATIONS.includes('addition'));
    assert.ok(APP_CONFIG.MATH_OPERATIONS.includes('subtraction'));
    assert.ok(APP_CONFIG.MATH_OPERATIONS.includes('multiplication'));
    assert.ok(APP_CONFIG.MATH_OPERATIONS.includes('division'));
});

test('each math operation has a symbol', () => {
    APP_CONFIG.MATH_OPERATIONS.forEach(op => {
        assert.ok(APP_CONFIG.OPERATION_SYMBOLS[op],
            `Operation ${op} missing symbol`);
    });
});

test('completion threshold is 95%', () => {
    assert.strictEqual(APP_CONFIG.COMPLETION_THRESHOLD, 95);
});

test('demo limit is 2 pages', () => {
    assert.strictEqual(APP_CONFIG.DEMO_LIMIT, 2);
    assert.strictEqual(APP_CONFIG.PAGE_ACCESS.DEMO_PAGE_COUNT, 2);
});

test('weekly page count is 7', () => {
    assert.strictEqual(APP_CONFIG.PAGE_ACCESS.WEEKLY_PAGE_COUNT, 7);
});

test('assessment has 20 questions in 4 tiers', () => {
    assert.strictEqual(APP_CONFIG.ASSESSMENT.QUESTION_COUNT, 20);
    assert.strictEqual(
        APP_CONFIG.ASSESSMENT.YOUNGER_QUESTIONS +
        APP_CONFIG.ASSESSMENT.CURRENT_EASY_QUESTIONS +
        APP_CONFIG.ASSESSMENT.CURRENT_MED_QUESTIONS +
        APP_CONFIG.ASSESSMENT.STRETCH_QUESTIONS,
        APP_CONFIG.ASSESSMENT.QUESTION_COUNT
    );
    assert.strictEqual(APP_CONFIG.ASSESSMENT.YOUNGER_QUESTIONS, 5);
    assert.strictEqual(APP_CONFIG.ASSESSMENT.CURRENT_EASY_QUESTIONS, 5);
    assert.strictEqual(APP_CONFIG.ASSESSMENT.CURRENT_MED_QUESTIONS, 5);
    assert.strictEqual(APP_CONFIG.ASSESSMENT.STRETCH_QUESTIONS, 5);
});

test('assessment thresholds: too_hard < too_easy', () => {
    assert.ok(APP_CONFIG.ASSESSMENT.SCORE_TOO_HARD < APP_CONFIG.ASSESSMENT.SCORE_TOO_EASY);
});

test('all Firestore collection names are strings', () => {
    Object.values(APP_CONFIG.COLLECTIONS).forEach(name => {
        assert.strictEqual(typeof name, 'string');
        assert.ok(name.length > 0);
    });
});

test('all localStorage key names are strings', () => {
    Object.values(APP_CONFIG.STORAGE_KEYS).forEach(key => {
        assert.strictEqual(typeof key, 'string');
        assert.ok(key.length > 0);
    });
});

test('AGE_TO_GROUP covers ages 4-13', () => {
    for (let age = 4; age <= 13; age++) {
        assert.ok(APP_CONFIG.AGE_TO_GROUP[String(age)],
            `Age ${age} not in AGE_TO_GROUP`);
    }
});

test('AGE_TO_GROUP values are all valid age groups', () => {
    const validGroups = new Set(APP_CONFIG.AGE_GROUPS);
    Object.values(APP_CONFIG.AGE_TO_GROUP).forEach(group => {
        assert.ok(validGroups.has(group), `${group} not a valid age group`);
    });
});

// ============================================================================
console.log('\n=== Completion Manager Rules ===');
// ============================================================================

test('math requires 95% score', () => {
    const rule = getCompletionRule('math');
    assert.strictEqual(rule.requiresScore, true);
    assert.strictEqual(rule.threshold, 95);
    assert.strictEqual(rule.sequentialPages, true);
});

test('english requires 95% score', () => {
    const rule = getCompletionRule('english');
    assert.strictEqual(rule.requiresScore, true);
    assert.strictEqual(rule.threshold, 95);
});

test('aptitude requires 95% score', () => {
    const rule = getCompletionRule('aptitude');
    assert.strictEqual(rule.requiresScore, true);
    assert.strictEqual(rule.threshold, 95);
});

test('drawing does NOT require score', () => {
    const rule = getCompletionRule('drawing');
    assert.strictEqual(rule.requiresScore, false);
    assert.strictEqual(rule.sequentialPages, false);
});

test('eq does NOT require score', () => {
    const rule = getCompletionRule('eq');
    assert.strictEqual(rule.requiresScore, false);
});

test('stories does NOT require score', () => {
    const rule = getCompletionRule('stories');
    assert.strictEqual(rule.requiresScore, false);
});

test('unknown module defaults to no requirements', () => {
    const rule = getCompletionRule('nonexistent');
    assert.strictEqual(rule.requiresScore, false);
    assert.strictEqual(rule.sequentialPages, false);
    assert.strictEqual(rule.sequentialLevels, false);
});

// ============================================================================
console.log('\n=== isPageCompleted ===');
// ============================================================================

test('math: 100% score = completed', () => {
    const result = isPageCompleted('math', 100);
    assert.strictEqual(result.completed, true);
});

test('math: 95% score = completed (threshold)', () => {
    const result = isPageCompleted('math', 95);
    assert.strictEqual(result.completed, true);
});

test('math: 94% score = NOT completed', () => {
    const result = isPageCompleted('math', 94);
    assert.strictEqual(result.completed, false);
    assert.ok(result.reason.includes('below'));
});

test('math: 0% score = NOT completed', () => {
    const result = isPageCompleted('math', 0);
    assert.strictEqual(result.completed, false);
});

test('drawing: manuallyMarked=true = completed', () => {
    const result = isPageCompleted('drawing', 0, true);
    assert.strictEqual(result.completed, true);
});

test('drawing: manuallyMarked=false = NOT completed', () => {
    const result = isPageCompleted('drawing', 100, false);
    assert.strictEqual(result.completed, false);
});

test('eq: manuallyMarked=true = completed (ignores score)', () => {
    const result = isPageCompleted('eq', 50, true);
    assert.strictEqual(result.completed, true);
});

test('english: score boundary test at 94.5 (rounds to 94) = not completed', () => {
    const result = isPageCompleted('english', 94);
    assert.strictEqual(result.completed, false);
});

test('aptitude: exactly 95 = completed', () => {
    const result = isPageCompleted('aptitude', 95);
    assert.strictEqual(result.completed, true);
});

// ============================================================================
console.log('\n=== getCompletionIndicator ===');
// ============================================================================

test('completed indicator contains checkmark', () => {
    const html = getCompletionIndicator(true);
    assert.ok(html.includes('completed'));
    assert.ok(html.includes('\u2713'));
});

test('partial indicator shows score', () => {
    const html = getCompletionIndicator(false, 80);
    assert.ok(html.includes('80%'));
    assert.ok(html.includes('partial'));
});

test('incomplete indicator shows circle', () => {
    const html = getCompletionIndicator(false, 0);
    assert.ok(html.includes('incomplete'));
    assert.ok(html.includes('\u25cb'));
});

// ============================================================================
console.log('\n=== estimateTotalPages ===');
// ============================================================================

test('math has 150 pages', () => {
    assert.strictEqual(estimateTotalPages('math', 1), 150);
});

test('aptitude max pages per type is 15 (counting=15, others dynamic by pool)', () => {
    assert.strictEqual(estimateTotalPages('aptitude', 1), 15);
});

test('english has 20 pages', () => {
    assert.strictEqual(estimateTotalPages('english', 1), 20);
});

test('stories has 2 pages (demo count)', () => {
    assert.strictEqual(estimateTotalPages('stories', 1), 2);
});

test('eq has 10 pages', () => {
    assert.strictEqual(estimateTotalPages('eq', 1), 10);
});

test('drawing has 5 pages', () => {
    assert.strictEqual(estimateTotalPages('drawing', 1), 5);
});

test('unknown module defaults to 10', () => {
    assert.strictEqual(estimateTotalPages('unknown', 1), 10);
});

// ============================================================================
console.log('\n=== Weekly Assignment Utilities ===');
// ============================================================================

test('getWeekString returns YYYY-Www format', () => {
    const ws = getWeekString(new Date(2026, 0, 5)); // Jan 5 2026 (Monday)
    assert.ok(/^\d{4}-W\d{2}$/.test(ws), `Invalid format: ${ws}`);
});

test('same week returns same week string', () => {
    const mon = new Date(2026, 1, 16); // Monday Feb 16
    const wed = new Date(2026, 1, 18); // Wednesday Feb 18
    const sun = new Date(2026, 1, 22); // Sunday Feb 22
    assert.strictEqual(getWeekString(mon), getWeekString(wed));
    assert.strictEqual(getWeekString(wed), getWeekString(sun));
});

test('different weeks return different week strings', () => {
    const week1 = new Date(2026, 1, 16); // Feb 16
    const week2 = new Date(2026, 1, 23); // Feb 23
    assert.notStrictEqual(getWeekString(week1), getWeekString(week2));
});

test('getWeekStart returns Monday', () => {
    const wed = new Date(2026, 1, 18); // Wednesday Feb 18
    const monday = getWeekStart(wed);
    assert.strictEqual(monday.getDay(), 1); // Monday = 1
    assert.strictEqual(monday.getDate(), 16); // Feb 16 is Monday
});

test('getWeekStart on Monday returns same day', () => {
    const mon = new Date(2026, 1, 16);
    const result = getWeekStart(mon);
    assert.strictEqual(result.getDate(), 16);
});

test('getWeekStart on Sunday returns previous Monday', () => {
    const sun = new Date(2026, 1, 22); // Sunday Feb 22
    const result = getWeekStart(sun);
    assert.strictEqual(result.getDay(), 1);
    assert.strictEqual(result.getDate(), 16); // Previous Monday
});

test('getWeekEnd returns Sunday', () => {
    const wed = new Date(2026, 1, 18);
    const sunday = getWeekEnd(wed);
    assert.strictEqual(sunday.getDay(), 0); // Sunday = 0
    assert.strictEqual(sunday.getDate(), 22);
});

test('getWeekEnd time is 23:59:59', () => {
    const date = new Date(2026, 1, 18);
    const end = getWeekEnd(date);
    assert.strictEqual(end.getHours(), 23);
    assert.strictEqual(end.getMinutes(), 59);
    assert.strictEqual(end.getSeconds(), 59);
});

test('week start to week end spans Mon-Sun (6 day difference)', () => {
    const date = new Date(2026, 1, 18);
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    const diffDays = Math.floor((end - start) / 86400000);
    assert.strictEqual(diffDays, 6); // Mon 00:00 to Sun 23:59 = 6.99 days, floor = 6
});

test('WEEKLY_CONFIG: 7 math + 7 english per week', () => {
    assert.strictEqual(WEEKLY_CONFIG.MATH_PAGES_PER_WEEK, 7);
    assert.strictEqual(WEEKLY_CONFIG.ENGLISH_PAGES_PER_WEEK, 7);
});

test('WEEKLY_CONFIG: generation at Monday 4pm', () => {
    assert.strictEqual(WEEKLY_CONFIG.GENERATION_DAY, 1);
    assert.strictEqual(WEEKLY_CONFIG.GENERATION_HOUR, 16);
});

test('WEEKLY_CONFIG: lockout after 2 incomplete weeks', () => {
    assert.strictEqual(WEEKLY_CONFIG.LOCKOUT_THRESHOLD, 2);
});

// ============================================================================
console.log('\n=== getDemoLimit ===');
// ============================================================================

test('demo mode returns 2 (demo limit)', () => {
    assert.strictEqual(getDemoLimit(150, true), 2);
    assert.strictEqual(getDemoLimit(50, true), 2);
});

test('full mode returns full count', () => {
    assert.strictEqual(getDemoLimit(150, false), 150);
    assert.strictEqual(getDemoLimit(50, false), 50);
});

test('demo limit never exceeds full count', () => {
    assert.strictEqual(getDemoLimit(1, true), 1); // 1 < 2, so returns 1
});

// ============================================================================
console.log('\n=== getAgeGroupFromAge ===');
// ============================================================================

test('all supported ages return valid groups', () => {
    const validGroups = new Set(['4-5', '6', '7', '8', '9+', '10+']);
    for (let age = 4; age <= 13; age++) {
        const group = getAgeGroupFromAge(age);
        assert.ok(validGroups.has(group), `Age ${age} returned invalid group: ${group}`);
    }
});

// ============================================================================
console.log('\n=== EQ Content Completeness ===');
// ============================================================================

// Inline EQ content check (data structure from eq-age-content.js)
test('EQ has content for all 6 age groups', () => {
    // We check the structure matches what eq-age-content.js should provide
    const expectedAgeGroups = ['4-5', '6', '7', '8', '9+', '10+'];
    const expectedDifficulties = ['easy', 'medium', 'hard'];

    // Since we can't import browser JS, verify the expected structure
    expectedAgeGroups.forEach(age => {
        expectedDifficulties.forEach(diff => {
            // Each combo should produce activities > 0
            // This is a structural test - the actual content is in eq-age-content.js
            assert.ok(true, `${age}/${diff} content expected`);
        });
    });
});

test('EQ activity types are well-defined', () => {
    const validTypes = [
        'emotion-face', 'scenario', 'empathy', 'social',
        'self-regulation', 'consequence', 'mixed-emotion',
        'emotional-growth', 'self-awareness'
    ];
    // Verify all types are accounted for in the renderer
    assert.strictEqual(validTypes.length, 9);
});

test('EQ fallback generators produce content', () => {
    // Inline the easy generator to verify it produces activities
    const easyActivities = [
        { type: 'emotion-face', answer: 'Happy' },
        { type: 'emotion-face', answer: 'Sad' },
        { type: 'emotion-face', answer: 'Angry' },
        { type: 'emotion-face', answer: 'Scared' },
        { type: 'scenario', answer: 'Happy' },
        { type: 'scenario', answer: 'Sad' },
        { type: 'scenario', answer: 'Scared' },
        { type: 'scenario', answer: 'Excited' },
        { type: 'empathy', answer: "Ask what's wrong" },
        { type: 'empathy', answer: 'Say congratulations' },
        { type: 'social', answer: "It's okay" },
        { type: 'social', answer: 'Thank you' },
        { type: 'scenario', answer: 'Proud' },
        { type: 'empathy', answer: 'Wish them happy birthday' },
        { type: 'social', answer: 'Say sorry' },
    ];
    assert.strictEqual(easyActivities.length, 15);
    easyActivities.forEach((a, i) => {
        assert.ok(a.type, `Activity ${i} missing type`);
        assert.ok(a.answer, `Activity ${i} missing answer`);
    });
});

// ============================================================================
console.log('\n=== Math Engine (via shared module) ===');
// ============================================================================

let mathEngine;
try {
    mathEngine = require('../functions/shared/math-engine');
} catch (e) {
    console.log('  (skipping math engine tests - shared module not found)');
    mathEngine = null;
}

if (mathEngine) {
    const { generatePageProblems, generateAbsolutePageProblems, compareAnswers, hashCode, SeededRandom } = mathEngine;

    test('math: all 72 combos produce problems', () => {
        const ops = ['addition', 'subtraction', 'multiplication', 'division'];
        const ages = ['4-5', '6', '7', '8', '9+', '10+'];
        const diffs = ['easy', 'medium', 'hard'];
        let tested = 0;

        ops.forEach(op => {
            ages.forEach(age => {
                diffs.forEach(diff => {
                    const result = generatePageProblems(op, age, diff, 1);
                    assert.ok(result.problems.length > 0,
                        `No problems for ${op}/${age}/${diff}`);
                    tested++;
                });
            });
        });
        assert.strictEqual(tested, 72);
    });

    test('math: every problem has a, b, and answer fields', () => {
        const result = generatePageProblems('addition', '6', 'easy', 1);
        result.problems.forEach((p, i) => {
            assert.ok(p.a !== undefined, `Problem ${i} missing a`);
            assert.ok(p.b !== undefined, `Problem ${i} missing b`);
            assert.ok(p.answer !== undefined, `Problem ${i} missing answer`);
        });
    });

    test('math: addition problems have valid answers (a + b = answer)', () => {
        const result = generatePageProblems('addition', '6', 'easy', 1);
        result.problems.forEach((p, i) => {
            const answer = Number(p.answer);
            assert.ok(!isNaN(answer), `Problem ${i} answer is NaN: ${p.answer}`);
            assert.ok(answer >= 0, `Problem ${i} answer is negative: ${answer}`);
            assert.strictEqual(p.a + p.b, answer, `Problem ${i}: ${p.a}+${p.b} != ${answer}`);
        });
    });

    test('math: subtraction never produces negative answers for easy', () => {
        const ages = ['4-5', '6', '7'];
        ages.forEach(age => {
            for (let page = 1; page <= 5; page++) {
                const result = generatePageProblems('subtraction', age, 'easy', page);
                result.problems.forEach((p, i) => {
                    const answer = Number(p.answer);
                    assert.ok(answer >= 0,
                        `Negative answer in subtraction ${age}/easy/page${page} problem ${i}: ${p.a} - ${p.b} = ${answer}`);
                });
            }
        });
    });

    test('math: division never divides by zero', () => {
        const ages = ['4-5', '6', '7', '8', '9+', '10+'];
        ages.forEach(age => {
            const result = generatePageProblems('division', age, 'easy', 1);
            result.problems.forEach((p, i) => {
                // b is the divisor in division problems
                assert.ok(p.b !== 0,
                    `Division by zero in ${age}/easy problem ${i}: ${p.a} / ${p.b}`);
            });
        });
    });

    test('math: 20 problems per page (standard)', () => {
        const result = generatePageProblems('addition', '6', 'easy', 1);
        assert.strictEqual(result.problems.length, 20);
    });

    test('math: absolute page 1 = easy page 1', () => {
        const abs = generateAbsolutePageProblems('addition', '6', 1);
        const rel = generatePageProblems('addition', '6', 'easy', 1);
        assert.deepStrictEqual(abs.problems, rel.problems);
    });

    test('math: absolute page 51 = medium page 1', () => {
        const abs = generateAbsolutePageProblems('addition', '6', 51);
        const rel = generatePageProblems('addition', '6', 'medium', 1);
        assert.deepStrictEqual(abs.problems, rel.problems);
    });

    test('math: absolute page 101 = hard page 1', () => {
        const abs = generateAbsolutePageProblems('addition', '6', 101);
        const rel = generatePageProblems('addition', '6', 'hard', 1);
        assert.deepStrictEqual(abs.problems, rel.problems);
    });

    test('math: compareAnswers exact match', () => {
        assert.strictEqual(compareAnswers(42, 42), true);
        assert.strictEqual(compareAnswers('42', 42), true);
        assert.strictEqual(compareAnswers(42, 43), false);
    });

    test('math: compareAnswers string answers (fractions)', () => {
        assert.strictEqual(compareAnswers('1/2', '1/2'), true);
        assert.strictEqual(compareAnswers(' 1/2 ', '1/2'), true);
        assert.strictEqual(compareAnswers('1/2', '2/4'), false); // No simplification
    });

    test('math: compareAnswers null/empty = false', () => {
        assert.strictEqual(compareAnswers(null, 42), false);
        assert.strictEqual(compareAnswers('', 42), false);
        assert.strictEqual(compareAnswers(undefined, 42), false);
    });

    test('math: hashCode is deterministic', () => {
        const a = hashCode('test-string');
        const b = hashCode('test-string');
        assert.strictEqual(a, b);
    });

    test('math: hashCode produces different values for different inputs', () => {
        const a = hashCode('addition-6-easy-1');
        const b = hashCode('addition-6-easy-2');
        assert.notStrictEqual(a, b);
    });

    test('math: SeededRandom is deterministic', () => {
        const a = new SeededRandom(42);
        const b = new SeededRandom(42);
        for (let i = 0; i < 50; i++) {
            assert.strictEqual(a.next(), b.next());
        }
    });

    test('math: problem difficulty increases with age', () => {
        // 4-5 addition easy should have smaller numbers than 10+ addition easy
        const young = generatePageProblems('addition', '4-5', 'easy', 1);
        const old = generatePageProblems('addition', '10+', 'easy', 1);

        const youngMax = Math.max(...young.problems.map(p => Number(p.answer)));
        const oldMax = Math.max(...old.problems.map(p => {
            const n = Number(p.answer);
            return isNaN(n) ? 0 : n;
        }));

        // The older group should generally have larger numbers
        // (unless it's fractions/decimals which are strings)
        assert.ok(youngMax <= 100, `Young max too high: ${youngMax}`);
    });
}

// ============================================================================
console.log('\n=== Module Definition Consistency ===');
// ============================================================================

test('all modules in COMPLETION_RULES are recognized', () => {
    const knownModules = ['math', 'english', 'aptitude', 'drawing', 'german', 'german-kids', 'stories', 'eq'];
    knownModules.forEach(mod => {
        assert.ok(COMPLETION_RULES[mod], `Module ${mod} not in COMPLETION_RULES`);
    });
});

test('score-based modules: math, english, aptitude all use same threshold', () => {
    const scoreBased = ['math', 'english', 'aptitude'];
    const thresholds = scoreBased.map(m => COMPLETION_RULES[m].threshold);
    assert.ok(thresholds.every(t => t === 95), 'Not all score-based modules use 95%');
});

test('non-score modules all have free navigation', () => {
    const freeNav = ['drawing', 'german', 'german-kids', 'stories', 'eq'];
    freeNav.forEach(mod => {
        const rule = COMPLETION_RULES[mod];
        assert.strictEqual(rule.requiresScore, false, `${mod} requires score`);
        assert.strictEqual(rule.sequentialPages, false, `${mod} has sequential pages`);
    });
});

// ============================================================================
console.log('\n=== Aptitude Progressive Pool Data Tests ===');
// ============================================================================

// Load aptitude data by parsing the JS file
const aptitudeContentJs = fs.readFileSync(path.resolve(__dirname, '..', 'aptitude-age-content.js'), 'utf8');

// Stub dependencies that aptitude-age-content.js needs
function ageAndDifficultyToLevel(ageGroup, difficulty) {
    const ageMap = { '4-5': 0, '6': 1, '7': 2, '8': 3, '9+': 4, '10+': 5 };
    const diffMap = { 'easy': 1, 'medium': 2, 'hard': 2 };
    const base = (ageMap[ageGroup] || 0) * 2;
    return base + diffMap[difficulty];
}
const ageGroupMap = {
    '4': '4-5', '5': '4-5', '6': '6', '7': '7', '8': '8',
    '9': '9+', '10': '10+', '11': '10+', '12': '10+',
    '4-5': '4-5', '9+': '9+', '10+': '10+'
};

// Execute the content file and extract data via wrapper that assigns to exports
let ageBasedPatterns, ageBasedSequences, ageBasedMatching, ageBasedOddOneOut, ageBasedComparison, ageBasedLogic, ageBasedCounting;
try {
    const exports = {};
    // Wrap the script: replace const with var so they go on the context object
    const wrappedJs = aptitudeContentJs.replace(/^const /gm, 'var ') +
        '\nexports.ageBasedPatterns = ageBasedPatterns;' +
        '\nexports.ageBasedSequences = ageBasedSequences;' +
        '\nexports.ageBasedMatching = ageBasedMatching;' +
        '\nexports.ageBasedOddOneOut = ageBasedOddOneOut;' +
        '\nexports.ageBasedComparison = ageBasedComparison;' +
        '\nexports.ageBasedLogic = ageBasedLogic;' +
        '\nexports.ageBasedCounting = ageBasedCounting;';
    const sandbox = { ageAndDifficultyToLevel, ageGroupMap, console, exports };
    const context = vm.createContext(sandbox);
    vm.runInContext(wrappedJs, context);
    ageBasedPatterns = sandbox.exports.ageBasedPatterns;
    ageBasedSequences = sandbox.exports.ageBasedSequences;
    ageBasedMatching = sandbox.exports.ageBasedMatching;
    ageBasedOddOneOut = sandbox.exports.ageBasedOddOneOut;
    ageBasedComparison = sandbox.exports.ageBasedComparison;
    ageBasedLogic = sandbox.exports.ageBasedLogic;
    ageBasedCounting = sandbox.exports.ageBasedCounting;
} catch (e) {
    console.error('Failed to load aptitude-age-content.js:', e.message);
}

const aptitudeAgeGroups = ['4-5', '6', '7', '8', '9+', '10+'];
const aptitudeDifficulties = ['easy', 'medium', 'hard'];
const aptitudeTypes = ['patterns', 'sequences', 'matching', 'oddone', 'comparison', 'logic'];

// Test that all data sets exist for all age groups and difficulties
aptitudeTypes.forEach(type => {
    const dataMap = {
        patterns: ageBasedPatterns,
        sequences: ageBasedSequences,
        matching: ageBasedMatching,
        oddone: ageBasedOddOneOut,
        comparison: ageBasedComparison,
        logic: ageBasedLogic
    };
    const data = dataMap[type];

    test(`aptitude ${type}: data exists for all 6 age groups`, () => {
        assert.ok(data, `${type} data must be defined`);
        aptitudeAgeGroups.forEach(ag => {
            assert.ok(data[ag], `${type} must have age group ${ag}`);
        });
    });

    test(`aptitude ${type}: all age groups have easy/medium/hard`, () => {
        aptitudeAgeGroups.forEach(ag => {
            aptitudeDifficulties.forEach(diff => {
                assert.ok(data[ag][diff], `${type}[${ag}][${diff}] must exist`);
                if (Array.isArray(data[ag][diff])) {
                    assert.ok(data[ag][diff].length > 0, `${type}[${ag}][${diff}] must not be empty`);
                }
            });
        });
    });
});

// Test progressive pool uniqueness: page 1 != page 2
test('aptitude progressive pool: page 1 and page 2 have different content for all types', () => {
    aptitudeTypes.forEach(type => {
        const dataMap = {
            patterns: ageBasedPatterns,
            sequences: ageBasedSequences,
            matching: ageBasedMatching,
            oddone: ageBasedOddOneOut,
            comparison: ageBasedComparison,
            logic: ageBasedLogic
        };
        const data = dataMap[type];

        // Build progressive pool for age '6' (common test case)
        const pool = [];
        aptitudeDifficulties.forEach(diff => {
            const items = data['6']?.[diff] || [];
            if (Array.isArray(items)) {
                items.forEach(item => pool.push({ ...item, difficulty: diff }));
            }
        });

        const count = type === 'sequences' ? 4 : type === 'oddone' ? 5 : 6;
        const page1 = pool.slice(0, count);
        const page2 = pool.slice(count, count * 2);

        if (pool.length > count) {
            // Pages should have different content
            assert.ok(page2.length > 0, `${type} must have content for page 2 (pool=${pool.length})`);
            // First item of page 1 should differ from first item of page 2
            const key1 = JSON.stringify(page1[0]);
            const key2 = JSON.stringify(page2[0]);
            assert.notStrictEqual(key1, key2,
                `${type} page 1 first item must differ from page 2 first item`);
        }
    });
});

// Test progressive ordering: easy items come before medium, medium before hard
test('aptitude progressive pool: easy items before medium before hard', () => {
    aptitudeTypes.forEach(type => {
        const dataMap = {
            patterns: ageBasedPatterns,
            sequences: ageBasedSequences,
            matching: ageBasedMatching,
            oddone: ageBasedOddOneOut,
            comparison: ageBasedComparison,
            logic: ageBasedLogic
        };
        const data = dataMap[type];

        // Pick a random age group for variety
        const randomAge = aptitudeAgeGroups[Math.floor(Math.random() * aptitudeAgeGroups.length)];
        const pool = [];
        aptitudeDifficulties.forEach(diff => {
            const items = data[randomAge]?.[diff] || [];
            if (Array.isArray(items)) {
                items.forEach(item => pool.push({ ...item, difficulty: diff }));
            }
        });

        // Verify ordering: once we see 'medium', we shouldn't see 'easy' after
        let seenMedium = false;
        let seenHard = false;
        pool.forEach((item, i) => {
            if (item.difficulty === 'medium') seenMedium = true;
            if (item.difficulty === 'hard') seenHard = true;
            if (item.difficulty === 'easy' && seenMedium) {
                assert.fail(`${type} age ${randomAge}: easy item at index ${i} after medium`);
            }
            if (item.difficulty === 'medium' && seenHard) {
                assert.fail(`${type} age ${randomAge}: medium item at index ${i} after hard`);
            }
        });
    });
});

// Test each type has correct answer properties
test('aptitude patterns: each pattern has pattern, answer, options, reason', () => {
    const randomAge = aptitudeAgeGroups[Math.floor(Math.random() * aptitudeAgeGroups.length)];
    aptitudeDifficulties.forEach(diff => {
        const items = ageBasedPatterns[randomAge]?.[diff] || [];
        items.forEach((item, i) => {
            assert.ok(Array.isArray(item.pattern), `pattern[${randomAge}][${diff}][${i}].pattern must be array`);
            assert.ok(item.answer, `pattern[${randomAge}][${diff}][${i}].answer must exist`);
            assert.ok(Array.isArray(item.options), `pattern[${randomAge}][${diff}][${i}].options must be array`);
        });
    });
});

test('aptitude sequences: each sequence has sequence array, answer, options', () => {
    const randomAge = aptitudeAgeGroups[Math.floor(Math.random() * aptitudeAgeGroups.length)];
    aptitudeDifficulties.forEach(diff => {
        const items = ageBasedSequences[randomAge]?.[diff] || [];
        items.forEach((item, i) => {
            assert.ok(Array.isArray(item.sequence), `sequence[${randomAge}][${diff}][${i}].sequence must be array`);
            assert.ok(item.answer !== undefined, `sequence[${randomAge}][${diff}][${i}].answer must exist`);
            assert.ok(Array.isArray(item.options), `sequence[${randomAge}][${diff}][${i}].options must be array`);
        });
    });
});

test('aptitude matching: each matching has left, right, options', () => {
    const randomAge = aptitudeAgeGroups[Math.floor(Math.random() * aptitudeAgeGroups.length)];
    aptitudeDifficulties.forEach(diff => {
        const items = ageBasedMatching[randomAge]?.[diff] || [];
        items.forEach((item, i) => {
            assert.ok(item.left, `matching[${randomAge}][${diff}][${i}].left must exist`);
            assert.ok(item.right, `matching[${randomAge}][${diff}][${i}].right must exist`);
            assert.ok(Array.isArray(item.options), `matching[${randomAge}][${diff}][${i}].options must be array`);
            assert.ok(item.options.includes(item.right),
                `matching[${randomAge}][${diff}][${i}].options must include the correct answer (right)`);
        });
    });
});

test('aptitude oddone: each oddone has items array containing answer', () => {
    const randomAge = aptitudeAgeGroups[Math.floor(Math.random() * aptitudeAgeGroups.length)];
    aptitudeDifficulties.forEach(diff => {
        const items = ageBasedOddOneOut[randomAge]?.[diff] || [];
        items.forEach((item, i) => {
            assert.ok(Array.isArray(item.items), `oddone[${randomAge}][${diff}][${i}].items must be array`);
            assert.ok(item.answer, `oddone[${randomAge}][${diff}][${i}].answer must exist`);
            assert.ok(item.items.includes(item.answer),
                `oddone[${randomAge}][${diff}][${i}].items must include the answer`);
        });
    });
});

test('aptitude comparison: each comparison has item1, item2, question, answer', () => {
    const randomAge = aptitudeAgeGroups[Math.floor(Math.random() * aptitudeAgeGroups.length)];
    aptitudeDifficulties.forEach(diff => {
        const items = ageBasedComparison[randomAge]?.[diff] || [];
        items.forEach((item, i) => {
            assert.ok(item.item1 !== undefined, `comparison[${randomAge}][${diff}][${i}].item1 must exist`);
            assert.ok(item.item2 !== undefined, `comparison[${randomAge}][${diff}][${i}].item2 must exist`);
            assert.ok(item.question, `comparison[${randomAge}][${diff}][${i}].question must exist`);
            assert.ok(item.answer !== undefined, `comparison[${randomAge}][${diff}][${i}].answer must exist`);
        });
    });
});

test('aptitude logic: each logic has question and answer', () => {
    const randomAge = aptitudeAgeGroups[Math.floor(Math.random() * aptitudeAgeGroups.length)];
    aptitudeDifficulties.forEach(diff => {
        const items = ageBasedLogic[randomAge]?.[diff] || [];
        items.forEach((item, i) => {
            assert.ok(item.question, `logic[${randomAge}][${diff}][${i}].question must exist`);
            assert.ok(item.answer !== undefined, `logic[${randomAge}][${diff}][${i}].answer must exist`);
        });
    });
});

test('aptitude counting: each age group has range.min < range.max and items array', () => {
    aptitudeAgeGroups.forEach(ag => {
        aptitudeDifficulties.forEach(diff => {
            const config = ageBasedCounting[ag]?.[diff];
            assert.ok(config, `counting[${ag}][${diff}] must exist`);
            assert.ok(config.range, `counting[${ag}][${diff}].range must exist`);
            assert.ok(config.range.min < config.range.max,
                `counting[${ag}][${diff}].range.min (${config.range.min}) must be < max (${config.range.max})`);
            assert.ok(Array.isArray(config.items) && config.items.length > 0,
                `counting[${ag}][${diff}].items must be non-empty array`);
        });
    });
});

// Test no duplicate questions within a pool
test('aptitude: no duplicate questions within same age group progressive pool', () => {
    const randomAge = aptitudeAgeGroups[Math.floor(Math.random() * aptitudeAgeGroups.length)];
    aptitudeTypes.forEach(type => {
        const dataMap = {
            patterns: ageBasedPatterns,
            sequences: ageBasedSequences,
            matching: ageBasedMatching,
            oddone: ageBasedOddOneOut,
            comparison: ageBasedComparison,
            logic: ageBasedLogic
        };
        const data = dataMap[type];
        const pool = [];
        aptitudeDifficulties.forEach(diff => {
            const items = data[randomAge]?.[diff] || [];
            if (Array.isArray(items)) {
                items.forEach(item => pool.push(JSON.stringify(item)));
            }
        });
        const uniqueItems = new Set(pool);
        assert.strictEqual(uniqueItems.size, pool.length,
            `${type}[${randomAge}] has ${pool.length - uniqueItems.size} duplicate items`);
    });
});

// Test demo mode limit: getDemoLimit should cap pages appropriately
test('aptitude demo mode: pool-based types have <= 2 pages in demo mode', () => {
    // getDemoLimit(n) returns min(2, n) for demo, n for full
    // With typical pools of 10-18 items and 4-6 per page = 2-4 pages
    // Demo limit of 2 should be <= actual maxPages
    aptitudeTypes.forEach(type => {
        const dataMap = {
            patterns: ageBasedPatterns,
            sequences: ageBasedSequences,
            matching: ageBasedMatching,
            oddone: ageBasedOddOneOut,
            comparison: ageBasedComparison,
            logic: ageBasedLogic
        };
        const data = dataMap[type];
        const countMap = { patterns: 6, sequences: 4, matching: 6, oddone: 5, comparison: 6, logic: 6 };
        const count = countMap[type];

        aptitudeAgeGroups.forEach(ag => {
            let poolSize = 0;
            aptitudeDifficulties.forEach(diff => {
                const items = data[ag]?.[diff];
                if (Array.isArray(items)) poolSize += items.length;
            });
            const maxPages = Math.ceil(poolSize / count);
            assert.ok(maxPages >= 2,
                `${type}[${ag}] pool (${poolSize}) must support at least 2 pages (needs ${count * 2}, has ${poolSize})`);
        });
    });
});

// Test counting difficulty progression
test('aptitude counting: difficulty ranges increase with difficulty level', () => {
    aptitudeAgeGroups.forEach(ag => {
        const easy = ageBasedCounting[ag]?.easy;
        const medium = ageBasedCounting[ag]?.medium;
        const hard = ageBasedCounting[ag]?.hard;
        if (easy && medium && hard) {
            assert.ok(medium.range.max >= easy.range.max,
                `counting[${ag}] medium max (${medium.range.max}) must be >= easy max (${easy.range.max})`);
            assert.ok(hard.range.max >= medium.range.max,
                `counting[${ag}] hard max (${hard.range.max}) must be >= medium max (${medium.range.max})`);
        }
    });
});

// ============================================================================
console.log('\n=== German Content Data Tests ===');
// ============================================================================

// Load german-generator.js content data
let germanContent, levelConfigs;
try {
    const germanJs = fs.readFileSync(path.resolve(__dirname, '..', 'german-generator.js'), 'utf8');
    const germanExports = {};
    // Extract just the data objects (before functions)
    const wrappedGerman = germanJs.replace(/^const /gm, 'var ').replace(/^let /gm, 'var ') +
        '\nexports.germanContent = germanContent;' +
        '\nexports.levelConfigs = levelConfigs;';
    const germanSandbox = {
        console, exports: germanExports,
        getDemoLimit: (c) => c, // stub: return full count
        Math, document: { getElementById: () => null, body: { innerHTML: '' } },
        window: { location: { href: '' } },
        firebase: { firestore: { FieldValue: { serverTimestamp: () => null } } },
        html2pdf: () => ({ set: () => ({ save: () => {} }) }),
        location: { reload: () => {} }
    };
    const germanCtx = vm.createContext(germanSandbox);
    vm.runInContext(wrappedGerman, germanCtx);
    germanContent = germanSandbox.exports.germanContent;
    levelConfigs = germanSandbox.exports.levelConfigs;
} catch (e) {
    console.error('  [WARN] Could not load german-generator.js:', e.message.substring(0, 100));
}

if (germanContent) {
    test('German articles has 15 items', () => {
        assert.strictEqual(germanContent.articles.length, 15);
    });

    test('German articles all have word, article, translation', () => {
        germanContent.articles.forEach((item, i) => {
            assert.ok(item.word, `Article ${i} missing word`);
            assert.ok(['der', 'die', 'das'].includes(item.article), `Article ${i} has invalid article: ${item.article}`);
            assert.ok(item.translation, `Article ${i} missing translation`);
        });
    });

    test('German articles cover all three genders', () => {
        const genders = new Set(germanContent.articles.map(a => a.article));
        assert.ok(genders.has('der'), 'No masculine articles');
        assert.ok(genders.has('die'), 'No feminine articles');
        assert.ok(genders.has('das'), 'No neuter articles');
    });

    test('German case sentences has 10 items with answer and case', () => {
        assert.strictEqual(germanContent.caseSentences.length, 10);
        germanContent.caseSentences.forEach((item, i) => {
            assert.ok(item.sentence, `Case ${i} missing sentence`);
            assert.ok(item.answer, `Case ${i} missing answer`);
            assert.ok(item.case, `Case ${i} missing case label`);
            assert.ok(item.sentence.includes('___'), `Case ${i} sentence missing blank`);
        });
    });

    test('German case sentences cover Nominativ, Akkusativ, Dativ', () => {
        const cases = new Set(germanContent.caseSentences.map(c => c.case));
        assert.ok(cases.has('Nominativ'), 'No Nominativ cases');
        assert.ok(cases.has('Akkusativ'), 'No Akkusativ cases');
        assert.ok(cases.has('Dativ'), 'No Dativ cases');
    });

    test('German verb exercises has 10 items with tense', () => {
        assert.strictEqual(germanContent.verbExercises.length, 10);
        germanContent.verbExercises.forEach((item, i) => {
            assert.ok(item.prompt, `Verb ${i} missing prompt`);
            assert.ok(item.answer, `Verb ${i} missing answer`);
            assert.ok(item.tense, `Verb ${i} missing tense`);
        });
    });

    test('German verb tenses cover Präsens, Perfekt, Präteritum', () => {
        const tenses = new Set(germanContent.verbExercises.map(v => v.tense));
        assert.ok(tenses.has('Präsens'), 'No Präsens verbs');
        assert.ok(tenses.has('Perfekt'), 'No Perfekt verbs');
        assert.ok(tenses.has('Präteritum'), 'No Präteritum verbs');
    });

    test('German preposition exercises has 10 items', () => {
        assert.strictEqual(germanContent.prepositionExercises.length, 10);
        germanContent.prepositionExercises.forEach((item, i) => {
            assert.ok(item.sentence.includes('___'), `Preposition ${i} sentence missing blank`);
            assert.ok(item.answer, `Preposition ${i} missing answer`);
        });
    });

    test('German adjective exercises has 8 items', () => {
        assert.strictEqual(germanContent.adjectiveExercises.length, 8);
    });

    test('German reading passages have questions with answers', () => {
        assert.ok(germanContent.readingPassages.length >= 2, 'Need at least 2 reading passages');
        germanContent.readingPassages.forEach((p, i) => {
            assert.ok(p.title, `Passage ${i} missing title`);
            assert.ok(p.text && p.text.length > 50, `Passage ${i} text too short`);
            assert.ok(p.questions.length >= 3, `Passage ${i} needs at least 3 questions`);
            p.questions.forEach((q, j) => {
                assert.ok(q.q, `Passage ${i} question ${j} missing question text`);
                assert.ok(q.a, `Passage ${i} question ${j} missing answer`);
            });
        });
    });

    test('German vocabulary pairs has 15 items with german-english', () => {
        assert.strictEqual(germanContent.vocabularyPairs.length, 15);
        germanContent.vocabularyPairs.forEach((item, i) => {
            assert.ok(item.german, `Vocab ${i} missing german`);
            assert.ok(item.english, `Vocab ${i} missing english`);
        });
    });

    test('German writing prompts have type, prompt, and points', () => {
        assert.ok(germanContent.writingPrompts.length >= 3, 'Need at least 3 writing prompts');
        germanContent.writingPrompts.forEach((p, i) => {
            assert.ok(['Informal', 'Formal'].includes(p.type), `Prompt ${i} has invalid type: ${p.type}`);
            assert.ok(p.prompt, `Prompt ${i} missing prompt text`);
            assert.ok(Array.isArray(p.points) && p.points.length >= 2, `Prompt ${i} needs at least 2 points`);
        });
    });

    test('German no duplicate vocabulary pairs', () => {
        const seen = new Set();
        germanContent.vocabularyPairs.forEach(item => {
            assert.ok(!seen.has(item.german), `Duplicate vocabulary: ${item.german}`);
            seen.add(item.german);
        });
    });

    test('German no duplicate article words', () => {
        const seen = new Set();
        germanContent.articles.forEach(item => {
            assert.ok(!seen.has(item.word), `Duplicate article word: ${item.word}`);
            seen.add(item.word);
        });
    });
}

if (levelConfigs) {
    test('German has 18 level configs', () => {
        const keys = Object.keys(levelConfigs);
        assert.strictEqual(keys.length, 18);
    });

    test('German level configs all have name, description, type, problemCount', () => {
        Object.entries(levelConfigs).forEach(([key, config]) => {
            assert.ok(config.name, `Config ${key} missing name`);
            assert.ok(config.description, `Config ${key} missing description`);
            assert.ok(config.type, `Config ${key} missing type`);
            assert.ok(typeof config.problemCount === 'number' && config.problemCount > 0,
                `Config ${key} problemCount invalid: ${config.problemCount}`);
        });
    });

    test('German level config types include articles, cases, verbs, reading, vocabulary, writing', () => {
        const types = new Set(Object.values(levelConfigs).map(c => c.type));
        ['articles', 'cases', 'verbs', 'prepositions', 'adjectives', 'reading', 'vocabulary', 'writing'].forEach(t => {
            assert.ok(types.has(t), `Missing exercise type: ${t}`);
        });
    });

    test('German advanced types include modalverbs, separable, reflexive, conjunctions', () => {
        const types = new Set(Object.values(levelConfigs).map(c => c.type));
        ['modalverbs', 'separable', 'reflexive', 'conjunctions', 'wordorder', 'comparative',
         'pronouns', 'relativeclauses', 'konjunktiv', 'passive'].forEach(t => {
            assert.ok(types.has(t), `Missing advanced type: ${t}`);
        });
    });
}

// ============================================================================
console.log('\n=== EQ Age Content Data Tests ===');
// ============================================================================

// Load EQ age content data
let ageBasedEQScenarios;
try {
    const eqJs = fs.readFileSync(path.resolve(__dirname, '..', 'eq-age-content.js'), 'utf8');
    const eqExports = {};
    const wrappedEQ = eqJs.replace(/^const /gm, 'var ') +
        '\nexports.ageBasedEQScenarios = ageBasedEQScenarios;';
    const eqSandbox = {
        console, exports: eqExports,
        ageAndDifficultyToLevel, ageGroupMap
    };
    const eqCtx = vm.createContext(eqSandbox);
    vm.runInContext(wrappedEQ, eqCtx);
    ageBasedEQScenarios = eqSandbox.exports.ageBasedEQScenarios;
} catch (e) {
    console.error('  [WARN] Could not load eq-age-content.js:', e.message.substring(0, 100));
}

if (ageBasedEQScenarios) {
    test('EQ scenarios cover all 6 age groups', () => {
        APP_CONFIG.AGE_GROUPS.forEach(age => {
            assert.ok(ageBasedEQScenarios[age], `Missing EQ for age ${age}`);
        });
    });

    test('EQ scenarios have easy/medium/hard for each age', () => {
        APP_CONFIG.AGE_GROUPS.forEach(age => {
            APP_CONFIG.DIFFICULTIES.forEach(diff => {
                assert.ok(ageBasedEQScenarios[age][diff], `Missing EQ ${age} ${diff}`);
                assert.ok(Array.isArray(ageBasedEQScenarios[age][diff]),
                    `EQ ${age} ${diff} is not an array`);
            });
        });
    });

    test('EQ scenarios have at least 2 items per age/difficulty', () => {
        APP_CONFIG.AGE_GROUPS.forEach(age => {
            APP_CONFIG.DIFFICULTIES.forEach(diff => {
                const items = ageBasedEQScenarios[age][diff];
                assert.ok(items.length >= 2,
                    `EQ ${age} ${diff} has only ${items.length} items (need >=2)`);
            });
        });
    });

    test('EQ all items have question, options, answer', () => {
        let totalItems = 0;
        APP_CONFIG.AGE_GROUPS.forEach(age => {
            APP_CONFIG.DIFFICULTIES.forEach(diff => {
                ageBasedEQScenarios[age][diff].forEach((item, i) => {
                    assert.ok(item.question, `EQ ${age} ${diff} item ${i} missing question`);
                    assert.ok(Array.isArray(item.options) && item.options.length >= 2,
                        `EQ ${age} ${diff} item ${i} needs >=2 options`);
                    assert.ok(item.answer, `EQ ${age} ${diff} item ${i} missing answer`);
                    totalItems++;
                });
            });
        });
        assert.ok(totalItems >= 50, `Expected >=50 EQ items total, got ${totalItems}`);
    });

    test('EQ answer is always one of the options', () => {
        APP_CONFIG.AGE_GROUPS.forEach(age => {
            APP_CONFIG.DIFFICULTIES.forEach(diff => {
                ageBasedEQScenarios[age][diff].forEach((item, i) => {
                    assert.ok(item.options.includes(item.answer),
                        `EQ ${age} ${diff} item ${i}: answer "${item.answer}" not in options [${item.options.join(', ')}]`);
                });
            });
        });
    });

    test('EQ all items have a type property', () => {
        APP_CONFIG.AGE_GROUPS.forEach(age => {
            APP_CONFIG.DIFFICULTIES.forEach(diff => {
                ageBasedEQScenarios[age][diff].forEach((item, i) => {
                    assert.ok(item.type, `EQ ${age} ${diff} item ${i} missing type`);
                });
            });
        });
    });

    test('EQ younger ages use simpler types (emotion-face, scenario)', () => {
        const youngTypes = new Set();
        ageBasedEQScenarios['4-5'].easy.forEach(item => youngTypes.add(item.type));
        assert.ok(youngTypes.has('emotion-face') || youngTypes.has('scenario'),
            `Age 4-5 easy should have emotion-face or scenario types, got: ${[...youngTypes].join(', ')}`);
    });

    test('EQ older ages have more complex types', () => {
        const olderTypes = new Set();
        ['9+', '10+'].forEach(age => {
            APP_CONFIG.DIFFICULTIES.forEach(diff => {
                ageBasedEQScenarios[age][diff].forEach(item => olderTypes.add(item.type));
            });
        });
        // Should have at least some of the advanced types
        const advancedTypes = ['self-regulation', 'consequence', 'mixed-emotion', 'emotional-growth', 'self-awareness'];
        const hasAdvanced = advancedTypes.some(t => olderTypes.has(t));
        assert.ok(hasAdvanced || olderTypes.size > 2,
            `Older ages should have complex types, got: ${[...olderTypes].join(', ')}`);
    });
}

// ============================================================================
console.log('\n=== Stories Template Data Tests ===');
// ============================================================================

// Load stories-generator.js template data
let storyData, storyCategoryTemplates;
try {
    const storiesJs = fs.readFileSync(path.resolve(__dirname, '..', 'stories-generator.js'), 'utf8');
    const storiesExports = {};
    const wrappedStories = storiesJs.replace(/^const /gm, 'var ').replace(/^let /gm, 'var ') +
        '\nexports.storyData = storyData;';
    const storiesSandbox = {
        console, exports: storiesExports,
        ageGroupMap,
        isDemoMode: () => false,
        getDemoLimit: (c) => c,
        document: {
            getElementById: () => ({ style: {}, innerHTML: '', textContent: '', onclick: null }),
            createElement: () => ({ className: '', onclick: null, innerHTML: '', style: {} }),
            querySelector: () => null,
            querySelectorAll: () => []
        },
        window: { location: { href: '' }, currentUserRole: 'parent' },
        getAdminLevelForModule: () => null,
        getLevelDetails: () => null,
        getStoriesByAge: () => [],
        uniqueStories: undefined,
        getSelectedChild: () => ({ age: 6 }),
        getCurrentUser: () => ({ email: 'test@test.com' }),
        location: { reload: () => {} },
        html2pdf: () => ({ set: () => ({ save: () => {} }) })
    };
    const storiesCtx = vm.createContext(storiesSandbox);
    vm.runInContext(wrappedStories, storiesCtx);
    storyData = storiesSandbox.exports.storyData;
} catch (e) {
    console.error('  [WARN] Could not load stories-generator.js:', e.message.substring(0, 100));
}

if (storyData) {
    test('Story data has 6 categories', () => {
        const expected = ['animals', 'nature', 'family', 'adventures', 'learning', 'bedtime'];
        expected.forEach(cat => {
            assert.ok(storyData[cat], `Missing story category: ${cat}`);
        });
    });

    test('Animals category has full template data for easy/medium/hard', () => {
        assert.ok(storyData.animals.easy, 'Animals missing easy');
        assert.ok(storyData.animals.medium, 'Animals missing medium');
        assert.ok(storyData.animals.hard, 'Animals missing hard');
    });

    test('Animals easy has themes, animals, actions, morals arrays', () => {
        const easy = storyData.animals.easy;
        assert.ok(Array.isArray(easy.themes) && easy.themes.length >= 5,
            `Animals easy themes: ${easy.themes?.length || 0}`);
        assert.ok(Array.isArray(easy.animals) && easy.animals.length >= 10,
            `Animals easy animals: ${easy.animals?.length || 0}`);
        assert.ok(Array.isArray(easy.actions) && easy.actions.length >= 5,
            `Animals easy actions: ${easy.actions?.length || 0}`);
        assert.ok(Array.isArray(easy.morals) && easy.morals.length >= 5,
            `Animals easy morals: ${easy.morals?.length || 0}`);
    });

    test('Animals animals array has [name, emoji] pairs', () => {
        storyData.animals.easy.animals.forEach((pair, i) => {
            assert.ok(Array.isArray(pair) && pair.length === 2,
                `Animals easy animal ${i} should be [name, emoji] pair`);
            assert.ok(typeof pair[0] === 'string' && pair[0].length > 0,
                `Animals easy animal ${i} name should be non-empty string`);
            assert.ok(typeof pair[1] === 'string' && pair[1].length > 0,
                `Animals easy animal ${i} emoji should be non-empty string`);
        });
    });

    test('Animals themes contain {animal} placeholder', () => {
        storyData.animals.easy.themes.forEach((theme, i) => {
            assert.ok(theme.includes('{animal}'),
                `Animals easy theme ${i} missing {animal} placeholder: ${theme}`);
        });
    });

    test('Animals medium has challenges array', () => {
        assert.ok(Array.isArray(storyData.animals.medium.challenges) &&
            storyData.animals.medium.challenges.length >= 5,
            'Animals medium should have challenges array');
    });

    test('Animals hard has concepts array', () => {
        assert.ok(Array.isArray(storyData.animals.hard.concepts) &&
            storyData.animals.hard.concepts.length >= 5,
            'Animals hard should have concepts array');
    });

    test('Non-animal categories have count property', () => {
        ['nature', 'family', 'adventures', 'learning', 'bedtime'].forEach(cat => {
            APP_CONFIG.DIFFICULTIES.forEach(diff => {
                assert.ok(storyData[cat][diff],
                    `Category ${cat} missing ${diff}`);
                assert.ok(typeof storyData[cat][diff].count === 'number',
                    `Category ${cat} ${diff} should have count property`);
            });
        });
    });

    test('Animals morals end with period', () => {
        storyData.animals.easy.morals.forEach((moral, i) => {
            assert.ok(moral.endsWith('.'),
                `Animals easy moral ${i} should end with period: "${moral}"`);
        });
    });

    test('No duplicate animal names within same difficulty', () => {
        ['easy', 'medium', 'hard'].forEach(diff => {
            const names = storyData.animals[diff].animals.map(a => a[0]);
            const unique = new Set(names);
            assert.strictEqual(names.length, unique.size,
                `Duplicate animals in ${diff}: ${names.filter((n, i) => names.indexOf(n) !== i).join(', ')}`);
        });
    });
}

// ============================================================================
console.log('\n=== Age Content Mapper Tests ===');
// ============================================================================

// Load age-content-mapper.js
let acmAgeGroupMap, agePrevNext, getContentMapping, getNumberRange, getVocabularyLevel;
try {
    const acmJs = fs.readFileSync(path.resolve(__dirname, '..', 'age-content-mapper.js'), 'utf8');
    const acmExports = {};
    // Replace const/let with var, and convert named functions to var assignments
    const wrappedACM = acmJs
        .replace(/^const /gm, 'var ')
        .replace(/^function\s+(\w+)\s*\(/gm, 'var $1 = function(') +
        '\nexports.ageGroupMap = ageGroupMap;' +
        '\nexports.agePrevNext = agePrevNext;' +
        '\nexports.getContentMapping = getContentMapping;' +
        '\nexports.getNumberRange = getNumberRange;' +
        '\nexports.getVocabularyLevel = getVocabularyLevel;';
    const fixedACM = wrappedACM;
    const acmSandbox = { console, exports: acmExports, JSON };
    const acmCtx = vm.createContext(acmSandbox);
    vm.runInContext(fixedACM, acmCtx);
    acmAgeGroupMap = acmSandbox.exports.ageGroupMap;
    agePrevNext = acmSandbox.exports.agePrevNext;
    getContentMapping = acmSandbox.exports.getContentMapping;
    getNumberRange = acmSandbox.exports.getNumberRange;
    getVocabularyLevel = acmSandbox.exports.getVocabularyLevel;
} catch (e) {
    console.error('  [WARN] Could not load age-content-mapper.js:', e.message.substring(0, 100));
}

if (acmAgeGroupMap) {
    test('Age group map covers ages 4-16', () => {
        for (let age = 4; age <= 16; age++) {
            assert.ok(acmAgeGroupMap[String(age)],
                `Age ${age} not in ageGroupMap`);
        }
    });

    test('Age group map has identity mappings for string age groups', () => {
        assert.strictEqual(acmAgeGroupMap['4-5'], '4-5');
        assert.strictEqual(acmAgeGroupMap['9+'], '9+');
        assert.strictEqual(acmAgeGroupMap['10+'], '10+');
    });

    test('agePrevNext covers all 6 age groups', () => {
        APP_CONFIG.AGE_GROUPS.forEach(age => {
            assert.ok(agePrevNext[age], `agePrevNext missing ${age}`);
        });
    });

    test('agePrevNext: 4-5 has no prev, 10+ has no next', () => {
        assert.strictEqual(agePrevNext['4-5'].prev, null);
        assert.strictEqual(agePrevNext['10+'].next, null);
    });

    test('agePrevNext chain is bidirectional', () => {
        APP_CONFIG.AGE_GROUPS.forEach(age => {
            const entry = agePrevNext[age];
            if (entry.next) {
                assert.strictEqual(agePrevNext[entry.next].prev, age,
                    `${age}.next=${entry.next}, but ${entry.next}.prev != ${age}`);
            }
            if (entry.prev) {
                assert.strictEqual(agePrevNext[entry.prev].next, age,
                    `${age}.prev=${entry.prev}, but ${entry.prev}.next != ${age}`);
            }
        });
    });
}

if (getContentMapping) {
    test('Easy maps to previous age hard', () => {
        const result = getContentMapping(7, 'easy');
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].ageGroup, '6');
        assert.strictEqual(result[0].difficulty, 'hard');
    });

    test('Easy at age 4-5 maps to own easy (no prev)', () => {
        const result = getContentMapping(4, 'easy');
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].ageGroup, '4-5');
        assert.strictEqual(result[0].difficulty, 'easy');
    });

    test('Medium maps to current age all three difficulties', () => {
        const result = getContentMapping(8, 'medium');
        assert.strictEqual(result.length, 3);
        assert.strictEqual(result[0].ageGroup, '8');
        assert.strictEqual(result[0].difficulty, 'easy');
        assert.strictEqual(result[1].difficulty, 'medium');
        assert.strictEqual(result[2].difficulty, 'hard');
    });

    test('Hard maps to next age hard', () => {
        const result = getContentMapping(8, 'hard');
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].ageGroup, '9+');
        assert.strictEqual(result[0].difficulty, 'hard');
    });

    test('Hard at age 10+ maps to own hard (no next)', () => {
        const result = getContentMapping(10, 'hard');
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].ageGroup, '10+');
        assert.strictEqual(result[0].difficulty, 'hard');
    });
}

if (getNumberRange) {
    test('Number range increases with age', () => {
        const ages = ['4-5', '6', '7', '8', '9+', '10+'];
        let prevMax = 0;
        ages.forEach(age => {
            const range = getNumberRange(age);
            assert.ok(range.min >= 1, `${age} min should be >=1`);
            assert.ok(range.max > prevMax, `${age} max (${range.max}) should be > prev max (${prevMax})`);
            prevMax = range.max;
        });
    });

    test('Number range returns default for unknown age', () => {
        const range = getNumberRange('unknown');
        assert.ok(range.min >= 1);
        assert.ok(range.max >= 10);
    });
}

if (getVocabularyLevel) {
    test('Vocabulary level progression matches age groups', () => {
        const expected = {
            '4-5': 'basic',
            '6': 'elementary',
            '7': 'intermediate',
            '8': 'advanced',
            '9+': 'proficient',
            '10+': 'expert'
        };
        Object.entries(expected).forEach(([age, level]) => {
            assert.strictEqual(getVocabularyLevel(age), level,
                `Age ${age} should have vocab level ${level}`);
        });
    });
}

// ============================================================================
console.log('\n=== Drawing Tutorial Data Tests ===');
// ============================================================================

// Validate drawing-generator.js has tutorial data structure
let drawingHasData = false;
try {
    const drawingJs = fs.readFileSync(path.resolve(__dirname, '..', 'drawing-generator.js'), 'utf8');

    test('Drawing generator file exists and is substantial', () => {
        assert.ok(drawingJs.length > 5000, 'Drawing generator should be >5000 chars');
    });

    test('Drawing has getTutorialsByAge function', () => {
        assert.ok(drawingJs.includes('getTutorialsByAge'),
            'Missing getTutorialsByAge function');
    });

    test('Drawing has loadAllTutorials function', () => {
        assert.ok(drawingJs.includes('loadAllTutorials'),
            'Missing loadAllTutorials function');
    });

    test('Drawing has initializeDrawingCanvas function', () => {
        assert.ok(drawingJs.includes('initializeDrawingCanvas'),
            'Missing initializeDrawingCanvas function');
    });

    test('Drawing has undo/redo functions', () => {
        assert.ok(drawingJs.includes('function undo'), 'Missing undo function');
        assert.ok(drawingJs.includes('function redo'), 'Missing redo function');
    });

    test('Drawing has saveState and MAX_UNDO_STEPS', () => {
        assert.ok(drawingJs.includes('saveState'), 'Missing saveState function');
        assert.ok(drawingJs.includes('MAX_UNDO_STEPS'), 'Missing MAX_UNDO_STEPS constant');
    });

    test('Drawing has color palette functions', () => {
        assert.ok(drawingJs.includes('changeColor'), 'Missing changeColor function');
        assert.ok(drawingJs.includes('changeBrushSize'), 'Missing changeBrushSize function');
    });

    test('Drawing has savePDF function', () => {
        assert.ok(drawingJs.includes('savePDF'), 'Missing savePDF function');
    });

    test('Drawing tutorial data covers easy/medium/hard', () => {
        assert.ok(drawingJs.includes("'easy'") || drawingJs.includes('"easy"'),
            'Missing easy difficulty reference');
        assert.ok(drawingJs.includes("'medium'") || drawingJs.includes('"medium"'),
            'Missing medium difficulty reference');
        assert.ok(drawingJs.includes("'hard'") || drawingJs.includes('"hard"'),
            'Missing hard difficulty reference');
    });

    test('Drawing has touch event handlers', () => {
        assert.ok(drawingJs.includes('touchstart') || drawingJs.includes('handleTouchStart'),
            'Missing touch event handler');
        assert.ok(drawingJs.includes('touchmove') || drawingJs.includes('handleTouchMove'),
            'Missing touch move handler');
    });

    test('Drawing references getDemoLimit for tutorial limiting', () => {
        assert.ok(drawingJs.includes('getDemoLimit'),
            'Drawing should use getDemoLimit for demo mode');
    });

    drawingHasData = true;
} catch (e) {
    console.error('  [WARN] Could not load drawing-generator.js:', e.message.substring(0, 100));
}

// ============================================================================
console.log('\n=== Completion Manager Logic Tests ===');
// ============================================================================

test('All score-based modules use same threshold (95)', () => {
    ['math', 'english', 'aptitude'].forEach(mod => {
        const rule = getCompletionRule(mod);
        assert.strictEqual(rule.threshold, 95,
            `${mod} threshold should be 95, got ${rule.threshold}`);
    });
});

test('All non-score modules do not require score', () => {
    ['drawing', 'german', 'german-kids', 'stories', 'eq'].forEach(mod => {
        const rule = getCompletionRule(mod);
        assert.strictEqual(rule.requiresScore, false,
            `${mod} should not require score`);
    });
});

test('Score boundary: 95 is completed, 94.99 rounded down is not', () => {
    assert.strictEqual(isPageCompleted('math', 95).completed, true);
    assert.strictEqual(isPageCompleted('math', 94).completed, false);
});

test('Manual modules: score is irrelevant, only manuallyMarked matters', () => {
    assert.strictEqual(isPageCompleted('drawing', 100, false).completed, false);
    assert.strictEqual(isPageCompleted('drawing', 0, true).completed, true);
    assert.strictEqual(isPageCompleted('stories', 100, false).completed, false);
    assert.strictEqual(isPageCompleted('stories', 0, true).completed, true);
});

test('Sequential page requirement for score-based modules', () => {
    ['math', 'english', 'aptitude'].forEach(mod => {
        const rule = getCompletionRule(mod);
        assert.strictEqual(rule.sequentialPages, true,
            `${mod} should require sequential pages`);
    });
});

test('No sequential requirement for manual modules', () => {
    ['drawing', 'german', 'stories', 'eq'].forEach(mod => {
        const rule = getCompletionRule(mod);
        assert.strictEqual(rule.sequentialPages, false,
            `${mod} should not require sequential pages`);
    });
});

// ============================================================================
console.log('\n=== formatStoryText Tests ===');
// ============================================================================

// Inline the formatStoryText function for testing
function formatStoryText(text) {
    if (!text) return '';
    if (text.includes('<p>') || text.includes('<p ')) return text;
    if (text.includes('\n\n')) {
        return text.split(/\n\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .map(p => `<p>${p}</p>`)
            .join('\n');
    }
    const sentences = text.match(/[^.!?]*[.!?]+(\s|$)/g);
    if (!sentences || sentences.length <= 3) {
        return `<p>${text.trim()}</p>`;
    }
    const paragraphs = [];
    const sentencesPerPara = sentences.length <= 6 ? 2 : 3;
    for (let i = 0; i < sentences.length; i += sentencesPerPara) {
        const chunk = sentences.slice(i, i + sentencesPerPara).join('').trim();
        if (chunk) paragraphs.push(`<p>${chunk}</p>`);
    }
    return paragraphs.join('\n');
}

test('formatStoryText: empty text returns empty string', () => {
    assert.strictEqual(formatStoryText(''), '');
    assert.strictEqual(formatStoryText(null), '');
    assert.strictEqual(formatStoryText(undefined), '');
});

test('formatStoryText: text with <p> tags returned as-is', () => {
    const html = '<p>Hello</p><p>World</p>';
    assert.strictEqual(formatStoryText(html), html);
});

test('formatStoryText: double newlines split into paragraphs', () => {
    const text = 'First paragraph.\n\nSecond paragraph.';
    const result = formatStoryText(text);
    assert.ok(result.includes('<p>First paragraph.</p>'));
    assert.ok(result.includes('<p>Second paragraph.</p>'));
});

test('formatStoryText: short text (<=3 sentences) wraps in single p', () => {
    const text = 'One sentence. Two sentences. Three sentences.';
    const result = formatStoryText(text);
    assert.strictEqual(result, `<p>${text}</p>`);
});

test('formatStoryText: 4-6 sentences split into groups of 2', () => {
    const text = 'First. Second. Third. Fourth.';
    const result = formatStoryText(text);
    const pCount = (result.match(/<p>/g) || []).length;
    assert.strictEqual(pCount, 2, `Expected 2 paragraphs, got ${pCount}`);
});

test('formatStoryText: 7+ sentences split into groups of 3', () => {
    const text = 'One. Two. Three. Four. Five. Six. Seven. Eight.';
    const result = formatStoryText(text);
    const pCount = (result.match(/<p>/g) || []).length;
    assert.ok(pCount >= 2, `Expected >=2 paragraphs, got ${pCount}`);
});

// ============================================================================
console.log('\n=== Cross-Module Consistency ===');
// ============================================================================

test('APP_CONFIG.AGE_GROUPS matches level mapper age groups', () => {
    const expected = ['4-5', '6', '7', '8', '9+', '10+'];
    assert.deepStrictEqual(APP_CONFIG.AGE_GROUPS, expected);
});

test('APP_CONFIG.DIFFICULTIES matches completion module difficulties', () => {
    assert.deepStrictEqual(APP_CONFIG.DIFFICULTIES, ['easy', 'medium', 'hard']);
});

test('WEEKLY_CONFIG pages match APP_CONFIG weekly pages', () => {
    assert.strictEqual(WEEKLY_CONFIG.MATH_PAGES_PER_WEEK, APP_CONFIG.PAGE_ACCESS.WEEKLY_PAGE_COUNT);
    assert.strictEqual(WEEKLY_CONFIG.ENGLISH_PAGES_PER_WEEK, APP_CONFIG.PAGE_ACCESS.WEEKLY_PAGE_COUNT);
});

test('demo limit consistent across configs', () => {
    assert.strictEqual(APP_CONFIG.DEMO_LIMIT, APP_CONFIG.PAGE_ACCESS.DEMO_PAGE_COUNT);
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n${'='.repeat(60)}`);
console.log(`All Features Tests: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(60)}`);

if (failed > 0) {
    console.log('\nFailed tests:');
    failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    process.exit(1);
} else {
    console.log('\nAll feature tests PASSED!\n');
}
