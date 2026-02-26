/**
 * Shared Math Engine - Used by both client and Cloud Functions
 *
 * Extracts deterministic question generation logic from worksheet-generator.js.
 * Given the same (operation, ageGroup, difficulty, page), this module
 * ALWAYS produces the same 20 problems with the same answers.
 *
 * Usage (Cloud Functions):
 *   const { generatePageProblems } = require('./shared/math-engine');
 *   const result = generatePageProblems('addition', '6', 'easy', 1);
 *   // result.problems = [{ a, b, answer }, ...]
 *
 * Usage (Client):
 *   The client still uses its own copy in worksheet-generator.js for rendering.
 *   The server regenerates from the same seed for validation.
 */

// ============================================================================
// SEEDED PRNG — Deterministic random number generator
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
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Module-level seeded random (set before generating)
let seededRandom = null;

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
    return map[age]?.[diff] || 1;
}

function levelToAgeGroup(level) {
    if (level <= 2) return '4-5';
    if (level <= 4) return '6';
    if (level <= 6) return '7';
    if (level <= 8) return '8';
    if (level <= 10) return '9+';
    return '10+';
}

function levelToDifficulty(level) {
    if (level === 1) return 'easy';
    return level % 2 === 1 ? 'easy' : 'medium';
}

// ============================================================================
// PROBLEM GENERATORS
// All generators use the module-level `seededRandom` for deterministic output.
// ============================================================================

function generateSimpleAddition(min, max, sumLimit) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const minPossibleSum = min + min;
    const maxPossibleSum = Math.min(max + max, sumLimit);
    const targetSum = Math.floor(random() * (maxPossibleSum - minPossibleSum + 1)) + minPossibleSum;
    const minA = Math.max(min, targetSum - max);
    const maxA = Math.min(max, targetSum - min);
    let a = Math.floor(random() * (maxA - minA + 1)) + minA;
    let b = targetSum - a;
    if (b < min || b > max) {
        b = Math.max(min, Math.min(max, b));
        a = targetSum - b;
    }
    return { a, b, answer: a + b };
}

function generateMixedAddition(min1, max1, min2, max2) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    let a = Math.floor(random() * (max1 - min1 + 1)) + min1;
    let b = Math.floor(random() * (max2 - min2 + 1)) + min2;
    return { a, b, answer: a + b };
}

function generateSimpleSubtraction(min, max) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    let a = Math.floor(random() * (max - min + 1)) + min;
    let b = Math.floor(random() * a) + 1;
    return { a, b, answer: a - b };
}

function generateMixedSubtraction(min1, max1, min2, max2) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    let a = Math.floor(random() * (max1 - min1 + 1)) + min1;
    let b = Math.floor(random() * (max2 - min2 + 1)) + min2;
    if (b > a) {
        [a, b] = [b, a];
    }
    return { a, b, answer: a - b };
}

function generateMultiplication(multipliers, minMultiplicand, maxMultiplicand) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const multiplier = multipliers[Math.floor(random() * multipliers.length)];
    const multiplicand = Math.floor(random() * (maxMultiplicand - minMultiplicand + 1)) + minMultiplicand;
    return { a: multiplicand, b: multiplier, answer: multiplicand * multiplier };
}

function generateAdvancedMultiplication(min1, max1, min2, max2) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    let a = Math.floor(random() * (max1 - min1 + 1)) + min1;
    let b = Math.floor(random() * (max2 - min2 + 1)) + min2;
    return { a, b, answer: a * b };
}

function generateDivision(divisors, minQuotient, maxQuotient) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const divisor = divisors[Math.floor(random() * divisors.length)];
    const quotient = Math.floor(random() * (maxQuotient - minQuotient + 1)) + minQuotient;
    const dividend = divisor * quotient;
    return { a: dividend, b: divisor, answer: quotient };
}

function generateAdvancedDivision(min, max, minDivisor, maxDivisor, withRemainder) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const divisor = Math.floor(random() * (maxDivisor - minDivisor + 1)) + minDivisor;

    if (withRemainder) {
        const dividend = Math.floor(random() * (max - min + 1)) + min;
        const quotient = Math.floor(dividend / divisor);
        const remainder = dividend % divisor;
        return {
            a: dividend,
            b: divisor,
            answer: remainder > 0 ? `${quotient} R${remainder}` : `${quotient}`,
            quotient,
            remainder
        };
    } else {
        const quotient = Math.floor(random() * (Math.floor(max / divisor) - Math.floor(min / divisor) + 1)) + Math.floor(min / divisor);
        const dividend = divisor * quotient;
        return { a: dividend, b: divisor, answer: quotient };
    }
}

function generateDecimalAddition(min, max, decimalPlaces) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const multiplier = Math.pow(10, decimalPlaces);
    let a = Math.floor(random() * (max - min + 1) * multiplier) / multiplier + min;
    let b = Math.floor(random() * (max - min + 1) * multiplier) / multiplier + min;
    a = parseFloat(a.toFixed(decimalPlaces));
    b = parseFloat(b.toFixed(decimalPlaces));
    return { a, b, answer: parseFloat((a + b).toFixed(decimalPlaces)) };
}

function generateDecimalSubtraction(min, max, decimalPlaces) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const multiplier = Math.pow(10, decimalPlaces);
    let a = Math.floor(random() * (max - min + 1) * multiplier) / multiplier + min;
    let b = Math.floor(random() * a * multiplier) / multiplier;
    a = parseFloat(a.toFixed(decimalPlaces));
    b = parseFloat(b.toFixed(decimalPlaces));
    return { a, b, answer: parseFloat((a - b).toFixed(decimalPlaces)) };
}

function generateDecimalMultiplication(min, max, decimalPlaces) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const multiplier = Math.pow(10, decimalPlaces);
    let a = Math.floor(random() * (max - min + 1) * multiplier) / multiplier + min;
    let b = Math.floor(random() * 10 * multiplier) / multiplier + 1;
    a = parseFloat(a.toFixed(decimalPlaces));
    b = parseFloat(b.toFixed(decimalPlaces));
    return { a, b, answer: parseFloat((a * b).toFixed(decimalPlaces + 1)) };
}

function generateDecimalDivision(min, max, decimalPlaces) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const multiplier = Math.pow(10, decimalPlaces);
    let divisor = Math.floor(random() * 9 * multiplier) / multiplier + 1;
    let quotient = Math.floor(random() * 20 * multiplier) / multiplier + 1;
    divisor = parseFloat(divisor.toFixed(decimalPlaces));
    quotient = parseFloat(quotient.toFixed(decimalPlaces));
    const dividend = parseFloat((divisor * quotient).toFixed(decimalPlaces + 1));
    return { a: dividend, b: divisor, answer: quotient };
}

