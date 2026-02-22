/**
 * Assessment System for Math and English Modules
 * Determines child's appropriate level through 10-question assessment
 * Stores results and unlocks appropriate content level
 */

// Assessment state
let currentAssessment = null;
let assessmentQuestions = [];
let assessmentAnswers = [];

/**
 * Get or initialize assessment data for a child
 * @param {string} childId - Child's unique identifier
 * @returns {Object} Assessment data structure
 */
function getAssessmentData(childId) {
    const key = `assessment_${childId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
        return JSON.parse(stored);
    }

    // Initialize new assessment data
    const data = {
        childId: childId,
        assessments: {
            // Math operations
            addition: { level: null, score: null, date: null, taken: false },
            subtraction: { level: null, score: null, date: null, taken: false },
            multiplication: { level: null, score: null, date: null, taken: false },
            division: { level: null, score: null, date: null, taken: false },
            // English
            english: { level: null, score: null, date: null, taken: false }
        }
    };

    localStorage.setItem(key, JSON.stringify(data));
    return data;
}

/**
 * Save assessment result to both localStorage and Firestore
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

    // Save to localStorage (immediate, offline-capable)
    const data = getAssessmentData(childId);
    data.assessments[subject] = assessmentEntry;
    const key = `assessment_${childId}`;
    localStorage.setItem(key, JSON.stringify(data));

    // Save to Firestore (persistent, cross-device)
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
            if (child && child.id) {
                await firebase.firestore().collection('children').doc(child.id).update({
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
        }
    } catch (error) {
        console.error('Failed to save assessment to Firestore:', error);
        // localStorage save still succeeded, so assessment is not lost
    }

    console.log(`Assessment saved: ${subject} - Level ${assignedLevel} (Score: ${score}%)`);
}

/**
 * Check if child has taken assessment for a subject
 * @param {string} childId - Child's unique identifier
 * @param {string} subject - Subject/operation name
 * @returns {boolean} True if assessment taken
 */
function hasCompletedAssessment(childId, subject) {
    const data = getAssessmentData(childId);
    return data.assessments[subject]?.taken || false;
}

/**
 * Get assigned level for a subject
 * @param {string} childId - Child's unique identifier
 * @param {string} subject - Subject/operation name
 * @returns {number|null} Assigned level or null if not assessed
 */
function getAssignedLevel(childId, subject) {
    const data = getAssessmentData(childId);
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
 * Generate 10 assessment questions for Math
 * 5 from one year younger, 5 from age-appropriate
 * @param {string} operation - Math operation (addition, subtraction, etc.)
 * @param {string} ageGroup - Child's age group
 * @returns {Array} Array of 10 questions with answers
 */
function generateMathAssessmentQuestions(operation, ageGroup) {
    const questions = [];
    const youngerAge = getYoungerAgeGroup(ageGroup);

    // Get config access functions from worksheet-generator.js
    if (typeof getConfigByAge === 'undefined') {
        console.error('getConfigByAge not available - ensure worksheet-generator.js is loaded');
        return [];
    }

    // Get 5 questions from younger age (easy difficulty)
    // Get operation symbol
    const opSymbol = {
        'addition': '+',
        'subtraction': '−',
        'multiplication': '×',
        'division': '÷'
    }[operation] || '+';

    const youngerConfig = getConfigByAge(operation, youngerAge, 'easy');
    if (youngerConfig && youngerConfig.generator) {
        // Call generator 5 times to get 5 problems
        for (let i = 0; i < 5; i++) {
            const problem = youngerConfig.generator();
            questions.push({
                ...problem,
                operation: operation,
                problem: `${problem.a} ${opSymbol} ${problem.b} =`,
                sourceAge: youngerAge,
                sourceDifficulty: 'easy'
            });
        }
        console.log(`Generated 5 questions from age ${youngerAge} (easy)`);
    } else {
        console.warn(`No generator found for ${operation} age ${youngerAge} (easy)`);
    }

    // Get 5 questions from current age (medium difficulty)
    const currentConfig = getConfigByAge(operation, ageGroup, 'medium');
    if (currentConfig && currentConfig.generator) {
        // Call generator 5 times to get 5 problems
        for (let i = 0; i < 5; i++) {
            const problem = currentConfig.generator();
            questions.push({
                ...problem,
                operation: operation,
                problem: `${problem.a} ${opSymbol} ${problem.b} =`,
                sourceAge: ageGroup,
                sourceDifficulty: 'medium'
            });
        }
        console.log(`Generated 5 questions from age ${ageGroup} (medium)`);
    } else {
        console.warn(`No generator found for ${operation} age ${ageGroup} (medium)`);
    }

    // Shuffle questions so they're mixed
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions.slice(0, 10); // Ensure exactly 10 questions
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
 * Generate 10 assessment questions for English
 * 5 from one year younger, 5 from age-appropriate
 * @param {string} ageGroup - Child's age group
 * @returns {Array} Array of 10 questions with answers
 */
function generateEnglishAssessmentQuestions(ageGroup) {
    const questions = [];
    const youngerAge = getYoungerAgeGroup(ageGroup);

    // Get config access function from english-generator.js
    if (typeof getConfigByAge === 'undefined') {
        console.error('getConfigByAge not available - ensure english-generator.js is loaded');
        return [];
    }

    // Get 5 questions from younger age (easy difficulty)
    const youngerConfig = getConfigByAge(youngerAge, 'easy');
    if (youngerConfig && youngerConfig.generator) {
        for (let i = 0; i < 5; i++) {
            const problem = youngerConfig.generator();
            questions.push({
                ...problem,
                sourceAge: youngerAge,
                sourceDifficulty: 'easy'
            });
        }
        console.log(`Generated 5 English questions from age ${youngerAge} (easy)`);
    } else {
        console.warn(`No generator found for English age ${youngerAge} (easy)`);
    }

    // Get 5 questions from current age (medium difficulty)
    const currentConfig = getConfigByAge(ageGroup, 'medium');
    if (currentConfig && currentConfig.generator) {
        for (let i = 0; i < 5; i++) {
            const problem = currentConfig.generator();
            questions.push({
                ...problem,
                sourceAge: ageGroup,
                sourceDifficulty: 'medium'
            });
        }
        console.log(`Generated 5 English questions from age ${ageGroup} (medium)`);
    } else {
        console.warn(`No generator found for English age ${ageGroup} (medium)`);
    }

    // Shuffle questions so they're mixed
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions.slice(0, 10); // Ensure exactly 10 questions
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

    assessmentAnswers = new Array(10).fill(null);

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

    let correct = 0;
    const results = [];

    // Check each answer
    const isEnglish = currentAssessment.subject === 'english';

    for (let i = 0; i < assessmentQuestions.length; i++) {
        const answerElement = document.getElementById(`assessment-answer-${i}`);
        const feedback = document.getElementById(`assessment-feedback-${i}`);
        const correctAnswer = assessmentQuestions[i].answer;

        try {
            let userAnswer = null;
            let isEmpty = false;

            if (usePencil) {
                // Pencil mode: Use handwriting recognition
                if (isEnglish) {
                    // Try EMNIST character recognition if available
                    if (typeof recognizeCharacter === 'function') {
                        const charResult = await recognizeCharacter(answerElement, {
                            expectedAnswer: String(correctAnswer).charAt(0),
                            expectedType: 'letter'
                        });

                        if (charResult.isEmpty) {
                            isEmpty = true;
                        } else if (charResult.modelMissing) {
                            // EMNIST not loaded - mark as handwritten (can't score)
                            userAnswer = 'handwritten';
                        } else if (charResult.error) {
                            userAnswer = null;
                        } else {
                            userAnswer = charResult.character || 'handwritten';
                        }
                    } else {
                        // No recognition engine - check for canvas content
                        const canvas = answerElement;
                        const ctx = canvas.getContext('2d');
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const hasContent = Array.from(imageData.data).some((value, index) => {
                            return index % 4 === 3 && value > 0;
                        });

                        if (!hasContent) {
                            isEmpty = true;
                        } else {
                            userAnswer = 'handwritten';
                        }
                    }
                } else {
                    // Math: Use digit recognition
                    const result = await recognizeDigit(answerElement);

                    if (result.isEmpty) {
                        isEmpty = true;
                    } else if (result.error) {
                        userAnswer = null;
                    } else {
                        userAnswer = result.digit;
                    }
                }
            } else {
                // Keyboard mode: Get value from input field
                const inputValue = answerElement.value.trim();
                if (inputValue === '') {
                    isEmpty = true;
                } else {
                    if (isEnglish) {
                        userAnswer = inputValue; // Keep as string for English
                    } else {
                        userAnswer = parseInt(inputValue); // Parse as number for Math
                    }
                }
            }

            // Provide feedback
            if (isEmpty) {
                feedback.textContent = '⚠️ Empty';
                feedback.style.color = '#999';
                results.push({ question: i + 1, correct: false, isEmpty: true });
            } else if (userAnswer === null || (!isEnglish && isNaN(userAnswer))) {
                feedback.textContent = `❓ Unclear (answer: ${correctAnswer})`;
                feedback.style.color = '#ff9800';
                results.push({ question: i + 1, correct: false, error: true });
            } else if (isEnglish && userAnswer === 'handwritten') {
                // Handwritten but no recognition available -
                // show answer, mark incorrect (don't inflate scores)
                feedback.textContent = `📝 Handwritten (answer: ${correctAnswer})`;
                feedback.style.color = '#2196f3';
                if (usePencil) {
                    answerElement.style.border = '2px solid #2196f3';
                }
                results.push({ question: i + 1, correct: false, handwritten: true, expected: correctAnswer });
            } else {
                let isCorrect;

                if (isEnglish) {
                    // Case-insensitive string comparison for English answers
                    isCorrect = userAnswer.toLowerCase() === String(correctAnswer).toLowerCase();
                } else {
                    // Number comparison for Math
                    isCorrect = userAnswer === correctAnswer;
                }

                if (isCorrect) {
                    correct++;
                    feedback.textContent = '✓ Correct!';
                    feedback.style.color = '#4caf50';
                    if (usePencil) {
                        answerElement.style.border = '2px solid #4caf50';
                    } else {
                        answerElement.style.borderColor = '#4caf50';
                        answerElement.style.borderWidth = '2px';
                    }
                } else {
                    feedback.textContent = `✗ Wrong (answer: ${correctAnswer})`;
                    feedback.style.color = '#f44336';
                    if (usePencil) {
                        answerElement.style.border = '2px solid #f44336';
                    } else {
                        answerElement.style.borderColor = '#f44336';
                        answerElement.style.borderWidth = '2px';
                    }
                }

                results.push({
                    question: i + 1,
                    correct: isCorrect,
                    userAnswer: userAnswer,
                    expected: correctAnswer
                });
            }

            feedback.style.display = 'block';
            feedback.style.fontWeight = 'bold';

        } catch (error) {
            console.error(`Error checking answer ${i}:`, error);
            feedback.textContent = `❓ Error (answer: ${correctAnswer})`;
            feedback.style.color = '#ff9800';
        }
    }

    // Calculate score
    const scorePercentage = Math.round((correct / assessmentQuestions.length) * 100);

    // Determine level
    const levelResult = determineLevelFromScore(scorePercentage, currentAssessment.ageGroup);

    // Save result
    const child = getSelectedChild();
    if (child) {
        saveAssessmentResult(child.id, currentAssessment.operation, scorePercentage, levelResult.level);
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
function startLearningAtLevel(operation, level) {
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

    // Load worksheet based on subject
    if (operation === 'english') {
        // English: Show type selection with assigned level active
        const typeSelection = document.getElementById('type-selection');
        if (typeSelection) {
            typeSelection.style.display = 'block';
        }
        console.log('English assessment complete - showing worksheet types');
    } else {
        // Math: Load worksheet at assigned level
        if (typeof loadWorksheet === 'function') {
            loadWorksheet(operation, ageGroup, difficulty, 1);
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
    assessmentAnswers = new Array(10).fill(null);

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
