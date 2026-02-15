/**
 * Handwriting Recognition using TensorFlow.js
 * Recognizes handwritten digits (0-9) from canvas elements
 * Uses pre-trained MNIST model for digit classification
 */

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
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Convert to tensor
        let tensor = tf.browser.fromPixels(imageData, 1); // grayscale

        // Resize to 28x28 (MNIST input size)
        tensor = tf.image.resizeBilinear(tensor, [28, 28]);

        // Normalize to [0, 1]
        tensor = tensor.div(255.0);

        // Invert colors (MNIST expects white digit on black background)
        // Our canvas has black on white, so we need to invert
        tensor = tf.scalar(1.0).sub(tensor);

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
    const ctx = canvas.getContext('2d');
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

    // Canvas is considered empty if less than 0.5% of pixels are non-white
    const threshold = (canvas.width * canvas.height) * 0.005;
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

        // Ensure model is loaded
        if (!modelLoaded) {
            await loadHandwritingModel();
        }

        if (!handwritingModel) {
            throw new Error('Model not available');
        }

        // Preprocess canvas
        const tensor = preprocessCanvas(canvas);

        // Run prediction
        const predictions = await handwritingModel.predict(tensor).data();

        // Get the digit with highest confidence
        let maxConfidence = 0;
        let recognizedDigit = 0;

        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i] > maxConfidence) {
                maxConfidence = predictions[i];
                recognizedDigit = i;
            }
        }

        // Clean up tensor
        tensor.dispose();

        console.log(`Recognized digit: ${recognizedDigit} (confidence: ${(maxConfidence * 100).toFixed(1)}%)`);

        return {
            digit: recognizedDigit,
            confidence: maxConfidence,
            allPredictions: Array.from(predictions),
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

// Initialize model loading when script loads
console.log('Handwriting recognition module loaded. Call loadHandwritingModel() to initialize.');
