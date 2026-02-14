// Story Time - 100 Stories for Kids

let currentCategory = null;
let currentDifficulty = null;
let currentStoryIndex = 0;
let currentStories = [];

// All 100 stories organized by category
const storyCollection = {
    animals: [
        {
            title: "The Helpful Rabbit",
            illustration: ["rabbit", "bird", "flower"],
            text: "Ruby the rabbit loved to help her friends. One day, she saw a little bird with a broken wing. Ruby brought soft leaves and berries to help the bird feel better. Soon, the bird could fly again! 'Thank you, Ruby!' chirped the bird. Ruby smiled, knowing that helping others makes everyone happy.",
            moral: "Helping others brings joy to everyone."
        },
        {
            title: "The Brave Little Mouse",
            illustration: "🐭🦁💪",
            text: "Tiny the mouse lived in a big forest. One day, he heard a loud roar. It was a lion stuck in a net! Even though Tiny was small, he nibbled through the ropes with his sharp teeth. The lion was free! 'You may be small, but you are very brave!' said the lion. They became best friends forever.",
            moral: "Even small friends can do big things."
        },
        {
            title: "The Sharing Squirrel",
            illustration: "🐿️🌰🍂",
            text: "Sammy Squirrel collected many acorns for winter. His friend Chipmunk had only a few. Sammy shared half of his acorns with Chipmunk. When winter came, they both had enough food. Chipmunk was so grateful! 'Sharing makes us both happy,' said Sammy with a warm smile.",
            moral: "Sharing with friends makes everyone happy."
        },
        {
            title: "The Singing Bird",
            illustration: "🐦🎵🌅",
            text: "Bella Bird loved to sing every morning. Her beautiful songs woke up all the animals. Some animals said she sang too early! But Bella kept singing anyway. One morning, a sad turtle heard her song and smiled for the first time. 'Your song makes me happy,' said the turtle. Bella was glad she never stopped singing.",
            moral: "Your talents can brighten someone's day."
        },
        {
            title: "The Curious Cat",
            illustration: "🐱🔍🏠",
            text: "Kitty the cat loved to explore. One day, she climbed too high in a tree and couldn't get down. She meowed loudly. Her friends heard her and brought a ladder. They helped her climb down safely. 'I learned to be more careful,' said Kitty. 'And we learned to help each other,' her friends replied.",
            moral: "It's okay to be curious, but always be safe."
        },
        {
            title: "The Friendly Frog",
            illustration: "🐸🪰🌿",
            text: "Freddy Frog was always friendly to everyone. He said hello to the fish, the dragonflies, and even the snails. One day, he felt lonely. But then, all his friends came to play with him! They had a big party by the pond. 'Being friendly brings many friends,' thought Freddy happily.",
            moral: "Kindness brings friends."
        },
        {
            title: "The Wise Old Owl",
            illustration: "🦉📚🌙",
            text: "Oliver Owl knew many things. Young animals came to ask him questions. 'How do birds fly?' asked one. 'Why is the sky blue?' asked another. Oliver answered patiently. 'Learning is a wonderful adventure,' he told them. All the young animals loved to learn from wise Oliver.",
            moral: "Learning from others makes us wise."
        },
        {
            title: "The Fast Cheetah",
            illustration: "🐆💨🏃",
            text: "Dash the cheetah was the fastest animal in the savanna. He always won races. One day, he raced his friend Tortoise. Dash ran ahead but stopped to rest. Tortoise walked slowly but never stopped. Tortoise won! Dash learned that going slow and steady can be just as good as being fast.",
            moral: "Slow and steady wins the race."
        },
        {
            title: "The Kind Elephant",
            illustration: "🐘💧🌾",
            text: "Ellie the elephant had a long trunk. During a dry season, she used her trunk to find water deep underground. She shared the water with all the thirsty animals. The zebras, giraffes, and monkeys were so thankful! 'You saved us all,' they said. Ellie was happy to help her friends.",
            moral: "Using your abilities to help others is wonderful."
        },
        {
            title: "The Playful Puppy",
            illustration: "🐶🎾🌈",
            text: "Max the puppy loved to play fetch. Every day he asked his owner to throw the ball. Sometimes his owner was too busy. Max learned to wait patiently. When it was playtime, Max was so happy! 'Good things come to those who wait,' said his owner, rubbing Max's head.",
            moral: "Patience brings good things."
        },
        {
            title: "The Colorful Parrot",
            illustration: "🦜🌺🎨",
            text: "Polly the parrot had beautiful rainbow feathers. She loved to look at herself in the pond. One day, she met a plain brown bird who looked sad. 'I wish I had pretty feathers like you,' said the bird. Polly said, 'Your singing voice is beautiful! Everyone is special in their own way.'",
            moral: "Everyone is special and unique."
        },
        {
            title: "The Hardworking Bee",
            illustration: "🐝🌻🍯",
            text: "Buzzy the bee worked hard every day, collecting nectar from flowers. Her friends said, 'Take a break!' But Buzzy kept working. By the end of summer, she had made lots of honey. She shared it with all her friends. 'Hard work pays off!' she said happily.",
            moral: "Hard work brings sweet rewards."
        },
        {
            title: "The Gentle Giant",
            illustration: "🦒🌳🦋",
            text: "Gary the giraffe was very tall. Little animals were sometimes afraid of him. But Gary was very gentle. He helped birds reach high nests and picked fruit from tall trees for his friends. Soon, everyone loved Gary. 'Being big doesn't mean being scary,' Gary smiled.",
            moral: "Gentleness is more important than size."
        },
        {
            title: "The Lucky Ladybug",
            illustration: "🐞🍀✨",
            text: "Lucy the ladybug had seven spots. She thought they brought good luck. Whenever she saw a friend in trouble, she helped them. 'You're our lucky friend!' they said. Lucy realized that making her own luck by being helpful was the best luck of all.",
            moral: "We make our own luck by helping others."
        },
        {
            title: "The Dancing Dolphin",
            illustration: "🐬🌊💃",
            text: "Dolly the dolphin loved to dance in the waves. She leaped and spun, making everyone happy. One day, a whale felt sad. Dolly danced for the whale, and soon the whale was smiling! 'Your dancing brings joy!' said the whale. Dolly danced even more.",
            moral: "Expressing yourself can bring joy to others."
        },
        {
            title: "The Patient Spider",
            illustration: "🕷️🕸️⏰",
            text: "Spinner the spider worked on her web all day. It took many hours. Some flies laughed at her slow work. But when Spinner finished, she had the most beautiful web in the garden! 'Good work takes time,' she said proudly.",
            moral: "Good things take time and patience."
        },
        {
            title: "The Truthful Turtle",
            illustration: "🐢💎🌟",
            text: "Tommy Turtle always told the truth, even when it was hard. One day, he accidentally broke his friend's toy. Tommy told the truth and said sorry. His friend forgave him. 'I trust you because you always tell the truth,' said his friend. Tommy learned that honesty is important.",
            moral: "Honesty builds trust with friends."
        },
        {
            title: "The Grateful Goose",
            illustration: "🦆🙏💝",
            text: "Greta Goose always said 'thank you.' When someone helped her, she never forgot. She thanked the farmer for food, the pond for water, and her friends for playing. Everyone loved Greta because she was so grateful. 'Thank you for being kind,' they all said back.",
            moral: "Saying thank you makes everyone feel good."
        },
        {
            title: "The Creative Crab",
            illustration: "🦀🏖️🎨",
            text: "Carl the crab loved to build sandcastles on the beach. He made towers, bridges, and gardens. Other animals came to see his creations. 'You're so creative!' they said. Carl taught them how to build too. Soon, the whole beach was full of beautiful sandcastles!",
            moral: "Sharing your creativity inspires others."
        },
        {
            title: "The Forgiving Fox",
            illustration: "🦊❤️🤝",
            text: "Fiona Fox was playing when a raccoon accidentally knocked over her berries. The raccoon said sorry. Fiona smiled and said, 'It's okay, accidents happen.' They picked up the berries together and became friends. 'Forgiving feels better than being angry,' thought Fiona.",
            moral: "Forgiving others helps everyone feel better."
        }
    ],

    nature: [
        {
            title: "The Little Seed",
            illustration: "🌱☀️💧",
            text: "A tiny seed was planted in the ground. It was dark and lonely. But the seed was patient. Rain came and sun shone. Slowly, the seed grew roots, then a stem, then leaves. One day, it became a beautiful flower! 'I grew by being patient,' smiled the flower.",
            moral: "Growth takes time and patience."
        },
        {
            title: "The Rainy Day",
            illustration: "🌧️☂️🌈",
            text: "Tommy didn't want to go outside because it was raining. But Mom said, 'Rain helps the flowers grow!' They put on raincoats and jumped in puddles. After the rain stopped, they saw a beautiful rainbow. 'Rain can be fun!' laughed Tommy.",
            moral: "Every weather brings its own joy."
        },
        {
            title: "The Four Seasons",
            illustration: "🌸🌞🍂❄️",
            text: "A wise tree lived through all four seasons. In spring, it grew green leaves. In summer, it gave cool shade. In fall, its leaves turned golden. In winter, it rested under snow. The tree loved all seasons because each one was special and beautiful.",
            moral: "Every season has its own beauty."
        },
        {
            title: "The Busy Bees",
            illustration: "🐝🌼🏠",
            text: "The bees worked together to build their hive. Each bee had a job. Some collected nectar, some made honey, and some guarded the hive. By working together, they made a perfect home. 'Teamwork makes everything easier!' buzzed the queen bee.",
            moral: "Working together achieves great things."
        },
        {
            title: "The Tall Mountain",
            illustration: "⛰️🥾🎯",
            text: "Little Lily wanted to climb the big mountain. It looked very tall! She started climbing step by step. Sometimes she got tired and rested. But she never gave up. Finally, she reached the top! 'I did it!' she cheered. The view was amazing.",
            moral: "Keep trying and you'll reach your goals."
        },
        {
            title: "The Flowing River",
            illustration: "🌊🚣🏞️",
            text: "River never stopped flowing. It went around rocks, under bridges, and through valleys. Nothing could stop River from reaching the ocean. 'Being flexible helps me go far,' River whispered. All the fish agreed as they swam along.",
            moral: "Flexibility helps us reach our goals."
        },
        {
            title: "The Friendly Sun",
            illustration: "☀️🌏😊",
            text: "The Sun shone brightly every day. It woke up the flowers, warmed the earth, and helped plants grow. Even on cloudy days, the Sun was still there behind the clouds. 'I'm always here to help,' smiled the Sun warmly.",
            moral: "Consistent kindness makes a difference."
        },
        {
            title: "The Dancing Leaves",
            illustration: "🍃💨🎵",
            text: "When autumn came, the leaves changed colors. Red, orange, yellow, and brown! The wind made them dance through the air. They twirled and spun before falling gently to the ground. 'Change can be beautiful!' they sang as they danced.",
            moral: "Change brings new beauty."
        },
        {
            title: "The Strong Oak Tree",
            illustration: "🌳💪🏠",
            text: "The old oak tree stood tall through all kinds of weather. Storms came but couldn't knock it down. Its deep roots held it strong. Birds built nests in its branches. Squirrels lived in its trunk. 'Being strong helps me help others,' said the oak tree.",
            moral: "Strength allows us to support others."
        },
        {
            title: "The Curious Cloud",
            illustration: "☁️🌍✈️",
            text: "Cloudina the cloud loved to travel across the sky. She saw mountains, oceans, and cities. She brought rain to dry gardens and shade on hot days. 'Traveling teaches me so much!' she said. Every day was a new adventure for Cloudina.",
            moral: "Exploring the world teaches us new things."
        },
        {
            title: "The Peaceful Pond",
            illustration: "🏞️🦆💙",
            text: "Pond was a quiet, peaceful place. Ducks swam on her surface. Fish lived in her water. Frogs sang on her banks. Everyone loved Pond because she was so calm and peaceful. 'Being calm helps everyone around me feel peaceful too,' thought Pond.",
            moral: "Calmness brings peace to others."
        },
        {
            title: "The Helpful Rain",
            illustration: "🌧️🌾🌻",
            text: "Rain came to visit the dry garden. The flowers were thirsty and wilting. Rain gently watered them all. The next day, the garden was blooming and beautiful! The flowers thanked Rain. 'I'm always happy to help,' said Rain kindly.",
            moral: "Helping others makes the world beautiful."
        },
        {
            title: "The Glowing Firefly",
            illustration: "✨🌙🦗",
            text: "Glow the firefly was tiny, but her light was bright. On dark nights, she helped lost bugs find their way home. 'Even though I'm small, my light makes a difference,' she thought proudly. All the night creatures thanked her.",
            moral: "Even small lights can brighten the darkness."
        },
        {
            title: "The Recycling Adventure",
            illustration: "♻️🌍💚",
            text: "Emma learned about recycling at school. She taught her family to sort paper, plastic, and glass. They put them in different bins. 'We're helping the Earth!' said Emma. Her family was proud of her. Together, they made their neighborhood cleaner.",
            moral: "Taking care of Earth is everyone's job."
        },
        {
            title: "The Garden Party",
            illustration: "🌺🦋🐝",
            text: "A beautiful garden invited everyone to visit. Butterflies danced on flowers. Bees collected nectar. Birds sang in the trees. The sun shone warmly. Everyone had a wonderful time! 'Nature is a gift we all share,' whispered the flowers in the breeze.",
            moral: "Nature's beauty is for everyone to enjoy."
        }
    ],

    family: [
        {
            title: "Mom's Special Cookies",
            illustration: "🍪👩‍🍳❤️",
            text: "Mom was baking cookies. Emma wanted to help. Mom showed her how to mix, roll, and cut shapes. They made stars, hearts, and circles! When Dad came home, they all ate warm cookies together. 'Cooking together is fun!' said Emma, hugging Mom.",
            moral: "Doing things together makes them more special."
        },
        {
            title: "Dad's Bedtime Story",
            illustration: "📖👨‍👧🌙",
            text: "Every night, Dad read bedtime stories to Mia. Tonight she picked a story about a princess. Dad used funny voices for each character. Mia giggled and felt so happy and safe. 'I love our story time, Dad,' she said, yawning. Dad kissed her goodnight.",
            moral: "Special routines create loving memories."
        },
        {
            title: "Big Brother's Help",
            illustration: "👦🤝👶",
            text: "Jake's little sister was learning to walk. She kept falling down. Jake held her hand and helped her take steps. After many tries, she walked all by herself! She clapped her hands happily. 'Good job!' said Jake proudly. Mom hugged them both.",
            moral: "Helping family members makes everyone proud."
        },
        {
            title: "Grandma's Wise Words",
            illustration: "👵💭✨",
            text: "Sophie felt sad because she lost her toy. Grandma sat with her and said, 'Sometimes we lose things, but we still have what matters most - family and love.' Sophie understood. She hugged Grandma tight. 'You always make me feel better,' said Sophie.",
            moral: "Love is more important than things."
        },
        {
            title: "Family Picnic Day",
            illustration: "🧺🌳👨‍👩‍👧",
            text: "The family went to the park for a picnic. They brought sandwiches, fruit, and lemonade. They played frisbee and flew a kite. Everyone laughed and had fun. 'This is the best day!' said Timmy. They took a family photo to remember it forever.",
            moral: "Time with family creates happy memories."
        },
        {
            title: "Sister's Birthday Surprise",
            illustration: "🎂🎁👧",
            text: "It was Lily's birthday. Her brother Ben saved his allowance to buy her a present. He wrapped it carefully with colorful paper. Lily opened it and found a book she wanted! 'You're the best brother!' she said, hugging him. Ben felt happy seeing her smile.",
            moral: "Giving to others brings joy."
        },
        {
            title: "Pet Adoption Day",
            illustration: "🐕🏠❤️",
            text: "The family went to adopt a pet. They saw many animals. A small puppy wagged his tail at them. 'This one!' said Anna. They named him Lucky. Everyone took turns caring for Lucky. He became part of the family. 'Pets teach us responsibility,' said Dad.",
            moral: "Caring for pets teaches responsibility and love."
        },
        {
            title: "Homework Helper",
            illustration: "📝👦👨",
            text: "Matt was stuck on his math homework. He felt frustrated. His dad sat with him and explained it patiently. They worked through the problems together. Finally, Matt understood! 'Thanks, Dad! You're a great teacher,' said Matt. They high-fived.",
            moral: "Asking for help is smart."
        },
        {
            title: "Sunday Morning Pancakes",
            illustration: "🥞👨‍👩‍👧‍👦☀️",
            text: "Every Sunday, the family made pancakes together. Mom mixed batter. Dad cooked them. Kids set the table. They added syrup, berries, and whipped cream! Everyone sat together and talked about their week. 'Sunday pancakes are my favorite,' said Lucy.",
            moral: "Family traditions bring us closer."
        },
        {
            title: "The Moving Day",
            illustration: "📦🏡👨‍👩‍👧",
            text: "Sam's family was moving to a new house. Sam felt nervous about leaving. Mom said, 'Home is where family is together.' They packed boxes, said goodbye, and drove to their new house. Sam helped unpack. Soon, the new house felt like home too.",
            moral: "Family makes any place feel like home."
        },
        {
            title: "Grandpa's Garden",
            illustration: "🌻👴🥕",
            text: "Grandpa taught Emma how to garden. They planted seeds, watered them, and pulled weeds. Weeks later, vegetables grew! They picked tomatoes, carrots, and lettuce. 'Gardening teaches patience,' said Grandpa. Emma was proud of their harvest.",
            moral: "Learning from elders is valuable."
        },
        {
            title: "Rainy Day Fort",
            illustration: "🏰☔👧👦",
            text: "It was raining outside. Siblings Anna and Tom couldn't play outdoors. They used blankets, pillows, and chairs to build a fort in the living room! They read books and told stories inside. 'This is our special castle!' they laughed together.",
            moral: "Creativity makes any day fun."
        },
        {
            title: "Mom's Sick Day",
            illustration: "😷🛏️❤️",
            text: "Mom wasn't feeling well. She stayed in bed. Kids made her soup, brought her tea, and drew get-well cards. Dad helped them clean the house. Mom smiled at their kindness. 'You're taking such good care of me,' she said warmly.",
            moral: "Families take care of each other."
        },
        {
            title: "The Family Meeting",
            illustration: "👨‍👩‍👧‍👦💬🪑",
            text: "The family had different ideas about vacation. Dad wanted beach, Mom wanted mountains, kids wanted theme park. They talked and listened to each other. Finally, they decided to spend time at each place! 'Compromise makes everyone happy,' said Mom.",
            moral: "Listening and compromising helps families."
        },
        {
            title: "New Baby Arrival",
            illustration: "👶🎉❤️",
            text: "A new baby joined the family. Big sister Maya was excited! She helped change diapers, sang lullabies, and kissed the baby's tiny hand. 'I'm a big sister now!' Maya said proudly. The whole family grew to include one more person to love.",
            moral: "Families grow with love."
        },
        {
            title: "Phone Call to Grandma",
            illustration: "📞👵💕",
            text: "Every week, Jake called Grandma who lived far away. They talked about school, friends, and hobbies. Grandma told stories from when she was young. Even though they were far apart, they felt close. 'I love our talks!' said Jake.",
            moral: "Staying connected keeps families close."
        },
        {
            title: "Dad's Day at School",
            illustration: "👨‍👧🏫📚",
            text: "Dad visited Emma's school for career day. He talked about his job and answered questions. Emma felt so proud! Her friends said, 'Your dad is cool!' Dad was happy to be part of Emma's school life. They walked home holding hands.",
            moral: "Being involved shows love and support."
        },
        {
            title: "The Lost Toy",
            illustration: "🧸❓🔍",
            text: "Timmy couldn't find his favorite teddy bear. He looked everywhere! The whole family helped search. Mom found it under the couch. 'Thank you for helping!' said Timmy happily. 'That's what families do,' smiled Dad.",
            moral: "Families help each other solve problems."
        },
        {
            title: "Cooking Dad's Recipe",
            illustration: "🍝👨‍🍳👧",
            text: "Dad taught Mia his special pasta recipe. They chopped vegetables, cooked sauce, and boiled noodles. Mia stirred carefully. When they served dinner, everyone loved it! 'This recipe is now yours too,' said Dad. Mia felt like a real chef.",
            moral: "Passing down traditions connects generations."
        },
        {
            title: "Family Photo Album",
            illustration: "📸👨‍👩‍👧‍👦📔",
            text: "Grandma showed kids the family photo album. There were pictures of when Mom and Dad were little! Kids giggled at the funny clothes and hairstyles. 'Everyone grows and changes,' said Grandma. 'But family love stays the same.' Kids hugged her tight.",
            moral: "Family memories are treasures."
        }
    ],

    adventures: [
        {
            title: "The Pirate's Treasure",
            illustration: "🏴‍☠️💎🗺️",
            text: "Captain Sam found an old treasure map. It showed an island with buried gold! Sam sailed across the sea, climbed a mountain, and dug under a palm tree. There was the treasure! But Sam shared it with his crew. 'Sharing treasure makes everyone rich!' he said.",
            moral: "Sharing makes everyone happy."
        },
        {
            title: "Space Explorer",
            illustration: "🚀🌙⭐",
            text: "Astronaut Amy blasted off into space! She flew past the moon, waved at Mars, and counted stars. She took photos of Earth from far away. 'Our planet is so beautiful!' she thought. Amy couldn't wait to come home and tell everyone about her adventure.",
            moral: "Exploring teaches us to appreciate home."
        },
        {
            title: "The Magic Carpet Ride",
            illustration: "🧞✨🕌",
            text: "Ali found a magic carpet in the attic. When he sat on it, the carpet began to fly! They soared over cities, mountains, and oceans. Ali saw the whole world from above. When he came home, he had amazing stories to tell. 'Dreams can take you anywhere!' he said.",
            moral: "Imagination takes you on great adventures."
        },
        {
            title: "Jungle Explorer",
            illustration: "🌴🦁🔍",
            text: "Explorer Emma ventured deep into the jungle. She saw monkeys swinging, parrots flying, and tigers sleeping. She took notes and drew pictures of everything. Emma was brave but careful. She learned so much! 'The jungle is full of wonders,' she wrote in her journal.",
            moral: "Curiosity leads to discovery."
        },
        {
            title: "The Underwater Adventure",
            illustration: "🤿🐠🐙",
            text: "Diver Dan explored the ocean depths. He saw colorful fish, dancing jellyfish, and a friendly octopus! The coral reef was like an underwater rainbow. Dan took pictures to show his friends. 'The ocean is a magical place,' he thought, swimming alongside a sea turtle.",
            moral: "Nature's wonders are everywhere."
        },
        {
            title: "Mountain Climber",
            illustration: "🏔️🧗⛷️",
            text: "Maya decided to climb the tallest mountain. The journey was hard and cold. Sometimes she wanted to give up. But she kept going, step by step. Finally, she reached the top! The view was incredible. 'I did it!' she cheered. Nothing could stop Maya now.",
            moral: "Perseverance leads to success."
        },
        {
            title: "The Time Machine",
            illustration: "⏰🦕🏰",
            text: "Tim invented a time machine. First, he visited dinosaurs! Then he saw knights in castles. He met ancient Egyptians building pyramids. Every time period taught him something new. When he returned home, Tim appreciated his own time even more.",
            moral: "Learning history helps us appreciate today."
        },
        {
            title: "Desert Journey",
            illustration: "🐪🏜️☀️",
            text: "Camel and rider crossed the vast desert. The sun was hot and sand stretched everywhere. They traveled for days, following the stars at night. Finally, they reached an oasis! Fresh water and shade felt wonderful. 'We made it by not giving up,' said the rider.",
            moral: "Determination helps us reach our destination."
        },
        {
            title: "The Mysterious Cave",
            illustration: "🦇🕯️💎",
            text: "Explorer Tom found a cave no one had entered before. With his flashlight, he went inside carefully. He saw beautiful crystals and ancient paintings on walls! Tom took pictures but left everything as he found it. 'I'll share this discovery with scientists,' he decided.",
            moral: "Respect and preserve what you discover."
        },
        {
            title: "Sailing Adventure",
            illustration: "⛵🌊🐬",
            text: "Captain Lucy sailed her boat across the ocean. Dolphins swam alongside, and seagulls flew above. A storm came, but Lucy stayed calm and steered safely through it. When she reached the island, she felt proud. 'I can handle any challenge!' she smiled.",
            moral: "Stay calm and brave during challenges."
        },
        {
            title: "Hot Air Balloon Ride",
            illustration: "🎈🌤️🏞️",
            text: "Ben's hot air balloon lifted into the sky. He floated over forests, rivers, and villages. Everything looked tiny from up high! The wind carried him gently. Ben waved to people below. 'The world is so big and beautiful!' he thought happily.",
            moral: "New perspectives show us beauty."
        },
        {
            title: "Train Journey",
            illustration: "🚂🌄🎫",
            text: "Sophie took a train across the country. She watched fields, mountains, and cities pass by her window. She met new friends and heard interesting stories. At every stop, Sophie saw something new. 'Traveling opens your mind,' she wrote to her family.",
            moral: "Traveling teaches us about the world."
        },
        {
            title: "The Enchanted Forest",
            illustration: "🌲✨🧚",
            text: "Lily entered a magical forest. Trees sparkled, flowers glowed, and friendly fairies danced around her. They taught her to listen to nature's songs. When Lily left, she could still hear the magic in regular forests. 'Magic is everywhere if you look for it,' she realized.",
            moral: "Wonder and magic are all around us."
        },
        {
            title: "Arctic Explorer",
            illustration: "🐧❄️🏔️",
            text: "Alex traveled to the Arctic. He saw polar bears, penguins, and huge icebergs. It was very cold, but so beautiful! He learned how animals survive in the ice. 'Nature adapts in amazing ways,' Alex discovered. He took photos to teach others.",
            moral: "Nature is adaptable and amazing."
        },
        {
            title: "The Bicycle Journey",
            illustration: "🚲🌎🏞️",
            text: "Jamie rode his bicycle for miles and miles. He passed through towns, over bridges, and up hills. His legs got tired, but he kept pedaling. At sunset, Jamie reached his destination. 'The journey was the best part!' he realized, feeling accomplished.",
            moral: "The journey is as important as the destination."
        }
    ],

    learning: [
        {
            title: "First Day of School",
            illustration: "🏫📚👧",
            text: "Emma was nervous about her first day of school. She met her teacher Miss Green, who smiled warmly. Emma made new friends and learned to write her name. By the end of the day, she didn't want to leave! 'School is fun!' she told her mom excitedly.",
            moral: "New experiences can be wonderful."
        },
        {
            title: "Learning to Read",
            illustration: "📖👦💡",
            text: "Jack practiced reading every day. Some words were hard, but he kept trying. His teacher and parents helped him. One day, Jack read a whole book by himself! He was so proud. 'Reading opens up new worlds,' said his teacher.",
            moral: "Practice makes perfect."
        },
        {
            title: "The Science Experiment",
            illustration: "🔬🧪✨",
            text: "Maya's class did a science experiment. They mixed baking soda and vinegar. It fizzed and bubbled! Everyone was amazed. They learned about chemical reactions. 'Science is like magic, but it's real!' said Maya. She wanted to be a scientist when she grew up.",
            moral: "Learning makes the world fascinating."
        },
        {
            title: "The Math Challenge",
            illustration: "🔢🏆🤔",
            text: "Leo found math difficult. His friend helped him understand. They practiced together every day. When test day came, Leo tried his best. He got a good grade! 'I can do hard things when I work hard,' Leo learned. His confidence grew.",
            moral: "Persistence and help lead to success."
        },
        {
            title: "Art Class Masterpiece",
            illustration: "🎨🖼️😊",
            text: "Sarah painted a picture in art class. She mixed colors and used different brushes. Her painting didn't look like her friend's, but it was special in its own way. The teacher hung it on the wall. 'Your art is unique and beautiful,' said the teacher.",
            moral: "Everyone's creativity is valuable."
        },
        {
            title: "The Library Adventure",
            illustration: "📚🏛️🔍",
            text: "Tom visited the library for the first time. There were thousands of books! The librarian helped him find stories about dragons. Tom borrowed three books. He read them all and came back for more. 'Libraries are treasure chests of stories!' he said.",
            moral: "Books open doors to new worlds."
        },
        {
            title: "Learning to Share",
            illustration: "👧👦🖍️",
            text: "Emma had new crayons. Her friend forgot his. At first, Emma didn't want to share. Then she saw her friend looked sad. Emma shared her crayons. They colored together and made beautiful pictures. 'Sharing makes more fun!' Emma realized.",
            moral: "Sharing makes everyone happy."
        },
        {
            title: "The Spelling Bee",
            illustration: "🐝📝🏆",
            text: "Olivia practiced spelling words for weeks. She studied hard. At the spelling bee, she spelled every word correctly! Olivia won first place. She was proud of her hard work. 'Preparation leads to success,' her parents said, hugging her.",
            moral: "Hard work brings success."
        },
        {
            title: "Music Lesson",
            illustration: "🎵🎹🎶",
            text: "Ben started piano lessons. At first, his fingers felt clumsy on the keys. But his teacher was patient. Ben practiced every day. After weeks, he could play a whole song! His family clapped and cheered. 'Learning takes time, but it's worth it!' Ben smiled.",
            moral: "Patience and practice lead to achievement."
        },
        {
            title: "The History Project",
            illustration: "📜🏛️🎓",
            text: "Class studied ancient Egypt. Students made pyramids, drew hieroglyphics, and dressed as pharaohs. Amy learned about mummies and the Nile River. History came alive! 'The past is interesting and teaches us lessons,' said Amy. She loved learning about different times.",
            moral: "History teaches us valuable lessons."
        },
        {
            title: "Learning Kindness",
            illustration: "❤️🤝😊",
            text: "Teacher read a story about kindness. She asked students to do one kind act each day. Sam helped a friend with homework. Lucy shared her snack. Tim picked up trash. The classroom felt happier. 'Kindness makes our world better,' the teacher said.",
            moral: "Small acts of kindness matter."
        },
        {
            title: "The Geography Game",
            illustration: "🌍🗺️✈️",
            text: "Class learned about different countries. They found them on a map and learned fun facts. Max learned about Japan, Lucy about Brazil, Sam about Kenya. 'Our world has so many amazing places!' said Max. Everyone wanted to travel someday.",
            moral: "Learning about the world expands our minds."
        },
        {
            title: "Physical Education Fun",
            illustration: "⚽🏃🤸",
            text: "In P.E. class, kids played soccer. Everyone got to play, not just the best players. They practiced teamwork and passing the ball. Win or lose, they had fun together. 'Playing together is more important than winning,' said the coach.",
            moral: "Teamwork and fun matter more than winning."
        },
        {
            title: "The Writing Workshop",
            illustration: "✍️📓💭",
            text: "Students wrote their own stories. Emma wrote about a flying cat. Ben wrote about a robot friend. They shared stories with the class. Everyone's story was different and creative. 'Your imagination is powerful!' said the teacher proudly.",
            moral: "Creative expression is valuable."
        },
        {
            title: "Learning Responsibility",
            illustration: "📋✅🎒",
            text: "Mr. Smith gave students classroom jobs. Lucy watered plants. Tom erased the board. Sam organized books. They learned to be responsible. When everyone did their job, the classroom was nice. 'Responsibility helps everyone,' said Mr. Smith.",
            moral: "Being responsible helps the community."
        }
    ],

    bedtime: [
        {
            title: "The Sleepy Moon",
            illustration: "🌙💤⭐",
            text: "The Moon yawned at the end of a long night. She had watched over everyone while they slept. Now the sun was coming, and it was her turn to rest. 'Sweet dreams, Moon,' whispered the stars. The Moon closed her eyes and drifted off to sleep.",
            moral: "Everyone needs rest."
        },
        {
            title: "Teddy's Dream",
            illustration: "🧸💭☁️",
            text: "Teddy Bear sat on Emma's bed. When Emma fell asleep, Teddy had adventures in her dreams. He flew through clouds, sailed on rainbows, and danced with stars. When Emma woke up, Teddy was right there, keeping her safe. 'Teddy always protects my dreams,' thought Emma.",
            moral: "Love keeps us safe."
        },
        {
            title: "The Dream Fairy",
            illustration: "🧚✨🌟",
            text: "Every night, the Dream Fairy visited sleeping children. She sprinkled magic dust that gave them happy dreams. Children dreamed of adventures, playing with friends, and magical places. When they woke up, they felt rested and happy. 'Sweet dreams, little ones,' whispered the fairy.",
            moral: "Good dreams make good rest."
        },
        {
            title: "Stars' Lullaby",
            illustration: "⭐🎵🌌",
            text: "As night fell, the stars came out and sang a soft lullaby. Their song was gentle and peaceful. All the world grew quiet. Animals, people, and even trees rested. The stars sang until morning came. 'Sleep well, dear world,' they twinkled softly.",
            moral: "Peace brings rest."
        },
        {
            title: "The Cozy Blanket",
            illustration: "🛏️🧸❤️",
            text: "Sophie had a special blanket that Grandma made. It was soft and warm. Every night, Sophie wrapped herself in it. The blanket felt like a big hug. Sophie felt safe and loved. She dreamed happy dreams all night long.",
            moral: "Love surrounds and comforts us."
        },
        {
            title: "The Night Owl's Story",
            illustration: "🦉📚🌙",
            text: "Oliver Owl stayed awake while others slept. He read books and watched over the forest. He made sure everyone was safe. Oliver loved the quiet night. 'The night is peaceful and beautiful,' he hooted softly. At dawn, Oliver rested.",
            moral: "Everyone has their own rhythm."
        },
        {
            title: "Counting Sheep",
            illustration: "🐑💤💭",
            text: "Tom couldn't sleep. Mom told him to count sheep jumping over a fence. One sheep, two sheep, three sheep... Tom imagined fluffy white sheep bouncing happily. By the time he reached ten sheep, Tom's eyes were closing. Soon he was fast asleep.",
            moral: "Calm thoughts help us sleep."
        },
        {
            title: "The Snoring Dragon",
            illustration: "🐉💤🏰",
            text: "Deep in a cave lived a friendly dragon. Every night, he snored so loudly that the ground shook! But the village people didn't mind. The dragon's snoring meant everyone was safe. 'The dragon guards us while we sleep,' they said thankfully.",
            moral: "Protectors watch over us."
        },
        {
            title: "Midnight Garden",
            illustration: "🌺🦋🌙",
            text: "At midnight, a secret garden came alive. Flowers glowed softly, and fireflies danced. Night-blooming plants opened their petals. Animals visited quietly. By morning, the garden looked normal again. Only the Moon knew the garden's secret.",
            moral: "Magic exists in quiet moments."
        },
        {
            title: "The Sleepy Train",
            illustration: "🚂💤🌃",
            text: "The train worked hard all day carrying people. At night, it rested in the station. The conductor tucked it in and said goodnight. The train dreamed of tracks and adventures. In the morning, it woke up ready for a new day.",
            moral: "Rest prepares us for new days."
        },
        {
            title: "Pillow Cloud",
            illustration: "☁️😴💭",
            text: "Mia's pillow was soft like a cloud. When she laid her head down, she felt like she was floating in the sky. Her pillow carried her through dream adventures. She flew over rainbows and through starry skies. 'My pillow is magical,' Mia thought sleepily.",
            moral: "Comfort helps us dream."
        },
        {
            title: "The Lighthouse Keeper",
            illustration: "🗼💡🌊",
            text: "The lighthouse keeper stayed awake all night. His light guided ships safely to shore. Even when he was tired, he kept the light burning. Sailors were grateful. 'Thank you for keeping us safe,' they said. The keeper smiled, knowing he helped others.",
            moral: "Dedication helps others."
        },
        {
            title: "Nighttime Prayer",
            illustration: "🙏✨😌",
            text: "Before bed, Anna said a little prayer. She thanked for her family, friends, and toys. She asked for protection and peace. Saying her prayer made Anna feel calm and loved. She fell asleep feeling grateful and safe.",
            moral: "Gratitude brings peace."
        },
        {
            title: "The Sleepy Village",
            illustration: "🏘️🌙💤",
            text: "When night came, the whole village went to sleep. Lights turned off one by one. Dogs curled up. Cats found cozy spots. The village was peaceful and quiet. Everyone rested together. In the morning, they woke up refreshed and happy.",
            moral: "Community rests together."
        },
        {
            title: "Tomorrow's Promise",
            illustration: "🌅💭😊",
            text: "As Leo closed his eyes, Mom said, 'Tomorrow is a new day full of possibilities!' Leo thought about all the fun things he might do tomorrow. He felt excited and peaceful. 'I can't wait!' he thought, drifting off to sleep with a smile.",
            moral: "Tomorrow brings new opportunities."
        }
    ]
};

