// Math Worksheet Generator
// Note: getSelectedChild() is provided by profile-selector.js
// Note: level-mapper.js provides level conversion functions

// State variables for navigation
let selectedAgeGroup = null;  // Internal: still used for age-based content (kept for assessment)
let selectedLevel = null;     // New: level-based selection (Level 1-12)
let selectedOperation = null;
let selectedDifficulty = null;

// Level mapping helper (if level-mapper.js not loaded)
if (typeof ageAndDifficultyToLevel === 'undefined') {
    window.ageAndDifficultyToLevel = function(age, diff) {
        const map = {'4-5':{easy:1,medium:2,hard:2},'6':{easy:3,medium:4,hard:4},'7':{easy:5,medium:6,hard:6},'8':{easy:7,medium:8,hard:8},'9+':{easy:9,medium:10,hard:10},'10+':{easy:11,medium:12,hard:12}};
        return map[age]?.[diff] || 1;
    };
    window.levelToAgeGroup = function(level) {
        if (level <= 2) return '4-5';
        if (level <= 4) return '6';
        if (level <= 6) return '7';
        if (level <= 8) return '8';
        if (level <= 10) return '9+';
        return '10+';
    };
    window.levelToDifficulty = function(level) {
        if (level === 1) return 'easy';
        return level % 2 === 1 ? 'easy' : 'medium';
    };
}

// Warn before leaving page with unsaved changes
window.addEventListener('beforeunload', (event) => {
    if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = ''; // Modern browsers require this
        return ''; // Legacy browsers
    }
});

// Navigation functions
function showSubjects() {
    const subjectSelection = document.querySelector('.subject-selection');
    const ageGroups = document.getElementById('math-age-groups');
    const operations = document.getElementById('math-operations');
    const difficulties = document.getElementById('math-difficulties');

    if (subjectSelection) subjectSelection.style.display = 'block';
    if (ageGroups) ageGroups.style.display = 'none';
    if (operations) operations.style.display = 'none';
    if (difficulties) difficulties.style.display = 'none';
}

function showMathLevels() {
    // Auto-detect age from selected child profile
    let childAge = window.detectedChildAge || '6'; // Use globally stored age or default to 6

    // Map age to age group format
    const ageMap = {
        '4': '4-5',
        '5': '4-5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9+',
        '10': '10+',
        '11': '10+',
        '12': '10+',
        '13': '10+'
    };

    selectedAgeGroup = ageMap[childAge] || '6';
    console.log('Math module using auto-detected age:', childAge, '-> age group:', selectedAgeGroup);

    // Skip age selection, go directly to operations
    const subjectSelection = document.querySelector('.subject-selection');
    const operations = document.getElementById('math-operations');
    const difficulties = document.getElementById('math-difficulties');

    if (subjectSelection) subjectSelection.style.display = 'none';
    if (operations) operations.style.display = 'block';
    if (difficulties) difficulties.style.display = 'none';

    // Age-based filtering removed - all children can access all difficulty levels
}

function showMathOperations(ageGroup) {
    selectedAgeGroup = ageGroup;
    const operations = document.getElementById('math-operations');
    const difficulties = document.getElementById('math-difficulties');

    if (operations) operations.style.display = 'block';
    if (difficulties) difficulties.style.display = 'none';
}

function showMathOperationsBack() {
    const operations = document.getElementById('math-operations');
    const difficulties = document.getElementById('math-difficulties');

    if (operations) operations.style.display = 'block';
    if (difficulties) difficulties.style.display = 'none';
}

// New function to directly load worksheet from operation selection (skipping difficulty)
function loadOperationWorksheet(operation) {
    selectedOperation = operation;

    console.log('loadOperationWorksheet called:', {
        operation,
        selectedAgeGroup
    });

    // Ensure age group is set
    if (!selectedAgeGroup) {
        console.warn('selectedAgeGroup not set, auto-detecting...');
        let childAge = window.detectedChildAge || '6';
        const ageMap = {
            '4': '4-5', '5': '4-5', '6': '6', '7': '7', '8': '8',
            '9': '9+', '10': '10+', '11': '10+', '12': '10+', '13': '10+'
        };
        selectedAgeGroup = ageMap[childAge] || '6';
        console.log('Auto-set age group to:', selectedAgeGroup);
    }

    // Check if user is admin
    const isAdmin = window.currentUserRole === 'admin';

    // Check if assessment has been completed for this operation
    const child = getSelectedChild();

    // Admin users can bypass child selection and assessment
    if (isAdmin) {
        console.log('Admin user - checking level selection');

        // Check if admin has selected a specific level for Math
        const adminLevel = typeof getAdminLevelForModule === 'function' ? getAdminLevelForModule('math') : null;
        console.log('Admin selected level for Math:', adminLevel);

        if (adminLevel) {
            // Admin selected a specific level - load that level's content
            const startPage = Math.max(1, Math.floor((parseInt(adminLevel) - 1) * 12.5) + 1);
            console.log(`Admin viewing Level ${adminLevel}, starting at page ${startPage}`);

            // Set a flag so worksheet UI knows to show level indicator
            window.adminViewingLevel = adminLevel;

            loadWorksheetByPage(operation, startPage);
        } else {
            // No level selected - show all content (default behavior)
            console.log('Admin viewing all levels');
            window.adminViewingLevel = null;
            loadWorksheetByPage(operation, 1);
        }
        return;
    }

    if (!child) {
        alert('Please select a child profile first');
        return;
    }

    // Check assessment status
    const hasAssessment = hasCompletedAssessment(child.id, operation);

    if (!hasAssessment) {
        // Show assessment gate - user must take assessment first
        showAssessmentGate(operation);
    } else {
        // Assessment completed - show page navigator for all 150 pages
        const assignedLevel = getAssignedLevel(child.id, operation);
        console.log(`Assessment completed - Level ${assignedLevel} assigned`);

        // Calculate starting page based on assigned level (levels 1-12 map to pages 1-150)
        // Level 1 = page 1, Level 6 = page 50, Level 7 = page 75, Level 12 = page 150
        const startPage = Math.max(1, Math.floor((assignedLevel - 1) * 12.5) + 1);

        // Load worksheet at starting page
        loadWorksheetByPage(operation, startPage);
    }
}

