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

/* THE BIG WORD BANK — about 100 words for Pre-K, 150 for K and 250 to 300
   for 1st to 8th grade, following each grade's spelling patterns (short
   vowels and digraphs early, then silent e, vowel teams, r-controlled vowels,
   diphthongs, suffixes and prefixes, homophones, and Greek and Latin roots).
   One word per line:   word|a sentence with ___ where the word goes
   The ___ must appear exactly once. A word already in that grade is skipped. */
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
do|What do you want to ___ today?
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
})();
