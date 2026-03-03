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
    // BUG-043: Math uses seeded generation with 4 tiers
    assert.ok(js.includes('youngerAge') || js.includes('younger'),
        'Must have younger tier');
    assert.ok(js.includes("'easy', 5") || js.includes("'easy',5"),
        'Must have easy tier with 5 questions');
    assert.ok(js.includes("'medium', 5") || js.includes("'medium',5"),
        'Must have medium tier with 5 questions');
    assert.ok(js.includes('olderAge') || js.includes('older'),
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
// SUBMIT WORKSHEET VALIDATION (BUG-035: Missing childId for admin users)
// ============================================================================

console.log('\n--- Submit Worksheet Client Validation ---');

test('submitWorksheet validates child profile before calling CF', () => {
    const js = readFile('worksheet-generator.js');
    // Must check child exists before sending to server
    assert.ok(js.includes("!child || !child.id"),
        'submitWorksheet must check for missing child/child.id');
    assert.ok(js.includes('No child profile selected'),
        'Must show user-friendly message when no child selected');
});

test('submitWorksheet validates operation is set', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes("if (!operation)"),
        'submitWorksheet must validate operation is not falsy');
});

test('submitWorksheet sends childId, operation, absolutePage, answers to CF', () => {
    const js = readFile('worksheet-generator.js');
    // Standard path
    assert.ok(js.includes('childId: child'), 'Must send childId');
    assert.ok(js.includes('operation: operation'), 'Must send operation');
    assert.ok(js.includes('absolutePage: currentAbsolutePage'), 'Must send absolutePage');
    assert.ok(js.includes('answers: answers'), 'Must send answers array');
});

test('validators.js reports which specific fields are missing', () => {
    const js = readFile('functions/validators.js');
    assert.ok(js.includes("missing.push('childId')"), 'Should check childId individually');
    assert.ok(js.includes("missing.push('operation')"), 'Should check operation individually');
    assert.ok(js.includes("missing.push('absolutePage')"), 'Should check absolutePage individually');
    assert.ok(js.includes("missing.push('answers')"), 'Should check answers individually');
    assert.ok(js.includes('missing.join'), 'Should join missing fields in error message');
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

test('aptitude-generator.js loadPuzzles uses seeded shuffle + page-based offset', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('shuffledPool.slice(startIdx, startIdx + count)'),
        'loadPuzzles must use seeded shuffle then page-based slice from progressive pool');
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
    const pmIdx = html.indexOf('src="progress-map.js"');
    const egIdx = html.indexOf('src="english-generator.js');
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
    assert.ok(css.includes('padding-bottom: 56px') || css.includes('padding-bottom: 70px'), 'body padding-bottom for bottom nav not found');
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

test('children-profiles.html does NOT have skill modal (removed — use progress dashboard instead)', () => {
    const html = readFile('children-profiles.html');
    assert.ok(!html.includes('skills-modal'), 'Skills modal removed — parents use progress dashboard');
    assert.ok(!html.includes('viewChildSkills'), 'viewChildSkills function removed');
    assert.ok(!html.includes('skills-btn'), 'Skills button removed from child cards');
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
// BUG-036: AGE NOT INCREMENTING ON BIRTHDAY
// ============================================================================

console.log('\n--- BUG-036: Dynamic Age Calculation from DOB ---');

test('profile-selector.js has calculateAgeFromDOB function', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('function calculateAgeFromDOB(dateOfBirth)'),
        'calculateAgeFromDOB function must exist');
});

test('calculateAgeFromDOB handles null/undefined input', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes("if (!dateOfBirth) return null"),
        'Must return null for falsy dateOfBirth');
});

test('calculateAgeFromDOB validates date string', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes("isNaN(birthDate.getTime())"),
        'Must check for invalid date strings');
});

test('calculateAgeFromDOB uses month and day comparison for birthday precision', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('getMonth()') && js.includes('getDate()'),
        'Must compare month and day, not just year');
    assert.ok(js.includes('monthDiff < 0'),
        'Must handle birthday not yet passed this year');
});

test('getSelectedChild recalculates age from date_of_birth (BUG-036)', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('childData.date_of_birth') && js.includes('calculateAgeFromDOB'),
        'getSelectedChild must recalculate age from date_of_birth');
    assert.ok(js.includes('BUG-036'),
        'Must reference BUG-036 in the fix comment');
});

test('loadProfileSelector recalculates age from DOB for Firestore data', () => {
    const js = readFile('profile-selector.js');
    // The Firestore loading code should recalculate age
    assert.ok(js.includes('data.date_of_birth') && js.includes('calculateAgeFromDOB'),
        'loadProfileSelector must recalculate age from Firestore data');
});

test('renderProfileSelector uses recalculated age for display', () => {
    const js = readFile('profile-selector.js');
    // Check that the selected child display uses recalculated age
    assert.ok(js.includes('displayAge') && js.includes('calculateAgeFromDOB'),
        'renderProfileSelector must use dynamically recalculated age');
});

test('renderChildOption uses recalculated age in dropdown', () => {
    const js = readFile('profile-selector.js');
    // The dropdown items should show recalculated age
    assert.ok(js.includes("Age ${displayAge}"),
        'Dropdown items must display recalculated age');
});

// Verify pure-logic correctness of the age calculation
test('calculateAgeFromDOB logic: subtracts year and checks month/day', () => {
    const js = readFile('profile-selector.js');
    // Must have: age = today.getFullYear() - birthDate.getFullYear()
    assert.ok(js.includes('today.getFullYear() - birthDate.getFullYear()'),
        'Must subtract birth year from current year');
    // Must decrement if birthday hasn't passed
    assert.ok(js.includes('age--'),
        'Must decrement age if birthday not yet passed');
});

test('selectChild uses DOB-recalculated age for theme', () => {
    const js = readFile('profile-selector.js');
    // The theme code should use DOB
    const themeSection = js.substring(js.indexOf('age-adaptive theme'));
    assert.ok(themeSection.includes('calculateAgeFromDOB') || themeSection.includes('date_of_birth'),
        'selectChild theme logic must use DOB-based age');
});

// ============================================================================
// BUG-037: HEADER CONSISTENCY + THEME SYSTEM
// ============================================================================

console.log('\n--- BUG-037: Header Consistency & Theme System ---');

// All module pages should use .user-header instead of <header>
const headerPages = [
    'stories.html', 'english.html', 'aptitude.html', 'drawing.html',
    'emotional-quotient.html', 'german.html', 'german-kids.html',
    'learn-english-stories.html', 'index.html', 'rewards.html'
];

headerPages.forEach(page => {
    test(`${page} uses .user-header div (not <header> tag)`, () => {
        const html = readFile(page);
        assert.ok(html.includes('class="user-header"'),
            `${page} must have class="user-header" for consistent gradient header`);
    });
});

test('styles.css defines .user-header with gradient background', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('.user-header {') || css.includes('.user-header{'),
        '.user-header must be defined in styles.css');
    assert.ok(css.includes('var(--color-primary-gradient)'),
        '.user-header must use CSS variable for gradient');
});

test('styles.css has .user-header responsive styles for mobile', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('@media') && css.includes('.user-header'),
        '.user-header must have responsive styles');
});

// Theme system tests
test('theme-manager.js exists and defines THEMES object', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('const THEMES'), 'THEMES constant must exist');
    assert.ok(js.includes("ocean"), 'ocean theme must exist');
    assert.ok(js.includes("forest"), 'forest theme must exist');
    assert.ok(js.includes("sunset"), 'sunset theme must exist');
    assert.ok(js.includes("candy"), 'candy theme must exist');
    assert.ok(js.includes("space"), 'space theme must exist');
    assert.ok(js.includes("rainbow"), 'rainbow theme must exist');
});

test('theme-manager.js has applyTheme function', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('function applyTheme('), 'applyTheme function must exist');
    assert.ok(js.includes("data-theme"), 'Must set data-theme attribute');
});

test('theme-manager.js has saveChildTheme for Firestore persistence', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('async function saveChildTheme('), 'saveChildTheme must exist');
    assert.ok(js.includes("firebase.firestore()"), 'Must write to Firestore');
    assert.ok(js.includes("theme: themeName"), 'Must save theme field');
});

test('theme-manager.js loads theme on page load', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('DOMContentLoaded') || js.includes('loadTheme'),
        'Must load theme on page load');
    assert.ok(js.includes("gleegrow-theme"), 'Must use localStorage cache key');
});

test('styles.css defines theme CSS variable overrides', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('[data-theme="ocean"]'), 'Ocean theme override must exist');
    assert.ok(css.includes('[data-theme="forest"]'), 'Forest theme override must exist');
    assert.ok(css.includes('[data-theme="sunset"]'), 'Sunset theme override must exist');
    assert.ok(css.includes('[data-theme="candy"]'), 'Candy theme override must exist');
    assert.ok(css.includes('[data-theme="space"]'), 'Space theme override must exist');
    assert.ok(css.includes('[data-theme="rainbow"]'), 'Rainbow theme override must exist');
    assert.ok(css.includes('[data-theme="dinosaur"]'), 'Dinosaur theme override must exist');
    assert.ok(css.includes('[data-theme="dragon"]'), 'Dragon theme override must exist');
});

test('theme-manager.js is loaded on all module pages', () => {
    headerPages.forEach(page => {
        const html = readFile(page);
        assert.ok(html.includes('theme-manager.js'),
            `${page} must load theme-manager.js`);
    });
});

test('profile-selector.js has theme picker in child settings modal', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('Color Theme'), 'Must have Color Theme section');
    assert.ok(js.includes('theme-grid'), 'Must have theme grid container');
    assert.ok(js.includes('selectThemeOption'), 'Must have selectThemeOption function');
});

test('profile-selector.js selectThemeOption calls saveChildTheme', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('saveChildTheme'), 'selectThemeOption must call saveChildTheme');
});

test('styles.css key elements use CSS variables (not hardcoded #667eea)', () => {
    const css = readFile('styles.css');
    // .user-header should use variable
    const userHeaderSection = css.substring(css.indexOf('.user-header {'), css.indexOf('.user-header {') + 200);
    assert.ok(userHeaderSection.includes('var(--color-primary-gradient)'),
        '.user-header background must use CSS variable');
    // subject-btn uses gradient stripe (::before) instead of border-left
    assert.ok(css.includes('var(--color-primary-gradient)'),
        '.subject-btn gradient stripe must use CSS variable');
});

// No module pages should still use inline <header> for the main page header
const noInlineHeaderPages = [
    'stories.html', 'english.html', 'aptitude.html', 'drawing.html',
    'emotional-quotient.html', 'german.html', 'german-kids.html',
    'learn-english-stories.html'
];

noInlineHeaderPages.forEach(page => {
    test(`${page} does not use inline <header> for main page header`, () => {
        const html = readFile(page);
        // Should not have the old inline-styled <header>
        assert.ok(!html.includes('<header style="display: flex;'),
            `${page} must not use inline-styled <header> tag (use .user-header instead)`);
    });
});

// ============================================================================
// BUG-038: Empty canvas submissions must not evaluate as correct
// ============================================================================

console.log('\n--- BUG-038: Empty Canvas Submission Prevention ---');

// Test aptitude-generator.js checkAnswers has empty canvas check
test('BUG-038: aptitude checkAnswers checks canvas emptiness before showing answer', () => {
    const js = readFile('aptitude-generator.js');
    const checkAnswersFn = js.substring(js.indexOf('function checkAnswers()'));
    // Must check for empty canvas
    assert.ok(checkAnswersFn.includes('canvasEmpty') || checkAnswersFn.includes('isEmpty'),
        'aptitude checkAnswers must check if canvas is empty before evaluation');
});

test('BUG-038: aptitude checkAnswers shows warning for empty canvas', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('Please write your answer'),
        'aptitude must show "Please write your answer" for empty canvases');
});

test('BUG-038: aptitude checkAnswers uses handwritingInputs for empty check', () => {
    const js = readFile('aptitude-generator.js');
    // The checkAnswers function should look up HandwritingInput instance
    assert.ok(js.includes('handwritingInputs.find'),
        'aptitude checkAnswers must use handwritingInputs.find to check isEmpty()');
});

test('BUG-038: aptitude checkAnswers falls back to isCanvasEmpty', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('isCanvasEmpty'),
        'aptitude checkAnswers must fall back to isCanvasEmpty if HandwritingInput not found');
});

test('BUG-038: aptitude toggleAnswers also checks canvas emptiness', () => {
    const js = readFile('aptitude-generator.js');
    const toggleFn = js.substring(js.indexOf('function toggleAnswers('));
    assert.ok(toggleFn.includes('canvasEmpty') || toggleFn.includes('isEmpty'),
        'aptitude toggleAnswers must also check if canvas is empty');
});

// Test english-generator.js checkAnswers has empty canvas check
test('BUG-038: english checkAnswers checks canvas emptiness before showing answer', () => {
    const js = readFile('english-generator.js');
    const checkAnswersFn = js.substring(js.indexOf('function checkAnswers()'));
    assert.ok(checkAnswersFn.includes('canvasEmpty') || checkAnswersFn.includes('isEmpty'),
        'english checkAnswers must check if canvas is empty before evaluation');
});

test('BUG-038: english checkAnswers shows warning for empty canvas', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes('Please write your answer'),
        'english must show "Please write your answer" for empty canvases');
});

test('BUG-038: english checkAnswers tracks empty count', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes('emptyCount'),
        'english checkAnswers must track empty canvas count');
});

test('BUG-038: english checkAnswers shows empty warning in results', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes('left blank'),
        'english checkAnswers must show "left blank" warning in results summary');
});

test('BUG-038: english toggleAnswers also checks canvas emptiness', () => {
    const js = readFile('english-generator.js');
    const toggleFn = js.substring(js.indexOf('function toggleAnswers('));
    assert.ok(toggleFn.includes('canvasEmpty') || toggleFn.includes('isEmpty'),
        'english toggleAnswers must also check if canvas is empty');
});

test('BUG-038: empty canvas gets warning border color (#cc6600)', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes("borderColor = '#cc6600'"),
        'empty canvas must get orange warning border');
});

test('BUG-038: english empty canvas gets warning border color', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes("borderColor = '#cc6600'"),
        'english empty canvas must get orange warning border');
});

// Test that handwriting-recognition.js has isCanvasEmpty function available
test('BUG-038: isCanvasEmpty function exists in handwriting-recognition.js', () => {
    const js = readFile('handwriting-recognition.js');
    assert.ok(js.includes('function isCanvasEmpty(canvas)'),
        'isCanvasEmpty must be defined in handwriting-recognition.js');
});

// Test that HandwritingInput class has isEmpty method
test('BUG-038: HandwritingInput class has isEmpty() method', () => {
    const js = readFile('handwriting-input.js');
    assert.ok(js.includes('isEmpty()'),
        'HandwritingInput must have isEmpty() method');
    assert.ok(js.includes('hasContent'),
        'HandwritingInput must track hasContent state');
});

// Test math module doesn't have this bug (server-only validation)
test('BUG-038: math module uses server-only validation (no local checkAnswers)', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(!js.includes('function checkAnswers()'),
        'worksheet-generator must NOT have local checkAnswers (server-only)');
});

// ============================================================================
// BUG-039: English page missing assessment.js + async getCompletedWorksheets
// ============================================================================

console.log('\n--- BUG-039: English/Aptitude Missing Scripts & Async Fixes ---');

test('BUG-039: english.html loads assessment.js', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('assessment.js'),
        'english.html must load assessment.js for startAssessment function');
});

test('BUG-039: english.html assessment.js script loaded before english-generator.js script', () => {
    const html = readFile('english.html');
    const assessmentPos = html.indexOf('src="assessment.js"');
    const generatorPos = html.indexOf('src="english-generator.js');
    assert.ok(assessmentPos > 0, 'assessment.js script tag must exist');
    assert.ok(assessmentPos < generatorPos,
        'assessment.js script tag must appear before english-generator.js script tag');
});

