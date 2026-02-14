// Emotional Quotient Activities Generator

let currentAge = null;
let currentDifficulty = null;
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

// Navigation
function selectAge(age) {
    currentAge = age;
    document.getElementById('age-selection').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';
}

function backToAges() {
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('age-selection').style.display = 'block';
}

function backToWorksheetSelection() {
    document.getElementById('worksheet-area').innerHTML = '';
    document.getElementById('difficulty-selection').style.display = 'block';
}

// Activity Generators
function generateEasyActivities() {
    return [
        // Basic emotion recognition
        {
            type: 'emotion-face',
            emoji: '😊',
            question: 'How does this face feel?',
            options: ['Happy', 'Sad', 'Angry'],
            answer: 'Happy'
        },
        {
            type: 'emotion-face',
            emoji: '😢',
            question: 'How does this face feel?',
            options: ['Happy', 'Sad', 'Angry'],
            answer: 'Sad'
        },
        {
            type: 'emotion-face',
            emoji: '😠',
            question: 'How does this face feel?',
            options: ['Happy', 'Sad', 'Angry'],
            answer: 'Angry'
        },
        {
            type: 'emotion-face',
            emoji: '😨',
            question: 'How does this face feel?',
            options: ['Scared', 'Happy', 'Sleepy'],
            answer: 'Scared'
        },
        // Simple scenarios
        {
            type: 'scenario',
            situation: '🎂',
            text: 'It\'s your birthday and you get a big cake!',
            question: 'How do you feel?',
            options: ['Happy', 'Sad', 'Angry'],
            answer: 'Happy'
        },
        {
            type: 'scenario',
            situation: '🧸',
            text: 'You lose your favorite toy.',
            question: 'How do you feel?',
            options: ['Happy', 'Sad', 'Excited'],
            answer: 'Sad'
        },
        {
            type: 'scenario',
            situation: '🐕',
            text: 'A big dog runs toward you barking loudly.',
            question: 'How do you feel?',
            options: ['Scared', 'Happy', 'Tired'],
            answer: 'Scared'
        },
        {
            type: 'scenario',
            situation: '🎁',
            text: 'Someone gives you a surprise present!',
            question: 'How do you feel?',
            options: ['Excited', 'Sad', 'Angry'],
            answer: 'Excited'
        },
        // Understanding others
        {
            type: 'empathy',
            situation: '😢',
            text: 'Your friend is crying.',
            question: 'What should you do?',
            options: ['Ask what\'s wrong', 'Laugh at them', 'Walk away'],
            answer: 'Ask what\'s wrong'
        },
        {
            type: 'empathy',
            situation: '😊',
            text: 'Your friend just won a game.',
            question: 'What should you do?',
            options: ['Say congratulations', 'Get angry', 'Ignore them'],
            answer: 'Say congratulations'
        },
        // Basic social situations
        {
            type: 'social',
            text: 'Someone accidentally bumps into you.',
            question: 'What should you say?',
            options: ['It\'s okay', 'You\'re mean!', 'Say nothing'],
            answer: 'It\'s okay'
        },
        {
            type: 'social',
            text: 'Your friend shares their snack with you.',
            question: 'What should you say?',
            options: ['Thank you', 'Give me more', 'Nothing'],
            answer: 'Thank you'
        }
    ];
}

