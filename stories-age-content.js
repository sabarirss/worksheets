// Age-Differentiated Story Content
// Stories with age-appropriate vocabulary, complexity, and themes

/**
 * Story structure by age:
 * - Age 4-5: 3-4 sentences, simple words, basic morals
 * - Age 6: 5-6 sentences, sight words, clear lessons
 * - Age 7: 7-8 sentences, descriptive words, character development
 * - Age 8: 10+ sentences, complex vocabulary, multi-step plots
 * - Age 9+: 12+ sentences, abstract concepts, nuanced themes
 * - Age 10+: 15+ sentences, sophisticated language, deep lessons
 *
 * INTERNAL: Kept for future assessment system - use levelBasedStories for access
 */

const ageBasedStories = {
    '4-5': {
        easy: {
            animals: [
                {
                    title: 'The Kind Bunny',
                    illustration: '🐰',
                    text: 'Bunny saw a sad bird. The bird lost its nest. Bunny helped the bird find a new home. The bird was happy!',
                    moral: 'Helping others makes everyone happy.'
                },
                {
                    title: 'The Happy Fish',
                    illustration: '🐟',
                    text: 'Fish lived in a pond. Fish had many friends. They played together every day. Everyone was happy!',
                    moral: 'Friends make us happy.'
                },
                {
                    title: 'The Brave Dog',
                    illustration: '🐶',
                    text: 'Dog heard a loud noise. Dog was scared at first. Dog was brave and looked. It was just the wind!',
                    moral: 'Being brave helps us feel better.'
                }
            ],
            nature: [
                {
                    title: 'The Little Seed',
                    illustration: '🌱',
                    text: 'A seed was in the ground. Rain came down. Sun shined bright. The seed grew into a flower!',
                    moral: 'Growing takes time.'
                },
                {
                    title: 'The Warm Sun',
                    illustration: '☀️',
                    text: 'The sun came up. It warmed the earth. Plants grew tall. Animals felt happy and warm!',
                    moral: 'Nature gives us what we need.'
                }
            ],
            family: [
                {
                    title: 'Mom\'s Hug',
                    illustration: '👩',
                    text: 'I was sad today. Mom gave me a hug. I felt better right away. Hugs are the best!',
                    moral: 'Love makes us feel better.'
                },
                {
                    title: 'Playing with Sister',
                    illustration: '👧',
                    text: 'Sister and I played together. We shared our toys. We had so much fun. Sharing is nice!',
                    moral: 'Sharing makes playing more fun.'
                }
            ]
        },
        medium: [
            {
                title: 'The Cat and the Ball',
                illustration: '🐱',
                text: 'Cat found a red ball in the yard. Cat played with it all day long. But then the ball rolled away into the bushes. Cat looked and looked until she found it again. Cat was so happy!',
                moral: 'Never give up when you want something.'
            }
        ],
        hard: [
            {
                title: 'The Helpful Squirrel',
                illustration: '🐿️',
                text: 'Squirrel was gathering nuts for winter. He saw that Bird had no food at all. Squirrel thought for a moment. Then Squirrel shared some nuts with Bird. Bird thanked Squirrel with a happy song. Both friends felt warm inside their hearts.',
                moral: 'Sharing with others brings joy to everyone.'
            }
        ]
    },
    '6': {
        easy: {
            animals: [
                {
                    title: 'The Turtle\'s Slow Journey',
                    illustration: '🐢',
                    text: 'Turtle wanted to cross the big road. All the other animals were much faster. They ran past Turtle very quickly. But Turtle kept going slowly and carefully. Soon, Turtle made it safely to the other side. "Slow and steady wins the race!" said Turtle with a smile.',
                    moral: 'Taking your time can be the safest way.'
                },
                {
                    title: 'The Friendly Dolphin',
                    illustration: '🐬',
                    text: 'Dolphin lived in the blue ocean with many fish friends. One day, Dolphin saw a new fish who looked lonely. Dolphin swam over and said hello nicely. The new fish smiled and they played together. Now they are best friends who play every day!',
                    moral: 'Being friendly helps us make new friends.'
                }
            ],
            nature: [
                {
                    title: 'The Rainbow After Rain',
                    illustration: '🌈',
                    text: 'Dark clouds covered the sky and rain poured down. All the animals stayed inside their homes. When the rain finally stopped, the sun came out bright. A beautiful rainbow appeared in the sky! Everyone came out to look at the pretty colors.',
                    moral: 'Good things come after hard times.'
                }
            ]
        },
        medium: [
            {
                title: 'The Lost Puppy',
                illustration: '🐕',
                text: 'A small puppy wandered away from his home one afternoon. He looked around but everything seemed different and strange. Puppy felt scared and started to whimper softly. A kind cat heard the sounds and came to help. Cat asked where Puppy lived and helped him find the way back home. Puppy\'s family was so happy to see him safe! From that day on, Puppy never wandered too far from home.',
                moral: 'It\'s important to stay close to family and ask for help when lost.'
            }
        ],
        hard: [
            {
                title: 'The Elephant\'s Big Decision',
                illustration: '🐘',
                text: 'Elephant was the strongest animal in the jungle, and everyone knew it. One hot summer, the watering hole began to dry up quickly. The smaller animals couldn\'t reach the water at the bottom. Elephant had to choose between saving water for himself or helping others. After thinking carefully, Elephant used his strong trunk to dig deeper. Soon, fresh water bubbled up for everyone to drink! All the animals cheered and thanked the kind elephant. Elephant felt proud that he chose to help his friends instead of just himself.',
                moral: 'Using our strengths to help others is what makes us truly great.'
            }
        ]
    },
    '7': {
        easy: {
            animals: [
                {
                    title: 'The Wise Owl\'s Advice',
                    illustration: '🦉',
                    text: 'In the tall oak tree lived a very wise owl who had seen many things. Young animals would come to ask for advice about their problems. One day, Rabbit came with tears in his eyes because he had argued with his best friend. Owl listened carefully and then spoke in a gentle voice. "True friends sometimes disagree, but they always find a way to make up," said Owl wisely. Rabbit thanked Owl and hurried to apologize to his friend. They hugged and became even closer than before!',
                    moral: 'Disagreements with friends can be solved through honest apologies and forgiveness.'
                }
            ],
            nature: [
                {
                    title: 'The Mountain\'s Four Seasons',
                    illustration: '⛰️',
                    text: 'The tall mountain watched as the seasons changed throughout the year. In spring, flowers bloomed all over its slopes in beautiful colors. Summer brought warm sunshine and green grass where animals played. Autumn painted the trees in reds, oranges, and yellows. Winter covered everything in sparkling white snow. Through all the changes, the mountain stood strong and proud. It knew that every season brought something special and important.',
                    moral: 'Every time in life has its own special beauty and purpose.'
                }
            ]
        },
        medium: [
            {
                title: 'The Fox Who Learned to Share',
                illustration: '🦊',
                text: 'Fox was known throughout the forest for being clever and quick. He could catch fish faster than anyone else could. One autumn day, Fox caught more fish than he could possibly eat alone. Meanwhile, Bear had been unsuccessful in finding food for her cubs. Fox saw Bear looking worried and tired from searching all day. At first, Fox wanted to keep all the fish for himself to save for winter. But then he remembered feeling hungry before and how terrible it felt. Fox made a difficult choice and shared half of his catch with Bear and her cubs. Bear was so grateful and thanked Fox with tears of joy in her eyes. That night, Fox went to sleep feeling happier than he had ever felt before, even though he had less fish than he started with. He learned that the warm feeling of helping someone in need was worth more than having extra food.',
                moral: 'The happiness we get from sharing with others is more valuable than having more things for ourselves.'
            }
        ],
        hard: [
            {
                title: 'The Penguin\'s Long Walk',
                illustration: '🐧',
                text: 'Every year, the emperor penguins made a long and difficult journey across the frozen ice. Little Pip was making this journey for the very first time in his young life. The bitter cold wind howled loudly around them as they walked mile after mile. Pip\'s feet grew tired and his flippers ached from the endless walking. He wanted to stop and rest, but his parents encouraged him to keep moving forward. "The colony is depending on us," they reminded him gently but firmly. Other young penguins were struggling too, but they all kept going together. Days later, when they finally reached their destination safely, Pip understood something important. The journey had been hard, but they had made it by working together as a group. Each penguin had supported the others when someone grew tired or discouraged. Pip realized that facing challenges together made everyone stronger and more capable.',
                moral: 'When we work together and support each other, we can accomplish difficult things that would be impossible alone.'
            }
        ]
    },
    '8': {
        easy: {
            animals: [
                {
                    title: 'The Clever Crow\'s Problem',
                    illustration: '🦅',
                    text: 'On a scorching hot summer afternoon, a thirsty crow spotted a tall pitcher with water at the bottom. The crow tried to reach the water with its beak, but the pitcher was too deep and narrow. Most birds would have given up and flown away to search elsewhere. But this crow was known for being clever and thinking carefully about problems. The crow looked around and noticed many small pebbles scattered on the ground nearby. One by one, the crow picked up pebbles in its beak and dropped them into the pitcher. With each pebble, the water level rose higher and higher inside. After many trips back and forth, the water finally reached the top where the crow could drink! The crow enjoyed the cool, refreshing water and felt proud of solving the problem.',
                    moral: 'Creative thinking and persistence can help us solve problems that seem impossible at first.'
                }
            ]
        },
        medium: [
            {
                title: 'The Whale\'s Song of Hope',
                illustration: '🐋',
                text: 'Deep beneath the ocean waves lived an ancient humpback whale who had traveled the seas for many decades. This wise whale was famous throughout the ocean for her beautiful, haunting songs that could be heard for miles underwater. Every spring, she would migrate thousands of miles to warmer waters where she had been born long ago. But one year, the journey seemed harder than usual because the ocean had changed. Plastic waste floated in the water and the fish populations had decreased significantly. The old whale felt worried about the future of her ocean home and all the creatures who lived there. Then she remembered the young whales who were watching and learning from her every day. She knew they would need hope and courage to face the challenges ahead. So the whale sang her most beautiful song, full of strength and determination. Her song told a story of resilience and reminded everyone that even in difficult times, there is always hope. Other whales joined in, and soon the entire ocean was filled with their powerful chorus. The young whales learned that no matter how big the problems seem, they must never stop swimming forward and never stop believing in a better tomorrow.',
                moral: 'In challenging times, hope and determination inspire others to keep moving forward and working for positive change.'
            }
        ],
        hard: [
            {
                title: 'The Wolf Pack\'s Difficult Winter',
                illustration: '🐺',
                text: 'High in the mountain wilderness, a wolf pack faced the harshest winter they had experienced in many years. Deep snow made hunting nearly impossible, and food became increasingly scarce with each passing week. The pack leader, a strong and experienced wolf named Shadow, knew that difficult decisions lay ahead. Some of the older wolves suggested that the pack should split up to cover more ground in search of food. Others argued that staying together was essential for survival and protection. Young wolves looked to Shadow for guidance, their eyes full of uncertainty and fear. Shadow spent long nights thinking carefully about both options and what each would mean. He knew that separating might help them find food faster, but it would also make the weaker pack members vulnerable to danger. After much deliberation, Shadow decided they would stay together and travel to lower elevations where hunting might be easier. The journey would be long and exhausting, but they would face it as a unified pack. Throughout the difficult trek, the stronger wolves helped the weaker ones, and they all shared whatever small amounts of food they could find. When they finally reached the lower valleys and found food again, every wolf had survived because they stayed together. Shadow taught his pack that true leadership means making hard choices that protect everyone, even when those choices require sacrifice.',
                moral: 'Strong leadership means making difficult decisions that benefit the whole group, not just what\'s easiest or most convenient.'
            }
        ]
    },
    '9+': {
        easy: {
            animals: [
                {
                    title: 'The Migration of the Monarch',
                    illustration: '🦋',
                    text: 'Each autumn, millions of monarch butterflies embark on an extraordinary journey spanning thousands of miles. A young monarch named Aurora was preparing for her first migration, feeling both excited and nervous about the adventure ahead. Her parents and grandparents had made this journey many times before, but Aurora had never flown farther than the meadow where she was born. The older butterflies explained that she would need to trust her instincts and follow the ancient path programmed into her very being. As the days grew shorter and the air turned cooler, Aurora joined the vast cloud of orange and black wings heading south. The journey tested her endurance as she flew over mountains, across rivers, and through storms that threatened to knock her off course. There were moments when Aurora felt too tired to continue and doubted whether she would make it. But whenever she felt like giving up, she looked around and saw thousands of other monarchs flying alongside her, all facing the same challenges. Their collective determination gave her strength to keep going. After weeks of flying, Aurora finally reached the ancient forest where monarchs had gathered for countless generations. As she rested among the branches with millions of other butterflies, Aurora realized something profound about her journey. She had been part of something much larger than herself—a natural phenomenon that had continued for thousands of years and would continue long after she was gone.',
                    moral: 'Being part of something larger than ourselves gives us strength and purpose, even when facing difficult challenges alone.'
                }
            ]
        },
        medium: [
            {
                title: 'The Elephant Matriarch\'s Wisdom',
                illustration: '🐘',
                    text: 'In the vast African savanna, an elephant herd was led by an elderly matriarch named Amara, who had guided her family for over forty years through droughts, floods, and countless challenges. Amara possessed something that couldn\'t be taught from books—generations of inherited knowledge about where to find water during dry seasons, which paths were safe during migrations, and how to protect the youngest members from predators. When a severe drought struck the region, water holes that had never failed before suddenly dried up completely. The younger elephants grew anxious and wanted to scatter in different directions to search frantically for water. But Amara remained calm and accessed her deep memory of a hidden water source her own grandmother had shown her decades ago during a similar crisis. She led the herd on a three-day journey to a place none of the young ones had ever seen. Many questioned her decision, wondering if she was too old to remember correctly or if the water source even still existed. Amara pressed forward confidently, trusting in the wisdom passed down through generations of matriarchs before her. When they finally arrived at a rocky outcrop, Amara used her powerful tusks to dig where her grandmother had shown her years ago. After much effort, cool, clean water began to bubble up from deep underground. The herd had been saved by knowledge preserved and passed down through time. The younger elephants learned that day that wisdom isn\'t just about being smart—it\'s about remembering lessons from the past and having the courage to trust in them.',
                    moral: 'Wisdom gained from experience and passed through generations is invaluable and should be respected and preserved.'
                }
        ],
        hard: [
            {
                title: 'The Coral Reef\'s Silent Plea',
                illustration: '🐠',
                text: 'Beneath the turquoise waters of a tropical ocean lived a vibrant coral reef ecosystem that had existed for thousands of years, providing home and shelter to countless species of fish, crustaceans, and other marine life. The ancient coral, a living organism itself, had witnessed the passing of centuries and the slow evolution of the ocean world. But in recent years, something had changed dramatically in ways that worried the oldest coral colonies. The water temperature was rising steadily, stressing the delicate symbiotic relationship between coral and the tiny algae that gave it color and life. Plastic debris drifted through the water like artificial snow, and the fish populations were declining as commercial fishing nets swept through regularly. The reef, though unable to speak in words, communicated its distress through biological signals—bleaching white as stressed coral expelled its colorful algae symbionts. A young parrotfish named Kai, who had grown up in the reef, noticed these changes and felt compelled to do something, though he didn\'t know what a single fish could accomplish. Kai began telling other fish about what was happening, helping them understand that the reef wasn\'t just their home—it was a living organism that needed their protection. Slowly, the fish community began working together in small ways: the parrotfish scraped away harmful algae, the cleaner wrasse removed parasites, and the groupers established territories that would allow the reef to recover in sections. But Kai knew that the biggest threats came from beyond the reef, from the human world above the water. Still, he believed that every small action mattered and that by protecting their home, they were sending a message about the importance of all life in the ocean. The reef couldn\'t speak human language, but through its struggle and the efforts of its inhabitants, it told a powerful story about interconnection, responsibility, and the urgent need for environmental stewardship.',
                moral: 'Every ecosystem is interconnected, and protecting the environment requires both understanding our impact and taking action, no matter how small we may feel.'
            }
        ]
    },
    '10+': {
        easy: {
            animals: [
                {
                    title: 'The Snow Leopard\'s Solitary Path',
                    illustration: '🐆',
                    text: 'High in the Himalayan mountains, where few creatures dared to venture, lived a snow leopard named Shanti who had adapted to one of Earth\'s most unforgiving environments. Unlike many animals who rely on large social groups for survival, snow leopards are solitary creatures who spend most of their lives alone, crossing vast territories in search of prey. Shanti had learned from her mother how to navigate treacherous cliffs, how to hunt bharal sheep on steep mountain faces, and how to survive in temperatures far below freezing. But as Shanti matured and established her own territory, she faced a profound challenge that previous generations hadn\'t encountered. Human development was encroaching into the mountains, bringing livestock that competed with wild prey and herders who viewed snow leopards as threats. Furthermore, climate change was altering the delicate mountain ecosystem, affecting the distribution of prey species and changing patterns that had been stable for millennia. Shanti found herself walking a tightrope between survival and extinction, representing a species whose very existence had become precarious. Yet despite these overwhelming odds, Shanti persevered with remarkable resilience, adapting her hunting patterns, expanding her range, and learning to avoid human conflicts. Her struggle symbolized something larger than one animal\'s survival—it represented the quiet crisis faced by countless species whose habitats were disappearing but whose stories often went untold. Conservation biologists studying Shanti through camera traps were moved by her determination and began working with local communities to protect snow leopard habitat and reduce human-wildlife conflict. Shanti\'s solitary existence, captured in fleeting camera trap images, sparked a movement to preserve the high-altitude ecosystems that she and other endangered species called home.',
                    moral: 'Individual struggles for survival can inspire collective action and remind us of our responsibility to protect endangered species and fragile ecosystems before they disappear forever.'
                }
            ]
        },
        medium: [
            {
                title: 'The Arctic Fox\'s Adaptation',
                illustration: '🦊',
                text: 'In the extreme environment of the Arctic tundra, where winter temperatures plunge to minus forty degrees and summer provides only brief respite, lived an arctic fox named Nuka whose very existence demonstrated nature\'s remarkable capacity for adaptation. Nuka\'s thick white winter coat, which turned brown in summer for camouflage, represented millions of years of evolutionary fine-tuning to survive in one of Earth\'s harshest climates. Her compact body, short ears, and furry paws were all specialized features that minimized heat loss and allowed her to hunt successfully in deep snow. But Nuka was living through a period of unprecedented environmental change that was testing the limits of even the most well-adapted species. The Arctic was warming at twice the rate of the global average, fundamentally altering the ecosystem that foxes like Nuka depended upon. Sea ice was disappearing earlier each spring and forming later each fall, affecting the seal populations that provided food for polar bears, whose leftover kills Nuka\'s family often relied upon during lean times. Permafrost was melting, changing the landscape and affecting the small rodents that formed a major part of the arctic fox diet. Most troubling of all, red foxes—larger competitors that had previously been limited to more southern regions—were now moving north into traditional arctic fox territory as the climate warmed. Nuka found herself needing to adapt even further, learning new hunting strategies, defending her territory more aggressively, and raising her pups earlier in the season to take advantage of the changing conditions. Her story illustrated a fundamental truth about life on Earth: adaptation is not a one-time achievement but an ongoing process, and in an era of rapid climate change, some species might not be able to adapt quickly enough to survive. Yet even in the face of these daunting challenges, Nuka persevered, her resilience a testament to the tenacity of life even in the most extreme circumstances. Scientists studying arctic foxes like Nuka hoped that by understanding how these animals were coping with environmental change, they might better predict and potentially help other species facing similar challenges around the world.',
                moral: 'Adaptation is a continuous process, and understanding how species respond to rapid environmental change is crucial for conservation efforts in an era of climate crisis.'
            }
        ],
        hard: [
            {
                title: 'The Blue Whale\'s Ancient Song',
                illustration: '🐋',
                text: 'In the deepest reaches of the Pacific Ocean, where sunlight fades to perpetual twilight and pressure would crush most surface dwellers, swam a blue whale matriarch named Echo whose life spanned nearly a century of profound change in the world\'s oceans. Echo was the largest animal to have ever existed on Earth, bigger even than the largest dinosaurs, yet she sustained herself on some of the smallest—tiny krill that she filter-fed by the thousands. Her existence represented one of nature\'s most remarkable paradoxes: immense size sustained by minute prey, awesome power combined with gentle grace, a creature of almost incomprehensible majesty living in a realm humans could barely explore. But Echo\'s life story was also a chronicle of survival against staggering odds and a testament to the ocean\'s interconnected complexity. In her youth, during the mid-twentieth century, Echo had witnessed the height of commercial whaling when her species was hunted to the brink of extinction, their population reduced to mere thousands from an original hundreds of thousands. She had survived by chance and circumstance, watching as many of her pod members were killed by harpoons. Then, miraculously, international protection came in the 1960s, and blue whale populations began their slow, uncertain recovery. But even as the immediate threat of hunting diminished, new challenges emerged. Ocean noise from ship traffic was growing louder each decade, interfering with the low-frequency songs that blue whales used to communicate across vast ocean distances. Climate change was altering ocean temperatures and currents, affecting the distribution and abundance of the krill swarms that blue whales depended upon. Plastic pollution was accumulating in the ocean, and while blue whales were less affected than some species, the overall degradation of marine ecosystems threatened the complex food web that supported all ocean life. Most insidiously, ocean acidification caused by absorbed atmospheric carbon dioxide was making it harder for krill to form their protective shells, threatening the base of the food chain. Yet despite all these pressures, Echo continued her ancient migrations, singing her complex songs that could travel hundreds of miles through the ocean depths, each note carrying information about her identity, location, and perhaps her history. Marine biologists who recorded Echo\'s songs were struck by their beauty and complexity—patterns that seemed to contain not just communication but something approaching art or culture, passed down and modified across generations. Echo\'s existence posed profound questions about intelligence, consciousness, and what we owe to other species with whom we share the planet. Was humanity capable of sharing the oceans sustainably with these magnificent creatures, or would we ultimately drive them to extinction through a thousand small cuts of pollution, noise, and climate change? Echo\'s story was not yet finished, and its ending would be determined not by the whales themselves but by human choices about how we treat the planet\'s oceans and atmosphere. In her songs, some scientists imagined they heard not just whale communication but a deeper message—a reminder of the ocean\'s ancient majesty, the intricate web of life it supported, and the urgent responsibility humans bore to protect and preserve it for future generations of all species.',
                moral: 'The survival of Earth\'s most magnificent creatures depends on human willingness to recognize our profound impact on natural systems and make fundamental changes in how we interact with the environment, understanding that every species\' fate is ultimately interconnected with our own.'
            }
        ]
    }
};

