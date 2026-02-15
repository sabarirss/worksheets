// Handwriting Input System for iPad Pencil
// Replaces text inputs with drawable canvases

class HandwritingInput {
    constructor(canvasId, width = 100, height = 60) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');

        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.hasContent = false;

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        // Light background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add a subtle border guide
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

        // Add a baseline guide
        this.ctx.strokeStyle = '#f0f0f0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height * 0.6);
        this.ctx.lineTo(this.canvas.width, this.canvas.height * 0.6);
        this.ctx.stroke();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events (iPad Pencil)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        }, { passive: false });

        this.canvas.addEventListener('touchcancel', () => this.stopDrawing());
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getPosition(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    draw(e) {
        if (!this.isDrawing) return;

        const pos = this.getPosition(e);

        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();

        this.lastX = pos.x;
        this.lastY = pos.y;
        this.hasContent = true;
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            // Call validation callback if it exists (after user finishes drawing)
            if (typeof validateShowAnswersToggle === 'function') {
                setTimeout(() => validateShowAnswersToggle(), 100);
            }
        }
    }

    getPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

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

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.setupCanvas();
        this.hasContent = false;

        // Call validation callback if it exists
        if (typeof validateShowAnswersToggle === 'function') {
            setTimeout(() => validateShowAnswersToggle(), 100);
        }
    }

    isEmpty() {
        return !this.hasContent;
    }

    // Get canvas as image data (for PDF export)
    getImageData() {
        return this.canvas.toDataURL();
    }
}

// Global storage for all handwriting inputs
let handwritingInputs = [];

// Initialize a handwriting input
function initHandwritingInput(canvasId, width = 100, height = 60) {
    const input = new HandwritingInput(canvasId, width, height);
    handwritingInputs.push(input);
    return input;
}

// Initialize all handwriting inputs on the page
function initializeAllHandwritingInputs() {
    handwritingInputs = [];
    const canvases = document.querySelectorAll('.handwriting-input');
    canvases.forEach(canvas => {
        const width = parseInt(canvas.dataset.width) || 100;
        const height = parseInt(canvas.dataset.height) || 60;
        initHandwritingInput(canvas.id, width, height);
    });
}

// Clear all handwriting inputs
function clearAllHandwritingInputs() {
    handwritingInputs.forEach(input => input.clear());
}

// Clear a specific handwriting input
function clearHandwritingInput(canvasId) {
    const input = handwritingInputs.find(inp => inp.canvasId === canvasId);
    if (input) {
        input.clear();
    }
}

// Create a handwriting input HTML element
function createHandwritingInputHTML(id, width = 100, height = 60, placeholder = '') {
    return `
        <div class="handwriting-input-container">
            <canvas
                id="${id}"
                class="handwriting-input"
                data-width="${width}"
                data-height="${height}"
                style="border: 2px solid #ddd; border-radius: 4px; cursor: crosshair; background: white; touch-action: none;">
            </canvas>
            ${placeholder ? `<span class="handwriting-placeholder">${placeholder}</span>` : ''}
        </div>
    `;
}

// Show correct answer overlay on canvas
function showAnswerOnCanvas(canvasId, correctAnswer) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Add semi-transparent overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw correct answer in green
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#00aa00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(correctAnswer, canvas.width / 2, canvas.height / 2);
}
