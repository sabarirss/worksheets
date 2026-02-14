// German A1 Stories Generator - Adult beginner stories with comprehension questions

let a1CurrentDifficulty = '';
let a1CurrentStory = '';
let a1UserAnswers = [];
let a1CurrentScore = 0;

// German A1 stories database for adults
const germanA1Stories = {
    easy: {
        supermarket: {
            name: 'Im Supermarkt (At the Supermarket)',
            icon: '🛒',
            story: `
                <p>Ich gehe in den Supermarkt. Der Supermarkt ist groß.</p>
                <p>Ich brauche Brot, Milch und Käse.</p>
                <p>Das Brot kostet 2 Euro. Die Milch kostet 1 Euro.</p>
                <p>Der Käse ist teuer. Er kostet 5 Euro.</p>
                <p>Ich bezahle an der Kasse. Ich bezahle mit Karte.</p>
                <p>Ich sage "Danke" und gehe nach Hause.</p>
            `,
            vocabulary: [
                { word: 'der Supermarkt', meaning: 'the supermarket' },
                { word: 'brauche', meaning: 'need' },
                { word: 'das Brot', meaning: 'the bread' },
                { word: 'die Milch', meaning: 'the milk' },
                { word: 'der Käse', meaning: 'the cheese' },
                { word: 'kostet', meaning: 'costs' },
                { word: 'teuer', meaning: 'expensive' },
                { word: 'bezahle', meaning: 'pay' },
                { word: 'die Kasse', meaning: 'the checkout/register' }
            ],
            questions: [
                {
                    question: 'Was brauche ich? (What do I need?)',
                    options: ['Brot, Milch und Käse', 'Brot, Wasser und Butter', 'Milch, Eier und Fleisch', 'Käse, Obst und Gemüse'],
                    correct: 0
                },
                {
                    question: 'Wie viel kostet die Milch? (How much does the milk cost?)',
                    options: ['1 Euro', '2 Euro', '5 Euro', '3 Euro'],
                    correct: 0
                },
                {
                    question: 'Wie bezahle ich? (How do I pay?)',
                    options: ['mit Bargeld (cash)', 'mit Karte (card)', 'mit Scheck (check)', 'nicht (not)'],
                    correct: 1
                }
            ]
        },
        cafe: {
            name: 'Im Café (At the Café)',
            icon: '☕',
            story: `
                <p>Ich bin im Café. Das Café ist schön und gemütlich.</p>
                <p>Ich möchte einen Kaffee trinken. Der Kellner kommt.</p>
                <p>"Guten Tag! Was möchten Sie?", fragt er.</p>
                <p>"Einen Kaffee, bitte", sage ich.</p>
                <p>Der Kaffee ist heiß und lecker. Er kostet 3 Euro.</p>
                <p>Ich trinke den Kaffee und lese die Zeitung.</p>
            `,
            vocabulary: [
                { word: 'das Café', meaning: 'the café' },
                { word: 'gemütlich', meaning: 'cozy/comfortable' },
                { word: 'möchte', meaning: 'would like' },
                { word: 'der Kaffee', meaning: 'the coffee' },
                { word: 'der Kellner', meaning: 'the waiter' },
                { word: 'heiß', meaning: 'hot' },
                { word: 'lecker', meaning: 'delicious' },
                { word: 'die Zeitung', meaning: 'the newspaper' },
                { word: 'lese', meaning: 'read' }
            ],
            questions: [
                {
                    question: 'Wo bin ich? (Where am I?)',
                    options: ['im Restaurant', 'im Café', 'zu Hause', 'im Büro'],
                    correct: 1
                },
                {
                    question: 'Was möchte ich trinken? (What would I like to drink?)',
                    options: ['Tee', 'Wasser', 'Kaffee', 'Saft'],
                    correct: 2
                },
                {
                    question: 'Was mache ich im Café? (What do I do in the café?)',
                    options: ['Ich arbeite', 'Ich schlafe', 'Ich lese die Zeitung', 'Ich koche'],
                    correct: 2
                }
            ]
        },
        apartment: {
            name: 'Die neue Wohnung (The New Apartment)',
            icon: '🏠',
            story: `
                <p>Ich habe eine neue Wohnung. Die Wohnung ist klein aber schön.</p>
                <p>Sie hat zwei Zimmer, eine Küche und ein Bad.</p>
                <p>Das Wohnzimmer ist hell. Es hat ein großes Fenster.</p>
                <p>Das Schlafzimmer ist ruhig. Ich schlafe gut hier.</p>
                <p>Die Miete ist nicht teuer. Ich bezahle 600 Euro im Monat.</p>
                <p>Ich bin sehr glücklich mit meiner neuen Wohnung!</p>
            `,
            vocabulary: [
                { word: 'die Wohnung', meaning: 'the apartment' },
                { word: 'das Zimmer', meaning: 'the room' },
                { word: 'die Küche', meaning: 'the kitchen' },
                { word: 'das Bad', meaning: 'the bathroom' },
                { word: 'das Wohnzimmer', meaning: 'the living room' },
                { word: 'hell', meaning: 'bright' },
                { word: 'das Fenster', meaning: 'the window' },
                { word: 'ruhig', meaning: 'quiet' },
                { word: 'die Miete', meaning: 'the rent' }
            ],
            questions: [
                {
                    question: 'Wie viele Zimmer hat die Wohnung? (How many rooms does the apartment have?)',
                    options: ['ein Zimmer', 'zwei Zimmer', 'drei Zimmer', 'vier Zimmer'],
                    correct: 1
                },
                {
                    question: 'Wie ist das Wohnzimmer? (How is the living room?)',
                    options: ['dunkel (dark)', 'klein (small)', 'hell (bright)', 'laut (loud)'],
                    correct: 2
                },
                {
                    question: 'Wie viel ist die Miete? (How much is the rent?)',
                    options: ['600 Euro', '500 Euro', '700 Euro', '800 Euro'],
                    correct: 0
                }
            ]
        }
    },
    medium: {
        firstday: {
            name: 'Der erste Arbeitstag (First Day at Work)',
            icon: '💼',
            story: `
                <p>Heute ist mein erster Arbeitstag. Ich bin nervös aber auch froh.</p>
                <p>Ich arbeite jetzt in einer Firma. Die Firma ist in der Stadtmitte.</p>
                <p>Mein Chef heißt Herr Müller. Er ist sehr freundlich und hilft mir.</p>
                <p>Meine Kollegin heißt Frau Schmidt. Sie zeigt mir das Büro und erklärt alles.</p>
                <p>Ich habe einen eigenen Schreibtisch und einen Computer. Das ist toll!</p>
                <p>Um 12 Uhr machen wir Mittagspause. Wir gehen zusammen essen.</p>
                <p>Der erste Tag ist gut. Ich freue mich auf morgen!</p>
            `,
            vocabulary: [
                { word: 'der Arbeitstag', meaning: 'the working day' },
                { word: 'nervös', meaning: 'nervous' },
                { word: 'froh', meaning: 'glad/happy' },
                { word: 'die Firma', meaning: 'the company' },
                { word: 'der Chef', meaning: 'the boss' },
                { word: 'freundlich', meaning: 'friendly' },
                { word: 'die Kollegin', meaning: 'the colleague (female)' },
                { word: 'der Schreibtisch', meaning: 'the desk' },
                { word: 'die Mittagspause', meaning: 'the lunch break' },
                { word: 'freue mich', meaning: 'look forward to' }
            ],
            questions: [
                {
                    question: 'Wie fühle ich mich? (How do I feel?)',
                    options: ['nur nervös', 'nervös und froh', 'traurig', 'müde'],
                    correct: 1
                },
                {
                    question: 'Wie heißt mein Chef? (What is my boss\'s name?)',
                    options: ['Herr Schmidt', 'Herr Müller', 'Herr Meyer', 'Herr Weber'],
                    correct: 1
                },
                {
                    question: 'Wo ist die Firma? (Where is the company?)',
                    options: ['auf dem Land', 'in der Stadtmitte', 'am Meer', 'im Dorf'],
                    correct: 1
                },
                {
                    question: 'Wann ist die Mittagspause? (When is the lunch break?)',
                    options: ['um 11 Uhr', 'um 12 Uhr', 'um 13 Uhr', 'um 14 Uhr'],
                    correct: 1
                }
            ]
        },
        doctor: {
            name: 'Beim Arzt (At the Doctor)',
            icon: '🏥',
            story: `
                <p>Ich bin krank. Ich habe Kopfschmerzen und Fieber.</p>
                <p>Ich gehe zum Arzt. Im Wartezimmer sind viele Menschen.</p>
                <p>Nach 20 Minuten ruft die Arzthelferin meinen Namen. Ich gehe ins Sprechzimmer.</p>
                <p>Der Arzt fragt: "Was fehlt Ihnen?" Ich sage: "Ich habe Kopfschmerzen und Fieber."</p>
                <p>Der Arzt untersucht mich. Er sagt: "Sie haben eine Erkältung."</p>
                <p>Er gibt mir ein Rezept für Medikamente. "Trinken Sie viel Wasser und ruhen Sie sich aus", sagt er.</p>
                <p>Ich gehe zur Apotheke und kaufe die Medikamente. Dann gehe ich nach Hause.</p>
            `,
            vocabulary: [
                { word: 'krank', meaning: 'sick/ill' },
                { word: 'Kopfschmerzen', meaning: 'headache' },
                { word: 'das Fieber', meaning: 'the fever' },
                { word: 'der Arzt', meaning: 'the doctor' },
                { word: 'das Wartezimmer', meaning: 'the waiting room' },
                { word: 'die Arzthelferin', meaning: 'the medical assistant (female)' },
                { word: 'das Sprechzimmer', meaning: 'the consultation room' },
                { word: 'die Erkältung', meaning: 'the cold' },
                { word: 'das Rezept', meaning: 'the prescription' },
                { word: 'die Apotheke', meaning: 'the pharmacy' }
            ],
            questions: [
                {
                    question: 'Was habe ich? (What do I have?)',
                    options: ['Bauchschmerzen', 'Kopfschmerzen und Fieber', 'Rückenschmerzen', 'Zahnschmerzen'],
                    correct: 1
                },
                {
                    question: 'Wo warte ich? (Where do I wait?)',
                    options: ['im Sprechzimmer', 'im Wartezimmer', 'draußen', 'zu Hause'],
                    correct: 1
                },
                {
                    question: 'Was habe ich laut Arzt? (What do I have according to the doctor?)',
                    options: ['Grippe', 'Erkältung', 'Allergie', 'Infektion'],
                    correct: 1
                },
                {
                    question: 'Was soll ich trinken? (What should I drink?)',
                    options: ['Kaffee', 'Alkohol', 'viel Wasser', 'nichts'],
                    correct: 2
                }
            ]
        },
        trainstation: {
            name: 'Am Bahnhof (At the Train Station)',
            icon: '🚂',
            story: `
                <p>Ich bin am Bahnhof. Ich möchte nach Berlin fahren.</p>
                <p>Ich gehe zum Schalter und frage: "Wann fährt der nächste Zug nach Berlin?"</p>
                <p>Der Mitarbeiter sagt: "Um 14:30 Uhr auf Gleis 7. Das ist in 15 Minuten."</p>
                <p>Ich kaufe eine Fahrkarte. Sie kostet 45 Euro. Das ist eine einfache Fahrt.</p>
                <p>Ich gehe zu Gleis 7 und warte auf den Zug. Es sind viele Reisende da.</p>
                <p>Der Zug kommt pünktlich. Ich steige ein und finde einen Sitzplatz am Fenster.</p>
                <p>Die Fahrt nach Berlin dauert 2 Stunden. Ich lese ein Buch während der Fahrt.</p>
            `,
            vocabulary: [
                { word: 'der Bahnhof', meaning: 'the train station' },
                { word: 'der Zug', meaning: 'the train' },
                { word: 'der Schalter', meaning: 'the counter/ticket office' },
                { word: 'das Gleis', meaning: 'the platform/track' },
                { word: 'die Fahrkarte', meaning: 'the ticket' },
                { word: 'einfache Fahrt', meaning: 'one-way trip' },
                { word: 'der Reisende', meaning: 'the traveler' },
                { word: 'pünktlich', meaning: 'on time' },
                { word: 'steige ein', meaning: 'board/get on' },
                { word: 'der Sitzplatz', meaning: 'the seat' }
            ],
            questions: [
                {
                    question: 'Wohin möchte ich fahren? (Where do I want to go?)',
                    options: ['nach München', 'nach Hamburg', 'nach Berlin', 'nach Frankfurt'],
                    correct: 2
                },
                {
                    question: 'Wann fährt der Zug? (When does the train leave?)',
                    options: ['um 14:00 Uhr', 'um 14:15 Uhr', 'um 14:30 Uhr', 'um 15:00 Uhr'],
                    correct: 2
                },
                {
                    question: 'Wo ist der Zug? (Where is the train?)',
                    options: ['Gleis 5', 'Gleis 6', 'Gleis 7', 'Gleis 8'],
                    correct: 2
                },
                {
                    question: 'Wie lange dauert die Fahrt? (How long is the journey?)',
                    options: ['1 Stunde', '2 Stunden', '3 Stunden', '4 Stunden'],
                    correct: 1
                }
            ]
        }
    },
    hard: {
        apartment_search: {
            name: 'Die Wohnungssuche (Apartment Hunting)',
            icon: '🔍',
            story: `
                <p>Ich suche eine neue Wohnung. Meine alte Wohnung ist zu klein und zu laut.</p>
                <p>Ich schaue im Internet nach Wohnungen. Es gibt viele Angebote, aber die meisten sind zu teuer.</p>
                <p>Endlich finde ich eine interessante Wohnung. Sie liegt im Stadtzentrum und hat drei Zimmer.</p>
                <p>Die Miete beträgt 800 Euro plus Nebenkosten. Das ist okay für mich.</p>
                <p>Ich rufe den Vermieter an und vereinbare einen Besichtigungstermin für morgen um 16 Uhr.</p>
                <p>Am nächsten Tag gehe ich zur Besichtigung. Die Wohnung gefällt mir sehr gut!</p>
                <p>Sie ist hell, modern und hat einen Balkon. Die Küche ist neu und das Bad ist groß.</p>
                <p>Ich sage dem Vermieter: "Die Wohnung ist perfekt! Ich möchte sie mieten."</p>
                <p>Der Vermieter freut sich. Wir unterschreiben den Mietvertrag nächste Woche.</p>
            `,
            vocabulary: [
                { word: 'die Wohnungssuche', meaning: 'the apartment search' },
                { word: 'laut', meaning: 'loud/noisy' },
                { word: 'das Angebot', meaning: 'the offer/listing' },
                { word: 'die Nebenkosten', meaning: 'the additional costs/utilities' },
                { word: 'der Vermieter', meaning: 'the landlord' },
                { word: 'vereinbare', meaning: 'arrange/agree upon' },
                { word: 'der Besichtigungstermin', meaning: 'the viewing appointment' },
                { word: 'gefällt mir', meaning: 'I like it' },
                { word: 'der Balkon', meaning: 'the balcony' },
                { word: 'der Mietvertrag', meaning: 'the rental contract' }
            ],
            questions: [
                {
                    question: 'Warum suche ich eine neue Wohnung? (Why am I looking for a new apartment?)',
                    options: ['zu klein und zu laut', 'zu teuer', 'zu weit weg', 'zu alt'],
                    correct: 0
                },
                {
                    question: 'Wo liegt die neue Wohnung? (Where is the new apartment located?)',
                    options: ['am Stadtrand', 'im Stadtzentrum', 'auf dem Land', 'in einem Dorf'],
                    correct: 1
                },
                {
                    question: 'Wie viel ist die Miete? (How much is the rent?)',
                    options: ['700 Euro', '800 Euro', '900 Euro', '1000 Euro'],
                    correct: 1
                },
                {
                    question: 'Was hat die Wohnung? (What does the apartment have?)',
                    options: ['einen Garten', 'eine Garage', 'einen Balkon', 'eine Terrasse'],
                    correct: 2
                },
                {
                    question: 'Wann unterschreiben wir den Vertrag? (When do we sign the contract?)',
                    options: ['heute', 'morgen', 'nächste Woche', 'nächsten Monat'],
                    correct: 2
                }
            ]
        },
        job_interview: {
            name: 'Das Vorstellungsgespräch (The Job Interview)',
            icon: '👔',
            story: `
                <p>Heute habe ich ein wichtiges Vorstellungsgespräch. Ich habe mich als Bürokauffrau beworben.</p>
                <p>Ich bin sehr aufgeregt. Ich trage einen dunklen Anzug und bin 10 Minuten früher da.</p>
                <p>Die Empfangsdame ist freundlich. Sie bringt mir Wasser und sagt: "Frau Schneider erwartet Sie."</p>
                <p>Frau Schneider ist die Personalleiterin. Sie gibt mir die Hand und sagt: "Willkommen! Bitte setzen Sie sich."</p>
                <p>Sie fragt mich: "Erzählen Sie etwas über sich." Ich spreche über meine Ausbildung und Erfahrung.</p>
                <p>"Warum möchten Sie bei uns arbeiten?", fragt sie. Ich erkläre, dass die Firma einen guten Ruf hat.</p>
                <p>Wir sprechen über meine Stärken und Schwächen. Ich antworte ehrlich aber positiv.</p>
                <p>Am Ende des Gesprächs sagt sie: "Wir melden uns nächste Woche bei Ihnen."</p>
                <p>Ich bedanke mich und gehe zufrieden nach Hause. Ich hoffe, ich bekomme die Stelle!</p>
            `,
            vocabulary: [
                { word: 'das Vorstellungsgespräch', meaning: 'the job interview' },
                { word: 'habe mich beworben', meaning: 'have applied' },
                { word: 'aufgeregt', meaning: 'excited/nervous' },
                { word: 'der Anzug', meaning: 'the suit' },
                { word: 'die Empfangsdame', meaning: 'the receptionist' },
                { word: 'die Personalleiterin', meaning: 'the HR manager (female)' },
                { word: 'die Ausbildung', meaning: 'the education/training' },
                { word: 'die Erfahrung', meaning: 'the experience' },
                { word: 'der Ruf', meaning: 'the reputation' },
                { word: 'die Stärken', meaning: 'the strengths' },
                { word: 'die Schwächen', meaning: 'the weaknesses' },
                { word: 'die Stelle', meaning: 'the position/job' }
            ],
            questions: [
                {
                    question: 'Als was habe ich mich beworben? (What position did I apply for?)',
                    options: ['Verkäuferin', 'Lehrerin', 'Bürokauffrau', 'Krankenschwester'],
                    correct: 2
                },
                {
                    question: 'Wie bin ich gekleidet? (How am I dressed?)',
                    options: ['in Jeans', 'in einem Anzug', 'sportlich', 'casual'],
                    correct: 1
                },
                {
                    question: 'Wer führt das Gespräch? (Who conducts the interview?)',
                    options: ['Herr Schneider', 'Frau Schneider', 'die Empfangsdame', 'der Chef'],
                    correct: 1
                },
                {
                    question: 'Wann bekomme ich eine Antwort? (When will I get an answer?)',
                    options: ['heute', 'morgen', 'nächste Woche', 'nächsten Monat'],
                    correct: 2
                },
                {
                    question: 'Warum möchte ich bei der Firma arbeiten? (Why do I want to work at the company?)',
                    options: ['gutes Gehalt', 'guter Ruf', 'kurzer Weg', 'nette Kollegen'],
                    correct: 1
                }
            ]
        },
        german_course: {
            name: 'Der Deutschkurs (The German Course)',
            icon: '📚',
            story: `
                <p>Ich besuche seit drei Monaten einen Deutschkurs. Der Kurs ist am Abend, dreimal pro Woche.</p>
                <p>Unsere Lehrerin heißt Frau Weber. Sie ist sehr geduldig und erklärt alles sehr gut.</p>
                <p>In meiner Klasse sind 12 Personen aus verschiedenen Ländern: aus der Türkei, aus Polen, aus Spanien und aus Syrien.</p>
                <p>Wir lernen Grammatik, Wortschatz und üben viel sprechen. Das Sprechen ist am Anfang schwierig, aber es wird besser.</p>
                <p>Jede Woche schreiben wir einen kleinen Test. Letzte Woche habe ich eine gute Note bekommen - eine 2!</p>
                <p>Am liebsten mag ich die Gruppenarbeit. Wir arbeiten zusammen und helfen einander.</p>
                <p>In zwei Wochen haben wir die Abschlussprüfung. Ich bin nervös, aber ich habe viel gelernt.</p>
                <p>Mein Ziel ist es, die B1-Prüfung zu bestehen. Dann kann ich besser in Deutschland leben und arbeiten.</p>
                <p>Ich bin sehr froh, dass ich diesen Kurs mache. Deutsch ist schwierig, aber auch interessant!</p>
            `,
            vocabulary: [
                { word: 'der Deutschkurs', meaning: 'the German course' },
                { word: 'besuche', meaning: 'attend' },
                { word: 'geduldig', meaning: 'patient' },
                { word: 'verschiedenen', meaning: 'different/various' },
                { word: 'die Grammatik', meaning: 'the grammar' },
                { word: 'der Wortschatz', meaning: 'the vocabulary' },
                { word: 'üben', meaning: 'practice' },
                { word: 'am Anfang', meaning: 'at the beginning' },
                { word: 'die Note', meaning: 'the grade' },
                { word: 'die Gruppenarbeit', meaning: 'the group work' },
                { word: 'einander', meaning: 'each other' },
                { word: 'die Abschlussprüfung', meaning: 'the final exam' },
                { word: 'bestehen', meaning: 'to pass' }
            ],
            questions: [
                {
                    question: 'Wie oft ist der Kurs? (How often is the course?)',
                    options: ['einmal pro Woche', 'zweimal pro Woche', 'dreimal pro Woche', 'jeden Tag'],
                    correct: 2
                },
                {
                    question: 'Wie viele Personen sind in der Klasse? (How many people are in the class?)',
                    options: ['10', '12', '15', '20'],
                    correct: 1
                },
                {
                    question: 'Was ist am Anfang schwierig? (What is difficult at the beginning?)',
                    options: ['die Grammatik', 'der Wortschatz', 'das Sprechen', 'das Schreiben'],
                    correct: 2
                },
                {
                    question: 'Welche Note habe ich bekommen? (What grade did I get?)',
                    options: ['eine 1', 'eine 2', 'eine 3', 'eine 4'],
                    correct: 1
                },
                {
                    question: 'Wann ist die Abschlussprüfung? (When is the final exam?)',
                    options: ['morgen', 'nächste Woche', 'in zwei Wochen', 'nächsten Monat'],
                    correct: 2
                },
                {
                    question: 'Welche Prüfung möchte ich bestehen? (Which exam do I want to pass?)',
                    options: ['A1', 'A2', 'B1', 'B2'],
                    correct: 2
                }
            ]
        }
    }
};

