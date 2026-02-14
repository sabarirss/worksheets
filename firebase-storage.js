// Firebase Storage Manager
// Replaces localStorage with Firestore for worksheet storage

const db = window.firebaseDb;
const auth = window.firebaseAuth;

// Get current username
function getCurrentUsername() {
    const user = getCurrentUser && getCurrentUser();
    return user ? user.username : null;
}

// Get current user's full name
function getCurrentUserFullName() {
    const user = getCurrentUser && getCurrentUser();
    return user ? user.fullName : 'Student';
}

// Save worksheet to Firestore
async function saveWorksheet(subject, identifier, data) {
    const username = getCurrentUsername();

    if (!username) {
        alert('You must be logged in to save worksheets.');
        return false;
    }

    try {
        const worksheetId = `${username}_${subject}_${identifier}`;

        const saveData = {
            worksheetId: worksheetId,
            username: username,
            identifier: identifier,
            subject: subject,
            completed: data.completed || true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            elapsedTime: data.elapsedTime || '00:00',
            studentName: data.studentName || getCurrentUserFullName(),
            canvasAnswers: data.canvasAnswers || [],
            buttonAnswers: data.buttonAnswers || {},
            checkboxAnswers: data.checkboxAnswers || {}
        };

        await db.collection('worksheets').doc(worksheetId).set(saveData);

        console.log('Worksheet saved to Firebase:', worksheetId);
        return true;

    } catch (error) {
        console.error('Error saving worksheet:', error);
        alert('Failed to save worksheet. Please try again.');
        return false;
    }
}

// Load worksheet from Firestore
async function loadWorksheet(subject, identifier) {
    const username = getCurrentUsername();

    if (!username) {
        return null;
    }

    try {
        const worksheetId = `${username}_${subject}_${identifier}`;
        const doc = await db.collection('worksheets').doc(worksheetId).get();

        if (doc.exists) {
            return doc.data();
        }

        return null;

    } catch (error) {
        console.error('Error loading worksheet:', error);
        return null;
    }
}

// Clear worksheet from Firestore
async function clearWorksheet(subject, identifier) {
    const username = getCurrentUsername();

    if (!username) {
        return false;
    }

    try {
        const worksheetId = `${username}_${subject}_${identifier}`;
        await db.collection('worksheets').doc(worksheetId).delete();

        console.log('Worksheet cleared from Firebase:', worksheetId);
        return true;

    } catch (error) {
        console.error('Error clearing worksheet:', error);
        return false;
    }
}

// Check if worksheet is completed
async function isWorksheetCompleted(subject, identifier) {
    const data = await loadWorksheet(subject, identifier);
    return data && data.completed === true;
}

// Get all completed worksheets for a subject
async function getCompletedWorksheets(subject) {
    const username = getCurrentUsername();

    if (!username) {
        return [];
    }

    try {
        const worksheets = await db.collection('worksheets')
            .where('username', '==', username)
            .where('subject', '==', subject)
            .where('completed', '==', true)
            .get();

        return worksheets.docs.map(doc => doc.data().identifier);

    } catch (error) {
        console.error('Error getting completed worksheets:', error);
        return [];
    }
}

// Get all worksheets for current user
async function getAllUserWorksheets() {
    const username = getCurrentUsername();

    if (!username) {
        return [];
    }

    try {
        const worksheets = await db.collection('worksheets')
            .where('username', '==', username)
            .get();

        return worksheets.docs.map(doc => doc.data());

    } catch (error) {
        console.error('Error getting user worksheets:', error);
        return [];
    }
}

// Get worksheet count by subject
async function getWorksheetCountBySubject(subject) {
    const username = getCurrentUsername();

    if (!username) {
        return 0;
    }

    try {
        const worksheets = await db.collection('worksheets')
            .where('username', '==', username)
            .where('subject', '==', subject)
            .get();

        return worksheets.size;

    } catch (error) {
        console.error('Error getting worksheet count:', error);
        return 0;
    }
}

// Export/backup all worksheets (for migration or backup)
async function exportAllWorksheets() {
    const username = getCurrentUsername();

    if (!username) {
        alert('You must be logged in to export worksheets.');
        return null;
    }

    try {
        const worksheets = await getAllUserWorksheets();

        const exportData = {
            username: username,
            exportDate: new Date().toISOString(),
            worksheetCount: worksheets.length,
            worksheets: worksheets
        };

        return exportData;

    } catch (error) {
        console.error('Error exporting worksheets:', error);
        return null;
    }
}

// Import worksheets (for migration or restore)
async function importWorksheets(exportData) {
    if (!exportData || !exportData.worksheets) {
        alert('Invalid export data');
        return false;
    }

    const username = getCurrentUsername();
    if (!username) {
        alert('You must be logged in to import worksheets.');
        return false;
    }

    try {
        const batch = db.batch();

        exportData.worksheets.forEach(worksheet => {
            // Update username to current user
            worksheet.username = username;
            worksheet.worksheetId = `${username}_${worksheet.subject}_${worksheet.identifier}`;

            const docRef = db.collection('worksheets').doc(worksheet.worksheetId);
            batch.set(docRef, worksheet);
        });

        await batch.commit();

        console.log(`Imported ${exportData.worksheets.length} worksheets`);
        return true;

    } catch (error) {
        console.error('Error importing worksheets:', error);
        alert('Failed to import worksheets. Please try again.');
        return false;
    }
}

// Migrate from localStorage to Firestore
async function migrateFromLocalStorage() {
    const username = getCurrentUsername();

    if (!username) {
        return { success: false, message: 'Not logged in' };
    }

    try {
        let migratedCount = 0;
        const batch = db.batch();

        // Find all worksheet keys in localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key && key.startsWith(`worksheet_${username}_`)) {
                const data = localStorage.getItem(key);

                if (data) {
                    try {
                        const worksheetData = JSON.parse(data);

                        // Create Firestore document
                        const docRef = db.collection('worksheets').doc(key);
                        batch.set(docRef, {
                            ...worksheetData,
                            migratedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        migratedCount++;
                    } catch (parseError) {
                        console.warn('Could not parse worksheet:', key);
                    }
                }
            }
        }

        if (migratedCount > 0) {
            await batch.commit();
            return {
                success: true,
                message: `Migrated ${migratedCount} worksheets from localStorage`
            };
        }

        return { success: true, message: 'No worksheets to migrate' };

    } catch (error) {
        console.error('Migration error:', error);
        return { success: false, message: 'Migration failed: ' + error.message };
    }
}

console.log('Firebase storage manager loaded');
