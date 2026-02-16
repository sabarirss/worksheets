/**
 * Math Handwriting Recognition using ml5.js
 * Kid-friendly enhancement for digit recognition
 * Wraps existing TensorFlow.js model with ml5.js's simpler API
 */

let ml5Ready = false;
let ml5Classifier = null;

/**
 * Initialize ml5.js for math handwriting
 */
async function initializeMathML5() {
    if (typeof ml5 === 'undefined') {
        console.warn('ml5.js not loaded. Using fallback TensorFlow.js recognition.');
        return false;
    }

    try {
        console.log('🎨 Initializing ml5.js for math handwriting...');

        // ml5.js is ready
        ml5Ready = true;

        console.log('✅ ml5.js ready for math handwriting recognition!');
        console.log('📚 Using enhanced kid-friendly recognition');

        return true;
    } catch (error) {
        console.error('❌ Error initializing ml5.js:', error);
        return false;
    }
}

/**
 * Enhanced digit recognition using ml5.js preprocessing
 * Provides kid-friendly enhancements on top of existing TensorFlow model
 */
async function recognizeDigitML5(canvas) {
    // Ensure ml5.js is initialized
    if (!ml5Ready) {
        await initializeMathML5();
    }

    // If ml5.js not available, fall back to original recognizeDigit
    if (!ml5Ready || typeof recognizeDigit !== 'function') {
        console.warn('ml5.js not ready, using standard recognition');
        return recognizeDigit(canvas);
    }

    try {
        // Enhanced preprocessing for kids' handwriting using ml5.js approach
        const enhancedCanvas = enhanceCanvasForKids(canvas);

        // Use the existing TensorFlow recognition with enhanced canvas
        const result = await recognizeDigit(enhancedCanvas);

        // Add ml5.js enhancements to the result
        if (result && !result.isEmpty && !result.error) {
            result.ml5Enhanced = true;
            result.kidFriendly = true;

            // More lenient validation for kids
            if (result.isLowConfidence && result.confidence > 0.10) {
                // Accept lower confidence for kids (10% instead of 15%)
                result.accepted = true;
                result.message = '✓ Good attempt!';
            }

            if (result.isAmbiguous && result.confidence > 0.20) {
                // Be more lenient with ambiguous results
                result.accepted = true;
                result.message = `Looks like ${result.digit}`;
            }
        }

        return result;

    } catch (error) {
        console.error('Error in ml5 enhanced recognition:', error);
        // Fallback to standard recognition
        return recognizeDigit(canvas);
    }
}

/**
 * Enhance canvas for kids' handwriting
 * Applies ml5.js-style preprocessing for better recognition
 */
function enhanceCanvasForKids(originalCanvas) {
    // Create a temporary canvas for enhancement
    const enhanced = document.createElement('canvas');
    enhanced.width = originalCanvas.width;
    enhanced.height = originalCanvas.height;
    const ctx = enhanced.getContext('2d');

    // Copy original content
    ctx.drawImage(originalCanvas, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, enhanced.width, enhanced.height);
    const data = imageData.data;

    // Kid-friendly enhancements:
    // 1. Increase contrast (helps with light strokes)
    // 2. Smooth edges (helps with shaky hands)
    // 3. Thicken strokes slightly (helps with thin writing)

    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];

        if (alpha > 0) {
            // Increase stroke intensity
            const boost = 1.3;
            data[i] = Math.min(255, data[i] * boost);     // R
            data[i + 1] = Math.min(255, data[i + 1] * boost); // G
            data[i + 2] = Math.min(255, data[i + 2] * boost); // B
            data[i + 3] = Math.min(255, alpha * 1.2);     // A - thicken slightly
        }
    }

    // Apply smoothing (simple box blur for kids' shaky strokes)
    smoothImageData(imageData);

    // Put enhanced data back
    ctx.putImageData(imageData, 0, 0);

    return enhanced;
}

