// Progress Dashboard - Full Version Only
// Visualizes child's worksheet completion progress across all modules

let currentParentEmail = null;
let selectedChildId = null;
let allChildren = [];

// Module information
const MODULE_INFO = {
    'math': { name: '📐 Mathematics', color: '#4CAF50' },
    'aptitude': { name: '🧩 Aptitude', color: '#2196F3' },
    'english': { name: '📚 English', color: '#FF9800' },
    'stories': { name: '📖 Stories', color: '#9C27B0' },
    'drawing': { name: '🎨 Drawing', color: '#F44336' },
    'eq': { name: '😊 Emotional Quotient', color: '#00BCD4' },
    'german': { name: '🇩🇪 German', color: '#795548' }
};

// Check if user is in Full version
function isFullVersion() {
    const child = allChildren.find(c => c.id === selectedChildId);
    if (!child) return false;
    return child.version === 'full';
}

// Initialize on page load
firebase.auth().onAuthStateChanged(async function(user) {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    currentParentEmail = user.email.toLowerCase();

    // Check user role
    const userDoc = await firebase.firestore().collection('users')
        .where('email', '==', currentParentEmail)
        .limit(1)
        .get();

    if (userDoc.empty) {
        alert('User not found');
        window.location.href = 'login.html';
        return;
    }

    const userData = userDoc.docs[0].data();

    // Only parents and admins can access progress dashboard
    if (userData.role !== 'parent' && userData.role !== 'admin') {
        alert('This feature is only available for parents and admins');
        window.location.href = 'index.html';
        return;
    }

    // Load children
    await loadChildren();
});

// Load all children for the parent
async function loadChildren() {
    try {
        const childrenSnapshot = await firebase.firestore().collection('children')
            .where('parentEmail', '==', currentParentEmail)
            .get();

        allChildren = childrenSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (allChildren.length === 0) {
            document.getElementById('loading').innerHTML = '<div class="no-data"><div class="no-data-icon">👶</div><p>No children profiles found</p><p style="margin-top: 10px;"><a href="children-profiles.html">Add a child profile</a></p></div>';
            return;
        }

        // Populate child selector
        const select = document.getElementById('child-select');
        select.innerHTML = allChildren.map(child =>
            `<option value="${child.id}">${child.name} (Age ${child.age})</option>`
        ).join('');

        // Auto-select first child
        selectedChildId = allChildren[0].id;
        select.value = selectedChildId;

        // Load progress data
        await loadProgressData();

    } catch (error) {
        console.error('Error loading children:', error);
        document.getElementById('loading').innerHTML = '<div class="no-data"><div class="no-data-icon">❌</div><p>Error loading children profiles</p></div>';
    }
}

// Load progress data for selected child
async function loadProgressData() {
    const selectElement = document.getElementById('child-select');
    selectedChildId = selectElement.value;

    if (!selectedChildId) return;

    // Check if Full version
    if (!isFullVersion()) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        document.getElementById('demo-notice').style.display = 'block';
        document.getElementById('stats-grid').style.display = 'none';
        document.getElementById('modules-section').style.display = 'none';
        document.getElementById('recent-activity').style.display = 'none';
        document.getElementById('no-data').style.display = 'none';

        document.querySelector('.dashboard-container').classList.add('loaded');
        return;
    }

    // Hide demo notice for Full version
    document.getElementById('demo-notice').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('content').style.display = 'none';

    try {
        const child = allChildren.find(c => c.id === selectedChildId);
        if (!child) return;

        // Get child's email (username)
        const childEmail = child.email || child.parentEmail; // Use child email if available

        // Fetch all worksheets for this child
        const worksheetsSnapshot = await firebase.firestore().collection('worksheets')
            .where('username', '==', childEmail)
            .get();

        const worksheets = worksheetsSnapshot.docs.map(doc => doc.data());

        // Show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';

        if (worksheets.length === 0) {
            document.getElementById('no-data').style.display = 'block';
            document.getElementById('stats-grid').style.display = 'none';
            document.getElementById('modules-section').style.display = 'none';
            document.getElementById('recent-activity').style.display = 'none';
        } else {
            document.getElementById('no-data').style.display = 'none';
            document.getElementById('stats-grid').style.display = 'grid';
            document.getElementById('modules-section').style.display = 'block';
            document.getElementById('recent-activity').style.display = 'block';

            // Process and display data
            displayOverallStats(worksheets);
            displayModuleProgress(worksheets);
            displayRecentActivity(worksheets);
        }

        document.querySelector('.dashboard-container').classList.add('loaded');

    } catch (error) {
        console.error('Error loading progress data:', error);
        document.getElementById('loading').innerHTML = '<div class="no-data"><div class="no-data-icon">❌</div><p>Error loading progress data</p></div>';
    }
}

