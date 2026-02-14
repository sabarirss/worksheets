// German B1 (DTZ) Worksheet Generator

let currentWorksheet = null;
let timer = null;
let startTime = null;
let elapsedSeconds = 0;

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

// German vocabulary and exercise banks
const germanContent = {
    articles: [
        { word: 'Buch', article: 'das', translation: 'book' },
        { word: 'Mann', article: 'der', translation: 'man' },
        { word: 'Frau', article: 'die', translation: 'woman' },
        { word: 'Kind', article: 'das', translation: 'child' },
        { word: 'Haus', article: 'das', translation: 'house' },
        { word: 'Auto', article: 'das', translation: 'car' },
        { word: 'Tisch', article: 'der', translation: 'table' },
        { word: 'Schule', article: 'die', translation: 'school' },
        { word: 'Computer', article: 'der', translation: 'computer' },
        { word: 'Wohnung', article: 'die', translation: 'apartment' },
        { word: 'Apfel', article: 'der', translation: 'apple' },
        { word: 'Tür', article: 'die', translation: 'door' },
        { word: 'Fenster', article: 'das', translation: 'window' },
        { word: 'Baum', article: 'der', translation: 'tree' },
        { word: 'Blume', article: 'die', translation: 'flower' }
    ],

    caseSentences: [
        { sentence: '___ Mann arbeitet im Büro.', answer: 'Der', case: 'Nominativ' },
        { sentence: 'Ich sehe ___ Frau.', answer: 'die', case: 'Akkusativ' },
        { sentence: 'Das Buch gehört ___ Kind.', answer: 'dem', case: 'Dativ' },
        { sentence: '___ Auto ist neu.', answer: 'Das', case: 'Nominativ' },
        { sentence: 'Sie kauft ___ Buch.', answer: 'ein', case: 'Akkusativ' },
        { sentence: 'Er gibt ___ Mann das Buch.', answer: 'dem', case: 'Dativ' },
        { sentence: 'Ich helfe ___ Frau.', answer: 'der', case: 'Dativ' },
        { sentence: '___ Kinder spielen im Park.', answer: 'Die', case: 'Nominativ' },
        { sentence: 'Wir besuchen ___ Großeltern.', answer: 'die', case: 'Akkusativ' },
        { sentence: 'Das Geschenk ist für ___ Mutter.', answer: 'die', case: 'Akkusativ' }
    ],

    verbExercises: [
        { prompt: 'ich ___ (gehen)', answer: 'gehe', tense: 'Präsens' },
        { prompt: 'du ___ (haben)', answer: 'hast', tense: 'Präsens' },
        { prompt: 'er ___ (sein)', answer: 'ist', tense: 'Präsens' },
        { prompt: 'wir ___ (machen)', answer: 'machen', tense: 'Präsens' },
        { prompt: 'ich ___ (kaufen - Perfekt)', answer: 'habe gekauft', tense: 'Perfekt' },
        { prompt: 'sie ___ (kommen - Perfekt)', answer: 'ist gekommen', tense: 'Perfekt' },
        { prompt: 'er ___ (arbeiten - Präteritum)', answer: 'arbeitete', tense: 'Präteritum' },
        { prompt: 'wir ___ (fahren - Perfekt)', answer: 'sind gefahren', tense: 'Perfekt' },
        { prompt: 'du ___ (sprechen)', answer: 'sprichst', tense: 'Präsens' },
        { prompt: 'Sie ___ (können)', answer: 'können', tense: 'Präsens' }
    ],

    prepositionExercises: [
        { sentence: 'Ich gehe ___ Schule.', answer: 'zur', prep: 'zu + der' },
        { sentence: 'Er kommt ___ Deutschland.', answer: 'aus', prep: 'aus' },
        { sentence: 'Wir fahren ___ Berlin.', answer: 'nach', prep: 'nach' },
        { sentence: 'Das Geschenk ist ___ meine Mutter.', answer: 'für', prep: 'für' },
        { sentence: 'Ich wohne ___ meinen Eltern.', answer: 'bei', prep: 'bei' },
        { sentence: 'Sie arbeitet ___ einer Firma.', answer: 'in', prep: 'in' },
        { sentence: 'Der Tisch steht ___ dem Fenster.', answer: 'vor', prep: 'vor' },
        { sentence: 'Ich fahre ___ dem Bus.', answer: 'mit', prep: 'mit' },
        { sentence: 'Das Bild hängt ___ der Wand.', answer: 'an', prep: 'an' },
        { sentence: 'Wir treffen uns ___ 18 Uhr.', answer: 'um', prep: 'um' }
    ],

    adjectiveExercises: [
        { sentence: 'Das ist ein ___ Haus. (schön)', answer: 'schönes', type: 'Neutrum' },
        { sentence: 'Ich habe einen ___ Freund. (gut)', answer: 'guten', type: 'Maskulinum Akk.' },
        { sentence: 'Die ___ Frau wohnt hier. (alt)', answer: 'alte', type: 'Femininum' },
        { sentence: 'Das ___ Auto ist teuer. (neu)', answer: 'neue', type: 'Neutrum' },
        { sentence: 'Ein ___ Mann wartet. (jung)', answer: 'junger', type: 'Maskulinum' },
        { sentence: 'Ich kaufe eine ___ Tasche. (schwarz)', answer: 'schwarze', type: 'Femininum Akk.' },
        { sentence: 'Die ___ Kinder spielen. (klein)', answer: 'kleinen', type: 'Plural' },
        { sentence: 'Er hat ein ___ Zimmer. (groß)', answer: 'großes', type: 'Neutrum Akk.' }
    ],

    readingPassages: [
        {
            title: 'Wohnungssuche (Apartment Search)',
            text: 'Maria sucht eine neue Wohnung in München. Sie braucht zwei Zimmer, eine Küche und ein Bad. Die Wohnung sollte nicht mehr als 800 Euro pro Monat kosten. Maria arbeitet in der Stadtmitte, deshalb möchte sie in der Nähe von der U-Bahn-Station wohnen. Am Wochenende hat sie drei Wohnungen besichtigt. Die erste Wohnung war zu teuer, die zweite war zu klein, aber die dritte Wohnung war perfekt!',
            questions: [
                { q: 'Wie viele Zimmer braucht Maria?', a: 'zwei' },
                { q: 'Wie viel darf die Wohnung maximal kosten?', a: '800 Euro' },
                { q: 'Wo arbeitet Maria?', a: 'in der Stadtmitte' },
                { q: 'Welche Wohnung hat Maria gefallen?', a: 'die dritte' }
            ]
        },
        {
            title: 'Beim Arzt (At the Doctor)',
            text: 'Herr Schmidt fühlt sich nicht gut. Er hat Kopfschmerzen und Fieber. Am Montag geht er zum Arzt. In der Praxis muss er zuerst seine Versichertenkarte zeigen. Dann wartet er im Wartezimmer. Nach 20 Minuten kommt er dran. Der Arzt untersucht ihn und sagt, dass er eine Grippe hat. Herr Schmidt bekommt ein Rezept für Medikamente und soll drei Tage zu Hause bleiben.',
            questions: [
                { q: 'Welche Symptome hat Herr Schmidt?', a: 'Kopfschmerzen und Fieber' },
                { q: 'Was muss er zuerst in der Praxis zeigen?', a: 'Versichertenkarte' },
                { q: 'Was ist die Diagnose?', a: 'Grippe' },
                { q: 'Wie lange soll er zu Hause bleiben?', a: 'drei Tage' }
            ]
        }
    ],

    vocabularyPairs: [
        { german: 'die Arbeit', english: 'work/job' },
        { german: 'der Termin', english: 'appointment' },
        { german: 'die Bewerbung', english: 'application' },
        { german: 'das Formular', english: 'form' },
        { german: 'die Anmeldung', english: 'registration' },
        { german: 'der Vertrag', english: 'contract' },
        { german: 'die Miete', english: 'rent' },
        { german: 'der Nachbar', english: 'neighbor' },
        { german: 'die Versicherung', english: 'insurance' },
        { german: 'das Amt', english: 'office/authority' },
        { german: 'die Rechnung', english: 'bill/invoice' },
        { german: 'das Konto', english: 'account' },
        { german: 'die Überweisung', english: 'bank transfer' },
        { german: 'der Lebenslauf', english: 'CV/resume' },
        { german: 'die Stelle', english: 'position/job' }
    ],

    writingPrompts: [
        {
            type: 'Informal',
            prompt: 'Schreiben Sie eine E-Mail an einen Freund/eine Freundin. Sie möchten ihn/sie zu Ihrem Geburtstag einladen.',
            points: ['Wann und wo ist die Feier?', 'Was werden Sie machen?', 'Bitten Sie um eine Antwort']
        },
        {
            type: 'Formal',
            prompt: 'Schreiben Sie einen Brief an Ihren Vermieter. In Ihrer Wohnung ist die Heizung kaputt.',
            points: ['Beschreiben Sie das Problem', 'Seit wann ist das Problem?', 'Bitten Sie um schnelle Reparatur']
        },
        {
            type: 'Informal',
            prompt: 'Schreiben Sie eine E-Mail an einen Freund. Sie können nicht zu seiner Party kommen.',
            points: ['Entschuldigen Sie sich', 'Erklären Sie warum', 'Schlagen Sie einen anderen Termin vor']
        }
    ]
};

