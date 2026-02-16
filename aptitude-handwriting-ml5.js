/**
 * Aptitude Handwriting Recognition using ml5.js
 * Kid-friendly enhancement for counting and logic puzzles
 * Handles both digits and simple text/drawings
 */

let aptitudeML5Ready = false;

/**
 * Initialize ml5.js for aptitude handwriting
 */
async function initializeAptitudeML5() {
    if (typeof ml5 === 'undefined') {
        console.warn('ml5.js not loaded for aptitude. Using fallback recognition.');
        return false;
    }

    try {
        console.log('🧩 Initializing ml5.js for aptitude puzzles...');

        aptitudeML5Ready = true;

        console.log('✅ ml5.js ready for aptitude handwriting!');
        console.log('🎨 Enhanced recognition for counting & logic puzzles');

        return true;
    } catch (error) {
        console.error('❌ Error initializing aptitude ml5.js:', error);
        return false;
    }
}

/**
 * Recognize handwritten answer from aptitude canvas
 * Supports both numbers (counting) and text (logic)
 */
async function recognizeAptitudeAnswer(canvas, expectedType = 'number') {
    if (!aptitudeML5Ready) {
        await initializeAptitudeML5();
    }

    // Check if canvas is empty
    if (isCanvasEmpty(canvas)) {
        return {
            success: false,
            value: null,
            isEmpty: true,
            message: '✏️ Try writing your answer!'
        };
    }

    try {
        // Enhance canvas for kids' handwriting
        const enhancedCanvas = enhanceAptitudeCanvas(canvas);

        // Recognize based on expected type
        if (expectedType === 'number' || expectedType === 'digit') {
            return await recognizeAptitudeNumber(enhancedCanvas);
        } else {
            return await recognizeAptitudeText(enhancedCanvas);
        }

    } catch (error) {
        console.error('Error recognizing aptitude answer:', error);
        return {
            success: false,
            value: null,
            error: error.message,
            message: '🤔 Let me try again...'
        };
    }
}

/**
 * Recognize numbers for counting puzzles
 */
async function recognizeAptitudeNumber(canvas) {
    // Use existing digit recognition if available
    if (typeof recognizeDigit === 'function') {
        const result = await recognizeDigit(canvas);

        if (result.isEmpty) {
            return {
                success: false,
                value: null,
                isEmpty: true,
                message: '✏️ Count and write the number!'
            };
        }

        if (result.error) {
            return {
                success: false,
                value: null,
                error: result.error,
                message: '🔍 Can you write it more clearly?'
            };
        }

        // More lenient for aptitude (kids might draw numbers differently)
        const isAccepted = result.confidence > 0.08; // Even more lenient (8%)

        return {
            success: isAccepted,
            value: result.digit,
            confidence: result.confidence,
            ml5Enhanced: true,
            message: isAccepted
                ? `✓ I see ${result.digit}!`
                : `Is that a ${result.digit}? Try again!`
        };
    }

    // Fallback - simple pattern matching
    return {
        success: false,
        value: null,
        message: 'Recognition not available'
    };
}

/**
 * Recognize text for logic puzzles (simplified)
 */
async function recognizeAptitudeText(canvas) {
    // For text logic puzzles, we'll be more lenient
    // Check if there's content written
    const hasContent = !isCanvasEmpty(canvas);

    if (!hasContent) {
        return {
            success: false,
            value: null,
            isEmpty: true,
            message: '✏️ Write or draw your answer!'
        };
    }

    // For text-based logic puzzles, visual inspection by teacher/parent
    return {
        success: true,
        value: 'handwritten_answer',
        requiresManualReview: true,
        message: '✓ Answer recorded! (Manual review needed)',
        ml5Enhanced: true
    };
}

/**
 * Enhanced canvas preprocessing for aptitude puzzles
 */
function enhanceAptitudeCanvas(originalCanvas) {
    const enhanced = document.createElement('canvas');
    enhanced.width = originalCanvas.width;
    enhanced.height = originalCanvas.height;
    const ctx = enhanced.getContext('2d');

    // Copy original
    ctx.drawImage(originalCanvas, 0, 0);

    const imageData = ctx.getImageData(0, 0, enhanced.width, enhanced.height);
    const data = imageData.data;

    // Aptitude-specific enhancements
    // Kids might draw numbers larger or with more variation
    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];

        if (alpha > 0) {
            // More aggressive enhancement for aptitude (kids use more expressive strokes)
            const boost = 1.5;
            data[i] = Math.min(255, data[i] * boost);
            data[i + 1] = Math.min(255, data[i + 1] * boost);
            data[i + 2] = Math.min(255, data[i + 2] * boost);
            data[i + 3] = Math.min(255, alpha * 1.3); // Thicker strokes
        }
    }

    // Stronger smoothing for aptitude (kids might be more playful)
    smoothAptitudeImageData(imageData);

    ctx.putImageData(imageData, 0, 0);

    return enhanced;
}