// Convert age-based stories to level-based structure
function buildLevelBasedStories() {
    const levelStories = {};

    for (const ageGroup in ageBasedStories) {
        for (const difficulty in ageBasedStories[ageGroup]) {
            const level = ageAndDifficultyToLevel(ageGroup, difficulty);
            const key = `level${level}`;

            if (!levelStories[key]) {
                levelStories[key] = {};
            }

            const ageContent = ageBasedStories[ageGroup][difficulty];

            // Handle two structures: object with categories (easy) or array (medium/hard)
            if (Array.isArray(ageContent)) {
                // For medium/hard: direct array of stories
                levelStories[key].general = ageContent.map(story => ({
                    ...story,
                    level: level,
                    ageEquivalent: ageGroup,
                    difficultyEquivalent: difficulty
                }));
            } else {
                // For easy: object with categories (animals, nature, family, etc.)
                for (const category in ageContent) {
                    if (!levelStories[key][category]) {
                        levelStories[key][category] = [];
                    }

                    const stories = ageContent[category];
                    levelStories[key][category] = stories.map(story => ({
                        ...story,
                        level: level,
                        ageEquivalent: ageGroup,
                        difficultyEquivalent: difficulty,
                        category: category
                    }));
                }
            }
        }
    }
    return levelStories;
}

const levelBasedStories = buildLevelBasedStories();

// Helper functions for story access
function getStoriesByLevel(level, difficulty, category) {
    const levelKey = `level${level}`;
    const levelContent = levelBasedStories[levelKey];

    if (!levelContent) return [];

    // If category specified, return that category
    if (category && levelContent[category]) {
        return levelContent[category];
    }

    // If no category specified, return all stories from all categories
    const allStories = [];
    for (const cat in levelContent) {
        if (Array.isArray(levelContent[cat])) {
            allStories.push(...levelContent[cat]);
        }
    }
    return allStories;
}

function getStoriesByAge(ageGroup, difficulty, category) {
    const level = ageAndDifficultyToLevel(ageGroup, difficulty);
    return getStoriesByLevel(level, difficulty, category);
}

console.log('Level-based story content loaded - 12 levels available');

console.log('Age-based story content loaded');