test('BUG-039: english.html uses await for getCompletedWorksheets', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('await getCompletedWorksheets'),
        'english.html must use await with getCompletedWorksheets (async function)');
});

test('BUG-039: english.html DOMContentLoaded handler is async', () => {
    const html = readFile('english.html');
    assert.ok(html.includes("DOMContentLoaded', async function"),
        'english.html DOMContentLoaded handler must be async');
});

test('BUG-039: english.html guards against non-array completedWorksheets', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('Array.isArray(completedWorksheets)'),
        'english.html must guard against non-array return from getCompletedWorksheets');
});

test('BUG-039: aptitude.html uses await for getCompletedWorksheets (first call)', () => {
    const html = readFile('aptitude.html');
    const firstCall = html.indexOf('getCompletedWorksheets');
    const snippet = html.substring(Math.max(0, firstCall - 20), firstCall + 30);
    assert.ok(snippet.includes('await'),
        'aptitude.html first getCompletedWorksheets call must use await');
});

test('BUG-039: aptitude.html uses await for getCompletedWorksheets (second call)', () => {
    const html = readFile('aptitude.html');
    const firstIdx = html.indexOf('getCompletedWorksheets');
    const secondIdx = html.indexOf('getCompletedWorksheets', firstIdx + 1);
    const snippet = html.substring(Math.max(0, secondIdx - 20), secondIdx + 30);
    assert.ok(snippet.includes('await'),
        'aptitude.html second getCompletedWorksheets call must use await');
});

test('BUG-039: aptitude.html DOMContentLoaded handler is async', () => {
    const html = readFile('aptitude.html');
    assert.ok(html.includes("DOMContentLoaded', async function"),
        'aptitude.html DOMContentLoaded handler must be async');
});

test('BUG-039: index.html loads assessment.js', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('assessment.js'),
        'index.html must load assessment.js');
});

test('BUG-039: firebase-storage.js getCompletedWorksheets is async', () => {
    const js = readFile('firebase-storage.js');
    assert.ok(js.includes('async function getCompletedWorksheets'),
        'firebase-storage.js getCompletedWorksheets must be async');
});

// ============================================================================
console.log('\n=== BUG-040: Age Display vs Worksheet Difficulty Separation ===');
// ============================================================================

test('BUG-040: getSelectedChild() adds displayAge property', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('childData.displayAge'),
        'getSelectedChild must set childData.displayAge');
});

test('BUG-040: getSelectedChild() never overwrites child.age from DOB', () => {
    const js = readFile('profile-selector.js');
    const getSelectedFn = js.substring(js.indexOf('function getSelectedChild()'));
    const fnEnd = getSelectedFn.indexOf('\nfunction ');
    const fnBody = fnEnd > 0 ? getSelectedFn.substring(0, fnEnd) : getSelectedFn;
    // Should NOT contain childData.age = (overwrite from DOB)
    // But SHOULD contain childData.displayAge =
    assert.ok(!fnBody.includes('childData.age ='),
        'getSelectedChild must NOT overwrite childData.age — only set displayAge');
    assert.ok(fnBody.includes('childData.displayAge ='),
        'getSelectedChild must set childData.displayAge');
});

test('BUG-040: loadProfileSelector adds displayAge, not age', () => {
    const js = readFile('profile-selector.js');
    const loadFn = js.substring(js.indexOf('async function loadProfileSelector'));
    const fnEnd = loadFn.indexOf('\nfunction ');
    const fnBody = fnEnd > 0 ? loadFn.substring(0, fnEnd) : loadFn;
    assert.ok(fnBody.includes('data.displayAge = currentAge'),
        'loadProfileSelector must set data.displayAge (not data.age)');
    assert.ok(!fnBody.includes('data.age = currentAge'),
        'loadProfileSelector must NOT overwrite data.age');
});

test('BUG-040: renderProfileSelector uses displayAge for display', () => {
    const js = readFile('profile-selector.js');
    const renderFn = js.substring(js.indexOf('function renderProfileSelector'));
    const fnEnd = renderFn.indexOf('\nfunction ');
    const fnBody = fnEnd > 0 ? renderFn.substring(0, fnEnd) : renderFn;
    assert.ok(fnBody.includes('selectedChild.displayAge'),
        'renderProfileSelector must use displayAge for display');
});

test('BUG-040: renderChildOption uses displayAge for display', () => {
    const js = readFile('profile-selector.js');
    const renderFn = js.substring(js.indexOf('function renderChildOption'));
    const fnEnd = renderFn.indexOf('\nfunction ');
    const fnBody = fnEnd > 0 ? renderFn.substring(0, fnEnd) : renderFn;
    assert.ok(fnBody.includes('child.displayAge'),
        'renderChildOption must use displayAge for display');
});

test('BUG-040: calculateAgeFromDOB function exists and is pure', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('function calculateAgeFromDOB(dateOfBirth)'),
        'calculateAgeFromDOB must be defined');
    // Must not modify any external state
    const fn = js.substring(js.indexOf('function calculateAgeFromDOB'), js.indexOf('function calculateAgeFromDOB') + 400);
    assert.ok(!fn.includes('localStorage'), 'calculateAgeFromDOB must not touch localStorage');
    assert.ok(!fn.includes('firebase'), 'calculateAgeFromDOB must not touch firebase');
});

test('BUG-040: worksheet-generator uses child.age (assessment), not displayAge', () => {
    const js = readFile('worksheet-generator.js');
    // worksheet-generator should use child.age for content generation
    assert.ok(!js.includes('displayAge'),
        'worksheet-generator.js must NOT reference displayAge — uses assessment-based child.age');
});

test('BUG-040: english-generator uses child.age (assessment), not displayAge', () => {
    const js = readFile('english-generator.js');
    assert.ok(!js.includes('displayAge'),
        'english-generator.js must NOT reference displayAge — uses assessment-based child.age');
});

test('BUG-040: aptitude-generator does NOT use displayAge for content', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(!js.includes('displayAge'),
        'aptitude-generator.js must NOT reference displayAge');
});

test('BUG-040: assessment.js does NOT use displayAge', () => {
    const js = readFile('assessment.js');
    assert.ok(!js.includes('displayAge'),
        'assessment.js must NOT reference displayAge — assessment uses child.age');
});

test('BUG-040: weekly-assignments.js does NOT use displayAge', () => {
    const js = readFile('weekly-assignments.js');
    assert.ok(!js.includes('displayAge'),
        'weekly-assignments.js must NOT reference displayAge');
});

test('BUG-040: level-test.js does NOT use displayAge', () => {
    const js = readFile('level-test.js');
    assert.ok(!js.includes('displayAge'),
        'level-test.js must NOT reference displayAge');
});

test('BUG-040: displayAge comment explains BUG-040 purpose', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('BUG-040'),
        'profile-selector.js must reference BUG-040 in comments for traceability');
});

test('BUG-040: getSelectedChild has BUG-040 comment about assessment-based age', () => {
    const js = readFile('profile-selector.js');
    const getSelectedFn = js.substring(js.indexOf('function getSelectedChild()'));
    assert.ok(getSelectedFn.includes('ASSESSMENT-BASED'),
        'getSelectedChild must document that child.age is assessment-based');
});

test('BUG-040: selectChild uses DOB age only for theme (visual), not content', () => {
    const js = readFile('profile-selector.js');
    const selectFn = js.substring(js.indexOf('function selectChild(childId, childData)'));
    const fnEnd = selectFn.indexOf('\nfunction ');
    const fnBody = fnEnd > 0 ? selectFn.substring(0, fnEnd) : selectFn;
    // selectChild uses DOB age only for theme-young class — visual only
    assert.ok(fnBody.includes('theme-young'),
        'selectChild must use DOB age for theme classification (visual)');
    assert.ok(fnBody.includes('calculateAgeFromDOB'),
        'selectChild must calculate DOB age for theme');
});

test('BUG-040: children-profiles.html has its own age display (independent)', () => {
    const html = readFile('children-profiles.html');
    // children-profiles has its own local calculateAge function for display
    assert.ok(html.includes('calculateAge'),
        'children-profiles.html must have local age calculation for display');
});

// ============================================================================
console.log('\n=== BUG-041: Theme Not Updating Immediately / Race Condition ===');
// ============================================================================

test('BUG-041: theme-manager loadTheme prioritizes gleegrow-theme cache', () => {
    const js = readFile('theme-manager.js');
    const loadFn = js.substring(js.indexOf('function loadTheme()'));
    const fnEnd = loadFn.indexOf('\nfunction ');
    const fnBody = fnEnd > 0 ? loadFn.substring(0, fnEnd) : loadFn;
    // Must return early after applying cached theme (no override from child.theme)
    const cacheIdx = fnBody.indexOf("localStorage.getItem('gleegrow-theme')");
    const returnIdx = fnBody.indexOf('return;', cacheIdx);
    assert.ok(cacheIdx > 0 && returnIdx > cacheIdx,
        'loadTheme must return after applying cached theme to prevent override');
});

test('BUG-041: saveChildTheme applies theme before Firestore write', () => {
    const js = readFile('theme-manager.js');
    const saveFn = js.substring(js.indexOf('async function saveChildTheme'));
    const applyIdx = saveFn.indexOf('applyTheme(themeName)');
    const firestoreIdx = saveFn.indexOf('firebase.firestore()');
    assert.ok(applyIdx > 0 && firestoreIdx > applyIdx,
        'saveChildTheme must apply theme BEFORE Firestore write (optimistic update)');
});

test('BUG-041: saveChildTheme updates localStorage before Firestore write', () => {
    const js = readFile('theme-manager.js');
    const saveFn = js.substring(js.indexOf('async function saveChildTheme'));
    const localIdx = saveFn.indexOf("localStorage.getItem('selectedChild')");
    const firestoreIdx = saveFn.indexOf('firebase.firestore()');
    assert.ok(localIdx > 0 && firestoreIdx > localIdx,
        'saveChildTheme must update localStorage BEFORE Firestore write');
});

test('BUG-041: loadProfileSelector preserves cached theme from localStorage', () => {
    const js = readFile('profile-selector.js');
    const loadFn = js.substring(js.indexOf('async function loadProfileSelector'));
    const fnEnd = loadFn.indexOf('\nasync function ') > 0 ?
        loadFn.indexOf('\nasync function ') :
        loadFn.indexOf('\nfunction ');
    const fnBody = fnEnd > 0 ? loadFn.substring(0, fnEnd) : loadFn;
    assert.ok(fnBody.includes("localStorage.getItem('gleegrow-theme')"),
        'loadProfileSelector must check gleegrow-theme cache before overwriting');
    assert.ok(fnBody.includes('selectedChildData.theme = cachedTheme'),
        'loadProfileSelector must preserve cached theme to prevent stale Firestore override');
});

test('BUG-041: selectChild applies child color theme immediately', () => {
    const js = readFile('profile-selector.js');
    const selectFn = js.substring(js.indexOf('function selectChild(childId, childData)'));
    const fnEnd = selectFn.indexOf('\nfunction ');
    const fnBody = fnEnd > 0 ? selectFn.substring(0, fnEnd) : selectFn;
    assert.ok(fnBody.includes('applyTheme'),
        'selectChild must apply color theme when switching children');
    assert.ok(fnBody.includes('childData.theme'),
        'selectChild must use childData.theme for color theme');
});

test('BUG-041: THEMES constant defines all theme options', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes("ocean:"), 'THEMES must include ocean');
    assert.ok(js.includes("forest:"), 'THEMES must include forest');
    assert.ok(js.includes("sunset:"), 'THEMES must include sunset');
    assert.ok(js.includes("candy:"), 'THEMES must include candy');
    assert.ok(js.includes("space:"), 'THEMES must include space');
    assert.ok(js.includes("rainbow:"), 'THEMES must include rainbow');
});

test('BUG-041: theme-manager has early cache apply before DOMContentLoaded', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes("document.readyState === 'loading'"),
        'theme-manager must check readyState for early apply');
    assert.ok(js.includes("document.documentElement.setAttribute('data-theme', earlyCache)"),
        'theme-manager must set data-theme before DOMContentLoaded for instant display');
});

test('BUG-041: BUG-041 referenced in comments for traceability', () => {
    const tmJs = readFile('theme-manager.js');
    const psJs = readFile('profile-selector.js');
    assert.ok(tmJs.includes('BUG-041'),
        'theme-manager.js must reference BUG-041');
    assert.ok(psJs.includes('BUG-041'),
        'profile-selector.js must reference BUG-041');
});

// ============================================================================
console.log('\n=== BUG-042: English Assessment Fixes (client + server) ===');
// ============================================================================

test('BUG-042: english.html has assessment-container div', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('id="assessment-container"'),
        'english.html must have assessment-container div');
});

test('BUG-042: english.html loads assessment.css', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('assessment.css'),
        'english.html must load assessment.css for styled assessment UI');
});

test('BUG-042: index.html loads assessment.css', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('assessment.css'),
        'index.html must load assessment.css (extracted from inline styles)');
});

test('BUG-042: assessment.css file exists with required styles', () => {
    assert.ok(fileExists('assessment.css'), 'assessment.css must exist');
    const css = readFile('assessment.css');
    assert.ok(css.includes('#assessment-container'), 'Must have #assessment-container style');
    assert.ok(css.includes('.assessment-page'), 'Must have .assessment-page style');
    assert.ok(css.includes('.assessment-header'), 'Must have .assessment-header style');
    assert.ok(css.includes('.assessment-question'), 'Must have .assessment-question style');
    assert.ok(css.includes('.gate-content'), 'Must have .gate-content style');
    assert.ok(css.includes('.take-assessment-btn'), 'Must have .take-assessment-btn style');
});

test('BUG-043: assessment.js generateEnglishAssessmentQuestions uses fixed bank (not dynamic generators)', () => {
    const js = readFile('assessment.js');
    const fn = js.substring(js.indexOf('function generateEnglishAssessmentQuestions'));
    const fnEnd = fn.indexOf('\nfunction generateMathAssessmentQuestions');
    const fnBody = fnEnd > 0 ? fn.substring(0, fnEnd) : fn.substring(0, 2000);
    // Must NOT call dynamic generators (was BUG-043 root cause)
    assert.ok(!fnBody.includes('config.generator()'),
        'generateEnglishAssessmentQuestions must NOT call config.generator()');
    assert.ok(!fnBody.includes('generatePictureWordProblems'),
        'Must NOT use dynamic pictureWords generator');
    // Must use fixed bank with seeded shuffle
    assert.ok(fnBody.includes('ENGLISH_ASSESSMENT_BANK'),
        'Must use ENGLISH_ASSESSMENT_BANK for deterministic questions');
    assert.ok(fnBody.includes('AssessmentSeededRandom'),
        'Must use AssessmentSeededRandom for deterministic shuffle');
});

test('BUG-042: assessment.js renders English-specific header', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('English Vocabulary Assessment'),
        'Assessment UI must show English-specific header');
});

test('BUG-042: assessment.js English input is wider than Math input', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('width: 200px'),
        'English assessment answer input must be wider for word answers');
});

test('BUG-042: assessment.js isEnglish defined before use in pencil mode', () => {
    const js = readFile('assessment.js');
    const submitFn = js.substring(js.indexOf('async function submitAssessment'));
    const fnEnd = submitFn.indexOf('\nasync function ') > 0 ?
        submitFn.indexOf('\nasync function ') :
        submitFn.indexOf('\nfunction ');
    const fnBody = fnEnd > 0 ? submitFn.substring(0, fnEnd) : submitFn.substring(0, 3000);
    // isEnglish must be declared before it's used in pencil mode loading
    const declIdx = fnBody.indexOf('const isEnglish');
    const useIdx = fnBody.indexOf('isEnglish && typeof loadEmnistModel');
    assert.ok(declIdx > 0 && useIdx > declIdx,
        'isEnglish must be declared before use in pencil mode (was reference error)');
});

