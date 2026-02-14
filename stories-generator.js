// Story Time - Dynamic Story Generation
// Generates 100+ stories per difficulty level per category

let currentCategory = null;
let currentDifficulty = null;
let currentStoryIndex = 0;
let currentStories = [];

// Story generation templates
const storyData = {
    animals: {
        easy: {
            themes: [
                'The Helpful {animal}', 'The Brave {animal}', 'The Kind {animal}',
                'The Happy {animal}', 'The Friendly {animal}', 'The Clever {animal}',
                'The Playful {animal}', 'The Caring {animal}', 'The Gentle {animal}',
                'The Quick {animal}'
            ],
            animals: [
                ['rabbit', '🐰'], ['cat', '🐱'], ['dog', '🐶'], ['bird', '🐦'],
                ['mouse', '🐭'], ['fish', '🐟'], ['frog', '🐸'], ['duck', '🦆'],
                ['bee', '🐝'], ['ant', '🐜'], ['butterfly', '🦋'], ['turtle', '🐢'],
                ['ladybug', '🐞'], ['snail', '🐌'], ['chicken', '🐔'], ['pig', '🐷'],
                ['cow', '🐄'], ['sheep', '🐑'], ['goat', '🐐'], ['hamster', '🐹']
            ],
            actions: [
                'helped a friend find food', 'shared toys with others', 'sang a happy song',
                'made new friends', 'found a lost item', 'planted flowers',
                'cleaned up the park', 'helped cross the road', 'gave a warm hug',
                'told a funny joke'
            ],
            morals: [
                'Helping others brings joy to everyone.',
                'Sharing makes us all happy.',
                'Kindness is the best gift.',
                'Friends make everything better.',
                'Small acts create big smiles.',
                'Being helpful feels wonderful.',
                'Caring for others matters.',
                'Friendship is precious.',
                'Gentle hearts win love.',
                'Happiness is meant to share.'
            ]
        },
        medium: {
            themes: [
                '{animal}\'s Adventure', '{animal}\'s Challenge', '{animal}\'s Discovery',
                '{animal}\'s Journey', '{animal}\'s Lesson', '{animal}\'s Courage'
            ],
            animals: [
                ['elephant', '🐘'], ['lion', '🦁'], ['tiger', '🐯'], ['giraffe', '🦒'],
                ['zebra', '🦓'], ['monkey', '🐵'], ['dolphin', '🐬'], ['whale', '🐋'],
                ['penguin', '🐧'], ['kangaroo', '🦘'], ['koala', '🐨'], ['panda', '🐼'],
                ['cheetah', '🐆'], ['wolf', '🐺'], ['fox', '🦊'], ['deer', '🦌'],
                ['owl', '🦉'], ['eagle', '🦅'], ['parrot', '🦜'], ['peacock', '🦚']
            ],
            challenges: [
                'crossed a wide river', 'climbed a tall mountain', 'faced a big storm',
                'helped animals in need', 'solved a tricky problem', 'overcame fear',
                'learned a new skill', 'made a tough choice', 'led a team',
                'found a creative solution'
            ],
            morals: [
                'Courage helps us face our fears.',
                'Perseverance leads to success.',
                'Teamwork achieves great things.',
                'Wisdom comes from experience.',
                'Patience brings good results.',
                'Leadership means helping others.',
                'Determination conquers obstacles.',
                'Learning never stops.',
                'Choices shape our future.',
                'Creativity solves problems.'
            ]
        },
        hard: {
            themes: [
                'The {animal} and the Changing Seasons',
                '{animal}\'s Environmental Mission',
                'The Wise {animal}\'s Leadership',
                '{animal}\'s Greatest Sacrifice'
            ],
            animals: [
                ['arctic fox', '🦊❄️'], ['snow leopard', '🐆⛰️'], ['golden eagle', '🦅✨'],
                ['blue whale', '🐋🌊'], ['giant panda', '🐼🎋'], ['mountain gorilla', '🦍'],
                ['elephant matriarch', '🐘👑'], ['wolf pack leader', '🐺🌲'],
                ['coral reef guardian', '🐠🪸'], ['rainforest protector', '🦜🌳']
            ],
            concepts: [
                'adaptation and survival in harsh environments',
                'the delicate balance of ecosystems',
                'leadership during times of crisis',
                'sacrifice for the greater good',
                'environmental conservation and protection',
                'the importance of biodiversity',
                'intergenerational wisdom and knowledge',
                'resilience in the face of climate change'
            ],
            morals: [
                'True leadership means serving others first.',
                'Every creature has a vital role in nature.',
                'Adaptation is key to survival and growth.',
                'Protecting our environment protects our future.',
                'Wisdom is passed through generations.',
                'Sacrifice for others shows true strength.',
                'Balance in nature sustains all life.',
                'Unity in diversity creates resilience.'
            ]
        }
    },
    nature: {
        easy: { count: 100 },
        medium: { count: 100 },
        hard: { count: 100 }
    },
    family: {
        easy: { count: 100 },
        medium: { count: 100 },
        hard: { count: 100 }
    },
    adventures: {
        easy: { count: 100 },
        medium: { count: 100 },
        hard: { count: 100 }
    },
    learning: {
        easy: { count: 100 },
        medium: { count: 100 },
        hard: { count: 100 }
    },
    bedtime: {
        easy: { count: 100 },
        medium: { count: 100 },
        hard: { count: 100 }
    }
};

