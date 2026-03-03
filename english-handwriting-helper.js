// English Handwriting Recognition Helper
// Uses EMNIST model (via handwriting-recognition.js) for real letter recognition
// Falls back gracefully when EMNIST model is not available

/**
 * Initialize English handwriting recognition.
 * Attempts to load the EMNIST model for letter recognition.
 */
async function initializeHandwritingRecognition() {
    // Requires TF.js and handwriting-recognition.js to be loaded
    if (typeof tf === 'undefined') {
        console.warn('TensorFlow.js not loaded. Handwriting recognition disabled.');
        return false;
    }

    if (typeof loadEmnistModel !== 'function') {
        console.warn('handwriting-recognition.js not loaded. EMNIST unavailable.');
        return false;
    }

    try {
        console.log('Initializing English handwriting recognition...');
        const model = await loadEmnistModel();
        if (model) {
            console.log('EMNIST model ready for English handwriting recognition');
            return true;
        } else {
            console.warn('EMNIST model not available - run train-emnist-model.py first');
            return false;
        }
    } catch (error) {
        console.error('Error initializing handwriting recognition:', error);
        return false;
    }
}

/**
 * Check if a canvas has any drawn content (local check for English helper).
 * @param {HTMLCanvasElement} canvas - The canvas to check
 * @returns {boolean} True if canvas is empty
 */
function _isCanvasEmptyEnglish(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let nonWhitePixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // Count pixels that aren't white
        if (r < 250 || g < 250 || b < 250) {
            nonWhitePixels++;
        }
    }

    // Less than 0.3% of pixels are non-white = empty
    const threshold = (canvas.width * canvas.height) * 0.003;
    return nonWhitePixels < threshold;
}

/**
 * Create a cleaned copy of a canvas with only dark handwriting strokes.
 * Removes colored ruled lines (red #e74c3c, blue #3498db, margin #ff6b6b)
 * and the near-white background (#f8f9ff), keeping only black/dark strokes.
 *
 * @param {HTMLCanvasElement} canvas - Source canvas with ruled lines + handwriting
 * @returns {HTMLCanvasElement} New canvas with only dark handwriting on white background
 */
function _removeRuledLines(canvas) {
    var cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = canvas.width;
    cleanCanvas.height = canvas.height;
    var cleanCtx = cleanCanvas.getContext('2d', { willReadFrequently: true });
    var srcCtx = canvas.getContext('2d', { willReadFrequently: true });
    var imageData = srcCtx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;
    var cleanData = cleanCtx.createImageData(canvas.width, canvas.height);

    for (var i = 0; i < pixels.length; i += 4) {
        var r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        // Keep only dark pixels (handwriting is black #000, stroke width 3px)
        // Reject: red lines (#e74c3c), blue lines (#3498db), margin (#ff6b6b), background (#f8f9ff)
        if (r < 80 && g < 80 && b < 80) {
            cleanData.data[i] = 0;
            cleanData.data[i + 1] = 0;
            cleanData.data[i + 2] = 0;
            cleanData.data[i + 3] = 255;
        } else {
            cleanData.data[i] = 255;
            cleanData.data[i + 1] = 255;
            cleanData.data[i + 2] = 255;
            cleanData.data[i + 3] = 255;
        }
    }

    cleanCtx.putImageData(cleanData, 0, 0);
    return cleanCanvas;
}