/**
 * Show assessment gate - user must complete assessment to access worksheets
 */
function showAssessmentGate(operation) {
    console.log('Showing assessment gate for:', operation);

    // Hide all main sections
    const operations = document.getElementById('math-operations');
    const difficulties = document.getElementById('math-difficulties');

    if (operations) operations.style.display = 'none';
    if (difficulties) difficulties.style.display = 'none';

    const subjectSelection = document.querySelector('.subject-selection');
    if (subjectSelection) subjectSelection.style.display = 'none';

    // Hide worksheet container if visible
    const worksheetContainer = document.querySelector('.worksheet-container');
    if (worksheetContainer) worksheetContainer.style.display = 'none';

    // Hide footer
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';

    // Show assessment gate in the main container
    const container = document.querySelector('.container');
    const existingGate = document.getElementById('assessment-gate');

    if (existingGate) {
        existingGate.remove();
    }

    const gateHTML = `
        <div id="assessment-gate" class="assessment-gate">
            <div class="gate-content">
                <div class="gate-icon">🔒</div>
                <h2>Assessment Required</h2>
                <p class="gate-message">
                    Before starting ${operation} practice, we need to find the right level for you!
                </p>
                <p class="gate-description">
                    You'll solve 10 simple problems, and we'll recommend the best starting level.
                    This helps ensure you're challenged but not frustrated.
                </p>
                <div class="gate-info">
                    <div class="info-item">
                        <span class="info-icon">📝</span>
                        <span>10 Questions</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">⏱️</span>
                        <span>~5 Minutes</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">🤖</span>
                        <span>AI Grading</span>
                    </div>
                </div>
                <div class="gate-actions">
                    <button class="take-assessment-btn" onclick="startAssessmentFromGate('${operation}')">
                        🚀 Take Assessment
                    </button>
                    <button class="gate-back-btn" onclick="backToOperations()">
                        ← Back to Operations
                    </button>
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', gateHTML);
}

/**
 * Start assessment from the gate screen
 */
function startAssessmentFromGate(operation) {
    // Remove gate
    const gate = document.getElementById('assessment-gate');
    if (gate) {
        gate.remove();
    }

    // Start assessment
    if (typeof startAssessment === 'function') {
        startAssessment(operation, operation, selectedAgeGroup);
    } else {
        alert('Assessment system not available. Please refresh the page.');
    }
}

/**
 * Go back to operations selection
 */
function backToOperations() {
    const gate = document.getElementById('assessment-gate');
    if (gate) {
        gate.remove();
    }

    // Show footer again
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'block';

    // Show operations
    const operations = document.getElementById('math-operations');
    if (operations) operations.style.display = 'block';
}

function updateDifficultyDescriptions() {
    if (!selectedAgeGroup || !selectedOperation) return;

    const easyDesc = document.getElementById('easy-desc');
    const mediumDesc = document.getElementById('medium-desc');
    const hardDesc = document.getElementById('hard-desc');

    // Get configs using age+difficulty (internally maps to levels)
    const easyConfig = getConfigByAge(selectedOperation, selectedAgeGroup, 'easy');
    const mediumConfig = getConfigByAge(selectedOperation, selectedAgeGroup, 'medium');
    const hardConfig = getConfigByAge(selectedOperation, selectedAgeGroup, 'hard');

    if (easyDesc && easyConfig) easyDesc.textContent = easyConfig.description;
    if (mediumDesc && mediumConfig) mediumDesc.textContent = mediumConfig.description;
    if (hardDesc && hardConfig) hardDesc.textContent = hardConfig.description;
}

function loadWorksheetNew(difficulty) {
    selectedDifficulty = difficulty;

    // Debug logging
    console.log('loadWorksheetNew called:', {
        difficulty,
        selectedAgeGroup,
        selectedOperation,
        selectedDifficulty
    });

    // Check if all required variables are set
    if (!selectedAgeGroup) {
        console.error('selectedAgeGroup is not set! Auto-detecting now...');
        // Auto-detect if missing
        let childAge = window.detectedChildAge || '6';
        const ageMap = {
            '4': '4-5', '5': '4-5', '6': '6', '7': '7', '8': '8',
            '9': '9+', '10': '10+', '11': '10+', '12': '10+', '13': '10+'
        };
        selectedAgeGroup = ageMap[childAge] || '6';
        console.log('Auto-detected age group:', selectedAgeGroup);
    }

    if (!selectedOperation) {
        console.error('selectedOperation is not set!');
        alert('Please select an operation first (Addition, Subtraction, etc.)');
        return;
    }

    if (selectedAgeGroup && selectedOperation && selectedDifficulty) {
        console.log('Loading worksheet:', selectedOperation, selectedAgeGroup, selectedDifficulty);
        loadWorksheet(selectedOperation, selectedAgeGroup, selectedDifficulty, 1);
    } else {
        console.error('Missing required parameters:', {
            selectedAgeGroup,
            selectedOperation,
            selectedDifficulty
        });
    }
}

function backToWorksheetSelection() {
    // Hide worksheet content and show operations selection
    const worksheetContent = document.getElementById('worksheet-content');
    if (worksheetContent) {
        worksheetContent.style.display = 'none';
    }

    const operations = document.getElementById('math-operations');
    if (operations) operations.style.display = 'block';
}

let currentWorksheet = null;
let currentOperation = null;

// isDemoMode() and getDemoLimit() provided by app-constants.js
let currentPage = 1;
let currentAbsolutePage = 1; // Absolute page number (1-150)
let totalPages = 150; // Now always 150 pages (50 easy + 50 medium + 50 hard)
let timer = null;
let startTime = null;
let elapsedSeconds = 0;
let hasUnsavedChanges = false; // Track if page has been modified
let pageSubmissions = {}; // Track submitted pages: { operation: { absolutePage: { submitted, score, timestamp } } }

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
// Age-based content configs (internal - kept for backward compatibility and assessment)
// This structure is used internally but exposed as level-based to users
const ageBasedContentConfigs = {
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
                description: 'Adding numbers up to 12',
                problemCount: 20,
                generator: () => generateSimpleAddition(2, 10, 12)
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
                description: 'Adding numbers up to 25',
                problemCount: 20,
                generator: () => generateSimpleAddition(10, 20, 25)
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
                description: 'Two-digit + Two-digit (small numbers)',
                problemCount: 20,
                generator: () => generateMixedAddition(10, 50, 10, 50)
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
                description: 'Four-digit addition',
                problemCount: 20,
                generator: () => generateMixedAddition(1000, 9999, 100, 999)
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
                description: 'Subtracting within 12',
                problemCount: 20,
                generator: () => generateSimpleSubtraction(3, 12)
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
                description: 'Subtracting within 25',
                problemCount: 20,
                generator: () => generateSimpleSubtraction(10, 25)
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
                description: 'Two-digit - Two-digit (easier)',
                problemCount: 20,
                generator: () => generateMixedSubtraction(30, 99, 10, 40)
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
                description: 'Four-digit subtraction',
                problemCount: 20,
                generator: () => generateMixedSubtraction(1000, 9999, 100, 999)
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
                description: 'Multiply by 2 and 3',
                problemCount: 20,
                generator: () => generateMultiplication([2, 3], 1, 10)
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
                description: 'Multiply by 4, 5, 6',
                problemCount: 20,
                generator: () => generateMultiplication([4, 5, 6], 1, 10)
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
                description: 'Multiply by 7, 8, 9, 10',
                problemCount: 20,
                generator: () => generateMultiplication([7, 8, 9, 10], 1, 12)
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
                description: 'Two-digit × One-digit (larger)',
                problemCount: 20,
                generator: () => generateAdvancedMultiplication(20, 99, 5, 9)
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
                description: 'Two-digit × Two-digit (larger)',
                problemCount: 20,
                generator: () => generateAdvancedMultiplication(30, 99, 20, 99)
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
                description: 'Divide by 2 and 3',
                problemCount: 20,
                generator: () => generateDivision([2, 3], 1, 10)
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
                description: 'Divide by 4, 5, 6',
                problemCount: 20,
                generator: () => generateDivision([4, 5, 6], 1, 10)
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
                description: 'Divide by 7, 8, 9, 10',
                problemCount: 20,
                generator: () => generateDivision([7, 8, 9, 10], 1, 12)
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
                description: 'Two-digit ÷ One-digit (larger)',
                problemCount: 20,
                generator: () => generateAdvancedDivision(20, 99, 5, 9, false)
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
                description: 'Division with remainders (advanced)',
                problemCount: 20,
                generator: () => generateAdvancedDivision(50, 200, 6, 12, true)
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

// Convert age-based configs to level-based structure (Level 1-12)
// This provides the external-facing level-based interface while keeping age data internal
// NOTE: Medium and hard within the same age group map to the same level number.
// We prioritize 'hard' for even levels (the more challenging content for that tier).
// 'easy' always maps to odd levels. This is by design.
function buildLevelBasedConfigs() {
    const levelConfigs = {};
    // Priority order: hard > medium > easy (when multiple difficulties map to same level)
    const difficultyPriority = { 'hard': 3, 'medium': 2, 'easy': 1 };

    for (const operation in ageBasedContentConfigs) {
        levelConfigs[operation] = {};
        const ageConfigs = ageBasedContentConfigs[operation];

        for (const ageGroup in ageConfigs) {
            for (const difficulty in ageConfigs[ageGroup]) {
                const level = ageAndDifficultyToLevel(ageGroup, difficulty);
                const config = ageConfigs[ageGroup][difficulty];
                const levelKey = `level${level}`;

                // Only overwrite if this difficulty has higher priority
                const existing = levelConfigs[operation][levelKey];
                const existingPriority = existing ? (difficultyPriority[existing.difficultyEquivalent] || 0) : 0;
                const newPriority = difficultyPriority[difficulty] || 0;

                if (!existing || newPriority > existingPriority) {
                    levelConfigs[operation][levelKey] = {
                        level: level,
                        name: `Level ${level} - ${operation.charAt(0).toUpperCase() + operation.slice(1)}`,
                        description: config.description,
                        problemCount: config.problemCount,
                        generator: config.generator,
                        ageEquivalent: ageGroup,
                        difficultyEquivalent: difficulty,
                        originalName: config.name
                    };
                }
            }
        }
    }

    return levelConfigs;
}

// Build level-based configs from age-based structure
const contentConfigs = buildLevelBasedConfigs();

// Helper: Get config by level
function getConfigByLevel(operation, level) {
    return contentConfigs[operation]?.[`level${level}`];
}

// Helper: Get config by age+difficulty (backward compatibility)
function getConfigByAge(operation, ageGroup, difficulty) {
    const level = ageAndDifficultyToLevel(ageGroup, difficulty);
    return getConfigByLevel(operation, level);
}

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

/**
 * Load worksheet by absolute page number (1-150)
 * Pages 1-50: Easy
 * Pages 51-100: Medium
 * Pages 101-150: Hard
 */
function loadWorksheetByPage(operation, absolutePage) {
    // Ensure page is within bounds
    absolutePage = Math.max(1, Math.min(150, absolutePage));

    // Map absolute page to difficulty and relative page
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

    console.log(`Loading page ${absolutePage} -> ${difficulty} page ${relativePage}`);

    // Store absolute page for navigation
    currentAbsolutePage = absolutePage;

    // Use the assigned age group from assessment
    loadWorksheet(operation, selectedAgeGroup, difficulty, relativePage);
}

// Load worksheet for specific age group, difficulty, and page
function loadWorksheet(operation, ageGroup, difficulty, page = 1) {
    currentOperation = operation;
    currentPage = page;

    // Get config using age+difficulty (maps to level internally)
    const config = getConfigByAge(operation, ageGroup, difficulty);
    if (!config) {
        console.error(`No config found for: ${operation}, ${ageGroup}, ${difficulty}`);
        return;
    }

    // Initialize seeded random with page number for deterministic generation
    const seed = hashCode(`${operation}-${ageGroup}-${difficulty}-${page}`);
    seededRandom = new SeededRandom(seed);

    // Total pages is now always 150 (50 easy + 50 medium + 50 hard)
    // Old: totalPages = isDemoMode() ? 2 : 50;

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
                        <input type="text" id="student-name" value="${(() => {
                            const child = getSelectedChild();
                            return child ? child.name : getCurrentUserFullName();
                        })()}">
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

            <div class="navigation" style="margin-bottom: 20px;">
                <button onclick="backToWorksheetSelection()">← Back to Operations</button>
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
                    // Check input mode
                    const usePencil = typeof isPencilMode === 'function' ? isPencilMode() : false;

                    let answerInput;
                    if (usePencil) {
                        // Pencil mode: Canvas
                        answerInput = `
                            <div class="handwriting-input-wrapper">
                                <canvas
                                    id="answer-${index}"
                                    class="handwriting-input"
                                    data-width="100"
                                    data-height="60"
                                    style="touch-action: none;">
                                </canvas>
                                <button class="eraser-btn" onclick="clearHandwritingInput('answer-${index}')" title="Clear this answer">✕</button>
                            </div>
                        `;
                    } else {
                        // Keyboard mode: Input field
                        answerInput = `
                            <input type="number"
                                   id="answer-${index}"
                                   class="keyboard-answer-input"
                                   placeholder=""
                                   inputmode="numeric">
                        `;
                    }

                    return `
                    <div class="problem">
                        <span class="problem-number">${index + 1}.</span>
                        <div class="problem-content problem-with-handwriting">
                            <span class="problem-text">${problem.a} ${symbol} ${problem.b}</span>
                            <span class="equals">=</span>
                            ${answerInput}
                            <span class="answer-feedback" id="feedback-${index}"></span>
                        </div>
                    </div>
                `;
                }).join('')}
            </div>

            <div class="answer-key" id="answer-key" style="display: none;">
                <h3>Answer Key</h3>
                <div class="answer-key-grid">
                    ${problems.map((problem, index) => `
                        <div class="answer-item">
                            ${index + 1}. ${problem.a} ${symbol} ${problem.b} = <strong>${problem.answer}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Submit and Clear Buttons -->
            <div class="worksheet-actions" style="margin: 30px 0; display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
                <button onclick="submitWorksheet()" class="submit-worksheet-btn" style="padding: 15px 40px; font-size: 1.2em; background: linear-gradient(135deg, #4caf50, #45a049); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76, 175, 80, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(76, 175, 80, 0.3)'">
                    ✓ Submit for Evaluation
                </button>
                <button onclick="clearWorksheet()" class="clear-worksheet-btn" style="padding: 15px 30px; font-size: 1em; background: #ff9800; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 152, 0, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255, 152, 0, 0.3)'">
                    🗑️ Clear All
                </button>
                <div id="submission-status" style="padding: 10px 20px; border-radius: 8px; font-weight: bold; display: none;"></div>
            </div>

            <div class="page-navigation" style="margin: 30px 0; display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;">
                <button onclick="navigateAbsolutePage(-10)" ${currentAbsolutePage <= 10 ? 'disabled' : ''} title="Go back 10 pages">⏪ -10</button>
                <button onclick="navigateAbsolutePage(-1)" ${currentAbsolutePage <= 1 ? 'disabled' : ''} title="Previous page">← Prev</button>
                <span id="page-counter" class="page-counter">
                    Page ${currentAbsolutePage} of 150
                </span>
                <button onclick="navigateAbsolutePage(1)" ${currentAbsolutePage >= 150 ? 'disabled' : ''} title="Next page">Next →</button>
                <button onclick="navigateAbsolutePage(10)" ${currentAbsolutePage >= 141 ? 'disabled' : ''} title="Go forward 10 pages">+10 ⏩</button>
            </div>

            <div class="navigation" style="margin-top: 20px;">
                <div id="answer-toggle-container" class="answer-toggle-container" style="margin-bottom: 20px;">
                    <span class="answer-toggle-label">Show Answers</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="answer-toggle-input" onchange="toggleMathAnswers(event)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    // Hide navigation and show worksheet in container
    const ageGroups = document.getElementById('math-age-groups');
    const operations = document.getElementById('math-operations');
    const difficulties = document.getElementById('math-difficulties');
    const subjectSelection = document.querySelector('.subject-selection');

    if (ageGroups) ageGroups.style.display = 'none';
    if (operations) operations.style.display = 'none';
    if (difficulties) difficulties.style.display = 'none';
    if (subjectSelection) subjectSelection.style.display = 'none';

    // Get or create worksheet container
    let worksheetContainer = document.getElementById('worksheet-content');
    if (!worksheetContainer) {
        worksheetContainer = document.createElement('div');
        worksheetContainer.id = 'worksheet-content';
        document.body.appendChild(worksheetContainer);
    }

    worksheetContainer.innerHTML = html;
    worksheetContainer.style.display = 'block';

    // Show admin level indicator if admin has selected a specific level
    if (typeof showAdminLevelIndicator === 'function') {
        const worksheetInnerContainer = worksheetContainer.querySelector('.worksheet-container');
        if (worksheetInnerContainer) {
            showAdminLevelIndicator('math', worksheetInnerContainer);
        }
    }

    // Initialize handwriting inputs
    setTimeout(() => {
        initializeAllHandwritingInputs();
        // Load saved worksheet after inputs are initialized
        setTimeout(() => {
            loadSavedWorksheet();

            // Load submission data for current child
            loadPageSubmissions();

            // Add change tracking to all inputs
            addChangeTracking();

            // Update submission status display
            updateSubmissionStatusDisplay();

            // Update navigation buttons based on completion
            updateNavigationButtons();

            // Validate show answers toggle
            setTimeout(() => validateShowAnswersToggle(), 100);
        }, 200);
    }, 100);

    // Reset unsaved changes flag
    hasUnsavedChanges = false;

    // Reset timer
    elapsedSeconds = 0;
    updateTimerDisplay();
}

