// Math Worksheet Generator

// State variables for navigation
let selectedAgeGroup = null;
let selectedOperation = null;
let selectedDifficulty = null;

// Navigation functions
function showSubjects() {
    document.querySelector('.subject-selection').style.display = 'block';
    document.getElementById('math-age-groups').style.display = 'none';
    document.getElementById('math-operations').style.display = 'none';
    document.getElementById('math-difficulties').style.display = 'none';
}

function showMathLevels() {
    showMathAgeGroups();
}

function showMathAgeGroups() {
    document.querySelector('.subject-selection').style.display = 'none';
    document.getElementById('math-age-groups').style.display = 'block';
    document.getElementById('math-operations').style.display = 'none';
    document.getElementById('math-difficulties').style.display = 'none';
}

function showMathOperations(ageGroup) {
    selectedAgeGroup = ageGroup;
    document.getElementById('math-age-groups').style.display = 'none';
    document.getElementById('math-operations').style.display = 'block';
    document.getElementById('math-difficulties').style.display = 'none';
}

function showMathOperationsBack() {
    document.getElementById('math-operations').style.display = 'block';
    document.getElementById('math-difficulties').style.display = 'none';
}

function showDifficulties(operation) {
    selectedOperation = operation;
    document.getElementById('math-operations').style.display = 'none';
    document.getElementById('math-difficulties').style.display = 'block';

    // Update difficulty descriptions based on selected age and operation
    updateDifficultyDescriptions();
}

function updateDifficultyDescriptions() {
    if (!selectedAgeGroup || !selectedOperation) return;

    const config = contentConfigs[selectedOperation]?.[selectedAgeGroup];
    if (!config) return;

    const easyDesc = document.getElementById('easy-desc');
    const mediumDesc = document.getElementById('medium-desc');
    const hardDesc = document.getElementById('hard-desc');

    if (easyDesc && config.easy) easyDesc.textContent = config.easy.description;
    if (mediumDesc && config.medium) mediumDesc.textContent = config.medium.description;
    if (hardDesc && config.hard) hardDesc.textContent = config.hard.description;
}

function loadWorksheetNew(difficulty) {
    selectedDifficulty = difficulty;
    if (selectedAgeGroup && selectedOperation && selectedDifficulty) {
        loadWorksheet(selectedOperation, selectedAgeGroup, selectedDifficulty, 1);
    }
}

function backToWorksheetSelection() {
    // Hide worksheet content and show difficulty selection
    const worksheetContent = document.getElementById('worksheet-content');
    if (worksheetContent) {
        worksheetContent.style.display = 'none';
    }
    document.getElementById('math-difficulties').style.display = 'block';
}

let currentWorksheet = null;
let currentOperation = null;

// Demo version limiting
function isDemoMode() {
    const user = getCurrentUser();
    if (!user) return true; // Default to demo if no user

    // Check for admin demo preview mode
    if (user.role === 'admin') {
        const adminDemoPreview = localStorage.getItem('adminDemoPreview') === 'true';
        return adminDemoPreview; // Admin can toggle demo preview
    }

    // Treat users without version field as demo (for existing users)
    const version = user.version || 'demo';
    return version === 'demo';
}

function getDemoLimit(defaultCount) {
    return isDemoMode() ? Math.min(2, defaultCount) : defaultCount;
}
let currentPage = 1;
let totalPages = 50;
let timer = null;
let startTime = null;
let elapsedSeconds = 0;
let answersVisible = false;

// Seeded random number generator for deterministic worksheets
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

let seededRandom = null;

