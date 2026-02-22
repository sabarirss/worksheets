// Child Session Management System
// Ensures only one device can be logged into a child profile at a time

// Generate a unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

// Get device information for logging
function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (userAgent.indexOf('Firefox') > -1) {
        browser = 'Firefox';
    } else if (userAgent.indexOf('Chrome') > -1) {
        browser = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
        browser = 'Safari';
    } else if (userAgent.indexOf('Edge') > -1) {
        browser = 'Edge';
    }

    // Detect OS
    if (userAgent.indexOf('Windows') > -1) {
        os = 'Windows';
    } else if (userAgent.indexOf('Mac') > -1) {
        os = 'macOS';
    } else if (userAgent.indexOf('Linux') > -1) {
        os = 'Linux';
    } else if (userAgent.indexOf('Android') > -1) {
        os = 'Android';
    } else if (userAgent.indexOf('iOS') > -1) {
        os = 'iOS';
    }

    return `${browser} on ${os}`;
}

// Store for active session listener
let activeSessionListener = null;

// Create a new session for a child
async function createChildSession(childId) {
    try {
        const sessionId = generateSessionId();
        const deviceInfo = getDeviceInfo();

        console.log('Creating child session:', { childId, sessionId, deviceInfo });

        // Create session document in Firestore
        await firebase.firestore().collection('child_sessions').doc(childId).set({
            session_id: sessionId,
            child_id: childId,
            device: deviceInfo,
            started_at: firebase.firestore.FieldValue.serverTimestamp(),
            last_active: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Store session ID in localStorage
        localStorage.setItem('childSessionId', sessionId);
        localStorage.setItem('childSessionChildId', childId);

        // Start monitoring for other sessions
        monitorChildSession(childId, sessionId);

        console.log('Child session created successfully');
    } catch (error) {
        console.error('Error creating child session:', error);
    }
}

// Monitor the child's session for changes (another device logging in)
function monitorChildSession(childId, sessionId) {
    // Clear any existing listener
    if (activeSessionListener) {
        activeSessionListener();
        activeSessionListener = null;
    }

    // Listen for changes to child session document
    activeSessionListener = firebase.firestore()
        .collection('child_sessions')
        .doc(childId)
        .onSnapshot((doc) => {
            if (!doc.exists) {
                console.log('Session document does not exist');
                return;
            }

            const data = doc.data();

            // If session ID changed, another device logged in
            if (data && data.session_id !== sessionId) {
                console.log('Session conflict detected - logging out');

                // Stop listening
                if (activeSessionListener) {
                    activeSessionListener();
                    activeSessionListener = null;
                }

                // Clear local session data
                clearChildSession();

                // Show alert and redirect
                alert('This child profile is now active on another device. You have been logged out.');

                // Clear selected child
                if (typeof clearSelectedChild === 'function') {
                    clearSelectedChild();
                }

                // Redirect to home
                window.location.href = 'index';
            }
        }, (error) => {
            console.error('Error monitoring session:', error);
        });
}

// Update the last active timestamp (call periodically to show activity)
async function updateSessionActivity(childId) {
    const sessionId = localStorage.getItem('childSessionId');
    const storedChildId = localStorage.getItem('childSessionChildId');

    if (!sessionId || storedChildId !== childId) {
        console.log('No active session to update');
        return;
    }

    try {
        const sessionDoc = await firebase.firestore()
            .collection('child_sessions')
            .doc(childId)
            .get();

        if (sessionDoc.exists) {
            const data = sessionDoc.data();

            // Only update if we're still the active session
            if (data.session_id === sessionId) {
                await firebase.firestore()
                    .collection('child_sessions')
                    .doc(childId)
                    .update({
                        last_active: firebase.firestore.FieldValue.serverTimestamp()
                    });
            }
        }
    } catch (error) {
        console.error('Error updating session activity:', error);
    }
}

// Clear the child session
function clearChildSession() {
    localStorage.removeItem('childSessionId');
    localStorage.removeItem('childSessionChildId');

    // Stop listening
    if (activeSessionListener) {
        activeSessionListener();
        activeSessionListener = null;
    }
}

// Check if there's an active session for this child
async function hasActiveSession(childId) {
    try {
        const sessionDoc = await firebase.firestore()
            .collection('child_sessions')
            .doc(childId)
            .get();

        if (!sessionDoc.exists) {
            return false;
        }

        const data = sessionDoc.data();
        const lastActive = data.last_active;

        if (!lastActive) {
            return false;
        }

        // Check if session is recent (within last 24 hours)
        const now = new Date();
        const lastActiveDate = lastActive.toDate();
        const hoursSinceActive = (now - lastActiveDate) / (1000 * 60 * 60);

        return hoursSinceActive < 24;
    } catch (error) {
        console.error('Error checking active session:', error);
        return false;
    }
}

// Set up periodic activity updates (every 5 minutes)
let activityUpdateInterval = null;

function startActivityTracking() {
    // Clear any existing interval
    if (activityUpdateInterval) {
        clearInterval(activityUpdateInterval);
    }

    // Update activity every 5 minutes
    activityUpdateInterval = setInterval(() => {
        const childId = localStorage.getItem('childSessionChildId');
        if (childId) {
            updateSessionActivity(childId);
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// Stop activity tracking
function stopActivityTracking() {
    if (activityUpdateInterval) {
        clearInterval(activityUpdateInterval);
        activityUpdateInterval = null;
    }
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    stopActivityTracking();
});

console.log('Child session manager loaded');
