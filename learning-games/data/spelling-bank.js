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

/* THE BIG WORD BANK — about 250 words for Pre-K, 350 for K and 500+ for
   1st to 8th grade, following each grade's spelling patterns (short vowels
   and digraphs early, then silent e, vowel teams, r-controlled vowels,
   diphthongs, suffixes and prefixes, homophones, and Greek and Latin roots).
   One word per line:   word|a sentence with ___ where the word goes
   The ___ must appear exactly once. A word already in that grade is skipped.
   BD.Phonics (js/phonics.js) tags every word with its spelling patterns
   automatically, so new words need no extra labels. */
(function () {
  function add(g, text) {
    const list = BD.SPELLING[g] = BD.SPELLING[g] || [];
    const have = {};
    list.forEach(function (x) { have[x[0].toLowerCase()] = 1; });
    text.split("\n").forEach(function (line) {
      const i = line.indexOf("|");
      if (i < 1) return;
      const w = line.slice(0, i).trim(), s = line.slice(i + 1).trim();
      if (!w || s.split("___").length !== 2 || have[w.toLowerCase()]) return;
      have[w.toLowerCase()] = 1;
      list.push([w, s]);
    });
  }
  add("-1", `
bat|A ___ flies at night.
cap|He wears a ___ on his head.
map|We use a ___ to find the way.
van|The family rides in a big ___.
jam|I like grape ___ on my toast.
bag|Put your lunch in the ___.
nap|The baby takes a ___ after lunch.
pan|Dad cooks eggs in a ___.
rat|The ___ has a long pink tail.
ham|We had a ___ sandwich for lunch.
tag|You are it! Let's play ___.
wag|Dogs ___ their tails when they are happy.
sad|The lost puppy looks ___.
lap|The kitten sits on my ___.
tap|___ the drum with your stick.
cab|We took a yellow ___ to the zoo.
ram|The ___ has big curly horns.
net|Catch the fish with a ___.
wet|The rain made me all ___.
jet|A ___ zooms across the sky.
ten|I have ___ toes on my two feet.
men|Two ___ fixed the road.
pet|My ___ goldfish is orange.
vet|The ___ helps sick animals.
yes|Say ___ or no.
lid|Put the ___ back on the pot.
wig|The clown wore a funny orange ___.
pin|Mom used a ___ to fix my sleeve.
bib|The baby wears a ___ when she eats.
fin|A shark has a ___ on its back.
kid|A baby goat is called a ___.
lip|I put balm on my dry ___.
dig|Dogs like to ___ holes in the sand.
mix|___ the paint to make green.
six|A bug has ___ legs.
win|I hope our team will ___!
fig|A ___ is a sweet, soft fruit.
hip|Put your hands on your ___.
pot|The soup is in the ___.
mop|Clean the wet floor with a ___.
log|The frog sits on a ___.
fox|The red ___ has a bushy tail.
hog|The ___ oinks in the pen.
dot|Put a ___ at the end of the sentence.
cot|Baby sleeps on a little ___.
job|My ___ is to feed the cat.
hot|The stove is ___. Don't touch!
rod|Dad caught a fish with his ___.
rug|The dog naps on the ___.
mud|The pig rolls in the ___.
nut|The squirrel eats a ___.
hug|Give Grandma a big ___.
tub|I take a bath in the ___.
cub|A baby bear is a ___.
gum|Please do not chew ___ in class.
bun|I ate a hot dog on a ___.
pup|A baby dog is a ___.
jug|Pour the milk from the ___.
hut|They lived in a little grass ___.
blue|The sky is ___.
pink|Pigs are ___.
tan|Sand is a light ___ color.
ant|A tiny ___ walks on the hill.
cow|The ___ says moo.
bee|A ___ makes honey.
owl|The ___ says hoo hoo.
duck|The ___ says quack.
yak|A ___ is a big furry ox.
me|Please pass the ball to ___.
no|Yes or ___?
in|The fish swims ___ the water.
on|Put your shoes ___ your feet.
am|I ___ four years old.
baby|The ___ drinks from a bottle.
egg|A chick hatches from an ___.
zoo|We saw lions at the ___.
sock|I lost one ___ in the wash.
ox|An ___ can pull a heavy cart.
`);
  add("0", `
he|Dad said ___ will cook dinner.
do|What will we ___ at the park today?
so|I am ___ happy to see you!
get|Can you ___ me a cup?
has|The cat ___ a soft tail.
his|Ben put on ___ coat.
her|Mom read ___ book.
him|I gave ___ a high five.
not|I am ___ sleepy yet.
but|I am small, ___ I am strong.
with|I play ___ my friends.
this|___ is my best drawing.
that|Look at ___ big truck over there!
of|I drank a cup ___ milk.
was|Yesterday it ___ sunny.
are|We ___ on the same team.
have|I ___ two hands.
here|Come over ___ and sit by me.
for|This gift is ___ you.
down|Sit ___ on the mat.
two|I have ___ eyes.
one|A unicorn has ___ horn.
three|A triangle has ___ sides.
four|A dog has ___ legs.
five|I have ___ fingers on one hand.
all|We ate ___ of the cake.
went|We ___ to the park.
into|The frog jumped ___ the pond.
black|A crow is ___.
white|Snow is ___.
brown|Mud is ___.
gray|The elephant is big and ___.
yellow|A banana is ___.
dip|I ___ my chip in the salsa.
fit|My old shoes do not ___ anymore.
sip|Take a ___ of water.
tip|Stand on the ___ of your toes.
hum|I like to ___ a song.
cut|Mom will ___ the pizza.
fun|The party was so much ___!
wax|The candle is made of ___.
fix|Dad can ___ my bike.
pal|You are my best ___.
yum|___! This soup tastes good.
hid|The cat ___ under the bed.
dug|The dog ___ a hole.
mug|Grandpa drinks from a big ___.
sat|The cat ___ on the mat.
hill|We rolled down the grassy ___.
doll|My ___ has a pink dress.
bell|Ring the ___ to start class.
mess|Clean up the ___ please.
puff|The wolf will huff and ___.
will|I ___ help you clean up.
tell|Please ___ me a story.
well|We got water from the ___.
ship|The big ___ sails on the sea.
shop|We ___ for food at the store.
shell|I found a ___ at the beach.
chin|My ___ is under my mouth.
chip|I ate a corn ___.
chop|Dad will ___ the wood.
much|Thank you very ___!
bath|I take a ___ every night.
math|We count and add in ___.
path|Walk on the ___ in the woods.
thin|The paper is very ___.
then|First we eat, ___ we play.
them|I love my dogs and I hug ___.
wish|Blow out the candles and make a ___.
dish|Put the food in the ___.
back|I carry my bag on my ___.
pack|___ your bag for the trip.
rock|I sat on a big ___.
lock|Use a key to open the ___.
neck|A giraffe has a long ___.
luck|Good ___ on your test!
chick|The ___ says peep peep.
moth|A ___ flew to the light.
flag|We wave the ___ on the Fourth of July.
clap|___ your hands to the beat.
crab|A ___ walks sideways.
drum|Bang the ___!
glad|I am ___ you came.
grin|She had a big ___ on her face.
plan|What is the ___ for today?
snap|___ your fingers.
spin|Watch the top ___ around.
step|Take one ___ forward.
swim|Fish ___ in the sea.
trip|We took a ___ to the beach.
best|You are the ___!
fast|A cheetah runs very ___.
hand|Raise your ___ to ask.
milk|Cows give us ___.
nest|The bird sits in its ___.
sand|We built a castle in the ___.
tent|We slept in a ___ when we camped.
lamp|Turn on the ___ so we can read.
gift|I wrapped a ___ for my friend.
belt|I tie my karate ___.
sled|We rode the ___ down the snowy hill.
plum|A ___ is a purple fruit.
spot|A ladybug has a black ___ on its back.
skip|Let's ___ down the sidewalk.
bird|The ___ sings in the tree.
bunny|The ___ hops in the grass.
boy|The ___ ran to his dad.
girl|The ___ ran to her mom.
funny|The clown is so ___.
away|The bird flew ___.
good|You did a ___ job!
eat|We ___ lunch at noon.
now|It is time to go ___.
out|Let the dog go ___.
be|I want to ___ a vet.
pond|Ducks swim in the ___.
camp|We sleep in tents at ___.
bump|I got a ___ on my head.
mask|I wore a cat ___ for the play.
ring|She wears a gold ___.
sing|Let's ___ a song.
king|The ___ wears a crown.
long|A snake is very ___.
song|We sang a happy ___.
quack|The duck says ___.
yell|Do not ___ inside.
`);
  add("-1", `
gap|Mind the ___ between the train and the platform.
jab|In karate, a ___ is a quick punch with your front hand.
lab|The scientist works in a ___.
pad|I kick the ___ that my teacher holds.
rag|Wipe the spill with a ___.
yam|A ___ is an orange root we can bake.
sap|Sticky ___ drips from the maple tree.
dab|Put a ___ of glue on the paper.
pat|Give the puppy a gentle ___.
vat|The farmer made cheese in a big ___.
wed|My aunt and uncle will ___ in June.
den|The fox sleeps in its ___.
fed|I ___ the fish this morning.
peg|Hang your coat on the ___.
let|Please ___ me have a turn.
met|We ___ a new friend at the park.
set|Help me ___ the table for dinner.
kit|I have a first aid ___.
lit|Dad ___ the candles on the cake.
pit|A peach has a big ___ in the middle.
bin|Put the cans in the recycling ___.
rib|You have a ___ bone in your chest.
rim|The ball rolled around the ___ of the hoop.
tin|The cookies are in a ___ box.
jig|We danced a happy ___.
fog|We could not see far in the ___.
jog|Dad and I ___ around the block.
bog|Frogs live in the wet ___.
cob|I ate corn on the ___.
pod|Peas grow in a ___.
pop|I heard the balloon ___!
nod|___ your head if you agree.
lot|We parked in the parking ___.
tot|A ___ is a very little child.
rub|___ the lotion on your hands.
tug|We play ___ of war.
bud|A flower ___ will open soon.
sum|The ___ of two and two is four.
hub|The middle of a wheel is the ___.
sub|We ate a turkey ___ for lunch.
pug|A ___ is a small dog with a flat face.
tax|We paid ___ on the new toy.
kiss|Mom gave me a goodnight ___.
hiss|Snakes ___.
buzz|Bees ___ in the garden.
fizz|The soda has lots of ___.
jazz|Grandpa likes to listen to ___ music.
fuzz|A peach has soft ___ on its skin.
pass|___ the ball to me!
toss|___ the beanbag into the bucket.
moss|Green ___ grows on the rock.
miss|I ___ my grandma when she is away.
tuck|Mom will ___ me into bed.
deck|We sat on the back ___.
peck|A hen will ___ at the corn.
pick|___ a card, any card!
lick|My dog likes to ___ my face.
sack|Santa carries a big ___ of toys.
rack|Hang your towel on the ___.
dock|The boat is tied to the ___.
shed|The rake is in the ___.
shut|Please ___ the door.
rush|We had to ___ to catch the bus.
hush|___, the baby is sleeping.
cash|I paid with ___.
dash|Make a mad ___ to the finish line!
mash|Let's ___ the potatoes.
such|You are ___ a good helper!
rich|The cake is very ___ and sweet.
chat|I like to ___ with my friends.
thud|The book fell with a ___.
when|___ is lunch?
bang|I heard a loud ___.
hang|___ your coat on the hook.
sang|We ___ happy birthday.
rang|The bell ___ for recess.
fang|The snake has a sharp ___.
wing|The bird hurt its ___.
lung|You breathe with each ___.
hung|We ___ the picture on the wall.
lion|The ___ has a big mane.
tiger|The ___ has orange and black stripes.
horse|I rode a ___ at the farm.
seal|The ___ balanced a ball on its nose.
whale|A ___ is a huge sea animal.
zebra|A ___ has black and white stripes.
panda|The ___ eats bamboo.
kitty|The ___ purrs on my lap.
worm|The bird caught a ___.
ear|I hear with my ___.
head|I wear a hat on my ___.
tummy|My ___ is full after dinner.
pie|We baked an apple ___.
pea|A ___ is a small green ball you can eat.
bread|We made toast from the ___.
soup|I ate hot ___ on a cold day.
pizza|We eat ___ on Friday nights.
taco|I ate a ___ with cheese.
gold|The crown is made of ___.
papa|My ___ gives the best hugs.
mama|The baby said "___" for the first time.
nana|My ___ bakes cookies with me.
wind|The ___ blew my hat away.
door|Knock on the ___.
sofa|We sat on the ___ to read.
cheese|Mice like ___.
hippo|A ___ likes to sit in the mud.
koala|A ___ sleeps in a tree.
otter|The ___ floats on its back.
moose|A ___ has big antlers.
pony|I rode a ___ at the fair.
jelly|I like peanut butter and ___.
pasta|We had ___ with sauce.
salad|I ate a green ___.
lime|A ___ is a little green fruit.
kiwi|A ___ is brown on the outside and green inside.
melon|We cut the ___ into slices.
belly|The puppy rolled over to get a ___ rub.
crib|The baby sleeps in a ___.
wall|We hung art on the ___.
roof|The cat sat on the ___.
pants|I put on my ___ and shirt.
vest|He wore a puffy ___.
glove|I lost my left ___.
taxi|We rode in a ___.
grandpa|My ___ takes me fishing.
grandma|My ___ reads me stories.
uncle|My ___ is my dad's brother.
man|The ___ fixed our sink.
tall|A giraffe is very ___.
call|I will ___ you on the phone.
fall|Leaves ___ from the trees.
fill|___ the cup with water.
fell|I tripped and ___ down.
moo|A cow says ___.
oink|A pig says ___.
meow|A kitten says ___.
woof|A dog says ___.
spider|The ___ has eight legs.
teddy|I hug my ___ bear.
crayon|I color with a red ___.
music|We dance to the ___.
love|I ___ my family.
hi|Say ___ to your new friend.
`);
  add("0", `
bad|The milk smells ___ so we threw it out.
hit|I ___ the ball with my bat.
jot|___ down your name on the list.
rot|Old apples will ___.
cod|A ___ is a kind of fish.
mob|A ___ of fans ran onto the field.
pun|My dad loves to tell a silly ___.
lug|I had to ___ the heavy bag up the stairs.
clam|A ___ has a shell that opens and shuts.
clip|___ the papers together.
clog|Hair can ___ the drain.
club|I joined the book ___.
crop|The farmer picked the corn ___.
drag|Don't ___ your bag on the floor.
drip|I heard the faucet ___.
drop|Don't ___ the eggs!
flap|The bird will ___ its wings.
flat|My bike has a ___ tire.
flip|Can you do a ___ on the trampoline?
flop|The fish began to ___ on the dock.
grab|___ a cup and get some water.
grip|Keep a good ___ on the rope.
plop|The frog jumped in with a ___.
plug|___ in the lamp.
plus|Two ___ two is four.
skid|The car began to ___ on the ice.
skin|Put sunscreen on your ___.
slam|Please don't ___ the door.
slim|The snake is long and ___.
slip|Be careful not to ___ on the ice.
slot|Put a coin in the ___.
slug|A ___ is slimy and slow.
snip|___ the string with the scissors.
snug|I am ___ in my warm bed.
spun|The top ___ around and around.
stem|A flower has a long green ___.
stub|I ___ my toe on the chair.
swam|The duck ___ across the pond.
trap|The spider's web is a ___ for flies.
trim|Mom will ___ my bangs.
trot|The pony began to ___.
twig|The bird used a ___ to build its nest.
twin|My ___ brother looks just like me.
brick|The house is made of red ___.
click|___ the mouse to start the game.
crack|There is a ___ in the sidewalk.
quick|The rabbit is very ___.
stack|___ the blocks up high.
stuck|My kite got ___ in a tree.
trick|My dog can do a ___.
band|The ___ played at the parade.
bend|___ your knees when you jump.
bent|I ___ down to tie my shoe.
dent|There is a ___ in the car door.
desk|I do my work at my ___.
disk|The ___ spun in the air like a frisbee.
dust|Wipe the ___ off the shelf.
fist|Make a ___ and punch the pad.
gasp|We heard a ___ from the crowd.
golf|Grandpa plays ___ on Saturdays.
gust|A ___ of wind blew my hat off.
hunt|We went on an egg ___.
just|I ___ finished my snack.
kept|I ___ my room clean all week.
land|The plane will ___ soon.
last|Z is the ___ letter.
left|Raise your ___ hand.
lend|Can you ___ me a pencil?
lift|Can you ___ this box?
list|Make a ___ of things to pack.
lost|I ___ my mitten.
melt|The ice cream will ___ in the sun.
mend|Grandma will ___ the hole in my sock.
mint|A ___ makes your breath fresh.
pump|Use a ___ to fill the tire with air.
raft|We floated down the river on a ___.
rest|Take a ___ after you run.
rust|The old bike is covered in ___.
send|I will ___ you a card.
silk|The scarf is made of ___.
soft|The kitten is ___.
tusk|An elephant has a long white ___.
west|The sun sets in the ___.
must|You ___ wear a helmet.
honk|The car horn went ___!
wink|___ one eye.
dunk|I like to ___ my cookie in milk.
bunk|I sleep on the top ___.
chunk|I ate a big ___ of cheese.
plank|We walked across the wooden ___.
blink|Don't ___ or you'll miss it!
strong|Karate makes me ___.
spring|Flowers bloom in the ___.
sting|A bee can ___ you.
chest|The pirate found a treasure ___.
chimp|The ___ swung from the tree.
champ|You are the ___!
check|Let me ___ your work.
chess|We play ___ on a board with kings and queens.
crunch|Carrots ___ when you bite them.
munch|Rabbits ___ on carrots.
pinch|Add a ___ of salt.
punch|Throw a straight ___.
bunch|We picked a ___ of grapes.
ranch|Cowboys work on a ___.
branch|The bird sat on a ___.
flash|I saw a ___ of lightning.
fresh|We picked ___ strawberries.
smash|Don't ___ the cookies in your bag.
crash|We heard a loud ___.
trash|Put the ___ in the can.
blush|My cheeks ___ when I'm shy.
shelf|Put the book on the ___.
shift|The wind began to ___.
shrimp|A ___ has lots of legs.
shrub|A ___ is a small bush.
thump|The big box hit the floor with a ___.
sixth|My cousin is in ___ grade.
tenth|This is my ___ birthday!
whisk|Use a ___ to mix the eggs.
grill|Dad cooks burgers on the ___.
pill|The vet gave my dog a ___.
chill|There is a ___ in the air.
drill|We had a fire ___ today.
gull|A sea ___ flew over the beach.
bull|The ___ has big horns.
pull|Push the door, don't ___.
full|My plate is ___.
stuff|Put your ___ in your cubby.
fluff|___ up your pillow.
sniff|The dog likes to ___ the flowers.
stiff|My legs are ___ after the long ride.
off|Turn ___ the light.
floss|___ your teeth every night.
cross|Look both ways before you ___ the street.
press|___ the button.
by|I sat ___ my friend.
did|I ___ my homework.
had|I ___ a great day.
if|___ it rains, we will stay inside.
ran|I ___ all the way home.
saw|I ___ a rainbow.
us|Come with ___ to the park.
soon|We will be there ___.
please|May I ___ have a cookie?
ate|I ___ all my peas.
new|I got ___ shoes.
or|Do you want milk ___ juice?
cats|The two ___ are napping.
dogs|The ___ barked at the mail truck.
hats|We wore party ___.
beds|We made our ___ this morning.
bugs|We looked for ___ under the rock.
pigs|The ___ rolled in the mud.
hens|The ___ laid eggs.
pens|I have red and blue ___.
cups|Set out four ___ for the juice.
maps|We looked at ___ of the world.
nuts|Squirrels hide ___.
bats|The ___ fly at night.
caps|The team wore red ___.
fans|The ___ cheered for the team.
jets|Two ___ flew over the stadium.
legs|A dog has four ___.
pots|We planted seeds in clay ___.
rugs|We shook the dusty ___ outside.
vans|Three ___ took us on the field trip.
webs|Spiders spin ___.
wigs|The actors wore funny ___.
kids|The ___ played tag.
logs|We put ___ on the fire.
mops|We used ___ to clean the floor.
bags|We packed our ___ for the trip.
sits|The cat ___ in the window.
runs|My dog ___ fast.
hops|The bunny ___ in the grass.
digs|The dog ___ in the yard.
naps|The baby ___ after lunch.
hugs|My mom gives the best ___.
pumpkin|We carved a ___.
sunset|We watched the ___ at the beach.
laptop|Dad works on his ___.
zigzag|The path goes in a ___.
upset|The baby was ___ because she was hungry.
cobweb|There is a ___ in the corner.
hilltop|We flew a kite on the ___.
pigpen|The pigs play in the muddy ___.
padlock|The gate has a ___.
gumdrop|I ate a red ___.
chipmunk|A ___ has stripes on its back.
catfish|A ___ has whiskers.
magnet|The ___ stuck to the fridge.
trumpet|He plays the ___ in the band.
helmet|Wear a ___ when you ride your bike.
dragon|The ___ in the story breathed fire.
wagon|I pulled my sister in a red ___.
sorry|I am ___ I bumped you.
gym|We play games in the ___.
`);
  add("1", `
cake|We had chocolate ___ at my party.
make|Let's ___ a card for Grandma.
game|We played a board ___ after dinner.
name|Please write your ___ on the paper.
gate|Close the ___ so the dog stays in the yard.
lake|We swam in the cool, blue ___.
wave|Give a friendly ___ to your neighbor.
plate|Put the cookies on a ___.
shape|A circle is a round ___.
snake|The ___ slid through the grass.
grape|A ___ is a small, round, purple fruit.
skate|I like to ___ on the ice.
brave|The ___ knight helped the dragon.
made|I ___ a sandcastle at the beach.
same|We wear the ___ uniform in class.
came|Grandpa ___ to visit us.
take|Please ___ one cookie.
face|She has a big smile on her ___.
race|The turtle won the ___.
tape|Fix the torn page with ___.
bike|I ride my ___ to the park.
kite|My ___ flew high in the wind.
time|What ___ is it?
ride|Can I ___ the pony?
hide|Let's play ___ and seek.
line|Please stand in a straight ___.
nine|Eight plus one is ___.
smile|Say cheese and ___ for the picture!
slide|I went down the big ___ at the park.
prize|She won first ___ at the science fair.
shine|The stars ___ at night.
bite|Take a ___ of your apple.
wide|The river is very ___.
drive|Mom will ___ us to school.
mice|The cat chased two ___.
rice|We ate ___ and beans for dinner.
home|After school I go ___.
bone|The dog chewed on a ___.
rope|We jump ___ at recess.
nose|I smell with my ___.
hope|I ___ it is sunny tomorrow.
rose|A red ___ grew in the garden.
stone|I skipped a flat ___ on the lake.
note|I wrote a ___ to my friend.
woke|I ___ up early today.
joke|Dad told a funny ___.
hole|The rabbit hid in a ___.
broke|The glass fell and ___.
globe|Find our country on the ___.
those|Are ___ your shoes by the door?
cube|An ice ___ melted in my drink.
cute|The baby panda is so ___!
mule|The ___ carried the bags up the hill.
tube|Squeeze the toothpaste from the ___.
huge|A whale is a ___ animal.
use|You can ___ my crayons.
flute|She plays the ___ in the band.
June|School ends in ___.
these|Are ___ your crayons?
feet|I have two ___.
seed|Plant the ___ in the dirt.
need|Plants ___ water to grow.
week|There are seven days in a ___.
keep|You can ___ the gift.
sheep|The ___ says baa.
sweet|Candy tastes ___.
teeth|Brush your ___ every night.
wheel|The front ___ on my bike is flat.
queen|The ___ wore a crown.
deep|The ocean is very ___.
free|The museum is ___ on Sundays.
read|I like to ___ books.
seat|Please take a ___.
team|We play on the same soccer ___.
beach|We built sandcastles at the ___.
leaf|A red ___ fell from the tree.
clean|Please ___ your room.
dream|I had a happy ___ last night.
peach|A ___ is a fuzzy fruit.
bean|A jelly ___ is a candy.
teach|My big sister will ___ me to swim.
speak|Please ___ up so we can hear you.
heat|The sun gives us light and ___.
sea|The ship sailed on the ___.
rain|We need boots in the ___.
tail|The dog wags its ___.
mail|A letter came in the ___.
wait|Please ___ your turn.
paint|Let's ___ a picture.
train|The ___ chugged down the track.
snail|A ___ carries its shell on its back.
chain|My bike ___ needs oil.
nail|Dad hit the ___ with a hammer.
day|Have a great ___!
say|What did you ___?
way|Which ___ is the park?
stay|You can ___ for dinner.
may|You ___ go out to play.
hay|Horses eat ___.
tray|Carry your lunch on a ___.
clay|I made a bowl out of ___.
boat|We rowed a ___ across the lake.
coat|Wear your warm ___ outside.
goat|The ___ ate the grass.
road|Look both ways before you cross the ___.
soap|Wash your hands with ___.
toad|A ___ is like a bumpy frog.
coach|Our ___ blew the whistle.
float|Ducks ___ on the water.
snow|We built a fort out of ___.
slow|A turtle is very ___.
grow|Plants ___ in the sun.
show|Can you ___ me your drawing?
blow|___ out the candles!
bowl|I eat cereal from a ___.
own|I have my ___ room.
light|Turn on the ___, please.
right|Raise your ___ hand.
high|The bird flew ___ in the sky.
bright|The sun is very ___.
might|It ___ rain later.
tight|My shoes feel too ___.
fly|Birds can ___.
cry|Babies ___ when they are hungry.
try|___ your best!
dry|Use a towel to ___ off.
sky|The ___ is blue today.
why|___ is the sky blue?
shy|The ___ boy hid behind his mom.
puppy|My ___ loves to play fetch.
candy|We got ___ at the party.
penny|A ___ is one cent.
silly|The clown made a ___ face.
sunny|It is a warm, ___ day.
car|We drove to the store in our ___.
star|I wish on a ___.
park|We play on the swings at the ___.
farm|Cows and pigs live on a ___.
barn|The horses sleep in the ___.
yard|The dog runs in the ___.
card|I made a birthday ___ for Dad.
jar|The cookies are in a ___.
dark|It is ___ at night.
art|We paint in ___ class.
arm|I raise my ___ to block.
shark|A ___ has sharp teeth.
horn|A unicorn has one ___.
corn|We ate ___ on the cob.
fork|Eat your salad with a ___.
storm|The ___ had thunder and lightning.
short|A mouse has ___ legs.
born|The puppies were ___ last week.
sport|Soccer is my favorite ___.
north|Birds fly south in fall and ___ in spring.
more|May I have ___ milk, please?
store|We buy food at the ___.
fur|The cat has soft ___.
turn|It is your ___ to roll the dice.
dirt|Worms live in the ___.
shirt|I wore my blue ___.
third|C is the ___ letter of the alphabet.
nurse|The ___ took my temperature.
purple|Grapes are ___.
fern|A ___ is a green, leafy plant.
herd|A ___ of cows ate grass.
curl|The cat likes to ___ up in a ball.
moon|The ___ shines at night.
food|I eat healthy ___.
room|My ___ has a bed and a desk.
cool|The water is nice and ___.
pool|We swim in the ___.
book|I read a ___ before bed.
cook|Mom and I ___ dinner together.
foot|I kick with my right ___.
wood|The table is made of ___.
hook|Hang your coat on the ___.
spoon|Eat your soup with a ___.
boot|I put on my rain ___.
tooth|I lost my first ___!
how|___ old are you?
town|Our ___ has a library and a park.
clown|The ___ had a red nose.
loud|The thunder was very ___.
cloud|A big gray ___ hid the sun.
mouse|The ___ ate the cheese.
mouth|Open your ___ and say ahh.
round|A ball is ___.
sound|I heard a ___ outside.
found|I ___ my lost shoe.
count|Let's ___ to ten.
toy|My favorite ___ is a red truck.
joy|She jumped for ___.
coin|I put a ___ in my piggy bank.
oil|Mom cooks with olive ___.
point|___ to the door.
join|Can I ___ your game?
brush|___ your teeth.
splash|The ducks ___ in the water.
lunch|We eat ___ at noon.
bench|We sat on a ___ in the park.
inch|The bug is one ___ long.
thick|The book is very ___.
cloth|Wipe the table with a ___.
think|I ___ I can do it!
thing|What is that green ___?
bring|Please ___ your book to class.
swing|I go high on the ___.
string|The kite has a long ___.
bank|I keep my coins in a piggy ___.
sink|Wash your hands at the ___.
drink|I ___ water when I'm thirsty.
trunk|An elephant has a long ___.
skunk|A ___ has a white stripe.
stamp|Put a ___ on the letter.
print|Please ___ your name neatly.
plant|Water the ___ every day.
grass|The ___ is green.
class|Our ___ has twenty kids.
glass|Pour juice in a ___.
dress|She wore a pretty ___.
stick|The dog fetched the ___.
truck|The fire ___ is red.
clock|Look at the ___ to tell time.
snack|An apple is a healthy ___.
track|We ran around the ___.
smell|Flowers ___ nice.
spill|Try not to ___ the milk.
skill|Reading is an important ___.
still|Please sit ___.
cliff|The goat stood on the edge of the ___.
spell|Can you ___ your name?
from|I got a letter ___ Grandma.
could|I wish I ___ fly.
would|___ you like some water?
does|Where ___ your cat sleep?
done|I am ___ with my work.
any|Do you have ___ pets?
very|I am ___ happy today.
once|___ upon a time there was a bear.
our|This is ___ classroom.
your|Is this ___ pencil?
know|I ___ my ABCs.
put|___ your toys away.
give|I will ___ you a hug.
live|Fish ___ in the water.
want|Do you ___ to play?
walk|Let's ___ to the park.
talk|Please do not ___ during the movie.
work|We ___ hard in class.
word|Can you read this ___?
also|I like cats. I ___ like dogs.
each|Give one to ___ friend.
only|I ___ have one sister.
other|Where is my ___ shoe?
been|I have ___ to the beach.
find|I can't ___ my hat.
kind|Be ___ to others.
old|My grandpa is eighty years ___.
cold|Ice is very ___.
hold|___ my hand when we cross.
both|I washed ___ of my hands.
most|I like pizza the ___.
ask|You can ___ me for help.
jumping|The kids are ___ rope.
playing|We are ___ tag.
helping|Thank you for ___ me.
kicked|She ___ the ball into the goal.
looked|I ___ out the window.
rested|We ___ after the long walk.
singing|The birds are ___ in the trees.
fishing|Grandpa took me ___ at the lake.
asked|I ___ my teacher a question.
boxes|We packed our toys in ___.
dishes|I help wash the ___.
foxes|Two red ___ played in the field.
ducks|Five ___ swam in the pond.
seven|A week has ___ days.
zero|Five minus five is ___.
orange|An ___ is a juicy fruit.
cupcake|I had a ___ with sprinkles.
inside|We play ___ when it rains.
today|___ is my birthday!
myself|I tied my shoes all by ___.
sandbox|The kids dug in the ___.
mother|My ___ hugs me every day.
father|My ___ reads me stories.
apple|An ___ a day is good for you.
rabbit|The ___ hopped away.
kitten|The ___ chased the yarn.
picnic|We ate lunch on a blanket at a ___.
napkin|Wipe your mouth with a ___.
basket|We put the apples in a ___.
muffin|I ate a blueberry ___.
lemon|A ___ is sour and yellow.
robot|The ___ can walk and talk.
`);
  add("1", `
bake|Let's ___ cookies in the oven.
lane|Stay in your ___ when you swim laps.
cave|The bear sleeps in a dark ___.
wake|Please ___ me up at seven.
date|What is the ___ today?
late|Hurry or we will be ___!
safe|Wear a helmet to stay ___.
vase|Put the flowers in a ___.
base|He ran to first ___.
cane|Grandpa walks with a ___.
mane|The horse has a long ___.
crane|A tall ___ lifted the steel beams.
flame|The candle has a tiny ___.
frame|Put the photo in a ___.
chase|Dogs like to ___ balls.
trade|Do you want to ___ stickers?
grade|My sister is in third ___.
spade|Dig a hole with the ___.
ape|A gorilla is a big ___.
gave|Grandma ___ me a new book.
save|I ___ my coins in a jar.
cape|The superhero wore a red ___.
pile|Rake the leaves into a big ___.
mile|We walked a ___ to the park.
tile|The kitchen floor has white ___.
hike|We went on a ___ up the hill.
fine|I feel ___, thank you.
mine|That pencil is ___.
vine|Grapes grow on a ___.
wipe|___ your feet on the mat.
pipe|Water runs through the ___.
ripe|The banana is yellow and ___.
dive|I can ___ into the pool.
hive|Bees live in a ___.
wise|The ___ old owl knew the answer.
spine|Your ___ runs down your back.
stripe|A skunk has a white ___.
twice|I read the book ___.
dime|A ___ is worth ten cents.
bride|The ___ wore a white dress.
side|Stand on the left ___.
glide|Eagles ___ through the sky.
cone|I ate an ice cream ___.
zone|This is a quiet ___.
robe|I wear my ___ after my bath.
code|We wrote a secret ___.
mole|A ___ digs tunnels under the ground.
pole|The flag hangs on a ___.
poke|Don't ___ the sleeping dog.
smoke|___ rose from the campfire.
spoke|She ___ to the class.
stove|The pot is on the ___.
drove|Dad ___ us to the beach.
froze|The pond ___ in the winter.
hose|Water the garden with the ___.
throne|The king sat on his ___.
phone|Mom talked on the ___.
alone|The kitten did not want to be ___.
vote|We will ___ for class pet.
slope|We sledded down the ___.
rule|Follow the ___ and wait your turn.
tune|Hum a happy ___.
dune|We climbed a sand ___.
prune|A ___ is a dried plum.
beep|The microwave will ___ when it is done.
jeep|We rode in a ___ on the safari.
peek|Don't ___ at your present!
seek|Let's play hide and ___.
creek|We caught frogs in the ___.
cheek|Grandma kissed my ___.
feed|It is my job to ___ the fish.
weed|Pull the ___ out of the garden.
sheet|Put a clean ___ on the bed.
tweet|The baby bird said ___.
greet|Shake hands to ___ your guest.
beef|We had ___ tacos for dinner.
reef|Colorful fish swim by the coral ___.
peel|___ the orange before you eat it.
screen|Turn off the ___ at bedtime.
speed|The car went at a high ___.
bead|I put each ___ on a string.
beak|A bird has a ___.
leap|Frogs can ___ high.
heap|There was a ___ of clothes on the floor.
meal|Breakfast is my favorite ___.
deal|It's a ___! Let's shake on it.
real|Is that a ___ diamond?
steam|___ rose from the hot soup.
cream|I like ___ in my cocoa.
scream|We ___ on the roller coaster!
treat|The dog got a ___ for sitting.
wheat|Bread is made from ___.
neat|Keep your desk ___.
east|The sun rises in the ___.
least|I like peas the ___.
feast|We had a big ___ on Thanksgiving.
beast|The ___ in the story was really a prince.
pail|Fill the ___ with sand.
bait|Put the ___ on the hook.
braid|Mom put my hair in a ___.
brain|Your ___ helps you think.
drain|The water went down the ___.
grain|Rice is a ___.
main|The ___ idea is the most important one.
trail|We hiked on the ___.
aim|Take ___ and throw.
paid|I ___ for my snack.
hail|___ fell from the stormy sky.
stain|There is a juice ___ on my shirt.
bay|Boats sail in the ___.
pay|I will ___ for the ice cream.
ray|A ___ of sunshine came through the window.
lay|___ the baby down gently.
spray|The waves ___ us with water.
sway|The trees ___ in the wind.
Sunday|___ is the first day of the week.
Monday|We go back to school on ___.
loaf|Dad bought a ___ of bread.
foam|The waves left ___ on the sand.
oak|An acorn grows into an ___ tree.
load|Help me ___ the car.
coal|The train burns ___.
roast|We ___ marshmallows by the fire.
low|The bridge is too ___ for the bus.
row|We sat in the front ___.
mow|Dad will ___ the grass.
crow|The black ___ cawed.
flow|Rivers ___ to the sea.
glow|Fireflies ___ at night.
sigh|I let out a happy ___.
thigh|Your ___ is the top part of your leg.
fright|The loud bang gave me a ___.
flight|Our ___ leaves at noon.
sight|The rainbow was a beautiful ___.
tie|Can you ___ your shoes?
lie|Never tell a ___.
spy|I ___ something blue!
cart|Push the shopping ___.
part|This is my favorite ___ of the book.
start|Get ready, set, ___!
smart|You are so ___!
chart|We made a ___ of our favorite fruits.
scarf|Wear a ___ to keep your neck warm.
sharp|Be careful, the knife is ___.
march|The band will ___ in the parade.
spark|A ___ flew from the campfire.
sort|___ the blocks by color.
torn|My paper is ___.
worn|My old shoes are ___ out.
porch|We sat on the front ___.
thorn|The rose has a sharp ___.
fort|We built a blanket ___.
chore|Feeding the dog is my ___.
core|Throw away the apple ___.
perch|The bird sat on its ___.
clerk|The ___ rang up our groceries.
germ|Wash your hands so you don't spread a ___.
verb|Run is an action word, or ___.
serve|I will ___ the cake.
stir|___ the soup with a spoon.
firm|The bed is soft, but the pillow is ___.
birth|We celebrate the day of my ___.
chirp|Baby birds ___ for food.
twirl|Watch me ___ in my skirt.
swirl|There is a chocolate ___ in my ice cream.
squirt|___ some ketchup on your fries.
curb|Wait at the ___ before you cross.
church|The bells rang at the ___.
purse|Mom put her keys in her ___.
curve|Slow down on the ___ in the road.
burst|The balloon will ___ if you poke it.
surf|We watched people ___ on the big waves.
hoop|Shoot the ball through the ___.
loop|Make a ___ with the string.
tool|A hammer is a ___.
stool|Sit on the ___.
broom|Sweep the floor with a ___.
zoom|Watch the race cars ___!
noon|We eat lunch at ___.
mood|I am in a happy ___.
hood|Pull up your ___ when it rains.
brook|We waded in the ___.
took|I ___ my dog for a walk.
wool|My sweater is made of ___.
snout|A pig has a pink ___.
trout|Dad caught a ___ in the stream.
ouch|___! I stubbed my toe.
wow|___, that is a big cake!
gown|The princess wore a long ___.
frown|Turn that ___ upside down!
coil|The snake made a ___.
foil|Wrap the leftovers in ___.
soil|Plant the seeds in the ___.
spoil|Milk will ___ if you leave it out.
moist|The cake is soft and ___.
joint|Your elbow is a ___.
quilt|Grandma made me a ___.
quiz|We have a spelling ___ on Friday.
squid|A ___ has ten arms.
squash|We grew a big yellow ___.
sprint|We will ___ to the finish line.
strap|Buckle the ___ on your helmet.
scrub|___ the pot until it shines.
strip|Cut a ___ of paper.
split|Let's ___ the cookie in half.
thread|Use a needle and ___ to sew.
throw|___ the ball to me.
about|The book is ___ a dog.
push|___ the door to open it.
warm|My coat keeps me ___.
wash|___ your hands before you eat.
better|I feel ___ today.
far|The moon is very ___ away.
small|A mouse is ___.
shall|___ we dance?
family|My ___ eats dinner together.
eating|We are ___ lunch.
going|We are ___ to the zoo.
reading|I love ___ books.
sleeping|The baby is ___.
walking|We are ___ to school.
camping|We went ___ in the woods.
thinking|I am ___ about my answer.
flying|The birds are ___ south.
jumped|The cow ___ over the moon.
pushed|I ___ my sister on the swing.
pulled|We ___ the wagon up the hill.
filled|I ___ the bucket with water.
called|Grandma ___ to say hello.
picked|We ___ apples at the farm.
spilled|I ___ my juice.
glasses|Grandpa wears ___ to read.
lunches|We packed our ___.
benches|There are two ___ in the park.
brushes|Wash the paint ___.
bedtime|It is ___, so put on your pajamas.
cannot|I ___ reach the top shelf.
himself|He made the bed by ___.
herself|She tied her shoes by ___.
itself|The door shut by ___.
maybe|___ we can go tomorrow.
snowball|We had a ___ fight.
uphill|We rode our bikes ___.
bulldog|The ___ has a wrinkly face.
lady|The ___ at the library helped me.
body|Exercise keeps your ___ healthy.
sandy|The beach is ___.
windy|It is ___, so let's fly a kite.
messy|My room is ___.
lucky|I found a ___ penny.
muddy|My boots are ___.
fuzzy|The caterpillar is ___.
fry|Dad will ___ the eggs.
`);
  add("2", `
city|New buildings rise high in the busy ___.
ice|The pond froze into solid ___.
nice|It was ___ of you to share.
dance|We learned a new ___ for the show.
fence|The horse jumped over the ___.
pencil|Sharpen your ___ before the test.
circle|We sat in a ___ on the rug.
center|Stand in the ___ of the mat.
place|Put the book back in its ___.
space|Astronauts travel into ___.
slice|May I have a ___ of pizza?
juice|I drink orange ___ at breakfast.
price|The ___ of the toy is five dollars.
bounce|Watch the ball ___ on the floor.
giant|The ___ in the story was twenty feet tall.
gem|A ruby is a shiny red ___.
page|Turn to the next ___ in your book.
cage|The bird sings in its ___.
stage|The actors bowed on the ___.
large|An elephant is a very ___ animal.
giraffe|A ___ has a very long neck.
magic|The ___ trick made the coin vanish.
gentle|Be ___ when you pet the kitten.
engine|The car ___ roared to life.
change|Leaves ___ color in the fall.
strange|We heard a ___ noise in the attic.
bridge|We walked across the ___ over the river.
edge|Don't stand too close to the ___ of the cliff.
badge|The police officer wore a shiny ___.
judge|The ___ chose the winning painting.
fudge|Grandma made chocolate ___.
hedge|The rabbit hid in the ___.
catch|Throw the ball and I will ___ it.
match|Your socks do not ___.
watch|Let's ___ the parade.
patch|Mom sewed a ___ on my jeans.
pitch|The coach will ___ the ball to me.
sketch|I will ___ a picture of my dog.
stretch|We ___ before karate class.
fetch|My dog loves to play ___.
switch|Flip the ___ to turn on the light.
scratch|The kitten gave me a tiny ___.
paw|The puppy gave me its ___.
draw|I like to ___ pictures of horses.
straw|I drink my milk through a ___.
lawn|Dad mows the ___ on Saturday.
yawn|I ___ when I am sleepy.
crawl|Babies ___ before they walk.
hawk|A ___ soared high above the field.
claw|The crab pinched me with its ___.
sauce|I like tomato ___ on my pasta.
launch|We watched the rocket ___ into space.
author|The ___ signed my book.
pause|___ the movie so I can get a snack.
noise|The fire alarm made a loud ___.
voice|She has a beautiful singing ___.
choice|You have a ___ of apple or banana.
boil|Wait for the water to ___ before adding the pasta.
enjoy|I ___ reading in the park.
royal|The ___ family lived in a castle.
loyal|My dog is a ___ friend.
oyster|We found a pearl inside an ___.
shower|I take a ___ after soccer practice.
flower|A pretty ___ grew in the garden.
power|The storm knocked out the ___.
tower|The princess lived in a tall ___.
crowd|A big ___ cheered at the game.
growl|The bear let out a deep ___.
howl|Wolves ___ at the moon.
crown|The king wore a gold ___.
allow|Our teacher will ___ us to go outside.
ground|The apple fell to the ___.
proud|I am ___ of my new belt.
south|Birds fly ___ for the winter.
couch|We sat on the ___ to watch a movie.
pouch|A kangaroo carries her baby in a ___.
scout|The ___ earned a badge for camping.
sprout|The seeds will ___ in a few days.
chair|Pull out your ___ and sit down.
hair|She brushed her long ___.
fair|We rode the Ferris wheel at the ___.
pair|I need a new ___ of shoes.
stair|Don't trip on the top ___.
care|Take good ___ of your pet.
share|Please ___ your toys.
scare|Loud thunder can ___ my puppy.
square|A ___ has four equal sides.
bear|The ___ caught a fish in the river.
wear|I ___ a helmet when I ride my bike.
pear|A ___ is a sweet green fruit.
near|The school is ___ my house.
hear|I can ___ the birds singing.
year|There are twelve months in a ___.
clear|The water was so ___ we could see fish.
shore|The waves crashed on the ___.
score|What was the final ___ of the game?
snore|My dad likes to ___ when he sleeps.
birthday|Happy ___ to you!
thirsty|I am ___ after running.
dinner|We eat ___ at six o'clock.
letter|I wrote a ___ to my pen pal.
under|The cat is hiding ___ the bed.
winter|It snows in the ___.
summer|We swim in the pool in the ___.
number|Seven is my lucky ___.
river|The ___ flows to the sea.
never|I will ___ give up.
over|The cow jumped ___ the moon.
teacher|My ___ helps me learn.
farmer|The ___ milks the cows every morning.
Thursday|___ comes after Wednesday.
turkey|We eat ___ on Thanksgiving.
person|She is a kind ___.
perfect|You got a ___ score on the test!
babies|The ___ were sleeping in the nursery.
puppies|Our dog had four ___.
stories|Grandpa tells the best ___.
cities|Paris and Rome are big ___.
berries|We picked ___ in the summer.
ponies|The ___ trotted around the field.
families|Many ___ came to the picnic.
cherries|We picked red ___ from the tree.
children|The ___ played on the playground.
geese|The ___ flew south in a V shape.
running|We were ___ in the race.
swimming|We went ___ in the lake.
hopping|The bunny was ___ across the lawn.
stopped|The bus ___ at the corner.
clapped|Everyone ___ at the end of the show.
sitting|The cat is ___ on the windowsill.
getting|It is ___ dark outside.
shopping|We went ___ for new shoes.
planned|We ___ a surprise party.
hugged|I ___ my grandma tight.
making|We are ___ cookies.
riding|I am ___ my bike.
hoping|I am ___ for snow tomorrow.
smiling|Everyone was ___ in the photo.
skating|We went ___ on the frozen pond.
baking|Mom is ___ bread.
dancing|We were ___ at the party.
hiking|We went ___ in the mountains.
wanted|I ___ a puppy for my birthday.
played|We ___ outside all day.
painted|I ___ a rainbow.
shouted|The fans ___ when we scored.
needed|I ___ help with my homework.
knee|I scraped my ___ when I fell.
knot|Tie a ___ in your belt.
knock|___ on the door before you go in.
knife|Use a ___ to cut the bread.
knew|I ___ the answer!
kneel|We ___ on the mat at the end of class.
wrap|Let's ___ the present.
wrong|Oops, I took a ___ turn.
wrist|She wears a watch on her ___.
lamb|A baby sheep is a ___.
thumb|Give me a ___ up!
climb|Monkeys ___ trees.
comb|___ your hair before school.
table|Set the ___ for dinner.
candle|Light the ___ on the cake.
puzzle|We put together a 100-piece ___.
bottle|Fill your water ___.
turtle|The ___ hid in its shell.
middle|Stand in the ___ of the line.
bubble|I blew a huge ___.
giggle|The baby will ___ when you tickle her.
helpful|Thank you for being so ___.
careful|Be ___ when you cross the street.
slowly|The turtle walked ___.
quickly|The rabbit ran ___.
thankful|I am ___ for my family.
rainbow|A ___ has seven colors.
sunshine|We played in the warm ___.
football|We threw the ___ in the backyard.
baseball|He hit a home run in ___.
popcorn|We ate ___ at the movies.
snowman|We built a ___ with a carrot nose.
bathtub|The baby splashed in the ___.
backpack|I carry my books in a ___.
bedroom|My ___ is painted blue.
outside|Let's play ___ in the sun.
playground|We play on the ___ at recess.
sometimes|I ___ walk to school.
without|Don't leave ___ your coat.
everyone|___ in class got a sticker.
homework|I finish my ___ before I play.
carry|Can you help me ___ the groceries?
happen|What will ___ next in the story?
often|I ___ read before bed.
open|Please ___ the window.
money|I saved my ___ in a piggy bank.
honey|Bees make ___.
monkey|The ___ swung from the vines.
donkey|The ___ said hee-haw.
chicken|The ___ laid an egg.
garden|We grow tomatoes in our ___.
button|Press the ___ to start.
pocket|I keep a coin in my ___.
jacket|Zip up your ___.
rocket|The ___ blasted off.
ticket|I need a ___ to ride the train.
mitten|I lost one ___ in the snow.
lesson|Today's ___ is about plants.
follow|___ the leader!
pillow|I sleep with a soft ___.
story|Tell me a bedtime ___.
hurry|___ or we'll miss the bus!
heavy|This box is too ___ to lift.
ready|Are you ___ for school?
busy|Mom is ___ cooking dinner.
color|Blue is my favorite ___.
sugar|Cookies are made with flour and ___.
their|The kids rode ___ bikes.
says|My teacher ___ I'm a good reader.
goes|My dad ___ to work at eight.
shoe|I tied my ___.
buy|Let's ___ some apples.
great|You did a ___ job!
break|Be careful not to ___ the glass.
eye|Close one ___ and look through the telescope.
almost|It's ___ time for lunch.
already|I ___ finished my work.
cousin|My ___ is coming to visit.
country|Canada is a big ___.
double|I got a ___ scoop of ice cream.
touch|Please don't ___ the wet paint.
young|My sister is too ___ for school.
trouble|We had ___ finding the trail.
move|We will ___ to a new house.
lose|Don't ___ your gloves.
whole|I ate the ___ apple.
hour|An ___ has sixty minutes.
sure|Are you ___ you want to go?
until|Wait ___ the light turns green.
began|The race ___ at noon.
wolf|The ___ howled at the moon.
afraid|Don't be ___ of the dark.
explain|Can you ___ how you got the answer?
holiday|Thanksgiving is my favorite ___.
sailboat|The ___ glided across the lake.
between|I sat ___ Mom and Dad.
asleep|The baby is fast ___.
sneeze|Pepper makes me ___.
breeze|A cool ___ blew through the trees.
squeeze|Give the lemon a ___.
freeze|Water will ___ when it gets cold.
peanut|I ate a ___ butter sandwich.
season|Fall is my favorite ___.
reason|What is the ___ you are late?
eagle|The bald ___ has white feathers on its head.
easy|That puzzle was ___.
leader|Our team ___ wears the captain's band.
below|The fish swam ___ the boat.
elbow|My ___ bends my arm.
grown|My puppy has ___ so big!
known|Our town is ___ for its apple pies.
shadow|My ___ follows me in the sun.
toast|I eat ___ with butter.
throat|My ___ hurts when I have a cold.
coast|We drove along the ___ by the ocean.
goal|She kicked the ball into the ___.
tonight|We will see the stars ___.
highway|Cars zoom along the ___.
July|We watch fireworks in ___.
reply|Please ___ to my letter.
glue|Use ___ to stick the paper.
true|Is that story ___ or made up?
clue|The detective found a ___.
flew|The bird ___ away.
grew|My sunflower ___ taller than me.
drew|I ___ a picture of my family.
chew|___ your food slowly.
threw|She ___ the ball to me.
crew|The ship's ___ raised the sails.
stew|We had beef ___ for dinner.
news|We watched the ___ on TV.
balloon|The red ___ floated away.
raccoon|A ___ has a mask on its face.
scooter|I rode my ___ down the sidewalk.
noodle|I slurped a long ___.
goose|A ___ honked at us.
shook|The dog ___ water all over me.
stood|We ___ in line for lunch.
cookie|May I have a ___?
`);
  add("2", `
lace|My shoe ___ came untied.
trace|___ the shape with your finger.
spice|Cinnamon is a sweet ___.
ounce|Every ___ of effort counts.
pounce|The cat crouched, ready to ___ on the toy.
prince|The ___ rode a white horse.
since|I have known her ___ kindergarten.
chance|Everyone gets a ___ to play.
glance|Take a quick ___ at the clock.
fancy|We wore ___ clothes to the wedding.
icy|Walk slowly on the ___ sidewalk.
spicy|The salsa is too ___ for me.
cider|We drank warm apple ___.
gerbil|Our class pet is a ___.
ginger|The cookies taste like ___.
hinge|The door ___ squeaks.
fringe|Her jacket has ___ on the sleeves.
sponge|Wipe the table with a ___.
plunge|Hold your nose and ___ into the pool.
cottage|We stayed in a little ___ by the lake.
bandage|Put a ___ on the cut.
garbage|Take out the ___ on Tuesday.
package|A ___ came in the mail.
luggage|We packed our ___ for the trip.
cabbage|The rabbit nibbled the ___.
dodge|Try to ___ the ball!
ridge|We hiked along the mountain ___.
fridge|Put the milk back in the ___.
nudge|Give your partner a gentle ___.
smudge|There is a ___ on the window.
wedge|I ate a ___ of cheese.
pledge|We say the ___ every morning.
budge|The stuck door won't ___.
itch|The bug bite made my arm ___.
hatch|The chicks will ___ soon.
latch|Close the ___ on the gate.
batch|We baked a ___ of cookies.
notch|Cut a ___ in the stick.
hutch|The rabbit lives in a ___.
clutch|She held her purse in a tight ___.
crutch|He walked with a ___ after he hurt his leg.
stitch|Grandma sewed one more ___.
twitch|The bunny's nose began to ___.
dawn|The rooster crows at ___.
fawn|A baby deer is a ___.
shawl|Grandma wrapped a ___ around her shoulders.
squawk|The parrot gave a loud ___.
thaw|The ice will ___ in the spring.
raw|Don't eat ___ eggs.
jaw|The shark has a strong ___.
law|It is the ___ to wear a seat belt.
awesome|That magic trick was ___!
faucet|Turn off the ___ while you brush.
laundry|I help fold the ___.
sausage|We had eggs and ___ for breakfast.
August|School starts in ___.
cowboy|The ___ rode his horse across the plains.
noisy|The cafeteria is ___ at lunch.
avoid|Try to ___ the puddles.
mount|Climb up and ___ the horse.
amount|Add the right ___ of sugar.
spout|Water poured out of the ___.
pound|The puppy weighs one ___.
hound|The ___ followed the scent.
mound|The ants built a ___ of dirt.
blouse|She wore a white ___.
noun|A person, place, or thing is a ___.
outfit|I picked out my ___ for the party.
powder|Snow fell like ___.
chowder|We ate clam ___.
prowl|Cats ___ around at night.
plow|The farmer used a ___ in the field.
dare|I ___ you to try the spicy pepper!
glare|The sun's ___ hurt my eyes.
rare|This stamp is very ___.
stare|It is rude to ___.
spare|Do you have a ___ pencil?
bare|I walked on the sand in ___ feet.
prepare|___ for the test by studying.
airport|We flew out of the ___.
dairy|Milk and cheese are ___ foods.
fairy|The ___ had sparkly wings.
repair|Dad will ___ the broken chair.
pearl|She wore a ___ necklace.
search|Let's ___ for the lost cat.
gear|Pack your camping ___.
spear|The statue held a ___.
tear|A ___ rolled down her cheek.
beard|Grandpa has a white ___.
cheer|Let's ___ for our team!
steer|Use the wheel to ___ the boat.
adore|I ___ my baby brother.
ignore|___ the noise and focus.
sore|My legs are ___ from running.
tore|I ___ my pants on the fence.
forest|Deer live in the ___.
corner|Turn left at the ___.
order|Put the numbers in ___.
border|Draw a ___ around your picture.
acorn|The squirrel buried an ___.
dirty|Wash your ___ hands.
circus|We saw clowns at the ___.
skirt|She wore a purple ___.
thirteen|Twelve plus one is ___.
thirty|There are ___ days in June.
turnip|The ___ grew under the ground.
hurdle|The runner jumped over the ___.
curly|My hair is ___.
furry|The bunny is soft and ___.
jersey|I wear number ten on my soccer ___.
mermaid|The ___ swam with the dolphins.
termite|A ___ eats wood.
expert|My grandma is an ___ baker.
bacon|We had ___ and eggs.
lazy|The ___ cat slept all day.
crazy|We had a ___ hair day at school.
navy|He wore a ___ blue jacket.
student|Every ___ got a new book.
human|A ___ has two arms and two legs.
unit|We finished the ___ on plants.
tulip|A red ___ bloomed in spring.
pilot|The ___ flew the airplane.
tiny|An ant is ___.
silent|The room was ___ during the test.
item|Pick one ___ from the menu.
iron|Dad used an ___ to smooth his shirt.
hero|The firefighter is a ___.
motor|The boat has a ___.
frozen|The lake is ___ solid.
even|Two, four, and six are ___ numbers.
equal|Cut the cake into ___ pieces.
secret|Can you keep a ___?
female|A ___ lion is called a lioness.
fever|I stayed home with a ___.
few|I have a ___ cookies left.
dew|The grass is wet with morning ___.
screw|Tighten the ___ on the chair.
jewel|The crown has a red ___.
nephew|My aunt says I am her favorite ___.
cashew|A ___ is a curved nut.
argue|Let's not ___ about whose turn it is.
rescue|The firefighters will ___ the cat.
statue|A bronze ___ stands in the park.
value|What is the ___ of this coin?
avenue|We live on Maple ___.
smooth|The stone is ___.
groom|The bride and ___ cut the cake.
bloom|Roses ___ in June.
booth|We sat in a ___ at the diner.
proof|Show me ___ that you finished.
scoop|I want one ___ of ice cream.
swoop|The owl will ___ down.
rooster|The ___ crowed at sunrise.
igloo|The ___ is made of snow.
kangaroo|A ___ hops on its back legs.
shampoo|Wash your hair with ___.
bamboo|Pandas eat ___.
cartoon|We watched a ___ on Saturday.
cocoon|The caterpillar made a ___.
wooden|We have a ___ fence.
hoped|I ___ it would snow.
liked|I ___ the movie a lot.
smiled|She ___ at me.
skipped|We ___ down the hall.
dropped|I ___ my pencil.
grabbed|He ___ his coat and ran.
jogging|Mom goes ___ every morning.
digging|The dog is ___ in the yard.
winning|Our team is ___!
cutting|Be careful when you are ___ paper.
chopped|Dad ___ the onions.
spotted|I ___ a deer in the woods.
longest|This is the ___ snake at the zoo.
smaller|A mouse is ___ than a cat.
hotter|Today is ___ than yesterday.
elves|The ___ helped make the toys.
halves|Cut the apple into two ___.
oxen|Two ___ pulled the wagon.
peaches|We picked ___ from the tree.
dresses|The girls wore party ___.
beaches|We visited two sandy ___.
buses|Yellow ___ lined up after school.
parties|We go to lots of birthday ___.
pennies|I saved fifty ___.
bunnies|The ___ hopped across the lawn.
fries|I ate a burger and ___.
won|Our team ___ the game!
meet|Nice to ___ you!
bye|Wave ___ to Grandma.
tow|The truck will ___ the broken car.
another|May I have ___ cookie?
anyone|Does ___ have a pencil?
become|I want to ___ a vet.
belong|These books ___ to the library.
beside|Sit ___ me.
bottom|The coin sank to the ___ of the pool.
during|Don't talk ___ the movie.
group|Our ___ made a poster.
hello|Say ___ to our new student.
later|I'll call you ___.
leave|We ___ for school at eight.
nothing|There is ___ in the box.
second|I came in ___ place.
tried|I ___ my best.
woman|The ___ walked her dog.
world|We live in a big ___.
dentist|The ___ cleaned my teeth.
plastic|The cup is made of ___.
contest|She won the drawing ___.
velvet|The dress is made of soft ___.
cactus|A ___ has sharp spines.
hiccup|A loud ___ popped out in the middle of my sentence.
tadpole|A ___ turns into a frog.
sunrise|We woke up at ___.
raincoat|Wear your ___ today.
seaweed|Fish hide in the ___.
beehive|The ___ was full of honey.
daylight|We hiked while there was ___.
teapot|The ___ whistled on the stove.
doghouse|My dog sleeps in a ___.
rowboat|We paddled the ___ across the lake.
treetop|A bird sang from the ___.
classmate|My ___ sits next to me.
lunchbox|I packed my ___.
railroad|The ___ runs through town.
`);
  add("3", `
unhappy|The lost puppy looked ___ until we found its owner.
unlock|Use the key to ___ the door.
unpack|We will ___ our suitcases at the hotel.
untie|Please ___ your shoes before you take them off.
unfair|It is ___ to cut in line.
unknown|The ___ planet was far beyond the stars.
unusual|It is ___ to see snow in May.
unwrap|I can't wait to ___ my present!
redo|You can ___ the problem if you make a mistake.
reread|I like to ___ my favorite books.
rewrite|Please ___ your story neatly.
return|___ your library books on Friday.
repeat|Please ___ the question.
replace|We need to ___ the broken light bulb.
rebuild|The town will ___ the old bridge.
refill|May I ___ my water bottle?
recycle|We ___ cans and bottles.
review|Let's ___ the spelling words before the test.
remind|Please ___ me to bring my uniform.
dislike|I ___ cold, rainy days.
disagree|It is okay to ___ politely.
discover|Scientists want to ___ new things.
disobey|A good student does not ___ the class rules.
preview|We watched a ___ of the new movie.
preschool|My little brother goes to ___.
pretest|We took a ___ to see what we already know.
prefix|Un- is a ___ that means "not."
mistake|Everyone makes a ___ sometimes.
misspell|Check your work so you don't ___ any words.
misplace|I always ___ my keys.
hopeful|We are ___ that it will be sunny.
joyful|The holiday was a ___ time.
colorful|The parrot has ___ feathers.
powerful|The ___ wind knocked down a tree.
fearless|The ___ firefighter ran into the smoke.
careless|___ mistakes can be fixed if you check your work.
endless|The desert seemed ___.
spotless|After we cleaned, the kitchen was ___.
kindness|Show ___ to everyone you meet.
darkness|The owl hunts in the ___.
goodness|My ___, that cake is huge!
happiness|Her face was full of ___.
movement|Dance is a fun way to add ___ to your day.
enjoyment|We read for ___.
agreement|We came to an ___ about the rules.
payment|Dad made the last ___ on the car.
quietly|Please walk ___ in the hallway.
loudly|The crowd cheered ___.
safely|We crossed the street ___.
suddenly|___ the lights went out.
finally|We ___ reached the top of the mountain.
happily|The dog wagged its tail ___.
easily|She ___ solved the puzzle.
bigger|An elephant is ___ than a mouse.
biggest|The whale is the ___ animal on Earth.
taller|My brother is ___ than me.
happier|I feel ___ after a good night's sleep.
funnier|His second joke was even ___ than the first.
heavier|A bowling ball is ___ than a soccer ball.
too|I want to come ___!
son|The farmer and his ___ milked the cows.
meat|The lion eats ___.
flour|We need ___ and eggs to bake a cake.
tale|The old ___ was about a brave mouse.
male|A ___ lion has a big mane.
weak|My legs felt ___ after the long run.
rode|We ___ our bikes to the park.
plain|I like ___ yogurt with no fruit.
plane|The ___ landed at the airport.
blew|The wind ___ my hat off.
which|___ color do you like best?
witch|She dressed up as a ___ for the costume party.
sale|The store is having a big ___ on shoes.
sail|Let's ___ the boat across the bay.
sent|I ___ a letter to my aunt.
scent|The ___ of roses filled the room.
board|The teacher wrote on the ___.
bored|I was ___ waiting for the bus.
brake|Press the ___ to stop the bike.
hare|The tortoise raced the ___.
deer|A ___ ran through the forest.
dear|My ___ friend lives next door.
toe|I stubbed my big ___.
beet|A ___ is a dark red root vegetable.
aunt|My ___ is my mom's sister.
heel|I have a blister on my ___.
heal|The cut on my knee will ___ soon.
steel|The bridge is made of ___.
afternoon|We have art class in the ___.
airplane|The ___ flew above the clouds.
basketball|We shot hoops at ___ practice.
butterfly|A caterpillar turns into a ___.
classroom|Our ___ has a fish tank.
daydream|I sometimes ___ about being an astronaut.
downstairs|The kitchen is ___.
everything|I packed ___ I need for the trip.
everybody|___ in the class got a turn.
fireplace|We sat by the warm ___.
firefighter|The ___ put out the fire.
grandmother|My ___ knits me sweaters.
grandfather|My ___ tells great stories.
haircut|I got a short ___.
ladybug|A red ___ with black spots landed on my hand.
lighthouse|The ___ guided ships to shore.
mailbox|Put the letter in the ___.
moonlight|The lake sparkled in the ___.
newspaper|Grandpa reads the ___ every morning.
notebook|I write in my ___.
nobody|___ was home when we knocked.
pancake|I ate a ___ with syrup.
seashell|I found a ___ at the beach.
skateboard|He rode his ___ to the park.
snowflake|A ___ landed on my mitten and melted.
someone|___ left a jacket on the bench.
somewhere|I put my book ___ in my room.
starfish|A ___ has five arms.
sunflower|The ___ grew taller than me.
sidewalk|We drew with chalk on the ___.
toothbrush|I got a new ___ at the dentist.
upstairs|My bedroom is ___.
waterfall|We hiked to a beautiful ___.
weekend|We go to the beach on the ___.
blueberry|I had a ___ muffin.
bookshelf|Put the books back on the ___.
campfire|We roasted marshmallows over the ___.
footprint|We found a bear ___ in the mud.
goldfish|My ___ swims in a bowl.
castle|The king lived in a stone ___.
whistle|The coach blew her ___.
example|Can you give me an ___?
needle|Grandma threads a ___ to sew.
pickle|I like a ___ with my sandwich.
tickle|Don't ___ me!
sparkle|The stars ___ in the night sky.
ankle|I twisted my ___ in gym.
handle|Hold the cup by the ___.
saddle|The cowboy put a ___ on his horse.
paddle|Use the ___ to row the canoe.
pebble|I found a smooth ___ by the creek.
marble|I won the ___ game at recess.
maple|___ syrup comes from trees.
title|What is the ___ of your book?
able|Will you be ___ to come to my party?
stable|The horses sleep in the ___.
jungle|Tigers live in the ___.
single|Not a ___ cloud was in the sky.
tumble|The puppies ___ and play in the grass.
sizzle|The bacon will ___ in the pan.
freckle|She has a ___ on her nose.
butter|I put ___ on my toast.
ladder|Climb the ___ carefully.
carrot|The rabbit nibbled a ___.
cotton|My shirt is made of soft ___.
mirror|I looked at myself in the ___.
gallon|We bought a ___ of milk.
hammer|Hit the nail with a ___.
pepper|Add salt and ___ to the soup.
puppet|I made a sock ___.
slipper|I lost my left ___ under the bed.
supper|We eat ___ at six.
tennis|We played ___ on the court.
zipper|The ___ on my coat is stuck.
collect|I ___ stamps from around the world.
address|Write your ___ on the envelope.
arrow|Follow the ___ to the exit.
borrow|May I ___ your eraser?
million|There are over a ___ stars in the sky.
village|The tiny ___ had one store.
valley|A river runs through the ___.
bought|I ___ a new book with my allowance.
brought|She ___ cupcakes to class.
cough|Cover your mouth when you ___.
rough|The bark of the tree is ___.
tough|This meat is too ___ to chew.
though|I'm tired, even ___ I slept well.
dough|We rolled out the cookie ___.
taught|My dad ___ me how to ride a bike.
laughter|The room was filled with ___.
sleigh|Horses pulled the ___ through the snow.
eighteen|Nine plus nine is ___.
reindeer|A ___ has big antlers.
weigh|Let's ___ the puppy on the scale.
field|We played soccer on the ___.
shield|The knight held up his ___.
chief|The fire ___ led the team.
niece|My aunt says I am her favorite ___.
pier|We fished off the end of the ___.
key|I lost the ___ to the front door.
journey|The ___ across the ocean took weeks.
chimney|Smoke came out of the ___.
hockey|We play ice ___ in the winter.
honest|Always be ___ and tell the truth.
ghost|He dressed up as a friendly ___.
sign|The ___ said "Stop."
listen|___ carefully to the directions.
Wednesday|___ is the middle of the week.
half|I ate ___ of the sandwich.
calf|A baby cow is called a ___.
chalk|We drew a hopscotch game with ___.
autumn|Leaves fall in ___.
guest|Our ___ stayed for dinner.
guitar|He strums his ___.
guard|The ___ stood at the gate.
guide|The tour ___ showed us the museum.
doubt|I have no ___ you will do well.
wolves|A pack of ___ howled.
leaves|The ___ turn red in the fall.
knives|Forks, spoons, and ___ go in the drawer.
shelves|The library has tall ___.
loaves|The baker made ten ___ of bread.
women|Three ___ ran in the race.
picture|Let's take a ___!
nature|We took a ___ walk in the woods.
future|In the ___ I want to be a scientist.
mixture|The cake batter is a ___ of flour, eggs, and sugar.
adventure|Our trip to the caves was an ___.
creature|A strange ___ lived in the lake.
treasure|The pirates buried their ___.
measure|Use a ruler to ___ the line.
pleasure|It was a ___ to meet you.
morning|I eat breakfast in the ___.
evening|We take a walk in the ___ after dinner.
Saturday|We have no school on ___.
Tuesday|___ comes after Monday.
Friday|___ is the last day of the school week.
month|December is the last ___ of the year.
travel|We will ___ by train.
vacation|We went to the beach on ___.
finish|___ your homework before dinner.
decide|I can't ___ which book to read.
explore|Let's ___ the cave.
imagine|___ you could fly!
invite|I will ___ my whole class to my party.
quiet|Please be ___ in the library.
quite|The movie was ___ long.
clothes|Put your dirty ___ in the hamper.
close|Please ___ the door.
choose|___ a book from the shelf.
chose|I ___ the red one yesterday.
loose|My tooth is ___!
front|I sit in the ___ row.
among|The deer hid ___ the trees.
against|We played ___ the best team.
toward|The dog ran ___ me.
above|The plane flew ___ the clouds.
behind|The cat hid ___ the couch.
fourth|We are in the ___ row from the front.
forty|Twenty plus twenty is ___.
hundred|Ten tens make one ___.
thousand|A ___ is ten hundreds.
dollar|The book cost one ___.
quarter|A ___ is worth twenty-five cents.
divide|Let's ___ the pizza into eight slices.
problem|Can you solve this math ___?
solve|Can you ___ the riddle?
idea|That is a great ___!
energy|The sun gives us ___.
planet|Earth is our home ___.
earth|We live on planet ___.
weather|The ___ is sunny today.
whether|I don't know ___ it will rain.
machine|The washing ___ cleans our clothes.
potato|I like a baked ___ with butter.
banana|Monkeys love to eat a ___.
sandwich|I packed a turkey ___.
breakfast|I eat ___ every morning.
desert|Camels live in the hot, dry ___.
dessert|We had ice cream for ___.
`);
  add("3", `
unlucky|We were ___ and missed the bus by one minute.
unkind|It is ___ to leave someone out of a game.
unsure|I was ___ of the answer, so I checked again.
unequal|The two pieces of cake were ___ in size.
unclear|The directions were ___, so I asked a question.
undone|My chores are still ___.
unload|Help me ___ the groceries from the car.
unplug|___ the toaster when you are done.
unbutton|___ your coat when you come inside.
uneven|The sidewalk is cracked and ___.
untidy|My closet is ___ and needs cleaning.
reuse|We ___ our shopping bags.
reheat|___ the leftovers for lunch.
rewind|___ the song so we can hear it again.
retell|Can you ___ the story in your own words?
repaint|We will ___ the fence this summer.
refresh|A cool shower will ___ you.
restart|___ the game from the beginning.
react|How did your dog ___ to the new kitten?
dishonest|Cheating on a test is ___.
misprint|The ___ in the newspaper was fixed the next day.
playful|The ___ puppy chased its tail.
useful|A flashlight is ___ when the power goes out.
skillful|The ___ potter made a perfect bowl.
truthful|Always be ___, even when it is hard.
handful|She grabbed a ___ of popcorn.
mouthful|Don't talk with a ___ of food.
spoonful|Add one ___ of sugar.
forgetful|My ___ brother left his lunch at home again.
useless|A pen with no ink is ___.
helpless|A newborn kitten is ___.
sleepless|The storm gave us a ___ night.
hopeless|Never feel ___; keep trying.
speechless|The surprise left me ___.
wireless|The ___ speaker plays music from my tablet.
illness|He missed a week of school because of an ___.
softness|I love the ___ of my new blanket.
fitness|Running and jumping improve your ___.
sadness|There was ___ when our friend moved away.
weakness|Spelling used to be my ___, but now it's a strength.
pavement|The hot ___ burned my bare feet.
amusement|We went to an ___ park.
baker|The ___ sells fresh bread.
dancer|The ___ spun on her toes.
singer|The ___ sang a lovely song.
player|Each ___ on the team got a medal.
helper|Today I am the line ___.
painter|The ___ painted our house blue.
reader|She is a fast ___.
writer|The ___ wrote a book about dragons.
builder|The ___ put up the walls.
driver|The bus ___ waved to us.
swimmer|The ___ dove into the pool.
runner|The fastest ___ won the race.
winner|The ___ got a gold medal.
busier|The store is ___ on weekends.
easier|Math is ___ when you practice.
prettier|The garden looks ___ in spring.
sillier|His jokes get ___ every day.
luckiest|I'm the ___ kid in the world!
funniest|That was the ___ movie ever.
happiest|My birthday was the ___ day of the year.
tiniest|The ___ kitten was the runt.
carried|Dad ___ me on his shoulders.
hurried|We ___ to catch the bus.
worried|I was ___ about the test.
studied|I ___ my spelling words.
copied|I ___ the notes from the board.
cried|The baby ___ all night.
replied|She ___ to my letter.
pale|He looked ___ when he felt sick.
pain|I have a ___ in my stomach.
pane|The ball broke a window ___.
rein|Pull the ___ to turn the horse.
steak|Dad grilled a ___ for dinner.
grate|___ the cheese for the pizza.
paws|The puppy has muddy ___.
hall|Walk quietly in the ___.
haul|The truck will ___ the dirt away.
cent|A penny is worth one ___.
chews|My dog ___ on his toys.
dye|We used ___ to color the eggs.
fir|A ___ tree stays green all year.
higher|The kite flew ___ than the tree.
maid|The ___ cleaned the hotel room.
poor|The ___ puppy was cold and wet.
rows|We planted the seeds in ___.
tea|Grandma drinks hot ___.
creak|The old stairs ___ when you step on them.
due|My library book is ___ today.
fare|We paid the bus ___.
loan|The bank gave Dad a ___.
roll|___ the ball to me.
role|She got the lead ___ in the play.
seem|You ___ happy today.
seam|The ___ of my shirt ripped.
sew|Grandma will ___ a button on my coat.
groan|The class let out a ___ when it rained at recess.
anybody|Is ___ home?
barefoot|We walked ___ on the beach.
cardboard|We built a fort out of ___ boxes.
cookbook|Mom found the recipe in a ___.
cupboard|The cups are in the ___.
daytime|Owls sleep in the ___.
doorway|The dog stood in the ___.
eggshell|Don't get any ___ in the batter.
farmhouse|The family lives in a white ___.
flagpole|The flag waves from the ___.
greenhouse|Plants grow in the warm ___.
hallway|Our lockers are in the ___.
homemade|Grandma made ___ jam.
jellyfish|A ___ floated in the water.
pinecone|We painted a ___.
sawdust|The floor was covered in ___.
shipwreck|Divers explored the old ___.
spaceship|The ___ blasted off to Mars.
sunburn|Wear sunscreen so you don't get a ___.
teammate|My ___ passed me the ball.
teaspoon|Add a ___ of salt.
tiptoe|___ so you don't wake the baby.
toothpick|Grandpa used a ___ after dinner.
wallpaper|My room has striped ___.
windmill|The ___ turned in the breeze.
riddle|Can you solve this ___?
fiddle|He played a tune on his ___.
kettle|The ___ whistled on the stove.
beetle|A shiny black ___ crawled on the leaf.
nibble|The mouse began to ___ the cheese.
puddle|I jumped in a ___.
cuddle|I like to ___ with my puppy.
huddle|The team got in a ___.
poodle|The ___ has curly fur.
bundle|We tied the sticks in a ___.
cradle|The baby slept in a ___.
wiggle|___ your toes.
juggle|The clown can ___ three balls.
struggle|It was a ___ to open the jar.
tangle|My kite string is in a ___.
jingle|The bells ___ on the sleigh.
sample|Try a ___ of the soup.
temple|We visited an ancient ___.
dimple|She has a ___ when she smiles.
sprinkle|___ sugar on top.
twinkle|The stars ___ at night.
chuckle|The joke made Dad ___.
buckle|___ your seat belt.
simple|The recipe is ___.
rattle|The baby shook her ___.
settle|The snow began to ___ on the ground.
lettuce|Put ___ and tomato on the sandwich.
ribbon|I won a blue ___.
common|Robins are ___ birds.
gallop|Horses ___ across the field.
pollen|Bees carry ___ from flower to flower.
sudden|There was a ___ clap of thunder.
attic|We store old toys in the ___.
comma|Put a ___ between the items in a list.
dizzy|Spinning makes me ___.
fluffy|The clouds are white and ___.
grassy|We sat on a ___ hill.
hollow|The owl lives in a ___ tree.
mammal|A whale is a ___.
parrot|The ___ can talk.
pudding|We had chocolate ___.
rubber|Tires are made of ___.
shallow|Little kids swim in the ___ end.
skinny|The ___ cat needed food.
soccer|We play ___ on Saturdays.
tissue|Use a ___ when you sneeze.
waffle|I had a ___ with syrup.
wallet|Dad keeps his money in his ___.
ought|You ___ to wear a coat.
drought|The ___ dried up the river.
naughty|The ___ puppy chewed my shoe.
applause|The crowd burst into ___.
cause|What was the ___ of the fire?
fault|It was nobody's ___.
vault|The bank keeps money in a ___.
haunted|We walked through a pretend ___ house.
neigh|Horses ___.
eighty|Grandpa is ___ years old.
freight|The ___ train carried coal.
knob|Turn the ___ to open the door.
knuckle|I bumped my ___ on the table.
knapsack|I carried my lunch in a ___.
knit|Grandma will ___ me a scarf.
wreck|The storm left the yard a ___.
wrinkle|Iron out the ___ in your shirt.
wren|A tiny ___ built a nest.
wrench|Use a ___ to tighten the bolt.
sword|The knight drew his ___.
gnat|A tiny ___ buzzed by my ear.
crumb|Wipe the ___ off your lip.
limb|The tree ___ broke in the storm.
plumber|The ___ fixed the leaky pipe.
fasten|___ the clasp on your bracelet so it stays on.
glisten|The snow will ___ in the sun.
calm|Stay ___ and take a deep breath.
palm|Hold the coin in the ___ of your hand.
folk|We listened to ___ music at the fair.
capture|Take a photo to ___ the moment.
pasture|The cows graze in the ___.
posture|Sit up straight with good ___.
texture|Sandpaper has a rough ___.
vulture|A ___ circled overhead.
sculpture|The artist made a clay ___.
moisture|The plants need ___.
furniture|We moved the ___ into the new house.
signature|Write your ___ at the bottom.
January|___ is the first month of the year.
April|___ showers bring May flowers.
October|We pick pumpkins in ___.
November|Thanksgiving is in ___.
December|___ is the last month of the year.
minus|Ten ___ three is seven.
graph|We made a bar ___ of our favorite pets.
ruler|Use a ___ to draw a straight line.
scale|Stand on the ___ to see how much you weigh.
gravity|___ pulls things down to Earth.
habitat|A pond is a ___ for frogs.
fossil|We found a ___ of a shell in the rock.
orbit|The moon is in ___ around Earth.
liquid|Water is a ___.
solid|Ice is a ___.
climate|The desert has a hot, dry ___.
canyon|The river carved a deep ___.
harbor|The boats are docked in the ___.
compass|A ___ shows which way is north.
citizen|A good ___ follows the laws.
`);
  add("4", `
incorrect|Cross out the ___ answer and write the right one.
invisible|The ghost in the story was ___, so nobody could see it.
impossible|Nothing is ___ if you keep practicing.
impatient|The ___ driver honked his horn.
imperfect|My drawing is ___, but I like it.
incomplete|Your homework is ___; you skipped page two.
nonstop|We flew ___ from coast to coast.
nonsense|The silly poem was full of ___ words.
nonfiction|A ___ book tells true facts.
overflow|Turn off the faucet before the tub starts to ___.
overnight|We stayed ___ at Grandma's house.
overcome|You can ___ your fear of the dark.
underground|Moles dig tunnels ___.
underline|___ the title of the book.
underwater|We wore goggles to see ___.
subway|We rode the ___ under the city.
submarine|The ___ dove deep into the ocean.
subtract|___ five from ten to get five.
interrupt|Please don't ___ while I'm talking.
midnight|The clock struck twelve at ___.
misbehave|The puppy tends to ___ when it is bored.
misunderstand|I hope you didn't ___ my directions.
preheat|___ the oven before you bake the cookies.
prehistoric|Dinosaurs lived in ___ times.
reappear|The sun will ___ after the storm.
rearrange|Let's ___ the furniture in my room.
recover|It took a week to ___ from the flu.
uncover|The scientists hope to ___ dinosaur bones.
unbelievable|Her amazing jump was ___!
unfinished|I have an ___ puzzle on the table.
disconnect|___ the charger when the tablet is full.
discount|The store gave us a ___ on the shoes.
disrespect|Talking during a bow shows ___.
action|The movie was full of ___.
nation|Our ___ celebrates its birthday in July.
station|We waited at the train ___.
motion|The rocking ___ of the boat made me sleepy.
fraction|One half is a ___.
addition|Two plus two is an ___ problem.
mention|Did the teacher ___ a quiz?
attention|Please pay ___ to the speaker.
direction|Which ___ is north?
invention|The light bulb was an amazing ___.
collection|He has a huge rock ___.
celebration|We had a big ___ when we won.
information|The library has lots of ___ about sharks.
decision|Choosing a pet is a big ___.
division|We are learning long ___ in math.
television|We watched a show on ___.
vision|The eye doctor checked my ___.
confusion|There was some ___ about the start time.
famous|The ___ painting hangs in a museum.
nervous|I was ___ before my belt test.
dangerous|Playing with matches is ___.
enormous|The blue whale is ___.
curious|The ___ cat peeked into the box.
delicious|This soup is ___!
generous|It was ___ of you to share your lunch.
comfortable|My new sneakers are ___.
valuable|The old coin is very ___.
washable|These markers are ___ if you get them on your clothes.
breakable|Wrap the ___ dishes carefully.
enjoyable|We had an ___ day at the lake.
terrible|The storm made a ___ mess.
possible|Is it ___ to finish by noon?
visible|The mountain was ___ from far away.
sensible|Wearing a coat in the snow is ___.
flexible|Stretching every day helps you stay ___.
excitement|The kids were full of ___ on the last day of school.
statement|Is that ___ true or false?
treatment|The vet gave my dog a ___ for fleas.
basement|We keep the old toys in the ___.
apartment|We live in an ___ on the third floor.
brightness|Turn down the ___ on the screen.
fairness|The referee was known for ___.
wilderness|The hikers camped in the ___.
thoughtful|It was ___ of you to send a card.
peaceful|The lake is ___ in the morning.
graceful|The swan is a ___ bird.
wonderful|We had a ___ time at the zoo.
cheerful|Our ___ neighbor always waves hello.
grateful|I am ___ for my friends.
harmless|The little garden snake is ___.
breathless|I was ___ after climbing the stairs.
carefully|Carry the eggs ___.
gently|Pet the bunny ___.
actually|I thought I'd hate broccoli, but I ___ like it.
exactly|We arrived at ___ three o'clock.
truly|I am ___ sorry I broke your vase.
allowed|We are ___ to wear hats at recess.
aloud|The teacher read the story ___.
cereal|I eat ___ with milk for breakfast.
cell|A ___ is the smallest unit of life.
berry|A strawberry is a red ___.
bury|The dog likes to ___ its bone in the yard.
course|The runners followed the race ___.
knead|___ the dough before you bake the bread.
knight|The ___ wore shiny armor.
mist|A light ___ covered the lake.
missed|I ___ the bus this morning.
root|The ___ of the plant grows underground.
route|We took a new ___ to school.
scene|The movie's last ___ was exciting.
waist|She tied the belt around her ___.
waste|Don't ___ water.
pedal|Push the ___ to make the bike go.
aisle|The cereal is in ___ four.
guessed|You ___ the right answer!
peace|The two countries signed a ___ treaty.
site|This is the ___ for the new school.
tide|At low ___ we can find crabs on the beach.
tied|I ___ my shoes in a double knot.
flee|The rabbits ___ when they see a fox.
hoarse|My voice was ___ after cheering at the game.
anything|I would do ___ for my dog.
anywhere|Sit ___ you like.
background|The mountains were in the ___ of the photo.
crosswalk|Always cross the street at the ___.
doorbell|The ___ rang twice.
driveway|Dad parked the car in the ___.
earthquake|The ___ shook the whole house.
eyebrow|She raised one ___ in surprise.
fingernail|I broke a ___ climbing the tree.
flashlight|We used a ___ in the tent.
grasshopper|A ___ hopped across the path.
handwriting|Your ___ is so neat.
horseback|We went ___ riding on the trail.
keyboard|Type your name on the ___.
lifeguard|The ___ watches the swimmers.
motorcycle|The ___ roared down the street.
paintbrush|Dip your ___ in the blue paint.
password|Never share your ___ with strangers.
scarecrow|The ___ stood in the cornfield.
shoelace|My ___ came untied.
snowstorm|School closed because of the ___.
strawberry|A ___ has seeds on the outside.
sunglasses|Wear ___ to protect your eyes.
thunderstorm|We stayed inside during the ___.
toothpaste|Squeeze the ___ onto your brush.
watermelon|We ate juicy ___ at the picnic.
wildlife|The park is home to lots of ___.
woodpecker|A ___ tapped on the tree.
yourself|Believe in ___!
themselves|The kids cleaned up after ___.
meanwhile|I set the table. ___, Mom cooked dinner.
however|I like pizza. ___, I like tacos more.
whenever|Call me ___ you need help.
throughout|It rained ___ the night.
doctor|The ___ listened to my heart.
actor|The ___ played a pirate in the movie.
visitor|We had a ___ from another school.
sailor|The ___ tied a knot in the rope.
inventor|The ___ built a flying machine.
mayor|The ___ of our town cut the ribbon.
grammar|Good ___ makes your writing clear.
popular|Soccer is a ___ sport.
regular|We have ___ practice on Mondays.
similar|Your drawing is ___ to mine.
particular|She is very ___ about how her room looks.
computer|I typed my report on the ___.
gather|Let's ___ around the campfire.
whisper|___ the secret in my ear.
monster|The ___ in the book was friendly.
thunder|The ___ was so loud it shook the windows.
silver|She won a ___ medal.
shiver|Cold weather makes me ___.
chapter|Read the first ___ of the book tonight.
wonder|I ___ what the stars are made of.
partner|Work with a ___ on this project.
angel|She played an ___ in the holiday show.
camel|A ___ can go days without water.
level|I beat the next ___ of the game.
tunnel|The train went through a dark ___.
towel|Dry off with a ___.
vowel|A, E, I, O, and U are each a ___.
label|Put a ___ on each jar.
nickel|A ___ is worth five cents.
metal|The spoon is made of ___.
medal|She won a gold ___.
total|What is the ___ of these numbers?
signal|The coach gave us a ___ to start.
normal|My temperature is back to ___.
festival|We went to the spring music ___.
hospital|The baby was born at the ___.
natural|The park has a ___ spring.
several|I have ___ friends on my street.
accept|Please ___ this gift.
accident|Spilling the paint was an ___.
appear|Stars ___ in the sky at night.
approach|Slowly ___ the horse from the front.
arrive|We will ___ at noon.
attack|The team planned a strong ___ on the soccer field.
attend|I will ___ the meeting.
battle|The two knights had a ___.
connect|___ the dots to see the picture.
difficult|The test was ___, but I passed.
hobby|My ___ is collecting stamps.
message|I left a ___ on the phone.
office|The principal is in her ___.
opposite|Hot is the ___ of cold.
pattern|Red, blue, red, blue is a ___.
success|Hard work leads to ___.
suggest|I ___ we leave early.
support|Friends ___ each other.
traffic|The ___ was heavy this morning.
umbrella|Take an ___ in case it rains.
across|We swam ___ the pool.
built|The beavers ___ a dam.
captain|The ___ steered the ship.
certain|Are you ___ the store is open?
complete|___ the worksheet before recess.
describe|Can you ___ the animal you saw?
eighth|My brother is in ___ grade.
either|You can have ___ the apple or the pear.
neither|___ of us knew the answer.
entire|I read the ___ book in one day.
except|Everyone came ___ Sam.
excellent|You did an ___ job!
instead|Let's walk ___ of driving.
meant|I ___ to call you yesterday.
mountain|We climbed to the top of the ___.
ninety|A right angle measures ___ degrees.
ninth|My sister is in ___ grade.
perhaps|___ it will snow tomorrow.
scissors|Cut the paper with ___.
tongue|The frog caught a fly with its long ___.
twelve|There are ___ months in a year.
written|The note was ___ in pencil.
yesterday|Today is Monday, so ___ was Sunday.
area|We measured the ___ of the rectangle.
dictionary|Look up the word in the ___.
distance|The ___ to school is one mile.
electricity|Lamps need ___ to work.
emotion|Joy is a happy ___.
fruit|An apple is my favorite ___.
geography|In ___ we study maps.
history|We learned about the past in ___ class.
hurricane|The ___ brought strong winds and rain.
important|Sleep is ___ for your health.
insect|An ant is an ___ with six legs.
material|Cotton is a soft ___.
object|What ___ is in the box?
ordinary|It was just an ___ day.
paragraph|Write a ___ about your summer.
population|The town has a ___ of five thousand.
product|Twelve is the ___ of three and four.
reptile|A snake is a ___.
scientist|The ___ looked through the microscope.
sentence|A ___ begins with a capital letter.
shelter|The dog found ___ from the rain.
skeleton|Your ___ is made of bones.
system|Our solar ___ has eight planets.
universe|The ___ is full of galaxies.
volcano|Lava poured out of the ___.
`);
  add("4", `
unaware|I was ___ that the store had closed early.
unlikely|Snow in July is very ___.
unpopular|The new lunch menu was ___ with students.
unselfish|Sharing your snack is an ___ thing to do.
unexpected|We had an ___ visitor at the door.
unhealthy|Eating only candy is ___.
unable|I was ___ to reach the top shelf.
discourage|Don't let one mistake ___ you.
disorder|The room was in total ___ after the party.
distrust|Broken promises cause ___.
inactive|The volcano has been ___ for years.
inexpensive|The toy was ___, only one dollar.
informal|Jeans are fine for an ___ party.
impolite|It is ___ to interrupt.
improper|Using a knife as a screwdriver is ___.
preteen|My eleven-year-old cousin is a ___.
recharge|___ the tablet overnight.
revisit|We will ___ the museum next summer.
misfortune|Losing the game was a small ___.
overcast|The sky was gray and ___.
overdue|My library book is ___.
overhead|A plane flew ___.
overlook|Don't ___ the small details.
overjoyed|We were ___ to see our new puppy.
overboard|The captain shouted, "Man ___!"
underneath|The cat hid ___ the porch.
underdog|Everyone cheered for the ___.
understand|Do you ___ the directions?
subzero|Antarctica has ___ temperatures.
subheading|Each ___ tells what the section is about.
intersection|Stop at the busy ___.
interstate|We drove on the ___ highway.
midway|We stopped for lunch ___ through the trip.
midair|The cat twisted in ___.
lotion|Put ___ on your dry hands.
potion|The wizard brewed a magic ___.
portion|Eat a healthy ___ of vegetables.
caution|Use ___ near the stove.
creation|The robot was her own ___.
donation|We made a ___ to the animal shelter.
selection|The library has a great ___ of books.
election|We held a class ___.
correction|Make a ___ in red pen.
connection|The video stopped because of a bad ___.
construction|The road is under ___.
section|Read the first ___ of the chapter.
fiction|A ___ book tells a made-up story.
friction|Rubbing your hands makes ___.
condition|The used bike is in good ___.
mansion|The ___ had twenty rooms.
erosion|Wind and water cause ___.
joyous|The wedding was a ___ celebration.
hazardous|Smoke can be ___ to your health.
victorious|The ___ team lifted the trophy.
studious|The ___ girl read every night.
lovable|The puppy is so ___.
likable|Our new neighbor is very ___.
readable|Make your handwriting ___.
fixable|The broken toy is ___.
laughable|His excuse was ___.
drinkable|The stream water is not ___.
movable|The desks are ___ so we can work in groups.
usable|The old phone is still ___.
affordable|The bike was ___.
honorable|Telling the truth was the ___ thing to do.
horrible|The smell was ___.
audible|Her whisper was barely ___.
entertainment|The clown provided ___ at the party.
measurement|Write each ___ in centimeters.
arrangement|The flower ___ was beautiful.
announcement|The principal made an ___ over the speaker.
disappointment|The canceled trip was a big ___.
encouragement|Thanks for the ___!
improvement|Your handwriting shows great ___.
awareness|The poster raises ___ about recycling.
emptiness|The ___ of the house felt strange after we moved.
friendliness|Her ___ made the new student feel welcome.
loneliness|The puppy whined from ___.
politeness|Saying please shows ___.
stillness|The ___ of the lake was peaceful.
thickness|Measure the ___ of the board.
delightful|We had a ___ afternoon.
faithful|My dog is a ___ friend.
fearful|The ___ kitten hid under the bed.
meaningful|The gift was small but ___.
plentiful|Apples are ___ in the fall.
respectful|Be ___ to your elders.
successful|The bake sale was ___.
angrily|The goose honked ___.
eagerly|We waited ___ for the show.
honestly|Answer the questions ___.
luckily|___, we found the lost ring.
merrily|We sang ___ around the campfire.
noisily|The kids ___ ran outside.
politely|She ___ asked for help.
proudly|He ___ showed off his new belt.
rapidly|The river flowed ___.
recently|We ___ moved to a new town.
seriously|Take your training ___.
steadily|The rain fell ___.
wisely|Spend your money ___.
nearly|I ___ forgot my lunch.
hardly|I could ___ see in the fog.
mostly|The sky was ___ clear.
barely|We ___ made it on time.
boulder|A giant ___ blocked the trail.
bolder|She grew ___ as she practiced.
chord|He strummed a ___ on the guitar.
cord|Plug in the ___.
duel|The two knights fought a ___.
dual|The car has ___ airbags.
phase|The moon has a new ___ each week.
gorilla|The ___ beat its chest.
hanger|Put your shirt on a ___.
hangar|The plane is parked in the ___.
miner|The ___ dug for gold.
minor|It was only a ___ scratch.
peer|___ through the keyhole.
prey|The hawk watched its ___.
sole|The ___ of my shoe has a hole.
soul|She sang with heart and ___.
suite|We stayed in a hotel ___.
thrown|The ball was ___ too far.
vain|The ___ prince looked in the mirror all day.
vane|The weather ___ points the way the wind blows.
burrow|Rabbits live in a ___.
cellar|We store potatoes in the ___.
seller|The ___ set up a booth at the market.
doe|A ___ is a female deer.
feat|Climbing the mountain was quite a ___.
manner|She spoke in a friendly ___.
presents|We opened ___ on my birthday.
raise|___ your hand to answer.
afterward|We ate dinner, and ___ we watched a movie.
backbone|Your ___ is also called your spine.
backyard|We have a swing set in the ___.
billboard|A huge ___ stood by the highway.
bookmark|Put a ___ in your book.
brainstorm|Let's ___ ideas for our story.
campground|We pitched our tent at the ___.
carpool|We ___ to school with our neighbors.
clockwise|Turn the lid ___ to close it.
cornfield|We got lost in the ___ maze.
dishwasher|Load the plates into the ___.
dragonfly|A ___ hovered over the pond.
drawbridge|The castle has a ___.
eyesight|Carrots are said to help your ___.
fireworks|We watched ___ on the Fourth of July.
forehead|Mom felt my ___ for a fever.
gingerbread|We built a ___ house.
hairbrush|I lost my ___.
handshake|Greet the judge with a firm ___.
headlight|One ___ on the car is out.
heartbeat|The doctor listened to my ___.
homesick|I felt ___ at summer camp.
horseshoe|The blacksmith made a ___.
iceberg|The ship steered around the ___.
lifetime|This is the chance of a ___.
nickname|My ___ is Bear.
postcard|Send Grandma a ___ from the beach.
quicksand|The explorer got stuck in ___.
rattlesnake|A ___ shakes its tail as a warning.
seashore|We collected shells along the ___.
shortcut|We took a ___ through the park.
skyscraper|The ___ is one hundred stories tall.
snowboard|I ride my ___ down the mountain.
suitcase|Pack your ___ for the trip.
sunlight|Plants need ___.
tablespoon|Add one ___ of butter.
warehouse|The boxes are stored in a ___.
wheelbarrow|Push the dirt in the ___.
windshield|Rain splashed on the ___.
worldwide|The game is popular ___.
camera|Smile for the ___!
carpet|The new ___ is soft.
comedy|We watched a funny ___.
lemonade|We sold ___ at our stand.
magazine|I read a ___ about animals.
melody|Hum the ___ of the song.
museum|We saw dinosaur bones at the ___.
orchard|We picked apples at the ___.
pajamas|Put on your ___ for bed.
pelican|A ___ scoops fish with its big beak.
penguin|A ___ cannot fly but can swim.
pirate|The ___ had a parrot on his shoulder.
pyramid|The ancient ___ was made of stone.
recipe|Follow the ___ to bake the cake.
sandal|I lost a ___ at the beach.
spinach|___ is a leafy green vegetable.
tornado|The ___ twisted across the field.
trophy|Our team won a ___.
violin|She plays the ___ in the orchestra.
wizard|The ___ waved his wand.
yogurt|I eat ___ with berries.
colony|An ant ___ can have thousands of ants.
continent|Africa is a large ___.
explorer|The ___ sailed to new lands.
settler|The ___ built a log cabin.
pioneer|The ___ traveled west in a covered wagon.
landform|A mountain is a ___.
nutrient|Calcium is a ___ that builds strong bones.
organism|Every living thing is an ___.
predator|A wolf is a ___.
adaptation|Thick fur is an ___ to cold weather.
hibernate|Bears ___ in winter.
evaporate|Puddles ___ in the sun.
circuit|The bulb lit up when we closed the ___.
magnetic|Iron is ___.
force|A push or a pull is a ___.
lever|A seesaw is a kind of ___.
pulley|We lifted the bucket with a ___.
axle|The wheels turn on an ___.
rotate|The Earth will ___ once each day.
revolve|The planets ___ around the sun.
galaxy|Our ___ is called the Milky Way.
comet|A ___ has a glowing tail.
meteor|A ___ streaked across the sky.
crater|The falling rock left a huge ___ in the ground.
happened|What ___ at recess?
writing|I love ___ stories.
friendly|Our ___ mail carrier waves to us.
decided|We ___ to walk to school.
noticed|I ___ a bird's nest in the tree.
surely|You will ___ do well.
dolphin|A ___ jumped out of the water.
falcon|The ___ dove at great speed.
flamingo|A pink ___ stood on one leg.
hamster|My ___ runs on its wheel.
jaguar|The ___ is a big spotted cat.
leopard|A ___ rested in the tree.
lobster|A ___ has big claws.
ostrich|The ___ is the largest bird.
panther|The black ___ crept through the jungle.
peacock|The ___ spread its colorful tail.
porcupine|A ___ has sharp quills.
scorpion|A ___ has a stinger on its tail.
sparrow|A little ___ hopped on the ground.
walrus|A ___ has long tusks.
coyote|We heard a ___ howl.
`);
  add("5", `
autograph|The author signed her ___ in my book.
photograph|We framed a ___ of our family trip.
biography|I read a ___ about a famous inventor.
graphic|The ___ showed how the water cycle works.
telephone|Long ago, every house had a ___ on the wall.
microphone|The singer stepped up to the ___.
symphony|The orchestra played a ___ in four parts.
telescope|We looked at the moon through a ___.
microscope|Under the ___, the drop of water was full of life.
periscope|The submarine raised its ___ to look above the waves.
biology|In ___ we study living things.
geology|In ___ we learn about rocks and minerals.
thermometer|The ___ showed it was below freezing.
kilometer|A ___ is one thousand meters.
diameter|The ___ of a circle goes straight through its center.
perimeter|Add up all four sides to find the ___ of the square.
automobile|Another word for car is ___.
automatic|The ___ doors opened as we walked up.
microwave|Heat your soup in the ___ for one minute.
phonics|We used ___ to sound out new words.
dehydrate|Drink water so you don't ___ on hot days.
bicycle|A ___ has two wheels.
tricycle|My little brother rides a ___ with three wheels.
astronaut|The ___ floated inside the space station.
disaster|The flood was a ___ for the town.
astronomy|___ is the study of stars and planets.
technology|New ___ helps doctors save lives.
hemisphere|The equator divides Earth into the northern and southern ___.
atmosphere|Earth's ___ is made mostly of nitrogen.
portable|A laptop is a ___ computer.
transport|Trucks ___ food to the grocery store.
export|Our state grows oranges to ___ to other countries.
import|Some countries ___ most of their oil.
report|I wrote a book ___ on whales.
passport|You need a ___ to travel to another country.
eject|Press the button to ___ the disc.
project|Our science ___ is about volcanoes.
reject|The editor may ___ the story if it is too long.
inject|The nurse will ___ the vaccine into my arm.
subject|Math is my favorite ___.
construct|The workers will ___ a new bridge.
destruction|The tornado left a path of ___.
instruct|The coach will ___ us on how to block.
erupt|The volcano could ___ at any time.
disrupt|Please do not ___ the class.
abrupt|The car came to an ___ stop.
dictate|Mom will ___ the grocery list while I write it.
predict|Can you ___ what happens next in the story?
contradict|Your answer seems to ___ what you said before.
verdict|The jury reached a ___.
prescribe|The doctor will ___ medicine for my cough.
inscription|The ___ on the trophy listed the winners.
manuscript|The author mailed her ___ to the publisher.
spectator|Each ___ cheered from the stands.
inspect|The mechanic will ___ the brakes.
respect|Bow to show ___ to your teacher.
spectacle|The fireworks show was quite a ___.
revise|___ your essay to make it stronger.
visual|A map is a ___ way to show information.
audience|The ___ clapped after the play.
audio|Turn up the ___ so we can hear.
auditorium|The school play was held in the ___.
audition|She had an ___ for the lead role.
transfer|I will ___ to a new school next year.
transform|A caterpillar will ___ into a butterfly.
translate|Can you ___ this sentence into Spanish?
transparent|Glass is ___, so light passes through it.
transmit|Radio towers ___ signals.
manual|Read the ___ before using the machine.
manufacture|The factory will ___ ten thousand cars.
aquarium|We saw sharks at the ___.
aquatic|Frogs and fish are ___ animals.
territory|The wolves guarded their ___.
annual|We go to the ___ fair every summer.
centimeter|The beetle is one ___ long.
percent|Fifty ___ is the same as one half.
liberty|The bell is a symbol of ___.
pollution|Car exhaust causes air ___.
solution|We found a ___ to the problem.
attraction|The roller coaster is the park's biggest ___.
competition|She won the spelling ___.
composition|The pianist played her own ___.
conclusion|Write a strong ___ for your essay.
conversation|We had a long ___ on the phone.
definition|Look up the ___ in the dictionary.
description|Write a ___ of your favorite place.
discussion|We had a class ___ about recycling.
education|A good ___ opens many doors.
explanation|The teacher gave a clear ___.
expression|The ___ on her face showed she was surprised.
extension|The teacher gave us an ___ on the project.
imagination|Use your ___ to write a story.
introduction|The ___ tells what the book is about.
invitation|I got an ___ to the party.
location|Mark the ___ on the map.
nutrition|Good ___ helps you grow strong.
observation|Record each ___ in your science journal.
permission|Ask for ___ before you leave.
position|Get into fighting ___.
preparation|Good ___ helps you do well on tests.
protection|Sunscreen gives ___ from the sun.
punctuation|Periods and commas are ___ marks.
reaction|Her ___ to the surprise was a huge smile.
reflection|I saw my ___ in the lake.
situation|Stay calm in an emergency ___.
suggestion|Do you have a ___ for the team name?
tradition|Baking cookies is a family ___.
transportation|Buses are a form of public ___.
mission|The astronauts' ___ was to fix the satellite.
tension|There was ___ in the room before the results.
adventurous|The ___ explorer climbed the tallest peak.
anxious|I felt ___ before the big game.
cautious|Be ___ when walking on ice.
courageous|The ___ lifeguard saved the swimmer.
continuous|The machine makes a ___ humming sound.
fabulous|We had a ___ time at the party.
furious|The ___ storm battered the coast.
glorious|It was a ___ sunny day.
gorgeous|The sunset was ___.
hilarious|The comedy was ___.
marvelous|What a ___ performance!
numerous|There are ___ stars in the sky.
obvious|The answer was ___ once I saw the clue.
poisonous|Some mushrooms are ___.
precious|Diamonds are ___ stones.
previous|Review the ___ chapter before reading on.
serious|This is a ___ problem.
spacious|Our new house is ___ with lots of rooms.
tremendous|The team made ___ progress this year.
various|The store sells ___ kinds of fruit.
adorable|The puppy is ___.
agreeable|The weather was ___ for a picnic.
available|Is this seat ___?
believable|The characters felt real, and the story was ___.
capable|You are ___ of great things.
dependable|A ___ friend always keeps promises.
edible|Some flowers are ___.
incredible|The view from the top was ___.
legible|Write neatly so your work is ___.
reasonable|That is a ___ price.
reliable|Our old car is very ___.
remarkable|She made a ___ recovery.
responsible|I am ___ for feeding the dog.
suitable|This movie is ___ for kids.
reversible|My jacket is ___: red on one side, blue on the other.
convertible|We rode in a ___ with the top down.
divisible|Ten is ___ by five.
absence|The teacher noticed my ___ on Monday.
appearance|The star made a surprise ___ at the show.
assistance|Ask the librarian for ___.
attendance|The teacher takes ___ each morning.
confidence|Practice gives you ___.
difference|What is the ___ between the two pictures?
entrance|Meet me at the main ___.
evidence|The detective found ___ at the scene.
importance|The coach stressed the ___ of teamwork.
independence|The colonies fought for their ___.
influence|Good friends are a positive ___.
performance|The band gave a great ___.
presence|Your ___ makes the party better.
reference|Use the encyclopedia as a ___.
residence|The governor's ___ is a big white house.
silence|There was ___ during the test.
abundant|Fish are ___ in this lake.
assistant|The ___ helped the teacher pass out papers.
brilliant|What a ___ idea!
confident|I feel ___ about the test.
constant|The ___ dripping kept me awake.
elegant|She wore an ___ gown.
frequent|We are ___ visitors at the library.
innocent|The puppy looked ___ next to the chewed shoe.
instant|The cake mix makes ___ pudding.
intelligent|Dolphins are ___ animals.
magnificent|The castle was ___.
permanent|This marker is ___, so don't use it on the table.
pleasant|We had a ___ walk in the park.
resident|Every ___ of the town was invited.
significant|Winning the trophy was a ___ moment.
bilingual|My cousin is ___; she speaks English and French.
triangle|A ___ has three sides.
tripod|Set the camera on the ___.
semicircle|We sat in a ___ around the teacher.
semifinal|Our team won the ___ and made the finals!
multiply|___ seven by eight.
supervise|A lifeguard will ___ the swimmers.
uniform|I wear my karate ___ to class.
unicycle|The clown rode a ___ with one wheel.
unicorn|The ___ in the story had a golden horn.
octagon|A stop sign is an ___.
octopus|An ___ has eight arms.
pentagon|A ___ has five sides.
decade|A ___ is ten years.
centipede|A ___ has many legs.
appreciate|I ___ your help.
approximately|The trip takes ___ two hours.
arctic|Polar bears live in the ___.
athlete|The ___ trained every day.
awkward|There was an ___ silence.
boundary|The river forms a ___ between the two states.
cafeteria|We eat lunch in the ___.
column|Add the numbers in each ___.
curiosity|Her ___ led her to explore the cave.
jewelry|She keeps her ___ in a box.
judgment|Use good ___ when choosing friends.
laboratory|The scientist worked in a ___.
mathematics|___ includes algebra and geometry.
medicine|Take your ___ after dinner.
mischief|The kittens got into ___.
muscle|Exercise makes your ___ stronger.
physical|We have ___ education on Tuesdays.
pronunciation|Check the ___ of the word in the dictionary.
receipt|Keep the ___ in case you need to return it.
secretary|The school ___ answers the phone.
sincerely|I signed the letter "___, Maya."
souvenir|I bought a ___ at the museum.
strength|Lifting weights builds ___.
technique|Practice your kicking ___.
thorough|Do a ___ job cleaning your room.
twelfth|My birthday is on the ___ of May.
vehicle|A bus is a large ___.
yacht|The ___ sailed into the harbor.
chocolate|I had ___ cake for my birthday.
memory|I have a happy ___ of that trip.
factory|Cars are built in a ___.
mystery|I love reading ___ novels.
discovery|The ___ of the dinosaur bones made the news.
battery|My remote needs a new ___.
celery|I dipped ___ in peanut butter.
literature|We read classic ___ in English class.
average|The ___ of 2, 4, and 6 is 4.
cabinet|The plates are in the ___.
carnival|We rode the Ferris wheel at the ___.
celebrate|Let's ___ your birthday!
dinosaur|The ___ skeleton was huge.
elephant|An ___ has a long trunk.
element|Oxygen is an ___.
principal|The ___ runs our school.
principle|Honesty is an important ___.
capital|Write the first word with a ___ letter.
capitol|Lawmakers meet in the state ___ building.
coarse|Sandpaper feels ___.
affect|Lack of sleep can ___ your mood.
effect|The medicine had a good ___.
breath|Take a deep ___ before you start.
advice|My coach gave me good ___.
advise|I ___ you to study for the test.
device|A phone is a handy ___.
`);
  add("5", `
calligraphy|She wrote the invitations in elegant ___.
graphite|Pencil "lead" is really ___.
seismograph|A ___ records the shaking of an earthquake.
homophone|"Pair" is a ___ of "pear."
megaphone|The coach shouted through a ___.
stethoscope|The doctor listened to my heart with a ___.
barometer|A ___ measures air pressure.
speedometer|The ___ showed we were going fifty miles per hour.
pedometer|My ___ counted ten thousand steps.
metric|Scientists use the ___ system.
symmetry|A butterfly's wings show ___.
photocopy|Make a ___ of the worksheet.
biome|The desert is a dry ___.
antibiotic|The doctor gave me an ___ for my ear infection.
geometry|In ___ we study shapes and angles.
hydrant|Firefighters hooked the hose to the ___.
cyclone|A ___ is a storm with spinning winds.
thermal|She wore ___ socks on the ski trip.
thermostat|Turn up the ___ if you are cold.
porter|The ___ carried our bags to the room.
portfolio|The artist showed her ___ of drawings.
projector|The teacher turned on the ___.
objection|Does anyone have an ___ to the plan?
structure|The bridge is a strong ___.
instructor|My karate ___ showed us a new kata.
obstruct|Don't ___ the doorway with your bag.
eruption|The ___ of the volcano lit up the sky.
interruption|Sorry for the ___.
bankrupt|The failing store went ___.
prediction|My ___ is that it will snow tomorrow.
scribble|Don't ___ on the wall.
subscribe|We ___ to a science magazine.
transcript|Read the ___ of the speech.
prescription|The pharmacist filled my ___.
spectacles|Grandpa put on his ___ to read.
inspector|The health ___ checked the kitchen.
perspective|Try to see it from her ___.
prospect|The ___ of summer vacation made us smile.
suspect|The detective questioned the ___.
video|We made a ___ for our project.
provide|The school will ___ lunch.
supervisor|The ___ checked our work.
revision|Your second ___ is much better.
terrarium|The lizard lives in a ___.
century|A ___ is one hundred years.
centennial|The town celebrated its ___, its 100th birthday.
manicure|She got a ___ before the wedding.
pedicure|Mom painted my toenails like a real ___.
vacant|The house next door is ___.
motivate|A good coach can ___ the team.
promote|The posters ___ the school play.
remote|Where is the TV ___?
locomotive|The ___ pulled twenty train cars.
formula|The scientist wrote the ___ on the board.
reform|The town voted to ___ its parking rules.
formation|The geese flew in a V ___.
attract|Flowers ___ bees.
admiration|I have great ___ for my teacher.
affection|The cat showed ___ by purring.
calculation|Check your ___ with a calculator.
circulation|Exercise improves blood ___.
combination|Don't forget the ___ to your locker.
comparison|Make a ___ of the two stories.
concentration|Chess takes a lot of ___.
cooperation|Teamwork needs ___.
decoration|We hung a ___ on the door.
dedication|Her ___ to practice earned her a black belt.
destination|Our ___ is the Grand Canyon.
digestion|Fiber helps your ___.
distraction|Turn off the TV; it's a ___.
evolution|The ___ of the bicycle took many years.
examination|The doctor did a full ___.
exception|Everyone must wear a helmet, without ___.
exploration|Space ___ teaches us about the universe.
foundation|The house sits on a concrete ___.
frustration|She sighed in ___.
graduation|My brother's high school ___ is in June.
hesitation|She answered without ___.
imitation|My little brother does a funny ___ of our dog.
infection|Clean the cut to prevent ___.
injection|The nurse gave me an ___.
inspiration|Nature is my ___ for painting.
instruction|Read each ___ carefully.
intention|My ___ was to help.
irrigation|Farmers use ___ to water crops.
migration|We studied the ___ of whales.
motivation|A goal gives you ___.
navigation|Sailors used the stars for ___.
occupation|Her ___ is teaching.
operation|The doctor did an ___ on my knee.
opposition|The plan faced strong ___.
pollination|Bees help with ___.
presentation|I gave a ___ about volcanoes.
production|The school ___ of the play was great.
quotation|A famous ___ from the speech is painted on the wall.
relaxation|Yoga is good for ___.
reservation|We made a dinner ___.
revolution|The ___ changed the country forever.
rotation|One ___ of Earth takes a day.
separation|There is a ___ between the two rooms.
subtraction|We practiced ___ with regrouping.
temptation|The cookies were a big ___.
translation|Read the English ___ of the poem.
vibration|I felt the ___ of the phone.
explosion|The fireworks ended with a huge ___.
passion|She has a ___ for music.
precision|The surgeon worked with ___.
suspension|The bridge is a ___ bridge.
envious|I was a little ___ of his new bike.
harmonious|The choir sang in ___ voices.
luminous|The ___ moon lit the path.
perilous|The climbers made a ___ journey.
scrumptious|The pie was ___.
strenuous|The hike was long and ___.
luxurious|The hotel was ___.
industrious|The ___ ants worked all day.
acceptable|Is this answer ___?
fashionable|Her new boots are ___.
forgivable|An honest mistake is ___.
miserable|I felt ___ with a cold.
presentable|Comb your hair to look ___.
profitable|The bake sale was ___.
questionable|That shortcut is ___.
recyclable|Plastic bottles are ___.
unforgettable|Our trip was ___.
unstoppable|Our team was ___ this season.
compatible|The charger is not ___ with my phone.
gullible|The ___ kid believed the silly story.
invincible|The hero seemed ___.
ambulance|The ___ rushed to the hospital.
appliance|A toaster is a kitchen ___.
circumstance|Under no ___ should you touch the stove.
fragrance|The ___ of the roses filled the room.
ignorance|Learning helps us overcome ___.
instance|For ___, a robin is a bird.
inheritance|The old clock was an ___ from Grandpa.
remembrance|We planted a tree in ___ of our friend.
substance|Water is a clear ___.
coincidence|What a ___ that we wore the same shirt!
innocence|The puppy's eyes were full of ___.
accountant|The ___ helped with taxes.
attendant|The flight ___ served drinks.
distant|We saw a ___ mountain.
infant|An ___ is a baby.
merchant|The ___ sold spices at the market.
occupant|The ___ of the apartment is away.
participant|Each ___ got a T-shirt.
peasant|The ___ worked in the king's fields.
pheasant|A ___ ran across the field.
radiant|Her smile was ___.
vibrant|The painting has ___ colors.
absent|Three students were ___ today.
content|The cat is ___ on my lap.
current|The ___ pulled the boat downstream.
decent|He got a ___ grade on the test.
dependent|A puppy is ___ on its mother.
fluent|She is ___ in Spanish.
ingredient|Flour is the main ___.
instrument|The piano is my favorite ___.
moment|Wait a ___, please.
obedient|The ___ dog sat when told.
parent|A ___ must sign the form.
talent|She has a ___ for drawing.
urgent|The message was ___.
binoculars|We watched birds with ___.
triathlon|A ___ has swimming, biking, and running.
trilogy|I read all three books in the ___.
trio|A ___ of singers performed.
decimal|Put the ___ point in the right place.
hexagon|A ___ has six sides.
kilogram|The bag of rice weighs one ___.
millimeter|A ___ is very small.
monorail|We rode the ___ at the airport.
monotone|He spoke in a boring ___.
monarch|The ___ butterfly is orange and black.
duet|The two singers performed a ___.
dozen|A ___ eggs is twelve eggs.
absolutely|I ___ love this song!
basically|___, we need more time.
career|She wants a ___ in science.
disappoint|I don't want to ___ my coach.
extreme|The desert has ___ heat.
immediate|We need an ___ answer.
medieval|Knights lived in ___ times.
speech|She gave a ___ to the class.
wherever|I'll follow you ___ you go.
agriculture|Farming is also called ___.
ancestor|My ___ came from Ireland.
architect|The ___ designed the new library.
artifact|The museum displays an ancient ___.
civilization|The Maya built a great ___.
colonist|Each ___ worked hard to build the town.
congress|___ makes the nation's laws.
culture|Food is a big part of every ___.
currency|The dollar is our ___.
debate|The class held a ___ about homework.
delegate|Each state sent a ___ to the meeting.
economy|Tourism helps the town's ___.
empire|The Roman ___ was huge.
federal|The ___ government is in Washington, D.C.
heritage|We celebrate our family's ___.
industry|The car ___ employs many people.
monument|We visited the ___ in the park.
patriot|The ___ loved his country.
petition|We signed a ___ for a new playground.
republic|A ___ has elected leaders.
treaty|The countries signed a peace ___.
veteran|We thanked the ___ for her service.
volunteer|I ___ at the animal shelter.
absorb|A sponge can ___ water.
atom|An ___ is very tiny.
bacteria|Wash your hands to remove ___.
carbon|Diamonds are made of ___.
chemical|Bleach is a strong ___.
conductor|Copper is a good ___ of electricity.
consumer|A rabbit is a ___ that eats plants.
decompose|Leaves ___ into soil.
density|Oil floats on water because of its lower ___.
experiment|We did a science ___.
extinct|Dinosaurs are ___.
inherit|Children ___ traits from their parents.
insulator|Rubber is a good ___.
nucleus|The ___ is the center of a cell.
observe|___ the bird with your binoculars.
particle|A ___ of dust floated in the light.
producer|A plant is a ___ because it makes food.
species|There are many ___ of birds.
vapor|Water ___ rose from the pot.
variable|Change one ___ at a time in your experiment.
volume|Turn down the ___.
commute|My dad has a long ___ to work.
compute|Use a calculator to ___ the total.
dispute|The referee settled the ___.
pollute|Don't ___ the river.
salute|The soldiers ___ the flag.
contribute|Everyone can ___ to the food drive.
distribute|Please ___ the papers.
`);
  add("6", `
benefit|Regular exercise is a great ___ to your health.
beneficial|Sleep is ___ for growing kids.
benevolent|The ___ king shared food with everyone.
malfunction|A computer ___ shut down the whole system.
chronological|List the events in ___ order, from first to last.
synchronize|Let's ___ our watches before the hike.
chronic|Grandpa has a ___ cough that never quite goes away.
ecology|In ___ we study how living things depend on each other.
zoology|___ is the study of animals.
apology|He offered an ___ for being late.
analogy|The teacher used an ___ comparing the heart to a pump.
sympathy|We sent a card to show our ___.
empathy|Having ___ means understanding how others feel.
philosophy|Her ___ is to treat everyone with kindness.
polygon|A hexagon is a ___ with six sides.
monopoly|One company had a ___ on the town's water supply.
monologue|The actor gave a long ___ alone on stage.
dialogue|Use quotation marks around ___ in your story.
credible|The witness gave a ___ account of the event.
credit|She gave her partner ___ for the idea.
mortal|In the myth, the ___ hero fought the gods.
immortal|The myth told of an ___ creature that lived forever.
novice|As a ___, he had a lot to learn.
innovation|The smartphone was a huge ___.
renovate|They plan to ___ the old library.
pedestrian|Every ___ should use the crosswalk.
pendulum|The ___ of the clock swung back and forth.
suspend|We will ___ the swing from a strong branch.
verify|Please ___ your answer by checking it again.
version|This is the newest ___ of the game.
vocal|The singer warmed up her ___ cords.
vocabulary|Reading builds your ___.
advocate|She is an ___ for animal rights.
carnivore|A lion is a ___ that eats meat.
herbivore|A cow is a ___ that eats plants.
omnivore|A bear is an ___ that eats both plants and meat.
tractor|The farmer drove the ___ across the field.
distract|Don't let the noise ___ you.
extract|The dentist had to ___ my tooth.
circumference|Measure the ___ of the circle.
equator|The ___ circles the middle of the Earth.
equation|Solve the ___ for x.
equivalent|One half is ___ to two fourths.
evacuate|The town had to ___ before the hurricane.
fragile|Handle the ___ vase with care.
fragment|We found a ___ of pottery.
educate|Teachers ___ students.
gratitude|She expressed her ___ with a thank-you note.
congratulate|We ___ you on your new black belt!
sensation|I felt a tingling ___ in my foot.
sensitive|My teeth are ___ to cold.
mobile|A ___ library brings books to the neighborhood.
migrate|Monarch butterflies ___ south.
immigrate|Her family chose to ___ to a new country.
primary|The ___ colors are red, blue, and yellow.
primitive|Early humans used ___ tools.
senior|My brother is a ___ in high school.
junior|She is a ___ member of the team.
solar|We put ___ panels on the roof.
lunar|A ___ eclipse happens when Earth blocks the sun's light from the moon.
marine|Whales are ___ mammals.
fortress|The ___ had thick stone walls.
magnify|A lens can ___ tiny objects.
magnitude|The ___ of the earthquake was 6.0.
altitude|The plane flew at a high ___.
attitude|A positive ___ helps you learn.
latitude|The ___ lines run east and west on the globe.
longitude|Lines of ___ run from pole to pole.
ambitious|She is ___ and wants to be a doctor.
contagious|Her laughter was ___.
gracious|The ___ host made everyone feel welcome.
infectious|The flu is an ___ disease.
nutritious|Vegetables are ___.
suspicious|The detective was ___ of the story.
superstitious|He's ___ and always wears his lucky socks.
courteous|The ___ student held the door open.
spontaneous|We took a ___ trip to the beach.
outrageous|The clown wore an ___ costume.
advantageous|Being tall is ___ in basketball.
ridiculous|The idea of a flying pig is ___.
ferocious|The ___ lion roared.
monstrous|A ___ wave crashed over the pier.
mountainous|The region is ___ and rocky.
prosperous|The town became ___ after the mine opened.
treacherous|The icy road was ___.
accessible|The building is ___ to wheelchairs.
admirable|Her courage was ___.
collapsible|We packed a ___ chair for the game.
considerable|The project took a ___ amount of time.
digestible|Soup is easily ___ when you're sick.
durable|These boots are ___ and will last for years.
favorable|The weather is ___ for sailing.
flammable|Keep ___ liquids away from the fire.
manageable|Break big tasks into ___ steps.
memorable|Our trip was very ___.
perishable|Milk is ___, so keep it cold.
plausible|That is a ___ explanation.
predictable|The ending of the movie was ___.
respectable|He earned a ___ score on his first try.
irritable|I get ___ when I'm hungry.
acceptance|She got a letter of ___ from the camp.
allowance|I save my weekly ___.
annoyance|The buzzing fly was an ___.
avoidance|___ of sugar is good for your teeth.
brilliance|The ___ of the diamond dazzled us.
conference|The parent-teacher ___ is on Tuesday.
consequence|Missing practice had a ___.
convenience|The store's ___ is its location.
disturbance|The loud music caused a ___.
elegance|The dancer moved with ___.
endurance|Running builds ___.
excellence|The award honors ___ in science.
insurance|We have ___ on our house.
nuisance|The mosquitoes were a ___.
obedience|The puppy went to ___ school.
patience|Learning a new skill takes ___.
patients|The doctor saw ten ___ today.
persistence|Her ___ paid off when she earned her belt.
preference|What is your ___, juice or water?
relevance|The teacher explained the ___ of the lesson.
resemblance|There is a strong ___ between the twins.
resistance|The rocket faced air ___.
significance|What is the ___ of this date?
tolerance|Show ___ for different opinions.
competent|She is a ___ swimmer.
consistent|Be ___ with your practice.
contestant|Each ___ answered three questions.
descendant|She is a ___ of the town's first settlers.
dominant|The lion is the ___ animal in the pride.
evident|It was ___ that he had studied.
fragrant|The ___ flowers smelled sweet.
hesitant|I was ___ to jump into the cold pool.
incident|The principal reported the ___.
observant|An ___ student notices small details.
opponent|Bow to your ___ before sparring.
prominent|The mountain is a ___ landmark.
reluctant|The cat was ___ to take a bath.
sufficient|We have ___ supplies for the trip.
magician|The ___ pulled a rabbit from a hat.
musician|The ___ played the violin.
electrician|The ___ fixed the wiring.
physician|The ___ examined my throat.
technician|The ___ repaired the printer.
mathematician|The ___ solved a famous puzzle.
abbreviation|Dr. is an ___ for doctor.
appreciation|We gave flowers as a sign of ___.
association|The parent ___ planned the fair.
communication|Good ___ helps teams work together.
consideration|Thank you for your ___.
contribution|Every ___ to the food drive helps.
declaration|The ___ announced the country's freedom.
demonstration|The black belt gave a ___ of the kata.
determination|Her ___ helped her finish the race.
evaporation|___ turns water into vapor.
exhibition|The museum has a new art ___.
illustration|The ___ shows a dragon.
investigation|The police began an ___.
multiplication|We practiced ___ tables.
organization|The ___ helps homeless pets.
participation|Class ___ counts toward your grade.
precipitation|Rain and snow are forms of ___.
registration|___ for the tournament closes Friday.
satisfaction|She smiled with ___.
substitution|The coach made a ___ in the second half.
admission|___ to the museum is free.
commission|The artist got a ___ to paint a mural.
compassion|Show ___ to those who are hurting.
comprehension|We answered ___ questions about the story.
dimension|A cube has three ___ of length, width, and height.
excursion|We went on an ___ to the museum.
expansion|The ___ of the school added ten classrooms.
illusion|The magic trick was an optical ___.
inclusion|The club welcomes ___ of all students.
invasion|An ___ of ants took over the kitchen.
persuasion|It took some ___ to get my brother to try sushi.
procession|The wedding ___ walked down the aisle.
profession|Teaching is a rewarding ___.
progression|The ___ of belts goes from white to black.
supervision|Young kids need adult ___ at the pool.
transmission|The radio ___ was clear.
preferred|She ___ the window seat.
preferring|___ to stay dry, we waited out the rain.
referring|Which book are you ___ to?
transferred|He ___ to our school in January.
controlled|The pilot ___ the plane smoothly.
regretted|I ___ not studying for the test.
forgettable|The movie was so ___ that I can't remember the plot.
permitted|Phones are not ___ during the test.
admitted|He ___ that he broke the vase.
equipped|The car is ___ with a backup camera.
omitted|I accidentally ___ a word from my sentence.
propelled|The rocket was ___ by powerful engines.
benefited|The whole class ___ from the extra practice.
canceled|The game was ___ because of rain.
stationary|An exercise bike is ___; it doesn't go anywhere.
stationery|She wrote the letter on fancy ___.
discreet|Please be ___ and keep the surprise a secret.
discrete|The project was split into ___ steps.
alter|The tailor will ___ the pants to fit.
ascent|The hikers began their ___ up the mountain.
descent|The plane began its ___ to land.
bizarre|The ___ hat had feathers and bells.
fowl|Chickens and ducks are ___.
naval|The ___ ships sailed into the harbor.
profit|The lemonade stand made a ten-dollar ___.
wrapped|I ___ the gift in shiny paper.
residents|The ___ of the building met in the lobby.
symbol|The dove is a ___ of peace.
cymbal|The drummer crashed the ___.
troupe|A dance ___ performed at the festival.
weighed|The baby ___ seven pounds.
yolk|The ___ of an egg is yellow.
kernel|A ___ of corn popped in the pan.
lessen|Ice can ___ the swelling.
meddle|Don't ___ in other people's business.
pour|___ the milk into the glass.
strait|The ship sailed through the narrow ___.
vary|Prices ___ from store to store.
accessory|A scarf is a fun ___.
accompany|I will ___ you to the store.
achievement|Earning a black belt is a big ___.
adequate|Make sure you get ___ sleep.
adolescent|An ___ goes through many changes.
advertisement|We saw an ___ for the new cereal.
allegiance|We say the Pledge of ___.
amateur|He's an ___ photographer.
analyze|Scientists ___ data.
anonymous|The donor wished to remain ___.
apparatus|The firefighters wore breathing ___.
appetite|Exercise gives me a big ___.
banquet|The awards ___ had a huge dinner.
barrel|Rainwater collected in the ___.
biscuit|I ate a warm ___ with honey.
boulevard|Trees line the wide ___.
brochure|The ___ listed the museum hours.
buoyant|The life jacket is ___ and keeps you afloat.
campaign|She ran a ___ for class president.
candidate|Each ___ gave a speech.
cantaloupe|A ___ is a melon with orange fruit inside.
catastrophe|The flood was a ___.
ceiling|A fan hangs from the ___.
champion|She is the state chess ___.
chaos|The classroom was in ___ when the fire alarm rang.
choir|She sings in the school ___.
colossal|The statue was ___.
commercial|We saw a funny ___ during the show.
condemn|Many leaders ___ the unfair law.
courtesy|Saying thank you is a common ___.
criticism|Accept ___ and use it to improve.
cylinder|A soup can is shaped like a ___.
definite|We need a ___ answer by Friday.
democracy|In a ___, citizens vote.
desperate|The thirsty hikers were ___ for water.
develop|Practice helps you ___ new skills.
disastrous|The storm had ___ effects on the crops.
elementary|My little sister goes to ___ school.
eligible|You are ___ to vote at eighteen.
encyclopedia|Look it up in the ___.
essential|Water is ___ for life.
extraordinary|Her talent is ___.
fatigue|After the marathon, he felt great ___.
fiery|The dragon had ___ breath.
forfeit|If we don't show up, we will ___ the game.
fulfill|I will ___ my promise.
gauge|The gas ___ showed the tank was empty.
genuine|The ring is made of ___ gold.
guardian|A parent or ___ must sign the form.
gymnasium|The game is in the ___.
handkerchief|Grandpa keeps a ___ in his pocket.
hygiene|Brushing your teeth is good ___.
hypothesis|Write a ___ for your experiment.
imaginary|My little brother has an ___ friend.
immense|The ocean is ___.
intelligence|Owls are a symbol of wisdom and ___.
interfere|Don't let video games ___ with homework.
irrelevant|That detail is ___ to the story.
jealous|Don't be ___ of your friend's success.
leisure|I read in my ___ time.
lieutenant|The ___ gave the soldiers their orders.
luxury|The hotel had every ___.
mineral|Quartz is a common ___.
molecule|A water ___ has two hydrogen atoms.
mosquito|A ___ bit my arm.
obstacle|We ran the ___ course.
official|The referee is the game's ___.
opportunity|This is a great ___ to learn.
optimistic|Stay ___ even when things are hard.
orchestra|The ___ played a symphony.
pastime|Reading is my favorite ___.
peculiar|The cat had a ___ habit of sleeping in the sink.
perceive|Bats ___ objects using sound.
persuade|Can you ___ your parents to get a dog?
picnicking|We spent the afternoon ___ in the park.
pigeon|A ___ landed on the statue.
playwright|The ___ wrote a new comedy.
procedure|Follow the safety ___.
pursue|___ your dreams!
reign|The queen's ___ lasted fifty years.
relieve|This medicine will ___ your headache.
repetition|___ helps you memorize facts.
satellite|The ___ orbits Earth.
scenery|The mountain ___ was breathtaking.
siege|The castle was under ___ for months.
squirrel|A ___ buried acorns in the yard.
surgeon|The ___ operated on my knee.
tendency|My dog has a ___ to bark at squirrels.
tournament|We won the karate ___.
tragedy|The play was a ___ with a sad ending.
unnecessary|Bring only what you need; skip anything ___.
withhold|Don't ___ important information.
yield|___ to pedestrians at the crosswalk.
`);
  add("6", `
malnutrition|Without healthy food, people can suffer from ___.
biodegradable|Paper bags are ___ and break down in the soil.
biologist|The ___ studied frogs in the rain forest.
biosphere|Every living thing on Earth is part of the ___.
chronicle|The book is a ___ of the town's history.
creed|The dojo ___ reminds us to be humble and kind.
reduce|We can ___ waste by recycling.
factor|Sleep is one ___ in staying healthy.
defect|The toy was returned because of a ___.
confide|You can ___ in a trusted friend.
fidelity|The dog's ___ to its owner was touching.
confidential|Keep your password ___.
deflect|Use your forearm to ___ the strike.
reflex|The doctor tapped my knee to test my ___.
fracture|The X-ray showed a small ___ in my wrist.
junction|The two railroads meet at a ___.
conjunction|"And" is a ___.
lecture|The scientist gave a ___ on space.
locate|Can you ___ Peru on the map?
relocate|The company will ___ to another city.
logic|Use ___ to solve the puzzle.
geologist|The ___ studied the rock layers.
command|The dog obeyed every ___.
demand|There is a high ___ for the new game.
maritime|The ___ museum has old ships.
maternal|My ___ grandmother is my mom's mom.
paternal|My ___ grandfather is my dad's dad.
navigate|Sailors ___ by the stars.
pacify|A lullaby can ___ a crying baby.
telepathy|In the story, the twins talked by ___.
popularity|The game's ___ grew quickly.
populate|Many birds ___ the island.
dissect|In biology class we will ___ a flower.
intersect|The two streets ___ at the park.
bisect|___ the angle into two equal parts.
consent|A parent must give ___ for the field trip.
sentiment|The card expressed a kind ___.
contact|Stay in ___ with your friends.
intact|The vase arrived ___.
tempo|The song has a fast ___.
terrain|The jeep handled the rocky ___.
thermos|I keep hot soup in my ___.
tortoise|The ___ beat the hare.
turbine|The wind ___ makes electricity.
disturb|Please do not ___ the sleeping baby.
turbulent|The plane shook in ___ air.
convention|We went to a comic book ___.
prevent|Brushing helps ___ cavities.
intervene|The teacher had to ___ in the argument.
venture|They will ___ into the cave.
event|The race is the biggest ___ of the year.
versus|Tonight it's the Tigers ___ the Bears.
visibility|Fog reduced ___ on the road.
evoke|The smell of cookies can ___ happy memories.
provoke|Don't ___ the angry dog.
involve|The project will ___ the whole class.
evolve|Ideas ___ over time.
improvise|We had to ___ when we forgot the script.
disguise|He wore a mustache as a ___.
merchandise|The store sells sports ___.
enterprise|Her lemonade stand was a successful ___.
summary|Write a short ___ of the chapter.
salary|Her ___ went up this year.
glossary|Look up the word in the ___ at the back of the book.
commentary|The announcer gave ___ during the game.
visionary|The ___ inventor imagined flying cars.
pottery|We made ___ out of clay.
gallery|The art ___ has paintings and sculptures.
mastery|Black belts show ___ of the basics.
recovery|His ___ from the surgery was quick.
flattery|___ won't change my mind.
slippery|The wet floor is ___.
directory|Look for the store in the mall ___.
victory|The team celebrated its ___.
sensory|The museum has a ___ room for touching things.
fungi|Mushrooms are ___.
cacti|Many ___ grow in the desert.
radius|The ___ is half the diameter.
larva|A caterpillar is the ___ of a butterfly.
larvae|Mosquito ___ live in water.
antenna|The radio has a long ___.
antennae|An ant uses its ___ to smell.
gnome|A garden ___ stood by the flowers.
heir|The prince is the ___ to the throne.
honor|It is an ___ to meet you.
knack|She has a ___ for fixing things.
mortgage|My parents pay a ___ on our house.
scenic|We took the ___ route along the coast.
tomb|The pharaoh's ___ was full of treasure.
guilt|He felt ___ after breaking the vase.
vague|The directions were too ___.
league|I play in a soccer ___.
intrigue|The mystery is full of ___.
serial|Every computer has a ___ number.
cite|___ your sources in the report.
council|The city ___ voted on the new park.
counsel|The coach will ___ you on your goals.
emigrate|Her grandparents chose to ___ from Korea.
flair|She has a ___ for fashion.
flare|The ship fired a ___ for help.
forth|The swing moved back and ___.
forward|Step ___ with your right foot.
foreword|Read the ___ before chapter one.
hoard|Squirrels ___ nuts for winter.
horde|A ___ of fans rushed the stage.
idle|Don't leave the car engine running ___.
idol|The singer was her ___.
passed|I ___ my belt test!
past|In the ___, people wrote letters by hand.
peak|We climbed to the mountain ___.
wring|___ out your wet towel.
isle|The ship landed on a tiny ___.
mussel|A ___ is a shellfish.
barren|The ___ land had no trees.
baron|The ___ lived in a castle.
cache|The squirrel found its ___ of acorns.
academy|She goes to a music ___.
accuracy|Check your work for ___.
algebra|In ___ we solve for x.
alphabetical|Put the words in ___ order.
anxiety|Deep breaths can calm ___.
assignment|Turn in your ___ on Friday.
astonish|The magician will ___ the crowd.
authority|The principal has ___ over the school.
autobiography|She wrote an ___ about her life.
bargain|The jacket was a ___ at half price.
calorie|A ___ is a unit of energy in food.
catalog|We ordered from a ___.
cathedral|The old ___ has stained glass windows.
chorus|Everyone joined in the ___.
commotion|The ___ in the hallway was loud.
competitor|Each ___ bowed before the match.
concrete|The sidewalk is made of ___.
consonant|B is a ___.
corridor|Walk quietly down the ___.
coupon|Mom used a ___ at the store.
crystal|The ___ sparkled in the sun.
dandelion|I blew on the ___ and made a wish.
delicate|The butterfly's wings are ___.
denominator|In one-half, two is the ___.
diagram|Label the parts on the ___.
domestic|A dog is a ___ animal.
emerald|An ___ is a green gem.
emergency|Call 911 in an ___.
encounter|We had an ___ with a moose.
episode|I watched the last ___ of the show.
escalator|We rode the ___ to the second floor.
expedition|The ___ reached the North Pole.
flourish|Plants ___ in sunlight.
forecast|The ___ calls for rain.
fortunate|We are ___ to have a great teacher.
gadget|This kitchen ___ peels apples.
glimpse|I caught a ___ of the deer.
gymnast|The ___ did a backflip.
horizon|The sun sank below the ___.
humid|The air is hot and ___.
identical|The twins are ___.
illustrate|She will ___ the book.
immune|After the shot, I'm ___ to measles.
impact|Recycling has a big ___.
interval|Run in short bursts with a rest ___ between them.
investigate|The detective will ___.
isolate|The nurse had to ___ the sick patient.
journal|I write in my ___ every night.
kayak|We paddled a ___ on the river.
landscape|The painting shows a mountain ___.
lantern|We lit a ___ in the tent.
legend|The ___ tells of a hidden city.
mammoth|The woolly ___ lived in the Ice Age.
marathon|A ___ is over twenty-six miles.
mascot|Our school ___ is a tiger.
maximum|The ___ speed is fifty-five.
meadow|Wildflowers grew in the ___.
mechanic|The ___ fixed our car.
minimum|You need a ___ of three players.
mural|We painted a ___ on the wall.
myth|The Greek ___ tells about Zeus.
numerator|In three-fourths, three is the ___.
orangutan|An ___ swung through the trees.
original|This painting is the ___, not a copy.
panorama|The ___ from the top was amazing.
parchment|The old map was drawn on ___.
physics|In ___ we study force and motion.
poetry|We read ___ in English class.
portrait|The artist painted my ___.
prairie|Bison roamed the ___.
prism|A ___ splits light into colors.
quartz|___ is a clear crystal.
radar|The pilot watched the ___.
realistic|Set ___ goals.
rectangle|A door is shaped like a ___.
rehearse|We ___ the play every day.
resource|Water is a precious ___.
sapphire|A ___ is a blue gem.
scholar|The ___ studied ancient languages.
spaghetti|We had ___ and meatballs.
stadium|The ___ was packed with fans.
strategy|Our team needs a new ___.
suburb|We live in a quiet ___.
summit|They reached the ___ at noon.
tarantula|A ___ is a big hairy spider.
thesaurus|Use a ___ to find synonyms.
trapezoid|A ___ has one pair of parallel sides.
trombone|He slides the ___ to change notes.
tropical|Parrots live in ___ forests.
tsunami|The earthquake caused a ___.
typhoon|A ___ hit the island.
utensil|A fork is an eating ___.
vertical|Draw a ___ line from top to bottom.
vineyard|Grapes grow in the ___.
virus|The flu is caused by a ___.
`);
  add("7", `
accelerate|Press the gas pedal to ___.
accumulate|Snow will ___ quickly during the storm.
aggressive|A good sparring partner is focused, not ___.
alliance|The two kingdoms formed an ___.
announce|The principal will ___ the winners tomorrow.
assemble|We had to ___ the bookshelf ourselves.
attain|Hard work will help you ___ your goals.
collaborate|The two classes will ___ on the mural.
collide|The two marbles will ___ and bounce apart.
collision|Seat belts protect you in a ___.
commemorate|The statue was built to ___ the town's founders.
compromise|We reached a ___: one movie each.
conceive|It is hard to ___ how big the universe is.
condense|Water vapor will ___ on a cold glass.
illegal|It is ___ to park in front of a fire hydrant.
illegible|His handwriting was so messy it was ___.
illiterate|The program teaches ___ adults to read.
illogical|Your argument is ___ because it contradicts itself.
illuminate|Lanterns ___ the garden at night.
immature|Throwing a tantrum is ___.
immigrant|My great-grandfather was an ___ from Italy.
impartial|A referee must be ___.
irrational|His fear of butterflies is ___.
irregular|"Ran" is an ___ past tense verb.
irreplaceable|Family photos are ___.
irresponsible|Leaving the stove on is ___.
irreversible|Some damage to the environment is ___.
concede|The candidate had to ___ the election.
intercede|The teacher had to ___ in the argument.
precede|A drum roll will ___ the big announcement.
proceed|After the bow, you may ___ to the mat.
succeed|With practice, you will ___.
exceed|Do not ___ the speed limit.
recede|The floodwaters began to ___.
secede|Several states tried to ___ from the union.
conduct|Scientists ___ experiments in the lab.
deduction|The detective made a clever ___.
viaduct|The train crossed the valley on a stone ___.
infer|From the clues, we can ___ that the butler did it.
inference|Make an ___ about how the character feels.
fertile|The ___ soil grew great crops.
aggression|The dog showed no ___ toward the kitten.
digress|Let me ___ for a moment and tell a quick story.
progress|You have made great ___ this year.
judicial|The ___ branch interprets the laws.
prejudice|We should judge people by actions, not ___.
jury|The ___ listened carefully to both sides.
injury|He sat out the game with a knee ___.
jurisdiction|The case was outside the court's ___.
emit|Fireflies ___ light.
submit|___ your essay by Friday.
intermittent|The forecast called for ___ rain.
dismiss|The teacher will ___ the class at three.
intermission|We bought snacks during the ___ of the play.
omission|The ___ of one word changed the meaning.
compel|Curiosity will ___ you to keep reading.
expel|Your lungs ___ air when you breathe out.
propel|Oars ___ the boat forward.
repel|Magnets with the same poles ___ each other.
impulse|I bought the candy on ___.
compulsory|Attendance at the meeting is ___.
complicate|Don't ___ the problem.
duplicate|Make a ___ of the key.
replica|The museum has a ___ of the ship.
explicit|The directions were clear and ___.
component|Each ___ of the machine has a job.
postpone|We had to ___ the picnic because of rain.
composite|The police made a ___ sketch.
deposit|I will ___ my birthday money in the bank.
expose|Don't ___ your skin to too much sun.
proposal|The council approved the ___.
purpose|What is the ___ of this tool?
sequel|I can't wait to read the ___!
sequence|Put the events in the correct ___.
subsequent|The ___ chapters explain the mystery.
solitary|The ___ tree stood in the field.
solitude|She enjoys the ___ of early mornings.
desolate|The abandoned town was ___.
sonar|Ships use ___ to find objects underwater.
unison|The choir sang in ___.
resonate|The bell will ___ through the valley.
tenant|The new ___ moved into the apartment.
tenacious|The ___ climber reached the summit.
retain|Review your notes to ___ the information.
sustain|Plants ___ life on Earth.
abstain|Athletes ___ from junk food before a meet.
detain|The storm may ___ us at the airport.
distort|Funhouse mirrors ___ your reflection.
convert|We can ___ inches to centimeters.
divert|Workers will ___ traffic around the construction.
introvert|An ___ often recharges by spending time alone.
extrovert|An ___ gains energy from being around people.
versatile|A ___ athlete plays many sports.
adversity|She overcame ___ to graduate.
controversy|The new rule caused ___.
anniversary|My parents celebrated their ___.
universal|A smile is a ___ sign of friendliness.
vivid|She has a ___ imagination.
revive|A cool drink will ___ you.
survive|Plants cannot ___ without water.
vital|Water is ___ to all living things.
vitamin|Oranges have ___ C.
anthropology|___ is the study of human cultures.
philanthropy|Her ___ funded a new library.
aristocrat|The ___ lived in a grand estate.
bureaucracy|The ___ made it slow to get a permit.
epidemic|The flu ___ closed schools.
pandemic|A ___ spreads across many countries.
demographic|The survey studied each ___ group.
genetic|Eye color is a ___ trait.
generation|My grandparents' ___ grew up without computers.
hydrogen|Water is made of ___ and oxygen.
hydraulic|The car lift uses ___ power.
metamorphosis|A caterpillar goes through ___.
claustrophobia|People with ___ fear small spaces.
psychology|___ is the study of the mind.
psychiatrist|A ___ is a doctor who treats mental health.
sophomore|She is a ___ in high school.
theory|Scientists tested the ___.
chlorophyll|___ makes leaves green.
photosynthesis|Plants make food through ___.
oxygen|We breathe in ___.
nitrogen|Most of the air is ___.
apologize|I ___ for being late.
criticize|Don't ___ others without offering help.
emphasize|___ the important words when you speak.
memorize|I need to ___ my lines for the play.
organize|Let's ___ the closet.
realize|I didn't ___ how late it was.
specialize|The doctor will ___ in heart surgery.
summarize|___ the chapter in three sentences.
sympathize|I ___ with you; that sounds hard.
visualize|___ yourself scoring the goal.
amplify|Speakers ___ the music.
clarify|Can you ___ the instructions?
classify|Scientists ___ animals into groups.
intensify|The storm will ___ overnight.
justify|Can you ___ your answer with evidence?
modify|We had to ___ the plan.
notify|Please ___ the office if you will be absent.
qualify|You must win to ___ for the finals.
simplify|___ the fraction.
identify|Can you ___ the bird by its song?
optimism|Her ___ kept the team going.
heroism|The firefighter was honored for her ___.
journalism|She studied ___ in college.
tourism|___ brings money to the beach town.
patriotism|Flags waved as a sign of ___.
journalist|The ___ interviewed the coach.
novelist|The ___ wrote twelve books.
pianist|The ___ played a beautiful song.
specialist|The ___ treated my allergies.
dramatic|The ending was very ___.
energetic|The puppy is very ___.
enthusiastic|The crowd was ___.
heroic|The rescue was ___.
historic|The ___ building is over two hundred years old.
majestic|The ___ eagle soared overhead.
sarcastic|"Great job," he said in a ___ tone after I tripped.
scientific|We used the ___ method.
specific|Please be ___ about what you need.
economical|Buying in bulk is ___.
practical|Sneakers are ___ for hiking.
theatrical|The magician made a ___ entrance.
typical|It was a ___ Monday morning.
whimsical|The book has ___ illustrations.
contemporary|The museum displays ___ art.
itinerary|Our ___ includes three cities.
legendary|The ___ hero appears in many stories.
military|Her mother serves in the ___.
sanctuary|The bird ___ protects wildlife.
secondary|Safety is our main goal; speed is ___.
temporary|This is just a ___ fix.
voluntary|Joining the club is ___.
bravery|The medal honored her ___.
delivery|The pizza ___ arrived hot.
embroidery|The ___ on the pillow was beautiful.
machinery|The farm has heavy ___.
nursery|The baby's ___ is painted yellow.
surgery|He needed ___ on his knee.
auditory|An ___ learner learns best by listening.
contradictory|The two reports were ___.
dormitory|College students live in a ___.
explanatory|Read the ___ notes at the bottom.
inventory|The store took ___ of its products.
mandatory|Helmets are ___ for bike riders.
observatory|We looked at Saturn at the ___.
satisfactory|Your work is ___, but it could be better.
comprehensive|We took a ___ exam covering the whole year.
competitive|She is very ___ in sports.
conservative|Make a ___ guess on the low side.
decisive|The goal was the ___ moment of the game.
descriptive|Use ___ words in your writing.
destructive|Termites can be ___.
effective|This cleaner is very ___.
exclusive|The club is ___ to members only.
expensive|The diamond ring is ___.
explosive|Fireworks are ___.
impressive|Your kata was ___!
informative|The documentary was ___.
initiative|She took the ___ to clean up the park.
innovative|The company has an ___ design.
narrative|Write a personal ___.
persuasive|Write a ___ essay.
positive|Stay ___!
productive|We had a ___ meeting.
progressive|The ___ lessons get harder each week.
ballet|She dances ___.
beige|The walls are painted ___.
bouquet|He gave her a ___ of roses.
boutique|The ___ sells handmade jewelry.
collage|We made a ___ from magazine pictures.
debris|___ from the storm littered the streets.
depot|The bus ___ is downtown.
etiquette|Good table ___ means chewing with your mouth closed.
gourmet|The chef cooked a ___ meal.
matinee|We saw the afternoon ___.
mirage|The thirsty traveler saw a ___ in the desert.
plateau|The hikers rested on a flat ___.
plaque|The ___ honored the school's founder.
sabotage|Someone tried to ___ the experiment.
unique|Every snowflake is ___.
antique|Grandma has an ___ clock.
physique|The swimmer has a strong ___.
critique|The art teacher gave a helpful ___.
opaque|The ___ curtains block the light.
picturesque|The village was ___.
solemn|The ceremony was ___.
hymn|The choir sang a ___.
debt|He paid off his ___.
subtle|There was a ___ difference between the twins.
rhinoceros|The ___ has a horn on its nose.
rhubarb|Grandma baked a strawberry ___ pie.
pneumonia|He was in the hospital with ___.
wrestle|The bear cubs ___ in the grass.
wreath|We hung a ___ on the door.
nestle|The puppy likes to ___ against its mother.
bristle|Each ___ of the brush was stiff.
gnaw|Beavers ___ on trees.
resign|The coach decided to ___ after twenty years.
design|She wants to ___ video games.
diaphragm|Breathe deeply using your ___.
heirloom|This ring is a family ___.
exhibit|The museum has a dinosaur ___.
exhilarate|A roller coaster ride can ___ you.
conceit|His ___ made him hard to like.
counterfeit|The ___ bill was fake.
deceit|The villain's ___ was revealed.
protein|Eggs are high in ___.
seize|___ the opportunity!
caffeine|Coffee contains ___.
efficient|The new heater is more ___.
proficient|She is ___ in three languages.
glacier|The ___ moved slowly down the valley.
sieve|Pour the pasta through a ___.
shriek|We heard a ___ from the haunted house.
grieve|It's okay to ___ when you lose a pet.
grief|She felt ___ when her dog died.
retrieve|Dogs love to ___ balls.
frontier|Space is the final ___.
cashier|The ___ counted my change.
pierce|The thorn can ___ your skin.
fierce|The tiger is ___.
relief|What a ___ that the test is over!
acquaintance|He is just an ___, not a close friend.
phenomenon|The northern lights are an amazing ___.
knowledgeable|The guide was very ___ about birds.
miscellaneous|The drawer holds ___ items.
simultaneous|The two events were ___.
archaeology|___ is the study of ancient cultures.
complement|The red scarf will ___ your outfit.
compliment|She gave me a ___ on my drawing.
allusion|The poem makes an ___ to a famous myth.
elicit|The joke will ___ a laugh.
eminent|The ___ scientist won an award.
imminent|The storm's arrival is ___.
personal|Keep your ___ information private.
personnel|Only authorized ___ may enter.
adapt|Animals ___ to their environment.
adopt|We will ___ a puppy from the shelter.
averse|My cat is ___ to water.
adverse|The medicine had no ___ effects.
censor|The station will ___ bad language.
sensor|The motion ___ turned on the light.
envelope|Seal the ___ and mail it.
ensure|Double-check to ___ there are no mistakes.
insure|We ___ our car in case of an accident.
farther|The park is ___ than the school.
further|We will discuss this ___ tomorrow.
moral|The ___ of the story is to be kind.
morale|The win boosted team ___.
respectfully|Bow ___ to your instructor.
respectively|Tom and Ana scored ten and twelve points, ___.
`);
  add("7", `
ambidextrous|An ___ person can write well with either hand.
amphibian|A frog is an ___ that lives in water and on land.
antidote|The doctor gave the hiker an ___ for the snake bite.
apathy|Voter ___ means few people show up to vote.
aquifer|The town's well water comes from an underground ___.
benefactor|A generous ___ paid for the new playground.
circumnavigate|The sailors set out to ___ the globe.
deforestation|___ destroys the homes of many animals.
dermatologist|A ___ is a skin doctor.
diagnose|The doctor will ___ what is causing the rash.
epidermis|The ___ is the outer layer of your skin.
equinox|On the ___, day and night are about the same length.
extraterrestrial|The movie was about a friendly ___ from another planet.
fluctuate|Prices ___ from week to week.
geothermal|___ energy comes from heat inside the Earth.
hydroelectric|The dam produces ___ power.
infrared|Night-vision goggles detect ___ light.
insomnia|People with ___ have trouble sleeping.
interact|The zoo lets kids ___ with goats.
intercept|The safety jumped to ___ the pass.
malevolent|The ___ villain wanted to rule the world.
metabolism|Exercise speeds up your ___.
microorganism|A ___ can only be seen with a microscope.
monosyllable|"Cat" is a ___.
multilingual|The ___ guide spoke five languages.
orthodontist|The ___ put braces on my teeth.
pathogen|A ___ is a germ that causes disease.
philosopher|The ancient ___ asked big questions about life.
photographer|The ___ took our class picture.
postscript|She added a ___ at the bottom of the letter.
precaution|Wear a helmet as a ___.
subconscious|Dreams may come from the ___ mind.
submerge|Whales can ___ for a long time.
subterranean|Moles build ___ tunnels.
superficial|It was only a ___ scratch.
supernatural|The story had ___ creatures.
symbiosis|The clownfish and the sea anemone live in ___.
transcribe|Please ___ the interview into writing.
translucent|The ___ curtain let in soft light.
ultraviolet|Sunscreen blocks ___ rays.
vocation|Teaching was her true ___.
voracious|He is a ___ reader who finishes a book a day.
ability|She has the ___ to sing beautifully.
activity|Hiking is a fun outdoor ___.
capacity|The stadium has a ___ of fifty thousand.
celebrity|The ___ signed autographs.
charity|We raised money for ___.
creativity|Art class encourages ___.
dignity|Treat everyone with ___.
diversity|Our school celebrates ___.
equality|They marched for ___.
generosity|Her ___ helped many families.
humanity|Kindness is the best part of ___.
humidity|The ___ made my hair frizzy.
identity|The spy kept his ___ secret.
majority|The ___ of the class voted for pizza.
maturity|He handled the loss with ___.
minority|Only a ___ of students walk to school.
necessity|Water is a ___.
personality|My dog has a big ___.
possibility|There is a ___ of rain.
priority|Safety is our top ___.
probability|The ___ of rolling a six is one in six.
publicity|The event got a lot of ___.
quality|These shoes are good ___.
quantity|We need a large ___ of food.
reality|Her dream became a ___.
responsibility|Feeding the dog is my ___.
security|Airport ___ checked our bags.
sincerity|I believed him because of his ___.
society|Laws help ___ run smoothly.
university|My sister goes to a ___.
velocity|The ___ of the rocket increased.
abundance|The garden produced an ___ of tomatoes.
arrogance|His ___ made him hard to coach.
compliance|The building is in ___ with safety rules.
defiance|The toddler stomped her foot in ___.
dependence|The baby bird's ___ on its mother is total.
diligence|Her ___ earned her top grades.
eloquence|The speaker's ___ moved the crowd.
emergence|The ___ of the butterfly from its cocoon was beautiful.
exuberance|The puppy's ___ made us laugh.
grievance|The workers filed a ___.
impatience|His ___ grew as the line got longer.
inconvenience|Sorry for the ___.
indifference|She shrugged with ___.
insistence|At my mom's ___, I wore a coat.
interference|The radio had static ___.
magnificence|We admired the ___ of the waterfall.
negligence|The accident was caused by ___.
prominence|The young scientist rose to ___.
recurrence|We want to prevent a ___ of the problem.
reluctance|He agreed with some ___.
reverence|We bow with ___ in the dojo.
vigilance|Lifeguards watch with ___.
accommodation|The hotel offers ___ for large groups.
aggravate|Running will ___ your sore ankle.
annihilate|The comet could ___ everything in its path in the movie.
commitment|Training takes ___.
collectible|The old coin is a valuable ___.
deductible|Donations to charity may be tax ___.
desirable|A quiet room is ___ for studying.
despair|Don't give in to ___; keep trying.
dilapidated|The ___ barn leaned to one side.
exhilarating|The zip line was ___.
harassment|The school does not allow ___.
hindrance|The heavy backpack was a ___ on the hike.
incidentally|___, I found your lost glove.
jealousy|___ can hurt a friendship.
memento|I kept the ticket as a ___.
relevant|Include only ___ details.
therefore|It rained; ___, the game was canceled.
vicious|The ___ storm knocked out power.
anticipate|We ___ a big crowd.
assumption|Don't make an ___ without facts.
attribute|Patience is a good ___ in a teacher.
bias|A judge should not show ___.
climax|The ___ of the story was exciting.
conflict|The main ___ is between the hero and the dragon.
consequently|He studied hard; ___, he passed.
context|Use ___ clues to find the meaning.
contrast|Compare and ___ the two characters.
convey|Pictures can ___ strong feelings.
critical|Clean water is ___ for health.
deduce|From the clues, we can ___ the answer.
derive|Many English words ___ from Latin.
evaluate|___ your work before you turn it in.
excerpt|We read an ___ from the novel.
imply|What does the author ___?
indicate|Dark clouds ___ rain.
interpret|How do you ___ the poem?
narrator|The ___ tells the story.
objective|A news report should be ___.
precise|Give a ___ measurement.
resolution|The ___ of the story was happy.
speculate|Scientists ___ about life on other planets.
stanza|The poem has four lines in each ___.
subjective|Taste in music is ___.
symbolism|The author uses ___ throughout the book.
thesis|State your ___ in the first paragraph.
acceleration|The car's ___ pushed me back in my seat.
anatomy|We studied human ___.
asteroid|An ___ orbits the sun.
astronomer|The ___ discovered a new comet.
buoyancy|Salt water increases ___.
capillary|A ___ is a tiny blood vessel.
carbohydrate|Bread is a ___.
circulatory|The heart is part of the ___ system.
compound|Water is a ___ of hydrogen and oxygen.
condensation|___ formed on the cold glass.
conservation|Wildlife ___ protects animals.
crust|Earth's ___ is the outer layer.
cytoplasm|The ___ fills the cell.
digestive|The stomach is part of the ___ system.
electron|An ___ has a negative charge.
embryo|The chick ___ grew inside the egg.
endangered|The panda is an ___ species.
enzyme|An ___ helps break down food.
fertilizer|The farmer spread ___ on the field.
heredity|Eye color is passed on through ___.
inertia|___ keeps a moving object moving.
invertebrate|A jellyfish is an ___.
kinetic|A moving car has ___ energy.
magma|___ is melted rock under the ground.
mantle|The ___ lies beneath Earth's crust.
membrane|The cell ___ controls what goes in and out.
meteorite|A ___ landed in the field.
mitosis|Cells divide through ___.
momentum|The team gained ___ in the second half.
neutron|A ___ has no charge.
nocturnal|Owls are ___ animals.
osmosis|Water enters the cell by ___.
parasite|A tick is a ___.
pigment|Chlorophyll is a green ___.
plankton|Whales eat tiny ___.
potential|You have great ___.
proton|A ___ has a positive charge.
recessive|Blue eyes are a ___ trait.
respiratory|The lungs are part of the ___ system.
sediment|___ settled at the bottom of the river.
solvent|Water is a common ___.
spectrum|A rainbow shows the color ___.
tectonic|___ plates move very slowly.
vertebrate|A fish is a ___.
wavelength|Red light has a longer ___ than blue light.
census|The ___ counts the population every ten years.
colonial|We visited a ___ village.
commerce|The river was important for ___.
dynasty|The ___ ruled China for centuries.
embargo|The country placed an ___ on trade.
feudalism|Under ___, peasants worked the lord's land.
immigration|___ brought many cultures to the city.
imperialism|___ led to colonies around the world.
legislative|Congress is the ___ branch.
monarchy|A ___ is ruled by a king or queen.
nationalism|___ grew stronger during the war.
nomad|A ___ moves from place to place.
propaganda|The posters were wartime ___.
province|Ontario is a ___ of Canada.
rebellion|The colonists started a ___.
suffrage|Women fought for ___, the right to vote.
urban|The city is an ___ area.
rural|The farm is in a ___ area.
`);
  add("8", `
alliteration|"Silly snakes slither slowly" is an example of ___.
allegory|The story of the tortoise and the hare is an ___ about patience.
anecdote|Grandpa shared a funny ___ about his first car.
antagonist|The ___ tried to stop the hero at every turn.
protagonist|The ___ of the novel is a brave girl named Juniper.
characterization|The author's ___ made the villain feel real.
colloquial|"Gonna" is a ___ way to say "going to."
connotation|The word "cozy" has a warm ___.
denotation|The ___ of a word is its dictionary meaning.
dialect|The characters spoke in a Southern ___.
euphemism|Saying "between jobs" instead of "unemployed" is a ___.
foreshadowing|The dark clouds were ___ of trouble to come.
hyperbole|"I've told you a million times" is ___.
imagery|The poem's ___ helped me picture the sunset.
irony|It was pure ___ that the lifeguard could not swim.
juxtaposition|The ___ of the tiny mouse and the huge elephant was funny.
metaphor|"Time is a thief" is a ___.
simile|"As brave as a lion" is a ___.
personification|"The wind whispered" is an example of ___.
oxymoron|"Jumbo shrimp" is an ___.
paradox|"Less is more" is a ___.
parody|The skit was a ___ of a famous fairy tale.
rhetorical|"Who doesn't love pizza?" is a ___ question.
satire|The cartoon used ___ to poke fun at the rules.
soliloquy|The actor spoke his ___ alone on the stage.
synonym|"Happy" is a ___ for "glad."
antonym|"Hot" is an ___ of "cold."
homonym|"Bat" is a ___ with two meanings.
pseudonym|The author wrote under a ___.
acronym|NASA is an ___.
epilogue|The ___ told what happened years later.
prologue|The ___ set up the story before chapter one.
nuance|She noticed every ___ in the music.
ambiguous|The ending was ___; readers could not agree on what happened.
adolescence|___ is the time between childhood and adulthood.
adversary|The chess champion faced a tough ___.
aesthetic|The room has a calm, simple ___.
allocate|The school will ___ funds for new books.
analysis|Our ___ of the data showed a clear trend.
anomaly|The warm day in January was an ___.
antithesis|Laziness is the ___ of discipline.
apprehensive|I felt ___ before my first tournament.
arbitrary|The rule seemed ___ and unfair.
articulate|She is an ___ speaker.
autonomous|The ___ robot moved around on its own.
belligerent|The ___ customer shouted at the cashier.
benign|The doctor said the bump was ___.
bibliography|List your sources in the ___.
catalyst|The new coach was a ___ for the team's success.
circumvent|They found a way to ___ the traffic jam.
coherent|Write a ___ essay with clear ideas.
coincide|Our vacations ___ this year.
concise|Keep your answer short and ___.
condescending|His ___ tone annoyed everyone.
consensus|The group reached a ___.
credibility|Lying hurts your ___.
criteria|The judges used three ___ to score the kata.
deficient|A diet ___ in vitamins can cause illness.
deteriorate|The old bridge began to ___.
diligent|A ___ student does homework every night.
discrepancy|There was a ___ between the two reports.
disseminate|The internet helps ___ information quickly.
eccentric|The ___ inventor wore mismatched socks.
elaborate|She planned an ___ birthday party.
emphasis|Put ___ on the first syllable.
empirical|Science relies on ___ evidence.
enigma|The ancient stone circle is an ___.
ephemeral|A rainbow is ___ and fades quickly.
equilibrium|The chemical reaction reached ___.
erroneous|The report contained ___ information.
exacerbate|Scratching will ___ the rash.
exemplary|Her behavior was ___.
extraneous|Cross out ___ details.
facilitate|The teacher will ___ the discussion.
feasible|Is the plan ___?
formidable|The champion was a ___ opponent.
gregarious|My ___ cousin makes friends easily.
hypothetical|Let's consider a ___ situation.
immaculate|Her room was ___.
impeccable|His manners are ___.
implicit|There was an ___ agreement to stay quiet.
incessant|The ___ barking kept me awake.
indispensable|Water is ___ to life.
inevitable|Change is ___.
infinite|The universe seems ___.
integrity|A person of ___ tells the truth.
intricate|The quilt has an ___ pattern.
inundate|Fans will ___ the stadium.
lucrative|The lemonade stand was surprisingly ___.
magnanimous|The ___ winner shook hands with everyone.
meticulous|She is ___ about her notes.
mitigate|Planting trees can ___ flooding.
nonchalant|He acted ___ about winning.
notorious|The pirate was ___ for stealing gold.
obsolete|Typewriters are mostly ___.
ominous|___ clouds gathered overhead.
omniscient|The story has an ___ narrator who knows everything.
paradigm|The discovery caused a ___ shift in science.
peripheral|My ___ vision caught movement to my left.
perpendicular|The two lines are ___ and form a right angle.
pertinent|Include only ___ facts.
phenomenal|Her performance was ___.
plagiarism|Copying someone's work is ___.
pragmatic|We need a ___ solution.
precarious|The vase sat in a ___ spot.
predominant|Blue is the ___ color in the painting.
prerequisite|Algebra is a ___ for geometry.
prestigious|She won a ___ award.
prevalent|Colds are ___ in winter.
procrastinate|Don't ___; start your project today.
prolific|The ___ author wrote fifty books.
quintessential|Apple pie is the ___ fall dessert.
rationale|Explain your ___ for the decision.
reciprocal|The ___ of two is one half.
reconcile|The friends were able to ___ after their argument.
redundant|"Free gift" is ___.
rejuvenate|A vacation can ___ you.
relinquish|The king refused to ___ his throne.
resilient|Kids are ___ and bounce back quickly.
retrospect|In ___, I should have studied more.
scrutinize|The judges will ___ every move.
skeptical|I was ___ of the claim.
substantial|She made a ___ improvement.
superfluous|Remove ___ words from your essay.
susceptible|Young plants are ___ to frost.
sustainable|Solar power is a ___ energy source.
tangible|We need ___ evidence.
tentative|We made ___ plans for Saturday.
ubiquitous|Smartphones are ___ these days.
unprecedented|The flood was ___ in the town's history.
vehement|She was ___ in her objection.
verbatim|He repeated the speech ___.
viable|Is this a ___ option?
volatile|The weather in spring can be ___.
vulnerable|Baby birds are ___ to predators.
zealous|The ___ fans painted their faces.
cliche|"Busy as a bee" is a ___.
chauffeur|The ___ drove the limousine.
chandelier|A crystal ___ hung in the ballroom.
cuisine|We tried Ethiopian ___.
debut|The singer made her ___ at age sixteen.
ensemble|The jazz ___ played at the festival.
finesse|She handled the tricky situation with ___.
genre|Mystery is my favorite ___.
limousine|The wedding party rode in a ___.
mayonnaise|Spread ___ on the bread.
naive|It was ___ to think the test would be easy.
reconnaissance|The scouts went on a ___ mission.
renaissance|The city is enjoying a cultural ___.
repertoire|The pianist has a large ___ of songs.
reservoir|The town gets water from the ___.
potpourri|The ___ made the room smell like roses.
rapport|The coach has a great ___ with her students.
entourage|The movie star arrived with her ___.
camaraderie|The ___ among teammates was strong.
dossier|The detective opened the ___ on the case.
encore|The crowd shouted for an ___.
malaise|A general ___ spread through the tired team.
memoir|She wrote a ___ about her childhood.
motif|The rose is a recurring ___ in the novel.
regime|The athlete follows a strict training ___.
tableau|The students posed in a frozen ___.
vignette|Each chapter is a short ___.
changeable|The weather is ___ in spring.
cinnamon|Sprinkle ___ on your toast.
colonel|The ___ commanded the regiment.
desiccate|The desert sun will ___ the fruit.
dichotomy|The story explores the ___ of good and evil.
ecstasy|The fans were in ___ after the win.
embarrassment|Her face turned red with ___.
fuchsia|She wore a bright ___ dress.
hemorrhage|The doctors stopped the ___.
inadvertent|It was an ___ mistake.
indict|The grand jury voted to ___ the suspect.
kaleidoscope|Colors shifted inside the ___.
publicly|The mayor ___ thanked the volunteers.
quandary|I'm in a ___ about which school to choose.
sergeant|The ___ led the drill.
sheriff|The ___ patrolled the county.
tyranny|The people rose up against ___.
wholly|I ___ agree with you.
ascertain|We need to ___ the facts.
asphalt|The road was paved with ___.
auxiliary|The hospital has an ___ generator.
broccoli|___ looks like tiny trees.
curriculum|The school added coding to the ___.
discernible|There was no ___ difference.
dumbbell|She lifted a ten-pound ___.
eerie|The abandoned house was ___.
extravagant|The party was ___.
flamboyant|The ___ performer wore sequins.
hypocrite|A ___ says one thing and does another.
iridescent|The bubble had an ___ shine.
kindergarten|My little brother is in ___.
labyrinth|The hedge maze was a ___.
liquefy|Heat will ___ the wax.
millionaire|The ___ donated to charity.
minuscule|The ant was ___.
nauseous|The boat ride made me ___.
occasionally|I ___ eat dessert.
ophthalmologist|An ___ is an eye doctor.
parliament|The ___ passed a new law.
perennial|Tulips are ___ flowers that return each spring.
pharmaceutical|The ___ company developed a new vaccine.
precocious|The ___ child read at age three.
sacrifice|Parents often ___ for their kids.
saxophone|He plays the ___ in the jazz band.
succinct|Give a ___ summary.
symmetrical|A butterfly's wings are ___.
synonymous|For many, the dojo is ___ with discipline.
tariff|The ___ raised the price of imports.
thoroughly|Mix the batter ___.
tranquility|We enjoyed the ___ of the lake.
unwieldy|The huge box was ___.
xylophone|Tap the ___ with mallets.
zucchini|Grandma grows ___ in her garden.
archipelago|An ___ is a chain of islands.
biodiversity|Rain forests have great ___.
chromosome|Each ___ carries genes.
constitution|The ___ is the highest law of the land.
ecosystem|A pond is a small ___.
legislature|The state ___ passed the bill.
isthmus|An ___ connects two larger landmasses.
meteorologist|The ___ predicted snow.
mitochondria|The ___ are the powerhouses of the cell.
peninsula|Florida is a ___.
renewable|Wind is a ___ resource.
tributary|A ___ flows into a larger river.
amendment|The ___ gave women the right to vote.
abolition|The ___ of slavery was a turning point in history.
emancipation|The ___ freed enslaved people.
legislation|New ___ protects endangered species.
municipal|The ___ pool opens in June.
ratify|The states voted to ___ the amendment.
`);
  add("8", `
abstract|The museum displays ___ art made of shapes and colors.
acclimate|It takes a few days to ___ to the high altitude.
accolade|Winning the science fair was a well-earned ___.
acquisition|The museum's newest ___ is a rare painting.
adamant|She was ___ that she had locked the door.
adept|He is ___ at solving puzzles quickly.
affluent|The ___ neighborhood has large houses.
alleviate|Ice can ___ the pain of a sprain.
altruistic|Volunteering at the shelter is an ___ act.
amiable|Our ___ neighbor always waves hello.
anachronism|A cell phone in a medieval movie is an ___.
antiquated|The ___ computer took forever to start.
apathetic|The ___ crowd barely clapped.
appease|The babysitter tried to ___ the fussy toddler with a snack.
arduous|Climbing the mountain was an ___ journey.
assertive|Be ___ and say no to peer pressure.
astute|The ___ detective noticed the tiny clue.
audacious|The ___ plan surprised everyone.
austere|The monk lived in an ___ room with a single bed.
authentic|This is an ___ dinosaur bone, not a copy.
aversion|My cat has an ___ to baths.
blatant|Copying the answers was a ___ rule violation.
boisterous|The ___ crowd cheered loudly.
bolster|Good grades will ___ your application.
brazen|The ___ squirrel stole food right off my plate.
brusque|His ___ reply sounded rude.
cajole|She tried to ___ her brother into doing her chores.
callous|Laughing at someone's injury is ___.
candid|Thank you for your ___ feedback.
capricious|The ___ weather changed every hour.
censure|The council voted to ___ the member for breaking the rules.
clandestine|The spies held a ___ meeting.
coerce|You should never ___ someone into agreeing.
cognizant|Be ___ of the time limit.
complacent|Don't become ___ after one win.
condone|The school does not ___ cheating.
conducive|A quiet room is ___ to studying.
confiscate|The teacher will ___ phones used during class.
conjecture|Without evidence, it's just ___.
consolidate|Let's ___ our notes into one document.
conspicuous|The bright orange vest made him ___.
contemplate|I sat by the lake to ___ my choices.
contentious|The new rule was a ___ issue.
contrite|The ___ student apologized sincerely.
conventional|They chose a ___ design for the house.
copious|She took ___ notes during the lecture.
corroborate|The video will ___ her story.
cumbersome|The ___ costume made it hard to walk.
cursory|A ___ glance won't catch every mistake.
debilitate|The illness can ___ a person for weeks.
deference|He spoke to the elders with ___.
deplete|Don't ___ the water supply.
deride|It is unkind to ___ someone's ideas.
despondent|He was ___ after losing the match, but he bounced back.
destitute|The charity helps ___ families.
deter|Lights can ___ raccoons from the yard.
devious|The ___ fox tricked the crow.
didactic|The ___ story was meant to teach a lesson.
diminish|The pain will ___ over time.
discern|It's hard to ___ the difference between the twins.
disdain|The cat looked at the bath with ___.
disparage|Don't ___ others' efforts.
disparity|There is a ___ between the two test scores.
dissipate|The fog will ___ by noon.
docile|The ___ horse let the kids ride it.
dogmatic|A ___ person refuses to consider other views.
dubious|I was ___ about the shortcut.
duplicity|The spy's ___ was finally exposed.
elated|She was ___ when she earned her black belt.
elusive|The ___ snow leopard is rarely seen.
emulate|Younger students ___ the black belts.
endorse|The coach will ___ the new training plan.
enhance|Spices ___ the flavor of food.
enumerate|___ the reasons in a numbered list.
epitome|She is the ___ of kindness.
eradicate|Vaccines helped ___ smallpox.
erratic|The ___ driver swerved across lanes.
esoteric|The professor's lecture was full of ___ terms.
euphoria|The team felt pure ___ after the win.
exasperate|Constant interruptions ___ the speaker.
exemplify|Black belts ___ discipline.
exonerate|New evidence helped ___ the innocent man.
expedite|Paying extra will ___ shipping.
exploit|The villain tried to ___ the weakness in the wall.
fabricate|Never ___ data in a science experiment.
fallacy|It's a ___ that we use only ten percent of our brains.
fastidious|She is ___ about keeping her room neat.
fervent|He is a ___ supporter of the team.
flagrant|The referee called a ___ foul.
fortitude|It took great ___ to finish the race.
frivolous|Don't spend money on ___ things.
frugal|My ___ uncle saves every penny.
futile|Arguing with the referee is ___.
garrulous|The ___ passenger talked the whole flight.
gratuitous|The movie had ___ explosions that added nothing.
haphazard|The books were stacked in a ___ pile.
idealistic|The ___ student wanted to change the world.
immutable|The laws of physics are ___.
impede|Fallen trees ___ traffic.
impetuous|His ___ decision surprised us all.
inane|The ___ joke made no sense.
incisive|Her ___ question cut to the heart of the issue.
incongruous|A tuxedo at the beach looks ___.
indignant|She was ___ when accused unfairly.
indolent|The ___ cat slept all afternoon.
ineffable|The beauty of the sunset was ___.
inept|The ___ thief got caught right away.
inherent|There is ___ risk in rock climbing.
innocuous|The question seemed ___.
insatiable|She has an ___ curiosity.
insinuate|Are you trying to ___ that I cheated?
instigate|Don't ___ an argument.
intrepid|The ___ explorer crossed the desert.
intuitive|The app is ___ and easy to use.
irate|The ___ customer demanded a refund.
jeopardize|Skipping practice will ___ your spot on the team.
judicious|Make ___ use of your time.
laborious|Copying the book by hand was ___.
lament|The poem is a ___ for a lost friend.
languid|We spent a ___ afternoon by the pool.
lethargic|The heat made everyone ___.
lucid|Her explanation was clear and ___.
malleable|Gold is a ___ metal.
mediate|The counselor will ___ the disagreement.
melancholy|The rainy day made her feel ___.
mundane|Doing laundry is a ___ task.
negligible|The cost difference is ___.
nostalgia|Old photos fill me with ___.
nurture|Parents ___ their children.
oblivious|He was ___ to the noise around him.
obstinate|The ___ mule refused to move.
omnipotent|In the myth, the god was ___.
opulent|The palace was ___.
ostracize|Never ___ someone for being different.
partisan|The debate became very ___.
perfunctory|He gave a ___ wave and kept walking.
perpetual|The fountain seemed to be in ___ motion.
pervasive|The smell of smoke was ___.
philanthropist|The ___ donated millions to schools.
placate|The manager tried to ___ the upset customer.
poignant|The movie's ending was ___.
pompous|The ___ knight bragged constantly.
precedent|The ruling set a ___ for future cases.
pretentious|The ___ critic used big words to sound smart.
profound|The book had a ___ effect on me.
prudent|It is ___ to save money.
quell|The police worked to ___ the riot.
raucous|The ___ party kept the neighbors awake.
recluse|The ___ rarely left his cabin.
rectify|Let's ___ the mistake.
refute|Use evidence to ___ the claim.
reiterate|Let me ___ the main point.
remorse|He felt ___ for his harsh words.
renounce|The prince chose to ___ the throne.
resolute|She was ___ in her decision.
reticent|The ___ student rarely spoke up.
rudimentary|I have only a ___ knowledge of French.
sagacious|The ___ old owl gave good advice.
sanction|The league may ___ the team for breaking the rules.
scrupulous|The ___ accountant checked every number.
serene|The lake was ___ at dawn.
solace|She found ___ in music.
sporadic|We heard ___ thunder all night.
squander|Don't ___ your allowance.
stagnant|Mosquitoes breed in ___ water.
steadfast|He was a ___ friend.
stoic|She remained ___ despite the pain.
subordinate|The manager gave the task to a ___.
substantiate|Can you ___ your claim with facts?
succumb|Don't ___ to peer pressure.
surreptitious|He took a ___ glance at the clock.
tactful|Be ___ when giving feedback.
tedious|Sorting the coins was ___.
temperate|The region has a ___ climate.
tenuous|The bridge had a ___ hold on the cliff.
trepidation|She approached the stage with ___.
trivial|Don't worry about ___ details.
turmoil|The storm left the town in ___.
unscrupulous|The ___ salesman lied to customers.
usurp|The villain tried to ___ the throne.
vacillate|I ___ between pizza and tacos every Friday.
venerate|Many cultures ___ their elders.
veracity|The reporter checked the ___ of the story.
vigilant|Stay ___ when crossing the street.
vindicate|The test results will ___ her theory.
virtuoso|The violin ___ amazed the audience.
wary|Be ___ of strangers online.
wistful|She gave a ___ smile as she looked at old photos.
zenith|The sun reached its ___ at noon.
coefficient|In 3x, the ___ is 3.
exponent|In two cubed, three is the ___.
hypotenuse|The ___ is the longest side of a right triangle.
integer|Negative five is an ___.
isosceles|An ___ triangle has two equal sides.
linear|The graph shows a ___ relationship.
parabola|The ball's path made a ___.
polynomial|We factored the ___ in algebra.
quadratic|We solved a ___ equation.
scalene|A ___ triangle has no equal sides.
theorem|The Pythagorean ___ is about right triangles.
vertex|The ___ is the corner of an angle.
algorithm|The computer follows an ___.
binary|Computers use ___ code made of ones and zeros.
isotope|Carbon-14 is an ___ of carbon.
molecular|We studied the ___ structure of water.
periodic|Look up gold on the ___ table.
photon|A ___ is a particle of light.
radioactive|Uranium is ___.
electromagnet|An ___ works only when electricity flows.
combustion|Fire is a form of ___.
oxidation|Rust is caused by ___.
homeostasis|Sweating helps your body maintain ___.
taxonomy|___ is the science of classifying living things.
genotype|An organism's ___ is its genetic makeup.
phenotype|Eye color is part of a person's ___.
mutation|A ___ is a change in DNA.
sedimentary|Sandstone is a ___ rock.
igneous|Granite is an ___ rock.
metamorphic|Marble is a ___ rock.
seismic|The ___ waves were recorded far away.
topography|The map shows the ___ of the region.
abolitionist|The ___ spoke out against slavery.
ambassador|The ___ represented her country abroad.
anarchy|Without rules, the game turned into ___.
aristocracy|The ___ owned most of the land.
autocracy|In an ___, one person holds all power.
bicameral|Congress is a ___ legislature with two houses.
bipartisan|The bill had ___ support.
boycott|The students chose to ___ the cafeteria.
civic|Voting is a ___ duty.
coalition|A ___ of groups worked together.
confederacy|The states formed a ___.
delegation|A ___ from Japan visited our school.
diplomacy|___ helped end the conflict.
electoral|The ___ votes were counted.
executive|The president leads the ___ branch.
filibuster|The senator gave a long ___.
impeachment|The House voted on ___.
inauguration|The ___ of the new mayor was held downtown.
judiciary|The ___ interprets the law.
liberal|She took a ___ amount of whipped cream.
lobbyist|The ___ met with lawmakers.
mandate|The new law is a state ___.
ordinance|A city ___ bans parking here overnight.
preamble|The ___ begins with "We the People."
precinct|Voters went to their ___.
referendum|Citizens voted in a ___.
secession|The ___ of southern states led to war.
segregation|The law ended ___ in schools.
sovereignty|Each nation has its own ___.
statute|The ___ sets the speed limit.
totalitarian|A ___ government controls every part of life.
veto|The governor may ___ the bill.
`);
})();

