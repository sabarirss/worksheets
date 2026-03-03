/**
 * Shared EQ Engine - Used by both client and Cloud Functions
 *
 * Provides deterministic EQ (Emotional Quotient) question generation and
 * server-side validation. Given the same (difficulty, age, seed, page),
 * this module ALWAYS produces the same activities with the same shuffled options.
 *
 * Usage (Cloud Functions):
 *   const { getEQQuestions, validateEQSubmission } = require('./shared/eq-engine');
 *   const questions = getEQQuestions('easy', '6', 12345, 1);
 *   // questions = [{ type, question, options, ... }]  (no answer field)
 *
 *   const result = validateEQSubmission('easy', '6', 12345, 1, userAnswers);
 *   // result = { score, total, percentage, results: [{ correct, userAnswer, correctAnswer }] }
 */

// ============================================================================
// SEEDED PRNG - Deterministic random number generator
// Same algorithm as math-engine.js for consistency
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

// ============================================================================
// LEVEL MAPPING
// ============================================================================

function ageAndDifficultyToLevel(age, diff) {
    const map = {
        '4-5': { easy: 1, medium: 2, hard: 2 },
        '6': { easy: 3, medium: 4, hard: 4 },
        '7': { easy: 5, medium: 6, hard: 6 },
        '8': { easy: 7, medium: 8, hard: 8 },
        '9+': { easy: 9, medium: 10, hard: 10 },
        '10+': { easy: 11, medium: 12, hard: 12 }
    };
    return map[age] && map[age][diff] || 1;
}

const AGE_TO_GROUP = {
    '4': '4-5', '5': '4-5',
    '6': '6', '7': '7', '8': '8',
    '9': '9+', '10': '10+', '11': '10+', '12': '10+', '13': '10+'
};

function getAgeGroupFromAge(age) {
    return AGE_TO_GROUP[String(age)] || '6';
}

// ============================================================================
// AGE-BASED EQ CONTENT BANK
// Organized by age group and difficulty. Each activity has:
//   type, question, options (array of strings), answer (correct option text)
//   Optional: emoji, situation, text
// ============================================================================

