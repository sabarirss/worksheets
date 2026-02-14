// Learn English with Stories Generator
// Original educational stories for different age groups

let currentAgeGroup = null;
let currentStory = null;

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

// Navigation functions
function backToAgeSelection() {
    document.getElementById('story-selection').style.display = 'none';
    document.getElementById('story-reader').style.display = 'none';
    document.getElementById('age-selection').style.display = 'block';
}

function backToStoryList() {
    document.getElementById('story-reader').style.display = 'none';
    document.getElementById('story-selection').style.display = 'block';
}

// Story Database - Original educational stories
const storyDatabase = {
    '4-6': [
        {
            id: 1,
            title: "Max the Cat",
            icon: "🐱",
            level: "Beginner",
            wordCount: 80,
            grammarFocus: "Simple present tense, 'is/are'",
            vocabulary: ["cat", "happy", "play", "jump", "sleep"],
            content: [
                "Max is a cat. He is orange and white.",
                "Max likes to play. He plays with a ball.",
                "The ball is red. It is round.",
                "Max jumps high. He jumps on the chair.",
                "Max is happy. He likes to run.",
                "At night, Max sleeps. He sleeps in his bed.",
                "Max is a good cat!"
            ],
            questions: [
                {
                    question: "What color is Max?",
                    options: ["Orange and white", "Black and white", "Gray", "Brown"],
                    correct: 0
                },
                {
                    question: "What does Max play with?",
                    options: ["A stick", "A ball", "A toy car", "A rope"],
                    correct: 1
                },
                {
                    question: "Where does Max sleep?",
                    options: ["On the floor", "In a box", "In his bed", "On the chair"],
                    correct: 2
                }
            ]
        },
        {
            id: 2,
            title: "Sam Goes to the Park",
            icon: "🏞️",
            level: "Beginner",
            wordCount: 90,
            grammarFocus: "Action verbs, simple sentences",
            vocabulary: ["park", "swing", "slide", "friend", "fun"],
            content: [
                "Sam goes to the park. It is a sunny day.",
                "The park is big. There are many trees.",
                "Sam sees a swing. He swings high.",
                "Next, Sam goes to the slide. The slide is tall.",
                "Sam slides down fast. Wheee!",
                "Sam sees his friend Ben. They play together.",
                "Sam and Ben have fun. They love the park!"
            ],
            questions: [
                {
                    question: "Where does Sam go?",
                    options: ["To school", "To the park", "To the store", "To home"],
                    correct: 1
                },
                {
                    question: "What is the weather like?",
                    options: ["Rainy", "Snowy", "Sunny", "Windy"],
                    correct: 2
                },
                {
                    question: "Who does Sam play with?",
                    options: ["His sister", "His mom", "His friend Ben", "His dog"],
                    correct: 2
                }
            ]
        }
    ],
    '7-9': [
        {
            id: 1,
            title: "The Lost Puppy",
            icon: "🐕",
            level: "Early Reader",
            wordCount: 200,
            grammarFocus: "Past tense, dialogue, adjectives",
            vocabulary: ["worried", "search", "neighbor", "relieved", "adventure"],
            content: [
                "Emma loved her puppy, Spot. He was small and brown with a white patch on his chest.",
                "One morning, Emma woke up and couldn't find Spot anywhere. She looked under the bed, in the closet, and behind the sofa. Spot was gone!",
                '"Mom, I can\'t find Spot!" Emma cried.',
                '"Don\'t worry, dear. Let\'s look outside," Mom said calmly.',
                "They searched the garden and called Spot's name. Emma was very worried.",
                "Then, their neighbor Mrs. Green appeared at the fence. She was smiling.",
                '"Are you looking for a small brown puppy?" she asked.',
                '"Yes! Have you seen him?" Emma asked hopefully.',
                '"He\'s in my garden, playing with my cat! They became friends this morning," Mrs. Green laughed.',
                "Emma ran to Mrs. Green's garden. There was Spot, wagging his tail happily!",
                "Emma hugged Spot tightly. She was so relieved. What an adventure!"
            ],
            questions: [
                {
                    question: "What color was Spot?",
                    options: ["Black and white", "Brown with a white patch", "All brown", "Golden"],
                    correct: 1
                },
                {
                    question: "How did Emma feel when she couldn't find Spot?",
                    options: ["Happy", "Worried", "Angry", "Excited"],
                    correct: 1
                },
                {
                    question: "Where was Spot found?",
                    options: ["Under Emma's bed", "At the park", "In Mrs. Green's garden", "On the street"],
                    correct: 2
                },
                {
                    question: "What was Spot doing when he was found?",
                    options: ["Sleeping", "Eating", "Playing with a cat", "Running away"],
                    correct: 2
                }
            ]
        },
        {
            id: 2,
            title: "The School Garden Project",
            icon: "🌱",
            level: "Early Reader",
            wordCount: 220,
            grammarFocus: "Present continuous, future tense, compound sentences",
            vocabulary: ["project", "responsibility", "patient", "flourish", "proud"],
            content: [
                "Ms. Lopez announced an exciting project to the class. Each student would grow their own plant!",
                '"This will teach you about responsibility and patience," she explained.',
                "Jake chose to grow tomatoes. His friend Maya picked sunflowers. They collected their seeds and small pots.",
                "Every morning before class, Jake watered his tomato plant. He made sure it got enough sunlight by placing it near the window.",
                "Maya was taking care of her sunflower seeds too. She measured how much they grew each week and wrote it in her science journal.",
                "Three weeks passed. Jake's tomato plant was growing tall with green leaves. Maya's sunflower was even taller!",
                '"Look how much they\'ve grown!" Jake said excitedly.',
                '"My sunflower is taller than me now," Maya giggled.',
                "After two months, Jake's plant had small red tomatoes. Maya's sunflower had big yellow petals.",
                "They showed their plants at the school science fair. Everyone was impressed!",
                "Jake and Maya learned that good things come to those who wait. They felt proud of their hard work."
            ],
            questions: [
                {
                    question: "What did Ms. Lopez want to teach the students?",
                    options: ["Math skills", "Responsibility and patience", "Art techniques", "Sports rules"],
                    correct: 1
                },
                {
                    question: "What did Jake choose to grow?",
                    options: ["Sunflowers", "Tomatoes", "Roses", "Carrots"],
                    correct: 1
                },
                {
                    question: "How did Maya track her plant's progress?",
                    options: ["She took photos", "She drew pictures", "She wrote in her journal", "She told her teacher"],
                    correct: 2
                },
                {
                    question: "How long did it take for the plants to fully grow?",
                    options: ["One week", "Three weeks", "Two months", "Six months"],
                    correct: 2
                }
            ]
        }
    ],
    '10-12': [
        {
            id: 1,
            title: "The Mystery of the Old Lighthouse",
            icon: "🗼",
            level: "Advanced Reader",
            wordCount: 350,
            grammarFocus: "Complex sentences, descriptive language, past perfect tense",
            vocabulary: ["abandoned", "mysterious", "investigation", "determination", "preserved"],
            content: [
                "The old lighthouse stood at the edge of the cliff, overlooking the vast ocean. It had been abandoned for thirty years, yet strange lights were sometimes seen flickering in its tower at night.",
                "Twelve-year-old Sophie was curious about these mysterious lights. She had heard the local legends about the lighthouse, but she wanted to discover the truth.",
                '"There must be a logical explanation," Sophie told her older brother, Marcus.',
                '"Maybe it\'s just reflections from passing ships," Marcus suggested, though he didn\'t sound convinced.',
                "That Saturday, they decided to investigate. With their father's permission, they hiked along the rocky coastal path to the lighthouse.",
                "The building looked even more impressive up close. Its paint was peeling, and seagulls had made nests in the cracks of the walls.",
                "They found the door unlocked. Inside, a spiral staircase wound its way upward. Despite the decay, the structure seemed solid.",
                "As they climbed, Sophie noticed something unusual. Small solar panels had been installed near the windows, hidden from view below.",
                '"Look at this!" Sophie exclaimed, examining the equipment.',
                "At the top, they found a radio transmitter and weather monitoring equipment. Everything was modern and well-maintained.",
                "An elderly man emerged from a small room. He introduced himself as Dr. Chen, a marine biologist.",
                '"I\'ve been using this abandoned lighthouse as a research station," he explained. "I monitor ocean temperatures and marine life migration patterns."',
                '"But why at night?" Marcus asked.',
                '"The lights you see are from my computer screens and instruments. I often work late analyzing data," Dr. Chen smiled.',
                "Sophie and Marcus were thrilled to solve the mystery. Dr. Chen even showed them his research and explained how important it was for understanding climate change.",
                "The 'mystery' of the lighthouse had a perfectly reasonable explanation, but Sophie realized that real science could be just as exciting as any ghost story."
            ],
            questions: [
                {
                    question: "How long had the lighthouse been abandoned?",
                    options: ["Ten years", "Twenty years", "Thirty years", "Forty years"],
                    correct: 2
                },
                {
                    question: "What was Sophie's attitude toward the mystery?",
                    options: ["She was scared", "She was curious and wanted logical answers", "She believed in ghosts", "She wasn't interested"],
                    correct: 1
                },
                {
                    question: "What did Sophie discover on the way up the stairs?",
                    options: ["Old paintings", "Solar panels", "Treasure", "Bird nests"],
                    correct: 1
                },
                {
                    question: "What was Dr. Chen's profession?",
                    options: ["Lighthouse keeper", "Marine biologist", "Historian", "Engineer"],
                    correct: 1
                },
                {
                    question: "What was the real explanation for the mysterious lights?",
                    options: ["Ghosts", "Passing ships", "Computer screens and research instruments", "Reflections from the moon"],
                    correct: 2
                }
            ]
        },
        {
            id: 2,
            title: "The Time Capsule Discovery",
            icon: "📦",
            level: "Advanced Reader",
            wordCount: 380,
            grammarFocus: "Narrative structure, varied sentence types, conditional sentences",
            vocabulary: ["renovations", "coincidence", "decades", "generations", "perspective"],
            content: [
                "When the old community center announced renovations, nobody expected to find a piece of history hidden in its walls.",
                "Thirteen-year-old Aisha volunteered to help catalog items during the renovation. She enjoyed learning about the building's history.",
                "One afternoon, while workers were removing old floorboards, they discovered a metal box embedded in the concrete foundation.",
                '"Stop everything!" called out Mr. Peterson, the project manager. "We need to open this carefully."',
                "The box was a time capsule from 1950, exactly seventy-five years ago. Inside were letters, photographs, newspaper clippings, and predictions about the future written by students from the local middle school.",
                "Aisha carefully examined each item with cotton gloves. One letter particularly caught her attention.",
                '"Dear Future Friend," it began. "My name is Margaret Chen, and I\'m twelve years old. I wonder what the world will be like when you read this."',
                "The letter described Margaret's daily life: walking to school, listening to radio programs, and helping her parents in their family store. She dreamed of becoming a scientist, even though few women worked in science at that time.",
                "Aisha felt a connection across the decades. She realized that Margaret's dreams and worries weren't so different from her own.",
                "The newspaper clippings revealed community concerns about new technologies and changing society. People worried whether television would replace radio, and whether cars would make horses obsolete.",
                '"If they could see us now with our smartphones and internet!" Aisha thought, amused.',
                "But what fascinated Aisha most was a section titled 'Our Predictions for 2025.' Some were surprisingly accurate: they predicted computers in homes and video phone calls. Others were wildly imaginative: flying cars and robot servants.",
                "Aisha had an idea. Why not create a response? She proposed that the current students write letters back to the past, describing how their predictions came true (or didn't) and what life is really like now.",
                "The project became a school-wide initiative. Students researched the 1950s, compared life then and now, and reflected on what future generations might think of their time.",
                "Aisha also tried to find Margaret Chen. After some research online, she discovered that Margaret had indeed become a scientist—a pioneering environmental researcher who had published important work on climate change.",
                "Aisha wrote to Dr. Chen, now 87 years old, telling her about the time capsule. Dr. Chen wrote back, delighted that her childhood message had been found.",
                "The experience taught Aisha that while technology changes rapidly, human hopes, dreams, and curiosity remain constant across generations. She decided to include a letter of her own in a new time capsule, to be opened in 2100."
            ],
            questions: [
                {
                    question: "What was Aisha doing at the community center?",
                    options: ["Attending classes", "Helping with renovation cataloging", "Playing sports", "Working part-time"],
                    correct: 1
                },
                {
                    question: "How old was the time capsule?",
                    options: ["Fifty years", "Seventy-five years", "One hundred years", "Sixty years"],
                    correct: 1
                },
                {
                    question: "What did Margaret Chen dream of becoming?",
                    options: ["A teacher", "A writer", "A scientist", "An artist"],
                    correct: 2
                },
                {
                    question: "Which prediction from 1950 was accurate?",
                    options: ["Flying cars", "Robot servants", "Computers in homes", "Time travel"],
                    correct: 2
                },
                {
                    question: "What did Aisha learn from the experience?",
                    options: ["Technology never changes", "The past was better", "Human curiosity remains constant across generations", "Science is too difficult"],
                    correct: 2
                },
                {
                    question: "What happened to Margaret Chen?",
                    options: ["She became a teacher", "She became a famous scientist", "She never pursued her dreams", "She moved away"],
                    correct: 1
                }
            ]
        }
    ]
};