// Level Configurations
const levelConfigs = {
    'articles': {
        name: 'Artikel (Articles)',
        description: 'Practice der, die, das',
        problemCount: 15,
        type: 'articles'
    },
    'cases': {
        name: 'Fälle (Cases)',
        description: 'Nominativ, Akkusativ, Dativ',
        problemCount: 12,
        type: 'cases'
    },
    'verbs': {
        name: 'Verben (Verbs)',
        description: 'Verb conjugation practice',
        problemCount: 12,
        type: 'verbs'
    },
    'prepositions': {
        name: 'Präpositionen (Prepositions)',
        description: 'Preposition exercises',
        problemCount: 12,
        type: 'prepositions'
    },
    'adjectives': {
        name: 'Adjektivendungen',
        description: 'Adjective endings practice',
        problemCount: 10,
        type: 'adjectives'
    },
    'reading': {
        name: 'Leseverstehen (Reading)',
        description: 'Reading comprehension - DTZ style',
        problemCount: 8,
        type: 'reading'
    },
    'vocabulary': {
        name: 'Wortschatz (Vocabulary)',
        description: 'B1 essential vocabulary',
        problemCount: 15,
        type: 'vocabulary'
    },
    'writing': {
        name: 'Schreiben (Writing)',
        description: 'Writing practice prompts',
        problemCount: 1,
        type: 'writing'
    },
    'modalverbs': {
        name: 'Modalverben (Modal Verbs)',
        description: 'können, müssen, dürfen, sollen, wollen, mögen',
        problemCount: 10,
        type: 'modalverbs'
    },
    'separable': {
        name: 'Trennbare Verben (Separable Verbs)',
        description: 'Separable prefix verbs',
        problemCount: 10,
        type: 'separable'
    },
    'reflexive': {
        name: 'Reflexivverben (Reflexive Verbs)',
        description: 'Reflexive verbs practice',
        problemCount: 10,
        type: 'reflexive'
    },
    'conjunctions': {
        name: 'Konjunktionen (Conjunctions)',
        description: 'weil, dass, wenn, obwohl, etc.',
        problemCount: 10,
        type: 'conjunctions'
    },
    'wordorder': {
        name: 'Wortstellung (Word Order)',
        description: 'Sentence structure practice',
        problemCount: 10,
        type: 'wordorder'
    },
    'comparative': {
        name: 'Komparativ & Superlativ',
        description: 'Comparative and superlative',
        problemCount: 10,
        type: 'comparative'
    },
    'pronouns': {
        name: 'Pronomen (Pronouns)',
        description: 'Personal, possessive, reflexive',
        problemCount: 10,
        type: 'pronouns'
    },
    'relativeclauses': {
        name: 'Relativsätze (Relative Clauses)',
        description: 'Relative pronouns practice',
        problemCount: 10,
        type: 'relativeclauses'
    },
    'konjunktiv': {
        name: 'Konjunktiv II',
        description: 'würde, könnte, wäre, hätte',
        problemCount: 10,
        type: 'konjunktiv'
    },
    'passive': {
        name: 'Passiv (Passive Voice)',
        description: 'Passive voice practice',
        problemCount: 10,
        type: 'passive'
    }
};