const ageBasedEQScenarios = {
    '4-5': {
        easy: [
            {
                type: 'emotion-face',
                emoji: '\u{1F60A}',
                question: 'How does this face feel?',
                options: ['Happy', 'Sad', 'Angry'],
                answer: 'Happy'
            },
            {
                type: 'emotion-face',
                emoji: '\u{1F622}',
                question: 'How does this face feel?',
                options: ['Happy', 'Sad', 'Sleepy'],
                answer: 'Sad'
            },
            {
                type: 'emotion-face',
                emoji: '\u{1F620}',
                question: 'How does this face feel?',
                options: ['Happy', 'Sad', 'Angry'],
                answer: 'Angry'
            },
            {
                type: 'emotion-face',
                emoji: '\u{1F628}',
                question: 'How does this face feel?',
                options: ['Scared', 'Happy', 'Sleepy'],
                answer: 'Scared'
            },
            {
                type: 'scenario',
                situation: '\u{1F382}',
                text: 'You get a birthday cake!',
                question: 'How do you feel?',
                options: ['Happy', 'Sad', 'Angry'],
                answer: 'Happy'
            },
            {
                type: 'scenario',
                situation: '\u{1F9F8}',
                text: 'Your toy is lost.',
                question: 'How do you feel?',
                options: ['Happy', 'Sad', 'Angry'],
                answer: 'Sad'
            },
            {
                type: 'empathy',
                situation: '\u{1F622}',
                text: 'Your friend is crying.',
                question: 'What should you do?',
                options: ['Give them a hug', 'Laugh', 'Walk away'],
                answer: 'Give them a hug'
            },
            {
                type: 'social',
                text: 'Someone shares a toy with you.',
                question: 'What should you say?',
                options: ['Thank you', 'Nothing', 'Give me more'],
                answer: 'Thank you'
            }
        ],
        medium: [
            {
                type: 'scenario',
                situation: '\u{1F381}',
                text: 'Someone gives you a surprise gift!',
                question: 'How do you feel?',
                options: ['Excited', 'Sad', 'Angry', 'Scared'],
                answer: 'Excited'
            },
            {
                type: 'scenario',
                situation: '\u{1F415}',
                text: 'A big dog barks at you.',
                question: 'How do you feel?',
                options: ['Scared', 'Happy', 'Excited', 'Tired'],
                answer: 'Scared'
            },
            {
                type: 'empathy',
                situation: '\u{1F60A}',
                text: 'Your friend won a game.',
                question: 'What should you say?',
                options: ['Good job!', 'I don\'t care', 'That\'s not fair'],
                answer: 'Good job!'
            }
        ],
        hard: [
            {
                type: 'scenario',
                situation: '\u{1F3C3}',
                text: 'You won a race!',
                question: 'How do you feel?',
                options: ['Proud', 'Sad', 'Scared', 'Angry'],
                answer: 'Proud'
            },
            {
                type: 'social',
                text: 'You bump into someone.',
                question: 'What should you say?',
                options: ['I\'m sorry', 'Nothing', 'You\'re mean'],
                answer: 'I\'m sorry'
            }
        ]
    },
    '6': {
        easy: [
            {
                type: 'emotion-face',
                emoji: '\u{1F60A}',
                question: 'What emotion is this person feeling?',
                options: ['Happy', 'Sad', 'Angry', 'Scared'],
                answer: 'Happy'
            },
            {
                type: 'emotion-face',
                emoji: '\u{1F62E}',
                question: 'This person looks...',
                options: ['Surprised', 'Angry', 'Sleepy', 'Sad'],
                answer: 'Surprised'
            },
            {
                type: 'scenario',
                situation: '\u{1F388}',
                text: 'You are going to a birthday party today!',
                question: 'How do you feel?',
                options: ['Excited', 'Sad', 'Angry', 'Tired'],
                answer: 'Excited'
            },
            {
                type: 'scenario',
                situation: '\u{1F624}',
                text: 'You try to build something but it keeps falling down.',
                question: 'How might you feel?',
                options: ['Frustrated', 'Happy', 'Sleepy', 'Excited'],
                answer: 'Frustrated'
            },
            {
                type: 'empathy',
                situation: '\u{1F622}',
                text: 'Your friend dropped their ice cream cone.',
                question: 'How do they feel?',
                options: ['Sad', 'Happy', 'Excited', 'Angry'],
                answer: 'Sad'
            },
            {
                type: 'social',
                text: 'Two friends both want to play with the same toy.',
                question: 'What should they do?',
                options: ['Take turns', 'Fight over it', 'Hide the toy'],
                answer: 'Take turns'
            }
        ],
        medium: [
            {
                type: 'scenario',
                situation: '\u{1F4DD}',
                text: 'You worked hard on your homework and got a star!',
                question: 'How do you feel?',
                options: ['Proud', 'Sad', 'Scared', 'Bored'],
                answer: 'Proud'
            },
            {
                type: 'empathy',
                situation: '\u{1F614}',
                text: 'Your friend wasn\'t picked for the team.',
                question: 'How do they feel?',
                options: ['Left out and sad', 'Very happy', 'Excited'],
                answer: 'Left out and sad'
            },
            {
                type: 'social',
                text: 'You accidentally broke your sister\'s toy.',
                question: 'What should you do?',
                options: ['Say sorry and help fix it', 'Hide it', 'Blame someone else'],
                answer: 'Say sorry and help fix it'
            }
        ],
        hard: [
            {
                type: 'scenario',
                situation: '\u{26BD}',
                text: 'Your team lost the game even though you tried hard.',
                question: 'How might you feel?',
                options: ['Disappointed', 'Very happy', 'Don\'t care'],
                answer: 'Disappointed'
            },
            {
                type: 'empathy',
                situation: '\u{1F910}',
                text: 'Your friend is very quiet and sitting alone today.',
                question: 'What should you do?',
                options: ['Ask if they\'re okay', 'Ignore them', 'Tell everyone'],
                answer: 'Ask if they\'re okay'
            }
        ]
    },
    '7': {
        easy: [
            {
                type: 'emotion-face',
                emoji: '\u{1F630}',
                question: 'Your friend makes this face before a test. They probably feel...',
                options: ['Worried', 'Happy', 'Excited', 'Sleepy'],
                answer: 'Worried'
            },
            {
                type: 'empathy',
                situation: '\u{1F622}',
                text: 'Your friend forgot their lunch at home.',
                question: 'What should you do?',
                options: ['Offer to share yours', 'Eat in front of them', 'Tell everyone'],
                answer: 'Offer to share yours'
            },
            {
                type: 'scenario',
                situation: '\u{1F3AD}',
                text: 'You have to speak in front of the class tomorrow.',
                question: 'How might you feel?',
                options: ['Nervous', 'Bored', 'Sleepy', 'Hungry'],
                answer: 'Nervous'
            },
            {
                type: 'social',
                text: 'You want to join a game your friends are playing.',
                question: 'What should you do?',
                options: ['Politely ask to join', 'Grab the game', 'Get angry'],
                answer: 'Politely ask to join'
            }
        ],
        medium: [
            {
                type: 'empathy',
                situation: '\u{1F3A8}',
                text: 'Your friend worked hard on a drawing but it didn\'t turn out well.',
                question: 'What should you say?',
                options: ['You tried hard! Keep practicing', 'That looks bad', 'I can do better'],
                answer: 'You tried hard! Keep practicing'
            },
            {
                type: 'scenario',
                situation: '\u{1F97A}',
                text: 'Your classmate lost the game and looks very disappointed.',
                question: 'How do they feel?',
                options: ['Disappointed', 'Very excited', 'Proud'],
                answer: 'Disappointed'
            },
            {
                type: 'self-regulation',
                text: 'You are angry because someone took your pencil.',
                question: 'What should you do?',
                options: ['Take deep breaths and ask for it back', 'Hit them', 'Scream'],
                answer: 'Take deep breaths and ask for it back'
            }
        ],
        hard: [
            {
                type: 'empathy',
                situation: '\u{1F915}',
                text: 'A classmate fell and hurt their knee on the playground.',
                question: 'What should you do?',
                options: ['Help them up and tell a teacher', 'Laugh', 'Keep playing'],
                answer: 'Help them up and tell a teacher'
            },
            {
                type: 'social',
                text: 'Someone is being left out of a game.',
                question: 'What should you do?',
                options: ['Invite them to play', 'Ignore it', 'Join in leaving them out'],
                answer: 'Invite them to play'
            }
        ]
    },
    '8': {
        easy: [
            {
                type: 'emotion-face',
                emoji: '\u{1F624}',
                question: 'When someone makes this face, they are probably...',
                options: ['Frustrated', 'Happy', 'Surprised', 'Tired'],
                answer: 'Frustrated'
            },
            {
                type: 'scenario',
                situation: '\u{1F3C6}',
                text: 'You won first place in the art contest!',
                question: 'How do you feel?',
                options: ['Proud', 'Sad', 'Scared', 'Bored'],
                answer: 'Proud'
            },
            {
                type: 'empathy',
                situation: '\u{1F61E}',
                text: 'Your friend studied hard but got a low grade.',
                question: 'How do they feel?',
                options: ['Disappointed', 'Excited', 'Proud', 'Hungry'],
                answer: 'Disappointed'
            },
            {
                type: 'social',
                text: 'Your friend got the toy you wanted for your birthday.',
                question: 'How might you feel?',
                options: ['A little jealous', 'Very angry', 'Not care at all'],
                answer: 'A little jealous'
            }
        ],
        medium: [
            {
                type: 'scenario',
                situation: '\u{1F3AE}',
                text: 'You want to play video games but your little brother wants you to play outside.',
                question: 'What shows good emotional intelligence?',
                options: ['Compromise - do both', 'Only do what you want', 'Get angry'],
                answer: 'Compromise - do both'
            },
            {
                type: 'empathy',
                situation: '\u{1F614}',
                text: 'Your friend wasn\'t invited to a party that everyone else is going to.',
                question: 'How should you act?',
                options: ['Be kind and understanding', 'Talk about the party a lot', 'Tell them they\'re not fun'],
                answer: 'Be kind and understanding'
            },
            {
                type: 'self-regulation',
                text: 'You are frustrated because you keep making mistakes on homework.',
                question: 'What\'s the best thing to do?',
                options: ['Take a break then try again', 'Give up', 'Rip up the paper'],
                answer: 'Take a break then try again'
            }
        ],
        hard: [
            {
                type: 'scenario',
                situation: '\u{1F3C6}',
                text: 'You won first place but your best friend came in last.',
                question: 'How should you act?',
                options: ['Be happy but kind, don\'t brag', 'Brag a lot', 'Pretend you didn\'t win'],
                answer: 'Be happy but kind, don\'t brag'
            },
            {
                type: 'social',
                text: 'Someone keeps bothering you even after you asked them to stop.',
                question: 'What should you do?',
                options: ['Tell a teacher calmly', 'Hit them', 'Bother them back'],
                answer: 'Tell a teacher calmly'
            }
        ]
    },
    '9+': {
        easy: [
            {
                type: 'emotion-face',
                emoji: '\u{1F60F}',
                question: 'This expression shows confidence. What should you do if you feel this way?',
                options: ['Use it to do your best', 'Show off to others', 'Make fun of people'],
                answer: 'Use it to do your best'
            },
            {
                type: 'scenario',
                situation: '\u{1F465}',
                text: 'Your two friends had a fight and both want you to take their side.',
                question: 'What should you do?',
                options: ['Listen to both and help them talk', 'Choose one side only', 'Ignore both'],
                answer: 'Listen to both and help them talk'
            },
            {
                type: 'empathy',
                situation: '\u{1F61E}',
                text: 'A classmate always sits alone. Others say they\'re weird.',
                question: 'What should you do?',
                options: ['Try to get to know them', 'Agree they\'re weird', 'Ignore them'],
                answer: 'Try to get to know them'
            }
        ],
        medium: [
            {
                type: 'social',
                text: 'Your friend group is leaving someone out on purpose to be mean.',
                question: 'What\'s the right thing to do?',
                options: ['Include them or speak up', 'Go along with the group', 'Stay quiet'],
                answer: 'Include them or speak up'
            },
            {
                type: 'self-regulation',
                text: 'You\'re very frustrated because you keep failing at something.',
                question: 'What\'s the best response?',
                options: ['Take a break then try with a new strategy', 'Give up forever', 'Get very angry'],
                answer: 'Take a break then try with a new strategy'
            },
            {
                type: 'empathy',
                situation: '\u{1F3AD}',
                text: 'Your friend forgot their lines in the school play.',
                question: 'What should you say?',
                options: ['Everyone makes mistakes!', 'You messed up badly', 'Don\'t try again'],
                answer: 'Everyone makes mistakes!'
            }
        ],
        hard: [
            {
                type: 'social',
                text: 'Someone spread a rumor about you that isn\'t true.',
                question: 'What\'s the most mature response?',
                options: ['Calmly tell the truth to people who matter', 'Spread rumors back', 'Get angry and yell'],
                answer: 'Calmly tell the truth to people who matter'
            },
            {
                type: 'consequence',
                text: 'You saw your friend cheating on a test.',
                question: 'What should you do?',
                options: ['Talk to your friend privately', 'Announce it to the class', 'Help them cheat more'],
                answer: 'Talk to your friend privately'
            },
            {
                type: 'mixed-emotion',
                text: 'You won the game, but your best friend lost and is sad.',
                question: 'What emotions might you feel?',
                options: ['Happy AND sympathetic', 'Only happy', 'Only sad'],
                answer: 'Happy AND sympathetic'
            }
        ]
    },
    '10+': {
        easy: [
            {
                type: 'emotion-face',
                emoji: '\u{1F914}',
                question: 'When you feel confused about homework, what\'s the most helpful response?',
                options: ['Ask questions to understand better', 'Get angry', 'Give up immediately'],
                answer: 'Ask questions to understand better'
            },
            {
                type: 'scenario',
                situation: '\u{1F630}',
                text: 'You have an important test tomorrow and feel anxious.',
                question: 'What\'s a healthy way to handle anxiety?',
                options: ['Study calmly, rest well, do your best', 'Panic and stay up all night', 'Ignore it completely'],
                answer: 'Study calmly, rest well, do your best'
            },
            {
                type: 'self-awareness',
                text: 'You notice you get angry easily when tired.',
                question: 'This shows...',
                options: ['Good self-awareness', 'Weakness', 'You\'re a bad person'],
                answer: 'Good self-awareness'
            }
        ],
        medium: [
            {
                type: 'social',
                text: 'Your friend group wants you to do something you think is wrong.',
                question: 'What shows strong character?',
                options: ['Stand by your values even if it\'s hard', 'Do what everyone else does', 'Pretend to agree'],
                answer: 'Stand by your values even if it\'s hard'
            },
            {
                type: 'mixed-emotion',
                text: 'You\'re moving to a new school. You\'ll have new opportunities but leave your friends.',
                question: 'It\'s normal to feel...',
                options: ['Excited AND sad at the same time', 'Only excited', 'Only sad'],
                answer: 'Excited AND sad at the same time'
            },
            {
                type: 'empathy',
                text: 'Someone is struggling with something you find easy.',
                question: 'How should you respond?',
                options: ['Be patient and offer help kindly', 'Tell them it\'s easy', 'Make fun of them'],
                answer: 'Be patient and offer help kindly'
            }
        ],
        hard: [
            {
                type: 'self-regulation',
                text: 'You feel overwhelming stress about school, friends, and activities.',
                question: 'What\'s the most mature response?',
                options: ['Talk to a trusted adult about managing stress', 'Keep it all inside', 'Quit everything'],
                answer: 'Talk to a trusted adult about managing stress'
            },
            {
                type: 'emotional-growth',
                text: 'Last year you were scared of public speaking, but now you volunteer to present.',
                question: 'This shows that...',
                options: ['Emotions can change as we grow and face fears', 'You were weak before', 'Emotions never change'],
                answer: 'Emotions can change as we grow and face fears'
            },
            {
                type: 'social',
                text: 'You notice a friend showing signs of depression - always sad, withdrawn, losing interest.',
                question: 'What\'s the most caring response?',
                options: ['Encourage them to talk to a counselor or trusted adult', 'Tell everyone about it', 'Ignore it'],
                answer: 'Encourage them to talk to a counselor or trusted adult'
            },
            {
                type: 'self-awareness',
                text: 'You realize that your confidence drops when comparing yourself to others on social media.',
                question: 'This awareness can help you...',
                options: ['Make healthier choices about social media use', 'Feel bad about yourself', 'Ignore the problem'],
                answer: 'Make healthier choices about social media use'
            }
        ]
    }
};

