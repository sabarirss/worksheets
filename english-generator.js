// English Worksheet Generator

// State variables for navigation
let selectedAgeGroup = null;
let selectedDifficulty = null;

// Navigation functions
function showAgeGroups() {
    document.getElementById('age-groups').style.display = 'block';
    document.getElementById('difficulties').style.display = 'none';
}

function showDifficulties(ageGroup) {
    selectedAgeGroup = ageGroup;
    document.getElementById('age-groups').style.display = 'none';
    document.getElementById('difficulties').style.display = 'block';

    // Update difficulty descriptions based on selected age
    updateDifficultyDescriptions();
}

function updateDifficultyDescriptions() {
    if (!selectedAgeGroup) return;

    const config = contentConfigs[selectedAgeGroup];
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
    if (selectedAgeGroup && selectedDifficulty) {
        loadWorksheet(selectedAgeGroup, selectedDifficulty);
    }
}

function backToWorksheetSelection() {
    // Hide worksheet content and show difficulty selection
    const worksheetContent = document.getElementById('worksheet-content');
    if (worksheetContent) {
        worksheetContent.style.display = 'none';
    }
    document.getElementById('difficulties').style.display = 'block';
}

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

// Word banks for different levels
const wordBanks = {
    pictureWords: [
        // Animals
        { emoji: '🐶', word: 'dog', blank: 'D_G' },
        { emoji: '🐱', word: 'cat', blank: 'C_T' },
        { emoji: '🐝', word: 'bee', blank: 'B__' },
        { emoji: '🐟', word: 'fish', blank: 'F_SH' },
        { emoji: '🐦', word: 'bird', blank: 'B_RD' },
        { emoji: '🐸', word: 'frog', blank: 'FR_G' },
        { emoji: '🐻', word: 'bear', blank: 'B__R' },
        { emoji: '🦁', word: 'lion', blank: 'L__N' },
        { emoji: '🐘', word: 'elephant', blank: 'EL_PH_NT' },
        { emoji: '🐒', word: 'monkey', blank: 'M_NK_Y' },
        { emoji: '🐄', word: 'cow', blank: 'C_W' },
        { emoji: '🐷', word: 'pig', blank: 'P_G' },
        { emoji: '🐔', word: 'chicken', blank: 'CH_CK_N' },
        { emoji: '🦆', word: 'duck', blank: 'D_CK' },
        { emoji: '🐰', word: 'rabbit', blank: 'R_BB_T' },
        { emoji: '🦋', word: 'butterfly', blank: 'B_TT_RFLY' },
        { emoji: '🐛', word: 'bug', blank: 'B_G' },
        { emoji: '🐜', word: 'ant', blank: '_NT' },
        { emoji: '🐢', word: 'turtle', blank: 'T_RTL_' },
        { emoji: '🦈', word: 'shark', blank: 'SH_RK' },

        // Nature
        { emoji: '🌞', word: 'sun', blank: 'S_N' },
        { emoji: '🌙', word: 'moon', blank: 'M__N' },
        { emoji: '⭐', word: 'star', blank: 'ST_R' },
        { emoji: '☁️', word: 'cloud', blank: 'CL__D' },
        { emoji: '🌧️', word: 'rain', blank: 'R__N' },
        { emoji: '⛈️', word: 'storm', blank: 'ST_RM' },
        { emoji: '🌈', word: 'rainbow', blank: 'R__NB_W' },
        { emoji: '🌳', word: 'tree', blank: 'TR__' },
        { emoji: '🌲', word: 'pine', blank: 'P_NE' },
        { emoji: '🌺', word: 'flower', blank: 'FL_W_R' },
        { emoji: '🌹', word: 'rose', blank: 'R_SE' },
        { emoji: '🌻', word: 'sunflower', blank: 'S_NFL_W_R' },
        { emoji: '🍁', word: 'leaf', blank: 'L__F' },
        { emoji: '🌾', word: 'wheat', blank: 'WH__T' },
        { emoji: '🏔️', word: 'mountain', blank: 'M__NT__N' },
        { emoji: '🌊', word: 'wave', blank: 'W_VE' },
        { emoji: '🔥', word: 'fire', blank: 'F_RE' },
        { emoji: '💧', word: 'drop', blank: 'DR_P' },

        // Food
        { emoji: '🍎', word: 'apple', blank: 'APP_E' },
        { emoji: '🍊', word: 'orange', blank: '_R_NGE' },
        { emoji: '🍋', word: 'lemon', blank: 'L_M_N' },
        { emoji: '🍌', word: 'banana', blank: 'B_N_N_' },
        { emoji: '🍇', word: 'grapes', blank: 'GR_P_S' },
        { emoji: '🍓', word: 'strawberry', blank: 'STR_WB_RRY' },
        { emoji: '🍉', word: 'watermelon', blank: 'W_T_RM_L_N' },
        { emoji: '🍞', word: 'bread', blank: 'BR__D' },
        { emoji: '🥖', word: 'baguette', blank: 'B_GU_TTE' },
        { emoji: '🥚', word: 'egg', blank: '_GG' },
        { emoji: '🧀', word: 'cheese', blank: 'CH__SE' },
        { emoji: '🥛', word: 'milk', blank: 'M_LK' },
        { emoji: '🍕', word: 'pizza', blank: 'P_ZZ_' },
        { emoji: '🍔', word: 'burger', blank: 'B_RG_R' },
        { emoji: '🍰', word: 'cake', blank: 'C_KE' },
        { emoji: '🍪', word: 'cookie', blank: 'C__K__' },
        { emoji: '🍦', word: 'icecream', blank: '_C_CR__M' },

        // Objects & Things
        { emoji: '🚗', word: 'car', blank: 'C_R' },
        { emoji: '🚌', word: 'bus', blank: 'B_S' },
        { emoji: '🚂', word: 'train', blank: 'TR__N' },
        { emoji: '✈️', word: 'plane', blank: 'PL_NE' },
        { emoji: '🚁', word: 'helicopter', blank: 'H_L_C_PT_R' },
        { emoji: '🚲', word: 'bike', blank: 'B_KE' },
        { emoji: '⛵', word: 'boat', blank: 'B__T' },
        { emoji: '🚀', word: 'rocket', blank: 'R_CK_T' },
        { emoji: '🎈', word: 'balloon', blank: 'B_LL__N' },
        { emoji: '🎁', word: 'gift', blank: 'G_FT' },
        { emoji: '🎨', word: 'paint', blank: 'P__NT' },
        { emoji: '✏️', word: 'pencil', blank: 'P_NC_L' },
        { emoji: '📚', word: 'book', blank: 'B__K' },
        { emoji: '📖', word: 'notebook', blank: 'N_T_B__K' },
        { emoji: '📝', word: 'paper', blank: 'P_P_R' },
        { emoji: '✂️', word: 'scissors', blank: 'SC_SS_RS' },
        { emoji: '🖍️', word: 'crayon', blank: 'CR_Y_N' },
        { emoji: '🎒', word: 'backpack', blank: 'B_CKP_CK' },
        { emoji: '👓', word: 'glasses', blank: 'GL_SS_S' },
        { emoji: '⌚', word: 'watch', blank: 'W_TCH' },
        { emoji: '📱', word: 'phone', blank: 'PH_NE' },
        { emoji: '💻', word: 'laptop', blank: 'L_PT_P' },
        { emoji: '🖥️', word: 'computer', blank: 'C_MP_T_R' },
        { emoji: '⚽', word: 'soccer', blank: 'S_CC_R' },
        { emoji: '🏀', word: 'basketball', blank: 'B_SK_TB_LL' },
        { emoji: '⚾', word: 'baseball', blank: 'B_S_B_LL' },
        { emoji: '🎾', word: 'tennis', blank: 'T_NN_S' },
        { emoji: '🎸', word: 'guitar', blank: 'G__T_R' },
        { emoji: '🎹', word: 'piano', blank: 'P__N_' },
        { emoji: '🎺', word: 'trumpet', blank: 'TR_MP_T' },
        { emoji: '🥁', word: 'drum', blank: 'DR_M' },

        // Places & Buildings
        { emoji: '🏠', word: 'house', blank: 'H__SE' },
        { emoji: '🏫', word: 'school', blank: 'SCH__L' },
        { emoji: '🏥', word: 'hospital', blank: 'H_SP_T_L' },
        { emoji: '🏪', word: 'store', blank: 'ST_RE' },
        { emoji: '🏦', word: 'bank', blank: 'B_NK' },
        { emoji: '🏨', word: 'hotel', blank: 'H_T_L' },
        { emoji: '⛪', word: 'church', blank: 'CH_RCH' },
        { emoji: '🏰', word: 'castle', blank: 'C_STL_' },
        { emoji: '🗼', word: 'tower', blank: 'T_W_R' },
        { emoji: '🌉', word: 'bridge', blank: 'BR_DGE' },

        // Body Parts
        { emoji: '👁️', word: 'eye', blank: '_YE' },
        { emoji: '👂', word: 'ear', blank: '_AR' },
        { emoji: '👃', word: 'nose', blank: 'N_SE' },
        { emoji: '👄', word: 'mouth', blank: 'M__TH' },
        { emoji: '✋', word: 'hand', blank: 'H_ND' },
        { emoji: '🦶', word: 'foot', blank: 'F__T' },
        { emoji: '🦷', word: 'tooth', blank: 'T__TH' },
        { emoji: '💪', word: 'arm', blank: '_RM' },
        { emoji: '🦴', word: 'bone', blank: 'B_NE' },
        { emoji: '❤️', word: 'heart', blank: 'H__RT' },

        // Colors & Shapes
        { emoji: '🔴', word: 'red', blank: 'R_D' },
        { emoji: '🔵', word: 'blue', blank: 'BL__' },
        { emoji: '🟡', word: 'yellow', blank: 'Y_LL_W' },
        { emoji: '🟢', word: 'green', blank: 'GR__N' },
        { emoji: '🟣', word: 'purple', blank: 'P_RPL_' },
        { emoji: '🟠', word: 'orange', blank: '_R_NG_' },
        { emoji: '⚪', word: 'white', blank: 'WH_TE' },
        { emoji: '⚫', word: 'black', blank: 'BL_CK' },
        { emoji: '🔺', word: 'triangle', blank: 'TR__NGL_' },
        { emoji: '⭕', word: 'circle', blank: 'C_RCL_' },
        { emoji: '⬜', word: 'square', blank: 'SQ__RE' }
    ],
    sightWords1: ['the', 'and', 'is', 'a', 'to', 'in', 'it', 'of', 'he', 'she', 'we', 'can', 'see', 'you', 'me', 'my', 'for', 'are', 'be', 'on'],
    sightWords2: ['have', 'they', 'has', 'with', 'from', 'this', 'that', 'said', 'will', 'there', 'what', 'when', 'where', 'who', 'how', 'out', 'up', 'down', 'but', 'not'],
    nouns: ['cat', 'dog', 'house', 'tree', 'book', 'car', 'ball', 'sun', 'moon', 'star', 'bird', 'fish', 'table', 'chair', 'door', 'window'],
    verbs: ['run', 'jump', 'play', 'eat', 'sleep', 'read', 'write', 'sing', 'dance', 'walk', 'talk', 'swim', 'fly', 'sit', 'stand'],
    adjectives: ['big', 'small', 'happy', 'sad', 'fast', 'slow', 'hot', 'cold', 'new', 'old', 'good', 'bad', 'tall', 'short', 'long'],
    synonymPairs: [
        ['happy', 'joyful'], ['big', 'large'], ['small', 'tiny'], ['fast', 'quick'], ['smart', 'intelligent'],
        ['pretty', 'beautiful'], ['angry', 'mad'], ['tired', 'sleepy'], ['brave', 'courageous'], ['funny', 'humorous']
    ],
    antonymPairs: [
        ['hot', 'cold'], ['big', 'small'], ['up', 'down'], ['happy', 'sad'], ['fast', 'slow'],
        ['good', 'bad'], ['day', 'night'], ['old', 'new'], ['tall', 'short'], ['heavy', 'light']
    ]
};

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
    '4-5': {
        easy: {
            name: 'Ages 4-5 - Easy English',
            description: 'Picture words with emojis',
            problemCount: 15,
            type: 'pictureWords',
            wordList: wordBanks.pictureWords
        },
        medium: {
            name: 'Ages 4-5 - Medium English',
            description: 'Basic sight words',
            problemCount: 12,
            type: 'sightWords',
            wordList: wordBanks.sightWords1
        },
        hard: {
            name: 'Ages 4-5 - Hard English',
            description: 'Simple letter tracing',
            problemCount: 15,
            type: 'pictureWords',
            wordList: wordBanks.pictureWords
        }
    },
    '6': {
        easy: {
            name: 'Age 6 - Easy English',
            description: 'Basic sight words',
            problemCount: 15,
            type: 'sightWords',
            wordList: wordBanks.sightWords1
        },
        medium: {
            name: 'Age 6 - Medium English',
            description: 'Simple sentences',
            problemCount: 12,
            type: 'sentenceFill',
            difficulty: 'easy'
        },
        hard: {
            name: 'Age 6 - Hard English',
            description: 'Sentence completion',
            problemCount: 12,
            type: 'sentenceCompletion',
            difficulty: 'medium'
        }
    },
    '7': {
        easy: {
            name: 'Age 7 - Easy English',
            description: 'Simple sentences',
            problemCount: 12,
            type: 'sentenceFill',
            difficulty: 'easy'
        },
        medium: {
            name: 'Age 7 - Medium English',
            description: 'Grammar basics',
            problemCount: 12,
            type: 'sentenceCompletion',
            difficulty: 'medium'
        },
        hard: {
            name: 'Age 7 - Hard English',
            description: 'Synonyms & antonyms',
            problemCount: 15,
            type: 'synonymsAntonyms'
        }
    },
    '8': {
        easy: {
            name: 'Age 8 - Easy English',
            description: 'Vocabulary building',
            problemCount: 15,
            type: 'synonymsAntonyms'
        },
        medium: {
            name: 'Age 8 - Medium English',
            description: 'Parts of speech',
            problemCount: 15,
            type: 'partsOfSpeech'
        },
        hard: {
            name: 'Age 8 - Hard English',
            description: 'Reading comprehension',
            problemCount: 8,
            type: 'readingComprehension'
        }
    },
    '9+': {
        easy: {
            name: 'Ages 9+ - Easy English',
            description: 'Advanced grammar',
            problemCount: 15,
            type: 'partsOfSpeech'
        },
        medium: {
            name: 'Ages 9+ - Medium English',
            description: 'Reading comprehension',
            problemCount: 8,
            type: 'readingComprehension'
        },
        hard: {
            name: 'Ages 9+ - Hard English',
            description: 'Advanced writing',
            problemCount: 12,
            type: 'advancedGrammar'
        }
    },
    '10+': {
        easy: {
            name: 'Ages 10+ - Easy English',
            description: 'Complex reading',
            problemCount: 8,
            type: 'readingComprehension'
        },
        medium: {
            name: 'Ages 10+ - Medium English',
            description: 'Essay writing',
            problemCount: 10,
            type: 'advancedGrammar'
        },
        hard: {
            name: 'Ages 10+ - Hard English',
            description: 'Creative writing',
            problemCount: 8,
            type: 'advancedGrammar'
        }
    }
};

