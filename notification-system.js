// Notification System for GleeGrow
// Provides bell icon with blue dot badge, dropdown panel, Firestore real-time updates

// ============================================================================
// CONFIGURATION
// ============================================================================

const NOTIFICATION_CONFIG = {
    MAX_NOTIFICATIONS: 10,
    EXPIRY_DAYS: 30,
    TYPES: {
        NEW_SHEETS: 'new_sheets',
        INCOMPLETE_WARNING: 'incomplete_warning',
        LOCKOUT: 'lockout',
        REMINDER: 'reminder'
    }
};

// ============================================================================
// STATE
// ============================================================================

let _notificationListener = null;
let _notifications = [];
let _notificationPanelOpen = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize notification system with Firestore real-time listener.
 * @param {string} childId - Current child ID
 * @param {string} parentUid - Parent's Firebase UID
 */
function initializeNotifications(childId, parentUid) {
    if (!childId || !parentUid) return;

    // Clean up previous listener
    if (_notificationListener) {
        _notificationListener();
        _notificationListener = null;
    }

    // Listen for real-time notification updates
    _notificationListener = firebase.firestore()
        .collection('notifications')
        .where('childId', '==', childId)
        .where('dismissed', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(NOTIFICATION_CONFIG.MAX_NOTIFICATIONS)
        .onSnapshot(snapshot => {
            _notifications = [];
            snapshot.forEach(doc => {
                _notifications.push({ id: doc.id, ...doc.data() });
            });
            updateNotificationBadge();
            if (_notificationPanelOpen) {
                renderNotificationPanel();
            }
        }, error => {
            console.warn('Notification listener error:', error.message);
            // Fallback: load once without real-time
            loadNotifications(childId);
        });
}

/**
 * Fallback: load notifications once (no real-time).
 * @param {string} childId
 */
async function loadNotifications(childId) {
    if (!childId) return;

    try {
        const snapshot = await firebase.firestore()
            .collection('notifications')
            .where('childId', '==', childId)
            .where('dismissed', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(NOTIFICATION_CONFIG.MAX_NOTIFICATIONS)
            .get();

        _notifications = [];
        snapshot.forEach(doc => {
            _notifications.push({ id: doc.id, ...doc.data() });
        });
        updateNotificationBadge();
    } catch (error) {
        console.warn('Failed to load notifications:', error.message);
    }
}

// ============================================================================
// UI: BELL + BADGE
// ============================================================================

/**
 * Render the notification bell into the given container.
 * @param {HTMLElement} container
 */
function renderNotificationBell(container) {
    if (!container) return;

    const unreadCount = _notifications.filter(n => !n.read).length;

    container.innerHTML = `
        <div class="notification-bell-wrapper" id="notification-bell-wrapper">
            <button class="notification-bell-btn" onclick="toggleNotificationPanel()" title="Notifications">
                <span class="bell-icon">&#128276;</span>
                ${unreadCount > 0 ? `<span class="notification-badge" id="notification-badge">${unreadCount > 9 ? '9+' : unreadCount}</span>` : ''}
            </button>
            <div class="notification-panel" id="notification-panel" style="display: none;"></div>
        </div>
    `;
}

/**
 * Update the badge count without re-rendering the entire bell.
 */
function updateNotificationBadge() {
    const unreadCount = _notifications.filter(n => !n.read).length;
    const wrapper = document.getElementById('notification-bell-wrapper');
    if (!wrapper) return;

    const btn = wrapper.querySelector('.notification-bell-btn');
    if (!btn) return;

    // Update or create badge
    let badge = btn.querySelector('.notification-badge');
    if (unreadCount > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.id = 'notification-badge';
            btn.appendChild(badge);
        }
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    } else if (badge) {
        badge.remove();
    }
}

// ============================================================================
// UI: NOTIFICATION PANEL
// ============================================================================

/**
 * Toggle notification dropdown panel.
 */
function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;

    _notificationPanelOpen = !_notificationPanelOpen;

    if (_notificationPanelOpen) {
        renderNotificationPanel();
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

/**
 * Render notification items inside the panel.
 */
function renderNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;

    if (_notifications.length === 0) {
        panel.innerHTML = `
            <div class="notification-empty">
                <span style="font-size: 2em;">&#128276;</span>
                <p>No notifications</p>
            </div>
        `;
        return;
    }

    const items = _notifications.map(n => {
        const icon = getNotificationIcon(n.type);
        const timeAgo = formatTimeAgo(n.createdAt);
        const unreadClass = n.read ? '' : ' unread';

        return `
            <div class="notification-item${unreadClass}" data-id="${n.id}">
                <div class="notification-item-content" onclick="handleNotificationClick('${n.id}')">
                    <span class="notification-icon">${icon}</span>
                    <div class="notification-text">
                        <div class="notification-title">${escapeHtml(n.title || '')}</div>
                        <div class="notification-message">${escapeHtml(n.message || '')}</div>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                </div>
                <button class="notification-dismiss" onclick="event.stopPropagation(); dismissNotification('${n.id}')" title="Dismiss">&#10005;</button>
            </div>
        `;
    }).join('');

    panel.innerHTML = `
        <div class="notification-panel-header">
            <span>Notifications</span>
            ${_notifications.some(n => !n.read) ? '<button class="mark-all-read-btn" onclick="markAllAsRead()">Mark all read</button>' : ''}
        </div>
        <div class="notification-list">${items}</div>
    `;
}

/**
 * Get icon for notification type.
 */
function getNotificationIcon(type) {
    switch (type) {
        case NOTIFICATION_CONFIG.TYPES.NEW_SHEETS: return '&#128214;';
        case NOTIFICATION_CONFIG.TYPES.INCOMPLETE_WARNING: return '&#9888;&#65039;';
        case NOTIFICATION_CONFIG.TYPES.LOCKOUT: return '&#128274;';
        case NOTIFICATION_CONFIG.TYPES.REMINDER: return '&#128276;';
        default: return '&#128172;';
    }
}

/**
 * Format a Firestore timestamp or ISO string to relative time.
 */
function formatTimeAgo(timestamp) {
    if (!timestamp) return '';

    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        return '';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Handle clicking a notification — mark read, close panel, navigate.
 * @param {string} notificationId
 */
async function handleNotificationClick(notificationId) {
    const notification = _notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Mark as read
    await markAsRead(notificationId);

    // Close panel
    _notificationPanelOpen = false;
    const panel = document.getElementById('notification-panel');
    if (panel) panel.style.display = 'none';

    // Navigate if there's an action URL
    if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
    }
}

/**
 * Mark a single notification as read.
 * @param {string} notificationId
 */
async function markAsRead(notificationId) {
    try {
        await firebase.firestore()
            .collection('notifications')
            .doc(notificationId)
            .update({ read: true });

        // Update local state
        const n = _notifications.find(n => n.id === notificationId);
        if (n) n.read = true;
        updateNotificationBadge();
    } catch (error) {
        console.warn('Failed to mark notification as read:', error.message);
    }
}

/**
 * Mark all notifications as read.
 */
async function markAllAsRead() {
    const unread = _notifications.filter(n => !n.read);
    const batch = firebase.firestore().batch();

    unread.forEach(n => {
        const ref = firebase.firestore().collection('notifications').doc(n.id);
        batch.update(ref, { read: true });
        n.read = true;
    });

    try {
        await batch.commit();
        updateNotificationBadge();
        renderNotificationPanel();
    } catch (error) {
        console.warn('Failed to mark all as read:', error.message);
    }
}

/**
 * Dismiss (hide) a notification.
 * @param {string} notificationId
 */
async function dismissNotification(notificationId) {
    try {
        await firebase.firestore()
            .collection('notifications')
            .doc(notificationId)
            .update({ dismissed: true });

        // Remove from local state
        _notifications = _notifications.filter(n => n.id !== notificationId);
        updateNotificationBadge();
        renderNotificationPanel();
    } catch (error) {
        console.warn('Failed to dismiss notification:', error.message);
    }
}

// ============================================================================
// CREATE NOTIFICATIONS
// ============================================================================

/**
 * Create a new notification in Firestore.
 * Deduplicates by type + childId + week (won't create duplicate new_sheets for same week).
 * @param {string} childId
 * @param {string} parentUid
 * @param {string} type - One of NOTIFICATION_CONFIG.TYPES
 * @param {string} title
 * @param {string} message
 * @param {string} actionUrl - URL to navigate to on click
 * @param {object} actionData - Additional data
 */
async function createNotification(childId, parentUid, type, title, message, actionUrl, actionData) {
    if (!childId || !parentUid) return;

    // Dedup: check for existing notification of same type this week
    const weekStr = typeof getWeekString === 'function' ? getWeekString(new Date()) : '';
    const dedupId = `${childId}_${type}_${weekStr}`;

    try {
        const existing = await firebase.firestore()
            .collection('notifications')
            .doc(dedupId)
            .get();

        if (existing.exists) {
            console.log('Notification already exists:', dedupId);
            return;
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + NOTIFICATION_CONFIG.EXPIRY_DAYS);

        await firebase.firestore()
            .collection('notifications')
            .doc(dedupId)
            .set({
                childId,
                parentUid,
                type,
                title,
                message,
                actionUrl: actionUrl || '',
                actionData: actionData || {},
                read: false,
                dismissed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: expiresAt.toISOString()
            });

        console.log('Notification created:', type, title);
    } catch (error) {
        console.warn('Failed to create notification:', error.message);
    }
}

// ============================================================================
// CLOSE PANEL ON OUTSIDE CLICK
// ============================================================================

document.addEventListener('click', function(event) {
    const wrapper = document.getElementById('notification-bell-wrapper');
    if (!wrapper) return;

    if (!wrapper.contains(event.target) && _notificationPanelOpen) {
        _notificationPanelOpen = false;
        const panel = document.getElementById('notification-panel');
        if (panel) panel.style.display = 'none';
    }
});

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Stop listening for notifications (call on logout or child switch).
 */
function cleanupNotifications() {
    if (_notificationListener) {
        _notificationListener();
        _notificationListener = null;
    }
    _notifications = [];
    _notificationPanelOpen = false;
}

// ============================================================================
// STYLES (injected, same pattern as profile-selector.js)
// ============================================================================

const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    /* Notification Bell */
    .notification-bell-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
    }

    .notification-bell-btn {
        background: transparent;
        border: 2px solid white;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.3em;
        padding: 6px 10px;
        position: relative;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .notification-bell-btn:hover {
        background: white;
        color: #667eea;
    }

    .bell-icon {
        line-height: 1;
    }

    /* Blue dot badge */
    .notification-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #007bff;
        color: white;
        font-size: 0.55em;
        font-weight: bold;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        box-shadow: 0 2px 6px rgba(0, 123, 255, 0.5);
        animation: notificationPulse 2s ease-in-out infinite;
    }

    @keyframes notificationPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
    }

    /* Notification Panel */
    .notification-panel {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        min-width: 320px;
        max-height: 420px;
        overflow: hidden;
        z-index: 1001;
        animation: slideDown 0.2s ease-out;
    }

    .notification-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        border-bottom: 1px solid #f0f0f0;
        font-weight: bold;
        color: #333;
        font-size: 0.95em;
    }

    .mark-all-read-btn {
        background: none;
        border: none;
        color: #007bff;
        cursor: pointer;
        font-size: 0.8em;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
    }

    .mark-all-read-btn:hover {
        background: #e7f1ff;
    }

    .notification-list {
        max-height: 350px;
        overflow-y: auto;
    }

    /* Notification Item */
    .notification-item {
        display: flex;
        align-items: flex-start;
        padding: 12px 16px;
        border-bottom: 1px solid #f5f5f5;
        transition: background 0.2s;
        cursor: pointer;
    }

    .notification-item:last-child {
        border-bottom: none;
    }

    .notification-item:hover {
        background: #f8f9fa;
    }

    .notification-item.unread {
        border-left: 3px solid #007bff;
        background: #f0f7ff;
    }

    .notification-item-content {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        flex: 1;
        min-width: 0;
    }

    .notification-icon {
        font-size: 1.4em;
        flex-shrink: 0;
        margin-top: 2px;
    }

    .notification-text {
        flex: 1;
        min-width: 0;
    }

    .notification-title {
        font-weight: 600;
        font-size: 0.9em;
        color: #333;
        margin-bottom: 2px;
    }

    .notification-message {
        font-size: 0.82em;
        color: #666;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .notification-time {
        font-size: 0.75em;
        color: #999;
        margin-top: 4px;
    }

    .notification-dismiss {
        background: none;
        border: none;
        color: #ccc;
        cursor: pointer;
        font-size: 0.85em;
        padding: 4px 6px;
        border-radius: 4px;
        transition: all 0.2s;
        flex-shrink: 0;
        margin-left: 4px;
    }

    .notification-dismiss:hover {
        color: #999;
        background: #f0f0f0;
    }

    /* Empty state */
    .notification-empty {
        padding: 30px 20px;
        text-align: center;
        color: #999;
    }

    .notification-empty p {
        margin: 8px 0 0;
        font-size: 0.9em;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .notification-panel {
            min-width: 280px;
            right: -40px;
        }
    }

    @media (max-width: 480px) {
        .notification-panel {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            min-width: auto;
            max-height: 60vh;
            border-radius: 16px 16px 0 0;
            margin-top: 0;
        }

        .notification-bell-btn {
            padding: 5px 8px;
            font-size: 1.1em;
        }
    }
`;

document.head.appendChild(notificationStyles);

console.log('Notification system loaded');
