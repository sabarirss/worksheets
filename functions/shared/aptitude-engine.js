/**
 * Shared Aptitude Engine - Used by both client and Cloud Functions
 *
 * Provides deterministic aptitude question generation and server-side validation.
 * Given the same (type, age, seed, page), this module ALWAYS produces the same
 * questions with the same shuffled options.
 *
 * Usage (Cloud Functions):
 *   const { getAptitudeQuestions, validateAptitudeSubmission } = require('./shared/aptitude-engine');
 *   const questions = getAptitudeQuestions('patterns', '6', 12345, 1);
 *   const result = validateAptitudeSubmission('patterns', '6', 12345, 1, userAnswers);
 */

// ============================================================================
// SEEDED PRNG - Same algorithm as math-engine.js
// ============================================================================

class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// ============================================================================
// LEVEL MAPPING
// ============================================================================

function ageAndDifficultyToLevel(age, diff) {
    const map = {
        '4-5': { easy: 1, medium: 2, hard: 2 },
        '6': { easy: 3, medium: 4, hard: 4 },
        '7': { easy: 5, medium: 6, hard: 6 },
        '8': { easy: 7, medium: 8, hard: 8 },
        '9+': { easy: 9, medium: 10, hard: 10 },
        '10+': { easy: 11, medium: 12, hard: 12 }
    };
    const ageMap = map[String(age)];
    if (!ageMap) return 1;
    return ageMap[diff] || ageMap.easy || 1;
}

const AGE_TO_GROUP = {
    '4': '4-5', '5': '4-5', '4-5': '4-5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9+', '9+': '9+',
    '10': '10+', '11': '10+', '12': '10+', '13': '10+', '10+': '10+'
};

