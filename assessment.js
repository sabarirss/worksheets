/**
 * Assessment System for Math and English Modules
 * Determines child's appropriate level through 10-question assessment
 * Stores results and unlocks appropriate content level
 */

// Assessment state
let currentAssessment = null;
let assessmentQuestions = [];
let assessmentAnswers = [];

// In-memory cache for assessment data (avoids repeated Firestore reads per session)
const _assessmentCache = {};

/**
 * Get assessment data for a child from Firestore (with in-memory cache)
 * @param {string} childId - Child's unique identifier
 * @returns {Promise<Object>} Assessment data structure
 */
async function getAssessmentData(childId) {
    // Return cached data if available
    if (_assessmentCache[childId]) {
        return _assessmentCache[childId];
    }

    // Default structure
    const defaultData = {
        childId: childId,
        assessments: {
            addition: { level: null, score: null, date: null, taken: false },
            subtraction: { level: null, score: null, date: null, taken: false },
            multiplication: { level: null, score: null, date: null, taken: false },
            division: { level: null, score: null, date: null, taken: false },
            english: { level: null, score: null, date: null, taken: false }
        }
    };

    // Read from Firestore
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const doc = await firebase.firestore().collection('children').doc(childId).get();
            if (doc.exists) {
                const firestoreData = doc.data().assessmentData;
                if (firestoreData) {
                    // Merge Firestore data into default structure
                    for (const subject of Object.keys(defaultData.assessments)) {
                        if (firestoreData[subject]) {
                            defaultData.assessments[subject] = {
                                level: firestoreData[subject].level ?? null,
                                score: firestoreData[subject].score ?? null,
                                date: firestoreData[subject].date ?? null,
                                taken: firestoreData[subject].taken ?? false
                            };
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Failed to read assessment from Firestore:', error);
    }

    // Cache and return
    _assessmentCache[childId] = defaultData;
    return defaultData;
}

/**
 * Save assessment result to Firestore
 * @param {string} childId - Child's unique identifier
 * @param {string} subject - Subject/operation name (e.g., 'addition', 'english')
 * @param {number} score - Score percentage (0-100)
 * @param {number} assignedLevel - Level assigned based on score (1-12)
 */
async function saveAssessmentResult(childId, subject, score, assignedLevel) {
    const assessmentEntry = {
        level: assignedLevel,
        score: score,
        date: new Date().toISOString(),
        taken: true
    };

    // Save to Firestore (persistent, cross-device)
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            await firebase.firestore().collection('children').doc(childId).update({
                [`assessmentData.${subject}`]: {
                    level: assignedLevel,
                    score: score,
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    taken: true
                },
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Assessment saved to Firestore: ${subject} - Level ${assignedLevel}`);
        }
    } catch (error) {
        console.error('Failed to save assessment to Firestore:', error);
        throw error;
    }

    // Update in-memory cache
    if (_assessmentCache[childId]) {
        _assessmentCache[childId].assessments[subject] = assessmentEntry;
    }

    console.log(`Assessment saved: ${subject} - Level ${assignedLevel} (Score: ${score}%)`);
}

/**
 * Check if child has taken assessment for a subject
 * @param {string} childId - Child's unique identifier
 * @param {string} subject - Subject/operation name
 * @returns {Promise<boolean>} True if assessment taken
 */
async function hasCompletedAssessment(childId, subject) {
    const data = await getAssessmentData(childId);
    return data.assessments[subject]?.taken || false;
}

/**
 * Get assigned level for a subject
 * @param {string} childId - Child's unique identifier
 * @param {string} subject - Subject/operation name
 * @returns {Promise<number|null>} Assigned level or null if not assessed
 */
async function getAssignedLevel(childId, subject) {
    const data = await getAssessmentData(childId);
    const level = data.assessments[subject]?.level;
    return level !== undefined && level !== null ? level : null;
}

/**
 * Calculate age group for one year younger
 * @param {string} currentAgeGroup - Current age group (e.g., '6', '7', '4-5')
 * @returns {string} One year younger age group
 */
function getYoungerAgeGroup(currentAgeGroup) {
    const map = {
        '4-5': '4-5',  // Can't go younger
        '6': '4-5',
        '7': '6',
        '8': '7',
        '9+': '8',
        '10+': '9+'
    };
    return map[currentAgeGroup] || currentAgeGroup;
}

/**
 * Calculate age group for one year older
 * @param {string} currentAgeGroup - Current age group
 * @returns {string} One year older age group
 */
function getOlderAgeGroup(currentAgeGroup) {
    const map = {
        '4-5': '6',
        '6': '7',
        '7': '8',
        '8': '9+',
        '9+': '10+',
        '10+': '10+'  // Can't go older
    };
    return map[currentAgeGroup] || currentAgeGroup;
}

/**
 * Generate 20 assessment questions for Math
 * 4 tiers: younger-easy, current-easy, current-medium, older-easy (stretch)
 * This spread properly differentiates skill levels across a wide range.
 * @param {string} operation - Math operation (addition, subtraction, etc.)
 * @param {string} ageGroup - Child's age group
 * @returns {Array} Array of 20 questions with answers
 */
function generateMathAssessmentQuestions(operation, ageGroup) {
    const questions = [];
    const youngerAge = getYoungerAgeGroup(ageGroup);
    const olderAge = getOlderAgeGroup(ageGroup);

    // Get config access functions from worksheet-generator.js
    if (typeof getConfigByAge === 'undefined') {
        console.error('getConfigByAge not available - ensure worksheet-generator.js is loaded');
        return [];
    }

    const opSymbol = {
        'addition': '+',
        'subtraction': '−',
        'multiplication': '×',
        'division': '÷'
    }[operation] || '+';

    // Helper to generate N questions from a config
    function generateFromConfig(age, difficulty, count) {
        const config = getConfigByAge(operation, age, difficulty);
        if (!config || !config.generator) {
            console.warn(`No generator found for ${operation} age ${age} (${difficulty})`);
            return;
        }
        for (let i = 0; i < count; i++) {
            const problem = config.generator();
            questions.push({
                ...problem,
                operation: operation,
                problem: `${problem.a} ${opSymbol} ${problem.b} =`,
                sourceAge: age,
                sourceDifficulty: difficulty,
                tier: `${age}-${difficulty}`
            });
        }
        console.log(`Generated ${count} questions from age ${age} (${difficulty})`);
    }

    // Tier 1: 5 from younger age (easy) — baseline, should be easy for the child
    generateFromConfig(youngerAge, 'easy', 5);

    // Tier 2: 5 from current age (easy) — at-level warmup
    generateFromConfig(ageGroup, 'easy', 5);

    // Tier 3: 5 from current age (medium) — challenging for current level
    generateFromConfig(ageGroup, 'medium', 5);

    // Tier 4: 5 from older age (easy) — stretch to detect advanced ability
    generateFromConfig(olderAge, 'easy', 5);

    // Shuffle questions so they're mixed (not grouped by difficulty)
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions.slice(0, 20);
}

/**
 * Determine level based on assessment score
 * @param {number} score - Score percentage (0-100)
 * @param {string} ageGroup - Child's age group
 * @returns {Object} { level, ageGroup, difficulty, reason }
 */
function determineLevelFromScore(score, ageGroup) {
    let targetAgeGroup;
    let targetDifficulty;
    let reason;

    if (score < 30) {
        // Use one year younger content
        targetAgeGroup = getYoungerAgeGroup(ageGroup);
        targetDifficulty = 'easy';
        reason = 'Score below 30% - assigned easier content for building foundation';
    } else if (score <= 75) {
        // Use age-appropriate content
        targetAgeGroup = ageGroup;
        targetDifficulty = 'medium';
        reason = 'Score 30-75% - assigned age-appropriate content';
    } else {
        // Use one year older content
        targetAgeGroup = getOlderAgeGroup(ageGroup);
        targetDifficulty = 'medium';
        reason = 'Score above 75% - assigned advanced content for challenge';
    }

    // Convert to level number
    const level = ageAndDifficultyToLevel(targetAgeGroup, targetDifficulty);

    return {
        level: level,
        ageGroup: targetAgeGroup,
        difficulty: targetDifficulty,
        reason: reason
    };
}

/**
 * Generate 20 assessment questions for English
 * 4 tiers: younger-easy, current-easy, current-medium, older-easy (stretch)
 * @param {string} ageGroup - Child's age group
 * @returns {Array} Array of 20 questions with answers
 */
function generateEnglishAssessmentQuestions(ageGroup) {
    const questions = [];
    const youngerAge = getYoungerAgeGroup(ageGroup);
    const olderAge = getOlderAgeGroup(ageGroup);

    // Get config access function from english-generator.js
    if (typeof getConfigByAge === 'undefined') {
        console.error('getConfigByAge not available - ensure english-generator.js is loaded');
        return [];
    }

    // Helper to generate N questions from a config
    function generateFromConfig(age, difficulty, count) {
        const config = getConfigByAge(age, difficulty);
        if (!config || !config.generator) {
            console.warn(`No generator found for English age ${age} (${difficulty})`);
            return;
        }
        for (let i = 0; i < count; i++) {
            const problem = config.generator();
            questions.push({
                ...problem,
                sourceAge: age,
                sourceDifficulty: difficulty,
                tier: `${age}-${difficulty}`
            });
        }
        console.log(`Generated ${count} English questions from age ${age} (${difficulty})`);
    }

    // Tier 1: 5 from younger age (easy) — baseline
    generateFromConfig(youngerAge, 'easy', 5);

    // Tier 2: 5 from current age (easy) — at-level warmup
    generateFromConfig(ageGroup, 'easy', 5);

    // Tier 3: 5 from current age (medium) — challenging
    generateFromConfig(ageGroup, 'medium', 5);

    // Tier 4: 5 from older age (easy) — stretch
    generateFromConfig(olderAge, 'easy', 5);

    // Shuffle questions so they're mixed
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions.slice(0, 20);
}

/**
 * Start a new assessment
 * @param {string} subject - Subject/operation name
 * @param {string} operation - Operation for math (addition, subtraction, etc.)
 * @param {string} ageGroup - Child's age group
 */
function startAssessment(subject, operation, ageGroup) {
    console.log('startAssessment called:', { subject, operation, ageGroup });

    // Validate inputs
    if (!operation || !ageGroup) {
        console.error('Missing required parameters:', { operation, ageGroup });
        alert('Error: Missing operation or age group. Please try again.');
        return;
    }

    // Generate questions based on subject
    if (subject === 'english') {
        assessmentQuestions = generateEnglishAssessmentQuestions(ageGroup);
    } else {
        assessmentQuestions = generateMathAssessmentQuestions(operation, ageGroup);
    }

    if (!assessmentQuestions || assessmentQuestions.length === 0) {
        console.error('Failed to generate assessment questions');
        alert('Error generating assessment questions. Please try again.');
        return;
    }

    console.log(`Generated ${assessmentQuestions.length} questions for ${operation}`);

    assessmentAnswers = new Array(APP_CONFIG.ASSESSMENT.QUESTION_COUNT).fill(null);

    currentAssessment = {
        subject: subject,
        operation: operation,
        ageGroup: ageGroup,
        startTime: new Date()
    };

    console.log(`Assessment started: ${subject} (${operation}) for age ${ageGroup}`);
    console.log('Questions:', assessmentQuestions);

    // Render assessment UI
    renderAssessmentUI();
}

/**
 * Render the assessment UI
 */
function renderAssessmentUI() {
    const container = document.getElementById('assessment-container');
    if (!container) {
        console.error('Assessment container not found');
        alert('Error: Assessment container not found. Please refresh the page.');
        return;
    }

    // Set global flag to prevent auth redirects during assessment
    window.assessmentActive = true;
    console.log('Assessment active flag set to true');

    // Don't hide main container - let assessment overlay cover it
    console.log('Rendering assessment with', assessmentQuestions.length, 'questions');

    let html = `
        <div class="assessment-page">
            <div class="assessment-header">
                <h2>📝 Assessment Test - ${currentAssessment.operation.toUpperCase()}</h2>
                <p class="assessment-instructions">
                    Solve all 10 problems below. Write your answers clearly in the boxes.
                    Click "Submit Assessment" when you're done.
                </p>
            </div>

            <div class="assessment-questions">
    `;

    // Check input mode (keyboard or pencil)
    const usePencil = typeof isPencilMode === 'function' ? isPencilMode() : false;

    // Generate question UI
    const isEnglish = currentAssessment.subject === 'english';

    assessmentQuestions.forEach((question, index) => {
        // Create answer input based on mode and subject
        let answerInput;
        if (usePencil) {
            // Pencil mode: Canvas for handwriting
            answerInput = `
                <canvas id="assessment-answer-${index}"
                        class="answer-canvas handwriting-input"
                        data-width="400"
                        data-height="80"
                        width="400"
                        height="80"
                        style="touch-action: none;"></canvas>
                <button class="clear-btn" onclick="clearAssessmentCanvas(${index})">Clear</button>
            `;
        } else {
            // Keyboard mode: Text input
            const inputType = isEnglish ? 'text' : 'number';
            const inputMode = isEnglish ? 'text' : 'numeric';
            answerInput = `
                <input type="${inputType}"
                       id="assessment-answer-${index}"
                       class="answer-input"
                       placeholder=""
                       inputmode="${inputMode}">
            `;
        }

        // Determine question display text
        const questionText = question.problem || question.prompt || '';

        html += `
            <div class="assessment-question">
                <div class="question-number">${index + 1}.</div>
                <div class="question-content">
                    <div class="math-problem">${questionText}</div>
                    <div class="answer-section">
                        ${answerInput}
                    </div>
                    <div class="feedback" id="assessment-feedback-${index}"></div>
                </div>
            </div>
        `;
    });

    html += `
            </div>

            <div class="assessment-actions">
                <button class="submit-assessment-btn" onclick="submitAssessment()">
                    ✓ Submit Assessment
                </button>
                <button class="cancel-assessment-btn" onclick="cancelAssessment()">
                    Cancel
                </button>
            </div>

            <div id="assessment-results" style="display: none;"></div>
        </div>
    `;

    container.innerHTML = html;

    // Ensure container is visible
    container.style.display = 'block';
    container.style.position = 'relative';
    container.style.zIndex = '1000';

    console.log('Assessment HTML rendered');

    // Initialize canvases only if in pencil mode
    if (usePencil) {
        console.log('Initializing canvases for pencil mode...');
        setTimeout(() => {
            assessmentQuestions.forEach((_, index) => {
                initializeAssessmentCanvas(index);
            });
            console.log('All canvases initialized');
        }, 100);
    } else {
        console.log('Keyboard mode - using input fields');
    }
}

/**
 * Initialize canvas for handwriting input
 */
function initializeAssessmentCanvas(index) {
    const canvas = document.getElementById(`assessment-answer-${index}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let drawing = false;

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
    });

    canvas.addEventListener('mouseup', () => {
        drawing = false;
    });

    canvas.addEventListener('mouseleave', () => {
        drawing = false;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        drawing = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        ctx.beginPath();
        ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
    });

    canvas.addEventListener('touchend', () => {
        drawing = false;
    });
}

/**
 * Clear assessment canvas
 */
function clearAssessmentCanvas(index) {
    const canvas = document.getElementById(`assessment-answer-${index}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear stored answer
    assessmentAnswers[index] = null;
}

/**
 * Submit assessment and evaluate answers
 */
async function submitAssessment() {
    if (!currentAssessment) {
        alert('No active assessment');
        return;
    }

    const submitBtn = document.querySelector('.submit-assessment-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Checking answers...';

    // Check if using pencil mode
    const usePencil = typeof isPencilMode === 'function' ? isPencilMode() : false;

    // Ensure handwriting models are loaded for pencil mode
    if (usePencil) {
        try {
            if (typeof loadHandwritingModel !== 'undefined') {
                await loadHandwritingModel();
            }
            // Also load EMNIST for English letter recognition
            if (isEnglish && typeof loadEmnistModel !== 'undefined') {
                await loadEmnistModel();
            }
        } catch (error) {
            console.error('Failed to load handwriting model:', error);
            alert('Error loading handwriting recognition. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = '✓ Submit Assessment';
            return;
        }
    }

    const isEnglish = currentAssessment.subject === 'english';
    const child = getSelectedChild();

    // Collect answers from DOM
    const answers = [];
    for (let i = 0; i < assessmentQuestions.length; i++) {
        const answerElement = document.getElementById(`assessment-answer-${i}`);
        if (!answerElement) {
            answers.push(null);
            continue;
        }

        if (usePencil) {
            try {
                if (isEnglish) {
                    if (typeof recognizeCharacter === 'function') {
                        const charResult = await recognizeCharacter(answerElement, {
                            expectedAnswer: String(assessmentQuestions[i].answer).charAt(0),
                            expectedType: 'letter'
                        });
                        answers.push(charResult.isEmpty ? null : (charResult.character || null));
                    } else {
                        answers.push(null); // Can't recognize
                    }
                } else {
                    const result = await recognizeDigit(answerElement);
                    answers.push(result.isEmpty ? null : result.digit);
                }
            } catch {
                answers.push(null);
            }
        } else {
            const inputValue = answerElement.value.trim();
            if (inputValue === '') {
                answers.push(null);
            } else if (isEnglish) {
                answers.push(inputValue);
            } else {
                answers.push(parseInt(inputValue));
            }
        }
    }

    let correct, scorePercentage, levelResult, serverFeedback;

    // Try Cloud Function validation first, fall back to local
    try {
        const submitAssessmentCF = firebase.app().functions('europe-west1').httpsCallable('submitAssessment');
        const result = await submitAssessmentCF({
            childId: child ? child.id : null,
            subject: currentAssessment.subject,
            operation: currentAssessment.operation,
            answers: answers
        });

        correct = result.data.correct;
        scorePercentage = result.data.score;
        levelResult = {
            level: result.data.level,
            ageGroup: result.data.ageGroup,
            difficulty: result.data.difficulty,
            reason: result.data.reason
        };
        serverFeedback = result.data.feedback;

        console.log('Assessment validated by server:', result.data);
    } catch (cfError) {
        console.warn('Cloud Function unavailable, using local validation:', cfError.message);

        // === FALLBACK: Local validation ===
        correct = 0;
        serverFeedback = [];

        for (let i = 0; i < assessmentQuestions.length; i++) {
            const correctAnswer = assessmentQuestions[i].answer;
            const userAnswer = answers[i];
            let isCorrect = false;

            if (userAnswer !== null && userAnswer !== undefined && userAnswer !== '') {
                if (isEnglish) {
                    isCorrect = String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase();
                } else {
                    isCorrect = Number(userAnswer) === Number(correctAnswer);
                }
            }

            if (isCorrect) correct++;
            serverFeedback.push({ correct: isCorrect, expected: correctAnswer });
        }

        scorePercentage = Math.round((correct / assessmentQuestions.length) * 100);
        levelResult = determineLevelFromScore(scorePercentage, currentAssessment.ageGroup);

        // Save via client fallback
        if (child) {
            await saveAssessmentResult(child.id, currentAssessment.operation, scorePercentage, levelResult.level);
        }
    }

    // Render feedback from server (or local fallback)
    for (let i = 0; i < assessmentQuestions.length; i++) {
        const answerElement = document.getElementById(`assessment-answer-${i}`);
        const feedback = document.getElementById(`assessment-feedback-${i}`);
        if (!feedback) continue;

        const fb = serverFeedback[i];
        if (!fb) continue;

        if (answers[i] === null || answers[i] === undefined || answers[i] === '') {
            feedback.textContent = '⚠️ Empty';
            feedback.style.color = '#999';
        } else if (fb.correct) {
            feedback.textContent = '✓ Correct!';
            feedback.style.color = '#4caf50';
            if (answerElement) {
                if (usePencil) {
                    answerElement.style.border = '2px solid #4caf50';
                } else {
                    answerElement.style.borderColor = '#4caf50';
                    answerElement.style.borderWidth = '2px';
                }
            }
        } else {
            feedback.textContent = `✗ Wrong (answer: ${fb.expected})`;
            feedback.style.color = '#f44336';
            if (answerElement) {
                if (usePencil) {
                    answerElement.style.border = '2px solid #f44336';
                } else {
                    answerElement.style.borderColor = '#f44336';
                    answerElement.style.borderWidth = '2px';
                }
            }
        }

        feedback.style.display = 'block';
        feedback.style.fontWeight = 'bold';
    }

    // Show results
    showAssessmentResults(correct, assessmentQuestions.length, scorePercentage, levelResult);
}

/**
 * Show assessment results
 */
function showAssessmentResults(correct, total, scorePercentage, levelResult) {
    const resultsDiv = document.getElementById('assessment-results');

    // Determine color based on score
    let color = '';
    if (scorePercentage < 30) {
        color = '#ff9800';
    } else if (scorePercentage <= 75) {
        color = '#2196f3';
    } else {
        color = '#4caf50';
    }

    resultsDiv.innerHTML = `
        <div class="assessment-results-card">
            <h3>Assessment Complete!</h3>
            <div class="score-display" style="color: ${color};">
                <div class="score-big">${correct} / ${total}</div>
                <div class="score-percentage">${scorePercentage}%</div>
            </div>
            <div class="level-assignment">
                <h4>Your Identified Level:</h4>
                <div class="assigned-level">Level ${levelResult.level}</div>
                <p class="level-description">${levelResult.reason}</p>
            </div>
            <div class="assessment-actions-final">
                <button class="start-learning-btn" onclick="startLearningAtLevel('${currentAssessment.operation}', ${levelResult.level})">
                    🚀 Start Learning
                </button>
                <button class="retake-assessment-btn" onclick="confirmRetakeAssessment()">
                    🔄 Re-take Assessment
                </button>
            </div>
        </div>
    `;

    resultsDiv.style.display = 'block';

    // Hide submit button
    document.querySelector('.submit-assessment-btn').style.display = 'none';
    document.querySelector('.cancel-assessment-btn').style.display = 'none';
}

/**
 * Start learning at assigned level
 */
async function startLearningAtLevel(operation, level) {
    console.log('Starting learning:', { operation, level });

    // Clear assessment active flag
    window.assessmentActive = false;
    console.log('Assessment active flag cleared');

    // Convert level back to age+difficulty
    const ageGroup = levelToAgeGroup(level);
    const difficulty = levelToDifficulty(level);

    console.log('Converted to:', { ageGroup, difficulty });

    // Hide assessment container
    const container = document.getElementById('assessment-container');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }

    // Generate first weekly assignment immediately after assessment
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (child && typeof generateFirstWeeklyAssignment === 'function') {
        await generateFirstWeeklyAssignment(child);
    }

    // Load worksheet through proper entry point (respects demo/full page limits)
    if (operation === 'english') {
        // English: Show type selection with assigned level active
        const typeSelection = document.getElementById('type-selection');
        if (typeSelection) {
            typeSelection.style.display = 'block';
        }
        console.log('English assessment complete - showing worksheet types');
    } else {
        // Math: Route through loadOperationWorksheet for proper page access control
        if (typeof loadOperationWorksheet === 'function') {
            loadOperationWorksheet(operation);
        } else {
            alert('Error: Worksheet loader not available. Please refresh the page.');
        }
    }
}

/**
 * Confirm retake assessment with warning
 */
function confirmRetakeAssessment() {
    const message = `⚠️ Re-taking the Assessment\n\n` +
                   `Re-taking this assessment may affect the AI's level prediction and your learning path.\n\n` +
                   `Your previous score will be replaced with the new one.\n\n` +
                   `Are you sure you want to re-take the assessment?`;

    if (confirm(message)) {
        retakeAssessment();
    }
}

/**
 * Retake the assessment
 */
function retakeAssessment() {
    if (!currentAssessment) {
        console.error('No current assessment to retake');
        return;
    }

    console.log('Retaking assessment for:', currentAssessment.operation);

    // Store operation and age group
    const operation = currentAssessment.operation;
    const ageGroup = currentAssessment.ageGroup;

    // Clear previous results
    const resultsDiv = document.getElementById('assessment-results');
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
        resultsDiv.innerHTML = '';
    }

    // Show submit button again
    const submitBtn = document.querySelector('.submit-assessment-btn');
    const cancelBtn = document.querySelector('.cancel-assessment-btn');
    if (submitBtn) {
        submitBtn.style.display = 'inline-block';
        submitBtn.disabled = false;
        submitBtn.textContent = '✓ Submit Assessment';
    }
    if (cancelBtn) {
        cancelBtn.style.display = 'inline-block';
    }

    // Generate new questions based on subject type
    if (currentAssessment.subject === 'english') {
        assessmentQuestions = generateEnglishAssessmentQuestions(ageGroup);
    } else {
        assessmentQuestions = generateMathAssessmentQuestions(operation, ageGroup);
    }
    assessmentAnswers = new Array(APP_CONFIG.ASSESSMENT.QUESTION_COUNT).fill(null);

    // Re-render assessment UI with new questions
    renderAssessmentUI();

    console.log('Assessment restarted with new questions');
}

/**
 * Cancel assessment
 */
function cancelAssessment() {
    if (confirm('Are you sure you want to cancel the assessment?')) {
        // Clear assessment active flag
        window.assessmentActive = false;
        console.log('Assessment cancelled, flag cleared');

        // Hide assessment container
        const container = document.getElementById('assessment-container');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }

        // Show appropriate selection based on subject
        if (currentAssessment && currentAssessment.subject === 'english') {
            // Show English type selection
            const typeSelection = document.getElementById('type-selection');
            if (typeSelection) {
                typeSelection.style.display = 'block';
            }
        } else {
            // Show Math operations selection
            const mathOps = document.getElementById('math-operations');
            if (mathOps) {
                mathOps.style.display = 'block';
            }
        }

        // Clear assessment state
        currentAssessment = null;
        assessmentQuestions = [];
        assessmentAnswers = [];

        console.log('Assessment cancelled');
    }
}

console.log('Assessment system loaded');
