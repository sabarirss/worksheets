// English Worksheet Generator

// State variables for navigation
let selectedAgeGroup = null;
let selectedDifficulty = null;
let selectedType = null; // 'writing' or 'reading'
let currentStory = null;

// Navigation functions
function selectAgeGroup(ageGroup) {
    selectedAgeGroup = ageGroup;
    document.getElementById('age-groups').style.display = 'none';
    document.getElementById('type-selection').style.display = 'block';
}

function backToAgeGroups() {
    document.getElementById('type-selection').style.display = 'none';
    document.getElementById('writing-difficulties').style.display = 'none';
    document.getElementById('reading-difficulties').style.display = 'none';
    document.getElementById('age-groups').style.display = 'block';
}

function selectType(type) {
    selectedType = type;
    document.getElementById('type-selection').style.display = 'none';

    if (type === 'writing') {
        // Show writing difficulties and update descriptions
        document.getElementById('writing-difficulties').style.display = 'block';
        updateWritingDifficultyDescriptions();

        // Hide writing practice button for ages 9+ and 10+
        const writingBtn = document.getElementById('writing-practice-btn');
        if (selectedAgeGroup === '9+' || selectedAgeGroup === '10+') {
            writingBtn.style.display = 'none';
        } else {
            writingBtn.style.display = 'flex';
        }
    } else if (type === 'reading') {
        document.getElementById('reading-difficulties').style.display = 'block';
    }
}

function backToTypeSelection() {
    document.getElementById('writing-difficulties').style.display = 'none';
    document.getElementById('reading-difficulties').style.display = 'none';
    document.getElementById('story-selection').style.display = 'none';
    document.getElementById('type-selection').style.display = 'block';
}

function selectReadingDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    loadStoryList();
}

function backToReadingDifficulties() {
    document.getElementById('story-selection').style.display = 'none';
    document.getElementById('reading-difficulties').style.display = 'block';
}

function backToStoryListFromReader() {
    document.getElementById('story-reader').style.display = 'none';
    document.getElementById('story-selection').style.display = 'block';
}

// Legacy functions for compatibility
function showAgeGroups() {
    backToAgeGroups();
}

function showDifficulties(ageGroup) {
    selectAgeGroup(ageGroup);
}

function updateWritingDifficultyDescriptions() {
    if (!selectedAgeGroup) return;

    const config = contentConfigs[selectedAgeGroup];
    if (!config) return;

    const easyDesc = document.getElementById('writing-easy-desc');
    const mediumDesc = document.getElementById('writing-medium-desc');
    const hardDesc = document.getElementById('writing-hard-desc');

    if (easyDesc && config.easy) easyDesc.textContent = config.easy.description;
    if (mediumDesc && config.medium) mediumDesc.textContent = config.medium.description;
    if (hardDesc && config.hard) hardDesc.textContent = config.hard.description;
}

function loadWorksheetNew(difficulty) {
    selectedDifficulty = difficulty;
    if (selectedAgeGroup && selectedDifficulty) {
        loadWorksheet(selectedAgeGroup, selectedDifficulty);
    }
}

function backToWorksheetSelection() {
    // Hide worksheet content and show writing difficulties
    const worksheetContainer = document.getElementById('english-worksheet-content');
    if (worksheetContainer) {
        worksheetContainer.style.display = 'none';
    }
    document.getElementById('writing-difficulties').style.display = 'block';
}

let currentWorksheet = null;
let currentPage = 1;
let totalPages = 20; // For writing practice
let timer = null;
let startTime = null;
let elapsedSeconds = 0;
let answersVisible = false;
let writingCanvases = [];

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

