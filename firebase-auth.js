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
            const docId = adminCredential.user.uid.substring(0, 20);
            await firebase.firestore().collection('users').doc(docId).set({
                uid: adminCredential.user.uid,
                username: 'admin',
                email: 'admin@worksheets.local',
                role: 'admin',
                fullName: 'Administrator',
                modules: {
                    math: true,
                    english: true,
                    aptitude: true,
                    stories: true,
                    'emotional-quotient': true,
                    german: true
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
            const userDoc = await firebase.firestore().collection('users').doc(firebaseUser.uid.substring(0, 20)).get();
            if (userDoc.exists) {
                currentUserCache = {
                    uid: firebaseUser.uid,
                    ...userDoc.data()
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
        // Convert username to email format for Firebase Auth
        const email = username.includes('@') ? username : `${username}@worksheets.local`;

        // Sign in with Firebase Auth
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

        // Get user document from Firestore
        const userDoc = await firebase.firestore().collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();

        if (userDoc.empty) {
            await firebase.auth().signOut();
            return { success: false, error: 'User profile not found' };
        }

        const userData = userDoc.docs[0].data();
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

        // Create user in Firebase Auth
        const email = userData.username.includes('@')
            ? userData.username
            : `${userData.username}@worksheets.local`;

        const userCredential = await firebase.auth().createUserWithEmailAndPassword(
            email,
            userData.password
        );

        // Create user document in Firestore
        const newUser = {
            uid: userCredential.user.uid,
            username: userData.username,
            email: email,
            role: userData.role || 'student',
            fullName: userData.fullName || userData.username,
            modules: userData.modules || {
                math: true,
                english: true,
                aptitude: true,
                stories: true,
                'emotional-quotient': false,
                german: false
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore().collection('users').doc(userCredential.user.uid.substring(0, 20)).set(newUser);

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

        // If password is being updated
        if (updates.password) {
            if (updates.password.length < SECURITY_CONFIG.passwordMinLength) {
                return {
                    success: false,
                    error: `Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters long`
                };
            }

            // Update password in Firebase Auth
            const user = await firebase.auth().getUserByEmail(userData.email);
            await firebase.auth().updateUser(user.uid, {
                password: updates.password
            });

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
    if (username === 'admin') {
        return { success: false, error: 'Cannot delete admin user' };
    }

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

        // Delete user's worksheets from Firestore
        await deleteUserWorksheets(username);

        // Delete user from Firebase Auth
        try {
            const user = await firebase.auth().getUserByEmail(userData.email);
            await user.delete();
        } catch (authError) {
            console.warn('Could not delete from Auth:', authError);
        }

        // Delete user document from Firestore
        await userDoc.ref.delete();

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
