// Extended German B1 Grammar Exercises

// Modal Verbs Exercises
function generateModalVerbsExercises() {
    return [
        {
            prompt: "Ich ___ Deutsch sprechen. (I can speak German)",
            answer: "kann",
            hint: "können = can, to be able to"
        },
        {
            prompt: "Du ___ deine Hausaufgaben machen. (You must do your homework)",
            answer: "musst",
            hint: "müssen = must, to have to"
        },
        {
            prompt: "Er ___ heute nicht arbeiten. (He doesn't have to work today)",
            answer: "muss nicht",
            hint: "nicht müssen = don't have to"
        },
        {
            prompt: "Wir ___ ins Kino gehen. (We want to go to the cinema)",
            answer: "wollen",
            hint: "wollen = to want to"
        },
        {
            prompt: "Sie ___ hier nicht rauchen. (You/They may not smoke here)",
            answer: "dürfen nicht",
            hint: "nicht dürfen = may not, not allowed to"
        },
        {
            prompt: "Ihr ___ morgen früh aufstehen. (You should get up early tomorrow)",
            answer: "sollt",
            hint: "sollen = should, supposed to"
        },
        {
            prompt: "Ich ___ Kaffee lieber als Tee. (I prefer coffee to tea)",
            answer: "mag",
            hint: "mögen = to like, to prefer"
        },
        {
            prompt: "Du ___ das alleine machen? (You can do that alone?)",
            answer: "kannst",
            hint: "können = can, to be able to"
        },
        {
            prompt: "Man ___ hier parken. (One is allowed to park here)",
            answer: "darf",
            hint: "dürfen = may, to be allowed to"
        },
        {
            prompt: "Sie ___ zum Arzt gehen, sie ist krank. (She must go to the doctor, she is sick)",
            answer: "muss",
            hint: "müssen = must"
        }
    ];
}

// Separable Verbs Exercises
function generateSeparableVerbsExercises() {
    return [
        {
            prompt: "Ich stehe jeden Tag um 7 Uhr ___. (I get up every day at 7)",
            answer: "auf",
            hint: "aufstehen = to get up (separable)"
        },
        {
            prompt: "Kommst du heute Abend ___? (Are you coming along this evening?)",
            answer: "mit",
            hint: "mitkommen = to come along"
        },
        {
            prompt: "Er ruft seine Mutter jeden Tag ___. (He calls his mother every day)",
            answer: "an",
            hint: "anrufen = to call (on the phone)"
        },
        {
            prompt: "Wir kaufen im Supermarkt ___. (We shop at the supermarket)",
            answer: "ein",
            hint: "einkaufen = to shop"
        },
        {
            prompt: "Sie macht das Fenster ___. (She opens the window)",
            answer: "auf",
            hint: "aufmachen = to open"
        },
        {
            prompt: "Der Zug fährt um 10 Uhr ___. (The train departs at 10)",
            answer: "ab",
            hint: "abfahren = to depart"
        },
        {
            prompt: "Bitte schalten Sie Ihr Handy ___! (Please turn off your mobile phone!)",
            answer: "aus",
            hint: "ausschalten = to turn off"
        },
        {
            prompt: "Ich lade dich zur Party ___. (I invite you to the party)",
            answer: "ein",
            hint: "einladen = to invite"
        },
        {
            prompt: "Er zieht nächste Woche ___. (He's moving next week)",
            answer: "um",
            hint: "umziehen = to move (house)"
        },
        {
            prompt: "Wann kommst du ___? (When are you coming back?)",
            answer: "zurück",
            hint: "zurückkommen = to come back"
        }
    ];
}

// Reflexive Verbs Exercises
function generateReflexiveVerbsExercises() {
    return [
        {
            prompt: "Ich freue ___ auf das Wochenende. (I'm looking forward to the weekend)",
            answer: "mich",
            hint: "sich freuen = to be happy, to look forward"
        },
        {
            prompt: "Er interessiert ___ für Musik. (He is interested in music)",
            answer: "sich",
            hint: "sich interessieren = to be interested"
        },
        {
            prompt: "Wir treffen ___ morgen. (We're meeting tomorrow)",
            answer: "uns",
            hint: "sich treffen = to meet"
        },
        {
            prompt: "Du musst ___ beeilen! (You have to hurry!)",
            answer: "dich",
            hint: "sich beeilen = to hurry"
        },
        {
            prompt: "Sie wäscht ___ die Hände. (She washes her hands)",
            answer: "sich",
            hint: "sich waschen = to wash oneself"
        },
        {
            prompt: "Ich kann ___ nicht erinnern. (I can't remember)",
            answer: "mich",
            hint: "sich erinnern = to remember"
        },
        {
            prompt: "Ihr müsst ___ entscheiden! (You have to decide!)",
            answer: "euch",
            hint: "sich entscheiden = to decide"
        },
        {
            prompt: "Er setzt ___ auf den Stuhl. (He sits down on the chair)",
            answer: "sich",
            hint: "sich setzen = to sit down"
        },
        {
            prompt: "Ich ziehe ___ schnell an. (I get dressed quickly)",
            answer: "mich",
            hint: "sich anziehen = to get dressed"
        },
        {
            prompt: "Sie erholt ___ im Urlaub. (She recovers during vacation)",
            answer: "sich",
            hint: "sich erholen = to recover, to relax"
        }
    ];
}

