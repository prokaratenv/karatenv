/*
  SPELLING BANK — Spelling Bee
  ============================
  For each grade: [word, a sentence that uses it, with ___ where the word goes].
  Add words by copying a line. Grades: -1 = Pre-K, 0 = Kindergarten, 1–8.
*/
window.BD = window.BD || {};

BD.SPELLING = {
  "-1": [
    ["cat", "The ___ says meow."], ["dog", "The ___ wags its tail."], ["sun", "The ___ is hot and bright."], ["hat", "Put a ___ on your head."],
    ["red", "A fire truck is ___."], ["big", "An elephant is very ___."], ["mom", "I love my ___."], ["dad", "My ___ reads to me."],
    ["cup", "Drink milk from a ___."], ["bus", "We ride the ___ to school."], ["pig", "The ___ rolls in the mud."], ["bed", "I sleep in my ___."]
  ],
  "0": [
    ["the", "I see ___ moon."], ["and", "Mom ___ Dad are here."], ["see", "I can ___ the bird."], ["can", "I ___ jump high."],
    ["like", "I ___ to play."], ["run", "Watch me ___ fast!"], ["fish", "A ___ swims in the pond."], ["jump", "Frogs ___ in the grass."],
    ["play", "Let's ___ tag."], ["look", "___ at the stars!"], ["you", "I like ___."], ["frog", "The green ___ says ribbit."]
  ],
  "1": [
    ["said", "Zumi ___, \"Let's train!\""], ["they", "Where did ___ go?"], ["come", "Can you ___ to my house?"], ["some", "May I have ___ water?"],
    ["were", "We ___ at the park."], ["there", "Put the ball over ___."], ["green", "Grass is ___."], ["school", "I learn at ___."],
    ["house", "My ___ has a red door."], ["little", "The ___ bird is tiny."], ["where", "___ is my shoe?"], ["kick", "Show me a front ___."]
  ],
  "2": [
    ["because", "I wore a coat ___ it was cold."], ["before", "Wash your hands ___ you eat."], ["every", "I practice ___ day."], ["again", "Let's try that ___."],
    ["people", "Many ___ came to the show."], ["write", "I can ___ my name."], ["always", "Black belts ___ show respect."], ["laugh", "Funny jokes make me ___."],
    ["together", "We work ___ as a team."], ["friend", "My best ___ lives next door."], ["animal", "A lion is a wild ___."], ["should", "You ___ bow when you enter the dojo."]
  ],
  "3": [
    ["different", "Every snowflake is ___."], ["beautiful", "The sunset is ___."], ["believe", "I ___ in you!"], ["favorite", "Pizza is my ___ food."],
    ["enough", "Do we have ___ snacks for everyone?"], ["answer", "Raise your hand to ___."], ["ocean", "Whales swim in the ___."], ["question", "May I ask a ___?"],
    ["through", "We walked ___ the forest."], ["thought", "I ___ about my plan."], ["library", "I borrow books from the ___."], ["island", "The ___ had sandy beaches."]
  ],
  "4": [
    ["although", "I kept going ___ I was tired."], ["character", "The main ___ was brave."], ["community", "Our ___ cleaned the park."], ["disappear", "Magicians make coins ___."],
    ["especially", "I love fruit, ___ mangoes."], ["experience", "Camp was a great ___."], ["February", "___ is the shortest month."], ["interesting", "That book was very ___."],
    ["language", "Spanish is a beautiful ___."], ["probably", "It will ___ rain today."], ["surprise", "We planned a ___ party."], ["temperature", "The ___ dropped below freezing."]
  ],
  "5": [
    ["ancient", "The pyramids are ___."], ["calendar", "Mark the date on the ___."], ["committee", "The ___ voted on the plan."], ["definitely", "I will ___ be there."],
    ["environment", "We protect the ___ by recycling."], ["familiar", "That song sounds ___."], ["government", "The ___ makes laws."], ["immediately", "Call me ___ if you need help."],
    ["necessary", "Water is ___ for life."], ["opinion", "In my ___, karate is the best sport."], ["restaurant", "We ate dinner at a ___."], ["separate", "Keep the eggs ___ from the milk."]
  ],
  "6": [
    ["accommodate", "The gym can ___ two hundred people."], ["acquire", "Practice helps you ___ new skills."], ["conscious", "Be ___ of your posture."], ["embarrass", "Please don't ___ me in front of my friends."],
    ["exaggerate", "Don't ___; the fish wasn't that big."], ["foreign", "She speaks a ___ language."], ["mischievous", "The ___ puppy chewed my shoe."], ["occasion", "A black belt test is a special ___."],
    ["parallel", "The two lines are ___."], ["privilege", "It is a ___ to train here."], ["recommend", "I ___ this book to everyone."], ["rhythm", "Clap to the ___ of the song."]
  ],
  "7": [
    ["acknowledge", "Always ___ your opponent with a bow."], ["apparent", "It was ___ that she had practiced."], ["category", "Choose a ___ for the quiz."], ["conscience", "Let your ___ guide you."],
    ["discipline", "A black belt takes ___ and focus."], ["existence", "Scientists studied the ___ of water on Mars."], ["guidance", "Thank you for your ___, Sensei."], ["maintenance", "The car needs regular ___."],
    ["millennium", "A ___ is one thousand years."], ["noticeable", "Her improvement was ___."], ["occurrence", "Snow in May is a rare ___."], ["perseverance", "Earning a belt takes ___."]
  ],
  "8": [
    ["camouflage", "The lizard used ___ to hide."], ["colleague", "My mom's ___ came to dinner."], ["conscientious", "A ___ student checks her work."], ["dilemma", "Choosing between the two was a real ___."],
    ["entrepreneur", "The ___ started her own business."], ["hierarchy", "Belt ranks show a ___ in the dojo."], ["liaison", "He served as a ___ between the teams."], ["maneuver", "The pilot made a sharp ___."],
    ["onomatopoeia", "\"Buzz\" is an example of ___."], ["silhouette", "We saw his ___ against the sunset."], ["unanimous", "The vote was ___: everyone agreed."], ["vacuum", "Please ___ the living room."]
  ]
};

