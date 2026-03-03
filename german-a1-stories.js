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
        },
        post_office: {
            name: 'Auf der Post (At the Post Office)',
            icon: '📮',
            story: `
                <p>Ich gehe zur Post. Ich möchte ein Paket nach Italien schicken.</p>
                <p>An der Post ist viel los. Ich nehme eine Nummer und warte.</p>
                <p>"Nummer 47, bitte!", ruft die Mitarbeiterin.</p>
                <p>Das ist meine Nummer! Ich gehe zum Schalter.</p>
                <p>"Guten Tag. Ich möchte dieses Paket schicken", sage ich.</p>
                <p>Die Mitarbeiterin wiegt das Paket. Es kostet 12 Euro.</p>
                <p>Ich bezahle und bekomme eine Quittung. Das Paket kommt in 3 Tagen an.</p>
            `,
            vocabulary: [
                { word: 'die Post', meaning: 'the post office' },
                { word: 'das Paket', meaning: 'the package' },
                { word: 'schicken', meaning: 'to send' },
                { word: 'ist los', meaning: 'is busy/happening' },
                { word: 'die Nummer', meaning: 'the number' },
                { word: 'der Schalter', meaning: 'the counter' },
                { word: 'wiegt', meaning: 'weighs' },
                { word: 'die Quittung', meaning: 'the receipt' },
                { word: 'ankommt', meaning: 'arrives' }
            ],
            questions: [
                {
                    question: 'Was möchte ich schicken? (What do I want to send?)',
                    options: ['einen Brief', 'ein Paket', 'eine Postkarte', 'Geld'],
                    correct: 1
                },
                {
                    question: 'Wohin schicke ich das Paket? (Where am I sending the package?)',
                    options: ['nach Frankreich', 'nach Spanien', 'nach Italien', 'nach Österreich'],
                    correct: 2
                },
                {
                    question: 'Wie viel kostet es? (How much does it cost?)',
                    options: ['10 Euro', '12 Euro', '15 Euro', '20 Euro'],
                    correct: 1
                }
            ]
        },
        doctor: {
            name: 'Beim Arzt (At the Doctor)',
            icon: '👨‍⚕️',
            story: `
                <p>Ich bin krank. Ich habe Kopfschmerzen und Fieber.</p>
                <p>Ich rufe beim Arzt an und bekomme heute einen Termin.</p>
                <p>Um 15 Uhr bin ich in der Praxis. Ich muss warten.</p>
                <p>Nach 20 Minuten ruft die Arzthelferin meinen Namen.</p>
                <p>Der Arzt untersucht mich. "Sie haben eine Erkältung", sagt er.</p>
                <p>Er gibt mir ein Rezept für Medikamente. "Bleiben Sie drei Tage zu Hause", sagt er.</p>
                <p>Ich gehe zur Apotheke und kaufe die Medikamente. Ich hoffe, es geht mir bald besser!</p>
            `,
            vocabulary: [
                { word: 'krank', meaning: 'sick' },
                { word: 'die Kopfschmerzen', meaning: 'the headache' },
                { word: 'das Fieber', meaning: 'the fever' },
                { word: 'die Praxis', meaning: 'the doctor\'s office' },
                { word: 'die Arzthelferin', meaning: 'the medical assistant (female)' },
                { word: 'untersucht', meaning: 'examines' },
                { word: 'die Erkältung', meaning: 'the cold' },
                { word: 'das Rezept', meaning: 'the prescription' },
                { word: 'die Apotheke', meaning: 'the pharmacy' }
            ],
            questions: [
                {
                    question: 'Was habe ich? (What do I have?)',
                    options: ['Kopfschmerzen und Fieber', 'Husten', 'Bauchschmerzen', 'nichts'],
                    correct: 0
                },
                {
                    question: 'Was sagt der Arzt? (What does the doctor say?)',
                    options: ['Sie haben Grippe', 'Sie haben eine Erkältung', 'Sie sind gesund', 'Sie brauchen eine Operation'],
                    correct: 1
                },
                {
                    question: 'Wo kaufe ich die Medikamente? (Where do I buy the medicine?)',
                    options: ['im Supermarkt', 'in der Apotheke', 'beim Arzt', 'im Krankenhaus'],
                    correct: 1
                }
            ]
        },
        restaurant: {
            name: 'Im Restaurant (At the Restaurant)',
            icon: '🍽️',
            story: `
                <p>Heute Abend gehe ich mit meiner Freundin ins Restaurant.</p>
                <p>Das Restaurant heißt "Bella Italia". Es ist ein italienisches Restaurant.</p>
                <p>Der Kellner bringt die Speisekarte. Es gibt Pizza, Pasta und Salat.</p>
                <p>Ich bestelle eine Pizza Margherita. Meine Freundin nimmt Spaghetti Carbonara.</p>
                <p>Wir trinken Wasser und Wein. Das Essen ist sehr lecker!</p>
                <p>Nach dem Essen möchten wir bezahlen. "Die Rechnung, bitte", sage ich.</p>
                <p>Die Rechnung ist 45 Euro. Wir geben 50 Euro und sagen "Stimmt so!" (Keep the change!)</p>
            `,
            vocabulary: [
                { word: 'das Restaurant', meaning: 'the restaurant' },
                { word: 'die Freundin', meaning: 'the girlfriend/female friend' },
                { word: 'die Speisekarte', meaning: 'the menu' },
                { word: 'bestelle', meaning: 'order' },
                { word: 'nimmt', meaning: 'takes/has' },
                { word: 'lecker', meaning: 'delicious' },
                { word: 'die Rechnung', meaning: 'the bill' },
                { word: 'stimmt so', meaning: 'keep the change' }
            ],
            questions: [
                {
                    question: 'Was für ein Restaurant ist es? (What kind of restaurant is it?)',
                    options: ['chinesisch', 'deutsch', 'italienisch', 'türkisch'],
                    correct: 2
                },
                {
                    question: 'Was esse ich? (What do I eat?)',
                    options: ['Spaghetti', 'Salat', 'Pizza Margherita', 'Lasagne'],
                    correct: 2
                },
                {
                    question: 'Wie viel kostet das Essen? (How much does the food cost?)',
                    options: ['40 Euro', '45 Euro', '50 Euro', '55 Euro'],
                    correct: 1
                }
            ]
        },
        weather: {
            name: 'Das Wetter (The Weather)',
            icon: '🌤️',
            story: `
                <p>Heute ist das Wetter schön. Die Sonne scheint und der Himmel ist blau.</p>
                <p>Es ist warm, ungefähr 25 Grad. Perfekt für einen Spaziergang!</p>
                <p>Ich gehe in den Park. Viele Menschen sind hier. Kinder spielen und Hunde laufen herum.</p>
                <p>Ich sitze auf einer Bank und lese ein Buch. Es ist sehr angenehm.</p>
                <p>Nach zwei Stunden wird es wolkig. Dunkle Wolken kommen.</p>
                <p>Plötzlich beginnt es zu regnen! Ich habe keinen Regenschirm.</p>
                <p>Ich laufe schnell nach Hause. Ich bin nass, aber ich bin glücklich. Frische Luft tut gut!</p>
            `,
            vocabulary: [
                { word: 'das Wetter', meaning: 'the weather' },
                { word: 'die Sonne', meaning: 'the sun' },
                { word: 'scheint', meaning: 'shines' },
                { word: 'der Himmel', meaning: 'the sky' },
                { word: 'der Grad', meaning: 'the degree' },
                { word: 'der Spaziergang', meaning: 'the walk' },
                { word: 'wolkig', meaning: 'cloudy' },
                { word: 'regnen', meaning: 'to rain' },
                { word: 'nass', meaning: 'wet' }
            ],
            questions: [
                {
                    question: 'Wie ist das Wetter am Anfang? (How is the weather at the beginning?)',
                    options: ['regnerisch', 'schön', 'kalt', 'windig'],
                    correct: 1
                },
                {
                    question: 'Wie warm ist es? (How warm is it?)',
                    options: ['20 Grad', '25 Grad', '30 Grad', '15 Grad'],
                    correct: 1
                },
                {
                    question: 'Was passiert später? (What happens later?)',
                    options: ['es schneit', 'es regnet', 'die Sonne scheint', 'es ist neblig'],
                    correct: 1
                }
            ]
        },
        train: {
            name: 'Mit dem Zug (By Train)',
            icon: '🚆',
            story: `
                <p>Ich fahre mit dem Zug nach Berlin. Die Fahrt dauert drei Stunden.</p>
                <p>Ich bin am Bahnhof. Zuerst kaufe ich eine Fahrkarte am Automaten.</p>
                <p>Die Fahrkarte kostet 39 Euro. Dann suche ich den richtigen Bahnsteig.</p>
                <p>Der Zug fährt von Gleis 7. Ich steige in den Zug ein und suche meinen Platz.</p>
                <p>Ich habe einen Fensterplatz. Das ist gut! Ich kann die Landschaft sehen.</p>
                <p>Im Zug lese ich und trinke Kaffee. Die Zeit vergeht schnell.</p>
                <p>Nach drei Stunden sind wir in Berlin. Ich steige aus. Berlin, ich komme!</p>
            `,
            vocabulary: [
                { word: 'der Zug', meaning: 'the train' },
                { word: 'die Fahrt', meaning: 'the journey/trip' },
                { word: 'dauert', meaning: 'lasts/takes (time)' },
                { word: 'der Bahnhof', meaning: 'the train station' },
                { word: 'die Fahrkarte', meaning: 'the ticket' },
                { word: 'der Automat', meaning: 'the machine' },
                { word: 'der Bahnsteig', meaning: 'the platform' },
                { word: 'das Gleis', meaning: 'the track' },
                { word: 'die Landschaft', meaning: 'the landscape' }
            ],
            questions: [
                {
                    question: 'Wohin fahre ich? (Where am I going?)',
                    options: ['nach München', 'nach Hamburg', 'nach Berlin', 'nach Köln'],
                    correct: 2
                },
                {
                    question: 'Wie lange dauert die Fahrt? (How long does the trip take?)',
                    options: ['zwei Stunden', 'drei Stunden', 'vier Stunden', 'fünf Stunden'],
                    correct: 1
                },
                {
                    question: 'Was für einen Platz habe ich? (What kind of seat do I have?)',
                    options: ['Gangplatz (aisle)', 'Fensterplatz (window)', 'Stehplatz (standing)', 'keinen Platz'],
                    correct: 1
                }
            ]
        },
        weekend: {
            name: 'Das Wochenende (The Weekend)',
            icon: '🎉',
            story: `
                <p>Endlich ist Wochenende! Ich freue mich sehr.</p>
                <p>Am Samstag schlafe ich lange. Ich stehe um 10 Uhr auf.</p>
                <p>Nach dem Frühstück putze ich die Wohnung. Das dauert zwei Stunden.</p>
                <p>Am Nachmittag gehe ich einkaufen. Ich brauche Obst, Gemüse und Brot.</p>
                <p>Am Abend treffe ich meine Freunde. Wir gehen ins Kino.</p>
                <p>Am Sonntag ist das Wetter schön. Ich mache einen langen Spaziergang.</p>
                <p>Das Wochenende ist zu kurz! Morgen ist wieder Montag.</p>
            `,
            vocabulary: [
                { word: 'das Wochenende', meaning: 'the weekend' },
                { word: 'endlich', meaning: 'finally' },
                { word: 'lange', meaning: 'long/late' },
                { word: 'stehe auf', meaning: 'get up' },
                { word: 'putze', meaning: 'clean' },
                { word: 'der Nachmittag', meaning: 'the afternoon' },
                { word: 'einkaufen', meaning: 'to shop' },
                { word: 'treffe', meaning: 'meet' },
                { word: 'zu kurz', meaning: 'too short' }
            ],
            questions: [
                {
                    question: 'Wann stehe ich auf? (When do I get up?)',
                    options: ['um 8 Uhr', 'um 9 Uhr', 'um 10 Uhr', 'um 11 Uhr'],
                    correct: 2
                },
                {
                    question: 'Was mache ich am Samstag Nachmittag? (What do I do on Saturday afternoon?)',
                    options: ['ich schlafe', 'ich gehe einkaufen', 'ich koche', 'ich arbeite'],
                    correct: 1
                },
                {
                    question: 'Wohin gehe ich am Samstag Abend? (Where do I go on Saturday evening?)',
                    options: ['ins Restaurant', 'ins Kino', 'nach Hause', 'ins Theater'],
                    correct: 1
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
        },
        phone_call: {
            name: 'Ein wichtiger Anruf (An Important Call)',
            icon: '📞',
            story: `
                <p>Mein Telefon klingelt. Ich nehme das Gespräch an. "Hallo, hier spricht Anna Weber."</p>
                <p>"Guten Tag, Frau Weber. Hier ist Dr. Schmidt von der Zahnarztpraxis. Ich rufe wegen Ihres Termins an."</p>
                <p>"Ja, ich habe einen Termin am Mittwoch um 10 Uhr", sage ich.</p>
                <p>"Genau. Leider muss Dr. Müller den Termin verschieben. Passt Ihnen Donnerstag um 14 Uhr?"</p>
                <p>Ich schaue in meinen Kalender. "Ja, das passt gut. Donnerstag um 14 Uhr ist in Ordnung."</p>
                <p>"Wunderbar! Vielen Dank für Ihr Verständnis, Frau Weber. Bis Donnerstag!"</p>
                <p>"Auf Wiederhören!" Ich beende das Gespräch und trage den neuen Termin in meinen Kalender ein.</p>
            `,
            vocabulary: [
                { word: 'der Anruf', meaning: 'the call' },
                { word: 'klingelt', meaning: 'rings' },
                { word: 'nehme an', meaning: 'answer/accept' },
                { word: 'die Zahnarztpraxis', meaning: 'the dental office' },
                { word: 'wegen', meaning: 'because of/regarding' },
                { word: 'verschieben', meaning: 'to postpone' },
                { word: 'passt', meaning: 'suits/fits' },
                { word: 'der Kalender', meaning: 'the calendar' },
                { word: 'das Verständnis', meaning: 'the understanding' },
                { word: 'trage ein', meaning: 'enter/write down' }
            ],
            questions: [
                {
                    question: 'Wer ruft an? (Who is calling?)',
                    options: ['eine Freundin', 'Dr. Schmidt', 'meine Mutter', 'mein Chef'],
                    correct: 1
                },
                {
                    question: 'Warum ruft sie an? (Why is she calling?)',
                    options: ['um zu fragen, wie es mir geht', 'wegen eines Termins', 'um mich einzuladen', 'um zu verkaufen'],
                    correct: 1
                },
                {
                    question: 'Wann ist der neue Termin? (When is the new appointment?)',
                    options: ['Mittwoch 10 Uhr', 'Donnerstag 14 Uhr', 'Freitag 10 Uhr', 'Montag 14 Uhr'],
                    correct: 1
                }
            ]
        },
        hobby: {
            name: 'Mein Hobby (My Hobby)',
            icon: '🎸',
            story: `
                <p>Ich habe ein tolles Hobby: Ich spiele Gitarre. Vor drei Jahren habe ich angefangen.</p>
                <p>Am Anfang war es schwierig. Meine Finger taten weh und die Akkorde klangen nicht gut.</p>
                <p>Aber ich habe nicht aufgegeben. Ich habe jeden Tag eine Stunde geübt.</p>
                <p>Jetzt kann ich viele Lieder spielen. Meine Lieblingslieder sind von den Beatles.</p>
                <p>Jeden Mittwoch habe ich Gitarrenunterricht. Mein Lehrer heißt Thomas. Er ist sehr geduldig.</p>
                <p>Manchmal spiele ich für meine Freunde. Sie sagen, dass ich gut bin. Das macht mich glücklich.</p>
                <p>Nächsten Monat möchte ich bei einem kleinen Konzert in einem Café mitspielen. Ich bin nervös, aber auch aufgeregt!</p>
            `,
            vocabulary: [
                { word: 'das Hobby', meaning: 'the hobby' },
                { word: 'die Gitarre', meaning: 'the guitar' },
                { word: 'angefangen', meaning: 'started' },
                { word: 'schwierig', meaning: 'difficult' },
                { word: 'taten weh', meaning: 'hurt' },
                { word: 'der Akkord', meaning: 'the chord' },
                { word: 'aufgegeben', meaning: 'given up' },
                { word: 'geübt', meaning: 'practiced' },
                { word: 'geduldig', meaning: 'patient' },
                { word: 'aufgeregt', meaning: 'excited' }
            ],
            questions: [
                {
                    question: 'Was ist mein Hobby? (What is my hobby?)',
                    options: ['Klavier spielen', 'Gitarre spielen', 'Singen', 'Malen'],
                    correct: 1
                },
                {
                    question: 'Wann habe ich angefangen? (When did I start?)',
                    options: ['vor einem Jahr', 'vor zwei Jahren', 'vor drei Jahren', 'vor fünf Jahren'],
                    correct: 2
                },
                {
                    question: 'Was mache ich nächsten Monat? (What am I doing next month?)',
                    options: ['Urlaub machen', 'bei einem Konzert mitspielen', 'Unterricht geben', 'eine Gitarre kaufen'],
                    correct: 1
                }
            ]
        },
        neighbors: {
            name: 'Neue Nachbarn (New Neighbors)',
            icon: '👫',
            story: `
                <p>Letzte Woche sind neue Nachbarn eingezogen. Sie wohnen in der Wohnung neben mir.</p>
                <p>Am Samstag habe ich an ihre Tür geklopft. "Guten Tag! Ich bin Paul, Ihr Nachbar", habe ich gesagt.</p>
                <p>"Hallo Paul! Ich bin Maria und das ist mein Mann, Stefan", sagte die Frau freundlich.</p>
                <p>Wir haben uns unterhalten. Maria und Stefan kommen aus Spanien. Sie arbeiten beide hier in München.</p>
                <p>Maria ist Lehrerin und Stefan ist Ingenieur. Sie haben einen kleinen Hund namens Coco.</p>
                <p>"Wenn Sie Hilfe brauchen oder Fragen haben, können Sie gerne klopfen", habe ich gesagt.</p>
                <p>"Das ist sehr nett, danke!", sagte Maria. "Möchten Sie morgen zum Kaffee vorbeikommen?"</p>
                <p>"Sehr gerne!", habe ich geantwortet. Ich freue mich über die neuen Nachbarn. Sie sind sehr sympathisch!</p>
            `,
            vocabulary: [
                { word: 'der Nachbar', meaning: 'the neighbor' },
                { word: 'eingezogen', meaning: 'moved in' },
                { word: 'geklopft', meaning: 'knocked' },
                { word: 'unterhalten', meaning: 'chatted/talked' },
                { word: 'der Ingenieur', meaning: 'the engineer' },
                { word: 'namens', meaning: 'named' },
                { word: 'klopfen', meaning: 'to knock' },
                { word: 'vorbeikommen', meaning: 'to come by/visit' },
                { word: 'sympathisch', meaning: 'likeable/nice' }
            ],
            questions: [
                {
                    question: 'Woher kommen Maria und Stefan? (Where are Maria and Stefan from?)',
                    options: ['aus Italien', 'aus Frankreich', 'aus Spanien', 'aus Portugal'],
                    correct: 2
                },
                {
                    question: 'Was ist Stefan von Beruf? (What is Stefan\'s profession?)',
                    options: ['Lehrer', 'Arzt', 'Ingenieur', 'Koch'],
                    correct: 2
                },
                {
                    question: 'Wie heißt der Hund? (What is the dog\'s name?)',
                    options: ['Luna', 'Max', 'Bella', 'Coco'],
                    correct: 3
                }
            ]
        },
        job_interview: {
            name: 'Das Vorstellungsgespräch (The Job Interview)',
            icon: '💼',
            story: `
                <p>Heute habe ich ein wichtiges Vorstellungsgespräch. Ich möchte als Verkäufer in einem Elektronikgeschäft arbeiten.</p>
                <p>Ich stehe früh auf und ziehe meinen besten Anzug an. Ich möchte einen guten Eindruck machen.</p>
                <p>Das Gespräch ist um 10 Uhr. Ich komme 10 Minuten früher an. Pünktlichkeit ist wichtig.</p>
                <p>Der Geschäftsführer, Herr Klein, begrüßt mich freundlich. "Erzählen Sie mir etwas über sich", sagt er.</p>
                <p>Ich erkläre meine Ausbildung und meine Berufserfahrung. Ich habe drei Jahre in einem anderen Geschäft gearbeitet.</p>
                <p>"Warum möchten Sie bei uns arbeiten?", fragt Herr Klein.</p>
                <p>"Ich interessiere mich sehr für Technik, und Ihr Geschäft hat einen sehr guten Ruf", antworte ich.</p>
                <p>Das Gespräch dauert 30 Minuten. Am Ende sagt Herr Klein: "Vielen Dank. Wir melden uns in einer Woche bei Ihnen."</p>
                <p>Ich bin zufrieden. Das Gespräch ist gut gelaufen. Jetzt muss ich warten und hoffen!</p>
            `,
            vocabulary: [
                { word: 'das Vorstellungsgespräch', meaning: 'the job interview' },
                { word: 'der Verkäufer', meaning: 'the salesperson' },
                { word: 'der Anzug', meaning: 'the suit' },
                { word: 'der Eindruck', meaning: 'the impression' },
                { word: 'die Pünktlichkeit', meaning: 'punctuality' },
                { word: 'der Geschäftsführer', meaning: 'the manager/director' },
                { word: 'die Ausbildung', meaning: 'the education/training' },
                { word: 'die Berufserfahrung', meaning: 'work experience' },
                { word: 'der Ruf', meaning: 'the reputation' },
                { word: 'melden uns', meaning: 'will contact (you)' }
            ],
            questions: [
                {
                    question: 'Als was möchte ich arbeiten? (What do I want to work as?)',
                    options: ['als Manager', 'als Verkäufer', 'als Techniker', 'als Buchhalter'],
                    correct: 1
                },
                {
                    question: 'Wann komme ich zum Gespräch? (When do I arrive for the interview?)',
                    options: ['pünktlich um 10 Uhr', '10 Minuten früher', '10 Minuten später', 'um 9 Uhr'],
                    correct: 1
                },
                {
                    question: 'Wann bekomme ich eine Antwort? (When will I get an answer?)',
                    options: ['heute', 'morgen', 'in einer Woche', 'in einem Monat'],
                    correct: 2
                }
            ]
        },
        sports: {
            name: 'Sport und Fitness (Sports and Fitness)',
            icon: '🏃‍♂️',
            story: `
                <p>Ich möchte fit und gesund bleiben. Deshalb habe ich mich in einem Fitness-Studio angemeldet.</p>
                <p>Das Studio ist modern und gut ausgestattet. Es gibt Laufbänder, Gewichte und viele Fitnessgeräte.</p>
                <p>Ich gehe dreimal pro Woche trainieren: Montag, Mittwoch und Freitag.</p>
                <p>Ein Personal Trainer hat mir einen Trainingsplan gemacht. Zuerst mache ich 20 Minuten Cardio.</p>
                <p>Danach trainiere ich verschiedene Muskelgruppen mit Gewichten. Das ist anstrengend, aber ich fühle mich danach gut.</p>
                <p>Am Ende mache ich immer Dehnübungen. Das ist wichtig für die Muskeln.</p>
                <p>Nach drei Monaten sehe ich schon Resultate. Ich habe mehr Energie und fühle mich stärker.</p>
                <p>Außerdem habe ich im Studio neue Freunde gefunden. Wir motivieren uns gegenseitig. Sport macht mehr Spaß zusammen!</p>
            `,
            vocabulary: [
                { word: 'fit', meaning: 'fit' },
                { word: 'gesund', meaning: 'healthy' },
                { word: 'angemeldet', meaning: 'registered/signed up' },
                { word: 'ausgestattet', meaning: 'equipped' },
                { word: 'das Laufband', meaning: 'the treadmill' },
                { word: 'die Gewichte', meaning: 'the weights' },
                { word: 'anstrengend', meaning: 'exhausting/strenuous' },
                { word: 'die Dehnübungen', meaning: 'stretching exercises' },
                { word: 'die Muskeln', meaning: 'the muscles' },
                { word: 'motivieren', meaning: 'to motivate' }
            ],
            questions: [
                {
                    question: 'Wie oft gehe ich trainieren? (How often do I train?)',
                    options: ['zweimal pro Woche', 'dreimal pro Woche', 'jeden Tag', 'einmal pro Woche'],
                    correct: 1
                },
                {
                    question: 'Was mache ich zuerst? (What do I do first?)',
                    options: ['Gewichte', 'Dehnübungen', 'Cardio', 'Yoga'],
                    correct: 2
                },
                {
                    question: 'Wann sehe ich Resultate? (When do I see results?)',
                    options: ['nach einem Monat', 'nach zwei Monaten', 'nach drei Monaten', 'nach einem Jahr'],
                    correct: 2
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
        },
        moving_countries: {
            name: 'Umzug nach Deutschland (Moving to Germany)',
            icon: '✈️',
            story: `
                <p>Vor einem Jahr bin ich nach Deutschland gezogen. Das war eine große Veränderung für mich.</p>
                <p>Am Anfang war alles neu und fremd. Die Sprache war schwierig, das Wetter war kalt, und ich kannte niemanden.</p>
                <p>Ich musste viele Dinge regeln: eine Wohnung finden, ein Bankkonto eröffnen, mich bei der Stadt anmelden.</p>
                <p>Die Bürokratie in Deutschland ist kompliziert. Man braucht immer viele Dokumente und Formulare.</p>
                <p>Aber langsam habe ich mich eingelebt. Ich habe einen Deutschkurs besucht und dort nette Leute kennengelernt.</p>
                <p>Meine Nachbarn haben mir am Anfang sehr geholfen. Sie haben mir erklärt, wie das System funktioniert.</p>
                <p>Nach sechs Monaten habe ich einen Job gefunden. Das war ein wichtiger Schritt für mich.</p>
                <p>Jetzt, nach einem Jahr, fühle ich mich zu Hause. Ich habe Freunde, eine Arbeit und spreche besser Deutsch.</p>
                <p>Natürlich vermisse ich manchmal mein Heimatland. Aber ich bin froh, dass ich den Mut hatte, hierher zu kommen.</p>
            `,
            vocabulary: [
                { word: 'gezogen', meaning: 'moved' },
                { word: 'die Veränderung', meaning: 'the change' },
                { word: 'fremd', meaning: 'foreign/strange' },
                { word: 'regeln', meaning: 'to arrange/settle' },
                { word: 'eröffnen', meaning: 'to open (account)' },
                { word: 'anmelden', meaning: 'to register' },
                { word: 'die Bürokratie', meaning: 'the bureaucracy' },
                { word: 'eingelebt', meaning: 'settled in' },
                { word: 'vermisse', meaning: 'miss' },
                { word: 'der Mut', meaning: 'the courage' }
            ],
            questions: [
                {
                    question: 'Wann bin ich nach Deutschland gezogen? (When did I move to Germany?)',
                    options: ['vor sechs Monaten', 'vor einem Jahr', 'vor zwei Jahren', 'vor drei Jahren'],
                    correct: 1
                },
                {
                    question: 'Was war am Anfang schwierig? (What was difficult at the beginning?)',
                    options: ['nur die Sprache', 'nur das Wetter', 'nur die Bürokratie', 'alles war neu und fremd'],
                    correct: 3
                },
                {
                    question: 'Wer hat mir geholfen? (Who helped me?)',
                    options: ['meine Familie', 'meine Nachbarn', 'mein Chef', 'niemand'],
                    correct: 1
                },
                {
                    question: 'Wann habe ich einen Job gefunden? (When did I find a job?)',
                    options: ['nach drei Monaten', 'nach sechs Monaten', 'nach einem Jahr', 'nach zwei Jahren'],
                    correct: 1
                }
            ]
        },
        public_transport: {
            name: 'Öffentliche Verkehrsmittel (Public Transportation)',
            icon: '🚇',
            story: `
                <p>In Deutschland benutze ich täglich öffentliche Verkehrsmittel. Das war am Anfang verwirrend.</p>
                <p>Es gibt viele verschiedene Optionen: U-Bahn, S-Bahn, Bus, Straßenbahn und Regionalzug.</p>
                <p>Jede Stadt hat ihr eigenes Tarifsystem. Man muss verstehen, welche Zonen man durchfährt.</p>
                <p>Ich habe mir eine Monatskarte gekauft. Sie kostet 85 Euro und gilt für alle Verkehrsmittel in der Stadt.</p>
                <p>Das ist praktisch und günstiger als jeden Tag ein Einzelticket zu kaufen.</p>
                <p>Am Anfang habe ich oft die falsche Linie genommen oder bin in die falsche Richtung gefahren.</p>
                <p>Einmal bin ich am Sonntag gefahren, aber die U-Bahn hatte einen anderen Fahrplan. Ich habe 30 Minuten gewartet!</p>
                <p>Jetzt habe ich eine App auf meinem Handy. Sie zeigt mir die besten Verbindungen und sagt mir, wann ich umsteigen muss.</p>
                <p>Ich finde das öffentliche Verkehrssystem in Deutschland sehr gut. Es ist pünktlich, sauber und effizient.</p>
                <p>Ich brauche kein Auto mehr. Das spart Geld und ist besser für die Umwelt!</p>
            `,
            vocabulary: [
                { word: 'öffentliche Verkehrsmittel', meaning: 'public transport' },
                { word: 'verwirrend', meaning: 'confusing' },
                { word: 'die U-Bahn', meaning: 'the subway' },
                { word: 'die S-Bahn', meaning: 'the city train' },
                { word: 'die Straßenbahn', meaning: 'the tram' },
                { word: 'das Tarifsystem', meaning: 'the fare system' },
                { word: 'durchfährt', meaning: 'travels through' },
                { word: 'die Monatskarte', meaning: 'the monthly pass' },
                { word: 'umsteigen', meaning: 'to change/transfer' },
                { word: 'die Umwelt', meaning: 'the environment' }
            ],
            questions: [
                {
                    question: 'Was benutze ich täglich? (What do I use daily?)',
                    options: ['ein Auto', 'ein Fahrrad', 'öffentliche Verkehrsmittel', 'ein Motorrad'],
                    correct: 2
                },
                {
                    question: 'Wie viel kostet die Monatskarte? (How much does the monthly pass cost?)',
                    options: ['75 Euro', '85 Euro', '95 Euro', '100 Euro'],
                    correct: 1
                },
                {
                    question: 'Was hilft mir jetzt? (What helps me now?)',
                    options: ['ein Stadtplan', 'eine App', 'ein Freund', 'ein Buch'],
                    correct: 1
                }
            ]
        },
        dating_culture: {
            name: 'Kulturelle Unterschiede (Cultural Differences)',
            icon: '🌍',
            story: `
                <p>Seit ich in Deutschland lebe, bemerke ich viele kulturelle Unterschiede zu meinem Heimatland.</p>
                <p>Die Deutschen sind sehr pünktlich. Wenn ein Treffen um 15 Uhr ist, kommen die Leute um 15 Uhr – nicht um 15:15!</p>
                <p>Am Anfang kam ich oft zu spät, weil ich das nicht gewöhnt war. Meine Kollegen waren immer schon da.</p>
                <p>Ein anderer Unterschied ist die Direktheit. Deutsche sagen ihre Meinung sehr direkt und ehrlich.</p>
                <p>In meinem Heimatland sind wir höflicher und indirekter. Wir sagen nicht sofort "nein", sondern suchen nach diplomatischen Worten.</p>
                <p>Das war für mich am Anfang ungewohnt. Ich dachte, die Leute sind unhöflich. Aber sie meinen es nicht böse!</p>
                <p>Auch beim Thema Privatsphäre gibt es Unterschiede. Deutsche brauchen mehr persönlichen Raum.</p>
                <p>Man fragt nicht sofort nach dem Gehalt oder dem Alter. Das gilt als zu persönlich.</p>
                <p>Positiv finde ich die Trennung von Arbeit und Privatleben. Nach 18 Uhr schreibt niemand E-Mails über die Arbeit.</p>
                <p>Jetzt verstehe ich die deutsche Kultur besser. Es ist nicht besser oder schlechter – nur anders!</p>
            `,
            vocabulary: [
                { word: 'bemerke', meaning: 'notice' },
                { word: 'der Unterschied', meaning: 'the difference' },
                { word: 'das Heimatland', meaning: 'the home country' },
                { word: 'pünktlich', meaning: 'punctual' },
                { word: 'gewöhnt', meaning: 'used to/accustomed' },
                { word: 'die Direktheit', meaning: 'the directness' },
                { word: 'ehrlich', meaning: 'honest' },
                { word: 'unhöflich', meaning: 'impolite' },
                { word: 'die Privatsphäre', meaning: 'the privacy' },
                { word: 'das Gehalt', meaning: 'the salary' }
            ],
            questions: [
                {
                    question: 'Was ist typisch deutsch? (What is typically German?)',
                    options: ['zu spät kommen', 'sehr pünktlich sein', 'unpünktlich sein', 'Zeit vergessen'],
                    correct: 1
                },
                {
                    question: 'Wie sprechen Deutsche? (How do Germans speak?)',
                    options: ['sehr höflich', 'sehr indirekt', 'sehr direkt', 'sehr leise'],
                    correct: 2
                },
                {
                    question: 'Was gilt als zu persönlich? (What is considered too personal?)',
                    options: ['nach dem Namen fragen', 'nach dem Beruf fragen', 'nach dem Gehalt fragen', 'nach dem Wohnort fragen'],
                    correct: 2
                }
            ]
        },
        smartphone: {
            name: 'Das neue Smartphone (The New Smartphone)',
            icon: '📱',
            story: `
                <p>Mein altes Handy ist kaputt gegangen. Der Bildschirm war gebrochen und der Akku hielt nicht mehr lange.</p>
                <p>Ich musste ein neues kaufen. Aber welches? Es gibt so viele Modelle und Marken!</p>
                <p>Ich bin in mehrere Elektronikgeschäfte gegangen und habe mich beraten lassen.</p>
                <p>Ein Verkäufer hat mir verschiedene Optionen gezeigt. Samsung, Apple, Huawei – jedes hatte Vor- und Nachteile.</p>
                <p>Das Problem war der Preis. Die neuesten Modelle kosten über 1000 Euro! Das ist zu teuer für mich.</p>
                <p>Dann hat mir der Verkäufer ein Modell aus dem letzten Jahr gezeigt. Es kostet nur 400 Euro und hat fast die gleichen Funktionen.</p>
                <p>Ich habe nicht sofort gekauft. Ich bin nach Hause gegangen und habe im Internet Bewertungen gelesen.</p>
                <p>Die meisten Kunden waren zufrieden mit diesem Modell. Die Kamera ist gut, der Akku hält lange und es ist schnell genug.</p>
                <p>Am nächsten Tag bin ich zurück ins Geschäft gegangen und habe es gekauft. Der Verkäufer hat mir auch eine Schutzhülle empfohlen.</p>
                <p>Zu Hause habe ich das neue Handy eingerichtet: Apps installiert, Kontakte übertragen, Einstellungen angepasst.</p>
                <p>Jetzt bin ich sehr zufrieden mit meiner Entscheidung. Man muss nicht immer das neueste Modell kaufen!</p>
            `,
            vocabulary: [
                { word: 'kaputt', meaning: 'broken' },
                { word: 'der Bildschirm', meaning: 'the screen' },
                { word: 'der Akku', meaning: 'the battery' },
                { word: 'beraten lassen', meaning: 'get advice' },
                { word: 'der Vorteil', meaning: 'the advantage' },
                { word: 'der Nachteil', meaning: 'the disadvantage' },
                { word: 'die Funktion', meaning: 'the function/feature' },
                { word: 'die Bewertung', meaning: 'the review' },
                { word: 'die Schutzhülle', meaning: 'the protective case' },
                { word: 'eingerichtet', meaning: 'set up' }
            ],
            questions: [
                {
                    question: 'Warum brauche ich ein neues Handy? (Why do I need a new phone?)',
                    options: ['es ist alt', 'es ist kaputt', 'ich will ein besseres', 'ich habe es verloren'],
                    correct: 1
                },
                {
                    question: 'Wie teuer sind die neuesten Modelle? (How expensive are the newest models?)',
                    options: ['über 500 Euro', 'über 1000 Euro', 'über 2000 Euro', 'über 3000 Euro'],
                    correct: 1
                },
                {
                    question: 'Was mache ich vor dem Kauf? (What do I do before buying?)',
                    options: ['nichts', 'ich lese Bewertungen im Internet', 'ich frage meine Eltern', 'ich kaufe sofort'],
                    correct: 1
                }
            ]
        },
        recycling: {
            name: 'Mülltrennung in Deutschland (Waste Separation in Germany)',
            icon: '♻️',
            story: `
                <p>Eine Sache, die mich in Deutschland überrascht hat, ist die Mülltrennung. Das System ist sehr kompliziert!</p>
                <p>In meinem Heimatland gab es nur eine Mülltonne. Hier gibt es mindestens vier verschiedene Tonnen!</p>
                <p>Die gelbe Tonne ist für Verpackungen aus Plastik und Metall. Zum Beispiel Joghurtbecher oder Konservendosen.</p>
                <p>Die blaue Tonne ist für Papier und Karton. Zeitungen, Kartons und Briefumschläge kommen hier rein.</p>
                <p>Die braune Tonne ist für Biomüll. Das sind Essensreste, Obst- und Gemüsereste, Kaffeefilter und so weiter.</p>
                <p>Die schwarze Tonne ist für Restmüll – alles, was nicht in die anderen Tonnen passt.</p>
                <p>Aber das ist noch nicht alles! Glasflaschen muss man zu Glascontainern bringen. Und man muss sie nach Farben trennen!</p>
                <p>Pfandflaschen bringt man zurück zum Supermarkt. Man bekommt 25 Cent pro Flasche zurück.</p>
                <p>Am Anfang war ich völlig verwirrt. Ich habe oft Fehler gemacht und Sachen in die falsche Tonne geworfen.</p>
                <p>Meine Nachbarin hat es bemerkt und mir alles geduldig erklärt. Sie hat mir sogar eine Liste mit Beispielen gegeben.</p>
                <p>Jetzt verstehe ich das System besser. Es macht Sinn – Deutschland recycelt über 60% des Mülls!</p>
                <p>Am Anfang fand ich es lästig, aber jetzt ist es zur Gewohnheit geworden. Und es ist gut für die Umwelt!</p>
            `,
            vocabulary: [
                { word: 'die Mülltrennung', meaning: 'waste separation' },
                { word: 'überrascht', meaning: 'surprised' },
                { word: 'die Mülltonne', meaning: 'the trash bin' },
                { word: 'die Verpackung', meaning: 'the packaging' },
                { word: 'die Konservendose', meaning: 'the tin can' },
                { word: 'der Karton', meaning: 'the cardboard' },
                { word: 'der Biomüll', meaning: 'organic waste' },
                { word: 'der Restmüll', meaning: 'residual waste' },
                { word: 'das Pfand', meaning: 'the deposit' },
                { word: 'lästig', meaning: 'annoying' },
                { word: 'die Gewohnheit', meaning: 'the habit' }
            ],
            questions: [
                {
                    question: 'Wie viele Tonnen gibt es mindestens? (How many bins are there at least?)',
                    options: ['zwei', 'drei', 'vier', 'fünf'],
                    correct: 2
                },
                {
                    question: 'Was kommt in die gelbe Tonne? (What goes in the yellow bin?)',
                    options: ['Papier', 'Biomüll', 'Plastik und Metall', 'Glas'],
                    correct: 2
                },
                {
                    question: 'Wie viel bekommt man für eine Pfandflasche? (How much do you get for a deposit bottle?)',
                    options: ['10 Cent', '25 Cent', '50 Cent', '1 Euro'],
                    correct: 1
                },
                {
                    question: 'Wie viel Müll recycelt Deutschland? (How much waste does Germany recycle?)',
                    options: ['über 40%', 'über 50%', 'über 60%', 'über 70%'],
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
        easy: 'Einfache Geschichten (Easy Stories)',
        medium: 'Mittlere Geschichten (Medium Stories)',
        hard: 'Schwere Geschichten (Hard Stories)'
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
                <span style="font-weight: bold; color: var(--color-primary);">${item.word}</span> = ${item.meaning}
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
            <div style="background: white; border: 2px solid var(--color-primary-dark); border-radius: 10px; padding: 20px; margin: 15px 0;" id="a1-question-${qIndex}">
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
        <div class="back-row">
            <button class="back-btn-icon" onclick="backToA1StoryList()" title="Back to Story List"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg></button>
        </div>

        <div style="background: white; border: 3px solid var(--color-primary); border-radius: 15px; padding: 40px; margin: 30px 0;">
            <h2 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">${story.icon} ${story.name}</h2>

            <div style="background: #e8f5e9; border-left: 5px solid var(--color-success); padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="color: var(--color-success); margin-top: 0;">📖 Wichtige Wörter (Important Words)</h3>
                ${vocabularyHTML}
            </div>

            <div style="font-size: 1.2em; line-height: 1.8; padding: 30px; background: #f8f9fa; border-radius: 10px; margin: 30px 0;">
                ${story.story}
            </div>

            <div style="margin-top: 50px;">
                <h2 style="text-align: center; color: var(--color-primary-dark); margin-bottom: 30px;">
                    ❓ Verständnisfragen (Comprehension Questions)
                </h2>
                ${questionsHTML}

                <div style="text-align: center; margin-top: 40px;">
                    <button onclick="checkA1AllAnswers()" style="
                        padding: 18px 45px;
                        font-size: 1.2em;
                        border: none;
                        background: var(--color-primary-gradient);
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
        selectedBtn.style.background = 'var(--color-primary)';
        selectedBtn.style.color = 'white';
        selectedBtn.style.borderColor = 'var(--color-primary)';
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
                    btn.style.background = 'var(--color-success)';
                    btn.style.color = 'white';
                    btn.style.borderColor = 'var(--color-success)';
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
                feedback.style.color = 'var(--color-success)';
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
        scoreDisplay.style.background = 'var(--color-primary-gradient)';
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
