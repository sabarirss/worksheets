// Aptitude & Logic Puzzles - Complete with Difficulty Levels


let currentAge = null;
let currentType = null;
let currentDifficulty = null;
let currentWorksheet = null;
let currentPage = 1;
let totalPages = 50;
let timer = null;
let startTime = null;
let elapsedSeconds = 0;
let answersVisible = false;

// isDemoMode() and getDemoLimit() provided by app-constants.js

// Utility: Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Navigation
function selectAge(age) {
    currentAge = age;
    const ageSelection = document.getElementById('age-selection');
    const typeSelection = document.getElementById('type-selection');

    if (ageSelection) ageSelection.style.display = 'none';
    if (typeSelection) typeSelection.style.display = 'block';
}

function backToAges() {
    // Redirect to home page since there's no age selection in aptitude.html
    window.location.href = 'index.html';
}

function selectType(type) {
    currentType = type;
    const names = {
        patterns: '🔷 Patterns', counting: '🔢 Counting',
        sequences: '➡️ Sequences', matching: '🔗 Matching', oddone: '👀 Odd One Out',
        comparison: '📏 Comparison', logic: '🤔 Logic Puzzles'
    };
    document.getElementById('type-selection').style.display = 'none';
    // Skip difficulty selection and load puzzles directly at page 1
    loadPuzzles('easy', 1);
}

function backToTypes() {
    const worksheetContent = document.getElementById('worksheet-content');
    if (worksheetContent) {
        worksheetContent.style.display = 'none';
    }
    document.getElementById('type-selection').style.display = 'block';
}

function backToWorksheetSelection() {
    // Hide worksheet content and show type selection
    const worksheetContent = document.getElementById('worksheet-content');
    if (worksheetContent) {
        worksheetContent.style.display = 'none';
    }
    document.getElementById('type-selection').style.display = 'block';
}

// Complex Maze Generation
function generateComplexMaze(difficulty) {
    const width = difficulty === 'easy' ? 300 : difficulty === 'medium' ? 400 : 500;
    const height = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 250 : 300;

    let paths = [];

    if (difficulty === 'easy') {
        // Simple curved path with 1-2 dead ends
        paths.push({
            correct: true,
            d: `M 10 ${height/2} Q 80 30, 150 ${height/2} Q 220 ${height-30}, ${width-10} ${height/2}`,
            color: '#bbb'
        });
        paths.push({
            correct: false,
            d: `M 10 ${height/2} Q 60 ${height-20}, 100 ${height-20}`,
            color: '#ddd'
        });
    } else if (difficulty === 'medium') {
        // Spiral path with 3-4 dead ends
        paths.push({
            correct: true,
            d: `M 10 ${height/2} C 60 20, 100 ${height-20}, 150 ${height/2} C 200 40, 250 ${height-40}, 300 ${height/2} Q 350 ${height-60}, ${width-10} ${height/2}`,
            color: '#aaa'
        });
        paths.push({
            correct: false,
            d: `M 10 ${height/2} Q 50 ${height-30}, 90 ${height-40}`,
            color: '#ccc'
        });
        paths.push({
            correct: false,
            d: `M 150 ${height/2} Q 180 20, 200 10`,
            color: '#ccc'
        });
        paths.push({
            correct: false,
            d: `M 300 ${height/2} Q 320 ${height-20}, 340 ${height-30}`,
            color: '#ccc'
        });
    } else {
        // Very complex with many turns and 5-6 dead ends
        paths.push({
            correct: true,
            d: `M 10 ${height/2} C 40 20, 70 ${height-20}, 100 60 C 130 30, 160 ${height-30}, 190 80 C 220 40, 250 ${height-20}, 280 70 C 310 35, 350 ${height-40}, 380 90 Q 430 ${height-70}, ${width-10} ${height/2}`,
            color: '#999'
        });
        // Multiple dead ends at various points
        paths.push({ correct: false, d: `M 10 ${height/2} Q 30 ${height-40}, 50 ${height-50}`, color: '#ccc' });
        paths.push({ correct: false, d: `M 100 60 Q 120 10, 140 5`, color: '#ccc' });
        paths.push({ correct: false, d: `M 190 80 Q 210 ${height-10}, 230 ${height-5}`, color: '#ccc' });
        paths.push({ correct: false, d: `M 280 70 Q 300 20, 320 10`, color: '#ccc' });
        paths.push({ correct: false, d: `M 380 90 Q 400 ${height-15}, 420 ${height-10}`, color: '#ccc' });
    }

    return { width, height, paths };
}

// Puzzle Generators
function generateMazePuzzles(count, difficulty) {
    const themes = [
        { start: '🐱', end: '🐭' }, { start: '🐝', end: '🌻' }, { start: '🐶', end: '🦴' },
        { start: '🐸', end: '🪰' }, { start: '🐻', end: '🍯' }, { start: '🐟', end: '🌊' }
    ];

    return themes.slice(0, count).map((theme, i) => {
        const maze = generateComplexMaze(difficulty);
        return {
            type: 'maze',
            ...theme,
            maze,
            answer: 'completed'
        };
    });
}