function getAgeGroupFromAge(age) {
    return AGE_TO_GROUP[String(age)] || '6';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function seededShuffle(array, rng) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

// ============================================================================
// CONTENT BANKS - All question data for server-side generation
// ============================================================================

const ageBasedPatterns = require('./aptitude-data').ageBasedPatterns;
const ageBasedSequences = require('./aptitude-data').ageBasedSequences;
const ageBasedMatching = require('./aptitude-data').ageBasedMatching;
const ageBasedOddOneOut = require('./aptitude-data').ageBasedOddOneOut;
const ageBasedComparison = require('./aptitude-data').ageBasedComparison;
const ageBasedLogic = require('./aptitude-data').ageBasedLogic;
const ageBasedCounting = require('./aptitude-data').ageBasedCounting;

// ============================================================================
// QUESTION GENERATION - Matches client-side buildProgressivePool + loadPuzzles
// ============================================================================

const QUESTIONS_PER_PAGE = {
    patterns: 6, counting: 8, sequences: 4, matching: 6,
    oddone: 5, comparison: 6, logic: 6
};

/**
 * Get the content bank for a given type and age group.
 * Returns array of all questions across easy/medium/hard (progressive pool).
 */
function buildProgressivePool(type, ageGroup) {
    const difficulties = ['easy', 'medium', 'hard'];
    const pool = [];

    for (const diff of difficulties) {
        let items = [];
        const bank = getContentBank(type);
        if (!bank) continue;

        const ageData = bank[ageGroup] || bank['6'];
        if (!ageData) continue;
        const diffData = ageData[diff];
        if (!diffData) continue;

        switch (type) {
            case 'patterns':
                items = (diffData || []).map(p => ({
                    type: 'pattern', pattern: p.pattern, answer: p.answer,
                    options: p.options, reason: p.reason || 'Pattern repeats', difficulty: diff
                }));
                break;
            case 'sequences':
                items = (diffData || []).map(s => ({
                    type: 'sequence', sequence: s.sequence, answer: String(s.answer),
                    options: s.options, reason: s.reason, difficulty: diff
                }));
                break;
            case 'matching':
                items = (diffData || []).map(p => ({
                    type: 'matching', left: p.left, answer: p.right,
                    options: p.options, reason: p.reason, difficulty: diff
                }));
                break;
            case 'oddone':
                items = (diffData || []).map(s => ({
                    type: 'oddone', items: s.items, answer: s.answer,
                    reason: s.reason, difficulty: diff
                }));
                break;
            case 'comparison':
                items = (diffData || []).map(c => ({
                    type: 'comparison', item1: c.item1, item2: c.item2,
                    question: c.question, answer: c.answer,
                    reason: c.reason || c.question, difficulty: diff
                }));
                break;
            case 'logic':
                items = (diffData || []).map(p => ({
                    type: 'logic', question: p.question, answer: String(p.answer),
                    difficulty: diff
                }));
                break;
        }
        pool.push(...items);
    }
    return pool;
}

function getContentBank(type) {
    switch (type) {
        case 'patterns': return ageBasedPatterns;
        case 'sequences': return ageBasedSequences;
        case 'matching': return ageBasedMatching;
        case 'oddone': return ageBasedOddOneOut;
        case 'comparison': return ageBasedComparison;
        case 'logic': return ageBasedLogic;
        default: return null;
    }
}

/**
 * Generate counting puzzles deterministically using seeded PRNG.
 */
function generateCountingPuzzles(count, difficulty, ageGroup, rng) {
    const config = (ageBasedCounting[ageGroup] && ageBasedCounting[ageGroup][difficulty])
        || { range: { min: 3, max: 20 }, items: ['🍎', '⭐', '🐶', '🌸', '🎈', '🐝', '🍪', '🦋'] };

    const { min, max } = config.range;
    const puzzles = [];

    for (let i = 0; i < count; i++) {
        const itemEmoji = config.items[i % config.items.length];
        const qty = Math.floor(rng.next() * (max - min + 1)) + min;
        puzzles.push({
            type: 'counting',
            emoji: itemEmoji,
            quantity: qty,
            answer: String(qty),
            difficulty: difficulty
        });
    }
    return puzzles;
}

/**
 * Generate a deterministic set of questions for a given page.
 * For non-counting types: builds progressive pool, shuffles deterministically, paginates.
 * For counting: generates procedurally using seeded PRNG.
 */
function generateQuestionsForPage(type, age, seed, page) {
    const ageGroup = getAgeGroupFromAge(age);
    const count = QUESTIONS_PER_PAGE[type] || 6;
    const compositeSeed = hashCode(`aptitude-${type}-${ageGroup}-${seed}-${page}`);
    const rng = new SeededRandom(compositeSeed);

    if (type === 'counting') {
        // Progressive difficulty: pages 1-5 easy, 6-10 medium, 11-15 hard
        let pageDifficulty = 'easy';
        if (page > 10) pageDifficulty = 'hard';
        else if (page > 5) pageDifficulty = 'medium';
        return generateCountingPuzzles(count, pageDifficulty, ageGroup, rng);
    }

    // All other types: progressive pool, seeded shuffle, paginate
    const pool = buildProgressivePool(type, ageGroup);
    if (pool.length === 0) return [];

    const shuffledPool = seededShuffle(pool, rng);

    // Paginate
    const startIdx = (page - 1) * count;
    let questions = shuffledPool.slice(startIdx, startIdx + count);

    // If past end of pool, wrap around
    if (questions.length === 0 && page > 1) {
        questions = shuffledPool.slice(0, count);
    }

    // Shuffle options for each question deterministically
    return questions.map(q => {
        const copy = JSON.parse(JSON.stringify(q));
        if (copy.options) {
            copy.options = seededShuffle(copy.options, rng);
        }
        return copy;
    });
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get aptitude questions for a page WITHOUT answers.
 */
function getAptitudeQuestions(type, age, seed, page) {
    const questions = generateQuestionsForPage(type, age, seed, page);

    return questions.map(q => {
        const { answer, ...withoutAnswer } = q;
        return withoutAnswer;
    });
}

/**
 * Validate a user's aptitude submission by regenerating the same questions
 * and comparing answers.
 */
function validateAptitudeSubmission(type, age, seed, page, userAnswers) {
    const questions = generateQuestionsForPage(type, age, seed, page);
    const total = questions.length;
    let score = 0;

    const results = questions.map((q, index) => {
        const userAnswer = (userAnswers && userAnswers[index] != null)
            ? String(userAnswers[index]).trim()
            : '';
        const correctAnswer = String(q.answer).trim();

        // Case-insensitive, whitespace-normalized comparison
        const isCorrect = userAnswer.replace(/\s+/g, ' ').toLowerCase() ===
                          correctAnswer.replace(/\s+/g, ' ').toLowerCase();

        if (isCorrect) score++;

        return {
            questionIndex: index,
            correct: isCorrect,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer
        };
    });

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return { score, total, percentage, results };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    getAptitudeQuestions,
    validateAptitudeSubmission,
    generateQuestionsForPage,
    buildProgressivePool,
    SeededRandom,
    hashCode,
    seededShuffle,
    ageAndDifficultyToLevel,
    getAgeGroupFromAge,
    QUESTIONS_PER_PAGE
};