// Story Database - Original educational stories
// Organized by age group and difficulty level
const storyDatabase = {
    '4-5': {
        easy: [
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
        }],
        medium: [
        {
            id: 3,
            title: "The Big Red Bus",
            icon: "🚌",
            level: "Beginner",
            wordCount: 95,
            grammarFocus: "Colors, sizes, action verbs",
            vocabulary: ["bus", "ride", "stop", "driver", "window"],
            content: [
                "Lily sees a big red bus. The bus stops near her house.",
                "The driver smiles. He opens the door.",
                "Lily gets on the bus. She sits by the window.",
                "The bus moves. It goes down the street.",
                "Lily looks out the window. She sees trees and houses.",
                "The bus stops at the park. Lily's mom is there.",
                "Lily waves goodbye to the driver. She had a fun ride!"
            ],
            questions: [
                {
                    question: "What color is the bus?",
                    options: ["Blue", "Red", "Yellow", "Green"],
                    correct: 1
                },
                {
                    question: "Where does Lily sit?",
                    options: ["By the door", "By the window", "In the back", "Near the driver"],
                    correct: 1
                },
                {
                    question: "Where does the bus stop?",
                    options: ["At school", "At home", "At the park", "At the store"],
                    correct: 2
                }
            ]
        }],
        hard: [
        {
            id: 4,
            title: "Baking Cookies",
            icon: "🍪",
            level: "Beginner",
            wordCount: 110,
            grammarFocus: "Sequence words (first, then, next, finally)",
            vocabulary: ["bake", "mix", "oven", "delicious", "share"],
            content: [
                "Today, Mom and I are baking cookies. I am excited!",
                "First, we get a big bowl. We put flour in it.",
                "Then, we add sugar and butter. I help mix everything.",
                "Mom cracks two eggs into the bowl. I stir and stir.",
                "Next, we make small balls with the dough. We put them on a tray.",
                "Mom puts the tray in the oven. We wait for 15 minutes.",
                "Finally, the cookies are ready! They smell delicious.",
                "The cookies are warm and sweet. I share them with Dad.",
                "Baking cookies is fun. I want to bake again tomorrow!"
            ],
            questions: [
                {
                    question: "What do they make first?",
                    options: ["They crack eggs", "They get a bowl", "They mix flour", "They bake cookies"],
                    correct: 1
                },
                {
                    question: "How long do the cookies bake?",
                    options: ["5 minutes", "10 minutes", "15 minutes", "20 minutes"],
                    correct: 2
                },
                {
                    question: "Who does the child share cookies with?",
                    options: ["Mom", "A friend", "Dad", "The teacher"],
                    correct: 2
                }
            ]
        }]
    },
    '6': {
        easy: [
        {
            id: 1,
            title: "The Rainbow",
            icon: "🌈",
            level: "Early Reader",
            wordCount: 100,
            grammarFocus: "Color names, descriptive adjectives",
            vocabulary: ["rainbow", "beautiful", "after", "rain", "sky"],
            content: [
                "Yesterday, it rained all morning. The sky was gray and cloudy.",
                "Then the rain stopped. The sun came out from behind the clouds.",
                "I looked up at the sky. I saw something beautiful!",
                "It was a rainbow! It had many colors.",
                "I saw red, orange, yellow, green, blue, and purple.",
                "The rainbow was very big. It stretched across the whole sky.",
                "My little sister came outside. She saw the rainbow too.",
                "We pointed at the colors. We counted them together.",
                "The rainbow stayed for ten minutes. Then it slowly faded away.",
                "I hope to see another rainbow soon. Rainbows make me happy!"
            ],
            questions: [
                {
                    question: "When did it rain?",
                    options: ["At night", "All morning", "In the evening", "All day"],
                    correct: 1
                },
                {
                    question: "How many colors did the child see?",
                    options: ["Four", "Five", "Six", "Seven"],
                    correct: 2
                },
                {
                    question: "How long did the rainbow stay?",
                    options: ["Five minutes", "Ten minutes", "Fifteen minutes", "One hour"],
                    correct: 1
                }
            ]
        }],
        medium: [{
            id: 2,
            title: "The Library Adventure",
            icon: "📚",
            level: "Early Reader",
            wordCount: 130,
            grammarFocus: "Question words (who, what, where, when, why)",
            vocabulary: ["library", "borrow", "librarian", "quiet", "discover"],
            content: [
                "Today, Mom and I went to the library. I have never been there before.",
                "The library is a big building with many books. Thousands of books!",
                "A nice librarian named Ms. Johnson greeted us. She showed us around.",
                "'This is the children's section,' she said. 'You can find picture books, chapter books, and comics here.'",
                "I saw books about dinosaurs, space, animals, and magic. So many choices!",
                "Mom helped me choose three books. One was about a brave knight. One was about ocean animals. The last one was a funny story about a talking dog.",
                "'Can I take these home?' I asked Ms. Johnson.",
                "'Yes! You can borrow them for two weeks,' she explained. 'Just bring them back when you're done.'",
                "She scanned the books with a special machine. She gave me a library card with my name on it!",
                "On the way home, I couldn't wait to start reading.",
                "That night, I read the story about the talking dog. It made me laugh!",
                "The next day, I read about ocean animals. I learned that octopuses have three hearts!",
                "Libraries are amazing places. I can't wait to go back and borrow more books.",
                "Now I know the answer to 'Where can I find adventure?' At the library!"
            ],
            questions: [
                {
                    question: "Who showed them around the library?",
                    options: ["Mom", "Ms. Johnson", "A teacher", "A friend"],
                    correct: 1
                },
                {
                    question: "How many books did the child borrow?",
                    options: ["One", "Two", "Three", "Four"],
                    correct: 2
                },
                {
                    question: "How long can books be borrowed?",
                    options: ["One week", "Two weeks", "One month", "Forever"],
                    correct: 1
                },
                {
                    question: "What did the child learn about octopuses?",
                    options: ["They have three hearts", "They are blue", "They are small", "They live in rivers"],
                    correct: 0
                }
            ]
        },
        {
            id: 3,
            title: "Making New Friends",
            icon: "👫",
            level: "Early Reader",
            wordCount: 125,
            grammarFocus: "Dialogue, feelings vocabulary",
            vocabulary: ["nervous", "introduce", "friendship", "conversation", "common"],
            content: [
                "It was my first day at a new school. I felt nervous as I walked into the classroom.",
                "Mrs. Brown, my new teacher, smiled at me. 'Class, we have a new student. Please welcome Alex!'",
                "Everyone looked at me. My face felt hot. I quietly said, 'Hello.'",
                "Mrs. Brown pointed to an empty seat. 'You can sit next to Maria,' she said.",
                "I sat down. Maria smiled and whispered, 'Hi! I like your backpack. Is that a dinosaur?'",
                "'Yes, it's a T-Rex,' I replied. 'Dinosaurs are my favorite!'",
                "'Mine too!' Maria's eyes lit up. 'Do you know what the longest dinosaur was?'",
                "We talked about dinosaurs during break time. Maria knew so much!",
                "She introduced me to her friends Leo and Jasmine. They were all very friendly.",
                "Leo asked, 'Do you want to play soccer with us?'",
                "I nodded happily. We played together at recess. I scored a goal!",
                "At the end of the day, Maria said, 'Same seat tomorrow?'",
                "'Definitely!' I replied with a big smile.",
                "My first day wasn't scary after all. I made new friends who liked the same things I did.",
                "Sometimes, all it takes is one person being friendly to make everything better."
            ],
            questions: [
                {
                    question: "How did Alex feel on the first day?",
                    options: ["Excited", "Nervous", "Angry", "Bored"],
                    correct: 1
                },
                {
                    question: "What did Alex and Maria both like?",
                    options: ["Soccer", "Books", "Dinosaurs", "Art"],
                    correct: 2
                },
                {
                    question: "Who did Maria introduce to Alex?",
                    options: ["Her teacher", "Her parents", "Leo and Jasmine", "Her sister"],
                    correct: 2
                },
                {
                    question: "What game did they play at recess?",
                    options: ["Basketball", "Soccer", "Tag", "Hide and seek"],
                    correct: 1
                }
            ]
        }],
        hard: [
        {
            id: 3,
            title: "The Helpful Robot",
            icon: "🤖",
            level: "Early Reader",
            wordCount: 140,
            grammarFocus: "Simple past tense, helping verbs (can, could)",
            vocabulary: ["robot", "helpful", "chores", "tired", "grateful"],
            content: [
                "My family got a new robot last week. His name is Robo.",
                "Robo is very helpful. He can do many things around the house.",
                "In the morning, Robo makes breakfast. He cooks eggs and toast.",
                "After breakfast, Robo cleans the dishes. He washes them carefully.",
                "When I go to school, Robo tidies my room. He makes my bed and picks up my toys.",
                "In the afternoon, Robo helps my mom with the laundry. He folds all the clothes neatly.",
                "Robo can also water the plants in our garden. He does it every day.",
                "At night, Robo tells me a bedtime story. He has a gentle voice.",
                "Sometimes Robo plays games with me. He is good at chess!",
                "My parents say Robo saved them a lot of time. Now they are less tired.",
                "I am grateful for Robo. He is not just a robot. He is part of our family!"
            ],
            questions: [
                {
                    question: "What does Robo make for breakfast?",
                    options: ["Pancakes", "Eggs and toast", "Cereal", "Sandwiches"],
                    correct: 1
                },
                {
                    question: "When does Robo tidy the child's room?",
                    options: ["At night", "After breakfast", "When the child is at school", "In the afternoon"],
                    correct: 2
                },
                {
                    question: "How do the parents feel about Robo?",
                    options: ["Angry", "Worried", "Grateful", "Confused"],
                    correct: 2
                },
                {
                    question: "What game does Robo play with the child?",
                    options: ["Soccer", "Chess", "Hide and seek", "Video games"],
                    correct: 1
                }
            ]
        }]
    },
    '7': {
        easy: [
        {
            id: 1,
            title: "The Class Pet",
            icon: "🐹",
            level: "Developing Reader",
            wordCount: 150,
            grammarFocus: "Present continuous tense, responsibility words",
            vocabulary: ["responsibility", "schedule", "observe", "habitat", "behavior"],
            content: [
                "Our class has a new pet hamster. Her name is Peanut. She is small and brown.",
                "Miss Carter, our teacher, said we must take good care of Peanut. Everyone will have a turn.",
                "We made a schedule. On Monday, Tom feeds Peanut. On Tuesday, Sarah cleans her cage.",
                "Today is Wednesday. It is my turn to take care of Peanut!",
                "I arrive at school early. First, I check if Peanut has enough water. Her bottle is half empty, so I fill it up.",
                "Next, I give her fresh food. Peanut loves carrots and sunflower seeds.",
                "I watch Peanut eat. She holds the food in her tiny paws. It is very cute!",
                "Peanut is running on her wheel. She is getting exercise. I write this in our observation journal.",
                "At lunchtime, I check on Peanut again. She is sleeping in her little house. Hamsters sleep during the day.",
                "Taking care of Peanut is a big responsibility. But I enjoy it very much.",
                "Tomorrow, it will be Emma's turn. I will tell her what Peanut needs.",
                "Having a class pet teaches us to be responsible. Everyone is learning!"
            ],
            questions: [
                {
                    question: "What is the hamster's name?",
                    options: ["Fluffy", "Peanut", "Cookie", "Brownie"],
                    correct: 1
                },
                {
                    question: "When does the child take care of Peanut?",
                    options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
                    correct: 2
                },
                {
                    question: "What does Peanut do during the day?",
                    options: ["She plays", "She sleeps", "She runs", "She eats"],
                    correct: 1
                },
                {
                    question: "What did the child write in?",
                    options: ["A book", "The schedule", "An observation journal", "A letter"],
                    correct: 2
                }
            ]
        }],
        medium: [
        {
            id: 2,
            title: "The Birthday Surprise",
            icon: "🎂",
            level: "Developing Reader",
            wordCount: 180,
            grammarFocus: "Past tense narrative, time expressions",
            vocabulary: ["surprise", "secretly", "decorated", "delighted", "celebrate"],
            content: [
                "Last Saturday was Dad's birthday. My sister and I wanted to surprise him.",
                "Two weeks before his birthday, we started planning secretly. We saved our pocket money to buy him a gift.",
                "On Friday night, Dad went to bed early. Mom helped us prepare everything.",
                "We blew up colorful balloons and hung them in the living room. We made a big banner that said 'Happy Birthday Dad!'",
                "My sister baked a chocolate cake. It was Dad's favorite. I helped her put candles on top.",
                "We wrapped our present carefully. We had bought him a new watch because his old one was broken.",
                "On Saturday morning, we woke up very early. Everything was ready. We were so excited!",
                "When Dad came downstairs, we all shouted, 'SURPRISE!' His face showed complete shock.",
                "Dad looked around at the decorations. He saw the cake with the candles. Then he noticed the wrapped present.",
                "'This is wonderful!' Dad exclaimed. He had tears in his eyes. They were happy tears.",
                "We sang 'Happy Birthday' together. Dad blew out all the candles and made a wish.",
                "He opened his present and loved the new watch. 'Thank you so much,' he said, hugging us tightly.",
                "We ate cake for breakfast. Mom said it was okay because it was a special day.",
                "Dad said it was the best birthday surprise ever. We were delighted that our plan worked!"
            ],
            questions: [
                {
                    question: "How long did the children plan the surprise?",
                    options: ["One week", "Two weeks", "Three weeks", "One month"],
                    correct: 1
                },
                {
                    question: "What did the children buy for Dad?",
                    options: ["A book", "A watch", "A shirt", "Shoes"],
                    correct: 1
                },
                {
                    question: "What flavor was the cake?",
                    options: ["Vanilla", "Strawberry", "Chocolate", "Lemon"],
                    correct: 2
                },
                {
                    question: "How did Dad feel about the surprise?",
                    options: ["Angry", "Confused", "Sad", "Delighted"],
                    correct: 3
                }
            ]
        },
        {
            id: 3,
            title: "The Lost and Found Mystery",
            icon: "🔍",
            level: "Developing Reader",
            wordCount: 185,
            grammarFocus: "Past tense, mystery vocabulary, problem-solving",
            vocabulary: ["investigate", "clue", "suspect", "evidence", "solution"],
            content: [
                "Strange things were happening at school. Items kept disappearing from the lost and found box.",
                "First, Jenny's blue scarf vanished. Then Mark's favorite book disappeared. Finally, the principal's stapler went missing!",
                "My friends and I decided to investigate. We called ourselves the Mystery Club.",
                "I started keeping a notebook. I wrote down when things disappeared and who was nearby.",
                "The pattern was clear. Items always disappeared on Tuesday afternoons, right after lunch.",
                "On Tuesday, we watched the lost and found box carefully. We pretended to read books in the hallway.",
                "At 1:30 PM, we saw something surprising. A small orange cat jumped through the open window!",
                "The cat went straight to the lost and found box. She grabbed Jenny's scarf in her mouth and jumped back out.",
                "We followed the cat outside. She ran behind the school building to a cozy spot under the stairs.",
                "There we found all the missing items! The cat had made a comfortable nest with the scarf, book, and other soft things.",
                "The cat wasn't stealing. She was just building a home. She looked at us with big, scared eyes.",
                "We told Mrs. Peterson, the school nurse. She recognized the cat. 'That's Whiskers! She used to live nearby.'",
                "Mrs. Peterson explained that Whiskers' family had moved away. The poor cat was homeless.",
                "The principal decided Whiskers could be the school cat. We made her a proper bed with blankets.",
                "We returned everyone's belongings. Jenny was so happy she donated her old scarf to Whiskers!",
                "The mystery was solved, and Whiskers found a new home. Everyone was happy with this solution."
            ],
            questions: [
                {
                    question: "When did items disappear from the lost and found?",
                    options: ["Monday mornings", "Tuesday afternoons", "Wednesday evenings", "Friday mornings"],
                    correct: 1
                },
                {
                    question: "Who was taking the items?",
                    options: ["A student", "A teacher", "A cat named Whiskers", "The janitor"],
                    correct: 2
                },
                {
                    question: "Why was the cat taking items?",
                    options: ["To play with them", "To build a nest", "To hide them", "To sell them"],
                    correct: 1
                },
                {
                    question: "What happened to Whiskers at the end?",
                    options: ["She ran away", "She became the school cat", "She was taken to a shelter", "She went back to her family"],
                    correct: 1
                }
            ]
        }],
        hard: [
        {
            id: 4,
            title: "The Science Fair Project",
            icon: "🔬",
            level: "Developing Reader",
            wordCount: 200,
            grammarFocus: "Complex sentences, cause and effect",
            vocabulary: ["experiment", "hypothesis", "observe", "conclusion", "demonstrate"],
            content: [
                "The annual science fair was coming up. Every student in grade 7 had to create a project.",
                "My friend Alex and I decided to work together. We wanted to do something interesting about plants.",
                "'What if we test how different types of music affect plant growth?' Alex suggested.",
                "'That's brilliant!' I replied. 'We can have three groups of plants.'",
                "We wrote our hypothesis: Plants that listen to classical music will grow taller than plants that listen to rock music or no music.",
                "We bought 15 small bean plants. We divided them into three groups of five plants each.",
                "Group A listened to classical music for one hour every day. Group B listened to rock music. Group C stayed in silence.",
                "For four weeks, we observed the plants carefully. We measured their height every three days and wrote everything in our notebook.",
                "We made sure all plants got the same amount of water and sunlight. We only changed the music.",
                "After four weeks, we analyzed our results. The classical music plants grew an average of 15 centimeters.",
                "The rock music plants grew 12 centimeters. The silent plants grew 11 centimeters.",
                "Our hypothesis was correct! Classical music seemed to help the plants grow better.",
                "We created a display board with photos and graphs. We explained our method and conclusion clearly.",
                "At the science fair, many people visited our booth. They were impressed by our experiment.",
                "We learned that good experiments need careful planning and patience. Science is fascinating!"
            ],
            questions: [
                {
                    question: "What was the children's hypothesis?",
                    options: [
                        "Rock music helps plants grow",
                        "Classical music helps plants grow",
                        "Music doesn't affect plants",
                        "Silence is best for plants"
                    ],
                    correct: 1
                },
                {
                    question: "How many plants did they use in total?",
                    options: ["5", "10", "15", "20"],
                    correct: 2
                },
                {
                    question: "How often did they measure the plants?",
                    options: ["Every day", "Every two days", "Every three days", "Every week"],
                    correct: 2
                },
                {
                    question: "Which group of plants grew the tallest?",
                    options: ["Classical music group", "Rock music group", "Silent group", "They all grew the same"],
                    correct: 0
                }
            ]
        }]
    },
    '8': {
        easy: [
        {
            id: 1,
            title: "The Community Garden",
            icon: "🌻",
            level: "Confident Reader",
            wordCount: 220,
            grammarFocus: "Present perfect tense, community vocabulary",
            vocabulary: ["community", "volunteer", "cooperate", "harvest", "appreciate"],
            content: [
                "Our neighborhood has started a community garden. It's located on an empty lot that has been unused for years.",
                "Mrs. Kim, who lives on Oak Street, organized the project. She has always loved gardening and wanted to share it with others.",
                "Many families have volunteered to help. Each family gets a small plot of land to grow vegetables or flowers.",
                "My family chose Plot 12. We have planted tomatoes, lettuce, and carrots. We visit the garden every weekend.",
                "In the garden, we have met many neighbors we didn't know before. Mr. Rodriguez teaches us about composting. The Wilson family shares their gardening tools with everyone.",
                "Every Saturday morning, there is a work session. People cooperate to maintain the shared areas. We pull weeds, water the plants, and fix the fence together.",
                "The garden has brought our community closer. Children play while their parents work. Everyone talks and laughs.",
                "Last month, we had our first harvest. We picked ripe tomatoes, crisp lettuce, and crunchy carrots.",
                "Mrs. Kim organized a potluck dinner. Each family brought a dish made with vegetables from their plot.",
                "My mom made a fresh salad with our lettuce and tomatoes. It tasted better than any store-bought salad!",
                "During dinner, Mrs. Kim said, 'This garden is more than just plants. It's about friendship and working together.'",
                "Everyone agreed. The community garden has become a special place where neighbors have become friends.",
                "I have learned that when people cooperate, wonderful things happen. I appreciate what our community has created together."
            ],
            questions: [
                {
                    question: "Who organized the community garden project?",
                    options: ["Mr. Rodriguez", "Mrs. Kim", "The Wilson family", "The narrator's mom"],
                    correct: 1
                },
                {
                    question: "What vegetables did the narrator's family plant?",
                    options: [
                        "Potatoes, beans, and onions",
                        "Tomatoes, lettuce, and carrots",
                        "Peppers, cucumbers, and squash",
                        "Corn, peas, and cabbage"
                    ],
                    correct: 1
                },
                {
                    question: "When do people work together in the garden?",
                    options: ["Every day", "Every Saturday morning", "Every Sunday afternoon", "Once a month"],
                    correct: 1
                },
                {
                    question: "What did Mrs. Kim say the garden was about?",
                    options: [
                        "Growing food",
                        "Saving money",
                        "Friendship and working together",
                        "Learning about plants"
                    ],
                    correct: 2
                }
            ]
        }],
        medium: [
        {
            id: 2,
            title: "The Coding Competition",
            icon: "💻",
            level: "Confident Reader",
            wordCount: 250,
            grammarFocus: "Past continuous, subordinate clauses",
            vocabulary: ["algorithm", "collaborate", "debug", "perseverance", "innovative"],
            content: [
                "When the announcement about the regional coding competition appeared on our school's bulletin board, I knew I wanted to participate.",
                "The competition required teams of three students. We had to create a simple game using basic programming.",
                "I asked my friends Priya and Marcus to join my team. Priya was excellent at design, while Marcus understood algorithms better than anyone in our class.",
                "We spent three weeks preparing. Every afternoon after school, we were working in the computer lab, brainstorming ideas and writing code.",
                "We decided to create a maze game where players collected stars while avoiding obstacles. It sounded simple, but programming it was challenging.",
                "Marcus wrote the code for the character movement. Priya designed colorful graphics and backgrounds. I focused on the scoring system and game levels.",
                "One week before the competition, disaster struck. Our game kept crashing whenever players reached level three.",
                "We spent hours trying to find the bug. Marcus examined every line of code. Priya tested different scenarios. I searched online forums for solutions.",
                "Finally, at midnight before the competition, Marcus discovered the problem. A single misplaced bracket was causing the crash!",
                "At the competition, fifteen teams from different schools presented their projects. The judges tested each game carefully.",
                "When it was our turn, we were nervous but prepared. We demonstrated our game and explained our code. The judges asked difficult questions, but we answered confidently.",
                "Two days later, we received incredible news. Our team won second place! We were thrilled.",
                "The experience taught us valuable lessons about perseverance and teamwork. When Marcus found that bug, we celebrated like we had won first place.",
                "Working together, we created something innovative. I realized that coding isn't just about programming—it's about problem-solving and never giving up."
            ],
            questions: [
                {
                    question: "Why did the narrator choose Priya and Marcus as teammates?",
                    options: [
                        "They were best friends",
                        "They had complementary skills",
                        "They were the only volunteers",
                        "The teacher assigned them"
                    ],
                    correct: 1
                },
                {
                    question: "What type of game did the team create?",
                    options: ["A racing game", "A puzzle game", "A maze game", "A sports game"],
                    correct: 2
                },
                {
                    question: "What caused the game to crash?",
                    options: [
                        "A misplaced bracket",
                        "Wrong graphics",
                        "Slow computer",
                        "Missing code"
                    ],
                    correct: 0
                },
                {
                    question: "What place did the team win?",
                    options: ["First place", "Second place", "Third place", "Fourth place"],
                    correct: 1
                }
            ]
        }],
        hard: [
        {
            id: 3,
            title: "The Time Capsule Discovery",
            icon: "📦",
            level: "Confident Reader",
            wordCount: 280,
            grammarFocus: "Past perfect, reported speech, descriptive clauses",
            vocabulary: ["archaeological", "excavate", "artifact", "deduce", "preservation"],
            content: [
                "During the renovation of our school's old gymnasium, construction workers made an unexpected discovery. Buried beneath the wooden floorboards, they had found a metal box covered in rust.",
                "When Principal Anderson examined the box, she noticed an inscription: 'To be opened in 2026—From the Class of 1976.'",
                "The principal called an assembly. 'Fifty years ago, students from this school buried a time capsule,' she announced. 'Today, we're finally going to open it!'",
                "The entire school gathered in the auditorium. Principal Anderson carefully opened the lid. Inside, there were letters, photographs, newspapers, and various objects.",
                "The first item was a class photo. Twenty-five students smiled at the camera, dressed in clothes that looked very different from what we wear today.",
                "Mr. Thompson, our history teacher, picked up a newspaper. 'Look at this headline,' he said. 'Gas prices were only 60 cents per gallon!'",
                "There were letters written by students to their future selves. One girl named Jennifer had written, 'I wonder if people in the future will have flying cars. I hope the world is peaceful and everyone is happy.'",
                "We found a vinyl record of popular songs from 1976. Nobody in our class had ever seen one before. Mr. Thompson explained how people used to play music before CDs and digital files existed.",
                "The most interesting artifact was a handmade prediction book. Students had written what they thought the future would be like.",
                "Some predictions were accurate: 'Computers will be in every home.' Others were amusing: 'We'll have robot teachers!' and 'Students will learn telepathically!'",
                "Principal Anderson suggested that we create our own time capsule. 'Let's show future students what life was like in 2026,' she said enthusiastically.",
                "Our class decided to include smartphones, face masks from the pandemic era, and letters about climate change efforts.",
                "We also included predictions about future technology, hoping that students in 2076 would find them interesting.",
                "As we buried our time capsule beneath the new gym floor, I imagined future students discovering it. What would they think about our time?",
                "The discovery had taught us that while technology changes rapidly, human curiosity and hope for the future remain constant across generations."
            ],
            questions: [
                {
                    question: "When was the original time capsule buried?",
                    options: ["1926", "1956", "1976", "1996"],
                    correct: 2
                },
                {
                    question: "What was the most interesting artifact according to the narrator?",
                    options: [
                        "The class photo",
                        "The vinyl record",
                        "The prediction book",
                        "The newspaper"
                    ],
                    correct: 2
                },
                {
                    question: "Which prediction from 1976 came true?",
                    options: [
                        "Flying cars",
                        "Robot teachers",
                        "Computers in every home",
                        "Telepathic learning"
                    ],
                    correct: 2
                },
                {
                    question: "What did the narrator realize from this experience?",
                    options: [
                        "Technology changes but curiosity remains constant",
                        "Old things are better than new things",
                        "Schools never change",
                        "Predictions are always wrong"
                    ],
                    correct: 0
                }
            ]
        },
        {
            id: 2,
            title: "The Recycling Revolution",
            icon: "♻️",
            level: "Confident Reader",
            wordCount: 290,
            grammarFocus: "Persuasive writing, environmental vocabulary, cause and effect",
            vocabulary: ["sustainability", "initiative", "reduce", "implement", "impact"],
            content: [
                "When Maya walked home from school, she always noticed the overflowing trash bins in the park. Mountains of plastic bottles, cans, and paper littered the ground.",
                "One day, she couldn't ignore it anymore. 'Our neighborhood needs a better recycling program,' Maya thought determinedly.",
                "Maya started researching. She discovered that their town only collected recycling once a month, and many people didn't know which items were recyclable.",
                "She decided to create a presentation for the town council. For two weeks, Maya gathered information about successful recycling programs in other cities.",
                "She learned that towns with weekly recycling pickup and clear education programs reduced their waste by 60 percent. The statistics were impressive.",
                "Maya prepared charts showing how much money the town could save by reducing landfill usage. She also calculated the environmental benefits.",
                "On presentation day, Maya's hands trembled as she stood before the council members. But she remembered why this mattered.",
                "'Every week, our town produces five tons of recyclable materials that end up in landfills,' Maya began confidently.",
                "She showed photographs of the littered park. Then she displayed her research about successful programs in nearby towns.",
                "'If we implement weekly recycling pickup and place clearly labeled bins throughout town, we can reduce waste significantly,' Maya explained.",
                "She proposed partnering with local schools to educate children about recycling. 'Young people can teach their families,' she added.",
                "Council Member Rodriguez asked, 'How much would this cost?'",
                "Maya had prepared for this question. She presented her budget analysis showing that savings from reduced landfill fees would cover most costs within two years.",
                "The council was impressed. They discussed Maya's proposal seriously. After deliberation, they voted unanimously to implement her plan!",
                "Three months later, new recycling bins appeared throughout town. The parks became cleaner. Recycling rates increased dramatically.",
                "Maya's teacher asked her to share her experience with the class. 'I learned that young people can make real change,' Maya said proudly.",
                "'Research, preparation, and persistence made the difference. If you care about something, speak up! Adults will listen if you present your ideas clearly.'",
                "The local newspaper featured Maya in an article titled 'Young Environmental Leader Inspires Change.' But Maya felt the clean parks were the real reward.",
                "Now Maya is working on her next project: creating a community composting program. She believes one person's initiative can inspire an entire community."
            ],
            questions: [
                {
                    question: "What problem did Maya notice in her neighborhood?",
                    options: [
                        "Not enough schools",
                        "Overflowing trash and lack of recycling",
                        "Too many cars",
                        "Broken playgrounds"
                    ],
                    correct: 1
                },
                {
                    question: "How often did the town collect recycling before Maya's initiative?",
                    options: ["Every week", "Once a month", "Twice a month", "Never"],
                    correct: 1
                },
                {
                    question: "What evidence did Maya use to support her proposal?",
                    options: [
                        "Only her opinion",
                        "Photos and research from other towns",
                        "What her parents said",
                        "A survey of her classmates"
                    ],
                    correct: 1
                },
                {
                    question: "What percentage of waste reduction did successful programs achieve?",
                    options: ["30 percent", "40 percent", "50 percent", "60 percent"],
                    correct: 3
                },
                {
                    question: "What did Maya learn from this experience?",
                    options: [
                        "Adults never listen to children",
                        "Recycling is too expensive",
                        "Young people can make real change with research and persistence",
                        "Only government can solve environmental problems"
                    ],
                    correct: 2
                }
            ]
        }]
    },
    '9+': {
        easy: [
        {
            id: 1,
            title: "The Volunteer Project",
            icon: "🤝",
            level: "Fluent Reader",
            wordCount: 240,
            grammarFocus: "Modal verbs (should, could, must), conditional sentences",
            vocabulary: ["volunteer", "initiative", "impact", "compassion", "contribution"],
            content: [
                "If someone had told me last year that I would spend my Saturdays at a food bank, I wouldn't have believed them. Yet here I was, sorting canned goods and packing boxes.",
                "It all started when Ms. Rodriguez, my social studies teacher, announced a mandatory volunteer project. Each student must complete 20 hours of community service before the end of the semester.",
                "'You could choose any organization you like,' she explained. 'But you should pick something that helps others in a meaningful way.'",
                "I wasn't sure where to begin. My friend Amelia suggested we volunteer together at the City Food Bank. 'My older sister volunteers there,' she said. 'She says it's really rewarding.'",
                "On our first Saturday, we arrived nervously. The coordinator, Mr. Patterson, welcomed us warmly. 'We're grateful for your help,' he said. 'Many families in our community depend on this food bank.'",
                "He showed us how to check expiration dates, organize items by category, and pack family-sized boxes. The work required attention to detail and physical effort.",
                "As we worked, I noticed the variety of people who came for food. There were elderly people, young families with children, and even some people who looked like they had regular jobs.",
                "'Hard times can happen to anyone,' Mr. Patterson explained when he saw my surprised expression. 'That's why this service is so important.'",
                "Over the following weeks, I began to understand the real impact of our work. One day, a mother with three children thanked us personally. 'You're helping us get through a difficult month,' she said, her eyes glistening with tears.",
                "Amelia and I started coming on additional days beyond our required hours. We realized that volunteering wasn't just about fulfilling an assignment—it was about making a genuine difference.",
                "By the end of the semester, I had completed 45 hours instead of the required 20. I learned that compassion isn't just feeling sorry for others; it's taking action to help.",
                "Ms. Rodriguez was pleased with my progress report. But the real reward wasn't the grade. It was knowing that my small contribution could help someone have enough food on their table.",
                "I've decided to continue volunteering next semester. If everyone gave a little of their time, our community would be so much stronger."
            ],
            questions: [
                {
                    question: "How many hours of community service were required?",
                    options: ["10 hours", "20 hours", "30 hours", "45 hours"],
                    correct: 1
                },
                {
                    question: "Who suggested volunteering at the food bank?",
                    options: ["Ms. Rodriguez", "Amelia", "Mr. Patterson", "Amelia's sister"],
                    correct: 1
                },
                {
                    question: "Why did the narrator keep volunteering beyond the required hours?",
                    options: [
                        "To get a better grade",
                        "Because it was mandatory",
                        "To make a genuine difference",
                        "Because there was nothing else to do"
                    ],
                    correct: 2
                },
                {
                    question: "What lesson did the narrator learn about compassion?",
                    options: [
                        "It's about feeling sorry for others",
                        "It's about taking action to help",
                        "It's only for wealthy people",
                        "It's a school requirement"
                    ],
                    correct: 1
                }
            ]
        }],
        medium: [
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
        }],
        hard: [
        {
            id: 3,
            title: "The Environmental Debate",
            icon: "🌍",
            level: "Fluent Reader",
            wordCount: 300,
            grammarFocus: "Argumentative language, passive voice, complex conditionals",
            vocabulary: ["sustainability", "controversy", "perspective", "compromise", "advocate"],
            content: [
                "The town hall meeting room was packed. Our community was divided over a controversial proposal: should we allow a solar panel farm to be built on the outskirts of town?",
                "Mayor Williams opened the meeting. 'Tonight, we'll hear arguments from both sides. Please be respectful, even if you disagree.'",
                "The first speaker was Dr. Chen, an environmental scientist. 'Climate change is the greatest challenge of our generation,' she began. 'If we don't transition to renewable energy now, our children will inherit a damaged planet.'",
                "She presented data showing how much carbon dioxide would be eliminated if the solar farm were constructed. The panels could generate enough electricity to power 500 homes.",
                "'This isn't just about our town,' Dr. Chen concluded. 'It's about being part of the solution to a global problem.'",
                "Next, Mr. Blackwood, a local farmer, approached the microphone. His family had been farming the land for three generations.",
                "'I'm not against renewable energy,' he said carefully. 'But this land has been used for agriculture for over a hundred years. Once it's covered with solar panels, it can never be farmland again.'",
                "He argued that food production was equally important as energy production. 'We need both food and power to survive,' he pointed out. 'But we can't eat electricity.'",
                "The debate continued for hours. Some argued that technological advancement must be prioritized. Others insisted that traditional ways of life should be preserved.",
                "My sister whispered to me, 'Why can't they find a compromise?'",
                "That question stuck in my mind. Why couldn't both sides work together?",
                "During the open forum, I nervously raised my hand. When Mayor Williams called on me, I stood up.",
                "'What if we used the land for both purposes?' I suggested. 'I read about agrivoltaics—growing crops beneath raised solar panels. Sheep can graze under them too.'",
                "The room fell silent. Dr. Chen's eyes lit up. 'That's an innovative idea,' she said. 'Studies have shown that certain crops actually grow better in partial shade.'",
                "Mr. Blackwood looked thoughtful. 'If we could continue farming while also generating clean energy, I might reconsider my opposition.'",
                "Mayor Williams smiled. 'This is exactly the kind of creative thinking we need. Let's form a committee to investigate this possibility.'",
                "As we left the meeting, my sister said, 'You found a way to respect both perspectives.'",
                "I realized that the best solutions often come from listening to all sides and finding innovative compromises. Progress doesn't have to mean abandoning everything from the past.",
                "Sometimes, the answer isn't choosing between two opposing ideas—it's finding a way to combine them."
            ],
            questions: [
                {
                    question: "What was the controversial proposal?",
                    options: [
                        "Building a new school",
                        "Creating a solar panel farm",
                        "Expanding the highway",
                        "Opening a new factory"
                    ],
                    correct: 1
                },
                {
                    question: "What was Mr. Blackwood's main concern?",
                    options: [
                        "The cost of the project",
                        "Noise from the panels",
                        "Loss of farmland forever",
                        "Visual appearance"
                    ],
                    correct: 2
                },
                {
                    question: "What solution did the narrator suggest?",
                    options: [
                        "Building panels elsewhere",
                        "Agrivoltaics - combining farming and solar",
                        "Using wind energy instead",
                        "Doing nothing"
                    ],
                    correct: 1
                },
                {
                    question: "What lesson did the narrator learn?",
                    options: [
                        "Technology is always better",
                        "Traditional ways are always better",
                        "Best solutions combine different perspectives",
                        "Debates are waste of time"
                    ],
                    correct: 2
                }
            ]
        }]
    },
    '10+': {
        easy: [
        {
            id: 1,
            title: "The Photography Club",
            icon: "📷",
            level: "Advanced Reader",
            wordCount: 260,
            grammarFocus: "Perfect continuous tenses, embedded clauses",
            vocabulary: ["composition", "perspective", "documentation", "interpret", "portfolio"],
            content: [
                "I had been walking past the photography club's exhibition for three days before I finally stopped to look closely at the images displayed.",
                "Each photograph told a story. One showed an elderly man feeding pigeons in the park, his weathered hands gentle and patient. Another captured rain droplets on a spider web, each drop reflecting the world like a tiny mirror.",
                "A poster near the entrance announced: 'Photography Club—New Members Welcome. Meetings Every Thursday.'",
                "I had always been interested in photography but had never seriously pursued it. My phone was full of random snapshots, but I had never thought of photography as art.",
                "At the next meeting, I nervously entered the art room. About fifteen students were already there, cameras of all types spread across the tables.",
                "The club president, Sofia, welcomed me warmly. 'Photography isn't just about having expensive equipment,' she explained. 'It's about seeing the world differently and capturing moments that matter.'",
                "She introduced our first assignment: document something ordinary in an extraordinary way. We had two weeks to take photos and present them.",
                "I spent the next week observing my surroundings with new attention. Things I had walked past every day suddenly seemed interesting through the lens of potential photography.",
                "I noticed how morning sunlight created shadows on the school's brick walls, forming intricate patterns. I observed how my little brother's face changed completely when he was focused on building with blocks—pure concentration replacing his usual playful expression.",
                "I photographed the way books were stacked in the library, creating layers of colors and textures. I captured steam rising from my mother's coffee cup, backlit by the kitchen window.",
                "When presentation day arrived, I was surprised by everyone's interpretations of 'ordinary made extraordinary.' One student had photographed his grandmother's hands kneading bread dough. Another had captured the geometry of fire escape stairs creating patterns against the sky.",
                "When I showed my photos, Sofia said, 'You've developed a good eye for light and composition. Have you been practicing for long?'",
                "'Just two weeks,' I admitted. 'But I've been learning to see.'",
                "Sofia nodded approvingly. 'That's exactly what photography teaches us—to truly observe the world around us.'",
                "Throughout the semester, I continued developing my skills. I learned about exposure, composition rules, and most importantly, about patience.",
                "Photography had become more than a hobby. It was a way of documenting life and interpreting reality through my unique perspective.",
                "By the end of the year, I had compiled a portfolio of fifty photographs that I was genuinely proud of. Each image represented not just a moment captured, but a moment truly seen."
            ],
            questions: [
                {
                    question: "What made the narrator finally join the photography club?",
                    options: [
                        "A friend invited them",
                        "It was mandatory",
                        "After seeing the exhibition for three days",
                        "The teacher suggested it"
                    ],
                    correct: 2
                },
                {
                    question: "What was the first assignment?",
                    options: [
                        "Take portrait photos",
                        "Document something ordinary in an extraordinary way",
                        "Photograph nature",
                        "Create a photo story"
                    ],
                    correct: 1
                },
                {
                    question: "What did Sofia say photography teaches us?",
                    options: [
                        "How to use expensive cameras",
                        "How to pose for pictures",
                        "To truly observe the world",
                        "Technical editing skills"
                    ],
                    correct: 2
                },
                {
                    question: "How many photos did the narrator include in their final portfolio?",
                    options: ["Fifteen", "Twenty-five", "Forty", "Fifty"],
                    correct: 3
                }
            ]
        }],
        medium: [
        {
            id: 2,
            title: "The Historical Research Project",
            icon: "📜",
            level: "Advanced Reader",
            wordCount: 320,
            grammarFocus: "Academic language, citation phrases, subjunctive mood",
            vocabulary: ["archive", "primary source", "verify", "interpretation", "methodology"],
            content: [
                "When Mr. Harrison assigned our history research project, he emphasized that we were to act as real historians. 'Don't just repeat what you find online,' he instructed. 'I want you to examine primary sources and form your own conclusions.'",
                "I chose to investigate whether a local historical figure, Samuel Morrison, who was credited with founding our town's first hospital in 1892, actually deserved sole credit for this achievement.",
                "My research began at the town's historical archives. The librarian, Mrs. Chen, had been working there for thirty years. 'Samuel Morrison? Yes, there are several documents about him,' she said, leading me to a collection of yellowed newspapers and handwritten letters.",
                "The official town history, published in 1950, stated clearly that Morrison 'single-handedly established Morrison Hospital through his generous donation and tireless effort.'",
                "However, as I examined older newspaper articles from 1891-1893, I discovered something interesting. Multiple articles mentioned a 'Ladies' Hospital Committee' that had been fundraising for two years before Morrison's involvement.",
                "I found a letter written by Morrison himself to the newspaper editor. He wrote, 'While I am honored to have my name associated with this institution, it would be unjust if I were to accept credit that rightly belongs to the determined women who initiated this endeavor.'",
                "This was fascinating! Why had the later historical account given Morrison sole credit?",
                "I discovered that the 1950 history was written by Morrison's grandson. Perhaps family pride had influenced his interpretation of events. Or perhaps the contributions of women in that era were systematically undervalued and unrecorded.",
                "I tracked down original meeting minutes from the Ladies' Hospital Committee. The chairwoman, Eleanor Wright, had organized fundraisers, secured the land, and recruited the first medical staff.",
                "Morrison's contribution, while significant, was primarily financial. He donated money for the building's construction, which was certainly important. But the vision, planning, and years of groundwork belonged to the women's committee.",
                "For my presentation, I created a timeline showing both Morrison's and the committee's contributions. I used direct quotes from primary sources to support my findings.",
                "Mr. Harrison was impressed. 'This is excellent historical research,' he said. 'You've demonstrated that history isn't always what we're told—it's what we can verify through evidence.'",
                "He suggested I submit my findings to the town historical society. 'They should know about this. Eleanor Wright and her colleagues deserve recognition.'",
                "I wrote a formal research paper and presented it to the historical society. They were intrigued and decided to update their exhibits to reflect the fuller story.",
                "A month later, I attended the unveiling of the new exhibit. A plaque now read: 'Morrison Hospital: Founded through the vision of the Ladies' Hospital Committee (1890-1892) and made possible through the generous funding of Samuel Morrison.'",
                "Mrs. Wright's great-granddaughter was present. She thanked me with tears in her eyes. 'My family always knew Grandma Eleanor had done this work, but no one believed us without proof.'",
                "This experience taught me that history is not just dates and facts—it's about ensuring that all contributors are remembered accurately. Sometimes, uncovering the truth requires looking beyond the official story.",
                "As historians, we have a responsibility to question, verify, and, when necessary, correct the historical record."
            ],
            questions: [
                {
                    question: "What was unusual about Samuel Morrison according to historical records?",
                    options: [
                        "He founded the hospital alone",
                        "He actually acknowledged the Ladies' Committee",
                        "He was a doctor",
                        "He wrote many books"
                    ],
                    correct: 1
                },
                {
                    question: "Who actually initiated the hospital project?",
                    options: [
                        "Samuel Morrison",
                        "Morrison's grandson",
                        "The Ladies' Hospital Committee led by Eleanor Wright",
                        "Mr. Harrison"
                    ],
                    correct: 2
                },
                {
                    question: "Why might the 1950 history have given Morrison sole credit?",
                    options: [
                        "He deserved it",
                        "His grandson wrote it and women's contributions were undervalued",
                        "Nobody else helped",
                        "The committee refused recognition"
                    ],
                    correct: 1
                },
                {
                    question: "What was the main lesson the narrator learned?",
                    options: [
                        "History books are always right",
                        "Historians should question and verify the historical record",
                        "Women never contributed to history",
                        "Primary sources don't matter"
                    ],
                    correct: 1
                }
            ]
        }],
        hard: [
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
            title: "The Debate Championship",
            icon: "🎤",
            level: "Advanced Reader",
            wordCount: 420,
            grammarFocus: "Persuasive language, complex argumentation, formal speech patterns",
            vocabulary: ["articulate", "counterargument", "rhetoric", "substantiate", "perspective"],
            content: [
                "The annual National Youth Debate Championship was unlike any competition Marcus had ever faced. Standing before three hundred people required not just knowledge, but the ability to think on your feet.",
                "Marcus and his debate partner, Elena, had spent months preparing for this moment. Their topic: 'Should artificial intelligence have legal rights as technology becomes more sophisticated?'",
                "The proposition seemed straightforward until you considered its implications. If AI systems could think, learn, and create, did they deserve protection under law? Or would granting them rights diminish what it means to be human?",
                "Their opponents, a team from the state champions, argued passionately that consciousness and sentience were uniquely human qualities. 'AI might mimic intelligence,' their lead speaker declared, 'but it lacks genuine understanding, emotion, and moral agency.'",
                "Elena opened their rebuttal with a thought-provoking question: 'How do we define consciousness? If we can't fully explain human consciousness scientifically, how can we be certain that advanced AI doesn't possess its own form of awareness?'",
                "Marcus followed with historical context. 'Throughout history, societies have denied rights to various groups by claiming they lacked full consciousness or humanity. We later recognized these denials as grave moral failures.'",
                "The opposition countered skillfully. 'You're conflating biological consciousness with programmed responses. An AI might pass the Turing test, but that doesn't mean it experiences subjective reality. It's simulating, not experiencing.'",
                "The debate intensified during the cross-examination period. Questions flew back and forth, each side probing for weaknesses in the other's logic.",
                "'If an AI creates art, writes poetry, or composes music,' Elena asked, 'who owns that creation? The AI, its programmer, or the company that owns the system?'",
                "Their opponent paused, then responded, 'Ownership and rights are separate issues. A corporation owns software, but that doesn't mean the software deserves rights. It's a tool, albeit an sophisticated one.'",
                "Marcus seized on this. 'But tools don't learn and adapt independently. Modern AI systems modify their own code, develop unexpected solutions, and even surprise their creators. At what point does a tool become something more?'",
                "The final speeches approached. Marcus knew they needed to synthesize their arguments into a compelling conclusion.",
                "'This debate isn't really about AI,' he began his closing statement. 'It's about how we prepare for a future where the line between artificial and natural intelligence becomes increasingly blurred. By establishing ethical frameworks now, we prevent future crises.'",
                "'We're not suggesting AI should vote or hold office,' Elena added. 'We're proposing limited protections—the right not to be maliciously corrupted, destroyed without cause, or exploited. These protections benefit humanity by ensuring responsible AI development.'",
                "The judges deliberated for twenty minutes. When they announced the decision, Marcus's heart raced. 'The championship goes to... the proposition team!'",
                "But something unexpected happened. The opposing team's captain approached them afterward. 'You changed my mind,' she admitted. 'I still don't have all the answers, but your arguments made me realize this issue is more complex than I thought.'",
                "That moment meant more to Marcus than the trophy. True victory in debate wasn't about winning—it was about elevating the conversation, challenging assumptions, and helping people think more deeply about important issues.",
                "As they left the stage, Elena smiled. 'You know what's ironic? We taught each other as much as we taught the audience. That's the real power of debate—it forces you to understand perspectives you initially opposed.'"
            ],
            questions: [
                {
                    question: "What was the debate topic?",
                    options: ["Should schools use more technology?", "Should AI have legal rights?", "Is AI better than humans?", "Should we ban AI development?"],
                    correct: 1
                },
                {
                    question: "What historical comparison did Marcus make?",
                    options: ["Industrial revolution", "Space exploration", "Societies denying rights to groups", "Ancient philosophy"],
                    correct: 2
                },
                {
                    question: "What distinction did the opposition emphasize?",
                    options: ["Old vs new technology", "Simulating vs experiencing consciousness", "Expensive vs cheap AI", "Safe vs dangerous AI"],
                    correct: 1
                },
                {
                    question: "What unexpected event happened after the debate?",
                    options: ["The judges changed their decision", "The opposing captain said they changed her mind", "Marcus withdrew from competition", "The debate was cancelled"],
                    correct: 1
                },
                {
                    question: "According to Marcus's closing, what is the real purpose of this debate?",
                    options: ["To ban AI", "To prepare ethical frameworks for the future", "To prove humans are superior", "To win a trophy"],
                    correct: 1
                },
                {
                    question: "What did Elena say was the real power of debate?",
                    options: ["Winning trophies", "Getting famous", "Understanding opposing perspectives", "Proving you're right"],
                    correct: 2
                }
            ]
        }]
    }
};