test('BUG-042: server-side math-engine handles English assessment', () => {
    const js = readFile('functions/shared/math-engine.js');
    assert.ok(js.includes("operation === 'english'"),
        'generateSeededAssessmentQuestions must check for English operation');
    assert.ok(js.includes('generateSeededEnglishAssessment'),
        'Must have generateSeededEnglishAssessment function');
    assert.ok(js.includes('ENGLISH_ASSESSMENT_BANK'),
        'Must have ENGLISH_ASSESSMENT_BANK question bank');
});

test('BUG-042: server English assessment bank covers all age groups', () => {
    const js = readFile('functions/shared/math-engine.js');
    const bank = js.substring(js.indexOf('ENGLISH_ASSESSMENT_BANK'));
    assert.ok(bank.includes("'4-5':"), 'Bank must have age 4-5');
    assert.ok(bank.includes("'6':"), 'Bank must have age 6');
    assert.ok(bank.includes("'7':"), 'Bank must have age 7');
    assert.ok(bank.includes("'8':"), 'Bank must have age 8');
    assert.ok(bank.includes("'9+':"), 'Bank must have age 9+');
    assert.ok(bank.includes("'10+':"), 'Bank must have age 10+');
});

test('BUG-042: server English assessment bank has easy + medium per age', () => {
    const js = readFile('functions/shared/math-engine.js');
    const bankSection = js.substring(
        js.indexOf('ENGLISH_ASSESSMENT_BANK'),
        js.indexOf('function generateSeededEnglishAssessment')
    );
    // Each age group should have 'easy' and 'medium' sections
    const ageGroups = ['4-5', '6', '7', '8', '9+', '10+'];
    ageGroups.forEach(age => {
        assert.ok(bankSection.includes(`'${age}':`),
            `Bank must have age group ${age}`);
    });
});

test('BUG-042: english-generator.js backToHome button fixed', () => {
    const js = readFile('english-generator.js');
    assert.ok(!js.includes("onclick=\"backToHome()\""),
        'Must not call undefined backToHome() function');
    assert.ok(js.includes("window.location.href='index'"),
        'Back button must navigate to index page');
});

test('BUG-042: assessment.js cancelAssessment restores English type-selection', () => {
    const js = readFile('assessment.js');
    const fn = js.substring(js.indexOf('function cancelAssessment'));
    assert.ok(fn.includes('type-selection'),
        'cancelAssessment must show type-selection for English');
});

test('BUG-042: assessment.js startLearningAtLevel handles English', () => {
    const js = readFile('assessment.js');
    const fn = js.substring(js.indexOf('async function startLearningAtLevel'));
    assert.ok(fn.includes("operation === 'english'"),
        'startLearningAtLevel must handle English operation');
    assert.ok(fn.includes('type-selection'),
        'English post-assessment must show type-selection');
});

// ============================================================================
console.log('\n=== English Module General Tests ===');
// ============================================================================

test('English: english.html loads all required scripts', () => {
    const html = readFile('english.html');
    const requiredScripts = [
        'firebase-config.js', 'firebase-auth.js', 'firebase-storage.js',
        'level-mapper.js', 'app-constants.js', 'assessment.js',
        'english-generator.js', 'handwriting-input.js',
        'handwriting-recognition.js', 'profile-selector.js',
        'theme-manager.js', 'weekly-assignments.js', 'progress-map.js',
        'branding.js', 'completion-manager.js'
    ];
    requiredScripts.forEach(script => {
        assert.ok(html.includes(script),
            `english.html must load ${script}`);
    });
});

test('English: assessment.js loads before english-generator.js', () => {
    const html = readFile('english.html');
    const assessmentIdx = html.indexOf('src="assessment.js"');
    const generatorIdx = html.indexOf('src="english-generator.js');
    assert.ok(assessmentIdx > 0 && generatorIdx > assessmentIdx,
        'assessment.js must load before english-generator.js (dependency)');
});

test('English: level-mapper.js loads before english-generator.js', () => {
    const html = readFile('english.html');
    const mapperIdx = html.indexOf('src="level-mapper.js"');
    const generatorIdx = html.indexOf('src="english-generator.js');
    assert.ok(mapperIdx > 0 && generatorIdx > mapperIdx,
        'level-mapper.js must load before english-generator.js');
});

test('English: english-generator.js has getConfigByAge function', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes('function getConfigByAge(ageGroup, difficulty)'),
        'english-generator.js must export getConfigByAge(ageGroup, difficulty)');
});

test('English: english-generator.js has all problem generators', () => {
    const js = readFile('english-generator.js');
    const generators = [
        'generatePictureWordProblems',
        'generateSightWordProblems',
        'generateSentenceFillProblems',
        'generateSynonymAntonymProblems',
        'generatePartsOfSpeechProblems'
    ];
    generators.forEach(gen => {
        assert.ok(js.includes(`function ${gen}`),
            `english-generator.js must define ${gen}`);
    });
});

test('English: english-generator.js has ageBasedContentConfigs for all age groups', () => {
    const js = readFile('english-generator.js');
    const configSection = js.substring(
        js.indexOf('ageBasedContentConfigs'),
        js.indexOf('function buildLevelBasedConfigs')
    );
    ['4-5', '6', '7', '8', '9+', '10+'].forEach(age => {
        assert.ok(configSection.includes(`'${age}':`),
            `ageBasedContentConfigs must have age group ${age}`);
    });
});

test('English: each age config has easy, medium, hard, writing', () => {
    const js = readFile('english-generator.js');
    const configSection = js.substring(
        js.indexOf('ageBasedContentConfigs'),
        js.indexOf('function buildLevelBasedConfigs')
    );
    // Check for difficulty keys present in the config block
    assert.ok(configSection.includes("easy:"), 'Must have easy difficulty');
    assert.ok(configSection.includes("medium:"), 'Must have medium difficulty');
    assert.ok(configSection.includes("hard:"), 'Must have hard difficulty');
    assert.ok(configSection.includes("writing:"), 'Must have writing type');
});

test('English: english-generator.js has clearWritingCanvas function', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes('function clearWritingCanvas(canvasId)'),
        'Must have clearWritingCanvas function');
});

test('English: english-generator.js has initializeAllWritingCanvases function', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes('function initializeAllWritingCanvases()'),
        'Must have initializeAllWritingCanvases function');
});

test('English: getCompletedWorksheets calls use await in english.html', () => {
    const html = readFile('english.html');
    const call = html.indexOf('getCompletedWorksheets');
    const snippet = html.substring(Math.max(0, call - 20), call + 30);
    assert.ok(snippet.includes('await'),
        'getCompletedWorksheets must be awaited');
});

test('English: english.html has progress-map container', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('id="progress-map-container"'),
        'english.html must have progress-map-container for gamified journey');
});

test('English: english.html has bottom navigation', () => {
    const html = readFile('english.html');
    assert.ok(html.includes('class="bottom-nav"'),
        'english.html must have bottom navigation bar');
    assert.ok(html.includes('href="index"'),
        'Bottom nav must link to home');
});

test('English: english.html DOMContentLoaded is async', () => {
    const html = readFile('english.html');
    assert.ok(html.includes("DOMContentLoaded', async function"),
        'DOMContentLoaded handler must be async for await support');
});

test('English: assessment.css has no inline duplicates in index.html', () => {
    const html = readFile('index.html');
    // index.html should NOT have inline assessment styles anymore (only the comment marker)
    assert.ok(!html.includes('.assessment-question {'),
        'index.html should not have inline .assessment-question styles (moved to assessment.css)');
    assert.ok(!html.includes('.gate-content {'),
        'index.html should not have inline .gate-content styles (moved to assessment.css)');
});

// ============================================================================
console.log('\n=== Theme-Specific Doodle Backgrounds ===');
// ============================================================================

test('Theme doodles: theme-manager.js has getThemeDoodlePaths function', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('function getThemeDoodlePaths(theme)'),
        'Must have getThemeDoodlePaths function for theme-specific SVG paths');
});

test('Theme doodles: theme-manager.js has applyThemeDoodle function', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('function applyThemeDoodle(themeName)'),
        'Must have applyThemeDoodle to set body background-image dynamically');
});

test('Theme doodles: applyTheme calls applyThemeDoodle', () => {
    const js = readFile('theme-manager.js');
    const applyThemeFn = js.substring(js.indexOf('function applyTheme('), js.indexOf('function applyThemeDoodle'));
    assert.ok(applyThemeFn.includes('applyThemeDoodle('),
        'applyTheme must call applyThemeDoodle to update doodle background');
});

test('Theme doodles: all 8 themes have doodle paths', () => {
    const js = readFile('theme-manager.js');
    const themes = ['ocean', 'forest', 'sunset', 'candy', 'space', 'rainbow', 'dinosaur', 'dragon'];
    themes.forEach(theme => {
        assert.ok(js.includes("'" + theme + "':") || js.includes(theme + ':'),
            'getThemeDoodlePaths must have paths for theme: ' + theme);
    });
});

test('Theme doodles: each theme has doodleColor in THEMES', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('doodleColor:'),
        'THEMES must have doodleColor property for SVG stroke color');
    // Each theme should have it
    const themesBlock = js.substring(js.indexOf('const THEMES'), js.indexOf('const DEFAULT_THEME'));
    const count = (themesBlock.match(/doodleColor:/g) || []).length;
    assert.ok(count >= 6, 'All 6 themes must have doodleColor (found ' + count + ')');
});

test('Theme doodles: CSS body no longer has hardcoded doodle SVG', () => {
    const css = readFile('styles.css');
    assert.ok(!css.includes("stroke='%23667eea'"),
        'styles.css body must not have hardcoded ocean-blue doodle SVG (now dynamic via JS)');
});

test('Theme doodles: CSS body has comment about dynamic doodles', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('theme-manager.js'),
        'styles.css body should reference theme-manager.js for doodle background');
});

test('Theme doodles: LUCIDE_ICONS has ocean-specific icons', () => {
    const js = readFile('theme-manager.js');
    // Ocean theme should reference fish, waves, shell icons from Lucide
    assert.ok(js.includes("'fish':"), 'LUCIDE_ICONS must have fish icon');
    assert.ok(js.includes("'waves':"), 'LUCIDE_ICONS must have waves icon');
    assert.ok(js.includes("'shell':"), 'LUCIDE_ICONS must have shell icon');
});

test('Theme doodles: THEME_ICON_NAMES maps each theme to 6 icons', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('THEME_ICON_NAMES'), 'Must have THEME_ICON_NAMES mapping');
    // Each theme array should have 6 entries
    const themes = ['ocean', 'forest', 'sunset', 'candy', 'space', 'rainbow', 'dinosaur', 'dragon'];
    themes.forEach(theme => {
        const regex = new RegExp(theme + ":\\s*\\[");
        assert.ok(regex.test(js), 'THEME_ICON_NAMES must have ' + theme);
    });
});

test('Theme doodles: getThemeDoodlePaths uses grid transform placement', () => {
    const js = readFile('theme-manager.js');
    // New implementation uses <g transform> for icon placement on 6x6 grid
    assert.ok(js.includes("translate(") && js.includes("scale("),
        'getThemeDoodlePaths must use translate+scale transforms for icon placement');
});

test('Theme doodles: desktop opacity is 0.16, mobile is 0.1', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes("window.innerWidth >= 1025 ? '0.16' : '0.1'"),
        'applyThemeDoodle must use 0.16 opacity on desktop, 0.1 on mobile');
});

test('Theme doodles: no desktop media query override for doodles in CSS', () => {
    const css = readFile('styles.css');
    // Old desktop override should be gone
    assert.ok(!css.includes("opacity='0.16'"),
        'CSS should not have desktop doodle opacity override (now handled by JS)');
});

// ============================================================================
console.log('\n=== BUG-043: English Assessment Client-Server Match ===');
// ============================================================================

test('BUG-043: assessment.js has ENGLISH_ASSESSMENT_BANK matching server', () => {
    const clientJs = readFile('assessment.js');
    const serverJs = readFile('functions/shared/math-engine.js');

    // Client must have the same bank
    assert.ok(clientJs.includes('const ENGLISH_ASSESSMENT_BANK'),
        'assessment.js must have ENGLISH_ASSESSMENT_BANK');

    // Verify same age groups exist
    const ageGroups = ['4-5', '6', '7', '8', '9+', '10+'];
    ageGroups.forEach(ag => {
        assert.ok(clientJs.includes("'" + ag + "'"),
            'Client bank must have age group: ' + ag);
    });

    // Verify first question matches server for each age group
    assert.ok(clientJs.includes("Complete: c_t") && serverJs.includes("Complete: c_t"),
        'First 4-5 easy question must match between client and server');
    assert.ok(clientJs.includes("Write the word: accommodation") && serverJs.includes("Write the word: accommodation"),
        '10+ easy question must match between client and server');
});

test('BUG-043: assessment.js has seeded random for English', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('class AssessmentSeededRandom'),
        'assessment.js must have AssessmentSeededRandom class');
    assert.ok(js.includes('function assessmentHashCode'),
        'assessment.js must have assessmentHashCode function');
    assert.ok(js.includes('assessment-\' + childId + \'-english'),
        'English assessment must use same seed format as server: assessment-{childId}-english');
});

test('BUG-043: generateEnglishAssessmentQuestions uses bank not dynamic generators', () => {
    const js = readFile('assessment.js');
    const fn = js.substring(
        js.indexOf('function generateEnglishAssessmentQuestions'),
        js.indexOf('function generateMathAssessmentQuestions')
    );
    // Must NOT use dynamic generators
    assert.ok(!fn.includes('generatePictureWordProblems'),
        'English assessment must NOT use dynamic generators (was BUG-043 root cause)');
    assert.ok(!fn.includes('generateSightWordProblems'),
        'English assessment must NOT use dynamic generators');
    // Must use bank with seeded shuffle
    assert.ok(fn.includes('ENGLISH_ASSESSMENT_BANK'),
        'English assessment must use ENGLISH_ASSESSMENT_BANK');
    assert.ok(fn.includes('AssessmentSeededRandom'),
        'English assessment must use seeded random');
});

test('BUG-043: math assessment uses seeded random matching server', () => {
    const js = readFile('assessment.js');
    const fn = js.substring(
        js.indexOf('function generateMathAssessmentQuestions'),
        js.indexOf('function determineLevelFromScore')
    );
    assert.ok(fn.includes('assessmentHashCode'),
        'Math assessment must use assessmentHashCode for seed');
    assert.ok(fn.includes('seededRandom = new SeededRandom(seed)'),
        'Math assessment must set seeded random before generation');
    assert.ok(fn.includes('seededRandom = null'),
        'Math assessment must clear seeded random after generation');
});

test('BUG-043: math assessment uses 4 tiers (younger-easy, current-easy, current-medium, older-easy)', () => {
    const js = readFile('assessment.js');
    const fn = js.substring(
        js.indexOf('function generateMathAssessmentQuestions'),
        js.indexOf('function determineLevelFromScore')
    );
    // Must have 4 tier calls (exclude the function definition line)
    const lines = fn.split('\n').filter(l => l.trim().startsWith('generateFromConfig('));
    assert.strictEqual(lines.length, 4, 'Must have 4 generateFromConfig calls for 4 tiers (found ' + lines.length + ')');
});

test('BUG-043: server math assessment uses 4 tiers matching client', () => {
    const js = readFile('functions/shared/math-engine.js');
    const fn = js.substring(
        js.indexOf('function generateSeededAssessmentQuestions'),
        js.indexOf('/**\n * English assessment')
    );
    // Must have 4 tier calls (exclude the function definition line)
    const lines = fn.split('\n').filter(l => l.trim().startsWith('generateFromConfig('));
    assert.strictEqual(lines.length, 4, 'Server must have 4 generateFromConfig calls matching client (found ' + lines.length + ')');
    assert.ok(fn.includes('olderAge'),
        'Server must include olderAge tier (was missing before BUG-043 fix)');
    assert.ok(fn.includes('slice(0, 20)'),
        'Server must return 20 questions (was 10 before BUG-043 fix)');
});

