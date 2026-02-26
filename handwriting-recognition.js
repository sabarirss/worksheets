/**
 * Handwriting Recognition using TensorFlow.js
 * Recognizes handwritten digits (0-9) from canvas elements
 * Uses pre-trained MNIST model for digit classification
 */

// Configuration for recognition sensitivity
// Adjust these values to be more lenient with children's handwriting
const RECOGNITION_CONFIG = {
    // Minimum confidence required (0-1). Lower = more lenient, accepts more variations
    // 0.15 = 15% confidence minimum (very lenient for children)
    minConfidence: 0.15,

    // Ambiguity threshold (0-1). If top 2 predictions are within this difference,
    // consider it ambiguous. Higher = more likely to flag as ambiguous
    // 0.25 = 25% difference (more lenient)
    ambiguityThreshold: 0.25,

    // Canvas empty threshold (0-1). Percentage of pixels needed to consider canvas non-empty
    // 0.003 = 0.3% of pixels (very lenient for light strokes)
    emptyThreshold: 0.003,

    // Smoothing strength for children's shaky handwriting (0-1)
    // 0.5 = stronger smoothing for irregular strokes
    smoothingStrength: 0.5,

    // Binary threshold for detecting strokes (0-1)
    // 0.05 = very sensitive, captures even light strokes
    binaryThreshold: 0.05
};

// Global state
let handwritingModel = null;
let modelLoading = false;
let modelLoaded = false;

/**
 * Load the pre-trained MNIST model for digit recognition
 * Uses TensorFlow.js hosted model
 */
async function loadHandwritingModel() {
    if (modelLoaded) {
        console.log('Handwriting model already loaded');
        return handwritingModel;
    }

    if (modelLoading) {
        console.log('Model is already loading, waiting...');
        // Wait for the model to finish loading
        while (modelLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return handwritingModel;
    }

    try {
        modelLoading = true;
        console.log('Loading handwriting recognition model...');

        // Ensure TensorFlow.js is fully initialized first
        await tf.ready();
        await tf.setBackend('webgl'); // Use WebGL backend for best performance

        // Load pre-trained MNIST model from TensorFlow.js
        // This is a simple CNN model trained on MNIST dataset
        const modelUrl = 'https://storage.googleapis.com/tfjs-models/tfjs/mnist_transfer_cnn_v1/model.json';

        handwritingModel = await tf.loadLayersModel(modelUrl);
        modelLoaded = true;
        modelLoading = false;

        console.log('✅ Handwriting recognition model loaded successfully!');
        return handwritingModel;

    } catch (error) {
        modelLoading = false;
        console.error('❌ Failed to load handwriting model:', error);

        // Fallback: Create a simple model if loading fails
        console.log('Creating fallback model...');
        handwritingModel = createFallbackModel();
        modelLoaded = true;

        return handwritingModel;
    }
}

/**
 * Create a simple fallback model if the pre-trained model fails to load
 * This is a basic CNN for MNIST digit recognition
 */
function createFallbackModel() {
    console.log('Building fallback MNIST model...');

    const model = tf.sequential();

    // Input layer: 28x28 grayscale image
    model.add(tf.layers.conv2d({
        inputShape: [28, 28, 1],
        filters: 32,
        kernelSize: 3,
        activation: 'relu'
    }));

    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    model.add(tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu'
    }));

    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    model.add(tf.layers.flatten());

    model.add(tf.layers.dense({
        units: 128,
        activation: 'relu'
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));

    model.add(tf.layers.dense({
        units: 10,
        activation: 'softmax'
    }));

    console.log('⚠️ Using untrained fallback model - accuracy will be low until trained');
    return model;
}

/**
 * Preprocess canvas data for the MNIST model
 * Converts canvas to 28x28 grayscale tensor normalized to [0, 1]
 *
 * @param {HTMLCanvasElement} canvas - The canvas element with handwritten digit
 * @returns {tf.Tensor} - Preprocessed tensor ready for model input
 */