function generateFractionAddition() {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const denominator = [2, 3, 4, 5, 6, 8, 10][Math.floor(random() * 7)];
    const num1 = Math.floor(random() * (denominator - 1)) + 1;
    const num2 = Math.floor(random() * (denominator - 1)) + 1;
    const sum = num1 + num2;
    const answerNum = sum % denominator || denominator;
    const answerWhole = Math.floor(sum / denominator);
    return {
        a: `${num1}/${denominator}`,
        b: `${num2}/${denominator}`,
        answer: answerWhole > 0 ? `${answerWhole} ${answerNum}/${denominator}` : `${answerNum}/${denominator}`
    };
}

function generateFractionSubtraction() {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const denominator = [2, 3, 4, 5, 6, 8, 10][Math.floor(random() * 7)];
    const num1 = Math.floor(random() * (denominator - 1)) + 2;
    const num2 = Math.floor(random() * (num1 - 1)) + 1;
    return {
        a: `${num1}/${denominator}`,
        b: `${num2}/${denominator}`,
        answer: `${num1 - num2}/${denominator}`
    };
}

function generateFractionMultiplication() {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const denom1 = [2, 3, 4, 5, 6][Math.floor(random() * 5)];
    const denom2 = [2, 3, 4, 5, 6][Math.floor(random() * 5)];
    const num1 = Math.floor(random() * (denom1 - 1)) + 1;
    const num2 = Math.floor(random() * (denom2 - 1)) + 1;
    return {
        a: `${num1}/${denom1}`,
        b: `${num2}/${denom2}`,
        answer: `${num1 * num2}/${denom1 * denom2}`
    };
}

function generateFractionDivision() {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const denom1 = [2, 3, 4, 5, 6][Math.floor(random() * 5)];
    const denom2 = [2, 3, 4, 5, 6][Math.floor(random() * 5)];
    const num1 = Math.floor(random() * (denom1 - 1)) + 1;
    const num2 = Math.floor(random() * (denom2 - 1)) + 1;
    return {
        a: `${num1}/${denom1}`,
        b: `${num2}/${denom2}`,
        answer: `${num1 * denom2}/${denom1 * num2}`
    };
}

// ============================================================================
// AGE-BASED CONTENT CONFIGS — Identical to client worksheet-generator.js
// ============================================================================