function generateMediumActivities() {
    return [
        // More complex emotions
        {
            type: 'emotion-face',
            emoji: '😰',
            question: 'How does this face feel?',
            options: ['Worried', 'Happy', 'Angry', 'Sleepy'],
            answer: 'Worried'
        },
        {
            type: 'emotion-face',
            emoji: '😤',
            question: 'How does this face feel?',
            options: ['Frustrated', 'Happy', 'Surprised', 'Tired'],
            answer: 'Frustrated'
        },
        {
            type: 'emotion-face',
            emoji: '🥺',
            question: 'How does this face feel?',
            options: ['Disappointed', 'Excited', 'Proud', 'Angry'],
            answer: 'Disappointed'
        },
        // Understanding complex scenarios
        {
            type: 'scenario',
            situation: '📝',
            text: 'You studied hard and got a good grade on your test.',
            question: 'How do you feel?',
            options: ['Proud', 'Sad', 'Scared', 'Angry'],
            answer: 'Proud'
        },
        {
            type: 'scenario',
            situation: '⚽',
            text: 'Your team lost the soccer game even though you tried your best.',
            question: 'How might you feel?',
            options: ['Disappointed but okay', 'Very happy', 'Not care at all', 'Laugh at everyone'],
            answer: 'Disappointed but okay'
        },
        {
            type: 'scenario',
            situation: '🎭',
            text: 'You have to perform in front of the whole school tomorrow.',
            question: 'How might you feel?',
            options: ['Nervous', 'Bored', 'Sleepy', 'Hungry'],
            answer: 'Nervous'
        },
        // Empathy and perspective
        {
            type: 'empathy',
            situation: '😔',
            text: 'Your friend didn\'t get invited to a birthday party.',
            question: 'How do you think they feel?',
            options: ['Sad and left out', 'Very happy', 'Excited', 'Angry at you'],
            answer: 'Sad and left out'
        },
        {
            type: 'empathy',
            situation: '🎨',
            text: 'Your friend worked hard on a drawing but it didn\'t turn out well.',
            question: 'What should you say?',
            options: ['You tried hard! Keep practicing', 'That looks terrible', 'I can do better', 'Don\'t show anyone'],
            answer: 'You tried hard! Keep practicing'
        },
        {
            type: 'empathy',
            situation: '🤕',
            text: 'A classmate fell and hurt their knee.',
            question: 'What should you do?',
            options: ['Help them up and tell a teacher', 'Laugh at them', 'Keep playing', 'Take a picture'],
            answer: 'Help them up and tell a teacher'
        },
        // Social problem solving
        {
            type: 'social',
            text: 'Two friends both want to play with the same toy.',
            question: 'What\'s a good solution?',
            options: ['Take turns playing', 'The bigger kid gets it', 'Hide the toy', 'Fight over it'],
            answer: 'Take turns playing'
        },
        {
            type: 'social',
            text: 'You accidentally broke your sister\'s crayon.',
            question: 'What should you do?',
            options: ['Say sorry and help fix it', 'Hide it', 'Blame someone else', 'Break more crayons'],
            answer: 'Say sorry and help fix it'
        },
        {
            type: 'social',
            text: 'Your friend is playing a game and you want to join.',
            question: 'What should you do?',
            options: ['Politely ask to join', 'Grab the game', 'Get angry', 'Tell the teacher'],
            answer: 'Politely ask to join'
        },
        // Managing emotions
        {
            type: 'self-regulation',
            text: 'You are very angry because someone took your pencil.',
            question: 'What\'s the best thing to do?',
            options: ['Take deep breaths and ask for it back', 'Hit them', 'Scream loudly', 'Cry and run away'],
            answer: 'Take deep breaths and ask for it back'
        },
        {
            type: 'self-regulation',
            text: 'You really want a toy but Mom says no.',
            question: 'What should you do?',
            options: ['Accept it calmly and ask why', 'Throw a tantrum', 'Take it anyway', 'Never talk to Mom again'],
            answer: 'Accept it calmly and ask why'
        },
        // Recognizing others' needs
        {
            type: 'empathy',
            situation: '🤐',
            text: 'Your friend is very quiet today and sitting alone.',
            question: 'What should you do?',
            options: ['Sit with them and ask if they\'re okay', 'Ignore them', 'Tell everyone they\'re weird', 'Laugh at them'],
            answer: 'Sit with them and ask if they\'re okay'
        }
    ];
}

