// Authentication System
// Handles user login, session management, and permissions

// Initialize default admin user if not exists
function initializeAuth() {
    const users = getUsers();

    // Create default admin if no users exist
    if (Object.keys(users).length === 0) {
        const defaultAdmin = {
            username: 'admin',
            password: 'admin123', // In production, this should be hashed
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
            createdAt: new Date().toISOString()
        };

        users['admin'] = defaultAdmin;
        saveUsers(users);
        console.log('Default admin user created: admin / admin123');
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

// Session management
function getCurrentUser() {
    const sessionJson = localStorage.getItem('currentSession');
    if (!sessionJson) return null;

    const session = JSON.parse(sessionJson);

    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - new Date(session.loginTime).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
        logout();
        return null;
    }

    return session.user;
}

function setCurrentUser(user) {
    const session = {
        user: user,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('currentSession', JSON.stringify(session));
}

function login(username, password) {
    const user = getUser(username);

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    if (user.password !== password) {
        return { success: false, error: 'Incorrect password' };
    }

    // Remove password from session
    const sessionUser = { ...user };
    delete sessionUser.password;

    setCurrentUser(sessionUser);

    return { success: true, user: sessionUser };
}

function logout() {
    localStorage.removeItem('currentSession');
    window.location.href = 'login.html';
}

function requireAuth() {
    const user = getCurrentUser();

    if (!user) {
        // Redirect to login page
        window.location.href = 'login.html';
        return null;
    }

    return user;
}

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

// Check if user has access to a module
function hasModuleAccess(moduleName) {
    const user = getCurrentUser();
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    return user.modules && user.modules[moduleName] === true;
}

// User management (admin only)
function createUser(userData) {
    const users = getUsers();

    if (users[userData.username]) {
        return { success: false, error: 'Username already exists' };
    }

    const newUser = {
        username: userData.username,
        password: userData.password,
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

function updateUser(username, updates) {
    const users = getUsers();
    const user = users[username];

    if (!user) {
        return { success: false, error: 'User not found' };
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
        delete userCopy.password; // Don't expose passwords
        return userCopy;
    });
}

function getUserCount() {
    const users = getUsers();
    return Object.keys(users).length;
}

// Initialize auth system
initializeAuth();
