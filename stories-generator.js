// Story Time - Dynamic Story Generation
// Generates 100+ stories per difficulty level per category


let currentAge = null;
let currentCategory = null;
let currentDifficulty = null;
let currentStoryIndex = 0;
let currentStories = [];

// Demo version limiting
function isDemoMode() {
    const user = getCurrentUser();
    if (!user) return true; // Default to demo if no user

    // Check for admin demo preview mode
    if (user.role === 'admin') {
        const adminDemoPreview = localStorage.getItem('adminDemoPreview') === 'true';
        return adminDemoPreview; // Admin can toggle demo preview
    }

    // Treat users without version field as demo (for existing users)
    const version = user.version || 'demo';
    return version === 'demo';
}

function getDemoLimit(defaultCount) {
    return isDemoMode() ? Math.min(2, defaultCount) : defaultCount;
}

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

// Generate stories dynamically with age-based content
function generateStories(category, difficulty) {
    const stories = [];

    // Map age to age group
    const ageGroup = ageGroupMap[currentAge ? currentAge.toString() : '6'] || '6';

    // Get age-appropriate stories (maps to level internally)
    if (typeof getStoriesByAge !== 'undefined') {
        const ageStories = getStoriesByAge(ageGroup, difficulty, category);
        if (ageStories && ageStories.length > 0) {
            stories.push(...ageStories);
        }
    }

    // If no age-based stories, try uniqueStories as fallback
    if (stories.length === 0 && typeof uniqueStories !== 'undefined' &&
        uniqueStories[category] && uniqueStories[category][difficulty]) {
        stories.push(...uniqueStories[category][difficulty]);
    }

    // If still no stories, generate from templates based on age and category
    if (stories.length === 0) {
        if (category === 'animals') {
            stories.push(...generateAnimalStories(difficulty, 10));
        } else {
            stories.push(...generateGenericCategoryStories(category, difficulty, 10));
        }
    }

    return stories;
}