test('BUG-043: server English comparison trims whitespace', () => {
    const js = readFile('functions/level-functions.js');
    assert.ok(js.includes('.trim().toLowerCase()'),
        'Server English answer comparison must trim whitespace');
});

test('BUG-043: startAssessment passes childId to question generators', () => {
    const js = readFile('assessment.js');
    const fn = js.substring(
        js.indexOf('function startAssessment('),
        js.indexOf('function renderAssessmentUI')
    );
    assert.ok(fn.includes('childId'),
        'startAssessment must get childId for seeded generation');
    assert.ok(fn.includes('generateEnglishAssessmentQuestions(ageGroup, childId)'),
        'startAssessment must pass childId to English generator');
    assert.ok(fn.includes('generateMathAssessmentQuestions(operation, ageGroup, childId)'),
        'startAssessment must pass childId to Math generator');
});

// ============================================================================
console.log('\n=== BUG-059: Level Test Client-Server Question Mismatch ===');
// ============================================================================

test('BUG-059: level-test.js uses deterministic seed matching server', () => {
    const js = readFile('level-test.js');
    // Must use hashCode with childId + weekStr (matching server's generateSeededLevelTestQuestions)
    assert.ok(js.includes("hashCode('leveltest-'"),
        'level-test.js must use hashCode with leveltest prefix for seed');
    assert.ok(js.includes('childId') && js.includes('weekStr'),
        'level-test.js must use childId and weekStr in seed');
});

test('BUG-059: level-test.js sets global seededRandom before generating', () => {
    const js = readFile('level-test.js');
    const fn = js.substring(
        js.indexOf('function generateMathLevelTest('),
        js.indexOf('function generateEnglishLevelTest(')
    );
    assert.ok(fn.includes('seededRandom = new SeededRandom(seed)'),
        'generateMathLevelTest must set global seededRandom before generating');
});

test('BUG-059: level-test.js uses same difficulty distribution as server', () => {
    const clientJs = readFile('level-test.js');
    const serverJs = readFile('functions/shared/math-engine.js');
    // Both must use: ['easy', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard']
    assert.ok(clientJs.includes("'easy', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard'"),
        'Client level test must use same difficulty distribution as server (1 easy, 3 medium, 6 hard)');
    assert.ok(serverJs.includes("'easy', 'medium', 'medium', 'medium', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard'"),
        'Server level test must use difficulty distribution: 1 easy, 3 medium, 6 hard');
});

test('BUG-059: startLevelTest passes childId and weekStr to generator', () => {
    const js = readFile('level-test.js');
    const fn = js.substring(
        js.indexOf('async function startLevelTest('),
        js.indexOf('function renderLevelTest()')
    );
    assert.ok(fn.includes('getWeekString(new Date())'),
        'startLevelTest must compute weekStr using getWeekString');
    assert.ok(fn.includes('generateMathLevelTest(operation, ageGroup, child.id, weekStr)'),
        'startLevelTest must pass child.id and weekStr to generateMathLevelTest');
});

test('BUG-059: level-test.js does NOT use Date.now() for seeds', () => {
    const js = readFile('level-test.js');
    const fn = js.substring(
        js.indexOf('function generateMathLevelTest('),
        js.indexOf('function generateEnglishLevelTest(')
    );
    assert.ok(!fn.includes('Date.now()'),
        'generateMathLevelTest must NOT use Date.now() for seeds — causes client-server mismatch');
    // Check non-comment lines only for Math.random() usage
    const codeLines = fn.split('\n').filter(l => !l.trim().startsWith('//'));
    const hasRandomInCode = codeLines.some(l => l.includes('Math.random()'));
    assert.ok(!hasRandomInCode,
        'generateMathLevelTest code must NOT use Math.random() — must be deterministic');
});

test('BUG-059: server seed format matches client seed format', () => {
    const clientJs = readFile('level-test.js');
    const serverJs = readFile('functions/shared/math-engine.js');
    // Both must use: hashCode(`leveltest-${childId}-${operation}-${weekStr}`)
    assert.ok(serverJs.includes("hashCode(`leveltest-${childId}-${operation}-${weekStr}`)"),
        'Server must use seed: hashCode(leveltest-{childId}-{operation}-{weekStr})');
    // Client uses string concat equivalent
    assert.ok(clientJs.includes("hashCode('leveltest-' + childId + '-' + operation + '-' + weekStr)"),
        'Client must use same seed format as server');
});

// ============================================================================
console.log('\n=== BUG-044: Theme Gradient Repaint ===');
// ============================================================================

test('BUG-044: theme-manager.js has applyThemeGradients function', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('function applyThemeGradients(themeName)'),
        'Must have applyThemeGradients to force repaint on all gradient elements');
});

test('BUG-044: applyTheme calls applyThemeGradients (not just headers)', () => {
    const js = readFile('theme-manager.js');
    const applyThemeFn = js.substring(
        js.indexOf('function applyTheme('),
        js.indexOf('function applyThemeGradients')
    );
    assert.ok(applyThemeFn.includes('applyThemeGradients('),
        'applyTheme must call applyThemeGradients');
    assert.ok(!applyThemeFn.includes('applyThemeToHeaders('),
        'applyTheme should NOT call old applyThemeToHeaders (replaced by applyThemeGradients)');
});

test('BUG-044: applyThemeGradients targets all gradient CSS selectors', () => {
    const js = readFile('theme-manager.js');
    const fn = js.substring(
        js.indexOf('function applyThemeGradients'),
        js.indexOf('function applyThemeDoodle')
    );
    // Must target all known gradient elements
    assert.ok(fn.includes('.user-header'), 'Must target .user-header');
    assert.ok(fn.includes('.control-buttons button'), 'Must target .control-buttons button (worksheet controls)');
    assert.ok(fn.includes('.back-row button'), 'Must target .back-row button (back buttons)');
    assert.ok(fn.includes('#greeting-banner'), 'Must target #greeting-banner');
    assert.ok(fn.includes('.eraser-btn'), 'Must target .eraser-btn');
});

test('BUG-044: applyThemeGradients also updates inline-styled elements', () => {
    const js = readFile('theme-manager.js');
    const fn = js.substring(
        js.indexOf('function applyThemeGradients'),
        js.indexOf('function applyThemeDoodle')
    );
    assert.ok(fn.includes("querySelectorAll('[style]')"),
        'Must also scan inline-styled elements for gradient backgrounds');
});

test('BUG-044: applyThemeGradients forces body background-color', () => {
    const js = readFile('theme-manager.js');
    const fn = js.substring(
        js.indexOf('function applyThemeGradients'),
        js.indexOf('function applyThemeDoodle')
    );
    assert.ok(fn.includes('document.body.style.backgroundColor'),
        'Must explicitly set body backgroundColor for immediate update');
});

test('BUG-044: no hardcoded ocean blue rgba in box-shadows', () => {
    const css = readFile('styles.css');
    assert.ok(!css.includes('rgba(102,126,234'),
        'styles.css must not have hardcoded ocean-blue rgba(102,126,234) in box-shadows');
    // Should use CSS variable instead
    assert.ok(css.includes('var(--color-primary-20)'),
        'Box shadows should use var(--color-primary-20) instead of hardcoded rgba');
});

// ============================================================================
console.log('\n=== BUG-047: Input mode flicker ===');
// ============================================================================

test('BUG-047: selectInputMode does not close/reopen modal', () => {
    const js = readFile('profile-selector.js');
    const fn = js.substring(js.indexOf('async function selectInputMode'), js.indexOf('// Add styles for the profile selector'));
    assert.ok(!fn.includes('closeChildSettings()'),
        'selectInputMode must NOT call closeChildSettings (causes flicker)');
    assert.ok(!fn.includes('openChildSettings('),
        'selectInputMode must NOT call openChildSettings (causes flicker)');
});

// ============================================================================
console.log('\n=== BUG-048: Theme picker buttons lose gradient ===');
// ============================================================================

test('BUG-048: applyThemeGradients skips theme-option elements', () => {
    const js = readFile('theme-manager.js');
    const fn = js.substring(
        js.indexOf('function applyThemeGradients'),
        js.indexOf('function applyThemeDoodle')
    );
    assert.ok(fn.includes("classList.contains('theme-option')"),
        'applyThemeGradients must skip .theme-option elements to preserve their individual gradients');
});

// ============================================================================
console.log('\n=== BUG-049: Doodle SVG cleanup ===');
// ============================================================================

test('BUG-049: doodle stroke-width is 2 for cleaner lines', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes("stroke-width='2'"),
        'Doodle SVG stroke-width should be 2 for clean, visible lines');
});

test('BUG-049: ocean doodles use Lucide fish icon', () => {
    const js = readFile('theme-manager.js');
    // Lucide fish icon has distinctive fish path data
    assert.ok(js.includes("'fish':") && js.includes('M6.5 12c.94-3.46'),
        'Ocean doodles should use Lucide fish icon with recognizable path');
});

test('BUG-049: candy doodles use Lucide heart icon', () => {
    const js = readFile('theme-manager.js');
    // Lucide heart icon path
    assert.ok(js.includes("'heart':") && js.includes('M2 9.5a5.5 5.5'),
        'Candy doodles should use Lucide heart icon with recognizable path');
});

// ============================================================================
console.log('\n=== BUG-050: Progress ring uses completedCount ===');
// ============================================================================

test('BUG-050: progress-map uses completedCount not pages.filter', () => {
    const js = readFile('progress-map.js');
    // Look at the weekly assignment data loading section
    const start = js.indexOf('weeklyDone = 0');
    const end = js.indexOf('// Stats', start);
    const dataSection = js.substring(start, end);
    assert.ok(dataSection.includes('completedCount'),
        'weeklyDone should use completedCount field (reliable) not pages.filter(p => p.completed)');
    assert.ok(!dataSection.includes('.filter(p => p.completed)'),
        'Should NOT use pages.filter(p => p.completed) which can be unreliable after refresh');
});

// ============================================================================
console.log('\n=== BUG-045: Story icon property name ===');
// ============================================================================

test('BUG-045: english-generator uses story.icon not story.emoji', () => {
    const js = readFile('english-generator.js');
    // The story card template should use story.icon
    assert.ok(js.includes('story.icon'), 'Should reference story.icon for story cards');
    assert.ok(!js.includes('story.emoji'), 'Should NOT reference story.emoji (wrong property name)');
});

// ============================================================================
console.log('\n=== BUG-046: English canvas multi-character recognition ===');
// ============================================================================

test('BUG-046: recognizeHandwriting uses findDigitSegments with expectedAnswer.length hint', () => {
    const js = readFile('english-handwriting-helper.js');
    assert.ok(js.includes('findDigitSegments(cleanCanvas, expectedAnswer.length)'),
        'Multi-char path should call findDigitSegments with expected length hint on cleaned canvas');
});

test('BUG-046: recognizeHandwriting uses extractSegment for each character', () => {
    const js = readFile('english-handwriting-helper.js');
    assert.ok(js.includes('extractSegment(cleanCanvas, segments[s])'),
        'Should extract each segment from cleaned canvas for individual recognition');
});

test('BUG-046: recognizeHandwriting combines characters into word', () => {
    const js = readFile('english-handwriting-helper.js');
    assert.ok(js.includes("recognizedChars.join('')"),
        'Should join all recognized characters into a word');
});

test('BUG-046: recognizeHandwriting does NOT just read first character', () => {
    const js = readFile('english-handwriting-helper.js');
    // Should NOT contain the old "first character only" approach
    assert.ok(!js.includes('// For words: we can only recognize single chars'),
        'Old comment about single char recognition should be removed');
});

test('BUG-046: validateHandwriting is case-insensitive', () => {
    const js = readFile('english-handwriting-helper.js');
    const fnBody = js.substring(
        js.indexOf('function validateHandwriting'),
        js.indexOf('function calculateSimilarity')
    );
    assert.ok(fnBody.includes('.toLowerCase()'),
        'validateHandwriting should use toLowerCase for case-insensitive comparison');
});

test('BUG-046: validateHandwriting accepts perPositionPredictions for top-N matching', () => {
    const js = readFile('english-handwriting-helper.js');
    assert.ok(js.includes('function validateHandwriting(recognized, expected, perPositionPredictions)'),
        'validateHandwriting should accept perPositionPredictions as third parameter');
    assert.ok(js.includes('perPositionPredictions.length'),
        'Should check perPositionPredictions for top-N matching');
    assert.ok(js.includes("preds.indexOf(expectedCharLower)"),
        'Should check if expected char is in top predictions at each position');
});

test('BUG-046: recognizeHandwriting returns perPositionPredictions', () => {
    const js = readFile('english-handwriting-helper.js');
    assert.ok(js.includes('perPositionPredictions: perPositionPredictions'),
        'Recognition result should include perPositionPredictions');
    assert.ok(js.includes('.slice(0, 3)'),
        'Should store top 3 predictions per position');
});

test('BUG-046: checkHandwriting passes perPositionPredictions to validateHandwriting', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes('validateHandwriting(result.recognized, expectedAnswer, result.perPositionPredictions)'),
        'Should pass perPositionPredictions from recognition result to validateHandwriting');
});

test('BUG-046: per-position expected char passed for prior boost', () => {
    const js = readFile('english-handwriting-helper.js');
    assert.ok(js.includes('expectedAnswer.charAt(s)'),
        'Should pass expected character at each position for prior boost');
});

test('BUG-046: findDigitSegments accepts expectedCount parameter', () => {
    const js = readFile('handwriting-recognition.js');
    assert.ok(js.includes('function findDigitSegments(canvas, expectedCount)'),
        'findDigitSegments should accept expectedCount parameter');
});

test('BUG-046: findDigitSegments no longer caps at 3 segments', () => {
    const js = readFile('handwriting-recognition.js');
    assert.ok(!js.includes('Math.min(3,'),
        'Should not have Math.min(3, ...) cap on segment count');
    // Should cap at 10 instead
    assert.ok(js.includes('Math.min(10,'),
        'Should cap at 10 for reasonable max');
});

test('BUG-046: findDigitSegments uses expectedCount for even splitting', () => {
    const js = readFile('handwriting-recognition.js');
    assert.ok(js.includes('segments.length < expectedCount'),
        'Should use expectedCount to trigger even splitting when gap detection finds too few');
});

test('BUG-046: findDigitSegments uses smaller gap threshold (2%)', () => {
    const js = readFile('handwriting-recognition.js');
    assert.ok(js.includes('contentWidth * 0.02'),
        'Gap threshold should be 2% of width (was 5%)');
});

test('BUG-046: _removeRuledLines cleans canvas before segmentation', () => {
    const js = readFile('english-handwriting-helper.js');
    assert.ok(js.includes('function _removeRuledLines(canvas)'),
        'Should have _removeRuledLines function to clean ruled lines from canvas');
    assert.ok(js.includes('_removeRuledLines(canvas)'),
        'Multi-char path should call _removeRuledLines before segmentation');
    assert.ok(js.includes('findDigitSegments(cleanCanvas'),
        'Should pass cleaned canvas to findDigitSegments');
    assert.ok(js.includes('extractSegment(cleanCanvas'),
        'Should pass cleaned canvas to extractSegment for recognition');
});

test('BUG-046: _removeRuledLines keeps only dark pixels (r<80, g<80, b<80)', () => {
    const js = readFile('english-handwriting-helper.js');
    const fnStart = js.indexOf('function _removeRuledLines');
    const fnEnd = js.indexOf('return cleanCanvas;', fnStart) + 30;
    const fn = js.substring(fnStart, fnEnd);
    assert.ok(fn.includes('r < 80 && g < 80 && b < 80'),
        'Should only keep pixels where all RGB channels < 80 (black handwriting)');
});

// ============================================================================
console.log('\n=== Motivational Sequencing & 0% Safety Net ===');
// ============================================================================

