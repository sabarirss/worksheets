// Enhanced Authentication System
// Includes password hashing, rate limiting, and session encryption

// Security Configuration
const SECURITY_CONFIG = {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
    passwordMinLength: 6,
    saltRounds: 10
};

// Simple hash function (alternative to bcrypt for client-side)
async function hashPassword(password) {
    // Use Web Crypto API for secure hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple encryption for session data
function encryptData(data, key) {
    try {
        const jsonStr = JSON.stringify(data);
        // XOR encryption with key
        let encrypted = '';
        for (let i = 0; i < jsonStr.length; i++) {
            encrypted += String.fromCharCode(jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(encrypted); // Base64 encode
    } catch (e) {
        console.error('Encryption error:', e);
        return null;
    }
}

function decryptData(encrypted, key) {
    try {
        const decoded = atob(encrypted);
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return JSON.parse(decrypted);
    } catch (e) {
        console.error('Decryption error:', e);
        return null;
    }
}

// Generate session key based on browser fingerprint
function getSessionKey() {
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset()
    ].join('|');
    return btoa(fingerprint).substring(0, 32);
}

// Rate limiting for login attempts
function checkRateLimit(username) {
    const key = `loginAttempts_${username}`;
    const attemptsData = localStorage.getItem(key);

    if (!attemptsData) {
        return { allowed: true, remaining: SECURITY_CONFIG.maxLoginAttempts };
    }

    const data = JSON.parse(attemptsData);
    const now = Date.now();

    // Check if lockout period has expired
    if (data.lockedUntil && now < data.lockedUntil) {
        const remainingMinutes = Math.ceil((data.lockedUntil - now) / 60000);
        return {
            allowed: false,
            remaining: 0,
            lockedUntil: data.lockedUntil,
            message: `Account locked. Try again in ${remainingMinutes} minute(s).`
        };
    }

    // Reset if lockout expired
    if (data.lockedUntil && now >= data.lockedUntil) {
        localStorage.removeItem(key);
        return { allowed: true, remaining: SECURITY_CONFIG.maxLoginAttempts };
    }

    return {
        allowed: data.attempts < SECURITY_CONFIG.maxLoginAttempts,
        remaining: SECURITY_CONFIG.maxLoginAttempts - data.attempts
    };
}

function recordLoginAttempt(username, success) {
    const key = `loginAttempts_${username}`;

    if (success) {
        // Clear failed attempts on successful login
        localStorage.removeItem(key);
        return;
    }

    const attemptsData = localStorage.getItem(key);
    let data = attemptsData ? JSON.parse(attemptsData) : { attempts: 0 };

    data.attempts += 1;
    data.lastAttempt = Date.now();

    // Lock account if max attempts reached
    if (data.attempts >= SECURITY_CONFIG.maxLoginAttempts) {
        data.lockedUntil = Date.now() + SECURITY_CONFIG.lockoutDuration;
    }

    localStorage.setItem(key, JSON.stringify(data));
}

// Initialize default admin user if not exists
async function initializeAuth() {
    const users = getUsers();

    // Create default admin if no users exist
    if (Object.keys(users).length === 0) {
        const hashedPassword = await hashPassword('admin123');
        const defaultAdmin = {
            username: 'admin',
            passwordHash: hashedPassword,
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
            createdAt: new Date().toISOString(),
            passwordVersion: 2 // Version 2 uses secure hashing
        };

        users['admin'] = defaultAdmin;
        saveUsers(users);
        console.log('Default admin user created with secure password hash');
    } else {
        // Migrate old users to new password format
        await migrateUserPasswords();
    }
}

// Migrate existing plain text passwords to hashed versions
async function migrateUserPasswords() {
    const users = getUsers();
    let migrated = false;

    for (const username in users) {
        const user = users[username];
        // Check if user still has plain text password (old format)
        if (user.password && !user.passwordHash) {
            console.log(`Migrating password for user: ${username}`);
            user.passwordHash = await hashPassword(user.password);
            user.passwordVersion = 2;
            delete user.password; // Remove plain text password
            migrated = true;
        }
    }

    if (migrated) {
        saveUsers(users);
        console.log('Password migration completed');
    }
}

// User storage functions
function getUsers() {
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : {};
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getUser(username) {
    const users = getUsers();
    return users[username];
}

// Session management with encryption
function getCurrentUser() {
    const sessionEncrypted = localStorage.getItem('currentSession');
    if (!sessionEncrypted) return null;

    try {
        const key = getSessionKey();
        const session = decryptData(sessionEncrypted, key);

        if (!session) return null;

        // Check if session is still valid
        const sessionAge = Date.now() - new Date(session.loginTime).getTime();

        if (sessionAge > SECURITY_CONFIG.sessionDuration) {
            logout();
            return null;
        }

        // Verify session token
        if (!session.token || session.token !== generateSessionToken(session.user.username, session.loginTime)) {
            console.warn('Session token mismatch - possible tampering');
            logout();
            return null;
        }

        return session.user;
    } catch (e) {
        console.error('Session validation error:', e);
        logout();
        return null;
    }
}

function generateSessionToken(username, loginTime) {
    // Create a session token based on username, login time, and browser fingerprint
    const data = username + loginTime + getSessionKey();
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function setCurrentUser(user) {
    const loginTime = new Date().toISOString();
    const session = {
        user: user,
        loginTime: loginTime,
        token: generateSessionToken(user.username, loginTime)
    };

    const key = getSessionKey();
    const encrypted = encryptData(session, key);

    if (encrypted) {
        localStorage.setItem('currentSession', encrypted);
    } else {
        console.error('Failed to encrypt session');
    }
}

// Enhanced login with rate limiting and password hashing
async function login(username, password) {
    // Check rate limiting
    const rateLimit = checkRateLimit(username);
    if (!rateLimit.allowed) {
        return {
            success: false,
            error: rateLimit.message || 'Too many failed attempts. Please try again later.'
        };
    }

    const user = getUser(username);

    if (!user) {
        recordLoginAttempt(username, false);
        return { success: false, error: 'Invalid username or password' };
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    const isValid = user.passwordHash === passwordHash;

    if (!isValid) {
        recordLoginAttempt(username, false);
        const remaining = rateLimit.remaining - 1;
        const message = remaining > 0
            ? `Invalid username or password. ${remaining} attempt(s) remaining.`
            : 'Invalid username or password. Account will be locked after next failed attempt.';
        return { success: false, error: message };
    }

    // Successful login
    recordLoginAttempt(username, true);

    // Remove sensitive data from session
    const sessionUser = { ...user };
    delete sessionUser.passwordHash;
    delete sessionUser.password;

    setCurrentUser(sessionUser);

    return { success: true, user: sessionUser };
}

function logout() {
    localStorage.removeItem('currentSession');
    window.location.href = 'login';
}

function requireAuth() {
    const user = getCurrentUser();

    if (!user) {
        window.location.href = 'login';
        return null;
    }

    return user;
}

function requireAdmin() {
    const user = requireAuth();

    if (!user) return null;

    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index';
        return null;
    }

    return user;
}

// Check if user has access to a module
function hasModuleAccess(moduleName) {
    const user = getCurrentUser();
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    return user.modules && user.modules[moduleName] === true;
}

// User management (admin only) - with password hashing
async function createUser(userData) {
    const users = getUsers();

    if (users[userData.username]) {
        return { success: false, error: 'Username already exists' };
    }

    // Validate password strength
    if (!userData.password || userData.password.length < SECURITY_CONFIG.passwordMinLength) {
        return {
            success: false,
            error: `Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters long`
        };
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    const newUser = {
        username: userData.username,
        passwordHash: passwordHash,
        passwordVersion: 2,
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
        createdAt: new Date().toISOString()
    };

    users[userData.username] = newUser;
    saveUsers(users);

    return { success: true, user: newUser };
}

async function updateUser(username, updates) {
    const users = getUsers();
    const user = users[username];

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    // If password is being updated, hash it
    if (updates.password) {
        if (updates.password.length < SECURITY_CONFIG.passwordMinLength) {
            return {
                success: false,
                error: `Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters long`
            };
        }
        updates.passwordHash = await hashPassword(updates.password);
        updates.passwordVersion = 2;
        delete updates.password;
    }

    // Update user properties
    Object.keys(updates).forEach(key => {
        if (key !== 'username' && key !== 'createdAt') {
            user[key] = updates[key];
        }
    });

    users[username] = user;
    saveUsers(users);

    return { success: true, user: user };
}

function deleteUser(username) {
    if (username === 'admin') {
        return { success: false, error: 'Cannot delete admin user' };
    }

    const users = getUsers();

    if (!users[username]) {
        return { success: false, error: 'User not found' };
    }

    // Delete user's worksheets
    deleteUserWorksheets(username);

    // Clear any login attempts for this user
    localStorage.removeItem(`loginAttempts_${username}`);

    delete users[username];
    saveUsers(users);

    return { success: true };
}

function deleteUserWorksheets(username) {
    // Find and delete all worksheets belonging to this user
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(`worksheet_${username}_`)) {
            localStorage.removeItem(key);
        }
    });
}

function getAllUsers() {
    const users = getUsers();
    return Object.values(users).map(user => {
        const userCopy = { ...user };
        delete userCopy.passwordHash;
        delete userCopy.password;
        return userCopy;
    });
}

function getUserCount() {
    const users = getUsers();
    return Object.keys(users).length;
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

// Initialize auth system
initializeAuth();
