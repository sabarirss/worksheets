/**
 * Synthetic Student Archetypes for Adaptive Engine Bootstrapping
 *
 * 60+ student archetypes based on common learning patterns in ages 4-10+.
 * Used for:
 *   1. Bootstrapping new users (match assessment to closest archetype)
 *   2. Validating the adaptive engine (simulate weeks of submissions)
 *   3. Testing the 60/30/10 distribution produces real improvement
 *
 * Each archetype defines skill error rates per operation.
 * Error rates: 0.0 = perfect, 1.0 = always wrong.
 * Skill tags match classifyProblem() output from math-engine.js.
 */

// ============================================================================
// ADDITION ARCHETYPES (ages 4-7 typically)
// ============================================================================

const ADDITION_ARCHETYPES = [
    {
        id: 'add-beginner',
        description: 'Just starting addition, struggles with everything',
        ageGroup: '4-5',
        skills: {
            'add-single': { errorRate: 0.25 },
            'add-2digit': { errorRate: 0.60 },
            'add-no-carry': { errorRate: 0.20 },
            'add-carry-once': { errorRate: 0.70 },
        }
    },
    {
        id: 'add-carry-struggler',
        description: 'Can add without carrying but fails with carries',
        ageGroup: '6',
        skills: {
            'add-single': { errorRate: 0.05 },
            'add-2digit': { errorRate: 0.15 },
            'add-3digit': { errorRate: 0.40 },
            'add-no-carry': { errorRate: 0.05 },
            'add-carry-once': { errorRate: 0.50 },
            'add-carry-multi': { errorRate: 0.70 },
        }
    },
    {
        id: 'add-single-carry',
        description: 'Handles single carry but fails on multiple carries',
        ageGroup: '6',
        skills: {
            'add-single': { errorRate: 0.02 },
            'add-2digit': { errorRate: 0.08 },
            'add-3digit': { errorRate: 0.25 },
            'add-no-carry': { errorRate: 0.03 },
            'add-carry-once': { errorRate: 0.15 },
            'add-carry-multi': { errorRate: 0.55 },
        }
    },
    {
        id: 'add-large-numbers',
        description: 'Good with small numbers but loses track with 3-4 digit',
        ageGroup: '7',
        skills: {
            'add-single': { errorRate: 0.02 },
            'add-2digit': { errorRate: 0.05 },
            'add-3digit': { errorRate: 0.35 },
            'add-4digit': { errorRate: 0.55 },
            'add-no-carry': { errorRate: 0.03 },
            'add-carry-once': { errorRate: 0.10 },
            'add-carry-multi': { errorRate: 0.40 },
        }
    },
    {
        id: 'add-near-mastery',
        description: 'Strong addition across the board, occasional slips',
        ageGroup: '7',
        skills: {
            'add-single': { errorRate: 0.01 },
            'add-2digit': { errorRate: 0.03 },
            'add-3digit': { errorRate: 0.06 },
            'add-4digit': { errorRate: 0.10 },
            'add-no-carry': { errorRate: 0.02 },
            'add-carry-once': { errorRate: 0.05 },
            'add-carry-multi': { errorRate: 0.08 },
        }
    },
    {
        id: 'add-random-errors',
        description: 'Makes random mistakes regardless of difficulty',
        ageGroup: '6',
        skills: {
            'add-single': { errorRate: 0.15 },
            'add-2digit': { errorRate: 0.20 },
            'add-3digit': { errorRate: 0.22 },
            'add-no-carry': { errorRate: 0.18 },
            'add-carry-once': { errorRate: 0.20 },
            'add-carry-multi': { errorRate: 0.25 },
        }
    },
    {
        id: 'add-speed-errors',
        description: 'Knows the concepts but rushes, more errors on easy problems',
        ageGroup: '7',
        skills: {
            'add-single': { errorRate: 0.12 },
            'add-2digit': { errorRate: 0.10 },
            'add-3digit': { errorRate: 0.15 },
            'add-no-carry': { errorRate: 0.08 },
            'add-carry-once': { errorRate: 0.12 },
            'add-carry-multi': { errorRate: 0.18 },
        }
    },
];

// ============================================================================
// SUBTRACTION ARCHETYPES (ages 6-8 typically)
// ============================================================================

