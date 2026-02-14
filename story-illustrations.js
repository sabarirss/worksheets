// Real Image Illustrations for Stories using Picsum Photos
// This uses placeholder images that will load real photos

const imageKeywords = {
    'rabbit': 'rabbit,bunny,cute',
    'mouse': 'mouse,small,animal',
    'cat': 'cat,kitten,cute',
    'dog': 'dog,puppy,happy',
    'bird': 'bird,flying,nature',
    'squirrel': 'squirrel,nature,cute',
    'frog': 'frog,green,nature',
    'owl': 'owl,wise,bird',
    'bee': 'bee,flower,nature',
    'elephant': 'elephant,big,animal',
    'tree': 'tree,nature,forest',
    'sun': 'sun,sunny,bright',
    'moon': 'moon,night,sky',
    'star': 'stars,night,sky',
    'flower': 'flower,garden,colorful',
    'mountain': 'mountain,landscape,nature',
    'river': 'river,water,nature',
    'ocean': 'ocean,sea,water',
    'rain': 'rain,clouds,weather',
    'rainbow': 'rainbow,colorful,sky',
    'cloud': 'clouds,sky,nature',
    'garden': 'garden,flowers,nature',
    'forest': 'forest,trees,nature',
    'seed': 'seed,plant,growth',
    'house': 'house,home,cozy',
    'family': 'family,people,happy',
    'mother': 'mother,parent,love',
    'father': 'father,parent,family',
    'children': 'children,kids,playing',
    'baby': 'baby,cute,infant',
    'grandparents': 'elderly,grandparents,family',
    'book': 'book,reading,library',
    'school': 'school,classroom,education',
    'pencil': 'pencil,writing,school',
    'teacher': 'teacher,education,classroom',
    'friends': 'friends,children,playing',
    'playground': 'playground,children,fun',
    'rocket': 'rocket,space,stars',
    'pirate': 'pirate,ship,adventure',
    'treasure': 'treasure,gold,chest',
    'castle': 'castle,medieval,adventure',
    'boat': 'boat,sailing,water',
    'airplane': 'airplane,flying,sky',
    'train': 'train,railway,travel',
    'beach': 'beach,sand,ocean',
    'cave': 'cave,dark,adventure',
    'island': 'island,tropical,ocean',
    'desert': 'desert,sand,dunes',
    'jungle': 'jungle,tropical,trees',
    'space': 'space,stars,galaxy',
    'balloon': 'balloon,colorful,sky',
    'cookie': 'cookie,food,sweet',
    'apple': 'apple,fruit,healthy',
    'bedtime': 'bed,sleeping,cozy',
    'dream': 'dream,peaceful,night',
    'stars': 'stars,night,sky',
    'teddy': 'teddy,bear,toy',
    'blanket': 'blanket,cozy,comfort',
    'pillow': 'pillow,sleep,comfortable',
    'village': 'village,houses,peaceful',
    'sunrise': 'sunrise,morning,beautiful'
};

// Image filename mapping for local images
const storyImageMap = {
    // Format: keyword -> filename
    'rabbit': 'animal_01.png',
    'mouse': 'animal_02.png',
    'squirrel': 'animal_03.png',
    'bird': 'animal_04.png',
    'cat': 'animal_05.png',
    'frog': 'animal_06.png',
    'owl': 'animal_07.png',
    'cheetah': 'animal_08.png',
    'elephant': 'animal_09.png',
    'dog': 'animal_10.png',
    'parrot': 'animal_11.png',
    'bee': 'animal_12.png',
    'giraffe': 'animal_13.png',
    'ladybug': 'animal_14.png',
    'dolphin': 'animal_15.png',
    'spider': 'animal_16.png',
    'turtle': 'animal_17.png',
    'goose': 'animal_18.png',
    'crab': 'animal_19.png',
    'fox': 'animal_20.png',
    // You can add more mappings as you generate images
};

function getIllustration(keyword) {
    // Try to use local image if available
    const localImage = storyImageMap[keyword];
    if (localImage) {
        // Try local image first, fallback to placeholder
        return `<img src="images/stories/${localImage}"
                     alt="${keyword}"
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;"
                     onerror="this.src='https://via.placeholder.com/400x300/87CEEB/87CEEB?text=Generate+Image'" />`;
    }

    // Fallback to placeholder with message
    return `<img src="https://via.placeholder.com/400x300/87CEEB/FFFFFF?text=Generate+Image+for+${keyword}"
                 alt="${keyword}"
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;" />`;
}