/**
 * Load A1 Stories section
 */
function loadA1Stories() {
    document.getElementById('main-selection').style.display = 'none';
    document.getElementById('a1-stories-section').style.display = 'block';
    document.getElementById('a1-difficulty-selection').style.display = 'block';
    document.getElementById('a1-story-selection').style.display = 'none';
    document.getElementById('a1-story-content').innerHTML = '';
}

/**
 * Back to main selection
 */
function backToMainSelection() {
    document.getElementById('main-selection').style.display = 'block';
    document.getElementById('a1-stories-section').style.display = 'none';
}

/**
 * Load story list for selected difficulty
 */
function loadA1StoryList(difficulty) {
    a1CurrentDifficulty = difficulty;
    a1UserAnswers = [];
    a1CurrentScore = 0;

    document.getElementById('a1-difficulty-selection').style.display = 'none';
    document.getElementById('a1-story-selection').style.display = 'block';
    document.getElementById('a1-story-content').innerHTML = '';

    const titleMap = {
        easy: '⭐ Einfache Geschichten (Easy Stories)',
        medium: '⭐⭐ Mittlere Geschichten (Medium Stories)',
        hard: '⭐⭐⭐ Schwere Geschichten (Hard Stories)'
    };

    document.getElementById('a1-story-list-title').textContent = titleMap[difficulty];

    const storyList = document.getElementById('a1-story-list');
    storyList.innerHTML = '';

    const stories = germanA1Stories[difficulty];

    for (const [key, story] of Object.entries(stories)) {
        const card = document.createElement('button');
        card.className = 'level-btn';
        card.onclick = () => loadA1Story(key);

        card.innerHTML = `
            <span class="level-name">${story.icon} ${story.name}</span>
        `;

        storyList.appendChild(card);
    }
}

