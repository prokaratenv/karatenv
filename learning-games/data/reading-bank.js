/*
  READING BANK — Story Scrolls
  ============================
  Short passages with three questions each. Your child answers in their own
  words. When the game is opened through the shared Claude link, Sensei
  (Claude) reads the answer and gives feedback, and writes new passages so
  the bank never runs out. Offline, answers are checked with the "keys" below.

  Each question:
    type    "main" (main idea / theme), "detail" (find it in the text),
            "infer" (read between the lines), "vocab" (word meaning)
    q       the question
    answer  a strong sample answer (shown after they finish)
    hint    points them back to the right part of the passage
    keys    for offline checking: groups of words. A good answer contains at
            least one word from EACH group. Use short stems ("escap" matches
            "escape", "escaped", "escaping").
*/
window.BD = window.BD || {};

BD.PASSAGES = [
  /* ---------------- GRADE 3 ---------------- */
  { id: "r3-01", grade: 3, title: "The Busy Beaver",
    text: "Beavers build dams across streams using sticks, mud, and stones. The dam blocks the water and makes a pond. In the middle of the pond, beavers build a home called a lodge. The door of the lodge is underwater, so wolves and bears cannot get in. Beavers have strong orange teeth that never stop growing. Chewing wood all day keeps their teeth from getting too long.",
    questions: [
      { type: "main", q: "What is this paragraph mostly about?", answer: "It is about how beavers build dams and lodges to make a safe home.", hint: "Look at what the beavers do in almost every sentence.", keys: [["beaver"], ["build", "dam", "lodge", "home", "pond"]] },
      { type: "detail", q: "Why can't wolves and bears get into the lodge?", answer: "Because the door of the lodge is underwater.", hint: "Reread the sentence about the door.", keys: [["underwater", "under water", "under the water"]] },
      { type: "infer", q: "What would happen to a beaver's teeth if it stopped chewing wood?", answer: "Its teeth would keep growing and get too long.", hint: "Reread the last two sentences.", keys: [["teeth", "tooth"], ["long", "grow", "big"]] }
    ] },
  { id: "r3-02", grade: 3, title: "Lily's Lost Kite",
    text: "Lily ran across the field with her red kite. The wind pulled it high above the trees. Suddenly, the string slipped out of her hand! Lily watched the kite float away and felt tears in her eyes. Then Grandpa pointed to the big oak tree. The kite was stuck in its branches. Grandpa got a ladder, and soon the kite was back in Lily's hands. She held the string extra tight for the rest of the day.",
    questions: [
      { type: "main", q: "What happens in this story? Tell it in your own words.", answer: "Lily's kite gets away and gets stuck in a tree, and Grandpa uses a ladder to get it back for her.", hint: "Think about the beginning, the problem, and how it was fixed.", keys: [["kite"], ["slip", "lost", "away", "stuck", "tree", "flew", "blew"], ["grandpa", "ladder", "back", "got it"]] },
      { type: "detail", q: "Where did the kite end up?", answer: "It got stuck in the branches of a big oak tree.", hint: "Look at what Grandpa pointed to.", keys: [["tree", "oak", "branch"]] },
      { type: "infer", q: "Why did Lily hold the string extra tight for the rest of the day?", answer: "She didn't want to lose her kite again.", hint: "Think about what happened when the string slipped.", keys: [["lose", "lost", "again", "away", "fly", "slip", "drop"]] }
    ] },
  { id: "r3-03", grade: 3, title: "Why Leaves Change Color",
    text: "In summer, leaves are green because of something called chlorophyll. Chlorophyll helps trees make food from sunlight. In fall, the days get shorter and colder. Trees stop making food, and the green color fades away. Then we can see the yellow and orange colors that were hiding in the leaves all along. Some leaves turn red or purple, too. Soon the leaves fall, and the tree rests for the winter.",
    questions: [
      { type: "main", q: "What is the main idea of this paragraph?", answer: "Leaves change color in fall because trees stop making food and the green color fades.", hint: "What changes in this paragraph, and when?", keys: [["leaves", "leaf"], ["color", "colour", "yellow", "orange", "red", "change"]] },
      { type: "detail", q: "What does chlorophyll do?", answer: "It helps trees make food from sunlight.", hint: "Reread the second sentence.", keys: [["food"], ["sun", "light"]] },
      { type: "vocab", q: "The colors were \"hiding\" in the leaves. What does that mean?", answer: "The yellow and orange were there all along, but the green covered them up so we couldn't see them.", hint: "Were the yellow and orange new, or were they there before?", keys: [["there", "already", "all along", "cover", "couldn't see", "could not see", "can't see", "green"]] }
    ] },

  /* ---------------- GRADE 4 ---------------- */
  { id: "r4-01", grade: 4, title: "The Pony Express",
    text: "In 1860, sending a letter across the United States could take weeks. The Pony Express changed that. Young riders carried mail on fast horses from Missouri to California, a trip of about 1,900 miles. Every 10 to 15 miles, a rider jumped onto a fresh horse at a station. A letter could now cross the country in about ten days. But only 18 months later, the telegraph line was finished. It could send messages in minutes, and the Pony Express shut down.",
    questions: [
      { type: "main", q: "What is this paragraph mostly about?", answer: "The Pony Express carried mail across the country much faster, until the telegraph replaced it.", hint: "What was the Pony Express, and what happened to it?", keys: [["pony", "mail", "letter"], ["fast", "quick", "ten days", "10 days", "telegraph", "shut", "replace", "end"]] },
      { type: "infer", q: "Why did riders switch to a fresh horse so often?", answer: "So the horses wouldn't get tired and the mail could keep moving fast.", hint: "What happens to a horse that runs for a long time?", keys: [["tired", "rest", "fast", "speed", "fresh", "quick"]] },
      { type: "detail", q: "Why did the Pony Express shut down?", answer: "The telegraph could send messages in minutes, so the Pony Express wasn't needed anymore.", hint: "Reread the last two sentences.", keys: [["telegraph"]] }
    ] },
  { id: "r4-02", grade: 4, title: "Mateo's Science Fair",
    text: "Mateo wanted to know which brand of paper towel soaked up the most water. He poured the same amount of water into three cups. He dipped a square of each brand into a cup for ten seconds, then squeezed the water into a measuring cup. Brand A held the most water. Mateo was surprised, because Brand A was the cheapest. At the science fair, he explained that a fair test means changing only one thing at a time.",
    questions: [
      { type: "main", q: "What did Mateo want to find out, and how did he do it?", answer: "He wanted to know which paper towel soaked up the most water, so he tested each brand the same way and measured the water.", hint: "Look at the first three sentences.", keys: [["towel", "paper", "brand"], ["water", "soak", "absorb"]] },
      { type: "detail", q: "Why was Mateo surprised?", answer: "The brand that held the most water, Brand A, was the cheapest one.", hint: "Reread the sentence with the word \"surprised.\"", keys: [["cheap", "cost", "price", "money", "less"]] },
      { type: "vocab", q: "What does \"a fair test\" mean in this story?", answer: "A test where you change only one thing, so you know what caused the result.", hint: "Reread the last sentence.", keys: [["one thing", "only one", "same", "one at a time"]] }
    ] },
  { id: "r4-03", grade: 4, title: "Octopus Escape Artists",
    text: "An octopus has no bones, so it can squeeze through any hole bigger than its beak, the only hard part of its body. Octopuses are also clever. In aquariums, some have climbed out of their tanks at night, crawled to another tank to eat crabs, and slipped back home before morning. They can change color in less than a second to hide from enemies or to show how they feel. Scientists say an octopus may be as smart as a pet dog.",
    questions: [
      { type: "main", q: "What is the main idea of this paragraph?", answer: "Octopuses are clever animals with amazing abilities, like squeezing through tiny holes and changing color.", hint: "What does the author want you to know about octopuses?", keys: [["octopus"], ["smart", "clever", "intelligent", "escape", "squeeze", "color", "amazing"]] },
      { type: "detail", q: "What is the only hard part of an octopus's body?", answer: "Its beak.", hint: "Reread the first sentence.", keys: [["beak"]] },
      { type: "infer", q: "Why do you think the octopuses went back to their own tanks before morning?", answer: "So the aquarium workers wouldn't notice what they did, or because their tank is home.", hint: "Who comes to the aquarium in the morning?", keys: [["catch", "see", "notice", "caught", "trouble", "home", "worker", "people", "found"]] }
    ] },

  /* ---------------- GRADE 5 ---------------- */
  { id: "r5-01", grade: 5, title: "Harriet Tubman",
    text: "Harriet Tubman was born into slavery in Maryland around 1822. In 1849, she escaped to Philadelphia, where she was free. But Tubman did not stay safe and quiet. She went back south about thirteen times to guide around seventy people, including members of her own family, to freedom on the Underground Railroad. She traveled at night, used songs as secret signals, and never lost a single person she guided. Later, during the Civil War, she worked as a scout and nurse for the Union army.",
    questions: [
      { type: "main", q: "What is this paragraph mostly about?", answer: "Harriet Tubman escaped slavery and then risked her life again and again to lead others to freedom.", hint: "What did she do after she was free?", keys: [["tubman", "harriet", "she"], ["free", "escap", "guide", "lead", "led", "help", "underground", "others", "people"]] },
      { type: "detail", q: "How did Tubman keep her trips secret?", answer: "She traveled at night and used songs as secret signals.", hint: "Reread the sentence that starts \"She traveled...\"", keys: [["night", "song", "signal"]] },
      { type: "infer", q: "The paragraph says she \"did not stay safe and quiet.\" What does that tell you about her?", answer: "She was brave and cared about others, because she risked her own freedom to help them.", hint: "What could have happened to her when she went back?", keys: [["brave", "courage", "fearless", "cared", "kind", "help", "selfless", "risk", "hero", "danger"]] }
    ] },
  { id: "r5-02", grade: 5, title: "The Drought Garden",
    text: "For weeks, no rain had fallen on Grandma Rosa's farm. The corn leaves curled like rolled-up paper, and the creek was just a line of cracked mud. Ivy wanted to help, so she read about plants that need little water. Together, she and Grandma planted rows of beans and squash and covered the soil with straw to keep it damp. Each evening, Ivy carried buckets of water saved from the kitchen sink. By August, the corn was gone, but the beans and squash were thriving.",
    questions: [
      { type: "main", q: "What problem did the farm have, and how did Ivy help solve it?", answer: "There was no rain, so Ivy planted crops that need less water and saved water to keep them alive.", hint: "Find the problem in the first sentence, then what Ivy did.", keys: [["rain", "drought", "dry", "water"], ["plant", "bean", "squash", "straw", "bucket", "saved", "read"]] },
      { type: "vocab", q: "What does \"thriving\" mean in the last sentence?", answer: "Growing well and staying healthy.", hint: "Compare the beans and squash to the corn.", keys: [["grow", "healthy", "well", "good", "strong", "alive", "great"]] },
      { type: "detail", q: "Why did they cover the soil with straw?", answer: "To keep the soil damp so the water didn't dry up.", hint: "Reread the sentence about the straw.", keys: [["damp", "wet", "water", "moist", "dry"]] }
    ] },
  { id: "r5-03", grade: 5, title: "How Bats See in the Dark",
    text: "Most bats hunt at night, but they don't need light to find food. Instead, they use echolocation. A bat makes high-pitched squeaks that are too high for people to hear. The sound waves bounce off objects, like trees or moths, and echo back to the bat's ears. From the echoes, the bat can tell how far away something is, how big it is, and even which way it is moving. Some bats can catch a thousand mosquitoes in an hour this way.",
    questions: [
      { type: "main", q: "What is the main idea of this paragraph?", answer: "Bats use echolocation, bouncing sound off things, to find their way and catch food in the dark.", hint: "What special skill is the whole paragraph explaining?", keys: [["bat"], ["echo", "sound", "squeak"]] },
      { type: "detail", q: "What can a bat learn from an echo?", answer: "How far away something is, how big it is, and which way it is moving.", hint: "Reread the sentence that starts \"From the echoes...\"", keys: [["far", "distance", "big", "size", "moving", "direction", "way"]] },
      { type: "infer", q: "Why might people be happy to have bats living nearby?", answer: "Bats eat huge numbers of insects like mosquitoes.", hint: "Look at the last sentence.", keys: [["insect", "bug", "mosquito", "moth", "pest"]] }
    ] },

  /* ---------------- GRADE 6 ---------------- */
  { id: "r6-01", grade: 6, title: "The Great Wall",
    text: "Many people believe the Great Wall of China is one long wall, but it is really a collection of walls built over about two thousand years. Different dynasties built and rebuilt sections to protect their lands from invaders from the north. The most famous parts were built during the Ming dynasty, using brick and stone. Soldiers in watchtowers sent smoke signals by day and fire signals by night, warning of attacks hundreds of miles away within hours. Today, the wall is a symbol of China's long history.",
    questions: [
      { type: "main", q: "What is this paragraph mostly about?", answer: "The Great Wall is really many walls, built over thousands of years to protect China from invaders.", hint: "Why was it built, and how?", keys: [["wall"], ["protect", "defend", "invader", "attack", "many", "collection", "years", "built"]] },
      { type: "detail", q: "How did soldiers send warnings?", answer: "With smoke signals during the day and fire signals at night from the watchtowers.", hint: "Reread the sentence about the watchtowers.", keys: [["smoke", "fire", "signal"]] },
      { type: "infer", q: "What mistaken idea does the author correct in the first sentence?", answer: "That the Great Wall is one long wall. It's really many walls.", hint: "Reread the first sentence. What do \"many people believe\"?", keys: [["one", "single", "many", "collection", "several"]] }
    ] },
  { id: "r6-02", grade: 6, title: "The Tryout",
    text: "Jonah's stomach twisted as the coach blew the whistle. He had practiced his free throws every evening for a month, but now his hands felt like they belonged to someone else. His first shot clanged off the rim. He took a breath, remembered his dad saying, \"Bend your knees, follow through,\" and shot again. Swish. By the end of tryouts, Jonah had made seven of ten. When the coach read the team list the next day, Jonah didn't hear the last few names. He was too busy grinning at his own.",
    questions: [
      { type: "main", q: "Summarize what happens to Jonah.", answer: "Jonah is nervous at basketball tryouts, but he calms down, uses what he practiced, and makes the team.", hint: "Beginning (how he felt), middle (what he did), end (what happened).", keys: [["nervous", "scared", "calm", "breath", "practice", "tryout", "shot", "free throw"], ["team", "made it", "name", "list"]] },
      { type: "vocab", q: "What does \"his hands felt like they belonged to someone else\" mean?", answer: "He was so nervous that his hands felt clumsy and hard to control.", hint: "How was Jonah feeling right then?", keys: [["nervous", "shak", "clumsy", "control", "weird", "scared", "stiff", "anxious"]] },
      { type: "infer", q: "Why didn't Jonah hear the last few names?", answer: "He was so happy and excited to see his own name on the list.", hint: "Reread the very last sentence.", keys: [["happy", "excited", "his name", "own name", "made the team", "grin", "proud", "glad"]] }
    ] },
  { id: "r6-03", grade: 6, title: "Tiny Plastic, Big Problem",
    text: "Plastic doesn't truly go away. Over time, sunlight and waves break bottles and bags into tiny pieces called microplastics, some smaller than a grain of sand. Scientists have found microplastics on the tops of mountains, at the bottom of the ocean, and inside fish, birds, and even people. Researchers are still learning what harm they may cause. Many communities are trying to reduce plastic waste by banning plastic bags, recycling, and encouraging people to use refillable bottles.",
    questions: [
      { type: "main", q: "What is the main idea of this paragraph?", answer: "Plastic breaks into tiny microplastics that end up everywhere, so communities are trying to use less plastic.", hint: "What happens to plastic, and what are people doing about it?", keys: [["plastic"], ["tiny", "small", "piece", "break", "micro", "everywhere", "reduce", "less"]] },
      { type: "detail", q: "Name two places where microplastics have been found.", answer: "On mountaintops and at the bottom of the ocean (also inside fish, birds and people).", hint: "Reread the third sentence.", keys: [["mountain", "ocean", "sea", "fish", "bird", "people", "human"]] },
      { type: "infer", q: "Why does the author say plastic \"doesn't truly go away\"?", answer: "Because it doesn't disappear; it just breaks into smaller and smaller pieces.", hint: "Reread the second sentence.", keys: [["break", "smaller", "tiny", "piece", "still there", "stays"]] }
    ] },

  /* ---------------- GRADE 7 ---------------- */
  { id: "r7-01", grade: 7, title: "The Dust Bowl",
    text: "During the 1930s, a severe drought struck the southern Great Plains. For years, farmers had plowed up the deep-rooted prairie grasses that held the soil in place, planting wheat instead. When the rain stopped, the crops died and the exposed topsoil turned to dust. Fierce winds lifted it into enormous black clouds, called \"black blizzards,\" that buried homes and darkened skies as far away as New York. Thousands of families abandoned their farms. Afterward, the government taught farmers to plant trees as windbreaks and to rotate crops to protect the soil.",
    questions: [
      { type: "main", q: "Summarize the causes and effects of the Dust Bowl.", answer: "Plowing up the prairie grasses plus a long drought let the soil blow away in huge dust storms, which forced families to leave and led to better farming methods.", hint: "What caused the dust, and what happened because of it?", keys: [["drought", "rain", "grass", "plow", "farm"], ["dust", "storm", "blizzard", "wind", "left", "abandon", "leave"]] },
      { type: "infer", q: "How did farmers' own actions help cause the Dust Bowl?", answer: "They plowed up the grasses whose roots held the soil, so the soil blew away when it dried out.", hint: "Reread the second sentence. What held the soil in place?", keys: [["grass", "root"], ["soil", "dirt", "held", "hold"]] },
      { type: "vocab", q: "What does \"abandoned\" mean in this passage?", answer: "Left behind for good.", hint: "What did the families do with their farms?", keys: [["left", "leave", "gave up", "give up", "moved away", "quit", "deserted"]] }
    ] },
  { id: "r7-02", grade: 7, title: "The Fallen Tree",
    text: "Aria and Kai hadn't spoken since the argument over the science project. Each blamed the other for the poster that fell apart in front of the class. On Saturday, a storm knocked a tree across the creek path they both used to get to the library. Aria arrived to find Kai trying to drag the trunk aside. Without a word, she grabbed the other end. It took twenty minutes, mud to their knees, before the path was clear. Kai laughed first. \"Our poster was worse than this tree,\" he said. Aria laughed too, and they walked to the library together.",
    questions: [
      { type: "main", q: "What is the theme, or lesson, of this story?", answer: "Working together can help people get past an argument and become friends again.", hint: "How did Aria and Kai change from the beginning to the end?", keys: [["together", "team", "help", "cooperat", "work"], ["friend", "forgive", "argument", "make up", "past", "fight", "anger"]] },
      { type: "detail", q: "What were Aria and Kai arguing about?", answer: "Who was to blame for their science project poster falling apart.", hint: "Reread the first two sentences.", keys: [["poster", "project"]] },
      { type: "infer", q: "Why do you think Kai made a joke about the poster?", answer: "To show he wasn't angry anymore and to make up with Aria.", hint: "What had just happened between them?", keys: [["make up", "friend", "sorry", "angry", "mad", "fun", "forgive", "better", "relax", "ice", "laugh"]] }
    ] },
  { id: "r7-03", grade: 7, title: "Why Pollinators Matter",
    text: "About one out of every three bites of food we eat depends on pollinators such as bees, butterflies, and bats. When a bee visits a flower to drink nectar, pollen sticks to its fuzzy body. At the next flower, some of that pollen rubs off, allowing the plant to make seeds and fruit. In recent decades, many bee populations have declined because of habitat loss, pesticides, and disease. If pollinators disappeared, foods like apples, almonds, and blueberries could become rare and expensive.",
    questions: [
      { type: "main", q: "What is the author's main point?", answer: "Pollinators like bees help plants make much of our food, but they are declining, which could hurt our food supply.", hint: "Why do pollinators matter, and what is happening to them?", keys: [["bee", "pollinat"], ["food", "fruit", "seed", "plant", "declin", "disappear", "fewer"]] },
      { type: "detail", q: "Name two reasons bee populations have declined.", answer: "Habitat loss, pesticides, and disease.", hint: "Reread the fourth sentence.", keys: [["habitat", "pesticide", "disease"]] },
      { type: "infer", q: "Why might apples become expensive if bees disappeared?", answer: "Without bees to carry pollen, fewer apples would grow, so they'd be rare and cost more.", hint: "Connect the third sentence to the last one.", keys: [["pollen", "pollinat", "bee"], ["fewer", "less", "rare", "grow", "not as many"]] }
    ] }
];

BD.READ_TYPES = {
  main: { label: "Main idea", tips: [
    "Ask: what is almost every sentence about?",
    "For a story, tell the beginning, the problem, and how it ends in one or two sentences.",
    "The theme is the lesson a character learns. Ask how the character changed."
  ] },
  detail: { label: "Details", tips: [
    "Find the key word from the question in the passage, then read that sentence slowly.",
    "Use the passage's words to prove your answer.",
    "If it asks for two things, give two things."
  ] },
  infer: { label: "Reading between the lines", tips: [
    "The answer isn't written out. Use clues from the text plus what you already know.",
    "Ask: why would a person (or animal) do that? How would I feel?",
    "Start with \"I think... because the passage says...\""
  ] },
  vocab: { label: "Word meaning", tips: [
    "Reread the sentence before and after the word for clues.",
    "Try swapping in your own word. Does the sentence still make sense?",
    "Ask how the character is feeling when it's a phrase like \"stomach twisted.\""
  ] }
};
