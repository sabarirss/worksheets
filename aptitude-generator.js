// Aptitude & Logic Puzzles - Complete with Difficulty Levels

let currentAge = null;
let currentType = null;
let currentDifficulty = null;
let currentWorksheet = null;
let timer = null;
let startTime = null;
let elapsedSeconds = 0;
let answersVisible = false;

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
    document.getElementById('age-selection').style.display = 'none';
    document.getElementById('type-selection').style.display = 'block';
}

function backToAges() {
    document.getElementById('type-selection').style.display = 'none';
    document.getElementById('age-selection').style.display = 'block';
}

function selectType(type) {
    currentType = type;
    const names = {
        patterns: '🔷 Patterns', counting: '🔢 Counting',
        sequences: '➡️ Sequences', matching: '🔗 Matching', oddone: '👀 Odd One Out',
        comparison: '📏 Comparison', logic: '🤔 Logic Puzzles'
    };
    document.getElementById('challenge-name').textContent = names[type];
    document.getElementById('type-selection').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';
}

function backToTypes() {
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('type-selection').style.display = 'block';
}

function backToWorksheetSelection() {
    // Hide worksheet content and show difficulty selection
    const worksheetContent = document.getElementById('worksheet-content');
    if (worksheetContent) {
        worksheetContent.style.display = 'none';
    }
    document.getElementById('difficulty-selection').style.display = 'block';
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

function generatePatternPuzzles(count, difficulty) {
    let patterns = [];

    if (difficulty === 'easy') {
        // Simple 2-item patterns
        patterns = [
            { pattern: ['🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢'] },
            { pattern: ['⭐', '🌙'], answer: '⭐', options: ['⭐', '🌙', '☀️'] },
            { pattern: ['🍎', '🍊'], answer: '🍎', options: ['🍎', '🍊', '🍋'] },
            { pattern: ['😊', '😢'], answer: '😊', options: ['😊', '😢', '😡'] },
            { pattern: ['🐶', '🐱'], answer: '🐶', options: ['🐶', '🐱', '🐭'] },
            { pattern: ['🌞', '🌙'], answer: '🌞', options: ['🌞', '🌙', '⭐'] },
            { pattern: ['1️⃣', '2️⃣'], answer: '1️⃣', options: ['1️⃣', '2️⃣', '3️⃣'] },
            { pattern: ['🔺', '⭕'], answer: '🔺', options: ['🔺', '⭕', '⬜'] }
        ];
    } else if (difficulty === 'medium') {
        // 3-item patterns
        patterns = [
            { pattern: ['🔴', '🔵', '🟢'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'] },
            { pattern: ['⭐', '🌙', '☀️'], answer: '⭐', options: ['⭐', '🌙', '☀️', '💫'] },
            { pattern: ['🍎', '🍊', '🍋'], answer: '🍎', options: ['🍎', '🍊', '🍋', '🍇'] },
            { pattern: ['😊', '😢', '😡'], answer: '😊', options: ['😊', '😢', '😡', '🤔'] },
            { pattern: ['🐶', '🐱', '🐭'], answer: '🐶', options: ['🐶', '🐱', '🐭', '🐰'] },
            { pattern: ['🌞', '🌙', '⭐'], answer: '🌞', options: ['🌞', '🌙', '⭐', '💫'] },
            { pattern: ['1️⃣', '2️⃣', '3️⃣'], answer: '1️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'] },
            { pattern: ['🔺', '⭕', '⬜'], answer: '🔺', options: ['🔺', '⭕', '⬜', '🔶'] },
            { pattern: ['🚗', '🚙', '🚕'], answer: '🚗', options: ['🚗', '🚙', '🚕', '🚌'] },
            { pattern: ['🌸', '🌺', '🌻'], answer: '🌸', options: ['🌸', '🌺', '🌻', '🌷'] }
        ];
    } else {
        // Complex patterns with variations
        patterns = [
            { pattern: ['🔴', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢'] },
            { pattern: ['⭐', '⭐', '🌙', '🌙'], answer: '⭐', options: ['⭐', '🌙', '☀️'] },
            { pattern: ['🍎', '🍊', '🍊', '🍎'], answer: '🍊', options: ['🍎', '🍊', '🍋'] },
            { pattern: ['😊', '😊', '😢'], answer: '😊', options: ['😊', '😢', '😡'] },
            { pattern: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', options: ['🐶', '🐱', '🐭'] },
            { pattern: ['🌞', '🌙', '🌞', '🌙', '🌞'], answer: '🌙', options: ['🌞', '🌙', '⭐'] },
            { pattern: ['1️⃣', '2️⃣', '3️⃣', '1️⃣', '2️⃣'], answer: '3️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'] },
            { pattern: ['🔺', '⭕', '⭕', '🔺'], answer: '⭕', options: ['🔺', '⭕', '⬜'] },
            { pattern: ['🚗', '🚙', '🚗', '🚙'], answer: '🚗', options: ['🚗', '🚙', '🚕'] },
            { pattern: ['🌸', '🌺', '🌸', '🌺', '🌸'], answer: '🌺', options: ['🌸', '🌺', '🌻'] },
            { pattern: ['A', 'B', 'B', 'A'], answer: 'B', options: ['A', 'B', 'C'] },
            { pattern: ['🟦', '🟥', '🟥', '🟦', '🟥'], answer: '🟥', options: ['🟦', '🟥', '🟩'] }
        ];
    }

    return patterns.slice(0, count).map(p => ({
        type: 'pattern',
        pattern: p.pattern,
        answer: p.answer,
        options: p.options,
        reason: p.reason || 'Pattern repeats'
    }));
}

function generateCountingPuzzles(count, difficulty) {
    const items = [
        { emoji: '🍎', label: 'apples' }, { emoji: '⭐', label: 'stars' },
        { emoji: '🐶', label: 'dogs' }, { emoji: '🌸', label: 'flowers' },
        { emoji: '🎈', label: 'balloons' }, { emoji: '🐝', label: 'bees' },
        { emoji: '🍪', label: 'cookies' }, { emoji: '🦋', label: 'butterflies' }
    ];

    const ranges = {
        easy: { min: 3, max: 10 },
        medium: { min: 10, max: 20 },
        hard: { min: 20, max: 30 }
    };

    const range = ranges[difficulty];

    return items.slice(0, count).map(item => {
        const qty = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        return {
            type: 'counting',
            emoji: item.emoji,
            quantity: qty,
            label: item.label,
            answer: String(qty)
        };
    });
}

function generateSequencePuzzles(count, difficulty) {
    let sequences = [];

    if (difficulty === 'easy') {
        sequences = [
            { seq: ['1️⃣', '2️⃣', '3️⃣'], answer: '4️⃣', options: ['4️⃣', '5️⃣', '2️⃣'] },
            { seq: ['🔴', '🔴'], answer: '🔴', options: ['🔴', '🔵', '🟢'] },
            { seq: ['A', 'B'], answer: 'C', options: ['C', 'D', 'B'] },
            { seq: ['😊', '😊'], answer: '😊', options: ['😊', '😢', '😡'] },
            { seq: ['🌱', '🌿'], answer: '🌳', options: ['🌳', '🌱', '🍃'] },
            { seq: ['🐣', '🐥'], answer: '🐔', options: ['🐔', '🐣', '🥚'] }
        ];
    } else if (difficulty === 'medium') {
        sequences = [
            { seq: ['2️⃣', '4️⃣', '6️⃣'], answer: '8️⃣', options: ['8️⃣', '7️⃣', '9️⃣'] },
            { seq: ['🔴', '🔵', '🔴'], answer: '🔵', options: ['🔵', '🔴', '🟢'] },
            { seq: ['🌙', '⭐', '⭐'], answer: '⭐', options: ['⭐', '🌙', '☀️'] },
            { seq: ['🔺', '🔺', '⭕'], answer: '⭕', options: ['⭕', '🔺', '🔶'] },
            { seq: ['1️⃣', '2️⃣', '2️⃣', '3️⃣'], answer: '3️⃣', options: ['3️⃣', '4️⃣', '2️⃣'] },
            { seq: ['😊', '😢', '😊'], answer: '😢', options: ['😢', '😊', '😡'] },
            { seq: ['A', 'B', 'C'], answer: 'D', options: ['D', 'E', 'C'] },
            { seq: ['🌞', '🌙', '🌞'], answer: '🌙', options: ['🌙', '🌞', '⭐'] }
        ];
    } else {
        sequences = [
            { seq: ['1️⃣', '3️⃣', '5️⃣', '7️⃣'], answer: '9️⃣', options: ['9️⃣', '8️⃣', '🔟'] },
            { seq: ['🔴', '🔴', '🔵', '🔵'], answer: '🟢', options: ['🟢', '🔴', '🔵'] },
            { seq: ['A', 'B', 'A', 'B', 'A'], answer: 'B', options: ['B', 'A', 'C'] },
            { seq: ['🌱', '🌿', '🌳', '🌲'], answer: '🎄', options: ['🎄', '🌱', '🍃'] },
            { seq: ['🥚', '🐣', '🐥', '🐔'], answer: '🍗', options: ['🍗', '🥚', '🐣'] },
            { seq: ['😊', '😊', '😢', '😢', '😡'], answer: '😡', options: ['😡', '😊', '😢'] },
            { seq: ['🔺', '⭕', '🔺', '⭕'], answer: '🔺', options: ['🔺', '⭕', '🔶'] },
            { seq: ['1️⃣', '1️⃣', '2️⃣', '2️⃣', '3️⃣'], answer: '3️⃣', options: ['3️⃣', '4️⃣', '2️⃣'] },
            { seq: ['🌞', '🌙', '🌞', '🌙', '🌞'], answer: '🌙', options: ['🌙', '🌞', '⭐'] },
            { seq: ['🔴', '🔵', '🟢', '🔴', '🔵'], answer: '🟢', options: ['🟢', '🔴', '🔵'] }
        ];
    }

    return sequences.slice(0, count).map(s => ({
        type: 'sequence',
        sequence: s.seq,
        answer: s.answer,
        options: s.options,
        reason: s.reason || 'Sequence continues'
    }));
}

function generateMatchingPuzzles(count, difficulty) {
    let pairs = [];

    if (difficulty === 'easy') {
        pairs = [
            { left: '🐱', right: '🥛', options: ['🥛', '🦴', '🥕'], reason: 'Cats drink milk' },
            { left: '🐶', right: '🦴', options: ['🦴', '🥛', '🌻'], reason: 'Dogs love bones' },
            { left: '🐝', right: '🌻', options: ['🌻', '🦴', '🌊'], reason: 'Bees get nectar from flowers' },
            { left: '🐟', right: '🌊', options: ['🌊', '🪺', '🥛'], reason: 'Fish live in water' },
            { left: '🐦', right: '🪺', options: ['🪺', '🥕', '🌻'], reason: 'Birds live in nests' },
            { left: '🐰', right: '🥕', options: ['🥕', '🦴', '🥛'], reason: 'Rabbits eat carrots' }
        ];
    } else if (difficulty === 'medium') {
        pairs = [
            { left: '🐱', right: '🥛', options: ['🥛', '🦴', '🍌', '🍯'], reason: 'Cats drink milk' },
            { left: '🐶', right: '🦴', options: ['🦴', '🥛', '🌻', '🍌'], reason: 'Dogs love bones' },
            { left: '🐝', right: '🌻', options: ['🌻', '🍯', '🦴', '⭐'], reason: 'Bees collect nectar from flowers' },
            { left: '🐻', right: '🍯', options: ['🍯', '🍌', '🌻', '💧'], reason: 'Bears love honey' },
            { left: '🐒', right: '🍌', options: ['🍌', '🍯', '🥛', '✏️'], reason: 'Monkeys eat bananas' },
            { left: '☀️', right: '🌞', options: ['🌞', '⭐', '🌙', '💧'], reason: 'Sun shines during the day' },
            { left: '🌙', right: '⭐', options: ['⭐', '🌞', '💧', '✏️'], reason: 'Stars appear with the moon at night' },
            { left: '🔥', right: '💧', options: ['💧', '🔥', '⭐', '🖌️'], reason: 'Water puts out fire' },
            { left: '📚', right: '✏️', options: ['✏️', '🖌️', '💧', '🥛'], reason: 'We write in books with pencils' },
            { left: '🎨', right: '🖌️', options: ['🖌️', '✏️', '🌻', '💧'], reason: 'We paint art with brushes' }
        ];
    } else {
        pairs = [
            { left: '🌧️', right: '☂️', options: ['☂️', '🧈', '🔋', '🤒'], reason: 'We use umbrellas when it rains' },
            { left: '🍞', right: '🧈', options: ['🧈', '🍞', '🥛', '☂️'], reason: 'We spread butter on bread' },
            { left: '🔑', right: '🔒', options: ['🔒', '🔑', '🎶', '👓'], reason: 'Keys open locks' },
            { left: '🎵', right: '🎶', options: ['🎶', '🎵', '🔋', '📖'], reason: 'Music notes create melodies' },
            { left: '📱', right: '🔋', options: ['🔋', '📱', '🛬', '👓'], reason: 'Phones need batteries to work' },
            { left: '✈️', right: '🛬', options: ['🛬', '✈️', '🔋', '🥅'], reason: 'Airplanes land at airports' },
            { left: '🌡️', right: '🤒', options: ['🤒', '👓', '☂️', '🔒'], reason: 'Thermometers check if you have a fever' },
            { left: '🔍', right: '👓', options: ['👓', '🔍', '🤒', '🥅'], reason: 'Both magnifying glass and glasses help us see' },
            { left: '⚽', right: '🥅', options: ['🥅', '⚽', '📖', '🛬'], reason: 'Soccer balls go into goals' },
            { left: '🎓', right: '📖', options: ['📖', '🎓', '🍞', '🥛'], reason: 'Graduation caps represent learning from books' },
            { left: '🌾', right: '🍞', options: ['🍞', '🌾', '🥛', '☂️'], reason: 'Bread is made from wheat' },
            { left: '🐄', right: '🥛', options: ['🥛', '🐄', '🧈', '🍞'], reason: 'Cows give us milk' }
        ];
    }

    return pairs.slice(0, count).map(p => ({
        type: 'matching',
        left: p.left,
        answer: p.right,
        options: p.options,
        reason: p.reason
    }));
}

function generateOddOnePuzzles(count, difficulty) {
    let sets = [];

    if (difficulty === 'easy') {
        sets = [
            { items: ['🍎', '🍊', '🍋', '🚗'], answer: '🚗', reason: 'Car is not a fruit' },
            { items: ['🐶', '🐱', '🐭', '🌳'], answer: '🌳', reason: 'Tree is not an animal' },
            { items: ['⚽', '🏀', '🎾', '🍎'], answer: '🍎', reason: 'Apple is not a ball' },
            { items: ['🟦', '🟥', '🟩', '⭕'], answer: '⭕', reason: 'Circle is not a square' },
            { items: ['😊', '😢', '😡', '🚗'], answer: '🚗', reason: 'Car is not a face' },
            { items: ['🐝', '🦋', '🐛', '🌸'], answer: '🌸', reason: 'Flower is not an insect' }
        ];
    } else if (difficulty === 'medium') {
        sets = [
            { items: ['🍎', '🍊', '🍋', '🍌', '🚗'], answer: '🚗', reason: 'Car is not a fruit' },
            { items: ['🐶', '🐱', '🐭', '🐰', '🌳'], answer: '🌳', reason: 'Tree is not an animal' },
            { items: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '🅰️'], answer: '🅰️', reason: 'Letter is not a number' },
            { items: ['🔴', '🔵', '🟢', '🟡', '🔺'], answer: '🔺', reason: 'Triangle is not a circle' },
            { items: ['😊', '😢', '😡', '🤔', '🚗'], answer: '🚗', reason: 'Car is not an emotion' },
            { items: ['🏠', '🏫', '🏥', '🏦', '🐱'], answer: '🐱', reason: 'Cat is not a building' },
            { items: ['⚽', '🏀', '🎾', '⚾', '🍎'], answer: '🍎', reason: 'Apple is not a sports ball' },
            { items: ['🐝', '🦋', '🐛', '🐜', '🌸'], answer: '🌸', reason: 'Flower is not an insect' }
        ];
    } else {
        sets = [
            { items: ['🍎', '🍊', '🍋', '🍌', '🍇', '🚗'], answer: '🚗', reason: 'Car is not a fruit' },
            { items: ['🐶', '🐱', '🐭', '🐰', '🐹', '🌳'], answer: '🌳', reason: 'Tree is not an animal' },
            { items: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '🅰️'], answer: '🅰️', reason: 'Letter is not a number' },
            { items: ['🔴', '🔵', '🟢', '🟡', '🟠', '🔺'], answer: '🔺', reason: 'Triangle is not a circle' },
            { items: ['😊', '😢', '😡', '🤔', '😴', '🚗'], answer: '🚗', reason: 'Car is not an emotion' },
            { items: ['🏠', '🏫', '🏥', '🏦', '🏪', '🐱'], answer: '🐱', reason: 'Cat is not a building' },
            { items: ['⚽', '🏀', '🎾', '⚾', '🏈', '🍎'], answer: '🍎', reason: 'Apple is not a sports ball' },
            { items: ['🐝', '🦋', '🐛', '🐜', '🦗', '🌸'], answer: '🌸', reason: 'Flower is not an insect' },
            { items: ['🚗', '🚙', '🚕', '🚌', '🚎', '🐶'], answer: '🐶', reason: 'Dog is not a vehicle' },
            { items: ['📚', '📖', '📝', '✏️', '📏', '🍎'], answer: '🍎', reason: 'Apple is not a school supply' }
        ];
    }

    return sets.slice(0, count).map(s => ({
        type: 'oddone',
        items: s.items,
        answer: s.answer,
        reason: s.reason
    }));
}

function generateComparisonPuzzles(count, difficulty) {
    let comparisons = [];

    if (difficulty === 'easy') {
        comparisons = [
            { item1: '🐘', item2: '🐭', question: 'Which is bigger?', answer: '🐘' },
            { item1: '🌳', item2: '🌱', question: 'Which is bigger?', answer: '🌳' },
            { item1: '⭐⭐⭐', item2: '⭐⭐', question: 'Which has more?', answer: '⭐⭐⭐' },
            { item1: '🍎🍎', item2: '🍎🍎🍎🍎', question: 'Which has more?', answer: '🍎🍎🍎🍎' },
            { item1: '🐜', item2: '🐻', question: 'Which is smaller?', answer: '🐜' },
            { item1: '🏀', item2: '⚽', question: 'Which is bigger?', answer: '🏀' }
        ];
    } else if (difficulty === 'medium') {
        comparisons = [
            { item1: '🍪🍪🍪', item2: '🍪🍪🍪🍪🍪', question: 'Which has more?', answer: '🍪🍪🍪🍪🍪' },
            { item1: '🌞', item2: '⭐', question: 'Which is bigger in the sky?', answer: '🌞' },
            { item1: '🚗', item2: '🚂', question: 'Which is longer?', answer: '🚂' },
            { item1: '🎈🎈🎈🎈', item2: '🎈🎈', question: 'Which has less?', answer: '🎈🎈' },
            { item1: '🐘', item2: '🦒', question: 'Which is taller?', answer: '🦒' },
            { item1: '🐢', item2: '🐇', question: 'Which is faster?', answer: '🐇' },
            { item1: '🔥', item2: '❄️', question: 'Which is hotter?', answer: '🔥' },
            { item1: '🪶', item2: '🧱', question: 'Which is heavier?', answer: '🧱' }
        ];
    } else {
        comparisons = [
            { item1: '🍪🍪🍪🍪🍪', item2: '🍪🍪🍪🍪🍪🍪🍪', question: 'Which has more?', answer: '🍪🍪🍪🍪🍪🍪🍪' },
            { item1: '15', item2: '22', question: 'Which number is bigger?', answer: '22' },
            { item1: '8', item2: '5', question: 'Which number is smaller?', answer: '5' },
            { item1: '🌊', item2: '💧', question: 'Which has more water?', answer: '🌊' },
            { item1: '🦕', item2: '🦖', question: 'Which is a carnivore?', answer: '🦖' },
            { item1: '🌙', item2: '☀️', question: 'Which comes at night?', answer: '🌙' },
            { item1: '🌱', item2: '🌳', question: 'Which is older?', answer: '🌳' },
            { item1: '🐌', item2: '🚀', question: 'Which is faster?', answer: '🚀' },
            { item1: '🏔️', item2: '⛰️', question: 'Which is taller?', answer: '🏔️' },
            { item1: '🍉', item2: '🍇', question: 'Which is bigger?', answer: '🍉' }
        ];
    }

    return comparisons.slice(0, count).map(c => ({
        type: 'comparison',
        item1: c.item1,
        item2: c.item2,
        question: c.question,
        answer: c.answer,
        reason: c.reason || c.question // Use reason if available, otherwise use question as reason
    }));
}

function generateLogicPuzzles(count, difficulty) {
    let puzzles = [];

    if (difficulty === 'easy') {
        puzzles = [
            { question: 'I have 2 apples. Mom gives me 1 more. How many do I have?', answer: '3' },
            { question: 'There are 4 birds. 1 flies away. How many are left?', answer: '3' },
            { question: 'Count: 1, 2, 3, ___', answer: '4' },
            { question: 'What color is the sky?', answer: 'blue' },
            { question: 'How many legs does a dog have?', answer: '4' },
            { question: 'What comes after 5? (5, 6, ___)', answer: '7' }
        ];
    } else if (difficulty === 'medium') {
        puzzles = [
            { question: 'I have 3 cookies. I eat 1. Then I get 2 more. How many do I have?', answer: '4' },
            { question: 'There are 5 apples. I eat 2. How many are left?', answer: '3' },
            { question: 'Count by 2s: 2, 4, 6, ___', answer: '8' },
            { question: 'I am big and yellow. I shine in the sky. What am I?', answer: 'sun' },
            { question: 'A cat has 4 legs. Two cats have ___ legs.', answer: '8' },
            { question: 'What day comes after Monday?', answer: 'Tuesday' },
            { question: 'Which is heavier: feather or rock?', answer: 'rock' },
            { question: 'If today is Sunday, yesterday was ___?', answer: 'Saturday' }
        ];
    } else {
        puzzles = [
            { question: 'I have 7 toys. I give 2 to my sister and 1 to my brother. How many do I have?', answer: '4' },
            { question: 'A basket has 12 eggs. 5 break. How many good eggs are left?', answer: '7' },
            { question: 'Count by 5s: 5, 10, 15, ___', answer: '20' },
            { question: 'If 🐱 + 🐱 = 2, then 🐱 + 🐱 + 🐱 = ___', answer: '3' },
            { question: 'A triangle has ___ sides.', answer: '3' },
            { question: 'There are 3 dogs. Each has 2 ears. How many ears total?', answer: '6' },
            { question: 'Which month comes after July?', answer: 'August' },
            { question: 'If 5 + 3 = 8, then 3 + 5 = ___', answer: '8' },
            { question: 'I am cold and white. I fall from the sky in winter. What am I?', answer: 'snow' },
            { question: 'A week has ___ days.', answer: '7' }
        ];
    }

    return puzzles.slice(0, count).map(p => ({
        type: 'logic',
        question: p.question,
        answer: p.answer
    }));
}

// Load Puzzles
function loadPuzzles(difficulty) {
    currentDifficulty = difficulty;

    const counts = {
        easy: { patterns: 8, counting: 8, sequences: 6, matching: 6, oddone: 6, comparison: 6, logic: 6 },
        medium: { patterns: 10, counting: 10, sequences: 8, matching: 8, oddone: 8, comparison: 8, logic: 8 },
        hard: { patterns: 12, counting: 10, sequences: 10, matching: 10, oddone: 10, comparison: 10, logic: 10 }
    };

    let count = counts[difficulty][currentType];
    let problems = [];

    switch(currentType) {
        case 'patterns': problems = generatePatternPuzzles(count, difficulty); break;
        case 'counting': problems = generateCountingPuzzles(count, difficulty); break;
        case 'sequences': problems = generateSequencePuzzles(count, difficulty); break;
        case 'matching': problems = generateMatchingPuzzles(count, difficulty); break;
        case 'oddone': problems = generateOddOnePuzzles(count, difficulty); break;
        case 'comparison': problems = generateComparisonPuzzles(count, difficulty); break;
        case 'logic': problems = generateLogicPuzzles(count, difficulty); break;
    }

    currentWorksheet = {
        type: currentType,
        difficulty,
        problems
    };

    renderWorksheet();
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
                                <input type="checkbox" id="answer-${index}" data-answer="completed" style="width: 25px; height: 25px; margin-right: 10px; vertical-align: middle;">
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
                    <input type="hidden" id="answer-${index}" data-answer="${problem.answer}">
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
                                data-answer="${problem.answer}"
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
                    <input type="hidden" id="answer-${index}" data-answer="${problem.answer}">
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
                    <input type="hidden" id="answer-${index}" data-answer="${problem.answer}">
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
                    <input type="hidden" id="answer-${index}" data-answer="${problem.answer}">
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
                    <input type="hidden" id="answer-${index}" data-answer="${problem.answer}">
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
                                data-answer="${problem.answer}"
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
            <div class="worksheet-header">
                <div class="worksheet-info">
                    <h2>${typeNames[type]} - ${difficultyStars[difficulty]} ${difficulty.toUpperCase()}</h2>
                    <p>${problems.length} puzzles to solve!</p>
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

            <div class="navigation" style="margin-bottom: 20px;">
                <button onclick="backToWorksheetSelection()">← Back to Difficulty</button>
                <button onclick="loadPuzzles('${difficulty}')">New ${difficulty.toUpperCase()} Set</button>
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

    document.body.innerHTML = html;

    setTimeout(() => {
        initializeAllHandwritingInputs();
        // Load saved worksheet after inputs are initialized
        setTimeout(() => {
            loadSavedWorksheet();
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
    const studentName = document.getElementById('student-name')?.value || 'Karthigai Selvi';
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
function loadSavedWorksheet() {
    if (!currentWorksheet) return;

    const identifier = `${currentWorksheet.type}-${currentWorksheet.difficulty}`;
    const savedData = loadWorksheet('aptitude', identifier);

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
    }
}

// Update completion badge on level selection screen
function updateCompletionBadge(type, difficulty) {
    console.log(`Aptitude worksheet ${type}-${difficulty} marked as completed`);
}