// Age groups configuration
const AGE_GROUPS = ['4-5', '6', '7', '8', '9+', '10+'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DIFFICULTY_LABELS = {
    'easy': 'Easy ⭐',
    'medium': 'Medium ⭐⭐',
    'hard': 'Hard ⭐⭐⭐'
};

// Content Configurations (age-based with difficulty levels)
const contentConfigs = {
    addition: {
        '4-5': {
            easy: {
                name: 'Ages 4-5 - Easy Addition',
                description: 'Adding numbers up to 5',
                problemCount: 20,
                generator: () => generateSimpleAddition(1, 4, 5)
            },
            medium: {
                name: 'Ages 4-5 - Medium Addition',
                description: 'Adding numbers up to 10',
                problemCount: 20,
                generator: () => generateSimpleAddition(1, 9, 10)
            },
            hard: {
                name: 'Ages 4-5 - Hard Addition',
                description: 'Adding numbers up to 15',
                problemCount: 20,
                generator: () => generateSimpleAddition(1, 10, 15)
            }
        },
        '6': {
            easy: {
                name: 'Age 6 - Easy Addition',
                description: 'Adding numbers up to 10',
                problemCount: 20,
                generator: () => generateSimpleAddition(1, 9, 10)
            },
            medium: {
                name: 'Age 6 - Medium Addition',
                description: 'Adding numbers up to 20',
                problemCount: 20,
                generator: () => generateSimpleAddition(5, 15, 20)
            },
            hard: {
                name: 'Age 6 - Hard Addition',
                description: 'Two-digit + One-digit numbers',
                problemCount: 20,
                generator: () => generateMixedAddition(10, 99, 1, 9)
            }
        },
        '7': {
            easy: {
                name: 'Age 7 - Easy Addition',
                description: 'Adding numbers up to 20',
                problemCount: 20,
                generator: () => generateSimpleAddition(5, 15, 20)
            },
            medium: {
                name: 'Age 7 - Medium Addition',
                description: 'Two-digit + One-digit numbers',
                problemCount: 20,
                generator: () => generateMixedAddition(10, 99, 1, 9)
            },
            hard: {
                name: 'Age 7 - Hard Addition',
                description: 'Two-digit + Two-digit numbers',
                problemCount: 20,
                generator: () => generateMixedAddition(10, 99, 10, 99)
            }
        },
        '8': {
            easy: {
                name: 'Age 8 - Easy Addition',
                description: 'Two-digit + One-digit numbers',
                problemCount: 20,
                generator: () => generateMixedAddition(10, 99, 1, 9)
            },
            medium: {
                name: 'Age 8 - Medium Addition',
                description: 'Two-digit + Two-digit numbers',
                problemCount: 20,
                generator: () => generateMixedAddition(10, 99, 10, 99)
            },
            hard: {
                name: 'Age 8 - Hard Addition',
                description: 'Three-digit operations',
                problemCount: 20,
                generator: () => generateMixedAddition(100, 999, 10, 99)
            }
        },
        '9+': {
            easy: {
                name: 'Ages 9+ - Easy Addition',
                description: 'Complex two-digit addition',
                problemCount: 20,
                generator: () => generateMixedAddition(50, 99, 50, 99)
            },
            medium: {
                name: 'Ages 9+ - Medium Addition',
                description: 'Three-digit addition',
                problemCount: 20,
                generator: () => generateMixedAddition(100, 999, 100, 999)
            },
            hard: {
                name: 'Ages 9+ - Hard Addition',
                description: 'Decimal addition',
                problemCount: 20,
                generator: () => generateDecimalAddition(1, 100, 1)
            }
        },
        '10+': {
            easy: {
                name: 'Ages 10+ - Easy Addition',
                description: 'Large number addition',
                problemCount: 20,
                generator: () => generateMixedAddition(100, 999, 100, 999)
            },
            medium: {
                name: 'Ages 10+ - Medium Addition',
                description: 'Decimal addition (2 places)',
                problemCount: 20,
                generator: () => generateDecimalAddition(1, 100, 2)
            },
            hard: {
                name: 'Ages 10+ - Hard Addition',
                description: 'Fraction addition',
                problemCount: 20,
                generator: () => generateFractionAddition()
            }
        }
    },
    subtraction: {
        '4-5': {
            easy: {
                name: 'Ages 4-5 - Easy Subtraction',
                description: 'Subtracting within 5',
                problemCount: 20,
                generator: () => generateSimpleSubtraction(1, 5)
            },
            medium: {
                name: 'Ages 4-5 - Medium Subtraction',
                description: 'Subtracting within 10',
                problemCount: 20,
                generator: () => generateSimpleSubtraction(1, 10)
            },
            hard: {
                name: 'Ages 4-5 - Hard Subtraction',
                description: 'Subtracting within 15',
                problemCount: 20,
                generator: () => generateSimpleSubtraction(1, 15)
            }
        },
        '6': {
            easy: {
                name: 'Age 6 - Easy Subtraction',
                description: 'Subtracting within 10',
                problemCount: 20,
                generator: () => generateSimpleSubtraction(1, 10)
            },
            medium: {
                name: 'Age 6 - Medium Subtraction',
                description: 'Subtracting within 20',
                problemCount: 20,
                generator: () => generateSimpleSubtraction(5, 20)
            },
            hard: {
                name: 'Age 6 - Hard Subtraction',
                description: 'Two-digit - One-digit numbers',
                problemCount: 20,
                generator: () => generateMixedSubtraction(10, 99, 1, 9)
            }
        },
        '7': {
            easy: {
                name: 'Age 7 - Easy Subtraction',
                description: 'Subtracting within 20',
                problemCount: 20,
                generator: () => generateSimpleSubtraction(5, 20)
            },
            medium: {
                name: 'Age 7 - Medium Subtraction',
                description: 'Two-digit - One-digit numbers',
                problemCount: 20,
                generator: () => generateMixedSubtraction(10, 99, 1, 9)
            },
            hard: {
                name: 'Age 7 - Hard Subtraction',
                description: 'Two-digit - Two-digit numbers',
                problemCount: 20,
                generator: () => generateMixedSubtraction(20, 99, 10, 30)
            }
        },
        '8': {
            easy: {
                name: 'Age 8 - Easy Subtraction',
                description: 'Two-digit - One-digit numbers',
                problemCount: 20,
                generator: () => generateMixedSubtraction(10, 99, 1, 9)
            },
            medium: {
                name: 'Age 8 - Medium Subtraction',
                description: 'Two-digit - Two-digit numbers',
                problemCount: 20,
                generator: () => generateMixedSubtraction(20, 99, 10, 30)
            },
            hard: {
                name: 'Age 8 - Hard Subtraction',
                description: 'Three-digit operations',
                problemCount: 20,
                generator: () => generateMixedSubtraction(100, 999, 10, 99)
            }
        },
        '9+': {
            easy: {
                name: 'Ages 9+ - Easy Subtraction',
                description: 'Complex two-digit subtraction',
                problemCount: 20,
                generator: () => generateMixedSubtraction(50, 99, 10, 50)
            },
            medium: {
                name: 'Ages 9+ - Medium Subtraction',
                description: 'Three-digit subtraction',
                problemCount: 20,
                generator: () => generateMixedSubtraction(100, 999, 100, 500)
            },
            hard: {
                name: 'Ages 9+ - Hard Subtraction',
                description: 'Decimal subtraction',
                problemCount: 20,
                generator: () => generateDecimalSubtraction(1, 100, 1)
            }
        },
        '10+': {
            easy: {
                name: 'Ages 10+ - Easy Subtraction',
                description: 'Large number subtraction',
                problemCount: 20,
                generator: () => generateMixedSubtraction(100, 999, 100, 500)
            },
            medium: {
                name: 'Ages 10+ - Medium Subtraction',
                description: 'Decimal subtraction (2 places)',
                problemCount: 20,
                generator: () => generateDecimalSubtraction(1, 100, 2)
            },
            hard: {
                name: 'Ages 10+ - Hard Subtraction',
                description: 'Fraction subtraction',
                problemCount: 20,
                generator: () => generateFractionSubtraction()
            }
        }
    },
    multiplication: {
        '4-5': {
            easy: {
                name: 'Ages 4-5 - Easy Multiplication',
                description: 'Multiply by 1',
                problemCount: 20,
                generator: () => generateMultiplication([1], 1, 10)
            },
            medium: {
                name: 'Ages 4-5 - Medium Multiplication',
                description: 'Multiply by 1 and 2',
                problemCount: 20,
                generator: () => generateMultiplication([1, 2], 1, 5)
            },
            hard: {
                name: 'Ages 4-5 - Hard Multiplication',
                description: 'Multiply by 1 and 2',
                problemCount: 20,
                generator: () => generateMultiplication([1, 2], 1, 10)
            }
        },
        '6': {
            easy: {
                name: 'Age 6 - Easy Multiplication',
                description: 'Multiply by 1 and 2',
                problemCount: 20,
                generator: () => generateMultiplication([1, 2], 1, 10)
            },
            medium: {
                name: 'Age 6 - Medium Multiplication',
                description: 'Multiply by 3, 4, 5',
                problemCount: 20,
                generator: () => generateMultiplication([3, 4, 5], 1, 10)
            },
            hard: {
                name: 'Age 6 - Hard Multiplication',
                description: 'Multiply by 2-5',
                problemCount: 20,
                generator: () => generateMultiplication([2, 3, 4, 5], 1, 10)
            }
        },
        '7': {
            easy: {
                name: 'Age 7 - Easy Multiplication',
                description: 'Multiply by 3, 4, 5',
                problemCount: 20,
                generator: () => generateMultiplication([3, 4, 5], 1, 10)
            },
            medium: {
                name: 'Age 7 - Medium Multiplication',
                description: 'Multiply by 6, 7, 8, 9',
                problemCount: 20,
                generator: () => generateMultiplication([6, 7, 8, 9], 1, 10)
            },
            hard: {
                name: 'Age 7 - Hard Multiplication',
                description: 'Two-digit × One-digit',
                problemCount: 20,
                generator: () => generateAdvancedMultiplication(10, 99, 2, 9)
            }
        },
        '8': {
            easy: {
                name: 'Age 8 - Easy Multiplication',
                description: 'Multiply by 6, 7, 8, 9',
                problemCount: 20,
                generator: () => generateMultiplication([6, 7, 8, 9], 1, 10)
            },
            medium: {
                name: 'Age 8 - Medium Multiplication',
                description: 'Two-digit × One-digit',
                problemCount: 20,
                generator: () => generateAdvancedMultiplication(10, 99, 2, 9)
            },
            hard: {
                name: 'Age 8 - Hard Multiplication',
                description: 'Two-digit × Two-digit',
                problemCount: 20,
                generator: () => generateAdvancedMultiplication(10, 50, 10, 50)
            }
        },
        '9+': {
            easy: {
                name: 'Ages 9+ - Easy Multiplication',
                description: 'Two-digit × Two-digit',
                problemCount: 20,
                generator: () => generateAdvancedMultiplication(10, 50, 10, 50)
            },
            medium: {
                name: 'Ages 9+ - Medium Multiplication',
                description: 'Larger two-digit multiplication',
                problemCount: 20,
                generator: () => generateAdvancedMultiplication(20, 99, 10, 99)
            },
            hard: {
                name: 'Ages 9+ - Hard Multiplication',
                description: 'Three-digit × Two-digit',
                problemCount: 20,
                generator: () => generateAdvancedMultiplication(100, 999, 10, 99)
            }
        },
        '10+': {
            easy: {
                name: 'Ages 10+ - Easy Multiplication',
                description: 'Three-digit × Two-digit',
                problemCount: 20,
                generator: () => generateAdvancedMultiplication(100, 999, 10, 99)
            },
            medium: {
                name: 'Ages 10+ - Medium Multiplication',
                description: 'Decimal multiplication',
                problemCount: 20,
                generator: () => generateDecimalMultiplication(1, 50, 1)
            },
            hard: {
                name: 'Ages 10+ - Hard Multiplication',
                description: 'Fraction multiplication',
                problemCount: 20,
                generator: () => generateFractionMultiplication()
            }
        }
    },
    division: {
        '4-5': {
            easy: {
                name: 'Ages 4-5 - Easy Division',
                description: 'Divide by 1',
                problemCount: 20,
                generator: () => generateDivision([1], 1, 10)
            },
            medium: {
                name: 'Ages 4-5 - Medium Division',
                description: 'Divide by 1 and 2',
                problemCount: 20,
                generator: () => generateDivision([1, 2], 1, 5)
            },
            hard: {
                name: 'Ages 4-5 - Hard Division',
                description: 'Divide by 1 and 2',
                problemCount: 20,
                generator: () => generateDivision([1, 2], 1, 10)
            }
        },
        '6': {
            easy: {
                name: 'Age 6 - Easy Division',
                description: 'Divide by 1 and 2',
                problemCount: 20,
                generator: () => generateDivision([1, 2], 1, 20)
            },
            medium: {
                name: 'Age 6 - Medium Division',
                description: 'Divide by 3, 4, 5',
                problemCount: 20,
                generator: () => generateDivision([3, 4, 5], 1, 10)
            },
            hard: {
                name: 'Age 6 - Hard Division',
                description: 'Divide by 2-5',
                problemCount: 20,
                generator: () => generateDivision([2, 3, 4, 5], 1, 10)
            }
        },
        '7': {
            easy: {
                name: 'Age 7 - Easy Division',
                description: 'Divide by 3, 4, 5',
                problemCount: 20,
                generator: () => generateDivision([3, 4, 5], 1, 10)
            },
            medium: {
                name: 'Age 7 - Medium Division',
                description: 'Divide by 6, 7, 8, 9',
                problemCount: 20,
                generator: () => generateDivision([6, 7, 8, 9], 1, 10)
            },
            hard: {
                name: 'Age 7 - Hard Division',
                description: 'Two-digit ÷ One-digit',
                problemCount: 20,
                generator: () => generateAdvancedDivision(10, 99, 2, 9, false)
            }
        },
        '8': {
            easy: {
                name: 'Age 8 - Easy Division',
                description: 'Divide by 6, 7, 8, 9',
                problemCount: 20,
                generator: () => generateDivision([6, 7, 8, 9], 1, 10)
            },
            medium: {
                name: 'Age 8 - Medium Division',
                description: 'Two-digit ÷ One-digit',
                problemCount: 20,
                generator: () => generateAdvancedDivision(10, 99, 2, 9, false)
            },
            hard: {
                name: 'Age 8 - Hard Division',
                description: 'Division with remainders',
                problemCount: 20,
                generator: () => generateAdvancedDivision(10, 99, 2, 9, true)
            }
        },
        '9+': {
            easy: {
                name: 'Ages 9+ - Easy Division',
                description: 'Division with remainders',
                problemCount: 20,
                generator: () => generateAdvancedDivision(10, 99, 2, 9, true)
            },
            medium: {
                name: 'Ages 9+ - Medium Division',
                description: 'Three-digit ÷ Two-digit',
                problemCount: 20,
                generator: () => generateAdvancedDivision(100, 999, 10, 50, false)
            },
            hard: {
                name: 'Ages 9+ - Hard Division',
                description: 'Complex division with remainders',
                problemCount: 20,
                generator: () => generateAdvancedDivision(100, 999, 10, 50, true)
            }
        },
        '10+': {
            easy: {
                name: 'Ages 10+ - Easy Division',
                description: 'Three-digit ÷ Two-digit',
                problemCount: 20,
                generator: () => generateAdvancedDivision(100, 999, 10, 50, false)
            },
            medium: {
                name: 'Ages 10+ - Medium Division',
                description: 'Decimal division',
                problemCount: 20,
                generator: () => generateDecimalDivision(10, 100, 1)
            },
            hard: {
                name: 'Ages 10+ - Hard Division',
                description: 'Fraction division',
                problemCount: 20,
                generator: () => generateFractionDivision()
            }
        }
    }
};

// Generate simple addition problems
function generateSimpleAddition(min, max, sumLimit) {
    // Use seeded random if available, otherwise fall back to Math.random
    const random = () => seededRandom ? seededRandom.next() : Math.random();

    // Calculate reasonable sum range
    const minPossibleSum = min + min;
    const maxPossibleSum = Math.min(max + max, sumLimit);

    // Choose a random target sum
    const targetSum = Math.floor(random() * (maxPossibleSum - minPossibleSum + 1)) + minPossibleSum;

    // Now split the target sum into two numbers within [min, max]
    const minA = Math.max(min, targetSum - max);
    const maxA = Math.min(max, targetSum - min);

    let a = Math.floor(random() * (maxA - minA + 1)) + minA;
    let b = targetSum - a;

    // Ensure both are in valid range
    if (b < min || b > max) {
        b = Math.max(min, Math.min(max, b));
        a = targetSum - b;
    }

    return { a, b, answer: a + b };
}

// Generate mixed addition problems
function generateMixedAddition(min1, max1, min2, max2) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    let a = Math.floor(random() * (max1 - min1 + 1)) + min1;
    let b = Math.floor(random() * (max2 - min2 + 1)) + min2;
    return { a, b, answer: a + b };
}

