// Script to generate 100 German A1 stories structure
const stories = {
    easy: [],
    medium: [],
    hard: []
};

// Easy story topics (33 stories)
const easyTopics = [
    ['Mein Morgen', '☀️', 'morning routine'],
    ['Im Supermarkt', '🛒', 'supermarket shopping'],
    ['Das Wetter', '🌤️', 'weather'],
    ['Meine Familie', '👨‍👩‍👧‍👦', 'family'],
    ['Im Café', '☕', 'at café'],
    ['Farben', '🎨', 'colors'],
    ['Die Wohnung', '🏠', 'apartment'],
    ['Obst kaufen', '🍎', 'buying fruit'],
    ['Der Park', '🌳', 'the park'],
    ['Mein Haustier', '🐕', 'my pet'],
    ['Das Frühstück', '🍳', 'breakfast'],
    ['Im Bett', '🛏️', 'in bed'],
    ['Die Küche', '🍴', 'the kitchen'],
    ['Kleidung', '👔', 'clothing'],
    ['Schuhe kaufen', '👞', 'buying shoes'],
    ['Der Regen', '🌧️', 'the rain'],
    ['Die Sonne', '☀️', 'the sun'],
    ['Mein Freund', '👫', 'my friend'],
    ['Die Straße', '🛣️', 'the street'],
    ['Das Auto', '🚗', 'the car'],
    ['Mit dem Bus', '🚌', 'by bus'],
    ['Die Uhrzeit', '⏰', 'the time'],
    ['Der Laden', '🏪', 'the store'],
    ['Gemüse', '🥕', 'vegetables'],
    ['Die Zahlen', '🔢', 'numbers'],
    ['Mein Zimmer', '🛋️', 'my room'],
    ['Der Tag', '📅', 'the day'],
    ['Die Nacht', '🌙', 'the night'],
    ['In der Bäckerei', '🥖', 'at bakery'],
    ['Das Buch', '📚', 'the book'],
    ['Der Computer', '💻', 'the computer'],
    ['Das Telefon', '📱', 'the phone'],
    ['Das Wochenende', '🎉', 'the weekend']
];

// Medium story topics (33 stories)
const mediumTopics = [
    ['Der erste Arbeitstag', '💼', 'first work day'],
    ['Beim Arzt', '🏥', 'at doctor'],
    ['Am Bahnhof', '🚂', 'at train station'],
    ['Im Restaurant', '🍽️', 'at restaurant'],
    ['Die Apotheke', '💊', 'the pharmacy'],
    ['Der Zahnarzt', '🦷', 'the dentist'],
    ['Die Post', '📮', 'the post office'],
    ['Die Bank', '🏦', 'the bank'],
    ['Im Kino', '🎬', 'at cinema'],
    ['Das Museum', '🏛️', 'the museum'],
    ['Die Bibliothek', '📖', 'the library'],
    ['Der Friseur', '💇', 'the hairdresser'],
    ['Das Fitnessstudio', '🏋️', 'the gym'],
    ['Der Supermarkt', '🛒', 'supermarket visit'],
    ['Eine Einladung', '✉️', 'an invitation'],
    ['Der Geburtstag', '🎂', 'the birthday'],
    ['Ein Telefonat', '☎️', 'a phone call'],
    ['Der Urlaub', '🏖️', 'the vacation'],
    ['Das Hotel', '🏨', 'the hotel'],
    ['Am Flughafen', '✈️', 'at airport'],
    ['Der Stadtplan', '🗺️', 'the city map'],
    ['Nach dem Weg fragen', '🧭', 'asking for directions'],
    ['Das Krankenhaus', '🏥', 'the hospital'],
    ['Der Unfall', '🚑', 'the accident'],
    ['Das Wetter morgen', '🌈', 'tomorrow\'s weather'],
    ['Die Jahreszeiten', '🍂', 'the seasons'],
    ['Ein Problem', '⚠️', 'a problem'],
    ['Die Reparatur', '🔧', 'the repair'],
    ['Der Nachbar', '🏘️', 'the neighbor'],
    ['Das Fest', '🎊', 'the party'],
    ['Sport treiben', '⚽', 'doing sports'],
    ['Kochen', '👨‍🍳', 'cooking'],
    ['Einkaufen', '🛍️', 'shopping']
];

// Hard story topics (34 stories)
const hardTopics = [
    ['Die Wohnungssuche', '🔍', 'apartment search'],
    ['Das Vorstellungsgespräch', '👔', 'job interview'],
    ['Der Deutschkurs', '📚', 'German course'],
    ['Die Anmeldung', '📋', 'registration'],
    ['Der Mietvertrag', '📄', 'rental contract'],
    ['Die Versicherung', '🛡️', 'insurance'],
    ['Das Finanzamt', '💰', 'tax office'],
    ['Der Arbeitsvertrag', '📝', 'work contract'],
    ['Die Kündigung', '❌', 'termination'],
    ['Die Bewerbung', '💼', 'job application'],
    ['Der Lebenslauf', '📃', 'resume/CV'],
    ['Die Konferenz', '👥', 'the conference'],
    ['Das Meeting', '🤝', 'the meeting'],
    ['Der Kollege', '👨‍💼', 'the colleague'],
    ['Die Beförderung', '📈', 'the promotion'],
    ['Der Umzug', '📦', 'the move'],
    ['Die Renovierung', '🏗️', 'renovation'],
    ['Der Handwerker', '👷', 'the craftsman'],
    ['Die Rechnung', '🧾', 'the bill/invoice'],
    ['Die Reklamation', '❗', 'the complaint'],
    ['Der Kundenservice', '🎧', 'customer service'],
    ['Online einkaufen', '🖱️', 'online shopping'],
    ['Die Lieferung', '📦', 'the delivery'],
    ['Der Führerschein', '🚗', 'driver\'s license'],
    ['Die Prüfung', '📝', 'the exam'],
    ['Das Studium', '🎓', 'university studies'],
    ['Die Universität', '🏫', 'the university'],
    ['Der Praktikum', '💼', 'the internship'],
    ['Die Weiterbildung', '📖', 'further education'],
    ['Das Zeugnis', '📜', 'the certificate'],
    ['Die Behörde', '🏛️', 'the authority'],
    ['Der Termin', '📅', 'the appointment'],
    ['Die Vereinbarung', '🤝', 'the agreement'],
    ['Der Konflikt', '⚡', 'the conflict']
];

console.log('Generated structure for 100 stories:');
console.log('Easy:', easyTopics.length);
console.log('Medium:', mediumTopics.length);
console.log('Hard:', hardTopics.length);
console.log('Total:', easyTopics.length + mediumTopics.length + hardTopics.length);