// Load story list for selected age group and difficulty
function loadStoryList() {
    if (!selectedAgeGroup || !selectedDifficulty) return;

    const stories = storyDatabase[selectedAgeGroup]?.[selectedDifficulty] || [];

    // Limit to 2 stories per age-difficulty in demo mode
    const limit = getDemoLimit(stories.length);
    const limitedStories = stories.slice(0, limit);

    document.getElementById('reading-difficulties').style.display = 'none';
    document.getElementById('story-selection').style.display = 'block';

    const difficultyStars = {
        easy: '⭐',
        medium: '⭐⭐',
        hard: '⭐⭐⭐'
    };

    const listContainer = document.getElementById('story-list');

    if (limitedStories.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
                <p style="font-size: 1.2em; color: #666;">No stories available for this age and difficulty level yet.</p>
                <p style="color: #999;">More stories coming soon!</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = limitedStories.map(story => `
        <div class="story-card" onclick="loadStory(${story.id})">
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
function loadStory(storyId) {
    if (!selectedAgeGroup || !selectedDifficulty) return;

    const stories = storyDatabase[selectedAgeGroup]?.[selectedDifficulty] || [];
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    currentStory = story;
    let userAnswers = [];

    document.getElementById('story-selection').style.display = 'none';
    document.getElementById('story-reader').style.display = 'block';

    // Build vocabulary section
    let vocabularyHTML = '';
    story.vocabulary.forEach(word => {
        vocabularyHTML += `
            <div class="vocab-item">
                <span class="vocab-word">${word}</span>
            </div>
        `;
    });

    // Build questions section
    let questionsHTML = '';
    story.questions.forEach((q, qIndex) => {
        let optionsHTML = '';
        q.options.forEach((option, oIndex) => {
            optionsHTML += `
                <button class="answer-btn" onclick="selectStoryAnswer(${qIndex}, ${oIndex})" id="story-answer-${qIndex}-${oIndex}">
                    ${String.fromCharCode(65 + oIndex)}) ${option}
                </button>
            `;
        });

        questionsHTML += `
            <div class="question-box" id="story-question-${qIndex}">
                <div class="question-text">${qIndex + 1}. ${q.question}</div>
                <div class="answer-options">
                    ${optionsHTML}
                </div>
                <div class="feedback" id="story-feedback-${qIndex}" style="display: none;"></div>
            </div>
        `;
    });

    const readerContainer = document.getElementById('story-reader');
    readerContainer.innerHTML = `
        <div class="navigation" style="margin-bottom: 20px;">
            <button onclick="backToStoryListFromReader()">← Back to Stories</button>
        </div>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-size: 1.2em; font-weight: bold;">
            📊 Age Group: ${selectedAgeGroup}
        </div>

        <div class="story-container">
            <div class="story-title">${story.title}</div>

            <div class="story-illustration">${story.icon}</div>

            <div class="vocabulary-box">
                <h3>📖 Grammar Focus: ${story.grammarFocus}</h3>
            </div>

            <div class="vocabulary-box">
                <h3>📚 New Words to Learn</h3>
                ${vocabularyHTML}
            </div>

            <div class="story-text">
                ${story.content.map(para => `<p>${para}</p>`).join('')}
            </div>

            <div class="questions-section">
                <h2 style="text-align: center; color: #764ba2; margin-bottom: 30px;">
                    ❓ Comprehension Questions
                </h2>
                ${questionsHTML}

                <div style="text-align: center; margin-top: 40px;">
                    <button onclick="checkAllStoryAnswers()" style="
                        padding: 20px 50px;
                        font-size: 1.3em;
                        border: none;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: bold;
                        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                    ">
                        ✓ Check Answers
                    </button>
                </div>

                <div id="story-score-display" style="display: none;"></div>
            </div>
        </div>
    `;
}

// Story answer selection and checking (matching German Kids pattern)
let storyUserAnswers = [];

function selectStoryAnswer(questionIndex, optionIndex) {
    if (!currentStory) return;

    const question = currentStory.questions[questionIndex];

    // Remove previous selection
    for (let i = 0; i < question.options.length; i++) {
        const btn = document.getElementById(`story-answer-${questionIndex}-${i}`);
        if (btn) {
            btn.classList.remove('selected');
        }
    }

    // Mark current selection
    const selectedBtn = document.getElementById(`story-answer-${questionIndex}-${optionIndex}`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }

    // Store answer
    storyUserAnswers[questionIndex] = optionIndex;
}

function checkAllStoryAnswers() {
    if (!currentStory) return;

    let score = 0;
    let totalQuestions = currentStory.questions.length;

    currentStory.questions.forEach((question, qIndex) => {
        const userAnswer = storyUserAnswers[qIndex];
        const correctAnswer = question.correct;
        const isCorrect = userAnswer === correctAnswer;

        if (isCorrect) {
            score++;
        }

        // Update button styles
        for (let i = 0; i < question.options.length; i++) {
            const btn = document.getElementById(`story-answer-${qIndex}-${i}`);
            if (btn) {
                btn.classList.remove('selected');
                if (i === correctAnswer) {
                    btn.classList.add('correct');
                } else if (i === userAnswer && !isCorrect) {
                    btn.classList.add('incorrect');
                }
                btn.disabled = true;
            }
        }

        // Show feedback
        const feedback = document.getElementById(`story-feedback-${qIndex}`);
        if (feedback) {
            feedback.style.display = 'block';
            if (isCorrect) {
                feedback.textContent = '✓ Correct!';
                feedback.style.color = '#4caf50';
            } else {
                feedback.textContent = `✗ Incorrect. The correct answer is ${String.fromCharCode(65 + correctAnswer)}.`;
                feedback.style.color = '#f44336';
            }
        }
    });

    // Display score
    const scoreDisplay = document.getElementById('story-score-display');
    if (scoreDisplay) {
        const percentage = Math.round((score / totalQuestions) * 100);
        let emoji = '😊';
        let message = 'Good job!';

        if (percentage === 100) {
            emoji = '🌟';
            message = 'Perfect score! Excellent!';
        } else if (percentage >= 80) {
            emoji = '😊';
            message = 'Great work!';
        } else if (percentage >= 60) {
            emoji = '👍';
            message = 'Good effort!';
        } else {
            emoji = '💪';
            message = 'Keep practicing!';
        }

        scoreDisplay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                margin-top: 30px;
                text-align: center;
                font-size: 1.5em;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            ">
                <div style="font-size: 3em; margin-bottom: 15px;">${emoji}</div>
                <div style="font-weight: bold; margin-bottom: 10px;">${message}</div>
                <div style="font-size: 2em; font-weight: bold;">Score: ${score}/${totalQuestions} (${percentage}%)</div>
            </div>
        `;
        scoreDisplay.style.display = 'block';
    }
}

