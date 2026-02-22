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

    // Primitives
    SeededRandom,
    hashCode
};