const SUBTRACTION_ARCHETYPES = [
    {
        id: 'sub-beginner',
        description: 'Just learning subtraction, weak on borrowing',
        ageGroup: '6',
        skills: {
            'sub-single': { errorRate: 0.15 },
            'sub-2digit': { errorRate: 0.40 },
            'sub-no-borrow': { errorRate: 0.10 },
            'sub-borrow-once': { errorRate: 0.60 },
            'sub-borrow-zero': { errorRate: 0.80 },
        }
    },
    {
        id: 'sub-borrow-struggler',
        description: 'Cannot borrow, reverses digits instead (42-17=35)',
        ageGroup: '7',
        skills: {
            'sub-single': { errorRate: 0.05 },
            'sub-2digit': { errorRate: 0.15 },
            'sub-3digit': { errorRate: 0.35 },
            'sub-no-borrow': { errorRate: 0.05 },
            'sub-borrow-once': { errorRate: 0.55 },
            'sub-borrow-multi': { errorRate: 0.65 },
            'sub-borrow-zero': { errorRate: 0.75 },
        }
    },
    {
        id: 'sub-zero-borrow',
        description: 'Borrows fine normally but fails borrowing from 0 (300-156)',
        ageGroup: '7',
        skills: {
            'sub-single': { errorRate: 0.03 },
            'sub-2digit': { errorRate: 0.06 },
            'sub-3digit': { errorRate: 0.15 },
            'sub-no-borrow': { errorRate: 0.03 },
            'sub-borrow-once': { errorRate: 0.10 },
            'sub-borrow-multi': { errorRate: 0.20 },
            'sub-borrow-zero': { errorRate: 0.60 },
        }
    },
    {
        id: 'sub-large-numbers',
        description: 'Good with 2-digit, loses accuracy with 3-4 digit',
        ageGroup: '8',
        skills: {
            'sub-single': { errorRate: 0.02 },
            'sub-2digit': { errorRate: 0.05 },
            'sub-3digit': { errorRate: 0.30 },
            'sub-4digit': { errorRate: 0.50 },
            'sub-no-borrow': { errorRate: 0.03 },
            'sub-borrow-once': { errorRate: 0.08 },
            'sub-borrow-multi': { errorRate: 0.35 },
            'sub-borrow-zero': { errorRate: 0.45 },
        }
    },
    {
        id: 'sub-near-mastery',
        description: 'Strong subtraction, occasional borrow slip',
        ageGroup: '8',
        skills: {
            'sub-single': { errorRate: 0.01 },
            'sub-2digit': { errorRate: 0.03 },
            'sub-3digit': { errorRate: 0.05 },
            'sub-4digit': { errorRate: 0.08 },
            'sub-no-borrow': { errorRate: 0.02 },
            'sub-borrow-once': { errorRate: 0.04 },
            'sub-borrow-multi': { errorRate: 0.07 },
            'sub-borrow-zero': { errorRate: 0.10 },
        }
    },
    {
        id: 'sub-mixed-weakness',
        description: 'Inconsistent, some days good some days bad',
        ageGroup: '7',
        skills: {
            'sub-single': { errorRate: 0.10 },
            'sub-2digit': { errorRate: 0.20 },
            'sub-3digit': { errorRate: 0.30 },
            'sub-no-borrow': { errorRate: 0.08 },
            'sub-borrow-once': { errorRate: 0.35 },
            'sub-borrow-multi': { errorRate: 0.40 },
            'sub-borrow-zero': { errorRate: 0.50 },
        }
    },
    {
        id: 'sub-reverser',
        description: 'Subtracts smaller digit from larger regardless of position',
        ageGroup: '6',
        skills: {
            'sub-single': { errorRate: 0.08 },
            'sub-2digit': { errorRate: 0.25 },
            'sub-no-borrow': { errorRate: 0.05 },
            'sub-borrow-once': { errorRate: 0.65 },
            'sub-borrow-zero': { errorRate: 0.70 },
        }
    },
];

// ============================================================================
// MULTIPLICATION ARCHETYPES (ages 7-9 typically)
// ============================================================================

