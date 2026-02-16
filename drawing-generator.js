// Drawing Tutorial Generator with Interactive Step-by-Step Visual Guides


let currentAge = null;
let currentDifficulty = '';
let currentTutorial = '';
let currentStep = 0;

// Navigation functions
function selectAge(age) {
    currentAge = age;
    const ageSelection = document.getElementById('age-selection');
    const difficultySelection = document.getElementById('difficulty-selection');

    if (ageSelection) ageSelection.style.display = 'none';
    if (difficultySelection) difficultySelection.style.display = 'block';
}

function backToAges() {
    const difficultySelection = document.getElementById('difficulty-selection');
    const ageSelection = document.getElementById('age-selection');

    if (difficultySelection) difficultySelection.style.display = 'none';
    if (ageSelection) ageSelection.style.display = 'block';
}

// Demo version limiting
function isDemoMode() {
    const user = getCurrentUser();
    if (!user) return true; // Default to demo if no user

    // Check for admin demo preview mode
    if (user.role === 'admin') {
        const adminDemoPreview = localStorage.getItem('adminDemoPreview') === 'true';
        return adminDemoPreview; // Admin can toggle demo preview
    }

    // Get selected child and check their version
    const child = typeof getSelectedChild === 'function' ? getSelectedChild() : null;
    if (!child) return true; // Default to demo if no child selected

    // Check child's version (default to demo for backward compatibility)
    const version = child.version || 'demo';
    return version === 'demo';
}

function getDemoLimit(defaultCount) {
    return isDemoMode() ? Math.min(2, defaultCount) : defaultCount;
}