// Word banks for different levels
const wordBanks = {
    pictureWords: [
        // Animals
        { emoji: '🐶', word: 'dog', blank: 'D_G' },
        { emoji: '🐱', word: 'cat', blank: 'C_T' },
        { emoji: '🐝', word: 'bee', blank: 'B__' },
        { emoji: '🐟', word: 'fish', blank: 'F_SH' },
        { emoji: '🐦', word: 'bird', blank: 'B_RD' },
        { emoji: '🐸', word: 'frog', blank: 'FR_G' },
        { emoji: '🐻', word: 'bear', blank: 'B__R' },
        { emoji: '🦁', word: 'lion', blank: 'L__N' },
        { emoji: '🐘', word: 'elephant', blank: 'EL_PH_NT' },
        { emoji: '🐒', word: 'monkey', blank: 'M_NK_Y' },
        { emoji: '🐄', word: 'cow', blank: 'C_W' },
        { emoji: '🐷', word: 'pig', blank: 'P_G' },
        { emoji: '🐔', word: 'chicken', blank: 'CH_CK_N' },
        { emoji: '🦆', word: 'duck', blank: 'D_CK' },
        { emoji: '🐰', word: 'rabbit', blank: 'R_BB_T' },
        { emoji: '🦋', word: 'butterfly', blank: 'B_TT_RFLY' },
        { emoji: '🐛', word: 'bug', blank: 'B_G' },
        { emoji: '🐜', word: 'ant', blank: '_NT' },
        { emoji: '🐢', word: 'turtle', blank: 'T_RTL_' },
        { emoji: '🦈', word: 'shark', blank: 'SH_RK' },

        // Nature
        { emoji: '🌞', word: 'sun', blank: 'S_N' },
        { emoji: '🌙', word: 'moon', blank: 'M__N' },
        { emoji: '⭐', word: 'star', blank: 'ST_R' },
        { emoji: '☁️', word: 'cloud', blank: 'CL__D' },
        { emoji: '🌧️', word: 'rain', blank: 'R__N' },
        { emoji: '⛈️', word: 'storm', blank: 'ST_RM' },
        { emoji: '🌈', word: 'rainbow', blank: 'R__NB_W' },
        { emoji: '🌳', word: 'tree', blank: 'TR__' },
        { emoji: '🌲', word: 'pine', blank: 'P_NE' },
        { emoji: '🌺', word: 'flower', blank: 'FL_W_R' },
        { emoji: '🌹', word: 'rose', blank: 'R_SE' },
        { emoji: '🌻', word: 'sunflower', blank: 'S_NFL_W_R' },
        { emoji: '🍁', word: 'leaf', blank: 'L__F' },
        { emoji: '🌾', word: 'wheat', blank: 'WH__T' },
        { emoji: '🏔️', word: 'mountain', blank: 'M__NT__N' },
        { emoji: '🌊', word: 'wave', blank: 'W_VE' },
        { emoji: '🔥', word: 'fire', blank: 'F_RE' },
        { emoji: '💧', word: 'drop', blank: 'DR_P' },

        // Food
        { emoji: '🍎', word: 'apple', blank: 'APP_E' },
        { emoji: '🍊', word: 'orange', blank: '_R_NGE' },
        { emoji: '🍋', word: 'lemon', blank: 'L_M_N' },
        { emoji: '🍌', word: 'banana', blank: 'B_N_N_' },
        { emoji: '🍇', word: 'grapes', blank: 'GR_P_S' },
        { emoji: '🍓', word: 'strawberry', blank: 'STR_WB_RRY' },
        { emoji: '🍉', word: 'watermelon', blank: 'W_T_RM_L_N' },
        { emoji: '🍞', word: 'bread', blank: 'BR__D' },
        { emoji: '🥖', word: 'baguette', blank: 'B_GU_TTE' },
        { emoji: '🥚', word: 'egg', blank: '_GG' },
        { emoji: '🧀', word: 'cheese', blank: 'CH__SE' },
        { emoji: '🥛', word: 'milk', blank: 'M_LK' },
        { emoji: '🍕', word: 'pizza', blank: 'P_ZZ_' },
        { emoji: '🍔', word: 'burger', blank: 'B_RG_R' },
        { emoji: '🍰', word: 'cake', blank: 'C_KE' },
        { emoji: '🍪', word: 'cookie', blank: 'C__K__' },
        { emoji: '🍦', word: 'icecream', blank: '_C_CR__M' },

        // Objects & Things
        { emoji: '🚗', word: 'car', blank: 'C_R' },
        { emoji: '🚌', word: 'bus', blank: 'B_S' },
        { emoji: '🚂', word: 'train', blank: 'TR__N' },
        { emoji: '✈️', word: 'plane', blank: 'PL_NE' },
        { emoji: '🚁', word: 'helicopter', blank: 'H_L_C_PT_R' },
        { emoji: '🚲', word: 'bike', blank: 'B_KE' },
        { emoji: '⛵', word: 'boat', blank: 'B__T' },
        { emoji: '🚀', word: 'rocket', blank: 'R_CK_T' },
        { emoji: '🎈', word: 'balloon', blank: 'B_LL__N' },
        { emoji: '🎁', word: 'gift', blank: 'G_FT' },
        { emoji: '🎨', word: 'paint', blank: 'P__NT' },
        { emoji: '✏️', word: 'pencil', blank: 'P_NC_L' },
        { emoji: '📚', word: 'book', blank: 'B__K' },
        { emoji: '📖', word: 'notebook', blank: 'N_T_B__K' },
        { emoji: '📝', word: 'paper', blank: 'P_P_R' },
        { emoji: '✂️', word: 'scissors', blank: 'SC_SS_RS' },
        { emoji: '🖍️', word: 'crayon', blank: 'CR_Y_N' },
        { emoji: '🎒', word: 'backpack', blank: 'B_CKP_CK' },
        { emoji: '👓', word: 'glasses', blank: 'GL_SS_S' },
        { emoji: '⌚', word: 'watch', blank: 'W_TCH' },
        { emoji: '📱', word: 'phone', blank: 'PH_NE' },
        { emoji: '💻', word: 'laptop', blank: 'L_PT_P' },
        { emoji: '🖥️', word: 'computer', blank: 'C_MP_T_R' },
        { emoji: '⚽', word: 'soccer', blank: 'S_CC_R' },
        { emoji: '🏀', word: 'basketball', blank: 'B_SK_TB_LL' },
        { emoji: '⚾', word: 'baseball', blank: 'B_S_B_LL' },
        { emoji: '🎾', word: 'tennis', blank: 'T_NN_S' },
        { emoji: '🎸', word: 'guitar', blank: 'G__T_R' },
        { emoji: '🎹', word: 'piano', blank: 'P__N_' },
        { emoji: '🎺', word: 'trumpet', blank: 'TR_MP_T' },
        { emoji: '🥁', word: 'drum', blank: 'DR_M' },

        // Places & Buildings
        { emoji: '🏠', word: 'house', blank: 'H__SE' },
        { emoji: '🏫', word: 'school', blank: 'SCH__L' },
        { emoji: '🏥', word: 'hospital', blank: 'H_SP_T_L' },
        { emoji: '🏪', word: 'store', blank: 'ST_RE' },
        { emoji: '🏦', word: 'bank', blank: 'B_NK' },
        { emoji: '🏨', word: 'hotel', blank: 'H_T_L' },
        { emoji: '⛪', word: 'church', blank: 'CH_RCH' },
        { emoji: '🏰', word: 'castle', blank: 'C_STL_' },
        { emoji: '🗼', word: 'tower', blank: 'T_W_R' },
        { emoji: '🌉', word: 'bridge', blank: 'BR_DGE' },

        // Body Parts
        { emoji: '👁️', word: 'eye', blank: '_YE' },
        { emoji: '👂', word: 'ear', blank: '_AR' },
        { emoji: '👃', word: 'nose', blank: 'N_SE' },
        { emoji: '👄', word: 'mouth', blank: 'M__TH' },
        { emoji: '✋', word: 'hand', blank: 'H_ND' },
        { emoji: '🦶', word: 'foot', blank: 'F__T' },
        { emoji: '🦷', word: 'tooth', blank: 'T__TH' },
        { emoji: '💪', word: 'arm', blank: '_RM' },
        { emoji: '🦴', word: 'bone', blank: 'B_NE' },
        { emoji: '❤️', word: 'heart', blank: 'H__RT' },

        // Colors & Shapes
        { emoji: '🔴', word: 'red', blank: 'R_D' },
        { emoji: '🔵', word: 'blue', blank: 'BL__' },
        { emoji: '🟡', word: 'yellow', blank: 'Y_LL_W' },
        { emoji: '🟢', word: 'green', blank: 'GR__N' },
        { emoji: '🟣', word: 'purple', blank: 'P_RPL_' },
        { emoji: '🟠', word: 'orange', blank: '_R_NG_' },
        { emoji: '⚪', word: 'white', blank: 'WH_TE' },
        { emoji: '⚫', word: 'black', blank: 'BL_CK' },
        { emoji: '🔺', word: 'triangle', blank: 'TR__NGL_' },
        { emoji: '⭕', word: 'circle', blank: 'C_RCL_' },
        { emoji: '⬜', word: 'square', blank: 'SQ__RE' }
    ],
    sightWords1: ['the', 'and', 'is', 'a', 'to', 'in', 'it', 'of', 'he', 'she', 'we', 'can', 'see', 'you', 'me', 'my', 'for', 'are', 'be', 'on'],
    sightWords2: ['have', 'they', 'has', 'with', 'from', 'this', 'that', 'said', 'will', 'there', 'what', 'when', 'where', 'who', 'how', 'out', 'up', 'down', 'but', 'not'],
    nouns: ['cat', 'dog', 'house', 'tree', 'book', 'car', 'ball', 'sun', 'moon', 'star', 'bird', 'fish', 'table', 'chair', 'door', 'window'],
    verbs: ['run', 'jump', 'play', 'eat', 'sleep', 'read', 'write', 'sing', 'dance', 'walk', 'talk', 'swim', 'fly', 'sit', 'stand'],
    adjectives: ['big', 'small', 'happy', 'sad', 'fast', 'slow', 'hot', 'cold', 'new', 'old', 'good', 'bad', 'tall', 'short', 'long'],
    synonymPairs: [
        ['happy', 'joyful'], ['big', 'large'], ['small', 'tiny'], ['fast', 'quick'], ['smart', 'intelligent'],
        ['pretty', 'beautiful'], ['angry', 'mad'], ['tired', 'sleepy'], ['brave', 'courageous'], ['funny', 'humorous']
    ],
    antonymPairs: [
        ['hot', 'cold'], ['big', 'small'], ['up', 'down'], ['happy', 'sad'], ['fast', 'slow'],
        ['good', 'bad'], ['day', 'night'], ['old', 'new'], ['tall', 'short'], ['heavy', 'light']
    ]
};