// Conjunctions Exercises
function generateConjunctionsExercises() {
    return [
        {
            prompt: "Ich bleibe zu Hause, ___ es regnet. (I'm staying home because it's raining)",
            answer: "weil",
            hint: "weil = because (verb goes to end)"
        },
        {
            prompt: "Er sagt, ___ er morgen kommt. (He says that he's coming tomorrow)",
            answer: "dass",
            hint: "dass = that (verb goes to end)"
        },
        {
            prompt: "___ ich Zeit habe, gehe ich schwimmen. (When/If I have time, I go swimming)",
            answer: "Wenn",
            hint: "wenn = when, if (verb goes to end)"
        },
        {
            prompt: "Sie geht zur Arbeit, ___ sie krank ist. (She goes to work although she is sick)",
            answer: "obwohl",
            hint: "obwohl = although (verb goes to end)"
        },
        {
            prompt: "Ich weiß nicht, ___ er recht hat. (I don't know if he's right)",
            answer: "ob",
            hint: "ob = if, whether (verb goes to end)"
        },
        {
            prompt: "Sie lernt Deutsch, ___ sie in Deutschland arbeiten möchte. (She's learning German because she wants to work in Germany)",
            answer: "weil",
            hint: "weil = because"
        },
        {
            prompt: "___ es kalt ist, ziehe ich eine Jacke an. (Since it's cold, I'm putting on a jacket)",
            answer: "Da",
            hint: "da = since, because"
        },
        {
            prompt: "Ich denke, ___ er heute kommt. (I think that he's coming today)",
            answer: "dass",
            hint: "dass = that"
        },
        {
            prompt: "Er läuft schnell, ___ er den Bus nicht verpasst. (He runs fast so that he doesn't miss the bus)",
            answer: "damit",
            hint: "damit = so that (purpose)"
        },
        {
            prompt: "Sie ist müde, ___ sie gut gearbeitet hat. (She is tired although she worked well)",
            answer: "obwohl",
            hint: "obwohl = although"
        }
    ];
}

// Word Order Exercises
function generateWordOrderExercises() {
    return [
        {
            prompt: "Correct word order: Ich / heute / ins Kino / gehe",
            answer: "All are correct",
            hint: "All are grammatically correct, emphasis changes"
        },
        {
            prompt: "After 'weil': Ich bleibe zu Hause, weil ich / krank / bin",
            answer: "weil ich krank bin.",
            hint: "After weil, verb goes to the end"
        },
        {
            prompt: "After 'dass': Er sagt, dass er / morgen / kommt",
            answer: "dass er morgen kommt.",
            hint: "After dass, verb goes to the end"
        },
        {
            prompt: "Perfect tense: Ich / gestern / gegangen / bin / ins Kino",
            answer: "Ich bin gestern ins Kino gegangen.",
            hint: "Participle goes to the end"
        },
        {
            prompt: "Modal verb: Du / heute / arbeiten / musst",
            answer: "Du musst heute arbeiten.",
            hint: "Infinitive goes to the end with modal verbs"
        },
        {
            prompt: "Question: Wann / du / kommst?",
            answer: "Wann kommst du?",
            hint: "In W-questions, verb comes second"
        },
        {
            prompt: "Separable verb: Ich / auf / stehe / früh",
            answer: "Ich stehe früh auf.",
            hint: "Prefix goes to the end"
        },
        {
            prompt: "With 'wenn': Wenn ich Zeit habe, / ich / gehe / schwimmen",
            answer: "gehe ich schwimmen.",
            hint: "After subordinate clause, main verb comes first"
        },
        {
            prompt: "Time-Manner-Place: Er / mit dem Auto / heute / zur Arbeit / fährt",
            answer: "Er fährt heute mit dem Auto zur Arbeit.",
            hint: "Time - Manner - Place order"
        },
        {
            prompt: "Negation: Ich / nicht / heute / komme",
            answer: "Ich komme heute nicht.",
            hint: "nicht goes before the verb or at the end"
        }
    ];
}

