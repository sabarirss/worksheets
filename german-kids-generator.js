// German Kids Story Generator - Simple stories with comprehension questions

let currentAge = null;
let currentDifficulty = '';
let currentStory = '';
let userAnswers = [];
let currentScore = 0;

// Navigation functions
function selectAge(age) {
    currentAge = age;
    document.getElementById('age-selection').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';
}

function backToAges() {
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('age-selection').style.display = 'block';
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

    // Treat users without version field as demo (for existing users)
    const version = user.version || 'demo';
    return version === 'demo';
}

function getDemoLimit(defaultCount) {
    return isDemoMode() ? Math.min(2, defaultCount) : defaultCount;
}

// German stories database for kids aged 6-8
const germanStories = {
    easy: {
        cat: {
            name: 'Die Katze (The Cat)',
            icon: '🐱',
            illustration: '🐱',
            story: `
                <p>Das ist Mia. Mia ist eine Katze.</p>
                <p>Mia ist klein. Mia ist weich.</p>
                <p>Mia mag Milch. Mia trinkt Milch.</p>
                <p>Mia spielt gern. Mia spielt mit dem Ball.</p>
                <p>Mia schläft viel. Mia ist müde.</p>
                <p>Ich liebe Mia!</p>
            `,
            vocabulary: [
                { word: 'die Katze', meaning: 'the cat' },
                { word: 'klein', meaning: 'small' },
                { word: 'weich', meaning: 'soft' },
                { word: 'Milch', meaning: 'milk' },
                { word: 'trinkt', meaning: 'drinks' },
                { word: 'spielt', meaning: 'plays' },
                { word: 'schläft', meaning: 'sleeps' },
                { word: 'müde', meaning: 'tired' }
            ],
            questions: [
                {
                    question: 'Wie heißt die Katze? (What is the cat\'s name?)',
                    options: ['Mia', 'Lisa', 'Emma', 'Anna'],
                    correct: 0
                },
                {
                    question: 'Was trinkt Mia? (What does Mia drink?)',
                    options: ['Wasser (water)', 'Milch (milk)', 'Saft (juice)', 'Tee (tea)'],
                    correct: 1
                },
                {
                    question: 'Womit spielt Mia? (What does Mia play with?)',
                    options: ['mit dem Buch (book)', 'mit dem Auto (car)', 'mit dem Ball (ball)', 'mit der Puppe (doll)'],
                    correct: 2
                }
            ]
        },
        dog: {
            name: 'Der Hund (The Dog)',
            icon: '🐶',
            illustration: '🐶',
            story: `
                <p>Das ist Max. Max ist ein Hund.</p>
                <p>Max ist groß. Max ist braun.</p>
                <p>Max mag Wasser. Max trinkt viel Wasser.</p>
                <p>Max läuft gern. Max läuft im Park.</p>
                <p>Max bellt laut. Wau wau!</p>
                <p>Max ist mein Freund!</p>
            `,
            vocabulary: [
                { word: 'der Hund', meaning: 'the dog' },
                { word: 'groß', meaning: 'big' },
                { word: 'braun', meaning: 'brown' },
                { word: 'Wasser', meaning: 'water' },
                { word: 'läuft', meaning: 'runs' },
                { word: 'Park', meaning: 'park' },
                { word: 'bellt', meaning: 'barks' },
                { word: 'Freund', meaning: 'friend' }
            ],
            questions: [
                {
                    question: 'Wie heißt der Hund? (What is the dog\'s name?)',
                    options: ['Tom', 'Max', 'Ben', 'Sam'],
                    correct: 1
                },
                {
                    question: 'Welche Farbe hat Max? (What color is Max?)',
                    options: ['schwarz (black)', 'weiß (white)', 'braun (brown)', 'gelb (yellow)'],
                    correct: 2
                },
                {
                    question: 'Wo läuft Max? (Where does Max run?)',
                    options: ['im Haus (in house)', 'im Park (in park)', 'in der Schule (in school)', 'im Laden (in store)'],
                    correct: 1
                }
            ]
        },
        apple: {
            name: 'Der Apfel (The Apple)',
            icon: '🍎',
            illustration: '🍎',
            story: `
                <p>Ich sehe einen Apfel. Der Apfel ist rot.</p>
                <p>Der Apfel ist rund. Der Apfel ist groß.</p>
                <p>Ich nehme den Apfel. Ich wasche den Apfel.</p>
                <p>Ich esse den Apfel. Der Apfel ist süß!</p>
                <p>Mmm, lecker! Ich mag Äpfel!</p>
            `,
            vocabulary: [
                { word: 'der Apfel', meaning: 'the apple' },
                { word: 'rot', meaning: 'red' },
                { word: 'rund', meaning: 'round' },
                { word: 'nehme', meaning: 'take' },
                { word: 'wasche', meaning: 'wash' },
                { word: 'esse', meaning: 'eat' },
                { word: 'süß', meaning: 'sweet' },
                { word: 'lecker', meaning: 'delicious' }
            ],
            questions: [
                {
                    question: 'Welche Farbe hat der Apfel? (What color is the apple?)',
                    options: ['grün (green)', 'rot (red)', 'gelb (yellow)', 'blau (blue)'],
                    correct: 1
                },
                {
                    question: 'Wie ist der Apfel? (How is the apple?)',
                    options: ['süß (sweet)', 'sauer (sour)', 'bitter (bitter)', 'salzig (salty)'],
                    correct: 0
                },
                {
                    question: 'Was mache ich mit dem Apfel? (What do I do with the apple?)',
                    options: ['werfen (throw)', 'kaufen (buy)', 'essen (eat)', 'verstecken (hide)'],
                    correct: 2
                }
            ]
        }
    },
    medium: {
        birthday: {
            name: 'Der Geburtstag (The Birthday)',
            icon: '🎂',
            illustration: '🎂🎈🎁',
            story: `
                <p>Heute ist Lenas Geburtstag. Sie ist jetzt sieben Jahre alt.</p>
                <p>Mama bäckt einen großen Kuchen. Der Kuchen ist sehr schön!</p>
                <p>Papa kauft bunte Luftballons. Es gibt rote, blaue und gelbe Luftballons.</p>
                <p>Lenas Freunde kommen zur Party. Sie bringen Geschenke mit.</p>
                <p>Alle singen "Happy Birthday". Lena ist sehr glücklich!</p>
                <p>Sie pustet die Kerzen aus. Dann essen alle Kuchen. Mmm, lecker!</p>
            `,
            vocabulary: [
                { word: 'der Geburtstag', meaning: 'the birthday' },
                { word: 'Jahre alt', meaning: 'years old' },
                { word: 'bäckt', meaning: 'bakes' },
                { word: 'der Kuchen', meaning: 'the cake' },
                { word: 'Luftballons', meaning: 'balloons' },
                { word: 'Geschenke', meaning: 'gifts' },
                { word: 'glücklich', meaning: 'happy' },
                { word: 'Kerzen', meaning: 'candles' }
            ],
            questions: [
                {
                    question: 'Wie alt ist Lena jetzt? (How old is Lena now?)',
                    options: ['6 Jahre', '7 Jahre', '8 Jahre', '9 Jahre'],
                    correct: 1
                },
                {
                    question: 'Wer bäckt den Kuchen? (Who bakes the cake?)',
                    options: ['Papa', 'Mama', 'Oma', 'Lena'],
                    correct: 1
                },
                {
                    question: 'Was bringen die Freunde mit? (What do the friends bring?)',
                    options: ['Bücher (books)', 'Geschenke (gifts)', 'Spielzeug (toys)', 'Blumen (flowers)'],
                    correct: 1
                },
                {
                    question: 'Welche Farben haben die Luftballons? (What colors are the balloons?)',
                    options: ['schwarz und weiß', 'rot, blau und gelb', 'grün und orange', 'pink und lila'],
                    correct: 1
                }
            ]
        },
        park: {
            name: 'Im Park (In the Park)',
            icon: '🌳',
            illustration: '🌳🦆🌞',
            story: `
                <p>Tim und Anna gehen in den Park. Die Sonne scheint hell.</p>
                <p>Sie sehen einen großen Baum. Unter dem Baum ist ein kleiner Teich.</p>
                <p>Im Teich schwimmen Enten. Die Enten sind gelb und braun.</p>
                <p>Tim hat Brot dabei. Er füttert die Enten. Die Enten sind hungrig!</p>
                <p>Anna spielt auf dem Spielplatz. Sie schaukelt hoch in die Luft.</p>
                <p>Nach einer Stunde gehen sie nach Hause. Sie hatten viel Spaß!</p>
            `,
            vocabulary: [
                { word: 'der Park', meaning: 'the park' },
                { word: 'die Sonne scheint', meaning: 'the sun shines' },
                { word: 'der Baum', meaning: 'the tree' },
                { word: 'der Teich', meaning: 'the pond' },
                { word: 'Enten', meaning: 'ducks' },
                { word: 'füttert', meaning: 'feeds' },
                { word: 'schaukelt', meaning: 'swings' },
                { word: 'Spaß', meaning: 'fun' }
            ],
            questions: [
                {
                    question: 'Wohin gehen Tim und Anna? (Where do Tim and Anna go?)',
                    options: ['in die Schule', 'in den Park', 'ins Kino', 'zum Strand'],
                    correct: 1
                },
                {
                    question: 'Was schwimmt im Teich? (What swims in the pond?)',
                    options: ['Fische (fish)', 'Enten (ducks)', 'Boote (boats)', 'Kinder (children)'],
                    correct: 1
                },
                {
                    question: 'Was macht Anna? (What does Anna do?)',
                    options: ['Sie liest (reads)', 'Sie malt (paints)', 'Sie schaukelt (swings)', 'Sie singt (sings)'],
                    correct: 2
                },
                {
                    question: 'Wie ist das Wetter? (How is the weather?)',
                    options: ['Es regnet (raining)', 'Die Sonne scheint (sunny)', 'Es schneit (snowing)', 'Es ist kalt (cold)'],
                    correct: 1
                }
            ]
        },
        school: {
            name: 'Die Schule (The School)',
            icon: '🏫',
            illustration: '🏫📚✏️',
            story: `
                <p>Emma geht gern in die Schule. Sie ist in der ersten Klasse.</p>
                <p>Ihre Lehrerin heißt Frau Müller. Frau Müller ist sehr nett.</p>
                <p>Heute lernen sie Buchstaben. Emma schreibt mit einem blauen Stift.</p>
                <p>In der Pause spielt Emma mit ihren Freunden. Sie springen Seil.</p>
                <p>Nach der Schule macht Emma ihre Hausaufgaben. Dann liest sie ein Buch.</p>
                <p>Emma mag die Schule. Sie lernt jeden Tag etwas Neues!</p>
            `,
            vocabulary: [
                { word: 'die Schule', meaning: 'the school' },
                { word: 'die Klasse', meaning: 'the class/grade' },
                { word: 'die Lehrerin', meaning: 'the teacher (female)' },
                { word: 'Buchstaben', meaning: 'letters' },
                { word: 'die Pause', meaning: 'the break' },
                { word: 'Hausaufgaben', meaning: 'homework' },
                { word: 'lernt', meaning: 'learns' },
                { word: 'etwas Neues', meaning: 'something new' }
            ],
            questions: [
                {
                    question: 'In welcher Klasse ist Emma? (In which grade is Emma?)',
                    options: ['erste Klasse', 'zweite Klasse', 'dritte Klasse', 'vierte Klasse'],
                    correct: 0
                },
                {
                    question: 'Wie heißt die Lehrerin? (What is the teacher\'s name?)',
                    options: ['Frau Schmidt', 'Frau Müller', 'Frau Weber', 'Frau Meyer'],
                    correct: 1
                },
                {
                    question: 'Was lernen sie heute? (What do they learn today?)',
                    options: ['Zahlen (numbers)', 'Buchstaben (letters)', 'Farben (colors)', 'Tiere (animals)'],
                    correct: 1
                },
                {
                    question: 'Was macht Emma nach der Schule? (What does Emma do after school?)',
                    options: ['Sie spielt nur', 'Sie schläft', 'Sie macht Hausaufgaben', 'Sie sieht fern'],
                    correct: 2
                }
            ]
        }
    },
    hard: {
        forest: {
            name: 'Der Waldspaziergang (The Forest Walk)',
            icon: '🌲',
            illustration: '🌲🦌🍄',
            story: `
                <p>Familie Schmidt macht einen Spaziergang im Wald. Es ist Herbst, und die Blätter sind bunt.</p>
                <p>Vater zeigt auf einen Baum. "Seht mal, das ist eine Eiche", sagt er. Die Kinder schauen nach oben.</p>
                <p>Plötzlich sehen sie ein Reh zwischen den Bäumen. Das Reh ist vorsichtig und still.</p>
                <p>Mutter sagt leise: "Seid ganz ruhig! Das Reh hat Angst vor lauten Geräuschen."</p>
                <p>Die Kinder beobachten das schöne Tier. Nach einer Minute läuft das Reh davon.</p>
                <p>Auf dem Rückweg sammeln sie bunte Blätter und Kastanien. Zu Hause basteln sie damit.</p>
            `,
            vocabulary: [
                { word: 'der Wald', meaning: 'the forest' },
                { word: 'der Spaziergang', meaning: 'the walk' },
                { word: 'der Herbst', meaning: 'autumn/fall' },
                { word: 'die Eiche', meaning: 'the oak tree' },
                { word: 'das Reh', meaning: 'the deer' },
                { word: 'vorsichtig', meaning: 'careful' },
                { word: 'Geräusche', meaning: 'noises' },
                { word: 'sammeln', meaning: 'collect' },
                { word: 'basteln', meaning: 'craft/make' }
            ],
            questions: [
                {
                    question: 'Welche Jahreszeit ist es? (What season is it?)',
                    options: ['Frühling (spring)', 'Sommer (summer)', 'Herbst (autumn)', 'Winter (winter)'],
                    correct: 2
                },
                {
                    question: 'Welches Tier sehen sie? (Which animal do they see?)',
                    options: ['einen Fuchs (fox)', 'ein Reh (deer)', 'einen Hasen (rabbit)', 'einen Vogel (bird)'],
                    correct: 1
                },
                {
                    question: 'Warum sollen die Kinder ruhig sein? (Why should the children be quiet?)',
                    options: ['Weil Papa schläft', 'Weil es dunkel ist', 'Weil das Reh Angst hat', 'Weil es verboten ist'],
                    correct: 2
                },
                {
                    question: 'Was sammeln sie? (What do they collect?)',
                    options: ['Steine und Blumen', 'Blätter und Kastanien', 'Pilze und Beeren', 'Zweige und Moos'],
                    correct: 1
                },
                {
                    question: 'Was machen sie zu Hause? (What do they do at home?)',
                    options: ['Sie kochen', 'Sie basteln', 'Sie lesen', 'Sie schlafen'],
                    correct: 1
                }
            ]
        },
        zoo: {
            name: 'Im Zoo (At the Zoo)',
            icon: '🦁',
            illustration: '🦁🐘🦒',
            story: `
                <p>Lukas besucht mit seiner Familie den Zoo. Es ist ein sonniger Tag, perfekt für einen Ausflug.</p>
                <p>Zuerst gehen sie zu den Elefanten. Die Elefanten sind riesig! Ein Elefant sprüht Wasser mit seinem Rüssel.</p>
                <p>Danach sehen sie die Giraffen. "Giraffen haben sehr lange Hälse", erklärt die Zoowärterin.</p>
                <p>Die Giraffen fressen Blätter von den hohen Bäumen. Ihr Fell hat schöne braune Flecken.</p>
                <p>Beim Löwengehege hören sie ein lautes Brüllen. Der Löwe liegt in der Sonne und ruht sich aus.</p>
                <p>Zum Schluss kauft Papa jedem ein Eis. Lukas hat einen tollen Tag im Zoo verbracht!</p>
            `,
            vocabulary: [
                { word: 'der Zoo', meaning: 'the zoo' },
                { word: 'der Ausflug', meaning: 'the trip/outing' },
                { word: 'riesig', meaning: 'huge/giant' },
                { word: 'der Rüssel', meaning: 'the trunk (elephant)' },
                { word: 'der Hals', meaning: 'the neck' },
                { word: 'die Zoowärterin', meaning: 'the zookeeper (female)' },
                { word: 'das Fell', meaning: 'the fur' },
                { word: 'Flecken', meaning: 'spots' },
                { word: 'das Brüllen', meaning: 'the roar' },
                { word: 'verbracht', meaning: 'spent (time)' }
            ],
            questions: [
                {
                    question: 'Wie ist das Wetter? (How is the weather?)',
                    options: ['Es regnet', 'Es ist sonnig', 'Es ist bewölkt', 'Es schneit'],
                    correct: 1
                },
                {
                    question: 'Was macht der Elefant? (What does the elephant do?)',
                    options: ['Er schläft', 'Er isst', 'Er sprüht Wasser', 'Er rennt'],
                    correct: 2
                },
                {
                    question: 'Was haben Giraffen? (What do giraffes have?)',
                    options: ['kurze Beine', 'lange Hälse', 'große Ohren', 'kleinen Schwanz'],
                    correct: 1
                },
                {
                    question: 'Wo liegt der Löwe? (Where is the lion lying?)',
                    options: ['im Wasser', 'im Schatten', 'in der Sonne', 'im Haus'],
                    correct: 2
                },
                {
                    question: 'Was kauft Papa zum Schluss? (What does Dad buy at the end?)',
                    options: ['Kuchen', 'Eis', 'Süßigkeiten', 'Getränke'],
                    correct: 1
                }
            ]
        },
        beach: {
            name: 'Am Strand (At the Beach)',
            icon: '🏖️',
            illustration: '🏖️🌊☀️',
            story: `
                <p>Die Familie verbringt den Sommer am Meer. Sophie und ihr Bruder Paul freuen sich sehr.</p>
                <p>Am Strand bauen sie eine große Sandburg. Sie brauchen viele Eimer voll Sand.</p>
                <p>Sophie verziert die Burg mit Muscheln. Sie hat viele schöne Muscheln gesammelt.</p>
                <p>Paul gräbt einen tiefen Graben um die Burg. "Das ist zum Schutz vor dem Wasser", sagt er.</p>
                <p>Später spielen sie im Meer. Die Wellen sind klein und warm. Das Wasser ist herrlich!</p>
                <p>Mama hat Butterbrote und Obst mitgebracht. Sie picknicken unter einem bunten Sonnenschirm.</p>
                <p>Am Abend sind alle müde, aber glücklich. Es war ein wundervoller Tag am Strand!</p>
            `,
            vocabulary: [
                { word: 'der Strand', meaning: 'the beach' },
                { word: 'das Meer', meaning: 'the sea/ocean' },
                { word: 'die Sandburg', meaning: 'the sandcastle' },
                { word: 'der Eimer', meaning: 'the bucket' },
                { word: 'Muscheln', meaning: 'shells' },
                { word: 'der Graben', meaning: 'the moat/trench' },
                { word: 'die Wellen', meaning: 'the waves' },
                { word: 'der Sonnenschirm', meaning: 'the beach umbrella' },
                { word: 'herrlich', meaning: 'wonderful/lovely' },
                { word: 'wundervoll', meaning: 'wonderful' }
            ],
            questions: [
                {
                    question: 'Wo verbringt die Familie den Sommer? (Where does the family spend summer?)',
                    options: ['in den Bergen', 'am Meer', 'in der Stadt', 'auf dem Bauernhof'],
                    correct: 1
                },
                {
                    question: 'Was bauen Sophie und Paul? (What do Sophie and Paul build?)',
                    options: ['ein Boot', 'eine Sandburg', 'ein Haus', 'eine Brücke'],
                    correct: 1
                },
                {
                    question: 'Womit verziert Sophie die Burg? (What does Sophie decorate the castle with?)',
                    options: ['mit Steinen', 'mit Muscheln', 'mit Blumen', 'mit Fahnen'],
                    correct: 1
                },
                {
                    question: 'Warum gräbt Paul einen Graben? (Why does Paul dig a moat?)',
                    options: ['Zum Spielen', 'Zum Schutz vor dem Wasser', 'Zum Verstecken', 'Zum Sammeln'],
                    correct: 1
                },
                {
                    question: 'Wie sind die Wellen? (How are the waves?)',
                    options: ['groß und kalt', 'klein und warm', 'sehr hoch', 'sehr laut'],
                    correct: 1
                }
            ]
        }
    }
};

