// Age-Differentiated Aptitude Content
// Comprehensive puzzle generation with age-appropriate complexity

/**
 * Age-based pattern puzzles with progressive difficulty
 * Each age group has easy, medium, hard - appropriate for that age
 * INTERNAL: Kept for future assessment system - use levelBasedPatterns for access
 */

const ageBasedPatterns = {
    '4-5': {
        easy: [
            { pattern: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢'], reason: 'Red and blue take turns' },
            { pattern: ['😊', '😢', '😊', '😢'], answer: '😊', options: ['😊', '😢', '😡'], reason: 'Happy and sad take turns' },
            { pattern: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', options: ['🐶', '🐱', '🐭'], reason: 'Dog and cat take turns' },
            { pattern: ['⭐', '🌙', '⭐', '🌙'], answer: '⭐', options: ['⭐', '🌙', '☀️'], reason: 'Star and moon take turns' },
            { pattern: ['🍎', '🍊', '🍎', '🍊'], answer: '🍎', options: ['🍎', '🍊', '🍋'], reason: 'Apple and orange take turns' },
            { pattern: ['🔺', '⭕', '🔺', '⭕'], answer: '🔺', options: ['🔺', '⭕', '⬜'], reason: 'Triangle and circle take turns' },
            { pattern: ['🚗', '🚌', '🚗', '🚌'], answer: '🚗', options: ['🚗', '🚌', '🚕'], reason: 'Car and bus take turns' },
            { pattern: ['🌞', '🌙', '🌞', '🌙'], answer: '🌞', options: ['🌞', '🌙', '⭐'], reason: 'Sun and moon take turns' }
        ],
        medium: [
            { pattern: ['🔴', '🔴', '🔵', '🔴', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢'], reason: 'Two reds, then one blue' },
            { pattern: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙', options: ['⭐', '🌙', '☀️'], reason: 'Two stars, then one moon' },
            { pattern: ['🐶', '🐱', '🐱', '🐶', '🐱'], answer: '🐱', options: ['🐶', '🐱', '🐭'], reason: 'Dog, then two cats' },
            { pattern: ['😊', '😊', '😢', '😊', '😊'], answer: '😢', options: ['😊', '😢', '😡'], reason: 'Two happy, then one sad' },
            { pattern: ['🔺', '⭕', '⭕', '🔺', '⭕'], answer: '⭕', options: ['🔺', '⭕', '⬜'], reason: 'Triangle, then two circles' },
            { pattern: ['🍎', '🍊', '🍊', '🍎', '🍊'], answer: '🍊', options: ['🍎', '🍊', '🍋'], reason: 'Apple, then two oranges' }
        ],
        hard: [
            { pattern: ['🔴', '🔵', '🔴', '🔵', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢'], reason: 'Colors take turns: red, blue, red, blue...' },
            { pattern: ['🌞', '🌙', '⭐', '🌞', '🌙'], answer: '⭐', options: ['🌞', '🌙', '⭐'], reason: 'Three friends: sun, moon, star' },
            { pattern: ['🐶', '🐱', '🐭', '🐶', '🐱'], answer: '🐭', options: ['🐶', '🐱', '🐭'], reason: 'Three pets: dog, cat, mouse' },
            { pattern: ['😊', '😢', '😡', '😊', '😢'], answer: '😡', options: ['😊', '😢', '😡'], reason: 'Three faces: happy, sad, angry' }
        ]
    },
    '6': {
        easy: [
            { pattern: ['🔴', '🔴', '🔵', '🔴', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Two reds, then one blue repeats' },
            { pattern: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙', options: ['⭐', '🌙', '☀️', '💫'], reason: 'Two stars, then one moon repeats' },
            { pattern: ['1️⃣', '2️⃣', '2️⃣', '1️⃣', '2️⃣'], answer: '2️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'One, then two twos repeats' },
            { pattern: ['A', 'B', 'B', 'A', 'B'], answer: 'B', options: ['A', 'B', 'C', 'D'], reason: 'A, then two Bs repeats' },
            { pattern: ['🔺', '⭕', '⭕', '🔺', '⭕'], answer: '⭕', options: ['🔺', '⭕', '⬜', '🔶'], reason: 'Triangle, then two circles repeats' }
        ],
        medium: [
            { pattern: ['🔴', '🔴', '🔵', '🔴', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Two reds, one blue, two reds, one blue...' },
            { pattern: ['1️⃣', '2️⃣', '2️⃣', '1️⃣', '2️⃣'], answer: '2️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'One, two twos, one, two twos...' },
            { pattern: ['A', 'B', 'C', 'A', 'B'], answer: 'C', options: ['A', 'B', 'C', 'D'], reason: 'ABC pattern repeats' },
            { pattern: ['⭐', '🌙', '🌙', '⭐', '🌙'], answer: '🌙', options: ['⭐', '🌙', '☀️', '💫'], reason: 'One star, two moons repeats' },
            { pattern: ['🔺', '⭕', '⬜', '🔺', '⭕'], answer: '⬜', options: ['🔺', '⭕', '⬜', '🔶'], reason: 'Three shapes cycle: triangle, circle, square' }
        ],
        hard: [
            { pattern: ['🔴', '🔵', '🔵', '🔴', '🔴', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Growing: 1 red, 2 blues, 3 reds, then blues' },
            { pattern: ['1️⃣', '1️⃣', '2️⃣', '2️⃣', '2️⃣', '3️⃣'], answer: '3️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Numbers increase: 2 ones, 3 twos, 4 threes' },
            { pattern: ['A', 'B', 'B', 'C', 'C', 'C'], answer: 'D', options: ['A', 'B', 'C', 'D'], reason: 'Growing: A once, B twice, C thrice, D four times' }
        ]
    },
    '7': {
        easy: [
            { pattern: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Alternating pattern: red-blue-red-blue' },
            { pattern: ['2️⃣', '4️⃣', '2️⃣', '4️⃣'], answer: '2️⃣', options: ['2️⃣', '4️⃣', '6️⃣', '8️⃣'], reason: 'Even numbers alternate: 2, 4, 2, 4' },
            { pattern: ['A', 'B', 'C', 'A', 'B'], answer: 'C', options: ['A', 'B', 'C', 'D'], reason: 'ABC sequence repeats' },
            { pattern: ['🔺', '🔺', '⭕', '🔺', '🔺'], answer: '⭕', options: ['🔺', '⭕', '⬜', '🔶'], reason: 'Two triangles, one circle pattern' }
        ],
        medium: [
            { pattern: ['🔴', '🔵', '🟢', '🔴', '🔵'], answer: '🟢', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Three colors cycle: red, blue, green' },
            { pattern: ['1️⃣', '2️⃣', '3️⃣', '1️⃣', '2️⃣'], answer: '3️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Counting 1-2-3 repeats' },
            { pattern: ['A', 'B', 'C', 'D', 'A'], answer: 'B', options: ['A', 'B', 'C', 'D'], reason: 'Four letters cycle in order' },
            { pattern: ['⭐', '⭐', '🌙', '🌙', '⭐'], answer: '⭐', options: ['⭐', '🌙', '☀️', '💫'], reason: 'Two stars, two moons, two stars' }
        ],
        hard: [
            { pattern: ['🔴', '🔵', '🔵', '🔴', '🔴', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Increasing pattern: 1 red, 2 blues, 3 reds, 4 blues' },
            { pattern: ['1️⃣', '3️⃣', '5️⃣', '7️⃣', '9️⃣'], answer: '1️⃣', options: ['0️⃣', '1️⃣', '2️⃣', '3️⃣'], reason: 'Odd numbers increase by 2 each time' },
            { pattern: ['A', 'C', 'E', 'G', 'I'], answer: 'K', options: ['H', 'I', 'J', 'K'], reason: 'Skip one letter each time: A-C-E-G-I-K' }
        ]
    },
    '8': {
        easy: [
            { pattern: ['🔴', '🔵', '🟢', '🔴', '🔵'], answer: '🟢', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Three-color pattern cycles' },
            { pattern: ['2️⃣', '4️⃣', '6️⃣', '8️⃣', '2️⃣'], answer: '4️⃣', options: ['2️⃣', '4️⃣', '6️⃣', '8️⃣'], reason: 'Even numbers 2-4-6-8 cycle' },
            { pattern: ['A', 'B', 'C', 'D', 'A'], answer: 'B', options: ['A', 'B', 'C', 'D'], reason: 'Four-letter sequence cycles' },
            { pattern: ['1️⃣', '3️⃣', '5️⃣', '7️⃣', '1️⃣'], answer: '3️⃣', options: ['1️⃣', '3️⃣', '5️⃣', '7️⃣'], reason: 'Odd numbers 1-3-5-7 cycle' }
        ],
        medium: [
            { pattern: ['🔴', '🔵', '🔵', '🟢', '🟢', '🟢'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Growing: 1 red, 2 blues, 3 greens, cycle restarts' },
            { pattern: ['1️⃣', '2️⃣', '4️⃣', '1️⃣', '2️⃣'], answer: '4️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Powers of 2: 1, 2, 4, 1, 2, 4' },
            { pattern: ['A', 'B', 'A', 'C', 'A', 'D'], answer: 'A', options: ['A', 'B', 'C', 'D'], reason: 'A appears every other, others advance' }
        ],
        hard: [
            { pattern: ['1️⃣', '4️⃣', '9️⃣', '1️⃣', '6️⃣'], answer: '2️⃣', options: ['2️⃣', '3️⃣', '4️⃣', '5️⃣'], reason: 'Square numbers: 1, 4, 9, 16, 25, 36' },
            { pattern: ['1️⃣', '3️⃣', '6️⃣', '1️⃣', '0️⃣', '1️⃣'], answer: '5️⃣', options: ['1️⃣', '2️⃣', '5️⃣', '8️⃣'], reason: 'Triangular numbers: 1, 3, 6, 10, 15, 21' },
            { pattern: ['A', 'C', 'F', 'J', 'O'], answer: 'U', options: ['P', 'Q', 'T', 'U'], reason: 'Skip increasing: +1, +2, +3, +4, +5 letters' }
        ]
    },
    '9+': {
        easy: [
            { pattern: ['🔴', '🔵', '🟢', '🟡', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Four colors cycle in order' },
            { pattern: ['2️⃣', '4️⃣', '6️⃣', '8️⃣', '2️⃣'], answer: '4️⃣', options: ['2️⃣', '4️⃣', '6️⃣', '8️⃣'], reason: 'Even numbers 2-4-6-8 cycle' },
            { pattern: ['A', 'C', 'E', 'G', 'A'], answer: 'C', options: ['A', 'B', 'C', 'D'], reason: 'Alternate letters: A-C-E-G cycle' }
        ],
        medium: [
            { pattern: ['1️⃣', '1️⃣', '2️⃣', '3️⃣', '5️⃣'], answer: '8️⃣', options: ['6️⃣', '7️⃣', '8️⃣', '9️⃣'], reason: 'Fibonacci: each number is sum of previous two' },
            { pattern: ['1️⃣', '4️⃣', '9️⃣', '1️⃣', '6️⃣'], answer: '2️⃣', options: ['2️⃣', '3️⃣', '4️⃣', '5️⃣'], reason: 'Perfect squares: 1, 4, 9, 16, 25, 36' },
            { pattern: ['A', 'B', 'D', 'G', 'K'], answer: 'P', options: ['L', 'M', 'N', 'P'], reason: 'Skip pattern: +0, +1, +2, +3, +4, +5' }
        ],
        hard: [
            { pattern: ['1️⃣', '8️⃣', '2️⃣', '7️⃣', '6️⃣', '4️⃣'], answer: '1️⃣', options: ['1️⃣', '2️⃣', '5️⃣', '8️⃣'], reason: 'Cube numbers: 1, 8, 27, 64, 125, 216' },
            { pattern: ['1️⃣', '2️⃣', '4️⃣', '7️⃣', '1️⃣', '1️⃣'], answer: '1️⃣', options: ['1️⃣', '6️⃣', '8️⃣', '9️⃣'], reason: 'Pentagonal numbers: 1, 2, 4, 7, 11, 16, 22' },
            { pattern: ['A', 'Z', 'B', 'Y', 'C'], answer: 'X', options: ['W', 'X', 'Y', 'Z'], reason: 'Alternating from start and end of alphabet' }
        ]
    },
    '10+': {
        easy: [
            { pattern: ['🔴', '🔵', '🟢', '🟡', '🔴', '🔵'], answer: '🟢', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Four colors cycle in order' },
            { pattern: ['2️⃣', '4️⃣', '6️⃣', '8️⃣', '2️⃣', '4️⃣'], answer: '6️⃣', options: ['2️⃣', '4️⃣', '6️⃣', '8️⃣'], reason: 'Even numbers 2-4-6-8 cycle' },
            { pattern: ['A', 'C', 'E', 'G', 'A', 'C'], answer: 'E', options: ['A', 'C', 'E', 'G'], reason: 'Skip one letter: A-C-E-G cycle' },
            { pattern: ['1️⃣', '3️⃣', '5️⃣', '7️⃣', '9️⃣', '1️⃣'], answer: '3️⃣', options: ['1️⃣', '3️⃣', '5️⃣', '7️⃣'], reason: 'Odd numbers cycle: 1-3-5-7-9' }
        ],
        medium: [
            { pattern: ['1️⃣', '1️⃣', '2️⃣', '3️⃣', '5️⃣', '8️⃣'], answer: '1️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Fibonacci sequence: 1,1,2,3,5,8,13,21' },
            { pattern: ['1️⃣', '2️⃣', '4️⃣', '8️⃣', '1️⃣', '6️⃣'], answer: '3️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Powers of 2: 1, 2, 4, 8, 16, 32, 64' },
            { pattern: ['2️⃣', '3️⃣', '5️⃣', '7️⃣', '1️⃣', '1️⃣'], answer: '1️⃣', options: ['1️⃣', '3️⃣', '5️⃣', '7️⃣'], reason: 'Prime numbers: 2, 3, 5, 7, 11, 13, 17' },
            { pattern: ['A', 'B', 'D', 'E', 'G', 'H'], answer: 'J', options: ['I', 'J', 'K', 'L'], reason: 'Consonants only: skip vowels in alphabet' }
        ],
        hard: [
            { pattern: ['1️⃣', '1️⃣', '4️⃣', '8️⃣', '3️⃣', '2️⃣'], answer: '4️⃣', options: ['1️⃣', '4️⃣', '6️⃣', '8️⃣'], reason: 'Catalan numbers: 1,1,2,5,14,42,132 (combinatorial sequence)' },
            { pattern: ['3️⃣', '6️⃣', '1️⃣', '0️⃣', '1️⃣', '5️⃣', '2️⃣', '1️⃣'], answer: '2️⃣', options: ['2️⃣', '4️⃣', '6️⃣', '8️⃣'], reason: 'Triangular numbers: 3,6,10,15,21,28' },
            { pattern: ['A', 'Z', 'B', 'Y', 'C', 'X'], answer: 'D', options: ['D', 'E', 'F', 'W'], reason: 'Alternating from start and end of alphabet: A,Z,B,Y,C,X,D,W' },
            { pattern: ['A', 'E', 'I', 'O', 'U'], answer: 'Y', options: ['V', 'W', 'X', 'Y'], reason: 'Vowels in alphabetical order, Y is sometimes vowel' }
        ]
    }
};

// Convert age-based patterns to level-based structure
function buildLevelBasedPatterns() {
    const levelPatterns = {};

    for (const ageGroup in ageBasedPatterns) {
        for (const difficulty in ageBasedPatterns[ageGroup]) {
            const level = ageAndDifficultyToLevel(ageGroup, difficulty);
            const key = `level${level}`;

            if (!levelPatterns[key]) {
                levelPatterns[key] = [];
            }

            // Add patterns for this level with metadata
            const patterns = ageBasedPatterns[ageGroup][difficulty];
            levelPatterns[key] = patterns.map(pattern => ({
                ...pattern,
                level: level,
                ageEquivalent: ageGroup,
                difficultyEquivalent: difficulty
            }));
        }
    }
    return levelPatterns;
}

const levelBasedPatterns = buildLevelBasedPatterns();

// Helper functions for pattern access
function getPatternsByLevel(level) {
    return levelBasedPatterns[`level${level}`] || [];
}

function getPatternsByAge(ageGroup, difficulty) {
    const level = ageAndDifficultyToLevel(ageGroup, difficulty);
    return getPatternsByLevel(level);
}

// Age-based counting puzzles with appropriate number ranges
// INTERNAL: Kept for future assessment system - use levelBasedCounting for access
const ageBasedCounting = {
    '4-5': {
        easy: {
            range: { min: 1, max: 3 },
            items: ['🍎', '⭐', '🐶']
        },
        medium: {
            range: { min: 2, max: 5 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗']
        },
        hard: {
            range: { min: 3, max: 8 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪']
        }
    },
    '6': {
        easy: {
            range: { min: 4, max: 10 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋']
        },
        medium: {
            range: { min: 6, max: 15 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽']
        },
        hard: {
            range: { min: 10, max: 20 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽', '🎵', '🌈']
        }
    },
    '7': {
        easy: {
            range: { min: 8, max: 20 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽']
        },
        medium: {
            range: { min: 15, max: 35 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽', '🎵', '🌈', '🎯']
        },
        hard: {
            range: { min: 25, max: 50 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽', '🎵', '🌈', '🎯', '🎭', '🎪', '🎬', '🎤']
        }
    },
    '8': {
        easy: {
            range: { min: 20, max: 50 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽', '🎵', '🌈', '🎯']
        },
        medium: {
            range: { min: 35, max: 80 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽', '🎵', '🌈', '🎯', '🎭', '🎪', '🎬', '🎤']
        },
        hard: {
            range: { min: 60, max: 120 },
            items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽', '🎵', '🌈', '🎯', '🎭', '🎪', '🎬', '🎤', '🎲', '🎰', '🎳', '🎮', '🎹']
        }
    },
    '9+': {
        easy: {
            range: { min: 50, max: 100 },
            items: ['🔢', '💯', '📊', '📈', '💰', '🏆', '🎯', '🌟', '✨', '💎']
        },
        medium: {
            range: { min: 80, max: 150 },
            items: ['🔢', '💯', '📊', '📈', '💰', '🏆', '🎯', '🌟', '✨', '💎', '🔷', '🔶', '🔹', '🔸', '💠']
        },
        hard: {
            range: { min: 120, max: 250 },
            items: ['🔢', '💯', '📊', '📈', '💰', '🏆', '🎯', '🌟', '✨', '💎', '🔷', '🔶', '🔹', '🔸', '💠']
        }
    },
    '10+': {
        easy: {
            range: { min: 100, max: 300 },
            items: ['🔢', '💯', '📊', '📈', '💰', '🏆', '🎯', '🌟', '✨', '💎', '🔷', '🔶']
        },
        medium: {
            range: { min: 200, max: 600 },
            items: ['🔢', '💯', '📊', '📈', '💰', '🏆', '🎯', '🌟', '✨', '💎', '🔷', '🔶', '🔹', '🔸', '💠']
        },
        hard: {
            range: { min: 400, max: 1000 },
            items: ['🔢', '💯', '📊', '📈', '💰', '🏆', '🎯', '🌟', '✨', '💎', '🔷', '🔶', '🔹', '🔸', '💠', '🎲', '🧮', '📐', '📏', '🔬']
        }
    }
};

// Convert age-based counting to level-based structure
function buildLevelBasedCounting() {
    const levelCounting = {};

    for (const ageGroup in ageBasedCounting) {
        const ageConfigs = ageBasedCounting[ageGroup];

        // Map each difficulty to its level
        for (const difficulty in ageConfigs) {
            const level = ageAndDifficultyToLevel(ageGroup, difficulty);
            const config = ageConfigs[difficulty];

            levelCounting[`level${level}`] = {
                ...config,
                level: level,
                ageEquivalent: ageGroup,
                difficultyEquivalent: difficulty
            };
        }
    }
    return levelCounting;
}

const levelBasedCounting = buildLevelBasedCounting();

// Helper functions for counting config access
function getCountingByLevel(level) {
    return levelBasedCounting[`level${level}`];
}

function getCountingByAge(ageGroup, difficulty = 'easy') {
    return ageBasedCounting[ageGroup]?.[difficulty];
}

/**
 * Age-based SEQUENCES with progressive difficulty
 * Each age group has easy, medium, hard sequences
 */
const ageBasedSequences = {
    '4-5': {
        easy: [
            { sequence: [1, 2, 3, 4], answer: '5', options: ['4', '5', '6', '7'], reason: 'Count up by 1: 1, 2, 3, 4, 5' },
            { sequence: [2, 4, 6, 8], answer: '10', options: ['9', '10', '11', '12'], reason: 'Count by 2s: 2, 4, 6, 8, 10' },
            { sequence: [5, 4, 3, 2], answer: '1', options: ['0', '1', '2', '3'], reason: 'Count down: 5, 4, 3, 2, 1' },
            { sequence: [1, 1, 2, 2], answer: '3', options: ['2', '3', '4', '5'], reason: 'Each number twice: 1, 1, 2, 2, 3' }
        ],
        medium: [
            { sequence: [1, 3, 5, 7], answer: '9', options: ['8', '9', '10', '11'], reason: 'Odd numbers: 1, 3, 5, 7, 9' },
            { sequence: [2, 4, 6, 8], answer: '10', options: ['9', '10', '11', '12'], reason: 'Even numbers: 2, 4, 6, 8, 10' },
            { sequence: [10, 9, 8, 7], answer: '6', options: ['5', '6', '7', '8'], reason: 'Count down from 10: 10, 9, 8, 7, 6' },
            { sequence: [1, 2, 2, 3], answer: '3', options: ['2', '3', '4', '5'], reason: 'Count with doubles: 1, 2, 2, 3, 3' }
        ],
        hard: [
            { sequence: [1, 2, 4, 5], answer: '7', options: ['6', '7', '8', '9'], reason: 'Add 1, add 2: 1, 2, 4, 5, 7' },
            { sequence: [10, 8, 6, 4], answer: '2', options: ['1', '2', '3', '4'], reason: 'Count down by 2s: 10, 8, 6, 4, 2' },
            { sequence: [1, 1, 2, 3], answer: '5', options: ['4', '5', '6', '7'], reason: 'Fibonacci start: 1, 1, 2, 3, 5' },
            { sequence: [5, 5, 4, 4], answer: '3', options: ['2', '3', '4', '5'], reason: 'Each twice, going down: 5, 5, 4, 4, 3' }
        ]
    },
    '6': {
        easy: [
            { sequence: [2, 4, 6, 8], answer: '10', options: ['9', '10', '11', '12'], reason: 'Even numbers: add 2 each time' },
            { sequence: [5, 10, 15, 20], answer: '25', options: ['22', '24', '25', '30'], reason: 'Count by 5s' },
            { sequence: [3, 6, 9, 12], answer: '15', options: ['13', '14', '15', '18'], reason: 'Count by 3s (multiples of 3)' },
            { sequence: [20, 18, 16, 14], answer: '12', options: ['10', '11', '12', '13'], reason: 'Count down by 2s from 20' }
        ],
        medium: [
            { sequence: [1, 4, 7, 10], answer: '13', options: ['11', '12', '13', '14'], reason: 'Add 3 each time: +3 pattern' },
            { sequence: [2, 5, 8, 11], answer: '14', options: ['12', '13', '14', '15'], reason: 'Add 3 each time: 2, 5, 8, 11, 14' },
            { sequence: [20, 17, 14, 11], answer: '8', options: ['7', '8', '9', '10'], reason: 'Subtract 3 each time' },
            { sequence: [1, 2, 4, 8], answer: '16', options: ['12', '14', '16', '18'], reason: 'Double each time: ×2 pattern' }
        ],
        hard: [
            { sequence: [1, 1, 2, 3, 5], answer: '8', options: ['6', '7', '8', '9'], reason: 'Fibonacci: add last two numbers' },
            { sequence: [2, 6, 12, 20], answer: '30', options: ['28', '30', '32', '34'], reason: '2×1, 2×3, 3×4, 4×5, 5×6' },
            { sequence: [1, 4, 9, 16], answer: '25', options: ['20', '24', '25', '30'], reason: 'Square numbers: 1², 2², 3², 4², 5²' },
            { sequence: [3, 5, 9, 17], answer: '33', options: ['30', '32', '33', '35'], reason: 'Double and add 1: ×2+1 pattern' }
        ]
    },
    '7': {
        easy: [
            { sequence: [10, 20, 30, 40], answer: '50', options: ['45', '50', '55', '60'], reason: 'Count by 10s' },
            { sequence: [4, 8, 12, 16], answer: '20', options: ['18', '19', '20', '24'], reason: 'Multiples of 4' },
            { sequence: [7, 14, 21, 28], answer: '35', options: ['32', '34', '35', '42'], reason: 'Count by 7s (7 times table)' },
            { sequence: [50, 45, 40, 35], answer: '30', options: ['25', '28', '30', '32'], reason: 'Count down by 5s from 50' }
        ],
        medium: [
            { sequence: [3, 7, 11, 15], answer: '19', options: ['17', '18', '19', '20'], reason: 'Add 4 each time' },
            { sequence: [2, 4, 8, 16], answer: '32', options: ['24', '28', '32', '36'], reason: 'Double each time (powers of 2)' },
            { sequence: [50, 43, 36, 29], answer: '22', options: ['20', '21', '22', '23'], reason: 'Subtract 7 each time' },
            { sequence: [1, 3, 6, 10], answer: '15', options: ['13', '14', '15', '16'], reason: 'Triangular numbers: add 1, add 2, add 3...' }
        ],
        hard: [
            { sequence: [2, 3, 5, 8, 12], answer: '17', options: ['15', '16', '17', '18'], reason: 'Add 1, add 2, add 3, add 4, add 5' },
            { sequence: [1, 4, 9, 16, 25], answer: '36', options: ['30', '32', '36', '40'], reason: 'Perfect squares: 1², 2², 3², 4², 5², 6²' },
            { sequence: [2, 6, 12, 20, 30], answer: '42', options: ['38', '40', '42', '45'], reason: '1×2, 2×3, 3×4, 4×5, 5×6, 6×7' },
            { sequence: [1, 1, 2, 3, 5, 8], answer: '13', options: ['11', '12', '13', '14'], reason: 'Fibonacci: each is sum of previous two' }
        ]
    },
    '8': {
        easy: [
            { sequence: [6, 12, 18, 24], answer: '30', options: ['28', '30', '32', '36'], reason: 'Multiples of 6' },
            { sequence: [9, 18, 27, 36], answer: '45', options: ['40', '42', '45', '48'], reason: 'Count by 9s' },
            { sequence: [100, 90, 80, 70], answer: '60', options: ['50', '55', '60', '65'], reason: 'Count down by 10s' },
            { sequence: [15, 30, 45, 60], answer: '75', options: ['70', '75', '80', '90'], reason: 'Count by 15s' }
        ],
        medium: [
            { sequence: [5, 11, 17, 23], answer: '29', options: ['27', '28', '29', '30'], reason: 'Add 6 each time' },
            { sequence: [3, 9, 27, 81], answer: '243', options: ['162', '200', '243', '324'], reason: 'Multiply by 3 (powers of 3)' },
            { sequence: [100, 88, 76, 64], answer: '52', options: ['48', '50', '52', '54'], reason: 'Subtract 12 each time' },
            { sequence: [1, 4, 10, 19], answer: '31', options: ['28', '30', '31', '33'], reason: 'Add 3, add 6, add 9, add 12' }
        ],
        hard: [
            { sequence: [1, 8, 27, 64], answer: '125', options: ['100', '120', '125', '128'], reason: 'Cube numbers: 1³, 2³, 3³, 4³, 5³' },
            { sequence: [2, 6, 12, 20, 30, 42], answer: '56', options: ['52', '54', '56', '60'], reason: 'n×(n+1): 1×2, 2×3, 3×4, 4×5, 5×6, 6×7, 7×8' },
            { sequence: [1, 2, 4, 7, 11], answer: '16', options: ['14', '15', '16', '17'], reason: 'Add 1, add 2, add 3, add 4, add 5' },
            { sequence: [3, 7, 15, 31], answer: '63', options: ['60', '62', '63', '64'], reason: 'Double and add 1: ×2+1' }
        ]
    },
    '9+': {
        easy: [
            { sequence: [12, 24, 36, 48], answer: '60', options: ['54', '56', '60', '72'], reason: 'Multiples of 12' },
            { sequence: [11, 22, 33, 44], answer: '55', options: ['50', '55', '60', '66'], reason: 'Count by 11s' },
            { sequence: [200, 180, 160, 140], answer: '120', options: ['100', '110', '120', '130'], reason: 'Count down by 20s' },
            { sequence: [25, 50, 75, 100], answer: '125', options: ['110', '120', '125', '150'], reason: 'Count by 25s' }
        ],
        medium: [
            { sequence: [7, 15, 23, 31], answer: '39', options: ['35', '37', '39', '40'], reason: 'Add 8 each time' },
            { sequence: [5, 25, 125, 625], answer: '3125', options: ['2500', '3000', '3125', '3750'], reason: 'Multiply by 5 (powers of 5)' },
            { sequence: [200, 175, 150, 125], answer: '100', options: ['95', '100', '105', '110'], reason: 'Subtract 25 each time' },
            { sequence: [1, 5, 14, 30], answer: '55', options: ['50', '52', '55', '60'], reason: 'Add 4, add 9, add 16, add 25 (square numbers)' }
        ],
        hard: [
            { sequence: [1, 3, 6, 10, 15, 21], answer: '28', options: ['25', '27', '28', '30'], reason: 'Triangular numbers: 1, 1+2, 1+2+3, 1+2+3+4...' },
            { sequence: [2, 3, 5, 7, 11], answer: '13', options: ['12', '13', '14', '15'], reason: 'Prime numbers: 2, 3, 5, 7, 11, 13' },
            { sequence: [1, 8, 27, 64, 125], answer: '216', options: ['180', '200', '216', '243'], reason: 'Perfect cubes: 1³, 2³, 3³, 4³, 5³, 6³' },
            { sequence: [0, 1, 1, 2, 3, 5, 8, 13], answer: '21', options: ['18', '20', '21', '24'], reason: 'Fibonacci sequence' }
        ]
    },
    '10+': {
        easy: [
            { sequence: [15, 30, 45, 60], answer: '75', options: ['65', '70', '75', '90'], reason: 'Multiples of 15' },
            { sequence: [13, 26, 39, 52], answer: '65', options: ['60', '63', '65', '78'], reason: 'Count by 13s' },
            { sequence: [500, 450, 400, 350], answer: '300', options: ['250', '280', '300', '320'], reason: 'Count down by 50s' },
            { sequence: [64, 128, 192, 256], answer: '320', options: ['288', '300', '320', '384'], reason: 'Multiples of 64' }
        ],
        medium: [
            { sequence: [11, 23, 35, 47], answer: '59', options: ['55', '57', '59', '60'], reason: 'Add 12 each time' },
            { sequence: [2, 8, 32, 128], answer: '512', options: ['256', '384', '512', '640'], reason: 'Multiply by 4 (powers of 4)' },
            { sequence: [500, 437, 374, 311], answer: '248', options: ['236', '243', '248', '250'], reason: 'Subtract 63 each time' },
            { sequence: [1, 6, 15, 28], answer: '45', options: ['40', '42', '45', '50'], reason: 'Add 5, add 9, add 13, add 17 (+4 increment)' }
        ],
        hard: [
            { sequence: [1, 5, 12, 22, 35], answer: '51', options: ['45', '48', '51', '55'], reason: 'Pentagonal numbers: n(3n-1)/2' },
            { sequence: [1, 1, 2, 6, 24], answer: '120', options: ['96', '100', '120', '144'], reason: 'Factorials: 1!, 1!, 2!, 3!, 4!, 5!' },
            { sequence: [1, 2, 5, 14, 42], answer: '132', options: ['120', '128', '132', '140'], reason: 'Catalan numbers: 1, 2, 5, 14, 42, 132' },
            { sequence: [2, 3, 5, 7, 11, 13, 17], answer: '19', options: ['18', '19', '20', '21'], reason: 'Prime number sequence' }
        ]
    }
};

/**
 * Age-based MATCHING puzzles with progressive difficulty
 */
const ageBasedMatching = {
    '4-5': {
        easy: [
            { left: '🐱', right: '🥛', options: ['🥛', '🦴', '🥕'], reason: 'Cats drink milk' },
            { left: '🐶', right: '🦴', options: ['🦴', '🥛', '🌻'], reason: 'Dogs love bones' },
            { left: '🐝', right: '🌻', options: ['🌻', '🦴', '🌊'], reason: 'Bees visit flowers' },
            { left: '🐟', right: '🌊', options: ['🌊', '🪺', '🥛'], reason: 'Fish live in water' },
            { left: '🐦', right: '🪺', options: ['🪺', '🥕', '🌻'], reason: 'Birds live in nests' },
            { left: '🐰', right: '🥕', options: ['🥕', '🦴', '🥛'], reason: 'Rabbits eat carrots' }
        ],
        medium: [
            { left: '👁️', right: '👓', options: ['👓', '👂', '👃'], reason: 'Glasses help us see' },
            { left: '👂', right: '🎵', options: ['🎵', '👓', '🍎'], reason: 'Ears hear music' },
            { left: '👃', right: '🌸', options: ['🌸', '🎵', '👓'], reason: 'Nose smells flowers' },
            { left: '✋', right: '🧤', options: ['🧤', '👞', '🎩'], reason: 'Hands wear gloves' },
            { left: '🦶', right: '👞', options: ['👞', '🧤', '👓'], reason: 'Feet wear shoes' },
            { left: '👤', right: '🎩', options: ['🎩', '👞', '🧤'], reason: 'Head wears hat' }
        ],
        hard: [
            { left: '🌧️', right: '☂️', options: ['☂️', '☀️', '🌙'], reason: 'Umbrella for rain' },
            { left: '☀️', right: '🕶️', options: ['🕶️', '☂️', '🧥'], reason: 'Sunglasses for sun' },
            { left: '❄️', right: '🧥', options: ['🧥', '🕶️', '🩳'], reason: 'Coat for cold' },
            { left: '🏖️', right: '🩳', options: ['🩳', '🧥', '☂️'], reason: 'Shorts for beach' },
            { left: '🌙', right: '🛌', options: ['🛌', '🏃', '🍽️'], reason: 'Sleep at night' },
            { left: '🌞', right: '🏃', options: ['🏃', '🛌', '🌙'], reason: 'Play during day' }
        ]
    },
    '6': {
        easy: [
            { left: '🔑', right: '🔒', options: ['🔒', '🚪', '🪟', '🏠'], reason: 'Keys open locks' },
            { left: '📱', right: '🔋', options: ['🔋', '💡', '🔌', '⚡'], reason: 'Phones need batteries' },
            { left: '🌧️', right: '☂️', options: ['☂️', '🕶️', '🧥', '🧢'], reason: 'Umbrella protects from rain' },
            { left: '✏️', right: '📝', options: ['📝', '📚', '✂️', '📏'], reason: 'Pencils write on paper' },
            { left: '🧲', right: '🔩', options: ['🔩', '🪵', '🪨', '🧱'], reason: 'Magnets attract metal' },
            { left: '🔥', right: '💧', options: ['💧', '💨', '⚡', '🌊'], reason: 'Water puts out fire' }
        ],
        medium: [
            { left: '🌱', right: '🌳', options: ['🌳', '🍂', '🌸', '🌾'], reason: 'Seed grows into tree' },
            { left: '🥚', right: '🐣', options: ['🐣', '🐔', '🐓', '🦆'], reason: 'Egg hatches into chick' },
            { left: '🐛', right: '🦋', options: ['🦋', '🐝', '🐜', '🐞'], reason: 'Caterpillar becomes butterfly' },
            { left: '🌧️', right: '🌈', options: ['🌈', '☂️', '⛈️', '🌊'], reason: 'Rainbow after rain' },
            { left: '📚', right: '🧠', options: ['🧠', '👁️', '👂', '✋'], reason: 'Books make you smart' },
            { left: '⚽', right: '🥅', options: ['🥅', '🏀', '🎾', '⚾'], reason: 'Soccer ball goes in goal' }
        ],
        hard: [
            { left: '🔬', right: '🧪', options: ['🧪', '🔭', '🩺', '🧲'], reason: 'Microscope and test tube for science' },
            { left: '🎨', right: '🖌️', options: ['🖌️', '✏️', '🖊️', '✂️'], reason: 'Paint with brush' },
            { left: '🎻', right: '🎵', options: ['🎵', '🔊', '📻', '🎤'], reason: 'Violin makes music' },
            { left: '🌡️', right: '🤒', options: ['🤒', '💊', '🩹', '🏥'], reason: 'Thermometer checks fever' },
            { left: '🔭', right: '⭐', options: ['⭐', '🌙', '☀️', '🪐'], reason: 'Telescope sees stars' },
            { left: '🧭', right: '🗺️', options: ['🗺️', '📍', '🌍', '🚗'], reason: 'Compass helps with map' }
        ]
    },
    '7': {
        easy: [
            { left: '🐝', right: '🍯', options: ['🍯', '🥛', '🧃', '🧈'], reason: 'Bees make honey' },
            { left: '🐄', right: '🥛', options: ['🥛', '🍯', '🥚', '🧀'], reason: 'Cows give milk' },
            { left: '🐔', right: '🥚', options: ['🥚', '🥛', '🍯', '🦴'], reason: 'Chickens lay eggs' },
            { left: '🌾', right: '🍞', options: ['🍞', '🍰', '🍪', '🧁'], reason: 'Wheat makes bread' },
            { left: '🌳', right: '🪵', options: ['🪵', '🍂', '🌰', '🌱'], reason: 'Trees give wood' },
            { left: '☁️', right: '🌧️', options: ['🌧️', '🌈', '⛈️', '❄️'], reason: 'Clouds bring rain' }
        ],
        medium: [
            { left: '⚡', right: '💡', options: ['💡', '🔋', '🔌', '🕯️'], reason: 'Electricity powers light' },
            { left: '🌬️', right: '🪁', options: ['🪁', '🎈', '🛩️', '🦅'], reason: 'Wind flies kites' },
            { left: '💨', right: '🌊', options: ['🌊', '⛵', '🏄', '🚤'], reason: 'Wind creates waves' },
            { left: '🔥', right: '💨', options: ['💨', '🌬️', '💧', '🧯'], reason: 'Fire creates smoke' },
            { left: '🌡️', right: '🔢', options: ['🔢', '📊', '📈', '🔠'], reason: 'Thermometer shows numbers' },
            { left: '⚖️', right: '⚫⚪', options: ['⚫⚪', '🔢', '📏', '🧮'], reason: 'Scale balances weight' }
        ],
        hard: [
            { left: '🧬', right: '👶', options: ['👶', '🧠', '💉', '🩺'], reason: 'DNA determines traits' },
            { left: '🔭', right: '🌌', options: ['🌌', '⭐', '🪐', '🌙'], reason: 'Telescope explores space' },
            { left: '⚛️', right: '💡', options: ['💡', '⚡', '🔬', '🧪'], reason: 'Atoms make energy' },
            { left: '🧲', right: '🧭', options: ['🧭', '🗺️', '📍', '🌐'], reason: 'Magnet powers compass' },
            { left: '🌍', right: '🌙', options: ['🌙', '⭐', '☀️', '🪐'], reason: 'Earth orbits with moon' },
            { left: '☀️', right: '🌱', options: ['🌱', '🌳', '🌸', '🍃'], reason: 'Sun helps plants grow' }
        ]
    },
    '8': {
        easy: [
            { left: '🧠', right: '💭', options: ['💭', '👁️', '👂', '💬'], reason: 'Brain creates thoughts' },
            { left: '💪', right: '🏋️', options: ['🏋️', '🏃', '🧘', '🤸'], reason: 'Muscles lift weights' },
            { left: '🫁', right: '💨', options: ['💨', '💧', '💡', '🌬️'], reason: 'Lungs breathe air' },
            { left: '❤️', right: '💓', options: ['💓', '💭', '💨', '💧'], reason: 'Heart pumps blood' },
            { left: '🦴', right: '💪', options: ['💪', '🧠', '👁️', '👂'], reason: 'Bones support muscles' },
            { left: '👁️', right: '💡', options: ['💡', '🌈', '👓', '🔍'], reason: 'Eyes need light to see' }
        ],
        medium: [
            { left: '⚙️', right: '🔧', options: ['🔧', '🔨', '🪛', '🔩'], reason: 'Gears need tools' },
            { left: '🔬', right: '🦠', options: ['🦠', '🧬', '🧪', '💉'], reason: 'Microscope shows germs' },
            { left: '🧪', right: '⚗️', options: ['⚗️', '🔬', '🧬', '💉'], reason: 'Test tube and flask for chemistry' },
            { left: '📡', right: '📶', options: ['📶', '📻', '📺', '📞'], reason: 'Antenna sends signals' },
            { left: '🔌', right: '⚡', options: ['⚡', '💡', '🔋', '🔌'], reason: 'Plug uses electricity' },
            { left: '🧮', right: '🔢', options: ['🔢', '📊', '📈', '➗'], reason: 'Abacus calculates numbers' }
        ],
        hard: [
            { left: '🌐', right: '💻', options: ['💻', '📱', '⌨️', '🖱️'], reason: 'Internet connects computers' },
            { left: '💾', right: '💿', options: ['💿', '💽', '📀', '🖥️'], reason: 'Storage media evolution' },
            { left: '🎙️', right: '🔊', options: ['🔊', '🎵', '📻', '🎧'], reason: 'Microphone to speaker' },
            { left: '📷', right: '🖼️', options: ['🖼️', '📸', '🎞️', '🎥'], reason: 'Camera makes pictures' },
            { left: '🧬', right: '🧫', options: ['🧫', '🔬', '💉', '🩺'], reason: 'DNA studied in lab' },
            { left: '⚛️', right: '💥', options: ['💥', '⚡', '🔥', '☢️'], reason: 'Atomic energy release' }
        ]
    },
    '9+': {
        easy: [
            { left: '🌍', right: '🌊', options: ['🌊', '🏔️', '🏜️', '🌲'], reason: 'Earth has oceans' },
            { left: '🌋', right: '🔥', options: ['🔥', '🪨', '💨', '🌊'], reason: 'Volcanoes have fire' },
            { left: '🏜️', right: '🌵', options: ['🌵', '🌲', '🌴', '🌳'], reason: 'Desert has cactus' },
            { left: '🏔️', right: '❄️', options: ['❄️', '🌲', '🪨', '☁️'], reason: 'Mountains have snow' },
            { left: '🌲', right: '🍂', options: ['🍂', '🌰', '🦌', '🐿️'], reason: 'Forest has leaves' },
            { left: '🌊', right: '🐠', options: ['🐠', '🐋', '🦈', '🐙'], reason: 'Ocean has fish' }
        ],
        medium: [
            { left: '⚗️', right: '🧪', options: ['🧪', '🔬', '🧬', '💉'], reason: 'Chemical reaction vessels' },
            { left: '🔭', right: '🌠', options: ['🌠', '⭐', '🌌', '🪐'], reason: 'Telescope observes space' },
            { left: '🧲', right: '⚡', options: ['⚡', '🔋', '💡', '🔌'], reason: 'Magnetism creates electricity' },
            { left: '🌡️', right: '💯', options: ['💯', '📊', '📈', '🔢'], reason: 'Thermometer measures degrees' },
            { left: '⚖️', right: '🪨', options: ['🪨', '🧱', '⚫', '🔩'], reason: 'Scale weighs objects' },
            { left: '📐', right: '📏', options: ['📏', '📊', '✏️', '📝'], reason: 'Geometry tools' }
        ],
        hard: [
            { left: '🧬', right: '🦠', options: ['🦠', '🧫', '🔬', '💉'], reason: 'DNA and microorganisms' },
            { left: '⚛️', right: '☢️', options: ['☢️', '⚡', '💥', '🔬'], reason: 'Atomic radiation' },
            { left: '🌐', right: '🛰️', options: ['🛰️', '📡', '📶', '💻'], reason: 'Internet via satellite' },
            { left: '💻', right: '🤖', options: ['🤖', '🦾', '🧠', '⚙️'], reason: 'Computers run AI' },
            { left: '🧬', right: '👶', options: ['👶', '🧫', '💉', '🩺'], reason: 'Genetics determine traits' },
            { left: '🔬', right: '🧫', options: ['🧫', '🦠', '🧬', '💉'], reason: 'Microscope examines cultures' }
        ]
    },
    '10+': {
        easy: [
            { left: '🧠', right: '🧬', options: ['🧬', '💭', '💡', '🎓'], reason: 'Brain and genetics' },
            { left: '💡', right: '⚡', options: ['⚡', '🔋', '🔌', '💥'], reason: 'Light needs electricity' },
            { left: '🔬', right: '🦠', options: ['🦠', '🧬', '🧫', '💉'], reason: 'Microscope studies bacteria' },
            { left: '🌍', right: '🌙', options: ['🌙', '☀️', '⭐', '🪐'], reason: 'Earth and its moon' },
            { left: '⚛️', right: '💡', options: ['💡', '⚡', '☢️', '🔬'], reason: 'Atoms create energy' },
            { left: '🧪', right: '⚗️', options: ['⚗️', '🔬', '🧬', '🦠'], reason: 'Chemistry equipment' }
        ],
        medium: [
            { left: '📡', right: '🛰️', options: ['🛰️', '📶', '🌐', '💻'], reason: 'Antenna communicates with satellite' },
            { left: '🧬', right: '💉', options: ['💉', '💊', '🩺', '🧫'], reason: 'DNA and gene therapy' },
            { left: '⚛️', right: '💥', options: ['💥', '⚡', '☢️', '🔬'], reason: 'Nuclear fission' },
            { left: '🔭', right: '🌌', options: ['🌌', '⭐', '🪐', '🌠'], reason: 'Telescope explores galaxies' },
            { left: '💻', right: '🤖', options: ['🤖', '⚙️', '🧠', '🦾'], reason: 'Computers run robotics' },
            { left: '🧲', right: '🧭', options: ['🧭', '🗺️', '📍', '🌐'], reason: 'Magnetism and navigation' }
        ],
        hard: [
            { left: '🧬', right: '🧫', options: ['🧫', '🔬', '💉', '🦠'], reason: 'Genetic engineering in lab' },
            { left: '⚛️', right: '☢️', options: ['☢️', '💥', '⚡', '🔬'], reason: 'Nuclear physics and radiation' },
            { left: '🌐', right: '💾', options: ['💾', '💻', '📱', '🖥️'], reason: 'Internet data storage' },
            { left: '🔬', right: '🧬', options: ['🧬', '🦠', '🧫', '💉'], reason: 'Microscopy of DNA' },
            { left: '🛰️', right: '🌍', options: ['🌍', '🌙', '⭐', '🪐'], reason: 'Satellite orbits Earth' },
            { left: '🧠', right: '💻', options: ['💻', '🤖', '🧬', '⚙️'], reason: 'Brain-computer interface' }
        ]
    }
};

/**
 * Age-based ODD ONE OUT puzzles with progressive difficulty
 */
const ageBasedOddOneOut = {
    '4-5': {
        easy: [
            { items: ['🍎', '🍊', '🍋', '🚗'], answer: '🚗', reason: 'Car is not a fruit' },
            { items: ['🐶', '🐱', '🐭', '🌳'], answer: '🌳', reason: 'Tree is not an animal' },
            { items: ['⚽', '🏀', '🎾', '🍎'], answer: '🍎', reason: 'Apple is not a ball' },
            { items: ['🟦', '🟥', '🟩', '⭕'], answer: '⭕', reason: 'Circle is not a square' },
            { items: ['😊', '😢', '😡', '🚗'], answer: '🚗', reason: 'Car is not a face' },
            { items: ['🐝', '🦋', '🐛', '🌸'], answer: '🌸', reason: 'Flower is not an insect' }
        ],
        medium: [
            { items: ['🍎', '🍊', '🍋', '🍌', '🚗'], answer: '🚗', reason: 'Car is not a fruit' },
            { items: ['🐶', '🐱', '🐭', '🐰', '🌳'], answer: '🌳', reason: 'Tree is not an animal' },
            { items: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '🅰️'], answer: '🅰️', reason: 'Letter is not a number' },
            { items: ['🔴', '🔵', '🟢', '🟡', '🔺'], answer: '🔺', reason: 'Triangle is not a circle' },
            { items: ['😊', '😢', '😡', '🤔', '🚗'], answer: '🚗', reason: 'Car is not an emotion' },
            { items: ['🏠', '🏫', '🏥', '🏦', '🐱'], answer: '🐱', reason: 'Cat is not a building' }
        ],
        hard: [
            { items: ['🍎', '🍊', '🍋', '🍌', '🍇', '🚗'], answer: '🚗', reason: 'Car is not a fruit' },
            { items: ['🐶', '🐱', '🐭', '🐰', '🐹', '🌳'], answer: '🌳', reason: 'Tree is not an animal' },
            { items: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '🅰️'], answer: '🅰️', reason: 'Letter is not a number' },
            { items: ['🔴', '🔵', '🟢', '🟡', '🟠', '🔺'], answer: '🔺', reason: 'Triangle is not a circle' },
            { items: ['😊', '😢', '😡', '🤔', '😴', '🚗'], answer: '🚗', reason: 'Car is not an emotion' },
            { items: ['🏠', '🏫', '🏥', '🏦', '🏪', '🐱'], answer: '🐱', reason: 'Cat is not a building' }
        ]
    },
    '6': {
        easy: [
            { items: ['⚽', '🏀', '🎾', '⚾', '🍎'], answer: '🍎', reason: 'Apple is not a sports ball' },
            { items: ['🐝', '🦋', '🐛', '🐜', '🌸'], answer: '🌸', reason: 'Flower is not an insect' },
            { items: ['🚗', '🚙', '🚕', '🚌', '🐶'], answer: '🐶', reason: 'Dog is not a vehicle' },
            { items: ['📚', '📖', '📝', '✏️', '🍎'], answer: '🍎', reason: 'Apple is not school supply' },
            { items: ['🌞', '⭐', '🌙', '☁️', '🐱'], answer: '🐱', reason: 'Cat is not in the sky' }
        ],
        medium: [
            { items: ['🦁', '🐯', '🐻', '🐘', '🦊'], answer: '🦊', reason: 'Fox is smaller than others' },
            { items: ['🍎', '🍊', '🥕', '🍋', '🍌'], answer: '🥕', reason: 'Carrot is a vegetable, not fruit' },
            { items: ['🔺', '🔻', '🔼', '🔽', '⭕'], answer: '⭕', reason: 'Circle is not a triangle' },
            { items: ['🌊', '💧', '🏊', '⛵', '🔥'], answer: '🔥', reason: 'Fire is opposite of water' },
            { items: ['✈️', '🚁', '🛩️', '🦅', '🚗'], answer: '🚗', reason: 'Car does not fly' }
        ],
        hard: [
            { items: ['2', '4', '6', '8', '9'], answer: '9', reason: '9 is odd, rest are even' },
            { items: ['🔴', '🔵', '🟢', '🟡', '🔺'], answer: '🔺', reason: 'Triangle is shape, rest are colors' },
            { items: ['🌍', '🪐', '⭐', '🌙', '☀️'], answer: '⭐', reason: 'Stars make their own light' },
            { items: ['🦈', '🐬', '🐙', '🐠', '🐊'], answer: '🐊', reason: 'Crocodile lives in rivers, not ocean' },
            { items: ['A', 'E', 'I', 'O', 'B'], answer: 'B', reason: 'B is consonant, rest are vowels' }
        ]
    },
    '7': {
        easy: [
            { items: ['🍔', '🍕', '🌭', '🍟', '🍎'], answer: '🍎', reason: 'Apple is healthy, rest are fast food' },
            { items: ['🦁', '🐯', '🐻', '🐺', '🐰'], answer: '🐰', reason: 'Rabbit is prey, rest are predators' },
            { items: ['🎸', '🎹', '🎺', '🥁', '🎨'], answer: '🎨', reason: 'Art is not music instrument' },
            { items: ['❤️', '💚', '💙', '💛', '🔺'], answer: '🔺', reason: 'Triangle is not a heart' },
            { items: ['🌲', '🌳', '🌴', '🌵', '🌸'], answer: '🌸', reason: 'Flower is not a tree' }
        ],
        medium: [
            { items: ['🥇', '🥈', '🥉', '🏅', '🎪'], answer: '🎪', reason: 'Circus is not a medal' },
            { items: ['🐍', '🦎', '🐊', '🐢', '🦈'], answer: '🦈', reason: 'Shark lives in water, rest on land' },
            { items: ['☀️', '🌙', '⭐', '☁️', '🔥'], answer: '🔥', reason: 'Fire is not in sky naturally' },
            { items: ['🍎', '🍊', '🍇', '🍌', '🥦'], answer: '🥦', reason: 'Broccoli is vegetable, rest are fruits' },
            { items: ['📱', '💻', '⌨️', '🖱️', '📚'], answer: '📚', reason: 'Book is not electronic' }
        ],
        hard: [
            { items: ['1', '4', '9', '16', '20'], answer: '20', reason: '20 is not a perfect square' },
            { items: ['2', '3', '5', '7', '9'], answer: '9', reason: '9 is not prime (3×3)' },
            { items: ['🌍', '🪐', '♂️', '♃', '☀️'], answer: '☀️', reason: 'Sun is a star, rest are planets' },
            { items: ['🦅', '🦆', '🦢', '🦜', '🦇'], answer: '🦇', reason: 'Bat is mammal, rest are birds' },
            { items: ['🔺', '🔶', '⬟', '⭕', '🔴'], answer: '⭕', reason: 'Circle has no sides' }
        ]
    },
    '8': {
        easy: [
            { items: ['🌍', '🪐', '🌙', '☀️', '⭐'], answer: '⭐', reason: 'Stars make light, rest reflect it' },
            { items: ['🐍', '🦎', '🐸', '🐊', '🐢'], answer: '🐸', reason: 'Frog is amphibian, rest are reptiles' },
            { items: ['🥛', '🧃', '☕', '🧋', '🍎'], answer: '🍎', reason: 'Apple is not a drink' },
            { items: ['📐', '📏', '✏️', '📊', '🎨'], answer: '🎨', reason: 'Art is not math tool' },
            { items: ['🧠', '❤️', '🫁', '🦴', '💪'], answer: '🦴', reason: 'Bones are not organs' }
        ],
        medium: [
            { items: ['H₂O', 'CO₂', 'O₂', 'N₂', 'Au'], answer: 'Au', reason: 'Gold is element, rest are compounds/molecules' },
            { items: ['△', '□', '○', '☆', '❤'], answer: '❤', reason: 'Heart is not geometric shape' },
            { items: ['🌋', '🏔️', '⛰️', '🗻', '🏖️'], answer: '🏖️', reason: 'Beach is flat, rest are mountains' },
            { items: ['🦈', '🐬', '🐳', '🐙', '🦀'], answer: '🐬', reason: 'Dolphin is mammal, rest are not' },
            { items: ['🔬', '🔭', '🧪', '⚗️', '🎨'], answer: '🎨', reason: 'Art is not science equipment' }
        ],
        hard: [
            { items: ['2', '4', '8', '16', '24'], answer: '24', reason: '24 breaks power of 2 pattern' },
            { items: ['1', '1', '2', '3', '6'], answer: '6', reason: 'Fibonacci is 1,1,2,3,5 not 6' },
            { items: ['🧬', '🦠', '🧫', '🔬', '⚛️'], answer: '⚛️', reason: 'Atom is physics, rest are biology' },
            { items: ['π', 'e', '√2', '∞', '5'], answer: '5', reason: '5 is rational, rest are irrational' },
            { items: ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Moon'], answer: 'Moon', reason: 'Moon is satellite, rest are planets' }
        ]
    },
    '9+': {
        easy: [
            { items: ['🦅', '🦆', '🦢', '🦜', '🦇'], answer: '🦇', reason: 'Bat is mammal, rest are birds' },
            { items: ['🌍', '🪐', '♂️', '♃', '☄️'], answer: '☄️', reason: 'Comet is not a planet' },
            { items: ['⚛️', '🧬', '🔬', '🧪', '🎨'], answer: '🎨', reason: 'Art is not science' },
            { items: ['💎', '🪨', '🧱', '🪵', '⚡'], answer: '⚡', reason: 'Lightning is energy, rest are solid' },
            { items: ['🧠', '❤️', '🫁', '🦴', '👁️'], answer: '🦴', reason: 'Bone is not an organ' }
        ],
        medium: [
            { items: ['Hydrogen', 'Oxygen', 'Nitrogen', 'Carbon', 'Water'], answer: 'Water', reason: 'Water is compound, rest are elements' },
            { items: ['🔺', '⬟', '⬢', '⬣', '⭕'], answer: '⭕', reason: 'Circle is only one with curved edge' },
            { items: ['🌋', '⚡', '🌊', '💨', '🏔️'], answer: '🏔️', reason: 'Mountain is static, rest are dynamic' },
            { items: ['🦠', '🧬', '🧫', '💉', '🌡️'], answer: '🌡️', reason: 'Thermometer measures, rest are biological' },
            { items: ['🔬', '🔭', '🧭', '⚗️', '🎸'], answer: '🎸', reason: 'Guitar is instrument, rest are scientific tools' }
        ],
        hard: [
            { items: ['3', '5', '7', '11', '15'], answer: '15', reason: '15 is composite (3×5), rest are prime' },
            { items: ['1', '3', '6', '10', '14'], answer: '14', reason: 'Triangular numbers are 1,3,6,10,15 not 14' },
            { items: ['e', 'π', 'φ', '√2', '2'], answer: '2', reason: '2 is rational, rest are irrational' },
            { items: ['photosynthesis', 'respiration', 'digestion', 'combustion', 'germination'], answer: 'combustion', reason: 'Combustion is chemical, rest are biological' },
            { items: ['mitosis', 'meiosis', 'osmosis', 'photosynthesis', 'homeostasis'], answer: 'photosynthesis', reason: 'Photosynthesis is plant-specific' }
        ]
    },
    '10+': {
        easy: [
            { items: ['proton', 'neutron', 'electron', 'atom', 'photon'], answer: 'atom', reason: 'Atom contains particles, not a particle itself' },
            { items: ['DNA', 'RNA', 'ATP', 'protein', 'lipid'], answer: 'lipid', reason: 'Lipid is not a nucleic acid or contains bases' },
            { items: ['velocity', 'acceleration', 'force', 'momentum', 'distance'], answer: 'distance', reason: 'Distance is scalar, rest are vectors' },
            { items: ['🌍', '🪐', '☀️', '🌙', '⭐'], answer: '⭐', reason: 'Stars produce light, rest reflect it' },
            { items: ['triangle', 'square', 'pentagon', 'hexagon', 'circle'], answer: 'circle', reason: 'Circle has no sides' }
        ],
        medium: [
            { items: ['2', '3', '5', '7', '11', '13', '15'], answer: '15', reason: '15 is not prime (3×5)' },
            { items: ['NaCl', 'H₂O', 'CO₂', 'O₂', 'Fe'], answer: 'Fe', reason: 'Iron is element, rest are compounds' },
            { items: ['mitochondria', 'chloroplast', 'nucleus', 'ribosome', 'vacuole'], answer: 'chloroplast', reason: 'Chloroplast only in plants' },
            { items: ['solid', 'liquid', 'gas', 'plasma', 'energy'], answer: 'energy', reason: 'Energy is not a state of matter' },
            { items: ['kinetic', 'potential', 'thermal', 'chemical', 'nuclear', 'sound'], answer: 'sound', reason: 'Sound is wave, not energy form' }
        ],
        hard: [
            { items: ['1', '4', '9', '16', '25', '36', '40'], answer: '40', reason: '40 is not a perfect square' },
            { items: ['Fibonacci', 'arithmetic', 'geometric', 'prime', 'factorial'], answer: 'prime', reason: 'Prime describes numbers, rest describe sequences' },
            { items: ['photosynthesis', 'glycolysis', 'Krebs cycle', 'electron transport', 'fermentation'], answer: 'photosynthesis', reason: 'Photosynthesis produces glucose, rest break it down' },
            { items: ['sin', 'cos', 'tan', 'cot', 'log'], answer: 'log', reason: 'Log is not a trig function' },
            { items: ['Newton', 'Einstein', 'Galileo', 'Copernicus', 'Darwin'], answer: 'Darwin', reason: 'Darwin was biologist, rest were physicists' }
        ]
    }
};

/**
 * Age-based COMPARISON puzzles with progressive difficulty
 */
const ageBasedComparison = {
    '4-5': {
        easy: [
            { item1: '🐘', item2: '🐭', question: 'Which is bigger?', answer: '🐘' },
            { item1: '🌳', item2: '🌱', question: 'Which is bigger?', answer: '🌳' },
            { item1: '⭐⭐⭐', item2: '⭐⭐', question: 'Which has more?', answer: '⭐⭐⭐' },
            { item1: '🍎🍎', item2: '🍎🍎🍎🍎', question: 'Which has more?', answer: '🍎🍎🍎🍎' },
            { item1: '🐜', item2: '🐻', question: 'Which is smaller?', answer: '🐜' },
            { item1: '🏀', item2: '⚽', question: 'Which is bigger?', answer: '🏀' }
        ],
        medium: [
            { item1: '🍪🍪🍪', item2: '🍪🍪🍪🍪🍪', question: 'Which has more?', answer: '🍪🍪🍪🍪🍪' },
            { item1: '🌞', item2: '⭐', question: 'Which is bigger in the sky?', answer: '🌞' },
            { item1: '🚗', item2: '🚂', question: 'Which is longer?', answer: '🚂' },
            { item1: '🎈🎈🎈🎈', item2: '🎈🎈', question: 'Which has less?', answer: '🎈🎈' },
            { item1: '🐘', item2: '🦒', question: 'Which is taller?', answer: '🦒' },
            { item1: '🐢', item2: '🐇', question: 'Which is faster?', answer: '🐇' }
        ],
        hard: [
            { item1: '🍪🍪🍪🍪🍪', item2: '🍪🍪🍪🍪🍪🍪🍪', question: 'Which has more?', answer: '🍪🍪🍪🍪🍪🍪🍪' },
            { item1: '5', item2: '8', question: 'Which number is bigger?', answer: '8' },
            { item1: '3', item2: '7', question: 'Which number is smaller?', answer: '3' },
            { item1: '🔥', item2: '❄️', question: 'Which is hotter?', answer: '🔥' },
            { item1: '🪶', item2: '🧱', question: 'Which is heavier?', answer: '🧱' },
            { item1: '🌊', item2: '💧', question: 'Which has more water?', answer: '🌊' }
        ]
    },
    '6': {
        easy: [
            { item1: '12', item2: '8', question: 'Which is bigger?', answer: '12' },
            { item1: '15', item2: '20', question: 'Which is smaller?', answer: '15' },
            { item1: '🍎🍎🍎🍎🍎🍎', item2: '🍎🍎🍎', question: 'Which has more?', answer: '🍎🍎🍎🍎🍎🍎' },
            { item1: '🦕', item2: '🦖', question: 'Which is a carnivore?', answer: '🦖' },
            { item1: '🌙', item2: '☀️', question: 'Which comes at night?', answer: '🌙' },
            { item1: '🌱', item2: '🌳', question: 'Which is older?', answer: '🌳' }
        ],
        medium: [
            { item1: '17', item2: '23', question: 'Which is bigger?', answer: '23' },
            { item1: '30', item2: '25', question: 'Which is smaller?', answer: '25' },
            { item1: '14', item2: '14', question: 'Are these equal?', answer: 'yes' },
            { item1: '🏔️', item2: '⛰️', question: 'Which is taller?', answer: '🏔️' },
            { item1: '🐌', item2: '🚀', question: 'Which is faster?', answer: '🚀' },
            { item1: '🍉', item2: '🍇', question: 'Which is bigger?', answer: '🍉' }
        ],
        hard: [
            { item1: '15 + 8', item2: '25', question: 'Which is bigger?', answer: '25' },
            { item1: '10 × 2', item2: '18', question: 'Which is bigger?', answer: '10 × 2' },
            { item1: '30 ÷ 2', item2: '12', question: 'Which is bigger?', answer: '30 ÷ 2' },
            { item1: '7 + 8', item2: '6 + 9', question: 'Are these equal?', answer: 'yes' },
            { item1: '🌍', item2: '🌙', question: 'Which is bigger?', answer: '🌍' },
            { item1: '💧', item2: '🌊', question: 'Which has more water?', answer: '🌊' }
        ]
    },
    '7': {
        easy: [
            { item1: '34', item2: '28', question: 'Which is bigger?', answer: '34' },
            { item1: '45', item2: '52', question: 'Which is smaller?', answer: '45' },
            { item1: '20 + 15', item2: '30', question: 'Which is bigger?', answer: '20 + 15' },
            { item1: '6 × 5', item2: '25', question: 'Which is bigger?', answer: '6 × 5' },
            { item1: '🐆', item2: '🐢', question: 'Which is faster?', answer: '🐆' },
            { item1: '🏔️', item2: '🏠', question: 'Which is taller?', answer: '🏔️' }
        ],
        medium: [
            { item1: '48', item2: '52', question: 'Which is bigger?', answer: '52' },
            { item1: '15 × 2', item2: '25', question: 'Which is bigger?', answer: '15 × 2' },
            { item1: '100 ÷ 5', item2: '18', question: 'Which is bigger?', answer: '100 ÷ 5' },
            { item1: '30 + 20', item2: '60 - 10', question: 'Are these equal?', answer: 'yes' },
            { item1: '☀️', item2: '🌍', question: 'Which is bigger?', answer: '☀️' },
            { item1: '🦒', item2: '🐘', question: 'Which is taller?', answer: '🦒' }
        ],
        hard: [
            { item1: '7²', item2: '50', question: 'Which is smaller?', answer: '7²' },
            { item1: '8 × 6', item2: '12 × 4', question: 'Are these equal?', answer: 'yes' },
            { item1: '100 - 35', item2: '13 × 5', question: 'Which is bigger?', answer: '100 - 35' },
            { item1: '3³', item2: '25', question: 'Which is bigger?', answer: '3³' },
            { item1: '🌍', item2: '🪐', question: 'Which has rings?', answer: '🪐' },
            { item1: 'land', item2: 'water', question: 'What covers more of Earth?', answer: 'water' }
        ]
    },
    '8': {
        easy: [
            { item1: '67', item2: '89', question: 'Which is bigger?', answer: '89' },
            { item1: '12 × 5', item2: '70', question: 'Which is smaller?', answer: '12 × 5' },
            { item1: '150 ÷ 3', item2: '45', question: 'Which is bigger?', answer: '150 ÷ 3' },
            { item1: '8²', item2: '60', question: 'Which is bigger?', answer: '8²' },
            { item1: '🦅', item2: '✈️', question: 'Which flies higher?', answer: '✈️' },
            { item1: '🌞', item2: '💡', question: 'Which is brighter?', answer: '🌞' }
        ],
        medium: [
            { item1: '15²', item2: '200', question: 'Which is bigger?', answer: '15²' },
            { item1: '12 × 8', item2: '100 - 4', question: 'Are these equal?', answer: 'yes' },
            { item1: '200 ÷ 4', item2: '10 × 5', question: 'Are these equal?', answer: 'yes' },
            { item1: '5³', item2: '100', question: 'Which is bigger?', answer: '5³' },
            { item1: 'speed of sound', item2: 'speed of light', question: 'Which is faster?', answer: 'speed of light' },
            { item1: '🌍', item2: '🪐', question: 'Which is bigger?', answer: '🪐' }
        ],
        hard: [
            { item1: '√144', item2: '10', question: 'Which is bigger?', answer: '√144' },
            { item1: '2⁵', item2: '30', question: 'Which is bigger?', answer: '2⁵' },
            { item1: '15% of 200', item2: '25', question: 'Which is bigger?', answer: '15% of 200' },
            { item1: '¾', item2: '0.7', question: 'Which is bigger?', answer: '¾' },
            { item1: 'proton', item2: 'electron', question: 'Which is heavier?', answer: 'proton' },
            { item1: '🌍', item2: '🌙', question: 'Which has stronger gravity?', answer: '🌍' }
        ]
    },
    '9+': {
        easy: [
            { item1: '156', item2: '189', question: 'Which is bigger?', answer: '189' },
            { item1: '18 × 9', item2: '150', question: 'Which is bigger?', answer: '18 × 9' },
            { item1: '14²', item2: '180', question: 'Which is bigger?', answer: '14²' },
            { item1: '400 ÷ 8', item2: '45', question: 'Which is bigger?', answer: '400 ÷ 8' },
            { item1: '☀️', item2: '🌍', question: 'Which is hotter?', answer: '☀️' },
            { item1: 'diamond', item2: 'glass', question: 'Which is harder?', answer: 'diamond' }
        ],
        medium: [
            { item1: '20²', item2: '350', question: 'Which is bigger?', answer: '20²' },
            { item1: '6³', item2: '200', question: 'Which is bigger?', answer: '6³' },
            { item1: '25% of 400', item2: '90', question: 'Which is bigger?', answer: '25% of 400' },
            { item1: '√225', item2: '14', question: 'Which is bigger?', answer: '√225' },
            { item1: 'Jupiter', item2: 'Earth', question: 'Which is bigger?', answer: 'Jupiter' },
            { item1: '⅔', item2: '0.6', question: 'Which is bigger?', answer: '⅔' }
        ],
        hard: [
            { item1: '2⁸', item2: '250', question: 'Which is bigger?', answer: '2⁸' },
            { item1: '√289', item2: '16', question: 'Which is bigger?', answer: '√289' },
            { item1: '35% of 600', item2: '200', question: 'Which is bigger?', answer: '35% of 600' },
            { item1: 'π', item2: '3.1', question: 'Which is bigger?', answer: 'π' },
            { item1: 'speed of light', item2: 'speed of sound', question: 'Which is faster?', answer: 'speed of light' },
            { item1: 'nucleus', item2: 'atom', question: 'Which is bigger?', answer: 'atom' }
        ]
    },
    '10+': {
        easy: [
            { item1: '567', item2: '589', question: 'Which is bigger?', answer: '589' },
            { item1: '25²', item2: '600', question: 'Which is bigger?', answer: '25²' },
            { item1: '8³', item2: '500', question: 'Which is bigger?', answer: '8³' },
            { item1: '1000 ÷ 25', item2: '38', question: 'Which is bigger?', answer: '1000 ÷ 25' },
            { item1: 'Sun', item2: 'Jupiter', question: 'Which is bigger?', answer: 'Sun' },
            { item1: 'atom', item2: 'molecule', question: 'Which is smaller?', answer: 'atom' }
        ],
        medium: [
            { item1: '30²', item2: '850', question: 'Which is bigger?', answer: '30²' },
            { item1: '10³', item2: '900', question: 'Which is bigger?', answer: '10³' },
            { item1: '√625', item2: '23', question: 'Which is bigger?', answer: '√625' },
            { item1: '45% of 800', item2: '350', question: 'Which is bigger?', answer: '45% of 800' },
            { item1: 'e', item2: '2.7', question: 'Which is bigger?', answer: 'e' },
            { item1: '⅘', item2: '0.75', question: 'Which is bigger?', answer: '⅘' }
        ],
        hard: [
            { item1: '2¹⁰', item2: '1000', question: 'Which is bigger?', answer: '2¹⁰' },
            { item1: '15³', item2: '3000', question: 'Which is bigger?', answer: '15³' },
            { item1: '√1024', item2: '30', question: 'Which is bigger?', answer: '√1024' },
            { item1: '60% of 1500', item2: '850', question: 'Which is bigger?', answer: '60% of 1500' },
            { item1: 'log₁₀(100)', item2: '3', question: 'Which is smaller?', answer: 'log₁₀(100)' },
            { item1: 'photon energy', item2: 'electron mass', question: 'Which can be zero?', answer: 'photon energy' }
        ]
    }
};

/**
 * Age-based LOGIC puzzles with progressive difficulty
 */
const ageBasedLogic = {
    '4-5': {
        easy: [
            { question: 'I have 2 apples. Mom gives me 1 more. How many do I have?', answer: '3' },
            { question: 'There are 4 birds. 2 fly away. How many are left?', answer: '2' },
            { question: 'Count: 1, 2, 3, ___', answer: '4' },
            { question: 'What color is the sky?', answer: 'blue' },
            { question: 'How many legs does a dog have?', answer: '4' },
            { question: 'What comes after 5? (5, 6, ___)', answer: '7' }
        ],
        medium: [
            { question: 'I have 3 cookies. I eat 1. Then I get 2 more. How many do I have?', answer: '4' },
            { question: 'There are 5 apples. I eat 2. How many are left?', answer: '3' },
            { question: 'Count by 2s: 2, 4, ___', answer: '6' },
            { question: 'I am big and yellow. I shine in the day. What am I?', answer: 'sun' },
            { question: 'A cat has 4 legs. Two cats have ___ legs.', answer: '8' },
            { question: 'What shape has 3 sides?', answer: 'triangle' }
        ],
        hard: [
            { question: 'I have 5 toys. I give 2 to my friend. How many do I have?', answer: '3' },
            { question: 'Count by 2s: 2, 4, 6, ___', answer: '8' },
            { question: 'If 🐱 + 🐱 = 2, then 🐱 + 🐱 + 🐱 = ___', answer: '3' },
            { question: 'A triangle has ___ sides.', answer: '3' },
            { question: 'There are 2 dogs. Each has 2 ears. How many ears total?', answer: '4' },
            { question: 'If today is sunny, I wear ___', answer: 'shorts' }
        ]
    },
    '6': {
        easy: [
            { question: 'I have 8 marbles. I lose 3. How many do I have?', answer: '5' },
            { question: '2 + 2 + 2 = ___', answer: '6' },
            { question: 'Count by 5s: 5, 10, ___', answer: '15' },
            { question: 'How many sides does a square have?', answer: '4' },
            { question: 'If I have 3 groups of 2 apples, how many apples total?', answer: '6' },
            { question: 'What day comes after Monday?', answer: 'Tuesday' }
        ],
        medium: [
            { question: 'I have 12 cookies. I eat 5. Then I get 3 more. How many do I have?', answer: '10' },
            { question: 'If 5 + 3 = 8, then 3 + 5 = ___', answer: '8' },
            { question: 'Count by 3s: 3, 6, 9, ___', answer: '12' },
            { question: 'A hexagon has ___ sides.', answer: '6' },
            { question: '4 friends share 12 cookies equally. Each gets ___ cookies.', answer: '3' },
            { question: 'If today is Wednesday, yesterday was ___', answer: 'Tuesday' }
        ],
        hard: [
            { question: 'I have 15 stickers. I give 4 to Tom and 3 to Sara. How many left?', answer: '8' },
            { question: '7 × 3 = ___', answer: '21' },
            { question: 'If 2 × 4 = 8, then 4 × 2 = ___', answer: '8' },
            { question: 'A pentagon has ___ sides.', answer: '5' },
            { question: '18 ÷ 3 = ___', answer: '6' },
            { question: 'Which month comes after July?', answer: 'August' }
        ]
    },
    '7': {
        easy: [
            { question: 'If I buy 3 packs of 5 pencils, how many pencils total?', answer: '15' },
            { question: '25 - 12 = ___', answer: '13' },
            { question: 'How many days are in a week?', answer: '7' },
            { question: 'If 6 × 4 = 24, then 4 × 6 = ___', answer: '24' },
            { question: '35 ÷ 7 = ___', answer: '5' },
            { question: 'A rectangle has ___ corners.', answer: '4' }
        ],
        medium: [
            { question: 'I have 30 candies. I share equally with 5 friends. Each gets ___', answer: '6' },
            { question: 'If a triangle has 3 sides, 5 triangles have ___ sides total.', answer: '15' },
            { question: '48 ÷ 6 = ___', answer: '8' },
            { question: 'Count by 7s: 7, 14, 21, ___', answer: '28' },
            { question: 'If today is the 15th, in 5 days it will be the ___', answer: '20th' },
            { question: '8 × 9 = ___', answer: '72' }
        ],
        hard: [
            { question: 'A store has 45 apples. They sell 18. Then get 30 more. Total?', answer: '57' },
            { question: '(5 + 3) × 4 = ___', answer: '32' },
            { question: 'If 7² = 49, then √49 = ___', answer: '7' },
            { question: '120 ÷ 12 = ___', answer: '10' },
            { question: 'What is the area of a rectangle 6 × 4?', answer: '24' },
            { question: 'If pattern is +3, +6, +9, what comes after 9?', answer: '+12' }
        ]
    },
    '8': {
        easy: [
            { question: 'If 12 × 12 = 144, then √144 = ___', answer: '12' },
            { question: '75 + 48 = ___', answer: '123' },
            { question: '180 ÷ 9 = ___', answer: '20' },
            { question: 'How many hours in a day?', answer: '24' },
            { question: 'If 15% of 100 is 15, then 20% of 100 is ___', answer: '20' },
            { question: 'What is 10²?', answer: '100' }
        ],
        medium: [
            { question: 'A class has 28 students. ¼ are absent. How many present?', answer: '21' },
            { question: '(8 + 4) × (6 - 2) = ___', answer: '48' },
            { question: 'If 8³ = 512, then ∛512 = ___', answer: '8' },
            { question: '225 ÷ 15 = ___', answer: '15' },
            { question: 'What is the perimeter of a square with side 9?', answer: '36' },
            { question: 'If I save $15 per week for 8 weeks, I have $___', answer: '120' }
        ],
        hard: [
            { question: 'A rectangle is 12 cm by 8 cm. What is its area?', answer: '96' },
            { question: '30% of 250 = ___', answer: '75' },
            { question: 'If 2⁵ = 32, then 2⁶ = ___', answer: '64' },
            { question: '(15 × 8) - (12 × 5) = ___', answer: '60' },
            { question: 'A triangle with sides 3-4-5 is a ___ triangle', answer: 'right' },
            { question: 'If x + 15 = 30, then x = ___', answer: '15' }
        ]
    },
    '9+': {
        easy: [
            { question: 'If 20² = 400, then √400 = ___', answer: '20' },
            { question: '168 + 247 = ___', answer: '415' },
            { question: '450 ÷ 18 = ___', answer: '25' },
            { question: 'How many minutes in 3 hours?', answer: '180' },
            { question: 'What is 15²?', answer: '225' },
            { question: '40% of 200 = ___', answer: '80' }
        ],
        medium: [
            { question: 'A circle has radius 7. What is its diameter?', answer: '14' },
            { question: 'If x - 25 = 100, then x = ___', answer: '125' },
            { question: '(12 + 8)² = ___', answer: '400' },
            { question: 'What is 2¹⁰?', answer: '1024' },
            { question: 'If 3x = 45, then x = ___', answer: '15' },
            { question: 'A triangle has angles 60°, 60°, ___°', answer: '60' }
        ],
        hard: [
            { question: 'A rectangle is 15 × 20. What\'s the area?', answer: '300' },
            { question: 'If y² = 144, then y = ___ (positive)', answer: '12' },
            { question: '65% of 400 = ___', answer: '260' },
            { question: 'The prime factors of 24 are 2, 2, 2, and ___', answer: '3' },
            { question: 'If 5x - 10 = 40, then x = ___', answer: '10' },
            { question: 'What is the LCM of 12 and 18?', answer: '36' }
        ]
    },
    '10+': {
        easy: [
            { question: 'If 25² = 625, then √625 = ___', answer: '25' },
            { question: '789 + 456 = ___', answer: '1245' },
            { question: '720 ÷ 24 = ___', answer: '30' },
            { question: 'What is 20²?', answer: '400' },
            { question: '75% of 800 = ___', answer: '600' },
            { question: 'If 2¹² = 4096, then 2¹³ = ___', answer: '8192' }
        ],
        medium: [
            { question: 'A circle has diameter 20. What is its radius?', answer: '10' },
            { question: 'If 4x + 8 = 32, then x = ___', answer: '6' },
            { question: 'What is (15 + 5)³?', answer: '8000' },
            { question: 'The GCD of 48 and 72 is ___', answer: '24' },
            { question: 'If y/5 = 30, then y = ___', answer: '150' },
            { question: 'A right triangle has legs 5 and 12. Hypotenuse = ___', answer: '13' }
        ],
        hard: [
            { question: 'Solve: 3x - 7 = 2x + 8. x = ___', answer: '15' },
            { question: 'If x² - 25 = 0, then x = ___ (positive)', answer: '5' },
            { question: 'The area of circle with radius 10 is ___π', answer: '100' },
            { question: 'What is log₂(64)?', answer: '6' },
            { question: 'If 2ˣ = 128, then x = ___', answer: '7' },
            { question: 'Factor: x² + 5x + 6 = (x + 2)(x + ___)', answer: '3' }
        ]
    }
};

console.log('Level-based aptitude content loaded - 12 levels available');