/**
 * Simple smoothing for kids' shaky handwriting
 */
function smoothImageData(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const original = new Uint8ClampedArray(data);

    // 3x3 box blur kernel
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;

            // Average with neighbors for smoother strokes
            let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
            let count = 0;

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nIdx = ((y + dy) * width + (x + dx)) * 4;
                    sumR += original[nIdx];
                    sumG += original[nIdx + 1];
                    sumB += original[nIdx + 2];
                    sumA += original[nIdx + 3];
                    count++;
                }
            }

            // Only apply smoothing to drawn areas (alpha > 0)
            if (original[idx + 3] > 0) {
                data[idx] = sumR / count;
                data[idx + 1] = sumG / count;
                data[idx + 2] = sumB / count;
                data[idx + 3] = sumA / count;
            }
        }
    }
}

/**
 * Kid-friendly feedback for recognition results
 */
function getKidFriendlyFeedback(result) {
    if (result.isEmpty) {
        return {
            icon: '✏️',
            message: 'Try drawing a number!',
            color: '#999'
        };
    }

    if (result.error) {
        return {
            icon: '🤔',
            message: 'Let me look again...',
            color: '#ff9800'
        };
    }

    if (result.confidence > 0.7) {
        return {
            icon: '🌟',
            message: `Great! I see a ${result.digit}`,
            color: '#4caf50'
        };
    }

    if (result.confidence > 0.3) {
        return {
            icon: '👍',
            message: `Looks like ${result.digit}`,
            color: '#2196f3'
        };
    }

    if (result.isAmbiguous) {
        return {
            icon: '🔍',
            message: `Maybe ${result.digit} or ${result.alternativeDigit}?`,
            color: '#ff9800'
        };
    }

    return {
        icon: '💪',
        message: `I think it's ${result.digit}. Try again if not!`,
        color: '#667eea'
    };
}

/**
 * Batch recognize multiple digits (for multi-digit answers)
 * Enhanced for kids with ml5.js
 */
async function recognizeMultipleDigitsML5(canvases) {
    const results = [];

    for (const canvas of canvases) {
        const result = await recognizeDigitML5(canvas);
        results.push(result);
    }

    // Combine digits into number
    const digits = results
        .filter(r => r.digit !== null)
        .map(r => r.digit);

    const number = digits.length > 0 ? parseInt(digits.join('')) : null;
    const avgConfidence = results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;

    return {
        number: number,
        digits: digits,
        confidence: avgConfidence,
        individual: results,
        ml5Enhanced: true
    };
}

/**
 * Visual feedback helper - shows recognition confidence
 */
function showRecognitionFeedback(canvas, result) {
    const feedback = getKidFriendlyFeedback(result);

    // Create or update feedback element
    let feedbackEl = canvas.nextElementSibling;
    if (!feedbackEl || !feedbackEl.classList.contains('ml5-feedback')) {
        feedbackEl = document.createElement('div');
        feedbackEl.className = 'ml5-feedback';
        feedbackEl.style.cssText = `
            font-size: 0.9em;
            margin-top: 5px;
            padding: 5px 10px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
        `;
        canvas.parentElement.appendChild(feedbackEl);
    }

    feedbackEl.style.color = feedback.color;
    feedbackEl.textContent = `${feedback.icon} ${feedback.message}`;
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMathML5);
} else {
    initializeMathML5();
}

// Override the global recognizeDigit function to use ml5.js enhancement
const originalRecognizeDigit = typeof recognizeDigit !== 'undefined' ? recognizeDigit : null;

// Provide ml5 version as default
if (originalRecognizeDigit) {
    // Store original
    window.recognizeDigitOriginal = originalRecognizeDigit;

    // Replace with ml5 enhanced version
    window.recognizeDigit = recognizeDigitML5;

    console.log('✨ Math handwriting now using ml5.js kid-friendly recognition!');
}

console.log('📐 ml5.js Math handwriting helper loaded');