/**
 * Load story list for selected difficulty
 */
function loadStoryList(difficulty) {
    currentDifficulty = difficulty;
    userAnswers = [];
    currentScore = 0;

    const difficultySelection = document.getElementById('difficulty-selection');
    const storySelection = document.getElementById('story-selection');
    const storyArea = document.getElementById('story-area');

    difficultySelection.style.display = 'none';
    storySelection.style.display = 'block';
    storyArea.innerHTML = '';

    const titleMap = {
        easy: '⭐ Einfache Geschichten (Easy Stories)',
        medium: '⭐⭐ Mittlere Geschichten (Medium Stories)',
        hard: '⭐⭐⭐ Schwere Geschichten (Hard Stories)'
    };

    document.getElementById('story-list-title').textContent = titleMap[difficulty];

    const storyList = document.getElementById('story-list');
    storyList.innerHTML = '';

    const stories = germanStories[difficulty];

    const storyEntries = Object.entries(stories);

    for (const [key, story] of storyEntries) {
        const card = document.createElement('div');
        card.className = 'story-card';
        card.onclick = () => loadStory(key);

        card.innerHTML = `
            <div class="story-icon">${story.icon}</div>
            <div class="story-name">${story.name}</div>
        `;

        storyList.appendChild(card);
    }
}