/**
 * Add change tracking to all answer inputs
 */
function addChangeTracking() {
    const totalProblems = currentWorksheet.problems.length;
    const usePencil = typeof isPencilMode === 'function' ? isPencilMode() : false;

    for (let i = 0; i < totalProblems; i++) {
        const answerElement = document.getElementById(`answer-${i}`);
        if (!answerElement) continue;

        if (usePencil) {
            // For canvas, track drawing events
            answerElement.addEventListener('pointerdown', () => {
                markAsChanged();
                setTimeout(() => validateShowAnswersToggle(), 100);
            });
            answerElement.addEventListener('touchstart', () => {
                markAsChanged();
                setTimeout(() => validateShowAnswersToggle(), 100);
            });
        } else {
            // For input fields, track input events
            answerElement.addEventListener('input', () => {
                markAsChanged();
                validateShowAnswersToggle();
            });
            answerElement.addEventListener('change', () => {
                markAsChanged();
                validateShowAnswersToggle();
            });
        }
    }
}

/**
 * Update submission status display for current page
 */
function updateSubmissionStatusDisplay() {
    const operation = currentWorksheet.operation;
    const submission = pageSubmissions[operation]?.[currentAbsolutePage];

    const statusDiv = document.getElementById('submission-status');
    const submitBtn = document.querySelector('.submit-worksheet-btn');
    const pageCounter = document.getElementById('page-counter');

    if (submission && submission.submitted) {
        // Page has been submitted
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.style.background = submission.score >= 80 ? '#4caf50' : submission.score >= 60 ? '#ff9800' : '#f44336';
            statusDiv.style.color = 'white';
            statusDiv.innerHTML = `
                ✓ Done! Score: ${submission.correctCount}/${submission.totalProblems} (${submission.score}%)
                ${submission.score >= 80 ? '🌟' : submission.score >= 60 ? '👍' : '💪'}
            `;
        }

        if (submitBtn) {
            submitBtn.textContent = '✓ Resubmit';
        }

        // Add "Done" badge to page counter
        if (pageCounter) {
            pageCounter.innerHTML = `
                Page ${currentAbsolutePage} of 150
                <span style="margin-left: 10px; padding: 3px 8px; background: #4caf50; color: white; border-radius: 5px; font-size: 0.9em;">✓ Done</span>
            `;
        }
    } else {
        // Page not submitted yet
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }

        if (submitBtn) {
            submitBtn.textContent = '✓ Submit for Evaluation';
        }

        // Remove "Done" badge
        if (pageCounter) {
            pageCounter.textContent = `Page ${currentAbsolutePage} of 150`;
        }
    }
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
async function checkAnswers() {
    stopTimer();

    const total = currentWorksheet.problems.length;
    let correct = 0;
    let checked = 0;

    // Show loading indicator
    const resultsDiv = document.getElementById('results-summary');
    resultsDiv.innerHTML = `
        <h3>🤖 Checking Answers with AI...</h3>
        <p>Recognizing your handwriting, please wait...</p>
    `;
    resultsDiv.style.display = 'block';

    // Ensure handwriting model is loaded
    try {
        if (typeof loadHandwritingModel !== 'undefined') {
            await loadHandwritingModel();
        } else {
            console.warn('Handwriting recognition not available - showing answers only');
            checkAnswersManual();
            return;
        }
    } catch (error) {
        console.error('Failed to load handwriting model:', error);
        checkAnswersManual();
        return;
    }

    // Check each answer
    for (let index = 0; index < currentWorksheet.problems.length; index++) {
        const problem = currentWorksheet.problems[index];
        const canvas = document.getElementById(`answer-${index}`);
        const feedback = document.getElementById(`feedback-${index}`);
        const correctAnswer = problem.answer;

        if (!canvas || !feedback) continue;

        try {
            // Recognize handwritten digit
            const result = await recognizeDigit(canvas);

            if (result.isEmpty) {
                // Canvas is empty - show as unanswered
                feedback.textContent = `? (empty)`;
                feedback.style.color = '#999';
                feedback.style.fontSize = '1.2em';
                feedback.style.fontWeight = 'bold';
                feedback.style.display = 'inline';

                // Add empty indicator to canvas
                canvas.style.border = '2px dashed #999';
            } else if (result.error) {
                // Error recognizing
                feedback.textContent = `✓ ${correctAnswer} (recognition failed)`;
                feedback.style.color = '#ff9800';
                feedback.style.fontSize = '1.2em';
                feedback.style.fontWeight = 'bold';
                feedback.style.display = 'inline';
            } else {
                // Successfully recognized
                checked++;
                const recognizedDigit = result.digit;
                const isCorrect = recognizedDigit === correctAnswer;

                if (isCorrect) {
                    correct++;
                    feedback.textContent = `✓ Correct! (${recognizedDigit})`;
                    feedback.style.color = '#4caf50';
                    canvas.style.border = '3px solid #4caf50';
                    canvas.style.backgroundColor = '#e8f5e9';
                } else {
                    feedback.textContent = `✗ Wrong (saw ${recognizedDigit}, answer is ${correctAnswer})`;
                    feedback.style.color = '#f44336';
                    canvas.style.border = '3px solid #f44336';
                    canvas.style.backgroundColor = '#ffebee';
                }

                feedback.style.fontSize = '1.2em';
                feedback.style.fontWeight = 'bold';
                feedback.style.display = 'inline';

                // Log confidence for debugging
                console.log(`Problem ${index + 1}: Recognized ${recognizedDigit}, Correct ${correctAnswer}, Confidence ${(result.confidence * 100).toFixed(1)}%`);
            }
        } catch (error) {
            console.error(`Error checking answer ${index}:`, error);
            feedback.textContent = `✓ ${correctAnswer} (error)`;
            feedback.style.color = '#ff9800';
            feedback.style.fontSize = '1.2em';
            feedback.style.fontWeight = 'bold';
            feedback.style.display = 'inline';
        }
    }

    // Show results
    const percentage = checked > 0 ? Math.round((correct / checked) * 100) : 0;
    const timeText = document.getElementById('elapsed-time').textContent;

    let resultMessage = '';
    if (checked === 0) {
        resultMessage = `<p style="font-size: 1.2em; color: #999;">No answers to check. Please write your answers on the canvas.</p>`;
    } else if (percentage === 100) {
        resultMessage = `<p style="font-size: 1.4em; color: #4caf50;">🎉 Perfect Score! All ${correct} correct!</p>`;
    } else if (percentage >= 80) {
        resultMessage = `<p style="font-size: 1.2em; color: #4caf50;">Great job! ${correct} out of ${checked} correct (${percentage}%)</p>`;
    } else if (percentage >= 60) {
        resultMessage = `<p style="font-size: 1.2em; color: #ff9800;">Good effort! ${correct} out of ${checked} correct (${percentage}%)</p>`;
    } else {
        resultMessage = `<p style="font-size: 1.2em; color: #f44336;">Keep practicing! ${correct} out of ${checked} correct (${percentage}%)</p>`;
    }

    resultsDiv.innerHTML = `
        <h3>✅ Results</h3>
        ${resultMessage}
        <p style="font-size: 0.9em; color: #666;">Time: ${timeText}</p>
        <p style="font-size: 0.8em; color: #999; margin-top: 10px;">
            ℹ️ Handwriting recognized by AI. If results seem incorrect, try writing more clearly.
        </p>
    `;
    resultsDiv.style.display = 'block';
}