/**
 * Load and display story with questions
 */
function loadA1Story(storyKey) {
    a1CurrentStory = storyKey;
    a1UserAnswers = [];
    a1CurrentScore = 0;

    document.getElementById('a1-story-selection').style.display = 'none';

    const story = germanA1Stories[a1CurrentDifficulty][storyKey];

    // Build vocabulary section
    let vocabularyHTML = '';
    story.vocabulary.forEach(item => {
        vocabularyHTML += `
            <div style="margin: 8px 0; font-size: 1.1em;">
                <span style="font-weight: bold; color: #667eea;">${item.word}</span> = ${item.meaning}
            </div>
        `;
    });

    // Build questions section
    let questionsHTML = '';
    story.questions.forEach((q, qIndex) => {
        let optionsHTML = '';
        q.options.forEach((option, oIndex) => {
            optionsHTML += `
                <button class="answer-btn" onclick="selectA1Answer(${qIndex}, ${oIndex})" id="a1-answer-${qIndex}-${oIndex}" style="
                    padding: 12px 20px;
                    font-size: 1em;
                    border: 2px solid #ddd;
                    background: white;
                    color: #333;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.3s;
                    text-align: left;
                    width: 100%;
                    margin: 5px 0;
                ">
                    ${String.fromCharCode(65 + oIndex)}) ${option}
                </button>
            `;
        });

        questionsHTML += `
            <div style="background: white; border: 2px solid #764ba2; border-radius: 10px; padding: 20px; margin: 15px 0;" id="a1-question-${qIndex}">
                <div style="font-size: 1.2em; font-weight: bold; color: #2c3e50; margin-bottom: 15px;">
                    ${qIndex + 1}. ${q.question}
                </div>
                <div>
                    ${optionsHTML}
                </div>
                <div id="a1-feedback-${qIndex}" style="display: none; margin-top: 10px; padding: 10px; border-radius: 5px; font-weight: bold;"></div>
            </div>
        `;
    });

    const contentArea = document.getElementById('a1-story-content');
    contentArea.innerHTML = `
        <div class="navigation" style="margin-bottom: 20px;">
            <button onclick="backToA1StoryList()">← Back to Story List</button>
        </div>

        <div style="background: white; border: 3px solid #667eea; border-radius: 15px; padding: 40px; margin: 30px 0;">
            <h2 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">${story.icon} ${story.name}</h2>

            <div style="background: #e8f5e9; border-left: 5px solid #4caf50; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="color: #4caf50; margin-top: 0;">📖 Wichtige Wörter (Important Words)</h3>
                ${vocabularyHTML}
            </div>

            <div style="font-size: 1.2em; line-height: 1.8; padding: 30px; background: #f8f9fa; border-radius: 10px; margin: 30px 0;">
                ${story.story}
            </div>

            <div style="margin-top: 50px;">
                <h2 style="text-align: center; color: #764ba2; margin-bottom: 30px;">
                    ❓ Verständnisfragen (Comprehension Questions)
                </h2>
                ${questionsHTML}

                <div style="text-align: center; margin-top: 40px;">
                    <button onclick="checkA1AllAnswers()" style="
                        padding: 18px 45px;
                        font-size: 1.2em;
                        border: none;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    ">
                        ✓ Antworten prüfen (Check Answers)
                    </button>
                </div>

                <div id="a1-score-display" style="display: none;"></div>
            </div>
        </div>
    `;

    contentArea.style.display = 'block';
}

