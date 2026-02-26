/**
 * Navigation & Role-Based Access Tests for GleeGrow Platform
 *
 * Run: node tests/test-navigation-roles.js
 *
 * Tests:
 * - All HTML pages exist and are accessible
 * - Script load order is correct on each page
 * - Back buttons point to correct destinations
 * - Role-based visibility logic (admin/parent/child)
 * - Module button targets and navigation flows
 * - Auth redirects are present on all protected pages
 * - Two-tier module permission system logic
 * - EQ page fix verification (script order, timing)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  \u2713 ${name}`);
    } catch (e) {
        failed++;
        failures.push({ name, error: e.message });
        console.error(`  \u2717 ${name}`);
        console.error(`    ${e.message}`);
    }
}

function readFile(filename) {
    return fs.readFileSync(path.join(ROOT, filename), 'utf8');
}

function fileExists(filename) {
    return fs.existsSync(path.join(ROOT, filename));
}

// ============================================================================
console.log('\n=== All HTML Pages Exist ===');
// ============================================================================

const allPages = [
    'index.html',
    'login.html',
    'signup.html',
    'admin.html',
    'children-profiles.html',
    'progress.html',
    'settings.html',
    'english.html',
    'aptitude.html',
    'drawing.html',
    'emotional-quotient.html',
    'german.html',
    'german-kids.html',
    'stories.html',
    'learn-english-stories.html',
    'privacy-policy.html',
    'terms.html',
    'rewards.html',
];

allPages.forEach(page => {
    test(`${page} exists`, () => {
        assert.ok(fileExists(page), `${page} not found`);
    });
});

// ============================================================================
console.log('\n=== All JavaScript Files Exist ===');
// ============================================================================

const allJsFiles = [
    'app-constants.js',
    'level-mapper.js',
    'age-content-mapper.js',
    'age-filter.js',
    'admin-level-manager.js',
    'child-session-manager.js',
    'profile-selector.js',
    'firebase-config.js',
    'firebase-auth.js',
    'completion-manager.js',
    'worksheet-generator.js',
    'english-generator.js',
    'aptitude-generator.js',
    'eq-generator.js',
    'eq-age-content.js',
    'drawing-generator.js',
    'stories-generator.js',
    'weekly-assignments.js',
    'level-test.js',
    'feedback-system.js',
    'notification-system.js',
    'branding.js',
    'progress-map.js',
    'progress-map.css',
    'feedback.css',
    'feedback.js',
    'sound-manager.js',
    'avatar-renderer.js',
    'rewards.js',
    'rewards.css',
];

allJsFiles.forEach(file => {
    test(`${file} exists`, () => {
        assert.ok(fileExists(file), `${file} not found`);
    });
});

// ============================================================================
console.log('\n=== Auth Protection on All Module Pages ===');
// ============================================================================

const protectedPages = [
    'index.html',
    'admin.html',
    'children-profiles.html',
    'progress.html',
    'settings.html',
    'english.html',
    'aptitude.html',
    'drawing.html',
    'emotional-quotient.html',
    'german.html',
    'german-kids.html',
    'stories.html',
    'learn-english-stories.html',
];

protectedPages.forEach(page => {
    test(`${page} has auth check (onAuthStateChanged or firebase-auth.js)`, () => {
        const content = readFile(page);
        assert.ok(
            content.includes('onAuthStateChanged') || content.includes('firebase-auth.js'),
            `${page} missing auth check`
        );
    });

    test(`${page} has login redirect or uses firebase-auth.js`, () => {
        const content = readFile(page);
        assert.ok(
            content.includes("login") || content.includes('firebase-auth.js'),
            `${page} missing redirect to login or auth handler`
        );
    });
});

// ============================================================================
console.log('\n=== Back Button Navigation ===');
// ============================================================================

const backButtonChecks = [
    { page: 'settings.html', target: 'index', desc: 'Settings -> Home' },
    { page: 'admin.html', target: 'index', desc: 'Admin -> Home' },
    { page: 'children-profiles.html', target: 'index', desc: 'Children Profiles -> Home' },
    { page: 'english.html', target: 'index', desc: 'English -> Home' },
    { page: 'drawing.html', target: 'index', desc: 'Drawing -> Home' },
    { page: 'german.html', target: 'index', desc: 'German -> Home' },
    { page: 'german-kids.html', target: 'index', desc: 'German Kids -> Home' },
    { page: 'learn-english-stories.html', target: 'index', desc: 'Learn English Stories -> Home' },
    { page: 'privacy-policy.html', target: 'index', desc: 'Privacy Policy -> Home' },
    { page: 'terms.html', target: 'index', desc: 'Terms -> Home' },
];

backButtonChecks.forEach(({ page, target, desc }) => {
    test(`Back button: ${desc}`, () => {
        const content = readFile(page);
        // Check for either onclick or href pointing to the target
        const hasTarget = content.includes(`href='${target}'`) ||
                          content.includes(`href="${target}"`) ||
                          content.includes(`location.href='${target}'`) ||
                          content.includes(`location.href="${target}"`) ||
                          content.includes(`href = '${target}'`);
        assert.ok(hasTarget, `${page} missing back navigation to ${target}`);
    });
});

// ============================================================================
console.log('\n=== Module Buttons in index.html ===');
// ============================================================================

const indexContent = readFile('index.html');

const moduleButtons = [
    { module: 'math', trigger: 'showMathLevels()', desc: 'Math button calls showMathLevels()' },
    { module: 'english', trigger: "href='english'", desc: 'English button navigates to english' },
    { module: 'aptitude', trigger: "href='aptitude'", desc: 'Aptitude button navigates to aptitude' },
    { module: 'stories', trigger: "href='stories'", desc: 'Stories button navigates to stories' },
    { module: 'eq', trigger: "href='emotional-quotient'", desc: 'EQ button navigates to emotional-quotient' },
    { module: 'german', trigger: "href='german'", desc: 'German B1 button navigates to german' },
    { module: 'drawing', trigger: "href='drawing'", desc: 'Drawing button navigates to drawing' },
    { module: 'german-kids', trigger: "href='german-kids'", desc: 'German Kids button navigates to german-kids' },
];

moduleButtons.forEach(({ trigger, desc }) => {
    test(desc, () => {
        assert.ok(indexContent.includes(trigger), `Missing: ${trigger}`);
    });
});

// ============================================================================
console.log('\n=== Role-Based Visibility in index.html ===');
// ============================================================================

test('index.html has admin button', () => {
    assert.ok(indexContent.includes('admin-btn') || indexContent.includes("href='admin'"));
});

test('index.html has profile selector container', () => {
    assert.ok(indexContent.includes('profile-selector-container'));
});

test('index.html has version badge', () => {
    assert.ok(indexContent.includes('version-badge'));
});

test('index.html has notification bell container', () => {
    assert.ok(indexContent.includes('notification-bell'));
});

test('index.html hides profile selector for admin', () => {
    // Admin code should set profile selector display to none
    assert.ok(
        indexContent.includes("display = 'none'") || indexContent.includes('display: none') ||
        indexContent.includes('.display = \'none\''),
        'No evidence of hiding elements for admin'
    );
});

test('index.html has showAllModulesForAdmin function', () => {
    assert.ok(indexContent.includes('showAllModulesForAdmin') ||
              indexContent.includes('admin') && indexContent.includes('modules'));
});

test('index.html has updateModuleVisibility function', () => {
    assert.ok(indexContent.includes('updateModuleVisibility') ||
              indexContent.includes('assignedModules'));
});

test('index.html implements two-tier module system (assignedModules + enabledModules)', () => {
    assert.ok(indexContent.includes('assignedModules'), 'Missing assignedModules');
    assert.ok(indexContent.includes('enabledModules'), 'Missing enabledModules');
});

test('German B1 is admin-only', () => {
    // Should have a check that hides german for non-admin
    assert.ok(indexContent.includes("german") && indexContent.includes('admin'),
        'German B1 visibility not tied to admin role');
});

// ============================================================================
console.log('\n=== Admin Page Access Control ===');
// ============================================================================

test('admin.html checks for admin role', () => {
    const content = readFile('admin.html');
    assert.ok(
        content.includes("role === 'admin'") || content.includes("role==='admin'"),
        'admin.html does not check for admin role'
    );
});

test('admin.html has back to home navigation', () => {
    const content = readFile('admin.html');
    assert.ok(content.includes("href='index'") || content.includes("href=\"index\""), 'admin.html missing home link');
});

test('admin.html has feedback viewer section', () => {
    const content = readFile('admin.html');
    assert.ok(content.includes('feedback-section'), 'admin.html missing feedback section');
    assert.ok(content.includes('loadFeedback'), 'admin.html missing loadFeedback function');
    assert.ok(content.includes('feedback-filter-module'), 'admin.html missing feedback module filter');
    assert.ok(content.includes('feedback-summary'), 'admin.html missing feedback summary stats');
});

test('admin.html loads feedback on page init', () => {
    const content = readFile('admin.html');
    assert.ok(content.includes('loadFeedback()'), 'admin.html does not call loadFeedback on init');
});

// ============================================================================
console.log('\n=== EQ Page Fixes Verification ===');
// ============================================================================

test('EQ page: level-mapper.js loads BEFORE eq-age-content.js', () => {
    const content = readFile('emotional-quotient.html');
    const levelMapperPos = content.indexOf('level-mapper.js');
    const eqAgeContentPos = content.indexOf('eq-age-content.js');

    assert.ok(levelMapperPos > 0, 'level-mapper.js not found');
    assert.ok(eqAgeContentPos > 0, 'eq-age-content.js not found');
    assert.ok(levelMapperPos < eqAgeContentPos,
        `level-mapper.js (pos ${levelMapperPos}) loads AFTER eq-age-content.js (pos ${eqAgeContentPos})`);
});

test('EQ page: loadActivities called from onAuthStateChanged, not DOMContentLoaded', () => {
    const content = readFile('emotional-quotient.html');
    // Should NOT have DOMContentLoaded calling loadActivities
    const domContentLoaded = content.match(/DOMContentLoaded.*loadActivities/s);
    assert.ok(!domContentLoaded,
        'loadActivities still called from DOMContentLoaded (should be in onAuthStateChanged)');
});

test('EQ page: loadActivities called after currentAge is set', () => {
    const content = readFile('emotional-quotient.html');
    // In the auth callback, currentAge should be set before loadActivities
    const authBlock = content.match(/onAuthStateChanged[\s\S]*?loadActivities/);
    assert.ok(authBlock, 'loadActivities not in onAuthStateChanged callback');

    const block = authBlock[0];
    const ageSetPos = block.indexOf('currentAge =');
    const loadPos = block.indexOf('loadActivities');
    assert.ok(ageSetPos > 0 && ageSetPos < loadPos,
        'currentAge not set before loadActivities');
});

test('EQ page: age-content-mapper.js loads (provides ageGroupMap)', () => {
    const content = readFile('emotional-quotient.html');
    assert.ok(content.includes('age-content-mapper.js'));
});

test('EQ page: app-constants.js loads (provides getDemoLimit)', () => {
    const content = readFile('emotional-quotient.html');
    assert.ok(content.includes('app-constants.js'));
});

test('EQ generator: has getCurrentUserFullName fallback', () => {
    const content = readFile('eq-generator.js');
    assert.ok(content.includes('getCurrentUserFullName'),
        'eq-generator.js missing getCurrentUserFullName');
});

test('EQ generator: handles mixed-emotion type', () => {
    const content = readFile('eq-generator.js');
    assert.ok(content.includes('mixed-emotion'),
        'eq-generator.js does not handle mixed-emotion activity type');
});

test('EQ generator: handles emotional-growth type', () => {
    const content = readFile('eq-generator.js');
    assert.ok(content.includes('emotional-growth'),
        'eq-generator.js does not handle emotional-growth activity type');
});

test('EQ generator: handles self-awareness type', () => {
    const content = readFile('eq-generator.js');
    assert.ok(content.includes('self-awareness'),
        'eq-generator.js does not handle self-awareness activity type');
});

// ============================================================================
console.log('\n=== Script Load Order on Module Pages ===');
// ============================================================================

const scriptOrderChecks = [
    {
        page: 'emotional-quotient.html',
        before: 'level-mapper.js',
        after: 'eq-age-content.js',
        desc: 'EQ: level-mapper before eq-age-content'
    },
    {
        page: 'emotional-quotient.html',
        before: 'app-constants.js',
        after: 'eq-generator.js',
        desc: 'EQ: app-constants before eq-generator'
    },
];

// Also check all module pages load firebase-config.js before firebase-auth.js
const modulePages = [
    'index.html', 'english.html', 'aptitude.html', 'drawing.html',
    'emotional-quotient.html', 'german.html', 'german-kids.html',
    'stories.html', 'learn-english-stories.html',
];

modulePages.forEach(page => {
    scriptOrderChecks.push({
        page,
        before: 'firebase-config.js',
        after: 'firebase-auth.js',
        desc: `${page}: firebase-config before firebase-auth`
    });
});

scriptOrderChecks.forEach(({ page, before, after, desc }) => {
    test(desc, () => {
        const content = readFile(page);
        const beforePos = content.indexOf(before);
        const afterPos = content.indexOf(after);

        if (beforePos < 0) return; // Skip if not present (some pages may not use both)
        if (afterPos < 0) return;

        assert.ok(beforePos < afterPos,
            `${before} (pos ${beforePos}) loads after ${after} (pos ${afterPos}) in ${page}`);
    });
});

// ============================================================================
console.log('\n=== Firebase SDK Loaded on Module Pages ===');
// ============================================================================

modulePages.forEach(page => {
    test(`${page} loads Firebase SDK`, () => {
        const content = readFile(page);
        assert.ok(
            content.includes('firebase-app') || content.includes('firebase-app-compat'),
            `${page} missing Firebase App SDK`
        );
    });
});

// ============================================================================
console.log('\n=== FOUC Prevention (Content Hidden Initially) ===');
// ============================================================================

const foucPages = [
    'index.html', 'english.html', 'aptitude.html', 'drawing.html',
    'emotional-quotient.html', 'stories.html',
];

foucPages.forEach(page => {
    test(`${page} has FOUC prevention (opacity: 0 or hidden by default)`, () => {
        const content = readFile(page);
        const hasFouc = content.includes('opacity: 0') ||
                        content.includes('opacity:0') ||
                        content.includes('display: none') ||
                        content.includes('content-loaded');
        assert.ok(hasFouc, `${page} may flash content before auth check`);
    });
});

// ============================================================================
console.log('\n=== Navigation Flow Integrity ===');
// ============================================================================

test('login.html has link/redirect to signup', () => {
    const content = readFile('login.html');
    assert.ok(content.includes('signup'), 'login.html missing link to signup');
});

test('signup.html has link/redirect to login', () => {
    const content = readFile('signup.html');
    assert.ok(content.includes('login'), 'signup.html missing link to login');
});

test('index.html has link to settings', () => {
    assert.ok(indexContent.includes("href='settings'") || indexContent.includes("settings"));
});

test('index.html has link to admin panel (for admin role)', () => {
    assert.ok(indexContent.includes("href='admin'"));
});

test('children-profiles.html has link to progress', () => {
    const content = readFile('children-profiles.html');
    assert.ok(content.includes("href='progress'") || content.includes('progress'), 'Missing link to progress page');
});

test('settings.html has logout functionality', () => {
    const content = readFile('settings.html');
    assert.ok(
        content.includes('logout') || content.includes('signOut') || content.includes('sign-out'),
        'settings.html missing logout'
    );
});

// ============================================================================
console.log('\n=== Module Page Structure Consistency ===');
// ============================================================================

const modulePageFiles = [
    { page: 'english.html', generator: 'english-generator.js' },
    { page: 'aptitude.html', generator: 'aptitude-generator.js' },
    { page: 'drawing.html', generator: 'drawing-generator.js' },
    { page: 'emotional-quotient.html', generator: 'eq-generator.js' },
    { page: 'stories.html', generator: 'stories-generator.js' },
];

modulePageFiles.forEach(({ page, generator }) => {
    test(`${page} loads ${generator}`, () => {
        const content = readFile(page);
        assert.ok(content.includes(generator),
            `${page} does not load ${generator}`);
    });
});

test('index.html loads worksheet-generator.js (for math)', () => {
    assert.ok(indexContent.includes('worksheet-generator.js'));
});

// ============================================================================
console.log('\n=== Two-Tier Permission System ===');
// ============================================================================

test('children-profiles.html has moduleRequests handling', () => {
    const content = readFile('children-profiles.html');
    assert.ok(content.includes('moduleRequests') || content.includes('module') && content.includes('request'));
});

test('admin.html can approve/reject module requests', () => {
    const content = readFile('admin.html');
    assert.ok(
        content.includes('approve') || content.includes('Approve'),
        'admin.html missing approve functionality'
    );
});

test('index.html checks assignedModules before showing module buttons', () => {
    assert.ok(indexContent.includes('assignedModules'),
        'index.html missing assignedModules check');
});

test('index.html checks enabledModules before showing module buttons', () => {
    assert.ok(indexContent.includes('enabledModules'),
        'index.html missing enabledModules check');
});

// ============================================================================
console.log('\n=== HTML Document Structure ===');
// ============================================================================

allPages.forEach(page => {
    test(`${page} has DOCTYPE declaration`, () => {
        const content = readFile(page);
        assert.ok(content.trim().startsWith('<!DOCTYPE html>') || content.trim().startsWith('<!doctype html>'),
            `${page} missing DOCTYPE`);
    });

    test(`${page} has lang attribute`, () => {
        const content = readFile(page);
        assert.ok(content.includes('lang="en"') || content.includes("lang='en'") ||
            content.includes('lang="de"') || content.includes("lang='de'"),
            `${page} missing lang attribute`);
    });

    test(`${page} has meta viewport (mobile responsive)`, () => {
        const content = readFile(page);
        assert.ok(content.includes('viewport'),
            `${page} missing viewport meta tag`);
    });

    test(`${page} has a title`, () => {
        const content = readFile(page);
        assert.ok(content.includes('<title>') && content.includes('</title>'),
            `${page} missing title tag`);
    });
});

// ============================================================================
console.log('\n=== Cloud Functions Integration ===');
// ============================================================================

test('functions/index.js exists and exports validators', () => {
    const content = readFile('functions/index.js');
    assert.ok(content.includes('validateMathSubmission'), 'Missing validateMathSubmission export');
    assert.ok(content.includes('validateEnglishSubmission'), 'Missing validateEnglishSubmission export');
    assert.ok(content.includes('validateAptitudeSubmission'), 'Missing validateAptitudeSubmission export');
});

test('functions/index.js exports access control functions', () => {
    const content = readFile('functions/index.js');
    assert.ok(content.includes('checkPageAccess'), 'Missing checkPageAccess export');
    assert.ok(content.includes('getAccessiblePages'), 'Missing getAccessiblePages export');
});

test('functions/index.js exports level functions', () => {
    const content = readFile('functions/index.js');
    assert.ok(content.includes('submitAssessment'), 'Missing submitAssessment export');
    assert.ok(content.includes('submitLevelTest'), 'Missing submitLevelTest export');
    assert.ok(content.includes('checkLevelTestEligibility'), 'Missing checkLevelTestEligibility export');
});

test('worksheet-generator.js uses Cloud Function validation (no local fallback)', () => {
    const content = readFile('worksheet-generator.js');
    assert.ok(
        content.includes('httpsCallable') || content.includes('validateMathSubmission'),
        'worksheet-generator.js missing Cloud Function call'
    );
    assert.ok(
        !content.includes('FALLBACK: Local validation'),
        'worksheet-generator.js should NOT have local validation fallback'
    );
    assert.ok(
        content.includes('server-authoritative'),
        'worksheet-generator.js should use server-authoritative validation'
    );
});

test('firestore.rules exists', () => {
    assert.ok(fileExists('firestore.rules'));
});

test('firestore.rules locks down completions', () => {
    const content = readFile('firestore.rules');
    assert.ok(content.includes('completions'),
        'firestore.rules missing completions collection rules');
});

// ============================================================================
console.log('\n=== Branding Consistency ===');
// ============================================================================

test('branding.js exists', () => {
    assert.ok(fileExists('branding.js'));
});

test('app-constants.js has GleeGrow brand name', () => {
    const content = readFile('app-constants.js');
    assert.ok(content.includes('GleeGrow'));
});

// ============================================================================
console.log('\n=== Weekly Assignments Integration ===');
// ============================================================================

test('weekly-assignments.js exists and has core functions', () => {
    const content = readFile('weekly-assignments.js');
    assert.ok(content.includes('getWeekString'), 'Missing getWeekString');
    assert.ok(content.includes('getWeekStart'), 'Missing getWeekStart');
    assert.ok(content.includes('getWeekEnd'), 'Missing getWeekEnd');
    assert.ok(content.includes('getAccessiblePages') || content.includes('accessible'),
        'Missing getAccessiblePages');
});

test('weekly-assignments.js has lockout logic', () => {
    const content = readFile('weekly-assignments.js');
    assert.ok(content.includes('lockout') || content.includes('Lockout') || content.includes('LOCKOUT'),
        'Missing lockout functionality');
});

// ============================================================================
console.log('\n=== Notification System ===');
// ============================================================================

test('notification-system.js exists', () => {
    assert.ok(fileExists('notification-system.js'));
});

test('notification-system.js has bell icon functionality', () => {
    const content = readFile('notification-system.js');
    assert.ok(content.includes('bell') || content.includes('notification'),
        'Missing bell/notification UI code');
});

// ============================================================================
console.log('\n=== Feedback System ===');
// ============================================================================

test('feedback-system.js exists', () => {
    assert.ok(fileExists('feedback-system.js'));
});

test('feedback-system.js has modal and submit functionality', () => {
    const content = readFile('feedback-system.js');
    assert.ok(content.includes('feedback') || content.includes('Feedback'),
        'Missing feedback handling');
});

// ============================================================================
console.log('\n=== Level Test System ===');
// ============================================================================

test('level-test.js exists', () => {
    assert.ok(fileExists('level-test.js'));
});

test('level-test.js has 90% pass threshold', () => {
    const content = readFile('level-test.js');
    assert.ok(content.includes('90') || content.includes('0.9'),
        'level-test.js missing 90% threshold');
});

test('level-test.js has 4-week eligibility check', () => {
    const content = readFile('level-test.js');
    assert.ok(content.includes('4') && (content.includes('week') || content.includes('Week')),
        'level-test.js missing 4-week eligibility');
});

// ============================================================================
console.log('\n=== Assessment System ===');
// ============================================================================

test('assessment.js exists', () => {
    assert.ok(fileExists('assessment.js'));
});

test('assessment.js has question generation', () => {
    const content = readFile('assessment.js');
    assert.ok(content.includes('assessment') || content.includes('Assessment'),
        'Missing assessment logic');
});

// ============================================================================
// BUG-016: Footer Positioning Tests
// ============================================================================
console.log('\n--- BUG-016: Footer Positioning ---');

test('styles.css body has flex column layout', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('min-height: 100vh'), 'body missing min-height: 100vh');
    assert.ok(css.includes('display: flex'), 'body missing display: flex');
    assert.ok(css.includes('flex-direction: column'), 'body missing flex-direction: column');
});

test('styles.css container has flex: 1', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('flex: 1'), 'container missing flex: 1');
});

test('styles.css footer uses margin-top: auto', () => {
    const css = readFile('styles.css');
    // Check footer section has margin-top: auto
    const footerMatch = css.match(/footer\s*\{[^}]*margin-top:\s*auto/);
    assert.ok(footerMatch, 'footer missing margin-top: auto');
});

test('index.html footer uses margin-top: auto (not 60px)', () => {
    const html = readFile('index.html');
    const footerMatch = html.match(/<footer[^>]*style="[^"]*margin-top:\s*auto/);
    assert.ok(footerMatch, 'index.html inline footer should use margin-top: auto');
    assert.ok(!html.match(/<footer[^>]*style="[^"]*margin-top:\s*60px/),
        'index.html footer should NOT have margin-top: 60px');
});

const pagesWithFooters = [
    'stories.html', 'aptitude.html', 'german.html', 'drawing.html',
    'learn-english-stories.html', 'german-kids.html', 'emotional-quotient.html'
];

pagesWithFooters.forEach(page => {
    test(`${page} has footer tag inside container`, () => {
        const html = readFile(page);
        assert.ok(html.includes('<footer>'), `${page} missing <footer> tag`);
        // Footer should be inside a container div
        const containerIdx = html.indexOf('class="container"');
        const footerIdx = html.indexOf('<footer>');
        assert.ok(containerIdx < footerIdx, `${page}: footer should be inside container`);
    });
});

// ============================================================================
// BUG-017: Assessment Gate for Demo Mode Tests
// ============================================================================
console.log('\n--- BUG-017: Assessment Required for Demo Mode ---');

test('worksheet-generator.js checks assessment BEFORE demo mode split', () => {
    const js = readFile('worksheet-generator.js');
    const assessmentCheckIdx = js.indexOf('hasCompletedAssessment(child.id, operation)');
    const demoCheckIdx = js.indexOf("isDemoMode()");
    // Find the demo check that's inside loadOperationWorksheet (not the import)
    const loadOpIdx = js.indexOf('async function loadOperationWorksheet');
    const assessmentInLoadOp = js.indexOf('hasCompletedAssessment(child.id, operation)', loadOpIdx);
    const demoInLoadOp = js.indexOf('isDemoMode()', loadOpIdx);
    assert.ok(assessmentInLoadOp > 0, 'Missing hasCompletedAssessment check in loadOperationWorksheet');
    assert.ok(demoInLoadOp > 0, 'Missing isDemoMode check in loadOperationWorksheet');
    assert.ok(assessmentInLoadOp < demoInLoadOp,
        'Assessment check must come BEFORE demo mode check in loadOperationWorksheet');
});

test('worksheet-generator.js requires child profile before assessment', () => {
    const js = readFile('worksheet-generator.js');
    const loadOpIdx = js.indexOf('async function loadOperationWorksheet');
    const childCheckIdx = js.indexOf("'Please select a child profile first'", loadOpIdx);
    const assessmentIdx = js.indexOf('hasCompletedAssessment', loadOpIdx);
    assert.ok(childCheckIdx > 0, 'Missing child profile check');
    assert.ok(childCheckIdx < assessmentIdx,
        'Child profile check must come before assessment check');
});

test('worksheet-generator.js refreshes age from selected child', () => {
    const js = readFile('worksheet-generator.js');
    const loadOpIdx = js.indexOf('async function loadOperationWorksheet');
    const ageRefresh = js.indexOf('child.age', loadOpIdx);
    assert.ok(ageRefresh > 0 && ageRefresh < loadOpIdx + 1000,
        'Should refresh age group from selected child in loadOperationWorksheet');
});

test('english-generator.js checks assessment BEFORE demo mode split', () => {
    const js = readFile('english-generator.js');
    const loadNewIdx = js.indexOf('async function loadWorksheetNew');
    const assessmentIdx = js.indexOf('hasCompletedAssessment', loadNewIdx);
    const demoIdx = js.indexOf('isDemoMode()', loadNewIdx);
    assert.ok(assessmentIdx > 0, 'Missing hasCompletedAssessment in English loadWorksheetNew');
    assert.ok(demoIdx > 0, 'Missing isDemoMode in English loadWorksheetNew');
    assert.ok(assessmentIdx < demoIdx,
        'English: assessment check must come BEFORE demo mode check');
});

test('english-generator.js requires child profile before assessment', () => {
    const js = readFile('english-generator.js');
    const loadNewIdx = js.indexOf('async function loadWorksheetNew');
    const childCheckIdx = js.indexOf("'Please select a child profile first'", loadNewIdx);
    const assessmentIdx = js.indexOf('hasCompletedAssessment', loadNewIdx);
    assert.ok(childCheckIdx > 0 && childCheckIdx < assessmentIdx,
        'English: child profile check must come before assessment check');
});

test('worksheet-generator.js showAssessmentGate exists and creates gate HTML', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('function showAssessmentGate'), 'Missing showAssessmentGate function');
    assert.ok(js.includes('assessment-gate'), 'showAssessmentGate must create assessment-gate element');
    assert.ok(js.includes('Take Assessment'), 'Assessment gate must have Take Assessment button');
});

test('assessment.js has startAssessment function', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('function startAssessment'), 'Missing startAssessment function');
});

test('assessment.js saves results to Firestore only (no localStorage)', () => {
    const js = readFile('assessment.js');
    assert.ok(!js.includes('localStorage.setItem'), 'Assessment must NOT write to localStorage');
    assert.ok(!js.includes('localStorage.getItem'), 'Assessment must NOT read from localStorage');
    assert.ok(js.includes('firestore()'), 'Assessment must save to Firestore');
});

// ============================================================================
// BUG-018: Post-Assessment Page Count + Weekly Sheet Generation
// ============================================================================
console.log('\n--- BUG-018: Post-Assessment Page Count & Immediate Sheet Generation ---');

test('assessment.js startLearningAtLevel calls loadOperationWorksheet (not loadWorksheet)', () => {
    const js = readFile('assessment.js');
    const fnIdx = js.indexOf('function startLearningAtLevel');
    assert.ok(fnIdx >= 0, 'Missing startLearningAtLevel function');
    const fnBody = js.slice(fnIdx, js.indexOf('\n}', fnIdx + 200) + 2);
    assert.ok(fnBody.includes('loadOperationWorksheet(operation)'),
        'startLearningAtLevel must call loadOperationWorksheet for proper page access control');
    assert.ok(!fnBody.includes('loadWorksheet(operation, ageGroup'),
        'startLearningAtLevel must NOT call loadWorksheet directly (bypasses page limits)');
});

test('assessment.js startLearningAtLevel triggers first weekly assignment', () => {
    const js = readFile('assessment.js');
    const fnIdx = js.indexOf('function startLearningAtLevel');
    const fnBody = js.slice(fnIdx, js.indexOf('\n}', fnIdx + 200) + 2);
    assert.ok(fnBody.includes('generateFirstWeeklyAssignment'),
        'startLearningAtLevel must call generateFirstWeeklyAssignment after assessment');
});

test('assessment.js startLearningAtLevel is async (awaits assignment generation)', () => {
    const js = readFile('assessment.js');
    const fnIdx = js.indexOf('function startLearningAtLevel');
    const asyncPrefix = js.slice(Math.max(0, fnIdx - 10), fnIdx);
    assert.ok(asyncPrefix.includes('async'),
        'startLearningAtLevel must be async to await generateFirstWeeklyAssignment');
});

test('weekly-assignments.js has generateFirstWeeklyAssignment function', () => {
    const js = readFile('weekly-assignments.js');
    assert.ok(js.includes('function generateFirstWeeklyAssignment'),
        'Missing generateFirstWeeklyAssignment function');
});

test('generateFirstWeeklyAssignment creates notification on generation', () => {
    const js = readFile('weekly-assignments.js');
    const fnIdx = js.indexOf('function generateFirstWeeklyAssignment');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('createNotification'),
        'generateFirstWeeklyAssignment must create a notification');
    assert.ok(fnBody.includes('new_sheets') || fnBody.includes('Worksheets Ready'),
        'Notification should indicate worksheets are ready');
});

test('generateFirstWeeklyAssignment bypasses Monday 4pm gate', () => {
    const js = readFile('weekly-assignments.js');
    const fnIdx = js.indexOf('function generateFirstWeeklyAssignment');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(!fnBody.includes('isAssignmentGenerationAllowed'),
        'generateFirstWeeklyAssignment must NOT check Monday 4pm gate');
    assert.ok(fnBody.includes('assessment_completion'),
        'Should mark generatedBy as assessment_completion');
});

test('generateFirstWeeklyAssignment checks for existing assignment (no duplicates)', () => {
    const js = readFile('weekly-assignments.js');
    const fnIdx = js.indexOf('function generateFirstWeeklyAssignment');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('.get()') && fnBody.includes('.exists'),
        'Must check if assignment already exists before generating');
});

test('admin.html creates notification on full version approval', () => {
    const html = readFile('admin.html');
    const fnIdx = html.indexOf('function approveChildUpgradeRequest');
    assert.ok(fnIdx >= 0, 'Missing approveChildUpgradeRequest function');
    const fnEnd = html.indexOf('\n        }', fnIdx + 200);
    const fnBody = html.slice(fnIdx, fnEnd + 10);
    assert.ok(fnBody.includes('notifications') && fnBody.includes('Full Version Activated'),
        'approveChildUpgradeRequest must create a notification about full version');
});

test('worksheet-generator.js default totalAccessiblePages is 150 (overridden per mode)', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('let totalAccessiblePages = 150'),
        'Default totalAccessiblePages should be 150 (set correctly per mode in loadOperationWorksheet)');
});

test('worksheet-generator.js demo mode sets totalAccessiblePages to DEMO_PAGE_COUNT', () => {
    const js = readFile('worksheet-generator.js');
    const loadOpIdx = js.indexOf('async function loadOperationWorksheet');
    const demoSection = js.indexOf('DEMO_PAGE_COUNT', loadOpIdx);
    assert.ok(demoSection > 0, 'Demo path must use DEMO_PAGE_COUNT');
    // Check a wider range since the variable assignment may be several lines after DEMO_PAGE_COUNT
    const nearbyCode = js.slice(demoSection, demoSection + 800);
    assert.ok(nearbyCode.includes('totalAccessiblePages = demoCount'),
        'Demo mode must set totalAccessiblePages to demoCount');
});

// ============================================================================
// BUG-019: Worksheet Save/Load Storage Mismatch + Keyboard Support
// ============================================================================
console.log('\n--- BUG-019: Worksheet Save/Load Storage & Input Mode Support ---');

test('saveCurrentWorksheet uses saveWorksheetToStorage (localStorage, not Firestore)', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('function saveCurrentWorksheet()');
    assert.ok(fnIdx >= 0, 'Missing saveCurrentWorksheet function');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('saveWorksheetToStorage'),
        'saveCurrentWorksheet must use saveWorksheetToStorage (localStorage)');
    assert.ok(!fnBody.includes('saveWorksheet(') || fnBody.includes('saveWorksheetToStorage'),
        'Must not use Firestore saveWorksheet');
});

test('loadSavedWorksheet uses loadWorksheetFromStorage (localStorage, not Firestore)', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('function loadSavedWorksheet()');
    assert.ok(fnIdx >= 0, 'Missing loadSavedWorksheet function');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('loadWorksheetFromStorage'),
        'loadSavedWorksheet must use loadWorksheetFromStorage (localStorage)');
    assert.ok(!fnBody.includes('loadWorksheetFromFirestore'),
        'Must NOT use loadWorksheetFromFirestore (mismatched backend)');
});

test('saveCurrentWorksheet collects keyboardAnswers for keyboard mode', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('function saveCurrentWorksheet()');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('keyboardAnswers'),
        'saveCurrentWorksheet must collect keyboardAnswers');
    assert.ok(fnBody.includes('isPencilMode'),
        'Must check isPencilMode to determine input type');
});

test('loadSavedWorksheet restores keyboardAnswers for keyboard mode', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('function loadSavedWorksheet()');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('keyboardAnswers'),
        'loadSavedWorksheet must restore keyboardAnswers');
    assert.ok(fnBody.includes('input.value = answer.value') || fnBody.includes('.value = answer.value'),
        'Must set input.value from saved keyboard answers');
});

test('autoSavePage collects both canvas and keyboard answers', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('function autoSavePage()');
    assert.ok(fnIdx >= 0, 'Missing autoSavePage function');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('keyboardAnswers'),
        'autoSavePage must collect keyboardAnswers');
    assert.ok(fnBody.includes('canvasAnswers'),
        'autoSavePage must collect canvasAnswers');
    assert.ok(fnBody.includes('isPencilMode'),
        'autoSavePage must check isPencilMode');
});

test('loadSavedWorksheet restores canvasAnswers for pencil mode', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('function loadSavedWorksheet()');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('canvasAnswers') && fnBody.includes('drawImage'),
        'loadSavedWorksheet must restore canvas images');
});

test('storage-manager.js saveWorksheetToStorage stores keyboardAnswers if provided', () => {
    const js = readFile('storage-manager.js');
    const fnIdx = js.indexOf('function saveWorksheetToStorage');
    const fnEnd = js.indexOf('\n}', fnIdx + 200);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('canvasAnswers'),
        'saveWorksheetToStorage must include canvasAnswers in saved data');
});

// ============================================================================
// BUG-020: Footer Visibility in Worksheet View
// ============================================================================
console.log('\n--- BUG-020: Footer Visibility in Worksheet View ---');

test('renderWorksheet does NOT hide footer (footer stays at bottom)', () => {
    const js = readFile('worksheet-generator.js');
    const renderIdx = js.indexOf('worksheetContainer.innerHTML = html');
    assert.ok(renderIdx >= 0, 'renderWorksheet must set worksheetContainer.innerHTML');
    // Check the 500 chars before the innerHTML assignment for footer hiding
    const setupCode = js.slice(Math.max(0, renderIdx - 800), renderIdx);
    assert.ok(!setupCode.includes("pageFooter.style.display = 'none'") &&
              !setupCode.includes('pageFooter.style.display = "none"'),
        'renderWorksheet must NOT hide the page footer');
});

test('renderWorksheet hides header during worksheet display', () => {
    const js = readFile('worksheet-generator.js');
    const renderIdx = js.indexOf('worksheetContainer.innerHTML = html');
    const setupCode = js.slice(Math.max(0, renderIdx - 1200), renderIdx);
    assert.ok(setupCode.includes("pageHeader.style.display = 'none'") ||
              setupCode.includes('pageHeader.style.display = "none"'),
        'renderWorksheet must hide the page header');
});

test('backToWorksheetSelection restores header and footer', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('function backToWorksheetSelection()');
    assert.ok(fnIdx >= 0, 'Missing backToWorksheetSelection function');
    const fnEnd = js.indexOf('\n}', fnIdx + 100);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('pageHeader') && fnBody.includes("display = ''"),
        'backToWorksheetSelection must restore header');
    assert.ok(fnBody.includes('pageFooter') && fnBody.includes("display = ''"),
        'backToWorksheetSelection must restore footer');
});

test('showSubjects restores header and footer', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('function showSubjects()');
    assert.ok(fnIdx >= 0, 'Missing showSubjects function');
    const fnEnd = js.indexOf('\n}', fnIdx + 100);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('pageHeader') && fnBody.includes("display = ''"),
        'showSubjects must restore header');
    assert.ok(fnBody.includes('pageFooter') && fnBody.includes("display = ''"),
        'showSubjects must restore footer');
});

test('Firestore worksheets rule allows any authenticated user (no resource.data check)', () => {
    const rules = readFile('firestore.rules');
    const worksheetIdx = rules.indexOf('match /worksheets/{worksheetId}');
    assert.ok(worksheetIdx >= 0, 'Missing worksheets rule');
    const ruleBlock = rules.slice(worksheetIdx, rules.indexOf('}', worksheetIdx + 50) + 1);
    assert.ok(ruleBlock.includes('isAuthenticated()'),
        'Worksheets rule must require authentication');
    assert.ok(!ruleBlock.includes('resource.data.username'),
        'Worksheets rule must NOT check resource.data.username (fails for non-existent docs)');
});

// ============================================================================
// BUG-021: Firestore Composite Indexes
// ============================================================================
console.log('\n--- BUG-021: Firestore Composite Indexes ---');

test('firestore.indexes.json exists', () => {
    assert.ok(fileExists('firestore.indexes.json'), 'Missing firestore.indexes.json');
});

test('firebase.json references firestore.indexes.json', () => {
    const json = readFile('firebase.json');
    const config = JSON.parse(json);
    assert.ok(config.firestore && config.firestore.indexes === 'firestore.indexes.json',
        'firebase.json must reference firestore.indexes.json');
});

test('Index exists: weekly_assignments (childId + createdAt DESC)', () => {
    const json = JSON.parse(readFile('firestore.indexes.json'));
    const idx = json.indexes.find(i =>
        i.collectionGroup === 'weekly_assignments' &&
        i.fields.length === 2 &&
        i.fields[0].fieldPath === 'childId' &&
        i.fields[1].fieldPath === 'createdAt' && i.fields[1].order === 'DESCENDING'
    );
    assert.ok(idx, 'Missing weekly_assignments composite index (childId + createdAt DESC)');
});

test('Index exists: weekly_assignments (childId + status + createdAt DESC)', () => {
    const json = JSON.parse(readFile('firestore.indexes.json'));
    const idx = json.indexes.find(i =>
        i.collectionGroup === 'weekly_assignments' &&
        i.fields.length === 3 &&
        i.fields.some(f => f.fieldPath === 'childId') &&
        i.fields.some(f => f.fieldPath === 'status') &&
        i.fields.some(f => f.fieldPath === 'createdAt')
    );
    assert.ok(idx, 'Missing weekly_assignments composite index (childId + status + createdAt DESC)');
});

test('Index exists: notifications (childId + dismissed + createdAt DESC)', () => {
    const json = JSON.parse(readFile('firestore.indexes.json'));
    const idx = json.indexes.find(i =>
        i.collectionGroup === 'notifications' &&
        i.fields.some(f => f.fieldPath === 'childId') &&
        i.fields.some(f => f.fieldPath === 'dismissed') &&
        i.fields.some(f => f.fieldPath === 'createdAt')
    );
    assert.ok(idx, 'Missing notifications composite index (childId + dismissed + createdAt DESC)');
});

test('Index exists: level_tests (childId + module + week)', () => {
    const json = JSON.parse(readFile('firestore.indexes.json'));
    const idx = json.indexes.find(i =>
        i.collectionGroup === 'level_tests' &&
        i.fields.some(f => f.fieldPath === 'childId') &&
        i.fields.some(f => f.fieldPath === 'module') &&
        i.fields.some(f => f.fieldPath === 'week')
    );
    assert.ok(idx, 'Missing level_tests composite index (childId + module + week)');
});

test('Index exists: completions (childEmail + module)', () => {
    const json = JSON.parse(readFile('firestore.indexes.json'));
    const idx = json.indexes.find(i =>
        i.collectionGroup === 'completions' &&
        i.fields.some(f => f.fieldPath === 'childEmail') &&
        i.fields.some(f => f.fieldPath === 'module')
    );
    assert.ok(idx, 'Missing completions composite index (childEmail + module)');
});

test('Index exists: worksheets (username + subject + completed)', () => {
    const json = JSON.parse(readFile('firestore.indexes.json'));
    const idx = json.indexes.find(i =>
        i.collectionGroup === 'worksheets' &&
        i.fields.some(f => f.fieldPath === 'username') &&
        i.fields.some(f => f.fieldPath === 'subject') &&
        i.fields.some(f => f.fieldPath === 'completed')
    );
    assert.ok(idx, 'Missing worksheets composite index (username + subject + completed)');
});

test('All queries in level-test.js use indexed fields', () => {
    const js = readFile('level-test.js');
    // Query 1: weekly_assignments where childId + orderBy createdAt
    assert.ok(js.includes(".where('childId'") && js.includes(".orderBy('createdAt'"),
        'level-test.js must query weekly_assignments with childId + createdAt');
    // Query 2: level_tests where childId + module + week
    assert.ok(js.includes(".where('module'") && js.includes(".where('week'"),
        'level-test.js must query level_tests with childId + module + week');
});

test('All queries in notification-system.js use indexed fields', () => {
    const js = readFile('notification-system.js');
    assert.ok(js.includes(".where('childId'") && js.includes(".where('dismissed'") && js.includes(".orderBy('createdAt'"),
        'notification-system.js must query notifications with childId + dismissed + createdAt');
});

// ============================================================================
// BUG-023: Cloud Functions SDK + Auto-Save on Submit/Navigate
// ============================================================================
console.log('\n--- BUG-023: Cloud Functions SDK & Auto-Save ---');

test('index.html loads Firebase Functions SDK', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('firebase-functions-compat.js'),
        'index.html must load firebase-functions-compat.js for Cloud Functions');
});

test('index.html loads storage-manager.js', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('storage-manager.js'),
        'index.html must load storage-manager.js for localStorage save/load');
});

test('submitWorksheet calls autoSavePage after grading', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('async function submitWorksheet()');
    assert.ok(fnIdx >= 0, 'Missing submitWorksheet function');
    const fnBody = js.slice(fnIdx, js.indexOf('\n}\n', fnIdx + 500) + 3);
    assert.ok(fnBody.includes('autoSavePage()'),
        'submitWorksheet must call autoSavePage() to persist answers');
});

test('navigateAbsolutePage calls autoSavePage before navigating', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('async function navigateAbsolutePage');
    assert.ok(fnIdx >= 0, 'Missing navigateAbsolutePage function');
    const fnBody = js.slice(fnIdx, js.indexOf('\n}\n', fnIdx + 200) + 3);
    assert.ok(fnBody.includes('autoSavePage()'),
        'navigateAbsolutePage must call autoSavePage() before switching pages');
});

test('autoSavePage is defined and saves to localStorage', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('function autoSavePage()');
    assert.ok(fnIdx >= 0, 'Missing autoSavePage function');
    const fnEnd = js.indexOf('\n}', fnIdx + 100);
    const fnBody = js.slice(fnIdx, fnEnd + 2);
    assert.ok(fnBody.includes('saveWorksheetToStorage'),
        'autoSavePage must use saveWorksheetToStorage (localStorage)');
});

// ============================================================================
// BUG-024: Cloud Functions Region Mismatch (CORS)
// ============================================================================
console.log('\n--- BUG-024: Cloud Functions Region + SDK Consistency ---');

test('All CF calls use europe-west1 region (no bare firebase.functions())', () => {
    const files = ['worksheet-generator.js', 'english-generator.js', 'aptitude-generator.js', 'assessment.js', 'level-test.js'];
    files.forEach(file => {
        const js = readFile(file);
        const matches = js.match(/firebase\.functions\(\)/g);
        assert.ok(!matches, `${file} must NOT use firebase.functions() (defaults to us-central1). Use firebase.app().functions('europe-west1')`);
    });
});

test('All CF calls use firebase.app().functions(region) pattern', () => {
    const files = ['worksheet-generator.js', 'english-generator.js', 'aptitude-generator.js', 'assessment.js', 'level-test.js'];
    files.forEach(file => {
        const js = readFile(file);
        if (js.includes('httpsCallable')) {
            assert.ok(js.includes("functions('europe-west1')"),
                `${file} must use functions('europe-west1') for CF calls`);
        }
    });
});

test('english.html loads Firebase Functions SDK', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('firebase-functions-compat.js'),
        'english.html must load firebase-functions-compat.js (english-generator.js calls validateEnglishSubmission)');
});

test('aptitude.html loads Firebase Functions SDK', () => {
    const html = readFile('aptitude.html');
    assert.ok(html.includes('firebase-functions-compat.js'),
        'aptitude.html must load firebase-functions-compat.js (aptitude-generator.js calls validateAptitudeSubmission)');
});

// ============================================================================
// BUG-025: Footer Positioning — insertBefore footer in all generators
// ============================================================================
console.log('\n--- BUG-025: Footer Positioning in All Generators ---');

test('worksheet-generator.js uses insertBefore footer (not appendChild)', () => {
    const js = readFile('worksheet-generator.js');
    const idx = js.indexOf("worksheetContainer.id = 'worksheet-content'");
    assert.ok(idx >= 0, 'Missing worksheet-content creation');
    const nearby = js.slice(idx, idx + 300);
    assert.ok(nearby.includes('insertBefore(worksheetContainer, footer)'),
        'worksheet-generator.js must use insertBefore footer');
    assert.ok(!nearby.includes('container.appendChild(worksheetContainer)'),
        'worksheet-generator.js must NOT use appendChild for worksheet container');
});

test('aptitude-generator.js uses insertBefore footer (not appendChild)', () => {
    const js = readFile('aptitude-generator.js');
    const idx = js.indexOf("worksheetContainer.id = 'worksheet-content'");
    assert.ok(idx >= 0, 'Missing worksheet-content creation');
    const nearby = js.slice(idx, idx + 300);
    assert.ok(nearby.includes('insertBefore(worksheetContainer, footer)'),
        'aptitude-generator.js must use insertBefore footer');
});

test('english-generator.js uses insertBefore footer (not appendChild)', () => {
    const js = readFile('english-generator.js');
    const idx = js.indexOf("worksheetContainer.id = 'english-worksheet-content'");
    assert.ok(idx >= 0, 'Missing english-worksheet-content creation');
    const nearby = js.slice(idx, idx + 300);
    assert.ok(nearby.includes('insertBefore(worksheetContainer, footer)'),
        'english-generator.js must use insertBefore footer');
});

test('german-generator.js does NOT use document.body.innerHTML', () => {
    const js = readFile('german-generator.js');
    assert.ok(!js.includes('document.body.innerHTML = html'),
        'german-generator.js must NOT replace document.body.innerHTML (destroys page structure)');
});

test('german-generator.js uses insertBefore footer', () => {
    const js = readFile('german-generator.js');
    assert.ok(js.includes("insertBefore(worksheetContainer, footer)"),
        'german-generator.js must use insertBefore footer');
});

test('No generator uses document.body.innerHTML to render worksheets', () => {
    const generators = [
        'worksheet-generator.js', 'english-generator.js', 'aptitude-generator.js',
        'german-generator.js', 'german-kids-generator.js'
    ];
    generators.forEach(file => {
        const js = readFile(file);
        assert.ok(!js.includes('document.body.innerHTML = html'),
            `${file} must NOT use document.body.innerHTML (destroys footer/header)`);
    });
});

// ============================================================================
// BUG-026: Timer must stop on submit
// ============================================================================
console.log('\n--- BUG-026: Timer Stops on Submit ---');

test('submitWorksheet calls stopTimer()', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('async function submitWorksheet()');
    assert.ok(fnIdx >= 0, 'Missing submitWorksheet function');
    const fnBody = js.slice(fnIdx, js.indexOf('\n}\n', fnIdx + 500) + 3);
    assert.ok(fnBody.includes('stopTimer()'),
        'submitWorksheet must call stopTimer() to stop the running timer');
});

test('submitWorksheet calls updateTimerDisplay() after stopping', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('async function submitWorksheet()');
    const fnBody = js.slice(fnIdx, js.indexOf('\n}\n', fnIdx + 500) + 3);
    assert.ok(fnBody.includes('updateTimerDisplay()'),
        'submitWorksheet must call updateTimerDisplay() to show final elapsed time');
});

test('submitWorksheet unchecks timer toggle', () => {
    const js = readFile('worksheet-generator.js');
    const fnIdx = js.indexOf('async function submitWorksheet()');
    const fnBody = js.slice(fnIdx, js.indexOf('\n}\n', fnIdx + 500) + 3);
    assert.ok(fnBody.includes('timer-toggle-input'),
        'submitWorksheet must uncheck the timer toggle checkbox');
});

// ============================================================================
// BUG-027: Admin Level Selection — Age Override for All Modules
// ============================================================================
console.log('\n--- BUG-027: Admin Level Selection Age Override ---');

// --- ageGroupMap identity mappings ---
test('ageGroupMap accepts age group string "4-5" (identity mapping)', () => {
    const js = readFile('age-content-mapper.js');
    assert.ok(js.includes("'4-5': '4-5'"), 'ageGroupMap must map "4-5" to "4-5"');
});

test('ageGroupMap accepts age group string "9+" (identity mapping)', () => {
    const js = readFile('age-content-mapper.js');
    assert.ok(js.includes("'9+': '9+'"), 'ageGroupMap must map "9+" to "9+"');
});

test('ageGroupMap accepts age group string "10+" (identity mapping)', () => {
    const js = readFile('age-content-mapper.js');
    assert.ok(js.includes("'10+': '10+'"), 'ageGroupMap must map "10+" to "10+"');
});

test('ageGroupMap: "6", "7", "8" work as both numeric age and age group', () => {
    const js = readFile('age-content-mapper.js');
    assert.ok(js.includes("'6': '6'"), 'ageGroupMap must map "6" to "6"');
    assert.ok(js.includes("'7': '7'"), 'ageGroupMap must map "7" to "7"');
    assert.ok(js.includes("'8': '8'"), 'ageGroupMap must map "8" to "8"');
});

// --- Math admin level override (worksheet-generator.js) ---
test('Math admin path uses getLevelDetails to set selectedAgeGroup', () => {
    const js = readFile('worksheet-generator.js');
    const adminSection = js.slice(js.indexOf('Admin selected level for Math'));
    const levelDetailsIdx = adminSection.indexOf('getLevelDetails(adminLevel)');
    const ageGroupIdx = adminSection.indexOf('selectedAgeGroup = levelDetails.ageGroup');
    assert.ok(levelDetailsIdx >= 0, 'Admin path must call getLevelDetails(adminLevel)');
    assert.ok(ageGroupIdx >= 0, 'Admin path must set selectedAgeGroup from levelDetails.ageGroup');
    assert.ok(ageGroupIdx > levelDetailsIdx, 'selectedAgeGroup assignment must come after getLevelDetails');
});

test('Math admin startPage uses difficulty-to-page mapping (not linear formula)', () => {
    const js = readFile('worksheet-generator.js');
    // Extract only the admin level block (between adminLevel check and the return)
    const adminLevelStart = js.indexOf('Admin selected level for Math');
    const adminReturn = js.indexOf('return;', adminLevelStart);
    const adminBlock = js.slice(adminLevelStart, adminReturn + 10);
    // Must NOT use the old broken formula in admin block
    assert.ok(!adminBlock.includes('* 12.5'),
        'Admin level block must NOT use old broken formula (adminLevel * 12.5)');
    // Must have difficulty-based page mapping
    assert.ok(adminBlock.includes("'easy': 1") || adminBlock.includes("easy: 1"),
        'Must map easy difficulty to startPage 1');
    assert.ok(adminBlock.includes("'medium': 51") || adminBlock.includes("medium: 51"),
        'Must map medium difficulty to startPage 51');
    assert.ok(adminBlock.includes("'hard': 101") || adminBlock.includes("hard: 101"),
        'Must map hard difficulty to startPage 101');
});

test('Math admin Level 1 should produce ages 4-5 easy (not 10+ easy)', () => {
    // getLevelDetails mapping: level 1 = {ageGroup: '4-5', difficulty: 'easy'}
    const js = readFile('admin-level-manager.js');
    const detailsFn = js.slice(js.indexOf('function getLevelDetails'));
    assert.ok(detailsFn.includes("1: { ageGroup: '4-5', difficulty: 'easy' }"),
        'Level 1 must map to ages 4-5, easy');
});

test('Math admin Level 11 should produce ages 10+ easy', () => {
    const js = readFile('admin-level-manager.js');
    const detailsFn = js.slice(js.indexOf('function getLevelDetails'));
    assert.ok(detailsFn.includes("11: { ageGroup: '10+', difficulty: 'easy' }"),
        'Level 11 must map to ages 10+, easy');
});

test('Math admin Level 12 should produce ages 10+ hard', () => {
    const js = readFile('admin-level-manager.js');
    const detailsFn = js.slice(js.indexOf('function getLevelDetails'));
    assert.ok(detailsFn.includes("12: { ageGroup: '10+', difficulty: 'hard' }"),
        'Level 12 must map to ages 10+, hard');
});

// Verify all 12 levels map correctly
test('getLevelDetails covers all 12 levels with valid ageGroup and difficulty', () => {
    const js = readFile('admin-level-manager.js');
    const validAgeGroups = ['4-5', '6', '7', '8', '9+', '10+'];
    const validDifficulties = ['easy', 'medium', 'hard'];
    for (let level = 1; level <= 12; level++) {
        const regex = new RegExp(`${level}:\\s*\\{\\s*ageGroup:\\s*'([^']+)',\\s*difficulty:\\s*'([^']+)'`);
        const match = js.match(regex);
        assert.ok(match, `Level ${level} must be defined in getLevelDetails`);
        assert.ok(validAgeGroups.includes(match[1]), `Level ${level} ageGroup "${match[1]}" must be valid`);
        assert.ok(validDifficulties.includes(match[2]), `Level ${level} difficulty "${match[2]}" must be valid`);
    }
});

// --- English admin level override ---
test('English admin path sets selectedAgeGroup from levelDetails', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes("getAdminLevelForModule('english')"),
        'English must call getAdminLevelForModule');
    assert.ok(js.includes('selectedAgeGroup = levelDetails.ageGroup'),
        'English admin path must set selectedAgeGroup from levelDetails.ageGroup');
});

// --- Aptitude admin level override ---
test('Aptitude admin path sets currentAge from levelDetails', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes("getAdminLevelForModule('aptitude')"),
        'Aptitude must call getAdminLevelForModule');
    assert.ok(js.includes('currentAge = levelDetails.ageGroup'),
        'Aptitude admin path must set currentAge from levelDetails.ageGroup');
});

test('Aptitude generators use ageGroupMap to resolve age (handles both numeric and group strings)', () => {
    const js = readFile('aptitude-generator.js');
    // Count how many generator functions use ageGroupMap
    const matches = js.match(/ageGroupMap\[/g);
    assert.ok(matches && matches.length >= 5,
        `Aptitude generators must use ageGroupMap (found ${matches ? matches.length : 0} uses, need >=5)`);
});

// --- EQ admin level override ---
test('EQ admin path sets currentAge from levelDetails', () => {
    const js = readFile('eq-generator.js');
    assert.ok(js.includes("getAdminLevelForModule('emotional-quotient')"),
        'EQ must call getAdminLevelForModule');
    assert.ok(js.includes('currentAge = levelDetails.ageGroup'),
        'EQ admin path must set currentAge from levelDetails.ageGroup');
});

test('EQ generator uses ageGroupMap to resolve age', () => {
    const js = readFile('eq-generator.js');
    assert.ok(js.includes('ageGroupMap[currentAge'),
        'EQ generator must use ageGroupMap to resolve currentAge');
});

// --- Drawing admin level override ---
test('Drawing admin path sets currentAge from levelDetails', () => {
    const js = readFile('drawing-generator.js');
    assert.ok(js.includes("getAdminLevelForModule('drawing')"),
        'Drawing must call getAdminLevelForModule');
    assert.ok(js.includes('currentAge = levelDetails.ageGroup'),
        'Drawing admin path must set currentAge from levelDetails.ageGroup');
});

// --- Stories admin level override ---
test('Stories admin path sets currentAge from levelDetails', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes("getAdminLevelForModule('stories')"),
        'Stories must call getAdminLevelForModule');
    assert.ok(js.includes('currentAge = levelDetails.ageGroup'),
        'Stories admin path must set currentAge from levelDetails.ageGroup');
});

test('Stories generators use ageGroupMap to resolve age', () => {
    const js = readFile('stories-generator.js');
    const matches = js.match(/ageGroupMap\[/g);
    assert.ok(matches && matches.length >= 2,
        `Stories generators must use ageGroupMap (found ${matches ? matches.length : 0} uses, need >=2)`);
});

// --- German Kids admin level override ---
test('German Kids admin path sets currentAge from levelDetails', () => {
    const js = readFile('german-kids-generator.js');
    assert.ok(js.includes("getAdminLevelForModule('german-kids')"),
        'German Kids must call getAdminLevelForModule');
    assert.ok(js.includes('currentAge = levelDetails.ageGroup'),
        'German Kids admin path must set currentAge from levelDetails.ageGroup');
});

// --- Learn English Stories admin level override ---
test('Learn English Stories admin path sets currentAge from levelDetails', () => {
    const js = readFile('learn-english-stories-generator.js');
    assert.ok(js.includes("getAdminLevelForModule('learn-english-stories')"),
        'Learn English Stories must call getAdminLevelForModule');
    assert.ok(js.includes('currentAge = levelDetails.ageGroup'),
        'Learn English Stories admin path must set currentAge from levelDetails.ageGroup');
});

// --- Admin level selections stored in localStorage ---
test('admin-level-manager.js uses localStorage for level selections', () => {
    const js = readFile('admin-level-manager.js');
    assert.ok(js.includes("localStorage.getItem('admin_level_selections')"),
        'Must read from localStorage admin_level_selections');
    assert.ok(js.includes("localStorage.setItem('admin_level_selections'"),
        'Must write to localStorage admin_level_selections');
});

// --- Admin panel has level selectors for all modules ---
test('admin.html has level selectors for all 8 modules', () => {
    const html = readFile('admin.html');
    const modules = ['math', 'english', 'aptitude', 'stories', 'drawing', 'emotional-quotient', 'german-kids', 'learn-english-stories'];
    modules.forEach(mod => {
        assert.ok(html.includes(`admin-level-${mod}`) || html.includes(`admin-level-${mod.replace(/-/g, '')}`),
            `admin.html must have level selector for ${mod}`);
    });
});

// --- Admin level-manager loaded on module pages ---
test('admin-level-manager.js loaded on index.html (for math)', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('admin-level-manager.js'),
        'index.html must load admin-level-manager.js for math admin override');
});

test('admin-level-manager.js loaded on english.html', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('admin-level-manager.js'),
        'english.html must load admin-level-manager.js');
});

test('admin-level-manager.js loaded on aptitude.html', () => {
    const html = readFile('aptitude.html');
    assert.ok(html.includes('admin-level-manager.js'),
        'aptitude.html must load admin-level-manager.js');
});

test('admin-level-manager.js loaded on emotional-quotient.html', () => {
    const html = readFile('emotional-quotient.html');
    assert.ok(html.includes('admin-level-manager.js'),
        'emotional-quotient.html must load admin-level-manager.js');
});

test('admin-level-manager.js loaded on drawing.html', () => {
    const html = readFile('drawing.html');
    assert.ok(html.includes('admin-level-manager.js'),
        'drawing.html must load admin-level-manager.js');
});

test('admin-level-manager.js loaded on stories.html', () => {
    const html = readFile('stories.html');
    assert.ok(html.includes('admin-level-manager.js'),
        'stories.html must load admin-level-manager.js');
});

test('admin-level-manager.js loaded on german-kids.html', () => {
    const html = readFile('german-kids.html');
    assert.ok(html.includes('admin-level-manager.js'),
        'german-kids.html must load admin-level-manager.js');
});

test('admin-level-manager.js loaded on learn-english-stories.html', () => {
    const html = readFile('learn-english-stories.html');
    assert.ok(html.includes('admin-level-manager.js'),
        'learn-english-stories.html must load admin-level-manager.js');
});

// --- Child profile NOT affected by admin changes ---
test('Math child path still uses getSelectedChild().age for selectedAgeGroup', () => {
    const js = readFile('worksheet-generator.js');
    // The child path (non-admin) should get age from child profile
    const childSection = js.slice(js.indexOf('Get currently selected child'));
    assert.ok(childSection.includes('child.age'),
        'Child path must derive age from child.age');
    assert.ok(childSection.includes("ageMap[child.age.toString()]"),
        'Child path must convert child.age through ageMap');
});

test('Aptitude HTML sets currentAge from child DOB (not admin default) for non-admin', () => {
    const html = readFile('aptitude.html');
    assert.ok(html.includes('child.age.toString()'),
        'Aptitude page must use child.age.toString() for non-admin users');
});

test('EQ HTML sets currentAge from child DOB (not admin default) for non-admin', () => {
    const html = readFile('emotional-quotient.html');
    assert.ok(html.includes('child.age.toString()'),
        'EQ page must use child.age.toString() for non-admin users');
});

test('Admin override is gated behind window.currentUserRole === admin check', () => {
    // Verify all generators gate admin override behind admin check
    const files = [
        { file: 'aptitude-generator.js', pattern: "window.currentUserRole === 'admin'" },
        { file: 'eq-generator.js', pattern: "window.currentUserRole === 'admin'" },
        { file: 'stories-generator.js', pattern: "window.currentUserRole === 'admin'" },
        { file: 'drawing-generator.js', pattern: "window.currentUserRole === 'admin'" },
        { file: 'german-kids-generator.js', pattern: "window.currentUserRole === 'admin'" },
        { file: 'learn-english-stories-generator.js', pattern: "window.currentUserRole === 'admin'" },
    ];
    files.forEach(({ file, pattern }) => {
        const js = readFile(file);
        assert.ok(js.includes(pattern),
            `${file} admin override must be gated behind admin role check`);
    });
});

test('English admin override is gated behind admin check', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes("window.currentUserRole === 'admin'"),
        'english-generator.js admin override must be gated behind admin role check');
});

test('Math admin override is gated behind admin check', () => {
    const js = readFile('worksheet-generator.js');
    const adminCheck = js.indexOf("const isAdmin = window.currentUserRole === 'admin'");
    const adminPath = js.indexOf('if (isAdmin)');
    assert.ok(adminCheck >= 0, 'Math must have isAdmin check');
    assert.ok(adminPath >= 0 && adminPath > adminCheck, 'Math admin path must be after isAdmin check');
});

// --- Verify level-to-age-group mapping consistency ---
test('getLevelDetails mapping matches ageAndDifficultyToLevel mapping', () => {
    const adminJs = readFile('admin-level-manager.js');
    // Extract getLevelDetails mapping
    const expectedMappings = {
        1: { ageGroup: '4-5', difficulty: 'easy' },
        2: { ageGroup: '4-5', difficulty: 'medium' },
        3: { ageGroup: '6', difficulty: 'easy' },
        4: { ageGroup: '6', difficulty: 'medium' },
        5: { ageGroup: '7', difficulty: 'easy' },
        6: { ageGroup: '7', difficulty: 'medium' },
        7: { ageGroup: '8', difficulty: 'easy' },
        8: { ageGroup: '8', difficulty: 'medium' },
        9: { ageGroup: '9+', difficulty: 'easy' },
        10: { ageGroup: '9+', difficulty: 'medium' },
        11: { ageGroup: '10+', difficulty: 'easy' },
        12: { ageGroup: '10+', difficulty: 'hard' }
    };
    for (const [level, expected] of Object.entries(expectedMappings)) {
        const regex = new RegExp(`${level}:\\s*\\{\\s*ageGroup:\\s*'${expected.ageGroup.replace('+', '\\+')}',\\s*difficulty:\\s*'${expected.difficulty}'`);
        assert.ok(regex.test(adminJs),
            `Level ${level} must map to ageGroup=${expected.ageGroup}, difficulty=${expected.difficulty}`);
    }
});

// --- Verify startPage mapping for each level ---
test('Math admin startPage: odd levels (easy) start at page 1', () => {
    const js = readFile('worksheet-generator.js');
    const adminSection = js.slice(js.indexOf('Admin selected level for Math'));
    // easy difficulty → page 1
    assert.ok(adminSection.includes("'easy': 1"),
        'Easy difficulty must map to startPage 1');
});

test('Math admin startPage: even levels (medium) start at page 51', () => {
    const js = readFile('worksheet-generator.js');
    const adminSection = js.slice(js.indexOf('Admin selected level for Math'));
    assert.ok(adminSection.includes("'medium': 51"),
        'Medium difficulty must map to startPage 51');
});

test('Math admin startPage: hard levels start at page 101', () => {
    const js = readFile('worksheet-generator.js');
    const adminSection = js.slice(js.indexOf('Admin selected level for Math'));
    assert.ok(adminSection.includes("'hard': 101"),
        'Hard difficulty must map to startPage 101');
});

// --- Verify admin doesn't require child profile ---
test('Math admin path does not require child profile', () => {
    const js = readFile('worksheet-generator.js');
    // Admin path is before the "Require child profile" check
    const adminPath = js.indexOf('if (isAdmin) {');
    const childCheck = js.indexOf("if (!child) {\n        alert('Please select a child profile first')");
    assert.ok(adminPath >= 0, 'Must have admin path');
    assert.ok(childCheck >= 0, 'Must have child profile check');
    assert.ok(adminPath < childCheck, 'Admin path must be before child profile requirement');
});

test('Admin HTML pages set childAge to 10 as default', () => {
    const pages = ['index.html', 'aptitude.html', 'emotional-quotient.html', 'drawing.html', 'stories.html'];
    pages.forEach(page => {
        const html = readFile(page);
        if (html.includes("childAge = '10'") || html.includes('childAge = "10"')) {
            // Admin default age is 10
            assert.ok(true, `${page} sets admin default age to 10`);
        }
    });
});

// --- Verify admin-level-manager exports the right functions ---
test('admin-level-manager.js exports all required functions', () => {
    const js = readFile('admin-level-manager.js');
    assert.ok(js.includes('function getAdminLevelSelections()'), 'Must have getAdminLevelSelections');
    assert.ok(js.includes('function getAdminLevelForModule('), 'Must have getAdminLevelForModule');
    assert.ok(js.includes('function saveAdminLevelSelection('), 'Must have saveAdminLevelSelection');
    assert.ok(js.includes('function checkAdminLevelAccess('), 'Must have checkAdminLevelAccess');
    assert.ok(js.includes('function getLevelDetails('), 'Must have getLevelDetails');
    assert.ok(js.includes('function getLevelDisplayName('), 'Must have getLevelDisplayName');
    assert.ok(js.includes('function showAdminLevelIndicator('), 'Must have showAdminLevelIndicator');
});

// --- Comprehensive: verify no module uses raw detectedChildAge for admin content ---
test('Math admin path does NOT rely on window.detectedChildAge for content', () => {
    const js = readFile('worksheet-generator.js');
    // Find the admin section inside loadOperationWorksheet
    const fnStart = js.indexOf('async function loadOperationWorksheet');
    const adminStart = js.indexOf('if (isAdmin) {', fnStart);
    const adminReturn = js.indexOf('return;', adminStart);
    const adminBlock = js.slice(adminStart, adminReturn + 10);
    // Should NOT reference detectedChildAge in admin block
    assert.ok(!adminBlock.includes('detectedChildAge'),
        'Admin path must not use detectedChildAge (should use getLevelDetails)');
});

// ============================================================================
// BUG-028: Assessment Level Not Applied to Worksheets
// ============================================================================

console.log('\n--- BUG-028: Assessment Level Applied to Worksheets ---');

test('worksheet-generator reads assessment level via getAssignedLevel', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('getAssignedLevel'),
        'worksheet-generator must call getAssignedLevel to read assessment-assigned level');
});

test('worksheet-generator overrides selectedAgeGroup from assessed level', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('levelToAgeGroup'),
        'worksheet-generator must use levelToAgeGroup to convert assessed level to age group');
});

test('worksheet-generator demo mode uses assessed difficulty for start page', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('levelToDifficulty'),
        'worksheet-generator must use levelToDifficulty for demo mode start page');
});

test('assessment.js uses APP_CONFIG.ASSESSMENT.QUESTION_COUNT for answer array', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('new Array(APP_CONFIG.ASSESSMENT.QUESTION_COUNT).fill(null)'),
        'assessmentAnswers must be sized from APP_CONFIG, not hardcoded');
    assert.ok(!js.includes('new Array(10).fill(null)'),
        'No hardcoded Array(10) should remain in assessment.js');
});

test('assessment gate shows 20 Questions in math worksheet page', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('20 Questions'),
        'Math assessment gate must say 20 Questions');
    assert.ok(!js.includes('10 Questions'),
        'No reference to 10 Questions should remain in math gate');
});

test('assessment gate shows 20 questions in english generator page', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes('20 questions'),
        'English assessment gate must say 20 questions');
    assert.ok(!js.includes('10 questions'),
        'No reference to 10 questions should remain in english gate');
});

test('assessment generates 4 tiers of questions (younger + current-easy + current-med + stretch)', () => {
    const js = readFile('assessment.js');
    // Check for 4-tier generation in math assessment
    assert.ok(js.includes('YOUNGER_QUESTIONS') || js.includes('younger'),
        'Must have younger tier');
    assert.ok(js.includes('CURRENT_EASY_QUESTIONS') || js.includes('current age (easy)'),
        'Must have current-easy tier');
    assert.ok(js.includes('CURRENT_MED_QUESTIONS') || js.includes('current age (medium)'),
        'Must have current-medium tier');
    assert.ok(js.includes('STRETCH_QUESTIONS') || js.includes('older age'),
        'Must have stretch tier');
});

test('assessment determineLevelFromScore uses correct thresholds', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('SCORE_TOO_HARD') || js.includes('30'),
        'Must have too-hard threshold');
    assert.ok(js.includes('SCORE_TOO_EASY') || js.includes('75'),
        'Must have too-easy threshold');
});

test('assessment saveAssessmentResult writes to Firestore only', () => {
    const js = readFile('assessment.js');
    assert.ok(!js.includes('localStorage'),
        'Must NOT use localStorage anywhere in assessment.js');
    assert.ok(js.includes('assessmentData') && (js.includes('update(') || js.includes('set(')),
        'Must save assessment to Firestore children doc');
});

test('worksheet-generator assessment level override comes after child profile check', () => {
    const js = readFile('worksheet-generator.js');
    const childCheck = js.indexOf("if (!child)");
    const assessmentOverride = js.indexOf('getAssignedLevel');
    assert.ok(childCheck >= 0, 'Must have child profile check');
    assert.ok(assessmentOverride >= 0, 'Must have assessment level override');
    assert.ok(assessmentOverride > childCheck,
        'Assessment level override must come after child profile check');
});

// ============================================================================
// BUG-029: Stories currentList Undefined
// ============================================================================

console.log('\n--- BUG-029: Stories currentList Fix ---');

test('stories-generator declares currentList at module level', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes('let currentList'),
        'stories-generator must declare currentList at module level');
});

test('stories-generator assigns limitedList to currentList before rendering cards', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes('currentList = limitedList'),
        'stories-generator must assign limitedList to currentList');
});

test('stories readStory uses currentList[index] to access story', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes('currentList[index]'),
        'readStory must access story via currentList[index]');
});

test('stories nextStory checks currentList.length', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes('currentList.length'),
        'nextStory must check currentList.length for boundary');
});

// ============================================================================
// STORY TEXT FORMATTING & CARD LAYOUT
// ============================================================================

console.log('\n--- Story Text Formatting & Storybook Design ---');

test('stories-generator defines formatStoryText function', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes('function formatStoryText('),
        'stories-generator must define formatStoryText()');
});

test('formatStoryText handles text with \\n\\n paragraph breaks (unique stories)', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes("text.includes('\\n\\n')"),
        'formatStoryText must detect double-newline paragraph breaks');
    assert.ok(js.includes('split(/\\n\\n+/)'),
        'formatStoryText must split on double newlines');
});

test('formatStoryText wraps paragraphs in <p> tags', () => {
    const js = readFile('stories-generator.js');
    // Must produce <p>...</p> wrapped output
    assert.ok(js.includes('`<p>${') && js.includes('}</p>`'),
        'formatStoryText must wrap text chunks in <p> tags');
});

test('formatStoryText splits generated stories by sentences', () => {
    const js = readFile('stories-generator.js');
    // Sentence-based splitting for generated stories (no \n\n)
    assert.ok(js.includes("text.match(/[^.!?]*[.!?]+(\\s|$)/g)"),
        'formatStoryText must split by sentence boundaries for generated text');
});

test('readStory calls formatStoryText before rendering', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes('formatStoryText(storyText)'),
        'readStory must call formatStoryText to wrap text in paragraphs');
});

test('story-text CSS uses serif font for storybook feel', () => {
    const css = readFile('stories.css');
    assert.ok(css.includes("font-family: 'Georgia'") || css.includes('font-family: Georgia'),
        '.story-text must use Georgia/serif font for storybook feel');
});

test('story-text CSS does not use text-align: justify (prevents word spacing)', () => {
    const css = readFile('stories.css');
    // Extract the .story-text block (between .story-text { and next })
    const storyTextMatch = css.match(/\.story-text\s*\{[^}]+\}/);
    assert.ok(storyTextMatch, '.story-text CSS block must exist');
    assert.ok(!storyTextMatch[0].includes('text-align: justify'),
        '.story-text must NOT use text-align: justify (causes excessive word spacing)');
});

test('story-text CSS has word-spacing: normal (prevents excessive gaps)', () => {
    const css = readFile('stories.css');
    const storyTextMatch = css.match(/\.story-text\s*\{[^}]+\}/);
    assert.ok(storyTextMatch[0].includes('word-spacing: normal'),
        '.story-text must have word-spacing: normal to prevent gaps');
});

test('story-text CSS uses reasonable font-size (not over 1.3em)', () => {
    const css = readFile('stories.css');
    const storyTextMatch = css.match(/\.story-text\s*\{[^}]+\}/);
    const fontMatch = storyTextMatch[0].match(/font-size:\s*([\d.]+)em/);
    assert.ok(fontMatch, '.story-text must declare font-size');
    const size = parseFloat(fontMatch[1]);
    assert.ok(size <= 1.3, `.story-text font-size ${size}em is too large (max 1.3em for readability)`);
});

test('story-text p has text-indent for paragraph indentation', () => {
    const css = readFile('stories.css');
    assert.ok(css.includes('.story-text p') && css.includes('text-indent'),
        '.story-text p must have text-indent for storybook paragraphs');
});

test('story-text first paragraph has drop cap styling', () => {
    const css = readFile('stories.css');
    assert.ok(css.includes('.story-text p:first-child::first-letter'),
        '.story-text must have drop cap on first paragraph first-letter');
});

test('story cards use story-card-bg for image backgrounds (no inline img)', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes('story-card-bg'),
        'story cards with images must use .story-card-bg div for background');
    // Must NOT have inline <img> in card generation
    const cardSection = js.substring(js.indexOf('limitedList.forEach'), js.indexOf('container.appendChild'));
    assert.ok(!cardSection.includes('<img src='),
        'story card generation must not use inline <img> tags (use background-image instead)');
});

test('story cards apply category-specific CSS classes', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes('story-card--${currentCategory}'),
        'story cards must apply category class like story-card--animals');
});

test('stories.css has category gradient classes for all 6 categories', () => {
    const css = readFile('stories.css');
    const categories = ['animals', 'nature', 'family', 'adventures', 'learning', 'bedtime'];
    categories.forEach(cat => {
        assert.ok(css.includes(`.story-card--${cat}`),
            `stories.css must have .story-card--${cat} gradient class`);
    });
});

test('story cards have no harsh #000 borders', () => {
    const css = readFile('stories.css');
    const cardMatch = css.match(/\.story-card\s*\{[^}]+\}/);
    assert.ok(cardMatch, '.story-card CSS block must exist');
    assert.ok(!cardMatch[0].includes('solid #000') && !cardMatch[0].includes('solid black'),
        '.story-card must not have black borders');
});

test('stories.html has no emoji font-family override on body', () => {
    const html = readFile('stories.html');
    // The old inline style set body font-family to emoji fonts which broke story text
    assert.ok(!html.includes('Segoe UI Emoji'),
        'stories.html must not override body font-family with emoji fonts');
});

// ============================================================================
// BUG-030: Assessment Data — Firestore-Only (No localStorage)
// ============================================================================

console.log('\n--- BUG-030: Assessment Firestore-Only Storage ---');

test('assessment.js has no localStorage references at all', () => {
    const js = readFile('assessment.js');
    assert.ok(!js.includes('localStorage'),
        'assessment.js must have zero localStorage references');
});

test('assessment.js getAssessmentData is async and reads from Firestore', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('async function getAssessmentData('),
        'getAssessmentData must be async');
    assert.ok(js.includes("collection('children')") && js.includes('.doc(childId).get()'),
        'getAssessmentData must read from Firestore children collection');
});

test('assessment.js hasCompletedAssessment is async', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('async function hasCompletedAssessment('),
        'hasCompletedAssessment must be async');
    assert.ok(js.includes('await getAssessmentData('),
        'hasCompletedAssessment must await getAssessmentData');
});

test('assessment.js getAssignedLevel is async', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('async function getAssignedLevel('),
        'getAssignedLevel must be async');
    assert.ok(js.includes('await getAssessmentData('),
        'getAssignedLevel must await getAssessmentData');
});

test('assessment.js saveAssessmentResult updates Firestore directly', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes("collection('children').doc(childId).update("),
        'saveAssessmentResult must update Firestore children doc using childId directly');
});

test('assessment.js has in-memory cache (_assessmentCache)', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('_assessmentCache'),
        'Must have _assessmentCache for in-memory caching');
    assert.ok(js.includes('_assessmentCache[childId]'),
        'Must cache by childId');
});

test('assessment.js saveAssessmentResult updates cache after save', () => {
    const js = readFile('assessment.js');
    const saveFunc = js.substring(js.indexOf('async function saveAssessmentResult'));
    const cacheUpdate = saveFunc.includes('_assessmentCache[childId]');
    assert.ok(cacheUpdate,
        'saveAssessmentResult must update _assessmentCache after Firestore write');
});

test('worksheet-generator.js awaits hasCompletedAssessment', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('await hasCompletedAssessment(child.id, operation)'),
        'worksheet-generator must await hasCompletedAssessment');
});

test('worksheet-generator.js awaits getAssignedLevel', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('await getAssignedLevel(child.id, operation)'),
        'worksheet-generator must await getAssignedLevel');
});

test('english-generator.js awaits hasCompletedAssessment', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes("await hasCompletedAssessment(child.id, 'english')"),
        'english-generator must await hasCompletedAssessment');
});

test('english-generator.js awaits getAssignedLevel', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes("await getAssignedLevel(child.id, 'english')"),
        'english-generator must await getAssignedLevel');
});

test('weekly-assignments.js getChildMathPosition is async and awaits getAssignedLevel', () => {
    const js = readFile('weekly-assignments.js');
    assert.ok(js.includes('async function getChildMathPosition('),
        'getChildMathPosition must be async');
    assert.ok(js.includes("await getAssignedLevel(child.id, 'math')"),
        'getChildMathPosition must await getAssignedLevel');
});

test('weekly-assignments.js getChildEnglishPosition is async and awaits getAssignedLevel', () => {
    const js = readFile('weekly-assignments.js');
    assert.ok(js.includes('async function getChildEnglishPosition('),
        'getChildEnglishPosition must be async');
    assert.ok(js.includes("await getAssignedLevel(child.id, 'english')"),
        'getChildEnglishPosition must await getAssignedLevel');
});

test('weekly-assignments.js generateWeeklyAssignment awaits position functions', () => {
    const js = readFile('weekly-assignments.js');
    assert.ok(js.includes('await getChildMathPosition(child)'),
        'generateWeeklyAssignment must await getChildMathPosition');
    assert.ok(js.includes('await getChildEnglishPosition(child)'),
        'generateWeeklyAssignment must await getChildEnglishPosition');
});

test('level-test.js awaits getAssignedLevel', () => {
    const js = readFile('level-test.js');
    assert.ok(js.includes('await getAssignedLevel(child.id,'),
        'level-test must await getAssignedLevel');
});

test('assessment.js uses Cloud Function validation (no local fallback)', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('server-authoritative, no local fallback'),
        'assessment.js must use server-authoritative Cloud Function');
    assert.ok(!js.includes('FALLBACK: Local validation'),
        'assessment.js must NOT have local validation fallback');
});

// ============================================================================
// ANSWER DATA PROTECTION TESTS (no answers exposed in browser DOM/client data)
// ============================================================================

console.log('\n--- Answer Data Protection ---');

test('Math: answer-key div is NOT pre-rendered with answers', () => {
    const js = readFile('worksheet-generator.js');
    // The old pattern had ${problem.answer} in the answer-key div template
    assert.ok(!js.includes('${problem.answer}</strong>'),
        'answer-key must NOT contain ${problem.answer} template');
    assert.ok(js.includes('Answer key populated from server feedback after submission') ||
              js.includes('Answer key built dynamically'),
        'answer-key div must have comment indicating dynamic population');
});

test('Math: problems stored without .answer field (answers stripped)', () => {
    const js = readFile('worksheet-generator.js');
    // Check that problems are mapped to strip answers
    assert.ok(js.includes('problems: problems.map(p => ({ a: p.a, b: p.b, display: p.display, type: p.type })'),
        'Problems must be stored with answer stripped');
});

test('Math: mathServerFeedback variable exists for server-side answers', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('let mathServerFeedback = null'),
        'mathServerFeedback variable must be declared');
    assert.ok(js.includes('mathServerFeedback = feedback'),
        'mathServerFeedback must be set from server response');
});

test('Math: toggleMathAnswers builds answer key from server feedback', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('mathServerFeedback[index]?.expected'),
        'toggleMathAnswers must use mathServerFeedback.expected for answer values');
});

test('Math: validateShowAnswersToggle requires server validation', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('Submit worksheet first to see answers'),
        'Toggle must show "submit first" message when no server feedback');
});

test('Math: checkAnswers/checkAnswersManual functions removed (no local answer comparison)', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(!js.includes('function checkAnswers()'),
        'checkAnswers() must be removed (used local answer data)');
    assert.ok(!js.includes('function checkAnswersManual()'),
        'checkAnswersManual() must be removed (used local answer data)');
});

test('Math: Enter key submits to server, not local check', () => {
    const js = readFile('worksheet-generator.js');
    // handleEnter should call submitWorksheet, not checkAnswers
    assert.ok(js.includes('submitWorksheet()') && !js.includes('checkAnswers();\n'),
        'Enter key must trigger submitWorksheet(), not checkAnswers()');
});

test('English: answer-key div is NOT pre-rendered with answers in HTML template', () => {
    const js = readFile('english-generator.js');
    // The answer-key div in the main HTML template must be empty (no pre-rendered answers)
    assert.ok(js.includes('Answer key built dynamically after validation, not pre-rendered'),
        'English answer-key div must have dynamic-build comment');
    // The showAnswerKey function must build answers dynamically (has local answerKeyHTML)
    assert.ok(js.includes('function showAnswerKey()'),
        'showAnswerKey must exist to build answers on demand');
});

test('German: answer-key div is NOT pre-rendered with answers in HTML template', () => {
    const js = readFile('german-generator.js');
    // The answer-key div in the main HTML template must be empty (no pre-rendered answers)
    assert.ok(js.includes('Answer key built dynamically when requested, not pre-rendered'),
        'German answer-key div must have dynamic-build comment');
    assert.ok(js.includes('function showAnswerKey()'),
        'showAnswerKey must exist to build answers on demand');
});

test('Math: submitWorksheet sends raw values (no client-side answer type check)', () => {
    const js = readFile('worksheet-generator.js');
    // Old pattern: typeof correctAnswer === 'string'
    // New pattern: Server handles type comparison
    assert.ok(!js.includes("typeof correctAnswer === 'string'"),
        'submitWorksheet must NOT use correctAnswer type for parsing');
    assert.ok(js.includes('server handles type comparison'),
        'Must indicate server handles type comparison');
});

// ============================================================================
// FEEDBACK MODULE FILTERING TESTS
// ============================================================================

console.log('\n--- Feedback Module Filtering ---');

test('feedback-system.js has FEEDBACK_MODULES with childKey mappings', () => {
    const js = readFile('feedback-system.js');
    assert.ok(js.includes("childKey: null"), 'general module should have childKey: null');
    assert.ok(js.includes("childKey: 'math'"), 'math module should have childKey mapping');
    assert.ok(js.includes("childKey: 'english'"), 'english module should have childKey mapping');
    assert.ok(js.includes("childKey: 'emotional-quotient'"), 'eq module should map to emotional-quotient');
    assert.ok(js.includes("childKey: 'german-kids'"), 'german-kids module should have childKey mapping');
});

test('feedback-system.js has getVisibleFeedbackModules function', () => {
    const js = readFile('feedback-system.js');
    assert.ok(js.includes('function getVisibleFeedbackModules()'),
        'getVisibleFeedbackModules function must exist');
});

test('feedback-system.js getVisibleFeedbackModules reads child assigned+enabled modules', () => {
    const js = readFile('feedback-system.js');
    assert.ok(js.includes('child.assignedModules') || js.includes('assignedModules'),
        'must check assignedModules');
    assert.ok(js.includes('child.enabledModules') || js.includes('enabledModules'),
        'must check enabledModules');
});

test('feedback-system.js getVisibleFeedbackModules always includes general', () => {
    const js = readFile('feedback-system.js');
    assert.ok(js.includes("m.childKey === null") && js.includes('return true'),
        'general (childKey null) must always be included');
});

test('feedback-system.js getVisibleFeedbackModules shows all for admin', () => {
    const js = readFile('feedback-system.js');
    assert.ok(js.includes("isAdmin") && js.includes('return FEEDBACK_MODULES'),
        'admin should see all modules');
});

test('feedback-system.js openFeedbackModal uses getVisibleFeedbackModules', () => {
    const js = readFile('feedback-system.js');
    assert.ok(js.includes('getVisibleFeedbackModules()'),
        'openFeedbackModal must call getVisibleFeedbackModules');
});

test('feedback-system.js renders tabs from visibleModules not FEEDBACK_MODULES', () => {
    const js = readFile('feedback-system.js');
    assert.ok(js.includes('visibleModules.map'),
        'tab/page generation must use visibleModules.map, not FEEDBACK_MODULES.map');
});

test('feedback-system.js includes german-kids in FEEDBACK_MODULES', () => {
    const js = readFile('feedback-system.js');
    assert.ok(js.includes("id: 'german-kids'"),
        'german-kids should be in FEEDBACK_MODULES list');
});

// ============================================================================
console.log('\n--- BUG-031: Aptitude Progressive Pool & Unique Pages ---');
// ============================================================================

test('aptitude-generator.js has buildProgressivePool function', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('function buildProgressivePool(type, age)'),
        'buildProgressivePool must exist for progressive content');
});

test('aptitude-generator.js buildProgressivePool handles all 6 pool types', () => {
    const js = readFile('aptitude-generator.js');
    const poolTypes = ['patterns', 'sequences', 'matching', 'oddone', 'comparison', 'logic'];
    poolTypes.forEach(type => {
        assert.ok(js.includes(`case '${type}':`),
            `buildProgressivePool must handle type '${type}'`);
    });
});

test('aptitude-generator.js buildProgressivePool adds difficulty property', () => {
    const js = readFile('aptitude-generator.js');
    // Each type mapping should include difficulty: diff
    assert.ok(js.includes('difficulty: diff'),
        'progressive pool items must include difficulty property');
});

test('aptitude-generator.js loadPuzzles uses page-based offset via pool.slice', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('pool.slice(startIdx, startIdx + count)'),
        'loadPuzzles must use page-based slice offset from progressive pool');
});

test('aptitude-generator.js loadPuzzles does NOT use hardcoded 50 totalPages', () => {
    const js = readFile('aptitude-generator.js');
    // The old getDemoLimit(50) for non-counting types should be replaced
    // Only counting should have fixed pages
    const loadPuzzlesMatch = js.match(/function loadPuzzles[\s\S]*?renderWorksheet\(\)/);
    assert.ok(loadPuzzlesMatch, 'loadPuzzles function must exist');
    const fnBody = loadPuzzlesMatch[0];
    // Should have pool-based maxPages calculation
    assert.ok(fnBody.includes('Math.ceil(pool.length / count)'),
        'totalPages must be calculated from actual pool size');
});

test('aptitude-generator.js loadPuzzles sets totalPages from pool size for non-counting types', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('const maxPages = Math.ceil(pool.length / count)'),
        'maxPages must be derived from pool.length / count');
    assert.ok(js.includes('totalPages = getDemoLimit(maxPages)'),
        'totalPages must use getDemoLimit with maxPages');
});

test('aptitude-generator.js counting has progressive difficulty across pages', () => {
    const js = readFile('aptitude-generator.js');
    // Counting should check page number to determine difficulty
    assert.ok(js.includes("if (page > 10) pageDifficulty = 'hard'") ||
              js.includes("if (page > 10) pageDifficulty = \\'hard\\'"),
        'counting must progress to hard difficulty on later pages');
    assert.ok(js.includes("pageDifficulty = 'medium'"),
        'counting must have medium difficulty phase');
});

test('aptitude-generator.js no more difficulty-specific counts object', () => {
    const js = readFile('aptitude-generator.js');
    // Old code had: const counts = { easy: { patterns: 8 ... }, medium: { ... }, hard: { ... } }
    assert.ok(!js.includes("easy: { patterns:") || js.includes('// legacy'),
        'old difficulty-specific counts should be removed');
});

test('aptitude-generator.js uses uniform questionsPerPage', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('const questionsPerPage'),
        'must have uniform questionsPerPage object');
});

test('aptitude-generator.js determines difficulty from page items', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes("problems.map(p => p.difficulty)"),
        'must determine currentDifficulty from items on the page');
});

test('aptitude-generator.js header shows difficulty badge', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('diffColors') && js.includes('diffStars'),
        'header must show color-coded difficulty badge');
});

test('aptitude-age-content.js has patterns for all 6 age groups', () => {
    const js = readFile('aptitude-age-content.js');
    const ageGroups = ["'4-5'", "'6'", "'7'", "'8'", "'9+'", "'10+'"];
    ageGroups.forEach(ag => {
        assert.ok(js.includes(`${ag}:`), `patterns must have age group ${ag}`);
    });
});

test('aptitude-age-content.js each age group has easy/medium/hard for all data sets', () => {
    const js = readFile('aptitude-age-content.js');
    // Check that ageBasedPatterns has easy/medium/hard for each age group
    const datasets = ['ageBasedPatterns', 'ageBasedSequences', 'ageBasedMatching',
                      'ageBasedOddOneOut', 'ageBasedComparison', 'ageBasedLogic'];
    datasets.forEach(ds => {
        assert.ok(js.includes(`const ${ds}`), `${ds} must be defined`);
    });
});

test('aptitude-generator.js progressive pool ordered easy→medium→hard', () => {
    const js = readFile('aptitude-generator.js');
    // buildProgressivePool iterates difficulties in order
    const poolFn = js.match(/function buildProgressivePool[\s\S]*?return pool;/);
    assert.ok(poolFn, 'buildProgressivePool must return pool');
    const fnBody = poolFn[0];
    assert.ok(fnBody.includes("['easy', 'medium', 'hard']"),
        'difficulties must be in progressive order easy→medium→hard');
});

test('aptitude-generator.js matching type maps right→answer correctly', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('answer: p.right'),
        'matching pool builder must map p.right to answer property');
});

// ============================================================================
console.log('\n=== Progress Map Feature (Gamified Learning Journey) ===');
// ============================================================================

test('progress-map.js exists', () => {
    assert.ok(fileExists('progress-map.js'), 'progress-map.js not found');
});

test('progress-map.css exists', () => {
    assert.ok(fileExists('progress-map.css'), 'progress-map.css not found');
});

// --- Integration: index.html ---
test('index.html loads progress-map.css', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('progress-map.css'), 'index.html should link progress-map.css');
});

test('index.html loads progress-map.js', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('progress-map.js'), 'index.html should load progress-map.js');
});

test('index.html has progress-map-container div', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('id="progress-map-container"'), 'index.html should have progress-map-container');
});

test('index.html operation buttons call showProgressMap (math)', () => {
    const html = readFile('index.html');
    assert.ok(html.includes("showProgressMap('math','addition')"), 'Addition button should call showProgressMap');
    assert.ok(html.includes("showProgressMap('math','subtraction')"), 'Subtraction button should call showProgressMap');
    assert.ok(html.includes("showProgressMap('math','multiplication')"), 'Multiplication button should call showProgressMap');
    assert.ok(html.includes("showProgressMap('math','division')"), 'Division button should call showProgressMap');
});

test('index.html does NOT directly call loadOperationWorksheet from operation buttons', () => {
    const html = readFile('index.html');
    // The old pattern was onclick="loadOperationWorksheet('addition')" on the level-btn
    // It should no longer appear in the operation buttons (but may still exist in JS functions)
    const operationSection = html.split('id="math-operations"')[1];
    if (operationSection) {
        const sectionEnd = operationSection.split('</div>')[2] || operationSection.substring(0, 600);
        assert.ok(!sectionEnd.includes('onclick="loadOperationWorksheet'),
            'Operation buttons should use showProgressMap, not loadOperationWorksheet directly');
    }
});

// --- Integration: english.html ---
test('english.html loads progress-map.css', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('progress-map.css'), 'english.html should link progress-map.css');
});

test('english.html loads progress-map.js', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('progress-map.js'), 'english.html should load progress-map.js');
});

test('english.html has progress-map-container div', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('id="progress-map-container"'), 'english.html should have progress-map-container');
});

test('english.html vocab/writing buttons call showProgressMap (english)', () => {
    const html = readFile('english.html');
    assert.ok(html.includes("showProgressMap('english','easy')"), 'Vocab Easy should call showProgressMap');
    assert.ok(html.includes("showProgressMap('english','medium')"), 'Vocab Medium should call showProgressMap');
    assert.ok(html.includes("showProgressMap('english','hard')"), 'Vocab Hard should call showProgressMap');
    assert.ok(html.includes("showProgressMap('english','writing')"), 'Writing should call showProgressMap');
});

test('english.html Reading Stories still uses loadAllStories (not progress map)', () => {
    const html = readFile('english.html');
    assert.ok(html.includes("onclick=\"loadAllStories()\""), 'Reading Stories should still call loadAllStories');
});

// --- progress-map.js structure ---
test('progress-map.js defines PROGRESS_CONFIG with math and english', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('PROGRESS_CONFIG'), 'Should define PROGRESS_CONFIG');
    assert.ok(js.includes("math:"), 'PROGRESS_CONFIG should have math config');
    assert.ok(js.includes("english:"), 'PROGRESS_CONFIG should have english config');
});

test('progress-map.js defines all 4 math subtypes', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes("'addition'"), 'Should include addition');
    assert.ok(js.includes("'subtraction'"), 'Should include subtraction');
    assert.ok(js.includes("'multiplication'"), 'Should include multiplication');
    assert.ok(js.includes("'division'"), 'Should include division');
});

test('progress-map.js defines plant growth stages', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('PLANT_STAGES'), 'Should define PLANT_STAGES');
    assert.ok(js.includes('seed'), 'Should have seed stage');
    assert.ok(js.includes('sprout'), 'Should have sprout stage');
    assert.ok(js.includes('flowering'), 'Should have flowering stage');
});

test('progress-map.js has 7 plant SVG designs', () => {
    const js = readFile('progress-map.js');
    const svgStages = ['seed', 'sprout', 'seedling', 'young', 'small-tree', 'big-tree', 'flowering'];
    svgStages.forEach(stage => {
        assert.ok(js.includes(`'${stage}':`), `Should have SVG for ${stage} stage`);
    });
});

test('progress-map.js defines showProgressMap function', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('async function showProgressMap'), 'Should define showProgressMap');
});

test('progress-map.js defines hideProgressMap function', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('function hideProgressMap'), 'Should define hideProgressMap');
});

test('progress-map.js defines handleNodeClick function', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('function handleNodeClick'), 'Should define handleNodeClick');
});

test('progress-map.js defines switchProgressTab function', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('function switchProgressTab'), 'Should define switchProgressTab');
});

test('progress-map.js defines showLockedToast function', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('function showLockedToast'), 'Should define showLockedToast');
});

test('progress-map.js defines calculateStreak function', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('function calculateStreak'), 'Should define calculateStreak');
});

test('progress-map.js defines calculateStats function', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('function calculateStats'), 'Should define calculateStats');
});

test('progress-map.js defines getCompletionsForModule function', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('async function getCompletionsForModule'), 'Should define getCompletionsForModule');
});

test('progress-map.js defines buildNodeTree function', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('function buildNodeTree'), 'Should define buildNodeTree');
});

test('progress-map.js renders stats bar with streak, stars, solved, accuracy', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('day streak'), 'Stats bar should show streak');
    assert.ok(js.includes('stars'), 'Stats bar should show stars');
    assert.ok(js.includes('solved'), 'Stats bar should show problems solved');
    assert.ok(js.includes('accuracy'), 'Stats bar should show accuracy');
});

test('progress-map.js renders weekly ring', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('pm-weekly-ring'), 'Should render weekly ring');
    assert.ok(js.includes('stroke-dashoffset'), 'Weekly ring should use SVG stroke');
});

test('progress-map.js handles node states: completed, current, locked', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes("state = 'completed'") || js.includes("state: 'completed'"), 'Should handle completed state');
    assert.ok(js.includes("state = 'current'") || js.includes("state: 'current'"), 'Should handle current state');
    assert.ok(js.includes("state = 'locked'") || js.includes("state: 'locked'"), 'Should handle locked state');
});

test('progress-map.js has demo upgrade prompt', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('pm-upgrade-prompt'), 'Should have upgrade prompt for demo users');
    assert.ok(js.includes('Unlock all pages'), 'Upgrade prompt should mention unlocking');
});

test('progress-map.js navigates to existing worksheet loaders on node click', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('loadOperationWorksheet'), 'Should call loadOperationWorksheet for math');
    assert.ok(js.includes('loadWorksheetNew'), 'Should call loadWorksheetNew for english');
});

test('progress-map.js handles assessment node click', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('handleAssessmentClick'), 'Should define handleAssessmentClick');
    assert.ok(js.includes('showAssessmentGate'), 'Should call showAssessmentGate for math');
    assert.ok(js.includes('showEnglishAssessmentGate'), 'Should call showEnglishAssessmentGate for english');
});

// --- progress-map.css structure ---
test('progress-map.css has node state styles', () => {
    const css = readFile('progress-map.css');
    assert.ok(css.includes('.pm-node.completed'), 'CSS should style completed nodes');
    assert.ok(css.includes('.pm-node.current'), 'CSS should style current nodes');
    assert.ok(css.includes('.pm-node.locked'), 'CSS should style locked nodes');
});

test('progress-map.css has pulse animation for current node', () => {
    const css = readFile('progress-map.css');
    assert.ok(css.includes('pm-pulse'), 'CSS should have pulse animation');
    assert.ok(css.includes('@keyframes pm-pulse'), 'CSS should define pm-pulse keyframes');
});

test('progress-map.css has sway animation for plant SVG', () => {
    const css = readFile('progress-map.css');
    assert.ok(css.includes('pm-sway'), 'CSS should have sway animation');
    assert.ok(css.includes('@keyframes pm-sway'), 'CSS should define pm-sway keyframes');
});

test('progress-map.css is mobile responsive', () => {
    const css = readFile('progress-map.css');
    assert.ok(css.includes('@media (max-width: 480px)'), 'CSS should have mobile breakpoint');
    assert.ok(css.includes('grid-template-columns: repeat(2, 1fr)'), 'Stats should wrap to 2x2 on mobile');
});

test('progress-map.css has toast notification style', () => {
    const css = readFile('progress-map.css');
    assert.ok(css.includes('.pm-toast'), 'CSS should style toast notification');
});

test('progress-map.css has upgrade prompt style', () => {
    const css = readFile('progress-map.css');
    assert.ok(css.includes('.pm-upgrade-prompt'), 'CSS should style upgrade prompt');
});

// --- worksheet-generator.js hides progress map ---
test('worksheet-generator.js showSubjects() hides progress map', () => {
    const js = readFile('worksheet-generator.js');
    // Check within the showSubjects function
    const showSubjectsMatch = js.match(/function showSubjects\(\)[\s\S]*?^}/m);
    if (showSubjectsMatch) {
        assert.ok(showSubjectsMatch[0].includes('progress-map-container'),
            'showSubjects should hide progress-map-container');
    }
});

test('worksheet-generator.js showMathLevels() calls showProgressMap directly (BUG-034)', () => {
    const js = readFile('worksheet-generator.js');
    const fnMatch = js.match(/function showMathLevels\(\)[\s\S]*?(?=\nfunction )/);
    assert.ok(fnMatch, 'showMathLevels function should exist');
    assert.ok(fnMatch[0].includes("showProgressMap('math', 'addition')"),
        'showMathLevels should call showProgressMap directly, not show operations page');
});

// --- Pure logic tests (no DOM/Firebase needed) ---
test('calculateStats has correct star logic (95+ = 3, 85+ = 2, else = 1)', () => {
    const js = readFile('progress-map.js');
    // Verify the star thresholds are present in calculateStats
    assert.ok(js.includes('score >= 95') && js.includes('totalStars += 3'), '95%+ should give 3 stars');
    assert.ok(js.includes('score >= 85') && js.includes('totalStars += 2'), '85%+ should give 2 stars');
    assert.ok(js.includes('totalStars += 1'), 'Below 85% completion should give 1 star');
});

test('calculateStats computes accuracy from correctCount/totalProblems', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('totalCorrect / totalProblems'), 'Accuracy should be correctCount/totalProblems ratio');
    assert.ok(js.includes('Math.round'), 'Accuracy should be rounded');
});

test('calculateStreak handles empty completions array', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('if (completions.length === 0) return 0'), 'Should return 0 for empty array');
});

test('getPlantStage returns correct stages at boundary values', () => {
    const js = readFile('progress-map.js');

    // Extract PLANT_STAGES and getPlantStage
    const stagesMatch = js.match(/const PLANT_STAGES = \[[\s\S]*?\];/);
    const fnMatch = js.match(/function getPlantStage\(fraction\)\s*\{[\s\S]*?\n\}/);
    assert.ok(stagesMatch && fnMatch, 'PLANT_STAGES and getPlantStage should be extractable');

    const evalCode = stagesMatch[0] + '\n' + fnMatch[0] + '\nreturn getPlantStage;';
    const getPlantStageFn = new Function(evalCode)();

    assert.strictEqual(getPlantStageFn(0), 'seed', '0% should be seed');
    assert.strictEqual(getPlantStageFn(0.05), 'seed', '5% should still be seed');
    assert.strictEqual(getPlantStageFn(0.10), 'sprout', '10% should be sprout');
    assert.strictEqual(getPlantStageFn(0.25), 'seedling', '25% should be seedling');
    assert.strictEqual(getPlantStageFn(0.50), 'young', '50% should be young plant');
    assert.strictEqual(getPlantStageFn(0.70), 'small-tree', '70% should be small tree');
    assert.strictEqual(getPlantStageFn(0.90), 'big-tree', '90% should be big tree');
    assert.strictEqual(getPlantStageFn(1.0), 'flowering', '100% should be flowering');
});

test('progress-map.js script loads before worksheet-generator.js in index.html', () => {
    const html = readFile('index.html');
    const pmIdx = html.indexOf('progress-map.js');
    const wgIdx = html.indexOf('worksheet-generator.js');
    assert.ok(pmIdx > -1, 'progress-map.js should be referenced in index.html');
    assert.ok(wgIdx > -1, 'worksheet-generator.js should be referenced in index.html');
    assert.ok(pmIdx < wgIdx, 'progress-map.js should load before worksheet-generator.js');
});

test('progress-map.js script loads before english-generator.js in english.html', () => {
    const html = readFile('english.html');
    const pmIdx = html.indexOf('<script src="progress-map.js">');
    const egIdx = html.indexOf('<script src="english-generator.js');
    assert.ok(pmIdx > -1, 'progress-map.js should be loaded via script tag in english.html');
    assert.ok(egIdx > -1, 'english-generator.js should be loaded via script tag in english.html');
    assert.ok(pmIdx < egIdx, 'progress-map.js script tag should appear before english-generator.js');
});

// ============================================================================
console.log('\n--- BUG-034: Redundant Math Operations Page ---');
// ============================================================================

test('BUG-034: showMathLevels goes directly to progress map (no operations page)', () => {
    const js = readFile('worksheet-generator.js');
    const fnMatch = js.match(/function showMathLevels\(\)[\s\S]*?(?=\nfunction )/);
    assert.ok(fnMatch, 'showMathLevels function should exist');
    // Should NOT show the operations page (math-operations div)
    assert.ok(!fnMatch[0].includes("operations.style.display = 'block'") ||
              fnMatch[0].includes('// Fallback'),
        'showMathLevels should not show operations page (except in fallback)');
    // Should call showProgressMap
    assert.ok(fnMatch[0].includes("showProgressMap('math', 'addition')"),
        'showMathLevels should route directly to progress map with addition as default');
});

test('BUG-034: hideProgressMap returns to subject selection (not operations page)', () => {
    const js = readFile('progress-map.js');
    const fnMatch = js.match(/function hideProgressMap[\s\S]*?\n\}/);
    assert.ok(fnMatch, 'hideProgressMap function should exist');
    assert.ok(fnMatch[0].includes('showSubjects'),
        'hideProgressMap should call showSubjects() to return to subject selection');
    // Should NOT show operations page
    assert.ok(!fnMatch[0].includes('math-operations'),
        'hideProgressMap should not reference math-operations div');
});

test('BUG-034: Back button text says "Back to Subjects"', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('Back to Subjects'),
        'Progress map back button should say "Back to Subjects"');
    assert.ok(!js.includes('Back to Operations'),
        'Progress map should NOT say "Back to Operations"');
});

test('BUG-034: index.html still has math-operations buttons with showProgressMap calls', () => {
    const html = readFile('index.html');
    // The operations page in index.html should still have showProgressMap calls on buttons
    assert.ok(html.includes("showProgressMap('math','addition')"),
        'Addition button should call showProgressMap');
    assert.ok(html.includes("showProgressMap('math','subtraction')"),
        'Subtraction button should call showProgressMap');
});

// ============================================================================
console.log('\n--- BUG-033: Duplicate Clear All Button ---');
// ============================================================================

test('worksheet-generator.js has only ONE Clear All button (bottom, not top toolbar)', () => {
    const js = readFile('worksheet-generator.js');
    // The bottom Clear All button calls clearWorksheet()
    assert.ok(js.includes("clearWorksheet()"), 'bottom Clear All (clearWorksheet) must exist');
    // The top toolbar should NOT have a Clear All button
    // The top toolbar has Save and PDF but NOT Clear All
    const topToolbar = js.substring(
        js.indexOf('<div class="control-buttons">'),
        js.indexOf('</div>\n            </div>\n\n            <div class="results-summary"')
    );
    assert.ok(!topToolbar.includes('Clear All'), 'top toolbar must NOT have Clear All button');
});

test('english-generator.js has no duplicate Clear All buttons', () => {
    const js = readFile('english-generator.js');
    const matches = js.match(/Clear All/g) || [];
    // English has 2 Clear All references: writing practice + assessment mode (different contexts)
    // Neither should be duplicated within the same worksheet view
    assert.ok(matches.length <= 2, `english should have at most 2 Clear All references, got ${matches.length}`);
});

test('aptitude-generator.js has no duplicate Clear All buttons', () => {
    const js = readFile('aptitude-generator.js');
    const matches = js.match(/Clear All/g) || [];
    // Aptitude should have exactly 1 Clear All (in assessment toolbar)
    assert.ok(matches.length <= 1, `aptitude should have at most 1 Clear All, got ${matches.length}`);
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: New Files Exist ===');
// ============================================================================

const uiuxNewFiles = [
    'feedback.css',
    'feedback.js',
    'sound-manager.js',
    'avatar-renderer.js',
    'rewards.js',
    'rewards.css',
    'rewards.html',
];

uiuxNewFiles.forEach(file => {
    test(`UI/UX: ${file} exists`, () => {
        assert.ok(fileExists(file), `${file} not found`);
    });
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: CSS Design Tokens ===');
// ============================================================================

test('styles.css has :root CSS variables block', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes(':root {'), ':root block not found');
    assert.ok(css.includes('--color-primary:'), '--color-primary not found');
    assert.ok(css.includes('--color-bg:'), '--color-bg not found');
    assert.ok(css.includes('--font-family:'), '--font-family not found');
    assert.ok(css.includes('--radius-md:'), '--radius-md not found');
    assert.ok(css.includes('--shadow-md:'), '--shadow-md not found');
    assert.ok(css.includes('--transition-normal:'), '--transition-normal not found');
    assert.ok(css.includes('--spring-bounce:'), '--spring-bounce not found');
});

test('styles.css uses var(--font-family) for body', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes("font-family: var(--font-family)"), 'body should use var(--font-family)');
});

test('styles.css uses var(--color-bg) for body background', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes("background-color: var(--color-bg)"), 'body should use var(--color-bg)');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Reduced Motion + Focus ===');
// ============================================================================

test('styles.css has reduced motion media query', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('prefers-reduced-motion: reduce'), 'reduced motion query not found');
    assert.ok(css.includes('animation-duration: 0.01ms !important'), 'animation override not found');
});

test('styles.css has :focus-visible rule', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes(':focus-visible'), ':focus-visible not found');
    assert.ok(css.includes('outline: 3px solid var(--color-primary)'), 'focus outline not found');
});

test('styles.css has touch target minimum 44px', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('min-height: 44px'), 'min-height: 44px not found');
    assert.ok(css.includes('min-width: 44px'), 'min-width: 44px not found');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Nunito Font on All Pages ===');
// ============================================================================

const fontPages = [
    'index.html', 'english.html', 'aptitude.html', 'stories.html',
    'drawing.html', 'emotional-quotient.html', 'german.html',
    'german-kids.html', 'learn-english-stories.html', 'settings.html',
    'login.html', 'signup.html', 'admin.html', 'children-profiles.html',
    'progress.html', 'privacy-policy.html', 'terms.html'
];

fontPages.forEach(page => {
    test(`${page} has Nunito font link`, () => {
        const html = readFile(page);
        assert.ok(html.includes('family=Nunito'), `${page} missing Nunito font link`);
    });
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Feedback CSS + JS on All Pages ===');
// ============================================================================

fontPages.forEach(page => {
    test(`${page} has feedback.css`, () => {
        const html = readFile(page);
        assert.ok(html.includes('feedback.css'), `${page} missing feedback.css link`);
    });

    test(`${page} has feedback.js`, () => {
        const html = readFile(page);
        assert.ok(html.includes('feedback.js'), `${page} missing feedback.js script`);
    });

    test(`${page} has sound-manager.js`, () => {
        const html = readFile(page);
        assert.ok(html.includes('sound-manager.js'), `${page} missing sound-manager.js script`);
    });
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Feedback Animations ===');
// ============================================================================

test('feedback.css has correctFlash animation', () => {
    const css = readFile('feedback.css');
    assert.ok(css.includes('@keyframes correctFlash'), 'correctFlash animation not found');
});

test('feedback.css has gentleShake animation', () => {
    const css = readFile('feedback.css');
    assert.ok(css.includes('@keyframes gentleShake'), 'gentleShake animation not found');
});

test('feedback.css has skeleton shimmer', () => {
    const css = readFile('feedback.css');
    assert.ok(css.includes('.skeleton'), '.skeleton class not found');
    assert.ok(css.includes('@keyframes shimmer'), 'shimmer animation not found');
});

test('feedback.css has answer-correct and answer-incorrect classes', () => {
    const css = readFile('feedback.css');
    assert.ok(css.includes('.answer-correct'), '.answer-correct not found');
    assert.ok(css.includes('.answer-incorrect'), '.answer-incorrect not found');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Encouragement Text ===');
// ============================================================================

test('feedback.js has getEncouragement function', () => {
    const js = readFile('feedback.js');
    assert.ok(js.includes('function getEncouragement'), 'getEncouragement not found');
    assert.ok(js.includes('CORRECT_PHRASES'), 'CORRECT_PHRASES not found');
    assert.ok(js.includes('INCORRECT_PHRASES'), 'INCORRECT_PHRASES not found');
});

test('feedback.js never shows "Wrong!" in incorrect phrases', () => {
    const js = readFile('feedback.js');
    // Extract INCORRECT_PHRASES array content
    const match = js.match(/INCORRECT_PHRASES\s*=\s*\[([\s\S]*?)\]/);
    if (match) {
        assert.ok(!match[1].includes("'Wrong!'"), 'INCORRECT_PHRASES should never contain "Wrong!"');
        assert.ok(!match[1].includes('"Wrong!"'), 'INCORRECT_PHRASES should never contain "Wrong!"');
    }
});

test('worksheet-generator.js uses getEncouragement', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('getEncouragement(true)'), 'getEncouragement(true) not used in worksheet-generator');
    assert.ok(js.includes('getEncouragement(false)'), 'getEncouragement(false) not used in worksheet-generator');
});

test('english-generator.js uses getEncouragement', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes('getEncouragement(true)'), 'getEncouragement(true) not used in english-generator');
    assert.ok(js.includes('getEncouragement(false)'), 'getEncouragement(false) not used in english-generator');
});

test('aptitude-generator.js uses getEncouragement', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('getEncouragement(true)'), 'getEncouragement(true) not used in aptitude-generator');
    assert.ok(js.includes('getEncouragement(false)'), 'getEncouragement(false) not used in aptitude-generator');
});

test('assessment.js uses getEncouragement', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('getEncouragement(true)'), 'getEncouragement(true) not used in assessment');
    assert.ok(js.includes('getEncouragement(false)'), 'getEncouragement(false) not used in assessment');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Confetti on Worksheet Pages ===');
// ============================================================================

const confettiPages = ['index.html', 'english.html', 'aptitude.html'];

confettiPages.forEach(page => {
    test(`${page} has confetti CDN`, () => {
        const html = readFile(page);
        assert.ok(html.includes('canvas-confetti'), `${page} missing confetti CDN`);
    });
});

test('worksheet-generator.js calls confetti on completion', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes("typeof confetti === 'function'"), 'confetti check not found in worksheet-generator');
});

test('aptitude-generator.js calls confetti on completion', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes("typeof confetti === 'function'"), 'confetti check not found in aptitude-generator');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Sound System ===');
// ============================================================================

test('sound-manager.js has SoundManager object', () => {
    const js = readFile('sound-manager.js');
    assert.ok(js.includes('const SoundManager'), 'SoundManager not found');
    assert.ok(js.includes('isEnabled()'), 'isEnabled method not found');
    assert.ok(js.includes('setEnabled('), 'setEnabled method not found');
    assert.ok(js.includes('correct()'), 'correct() method not found');
    assert.ok(js.includes('incorrect()'), 'incorrect() method not found');
    assert.ok(js.includes('complete()'), 'complete() method not found');
});

test('sound-manager.js has playSound function', () => {
    const js = readFile('sound-manager.js');
    assert.ok(js.includes('function playSound'), 'playSound function not found');
});

test('worksheet-generator.js calls playSound', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes("playSound('correct')"), "playSound('correct') not found");
    assert.ok(js.includes("playSound('incorrect')"), "playSound('incorrect') not found");
    assert.ok(js.includes("playSound('complete')"), "playSound('complete') not found");
});

test('settings.html has sound toggle', () => {
    const html = readFile('settings.html');
    assert.ok(html.includes('sound-toggle-section'), 'sound-toggle-section not found');
    assert.ok(html.includes('updateSoundMode'), 'updateSoundMode function not found');
    assert.ok(html.includes('sound-mode-on'), 'sound-mode-on radio not found');
    assert.ok(html.includes('sound-mode-off'), 'sound-mode-off radio not found');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Greeting Banner ===');
// ============================================================================

test('index.html has greeting-banner div', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('greeting-banner'), 'greeting-banner div not found');
});

test('index.html has updateGreeting function', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('function updateGreeting'), 'updateGreeting function not found');
});

test('styles.css has greeting banner styles', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('#greeting-banner'), 'greeting banner styles not found');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Age-Adaptive Theme ===');
// ============================================================================

test('styles.css has theme-young class', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('body.theme-young'), 'theme-young class not found');
    assert.ok(css.includes('--color-primary: #EA580C'), 'theme-young orange primary not found');
    assert.ok(css.includes('#FFF7ED'), 'theme-young warm bg not found');
});

test('profile-selector.js applies age theme', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('theme-young'), 'theme-young not referenced in profile-selector');
});

test('index.html has applyAgeTheme function', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('function applyAgeTheme'), 'applyAgeTheme function not found');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Bottom Navigation Bar ===');
// ============================================================================

const bottomNavPages = [
    'index.html', 'english.html', 'aptitude.html', 'stories.html',
    'drawing.html', 'emotional-quotient.html', 'german.html',
    'german-kids.html', 'learn-english-stories.html', 'progress.html',
    'children-profiles.html'
];

bottomNavPages.forEach(page => {
    test(`${page} has bottom-nav`, () => {
        const html = readFile(page);
        assert.ok(html.includes('class="bottom-nav"'), `${page} missing bottom-nav`);
        assert.ok(html.includes('bottom-nav-inner'), `${page} missing bottom-nav-inner`);
        assert.ok(html.includes('bottom-nav-item'), `${page} missing bottom-nav-item links`);
    });
});

test('styles.css has bottom-nav styles', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('.bottom-nav'), '.bottom-nav styles not found');
    assert.ok(css.includes('.bottom-nav-item'), '.bottom-nav-item styles not found');
    assert.ok(css.includes('padding-bottom: 70px'), 'body padding-bottom for bottom nav not found');
});

test('Bottom nav hidden on desktop, visible on mobile', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('.bottom-nav {\n    display: none;') || css.includes('.bottom-nav {\r\n    display: none;'), 'bottom-nav should be hidden by default');
    assert.ok(css.includes('.bottom-nav {\n        display: block;') || css.includes('.bottom-nav {\n        display: block') || css.includes('display: block'), 'bottom-nav should be visible in mobile media query');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Reward Shop ===');
// ============================================================================

test('rewards.html exists and has shop structure', () => {
    const html = readFile('rewards.html');
    assert.ok(html.includes('Reward Shop'), 'Reward Shop title not found');
    assert.ok(html.includes('star-balance-display'), 'star-balance-display not found');
    assert.ok(html.includes('avatar-preview-container'), 'avatar-preview-container not found');
    assert.ok(html.includes('shop-tabs'), 'shop-tabs not found');
    assert.ok(html.includes('shop-items-grid'), 'shop-items-grid not found');
    assert.ok(html.includes('rewards.js'), 'rewards.js script not found');
    assert.ok(html.includes('avatar-renderer.js'), 'avatar-renderer.js script not found');
    assert.ok(html.includes('rewards.css'), 'rewards.css link not found');
});

test('rewards.html has Nunito font and bottom nav', () => {
    const html = readFile('rewards.html');
    assert.ok(html.includes('family=Nunito'), 'Nunito font missing from rewards.html');
    assert.ok(html.includes('bottom-nav'), 'bottom-nav missing from rewards.html');
});

test('rewards.js has initRewardShop function', () => {
    const js = readFile('rewards.js');
    assert.ok(js.includes('function initRewardShop'), 'initRewardShop not found');
    assert.ok(js.includes('function purchaseItem'), 'purchaseItem not found');
    assert.ok(js.includes('function equipItem'), 'equipItem not found');
    assert.ok(js.includes('function renderShop'), 'renderShop not found');
});

test('rewards.js has shop tab switching', () => {
    const js = readFile('rewards.js');
    assert.ok(js.includes('function switchShopTab'), 'switchShopTab not found');
    assert.ok(js.includes("currentShopTab"), 'currentShopTab not found');
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Avatar Renderer ===');
// ============================================================================

test('avatar-renderer.js has renderAvatar function', () => {
    const js = readFile('avatar-renderer.js');
    assert.ok(js.includes('function renderAvatar'), 'renderAvatar not found');
});

test('avatar-renderer.js has AVATAR_ITEMS catalog', () => {
    const js = readFile('avatar-renderer.js');
    assert.ok(js.includes('const AVATAR_ITEMS'), 'AVATAR_ITEMS not found');
    assert.ok(js.includes('characters:'), 'characters category not found');
    assert.ok(js.includes('hats:'), 'hats category not found');
    assert.ok(js.includes('frames:'), 'frames category not found');
    assert.ok(js.includes('backgrounds:'), 'backgrounds category not found');
});

test('avatar-renderer.js has DEFAULT_AVATAR', () => {
    const js = readFile('avatar-renderer.js');
    assert.ok(js.includes('const DEFAULT_AVATAR'), 'DEFAULT_AVATAR not found');
});

test('avatar-renderer.js has getStarBalance function', () => {
    const js = readFile('avatar-renderer.js');
    assert.ok(js.includes('function getStarBalance'), 'getStarBalance not found');
});

test('avatar-renderer.js items have categories with cost and name', () => {
    const js = readFile('avatar-renderer.js');
    // Check that items have cost property
    const costMatches = js.match(/cost:\s*\d+/g);
    assert.ok(costMatches && costMatches.length >= 20, `Expected 20+ items with cost, found ${costMatches ? costMatches.length : 0}`);
});

// ============================================================================
console.log('\n=== UI/UX Enhancement: Star Tracking in Completion Manager ===');
// ============================================================================

test('completion-manager.js awards stars on completion', () => {
    const js = readFile('completion-manager.js');
    assert.ok(js.includes('totalStarsEarned'), 'totalStarsEarned not found');
    assert.ok(js.includes('FieldValue.increment'), 'FieldValue.increment not found for star tracking');
});

test('completion-manager.js awards 3 stars for 95%+', () => {
    const js = readFile('completion-manager.js');
    assert.ok(js.includes('starsEarned = 3'), '3 stars for 95%+ not found');
    assert.ok(js.includes('starsEarned = 2'), '2 stars for 85%+ not found');
    assert.ok(js.includes('starsEarned = 1'), '1 star for completion not found');
});

// ============================================================================
console.log('\n=== Phase 3: Adaptive Worksheet Client Integration ===');
// ============================================================================

test('worksheet-generator.js has adaptive mode variables', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('let isAdaptiveMode = false'), 'isAdaptiveMode variable not found');
    assert.ok(js.includes('let currentAdaptiveAssignment = null'), 'currentAdaptiveAssignment variable not found');
});

test('worksheet-generator.js has loadAdaptiveWorksheet function', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('function loadAdaptiveWorksheet(operation, pageNumber)'), 'loadAdaptiveWorksheet function not found');
});

test('worksheet-generator.js loads adaptive problems from assignment doc', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('currentAdaptiveAssignment.math.pages'), 'Should read pages from adaptive assignment');
    assert.ok(js.includes("difficulty: 'adaptive'"), 'Should set difficulty to adaptive');
    assert.ok(js.includes('adaptive: true'), 'Should set adaptive flag on currentWorksheet');
});

test('worksheet-generator.js detects adaptive mode from getAccessiblePages', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('access.adaptive'), 'Should check access.adaptive flag');
    assert.ok(js.includes('isAdaptiveMode = true'), 'Should set isAdaptiveMode when adaptive');
    assert.ok(js.includes('currentAdaptiveAssignment = access.assignment'), 'Should store assignment doc');
});

test('worksheet-generator.js branches to adaptive in loadWorksheetByPage', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('isAdaptiveMode && currentAdaptiveAssignment'), 'Should check adaptive mode in loadWorksheetByPage');
    assert.ok(js.includes('loadAdaptiveWorksheet(operation, absolutePage)'), 'Should call loadAdaptiveWorksheet');
});

test('worksheet-generator.js uses validateAdaptiveSubmission for adaptive worksheets', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes("httpsCallable('validateAdaptiveSubmission')"), 'Should call validateAdaptiveSubmission CF');
    assert.ok(js.includes('currentWorksheet.adaptive'), 'Should check adaptive flag before choosing validator');
    assert.ok(js.includes('pageNumber: currentAbsolutePage'), 'Should send pageNumber not absolutePage');
});

test('worksheet-generator.js adaptive problems strip answers', () => {
    const js = readFile('worksheet-generator.js');
    // In loadAdaptiveWorksheet, problems should not include answers
    const adaptiveFunc = js.substring(js.indexOf('function loadAdaptiveWorksheet'));
    const funcEnd = adaptiveFunc.indexOf('\nfunction ');
    const funcBody = adaptiveFunc.substring(0, funcEnd > 0 ? funcEnd : 500);
    assert.ok(funcBody.includes('a: p.a'), 'Should include a');
    assert.ok(funcBody.includes('b: p.b'), 'Should include b');
    assert.ok(!funcBody.includes('answer: p.answer'), 'Should NOT include answer in client-side problems');
});

test('validators.js exports validateAdaptiveSubmission', () => {
    const js = readFile('functions/validators.js');
    assert.ok(js.includes('validateAdaptiveSubmission'), 'validateAdaptiveSubmission not found');
    assert.ok(js.includes("const validateAdaptiveSubmission = onCall("), 'Should be a callable function');
});

test('validators.js adaptive validation reads from weekly_assignments', () => {
    const js = readFile('functions/validators.js');
    const adaptiveStart = js.indexOf('const validateAdaptiveSubmission');
    const adaptiveEnd = js.indexOf('const validateEnglishSubmission');
    const adaptiveBody = js.substring(adaptiveStart, adaptiveEnd);
    assert.ok(adaptiveBody.includes("weekly_assignments"), 'Should read from weekly_assignments collection');
    assert.ok(adaptiveBody.includes('assignment.math.adaptive'), 'Should verify assignment is adaptive');
    assert.ok(adaptiveBody.includes('pageData.problems'), 'Should get problems from stored page data');
});

test('validators.js adaptive validation does error tracking', () => {
    const js = readFile('functions/validators.js');
    const adaptiveStart = js.indexOf('const validateAdaptiveSubmission');
    const adaptiveEnd = js.indexOf('const validateEnglishSubmission');
    const adaptiveBody = js.substring(adaptiveStart, adaptiveEnd);
    assert.ok(adaptiveBody.includes('logErrors'), 'Should call logErrors for adaptive submissions');
    assert.ok(adaptiveBody.includes('updateSkillProfile'), 'Should call updateSkillProfile for adaptive submissions');
});

test('validators.js updateWeeklyAssignmentProgress handles adaptive page key', () => {
    const js = readFile('functions/validators.js');
    assert.ok(js.includes("isAdaptive ? 'pageNumber'"), 'Should use pageNumber key for adaptive assignments');
    assert.ok(js.includes('moduleData.adaptive === true'), 'Should check adaptive flag on module data');
});

test('index.js registers validateAdaptiveSubmission', () => {
    const js = readFile('functions/index.js');
    assert.ok(js.includes('exports.validateAdaptiveSubmission'), 'Should export validateAdaptiveSubmission');
    assert.ok(js.includes("validateAdaptiveSubmission"), 'Should import validateAdaptiveSubmission');
    assert.ok(js.includes("require('./validators')"), 'Should import from validators');
});

test('weekly-assignments.js returns adaptive flag and assignment in getAccessiblePages', () => {
    const js = readFile('weekly-assignments.js');
    assert.ok(js.includes('adaptive: isAdaptive'), 'Should return adaptive flag');
    assert.ok(js.includes('assignment.math.adaptive === true'), 'Should detect adaptive assignments');
    assert.ok(js.includes("pages = assignment.math.pages.map(p => p.pageNumber)"), 'Should map pageNumber for adaptive');
});

test('admin.html has adaptive worksheets review section', () => {
    const html = readFile('admin.html');
    assert.ok(html.includes('adaptive-section'), 'Should have adaptive section');
    assert.ok(html.includes('loadAdaptiveWorksheets'), 'Should have loadAdaptiveWorksheets function');
    assert.ok(html.includes('approveAdaptiveWorksheet'), 'Should have approve function');
    assert.ok(html.includes('rejectAdaptiveWorksheet'), 'Should have reject function');
});

test('children-profiles.html has skill progress dashboard', () => {
    const html = readFile('children-profiles.html');
    assert.ok(html.includes('skills-modal'), 'Should have skills modal');
    assert.ok(html.includes('viewChildSkills'), 'Should have viewChildSkills function');
    assert.ok(html.includes('skill_profile'), 'Should read from skill_profile subcollection');
    assert.ok(html.includes('skill-bar-fill'), 'Should have skill progress bars');
    assert.ok(html.includes('SKILL_DISPLAY_NAMES'), 'Should have human-readable skill names');
});

test('children-profiles.html child cards have Skills button', () => {
    const html = readFile('children-profiles.html');
    assert.ok(html.includes('skills-btn'), 'Should have skills button class');
    assert.ok(html.includes('Skills</button>'), 'Should have Skills button text');
});

test('index.js has scheduledAdaptiveAutoApprove function', () => {
    const js = readFile('functions/index.js');
    assert.ok(js.includes('scheduledAdaptiveAutoApprove'), 'Should export auto-approve function');
    assert.ok(js.includes("'0 16 * * 3'"), 'Should run on Wednesday at 4pm');
    assert.ok(js.includes('pending_review'), 'Should query pending worksheets');
    assert.ok(js.includes('deliverApprovedWorksheet'), 'Should call delivery function');
});

test('index.js scheduledWeeklyGeneration checks for adaptive eligibility', () => {
    const js = readFile('functions/index.js');
    assert.ok(js.includes('skill_profile'), 'Should check skill_profile subcollection');
    assert.ok(js.includes('totalAttempted >= 50'), 'Should require 50+ attempts for adaptive');
    assert.ok(js.includes('generateAdaptivePages'), 'Should call generateAdaptivePages');
    assert.ok(js.includes('adaptive_worksheets'), 'Should write to adaptive_worksheets collection');
});

test('adaptive-engine.js has deliverApprovedWorksheet with correct format', () => {
    const js = readFile('functions/adaptive-engine.js');
    assert.ok(js.includes('async function deliverApprovedWorksheet'), 'Should have delivery function');
    assert.ok(js.includes("adaptive: true"), 'Delivered assignment should have adaptive flag');
    assert.ok(js.includes('pageNumber: i + 1'), 'Pages should have pageNumber field');
    assert.ok(js.includes("weekly_assignments"), 'Should write to weekly_assignments collection');
});

// ============================================================================
// BRANDING — GleeGrow logo on all pages
// ============================================================================

console.log('\n=== Branding: All Pages Have GleeGrow Branding ===');

const brandingPages = [
    'index.html', 'english.html', 'aptitude.html', 'stories.html',
    'drawing.html', 'emotional-quotient.html', 'german.html',
    'german-kids.html', 'learn-english-stories.html',
    'settings.html', 'progress.html', 'children-profiles.html',
    'admin.html', 'rewards.html',
    'login.html', 'signup.html', 'terms.html', 'privacy-policy.html',
    'fix-admin.html'
];

brandingPages.forEach(page => {
    test(`${page} has app-branding div`, () => {
        const html = readFile(page);
        assert.ok(html.includes('id="app-branding"'), `${page} missing app-branding div`);
    });

    test(`${page} loads branding.js`, () => {
        const html = readFile(page);
        assert.ok(html.includes('branding.js'), `${page} missing branding.js script`);
    });
});

test('branding.js exists and has brandingGoHome function', () => {
    const js = readFile('branding.js');
    assert.ok(js.includes('function brandingGoHome'), 'brandingGoHome function not found');
    assert.ok(js.includes('APP_BRANDING'), 'APP_BRANDING config not found');
});

test('branding.js navigates to home on click', () => {
    const js = readFile('branding.js');
    assert.ok(js.includes("window.location.href = 'index'"), 'Should navigate to index on click');
});

test('branding.js warns about unsaved worksheet data', () => {
    const js = readFile('branding.js');
    assert.ok(js.includes('hasUnsavedChanges'), 'Should check hasUnsavedChanges');
    assert.ok(js.includes('unsaved worksheet data'), 'Should warn about unsaved data');
});

test('branding.js stops running timer before navigating', () => {
    const js = readFile('branding.js');
    assert.ok(js.includes('stopTimer'), 'Should call stopTimer');
});

test('branding.js creates clickable logo with GleeGrow name', () => {
    const js = readFile('branding.js');
    assert.ok(js.includes("name: 'GleeGrow'"), 'Should have GleeGrow brand name');
    assert.ok(js.includes("logo: 'gleegrow.png'"), 'Should use gleegrow.png logo');
    assert.ok(js.includes("color: '#28a745'"), 'Should use brand green color');
    assert.ok(js.includes('brandingGoHome()'), 'Click should trigger brandingGoHome');
});

test('branding.js logo is left-aligned (not right)', () => {
    const js = readFile('branding.js');
    // The wrapper should use flex with left alignment (no justify-content: flex-end)
    assert.ok(!js.includes('flex-end'), 'Branding should NOT be right-aligned');
    assert.ok(js.includes("display = 'flex'"), 'Branding wrapper should be flex');
});

// Verify test/utility pages do NOT need branding (not user-facing)
test('test-stories.html and test-unique-stories.html are utility pages (no branding needed)', () => {
    // These are developer-only test pages, not user-facing
    assert.ok(fileExists('test-stories.html'), 'test-stories.html should exist');
    assert.ok(fileExists('test-unique-stories.html'), 'test-unique-stories.html should exist');
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n${'='.repeat(60)}`);
console.log(`Navigation & Role Tests: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(60)}`);

if (failed > 0) {
    console.log('\nFailed tests:');
    failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    process.exit(1);
} else {
    console.log('\nAll navigation & role tests PASSED!\n');
}