/**
 * Load and display story with questions
 */
function loadStory(storyKey) {
    currentStory = storyKey;
    userAnswers = [];
    currentScore = 0;

    const storySelection = document.getElementById('story-selection');
    const storyArea = document.getElementById('story-area');

    storySelection.style.display = 'none';

    const story = germanStories[currentDifficulty][storyKey];

    // Build vocabulary section
    let vocabularyHTML = '';
    story.vocabulary.forEach(item => {
        vocabularyHTML += `
            <div class="vocab-item">
                <span class="vocab-word">${item.word}</span> = ${item.meaning}
            </div>
        `;
    });

    // Build questions section
    let questionsHTML = '';
    story.questions.forEach((q, qIndex) => {
        let optionsHTML = '';
        q.options.forEach((option, oIndex) => {
            optionsHTML += `
                <button class="answer-btn" onclick="selectAnswer(${qIndex}, ${oIndex})" id="answer-${qIndex}-${oIndex}">
                    ${String.fromCharCode(65 + oIndex)}) ${option}
                </button>
            `;
        });

        questionsHTML += `
            <div class="question-box" id="question-${qIndex}">
                <div class="question-text">${qIndex + 1}. ${q.question}</div>
                <div class="answer-options">
                    ${optionsHTML}
                </div>
                <div class="feedback" id="feedback-${qIndex}" style="display: none;"></div>
            </div>
        `;
    });

    storyArea.innerHTML = `
        <div class="navigation" style="margin-bottom: 20px;">
            <button onclick="backToStoryList()">← Back to Story List</button>
        </div>

        <div class="story-container">
            <div class="story-title">${story.name}</div>

            <div class="story-illustration">${story.illustration}</div>

            <div class="vocabulary-box">
                <h3>📖 Wichtige Wörter (Important Words)</h3>
                ${vocabularyHTML}
            </div>

            <div class="story-text">
                ${story.story}
            </div>

            <div class="questions-section">
                <h2 style="text-align: center; color: #764ba2; margin-bottom: 30px;">
                    ❓ Verständnisfragen (Comprehension Questions)
                </h2>
                ${questionsHTML}

                <div style="text-align: center; margin-top: 40px;">
                    <button onclick="checkAllAnswers()" style="
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
                        ✓ Antworten prüfen (Check Answers)
                    </button>
                </div>

                <div id="score-display" style="display: none;"></div>
            </div>
        </div>
    `;
}