function generateAnimalStories(difficulty, count) {
    const stories = [];
    const data = storyData.animals[difficulty];

    // Map age to age group for complexity adjustment
    const ageGroup = ageGroupMap[currentAge ? currentAge.toString() : '6'] || '6';

    for (let i = 0; i < count; i++) {
        const theme = data.themes[i % data.themes.length];
        const [animal, icon] = data.animals[i % data.animals.length];
        const name = capitalize(animal);

        let text, moral;

        if (difficulty === 'easy') {
            const action = data.actions[i % data.actions.length];
            moral = data.morals[i % data.morals.length];

            // Adjust sentence complexity by age
            if (ageGroup === '4-5') {
                text = `${name} the ${animal} was very kind. One day, ${name} ${action}. Everyone was happy! ${moral}`;
            } else if (ageGroup === '6') {
                text = `There was a little ${animal} named ${name}. ${name} had a kind heart. One sunny morning, ${name} ${action}. All the friends smiled and said "Thank you!" ${name} felt wonderful inside. ${moral}`;
            } else {
                text = `Once upon a time, there was a little ${animal} named ${name}. ${name} had a kind heart and always tried to help others whenever possible. One beautiful sunny morning, ${name} noticed something special happening. With a warm smile and gentle paws, ${name} ${action}. When all the friends saw what ${name} had done, they gathered around with big smiles on their faces. "Thank you, ${name}!" they said together. ${name} felt wonderful inside, knowing that even small acts of kindness can make everyone's day brighter. From that day on, all the animals remembered that ${moral.toLowerCase()}`;
            }
        } else if (difficulty === 'medium') {
            const challenge = data.challenges[i % data.challenges.length];
            moral = data.morals[i % data.morals.length];

            text = `In a peaceful corner of the forest, there lived a thoughtful ${animal} named ${name}. Every morning, ${name} would wake up and explore the beautiful surroundings, grateful for the wonderful home they had. But one day, everything changed. ${name} discovered a situation that needed attention - something that required bravery and determination. Without hesitation, ${name} ${challenge}. The journey was difficult, and there were moments when ${name} felt like giving up. Yet deep inside, ${name} knew this was important. Other animals began to notice ${name}'s efforts and felt inspired by such courage. Some came forward to offer help and encouragement. Step by step, with patience and a brave heart, ${name} worked through every obstacle. When the challenge was finally overcome, everyone celebrated together. The experience taught them all something valuable: ${moral.toLowerCase()}`;
        } else {
            const concept = data.concepts[i % data.concepts.length];
            moral = data.morals[i % data.morals.length];

            text = `Deep in the vast wilderness, where ancient forests meet endless skies, lived a remarkable ${animal} known as ${name}. For many seasons, ${name} had lived peacefully among the community, watching the rhythms of nature and learning from the land. But as time passed, ${name} began to notice troubling changes. The delicate balance they had always known was shifting, and ${name} realized they were facing a profound challenge related to ${concept}. This was not something that could be solved with strength alone. It would require wisdom earned through experience, compassion for all living things, and the vision to see beyond the present moment. ${name} spent days and nights contemplating the situation, consulting with elders and listening to the concerns of younger members of the community. The decisions ahead were difficult, and ${name} knew that whatever path was chosen would affect not just today, but generations to come. With careful thought and a selfless spirit, ${name} began to take action. Some decisions were painful, requiring sacrifice and difficult choices. But through it all, ${name} remained guided by a deep commitment to the wellbeing of the entire community and the natural world they called home. Slowly, others began to understand ${name}'s vision. They came together, each contributing their own unique gifts to the cause. Through unity and shared purpose, they found a way forward that honored both tradition and the need for adaptation. When the story of ${name}'s leadership was told to future generations, it carried an important message: ${moral.toLowerCase()} Their tale serves as a powerful reminder of our connection to the natural world and our responsibility to protect it, not just for ourselves, but for all those who will come after us.`;
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
            text = `Let me tell you a wonderful story! There was a very special ${subject} who lived nearby. Every single day was an adventure, and ${subject} loved making friends happy. One bright and beautiful morning, something amazing happened. The ${subject} ${verb}, bringing joy and wonder to everyone around. All the friends who saw this felt so happy and grateful. Their hearts filled with warmth, and they couldn't stop smiling! The ${subject} felt proud and content, knowing that even simple acts can bring so much happiness to others. What a lovely day it was!`;
        } else if (difficulty === 'medium') {
            text = `This is the story of a remarkable ${subject} who dreamed of making the world a better place. Every day, the ${subject} would look around and wonder, "What can I do to help?" One morning, inspiration struck! The ${subject} decided to take action and ${verb}. At first, the task seemed overwhelming. There were challenges and obstacles that made it difficult to continue. But the ${subject} refused to give up, remembering why this journey had begun in the first place. Day after day, the ${subject} worked with dedication and hope. Then something wonderful happened - others noticed these efforts and felt inspired to join in! Together, they shared ideas, supported each other through difficulties, and celebrated small victories along the way. What started as one ${subject}'s dream became a community effort. When they finally succeeded, the joy was shared by everyone. Through this experience, the ${subject} discovered an important truth: ${moral.toLowerCase()} It was a lesson that would be remembered forever.`;
        } else {
            text = `In a world filled with infinite possibilities and untold wonders, there lived a thoughtful ${subject} with a vision for something greater. For years, the ${subject} had observed the world carefully, noticing both its beauty and its challenges, always wondering what role they might play in shaping a better future. Then one transformative day, clarity emerged. The ${subject} understood what needed to be done and embarked on a remarkable journey that would change everything. The path forward was complex and demanding. It required ${verb}, navigating through countless obstacles while remaining open to unexpected opportunities. There were moments of doubt when the weight of responsibility felt almost too heavy to bear. Yet the ${subject} pressed onward, drawing strength from deep convictions and an unwavering commitment to the cause. Along this journey, something profound began to happen. The ${subject}'s dedication and perseverance touched the hearts of others who had been watching from afar. One by one, people were moved to action, each bringing their own unique perspective and talents to contribute to the vision. What emerged was not just the achievement of a goal, but the transformation of an entire community. Hearts were opened, minds were expanded, and new possibilities were discovered. The ${subject} learned that true change comes not from one person acting alone, but from inspiring others to join in a shared purpose. The ripples of this journey extended far beyond what anyone could have imagined, touching lives and creating lasting impact. As the story spread to new listeners, it carried with it a powerful message: ${moral.toLowerCase()} This truth serves as a guiding light, reminding us that each of us holds the potential to make a meaningful difference in the world, and that our greatest achievements come when we work together with open hearts and determined spirits.`;
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
            verbs: ['grew tall and strong', 'bloomed with beautiful colors', 'shone warm and bright', 'brought water to the earth', 'blew gently across the land', 'flowed freely through the valley', 'stood strong through all seasons', 'provided life to all creatures', 'drifted peacefully through the sky', 'twinkled with magical light'],
            morals: ['Nature provides for all.', 'Growth takes time.', 'Every season has purpose.', 'Life is interconnected.']
        },
        family: {
            subjects: ['mom', 'dad', 'grandma', 'grandpa', 'sister', 'brother', 'aunt', 'uncle', 'cousin', 'baby'],
            icons: ['👩', '👨', '👵', '👴', '👧', '👦', '👩', '👨', '👧', '👶'],
            verbs: ['showed love in countless ways', 'gave support during difficult times', 'taught important life lessons', 'shared wisdom from experience', 'offered help without being asked', 'listened carefully with patience', 'created beautiful memories together', 'brought joy to the whole family'],
            morals: ['Family means love.', 'Together we are stronger.', 'Every member matters.', 'Love binds us together.']
        },
        adventures: {
            subjects: ['explorer', 'traveler', 'sailor', 'climber', 'diver', 'pilot', 'astronaut', 'adventurer'],
            icons: ['🧭', '🎒', '⛵', '🧗', '🤿', '✈️', '🚀', '🗺️'],
            verbs: ['discovered amazing new lands', 'sailed across distant seas', 'climbed to the highest peaks', 'explored the deepest places', 'flew through endless skies', 'reached for the brightest stars', 'ventured boldly into the unknown'],
            morals: ['Exploration brings discovery.', 'Courage opens doors.', 'Adventure teaches lessons.', 'The journey matters.']
        },
        learning: {
            subjects: ['student', 'teacher', 'scientist', 'artist', 'writer', 'mathematician', 'musician', 'reader'],
            icons: ['👨‍🎓', '👩‍🏫', '🔬', '🎨', '✍️', '🔢', '🎵', '📖'],
            verbs: ['learned fascinating new things', 'taught others with patience and care', 'made incredible discoveries', 'created works of beauty', 'wrote inspiring stories', 'solved difficult problems', 'made beautiful music', 'read books from around the world'],
            morals: ['Learning never ends.', 'Knowledge is power.', 'Education opens minds.', 'Creativity enriches life.']
        },
        bedtime: {
            subjects: ['moon', 'star', 'dream', 'night', 'sleep', 'teddy bear', 'pillow', 'blanket', 'lullaby'],
            icons: ['🌙', '⭐', '💭', '🌃', '😴', '🧸', '🛏️', '🛏️', '🎵'],
            verbs: ['brought peaceful dreams', 'shone bright in the darkness', 'gently guided everyone to sleep', 'wrapped everyone warmly and safely', 'sang the softest lullaby', 'provided comfort through the night', 'gave much-needed rest'],
            morals: ['Rest renews us.', 'Dreams inspire us.', 'Peace brings healing.', 'Sleep is essential.']
        }
    };

    return templates[category] || templates.nature;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Navigation
function selectAge(age) {
    currentAge = age;
    document.getElementById('age-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
}

function backToAges() {
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('age-selection').style.display = 'block';
}

function selectCategory(category) {
    currentCategory = category;
    currentDifficulty = 'easy'; // Default to easy when skipping difficulty selection

    document.getElementById('category-selection').style.display = 'none';

    // Skip difficulty selection and show stories directly
    showStories('easy');
}

function showStories(difficulty) {
    currentDifficulty = difficulty;

    // Get unique stories for the selected category and difficulty
    console.log('Loading stories for:', currentCategory, difficulty);
    currentList = generateStories(currentCategory, difficulty);
    console.log('Loaded', currentList.length, 'unique stories');

    // Limit to 2 stories per age-difficulty in demo mode
    const limit = getDemoLimit(currentList.length);
    const limitedList = currentList.slice(0, limit);

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

    document.getElementById('category-title').textContent = `${categoryNames[currentCategory]} - ${difficultyStars[difficulty]} (${limitedList.length} stories)`;

    const container = document.getElementById('stories-container');
    container.innerHTML = '';

    limitedList.forEach((story, index) => {
        const card = document.createElement('div');
        card.className = 'story-card';
        card.onclick = () => readStory(index);

        // Handle both unique stories (with 'image') and generated stories (with 'illustration')
        const cardIconHTML = story.image
            ? `<img src="${story.image}" alt="${story.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;">`
            : `<div style="font-size: 3em;">${story.illustration || '📖'}</div>`;

        card.innerHTML = `
            <div class="story-card-icon">${cardIconHTML}</div>
            <div class="story-card-title">${story.title}</div>
        `;
        container.appendChild(card);
    });
}

function backToDifficulty() {
    // Renamed function - now goes back to categories
    backToCategories();
}

function backToCategories() {
    document.getElementById('story-list').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
}

function readStory(index) {
    currentStoryIndex = index;
    const story = currentList[index];

    document.getElementById('story-list').style.display = 'none';
    document.getElementById('story-reader').style.display = 'block';

    // Handle both unique stories (with 'image' and 'story') and generated stories (with 'illustration' and 'text')
    const illustrationHTML = story.image
        ? `<img src="${story.image}" alt="${story.title}" style="max-width: 100%; border-radius: 10px; margin: 20px 0;">`
        : `<div class="story-icon" style="font-size: 8em;">${story.illustration || '📖'}</div>`;

    const storyText = story.story || story.text || '';

    document.getElementById('story-content').innerHTML = `
        <div class="navigation" style="margin-bottom: 20px;">
            <button onclick="backToList()" style="padding: 12px 24px; border: none; border-radius: 8px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; font-weight: bold; cursor: pointer;">← Back to List</button>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-size: 1.2em; font-weight: bold;">
            📊 Age Group: ${currentAge}
        </div>
        <div class="story-meta">Story ${index + 1} of ${currentList.length}</div>
        <h1 class="story-title">${story.title}</h1>
        <div class="story-illustration">
            <div class="story-scene">
                ${illustrationHTML}
            </div>
        </div>
        <div class="story-text">${storyText}</div>
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