const ageBasedContentConfigs = {
    addition: {
        '4-5': {
            easy:   { name: 'Ages 4-5 - Easy Addition',   description: 'Adding numbers up to 5',           problemCount: 20, generator: () => generateSimpleAddition(1, 4, 5) },
            medium: { name: 'Ages 4-5 - Medium Addition', description: 'Adding numbers up to 10',          problemCount: 20, generator: () => generateSimpleAddition(1, 9, 10) },
            hard:   { name: 'Ages 4-5 - Hard Addition',   description: 'Adding numbers up to 15',          problemCount: 20, generator: () => generateSimpleAddition(1, 10, 15) }
        },
        '6': {
            easy:   { name: 'Age 6 - Easy Addition',   description: 'Adding numbers up to 12',          problemCount: 20, generator: () => generateSimpleAddition(2, 10, 12) },
            medium: { name: 'Age 6 - Medium Addition', description: 'Adding numbers up to 20',          problemCount: 20, generator: () => generateSimpleAddition(5, 15, 20) },
            hard:   { name: 'Age 6 - Hard Addition',   description: 'Two-digit + One-digit numbers',    problemCount: 20, generator: () => generateMixedAddition(10, 99, 1, 9) }
        },
        '7': {
            easy:   { name: 'Age 7 - Easy Addition',   description: 'Adding numbers up to 25',          problemCount: 20, generator: () => generateSimpleAddition(10, 20, 25) },
            medium: { name: 'Age 7 - Medium Addition', description: 'Two-digit + One-digit numbers',    problemCount: 20, generator: () => generateMixedAddition(10, 99, 1, 9) },
            hard:   { name: 'Age 7 - Hard Addition',   description: 'Two-digit + Two-digit numbers',    problemCount: 20, generator: () => generateMixedAddition(10, 99, 10, 99) }
        },
        '8': {
            easy:   { name: 'Age 8 - Easy Addition',   description: 'Two-digit + Two-digit (small numbers)', problemCount: 20, generator: () => generateMixedAddition(10, 50, 10, 50) },
            medium: { name: 'Age 8 - Medium Addition', description: 'Two-digit + Two-digit numbers',         problemCount: 20, generator: () => generateMixedAddition(10, 99, 10, 99) },
            hard:   { name: 'Age 8 - Hard Addition',   description: 'Three-digit operations',                problemCount: 20, generator: () => generateMixedAddition(100, 999, 10, 99) }
        },
        '9+': {
            easy:   { name: 'Ages 9+ - Easy Addition',   description: 'Complex two-digit addition', problemCount: 20, generator: () => generateMixedAddition(50, 99, 50, 99) },
            medium: { name: 'Ages 9+ - Medium Addition', description: 'Three-digit addition',        problemCount: 20, generator: () => generateMixedAddition(100, 999, 100, 999) },
            hard:   { name: 'Ages 9+ - Hard Addition',   description: 'Decimal addition',            problemCount: 20, generator: () => generateDecimalAddition(1, 100, 1) }
        },
        '10+': {
            easy:   { name: 'Ages 10+ - Easy Addition',   description: 'Four-digit addition',          problemCount: 20, generator: () => generateMixedAddition(1000, 9999, 100, 999) },
            medium: { name: 'Ages 10+ - Medium Addition', description: 'Decimal addition (2 places)',  problemCount: 20, generator: () => generateDecimalAddition(1, 100, 2) },
            hard:   { name: 'Ages 10+ - Hard Addition',   description: 'Fraction addition',            problemCount: 20, generator: () => generateFractionAddition() }
        }
    },
    subtraction: {
        '4-5': {
            easy:   { name: 'Ages 4-5 - Easy Subtraction',   description: 'Subtracting within 5',     problemCount: 20, generator: () => generateSimpleSubtraction(1, 5) },
            medium: { name: 'Ages 4-5 - Medium Subtraction', description: 'Subtracting within 10',    problemCount: 20, generator: () => generateSimpleSubtraction(1, 10) },
            hard:   { name: 'Ages 4-5 - Hard Subtraction',   description: 'Subtracting within 15',    problemCount: 20, generator: () => generateSimpleSubtraction(1, 15) }
        },
        '6': {
            easy:   { name: 'Age 6 - Easy Subtraction',   description: 'Subtracting within 12',              problemCount: 20, generator: () => generateSimpleSubtraction(3, 12) },
            medium: { name: 'Age 6 - Medium Subtraction', description: 'Subtracting within 20',              problemCount: 20, generator: () => generateSimpleSubtraction(5, 20) },
            hard:   { name: 'Age 6 - Hard Subtraction',   description: 'Two-digit - One-digit numbers',      problemCount: 20, generator: () => generateMixedSubtraction(10, 99, 1, 9) }
        },
        '7': {
            easy:   { name: 'Age 7 - Easy Subtraction',   description: 'Subtracting within 25',              problemCount: 20, generator: () => generateSimpleSubtraction(10, 25) },
            medium: { name: 'Age 7 - Medium Subtraction', description: 'Two-digit - One-digit numbers',      problemCount: 20, generator: () => generateMixedSubtraction(10, 99, 1, 9) },
            hard:   { name: 'Age 7 - Hard Subtraction',   description: 'Two-digit - Two-digit numbers',      problemCount: 20, generator: () => generateMixedSubtraction(20, 99, 10, 30) }
        },
        '8': {
            easy:   { name: 'Age 8 - Easy Subtraction',   description: 'Two-digit - Two-digit (easier)',  problemCount: 20, generator: () => generateMixedSubtraction(30, 99, 10, 40) },
            medium: { name: 'Age 8 - Medium Subtraction', description: 'Two-digit - Two-digit numbers',   problemCount: 20, generator: () => generateMixedSubtraction(20, 99, 10, 30) },
            hard:   { name: 'Age 8 - Hard Subtraction',   description: 'Three-digit operations',          problemCount: 20, generator: () => generateMixedSubtraction(100, 999, 10, 99) }
        },
        '9+': {
            easy:   { name: 'Ages 9+ - Easy Subtraction',   description: 'Complex two-digit subtraction', problemCount: 20, generator: () => generateMixedSubtraction(50, 99, 10, 50) },
            medium: { name: 'Ages 9+ - Medium Subtraction', description: 'Three-digit subtraction',        problemCount: 20, generator: () => generateMixedSubtraction(100, 999, 100, 500) },
            hard:   { name: 'Ages 9+ - Hard Subtraction',   description: 'Decimal subtraction',            problemCount: 20, generator: () => generateDecimalSubtraction(1, 100, 1) }
        },
        '10+': {
            easy:   { name: 'Ages 10+ - Easy Subtraction',   description: 'Four-digit subtraction',          problemCount: 20, generator: () => generateMixedSubtraction(1000, 9999, 100, 999) },
            medium: { name: 'Ages 10+ - Medium Subtraction', description: 'Decimal subtraction (2 places)',  problemCount: 20, generator: () => generateDecimalSubtraction(1, 100, 2) },
            hard:   { name: 'Ages 10+ - Hard Subtraction',   description: 'Fraction subtraction',            problemCount: 20, generator: () => generateFractionSubtraction() }
        }
    },
    multiplication: {
        '4-5': {
            easy:   { name: 'Ages 4-5 - Easy Multiplication',   description: 'Multiply by 1',        problemCount: 20, generator: () => generateMultiplication([1], 1, 10) },
            medium: { name: 'Ages 4-5 - Medium Multiplication', description: 'Multiply by 1 and 2',  problemCount: 20, generator: () => generateMultiplication([1, 2], 1, 5) },
            hard:   { name: 'Ages 4-5 - Hard Multiplication',   description: 'Multiply by 1 and 2',  problemCount: 20, generator: () => generateMultiplication([1, 2], 1, 10) }
        },
        '6': {
            easy:   { name: 'Age 6 - Easy Multiplication',   description: 'Multiply by 2 and 3',   problemCount: 20, generator: () => generateMultiplication([2, 3], 1, 10) },
            medium: { name: 'Age 6 - Medium Multiplication', description: 'Multiply by 3, 4, 5',   problemCount: 20, generator: () => generateMultiplication([3, 4, 5], 1, 10) },
            hard:   { name: 'Age 6 - Hard Multiplication',   description: 'Multiply by 2-5',        problemCount: 20, generator: () => generateMultiplication([2, 3, 4, 5], 1, 10) }
        },
        '7': {
            easy:   { name: 'Age 7 - Easy Multiplication',   description: 'Multiply by 4, 5, 6',           problemCount: 20, generator: () => generateMultiplication([4, 5, 6], 1, 10) },
            medium: { name: 'Age 7 - Medium Multiplication', description: 'Multiply by 6, 7, 8, 9',       problemCount: 20, generator: () => generateMultiplication([6, 7, 8, 9], 1, 10) },
            hard:   { name: 'Age 7 - Hard Multiplication',   description: 'Two-digit x One-digit',         problemCount: 20, generator: () => generateAdvancedMultiplication(10, 99, 2, 9) }
        },
        '8': {
            easy:   { name: 'Age 8 - Easy Multiplication',   description: 'Multiply by 7, 8, 9, 10',     problemCount: 20, generator: () => generateMultiplication([7, 8, 9, 10], 1, 12) },
            medium: { name: 'Age 8 - Medium Multiplication', description: 'Two-digit x One-digit',        problemCount: 20, generator: () => generateAdvancedMultiplication(10, 99, 2, 9) },
            hard:   { name: 'Age 8 - Hard Multiplication',   description: 'Two-digit x Two-digit',        problemCount: 20, generator: () => generateAdvancedMultiplication(10, 50, 10, 50) }
        },
        '9+': {
            easy:   { name: 'Ages 9+ - Easy Multiplication',   description: 'Two-digit x One-digit (larger)',   problemCount: 20, generator: () => generateAdvancedMultiplication(20, 99, 5, 9) },
            medium: { name: 'Ages 9+ - Medium Multiplication', description: 'Larger two-digit multiplication',  problemCount: 20, generator: () => generateAdvancedMultiplication(20, 99, 10, 99) },
            hard:   { name: 'Ages 9+ - Hard Multiplication',   description: 'Three-digit x Two-digit',         problemCount: 20, generator: () => generateAdvancedMultiplication(100, 999, 10, 99) }
        },
        '10+': {
            easy:   { name: 'Ages 10+ - Easy Multiplication',   description: 'Two-digit x Two-digit (larger)',  problemCount: 20, generator: () => generateAdvancedMultiplication(30, 99, 20, 99) },
            medium: { name: 'Ages 10+ - Medium Multiplication', description: 'Decimal multiplication',          problemCount: 20, generator: () => generateDecimalMultiplication(1, 50, 1) },
            hard:   { name: 'Ages 10+ - Hard Multiplication',   description: 'Fraction multiplication',         problemCount: 20, generator: () => generateFractionMultiplication() }
        }
    },
    division: {
        '4-5': {
            easy:   { name: 'Ages 4-5 - Easy Division',   description: 'Divide by 1',        problemCount: 20, generator: () => generateDivision([1], 1, 10) },
            medium: { name: 'Ages 4-5 - Medium Division', description: 'Divide by 1 and 2',  problemCount: 20, generator: () => generateDivision([1, 2], 1, 5) },
            hard:   { name: 'Ages 4-5 - Hard Division',   description: 'Divide by 1 and 2',  problemCount: 20, generator: () => generateDivision([1, 2], 1, 10) }
        },
        '6': {
            easy:   { name: 'Age 6 - Easy Division',   description: 'Divide by 2 and 3',  problemCount: 20, generator: () => generateDivision([2, 3], 1, 10) },
            medium: { name: 'Age 6 - Medium Division', description: 'Divide by 3, 4, 5',  problemCount: 20, generator: () => generateDivision([3, 4, 5], 1, 10) },
            hard:   { name: 'Age 6 - Hard Division',   description: 'Divide by 2-5',       problemCount: 20, generator: () => generateDivision([2, 3, 4, 5], 1, 10) }
        },
        '7': {
            easy:   { name: 'Age 7 - Easy Division',   description: 'Divide by 4, 5, 6',           problemCount: 20, generator: () => generateDivision([4, 5, 6], 1, 10) },
            medium: { name: 'Age 7 - Medium Division', description: 'Divide by 6, 7, 8, 9',       problemCount: 20, generator: () => generateDivision([6, 7, 8, 9], 1, 10) },
            hard:   { name: 'Age 7 - Hard Division',   description: 'Two-digit / One-digit',       problemCount: 20, generator: () => generateAdvancedDivision(10, 99, 2, 9, false) }
        },
        '8': {
            easy:   { name: 'Age 8 - Easy Division',   description: 'Divide by 7, 8, 9, 10',     problemCount: 20, generator: () => generateDivision([7, 8, 9, 10], 1, 12) },
            medium: { name: 'Age 8 - Medium Division', description: 'Two-digit / One-digit',      problemCount: 20, generator: () => generateAdvancedDivision(10, 99, 2, 9, false) },
            hard:   { name: 'Age 8 - Hard Division',   description: 'Division with remainders',   problemCount: 20, generator: () => generateAdvancedDivision(10, 99, 2, 9, true) }
        },
        '9+': {
            easy:   { name: 'Ages 9+ - Easy Division',   description: 'Two-digit / One-digit (larger)',        problemCount: 20, generator: () => generateAdvancedDivision(20, 99, 5, 9, false) },
            medium: { name: 'Ages 9+ - Medium Division', description: 'Three-digit / Two-digit',               problemCount: 20, generator: () => generateAdvancedDivision(100, 999, 10, 50, false) },
            hard:   { name: 'Ages 9+ - Hard Division',   description: 'Complex division with remainders',      problemCount: 20, generator: () => generateAdvancedDivision(100, 999, 10, 50, true) }
        },
        '10+': {
            easy:   { name: 'Ages 10+ - Easy Division',   description: 'Division with remainders (advanced)',  problemCount: 20, generator: () => generateAdvancedDivision(50, 200, 6, 12, true) },
            medium: { name: 'Ages 10+ - Medium Division', description: 'Decimal division',                     problemCount: 20, generator: () => generateDecimalDivision(10, 100, 1) },
            hard:   { name: 'Ages 10+ - Hard Division',   description: 'Fraction division',                    problemCount: 20, generator: () => generateFractionDivision() }
        }
    }
};