const MULTIPLICATION_ARCHETYPES = [
    {
        id: 'mul-tables-beginner',
        description: 'Learning tables, strong on 2-5 but weak on 6-9',
        ageGroup: '7',
        skills: {
            'mul-tables-2-5': { errorRate: 0.10 },
            'mul-tables-6-9': { errorRate: 0.50 },
            'mul-2digit-by-1digit': { errorRate: 0.55 },
        }
    },
    {
        id: 'mul-tables-gap-67',
        description: 'Specifically weak on 6 and 7 times tables',
        ageGroup: '8',
        skills: {
            'mul-tables-2-5': { errorRate: 0.05 },
            'mul-tables-6-9': { errorRate: 0.40 },
            'mul-2digit-by-1digit': { errorRate: 0.30 },
            'mul-multi-digit': { errorRate: 0.45 },
        }
    },
    {
        id: 'mul-tables-gap-89',
        description: 'Weak on 8 and 9 times tables specifically',
        ageGroup: '8',
        skills: {
            'mul-tables-2-5': { errorRate: 0.03 },
            'mul-tables-6-9': { errorRate: 0.35 },
            'mul-2digit-by-1digit': { errorRate: 0.25 },
            'mul-multi-digit': { errorRate: 0.40 },
        }
    },
    {
        id: 'mul-multi-digit-weak',
        description: 'Tables memorized but multi-digit multiplication fails',
        ageGroup: '8',
        skills: {
            'mul-tables-2-5': { errorRate: 0.04 },
            'mul-tables-6-9': { errorRate: 0.08 },
            'mul-2digit-by-1digit': { errorRate: 0.35 },
            'mul-multi-digit': { errorRate: 0.60 },
        }
    },
    {
        id: 'mul-near-mastery',
        description: 'Strong multiplication, rare mistakes',
        ageGroup: '9+',
        skills: {
            'mul-tables-2-5': { errorRate: 0.02 },
            'mul-tables-6-9': { errorRate: 0.06 },
            'mul-2digit-by-1digit': { errorRate: 0.05 },
            'mul-multi-digit': { errorRate: 0.10 },
        }
    },
    {
        id: 'mul-all-weak',
        description: 'Has not memorized tables, guesses frequently',
        ageGroup: '7',
        skills: {
            'mul-tables-2-5': { errorRate: 0.30 },
            'mul-tables-6-9': { errorRate: 0.60 },
            'mul-2digit-by-1digit': { errorRate: 0.65 },
        }
    },
    {
        id: 'mul-tables-only',
        description: 'Knows tables but cannot apply to larger problems',
        ageGroup: '8',
        skills: {
            'mul-tables-2-5': { errorRate: 0.05 },
            'mul-tables-6-9': { errorRate: 0.12 },
            'mul-2digit-by-1digit': { errorRate: 0.45 },
            'mul-multi-digit': { errorRate: 0.55 },
        }
    },
    {
        id: 'mul-confused-with-add',
        description: 'Adds instead of multiplying sometimes',
        ageGroup: '7',
        skills: {
            'mul-tables-2-5': { errorRate: 0.20 },
            'mul-tables-6-9': { errorRate: 0.45 },
            'mul-2digit-by-1digit': { errorRate: 0.50 },
        }
    },
];

// ============================================================================
// DIVISION ARCHETYPES (ages 8-10+ typically)
// ============================================================================