// Comparative and Superlative Exercises
function generateComparativeExercises() {
    return [
        {
            prompt: "klein → kleiner → ___? (small - smaller - smallest)",
            answer: "am kleinsten",
            hint: "klein - kleiner - am kleinsten"
        },
        {
            prompt: "gut → ___ → am besten (good - better - best)",
            answer: "besser",
            hint: "gut - besser - am besten (irregular)"
        },
        {
            prompt: "viel → ___ → am meisten (much - more - most)",
            answer: "mehr",
            hint: "viel - mehr - am meisten (irregular)"
        },
        {
            prompt: "Das Auto ist ___ als das Fahrrad. (The car is faster than the bike)",
            answer: "schneller",
            hint: "Comparative with 'als' = than"
        },
        {
            prompt: "Sie ist ___ Studentin in der Klasse. (She is the best student in the class)",
            answer: "die beste",
            hint: "Superlative with article uses -st- + ending"
        },
        {
            prompt: "Im Winter ist es ___ als im Sommer. (In winter it's colder than in summer)",
            answer: "kälter",
            hint: "kalt - kälter - am kältesten (umlaut!)"
        },
        {
            prompt: "Er läuft ___ als sein Bruder. (He runs faster than his brother)",
            answer: "schneller",
            hint: "Comparative + als"
        },
        {
            prompt: "Das ist der ___ Berg der Welt. (That's the highest mountain in the world)",
            answer: "höchste",
            hint: "Superlative with article"
        },
        {
            prompt: "Sie singt ___ von allen. (She sings the best of all)",
            answer: "am besten",
            hint: "Superlative without article uses 'am'"
        },
        {
            prompt: "gern → ___ → am liebsten (like - prefer - like most)",
            answer: "lieber",
            hint: "gern - lieber - am liebsten (irregular)"
        }
    ];
}

// Pronouns Exercises
function generatePronounsExercises() {
    return [
        {
            prompt: "Das ist ___ Buch. (my book)",
            answer: "mein",
            hint: "mein (masculine/neuter nominative)"
        },
        {
            prompt: "Ich sehe ___. (I see you - informal singular)",
            answer: "dich",
            hint: "dich = you (accusative, informal singular)"
        },
        {
            prompt: "Er gibt ___ das Buch. (He gives me the book)",
            answer: "mir",
            hint: "mir = to me (dative)"
        },
        {
            prompt: "Das ist ___ Tasche. (her bag)",
            answer: "ihre",
            hint: "ihre (feminine nominative)"
        },
        {
            prompt: "Wir helfen ___. (We help them)",
            answer: "ihnen",
            hint: "ihnen = to them (dative)"
        },
        {
            prompt: "Ich wasche ___ die Hände. (I wash my hands)",
            answer: "mir",
            hint: "mir (dative reflexive)"
        },
        {
            prompt: "Kennst du ___? (Do you know him?)",
            answer: "ihn",
            hint: "ihn = him (accusative)"
        },
        {
            prompt: "___ Name ist Maria. (Her name is Maria)",
            answer: "Ihr",
            hint: "Ihr (formal 'your', capitalized)"
        },
        {
            prompt: "Das Auto gehört ___. (The car belongs to us)",
            answer: "uns",
            hint: "uns = to us (dative)"
        },
        {
            prompt: "Ist das ___ Auto? (Is that your car? - informal plural)",
            answer: "euer",
            hint: "euer (masculine/neuter nominative)"
        }
    ];
}

// Relative Clauses Exercises
function generateRelativeClausesExercises() {
    return [
        {
            prompt: "Der Mann, ___ dort steht, ist mein Lehrer. (The man who stands there is my teacher)",
            answer: "der",
            hint: "der (masculine nominative relative pronoun)"
        },
        {
            prompt: "Die Frau, ___ ich gestern getroffen habe. (The woman whom I met yesterday)",
            answer: "die",
            hint: "die (feminine accusative relative pronoun)"
        },
        {
            prompt: "Das Buch, ___ auf dem Tisch liegt. (The book that lies on the table)",
            answer: "das",
            hint: "das (neuter nominative relative pronoun)"
        },
        {
            prompt: "Der Mann, ___ ich geholfen habe. (The man whom I helped)",
            answer: "dem",
            hint: "dem (masculine dative - helfen needs dative)"
        },
        {
            prompt: "Die Kinder, ___ im Park spielen. (The children who play in the park)",
            answer: "die",
            hint: "die (plural nominative relative pronoun)"
        },
        {
            prompt: "Das Auto, ___ ich gekauft habe. (The car that I bought)",
            answer: "das",
            hint: "das (neuter accusative relative pronoun)"
        },
        {
            prompt: "Die Stadt, in ___ ich wohne. (The city in which I live)",
            answer: "der",
            hint: "der (feminine dative after 'in')"
        },
        {
            prompt: "Der Film, ___ wir gesehen haben. (The film that we saw)",
            answer: "den",
            hint: "den (masculine accusative relative pronoun)"
        },
        {
            prompt: "Die Leute, mit ___ ich arbeite. (The people with whom I work)",
            answer: "denen",
            hint: "denen (plural dative after 'mit')"
        },
        {
            prompt: "Das Haus, ___ Garten sehr schön ist. (The house whose garden is very beautiful)",
            answer: "dessen",
            hint: "dessen (genitive relative pronoun - whose)"
        }
    ];
}

