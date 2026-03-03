/**
 * Shared German Engine - Used by both client and Cloud Functions
 *
 * Provides server-side German B1 and German Kids question generation
 * and validation. Uses seeded PRNG for deterministic shuffling so
 * the server can regenerate the same questions for answer validation.
 *
 * German B1: articles, cases, verbs, prepositions, adjectives, vocabulary,
 *            modal verbs, separable verbs, reflexive verbs, conjunctions,
 *            word order, comparative, pronouns, relative clauses,
 *            konjunktiv II, passive voice
 *
 * German Kids: age-based stories (ages 6-8) with comprehension questions
 *              at easy/medium/hard difficulty levels.
 *
 * Usage (Cloud Functions):
 *   const { getGermanQuestions, validateGermanSubmission } = require('./shared/german-engine');
 *   const questions = getGermanQuestions('articles', 42);
 *   const result = validateGermanSubmission('articles', 42, userAnswers);
 *
 *   const { getGermanKidsQuestions, validateGermanKidsSubmission } = require('./shared/german-engine');
 *   const story = getGermanKidsQuestions('6', 'easy', 0);
 *   const result = validateGermanKidsSubmission('6', 'easy', 0, userAnswers);
 */

// ============================================================================
// SEEDED PRNG - Deterministic random number generator
// ============================================================================

class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Deterministic shuffle using seeded PRNG (Fisher-Yates).
 * Returns a new array; does not mutate the input.
 */
function seededShuffle(array, rng) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ============================================================================
// LEVENSHTEIN DISTANCE - For partial credit scoring
// ============================================================================

function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,       // insertion
                    matrix[i - 1][j] + 1         // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

// ============================================================================
// GERMAN B1 CONTENT BANK
// ============================================================================

