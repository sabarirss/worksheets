// Level Advancement Test System
// After 4+ weeks of 85%+ average scores, children can take a level-up test.
// Test: 10% easy, 30% medium, 60% hard from current level.
// Score 90%+ → advance to next level.

/**
 * LEVEL TEST RULES:
 * 1. Child must have completed at least 4 weeks of weekly assignments
 * 2. Average weekly score must be >= 85%
 * 3. Test contains 10 questions: 1 easy, 3 medium, 6 hard
 * 4. Score >= 90% → level up (both module level and weekly assignments)
 * 5. Available for Math and English modules
 */

const LEVEL_TEST_CONFIG = {
    MIN_WEEKS: 4,
    MIN_AVG_SCORE: 85,
    PASS_SCORE: 90,
    TOTAL_QUESTIONS: 10,
    EASY_COUNT: 1,      // 10%
    MEDIUM_COUNT: 3,    // 30%
    HARD_COUNT: 6,      // 60%
};

// ============================================================================
// ELIGIBILITY CHECK
// ============================================================================

/**
 * Check if a child is eligible for a level-up test in a given module.
 * Requires 4+ weeks with 85%+ average score.
 * @param {string} childId
 * @param {string} module - 'math' or 'english'
 * @returns {Promise<object>} { eligible, reason, weeksCompleted, avgScore, currentLevel }
 */
async function checkLevelTestEligibility(childId, module) {
    if (!childId) {
        return { eligible: false, reason: 'No child selected' };
    }

    try {
        // Get recent weekly assignments for this child and module
        const assignments = await firebase.firestore()
            .collection('weekly_assignments')
            .where('childId', '==', childId)
            .orderBy('createdAt', 'desc')
            .limit(8) // Look at up to 8 weeks
            .get();

        if (assignments.empty) {
            return { eligible: false, reason: 'No weekly assignments completed yet', weeksCompleted: 0 };
        }

        // Calculate completed weeks and average scores for this module
        let completedWeeks = 0;
        let totalScore = 0;

        assignments.forEach(doc => {
            const a = doc.data();
            const moduleData = a[module];
            if (!moduleData || !moduleData.pages) return;

            // A week counts if all pages are completed
            const allDone = moduleData.completedCount >= moduleData.totalPages;
            if (!allDone) return;

            // Calculate average score for this week's pages
            const scores = moduleData.pages
                .filter(p => p.completed && p.score > 0)
                .map(p => p.score);

            if (scores.length > 0) {
                const weekAvg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
                totalScore += weekAvg;
                completedWeeks++;
            }
        });

        const avgScore = completedWeeks > 0 ? Math.round(totalScore / completedWeeks) : 0;

        // Get current level
        let currentLevel = 1;
        if (typeof getAssignedLevel === 'function') {
            const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
            if (child) {
                const level = getAssignedLevel(child.id, module === 'math' ? 'addition' : 'english');
                if (level) currentLevel = level;
            }
        }

        // Check if max level reached
        const maxLevel = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.TOTAL_LEVELS : 12;
        if (currentLevel >= maxLevel) {
            return {
                eligible: false,
                reason: 'Already at maximum level!',
                weeksCompleted: completedWeeks,
                avgScore: avgScore,
                currentLevel: currentLevel
            };
        }

        // Check eligibility
        if (completedWeeks < LEVEL_TEST_CONFIG.MIN_WEEKS) {
            return {
                eligible: false,
                reason: `Need ${LEVEL_TEST_CONFIG.MIN_WEEKS} completed weeks (have ${completedWeeks})`,
                weeksCompleted: completedWeeks,
                avgScore: avgScore,
                currentLevel: currentLevel
            };
        }

        if (avgScore < LEVEL_TEST_CONFIG.MIN_AVG_SCORE) {
            return {
                eligible: false,
                reason: `Average score ${avgScore}% is below ${LEVEL_TEST_CONFIG.MIN_AVG_SCORE}% threshold`,
                weeksCompleted: completedWeeks,
                avgScore: avgScore,
                currentLevel: currentLevel
            };
        }

        // Check if test was recently taken (prevent retake within same week)
        const weekStr = typeof getWeekString === 'function' ? getWeekString(new Date()) : '';
        const recentTest = await firebase.firestore()
            .collection('level_tests')
            .where('childId', '==', childId)
            .where('module', '==', module)
            .where('week', '==', weekStr)
            .limit(1)
            .get();

        if (!recentTest.empty) {
            const testData = recentTest.docs[0].data();
            return {
                eligible: false,
                reason: testData.passed
                    ? 'Already passed this week\'s test!'
                    : 'Already attempted this week. Try again next week.',
                weeksCompleted: completedWeeks,
                avgScore: avgScore,
                currentLevel: currentLevel,
                lastTestScore: testData.score
            };
        }

        return {
            eligible: true,
            reason: 'Ready for level-up test!',
            weeksCompleted: completedWeeks,
            avgScore: avgScore,
            currentLevel: currentLevel
        };

    } catch (error) {
        console.error('Error checking level test eligibility:', error);
        return { eligible: false, reason: 'Error checking eligibility' };
    }
}