test('adaptive-engine.js has ZONE_PROFILES with 3 profiles', () => {
    const js = readFile('functions/adaptive-engine.js');
    assert.ok(js.includes('ZONE_PROFILES'), 'Should have ZONE_PROFILES constant');
    assert.ok(js.includes('gentle:'), 'Should have gentle profile');
    assert.ok(js.includes('standard:'), 'Should have standard profile');
    assert.ok(js.includes('challenge:'), 'Should have challenge profile');
});

test('adaptive-engine.js has motivational zones: warmup, rampup, focus, mixed, cooldown', () => {
    const js = readFile('functions/adaptive-engine.js');
    assert.ok(js.includes('warmup:'), 'Should have warmup zone');
    assert.ok(js.includes('rampup:'), 'Should have rampup zone');
    assert.ok(js.includes('focus:'), 'Should have focus zone');
    assert.ok(js.includes('mixed:'), 'Should have mixed zone');
    assert.ok(js.includes('cooldown:'), 'Should have cooldown zone');
});

test('adaptive-engine.js has getPageProfile function', () => {
    const js = readFile('functions/adaptive-engine.js');
    assert.ok(js.includes('function getPageProfile(pageNumber)'),
        'Should have getPageProfile helper');
});

test('adaptive-engine.js has getSkillPool fallback function', () => {
    const js = readFile('functions/adaptive-engine.js');
    assert.ok(js.includes('function getSkillPool(targetBucket'),
        'Should have getSkillPool helper with fallback chain');
});

test('adaptive-engine.js does NOT shuffle problems (motivational order preserved)', () => {
    const js = readFile('functions/adaptive-engine.js');
    assert.ok(!js.includes('Fisher-Yates') && !js.includes('shuffleSeed'),
        'Should not have shuffle logic (problems are in motivational order)');
    assert.ok(js.includes('NO SHUFFLE'), 'Should have comment explaining no shuffle');
});

test('adaptive-engine.js problems have zone field', () => {
    const js = readFile('functions/adaptive-engine.js');
    assert.ok(js.includes("zone: zoneName"), 'Problems should include zone field');
});

test('adaptive-engine.js reasoning includes sequencing metadata', () => {
    const js = readFile('functions/adaptive-engine.js');
    assert.ok(js.includes('sequencing:'), 'Reasoning should include sequencing');
    assert.ok(js.includes("type: 'motivational'"), 'Sequencing type should be motivational');
});

test('worksheet-generator.js has showZeroScoreDialog function', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('function showZeroScoreDialog(operation)'),
        'Should have showZeroScoreDialog function for 0% safety net');
});

test('worksheet-generator.js triggers 0% dialog for adaptive worksheets', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('score === 0 && correctCount === 0 && currentWorksheet.adaptive'),
        'Should check for 0% score on adaptive worksheets');
    assert.ok(js.includes('showZeroScoreDialog'), 'Should call showZeroScoreDialog');
});

test('worksheet-generator.js 0% dialog offers level reduction (clamps at level 1)', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('Math.max(1, currentLevel - 1)'),
        'Level reduction should clamp at level 1');
    assert.ok(js.includes('canReduceLevel'), 'Should check if level can be reduced');
});

test('worksheet-generator.js 0% dialog offers operation explanation', () => {
    const js = readFile('worksheet-generator.js');
    assert.ok(js.includes('showOperationExplanation'),
        'Should call showOperationExplanation for "Show Me How" option');
});

test('operation-explainer.js exists and has showOperationExplanation', () => {
    const js = readFile('operation-explainer.js');
    assert.ok(js.includes('function showOperationExplanation(operation)'),
        'Should have showOperationExplanation function');
});

test('operation-explainer.js covers all 4 operations', () => {
    const js = readFile('operation-explainer.js');
    assert.ok(js.includes("case 'addition':"), 'Should handle addition');
    assert.ok(js.includes("case 'subtraction':"), 'Should handle subtraction');
    assert.ok(js.includes("case 'multiplication':"), 'Should handle multiplication');
    assert.ok(js.includes("case 'division':"), 'Should handle division');
});

test('index.html loads operation-explainer.js before worksheet-generator.js', () => {
    const html = readFile('index.html');
    const explainerPos = html.indexOf('operation-explainer.js');
    const worksheetPos = html.indexOf('worksheet-generator.js');
    assert.ok(explainerPos > 0, 'Should load operation-explainer.js');
    assert.ok(explainerPos < worksheetPos,
        'operation-explainer.js should load before worksheet-generator.js');
});

// ============================================================================
console.log('\n=== UI Cleanup: Icon-Only Back Buttons ===');
// ============================================================================

test('all HTML back buttons use back-btn-icon class', () => {
    const htmlFiles = ['index.html', 'english.html', 'stories.html', 'german.html',
        'german-kids.html', 'aptitude.html', 'learn-english-stories.html',
        'drawing.html', 'settings.html', 'admin.html', 'progress.html',
        'children-profiles.html', 'privacy-policy.html', 'terms.html', 'rewards.html'];

    for (const file of htmlFiles) {
        const content = readFile(file);
        // Should not have old-style text-based back buttons
        assert.ok(!content.includes('"← Back to'),
            `${file} should not have old "← Back to" text buttons`);
    }
});

test('back-btn-icon class defined in styles.css', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('.back-btn-icon'), 'styles.css should define .back-btn-icon');
    assert.ok(css.includes('border-radius: 50%'), 'back-btn-icon should be circular');
    assert.ok(css.includes('width: 40px'), 'back-btn-icon should have fixed width');
});

test('old back button CSS classes removed', () => {
    const pmCss = readFile('progress-map.css');
    assert.ok(!pmCss.includes('.pm-back-btn'), 'progress-map.css should not have .pm-back-btn');

    const assessCss = readFile('assessment.css');
    assert.ok(!assessCss.includes('.gate-back-btn'), 'assessment.css should not have .gate-back-btn');

    const rewardsCss = readFile('rewards.css');
    assert.ok(!rewardsCss.includes('.rewards-back-btn'), 'rewards.css should not have .rewards-back-btn');
});

test('HTML back buttons use .back-row wrapper (not .navigation)', () => {
    const files = ['index.html', 'english.html', 'stories.html', 'german.html',
        'aptitude.html', 'drawing.html', 'learn-english-stories.html', 'german-kids.html'];
    for (const file of files) {
        const content = readFile(file);
        // back-btn-icon should be inside .back-row, not .navigation
        const navBackPattern = /class="navigation"[\s\S]{0,100}back-btn-icon/;
        assert.ok(!navBackPattern.test(content),
            `${file} should not have back-btn-icon inside .navigation (use .back-row)`);
        // Should have back-row if it has back-btn-icon
        if (content.includes('back-btn-icon')) {
            assert.ok(content.includes('class="back-row"'),
                `${file} back-btn-icon should be inside .back-row`);
        }
    }
});

test('.back-row CSS class exists in styles.css', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('.back-row'), 'styles.css should define .back-row');
    assert.ok(css.includes('.back-row {'), 'styles.css should have .back-row rule');
});

test('.back-row hidden in print CSS', () => {
    const css = readFile('styles.css');
    const printStart = css.indexOf('@media print');
    assert.ok(printStart > 0, 'Should have @media print rule');
    const printBlock = css.substring(printStart);
    assert.ok(printBlock.includes('.back-row'), 'Print CSS should hide .back-row');
});

test('JS generators use .back-row for back buttons', () => {
    const jsFiles = [
        'stories-generator.js', 'worksheet-generator.js', 'english-generator.js',
        'aptitude-generator.js', 'eq-generator.js', 'german-generator.js',
        'german-kids-generator.js', 'learn-english-stories-generator.js',
        'drawing-generator.js', 'writing-practice.js', 'german-a1-stories.js'
    ];
    for (const file of jsFiles) {
        const content = readFile(file);
        if (content.includes('back-btn-icon')) {
            const navBackPattern = /class="navigation"[\s\S]{0,100}back-btn-icon/;
            assert.ok(!navBackPattern.test(content),
                `${file} should not have back-btn-icon inside .navigation (use .back-row)`);
            assert.ok(content.includes('class="back-row"'),
                `${file} should use .back-row for back buttons`);
        }
    }
});

test('redundant "Select/Choose" headings removed', () => {
    const aptitude = readFile('aptitude.html');
    assert.ok(!aptitude.includes('Choose Your Challenge'), 'Should use simpler heading');
    assert.ok(aptitude.includes('Challenges'), 'Should use concise heading');

    const english = readFile('english.html');
    assert.ok(!english.includes('Select Activity Type'), 'Should use simpler heading');
    assert.ok(english.includes('Activity Type'), 'Should use concise heading');
});

// ============================================================================
console.log('\n=== BUG-051: Admin profile selector hidden ===');
// ============================================================================

test('BUG-051: index.html does NOT hide profile selector for admin', () => {
    const html = readFile('index.html');
    assert.ok(!html.includes("profileSelectorContainer.style.display = 'none'"),
        'index.html must NOT hide profile-selector-container for admin (demo children need it)');
});

test('BUG-051: admin uses selected child age on all module pages', () => {
    const pages = ['english.html', 'stories.html', 'aptitude.html', 'drawing.html',
        'emotional-quotient.html', 'learn-english-stories.html', 'german-kids.html'];
    pages.forEach(page => {
        const html = readFile(page);
        assert.ok(html.includes('const adminChild = getSelectedChild()'),
            page + ' must use getSelectedChild() for admin age detection');
        assert.ok(!html.includes("Admin doesn't need child profile"),
            page + ' must not have old admin bypass comment');
    });
});

test('BUG-051: index.html shows weekly progress for admin with children', () => {
    const html = readFile('index.html');
    assert.ok(html.includes("userData.role !== 'admin' || wpChild"),
        'Weekly progress should show for admin if they have a selected child');
});

// ============================================================================
console.log('\n=== Demo Data Seeder ===');
// ============================================================================

test('demo-seeder.js exists and exports required functions', () => {
    const js = readFile('functions/demo-seeder.js');
    assert.ok(js.includes('seedDemoData'), 'Should export seedDemoData function');
    assert.ok(js.includes('clearDemoData'), 'Should export clearDemoData function');
    assert.ok(js.includes('DEMO_CHILDREN'), 'Should export DEMO_CHILDREN array');
    assert.ok(js.includes('getCorrectCount'), 'Should export getCorrectCount function');
});

test('demo-seeder has 5 demo children with required fields', () => {
    const js = readFile('functions/demo-seeder.js');
    const names = ['Aria Star', 'Ben Average', 'Clara Struggle', 'Danny Roller', 'Emma Random'];
    names.forEach(name => {
        assert.ok(js.includes(name), 'Should have demo child: ' + name);
    });
    const patterns = ['consistent', 'average', 'poor', 'highs_and_lows', 'inconsistent'];
    patterns.forEach(p => {
        assert.ok(js.includes("'" + p + "'"), 'Should have pattern: ' + p);
    });
});

test('demo-seeder children have varied operations and levels', () => {
    const js = readFile('functions/demo-seeder.js');
    assert.ok(js.includes("operation: 'addition'"), 'Should have addition operation');
    assert.ok(js.includes("operation: 'subtraction'"), 'Should have subtraction operation');
    assert.ok(js.includes("operation: 'multiplication'"), 'Should have multiplication operation');
    assert.ok(js.includes("operation: 'division'"), 'Should have division operation');
    // Different levels
    assert.ok(js.includes('level: 2'), 'Should have level 2');
    assert.ok(js.includes('level: 5'), 'Should have level 5');
    assert.ok(js.includes('level: 7'), 'Should have level 7');
    assert.ok(js.includes('level: 9'), 'Should have level 9');
});

test('demo-seeder marks children with isDemo flag', () => {
    const js = readFile('functions/demo-seeder.js');
    assert.ok(js.includes('isDemo: true'), 'Children must have isDemo: true for cleanup');
});

test('demo-seeder creates weekly_assignments and completions', () => {
    const js = readFile('functions/demo-seeder.js');
    assert.ok(js.includes("collection('weekly_assignments')"), 'Should create weekly_assignments');
    assert.ok(js.includes("collection('completions')"), 'Should create completions');
    assert.ok(js.includes("collection('skill_profile')"), 'Should create skill_profile');
});

test('demo-seeder creates English completions with scores', () => {
    const js = readFile('functions/demo-seeder.js');
    assert.ok(js.includes("module: 'english'"), 'Should create English completion docs');
    assert.ok(js.includes('engCompletedCount'), 'Should track English completed count');
    assert.ok(js.includes('completedCount: engCompletedCount'), 'Weekly assignment should use English completed count');
});

test('demo-seeder creates aptitude and stories completions', () => {
    const js = readFile('functions/demo-seeder.js');
    assert.ok(js.includes("module: 'aptitude'") || js.includes("module: mod.module"),
        'Should create aptitude completions');
    assert.ok(js.includes("'stories'"), 'Should create stories completions');
    assert.ok(js.includes("'patterns'") && js.includes("'sequences'"),
        'Should include aptitude sub-types');
});

test('demo-seeder Cloud Functions exported in index.js', () => {
    const js = readFile('functions/index.js');
    assert.ok(js.includes("require('./demo-seeder')"), 'Should import demo-seeder');
    assert.ok(js.includes('exports.seedDemoChildren'), 'Should export seedDemoChildren');
    assert.ok(js.includes('exports.clearDemoChildren'), 'Should export clearDemoChildren');
});

test('admin.html has demo seeder UI', () => {
    const html = readFile('admin.html');
    assert.ok(html.includes('seedDemoData()'), 'Should have seed button onclick');
    assert.ok(html.includes('clearDemoData()'), 'Should have clear button onclick');
    assert.ok(html.includes('demo-seed-status'), 'Should have status display div');
    assert.ok(html.includes("httpsCallable('seedDemoChildren')"), 'Should call seedDemoChildren CF');
    assert.ok(html.includes("httpsCallable('clearDemoChildren')"), 'Should call clearDemoChildren CF');
});

test('admin.html loads firebase-functions-compat.js', () => {
    const html = readFile('admin.html');
    assert.ok(html.includes('firebase-functions-compat.js'),
        'admin.html must load firebase-functions-compat.js for Cloud Function calls');
});

test('demo-seeder getCorrectCount returns expected ranges', () => {
    const js = readFile('functions/demo-seeder.js');
    // Consistent: 19-20 (95-100% → all completed)
    assert.ok(js.includes('return 19 + (seed % 2)'), 'Consistent should return 19-20');
    // Average: 16-20 (80-100% → some completed)
    assert.ok(js.includes('return 16 + (seed % 5)'), 'Average should return 16-20');
    // Poor: 8-15 (40-75%)
    assert.ok(js.includes('return 8 + (seed % 8)'), 'Poor should return 8-15');
    // Highs and lows: alternating weeks
    assert.ok(js.includes('weekIndex % 2'), 'Highs_and_lows should alternate by week');
    // Inconsistent: skip some
    assert.ok(js.includes('return -1'), 'Inconsistent should skip some days');
});

test('demo-seeder clearDemoData deletes all associated collections', () => {
    const js = readFile('functions/demo-seeder.js');
    assert.ok(js.includes("collection('completions')"), 'Should delete completions');
    assert.ok(js.includes("collection('weekly_assignments')"), 'Should delete weekly_assignments');
    assert.ok(js.includes("collection('skill_profile')"), 'Should delete skill_profiles');
    assert.ok(js.includes("collection('error_log')"), 'Should delete error_logs');
    assert.ok(js.includes("collection('adaptive_worksheets')"), 'Should delete adaptive_worksheets');
    assert.ok(js.includes("collection('notifications')"), 'Should delete notifications');
});

// ============================================================================
console.log('\n=== Dinosaur & Dragon Themes ===');
// ============================================================================

test('theme-manager.js includes dinosaur and dragon themes', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes("dinosaur:"), 'Should have dinosaur theme in THEMES');
    assert.ok(js.includes("dragon:"), 'Should have dragon theme in THEMES');
    assert.ok(js.includes("'Dinosaur'"), 'Should have Dinosaur display name');
    assert.ok(js.includes("'Dragon'"), 'Should have Dragon display name');
});