// Problem generators
function generateArticleProblems(count) {
    const limitedCount = getDemoLimit(count);
    const shuffled = [...germanContent.articles].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limitedCount).map(item => ({
        type: 'article',
        prompt: `<strong>${item.word}</strong> (${item.translation})`,
        answer: item.article,
        options: ['der', 'die', 'das']
    }));
}

function generateCaseProblems(count) {
    const limitedCount = getDemoLimit(count);
    const shuffled = [...germanContent.caseSentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limitedCount).map(item => ({
        type: 'fillBlank',
        prompt: item.sentence,
        answer: item.answer,
        hint: `(${item.case})`
    }));
}

function generateVerbProblems(count) {
    const limitedCount = getDemoLimit(count);
    const shuffled = [...germanContent.verbExercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limitedCount).map(item => ({
        type: 'verb',
        prompt: item.prompt,
        answer: item.answer,
        hint: item.tense
    }));
}

function generatePrepositionProblems(count) {
    const limitedCount = getDemoLimit(count);
    const shuffled = [...germanContent.prepositionExercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limitedCount).map(item => ({
        type: 'fillBlank',
        prompt: item.sentence,
        answer: item.answer,
        hint: `(${item.prep})`
    }));
}

function generateAdjectiveProblems(count) {
    const limitedCount = getDemoLimit(count);
    const shuffled = [...germanContent.adjectiveExercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limitedCount).map(item => ({
        type: 'fillBlank',
        prompt: item.sentence,
        answer: item.answer,
        hint: `(${item.type})`
    }));
}

