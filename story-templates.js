// Story Generation Templates
// This file contains templates and helpers for generating 100+ stories per difficulty level

const storyTemplates = {
    animals: {
        easy: {
            subjects: [
                'cat', 'dog', 'bird', 'fish', 'mouse', 'rabbit', 'bear', 'duck', 'pig', 'cow',
                'bee', 'ant', 'frog', 'turtle', 'snail', 'butterfly', 'ladybug', 'chicken', 'sheep', 'goat',
                'fox', 'deer', 'owl', 'eagle', 'parrot', 'hamster', 'squirrel', 'chipmunk', 'robin', 'dove'
            ],
            adjectives: [
                'happy', 'kind', 'brave', 'small', 'tiny', 'quick', 'slow', 'friendly',
                'gentle', 'clever', 'wise', 'playful', 'helpful', 'caring', 'sweet'
            ],
            actions: [
                'helped a friend', 'found food', 'made friends', 'learned to share',
                'saved the day', 'sang a song', 'played games', 'built a home',
                'planted seeds', 'climbed a tree', 'swam in pond', 'flew high'
            ],
            morals: [
                'Helping others brings joy',
                'Friends make us happy',
                'Sharing is caring',
                'Being kind is important',
                'Small acts matter',
                'Teamwork makes things easier',
                'Patience brings good things',
                'Everyone is special'
            ]
        },
        medium: {
            subjects: [
                'elephant', 'lion', 'tiger', 'giraffe', 'zebra', 'monkey', 'dolphin', 'whale',
                'penguin', 'kangaroo', 'koala', 'panda', 'cheetah', 'leopard', 'wolf', 'raccoon',
                'otter', 'seal', 'walrus', 'flamingo', 'pelican', 'heron', 'crane', 'peacock'
            ],
            traits: [
                'determination', 'courage', 'wisdom', 'patience', 'perseverance',
                'kindness', 'generosity', 'honesty', 'loyalty', 'compassion'
            ],
            challenges: [
                'crossed a river', 'climbed a mountain', 'faced a storm',
                'helped others in need', 'solved a problem', 'overcame fear',
                'learned a new skill', 'made a difficult choice'
            ]
        },
        hard: {
            subjects: [
                'arctic fox', 'snow leopard', 'golden eagle', 'blue whale', 'giant panda',
                'mountain gorilla', 'poison dart frog', 'komodo dragon', 'emperor penguin'
            ],
            themes: [
                'adaptation and survival', 'leadership and responsibility',
                'sacrifice for the greater good', 'overcoming adversity',
                'the importance of diversity', 'environmental awareness'
            ]
        }
    }
};

// Generate animal stories
function generateAnimalStories(difficulty, count = 100) {
    const stories = [];
    const template = storyTemplates.animals[difficulty];

    for (let i = 0; i < count; i++) {
        const story = generateAnimalStory(difficulty, i, template);
        stories.push(story);
    }

    return stories;
}

function generateAnimalStory(difficulty, index, template) {
    if (difficulty === 'easy') {
        const subject = template.subjects[index % template.subjects.length];
        const adj = template.adjectives[index % template.adjectives.length];
        const action = template.actions[index % template.actions.length];
        const moral = template.morals[index % template.morals.length];

        const name = capitalizeFirst(subject);
        const icon = getAnimalIcon(subject);

        return {
            title: `The ${capitalizeFirst(adj)} ${capitalizeFirst(subject)}`,
            illustration: icon,
            difficulty: 'easy',
            text: `${name} was a ${adj} ${subject}. One day, ${name} ${action}. All the animals were happy. ${name} felt proud. Everyone loved ${name}.`,
            moral: moral
        };
    } else if (difficulty === 'medium') {
        const subject = template.subjects[index % template.subjects.length];
        const trait = template.traits[index % template.traits.length];
        const challenge = template.challenges[index % template.challenges.length];

        const name = capitalizeFirst(subject).replace(' ', '');
        const icon = getAnimalIcon(subject);

        return {
            title: `${name}'s ${capitalizeFirst(trait)}`,
            illustration: icon,
            difficulty: 'medium',
            text: `${name} the ${subject} lived in the wild. One day, ${name} ${challenge}. It was difficult, but ${name} showed great ${trait}. Other animals watched and learned. ${name} became an example of ${trait} for everyone. They all worked together and succeeded.`,
            moral: `${capitalizeFirst(trait)} helps us overcome challenges.`
        };
    } else {
        const subject = template.subjects[index % template.subjects.length];
        const theme = template.themes[index % template.themes.length];

        const name = capitalizeFirst(subject).replace(' ', '');
        const icon = getAnimalIcon(subject);

        return {
            title: `${name} and ${theme}`,
            illustration: icon,
            difficulty: 'hard',
            text: `In the vast wilderness, ${name} the ${subject} faced a unique challenge. The environment was changing, and ${name} had to make important decisions. Through ${theme}, ${name} discovered new ways to thrive. The journey taught ${name} valuable lessons about life, nature, and the interconnectedness of all living things. ${name}'s story inspired others to adapt and grow.`,
            moral: `Understanding ${theme} makes us stronger and wiser.`
        };
    }
}

