/**
 * GleeGrow Cloud Functions (2nd gen / v2 API)
 *
 * Scheduled Functions:
 *   1. scheduledWeeklyGeneration — Monday 4pm: generate weekly assignments for all children
 *   2. scheduledEmailReminder — Daily 5pm: send email reminders for incomplete worksheets
 *
 * Callable Functions (server-side validation):
 *   3. validateMathSubmission — Server-authoritative math answer validation
 *   4. validateEnglishSubmission — Server-authoritative English completion validation
 *   5. validateAptitudeSubmission — Server-authoritative aptitude answer validation
 *   6. checkPageAccess — Server-side page access control
 *   7. getAccessiblePages — Server-authoritative accessible page list
 *   8. submitAssessment — Server-side assessment grading and level assignment
 *   9. submitLevelTest — Server-side level test grading and advancement
 *  10. checkLevelTestEligibility — Server-side eligibility check
 *
 * Deployment:
 *   firebase deploy --only functions
 *
 * Configuration:
 *   Create functions/.env with:
 *     SENDGRID_KEY=SG.your_key_here
 *     SENDGRID_FROM_EMAIL=noreply@gleegrow.com
 *     APP_URL=https://worksheets-app-76ee9.web.app
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineString } = require('firebase-functions/params');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

admin.initializeApp();

const db = admin.firestore();

// ============================================================================
// CONFIGURATION (all from functions/.env)
// ============================================================================

const SENDGRID_KEY = defineString('SENDGRID_KEY', { default: '' });
const SENDGRID_FROM_EMAIL = defineString('SENDGRID_FROM_EMAIL', { default: 'noreply@gleegrow.com' });
const APP_URL = defineString('APP_URL', { default: 'https://worksheets-app-76ee9.web.app' });

// ============================================================================
// WEEK UTILITIES (mirrored from client weekly-assignments.js)
// ============================================================================

function getWeekString(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekEnd(date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}

// ============================================================================
// AGE HELPERS
// ============================================================================

const AGE_TO_GROUP = {
    '4': '4-5', '5': '4-5',
    '6': '6', '7': '7', '8': '8',
    '9': '9+', '10': '10+', '11': '10+', '12': '10+', '13': '10+'
};

function getAgeGroupFromAge(age) {
    return AGE_TO_GROUP[String(age)] || '6';
}

function getOperationForAge(age) {
    if (age <= 6) return 'addition';
    if (age <= 7) return 'subtraction';
    if (age <= 8) return 'multiplication';
    return 'division';
}

// ============================================================================
// LOCKOUT CHECK (server-side)
// ============================================================================

/**
 * Check if a child has 2+ consecutive incomplete weeks.
 * @param {string} childId
 * @returns {Promise<{locked: boolean, consecutiveWeeks: number}>}
 */