function generateReadingProblems() {
    const passage = germanContent.readingPassages[Math.floor(Math.random() * germanContent.readingPassages.length)];
    const problems = [{
        type: 'passage',
        title: passage.title,
        text: passage.text
    }];

    passage.questions.forEach(q => {
        problems.push({
            type: 'comprehension',
            prompt: q.q,
            answer: q.a
        });
    });

    return problems;
}

function generateVocabularyProblems(count) {
    const limitedCount = getDemoLimit(count);
    const shuffled = [...germanContent.vocabularyPairs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limitedCount).map(item => ({
        type: 'vocabulary',
        prompt: `What does "<strong>${item.german}</strong>" mean in English?`,
        answer: item.english
    }));
}

function generateWritingPrompts() {
    const prompt = germanContent.writingPrompts[Math.floor(Math.random() * germanContent.writingPrompts.length)];
    return [{
        type: 'writing',
        writingType: prompt.type,
        prompt: prompt.prompt,
        points: prompt.points
    }];
}

// Load worksheet
function loadWorksheet(level) {
    const config = levelConfigs[level];
    if (!config) return;

    let problems = [];

    switch(config.type) {
        case 'articles':
            problems = generateArticleProblems(config.problemCount);
            break;
        case 'cases':
            problems = generateCaseProblems(config.problemCount);
            break;
        case 'verbs':
            problems = generateVerbProblems(config.problemCount);
            break;
        case 'prepositions':
            problems = generatePrepositionProblems(config.problemCount);
            break;
        case 'adjectives':
            problems = generateAdjectiveProblems(config.problemCount);
            break;
        case 'reading':
            problems = generateReadingProblems();
            break;
        case 'vocabulary':
            problems = generateVocabularyProblems(config.problemCount);
            break;
        case 'writing':
            problems = generateWritingPrompts();
            break;
        case 'modalverbs':
            problems = generateModalVerbsExercises();
            break;
        case 'separable':
            problems = generateSeparableVerbsExercises();
            break;
        case 'reflexive':
            problems = generateReflexiveVerbsExercises();
            break;
        case 'conjunctions':
            problems = generateConjunctionsExercises();
            break;
        case 'wordorder':
            problems = generateWordOrderExercises();
            break;
        case 'comparative':
            problems = generateComparativeExercises();
            break;
        case 'pronouns':
            problems = generatePronounsExercises();
            break;
        case 'relativeclauses':
            problems = generateRelativeClausesExercises();
            break;
        case 'konjunktiv':
            problems = generateKonjunktivExercises();
            break;
        case 'passive':
            problems = generatePassiveExercises();
            break;
    }

    currentWorksheet = {
        level,
        config,
        problems,
        answers: new Array(problems.length).fill('')
    };

    renderWorksheet();
}