// Generate simple subtraction problems
function generateSimpleSubtraction(min, max) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    let a = Math.floor(random() * (max - min + 1)) + min;
    let b = Math.floor(random() * a) + 1;
    return { a, b, answer: a - b };
}

// Generate mixed subtraction problems
function generateMixedSubtraction(min1, max1, min2, max2) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    let a = Math.floor(random() * (max1 - min1 + 1)) + min1;
    let b = Math.floor(random() * (max2 - min2 + 1)) + min2;

    // Ensure a > b for positive results
    if (b > a) {
        [a, b] = [b, a];
    }

    return { a, b, answer: a - b };
}

// Generate multiplication problems
function generateMultiplication(multipliers, minMultiplicand, maxMultiplicand) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const multiplier = multipliers[Math.floor(random() * multipliers.length)];
    const multiplicand = Math.floor(random() * (maxMultiplicand - minMultiplicand + 1)) + minMultiplicand;
    return { a: multiplicand, b: multiplier, answer: multiplicand * multiplier };
}

// Generate advanced multiplication problems
function generateAdvancedMultiplication(min1, max1, min2, max2) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    let a = Math.floor(random() * (max1 - min1 + 1)) + min1;
    let b = Math.floor(random() * (max2 - min2 + 1)) + min2;
    return { a, b, answer: a * b };
}