const germanContent = {
    articles: [
        { word: 'Buch', article: 'das', translation: 'book' },
        { word: 'Mann', article: 'der', translation: 'man' },
        { word: 'Frau', article: 'die', translation: 'woman' },
        { word: 'Kind', article: 'das', translation: 'child' },
        { word: 'Haus', article: 'das', translation: 'house' },
        { word: 'Auto', article: 'das', translation: 'car' },
        { word: 'Tisch', article: 'der', translation: 'table' },
        { word: 'Schule', article: 'die', translation: 'school' },
        { word: 'Computer', article: 'der', translation: 'computer' },
        { word: 'Wohnung', article: 'die', translation: 'apartment' },
        { word: 'Apfel', article: 'der', translation: 'apple' },
        { word: 'Tür', article: 'die', translation: 'door' },
        { word: 'Fenster', article: 'das', translation: 'window' },
        { word: 'Baum', article: 'der', translation: 'tree' },
        { word: 'Blume', article: 'die', translation: 'flower' }
    ],

    caseSentences: [
        { sentence: '___ Mann arbeitet im Büro.', answer: 'Der', case: 'Nominativ' },
        { sentence: 'Ich sehe ___ Frau.', answer: 'die', case: 'Akkusativ' },
        { sentence: 'Das Buch gehört ___ Kind.', answer: 'dem', case: 'Dativ' },
        { sentence: '___ Auto ist neu.', answer: 'Das', case: 'Nominativ' },
        { sentence: 'Sie kauft ___ Buch.', answer: 'ein', case: 'Akkusativ' },
        { sentence: 'Er gibt ___ Mann das Buch.', answer: 'dem', case: 'Dativ' },
        { sentence: 'Ich helfe ___ Frau.', answer: 'der', case: 'Dativ' },
        { sentence: '___ Kinder spielen im Park.', answer: 'Die', case: 'Nominativ' },
        { sentence: 'Wir besuchen ___ Großeltern.', answer: 'die', case: 'Akkusativ' },
        { sentence: 'Das Geschenk ist für ___ Mutter.', answer: 'die', case: 'Akkusativ' }
    ],

    verbExercises: [
        { prompt: 'ich ___ (gehen)', answer: 'gehe', tense: 'Präsens' },
        { prompt: 'du ___ (haben)', answer: 'hast', tense: 'Präsens' },
        { prompt: 'er ___ (sein)', answer: 'ist', tense: 'Präsens' },
        { prompt: 'wir ___ (machen)', answer: 'machen', tense: 'Präsens' },
        { prompt: 'ich ___ (kaufen - Perfekt)', answer: 'habe gekauft', tense: 'Perfekt' },
        { prompt: 'sie ___ (kommen - Perfekt)', answer: 'ist gekommen', tense: 'Perfekt' },
        { prompt: 'er ___ (arbeiten - Präteritum)', answer: 'arbeitete', tense: 'Präteritum' },
        { prompt: 'wir ___ (fahren - Perfekt)', answer: 'sind gefahren', tense: 'Perfekt' },
        { prompt: 'du ___ (sprechen)', answer: 'sprichst', tense: 'Präsens' },
        { prompt: 'Sie ___ (können)', answer: 'können', tense: 'Präsens' }
    ],

    prepositionExercises: [
        { sentence: 'Ich gehe ___ Schule.', answer: 'zur', prep: 'zu + der' },
        { sentence: 'Er kommt ___ Deutschland.', answer: 'aus', prep: 'aus' },
        { sentence: 'Wir fahren ___ Berlin.', answer: 'nach', prep: 'nach' },
        { sentence: 'Das Geschenk ist ___ meine Mutter.', answer: 'für', prep: 'für' },
        { sentence: 'Ich wohne ___ meinen Eltern.', answer: 'bei', prep: 'bei' },
        { sentence: 'Sie arbeitet ___ einer Firma.', answer: 'in', prep: 'in' },
        { sentence: 'Der Tisch steht ___ dem Fenster.', answer: 'vor', prep: 'vor' },
        { sentence: 'Ich fahre ___ dem Bus.', answer: 'mit', prep: 'mit' },
        { sentence: 'Das Bild hängt ___ der Wand.', answer: 'an', prep: 'an' },
        { sentence: 'Wir treffen uns ___ 18 Uhr.', answer: 'um', prep: 'um' }
    ],

    adjectiveExercises: [
        { sentence: 'Das ist ein ___ Haus. (schön)', answer: 'schönes', type: 'Neutrum' },
        { sentence: 'Ich habe einen ___ Freund. (gut)', answer: 'guten', type: 'Maskulinum Akk.' },
        { sentence: 'Die ___ Frau wohnt hier. (alt)', answer: 'alte', type: 'Femininum' },
        { sentence: 'Das ___ Auto ist teuer. (neu)', answer: 'neue', type: 'Neutrum' },
        { sentence: 'Ein ___ Mann wartet. (jung)', answer: 'junger', type: 'Maskulinum' },
        { sentence: 'Ich kaufe eine ___ Tasche. (schwarz)', answer: 'schwarze', type: 'Femininum Akk.' },
        { sentence: 'Die ___ Kinder spielen. (klein)', answer: 'kleinen', type: 'Plural' },
        { sentence: 'Er hat ein ___ Zimmer. (groß)', answer: 'großes', type: 'Neutrum Akk.' }
    ],

    vocabularyPairs: [
        { german: 'die Arbeit', english: 'work/job' },
        { german: 'der Termin', english: 'appointment' },
        { german: 'die Bewerbung', english: 'application' },
        { german: 'das Formular', english: 'form' },
        { german: 'die Anmeldung', english: 'registration' },
        { german: 'der Vertrag', english: 'contract' },
        { german: 'die Miete', english: 'rent' },
        { german: 'der Nachbar', english: 'neighbor' },
        { german: 'die Versicherung', english: 'insurance' },
        { german: 'das Amt', english: 'office/authority' },
        { german: 'die Rechnung', english: 'bill/invoice' },
        { german: 'das Konto', english: 'account' },
        { german: 'die Überweisung', english: 'bank transfer' },
        { german: 'der Lebenslauf', english: 'CV/resume' },
        { german: 'die Stelle', english: 'position/job' }
    ],

    modalVerbExercises: [
        { prompt: 'Ich ___ Deutsch sprechen. (I can speak German)', answer: 'kann', hint: 'können = can, to be able to' },
        { prompt: 'Du ___ deine Hausaufgaben machen. (You must do your homework)', answer: 'musst', hint: 'müssen = must, to have to' },
        { prompt: 'Er ___ heute nicht arbeiten. (He doesn\'t have to work today)', answer: 'muss nicht', hint: 'nicht müssen = don\'t have to' },
        { prompt: 'Wir ___ ins Kino gehen. (We want to go to the cinema)', answer: 'wollen', hint: 'wollen = to want to' },
        { prompt: 'Sie ___ hier nicht rauchen. (You/They may not smoke here)', answer: 'dürfen nicht', hint: 'nicht dürfen = may not, not allowed to' },
        { prompt: 'Ihr ___ morgen früh aufstehen. (You should get up early tomorrow)', answer: 'sollt', hint: 'sollen = should, supposed to' },
        { prompt: 'Ich ___ Kaffee lieber als Tee. (I prefer coffee to tea)', answer: 'mag', hint: 'mögen = to like, to prefer' },
        { prompt: 'Du ___ das alleine machen? (You can do that alone?)', answer: 'kannst', hint: 'können = can, to be able to' },
        { prompt: 'Man ___ hier parken. (One is allowed to park here)', answer: 'darf', hint: 'dürfen = may, to be allowed to' },
        { prompt: 'Sie ___ zum Arzt gehen, sie ist krank. (She must go to the doctor, she is sick)', answer: 'muss', hint: 'müssen = must' }
    ],

    separableVerbExercises: [
        { prompt: 'Ich stehe jeden Tag um 7 Uhr ___. (I get up every day at 7)', answer: 'auf', hint: 'aufstehen = to get up (separable)' },
        { prompt: 'Kommst du heute Abend ___? (Are you coming along this evening?)', answer: 'mit', hint: 'mitkommen = to come along' },
        { prompt: 'Er ruft seine Mutter jeden Tag ___. (He calls his mother every day)', answer: 'an', hint: 'anrufen = to call (on the phone)' },
        { prompt: 'Wir kaufen im Supermarkt ___. (We shop at the supermarket)', answer: 'ein', hint: 'einkaufen = to shop' },
        { prompt: 'Sie macht das Fenster ___. (She opens the window)', answer: 'auf', hint: 'aufmachen = to open' },
        { prompt: 'Der Zug fährt um 10 Uhr ___. (The train departs at 10)', answer: 'ab', hint: 'abfahren = to depart' },
        { prompt: 'Bitte schalten Sie Ihr Handy ___! (Please turn off your mobile phone!)', answer: 'aus', hint: 'ausschalten = to turn off' },
        { prompt: 'Ich lade dich zur Party ___. (I invite you to the party)', answer: 'ein', hint: 'einladen = to invite' },
        { prompt: 'Er zieht nächste Woche ___. (He\'s moving next week)', answer: 'um', hint: 'umziehen = to move (house)' },
        { prompt: 'Wann kommst du ___? (When are you coming back?)', answer: 'zurück', hint: 'zurückkommen = to come back' }
    ],

    reflexiveVerbExercises: [
        { prompt: 'Ich freue ___ auf das Wochenende. (I\'m looking forward to the weekend)', answer: 'mich', hint: 'sich freuen = to be happy, to look forward' },
        { prompt: 'Er interessiert ___ für Musik. (He is interested in music)', answer: 'sich', hint: 'sich interessieren = to be interested' },
        { prompt: 'Wir treffen ___ morgen. (We\'re meeting tomorrow)', answer: 'uns', hint: 'sich treffen = to meet' },
        { prompt: 'Du musst ___ beeilen! (You have to hurry!)', answer: 'dich', hint: 'sich beeilen = to hurry' },
        { prompt: 'Sie wäscht ___ die Hände. (She washes her hands)', answer: 'sich', hint: 'sich waschen = to wash oneself' },
        { prompt: 'Ich kann ___ nicht erinnern. (I can\'t remember)', answer: 'mich', hint: 'sich erinnern = to remember' },
        { prompt: 'Ihr müsst ___ entscheiden! (You have to decide!)', answer: 'euch', hint: 'sich entscheiden = to decide' },
        { prompt: 'Er setzt ___ auf den Stuhl. (He sits down on the chair)', answer: 'sich', hint: 'sich setzen = to sit down' },
        { prompt: 'Ich ziehe ___ schnell an. (I get dressed quickly)', answer: 'mich', hint: 'sich anziehen = to get dressed' },
        { prompt: 'Sie erholt ___ im Urlaub. (She recovers during vacation)', answer: 'sich', hint: 'sich erholen = to recover, to relax' }
    ],

    conjunctionExercises: [
        { prompt: 'Ich bleibe zu Hause, ___ es regnet. (I\'m staying home because it\'s raining)', answer: 'weil', hint: 'weil = because (verb goes to end)' },
        { prompt: 'Er sagt, ___ er morgen kommt. (He says that he\'s coming tomorrow)', answer: 'dass', hint: 'dass = that (verb goes to end)' },
        { prompt: '___ ich Zeit habe, gehe ich schwimmen. (When/If I have time, I go swimming)', answer: 'Wenn', hint: 'wenn = when, if (verb goes to end)' },
        { prompt: 'Sie geht zur Arbeit, ___ sie krank ist. (She goes to work although she is sick)', answer: 'obwohl', hint: 'obwohl = although (verb goes to end)' },
        { prompt: 'Ich weiß nicht, ___ er recht hat. (I don\'t know if he\'s right)', answer: 'ob', hint: 'ob = if, whether (verb goes to end)' },
        { prompt: 'Sie lernt Deutsch, ___ sie in Deutschland arbeiten möchte. (She\'s learning German because she wants to work in Germany)', answer: 'weil', hint: 'weil = because' },
        { prompt: '___ es kalt ist, ziehe ich eine Jacke an. (Since it\'s cold, I\'m putting on a jacket)', answer: 'Da', hint: 'da = since, because' },
        { prompt: 'Ich denke, ___ er heute kommt. (I think that he\'s coming today)', answer: 'dass', hint: 'dass = that' },
        { prompt: 'Er läuft schnell, ___ er den Bus nicht verpasst. (He runs fast so that he doesn\'t miss the bus)', answer: 'damit', hint: 'damit = so that (purpose)' },
        { prompt: 'Sie ist müde, ___ sie gut gearbeitet hat. (She is tired although she worked well)', answer: 'obwohl', hint: 'obwohl = although' }
    ],

    wordOrderExercises: [
        { prompt: 'After \'weil\': Ich bleibe zu Hause, weil ich / krank / bin', answer: 'weil ich krank bin.', hint: 'After weil, verb goes to the end' },
        { prompt: 'After \'dass\': Er sagt, dass er / morgen / kommt', answer: 'dass er morgen kommt.', hint: 'After dass, verb goes to the end' },
        { prompt: 'Perfect tense: Ich / gestern / gegangen / bin / ins Kino', answer: 'Ich bin gestern ins Kino gegangen.', hint: 'Participle goes to the end' },
        { prompt: 'Modal verb: Du / heute / arbeiten / musst', answer: 'Du musst heute arbeiten.', hint: 'Infinitive goes to the end with modal verbs' },
        { prompt: 'Question: Wann / du / kommst?', answer: 'Wann kommst du?', hint: 'In W-questions, verb comes second' },
        { prompt: 'Separable verb: Ich / auf / stehe / früh', answer: 'Ich stehe früh auf.', hint: 'Prefix goes to the end' },
        { prompt: 'With \'wenn\': Wenn ich Zeit habe, / ich / gehe / schwimmen', answer: 'gehe ich schwimmen.', hint: 'After subordinate clause, main verb comes first' },
        { prompt: 'Time-Manner-Place: Er / mit dem Auto / heute / zur Arbeit / fährt', answer: 'Er fährt heute mit dem Auto zur Arbeit.', hint: 'Time - Manner - Place order' },
        { prompt: 'Negation: Ich / nicht / heute / komme', answer: 'Ich komme heute nicht.', hint: 'nicht goes before the verb or at the end' }
    ],

    comparativeExercises: [
        { prompt: 'klein -> kleiner -> ___? (small - smaller - smallest)', answer: 'am kleinsten', hint: 'klein - kleiner - am kleinsten' },
        { prompt: 'gut -> ___ -> am besten (good - better - best)', answer: 'besser', hint: 'gut - besser - am besten (irregular)' },
        { prompt: 'viel -> ___ -> am meisten (much - more - most)', answer: 'mehr', hint: 'viel - mehr - am meisten (irregular)' },
        { prompt: 'Das Auto ist ___ als das Fahrrad. (The car is faster than the bike)', answer: 'schneller', hint: 'Comparative with \'als\' = than' },
        { prompt: 'Sie ist ___ Studentin in der Klasse. (She is the best student in the class)', answer: 'die beste', hint: 'Superlative with article uses -st- + ending' },
        { prompt: 'Im Winter ist es ___ als im Sommer. (In winter it\'s colder than in summer)', answer: 'kälter', hint: 'kalt - kälter - am kältesten (umlaut!)' },
        { prompt: 'Er läuft ___ als sein Bruder. (He runs faster than his brother)', answer: 'schneller', hint: 'Comparative + als' },
        { prompt: 'Das ist der ___ Berg der Welt. (That\'s the highest mountain in the world)', answer: 'höchste', hint: 'Superlative with article' },
        { prompt: 'Sie singt ___ von allen. (She sings the best of all)', answer: 'am besten', hint: 'Superlative without article uses \'am\'' },
        { prompt: 'gern -> ___ -> am liebsten (like - prefer - like most)', answer: 'lieber', hint: 'gern - lieber - am liebsten (irregular)' }
    ],

    pronounExercises: [
        { prompt: 'Das ist ___ Buch. (my book)', answer: 'mein', hint: 'mein (masculine/neuter nominative)' },
        { prompt: 'Ich sehe ___. (I see you - informal singular)', answer: 'dich', hint: 'dich = you (accusative, informal singular)' },
        { prompt: 'Er gibt ___ das Buch. (He gives me the book)', answer: 'mir', hint: 'mir = to me (dative)' },
        { prompt: 'Das ist ___ Tasche. (her bag)', answer: 'ihre', hint: 'ihre (feminine nominative)' },
        { prompt: 'Wir helfen ___. (We help them)', answer: 'ihnen', hint: 'ihnen = to them (dative)' },
        { prompt: 'Ich wasche ___ die Hände. (I wash my hands)', answer: 'mir', hint: 'mir (dative reflexive)' },
        { prompt: 'Kennst du ___? (Do you know him?)', answer: 'ihn', hint: 'ihn = him (accusative)' },
        { prompt: '___ Name ist Maria. (Her name is Maria)', answer: 'Ihr', hint: 'Ihr (formal \'your\', capitalized)' },
        { prompt: 'Das Auto gehört ___. (The car belongs to us)', answer: 'uns', hint: 'uns = to us (dative)' },
        { prompt: 'Ist das ___ Auto? (Is that your car? - informal plural)', answer: 'euer', hint: 'euer (masculine/neuter nominative)' }
    ],

    relativeClauseExercises: [
        { prompt: 'Der Mann, ___ dort steht, ist mein Lehrer. (The man who stands there is my teacher)', answer: 'der', hint: 'der (masculine nominative relative pronoun)' },
        { prompt: 'Die Frau, ___ ich gestern getroffen habe. (The woman whom I met yesterday)', answer: 'die', hint: 'die (feminine accusative relative pronoun)' },
        { prompt: 'Das Buch, ___ auf dem Tisch liegt. (The book that lies on the table)', answer: 'das', hint: 'das (neuter nominative relative pronoun)' },
        { prompt: 'Der Mann, ___ ich geholfen habe. (The man whom I helped)', answer: 'dem', hint: 'dem (masculine dative - helfen needs dative)' },
        { prompt: 'Die Kinder, ___ im Park spielen. (The children who play in the park)', answer: 'die', hint: 'die (plural nominative relative pronoun)' },
        { prompt: 'Das Auto, ___ ich gekauft habe. (The car that I bought)', answer: 'das', hint: 'das (neuter accusative relative pronoun)' },
        { prompt: 'Die Stadt, in ___ ich wohne. (The city in which I live)', answer: 'der', hint: 'der (feminine dative after \'in\')' },
        { prompt: 'Der Film, ___ wir gesehen haben. (The film that we saw)', answer: 'den', hint: 'den (masculine accusative relative pronoun)' },
        { prompt: 'Die Leute, mit ___ ich arbeite. (The people with whom I work)', answer: 'denen', hint: 'denen (plural dative after \'mit\')' },
        { prompt: 'Das Haus, ___ Garten sehr schön ist. (The house whose garden is very beautiful)', answer: 'dessen', hint: 'dessen (genitive relative pronoun - whose)' }
    ],

    konjunktivExercises: [
        { prompt: 'Ich ___ gerne nach Berlin fahren. (I would like to go to Berlin)', answer: 'würde', hint: 'würde + infinitive (Konjunktiv II of werden)' },
        { prompt: 'Wenn ich Zeit ___, würde ich kommen. (If I had time, I would come)', answer: 'hätte', hint: 'hätte (Konjunktiv II of haben)' },
        { prompt: 'Er ___ das machen können. (He could do that)', answer: 'könnte', hint: 'könnte (Konjunktiv II of können)' },
        { prompt: 'Wenn ich reich ___, würde ich viel reisen. (If I were rich, I would travel a lot)', answer: 'wäre', hint: 'wäre (Konjunktiv II of sein)' },
        { prompt: 'Du ___ das besser machen. (You should do that better)', answer: 'solltest', hint: 'solltest (Konjunktiv II of sollen)' },
        { prompt: 'Ich ___ gerne einen Kaffee. (I would like a coffee)', answer: 'hätte', hint: 'hätte gern = would like' },
        { prompt: '___ Sie mir bitte helfen? (Would you please help me?)', answer: 'Könnten', hint: 'Könnten (polite request)' },
        { prompt: 'Er ___ heute nicht kommen müssen. (He wouldn\'t have to come today)', answer: 'müsste', hint: 'müsste (Konjunktiv II of müssen)' },
        { prompt: 'Wenn es nicht regnen ___, gingen wir spazieren. (If it weren\'t raining, we would go for a walk)', answer: 'würde', hint: 'würde (Konjunktiv II)' },
        { prompt: 'An deiner Stelle ___ ich das nicht tun. (In your place, I wouldn\'t do that)', answer: 'würde', hint: 'würde (giving advice)' }
    ],

    passiveExercises: [
        { prompt: 'Das Haus ___ gebaut. (The house is being built)', answer: 'wird', hint: 'wird + Partizip II = passive present' },
        { prompt: 'Der Brief ___ gestern geschrieben. (The letter was written yesterday)', answer: 'wurde', hint: 'wurde + Partizip II = passive past' },
        { prompt: 'Das Auto ___ repariert worden. (The car has been repaired)', answer: 'ist', hint: 'ist + Partizip II + worden = passive perfect' },
        { prompt: 'Die Tür ___ von ihm geöffnet. (The door is opened by him)', answer: 'wird', hint: 'von + dative = by (agent in passive)' },
        { prompt: 'Hier ___ nicht geraucht! (Smoking is not allowed here!)', answer: 'wird', hint: 'Passive as command/rule' },
        { prompt: 'Das Problem ___ gelöst werden. (The problem must be solved)', answer: 'muss', hint: 'Modal verb + Partizip II + werden' },
        { prompt: 'Der Film ___ im Kino gezeigt. (The film is shown in the cinema)', answer: 'wird', hint: 'wird + Partizip II' },
        { prompt: 'Die Hausaufgaben ___ von den Schülern gemacht. (The homework is done by the students)', answer: 'werden', hint: 'werden (plural) + Partizip II' },
        { prompt: 'Wann ___ das Haus gebaut? (When was the house built?)', answer: 'wurde', hint: 'wurde = passive past' },
        { prompt: 'Das Buch ___ gerade gelesen. (The book is being read right now)', answer: 'wird', hint: 'wird + Partizip II' }
    ],

    readingPassages: [
        {
            title: 'Wohnungssuche (Apartment Search)',
            text: 'Maria sucht eine neue Wohnung in München. Sie braucht zwei Zimmer, eine Küche und ein Bad. Die Wohnung sollte nicht mehr als 800 Euro pro Monat kosten. Maria arbeitet in der Stadtmitte, deshalb möchte sie in der Nähe von der U-Bahn-Station wohnen. Am Wochenende hat sie drei Wohnungen besichtigt. Die erste Wohnung war zu teuer, die zweite war zu klein, aber die dritte Wohnung war perfekt!',
            questions: [
                { q: 'Wie viele Zimmer braucht Maria?', a: 'zwei' },
                { q: 'Wie viel darf die Wohnung maximal kosten?', a: '800 Euro' },
                { q: 'Wo arbeitet Maria?', a: 'in der Stadtmitte' },
                { q: 'Welche Wohnung hat Maria gefallen?', a: 'die dritte' }
            ]
        },
        {
            title: 'Beim Arzt (At the Doctor)',
            text: 'Herr Schmidt fühlt sich nicht gut. Er hat Kopfschmerzen und Fieber. Am Montag geht er zum Arzt. In der Praxis muss er zuerst seine Versichertenkarte zeigen. Dann wartet er im Wartezimmer. Nach 20 Minuten kommt er dran. Der Arzt untersucht ihn und sagt, dass er eine Grippe hat. Herr Schmidt bekommt ein Rezept für Medikamente und soll drei Tage zu Hause bleiben.',
            questions: [
                { q: 'Welche Symptome hat Herr Schmidt?', a: 'Kopfschmerzen und Fieber' },
                { q: 'Was muss er zuerst in der Praxis zeigen?', a: 'Versichertenkarte' },
                { q: 'Was ist die Diagnose?', a: 'Grippe' },
                { q: 'Wie lange soll er zu Hause bleiben?', a: 'drei Tage' }
            ]
        }
    ],

    writingPrompts: [
        {
            type: 'Informal',
            prompt: 'Schreiben Sie eine E-Mail an einen Freund/eine Freundin. Sie möchten ihn/sie zu Ihrem Geburtstag einladen.',
            points: ['Wann und wo ist die Feier?', 'Was werden Sie machen?', 'Bitten Sie um eine Antwort']
        },
        {
            type: 'Formal',
            prompt: 'Schreiben Sie einen Brief an Ihren Vermieter. In Ihrer Wohnung ist die Heizung kaputt.',
            points: ['Beschreiben Sie das Problem', 'Seit wann ist das Problem?', 'Bitten Sie um schnelle Reparatur']
        },
        {
            type: 'Informal',
            prompt: 'Schreiben Sie eine E-Mail an einen Freund. Sie können nicht zu seiner Party kommen.',
            points: ['Entschuldigen Sie sich', 'Erklären Sie warum', 'Schlagen Sie einen anderen Termin vor']
        }
    ]
};

