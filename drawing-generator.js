// Drawing Tutorial Generator with Interactive Step-by-Step Visual Guides

let currentDifficulty = '';
let currentTutorial = '';
let currentStep = 0;

// Drawing tutorials database with SVG visual steps
const drawingTutorials = {
    easy: {
        circle: {
            name: 'Draw a Circle',
            icon: '⭕',
            steps: [
                { text: 'Start at any point on your canvas', visual: 'circle-step1' },
                { text: 'Move your pencil in a curved line', visual: 'circle-step2' },
                { text: 'Keep going around in a smooth curve', visual: 'circle-step3' },
                { text: 'Connect back to your starting point', visual: 'circle-step4' },
                { text: 'Perfect! You drew a circle!', visual: 'circle-step5' }
            ]
        },
        sun: {
            name: 'Draw a Sun',
            icon: '☀️',
            steps: [
                { text: 'Draw a circle in the middle', visual: 'sun-step1' },
                { text: 'Draw 4 lines at top, bottom, left, and right', visual: 'sun-step2' },
                { text: 'Add 4 more lines in between (8 total rays)', visual: 'sun-step3' },
                { text: 'Make the rays all the same length', visual: 'sun-step4' },
                { text: 'Add a happy face! Your sun is done!', visual: 'sun-step5' }
            ]
        },
        house: {
            name: 'Draw a House',
            icon: '🏠',
            steps: [
                { text: 'Draw a large square for the house', visual: 'house-step1' },
                { text: 'Draw a triangle on top for the roof', visual: 'house-step2' },
                { text: 'Draw a rectangle for the door', visual: 'house-step3' },
                { text: 'Add two square windows on each side', visual: 'house-step4' },
                { text: 'Add a doorknob circle. Done!', visual: 'house-step5' }
            ]
        },
        tree: {
            name: 'Draw a Tree',
            icon: '🌳',
            steps: [
                { text: 'Draw two vertical lines for the trunk', visual: 'tree-step1' },
                { text: 'Connect the lines at the bottom', visual: 'tree-step2' },
                { text: 'Draw a fluffy cloud shape on top', visual: 'tree-step3' },
                { text: 'Make it round and full', visual: 'tree-step4' },
                { text: 'Add bark lines on the trunk. Beautiful!', visual: 'tree-step5' }
            ]
        },
        flower: {
            name: 'Draw a Flower',
            icon: '🌸',
            steps: [
                { text: 'Draw a small circle in the center', visual: 'flower-step1' },
                { text: 'Draw 5 oval petals around it', visual: 'flower-step2' },
                { text: 'Make petals point outward', visual: 'flower-step3' },
                { text: 'Draw a long stem line down', visual: 'flower-step4' },
                { text: 'Add two leaves on the stem. Pretty!', visual: 'flower-step5' }
            ]
        }
    },
    medium: {
        cat: {
            name: 'Draw a Cat',
            icon: '🐱',
            steps: [
                { text: 'Draw a circle for the head', visual: 'cat-step1' },
                { text: 'Add two triangle ears on top', visual: 'cat-step2' },
                { text: 'Draw an oval body below', visual: 'cat-step3' },
                { text: 'Add four legs', visual: 'cat-step4' },
                { text: 'Add eyes, nose, and whiskers', visual: 'cat-step5' },
                { text: 'Draw a curved tail. Meow!', visual: 'cat-step6' }
            ]
        },
        car: {
            name: 'Draw a Car',
            icon: '🚗',
            steps: [
                { text: 'Draw a long rectangle for the body', visual: 'car-step1' },
                { text: 'Add a smaller rectangle on top for windows', visual: 'car-step2' },
                { text: 'Round the corners', visual: 'car-step3' },
                { text: 'Draw two circles for wheels', visual: 'car-step4' },
                { text: 'Add hubcaps inside wheels', visual: 'car-step5' },
                { text: 'Add headlights. Vroom vroom!', visual: 'car-step6' }
            ]
        },
        butterfly: {
            name: 'Draw a Butterfly',
            icon: '🦋',
            steps: [
                { text: 'Draw a small oval for the body', visual: 'butterfly-step1' },
                { text: 'Add a circle on top for the head', visual: 'butterfly-step2' },
                { text: 'Draw two antennae', visual: 'butterfly-step3' },
                { text: 'Draw left wing shapes', visual: 'butterfly-step4' },
                { text: 'Draw matching right wings', visual: 'butterfly-step5' },
                { text: 'Add patterns inside. Beautiful!', visual: 'butterfly-step6' }
            ]
        }
    },
    hard: {
        dolphin: {
            name: 'Draw a Dolphin',
            icon: '🐬',
            steps: [
                { text: 'Draw a curved banana shape for the body', visual: 'dolphin-step1' },
                { text: 'Add a rounded nose (rostrum)', visual: 'dolphin-step2' },
                { text: 'Draw a curved dorsal fin on top', visual: 'dolphin-step3' },
                { text: 'Add a forked tail fin at the back', visual: 'dolphin-step4' },
                { text: 'Draw two side flippers', visual: 'dolphin-step5' },
                { text: 'Add eye and smile line', visual: 'dolphin-step6' },
                { text: 'Add shading and details. Splash!', visual: 'dolphin-step7' }
            ]
        },
        castle: {
            name: 'Draw a Castle',
            icon: '🏰',
            steps: [
                { text: 'Draw a large rectangle for the main building', visual: 'castle-step1' },
                { text: 'Add two tall tower rectangles on sides', visual: 'castle-step2' },
                { text: 'Draw triangular roofs on towers', visual: 'castle-step3' },
                { text: 'Add battlements (squares) on top', visual: 'castle-step4' },
                { text: 'Draw a drawbridge at the bottom', visual: 'castle-step5' },
                { text: 'Add windows throughout', visual: 'castle-step6' },
                { text: 'Add flags and details. Majestic!', visual: 'castle-step7' }
            ]
        }
    }
};

