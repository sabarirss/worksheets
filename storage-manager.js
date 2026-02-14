// Storage Manager - Save/Load Worksheet Progress (User-Specific)

/**
 * Get current username from session
 * @returns {string|null} - Current username or null if not logged in
 */
function getCurrentUsername() {
    const user = getCurrentUser && getCurrentUser();
    return user ? user.username : null;
}

/**
 * Get current user's full name from session
 * @returns {string} - Current user's full name or default name
 */
function getCurrentUserFullName() {
    const user = getCurrentUser && getCurrentUser();
    return user ? user.fullName : 'Student';
}

/**
 * Save worksheet state to localStorage (per user)
 * @param {string} subject - Subject type: "math", "english", "aptitude"
 * @param {string} identifier - Unique identifier (e.g., "addition-6A", "7A", "mazes-easy")
 * @param {object} data - Worksheet data to save
 */
function saveWorksheet(subject, identifier, data) {
    const username = getCurrentUsername();
    if (!username) {
        console.error('No user logged in');
        alert('You must be logged in to save worksheets.');
        return false;
    }

    const key = `worksheet_${username}_${subject}_${identifier}`;
    const saveData = {
        username: username,
        identifier: identifier,
        subject: subject,
        completed: data.completed || true,
        timestamp: new Date().toISOString(),
        elapsedTime: data.elapsedTime || '00:00',
        studentName: data.studentName || getCurrentUserFullName(),
        canvasAnswers: data.canvasAnswers || [],
        buttonAnswers: data.buttonAnswers || {},
        checkboxAnswers: data.checkboxAnswers || {}
    };

    try {
        localStorage.setItem(key, JSON.stringify(saveData));
        console.log(`Saved worksheet: ${key}`);
        return true;
    } catch (e) {
        console.error('Error saving worksheet:', e);
        alert('Failed to save worksheet. Storage may be full.');
        return false;
    }
}

/**
 * Load worksheet state from localStorage (per user)
 * @param {string} subject - Subject type
 * @param {string} identifier - Unique identifier
 * @returns {object|null} - Saved worksheet data or null if not found
 */
function loadWorksheet(subject, identifier) {
    const username = getCurrentUsername();
    if (!username) {
        return null;
    }

    const key = `worksheet_${username}_${subject}_${identifier}`;

    try {
        const data = localStorage.getItem(key);
        if (data) {
            const parsed = JSON.parse(data);
            console.log(`Loaded worksheet: ${key}`);
            return parsed;
        }
        return null;
    } catch (e) {
        console.error('Error loading worksheet:', e);
        return null;
    }
}

/**
 * Check if a worksheet is completed
 * @param {string} subject - Subject type
 * @param {string} identifier - Unique identifier
 * @returns {boolean} - True if completed
 */
function isWorksheetCompleted(subject, identifier) {
    const data = loadWorksheet(subject, identifier);
    return data ? data.completed === true : false;
}

/**
 * Clear worksheet from localStorage (for redo) - per user
 * @param {string} subject - Subject type
 * @param {string} identifier - Unique identifier
 */
function clearWorksheet(subject, identifier) {
    const username = getCurrentUsername();
    if (!username) {
        return false;
    }

    const key = `worksheet_${username}_${subject}_${identifier}`;

    try {
        localStorage.removeItem(key);
        console.log(`Cleared worksheet: ${key}`);
        return true;
    } catch (e) {
        console.error('Error clearing worksheet:', e);
        return false;
    }
}

/**
 * Get all completed worksheets for a subject (per user)
 * @param {string} subject - Subject type
 * @returns {array} - Array of completed worksheet identifiers
 */
function getCompletedWorksheets(subject) {
    const username = getCurrentUsername();
    if (!username) {
        return [];
    }

    const completed = [];
    const prefix = `worksheet_${username}_${subject}_`;

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.completed) {
                    completed.push(data.identifier);
                }
            }
        }
    } catch (e) {
        console.error('Error getting completed worksheets:', e);
    }

    return completed;
}

/**
 * Export all worksheet data (for backup)
 * @returns {object} - All worksheet data
 */
function exportAllWorksheets() {
    const allData = {};

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('worksheet_')) {
                allData[key] = JSON.parse(localStorage.getItem(key));
            }
        }
    } catch (e) {
        console.error('Error exporting worksheets:', e);
    }

    return allData;
}

/**
 * Import worksheet data (for restore)
 * @param {object} data - Worksheet data to import
 */
function importWorksheets(data) {
    try {
        Object.keys(data).forEach(key => {
            if (key.startsWith('worksheet_')) {
                localStorage.setItem(key, JSON.stringify(data[key]));
            }
        });
        console.log('Imported worksheets successfully');
        return true;
    } catch (e) {
        console.error('Error importing worksheets:', e);
        return false;
    }
}

/**
 * Clear all worksheet data
 */
function clearAllWorksheets() {
    const keys = [];

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('worksheet_')) {
                keys.push(key);
            }
        }

        keys.forEach(key => localStorage.removeItem(key));
        console.log(`Cleared ${keys.length} worksheets`);
        return true;
    } catch (e) {
        console.error('Error clearing all worksheets:', e);
        return false;
    }
}

/**
 * Get storage usage information
 * @returns {object} - Storage usage stats
 */
function getStorageInfo() {
    let totalSize = 0;
    let worksheetCount = 0;

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('worksheet_')) {
                const value = localStorage.getItem(key);
                totalSize += key.length + value.length;
                worksheetCount++;
            }
        }

        return {
            worksheetCount: worksheetCount,
            totalSize: totalSize,
            totalSizeKB: Math.round(totalSize / 1024),
            totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
        };
    } catch (e) {
        console.error('Error getting storage info:', e);
        return { worksheetCount: 0, totalSize: 0, totalSizeKB: 0, totalSizeMB: 0 };
    }
}