/**
 * Recognize text from a canvas element using EMNIST model.
 * Compatible return shape with the previous fake implementation.
 *
 * @param {HTMLCanvasElement} canvas - The canvas with handwriting
 * @param {string} expectedAnswer - The expected answer for validation/prior boost
 * @returns {Promise<Object>} Recognition result:
 *   { success, recognized, confidence, isEmpty, modelMissing }
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

    // Check if canvas is empty using local check
    if (_isCanvasEmptyEnglish(canvas)) {
        return {
            success: false,
            error: 'Canvas is empty',
            recognized: '',
            confidence: 0,
            isEmpty: true
        };
    }

    // Check if recognizeCharacter is available (from handwriting-recognition.js)
    if (typeof recognizeCharacter !== 'function') {
        return {
            success: false,
            error: 'Recognition engine not loaded',
            recognized: '',
            confidence: 0,
            modelMissing: true
        };
    }

    try {
        // Determine expected type from the answer
        const expectedType = _getExpectedType(expectedAnswer);

        // For single characters, recognize directly
        if (!expectedAnswer || expectedAnswer.length <= 1) {
            const result = await recognizeCharacter(canvas, {
                expectedAnswer: expectedAnswer,
                expectedType: expectedType
            });

            if (result.isEmpty) {
                return {
                    success: false,
                    error: 'Canvas is empty',
                    recognized: '',
                    confidence: 0,
                    isEmpty: true
                };
            }

            if (result.modelMissing) {
                return {
                    success: false,
                    error: 'EMNIST model not loaded',
                    recognized: '',
                    confidence: 0,
                    modelMissing: true
                };
            }

            if (result.error) {
                return {
                    success: false,
                    error: result.error,
                    recognized: '',
                    confidence: 0
                };
            }

            return {
                success: true,
                recognized: result.character || '',
                confidence: result.confidence || 0,
                isEmpty: false
            };
        }

        // For multi-character answers (words), segment canvas and recognize each character
        if (typeof findDigitSegments === 'function' && typeof extractSegment === 'function') {
            // Clean canvas: remove ruled lines (red/blue), keep only dark handwriting strokes
            var cleanCanvas = _removeRuledLines(canvas);
            var segments = findDigitSegments(cleanCanvas, expectedAnswer.length);

            if (segments.length === 0) {
                return {
                    success: false,
                    error: 'Canvas is empty',
                    recognized: '',
                    confidence: 0,
                    isEmpty: true
                };
            }

            // Recognize each segment as a character, storing top predictions per position
            var recognizedChars = [];
            var perPositionPredictions = []; // top 3 predictions per position
            var totalConfidence = 0;
            var hasModelMissing = false;

            for (var s = 0; s < segments.length; s++) {
                var segCanvas = extractSegment(cleanCanvas, segments[s]);
                // Pass expected char at this position for prior boost
                var expectedChar = s < expectedAnswer.length ? expectedAnswer.charAt(s) : null;
                var charResult = await recognizeCharacter(segCanvas, {
                    expectedAnswer: expectedChar,
                    expectedType: 'letter'
                });

                if (charResult.modelMissing) {
                    hasModelMissing = true;
                    break;
                }

                if (charResult.error && !charResult.isEmpty) {
                    recognizedChars.push('?');
                    perPositionPredictions.push([]);
                    continue;
                }

                if (charResult.character) {
                    recognizedChars.push(charResult.character);
                    totalConfidence += charResult.confidence || 0;
                    // Store top 3 predictions for this position
                    var topPreds = (charResult.topPredictions || []).slice(0, 3).map(function(p) {
                        return p.character ? p.character.toLowerCase() : '';
                    });
                    perPositionPredictions.push(topPreds);
                } else {
                    recognizedChars.push('?');
                    perPositionPredictions.push([]);
                }
            }

            if (hasModelMissing) {
                return {
                    success: false,
                    error: 'EMNIST model not loaded',
                    recognized: '',
                    confidence: 0,
                    modelMissing: true
                };
            }

            if (recognizedChars.length === 0) {
                return {
                    success: false,
                    error: 'No characters recognized',
                    recognized: '',
                    confidence: 0,
                    isEmpty: true
                };
            }

            var recognizedWord = recognizedChars.join('');
            var avgConfidence = totalConfidence / recognizedChars.length;

            return {
                success: true,
                recognized: recognizedWord,
                confidence: avgConfidence,
                isEmpty: false,
                perPositionPredictions: perPositionPredictions
            };
        }

        // Fallback: if segmentation functions not available, try recognizing whole canvas as single char
        var fallbackResult = await recognizeCharacter(canvas, {
            expectedAnswer: expectedAnswer.charAt(0),
            expectedType: expectedType
        });

        if (fallbackResult.isEmpty || fallbackResult.modelMissing || fallbackResult.error) {
            return {
                success: false,
                error: fallbackResult.error || 'Recognition failed',
                recognized: '',
                confidence: 0,
                isEmpty: fallbackResult.isEmpty || false,
                modelMissing: fallbackResult.modelMissing || false
            };
        }

        return {
            success: true,
            recognized: fallbackResult.character || '',
            confidence: Math.max(0, (fallbackResult.confidence || 0) * 0.6),
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
 * Determine expected type from the answer string.
 * @param {string} answer
 * @returns {string} 'digit', 'letter', or 'any'
 */
function _getExpectedType(answer) {
    if (!answer) return 'any';
    if (/^\d+$/.test(answer)) return 'digit';
    if (/^[a-zA-Z]+$/.test(answer)) return 'letter';
    return 'any';
}

/**
 * Validate handwriting against expected answer.
 * Uses fuzzy matching + top-N prediction matching for kid-friendly validation.
 * @param {string} recognized - Recognized text (top-1 per position joined)
 * @param {string} expected - Expected answer
 * @param {Array<Array<string>>} [perPositionPredictions] - Top 3 predictions per position (lowercase)
 * @returns {boolean} True if close enough match
 */
function validateHandwriting(recognized, expected, perPositionPredictions) {
    if (!recognized || !expected) return false;

    // Normalize both strings
    var recNorm = recognized.toLowerCase().trim();
    var expNorm = expected.toLowerCase().trim();

    // Exact match on top-1 predictions
    if (recNorm === expNorm) return true;

    // Top-N position matching: if expected char is in top 3 predictions at each position, accept it
    if (perPositionPredictions && perPositionPredictions.length > 0 && expNorm.length === perPositionPredictions.length) {
        var allPositionsMatch = true;
        for (var i = 0; i < expNorm.length; i++) {
            var expectedCharLower = expNorm.charAt(i);
            var preds = perPositionPredictions[i];
            if (!preds || preds.indexOf(expectedCharLower) === -1) {
                allPositionsMatch = false;
                break;
            }
        }
        if (allPositionsMatch) return true;
    }

    // Fuzzy matching: allow for common kid mistakes (reversed letters, etc.)
    var similarity = calculateSimilarity(recNorm, expNorm);
    return similarity > 0.7; // 70% similarity threshold for kids
}

/**
 * Calculate string similarity (Levenshtein distance based)
 * @param {string} str1
 * @param {string} str2
 * @returns {number} Similarity score between 0 and 1
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
 * @param {string} str1
 * @param {string} str2
 * @returns {number} Edit distance
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

console.log('English handwriting helper loaded with EMNIST support');