/* More words (added for the extra spelling challenge styles). */
(function (more) {
  Object.keys(more).forEach(function (g) {
    const list = BD.SPELLING[g] = BD.SPELLING[g] || [];
    more[g].forEach(function (x) { if (!list.some(function (y) { return y[0] === x[0]; })) list.push(x); });
  });
})({
  "-1": [
    ["box", "Put the toys in the ___."], ["sit", "Please ___ on the mat."], ["hop", "Bunnies ___ and play."], ["bug", "A tiny ___ is on the leaf."],
    ["fan", "Turn on the ___ when it is hot."], ["hen", "The ___ lays an egg."], ["mat", "We bow on the ___."], ["pen", "I draw with a ___."],
    ["top", "Spin the ___!"], ["web", "The spider made a ___."], ["zip", "___ up your coat."], ["leg", "I kick with my ___."]
  ],
  "0": [
    ["she", "___ is my sister."], ["go", "Ready, set, ___!"], ["we", "___ love karate."], ["my", "This is ___ belt."],
    ["up", "Look ___ at the sky."], ["is", "The sky ___ blue."], ["it", "Kick ___ high!"], ["at", "Look ___ me!"],
    ["help", "Can you ___ me?"], ["stop", "Red means ___."], ["ball", "Throw the ___ to me."], ["tree", "A bird sat in the ___."]
  ],
  "1": [
    ["what", "___ is your name?"], ["who", "___ is at the door?"], ["many", "How ___ apples do you have?"], ["sleep", "I ___ in my bed."],
    ["happy", "A big smile means you are ___."], ["water", "Fish live in the ___."], ["after", "We play ___ school."], ["paper", "Write on the ___."],
    ["night", "The moon comes out at ___."], ["block", "Raise your arm to ___ the punch."], ["thank", "Always ___ your teacher."], ["first", "Who is ___ in line?"]
  ],
  "2": [
    ["around", "We ran ___ the track."], ["early", "I wake up ___ to train."], ["learn", "We come to school to ___."], ["balance", "Stand on one foot to practice ___."],
    ["kitchen", "Mom cooks in the ___."], ["pretty", "The flowers are ___."], ["really", "I ___ like karate!"], ["minute", "Wait one ___, please."],
    ["brother", "My little ___ is five."], ["sister", "My ___ has a yellow belt."], ["window", "Look out the ___."], ["upon", "Once ___ a time, there was a dragon."]
  ],
  "3": [
    ["caught", "I ___ the ball with both hands."], ["neighbor", "Our ___ has a friendly dog."], ["eight", "A spider has ___ legs."], ["piece", "May I have a ___ of cake?"],
    ["daughter", "Their ___ just earned a green belt."], ["remember", "Always ___ to bow."], ["special", "Today is a ___ day."], ["weight", "Lift the ___ slowly."],
    ["heard", "I ___ a loud noise."], ["build", "Let's ___ a fort."], ["straight", "Stand up ___ and tall."], ["usually", "I ___ eat breakfast at seven."]
  ],
  "4": [
    ["business", "Her ___ sells cupcakes."], ["height", "Measure your ___ on the wall."], ["exercise", "Daily ___ keeps you strong."], ["knowledge", "Reading gives you ___."],
    ["neighborhood", "We walk around the ___."], ["guess", "Can you ___ my favorite color?"], ["receive", "You will ___ a new belt."], ["science", "We did an experiment in ___ class."],
    ["vegetable", "A carrot is a ___."], ["weird", "That noise sounded ___."], ["breathe", "Remember to ___ while you stretch."], ["courage", "It takes ___ to try something new."]
  ],
  "5": [
    ["achieve", "Work hard and you will ___ your goals."], ["argument", "They had an ___ about the rules."], ["villain", "The ___ lost in the end."], ["exhausted", "I was ___ after the tournament."],
    ["guarantee", "Practice is the best ___ of success."], ["license", "My dad has a driver's ___."], ["mysterious", "A ___ box sat on the porch."], ["occurred", "The mistake ___ yesterday."],
    ["recognize", "I didn't ___ you with your new haircut."], ["rhyme", "\"Cat\" and \"hat\" ___."], ["schedule", "Class is on the ___ for Monday."], ["tomorrow", "Our test is ___."]
  ],
  "6": [
    ["beginning", "The ___ of the story was exciting."], ["cemetery", "Old trees grow by the ___."], ["deceive", "Never ___ your friends."], ["equipment", "Put away the sparring ___."],
    ["fluorescent", "The ___ lights hummed."], ["harass", "Bullies should never ___ others."], ["humorous", "The movie was very ___."], ["independent", "She is an ___ thinker."],
    ["lightning", "___ flashed across the sky."], ["miniature", "She built a ___ dojo."], ["possession", "My belt is my favorite ___."], ["referred", "The coach ___ me to a new class."]
  ],
  "7": [
    ["accidentally", "I ___ dropped my water bottle."], ["bureau", "The travel ___ helped us plan."], ["committed", "She is ___ to her training."], ["correspondence", "Keep your ___ in a folder."],
    ["fascinate", "Planets ___ me."], ["hypocrisy", "Saying one thing and doing another is ___."], ["irresistible", "The cookies were ___."], ["questionnaire", "Please fill out the ___."],
    ["reminiscent", "The smell is ___ of my grandma's kitchen."], ["surveillance", "The bank uses ___ cameras."], ["threshold", "Pause at the ___ of the dojo and bow."], ["vengeance", "A true martial artist does not seek ___."]
  ],
  "8": [
    ["acquiesce", "He chose to ___ to the group's decision."], ["bourgeois", "The novel described a ___ family."], ["connoisseur", "My uncle is a cheese ___."], ["idiosyncrasy", "Humming while she works is her ___."],
    ["inoculate", "Doctors ___ people against disease."], ["mnemonic", "A ___ helps you remember facts."], ["pharaoh", "The ___ ruled ancient Egypt."], ["rendezvous", "We set a ___ point at the park."],
    ["sacrilegious", "Some thought the joke was ___."], ["supersede", "The new rule will ___ the old one."], ["vicissitude", "Life's ___ teaches resilience."], ["sovereign", "The ___ ruled the kingdom wisely."]
  ]
});