/**
 * Select an answer
 */
function selectA1Answer(questionIndex, optionIndex) {
    const story = germanA1Stories[a1CurrentDifficulty][a1CurrentStory];
    const question = story.questions[questionIndex];

    // Remove previous selection
    for (let i = 0; i < question.options.length; i++) {
        const btn = document.getElementById(`a1-answer-${questionIndex}-${i}`);
        if (btn) {
            btn.style.background = 'white';
            btn.style.color = '#333';
            btn.style.borderColor = '#ddd';
        }
    }

    // Mark current selection
    const selectedBtn = document.getElementById(`a1-answer-${questionIndex}-${optionIndex}`);
    if (selectedBtn) {
        selectedBtn.style.background = '#667eea';
        selectedBtn.style.color = 'white';
        selectedBtn.style.borderColor = '#667eea';
    }

    // Store answer
    a1UserAnswers[questionIndex] = optionIndex;
}

/**
 * Check all answers
 */
function checkA1AllAnswers() {
    const story = germanA1Stories[a1CurrentDifficulty][a1CurrentStory];
    let score = 0;
    let totalQuestions = story.questions.length;

    story.questions.forEach((question, qIndex) => {
        const userAnswer = a1UserAnswers[qIndex];
        const correctAnswer = question.correct;
        const isCorrect = userAnswer === correctAnswer;

        if (isCorrect) {
            score++;
        }

        // Update button styles
        for (let i = 0; i < question.options.length; i++) {
            const btn = document.getElementById(`a1-answer-${qIndex}-${i}`);
            if (btn) {
                if (i === correctAnswer) {
                    btn.style.background = '#4caf50';
                    btn.style.color = 'white';
                    btn.style.borderColor = '#4caf50';
                } else if (i === userAnswer && !isCorrect) {
                    btn.style.background = '#e74c3c';
                    btn.style.color = 'white';
                    btn.style.borderColor = '#e74c3c';
                }
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
            }
        }

        // Show feedback
        const feedback = document.getElementById(`a1-feedback-${qIndex}`);
        if (feedback) {
            feedback.style.display = 'block';
            if (isCorrect) {
                feedback.style.background = '#e8f5e9';
                feedback.style.color = '#4caf50';
                feedback.textContent = '✓ Richtig! (Correct!)';
            } else {
                feedback.style.background = '#ffebee';
                feedback.style.color = '#e74c3c';
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
        message = 'Perfekt! Ausgezeichnet! (Perfect! Excellent!)';
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

    const scoreDisplay = document.getElementById('a1-score-display');
    if (scoreDisplay) {
        scoreDisplay.style.display = 'block';
        scoreDisplay.style.textAlign = 'center';
        scoreDisplay.style.padding = '30px';
        scoreDisplay.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        scoreDisplay.style.color = 'white';
        scoreDisplay.style.borderRadius = '15px';
        scoreDisplay.style.margin = '30px 0';
        scoreDisplay.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 10px;">${emoji}</div>
            <div style="font-size: 1.8em; margin-bottom: 10px;">${message}</div>
            <div style="font-size: 1.3em;">
                ${score} von ${totalQuestions} richtig (${percentage}%)
            </div>
        `;
    }

    a1CurrentScore = score;
}

/**
 * Back to story list
 */
function backToA1StoryList() {
    document.getElementById('a1-story-selection').style.display = 'block';
    document.getElementById('a1-story-content').innerHTML = '';
    document.getElementById('a1-story-content').style.display = 'none';
}

/**
 * Back to difficulty selection
 */
function backToA1Difficulty() {
    document.getElementById('a1-difficulty-selection').style.display = 'block';
    document.getElementById('a1-story-selection').style.display = 'none';
}