// ============================================================================
// CONFIG ACCESSORS
// ============================================================================

function getConfigByAge(operation, ageGroup, difficulty) {
    const level = ageAndDifficultyToLevel(ageGroup, difficulty);
    return getConfigByLevel(operation, level);
}

function getConfigByLevel(operation, level) {
    // Build level config on the fly from ageBasedContentConfigs
    const ageGroup = levelToAgeGroup(level);
    const difficulty = levelToDifficulty(level);

    // For even levels, use hard difficulty (which maps to same level as medium)
    const difficultyPriority = ['hard', 'medium', 'easy'];

    for (const diff of difficultyPriority) {
        const mappedLevel = ageAndDifficultyToLevel(ageGroup, diff);
        if (mappedLevel === level) {
            const config = ageBasedContentConfigs[operation]?.[ageGroup]?.[diff];
            if (config) return config;
        }
    }

    return null;
}

// ============================================================================
// AGE HELPERS
// ============================================================================

const AGE_TO_GROUP = {
    '4': '4-5', '5': '4-5',
    '6': '6', '7': '7', '8': '8',
    '9': '9+', '10': '10+', '11': '10+', '12': '10+', '13': '10+'
};

function getAgeGroupFromAge(age) {
    return AGE_TO_GROUP[String(age)] || '6';
}

// ============================================================================
// MAIN ENTRY POINT: Generate problems for a page
// ============================================================================

/**
 * Generate the same deterministic problems for a given page.
 * @param {string} operation - 'addition', 'subtraction', 'multiplication', 'division'
 * @param {string} ageGroup - '4-5', '6', '7', '8', '9+', '10+'
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @param {number} page - Relative page number (1-50)
 * @returns {{ problems: Array, config: Object }}
 */
function generatePageProblems(operation, ageGroup, difficulty, page) {
    const config = getConfigByAge(operation, ageGroup, difficulty);
    if (!config) {
        throw new Error(`No config found for: ${operation}, ${ageGroup}, ${difficulty}`);
    }

    const seed = hashCode(`${operation}-${ageGroup}-${difficulty}-${page}`);
    seededRandom = new SeededRandom(seed);

    const problems = [];
    for (let i = 0; i < config.problemCount; i++) {
        problems.push(config.generator());
    }

    return {
        problems,
        config: {
            name: config.name,
            description: config.description,
            problemCount: config.problemCount
        }
    };
}

/**
 * Generate problems for an absolute page (1-150).
 * Maps absolute page to difficulty and relative page automatically.
 * @param {string} operation
 * @param {string} ageGroup
 * @param {number} absolutePage - 1-150
 * @returns {{ problems: Array, config: Object, difficulty: string, relativePage: number }}
 */
function generateAbsolutePageProblems(operation, ageGroup, absolutePage) {
    let difficulty, relativePage;

    if (absolutePage <= 50) {
        difficulty = 'easy';
        relativePage = absolutePage;
    } else if (absolutePage <= 100) {
        difficulty = 'medium';
        relativePage = absolutePage - 50;
    } else {
        difficulty = 'hard';
        relativePage = absolutePage - 100;
    }

    const result = generatePageProblems(operation, ageGroup, difficulty, relativePage);
    return { ...result, difficulty, relativePage };
}

// ============================================================================
// ANSWER COMPARISON
// ============================================================================

/**
 * Compare user answer to correct answer with tolerance for formatting.
 * @param {*} userAnswer - User's submitted answer
 * @param {*} correctAnswer - Expected correct answer
 * @returns {boolean}
 */
function compareAnswers(userAnswer, correctAnswer) {
    if (userAnswer === null || userAnswer === undefined || userAnswer === '') return false;

    if (typeof correctAnswer === 'string') {
        return String(userAnswer).replace(/\s+/g, '').toLowerCase() ===
               String(correctAnswer).replace(/\s+/g, '').toLowerCase();
    }

    return Number(userAnswer) === Number(correctAnswer);
}

// ============================================================================
// ASSESSMENT HELPERS (for server-side assessment validation)
// ============================================================================