// Age groups configuration
const AGE_GROUPS = ['4-5', '6', '7', '8', '9+', '10+'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DIFFICULTY_LABELS = {
    'easy': 'Easy ⭐',
    'medium': 'Medium ⭐⭐',
    'hard': 'Hard ⭐⭐⭐'
};

// Writing Practice Activities (organized by age appropriateness)
const writingActivities = {
    '4-5': {
        letters: [
            // Uppercase letters A-Z
            { prompt: 'Practice writing:', example: 'A', type: 'letter' },
            { prompt: 'Practice writing:', example: 'B', type: 'letter' },
            { prompt: 'Practice writing:', example: 'C', type: 'letter' },
            { prompt: 'Practice writing:', example: 'D', type: 'letter' },
            { prompt: 'Practice writing:', example: 'E', type: 'letter' },
            { prompt: 'Practice writing:', example: 'F', type: 'letter' },
            { prompt: 'Practice writing:', example: 'G', type: 'letter' },
            { prompt: 'Practice writing:', example: 'H', type: 'letter' },
            { prompt: 'Practice writing:', example: 'I', type: 'letter' },
            { prompt: 'Practice writing:', example: 'J', type: 'letter' },
            { prompt: 'Practice writing:', example: 'K', type: 'letter' },
            { prompt: 'Practice writing:', example: 'L', type: 'letter' },
            { prompt: 'Practice writing:', example: 'M', type: 'letter' },
            { prompt: 'Practice writing:', example: 'N', type: 'letter' },
            { prompt: 'Practice writing:', example: 'O', type: 'letter' },
            { prompt: 'Practice writing:', example: 'P', type: 'letter' },
            { prompt: 'Practice writing:', example: 'Q', type: 'letter' },
            { prompt: 'Practice writing:', example: 'R', type: 'letter' },
            { prompt: 'Practice writing:', example: 'S', type: 'letter' },
            { prompt: 'Practice writing:', example: 'T', type: 'letter' },
            { prompt: 'Practice writing:', example: 'U', type: 'letter' },
            { prompt: 'Practice writing:', example: 'V', type: 'letter' },
            { prompt: 'Practice writing:', example: 'W', type: 'letter' },
            { prompt: 'Practice writing:', example: 'X', type: 'letter' },
            { prompt: 'Practice writing:', example: 'Y', type: 'letter' },
            { prompt: 'Practice writing:', example: 'Z', type: 'letter' },
            // Lowercase letters a-z
            { prompt: 'Practice writing:', example: 'a', type: 'letter' },
            { prompt: 'Practice writing:', example: 'b', type: 'letter' },
            { prompt: 'Practice writing:', example: 'c', type: 'letter' },
            { prompt: 'Practice writing:', example: 'd', type: 'letter' },
            { prompt: 'Practice writing:', example: 'e', type: 'letter' },
            { prompt: 'Practice writing:', example: 'f', type: 'letter' },
            { prompt: 'Practice writing:', example: 'g', type: 'letter' },
            { prompt: 'Practice writing:', example: 'h', type: 'letter' },
            { prompt: 'Practice writing:', example: 'i', type: 'letter' },
            { prompt: 'Practice writing:', example: 'j', type: 'letter' },
            { prompt: 'Practice writing:', example: 'k', type: 'letter' },
            { prompt: 'Practice writing:', example: 'l', type: 'letter' },
            { prompt: 'Practice writing:', example: 'm', type: 'letter' },
            { prompt: 'Practice writing:', example: 'n', type: 'letter' },
            { prompt: 'Practice writing:', example: 'o', type: 'letter' },
            { prompt: 'Practice writing:', example: 'p', type: 'letter' },
            { prompt: 'Practice writing:', example: 'q', type: 'letter' },
            { prompt: 'Practice writing:', example: 'r', type: 'letter' },
            { prompt: 'Practice writing:', example: 's', type: 'letter' },
            { prompt: 'Practice writing:', example: 't', type: 'letter' },
            { prompt: 'Practice writing:', example: 'u', type: 'letter' },
            { prompt: 'Practice writing:', example: 'v', type: 'letter' },
            { prompt: 'Practice writing:', example: 'w', type: 'letter' },
            { prompt: 'Practice writing:', example: 'x', type: 'letter' },
            { prompt: 'Practice writing:', example: 'y', type: 'letter' },
            { prompt: 'Practice writing:', example: 'z', type: 'letter' }
        ]
    },
    '6': {
        words: [
            // Animals
            { prompt: 'Practice writing the word:', example: 'cat', meaning: '🐱' },
            { prompt: 'Practice writing the word:', example: 'dog', meaning: '🐶' },
            { prompt: 'Practice writing the word:', example: 'bird', meaning: '🐦' },
            { prompt: 'Practice writing the word:', example: 'fish', meaning: '🐟' },
            { prompt: 'Practice writing the word:', example: 'bear', meaning: '🐻' },
            { prompt: 'Practice writing the word:', example: 'lion', meaning: '🦁' },
            { prompt: 'Practice writing the word:', example: 'frog', meaning: '🐸' },
            { prompt: 'Practice writing the word:', example: 'cow', meaning: '🐄' },
            // Nature & Objects
            { prompt: 'Practice writing the word:', example: 'sun', meaning: '☀️' },
            { prompt: 'Practice writing the word:', example: 'moon', meaning: '🌙' },
            { prompt: 'Practice writing the word:', example: 'star', meaning: '⭐' },
            { prompt: 'Practice writing the word:', example: 'tree', meaning: '🌳' },
            { prompt: 'Practice writing the word:', example: 'flower', meaning: '🌸' },
            { prompt: 'Practice writing the word:', example: 'house', meaning: '🏠' },
            { prompt: 'Practice writing the word:', example: 'car', meaning: '🚗' },
            { prompt: 'Practice writing the word:', example: 'book', meaning: '📚' },
            // Colors & Shapes
            { prompt: 'Practice writing the word:', example: 'red', meaning: '🔴' },
            { prompt: 'Practice writing the word:', example: 'blue', meaning: '🔵' },
            { prompt: 'Practice writing the word:', example: 'green', meaning: '🟢' },
            { prompt: 'Practice writing the word:', example: 'yellow', meaning: '🟡' },
            { prompt: 'Practice writing the word:', example: 'ball', meaning: '⚽' },
            { prompt: 'Practice writing the word:', example: 'box', meaning: '📦' },
            { prompt: 'Practice writing the word:', example: 'cup', meaning: '☕' },
            { prompt: 'Practice writing the word:', example: 'pen', meaning: '✏️' }
        ]
    },
    '7': {
        sentences: [
            // Present tense - Simple
            { prompt: 'Copy this sentence:', example: 'I like to read books.' },
            { prompt: 'Copy this sentence:', example: 'The cat is very big.' },
            { prompt: 'Copy this sentence:', example: 'We play together at school.' },
            { prompt: 'Copy this sentence:', example: 'My dog runs in the park.' },
            { prompt: 'Copy this sentence:', example: 'She eats an apple every day.' },
            // Present tense - Questions
            { prompt: 'Copy this sentence:', example: 'Where is my pencil?' },
            { prompt: 'Copy this sentence:', example: 'What time is it now?' },
            { prompt: 'Copy this sentence:', example: 'Can you help me please?' },
            // Past tense - Simple
            { prompt: 'Copy this sentence:', example: 'I went to the store yesterday.' },
            { prompt: 'Copy this sentence:', example: 'We played soccer after school.' },
            { prompt: 'Copy this sentence:', example: 'She found a pretty shell at the beach.' },
            { prompt: 'Copy this sentence:', example: 'They made a sandcastle together.' },
            // Descriptive
            { prompt: 'Copy this sentence:', example: 'The sky is bright and blue today.' },
            { prompt: 'Copy this sentence:', example: 'My room is clean and tidy.' },
            { prompt: 'Copy this sentence:', example: 'The cake tastes sweet and delicious.' }
        ]
    },
    '8': {
        sentences: [
            // Complex present tense
            { prompt: 'Copy this sentence:', example: 'The young boy runs very fast every morning.' },
            { prompt: 'Copy this sentence:', example: 'She reads her favorite book before bedtime.' },
            { prompt: 'Copy this sentence:', example: 'They like to play outside together every day after school.' },
            // Past tense narratives
            { prompt: 'Copy this sentence:', example: 'Yesterday, I visited my grandmother and we baked cookies.' },
            { prompt: 'Copy this sentence:', example: 'Last week, our class went on a field trip to the museum.' },
            { prompt: 'Copy this sentence:', example: 'My friend taught me how to ride a bicycle last summer.' },
            // Compound sentences
            { prompt: 'Copy this sentence:', example: 'I finished my homework, and then I watched television.' },
            { prompt: 'Copy this sentence:', example: 'She wanted to play outside, but it was raining heavily.' },
            { prompt: 'Copy this sentence:', example: 'We can go to the park, or we can stay home and play games.' },
            // Complex descriptive
            { prompt: 'Copy this sentence:', example: 'The beautiful garden was full of colorful flowers and tall trees.' },
            { prompt: 'Copy this sentence:', example: 'My little sister is learning to swim in the community pool.' },
            { prompt: 'Copy this sentence:', example: 'The teacher explained the difficult math problem step by step.' },
            // Questions and commands
            { prompt: 'Copy this sentence:', example: 'Have you finished your homework yet?' },
            { prompt: 'Copy this sentence:', example: 'Please remember to bring your lunch tomorrow.' },
            { prompt: 'Copy this sentence:', example: 'Why do birds fly south for the winter?' }
        ]
    },
    '9+': {
        creative: [
            // Personal reflection
            { prompt: 'Write about your favorite hobby and why you enjoy it:', example: '' },
            { prompt: 'Describe a fun day you spent with your family:', example: '' },
            { prompt: 'What do you want to learn this year and why?', example: '' },
            { prompt: 'Write about a person you admire and explain why:', example: '' },
            { prompt: 'Describe your best friend and what makes them special:', example: '' },
            // Creative imagination
            { prompt: 'If you could have any superpower, what would it be and how would you use it?', example: '' },
            { prompt: 'Write about an adventure you would like to have:', example: '' },
            { prompt: 'Imagine you discovered a secret door. What is behind it?', example: '' },
            { prompt: 'If you could travel anywhere in the world, where would you go?', example: '' },
            { prompt: 'Describe your perfect day from morning to night:', example: '' },
            // Opinion and explanation
            { prompt: 'What is your favorite season and why do you like it?', example: '' },
            { prompt: 'Write about a book or movie you really enjoyed:', example: '' },
            { prompt: 'What makes a good friend? Explain your ideas:', example: '' },
            { prompt: 'Describe something new you tried recently:', example: '' },
            { prompt: 'What are you grateful for in your life?', example: '' }
        ]
    },
    '10+': {
        creative: [
            // Extended narratives
            { prompt: 'Write a short story about an unexpected adventure:', example: '' },
            { prompt: 'Describe your ideal future career and why it interests you:', example: '' },
            { prompt: 'If you could change one thing in the world, what would it be and why?', example: '' },
            { prompt: 'Write about a challenge you overcame and what you learned:', example: '' },
            { prompt: 'Create a story that begins: "When I opened the mysterious package..."', example: '' },
            // Analytical writing
            { prompt: 'Compare and contrast two subjects you study in school:', example: '' },
            { prompt: 'Explain how technology has changed the way people communicate:', example: '' },
            { prompt: 'Write about an important historical event and why it matters:', example: '' },
            { prompt: 'Describe the qualities of a good leader:', example: '' },
            // Personal philosophy
            { prompt: 'What does success mean to you? Explain your perspective:', example: '' },
            { prompt: 'Write about a time when you had to make a difficult decision:', example: '' },
            { prompt: 'If you could give advice to younger students, what would you say?', example: '' },
            { prompt: 'Describe your goals for the next five years:', example: '' },
            { prompt: 'What invention would you create to help solve a problem?', example: '' },
            { prompt: 'Write about what true friendship means to you:', example: '' }
        ]
    }
};

// Content Configurations (age-based with difficulty levels)
const contentConfigs = {
    '4-5': {
        easy: {
            name: 'Ages 4-5 - Easy English',
            description: 'Picture words with emojis',
            problemCount: 15,
            type: 'pictureWords',
            wordList: wordBanks.pictureWords
        },
        medium: {
            name: 'Ages 4-5 - Medium English',
            description: 'Basic sight words',
            problemCount: 12,
            type: 'sightWords',
            wordList: wordBanks.sightWords1
        },
        hard: {
            name: 'Ages 4-5 - Hard English',
            description: 'Simple letter tracing',
            problemCount: 15,
            type: 'pictureWords',
            wordList: wordBanks.pictureWords
        },
        writing: {
            name: 'Ages 4-5 - Writing Practice',
            description: 'Letter tracing with ruled lines',
            type: 'writing',
            activities: writingActivities['4-5'].letters,
            activitiesPerPage: 3
        }
    },
    '6': {
        easy: {
            name: 'Age 6 - Easy English',
            description: 'Basic sight words',
            problemCount: 15,
            type: 'sightWords',
            wordList: wordBanks.sightWords1
        },
        medium: {
            name: 'Age 6 - Medium English',
            description: 'Simple sentences',
            problemCount: 12,
            type: 'sentenceFill',
            difficulty: 'easy'
        },
        hard: {
            name: 'Age 6 - Hard English',
            description: 'Sentence completion',
            problemCount: 12,
            type: 'sentenceCompletion',
            difficulty: 'medium'
        },
        writing: {
            name: 'Age 6 - Writing Practice',
            description: 'Simple words with ruled lines',
            type: 'writing',
            activities: writingActivities['6'].words,
            activitiesPerPage: 3
        }
    },
    '7': {
        easy: {
            name: 'Age 7 - Easy English',
            description: 'Simple sentences',
            problemCount: 12,
            type: 'sentenceFill',
            difficulty: 'easy'
        },
        medium: {
            name: 'Age 7 - Medium English',
            description: 'Grammar basics',
            problemCount: 12,
            type: 'sentenceCompletion',
            difficulty: 'medium'
        },
        hard: {
            name: 'Age 7 - Hard English',
            description: 'Synonyms & antonyms',
            problemCount: 15,
            type: 'synonymsAntonyms'
        },
        writing: {
            name: 'Age 7 - Writing Practice',
            description: 'Sentence copying with ruled lines',
            type: 'writing',
            activities: writingActivities['7'].sentences,
            activitiesPerPage: 3
        }
    },
    '8': {
        easy: {
            name: 'Age 8 - Easy English',
            description: 'Vocabulary building',
            problemCount: 15,
            type: 'synonymsAntonyms'
        },
        medium: {
            name: 'Age 8 - Medium English',
            description: 'Parts of speech',
            problemCount: 15,
            type: 'partsOfSpeech'
        },
        hard: {
            name: 'Age 8 - Hard English',
            description: 'Reading comprehension',
            problemCount: 8,
            type: 'readingComprehension'
        },
        writing: {
            name: 'Age 8 - Writing Practice',
            description: 'Sentence practice with ruled lines',
            type: 'writing',
            activities: writingActivities['8'].sentences,
            activitiesPerPage: 3
        }
    },
    '9+': {
        easy: {
            name: 'Ages 9+ - Easy English',
            description: 'Advanced grammar',
            problemCount: 15,
            type: 'partsOfSpeech'
        },
        medium: {
            name: 'Ages 9+ - Medium English',
            description: 'Reading comprehension',
            problemCount: 8,
            type: 'readingComprehension'
        },
        hard: {
            name: 'Ages 9+ - Hard English',
            description: 'Advanced writing',
            problemCount: 12,
            type: 'advancedGrammar'
        },
        writing: {
            name: 'Ages 9+ - Writing Practice',
            description: 'Creative writing with ruled lines',
            type: 'writing',
            activities: writingActivities['9+'].creative,
            activitiesPerPage: 2
        }
    },
    '10+': {
        easy: {
            name: 'Ages 10+ - Easy English',
            description: 'Complex reading',
            problemCount: 8,
            type: 'readingComprehension'
        },
        medium: {
            name: 'Ages 10+ - Medium English',
            description: 'Essay writing',
            problemCount: 10,
            type: 'advancedGrammar'
        },
        hard: {
            name: 'Ages 10+ - Hard English',
            description: 'Creative writing',
            problemCount: 8,
            type: 'advancedGrammar'
        },
        writing: {
            name: 'Ages 10+ - Writing Practice',
            description: 'Advanced creative writing with ruled lines',
            type: 'writing',
            activities: writingActivities['10+'].creative,
            activitiesPerPage: 2
        }
    }
};

// Problem generators
function generatePictureWordProblems(wordList, count) {
    const problems = [];
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const item = shuffled[i];
        problems.push({
            type: 'pictureWord',
            emoji: item.emoji,
            blank: item.blank,
            prompt: `Complete the word`,
            answer: item.word
        });
    }
    return problems;
}