// ============================================================================
// LEVEL CONFIGURATIONS
// ============================================================================

const levelConfigs = {
    articles:        { name: 'Artikel (Articles)',              problemCount: 15, type: 'articles' },
    cases:           { name: 'Fälle (Cases)',                   problemCount: 12, type: 'cases' },
    verbs:           { name: 'Verben (Verbs)',                  problemCount: 12, type: 'verbs' },
    prepositions:    { name: 'Präpositionen (Prepositions)',    problemCount: 12, type: 'prepositions' },
    adjectives:      { name: 'Adjektivendungen',               problemCount: 10, type: 'adjectives' },
    vocabulary:      { name: 'Wortschatz (Vocabulary)',         problemCount: 15, type: 'vocabulary' },
    modalverbs:      { name: 'Modalverben (Modal Verbs)',       problemCount: 10, type: 'modalverbs' },
    separable:       { name: 'Trennbare Verben (Separable)',    problemCount: 10, type: 'separable' },
    reflexive:       { name: 'Reflexivverben (Reflexive)',      problemCount: 10, type: 'reflexive' },
    conjunctions:    { name: 'Konjunktionen (Conjunctions)',    problemCount: 10, type: 'conjunctions' },
    wordorder:       { name: 'Wortstellung (Word Order)',       problemCount: 10, type: 'wordorder' },
    comparative:     { name: 'Komparativ & Superlativ',         problemCount: 10, type: 'comparative' },
    pronouns:        { name: 'Pronomen (Pronouns)',             problemCount: 10, type: 'pronouns' },
    relativeclauses: { name: 'Relativsätze (Relative Clauses)', problemCount: 10, type: 'relativeclauses' },
    konjunktiv:      { name: 'Konjunktiv II',                  problemCount: 10, type: 'konjunktiv' },
    passive:         { name: 'Passiv (Passive Voice)',          problemCount: 10, type: 'passive' },
    reading:         { name: 'Leseverstehen (Reading)',          problemCount: 8,  type: 'reading' },
    writing:         { name: 'Schreiben (Writing)',              problemCount: 1,  type: 'writing' }
};

// ============================================================================
// CONTENT BANK LOOKUP BY TYPE
// ============================================================================

/**
 * Returns the raw content array for a given exercise type.
 * Each item has a shape { prompt, answer, hint? } or similar.
 */
function getContentBankForType(type) {
    switch (type) {
        case 'articles':        return germanContent.articles;
        case 'cases':           return germanContent.caseSentences;
        case 'verbs':           return germanContent.verbExercises;
        case 'prepositions':    return germanContent.prepositionExercises;
        case 'adjectives':      return germanContent.adjectiveExercises;
        case 'vocabulary':      return germanContent.vocabularyPairs;
        case 'modalverbs':      return germanContent.modalVerbExercises;
        case 'separable':       return germanContent.separableVerbExercises;
        case 'reflexive':       return germanContent.reflexiveVerbExercises;
        case 'conjunctions':    return germanContent.conjunctionExercises;
        case 'wordorder':       return germanContent.wordOrderExercises;
        case 'comparative':     return germanContent.comparativeExercises;
        case 'pronouns':        return germanContent.pronounExercises;
        case 'relativeclauses': return germanContent.relativeClauseExercises;
        case 'konjunktiv':      return germanContent.konjunktivExercises;
        case 'passive':         return germanContent.passiveExercises;
        case 'reading':         return germanContent.readingPassages;
        case 'writing':         return germanContent.writingPrompts;
        default:                return [];
    }
}

/**
 * Normalise a raw content item into uniform { prompt, answer, hint } shape
 * regardless of source bank structure.
 */
function normaliseItem(type, item) {
    switch (type) {
        case 'articles':
            return {
                prompt: `${item.word} (${item.translation})`,
                answer: item.article,
                hint: 'der / die / das',
                options: ['der', 'die', 'das']
            };
        case 'cases':
            return {
                prompt: item.sentence,
                answer: item.answer,
                hint: item.case
            };
        case 'verbs':
            return {
                prompt: item.prompt,
                answer: item.answer,
                hint: item.tense
            };
        case 'prepositions':
            return {
                prompt: item.sentence,
                answer: item.answer,
                hint: item.prep
            };
        case 'adjectives':
            return {
                prompt: item.sentence,
                answer: item.answer,
                hint: item.type
            };
        case 'vocabulary':
            return {
                prompt: `What does "${item.german}" mean in English?`,
                answer: item.english,
                hint: null
            };
        case 'reading':
            // Reading passages are special: a passage + multiple sub-questions
            // We normalise each passage into a single item with nested questions
            return {
                type: 'reading',
                title: item.title,
                text: item.text,
                prompt: item.title,
                answer: null,   // answered via sub-questions
                hint: null,
                questions: item.questions.map(q => ({
                    prompt: q.q,
                    answer: q.a
                }))
            };
        case 'writing':
            // Writing prompts are not auto-graded
            return {
                type: 'writing',
                writingType: item.type,
                prompt: item.prompt,
                answer: null,   // writing is not auto-graded
                hint: null,
                points: item.points
            };
        // All extended types already have { prompt, answer, hint }
        default:
            return {
                prompt: item.prompt,
                answer: item.answer,
                hint: item.hint || null
            };
    }
}

// ============================================================================
// GERMAN B1 QUESTION GENERATION
// ============================================================================

/**
 * Generate German B1 questions for a given exercise type.
 *
 * @param {string} level - Exercise type key (e.g. 'articles', 'cases', 'verbs')
 * @param {number} seed - Numeric seed for deterministic shuffling
 * @returns {{ questions: Array<{index, prompt, hint?, options?}>, type: string, name: string, count: number }}
 *          Questions WITHOUT answers (safe to send to client).
 */
function getGermanQuestions(level, seed) {
    const config = levelConfigs[level];
    if (!config) {
        return { error: `Unknown exercise type: ${level}`, questions: [], type: level, name: '', count: 0 };
    }

    const bank = getContentBankForType(config.type);
    if (bank.length === 0) {
        return { error: `No content for type: ${config.type}`, questions: [], type: level, name: config.name, count: 0 };
    }

    const rng = new SeededRandom(seed);
    const shuffled = seededShuffle(bank, rng);
    const count = Math.min(config.problemCount, shuffled.length);
    const selected = shuffled.slice(0, count);

    const questions = selected.map((item, idx) => {
        const normalised = normaliseItem(config.type, item);
        const q = {
            index: idx,
            prompt: normalised.prompt
        };
        if (normalised.hint) {
            q.hint = normalised.hint;
        }
        if (normalised.options) {
            q.options = normalised.options;
        }
        // Deliberately omit 'answer' so client cannot cheat
        return q;
    });

    return {
        questions,
        type: level,
        name: config.name,
        count: questions.length
    };
}

/**
 * Regenerate questions WITH answers (internal use only).
 */