// ============================================================================
// FALLBACK CONTENT BANK (from eq-generator.js)
// Used when age-based content is not available for a given difficulty
// ============================================================================

const fallbackActivities = {
    easy: [
        {
            type: 'emotion-face',
            emoji: '\u{1F60A}',
            question: 'What emotion is this?',
            options: ['Happy', 'Sad', 'Angry'],
            answer: 'Happy'
        },
        {
            type: 'emotion-face',
            emoji: '\u{1F622}',
            question: 'This person is feeling...',
            options: ['Happy', 'Sad', 'Angry'],
            answer: 'Sad'
        },
        {
            type: 'emotion-face',
            emoji: '\u{1F620}',
            question: 'Which emotion do you see?',
            options: ['Happy', 'Sad', 'Angry'],
            answer: 'Angry'
        },
        {
            type: 'emotion-face',
            emoji: '\u{1F628}',
            question: 'What is this face showing?',
            options: ['Scared', 'Happy', 'Sleepy'],
            answer: 'Scared'
        },
        {
            type: 'scenario',
            situation: '\u{1F382}',
            text: 'It\'s your birthday and you get a big cake!',
            question: 'How do you feel?',
            options: ['Happy', 'Sad', 'Angry'],
            answer: 'Happy'
        },
        {
            type: 'scenario',
            situation: '\u{1F9F8}',
            text: 'You lose your favorite toy.',
            question: 'How do you feel?',
            options: ['Happy', 'Sad', 'Excited'],
            answer: 'Sad'
        },
        {
            type: 'scenario',
            situation: '\u{1F415}',
            text: 'A big dog runs toward you barking loudly.',
            question: 'How do you feel?',
            options: ['Scared', 'Happy', 'Tired'],
            answer: 'Scared'
        },
        {
            type: 'scenario',
            situation: '\u{1F381}',
            text: 'Someone gives you a surprise present!',
            question: 'How do you feel?',
            options: ['Excited', 'Sad', 'Angry'],
            answer: 'Excited'
        },
        {
            type: 'empathy',
            situation: '\u{1F622}',
            text: 'Your friend is crying.',
            question: 'What should you do?',
            options: ['Ask what\'s wrong', 'Laugh at them', 'Walk away'],
            answer: 'Ask what\'s wrong'
        },
        {
            type: 'empathy',
            situation: '\u{1F60A}',
            text: 'Your friend just won a game.',
            question: 'What should you do?',
            options: ['Say congratulations', 'Get angry', 'Ignore them'],
            answer: 'Say congratulations'
        },
        {
            type: 'social',
            text: 'Someone accidentally bumps into you.',
            question: 'What should you say?',
            options: ['It\'s okay', 'You\'re mean!', 'Say nothing'],
            answer: 'It\'s okay'
        },
        {
            type: 'social',
            text: 'Your friend shares their snack with you.',
            question: 'What should you say?',
            options: ['Thank you', 'Give me more', 'Nothing'],
            answer: 'Thank you'
        },
        {
            type: 'scenario',
            situation: '\u{1F3C3}',
            text: 'You are playing a game and you win!',
            question: 'How do you feel?',
            options: ['Proud', 'Sad', 'Scared'],
            answer: 'Proud'
        },
        {
            type: 'empathy',
            situation: '\u{1F389}',
            text: 'It\'s your friend\'s birthday today.',
            question: 'What should you do?',
            options: ['Wish them happy birthday', 'Ignore them', 'Be sad'],
            answer: 'Wish them happy birthday'
        },
        {
            type: 'social',
            text: 'You accidentally step on someone\'s foot.',
            question: 'What should you do?',
            options: ['Say sorry', 'Run away', 'Laugh'],
            answer: 'Say sorry'
        }
    ],
    medium: [
        {
            type: 'emotion-face',
            emoji: '\u{1F630}',
            question: 'Your friend shows this face before a test. They probably feel...',
            options: ['Worried', 'Happy', 'Angry', 'Sleepy'],
            answer: 'Worried'
        },
        {
            type: 'emotion-face',
            emoji: '\u{1F624}',
            question: 'When your brother makes this face, it means he is...',
            options: ['Frustrated', 'Happy', 'Surprised', 'Tired'],
            answer: 'Frustrated'
        },
        {
            type: 'emotion-face',
            emoji: '\u{1F97A}',
            question: 'If your classmate looks like this after losing a game, they feel...',
            options: ['Disappointed', 'Excited', 'Proud', 'Angry'],
            answer: 'Disappointed'
        },
        {
            type: 'scenario',
            situation: '\u{1F4DD}',
            text: 'You studied hard and got a good grade on your test.',
            question: 'How do you feel?',
            options: ['Proud', 'Sad', 'Scared', 'Angry'],
            answer: 'Proud'
        },
        {
            type: 'scenario',
            situation: '\u{26BD}',
            text: 'Your team lost the soccer game even though you tried your best.',
            question: 'How might you feel?',
            options: ['Disappointed but okay', 'Very happy', 'Not care at all', 'Laugh at everyone'],
            answer: 'Disappointed but okay'
        },
        {
            type: 'scenario',
            situation: '\u{1F3AD}',
            text: 'You have to perform in front of the whole school tomorrow.',
            question: 'How might you feel?',
            options: ['Nervous', 'Bored', 'Sleepy', 'Hungry'],
            answer: 'Nervous'
        },
        {
            type: 'empathy',
            situation: '\u{1F614}',
            text: 'Your friend didn\'t get invited to a birthday party.',
            question: 'How do you think they feel?',
            options: ['Sad and left out', 'Very happy', 'Excited', 'Angry at you'],
            answer: 'Sad and left out'
        },
        {
            type: 'empathy',
            situation: '\u{1F3A8}',
            text: 'Your friend worked hard on a drawing but it didn\'t turn out well.',
            question: 'What should you say?',
            options: ['You tried hard! Keep practicing', 'That looks terrible', 'I can do better', 'Don\'t show anyone'],
            answer: 'You tried hard! Keep practicing'
        },
        {
            type: 'empathy',
            situation: '\u{1F915}',
            text: 'A classmate fell and hurt their knee.',
            question: 'What should you do?',
            options: ['Help them up and tell a teacher', 'Laugh at them', 'Keep playing', 'Take a picture'],
            answer: 'Help them up and tell a teacher'
        },
        {
            type: 'social',
            text: 'Two friends both want to play with the same toy.',
            question: 'What\'s a good solution?',
            options: ['Take turns playing', 'The bigger kid gets it', 'Hide the toy', 'Fight over it'],
            answer: 'Take turns playing'
        },
        {
            type: 'social',
            text: 'You accidentally broke your sister\'s crayon.',
            question: 'What should you do?',
            options: ['Say sorry and help fix it', 'Hide it', 'Blame someone else', 'Break more crayons'],
            answer: 'Say sorry and help fix it'
        },
        {
            type: 'social',
            text: 'Your friend is playing a game and you want to join.',
            question: 'What should you do?',
            options: ['Politely ask to join', 'Grab the game', 'Get angry', 'Tell the teacher'],
            answer: 'Politely ask to join'
        },
        {
            type: 'self-regulation',
            text: 'You are very angry because someone took your pencil.',
            question: 'What\'s the best thing to do?',
            options: ['Take deep breaths and ask for it back', 'Hit them', 'Scream loudly', 'Cry and run away'],
            answer: 'Take deep breaths and ask for it back'
        },
        {
            type: 'self-regulation',
            text: 'You really want a toy but Mom says no.',
            question: 'What should you do?',
            options: ['Accept it calmly and ask why', 'Throw a tantrum', 'Take it anyway', 'Never talk to Mom again'],
            answer: 'Accept it calmly and ask why'
        },
        {
            type: 'empathy',
            situation: '\u{1F910}',
            text: 'Your friend is very quiet today and sitting alone.',
            question: 'What should you do?',
            options: ['Sit with them and ask if they\'re okay', 'Ignore them', 'Tell everyone they\'re weird', 'Laugh at them'],
            answer: 'Sit with them and ask if they\'re okay'
        }
    ],
    hard: [
        {
            type: 'emotion-face',
            emoji: '\u{1F60F}',
            question: 'This expression shows confidence. What should you do if you feel this way before a competition?',
            options: ['Use it to perform your best', 'Show off to others', 'Make fun of competitors', 'Give up trying'],
            answer: 'Use it to perform your best'
        },
        {
            type: 'emotion-face',
            emoji: '\u{1F914}',
            question: 'When you feel confused like this about homework, what\'s the most helpful response?',
            options: ['Ask questions to understand better', 'Get angry at the homework', 'Give up immediately', 'Copy someone else\'s work'],
            answer: 'Ask questions to understand better'
        },
        {
            type: 'scenario',
            situation: '\u{1F465}',
            text: 'Your two best friends had a fight and both want you to take their side.',
            question: 'What\'s the best thing to do?',
            options: ['Listen to both and help them talk it out', 'Choose one friend only', 'Ignore both friends', 'Make fun of both'],
            answer: 'Listen to both and help them talk it out'
        },
        {
            type: 'scenario',
            situation: '\u{1F3AE}',
            text: 'You want to play video games but your little brother wants to play outside with you.',
            question: 'What shows good emotional intelligence?',
            options: ['Compromise: play half outside, half games', 'Only do what you want', 'Get angry at him', 'Tell parents he\'s annoying'],
            answer: 'Compromise: play half outside, half games'
        },
        {
            type: 'scenario',
            situation: '\u{1F3C6}',
            text: 'You won first place but your best friend came in last.',
            question: 'How should you act?',
            options: ['Be happy but kind, don\'t brag', 'Brag a lot about winning', 'Pretend you didn\'t win', 'Make fun of your friend'],
            answer: 'Be happy but kind, don\'t brag'
        },
        {
            type: 'empathy',
            situation: '\u{1F61E}',
            text: 'A classmate always sits alone. Others say they\'re weird, but you don\'t know them well.',
            question: 'What\'s the most emotionally intelligent choice?',
            options: ['Try to get to know them yourself', 'Agree they\'re weird', 'Ignore them like others do', 'Tell everyone else to avoid them'],
            answer: 'Try to get to know them yourself'
        },
        {
            type: 'empathy',
            situation: '\u{1F3AD}',
            text: 'Your friend forgot their lines in the school play and feels embarrassed.',
            question: 'What should you say?',
            options: ['Everyone makes mistakes, you did great!', 'You messed up badly', 'I would never forget my lines', 'Don\'t try acting again'],
            answer: 'Everyone makes mistakes, you did great!'
        },
        {
            type: 'social',
            text: 'Your friend group is leaving someone out on purpose to be mean.',
            question: 'What\'s the right thing to do?',
            options: ['Include that person or speak up', 'Go along with the group', 'Stay quiet and watch', 'Join in being mean'],
            answer: 'Include that person or speak up'
        },
        {
            type: 'social',
            text: 'Someone spread a rumor about you that isn\'t true.',
            question: 'What\'s the most mature response?',
            options: ['Calmly tell the truth to people who matter', 'Spread rumors about them back', 'Get very angry and yell', 'Cry and hide'],
            answer: 'Calmly tell the truth to people who matter'
        },
        {
            type: 'self-regulation',
            text: 'You\'re very frustrated because you keep making mistakes on your homework.',
            question: 'What\'s the best way to handle this feeling?',
            options: ['Take a break, then try again calmly', 'Rip up the homework', 'Give up completely', 'Blame the teacher for making it hard'],
            answer: 'Take a break, then try again calmly'
        },
        {
            type: 'self-regulation',
            text: 'Someone keeps bothering you even after you asked them to stop.',
            question: 'What should you do?',
            options: ['Tell a teacher or adult calmly', 'Hit them', 'Bother them back', 'Keep being annoyed but do nothing'],
            answer: 'Tell a teacher or adult calmly'
        },
        {
            type: 'consequence',
            text: 'You saw your friend cheating on a test.',
            question: 'What\'s the most thoughtful response?',
            options: ['Talk to your friend privately about it', 'Announce it to the class', 'Help them cheat more', 'Ignore it completely'],
            answer: 'Talk to your friend privately about it'
        },
        {
            type: 'mixed-emotion',
            text: 'You won the game, but your best friend lost and is sad.',
            question: 'What TWO emotions might you feel at the same time?',
            options: ['Only happy', 'Happy AND sympathetic', 'Only sad', 'Angry at your friend'],
            answer: 'Happy AND sympathetic'
        },
        {
            type: 'mixed-emotion',
            text: 'Your family is moving to a new house. You\'ll have a bigger room but leave your friends.',
            question: 'It\'s normal to feel...',
            options: ['Only excited', 'Only sad', 'Excited AND sad at the same time', 'Nothing at all'],
            answer: 'Excited AND sad at the same time'
        },
        {
            type: 'emotional-growth',
            text: 'Last year you were scared of swimming, but now you enjoy it.',
            question: 'This shows that...',
            options: ['You were wrong to be scared before', 'Emotions never change', 'Being scared means you\'re weak', 'Emotions can change as we grow and practice'],
            answer: 'Emotions can change as we grow and practice'
        }
    ]
};