// Difficulty classification helper
function getStoryDifficulty(story) {
    // Classify by text length and complexity
    const wordCount = story.text.split(' ').length;

    // Stories range from 34-58 words, distributed across three levels
    // Easy: 34-41 words (~35 stories)
    // Medium: 42-46 words (~35 stories)
    // Hard: 47+ words (~30 stories)
    if (wordCount <= 41) {
        return 'easy';
    } else if (wordCount <= 46) {
        return 'medium';
    } else {
        return 'hard';
    }
}

// Navigation
let currentList = [];

function selectCategory(category) {
    currentCategory = category;

    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';

    const categoryNames = {
        animals: '🦁 Animal Stories',
        nature: '🌳 Nature Tales',
        family: '👨‍👩‍👧‍👦 Family & Friends',
        adventures: '🚀 Adventures',
        learning: '📚 Learning & School',
        bedtime: '🌙 Bedtime Stories'
    };

    document.getElementById('category-subtitle').textContent = categoryNames[category];
}

function showStories(difficulty) {
    currentDifficulty = difficulty;

    // Get stories from current category
    const allStories = storyCollection[currentCategory];

    // Distribute stories evenly across three difficulty levels
    // This ensures each category has stories at all difficulty levels
    const totalStories = allStories.length;
    const perDifficulty = Math.ceil(totalStories / 3);

    if (difficulty === 'easy') {
        // First third - simpler/shorter stories
        currentList = allStories.slice(0, perDifficulty);
    } else if (difficulty === 'medium') {
        // Middle third - moderate complexity
        currentList = allStories.slice(perDifficulty, perDifficulty * 2);
    } else {
        // Last third - more complex stories
        currentList = allStories.slice(perDifficulty * 2);
    }

    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('story-list').style.display = 'block';

    const categoryNames = {
        animals: '🦁 Animal Stories',
        nature: '🌳 Nature Tales',
        family: '👨‍👩‍👧‍👦 Family & Friends',
        adventures: '🚀 Adventures',
        learning: '📚 Learning & School',
        bedtime: '🌙 Bedtime Stories'
    };

    const difficultyStars = {
        easy: '⭐ Easy',
        medium: '⭐⭐ Medium',
        hard: '⭐⭐⭐ Hard'
    };

    document.getElementById('category-title').textContent = `${categoryNames[currentCategory]} - ${difficultyStars[difficulty]}`;

    const container = document.getElementById('stories-container');
    container.innerHTML = '';

    currentList.forEach((story, index) => {
        const card = document.createElement('div');
        card.className = 'story-card';
        card.onclick = () => readStory(index);
        const iconSvg = Array.isArray(story.illustration)
            ? getIllustration(story.illustration[0])
            : getIllustration(story.illustration);

        card.innerHTML = `
            <div class="story-card-icon">${iconSvg}</div>
            <div class="story-card-title">${story.title}</div>
        `;
        container.appendChild(card);
    });
}

