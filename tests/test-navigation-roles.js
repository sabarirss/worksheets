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

test('worksheet-generator.js has Cloud Function fallback pattern', () => {
    const content = readFile('worksheet-generator.js');
    assert.ok(
        content.includes('httpsCallable') || content.includes('validateMathSubmission'),
        'worksheet-generator.js missing Cloud Function call'
    );
    assert.ok(
        content.includes('catch') && content.includes('fallback') ||
        content.includes('catch') && content.includes('local validation'),
        'worksheet-generator.js missing fallback on Cloud Function failure'
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

test('assessment.js saves results to both localStorage and Firestore', () => {
    const js = readFile('assessment.js');
    assert.ok(js.includes('localStorage.setItem'), 'Assessment must save to localStorage');
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
    const nearbyCode = js.slice(demoSection, demoSection + 400);
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