// Generate stories dynamically
function generateStories(category, difficulty, count = 100) {
    const stories = [];

    if (category === 'animals') {
        stories.push(...generateAnimalStories(difficulty, count));
    } else {
        stories.push(...generateGenericCategoryStories(category, difficulty, count));
    }

    return stories;
}

function generateAnimalStories(difficulty, count) {
    const stories = [];
    const data = storyData.animals[difficulty];

    for (let i = 0; i < count; i++) {
        const theme = data.themes[i % data.themes.length];
        const [animal, icon] = data.animals[i % data.animals.length];
        const name = capitalize(animal);

        let text, moral;

        if (difficulty === 'easy') {
            const action = data.actions[i % data.actions.length];
            moral = data.morals[i % data.morals.length];

            text = `${name} was a ${animal} who loved to help. One sunny day, ${name} ${action}. All the friends cheered! ${name} felt so happy. Everyone learned that ${moral.toLowerCase()}`;
        } else if (difficulty === 'medium') {
            const challenge = data.challenges[i % data.challenges.length];
            moral = data.morals[i % data.morals.length];

            text = `${name} the ${animal} lived in a beautiful place. One day, ${name} ${challenge}. It was not easy, but ${name} never gave up. Other animals watched and were inspired. Through determination and heart, ${name} succeeded. Everyone learned an important lesson: ${moral.toLowerCase()}`;
        } else {
            const concept = data.concepts[i % data.concepts.length];
            moral = data.morals[i % data.morals.length];

            text = `In the vast wilderness, ${name} faced a profound challenge related to ${concept}. The situation required not just strength, but wisdom, compassion, and vision. ${name} made difficult decisions that affected the entire community. Through careful thought and selfless action, ${name} found a path forward. The experience taught everyone that ${moral.toLowerCase()} This story reminds us of our responsibility to protect and preserve the natural world.`;
        }

        stories.push({
            title: theme.replace('{animal}', capitalize(animal)),
            illustration: icon,
            text: text,
            moral: moral
        });
    }

    return stories;
}

function generateGenericCategoryStories(category, difficulty, count) {
    const stories = [];
    const templates = getCategoryTemplates(category);

    for (let i = 0; i < count; i++) {
        const subject = templates.subjects[i % templates.subjects.length];
        const icon = templates.icons[i % templates.icons.length];
        const verb = templates.verbs[i % templates.verbs.length];
        const moral = templates.morals[i % templates.morals.length];

        let text;

        if (difficulty === 'easy') {
            text = `This is about ${subject}. ${capitalize(subject)} was special. One day, ${subject} ${verb}. It made everyone smile. ${capitalize(subject)} was happy.`;
        } else if (difficulty === 'medium') {
            text = `Once there was ${subject} who wanted to make a difference. ${capitalize(subject)} decided to ${verb}. At first it was challenging, but ${subject} kept trying. Soon others joined in. Together they succeeded. ${capitalize(subject)} learned that ${moral.toLowerCase()}`;
        } else {
            text = `In a world of endless possibilities, ${subject} embarked on a remarkable journey. The path ahead required ${verb}, facing both obstacles and opportunities. Through perseverance, creativity, and an open heart, ${subject} discovered profound truths. The experience transformed not just ${subject}, but everyone involved. This story teaches us that ${moral.toLowerCase()} It reminds us of our potential to make meaningful change in the world.`;
        }

        stories.push({
            title: `The ${capitalize(subject)} Who ${capitalize(verb)} (Story ${i + 1})`,
            illustration: icon,
            text: text,
            moral: moral
        });
    }

    return stories;
}