// Drawing tutorials database with SVG visual steps - Age-based structure
// Age-based drawing tutorials (INTERNAL - kept for future assessment system)
const ageBasedDrawingTutorials = {
    '4-5': {
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
            square: {
                name: 'Draw a Square',
                icon: '⬜',
                steps: [
                    { text: 'Start at the top left', visual: 'square-step1' },
                    { text: 'Draw a line going right', visual: 'square-step2' },
                    { text: 'Draw a line going down', visual: 'square-step3' },
                    { text: 'Draw a line going left', visual: 'square-step4' },
                    { text: 'Connect back to start. Great job!', visual: 'square-step5' }
                ]
            },
            triangle: {
                name: 'Draw a Triangle',
                icon: '🔺',
                steps: [
                    { text: 'Start at the top point', visual: 'triangle-step1' },
                    { text: 'Draw a slanted line down to the left', visual: 'triangle-step2' },
                    { text: 'Draw a straight line to the right', visual: 'triangle-step3' },
                    { text: 'Connect back to the top. Perfect!', visual: 'triangle-step4' }
                ]
            }
        },
        medium: {
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
            moon: {
                name: 'Draw a Moon',
                icon: '🌙',
                steps: [
                    { text: 'Draw a circle', visual: 'moon-step1' },
                    { text: 'Draw another circle overlapping on the right', visual: 'moon-step2' },
                    { text: 'Erase the right circle to make a crescent', visual: 'moon-step3' },
                    { text: 'Add a sleepy face. Goodnight!', visual: 'moon-step4' }
                ]
            },
            heart: {
                name: 'Draw a Heart',
                icon: '❤️',
                steps: [
                    { text: 'Draw two bumps at the top', visual: 'heart-step1' },
                    { text: 'Curve down on the left side', visual: 'heart-step2' },
                    { text: 'Curve down on the right side', visual: 'heart-step3' },
                    { text: 'Meet at a point at the bottom. Love it!', visual: 'heart-step4' }
                ]
            }
        },
        hard: {
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
        }
    },
    '6': {
        easy: {
            fish: {
                name: 'Draw a Fish',
                icon: '🐠',
                steps: [
                    { text: 'Draw an oval for the body', visual: 'fish-step1' },
                    { text: 'Add a triangle tail at the back', visual: 'fish-step2' },
                    { text: 'Draw fins on top and bottom', visual: 'fish-step3' },
                    { text: 'Add an eye and mouth', visual: 'fish-step4' },
                    { text: 'Add scales pattern. Swim!', visual: 'fish-step5' }
                ]
            },
            bird: {
                name: 'Draw a Bird',
                icon: '🐦',
                steps: [
                    { text: 'Draw a circle for the head', visual: 'bird-step1' },
                    { text: 'Add an oval body below', visual: 'bird-step2' },
                    { text: 'Draw a small triangle beak', visual: 'bird-step3' },
                    { text: 'Add a wing shape', visual: 'bird-step4' },
                    { text: 'Draw stick legs and an eye. Tweet!', visual: 'bird-step5' }
                ]
            },
            snail: {
                name: 'Draw a Snail',
                icon: '🐌',
                steps: [
                    { text: 'Draw a spiral shell', visual: 'snail-step1' },
                    { text: 'Draw a long curved body', visual: 'snail-step2' },
                    { text: 'Add two antennae on top', visual: 'snail-step3' },
                    { text: 'Draw eyes and smile. Slow and steady!', visual: 'snail-step4' }
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
            dog: {
                name: 'Draw a Dog',
                icon: '🐕',
                steps: [
                    { text: 'Draw a circle for the head', visual: 'dog-step1' },
                    { text: 'Add two floppy ears', visual: 'dog-step2' },
                    { text: 'Draw an oval body', visual: 'dog-step3' },
                    { text: 'Add four legs', visual: 'dog-step4' },
                    { text: 'Draw eyes, nose, and tongue', visual: 'dog-step5' },
                    { text: 'Add a wagging tail. Woof!', visual: 'dog-step6' }
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
            boat: {
                name: 'Draw a Boat',
                icon: '⛵',
                steps: [
                    { text: 'Draw a curved line for the bottom', visual: 'boat-step1' },
                    { text: 'Add sides going up in a V shape', visual: 'boat-step2' },
                    { text: 'Draw a mast in the middle', visual: 'boat-step3' },
                    { text: 'Add a triangle sail', visual: 'boat-step4' },
                    { text: 'Draw waves below. Sail away!', visual: 'boat-step5' }
                ]
            },
            rocket: {
                name: 'Draw a Rocket',
                icon: '🚀',
                steps: [
                    { text: 'Draw a long rectangle for the body', visual: 'rocket-step1' },
                    { text: 'Add a triangle nose cone on top', visual: 'rocket-step2' },
                    { text: 'Draw two side fins', visual: 'rocket-step3' },
                    { text: 'Add a window circle', visual: 'rocket-step4' },
                    { text: 'Draw flames at the bottom. Blast off!', visual: 'rocket-step5' }
                ]
            }
        }
    },
    '7': {
        easy: {
            dinosaur: {
                name: 'Draw a Dinosaur',
                icon: '🦕',
                steps: [
                    { text: 'Draw a large oval for the body', visual: 'dinosaur-step1' },
                    { text: 'Add a long neck and small head', visual: 'dinosaur-step2' },
                    { text: 'Draw four thick legs', visual: 'dinosaur-step3' },
                    { text: 'Add a long tail', visual: 'dinosaur-step4' },
                    { text: 'Draw eye and spots. Roar!', visual: 'dinosaur-step5' }
                ]
            },
            elephant: {
                name: 'Draw an Elephant',
                icon: '🐘',
                steps: [
                    { text: 'Draw a big circle for the body', visual: 'elephant-step1' },
                    { text: 'Add a circle for the head', visual: 'elephant-step2' },
                    { text: 'Draw a long curved trunk', visual: 'elephant-step3' },
                    { text: 'Add big ears', visual: 'elephant-step4' },
                    { text: 'Draw four legs and eye. Trumpet!', visual: 'elephant-step5' }
                ]
            },
            giraffe: {
                name: 'Draw a Giraffe',
                icon: '🦒',
                steps: [
                    { text: 'Draw an oval for the body', visual: 'giraffe-step1' },
                    { text: 'Add a very long neck', visual: 'giraffe-step2' },
                    { text: 'Draw a small head at the top', visual: 'giraffe-step3' },
                    { text: 'Add four long legs', visual: 'giraffe-step4' },
                    { text: 'Draw spots all over. Tall!', visual: 'giraffe-step5' }
                ]
            }
        },
        medium: {
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
            },
            robot: {
                name: 'Draw a Robot',
                icon: '🤖',
                steps: [
                    { text: 'Draw a square for the head', visual: 'robot-step1' },
                    { text: 'Add two circle eyes and antenna', visual: 'robot-step2' },
                    { text: 'Draw a rectangle body', visual: 'robot-step3' },
                    { text: 'Add rectangle arms and hands', visual: 'robot-step4' },
                    { text: 'Draw rectangle legs', visual: 'robot-step5' },
                    { text: 'Add buttons and details. Beep boop!', visual: 'robot-step6' }
                ]
            },
            mushroom: {
                name: 'Draw a Mushroom',
                icon: '🍄',
                steps: [
                    { text: 'Draw a curved cap on top', visual: 'mushroom-step1' },
                    { text: 'Add a thick stem below', visual: 'mushroom-step2' },
                    { text: 'Draw lines under the cap', visual: 'mushroom-step3' },
                    { text: 'Add dots on the cap', visual: 'mushroom-step4' },
                    { text: 'Draw grass around it. Magical!', visual: 'mushroom-step5' }
                ]
            }
        },
        hard: {
            dragon: {
                name: 'Draw a Dragon',
                icon: '🐉',
                steps: [
                    { text: 'Draw a long serpent body', visual: 'dragon-step1' },
                    { text: 'Add a fierce head with horns', visual: 'dragon-step2' },
                    { text: 'Draw large wings on the back', visual: 'dragon-step3' },
                    { text: 'Add four clawed legs', visual: 'dragon-step4' },
                    { text: 'Draw a pointed tail', visual: 'dragon-step5' },
                    { text: 'Add scales and spikes', visual: 'dragon-step6' },
                    { text: 'Draw fire breath. Legendary!', visual: 'dragon-step7' }
                ]
            },
            unicorn: {
                name: 'Draw a Unicorn',
                icon: '🦄',
                steps: [
                    { text: 'Draw a horse head', visual: 'unicorn-step1' },
                    { text: 'Add a spiral horn on top', visual: 'unicorn-step2' },
                    { text: 'Draw the neck and body', visual: 'unicorn-step3' },
                    { text: 'Add four legs', visual: 'unicorn-step4' },
                    { text: 'Draw a flowing mane', visual: 'unicorn-step5' },
                    { text: 'Add a long tail', visual: 'unicorn-step6' },
                    { text: 'Add stars around it. Magical!', visual: 'unicorn-step7' }
                ]
            },
            owl: {
                name: 'Draw an Owl',
                icon: '🦉',
                steps: [
                    { text: 'Draw a large oval body', visual: 'owl-step1' },
                    { text: 'Add a rounded head on top', visual: 'owl-step2' },
                    { text: 'Draw two large circle eyes', visual: 'owl-step3' },
                    { text: 'Add ear tufts on top', visual: 'owl-step4' },
                    { text: 'Draw wings on sides', visual: 'owl-step5' },
                    { text: 'Add feet and beak', visual: 'owl-step6' },
                    { text: 'Draw feather details. Wise!', visual: 'owl-step7' }
                ]
            }
        }
    },
    '8': {
        easy: {
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
            shark: {
                name: 'Draw a Shark',
                icon: '🦈',
                steps: [
                    { text: 'Draw a torpedo-shaped body', visual: 'shark-step1' },
                    { text: 'Add a pointed nose', visual: 'shark-step2' },
                    { text: 'Draw a tall dorsal fin on top', visual: 'shark-step3' },
                    { text: 'Add a crescent tail', visual: 'shark-step4' },
                    { text: 'Draw side fins', visual: 'shark-step5' },
                    { text: 'Add eye and gills', visual: 'shark-step6' },
                    { text: 'Draw sharp teeth. Fierce!', visual: 'shark-step7' }
                ]
            },
            turtle: {
                name: 'Draw a Turtle',
                icon: '🐢',
                steps: [
                    { text: 'Draw an oval shell', visual: 'turtle-step1' },
                    { text: 'Add a hexagon pattern on shell', visual: 'turtle-step2' },
                    { text: 'Draw the head sticking out', visual: 'turtle-step3' },
                    { text: 'Add four flippers', visual: 'turtle-step4' },
                    { text: 'Draw a small tail', visual: 'turtle-step5' },
                    { text: 'Add eye and smile. Slow and steady!', visual: 'turtle-step6' }
                ]
            }
        },
        medium: {
            landscape: {
                name: 'Draw a Landscape',
                icon: '🏞️',
                steps: [
                    { text: 'Draw a horizon line across', visual: 'landscape-step1' },
                    { text: 'Add hills in the background', visual: 'landscape-step2' },
                    { text: 'Draw trees of different sizes', visual: 'landscape-step3' },
                    { text: 'Add a path or river', visual: 'landscape-step4' },
                    { text: 'Draw clouds in the sky', visual: 'landscape-step5' },
                    { text: 'Add grass and flowers', visual: 'landscape-step6' },
                    { text: 'Shade for depth. Scenic!', visual: 'landscape-step7' }
                ]
            },
            beach: {
                name: 'Draw a Beach Scene',
                icon: '🏖️',
                steps: [
                    { text: 'Draw the horizon line (sea meets sky)', visual: 'beach-step1' },
                    { text: 'Add waves in the water', visual: 'beach-step2' },
                    { text: 'Draw sand in the foreground', visual: 'beach-step3' },
                    { text: 'Add a palm tree', visual: 'beach-step4' },
                    { text: 'Draw a sun or clouds', visual: 'beach-step5' },
                    { text: 'Add beach items (umbrella, shells)', visual: 'beach-step6' },
                    { text: 'Shade the sand. Relaxing!', visual: 'beach-step7' }
                ]
            },
            garden: {
                name: 'Draw a Garden',
                icon: '🌺',
                steps: [
                    { text: 'Draw a fence at the back', visual: 'garden-step1' },
                    { text: 'Add different types of flowers', visual: 'garden-step2' },
                    { text: 'Draw tall sunflowers', visual: 'garden-step3' },
                    { text: 'Add bushes and shrubs', visual: 'garden-step4' },
                    { text: 'Draw a path through the garden', visual: 'garden-step5' },
                    { text: 'Add butterflies and bees', visual: 'garden-step6' },
                    { text: 'Color it bright. Blooming!', visual: 'garden-step7' }
                ]
            }
        },
        hard: {
            portrait: {
                name: 'Draw a Portrait Face',
                icon: '👤',
                steps: [
                    { text: 'Draw an oval for the head', visual: 'portrait-step1' },
                    { text: 'Add guidelines (cross in the center)', visual: 'portrait-step2' },
                    { text: 'Draw the eyes on the horizontal line', visual: 'portrait-step3' },
                    { text: 'Add the nose below center', visual: 'portrait-step4' },
                    { text: 'Draw the mouth', visual: 'portrait-step5' },
                    { text: 'Add ears on the sides', visual: 'portrait-step6' },
                    { text: 'Draw hair and refine features', visual: 'portrait-step7' },
                    { text: 'Shade for depth. Realistic!', visual: 'portrait-step8' }
                ]
            },
            figure: {
                name: 'Draw a Human Figure',
                icon: '🧍',
                steps: [
                    { text: 'Draw stick figure skeleton', visual: 'figure-step1' },
                    { text: 'Add oval head', visual: 'figure-step2' },
                    { text: 'Build torso with shapes', visual: 'figure-step3' },
                    { text: 'Add arms with joints', visual: 'figure-step4' },
                    { text: 'Draw legs with joints', visual: 'figure-step5' },
                    { text: 'Add hands and feet', visual: 'figure-step6' },
                    { text: 'Refine proportions', visual: 'figure-step7' },
                    { text: 'Add clothes and details', visual: 'figure-step8' }
                ]
            },
            dancer: {
                name: 'Draw a Dancer',
                icon: '💃',
                steps: [
                    { text: 'Draw action pose skeleton', visual: 'dancer-step1' },
                    { text: 'Show movement with curved lines', visual: 'dancer-step2' },
                    { text: 'Add head with tilt', visual: 'dancer-step3' },
                    { text: 'Draw flowing body shapes', visual: 'dancer-step4' },
                    { text: 'Add extended arms', visual: 'dancer-step5' },
                    { text: 'Draw legs in motion', visual: 'dancer-step6' },
                    { text: 'Add flowing costume', visual: 'dancer-step7' },
                    { text: 'Shade for movement. Graceful!', visual: 'dancer-step8' }
                ]
            }
        }
    },
    '9+': {
        easy: {
            cartoon: {
                name: 'Draw a Cartoon Character',
                icon: '😄',
                steps: [
                    { text: 'Draw large expressive eyes', visual: 'cartoon-step1' },
                    { text: 'Add simple head shape', visual: 'cartoon-step2' },
                    { text: 'Draw exaggerated features', visual: 'cartoon-step3' },
                    { text: 'Add simplified body', visual: 'cartoon-step4' },
                    { text: 'Draw with bold lines', visual: 'cartoon-step5' },
                    { text: 'Add personality pose', visual: 'cartoon-step6' },
                    { text: 'Color with flat colors. Fun!', visual: 'cartoon-step7' }
                ]
            },
            manga: {
                name: 'Draw Manga Eyes',
                icon: '👁️',
                steps: [
                    { text: 'Draw large oval shape', visual: 'manga-step1' },
                    { text: 'Add thick upper eyelid', visual: 'manga-step2' },
                    { text: 'Draw large pupil', visual: 'manga-step3' },
                    { text: 'Add multiple highlights', visual: 'manga-step4' },
                    { text: 'Draw eyelashes', visual: 'manga-step5' },
                    { text: 'Shade the iris', visual: 'manga-step6' },
                    { text: 'Add emotion. Expressive!', visual: 'manga-step7' }
                ]
            },
            chibi: {
                name: 'Draw Chibi Style',
                icon: '🧒',
                steps: [
                    { text: 'Draw huge head (2/3 of body)', visual: 'chibi-step1' },
                    { text: 'Add big cute eyes', visual: 'chibi-step2' },
                    { text: 'Draw tiny body', visual: 'chibi-step3' },
                    { text: 'Add short limbs', visual: 'chibi-step4' },
                    { text: 'Keep features simple', visual: 'chibi-step5' },
                    { text: 'Add cute accessories', visual: 'chibi-step6' },
                    { text: 'Color brightly. Adorable!', visual: 'chibi-step7' }
                ]
            }
        },
        medium: {
            perspective: {
                name: 'Draw in Perspective',
                icon: '📐',
                steps: [
                    { text: 'Draw horizon line', visual: 'perspective-step1' },
                    { text: 'Mark vanishing point', visual: 'perspective-step2' },
                    { text: 'Draw guidelines to point', visual: 'perspective-step3' },
                    { text: 'Sketch box in perspective', visual: 'perspective-step4' },
                    { text: 'Add more boxes', visual: 'perspective-step5' },
                    { text: 'Draw building from boxes', visual: 'perspective-step6' },
                    { text: 'Add details', visual: 'perspective-step7' },
                    { text: 'Create depth. Dimensional!', visual: 'perspective-step8' }
                ]
            },
            shading: {
                name: 'Master Shading',
                icon: '🎨',
                steps: [
                    { text: 'Draw a sphere outline', visual: 'shading-step1' },
                    { text: 'Identify light source', visual: 'shading-step2' },
                    { text: 'Mark highlight area', visual: 'shading-step3' },
                    { text: 'Add midtones', visual: 'shading-step4' },
                    { text: 'Darken shadow side', visual: 'shading-step5' },
                    { text: 'Add cast shadow', visual: 'shading-step6' },
                    { text: 'Blend smoothly', visual: 'shading-step7' },
                    { text: 'Create 3D effect. Realistic!', visual: 'shading-step8' }
                ]
            },
            shadows: {
                name: 'Draw Shadows',
                icon: '🌗',
                steps: [
                    { text: 'Draw simple object', visual: 'shadows-step1' },
                    { text: 'Choose light direction', visual: 'shadows-step2' },
                    { text: 'Find shadow angle', visual: 'shadows-step3' },
                    { text: 'Draw shadow shape', visual: 'shadows-step4' },
                    { text: 'Fade shadow away from object', visual: 'shadows-step5' },
                    { text: 'Add ambient occlusion', visual: 'shadows-step6' },
                    { text: 'Blend naturally. Grounded!', visual: 'shadows-step7' }
                ]
            }
        },
        hard: {
            detailed: {
                name: 'Draw Detailed Animal',
                icon: '🦁',
                steps: [
                    { text: 'Study animal anatomy', visual: 'detailed-step1' },
                    { text: 'Sketch basic structure', visual: 'detailed-step2' },
                    { text: 'Add muscle definition', visual: 'detailed-step3' },
                    { text: 'Draw fur/feather direction', visual: 'detailed-step4' },
                    { text: 'Add detailed textures', visual: 'detailed-step5' },
                    { text: 'Render eyes with life', visual: 'detailed-step6' },
                    { text: 'Shade for volume', visual: 'detailed-step7' },
                    { text: 'Add fine details. Lifelike!', visual: 'detailed-step8' }
                ]
            },
            stilllife: {
                name: 'Draw Still Life',
                icon: '🍎',
                steps: [
                    { text: 'Arrange objects', visual: 'stilllife-step1' },
                    { text: 'Sketch composition', visual: 'stilllife-step2' },
                    { text: 'Get proportions right', visual: 'stilllife-step3' },
                    { text: 'Study light and shadow', visual: 'stilllife-step4' },
                    { text: 'Add surface textures', visual: 'stilllife-step5' },
                    { text: 'Render reflections', visual: 'stilllife-step6' },
                    { text: 'Shade with gradients', visual: 'stilllife-step7' },
                    { text: 'Add fine details. Artistic!', visual: 'stilllife-step8' }
                ]
            },
            scene: {
                name: 'Draw Complex Scene',
                icon: '🖼️',
                steps: [
                    { text: 'Plan composition', visual: 'scene-step1' },
                    { text: 'Establish perspective', visual: 'scene-step2' },
                    { text: 'Block in major shapes', visual: 'scene-step3' },
                    { text: 'Add middle ground elements', visual: 'scene-step4' },
                    { text: 'Detail foreground', visual: 'scene-step5' },
                    { text: 'Create atmospheric depth', visual: 'scene-step6' },
                    { text: 'Add lighting mood', visual: 'scene-step7' },
                    { text: 'Final details and polish', visual: 'scene-step8' },
                    { text: 'Complete artwork. Masterpiece!', visual: 'scene-step9' }
                ]
            }
        }
    },
    '10+': {
        easy: {
            anatomy: {
                name: 'Draw Anatomy Basics',
                icon: '🦴',
                steps: [
                    { text: 'Study skeletal structure', visual: 'anatomy-step1' },
                    { text: 'Learn muscle groups', visual: 'anatomy-step2' },
                    { text: 'Understand proportions (8 heads tall)', visual: 'anatomy-step3' },
                    { text: 'Draw simplified skeleton', visual: 'anatomy-step4' },
                    { text: 'Add muscle masses', visual: 'anatomy-step5' },
                    { text: 'Study joint movement', visual: 'anatomy-step6' },
                    { text: 'Practice different poses', visual: 'anatomy-step7' },
                    { text: 'Apply to figure drawing. Foundation!', visual: 'anatomy-step8' }
                ]
            },
            gesture: {
                name: 'Draw Gesture & Movement',
                icon: '🏃',
                steps: [
                    { text: 'Capture action line (line of motion)', visual: 'gesture-step1' },
                    { text: 'Draw quickly (30 seconds)', visual: 'gesture-step2' },
                    { text: 'Show weight distribution', visual: 'gesture-step3' },
                    { text: 'Emphasize flow', visual: 'gesture-step4' },
                    { text: 'Keep it loose', visual: 'gesture-step5' },
                    { text: 'Capture energy', visual: 'gesture-step6' },
                    { text: 'Practice many poses', visual: 'gesture-step7' },
                    { text: 'Build visual library. Dynamic!', visual: 'gesture-step8' }
                ]
            },
            proportions: {
                name: 'Master Proportions',
                icon: '📏',
                steps: [
                    { text: 'Learn head measurement unit', visual: 'proportions-step1' },
                    { text: 'Adult is 7.5-8 heads tall', visual: 'proportions-step2' },
                    { text: 'Eyes are halfway down head', visual: 'proportions-step3' },
                    { text: 'Shoulders are 2-3 heads wide', visual: 'proportions-step4' },
                    { text: 'Arms reach mid-thigh', visual: 'proportions-step5' },
                    { text: 'Legs are half total height', visual: 'proportions-step6' },
                    { text: 'Study male vs female differences', visual: 'proportions-step7' },
                    { text: 'Apply to drawing. Accurate!', visual: 'proportions-step8' }
                ]
            }
        },
        medium: {
            realistic: {
                name: 'Draw Realistic Portrait',
                icon: '👩',
                steps: [
                    { text: 'Study facial anatomy', visual: 'realistic-step1' },
                    { text: 'Get proportions exact', visual: 'realistic-step2' },
                    { text: 'Map features carefully', visual: 'realistic-step3' },
                    { text: 'Draw structure first', visual: 'realistic-step4' },
                    { text: 'Add skin texture', visual: 'realistic-step5' },
                    { text: 'Render eyes with depth', visual: 'realistic-step6' },
                    { text: 'Master hair flow', visual: 'realistic-step7' },
                    { text: 'Shade for form', visual: 'realistic-step8' },
                    { text: 'Capture likeness. Photorealistic!', visual: 'realistic-step9' }
                ]
            },
            expression: {
                name: 'Draw Facial Expressions',
                icon: '😊😢😠',
                steps: [
                    { text: 'Study emotion muscles', visual: 'expression-step1' },
                    { text: 'Draw neutral face', visual: 'expression-step2' },
                    { text: 'Learn happiness (raise cheeks)', visual: 'expression-step3' },
                    { text: 'Draw sadness (lower features)', visual: 'expression-step4' },
                    { text: 'Show anger (furrow brows)', visual: 'expression-step5' },
                    { text: 'Surprise (raise brows, open mouth)', visual: 'expression-step6' },
                    { text: 'Practice subtle emotions', visual: 'expression-step7' },
                    { text: 'Combine multiple feelings', visual: 'expression-step8' },
                    { text: 'Convey personality. Expressive!', visual: 'expression-step9' }
                ]
            },
            hands: {
                name: 'Draw Hands',
                icon: '✋',
                steps: [
                    { text: 'Study hand bone structure', visual: 'hands-step1' },
                    { text: 'Break into basic shapes', visual: 'hands-step2' },
                    { text: 'Palm is square', visual: 'hands-step3' },
                    { text: 'Fingers have 3 segments', visual: 'hands-step4' },
                    { text: 'Thumb is 2 segments', visual: 'hands-step5' },
                    { text: 'Draw from different angles', visual: 'hands-step6' },
                    { text: 'Practice various gestures', visual: 'hands-step7' },
                    { text: 'Add knuckles and details', visual: 'hands-step8' },
                    { text: 'Master foreshortening. Challenging!', visual: 'hands-step9' }
                ]
            }
        },
        hard: {
            composition: {
                name: 'Master Composition',
                icon: '🎭',
                steps: [
                    { text: 'Learn rule of thirds', visual: 'composition-step1' },
                    { text: 'Create focal point', visual: 'composition-step2' },
                    { text: 'Use leading lines', visual: 'composition-step3' },
                    { text: 'Balance elements', visual: 'composition-step4' },
                    { text: 'Control negative space', visual: 'composition-step5' },
                    { text: 'Create depth layers', visual: 'composition-step6' },
                    { text: 'Guide viewer\'s eye', visual: 'composition-step7' },
                    { text: 'Establish mood', visual: 'composition-step8' },
                    { text: 'Refine and polish', visual: 'composition-step9' },
                    { text: 'Complete vision. Professional!', visual: 'composition-step10' }
                ]
            },
            lighting: {
                name: 'Master Light Study',
                icon: '💡',
                steps: [
                    { text: 'Understand light types', visual: 'lighting-step1' },
                    { text: 'Study direct light', visual: 'lighting-step2' },
                    { text: 'Learn diffuse light', visual: 'lighting-step3' },
                    { text: 'Master rim lighting', visual: 'lighting-step4' },
                    { text: 'Create mood with color temperature', visual: 'lighting-step5' },
                    { text: 'Render form with light', visual: 'lighting-step6' },
                    { text: 'Add atmospheric effects', visual: 'lighting-step7' },
                    { text: 'Study time of day', visual: 'lighting-step8' },
                    { text: 'Control contrast', visual: 'lighting-step9' },
                    { text: 'Master dramatic lighting. Cinematic!', visual: 'lighting-step10' }
                ]
            },
            final: {
                name: 'Create Final Artwork',
                icon: '🖌️',
                steps: [
                    { text: 'Develop concept and story', visual: 'final-step1' },
                    { text: 'Research and gather references', visual: 'final-step2' },
                    { text: 'Create thumbnail compositions', visual: 'final-step3' },
                    { text: 'Refine chosen composition', visual: 'final-step4' },
                    { text: 'Create detailed sketch', visual: 'final-step5' },
                    { text: 'Plan lighting and colors', visual: 'final-step6' },
                    { text: 'Render with technique', visual: 'final-step7' },
                    { text: 'Add textures and details', visual: 'final-step8' },
                    { text: 'Polish and refine', visual: 'final-step9' },
                    { text: 'Add final touches', visual: 'final-step10' },
                    { text: 'Complete masterpiece. Portfolio ready!', visual: 'final-step11' }
                ]
            }
        }
    }
};

// Convert age-based drawing tutorials to level-based structure
function buildLevelBasedDrawingTutorials() {
    const levelTutorials = {};

    for (const ageGroup in ageBasedDrawingTutorials) {
        for (const difficulty in ageBasedDrawingTutorials[ageGroup]) {
            const level = ageAndDifficultyToLevel(ageGroup, difficulty);
            const key = `level${level}`;

            const tutorials = ageBasedDrawingTutorials[ageGroup][difficulty];
            levelTutorials[key] = {};

            // Copy each tutorial with level metadata
            for (const tutorialKey in tutorials) {
                levelTutorials[key][tutorialKey] = {
                    ...tutorials[tutorialKey],
                    level: level,
                    ageEquivalent: ageGroup,
                    difficultyEquivalent: difficulty
                };
            }
        }
    }
    return levelTutorials;
}

const drawingTutorials = buildLevelBasedDrawingTutorials();

// Helper functions for tutorial access
function getTutorialsByLevel(level) {
    return drawingTutorials[`level${level}`] || {};
}

function getTutorialsByAge(ageGroup, difficulty) {
    const level = ageAndDifficultyToLevel(ageGroup, difficulty);
    return getTutorialsByLevel(level);
}

// Helper to get specific tutorial
function getTutorial(ageGroup, difficulty, tutorialKey) {
    const tutorials = getTutorialsByAge(ageGroup, difficulty);
    return tutorials[tutorialKey];
}

/**
 * SVG Drawing Functions - Generate visual guides for each step
 */
const visualGuides = {
    // CIRCLE
    'circle-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="3" fill="blue" />
            <text x="170" y="155" fill="blue" font-size="16" font-weight="bold">← Start here</text>
        </svg>
    `,
    'circle-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 150 100 A 50 50 0 0 1 200 150" stroke="blue" stroke-width="4" fill="none" stroke-linecap="round"/>
            <circle cx="150" cy="100" r="3" fill="blue" />
            <path d="M 195 145 L 205 150 L 195 155" fill="blue"/>
        </svg>
    `,
    'circle-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 150 100 A 50 50 0 1 1 100 150" stroke="blue" stroke-width="4" fill="none" stroke-linecap="round"/>
            <circle cx="150" cy="100" r="3" fill="blue" />
            <path d="M 95 150 L 90 140 L 100 145" fill="blue"/>
        </svg>
    `,
    'circle-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <path d="M 150 100 A 50 50 0 1 1 145 100" stroke="blue" stroke-width="4" fill="none" stroke-linecap="round"/>
            <circle cx="150" cy="100" r="3" fill="blue" />
            <circle cx="145" cy="100" r="3" fill="blue" />
            <path d="M 150 95 L 145 90 L 155 90" fill="blue"/>
        </svg>
    `,
    'circle-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="80" stroke="black" stroke-width="5" fill="none"/>
            <text x="150" y="160" text-anchor="middle" fill="green" font-size="24" font-weight="bold">✓</text>
        </svg>
    `,

    // SUN
    'sun-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'sun-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="black" stroke-width="4" fill="none"/>
            <line x1="150" y1="80" x2="150" y2="50" stroke="blue" stroke-width="4" stroke-linecap="round"/>
            <line x1="150" y1="220" x2="150" y2="250" stroke="blue" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="150" x2="50" y2="150" stroke="blue" stroke-width="4" stroke-linecap="round"/>
            <line x1="220" y1="150" x2="250" y2="150" stroke="blue" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `,
    'sun-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="black" stroke-width="4" fill="none"/>
            <line x1="150" y1="80" x2="150" y2="50" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="150" y1="220" x2="150" y2="250" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="150" x2="50" y2="150" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="220" y1="150" x2="250" y2="150" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="100" x2="75" y2="75" stroke="blue" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="100" x2="225" y2="75" stroke="blue" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="200" x2="75" y2="225" stroke="blue" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="200" x2="225" y2="225" stroke="blue" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `,
    'sun-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="black" stroke-width="4" fill="none"/>
            <line x1="150" y1="80" x2="150" y2="50" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="150" y1="220" x2="150" y2="250" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="150" x2="50" y2="150" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="220" y1="150" x2="250" y2="150" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="100" x2="75" y2="75" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="100" x2="225" y2="75" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="200" x2="75" y2="225" stroke="black" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="200" x2="225" y2="225" stroke="black" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `,
    'sun-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="150" r="40" stroke="black" stroke-width="4" fill="yellow"/>
            <line x1="150" y1="80" x2="150" y2="50" stroke="orange" stroke-width="4" stroke-linecap="round"/>
            <line x1="150" y1="220" x2="150" y2="250" stroke="orange" stroke-width="4" stroke-linecap="round"/>
            <line x1="80" y1="150" x2="50" y2="150" stroke="orange" stroke-width="4" stroke-linecap="round"/>
            <line x1="220" y1="150" x2="250" y2="150" stroke="orange" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="100" x2="75" y2="75" stroke="orange" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="100" x2="225" y2="75" stroke="orange" stroke-width="4" stroke-linecap="round"/>
            <line x1="100" y1="200" x2="75" y2="225" stroke="orange" stroke-width="4" stroke-linecap="round"/>
            <line x1="200" y1="200" x2="225" y2="225" stroke="orange" stroke-width="4" stroke-linecap="round"/>
            <circle cx="135" cy="140" r="5" fill="black"/>
            <circle cx="165" cy="140" r="5" fill="black"/>
            <path d="M 130 160 Q 150 170 170 160" stroke="black" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>
    `,

    // HOUSE
    'house-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'house-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 60 100 L 150 40 L 240 100 Z" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'house-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 60 100 L 150 40 L 240 100 Z" stroke="black" stroke-width="4" fill="none"/>
            <rect x="125" y="180" width="50" height="70" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'house-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 60 100 L 150 40 L 240 100 Z" stroke="black" stroke-width="4" fill="none"/>
            <rect x="125" y="180" width="50" height="70" stroke="black" stroke-width="4" fill="none"/>
            <rect x="85" y="120" width="30" height="30" stroke="blue" stroke-width="3" fill="none"/>
            <rect x="185" y="120" width="30" height="30" stroke="blue" stroke-width="3" fill="none"/>
        </svg>
    `,
    'house-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="75" y="100" width="150" height="150" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 60 100 L 150 40 L 240 100 Z" stroke="black" stroke-width="4" fill="red"/>
            <rect x="125" y="180" width="50" height="70" stroke="black" stroke-width="4" fill="brown"/>
            <rect x="85" y="120" width="30" height="30" stroke="black" stroke-width="3" fill="none"/>
            <rect x="185" y="120" width="30" height="30" stroke="black" stroke-width="3" fill="none"/>
            <circle cx="160" cy="215" r="4" fill="black"/>
        </svg>
    `,

    // TREE
    'tree-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <line x1="130" y1="150" x2="130" y2="250" stroke="blue" stroke-width="4"/>
            <line x1="170" y1="150" x2="170" y2="250" stroke="blue" stroke-width="4"/>
        </svg>
    `,
    'tree-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <line x1="130" y1="150" x2="130" y2="250" stroke="black" stroke-width="4"/>
            <line x1="170" y1="150" x2="170" y2="250" stroke="black" stroke-width="4"/>
            <line x1="130" y1="250" x2="170" y2="250" stroke="blue" stroke-width="4"/>
        </svg>
    `,
    'tree-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <line x1="130" y1="150" x2="130" y2="250" stroke="black" stroke-width="4"/>
            <line x1="170" y1="150" x2="170" y2="250" stroke="black" stroke-width="4"/>
            <line x1="130" y1="250" x2="170" y2="250" stroke="black" stroke-width="4"/>
            <ellipse cx="150" cy="100" rx="70" ry="60" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'tree-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <line x1="130" y1="150" x2="130" y2="250" stroke="black" stroke-width="4"/>
            <line x1="170" y1="150" x2="170" y2="250" stroke="black" stroke-width="4"/>
            <line x1="130" y1="250" x2="170" y2="250" stroke="black" stroke-width="4"/>
            <ellipse cx="150" cy="100" rx="70" ry="60" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'tree-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="130" y="150" width="40" height="100" stroke="black" stroke-width="4" fill="#8b4513"/>
            <line x1="140" y1="170" x2="140" y2="230" stroke="#5a3410" stroke-width="2"/>
            <line x1="160" y1="180" x2="160" y2="240" stroke="#5a3410" stroke-width="2"/>
            <ellipse cx="150" cy="100" rx="70" ry="60" stroke="black" stroke-width="4" fill="#90EE90"/>
        </svg>
    `,

    // FLOWER
    'flower-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="100" r="15" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'flower-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="100" r="15" stroke="black" stroke-width="4" fill="none"/>
            <ellipse cx="150" cy="70" rx="12" ry="20" stroke="blue" stroke-width="3" fill="none"/>
            <ellipse cx="150" cy="130" rx="12" ry="20" stroke="blue" stroke-width="3" fill="none"/>
            <ellipse cx="120" cy="100" rx="20" ry="12" stroke="blue" stroke-width="3" fill="none"/>
            <ellipse cx="180" cy="100" rx="20" ry="12" stroke="blue" stroke-width="3" fill="none"/>
            <ellipse cx="170" cy="80" rx="15" ry="15" stroke="blue" stroke-width="3" fill="none" transform="rotate(45 170 80)"/>
        </svg>
    `,
    'flower-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="70" rx="12" ry="20" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="150" cy="130" rx="12" ry="20" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="120" cy="100" rx="20" ry="12" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="180" cy="100" rx="20" ry="12" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="170" cy="80" rx="15" ry="15" stroke="black" stroke-width="3" fill="none" transform="rotate(45 170 80)"/>
            <circle cx="150" cy="100" r="15" stroke="black" stroke-width="4" fill="none"/>
        </svg>
    `,
    'flower-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="70" rx="12" ry="20" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="150" cy="130" rx="12" ry="20" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="120" cy="100" rx="20" ry="12" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="180" cy="100" rx="20" ry="12" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="170" cy="80" rx="15" ry="15" stroke="black" stroke-width="3" fill="none" transform="rotate(45 170 80)"/>
            <circle cx="150" cy="100" r="15" stroke="black" stroke-width="4" fill="none"/>
            <line x1="150" y1="115" x2="150" y2="250" stroke="blue" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `,
    'flower-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="70" rx="12" ry="20" stroke="black" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="150" cy="130" rx="12" ry="20" stroke="black" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="120" cy="100" rx="20" ry="12" stroke="black" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="180" cy="100" rx="20" ry="12" stroke="black" stroke-width="3" fill="#ff69b4"/>
            <ellipse cx="170" cy="80" rx="15" ry="15" stroke="black" stroke-width="3" fill="#ff69b4" transform="rotate(45 170 80)"/>
            <circle cx="150" cy="100" r="15" stroke="black" stroke-width="4" fill="#ffd93d"/>
            <line x1="150" y1="115" x2="150" y2="250" stroke="green" stroke-width="4" stroke-linecap="round"/>
            <ellipse cx="120" cy="180" rx="25" ry="15" stroke="green" stroke-width="3" fill="#90EE90" transform="rotate(-30 120 180)"/>
            <ellipse cx="180" cy="200" rx="25" ry="15" stroke="green" stroke-width="3" fill="#90EE90" transform="rotate(30 180 200)"/>
        </svg>
    `,

    // CAT
    'cat-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'cat-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="blue" stroke-width="3" fill="none"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="blue" stroke-width="3" fill="none"/>
        </svg>
    `,
    'cat-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="150" cy="180" rx="50" ry="40" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'cat-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="150" cy="180" rx="50" ry="40" stroke="black" stroke-width="4" fill="none"/>
            <line x1="120" y1="200" x2="120" y2="250" stroke="blue" stroke-width="4"/>
            <line x1="140" y1="200" x2="140" y2="250" stroke="blue" stroke-width="4"/>
            <line x1="160" y1="200" x2="160" y2="250" stroke="blue" stroke-width="4"/>
            <line x1="180" y1="200" x2="180" y2="250" stroke="blue" stroke-width="4"/>
        </svg>
    `,
    'cat-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="black" stroke-width="3" fill="none"/>
            <ellipse cx="150" cy="180" rx="50" ry="40" stroke="black" stroke-width="4" fill="none"/>
            <line x1="120" y1="200" x2="120" y2="250" stroke="black" stroke-width="4"/>
            <line x1="140" y1="200" x2="140" y2="250" stroke="black" stroke-width="4"/>
            <line x1="160" y1="200" x2="160" y2="250" stroke="black" stroke-width="4"/>
            <line x1="180" y1="200" x2="180" y2="250" stroke="black" stroke-width="4"/>
            <circle cx="135" cy="115" r="4" fill="blue"/>
            <circle cx="165" cy="115" r="4" fill="blue"/>
            <path d="M 145 125 L 150 130 L 155 125" stroke="blue" stroke-width="2" fill="none"/>
        </svg>
    `,
    'cat-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <circle cx="150" cy="120" r="40" stroke="black" stroke-width="4" fill="#ffa500"/>
            <path d="M 120 90 L 110 60 L 130 85 Z" stroke="black" stroke-width="3" fill="#ffa500"/>
            <path d="M 180 90 L 190 60 L 170 85 Z" stroke="black" stroke-width="3" fill="#ffa500"/>
            <ellipse cx="150" cy="180" rx="50" ry="40" stroke="black" stroke-width="4" fill="#ffa500"/>
            <line x1="120" y1="200" x2="120" y2="250" stroke="black" stroke-width="4"/>
            <line x1="140" y1="200" x2="140" y2="250" stroke="black" stroke-width="4"/>
            <line x1="160" y1="200" x2="160" y2="250" stroke="black" stroke-width="4"/>
            <line x1="180" y1="200" x2="180" y2="250" stroke="black" stroke-width="4"/>
            <circle cx="135" cy="115" r="4" fill="#333"/>
            <circle cx="165" cy="115" r="4" fill="#333"/>
            <path d="M 145 125 L 150 130 L 155 125" stroke="#333" stroke-width="2" fill="none"/>
            <line x1="110" y1="120" x2="80" y2="115" stroke="#333" stroke-width="2"/>
            <line x1="110" y1="125" x2="80" y2="125" stroke="#333" stroke-width="2"/>
            <line x1="110" y1="130" x2="80" y2="135" stroke="#333" stroke-width="2"/>
            <line x1="190" y1="120" x2="220" y2="115" stroke="#333" stroke-width="2"/>
            <line x1="190" y1="125" x2="220" y2="125" stroke="#333" stroke-width="2"/>
            <line x1="190" y1="130" x2="220" y2="135" stroke="#333" stroke-width="2"/>
            <path d="M 190 170 Q 220 160 240 180" stroke="black" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>
    `,

    // CAR
    'car-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'car-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" stroke="black" stroke-width="4" fill="none"/>
            <rect x="90" y="110" width="120" height="40" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'car-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" rx="10" ry="10" stroke="black" stroke-width="4" fill="none"/>
            <rect x="90" y="110" width="120" height="40" rx="5" ry="5" stroke="black" stroke-width="4" fill="none"/>
        </svg>
    `,
    'car-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" rx="10" ry="10" stroke="black" stroke-width="4" fill="none"/>
            <rect x="90" y="110" width="120" height="40" rx="5" ry="5" stroke="black" stroke-width="4" fill="none"/>
            <circle cx="100" cy="210" r="25" stroke="blue" stroke-width="4" fill="none"/>
            <circle cx="200" cy="210" r="25" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'car-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" rx="10" ry="10" stroke="black" stroke-width="4" fill="none"/>
            <rect x="90" y="110" width="120" height="40" rx="5" ry="5" stroke="black" stroke-width="4" fill="none"/>
            <circle cx="100" cy="210" r="25" stroke="black" stroke-width="4" fill="none"/>
            <circle cx="200" cy="210" r="25" stroke="black" stroke-width="4" fill="none"/>
            <circle cx="100" cy="210" r="10" stroke="blue" stroke-width="3" fill="none"/>
            <circle cx="200" cy="210" r="10" stroke="blue" stroke-width="3" fill="none"/>
        </svg>
    `,
    'car-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="50" y="150" width="200" height="60" rx="10" ry="10" stroke="black" stroke-width="4" fill="#e74c3c"/>
            <rect x="90" y="110" width="120" height="40" rx="5" ry="5" stroke="black" stroke-width="4" fill="#87ceeb"/>
            <line x1="150" y1="110" x2="150" y2="150" stroke="black" stroke-width="3"/>
            <circle cx="100" cy="210" r="25" stroke="black" stroke-width="4" fill="#333"/>
            <circle cx="200" cy="210" r="25" stroke="black" stroke-width="4" fill="#333"/>
            <circle cx="100" cy="210" r="10" stroke="#ddd" stroke-width="3" fill="none"/>
            <circle cx="200" cy="210" r="10" stroke="#ddd" stroke-width="3" fill="none"/>
            <rect x="50" y="165" width="15" height="10" stroke="black" stroke-width="2" fill="#ffd93d"/>
            <rect x="235" y="165" width="15" height="10" stroke="black" stroke-width="2" fill="#ffd93d"/>
        </svg>
    `,

    // BUTTERFLY
    'butterfly-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'butterfly-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="black" stroke-width="4" fill="none"/>
            <circle cx="150" cy="120" r="10" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'butterfly-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="black" stroke-width="4" fill="none"/>
            <circle cx="150" cy="120" r="10" stroke="black" stroke-width="4" fill="none"/>
            <line x1="145" y1="115" x2="130" y2="90" stroke="blue" stroke-width="3"/>
            <circle cx="130" cy="90" r="3" fill="blue"/>
            <line x1="155" y1="115" x2="170" y2="90" stroke="blue" stroke-width="3"/>
            <circle cx="170" cy="90" r="3" fill="blue"/>
        </svg>
    `,
    'butterfly-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="black" stroke-width="4" fill="none"/>
            <circle cx="150" cy="120" r="10" stroke="black" stroke-width="4" fill="none"/>
            <line x1="145" y1="115" x2="130" y2="90" stroke="black" stroke-width="3"/>
            <circle cx="130" cy="90" r="3" fill="black"/>
            <line x1="155" y1="115" x2="170" y2="90" stroke="black" stroke-width="3"/>
            <circle cx="170" cy="90" r="3" fill="black"/>
            <ellipse cx="100" cy="140" rx="35" ry="25" stroke="blue" stroke-width="4" fill="none"/>
            <ellipse cx="100" cy="170" rx="30" ry="20" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'butterfly-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="black" stroke-width="4" fill="none"/>
            <circle cx="150" cy="120" r="10" stroke="black" stroke-width="4" fill="none"/>
            <line x1="145" y1="115" x2="130" y2="90" stroke="black" stroke-width="3"/>
            <circle cx="130" cy="90" r="3" fill="black"/>
            <line x1="155" y1="115" x2="170" y2="90" stroke="black" stroke-width="3"/>
            <circle cx="170" cy="90" r="3" fill="black"/>
            <ellipse cx="100" cy="140" rx="35" ry="25" stroke="black" stroke-width="4" fill="none"/>
            <ellipse cx="100" cy="170" rx="30" ry="20" stroke="black" stroke-width="4" fill="none"/>
            <ellipse cx="200" cy="140" rx="35" ry="25" stroke="blue" stroke-width="4" fill="none"/>
            <ellipse cx="200" cy="170" rx="30" ry="20" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'butterfly-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="8" ry="35" stroke="black" stroke-width="4" fill="#333"/>
            <circle cx="150" cy="120" r="10" stroke="black" stroke-width="4" fill="#333"/>
            <line x1="145" y1="115" x2="130" y2="90" stroke="black" stroke-width="3"/>
            <circle cx="130" cy="90" r="3" fill="black"/>
            <line x1="155" y1="115" x2="170" y2="90" stroke="black" stroke-width="3"/>
            <circle cx="170" cy="90" r="3" fill="black"/>
            <ellipse cx="100" cy="140" rx="35" ry="25" stroke="black" stroke-width="4" fill="#ff69b4"/>
            <ellipse cx="100" cy="170" rx="30" ry="20" stroke="black" stroke-width="4" fill="#9370db"/>
            <ellipse cx="200" cy="140" rx="35" ry="25" stroke="black" stroke-width="4" fill="#ff69b4"/>
            <ellipse cx="200" cy="170" rx="30" ry="20" stroke="black" stroke-width="4" fill="#9370db"/>
            <circle cx="90" cy="135" r="6" fill="#ffd93d"/>
            <circle cx="105" cy="140" r="4" fill="#fff"/>
            <circle cx="190" cy="135" r="6" fill="#ffd93d"/>
            <circle cx="205" cy="140" r="4" fill="#fff"/>
        </svg>
    `,

    // DOLPHIN - redesigned with clearer steps
    'dolphin-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="80" ry="30" stroke="blue" stroke-width="4" fill="none" transform="rotate(-10 150 150)"/>
            <text x="90" y="200" fill="blue" font-size="14">← Draw curved body shape</text>
        </svg>
    `,
    'dolphin-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="80" ry="30" stroke="black" stroke-width="3" fill="none" transform="rotate(-10 150 150)"/>
            <path d="M 220 135 Q 245 130 250 140" stroke="blue" stroke-width="4" fill="none"/>
            <text x="210" y="115" fill="blue" font-size="14">Add beak →</text>
        </svg>
    `,
    'dolphin-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="80" ry="30" stroke="black" stroke-width="3" fill="none" transform="rotate(-10 150 150)"/>
            <path d="M 220 135 Q 245 130 250 140" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 160 140 L 170 100 L 165 140" stroke="blue" stroke-width="4" fill="none"/>
            <text x="140" y="90" fill="blue" font-size="14">Dorsal fin ↑</text>
        </svg>
    `,
    'dolphin-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="80" ry="30" stroke="black" stroke-width="3" fill="none" transform="rotate(-10 150 150)"/>
            <path d="M 220 135 Q 245 130 250 140" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 160 140 L 170 100 L 165 140" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 70 155 L 45 140 L 50 165 L 45 180 L 65 170 Z" stroke="blue" stroke-width="3" fill="none"/>
            <text x="20" y="160" fill="blue" font-size="14">← Tail fins</text>
        </svg>
    `,
    'dolphin-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="80" ry="30" stroke="black" stroke-width="3" fill="none" transform="rotate(-10 150 150)"/>
            <path d="M 220 135 Q 245 130 250 140" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 160 140 L 170 100 L 165 140" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 70 155 L 45 140 L 50 165 L 45 180 L 65 170 Z" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 110 165 L 100 185 L 120 170" stroke="blue" stroke-width="3" fill="none"/>
            <path d="M 190 165 L 200 185 L 180 170" stroke="blue" stroke-width="3" fill="none"/>
            <text x="95" y="205" fill="blue" font-size="14">Side flippers ↓</text>
        </svg>
    `,
    'dolphin-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="80" ry="30" stroke="black" stroke-width="3" fill="none" transform="rotate(-10 150 150)"/>
            <path d="M 220 135 Q 245 130 250 140" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 160 140 L 170 100 L 165 140" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 70 155 L 45 140 L 50 165 L 45 180 L 65 170 Z" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 110 165 L 100 185 L 120 170" stroke="black" stroke-width="3" fill="none"/>
            <path d="M 190 165 L 200 185 L 180 170" stroke="black" stroke-width="3" fill="none"/>
            <circle cx="235" cy="137" r="5" fill="blue"/>
            <path d="M 225 145 Q 235 148 245 145" stroke="blue" stroke-width="2" fill="none"/>
            <text x="205" y="165" fill="blue" font-size="14">Eye & smile →</text>
        </svg>
    `,
    'dolphin-step7': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <ellipse cx="150" cy="150" rx="80" ry="30" stroke="#2c5f7d" stroke-width="3" fill="#6ba3d4" transform="rotate(-10 150 150)"/>
            <path d="M 220 135 Q 245 130 250 140" stroke="#2c5f7d" stroke-width="3" fill="#6ba3d4"/>
            <path d="M 160 140 L 170 100 L 165 140" stroke="#2c5f7d" stroke-width="3" fill="#6ba3d4"/>
            <path d="M 70 155 L 45 140 L 50 165 L 45 180 L 65 170 Z" stroke="#2c5f7d" stroke-width="3" fill="#6ba3d4"/>
            <path d="M 110 165 L 100 185 L 120 170" stroke="#2c5f7d" stroke-width="3" fill="#6ba3d4"/>
            <path d="M 190 165 L 200 185 L 180 170" stroke="#2c5f7d" stroke-width="3" fill="#6ba3d4"/>
            <ellipse cx="150" cy="155" rx="70" ry="22" fill="#b3d9f2" opacity="0.6" transform="rotate(-10 150 150)"/>
            <circle cx="235" cy="137" r="5" fill="#1a1a1a"/>
            <path d="M 225 145 Q 235 148 245 145" stroke="#1a1a1a" stroke-width="2" fill="none"/>
            <text x="90" y="240" fill="#2c5f7d" font-size="14" font-weight="bold">Add color & shading!</text>
        </svg>
    `,

    // CASTLE - simplified
    'castle-step1': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'castle-step2': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="black" stroke-width="4" fill="none"/>
            <rect x="60" y="100" width="40" height="140" stroke="blue" stroke-width="4" fill="none"/>
            <rect x="200" y="100" width="40" height="140" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'castle-step3': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="black" stroke-width="4" fill="none"/>
            <rect x="60" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="none"/>
            <rect x="200" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="blue" stroke-width="4" fill="none"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="blue" stroke-width="4" fill="none"/>
        </svg>
    `,
    'castle-step4': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="black" stroke-width="4" fill="none"/>
            <rect x="60" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="none"/>
            <rect x="200" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="black" stroke-width="4" fill="none"/>
            <rect x="95" y="115" width="12" height="10" stroke="blue" stroke-width="2" fill="none"/>
            <rect x="113" y="115" width="12" height="10" stroke="blue" stroke-width="2" fill="none"/>
            <rect x="131" y="115" width="12" height="10" stroke="blue" stroke-width="2" fill="none"/>
            <rect x="149" y="115" width="12" height="10" stroke="blue" stroke-width="2" fill="none"/>
            <rect x="167" y="115" width="12" height="10" stroke="blue" stroke-width="2" fill="none"/>
            <rect x="185" y="115" width="12" height="10" stroke="blue" stroke-width="2" fill="none"/>
        </svg>
    `,
    'castle-step5': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="black" stroke-width="4" fill="none"/>
            <rect x="60" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="none"/>
            <rect x="200" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="black" stroke-width="4" fill="none"/>
            <rect x="95" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="113" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="131" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="149" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="167" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="185" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="130" y="200" width="40" height="40" stroke="blue" stroke-width="4" fill="none"/>
            <path d="M 130 200 L 150 185 L 170 200" stroke="blue" stroke-width="3" fill="none"/>
        </svg>
    `,
    'castle-step6': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="black" stroke-width="4" fill="none"/>
            <rect x="60" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="none"/>
            <rect x="200" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="black" stroke-width="4" fill="none"/>
            <rect x="95" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="113" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="131" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="149" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="167" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="185" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="130" y="200" width="40" height="40" stroke="black" stroke-width="4" fill="none"/>
            <path d="M 130 200 L 150 185 L 170 200" stroke="black" stroke-width="3" fill="none"/>
            <rect x="110" y="140" width="15" height="20" stroke="blue" stroke-width="2" fill="none"/>
            <rect x="175" y="140" width="15" height="20" stroke="blue" stroke-width="2" fill="none"/>
            <rect x="70" y="120" width="15" height="20" stroke="blue" stroke-width="2" fill="none"/>
            <rect x="215" y="120" width="15" height="20" stroke="blue" stroke-width="2" fill="none"/>
        </svg>
    `,
    'castle-step7': () => `
        <svg viewBox="0 0 300 300" class="step-visual">
            <rect x="100" y="120" width="100" height="120" stroke="black" stroke-width="4" fill="#d3d3d3"/>
            <rect x="60" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="#d3d3d3"/>
            <rect x="200" y="100" width="40" height="140" stroke="black" stroke-width="4" fill="#d3d3d3"/>
            <path d="M 55 100 L 80 70 L 105 100 Z" stroke="black" stroke-width="4" fill="#e74c3c"/>
            <path d="M 195 100 L 220 70 L 245 100 Z" stroke="black" stroke-width="4" fill="#e74c3c"/>
            <rect x="95" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="113" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="131" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="149" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="167" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="185" y="115" width="12" height="10" stroke="black" stroke-width="2" fill="none"/>
            <rect x="130" y="200" width="40" height="40" stroke="black" stroke-width="4" fill="#8b4513"/>
            <path d="M 130 200 L 150 185 L 170 200" stroke="black" stroke-width="3" fill="none"/>
            <rect x="110" y="140" width="15" height="20" stroke="black" stroke-width="2" fill="#87ceeb"/>
            <rect x="175" y="140" width="15" height="20" stroke="black" stroke-width="2" fill="#87ceeb"/>
            <rect x="70" y="120" width="15" height="20" stroke="black" stroke-width="2" fill="#87ceeb"/>
            <rect x="215" y="120" width="15" height="20" stroke="black" stroke-width="2" fill="#87ceeb"/>
            <line x1="78" y1="72" x2="78" y2="58" stroke="#e74c3c" stroke-width="2"/>
            <path d="M 78 58 L 70 63 L 78 60 L 86 63 Z" fill="#e74c3c"/>
            <line x1="220" y1="72" x2="220" y2="58" stroke="#e74c3c" stroke-width="2"/>
            <path d="M 220 58 L 212 63 L 220 60 L 228 63 Z" fill="#e74c3c"/>
        </svg>
    `
};

/**
 * Load tutorial list for selected difficulty (age-based)
 */
// Load all tutorials from all difficulty levels (skip difficulty selection)
function loadAllTutorials() {
    // Check for admin level override
    if (window.currentUserRole === 'admin') {
        const adminLevel = getAdminLevelForModule('drawing');
        if (adminLevel) {
            const levelDetails = getLevelDetails(adminLevel);
            if (levelDetails) {
                currentAge = levelDetails.ageGroup;
            }
        }
    }

    currentStep = 0;

    const tutorialSelection = document.getElementById('tutorial-selection');
    const worksheetArea = document.getElementById('worksheet-area');

    tutorialSelection.style.display = 'block';
    worksheetArea.innerHTML = '';

    document.getElementById('tutorial-list-title').textContent = 'Choose a Tutorial';

    const tutorialList = document.getElementById('tutorial-list');
    tutorialList.innerHTML = '';

    // Combine all tutorials from all difficulty levels
    const allTutorials = [];

    ['easy', 'medium', 'hard'].forEach(difficulty => {
        const tutorials = getTutorialsByAge(currentAge, difficulty);
        Object.entries(tutorials).forEach(([key, tutorial]) => {
            allTutorials.push({
                key: `${difficulty}-${key}`,
                difficulty: difficulty,
                tutorialKey: key,
                tutorial: tutorial
            });
        });
    });

    // Limit to 2 tutorials in demo mode
    const limit = getDemoLimit(allTutorials.length);
    const limitedTutorials = allTutorials.slice(0, limit);

    for (const item of limitedTutorials) {
        const card = document.createElement('div');
        card.className = 'tutorial-card';
        card.onclick = () => {
            currentDifficulty = item.difficulty;
            loadDrawingTutorial(item.tutorialKey);
        };

        const difficultyIcon = item.difficulty === 'easy' ? '⭐' : item.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐';

        card.innerHTML = `
            <div class="tutorial-icon">${item.tutorial.icon}</div>
            <div class="tutorial-name">${item.tutorial.name}</div>
            <div style="font-size: 0.9em; color: #666; margin-top: 5px;">${difficultyIcon}</div>
        `;

        tutorialList.appendChild(card);
    }

    // Add admin level indicator
    if (typeof showAdminLevelIndicator === 'function') {
        showAdminLevelIndicator('drawing', tutorialList);
    }
}

function loadTutorialList(difficulty) {
    currentDifficulty = difficulty;
    currentStep = 0;

    const tutorialSelection = document.getElementById('tutorial-selection');
    const worksheetArea = document.getElementById('worksheet-area');

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

    // Get tutorials for current age and difficulty (maps to level internally)
    const tutorials = getTutorialsByAge(currentAge, difficulty);
    const tutorialEntries = Object.entries(tutorials);

    // Limit to 2 tutorials in demo mode
    const limit = getDemoLimit(tutorialEntries.length);
    const limitedTutorials = tutorialEntries.slice(0, limit);

    for (const [key, tutorial] of limitedTutorials) {
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

    // Get tutorial (maps to level internally)
    const tutorial = getTutorial(currentAge, currentDifficulty, tutorialKey);

    worksheetArea.innerHTML = `
        <div class="navigation" style="margin-bottom: 20px;">
            <button onclick="backToTutorialList()">← Back to Tutorial List</button>
        </div>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-size: 1.2em; font-weight: bold;">
            📊 Level: ${typeof ageAndDifficultyToLevel === 'function' ? ageAndDifficultyToLevel(currentAge, currentDifficulty) : 'N/A'}
        </div>

        <div class="drawing-title">${tutorial.icon} ${tutorial.name}</div>

        <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 15px; margin: 20px 0; text-align: center;">
            <strong>💡 Tip:</strong> For the best experience, turn your device to <strong>landscape mode</strong>!
            The instructions and canvas will appear side-by-side, making it easier to follow along.
        </div>

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
                    <button class="canvas-btn" id="undo-btn" onclick="undo()" title="Undo">↶</button>
                    <button class="canvas-btn" id="redo-btn" onclick="redo()" title="Redo">↷</button>
                    <button class="canvas-btn" onclick="clearCanvas()" title="Clear Canvas">🗑️</button>
                    <button class="canvas-btn" onclick="toggleColorPicker()" id="brush-btn" title="Choose Color" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 1.3em;">🖌️</button>
                    <button class="canvas-btn" onclick="changeColor('white')" title="Eraser">🧹</button>
                </div>
                <div class="canvas-controls" id="color-picker-container" style="display: none; flex-wrap: wrap; gap: 8px; padding: 15px; background: #f8f9fa; border-radius: 10px; justify-content: center;">
                    <button class="color-dot" onclick="changeColor('black')" style="background: black;" title="Black">⚫</button>
                    <button class="color-dot" onclick="changeColor('#1a1a1a')" style="background: #1a1a1a;" title="Dark Gray">⚫</button>
                    <button class="color-dot" onclick="changeColor('blue')" style="background: blue;" title="Blue">🔵</button>
                    <button class="color-dot" onclick="changeColor('#4169e1')" style="background: #4169e1;" title="Royal Blue">🔵</button>
                    <button class="color-dot" onclick="changeColor('red')" style="background: red;" title="Red">🔴</button>
                    <button class="color-dot" onclick="changeColor('#dc143c')" style="background: #dc143c;" title="Crimson">🔴</button>
                    <button class="color-dot" onclick="changeColor('green')" style="background: green;" title="Green">🟢</button>
                    <button class="color-dot" onclick="changeColor('#32cd32')" style="background: #32cd32;" title="Lime Green">🟢</button>
                    <button class="color-dot" onclick="changeColor('yellow')" style="background: yellow;" title="Yellow">🟡</button>
                    <button class="color-dot" onclick="changeColor('#ffd700')" style="background: #ffd700;" title="Gold">🟡</button>
                    <button class="color-dot" onclick="changeColor('orange')" style="background: orange;" title="Orange">🟠</button>
                    <button class="color-dot" onclick="changeColor('#ff8c00')" style="background: #ff8c00;" title="Dark Orange">🟠</button>
                    <button class="color-dot" onclick="changeColor('brown')" style="background: brown;" title="Brown">🟤</button>
                    <button class="color-dot" onclick="changeColor('#8b4513')" style="background: #8b4513;" title="Saddle Brown">🟤</button>
                    <button class="color-dot" onclick="changeColor('purple')" style="background: purple;" title="Purple">🟣</button>
                    <button class="color-dot" onclick="changeColor('#9370db')" style="background: #9370db;" title="Medium Purple">🟣</button>
                    <button class="color-dot" onclick="changeColor('pink')" style="background: pink;" title="Pink">🩷</button>
                    <button class="color-dot" onclick="changeColor('#ff1493')" style="background: #ff1493;" title="Deep Pink">🩷</button>
                </div>
                <div class="canvas-controls" id="eraser-size-container" style="display: none; flex-direction: column; align-items: center; background: #f0f0f0; padding: 15px; border-radius: 10px; margin: 10px 0;">
                    <label style="font-weight: bold; margin-bottom: 10px; color: #764ba2;">
                        🧹 <span id="eraser-size-value">20</span>px
                    </label>
                    <input type="range" min="5" max="50" value="20"
                           oninput="changeEraserSize(this.value)"
                           style="width: 80%; cursor: pointer;">
                </div>
                <div class="canvas-controls">
                    <button class="canvas-btn" onclick="changeBrushSize('small')" title="Small Brush" style="font-size: 0.8em;">⚫</button>
                    <button class="canvas-btn" onclick="changeBrushSize('medium')" title="Medium Brush" style="font-size: 1.3em;">⚫</button>
                    <button class="canvas-btn" onclick="changeBrushSize('large')" title="Large Brush" style="font-size: 1.8em;">⚫</button>
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
    // Get tutorial (maps to level internally)
    const tutorial = getTutorial(currentAge, currentDifficulty, currentTutorial);
    const step = tutorial.steps[currentStep];

    // Update step number
    document.getElementById('current-step-num').textContent = currentStep + 1;

    // Update visual guide
    const visualGuide = document.getElementById('visual-guide');
    const visualFunction = visualGuides[step.visual];
    if (visualFunction) {
        visualGuide.innerHTML = visualFunction();
    } else {
        // Show helpful placeholder with step text
        visualGuide.innerHTML = `
            <svg viewBox="0 0 300 300" class="step-visual" style="background: #f8f9fa;">
                <text x="150" y="130" text-anchor="middle" fill="#667eea" font-size="20" font-weight="bold">
                    Step ${currentStep + 1}
                </text>
                <text x="150" y="160" text-anchor="middle" fill="#666" font-size="14">
                    ${step.text.substring(0, 40)}${step.text.length > 40 ? '...' : ''}
                </text>
                <text x="150" y="190" text-anchor="middle" fill="#999" font-size="12" font-style="italic">
                    Draw on your canvas below!
                </text>
            </svg>
        `;
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
    // Get tutorial (maps to level internally)
    const tutorial = getTutorial(currentAge, currentDifficulty, currentTutorial);
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
let eraserSize = 20; // Default eraser size
let isEraserMode = false;

// Undo/Redo functionality
let undoStack = [];
let redoStack = [];
const MAX_UNDO_STEPS = 50;

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

    // Save initial state
    saveState();

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', function(e) {
        stopDrawing();
    });
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
    if (isDrawing) {
        isDrawing = false;
        saveState(); // Save state after each stroke
    }
}

/**
 * Save canvas state for undo
 */
function saveState() {
    // Save current canvas state
    undoStack.push(canvas.toDataURL());

    // Limit undo stack size
    if (undoStack.length > MAX_UNDO_STEPS) {
        undoStack.shift();
    }

    // Clear redo stack when new action is made
    redoStack = [];

    // Update button states
    updateUndoRedoButtons();
}

/**
 * Undo last action
 */
function undo() {
    if (undoStack.length <= 1) return; // Keep at least initial state

    // Move current state to redo stack
    const currentState = undoStack.pop();
    redoStack.push(currentState);

    // Restore previous state
    const previousState = undoStack[undoStack.length - 1];
    restoreState(previousState);

    updateUndoRedoButtons();
}

/**
 * Redo last undone action
 */
function redo() {
    if (redoStack.length === 0) return;

    // Get state from redo stack
    const state = redoStack.pop();
    undoStack.push(state);

    // Restore state
    restoreState(state);

    updateUndoRedoButtons();
}

/**
 * Restore canvas state from data URL
 */
function restoreState(dataURL) {
    const img = new Image();
    img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    if (undoBtn) {
        undoBtn.disabled = undoStack.length <= 1;
        undoBtn.style.opacity = undoStack.length <= 1 ? '0.5' : '1';
        undoBtn.style.cursor = undoStack.length <= 1 ? 'not-allowed' : 'pointer';
    }

    if (redoBtn) {
        redoBtn.disabled = redoStack.length === 0;
        redoBtn.style.opacity = redoStack.length === 0 ? '0.5' : '1';
        redoBtn.style.cursor = redoStack.length === 0 ? 'not-allowed' : 'pointer';
    }
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
    if (!confirm('Clear the entire canvas? This cannot be undone.')) {
        return;
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = currentColor;

    // Reset undo/redo stacks
    undoStack = [];
    redoStack = [];
    saveState();
}

/**
 * Toggle color picker visibility
 */
function toggleColorPicker() {
    const colorPicker = document.getElementById('color-picker-container');
    const brushBtn = document.getElementById('brush-btn');
    if (colorPicker.style.display === 'none' || colorPicker.style.display === '') {
        colorPicker.style.display = 'flex';
        brushBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
    } else {
        colorPicker.style.display = 'none';
        brushBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

/**
 * Change drawing color
 */
function changeColor(color) {
    if (color === 'white') {
        // Eraser mode
        isEraserMode = true;
        currentColor = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = eraserSize;

        // Show eraser size slider
        const eraserSlider = document.getElementById('eraser-size-container');
        if (eraserSlider) {
            eraserSlider.style.display = 'flex';
        }
    } else {
        // Normal drawing mode
        isEraserMode = false;
        currentColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = currentBrushSize;

        // Hide eraser size slider
        const eraserSlider = document.getElementById('eraser-size-container');
        if (eraserSlider) {
            eraserSlider.style.display = 'none';
        }
    }
}

/**
 * Change eraser size
 */
function changeEraserSize(size) {
    eraserSize = parseInt(size);
    if (isEraserMode) {
        ctx.lineWidth = eraserSize;
    }
    // Update slider value display
    const display = document.getElementById('eraser-size-value');
    if (display) {
        display.textContent = size;
    }
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
    try {
        // Validate all required data exists
        if (!currentAge || !currentDifficulty || !currentTutorial) {
            alert('Error: Drawing tutorial information is missing. Please try again.');
            return;
        }

        // Get tutorial (maps to level internally)
        const tutorial = getTutorial(currentAge, currentDifficulty, currentTutorial);
        if (!tutorial) {
            alert('Error: Could not find tutorial data. Please reload the page and try again.');
            return;
        }

        if (!canvas) {
            alert('Error: Canvas not found. Please try drawing something first.');
            return;
        }

        // Get canvas image data
        const canvasImage = canvas.toDataURL('image/png');

        // Get current date and time
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();

        // Create PDF content similar to Math/English worksheets
        const content = `
            <div style="font-family: 'Comic Sans MS', 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: white;">
                <!-- Header Section -->
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px;">
                    <h1 style="color: #667eea; font-size: 32px; margin: 0 0 10px 0;">${tutorial.icon} ${tutorial.name}</h1>
                    <p style="color: #764ba2; font-size: 18px; margin: 5px 0;">🎨 Step-by-Step Drawing Practice</p>
                </div>

                <!-- Student Info -->
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #667eea;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 16px;">
                        <div><strong>👤 Name:</strong> ${(() => {
                            const child = getSelectedChild();
                            return child ? child.name : getCurrentUserFullName();
                        })()}</div>
                        <div><strong>📅 Date:</strong> ${dateStr}</div>
                        <div><strong>⏰ Time:</strong> ${timeStr}</div>
                        <div><strong>📊 Level:</strong> ${typeof ageAndDifficultyToLevel === 'function' ? ageAndDifficultyToLevel(currentAge, currentDifficulty) : 'N/A'}</div>
                    </div>
                </div>

                <!-- Drawing Section -->
                <div style="text-align: center; margin: 30px 0;">
                    <h2 style="color: #764ba2; font-size: 24px; margin-bottom: 15px;">✨ Your Artwork</h2>
                    <div style="border: 4px solid #667eea; border-radius: 15px; padding: 15px; background: white; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <img src="${canvasImage}" style="max-width: 600px; width: 100%; height: auto; display: block; border-radius: 8px;">
                    </div>
                </div>

                <!-- Steps Section -->
                <div style="margin-top: 35px; background: #fff9e6; padding: 25px; border-radius: 10px; border: 2px solid #ffd700;">
                    <h2 style="color: #667eea; font-size: 22px; margin-bottom: 15px; text-align: center;">📝 Steps You Followed</h2>
                    <ol style="font-size: 15px; line-height: 2; color: #333; padding-left: 30px;">
                        ${tutorial.steps.map((step, idx) => `
                            <li style="margin: 8px 0; padding: 5px 0;">
                                <strong style="color: #764ba2;">Step ${idx + 1}:</strong> ${step.text}
                            </li>
                        `).join('')}
                    </ol>
                </div>

                <!-- Footer -->
                <div style="margin-top: 35px; text-align: center; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 14px;">
                    <p style="margin: 5px 0;">⭐ Practice makes perfect! Keep drawing! ⭐</p>
                    <p style="margin: 5px 0; color: #999; font-size: 12px;">Generated by Kumon Practice Worksheets - Drawing Package</p>
                </div>
            </div>
        `;

        // Create a temporary div for PDF generation
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        tempDiv.style.width = '816px'; // Letter size width in pixels at 96 DPI
        tempDiv.style.background = 'white';
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '0';
        tempDiv.style.top = '0';
        tempDiv.style.zIndex = '-1';
        tempDiv.style.visibility = 'hidden';
        document.body.appendChild(tempDiv);

        // PDF options
        const opt = {
            margin: [0.4, 0.4, 0.4, 0.4],
            filename: `Drawing_${tutorial.name.replace(/\s+/g, '_')}_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                letterRendering: true
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate PDF
        html2pdf().set(opt).from(tempDiv).save()
            .then(() => {
                // Remove temporary div
                if (document.body.contains(tempDiv)) {
                    document.body.removeChild(tempDiv);
                }
                console.log('PDF generated successfully');
            })
            .catch((error) => {
                console.error('PDF generation error:', error);
                if (document.body.contains(tempDiv)) {
                    document.body.removeChild(tempDiv);
                }
                alert('Error generating PDF. Please try again.');
            });
    } catch (error) {
        console.error('PDF save error:', error);
        alert('Error saving PDF: ' + error.message);
    }
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
    // Renamed function - now goes back to tutorial list
    backToTutorialList();
}

function backToTutorialList() {
    const tutorialSelection = document.getElementById('tutorial-selection');
    const worksheetArea = document.getElementById('worksheet-area');

    tutorialSelection.style.display = 'block';
    worksheetArea.innerHTML = '';
}