function preprocessCanvas(canvas) {
    return tf.tidy(() => {
        // Get image data from canvas
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Convert to tensor
        let tensor = tf.browser.fromPixels(imageData, 1); // grayscale

        // Normalize to [0, 1]
        tensor = tensor.div(255.0);

        // Invert colors (MNIST expects white digit on black background)
        // Our canvas has black on white, so we need to invert
        tensor = tf.scalar(1.0).sub(tensor);

        // Find bounding box of the digit to center it better
        // This helps with children's handwriting that might not be perfectly centered
        // Use lower threshold to capture light strokes from children
        const binary = tensor.greater(RECOGNITION_CONFIG.binaryThreshold);

        // Resize to 28x28 with better interpolation for children's handwriting
        // Using bilinear for smoother edges
        tensor = tf.image.resizeBilinear(tensor, [28, 28]);

        // Apply stronger blur to reduce noise from shaky children's handwriting
        // This helps smooth out irregular strokes and connect broken lines
        // Use 5x5 kernel for better smoothing
        const kernelSize = 5;
        const kernel = tf.ones([kernelSize, kernelSize, 1, 1]).div(kernelSize * kernelSize);
        tensor = tensor.reshape([1, 28, 28, 1]);
        tensor = tf.conv2d(tensor, kernel, 1, 'same');
        tensor = tensor.squeeze([0]);

        // Apply threshold to enhance digit after smoothing
        // This helps with light/thin strokes from children
        const enhancedTensor = tensor.mul(1.5).clipByValue(0, 1);
        tensor = enhancedTensor;

        // Normalize intensity to improve contrast
        const mean = tensor.mean();
        const std = tf.sqrt(tensor.sub(mean).square().mean());
        if (std.dataSync()[0] > 0.01) { // Avoid division by zero
            tensor = tensor.sub(mean).div(std.add(1e-7))
                .mul(RECOGNITION_CONFIG.smoothingStrength).add(0.5);
            tensor = tensor.clipByValue(0, 1);
        }

        // Add batch dimension [1, 28, 28, 1]
        tensor = tensor.expandDims(0);

        return tensor;
    });
}

/**
 * Check if canvas has significant content (not empty or just noise)
 *
 * @param {HTMLCanvasElement} canvas - The canvas to check
 * @returns {boolean} - True if canvas has content, false if empty
 */
function isCanvasEmpty(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Count non-white pixels
    let nonWhitePixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // If pixel is not white (threshold: < 250)
        if (r < 250 || g < 250 || b < 250) {
            nonWhitePixels++;
        }
    }

    // Canvas is considered empty if less than configured threshold of pixels are non-white
    const threshold = (canvas.width * canvas.height) * RECOGNITION_CONFIG.emptyThreshold;
    return nonWhitePixels < threshold;
}

/**
 * Recognize a handwritten digit from a canvas element
 *
 * @param {HTMLCanvasElement} canvas - Canvas with handwritten digit
 * @returns {Promise<Object>} - Object with { digit, confidence, allPredictions }
 */