// ============================================================================
// TEST GENERATION
// ============================================================================

/**
 * Generate level-up test questions for Math.
 * 1 easy + 3 medium + 6 hard from current level's content.
 * @param {string} operation - Math operation
 * @param {string} ageGroup - Child's age group
 * @returns {Array} Array of question objects
 */
function generateMathLevelTest(operation, ageGroup) {
    const questions = [];
    const difficulties = [
        ...Array(LEVEL_TEST_CONFIG.EASY_COUNT).fill('easy'),
        ...Array(LEVEL_TEST_CONFIG.MEDIUM_COUNT).fill('medium'),
        ...Array(LEVEL_TEST_CONFIG.HARD_COUNT).fill('hard')
    ];

    // Use the existing content config system
    difficulties.forEach((difficulty, idx) => {
        const config = typeof getConfigByAge === 'function'
            ? getConfigByAge(operation, ageGroup, difficulty)
            : null;

        if (config && config.generator) {
            // Use seeded random for reproducibility
            const seed = Date.now() + idx;
            const problem = config.generator(seed);
            questions.push({
                index: idx,
                difficulty: difficulty,
                problem: problem,
                type: 'math',
                operation: operation,
                answer: problem.answer
            });
        } else {
            // Fallback: generate basic problem
            const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 50 : 100;
            const a = Math.floor(Math.random() * range) + 1;
            const b = Math.floor(Math.random() * Math.min(a, range)) + 1;
            let answer;
            switch (operation) {
                case 'addition': answer = a + b; break;
                case 'subtraction': answer = a - b; break;
                case 'multiplication': answer = a * b; break;
                case 'division': answer = Math.floor(a / b); break;
                default: answer = a + b;
            }
            questions.push({
                index: idx,
                difficulty: difficulty,
                problem: { a, b, answer },
                type: 'math',
                operation: operation,
                answer: answer
            });
        }
    });

    // Shuffle questions so difficulties are mixed
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
        questions[i].index = i;
        questions[j].index = j;
    }

    return questions;
}

/**
 * Generate level-up test questions for English.
 * 1 easy + 3 medium + 6 hard from current level's content.
 * @param {string} ageGroup - Child's age group
 * @returns {Array} Array of question objects
 */
function generateEnglishLevelTest(ageGroup) {
    // Use existing English assessment generation if available
    if (typeof generateEnglishAssessmentQuestions === 'function') {
        const allQuestions = generateEnglishAssessmentQuestions(ageGroup);
        // Take 10 questions and tag difficulty distribution
        const questions = allQuestions.slice(0, LEVEL_TEST_CONFIG.TOTAL_QUESTIONS);
        questions.forEach((q, idx) => {
            if (idx < LEVEL_TEST_CONFIG.EASY_COUNT) {
                q.difficulty = 'easy';
            } else if (idx < LEVEL_TEST_CONFIG.EASY_COUNT + LEVEL_TEST_CONFIG.MEDIUM_COUNT) {
                q.difficulty = 'medium';
            } else {
                q.difficulty = 'hard';
            }
        });
        return questions;
    }

    // Fallback if English assessment generator not available
    return [];
}

// ============================================================================
// TEST EXECUTION
// ============================================================================

// Level test state
let levelTestState = null;

/**
 * Start a level-up test.
 * @param {string} module - 'math' or 'english'
 */