// Generate division problems
function generateDivision(divisors, minQuotient, maxQuotient) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const divisor = divisors[Math.floor(random() * divisors.length)];
    const quotient = Math.floor(random() * (maxQuotient - minQuotient + 1)) + minQuotient;
    const dividend = divisor * quotient;
    return { a: dividend, b: divisor, answer: quotient };
}

// Generate advanced division problems
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

// Generate decimal addition problems
function generateDecimalAddition(min, max, decimalPlaces) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const multiplier = Math.pow(10, decimalPlaces);
    let a = Math.floor(random() * (max - min + 1) * multiplier) / multiplier + min;
    let b = Math.floor(random() * (max - min + 1) * multiplier) / multiplier + min;
    a = parseFloat(a.toFixed(decimalPlaces));
    b = parseFloat(b.toFixed(decimalPlaces));
    return { a, b, answer: parseFloat((a + b).toFixed(decimalPlaces)) };
}

// Generate decimal subtraction problems
function generateDecimalSubtraction(min, max, decimalPlaces) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const multiplier = Math.pow(10, decimalPlaces);
    let a = Math.floor(random() * (max - min + 1) * multiplier) / multiplier + min;
    let b = Math.floor(random() * a * multiplier) / multiplier;
    a = parseFloat(a.toFixed(decimalPlaces));
    b = parseFloat(b.toFixed(decimalPlaces));
    return { a, b, answer: parseFloat((a - b).toFixed(decimalPlaces)) };
}