async function recognizeDigit(canvas) {
    try {
        // Check if canvas is empty
        if (isCanvasEmpty(canvas)) {
            return {
                digit: null,
                confidence: 0,
                error: 'Canvas is empty',
                isEmpty: true
            };
        }

        // Prefer EMNIST model (62 classes, locally trained, better accuracy)
        // Falls back to old remote MNIST model only if EMNIST is unavailable
        if (!emnistModelLoaded) {
            await loadEmnistModel(); // Try to load EMNIST first
        }

        if (emnistModel) {
            // Use EMNIST with digit-only filter for best accuracy
            const emnistResult = await _recognizeWithEmnist(canvas, null, 'digit');

            if (!emnistResult.isEmpty && !emnistResult.error) {
                const digitValue = parseInt(emnistResult.character);
                console.log(`📊 EMNIST digit recognition: '${emnistResult.character}' (${(emnistResult.confidence * 100).toFixed(1)}%)`);

                return {
                    digit: isNaN(digitValue) ? null : digitValue,
                    confidence: emnistResult.confidence,
                    alternativeDigit: emnistResult.topPredictions[1] ? parseInt(emnistResult.topPredictions[1].character) : null,
                    alternativeConfidence: emnistResult.topPredictions[1] ? emnistResult.topPredictions[1].confidence : 0,
                    isAmbiguous: emnistResult.isAmbiguous,
                    isLowConfidence: emnistResult.isLowConfidence,
                    allPredictions: [],
                    topPredictions: emnistResult.topPredictions.slice(0, 3).map(p => ({
                        digit: parseInt(p.character),
                        confidence: p.confidence
                    })),
                    isEmpty: false
                };
            }
        }

        // Fallback: old remote MNIST model (10 classes)
        console.log('Using fallback MNIST model for digit recognition');

        if (!modelLoaded) {
            await loadHandwritingModel();
        }

        if (!handwritingModel) {
            throw new Error('No recognition model available');
        }

        // Preprocess canvas
        const tensor = preprocessCanvas(canvas);

        // Run prediction
        const predictions = await handwritingModel.predict(tensor).data();

        // Get all predictions sorted by confidence
        const sortedPredictions = Array.from(predictions)
            .map((confidence, digit) => ({ digit, confidence }))
            .sort((a, b) => b.confidence - a.confidence);

        const topPrediction = sortedPredictions[0];
        const secondPrediction = sortedPredictions[1];

        // Clean up tensor
        tensor.dispose();

        // Log top 3 predictions for debugging
        console.log('📊 MNIST fallback results:');
        console.log(`  1st: ${topPrediction.digit} (${(topPrediction.confidence * 100).toFixed(1)}%)`);
        console.log(`  2nd: ${secondPrediction.digit} (${(secondPrediction.confidence * 100).toFixed(1)}%)`);
        console.log(`  3rd: ${sortedPredictions[2].digit} (${(sortedPredictions[2].confidence * 100).toFixed(1)}%)`);

        // Check if recognition is ambiguous (top 2 predictions are close)
        const confidenceDifference = topPrediction.confidence - secondPrediction.confidence;
        const isAmbiguous = confidenceDifference < RECOGNITION_CONFIG.ambiguityThreshold;

        // Check if confidence is below minimum threshold
        const isLowConfidence = topPrediction.confidence < RECOGNITION_CONFIG.minConfidence;

        if (isLowConfidence) {
            console.warn(`⚠️ Low confidence (${(topPrediction.confidence * 100).toFixed(1)}%) - might be misrecognition`);
        }

        if (isAmbiguous) {
            console.warn(`⚠️ Ambiguous: Could be ${topPrediction.digit} or ${secondPrediction.digit}`);
        }

        return {
            digit: topPrediction.digit,
            confidence: topPrediction.confidence,
            alternativeDigit: secondPrediction.digit,
            alternativeConfidence: secondPrediction.confidence,
            isAmbiguous: isAmbiguous,
            isLowConfidence: isLowConfidence,
            allPredictions: Array.from(predictions),
            topPredictions: sortedPredictions.slice(0, 3),
            isEmpty: false
        };

    } catch (error) {
        console.error('Error recognizing digit:', error);
        return {
            digit: null,
            confidence: 0,
            error: error.message,
            isEmpty: false
        };
    }
}

/**
 * Recognize multiple digits from an array of canvases
 * Useful for multi-digit numbers or multiple answer fields
 *
 * @param {HTMLCanvasElement[]} canvases - Array of canvas elements
 * @returns {Promise<Object>} - Object with { number, digits, confidence }
 */
