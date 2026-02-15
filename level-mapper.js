// Level-Based Learning System
// Maps content from age-based structure to Level 1-12 system

// ============================================================================
// LEVEL MAPPING STRUCTURE
// ============================================================================
// Level 1:  Age 4-5 Easy (Basic foundations)
// Level 2:  Age 4-5 Medium/Hard (Pre-K advanced)
// Level 3:  Age 6 Easy (Kindergarten basics)
// Level 4:  Age 6 Medium/Hard (Kindergarten advanced)
// Level 5:  Age 7 Easy (1st grade basics)
// Level 6:  Age 7 Medium/Hard (1st grade advanced)
// Level 7:  Age 8 Easy (2nd grade basics)
// Level 8:  Age 8 Medium/Hard (2nd grade advanced)
// Level 9:  Age 9+ Easy (3rd-4th grade basics)
// Level 10: Age 9+ Medium/Hard (3rd-4th grade advanced)
// Level 11: Age 10+ Easy/Medium (Advanced basics)
// Level 12: Age 10+ Hard (Pre-teen advanced)
// ============================================================================

// Convert age group + difficulty to level number
function ageAndDifficultyToLevel(ageGroup, difficulty) {
    const mapping = {
        '4-5': {
            'easy': 1,
            'medium': 2,
            'hard': 2,
            'writing': 1  // Writing practice maps to easy level
        },
        '6': {
            'easy': 3,
            'medium': 4,
            'hard': 4,
            'writing': 3  // Writing practice maps to easy level
        },
        '7': {
            'easy': 5,
            'medium': 6,
            'hard': 6,
            'writing': 5  // Writing practice maps to easy level
        },
        '8': {
            'easy': 7,
            'medium': 8,
            'hard': 8,
            'writing': 7  // Writing practice maps to easy level
        },
        '9+': {
            'easy': 9,
            'medium': 10,
            'hard': 10,
            'writing': 9  // Writing practice maps to easy level
        },
        '10+': {
            'easy': 11,
            'medium': 12,
            'hard': 12,
            'writing': 11  // Writing practice maps to easy level
        }
    };

    return mapping[ageGroup]?.[difficulty] || 1;
}

// Convert level number to age group (for backward compatibility)
function levelToAgeGroup(level) {
    if (level <= 2) return '4-5';
    if (level <= 4) return '6';
    if (level <= 6) return '7';
    if (level <= 8) return '8';
    if (level <= 10) return '9+';
    return '10+';
}

// Convert level number to difficulty (for backward compatibility)
function levelToDifficulty(level) {
    // Odd levels = easy, Even levels = medium/hard
    if (level === 1) return 'easy';
    if (level % 2 === 1) return 'easy';
    return 'medium'; // We'll use medium for most even levels
}

// Convert level number to display name
function getLevelDisplayName(level) {
    const names = {
        1: 'Level 1 - Basic Foundations',
        2: 'Level 2 - Pre-K Advanced',
        3: 'Level 3 - Kindergarten Basics',
        4: 'Level 4 - Kindergarten Advanced',
        5: 'Level 5 - 1st Grade Basics',
        6: 'Level 6 - 1st Grade Advanced',
        7: 'Level 7 - 2nd Grade Basics',
        8: 'Level 8 - 2nd Grade Advanced',
        9: 'Level 9 - 3rd Grade Basics',
        10: 'Level 10 - 4th Grade Advanced',
        11: 'Level 11 - Advanced Basics',
        12: 'Level 12 - Pre-Teen Advanced'
    };
    return names[level] || `Level ${level}`;
}

// Convert level number to short display name
function getLevelShortName(level) {
    return `Level ${level}`;
}

// Get level description
function getLevelDescription(level) {
    const descriptions = {
        1: 'Basic foundations for early learners',
        2: 'Advanced pre-kindergarten content',
        3: 'Kindergarten level basics',
        4: 'Advanced kindergarten content',
        5: 'First grade fundamentals',
        6: 'Advanced first grade content',
        7: 'Second grade fundamentals',
        8: 'Advanced second grade content',
        9: 'Third grade level content',
        10: 'Fourth grade level content',
        11: 'Advanced elementary content',
        12: 'Pre-teen advanced content'
    };
    return descriptions[level] || `Level ${level} content`;
}

// Get all levels
function getAllLevels() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}

// Get levels for a specific age (for initial assessment suggestion)
function getSuggestedLevelsForAge(age) {
    const ageNum = parseInt(age);
    if (ageNum <= 5) return [1, 2];
    if (ageNum === 6) return [3, 4];
    if (ageNum === 7) return [5, 6];
    if (ageNum === 8) return [7, 8];
    if (ageNum === 9) return [9, 10];
    return [11, 12];
}

// Get recommended starting level for age (conservative estimate)
function getStartingLevelForAge(age) {
    const ageNum = parseInt(age);
    if (ageNum <= 5) return 1;
    if (ageNum === 6) return 3;
    if (ageNum === 7) return 5;
    if (ageNum === 8) return 7;
    if (ageNum === 9) return 9;
    return 11;
}

// Convert old age-based identifier to level-based identifier
// Example: "addition-6-medium" -> "addition-level4"
function oldIdentifierToNewIdentifier(oldId) {
    // Parse old identifier format
    const parts = oldId.split('-');
    if (parts.length < 3) return oldId; // Not an age-based identifier

    const operation = parts[0];
    const ageGroup = parts[1];
    const difficulty = parts[2];

    const level = ageAndDifficultyToLevel(ageGroup, difficulty);
    return `${operation}-level${level}`;
}

// Convert level-based identifier to old format (for migration)
function newIdentifierToOldIdentifier(newId) {
    const match = newId.match(/(.+)-level(\d+)/);
    if (!match) return newId;

    const operation = match[1];
    const level = parseInt(match[2]);

    const ageGroup = levelToAgeGroup(level);
    const difficulty = levelToDifficulty(level);

    return `${operation}-${ageGroup}-${difficulty}`;
}

// Check if child has access to level (for future assessment system)
// For now, returns true for all levels
function hasAccessToLevel(childProfile, module, level) {
    // Future: Check assessment results from childProfile
    // For now, all children have access to all levels
    return true;
}

// Get current level for child in a module (for future assessment system)
function getCurrentLevel(childProfile, module) {
    // Future: Get from assessment results
    // For now, use age-based suggestion
    if (childProfile && childProfile.age) {
        return getStartingLevelForAge(childProfile.age);
    }
    return 1; // Default to Level 1
}

console.log('Level mapping system loaded - 12 levels available');