function getCategoryTemplates(category) {
    const templates = {
        nature: {
            subjects: ['tree', 'flower', 'sun', 'rain', 'wind', 'river', 'mountain', 'ocean', 'cloud', 'star'],
            icons: ['🌳', '🌸', '☀️', '🌧️', '💨', '🌊', '⛰️', '🌊', '☁️', '⭐'],
            verbs: ['grew tall', 'bloomed bright', 'shone warm', 'watered earth', 'blew gently', 'flowed free', 'stood strong', 'provided life', 'drifted by', 'twinkled'],
            morals: ['Nature provides for all.', 'Growth takes time.', 'Every season has purpose.', 'Life is interconnected.']
        },
        family: {
            subjects: ['mom', 'dad', 'grandma', 'grandpa', 'sister', 'brother', 'aunt', 'uncle', 'cousin', 'baby'],
            icons: ['👩', '👨', '👵', '👴', '👧', '👦', '👩', '👨', '👧', '👶'],
            verbs: ['showed love', 'gave support', 'taught lessons', 'shared wisdom', 'offered help', 'listened carefully', 'created memories', 'brought joy'],
            morals: ['Family means love.', 'Together we are stronger.', 'Every member matters.', 'Love binds us together.']
        },
        adventures: {
            subjects: ['explorer', 'traveler', 'sailor', 'climber', 'diver', 'pilot', 'astronaut', 'adventurer'],
            icons: ['🧭', '🎒', '⛵', '🧗', '🤿', '✈️', '🚀', '🗺️'],
            verbs: ['discovered new lands', 'sailed far seas', 'climbed high peaks', 'explored depths', 'flew through skies', 'reached for stars', 'ventured boldly'],
            morals: ['Exploration brings discovery.', 'Courage opens doors.', 'Adventure teaches lessons.', 'The journey matters.']
        },
        learning: {
            subjects: ['student', 'teacher', 'scientist', 'artist', 'writer', 'mathematician', 'musician', 'reader'],
            icons: ['👨‍🎓', '👩‍🏫', '🔬', '🎨', '✍️', '🔢', '🎵', '📖'],
            verbs: ['learned new things', 'taught with care', 'made discoveries', 'created beauty', 'wrote stories', 'solved problems', 'made music', 'read widely'],
            morals: ['Learning never ends.', 'Knowledge is power.', 'Education opens minds.', 'Creativity enriches life.']
        },
        bedtime: {
            subjects: ['moon', 'star', 'dream', 'night', 'sleep', 'teddy bear', 'pillow', 'blanket', 'lullaby'],
            icons: ['🌙', '⭐', '💭', '🌃', '😴', '🧸', '🛏️', '🛏️', '🎵'],
            verbs: ['brought peace', 'shone bright', 'guided sleep', 'wrapped warmly', 'sang softly', 'provided comfort', 'gave rest'],
            morals: ['Rest renews us.', 'Dreams inspire us.', 'Peace brings healing.', 'Sleep is essential.']
        }
    };

    return templates[category] || templates.nature;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Navigation
function selectCategory(category) {
    currentCategory = category;

    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';

    const categoryNames = {
        animals: '🦁 Animal Stories',
        nature: '🌳 Nature Tales',
        family: '👨‍👩‍👧‍👦 Family & Friends',
        adventures: '🚀 Adventures',
        learning: '📚 Learning & School',
        bedtime: '🌙 Bedtime Stories'
    };

    document.getElementById('category-subtitle').textContent = categoryNames[category];
}

function showStories(difficulty) {
    currentDifficulty = difficulty;

    // Generate 100 stories for the selected category and difficulty
    currentList = generateStories(currentCategory, difficulty, 100);

    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('story-list').style.display = 'block';

    const categoryNames = {
        animals: '🦁 Animal Stories',
        nature: '🌳 Nature Tales',
        family: '👨‍👩‍👧‍👦 Family & Friends',
        adventures: '🚀 Adventures',
        learning: '📚 Learning & School',
        bedtime: '🌙 Bedtime Stories'
    };

    const difficultyStars = {
        easy: '⭐ Easy',
        medium: '⭐⭐ Medium',
        hard: '⭐⭐⭐ Hard'
    };

    document.getElementById('category-title').textContent = `${categoryNames[currentCategory]} - ${difficultyStars[difficulty]} (${currentList.length} stories)`;

    const container = document.getElementById('stories-container');
    container.innerHTML = '';

    currentList.forEach((story, index) => {
        const card = document.createElement('div');
        card.className = 'story-card';
        card.onclick = () => readStory(index);

        card.innerHTML = `
            <div class="story-card-icon">${story.illustration}</div>
            <div class="story-card-title">${story.title}</div>
        `;
        container.appendChild(card);
    });
}

function backToDifficulty() {
    document.getElementById('story-list').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';
}

function backToCategories() {
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
}

function readStory(index) {
    currentStoryIndex = index;
    const story = currentList[index];

    document.getElementById('story-list').style.display = 'none';
    document.getElementById('story-reader').style.display = 'block';

    document.getElementById('story-content').innerHTML = `
        <div class="story-meta">Story ${index + 1} of ${currentList.length}</div>
        <h1 class="story-title">${story.title}</h1>
        <div class="story-illustration">
            <div class="story-scene">
                <div class="story-icon" style="font-size: 8em;">${story.illustration}</div>
            </div>
        </div>
        <div class="story-text">${story.text}</div>
        <div class="story-moral">
            <h3>✨ Lesson ✨</h3>
            <p>${story.moral}</p>
        </div>
    `;

    document.getElementById('prev-btn').disabled = (index === 0);
    document.getElementById('next-btn').disabled = (index === currentList.length - 1);
}

function backToList() {
    document.getElementById('story-reader').style.display = 'none';
    document.getElementById('story-list').style.display = 'block';
}

function previousStory() {
    if (currentStoryIndex > 0) {
        readStory(currentStoryIndex - 1);
    }
}

function nextStory() {
    if (currentStoryIndex < currentList.length - 1) {
        readStory(currentStoryIndex + 1);
    }
}