function generateHardActivities() {
    return [
        // Complex emotion recognition
        {
            type: 'emotion-face',
            emoji: '😏',
            question: 'How does this face feel?',
            options: ['Confident', 'Sad', 'Scared', 'Crying'],
            answer: 'Confident'
        },
        {
            type: 'emotion-face',
            emoji: '🤔',
            question: 'How does this face feel?',
            options: ['Confused or thinking', 'Very happy', 'Very angry', 'Sleeping'],
            answer: 'Confused or thinking'
        },
        // Complex scenarios with multiple perspectives
        {
            type: 'scenario',
            situation: '👥',
            text: 'Your two best friends had a fight and both want you to take their side.',
            question: 'What\'s the best thing to do?',
            options: ['Listen to both and help them talk it out', 'Choose one friend only', 'Ignore both friends', 'Make fun of both'],
            answer: 'Listen to both and help them talk it out'
        },
        {
            type: 'scenario',
            situation: '🎮',
            text: 'You want to play video games but your little brother wants to play outside with you.',
            question: 'What shows good emotional intelligence?',
            options: ['Compromise: play half outside, half games', 'Only do what you want', 'Get angry at him', 'Tell parents he\'s annoying'],
            answer: 'Compromise: play half outside, half games'
        },
        {
            type: 'scenario',
            situation: '🏆',
            text: 'You won first place but your best friend came in last.',
            question: 'How should you act?',
            options: ['Be happy but kind, don\'t brag', 'Brag a lot about winning', 'Pretend you didn\'t win', 'Make fun of your friend'],
            answer: 'Be happy but kind, don\'t brag'
        },
        // Advanced empathy
        {
            type: 'empathy',
            situation: '😞',
            text: 'A classmate always sits alone. Others say they\'re weird, but you don\'t know them well.',
            question: 'What\'s the most emotionally intelligent choice?',
            options: ['Try to get to know them yourself', 'Agree they\'re weird', 'Ignore them like others do', 'Tell everyone else to avoid them'],
            answer: 'Try to get to know them yourself'
        },
        {
            type: 'empathy',
            situation: '🎭',
            text: 'Your friend forgot their lines in the school play and feels embarrassed.',
            question: 'What should you say?',
            options: ['Everyone makes mistakes, you did great!', 'You messed up badly', 'I would never forget my lines', 'Don\'t try acting again'],
            answer: 'Everyone makes mistakes, you did great!'
        },
        {
            type: 'empathy',
            situation: '🆕',
            text: 'A new student doesn\'t speak much English and sits alone at lunch.',
            question: 'What shows emotional intelligence?',
            options: ['Sit with them and be friendly with gestures', 'Ignore them because it\'s hard to talk', 'Make fun of how they talk', 'Tell them to go away'],
            answer: 'Sit with them and be friendly with gestures'
        },
        // Complex social situations
        {
            type: 'social',
            text: 'Your friend group is leaving someone out on purpose to be mean.',
            question: 'What\'s the right thing to do?',
            options: ['Include that person or speak up', 'Go along with the group', 'Stay quiet and watch', 'Join in being mean'],
            answer: 'Include that person or speak up'
        },
        {
            type: 'social',
            text: 'Someone spread a rumor about you that isn\'t true.',
            question: 'What\'s the most mature response?',
            options: ['Calmly tell the truth to people who matter', 'Spread rumors about them back', 'Get very angry and yell', 'Cry and hide'],
            answer: 'Calmly tell the truth to people who matter'
        },
        {
            type: 'social',
            text: 'Your teacher blamed you for something you didn\'t do.',
            question: 'What should you do?',
            options: ['Respectfully explain what really happened', 'Yell at the teacher', 'Blame another student', 'Accept punishment without speaking'],
            answer: 'Respectfully explain what really happened'
        },
        // Self-awareness and regulation
        {
            type: 'self-regulation',
            text: 'You\'re very frustrated because you keep making mistakes on your homework.',
            question: 'What\'s the best way to handle this feeling?',
            options: ['Take a break, then try again calmly', 'Rip up the homework', 'Give up completely', 'Blame the teacher for making it hard'],
            answer: 'Take a break, then try again calmly'
        },
        {
            type: 'self-regulation',
            text: 'Someone keeps bothering you even after you asked them to stop.',
            question: 'What should you do?',
            options: ['Tell a teacher or adult calmly', 'Hit them', 'Bother them back', 'Keep being annoyed but do nothing'],
            answer: 'Tell a teacher or adult calmly'
        },
        {
            type: 'self-regulation',
            text: 'You feel jealous because your friend got something you wanted.',
            question: 'How should you handle jealousy?',
            options: ['Recognize the feeling but be happy for them', 'Stop being their friend', 'Try to take it from them', 'Tell everyone they don\'t deserve it'],
            answer: 'Recognize the feeling but be happy for them'
        },
        // Understanding consequences
        {
            type: 'consequence',
            text: 'You saw your friend cheating on a test.',
            question: 'What\'s the most thoughtful response?',
            options: ['Talk to your friend privately about it', 'Announce it to the class', 'Help them cheat more', 'Ignore it completely'],
            answer: 'Talk to your friend privately about it'
        },
        {
            type: 'consequence',
            text: 'You\'re in a group project and one person isn\'t doing any work.',
            question: 'What shows good emotional and social skills?',
            options: ['Talk to them kindly about helping', 'Do all the work yourself', 'Kick them out of the group', 'Tell the teacher immediately without talking first'],
            answer: 'Talk to them kindly about helping'
        }
    ];
}