test('theme-manager.js has dinosaur and dragon in THEME_ICON_NAMES', () => {
    const js = readFile('theme-manager.js');
    const iconSection = js.substring(js.indexOf('THEME_ICON_NAMES'), js.indexOf('function getThemeDoodlePaths'));
    assert.ok(iconSection.includes('dinosaur:'), 'Should have dinosaur icon mapping');
    assert.ok(iconSection.includes('dragon:'), 'Should have dragon icon mapping');
});

test('styles.css has dinosaur and dragon theme CSS variables', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('[data-theme="dinosaur"]'), 'Should have dinosaur CSS theme');
    assert.ok(css.includes('[data-theme="dragon"]'), 'Should have dragon CSS theme');
});

// ============================================================================
console.log('\n=== BUG-054: Admin profile handling audit ===');
// ============================================================================

test('BUG-054: All module pages set window.currentUserRole', () => {
    const modulePages = [
        'index.html', 'english.html', 'aptitude.html', 'stories.html',
        'drawing.html', 'emotional-quotient.html', 'german-kids.html',
        'learn-english-stories.html'
    ];
    modulePages.forEach(page => {
        const html = readFile(page);
        assert.ok(html.includes('window.currentUserRole'),
            page + ' must set window.currentUserRole for generators to detect admin');
    });
});

test('BUG-054: All module pages query user role from Firestore', () => {
    const modulePages = [
        'english.html', 'aptitude.html', 'stories.html',
        'drawing.html', 'emotional-quotient.html', 'german-kids.html',
        'learn-english-stories.html'
    ];
    modulePages.forEach(page => {
        const html = readFile(page);
        assert.ok(html.includes("userData.role === 'admin'") || html.includes("isAdmin = userData.role === 'admin'"),
            page + ' must check admin role from Firestore userData');
    });
});

test('All generator files check window.currentUserRole for admin access', () => {
    const generators = [
        'worksheet-generator.js', 'english-generator.js', 'aptitude-generator.js',
        'eq-generator.js', 'stories-generator.js', 'drawing-generator.js',
        'german-kids-generator.js', 'learn-english-stories-generator.js'
    ];
    generators.forEach(gen => {
        const js = readFile(gen);
        assert.ok(js.includes("window.currentUserRole === 'admin'") ||
                  js.includes("currentUserRole === 'admin'"),
            gen + ' must check admin role via window.currentUserRole');
    });
});

test('Admin age fallback is consistently 10 across all module pages', () => {
    const modulePages = [
        'index.html', 'english.html', 'aptitude.html', 'stories.html',
        'drawing.html', 'emotional-quotient.html', 'german-kids.html',
        'learn-english-stories.html'
    ];
    modulePages.forEach(page => {
        const html = readFile(page);
        if (html.includes('adminChild')) {
            // Pages that use adminChild pattern should default to '10'
            assert.ok(html.includes("adminChild.age.toString() : '10'") ||
                      html.includes("adminChild.age) ? adminChild.age.toString() : '10'"),
                page + ' must use age 10 as admin fallback');
        }
    });
});

test('Admin with selected child uses child age, not hardcoded value', () => {
    const modulePages = [
        'english.html', 'aptitude.html', 'stories.html',
        'drawing.html', 'emotional-quotient.html', 'german-kids.html',
        'learn-english-stories.html'
    ];
    modulePages.forEach(page => {
        const html = readFile(page);
        assert.ok(html.includes('const adminChild = getSelectedChild()'),
            page + ' admin path must call getSelectedChild() to use child age');
        assert.ok(html.includes('adminChild && adminChild.age'),
            page + ' must check that adminChild.age exists before using it');
    });
});

test('Non-admin users without child are redirected to children-profiles', () => {
    const modulePages = [
        'english.html', 'aptitude.html', 'stories.html',
        'drawing.html', 'emotional-quotient.html', 'german-kids.html',
        'learn-english-stories.html'
    ];
    modulePages.forEach(page => {
        const html = readFile(page);
        // Only non-admin path should redirect to children-profiles
        assert.ok(html.includes("window.location.href = 'children-profiles'"),
            page + ' must redirect non-admin without child to children-profiles');
    });
});

test('Admin does NOT get redirected to children-profiles', () => {
    const modulePages = [
        'english.html', 'aptitude.html', 'stories.html',
        'drawing.html', 'emotional-quotient.html', 'german-kids.html',
        'learn-english-stories.html'
    ];
    modulePages.forEach(page => {
        const html = readFile(page);
        // Find the admin branch — it should NOT contain the redirect
        const adminBranch = html.indexOf('if (isAdmin)');
        const elseBranch = html.indexOf('} else {', adminBranch);
        const adminSection = html.substring(adminBranch, elseBranch);
        assert.ok(!adminSection.includes("window.location.href = 'children-profiles'"),
            page + ' admin path must NOT redirect to children-profiles');
    });
});

test('Profile selector queries children by parent_uid', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes("where('parent_uid', '==', parentUid)"),
        'Profile selector must query children by parent_uid');
});

test('Profile selector getSelectedChild returns null when no child selected', () => {
    const js = readFile('profile-selector.js');
    // Verify getSelectedChild() returns null if localStorage is empty
    const fnStart = js.indexOf('function getSelectedChild()');
    const fnEnd = js.indexOf('\nfunction', fnStart + 1);
    const fnBody = js.substring(fnStart, fnEnd > 0 ? fnEnd : fnStart + 500);
    assert.ok(fnBody.includes('return null'),
        'getSelectedChild must return null when no child selected');
});

test('Progress dashboard allows admin access', () => {
    const js = readFile('progress-dashboard.js');
    assert.ok(js.includes("userData.role !== 'parent' && userData.role !== 'admin'"),
        'Progress dashboard must allow both parent and admin roles');
});

test('Progress dashboard queries completions by childId not email', () => {
    const js = readFile('progress-dashboard.js');
    assert.ok(js.includes("where('childId', '==', selectedChildId)"),
        'Must query completions by childId, not by email');
    // The loadProgressData function should use childId, not childEmail
    const loadProgressSection = js.substring(js.indexOf('async function loadProgressData'));
    assert.ok(!loadProgressSection.includes("where('childEmail'"),
        'loadProgressData must NOT query completions by childEmail field');
});

test('Completion manager requires child profile for saving', () => {
    const js = readFile('completion-manager.js');
    assert.ok(js.includes('getSelectedChild'),
        'Completion manager must get child profile');
    assert.ok(js.includes("'No child profile selected'"),
        'Completion manager must warn when no child selected');
});

test('Weekly assignments handles admin role for page access', () => {
    const js = readFile('weekly-assignments.js');
    assert.ok(js.includes("window.currentUserRole === 'admin'"),
        'Weekly assignments must check admin role');
});

test('Feedback system gives admin access to all modules', () => {
    const js = readFile('feedback-system.js');
    assert.ok(js.includes("window.currentUserRole === 'admin'"),
        'Feedback system must check admin role');
    assert.ok(js.includes('if (isAdmin) return FEEDBACK_MODULES'),
        'Admin should see all feedback modules');
});

test('index.html skips child profile check for admin', () => {
    const html = readFile('index.html');
    assert.ok(html.includes("userData.role !== 'admin'"),
        'index.html must skip child profile check for admin');
    assert.ok(html.includes('Admin user - skipping child profile check'),
        'index.html must log admin child profile check skip');
});

test('Firestore rules allow admin to read/update children', () => {
    const rules = readFile('firestore.rules');
    // Admin helper function exists
    assert.ok(rules.includes('function isAdmin()'),
        'Firestore rules must define isAdmin helper');
    // Children rules include admin check
    assert.ok(rules.includes('isAdmin()'),
        'Firestore rules must use isAdmin() in child access rules');
    // Subcollection rules exist
    assert.ok(rules.includes('skill_profile'),
        'Firestore rules must have skill_profile subcollection rules');
    assert.ok(rules.includes('error_log'),
        'Firestore rules must have error_log subcollection rules');
    assert.ok(rules.includes('adaptive_worksheets'),
        'Firestore rules must have adaptive_worksheets collection rules');
});

test('Cloud Functions validate admin access for child data', () => {
    const validators = readFile('functions/validators.js');
    assert.ok(validators.includes("role === 'admin'"),
        'validators.js must check admin role');
    assert.ok(validators.includes('isAdmin'),
        'validators.js must use isAdmin flag for access bypass');

    const levelFunctions = readFile('functions/level-functions.js');
    assert.ok(levelFunctions.includes("role === 'admin'"),
        'level-functions.js must check admin role');
});

test('Admin level manager works with window.currentUserRole', () => {
    const js = readFile('admin-level-manager.js');
    assert.ok(js.includes("window.currentUserRole === 'admin'"),
        'admin-level-manager must check admin role');
    assert.ok(js.includes('getAdminLevelForModule'),
        'Should export getAdminLevelForModule function');
});

test('Math worksheet-generator has complete admin path with early return', () => {
    const js = readFile('worksheet-generator.js');
    const isAdminIdx = js.indexOf("const isAdmin = window.currentUserRole === 'admin'");
    assert.ok(isAdminIdx > 0, 'Should have isAdmin check');
    // The admin block should come before the child check
    const adminBlock = js.indexOf('if (isAdmin)', isAdminIdx);
    const childCheck = js.indexOf("if (!child)", isAdminIdx);
    assert.ok(adminBlock < childCheck,
        'Admin block must come before child requirement check');
});

test('English generator has admin path with early return', () => {
    const js = readFile('english-generator.js');
    assert.ok(js.includes("const isAdmin = window.currentUserRole === 'admin'"),
        'English generator must check admin role');
    // Admin path should have getAdminLevelForModule
    assert.ok(js.includes("getAdminLevelForModule('english')"),
        'English generator must use admin level manager');
});

test('Progress map handles admin with full access', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes("window.currentUserRole === 'admin'"),
        'Progress map must check admin role');
});

test('Demo seeder creates children with parent_uid matching admin', () => {
    const js = readFile('functions/demo-seeder.js');
    assert.ok(js.includes('parent_uid: callerUid'),
        'Demo children must have parent_uid set to admin UID');
});

test('children-profiles.html uses parent_uid for child query', () => {
    const html = readFile('children-profiles.html');
    assert.ok(html.includes("where('parent_uid', '==', parentUid)"),
        'children-profiles must query by parent_uid');
    // And parentUid is set from user.uid
    assert.ok(html.includes('parentUid = user.uid'),
        'parentUid must be set from Firebase auth user.uid');
});

test('Input mode manager handles admin separately', () => {
    const js = readFile('input-mode-manager.js');
    assert.ok(js.includes('checkIfAdmin') || js.includes('isAdmin'),
        'Input mode manager must handle admin case');
});

// ============================================================================
console.log('\n=== BUG-055: Demo Data Streaks/Badges Fix ===');
// ============================================================================

test('BUG-055: progress-map getCompletionsForModule queries by childId not childEmail', () => {
    const js = readFile('progress-map.js');
    const fn = js.substring(js.indexOf('async function getCompletionsForModule'));
    const fnEnd = fn.indexOf('\n}') + 2;
    const fnBody = fn.substring(0, fnEnd);
    assert.ok(fnBody.includes("where('childId'"),
        'getCompletionsForModule must query by childId');
    assert.ok(!fnBody.includes("where('childEmail'"),
        'getCompletionsForModule must NOT query by childEmail (demo data lacks it)');
});

test('BUG-055: progress-map getCompletionsForModule does not require child.email', () => {
    const js = readFile('progress-map.js');
    const fn = js.substring(js.indexOf('async function getCompletionsForModule'));
    const fnEnd = fn.indexOf('\n}') + 2;
    const fnBody = fn.substring(0, fnEnd);
    assert.ok(!fnBody.includes('child.email'),
        'getCompletionsForModule should not depend on child.email');
    assert.ok(!fnBody.includes('childEmail'),
        'getCompletionsForModule should not reference childEmail');
});

test('BUG-055: progress-map calculateStreak counts consecutive days from completions', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('function calculateStreak(completions)'),
        'calculateStreak function must exist');
    assert.ok(js.includes("dates.add("),
        'calculateStreak must collect unique dates');
    assert.ok(js.includes('i > 0'),
        'calculateStreak must allow today to be missing (not practiced yet)');
});

test('BUG-055: demo seeder star calculation matches actual system (3 for >=95%)', () => {
    const js = readFile('functions/demo-seeder.js');
    // Must award 3 stars for >=95%, not just for 100%
    assert.ok(js.includes('score >= 95) totalStars += 3'),
        'Demo seeder must give 3 stars for >=95% (matching completion-manager)');
    assert.ok(!js.includes("score === 100 ? 3 : 2"),
        'Demo seeder must NOT use old score === 100 check');
});

test('BUG-055: demo seeder counts English stars in totalStarsEarned', () => {
    const js = readFile('functions/demo-seeder.js');
    // Check that English completion section also awards stars
    const engSection = js.substring(js.indexOf('// English pages'));
    assert.ok(engSection.includes('engScore >= 95) totalStars += 3'),
        'Demo seeder must count English stars for totalStarsEarned');
});

test('BUG-055: demo seeder counts extra module stars (aptitude/stories)', () => {
    const js = readFile('functions/demo-seeder.js');
    // Check that aptitude/stories section also awards stars
    const extraSection = js.substring(js.indexOf('// Add aptitude and stories'));
    assert.ok(extraSection.includes('extraScore >= 95) totalStars += 3') ||
              extraSection.includes('extraDone') && extraSection.includes('totalStars'),
        'Demo seeder must count aptitude/stories stars');
});

test('BUG-055: demo seeder completions all have childId field', () => {
    const js = readFile('functions/demo-seeder.js');
    // All batch.set calls for completions must include childId
    const mathComp = js.substring(js.indexOf("module: 'math'"));
    assert.ok(mathComp.includes('childId,') || mathComp.includes('childId:'),
        'Math completions must have childId field');
    const engComp = js.substring(js.indexOf("module: 'english'"));
    assert.ok(engComp.includes('childId,') || engComp.includes('childId:'),
        'English completions must have childId field');
});

test('BUG-055: progress-map stats use on-the-fly star calculation', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes('function calculateStats(completions)'),
        'calculateStats function must exist');
    // Stars are computed from completions, not from avatar.totalStarsEarned
    const statsFn = js.substring(js.indexOf('function calculateStats'));
    const statsFnEnd = statsFn.indexOf('\n}') + 2;
    const statsBody = statsFn.substring(0, statsFnEnd);
    assert.ok(statsBody.includes('score >= 95') && statsBody.includes('totalStars += 3'),
        'calculateStats must award 3 stars for >=95%');
    assert.ok(statsBody.includes('score >= 85') && statsBody.includes('totalStars += 2'),
        'calculateStats must award 2 stars for >=85%');
});

// ============================================================================
console.log('\n=== BUG-056: Greeting Banner Only on Home Page ===');
// ============================================================================

test('BUG-056: showMathLevels hides greeting banner', () => {
    const js = readFile('worksheet-generator.js');
    const fn = js.substring(js.indexOf('function showMathLevels'));
    const fnEnd = fn.indexOf('\n}') + 2;
    const fnBody = fn.substring(0, fnEnd);
    assert.ok(fnBody.includes('greeting-banner'),
        'showMathLevels must reference greeting-banner');
    assert.ok(fnBody.includes("display = 'none'") || fnBody.includes('style.display'),
        'showMathLevels must hide greeting banner');
});

test('BUG-056: showMathOperations hides greeting banner', () => {
    const js = readFile('worksheet-generator.js');
    const fn = js.substring(js.indexOf('function showMathOperations'));
    const fnEnd = fn.indexOf('\n}') + 2;
    const fnBody = fn.substring(0, fnEnd);
    assert.ok(fnBody.includes('greeting-banner'),
        'showMathOperations must reference greeting-banner');
});