function _getGermanQuestionsWithAnswers(level, seed) {
    const config = levelConfigs[level];
    if (!config) return [];

    const bank = getContentBankForType(config.type);
    if (bank.length === 0) return [];

    const rng = new SeededRandom(seed);
    const shuffled = seededShuffle(bank, rng);
    const count = Math.min(config.problemCount, shuffled.length);
    const selected = shuffled.slice(0, count);

    return selected.map((item, idx) => {
        const normalised = normaliseItem(config.type, item);
        return {
            index: idx,
            prompt: normalised.prompt,
            answer: normalised.answer,
            hint: normalised.hint || null
        };
    });
}

// ============================================================================
// PARTIAL CREDIT EVALUATION
// ============================================================================

/**
 * Remove German articles from text for partial-credit comparison.
 */
function removeArticles(text) {
    return text
        .replace(/\b(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Evaluate a single answer with partial credit.
 *
 * Scoring:
 *   1.0  - Exact match (case-insensitive)
 *   0.9  - Correct content but missing/wrong article
 *   0.8  - Minor spelling error (Levenshtein distance <= 2, similarity >= 0.7)
 *   0.7  - Article issue + minor spelling error
 *   0.0  - Empty or completely wrong
 *
 * @param {string} userAnswer - The user's answer (will be trimmed + lowercased)
 * @param {string} correctAnswer - The correct answer
 * @returns {{ score: number, feedback: string }}
 */
function evaluateAnswer(userAnswer, correctAnswer) {
    const userTrimmed = (userAnswer || '').trim().toLowerCase();
    const correctTrimmed = correctAnswer.toLowerCase();

    // Full credit: exact match
    if (userTrimmed === correctTrimmed) {
        return { score: 1.0, feedback: 'Richtig!' };
    }

    // Empty answer
    if (userTrimmed === '') {
        return { score: 0.0, feedback: 'Keine Antwort' };
    }

    // Check without articles (0.9 credit)
    const userWithoutArticles = removeArticles(userTrimmed);
    const correctWithoutArticles = removeArticles(correctTrimmed);

    if (userWithoutArticles === correctWithoutArticles && userWithoutArticles !== '') {
        return { score: 0.9, feedback: 'Fast richtig (missing/wrong article)' };
    }

    // Check for minor spelling mistakes (Levenshtein distance)
    const distance = levenshteinDistance(userTrimmed, correctTrimmed);
    const maxLength = Math.max(userTrimmed.length, correctTrimmed.length);
    const similarity = maxLength > 0 ? 1 - (distance / maxLength) : 0;

    // 1-2 character difference: 0.8 credit
    if (distance <= 2 && distance > 0 && similarity >= 0.7) {
        return { score: 0.8, feedback: 'Teilweise richtig (minor spelling error)' };
    }

    // Check spelling without articles
    if (userWithoutArticles !== '' && correctWithoutArticles !== '') {
        const distNoArt = levenshteinDistance(userWithoutArticles, correctWithoutArticles);
        const maxNoArt = Math.max(userWithoutArticles.length, correctWithoutArticles.length);
        const simNoArt = maxNoArt > 0 ? 1 - (distNoArt / maxNoArt) : 0;

        if (distNoArt <= 2 && distNoArt > 0 && simNoArt >= 0.7) {
            return { score: 0.7, feedback: 'Teilweise richtig (article + spelling)' };
        }
    }

    // Completely wrong
    return { score: 0.0, feedback: 'Falsch' };
}

// ============================================================================
// GERMAN B1 VALIDATION
// ============================================================================

/**
 * Validate a German B1 submission. Regenerates from the same seed
 * and compares each answer with partial credit.
 *
 * @param {string} level - Exercise type key
 * @param {number} seed - Same seed used to generate questions
 * @param {Array<string>} userAnswers - Array of user answer strings, indexed to match questions
 * @returns {{ totalScore: number, maxScore: number, percentage: number,
 *             results: Array<{index, correct, userAnswer, correctAnswer, score, feedback}> }}
 */
function validateGermanSubmission(level, seed, userAnswers) {
    const questionsWithAnswers = _getGermanQuestionsWithAnswers(level, seed);

    if (questionsWithAnswers.length === 0) {
        return { totalScore: 0, maxScore: 0, percentage: 0, results: [], error: `No questions for level: ${level}` };
    }

    let totalScore = 0;
    const maxScore = questionsWithAnswers.length;
    const results = [];

    questionsWithAnswers.forEach((q, idx) => {
        const userAnswer = (userAnswers && userAnswers[idx] != null) ? String(userAnswers[idx]) : '';
        const evaluation = evaluateAnswer(userAnswer, q.answer);

        totalScore += evaluation.score;

        results.push({
            index: idx,
            correct: evaluation.score === 1.0,
            userAnswer,
            correctAnswer: q.answer,
            score: evaluation.score,
            feedback: evaluation.feedback
        });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
        totalScore: Math.round(totalScore * 100) / 100, // 2 decimal places
        maxScore,
        percentage,
        results
    };
}

// ============================================================================
// GERMAN KIDS STORY CONTENT BANK
// ============================================================================

const ageBasedGermanStories = {
    '6': {
        easy: [
            {
                name: 'Die Katze (The Cat)',
                icon: 'cat',
                story: 'Das ist Mia. Mia ist eine Katze. Mia ist klein. Mia ist weich. Mia mag Milch. Mia trinkt Milch. Mia spielt gern. Mia spielt mit dem Ball. Mia schläft viel. Mia ist müde. Ich liebe Mia!',
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
            {
                name: 'Der Hund (The Dog)',
                icon: 'dog',
                story: 'Das ist Max. Max ist ein Hund. Max ist groß. Max ist braun. Max mag Wasser. Max trinkt viel Wasser. Max läuft gern. Max läuft im Park. Max bellt laut. Wau wau! Max ist mein Freund!',
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
            }
        ],
        medium: [
            {
                name: 'Der Apfel (The Apple)',
                icon: 'apple',
                story: 'Ich sehe einen Apfel. Der Apfel ist rot. Der Apfel ist rund. Der Apfel ist groß. Ich nehme den Apfel. Ich wasche den Apfel. Ich esse den Apfel. Der Apfel ist süß! Mmm, lecker! Ich mag Äpfel!',
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
            },
            {
                name: 'Die Blume (The Flower)',
                icon: 'flower',
                story: 'Ich sehe eine Blume. Die Blume ist rosa. Die Blume ist schön. Die Blume riecht gut. Ich gieße die Blume. Die Blume braucht Wasser. Die Blume wächst groß. Die Blume ist glücklich! Ich liebe meine Blume!',
                vocabulary: [
                    { word: 'die Blume', meaning: 'the flower' },
                    { word: 'rosa', meaning: 'pink' },
                    { word: 'schön', meaning: 'beautiful' },
                    { word: 'riecht', meaning: 'smells' },
                    { word: 'gieße', meaning: 'water (plants)' },
                    { word: 'wächst', meaning: 'grows' }
                ],
                questions: [
                    {
                        question: 'Welche Farbe hat die Blume? (What color is the flower?)',
                        options: ['rot', 'rosa', 'gelb', 'blau'],
                        correct: 1
                    },
                    {
                        question: 'Was braucht die Blume? (What does the flower need?)',
                        options: ['Milch', 'Wasser', 'Saft', 'Kuchen'],
                        correct: 1
                    }
                ]
            }
        ],
        hard: [
            {
                name: 'Der Geburtstag (The Birthday)',
                icon: 'cake',
                story: 'Heute ist Lenas Geburtstag. Sie ist jetzt sieben Jahre alt. Mama bäckt einen großen Kuchen. Der Kuchen ist sehr schön! Papa kauft bunte Luftballons. Es gibt rote, blaue und gelbe Luftballons. Lenas Freunde kommen zur Party. Sie bringen Geschenke mit. Alle singen "Happy Birthday". Lena ist sehr glücklich! Sie pustet die Kerzen aus. Dann essen alle Kuchen. Mmm, lecker!',
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
                    }
                ]
            },
            {
                name: 'Im Park (In the Park)',
                icon: 'tree',
                story: 'Tim und Anna gehen in den Park. Die Sonne scheint hell. Sie sehen einen großen Baum. Unter dem Baum ist ein kleiner Teich. Im Teich schwimmen Enten. Die Enten sind gelb und braun. Tim hat Brot dabei. Er füttert die Enten. Die Enten sind hungrig! Anna spielt auf dem Spielplatz. Sie schaukelt hoch in die Luft. Nach einer Stunde gehen sie nach Hause. Sie hatten viel Spaß!',
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
                    }
                ]
            }
        ]
    },
    '7': {
        easy: [
            {
                name: 'Die Schule (The School)',
                icon: 'school',
                story: 'Emma geht gern in die Schule. Sie ist in der ersten Klasse. Ihre Lehrerin heißt Frau Müller. Frau Müller ist sehr nett. Heute lernen sie Buchstaben. Emma schreibt mit einem blauen Stift. In der Pause spielt Emma mit ihren Freunden. Sie springen Seil. Nach der Schule macht Emma ihre Hausaufgaben. Dann liest sie ein Buch. Emma mag die Schule. Sie lernt jeden Tag etwas Neues!',
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
                    }
                ]
            }
        ],
        medium: [
            {
                name: 'Der Waldspaziergang (The Forest Walk)',
                icon: 'forest',
                story: 'Familie Schmidt macht einen Spaziergang im Wald. Es ist Herbst, und die Blätter sind bunt. Vater zeigt auf einen Baum. "Seht mal, das ist eine Eiche", sagt er. Die Kinder schauen nach oben. Plötzlich sehen sie ein Reh zwischen den Bäumen. Das Reh ist vorsichtig und still. Mutter sagt leise: "Seid ganz ruhig! Das Reh hat Angst vor lauten Geräuschen." Die Kinder beobachten das schöne Tier. Nach einer Minute läuft das Reh davon. Auf dem Rückweg sammeln sie bunte Blätter und Kastanien. Zu Hause basteln sie damit.',
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
                    }
                ]
            }
        ],
        hard: [
            {
                name: 'Im Zoo (At the Zoo)',
                icon: 'lion',
                story: 'Lukas besucht mit seiner Familie den Zoo. Es ist ein sonniger Tag, perfekt für einen Ausflug. Zuerst gehen sie zu den Elefanten. Die Elefanten sind riesig! Ein Elefant sprüht Wasser mit seinem Rüssel. Danach sehen sie die Giraffen. "Giraffen haben sehr lange Hälse", erklärt die Zoowärterin. Die Giraffen fressen Blätter von den hohen Bäumen. Ihr Fell hat schöne braune Flecken. Beim Löwengehege hören sie ein lautes Brüllen. Der Löwe liegt in der Sonne und ruht sich aus. Zum Schluss kauft Papa jedem ein Eis. Lukas hat einen tollen Tag im Zoo verbracht!',
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
                    }
                ]
            }
        ]
    },
    '8': {
        easy: [
            {
                name: 'Am Strand (At the Beach)',
                icon: 'beach',
                story: 'Die Familie verbringt den Sommer am Meer. Sophie und ihr Bruder Paul freuen sich sehr. Am Strand bauen sie eine große Sandburg. Sie brauchen viele Eimer voll Sand. Sophie verziert die Burg mit Muscheln. Sie hat viele schöne Muscheln gesammelt. Paul gräbt einen tiefen Graben um die Burg. "Das ist zum Schutz vor dem Wasser", sagt er. Später spielen sie im Meer. Die Wellen sind klein und warm. Das Wasser ist herrlich! Mama hat Butterbrote und Obst mitgebracht. Sie picknicken unter einem bunten Sonnenschirm. Am Abend sind alle müde, aber glücklich. Es war ein wundervoller Tag am Strand!',
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
                    }
                ]
            }
        ],
        medium: [],
        hard: []
    }
};