function getYoungerAgeGroup(currentAgeGroup) {
    const map = { '4-5': '4-5', '6': '4-5', '7': '6', '8': '7', '9+': '8', '10+': '9+' };
    return map[currentAgeGroup] || currentAgeGroup;
}

function getOlderAgeGroup(currentAgeGroup) {
    const map = { '4-5': '6', '6': '7', '7': '8', '8': '9+', '9+': '10+', '10+': '10+' };
    return map[currentAgeGroup] || currentAgeGroup;
}

function determineLevelFromScore(score, ageGroup) {
    let targetAgeGroup, targetDifficulty, reason;

    if (score < 30) {
        targetAgeGroup = getYoungerAgeGroup(ageGroup);
        targetDifficulty = 'easy';
        reason = 'Score below 30% - assigned easier content for building foundation';
    } else if (score <= 75) {
        targetAgeGroup = ageGroup;
        targetDifficulty = 'medium';
        reason = 'Score 30-75% - assigned age-appropriate content';
    } else {
        targetAgeGroup = getOlderAgeGroup(ageGroup);
        targetDifficulty = 'medium';
        reason = 'Score above 75% - assigned advanced content for challenge';
    }

    const level = ageAndDifficultyToLevel(targetAgeGroup, targetDifficulty);
    return { level, ageGroup: targetAgeGroup, difficulty: targetDifficulty, reason };
}

/**
 * Generate seeded assessment questions (deterministic by childId + operation).
 * @param {string} operation
 * @param {string} ageGroup
 * @param {string} childId - Used for seed to make assessment reproducible
 * @returns {Array}
 */
function generateSeededAssessmentQuestions(operation, ageGroup, childId) {
    const youngerAge = getYoungerAgeGroup(ageGroup);
    const seed = hashCode(`assessment-${childId}-${operation}`);
    seededRandom = new SeededRandom(seed);

    const questions = [];
    const opSymbol = { addition: '+', subtraction: '-', multiplication: '*', division: '/' }[operation] || '+';

    // 5 questions from younger age (easy)
    const youngerConfig = getConfigByAge(operation, youngerAge, 'easy');
    if (youngerConfig) {
        for (let i = 0; i < 5; i++) {
            const problem = youngerConfig.generator();
            questions.push({
                ...problem,
                operation,
                problem: `${problem.a} ${opSymbol} ${problem.b} =`,
                sourceAge: youngerAge,
                sourceDifficulty: 'easy'
            });
        }
    }

    // 5 questions from current age (medium)
    const currentConfig = getConfigByAge(operation, ageGroup, 'medium');
    if (currentConfig) {
        for (let i = 0; i < 5; i++) {
            const problem = currentConfig.generator();
            questions.push({
                ...problem,
                operation,
                problem: `${problem.a} ${opSymbol} ${problem.b} =`,
                sourceAge: ageGroup,
                sourceDifficulty: 'medium'
            });
        }
    }

    // Deterministic shuffle using seeded random
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom.next() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions.slice(0, 10);
}

/**
 * Generate seeded level-up test questions.
 * @param {string} operation
 * @param {string} ageGroup
 * @param {string} childId
 * @param {string} weekStr
 * @returns {Array}
 */
function generateSeededLevelTestQuestions(operation, ageGroup, childId, weekStr) {
    const seed = hashCode(`leveltest-${childId}-${operation}-${weekStr}`);
    seededRandom = new SeededRandom(seed);

    const questions = [];
    const difficulties = ['easy', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard'];

    difficulties.forEach((difficulty, idx) => {
        const config = getConfigByAge(operation, ageGroup, difficulty);
        if (config) {
            const problem = config.generator();
            questions.push({
                index: idx,
                difficulty,
                problem,
                type: 'math',
                operation,
                answer: problem.answer
            });
        }
    });

    // Deterministic shuffle
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom.next() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
        questions[i].index = i;
        questions[j].index = j;
    }

    return questions;
}

// ============================================================================
// SKILL CLASSIFICATION — Tags each problem with the skills it tests
// ============================================================================

/**
 * Classify a math problem by the skills it requires.
 * Returns an array of skill tags for error tracking and adaptive generation.
 *
 * @param {string} operation - 'addition', 'subtraction', 'multiplication', 'division'
 * @param {*} a - First operand (number, string for fractions/decimals)
 * @param {*} b - Second operand
 * @param {*} answer - Correct answer
 * @returns {string[]} Array of skill tags
 */
function classifyProblem(operation, a, b, answer) {
    const skills = [];

    // Detect fractions (string operands with '/')
    if (typeof a === 'string' && String(a).includes('/')) {
        skills.push(`${operation.substring(0, 3)}-fraction`);
        return skills;
    }

    // Detect decimals
    const aNum = Number(a);
    const bNum = Number(b);
    if (!Number.isInteger(aNum) || !Number.isInteger(bNum)) {
        skills.push(`${operation.substring(0, 3)}-decimal`);
        return skills;
    }

    switch (operation) {
        case 'addition':
            skills.push(...classifyAddition(aNum, bNum));
            break;
        case 'subtraction':
            skills.push(...classifySubtraction(aNum, bNum));
            break;
        case 'multiplication':
            skills.push(...classifyMultiplication(aNum, bNum));
            break;
        case 'division':
            skills.push(...classifyDivision(aNum, bNum, answer));
            break;
    }

    return skills.length > 0 ? skills : [`${operation.substring(0, 3)}-basic`];
}

/**
 * Classify the ERROR PATTERN from a child's wrong answer.
 * Analyzes WHY the child got it wrong — not just what the problem was.
 * Returns an array of error pattern tags.
 *
 * @param {string} operation - 'addition'|'subtraction'|'multiplication'|'division'
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @param {*} correctAnswer - Correct answer
 * @param {*} userAnswer - What the child wrote
 * @returns {string[]} Error pattern tags
 */
