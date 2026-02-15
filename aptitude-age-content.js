// Age-Differentiated Aptitude Content
// Comprehensive puzzle generation with age-appropriate complexity

/**
 * Age-based pattern puzzles with progressive difficulty
 * Each age group has easy, medium, hard - appropriate for that age
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
            { pattern: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Pattern alternates: red, blue, red, blue...' },
            { pattern: ['1️⃣', '2️⃣', '1️⃣', '2️⃣'], answer: '1️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Numbers alternate: 1, 2, 1, 2...' },
            { pattern: ['A', 'B', 'A', 'B'], answer: 'A', options: ['A', 'B', 'C', 'D'], reason: 'Letters alternate: A, B, A, B...' },
            { pattern: ['⭐', '🌙', '⭐', '🌙'], answer: '⭐', options: ['⭐', '🌙', '☀️', '💫'], reason: 'Star and moon alternate' },
            { pattern: ['🔺', '⭕', '🔺', '⭕'], answer: '🔺', options: ['🔺', '⭕', '⬜', '🔶'], reason: 'Triangle and circle alternate' }
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
            { pattern: ['2️⃣', '4️⃣', '6️⃣', '2️⃣', '4️⃣'], answer: '6️⃣', options: ['2️⃣', '4️⃣', '6️⃣', '8️⃣'], reason: 'Even numbers 2-4-6 repeat' },
            { pattern: ['A', 'B', 'C', 'D', 'A'], answer: 'B', options: ['A', 'B', 'C', 'D'], reason: 'Four-letter sequence cycles' }
        ],
        medium: [
            { pattern: ['🔴', '🔵', '🔵', '🟢', '🟢', '🟢'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Growing: 1 red, 2 blues, 3 greens, cycle restarts' },
            { pattern: ['1️⃣', '2️⃣', '4️⃣', '1️⃣', '2️⃣'], answer: '4️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Powers of 2: 1, 2, 4, 1, 2, 4' },
            { pattern: ['A', 'B', 'A', 'C', 'A', 'D'], answer: 'A', options: ['A', 'B', 'C', 'D'], reason: 'A appears every other, others advance' }
        ],
        hard: [
            { pattern: ['1️⃣', '4️⃣', '9️⃣', '1️⃣', '6️⃣'], answer: '2️⃣', options: ['2️⃣', '3️⃣', '4️⃣', '5️⃣'], reason: 'Square numbers: 1, 4, 9, 16, 25' },
            { pattern: ['2️⃣', '3️⃣', '5️⃣', '7️⃣', '1️⃣'], answer: '1️⃣', options: ['9️⃣', '1️⃣', '3️⃣', '5️⃣'], reason: 'Prime numbers: 2, 3, 5, 7, 11, 13' },
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
            { pattern: ['2️⃣', '3️⃣', '5️⃣', '7️⃣', '1️⃣'], answer: '1️⃣', options: ['9️⃣', '1️⃣', '3️⃣', '5️⃣'], reason: 'Prime numbers sequence: 2, 3, 5, 7, 11, 13, 17' },
            { pattern: ['1️⃣', '8️⃣', '2️⃣', '7️⃣', '1️⃣'], answer: '2️⃣', options: ['1️⃣', '2️⃣', '6️⃣', '8️⃣'], reason: 'Powers of 2: 1, 8, 27, 64, 125 (cubes)' },
            { pattern: ['A', 'Z', 'B', 'Y', 'C'], answer: 'X', options: ['W', 'X', 'Y', 'Z'], reason: 'Alternating from start and end of alphabet' }
        ]
    },
    '10+': {
        easy: [
            { pattern: ['1️⃣', '2️⃣', '4️⃣', '8️⃣', '1️⃣'], answer: '6️⃣', options: ['1️⃣', '3️⃣', '6️⃣', '2️⃣'], reason: 'Powers of 2: 1, 2, 4, 8, 16, 32' },
            { pattern: ['2️⃣', '3️⃣', '5️⃣', '7️⃣', '1️⃣'], answer: '1️⃣', options: ['9️⃣', '1️⃣', '3️⃣', '5️⃣'], reason: 'Prime numbers: 2, 3, 5, 7, 11, 13' },
            { pattern: ['A', 'D', 'G', 'J', 'M'], answer: 'P', options: ['N', 'O', 'P', 'Q'], reason: 'Skip 2 letters each time: A-D-G-J-M-P' }
        ],
        medium: [
            { pattern: ['1️⃣', '1️⃣', '2️⃣', '3️⃣', '5️⃣', '8️⃣'], answer: '1️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Fibonacci sequence: 1,1,2,3,5,8,13,21' },
            { pattern: ['3️⃣', '6️⃣', '1️⃣', '2️⃣', '2️⃣', '4️⃣'], answer: '4️⃣', options: ['3️⃣', '4️⃣', '5️⃣', '8️⃣'], reason: 'Triangular numbers: 3,6,10,15,21,28,36,45' },
            { pattern: ['A', 'B', 'D', 'E', 'G', 'H'], answer: 'J', options: ['I', 'J', 'K', 'L'], reason: 'Consonants only: skip vowels in alphabet' }
        ],
        hard: [
            { pattern: ['1️⃣', '4️⃣', '2️⃣', '7️⃣', '8️⃣', '2️⃣'], answer: '8️⃣', options: ['2️⃣', '3️⃣', '4️⃣', '9️⃣'], reason: 'Binary sequence: 1,4,27,256,3125 (n^n)' },
            { pattern: ['2️⃣', '6️⃣', '1️⃣', '2️⃣', '3️⃣', '0️⃣'], answer: '4️⃣', options: ['4️⃣', '2️⃣', '6️⃣', '8️⃣'], reason: 'Factorial sequence: 2,6,12,30,42,56' },
            { pattern: ['A', 'E', 'I', 'O', 'U'], answer: 'Y', options: ['V', 'W', 'X', 'Y'], reason: 'Vowels in alphabetical order, Y is sometimes vowel' }
        ]
    }
};

// Age-based counting puzzles with appropriate number ranges
const ageBasedCounting = {
    '4-5': {
        range: { min: 1, max: 10 },
        items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋']
    },
    '6': {
        range: { min: 5, max: 20 },
        items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽', '🎵', '🌈']
    },
    '7': {
        range: { min: 10, max: 50 },
        items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽', '🎵', '🌈', '🎯', '🎭', '🎪', '🎬', '🎤']
    },
    '8': {
        range: { min: 20, max: 100 },
        items: ['🍎', '⭐', '🐶', '🌸', '🚗', '🏠', '🎈', '🍪', '🐱', '🦋', '🎨', '📚', '⚽', '🎵', '🌈', '🎯', '🎭', '🎪', '🎬', '🎤', '🎲', '🎰', '🎳', '🎮', '🎹']
    },
    '9+': {
        range: { min: 50, max: 200 },
        items: ['🔢', '💯', '📊', '📈', '💰', '🏆', '🎯', '🌟', '✨', '💎', '🔷', '🔶', '🔹', '🔸', '💠']
    },
    '10+': {
        range: { min: 100, max: 1000 },
        items: ['🔢', '💯', '📊', '📈', '💰', '🏆', '🎯', '🌟', '✨', '💎', '🔷', '🔶', '🔹', '🔸', '💠', '🎲', '🧮', '📐', '📏', '🔬']
    }
};

console.log('Age-based aptitude content loaded');
