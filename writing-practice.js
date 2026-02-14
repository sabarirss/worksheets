// Writing Practice with Ruled Lines for iPad Pencil

let canvases = [];

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

const writingActivities = {
    letters: [
        // Uppercase letters A-Z
        { prompt: 'Practice writing the letter:', example: 'A', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'B', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'C', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'D', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'E', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'F', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'G', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'H', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'I', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'J', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'K', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'L', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'M', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'N', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'O', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'P', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'Q', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'R', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'S', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'T', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'U', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'V', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'W', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'X', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'Y', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'Z', type: 'uppercase' },
        // Lowercase letters a-z
        { prompt: 'Practice writing the letter:', example: 'a', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'b', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'c', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'd', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'e', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'f', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'g', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'h', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'i', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'j', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'k', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'l', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'm', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'n', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'o', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'p', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'q', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'r', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 's', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 't', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'u', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'v', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'w', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'x', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'y', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'z', type: 'lowercase' }
    ],
    words: [
        // Animals
        { prompt: 'Practice writing the word:', example: 'cat', meaning: '🐱' },
        { prompt: 'Practice writing the word:', example: 'dog', meaning: '🐶' },
        { prompt: 'Practice writing the word:', example: 'bird', meaning: '🐦' },
        { prompt: 'Practice writing the word:', example: 'fish', meaning: '🐟' },
        { prompt: 'Practice writing the word:', example: 'lion', meaning: '🦁' },
        { prompt: 'Practice writing the word:', example: 'bear', meaning: '🐻' },
        { prompt: 'Practice writing the word:', example: 'elephant', meaning: '🐘' },
        { prompt: 'Practice writing the word:', example: 'monkey', meaning: '🐒' },
        { prompt: 'Practice writing the word:', example: 'rabbit', meaning: '🐰' },
        { prompt: 'Practice writing the word:', example: 'frog', meaning: '🐸' },
        // Nature
        { prompt: 'Practice writing the word:', example: 'sun', meaning: '🌞' },
        { prompt: 'Practice writing the word:', example: 'moon', meaning: '🌙' },
        { prompt: 'Practice writing the word:', example: 'star', meaning: '⭐' },
        { prompt: 'Practice writing the word:', example: 'tree', meaning: '🌳' },
        { prompt: 'Practice writing the word:', example: 'flower', meaning: '🌺' },
        { prompt: 'Practice writing the word:', example: 'cloud', meaning: '☁️' },
        { prompt: 'Practice writing the word:', example: 'rain', meaning: '🌧️' },
        { prompt: 'Practice writing the word:', example: 'rainbow', meaning: '🌈' },
        { prompt: 'Practice writing the word:', example: 'mountain', meaning: '🏔️' },
        { prompt: 'Practice writing the word:', example: 'ocean', meaning: '🌊' },
        // Food
        { prompt: 'Practice writing the word:', example: 'apple', meaning: '🍎' },
        { prompt: 'Practice writing the word:', example: 'banana', meaning: '🍌' },
        { prompt: 'Practice writing the word:', example: 'orange', meaning: '🍊' },
        { prompt: 'Practice writing the word:', example: 'bread', meaning: '🍞' },
        { prompt: 'Practice writing the word:', example: 'milk', meaning: '🥛' },
        { prompt: 'Practice writing the word:', example: 'egg', meaning: '🥚' },
        { prompt: 'Practice writing the word:', example: 'cheese', meaning: '🧀' },
        { prompt: 'Practice writing the word:', example: 'pizza', meaning: '🍕' },
        { prompt: 'Practice writing the word:', example: 'cake', meaning: '🍰' },
        { prompt: 'Practice writing the word:', example: 'cookie', meaning: '🍪' },
        // Objects
        { prompt: 'Practice writing the word:', example: 'book', meaning: '📚' },
        { prompt: 'Practice writing the word:', example: 'pencil', meaning: '✏️' },
        { prompt: 'Practice writing the word:', example: 'car', meaning: '🚗' },
        { prompt: 'Practice writing the word:', example: 'bus', meaning: '🚌' },
        { prompt: 'Practice writing the word:', example: 'plane', meaning: '✈️' },
        { prompt: 'Practice writing the word:', example: 'bike', meaning: '🚲' },
        { prompt: 'Practice writing the word:', example: 'ball', meaning: '⚽' },
        { prompt: 'Practice writing the word:', example: 'house', meaning: '🏠' },
        { prompt: 'Practice writing the word:', example: 'school', meaning: '🏫' },
        { prompt: 'Practice writing the word:', example: 'phone', meaning: '📱' },
        // Colors & Shapes
        { prompt: 'Practice writing the word:', example: 'red', meaning: '🔴' },
        { prompt: 'Practice writing the word:', example: 'blue', meaning: '🔵' },
        { prompt: 'Practice writing the word:', example: 'yellow', meaning: '🟡' },
        { prompt: 'Practice writing the word:', example: 'green', meaning: '🟢' },
        { prompt: 'Practice writing the word:', example: 'circle', meaning: '⭕' },
        { prompt: 'Practice writing the word:', example: 'square', meaning: '⬜' },
        { prompt: 'Practice writing the word:', example: 'triangle', meaning: '🔺' },
        { prompt: 'Practice writing the word:', example: 'heart', meaning: '❤️' },
        { prompt: 'Practice writing the word:', example: 'star', meaning: '⭐' },
        { prompt: 'Practice writing the word:', example: 'diamond', meaning: '💎' }
    ],
    sentences: [
        // Simple present tense
        { prompt: 'Copy this sentence:', example: 'I am happy.' },
        { prompt: 'Copy this sentence:', example: 'The cat is big.' },
        { prompt: 'Copy this sentence:', example: 'I like to read.' },
        { prompt: 'Copy this sentence:', example: 'The sun is bright.' },
        { prompt: 'Copy this sentence:', example: 'My dog can run.' },
        { prompt: 'Copy this sentence:', example: 'We play together.' },
        { prompt: 'Copy this sentence:', example: 'She has a red ball.' },
        { prompt: 'Copy this sentence:', example: 'The bird can sing.' },
        { prompt: 'Copy this sentence:', example: 'I love my family.' },
        { prompt: 'Copy this sentence:', example: 'The tree is tall.' },
        // Action sentences
        { prompt: 'Copy this sentence:', example: 'The boy runs fast.' },
        { prompt: 'Copy this sentence:', example: 'We eat breakfast.' },
        { prompt: 'Copy this sentence:', example: 'She reads a book.' },
        { prompt: 'Copy this sentence:', example: 'They play outside.' },
        { prompt: 'Copy this sentence:', example: 'I write my name.' },
        { prompt: 'Copy this sentence:', example: 'He jumps very high.' },
        { prompt: 'Copy this sentence:', example: 'The fish swims fast.' },
        { prompt: 'Copy this sentence:', example: 'We sing a song.' },
        { prompt: 'Copy this sentence:', example: 'The baby sleeps well.' },
        { prompt: 'Copy this sentence:', example: 'She draws a picture.' },
        // Descriptive sentences
        { prompt: 'Copy this sentence:', example: 'The sky is blue.' },
        { prompt: 'Copy this sentence:', example: 'My room is clean.' },
        { prompt: 'Copy this sentence:', example: 'The water is cold.' },
        { prompt: 'Copy this sentence:', example: 'Her dress is pretty.' },
        { prompt: 'Copy this sentence:', example: 'The apple tastes good.' },
        { prompt: 'Copy this sentence:', example: 'This book is funny.' },
        { prompt: 'Copy this sentence:', example: 'The flower smells nice.' },
        { prompt: 'Copy this sentence:', example: 'My bed is soft.' },
        { prompt: 'Copy this sentence:', example: 'The moon is round.' },
        { prompt: 'Copy this sentence:', example: 'His car is new.' },
        // Question sentences
        { prompt: 'Copy this sentence:', example: 'What is your name?' },
        { prompt: 'Copy this sentence:', example: 'How are you today?' },
        { prompt: 'Copy this sentence:', example: 'Where is my toy?' },
        { prompt: 'Copy this sentence:', example: 'Can you help me?' },
        { prompt: 'Copy this sentence:', example: 'Do you like ice cream?' },
        { prompt: 'Copy this sentence:', example: 'When is your birthday?' },
        { prompt: 'Copy this sentence:', example: 'Who is that person?' },
        { prompt: 'Copy this sentence:', example: 'Why is the sky blue?' },
        { prompt: 'Copy this sentence:', example: 'Which book do you want?' },
        { prompt: 'Copy this sentence:', example: 'May I go outside?' }
    ],
    free: [
        // Personal
        { prompt: 'Write about your day:', example: '' },
        { prompt: 'Write your name and age:', example: '' },
        { prompt: 'Write about your favorite toy:', example: '' },
        { prompt: 'Write what you see:', example: '' },
        { prompt: 'Write about your family:', example: '' },
        { prompt: 'Write about your best friend:', example: '' },
        { prompt: 'Write what you did today:', example: '' },
        { prompt: 'Write about your pet:', example: '' },
        { prompt: 'Write your favorite color and why:', example: '' },
        { prompt: 'Write about your bedroom:', example: '' },
        // Creative
        { prompt: 'Describe a happy day:', example: '' },
        { prompt: 'Write about your favorite food:', example: '' },
        { prompt: 'What do you want to be when you grow up?', example: '' },
        { prompt: 'Write about a fun trip:', example: '' },
        { prompt: 'Describe your school:', example: '' },
        { prompt: 'Write about a special birthday:', example: '' },
        { prompt: 'What makes you smile?', example: '' },
        { prompt: 'Write about the weather today:', example: '' },
        { prompt: 'Describe your favorite game:', example: '' },
        { prompt: 'Write about a kind act:', example: '' },
        // Imaginative
        { prompt: 'If you had superpowers, what would they be?', example: '' },
        { prompt: 'Write about meeting a friendly alien:', example: '' },
        { prompt: 'Describe your dream treehouse:', example: '' },
        { prompt: 'If animals could talk, what would they say?', example: '' },
        { prompt: 'Write about a magic adventure:', example: '' },
        { prompt: 'Describe a flying car:', example: '' },
        { prompt: 'If you could visit any place, where would it be?', example: '' },
        { prompt: 'Write about finding a treasure:', example: '' },
        { prompt: 'Describe your perfect playground:', example: '' },
        { prompt: 'If you had a robot friend, what would it do?', example: '' }
    ]
};