// Render worksheet
function renderWorksheet() {
    const { level, config, problems } = currentWorksheet;
    const today = new Date().toLocaleDateString();

    let problemsHTML = '';
    let questionNumber = 1;

    problems.forEach((problem, index) => {
        if (problem.type === 'passage') {
            problemsHTML += `
                <div class="passage-box" style="grid-column: 1 / -1;">
                    <h3>${problem.title}</h3>
                    <p style="line-height: 1.8; margin: 15px 0; padding: 20px; background: #f9f9f9; border-left: 4px solid #000; font-size: 1.1em;">
                        ${problem.text}
                    </p>
                </div>
            `;
        } else if (problem.type === 'writing') {
            problemsHTML += `
                <div class="writing-prompt" style="grid-column: 1 / -1;">
                    <h3>Schreibaufgabe (Writing Task)</h3>
                    <div style="background: #f9f9f9; padding: 20px; margin: 15px 0; border-left: 4px solid #000;">
                        <p style="font-size: 1.1em; margin-bottom: 15px;"><strong>${problem.writingType} ${problem.writingType === 'Formal' ? 'Brief' : 'E-Mail'}</strong></p>
                        <p style="margin-bottom: 15px;">${problem.prompt}</p>
                        <p style="margin-bottom: 10px;"><strong>Punkte zu beachten (Points to include):</strong></p>
                        <ul style="margin-left: 20px;">
                            ${problem.points.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                    <textarea
                        id="answer-${index}"
                        class="writing-textarea"
                        rows="15"
                        style="width: 100%; padding: 15px; font-size: 1em; border: 2px solid #000; font-family: Arial;"
                        placeholder="Schreiben Sie hier Ihren Text... (Write your text here...)"
                    ></textarea>
                </div>
            `;
        } else {
            const hint = problem.hint ? `<span style="color: #666; font-size: 0.9em;">${problem.hint}</span>` : '';
            problemsHTML += `
                <div class="problem">
                    <span class="problem-number">${questionNumber}.</span>
                    <div class="problem-content" style="flex-direction: column; align-items: flex-start;">
                        <div style="margin-bottom: 10px;">
                            ${problem.prompt} ${hint}
                        </div>
                        <input
                            type="text"
                            class="answer-input"
                            id="answer-${index}"
                            data-answer="${problem.answer}"
                            style="width: 100%; max-width: 400px;"
                            onkeypress="handleEnter(event, ${index})"
                        >
                        <span class="answer-feedback" id="feedback-${index}"></span>
                    </div>
                </div>
            `;
            questionNumber++;
        }
    });

    const answerKeyHTML = problems
        .filter(p => p.type !== 'passage' && p.type !== 'writing')
        .map((problem, index) => {
            const qNum = problems.slice(0, index).filter(p => p.type !== 'passage' && p.type !== 'writing').length + 1;
            return `
                <div class="answer-item">
                    ${qNum}. <strong>${problem.answer}</strong>
                </div>
            `;
        }).join('');

    const html = `
        <div class="worksheet-container">
            <div class="navigation" style="margin-bottom: 20px;">
                <button onclick="location.reload()">← Back to Modules</button>
            </div>

            <div class="worksheet-header">
                <div class="worksheet-info">
                    <h2>${config.name}</h2>
                    <p>${config.description}</p>
                </div>
                <div class="student-info">
                    <div class="info-row">
                        <strong>Name:</strong>
                        <input type="text" id="student-name" value="Karthigai Selvi">
                    </div>
                    <div class="info-row">
                        <strong>Datum:</strong>
                        <input type="text" value="${today}" readonly>
                    </div>
                    <div class="info-row">
                        <strong>Zeit:</strong>
                        <span id="elapsed-time">00:00</span>
                    </div>
                </div>
            </div>

            <div class="controls">
                <div class="timer">
                    <span id="timer-display">00:00</span>
                </div>
                <div class="control-buttons">
                    <button onclick="startTimer()">Start Timer</button>
                    <button onclick="stopTimer()">Stop Timer</button>
                    <button onclick="checkAnswers()">Check Answers</button>
                    <button onclick="showAnswerKey()">Show Answer Key</button>
                    <button onclick="savePDF()">Save as PDF</button>
                </div>
            </div>

            <div class="results-summary" id="results-summary"></div>

            <div class="problems-grid">
                ${problemsHTML}
            </div>

            <div class="answer-key" id="answer-key">
                <h3>Lösungen (Answer Key)</h3>
                <div class="answer-key-grid">
                    ${answerKeyHTML}
                </div>
            </div>
        </div>
    `;

    document.body.innerHTML = html;

    setTimeout(() => {
        const firstInput = document.querySelector('input.answer-input, textarea');
        if (firstInput) firstInput.focus();
    }, 100);

    elapsedSeconds = 0;
    updateTimerDisplay();
}

