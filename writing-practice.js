// Writing Practice with Ruled Lines for iPad Pencil

let canvases = [];

const writingActivities = {
    letters: [
        { prompt: 'Practice writing the letter:', example: 'A', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'B', type: 'uppercase' },
        { prompt: 'Practice writing the letter:', example: 'a', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'b', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'c', type: 'lowercase' },
        { prompt: 'Practice writing the letter:', example: 'd', type: 'lowercase' }
    ],
    words: [
        { prompt: 'Practice writing the word:', example: 'cat', meaning: '🐱' },
        { prompt: 'Practice writing the word:', example: 'dog', meaning: '🐶' },
        { prompt: 'Practice writing the word:', example: 'sun', meaning: '🌞' },
        { prompt: 'Practice writing the word:', example: 'tree', meaning: '🌳' },
        { prompt: 'Practice writing the word:', example: 'book', meaning: '📚' },
        { prompt: 'Practice writing the word:', example: 'apple', meaning: '🍎' }
    ],
    sentences: [
        { prompt: 'Copy this sentence:', example: 'I am happy.' },
        { prompt: 'Copy this sentence:', example: 'The cat is big.' },
        { prompt: 'Copy this sentence:', example: 'I like to read.' },
        { prompt: 'Copy this sentence:', example: 'The sun is bright.' },
        { prompt: 'Copy this sentence:', example: 'My dog can run.' },
        { prompt: 'Copy this sentence:', example: 'We play together.' }
    ],
    free: [
        { prompt: 'Write about your day:', example: '' },
        { prompt: 'Write your name and age:', example: '' },
        { prompt: 'Write about your favorite toy:', example: '' },
        { prompt: 'Write what you see:', example: '' }
    ]
};

function generateWritingWorksheet() {
    const today = new Date().toLocaleDateString();

    // Combine activities
    const allActivities = [
        ...writingActivities.letters.slice(0, 4),
        ...writingActivities.words.slice(0, 4),
        ...writingActivities.sentences.slice(0, 3),
        ...writingActivities.free.slice(0, 1)
    ];

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

    const html = `
        <div class="worksheet-container">
            <div class="worksheet-header">
                <div class="worksheet-info">
                    <h2>✍️ Writing Practice</h2>
                    <p>Use your iPad pencil to practice handwriting</p>
                    <p>${allActivities.length} activities</p>
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