const DIVISION_ARCHETYPES = [
    {
        id: 'div-beginner',
        description: 'Just learning division, weak on everything',
        ageGroup: '8',
        skills: {
            'div-basic': { errorRate: 0.25 },
            'div-exact': { errorRate: 0.30 },
            'div-2digit': { errorRate: 0.50 },
            'div-remainder': { errorRate: 0.65 },
            'div-by-small': { errorRate: 0.20 },
            'div-by-large': { errorRate: 0.55 },
        }
    },
    {
        id: 'div-remainder-struggler',
        description: 'Can do exact division but fails with remainders',
        ageGroup: '8',
        skills: {
            'div-basic': { errorRate: 0.08 },
            'div-exact': { errorRate: 0.10 },
            'div-2digit': { errorRate: 0.20 },
            'div-remainder': { errorRate: 0.55 },
            'div-by-small': { errorRate: 0.08 },
            'div-by-large': { errorRate: 0.30 },
        }
    },
    {
        id: 'div-large-divisor',
        description: 'Good with small divisors, fails with 6-9',
        ageGroup: '9+',
        skills: {
            'div-basic': { errorRate: 0.05 },
            'div-exact': { errorRate: 0.08 },
            'div-2digit': { errorRate: 0.25 },
            'div-long': { errorRate: 0.40 },
            'div-remainder': { errorRate: 0.20 },
            'div-by-small': { errorRate: 0.05 },
            'div-by-large': { errorRate: 0.45 },
        }
    },
    {
        id: 'div-long-division',
        description: 'Struggles with long division (100+ dividends)',
        ageGroup: '9+',
        skills: {
            'div-basic': { errorRate: 0.03 },
            'div-exact': { errorRate: 0.05 },
            'div-2digit': { errorRate: 0.12 },
            'div-long': { errorRate: 0.50 },
            'div-remainder': { errorRate: 0.15 },
            'div-by-small': { errorRate: 0.04 },
            'div-by-large': { errorRate: 0.25 },
            'div-by-2digit': { errorRate: 0.60 },
        }
    },
    {
        id: 'div-near-mastery',
        description: 'Strong division, occasional slip on long division',
        ageGroup: '9+',
        skills: {
            'div-basic': { errorRate: 0.02 },
            'div-exact': { errorRate: 0.03 },
            'div-2digit': { errorRate: 0.05 },
            'div-long': { errorRate: 0.12 },
            'div-remainder': { errorRate: 0.06 },
            'div-by-small': { errorRate: 0.02 },
            'div-by-large': { errorRate: 0.08 },
        }
    },
    {
        id: 'div-tables-gap',
        description: 'Weak division because multiplication tables are weak',
        ageGroup: '8',
        skills: {
            'div-basic': { errorRate: 0.15 },
            'div-exact': { errorRate: 0.20 },
            'div-2digit': { errorRate: 0.35 },
            'div-remainder': { errorRate: 0.45 },
            'div-by-small': { errorRate: 0.12 },
            'div-by-large': { errorRate: 0.50 },
        }
    },
    {
        id: 'div-quotient-confusion',
        description: 'Gets quotient and remainder mixed up',
        ageGroup: '8',
        skills: {
            'div-basic': { errorRate: 0.10 },
            'div-exact': { errorRate: 0.12 },
            'div-2digit': { errorRate: 0.30 },
            'div-remainder': { errorRate: 0.60 },
            'div-by-small': { errorRate: 0.08 },
            'div-by-large': { errorRate: 0.40 },
        }
    },
];

// ============================================================================
// CROSS-OPERATION ARCHETYPES (mixed profile across operations)
// ============================================================================

const CROSS_OPERATION_ARCHETYPES = [
    {
        id: 'cross-add-sub-gap',
        description: 'Strong addition but weak subtraction (common pattern)',
        operations: {
            addition: {
                'add-single': { errorRate: 0.03 },
                'add-2digit': { errorRate: 0.05 },
                'add-no-carry': { errorRate: 0.03 },
                'add-carry-once': { errorRate: 0.08 },
            },
            subtraction: {
                'sub-single': { errorRate: 0.10 },
                'sub-2digit': { errorRate: 0.30 },
                'sub-no-borrow': { errorRate: 0.08 },
                'sub-borrow-once': { errorRate: 0.45 },
                'sub-borrow-zero': { errorRate: 0.60 },
            }
        },
        ageGroup: '7'
    },
    {
        id: 'cross-tables-division-linked',
        description: 'Weak multiplication tables causes weak division too',
        operations: {
            multiplication: {
                'mul-tables-2-5': { errorRate: 0.08 },
                'mul-tables-6-9': { errorRate: 0.40 },
                'mul-2digit-by-1digit': { errorRate: 0.35 },
            },
            division: {
                'div-basic': { errorRate: 0.15 },
                'div-exact': { errorRate: 0.20 },
                'div-remainder': { errorRate: 0.50 },
                'div-by-small': { errorRate: 0.12 },
                'div-by-large': { errorRate: 0.45 },
            }
        },
        ageGroup: '8'
    },
    {
        id: 'cross-all-medium',
        description: 'Average performance across all operations',
        operations: {
            addition: {
                'add-2digit': { errorRate: 0.15 },
                'add-carry-once': { errorRate: 0.25 },
            },
            subtraction: {
                'sub-2digit': { errorRate: 0.20 },
                'sub-borrow-once': { errorRate: 0.30 },
            },
            multiplication: {
                'mul-tables-2-5': { errorRate: 0.12 },
                'mul-tables-6-9': { errorRate: 0.28 },
            },
            division: {
                'div-exact': { errorRate: 0.18 },
                'div-remainder': { errorRate: 0.35 },
            }
        },
        ageGroup: '8'
    },
    {
        id: 'cross-gifted',
        description: 'Advanced student, strong across everything',
        operations: {
            addition: {
                'add-3digit': { errorRate: 0.03 },
                'add-carry-multi': { errorRate: 0.05 },
            },
            subtraction: {
                'sub-3digit': { errorRate: 0.04 },
                'sub-borrow-multi': { errorRate: 0.06 },
            },
            multiplication: {
                'mul-tables-6-9': { errorRate: 0.04 },
                'mul-multi-digit': { errorRate: 0.08 },
            },
            division: {
                'div-long': { errorRate: 0.07 },
                'div-remainder': { errorRate: 0.05 },
            }
        },
        ageGroup: '9+'
    },
];