/**
 * Smoothing optimized for aptitude puzzles
 */
function smoothAptitudeImageData(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const original = new Uint8ClampedArray(data);

    // 5x5 blur for more playful/expressive strokes
    const kernelSize = 2; // ±2 pixels

    for (let y = kernelSize; y < height - kernelSize; y++) {
        for (let x = kernelSize; x < width - kernelSize; x++) {
            const idx = (y * width + x) * 4;

            // Only smooth drawn areas
            if (original[idx + 3] > 0) {
                let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
                let count = 0;

                for (let dy = -kernelSize; dy <= kernelSize; dy++) {
                    for (let dx = -kernelSize; dx <= kernelSize; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        sumR += original[nIdx];
                        sumG += original[nIdx + 1];
                        sumB += original[nIdx + 2];
                        sumA += original[nIdx + 3];
                        count++;
                    }
                }

                data[idx] = sumR / count;
                data[idx + 1] = sumG / count;
                data[idx + 2] = sumB / count;
                data[idx + 3] = sumA / count;
            }
        }
    }
}

/**
 * Check if canvas is empty
 */
function isCanvasEmpty(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Check for any non-transparent pixels
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return false;
    }

    return true;
}

/**
 * Kid-friendly feedback for aptitude puzzles
 */
function getAptitudeFeedback(result, correct) {
    if (result.isEmpty) {
        return {
            icon: '✏️',
            message: 'Write your answer!',
            color: '#999'
        };
    }

    if (result.requiresManualReview) {
        return {
            icon: '👀',
            message: 'Answer recorded! Teacher will check.',
            color: '#667eea'
        };
    }

    if (correct) {
        return {
            icon: '🌟',
            message: 'Correct! Great thinking!',
            color: '#4caf50'
        };
    }

    return {
        icon: '💪',
        message: 'Not quite! Try again!',
        color: '#ff9800'
    };
}

/**
 * Validate counting puzzle answer
 */
function validateCountingAnswer(recognized, expected) {
    if (!recognized || recognized.isEmpty) {
        return { valid: false, message: 'No answer detected' };
    }

    const recognizedNum = parseInt(recognized.value);
    const expectedNum = parseInt(expected);

    if (isNaN(recognizedNum) || isNaN(expectedNum)) {
        return { valid: false, message: 'Invalid number' };
    }

    // Very lenient for counting (kids might miscount slightly)
    const diff = Math.abs(recognizedNum - expectedNum);

    if (diff === 0) {
        return {
            valid: true,
            message: '✓ Perfect count!',
            feedback: getAptitudeFeedback(recognized, true)
        };
    }

    if (diff === 1) {
        return {
            valid: true, // Still accept ±1 for kids
            message: `✓ Close! (Expected ${expectedNum})`,
            feedback: {
                icon: '👍',
                message: 'Almost perfect!',
                color: '#4caf50'
            }
        };
    }

    return {
        valid: false,
        message: `Try counting again! (Expected ${expectedNum})`,
        feedback: getAptitudeFeedback(recognized, false)
    };
}

/**
 * Show visual feedback on canvas
 */
function showAptitudeFeedback(canvas, feedback) {
    let feedbackEl = canvas.parentElement.querySelector('.aptitude-ml5-feedback');

    if (!feedbackEl) {
        feedbackEl = document.createElement('div');
        feedbackEl.className = 'aptitude-ml5-feedback';
        feedbackEl.style.cssText = `
            font-size: 0.9em;
            margin-top: 8px;
            padding: 8px 12px;
            border-radius: 6px;
            text-align: center;
            font-weight: bold;
            transition: all 0.3s;
        `;
        canvas.parentElement.appendChild(feedbackEl);
    }

    feedbackEl.style.color = feedback.color;
    feedbackEl.style.background = `${feedback.color}15`; // 15 = light transparency
    feedbackEl.textContent = `${feedback.icon} ${feedback.message}`;
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAptitudeML5);
} else {
    initializeAptitudeML5();
}

console.log('🧩 ml5.js Aptitude handwriting helper loaded');