/**
 * Select an answer
 */
function selectAnswer(questionIndex, optionIndex) {
    const story = germanStories[currentDifficulty][currentStory];
    const question = story.questions[questionIndex];

    // Remove previous selection
    for (let i = 0; i < question.options.length; i++) {
        const btn = document.getElementById(`answer-${questionIndex}-${i}`);
        if (btn) {
            btn.classList.remove('selected');
        }
    }

    // Mark current selection
    const selectedBtn = document.getElementById(`answer-${questionIndex}-${optionIndex}`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }

    // Store answer
    userAnswers[questionIndex] = optionIndex;
}

/**
 * Check all answers
 */
function checkAllAnswers() {
    const story = germanStories[currentDifficulty][currentStory];
    let score = 0;
    let totalQuestions = story.questions.length;

    story.questions.forEach((question, qIndex) => {
        const userAnswer = userAnswers[qIndex];
        const correctAnswer = question.correct;
        const isCorrect = userAnswer === correctAnswer;

        if (isCorrect) {
            score++;
        }

        // Update button styles
        for (let i = 0; i < question.options.length; i++) {
            const btn = document.getElementById(`answer-${qIndex}-${i}`);
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
        const feedback = document.getElementById(`feedback-${qIndex}`);
        if (feedback) {
            feedback.style.display = 'block';
            if (isCorrect) {
                feedback.className = 'feedback correct';
                feedback.textContent = '✓ Richtig! (Correct!)';
            } else {
                feedback.className = 'feedback incorrect';
                feedback.textContent = `✗ Falsch! Die richtige Antwort ist: ${String.fromCharCode(65 + correctAnswer)}) ${question.options[correctAnswer]}`;
            }
        }
    });

    // Show score
    const percentage = Math.round((score / totalQuestions) * 100);
    let emoji = '😊';
    let message = 'Gut gemacht! (Well done!)';

    if (percentage === 100) {
        emoji = '🌟';
        message = 'Perfekt! (Perfect!)';
    } else if (percentage >= 75) {
        emoji = '😊';
        message = 'Sehr gut! (Very good!)';
    } else if (percentage >= 50) {
        emoji = '👍';
        message = 'Gut! (Good!)';
    } else {
        emoji = '💪';
        message = 'Weiter üben! (Keep practicing!)';
    }

    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
        scoreDisplay.style.display = 'block';
        scoreDisplay.className = 'score-display';
        scoreDisplay.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 10px;">${emoji}</div>
            <div style="font-size: 1.8em; margin-bottom: 10px;">${message}</div>
            <div style="font-size: 1.3em;">
                ${score} von ${totalQuestions} richtig (${percentage}%)
            </div>
        `;
    }

    currentScore = score;
}

/**
 * Back to story list
 */
function backToStoryList() {
    const storySelection = document.getElementById('story-selection');
    const storyArea = document.getElementById('story-area');

    storyArea.innerHTML = '';
    storySelection.style.display = 'block';
}

/**
 * Back to difficulty selection
 */
function backToDifficulty() {
    const difficultySelection = document.getElementById('difficulty-selection');
    const storySelection = document.getElementById('story-selection');

    storySelection.style.display = 'none';
    difficultySelection.style.display = 'block';
}