async function recognizeMultipleDigits(canvases) {
    const results = [];

    for (const canvas of canvases) {
        const result = await recognizeDigit(canvas);
        results.push(result);
    }

    // Combine digits into a number
    const digits = results.map(r => r.digit !== null ? r.digit : '?');
    const number = digits.join('');
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
        number: number.includes('?') ? null : parseInt(number),
        digits: digits,
        confidence: avgConfidence,
        individualResults: results
    };
}

/**
 * Find digit segments in a canvas by detecting vertical gaps between strokes.
 * Returns array of {left, right, top, bottom} bounding boxes, one per digit.
 *
 * @param {HTMLCanvasElement} canvas - Canvas with handwritten number
 * @returns {Array<Object>} Array of segment bounding boxes
 */
function findDigitSegments(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const pixels = imageData.data;

    // Build column histogram and find vertical bounds
    const colCounts = new Array(w).fill(0);
    let top = h, bottom = 0;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const alpha = pixels[idx + 3];
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            if (alpha > 20 && gray < 220) {
                colCounts[x]++;
                if (y < top) top = y;
                if (y > bottom) bottom = y;
            }
        }
    }

    // Find leftmost and rightmost non-empty columns
    let left = -1, right = -1;
    for (let x = 0; x < w; x++) {
        if (colCounts[x] > 0) {
            if (left === -1) left = x;
            right = x;
        }
    }

    if (left === -1) return [];

    const contentWidth = right - left + 1;
    const contentHeight = bottom - top + 1;

    // If width < 1.3x height, likely single digit
    if (contentWidth < contentHeight * 1.3) {
        return [{ left, right, top, bottom }];
    }

    // Find vertical gaps (runs of empty columns)
    const segments = [];
    let segStart = left;
    let inGap = false;
    let gapStart = -1;
    const minGapWidth = Math.max(2, Math.floor(contentWidth * 0.05));

    for (let x = left; x <= right; x++) {
        if (colCounts[x] === 0) {
            if (!inGap) { inGap = true; gapStart = x; }
        } else {
            if (inGap) {
                if (x - gapStart >= minGapWidth) {
                    segments.push({ left: segStart, right: gapStart - 1, top, bottom });
                    segStart = x;
                }
                inGap = false;
            }
        }
    }
    segments.push({ left: segStart, right, top, bottom });

    // No gaps found but wide aspect ratio suggests multi-digit: split evenly
    if (segments.length === 1 && contentWidth > contentHeight * 1.8) {
        const numDigits = Math.min(3, Math.round(contentWidth / contentHeight));
        const splitSegments = [];
        const segW = contentWidth / numDigits;
        for (let i = 0; i < numDigits; i++) {
            splitSegments.push({
                left: Math.round(left + i * segW),
                right: Math.round(left + (i + 1) * segW - 1),
                top, bottom
            });
        }
        return splitSegments;
    }

    return segments;
}

/**
 * Extract a segment from a canvas into a new square canvas for recognition.
 *
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {Object} seg - Segment bounds {left, right, top, bottom}
 * @returns {HTMLCanvasElement} - New canvas with just the segment, white background
 */
function extractSegment(canvas, seg) {
    const segW = seg.right - seg.left + 1;
    const segH = seg.bottom - seg.top + 1;
    const size = Math.max(segW, segH);

    const segCanvas = document.createElement('canvas');
    segCanvas.width = size;
    segCanvas.height = size;
    const segCtx = segCanvas.getContext('2d', { willReadFrequently: true });

    segCtx.fillStyle = '#FFFFFF';
    segCtx.fillRect(0, 0, size, size);

    const offsetX = Math.round((size - segW) / 2);
    const offsetY = Math.round((size - segH) / 2);
    segCtx.drawImage(canvas, seg.left, seg.top, segW, segH, offsetX, offsetY, segW, segH);

    return segCanvas;
}

/**
 * Recognize a handwritten number (single or multi-digit) from a canvas.
 * Segments the canvas by finding vertical gaps between digits,
 * then recognizes each digit separately with the EMNIST model.
 *
 * @param {HTMLCanvasElement} canvas - Canvas with handwritten number
 * @returns {Promise<Object>} - { number, digit, digits, confidence, isEmpty }
 */