// ============================================================================
// GERMAN A1 STORIES CONTENT BANK
// ============================================================================

const germanA1Stories = {
    easy: {
        supermarket: {
            name: 'Im Supermarkt (At the Supermarket)',
            icon: 'cart',
            story: 'Ich gehe in den Supermarkt. Der Supermarkt ist groß. Ich brauche Brot, Milch und Käse. Das Brot kostet 2 Euro. Die Milch kostet 1 Euro. Der Käse ist teuer. Er kostet 5 Euro. Ich bezahle an der Kasse. Ich bezahle mit Karte. Ich sage "Danke" und gehe nach Hause.',
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
                { question: 'Was brauche ich? (What do I need?)', options: ['Brot, Milch und Käse', 'Brot, Wasser und Butter', 'Milch, Eier und Fleisch', 'Käse, Obst und Gemüse'], correct: 0 },
                { question: 'Wie viel kostet die Milch? (How much does the milk cost?)', options: ['1 Euro', '2 Euro', '5 Euro', '3 Euro'], correct: 0 },
                { question: 'Wie bezahle ich? (How do I pay?)', options: ['mit Bargeld (cash)', 'mit Karte (card)', 'mit Scheck (check)', 'nicht (not)'], correct: 1 }
            ]
        },
        cafe: {
            name: 'Im Café (At the Café)',
            icon: 'coffee',
            story: 'Ich bin im Café. Das Café ist schön und gemütlich. Ich möchte einen Kaffee trinken. Der Kellner kommt. "Guten Tag! Was möchten Sie?", fragt er. "Einen Kaffee, bitte", sage ich. Der Kaffee ist heiß und lecker. Er kostet 3 Euro. Ich trinke den Kaffee und lese die Zeitung.',
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
                { question: 'Wo bin ich? (Where am I?)', options: ['im Restaurant', 'im Café', 'zu Hause', 'im Büro'], correct: 1 },
                { question: 'Was möchte ich trinken? (What would I like to drink?)', options: ['Tee', 'Wasser', 'Kaffee', 'Saft'], correct: 2 },
                { question: 'Was mache ich im Café? (What do I do in the café?)', options: ['Ich arbeite', 'Ich schlafe', 'Ich lese die Zeitung', 'Ich koche'], correct: 2 }
            ]
        },
        apartment: {
            name: 'Die neue Wohnung (The New Apartment)',
            icon: 'home',
            story: 'Ich habe eine neue Wohnung. Die Wohnung ist klein aber schön. Sie hat zwei Zimmer, eine Küche und ein Bad. Das Wohnzimmer ist hell. Es hat ein großes Fenster. Das Schlafzimmer ist ruhig. Ich schlafe gut hier. Die Miete ist nicht teuer. Ich bezahle 600 Euro im Monat. Ich bin sehr glücklich mit meiner neuen Wohnung!',
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
                { question: 'Wie viele Zimmer hat die Wohnung? (How many rooms does the apartment have?)', options: ['ein Zimmer', 'zwei Zimmer', 'drei Zimmer', 'vier Zimmer'], correct: 1 },
                { question: 'Wie ist das Wohnzimmer? (How is the living room?)', options: ['dunkel (dark)', 'klein (small)', 'hell (bright)', 'laut (loud)'], correct: 2 },
                { question: 'Wie viel ist die Miete? (How much is the rent?)', options: ['600 Euro', '500 Euro', '700 Euro', '800 Euro'], correct: 0 }
            ]
        },
        post_office: {
            name: 'Auf der Post (At the Post Office)',
            icon: 'mail',
            story: 'Ich gehe zur Post. Ich möchte ein Paket nach Italien schicken. An der Post ist viel los. Ich nehme eine Nummer und warte. "Nummer 47, bitte!", ruft die Mitarbeiterin. Das ist meine Nummer! Ich gehe zum Schalter. "Guten Tag. Ich möchte dieses Paket schicken", sage ich. Die Mitarbeiterin wiegt das Paket. Es kostet 12 Euro. Ich bezahle und bekomme eine Quittung. Das Paket kommt in 3 Tagen an.',
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
                { question: 'Was möchte ich schicken? (What do I want to send?)', options: ['einen Brief', 'ein Paket', 'eine Postkarte', 'Geld'], correct: 1 },
                { question: 'Wohin schicke ich das Paket? (Where am I sending the package?)', options: ['nach Frankreich', 'nach Spanien', 'nach Italien', 'nach Österreich'], correct: 2 },
                { question: 'Wie viel kostet es? (How much does it cost?)', options: ['10 Euro', '12 Euro', '15 Euro', '20 Euro'], correct: 1 }
            ]
        },
        doctor: {
            name: 'Beim Arzt (At the Doctor)',
            icon: 'medical',
            story: 'Ich bin krank. Ich habe Kopfschmerzen und Fieber. Ich rufe beim Arzt an und bekomme heute einen Termin. Um 15 Uhr bin ich in der Praxis. Ich muss warten. Nach 20 Minuten ruft die Arzthelferin meinen Namen. Der Arzt untersucht mich. "Sie haben eine Erkältung", sagt er. Er gibt mir ein Rezept für Medikamente. "Bleiben Sie drei Tage zu Hause", sagt er. Ich gehe zur Apotheke und kaufe die Medikamente. Ich hoffe, es geht mir bald besser!',
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
                { question: 'Was habe ich? (What do I have?)', options: ['Kopfschmerzen und Fieber', 'Husten', 'Bauchschmerzen', 'nichts'], correct: 0 },
                { question: 'Was sagt der Arzt? (What does the doctor say?)', options: ['Sie haben Grippe', 'Sie haben eine Erkältung', 'Sie sind gesund', 'Sie brauchen eine Operation'], correct: 1 },
                { question: 'Wo kaufe ich die Medikamente? (Where do I buy the medicine?)', options: ['im Supermarkt', 'in der Apotheke', 'beim Arzt', 'im Krankenhaus'], correct: 1 }
            ]
        },
        restaurant: {
            name: 'Im Restaurant (At the Restaurant)',
            icon: 'food',
            story: 'Heute Abend gehe ich mit meiner Freundin ins Restaurant. Das Restaurant heißt "Bella Italia". Es ist ein italienisches Restaurant. Der Kellner bringt die Speisekarte. Es gibt Pizza, Pasta und Salat. Ich bestelle eine Pizza Margherita. Meine Freundin nimmt Spaghetti Carbonara. Wir trinken Wasser und Wein. Das Essen ist sehr lecker! Nach dem Essen möchten wir bezahlen. "Die Rechnung, bitte", sage ich. Die Rechnung ist 45 Euro. Wir geben 50 Euro und sagen "Stimmt so!"',
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
                { question: 'Was für ein Restaurant ist es? (What kind of restaurant is it?)', options: ['chinesisch', 'deutsch', 'italienisch', 'türkisch'], correct: 2 },
                { question: 'Was esse ich? (What do I eat?)', options: ['Spaghetti', 'Salat', 'Pizza Margherita', 'Lasagne'], correct: 2 },
                { question: 'Wie viel kostet das Essen? (How much does the food cost?)', options: ['40 Euro', '45 Euro', '50 Euro', '55 Euro'], correct: 1 }
            ]
        },
        weather: {
            name: 'Das Wetter (The Weather)',
            icon: 'sun',
            story: 'Heute ist das Wetter schön. Die Sonne scheint und der Himmel ist blau. Es ist warm, ungefähr 25 Grad. Perfekt für einen Spaziergang! Ich gehe in den Park. Viele Menschen sind hier. Kinder spielen und Hunde laufen herum. Ich sitze auf einer Bank und lese ein Buch. Es ist sehr angenehm. Nach zwei Stunden wird es wolkig. Dunkle Wolken kommen. Plötzlich beginnt es zu regnen! Ich habe keinen Regenschirm. Ich laufe schnell nach Hause. Ich bin nass, aber ich bin glücklich. Frische Luft tut gut!',
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
                { question: 'Wie ist das Wetter am Anfang? (How is the weather at the beginning?)', options: ['regnerisch', 'schön', 'kalt', 'windig'], correct: 1 },
                { question: 'Wie warm ist es? (How warm is it?)', options: ['20 Grad', '25 Grad', '30 Grad', '15 Grad'], correct: 1 },
                { question: 'Was passiert später? (What happens later?)', options: ['es schneit', 'es regnet', 'die Sonne scheint', 'es ist neblig'], correct: 1 }
            ]
        },
        train: {
            name: 'Mit dem Zug (By Train)',
            icon: 'train',
            story: 'Ich fahre mit dem Zug nach Berlin. Die Fahrt dauert drei Stunden. Ich bin am Bahnhof. Zuerst kaufe ich eine Fahrkarte am Automaten. Die Fahrkarte kostet 39 Euro. Dann suche ich den richtigen Bahnsteig. Der Zug fährt von Gleis 7. Ich steige in den Zug ein und suche meinen Platz. Ich habe einen Fensterplatz. Das ist gut! Ich kann die Landschaft sehen. Im Zug lese ich und trinke Kaffee. Die Zeit vergeht schnell. Nach drei Stunden sind wir in Berlin. Ich steige aus. Berlin, ich komme!',
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
                { question: 'Wohin fahre ich? (Where am I going?)', options: ['nach München', 'nach Hamburg', 'nach Berlin', 'nach Köln'], correct: 2 },
                { question: 'Wie lange dauert die Fahrt? (How long does the trip take?)', options: ['zwei Stunden', 'drei Stunden', 'vier Stunden', 'fünf Stunden'], correct: 1 },
                { question: 'Was für einen Platz habe ich? (What kind of seat do I have?)', options: ['Gangplatz (aisle)', 'Fensterplatz (window)', 'Stehplatz (standing)', 'keinen Platz'], correct: 1 }
            ]
        },
        weekend: {
            name: 'Das Wochenende (The Weekend)',
            icon: 'party',
            story: 'Endlich ist Wochenende! Ich freue mich sehr. Am Samstag schlafe ich lange. Ich stehe um 10 Uhr auf. Nach dem Frühstück putze ich die Wohnung. Das dauert zwei Stunden. Am Nachmittag gehe ich einkaufen. Ich brauche Obst, Gemüse und Brot. Am Abend treffe ich meine Freunde. Wir gehen ins Kino. Am Sonntag ist das Wetter schön. Ich mache einen langen Spaziergang. Das Wochenende ist zu kurz! Morgen ist wieder Montag.',
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
                { question: 'Wann stehe ich auf? (When do I get up?)', options: ['um 8 Uhr', 'um 9 Uhr', 'um 10 Uhr', 'um 11 Uhr'], correct: 2 },
                { question: 'Was mache ich am Samstag Nachmittag? (What do I do on Saturday afternoon?)', options: ['ich schlafe', 'ich gehe einkaufen', 'ich koche', 'ich arbeite'], correct: 1 },
                { question: 'Wohin gehe ich am Samstag Abend? (Where do I go on Saturday evening?)', options: ['ins Restaurant', 'ins Kino', 'nach Hause', 'ins Theater'], correct: 1 }
            ]
        }
    },
    medium: {
        firstday: {
            name: 'Der erste Arbeitstag (First Day at Work)',
            icon: 'briefcase',
            story: 'Heute ist mein erster Arbeitstag. Ich bin nervös aber auch froh. Ich arbeite jetzt in einer Firma. Die Firma ist in der Stadtmitte. Mein Chef heißt Herr Müller. Er ist sehr freundlich und hilft mir. Meine Kollegin heißt Frau Schmidt. Sie zeigt mir das Büro und erklärt alles. Ich habe einen eigenen Schreibtisch und einen Computer. Das ist toll! Um 12 Uhr machen wir Mittagspause. Wir gehen zusammen essen. Der erste Tag ist gut. Ich freue mich auf morgen!',
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
                { question: 'Wie fühle ich mich? (How do I feel?)', options: ['nur nervös', 'nervös und froh', 'traurig', 'müde'], correct: 1 },
                { question: 'Wie heißt mein Chef? (What is my boss\'s name?)', options: ['Herr Schmidt', 'Herr Müller', 'Herr Meyer', 'Herr Weber'], correct: 1 },
                { question: 'Wo ist die Firma? (Where is the company?)', options: ['auf dem Land', 'in der Stadtmitte', 'am Meer', 'im Dorf'], correct: 1 },
                { question: 'Wann ist die Mittagspause? (When is the lunch break?)', options: ['um 11 Uhr', 'um 12 Uhr', 'um 13 Uhr', 'um 14 Uhr'], correct: 1 }
            ]
        },
        doctor: {
            name: 'Beim Arzt (At the Doctor)',
            icon: 'hospital',
            story: 'Ich bin krank. Ich habe Kopfschmerzen und Fieber. Ich gehe zum Arzt. Im Wartezimmer sind viele Menschen. Nach 20 Minuten ruft die Arzthelferin meinen Namen. Ich gehe ins Sprechzimmer. Der Arzt fragt: "Was fehlt Ihnen?" Ich sage: "Ich habe Kopfschmerzen und Fieber." Der Arzt untersucht mich. Er sagt: "Sie haben eine Erkältung." Er gibt mir ein Rezept für Medikamente. "Trinken Sie viel Wasser und ruhen Sie sich aus", sagt er. Ich gehe zur Apotheke und kaufe die Medikamente. Dann gehe ich nach Hause.',
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
                { question: 'Was habe ich? (What do I have?)', options: ['Bauchschmerzen', 'Kopfschmerzen und Fieber', 'Rückenschmerzen', 'Zahnschmerzen'], correct: 1 },
                { question: 'Wo warte ich? (Where do I wait?)', options: ['im Sprechzimmer', 'im Wartezimmer', 'draußen', 'zu Hause'], correct: 1 },
                { question: 'Was habe ich laut Arzt? (What do I have according to the doctor?)', options: ['Grippe', 'Erkältung', 'Allergie', 'Infektion'], correct: 1 },
                { question: 'Was soll ich trinken? (What should I drink?)', options: ['Kaffee', 'Alkohol', 'viel Wasser', 'nichts'], correct: 2 }
            ]
        },
        trainstation: {
            name: 'Am Bahnhof (At the Train Station)',
            icon: 'train',
            story: 'Ich bin am Bahnhof. Ich möchte nach Berlin fahren. Ich gehe zum Schalter und frage: "Wann fährt der nächste Zug nach Berlin?" Der Mitarbeiter sagt: "Um 14:30 Uhr auf Gleis 7. Das ist in 15 Minuten." Ich kaufe eine Fahrkarte. Sie kostet 45 Euro. Das ist eine einfache Fahrt. Ich gehe zu Gleis 7 und warte auf den Zug. Es sind viele Reisende da. Der Zug kommt pünktlich. Ich steige ein und finde einen Sitzplatz am Fenster. Die Fahrt nach Berlin dauert 2 Stunden. Ich lese ein Buch während der Fahrt.',
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
                { question: 'Wohin möchte ich fahren? (Where do I want to go?)', options: ['nach München', 'nach Hamburg', 'nach Berlin', 'nach Frankfurt'], correct: 2 },
                { question: 'Wann fährt der Zug? (When does the train leave?)', options: ['um 14:00 Uhr', 'um 14:15 Uhr', 'um 14:30 Uhr', 'um 15:00 Uhr'], correct: 2 },
                { question: 'Wo ist der Zug? (Where is the train?)', options: ['Gleis 5', 'Gleis 6', 'Gleis 7', 'Gleis 8'], correct: 2 },
                { question: 'Wie lange dauert die Fahrt? (How long is the journey?)', options: ['1 Stunde', '2 Stunden', '3 Stunden', '4 Stunden'], correct: 1 }
            ]
        },
        phone_call: {
            name: 'Ein wichtiger Anruf (An Important Call)',
            icon: 'phone',
            story: 'Mein Telefon klingelt. Ich nehme das Gespräch an. "Hallo, hier spricht Anna Weber." "Guten Tag, Frau Weber. Hier ist Dr. Schmidt von der Zahnarztpraxis. Ich rufe wegen Ihres Termins an." "Ja, ich habe einen Termin am Mittwoch um 10 Uhr", sage ich. "Genau. Leider muss Dr. Müller den Termin verschieben. Passt Ihnen Donnerstag um 14 Uhr?" Ich schaue in meinen Kalender. "Ja, das passt gut. Donnerstag um 14 Uhr ist in Ordnung." "Wunderbar! Vielen Dank für Ihr Verständnis, Frau Weber. Bis Donnerstag!" "Auf Wiederhören!" Ich beende das Gespräch und trage den neuen Termin in meinen Kalender ein.',
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
                { question: 'Wer ruft an? (Who is calling?)', options: ['eine Freundin', 'Dr. Schmidt', 'meine Mutter', 'mein Chef'], correct: 1 },
                { question: 'Warum ruft sie an? (Why is she calling?)', options: ['um zu fragen, wie es mir geht', 'wegen eines Termins', 'um mich einzuladen', 'um zu verkaufen'], correct: 1 },
                { question: 'Wann ist der neue Termin? (When is the new appointment?)', options: ['Mittwoch 10 Uhr', 'Donnerstag 14 Uhr', 'Freitag 10 Uhr', 'Montag 14 Uhr'], correct: 1 }
            ]
        },
        hobby: {
            name: 'Mein Hobby (My Hobby)',
            icon: 'music',
            story: 'Ich habe ein tolles Hobby: Ich spiele Gitarre. Vor drei Jahren habe ich angefangen. Am Anfang war es schwierig. Meine Finger taten weh und die Akkorde klangen nicht gut. Aber ich habe nicht aufgegeben. Ich habe jeden Tag eine Stunde geübt. Jetzt kann ich viele Lieder spielen. Meine Lieblingslieder sind von den Beatles. Jeden Mittwoch habe ich Gitarrenunterricht. Mein Lehrer heißt Thomas. Er ist sehr geduldig. Manchmal spiele ich für meine Freunde. Sie sagen, dass ich gut bin. Das macht mich glücklich. Nächsten Monat möchte ich bei einem kleinen Konzert in einem Café mitspielen. Ich bin nervös, aber auch aufgeregt!',
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
                { question: 'Was ist mein Hobby? (What is my hobby?)', options: ['Klavier spielen', 'Gitarre spielen', 'Singen', 'Malen'], correct: 1 },
                { question: 'Wann habe ich angefangen? (When did I start?)', options: ['vor einem Jahr', 'vor zwei Jahren', 'vor drei Jahren', 'vor fünf Jahren'], correct: 2 },
                { question: 'Was mache ich nächsten Monat? (What am I doing next month?)', options: ['Urlaub machen', 'bei einem Konzert mitspielen', 'Unterricht geben', 'eine Gitarre kaufen'], correct: 1 }
            ]
        },
        neighbors: {
            name: 'Neue Nachbarn (New Neighbors)',
            icon: 'people',
            story: 'Letzte Woche sind neue Nachbarn eingezogen. Sie wohnen in der Wohnung neben mir. Am Samstag habe ich an ihre Tür geklopft. "Guten Tag! Ich bin Paul, Ihr Nachbar", habe ich gesagt. "Hallo Paul! Ich bin Maria und das ist mein Mann, Stefan", sagte die Frau freundlich. Wir haben uns unterhalten. Maria und Stefan kommen aus Spanien. Sie arbeiten beide hier in München. Maria ist Lehrerin und Stefan ist Ingenieur. Sie haben einen kleinen Hund namens Coco. "Wenn Sie Hilfe brauchen oder Fragen haben, können Sie gerne klopfen", habe ich gesagt. "Das ist sehr nett, danke!", sagte Maria. "Möchten Sie morgen zum Kaffee vorbeikommen?" "Sehr gerne!", habe ich geantwortet. Ich freue mich über die neuen Nachbarn. Sie sind sehr sympathisch!',
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
                { question: 'Woher kommen Maria und Stefan? (Where are Maria and Stefan from?)', options: ['aus Italien', 'aus Frankreich', 'aus Spanien', 'aus Portugal'], correct: 2 },
                { question: 'Was ist Stefan von Beruf? (What is Stefan\'s profession?)', options: ['Lehrer', 'Arzt', 'Ingenieur', 'Koch'], correct: 2 },
                { question: 'Wie heißt der Hund? (What is the dog\'s name?)', options: ['Luna', 'Max', 'Bella', 'Coco'], correct: 3 }
            ]
        },
        sports: {
            name: 'Sport und Fitness (Sports and Fitness)',
            icon: 'fitness',
            story: 'Ich möchte fit und gesund bleiben. Deshalb habe ich mich in einem Fitness-Studio angemeldet. Das Studio ist modern und gut ausgestattet. Es gibt Laufbänder, Gewichte und viele Fitnessgeräte. Ich gehe dreimal pro Woche trainieren: Montag, Mittwoch und Freitag. Ein Personal Trainer hat mir einen Trainingsplan gemacht. Zuerst mache ich 20 Minuten Cardio. Danach trainiere ich verschiedene Muskelgruppen mit Gewichten. Das ist anstrengend, aber ich fühle mich danach gut. Am Ende mache ich immer Dehnübungen. Das ist wichtig für die Muskeln. Nach drei Monaten sehe ich schon Resultate. Ich habe mehr Energie und fühle mich stärker. Außerdem habe ich im Studio neue Freunde gefunden. Wir motivieren uns gegenseitig. Sport macht mehr Spaß zusammen!',
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
                { question: 'Wie oft gehe ich trainieren? (How often do I train?)', options: ['zweimal pro Woche', 'dreimal pro Woche', 'jeden Tag', 'einmal pro Woche'], correct: 1 },
                { question: 'Was mache ich zuerst? (What do I do first?)', options: ['Gewichte', 'Dehnübungen', 'Cardio', 'Yoga'], correct: 2 },
                { question: 'Wann sehe ich Resultate? (When do I see results?)', options: ['nach einem Monat', 'nach zwei Monaten', 'nach drei Monaten', 'nach einem Jahr'], correct: 2 }
            ]
        }
    },
    hard: {
        apartment_search: {
            name: 'Die Wohnungssuche (Apartment Hunting)',
            icon: 'search',
            story: 'Ich suche eine neue Wohnung. Meine alte Wohnung ist zu klein und zu laut. Ich schaue im Internet nach Wohnungen. Es gibt viele Angebote, aber die meisten sind zu teuer. Endlich finde ich eine interessante Wohnung. Sie liegt im Stadtzentrum und hat drei Zimmer. Die Miete beträgt 800 Euro plus Nebenkosten. Das ist okay für mich. Ich rufe den Vermieter an und vereinbare einen Besichtigungstermin für morgen um 16 Uhr. Am nächsten Tag gehe ich zur Besichtigung. Die Wohnung gefällt mir sehr gut! Sie ist hell, modern und hat einen Balkon. Die Küche ist neu und das Bad ist groß. Ich sage dem Vermieter: "Die Wohnung ist perfekt! Ich möchte sie mieten." Der Vermieter freut sich. Wir unterschreiben den Mietvertrag nächste Woche.',
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
                { question: 'Warum suche ich eine neue Wohnung? (Why am I looking for a new apartment?)', options: ['zu klein und zu laut', 'zu teuer', 'zu weit weg', 'zu alt'], correct: 0 },
                { question: 'Wo liegt die neue Wohnung? (Where is the new apartment located?)', options: ['am Stadtrand', 'im Stadtzentrum', 'auf dem Land', 'in einem Dorf'], correct: 1 },
                { question: 'Wie viel ist die Miete? (How much is the rent?)', options: ['700 Euro', '800 Euro', '900 Euro', '1000 Euro'], correct: 1 },
                { question: 'Was hat die Wohnung? (What does the apartment have?)', options: ['einen Garten', 'eine Garage', 'einen Balkon', 'eine Terrasse'], correct: 2 },
                { question: 'Wann unterschreiben wir den Vertrag? (When do we sign the contract?)', options: ['heute', 'morgen', 'nächste Woche', 'nächsten Monat'], correct: 2 }
            ]
        },
        german_course: {
            name: 'Der Deutschkurs (The German Course)',
            icon: 'book',
            story: 'Ich besuche seit drei Monaten einen Deutschkurs. Der Kurs ist am Abend, dreimal pro Woche. Unsere Lehrerin heißt Frau Weber. Sie ist sehr geduldig und erklärt alles sehr gut. In meiner Klasse sind 12 Personen aus verschiedenen Ländern: aus der Türkei, aus Polen, aus Spanien und aus Syrien. Wir lernen Grammatik, Wortschatz und üben viel sprechen. Das Sprechen ist am Anfang schwierig, aber es wird besser. Jede Woche schreiben wir einen kleinen Test. Letzte Woche habe ich eine gute Note bekommen - eine 2! Am liebsten mag ich die Gruppenarbeit. Wir arbeiten zusammen und helfen einander. In zwei Wochen haben wir die Abschlussprüfung. Ich bin nervös, aber ich habe viel gelernt. Mein Ziel ist es, die B1-Prüfung zu bestehen. Dann kann ich besser in Deutschland leben und arbeiten. Ich bin sehr froh, dass ich diesen Kurs mache. Deutsch ist schwierig, aber auch interessant!',
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
                { question: 'Wie oft ist der Kurs? (How often is the course?)', options: ['einmal pro Woche', 'zweimal pro Woche', 'dreimal pro Woche', 'jeden Tag'], correct: 2 },
                { question: 'Wie viele Personen sind in der Klasse? (How many people are in the class?)', options: ['10', '12', '15', '20'], correct: 1 },
                { question: 'Was ist am Anfang schwierig? (What is difficult at the beginning?)', options: ['die Grammatik', 'der Wortschatz', 'das Sprechen', 'das Schreiben'], correct: 2 },
                { question: 'Welche Note habe ich bekommen? (What grade did I get?)', options: ['eine 1', 'eine 2', 'eine 3', 'eine 4'], correct: 1 },
                { question: 'Wann ist die Abschlussprüfung? (When is the final exam?)', options: ['morgen', 'nächste Woche', 'in zwei Wochen', 'nächsten Monat'], correct: 2 },
                { question: 'Welche Prüfung möchte ich bestehen? (Which exam do I want to pass?)', options: ['A1', 'A2', 'B1', 'B2'], correct: 2 }
            ]
        },
        recycling: {
            name: 'Mülltrennung in Deutschland (Waste Separation in Germany)',
            icon: 'recycle',
            story: 'Eine Sache, die mich in Deutschland überrascht hat, ist die Mülltrennung. Das System ist sehr kompliziert! In meinem Heimatland gab es nur eine Mülltonne. Hier gibt es mindestens vier verschiedene Tonnen! Die gelbe Tonne ist für Verpackungen aus Plastik und Metall. Zum Beispiel Joghurtbecher oder Konservendosen. Die blaue Tonne ist für Papier und Karton. Zeitungen, Kartons und Briefumschläge kommen hier rein. Die braune Tonne ist für Biomüll. Das sind Essensreste, Obst- und Gemüsereste, Kaffeefilter und so weiter. Die schwarze Tonne ist für Restmüll. Aber das ist noch nicht alles! Glasflaschen muss man zu Glascontainern bringen. Und man muss sie nach Farben trennen! Pfandflaschen bringt man zurück zum Supermarkt. Man bekommt 25 Cent pro Flasche zurück. Am Anfang war ich völlig verwirrt. Meine Nachbarin hat es bemerkt und mir alles geduldig erklärt. Jetzt verstehe ich das System besser. Es macht Sinn - Deutschland recycelt über 60% des Mülls!',
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
                { question: 'Wie viele Tonnen gibt es mindestens? (How many bins are there at least?)', options: ['zwei', 'drei', 'vier', 'fünf'], correct: 2 },
                { question: 'Was kommt in die gelbe Tonne? (What goes in the yellow bin?)', options: ['Papier', 'Biomüll', 'Plastik und Metall', 'Glas'], correct: 2 },
                { question: 'Wie viel bekommt man für eine Pfandflasche? (How much do you get for a deposit bottle?)', options: ['10 Cent', '25 Cent', '50 Cent', '1 Euro'], correct: 1 },
                { question: 'Wie viel Müll recycelt Deutschland? (How much waste does Germany recycle?)', options: ['über 40%', 'über 50%', 'über 60%', 'über 70%'], correct: 2 }
            ]
        }
    }
};