async function checkLockoutForChild(childId) {
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
// ASSIGNMENT GENERATION (server-side mirror)
// ============================================================================

const MATH_PAGES_PER_WEEK = 7;
const ENGLISH_PAGES_PER_WEEK = 7;
const MAX_MATH_PAGES = 150;
const MAX_ENGLISH_PAGES = 50;

function generateAssignmentServer(child, weekStr, previousAssignment) {
    const age = child.age || 6;
    const ageGroup = getAgeGroupFromAge(age);

    let mathStartPage = 1;
    let mathDifficulty = 'easy';
    let mathOperation = getOperationForAge(age);

    if (previousAssignment && previousAssignment.math && previousAssignment.math.pages.length > 0) {
        const prevPages = previousAssignment.math.pages;
        const lastPage = Math.max(...prevPages.map(p => p.absolutePage));
        mathStartPage = lastPage + 1;
        mathOperation = previousAssignment.math.operation || mathOperation;
        mathDifficulty = previousAssignment.math.difficulty || 'easy';

        if (mathStartPage > MAX_MATH_PAGES) {
            if (mathDifficulty === 'easy') {
                mathDifficulty = 'medium';
                mathStartPage = 51;
            } else if (mathDifficulty === 'medium') {
                mathDifficulty = 'hard';
                mathStartPage = 101;
            } else {
                mathDifficulty = 'easy';
                mathStartPage = 1;
            }
        }
    }

    const mathPages = [];
    for (let i = 0; i < MATH_PAGES_PER_WEEK; i++) {
        const page = mathStartPage + i;
        if (page <= MAX_MATH_PAGES) {
            mathPages.push({ absolutePage: page, operation: mathOperation, completed: false, score: 0 });
        }
    }

    let englishStartPage = 1;
    let englishDifficulty = 'easy';
    let englishAgeGroup = ageGroup;

    if (previousAssignment && previousAssignment.english && previousAssignment.english.pages.length > 0) {
        const prevPages = previousAssignment.english.pages;
        const lastPage = Math.max(...prevPages.map(p => p.pageIndex));
        englishStartPage = lastPage + 1;
        englishDifficulty = previousAssignment.english.difficulty || 'easy';
        englishAgeGroup = previousAssignment.english.ageGroup || ageGroup;

        if (englishStartPage > MAX_ENGLISH_PAGES) {
            if (englishDifficulty === 'easy') {
                englishDifficulty = 'medium';
                englishStartPage = 1;
            } else if (englishDifficulty === 'medium') {
                englishDifficulty = 'hard';
                englishStartPage = 1;
            } else {
                englishDifficulty = 'easy';
                englishStartPage = 1;
            }
        }
    }

    const englishPages = [];
    for (let i = 0; i < ENGLISH_PAGES_PER_WEEK; i++) {
        const pageIndex = englishStartPage + i;
        if (pageIndex <= MAX_ENGLISH_PAGES) {
            englishPages.push({ pageIndex, ageGroup: englishAgeGroup, difficulty: englishDifficulty, completed: false, score: 0 });
        }
    }

    const now = new Date();

    return {
        childId: child.id,
        childName: child.name || '',
        week: weekStr,
        weekStart: getWeekStart(now).toISOString(),
        weekEnd: getWeekEnd(now).toISOString(),
        math: {
            operation: mathOperation,
            difficulty: mathDifficulty,
            ageGroup,
            pages: mathPages,
            completedCount: 0,
            totalPages: mathPages.length
        },
        english: {
            ageGroup: englishAgeGroup,
            difficulty: englishDifficulty,
            pages: englishPages,
            completedCount: 0,
            totalPages: englishPages.length
        },
        status: 'active',
        generatedBy: 'cloud_function',
        notificationSent: true,
        createdAt: FieldValue.serverTimestamp()
    };
}

// ============================================================================
// FUNCTION 1: SCHEDULED WEEKLY GENERATION
// Every Monday at 4pm Europe/Berlin
// ============================================================================

exports.scheduledWeeklyGeneration = onSchedule(
    {
        schedule: '0 16 * * 1',
        timeZone: 'Europe/Berlin',
        timeoutSeconds: 540,
    },
    async (event) => {
        logger.log('Running scheduled weekly assignment generation...');

        const weekStr = getWeekString(new Date());

        try {
            // Get all children
            const childrenSnapshot = await db.collection('children').get();

            if (childrenSnapshot.empty) {
                logger.log('No children found.');
                return;
            }

            let generated = 0;
            let locked = 0;
            let skipped = 0;

            for (const childDoc of childrenSnapshot.docs) {
                const child = { id: childDoc.id, ...childDoc.data() };
                const docId = `${child.id}_${weekStr}`;

                // Skip if assignment already exists
                const existing = await db.collection('weekly_assignments').doc(docId).get();
                if (existing.exists) {
                    skipped++;
                    continue;
                }

                // Check lockout
                const lockoutStatus = await checkLockoutForChild(child.id);
                if (lockoutStatus.locked) {
                    locked++;

                    // Create lockout notification
                    const notifId = `${child.id}_lockout_${weekStr}`;
                    await db.collection('notifications').doc(notifId).set({
                        childId: child.id,
                        parentUid: child.parent_uid,
                        type: 'lockout',
                        title: 'Worksheets Paused',
                        message: `${child.name}'s worksheets are paused because 2+ weeks are incomplete. Complete previous weeks first.`,
                        actionUrl: '',
                        actionData: {},
                        read: false,
                        dismissed: false,
                        createdAt: FieldValue.serverTimestamp(),
                        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString()
                    });

                    logger.log(`Lockout for child ${child.name} (${child.id})`);
                    continue;
                }

                // Get previous assignment for page continuation
                let previousAssignment = null;
                const prevSnapshot = await db.collection('weekly_assignments')
                    .where('childId', '==', child.id)
                    .orderBy('createdAt', 'desc')
                    .limit(1)
                    .get();

                if (!prevSnapshot.empty) {
                    previousAssignment = prevSnapshot.docs[0].data();
                }

                // Generate assignment
                const assignment = generateAssignmentServer(child, weekStr, previousAssignment);
                await db.collection('weekly_assignments').doc(docId).set(assignment);

                // Create new_sheets notification
                const notifId = `${child.id}_new_sheets_${weekStr}`;
                await db.collection('notifications').doc(notifId).set({
                    childId: child.id,
                    parentUid: child.parent_uid,
                    type: 'new_sheets',
                    title: 'New Worksheets Ready!',
                    message: `${child.name} has ${MATH_PAGES_PER_WEEK} Math and ${ENGLISH_PAGES_PER_WEEK} English pages for this week.`,
                    actionUrl: 'index.html',
                    actionData: { weekStr },
                    read: false,
                    dismissed: false,
                    createdAt: FieldValue.serverTimestamp(),
                    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString()
                });

                generated++;
                logger.log(`Generated assignment for ${child.name}: ${weekStr}`);
            }

            logger.log(`Weekly generation complete: ${generated} generated, ${locked} locked, ${skipped} skipped`);

        } catch (error) {
            logger.error('Error in scheduledWeeklyGeneration:', error);
        }
    }
);

// ============================================================================
// FUNCTION 2: DAILY EMAIL REMINDER
// Every day at 5pm Europe/Berlin
// ============================================================================

exports.scheduledEmailReminder = onSchedule(
    {
        schedule: '0 17 * * *',
        timeZone: 'Europe/Berlin',
        timeoutSeconds: 540,
    },
    async (event) => {
        logger.log('Running daily email reminder...');

        // Load SendGrid
        let sgMail;
        try {
            sgMail = require('@sendgrid/mail');
            const sendgridKey = SENDGRID_KEY.value();
            if (!sendgridKey) {
                logger.warn('SendGrid key not configured. Skipping email reminders.');
                logger.warn('Set it with: firebase functions:secrets:set SENDGRID_KEY');
                return;
            }
            sgMail.setApiKey(sendgridKey);
        } catch (err) {
            logger.error('Failed to load SendGrid:', err.message);
            return;
        }

        const fromEmail = SENDGRID_FROM_EMAIL.value();
        const appUrl = APP_URL.value();

        const weekStr = getWeekString(new Date());
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        try {
            // Find all active (incomplete) assignments for this week
            const assignments = await db.collection('weekly_assignments')
                .where('week', '==', weekStr)
                .where('status', '==', 'active')
                .get();

            if (assignments.empty) {
                logger.log('No incomplete assignments for this week.');
                return;
            }

            let emailsSent = 0;
            let emailsSkipped = 0;

            for (const assignDoc of assignments.docs) {
                const assignment = assignDoc.data();
                const childId = assignment.childId;

                // Calculate missing sheets
                const mathMissing = (assignment.math.totalPages || 7) - (assignment.math.completedCount || 0);
                const englishMissing = (assignment.english.totalPages || 7) - (assignment.english.completedCount || 0);

                if (mathMissing <= 0 && englishMissing <= 0) continue;

                // Look up child
                const childDoc = await db.collection('children').doc(childId).get();
                if (!childDoc.exists) continue;
                const child = childDoc.data();

                // Look up parent
                const parentUid = child.parent_uid;
                if (!parentUid) continue;

                const parentDoc = await db.collection('users').doc(parentUid).get();
                if (!parentDoc.exists) continue;
                const parent = parentDoc.data();

                if (!parent.email) continue;

                // Dedup check
                const dedupId = `${parentUid}_${childId}_${weekStr}_reminder_${today}`;
                const existingLog = await db.collection('email_log').doc(dedupId).get();
                if (existingLog.exists) {
                    emailsSkipped++;
                    continue;
                }

                // Send email
                try {
                    await sendReminderEmail(
                        sgMail, fromEmail, appUrl,
                        parent.email, parent.fullName || parent.username || 'Parent',
                        child.name || 'Your child',
                        mathMissing, englishMissing, weekStr
                    );

                    // Write dedup record
                    await db.collection('email_log').doc(dedupId).set({
                        parentUid,
                        parentEmail: parent.email,
                        childId,
                        childName: child.name || '',
                        weekStr,
                        type: 'reminder',
                        dateSent: today,
                        sentAt: FieldValue.serverTimestamp(),
                        missedSheets: { math: mathMissing, english: englishMissing },
                        status: 'sent'
                    });

                    // Create in-app reminder notification
                    const notifId = `${childId}_reminder_${weekStr}_${today}`;
                    const existingNotif = await db.collection('notifications').doc(notifId).get();
                    if (!existingNotif.exists) {
                        await db.collection('notifications').doc(notifId).set({
                            childId,
                            parentUid,
                            type: 'reminder',
                            title: 'Daily Reminder',
                            message: `${child.name} has ${mathMissing} Math and ${englishMissing} English pages remaining this week.`,
                            actionUrl: 'index.html',
                            actionData: { weekStr },
                            read: false,
                            dismissed: false,
                            createdAt: FieldValue.serverTimestamp(),
                            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
                        });
                    }

                    emailsSent++;
                    logger.log(`Email sent to ${parent.email} for child ${child.name}`);

                } catch (sendError) {
                    logger.error(`Failed to send email to ${parent.email}:`, sendError.message);
                }
            }

            logger.log(`Email reminders complete: ${emailsSent} sent, ${emailsSkipped} skipped (already sent today)`);

        } catch (error) {
            logger.error('Error in scheduledEmailReminder:', error);
        }
    }
);

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

/**
 * Send a branded reminder email via SendGrid.
 */
async function sendReminderEmail(sgMail, fromEmail, appUrl, toEmail, parentName, childName, mathMissing, englishMissing, weekStr) {
    const totalMissing = mathMissing + englishMissing;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">GleeGrow</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Happy Learning!</p>
        </div>

        <!-- Body -->
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
            <p style="color: #333; font-size: 16px; margin-top: 0;">Hi ${parentName},</p>

            <p style="color: #555; font-size: 15px; line-height: 1.6;">
                Just a friendly reminder that <strong>${childName}</strong> still has
                <strong>${totalMissing} worksheet${totalMissing !== 1 ? 's' : ''}</strong> to complete this week (${weekStr}).
            </p>

            <!-- Stats -->
            <div style="display: flex; gap: 15px; margin: 25px 0;">
                <div style="flex: 1; background: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center; border-left: 4px solid #667eea;">
                    <div style="font-size: 28px; font-weight: bold; color: ${mathMissing > 0 ? '#667eea' : '#28a745'};">${mathMissing}</div>
                    <div style="font-size: 13px; color: #666; margin-top: 4px;">Math pages left</div>
                </div>
                <div style="flex: 1; background: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center; border-left: 4px solid #764ba2;">
                    <div style="font-size: 28px; font-weight: bold; color: ${englishMissing > 0 ? '#764ba2' : '#28a745'};">${englishMissing}</div>
                    <div style="font-size: 13px; color: #666; margin-top: 4px;">English pages left</div>
                </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: bold; font-size: 16px;">
                    Open GleeGrow
                </a>
            </div>

            <p style="color: #999; font-size: 13px; text-align: center; margin-bottom: 0;">
                Keep up the great work! Consistent practice makes perfect.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>You're receiving this because your child has incomplete worksheets on GleeGrow.</p>
            <p>To stop these reminders, please contact your administrator.</p>
        </div>
    </div>
</body>
</html>`;

    const msg = {
        to: toEmail,
        from: { email: fromEmail, name: 'GleeGrow' },
        subject: `Reminder: ${childName} has ${totalMissing} worksheet${totalMissing !== 1 ? 's' : ''} left this week`,
        html
    };

    await sgMail.send(msg);
}

// ============================================================================
// CALLABLE FUNCTIONS — Server-side validation & access control
// ============================================================================

// Import callable functions from separate modules
const { validateMathSubmission, validateEnglishSubmission, validateAptitudeSubmission } = require('./validators');
const { checkPageAccess, getAccessiblePages: getAccessiblePagesFunc } = require('./access-control');
const { submitAssessment, submitLevelTest, checkLevelTestEligibility } = require('./level-functions');

// Export all callable functions
exports.validateMathSubmission = validateMathSubmission;
exports.validateEnglishSubmission = validateEnglishSubmission;
exports.validateAptitudeSubmission = validateAptitudeSubmission;
exports.checkPageAccess = checkPageAccess;
exports.getAccessiblePages = getAccessiblePagesFunc;
exports.submitAssessment = submitAssessment;
exports.submitLevelTest = submitLevelTest;
exports.checkLevelTestEligibility = checkLevelTestEligibility;