// Fallback function if handwriting recognition is not available
function checkAnswersManual() {
    stopTimer();

    const total = currentWorksheet.problems.length;

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

    // Get child name for filename
    const child = getSelectedChild();
    const childName = child ? child.name.replace(/\s+/g, '_') : 'Student';

    const operationName = currentWorksheet.operation.charAt(0).toUpperCase() + currentWorksheet.operation.slice(1);
    const filename = `${operationName}_${childName}_${currentWorksheet.ageGroup}_${currentWorksheet.difficulty}_Page${currentPage}_${year}${month}${day}_${hours}${minutes}${seconds}.pdf`;

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

// Toggle answer visibility - REMOVED (Show answers feature removed from Math)

// Save current worksheet
function saveCurrentWorksheet() {
    if (!currentWorksheet) {
        alert('No worksheet to save');
        return;
    }

    const identifier = `${currentWorksheet.operation}-${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}-page${currentPage}`;
    const child = getSelectedChild();
    const studentName = document.getElementById('student-name')?.value || (child ? child.name : getCurrentUserFullName());
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
async function loadSavedWorksheet() {
    if (!currentWorksheet) return;

    const identifier = `${currentWorksheet.operation}-${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}-page${currentPage}`;
    // Use the Firebase storage function explicitly to avoid naming collision
    const savedData = await loadWorksheetFromFirestore('math', identifier);

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

// Validate show answers toggle - REMOVED (Show answers feature removed from Math)

function clearAllAnswers() {
    if (!currentWorksheet) return;

    if (confirm('Clear all your answers? This cannot be undone.')) {
        // Clear all canvases
        clearAllHandwritingInputs();

        // Reset timer
        stopTimer();
        elapsedSeconds = 0;
        updateTimerDisplay();
    }
}

// Update completion badge on level selection screen
function updateCompletionBadge(operation, ageGroup, difficulty) {
    console.log(`Worksheet ${operation}-${ageGroup}-${difficulty} marked as completed`);
}

// Navigate between pages
async function navigatePage(direction) {
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

        // Check for unsaved changes
        if (!checkUnsavedChanges()) {
            return; // User cancelled navigation
        }

        // For forward navigation, check if current page is completed (95% threshold)
        if (direction > 0) {
            const currentPageSubmission = pageSubmissions[currentWorksheet.operation]?.[currentAbsolutePage];
            if (!currentPageSubmission || !currentPageSubmission.completed) {
                alert('⚠️ Complete the current page with 95% or higher score before moving to the next page!');
                return;
            }
        }

        // Load new page
        loadWorksheet(currentWorksheet.operation, currentWorksheet.ageGroup, currentWorksheet.difficulty, newPage);
    } catch (error) {
        console.error('Navigation error:', error);
        alert('Navigation error: ' + error.message);
    }
}

/**
 * Navigate by absolute page number (1-150)
 * @param {number} offset - Number of pages to move (-10, -1, +1, +10)
 */
async function navigateAbsolutePage(offset) {
    try {
        if (!currentWorksheet) {
            alert('Error: Worksheet not loaded properly. Please reload the page.');
            return;
        }

        const newAbsolutePage = currentAbsolutePage + offset;

        // Check bounds (1-150)
        if (newAbsolutePage < 1 || newAbsolutePage > 150) {
            return;
        }

        // Check for unsaved changes
        if (!checkUnsavedChanges()) {
            return; // User cancelled navigation
        }

        // For forward navigation, check if all pages up to the current page are completed
        if (offset > 0) {
            // Check if current page is completed
            const currentPageSubmission = pageSubmissions[currentWorksheet.operation]?.[currentAbsolutePage];
            if (!currentPageSubmission || !currentPageSubmission.completed) {
                alert('⚠️ Complete the current page with 95% or higher score before jumping forward!');
                return;
            }

            // For larger jumps, check all pages in between
            if (Math.abs(offset) > 1) {
                for (let i = currentAbsolutePage + 1; i < newAbsolutePage; i++) {
                    const pageSubmission = pageSubmissions[currentWorksheet.operation]?.[i];
                    if (!pageSubmission || !pageSubmission.completed) {
                        alert(`⚠️ You must complete pages sequentially. Page ${i} is not completed yet.`);
                        return;
                    }
                }
            }
        }

        // Load new page by absolute page number
        loadWorksheetByPage(currentWorksheet.operation, newAbsolutePage);
    } catch (error) {
        console.error('Navigation error:', error);
        alert('Navigation error: ' + error.message);
    }
}

/**
 * Update navigation buttons based on completion status
 */
function updateNavigationButtons() {
    if (!currentWorksheet) return;

    const operation = currentWorksheet.operation;
    const currentPageSubmission = pageSubmissions[operation]?.[currentAbsolutePage];
    const isCurrentPageCompleted = currentPageSubmission?.completed || false;

    // Find all next buttons
    const nextButtons = document.querySelectorAll('[onclick*="navigatePage(1)"], [onclick*="navigateAbsolutePage(1)"], [onclick*="navigateAbsolutePage(10)"]');

    nextButtons.forEach(button => {
        if (!isCurrentPageCompleted) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'Complete current page with 95% score to unlock';
        } else {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.title = '';
        }
    });

    // Add completion indicator to page counter
    const pageCounter = document.getElementById('page-counter');
    if (pageCounter && currentPageSubmission) {
        const indicator = getCompletionIndicator(isCurrentPageCompleted, currentPageSubmission.score || 0);

        // Remove existing indicator
        const existingIndicator = pageCounter.querySelector('.completion-badge');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Add new indicator
        if (currentPageSubmission.submitted) {
            pageCounter.insertAdjacentHTML('beforeend', ' ' + indicator);
        }
    }
}

// Auto-save current page
function autoSavePage() {
    if (!currentWorksheet) return;

    const identifier = `${currentWorksheet.operation}-${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}-page${currentPage}`;
    const child = getSelectedChild();
    const studentName = document.getElementById('student-name')?.value || (child ? child.name : getCurrentUserFullName());
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

/**
 * Submit worksheet for evaluation
 * Checks all answers, provides feedback, and marks page as Done
 */
async function submitWorksheet() {
    if (!currentWorksheet) {
        alert('No worksheet loaded');
        return;
    }

    const submitBtn = document.querySelector('.submit-worksheet-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Evaluating...';

    // Check if using pencil mode
    const usePencil = typeof isPencilMode === 'function' ? isPencilMode() : false;

    // Load handwriting model if needed
    if (usePencil && typeof loadHandwritingModel !== 'undefined') {
        try {
            await loadHandwritingModel();
        } catch (error) {
            console.error('Failed to load handwriting model:', error);
            alert('Error loading handwriting recognition. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = '✓ Submit for Evaluation';
            return;
        }
    }

    let correctCount = 0;
    const totalProblems = currentWorksheet.problems.length;

    // Evaluate each answer
    for (let i = 0; i < totalProblems; i++) {
        const answerElement = document.getElementById(`answer-${i}`);
        const feedbackElement = document.getElementById(`feedback-${i}`);
        const correctAnswer = currentWorksheet.problems[i].answer;

        if (!answerElement || !feedbackElement) continue;

        try {
            let userAnswer = null;
            let isEmpty = false;

            if (usePencil) {
                // Pencil mode: handwriting recognition
                const result = await recognizeDigit(answerElement);
                if (result.isEmpty) {
                    isEmpty = true;
                } else if (!result.error) {
                    userAnswer = result.digit;
                }
            } else {
                // Keyboard mode: get input value
                const value = answerElement.value.trim();
                if (value === '') {
                    isEmpty = true;
                } else {
                    // Handle string answers (fractions like "3/4", remainders like "12 R3")
                    if (typeof correctAnswer === 'string') {
                        userAnswer = value; // Keep as string for comparison
                    } else {
                        userAnswer = parseInt(value);
                    }
                }
            }

            // Provide feedback
            if (isEmpty) {
                feedbackElement.textContent = '⚠️ Empty';
                feedbackElement.style.color = '#999';
                answerElement.style.borderColor = '#999';
            } else if (userAnswer === null || (typeof correctAnswer !== 'string' && isNaN(userAnswer))) {
                feedbackElement.textContent = `Answer: ${correctAnswer}`;
                feedbackElement.style.color = '#ff9800';
                answerElement.style.borderColor = '#ff9800';
            } else if (typeof correctAnswer === 'string'
                ? String(userAnswer).replace(/\s+/g, '').toLowerCase() === String(correctAnswer).replace(/\s+/g, '').toLowerCase()
                : userAnswer === correctAnswer) {
                correctCount++;
                feedbackElement.textContent = '✓ Correct!';
                feedbackElement.style.color = '#4caf50';
                feedbackElement.style.fontWeight = 'bold';
                answerElement.style.borderColor = '#4caf50';
                answerElement.style.borderWidth = '3px';
            } else {
                feedbackElement.textContent = `✗ Wrong (${correctAnswer})`;
                feedbackElement.style.color = '#f44336';
                feedbackElement.style.fontWeight = 'bold';
                answerElement.style.borderColor = '#f44336';
                answerElement.style.borderWidth = '3px';
            }

            feedbackElement.style.display = 'inline-block';
            feedbackElement.style.marginLeft = '10px';

        } catch (error) {
            console.error(`Error evaluating answer ${i}:`, error);
            feedbackElement.textContent = `Answer: ${correctAnswer}`;
            feedbackElement.style.color = '#ff9800';
        }
    }

    // Calculate score
    const score = Math.round((correctCount / totalProblems) * 100);

    // Check completion criteria (95% threshold for math)
    const completionResult = isPageCompleted('math', score, false);
    const isCompleted = completionResult.completed;

    // Mark page as submitted
    const operation = currentWorksheet.operation;
    if (!pageSubmissions[operation]) {
        pageSubmissions[operation] = {};
    }
    pageSubmissions[operation][currentAbsolutePage] = {
        submitted: true,
        score: score,
        correctCount: correctCount,
        totalProblems: totalProblems,
        completed: isCompleted,
        timestamp: new Date().toISOString()
    };

    // Save submissions to localStorage (for UI state)
    const child = getSelectedChild();
    if (child) {
        localStorage.setItem(`pageSubmissions_${child.id}`, JSON.stringify(pageSubmissions));
    }

    // Save completion to Firestore
    const identifier = `${operation}-level${Math.ceil(currentAbsolutePage / 10)}-page${((currentAbsolutePage - 1) % 10) + 1}`;
    const elapsedTime = document.getElementById('elapsed-time')?.textContent || '00:00';

    const completionData = {
        score: score,
        correctCount: correctCount,
        totalProblems: totalProblems,
        completed: isCompleted,
        manuallyMarked: false,
        elapsedTime: elapsedTime,
        attempts: 1
    };

    await savePageCompletion('math', identifier, completionData);

    // Update weekly assignment progress
    if (typeof onMathPageCompleted === 'function') {
        onMathPageCompleted(operation, currentAbsolutePage, score, isCompleted);
    }

    // Clear unsaved changes flag
    hasUnsavedChanges = false;

    // Show submission status with 95% threshold messaging
    const statusDiv = document.getElementById('submission-status');
    if (statusDiv) {
        statusDiv.style.display = 'block';

        if (isCompleted) {
            statusDiv.style.background = '#4caf50';
            statusDiv.style.color = 'white';
            statusDiv.innerHTML = `
                ✓ Completed! Score: ${correctCount}/${totalProblems} (${score}%)
                <span style="display: inline-block; margin-left: 10px; font-size: 1.2em;">✓</span>
                <div style="font-size: 0.95em; margin-top: 5px;">🌟 Excellent! You can now move to the next page.</div>
            `;
        } else {
            statusDiv.style.background = '#f44336';
            statusDiv.style.color = 'white';
            statusDiv.innerHTML = `
                ✓ Submitted! Score: ${correctCount}/${totalProblems} (${score}%)
                <div style="font-size: 0.95em; margin-top: 5px;">💪 ${completionResult.reason} Try again to unlock the next page!</div>
            `;
        }
    }

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = '✓ Resubmit';

    // Update navigation buttons state
    updateNavigationButtons();

    console.log(`Page ${currentAbsolutePage} submitted: ${correctCount}/${totalProblems} (${score}%) - Completed: ${isCompleted}`);
}

/**
 * Clear all answers on current worksheet
 */
function clearWorksheet() {
    if (!currentWorksheet) return;

    if (!confirm('Clear all answers on this page?')) {
        return;
    }

    const totalProblems = currentWorksheet.problems.length;
    const usePencil = typeof isPencilMode === 'function' ? isPencilMode() : false;

    for (let i = 0; i < totalProblems; i++) {
        const answerElement = document.getElementById(`answer-${i}`);
        const feedbackElement = document.getElementById(`feedback-${i}`);

        if (!answerElement) continue;

        // Clear input based on mode
        if (usePencil) {
            // Clear canvas
            if (typeof clearHandwritingInput === 'function') {
                clearHandwritingInput(`answer-${i}`);
            }
        } else {
            // Clear input field
            answerElement.value = '';
        }

        // Clear feedback
        if (feedbackElement) {
            feedbackElement.textContent = '';
            feedbackElement.style.display = 'none';
        }

        // Reset border
        answerElement.style.borderColor = '#667eea';
        answerElement.style.borderWidth = '2px';
    }

    // Clear submission status for this page
    const operation = currentWorksheet.operation;
    if (pageSubmissions[operation] && pageSubmissions[operation][currentAbsolutePage]) {
        delete pageSubmissions[operation][currentAbsolutePage];

        // Update localStorage
        const child = getSelectedChild();
        if (child) {
            localStorage.setItem(`pageSubmissions_${child.id}`, JSON.stringify(pageSubmissions));
        }
    }

    // Hide submission status
    const statusDiv = document.getElementById('submission-status');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }

    // Reset submit button
    const submitBtn = document.querySelector('.submit-worksheet-btn');
    if (submitBtn) {
        submitBtn.textContent = '✓ Submit for Evaluation';
    }

    // Mark as unsaved (empty)
    hasUnsavedChanges = false;

    console.log('Worksheet cleared');

    // Validate show answers toggle after clearing
    validateShowAnswersToggle();
}

/**
 * Toggle visibility of answer key
 */
let answersVisible = false;
function toggleMathAnswers(event) {
    const answerKey = document.getElementById('answer-key');
    if (!answerKey) return;

    if (event && event.target && event.target.checked) {
        answerKey.style.display = 'block';
        answersVisible = true;
    } else {
        answerKey.style.display = 'none';
        answersVisible = false;
    }
}

/**
 * Validate if all inputs are filled and enable/disable Show Answers toggle
 */
function validateShowAnswersToggle() {
    const toggleInput = document.getElementById('answer-toggle-input');
    const toggleContainer = document.getElementById('answer-toggle-container');

    if (!toggleInput || !toggleContainer) return;

    const usePencil = typeof isPencilMode === 'function' ? isPencilMode() : false;
    let allFieldsFilled = true;

    // Check all answer inputs
    if (currentWorksheet && currentWorksheet.problems) {
        for (let i = 0; i < currentWorksheet.problems.length; i++) {
            const answerElement = document.getElementById(`answer-${i}`);
            if (!answerElement) continue;

            if (usePencil) {
                // Check if canvas has content (using handwriting input system)
                if (typeof handwritingInputs !== 'undefined' && handwritingInputs.length > 0) {
                    const input = handwritingInputs.find(input => input.canvas.id === `answer-${i}`);
                    if (input && input.isEmpty()) {
                        allFieldsFilled = false;
                        break;
                    }
                }
            } else {
                // Check if text input has value
                if (!answerElement.value || answerElement.value.trim() === '') {
                    allFieldsFilled = false;
                    break;
                }
            }
        }
    }

    // Enable/disable toggle based on whether all fields are filled
    if (allFieldsFilled) {
        toggleInput.disabled = false;
        toggleContainer.style.opacity = '1';
        toggleContainer.style.cursor = 'pointer';
        toggleContainer.title = '';
    } else {
        toggleInput.disabled = true;
        toggleInput.checked = false;
        toggleContainer.style.opacity = '0.5';
        toggleContainer.style.cursor = 'not-allowed';
        toggleContainer.title = 'Please complete all problems to show answers';

        // Hide answers if they were visible
        if (answersVisible) {
            answersVisible = false;
            toggleMathAnswers();
        }
    }
}

/**
 * Check for unsaved changes before navigation
 */
function checkUnsavedChanges() {
    if (!hasUnsavedChanges) return true;

    return confirm('You have unsaved changes. Leave without submitting?');
}

/**
 * Track input changes to detect unsaved work
 */
function markAsChanged() {
    hasUnsavedChanges = true;
}

/**
 * Load submission data for current child
 */
function loadPageSubmissions() {
    const child = getSelectedChild();
    if (!child) return;

    const stored = localStorage.getItem(`pageSubmissions_${child.id}`);
    if (stored) {
        try {
            pageSubmissions = JSON.parse(stored);
        } catch (error) {
            console.error('Error loading submissions:', error);
            pageSubmissions = {};
        }
    }
}