function generateWritingWorksheet() {
    const today = new Date().toLocaleDateString();
    const isDemo = isDemoMode();

    // Combine activities with demo limiting
    let allActivities = [];

    if (isDemo) {
        // Demo: Only 2 activities total
        allActivities = [
            writingActivities.letters[0],  // Letter A
            writingActivities.words[0]     // cat
        ];
    } else {
        // Full version: 60+ activities total
        allActivities = [
            // 10 uppercase letters (A-J)
            ...writingActivities.letters.slice(0, 10),
            // 10 lowercase letters (a-j)
            ...writingActivities.letters.slice(26, 36),
            // 20 common words
            ...writingActivities.words.slice(0, 20),
            // 15 sentences
            ...writingActivities.sentences.slice(0, 15),
            // 5 creative writing prompts
            ...writingActivities.free.slice(0, 5)
        ];
    }

    let problemsHTML = '';

    allActivities.forEach((activity, index) => {
        const canvasId = `writing-canvas-${index}`;
        const meaningEmoji = activity.meaning ? `<span style="font-size: 2em; margin-left: 10px;">${activity.meaning}</span>` : '';

        problemsHTML += `
            <div class="writing-problem">
                <div class="problem-header">
                    <span class="problem-number">${index + 1}.</span>
                    <span class="problem-title">${activity.prompt}</span>
                </div>
                ${activity.example ? `
                    <div class="writing-example">
                        <span style="font-size: 1.3em; font-weight: bold;">${activity.example}</span>
                        ${meaningEmoji}
                    </div>
                ` : ''}
                <div class="writing-canvas-container">
                    <canvas id="${canvasId}" class="writing-canvas" width="800" height="200"></canvas>
                    <button class="clear-btn" onclick="clearCanvas('${canvasId}')">Clear</button>
                </div>
            </div>
        `;
    });

    const versionBadge = isDemo ? '<span style="color: #ff6b6b; font-weight: bold;">(DEMO - 2 activities)</span>' : '<span style="color: #4caf50; font-weight: bold;">(FULL VERSION - 60 activities)</span>';

    const html = `
        <div class="worksheet-container">
            <div class="worksheet-header">
                <div class="worksheet-info">
                    <h2>✍️ Writing Practice ${versionBadge}</h2>
                    <p>Use your iPad pencil to practice handwriting</p>
                    <p>${allActivities.length} activities</p>
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
                </div>
            </div>

            <div class="controls">
                <div class="control-buttons">
                    <button onclick="clearAllCanvases()">Clear All</button>
                    <button onclick="savePDF()">Save as PDF</button>
                </div>
            </div>

            <div class="problems-container">${problemsHTML}</div>

            <div class="navigation">
                <button onclick="location.reload()">Back to Levels</button>
            </div>
        </div>
    `;

    return html;
}

function initializeCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Draw ruled lines (4-line handwriting paper)
    drawRuledLines(canvas);

    // Store canvas info
    canvases.push({ id: canvasId, canvas: canvas, ctx: ctx });

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        const pos = getPosition(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function draw(e) {
        if (!isDrawing) return;

        e.preventDefault(); // Prevent scrolling on touch devices

        const pos = getPosition(e);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        lastX = pos.x;
        lastY = pos.y;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function getPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events (for iPad Pencil)
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
}

function drawRuledLines(canvas) {
    const ctx = canvas.getContext('2d');
    const height = canvas.height;
    const width = canvas.width;

    // Fill background with light blue (like traditional lined paper)
    ctx.fillStyle = '#f8f9ff';
    ctx.fillRect(0, 0, width, height);

    // Define clear line positions (more evenly spaced)
    const topLine = height * 0.25;      // Top line (ascender line)
    const midLine = height * 0.45;      // Middle dotted line (x-height)
    const baseLine = height * 0.55;     // BASELINE (main writing line) - THICK & DARK
    const bottomLine = height * 0.75;   // Bottom line (descender line)

    // Draw TOP LINE (thin, gray - for tall letters)
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, topLine);
    ctx.lineTo(width - 10, topLine);
    ctx.stroke();

    // Draw MIDDLE LINE (dotted, gray - x-height guide)
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);  // Dotted line
    ctx.beginPath();
    ctx.moveTo(50, midLine);
    ctx.lineTo(width - 10, midLine);
    ctx.stroke();
    ctx.setLineDash([]);  // Reset to solid

    // Draw BASELINE (THICK, DARK - main writing line)
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, baseLine);
    ctx.lineTo(width - 10, baseLine);
    ctx.stroke();

    // Draw BOTTOM LINE (thin, gray - for descenders)
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, bottomLine);
    ctx.lineTo(width - 10, bottomLine);
    ctx.stroke();

    // Draw vertical MARGIN LINE (red, like traditional paper)
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, height);
    ctx.stroke();

    // Add small labels on the left (for clarity)
    ctx.font = '10px Arial';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'right';
    ctx.fillText('↑ tall', 45, topLine + 4);
    ctx.fillText('x-height', 45, midLine + 4);
    ctx.fillText('BASE', 45, baseLine + 4);
    ctx.fillText('↓ desc', 45, bottomLine + 4);
}

function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRuledLines(canvas);
}

function clearAllCanvases() {
    if (confirm('Clear all writing? This cannot be undone.')) {
        canvases.forEach(item => {
            clearCanvas(item.id);
        });
    }
}

function initializeAllCanvases() {
    canvases = [];
    const allCanvases = document.querySelectorAll('.writing-canvas');
    allCanvases.forEach(canvas => {
        initializeCanvas(canvas.id);
    });
}

// Export for PDF functionality
function savePDF() {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
    const filename = `Writing_Practice_${timestamp}.pdf`;

    const controls = document.querySelector('.controls');
    const navigation = document.querySelector('.navigation');

    const controlsDisplay = controls.style.display;
    const navigationDisplay = navigation.style.display;

    controls.style.display = 'none';
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
        navigation.style.display = navigationDisplay;
    });
}