// Timer functions
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

// Helper: Calculate Levenshtein distance for spelling similarity
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

// Helper: Remove German articles from text
function removeArticles(text) {
    return text
        .replace(/\b(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Helper: Evaluate answer with partial credit
function evaluateAnswer(userAnswer, correctAnswer) {
    // Full credit: exact match
    if (userAnswer === correctAnswer) {
        return { score: 1.0, feedback: '✓ Richtig!' };
    }

    // Empty answer
    if (userAnswer === '') {
        return { score: 0.0, feedback: '' };
    }

    // Check without articles (0.9 credit if matches)
    const userWithoutArticles = removeArticles(userAnswer);
    const correctWithoutArticles = removeArticles(correctAnswer);

    if (userWithoutArticles === correctWithoutArticles && userWithoutArticles !== '') {
        return { score: 0.9, feedback: '○ Fast richtig (missing/wrong article)' };
    }

    // Check for minor spelling mistakes (Levenshtein distance)
    const distance = levenshteinDistance(userAnswer, correctAnswer);
    const maxLength = Math.max(userAnswer.length, correctAnswer.length);
    const similarity = 1 - (distance / maxLength);

    // 1-2 character difference: 0.8 credit
    if (distance <= 2 && distance > 0 && similarity >= 0.7) {
        return { score: 0.8, feedback: '△ Teilweise richtig (minor spelling error)' };
    }

    // Check spelling without articles
    if (userWithoutArticles !== '' && correctWithoutArticles !== '') {
        const distanceWithoutArticles = levenshteinDistance(userWithoutArticles, correctWithoutArticles);
        const maxLengthWithoutArticles = Math.max(userWithoutArticles.length, correctWithoutArticles.length);
        const similarityWithoutArticles = 1 - (distanceWithoutArticles / maxLengthWithoutArticles);

        if (distanceWithoutArticles <= 2 && distanceWithoutArticles > 0 && similarityWithoutArticles >= 0.7) {
            return { score: 0.7, feedback: '△ Teilweise richtig (article + spelling)' };
        }
    }

    // Completely wrong
    return { score: 0.0, feedback: '✗ Falsch' };
}

// Check answers with partial credit
function checkAnswers() {
    stopTimer();

    let totalScore = 0;
    let maxScore = 0;

    currentWorksheet.problems.forEach((problem, index) => {
        if (problem.type === 'passage' || problem.type === 'writing') return;

        const input = document.getElementById(`answer-${index}`);
        const feedback = document.getElementById(`feedback-${index}`);
        if (!input) return;

        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = problem.answer.toLowerCase();

        maxScore += 1.0;

        const result = evaluateAnswer(userAnswer, correctAnswer);
        totalScore += result.score;

        // Update feedback and styling
        feedback.textContent = result.feedback;

        if (result.score === 1.0) {
            feedback.style.color = '#00aa00';
            input.style.borderColor = '#00aa00';
        } else if (result.score >= 0.7) {
            feedback.style.color = '#ff8800';
            input.style.borderColor = '#ff8800';
        } else if (result.score > 0) {
            feedback.style.color = '#cc6600';
            input.style.borderColor = '#cc6600';
        } else if (result.feedback === '') {
            input.style.borderColor = '#000';
        } else {
            feedback.style.color = '#cc0000';
            input.style.borderColor = '#cc0000';
        }
    });

    if (maxScore === 0) {
        alert('This is a writing exercise. Please review your text yourself or with a teacher.');
        return;
    }

    const percentage = Math.round((totalScore / maxScore) * 100);
    const fullCorrect = Math.floor(totalScore);
    const partialCorrect = Math.round((totalScore - fullCorrect) * 10) / 10;

    let scoreDisplay = `${fullCorrect}`;
    if (partialCorrect > 0) {
        scoreDisplay += ` + ${partialCorrect.toFixed(1)} partial`;
    }

    const resultsDiv = document.getElementById('results-summary');
    resultsDiv.innerHTML = `
        <h3>Ergebnisse (Results)</h3>
        <div class="score">${scoreDisplay} / ${maxScore} points (${percentage}%)</div>
        <p>Zeit: ${document.getElementById('elapsed-time').textContent}</p>
        <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
            ✓ = Full credit | ○ = 90% (article issue) | △ = 70-80% (spelling error)
        </p>
        ${percentage === 100 ? '<p style="color: #00aa00; font-weight: bold;">Ausgezeichnet! Perfect score!</p>' : ''}
        ${percentage >= 80 && percentage < 100 ? '<p style="color: #0066cc; font-weight: bold;">Sehr gut! Keep practicing!</p>' : ''}
        ${percentage < 80 ? '<p style="color: #cc6600; font-weight: bold;">Weiter üben! Keep practicing!</p>' : ''}
    `;
    resultsDiv.style.display = 'block';
}

function showAnswerKey() {
    const answerKey = document.getElementById('answer-key');
    if (answerKey.style.display === 'none' || answerKey.style.display === '') {
        answerKey.style.display = 'block';
    } else {
        answerKey.style.display = 'none';
    }
}

// Save as PDF
function savePDF() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const filename = `German_B1_${currentWorksheet.level}_${year}${month}${day}_${hours}${minutes}${seconds}.pdf`;

    const controls = document.querySelector('.controls');
    const results = document.getElementById('results-summary');
    const navigation = document.querySelector('.navigation');
    const answerKey = document.getElementById('answer-key');

    const controlsDisplay = controls.style.display;
    const resultsDisplay = results.style.display;
    const navigationDisplay = navigation.style.display;
    const answerKeyDisplay = answerKey.style.display;

    controls.style.display = 'none';
    results.style.display = 'none';
    navigation.style.display = 'none';
    answerKey.style.display = 'none';

    const element = document.querySelector('.worksheet-container');
    const opt = {
        margin: 0.5,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        controls.style.display = controlsDisplay;
        results.style.display = resultsDisplay;
        navigation.style.display = navigationDisplay;
        answerKey.style.display = answerKeyDisplay;
    });
}