async function recognizeNumber(canvas) {
    if (isCanvasEmpty(canvas)) {
        return { number: null, digit: null, digits: [], confidence: 0, isEmpty: true };
    }

    // Ensure EMNIST model is loaded
    if (!emnistModelLoaded) await loadEmnistModel();

    const segments = findDigitSegments(canvas);

    if (segments.length === 0) {
        return { number: null, digit: null, digits: [], confidence: 0, isEmpty: true };
    }

    // Single digit
    if (segments.length === 1) {
        const result = await recognizeDigit(canvas);
        return {
            number: result.digit,
            digit: result.digit,
            digits: result.digit !== null ? [result.digit] : [],
            confidence: result.confidence,
            isEmpty: result.isEmpty
        };
    }

    // Multi-digit: recognize each segment
    const digitResults = [];
    for (const seg of segments) {
        const segCanvas = extractSegment(canvas, seg);
        const result = await recognizeDigit(segCanvas);
        digitResults.push(result);
    }

    const digits = digitResults.map(r => r.digit);
    const allRecognized = digits.every(d => d !== null);
    const numberStr = digits.join('');
    const number = allRecognized ? parseInt(numberStr) : null;
    const avgConfidence = digitResults.reduce((s, r) => s + r.confidence, 0) / digitResults.length;

    console.log(`📊 Multi-digit recognition: ${numberStr} (${(avgConfidence * 100).toFixed(1)}% avg confidence)`);

    return {
        number,
        digit: number,
        digits,
        confidence: avgConfidence,
        isEmpty: false,
        individualResults: digitResults
    };
}

/**
 * Show visual feedback on canvas based on recognition result
 *
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {boolean} isCorrect - Whether the answer is correct
 * @param {string} message - Optional message to display
 */
