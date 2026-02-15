// Learn English with Stories Generator
// Original educational stories for different age groups

let currentAge = null;
let currentDifficulty = null;
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
function selectAge(age) {
    currentAge = age;
    document.getElementById('age-selection').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';
}

function backToAges() {
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('story-selection').style.display = 'none';
    document.getElementById('age-selection').style.display = 'block';
}

function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    loadStoryList();
}

function backToDifficulties() {
    document.getElementById('story-selection').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';
}

function backToStoryList() {
    document.getElementById('story-reader').style.display = 'none';
    document.getElementById('story-selection').style.display = 'block';
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
    if (!currentAge || !currentDifficulty) return;

    const stories = storyDatabase[currentAge]?.[currentDifficulty] || [];

    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('story-selection').style.display = 'block';

    const difficultyStars = {
        easy: '⭐',
        medium: '⭐⭐',
        hard: '⭐⭐⭐'
    };

    const title = `Age ${currentAge} - ${difficultyStars[currentDifficulty]} ${currentDifficulty.toUpperCase()} Stories`;
    document.getElementById('story-list-title').textContent = title;

    const listContainer = document.getElementById('story-list');

    if (stories.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
                <p style="font-size: 1.2em; color: #666;">No stories available for this age and difficulty level yet.</p>
                <p style="color: #999;">More stories coming soon!</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = stories.map(story => `
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
    if (!currentAge || !currentDifficulty) return;

    const stories = storyDatabase[currentAge]?.[currentDifficulty] || [];
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    currentStory = story;

    document.getElementById('story-selection').style.display = 'none';
    document.getElementById('story-reader').style.display = 'block';

    const readerContainer = document.getElementById('story-reader');
    readerContainer.innerHTML = `
        <div class="navigation" style="margin-bottom: 20px;">
            <button onclick="backToStoryList()">← Back to Stories</button>
        </div>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-size: 1.2em; font-weight: bold;">
            📊 Age Group: ${currentAge}
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