/**
 * SVG Drawing Functions - Generate visual guides for each step
 */
const visualGuides = {
    // CIRCLE
    'circle-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="3" fill="#667eea" />
            <text x="170" y="155" fill="#667eea" font-size="16" font-weight="bold">← Start here</text>
        </svg>
    `,
    'circle-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 150 100 A 50 50 0 0 1 200 150" stroke="#667eea" stroke-width="4" fill="none" stroke-linecap="round"/>
            <circle cx="150" cy="100" r="3" fill="#667eea" />
            <path d="M 195 145 L 205 150 L 195 155" fill="#667eea"/>
        </svg>
    `,
    'circle-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 150 100 A 50 50 0 1 1 100 150" stroke="#667eea" stroke-width="4" fill="none" stroke-linecap="round"/>
            <circle cx="150" cy="100" r="3" fill="#667eea" />
            <path d="M 95 150 L 90 140 L 100 145" fill="#667eea"/>
        </svg>
    `,
    'circle-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 150 100 A 50 50 0 1 1 145 100" stroke="#667eea" stroke-width="4" fill="none" stroke-linecap="round"/>
            <circle cx="150" cy="100" r="3" fill="#667eea" />
            <circle cx="145" cy="100" r="3" fill="#4caf50" />
            <path d="M 150 95 L 145 90 L 155 90" fill="#4caf50"/>
        </svg>
    `,
    'circle-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="80" stroke="#4caf50" stroke-width="5" fill="none"/>
            <text x="150" y="160" text-anchor="middle" fill="#4caf50" font-size="24" font-weight="bold">✓</text>
        </svg>
    `,

    // SUN
    'sun-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="#667eea" stroke-width="4" fill="none"/>
        </svg>
    `,
    'sun-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="#667eea" stroke-width="4" fill="none"/>
            <line x1="150" y1="80" x2="150" y2="50" stroke="#667eea" stroke-width="4" stroke-linecap="round"/>
            <line x1="150" y1="220" x2="150" y2="250" stroke="#667eea" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="150" x2="50" y2="150" stroke="#667eea" stroke-width="4" stroke-linecap="round"/>
            <line x1="220" y1="150" x2="250" y2="150" stroke="#667eea" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `,
    'sun-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="#667eea" stroke-width="4" fill="none"/>
            <line x1="150" y1="80" x2="150" y2="50" stroke="#667eea" stroke-width="4" stroke-linecap="round"/>
            <line x1="150" y1="220" x2="150" y2="250" stroke="#667eea" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="150" x2="50" y2="150" stroke="#667eea" stroke-width="4" stroke-linecap="round"/>
            <line x1="220" y1="150" x2="250" y2="150" stroke="#667eea" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="100" x2="75" y2="75" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="100" x2="225" y2="75" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="200" x2="75" y2="225" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="200" x2="225" y2="225" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `,
    'sun-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="#667eea" stroke-width="4" fill="#ffd93d"/>
            <line x1="150" y1="80" x2="150" y2="50" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="150" y1="220" x2="150" y2="250" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="150" x2="50" y2="150" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="220" y1="150" x2="250" y2="150" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="100" x2="75" y2="75" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="100" x2="225" y2="75" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="200" x2="75" y2="225" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="200" x2="225" y2="225" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `,
    'sun-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="#667eea" stroke-width="4" fill="#ffd93d"/>
            <line x1="150" y1="80" x2="150" y2="50" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="150" y1="220" x2="150" y2="250" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="150" x2="50" y2="150" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="220" y1="150" x2="250" y2="150" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="100" x2="75" y2="75" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="100" x2="225" y2="75" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="200" x2="75" y2="225" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="200" x2="225" y2="225" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <circle cx="135" cy="140" r="5" fill="#333"/>
            <circle cx="165" cy="140" r="5" fill="#333"/>
            <path d="M 130 160 Q 150 170 170 160" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>
    `,

    // HOUSE
    'house-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="#667eea" stroke-width="4" fill="none"/>
        </svg>
    `,
    'house-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 60 100 L 150 40 L 240 100 Z" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'house-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 60 100 L 150 40 L 240 100 Z" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="125" y="180" width="50" height="70" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'house-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 60 100 L 150 40 L 240 100 Z" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="125" y="180" width="50" height="70" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="85" y="120" width="30" height="30" stroke="#4caf50" stroke-width="3" fill="none"/>
            <rect x="185" y="120" width="30" height="30" stroke="#4caf50" stroke-width="3" fill="none"/>
        </svg>
    `,
    'house-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="#667eea" stroke-width="4" fill="#f0e6d2"/>
            <path d="M 60 100 L 150 40 L 240 100 Z" stroke="#667eea" stroke-width="4" fill="#e74c3c"/>
            <rect x="125" y="180" width="50" height="70" stroke="#667eea" stroke-width="4" fill="#8b4513"/>
            <rect x="85" y="120" width="30" height="30" stroke="#667eea" stroke-width="3" fill="#87ceeb"/>
            <rect x="185" y="120" width="30" height="30" stroke="#667eea" stroke-width="3" fill="#87ceeb"/>
            <circle cx="160" cy="215" r="4" fill="#4caf50"/>
        </svg>
    `,

    // TREE
    'tree-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <line x1="130" y1="150" x2="130" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="170" y1="150" x2="170" y2="250" stroke="#667eea" stroke-width="4"/>
        </svg>
    `,
    'tree-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <line x1="130" y1="150" x2="130" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="170" y1="150" x2="170" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="130" y1="250" x2="170" y2="250" stroke="#4caf50" stroke-width="4"/>
        </svg>
    `,
    'tree-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <line x1="130" y1="150" x2="130" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="170" y1="150" x2="170" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="130" y1="250" x2="170" y2="250" stroke="#667eea" stroke-width="4"/>
            <ellipse cx="150" cy="100" rx="70" ry="60" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'tree-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <line x1="130" y1="150" x2="130" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="170" y1="150" x2="170" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="130" y1="250" x2="170" y2="250" stroke="#667eea" stroke-width="4"/>
            <ellipse cx="150" cy="100" rx="70" ry="60" stroke="#4caf50" stroke-width="4" fill="#90EE90"/>
        </svg>
    `,
    'tree-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="130" y="150" width="40" height="100" stroke="#667eea" stroke-width="4" fill="#8b4513"/>
            <line x1="140" y1="170" x2="140" y2="230" stroke="#5a3410" stroke-width="2"/>
            <line x1="160" y1="180" x2="160" y2="240" stroke="#5a3410" stroke-width="2"/>
            <ellipse cx="150" cy="100" rx="70" ry="60" stroke="#4caf50" stroke-width="4" fill="#90EE90"/>
        </svg>
    `,

    // FLOWER
    'flower-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="100" r="15" stroke="#667eea" stroke-width="4" fill="none"/>
        </svg>
    `,
    'flower-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="100" r="15" stroke="#667eea" stroke-width="4" fill="none"/>
            <ellipse cx="150" cy="70" rx="12" ry="20" stroke="#4caf50" stroke-width="3" fill="none"/>
            <ellipse cx="150" cy="130" rx="12" ry="20" stroke="#4caf50" stroke-width="3" fill="none"/>
            <ellipse cx="120" cy="100" rx="20" ry="12" stroke="#4caf50" stroke-width="3" fill="none"/>
            <ellipse cx="180" cy="100" rx="20" ry="12" stroke="#4caf50" stroke-width="3" fill="none"/>
            <ellipse cx="170" cy="80" rx="15" ry="15" stroke="#4caf50" stroke-width="3" fill="none" transform="rotate(45 170 80)"/>
        </svg>
    `,
    'flower-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="70" rx="12" ry="20" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="150" cy="130" rx="12" ry="20" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="120" cy="100" rx="20" ry="12" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="180" cy="100" rx="20" ry="12" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="170" cy="80" rx="15" ry="15" stroke="#667eea" stroke-width="3" fill="#ff69b4" transform="rotate(45 170 80)"/>
            <circle cx="150" cy="100" r="15" stroke="#667eea" stroke-width="4" fill="#ffd93d"/>
        </svg>
    `,
    'flower-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="70" rx="12" ry="20" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="150" cy="130" rx="12" ry="20" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="120" cy="100" rx="20" ry="12" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="180" cy="100" rx="20" ry="12" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="170" cy="80" rx="15" ry="15" stroke="#667eea" stroke-width="3" fill="#ff69b4" transform="rotate(45 170 80)"/>
            <circle cx="150" cy="100" r="15" stroke="#667eea" stroke-width="4" fill="#ffd93d"/>
            <line x1="150" y1="115" x2="150" y2="250" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `,
    'flower-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="70" rx="12" ry="20" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="150" cy="130" rx="12" ry="20" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="120" cy="100" rx="20" ry="12" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="180" cy="100" rx="20" ry="12" stroke="#667eea" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="170" cy="80" rx="15" ry="15" stroke="#667eea" stroke-width="3" fill="#ff69b4" transform="rotate(45 170 80)"/>
            <circle cx="150" cy="100" r="15" stroke="#667eea" stroke-width="4" fill="#ffd93d"/>
            <line x1="150" y1="115" x2="150" y2="250" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
            <ellipse cx="120" cy="180" rx="25" ry="15" stroke="#4caf50" stroke-width="3" fill="#90EE90" transform="rotate(-30 120 180)"/>
            <ellipse cx="180" cy="200" rx="25" ry="15" stroke="#4caf50" stroke-width="3" fill="#90EE90" transform="rotate(30 180 200)"/>
        </svg>
    `,

    // CAT
    'cat-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="#667eea" stroke-width="4" fill="none"/>
        </svg>
    `,
    'cat-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="#4caf50" stroke-width="3" fill="none"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="#4caf50" stroke-width="3" fill="none"/>
        </svg>
    `,
    'cat-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="#667eea" stroke-width="3" fill="none"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="#667eea" stroke-width="3" fill="none"/>
            <ellipse cx="150" cy="180" rx="50" ry="40" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'cat-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="#667eea" stroke-width="3" fill="none"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="#667eea" stroke-width="3" fill="none"/>
            <ellipse cx="150" cy="180" rx="50" ry="40" stroke="#667eea" stroke-width="4" fill="none"/>
            <line x1="120" y1="200" x2="120" y2="250" stroke="#4caf50" stroke-width="4"/>
            <line x1="140" y1="200" x2="140" y2="250" stroke="#4caf50" stroke-width="4"/>
            <line x1="160" y1="200" x2="160" y2="250" stroke="#4caf50" stroke-width="4"/>
            <line x1="180" y1="200" x2="180" y2="250" stroke="#4caf50" stroke-width="4"/>
        </svg>
    `,
    'cat-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="#667eea" stroke-width="4" fill="#ffa500"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="#667eea" stroke-width="3" fill="#ffa500"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="#667eea" stroke-width="3" fill="#ffa500"/>
            <ellipse cx="150" cy="180" rx="50" ry="40" stroke="#667eea" stroke-width="4" fill="#ffa500"/>
            <line x1="120" y1="200" x2="120" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="140" y1="200" x2="140" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="160" y1="200" x2="160" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="180" y1="200" x2="180" y2="250" stroke="#667eea" stroke-width="4"/>
            <circle cx="135" cy="115" r="4" fill="#333"/>
            <circle cx="165" cy="115" r="4" fill="#333"/>
            <path d="M 145 125 L 150 130 L 155 125" stroke="#333" stroke-width="2" fill="none"/>
        </svg>
    `,
    'cat-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="#667eea" stroke-width="4" fill="#ffa500"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="#667eea" stroke-width="3" fill="#ffa500"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="#667eea" stroke-width="3" fill="#ffa500"/>
            <ellipse cx="150" cy="180" rx="50" ry="40" stroke="#667eea" stroke-width="4" fill="#ffa500"/>
            <line x1="120" y1="200" x2="120" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="140" y1="200" x2="140" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="160" y1="200" x2="160" y2="250" stroke="#667eea" stroke-width="4"/>
            <line x1="180" y1="200" x2="180" y2="250" stroke="#667eea" stroke-width="4"/>
            <circle cx="135" cy="115" r="4" fill="#333"/>
            <circle cx="165" cy="115" r="4" fill="#333"/>
            <path d="M 145 125 L 150 130 L 155 125" stroke="#333" stroke-width="2" fill="none"/>
            <line x1="110" y1="120" x2="80" y2="115" stroke="#333" stroke-width="2"/>
            <line x1="110" y1="125" x2="80" y2="125" stroke="#333" stroke-width="2"/>
            <line x1="110" y1="130" x2="80" y2="135" stroke="#333" stroke-width="2"/>
            <line x1="190" y1="120" x2="220" y2="115" stroke="#333" stroke-width="2"/>
            <line x1="190" y1="125" x2="220" y2="125" stroke="#333" stroke-width="2"/>
            <line x1="190" y1="130" x2="220" y2="135" stroke="#333" stroke-width="2"/>
            <path d="M 190 170 Q 220 160 240 180" stroke="#4caf50" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>
    `,

    // CAR
    'car-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" stroke="#667eea" stroke-width="4" fill="none"/>
        </svg>
    `,
    'car-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="90" y="110" width="120" height="40" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'car-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" rx="10" ry="10" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="90" y="110" width="120" height="40" rx="5" ry="5" stroke="#667eea" stroke-width="4" fill="none"/>
        </svg>
    `,
    'car-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" rx="10" ry="10" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="90" y="110" width="120" height="40" rx="5" ry="5" stroke="#667eea" stroke-width="4" fill="none"/>
            <circle cx="100" cy="210" r="25" stroke="#4caf50" stroke-width="4" fill="none"/>
            <circle cx="200" cy="210" r="25" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'car-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" rx="10" ry="10" stroke="#667eea" stroke-width="4" fill="#e74c3c"/>
            <rect x="90" y="110" width="120" height="40" rx="5" ry="5" stroke="#667eea" stroke-width="4" fill="#87ceeb"/>
            <circle cx="100" cy="210" r="25" stroke="#667eea" stroke-width="4" fill="#333"/>
            <circle cx="200" cy="210" r="25" stroke="#667eea" stroke-width="4" fill="#333"/>
            <circle cx="100" cy="210" r="10" stroke="#4caf50" stroke-width="3" fill="none"/>
            <circle cx="200" cy="210" r="10" stroke="#4caf50" stroke-width="3" fill="none"/>
        </svg>
    `,
    'car-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" rx="10" ry="10" stroke="#667eea" stroke-width="4" fill="#e74c3c"/>
            <rect x="90" y="110" width="120" height="40" rx="5" ry="5" stroke="#667eea" stroke-width="4" fill="#87ceeb"/>
            <line x1="150" y1="110" x2="150" y2="150" stroke="#667eea" stroke-width="3"/>
            <circle cx="100" cy="210" r="25" stroke="#667eea" stroke-width="4" fill="#333"/>
            <circle cx="200" cy="210" r="25" stroke="#667eea" stroke-width="4" fill="#333"/>
            <circle cx="100" cy="210" r="10" stroke="#ddd" stroke-width="3" fill="none"/>
            <circle cx="200" cy="210" r="10" stroke="#ddd" stroke-width="3" fill="none"/>
            <rect x="50" y="165" width="15" height="10" stroke="#4caf50" stroke-width="2" fill="#ffd93d"/>
            <rect x="235" y="165" width="15" height="10" stroke="#4caf50" stroke-width="2" fill="#ffd93d"/>
        </svg>
    `,

    // BUTTERFLY
    'butterfly-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="#667eea" stroke-width="4" fill="none"/>
        </svg>
    `,
    'butterfly-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="#667eea" stroke-width="4" fill="none"/>
            <circle cx="150" cy="120" r="10" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'butterfly-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="#667eea" stroke-width="4" fill="none"/>
            <circle cx="150" cy="120" r="10" stroke="#667eea" stroke-width="4" fill="none"/>
            <line x1="145" y1="115" x2="130" y2="90" stroke="#4caf50" stroke-width="3"/>
            <circle cx="130" cy="90" r="3" fill="#4caf50"/>
            <line x1="155" y1="115" x2="170" y2="90" stroke="#4caf50" stroke-width="3"/>
            <circle cx="170" cy="90" r="3" fill="#4caf50"/>
        </svg>
    `,
    'butterfly-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="#667eea" stroke-width="4" fill="none"/>
            <circle cx="150" cy="120" r="10" stroke="#667eea" stroke-width="4" fill="none"/>
            <line x1="145" y1="115" x2="130" y2="90" stroke="#667eea" stroke-width="3"/>
            <circle cx="130" cy="90" r="3" fill="#667eea"/>
            <line x1="155" y1="115" x2="170" y2="90" stroke="#667eea" stroke-width="3"/>
            <circle cx="170" cy="90" r="3" fill="#667eea"/>
            <ellipse cx="100" cy="140" rx="35" ry="25" stroke="#4caf50" stroke-width="4" fill="none"/>
            <ellipse cx="100" cy="170" rx="30" ry="20" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'butterfly-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="#667eea" stroke-width="4" fill="#333"/>
            <circle cx="150" cy="120" r="10" stroke="#667eea" stroke-width="4" fill="#333"/>
            <line x1="145" y1="115" x2="130" y2="90" stroke="#667eea" stroke-width="3"/>
            <circle cx="130" cy="90" r="3" fill="#667eea"/>
            <line x1="155" y1="115" x2="170" y2="90" stroke="#667eea" stroke-width="3"/>
            <circle cx="170" cy="90" r="3" fill="#667eea"/>
            <ellipse cx="100" cy="140" rx="35" ry="25" stroke="#667eea" stroke-width="4" fill="#ff69b4"/>
            <ellipse cx="100" cy="170" rx="30" ry="20" stroke="#667eea" stroke-width="4" fill="#9370db"/>
            <ellipse cx="200" cy="140" rx="35" ry="25" stroke="#4caf50" stroke-width="4" fill="#ff69b4"/>
            <ellipse cx="200" cy="170" rx="30" ry="20" stroke="#4caf50" stroke-width="4" fill="#9370db"/>
        </svg>
    `,
    'butterfly-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="#667eea" stroke-width="4" fill="#333"/>
            <circle cx="150" cy="120" r="10" stroke="#667eea" stroke-width="4" fill="#333"/>
            <line x1="145" y1="115" x2="130" y2="90" stroke="#667eea" stroke-width="3"/>
            <circle cx="130" cy="90" r="3" fill="#667eea"/>
            <line x1="155" y1="115" x2="170" y2="90" stroke="#667eea" stroke-width="3"/>
            <circle cx="170" cy="90" r="3" fill="#667eea"/>
            <ellipse cx="100" cy="140" rx="35" ry="25" stroke="#667eea" stroke-width="4" fill="#ff69b4"/>
            <ellipse cx="100" cy="170" rx="30" ry="20" stroke="#667eea" stroke-width="4" fill="#9370db"/>
            <ellipse cx="200" cy="140" rx="35" ry="25" stroke="#667eea" stroke-width="4" fill="#ff69b4"/>
            <ellipse cx="200" cy="170" rx="30" ry="20" stroke="#667eea" stroke-width="4" fill="#9370db"/>
            <circle cx="90" cy="135" r="6" fill="#ffd93d"/>
            <circle cx="105" cy="140" r="4" fill="#fff"/>
            <circle cx="190" cy="135" r="6" fill="#ffd93d"/>
            <circle cx="205" cy="140" r="4" fill="#fff"/>
        </svg>
    `,

    // DOLPHIN - simplified for hard level
    'dolphin-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 50 150 Q 100 130 150 140 Q 200 150 240 130" stroke="#667eea" stroke-width="4" fill="none"/>
        </svg>
    `,
    'dolphin-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 50 150 Q 100 130 150 140 Q 200 150 240 130" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 240 130 Q 250 125 255 130" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'dolphin-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 50 150 Q 100 130 150 140 Q 200 150 240 130" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 240 130 Q 250 125 255 130" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 150 140 Q 160 110 150 100" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'dolphin-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 50 150 Q 100 130 150 140 Q 200 150 240 130" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 240 130 Q 250 125 255 130" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 150 140 Q 160 110 150 100" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 45 145 L 35 135 L 40 150 L 35 165 L 45 155 Z" stroke="#4caf50" stroke-width="3" fill="none"/>
        </svg>
    `,
    'dolphin-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 50 150 Q 100 130 150 140 Q 200 150 240 130" stroke="#667eea" stroke-width="4" fill="#87ceeb"/>
            <path d="M 240 130 Q 250 125 255 130" stroke="#667eea" stroke-width="4" fill="#87ceeb"/>
            <path d="M 150 140 Q 160 110 150 100" stroke="#667eea" stroke-width="4" fill="#87ceeb"/>
            <path d="M 45 145 L 35 135 L 40 150 L 35 165 L 45 155 Z" stroke="#667eea" stroke-width="3" fill="#87ceeb"/>
            <path d="M 90 145 L 80 130 L 95 145" stroke="#4caf50" stroke-width="3" fill="none"/>
            <path d="M 210 145 L 220 130 L 205 145" stroke="#4caf50" stroke-width="3" fill="none"/>
        </svg>
    `,
    'dolphin-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 50 150 Q 100 130 150 140 Q 200 150 240 130" stroke="#667eea" stroke-width="4" fill="#87ceeb"/>
            <path d="M 240 130 Q 250 125 255 130" stroke="#667eea" stroke-width="4" fill="#87ceeb"/>
            <path d="M 150 140 Q 160 110 150 100" stroke="#667eea" stroke-width="4" fill="#87ceeb"/>
            <path d="M 45 145 L 35 135 L 40 150 L 35 165 L 45 155 Z" stroke="#667eea" stroke-width="3" fill="#87ceeb"/>
            <path d="M 90 145 L 80 130 L 95 145" stroke="#667eea" stroke-width="3" fill="#87ceeb"/>
            <path d="M 210 145 L 220 130 L 205 145" stroke="#667eea" stroke-width="3" fill="#87ceeb"/>
            <circle cx="235" cy="130" r="4" fill="#333"/>
            <path d="M 225 138 Q 235 142 245 138" stroke="#4caf50" stroke-width="2" fill="none"/>
        </svg>
    `,
    'dolphin-step7': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 50 150 Q 100 130 150 140 Q 200 150 240 130" stroke="#667eea" stroke-width="4" fill="#4682b4"/>
            <path d="M 50 155 Q 100 135 150 145 Q 200 155 240 135" stroke="#87ceeb" stroke-width="2" fill="none"/>
            <path d="M 240 130 Q 250 125 255 130" stroke="#667eea" stroke-width="4" fill="#4682b4"/>
            <path d="M 150 140 Q 160 110 150 100" stroke="#667eea" stroke-width="4" fill="#4682b4"/>
            <path d="M 45 145 L 35 135 L 40 150 L 35 165 L 45 155 Z" stroke="#667eea" stroke-width="3" fill="#4682b4"/>
            <path d="M 90 145 L 80 130 L 95 145" stroke="#667eea" stroke-width="3" fill="#4682b4"/>
            <path d="M 210 145 L 220 130 L 205 145" stroke="#667eea" stroke-width="3" fill="#4682b4"/>
            <circle cx="235" cy="130" r="4" fill="#333"/>
            <path d="M 225 138 Q 235 142 245 138" stroke="#333" stroke-width="2" fill="none"/>
        </svg>
    `,

    // CASTLE - simplified
    'castle-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="#667eea" stroke-width="4" fill="none"/>
        </svg>
    `,
    'castle-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="60" y="100" width="40" height="140" stroke="#4caf50" stroke-width="4" fill="none"/>
            <rect x="200" y="100" width="40" height="140" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'castle-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="60" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="200" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="#4caf50" stroke-width="4" fill="none"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="#4caf50" stroke-width="4" fill="none"/>
        </svg>
    `,
    'castle-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="60" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="200" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="95" y="115" width="12" height="10" stroke="#4caf50" stroke-width="2" fill="none"/>
            <rect x="113" y="115" width="12" height="10" stroke="#4caf50" stroke-width="2" fill="none"/>
            <rect x="131" y="115" width="12" height="10" stroke="#4caf50" stroke-width="2" fill="none"/>
            <rect x="149" y="115" width="12" height="10" stroke="#4caf50" stroke-width="2" fill="none"/>
            <rect x="167" y="115" width="12" height="10" stroke="#4caf50" stroke-width="2" fill="none"/>
            <rect x="185" y="115" width="12" height="10" stroke="#4caf50" stroke-width="2" fill="none"/>
        </svg>
    `,
    'castle-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="60" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="200" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="#667eea" stroke-width="4" fill="none"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="#667eea" stroke-width="4" fill="none"/>
            <rect x="95" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="113" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="131" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="149" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="167" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="185" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="130" y="200" width="40" height="40" stroke="#4caf50" stroke-width="4" fill="none"/>
            <path d="M 130 200 L 150 185 L 170 200" stroke="#4caf50" stroke-width="3" fill="none"/>
        </svg>
    `,
    'castle-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="#667eea" stroke-width="4" fill="#d3d3d3"/>
            <rect x="60" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="#d3d3d3"/>
            <rect x="200" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="#d3d3d3"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="#667eea" stroke-width="4" fill="#e74c3c"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="#667eea" stroke-width="4" fill="#e74c3c"/>
            <rect x="95" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="113" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="131" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="149" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="167" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="185" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="130" y="200" width="40" height="40" stroke="#667eea" stroke-width="4" fill="#8b4513"/>
            <path d="M 130 200 L 150 185 L 170 200" stroke="#667eea" stroke-width="3" fill="none"/>
            <rect x="110" y="140" width="15" height="20" stroke="#4caf50" stroke-width="2" fill="#87ceeb"/>
            <rect x="175" y="140" width="15" height="20" stroke="#4caf50" stroke-width="2" fill="#87ceeb"/>
            <rect x="70" y="120" width="15" height="20" stroke="#4caf50" stroke-width="2" fill="#87ceeb"/>
            <rect x="215" y="120" width="15" height="20" stroke="#4caf50" stroke-width="2" fill="#87ceeb"/>
        </svg>
    `,
    'castle-step7': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="#667eea" stroke-width="4" fill="#d3d3d3"/>
            <rect x="60" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="#d3d3d3"/>
            <rect x="200" y="100" width="40" height="140" stroke="#667eea" stroke-width="4" fill="#d3d3d3"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="#667eea" stroke-width="4" fill="#e74c3c"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="#667eea" stroke-width="4" fill="#e74c3c"/>
            <rect x="95" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="113" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="131" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="149" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="167" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="185" y="115" width="12" height="10" stroke="#667eea" stroke-width="2" fill="none"/>
            <rect x="130" y="200" width="40" height="40" stroke="#667eea" stroke-width="4" fill="#8b4513"/>
            <path d="M 130 200 L 150 185 L 170 200" stroke="#667eea" stroke-width="3" fill="none"/>
            <rect x="110" y="140" width="15" height="20" stroke="#667eea" stroke-width="2" fill="#87ceeb"/>
            <rect x="175" y="140" width="15" height="20" stroke="#667eea" stroke-width="2" fill="#87ceeb"/>
            <rect x="70" y="120" width="15" height="20" stroke="#667eea" stroke-width="2" fill="#87ceeb"/>
            <rect x="215" y="120" width="15" height="20" stroke="#667eea" stroke-width="2" fill="#87ceeb"/>
            <line x1="78" y1="72" x2="78" y2="58" stroke="#e74c3c" stroke-width="2"/>
            <path d="M 78 58 L 70 63 L 78 60 L 86 63 Z" fill="#e74c3c"/>
            <line x1="220" y1="72" x2="220" y2="58" stroke="#e74c3c" stroke-width="2"/>
            <path d="M 220 58 L 212 63 L 220 60 L 228 63 Z" fill="#e74c3c"/>
        </svg>
    `
};