// Generate decimal multiplication problems
function generateDecimalMultiplication(min, max, decimalPlaces) {
    const random = () => seededRandom ? seededRandom.next() : Math.random();
    const multiplier = Math.pow(10, decimalPlaces);
    let a = Math.floor(random() * (max - min + 1) * multiplier) / multiplier + min;
    let b = Math.floor(random() * 10 * multiplier) / multiplier + 1;
    a = parseFloat(a.toFixed(decimalPlaces));
    b = parseFloat(b.toFixed(decimalPlaces));
    return { a, b, answer: parseFloat((a * b).toFixed(decimalPlaces + 1)) };
}

// Generate decimal division problems
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

// Generate fraction addition problems
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

// Generate fraction subtraction problems
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

// Generate fraction multiplication problems
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

// Generate fraction division problems
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

// Load worksheet for specific age group, difficulty, and page
function loadWorksheet(operation, ageGroup, difficulty, page = 1) {
    currentOperation = operation;
    currentPage = page;
    const config = contentConfigs[operation]?.[ageGroup]?.[difficulty];
    if (!config) {
        console.error(`No config found for: ${operation}, ${ageGroup}, ${difficulty}`);
        return;
    }

    // Initialize seeded random with page number for deterministic generation
    const seed = hashCode(`${operation}-${ageGroup}-${difficulty}-${page}`);
    seededRandom = new SeededRandom(seed);

    // Set page limit for demo mode (2 pages) vs full mode (50 pages)
    totalPages = isDemoMode() ? 2 : 50;

    // Generate full problems per page (no limit on problems, limit on pages instead)
    const problemCount = config.problemCount;
    const problems = [];
    for (let i = 0; i < problemCount; i++) {
        problems.push(config.generator());
    }

    currentWorksheet = {
        operation,
        ageGroup,
        difficulty,
        page,
        config,
        problems,
        answers: new Array(config.problemCount).fill('')
    };

    renderWorksheet();
}

// Simple hash function for seeding
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Get operation symbol
function getOperationSymbol(operation) {
    const symbols = {
        addition: '+',
        subtraction: '-',
        multiplication: '×',
        division: '÷'
    };
    return symbols[operation] || '+';
}