// Load story list for selected age group
function loadStoryList(ageGroup) {
    currentAgeGroup = ageGroup;
    const stories = storyDatabase[ageGroup] || [];

    // Apply demo limiting
    const limitedStories = stories.slice(0, getDemoLimit(stories.length));

    document.getElementById('age-selection').style.display = 'none';
    document.getElementById('story-selection').style.display = 'block';

    const ageLabels = {
        '4-6': 'Ages 4-6: Beginner Stories',
        '7-9': 'Ages 7-9: Early Reader',
        '10-12': 'Ages 10-12: Advanced Reader'
    };

    document.getElementById('story-list-title').textContent = ageLabels[ageGroup];

    const listContainer = document.getElementById('story-list');
    listContainer.innerHTML = limitedStories.map(story => `
        <div class="story-card" onclick="loadStory('${ageGroup}', ${story.id})">
            <div class="story-icon">${story.icon}</div>
            <div class="story-title">${story.title}</div>
            <div class="story-meta">
                Level: ${story.level}<br>
                Words: ${story.wordCount}
            </div>
        </div>
    `).join('');
}

// Load and display a story
function loadStory(ageGroup, storyId) {
    const story = storyDatabase[ageGroup].find(s => s.id === storyId);
    if (!story) return;

    currentStory = story;

    document.getElementById('story-selection').style.display = 'none';
    document.getElementById('story-reader').style.display = 'block';

    const readerContainer = document.getElementById('story-reader');
    readerContainer.innerHTML = `
        <div class="navigation" style="margin-bottom: 20px;">
            <button onclick="backToStoryList()">← Back to Stories</button>
        </div>

        <div class="story-reader">
            <div class="story-header">
                <div style="font-size: 3em; margin-bottom: 10px;">${story.icon}</div>
                <h2>${story.title}</h2>
                <p style="color: #666;">Level: ${story.level} | ${story.wordCount} words</p>
            </div>

            <div class="grammar-focus">
                <h4>📖 Grammar Focus</h4>
                <p>${story.grammarFocus}</p>
            </div>

            <div class="vocabulary-box">
                <h4>📚 New Words to Learn</h4>
                ${story.vocabulary.map(word => `<span class="vocab-word">${word}</span>`).join('')}
            </div>

            <div class="story-content">
                ${story.content.map(para => `<p>${para}</p>`).join('')}
            </div>

            <div class="comprehension-section">
                <h3 style="color: #667eea; text-align: center; margin-bottom: 25px;">
                    🤔 Comprehension Questions
                </h3>
                ${story.questions.map((q, index) => `
                    <div class="question" id="question-${index}">
                        <div class="question-text">Question ${index + 1}: ${q.question}</div>
                        <div class="options">
                            ${q.options.map((opt, optIndex) => `
                                <button class="option-btn"
                                        data-question="${index}"
                                        data-option="${optIndex}"
                                        onclick="checkAnswer(${index}, ${optIndex}, ${q.correct})">
                                    ${String.fromCharCode(65 + optIndex)}. ${opt}
                                </button>
                            `).join('')}
                        </div>
                        <div id="feedback-${index}" style="margin-top: 10px; font-weight: bold;"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Check comprehension answer
function checkAnswer(questionIndex, selectedOption, correctOption) {
    const questionDiv = document.getElementById(`question-${questionIndex}`);
    const buttons = questionDiv.querySelectorAll('.option-btn');
    const feedback = document.getElementById(`feedback-${questionIndex}`);

    // Disable all buttons
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
    });

    // Mark correct answer in green
    buttons[correctOption].classList.add('correct');

    if (selectedOption === correctOption) {
        feedback.textContent = '✓ Correct! Well done!';
        feedback.style.color = '#4caf50';
    } else {
        // Mark wrong answer in red
        buttons[selectedOption].classList.add('incorrect');
        feedback.textContent = `✗ Not quite. The correct answer is ${String.fromCharCode(65 + correctOption)}.`;
        feedback.style.color = '#f44336';
    }
}