/**
 * Load tutorial list for selected difficulty
 */
function loadTutorialList(difficulty) {
    currentDifficulty = difficulty;
    currentStep = 0;

    const difficultySelection = document.getElementById('difficulty-selection');
    const tutorialSelection = document.getElementById('tutorial-selection');
    const worksheetArea = document.getElementById('worksheet-area');

    difficultySelection.style.display = 'none';
    tutorialSelection.style.display = 'block';
    worksheetArea.innerHTML = '';

    const titleMap = {
        easy: '⭐ Easy Tutorials',
        medium: '⭐⭐ Medium Tutorials',
        hard: '⭐⭐⭐ Hard Tutorials'
    };

    document.getElementById('tutorial-list-title').textContent = titleMap[difficulty];

    const tutorialList = document.getElementById('tutorial-list');
    tutorialList.innerHTML = '';

    const tutorials = drawingTutorials[difficulty];

    for (const [key, tutorial] of Object.entries(tutorials)) {
        const card = document.createElement('div');
        card.className = 'tutorial-card';
        card.onclick = () => loadDrawingTutorial(key);

        card.innerHTML = `
            <div class="tutorial-icon">${tutorial.icon}</div>
            <div class="tutorial-name">${tutorial.name}</div>
        `;

        tutorialList.appendChild(card);
    }
}

