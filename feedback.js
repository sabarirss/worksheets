// Encouragement Text Rotation System
// Returns random encouraging phrases for correct/incorrect answers

const CORRECT_PHRASES = [
    'Awesome!', 'Great job!', 'You got it!', 'Well done!',
    'Brilliant!', 'Fantastic!', 'Super!', 'Perfect!',
    'Amazing!', 'Excellent!', 'You rock!', 'Way to go!',
    'Keep it up!', 'Nailed it!', 'Spot on!'
];

const INCORRECT_PHRASES = [
    'Almost there!', 'Nice try!', 'Keep going!', 'So close!',
    'Good effort!', 'Try again!', 'You can do it!', 'Don\'t give up!',
    'Almost got it!', 'Keep trying!'
];

function getEncouragement(isCorrect) {
    const phrases = isCorrect ? CORRECT_PHRASES : INCORRECT_PHRASES;
    return phrases[Math.floor(Math.random() * phrases.length)];
}