// Render the worksheet
function renderWorksheet() {
    const { operation, ageGroup, difficulty, config, problems } = currentWorksheet;
    const today = new Date().toLocaleDateString();
    const symbol = getOperationSymbol(operation);

    const html = `
        <div class="worksheet-container">
            <div class="worksheet-header">
                <div class="worksheet-info">
                    <h2>${config.name}</h2>
                    <p>${config.description}</p>
                </div>
                <div class="student-info">
                    <div class="info-row">
                        <strong>Name:</strong>
                        <input type="text" id="student-name" value="${getCurrentUserFullName()}">
                    </div>
                    <div class="info-row">
                        <strong>Date:</strong>
                        <input type="text" value="${today}" readonly>
                    </div>
                    <div class="info-row">
                        <strong>Time:</strong>
                        <span id="elapsed-time">00:00</span>
                    </div>
                </div>
            </div>

            <div class="top-navigation" style="margin-bottom: 20px; display: flex; gap: 20px; align-items: center;">
                <button class="back-btn" onclick="backToWorksheetSelection()" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 12px 24px; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">← Back to Difficulty</button>
                <div class="page-navigation" style="display: flex; gap: 10px; align-items: center;">
                    <button onclick="navigatePage(-1)" ${currentPage <= 1 ? 'disabled' : ''} style="padding: 10px 20px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; cursor: pointer;">⬅️ Previous</button>
                    <span class="page-counter" style="font-weight: bold; font-size: 1.1em;">📄 Page ${currentPage} of ${totalPages}</span>
                    <button onclick="navigatePage(1)" ${currentPage >= totalPages ? 'disabled' : ''} style="padding: 10px 20px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; cursor: pointer;">Next ➡️</button>
                </div>
            </div>

            <div class="controls">
                <div class="timer">
                    <span id="timer-display" style="font-size: 1.8em; font-weight: bold; color: #667eea;">⏱️ 00:00</span>
                </div>
                <div class="control-buttons">
                    <div id="timer-toggle-container" class="timer-toggle-container">
                        <span class="timer-toggle-label">⏱️ Timer</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="timer-toggle-input" onchange="toggleTimer(event)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <button onclick="saveCurrentWorksheet()" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">💾 Save</button>
                    <button onclick="clearAllAnswers()" style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);">🔄 Clear All</button>
                    <button onclick="savePDF()" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">📄 PDF</button>
                </div>
            </div>

            <div class="results-summary" id="results-summary"></div>

            <div class="problems-grid">
                ${problems.map((problem, index) => {
                    return `
                    <div class="problem">
                        <span class="problem-number">${index + 1}.</span>
                        <div class="problem-content problem-with-handwriting">
                            <span class="problem-text">${problem.a} ${symbol} ${problem.b}</span>
                            <span class="equals">=</span>
                            <div class="handwriting-input-wrapper">
                                <canvas
                                    id="answer-${index}"
                                    class="handwriting-input"
                                    data-width="100"
                                    data-height="60"
                                    data-answer="${problem.answer}"
                                    style="touch-action: none;">
                                </canvas>
                                <button class="eraser-btn" onclick="clearHandwritingInput('answer-${index}')" title="Clear this answer">✕</button>
                            </div>
                            <span class="answer-feedback" id="feedback-${index}"></span>
                        </div>
                    </div>
                `;
                }).join('')}
            </div>

            <div class="answer-key" id="answer-key">
                <h3>Answer Key</h3>
                <div class="answer-key-grid">
                    ${problems.map((problem, index) => `
                        <div class="answer-item">
                            ${index + 1}. ${problem.a} ${symbol} ${problem.b} = <strong>${problem.answer}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="navigation" style="margin-top: 20px;">
                <div id="answer-toggle-container" class="answer-toggle-container" style="display: inline-block;">
                    <span class="answer-toggle-label">👀 Show Answers</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="answer-toggle-input" onchange="toggleAnswers(event)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    // Hide navigation and show worksheet in container
    document.getElementById('math-age-groups').style.display = 'none';
    document.getElementById('math-operations').style.display = 'none';
    document.getElementById('math-difficulties').style.display = 'none';

    // Get or create worksheet container
    let worksheetContainer = document.getElementById('worksheet-content');
    if (!worksheetContainer) {
        worksheetContainer = document.createElement('div');
        worksheetContainer.id = 'worksheet-content';
        document.body.appendChild(worksheetContainer);
    }

    worksheetContainer.innerHTML = html;
    worksheetContainer.style.display = 'block';

    // Initialize handwriting inputs
    setTimeout(() => {
        initializeAllHandwritingInputs();
        // Load saved worksheet after inputs are initialized
        setTimeout(() => {
            loadSavedWorksheet();
        }, 200);
    }, 100);

    // Reset timer
    elapsedSeconds = 0;
    updateTimerDisplay();
}

// Timer functions
function toggleTimer(event) {
    const isRunning = event ? event.target.checked : !timer;

    if (isRunning) {
        startTimer();
    } else {
        stopTimer();
    }
}

