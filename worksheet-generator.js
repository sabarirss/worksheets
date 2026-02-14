// Math Worksheet Generator

// Navigation functions
function showSubjects() {
    document.querySelector('.subject-selection').style.display = 'block';
    document.getElementById('math-operations').style.display = 'none';
    hideAllOperationLevels();
}

function showMathLevels() {
    document.querySelector('.subject-selection').style.display = 'none';
    document.getElementById('math-operations').style.display = 'block';
    hideAllOperationLevels();
}

function showOperation(operation) {
    document.getElementById('math-operations').style.display = 'none';
    hideAllOperationLevels();
    document.getElementById(`${operation}-levels`).style.display = 'block';
}

function hideAllOperationLevels() {
    ['addition', 'subtraction', 'multiplication', 'division'].forEach(op => {
        const elem = document.getElementById(`${op}-levels`);
        if (elem) elem.style.display = 'none';
    });
}

let currentWorksheet = null;
let currentOperation = null;
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

// Level Configurations (progressive difficulty)
const levelConfigs = {
    addition: {
        '6A': {
            name: 'Level 6A - Addition to 5',
            description: 'Simple addition with sums up to 5',
            problemCount: 20,
            generator: () => generateSimpleAddition(1, 4, 5)
        },
        '5A': {
            name: 'Level 5A - Addition to 10',
            description: 'Addition with sums up to 10',
            problemCount: 20,
            generator: () => generateSimpleAddition(1, 9, 10)
        },
        '4A': {
            name: 'Level 4A - Addition to 20',
            description: 'Addition with sums up to 20',
            problemCount: 20,
            generator: () => generateSimpleAddition(5, 15, 20)
        },
        '3A': {
            name: 'Level 3A - Two-digit + One-digit',
            description: 'Adding one-digit numbers to two-digit numbers',
            problemCount: 20,
            generator: () => generateMixedAddition(10, 99, 1, 9)
        },
        '2A': {
            name: 'Level 2A - Two-digit + Two-digit',
            description: 'Adding two-digit numbers',
            problemCount: 20,
            generator: () => generateMixedAddition(10, 99, 10, 99)
        }
    },
    subtraction: {
        '6A': {
            name: 'Level 6A - Subtraction within 5',
            description: 'Simple subtraction with numbers up to 5',
            problemCount: 20,
            generator: () => generateSimpleSubtraction(1, 5)
        },
        '5A': {
            name: 'Level 5A - Subtraction within 10',
            description: 'Subtraction with numbers up to 10',
            problemCount: 20,
            generator: () => generateSimpleSubtraction(1, 10)
        },
        '4A': {
            name: 'Level 4A - Subtraction within 20',
            description: 'Subtraction with numbers up to 20',
            problemCount: 20,
            generator: () => generateSimpleSubtraction(5, 20)
        },
        '3A': {
            name: 'Level 3A - Two-digit - One-digit',
            description: 'Subtracting one-digit numbers from two-digit numbers',
            problemCount: 20,
            generator: () => generateMixedSubtraction(10, 99, 1, 9)
        },
        '2A': {
            name: 'Level 2A - Two-digit - Two-digit',
            description: 'Subtracting two-digit numbers',
            problemCount: 20,
            generator: () => generateMixedSubtraction(20, 99, 10, 30)
        }
    },
    multiplication: {
        '6A': {
            name: 'Level 6A - Multiply by 1 and 2',
            description: 'Simple multiplication with 1 and 2',
            problemCount: 20,
            generator: () => generateMultiplication([1, 2], 1, 10)
        },
        '5A': {
            name: 'Level 5A - Multiply by 3, 4, 5',
            description: 'Multiplication tables 3, 4, and 5',
            problemCount: 20,
            generator: () => generateMultiplication([3, 4, 5], 1, 10)
        },
        '4A': {
            name: 'Level 4A - Multiply by 6, 7, 8, 9',
            description: 'Multiplication tables 6, 7, 8, and 9',
            problemCount: 20,
            generator: () => generateMultiplication([6, 7, 8, 9], 1, 10)
        },
        '3A': {
            name: 'Level 3A - Two-digit × One-digit',
            description: 'Multiplying two-digit by one-digit numbers',
            problemCount: 20,
            generator: () => generateAdvancedMultiplication(10, 99, 2, 9)
        },
        '2A': {
            name: 'Level 2A - Two-digit × Two-digit',
            description: 'Multiplying two-digit numbers',
            problemCount: 20,
            generator: () => generateAdvancedMultiplication(10, 50, 10, 50)
        }
    },
    division: {
        '6A': {
            name: 'Level 6A - Divide by 1 and 2',
            description: 'Simple division by 1 and 2',
            problemCount: 20,
            generator: () => generateDivision([1, 2], 1, 20)
        },
        '5A': {
            name: 'Level 5A - Divide by 3, 4, 5',
            description: 'Division by 3, 4, and 5',
            problemCount: 20,
            generator: () => generateDivision([3, 4, 5], 1, 10)
        },
        '4A': {
            name: 'Level 4A - Divide by 6, 7, 8, 9',
            description: 'Division by 6, 7, 8, and 9',
            problemCount: 20,
            generator: () => generateDivision([6, 7, 8, 9], 1, 10)
        },
        '3A': {
            name: 'Level 3A - Two-digit ÷ One-digit',
            description: 'Dividing two-digit by one-digit numbers',
            problemCount: 20,
            generator: () => generateAdvancedDivision(10, 99, 2, 9, false)
        },
        '2A': {
            name: 'Level 2A - Division with Remainders',
            description: 'Division with remainders',
            problemCount: 20,
            generator: () => generateAdvancedDivision(10, 99, 2, 9, true)
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

// Load worksheet for specific level and page
function loadWorksheet(operation, level, page = 1) {
    currentOperation = operation;
    currentPage = page;
    const config = levelConfigs[operation][level];
    if (!config) return;

    // Initialize seeded random with page number for deterministic generation
    const seed = hashCode(`${operation}-${level}-${page}`);
    seededRandom = new SeededRandom(seed);

    // Generate problems
    const problems = [];
    for (let i = 0; i < config.problemCount; i++) {
        problems.push(config.generator());
    }

    currentWorksheet = {
        operation,
        level,
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
    const { operation, level, config, problems } = currentWorksheet;
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
                <button class="back-btn" onclick="location.reload()" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 12px 24px; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">🏠 Back to Levels</button>
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
                ${currentPage >= totalPages ? '<button class="generate-more-btn" onclick="generateMorePages()" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); margin-left: 20px;">➕ Generate 50 More Pages</button>' : ''}
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
    const filename = `${operationName}_${currentWorksheet.level}_Page${currentPage}_${year}${month}${day}_${hours}${minutes}${seconds}.pdf`;

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

    const identifier = `${currentWorksheet.operation}-${currentWorksheet.level}-page${currentPage}`;
    const studentName = document.getElementById('student-name')?.value || 'Karthigai Selvi';
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
        updateCompletionBadge(currentWorksheet.operation, currentWorksheet.level);
    }
}

// Load saved worksheet
function loadSavedWorksheet() {
    console.log('=== LOAD SAVED START ===');
    if (!currentWorksheet) {
        console.error('loadSavedWorksheet: No currentWorksheet');
        return;
    }

    const identifier = `${currentWorksheet.operation}-${currentWorksheet.level}-page${currentPage}`;
    console.log('Loading identifier:', identifier);

    const savedData = loadWorksheetFromStorage('math', identifier);
    console.log('Loaded data:', savedData ? 'Found' : 'Not found');

    if (!savedData) {
        console.log('No saved data for this page');
        console.log('=== LOAD SAVED END (no data) ===');
        return;
    }

    console.log('Saved data has canvasAnswers:', savedData.canvasAnswers?.length || 0);

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
        console.log('Restoring', savedData.canvasAnswers.length, 'canvas answers...');
        savedData.canvasAnswers.forEach(answer => {
            const canvas = document.getElementById(`answer-${answer.index}`);
            console.log(`Restoring canvas ${answer.index}:`, canvas ? 'found' : 'NOT FOUND');
            if (canvas && canvas.getContext && answer.imageData) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = function() {
                    console.log(`Canvas ${answer.index} image loaded, drawing...`);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                img.onerror = function() {
                    console.error(`Canvas ${answer.index} image load FAILED`);
                };
                img.src = answer.imageData;
            }
        });

        // Show "Loaded saved page" message
        const resultsDiv = document.getElementById('results-summary');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <h3>Loaded Saved Page</h3>
                <p style="font-size: 1.1em; color: #0066cc;">Your previous work on page ${currentPage} has been restored.</p>
                <p>Saved on: ${new Date(savedData.timestamp).toLocaleString()}</p>
                <p>Time: ${savedData.elapsedTime}</p>
            `;
            resultsDiv.style.display = 'block';
        }
    }
    console.log('=== LOAD SAVED END ===');
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
function updateCompletionBadge(operation, level) {
    console.log(`Worksheet ${operation}-${level} marked as completed`);
}

// Navigate between pages
function navigatePage(direction) {
    try {
        console.log('==========================================');
        console.log('navigatePage called with direction:', direction);
        console.log('currentWorksheet:', currentWorksheet);
        console.log('currentPage:', currentPage, 'totalPages:', totalPages);

        if (!currentWorksheet) {
            console.error('navigatePage: currentWorksheet is null');
            alert('Error: Worksheet not loaded properly. Please reload the page.');
            return;
        }

        const newPage = currentPage + direction;
        console.log('newPage would be:', newPage);

        // Check bounds
        if (newPage < 1) {
            console.log('navigatePage: Already at first page');
            return;
        }
        if (newPage > totalPages) {
            console.log('navigatePage: Already at last page');
            return;
        }

        // Auto-save current page before navigating
        console.log('Auto-saving current page...');
        try {
            autoSavePage();
            console.log('Auto-save completed');
        } catch (saveError) {
            console.error('Error during auto-save:', saveError);
            // Continue anyway
        }

        // Load new page
        console.log('About to load worksheet:', currentWorksheet.operation, currentWorksheet.level, newPage);
        loadWorksheet(currentWorksheet.operation, currentWorksheet.level, newPage);
        console.log('loadWorksheet called successfully');
        console.log('==========================================');
    } catch (error) {
        console.error('ERROR in navigatePage:', error);
        console.error('Error stack:', error.stack);
        alert('Navigation error: ' + error.message);
    }
}

// Auto-save current page
function autoSavePage() {
    console.log('=== AUTO-SAVE START ===');
    if (!currentWorksheet) {
        console.error('autoSavePage: No currentWorksheet');
        return;
    }

    const identifier = `${currentWorksheet.operation}-${currentWorksheet.level}-page${currentPage}`;
    console.log('Auto-saving identifier:', identifier);

    const studentName = document.getElementById('student-name')?.value || 'Karthigai Selvi';
    const elapsedTime = document.getElementById('elapsed-time')?.textContent || '00:00';

    // Collect canvas answers
    const canvasAnswers = [];
    currentWorksheet.problems.forEach((problem, index) => {
        const canvas = document.getElementById(`answer-${index}`);
        if (canvas) {
            console.log(`Canvas ${index}: found, has toDataURL:`, !!canvas.toDataURL);
            if (canvas.toDataURL) {
                const imageData = canvas.toDataURL('image/png');
                console.log(`Canvas ${index} data length:`, imageData.length);
                canvasAnswers.push({
                    index: index,
                    imageData: imageData
                });
            }
        } else {
            console.log(`Canvas ${index}: NOT FOUND`);
        }
    });

    console.log('Total canvas answers collected:', canvasAnswers.length);

    const data = {
        completed: false, // Auto-save doesn't mark as completed
        elapsedTime: elapsedTime,
        studentName: studentName,
        canvasAnswers: canvasAnswers,
        buttonAnswers: {},
        checkboxAnswers: {}
    };

    console.log('Calling saveWorksheetToStorage...');
    const result = saveWorksheetToStorage('math', identifier, data);
    console.log('Save result:', result);
    console.log('=== AUTO-SAVE END ===');
}

// Generate more pages
function generateMorePages() {
    totalPages += 50;
    // Reload current page to update navigation
    loadWorksheet(currentWorksheet.operation, currentWorksheet.level, currentPage);
}