// Load activities based on difficulty
function loadActivities(difficulty) {
    currentDifficulty = difficulty;

    let activities = [];
    if (difficulty === 'easy') {
        activities = generateEasyActivities();
    } else if (difficulty === 'medium') {
        activities = generateMediumActivities();
    } else {
        activities = generateHardActivities();
    }

    currentWorksheet = {
        difficulty,
        activities: activities
    };

    renderWorksheet();
}

// Render worksheet
function renderWorksheet() {
    const { difficulty, activities } = currentWorksheet;
    const today = new Date().toLocaleDateString();

    const difficultyLabels = {
        easy: '⭐ EASY - Basic Emotions',
        medium: '⭐⭐ MEDIUM - Understanding Feelings',
        hard: '⭐⭐⭐ HARD - Complex Situations'
    };

    let problemsHTML = '';

    activities.forEach((activity, index) => {
        if (activity.type === 'emotion-face') {
            problemsHTML += `
                <div class="eq-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                    </div>
                    <div class="emoji-large">${activity.emoji}</div>
                    <div class="question-text">${activity.question}</div>
                    <div class="emotion-options">
                        ${activity.options.map((opt, optIndex) => `
                            <button class="emotion-btn" data-question="${index}" data-answer="${opt.replace(/"/g, '&quot;')}" onclick="selectAnswer(this)">${opt}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="answer-${index}" data-answer="${activity.answer}">
                    <span class="answer-feedback" id="feedback-${index}"></span>
                </div>
            `;
        } else if (activity.type === 'scenario') {
            problemsHTML += `
                <div class="eq-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                    </div>
                    <div class="situation-image">${activity.situation}</div>
                    <div class="scenario-text">${activity.text}</div>
                    <div class="question-text">${activity.question}</div>
                    <div class="emotion-options">
                        ${activity.options.map((opt, optIndex) => `
                            <button class="emotion-btn" data-question="${index}" data-answer="${opt.replace(/"/g, '&quot;')}" onclick="selectAnswer(this)">${opt}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="answer-${index}" data-answer="${activity.answer}">
                    <span class="answer-feedback" id="feedback-${index}"></span>
                </div>
            `;
        } else if (activity.type === 'empathy' || activity.type === 'social' || activity.type === 'self-regulation' || activity.type === 'consequence') {
            const showSituation = activity.situation ? `<div class="situation-image">${activity.situation}</div>` : '';
            problemsHTML += `
                <div class="eq-problem">
                    <div class="problem-header">
                        <span class="problem-number">${index + 1}.</span>
                    </div>
                    ${showSituation}
                    <div class="scenario-text">${activity.text}</div>
                    <div class="question-text">${activity.question}</div>
                    <div class="emotion-options">
                        ${activity.options.map((opt, optIndex) => `
                            <button class="emotion-btn" data-question="${index}" data-answer="${opt.replace(/"/g, '&quot;')}" onclick="selectAnswer(this)">${opt}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="answer-${index}" data-answer="${activity.answer}">
                    <span class="answer-feedback" id="feedback-${index}"></span>
                </div>
            `;
        }
    });

    const html = `
        <div class="worksheet-container">
            <div class="worksheet-header">
                <div class="worksheet-info">
                    <h2>❤️ Emotional Quotient Activities</h2>
                    <p>${difficultyLabels[difficulty]}</p>
                    <p>${activities.length} activities</p>
                </div>
                <div class="student-info">
                    <div class="info-row">
                        <strong>Name:</strong>
                        <input type="text" id="student-name" value="Karthigai Selvi">
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
                <button onclick="loadActivities('${difficulty}')">New ${difficulty.toUpperCase()} Set</button>
            </div>

            <div class="controls">
                <div class="timer">
                    <span id="timer-display">00:00</span>
                </div>
                <div class="control-buttons">
                    <button onclick="startTimer()">Start Timer</button>
                    <button onclick="stopTimer()">Stop Timer</button>
                    <button onclick="checkAnswers()">Check Answers</button>
                    <button onclick="savePDF()">Save as PDF</button>
                </div>
            </div>

            <div class="results-summary" id="results-summary"></div>

            <div class="problems-container">${problemsHTML}</div>
        </div>
    `;

    document.getElementById('eq-selection').style.display = 'none';
    document.getElementById('worksheet-area').innerHTML = html;

    elapsedSeconds = 0;
    updateTimerDisplay();
}

// Select answer function
function selectAnswer(button) {
    const index = button.getAttribute('data-question');
    const answer = button.getAttribute('data-answer');

    document.getElementById(`answer-${index}`).value = answer;

    // Remove selected class from all buttons in this question
    const buttons = button.parentElement.querySelectorAll('.emotion-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));

    // Add selected class to clicked button
    button.classList.add('selected');
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

// Check answers
function checkAnswers() {
    stopTimer();

    let correct = 0;
    let total = currentWorksheet.activities.length;

    currentWorksheet.activities.forEach((activity, index) => {
        const input = document.getElementById(`answer-${index}`);
        const feedback = document.getElementById(`feedback-${index}`);

        if (!input) return;

        const userAnswer = input.value.trim();
        const correctAnswer = activity.answer;

        if (userAnswer === correctAnswer) {
            feedback.textContent = '✓ Great!';
            feedback.style.color = '#00aa00';
            feedback.style.fontSize = '1.5em';
            feedback.style.display = 'block';
            feedback.style.marginTop = '10px';
            correct++;
        } else if (userAnswer === '') {
            feedback.textContent = '';
        } else {
            feedback.textContent = '✗ Think about it more';
            feedback.style.color = '#cc0000';
            feedback.style.fontSize = '1.5em';
            feedback.style.display = 'block';
            feedback.style.marginTop = '10px';
        }
    });

    const resultsDiv = document.getElementById('results-summary');
    const percentage = Math.round((correct / total) * 100);

    let message = '';
    if (percentage === 100) {
        message = '<p style="color: #00aa00; font-weight: bold; font-size: 1.3em;">🎉 Perfect! You have great emotional intelligence! ❤️</p>';
    } else if (percentage >= 80) {
        message = '<p style="color: #0066cc; font-weight: bold; font-size: 1.3em;">😊 Excellent! You understand emotions well! 💪</p>';
    } else {
        message = '<p style="color: #cc6600; font-weight: bold; font-size: 1.3em;">💪 Good try! Keep learning about emotions! 📚</p>';
    }

    resultsDiv.innerHTML = `
        <h3>Results</h3>
        <div class="score">${correct} / ${total} correct (${percentage}%)</div>
        <p>Time: ${document.getElementById('elapsed-time').textContent}</p>
        ${message}
    `;
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Save PDF
function savePDF() {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
    const filename = `EQ_${currentWorksheet.difficulty}_${timestamp}.pdf`;

    const controls = document.querySelector('.controls');
    const results = document.getElementById('results-summary');
    const navigation = document.querySelector('.navigation');

    const controlsDisplay = controls.style.display;
    const resultsDisplay = results.style.display;
    const navigationDisplay = navigation.style.display;

    controls.style.display = 'none';
    results.style.display = 'none';
    navigation.style.display = 'none';

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
    });
}