/**
 * Load drawing tutorial with interactive step-by-step view
 */
function loadDrawingTutorial(tutorialKey) {
    currentTutorial = tutorialKey;
    currentStep = 0;

    const tutorialSelection = document.getElementById('tutorial-selection');
    const worksheetArea = document.getElementById('worksheet-area');

    tutorialSelection.style.display = 'none';

    const tutorial = drawingTutorials[currentDifficulty][tutorialKey];

    worksheetArea.innerHTML = `
        <div class="navigation" style="margin-bottom: 20px;">
            <button onclick="backToTutorialList()">← Back to Tutorial List</button>
        </div>

        <div class="drawing-title">${tutorial.icon} ${tutorial.name}</div>

        <div class="split-screen">
            <div class="instructions-panel">
                <h3 style="color: #667eea; text-align: center; margin-bottom: 20px;">📋 Follow These Steps</h3>

                <!-- Step Progress Indicator -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 1.2em; font-weight: bold; color: #764ba2;">
                        Step <span id="current-step-num">1</span> of ${tutorial.steps.length}
                    </span>
                </div>

                <!-- Visual Guide -->
                <div id="visual-guide" style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 20px; min-height: 320px; display: flex; align-items: center; justify-content: center;">
                </div>

                <!-- Step Text -->
                <div id="step-text" style="background: #e8f5e9; border-left: 5px solid #4caf50; padding: 20px; border-radius: 8px; font-size: 1.2em; line-height: 1.6; text-align: center; margin-bottom: 20px;">
                </div>

                <!-- Navigation Buttons -->
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="prev-step-btn" onclick="previousStep()" style="padding: 15px 30px; font-size: 1.1em; border: 3px solid #667eea; background: white; color: #667eea; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                        ⬅️ Previous Step
                    </button>
                    <button id="next-step-btn" onclick="nextStep()" style="padding: 15px 30px; font-size: 1.1em; border: 3px solid #4caf50; background: #4caf50; color: white; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                        Next Step ➡️
                    </button>
                </div>
            </div>

            <div class="canvas-panel">
                <h3 style="color: #764ba2; margin-bottom: 20px;">✏️ Your Drawing Canvas</h3>
                <div class="canvas-container">
                    <canvas id="drawing-canvas" width="500" height="500"></canvas>
                </div>
                <div class="canvas-controls">
                    <button class="canvas-btn" onclick="clearCanvas()">🗑️ Clear Canvas</button>
                    <button class="canvas-btn" onclick="changeColor('black')">⚫ Black</button>
                    <button class="canvas-btn" onclick="changeColor('blue')">🔵 Blue</button>
                    <button class="canvas-btn" onclick="changeColor('red')">🔴 Red</button>
                    <button class="canvas-btn" onclick="changeColor('green')">🟢 Green</button>
                </div>
                <div class="canvas-controls">
                    <button class="canvas-btn" onclick="changeBrushSize('small')">Small Brush</button>
                    <button class="canvas-btn" onclick="changeBrushSize('medium')">Medium Brush</button>
                    <button class="canvas-btn" onclick="changeBrushSize('large')">Large Brush</button>
                </div>
                <div class="canvas-controls">
                    <button class="canvas-btn" style="background: #4caf50; color: white;" onclick="savePDF()">💾 Save as PDF</button>
                </div>
            </div>
        </div>
    `;

    // Initialize canvas
    initializeDrawingCanvas();

    // Show first step
    updateStep();
}