function generatePatternPuzzles(count, difficulty, age) {
    // Map age to age group
    const ageGroup = ageGroupMap[age ? age.toString() : '6'] || '6';

    // Load age-based patterns from aptitude-age-content.js
    let patterns = [];
    // Get patterns using age+difficulty (maps to level internally)
    if (typeof getPatternsByAge !== 'undefined') {
        patterns = getPatternsByAge(ageGroup, difficulty);
    }

    if (patterns.length === 0) {
        // Fallback to hardcoded patterns if age-based content not available
        if (difficulty === 'easy') {
            patterns = [
                { pattern: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢'], reason: 'Pattern alternates: red, blue, red, blue...' },
                { pattern: ['⭐', '🌙', '⭐', '🌙'], answer: '⭐', options: ['⭐', '🌙', '☀️'], reason: 'Pattern alternates: star, moon, star, moon...' },
                { pattern: ['🍎', '🍊', '🍎', '🍊'], answer: '🍎', options: ['🍎', '🍊', '🍋'], reason: 'Pattern alternates: apple, orange, apple, orange...' },
                { pattern: ['😊', '😢', '😊', '😢'], answer: '😊', options: ['😊', '😢', '😡'], reason: 'Pattern alternates: happy, sad, happy, sad...' },
                { pattern: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', options: ['🐶', '🐱', '🐭'], reason: 'Pattern alternates: dog, cat, dog, cat...' },
                { pattern: ['🌞', '🌙', '🌞', '🌙'], answer: '🌞', options: ['🌞', '🌙', '⭐'], reason: 'Pattern alternates: sun, moon, sun, moon...' },
                { pattern: ['🔺', '⭕', '🔺', '⭕'], answer: '🔺', options: ['🔺', '⭕', '⬜'], reason: 'Pattern alternates: triangle, circle, triangle, circle...' },
                { pattern: ['🚗', '🚌', '🚗', '🚌'], answer: '🚗', options: ['🚗', '🚌', '🚕'], reason: 'Pattern alternates: car, bus, car, bus...' }
            ];
        } else if (difficulty === 'medium') {
            patterns = [
                { pattern: ['🔴', '🔴', '🔵', '🔴', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Pattern groups: two reds, one blue, two reds, one blue...' },
                { pattern: ['⭐', '🌙', '🌙', '⭐', '🌙'], answer: '🌙', options: ['⭐', '🌙', '☀️', '💫'], reason: 'Pattern groups: star, two moons, star, two moons...' },
                { pattern: ['🍎', '🍊', '🍋', '🍎', '🍊'], answer: '🍋', options: ['🍎', '🍊', '🍋', '🍇'], reason: 'Pattern cycles through 3: apple, orange, lemon, apple, orange...' },
                { pattern: ['😊', '😊', '😊', '😢', '😊'], answer: '😊', options: ['😊', '😢', '😡', '🤔'], reason: 'Pattern groups: three happy, one sad, three happy...' },
                { pattern: ['🐶', '🐱', '🐭', '🐶', '🐱'], answer: '🐭', options: ['🐶', '🐱', '🐭', '🐰'], reason: 'Pattern cycles through 3: dog, cat, mouse, dog, cat...' },
                { pattern: ['1️⃣', '2️⃣', '2️⃣', '1️⃣', '2️⃣'], answer: '2️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Pattern groups: one, two twos, one, two twos...' },
                { pattern: ['🔺', '🔺', '⭕', '⭕', '🔺'], answer: '🔺', options: ['🔺', '⭕', '⬜', '🔶'], reason: 'Pattern groups: two triangles, two circles, two triangles...' },
                { pattern: ['🌸', '🌺', '🌻', '🌷', '🌸'], answer: '🌺', options: ['🌸', '🌺', '🌻', '🌷'], reason: 'Pattern cycles through 4 flowers in order' },
                { pattern: ['A', 'B', 'C', 'A', 'B'], answer: 'C', options: ['A', 'B', 'C', 'D'], reason: 'Pattern cycles through ABC sequence' },
                { pattern: ['🟦', '🟥', '🟥', '🟦', '🟥'], answer: '🟥', options: ['🟦', '🟥', '🟩', '🟨'], reason: 'Pattern groups: blue, two reds, blue, two reds...' }
            ];
        } else {
            patterns = [
                { pattern: ['🔴', '🔵', '🔵', '🔴', '🔴', '🔴'], answer: '🔵', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Growing pattern: 1 red, 2 blues, 3 reds, next is blues' },
                { pattern: ['⭐', '🌙', '⭐', '⭐', '🌙', '⭐'], answer: '⭐', options: ['⭐', '🌙', '☀️', '💫'], reason: 'Complex: star-moon-stars pattern increases' },
                { pattern: ['🍎', '🍊', '🍊', '🍋', '🍋', '🍋'], answer: '🍎', options: ['🍎', '🍊', '🍋', '🍇'], reason: 'Each fruit appears one more time, then restart' },
                { pattern: ['😊', '😊', '😢', '😡', '😡', '😡'], answer: '😢', options: ['😊', '😢', '😡', '🤔'], reason: 'Pattern: 2 happy, 1 sad, 3 angry, then decreases back' },
                { pattern: ['🐶', '🐱', '🐭', '🐭', '🐱', '🐱'], answer: '🐶', options: ['🐶', '🐱', '🐭', '🐰'], reason: 'Reverse countdown: dog-cat-2mice-2cats-next is dogs' },
                { pattern: ['1️⃣', '1️⃣', '2️⃣', '2️⃣', '2️⃣', '3️⃣'], answer: '3️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], reason: 'Numbers increase: 2 ones, 3 twos, next is threes' },
                { pattern: ['🔺', '⭕', '⭕', '⬜', '⬜', '⬜'], answer: '🔺', options: ['🔺', '⭕', '⬜', '🔶'], reason: 'Each shape appears one more time, then cycle restarts' },
                { pattern: ['🌸', '🌺', '🌺', '🌻', '🌻', '🌻'], answer: '🌷', options: ['🌸', '🌺', '🌻', '🌷'], reason: 'Growing sequence: 1 flower, 2 flowers, 3 flowers, next 4' },
                { pattern: ['A', 'B', 'B', 'C', 'C', 'C'], answer: 'D', options: ['A', 'B', 'C', 'D'], reason: 'Increasing pattern: A once, B twice, C thrice, D four times' },
                { pattern: ['🟦', '🟥', '🟥', '🟩', '🟩', '🟩'], answer: '🟨', options: ['🟦', '🟥', '🟩', '🟨'], reason: 'Each color appears one more time than the last' },
                { pattern: ['⬆️', '➡️', '⬇️', '⬇️', '➡️', '➡️'], answer: '⬆️', options: ['⬆️', '➡️', '⬇️', '⬅️'], reason: 'Arrows rotate and repeat: up-right-2downs-2rights-3ups' },
                { pattern: ['🔴', '🔵', '🔴', '🟢', '🔴', '🟡'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'], reason: 'Red appears every other position, others change' }
            ];
        }
    }

    return patterns.slice(0, count).map(p => ({
        type: 'pattern',
        pattern: p.pattern,
        answer: p.answer,
        options: p.options,
        reason: p.reason || 'Pattern repeats'
    }));
}

function generateCountingPuzzles(count, difficulty, age) {
    // Map age to age group
    const ageGroup = ageGroupMap[age ? age.toString() : '6'] || '6';

    // Load counting configuration (maps age to level internally)
    let config;
    if (typeof getCountingByAge !== 'undefined') {
        config = getCountingByAge(ageGroup, difficulty);
    }

    if (!config) {
        // Fallback configuration
        config = {
            range: { min: 3, max: 20 },
            items: ['🍎', '⭐', '🐶', '🌸', '🎈', '🐝', '🍪', '🦋']
        };
    }

    const { min, max } = config.range;

    // Generate counting puzzles with age-appropriate numbers
    const puzzles = [];
    for (let i = 0; i < count; i++) {
        const itemEmoji = config.items[i % config.items.length];
        const qty = Math.floor(Math.random() * (max - min + 1)) + min;

        puzzles.push({
            type: 'counting',
            emoji: itemEmoji,
            quantity: qty,
            label: getLabelFromEmoji(itemEmoji),
            answer: String(qty)
        });
    }

    return puzzles;
}

// Helper function to get label from emoji
function getLabelFromEmoji(emoji) {
    const emojiLabels = {
        '🍎': 'apples', '⭐': 'stars', '🐶': 'dogs', '🌸': 'flowers',
        '🚗': 'cars', '🏠': 'houses', '🎈': 'balloons', '🍪': 'cookies',
        '🐱': 'cats', '🦋': 'butterflies', '🎨': 'art supplies', '📚': 'books',
        '⚽': 'balls', '🎵': 'music notes', '🌈': 'rainbows', '🎯': 'targets',
        '🎭': 'masks', '🎪': 'tents', '🎬': 'clappers', '🎤': 'microphones',
        '🎲': 'dice', '🎰': 'slots', '🎳': 'pins', '🎮': 'games', '🎹': 'keyboards',
        '🔢': 'numbers', '💯': 'hundreds', '📊': 'charts', '📈': 'graphs',
        '💰': 'money', '🏆': 'trophies', '🌟': 'stars', '✨': 'sparkles',
        '💎': 'gems', '🔷': 'diamonds', '🔶': 'shapes', '🔹': 'symbols',
        '🔸': 'marks', '💠': 'badges', '🧮': 'abacuses', '📐': 'rulers',
        '📏': 'measures', '🔬': 'microscopes'
    };
    return emojiLabels[emoji] || 'items';
}

function generateSequencePuzzles(count, difficulty, age) {
    // Map age to age group
    const ageGroup = ageGroupMap[age ? age.toString() : '6'] || '6';

    // Get age-appropriate sequences from age-based content
    const sequences = ageBasedSequences[ageGroup]?.[difficulty] || ageBasedSequences['6'][difficulty];

    return sequences.slice(0, count).map(s => ({
        type: 'sequence',
        sequence: s.sequence,
        answer: s.answer,
        options: s.options,
        reason: s.reason
    }));
}

function generateMatchingPuzzles(count, difficulty, age) {
    // Map age to age group
    const ageGroup = ageGroupMap[age ? age.toString() : '6'] || '6';

    // Get age-appropriate matching puzzles from age-based content
    const pairs = ageBasedMatching[ageGroup]?.[difficulty] || ageBasedMatching['6'][difficulty];

    return pairs.slice(0, count).map(p => ({
        type: 'matching',
        left: p.left,
        answer: p.right,
        options: p.options,
        reason: p.reason
    }));
}

function generateOddOnePuzzles(count, difficulty, age) {
    // Map age to age group
    const ageGroup = ageGroupMap[age ? age.toString() : '6'] || '6';

    // Get age-appropriate odd-one-out puzzles from age-based content
    const sets = ageBasedOddOneOut[ageGroup]?.[difficulty] || ageBasedOddOneOut['6'][difficulty];

    return sets.slice(0, count).map(s => ({
        type: 'oddone',
        items: s.items,
        answer: s.answer,
        reason: s.reason
    }));
}

function generateComparisonPuzzles(count, difficulty, age) {
    // Map age to age group
    const ageGroup = ageGroupMap[age ? age.toString() : '6'] || '6';

    // Get age-appropriate comparison puzzles from age-based content
    const comparisons = ageBasedComparison[ageGroup]?.[difficulty] || ageBasedComparison['6'][difficulty];

    return comparisons.slice(0, count).map(c => ({
        type: 'comparison',
        item1: c.item1,
        item2: c.item2,
        question: c.question,
        answer: c.answer,
        reason: c.reason || c.question
    }));
}

function generateLogicPuzzles(count, difficulty, age) {
    // Map age to age group
    const ageGroup = ageGroupMap[age ? age.toString() : '6'] || '6';

    // Get age-appropriate logic puzzles from age-based content
    const puzzles = ageBasedLogic[ageGroup]?.[difficulty] || ageBasedLogic['6'][difficulty];

    return puzzles.slice(0, count).map(p => ({
        type: 'logic',
        question: p.question,
        answer: p.answer
    }));
}

// Load Puzzles
function loadPuzzles(difficulty, page = 1) {
    // Check for admin level override
    if (window.currentUserRole === 'admin') {
        const adminLevel = getAdminLevelForModule('aptitude');
        if (adminLevel) {
            const levelDetails = getLevelDetails(adminLevel);
            if (levelDetails) {
                currentAge = levelDetails.ageGroup;
                difficulty = levelDetails.difficulty;
            }
        }
    }

    currentDifficulty = difficulty;
    currentPage = page;

    // Set page limit for demo mode (2 pages) vs full mode (50 pages)
    totalPages = getDemoLimit(50);

    const counts = {
        easy: { patterns: 8, counting: 8, sequences: 6, matching: 6, oddone: 6, comparison: 6, logic: 6 },
        medium: { patterns: 10, counting: 10, sequences: 8, matching: 8, oddone: 8, comparison: 8, logic: 8 },
        hard: { patterns: 12, counting: 10, sequences: 10, matching: 10, oddone: 10, comparison: 10, logic: 10 }
    };

    let count = counts[difficulty][currentType];
    let problems = [];

    // NOW USING AGE! Pass currentAge to generators for age-appropriate content
    switch(currentType) {
        case 'patterns': problems = generatePatternPuzzles(count, difficulty, currentAge); break;
        case 'counting': problems = generateCountingPuzzles(count, difficulty, currentAge); break;
        case 'sequences': problems = generateSequencePuzzles(count, difficulty, currentAge); break;
        case 'matching': problems = generateMatchingPuzzles(count, difficulty, currentAge); break;
        case 'oddone': problems = generateOddOnePuzzles(count, difficulty, currentAge); break;
        case 'comparison': problems = generateComparisonPuzzles(count, difficulty, currentAge); break;
        case 'logic': problems = generateLogicPuzzles(count, difficulty, currentAge); break;
    }

    currentWorksheet = {
        type: currentType,
        difficulty,
        age: currentAge,
        page: currentPage,
        problems
    };

    renderWorksheet();
}

// Navigate between pages
function changePage(direction) {
    const newPage = currentPage + direction;

    // Check bounds
    if (newPage < 1 || newPage > totalPages) {
        return;
    }

    // Load new page
    loadPuzzles(currentDifficulty, newPage);
}

// Render Worksheet
function renderWorksheet() {
    const { type, difficulty, problems } = currentWorksheet;
    const today = new Date().toLocaleDateString();

    const typeNames = {
        patterns: '🔷 Patterns', counting: '🔢 Counting',
        sequences: '➡️ Sequences', matching: '🔗 Matching', oddone: '👀 Odd One Out',
        comparison: '📏 Comparison', logic: '🤔 Logic Puzzles'
    };

    const difficultyStars = { easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐' };

    let problemsHTML = '';

    problems.forEach((problem, index) => {
        if (problem.type === 'maze') {
            const { width, height, paths } = problem.maze;
            problemsHTML += `
                <div class="aptitude-problem maze-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                        <span class="problem-title">Help ${problem.start} reach ${problem.end}!</span>
                    </div>
                    <div class="maze-container">
                        <div class="maze-visual-complex">
                            <div class="maze-endpoint">${problem.start}</div>
                            <div class="maze-svg-container">
                                <svg width="${width}" height="${height}" style="border: 3px solid #000; background: #fafafa; border-radius: 10px;">
                                    ${paths.map(path => `
                                        <path d="${path.d}" stroke="${path.color}" stroke-width="${path.correct ? 3 : 2}" fill="none"/>
                                    `).join('')}
                                </svg>
                                <p style="font-size: 0.9em; color: #666; margin-top: 10px; text-align: center;">Trace the path with your finger!</p>
                            </div>
                            <div class="maze-endpoint">${problem.end}</div>
                        </div>
                        <div style="margin-top: 20px; text-align: center;">
                            <label style="font-size: 1.1em;">
                                <input type="checkbox" id="answer-${index}" style="width: 25px; height: 25px; margin-right: 10px; vertical-align: middle;">
                                <strong>I found the path! ✓</strong>
                            </label>
                            <span class="answer-feedback" id="feedback-${index}"></span>
                        </div>
                    </div>
                </div>
            `;
        } else if (problem.type === 'pattern') {
            // Randomize answer position
            const shuffledOptions = shuffleArray(problem.options);
            problemsHTML += `
                <div class="aptitude-problem pattern-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                        <span class="problem-title">What comes next?</span>
                    </div>
                    <div class="pattern-display">
                        ${problem.pattern.map(item => `<span class="pattern-item">${item}</span>`).join(' ')}
                        <span class="pattern-item pattern-blank">?</span>
                    </div>
                    <div class="options-display" style="margin-top: 15px;">
                        ${shuffledOptions.map(opt => `
                            <button class="option-btn" data-question="${index}" data-answer="${opt.replace(/"/g, '&quot;')}" onclick="selectOption(this)">${opt}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="answer-${index}">
                    <span class="answer-feedback" id="feedback-${index}"></span>
                </div>
            `;
        } else if (problem.type === 'counting') {
            const emojis = Array(problem.quantity).fill(problem.emoji).join(' ');
            problemsHTML += `
                <div class="aptitude-problem counting-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                        <span class="problem-title">How many ${problem.label}?</span>
                    </div>
                    <div class="counting-display">${emojis}</div>
                    <div style="margin-top: 15px; text-align: center;">
                        <div class="handwriting-input-container">
                            <canvas
                                id="answer-${index}"
                                class="handwriting-input"
                                data-width="120"
                                data-height="70"
                                style="touch-action: none;">
                            </canvas>
                            <button class="eraser-btn" onclick="clearHandwritingInput('answer-${index}')" title="Clear this answer">✕</button>
                        </div>
                        <span class="answer-feedback" id="feedback-${index}"></span>
                    </div>
                </div>
            `;
        } else if (problem.type === 'sequence') {
            // Randomize answer position
            const shuffledOptions = shuffleArray(problem.options);
            problemsHTML += `
                <div class="aptitude-problem sequence-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                        <span class="problem-title">What comes next?</span>
                    </div>
                    <div class="sequence-display">
                        ${problem.sequence.map(item => `<span class="sequence-item">${item}</span>`).join(' → ')}
                        <span class="sequence-item">?</span>
                    </div>
                    <div class="options-display" style="margin-top: 15px;">
                        ${shuffledOptions.map(opt => `
                            <button class="option-btn" data-question="${index}" data-answer="${opt.replace(/"/g, '&quot;')}" onclick="selectOption(this)">${opt}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="answer-${index}">
                    <span class="answer-feedback" id="feedback-${index}"></span>
                </div>
            `;
        } else if (problem.type === 'matching') {
            // Randomize answer position
            const shuffledOptions = shuffleArray(problem.options);
            problemsHTML += `
                <div class="aptitude-problem matching-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                        <span class="problem-title">What goes with ${problem.left}?</span>
                    </div>
                    <div class="matching-display">
                        <span style="font-size: 3em; margin-bottom: 15px; display: block;">${problem.left}</span>
                        <span style="font-size: 1.5em; margin-bottom: 10px; display: block;">↓</span>
                    </div>
                    <div class="options-display" style="margin-top: 15px;">
                        ${shuffledOptions.map(opt => `
                            <button class="option-btn" data-question="${index}" data-answer="${opt.replace(/"/g, '&quot;')}" onclick="selectOption(this)">${opt}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="answer-${index}">
                    <span class="answer-feedback" id="feedback-${index}"></span>
                </div>
            `;
        } else if (problem.type === 'oddone') {
            problemsHTML += `
                <div class="aptitude-problem oddone-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                        <span class="problem-title">Which one is different?</span>
                    </div>
                    <div class="oddone-display">
                        ${problem.items.map(item => `
                            <button class="oddone-btn" data-question="${index}" data-answer="${item.replace(/"/g, '&quot;')}" onclick="selectOdd(this)">${item}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="answer-${index}">
                    <span class="answer-feedback" id="feedback-${index}"></span>
                </div>
            `;
        } else if (problem.type === 'comparison') {
            problemsHTML += `
                <div class="aptitude-problem comparison-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                        <span class="problem-title">${problem.question}</span>
                    </div>
                    <div class="comparison-display">
                        <button class="compare-btn" data-question="${index}" data-answer="${problem.item1.replace(/"/g, '&quot;')}" onclick="selectComparison(this)">
                            <span style="font-size: 2.5em;">${problem.item1}</span>
                        </button>
                        <span style="font-size: 2em; margin: 0 20px;">OR</span>
                        <button class="compare-btn" data-question="${index}" data-answer="${problem.item2.replace(/"/g, '&quot;')}" onclick="selectComparison(this)">
                            <span style="font-size: 2.5em;">${problem.item2}</span>
                        </button>
                    </div>
                    <input type="hidden" id="answer-${index}">
                    <span class="answer-feedback" id="feedback-${index}"></span>
                </div>
            `;
        } else if (problem.type === 'logic') {
            problemsHTML += `
                <div class="aptitude-problem logic-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                    </div>
                    <div class="logic-question">${problem.question}</div>
                    <div style="margin-top: 15px; text-align: center;">
                        <div class="handwriting-input-container">
                            <canvas
                                id="answer-${index}"
                                class="handwriting-input"
                                data-width="200"
                                data-height="80"
                                style="touch-action: none;">
                            </canvas>
                            <button class="eraser-btn" onclick="clearHandwritingInput('answer-${index}')" title="Clear this answer">✕</button>
                        </div>
                        <span class="answer-feedback" id="feedback-${index}"></span>
                    </div>
                </div>
            `;
        }
    });

    const html = `
        <div class="worksheet-container">
            <div class="navigation" style="margin-bottom: 20px;">
                <button onclick="backToWorksheetSelection()" style="padding: 12px 24px; border: none; border-radius: 8px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; font-weight: bold; cursor: pointer;">← Back to Challenges</button>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-size: 1.2em; font-weight: bold;">
                📊 Level: ${typeof ageAndDifficultyToLevel === 'function' ? ageAndDifficultyToLevel(currentAge, difficulty) : 'N/A'}
            </div>
            <div class="worksheet-header">
                <div class="worksheet-info">
                    <h2>${typeNames[type]} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h2>
                    <p>${problems.length} puzzles to solve!</p>
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

            <div class="controls">
                <div class="timer">
                    <span id="timer-display">00:00</span>
                </div>
                <div class="control-buttons">
                    <div id="timer-toggle-container" class="timer-toggle-container">
                        <span class="timer-toggle-label">⏱️ Timer</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="timer-toggle-input" onchange="toggleTimer(event)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <button onclick="saveCurrentWorksheet()" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; border: none; font-weight: bold;">💾 Save</button>
                    <button onclick="clearAllAnswers()" style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; border: none; font-weight: bold;">🔄 Clear All</button>
                    <button onclick="savePDF()" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; font-weight: bold;">📄 PDF</button>
                </div>
            </div>

            <div class="results-summary" id="results-summary"></div>

            <div class="aptitude-problems-container">${problemsHTML}</div>

            <div class="page-navigation" style="margin: 30px 0;">
                <button onclick="changePage(-1)" id="prev-btn" ${currentPage <= 1 ? 'disabled' : ''}>← Previous Page</button>
                <span class="page-counter">Page <span id="current-page">${currentPage}</span> of <span id="total-pages">${totalPages}</span></span>
                <button onclick="changePage(1)" id="next-btn" ${currentPage >= totalPages ? 'disabled' : ''}>Next Page →</button>
            </div>

            <div class="worksheet-actions" style="margin: 30px 0; display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
                <button onclick="submitWorksheet()" class="submit-worksheet-btn" style="padding: 15px 40px; font-size: 1.2em; background: linear-gradient(135deg, #4caf50, #45a049); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76, 175, 80, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(76, 175, 80, 0.3)'">
                    ✓ Submit for Evaluation
                </button>
                <div id="submission-status" style="padding: 10px 20px; border-radius: 8px; font-weight: bold; display: none;"></div>
            </div>

            <div class="navigation">
                <div id="answer-toggle-container" class="answer-toggle-container" style="margin-bottom: 20px;">
                    <span class="answer-toggle-label">Show Answers</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="answer-toggle-input" onchange="toggleAnswers(event)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    // Hide navigation and show worksheet in container
    // Safely hide elements only if they exist
    const ageSelection = document.getElementById('age-selection');
    const typeSelection = document.getElementById('type-selection');
    const difficultySelection = document.getElementById('difficulty-selection');

    if (ageSelection) ageSelection.style.display = 'none';
    if (typeSelection) typeSelection.style.display = 'none';
    if (difficultySelection) difficultySelection.style.display = 'none';

    // Get or create worksheet container
    let worksheetContainer = document.getElementById('worksheet-content');
    if (!worksheetContainer) {
        worksheetContainer = document.createElement('div');
        worksheetContainer.id = 'worksheet-content';
        document.querySelector('.container').appendChild(worksheetContainer);
    }

    worksheetContainer.innerHTML = html;
    worksheetContainer.style.display = 'block';

    // Add admin level indicator
    if (typeof showAdminLevelIndicator === 'function') {
        showAdminLevelIndicator('aptitude', worksheetContainer);
    }

    setTimeout(() => {
        initializeAllHandwritingInputs();
        // Load saved worksheet after inputs are initialized
        setTimeout(() => {
            loadSavedWorksheet();
            // Validate show answers toggle after loading
            validateShowAnswersToggle();
        }, 200);
    }, 100);

    elapsedSeconds = 0;
    updateTimerDisplay();
}

// Interactive functions
function selectOption(button) {
    const index = button.getAttribute('data-question');
    const option = button.getAttribute('data-answer');

    document.getElementById(`answer-${index}`).value = option;

    // Remove selected class from all buttons in this question
    const buttons = button.parentElement.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));

    // Add selected class to clicked button
    button.classList.add('selected');
}

function selectOdd(button) {
    const index = button.getAttribute('data-question');
    const item = button.getAttribute('data-answer');

    document.getElementById(`answer-${index}`).value = item;

    // Remove selected class from all buttons in this question
    const buttons = button.parentElement.querySelectorAll('.oddone-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));

    // Add selected class to clicked button
    button.classList.add('selected');
}

function selectComparison(button) {
    const index = button.getAttribute('data-question');
    const item = button.getAttribute('data-answer');

    document.getElementById(`answer-${index}`).value = item;

    // Remove selected class from all buttons in this question
    const buttons = button.parentElement.querySelectorAll('.compare-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));

    // Add selected class to clicked button
    button.classList.add('selected');
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
    if (timer) return;
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

    if (timerEl) timerEl.textContent = display;
    if (elapsedEl) elapsedEl.textContent = display;
}

// Check answers
function checkAnswers() {
    stopTimer();

    let correct = 0;
    let total = currentWorksheet.problems.length;

    currentWorksheet.problems.forEach((problem, index) => {
        const input = document.getElementById(`answer-${index}`);
        const feedback = document.getElementById(`feedback-${index}`);

        if (!input) return;

        // Handle handwriting canvases (counting and logic problems)
        if (input.tagName === 'CANVAS') {
            const correctAnswer = String(problem.answer);
            // Update feedback (RIGHT of canvas, NOT on canvas) - just the value, no "Answer:" prefix
            feedback.textContent = correctAnswer;
            feedback.style.color = '#4caf50';
            feedback.style.fontSize = '1.5em';
            feedback.style.fontWeight = 'bold';
            feedback.style.display = 'inline';
            return;
        }

        let userAnswer;
        if (input.type === 'checkbox') {
            userAnswer = input.checked ? 'completed' : '';
        } else {
            userAnswer = input.value.trim().toLowerCase();
        }

        const correctAnswer = problem.answer.toLowerCase();
        const isCorrect = userAnswer === correctAnswer;
        const hasAnswer = userAnswer !== '';

        // For button-based problems (matching, patterns, sequences, oddone, comparison)
        if (input.type === 'hidden' && hasAnswer) {
            if (isCorrect) {
                feedback.innerHTML = `<span style="color: #00aa00;">✓ Correct!</span><br><span style="color: #00aa00; font-size: 0.9em;">${problem.reason || ''}</span>`;
                correct++;

                // Highlight the correct button in green
                const buttons = input.closest('.aptitude-problem').querySelectorAll('.option-btn, .oddone-btn, .compare-btn');
                buttons.forEach(btn => {
                    if (btn.getAttribute('data-answer').toLowerCase() === correctAnswer) {
                        btn.style.backgroundColor = '#00aa00';
                        btn.style.color = 'white';
                        btn.style.borderColor = '#00aa00';
                    }
                });
            } else {
                feedback.innerHTML = `<span style="color: #cc0000;">✗ Wrong</span><br><span style="color: #00aa00; font-size: 0.9em;">Correct: ${problem.answer}</span><br><span style="color: #666; font-size: 0.85em;">${problem.reason || ''}</span>`;

                // Highlight user's wrong answer in red, correct answer in green
                const buttons = input.closest('.aptitude-problem').querySelectorAll('.option-btn, .oddone-btn, .compare-btn');
                buttons.forEach(btn => {
                    const btnAnswer = btn.getAttribute('data-answer').toLowerCase();
                    if (btnAnswer === userAnswer) {
                        btn.style.backgroundColor = '#cc0000';
                        btn.style.color = 'white';
                        btn.style.borderColor = '#cc0000';
                    } else if (btnAnswer === correctAnswer) {
                        btn.style.backgroundColor = '#00aa00';
                        btn.style.color = 'white';
                        btn.style.borderColor = '#00aa00';
                    }
                });
            }
        } else {
            // Original logic for checkboxes and empty answers
            if (isCorrect) {
                feedback.textContent = '✓ Great!';
                feedback.style.color = '#00aa00';
                feedback.style.fontSize = '1.5em';
                if (input.style) input.style.borderColor = '#00aa00';
                correct++;
            } else if (!hasAnswer) {
                feedback.textContent = '';
            } else {
                feedback.textContent = '✗ Try again';
                feedback.style.color = '#cc0000';
                feedback.style.fontSize = '1.5em';
                if (input.style) input.style.borderColor = '#cc0000';
            }
        }
    });

    const resultsDiv = document.getElementById('results-summary');
    const percentage = Math.round((correct / total) * 100);

    let message = '';
    if (percentage === 100) {
        message = '<p style="color: #00aa00; font-weight: bold; font-size: 1.3em;">🎉 Perfect! You\'re amazing! 🌟</p>';
    } else if (percentage >= 80) {
        message = '<p style="color: #0066cc; font-weight: bold; font-size: 1.3em;">😊 Great job! Keep it up! 💪</p>';
    } else {
        message = '<p style="color: #cc6600; font-weight: bold; font-size: 1.3em;">💪 Good try! Practice more! 📚</p>';
    }

    resultsDiv.innerHTML = `
        <h3>Results</h3>
        <div class="score">${correct} / ${total} correct (${percentage}%)</div>
        <p>Time: ${document.getElementById('elapsed-time').textContent}</p>
        ${message}
    `;
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Show and check toggle switch
    answersVisible = true;
    const toggleContainer = document.getElementById('answer-toggle-container');
    const toggleInput = document.getElementById('answer-toggle-input');
    if (toggleContainer && toggleInput) {
        toggleContainer.style.display = 'flex';
        toggleInput.checked = true;
    }
}

// Save PDF
function savePDF() {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
    const filename = `Aptitude_${currentWorksheet.type}_${currentWorksheet.difficulty}_${timestamp}.pdf`;

    const controls = document.querySelector('.controls');
    const results = document.getElementById('results-summary');
    const navigation = document.querySelector('.navigation');

    const controlsDisplay = controls ? controls.style.display : '';
    const resultsDisplay = results ? results.style.display : '';
    const navigationDisplay = navigation ? navigation.style.display : '';

    if (controls) controls.style.display = 'none';
    if (results) results.style.display = 'none';
    if (navigation) navigation.style.display = 'none';

    const element = document.querySelector('.worksheet-container');
    const opt = {
        margin: [0.6, 0.4, 0.6, 0.4],
        filename: filename,
        image: { type: 'jpeg', quality: 0.92 },
        html2canvas: {
            scale: 1.2,
            useCORS: true,
            letterRendering: true,
            logging: false,
            width: element.scrollWidth,
            windowWidth: element.scrollWidth
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if (controls) controls.style.display = controlsDisplay;
        if (results) results.style.display = resultsDisplay;
        if (navigation) navigation.style.display = navigationDisplay;
    });
}

// Toggle answer visibility
function toggleAnswers(event) {
    answersVisible = event ? event.target.checked : !answersVisible;

    currentWorksheet.problems.forEach((problem, index) => {
        const input = document.getElementById(`answer-${index}`);
        const feedback = document.getElementById(`feedback-${index}`);

        if (feedback) {
            if (answersVisible) {
                // Show answer - handle canvas vs button/checkbox answers differently
                if (input && input.tagName === 'CANVAS') {
                    const correctAnswer = String(problem.answer);
                    feedback.textContent = correctAnswer;
                    feedback.style.color = '#4caf50';
                    feedback.style.fontSize = '1.5em';
                    feedback.style.fontWeight = 'bold';
                } else if (input && input.type === 'hidden') {
                    // Button-based problems - show answer with reasoning and highlight
                    const userAnswer = input.value.trim().toLowerCase();
                    const correctAnswer = problem.answer.toLowerCase();
                    const hasAnswer = userAnswer !== '';
                    const isCorrect = userAnswer === correctAnswer;

                    if (hasAnswer) {
                        if (isCorrect) {
                            feedback.innerHTML = `<span style="color: #00aa00;">✓ Correct!</span><br><span style="color: #00aa00; font-size: 0.9em;">${problem.reason || ''}</span>`;
                        } else {
                            feedback.innerHTML = `<span style="color: #cc0000;">✗ Wrong</span><br><span style="color: #00aa00; font-size: 0.9em;">Correct: ${problem.answer}</span><br><span style="color: #666; font-size: 0.85em;">${problem.reason || ''}</span>`;
                        }

                        // Highlight buttons
                        const buttons = input.closest('.aptitude-problem').querySelectorAll('.option-btn, .oddone-btn, .compare-btn');
                        buttons.forEach(btn => {
                            const btnAnswer = btn.getAttribute('data-answer').toLowerCase();
                            if (btnAnswer === userAnswer && !isCorrect) {
                                btn.style.backgroundColor = '#cc0000';
                                btn.style.color = 'white';
                                btn.style.borderColor = '#cc0000';
                            } else if (btnAnswer === correctAnswer) {
                                btn.style.backgroundColor = '#00aa00';
                                btn.style.color = 'white';
                                btn.style.borderColor = '#00aa00';
                            }
                        });
                    } else {
                        // No answer provided - just show the correct answer
                        feedback.innerHTML = `<span style="color: #00aa00; font-size: 0.9em;">Answer: ${problem.answer}</span><br><span style="color: #666; font-size: 0.85em;">${problem.reason || ''}</span>`;

                        // Highlight correct answer in green
                        const buttons = input.closest('.aptitude-problem').querySelectorAll('.option-btn, .oddone-btn, .compare-btn');
                        buttons.forEach(btn => {
                            if (btn.getAttribute('data-answer').toLowerCase() === correctAnswer) {
                                btn.style.backgroundColor = '#00aa00';
                                btn.style.color = 'white';
                                btn.style.borderColor = '#00aa00';
                            }
                        });
                    }
                }
                feedback.style.display = 'inline';
            } else {
                // Hide answer and reset button colors
                feedback.style.display = 'none';

                // Reset button highlighting
                if (input && input.type === 'hidden') {
                    const buttons = input.closest('.aptitude-problem').querySelectorAll('.option-btn, .oddone-btn, .compare-btn');
                    buttons.forEach(btn => {
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                        btn.style.borderColor = '';
                    });
                }
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

    const identifier = `${currentWorksheet.type}-${currentWorksheet.difficulty}`;
    const child = getSelectedChild();
    const studentName = document.getElementById('student-name')?.value || (child ? child.name : getCurrentUserFullName());
    const elapsedTime = document.getElementById('elapsed-time')?.textContent || '00:00';

    // Collect canvas answers (for counting and logic problems)
    const canvasAnswers = [];
    const buttonAnswers = {};
    const checkboxAnswers = {};

    currentWorksheet.problems.forEach((problem, index) => {
        const input = document.getElementById(`answer-${index}`);

        if (input && input.tagName === 'CANVAS') {
            // Canvas answer
            if (input.toDataURL) {
                canvasAnswers.push({
                    index: index,
                    imageData: input.toDataURL('image/png')
                });
            }
        } else if (input && input.type === 'checkbox') {
            // Checkbox answer (mazes)
            checkboxAnswers[index] = input.checked;
        } else if (input && input.type === 'hidden') {
            // Button selection answer (patterns, sequences, matching, oddone, comparison)
            const value = input.value;
            if (value) {
                buttonAnswers[index] = value;
            }
        }
    });

    const data = {
        completed: true,
        elapsedTime: elapsedTime,
        studentName: studentName,
        canvasAnswers: canvasAnswers,
        buttonAnswers: buttonAnswers,
        checkboxAnswers: checkboxAnswers
    };

    if (saveWorksheet('aptitude', identifier, data)) {
        alert('Worksheet saved successfully!');
        updateCompletionBadge(currentWorksheet.type, currentWorksheet.difficulty);
    }
}

// Load saved worksheet
async function loadSavedWorksheet() {
    if (!currentWorksheet) return;

    const identifier = `${currentWorksheet.type}-${currentWorksheet.difficulty}`;
    // Use the Firebase storage function explicitly to avoid naming collision
    const savedData = await loadWorksheetFromFirestore('aptitude', identifier);

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
    }

    // Restore button selections
    if (savedData.buttonAnswers) {
        Object.keys(savedData.buttonAnswers).forEach(index => {
            const value = savedData.buttonAnswers[index];
            const hiddenInput = document.getElementById(`answer-${index}`);
            if (hiddenInput) {
                hiddenInput.value = value;

                // Highlight the selected button
                const buttons = document.querySelectorAll(`[data-question="${index}"]`);
                buttons.forEach(btn => {
                    if (btn.getAttribute('data-answer') === value) {
                        btn.classList.add('selected');
                    }
                });
            }
        });
    }

    // Restore checkbox selections
    if (savedData.checkboxAnswers) {
        Object.keys(savedData.checkboxAnswers).forEach(index => {
            const checkbox = document.getElementById(`answer-${index}`);
            if (checkbox && checkbox.type === 'checkbox') {
                checkbox.checked = savedData.checkboxAnswers[index];
            }
        });
    }

    // Show "Loaded saved worksheet" message
    const resultsDiv = document.getElementById('results-summary');
    if (resultsDiv) {
        resultsDiv.innerHTML = `
            <h3>Loaded Saved Worksheet</h3>
            <p style="font-size: 1.1em; color: #0066cc;">Your previous work has been restored.</p>
            <p>Saved on: ${new Date(savedData.timestamp).toLocaleString()}</p>
            <p>Time: ${savedData.elapsedTime}</p>
        `;
        resultsDiv.style.display = 'block';
    }
}

// Clear all answers on current worksheet
// Validate if all handwriting canvases have content and enable/disable Show Answers toggle
function validateShowAnswersToggle() {
    const toggleInput = document.getElementById('answer-toggle-input');
    const toggleContainer = document.getElementById('answer-toggle-container');

    if (!toggleInput || !toggleContainer) return;

    // For Aptitude worksheets, always enable Show Answers (no validation required)
    // User can see answers anytime to learn from examples
    toggleInput.disabled = false;
    toggleContainer.style.opacity = '1';
    toggleContainer.style.cursor = 'pointer';
    toggleContainer.title = '';
}

function clearAllAnswers() {
    if (!currentWorksheet) return;

    if (confirm('Clear all your answers? This cannot be undone.')) {
        // Clear all canvases
        clearAllHandwritingInputs();

        // Clear all button selections
        document.querySelectorAll('.option-btn.selected, .oddone-btn.selected, .compare-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Clear all hidden inputs
        currentWorksheet.problems.forEach((problem, index) => {
            const input = document.getElementById(`answer-${index}`);
            if (input && input.type === 'hidden') {
                input.value = '';
            }
            if (input && input.type === 'checkbox') {
                input.checked = false;
            }
        });

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

        // Reset timer
        stopTimer();
        elapsedSeconds = 0;
        updateTimerDisplay();

        // Validate show answers toggle after clearing
        validateShowAnswersToggle();
    }
}

/**
 * Submit and evaluate aptitude worksheet
 */
async function submitWorksheet() {
    if (!currentWorksheet) {
        alert('No worksheet loaded');
        return;
    }

    const submitBtn = document.querySelector('.submit-worksheet-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Evaluating...';
    }

    let correctCount = 0;
    const totalProblems = currentWorksheet.problems.length;

    // Evaluate each answer
    for (let i = 0; i < totalProblems; i++) {
        const problem = currentWorksheet.problems[i];
        const answerElement = document.getElementById(`answer-${i}`);
        const feedbackElement = document.getElementById(`feedback-${i}`);
        const correctAnswer = problem.answer;

        if (!answerElement || !feedbackElement) continue;

        let userAnswer = null;
        let isEmpty = false;
        let isCorrect = false;

        try {
            // Different evaluation based on problem type
            if (problem.type === 'maze') {
                // Maze: checkbox completion
                isEmpty = !answerElement.checked;
                isCorrect = answerElement.checked; // Any completion counts as correct
                userAnswer = answerElement.checked ? 'completed' : null;
            } else if (['pattern', 'sequence', 'matching', 'oddone', 'comparison'].includes(problem.type)) {
                // Button-based: check hidden input value
                userAnswer = answerElement.value.trim();
                isEmpty = userAnswer === '';
                isCorrect = userAnswer === String(correctAnswer);
            } else if (problem.type === 'counting') {
                // Canvas-based counting: use enhanced recognition
                if (typeof recognizeAptitudeAnswer === 'function') {
                    const result = await recognizeAptitudeAnswer(answerElement, 'number');

                    if (result.isEmpty) {
                        isEmpty = true;
                    } else if (result.success) {
                        userAnswer = result.value;
                        // Validate with lenient counting rules
                        const validation = validateCountingAnswer(result, correctAnswer);
                        isCorrect = validation.valid;
                    }
                } else {
                    feedbackElement.textContent = 'Recognition loading...';
                    feedbackElement.style.color = '#ff9800';
                    feedbackElement.style.display = 'inline-block';
                    continue;
                }
            } else if (problem.type === 'logic') {
                // Canvas-based logic: manual review with enhanced feedback
                if (typeof recognizeAptitudeAnswer === 'function') {
                    const result = await recognizeAptitudeAnswer(answerElement, 'text');

                    if (result.isEmpty) {
                        isEmpty = true;
                    } else {
                        feedbackElement.textContent = '✓ Answer recorded (manual review)';
                        feedbackElement.style.color = '#667eea';
                        feedbackElement.style.display = 'inline-block';
                        continue;
                    }
                } else {
                    feedbackElement.textContent = 'Manual review required';
                    feedbackElement.style.color = '#ff9800';
                    feedbackElement.style.display = 'inline-block';
                    continue;
                }
            }

            // Provide feedback
            if (isEmpty) {
                feedbackElement.textContent = '⚠️ Empty';
                feedbackElement.style.color = '#999';
            } else if (isCorrect) {
                correctCount++;
                feedbackElement.textContent = '✓ Correct!';
                feedbackElement.style.color = '#4caf50';
                feedbackElement.style.fontWeight = 'bold';
            } else {
                feedbackElement.textContent = `✗ Wrong (${correctAnswer})`;
                feedbackElement.style.color = '#f44336';
                feedbackElement.style.fontWeight = 'bold';
            }

            feedbackElement.style.display = 'inline-block';
            feedbackElement.style.marginLeft = '10px';

        } catch (error) {
            console.error(`Error evaluating answer ${i}:`, error);
            feedbackElement.textContent = `Answer: ${correctAnswer}`;
            feedbackElement.style.color = '#ff9800';
        }
    }

    // Calculate score (only counting evaluated problems)
    // Logic puzzles still need manual review, but counting is now auto-evaluated
    const unevaluatedProblems = currentWorksheet.problems.filter(p => p.type === 'logic').length;
    const evaluatedProblems = totalProblems - unevaluatedProblems;
    const score = evaluatedProblems > 0 ? Math.round((correctCount / evaluatedProblems) * 100) : 0;

    // Check completion criteria (95% threshold for aptitude)
    const completionResult = isPageCompleted('aptitude', score, false);
    const isCompleted = completionResult.completed;

    // Save completion — try Cloud Function first, fall back to local
    const identifier = `${currentWorksheet.type}-${currentWorksheet.difficulty}`;
    const elapsedTime = document.getElementById('elapsed-time')?.textContent || '00:00';
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;

    try {
        const validateAptitude = firebase.functions().httpsCallable('validateAptitudeSubmission');
        const serverResult = await validateAptitude({
            childId: child ? child.id : null,
            problemType: currentWorksheet.type,
            difficulty: currentWorksheet.difficulty,
            answers: currentWorksheet.problems.map((p, idx) => {
                if (p.type === 'maze') {
                    const el = document.getElementById(`answer-${idx}`);
                    return el && el.checked ? 'completed' : null;
                }
                if (['pattern', 'sequence', 'matching', 'oddone', 'comparison'].includes(p.type)) {
                    const el = document.getElementById(`answer-${idx}`);
                    return el ? el.value.trim() : null;
                }
                return null; // Canvas-based answers handled by problemData
            }),
            problemData: currentWorksheet.problems.map(p => ({
                type: p.type,
                answer: p.answer
            })),
            elapsedTime: elapsedTime
        });
        console.log('Aptitude submission validated by server:', serverResult.data);
    } catch (cfError) {
        console.warn('Cloud Function unavailable, using local validation:', cfError.message);

        const completionData = {
            score: score,
            correctCount: correctCount,
            totalProblems: evaluatedProblems,
            completed: isCompleted,
            manuallyMarked: false,
            elapsedTime: elapsedTime,
            attempts: 1
        };

        await savePageCompletion('aptitude', identifier, completionData);
    }

    // Show submission status with 95% threshold messaging
    const resultsDiv = document.getElementById('results-summary');
    if (resultsDiv) {
        resultsDiv.style.display = 'block';

        if (isCompleted) {
            resultsDiv.innerHTML = `
                <h3>✓ Completed!</h3>
                <p style="font-size: 1.3em; color: #4caf50; font-weight: bold;">Score: ${correctCount}/${evaluatedProblems} (${score}%)</p>
                <span style="display: inline-block; font-size: 2em;">✓</span>
                <p style="font-size: 1.1em; margin-top: 10px;">🌟 Excellent! You can now move to the next level.</p>
            `;
        } else {
            resultsDiv.innerHTML = `
                <h3>✓ Submitted!</h3>
                <p style="font-size: 1.3em; color: #f44336; font-weight: bold;">Score: ${correctCount}/${evaluatedProblems} (${score}%)</p>
                <p style="font-size: 1.1em; margin-top: 10px;">💪 ${completionResult.reason} Try again to unlock the next level!</p>
            `;
        }
    }

    // Re-enable submit button
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '✓ Resubmit';
    }

    console.log(`Aptitude worksheet submitted: ${correctCount}/${evaluatedProblems} (${score}%) - Completed: ${isCompleted}`);
}

// Update completion badge on level selection screen
function updateCompletionBadge(type, difficulty) {
    console.log(`Aptitude worksheet ${type}-${difficulty} marked as completed`);
}