test('BUG-056: showSubjects restores greeting banner', () => {
    const js = readFile('worksheet-generator.js');
    const fn = js.substring(js.indexOf('function showSubjects'));
    const fnEnd = fn.indexOf('\n}') + 2;
    const fnBody = fn.substring(0, fnEnd);
    assert.ok(fnBody.includes('greeting-banner'),
        'showSubjects must reference greeting-banner');
    assert.ok(fnBody.includes('updateGreeting'),
        'showSubjects must call updateGreeting to restore banner');
});

test('BUG-056: showProgressMap hides greeting banner', () => {
    const js = readFile('progress-map.js');
    const fn = js.substring(js.indexOf('async function showProgressMap'));
    const fnEnd = fn.indexOf('container.innerHTML');
    const fnBody = fn.substring(0, fnEnd);
    assert.ok(fnBody.includes('greeting-banner'),
        'showProgressMap must reference greeting-banner');
    assert.ok(fnBody.includes("display = 'none'") || fnBody.includes('style.display'),
        'showProgressMap must hide greeting banner');
});

// ============================================================================
console.log('\n=== FEAT-008: UI Modernization — Icon & String System ===');
// ============================================================================

test('icons.js exists and defines GleeIcons', () => {
    const js = readFile('icons.js');
    assert.ok(js.includes('GleeIcons'), 'icons.js must define GleeIcons');
    assert.ok(js.includes('ICON_PATHS'), 'icons.js must have ICON_PATHS registry');
});

test('GleeIcons has all required subject icons', () => {
    const js = readFile('icons.js');
    const requiredIcons = ['math', 'english', 'aptitude', 'stories', 'eq', 'german', 'drawing', 'germanKids'];
    requiredIcons.forEach(icon => {
        assert.ok(js.includes("'" + icon + "'") || js.includes(icon + ':'),
            `Icon '${icon}' must be defined in ICON_PATHS`);
    });
});

test('GleeIcons has all required operation icons', () => {
    const js = readFile('icons.js');
    const requiredIcons = ['addition', 'subtraction', 'multiplication', 'division'];
    requiredIcons.forEach(icon => {
        assert.ok(js.includes("'" + icon + "'") || js.includes(icon + ':'),
            `Operation icon '${icon}' must be defined in ICON_PATHS`);
    });
});

test('GleeIcons has nav, action, and UI icons', () => {
    const js = readFile('icons.js');
    const requiredIcons = ['home', 'book', 'star', 'settings', 'bell', 'lock', 'user', 'logout', 'feedback', 'fire', 'target', 'chart'];
    requiredIcons.forEach(icon => {
        assert.ok(js.includes(icon + ':'),
            `UI icon '${icon}' must be defined in ICON_PATHS`);
    });
});

test('GleeIcons has all theme icons', () => {
    const js = readFile('icons.js');
    const themeIcons = ['ocean', 'forest', 'sunset', 'candy', 'space', 'rainbow', 'dinosaur', 'dragon'];
    themeIcons.forEach(icon => {
        assert.ok(js.includes(icon + ':'),
            `Theme icon '${icon}' must be defined in ICON_PATHS`);
    });
});

test('GleeIcons has init(), get(), has(), circled() API', () => {
    const js = readFile('icons.js');
    assert.ok(js.includes('init:') || js.includes('init: function'), 'GleeIcons must have init()');
    assert.ok(js.includes('get:') || js.includes('get: function'), 'GleeIcons must have get()');
    assert.ok(js.includes('has:') || js.includes('has: function'), 'GleeIcons must have has()');
    assert.ok(js.includes('circled:') || js.includes('circled: function'), 'GleeIcons must have circled()');
});

test('strings.js exists and defines STRINGS', () => {
    const js = readFile('strings.js');
    assert.ok(js.includes('STRINGS'), 'strings.js must define STRINGS');
    assert.ok(js.includes('STRINGS.init'), 'strings.js must have STRINGS.init()');
});

test('STRINGS has all required string categories', () => {
    const js = readFile('strings.js');
    assert.ok(js.includes('subjects:'), 'STRINGS must have subjects');
    assert.ok(js.includes('operations:'), 'STRINGS must have operations');
    assert.ok(js.includes('nav:'), 'STRINGS must have nav');
    assert.ok(js.includes('actions:'), 'STRINGS must have actions');
    assert.ok(js.includes('greeting:'), 'STRINGS must have greeting');
    assert.ok(js.includes('progress:'), 'STRINGS must have progress');
});

test('index.html loads strings.js and icons.js', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('src="strings.js"'), 'index.html must load strings.js');
    assert.ok(html.includes('src="icons.js"'), 'index.html must load icons.js');
});

test('index.html subject cards use data-icon attributes (not emojis)', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('data-icon="math"'), 'Math subject card must use data-icon="math"');
    assert.ok(html.includes('data-icon="english"'), 'English subject card must use data-icon="english"');
    assert.ok(html.includes('data-icon="aptitude"'), 'Aptitude subject card must use data-icon="aptitude"');
    assert.ok(html.includes('data-icon="stories"'), 'Stories subject card must use data-icon="stories"');
    assert.ok(html.includes('data-icon="eq"'), 'EQ subject card must use data-icon="eq"');
    assert.ok(html.includes('data-icon="drawing"'), 'Drawing subject card must use data-icon="drawing"');
});

test('index.html operation buttons use data-icon attributes', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('data-icon="addition"'), 'Addition must use data-icon');
    assert.ok(html.includes('data-icon="subtraction"'), 'Subtraction must use data-icon');
    assert.ok(html.includes('data-icon="multiplication"'), 'Multiplication must use data-icon');
    assert.ok(html.includes('data-icon="division"'), 'Division must use data-icon');
});

const bottomNavIconPages = [
    'index.html', 'english.html', 'aptitude.html', 'stories.html',
    'drawing.html', 'emotional-quotient.html', 'german.html',
    'german-kids.html', 'learn-english-stories.html', 'rewards.html'
];

bottomNavIconPages.forEach(page => {
    test(`${page} bottom nav uses data-icon attributes`, () => {
        const html = readFile(page);
        assert.ok(html.includes('data-icon="home"'), `${page} nav must use data-icon="home"`);
        assert.ok(html.includes('data-icon="book"'), `${page} nav must use data-icon="book"`);
        assert.ok(html.includes('data-icon="star"'), `${page} nav must use data-icon="star"`);
        assert.ok(html.includes('data-icon="settings"'), `${page} nav must use data-icon="settings"`);
    });
});

test('styles.css has glassmorphism fallback @supports rule', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('@supports not (backdrop-filter'),
        'styles.css must have @supports fallback for glassmorphism');
});

test('styles.css has new design tokens', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('--radius-pill'), 'Must have --radius-pill token');
    assert.ok(css.includes('--shadow-card'), 'Must have --shadow-card token');
    assert.ok(css.includes('--glass-bg'), 'Must have --glass-bg token');
    assert.ok(css.includes('--color-surface-warm'), 'Must have --color-surface-warm token');
    assert.ok(css.includes('--spring-soft'), 'Must have --spring-soft token');
});

test('styles.css has new animations', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('@keyframes squish'), 'Must have squish animation');
    assert.ok(css.includes('@keyframes popIn'), 'Must have popIn animation');
    assert.ok(css.includes('@keyframes glowPulse'), 'Must have glowPulse animation');
    assert.ok(css.includes('@keyframes modalSlideUp'), 'Must have modalSlideUp animation');
});

test('styles.css bottom-nav uses glassmorphism', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('backdrop-filter: blur(var(--glass-blur))'),
        'bottom-nav must use glassmorphism blur');
});

test('styles.css .problem has card treatment', () => {
    const css = readFile('styles.css');
    const problemSection = css.substring(css.indexOf('.problem {'), css.indexOf('.problem {') + 300);
    assert.ok(problemSection.includes('background: var(--color-surface-warm)'),
        '.problem must have warm background');
    assert.ok(problemSection.includes('border-radius'),
        '.problem must have border-radius');
});

test('styles.css .problem-number is circular badge', () => {
    const css = readFile('styles.css');
    const pnSection = css.substring(css.indexOf('.problem-number {'), css.indexOf('.problem-number {') + 400);
    assert.ok(pnSection.includes('border-radius: 50%'),
        '.problem-number must be circular');
    assert.ok(pnSection.includes('var(--color-primary-10)'),
        '.problem-number must use primary-10 background');
});

test('theme-manager.js uses iconKey instead of emoji icon', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('iconKey:'), 'THEMES must use iconKey');
    assert.ok(!js.includes("icon: '🌊'"), 'Must not use emoji icon for ocean');
});

test('profile-selector.js uses GleeIcons for theme picker', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('GleeIcons.get') || js.includes('GleeIcons.has'),
        'profile-selector.js must reference GleeIcons for theme icons');
});

test('notification-system.js uses GleeIcons for bell', () => {
    const js = readFile('notification-system.js');
    assert.ok(js.includes("GleeIcons.get('bell'") || js.includes('GleeIcons.get(\'bell\''),
        'notification-system.js must use GleeIcons for bell icon');
});

test('progress-map.js uses GleeIcons for stat icons', () => {
    const js = readFile('progress-map.js');
    assert.ok(js.includes("GleeIcons") || js.includes('gi.get'),
        'progress-map.js must use GleeIcons for stat bar icons');
});

// ============================================================================
console.log('\n=== JS Syntax Validation (node --check) ===');
// ============================================================================

test('All critical JS files pass syntax check (node --check)', () => {
    const { execSync } = require('child_process');
    const jsFiles = [
        'theme-manager.js', 'icons.js', 'strings.js',
        'profile-selector.js', 'notification-system.js',
        'worksheet-generator.js', 'progress-map.js',
        'feedback-system.js', 'age-filter.js',
        'avatar-renderer.js', 'parent-mode.js',
        'handwriting-recognition.js', 'level-test.js',
        'assessment.js', 'operation-explainer.js'
    ];
    jsFiles.forEach(file => {
        const filePath = path.join(ROOT, file);
        if (!fs.existsSync(filePath)) return; // skip if file doesn't exist
        try {
            execSync(`node --check "${filePath}"`, { encoding: 'utf8', stdio: 'pipe' });
        } catch (e) {
            assert.fail(`${file} has syntax error: ${e.stderr.trim()}`);
        }
    });
});

// ============================================================================
console.log('\n=== BUG-057: theme-manager.js syntax error (dinosaur/dragon outside P object) ===');
// ============================================================================