/**
 * Update the displayed step
 */
function updateStep() {
    const tutorial = drawingTutorials[currentDifficulty][currentTutorial];
    const step = tutorial.steps[currentStep];

    // Update step number
    document.getElementById('current-step-num').textContent = currentStep + 1;

    // Update visual guide
    const visualGuide = document.getElementById('visual-guide');
    const visualFunction = visualGuides[step.visual];
    if (visualFunction) {
        visualGuide.innerHTML = visualFunction();
    } else {
        visualGuide.innerHTML = '<p style="color: #999;">Visual guide not available</p>';
    }

    // Update step text
    document.getElementById('step-text').textContent = step.text;

    // Update button states
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');

    if (currentStep === 0) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.disabled = false;
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }

    if (currentStep === tutorial.steps.length - 1) {
        nextBtn.textContent = '✓ Finished!';
        nextBtn.style.background = '#4caf50';
    } else {
        nextBtn.textContent = 'Next Step ➡️';
        nextBtn.style.background = '#4caf50';
    }
}

/**
 * Go to next step
 */
function nextStep() {
    const tutorial = drawingTutorials[currentDifficulty][currentTutorial];
    if (currentStep < tutorial.steps.length - 1) {
        currentStep++;
        updateStep();
    }
}

/**
 * Go to previous step
 */