function showCanvasFeedback(canvas, isCorrect, message = '') {
    const container = canvas.parentElement;

    // Remove existing feedback
    const existingFeedback = container.querySelector('.handwriting-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'handwriting-feedback';
    feedback.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 5px 10px;
        border-radius: 5px;
        font-weight: bold;
        font-size: 14px;
        z-index: 10;
        ${isCorrect
            ? 'background: #4caf50; color: white;'
            : 'background: #f44336; color: white;'}
    `;

    feedback.innerHTML = isCorrect
        ? `✓ Correct! ${message}`
        : `✗ Try Again ${message}`;

    container.style.position = 'relative';
    container.appendChild(feedback);

    // Add border highlight
    canvas.style.border = isCorrect
        ? '3px solid #4caf50'
        : '3px solid #f44336';

    // Remove feedback after 3 seconds
    setTimeout(() => {
        feedback.remove();
        canvas.style.border = '2px solid #ccc';
    }, 3000);
}

/**
 * Preprocess canvas for EMNIST model - proper centering and normalization
 * Matches EMNIST training pipeline: character cropped, centered in 28x28, [0,1] range
 * No blur, no z-score normalization - just clean input matching training data
 *
 * @param {HTMLCanvasElement} canvas - Canvas with handwritten character
 * @returns {tf.Tensor4D} - Preprocessed tensor [1, 28, 28, 1]
 */
function preprocessCanvasForEmnist(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const pixels = imageData.data;

    // Find bounding box of drawn strokes
    let top = h, bottom = 0, left = w, right = 0;
    let hasContent = false;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const alpha = pixels[idx + 3];
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;

            // Detect stroke: visible and non-white
            if (alpha > 20 && gray < 220) {
                hasContent = true;
                if (y < top) top = y;
                if (y > bottom) bottom = y;
                if (x < left) left = x;
                if (x > right) right = x;
            }
        }
    }

    // If no content detected, return zeros
    if (!hasContent) {
        return tf.zeros([1, 28, 28, 1]);
    }

    // Crop dimensions
    const charH = bottom - top + 1;
    const charW = right - left + 1;
    const maxDim = Math.max(charH, charW);

    // Scale character to fit ~20px in 28x28 frame (~4px border, matching EMNIST format)
    const targetSize = 20;
    const scale = targetSize / maxDim;
    const scaledW = Math.max(1, Math.round(charW * scale));
    const scaledH = Math.max(1, Math.round(charH * scale));
    const offsetX = Math.round((28 - scaledW) / 2);
    const offsetY = Math.round((28 - scaledH) / 2);

    // Create 28x28 temp canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

    // White fill (becomes black after color inversion = EMNIST background)
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, 28, 28);

    // High-quality downscaling
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';

    // Draw cropped character centered in 28x28
    tempCtx.drawImage(
        canvas,
        left, top, charW, charH,
        offsetX, offsetY, scaledW, scaledH
    );

    // Convert to tensor: grayscale, invert, normalize to [0,1]
    return tf.tidy(() => {
        const imgData = tempCtx.getImageData(0, 0, 28, 28);
        let tensor = tf.browser.fromPixels(imgData, 1); // [28, 28, 1] grayscale

        // Normalize to [0,1] and invert (canvas: black-on-white → model: white-on-black)
        tensor = tf.scalar(1.0).sub(tensor.div(255.0));

        // Add batch dimension: [1, 28, 28, 1]
        return tensor.expandDims(0);
    });
}

// Initialize model loading when script loads
console.log('Handwriting recognition module loaded. Call loadHandwritingModel() to initialize.');

// ============================================================================
// EMNIST MODEL SUPPORT (62 classes: digits + uppercase + lowercase letters)
// ============================================================================

// EMNIST ByClass mapping: 62 classes in order
const EMNIST_CLASSES = [
    '0','1','2','3','4','5','6','7','8','9',
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'a','b','c','d','e','f','g','h','i','j','k','l','m',
    'n','o','p','q','r','s','t','u','v','w','x','y','z'
];

// EMNIST state (separate from MNIST)
let emnistModel = null;
let emnistModelLoading = false;
let emnistModelLoaded = false;

/**
 * Get the type of a character
 * @param {string} char - Single character
 * @returns {string} 'digit', 'uppercase', 'lowercase', or 'unknown'
 */
function getCharType(char) {
    if (/^[0-9]$/.test(char)) return 'digit';
    if (/^[A-Z]$/.test(char)) return 'uppercase';
    if (/^[a-z]$/.test(char)) return 'lowercase';
    return 'unknown';
}

/**
 * Fix Keras 3 model topology for TF.js 4.x compatibility.
 * Keras 3 uses different field names/structures than what older TF.js expects.
 */
function fixKeras3Topology(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(fixKeras3Topology);

    const result = {};
    for (const key in obj) {
        const value = obj[key];

        // batch_shape -> batch_input_shape (InputLayer)
        if (key === 'batch_shape') {
            result['batch_input_shape'] = value;
            continue;
        }

        // DTypePolicy object -> string "float32"
        if (key === 'dtype' && typeof value === 'object' && value !== null && value.class_name === 'DTypePolicy') {
            result[key] = value.config.name;
            continue;
        }

        // Remove Keras 3-only fields
        if (key === 'registered_name' || key === 'module') continue;

        result[key] = fixKeras3Topology(value);
    }
    return result;
}

/**
 * Load the EMNIST model for character recognition (digits + letters)
 * Uses manual fetch + tf.io.fromMemory to bypass Keras 3 format incompatibilities
 * @returns {Promise<Object|null>} The loaded model or null if unavailable
 */
async function loadEmnistModel() {
    if (emnistModelLoaded) {
        return emnistModel;
    }

    if (emnistModelLoading) {
        while (emnistModelLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return emnistModel;
    }

    try {
        emnistModelLoading = true;
        console.log('Loading EMNIST model for character recognition...');

        await tf.ready();

        // Fetch model.json and fix Keras 3 format incompatibilities
        const modelResponse = await fetch('models/emnist/model.json');
        if (!modelResponse.ok) throw new Error('model.json not found');
        const modelJSON = await modelResponse.json();

        const fixedTopology = fixKeras3Topology(modelJSON.modelTopology);

        // Fetch weight binary
        const weightPath = 'models/emnist/' + modelJSON.weightsManifest[0].paths[0];
        const weightResponse = await fetch(weightPath);
        if (!weightResponse.ok) throw new Error('Weight file not found');
        const weightData = await weightResponse.arrayBuffer();

        // Strip Keras 3 model-name prefix from weight names
        // Keras 3: "sequential/conv2d/kernel" → TF.js expects: "conv2d/kernel"
        const weightSpecs = modelJSON.weightsManifest[0].weights.map(w => ({
            ...w,
            name: w.name.replace(/^sequential\//, '')
        }));

        // Load model with fixed topology via tf.io.fromMemory (single-arg format)
        emnistModel = await tf.loadLayersModel(tf.io.fromMemory({
            modelTopology: fixedTopology,
            weightSpecs: weightSpecs,
            weightData: weightData
        }));

        emnistModelLoaded = true;
        emnistModelLoading = false;

        console.log('EMNIST model loaded successfully (62 classes: digits + letters)');
        return emnistModel;

    } catch (error) {
        emnistModelLoading = false;
        console.warn('EMNIST model not available:', error.message);
        console.warn('To enable letter recognition, run train-emnist-model.py in Google Colab');
        console.warn('and place the model files in models/emnist/');
        return null;
    }
}

/**
 * Internal: Run EMNIST model prediction on preprocessed canvas
 * @param {HTMLCanvasElement} canvas - Canvas with handwriting
 * @param {string} expectedAnswer - Expected answer for educational prior boost
 * @param {string} expectedType - 'digit', 'letter', or 'any'
 * @returns {Promise<Object>} Prediction result
 */
async function _recognizeWithEmnist(canvas, expectedAnswer, expectedType) {
    // Use EMNIST-specific preprocessing: bounding box crop, center, clean [0,1] normalization
    const tensor = preprocessCanvasForEmnist(canvas);

    // Run prediction (62-class softmax)
    const rawPredictions = await emnistModel.predict(tensor).data();
    tensor.dispose();

    // Build prediction array with class info
    let predictions = Array.from(rawPredictions).map((confidence, index) => ({
        character: EMNIST_CLASSES[index],
        type: getCharType(EMNIST_CLASSES[index]),
        confidence: confidence,
        classIndex: index
    }));

    // Filter by expectedType if specified
    if (expectedType === 'digit') {
        predictions = predictions.filter(p => p.type === 'digit');
    } else if (expectedType === 'letter') {
        predictions = predictions.filter(p => p.type !== 'digit');
    }
    // 'any' = no filtering

    // Renormalize after filtering
    const totalConf = predictions.reduce((sum, p) => sum + p.confidence, 0);
    if (totalConf > 0) {
        predictions.forEach(p => p.confidence = p.confidence / totalConf);
    }

    // Apply educational prior: boost expected answer's class by 15%
    if (expectedAnswer && expectedAnswer.length === 1) {
        const PRIOR_BOOST = 0.15;
        predictions.forEach(p => {
            if (p.character === expectedAnswer ||
                p.character.toLowerCase() === expectedAnswer.toLowerCase()) {
                p.confidence = Math.min(1.0, p.confidence + PRIOR_BOOST);
            }
        });

        // Renormalize after boost
        const boostedTotal = predictions.reduce((sum, p) => sum + p.confidence, 0);
        if (boostedTotal > 0) {
            predictions.forEach(p => p.confidence = p.confidence / boostedTotal);
        }
    }

    // Sort by confidence descending
    predictions.sort((a, b) => b.confidence - a.confidence);

    const top = predictions[0];
    const second = predictions[1] || { confidence: 0 };

    // Log results
    console.log('EMNIST recognition results:');
    predictions.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. '${p.character}' (${(p.confidence * 100).toFixed(1)}%)`);
    });

    const confidenceDiff = top.confidence - second.confidence;

    return {
        character: top.character,
        type: top.type,
        confidence: top.confidence,
        isAmbiguous: confidenceDiff < RECOGNITION_CONFIG.ambiguityThreshold,
        isLowConfidence: top.confidence < RECOGNITION_CONFIG.minConfidence,
        topPredictions: predictions.slice(0, 5),
        isEmpty: false,
        fallbackMode: false
    };
}

