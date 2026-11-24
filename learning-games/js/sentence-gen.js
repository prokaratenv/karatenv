/* ENDLESS SENTENCES
   1. A built-in generator: correct sentences from templates (thousands of
      combinations for every grade, Pre-K to 8th), then mistakes are planted on
      purpose, chosen to target the kinds of mistakes your child misses most.
      Works offline, forever.
   2. No repeats: every sentence a student has seen is remembered as a short
      fingerprint (p.sentSeen, the last 600) plus a session memory, so rounds
      keep bringing new ones.
   3. Adaptive: each planted mistake has a skill (commas in a list, end marks,
      past tense...). Results feed BD.SentenceGen.note(); weak skills come up
      more often and a round "trains" the weakest one, even with no saved data.
   4. When the game is opened through the shared Claude link, Claude also
      writes fresh sentences aimed at your child's weak spots. They're added
      to your account's sentence bank, which keeps growing. */
window.BD = window.BD || {};

BD.SentenceGen = (function () {
  const pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  const P = pick;
  const r = function (lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); };
  function pick2(a) { const x = pick(a); let y = pick(a); while (y === x) y = pick(a); return [x, y]; }
  function pickN(a, n) { const c = a.slice(), out = []; while (out.length < n && c.length) out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]); return out; }
  function an(phrase) { return (/^(uni|use|one)/i.test(phrase) ? "a " : /^[aeiou]/i.test(phrase) ? "an " : "a ") + phrase; }
  const capz = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  /* ---------- word lists ---------- */
  const GIRLS = ["Maya", "Ava", "Sofia", "Grace", "Ruby", "Zoe", "Nora", "Lily", "Hazel", "Ivy", "Aria", "Emma", "Chloe", "Mia", "Layla", "Elena", "Priya", "Amara", "Jade", "Rosa", "Lucy", "Stella", "Naomi", "Keiko", "Leah", "Nina"];
  const BOYS = ["Leo", "Eli", "Noah", "Mateo", "Owen", "Caleb", "Isaac", "Jonah", "Miles", "Theo", "Kai", "Sam", "Ben", "Omar", "Diego", "Ravi", "Jamal", "Hugo", "Felix", "Arlo", "Ezra", "Max", "Luca", "Kenji", "Finn", "Jack"];
  const NAMES = GIRLS.concat(BOYS);
  /* a child with matching pronouns */
  function kid(not) {
    let k;
    do { k = Math.random() < 0.5 ? { n: P(GIRLS), s: "she", o: "her", p: "her" } : { n: P(BOYS), s: "he", o: "him", p: "his" }; } while (not && k.n === not);
    return k;
  }
  const W = {
    name: NAMES,
    last: ["Lee", "Garcia", "Patel", "Brown", "Kim", "Lopez", "Nguyen", "Carter", "Rivera", "Chen", "Davis", "Ortiz", "Walker", "Singh", "Moore", "Reed", "Hayes", "Morris", "Tanaka"],
    place: [["Denver", "Colorado"], ["Austin", "Texas"], ["Reno", "Nevada"], ["Boston", "Massachusetts"], ["Miami", "Florida"], ["Portland", "Oregon"], ["Phoenix", "Arizona"], ["Nashville", "Tennessee"], ["Chicago", "Illinois"], ["Seattle", "Washington"], ["Atlanta", "Georgia"], ["Omaha", "Nebraska"], ["Las Vegas", "Nevada"], ["San Diego", "California"], ["Tampa", "Florida"], ["Dallas", "Texas"], ["Boise", "Idaho"], ["Tucson", "Arizona"], ["Columbus", "Ohio"], ["Madison", "Wisconsin"], ["Raleigh", "North Carolina"], ["Richmond", "Virginia"], ["Salem", "Oregon"], ["Albany", "New York"], ["Orlando", "Florida"], ["Memphis", "Tennessee"], ["Detroit", "Michigan"], ["Honolulu", "Hawaii"], ["Anchorage", "Alaska"], ["Spokane", "Washington"], ["Santa Fe", "New Mexico"], ["Charleston", "South Carolina"], ["Savannah", "Georgia"], ["Pittsburgh", "Pennsylvania"], ["Salt Lake City", "Utah"], ["Des Moines", "Iowa"], ["Burlington", "Vermont"], ["Sacramento", "California"], ["Louisville", "Kentucky"]],
    day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    weekend: ["Saturday", "Sunday"],
    month: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    season: ["summer", "spring", "winter", "fall"],
    spot: ["park", "beach", "lake", "library", "playground", "zoo", "museum", "pool", "garden", "aquarium", "farm", "dojo", "science center", "ice rink"],
    rel: ["sister", "brother", "cousin", "aunt", "uncle", "grandma", "grandpa", "neighbor"],
    adj: ["fluffy", "tiny", "noisy", "friendly", "sleepy", "spotted", "curious", "playful", "gentle", "shy"],
    pet: ["dog", "cat", "bunny", "hamster", "parrot", "turtle", "puppy", "kitten", "goldfish", "lizard"],
    petName: ["Biscuit", "Pepper", "Rocket", "Daisy", "Ziggy", "Mochi", "Scout", "Peanut", "Luna", "Bear", "Pickles", "Waffles", "Coco", "Noodle", "Sunny"],
    meal: ["lunch", "dinner", "breakfast", "practice", "class", "school"],
    thing: ["backpack", "lunchbox", "jacket", "water bottle", "notebook", "pencil", "umbrella", "soccer ball", "library book", "hoodie", "sweater", "karate belt", "jump rope", "art box"],
    item: ["apples", "bread", "milk", "eggs", "carrots", "rice", "cheese", "grapes", "bananas", "oranges", "crackers", "tomatoes", "beans", "peaches", "yogurt", "pasta", "onions", "lemons"],
    store: ["market", "store", "farm stand", "bakery", "grocery store"],
    bigAct: ["visited the museum", "moved to a new house", "adopted a puppy", "went camping", "watched fireworks", "earned our new belts", "planted a garden", "built a treehouse", "had a family picnic", "visited the aquarium", "ran in a fun run"],
    furniture: ["couch", "table", "bed", "porch", "stairs", "desk", "bench"],
    plural: ["toys", "books", "shoes", "socks", "crayons", "blocks", "papers", "puzzles", "markers", "pillows"],
    surface: ["floor", "table", "stairs", "couch", "desk", "shelf"],
    topic: ["volcanoes", "fractions", "the planets", "plants", "the ocean", "electricity", "magnets", "weather", "the solar system", "insects", "rain forests", "the water cycle", "the human body", "dinosaurs", "rocks and minerals"],
    perf: ["game", "concert", "tournament", "play", "science fair", "recital", "belt test", "spelling bee", "parade", "assembly", "talent show", "chess match"],
    event: ["game", "concert", "movie", "storm", "meeting", "parade", "tournament", "assembly", "play", "science fair", "recital", "belt test", "field trip", "spelling bee"],
    snack: ["snack", "cookie", "glass of water", "turn", "pencil", "hint", "napkin", "sticker", "bigger bowl"],
    gear: ["umbrella", "raincoat", "boots", "jacket", "hat", "rain boots"],
    contest: ["game", "spelling bee", "race", "tournament", "science fair", "chess match", "relay race"],
    group: ["girls", "boys", "players", "students", "twins", "campers", "kids", "dancers"],
    landmark: ["the Grand Canyon", "the Hoover Dam", "the Statue of Liberty", "the Golden Gate Bridge", "Lake Tahoe", "the Rocky Mountains", "Mount Rainier", "Niagara Falls", "Yellowstone National Park", "the Mississippi River", "the Everglades", "the Great Lakes"],
    subject: ["math", "science", "spelling", "history", "reading", "art", "music", "geography"],
    hobby: [["hiking", "swimming", "riding bikes"], ["drawing", "singing", "building forts"], ["reading", "cooking", "playing chess"], ["kicking", "blocking", "stretching"], ["painting", "dancing", "gardening"], ["skating", "fishing", "camping"], ["baking", "knitting", "writing stories"]],
    belt: ["white", "yellow", "orange", "green", "blue", "purple", "red", "brown", "black"],
    move: ["front kick", "side kick", "roundhouse kick", "high block", "low block", "kata", "bow", "fighting stance"],
    club: ["chess club", "art club", "science club", "book club", "running club", "garden club", "karate team", "school band"],
    supply: ["pencils", "crayons", "glue sticks", "markers", "scissors", "notebooks", "erasers", "folders", "rulers"],
    picnic: ["sandwiches", "cups", "napkins", "plates", "grapes", "cookies", "apples", "juice boxes", "pretzels", "carrot sticks"],
    gift: ["birthday card", "drawing", "book", "bracelet", "kind note", "cookies", "flowers", "puzzle"],
    chore: [function (k) { return "clean " + k.p + " room"; }, function (k) { return "feed " + k.p + " dog"; }, function (k) { return "finish " + k.p + " homework"; }, function () { return "set the table"; }, function () { return "walk the dog"; }, function () { return "water the plants"; }, function () { return "fold the laundry"; }, function (k) { return "practice " + k.p + " spelling words"; }, function () { return "help with the dishes"; }],
    indoor: ["play board games", "read in the library", "build a blanket fort", "bake cookies", "practice our kata", "watch a movie", "paint pictures", "do a puzzle", "play chess"],
    comper: ["taller", "faster", "older", "younger", "stronger", "quicker", "louder", "calmer"],
    street: ["Maple Street", "Oak Avenue", "Pine Lane", "Cedar Road", "Elm Street", "Willow Drive", "Birch Court", "Hill Street", "Bay Street"],
    tAdj: ["Brave", "Sleepy", "Lost", "Hungry", "Giant", "Secret", "Curious", "Hidden", "Magic", "Silver", "Tiny", "Fearless"],
    tNoun: ["Turtle", "Dragon", "Robot", "Kitten", "Garden", "Island", "Rocket", "Fox", "Lighthouse", "Treehouse", "Owl", "Ninja"],
    holiday: ["Thanksgiving", "Halloween", "New Year's Day", "Earth Day", "Labor Day", "the Fourth of July"],
    motto: [["respect", "focus", "and practice"], ["courage", "kindness", "and patience"], ["listen", "learn", "and lead"], ["try", "fail", "and try again"]],
    rule: ["always bow to your partner", "treat everyone with respect", "try your best every day", "help the newer students", "keep your eyes on your teacher"]
  };
  /* simple words for Pre-K and K */
  const Y = {
    animal: ["cat", "dog", "pig", "cow", "hen", "fox", "duck", "frog", "goat", "bee", "owl", "bug", "bear", "bunny", "puppy", "kitten", "lamb", "horse", "seal", "ant"],
    animals: ["cats", "dogs", "pigs", "cows", "hens", "foxes", "ducks", "frogs", "goats", "bees", "owls", "bugs", "bears", "bunnies", "puppies", "kittens", "lambs", "horses", "seals", "mice"],
    aAdj: ["big", "small", "little", "happy", "sleepy", "fast", "soft", "cute", "funny", "wet", "hungry", "silly", "slow", "brave"],
    thing: ["ball", "hat", "cup", "box", "bag", "kite", "bus", "bed", "sock", "book", "drum", "car", "cap", "mat", "top", "coat", "bike"],
    things: ["balls", "hats", "cups", "boxes", "bags", "kites", "socks", "books", "drums", "cars", "blocks", "crayons"],
    color: ["red", "blue", "green", "pink", "yellow", "orange", "purple", "black", "white", "brown"],
    verb: ["run", "hop", "jump", "sing", "play", "read", "swim", "clap", "dance", "skip", "kick", "draw", "paint", "spin", "climb", "count"],
    fam: ["mom", "dad", "sister", "brother", "grandma", "grandpa", "aunt", "uncle", "friend", "teacher", "baby", "coach"],
    famAdj: ["nice", "fun", "kind", "funny", "happy", "silly", "tall", "strong", "sweet", "smart", "busy"],
    food: ["apples", "cake", "milk", "pizza", "eggs", "corn", "rice", "grapes", "soup", "jam", "bread", "peas", "carrots", "toast", "pears", "pie", "plums", "beans", "cheese", "berries", "muffins", "pasta", "yogurt", "pancakes"],
    can: [["frog", "hop"], ["fish", "swim"], ["bird", "fly"], ["dog", "run"], ["duck", "swim"], ["bee", "buzz"], ["cat", "nap"], ["cow", "moo"], ["pig", "dig"], ["owl", "hoot"], ["bunny", "hop"], ["horse", "run"], ["duck", "quack"], ["bird", "sing"], ["frog", "jump"], ["seal", "swim"], ["bear", "climb"], ["goat", "jump"], ["dog", "bark"], ["cat", "purr"], ["hen", "peck"], ["fox", "run"], ["ant", "dig"], ["bee", "fly"], ["lion", "roar"], ["monkey", "climb"], ["snake", "hiss"], ["kangaroo", "hop"]],
    weather: ["hot", "cold", "sunny", "windy", "rainy", "snowy", "warm", "cool", "nice"],
    aPlace: ["yard", "grass", "sun", "barn", "pen", "park", "mud", "box"],
    well: ["run fast", "jump high", "swim well", "read well", "kick high", "hop fast", "sing well", "draw well", "skip fast", "climb high", "count to ten", "tie my shoes", "write my name", "bow to my teacher", "spell my name"],
    num: ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
    goPlace: ["zoo", "park", "farm", "pond", "beach", "lake", "pool", "store", "library", "dojo"]
  };
  const PETS = [
    { n: "dog", acts: ["run", "dig", "play", "nap", "bark"], locs: ["yard", "park", "grass"] },
    { n: "cat", acts: ["nap", "play", "purr", "climb"], locs: ["sun", "house", "window"] },
    { n: "bunny", acts: ["hop", "eat", "nap"], locs: ["grass", "yard", "garden"] },
    { n: "fish", acts: ["swim"], locs: ["tank", "pond"] },
    { n: "bird", acts: ["sing", "fly"], locs: ["tree", "yard", "garden"] },
    { n: "puppy", acts: ["run", "play", "nap"], locs: ["yard", "grass", "park"] },
    { n: "kitten", acts: ["play", "nap", "climb"], locs: ["sun", "house", "yard"] },
    { n: "hamster", acts: ["run", "eat", "nap"], locs: ["cage", "wheel"] },
    { n: "turtle", acts: ["swim", "nap"], locs: ["pond", "sun", "tank"] }
  ];
  /* animals that do things in places */
  const ANIM = [
    ["birds", ["singing", "resting", "hiding"], ["trees", "garden", "field"]],
    ["frogs", ["splashing", "hiding", "resting"], ["pond", "garden"]],
    ["ducks", ["swimming", "splashing", "resting"], ["pond", "lake"]],
    ["puppies", ["playing", "sleeping", "running"], ["yard", "field"]],
    ["kittens", ["playing", "sleeping", "hiding"], ["yard", "barn", "garden"]],
    ["horses", ["running", "resting", "eating"], ["field", "meadow", "barn"]],
    ["rabbits", ["hiding", "resting", "playing"], ["garden", "meadow", "field"]],
    ["squirrels", ["playing", "running", "hiding"], ["trees", "yard", "park"]],
    ["cows", ["resting", "eating"], ["field", "barn", "meadow"]],
    ["goats", ["playing", "eating", "resting"], ["field", "barn"]],
    ["geese", ["swimming", "resting"], ["pond", "lake"]]
  ];
  /* things to do, with places where they make sense: [we-past, base, they-past, places] */
  const ACTS = [
    ["played tag", "play tag", "played tag", ["park", "playground", "beach"]],
    ["built a sandcastle", "build a sandcastle", "built a sandcastle", ["beach", "lake"]],
    ["rode our bikes", "ride our bikes", "rode bikes", ["park", "lake", "beach"]],
    ["fed the ducks", "feed the ducks", "fed the ducks", ["park", "lake", "pond", "farm"]],
    ["flew a kite", "fly a kite", "flew a kite", ["park", "beach"]],
    ["had a picnic", "have a picnic", "had a picnic", ["park", "beach", "lake", "garden"]],
    ["looked for shells", "look for shells", "looked for shells", ["beach"]],
    ["read books", "read books", "read books", ["library", "park"]],
    ["played soccer", "play soccer", "played soccer", ["park", "playground"]],
    ["practiced karate", "practice karate", "practiced karate", ["dojo", "park"]],
    ["practiced our kata", "practice our kata", "practiced kata", ["dojo"]],
    ["planted flowers", "plant flowers", "planted flowers", ["garden", "farm"]],
    ["watched the birds", "watch the birds", "watched the birds", ["park", "lake", "zoo"]],
    ["hiked a trail", "hike a trail", "hiked a trail", ["lake", "park"]],
    ["played catch", "play catch", "played catch", ["park", "beach", "playground"]],
    ["went swimming", "go swimming", "went swimming", ["pool", "lake", "beach"]],
    ["saw the penguins", "see the penguins", "saw the penguins", ["zoo", "aquarium"]],
    ["fed the goats", "feed the goats", "fed the goats", ["farm", "zoo"]],
    ["went ice skating", "go ice skating", "went ice skating", ["ice rink"]],
    ["sang songs", "sing songs", "sang songs", ["park", "beach", "library"]],
    ["found a book about " + "sharks", "find a book about sharks", "found a book about sharks", ["library"]]
  ];
  const act = function () { const a = P(ACTS); return { we: a[0], base: a[1], they: a[2], spot: P(a[3]) }; };
  const WEATHER_PLAN = [["sunny", "go to the beach"], ["snowy", "build a snowman"], ["windy", "fly our kites"], ["rainy", "stay inside and read"], ["hot", "go swimming"], ["cold", "wear our warmest coats"], ["cloudy", "visit the museum"], ["warm", "have a picnic"]];
  const date = function () { return P(W.month) + " " + r(1, 28) + ", " + r(2015, 2026); };
  const place = function () { return P(W.place); };
  const title = function () {
    return pick([
      function () { return "The " + P(W.tAdj) + " " + P(W.tNoun); },
      function () { return "The " + P(W.tAdj) + " Little " + P(W.tNoun); },
      function () { return "The Secret of the " + P(W.tAdj) + " " + P(W.tNoun); }
    ])();
  };

  /* ---------- correct sentences (grade = the lowest grade that uses it) ----------
     Markers the generator strips: ^ before a verb that agrees with a singular
     subject (likes, has to), {x} after a comma around extra information. */
  const T = [];
  const add = function (g, fn) { T.push([g, fn]); };

  // Pre-K: three to six short words (capital letter + end mark)
  add(-1, function () { return "The " + P(Y.animal) + " is " + P(Y.aAdj) + "."; });
  add(-1, function () { return "I see " + an(P(Y.color) + " " + P(Y.thing)) + "."; });
  add(-1, function () { return "I have " + an(P(Y.color) + " " + P(Y.thing)) + "."; });
  add(-1, function () { return "The " + P(Y.thing) + " is " + P(Y.color) + "."; });
  add(-1, function () { return "Is the " + P(Y.thing) + " " + P(Y.color) + "?"; });
  add(-1, function () { return "My " + P(Y.fam) + " is " + P(Y.famAdj) + "."; });
  add(-1, function () { const a = P(Y.can); return capz(an(a[0])) + " can " + a[1] + "."; });
  add(-1, function () { const a = P(Y.can); return "Can " + an(a[0]) + " " + a[1] + "?"; });
  add(-1, function () { return "I like " + P(Y.food) + "."; });
  add(-1, function () { const f = pick2(Y.food); return "I like " + f[0] + " and " + f[1] + "."; });
  add(-1, function () { return "Look at the " + P(Y.aAdj) + " " + P(Y.animal) + "."; });
  add(-1, function () { const v = pick2(Y.verb); return "We like to " + v[0] + " and " + v[1] + "."; });
  add(-1, function () { return "Can you " + P(Y.verb) + " with me?"; });
  add(-1, function () { return "It is " + P(Y.weather) + " today."; });
  add(-1, function () { return "I love my " + P(Y.color) + " " + P(Y.thing) + "."; });
  add(-1, function () { return "Where is the " + P(Y.aAdj) + " " + P(Y.animal) + "?"; });
  add(-1, function () { return P(["Mom", "Dad"]) + " has " + an(P(Y.color) + " " + P(Y.thing)) + "."; });
  add(-1, function () { return "The " + P(Y.animal) + " is in the " + P(Y.aPlace) + "."; });
  add(-1, function () { return "I can " + P(Y.verb) + "!"; });
  add(-1, function () { return "Do you see the " + P(Y.animal) + "?"; });
  // K
  add(0, function () { return "I can " + P(Y.well) + "."; });
  add(0, function () { return "My " + P(Y.fam) + " can " + P(Y.well.slice(0, 10)) + "."; });
  add(0, function () { return "The " + P(Y.thing) + " is " + P(["on the bed", "on the mat", "on the desk", "on the chair", "on the rug", "on the table", "in the box", "in the bag", "in the car", "under the bed", "under the desk", "under the table", "by the door"]) + "."; });
  add(0, function () { return "I see " + P(Y.num) + " " + P(Y.animals) + "."; });
  add(0, function () { const p = P(PETS); return "My " + p.n + " ^likes to " + P(p.acts) + "."; });
  add(0, function () { return "We went to the " + P(Y.goPlace) + " " + P(["today", "with Mom", "with Dad", "with my class", "after lunch"]) + "."; });
  add(0, function () { return "Is it time to " + P(["eat", "play", "read", "sing", "go", "nap", "rest", "paint", "swim", "bow"]) + "?"; });
  add(0, function () { return "I am " + P(["happy", "glad", "ready", "strong", "fast", "kind", "brave", "hungry", "sleepy"]) + " today."; });
  add(0, function () { return "The " + P(Y.aAdj) + " " + P(Y.animal) + " ran to the " + P(["barn", "pond", "tree", "hill", "gate", "pen"]) + "."; });
  add(0, function () { return "Do you like " + P(Y.food) + "?"; });
  add(0, function () { return "I will " + P(Y.verb) + " with my " + P(Y.fam) + "."; });
  add(0, function () { return "We sat on the " + P(["rug at school", "rug for a story", "mat for a story", "grass at the park", "bench to rest", "sand at the beach", "steps to rest", "mat at the dojo", "grass for a picnic"]) + "."; });
  add(0, function () { return P(["Mom", "Dad"]) + " and I made " + P(["soup", "pizza", "a cake", "toast", "pancakes", "muffins", "cookies", "a pie", "lemonade"]) + "."; });
  add(0, function () { return "I can do " + an(P(["front kick", "side kick", "high block", "low block", "push-up", "jumping jack", "big bow"])) + "."; });
  add(0, function () { return "The " + P(Y.thing) + " is so " + P(["big", "small", "soft", "fun", "new", "pretty"]) + "!"; });
  add(0, function () { return "The " + P(Y.animals) + " are " + P(["happy", "sleepy", "wet", "hungry", "little", "loud", "fast"]) + "."; });
  add(0, function () { return "I want " + an(P(Y.color) + " " + P(Y.thing)) + " for my birthday."; });
  add(0, function () { return "Can we " + P(["play", "run", "skip", "hop", "dance", "sing", "swim", "dig"]) + " at the " + P(["park", "beach", "lake"]) + "?"; });
  add(0, function () { return "I tie my " + P(W.belt) + " belt."; });
  // 1st grade
  add(1, function () { return P(NAMES) + " has " + an(P(Y.color) + " " + P(["ball", "kite", "bike", "hat", "cup", "bag", "coat", "book", "drum"])) + "."; });
  add(1, function () { return "I like to " + P(["play", "read", "draw", "run", "sing", "swim", "paint"]) + " with " + P(NAMES) + "."; });
  add(1, function () { return P(NAMES) + " and I like to " + P(Y.verb) + "."; });
  add(1, function () { const p = P(PETS); return "My " + p.n + " ^likes to " + P(p.acts) + " in the " + P(p.locs) + "."; });
  add(1, function () { return P(NAMES) + " ^likes to " + P(["play", "read", "swim", "draw", "paint", "dance", "sing", "run"]) + " on " + P(W.day) + "."; });
  add(1, function () { return P(NAMES) + " ^has a pet " + P(W.pet) + " named " + P(W.petName) + "."; });
  add(1, function () { return "We play at the " + P(["park", "zoo", "pool", "beach", "lake", "playground"]) + " on " + P(W.day) + "."; });
  add(1, function () { return "Where did you put my " + P(W.thing) + "?"; });
  add(1, function () { return P(NAMES) + " can " + P(Y.well.slice(0, 10)) + "."; });
  add(1, function () { const n = pick2(NAMES); return n[0] + " ^wants to " + P(Y.verb) + " with " + n[1] + "."; });
  add(1, function () { return P(NAMES) + " ^reads a book every " + P(["night", "morning", "day"]) + "."; });
  add(1, function () { return "I have " + P(Y.num) + " " + P(Y.things) + " in my " + P(["bag", "box", "room"]) + "."; });
  add(1, function () { return P(NAMES) + " ^wears " + an(P(W.belt)) + " belt to class."; });
  add(1, function () { const k = kid(); return k.n + " ^bows to the class before " + k.s + " ^starts."; });
  add(1, function () { const a = P(ANIM); return "The " + a[0] + " are in the " + P(a[2]) + "."; });
  add(1, function () { return "Will you " + P(Y.verb) + " with me on " + P(W.day) + "?"; });
  add(1, function () { return "My friend " + P(NAMES) + " ^is very " + P(["kind", "funny", "fast", "brave", "smart", "nice"]) + "."; });
  add(1, function () { return "I like to play with my " + P(W.pet) + " after " + P(["school", "lunch", "dinner", "class"]) + "."; });
  // 2nd grade
  add(2, function () { return P(NAMES) + " and I went to the " + P(W.spot) + " on " + P(W.day) + "."; });
  add(2, function () { const a = P(ANIM); return "The " + a[0] + " are " + P(a[1]) + " by the " + P(a[2]) + "."; });
  add(2, function () { return "We ate " + P(["lunch", "dinner", "breakfast"]) + " with our " + P(W.rel) + "."; });
  add(2, function () { return "Can you help me find my " + P(W.thing) + "?"; });
  add(2, function () { return P(NAMES) + "'s " + P(W.pet) + " is " + P(W.adj) + "."; });
  add(2, function () { return "I can't find my " + P(W.thing) + "."; });
  add(2, function () { return P(NAMES) + " doesn't like " + P(Y.food) + "."; });
  add(2, function () { return "We don't have school on " + P(W.weekend) + "."; });
  add(2, function () { return "The children played in the " + P(["park", "yard", "snow", "leaves", "sand", "pool"]) + " " + P(["all day", "after lunch", "on Saturday", "with their friends"]) + "."; });
  add(2, function () { return "Two " + P(["mice", "geese", "puppies", "bunnies", "foxes", "wolves"]) + " ran across the " + P(["yard", "field", "barn", "meadow"]) + "."; });
  add(2, function () { return "My feet are " + P(["cold", "wet", "tired", "muddy"]) + " after the long " + P(["walk", "hike", "run", "game"]) + "."; });
  add(2, function () { return "The " + P(["babies", "puppies", "kittens", "bunnies", "ponies"]) + " are sleeping in " + P(["a basket", "a box", "the barn", "the shade"]) + "."; });
  add(2, function () { return P(["She", "He"]) + " ^is in my " + P(["karate", "art", "reading", "music", "swim"]) + " class."; });
  add(2, function () { return P(["She", "He"]) + " ^sits next to me at " + P(["lunch", "school", "story time", "the assembly"]) + "."; });
  add(2, function () { return P(["They", "We"]) + " play " + P(["tag", "catch", "soccer", "kickball"]) + " every " + P(W.day) + "."; });
  add(2, function () { return P(NAMES) + " ran to the " + P(["park", "playground", "bus", "swings", "car"]) + " after school."; });
  add(2, function () { return P(NAMES) + " found " + an(P(["red", "lost", "old", "shiny", "blue"]) + " " + P(["ball", "glove", "marble", "button", "sock", "shell"])) + " under the " + P(W.furniture) + "."; });
  add(2, function () { return "We ate " + P(Y.food) + " for " + P(["lunch", "dinner", "breakfast", "a snack"]) + "."; });
  add(2, function () { const n = pick2(NAMES); return n[0] + " and " + n[1] + " played " + P(["tag", "catch", "soccer", "hopscotch", "kickball", "hide-and-seek"]) + " at recess."; });
  add(2, function () { return "My " + P(W.rel) + " took us to the " + P(W.spot) + " on " + P(W.day) + "."; });
  add(2, function () { const k = kid(); return k.n + " ^makes " + P(["pancakes", "muffins", "soup", "cookies", "tacos"]) + " with " + k.p + " " + P(W.rel) + " on " + P(W.day) + "."; });
  add(2, function () { const k = kid(); return k.n + " ^practices " + k.p + " " + P(["kicks", "blocks", "kata", "spelling words", "piano"]) + " every day."; });
  add(2, function () { return "We bowed to Sensei " + P(W.last) + " before class."; });
  add(2, function () { return "The " + P(["cats", "dogs", "kids", "birds", "players"]) + " were " + P(["happy", "hungry", "tired", "quiet"]) + " after the " + P(["storm", "walk", "game", "party"]) + "."; });
  add(2, function () { return P(NAMES) + " was " + P(["sad", "happy", "sleepy", "excited", "proud"]) + " on " + P(W.day) + "."; });
  add(2, function () { return "I saw " + P(Y.num) + " " + P(["ducks", "cows", "goats", "foxes", "frogs", "geese", "deer", "sheep"]) + " at the " + P(["farm", "zoo", "pond", "lake"]) + "."; });
  add(2, function () { return "My " + P(W.rel) + " gave me " + an(P(W.adj) + " " + P(["puppy", "kitten", "teddy bear", "goldfish"])) + "."; });
  // 3rd grade
  add(3, function () { const a = act(); return P(NAMES) + " and I " + a.we + " at the " + a.spot + " on " + P(W.day) + "."; });
  add(3, function () { return "My " + P(W.rel) + " has " + an(P(W.adj) + " " + P(W.pet)) + " named " + P(W.petName) + "."; });
  add(3, function () { return "Can we go to the " + P(W.spot) + " after " + P(W.meal) + "?"; });
  add(3, function () { return "We were so happy because it was " + P(NAMES) + "'s birthday."; });
  add(3, function () { const a = P(ANIM); return "The " + a[0] + " are " + P(a[1]) + " in the " + P(a[2]) + "."; });
  add(3, function () { return P(NAMES) + " has a new " + P(W.thing) + " for school."; });
  add(3, function () { return "I can't find my " + P(W.thing) + " anywhere."; });
  add(3, function () { return "Did you see the " + P(W.adj) + " " + P(W.pet) + " at the " + P(["park", "beach", "farm", "lake", "playground"]) + "?"; });
  add(3, function () { const n = pick2(NAMES); return n[0] + " went to " + place()[0] + " with " + n[1] + " in " + P(W.month) + "."; });
  add(3, function () { return "Yesterday we went to the " + P(["park", "beach", "lake", "farm", "zoo"]) + " and saw " + an(P(W.adj) + " " + P(W.pet)) + "."; });
  add(3, function () { return "My friend " + P(NAMES) + " lives in " + place()[1] + "."; });
  add(3, function () { const n = pickN(NAMES, 3), a = act(); return n[0] + ", " + n[1] + ", and " + n[2] + " " + a.they + " at the " + a.spot + "."; });
  add(3, function () { const i = pickN(W.picnic, 3); return "We need " + i[0] + ", " + i[1] + ", and " + i[2] + " for the " + P(["picnic", "party", "trip", "bake sale"]) + "."; });
  add(3, function () { const p = place(); return "My " + P(W.rel) + " lives in " + p[0] + ", " + p[1] + "."; });
  add(3, function () { const n = pick2(NAMES), a = P(ACTS); return n[0] + " is going to the " + P(a[3]) + ", and " + n[1] + " wants to go too."; });
  add(3, function () { const n = pick2(NAMES); return n[0] + " is " + P(W.comper) + " than " + n[1] + "."; });
  add(3, function () { const p = pick2(W.pet); return "My " + p[0] + " is " + P(["bigger", "smaller", "faster", "older", "sleepier", "louder"]) + " than your " + p[1] + "."; });
  add(3, function () { const k = kid(), n = kid(k.n).n; return k.n + " gave " + k.p + " " + P(W.thing) + " to " + n + " and me."; });
  add(3, function () { return "Our " + P(["dog", "cat", "parrot", "turtle", "lizard"]) + " is " + P(Y.num) + " years old."; });
  add(3, function () { return "I read two books about " + P(W.topic) + " last week."; });
  add(3, function () { const k = kid(); return k.n + " ^has to " + P(W.chore)(k) + " before dinner."; });
  add(3, function () { const a = P(ANIM); return "Can you hear the " + a[0] + " " + P(a[1]) + " in the " + P(a[2]) + "?"; });
  add(3, function () { return "We went to the " + P(W.store) + " to buy " + P(W.item) + " for " + P(["lunch", "dinner", "breakfast"]) + "."; });
  add(3, function () { return P(NAMES) + " earned " + an(P(W.belt)) + " belt at the dojo on " + P(W.day) + "."; });
  add(3, function () { const v = pickN(["stretch", "bow", "kick", "listen", "focus", "practice", "block", "breathe"], 3); return "We " + v[0] + ", " + v[1] + ", and " + v[2] + " in karate class."; });
  add(3, function () { const k = kid(); return "Yesterday " + k.n + " went to the " + P(W.spot) + " with " + k.p + " " + P(W.rel) + "."; });
  add(3, function () { const a = act(); return "Tomorrow we will " + a.base + " at the " + a.spot + "."; });
  add(3, function () { const a = act(); return "Last " + P(W.weekend) + " we " + a.we + " at the " + a.spot + "."; });
  add(3, function () { return "I knew the answer to the " + P(["first", "last", "hardest", "next"]) + " question."; });
  add(3, function () { return "The wind blew my " + P(["hat", "kite", "paper", "scarf"]) + " across the " + P(["yard", "field", "street", "playground"]) + "."; });
  add(3, function () { const k = kid(); return k.n + " ate eight " + P(["grapes", "crackers", "strawberries", "carrot sticks"]) + " for " + k.p + " snack."; });
  add(3, function () { const k = kid(); return k.s === "she" ? "She and I " + act().we + " together." : "He and I " + act().we + " together."; });
  // 4th grade
  add(4, function () { return "On " + date() + ", we " + P(W.bigAct) + "."; });
  add(4, function () { return P(NAMES) + "'s " + P(W.pet) + " is sleeping under the " + P(W.furniture) + "."; });
  add(4, function () { const p = place(); return "They're going to visit their " + P(W.rel) + " in " + p[0] + ", " + p[1] + "."; });
  add(4, function () { return "There are too many " + P(W.plural) + " on the " + P(W.surface) + "."; });
  add(4, function () { return P(["Mr.", "Mrs.", "Ms.", "Dr."]) + " " + P(W.last) + " is teaching us about " + P(W.topic) + "."; });
  add(4, function () { const n = pick2(NAMES); return n[0] + " gave the " + P(W.thing) + " to " + n[1] + " and me."; });
  add(4, function () { return "Your " + P(W.thing) + " is on the " + P(W.surface) + " by the door."; });
  add(4, function () { return P(NAMES) + " was born on " + date() + "."; });
  add(4, function () { return "Our " + P(["concert", "game", "belt test", "field trip", "science fair", "play"]) + " is on " + P(W.day) + ", " + P(W.month) + " " + r(1, 28) + "."; });
  add(4, function () { const p = pick2(W.place); return P(NAMES) + " moved from " + p[0][0] + ", " + p[0][1] + ", to " + p[1][0] + ", " + p[1][1] + "."; });
  add(4, function () { return "\"Let's go to the " + P(W.spot) + ",\" said " + P(NAMES) + "."; });
  add(4, function () { return P(NAMES) + " said, \"I can't wait for " + P(W.day.concat(W.holiday.slice(0, 5))) + ".\""; });
  add(4, function () { return "\"I finished my " + P(W.subject) + " homework,\" said " + P(NAMES) + "."; });
  add(4, function () { return "They're going to bring their " + P(W.thing) + " over there."; });
  add(4, function () { return "You're going to need your " + P(W.gear) + " today."; });
  add(4, function () { return P(["Mrs.", "Mr.", "Ms."]) + " " + P(W.last) + " read us a book called " + title() + "."; });
  add(4, function () { const o = P([["coach", "is"], ["bus", "is"], ["bikes", "are"], ["jackets", "are"], ["lockers", "are"]]); return "The " + P(W.group) + "' " + o[0] + " " + o[1] + " " + P(["in the gym", "by the door", "outside", "near the field"]) + "."; });
  add(4, function () { return P(NAMES) + "'s " + P(W.rel) + " took us to see " + P(W.landmark) + "."; });
  add(4, function () { return "Dear " + P(NAMES) + ", thank you for the " + P(W.gift) + "."; });
  add(4, function () { return P(NAMES) + ", please pass the " + P(["salt", "bread", "rice", "beans", "crackers", "grapes", "napkins"]) + "."; });
  add(4, function () { return "There are " + P(Y.num) + " " + P(W.plural) + " on the " + P(W.surface) + "."; });
  add(4, function () { const p = place(); return "Our new address is " + r(10, 999) + " " + P(W.street) + ", " + p[0] + ", " + p[1] + "."; });
  add(4, function () { return "We're going to the " + P(W.spot) + " on " + P(W.day) + "."; });
  add(4, function () { return "The puppy's " + P(["bowl", "bed", "leash", "ball", "blanket"]) + " is " + P(["under the table", "by the door", "in the yard", "on the porch"]) + "."; });
  add(4, function () { return "Their " + P(W.pet) + " is sleeping over there by the " + P(W.furniture) + "."; });
  add(4, function () { return "Each " + P(["student", "player", "camper", "dancer"]) + " ^has " + an(P(W.thing)) + " with a name tag."; });
  add(4, function () { return "I bought " + P(Y.num) + " " + P(["peaches", "pears", "plums", "lemons", "apples"]) + " at the " + P(W.store) + "."; });
  add(4, function () { return "Sensei " + P(W.last) + " said, \"" + P(["Keep your eyes on your target.", "Bow to your partner.", "Breathe and stay calm.", "Practice makes progress.", "Focus on one move at a time."]) + "\""; });
  add(4, function () { return "The " + P(["teachers", "coaches", "students", "parents"]) + " were proud of the " + P(["class", "team", "band", "dancers"]) + "."; });
  add(4, function () { const h = P(W.holiday); return "On " + h + " we " + P(["visit our grandparents", "make a big dinner", "watch a parade", "play games together"]) + "."; });
  // 5th grade
  add(5, function () { return "After the " + P(W.event) + " ended, we went to the " + P(W.spot) + "."; });
  add(5, function () { return "\"Can I have " + an(P(W.snack)) + "?\" asked " + P(NAMES) + "."; });
  add(5, function () { return "It's going to rain, so bring your " + P(W.gear) + "."; });
  add(5, function () { const n = pick2(NAMES); return n[0] + " and " + n[1] + " practiced hard, and they won the " + P(W.contest) + "."; });
  add(5, function () { const p = place(); return "Have you ever been to " + p[0] + ", " + p[1] + "?"; });
  add(5, function () { return "Each of the students has " + an(P(W.thing)) + "."; });
  add(5, function () { return "We should have left earlier because the traffic was " + P(["bad", "slow", "heavy"]) + "."; });
  add(5, function () { return "When the bell rang, the " + P(W.group) + " lined up " + P(["quietly", "quickly", "by the door", "for lunch"]) + "."; });
  add(5, function () { return "If it rains on " + P(W.day) + ", we will " + P(W.indoor) + "."; });
  add(5, function () { return "\"Where is my " + P(W.thing) + "?\" asked " + P(NAMES) + "."; });
  add(5, function () { const k = kid(); return k.n + " wanted to " + P(["play outside", "go swimming", "read a comic", "ride " + k.p + " bike", "watch a movie"]) + ", but " + k.s + " had to " + P(W.chore)(k) + " first."; });
  add(5, function () { const w = P(WEATHER_PLAN); return "It's " + w[0] + " today, so we'll " + w[1] + "."; });
  add(5, function () { return "The " + P(["dog", "puppy"]) + " wagged its tail when it saw " + P(NAMES) + "."; });
  add(5, function () { return "We finished our " + P(W.subject) + " homework, and then we " + act().we + "."; });
  add(5, function () { const n = pick2(NAMES); return n[0] + " is a faster " + P(["runner", "swimmer", "reader", "skater"]) + " than " + n[1] + "."; });
  add(5, function () { return "Everyone in the class ^has " + an(P(W.thing)) + "."; });
  add(5, function () { const n = pick2(NAMES); return "Neither " + n[0] + " nor " + n[1] + " was late for " + P(["practice", "class", "the game", "the bus"]) + "."; });
  add(5, function () { return "Yes, I would like to join the " + P(W.club) + "."; });
  add(5, function () { return "Before " + P(["class", "practice", "the test"]) + " starts, we " + P(["bow and tie our belts", "stretch our legs", "warm up together", "line up quietly"]) + "."; });
  add(5, function () { return "\"" + P(["Focus on your breathing", "Keep your back straight", "Bow to your partner", "Try it one more time"]) + ",\" said Sensei " + P(W.last) + "."; });
  add(5, function () { return "\"Are you ready for the " + P(W.event) + "?\" asked " + P(NAMES) + "."; });
  add(5, function () { return "Although it was " + P(["cold", "windy", "cloudy", "late"]) + ", the " + P(W.group) + " played outside."; });
  add(5, function () { return P(NAMES) + " ^is better at " + P(["chess", "drawing", "swimming", "spelling", "kata"]) + " than I am."; });
  add(5, function () { return "Our " + P(["team", "class", "club"]) + " won its " + P(["first", "third", "last", "biggest"]) + " " + P(["game", "match", "contest"]) + " on " + P(W.day) + "."; });
  add(5, function () { const p = place(); return "We visited " + P(NAMES) + "'s " + P(W.rel) + " in " + p[0] + ", " + p[1] + ", last " + P(W.season) + "."; });
  add(5, function () { return "Our trip to " + place()[0] + " was more fun than we expected."; });
  add(5, function () { return "Thank you, " + P(NAMES) + ", for helping me " + P(["clean up", "study", "carry the boxes", "practice my kata"]) + "."; });
  // 6th grade
  add(6, function () { return "The " + P(W.group) + "' team won its first game on " + P(W.day) + "."; });
  add(6, function () { const n = pick2(NAMES); return n[0] + " is taller than " + n[1] + ", but " + n[1] + " is faster."; });
  add(6, function () { return "The storm affected our plans for " + P(W.day) + "."; });
  add(6, function () { return "We visited " + P(W.landmark) + ", and it was more beautiful than we imagined."; });
  add(6, function () { return "Whose " + P(W.thing) + " is lying on the floor?"; });
  add(6, function () { return "Neither the teacher nor the students were ready for the " + P(W.event) + "."; });
  add(6, function () { const i = pickN(W.picnic.concat(W.supply), 3); return P(NAMES) + " packed three things for the trip: " + i[0] + ", " + i[1] + ", and " + i[2] + "."; });
  add(6, function () { return "The storm was loud; the " + P(["kittens", "horses", "cows", "goats", "rabbits"]) + " hid in the barn."; });
  add(6, function () { const p = place(); return "My best friend,{x} " + P(NAMES) + ",{x} ^lives in " + p[0] + ", " + p[1] + "."; });
  add(6, function () { return "Whose " + P(W.thing) + " is this, and who's going to return it?"; });
  add(6, function () { return "The loud " + P(["music", "thunder", "noise", "construction"]) + " affected our focus during " + P(W.subject) + " class."; });
  add(6, function () { return "Everyone except " + P(NAMES) + " ^has finished the " + P(W.subject) + " quiz."; });
  add(6, function () { return "Our coach,{x} " + P(["Mr.", "Ms.", "Mrs."]) + " " + P(W.last) + ",{x} ^is the " + P(["kindest", "calmest", "bravest", "funniest", "most patient"]) + " person I know."; });
  add(6, function () { return "The " + P(["dogs", "cats", "ducks", "puppies"]) + " are lying in the " + P(["shade", "sun", "grass"]) + "."; });
  add(6, function () { return "\"I think,\" said " + P(NAMES) + ", \"that we should " + P(["practice again", "ask for help", "start over", "take a break"]) + ".\""; });
  add(6, function () { return "Please accept this " + P(["gift", "card", "note", "drawing"]) + " as a thank-you for your help."; });
  add(6, function () { return "We were allowed to read aloud during " + P(["class", "lunch", "the assembly", "story time"]) + "."; });
  add(6, function () { return "Our dojo has one important rule: " + P(W.rule) + "."; });
  add(6, function () { const a = act(); return "The weather was perfect, so we " + a.we + " at the " + a.spot + "."; });
  add(6, function () { return P(NAMES) + " ^runs faster than anyone else on the " + P(["team", "track team", "soccer team"]) + "."; });
  add(6, function () { return "Who's bringing the " + P(["snacks", "drinks", "plates", "games"]) + " to the " + P(W.perf) + " on " + P(W.day) + "?"; });
  add(6, function () { return "Did you lose your " + P(W.thing) + " at the " + P(W.spot) + "?"; });
  add(6, function () { return "My " + P(W.rel) + " and I made " + P(["soup", "bread", "pizza", "chili", "lemonade", "pancakes"]) + "; it was the best we had ever tasted."; });
  add(6, function () { return "The students who finished early helped their " + P(["classmates", "friends", "partners"]) + " with the " + P(W.subject) + " project."; });
  add(6, function () { const k = kid(); return k.n + " felt better after " + k.s + " " + P(["drank some water", "took a deep breath", "rested for a minute", "talked to " + k.p + " coach"]) + "."; });
  // 7th grade
  add(7, function () { return "There were fewer " + P(["people", "cars", "students", "families"]) + " at the " + P(W.perf) + " than we expected."; });
  add(7, function () { return "My " + P(W.rel) + ",{x} who lives in " + place()[1] + ",{x} sends us letters every month."; });
  add(7, function () { return "I wanted to go to the " + P(W.spot) + "; however, I had too much homework."; });
  add(7, function () { const h = P(W.hobby); return P(NAMES) + " likes " + h[0] + ", " + h[1] + ", and " + h[2] + "."; });
  add(7, function () { return "If I had studied, I would have passed the " + P(W.subject) + " test."; });
  add(7, function () { return "The effects of the " + P(["storm", "heat wave", "power outage", "flood", "snowstorm"]) + " surprised everyone in " + place()[0] + "."; });
  add(7, function () { const k = kid(); return k.n + " wanted to " + P(["join the " + P(W.club), "stay for the " + P(W.perf), "visit " + k.p + " " + P(W.rel)]) + "; however, " + k.s + " had to " + P(W.chore)(k) + "."; });
  add(7, function () { return "The " + P(W.group) + " practiced for weeks; therefore, they were ready for the " + P(W.perf) + "."; });
  add(7, function () { return "\"If we leave now,\" said " + P(NAMES) + ", \"we can still catch the " + P(["bus", "train", "start of the game", "first song"]) + ".\""; });
  add(7, function () { const i = pickN(W.picnic.concat(W.supply), 3); return P(NAMES) + " brought everything we needed: " + i[0] + ", " + i[1] + ", and " + i[2] + "."; });
  add(7, function () { const p = place(); return "My " + P(W.rel) + ",{x} who lives in " + p[0] + ", " + p[1] + ",{x} ^is visiting us in " + P(W.month) + "."; });
  add(7, function () { return "Neither of the " + P(["books", "movies", "games", "songs"]) + " was as exciting as the " + P(["first", "last", "new"]) + " one."; });
  add(7, function () { return "Because the " + P(W.perf) + " was canceled, we " + act().we + " instead."; });
  add(7, function () { const a = P(ANIM); return "The " + a[0] + ",{x} which live near the " + P(a[2]) + ",{x} are " + P(a[1]) + " again."; });
  add(7, function () { return "On " + P(W.day) + ", " + date() + ", our " + P(["school", "dojo", "class"]) + " held " + an(P(["fundraiser", "field day", "belt test", "book fair"])) + "."; });
  add(7, function () { return "Whoever wins the " + P(W.contest) + " will receive " + an(P(["trophy", "ribbon", "medal", "certificate"])) + "."; });
  add(7, function () { const m = P(W.motto); return "Our dojo's motto is simple: " + m[0] + ", " + m[1] + ", " + m[2] + "."; });
  add(7, function () { return "Practicing every day affects how quickly you improve at " + P(["karate", "piano", "chess", "math", "soccer"]) + "."; });
  add(7, function () { return "The effect of the " + P(["drought", "heat wave", "cold snap"]) + " was clear: the " + P(["plants", "crops", "flowers"]) + " were wilting."; });
  add(7, function () { const n = pick2(NAMES); return n[0] + " is more patient than " + n[1] + ", but " + n[1] + " is more organized."; });
  add(7, function () { return "The " + P(["coach", "principal", "librarian"]) + " ^announces the winners every " + P(W.day) + " morning."; });
  add(7, function () { return "My " + P(W.rel) + " taught me that patience is more important than speed."; });
  // 8th grade
  add(8, function () { return "Although the " + P(W.perf) + " was delayed, the " + P(["team", "band", "cast", "crew"]) + " stayed focused and prepared."; });
  add(8, function () { return "Neither of the players has finished the " + P(W.subject) + " assignment yet."; });
  add(8, function () { return "The committee,{x} which met on " + P(W.day) + ",{x} approved the new " + P(["schedule", "budget", "dress code", "library hours"]) + "."; });
  add(8, function () { const k = kid(); return k.n + " was more confident than I expected; however, " + k.s + " still practiced every day."; });
  add(8, function () { return "Whoever finishes first should help the students who are still working."; });
  add(8, function () { return "The effect of daily practice is clear: fewer mistakes and stronger habits."; });
  add(8, function () { const p = pick2(STATES); return "The " + P(["museum", "library", "aquarium", "science center"]) + ",{x} which opened in " + r(1990, 2020) + ",{x} ^attracts visitors from " + p[0] + " and " + p[1] + "."; });
  add(8, function () { const k = kid(); return "If " + k.n + " had known about the " + P(W.perf) + ", " + k.s + " would have arrived earlier."; });
  add(8, function () { return "\"Before you begin,\" said Sensei " + P(W.last) + ", \"" + P(["take a deep breath and focus", "check your stance", "bow to your partner", "picture each move"]) + ".\""; });
  add(8, function () { return "The results were clear: students who practiced daily made fewer mistakes on the " + P(W.subject) + " test."; });
  add(8, function () { return "Each of the " + P(["volunteers", "players", "students", "helpers"]) + " ^has a different job; some set up chairs, and others greet guests."; });
  add(8, function () { const k = kid(), n = kid(k.n).n; return "Not only did " + k.n + " finish the " + P(["essay", "project", "report", "poster"]) + ", but " + k.s + " also helped " + n + "."; });
  add(8, function () { return "The " + P(W.perf) + " was postponed until " + date() + ", because of the " + P(["weather", "storm", "flooding", "snow"]) + "."; });
  add(8, function () { return "Whether or not it rains, the " + P(["race", "parade", "game", "fun run"]) + " will begin at " + P(["noon", "nine o'clock", "ten o'clock"]) + "."; });
  add(8, function () { return "The principal's message was brief: be kind, be curious, and be prepared."; });
  add(8, function () { return "Their " + P(["project", "report", "presentation"]) + " on " + P(W.topic) + " was more detailed than ours."; });
  add(8, function () { return "Everyone who volunteered at the " + P(W.perf) + " received a thank-you note."; });
  add(8, function () { const p = place(); return "After moving to " + p[0] + ", " + p[1] + ", " + P(NAMES) + " joined the " + P(W.club) + " and made new friends."; });
  add(8, function () { return "The " + P(W.group) + " who practiced the longest were the most confident at the " + P(W.perf) + "."; });
  add(8, function () { const k = kid(); return k.n + " ^has always believed that respect is earned through kindness and patience."; });
  add(8, function () { const n = pick2(NAMES); return "Between you and me, " + n[0] + " is the most dedicated student in the " + P(W.club) + "."; });

  /* ---------- planting mistakes ---------- */
  /* Words carry markers from the templates: ^ (singular verb) and {x} (comma
     around extra information). They are recorded on the token and stripped. */
  function tokenize(s) {
    return s.split(" ").filter(Boolean).map(function (w) {
      const tok = { s: false, x: false };
      if (w.indexOf("^") !== -1) { tok.s = true; w = w.replace(/\^/g, ""); }
      if (w.indexOf("{x}") !== -1) { tok.x = true; w = w.replace(/\{x\}/g, ""); }
      const m = w.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9']*)$/);
      tok.pre = m[1]; tok.core = m[2]; tok.post = m[3];
      tok.o = { pre: m[1], core: m[2], post: m[3] }; // as written, before any mistake is planted
      return tok;
    });
  }
  const join = function (t) { return t.map(function (x) { return x.pre + x.core + x.post; }).join(" "); };
  const lowerFirst = function (s) { return s.charAt(0).toLowerCase() + s.slice(1); };
  const spellOut = function (w) { return w.split("").join("-"); };
  function each(tokens, used, test) {
    const idx = [];
    tokens.forEach(function (t, i) { if (!used.has(i) && test(t, i)) idx.push(i); });
    return idx.length ? pick(idx) : -1;
  }
  const done = function (i, used, o) { used.add(i); o.at = i; return o; };
  const STATES = [], CITYW = new Set(), STATEW = new Set();
  W.place.forEach(function (p) { if (STATES.indexOf(p[1]) === -1) STATES.push(p[1]); p[0].split(" ").forEach(function (x) { CITYW.add(x); }); p[1].split(" ").forEach(function (x) { STATEW.add(x); }); });
  const STATE_FIRST = new Set(STATES.map(function (s) { return s.split(" ")[0]; }));
  const STATE_LAST = new Set(STATES.map(function (s) { const a = s.split(" "); return a[a.length - 1]; }));
  const STREET_END = new Set(W.street.map(function (s) { return s.split(" ")[1]; }));
  const NAME_SET = new Set(NAMES);

  /* Why a word needs a capital letter. */
  const CAP_WHY = {};
  const capWhy = function (list, why) { list.forEach(function (w) { String(w).split(" ").forEach(function (x) { if (/^[A-Z]/.test(x)) CAP_WHY[x.replace(/'s$/, "")] = why; }); }); };
  capWhy(NAMES.concat(W.last), "is a person's name");
  capWhy(W.petName, "is a pet's name");
  capWhy(W.day, "is a day of the week");
  capWhy(W.month, "is a month");
  capWhy(Array.from(CITYW).concat(Array.from(STATEW)), "is the name of a place");
  capWhy(W.landmark, "is part of a place's name");
  capWhy(W.tAdj.concat(W.tNoun, ["The", "Secret", "Little"]), "is an important word in a book title");
  capWhy(W.holiday, "is part of a holiday's name");
  capWhy(W.street, "is part of a street name");
  capWhy(["Mom", "Dad"], "is used as a name here");
  capWhy(["Sensei", "Coach"], "is a title in front of a name");

  const CONTRACTIONS = { "can't": "can not", "don't": "do not", "doesn't": "does not", "didn't": "did not", "isn't": "is not", "it's": "it is", "It's": "it is", "They're": "they are", "they're": "they are", "won't": "will not", "I'm": "I am", "we'll": "we will", "We're": "we are", "we're": "we are", "You're": "you are", "you're": "you are", "Let's": "let us", "let's": "let us", "who's": "who is", "Who's": "who is", "I'll": "I will", "o'clock": "of the clock" };
  /* [right word, wrong word, lowest grade, explanation] */
  const HOMO = [
    ["to", "too", 3, "to = toward or before a verb, too = also or more than enough, two = 2."],
    ["too", "to", 3, "too means also or more than enough. to shows direction."],
    ["two", "to", 3, "two is the number 2. to shows direction."],
    ["week", "weak", 3, "A week is 7 days. Weak means not strong."],
    ["ate", "eight", 3, "ate = had food. eight = 8."],
    ["eight", "ate", 3, "eight = 8. ate = had food."],
    ["for", "four", 3, "for is a little helper word. four = 4."],
    ["by", "buy", 3, "by means next to or through. buy means to pay for."],
    ["buy", "by", 3, "buy means to pay for something. by means next to."],
    ["new", "knew", 3, "new = not old. knew = past of know."],
    ["knew", "new", 3, "knew is the past of know. new means not old."],
    ["our", "are", 3, "our = belongs to us. are is a verb (we are)."],
    ["hear", "here", 3, "hear = with your ears. here = this place."],
    ["blew", "blue", 3, "blew is the past of blow. blue is a color."],
    ["one", "won", 3, "one is the number 1. won means you came in first."],
    ["won", "one", 3, "won means you came in first. one is the number 1."],
    ["right", "write", 3, "right means correct. write means to put words on paper."],
    ["no", "know", 3, "no is the opposite of yes. know means to understand."],
    ["hours", "ours", 3, "hours are units of time. ours means belongs to us."],
    ["would", "wood", 3, "would is a helping verb. wood comes from trees."],
    ["their", "there", 4, "their = belongs to them, there = a place (or 'there is/are'), they're = they are."],
    ["there", "their", 4, "there = a place (or 'there is/are'), their = belongs to them."],
    ["There", "Their", 4, "There is/are starts with There. Their means belongs to them."],
    ["Their", "There", 4, "Their means belongs to them. There is a place."],
    ["They're", "Their", 4, "They're is short for they are. Their means belongs to them."],
    ["they're", "their", 4, "they're is short for they are. their means belongs to them."],
    ["your", "you're", 4, "your = belongs to you, you're = you are."],
    ["Your", "You're", 4, "Your = belongs to you, you're = you are."],
    ["You're", "Your", 4, "You're is short for you are. Your means belongs to you."],
    ["We're", "Were", 4, "We're is short for we are. Were is a past verb."],
    ["piece", "peace", 4, "A piece is a part of something. Peace means calm."],
    ["its", "it's", 5, "its = belongs to it. it's = it is."],
    ["It's", "Its", 5, "It's is short for it is. Its means belongs to it."],
    ["than", "then", 5, "than compares things. then is about time."],
    ["then", "than", 5, "then is about time (what happens next). than compares things."],
    ["Whose", "Who's", 6, "Whose asks who owns something. Who's = who is."],
    ["Who's", "Whose", 6, "Who's is short for who is. Whose asks who owns something."],
    ["who's", "whose", 6, "who's is short for who is. whose asks who owns something."],
    ["affected", "effected", 6, "affected is the verb (it changed something). effect is usually the noun."],
    ["affects", "effects", 6, "affects is the verb here. effects are results (a noun)."],
    ["effects", "affects", 6, "effects are results (a noun). affect is usually the verb."],
    ["effect", "affect", 6, "effect is the noun (the result). affect is usually the verb."],
    ["lying", "laying", 6, "Something resting is lying. You lay something down."],
    ["accept", "except", 6, "accept means to take or receive. except means leaving something out."],
    ["except", "accept", 6, "except means leaving someone out. accept means to receive."],
    ["allowed", "aloud", 6, "allowed means permitted. aloud means out loud."],
    ["aloud", "allowed", 6, "aloud means out loud. allowed means permitted."],
    ["lose", "loose", 6, "lose means to not find something. loose means not tight."],
    ["weather", "whether", 6, "weather is rain, sun or snow. whether means if."],
    ["Whether", "Weather", 6, "Whether means if. Weather is rain, sun or snow."],
    ["principal", "principle", 7, "The principal leads a school. A principle is a rule or belief."],
    ["passed", "past", 7, "passed is a verb (you passed the test). past means an earlier time."]
  ];
  const HOMO_HINT = { to: "Check every to / too / two.", too: "Check every to / too / two.", two: "Check every to / too / two.", their: "Check the their / there / they're word.", there: "Check the their / there / they're word.", There: "Check the their / there / they're word.", Their: "Check the their / there / they're word.", "They're": "Check the their / there / they're word.", "they're": "Check the their / there / they're word.", your: "Check the your / you're word.", Your: "Check the your / you're word.", "You're": "Check the your / you're word.", its: "Check the its / it's word.", "It's": "Check the its / it's word.", than: "Check the than / then word.", then: "Check the than / then word." };
  const MISSPELL = { because: "becuase", friend: "frend", said: "sed", people: "peeple", library: "libary", school: "scool", really: "realy", again: "agen", different: "diffrent", believe: "beleive", museum: "musuem", family: "famly", birthday: "berthday", before: "befor", until: "untill", every: "evry", together: "togather", letters: "leters", umbrella: "umbrela", homework: "homwork", dinner: "diner", beach: "beech", surprised: "suprised", science: "sience", tournament: "turnament", concert: "consert", carrots: "carots", apples: "aples", cheese: "chees", bunny: "buny", parrot: "parot", turtle: "turtel", water: "watter", bottle: "bottel", jacket: "jaket", pencil: "pensil", playground: "playgrownd", garden: "gardin", anywhere: "anywere", happy: "hapy", traffic: "trafic", earlier: "erlier", beautiful: "beutiful", imagined: "imajined", expected: "expeckted", everyone: "evryone", studied: "studyed", teaching: "teeching", sleeping: "sleping", kitten: "kitton", puppy: "pupy", friendly: "frendly", curious: "curius", birds: "berds", squirrels: "squirels", fireworks: "firewerks", ready: "redy", month: "munth", meeting: "meating", spelling: "speling", history: "histery", camping: "campping", notebook: "noteboke", breakfast: "brekfast", lunch: "lunsh", like: "lik", play: "pley", have: "hav", they: "thay", see: "se", jump: "jumpp", house: "hous", little: "littel", where: "were",
    with: "whith", went: "whent", want: "whant", wants: "whants", what: "wat", when: "wen", pretty: "prety", very: "verry", many: "meny", could: "cood", should: "shuld", after: "aftr", around: "arond", about: "abowt", always: "allways", once: "wunse", kick: "kik", class: "clas", focus: "focis", respect: "respekt", partner: "partnor", breathing: "breething", patient: "pashent", important: "importent", special: "speshal", excited: "exsited", helpful: "helpfull", careful: "carefull", finally: "finaly", quietly: "quitely", interesting: "intresting", vegetables: "vegtables", sandwiches: "sandwitches", neighbor: "nieghbor", receive: "recieve", experiment: "expirement", tomorrow: "tommorow", already: "allready", address: "adress", schedule: "schedual", approved: "aproved", confident: "confedent", assignment: "asignment", surprise: "suprise", thought: "thot", enough: "enuf", busy: "bizzy", answer: "anser", question: "qestion", listen: "lisen", picnic: "picnik", kitchen: "kichen", temperature: "temprature", excellent: "exellent", audience: "audiance", visitors: "visiters", delayed: "delaid", prepared: "prepaired", postponed: "postponned", detailed: "detaled", announces: "anounces", winners: "winers", trophy: "trofy", ribbon: "ribon", students: "studants", teacher: "teecher", classmates: "clasmates", finished: "finshed", helped: "helpd", person: "persen", everything: "everthing", needed: "neded", visiting: "visting", instead: "insted", clear: "cleer", brief: "breif", message: "mesage", arrived: "arived", known: "knowen", guests: "gests", chairs: "chares", essay: "esay", project: "projeckt", also: "allso", proud: "prowd", tired: "tird", hungry: "hungery", sleepy: "sleepey", funny: "funy", today: "todai", yellow: "yelow", purple: "purpel", orange: "ornge", green: "gren", brown: "broun", soup: "supe", pizza: "piza", cookies: "cookys", muffins: "mufins", pancakes: "pankakes", grapes: "graps", basket: "baskit", walk: "wawk", party: "partee", quiet: "quiat", across: "accross", strong: "strawng", smart: "smarte", teddy: "tedy", rabbits: "rabits", horses: "horsis", ducks: "duks", trees: "trese", field: "feild", meadow: "medow", weekend: "weakend", favorite: "favrite", practice: "practis", karate: "karatee", kicks: "kiks", stretch: "strech", balance: "balanse", calm: "cawm", breathe: "breeth", lemonade: "lemonaid", strawberries: "strawberrys", weeks: "weks", geography: "jeography", certificate: "certifikate", volunteered: "volenteered", received: "recieved", dedicated: "dedecated", believed: "beleived", kindness: "kindnes", strength: "strenth", minute: "minit", decided: "desided" };
  const AGREE = { is: ["are", "Use is for one thing and are for more than one."], are: ["is", "Use are for more than one (or with you/we/they)."], was: ["were", "Use was for one thing and were for more than one (or with we/you/they)."], were: ["was", "Use were for more than one (or with we/you/they)."], has: ["have", "Use has with he, she, it or one person (each of them has)."], have: ["has", "Use have with I, you, we, they and after helper words like would."] };
  /* nouns that can sound right with is or are, so agreement mistakes skip them */
  const AMBIG = new Set(["fish", "sheep", "deer", "team", "class", "family", "group", "committee", "band", "club", "staff", "crew", "cast", "audience", "goldfish"]);
  const PAST = { went: "goed", ran: "runned", saw: "seen", made: "maked", ate: "eated", brought: "bringed", built: "builded", found: "finded", took: "taked", won: "winned", wrote: "writed", rode: "rided", fed: "feeded", bought: "buyed", gave: "gived", flew: "flied", had: "haved", sat: "sitted", hid: "hided", swam: "swimmed", sang: "singed", drew: "drawed", threw: "throwed", caught: "catched", taught: "teached", slept: "sleeped", kept: "keeped", told: "telled", came: "comed", wore: "weared", grew: "growed", knew: "knowed", held: "holded", met: "meeted", chose: "choosed", dug: "digged", fell: "falled", blew: "blowed", felt: "feeled", drank: "drinked" };
  const PAST_BASE = { went: "go", ran: "run", saw: "see", made: "make", ate: "eat", brought: "bring", built: "build", found: "find", took: "take", won: "win", wrote: "write", rode: "ride", fed: "feed", bought: "buy", gave: "give", flew: "fly", had: "have", sat: "sit", hid: "hide", swam: "swim", sang: "sing", drew: "draw", threw: "throw", caught: "catch", taught: "teach", slept: "sleep", kept: "keep", told: "tell", came: "come", wore: "wear", grew: "grow", knew: "know", held: "hold", met: "meet", chose: "choose", dug: "dig", fell: "fall", blew: "blow", felt: "feel", drank: "drink",
    played: "play", visited: "visit", practiced: "practice", walked: "walk", watched: "watch", planted: "plant", painted: "paint", helped: "help", finished: "finish", baked: "bake", looked: "look", hiked: "hike", stayed: "stay", moved: "move", adopted: "adopt", earned: "earn", bowed: "bow", lined: "line" };
  const BASE_PAST = {};
  Object.keys(PAST_BASE).forEach(function (p) { if (!BASE_PAST[PAST_BASE[p]]) BASE_PAST[PAST_BASE[p]] = p; });
  const PAST_WHEN = new Set(W.day.concat(W.season).map(function (x) { return x.toLowerCase(); }).concat(["week", "month", "year", "night", "weekend", "season"]));
  const PLURAL_BAD = { children: ["childs", "child"], mice: ["mouses", "mouse"], feet: ["foots", "foot"], teeth: ["tooths", "tooth"], geese: ["gooses", "goose"], men: ["mans", "man"], women: ["womans", "woman"], wolves: ["wolfs", "wolf"], leaves: ["leafs", "leaf"], shelves: ["shelfs", "shelf"], sheep: ["sheeps", "sheep"], deer: ["deers", "deer"],
    foxes: ["foxs", "fox"], boxes: ["boxs", "box"], dishes: ["dishs", "dish"], benches: ["benchs", "bench"], lunches: ["lunchs", "lunch"], sandwiches: ["sandwichs", "sandwich"], peaches: ["peachs", "peach"], coaches: ["coachs", "coach"], wishes: ["wishs", "wish"], glasses: ["glasss", "glass"],
    puppies: ["puppys", "puppy"], bunnies: ["bunnys", "bunny"], babies: ["babys", "baby"], ponies: ["ponys", "pony"], berries: ["berrys", "berry"], strawberries: ["strawberrys", "strawberry"], families: ["familys", "family"], stories: ["storys", "story"], cherries: ["cherrys", "cherry"], parties: ["partys", "party"] };
  function pluralWhy(right, one) {
    if (/ies$/.test(right)) return "When a word ends in a consonant and y, change the y to i and add -es: " + one + " → " + right + ".";
    if (/(x|ch|sh|ss)es$/.test(right)) return "Words that end in x, ch, sh or s add -es: " + one + " → " + right + ".";
    if (/ves$/.test(right)) return "Many words that end in f change to -ves: " + one + " → " + right + ".";
    if (right === one) return "The word " + right + " stays the same for one or many.";
    return "Some plurals are special: one " + one + ", two " + right + ".";
  }
  const SUBJ_OBJ = { She: "Her", He: "Him", They: "Them", We: "Us" };
  const OBJ_SUBJ = { me: "I", him: "he", her: "she", them: "they", us: "we" };
  const PREPS = new Set(["with", "to", "for", "at", "behind", "near", "beside", "from"]);
  const COMP_IRREG = { better: "gooder", worse: "badder", best: "goodest" };

  /* Comma kinds (each is its own skill). */
  const INTRO_FIRST = new Set(["After", "When", "If", "Before", "Because", "Although", "While", "Since", "Once", "Until", "As", "Whether"]);
  const INTRO_WORD = new Set(["however", "therefore", "Yes", "No", "Well", "Finally", "Instead", "Also"]);
  function commaKind(t0, i) {
    const t = t0.map(function (x) { return { x: x.x, pre: x.o.pre, core: x.o.core, post: x.o.post }; });
    const x = t[i], nx = t[i + 1], prev = x.core, nc = nx.core, before = i > 0 ? t[i - 1].core : "";
    if (x.x) return "commaExtra";
    if (/"/.test(x.post) || /"/.test(nx.pre)) return "commaQuote";
    if (/^\d{1,2}$/.test(prev) && W.month.indexOf(before) !== -1) return "commaDate";
    if (/^\d{4}$/.test(prev)) return "commaDate";
    if (W.day.indexOf(prev) !== -1 && W.month.indexOf(nc) !== -1) return "commaDate";
    if (STATE_FIRST.has(nc) || STATE_LAST.has(prev) || STREET_END.has(prev)) return "commaPlace";
    if (NAME_SET.has(prev) && ((i === 0 && !NAME_SET.has(nc)) || before === "Dear" || before === "you")) return "commaName";
    if (NAME_SET.has(nc) && prev === "you") return "commaName";
    if (nc === "so" || nc === "but" || nc === "yet") return "commaJoin";
    if (INTRO_WORD.has(prev) || (INTRO_FIRST.has(t[0].core) && i < 12) || (t[0].core === "Between" && i < 5) || (t[0].core === "After" && i < 8)) return "commaIntro";
    return "commaList";
  }
  const COMMA_MIN = { commaList: 3, commaPlace: 3, commaDate: 4, commaQuote: 4, commaName: 4, commaJoin: 5, commaIntro: 5, commaExtra: 6 };
  function commaWhy(kind, t0, i) {
    const t = t0.map(function (x) { return x.o; }), prev = t[i].core;
    switch (kind) {
      case "commaDate": return /^\d{4}$/.test(prev) ? "Put a comma after the year when the sentence keeps going." : W.day.indexOf(prev) !== -1 ? "Put a comma between the day of the week and the date." : "Put a comma between the day and the year in a date.";
      case "commaPlace": return STREET_END.has(prev) ? "Put commas between the parts of an address." : STATE_LAST.has(prev) ? "Put a comma after the state when the sentence keeps going." : "Put a comma between a city and its state.";
      case "commaQuote": return "Use a comma to set off the exact words someone says from words like said or asked.";
      case "commaName": return t[i - 1] && t[i - 1].core === "Dear" ? "Put a comma after the greeting in a letter." : "Use commas to set off the name of the person you are talking to.";
      case "commaJoin": return "Use a comma before " + t[i + 1].core + " when it joins two complete sentences.";
      case "commaIntro": return INTRO_WORD.has(prev) ? "Put a comma after " + prev + " when it starts a part of the sentence." : "Put a comma after an opening part like \"" + t.slice(0, i + 1).map(function (x) { return x.core; }).join(" ") + "\".";
      case "commaExtra": return "Put commas around extra information in a sentence.";
      default: return "Use commas to separate three or more items in a list.";
    }
  }

  /* Each injector changes one word or mark and returns { hint, explain, skill, at }. */
  const INJECT = {
    cap: [
      function capFirst(t, used) {
        if (used.has(0) || !/^[A-Z]/.test(t[0].core)) return null;
        t[0].core = t[0].core === "I" ? "i" : lowerFirst(t[0].core);
        return done(0, used, { hint: "Look at the very first word.", explain: "A sentence always starts with a capital letter." });
      },
      function capI(t, used) {
        const i = each(t, used, function (x, k) { return k > 0 && /^I('m|'ll|'ve|'d)?$/.test(x.core); });
        if (i < 0) return null;
        t[i].core = lowerFirst(t[i].core);
        return done(i, used, { hint: "Look for the word that means you.", explain: "The word I is always a capital letter." });
      },
      function capProper(t, used) {
        const i = each(t, used, function (x, k) { return k > 0 && /^[A-Z][a-z]/.test(x.core) && ["Mr", "Mrs", "Ms", "Dr"].indexOf(x.core) === -1 && x.pre.indexOf('"') === -1; });
        if (i < 0) return null;
        const word = t[i].core, nx = t[i + 1] ? t[i + 1].core : "";
        const why = word === "New" ? (/^Year/.test(nx) ? "is part of a holiday's name" : "is the name of a place") : word === "Little" && nx === "Rock" ? "is the name of a place" : CAP_WHY[word.replace(/'s$/, "")] || "is a name";
        t[i].core = lowerFirst(word);
        const hint = /title/.test(why) ? "Look at the title of the book." : "Look for the name of a person, pet, place, day or month.";
        return done(i, used, { hint: hint, explain: word + " " + why + ", so it starts with a capital letter." });
      }
    ],
    punct: [
      function endMark(t, used) {
        const i = t.length - 1, end = t[i].post;
        const m = end.match(/([.?!])("?)$/);
        if (used.has(i) || !m) return null;
        const mark = m[1], q = mark === "?";
        t[i].post = end.slice(0, end.length - m[0].length) + (q && !m[2] && Math.random() < 0.5 ? "." : "") + m[2];
        const inQ = m[2] ? " It goes inside the quotation marks." : "";
        return done(i, used, q ? { hint: "Is this sentence telling or asking?", explain: "A question ends with a question mark." + inQ }
          : mark === "!" ? { hint: "How does this sentence end?", explain: "A sentence that shows strong feeling ends with an exclamation point." }
            : { hint: "How does this sentence end?", explain: "A telling sentence ends with a period." + inQ });
      },
      function apostrophe(t, used) {
        const i = each(t, used, function (x) { return /'/.test(x.core) && x.core !== "o'clock"; });
        if (i < 0) return null;
        const tok = t[i];
        if (/s'$/.test(tok.core)) { // plural possessive: girls'
          const w = tok.core; tok.core = w.slice(0, -1);
          return done(i, used, { hint: "Something belongs to a group. How do you show that?", explain: w + " shows that something belongs to more than one, so the apostrophe goes after the s." });
        }
        const word = tok.core;
        tok.core = word.replace("'", "");
        if (CONTRACTIONS[word]) return done(i, used, { hint: "Look for a word that is short for two words.", explain: word + " is short for " + CONTRACTIONS[word] + ", so it needs an apostrophe." });
        return done(i, used, { hint: "Something belongs to someone. How do you show that?", explain: word + " shows that something belongs to " + word.replace("'s", "") + ", so it needs 's." });
      },
      function comma(t, used, grade, opt) {
        const want = opt && opt.sub, sw = (opt && opt.sw) || {};
        const cands = [];
        t.forEach(function (x, k) {
          if (used.has(k) || k >= t.length - 1 || !/,/.test(x.post)) return;
          if (["and", "or"].indexOf(t[k + 1].core) !== -1) return; // the list comma before and/or is optional
          const kind = commaKind(t, k);
          if (COMMA_MIN[kind] > grade || (want && kind !== want)) return;
          cands.push([k, kind]);
        });
        if (!cands.length) return null;
        const c = want ? pick(cands) : cands[weightedIndex(cands.map(function (c) { return sw[c[1]] || 1; }))];
        const i = c[0];
        t[i].post = t[i].post.replace(",", "");
        return done(i, used, { hint: "A comma is missing somewhere.", explain: commaWhy(c[1], t, i), skill: c[1] });
      },
      function quotes(t, used) {
        const i = each(t, used, function (x) { return /"/.test(x.pre) || /"/.test(x.post); });
        if (i < 0) return null;
        const open = /"/.test(t[i].pre);
        if (open) t[i].pre = t[i].pre.replace('"', ""); else t[i].post = t[i].post.replace('"', "");
        return done(i, used, { hint: "Look at where the speaker's exact words " + (open ? "start." : "end."), explain: "Put quotation marks before and after the exact words someone says." });
      },
      function semicolon(t, used) {
        const i = each(t, used, function (x, k) { return /;$/.test(x.post) && k < t.length - 1; });
        if (i < 0) return null;
        t[i].post = t[i].post.replace(/;$/, ",");
        return done(i, used, { hint: "Two complete sentences are joined with the wrong mark.", explain: "Use a semicolon (not a comma) to join two complete sentences without and, but or so." });
      },
      function colon(t, used) {
        const i = each(t, used, function (x, k) { return /:$/.test(x.post) && k < t.length - 1; });
        if (i < 0) return null;
        t[i].post = t[i].post.replace(/:$/, "");
        return done(i, used, { hint: "A mark that introduces a list or an explanation is missing.", explain: "Use a colon after a complete sentence to introduce a list or an explanation." });
      }
    ],
    spell: [
      function misspell(t, used) {
        const i = each(t, used, function (x) { return MISSPELL[x.core] && x.core === x.core.toLowerCase(); });
        if (i < 0) return null;
        const word = t[i].core;
        t[i].core = MISSPELL[word];
        return done(i, used, { hint: "One word is spelled wrong. Sound each word out slowly.", explain: word + " is spelled " + spellOut(word) + "." });
      },
      function homophone(t, used, grade) {
        const options = [];
        t.forEach(function (x, k) {
          if (used.has(k)) return;
          HOMO.forEach(function (h) { if (h[2] <= grade && h[0] === x.core) options.push([k, h]); });
        });
        if (!options.length) return null;
        const o = pick(options), k = o[0], h = o[1];
        t[k].core = h[1];
        return done(k, used, { hint: HOMO_HINT[h[0]] || "One word sounds right but is the wrong word.", explain: h[3] });
      },
      function plural(t, used) {
        const i = each(t, used, function (x) { return PLURAL_BAD[x.core]; });
        if (i < 0) return null;
        const word = t[i].core, b = PLURAL_BAD[word];
        t[i].core = b[0];
        return done(i, used, { hint: "Look at a word that means more than one.", explain: pluralWhy(word, b[1]) });
      }
    ],
    grammar: [
      function agreement(t, used) {
        const opts = [];
        t.forEach(function (x, k) {
          if (used.has(k)) return;
          const prev = k > 0 ? t[k - 1].core.toLowerCase() : "";
          if (AGREE[x.core] && !AMBIG.has(prev)) opts.push([k, AGREE[x.core][0], "It should be " + x.core + ". " + AGREE[x.core][1]]);
          if (x.core === "doesn't") opts.push([k, "don't", "Use doesn't with he, she, it or one person."]);
          if (x.core === "don't" && /^(I|we|you|they)$/i.test(prev)) opts.push([k, "doesn't", "Use don't with I, you, we and they."]);
          if (x.s && x.core.length > 2 && !AGREE[x.core] && !AMBIG.has(prev)) {
            const base = x.core === "does" ? "do" : x.core === "goes" ? "go" : /[^aeiou]ies$/.test(x.core) ? x.core.replace(/ies$/, "y") : /(ch|sh|ss|x)es$/.test(x.core) ? x.core.replace(/es$/, "") : x.core.replace(/s$/, "");
            if (base !== x.core) opts.push([k, base, "When one person or thing does the action, the verb ends in -s: " + x.core + "."]);
          }
        });
        if (!opts.length) return null;
        const o = pick(opts), k = o[0];
        t[k].core = o[1];
        return done(k, used, { hint: "Does the verb match who is doing it?", explain: o[2], skill: "agreement" });
      },
      function pastTense(t, used) {
        const i = each(t, used, function (x) { return PAST[x.core]; });
        if (i < 0) return null;
        const word = t[i].core;
        t[i].core = PAST[word];
        return done(i, used, { hint: "One action word has the wrong past-tense form.", explain: "The past tense of " + PAST_BASE[word] + " is " + word + "." });
      },
      function tense(t, used) {
        const words = t.map(function (x) { return x.core.toLowerCase(); });
        const past = words.indexOf("yesterday") !== -1 || words.indexOf("ago") !== -1 || words.some(function (w, k) { return w === "last" && PAST_WHEN.has(words[k + 1]); });
        const opts = [];
        t.forEach(function (x, k) {
          if (used.has(k)) return;
          if (past && PAST_BASE[x.core] && x.core !== "had") opts.push([k, PAST_BASE[x.core], "The sentence tells about the past, so use " + x.core + ", not " + PAST_BASE[x.core] + "."]);
          if (k > 0 && t[k - 1].core === "will" && BASE_PAST[x.core]) opts.push([k, BASE_PAST[x.core], "After will, use the plain verb: will " + x.core + "."]);
        });
        if (!opts.length) return null;
        const o = pick(opts);
        t[o[0]].core = o[1];
        return done(o[0], used, { hint: "Check when this happens. Does the verb match the time?", explain: o[2] });
      },
      function pronoun(t, used) {
        const opts = [];
        t.forEach(function (x, k) {
          if (used.has(k)) return;
          if (k > 0 && t[k - 1].core === "and" && (x.core === "I" || x.core === "me") && t[0].core !== "Between") opts.push([k, x.core === "I" ? "me" : "I", x.core === "I" ? "Use I when you're one of the people doing the action: '... and I went'." : "Use me after action words and words like to or with: 'gave it to ... and me'."]);
          if (k === 0 && SUBJ_OBJ[x.core]) opts.push([k, SUBJ_OBJ[x.core], "Use " + x.core + " when " + x.core.toLowerCase() + " " + (x.core === "She" || x.core === "He" ? "is" : "are") + " doing the action."]);
          if (k > 0 && OBJ_SUBJ[x.core] && PREPS.has(t[k - 1].core) && (x.post || k === t.length - 1)) opts.push([k, OBJ_SUBJ[x.core], "Use " + x.core + " after words like " + t[k - 1].core + "."]);
          if (x.core === "me" && t[k - 1] && t[k - 1].core === "and" && t[k - 2] && t[k - 2].core === "you" && t[k - 3] && t[k - 3].core === "Between") opts.push([k, "I", "Use me after between: between you and me."]);
        });
        if (!opts.length) return null;
        const o = pick(opts);
        t[o[0]].core = o[1];
        return done(o[0], used, { hint: "Check the pronouns (I, me, she, her, he, him). Does each one sound right?", explain: o[2] });
      },
      function comparative(t, used) {
        const opts = [];
        t.forEach(function (x, k) {
          if (used.has(k)) return;
          const next = t[k + 1] ? t[k + 1].core : "";
          if (COMP_IRREG[x.core]) opts.push([k, COMP_IRREG[x.core], x.core + " is the right form. Good, better, best and bad, worse, worst are special."]);
          else if (next === "than" && /[a-z]er$/.test(x.core) && ["other", "rather"].indexOf(x.core) === -1 && x.core.length > 4 && W.comper.concat(["bigger", "smaller", "faster", "older", "sleepier", "louder"]).indexOf(x.core) !== -1)
            opts.push([k, x.core.replace(/er$/, "est"), "Use -er (" + x.core + ") to compare two things. Use -est for three or more."]);
        });
        if (!opts.length) return null;
        const o = pick(opts);
        t[o[0]].core = o[1];
        return done(o[0], used, { hint: "Look at a word that compares.", explain: o[2] });
      }
    ]
  };
  const BASE_ERRORS = { "-1": 1, 0: 1, 1: 2, 2: 2, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4 };
  /* The youngest grades only see the simplest kinds of mistakes. */
  const MIN_GRADE = { capFirst: -1, endMark: -1, capI: 0, capProper: 1, misspell: 1, agreement: 1, apostrophe: 2, pastTense: 2, plural: 2, pronoun: 2, comma: 3, homophone: 3, tense: 3, comparative: 3, quotes: 4, semicolon: 6, colon: 6 };
  function injectors(type, grade) { return (INJECT[type] || []).filter(function (f) { return (MIN_GRADE[f.name] === undefined ? -1 : MIN_GRADE[f.name]) <= grade; }); }

  /* ---------- skills: the finer kinds of mistakes we track ---------- */
  const SKILLS = {
    capFirst: ["cap", "capital letters at the start", -1], capI: ["cap", "the capital word I", 0], capProper: ["cap", "capital letters for names", 1],
    endMark: ["punct", "end marks", -1], apostrophe: ["punct", "apostrophes", 2], quotes: ["punct", "quotation marks", 4], semicolon: ["punct", "semicolons", 6], colon: ["punct", "colons", 6],
    commaList: ["punct", "commas in a list", 3], commaPlace: ["punct", "commas in places and addresses", 3], commaDate: ["punct", "commas in dates", 4], commaQuote: ["punct", "commas with quotations", 4],
    commaName: ["punct", "commas with names and greetings", 4], commaJoin: ["punct", "commas before so and but", 5], commaIntro: ["punct", "commas after opening words", 5], commaExtra: ["punct", "commas around extra information", 6],
    misspell: ["spell", "spelling words", 1], homophone: ["spell", "sound-alike words", 3], plural: ["spell", "plural words", 2],
    agreement: ["grammar", "verbs that match the subject", 1], pastTense: ["grammar", "past-tense verbs", 2], tense: ["grammar", "verb tense", 3], pronoun: ["grammar", "pronouns", 2], comparative: ["grammar", "comparing words", 3]
  };
  const skillOk = function (s, grade) { return SKILLS[s] && SKILLS[s][2] <= grade; };
  const skillOf = function (f) { return f.name; };
  function fnsForSkill(skill) {
    const type = SKILLS[skill][0];
    if (/^comma/.test(skill)) return [[INJECT.punct[2], { sub: skill }]];
    return INJECT[type].filter(function (f) { return f.name === skill; }).map(function (f) { return [f, null]; });
  }

  /* ---------- memory: what this student has seen and how each skill is going ---------- */
  const SEEN_CAP = 600, SKILL_WIN = 12, MEM_WIN = 20;
  const MEM = { type: {}, skill: {}, seen: new Set() };
  function hash(s) {
    s = String(s).replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  function seenSet(p) {
    const s = new Set(MEM.seen);
    if (p && Array.isArray(p.sentSeen)) p.sentSeen.forEach(function (h) { s.add(h); });
    return s;
  }
  function markSeen(p, answer) {
    const h = hash(answer);
    MEM.seen.add(h);
    if (p) {
      if (!Array.isArray(p.sentSeen)) p.sentSeen = [];
      const i = p.sentSeen.indexOf(h);
      if (i !== -1) p.sentSeen.splice(i, 1);
      p.sentSeen.unshift(h);
      if (p.sentSeen.length > SEEN_CAP) p.sentSeen.length = SEEN_CAP;
    }
    return h;
  }
  const memPush = function (map, k, ok) { const a = map[k] || (map[k] = []); a.push(ok ? 1 : 0); if (a.length > MEM_WIN) a.shift(); };
  const avg = function (a) { return a && a.length ? a.reduce(function (x, y) { return x + Number(y); }, 0) / a.length : null; };
  /* Record one planted mistake: fixed on the first try (ok) or not. */
  function note(type, ok, skill, p) {
    if (type && (!BD.FIX_TYPES || BD.FIX_TYPES[type])) memPush(MEM.type, type, ok);
    if (skill && SKILLS[skill]) {
      memPush(MEM.skill, skill, ok);
      if (p) {
        if (!p.sentSkill || typeof p.sentSkill !== "object") p.sentSkill = {};
        p.sentSkill[skill] = ((p.sentSkill[skill] || "") + (ok ? "1" : "0")).slice(-SKILL_WIN);
      }
    }
  }
  /* Saved results when there are enough, otherwise this session's. */
  function skillStat(p, s) {
    const saved = p && p.sentSkill && typeof p.sentSkill[s] === "string" ? p.sentSkill[s].split("") : [];
    const mem = MEM.skill[s] || [];
    const a = saved.length >= mem.length ? saved : mem;
    return { n: a.length, rate: avg(a) };
  }
  function skillWeights(p, grade) {
    const out = {};
    Object.keys(SKILLS).forEach(function (s) {
      if (!skillOk(s, grade)) return;
      const st = skillStat(p, s);
      out[s] = st.n < 2 ? 1.2 : 1 + 3 * (1 - st.rate);
    });
    return out;
  }
  function typeWeights(p, grade, focus) {
    const w = BD.Coach && p ? BD.Coach.typeWeights(p, grade, focus) : { cap: 1.5, punct: 1.5, spell: 1.5, grammar: 1.5 };
    Object.keys(w).forEach(function (t) {
      const saved = p && p.typeRecent && (p.typeRecent[grade] || {})[t];
      const mem = MEM.type[t];
      if ((!saved || saved.length < 4) && mem && mem.length >= 2) w[t] = (1 + 2.5 * (1 - avg(mem))) * (focus === t ? 3 : 1);
    });
    return w;
  }
  /* The weakest skill for this grade (at least 3 tries, under 70%). */
  function weakSkill(p, grade, focus) {
    let best = null;
    Object.keys(SKILLS).forEach(function (s) {
      if (!skillOk(s, grade) || (focus && SKILLS[s][0] !== focus)) return;
      const st = skillStat(p, s);
      if (st.n >= 3 && st.rate < 0.7 && (!best || st.rate < best.rate || (st.rate === best.rate && st.n > best.n))) best = { skill: s, rate: st.rate, n: st.n };
    });
    return best ? best.skill : null;
  }

  function weighted(w) {
    const keys = Object.keys(w);
    let x = Math.random() * keys.reduce(function (a, k) { return a + w[k]; }, 0);
    for (const k of keys) { x -= w[k]; if (x <= 0) return k; }
    return keys[keys.length - 1];
  }
  function weightedIndex(ws) {
    let x = Math.random() * ws.reduce(function (a, b) { return a + b; }, 0);
    for (let i = 0; i < ws.length; i++) { x -= ws[i]; if (x <= 0) return i; }
    return ws.length - 1;
  }
  /* Templates for this grade: its own grade most often, the two below less. */
  const poolCache = {};
  function pool(grade) {
    if (poolCache[grade]) return poolCache[grade];
    const list = T.filter(function (x) { return x[0] <= grade && x[0] >= grade - 2; });
    return (poolCache[grade] = { list: list, w: list.map(function (x) { return [3, 2, 1][grade - x[0]]; }) });
  }
  /* 6th to 8th grade: spend the practice on grade-level skills (commas with
     opening words, extra information and joined sentences, semicolons, colons,
     tricky subject-verb agreement, tense, pronouns, sound-alike words) instead
     of the basics they mastered years ago (capital at the start, end marks,
     simple misspellings like "hav"). */
  const MIDDLE = { capFirst: 0.3, endMark: 0.35, capI: 0.3, misspell: 0.35, pastTense: 0.5, plural: 0.5, comma: 2, semicolon: 2.5, colon: 2.2, agreement: 1.8, tense: 2, pronoun: 1.8, homophone: 1.6, apostrophe: 1.4, quotes: 1.1 };
  function emph(name, grade) { return grade >= 6 && MIDDLE[name] ? MIDDLE[name] : 1; }
  function pickInjector(type, grade, sw) {
    const fns = injectors(type, grade);
    if (!fns.length) return null;
    const ws = fns.map(function (f) {
      if (f.name === "comma") return 1.5 * emph("comma", grade) * Math.max.apply(null, Object.keys(COMMA_MIN).map(function (k) { return COMMA_MIN[k] <= grade ? (sw[k] || 1) * (grade >= 6 && COMMA_MIN[k] >= 5 ? 2 : 1) : 0; }));
      return (sw[f.name] || 1) * emph(f.name, grade);
    });
    return fns[weightedIndex(ws)];
  }

  /* Build one fresh sentence with mistakes, aimed at the student's weak spots.
     opts: { p (student, for no-repeats), target (a skill to plant first), track: false (testing) } */
  function make(grade, weights, extra, opts) {
    opts = opts || {};
    grade = Math.max(-1, Math.min(8, Math.round(Number(grade) || 0)));
    const track = opts.track !== false;
    const seen = track ? seenSet(opts.p) : null;
    const pl = pool(grade);
    const want = Math.max(1, Math.min(5, BASE_ERRORS[grade] + (extra || 0)));
    const sw = opts.sw || skillWeights(opts.p, grade);
    // only aim at mistake types this grade can have
    const w = {};
    Object.keys(weights || {}).forEach(function (k) { if (injectors(k, grade).length) w[k] = weights[k] * (grade >= 6 ? ({ cap: 0.5, punct: 1.6, spell: 0.8, grammar: 1.5 })[k] || 1 : 1); });
    if (!Object.keys(w).length) { w.cap = 1; w.punct = 1; }
    const target = opts.target && skillOk(opts.target, grade) ? opts.target : null;
    for (let attempt = 0; attempt < 60; attempt++) {
      const tpl = pl.list[weightedIndex(pl.w)];
      const t = tokenize(tpl[1]());
      const answer = join(t);
      if (seen && seen.has(hash(answer)) && attempt < 50) continue;
      const used = new Set(), fixes = [];
      const push = function (f, fn) { fixes.push({ type: typeOf(fn), skill: f.skill || skillOf(fn), hint: f.hint, explain: f.explain, at: f.at }); };
      if (target && attempt < 45) {
        let planted = false;
        fnsForSkill(target).forEach(function (pair) { if (planted) return; const f = pair[0](t, used, grade, pair[1] || { sw: sw }); if (f) { push(f, pair[0]); planted = true; } });
        if (!planted) continue;
      }
      const limit = Math.max(1, Math.min(want, Math.floor(t.length / 2.5))); // keep short sentences readable
      for (let n = 0; n < 40 && fixes.length < limit; n++) {
        const fn = pickInjector(weighted(w), grade, sw);
        if (!fn) continue;
        const f = fn(t, used, grade, { sw: sw });
        if (f) push(f, fn);
      }
      const text = join(t);
      if (fixes.length && text !== answer) {
        if (track) markSeen(opts.p, answer);
        return { id: "gen-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), grade: grade, text: text, answer: answer, fixes: fixes, source: "gen", key: hash(answer), target: target && fixes[0].skill === target ? target : null };
      }
    }
    return null;
  }
  const TYPE_OF = new Map();
  Object.keys(INJECT).forEach(function (k) { INJECT[k].forEach(function (f) { TYPE_OF.set(f, k); }); });
  const typeOf = function (fn) { return TYPE_OF.get(fn); };

  /* ---------- the growing bank (Claude-written sentences) ---------- */
  const BANK_KEY = "brainDojo.bank";
  let bank = loadBank();     // { "bank-g4": { items: [...], updatedAt } }
  function loadBank() { try { return JSON.parse(localStorage.getItem(BANK_KEY) || "{}"); } catch (e) { return {}; } }
  function saveBankLocal() { try { localStorage.setItem(BANK_KEY, JSON.stringify(bank)); } catch (e) { /* ignore */ } }
  function bankItems(grade) { return ((bank["bank-g" + grade] || {}).items) || []; }
  function applyRemoteBank(docId, data) {
    if (!data || !Array.isArray(data.items)) return;
    const mine = (bank[docId] || {}).items || [];
    const ids = new Set(mine.map(function (x) { return x.id; }));
    const merged = mine.concat(data.items.filter(function (x) { return x && !ids.has(x.id); }));
    bank[docId] = { items: merged.slice(-150), updatedAt: Math.max(data.updatedAt || 0, (bank[docId] || {}).updatedAt || 0) };
    saveBankLocal();
  }
  function addToBank(grade, items) {
    const id = "bank-g" + grade;
    const cur = bankItems(grade);
    bank[id] = { items: cur.concat(items).slice(-150), updatedAt: Date.now() };
    saveBankLocal();
    if (BD.Sync) BD.Sync.saveBank(id, bank[id]);
  }

  /* Check what Claude wrote before it reaches a child. */
  function valid(x, grade) {
    if (!x || typeof x.text !== "string" || typeof x.answer !== "string" || !Array.isArray(x.fixes)) return false;
    if (x.text.length > 180 || x.answer.length > 180 || x.text.length < 12) return false;
    if (!/[.?!]"?$/.test(x.answer.trim())) return false;
    if (!x.fixes.length || x.fixes.length > 5) return false;
    if (x.fixes.some(function (f) { return !f || !BD.FIX_TYPES[f.type] || typeof f.hint !== "string" || typeof f.explain !== "string"; })) return false;
    const a = BD.SentenceGame.norm(x.text).split(" "), b = BD.SentenceGame.norm(x.answer).split(" ");
    if (a.length !== b.length) return false; // every fix changes a word or a mark, never adds/removes words
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff >= 1 && diff <= x.fixes.length;
  }

  let generating = false, lastTry = 0;
  /* Ask Claude for new sentences when the unseen bank for this grade runs low. */
  function topUp(p, grade) {
    const sampler = BD.Sensei && BD.Sensei.sampler();
    if (generating || Date.now() - lastTry < 90000 || !sampler || typeof sampler.json !== "function") return;
    const seen = new Set(p.seenSentences);
    const fresh = bankItems(grade).filter(function (x) { return !seen.has(x.id); }).length;
    if (fresh >= 10) return;
    generating = true; lastTry = Date.now();
    const w = typeWeights(p, grade);
    const focus = Object.keys(w).sort(function (a, b) { return w[b] - w[a]; }).slice(0, 2).map(function (k) { return BD.FIX_TYPES[k].label; });
    const weak = weakSkill(p, grade);
    const n = Math.max(1, Math.min(5, BASE_ERRORS[grade] + BD.Coach.sentLevel(p, grade)));
    const nearest = BD.SENTENCES.some(function (s) { return s.grade === grade; }) ? grade : (grade < 3 ? 3 : 7);
    const examples = BD.SENTENCES.filter(function (s) { return s.grade === nearest; }).slice(0, 2).map(function (s) { return JSON.stringify({ text: s.text, answer: Array.isArray(s.answer) ? s.answer[0] : s.answer, fixes: s.fixes }); }).join("\n");
    const prompt = [
      "Write 8 NEW sentence-correction exercises for a homeschool student in " + BD.gradeLabel(grade) + "." + (grade <= 0 ? " Keep sentences 3 to 6 short, simple words; only capital letters and end marks." : ""),
      "Each one is a sentence (8 to 18 words) with mistakes planted in it, plus the corrected sentence.",
      "Rules:",
      "- Plant " + n + " mistakes per sentence (one fewer or one more is fine). Each mistake changes ONE word or ONE punctuation mark. Never add or remove whole words; the text and answer must have the same number of words.",
      "- Mistake types: cap (capitalization), punct (end marks, commas, apostrophes, quotation marks), spell (misspelling or wrong sound-alike word), grammar (verb agreement, verb tense, pronoun case).",
      "- Focus most on: " + focus.join(" and ") + (weak ? " (especially " + SKILLS[weak][1] + ")" : "") + ".",
      "- Use " + BD.gradeLabel(grade) + " vocabulary and rules. Topics: animals, sports, karate, family, science, history, holidays, places in the USA. Use real US cities and states.",
      "- The corrected answer must be the one clear, standard correction. Avoid sentences where a comma is optional.",
      "- hint: a gentle nudge that doesn't say the fix. explain: the rule in one short kid-friendly sentence.",
      "Reply with only a JSON array of objects shaped like these examples:",
      examples
    ].join("\n");
    sampler.json(prompt, { cache: false }).then(function (arr) {
      if (!Array.isArray(arr)) return;
      const good = arr.filter(function (x) { return valid(x, grade); }).map(function (x) {
        return { id: "ai-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), grade: grade, text: x.text.trim(), answer: x.answer.trim(),
          fixes: x.fixes.map(function (f) { return { type: f.type, hint: String(f.hint).slice(0, 200), explain: String(f.explain).slice(0, 300) }; }), source: "ai" };
      });
      if (good.length) addToBank(grade, good);
    }).catch(function (e) {
      if (e && ["not_granted", "sampling_disabled", "not_declared"].indexOf(e.code) !== -1) lastTry = Date.now() + 3600000;
    }).then(function () { generating = false; });
  }

  /* Choose a round: unseen hand-written and Claude-written sentences that
     match weak spots, topped up with freshly generated ones. When one skill
     is weak, about half the generated sentences "train" it.
     The returned array has .training = { skill, label } or null. */
  function round(p, grade, size, focus) {
    const w = typeWeights(p, grade, focus);
    const sw = skillWeights(p, grade);
    const train = weakSkill(p, grade, focus);
    if (train) w[SKILLS[train][0]] = (w[SKILLS[train][0]] || 1) * 1.5;
    const seenIds = new Set(p.seenSentences || []), seen = seenSet(p);
    const first = function (s) { return Array.isArray(s.answer) ? s.answer[0] : s.answer; };
    const curated = BD.SENTENCES.filter(function (s) { return s.grade === grade; }).concat(bankItems(grade))
      .filter(function (s) { return !seenIds.has(s.id) && !seen.has(hash(first(s))); })
      .map(function (s) {
        const score = s.fixes.reduce(function (a, f) { return a + (w[f.type] || 1); }, 0) / s.fixes.length;
        return { s: s, score: score * (0.75 + Math.random() * 0.5) };
      })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (x) { return x.s; });
    const out = curated.slice(0, Math.min(train ? 2 : 5, size));
    out.forEach(function (s) { markSeen(p, first(s)); });
    const extra = BD.Coach ? BD.Coach.sentLevel(p, grade) : 0;
    let targets = train ? Math.max(1, Math.round((size - out.length) / 2)) : 0;
    let guard = 0;
    while (out.length < size && guard++ < 40) {
      const g = make(grade, w, extra, { p: p, sw: sw, target: targets > 0 ? train : null });
      if (g) { out.push(g); if (g.target) targets--; }
    }
    // shuffle
    const res = out.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; });
    res.training = train ? { skill: train, label: SKILLS[train][1] } : null;
    return res;
  }

  /* A "which sentence is written correctly?" choice (for quick questions). */
  function choice(grade, p) {
    const it = make(grade, { cap: 1, punct: 1, spell: 1, grammar: 1 }, 0, { p: p });
    return it ? { right: it.answer, wrong: [it.text], item: it } : null;
  }

  /* Keep saved fields tidy (called by BD.Store's sanitize). */
  function sanitize(p) {
    if (!p || typeof p !== "object") return p;
    const okHash = /^[0-9a-z]{1,8}$/;
    if (!Array.isArray(p.sentSeen)) p.sentSeen = [];
    else { const s = new Set(); p.sentSeen = p.sentSeen.filter(function (h) { if (typeof h !== "string" || !okHash.test(h) || s.has(h)) return false; s.add(h); return true; }).slice(0, SEEN_CAP); }
    const sk = {};
    if (p.sentSkill && typeof p.sentSkill === "object" && !Array.isArray(p.sentSkill)) Object.keys(p.sentSkill).forEach(function (k) { const v = p.sentSkill[k]; if (SKILLS[k] && typeof v === "string" && /^[01]{1,12}$/.test(v)) sk[k] = v; });
    p.sentSkill = sk;
    return p;
  }
  function resetSession() { MEM.type = {}; MEM.skill = {}; MEM.seen = new Set(); }

  return { make: make, round: round, topUp: topUp, applyRemoteBank: applyRemoteBank, bankItems: bankItems, valid: valid, TEMPLATES: T,
    note: note, sanitize: sanitize, weakSkill: weakSkill, skillWeights: skillWeights, typeWeights: typeWeights, hash: hash, markSeen: markSeen,
    choice: choice, resetSession: resetSession, SKILLS: SKILLS, skillLabel: function (s) { return SKILLS[s] ? SKILLS[s][1] : ""; }, tokenize: tokenize };
})();