// Konjunktiv II Exercises
function generateKonjunktivExercises() {
    return [
        {
            prompt: "Ich ___ gerne nach Berlin fahren. (I would like to go to Berlin)",
            answer: "würde",
            hint: "würde + infinitive (Konjunktiv II of werden)"
        },
        {
            prompt: "Wenn ich Zeit ___, würde ich kommen. (If I had time, I would come)",
            answer: "hätte",
            hint: "hätte (Konjunktiv II of haben)"
        },
        {
            prompt: "Er ___ das machen können. (He could do that)",
            answer: "könnte",
            hint: "könnte (Konjunktiv II of können)"
        },
        {
            prompt: "Wenn ich reich ___, würde ich viel reisen. (If I were rich, I would travel a lot)",
            answer: "wäre",
            hint: "wäre (Konjunktiv II of sein)"
        },
        {
            prompt: "Du ___ das besser machen. (You should do that better)",
            answer: "solltest",
            hint: "solltest (Konjunktiv II of sollen)"
        },
        {
            prompt: "Ich ___ gerne einen Kaffee. (I would like a coffee)",
            answer: "hätte",
            hint: "hätte gern = would like"
        },
        {
            prompt: "___ Sie mir bitte helfen? (Would you please help me?)",
            answer: "Könnten",
            hint: "Könnten (polite request)"
        },
        {
            prompt: "Er ___ heute nicht kommen müssen. (He wouldn't have to come today)",
            answer: "müsste",
            hint: "müsste (Konjunktiv II of müssen)"
        },
        {
            prompt: "Wenn es nicht regnen ___, gingen wir spazieren. (If it weren't raining, we would go for a walk)",
            answer: "würde",
            hint: "würde (Konjunktiv II)"
        },
        {
            prompt: "An deiner Stelle ___ ich das nicht tun. (In your place, I wouldn't do that)",
            answer: "würde",
            hint: "würde (giving advice)"
        }
    ];
}

// Passive Voice Exercises
function generatePassiveExercises() {
    return [
        {
            prompt: "Das Haus ___ gebaut. (The house is being built)",
            answer: "wird",
            hint: "wird + Partizip II = passive present"
        },
        {
            prompt: "Der Brief ___ gestern geschrieben. (The letter was written yesterday)",
            answer: "wurde",
            hint: "wurde + Partizip II = passive past"
        },
        {
            prompt: "Das Auto ___ repariert worden. (The car has been repaired)",
            answer: "ist",
            hint: "ist + Partizip II + worden = passive perfect"
        },
        {
            prompt: "Die Tür ___ von ihm geöffnet. (The door is opened by him)",
            answer: "wird",
            hint: "von + dative = by (agent in passive)"
        },
        {
            prompt: "Hier ___ nicht geraucht! (Smoking is not allowed here!)",
            answer: "wird",
            hint: "Passive as command/rule"
        },
        {
            prompt: "Das Problem ___ gelöst werden. (The problem must be solved)",
            answer: "muss",
            hint: "Modal verb + Partizip II + werden"
        },
        {
            prompt: "Der Film ___ im Kino gezeigt. (The film is shown in the cinema)",
            answer: "wird",
            hint: "wird + Partizip II"
        },
        {
            prompt: "Die Hausaufgaben ___ von den Schülern gemacht. (The homework is done by the students)",
            answer: "werden",
            hint: "werden (plural) + Partizip II"
        },
        {
            prompt: "Wann ___ das Haus gebaut? (When was the house built?)",
            answer: "wurde",
            hint: "wurde = passive past"
        },
        {
            prompt: "Das Buch ___ gerade gelesen. (The book is being read right now)",
            answer: "wird",
            hint: "wird + Partizip II"
        }
    ];
}