async function startLevelTest(module) {
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) {
        alert('No child profile selected');
        return;
    }

    const eligibility = await checkLevelTestEligibility(child.id, module);
    if (!eligibility.eligible) {
        alert(eligibility.reason);
        return;
    }

    const age = child.age || 6;
    const ageGroup = typeof getAgeGroupFromAge === 'function'
        ? getAgeGroupFromAge(age)
        : '6';

    let questions;
    if (module === 'math') {
        // Determine operation based on age
        let operation = 'addition';
        if (age >= 9) operation = 'division';
        else if (age >= 8) operation = 'multiplication';
        else if (age >= 7) operation = 'subtraction';

        questions = generateMathLevelTest(operation, ageGroup);
    } else {
        questions = generateEnglishLevelTest(ageGroup);
    }

    if (questions.length === 0) {
        alert('Could not generate test questions. Please try again.');
        return;
    }

    levelTestState = {
        module: module,
        childId: child.id,
        childName: child.name,
        currentLevel: eligibility.currentLevel,
        questions: questions,
        answers: new Array(questions.length).fill(null),
        startTime: Date.now(),
        ageGroup: ageGroup
    };

    renderLevelTest();
}

/**
 * Render the level test UI.
 */
function renderLevelTest() {
    if (!levelTestState) return;

    const { module, questions, currentLevel, childName } = levelTestState;
    const symbol = module === 'math'
        ? (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.OPERATION_SYMBOLS[questions[0]?.operation] || '+' : '+')
        : '';

    let html = `
        <div class="level-test-container" style="
            max-width: 700px;
            margin: 20px auto;
            padding: 30px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        ">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="color: #667eea; margin: 0;">Level ${currentLevel} Test</h2>
                <p style="color: #666; margin: 5px 0;">${childName} - ${module === 'math' ? 'Mathematics' : 'English'}</p>
                <p style="color: #999; font-size: 0.9em;">Score 90% or higher to advance to Level ${currentLevel + 1}</p>
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                    <span style="background: #d4edda; color: #28a745; padding: 4px 10px; border-radius: 12px; font-size: 0.8em;">Easy: ${LEVEL_TEST_CONFIG.EASY_COUNT}</span>
                    <span style="background: #fff3cd; color: #856404; padding: 4px 10px; border-radius: 12px; font-size: 0.8em;">Medium: ${LEVEL_TEST_CONFIG.MEDIUM_COUNT}</span>
                    <span style="background: #f8d7da; color: #721c24; padding: 4px 10px; border-radius: 12px; font-size: 0.8em;">Hard: ${LEVEL_TEST_CONFIG.HARD_COUNT}</span>
                </div>
            </div>

            <div id="level-test-questions">
    `;

    questions.forEach((q, idx) => {
        const diffColor = q.difficulty === 'easy' ? '#28a745' : q.difficulty === 'medium' ? '#ffc107' : '#dc3545';

        if (module === 'math') {
            html += `
                <div class="level-test-question" style="
                    padding: 15px 20px;
                    margin-bottom: 12px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border-left: 4px solid ${diffColor};
                    display: flex;
                    align-items: center;
                    gap: 15px;
                ">
                    <span style="font-weight: bold; color: #333; min-width: 30px;">${idx + 1}.</span>
                    <span style="font-size: 1.2em;">${q.problem.a} ${symbol} ${q.problem.b} = </span>
                    <input type="number" id="level-test-${idx}" class="level-test-input"
                        style="width: 80px; padding: 8px 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1.1em; text-align: center;"
                        inputmode="numeric" placeholder="?">
                    <span id="level-test-feedback-${idx}" style="display: none;"></span>
                </div>
            `;
        } else {
            html += `
                <div class="level-test-question" style="
                    padding: 15px 20px;
                    margin-bottom: 12px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border-left: 4px solid ${diffColor};
                ">
                    <span style="font-weight: bold; color: #333;">${idx + 1}.</span>
                    <span style="margin-left: 10px;">${q.question || q.prompt || ''}</span>
                    <input type="text" id="level-test-${idx}" class="level-test-input"
                        style="width: 100%; max-width: 300px; padding: 8px 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; margin-top: 8px; display: block;"
                        placeholder="Your answer">
                    <span id="level-test-feedback-${idx}" style="display: none;"></span>
                </div>
            `;
        }
    });

    html += `
            </div>

            <div id="level-test-results" style="display: none; margin-top: 20px;"></div>

            <div style="text-align: center; margin-top: 25px; display: flex; gap: 15px; justify-content: center;">
                <button onclick="submitLevelTest()" id="level-test-submit-btn" style="
                    padding: 14px 40px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                    Submit Test
                </button>
                <button onclick="cancelLevelTest()" style="
                    padding: 14px 30px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1em;
                    cursor: pointer;
                ">
                    Cancel
                </button>
            </div>
        </div>
    `;

    // Find or create test container
    let container = document.getElementById('level-test-area');
    if (!container) {
        container = document.createElement('div');
        container.id = 'level-test-area';
        document.querySelector('.container')?.appendChild(container) ||
            document.body.appendChild(container);
    }

    container.innerHTML = html;
    container.style.display = 'block';

    // Hide other content
    const subjectSelection = document.querySelector('.subject-selection');
    if (subjectSelection) subjectSelection.style.display = 'none';
    const worksheetContent = document.getElementById('worksheet-content');
    if (worksheetContent) worksheetContent.style.display = 'none';
}