function backToDifficulty() {
    document.getElementById('story-list').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';
}

function backToCategories() {
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
}

function readStory(index) {
    currentStoryIndex = index;
    const story = currentList[index];

    document.getElementById('story-list').style.display = 'none';
    document.getElementById('story-reader').style.display = 'block';

    // Generate illustration HTML
    const illustrationHTML = Array.isArray(story.illustration)
        ? story.illustration.map(img => `<div class="svg-illustration">${getIllustration(img)}</div>`).join('')
        : `<div class="svg-illustration">${getIllustration(story.illustration)}</div>`;

    document.getElementById('story-content').innerHTML = `
        <div class="story-meta">Story ${index + 1} of ${currentList.length}</div>
        <h1 class="story-title">${story.title}</h1>
        <div class="story-illustration">
            <div class="story-scene">${illustrationHTML}</div>
        </div>
        <div class="story-text">${story.text}</div>
        <div class="story-moral">
            <h3>✨ Lesson ✨</h3>
            <p>${story.moral}</p>
        </div>
    `;

    // Update navigation buttons
    document.getElementById('prev-btn').disabled = (index === 0);
    document.getElementById('next-btn').disabled = (index === currentList.length - 1);
}

function backToList() {
    document.getElementById('story-reader').style.display = 'none';
    document.getElementById('story-list').style.display = 'block';
}

function previousStory() {
    if (currentStoryIndex > 0) {
        readStory(currentStoryIndex - 1);
    }
}

function nextStory() {
    if (currentStoryIndex < currentList.length - 1) {
        readStory(currentStoryIndex + 1);
    }
}