function generateSightWordProblems(wordList, count) {
    const problems = [];
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        problems.push({
            type: 'write',
            prompt: `Write the word: <strong>${shuffled[i]}</strong>`,
            answer: shuffled[i]
        });
    }
    return problems;
}

function generateSentenceFillProblems(count, difficulty) {
    const sentences = [
        { text: 'The cat ___ on the mat.', answer: 'sat', options: ['sat', 'stand', 'jump'] },
        { text: 'I ___ a red ball.', answer: 'have', options: ['have', 'has', 'had'] },
        { text: 'She ___ to school every day.', answer: 'goes', options: ['goes', 'go', 'went'] },
        { text: 'The sun ___ in the sky.', answer: 'shines', options: ['shines', 'shine', 'shining'] },
        { text: 'We ___ our homework.', answer: 'do', options: ['do', 'does', 'did'] },
        { text: 'The bird ___ in the tree.', answer: 'sits', options: ['sits', 'sit', 'sitting'] },
        { text: 'They ___ playing in the park.', answer: 'are', options: ['are', 'is', 'am'] },
        { text: 'My dog ___ very fast.', answer: 'runs', options: ['runs', 'run', 'running'] },
        { text: 'I ___ a book yesterday.', answer: 'read', options: ['read', 'reads', 'reading'] },
        { text: 'The flowers ___ beautiful.', answer: 'are', options: ['are', 'is', 'am'] },
        { text: 'He ___ his breakfast.', answer: 'eats', options: ['eats', 'eat', 'eating'] },
        { text: 'The baby ___ loudly.', answer: 'cries', options: ['cries', 'cry', 'crying'] }
    ];

    const shuffled = [...sentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(s => ({
        type: 'fill',
        prompt: s.text,
        answer: s.answer,
        options: s.options
    }));
}

function generateSynonymAntonymProblems(count) {
    const problems = [];
    const halfCount = Math.floor(count / 2);

    // Synonyms
    const synonyms = [...wordBanks.synonymPairs].sort(() => Math.random() - 0.5);
    for (let i = 0; i < halfCount && i < synonyms.length; i++) {
        problems.push({
            type: 'synonym',
            prompt: `Write a synonym for: <strong>${synonyms[i][0]}</strong>`,
            answer: synonyms[i][1],
            acceptableAnswers: [synonyms[i][1]]
        });
    }

    // Antonyms
    const antonyms = [...wordBanks.antonymPairs].sort(() => Math.random() - 0.5);
    for (let i = 0; i < (count - halfCount) && i < antonyms.length; i++) {
        problems.push({
            type: 'antonym',
            prompt: `Write an antonym for: <strong>${antonyms[i][0]}</strong>`,
            answer: antonyms[i][1],
            acceptableAnswers: [antonyms[i][1]]
        });
    }

    return problems.sort(() => Math.random() - 0.5);
}

function generatePartsOfSpeechProblems(count) {
    const sentences = [
        { sentence: 'The big dog runs fast.', word: 'dog', answer: 'noun' },
        { sentence: 'The big dog runs fast.', word: 'big', answer: 'adjective' },
        { sentence: 'The big dog runs fast.', word: 'runs', answer: 'verb' },
        { sentence: 'She quickly ate her lunch.', word: 'ate', answer: 'verb' },
        { sentence: 'The happy children play outside.', word: 'happy', answer: 'adjective' },
        { sentence: 'The happy children play outside.', word: 'children', answer: 'noun' },
        { sentence: 'A small bird flew away.', word: 'small', answer: 'adjective' },
        { sentence: 'A small bird flew away.', word: 'flew', answer: 'verb' },
        { sentence: 'The old tree stands tall.', word: 'tree', answer: 'noun' },
        { sentence: 'My cat sleeps quietly.', word: 'cat', answer: 'noun' },
        { sentence: 'The blue car drives slowly.', word: 'blue', answer: 'adjective' },
        { sentence: 'They swim in the pool.', word: 'swim', answer: 'verb' },
        { sentence: 'A bright star shines tonight.', word: 'bright', answer: 'adjective' },
        { sentence: 'The teacher reads a book.', word: 'reads', answer: 'verb' },
        { sentence: 'Fresh bread smells good.', word: 'bread', answer: 'noun' }
    ];

    const shuffled = [...sentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(s => ({
        type: 'partsOfSpeech',
        prompt: `"${s.sentence}" - What part of speech is "<strong>${s.word}</strong>"?`,
        answer: s.answer,
        options: ['noun', 'verb', 'adjective']
    }));
}

function generateReadingComprehension(count) {
    const passages = [
        {
            text: 'Tom has a pet dog named Max. Max is a golden retriever. He loves to play fetch in the park. Every morning, Tom takes Max for a walk. Max is a very friendly dog.',
            questions: [
                { q: 'What is the dog\'s name?', a: 'Max' },
                { q: 'What kind of dog is Max?', a: 'golden retriever' },
                { q: 'What does Max love to play?', a: 'fetch' }
            ]
        },
        {
            text: 'Sarah loves to read books. She goes to the library every week. Her favorite books are about animals. She has read ten books this month. Reading makes her happy.',
            questions: [
                { q: 'Where does Sarah go every week?', a: 'library' },
                { q: 'What are her favorite books about?', a: 'animals' },
                { q: 'How many books has she read this month?', a: 'ten' }
            ]
        }
    ];

    const passage = passages[Math.floor(Math.random() * passages.length)];
    const problems = [];

    problems.push({
        type: 'passage',
        text: passage.text
    });

    passage.questions.forEach((q, i) => {
        problems.push({
            type: 'comprehension',
            prompt: q.q,
            answer: q.a
        });
    });

    return problems;
}

function generateAdvancedGrammarProblems(count) {
    const problems = [
        { prompt: 'Correct the sentence: "She don\'t like apples."', answer: 'She doesn\'t like apples.' },
        { prompt: 'Add punctuation: "what time is it"', answer: 'What time is it?' },
        { prompt: 'Make plural: "The child plays."', answer: 'The children play.' },
        { prompt: 'Change to past tense: "I walk to school."', answer: 'I walked to school.' },
        { prompt: 'Correct: "Me and Tom went home."', answer: 'Tom and I went home.' },
        { prompt: 'Add capital letters: "we live in london."', answer: 'We live in London.' },
        { prompt: 'Change to future tense: "She eats lunch."', answer: 'She will eat lunch.' },
        { prompt: 'Correct: "Their going to the store."', answer: 'They\'re going to the store.' },
        { prompt: 'Make possessive: "The book belongs to John."', answer: 'John\'s book' },
        { prompt: 'Correct: "He run fast."', answer: 'He runs fast.' },
        { prompt: 'Add commas: "I like apples oranges and bananas."', answer: 'I like apples, oranges, and bananas.' },
        { prompt: 'Change to question: "You are happy."', answer: 'Are you happy?' }
    ];

    const shuffled = [...problems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(p => ({
        type: 'grammar',
        prompt: p.prompt,
        answer: p.answer
    }));
}

// Load worksheet for specific age group and difficulty
function loadWorksheet(ageGroup, difficulty, page = 1) {
    const config = contentConfigs[ageGroup]?.[difficulty];
    if (!config) {
        console.error(`No config found for: ${ageGroup}, ${difficulty}`);
        return;
    }

    currentPage = page;

    // Handle writing practice with pages
    if (config.type === 'writing') {
        totalPages = isDemoMode() ? 2 : 50;
        renderWritingWorksheet(ageGroup, difficulty, page);
        return;
    }

    let problems = [];

    switch(config.type) {
        case 'pictureWords':
            problems = generatePictureWordProblems(config.wordList, config.problemCount);
            break;
        case 'sightWords':
            problems = generateSightWordProblems(config.wordList, config.problemCount);
            break;
        case 'sentenceFill':
        case 'sentenceCompletion':
            problems = generateSentenceFillProblems(config.problemCount, config.difficulty);
            break;
        case 'synonymsAntonyms':
            problems = generateSynonymAntonymProblems(config.problemCount);
            break;
        case 'partsOfSpeech':
            problems = generatePartsOfSpeechProblems(config.problemCount);
            break;
        case 'readingComprehension':
            problems = generateReadingComprehension(config.problemCount);
            break;
        case 'advancedGrammar':
            problems = generateAdvancedGrammarProblems(config.problemCount);
            break;
    }

    currentWorksheet = {
        ageGroup,
        difficulty,
        config,
        problems,
        answers: new Array(problems.length).fill('')
    };

    renderWorksheet();
}

// Navigate between writing practice pages
function navigateWritingPage(direction) {
    const newPage = currentPage + direction;
    if (newPage < 1 || newPage > totalPages) return;
    loadWorksheet(selectedAgeGroup, selectedDifficulty, newPage);
}

// Render writing practice worksheet with pages
function renderWritingWorksheet(ageGroup, difficulty, page) {
    const config = contentConfigs[ageGroup]?.[difficulty];
    if (!config) {
        alert(`Error: No config found for ${ageGroup} - ${difficulty}`);
        console.error('renderWritingWorksheet: config not found', { ageGroup, difficulty, contentConfigs });
        return;
    }

    const today = new Date().toLocaleDateString();
    const activities = config.activities;
    const activitiesPerPage = config.activitiesPerPage;

    // Generate activities for this page
    const startIdx = (page - 1) * activitiesPerPage;
    const pageActivities = [];

    // Cycle through activities to fill 50 pages
    for (let i = 0; i < activitiesPerPage; i++) {
        const activityIdx = (startIdx + i) % activities.length;
        pageActivities.push(activities[activityIdx]);
    }

    // Check if age group should show example (only up to age 8)
    const shouldShowExample = ['4-5', '6', '7', '8'].includes(ageGroup);

    // Generate HTML for writing canvases
    let problemsHTML = '';
    pageActivities.forEach((activity, index) => {
        const canvasId = `writing-canvas-${index}`;
        const meaningEmoji = activity.meaning ? `<span style="font-size: 2em; margin-left: 10px;">${activity.meaning}</span>` : '';

        problemsHTML += `
            <div class="writing-problem">
                <div class="problem-header">
                    <span class="problem-number">${index + 1}.</span>
                    <span class="problem-title">${activity.prompt}</span>
                </div>
                ${activity.example && shouldShowExample ? `
                    <div class="writing-example-box">
                        <div class="example-label">✏️ Example to copy:</div>
                        <div class="handwriting-example">
                            <span class="handwritten-text">${activity.example}</span>
                            ${meaningEmoji}
                        </div>
                    </div>
                ` : ''}
                <div class="writing-canvas-container">
                    <canvas id="${canvasId}" class="writing-canvas" width="800" height="200"></canvas>
                    <button class="clear-btn" onclick="clearWritingCanvas('${canvasId}')">Clear</button>
                </div>
            </div>
        `;
    });

    const html = `
        <div class="worksheet-container">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-size: 1.2em; font-weight: bold;">
                📊 Age Group: ${ageGroup}
            </div>
            <div class="worksheet-header">
                <div class="worksheet-info">
                    <h2>✍️ ${config.name}</h2>
                    <p>${config.description}</p>
                    <p>Page ${page} of ${totalPages}</p>
                </div>
                <div class="student-info">
                    <div class="info-row">
                        <strong>Name:</strong>
                        <input type="text" id="student-name" value="${getCurrentUserFullName()}">
                    </div>
                    <div class="info-row">
                        <strong>Date:</strong>
                        <input type="text" value="${today}" readonly>
                    </div>
                </div>
            </div>

            <div class="navigation" style="margin-bottom: 20px;">
                <button onclick="backToWorksheetSelection()">← Back to Difficulty</button>
            </div>

            <div class="controls">
                <div class="control-buttons">
                    <button onclick="clearAllWritingCanvases()">Clear All</button>
                    <button onclick="saveWritingPDF()">Save as PDF</button>
                </div>
            </div>

            <div class="problems-container">${problemsHTML}</div>

            <div class="page-navigation" style="margin: 30px 0;">
                <button onclick="navigateWritingPage(-1)" ${page <= 1 ? 'disabled' : ''}>← Previous Page</button>
                <span class="page-counter">Page ${page} of ${totalPages}</span>
                <button onclick="navigateWritingPage(1)" ${page >= totalPages ? 'disabled' : ''}>Next Page →</button>
            </div>
        </div>
    `;

    // Hide navigation and show worksheet in container
    document.getElementById('age-groups').style.display = 'none';
    document.getElementById('type-selection').style.display = 'none';
    document.getElementById('writing-difficulties').style.display = 'none';

    // Get or create worksheet container
    let worksheetContainer = document.getElementById('english-worksheet-content');
    if (!worksheetContainer) {
        worksheetContainer = document.createElement('div');
        worksheetContainer.id = 'english-worksheet-content';
        const container = document.querySelector('.container');
        if (container) {
            container.appendChild(worksheetContainer);
        } else {
            document.body.appendChild(worksheetContainer);
        }
    }

    worksheetContainer.innerHTML = html;
    worksheetContainer.style.display = 'block';

    // Initialize writing canvases
    setTimeout(() => {
        initializeAllWritingCanvases();
    }, 100);

    elapsedSeconds = 0;
    updateTimerDisplay();
}

// Initialize writing canvases with ruled lines
function initializeWritingCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Draw ruled lines
    drawRuledLines(canvas);

    // Store canvas info
    writingCanvases.push({ id: canvasId, canvas: canvas, ctx: ctx });

    function startDrawing(e) {
        isDrawing = true;
        const pos = getPosition(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();

        const pos = getPosition(e);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        lastX = pos.x;
        lastY = pos.y;
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            // Validate show answers toggle after drawing
            setTimeout(() => validateShowAnswersToggle(), 100);
        }
    }

    function getPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
}

function drawRuledLines(canvas) {
    const ctx = canvas.getContext('2d');
    const height = canvas.height;
    const width = canvas.width;

    ctx.fillStyle = '#f8f9ff';
    ctx.fillRect(0, 0, width, height);

    // Equal spacing between all four lines (20% each)
    const topLine = height * 0.20;
    const midLine = height * 0.40;
    const baseLine = height * 0.60;
    const bottomLine = height * 0.80;

    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, topLine);
    ctx.lineTo(width - 10, topLine);
    ctx.stroke();

    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, midLine);
    ctx.lineTo(width - 10, midLine);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, baseLine);
    ctx.lineTo(width - 10, baseLine);
    ctx.stroke();

    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, bottomLine);
    ctx.lineTo(width - 10, bottomLine);
    ctx.stroke();

    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, height);
    ctx.stroke();
}

function clearWritingCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRuledLines(canvas);

    // Validate show answers toggle after clearing
    validateShowAnswersToggle();
}

function clearAllWritingCanvases() {
    if (confirm('Clear all writing? This cannot be undone.')) {
        writingCanvases.forEach(item => clearWritingCanvas(item.id));

        // Reset timer
        stopTimer();
        elapsedSeconds = 0;
        updateTimerDisplay();

        // Validate show answers after clearing
        validateShowAnswersToggle();
    }
}

// Check if a canvas is empty (only has ruled lines or is blank)
function isCanvasEmpty(canvas) {
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Check if canvas is completely blank (all pixels are white/transparent)
    // We need to account for the ruled lines background
    // A canvas with only ruled lines has specific pixel patterns
    // If there's user drawing, there will be additional colored pixels

    // Get pixel at a position that should be clear if no writing exists
    // Sample several points to check for user-drawn content
    let hasContent = false;
    const samplePoints = [
        {x: canvas.width / 2, y: 30},  // Middle top area
        {x: canvas.width / 2, y: 80},  // Middle area
        {x: canvas.width / 2, y: 130}, // Middle bottom area
        {x: canvas.width / 4, y: 50},  // Left area
        {x: 3 * canvas.width / 4, y: 50}  // Right area
    ];

    for (const point of samplePoints) {
        const x = Math.floor(point.x);
        const y = Math.floor(point.y);
        const index = (y * canvas.width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        // If pixel is not white/light background color (ruled lines are light)
        // Consider it as user content (drawing stroke is black/dark)
        if (a > 0 && (r < 200 || g < 200 || b < 200)) {
            hasContent = true;
            break;
        }
    }

    return !hasContent;
}

// Validate if all canvases have content and enable/disable Show Answers toggle
function validateShowAnswersToggle() {
    const toggleInput = document.getElementById('answer-toggle-input');
    const toggleContainer = document.getElementById('answer-toggle-container');

    if (!toggleInput || !toggleContainer) return;

    // Check if all canvases have content
    let allCanvasesHaveContent = true;
    for (const item of writingCanvases) {
        if (isCanvasEmpty(item.canvas)) {
            allCanvasesHaveContent = false;
            break;
        }
    }

    // Enable/disable toggle based on canvas content
    if (allCanvasesHaveContent) {
        toggleInput.disabled = false;
        toggleContainer.style.opacity = '1';
        toggleContainer.style.cursor = 'pointer';
        toggleContainer.title = '';
    } else {
        toggleInput.disabled = true;
        toggleInput.checked = false;  // Uncheck if was checked
        toggleContainer.style.opacity = '0.5';
        toggleContainer.style.cursor = 'not-allowed';
        toggleContainer.title = 'Please complete all writing exercises to show answers';

        // Hide answers if they were visible
        if (answersVisible) {
            answersVisible = false;
            toggleAnswers();
        }
    }
}

function initializeAllWritingCanvases() {
    writingCanvases = [];
    const allCanvases = document.querySelectorAll('.writing-canvas');
    allCanvases.forEach(canvas => initializeWritingCanvas(canvas.id));

    // Initial validation of show answers toggle (all canvases start empty)
    setTimeout(() => validateShowAnswersToggle(), 200);
}

function saveWritingPDF() {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
    const filename = `Writing_Practice_Page${currentPage}_${timestamp}.pdf`;

    const controls = document.querySelector('.controls');
    const navigation = document.querySelectorAll('.navigation');
    const topNav = document.querySelector('.top-navigation');

    const controlsDisplay = controls.style.display;
    const topNavDisplay = topNav ? topNav.style.display : '';
    controls.style.display = 'none';
    if (topNav) topNav.style.display = 'none';
    navigation.forEach(nav => nav.style.display = 'none');

    const element = document.querySelector('.worksheet-container');
    const opt = {
        margin: 0.5,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        controls.style.display = controlsDisplay;
        if (topNav) topNav.style.display = topNavDisplay;
        navigation.forEach(nav => nav.style.display = '');
    });
}

