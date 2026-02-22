// Age-Based Content Mapper
// Maps content difficulty across age groups for consistent user experience

/**
 * Maps age and user-selected difficulty to actual content difficulty
 *
 * User Selection Flow:
 * - Easy = Previous age Hard
 * - Medium = Current age (all difficulties combined)
 * - Hard = Next age Hard
 *
 * Edge cases:
 * - Age 4-5 Easy = Simplified beginner content
 * - Age 10+ Hard = Advanced challenge content
 */

const ageGroupMap = {
    // Numeric ages → age groups
    '4': '4-5',
    '5': '4-5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9+',
    '10': '10+',
    '11': '10+',
    '12': '10+',
    '13': '10+',
    '14': '10+',
    '15': '10+',
    '16': '10+',
    // Identity mappings: age group strings map to themselves
    // (needed when admin-level-manager sets currentAge to an age group string)
    '4-5': '4-5',
    '9+': '9+',
    '10+': '10+',
};

const agePrevNext = {
    '4-5': { prev: null, next: '6' },
    '6': { prev: '4-5', next: '7' },
    '7': { prev: '6', next: '8' },
    '8': { prev: '7', next: '9+' },
    '9+': { prev: '8', next: '10+' },
    '10+': { prev: '9+', next: null }
};

/**
 * Get actual content configuration based on child's age and selected difficulty
 * @param {number|string} childAge - Child's age (e.g., 6, 7, 8)
 * @param {string} selectedDifficulty - User selected difficulty: 'easy', 'medium', 'hard'
 * @returns {Array} Array of {ageGroup, difficulty} objects to load content from
 */
function getContentMapping(childAge, selectedDifficulty) {
    // Convert child age to age group
    const ageGroup = ageGroupMap[childAge.toString()] || '6';

    const result = [];

    switch(selectedDifficulty) {
        case 'easy':
            // Easy = Previous age Hard
            const prevAge = agePrevNext[ageGroup]?.prev;
            if (prevAge) {
                result.push({ ageGroup: prevAge, difficulty: 'hard' });
            } else {
                // Age 4-5: No previous age, use own easy (simplified)
                result.push({ ageGroup: ageGroup, difficulty: 'easy' });
            }
            break;

        case 'medium':
            // Medium = Current age (all three difficulties)
            result.push({ ageGroup: ageGroup, difficulty: 'easy' });
            result.push({ ageGroup: ageGroup, difficulty: 'medium' });
            result.push({ ageGroup: ageGroup, difficulty: 'hard' });
            break;

        case 'hard':
            // Hard = Next age Hard
            const nextAge = agePrevNext[ageGroup]?.next;
            if (nextAge) {
                result.push({ ageGroup: nextAge, difficulty: 'hard' });
            } else {
                // Age 10+: No next age, use own hard (advanced)
                result.push({ ageGroup: ageGroup, difficulty: 'hard' });
            }
            break;
    }

    return result;
}

/**
 * Get age-appropriate number range for counting/math puzzles
 */
function getNumberRange(ageGroup) {
    const ranges = {
        '4-5': { min: 1, max: 10 },
        '6': { min: 1, max: 20 },
        '7': { min: 1, max: 50 },
        '8': { min: 1, max: 100 },
        '9+': { min: 1, max: 200 },
        '10+': { min: 1, max: 1000 }
    };
    return ranges[ageGroup] || ranges['6'];
}

/**
 * Get age-appropriate vocabulary complexity level
 */
function getVocabularyLevel(ageGroup) {
    const levels = {
        '4-5': 'basic',      // Simple words, 1-2 syllables
        '6': 'elementary',    // Common words, 2-3 syllables
        '7': 'intermediate',  // Descriptive words, some complex
        '8': 'advanced',      // Abstract concepts, complex vocabulary
        '9+': 'proficient',   // Advanced concepts, sophisticated language
        '10+': 'expert'       // Academic vocabulary, nuanced concepts
    };
    return levels[ageGroup] || 'elementary';
}

/**
 * Filter content items by age appropriateness
 */
function filterByAge(items, ageGroup, contentType) {
    // Age appropriateness filters
    const filters = {
        '4-5': (item) => {
            // Only basic emojis, simple concepts
            if (contentType === 'emoji') {
                const basicEmojis = ['🔴','🔵','🟢','🟡','🔺','⭕','⬜','🌞','🌙','⭐',
                                     '🍎','🍊','😊','😢','🐶','🐱','🐭','🚗','🏠','🌳'];
                return basicEmojis.some(e => JSON.stringify(item).includes(e));
            }
            return true;
        },
        '6': (item) => {
            // Add numbers 1-20, basic letters
            return true; // Most content appropriate
        },
        '7': (item) => {
            // Add more complex shapes, patterns
            return true;
        },
        '8': (item) => {
            // Add letters, words, abstract concepts
            return true;
        },
        '9+': (item) => {
            // All content appropriate
            return true;
        },
        '10+': (item) => {
            // All content including advanced
            return true;
        }
    };

    const filter = filters[ageGroup] || filters['6'];
    return items.filter(filter);
}

/**
 * Adjust instruction language complexity for age
 */
function getAgeAppropriateInstruction(instruction, ageGroup) {
    const simplifications = {
        '4-5': {
            'identify': 'find',
            'complete': 'finish',
            'sequence': 'order',
            'determine': 'find',
            'select': 'choose',
            'analyze': 'look at'
        },
        '6': {
            'determine': 'find out',
            'analyze': 'look carefully at'
        }
    };

    let result = instruction;
    const ageSimplifications = simplifications[ageGroup];

    if (ageSimplifications) {
        Object.keys(ageSimplifications).forEach(complex => {
            const simple = ageSimplifications[complex];
            const regex = new RegExp(`\\b${complex}\\b`, 'gi');
            result = result.replace(regex, simple);
        });
    }

    return result;
}

// Node.js module.exports removed - browser-only code
console.log('Age content mapper loaded');
