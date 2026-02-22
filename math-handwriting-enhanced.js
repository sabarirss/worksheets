/**
 * Math Handwriting Recognition - Kid-friendly enhancement
 * Enhanced preprocessing for children's handwriting recognition
 * Works with existing TensorFlow.js model
 */

let enhancementReady = false;

/**
 * Initialize math handwriting enhancements
 */
async function initializeMathML5() {
    if (typeof tf === 'undefined') {
        console.warn('TensorFlow.js not loaded. Waiting...');
        return false;
    }

    try {
        console.log('🎨 Initializing kid-friendly math handwriting...');

        // Wait for TensorFlow.js to be fully ready first
        await tf.ready();

        // Enhancements are ready
        enhancementReady = true;

        console.log('✅ Kid-friendly math handwriting recognition ready!');
        console.log('📚 Using enhanced preprocessing for children');

        return true;
    } catch (error) {
        console.error('❌ Error initializing enhancements:', error);
        return false;
    }
}

/**
 * Enhanced digit recognition with kid-friendly preprocessing
 * Provides enhancements on top of existing TensorFlow model
 */
async function recognizeDigitML5(canvas) {
    // Ensure enhancements are initialized
    if (!enhancementReady) {
        await initializeMathML5();
    }

    // Get the original recognition function
    const fallbackFunction = window.recognizeDigitOriginal;

    if (!enhancementReady || typeof fallbackFunction !== 'function') {
        console.warn('Enhancements not ready, using standard recognition');
        if (typeof fallbackFunction === 'function') {
            return fallbackFunction(canvas);
        }
        // No recognition function available
        return { isEmpty: true, error: 'No recognition function available' };
    }

    try {
        // Enhanced preprocessing for kids' handwriting
        const enhancedCanvas = enhanceCanvasForKids(canvas);

        // Use the ORIGINAL TensorFlow recognition with enhanced canvas (avoid infinite recursion)
        const result = await window.recognizeDigitOriginal(enhancedCanvas);

        // Add enhancement markers to the result
        if (result && !result.isEmpty && !result.error) {
            result.enhanced = true;
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
        console.error('Error in enhanced recognition:', error);
        // Fallback to standard recognition (use original, not recursive call)
        if (typeof window.recognizeDigitOriginal === 'function') {
            return window.recognizeDigitOriginal(canvas);
        }
        return { isEmpty: false, error: error.message };
    }
}

/**
 * Enhance canvas for kids' handwriting
 * Applies kid-friendly preprocessing for better recognition
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
 * Enhanced for kids with preprocessing
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
        enhanced: true
    };
}

/**
 * Visual feedback helper - shows recognition confidence
 */
function showRecognitionFeedback(canvas, result) {
    const feedback = getKidFriendlyFeedback(result);

    // Create or update feedback element
    let feedbackEl = canvas.nextElementSibling;
    if (!feedbackEl || !feedbackEl.classList.contains('recognition-feedback')) {
        feedbackEl = document.createElement('div');
        feedbackEl.className = 'recognition-feedback';
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
    document.addEventListener('DOMContentLoaded', () => {
        initializeMathML5();
        setupML5Override();
    });
} else {
    initializeMathML5();
    // Wait a bit for other scripts to load before overriding
    setTimeout(setupML5Override, 100);
}

/**
 * Setup enhancement override after all scripts are loaded
 */
function setupML5Override() {
    // Store the original recognizeDigit function before overriding
    if (typeof recognizeDigit !== 'undefined' && !window.recognizeDigitOriginal) {
        window.recognizeDigitOriginal = recognizeDigit;

        // Replace with enhanced version
        window.recognizeDigit = recognizeDigitML5;

        console.log('✨ Math handwriting now using kid-friendly recognition!');
    } else if (!window.recognizeDigitOriginal) {
        console.warn('⚠️ recognizeDigit function not found yet. Enhancement will wait.');
        // Try again after a delay
        setTimeout(setupML5Override, 200);
    }
}

console.log('📐 Kid-friendly math handwriting helper loaded');