// Render the worksheet
function renderWorksheet() {
    const { ageGroup, difficulty, config, problems } = currentWorksheet;
    const today = new Date().toLocaleDateString();

    let problemsHTML = '';
    let questionNumber = 1;

    problems.forEach((problem, index) => {
        if (problem.type === 'passage') {
            problemsHTML += `
                <div class="passage-box" style="grid-column: 1 / -1;">
                    <h3>Read the passage:</h3>
                    <p style="line-height: 1.8; margin: 15px 0; padding: 15px; background: #f9f9f9; border-left: 3px solid #000;">
                        ${problem.text}
                    </p>
                </div>
            `;
        } else if (problem.type === 'pictureWord') {
            problemsHTML += `
                <div class="problem picture-word-problem">
                    <span class="problem-number">${questionNumber}.</span>
                    <div class="problem-content" style="flex-direction: column; align-items: center; text-align: center;">
                        <div class="picture-emoji" style="font-size: 4em; margin: 10px 0;">${problem.emoji}</div>
                        <div class="word-blank" style="font-size: 1.8em; font-weight: bold; letter-spacing: 0.3em; margin: 15px 0; font-family: 'Courier New', monospace;">
                            ${problem.blank}
                        </div>
                        <div class="handwriting-input-container" style="margin: 15px 0;">
                            <canvas
                                id="answer-${index}"
                                class="handwriting-input"
                                data-width="250"
                                data-height="80"
                                data-answer="${problem.answer}"
                                style="touch-action: none;">
                            </canvas>
                            <button class="eraser-btn" onclick="clearHandwritingInput('answer-${index}')" title="Clear this answer">✕</button>
                        </div>
                        <span class="answer-feedback" id="feedback-${index}"></span>
                    </div>
                </div>
            `;
            questionNumber++;
        } else {
            problemsHTML += `
                <div class="problem">
                    <span class="problem-number">${questionNumber}.</span>
                    <div class="problem-content" style="flex-direction: column; align-items: flex-start;">
                        <div style="margin-bottom: 10px;">${problem.prompt}</div>
                        <div class="handwriting-input-container" style="margin: 15px 0;">
                            <canvas
                                id="answer-${index}"
                                class="handwriting-input"
                                data-width="400"
                                data-height="80"
                                data-answer="${problem.answer}"
                                style="touch-action: none;">
                            </canvas>
                            <button class="eraser-btn" onclick="clearHandwritingInput('answer-${index}')" title="Clear this answer">✕</button>
                        </div>
                        <span class="answer-feedback" id="feedback-${index}"></span>
                    </div>
                </div>
            `;
            questionNumber++;
        }
    });

    const answerKeyHTML = problems
        .filter(p => p.type !== 'passage')
        .map((problem, index) => {
            const qNum = problems.slice(0, index).filter(p => p.type !== 'passage').length + 1;
            return `
                <div class="answer-item">
                    ${qNum}. <strong>${problem.answer}</strong>
                </div>
            `;
        }).join('');

    const html = `
        <div class="worksheet-container">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-size: 1.2em; font-weight: bold;">
                📊 Age Group: ${ageGroup}
            </div>
            <div class="worksheet-header">
                <div class="worksheet-info">
                    <h2>${config.name}</h2>
                    <p>${config.description}</p>
                </div>
                <div class="student-info">
                    <div class="info-row">
                        <strong>Name:</strong>
                        <input type="text" id="student-name" value="${getCurrentUserFullName()}">
                    </div>
                    <div class="info-row">
                        <strong>Date:</strong>
                        <input type="text" value="${today}" readonly>
                    </div>
                    <div class="info-row">
                        <strong>Time:</strong>
                        <span id="elapsed-time">00:00</span>
                    </div>
                </div>
            </div>

            <div class="navigation" style="margin-bottom: 20px;">
                <button class="back-btn" onclick="backToWorksheetSelection()" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">← Back to Difficulty</button>
            </div>

            <div class="controls">
                <div class="timer">
                    <span id="timer-display">00:00</span>
                </div>
                <div class="control-buttons">
                    <div id="timer-toggle-container" class="timer-toggle-container">
                        <span class="timer-toggle-label">⏱️ Timer</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="timer-toggle-input" onchange="toggleTimer(event)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <button onclick="saveCurrentWorksheet()" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; border: none; font-weight: bold;">💾 Save</button>
                    <button onclick="clearAllAnswers()" style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; border: none; font-weight: bold;">🔄 Clear All</button>
                    <button onclick="savePDF()" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; font-weight: bold;">📄 PDF</button>
                </div>
            </div>

            <div class="results-summary" id="results-summary"></div>

            <div class="problems-grid">
                ${problemsHTML}
            </div>

            <div class="answer-key" id="answer-key">
                <h3>Answer Key</h3>
                <div class="answer-key-grid">
                    ${answerKeyHTML}
                </div>
            </div>

            <div class="navigation" style="margin-top: 20px;">
                <div id="answer-toggle-container" class="answer-toggle-container" style="display: inline-block; margin-right: 20px;">
                    <span class="answer-toggle-label">👀 Show Answers</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="answer-toggle-input" onchange="toggleAnswers(event)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    // Hide navigation and show worksheet in container
    document.getElementById('age-groups').style.display = 'none';
    document.getElementById('type-selection').style.display = 'none';
    document.getElementById('writing-difficulties').style.display = 'none';

    // Get or create worksheet container
    let worksheetContainer = document.getElementById('english-worksheet-content');
    if (!worksheetContainer) {
        worksheetContainer = document.createElement('div');
        worksheetContainer.id = 'english-worksheet-content';
        const container = document.querySelector('.container');
        if (container) {
            container.appendChild(worksheetContainer);
        } else {
            document.body.appendChild(worksheetContainer);
        }
    }

    worksheetContainer.innerHTML = html;
    worksheetContainer.style.display = 'block';

    // Initialize writing canvases
    setTimeout(() => {
        initializeAllWritingCanvases();
    }, 100);

    elapsedSeconds = 0;
    updateTimerDisplay();
}

// Timer functions
function toggleTimer(event) {
    const isRunning = event ? event.target.checked : !timer;

    if (isRunning) {
        startTimer();
    } else {
        stopTimer();
    }
}

function startTimer() {
    if (timer) return;
    startTime = Date.now() - (elapsedSeconds * 1000);
    timer = setInterval(() => {
        elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const timerEl = document.getElementById('timer-display');
    const elapsedEl = document.getElementById('elapsed-time');

    if (timerEl) timerEl.textContent = display;
    if (elapsedEl) elapsedEl.textContent = display;
}

function handleEnter(event, index) {
    if (event.key === 'Enter') {
        event.preventDefault();
        // Find next input (skip passages)
        let nextIndex = index + 1;
        let nextInput = null;
        while (nextIndex < currentWorksheet.problems.length && !nextInput) {
            nextInput = document.getElementById(`answer-${nextIndex}`);
            nextIndex++;
        }
        if (nextInput) {
            nextInput.focus();
        } else {
            checkAnswers();
        }
    }
}

// Check answers
function checkAnswers() {
    stopTimer();

    let total = 0;

    currentWorksheet.problems.forEach((problem, index) => {
        if (problem.type === 'passage') return;

        const canvas = document.getElementById(`answer-${index}`);
        const feedback = document.getElementById(`feedback-${index}`);
        if (!canvas) return;

        const correctAnswer = problem.answer;
        total++;

        // Update feedback (RIGHT of canvas, NOT on canvas) - just the value, no "Answer:" prefix
        feedback.textContent = correctAnswer;
        feedback.style.color = '#4caf50';
        feedback.style.fontSize = '1.5em';
        feedback.style.fontWeight = 'bold';
        feedback.style.display = 'inline';
    });

    const resultsDiv = document.getElementById('results-summary');

    resultsDiv.innerHTML = `
        <h3>Answers Shown</h3>
        <p style="font-size: 1.1em; color: #0066cc;">Correct answers are displayed in green to the right of each problem.</p>
        <p style="font-size: 1em; color: #666;">Compare your handwritten answers with the correct ones.</p>
        <p>Time: ${document.getElementById('elapsed-time').textContent}</p>
    `;
    resultsDiv.style.display = 'block';

    // Show and check toggle switch
    answersVisible = true;
    const toggleContainer = document.getElementById('answer-toggle-container');
    const toggleInput = document.getElementById('answer-toggle-input');
    if (toggleContainer && toggleInput) {
        toggleContainer.style.display = 'flex';
        toggleInput.checked = true;
    }
}

function showAnswerKey() {
    const answerKey = document.getElementById('answer-key');
    if (answerKey.style.display === 'none' || answerKey.style.display === '') {
        answerKey.style.display = 'block';
    } else {
        answerKey.style.display = 'none';
    }
}

// Save worksheet as PDF
function savePDF() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const filename = `English_${currentWorksheet.ageGroup}_${currentWorksheet.difficulty}_${year}${month}${day}_${hours}${minutes}${seconds}.pdf`;

    const controls = document.querySelector('.controls');
    const results = document.getElementById('results-summary');
    const navigation = document.querySelector('.navigation');
    const answerKey = document.getElementById('answer-key');

    const controlsDisplay = controls ? controls.style.display : '';
    const resultsDisplay = results ? results.style.display : '';
    const navigationDisplay = navigation ? navigation.style.display : '';
    const answerKeyDisplay = answerKey ? answerKey.style.display : '';

    if (controls) controls.style.display = 'none';
    if (results) results.style.display = 'none';
    if (navigation) navigation.style.display = 'none';
    if (answerKey) answerKey.style.display = 'none';

    const element = document.querySelector('.worksheet-container');
    const opt = {
        margin: [0.6, 0.4, 0.6, 0.4],
        filename: filename,
        image: { type: 'jpeg', quality: 0.92 },
        html2canvas: {
            scale: 1.2,
            useCORS: true,
            letterRendering: true,
            logging: false,
            width: element.scrollWidth,
            windowWidth: element.scrollWidth
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if (controls) controls.style.display = controlsDisplay;
        if (results) results.style.display = resultsDisplay;
        if (navigation) navigation.style.display = navigationDisplay;
        if (answerKey) answerKey.style.display = answerKeyDisplay;
    });
}

// Toggle answer visibility
function toggleAnswers(event) {
    answersVisible = event ? event.target.checked : !answersVisible;

    currentWorksheet.problems.forEach((problem, index) => {
        if (problem.type === 'passage') return;
        const feedback = document.getElementById(`feedback-${index}`);
        const correctAnswer = String(problem.answer);

        if (feedback) {
            if (answersVisible) {
                // Show answer
                feedback.textContent = correctAnswer;
                feedback.style.color = '#4caf50';
                feedback.style.fontSize = '1.5em';
                feedback.style.fontWeight = 'bold';
                feedback.style.display = 'inline';
            } else {
                // Hide answer
                feedback.style.display = 'none';
            }
        }
    });
}

// Save current worksheet
function saveCurrentWorksheet() {
    if (!currentWorksheet) {
        alert('No worksheet to save');
        return;
    }

    const identifier = `${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}`;
    const studentName = document.getElementById('student-name')?.value || getCurrentUserFullName();
    const elapsedTime = document.getElementById('elapsed-time')?.textContent || '00:00';

    // Collect canvas answers
    const canvasAnswers = [];
    currentWorksheet.problems.forEach((problem, index) => {
        if (problem.type === 'passage') return;
        const canvas = document.getElementById(`answer-${index}`);
        if (canvas && canvas.toDataURL) {
            canvasAnswers.push({
                index: index,
                imageData: canvas.toDataURL('image/png')
            });
        }
    });

    const data = {
        completed: true,
        elapsedTime: elapsedTime,
        studentName: studentName,
        canvasAnswers: canvasAnswers,
        buttonAnswers: {},
        checkboxAnswers: {}
    };

    if (saveWorksheet('english', identifier, data)) {
        alert('Worksheet saved successfully!');
        updateCompletionBadge(identifier);
    }
}

// Load saved worksheet
function loadSavedWorksheet() {
    if (!currentWorksheet) return;

    const identifier = `${currentWorksheet.ageGroup}-${currentWorksheet.difficulty}`;
    const savedData = loadWorksheet('english', identifier);

    if (!savedData) return;

    // Restore student name and time
    const studentNameInput = document.getElementById('student-name');
    const elapsedTimeSpan = document.getElementById('elapsed-time');

    if (studentNameInput && savedData.studentName) {
        studentNameInput.value = savedData.studentName;
    }

    if (elapsedTimeSpan && savedData.elapsedTime) {
        elapsedTimeSpan.textContent = savedData.elapsedTime;
    }

    // Restore canvas answers
    if (savedData.canvasAnswers && savedData.canvasAnswers.length > 0) {
        savedData.canvasAnswers.forEach(answer => {
            const canvas = document.getElementById(`answer-${answer.index}`);
            if (canvas && canvas.getContext && answer.imageData) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = answer.imageData;
            }
        });

        // Show "Loaded saved worksheet" message
        const resultsDiv = document.getElementById('results-summary');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <h3>Loaded Saved Worksheet</h3>
                <p style="font-size: 1.1em; color: #0066cc;">Your previous work has been restored.</p>
                <p>Saved on: ${new Date(savedData.timestamp).toLocaleString()}</p>
                <p>Time: ${savedData.elapsedTime}</p>
            `;
            resultsDiv.style.display = 'block';
        }
    }
}

// Clear all answers on current worksheet
function clearAllAnswers() {
    if (!currentWorksheet) return;

    if (confirm('Clear all your answers? This cannot be undone.')) {
        // Clear all canvases
        clearAllHandwritingInputs();

        // Hide any visible answers
        answersVisible = false;
        const toggleInput = document.getElementById('answer-toggle-input');
        if (toggleInput) {
            toggleInput.checked = false;
        }

        currentWorksheet.problems.forEach((problem, index) => {
            if (problem.type === 'passage') return;
            const feedback = document.getElementById(`feedback-${index}`);
            if (feedback) {
                feedback.style.display = 'none';
            }
        });

        // Reset timer
        stopTimer();
        elapsedSeconds = 0;
        updateTimerDisplay();
    }
}

// Update completion badge on level selection screen
function updateCompletionBadge(level) {
    console.log(`English worksheet ${level} marked as completed`);
}
