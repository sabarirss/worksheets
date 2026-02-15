// Age-Differentiated Emotional Quotient Content
// Emotional scenarios with age-appropriate complexity and themes

/**
 * Emotional complexity by age:
 * - Age 4-5: Basic emotions (happy, sad, angry, scared)
 * - Age 6: Adding surprised, excited, frustrated
 * - Age 7: Understanding others' feelings (empathy basics)
 * - Age 8: Complex emotions (disappointed, proud, jealous)
 * - Age 9+: Social situations (peer pressure, conflict resolution)
 * - Age 10+: Abstract emotions (anxiety, confidence, self-esteem)
 *
 * INTERNAL: Kept for future assessment system - use levelBasedEQScenarios for access
 */

const ageBasedEQScenarios = {
    '4-5': {
        easy: [
            {
                type: 'emotion-face',
                emoji: '😊',
                question: 'How does this face feel?',
                options: ['Happy', 'Sad', 'Angry'],
                answer: 'Happy'
            },
            {
                type: 'emotion-face',
                emoji: '😢',
                question: 'How does this face feel?',
                options: ['Happy', 'Sad', 'Sleepy'],
                answer: 'Sad'
            },
            {
                type: 'emotion-face',
                emoji: '😠',
                question: 'How does this face feel?',
                options: ['Happy', 'Sad', 'Angry'],
                answer: 'Angry'
            },
            {
                type: 'emotion-face',
                emoji: '😨',
                question: 'How does this face feel?',
                options: ['Scared', 'Happy', 'Sleepy'],
                answer: 'Scared'
            },
            {
                type: 'scenario',
                situation: '🎂',
                text: 'You get a birthday cake!',
                question: 'How do you feel?',
                options: ['Happy', 'Sad', 'Angry'],
                answer: 'Happy'
            },
            {
                type: 'scenario',
                situation: '🧸',
                text: 'Your toy is lost.',
                question: 'How do you feel?',
                options: ['Happy', 'Sad', 'Angry'],
                answer: 'Sad'
            },
            {
                type: 'empathy',
                situation: '😢',
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
                situation: '🎁',
                text: 'Someone gives you a surprise gift!',
                question: 'How do you feel?',
                options: ['Excited', 'Sad', 'Angry', 'Scared'],
                answer: 'Excited'
            },
            {
                type: 'scenario',
                situation: '🐕',
                text: 'A big dog barks at you.',
                question: 'How do you feel?',
                options: ['Scared', 'Happy', 'Excited', 'Tired'],
                answer: 'Scared'
            },
            {
                type: 'empathy',
                situation: '😊',
                text: 'Your friend won a game.',
                question: 'What should you say?',
                options: ['Good job!', 'I don\'t care', 'That\'s not fair'],
                answer: 'Good job!'
            }
        ],
        hard: [
            {
                type: 'scenario',
                situation: '🏃',
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
                emoji: '😊',
                question: 'What emotion is this person feeling?',
                options: ['Happy', 'Sad', 'Angry', 'Scared'],
                answer: 'Happy'
            },
            {
                type: 'emotion-face',
                emoji: '😮',
                question: 'This person looks...',
                options: ['Surprised', 'Angry', 'Sleepy', 'Sad'],
                answer: 'Surprised'
            },
            {
                type: 'scenario',
                situation: '🎈',
                text: 'You are going to a birthday party today!',
                question: 'How do you feel?',
                options: ['Excited', 'Sad', 'Angry', 'Tired'],
                answer: 'Excited'
            },
            {
                type: 'scenario',
                situation: '😤',
                text: 'You try to build something but it keeps falling down.',
                question: 'How might you feel?',
                options: ['Frustrated', 'Happy', 'Sleepy', 'Excited'],
                answer: 'Frustrated'
            },
            {
                type: 'empathy',
                situation: '😢',
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
                situation: '📝',
                text: 'You worked hard on your homework and got a star!',
                question: 'How do you feel?',
                options: ['Proud', 'Sad', 'Scared', 'Bored'],
                answer: 'Proud'
            },
            {
                type: 'empathy',
                situation: '😔',
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
                situation: '⚽',
                text: 'Your team lost the game even though you tried hard.',
                question: 'How might you feel?',
                options: ['Disappointed', 'Very happy', 'Don\'t care'],
                answer: 'Disappointed'
            },
            {
                type: 'empathy',
                situation: '🤐',
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
                emoji: '😰',
                question: 'Your friend makes this face before a test. They probably feel...',
                options: ['Worried', 'Happy', 'Excited', 'Sleepy'],
                answer: 'Worried'
            },
            {
                type: 'empathy',
                situation: '😢',
                text: 'Your friend forgot their lunch at home.',
                question: 'What should you do?',
                options: ['Offer to share yours', 'Eat in front of them', 'Tell everyone'],
                answer: 'Offer to share yours'
            },
            {
                type: 'scenario',
                situation: '🎭',
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
                situation: '🎨',
                text: 'Your friend worked hard on a drawing but it didn\'t turn out well.',
                question: 'What should you say?',
                options: ['You tried hard! Keep practicing', 'That looks bad', 'I can do better'],
                answer: 'You tried hard! Keep practicing'
            },
            {
                type: 'scenario',
                situation: '🥺',
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
                situation: '🤕',
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
                emoji: '😤',
                question: 'When someone makes this face, they are probably...',
                options: ['Frustrated', 'Happy', 'Surprised', 'Tired'],
                answer: 'Frustrated'
            },
            {
                type: 'scenario',
                situation: '🏆',
                text: 'You won first place in the art contest!',
                question: 'How do you feel?',
                options: ['Proud', 'Sad', 'Scared', 'Bored'],
                answer: 'Proud'
            },
            {
                type: 'empathy',
                situation: '😞',
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
                situation: '🎮',
                text: 'You want to play video games but your little brother wants you to play outside.',
                question: 'What shows good emotional intelligence?',
                options: ['Compromise - do both', 'Only do what you want', 'Get angry'],
                answer: 'Compromise - do both'
            },
            {
                type: 'empathy',
                situation: '😔',
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
                situation: '🏆',
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
                emoji: '😏',
                question: 'This expression shows confidence. What should you do if you feel this way?',
                options: ['Use it to do your best', 'Show off to others', 'Make fun of people'],
                answer: 'Use it to do your best'
            },
            {
                type: 'scenario',
                situation: '👥',
                text: 'Your two friends had a fight and both want you to take their side.',
                question: 'What should you do?',
                options: ['Listen to both and help them talk', 'Choose one side only', 'Ignore both'],
                answer: 'Listen to both and help them talk'
            },
            {
                type: 'empathy',
                situation: '😞',
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
                situation: '🎭',
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
                emoji: '🤔',
                question: 'When you feel confused about homework, what\'s the most helpful response?',
                options: ['Ask questions to understand better', 'Get angry', 'Give up immediately'],
                answer: 'Ask questions to understand better'
            },
            {
                type: 'scenario',
                situation: '😰',
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

// Convert age-based EQ scenarios to level-based structure
function buildLevelBasedEQScenarios() {
    const levelScenarios = {};

    for (const ageGroup in ageBasedEQScenarios) {
        for (const difficulty in ageBasedEQScenarios[ageGroup]) {
            const level = ageAndDifficultyToLevel(ageGroup, difficulty);
            const key = `level${level}`;

            const scenarios = ageBasedEQScenarios[ageGroup][difficulty];
            levelScenarios[key] = scenarios.map(scenario => ({
                ...scenario,
                level: level,
                ageEquivalent: ageGroup,
                difficultyEquivalent: difficulty
            }));
        }
    }
    return levelScenarios;
}

const levelBasedEQScenarios = buildLevelBasedEQScenarios();

// Helper functions for EQ scenario access
function getEQScenariosByLevel(level) {
    return levelBasedEQScenarios[`level${level}`] || [];
}

function getEQScenariosByAge(ageGroup, difficulty) {
    const level = ageAndDifficultyToLevel(ageGroup, difficulty);
    return getEQScenariosByLevel(level);
}

console.log('Level-based EQ content loaded - 12 levels available');

console.log('Age-based EQ content loaded');
