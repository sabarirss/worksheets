// GleeGrow String Constants — Centralized user-facing text for future i18n
// To add a new language: duplicate STRINGS object, translate values, swap at runtime

const STRINGS = {
    lang: 'en',

    subjects: {
        math: 'Mathematics',
        mathDesc: 'Addition, Subtraction, Multiplication, Division',
        english: 'English',
        englishDesc: 'Reading, Vocabulary, Grammar, Writing',
        aptitude: 'Aptitude',
        aptitudeDesc: 'Puzzles, Mazes, Patterns, Logic Games',
        stories: 'Story Time',
        storiesDesc: 'Quality Hand-Written Stories with Real Photos (Ages 4-12)',
        eq: 'Emotional Quotient',
        eqDesc: 'Understanding Feelings & Social Skills (Age 6)',
        german: 'German (B1)',
        germanDesc: 'DTZ Preparation - Grammar, Reading, Writing',
        drawing: 'Drawing',
        drawingDesc: 'Step-by-Step Art Tutorials with Canvas',
        germanKids: 'German Kids',
        germanKidsDesc: 'Simple Stories for Ages 6-8',
        learnEnglishStories: 'Learn English Stories',
        learnEnglishStoriesDesc: 'Learn English Through Stories',
    },

    operations: {
        addition: 'Addition',
        additionDesc: 'Basic addition skills',
        subtraction: 'Subtraction',
        subtractionDesc: 'Basic subtraction skills',
        multiplication: 'Multiplication',
        multiplicationDesc: 'Times tables and more',
        division: 'Division',
        divisionDesc: 'Division skills',
    },

    nav: {
        home: 'Home',
        stories: 'Stories',
        rewards: 'Rewards',
        settings: 'Settings',
    },

    actions: {
        submit: 'Submit',
        save: 'Save',
        cancel: 'Cancel',
        back: 'Back',
        logout: 'Logout',
        login: 'Login',
        signup: 'Sign Up',
        showAnswers: 'Show Answers',
        tryAgain: 'Try Again',
        giveFeedback: 'Give Feedback',
        adminPanel: 'Admin Panel',
        accountSettings: 'Account Settings',
        manageProfiles: 'Manage Profiles',
        addChild: 'Add Child Profile',
    },

    labels: {
        demoPreview: 'DEMO PREVIEW MODE',
        demoPreviewClick: 'DEMO PREVIEW MODE (Click to disable)',
        fullAccess: 'Full Access',
        adminFullAccess: 'Admin - Full Access',
        demoVersion: 'Demo Version (2 pages per activity)',
        parentMode: 'Parent Mode Verification',
    },

    greeting: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening',
        hello: 'Hello',
    },

    inputMode: {
        keyboard: 'Keyboard',
        pencil: 'Pencil (Handwriting)',
    },

    feedback: {
        correct: 'Correct!',
        incorrect: 'Try again!',
        empty: 'Empty',
        completed: 'Completed!',
        wellDone: 'Well Done!',
    },

    progress: {
        streak: 'Streak',
        stars: 'Stars',
        solved: 'Solved',
        accuracy: 'Accuracy',
    },

    notifications: {
        title: 'Notifications',
        markAllRead: 'Mark all read',
        empty: 'No notifications',
    },
};

// Auto-fill elements with data-string attributes
// Usage: <span data-string="subjects.math"></span>
STRINGS.init = function() {
    document.querySelectorAll('[data-string]').forEach(function(el) {
        var keys = el.dataset.string.split('.');
        var val = STRINGS;
        for (var i = 0; i < keys.length; i++) {
            val = val ? val[keys[i]] : undefined;
        }
        if (val) el.textContent = val;
    });
};

// Auto-init: fill data-string elements once DOM is ready.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { STRINGS.init(); });
} else {
    STRINGS.init();
}