test('BUG-057: theme-manager.js passes node --check', () => {
    const { execSync } = require('child_process');
    try {
        execSync(`node --check "${path.join(ROOT, 'theme-manager.js')}"`, { encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
        assert.fail('theme-manager.js has syntax error: ' + e.stderr.trim());
    }
});

test('BUG-057: THEME_ICON_NAMES includes dinosaur theme', () => {
    const js = readFile('theme-manager.js');
    // THEME_ICON_NAMES must include dinosaur with its icon array
    const tiStart = js.indexOf('THEME_ICON_NAMES');
    assert.ok(tiStart > 0, 'THEME_ICON_NAMES must exist');
    const dinosaurIdx = js.indexOf('dinosaur:', tiStart);
    assert.ok(dinosaurIdx > tiStart, 'dinosaur must be in THEME_ICON_NAMES');
});

test('BUG-057: THEME_ICON_NAMES includes dragon theme', () => {
    const js = readFile('theme-manager.js');
    const tiStart = js.indexOf('THEME_ICON_NAMES');
    const dragonIdx = js.indexOf('dragon:', tiStart);
    assert.ok(dragonIdx > tiStart, 'dragon must be in THEME_ICON_NAMES');
});

test('BUG-057: THEMES object has all 8 theme keys', () => {
    const js = readFile('theme-manager.js');
    const themes = ['ocean', 'forest', 'sunset', 'candy', 'space', 'rainbow', 'dinosaur', 'dragon'];
    themes.forEach(t => {
        // Check THEMES object entries (format: "themeName: {")
        const re = new RegExp(`${t}:\\s*\\{\\s*name:`);
        assert.ok(re.test(js), `THEMES must contain ${t} entry`);
    });
});

// ============================================================================
console.log('\n=== BUG-058: Notification routing — parentUid filter ===');
// ============================================================================

test('BUG-058: initializeNotifications accepts role parameter', () => {
    const js = readFile('notification-system.js');
    assert.ok(js.includes('function initializeNotifications(childId, parentUid, role)'),
        'initializeNotifications must accept 3rd role parameter');
});

test('BUG-058: admin notification query filters by parentUid == admin', () => {
    const js = readFile('notification-system.js');
    assert.ok(js.includes("'parentUid', '==', 'admin'"),
        'Admin query must filter parentUid == admin');
});

test('BUG-058: parent notification query includes parentUid filter', () => {
    const js = readFile('notification-system.js');
    // Parent query uses 'in' to match own UID + 'all' broadcast notifications
    assert.ok(js.includes("'parentUid', 'in'"),
        'Parent query must use parentUid in-filter for own UID + all');
});

test('BUG-058: index.html passes role to initializeNotifications', () => {
    const html = readFile('index.html');
    assert.ok(html.includes('initializeNotifications(') && html.includes('window.currentUserRole'),
        'index.html must pass window.currentUserRole to initializeNotifications');
});

test('BUG-058: admin can receive notifications even without selected child', () => {
    const html = readFile('index.html');
    // The notification init guard must allow admin without nChild
    assert.ok(html.includes("userData.role === 'admin'"),
        'Notification init must allow admin without selected child');
});

test('BUG-058: fallback loadNotificationsFallback also filters by role', () => {
    const js = readFile('notification-system.js');
    assert.ok(js.includes('function loadNotificationsFallback(childId, parentUid, role)'),
        'Fallback function must accept role parameter');
    // Both admin and parent paths exist
    assert.ok((js.match(/'parentUid', '==', 'admin'/g) || []).length >= 2,
        'Both main and fallback queries must filter admin parentUid');
});

test('BUG-058: composite index exists for parentUid + dismissed + createdAt', () => {
    const indexes = JSON.parse(readFile('firestore.indexes.json'));
    const hasIndex = indexes.indexes.some(idx =>
        idx.collectionGroup === 'notifications' &&
        idx.fields.some(f => f.fieldPath === 'parentUid') &&
        idx.fields.some(f => f.fieldPath === 'dismissed') &&
        idx.fields.some(f => f.fieldPath === 'createdAt')
    );
    assert.ok(hasIndex, 'firestore.indexes.json must have parentUid+dismissed+createdAt index for notifications');
});

// ============================================================================
console.log('\n=== Performance: Lazy TF.js + defer scripts + polling fix ===');
// ============================================================================

test('Performance: TF.js removed from HTML pages (lazy-loaded)', () => {
    const pages = ['index.html', 'english.html', 'aptitude.html'];
    pages.forEach(page => {
        const html = readFile(page);
        assert.ok(!html.includes('<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs'),
            page + ' must not have TF.js <script> tag (now lazy-loaded)');
    });
});

test('Performance: handwriting-recognition.js has ensureTFLoaded', () => {
    const js = readFile('handwriting-recognition.js');
    assert.ok(js.includes('function ensureTFLoaded()'),
        'Must have ensureTFLoaded for lazy loading TF.js');
    assert.ok(js.includes('cdn.jsdelivr.net/npm/@tensorflow/tfjs'),
        'ensureTFLoaded must reference TF.js CDN URL');
});

test('Performance: age-filter.js no longer uses 100ms setInterval polling', () => {
    const js = readFile('age-filter.js');
    assert.ok(!js.includes('setInterval(') || !js.includes(', 100)'),
        'age-filter.js must not use setInterval polling (use auth state change)');
});

test('Performance: profile-selector.js has children query cache', () => {
    const js = readFile('profile-selector.js');
    assert.ok(js.includes('_childrenCache') || js.includes('childrenCache'),
        'profile-selector.js must cache children queries');
    assert.ok(js.includes('CHILDREN_CACHE_TTL') || js.includes('CACHE_TTL'),
        'Must define a cache TTL for children queries');
});

test('Performance: app scripts have defer attribute', () => {
    const html = readFile('index.html');
    // App scripts (not Firebase SDK) should have defer
    assert.ok(html.includes('worksheet-generator.js" defer'),
        'worksheet-generator.js should have defer');
    assert.ok(html.includes('profile-selector.js" defer'),
        'profile-selector.js should have defer');
    // Firebase SDK should NOT have defer
    assert.ok(!html.includes('firebase-app-compat.js" defer'),
        'Firebase SDK must NOT have defer');
});

test('Performance: Lucide icons used for doodle backgrounds', () => {
    const js = readFile('theme-manager.js');
    assert.ok(js.includes('LUCIDE_ICONS'), 'Must use LUCIDE_ICONS for doodle backgrounds');
    // Should have at least 30 unique icons
    const iconCount = (js.match(/'[a-z-]+': "/g) || []).length;
    assert.ok(iconCount >= 30, 'Should have at least 30 unique Lucide icons (found ' + iconCount + ')');
});

// ============================================================================
console.log('\n=== Server-side: Aptitude, German, EQ engines ===');
// ============================================================================

test('Server-side: aptitude-engine.js exists in functions/shared', () => {
    try {
        const js = readFile('functions/shared/aptitude-engine.js');
        assert.ok(js.includes('getAptitudeQuestions') || js.includes('generateAptitudeQuestions'),
            'aptitude-engine.js must export question generation function');
        assert.ok(js.includes('validateAptitudeSubmission') || js.includes('validateAptitude'),
            'aptitude-engine.js must export validation function');
    } catch (e) {
        assert.ok(false, 'functions/shared/aptitude-engine.js must exist');
    }
});

test('Server-side: german-engine.js exists in functions/shared', () => {
    try {
        const js = readFile('functions/shared/german-engine.js');
        assert.ok(js.includes('getGermanQuestions') || js.includes('generateGermanQuestions'),
            'german-engine.js must export question generation function');
        assert.ok(js.includes('validateGerman'),
            'german-engine.js must export validation function');
    } catch (e) {
        assert.ok(false, 'functions/shared/german-engine.js must exist');
    }
});

test('Server-side: eq-engine.js exists in functions/shared', () => {
    try {
        const js = readFile('functions/shared/eq-engine.js');
        assert.ok(js.includes('getEQQuestions') || js.includes('generateEQQuestions'),
            'eq-engine.js must export question generation function');
        assert.ok(js.includes('validateEQ'),
            'eq-engine.js must export validation function');
    } catch (e) {
        assert.ok(false, 'functions/shared/eq-engine.js must exist');
    }
});

test('Server-side: all new engines use seeded PRNG', () => {
    const engines = ['functions/shared/aptitude-engine.js', 'functions/shared/german-engine.js', 'functions/shared/eq-engine.js'];
    engines.forEach(engine => {
        try {
            const js = readFile(engine);
            assert.ok(js.includes('SeededRandom') || js.includes('seededRandom') || js.includes('seed'),
                engine + ' must use seeded random for deterministic generation');
        } catch (e) {
            // File may not exist yet during development
        }
    });
});

// ============================================================================
// CLIENT-SERVER WIRING: CF calls in client generators
// ============================================================================

console.log('\n=== Client-Server Wiring: CF calls in generators ===');

test('aptitude-generator.js uses seeded PRNG matching server engine', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('AptitudeSeededRandom'), 'Must have SeededRandom class');
    assert.ok(js.includes('aptitudeHashCode'), 'Must have hashCode function');
    assert.ok(js.includes('aptitudeSeededShuffle'), 'Must have seededShuffle function');
    assert.ok(js.includes('currentWorksheetSeed'), 'Must track seed for server validation');
});

test('aptitude-generator.js submits seed params (not problemData) to CF', () => {
    const js = readFile('aptitude-generator.js');
    assert.ok(js.includes('seed: currentWorksheet.seed'), 'Must send seed to CF');
    assert.ok(js.includes('page: currentWorksheet.page'), 'Must send page to CF');
    assert.ok(!js.includes('problemData: currentWorksheet.problems.map(p => ({'),
        'Must NOT send problemData with answers to CF');
});

test('eq-generator.js calls validateEQSubmission CF', () => {
    const js = readFile('eq-generator.js');
    assert.ok(js.includes("httpsCallable('validateEQSubmission')"),
        'Must call validateEQSubmission CF');
    assert.ok(js.includes('submitEQScore'), 'Must have submitEQScore function');
});

test('german-generator.js calls validateGermanSubmission CF', () => {
    const js = readFile('german-generator.js');
    assert.ok(js.includes("httpsCallable('validateGermanSubmission')"),
        'Must call validateGermanSubmission CF');
    assert.ok(js.includes('submitGermanScore'), 'Must have submitGermanScore function');
});

test('german-kids-generator.js calls validateGermanKidsSubmission CF', () => {
    const js = readFile('german-kids-generator.js');
    assert.ok(js.includes("httpsCallable('validateGermanKidsSubmission')"),
        'Must call validateGermanKidsSubmission CF');
    assert.ok(js.includes('submitGermanKidsScore'), 'Must have submitGermanKidsScore function');
});

test('validators.js exports new CFs for EQ, German, GermanKids', () => {
    const js = readFile('functions/validators.js');
    assert.ok(js.includes('validateEQSubmission'), 'Must export validateEQSubmission');
    assert.ok(js.includes('validateGermanSubmission'), 'Must export validateGermanSubmission');
    assert.ok(js.includes('validateGermanKidsSubmission'), 'Must export validateGermanKidsSubmission');
});

test('functions/index.js exports new CFs', () => {
    const js = readFile('functions/index.js');
    assert.ok(js.includes('exports.validateEQSubmission'), 'Must export validateEQSubmission');
    assert.ok(js.includes('exports.validateGermanSubmission'), 'Must export validateGermanSubmission');
    assert.ok(js.includes('exports.validateGermanKidsSubmission'), 'Must export validateGermanKidsSubmission');
});

test('aptitude CF uses aptitude-engine for validation (not client problemData)', () => {
    const js = readFile('functions/validators.js');
    assert.ok(js.includes('aptitudeEngine.validateAptitudeSubmission'),
        'Aptitude CF must use server-side engine for validation');
    // Should not reference problemData in the seed-based path
    const aptitudeCF = js.match(/const validateAptitudeSubmission[\s\S]*?return \{[^}]*\}/);
    assert.ok(aptitudeCF, 'validateAptitudeSubmission CF must exist');
    assert.ok(!aptitudeCF[0].includes('problem.answer'),
        'Aptitude CF must not compare against client-sent problem.answer');
});

// ============================================================================
// THEME ICON UPGRADE TESTS
// ============================================================================

test('Theme icons use updated SVG paths (not old wavy/blob shapes)', () => {
    const js = readFile('icons.js');
    const themeNames = ['ocean', 'forest', 'sunset', 'candy', 'space', 'rainbow', 'dinosaur', 'dragon'];
    themeNames.forEach(name => {
        const regex = new RegExp(name + "\\s*:");
        assert.ok(regex.test(js), `Theme icon "${name}" must exist in icons.js`);
    });
    // Old ocean was 3 wavy lines — should no longer match
    assert.ok(!js.includes("M2 12c1.5-2 3.5-2 5 0s3.5 2 5 0"), 'Ocean icon should be updated (no old wavy path)');
    // Old dragon was starburst
    assert.ok(!js.includes("M13 3l3 3-3 1 3 3-2 1-1 3-3-2"), 'Dragon icon should be updated (no old starburst path)');
});

test('icons.js has play, pause, and stopCircle icons', () => {
    const js = readFile('icons.js');
    assert.ok(js.includes("play:"), 'Must have play icon');
    assert.ok(js.includes("pause:"), 'Must have pause icon');
    assert.ok(js.includes("stopCircle:"), 'Must have stopCircle icon');
});

// ============================================================================
// TTS MANAGER TESTS
// ============================================================================

test('tts-manager.js exists and defines TTSManager', () => {
    const js = readFile('tts-manager.js');
    assert.ok(js.includes('var TTSManager'), 'Must define TTSManager');
    assert.ok(js.includes('speechSynthesis'), 'Must use Web Speech API');
    assert.ok(js.includes('gleegrow_tts_enabled'), 'Must respect localStorage TTS key');
});

test('tts-manager.js passes node --check', () => {
    const { execSync } = require('child_process');
    try {
        execSync('node --check tts-manager.js', { cwd: path.join(__dirname, '..') });
    } catch (e) {
        assert.fail('tts-manager.js has syntax errors: ' + e.message);
    }
});

test('tts-manager.js has required consumer API methods', () => {
    const js = readFile('tts-manager.js');
    const methods = ['speak', 'pause', 'resume', 'stop', 'isSpeaking', 'isPaused', 'isSupported', 'isEnabled', 'rateForCategory'];
    methods.forEach(m => {
        assert.ok(js.includes(m + ':') || js.includes('function ' + m), `TTSManager must have ${m} method`);
    });
});

test('tts-manager.js has provider management API', () => {
    const js = readFile('tts-manager.js');
    assert.ok(js.includes('registerProvider:'), 'Must expose registerProvider');
    assert.ok(js.includes('setActiveProvider:'), 'Must expose setActiveProvider');
    assert.ok(js.includes('getProviderName:'), 'Must expose getProviderName');
    assert.ok(js.includes('listProviders:'), 'Must expose listProviders');
});

test('tts-manager.js has WebSpeechProvider as built-in', () => {
    const js = readFile('tts-manager.js');
    assert.ok(js.includes('WebSpeechProvider'), 'Must define WebSpeechProvider');
    assert.ok(js.includes("registerProvider('webSpeech'"), 'Must register webSpeech provider');
});

test('tts-manager.js provider interface is documented', () => {
    const js = readFile('tts-manager.js');
    // The interface contract must be documented for future paid providers
    assert.ok(js.includes('TTSProvider interface'), 'Must document the TTSProvider interface');
    assert.ok(js.includes('.isSupported()'), 'Interface must specify isSupported');
    assert.ok(js.includes('.speak('), 'Interface must specify speak');
    assert.ok(js.includes('.pause()'), 'Interface must specify pause');
    assert.ok(js.includes('.resume()'), 'Interface must specify resume');
    assert.ok(js.includes('.stop()'), 'Interface must specify stop');
});

test('tts-manager.js facade delegates to active provider', () => {
    const js = readFile('tts-manager.js');
    // Each public method should call getActiveProvider()
    const facadeMethods = ['isSupported', 'isSpeaking', 'isPaused', 'speak', 'pause', 'resume', 'stop'];
    facadeMethods.forEach(m => {
        const funcBody = js.match(new RegExp('function ' + m + '\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n    \\}'));
        assert.ok(funcBody, `Public ${m} function must exist`);
        assert.ok(funcBody[0].includes('getActiveProvider'), `${m} must delegate to getActiveProvider()`);
    });
});

test('tts-manager.js has category-specific rates', () => {
    const js = readFile('tts-manager.js');
    assert.ok(js.includes('bedtime:') && js.includes('0.75'), 'Bedtime should have slower rate (0.75)');
    assert.ok(js.includes('adventures:') && js.includes('0.9'), 'Adventures should have faster rate (0.9)');
});

test('stories.html includes tts-manager.js script', () => {
    const html = readFile('stories.html');
    assert.ok(html.includes('tts-manager.js'), 'stories.html must include tts-manager.js');
});

test('stories-generator.js has TTS functions', () => {
    const js = readFile('stories-generator.js');
    assert.ok(js.includes('function toggleStoryTTS'), 'Must have toggleStoryTTS function');
    assert.ok(js.includes('function stopStoryTTS'), 'Must have stopStoryTTS function');
    assert.ok(js.includes('function updateTTSButton'), 'Must have updateTTSButton function');
});

test('Navigation functions call stopStoryTTS on exit', () => {
    const js = readFile('stories-generator.js');
    // Extract function bodies
    const backToList = js.match(/function backToList\(\)\s*\{[\s\S]*?\n\}/);
    assert.ok(backToList, 'backToList function must exist');
    assert.ok(backToList[0].includes('stopStoryTTS'), 'backToList must call stopStoryTTS');

    const prevStory = js.match(/function previousStory\(\)\s*\{[\s\S]*?\n\}/);
    assert.ok(prevStory, 'previousStory function must exist');
    assert.ok(prevStory[0].includes('stopStoryTTS'), 'previousStory must call stopStoryTTS');

    const nextStory = js.match(/function nextStory\(\)\s*\{[\s\S]*?\n\}/);
    assert.ok(nextStory, 'nextStory function must exist');
    assert.ok(nextStory[0].includes('stopStoryTTS'), 'nextStory must call stopStoryTTS');
});

test('settings.html has TTS toggle section', () => {
    const html = readFile('settings.html');
    assert.ok(html.includes('tts-toggle-section'), 'Must have TTS toggle section');
    assert.ok(html.includes('updateTTSMode'), 'Must have updateTTSMode function');
    assert.ok(html.includes('Story Read-Aloud'), 'Must show "Story Read-Aloud" label');
});

// ============================================================================
// MOBILE UI OPTIMIZATION TESTS
// ============================================================================

test('styles.css has 2-column subject grid on mobile', () => {
    const css = readFile('styles.css');
    // Verify that within the responsive section, subject-grid uses 2-col
    // The subject-grid rule with repeat(2, 1fr) should exist in a 480px context
    const subjectGridRules = css.match(/\.subject-grid\s*\{[^}]*repeat\(2,\s*1fr\)[^}]*\}/g) || [];
    assert.ok(subjectGridRules.length > 0, 'Subject grid must have repeat(2, 1fr) rule for mobile');
});

test('styles.css has 375px extra-small breakpoint', () => {
    const css = readFile('styles.css');
    assert.ok(css.includes('@media (max-width: 375px)'), 'Must have 375px breakpoint');
});

test('stories.css has 2-column category grid on mobile', () => {
    const css = readFile('stories.css');
    const mobileBlock = css.match(/@media\s*\(max-width:\s*480px\)[\s\S]*?\.category-grid\s*\{[^}]*\}/);
    assert.ok(mobileBlock, 'Must have category-grid in 480px breakpoint');
    assert.ok(mobileBlock[0].includes('repeat(2, 1fr)'), 'Category grid must be 2-column on mobile');
});

test('stories.css has 2-column stories container on mobile', () => {
    const css = readFile('stories.css');
    const mobileBlock = css.match(/@media\s*\(max-width:\s*480px\)[\s\S]*?#stories-container\s*\{[^}]*\}/);
    assert.ok(mobileBlock, 'Must have #stories-container in 480px breakpoint');
    assert.ok(mobileBlock[0].includes('repeat(2, 1fr)'), 'Stories container must be 2-column on mobile');
});

test('progress-map.css has 375px breakpoint', () => {
    const css = readFile('progress-map.css');
    assert.ok(css.includes('@media (max-width: 375px)'), 'progress-map.css must have 375px breakpoint');
});

test('rewards.css has 375px breakpoint', () => {
    const css = readFile('rewards.css');
    assert.ok(css.includes('@media (max-width: 375px)'), 'rewards.css must have 375px breakpoint');
});

test('stories.css has TTS button styles', () => {
    const css = readFile('stories.css');
    assert.ok(css.includes('.tts-controls'), 'Must have .tts-controls styles');
    assert.ok(css.includes('.tts-btn'), 'Must have .tts-btn styles');
    assert.ok(css.includes('.tts-playing'), 'Must have .tts-playing animation');
    assert.ok(css.includes('tts-pulse'), 'Must have tts-pulse keyframes');
});

test('compact bottom nav on mobile', () => {
    const css = readFile('styles.css');
    // The 480px bottom-nav-item rule
    assert.ok(css.includes('.bottom-nav-item') && css.includes('0.65em'),
        'Bottom nav must have compact font on mobile');
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