// ============================================================================
// LEVEL MAPPING (for unified API)
// ============================================================================

const LEVEL_TO_AGE = {
    1: '4-5', 2: '4-5',
    3: '6', 4: '6',
    5: '7', 6: '7',
    7: '8', 8: '8',
    9: '9+', 10: '9+',
    11: '10+', 12: '10+'
};

const LEVEL_TO_DIFFICULTY = {
    1: 'easy', 2: 'medium',
    3: 'easy', 4: 'medium',
    5: 'easy', 6: 'medium',
    7: 'easy', 8: 'medium',
    9: 'easy', 10: 'medium',
    11: 'easy', 12: 'medium'
};

function levelToAgeGroup(level) {
    return LEVEL_TO_AGE[level] || '6';
}

function levelToDifficulty(level) {
    return LEVEL_TO_DIFFICULTY[level] || 'easy';
}

// ============================================================================
// GERMAN KIDS QUESTION GENERATION
// ============================================================================

/**
 * Get German Kids story + questions WITHOUT correct answers.
 *
 * @param {string} age - Age group ('6', '7', '8', '9+', '10+')
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {number} storyIndex - Index into the stories array for this age+difficulty
 * @returns {{ story: string, name: string, vocabulary: Array, questions: Array<{question, options}>, error? }}
 */