/* Pre-K and K reach 500+ words by adding the simplest words from the grade
   above (4 letters or fewer), so the youngest have plenty of variety too. */
(function () {
  function fill(g, from, target) {
    const have = new Set(BD.SPELLING[g].map(function (x) { return x[0]; }));
    from.forEach(function (src) {
      (BD.SPELLING[src] || []).forEach(function (x) { if (BD.SPELLING[g].length < target && x[0].length <= 4 && !have.has(x[0])) { have.add(x[0]); BD.SPELLING[g].push(x); } });
    });
  }
  // (No longer padded from the grade above: Pre-K and K keep only words chosen for their level.)
})();

/* LEVEL CHECK for the youngest grades: words that are rare, above level or
   could confuse a young child are taken out (reviewed by hand). Pre-K keeps
   short picture words and first sight words; K keeps CVC words, sight words,
   digraphs and simple blends. Also out everywhere: words with a second,
   grown-up meaning. */
(function () {
  const OUT = {
    "-1": "gap lab sap dab vat wed peg rim jig bog tot sum hub tax jazz deck dock peck rack cash rich thud lung rod cot yak lit rib pug sub cob pod",
    "0": "jot rot cod mob pun lug clog crop skid slam slim slot snip snug spun stub trim trot dent disk gasp gust lend mend raft rust silk tusk honk dunk bunk plank chunk ranch shift shrub thump sixth tenth whisk pill chill gull stiff crack padlock gumdrop pigpen cobweb hilltop wigs plop flop grip",
    "1": "thigh clerk verb perch weed strip",
    "2": "female hinge fringe plunge pledge budge notch hutch"
  };
  Object.keys(OUT).forEach(function (g) {
    const out = new Set(OUT[g].split(" "));
    BD.SPELLING[g] = (BD.SPELLING[g] || []).filter(function (x) { return !out.has(x[0]); });
  });
  const FIX = { "-1": { lip: "I smile with my top ___." } };
  Object.keys(FIX).forEach(function (g) { (BD.SPELLING[g] || []).forEach(function (x) { if (FIX[g][x[0]]) x[1] = FIX[g][x[0]]; }); });
})();
