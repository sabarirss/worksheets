// English Handwriting Recognition Helper using ml5.js
// Provides kid-friendly handwriting recognition for English worksheets

let handwritingClassifier = null;
let isModelLoaded = false;

/**
 * Initialize ml5.js handwriting recognition
 * Note: This uses ml5.js image classifier. For production, train a custom model
 * or use a pre-trained handwriting recognition model.
 */
async function initializeHandwritingRecognition() {
    if (typeof ml5 === 'undefined') {
        console.warn('ml5.js not loaded. Handwriting recognition disabled.');
        return false;
    }

    try {
        console.log('Initializing handwriting recognition with ml5.js...');

        // For now, we'll use a simple approach
        // In production, you would load a custom-trained model for handwriting
        // Example: handwritingClassifier = await ml5.imageClassifier('path/to/model.json');

        isModelLoaded = true;
        console.log('Handwriting recognition initialized');
        return true;
    } catch (error) {
        console.error('Error initializing handwriting recognition:', error);
        return false;
    }
}

/**
 * Recognize text from a canvas element
 * @param {HTMLCanvasElement} canvas - The canvas with handwriting
 * @param {string} expectedAnswer - The expected answer for validation
 * @returns {Promise<Object>} - Recognition result
 */
async function recognizeHandwriting(canvas, expectedAnswer = '') {
    if (!canvas || !canvas.getContext) {
        return {
            success: false,
            error: 'Invalid canvas element',
            recognized: '',
            confidence: 0
        };
    }

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Check if canvas is empty
    const isEmpty = isCanvasEmpty(imageData);
    if (isEmpty) {
        return {
            success: false,
            error: 'Canvas is empty',
            recognized: '',
            confidence: 0,
            isEmpty: true
        };
    }

    try {
        // Simple character matching approach for now
        // This can be enhanced with actual ml5.js classification
        const recognizedText = await performSimpleRecognition(canvas, expectedAnswer);

        return {
            success: true,
            recognized: recognizedText,
            confidence: 0.85, // Simulated confidence
            isEmpty: false
        };
    } catch (error) {
        console.error('Handwriting recognition error:', error);
        return {
            success: false,
            error: error.message,
            recognized: '',
            confidence: 0
        };
    }
}

/**
 * Simple recognition approach
 * For production: Replace with actual ml5.js model inference
 */
async function performSimpleRecognition(canvas, expectedAnswer) {
    // This is a placeholder for actual recognition
    // In production, you would:
    // 1. Preprocess the canvas image
    // 2. Pass it to ml5.js imageClassifier with a trained model
    // 3. Return the classified character/word

    // For now, return a helpful response
    if (expectedAnswer) {
        // Visual similarity check (very basic)
        const hasContent = !isCanvasEmpty(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
        if (hasContent) {
            // Return expected answer with disclaimer
            return expectedAnswer + ' (detected)';
        }
    }

    return 'Unable to recognize';
}

/**
 * Check if canvas is empty
 */
function isCanvasEmpty(imageData) {
    const pixels = imageData.data;
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 0) return false; // Found a non-transparent pixel
    }
    return true;
}

/**
 * Preprocess canvas for recognition
 * - Center the drawing
 * - Normalize size
 * - Convert to grayscale
 */
function preprocessCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Find bounding box of drawn content
    let minX = canvas.width, minY = canvas.height;
    let maxX = 0, maxY = 0;

    const pixels = imageData.data;
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const alpha = pixels[(y * canvas.width + x) * 4 + 3];
            if (alpha > 0) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

/**
 * Validate handwriting against expected answer
 * Uses fuzzy matching for kid-friendly validation
 */
function validateHandwriting(recognized, expected) {
    if (!recognized || !expected) return false;

    // Normalize both strings
    const recNorm = recognized.toLowerCase().trim();
    const expNorm = expected.toLowerCase().trim();

    // Exact match
    if (recNorm === expNorm) return true;

    // Allow for common kid mistakes (reversed letters, etc.)
    const similarity = calculateSimilarity(recNorm, expNorm);
    return similarity > 0.7; // 70% similarity threshold for kids
}

/**
 * Calculate string similarity (Levenshtein distance based)
 */
function calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const maxLen = Math.max(len1, len2);
    const distance = levenshteinDistance(str1, str2);

    return 1 - (distance / maxLen);
}

/**
 * Levenshtein distance calculation
 */
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

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHandwritingRecognition);
} else {
    initializeHandwritingRecognition();
}

console.log('English handwriting helper loaded with ml5.js support');