/**
 * Recognize a handwritten character (digit or letter) from a canvas element.
 * Primary API for EMNIST-based recognition.
 *
 * @param {HTMLCanvasElement} canvas - Canvas with handwritten character
 * @param {Object} options - Recognition options
 * @param {string} [options.expectedAnswer] - Expected answer (educational prior, 15% boost)
 * @param {string} [options.expectedType='any'] - 'digit', 'letter', or 'any'
 * @returns {Promise<Object>} Recognition result:
 *   { character, type, confidence, isAmbiguous, isLowConfidence, topPredictions,
 *     isEmpty, fallbackMode, error, modelMissing }
 */
async function recognizeCharacter(canvas, options = {}) {
    const expectedAnswer = options.expectedAnswer || null;
    const expectedType = options.expectedType || 'any';

    try {
        // Check if canvas is empty
        if (isCanvasEmpty(canvas)) {
            return {
                character: null,
                type: null,
                confidence: 0,
                error: 'Canvas is empty',
                isEmpty: true,
                fallbackMode: false,
                modelMissing: false
            };
        }

        // Try EMNIST model first (supports all characters)
        if (!emnistModelLoaded) {
            await loadEmnistModel();
        }

        if (emnistModel) {
            return await _recognizeWithEmnist(canvas, expectedAnswer, expectedType);
        }

        // EMNIST not available - fall back to MNIST for digits only
        if (expectedType === 'digit' || expectedType === 'any') {
            console.log('EMNIST unavailable, falling back to MNIST for digit recognition');

            const digitResult = await recognizeDigit(canvas);

            if (digitResult.isEmpty) {
                return {
                    character: null,
                    type: null,
                    confidence: 0,
                    error: 'Canvas is empty',
                    isEmpty: true,
                    fallbackMode: true,
                    modelMissing: false
                };
            }

            if (digitResult.error) {
                return {
                    character: null,
                    type: null,
                    confidence: 0,
                    error: digitResult.error,
                    isEmpty: false,
                    fallbackMode: true,
                    modelMissing: false
                };
            }

            return {
                character: String(digitResult.digit),
                type: 'digit',
                confidence: digitResult.confidence,
                isAmbiguous: digitResult.isAmbiguous,
                isLowConfidence: digitResult.isLowConfidence,
                topPredictions: (digitResult.topPredictions || []).map(p => ({
                    character: String(p.digit),
                    type: 'digit',
                    confidence: p.confidence
                })),
                isEmpty: false,
                fallbackMode: true,
                modelMissing: false
            };
        }

        // EMNIST not available and letters requested
        return {
            character: null,
            type: null,
            confidence: 0,
            error: 'EMNIST model not loaded - letter recognition unavailable',
            isEmpty: false,
            fallbackMode: false,
            modelMissing: true
        };

    } catch (error) {
        console.error('Error in recognizeCharacter:', error);
        return {
            character: null,
            type: null,
            confidence: 0,
            error: error.message,
            isEmpty: false,
            fallbackMode: false,
            modelMissing: false
        };
    }
}

console.log('EMNIST character recognition module loaded. Call loadEmnistModel() to initialize.');