function classifyError(operation, a, b, correctAnswer, userAnswer) {
    const patterns = [];

    // Parse both answers as numbers for comparison
    const correct = typeof correctAnswer === 'string' ? parseFloat(correctAnswer) : correctAnswer;
    const user = typeof userAnswer === 'string' ? parseFloat(userAnswer) : userAnswer;

    if (isNaN(user)) {
        patterns.push('err-invalid-input');
        return patterns;
    }

    const diff = user - correct;
    const absDiff = Math.abs(diff);

    // === UNIVERSAL ERROR PATTERNS (apply to all operations) ===

    // Off-by-one: answer is ±1
    if (absDiff === 1) patterns.push('err-off-by-one');

    // Off-by-ten: place value error
    if (absDiff === 10) patterns.push('err-off-by-ten');
    if (absDiff === 100) patterns.push('err-off-by-hundred');

    // Magnitude error: answer is 10× or 0.1× correct
    if (correct !== 0 && (user === correct * 10 || user * 10 === correct)) {
        patterns.push('err-magnitude-shift');
    }

    // Digit reversal: e.g., wrote 72 instead of 27
    if (correct >= 10 && correct < 100 && user >= 10 && user < 100) {
        const cStr = String(correct), uStr = String(user);
        if (cStr.length === 2 && uStr.length === 2 &&
            cStr[0] === uStr[1] && cStr[1] === uStr[0]) {
            patterns.push('err-digit-reversal');
        }
    }

    // === ADDITION-SPECIFIC ERROR PATTERNS ===
    if (operation === 'addition') {
        // Forgot to carry: e.g., 27+15=32 (should be 42)
        const noCarry = addDigitsNoCarry(a, b);
        if (user === noCarry && noCarry !== correct) {
            patterns.push('err-carry-forgot');
        }

        // Double carry: carried when shouldn't
        if (diff === 10 || diff === 100) {
            patterns.push('err-carry-extra');
        }

        // Used subtraction instead of addition
        if (user === Math.abs(a - b)) {
            patterns.push('err-op-used-subtraction');
        }

        // Doubled one operand instead of adding both
        if (user === a * 2 || user === b * 2) {
            patterns.push('err-doubled-operand');
        }

        // Ones digit correct but tens digit wrong (partial carry error)
        if (correct >= 10 && user >= 10) {
            if (correct % 10 === user % 10 && Math.floor(correct / 10) !== Math.floor(user / 10)) {
                patterns.push('err-tens-digit-wrong');
            }
            if (correct % 10 !== user % 10 && Math.floor(correct / 10) === Math.floor(user / 10)) {
                patterns.push('err-ones-digit-wrong');
            }
        }
    }

    // === SUBTRACTION-SPECIFIC ERROR PATTERNS ===
    if (operation === 'subtraction') {
        // Reversed subtraction: smaller from larger per column (42-17=35)
        const reversed = subtractDigitsReversed(a, b);
        if (user === reversed && reversed !== correct) {
            patterns.push('err-borrow-reversed');
        }

        // Forgot to borrow (didn't reduce next column)
        if (diff === 10 || diff === -10) {
            patterns.push('err-borrow-forgot');
        }

        // Used addition instead of subtraction
        if (user === a + b) {
            patterns.push('err-op-used-addition');
        }

        // Subtracted in wrong order (b - a instead of a - b)
        if (a > b && user === b - a + 100 || user === -(a - b - correct) + correct) {
            // Hard to detect exactly, check if user got negative-like result
        }
        if (user < 0 || (a > b && user === b)) {
            patterns.push('err-wrong-order');
        }

        // Ones digit correct, tens wrong
        if (correct >= 10 && user >= 10) {
            if (correct % 10 === user % 10 && Math.floor(correct / 10) !== Math.floor(user / 10)) {
                patterns.push('err-tens-digit-wrong');
            }
            if (correct % 10 !== user % 10 && Math.floor(correct / 10) === Math.floor(user / 10)) {
                patterns.push('err-ones-digit-wrong');
            }
        }
    }

    // === MULTIPLICATION-SPECIFIC ERROR PATTERNS ===
    if (operation === 'multiplication') {
        // Added instead of multiplied
        if (user === a + b) {
            patterns.push('err-op-used-addition');
        }

        // Adjacent table entry: off by one factor
        if (user === (a - 1) * b || user === (a + 1) * b) {
            patterns.push('err-adjacent-table-a');
        }
        if (user === a * (b - 1) || user === a * (b + 1)) {
            patterns.push('err-adjacent-table-b');
        }

        // Confused with nearby table: e.g., 7×8=54 (confused with 6×9)
        if (a <= 12 && b <= 12) {
            for (let x = 2; x <= 12; x++) {
                for (let y = 2; y <= 12; y++) {
                    if (x * y === user && (x !== a || y !== b) &&
                        (Math.abs(x - a) + Math.abs(y - b) <= 2)) {
                        patterns.push('err-table-confusion');
                        break;
                    }
                }
                if (patterns.includes('err-table-confusion')) break;
            }
        }

        // Repeated the operand (e.g., 7×8=78 by concatenation)
        if (user === parseInt(`${a}${b}`) || user === parseInt(`${b}${a}`)) {
            patterns.push('err-concatenated-operands');
        }

        // Partial product error in multi-digit: 23×7 got ones right but tens wrong
        if (a >= 10 && b < 10) {
            const onesProduct = (a % 10) * b;
            const tensProduct = Math.floor(a / 10) * b;
            if (user % 10 === (onesProduct % 10) && user !== correct) {
                patterns.push('err-partial-product');
            }
        }
    }

    // === DIVISION-SPECIFIC ERROR PATTERNS ===
    if (operation === 'division') {
        const correctStr = String(correctAnswer);
        const userStr = String(userAnswer);

        if (correctStr.includes('R') && userStr.includes('R')) {
            const [cQ, cR] = correctStr.split('R').map(Number);
            const [uQ, uR] = userStr.split('R').map(Number);

            if (cQ === uQ && cR !== uR) {
                patterns.push('err-remainder-wrong');
            }
            if (cQ !== uQ && cR === uR) {
                patterns.push('err-quotient-wrong');
            }
            if (cQ === uR && cR === uQ) {
                patterns.push('err-quotient-remainder-swapped');
            }
        } else if (correctStr.includes('R') && !userStr.includes('R')) {
            // Child ignored remainder
            patterns.push('err-remainder-ignored');
        } else if (!correctStr.includes('R')) {
            // Used multiplication instead
            if (user === a * b) {
                patterns.push('err-op-used-multiplication');
            }
        }
    }

    // === CATCH-ALL ===
    if (patterns.length === 0) {
        if (absDiff <= 3) {
            patterns.push('err-small-miscalculation');
        } else if (absDiff <= 10) {
            patterns.push('err-moderate-miscalculation');
        } else {
            patterns.push('err-large-miscalculation');
        }
    }

    return patterns;
}

