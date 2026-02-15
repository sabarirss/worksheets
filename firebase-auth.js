// Firebase Authentication System
// Replaces localStorage with Firebase Authentication and Firestore

// Firebase instances will be available after firebase-config.js loads

// Security Configuration
const SECURITY_CONFIG = {
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
    passwordMinLength: 6
};

// Current user cache
let currentUserCache = null;

// Initialize default admin user
async function initializeAuth() {
    try {
        // Check if admin user exists by querying username
        const adminQuery = await firebase.firestore().collection('users')
            .where('username', '==', 'admin')
            .limit(1)
            .get();

        if (adminQuery.empty) {
            // Create default admin user in Firebase Auth
            const adminCredential = await firebase.auth().createUserWithEmailAndPassword(
                'admin@worksheets.local',
                'admin123'
            );

            // Create admin user document in Firestore with UID as document ID
            const docId = adminCredential.user.uid;
            await firebase.firestore().collection('users').doc(docId).set({
                uid: adminCredential.user.uid,
                username: 'admin',
                email: 'admin@worksheets.local',
                role: 'admin',
                fullName: 'Administrator',
                age: 13, // Admin has access to all content
                version: 'full', // Admin always has full version
                versionUpgradeRequested: false,
                modules: {
                    // All modules assigned for admin
                    math: true,
                    english: true,
                    aptitude: true,
                    stories: true,
                    'emotional-quotient': true,
                    german: true,
                    drawing: true,
                    'german-kids': true
                },
                enabledModules: {
                    // All modules enabled for admin
                    math: true,
                    english: true,
                    aptitude: true,
                    stories: true,
                    'emotional-quotient': true,
                    german: true,
                    drawing: true,
                    'german-kids': true
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('Default admin user created with document ID:', docId);
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        // Admin might already exist from a previous setup
        if (error.code === 'auth/email-already-in-use') {
            console.log('Admin user already exists in Firebase Auth');
        } else {
            console.error('Error initializing auth:', error);
        }
    }
}

// Listen for auth state changes
firebase.auth().onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
        // User is signed in, load their profile from Firestore
        try {
            const userDoc = await firebase.firestore().collection('users').doc(firebaseUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();

                // Sync email verification status from Firebase Auth to Firestore
                if (firebaseUser.emailVerified !== userData.emailVerified) {
                    console.log('Syncing email verification status to Firestore');
                    await userDoc.ref.update({
                        emailVerified: firebaseUser.emailVerified
                    });
                    userData.emailVerified = firebaseUser.emailVerified;
                }

                currentUserCache = {
                    uid: firebaseUser.uid,
                    ...userData
                };
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    } else {
        currentUserCache = null;
    }
});

// Get current authenticated user
function getCurrentUser() {
    const firebaseUser = firebase.auth().currentUser;
    if (!firebaseUser) return null;

    return currentUserCache;
}

// Login with username/password
async function login(username, password) {
    try {
        let email;
        // Convert username to lowercase for case-insensitive login
        let lookupUsername = username.toLowerCase();

        // Determine the email to use for authentication
        if (username.includes('@')) {
            // Already an email, use as-is (emails are case-insensitive by nature)
            email = username.toLowerCase();

            // Look up user by EMAIL in Firestore to get their username
            const userQuery = await firebase.firestore().collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();

            if (!userQuery.empty) {
                // Get the actual username from Firestore
                lookupUsername = userQuery.docs[0].data().username;
                console.log('Found user with email login. Username:', lookupUsername, 'Email:', email);
            } else {
                console.log('User not found in Firestore for email:', email);
                // Extract username as fallback (for admin or old users)
                lookupUsername = username.split('@')[0].toLowerCase();
            }
        } else {
            // Look up user's real email from Firestore (using lowercase username)
            const userQuery = await firebase.firestore().collection('users')
                .where('username', '==', lookupUsername)
                .limit(1)
                .get();

            if (!userQuery.empty) {
                // Found user, use their actual email
                email = userQuery.docs[0].data().email;
            } else {
                // User not found in Firestore, fall back to @worksheets.local for admin
                email = `${lookupUsername}@worksheets.local`;
            }
        }

        console.log('Login attempt - Username:', lookupUsername, 'Email:', email);

        // Sign in with Firebase Auth using the determined email
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

        // Get user document from Firestore using username
        const userDoc = await firebase.firestore().collection('users')
            .where('username', '==', lookupUsername)
            .limit(1)
            .get();

        if (userDoc.empty) {
            await firebase.auth().signOut();
            return { success: false, error: 'User profile not found' };
        }

        const userData = userDoc.docs[0].data();

        // Sync email verification status from Firebase Auth to Firestore
        if (userCredential.user.emailVerified !== userData.emailVerified) {
            console.log('Syncing email verification status to Firestore');
            await userDoc.docs[0].ref.update({
                emailVerified: userCredential.user.emailVerified
            });
            userData.emailVerified = userCredential.user.emailVerified;
        }

        currentUserCache = {
            uid: userCredential.user.uid,
            ...userData
        };

        return { success: true, user: currentUserCache };

    } catch (error) {
        console.error('Login error:', error);

        let errorMessage = 'Invalid username or password';

        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid username or password';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Invalid username or password';
        } else if (error.code === 'auth/invalid-login-credentials') {
            errorMessage = 'Invalid username or password';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection.';
        }

        return { success: false, error: errorMessage };
    }
}

// Logout
async function logout() {
    try {
        // Clear selected child profile on logout (security)
        if (typeof clearSelectedChild === 'function') {
            clearSelectedChild();
        }

        await firebase.auth().signOut();
        currentUserCache = null;
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
}

// Require authentication
function requireAuth() {
    const user = getCurrentUser();

    if (!user && !firebase.auth().currentUser) {
        window.location.href = 'login.html';
        return null;
    }

    return user;
}

// Require admin access
function requireAdmin() {
    const user = requireAuth();

    if (!user) return null;

    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return null;
    }

    return user;
}

// Check module access
function hasModuleAccess(moduleName) {
    const user = getCurrentUser();
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    return user.modules && user.modules[moduleName] === true;
}

// Create new user (admin only)
async function createUser(userData) {
    try {
        // Validate password
        if (!userData.password || userData.password.length < SECURITY_CONFIG.passwordMinLength) {
            return {
                success: false,
                error: `Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters long`
            };
        }

        // Check if username already exists
        const existingUser = await firebase.firestore().collection('users')
            .where('username', '==', userData.username)
            .limit(1)
            .get();

        if (!existingUser.empty) {
            return { success: false, error: 'Username already exists' };
        }

        // Save current admin user (will be logged out after creating new user)
        const currentAdmin = firebase.auth().currentUser;
        const adminEmail = currentAdmin.email;

        // Create user in Firebase Auth
        const email = userData.username.includes('@')
            ? userData.username
            : `${userData.username}@worksheets.local`;

        // Create secondary app instance to avoid logging out current user
        const secondaryApp = firebase.initializeApp(firebaseConfig, 'Secondary');

        const userCredential = await secondaryApp.auth().createUserWithEmailAndPassword(
            email,
            userData.password
        );

        // Create user document in Firestore (using main app)
        const newUser = {
            uid: userCredential.user.uid,
            username: userData.username,
            email: email,
            role: userData.role || 'student',
            fullName: userData.fullName || userData.username,
            version: 'demo', // New users start with demo version
            versionUpgradeRequested: false,
            modules: userData.modules || {
                math: true,
                english: false,
                aptitude: false,
                stories: false,
                'emotional-quotient': false,
                german: false
            },
            enabledModules: userData.enabledModules || {
                math: true,
                english: false,
                aptitude: false,
                stories: false,
                'emotional-quotient': false,
                german: false
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        console.log('Creating user with modules:', newUser.modules);

        await firebase.firestore().collection('users').doc(userCredential.user.uid).set(newUser);

        // Sign out from secondary app and delete it
        await secondaryApp.auth().signOut();
        await secondaryApp.delete();

        console.log('User created successfully, admin still logged in');
        return { success: true, user: newUser };

    } catch (error) {
        console.error('Create user error:', error);

        let errorMessage = 'Failed to create user';

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Username already exists';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak';
        }

        return { success: false, error: errorMessage };
    }
}

// Update user (admin only)
async function updateUser(username, updates) {
    try {
        // Find user by username
        const userQuery = await firebase.firestore().collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();

        if (userQuery.empty) {
            return { success: false, error: 'User not found' };
        }

        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        // Note: Password updates not supported from client-side
        // Firebase Auth doesn't allow updating other users' passwords from client SDK
        // To update passwords, user must use "Forgot Password" or Admin SDK via Cloud Function
        if (updates.password) {
            console.warn('Password updates not supported from client-side. Use password reset instead.');
            delete updates.password; // Don't store password in Firestore
        }

        // Update user document
        const updateData = {
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Remove fields that shouldn't be updated
        delete updateData.username;
        delete updateData.uid;
        delete updateData.email;
        delete updateData.createdAt;

        await userDoc.ref.update(updateData);

        return { success: true, user: { ...userData, ...updateData } };

    } catch (error) {
        console.error('Update user error:', error);
        return { success: false, error: 'Failed to update user' };
    }
}

// Delete user (admin only)
async function deleteUser(username) {
    console.log('deleteUser called with username:', username);

    if (!username) {
        console.error('deleteUser: username is undefined or empty');
        return { success: false, error: 'Username is required' };
    }

    if (username === 'admin') {
        return { success: false, error: 'Cannot delete admin user' };
    }

    try {
        console.log('Querying Firestore for user:', username);

        // Find user by username
        const userQuery = await firebase.firestore().collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();

        console.log('Query result empty?', userQuery.empty);

        if (userQuery.empty) {
            return { success: false, error: 'User not found' };
        }

        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        console.log('Found user data:', userData);

        // Delete user's worksheets from Firestore
        console.log('Deleting worksheets for:', username);
        await deleteUserWorksheets(username);

        // Delete user document from Firestore
        console.log('Deleting user document');
        await userDoc.ref.delete();

        // Note: Firebase Auth account cannot be deleted from client-side code
        // The user won't be able to login anyway since their Firestore profile is deleted
        // To fully delete Auth accounts, you would need Firebase Admin SDK in a Cloud Function

        console.log(`User ${username} deleted from Firestore. Auth account remains but cannot login.`);

        return { success: true };

    } catch (error) {
        console.error('Delete user error:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}

// Delete user's worksheets
async function deleteUserWorksheets(username) {
    try {
        const worksheets = await firebase.firestore().collection('worksheets')
            .where('username', '==', username)
            .get();

        const batch = firebase.firestore().batch();
        worksheets.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    } catch (error) {
        console.error('Error deleting worksheets:', error);
    }
}

// Get all users (admin only)
async function getAllUsers() {
    try {
        const usersSnapshot = await firebase.firestore().collection('users').get();
        return usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

// Get user count
async function getUserCount() {
    try {
        const usersSnapshot = await firebase.firestore().collection('users').get();
        return usersSnapshot.size;
    } catch (error) {
        console.error('Error getting user count:', error);
        return 0;
    }
}

// Get user by username
async function getUser(username) {
    try {
        const userQuery = await firebase.firestore().collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();

        if (userQuery.empty) return null;

        return userQuery.docs[0].data();
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    const strength = {
        length: password.length >= 8,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(strength).filter(Boolean).length;

    return {
        score: score,
        strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
        checks: strength
    };
}

// Initialize on load
initializeAuth();