function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateStep();
    }
}

// Canvas variables
let canvas, ctx;
let isDrawing = false;
let currentColor = 'black';
let currentBrushSize = 3;

/**
 * Initialize drawing canvas
 */
function initializeDrawingCanvas() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas.getContext('2d');

    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set initial drawing style
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
}

/**
 * Start drawing
 */
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
}

/**
 * Draw on canvas
 */
function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
}

/**
 * Stop drawing
 */
function stopDrawing() {
    isDrawing = false;
}

/**
 * Handle touch start for mobile
 */
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
}

/**
 * Handle touch move for mobile
 */
function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
}

/**
 * Clear canvas
 */
function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = currentColor;
}

/**
 * Change drawing color
 */
function changeColor(color) {
    currentColor = color;
    ctx.strokeStyle = color;
}

/**
 * Change brush size
 */
function changeBrushSize(size) {
    const sizeMap = {
        small: 2,
        medium: 5,
        large: 10
    };
    currentBrushSize = sizeMap[size] || 3;
    ctx.lineWidth = currentBrushSize;
}

/**
 * Save as PDF
 */
function savePDF() {
    const tutorial = drawingTutorials[currentDifficulty][currentTutorial];
    const canvasImage = canvas.toDataURL('image/png');

    const content = `
        <div style="font-family: Arial, sans-serif; padding: 30px;">
            <h1 style="text-align: center; color: #667eea;">${tutorial.icon} ${tutorial.name}</h1>
            <h3 style="color: #764ba2;">Your Drawing:</h3>
            <div style="text-align: center; margin: 20px 0;">
                <img src="${canvasImage}" style="max-width: 100%; border: 3px solid #333; border-radius: 10px;">
            </div>
            <h3 style="color: #667eea;">Steps You Followed:</h3>
            <ol style="font-size: 14px; line-height: 1.8;">
                ${tutorial.steps.map(step => `<li>${step.text}</li>`).join('')}
            </ol>
            <p style="text-align: center; margin-top: 30px; color: #666;">
                <strong>Student:</strong> ${getCurrentUserFullName()}<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </p>
        </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = content;

    const opt = {
        margin: 0.5,
        filename: `${tutorial.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

/**
 * Back to tutorial list
 */
function backToTutorialList() {
    const tutorialSelection = document.getElementById('tutorial-selection');
    const worksheetArea = document.getElementById('worksheet-area');

    worksheetArea.innerHTML = '';
    tutorialSelection.style.display = 'block';
}

/**
 * Back to difficulty selection
 */
function backToDifficulty() {
    const difficultySelection = document.getElementById('difficulty-selection');
    const tutorialSelection = document.getElementById('tutorial-selection');

    tutorialSelection.style.display = 'none';
    difficultySelection.style.display = 'block';
}