// ============================================================================
// ACTIVITY SELECTION AND SHUFFLING
// ============================================================================

/**
 * Get the raw activity pool for a given difficulty and age group.
 * Tries age-based content first, falls back to difficulty-based fallback.
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @param {string} ageGroup - '4-5', '6', '7', '8', '9+', '10+'
 * @returns {Array} Array of activity objects (with answer field)
 */
function getActivityPool(difficulty, ageGroup) {
    // Try age-based content first
    if (ageBasedEQScenarios[ageGroup] && ageBasedEQScenarios[ageGroup][difficulty]) {
        const activities = ageBasedEQScenarios[ageGroup][difficulty];
        if (activities.length > 0) {
            return activities;
        }
    }

    // Fall back to generic difficulty-based content
    return fallbackActivities[difficulty] || fallbackActivities.easy;
}

/**
 * Shuffle an array using a seeded PRNG (Fisher-Yates algorithm).
 * @param {Array} array - Array to shuffle
 * @param {SeededRandom} rng - Seeded random number generator
 * @returns {Array} New shuffled array (does not mutate original)
 */
function seededShuffle(array, rng) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

/**
 * Generate a deterministic set of EQ activities for a given page.
 * Activities are selected from the pool using seeded PRNG and their options
 * are shuffled deterministically. Each page gets a unique selection.
 *
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @param {string|number} age - Age value or age group string
 * @param {number} seed - Seed for deterministic generation
 * @param {number} page - Page number (1-based)
 * @returns {Array} Array of activity objects with shuffled options (includes answer)
 */