/** Helper: add digits without carrying (for error detection) */
function addDigitsNoCarry(a, b) {
    let result = 0, place = 1;
    while (a > 0 || b > 0) {
        result += ((a % 10) + (b % 10)) % 10 * place;
        place *= 10;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return result;
}

/** Helper: subtract by reversing digits per column (for error detection) */
function subtractDigitsReversed(a, b) {
    let result = 0, place = 1;
    while (a > 0 || b > 0) {
        result += Math.abs((a % 10) - (b % 10)) * place;
        place *= 10;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return result;
}

function classifyAddition(a, b) {
    const skills = [];

    // Digit count classification
    if (a >= 1000 || b >= 1000) {
        skills.push('add-4digit');
    } else if (a >= 100 || b >= 100) {
        skills.push('add-3digit');
    } else if (a >= 10 && b >= 10) {
        skills.push('add-2digit');
    } else {
        skills.push('add-single');
    }

    // Special number patterns
    if (a === 0 || b === 0) skills.push('add-zero');
    if (a === b) skills.push('add-doubles');
    if (Math.abs(a - b) === 1 && a < 20 && b < 20) skills.push('add-near-doubles');
    if (a + b === 10) skills.push('add-make-10');
    if (a < 10 && b < 10 && a + b > 10) skills.push('add-bridge-10');
    if ((a % 10 === 0 || b % 10 === 0) && (a >= 10 || b >= 10)) skills.push('add-round-number');

    // Digit count mismatch (e.g., 234 + 5 — alignment challenge)
    const digitsA = String(a).length, digitsB = String(b).length;
    if (Math.abs(digitsA - digitsB) >= 2 && a >= 10 && b >= 10) skills.push('add-unequal-digits');

    // Carry detection: check each column
    if (a >= 10 || b >= 10) {
        let carries = 0;
        let tempA = a, tempB = b, carry = 0;
        while (tempA > 0 || tempB > 0) {
            const digitSum = (tempA % 10) + (tempB % 10) + carry;
            if (digitSum >= 10) carries++;
            carry = digitSum >= 10 ? 1 : 0;
            tempA = Math.floor(tempA / 10);
            tempB = Math.floor(tempB / 10);
        }
        if (carries === 0) {
            skills.push('add-no-carry');
        } else if (carries === 1) {
            skills.push('add-carry-once');
        } else {
            skills.push('add-carry-multi');
        }
    }

    return skills;
}

function classifySubtraction(a, b) {
    const skills = [];

    // Digit count
    if (a >= 1000) {
        skills.push('sub-4digit');
    } else if (a >= 100) {
        skills.push('sub-3digit');
    } else if (a >= 10) {
        skills.push('sub-2digit');
    } else {
        skills.push('sub-single');
    }

    // Special number patterns
    if (b === 0) skills.push('sub-zero');
    if (a === b) skills.push('sub-equal');
    if (a % 10 === 0 && a >= 10) skills.push('sub-from-round');
    if (a === 10) skills.push('sub-from-10');
    if (a - b <= 3 && a - b >= 0 && a >= 10) skills.push('sub-near-zero-result');

    // Consecutive zeros in minuend (1000-456, 500-123)
    const aStr = String(a);
    const consecutiveZeros = (aStr.match(/0+$/) || [''])[0].length;
    if (consecutiveZeros >= 2) skills.push('sub-consecutive-zeros');

    // Borrow detection
    if (a >= 10) {
        let borrows = 0;
        let borrowAcrossZero = false;
        let tempA = a, tempB = b, borrow = 0;
        while (tempA > 0 || tempB > 0) {
            const digitA = (tempA % 10) - borrow;
            const digitB = tempB % 10;
            if (digitA < digitB) {
                borrows++;
                // Check if next digit of a is 0 (borrow across zero)
                if (Math.floor(tempA / 10) % 10 === 0 && Math.floor(tempA / 10) > 0) {
                    borrowAcrossZero = true;
                }
                borrow = 1;
            } else {
                borrow = 0;
            }
            tempA = Math.floor(tempA / 10);
            tempB = Math.floor(tempB / 10);
        }
        if (borrows === 0) {
            skills.push('sub-no-borrow');
        } else if (borrowAcrossZero) {
            skills.push('sub-borrow-zero');
        } else if (borrows === 1) {
            skills.push('sub-borrow-once');
        } else {
            skills.push('sub-borrow-multi');
        }
    }

    return skills;
}

function classifyMultiplication(a, b) {
    const skills = [];

    // Ensure a >= b for consistent classification
    const [larger, smaller] = a >= b ? [a, b] : [b, a];

    // Size classification
    if (larger >= 10 && smaller >= 10) {
        skills.push('mul-multi-digit');
    } else if (larger >= 100) {
        skills.push('mul-multi-digit');
    } else if (larger >= 10) {
        skills.push('mul-2digit-by-1digit');
    } else {
        // Both single digit — classify by table range
        if (smaller <= 5) {
            skills.push('mul-tables-2-5');
        } else {
            skills.push('mul-tables-6-9');
        }
    }

    // Special number patterns
    if (a === 0 || b === 0) skills.push('mul-by-0');
    if (a === 1 || b === 1) skills.push('mul-by-1');
    if (a === 10 || b === 10 || a === 100 || b === 100) skills.push('mul-by-10');
    if (a === 5 || b === 5) skills.push('mul-by-5');
    if (a === b && a <= 12) skills.push('mul-squares');

    // Specific table identification (for single-digit factors)
    if (smaller >= 2 && smaller <= 12 && larger < 13) {
        skills.push(`mul-table-${smaller}`);
    }

    // Multi-digit with carry detection (e.g., 23×7: 3×7=21 carries)
    if (larger >= 10 && smaller < 10 && smaller >= 2) {
        const onesProduct = (larger % 10) * smaller;
        if (onesProduct >= 10) skills.push('mul-carry-in-product');
    }

    return skills;
}

function classifyDivision(a, b, answer) {
    const skills = [];

    // Check for remainder
    const hasRemainder = typeof answer === 'string' && String(answer).includes('R');
    if (hasRemainder) {
        skills.push('div-remainder');
    }

    // Size classification
    if (a >= 100) {
        skills.push('div-long');
    } else if (a >= 10) {
        skills.push('div-2digit');
    } else {
        skills.push('div-basic');
    }

    // Divisor classification
    if (b >= 10) {
        skills.push('div-by-2digit');
    } else if (b <= 5) {
        skills.push('div-by-small');
    } else {
        skills.push('div-by-large');
    }

    if (!hasRemainder && a < 100) {
        skills.push('div-exact');
    }

    // Special patterns
    if (b === 1) skills.push('div-by-1');
    if (b === 2) skills.push('div-halving');
    if (a === 0) skills.push('div-zero-dividend');
    if (a === b) skills.push('div-same-numbers');

    // Division that's inverse of a multiplication table fact
    if (a <= 144 && b <= 12 && !hasRemainder) skills.push('div-table-fact');

    return skills;
}

// ============================================================================
// SKILL-TARGETED PROBLEM GENERATION — For adaptive worksheets
// ============================================================================

/**
 * Generate a single problem that exercises a specific skill.
 * Uses existing generators with constraints to ensure the desired skill is present.
 *
 * @param {string} operation - 'addition', 'subtraction', 'multiplication', 'division'
 * @param {string} ageGroup - '4-5', '6', '7', '8', '9+', '10+'
 * @param {string} targetSkill - Skill tag like 'add-carry-once', 'mul-tables-6-9'
 * @param {number} seed - Seed for deterministic generation
 * @returns {{ a, b, answer, skills: string[] } | null} Problem object or null if skill not possible
 */
function generateProblemBySkill(operation, ageGroup, targetSkill, seed) {
    seededRandom = new SeededRandom(seed);

    // Try up to 50 attempts to generate a problem with the target skill
    for (let attempt = 0; attempt < 50; attempt++) {
        const problem = generateProblemForSkill(operation, ageGroup, targetSkill);
        if (!problem) return null; // skill not possible for this operation

        const skills = classifyProblem(operation, problem.a, problem.b, problem.answer);
        if (skills.includes(targetSkill)) {
            return { ...problem, skills };
        }
    }

    // Fallback: return any problem from this operation/ageGroup
    const config = getConfigByAge(operation, ageGroup, 'medium') ||
                   getConfigByAge(operation, ageGroup, 'easy');
    if (config) {
        const problem = config.generator();
        const skills = classifyProblem(operation, problem.a, problem.b, problem.answer);
        return { ...problem, skills };
    }

    return null;
}

/**
 * Generate a problem constrained to exercise a target skill.
 * Returns a raw problem object (without skills attached).
 */
function generateProblemForSkill(operation, ageGroup, targetSkill) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();

    // Fraction and decimal skills — use the appropriate generators directly
    if (targetSkill.endsWith('-fraction')) {
        const fracGens = {
            addition: generateFractionAddition,
            subtraction: generateFractionSubtraction,
            multiplication: generateFractionMultiplication,
            division: generateFractionDivision
        };
        return fracGens[operation] ? fracGens[operation]() : null;
    }

    if (targetSkill.endsWith('-decimal')) {
        const decGens = {
            addition: () => generateDecimalAddition(1, 100, 1),
            subtraction: () => generateDecimalSubtraction(1, 100, 1),
            multiplication: () => generateDecimalMultiplication(1, 50, 1),
            division: () => generateDecimalDivision(10, 100, 1)
        };
        return decGens[operation] ? decGens[operation]() : null;
    }

    switch (targetSkill) {
        // ---- Addition skills ----
        case 'add-single':
            return generateSimpleAddition(1, 9, 18);
        case 'add-2digit':
        case 'add-no-carry': {
            // Generate 2-digit numbers where no column sum >= 10
            const a = Math.floor(random() * 4 + 1) * 10 + Math.floor(random() * 4 + 1);
            const b = Math.floor(random() * 4 + 1) * 10 + Math.floor(random() * 4 + 1);
            return { a, b, answer: a + b };
        }
        case 'add-carry-once': {
            // Ensure ones column sums to >= 10
            const aOnes = Math.floor(random() * 3) + 7; // 7-9
            const bOnes = Math.floor(random() * 3) + 3; // 3-5 (sum >= 10)
            const aTens = Math.floor(random() * 3) + 1; // 1-3 (no tens carry)
            const bTens = Math.floor(random() * 3) + 1;
            const a = aTens * 10 + aOnes;
            const b = bTens * 10 + bOnes;
            return { a, b, answer: a + b };
        }
        case 'add-carry-multi': {
            // Multiple carries: both columns overflow
            const aOnes = Math.floor(random() * 3) + 7;
            const bOnes = Math.floor(random() * 3) + 5;
            const aTens = Math.floor(random() * 3) + 7;
            const bTens = Math.floor(random() * 3) + 5;
            const a = aTens * 10 + aOnes;
            const b = bTens * 10 + bOnes;
            return { a, b, answer: a + b };
        }
        case 'add-3digit':
            return generateMixedAddition(100, 999, 100, 999);
        case 'add-4digit':
            return generateMixedAddition(1000, 9999, 100, 999);

        // ---- Subtraction skills ----
        case 'sub-single':
            return generateSimpleSubtraction(1, 9);
        case 'sub-2digit':
        case 'sub-no-borrow': {
            const a = Math.floor(random() * 4 + 5) * 10 + Math.floor(random() * 4 + 5);
            const b = Math.floor(random() * 3 + 1) * 10 + Math.floor(random() * 3 + 1);
            return a > b ? { a, b, answer: a - b } : { a: b, b: a, answer: b - a };
        }
        case 'sub-borrow-once': {
            // Ensure ones column needs borrow
            const aOnes = Math.floor(random() * 3) + 1; // 1-3
            const bOnes = Math.floor(random() * 3) + 6; // 6-8 (bOnes > aOnes)
            const aTens = Math.floor(random() * 3) + 5; // 5-7 (enough to borrow)
            const bTens = Math.floor(random() * 2) + 1; // 1-2
            const a = aTens * 10 + aOnes;
            const b = bTens * 10 + bOnes;
            return { a, b, answer: a - b };
        }
        case 'sub-borrow-zero': {
            // Borrow across zero: a has 0 in tens place
            const hundreds = Math.floor(random() * 3) + 3; // 3-5
            const a = hundreds * 100; // e.g., 300, 400, 500
            const b = Math.floor(random() * 99) + 100; // 100-199
            return a > b ? { a, b, answer: a - b } : null;
        }
        case 'sub-borrow-multi':
            return generateMixedSubtraction(100, 999, 50, 200);
        case 'sub-3digit':
            return generateMixedSubtraction(100, 999, 10, 99);
        case 'sub-4digit':
            return generateMixedSubtraction(1000, 9999, 100, 999);

        // ---- Multiplication skills ----
        case 'mul-tables-2-5':
            return generateMultiplication([2, 3, 4, 5], 1, 12);
        case 'mul-tables-6-9':
            return generateMultiplication([6, 7, 8, 9], 1, 12);
        case 'mul-2digit-by-1digit':
            return generateAdvancedMultiplication(10, 99, 2, 9);
        case 'mul-multi-digit':
            return generateAdvancedMultiplication(10, 99, 10, 99);

        // ---- Division skills ----
        case 'div-basic':
        case 'div-exact':
        case 'div-by-small':
            return generateDivision([2, 3, 4, 5], 1, 10);
        case 'div-by-large':
            return generateDivision([6, 7, 8, 9], 1, 10);
        case 'div-2digit':
            return generateAdvancedDivision(10, 99, 2, 9, false);
        case 'div-remainder':
            return generateAdvancedDivision(10, 99, 2, 9, true);
        case 'div-long':
        case 'div-by-2digit':
            return generateAdvancedDivision(100, 999, 10, 50, false);

        default: {
            // Unknown skill — fall back to age-appropriate config
            const config = getConfigByAge(operation, ageGroup, 'medium') ||
                           getConfigByAge(operation, ageGroup, 'easy');
            return config ? config.generator() : null;
        }
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Core generation
    generatePageProblems,
    generateAbsolutePageProblems,
    compareAnswers,

    // Assessment
    generateSeededAssessmentQuestions,
    determineLevelFromScore,
    generateSeededLevelTestQuestions,

    // Config access
    getConfigByAge,
    getConfigByLevel,
    ageBasedContentConfigs,

    // Level mapping
    ageAndDifficultyToLevel,
    levelToAgeGroup,
    levelToDifficulty,

    // Age helpers
    getAgeGroupFromAge,
    getYoungerAgeGroup,
    getOlderAgeGroup,

    // Skill classification & targeted generation (adaptive learning)
    classifyProblem,
    classifyError,
    generateProblemBySkill,

    // Primitives
    SeededRandom,
    hashCode
};