function startTimer() {
    if (timer) return; // Already running

    startTime = Date.now() - (elapsedSeconds * 1000);
    timer = setInterval(() => {
        elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const timerEl = document.getElementById('timer-display');
    const elapsedEl = document.getElementById('elapsed-time');

    if (timerEl) timerEl.textContent = `⏱️ ${display}`;
    if (elapsedEl) elapsedEl.textContent = display;
}

// Handle Enter key to move to next input
function handleEnter(event, index) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const nextInput = document.getElementById(`answer-${index + 1}`);
        if (nextInput) {
            nextInput.focus();
        } else {
            // Last question, check answers
            checkAnswers();
        }
    }
}

// Check answers
function checkAnswers() {
    stopTimer();

    let total = currentWorksheet.problems.length;

    currentWorksheet.problems.forEach((problem, index) => {
        const canvas = document.getElementById(`answer-${index}`);
        const feedback = document.getElementById(`feedback-${index}`);
        const correctAnswer = String(problem.answer);

        // Update feedback (RIGHT of canvas, NOT on canvas) - just the value, no "Answer:" prefix
        feedback.textContent = correctAnswer;
        feedback.style.color = '#4caf50';
        feedback.style.fontSize = '1.5em';
        feedback.style.fontWeight = 'bold';
        feedback.style.display = 'inline';
    });

    // Show results
    const resultsDiv = document.getElementById('results-summary');

    resultsDiv.innerHTML = `
        <h3>Answers Shown</h3>
        <p style="font-size: 1.1em; color: #0066cc;">Correct answers are displayed in green to the right of each problem.</p>
        <p style="font-size: 1em; color: #666;">Compare your handwritten answers with the correct ones.</p>
        <p>Time: ${document.getElementById('elapsed-time').textContent}</p>
    `;
    resultsDiv.style.display = 'block';

    // Show and check toggle switch
    answersVisible = true;
    const toggleContainer = document.getElementById('answer-toggle-container');
    const toggleInput = document.getElementById('answer-toggle-input');
    if (toggleContainer && toggleInput) {
        toggleContainer.style.display = 'flex';
        toggleInput.checked = true;
    }
}

// Show answer key
function showAnswerKey() {
    const answerKey = document.getElementById('answer-key');
    if (answerKey.style.display === 'none' || answerKey.style.display === '') {
        answerKey.style.display = 'block';
    } else {
        answerKey.style.display = 'none';
    }
}