// Display overall statistics
function displayOverallStats(worksheets) {
    const totalWorksheets = worksheets.filter(w => w.completed).length;

    // Count active modules (modules with at least one completed worksheet)
    const activeModules = new Set(worksheets.map(w => w.subject)).size;

    // Calculate total time
    let totalMinutes = 0;
    worksheets.forEach(w => {
        if (w.elapsedTime) {
            const parts = w.elapsedTime.split(':');
            if (parts.length === 2) {
                totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
            }
        }
    });
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    // Count this week's worksheets
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekCount = worksheets.filter(w => {
        if (!w.timestamp) return false;
        const worksheetDate = w.timestamp.toDate ? w.timestamp.toDate() : new Date(w.timestamp);
        return worksheetDate >= oneWeekAgo;
    }).length;

    // Update UI
    document.getElementById('total-worksheets').textContent = totalWorksheets;
    document.getElementById('modules-active').textContent = activeModules;
    document.getElementById('total-time').textContent = totalHours + 'h';
    document.getElementById('this-week').textContent = thisWeekCount;
}

// Display progress by module
function displayModuleProgress(worksheets) {
    const moduleContainer = document.getElementById('module-progress-container');
    moduleContainer.innerHTML = '';

    // Group worksheets by module
    const byModule = {};
    worksheets.forEach(w => {
        if (!byModule[w.subject]) {
            byModule[w.subject] = [];
        }
        byModule[w.subject].push(w);
    });

    // Display each module
    Object.keys(MODULE_INFO).forEach(moduleKey => {
        const moduleWorksheets = byModule[moduleKey] || [];
        const completedCount = moduleWorksheets.filter(w => w.completed).length;

        if (completedCount === 0) return; // Skip modules with no progress

        const moduleInfo = MODULE_INFO[moduleKey];

        // Estimate total possible worksheets (rough estimate)
        const totalPossible = estimateTotalWorksheets(moduleKey);
        const progressPercentage = Math.min(100, Math.round((completedCount / totalPossible) * 100));

        const moduleHtml = `
            <div class="module-progress">
                <div class="module-header">
                    <div class="module-name">${moduleInfo.name}</div>
                    <div class="module-stats">
                        <span>${completedCount} completed</span>
                    </div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progressPercentage}%; background: ${moduleInfo.color};">
                        ${progressPercentage}%
                    </div>
                </div>
                <div class="completed-list" id="module-${moduleKey}-list"></div>
            </div>
        `;

        moduleContainer.innerHTML += moduleHtml;

        // Add completed items
        const listContainer = document.getElementById(`module-${moduleKey}-list`);
        const completedItems = moduleWorksheets
            .filter(w => w.completed)
            .sort((a, b) => {
                const aDate = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                const bDate = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return bDate - aDate;
            })
            .slice(0, 12); // Show last 12 completed

        completedItems.forEach(w => {
            const badge = document.createElement('div');
            badge.className = 'level-badge';
            badge.innerHTML = `
                <span>${formatIdentifier(w.identifier)}</span>
                <span class="checkmark">✓</span>
            `;
            listContainer.appendChild(badge);
        });
    });
}

// Display recent activity
function displayRecentActivity(worksheets) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';

    // Sort by date (most recent first)
    const recentWorksheets = [...worksheets]
        .filter(w => w.timestamp)
        .sort((a, b) => {
            const aDate = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const bDate = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return bDate - aDate;
        })
        .slice(0, 10); // Show last 10 activities

    recentWorksheets.forEach(w => {
        const moduleInfo = MODULE_INFO[w.subject] || { name: w.subject, color: '#999' };
        const date = w.timestamp.toDate ? w.timestamp.toDate() : new Date(w.timestamp);
        const timeAgo = getTimeAgo(date);

        const activityHtml = `
            <div class="activity-item" style="border-left-color: ${moduleInfo.color}">
                <div class="activity-info">
                    <div class="activity-title">${moduleInfo.name}</div>
                    <div class="activity-details">
                        ${formatIdentifier(w.identifier)} • ${w.elapsedTime || 'N/A'}
                    </div>
                </div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;

        activityList.innerHTML += activityHtml;
    });
}

// Helper: Estimate total possible worksheets for a module
function estimateTotalWorksheets(moduleKey) {
    // Rough estimates based on module structure
    const estimates = {
        'math': 48,      // 4 operations × 12 levels
        'aptitude': 84,   // 7 types × 12 levels
        'english': 144,   // 12 types × 12 levels
        'stories': 18,    // 6 categories × 3 difficulties
        'drawing': 54,    // Estimated tutorials
        'eq': 72,         // Estimated scenarios
        'german': 45      // Estimated stories
    };
    return estimates[moduleKey] || 50;
}

// Helper: Format worksheet identifier for display
function formatIdentifier(identifier) {
    if (!identifier) return 'Unknown';

    // Clean up identifier
    return identifier
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .substring(0, 30); // Limit length
}

// Helper: Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    if (seconds < 2592000) return Math.floor(seconds / 604800) + ' weeks ago';
    return Math.floor(seconds / 2592000) + ' months ago';
}

console.log('Progress dashboard loaded');
