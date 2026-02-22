/**
 * Page Access Control Cloud Functions
 *
 * Server-side enforcement of which pages a child can access.
 * Prevents client-side tampering with page access.
 *
 * Functions:
 *   - checkPageAccess (callable)
 *   - getAccessiblePages (callable)
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

const DEMO_PAGE_COUNT = 2;
const MATH_MAX_PAGES = 150;
const ENGLISH_MAX_PAGES = 50;

// ============================================================================
// HELPER: Get current week string
// ============================================================================

function getWeekString(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ============================================================================
// HELPER: Check lockout status
// ============================================================================

async function checkLockoutForChild(db, childId) {
    const snapshot = await db.collection('weekly_assignments')
        .where('childId', '==', childId)
        .orderBy('createdAt', 'desc')
        .limit(2)
        .get();

    if (snapshot.size < 2) {
        return { locked: false, consecutiveWeeks: 0 };
    }

    const docs = snapshot.docs.map(d => d.data());
    const allIncomplete = docs.every(a => a.status !== 'completed');

    return {
        locked: allIncomplete,
        consecutiveWeeks: allIncomplete ? 2 : 0
    };
}

// ============================================================================
// FUNCTION: checkPageAccess
// ============================================================================

const checkPageAccess = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, module, absolutePage } = request.data;

        if (!childId || !module || !absolutePage) {
            throw new HttpsError('invalid-argument', 'Missing required fields');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        // Check user role
        const userDoc = await db.collection('users').doc(callerUid).get();
        const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

        // Admin: unrestricted
        if (isAdmin) {
            return { allowed: true, reason: 'Admin access' };
        }

        // Verify caller owns this child
        const childDoc = await db.collection('children').doc(childId).get();
        if (!childDoc.exists) {
            throw new HttpsError('not-found', 'Child not found');
        }

        const childData = childDoc.data();
        if (childData.parent_uid !== callerUid) {
            throw new HttpsError('permission-denied', 'Not authorized for this child');
        }

        // Demo mode check
        const parentDoc = await db.collection('users').doc(callerUid).get();
        const parentData = parentDoc.exists ? parentDoc.data() : {};
        const isDemoUser = parentData.version === 'demo' || parentData.accountType === 'demo';

        if (isDemoUser) {
            if (absolutePage > DEMO_PAGE_COUNT) {
                return { allowed: false, reason: 'Demo users can only access first 2 pages. Upgrade for full access.' };
            }
            return { allowed: true, reason: 'Demo access' };
        }

        // Full version: check weekly assignment
        const weekStr = getWeekString(new Date());
        const docId = `${childId}_${weekStr}`;
        const assignmentDoc = await db.collection('weekly_assignments').doc(docId).get();

        if (!assignmentDoc.exists) {
            // Check lockout
            const lockout = await checkLockoutForChild(db, childId);
            if (lockout.locked) {
                return { allowed: false, reason: 'Worksheets paused due to incomplete weeks' };
            }
            return { allowed: false, reason: 'No assignment for this week' };
        }

        const assignment = assignmentDoc.data();
        const maxPages = module === 'math' ? MATH_MAX_PAGES : ENGLISH_MAX_PAGES;

        // Extract assigned pages
        let assignedPages = [];
        if (module === 'math' && assignment.math && assignment.math.pages) {
            assignedPages = assignment.math.pages.map(p => p.absolutePage);
        } else if (module === 'english' && assignment.english && assignment.english.pages) {
            assignedPages = assignment.english.pages.map(p => p.pageIndex);
        }

        if (assignedPages.includes(absolutePage)) {
            return { allowed: true, reason: 'Page in weekly assignment' };
        }

        return { allowed: false, reason: 'Page not in current weekly assignment' };
    }
);

// ============================================================================
// FUNCTION: getAccessiblePages
// ============================================================================

const getAccessiblePages = onCall(
    { region: 'europe-west1', memory: '256MiB' },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be logged in');
        }

        const { childId, module } = request.data;
        const moduleKey = module || 'math';

        if (!childId) {
            throw new HttpsError('invalid-argument', 'Missing childId');
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;
        const maxPages = moduleKey === 'math' ? MATH_MAX_PAGES : ENGLISH_MAX_PAGES;

        // Check user role
        const userDoc = await db.collection('users').doc(callerUid).get();
        const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

        // Admin: all pages
        if (isAdmin) {
            const allPages = [];
            for (let i = 1; i <= maxPages; i++) allPages.push(i);
            return {
                pages: allPages,
                minPage: 1,
                maxPage: maxPages,
                totalAccessible: maxPages,
                mode: 'admin',
                pending: false
            };
        }

        // Verify caller owns this child
        const childDoc = await db.collection('children').doc(childId).get();
        if (!childDoc.exists) {
            throw new HttpsError('not-found', 'Child not found');
        }

        const childData = childDoc.data();
        if (childData.parent_uid !== callerUid) {
            throw new HttpsError('permission-denied', 'Not authorized for this child');
        }

        // Demo mode
        const parentDoc = await db.collection('users').doc(callerUid).get();
        const parentData = parentDoc.exists ? parentDoc.data() : {};
        const isDemoUser = parentData.version === 'demo' || parentData.accountType === 'demo';

        if (isDemoUser) {
            const pages = [];
            for (let i = 1; i <= DEMO_PAGE_COUNT; i++) pages.push(i);
            return {
                pages,
                minPage: 1,
                maxPage: DEMO_PAGE_COUNT,
                totalAccessible: DEMO_PAGE_COUNT,
                mode: 'demo',
                pending: false
            };
        }

        // Full version: get weekly assignment
        const weekStr = getWeekString(new Date());
        const docId = `${childId}_${weekStr}`;
        const assignmentDoc = await db.collection('weekly_assignments').doc(docId).get();

        if (!assignmentDoc.exists) {
            // Check lockout
            const lockout = await checkLockoutForChild(db, childId);
            if (lockout.locked) {
                return {
                    pages: [],
                    minPage: 0,
                    maxPage: 0,
                    totalAccessible: 0,
                    mode: 'full',
                    pending: true,
                    pendingReason: 'lockout',
                    lockoutWeeks: lockout.consecutiveWeeks
                };
            }

            return {
                pages: [],
                minPage: 0,
                maxPage: 0,
                totalAccessible: 0,
                mode: 'full',
                pending: true,
                pendingReason: 'no_assignment'
            };
        }

        const assignment = assignmentDoc.data();
        let pages = [];

        if (moduleKey === 'math' && assignment.math && assignment.math.pages) {
            pages = assignment.math.pages.map(p => p.absolutePage).sort((a, b) => a - b);
        } else if (moduleKey === 'english' && assignment.english && assignment.english.pages) {
            pages = assignment.english.pages.map(p => p.pageIndex).sort((a, b) => a - b);
        }

        if (pages.length === 0) {
            return {
                pages: [],
                minPage: 0,
                maxPage: 0,
                totalAccessible: 0,
                mode: 'full',
                pending: true,
                pendingReason: 'no_pages'
            };
        }

        return {
            pages,
            minPage: pages[0],
            maxPage: pages[pages.length - 1],
            totalAccessible: pages.length,
            mode: 'full',
            pending: false
        };
    }
);

module.exports = {
    checkPageAccess,
    getAccessiblePages
};