// Save worksheet as PDF
function savePDF() {
    // Generate filename with date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const operationName = currentWorksheet.operation.charAt(0).toUpperCase() + currentWorksheet.operation.slice(1);
    const filename = `${operationName}_${currentWorksheet.ageGroup}_${currentWorksheet.difficulty}_Page${currentPage}_${year}${month}${day}_${hours}${minutes}${seconds}.pdf`;

    // Hide elements that shouldn't be in PDF
    const controls = document.querySelector('.controls');
    const results = document.getElementById('results-summary');
    const navigation = document.querySelector('.navigation');
    const answerKey = document.getElementById('answer-key');

    const controlsDisplay = controls ? controls.style.display : '';
    const resultsDisplay = results ? results.style.display : '';
    const navigationDisplay = navigation ? navigation.style.display : '';
    const answerKeyDisplay = answerKey ? answerKey.style.display : '';

    if (controls) controls.style.display = 'none';
    if (results) results.style.display = 'none';
    if (navigation) navigation.style.display = 'none';
    if (answerKey) answerKey.style.display = 'none';

    // Configure PDF options with better settings to prevent clipping
    const element = document.querySelector('.worksheet-container');
    const opt = {
        margin: [0.6, 0.4, 0.6, 0.4], // top, right, bottom, left margins
        filename: filename,
        image: { type: 'jpeg', quality: 0.92 },
        html2canvas: {
            scale: 1.2, // Further reduced to prevent clipping
            useCORS: true,
            letterRendering: true,
            logging: false,
            width: element.scrollWidth,
            windowWidth: element.scrollWidth
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Generate and save PDF
    html2pdf().set(opt).from(element).save().then(() => {
        // Restore hidden elements
        if (controls) controls.style.display = controlsDisplay;
        if (results) results.style.display = resultsDisplay;
        if (navigation) navigation.style.display = navigationDisplay;
        if (answerKey) answerKey.style.display = answerKeyDisplay;
    });
}

// Toggle answer visibility
function toggleAnswers(event) {
    answersVisible = event ? event.target.checked : !answersVisible;

    currentWorksheet.problems.forEach((problem, index) => {
        const feedback = document.getElementById(`feedback-${index}`);
        const correctAnswer = String(problem.answer);

        if (feedback) {
            if (answersVisible) {
                // Show answer
                feedback.textContent = correctAnswer;
                feedback.style.color = '#4caf50';
                feedback.style.fontSize = '1.5em';
                feedback.style.fontWeight = 'bold';
                feedback.style.display = 'inline';
            } else {
                // Hide answer
                feedback.style.display = 'none';
            }
        }
    });
}

// Save current worksheet
function saveCurrentWorksheet() {
    if (!currentWorksheet) {
        alert('No worksheet to save');
        return;
    }

    const identifier = `${currentWorksheet.operation}-${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}-page${currentPage}`;
    const studentName = document.getElementById('student-name')?.value || getCurrentUserFullName();
    const elapsedTime = document.getElementById('elapsed-time')?.textContent || '00:00';

    // Collect canvas answers
    const canvasAnswers = [];
    currentWorksheet.problems.forEach((problem, index) => {
        const canvas = document.getElementById(`answer-${index}`);
        if (canvas && canvas.toDataURL) {
            canvasAnswers.push({
                index: index,
                imageData: canvas.toDataURL('image/png')
            });
        }
    });

    const data = {
        completed: true,
        elapsedTime: elapsedTime,
        studentName: studentName,
        canvasAnswers: canvasAnswers,
        buttonAnswers: {},
        checkboxAnswers: {}
    };

    if (saveWorksheetToStorage('math', identifier, data)) {
        alert(`Page ${currentPage} saved successfully!`);
        updateCompletionBadge(currentWorksheet.operation, currentWorksheet.ageGroup, currentWorksheet.difficulty);
    }
}

// Load saved worksheet
function loadSavedWorksheet() {
    if (!currentWorksheet) return;

    const identifier = `${currentWorksheet.operation}-${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}-page${currentPage}`;
    const savedData = loadWorksheetFromStorage('math', identifier);

    if (!savedData) return;

    // Restore student name and time
    const studentNameInput = document.getElementById('student-name');
    const elapsedTimeSpan = document.getElementById('elapsed-time');

    if (studentNameInput && savedData.studentName) {
        studentNameInput.value = savedData.studentName;
    }

    if (elapsedTimeSpan && savedData.elapsedTime) {
        elapsedTimeSpan.textContent = savedData.elapsedTime;
    }

    // Restore canvas answers
    if (savedData.canvasAnswers && savedData.canvasAnswers.length > 0) {
        savedData.canvasAnswers.forEach(answer => {
            const canvas = document.getElementById(`answer-${answer.index}`);
            if (canvas && canvas.getContext && answer.imageData) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = answer.imageData;
            }
        });

        // Show "Loaded saved page" message
        const resultsDiv = document.getElementById('results-summary');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <h3>✅ Loaded Saved Page</h3>
                <p style="font-size: 1.1em; color: #0066cc;">Your previous work on page ${currentPage} has been restored.</p>
                <p>Time: ${savedData.elapsedTime}</p>
            `;
            resultsDiv.style.display = 'block';
        }
    }
}

// Clear all answers on current worksheet
function clearAllAnswers() {
    if (!currentWorksheet) return;

    if (confirm('Clear all your answers? This cannot be undone.')) {
        // Clear all canvases
        clearAllHandwritingInputs();

        // Hide any visible answers
        answersVisible = false;
        const toggleInput = document.getElementById('answer-toggle-input');
        if (toggleInput) {
            toggleInput.checked = false;
        }

        currentWorksheet.problems.forEach((problem, index) => {
            const feedback = document.getElementById(`feedback-${index}`);
            if (feedback) {
                feedback.style.display = 'none';
            }
        });
    }
}

// Update completion badge on level selection screen
function updateCompletionBadge(operation, ageGroup, difficulty) {
    console.log(`Worksheet ${operation}-${ageGroup}-${difficulty} marked as completed`);
}

// Navigate between pages
function navigatePage(direction) {
    try {
        if (!currentWorksheet) {
            alert('Error: Worksheet not loaded properly. Please reload the page.');
            return;
        }

        const newPage = currentPage + direction;

        // Check bounds
        if (newPage < 1 || newPage > totalPages) {
            return;
        }

        // Auto-save current page before navigating
        try {
            autoSavePage();
        } catch (saveError) {
            console.error('Error during auto-save:', saveError);
        }

        // Load new page
        loadWorksheet(currentWorksheet.operation, currentWorksheet.ageGroup, currentWorksheet.difficulty, newPage);
    } catch (error) {
        console.error('Navigation error:', error);
        alert('Navigation error: ' + error.message);
    }
}

// Auto-save current page
function autoSavePage() {
    if (!currentWorksheet) return;

    const identifier = `${currentWorksheet.operation}-${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}-page${currentPage}`;
    const studentName = document.getElementById('student-name')?.value || getCurrentUserFullName();
    const elapsedTime = document.getElementById('elapsed-time')?.textContent || '00:00';

    // Collect canvas answers
    const canvasAnswers = [];
    currentWorksheet.problems.forEach((problem, index) => {
        const canvas = document.getElementById(`answer-${index}`);
        if (canvas && canvas.toDataURL) {
            canvasAnswers.push({
                index: index,
                imageData: canvas.toDataURL('image/png')
            });
        }
    });

    const data = {
        completed: false,
        elapsedTime: elapsedTime,
        studentName: studentName,
        canvasAnswers: canvasAnswers,
        buttonAnswers: {},
        checkboxAnswers: {}
    };

    saveWorksheetToStorage('math', identifier, data);
}

// Generate more pages
function generateMorePages() {
    totalPages += 50;
    // Reload current page to update navigation
    loadWorksheet(currentWorksheet.operation, currentWorksheet.ageGroup, currentWorksheet.difficulty, currentPage);
}