// Problem generators
function generatePictureWordProblems(wordList, count) {
    const problems = [];
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const item = shuffled[i];
        problems.push({
            type: 'pictureWord',
            emoji: item.emoji,
            blank: item.blank,
            prompt: `Complete the word`,
            answer: item.word
        });
    }
    return problems;
}

function generateSightWordProblems(wordList, count) {
    const problems = [];
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        problems.push({
            type: 'write',
            prompt: `Write the word: <strong>${shuffled[i]}</strong>`,
            answer: shuffled[i]
        });
    }
    return problems;
}

function generateSentenceFillProblems(count, difficulty) {
    const sentences = [
        { text: 'The cat ___ on the mat.', answer: 'sat', options: ['sat', 'stand', 'jump'] },
        { text: 'I ___ a red ball.', answer: 'have', options: ['have', 'has', 'had'] },
        { text: 'She ___ to school every day.', answer: 'goes', options: ['goes', 'go', 'went'] },
        { text: 'The sun ___ in the sky.', answer: 'shines', options: ['shines', 'shine', 'shining'] },
        { text: 'We ___ our homework.', answer: 'do', options: ['do', 'does', 'did'] },
        { text: 'The bird ___ in the tree.', answer: 'sits', options: ['sits', 'sit', 'sitting'] },
        { text: 'They ___ playing in the park.', answer: 'are', options: ['are', 'is', 'am'] },
        { text: 'My dog ___ very fast.', answer: 'runs', options: ['runs', 'run', 'running'] },
        { text: 'I ___ a book yesterday.', answer: 'read', options: ['read', 'reads', 'reading'] },
        { text: 'The flowers ___ beautiful.', answer: 'are', options: ['are', 'is', 'am'] },
        { text: 'He ___ his breakfast.', answer: 'eats', options: ['eats', 'eat', 'eating'] },
        { text: 'The baby ___ loudly.', answer: 'cries', options: ['cries', 'cry', 'crying'] }
    ];

    const shuffled = [...sentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(s => ({
        type: 'fill',
        prompt: s.text,
        answer: s.answer,
        options: s.options
    }));
}

function generateSynonymAntonymProblems(count) {
    const problems = [];
    const halfCount = Math.floor(count / 2);

    // Synonyms
    const synonyms = [...wordBanks.synonymPairs].sort(() => Math.random() - 0.5);
    for (let i = 0; i < halfCount && i < synonyms.length; i++) {
        problems.push({
            type: 'synonym',
            prompt: `Write a synonym for: <strong>${synonyms[i][0]}</strong>`,
            answer: synonyms[i][1],
            acceptableAnswers: [synonyms[i][1]]
        });
    }

    // Antonyms
    const antonyms = [...wordBanks.antonymPairs].sort(() => Math.random() - 0.5);
    for (let i = 0; i < (count - halfCount) && i < antonyms.length; i++) {
        problems.push({
            type: 'antonym',
            prompt: `Write an antonym for: <strong>${antonyms[i][0]}</strong>`,
            answer: antonyms[i][1],
            acceptableAnswers: [antonyms[i][1]]
        });
    }

    return problems.sort(() => Math.random() - 0.5);
}

function generatePartsOfSpeechProblems(count) {
    const sentences = [
        { sentence: 'The big dog runs fast.', word: 'dog', answer: 'noun' },
        { sentence: 'The big dog runs fast.', word: 'big', answer: 'adjective' },
        { sentence: 'The big dog runs fast.', word: 'runs', answer: 'verb' },
        { sentence: 'She quickly ate her lunch.', word: 'ate', answer: 'verb' },
        { sentence: 'The happy children play outside.', word: 'happy', answer: 'adjective' },
        { sentence: 'The happy children play outside.', word: 'children', answer: 'noun' },
        { sentence: 'A small bird flew away.', word: 'small', answer: 'adjective' },
        { sentence: 'A small bird flew away.', word: 'flew', answer: 'verb' },
        { sentence: 'The old tree stands tall.', word: 'tree', answer: 'noun' },
        { sentence: 'My cat sleeps quietly.', word: 'cat', answer: 'noun' },
        { sentence: 'The blue car drives slowly.', word: 'blue', answer: 'adjective' },
        { sentence: 'They swim in the pool.', word: 'swim', answer: 'verb' },
        { sentence: 'A bright star shines tonight.', word: 'bright', answer: 'adjective' },
        { sentence: 'The teacher reads a book.', word: 'reads', answer: 'verb' },
        { sentence: 'Fresh bread smells good.', word: 'bread', answer: 'noun' }
    ];

    const shuffled = [...sentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(s => ({
        type: 'partsOfSpeech',
        prompt: `"${s.sentence}" - What part of speech is "<strong>${s.word}</strong>"?`,
        answer: s.answer,
        options: ['noun', 'verb', 'adjective']
    }));
}

function generateReadingComprehension(count) {
    const passages = [
        {
            text: 'Tom has a pet dog named Max. Max is a golden retriever. He loves to play fetch in the park. Every morning, Tom takes Max for a walk. Max is a very friendly dog.',
            questions: [
                { q: 'What is the dog\'s name?', a: 'Max' },
                { q: 'What kind of dog is Max?', a: 'golden retriever' },
                { q: 'What does Max love to play?', a: 'fetch' }
            ]
        },
        {
            text: 'Sarah loves to read books. She goes to the library every week. Her favorite books are about animals. She has read ten books this month. Reading makes her happy.',
            questions: [
                { q: 'Where does Sarah go every week?', a: 'library' },
                { q: 'What are her favorite books about?', a: 'animals' },
                { q: 'How many books has she read this month?', a: 'ten' }
            ]
        }
    ];

    const passage = passages[Math.floor(Math.random() * passages.length)];
    const problems = [];

    problems.push({
        type: 'passage',
        text: passage.text
    });

    passage.questions.forEach((q, i) => {
        problems.push({
            type: 'comprehension',
            prompt: q.q,
            answer: q.a
        });
    });

    return problems;
}

function generateAdvancedGrammarProblems(count) {
    const problems = [
        { prompt: 'Correct the sentence: "She don\'t like apples."', answer: 'She doesn\'t like apples.' },
        { prompt: 'Add punctuation: "what time is it"', answer: 'What time is it?' },
        { prompt: 'Make plural: "The child plays."', answer: 'The children play.' },
        { prompt: 'Change to past tense: "I walk to school."', answer: 'I walked to school.' },
        { prompt: 'Correct: "Me and Tom went home."', answer: 'Tom and I went home.' },
        { prompt: 'Add capital letters: "we live in london."', answer: 'We live in London.' },
        { prompt: 'Change to future tense: "She eats lunch."', answer: 'She will eat lunch.' },
        { prompt: 'Correct: "Their going to the store."', answer: 'They\'re going to the store.' },
        { prompt: 'Make possessive: "The book belongs to John."', answer: 'John\'s book' },
        { prompt: 'Correct: "He run fast."', answer: 'He runs fast.' },
        { prompt: 'Add commas: "I like apples oranges and bananas."', answer: 'I like apples, oranges, and bananas.' },
        { prompt: 'Change to question: "You are happy."', answer: 'Are you happy?' }
    ];

    const shuffled = [...problems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(p => ({
        type: 'grammar',
        prompt: p.prompt,
        answer: p.answer
    }));
}

// Load worksheet for specific age group and difficulty
function loadWorksheet(ageGroup, difficulty) {
    // Special handling for writing practice
    if (ageGroup === 'writing') {
        document.querySelector('.level-selection').style.display = 'none';
        document.body.innerHTML = generateWritingWorksheet();
        setTimeout(() => {
            initializeAllCanvases();
        }, 100);
        return;
    }

    const config = contentConfigs[ageGroup]?.[difficulty];
    if (!config) {
        console.error(`No config found for: ${ageGroup}, ${difficulty}`);
        return;
    }

    let problems = [];

    switch(config.type) {
        case 'pictureWords':
            problems = generatePictureWordProblems(config.wordList, config.problemCount);
            break;
        case 'sightWords':
            problems = generateSightWordProblems(config.wordList, config.problemCount);
            break;
        case 'sentenceFill':
        case 'sentenceCompletion':
            problems = generateSentenceFillProblems(config.problemCount, config.difficulty);
            break;
        case 'synonymsAntonyms':
            problems = generateSynonymAntonymProblems(config.problemCount);
            break;
        case 'partsOfSpeech':
            problems = generatePartsOfSpeechProblems(config.problemCount);
            break;
        case 'readingComprehension':
            problems = generateReadingComprehension(config.problemCount);
            break;
        case 'advancedGrammar':
            problems = generateAdvancedGrammarProblems(config.problemCount);
            break;
    }

    currentWorksheet = {
        ageGroup,
        difficulty,
        config,
        problems,
        answers: new Array(problems.length).fill('')
    };

    renderWorksheet();
}

// Render the worksheet
function renderWorksheet() {
    const { ageGroup, difficulty, config, problems } = currentWorksheet;
    const today = new Date().toLocaleDateString();

    let problemsHTML = '';
    let questionNumber = 1;

    problems.forEach((problem, index) => {
        if (problem.type === 'passage') {
            problemsHTML += `
                <div class="passage-box" style="grid-column: 1 / -1;">
                    <h3>Read the passage:</h3>
                    <p style="line-height: 1.8; margin: 15px 0; padding: 15px; background: #f9f9f9; border-left: 3px solid #000;">
                        ${problem.text}
                    </p>
                </div>
            `;
        } else if (problem.type === 'pictureWord') {
            problemsHTML += `
                <div class="problem picture-word-problem">
                    <span class="problem-number">${questionNumber}.</span>
                    <div class="problem-content" style="flex-direction: column; align-items: center; text-align: center;">
                        <div class="picture-emoji" style="font-size: 4em; margin: 10px 0;">${problem.emoji}</div>
                        <div class="word-blank" style="font-size: 1.8em; font-weight: bold; letter-spacing: 0.3em; margin: 15px 0; font-family: 'Courier New', monospace;">
                            ${problem.blank}
                        </div>
                        <div class="handwriting-input-container" style="margin: 15px 0;">
                            <canvas
                                id="answer-${index}"
                                class="handwriting-input"
                                data-width="250"
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
            questionNumber++;
        } else {
            problemsHTML += `
                <div class="problem">
                    <span class="problem-number">${questionNumber}.</span>
                    <div class="problem-content" style="flex-direction: column; align-items: flex-start;">
                        <div style="margin-bottom: 10px;">${problem.prompt}</div>
                        <div class="handwriting-input-container" style="margin: 15px 0;">
                            <canvas
                                id="answer-${index}"
                                class="handwriting-input"
                                data-width="400"
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
            questionNumber++;
        }
    });

    const answerKeyHTML = problems
        .filter(p => p.type !== 'passage')
        .map((problem, index) => {
            const qNum = problems.slice(0, index).filter(p => p.type !== 'passage').length + 1;
            return `
                <div class="answer-item">
                    ${qNum}. <strong>${problem.answer}</strong>
                </div>
            `;
        }).join('');

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

            <div class="navigation" style="margin-bottom: 20px;">
                <button class="back-btn" onclick="backToWorksheetSelection()" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">← Back to Difficulty</button>
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

            <div class="problems-grid">
                ${problemsHTML}
            </div>

            <div class="answer-key" id="answer-key">
                <h3>Answer Key</h3>
                <div class="answer-key-grid">
                    ${answerKeyHTML}
                </div>
            </div>

            <div class="navigation" style="margin-top: 20px;">
                <div id="answer-toggle-container" class="answer-toggle-container" style="display: inline-block; margin-right: 20px;">
                    <span class="answer-toggle-label">👀 Show Answers</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="answer-toggle-input" onchange="toggleAnswers(event)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    document.body.innerHTML = html;

    // Initialize handwriting inputs
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

function handleEnter(event, index) {
    if (event.key === 'Enter') {
        event.preventDefault();
        // Find next input (skip passages)
        let nextIndex = index + 1;
        let nextInput = null;
        while (nextIndex < currentWorksheet.problems.length && !nextInput) {
            nextInput = document.getElementById(`answer-${nextIndex}`);
            nextIndex++;
        }
        if (nextInput) {
            nextInput.focus();
        } else {
            checkAnswers();
        }
    }
}

// Check answers
function checkAnswers() {
    stopTimer();

    let total = 0;

    currentWorksheet.problems.forEach((problem, index) => {
        if (problem.type === 'passage') return;

        const canvas = document.getElementById(`answer-${index}`);
        const feedback = document.getElementById(`feedback-${index}`);
        if (!canvas) return;

        const correctAnswer = problem.answer;
        total++;

        // Update feedback (RIGHT of canvas, NOT on canvas) - just the value, no "Answer:" prefix
        feedback.textContent = correctAnswer;
        feedback.style.color = '#4caf50';
        feedback.style.fontSize = '1.5em';
        feedback.style.fontWeight = 'bold';
        feedback.style.display = 'inline';
    });

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
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const filename = `English_${currentWorksheet.ageGroup}_${currentWorksheet.difficulty}_${year}${month}${day}_${hours}${minutes}${seconds}.pdf`;

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
        if (answerKey) answerKey.style.display = answerKeyDisplay;
    });
}

// Toggle answer visibility
function toggleAnswers(event) {
    answersVisible = event ? event.target.checked : !answersVisible;

    currentWorksheet.problems.forEach((problem, index) => {
        if (problem.type === 'passage') return;
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

    const identifier = `${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}`;
    const studentName = document.getElementById('student-name')?.value || 'Karthigai Selvi';
    const elapsedTime = document.getElementById('elapsed-time')?.textContent || '00:00';

    // Collect canvas answers
    const canvasAnswers = [];
    currentWorksheet.problems.forEach((problem, index) => {
        if (problem.type === 'passage') return;
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

    if (saveWorksheet('english', identifier, data)) {
        alert('Worksheet saved successfully!');
        updateCompletionBadge(identifier);
    }
}

// Load saved worksheet
function loadSavedWorksheet() {
    if (!currentWorksheet) return;

    const identifier = `${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}`;
    const savedData = loadWorksheet('english', identifier);

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
            if (problem.type === 'passage') return;
            const feedback = document.getElementById(`feedback-${index}`);
            if (feedback) {
                feedback.style.display = 'none';
            }
        });
    }
}

// Update completion badge on level selection screen
function updateCompletionBadge(level) {
    console.log(`English worksheet ${level} marked as completed`);
}