// ============================================================================
// PLAUSIBLE ERROR GENERATORS
// Produce realistic wrong answers kids actually make
// ============================================================================

/**
 * Generate a plausible wrong answer for a math problem.
 * Mimics real error patterns kids make (carry errors, borrow errors, table confusion).
 *
 * @param {string} operation - 'addition'|'subtraction'|'multiplication'|'division'
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @param {*} correctAnswer - Correct answer
 * @param {string[]} skills - Skill tags for this problem
 * @returns {*} A plausible wrong answer
 */
function generatePlausibleError(operation, a, b, correctAnswer, skills) {
    const strategies = []; // Each: { value, pattern }

    if (operation === 'addition') {
        // Forgot to carry: add digits without carrying
        if (skills.some(s => s.includes('carry'))) {
            const noCarry = addWithoutCarry(a, b);
            if (noCarry !== correctAnswer && noCarry > 0) {
                strategies.push({ value: noCarry, pattern: 'err-carry-forgot' });
            }
        }
        // Off-by-one
        strategies.push({ value: correctAnswer + 1, pattern: 'err-off-by-one' });
        strategies.push({ value: correctAnswer - 1, pattern: 'err-off-by-one' });
        // Wrong digit in ones/tens place
        if (correctAnswer >= 10) {
            strategies.push({ value: correctAnswer - 10, pattern: 'err-off-by-ten' });
            strategies.push({ value: correctAnswer + 10, pattern: 'err-off-by-ten' });
        }
        // Used subtraction instead
        if (Math.abs(a - b) !== correctAnswer) {
            strategies.push({ value: Math.abs(a - b), pattern: 'err-op-used-subtraction' });
        }
        // Doubled one operand
        if (a * 2 !== correctAnswer) strategies.push({ value: a * 2, pattern: 'err-doubled-operand' });
        // Digit reversal for 2-digit answers
        if (correctAnswer >= 10 && correctAnswer < 100) {
            const reversed = parseInt(String(correctAnswer).split('').reverse().join(''));
            if (reversed !== correctAnswer) strategies.push({ value: reversed, pattern: 'err-digit-reversal' });
        }
    }

    if (operation === 'subtraction') {
        // Reversed subtraction: smaller from larger in each column
        if (skills.some(s => s.includes('borrow'))) {
            const reversed = subtractReversed(a, b);
            if (reversed !== correctAnswer && reversed > 0) {
                strategies.push({ value: reversed, pattern: 'err-borrow-reversed' });
            }
        }
        // Off-by-one from borrow error
        strategies.push({ value: correctAnswer + 1, pattern: 'err-off-by-one' });
        strategies.push({ value: correctAnswer - 1, pattern: 'err-off-by-one' });
        // Forgot to reduce after borrowing
        if (correctAnswer >= 10) {
            strategies.push({ value: correctAnswer + 10, pattern: 'err-borrow-forgot' });
            strategies.push({ value: correctAnswer - 10, pattern: 'err-off-by-ten' });
        }
        // Used addition instead
        if (a + b !== correctAnswer) {
            strategies.push({ value: a + b, pattern: 'err-op-used-addition' });
        }
    }

    if (operation === 'multiplication') {
        // Adjacent table entry
        strategies.push({ value: a * b + a, pattern: 'err-adjacent-table-a' });
        strategies.push({ value: a * b - a, pattern: 'err-adjacent-table-a' });
        strategies.push({ value: a * b + b, pattern: 'err-adjacent-table-b' });
        strategies.push({ value: a * b - b, pattern: 'err-adjacent-table-b' });
        // Added instead of multiplied
        if (a + b !== correctAnswer) {
            strategies.push({ value: a + b, pattern: 'err-op-used-addition' });
        }
        // Off by one table entry
        if (a > 1) strategies.push({ value: (a - 1) * b, pattern: 'err-adjacent-table-a' });
        if (b > 1) strategies.push({ value: a * (b - 1), pattern: 'err-adjacent-table-b' });
        // Concatenated operands (e.g., 7×8=78)
        if (a < 10 && b < 10) {
            strategies.push({ value: parseInt(`${a}${b}`), pattern: 'err-concatenated-operands' });
        }
    }

    if (operation === 'division') {
        if (typeof correctAnswer === 'string' && String(correctAnswer).includes('R')) {
            const parts = String(correctAnswer).split('R');
            const q = parseInt(parts[0]);
            const r = parseInt(parts[1]);
            // Wrong remainder
            if (r > 0) {
                strategies.push({ value: `${q}R${r + 1}`, pattern: 'err-remainder-wrong' });
                strategies.push({ value: `${q}R${r - 1}`, pattern: 'err-remainder-wrong' });
            }
            // Wrong quotient
            const r1 = a - (q + 1) * b;
            const r2 = a - (q - 1) * b;
            if (r1 >= 0) strategies.push({ value: `${q + 1}R${r1}`, pattern: 'err-quotient-wrong' });
            if (r2 >= 0 && q > 1) strategies.push({ value: `${q - 1}R${r2}`, pattern: 'err-quotient-wrong' });
            // Swapped quotient and remainder
            strategies.push({ value: `${r}R${q}`, pattern: 'err-quotient-remainder-swapped' });
            // Ignored remainder
            strategies.push({ value: q, pattern: 'err-remainder-ignored' });
        } else {
            strategies.push({ value: correctAnswer + 1, pattern: 'err-off-by-one' });
            strategies.push({ value: correctAnswer - 1, pattern: 'err-off-by-one' });
            if (b > 1) strategies.push({ value: Math.floor(a / (b - 1)), pattern: 'err-adjacent-table-a' });
            // Used multiplication instead
            if (a * b !== correctAnswer) {
                strategies.push({ value: a * b, pattern: 'err-op-used-multiplication' });
            }
        }
    }

    // Filter valid strategies (positive, different from correct)
    const valid = strategies.filter(s => {
        if (s.value === correctAnswer) return false;
        if (typeof s.value === 'number') return s.value >= 0;
        if (typeof s.value === 'string') return true;
        return false;
    });

    if (valid.length === 0) {
        return typeof correctAnswer === 'number' ? correctAnswer + 1 : correctAnswer;
    }

    // Pick a random valid strategy
    const chosen = valid[Math.floor(Math.random() * valid.length)];
    return chosen.value;
}