function getGermanKidsQuestions(age, difficulty, storyIndex) {
    const ageGroup = ageBasedGermanStories[String(age)];
    if (!ageGroup) {
        return { error: `No stories for age: ${age}`, story: '', name: '', vocabulary: [], questions: [] };
    }

    const diffStories = ageGroup[difficulty];
    if (!diffStories || diffStories.length === 0) {
        return { error: `No stories for age ${age}, difficulty ${difficulty}`, story: '', name: '', vocabulary: [], questions: [] };
    }

    const idx = Math.max(0, Math.min(storyIndex, diffStories.length - 1));
    const storyData = diffStories[idx];

    // Return questions WITHOUT the correct field
    const questions = storyData.questions.map((q, qIdx) => ({
        index: qIdx,
        question: q.question,
        options: q.options
        // Deliberately omit 'correct' so client cannot cheat
    }));

    return {
        name: storyData.name,
        icon: storyData.icon,
        story: storyData.story,
        vocabulary: storyData.vocabulary,
        questions,
        storyCount: diffStories.length
    };
}

/**
 * Validate a German Kids story submission.
 * Compares user's selected option indices against correct indices.
 *
 * @param {string} age - Age group
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {number} storyIndex - Story index
 * @param {Array<number>} userAnswers - Array of option indices selected by user
 * @returns {{ score: number, total: number, percentage: number,
 *             results: Array<{index, correct, userAnswer, correctAnswer, correctOption}> }}
 */
function validateGermanKidsSubmission(age, difficulty, storyIndex, userAnswers) {
    const ageGroup = ageBasedGermanStories[String(age)];
    if (!ageGroup) {
        return { score: 0, total: 0, percentage: 0, results: [], error: `No stories for age: ${age}` };
    }

    const diffStories = ageGroup[difficulty];
    if (!diffStories || diffStories.length === 0) {
        return { score: 0, total: 0, percentage: 0, results: [], error: `No stories for age ${age}, difficulty ${difficulty}` };
    }

    const idx = Math.max(0, Math.min(storyIndex, diffStories.length - 1));
    const storyData = diffStories[idx];
    const total = storyData.questions.length;
    let score = 0;
    const results = [];

    storyData.questions.forEach((q, qIdx) => {
        const userAnswer = (userAnswers && userAnswers[qIdx] != null) ? Number(userAnswers[qIdx]) : -1;
        const isCorrect = userAnswer === q.correct;

        if (isCorrect) {
            score++;
        }

        results.push({
            index: qIdx,
            correct: isCorrect,
            userAnswer,
            correctAnswer: q.correct,
            correctOption: q.options[q.correct]
        });
    });

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return {
        score,
        total,
        percentage,
        results
    };
}

// ============================================================================
// GERMAN A1 STORY QUESTION GENERATION
// ============================================================================

/**
 * Get list of A1 story keys for a difficulty.
 */
function getA1StoryKeys(difficulty) {
    const stories = germanA1Stories[difficulty];
    return stories ? Object.keys(stories) : [];
}

/**
 * Get A1 story + questions WITHOUT correct answers.
 *
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {string|number} storyKey - Story key (string like 'supermarket') or numeric index
 * @param {number} seed - Seed for deterministic option shuffling
 * @returns {{ story, name, vocabulary, questions, error? }}
 */
function getGermanA1Questions(difficulty, storyKey, seed) {
    const stories = germanA1Stories[difficulty];
    if (!stories) {
        return { error: `No A1 stories for difficulty: ${difficulty}`, story: '', name: '', vocabulary: [], questions: [] };
    }

    // Support numeric index or string key
    let storyData;
    if (typeof storyKey === 'number') {
        const keys = Object.keys(stories);
        const key = keys[Math.max(0, Math.min(storyKey, keys.length - 1))];
        storyData = stories[key];
    } else {
        storyData = stories[storyKey];
    }

    if (!storyData) {
        return { error: `A1 story not found: ${storyKey}`, story: '', name: '', vocabulary: [], questions: [] };
    }

    const rng = new SeededRandom(seed || 0);

    // Return questions WITHOUT the correct field, with shuffled options
    const questions = storyData.questions.map((q, qIdx) => {
        // Shuffle options deterministically, track correct answer position
        const optionIndices = q.options.map((_, i) => i);
        const shuffledIndices = seededShuffle(optionIndices, rng);
        const shuffledOptions = shuffledIndices.map(i => q.options[i]);

        return {
            index: qIdx,
            question: q.question,
            options: shuffledOptions
            // Deliberately omit 'correct' so client cannot cheat
        };
    });

    return {
        name: storyData.name,
        icon: storyData.icon,
        story: storyData.story,
        vocabulary: storyData.vocabulary,
        questions,
        storyCount: Object.keys(stories).length
    };
}