/**
 * Submit the level test and evaluate results.
 */
async function submitLevelTest() {
    if (!levelTestState) return;

    const { questions, module, childId, currentLevel } = levelTestState;

    // Collect answers from DOM
    const answers = [];
    questions.forEach((q, idx) => {
        const input = document.getElementById(`level-test-${idx}`);
        answers.push(input ? input.value.trim() : '');
    });

    let correct, score, passed, newLevel, serverFeedback;

    // Try Cloud Function validation first, fall back to local
    try {
        const submitLevelTestCF = firebase.app().functions('europe-west1').httpsCallable('submitLevelTest');
        const result = await submitLevelTestCF({
            childId: childId,
            module: module,
            answers: answers
        });

        correct = result.data.correct;
        score = result.data.score;
        passed = result.data.passed;
        newLevel = result.data.newLevel;
        serverFeedback = result.data.feedback;

        console.log('Level test validated by server:', result.data);
    } catch (cfError) {
        console.warn('Cloud Function unavailable, using local validation:', cfError.message);

        // === FALLBACK: Local validation ===
        correct = 0;
        serverFeedback = [];

        questions.forEach((q, idx) => {
            const userAnswer = answers[idx];
            let isCorrect = false;

            if (module === 'math') {
                isCorrect = parseInt(userAnswer) === q.answer;
            } else {
                isCorrect = userAnswer.toLowerCase() === String(q.answer).toLowerCase();
            }

            if (isCorrect) correct++;
            serverFeedback.push({ correct: isCorrect, expected: q.answer, difficulty: q.difficulty });
        });

        score = Math.round((correct / questions.length) * 100);
        passed = score >= LEVEL_TEST_CONFIG.PASS_SCORE;
        newLevel = passed ? currentLevel + 1 : currentLevel;

        // Fallback: save via client
        const weekStr = typeof getWeekString === 'function' ? getWeekString(new Date()) : '';
        try {
            await firebase.firestore().collection('level_tests').add({
                childId, module, week: weekStr, currentLevel, newLevel,
                score, correct, total: questions.length, passed,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                questions: questions.map((q, idx) => ({
                    difficulty: q.difficulty, answer: q.answer, userAnswer: answers[idx]
                }))
            });

            if (passed) {
                await advanceChildLevel(childId, module, newLevel);
            }
        } catch (error) {
            console.error('Error saving level test result:', error);
        }
    }

    // Render feedback from server (or local fallback)
    questions.forEach((q, idx) => {
        const input = document.getElementById(`level-test-${idx}`);
        const feedback = document.getElementById(`level-test-feedback-${idx}`);
        if (!input || !feedback) return;

        const fb = serverFeedback[idx];
        feedback.style.display = 'inline-block';
        feedback.style.marginLeft = '10px';
        feedback.style.fontWeight = 'bold';

        if (fb && fb.correct) {
            feedback.textContent = '✓';
            feedback.style.color = '#28a745';
            input.style.borderColor = '#28a745';
        } else {
            feedback.textContent = `✗ (${fb ? fb.expected : q.answer})`;
            feedback.style.color = '#dc3545';
            input.style.borderColor = '#dc3545';
        }

        input.disabled = true;
    });

    // Show results
    const resultsDiv = document.getElementById('level-test-results');
    if (resultsDiv) {
        resultsDiv.style.display = 'block';

        if (passed) {
            resultsDiv.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 25px;
                    border-radius: 16px;
                    text-align: center;
                ">
                    <div style="font-size: 3em; margin-bottom: 10px;">🎉</div>
                    <h3 style="margin: 0 0 10px 0;">Congratulations!</h3>
                    <p style="font-size: 1.2em; margin: 0;">Score: ${correct}/${questions.length} (${score}%)</p>
                    <p style="margin: 10px 0 0 0; font-size: 1.1em;">
                        Advanced to <strong>Level ${newLevel}</strong>!
                    </p>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div style="
                    background: #fff3cd;
                    color: #856404;
                    padding: 25px;
                    border-radius: 16px;
                    text-align: center;
                    border: 2px solid #ffc107;
                ">
                    <div style="font-size: 3em; margin-bottom: 10px;">💪</div>
                    <h3 style="margin: 0 0 10px 0;">Keep Practicing!</h3>
                    <p style="font-size: 1.2em; margin: 0;">Score: ${correct}/${questions.length} (${score}%)</p>
                    <p style="margin: 10px 0 0 0;">
                        Need ${LEVEL_TEST_CONFIG.PASS_SCORE}% to advance. Stay on Level ${currentLevel} and try again next week.
                    </p>
                </div>
            `;
        }
    }

    // Hide submit button
    const submitBtn = document.getElementById('level-test-submit-btn');
    if (submitBtn) submitBtn.style.display = 'none';
}

/**
 * Advance child's level in Firestore and local storage.
 * @param {string} childId
 * @param {string} module - 'math' or 'english'
 * @param {number} newLevel
 */
async function advanceChildLevel(childId, module, newLevel) {
    try {
        // Update assessment data in localStorage
        const subject = module === 'math' ? 'addition' : 'english';
        if (typeof saveAssessmentResult === 'function') {
            await saveAssessmentResult(childId, subject, 100, newLevel);
        }

        // Update Firestore child document
        await firebase.firestore().collection('children').doc(childId).update({
            [`currentLevel.${module}`]: newLevel,
            [`levelHistory.${module}`]: firebase.firestore.FieldValue.arrayUnion({
                level: newLevel,
                date: new Date().toISOString(),
                source: 'level_test'
            }),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Advanced ${childId} to ${module} level ${newLevel}`);
    } catch (error) {
        console.error('Error advancing child level:', error);
    }
}