/**
 * Add two numbers without carrying (common kid mistake).
 * E.g., 27 + 15: 7+5=2 (no carry), 2+1=3 → 32 instead of 42
 */
function addWithoutCarry(a, b) {
    let result = 0;
    let place = 1;
    while (a > 0 || b > 0) {
        const digitSum = (a % 10) + (b % 10);
        result += (digitSum % 10) * place;
        place *= 10;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return result;
}

/**
 * Subtract by always taking smaller from larger in each column (common kid mistake).
 * E.g., 42 - 17: 7-2=5, 4-1=3 → 35 instead of 25
 */
function subtractReversed(a, b) {
    let result = 0;
    let place = 1;
    while (a > 0 || b > 0) {
        const digitA = a % 10;
        const digitB = b % 10;
        result += Math.abs(digitA - digitB) * place;
        place *= 10;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return result;
}

// ============================================================================
// ARCHETYPE MATCHING — Find closest archetype for a real child
// ============================================================================

/**
 * Match a child's assessment/early results to the closest archetype.
 * Uses Euclidean distance on overlapping skill error rates.
 *
 * @param {string} operation - Operation to match
 * @param {Object} childSkills - Child's actual skill profile { skillName: { errorRate } }
 * @param {string} ageGroup - Child's age group
 * @returns {{ archetype: Object, distance: number }} Best matching archetype
 */
function findClosestArchetype(operation, childSkills, ageGroup) {
    const archetypes = getArchetypesForOperation(operation);

    let bestMatch = null;
    let bestDistance = Infinity;

    for (const archetype of archetypes) {
        const archetypeSkills = archetype.skills;
        let sumSquaredDiff = 0;
        let overlapCount = 0;

        // Compare overlapping skills
        for (const skill of Object.keys(archetypeSkills)) {
            if (childSkills[skill]) {
                const diff = (childSkills[skill].errorRate || 0) - archetypeSkills[skill].errorRate;
                sumSquaredDiff += diff * diff;
                overlapCount++;
            }
        }

        // Penalize age group mismatch
        let agePenalty = 0;
        if (archetype.ageGroup !== ageGroup) {
            agePenalty = 0.1; // Small penalty for different age group
        }

        const distance = overlapCount > 0
            ? Math.sqrt(sumSquaredDiff / overlapCount) + agePenalty
            : 1.0; // No overlap = max distance

        if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = archetype;
        }
    }

    return { archetype: bestMatch, distance: bestDistance };
}

/**
 * Get all archetypes for a specific operation.
 */
function getArchetypesForOperation(operation) {
    const opArchetypes = {
        addition: ADDITION_ARCHETYPES,
        subtraction: SUBTRACTION_ARCHETYPES,
        multiplication: MULTIPLICATION_ARCHETYPES,
        division: DIVISION_ARCHETYPES
    };

    const result = [...(opArchetypes[operation] || [])];

    // Add cross-operation archetypes that include this operation
    for (const cross of CROSS_OPERATION_ARCHETYPES) {
        if (cross.operations && cross.operations[operation]) {
            result.push({
                id: cross.id,
                description: cross.description,
                ageGroup: cross.ageGroup,
                skills: cross.operations[operation]
            });
        }
    }

    return result;
}

/**
 * Bootstrap a new child's skill profile from the closest archetype.
 * Returns a skill profile with bootstrapped: true flag.
 *
 * @param {string} operation
 * @param {Object} assessmentResults - { score, level }
 * @param {string} ageGroup
 * @returns {Object} Bootstrapped skill profile
 */
function bootstrapSkillProfile(operation, assessmentResults, ageGroup) {
    // Convert assessment score to rough error rate
    const overallErrorRate = 1 - (assessmentResults.score / 100);

    // Build a rough skill estimate from assessment
    const roughSkills = {};
    const archetypes = getArchetypesForOperation(operation);
    if (archetypes.length > 0) {
        // Use the first archetype's skill keys as reference
        const refSkills = Object.keys(archetypes[0].skills);
        for (const skill of refSkills) {
            roughSkills[skill] = { errorRate: overallErrorRate };
        }
    }

    // Find closest match
    const { archetype, distance } = findClosestArchetype(operation, roughSkills, ageGroup);

    if (!archetype) {
        return null;
    }

    // Build bootstrapped profile
    const skills = {};
    for (const [skillName, data] of Object.entries(archetype.skills)) {
        skills[skillName] = {
            attempts: 10, // Synthetic initial attempts
            errors: Math.round(data.errorRate * 10),
            errorRate: data.errorRate,
            lastError: null,
            recentErrors: []
        };
    }

    const totalAttempted = Object.values(skills).reduce((sum, s) => sum + s.attempts, 0);
    const totalErrors = Object.values(skills).reduce((sum, s) => sum + s.errors, 0);

    return {
        skills,
        totalAttempted,
        totalErrors,
        overallErrorRate: totalAttempted > 0 ? totalErrors / totalAttempted : 0,
        lastUpdated: new Date().toISOString(),
        bootstrapped: true,
        bootstrapArchetype: archetype.id,
        bootstrapDistance: distance
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
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
};