/**
 * Validate an A1 story submission.
 *
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {string|number} storyKey - Story key or numeric index
 * @param {number} seed - Same seed used to generate questions
 * @param {Array<number>} userAnswers - Array of option indices selected by user (in shuffled order)
 * @returns {{ score, total, percentage, results }}
 */
function validateGermanA1Submission(difficulty, storyKey, seed, userAnswers) {
    const stories = germanA1Stories[difficulty];
    if (!stories) {
        return { score: 0, total: 0, percentage: 0, results: [], error: `No A1 stories for difficulty: ${difficulty}` };
    }

    let storyData;
    if (typeof storyKey === 'number') {
        const keys = Object.keys(stories);
        const key = keys[Math.max(0, Math.min(storyKey, keys.length - 1))];
        storyData = stories[key];
    } else {
        storyData = stories[storyKey];
    }

    if (!storyData) {
        return { score: 0, total: 0, percentage: 0, results: [], error: `A1 story not found: ${storyKey}` };
    }

    const rng = new SeededRandom(seed || 0);
    const total = storyData.questions.length;
    let score = 0;
    const results = [];

    storyData.questions.forEach((q, qIdx) => {
        // Reproduce the same shuffle as getGermanA1Questions
        const optionIndices = q.options.map((_, i) => i);
        const shuffledIndices = seededShuffle(optionIndices, rng);

        // The correct answer in original options is at index q.correct
        // After shuffling, the correct answer is at: shuffledIndices.indexOf(q.correct)
        const correctShuffledIdx = shuffledIndices.indexOf(q.correct);

        const userAnswer = (userAnswers && userAnswers[qIdx] != null) ? Number(userAnswers[qIdx]) : -1;
        const isCorrect = userAnswer === correctShuffledIdx;

        if (isCorrect) {
            score++;
        }

        results.push({
            index: qIdx,
            correct: isCorrect,
            userAnswer,
            correctAnswer: correctShuffledIdx,
            correctOption: q.options[q.correct]
        });
    });

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return { score, total, percentage, results };
}

// ============================================================================
// READING PASSAGE QUESTION GENERATION
// ============================================================================

/**
 * Generate reading comprehension questions for a given seed.
 * Picks a passage deterministically and returns it without answers.
 *
 * @param {number} seed
 * @returns {{ passage: { title, text }, questions: Array<{index, prompt}>, count }}
 */
function getReadingQuestions(seed) {
    const passages = germanContent.readingPassages;
    if (passages.length === 0) {
        return { error: 'No reading passages', passage: null, questions: [], count: 0 };
    }

    const rng = new SeededRandom(seed);
    const passageIdx = Math.floor(rng.next() * passages.length);
    const passage = passages[passageIdx];

    const questions = passage.questions.map((q, idx) => ({
        index: idx,
        prompt: q.q
        // Deliberately omit answer
    }));

    return {
        passage: { title: passage.title, text: passage.text },
        questions,
        count: questions.length
    };
}

/**
 * Validate reading comprehension answers.
 */
function validateReadingSubmission(seed, userAnswers) {
    const passages = germanContent.readingPassages;
    if (passages.length === 0) {
        return { totalScore: 0, maxScore: 0, percentage: 0, results: [] };
    }

    const rng = new SeededRandom(seed);
    const passageIdx = Math.floor(rng.next() * passages.length);
    const passage = passages[passageIdx];

    let totalScore = 0;
    const maxScore = passage.questions.length;
    const results = [];

    passage.questions.forEach((q, idx) => {
        const userAnswer = (userAnswers && userAnswers[idx] != null) ? String(userAnswers[idx]) : '';
        const evaluation = evaluateAnswer(userAnswer, q.a);
        totalScore += evaluation.score;

        results.push({
            index: idx,
            correct: evaluation.score === 1.0,
            userAnswer,
            correctAnswer: q.a,
            score: evaluation.score,
            feedback: evaluation.feedback
        });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
        totalScore: Math.round(totalScore * 100) / 100,
        maxScore,
        percentage,
        results
    };
}

// ============================================================================
// UNIFIED API - getGermanQuestions(module, level, page, seed)
// ============================================================================

/**
 * Unified entry point for German question generation.
 * Handles both 'german' (B1/A1) and 'german-kids' modules.
 *
 * For module='german':
 *   - level is the exercise type key ('articles', 'cases', 'verbs', etc.)
 *     OR an A1 story reference like 'a1:easy:supermarket'
 *   - page is currently unused for grammar (all questions returned);
 *     for reading/writing it selects the passage/prompt
 *   - seed is the numeric seed for deterministic shuffling
 *
 * For module='german-kids':
 *   - level is the numeric level (1-12) which maps to age+difficulty
 *   - page is the story index within that age+difficulty
 *   - seed is unused (stories are static, options are not shuffled)
 *
 * @param {string} module - 'german' or 'german-kids'
 * @param {string|number} level - Exercise type or numeric level
 * @param {number} page - Page/story index (1-based for consistency, converted internally)
 * @param {number} seed - Numeric seed for PRNG
 * @returns {Object} Questions WITHOUT answers
 */
function getGermanQuestionsUnified(module, level, page, seed) {
    if (module === 'german-kids') {
        const numLevel = Number(level);
        const ageGroup = levelToAgeGroup(numLevel);
        const difficulty = levelToDifficulty(numLevel);
        const storyIdx = Math.max(0, (page || 1) - 1); // 1-based to 0-based
        return getGermanKidsQuestions(ageGroup, difficulty, storyIdx);
    }

    if (module === 'german') {
        // Check for A1 story references: "a1:easy:supermarket" or "a1:medium:0"
        if (typeof level === 'string' && level.startsWith('a1:')) {
            const parts = level.split(':');
            const difficulty = parts[1] || 'easy';
            const storyKey = parts[2] || '0';
            const numKey = Number(storyKey);
            return getGermanA1Questions(difficulty, isNaN(numKey) ? storyKey : numKey, seed);
        }

        // Reading passages
        if (level === 'reading') {
            return getReadingQuestions(seed);
        }

        // Writing prompts (return prompt without auto-grading)
        if (level === 'writing') {
            const prompts = germanContent.writingPrompts;
            const rng = new SeededRandom(seed);
            const idx = Math.floor(rng.next() * prompts.length);
            const prompt = prompts[idx];
            return {
                type: 'writing',
                writingType: prompt.type,
                prompt: prompt.prompt,
                points: prompt.points,
                count: 1
            };
        }

        // Standard B1 grammar exercises
        return getGermanQuestions(level, seed);
    }

    return { error: `Unknown module: ${module}`, questions: [] };
}

/**
 * Unified validation entry point.
 *
 * @param {string} module - 'german' or 'german-kids'
 * @param {string|number} level - Exercise type or numeric level
 * @param {number} page - Page/story index (1-based)
 * @param {number} seed - Numeric seed
 * @param {Array} userAnswers - User's answers
 * @returns {Object} Validation result with score, total, percentage, results
 */
function validateGermanSubmissionUnified(module, level, page, seed, userAnswers) {
    if (module === 'german-kids') {
        const numLevel = Number(level);
        const ageGroup = levelToAgeGroup(numLevel);
        const difficulty = levelToDifficulty(numLevel);
        const storyIdx = Math.max(0, (page || 1) - 1);
        return validateGermanKidsSubmission(ageGroup, difficulty, storyIdx, userAnswers);
    }

    if (module === 'german') {
        // A1 story references
        if (typeof level === 'string' && level.startsWith('a1:')) {
            const parts = level.split(':');
            const difficulty = parts[1] || 'easy';
            const storyKey = parts[2] || '0';
            const numKey = Number(storyKey);
            return validateGermanA1Submission(difficulty, isNaN(numKey) ? storyKey : numKey, seed, userAnswers);
        }

        // Reading passages
        if (level === 'reading') {
            return validateReadingSubmission(seed, userAnswers);
        }

        // Writing: not auto-graded
        if (level === 'writing') {
            return {
                score: 0,
                total: 0,
                percentage: 0,
                results: [],
                note: 'Writing exercises are not auto-graded. Please review with a teacher.'
            };
        }

        // Standard B1 grammar exercises
        return validateGermanSubmission(level, seed, userAnswers);
    }

    return { score: 0, total: 0, percentage: 0, results: [], error: `Unknown module: ${module}` };
}

// ============================================================================
// GERMAN SPECIAL CHARACTER NORMALIZATION
// ============================================================================

/**
 * Normalize German special characters for flexible comparison.
 * Handles common substitutions: ae->ä, oe->ö, ue->ü, ss->ß
 *
 * @param {string} text
 * @returns {string} Normalized text
 */
function normalizeGermanChars(text) {
    return text
        .replace(/ae/g, 'ä')
        .replace(/oe/g, 'ö')
        .replace(/ue/g, 'ü')
        .replace(/Ae/g, 'Ä')
        .replace(/Oe/g, 'Ö')
        .replace(/Ue/g, 'Ü');
}

// ============================================================================
// UTILITY EXPORTS (for testing)
// ============================================================================

/**
 * List all available German B1 exercise types.
 */
function getAvailableExerciseTypes() {
    return Object.keys(levelConfigs);
}

/**
 * List all available German Kids story slots.
 * Returns { age: { difficulty: count } }
 */
function getAvailableStories() {
    const result = {};
    for (const age in ageBasedGermanStories) {
        result[age] = {};
        for (const diff in ageBasedGermanStories[age]) {
            result[age][diff] = ageBasedGermanStories[age][diff].length;
        }
    }
    return result;
}

/**
 * List all available A1 story slots.
 * Returns { difficulty: [keys] }
 */
function getAvailableA1Stories() {
    const result = {};
    for (const diff in germanA1Stories) {
        result[diff] = Object.keys(germanA1Stories[diff]);
    }
    return result;
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
    // Unified API (recommended)
    getGermanQuestionsUnified,
    validateGermanSubmissionUnified,

    // German B1 (direct access)
    getGermanQuestions,
    validateGermanSubmission,

    // German Kids (direct access)
    getGermanKidsQuestions,
    validateGermanKidsSubmission,

    // German A1 Stories (direct access)
    getGermanA1Questions,
    validateGermanA1Submission,

    // Reading & Writing (direct access)
    getReadingQuestions,
    validateReadingSubmission,

    // Partial credit evaluation (exposed for testing)
    evaluateAnswer,
    levenshteinDistance,

    // German character normalization
    normalizeGermanChars,

    // Level mapping
    levelToAgeGroup,
    levelToDifficulty,

    // Utilities
    getAvailableExerciseTypes,
    getAvailableStories,
    getAvailableA1Stories,
    getA1StoryKeys,

    // Content banks (exposed for testing / inspection)
    germanContent,
    ageBasedGermanStories,
    germanA1Stories,
    levelConfigs,

    // Internal helpers (exposed for testing)
    SeededRandom,
    hashCode,
    seededShuffle,
    removeArticles
};