/**
 * Cancel the level test and return to normal view.
 */
function cancelLevelTest() {
    levelTestState = null;
    const container = document.getElementById('level-test-area');
    if (container) {
        container.innerHTML = '';
        container.style.display = 'none';
    }

    // Show normal content again
    const subjectSelection = document.querySelector('.subject-selection');
    if (subjectSelection) subjectSelection.style.display = 'block';
}

// ============================================================================
// UI INTEGRATION
// ============================================================================

/**
 * Render "Take Test" button on the home page if eligible.
 * @param {HTMLElement} container
 */
async function renderLevelTestButtons(container) {
    if (!container) return;

    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) {
        container.style.display = 'none';
        return;
    }

    const mathEligibility = await checkLevelTestEligibility(child.id, 'math');
    const englishEligibility = await checkLevelTestEligibility(child.id, 'english');

    if (!mathEligibility.eligible && !englishEligibility.eligible) {
        // Show progress toward eligibility
        const mathWeeks = mathEligibility.weeksCompleted || 0;
        const engWeeks = englishEligibility.weeksCompleted || 0;

        if (mathWeeks > 0 || engWeeks > 0) {
            container.innerHTML = `
                <div style="
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 15px 20px;
                    margin: 10px 0;
                    text-align: center;
                    font-size: 0.9em;
                    color: #666;
                ">
                    <strong>Level Test Progress</strong>
                    <div style="display: flex; gap: 20px; justify-content: center; margin-top: 8px;">
                        <span>Math: ${mathWeeks}/${LEVEL_TEST_CONFIG.MIN_WEEKS} weeks (avg ${mathEligibility.avgScore || 0}%)</span>
                        <span>English: ${engWeeks}/${LEVEL_TEST_CONFIG.MIN_WEEKS} weeks (avg ${englishEligibility.avgScore || 0}%)</span>
                    </div>
                </div>
            `;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
        return;
    }

    let html = '<div style="display: flex; gap: 12px; justify-content: center; margin: 15px 0;">';

    if (mathEligibility.eligible) {
        html += `
            <button onclick="startLevelTest('math')" style="
                padding: 12px 24px;
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 1em;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
                box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                📐 Take Math Level Test (Lv ${mathEligibility.currentLevel})
            </button>
        `;
    }

    if (englishEligibility.eligible) {
        html += `
            <button onclick="startLevelTest('english')" style="
                padding: 12px 24px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 1em;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                📚 Take English Level Test (Lv ${englishEligibility.currentLevel})
            </button>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
}

console.log('Level test system loaded');