function getAnimalIcon(animal) {
    const icons = {
        cat: '🐱', dog: '🐶', bird: '🐦', fish: '🐟', mouse: '🐭',
        rabbit: '🐰', bear: '🐻', duck: '🦆', pig: '🐷', cow: '🐄',
        bee: '🐝', ant: '🐜', frog: '🐸', turtle: '🐢', snail: '🐌',
        butterfly: '🦋', ladybug: '🐞', chicken: '🐔', sheep: '🐑', goat: '🐐',
        fox: '🦊', deer: '🦌', owl: '🦉', eagle: '🦅', parrot: '🦜',
        hamster: '🐹', squirrel: '🐿️', chipmunk: '🐿️', robin: '🐦', dove: '🕊️',
        elephant: '🐘', lion: '🦁', tiger: '🐯', giraffe: '🦒', zebra: '🦓',
        monkey: '🐵', dolphin: '🐬', whale: '🐋', penguin: '🐧', kangaroo: '🦘',
        koala: '🐨', panda: '🐼', cheetah: '🐆', leopard: '🐆', wolf: '🐺',
        raccoon: '🦝', otter: '🦦', seal: '🦭', walrus: '🦭', flamingo: '🦩',
        pelican: '🦆', heron: '🦆', crane: '🦆', peacock: '🦚',
        'arctic fox': '🦊', 'snow leopard': '🐆', 'golden eagle': '🦅',
        'blue whale': '🐋', 'giant panda': '🐼', 'mountain gorilla': '🦍',
        'poison dart frog': '🐸', 'komodo dragon': '🦎', 'emperor penguin': '🐧'
    };

    return icons[animal] || '🐾';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate stories for all categories and difficulties
function generateAllStories() {
    const collection = {};

    // Animals
    collection.animals = [
        ...generateAnimalStories('easy', 100),
        ...generateAnimalStories('medium', 100),
        ...generateAnimalStories('hard', 100)
    ];

    // Nature (simplified generation for other categories)
    collection.nature = generateCategoryStories('nature', 300);
    collection.family = generateCategoryStories('family', 300);
    collection.adventures = generateCategoryStories('adventures', 300);
    collection.learning = generateCategoryStories('learning', 300);
    collection.bedtime = generateCategoryStories('bedtime', 300);

    return collection;
}

function generateCategoryStories(category, totalCount) {
    const stories = [];
    const countPerDifficulty = Math.floor(totalCount / 3);

    const templates = getCategoryTemplates(category);

    for (let diff of ['easy', 'medium', 'hard']) {
        for (let i = 0; i < countPerDifficulty; i++) {
            stories.push(generateGenericStory(category, diff, i, templates));
        }
    }

    return stories;
}

function getCategoryTemplates(category) {
    const templates = {
        nature: {
            subjects: ['tree', 'flower', 'sun', 'moon', 'star', 'cloud', 'rain', 'wind', 'river', 'mountain', 'ocean', 'forest', 'garden', 'seed', 'leaf'],
            icons: ['🌳', '🌸', '☀️', '🌙', '⭐', '☁️', '🌧️', '💨', '🌊', '⛰️', '🌊', '🌲', '🌺', '🌱', '🍃']
        },
        family: {
            subjects: ['mom', 'dad', 'sister', 'brother', 'grandma', 'grandpa', 'aunt', 'uncle', 'cousin', 'baby'],
            icons: ['👩', '👨', '👧', '👦', '👵', '👴', '👩', '👨', '👧', '👶']
        },
        adventures: {
            subjects: ['explorer', 'sailor', 'pilot', 'astronaut', 'diver', 'climber', 'traveler', 'adventurer'],
            icons: ['🧭', '⛵', '✈️', '🚀', '🤿', '🧗', '🎒', '🗺️']
        },
        learning: {
            subjects: ['student', 'teacher', 'reader', 'writer', 'scientist', 'artist', 'mathematician', 'musician'],
            icons: ['👨‍🎓', '👩‍🏫', '📖', '✍️', '🔬', '🎨', '🔢', '🎵']
        },
        bedtime: {
            subjects: ['moon', 'star', 'dream', 'cloud', 'night', 'sleep', 'teddy', 'pillow', 'blanket'],
            icons: ['🌙', '⭐', '💭', '☁️', '🌃', '😴', '🧸', '🛏️', '🛏️']
        }
    };

    return templates[category] || templates.nature;
}

function generateGenericStory(category, difficulty, index, templates) {
    const subject = templates.subjects[index % templates.subjects.length];
    const icon = templates.icons[index % templates.icons.length];

    let text, length;

    if (difficulty === 'easy') {
        text = `This is a story about ${subject}. ${capitalizeFirst(subject)} was special. ${capitalizeFirst(subject)} did something good. Everyone was happy. The end.`;
        length = 'short';
    } else if (difficulty === 'medium') {
        text = `Once upon a time, there was ${subject}. ${capitalizeFirst(subject)} had an adventure. Along the way, ${subject} learned important lessons. ${capitalizeFirst(subject)} made new friends and grew wiser. Everyone learned from ${subject}'s experience.`;
        length = 'medium';
    } else {
        text = `In a world full of possibilities, ${subject} embarked on a remarkable journey. Through challenges and triumphs, ${subject} discovered profound truths about life, friendship, and perseverance. The experiences shaped ${subject} in meaningful ways, creating memories that would last forever. This story teaches us about growth, resilience, and the power of believing in ourselves.`;
        length = 'long';
    }

    return {
        title: `The Story of ${capitalizeFirst(subject)} #${index + 1}`,
        illustration: icon,
        difficulty: difficulty,
        text: text,
        moral: `${capitalizeFirst(category)} teach us important life lessons.`
    };
}
