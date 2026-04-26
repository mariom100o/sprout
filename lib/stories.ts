import { Topic, Story } from '../store';

// Returns how many sentences a child should read given their reading level grade.
export function sentencesForLevel(level: number): number {
  if (level < 2.0) return 3;
  if (level < 2.5) return 4;
  if (level < 3.0) return 5;
  if (level < 3.5) return 6;
  if (level < 4.0) return 7;
  return 8;
}

// All stories written at 2nd-grade level with 7 sentences.
// getRandomStory slices to the appropriate count for the child's reading level.
export const STATIC_STORIES: Story[] = [

  // ── DINOSAURS ──────────────────────────────────────────────────────────────
  {
    id: 'dino-1',
    topic: 'dinosaurs',
    title: 'T-Rex Had Tiny Arms',
    sentences: [
      'The T-Rex was one of the biggest meat eaters that ever lived.',
      'Its arms were very short, but its legs were huge and strong.',
      'Scientists think T-Rex could run fast enough to chase down its food.',
      'T-Rex had banana-shaped teeth that were as long as your hand.',
      'It could swallow huge chunks of meat in just one powerful bite.',
      'T-Rex could not move its eyes, so it had to turn its whole head to look.',
      'Scientists have found T-Rex bones on almost every continent in the world.',
    ],
    vocabWord: 'carnivore',
    vocabDefinition: 'An animal that eats only meat.',
    predictOptions: [
      'T-Rex only ate plants and berries',
      'T-Rex used its big legs to chase prey',
      'T-Rex had the longest arms of any dinosaur',
    ],
    inferenceQuestion: 'Why were strong legs more useful to a T-Rex than long arms?',
    inferenceOptions: [
      'Long legs helped it run fast to catch food — arms weren\'t needed for that',
      'Long legs helped it swim across rivers to find plants',
      'Legs kept it warm during cold winter months',
    ],
    correctInferenceIndex: 0,
  },
  {
    id: 'dino-2',
    topic: 'dinosaurs',
    title: 'Triceratops Had Three Horns',
    sentences: [
      'The Triceratops had three sharp horns on its big head.',
      'It also had a wide bony frill around the back of its neck.',
      'Scientists think it used its horns to fight off animals that wanted to eat it.',
      'Triceratops was about as long as a school bus and very heavy.',
      'It ate plants and used its strong beak to bite through tough leaves and stems.',
      'Triceratops lived in herds so the group could protect each other from danger.',
      'Its name means "three-horned face" in ancient Greek.',
    ],
    vocabWord: 'frill',
    vocabDefinition: 'A wide bony shield around a dinosaur\'s neck.',
    predictOptions: [
      'Triceratops used its horns as a hat decoration',
      'Triceratops used its horns to protect itself from danger',
      'Triceratops had no way to defend itself',
    ],
    inferenceQuestion: 'How do the horns and frill show that Triceratops needed to defend itself?',
    inferenceOptions: [
      'Both body parts were hard and sharp — good for blocking or fighting attackers',
      'The frill was used to smell food from far away',
      'The horns were only used to dig up roots to eat',
    ],
    correctInferenceIndex: 0,
  },
  {
    id: 'dino-3',
    topic: 'dinosaurs',
    title: 'Pterodactyls Could Fly',
    sentences: [
      'Pterodactyls had long wings made of skin, like a bat.',
      'They flew over the ocean and used their sharp beaks to catch fish.',
      'Even though they lived with dinosaurs, pterodactyls were not dinosaurs themselves.',
      'Some pterodactyls had wingspans as wide as a small airplane.',
      'Their hollow bones were very light, which helped them stay up in the air.',
      'Pterodactyls had no feathers — their bodies were covered in short fuzzy hair.',
      'They could soar on warm air currents for a very long time without flapping.',
    ],
    vocabWord: 'reptile',
    vocabDefinition: 'A cold-blooded animal with scales, like a lizard or snake.',
    predictOptions: [
      'Pterodactyls lived only underground and never flew',
      'Pterodactyls used their wings to fly and hunt for fish',
      'Pterodactyls were the largest land dinosaurs',
    ],
    inferenceQuestion: 'Why was flying over the ocean helpful for pterodactyls finding food?',
    inferenceOptions: [
      'From the air, they could spot fish in the water and swoop down to catch them',
      'Flying kept them warm so they could digest plants faster',
      'The ocean air made their wings grow bigger and stronger',
    ],
    correctInferenceIndex: 0,
  },

  // ── MINECRAFT ──────────────────────────────────────────────────────────────
  {
    id: 'mc-1',
    topic: 'minecraft',
    title: 'Watch Out for Creepers!',
    sentences: [
      'Creepers are green mobs in Minecraft that walk up to players quietly.',
      'When a Creeper gets close, it makes a hissing sound and then explodes.',
      'Players have to listen carefully because Creepers do not make footstep sounds.',
      'A Creeper\'s explosion can destroy nearby blocks and hurt the player badly.',
      'If you spot a Creeper, running away quickly is usually the best plan.',
      'Carrying a shield can help block some of the explosion damage.',
      'Creepers drop gunpowder when killed, which players can use to craft fireworks.',
    ],
    vocabWord: 'mob',
    vocabDefinition: 'A moving creature in a video game that can help or hurt you.',
    predictOptions: [
      'Creepers are friendly and give players gifts',
      'Creepers sneak up and explode to hurt players',
      'Creepers only come out during the day',
    ],
    inferenceQuestion: 'Why is it smart to listen for the hissing sound when playing Minecraft?',
    inferenceOptions: [
      'The hiss is the only warning a player gets before the Creeper explodes',
      'The hissing tells you a new Creeper has just spawned far away',
      'Creepers hiss only when they are about to run away from you',
    ],
    correctInferenceIndex: 0,
  },
  {
    id: 'mc-2',
    topic: 'minecraft',
    title: 'Mining for Diamonds',
    sentences: [
      'Diamonds are the most valuable gems you can find deep underground in Minecraft.',
      'Players must dig very far down, close to the bottom of the world, to find them.',
      'Diamonds are used to make the strongest tools and armour in the whole game.',
      'You need an iron or diamond pickaxe to actually mine the diamond ore blocks.',
      'Most players find diamonds when mining at layer twelve, deep below the surface.',
      'Diamond armour protects you much better than iron or gold armour can.',
      'Some players search for hours in dark caves before they finally find their first diamond.',
    ],
    vocabWord: 'ore',
    vocabDefinition: 'A type of rock that contains a valuable material like iron or diamond.',
    predictOptions: [
      'Diamonds are found at the top of mountains in Minecraft',
      'Players dig deep underground to find diamonds',
      'Diamonds are only found by trading with villagers',
    ],
    inferenceQuestion: 'Why would a player want to save their diamonds instead of using them right away?',
    inferenceOptions: [
      'Diamonds make the best gear, so it\'s worth collecting enough to craft strong items',
      'Diamonds turn into coal if you use them too quickly',
      'Players get extra points for keeping diamonds in their inventory',
    ],
    correctInferenceIndex: 0,
  },
  {
    id: 'mc-3',
    topic: 'minecraft',
    title: 'Building a Safe House',
    sentences: [
      'In Minecraft, nighttime is dangerous because monsters come out in the dark.',
      'Players need to build a shelter before the sun goes down to stay safe.',
      'A good house has walls, a door, and a roof to keep monsters out.',
      'Wood is the easiest material to build with when you first start the game.',
      'Placing torches inside and outside your house keeps dark corners lit up.',
      'Monsters cannot spawn in well-lit areas, so good lighting is very important.',
      'Over time, players can upgrade their house using stone, iron, or even diamond blocks.',
    ],
    vocabWord: 'shelter',
    vocabDefinition: 'A place that keeps you safe from danger or bad weather.',
    predictOptions: [
      'Players do not need shelter because monsters are friendly at night',
      'Players need to build a safe house before dark to survive',
      'Monsters only appear inside buildings in Minecraft',
    ],
    inferenceQuestion: 'What happens to a player who has no shelter when night comes?',
    inferenceOptions: [
      'Monsters spawn in the dark and can attack the player with no protection',
      'The player automatically teleports to safety when the sun sets',
      'The player loses all their crafting recipes until morning',
    ],
    correctInferenceIndex: 0,
  },

  // ── SPACE ──────────────────────────────────────────────────────────────────
  {
    id: 'space-1',
    topic: 'space',
    title: 'The Moon Goes Around Earth',
    sentences: [
      'The Moon travels all the way around Earth about once every 28 days.',
      'The Moon does not make its own light — it reflects light from the Sun.',
      'Astronauts walked on the Moon for the first time in 1969.',
      'The Moon has no air, no wind, and no weather at all.',
      'Footprints left by astronauts on the Moon are still there today.',
      'The Moon\'s gravity pulls on Earth\'s oceans and causes the tides to rise and fall.',
      'Scientists think the Moon formed when a huge rock crashed into Earth long ago.',
    ],
    vocabWord: 'orbit',
    vocabDefinition: 'The curved path one object travels around another in space.',
    predictOptions: [
      'The Moon makes its own bright light at night',
      'The Moon travels around Earth and reflects sunlight',
      'The Moon is attached to Earth and never moves',
    ],
    inferenceQuestion: 'Why do we see different shapes of the Moon throughout the month?',
    inferenceOptions: [
      'As the Moon moves around Earth, we see different amounts of the sunlit side',
      'The Moon shrinks and grows bigger on its own every few days',
      'Clouds on the Moon cover different parts of it each night',
    ],
    correctInferenceIndex: 0,
  },
  {
    id: 'space-2',
    topic: 'space',
    title: 'Mars Is Called the Red Planet',
    sentences: [
      'Mars looks red because its soil is full of rusty dust called iron oxide.',
      'Mars is smaller than Earth, but it has the tallest volcano in our solar system.',
      'Robots called rovers have been sent to Mars to take pictures and study the ground.',
      'Mars has two small moons called Phobos and Deimos.',
      'A day on Mars is just 37 minutes longer than a day on Earth.',
      'Scientists are looking for signs that water once flowed on the surface of Mars.',
      'Mars gets very cold at night, dropping far below freezing temperatures.',
    ],
    vocabWord: 'rover',
    vocabDefinition: 'A small robot vehicle sent to explore the surface of another planet.',
    predictOptions: [
      'Mars is blue because it is covered in large oceans',
      'Mars is red because of its rusty dust, and rovers explore its surface',
      'Mars has lots of plants and trees that make it look red',
    ],
    inferenceQuestion: 'Why do scientists send rovers to Mars instead of going there themselves?',
    inferenceOptions: [
      'Rovers can explore safely without risking a human life on the long dangerous trip',
      'Rovers are much bigger than astronauts and can carry more food',
      'Humans are not allowed to leave Earth by space law',
    ],
    correctInferenceIndex: 0,
  },
  {
    id: 'space-3',
    topic: 'space',
    title: 'Stars Are Faraway Suns',
    sentences: [
      'Every star you see in the night sky is a giant ball of hot, glowing gas.',
      'Stars look tiny because they are so very far away from Earth.',
      'Our own Sun is a star — it just looks bigger because it is much closer to us.',
      'Stars are born inside giant clouds of gas and dust called nebulae.',
      'When a star runs out of fuel, it slowly cools down and fades away.',
      'Some stars are much bigger than our Sun and are called giant stars.',
      'On a clear night, you can see thousands of stars without a telescope.',
    ],
    vocabWord: 'galaxy',
    vocabDefinition: 'A huge group of millions of stars held together in space.',
    predictOptions: [
      'Stars are small lights placed in the sky by astronauts',
      'Stars are giant suns that look small only because they are far away',
      'Stars only appear at night because they turn off during the day',
    ],
    inferenceQuestion: 'Why does the Sun look so much bigger and brighter than other stars?',
    inferenceOptions: [
      'The Sun is much closer to Earth than any other star, so it appears larger and brighter',
      'The Sun is the only star that is actually on fire',
      'The Sun has special mirrors that make it look bigger from Earth',
    ],
    correctInferenceIndex: 0,
  },
];

export function getStoriesForTopic(topic: Topic): Story[] {
  return STATIC_STORIES.filter((s) => s.topic === topic);
}

export function getRandomStory(topic: Topic, readingLevel = 3.0): Story {
  const stories = getStoriesForTopic(topic);
  const base = stories[Math.floor(Math.random() * stories.length)];
  const count = sentencesForLevel(readingLevel);
  return { ...base, sentences: base.sentences.slice(0, count) };
}