function generateActivitiesForPage(difficulty, age, seed, page) {
    // Normalize age to age group
    const ageGroup = AGE_TO_GROUP[String(age)] || String(age);
    const validAgeGroup = ageBasedEQScenarios[ageGroup] ? ageGroup : '6';

    // Get the activity pool
    const pool = getActivityPool(difficulty, validAgeGroup);

    // Create seeded RNG from composite seed
    const compositeSeed = hashCode(`eq-${difficulty}-${validAgeGroup}-${seed}-${page}`);
    const rng = new SeededRandom(compositeSeed);

    // Shuffle the pool to get a deterministic ordering for this page
    const shuffledPool = seededShuffle(pool, rng);

    // Select activities for this page. We cycle through the pool if needed
    // (for pages beyond what the pool can uniquely fill).
    // Each page gets all activities from the pool in a unique shuffled order.
    const activities = shuffledPool.map(activity => {
        // Deep copy the activity
        const copy = JSON.parse(JSON.stringify(activity));

        // Shuffle options deterministically
        copy.options = seededShuffle(copy.options, rng);

        return copy;
    });

    return activities;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get EQ questions for a page WITHOUT answers.
 * This is what gets sent to the client.
 *
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @param {string|number} age - Age value or age group string
 * @param {number} seed - Seed for deterministic generation
 * @param {number} page - Page number (1-based)
 * @returns {Array} Array of activity objects WITHOUT the `answer` field
 */
function getEQQuestions(difficulty, age, seed, page) {
    const activities = generateActivitiesForPage(difficulty, age, seed, page);

    // Strip answer field from each activity
    return activities.map(activity => {
        const { answer, ...withoutAnswer } = activity;
        return withoutAnswer;
    });
}

/**
 * Validate a user's EQ submission by regenerating the same questions
 * and comparing answers.
 *
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @param {string|number} age - Age value or age group string
 * @param {number} seed - Seed for deterministic generation
 * @param {number} page - Page number (1-based)
 * @param {Array<string>} userAnswers - Array of user answer strings, indexed by question
 * @returns {{ score: number, total: number, percentage: number, results: Array }}
 */
function validateEQSubmission(difficulty, age, seed, page, userAnswers) {
    const activities = generateActivitiesForPage(difficulty, age, seed, page);
    const total = activities.length;
    let score = 0;

    const results = activities.map((activity, index) => {
        const userAnswer = (userAnswers && userAnswers[index] != null)
            ? String(userAnswers[index]).trim()
            : '';
        const correctAnswer = activity.answer;

        // Case-insensitive, whitespace-normalized comparison
        const isCorrect = userAnswer.replace(/\s+/g, ' ').toLowerCase() ===
                          correctAnswer.replace(/\s+/g, ' ').toLowerCase();

        if (isCorrect) {
            score++;
        }

        return {
            questionIndex: index,
            correct: isCorrect,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer
        };
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
// EXPORTS
// ============================================================================

module.exports = {
    // Public API
    getEQQuestions,
    validateEQSubmission,

    // Internal (exported for testing)
    generateActivitiesForPage,
    getActivityPool,

    // Content banks (exported for testing/inspection)
    ageBasedEQScenarios,
    fallbackActivities,

    // Utilities
    SeededRandom,
    hashCode,
    seededShuffle,

    // Level mapping
    ageAndDifficultyToLevel,
    getAgeGroupFromAge
};
