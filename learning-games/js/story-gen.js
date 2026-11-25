/* STORY GENERATOR — endless Story Scrolls passages
   ================================================
   Builds new reading passages in the same shape as BD.PASSAGES, so the
   reading game never runs out and never has to repeat a story.

   - Every passage comes from a numeric seed. The id "sg-<grade>-<seed>" is
     enough to rebuild the exact same passage (BD.StoryGen.fromId), so nothing
     extra has to be saved: p.seenPassages already remembers what was read.
   - Genres: realistic fiction, dojo stories, animal facts, how-to texts,
     community helpers and "long ago" history. Each is a set of story beats
     with many phrasings and slots (names, places, things, facts), and grows
     longer and richer with the grade band (Pre-K/K, 1-2, 3-5, 6-8).
   - Questions come from the same slots as the text, so every sample answer
     and its keys match what the passage really says.
   - pick() steers toward the question type a student misses most, using the
     saved p.readRecent and a session-only memory (note()), and mixes genres.

   Template mini-language (used in all the tables below):
     {name} {He} {his} ...   slot values ({Cap} capitalizes, {a:x} adds a/an)
     [one|two|three]         pick one phrasing
     ^word  ^two_words       a vocabulary word that can be asked about
     "#flag text"            choosing this phrasing sets a flag
     "@2 text"               phrasing only for band 2 and up
*/
window.BD = window.BD || {};

BD.StoryGen = (function () {
  "use strict";

  /* ---------- seeded random ---------- */
  let rnd = Math.random;
  function prng(a) {
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function P(a) { return a[Math.floor(rnd() * a.length)]; }
  function chance(x) { return rnd() < x; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function an(w) { return (/^[aeiou]/i.test(w) && !/^(uni|use|eu|one)/i.test(w) ? "an " : "a ") + w; }
  function bandOf(g) { return g <= 0 ? 0 : g <= 2 ? 1 : g <= 5 ? 2 : 3; }
  /* "" = every band, "2" = band 2 only, "1-2" = range, "2+" = 2 and up */
  function inBand(spec, b) {
    spec = spec == null ? "" : String(spec);
    if (spec === "") return true;
    if (/\+$/.test(spec)) return b >= +spec.slice(0, -1);
    const m = spec.split("-");
    return m.length > 1 ? b >= +m[0] && b <= +m[1] : b === +m[0];
  }
  function stem(w) {
    w = w.toLowerCase();
    if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /(ch|sh|ss|x)es$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /[^s]s$/.test(w)) return w.slice(0, -1);
    return w;
  }

  /* ---------- templates ---------- */
  function fill(s, c, isText) {
    s = String(s).replace(/\[([^\[\]]*)\]/g, function (m, alts) { return P(alts.split("|")); });
    s = s.replace(/\{(a:|A:)?(\w+)\}/g, function (m, art, k) {
      let v = c[k], up = false;
      if (v === undefined) { const lk = k.charAt(0).toLowerCase() + k.slice(1); if (c[lk] !== undefined) { v = c[lk]; up = true; } }
      if (v === undefined) throw new Error("StoryGen: missing slot " + k);
      v = String(v);
      if (art) { v = an(v); if (art === "A:") up = true; }
      return up ? cap(v) : v;
    });
    if (isText) {
      return s.replace(/\^([A-Za-z_'-]+)/g, function (m, w) {
        w = w.replace(/_/g, " ");
        const lw = w.toLowerCase();
        if (c._voc.indexOf(lw) === -1) c._voc.push(lw);
        return w;
      });
    }
    return s.replace(/\^([A-Za-z_'-]+)/g, function (m, w) { return w.replace(/_/g, " "); });
  }
  /* A slot value is "text~key1|key2". Sets c[name], c[name+"K"] (answer keys), c[name+"N"] (short noun). */
  function slot(c, name, arr) {
    const v = (typeof arr === "string" ? arr : P(arr)).split("~");
    c[name] = fill(v[0], c);
    const last = c[name].replace(/\^/g, "").split(" ").pop().replace(/[^a-zA-Z'-]/g, "");
    c[name + "K"] = (v.length > 1 ? v[1] : stem(last)).toLowerCase();
    c[name + "N"] = v.length > 1 ? v[1].split("|")[0] : last.toLowerCase();
    return c[name];
  }

  /* ---------- people ---------- */
  const GIRLS = ("Maya Ava Lily Zoe Nora Ruby Mia Ivy Ella Grace Hana Lucia Amara Priya Sofia Chloe Layla Rosa Kimmy Mackenzie " +
    "Jada Mei Elena Tessa Naomi Isla Aria Leah Gemma Talia Nina Daisy June Keira Anya Lena Willa").split(" ");
  const BOYS = ("Leo Sam Eli Omar Ben Max Jack Theo Noah Mateo Kai Owen Ravi Jonah Luis Andre Felix Hugo Billy Tommy " +
    "Rylan Zumi Diego Ezra Kofi Jin Caleb Marcus Nico Aaron Milo Reed Isaac Dev Arlo Wyatt Emmett Tariq Simon Joel").split(" ");
  function pron(c, pre, girl) {
    c[pre + "he"] = girl ? "she" : "he"; c[pre + "his"] = girl ? "her" : "his"; c[pre + "him"] = girl ? "her" : "him";
    c[pre + "hers"] = girl ? "hers" : "his"; c[pre + "self"] = girl ? "herself" : "himself";
  }
  function newName(c, girl) {
    let n, tries = 0;
    do { n = P(girl ? GIRLS : BOYS); } while (tries++ < 20 && (n === c.name || n === c.pal));
    return n;
  }
  /* main character: {name} {he} {his} {him}; friend: {pal} {palhe} {palhis} {palhim} */
  function kid(c) { const g = chance(0.5); c.name = newName(c, g); c.nameK = c.name.toLowerCase(); pron(c, "", g); return c; }
  function pal(c) { const g = chance(0.5); c.pal = newName(c, g); c.palK = c.pal.toLowerCase(); pron(c, "pal", g); return c; }
  const HELPERS = [
    ["Grandpa", "grandpa|grandfather|grandad|granddad|papa|grandparent|grandpop", 0],
    ["Grandma", "grandma|grandmother|nana|granny|grandparent", 1],
    ["Mom", "mom|mother|mum|mama|mommy|parent", 1],
    ["Dad", "dad|father|papa|daddy|parent", 0],
    ["{his} big sister", "sister|sis", 1],
    ["{his} big brother", "brother|bro", 0],
    ["Aunt Rosa", "aunt|rosa", 1],
    ["Uncle Marco", "uncle|marco", 0]
  ];
  function helper(c, list) {
    const h = P(list || HELPERS);
    c.helper = fill(h[0], c); c.helperK = fill(h[1], c); pron(c, "h", !!h[2]);
    return c;
  }

  /* ================= WORD MEANINGS =================
     word: [lowest band to ask it, meaning ("It means ..."), answer keys] */
  const VOC = {
    sunny: [0, "the sun is shining", "sun|bright|light|shin|warm|not cloud|no cloud"],
    glad: [0, "happy", "happy|good|joy|pleas|cheer|smil|great"],
    grumpy: [0, "in a bad, cranky mood", "bad mood|cranky|mad|upset|grouch|crabby|angry|not happy|unhappy|annoy|sad"],
    proud: [0, "feeling good about something you did", "good|happy|did well|did it|great|glad|pleas"],
    shy: [0, "a little scared to talk to people", "scar|quiet|nervous|afraid|not talk|don't talk|doesn't talk|bashful|timid"],
    nervous: [0, "worried or a little scared", "worr|scar|afraid|fear|jitter|anxious|upset|shak"],
    tiny: [0, "very small", "small|little|teeny|baby|wee"],
    eager: [2, "really wanting to do something", "want|excit|look forward|can't wait|couldn't wait|ready|really like"],
    eagerly: [2, "in an excited way, really wanting to", "excit|want|happy|quick|fast|ready|can't wait|couldn't wait"],
    content: [3, "happy and satisfied", "happy|satisf|calm|peace|good|glad|relax"],
    "heart sank": [2, "suddenly feeling sad or worried", "sad|worr|upset|disappoint|bad|scared|unhappy|afraid|nervous"],
    panic: [3, "a sudden, strong feeling of fear", "fear|scared|afraid|worr|frighten|nervous|scary"],
    searched: [2, "looked carefully for something", "look|hunt|seek|check|find"],
    "retrace our steps": [1, "go back the same way we went before", "back|same way|again|where we went|where you went|before|return"],
    spotted: [2, "saw or noticed", "saw|see|notice|found|find|spy|look"],
    relieved: [1, "glad that a worry is over", "worry|worri|glad|happy|better|calm|relax|over|okay|safe"],
    grinned: [2, "smiled a big smile", "smil|happy|laugh"],
    frustrated: [2, "upset because something is not working", "upset|mad|angry|annoy|not work|wasn't work|didn't work|can't|couldn't|grumpy|bad|stuck|hard"],
    struggles: [2, "has a hard time", "hard|difficult|tough|trouble|not easy|can't|try"],
    determination: [3, "not giving up, even when something is hard", "give up|quit|keep|hard|stick|focus|try|persist"],
    withdrawn: [3, "quiet and keeping to yourself", "quiet|shy|alone|keep|to himself|to herself|not talk|didn't talk|not want|lonely|sad"],
    welcome: [3, "happy to be included and wanted", "includ|want|happy|belong|glad|accept|part of|home|friend|good"],
    impatient: [1, "not wanting to wait", "wait|hurry| now |rush|can't|couldn't|annoy|quick|fast|soon"],
    sprout: [1, "a new little plant just starting to grow", "plant|grow|baby|new|little|small|shoot|green|seedling|leaf"],
    harvest: [2, "the food or crops that are picked when they are ready", "food|crop|pick|vegetable|fruit|grew|grow|ready|plant|gather"],
    patience: [3, "being able to wait calmly", "wait|calm|without|time|slow|not rush|don't rush|not upset"],
    butterflies: [1, "a fluttery, nervous feeling in your stomach", "nervous|scared|worr|flutter|jitter|anxious|afraid|tummy|stomach"],
    applause: [2, "clapping to show you liked something", "clap|cheer"],
    vanished: [3, "went away completely", "gone|away|disappear|went|left|no longer|not there"],
    courage: [3, "being brave even when you are afraid", "brave|bold|not afraid|fear|scared|afraid|strong|hero"]
  };
  Object.assign(VOC, {
    hatch: [1, "come out of an egg", "egg|out|born|break"],
    habitat: [2, "the natural home of an animal or plant", "home|live|where|place"],
    nocturnal: [2, "awake and active at night", "night|dark"],
    herbivore: [2, "an animal that eats only plants", "plant"],
    carnivore: [2, "an animal that eats other animals", "meat|animal"],
    omnivore: [2, "an animal that eats both plants and animals", "both|plant|animal|everything|anything"],
    prey: [2, "an animal that is hunted and eaten by another animal", "hunt|eaten|food|caught|catch"],
    predators: [2, "animals that hunt other animals for food", "hunt|eat|catch|kill|chase"],
    adaptation: [3, "a body part or behavior that helps a living thing survive", "surviv|help|live|body|behav|trait"],
    camouflage: [2, "colors or patterns that help an animal blend in and hide", "blend|hide|hidden|match|see|disguise"],
    mammal: [2, "an animal with hair or fur that feeds its babies milk", "milk|hair|fur"],
    reptile: [2, "an animal with dry, scaly skin", "scal|skin"],
    amphibian: [2, "an animal that can live both in water and on land", "water|land|both"],
    insect: [2, "a small animal with six legs and three body parts", "six|6|leg|three|3"],
    remarkable: [3, "amazing or worth noticing", "amazing|special|unusual|surpris|notice|wow|great|impressive|interesting|cool"],
    talons: [2, "sharp, curved claws", "claw|nail|sharp"],
    proboscis: [2, "a long, tube-shaped mouth used like a straw", "mouth|tube|straw|tongue"],
    blubber: [2, "a thick layer of fat", "fat"]
  });
  Object.assign(VOC, {
    community: [1, "a group of people who live and work in the same area", "people|live|town|place|neighbor|together|group|area|city"],
    equipment: [1, "the tools and things needed to do a job", "tool|thing|need|gear|stuff|supplies"],
    dim: [1, "not very bright", "not bright|dark|low|faint|weak|little light"],
    common: [3, "found in many places or used by many people", "many|lot|most|everywhere|usual|normal|regular"],
    slates: [1, "small chalkboards", "chalkboard|board|write"],
    rare: [1, "hard to find, because there are not many", "not many|few|hard to find|uncommon|special|scarce"],
    automatic: [1, "working by itself", "itself|own|without|machine|no one|nobody|alone"],
    inventions: [2, "new things that people made for the first time", "new|first|made|create|thought of|machine|idea"],
    damp: [1, "a little wet", "wet|moist"],
    soggy: [1, "very wet and soft", "wet|soak|mush|soft"],
    crease: [2, "a line made by folding", "line|fold|mark"],
    dissolves: [2, "mixes into a liquid until you cannot see it", "mix|disappear|melt|gone|can't see|cannot see|blend"],
    moat: [2, "a ditch filled with water around a castle", "ditch|water|around|trench|hole"],
    invented: [1, "made something new for the first time", "new|first|made|create|thought of|came up|built|build"],
    costly: [1, "costing a lot of money", "money|expensive|cost|price|lot"],
    circuit: [3, "a complete loop that electricity flows through", "loop|path|circle|flow|electric|complete"]
  });
  Object.assign(VOC, {
    gently: [0, "in a soft and careful way", "soft|careful|slow|easy|not hard|light"],
    huge: [0, "very, very big", "big|large|giant|enormous"],
    whispered: [1, "spoke very quietly", "quiet|soft|low|softly"],
    giggled: [1, "laughed in a light, silly way", "laugh"],
    grumbled: [2, "complained in a low, unhappy voice", "complain|unhappy|grump|mad|upset|annoy|whin|mutter"],
    shallow: [1, "not deep", "not deep|low|little water"],
    burrows: [1, "holes or tunnels that animals dig to live in", "hole|tunnel|dig|underground|home"],
    den: [1, "a hidden home where a wild animal rests", "home|hidden|cave|hole|rest|sleep|shelter"],
    herds: [1, "big groups of animals that live together", "group|together|many|bunch"],
    flock: [1, "a group of birds or sheep", "group|together|bunch|many"],
    pouch: [1, "a pocket of skin or a bag", "pocket|bag|skin"],
    hover: [1, "stay in one place in the air", "one place|one spot|stay|still|air|float"],
    deliver: [1, "bring something to someone", "bring|give|take|drop off|carry"],
    rescue: [1, "save someone from danger", "save|help|danger"],
    protect: [1, "keep safe", "safe|guard|keep"],
    rinse: [1, "wash with clean water", "wash|water|clean"],
    scrub: [1, "rub hard to clean", "rub|clean|wash"],
    gather: [1, "bring things together in one place", "collect|together|get|bring|pick"],
    plenty: [1, "a lot, or more than enough", "lot|enough|many|much"],
    curious: [2, "wanting to learn or know more", "learn|knows|find out|wonder|interest|question"],
    noticed: [1, "saw or became aware of", "saw|see|spot|realiz|found|look|aware"],
    suggested: [2, "gave an idea", "idea|said|told|advice|recommend"],
    trembled: [2, "shook a little", "shook|shake|shaking|shiver|wobbl"],
    fluttered: [2, "moved with quick, light flaps", "flap|flutter|wiggle|move|shake|quick"],
    sturdy: [2, "strong and hard to knock over", "strong|solid|firm|steady|tough"],
    cozy: [0, "warm and comfy", "warm|comf|snug|soft|nice"],
    yummy: [0, "tasting very good", "taste|good|delicious|tasty|yum"],
    wobbly: [0, "shaky and not steady", "shak|not steady|wiggl|wobbl|unsteady"],
    focus: [1, "paying close attention to one thing", "attention|concentrat|think|mind|careful|one thing"],
    respect: [1, "showing that you care about and honor someone", "care|honor|polite|kind|value|manners|nice"],
    dojo: [1, "a place where people practice karate", "karate|martial|practice|train|school|class|place"],
    kata: [1, "a set of karate moves done in order", "move|order|pattern|form|set|routine|step"],
    kiai: [1, "a short, loud shout made with a karate move", "shout|yell|loud|scream|voice"],
    "self-control": [2, "being in charge of what you do and say", "control|charge|calm|stop|choose|careful|behav"],
    confidence: [2, "believing in yourself", "believ|sure|trust|brave|yourself|can do"],
    sportsmanship: [2, "being fair and kind when you win or lose", "fair|kind|win|lose|nice|respect|good sport"],
    gracious: [3, "kind and polite, even when it is hard", "kind|polite|nice|respect|good|fair"],
    demonstration: [2, "a show that teaches how something is done", "show|perform|present|display|teach"],
    accident: [1, "something bad that happens without meaning to", "not mean|didn't mean|did not mean|mistake|by accident|oops|not on purpose"],
    guilty: [2, "feeling bad because you did something wrong", "bad|wrong|sorry|shame|bad about"],
    confessed: [2, "told the truth about something you did", "told|truth|admit|said|tell"],
    honest: [1, "telling the truth", "truth|true|not lying|not lie|honest"],
    honesty: [3, "telling the truth", "truth|true|not lying|not lie"],
    embarrassed: [2, "feeling silly or ashamed in front of others", "silly|ashamed|shy|uncomfortable|red|awkward|bad"],
    delicious: [1, "tasting very good", "taste|good|yummy|tasty"],
    recipe: [2, "directions for making a food", "direction|instruction|steps|how to|make|cook"],
    measured: [2, "found out how much of something there is", "how much|amount|cup|spoon|size|count|exact"],
    ingredient: [2, "one of the foods that go into a recipe", "food|thing|part|recipe|go into|put in"],
    exhausted: [2, "very, very tired", "tired|sleepy|worn|no energy"],
    grateful: [2, "thankful", "thank|appreciat|glad|happy"],
    kindness: [2, "being nice and caring to others", "nice|caring|care|kind|friendly|help"],
    disappointed: [1, "sad because something did not happen the way you hoped", "sad|upset|let down|not happy|unhappy|hoped|wanted"],
    discouraged: [2, "feeling like giving up", "give up|quit|sad|hopeless|down|not want|upset"],
    collapsed: [2, "fell down suddenly", "fell|fall|broke|crash|down|tumbl"],
    drizzle: [2, "a light rain", "light rain|little rain|rain|sprinkl"],
    downpour: [2, "a very heavy rain", "heavy rain|lot of rain|hard rain|rain"],
    gloomy: [3, "dark and sad-looking", "dark|sad|gray|grey|dull|dreary"],
    flexible: [3, "able to change plans easily", "change|adjust|easy|adapt|bend"],
    argued: [2, "disagreed in an angry way", "fight|disagree|yell|angry|mad|quarrel|fought"],
    argument: [2, "an angry disagreement", "fight|disagree|yell|angry|mad|quarrel"],
    customers: [2, "people who buy things", "buy|bought|shopper|people|pay"],
    donated: [2, "gave something to help others", "gave|give|help|share"],
    apologized: [2, "said you were sorry", "sorry"]
  });

  /* ================= REALISTIC FICTION =================
     beats: [bands, chance, "flags", ...phrasings]   (flags: "x" sets x, "?x" needs x, "?!x" needs not x)
     qs:    [type, bands, "needs", question(s), answer, hint, ...key groups] */
  const SAD = "sad|upset|worr|scar|bad|cry|unhappy|mad|nervous|afraid|frown|not happy|frustrat|disappoint|panic|terrible|awful|lonely|angry";
  const HAPPY = "happy|glad|good|great|excit|smil|better|relie|joy|proud|thank|cheer|thrill|wonderful|awesome|fun|grin";
  const STORY = [];

  STORY.push({ k: "lost", g: "story",
    set: function (c) {
      kid(c); pal(c); helper(c);
      slot(c, "thing", ["red kite~kite", "blue mitten~mitten|glove", "teddy bear~bear|teddy", "toy truck~truck", "soccer ball~ball", "library book~book",
        "green hat~hat|cap", "water bottle~bottle", "toy dinosaur~dinosaur|dino", "yellow scarf~scarf", "stuffed bunny~bunny|rabbit", "jump rope~rope",
        "toy boat~boat", "toy robot~robot", "purple sweater~sweater|sweatshirt|jacket", "baseball glove~glove|mitt", "toy airplane~airplane|plane", "rubber duck~duck"]);
      const pl = P([
        ["park~park|playground", ["under a bench~bench", "in the tall grass~grass", "behind a big tree~tree", "next to the pond~pond|water", "by the water fountain~fountain"]],
        ["beach~beach|sand|ocean", ["under a beach towel~towel", "behind a sand dune~dune|sand", "next to a big rock~rock", "by the lifeguard stand~lifeguard|stand", "under a pile of seaweed~seaweed"]],
        ["backyard~yard|backyard|home|house", ["under the porch steps~porch|step|stair", "in a pile of leaves~leaves|leaf|pile", "behind the shed~shed", "under a bush~bush|shrub", "inside the dog house~dog house|doghouse"]],
        ["playground~playground|school|park", ["under the slide~slide", "by the swings~swing", "in the sandbox~sandbox|sand", "in the lost and found box~lost and found|box"]],
        ["pumpkin farm~farm|pumpkin", ["between two big pumpkins~pumpkin", "next to a hay bale~hay|bale", "by the corn maze~corn|maze"]],
        ["campground~camp|campground|camping|woods|forest", ["under the picnic table~table", "next to the tent~tent", "behind a log~log", "by the campfire ring~fire|ring"]]]);
      slot(c, "place", pl[0]); slot(c, "spot", pl[1]);
      slot(c, "distract", ["tie {his} shoe~shoe|tie|lace", "get a drink of water~drink|water|thirst", "look at a ladybug~ladybug|bug", "pet a friendly dog~dog|pet|pupp",
        "help {pal} with {palhis} shoe~help|{palK}|friend|shoe", "watch a squirrel~squirrel", "eat a snack~snack|eat|food"]);
      slot(c, "advice", ["stay calm and look slowly, one spot at a time~calm|slow|one spot|look|careful", "^retrace_our_steps~retrace|back|steps|again|way|went", "walk back the way we came~back|way|walk|came|again"]);
      c.subject = "lost:" + c.thingN;
    },
    title: ["{Name}'s Lost {ThingN}", "The Missing {ThingN}", "Where Did It Go?", "Found at Last", "{Name} and the {Thing}", "The {ThingN} Hunt", "Lost and Found"],
    beats: [
      ["0", 1, "", "{Name} has {a:thing}. {He} takes it to the {place}.", "{Name} brings {his} {thing} to the {place}.", "{Name} and {helper} go to the {place}. {Name} brings {his} {thing}."],
      ["0", 0.5, "", "{Name} plays and plays.", "It is a ^sunny day."],
      ["0", 1, "", "Oh no! The {thingN} is gone.", "Uh-oh. Where is the {thingN}?", "Then {Name} cannot find the {thingN}."],
      ["0", 0.6, "", "{Name} looks and looks.", "{Name} feels sad.", "{He} looks up high and down low."],
      ["0", 1, "", "#nameFound {Name} finds it {spot}!", "#helperFound {Helper} finds it {spot}."],
      ["0", 0.8, "", "Now {Name} is ^glad.", "{Name} gives the {thingN} a big hug.", "{Name} smiles a big smile."],
      ["1+", 1, "", "{Name} took {his} {thing} to the {place} with {helper}.", "On a [sunny|windy|bright|cool] [morning|afternoon|Saturday], {Name} went to the {place} with {helper} and {his} {thing}.",
        "@2 {Name} had been ^eager all week to bring {his} {thing} to the {place} with {helper}."],
      ["2+", 0.5, "", "The [sun was warm|breeze was gentle|sky was a clear, bright blue], and [birds were singing|leaves rustled overhead|other families were having fun nearby].",
        "@3 The air was warm, the sky was clear, and {Name} felt completely ^content."],
      ["1+", 0.7, "", "{He} played with it for a long time.", "For a while, {Name} had a wonderful time.", "@2 {Name} played happily until {his} cheeks were pink."],
      ["1+", 1, "", "#distract Then {Name} set the {thingN} down to {distract}. When {he} turned around, it was gone!", "When it was time to go home, {Name} could not find the {thingN} anywhere."],
      ["1+", 0.8, "", "{Name}'s eyes filled with tears.", "{Name} felt a lump in {his} throat.", "@2 {Name}'s ^heart_sank.", "@3 A wave of ^panic rose in {Name}'s chest."],
      ["1+", 1, "", "{He} looked [all around|everywhere {he} had played|high and low], but the {thingN} was not there.", "@2 {He} ^searched every place {he} could think of, but it was nowhere to be found."],
      ["2+", 0.4, "", "{He} even asked some other kids if they had seen it, but no one had."],
      ["1+", 0.9, "advice", "{Helper} said, \"Let's {advice}.\"", "@2 {Helper} put a hand on {his} shoulder and said, \"Let's {advice}.\""],
      ["1+", 1, "", "#helperFound A minute later, {helper} spotted it {spot}.", "#nameFound At last, {Name} saw something {spot}. It was the {thingN}!", "#nameFound @2 Finally, {Name} ^spotted the {thingN} {spot}."],
      ["1+", 1, "", "{Name} hugged the {thingN} and felt so ^relieved.", "{Name} let out a big sigh and hugged {helper}.", "@2 {Name} ^grinned from ear to ear."],
      ["2+", 0.7, "", "#keep From then on, {Name} kept {his} things close by.", "#keep After that, {Name} always kept a careful eye on {his} things.", "@3 That day, {Name} learned that staying calm works better than panicking."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} loses {his} {thingN}, and then it is found.", "Think about what happens to the {thingN}.", "{thingK}", "lost|lose|find|found|gone|look|missing"],
      ["main", "0", "", "Who is this story about?", "{Name} and {his} {thingN}.", "Who has the {thingN}?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?", "Tell what happens in this story in your own words."], "{Name} lost {his} {thingN} at the {place}, but it was found {spot}.", "Think about the beginning, the problem, and how it was fixed.", "{thingK}", "lost|lose|missing|gone|find|found|look|search"],
      ["main", "2+", "", ["What lesson can you learn from this story?", "What is the lesson of this story?"], "If you lose something, stay calm and look carefully, and ask for help if you need it.", "Think about what helped get the {thingN} back.", "calm|careful|slow|help|give up|keep look|patien|retrace|steps|try|close|track|watch|eye on"],
      ["main", "3", "", "What is the theme of this story?", "Staying calm and asking for help can solve a scary problem.", "What did {Name} learn from losing the {thingN}?", "calm|careful|slow|help|give up|patien|retrace|try|close|track|panic|worry"],
      ["detail", "0", "", "Where does {Name} take {his} {thingN}?", "To the {place}.", "Look at the beginning.", "{placeK}"],
      ["detail", "0", "", "What does {Name} lose?", "{His} {thing}.", "What is gone?", "{thingK}"],
      ["detail", "0", "", "Where is the {thingN} found?", "{Spot}.", "Look near the end.", "{spotK}"],
      ["detail", "0", "helperFound", "Who finds the {thingN}?", "{Helper} finds it.", "Look at who finds it.", "{helperK}"],
      ["detail", "0", "nameFound", "Who finds the {thingN}?", "{Name} finds it.", "Look at who finds it.", "{nameK}"],
      ["detail", "1+", "", "Where did {Name} bring {his} {thingN}?", "{He} brought it to the {place}.", "Reread the first sentence.", "{placeK}"],
      ["detail", "1+", "", "Where was the {thingN} found?", "It was found {spot}.", "Find the part where the {thingN} turns up.", "{spotK}"],
      ["detail", "1+", "distract", "Why did {Name} put the {thingN} down?", "To {distract}.", "Reread the part just before the {thingN} went missing.", "{distractK}"],
      ["detail", "1+", "helperFound", "Who found the {thingN}?", "{Helper} found it.", "Find who spotted it.", "{helperK}"],
      ["detail", "1+", "nameFound", "Who found the {thingN}?", "{Name} found it.", "Find who spotted it.", "{nameK}"],
      ["detail", "1+", "advice", "What did {helper} say they should do?", "\"Let's {advice}.\"", "Find what {helper} said.", "{adviceK}"],
      ["infer", "0", "", "How does {Name} feel when the {thingN} is gone?", "Sad and worried.", "How would you feel?", SAD],
      ["infer", "0", "", "How does {Name} feel at the end?", "Happy and glad.", "Look at the last part.", HAPPY + "|hug"],
      ["infer", "1+", "", "How did {Name} feel when {he} could not find the {thingN}?", "{He} felt sad and worried because the {thingN} was gone.", "Look at what {Name}'s body did when it went missing.", SAD],
      ["infer", "1+", "", "How did {Name} feel at the end of the story?", "{He} felt relieved and happy that the {thingN} was back.", "Reread the last few sentences.", HAPPY + "|calm"],
      ["infer", "2+", "keep", "Why do you think {Name} kept {his} things close after that day?", "Because {he} did not want to lose them again.", "Think about how losing the {thingN} felt.", "lose|lost|again|safe|not want|don't want|didn't want|miss|gone|careful"]
    ] });

  const SKILLS = [
    ["ride a bike~bike|ride|cycl", "the bike wobbled and tipped over", "wobbl|tip|fell|fall|crash", "look ahead instead of down at the wheel", "ahead|forward|not down|up", "pedaled all the way down the sidewalk", "pedal|ride|rode|sidewalk"],
    ["jump rope~jump|rope", "the rope caught on {his} feet", "caught|trip|feet|foot|tangl|stuck", "jump just a little and keep a steady beat", "little|small|steady|beat|rhythm|count", "jumped twenty times in a row", "twenty|20|jump"],
    ["swim across the pool~swim|pool", "{he} sank and swallowed some water", "sank|sink|swallow|water|under", "kick from the hips and keep {his} arms long", "kick|hip|arm", "swam all the way across the pool", "swam|swim|across"],
    ["whistle~whistl", "only air came out", "air|nothing|no sound|quiet", "make a small, round O with {his} lips", "lip|round|small|shape|circle", "made a clear, bright whistle", "whistl|sound|clear"],
    ["tie {his} shoes~tie|shoe|lace", "the loops kept slipping apart", "slip|apart|loop|fell|undone|loose", "make two bunny ears and cross them", "bunny|ear|loop|cross", "tied a neat bow all by {self}", "tie|tied|bow|knot"],
    ["ice skate~skat|ice", "{his} feet slid out from under {him}", "slid|slip|fell|fall|feet", "bend {his} knees and take small steps", "bend|knee|small|step|slow", "glided all the way around the rink", "glid|skat|around|rink"],
    ["do a cartwheel~cartwheel", "{he} landed in a heap on the grass", "land|fell|fall|heap|tumbl|crash", "put one hand down, then the other, and kick {his} legs up high", "hand|kick|leg|one|other", "did a cartwheel with straight legs", "cartwheel|straight"],
    ["juggle three balls~juggl|ball", "the balls bounced all over the floor", "drop|bounc|fell|floor|fall", "start with just two balls", "two|2|start|fewer|less", "kept all three balls in the air", "three|3|air|juggl"],
    ["play a song on the piano~piano|song|play", "{his} fingers kept hitting the wrong keys", "wrong|key|mistake|finger", "play slowly, one hand at a time", "slow|one hand|hand|time", "played the whole song without stopping", "play|song|whole|without|stop"],
    ["hula hoop~hula|hoop", "the hoop kept dropping to the ground", "drop|fell|fall|ground|down", "move {his} hips forward and back, not in circles", "hip|forward|back", "kept the hoop spinning for a whole minute", "spin|minute|kept|hoop"],
    ["fly a kite~kite|fly", "the kite crashed into the grass", "crash|fell|fall|grass|down", "run into the wind and let the string out slowly", "wind|run|string|slow|let out", "watched the kite soar above the trees", "soar|fly|flew|high|above|tree|up"],
    ["skateboard~skateboard|board|skat", "the board rolled away without {him}", "roll|away|fell|fall|slip", "keep {his} weight over the middle of the board", "weight|middle|center|balance", "rolled smoothly down the path", "roll|smooth|path|ride|rode"]
  ];
  STORY.push({ k: "skill", g: "story",
    set: function (c) {
      kid(c); pal(c); helper(c, HELPERS.concat([["Coach Dee", "coach|dee", 1], ["{his} friend {pal}", "friend|{palK}", 0]]));
      const s = P(SKILLS);
      slot(c, "skill", s[0]); slot(c, "fail", s[1] + "~" + s[2]); slot(c, "tip", s[3] + "~" + s[4]); slot(c, "win", s[5] + "~" + s[6]);
      c.subject = "skill:" + c.skillN;
    },
    title: ["{Name} Learns to {Skill}", "Try, Try Again", "{Name} Does Not Give Up", "Practice Pays Off", "One More Try", "{Name}'s Big Goal"],
    beats: [
      ["0", 1, "", "{Name} wants to {skill}.", "{Name} is learning to {skill}."],
      ["0", 1, "", "{He} tries, but {fail}.", "It is hard. At first, {fail}."],
      ["0", 0.6, "", "{Name} feels ^grumpy.", "{Name} wants to stop.", "{Name} feels sad."],
      ["0", 1, "", "{Helper} shows {him} how to {tip}.", "{Helper} helps {him} {tip}."],
      ["0", 0.8, "", "{Name} tries again and again.", "{Name} keeps trying."],
      ["0", 1, "", "Now {Name} can {skill}! {He} feels ^proud.", "Now {Name} can do it! {He} feels ^proud."],
      ["1+", 1, "", "{Name} [really|truly] wanted to learn to {skill}.", "@2 All summer, {Name} had dreamed of being able to {skill}.", "@2 {Name}'s friends could {skill}, and {Name} wanted to learn too."],
      ["1+", 1, "", "On the first try, {fail}.", "{He} tried, but {fail}.", "@2 {Name}'s first attempt did not go well, because {fail}."],
      ["1+", 0.7, "", "{He} tried again and again, but it did not get easier.", "@2 After a dozen more tries, {Name} was ^frustrated."],
      ["1+", 0.8, "quit", "{Name} wanted to give up.", "\"I will never get this,\" {Name} [said|groaned|sighed]."],
      ["1+", 1, "", "{Helper} sat down beside {him} and showed {him} how to {tip}.", "@2 {Helper} explained that it helps to {tip}."],
      ["2+", 0.6, "", "\"Everyone ^struggles at first,\" {hhe} said. \"Keep practicing.\""],
      ["1+", 1, "", "{Name} practiced every day [after school|before dinner|after breakfast] for a week.", "@2 Every day for a week, {Name} practiced, even when {he} felt tired.", "@3 {Name} practiced with ^determination, a little bit every single day."],
      ["1+", 1, "", "Finally, {he} {win}!", "@2 At the end of the week, {Name} {win}!"],
      ["1+", 1, "", "{Name} felt so ^proud.", "{Name} cheered and felt very ^proud.", "@2 {Name} could not stop smiling."],
      ["2+", 0.6, "", "{Name} learned that practice [makes a big difference|really pays off].", "@3 {Name} realized that each mistake had taught {him} something."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} learns to {skill}.", "What does {Name} want to do?", "{skillK}"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Who is learning something new?", "{nameK}"],
      ["main", "1+", "", ["What is this story mostly about?", "What happens in this story?"], "{Name} kept practicing until {he} learned to {skill}.", "Think about what {Name} wanted and how it turned out.", "{skillK}", "practic|learn|tried|try|keep|kept|again|finally|did it|able|could"],
      ["main", "2+", "", ["What lesson does this story teach?", "What lesson does {Name} learn?"], "If you keep practicing and don't give up, you can learn hard things.", "Think about what finally worked for {Name}.", "practic|give up|keep|try|quit|stop|patien|hard work|again"],
      ["main", "3", "", "What is the theme of this story?", "Hard work and practice help you reach your goals, even after mistakes.", "How did {Name} change from the first try to the end?", "practic|give up|keep|try|quit|patien|hard work|mistake|persever|goal"],
      ["detail", "0", "", "What happens when {Name} tries?", "{Fail}.", "Look at the second sentence.", "{failK}"],
      ["detail", "0", "", "Who helps {Name}?", "{Helper}.", "Who shows {him} how?", "{helperK}"],
      ["detail", "1+", "", "What happened on {Name}'s first try?", "{Fail}.", "Find the words \"first\" or \"tried.\"", "{failK}"],
      ["detail", "1+", "", "What tip did {helper} give {Name}?", "To {tip}.", "Find the part where {helper} helps.", "{tipK}"],
      ["detail", "1+", "", "Who helped {Name}?", "{Helper} helped {him}.", "Find who sat with {Name}.", "{helperK}"],
      ["detail", "1+", "", "How often did {Name} practice?", "Every day.", "Find the word \"practiced.\"", "every day|each day|daily|week|every single"],
      ["detail", "1+", "", "What could {Name} do at the end?", "{He} {win}.", "Reread the end of the story.", "{winK}"],
      ["infer", "0", "", "How does {Name} feel at the end?", "Proud and happy.", "Look at the last sentence.", HAPPY],
      ["infer", "0", "", "Why is it hard for {Name} at first?", "Because {fail}.", "What happens when {he} tries?", "{failK}|new|learn|first"],
      ["infer", "1+", "", "How did {Name} feel after {his} first tries?", "{He} felt frustrated and wanted to give up.", "Look at what {Name} said or did after it went wrong.", SAD + "|give up|quit|grumpy|annoy"],
      ["infer", "1+", "", "Why did {Name} feel proud at the end?", "Because {he} finally learned to {skill} after working hard.", "Think about how hard {Name} worked.", "learn|did it|practic|work|could|able|finally|succe|{winK}|{skillK}"],
      ["infer", "2+", "", "What would have happened if {Name} had given up?", "{He} would never have learned to {skill}.", "Think about what the practice gave {him}.", "never|not learn|wouldn't|would not|couldn't|could not|not be able|still| no "]
    ] });

  STORY.push({ k: "newkid", g: "story",
    set: function (c) {
      kid(c); pal(c);
      const pr = P([["lunch", "sat alone at the end of a long table~alone|by himself|by herself|by themself|table|no one|nobody|lonely"],
        ["recess", "stood by the fence all by {palself}~alone|by himself|by herself|fence|no one|nobody|lonely"],
        ["recess", "sat on a bench and watched the other kids play~alone|bench|watch|by himself|by herself|no one|nobody|lonely"]]);
      c.when = pr[0]; slot(c, "spot", pr[1]);
      slot(c, "game", ["play tag~tag", "play four square~four square|ball", "play on the swings~swing", "play kickball~kickball|ball", "jump rope~rope|jump", "play hide-and-seek~hide|seek", "build a fort out of sticks~fort|stick|build"]);
      slot(c, "like", ["drawing dragons~draw|dragon", "collecting rocks~rock|collect", "reading comic books~comic|read|book", "space and planets~space|planet", "baking cookies~bak|cookie",
        "soccer~soccer", "karate~karate", "dinosaurs~dinosaur|dino", "building with blocks~block|build", "funny jokes~joke|funny"]);
      c.subject = "newkid:" + c.gameN;
    },
    title: ["The New Kid", "{Pal}'s First Day", "A New Friend", "Room for One More", "{Name} Says Hello", "Do You Want to Play?"],
    beats: [
      ["0", 1, "", "A new kid comes to {Name}'s class. {Palhis} name is {pal}.", "{Pal} is new at school."],
      ["0", 1, "", "{Pal} sits all alone.", "At {when}, {pal} is all alone."],
      ["0", 0.6, "", "{Pal} looks sad.", "{Pal} looks ^shy."],
      ["0", 1, "", "{Name} says, \"Do you want to {game}?\"", "{Name} asks {pal} to {game}."],
      ["0", 1, "", "{Pal} smiles. Now they are friends.", "They {game} together. Now they are friends!"],
      ["1+", 1, "", "On Monday, a new student named {pal} joined {Name}'s class.", "@2 Halfway through the year, a new student named {pal} moved to town and joined {Name}'s class."],
      ["1+", 1, "", "At {when}, {pal} {spot}."],
      ["1+", 0.8, "", "{Palhe} looked down at {palhis} shoes and did not talk to anyone.", "@2 {Pal} kept {palhis} eyes on the floor and looked ^nervous.", "@3 {Pal} seemed ^withdrawn, hardly looking up at anyone."],
      ["1+", 0.7, "", "{Name} remembered how scary it felt to be new.", "@2 {Name} remembered {his} own first day at a new school, when {he} had not known a single person."],
      ["1+", 1, "", "{Name} walked over and asked, \"Do you want to {game} with us?\"", "@2 {Name} took a deep breath, walked over, and invited {pal} to {game}."],
      ["1+", 1, "", "{Pal} smiled and said yes.", "@2 {Pal}'s face lit up, and {palhe} ^eagerly said yes."],
      ["2+", 0.8, "like", "While they played, they found out that they both loved {like}.", "@3 As they talked, the two discovered they shared a love of {like}."],
      ["1+", 1, "", "Soon, {Name} and {pal} were good friends.", "@2 By the end of the week, {Name} and {pal} were best friends."],
      ["2+", 0.6, "", "{Name} learned that one kind act can make a big difference.", "@3 {Name} realized that it takes only a little courage to make someone feel ^welcome."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} makes friends with a new kid.", "What does {Name} do for {pal}?", "friend|play|kind|nice|new"],
      ["main", "0", "", "Who is new in this story?", "{Pal} is new.", "Look at the first sentence.", "{palK}"],
      ["main", "1+", "", ["What is this story mostly about?", "What happens in this story?"], "{Name} was kind to a new student named {pal}, and they became friends.", "Think about what {Name} did and how it turned out.", "kind|nice|invit|ask|talk|play|friend|welcome|help", "{palK}|new|friend|student|kid"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "Being kind and including others can make someone feel welcome and help you make friends.", "Think about how one small choice changed {pal}'s day.", "kind|nice|includ|welcome|friend|help|care|left out|alone"],
      ["detail", "0", "", "What is the new kid's name?", "{Pal}.", "Look at the beginning.", "{palK}"],
      ["detail", "0", "", "What does {Name} ask {pal} to do?", "To {game}.", "What does {Name} say?", "{gameK}"],
      ["detail", "1+", "", "Who was the new student?", "{Pal} was the new student.", "Reread the first sentence.", "{palK}"],
      ["detail", "1+", "", "What did {pal} do at {when}?", "{Palhe} {spot}.", "Find the word \"{when}.\"", "{spotK}"],
      ["detail", "1+", "", "What did {Name} invite {pal} to do?", "To {game}.", "Find what {Name} asked.", "{gameK}"],
      ["detail", "2+", "like", "What did {Name} and {pal} both love?", "They both loved {like}.", "Find what they found out while they played.", "{likeK}"],
      ["infer", "0", "", "How does {pal} feel at first?", "Lonely and sad.", "{Pal} is all alone. How would you feel?", SAD + "|shy|alone|left out"],
      ["infer", "0", "", "How does {pal} feel at the end?", "Happy, because {palhe} has a friend.", "Look at the end.", HAPPY],
      ["infer", "1+", "", "How did {pal} feel on {palhis} first day? How do you know?", "{Palhe} felt lonely and nervous, because {palhe} was alone and did not talk to anyone.", "Look at what {pal} did at {when}.", SAD + "|shy|alone|left out|uncomfortable"],
      ["infer", "1+", "", "Why do you think {Name} invited {pal} to play?", "{He} knew it is hard to be new and wanted {pal} to feel welcome.", "Think about what {Name} remembered or noticed.", "new|scar|hard|lonely|alone|welcome|kind|nice|better|friend|includ|sad|remember"],
      ["infer", "2+", "", "How do you think {pal} felt when {Name} invited {palhim} to play?", "{Palhe} felt happy and thankful that someone was being friendly.", "Look at {pal}'s face when {palhe} answered.", HAPPY + "|welcome"]
    ] });

  const PLANTS = [["sunflower~sunflower|flower", "a tall sunflower with a bright yellow face~tall|yellow|flower|sunflower"], ["tomato~tomato", "bright red tomatoes~red|tomato"],
    ["pumpkin~pumpkin", "a big orange pumpkin~orange|pumpkin"], ["bean~bean", "long green beans~green|bean"], ["carrot~carrot", "crunchy orange carrots~orange|carrot|crunch"],
    ["lettuce~lettuce|salad", "crisp green lettuce~lettuce|green|salad"], ["zucchini~zucchini|squash", "a long green zucchini~zucchini|green|squash"], ["pea~pea", "sweet green peas~pea|green|sweet"],
    ["marigold~marigold|flower", "a row of bright orange marigolds~marigold|orange|flower"]];
  STORY.push({ k: "garden", g: "story",
    set: function (c) {
      kid(c); helper(c);
      const pl = P(PLANTS); slot(c, "plant", pl[0]); slot(c, "result", pl[1]);
      slot(c, "place", ["the backyard~yard|backyard|garden", "a big pot on the porch~pot|porch", "the school garden~school|garden", "a window box~window|box", "Grandma's garden~grandma|garden"]);
      slot(c, "shared", ["the neighbors~neighbor", "{his} whole family~family", "{his} friends~friend", "{his} teacher~teacher"]);
      c.subject = "garden:" + c.plantN;
    },
    title: ["{Name}'s {PlantN} Seeds", "Waiting for a Sprout", "The Little Seed", "Grow, Little Seed!", "{Name}'s Garden", "Good Things Take Time"],
    beats: [
      ["0", 1, "", "{Name} plants a {plantN} seed.", "{Name} and {helper} plant a {plantN} seed."],
      ["0", 1, "", "{Name} gives it water every day.", "{Name} waters the seed."],
      ["0", 0.7, "", "{He} waits and waits.", "Nothing happens. {Name} has to wait."],
      ["0", 1, "", "Then a ^tiny green sprout pops up!", "One day, a ^tiny green sprout comes up!"],
      ["0", 0.8, "", "Now {Name} has {result}.", "It grows and grows. Now {Name} has {result}."],
      ["1+", 1, "", "In the spring, {Name} and {helper} planted {plantN} seeds in {place}.", "@2 One spring morning, {Name} pressed some {plantN} seeds into the soft dirt in {place}."],
      ["1+", 0.8, "", "{Name} watered them every day.", "@2 Every morning, {Name} gave the seeds a drink from a little watering can."],
      ["1+", 1, "", "But day after day, nothing happened.", "@2 Days passed, but the soil stayed bare and brown."],
      ["1+", 0.8, "", "{Name} felt ^impatient.", "\"Why won't it grow?\" {Name} asked.", "@2 {Name} was so ^impatient that {he} checked the dirt ten times a day."],
      ["2+", 0.5, "dug", "Once, {he} even dug up a seed to look at it. It had a tiny white root, so {he} gently put it back.",
        "@3 One afternoon, {he} carefully dug up a single seed and found a tiny white root curling out of it, so {he} tucked it back into the soil."],
      ["1+", 1, "", "{Helper} said that seeds need water, sunshine, and time.", "@2 {Helper} smiled and explained that seeds need time to grow roots underground before anything pops up."],
      ["1+", 1, "", "At last, a tiny green ^sprout poked out of the ground.", "@2 Then one morning, a tiny green ^sprout pushed up through the soil."],
      ["1+", 0.7, "", "{Name} cheered with joy.", "{Name} ran inside to tell everyone."],
      ["2+", 0.7, "", "All summer, the plant grew bigger and stronger.", "@3 Over the summer, the little sprout grew into a strong, leafy plant."],
      ["1+", 1, "", "By the end of summer, {Name} had {result}.", "@2 By August, {Name} had {result}."],
      ["2+", 0.6, "share", "{He} shared {his} ^harvest with {shared}.", "@3 {Name} proudly shared the ^harvest with {shared}."],
      ["2+", 0.6, "", "{Name} learned that good things can take time.", "@3 The garden taught {Name} that ^patience is part of growing anything."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} grows a {plantN} plant from a seed.", "What does {Name} plant?", "seed|plant|grow|garden|sprout|{plantK}"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Who plants the seed?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} planted {plantN} seeds, waited a long time, and finally grew {result}.", "Think about the beginning, the problem, and the ending.", "plant|seed|grow|garden|sprout", "wait|time|finally|patien|grew|long|summer|day"],
      ["main", "2+", "", ["What lesson does {Name} learn?", "What lesson does this story teach?"], "Good things take time, so you have to be patient.", "Think about what {Name} had to do while the seeds were underground.", "patien|time|wait|slow|give up|keep"],
      ["detail", "0", "", "What does {Name} plant?", "A {plantN} seed.", "Look at the first sentence.", "{plantK}|seed"],
      ["detail", "0", "", "What comes up out of the dirt?", "A tiny green sprout.", "What pops up?", "sprout|green|plant|stem|leaf|tiny"],
      ["detail", "1+", "", "What kind of seeds did {Name} plant?", "{PlantN} seeds.", "Reread the first sentence.", "{plantK}"],
      ["detail", "1+", "", "Where did {Name} plant the seeds?", "In {place}.", "Reread the first sentence.", "{placeK}"],
      ["detail", "1+", "", "What came out of the ground first?", "A tiny green sprout.", "Find the words \"At last\" or \"one morning.\"", "sprout|green|shoot|stem|leaf|plant|tiny"],
      ["detail", "1+", "", "What did {Name} have by the end of the summer?", "{He} had {result}.", "Reread the end of the story.", "{resultK}"],
      ["detail", "1+", "", "What did {helper} explain about seeds?", "That seeds need time to grow.", "Find what {helper} said.", "time|root|wait|water|sun"],
      ["detail", "2+", "share", "Who did {Name} share the harvest with?", "{Shared}.", "Look near the end.", "{sharedK}"],
      ["infer", "0", "", "Why does {Name} have to wait?", "Seeds take time to grow.", "Can a seed grow in one day?", "time|grow|slow|long|day"],
      ["infer", "0", "", "How does {Name} feel when the sprout comes up?", "Happy and excited.", "How would you feel?", HAPPY],
      ["infer", "1+", "", "Why did {Name} feel impatient?", "Because {he} watered the seeds every day, but nothing grew for a long time.", "Think about what {Name} saw each day.", "nothing|not grow|didn't grow|wasn't grow|wait|long|slow|took|day"],
      ["infer", "1+", "", "How did {Name} feel when the sprout came up?", "{He} felt excited and happy.", "Think about how long {Name} had waited.", HAPPY],
      ["infer", "2+", "dug", "Why did {Name} put the seed back in the ground?", "Because it had a root, so it was alive and needed the soil to keep growing.", "What did {Name} see on the seed?", "grow|root|alive|growing|soil|live|keep"]
    ] });

  const EVENTS = [["the school play~play|stage|act|show", "say {his} lines~line|speak|said|say"], ["the spelling bee~spelling|bee|spell", "spell {his} first word~spell|word"],
    ["the piano recital~piano|recital|music", "play {his} song~play|song|piano"], ["the class talent show~talent|show", "sing {his} song~sing|song"],
    ["the science fair~science|fair|project", "explain {his} project~explain|project|talk|present"], ["the swim meet~swim|meet|race", "swim {his} race~swim|race"],
    ["the poetry reading~poem|poetry|read", "read {his} poem aloud~read|poem"], ["the class meeting~meeting|class|speech", "give a short speech~speech|speak|talk"]];
  STORY.push({ k: "nervous", g: "story",
    set: function (c) {
      kid(c); pal(c); helper(c, HELPERS.concat([["{his} teacher", "teacher", 1], ["{his} friend {pal}", "friend|{palK}", 0]]));
      const e = P(EVENTS); slot(c, "event", e[0]); slot(c, "act", e[1]);
      c.subject = "nervous:" + c.eventN;
    },
    title: ["Butterflies", "{Name}'s Big Day", "Brave {Name}", "Deep Breaths", "{Name} Takes a Turn", "The Big Moment"],
    beats: [
      ["0", 1, "", "Today is {event}.", "{Name} is in {event} today."],
      ["0", 1, "", "{Name} feels ^nervous.", "{Name}'s hands shake."],
      ["0", 1, "", "{Helper} says, \"Take a big breath.\"", "{Helper} gives {him} a hug and says, \"Take a deep breath.\""],
      ["0", 1, "", "{Name} breathes in and out. Then {he} does it!", "{Name} takes a big breath. {He} does it!"],
      ["0", 0.8, "", "Everyone claps. {Name} is so ^proud.", "Everyone claps for {Name}."],
      ["1+", 1, "", "Today was {event}, and {Name} had to {act}.", "@2 For weeks, {Name} had practiced for {event}, where {he} would {act} in front of everyone."],
      ["1+", 1, "", "{Name}'s hands were shaking.", "{Name} had ^butterflies in {his} stomach.", "@2 {Name}'s stomach felt full of ^butterflies, and {his} hands were cold.", "@3 {Name}'s heart pounded, and {his} mouth felt dry."],
      ["1+", 0.7, "", "\"What if I make a mistake?\" {he} whispered.", "@2 {He} worried that {he} would forget everything {he} had practiced."],
      ["1+", 1, "", "{Helper} leaned over and said, \"Take three slow, deep breaths.\"", "@2 {Helper} reminded {him} to take slow, deep breaths and to look at a friendly face in the crowd."],
      ["2+", 0.7, "", "{Name} breathed in and out, slowly, three times.", "@3 {Name} breathed in slowly through {his} nose and felt {his} shoulders relax."],
      ["1+", 1, "", "When it was {his} turn, {Name} stepped forward.", "@2 When {his} name was called, {Name} walked to the front of the room."],
      ["1+", 1, "", "{He} remembered all of {his} practice, and {he} did it!", "@2 Once {he} began, all that practice took over, and {he} did it without a single mistake.", "@2 {He} made one small mistake but kept going, just like {he} had practiced."],
      ["1+", 1, "", "Everyone clapped and cheered.", "@2 The audience burst into ^applause."],
      ["1+", 1, "", "{Name} felt proud and happy.", "@2 {Name} felt as light as a balloon.", "@3 {Name} felt a rush of pride, and {his} fear had ^vanished."],
      ["2+", 0.6, "", "{Name} learned that being brave does not mean you are not scared.", "@3 {Name} discovered that ^courage means doing something even when you feel afraid."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} feels nervous, but {he} is brave and does it.", "How does {Name} feel, and what does {he} do?", "nervous|scared|afraid|brave|breath|did it|does it|clap"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Who is in {event}?", "{nameK}"],
      ["main", "1+", "", ["What is this story mostly about?", "What happens in this story?"], "{Name} was nervous about {event}, but {he} took deep breaths and did a great job.", "Think about how {Name} felt at the start and at the end.", "nervous|scared|afraid|worr|butterfl|shak|fear", "did it|did great|good job|great job|brave|breath|clap|proud|well|finish"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "You can be brave and do hard things even when you feel nervous.", "Think about what being brave meant for {Name}.", "brave|courage|nervous|scared|afraid|hard|try|breath|calm|believe"],
      ["detail", "0", "", "What does {helper} tell {Name}?", "To take a deep breath.", "What does {helper} say?", "breath|breathe"],
      ["detail", "0", "", "What happens at the end?", "Everyone claps, and {Name} feels proud.", "Look at the last part.", "clap|proud|did it|happy|cheer"],
      ["detail", "1+", "", "What was happening today?", "{Event}.", "Reread the first sentence.", "{eventK}"],
      ["detail", "1+", "", "What did {Name} have to do?", "{He} had to {act}.", "Reread the first sentence.", "{actK}"],
      ["detail", "1+", "", "What did {helper} tell {Name} to do?", "To take slow, deep breaths.", "Find what {helper} said.", "breath|breathe"],
      ["detail", "1+", "", "What did everyone do when {Name} finished?", "They clapped and cheered.", "Look near the end.", "clap|cheer|applau"],
      ["infer", "0", "", "How does {Name} feel at first?", "Nervous and scared.", "Look at the beginning.", "nervous|scared|afraid|worr|shak|shy|fear"],
      ["infer", "0", "", "How does {Name} feel at the end?", "Proud and happy.", "Look at the end.", HAPPY],
      ["infer", "1+", "", "How did {Name} feel before {his} turn? How do you know?", "{He} felt nervous and scared about {event}.", "Look at {Name}'s hands, stomach, or words.", "nervous|scared|afraid|worr|anxious|fear|frighten|butterfl|shak"],
      ["infer", "1+", "", "Why did the deep breaths help {Name}?", "They helped {him} calm down and relax.", "What happens to your body when you breathe slowly?", "calm|relax|less nervous|less scared|slow|better|steady|focus"],
      ["infer", "1+", "", "How did {Name} feel at the end? Why?", "{He} felt proud because {he} was brave and did it.", "Look at the last few sentences.", HAPPY]
    ] });

  const BUILDS = [
    ["block tower~tower|block", "the bottom was too thin~thin|narrow|bottom|base|small", "built the bottom wider~wide|bottom|base|bigger", "makes the bottom wide"],
    ["sandcastle~sandcastle|castle|sand", "the sand was too dry~dry", "mixed water into the sand~water|wet", "adds water to the sand"],
    ["blanket fort~fort|blanket", "the blanket slipped off the chairs~slip|slid|fell off|chair", "tied the corners of the blanket to the chairs~tie|tied|corner|knot", "ties the blanket to the chairs"],
    ["snowman~snowman|snow", "the snow was too powdery to stick~powder|dry|loose|stick|fluffy", "packed the snow tightly into balls~pack|tight|press|squeez|hard", "packs the snow tight"],
    ["paper bridge~bridge|paper", "the flat paper sagged in the middle~sag|flat|bent|bend|middle|droop", "folded the paper back and forth like a fan~fold|fan|zigzag|pleat|accordion", "folds the paper like a fan"],
    ["card house~card|house", "the cards slid on the slippery table~slid|slip|smooth|table", "built it on the rug instead~rug|carpet|floor", "builds it on the rug"],
    ["cardboard rocket~rocket|cardboard|box", "the tape kept peeling off~tape|peel|unstuck|came off", "used glue and let it dry overnight~glue|dry|overnight", "uses glue"],
    ["pillow tower~pillow|tower", "the round pillows rolled off~round|roll", "used the flat, square pillows on the bottom~flat|square|bottom", "puts the flat pillows on the bottom"]
  ];
  STORY.push({ k: "build", g: "story",
    set: function (c) {
      kid(c); pal(c); helper(c);
      const b = P(BUILDS); slot(c, "thing", b[0]); slot(c, "cause", b[1]); slot(c, "fix", b[2]); c.fixNow = b[3];
      c.subject = "build:" + c.thingN;
    },
    title: ["{Name}'s {Thing}", "Crash!", "Build It Again", "The Second Try", "{Name} Figures It Out", "Stronger This Time"],
    beats: [
      ["0", 1, "", "{Name} builds {a:thing}.", "{Name} and {pal} build {a:thing}."],
      ["0", 0.5, "", "It gets ^huge!", "It is so big!"],
      ["0", 1, "", "Then it falls down. Crash!", "Oh no! It falls down."],
      ["0", 0.6, "", "{Name} is sad.", "{Name} feels ^grumpy."],
      ["0", 1, "", "{Name} tries again. This time, {he} {fixNow}.", "{Name} has an idea. {He} {fixNow}."],
      ["0", 1, "", "Now it stays up! {Name} cheers.", "It works! {Name} is ^proud."],
      ["1+", 1, "", "{Name} spent the afternoon building {a:thing}.", "@2 {Name} had a big plan: to build the [biggest|best|strongest] {thingN} ever."],
      ["1+", 0.8, "", "It got bigger and better.", "@2 {He} worked carefully, adding one piece at a time."],
      ["1+", 1, "", "Suddenly, the whole thing fell down!", "Then, with a crash, the {thingN} fell down.", "@2 Just as {he} finished, the {thingN} ^collapsed into a heap."],
      ["1+", 0.8, "", "{Name} felt like crying.", "@2 {Name} was so ^disappointed that {he} almost gave up.", "@3 {Name} stared at the pile, feeling ^discouraged."],
      ["2+", 0.5, "", "{Helper} sat down next to {him} and asked, \"What do you think went wrong?\""],
      ["1+", 1, "", "Then {he} looked closely and saw that {cause}.", "@2 Instead of quitting, {Name} studied the mess and noticed that {cause}."],
      ["1+", 1, "", "So this time, {he} {fix}.", "@2 On {his} second try, {Name} {fix}."],
      ["1+", 1, "", "The new {thingN} stood strong.", "@2 This time, the {thingN} was ^sturdy and did not fall."],
      ["1+", 0.8, "", "{Name} cheered.", "@2 {Name} felt proud that {he} had figured it out."],
      ["2+", 0.6, "", "{Name} learned that mistakes can show you how to do better.", "@3 {Name} realized that a mistake is just a clue for the next try."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} builds {a:thingN}. It falls down, so {he} builds it again.", "What happens to the {thingN}?", "{thingK}", "fall|fell|again|build|try"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Who builds something?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name}'s {thingN} fell down, but {he} figured out why and built a stronger one.", "Think about the problem and how {Name} fixed it.", "{thingK}", "fell|fall|collaps|again|stronger|fix|better|rebuil|try"],
      ["main", "2+", "", ["What lesson does this story teach?", "What lesson does {Name} learn?"], "When something goes wrong, figure out why and try again.", "Think about what {Name} did instead of giving up.", "again|try|mistake|learn|give up|why|better|fix|figure"],
      ["main", "3", "", "What is the theme of this story?", "Mistakes can teach you how to do better if you keep trying.", "How did the first mistake help {Name}?", "mistake|learn|try|give up|better|again|figure|fail"],
      ["detail", "0", "", "What does {Name} build?", "{A:thing}.", "Look at the first sentence.", "{thingK}"],
      ["detail", "0", "", "What happens to the {thingN}?", "It falls down.", "What goes crash?", "fall|fell|crash|down|broke"],
      ["detail", "0", "", "What does {Name} do the second time?", "{He} {fixNow}.", "What is {Name}'s idea?", "{fixK}"],
      ["detail", "1+", "", "What did {Name} build?", "{He} built {a:thing}.", "Reread the first sentence.", "{thingK}"],
      ["detail", "1+", "", "Why did the first {thingN} fall down?", "Because {cause}.", "Find what {Name} saw when {he} looked closely.", "{causeK}"],
      ["detail", "1+", "", "What did {Name} change on the second try?", "{He} {fix}.", "Find the words \"this time\" or \"second try.\"", "{fixK}"],
      ["infer", "0", "", "How does {Name} feel when it falls?", "Sad.", "How would you feel?", SAD + "|grumpy"],
      ["infer", "0", "", "How does {Name} feel at the end?", "Happy and proud.", "Look at the end.", HAPPY],
      ["infer", "1+", "", "How did {Name} feel when the {thingN} fell?", "{He} felt sad and disappointed.", "Look at the sentence right after it fell.", SAD + "|cry|discourag"],
      ["infer", "1+", "", "Why did the second {thingN} stay up?", "Because {he} {fix}, which fixed the problem.", "Think about what {Name} changed.", "{fixK}|fix|chang|stronger|better"],
      ["infer", "2+", "", "What will {Name} probably do the next time something {he} builds falls down?", "{He} will look for the reason and try again.", "Think about what worked this time.", "why|reason|again|try|look|figure|fix|chang|study|check"]
    ] });

  const BROKE = [
    ["{his} mom's favorite mug~mug|cup", "Mom", "mom|mother|mum|mama|parent", 1, "reaching for a cookie on the counter~cookie|reach|counter", "glued the handle back on~glue|handle|fix"],
    ["a flower vase~vase", "Dad", "dad|father|papa|parent", 0, "tossing a ball in the living room~ball|toss|throw|play|inside", "put the flowers in a new jar~new|jar|flower"],
    ["Grandpa's reading glasses~glasses", "Grandpa", "grandpa|grandfather|grandad|papa", 0, "sitting on the couch without looking~sat|sit|couch|look", "took the glasses to be fixed~fix|repair|store|shop"],
    ["{his} sister's clay bowl~bowl|clay", "{his} sister", "sister|sis", 1, "dancing too close to the shelf~danc|shelf|close", "made a new bowl together~new|make|made|together|bowl"],
    ["the neighbor's window~window", "Mr. Gus, the neighbor", "neighbor|gus", 0, "playing baseball too close to the house~baseball|ball|bat|play|house", "did chores to help pay for new glass~chore|pay|work|money|help"],
    ["Grandma's flower pot~pot|flower", "Grandma", "grandma|grandmother|nana|granny", 1, "running on the porch~run|ran|porch", "planted the flowers in a new pot~plant|new|pot"]
  ];
  STORY.push({ k: "honest", g: "story",
    set: function (c) {
      kid(c);
      const b = P(BROKE); slot(c, "item", b[0]); c.owner = fill(b[1], c); c.ownerK = b[2]; pron(c, "o", !!b[3]);
      slot(c, "how", b[4]); slot(c, "fix", b[5]);
      slot(c, "hide", ["sweep the pieces under the rug~sweep|rug|hide", "hide the pieces in the trash~hide|trash|pieces", "say the cat did it~cat|blame|lie"]);
      c.subject = "honest:" + c.itemN;
    },
    title: ["The Truth About the {ItemN}", "Crash!", "{Name} Tells the Truth", "The Hard Choice", "An Honest Mistake", "Oops!"],
    beats: [
      ["0", 1, "", "{Name} was {how}.", "One day, {Name} was {how}."],
      ["0", 1, "", "Crash! {He} broke {item}.", "Oops! {Name} broke {item}."],
      ["0", 0.7, "", "{Name} felt bad.", "{Name}'s tummy felt funny."],
      ["0", 1, "", "{Name} told {owner} the truth.", "{He} went to {owner} and said, \"I'm sorry. I broke it.\""],
      ["0", 1, "", "{Owner} gave {him} a hug.", "{Owner} said, \"Thank you for telling me.\""],
      ["1+", 1, "", "{Name} was {how} when [it|the accident] happened.", "@2 One rainy afternoon, {Name} was {how}."],
      ["1+", 1, "", "Crash! {Name} knocked over {item}, and it broke.", "@2 With a loud crash, {item} hit the floor and cracked."],
      ["1+", 0.8, "", "Nobody had seen it happen.", "@2 {Name} looked around. No one had seen the ^accident."],
      ["1+", 1, "", "For a moment, {Name} thought about trying to {hide}.", "@2 A little voice in {his} head said, \"You could {hide}.\""],
      ["1+", 1, "", "But {his} stomach felt sick.", "@2 But {Name}'s stomach twisted into a knot, and {he} felt ^guilty."],
      ["2+", 0.6, "", "{Name} knew that hiding the truth would only make things worse.", "@3 {Name} knew that a secret like this would keep growing heavier."],
      ["1+", 1, "", "So {he} found {owner} and told {ohim} what had happened.", "@2 Taking a deep breath, {Name} found {owner} and ^confessed."],
      ["1+", 1, "", "{Owner} was a little sad, but {ohe} was not angry.", "@2 {Owner} looked sad for a moment, but then {ohe} gave {Name} a hug."],
      ["1+", 1, "", "\"Thank you for telling me the truth,\" {ohe} said.", "@2 \"I am proud of you for being ^honest,\" {ohe} said."],
      ["1+", 0.8, "", "Later, they {fix}.", "@2 That weekend, they {fix}."],
      ["1+", 0.7, "", "{Name} felt lighter.", "@2 {Name} felt as if a heavy backpack had been lifted off {his} shoulders."],
      ["2+", 0.6, "", "{Name} learned that telling the truth is the right thing to do, even when it is hard.", "@3 {Name} learned that ^honesty takes courage, but it feels better than hiding."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} breaks something and tells the truth.", "What does {Name} break, and what does {he} do next?", "broke|break|crash", "truth|told|tell|sorry"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Who breaks something?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} broke {item} by accident and told the truth about it.", "Think about the problem and what {Name} chose to do.", "broke|break|crack|accident|knock", "truth|told|tell|honest|admit|sorry|confess"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "It is important to tell the truth, even when it is hard.", "Think about how {Name} felt before and after telling.", "truth|honest|lie|tell|admit|confess"],
      ["main", "3", "", "What is the theme of this story?", "Honesty takes courage, but it is the right choice.", "What did {Name} choose over hiding?", "truth|honest|lie|tell|admit|courage|brave|right"],
      ["detail", "0", "", "What does {Name} break?", "{Item}.", "Listen for the crash.", "{itemK}"],
      ["detail", "0", "", "Who does {Name} tell?", "{Owner}.", "Who does {Name} go to?", "{ownerK}"],
      ["detail", "1+", "", "What did {Name} break?", "{He} broke {item}.", "Find the crash.", "{itemK}"],
      ["detail", "1+", "", "What was {Name} doing when it broke?", "{He} was {how}.", "Reread the first sentence.", "{howK}"],
      ["detail", "1+", "", "What did {Name} think about doing at first?", "{He} thought about trying to {hide}.", "Find what {Name} thought about for a moment.", "{hideK}"],
      ["detail", "1+", "", "How did they fix things later?", "They {fix}.", "Look near the end.", "{fixK}"],
      ["infer", "0", "", "How does {Name} feel after it breaks?", "Bad and worried.", "How would you feel?", SAD + "|sorry|funny"],
      ["infer", "0", "", "Why does {owner} say thank you?", "Because {Name} told the truth.", "What did {Name} do that was good?", "truth|told|tell|honest|sorry"],
      ["infer", "1+", "", "Why did {Name}'s stomach feel sick?", "{He} felt guilty about breaking it and thinking about hiding it.", "Think about what {Name} was thinking of doing.", "guilt|bad|wrong|truth|lie|hid|sorry|worr|scar|trouble"],
      ["infer", "1+", "", "Why wasn't {owner} angry?", "Because {Name} told the truth, and it was an accident.", "Think about what {Name} did after it broke.", "truth|honest|told|admit|tell|sorry|accident|confess"],
      ["infer", "2+", "", "How did {Name} feel after telling the truth?", "{He} felt relieved and lighter.", "Look at the end of the story.", HAPPY + "|light|calm"]
    ] });

  const PLANS = [["a picnic at the park~picnic|park", "had a picnic on the living room floor~picnic|floor|living room|inside|indoor"],
    ["a trip to the beach~beach|trip", "made a pretend beach with towels and buckets in the living room~pretend|beach|towel|bucket|living room"],
    ["a soccer game~soccer", "played balloon soccer in the hallway~balloon|hallway|soccer"],
    ["a bike ride~bike|ride", "built a cozy fort out of couch cushions~fort|cushion|pillow|couch"],
    ["a day at the zoo~zoo", "made animal masks out of paper plates~mask|plate|paper|animal"],
    ["camping in the backyard~camp|tent|backyard", "set up the tent in the living room and told stories with a flashlight~tent|flashlight|stor|living room|inside"],
    ["a trip to the pumpkin patch~pumpkin|patch", "baked pumpkin muffins together~bak|muffin|pumpkin"]];
  STORY.push({ k: "rainy", g: "story",
    set: function (c) {
      kid(c); helper(c);
      const pl = P(PLANS); slot(c, "plan", pl[0]); slot(c, "indoor", pl[1]);
      c.subject = "rainy:" + c.planN;
    },
    title: ["A Rainy Day Plan", "Rain, Rain, Go Away", "Plan B", "{Name}'s Rainy Day", "The Best Rainy Day", "When It Rained"],
    beats: [
      ["0", 1, "", "{Name} was ready for {plan}.", "{Name} was so excited for {plan}!"],
      ["0", 1, "", "But then it started to rain.", "Drip, drop. Oh no, rain!"],
      ["0", 0.6, "", "{Name} felt sad.", "{Name} looked out the window and frowned."],
      ["0", 1, "", "So {Name} and {helper} {indoor}.", "{Helper} had an idea. They {indoor}."],
      ["0", 1, "", "It was so much fun!", "It was ^cozy and fun!"],
      ["1+", 1, "", "{Name} had been looking forward to {plan} all week.", "@2 {Name} had packed everything the night before, because Saturday was the day for {plan}."],
      ["1+", 1, "", "But on Saturday morning, rain poured down.", "@2 But when {Name} woke up, a light ^drizzle was falling, and soon it turned into a ^downpour."],
      ["1+", 1, "", "{Name} felt so ^disappointed.", "{Name} pressed {his} nose against the window and sighed.", "@3 The ^gloomy gray sky matched {Name}'s mood."],
      ["2+", 0.5, "", "\"This is the worst day ever,\" {he} grumbled."],
      ["1+", 1, "", "Then {helper} had an idea.", "@2 {Helper} sat down beside {him}. \"Plans can change,\" {hhe} said. \"Let's make a new one.\""],
      ["1+", 1, "", "Together, they {indoor}.", "@2 So that afternoon, {Name} and {helper} {indoor}."],
      ["1+", 0.8, "", "They laughed and laughed.", "@2 Soon {Name} was laughing so hard that {he} forgot all about the rain."],
      ["2+", 0.5, "rainbow", "Later, the rain stopped, and a rainbow stretched across the sky.", "@3 By evening, the clouds had cleared, and a faint rainbow arched over the rooftops."],
      ["2+", 0.6, "", "{Name} learned that a change of plans can still lead to a great day.", "@3 {Name} realized that being ^flexible can turn a bad day into a good one."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "It rains, so {Name} has fun inside instead.", "What happens to {Name}'s plan?", "rain|inside|instead|fun"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Who had a plan?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "Rain ruined {Name}'s plan for {plan}, so {he} and {helper} had fun inside instead.", "Think about the plan, the problem, and the new plan.", "rain|storm|wet|weather", "inside|instead|indoor|fun|idea|new plan|home|{indoorK}"],
      ["main", "2+", "", ["What lesson does this story teach?", "What lesson does {Name} learn?"], "When plans change, you can still make the best of it and have fun.", "Think about how {Name}'s day turned out.", "best|still|fun|chang|instead|different|positive|flexib|another|new plan"],
      ["detail", "0", "", "What was {Name}'s plan?", "{Plan}.", "Look at the first sentence.", "{planK}"],
      ["detail", "0", "", "What did they do instead?", "They {indoor}.", "What was the new idea?", "{indoorK}"],
      ["detail", "1+", "", "What was {Name} looking forward to?", "{Plan}.", "Reread the first sentence.", "{planK}"],
      ["detail", "1+", "", "What did {Name} and {helper} do instead?", "They {indoor}.", "Find what they did together.", "{indoorK}"],
      ["detail", "1+", "", "Who had the new idea?", "{Helper}.", "Find the word \"idea\" or \"plan.\"", "{helperK}"],
      ["detail", "2+", "rainbow", "What happened after the rain stopped?", "A rainbow appeared in the sky.", "Look near the end.", "rainbow"],
      ["infer", "0", "", "How did {Name} feel when it rained?", "Sad.", "Look at what {Name} did.", SAD],
      ["infer", "0", "", "Did {Name} have a good day? How do you know?", "Yes, because it was fun.", "Look at the last sentence.", "yes|fun|good|happy"],
      ["infer", "1+", "", "How did {Name} feel when it started to rain?", "{He} felt disappointed and sad.", "Look at what {Name} did by the window.", SAD + "|sigh|grumb"],
      ["infer", "1+", "", "Do you think {Name} had a good day after all? Why?", "Yes, because {he} had fun with {helper} even though it rained.", "Think about how the story ends.", "yes|fun|good|happy|enjoy|laugh|great"],
      ["infer", "2+", "", "Why do you think {helper} came up with a new plan?", "To cheer {Name} up and help {him} make the best of the day.", "Think about how {Name} was feeling.", "cheer|happy|feel better|sad|disappoint|fun|best|help"]
    ] });

  const NBRS = [["Mr. Gus", 0], ["Mrs. Pearl", 1], ["Miss Ada", 1], ["Mr. Walt", 0], ["Mrs. Hazel", 1], ["Mr. Ray", 0]];
  const NJOBS = [
    ["one fall day", "rake the leaves in {nbrhis} yard~rak|leaves|leaf", "{nbrhe} had hurt {nbrhis} back~back|hurt", "raked the leaves into big piles~rak|pile|leaves"],
    ["one snowy morning", "shovel the snow off {nbrhis} sidewalk~shovel|snow", "{nbrhe} had a broken arm~arm|broke|hurt", "shoveled until the sidewalk was clear~shovel|clear|snow"],
    ["one summer week", "water {nbrhis} garden~water|garden|plant|flower", "{nbrhe} was away visiting family~away|visit|family|gone|trip", "watered every plant each evening~water|plant|evening"],
    ["one spring day", "pull the weeds in {nbrhis} flower bed~weed|pull", "{nbrhe} could not bend down easily anymore~bend|back|knee|hard", "pulled every weed~pull|weed"],
    ["one afternoon", "carry {nbrhis} groceries up the steps~carr|grocer|bag", "{nbrhe} was walking with a cane~cane|walk|leg|hurt", "carried the heavy bags to the door~carr|bag|door"],
    ["one chilly week", "walk {nbrhis} dog, Biscuit~walk|dog|biscuit", "{nbrhe} had a bad cold~cold|sick|ill", "walked Biscuit around the block~walk|block|dog"]];
  STORY.push({ k: "neighbor", g: "story",
    set: function (c) {
      kid(c); helper(c, HELPERS.slice(0, 4));
      const n = P(NBRS); c.nbr = n[0]; c.nbrK = n[0].split(" ")[1].toLowerCase() + "|neighbor"; pron(c, "nbr", !!n[1]);
      const j = P(NJOBS); c.when = j[0]; slot(c, "job", j[1]); slot(c, "why", j[2]); slot(c, "did", j[3]);
      slot(c, "gift", ["a plate of warm cookies~cookie", "a big glass of lemonade~lemonade|drink", "a thank-you card~card", "a jar of homemade jam~jam|jar", "a basket of apples~apple"]);
      c.subject = "neighbor:" + c.jobN;
    },
    title: ["Helping {Nbr}", "A Helping Hand", "Good Neighbors", "{Name} Lends a Hand", "The Neighbor Next Door", "A Kind Surprise"],
    beats: [
      ["0", 1, "", "{Nbr} lives next door to {Name}.", "{Name} has a neighbor named {nbr}."],
      ["0", 1, "", "{Nbr} needs help to {job}."],
      ["0", 1, "", "{Name} wants to help.", "{Name} has a kind idea."],
      ["0", 1, "", "{Name} and {helper} {did}.", "{Name} helps {nbr}. {He} {did}."],
      ["0", 1, "", "{Nbr} gives {Name} {gift}. {Nbr} is so happy!", "{Nbr} says, \"Thank you!\""],
      ["1+", 1, "", "{When}, {Name} noticed that {nbr} needed help.", "@2 {When}, {Name} saw that {his} neighbor, {nbr}, needed help."],
      ["1+", 1, "", "{Nbr} could not {job}, because {why}.", "@2 {Name} knew {nbr} could not {job} because {why}."],
      ["1+", 1, "", "{Name} asked {helper} if they could help.", "@2 \"Can we help {nbrhim}?\" {Name} asked {helper}."],
      ["1+", 1, "", "So {Name} and {helper} {did}.", "@2 That afternoon, {Name} and {helper} {did}."],
      ["1+", 0.7, "", "It was hard work, and {Name} got tired.", "@2 It was hard work, and by the end {Name} was ^exhausted."],
      ["1+", 1, "", "{Nbr} smiled and gave {Name} {gift}.", "@2 {Nbr} was so ^grateful that {nbrhe} brought out {gift}."],
      ["1+", 0.7, "", "\"You didn't have to do this,\" {nbrhe} said.", "@2 \"You are a wonderful neighbor,\" {nbr} said."],
      ["1+", 0.8, "", "{Name} felt warm inside.", "@2 {Name} felt a warm glow inside that lasted all day."],
      ["2+", 0.6, "", "{Name} learned that helping others makes everyone feel good.", "@3 {Name} discovered that a small act of ^kindness can brighten someone's whole week."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} helps {his} neighbor, {nbr}.", "What does {Name} do for {nbr}?", "help", "{nbrK}|{jobK}"],
      ["main", "0", "", "Who needs help in this story?", "{Nbr}, the neighbor.", "Who cannot do the job?", "{nbrK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} helped {his} neighbor, {nbr}, who could not do the job alone.", "Think about who needed help and what {Name} did.", "help", "{nbrK}|{jobK}|{didK}"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "Helping others is kind, and it makes everyone feel good.", "Think about how both {Name} and {nbr} felt at the end.", "help|kind|nice|care|good|neighbor"],
      ["detail", "0", "", "What does {nbr} need help with?", "{Nbrhe} needs help to {job}.", "Look at the second sentence.", "{jobK}"],
      ["detail", "0", "", "What does {nbr} give {Name}?", "{Gift}.", "Look at the end.", "{giftK}|thank"],
      ["detail", "1+", "", "Why couldn't {nbr} {job}?", "Because {why}.", "Find the word \"because.\"", "{whyK}"],
      ["detail", "1+", "", "What did {Name} and {helper} do?", "They {did}.", "Find what they did that afternoon.", "{didK}"],
      ["detail", "1+", "", "What did {nbr} give {Name}?", "{Gift}.", "Look near the end.", "{giftK}"],
      ["infer", "0", "", "How does {nbr} feel at the end?", "Happy and thankful.", "What does {nbr} say or do?", HAPPY],
      ["infer", "1+", "", "Why did {Name} want to help?", "{He} saw that {nbr} needed help and wanted to be kind.", "Think about what {Name} noticed.", "kind|nice|need|could not|couldn't|help|care|hurt|sick|away|neighbor"],
      ["infer", "1+", "", "How did {nbr} feel about what {Name} did?", "{Nbrhe} felt thankful and happy.", "Look at what {nbr} did and said.", HAPPY + "|grateful"],
      ["infer", "2+", "", "Why did {Name} feel warm inside?", "Because helping someone made {him} feel good and proud.", "Think about how it feels to help someone.", "help|good|proud|kind|happy"]
    ] });

  STORY.push({ k: "turns", g: "story",
    set: function (c) {
      kid(c); pal(c); helper(c, HELPERS.slice(0, 4));
      c.rel = c.palhe === "she" ? "sister" : "brother"; c.relK = c.rel + "|" + c.palK;
      slot(c, "toy", ["the new art set~art|paint|marker", "the red scooter~scooter", "the toy train~train", "the tire swing~swing", "the big box of blocks~block", "the new jigsaw puzzle~puzzle", "the toy kitchen~kitchen"]);
      slot(c, "mins", ["five minutes~five|5", "ten minutes~ten|10"]);
      c.subject = "turns:" + c.toyN;
    },
    title: ["Taking Turns", "{Name} and {Pal}", "Mine!", "The Timer Trick", "Sharing {Toy}", "Two Kids, One {ToyN}"],
    beats: [
      ["0", 1, "", "{Name} and {his} little {rel}, {pal}, both wanted {toy}.", "{Name} wanted {toy}. {Pal} wanted it too."],
      ["0", 1, "", "\"Mine!\" they both yelled.", "They pulled and yelled."],
      ["0", 1, "", "{Helper} said, \"Let's take turns.\"", "{Helper} said, \"You can each have a turn.\""],
      ["0", 1, "", "First {Name} had a turn. Then {pal} had a turn.", "{Pal} went first, and then {Name} had a turn."],
      ["0", 1, "", "Taking turns was more fun!", "Now they were both happy."],
      ["1+", 1, "", "{Name} and {his} little {rel}, {pal}, both wanted to play with {toy} at the same time.", "@2 On Saturday morning, {Name} and {his} little {rel}, {pal}, reached for {toy} at the exact same moment."],
      ["1+", 1, "", "\"I had it first!\" {Name} shouted.", "@2 \"I had it first!\" {Name} insisted, tugging harder."],
      ["1+", 1, "", "\"No, I did!\" {pal} yelled back.", "@2 {Pal} would not let go, and soon they were both shouting."],
      ["2+", 0.6, "", "They ^argued so loudly that nobody got to play at all.", "@3 The ^argument went on and on, and nobody got to play at all."],
      ["1+", 1, "", "{Helper} came in and set a timer for {mins}.", "@2 {Helper} walked in, listened to both of them, and set a kitchen timer for {mins}."],
      ["1+", 1, "", "\"Each of you gets a turn,\" {hhe} said. \"When the timer beeps, you switch.\"", "@2 \"When the timer beeps, it is the other person's turn,\" {hhe} explained."],
      ["1+", 1, "", "{Pal} went first, and {Name} waited.", "@2 {Name} let {pal} go first, even though waiting was hard."],
      ["1+", 1, "", "When the timer beeped, they switched.", "@2 Every time the timer beeped, they traded without a fuss."],
      ["1+", 0.8, "", "Soon they were laughing and playing together.", "@2 After a while, they forgot the timer and played together."],
      ["2+", 0.6, "", "{Name} learned that taking turns is fair and makes playing more fun.", "@3 {Name} realized that sharing works better than fighting over something."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} and {pal} learn to take turns.", "What did they both want?", "turn|share|both"],
      ["main", "0", "", "Who is this story about?", "{Name} and {pal}.", "Who wants the toy?", "{nameK}|{palK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} and {pal} both wanted {toy}, so they learned to take turns.", "Think about the problem and how {helper} helped fix it.", "{toyK}|toy|both|argu|fight|want", "turn|share|timer|together"],
      ["main", "2+", "", ["What lesson does this story teach?", "What lesson do {Name} and {pal} learn?"], "Taking turns and sharing is fair, and it makes playing more fun.", "Think about how the story ends.", "turn|share|fair|together|fight|argu"],
      ["detail", "0", "", "What did {Name} and {pal} both want?", "{Toy}.", "Look at the first sentence.", "{toyK}"],
      ["detail", "0", "", "What did {helper} say?", "Let's take turns.", "What did {helper} tell them to do?", "turn"],
      ["detail", "1+", "", "What did {Name} and {pal} both want?", "{Toy}.", "Reread the first sentence.", "{toyK}"],
      ["detail", "1+", "", "How long was each turn?", "{Mins}.", "Find the timer.", "{minsK}"],
      ["detail", "1+", "", "What did {helper} use to help them take turns?", "A timer.", "Find what {helper} set.", "timer|clock"],
      ["detail", "1+", "", "Who went first?", "{Pal} went first.", "Find who had the first turn.", "{palK}"],
      ["infer", "0", "", "How did they feel at the end?", "Happy.", "Look at the end.", HAPPY],
      ["infer", "1+", "", "Why didn't yelling work?", "Because when they fought, nobody got to play at all.", "Think about what happened while they were shouting.", "nobody|no one|neither|couldn't play|could not play|didn't play|not play|fight|argu|mad"],
      ["infer", "1+", "", "How do you think {Name} felt while {pal} went first?", "{He} felt impatient, but {he} waited.", "Was waiting easy or hard?", "impatient|hard|wait|bored|annoy|sad|grumpy|frustrat|antsy|patient"],
      ["infer", "2+", "", "Why do you think the timer helped?", "It made the turns fair, so nobody had to argue about whose turn it was.", "Think about what they were fighting about before.", "fair|same|equal|argu|fight|both|turn|knows|whose"]
    ] });

  const RECIPES = ["chocolate chip cookies~cookie", "blueberry muffins~muffin|blueberr", "banana bread~bread|banana", "pancakes~pancake", "a birthday cake~cake", "oatmeal cookies~cookie|oatmeal"];
  const OOPS = [
    ["used salt instead of sugar~salt|sugar", "salty~salt|yuck|gross|bad|terribl", "read each label carefully~read|label|careful"],
    ["forgot to set a timer~timer|forgot|time", "burned around the edges~burn|black|edge", "set a timer~timer"],
    ["put in a whole cup of baking soda instead of one teaspoon~baking soda|soda|cup|teaspoon|too much", "bitter and strange~bitter|strange|weird|bad|yuck|gross", "measured very carefully~measur|careful"],
    ["forgot to add the eggs~egg|forgot", "flat and crumbly~flat|crumbl|fell apart|apart", "checked off each ingredient as they added it~check|list|ingredient|recipe"]];
  STORY.push({ k: "bake", g: "story",
    set: function (c) {
      kid(c); helper(c);
      slot(c, "food", RECIPES); const o = P(OOPS); slot(c, "oops", o[0]); slot(c, "taste", o[1]); slot(c, "fix", o[2]);
      slot(c, "forwho", ["Grandma's visit~grandma|visit", "a class party~class|party|school", "the new neighbors~neighbor", "Dad's birthday~dad|birthday", "a family picnic~family|picnic"]);
      c.subject = "bake:" + c.foodN;
    },
    title: ["Oops in the Kitchen", "{Name} Bakes {Food}", "The Salty Surprise", "Try Again, Chef!", "Baking Day", "The Second Batch"],
    beats: [
      ["0", 1, "", "{Name} and {helper} made {food}.", "{Name} helped {helper} make {food}."],
      ["0", 1, "", "But {Name} {oops}.", "Oops! {Name} {oops}."],
      ["0", 1, "", "The first batch was {taste}. Yuck!", "Yuck! It was {taste}."],
      ["0", 1, "", "{Helper} laughed. \"Let's try again!\"", "They laughed and made more."],
      ["0", 1, "", "This time, it was ^yummy!", "The new batch was ^yummy!"],
      ["1+", 1, "", "{Name} and {helper} were making {food} for {forwho}.", "@2 To get ready for {forwho}, {Name} and {helper} decided to bake {food}."],
      ["1+", 0.8, "", "{Name} was in charge of adding the ingredients.", "@2 {Name} proudly read the ^recipe and ^measured each ^ingredient."],
      ["1+", 1, "", "But {he} {oops}.", "@2 But in {his} hurry, {Name} {oops}."],
      ["1+", 1, "", "When they tasted the first batch, it was {taste}!", "@2 When they took the first bite, they made a face. It was {taste}!"],
      ["1+", 0.8, "", "{Name} felt terrible.", "@2 {Name}'s face turned red, and {he} felt ^embarrassed."],
      ["1+", 1, "", "But {helper} laughed and said, \"Everyone makes mistakes in the kitchen.\"", "@2 But {helper} just laughed. \"Even great cooks make mistakes,\" {hhe} said."],
      ["1+", 1, "", "So they made a new batch, and this time they {fix}.", "@2 They started over, and this time {Name} {fix}."],
      ["1+", 1, "", "The new batch turned out ^delicious.", "@2 The second batch was golden and ^delicious."],
      ["2+", 0.6, "", "{Name} learned that mistakes can be fixed if you slow down and try again.", "@3 {Name} learned that slowing down and paying attention can save a lot of trouble."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} makes a mistake baking, and then they make them again.", "What goes wrong, and what do they do?", "mistake|oops|again|bak|make|made|yuck|{oopsK}"],
      ["main", "0", "", "Who is this story about?", "{Name} and {helper}.", "Who is baking?", "{nameK}|{helperK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} made a mistake while baking {food}, so they made a new batch more carefully.", "Think about what went wrong and how they fixed it.", "mistake|wrong|oops|{oopsK}|{tasteK}", "again|new|second|another|over|fix|careful|{fixK}"],
      ["main", "2+", "", ["What lesson does this story teach?", "What lesson does {Name} learn?"], "Mistakes can be fixed if you slow down and try again.", "Think about what {helper} said and what happened next.", "mistake|slow|careful|again|try|fix|attention"],
      ["detail", "0", "", "What did they make?", "{Food}.", "Look at the first sentence.", "{foodK}"],
      ["detail", "0", "", "What did {Name} do wrong?", "{He} {oops}.", "Find the word \"oops\" or \"but.\"", "{oopsK}"],
      ["detail", "1+", "", "What were they baking?", "{Food}.", "Reread the first sentence.", "{foodK}"],
      ["detail", "1+", "", "What mistake did {Name} make?", "{He} {oops}.", "Find the word \"But.\"", "{oopsK}"],
      ["detail", "1+", "", "How did the first batch turn out?", "It was {taste}.", "Find what happened when they tasted it.", "{tasteK}"],
      ["detail", "1+", "", "Who were they baking for?", "{Forwho}.", "Reread the first sentence.", "{forwhoK}"],
      ["detail", "1+", "", "What did they do differently the second time?", "They {fix}.", "Find the words \"this time.\"", "{fixK}"],
      ["infer", "0", "", "How did {Name} feel at the end?", "Happy.", "The new ones were yummy!", HAPPY],
      ["infer", "1+", "", "How did {Name} feel about the mistake?", "{He} felt bad and embarrassed.", "Look at {Name}'s face.", SAD + "|embarrass|silly|red|ashamed"],
      ["infer", "1+", "", "Why do you think {helper} laughed?", "To show {Name} that the mistake was not a big deal and could be fixed.", "Think about what {helper} said right after.", "okay| ok |not a big deal|fine|everyone|mistake|fix|feel better|cheer|funny|silly"],
      ["infer", "2+", "", "Why did the second batch turn out better?", "Because they slowed down and {fix}.", "Think about what changed.", "slow|careful|{fixK}"]
    ] });

  STORY.push({ k: "stand", g: "story",
    set: function (c) {
      kid(c); pal(c);
      const cz = P([["the animal shelter~shelter|animal|dog|cat|pet", "buy food and blankets for the dogs and cats~food|blanket|dog|cat|pet|animal"],
        ["the town library~library|book", "buy new books for the children's room~book"],
        ["the food bank~food bank|food", "help families get healthy food~food|famil|meal"],
        ["the community garden~garden", "buy seeds and tools~seed|tool"],
        ["the park cleanup~park|clean", "buy trash grabbers and gloves~glove|grabber|trash"]]);
      slot(c, "cause", cz[0]); slot(c, "use", cz[1]);
      slot(c, "sell", ["lemonade~lemonade", "cookies~cookie", "lemonade and cookies~lemonade|cookie", "homemade bracelets~bracelet", "painted rocks~rock", "fresh muffins~muffin"]);
      slot(c, "idea", ["made a big, bright sign~sign", "moved the stand closer to the busy park path~move|closer|path|park", "made a sign and waved it at every car~sign|wave", "added a jar that said \"Every penny helps\"~jar|penny|sign"]);
      slot(c, "money", ["thirty-five dollars~35|thirty|five", "forty-two dollars~42|forty|two", "fifty dollars~50|fifty", "twenty-eight dollars~28|twenty|eight"]);
      c.subject = "stand:" + c.sellN;
    },
    title: ["The {SellN} Stand", "{Name} and {Pal} Help Out", "Every Penny Helps", "Open for Business", "Helping {Cause}"],
    beats: [
      ["0", 1, "", "{Name} and {pal} sold {sell}.", "{Name} and {pal} made a stand to sell {sell}."],
      ["0", 1, "", "They wanted to help {cause}.", "The money was for {cause}."],
      ["0", 1, "", "At first, nobody came.", "Nobody stopped. {Name} was sad."],
      ["0", 1, "", "Then they {idea}.", "So they {idea}."],
      ["0", 1, "", "Lots of people came! They gave the money to {cause}.", "Soon many people came! The friends felt ^proud."],
      ["1+", 1, "", "{Name} and {pal} wanted to raise money for {cause}.", "@2 When {Name} and {pal} learned that {cause} needed help, they made a plan."],
      ["1+", 1, "", "They set up a stand to sell {sell}.", "@2 On Saturday, they set up a table on the sidewalk to sell {sell}."],
      ["1+", 1, "", "For the first hour, nobody stopped.", "@2 For a whole hour, people walked right past without stopping."],
      ["1+", 0.8, "", "{Name} wanted to give up.", "@2 {Name} felt ^discouraged and wanted to pack up.", "@3 The friends began to feel ^discouraged as the ice in the pitcher melted."],
      ["1+", 1, "", "Then {pal} had an idea, and they {idea}.", "@2 \"Wait, I have an idea!\" {pal} said. So they {idea}."],
      ["1+", 1, "", "Soon, people began to stop.", "@2 Before long, ^customers were lining up."],
      ["1+", 1, "", "By the end of the day, they had raised {money}.", "@2 By sunset, they had sold everything and raised {money}."],
      ["1+", 1, "", "They gave all the money to {cause} to {use}.", "@2 The next day, they ^donated every dollar to {cause} to {use}."],
      ["1+", 0.8, "", "{Name} and {pal} felt very proud.", "@2 {Name} and {pal} felt proud that they had made a real difference."],
      ["2+", 0.6, "", "They learned that kids can help their community, too.", "@3 They learned that teamwork and a good idea can help a whole ^community."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} and {pal} sell {sell} to help {cause}.", "What do they sell, and why?", "sell|sold|stand|money|help"],
      ["main", "0", "", "Who is this story about?", "{Name} and {pal}.", "Who made the stand?", "{nameK}|{palK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} and {pal} sold {sell} to raise money for {cause}, and they did not give up when nobody came.", "Think about their goal, their problem, and the ending.", "sell|sold|stand|money|raise", "{causeK}|help|give up|donat|idea"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "Kids can help their community if they work together and don't give up.", "Think about what helped them succeed.", "help|together|team|give up|keep|community|idea|try"],
      ["detail", "0", "", "What did they sell?", "{Sell}.", "Look at the first sentence.", "{sellK}"],
      ["detail", "0", "", "Who was the money for?", "{Cause}.", "Who did they want to help?", "{causeK}"],
      ["detail", "1+", "", "What did {Name} and {pal} sell?", "{Sell}.", "Find the stand.", "{sellK}"],
      ["detail", "1+", "", "Who were they raising money for?", "{Cause}.", "Reread the first sentence.", "{causeK}"],
      ["detail", "1+", "", "How much money did they raise?", "{Money}.", "Look near the end.", "{moneyK}"],
      ["detail", "1+", "", "What was {pal}'s idea?", "They {idea}.", "Find the word \"idea.\"", "{ideaK}"],
      ["detail", "1+", "", "What would the money be used for?", "To {use}.", "Find where the money went.", "{useK}"],
      ["infer", "0", "", "How do they feel at the end?", "Proud and happy.", "Look at the end.", HAPPY],
      ["infer", "1+", "", "Why do you think people started to stop after the idea?", "Because now people could see what the stand was for.", "Think about what changed.", "see|notice|saw|knows|knew|sign|closer|attention|for|help"],
      ["infer", "1+", "", "How did {Name} feel when nobody stopped?", "{He} felt discouraged and wanted to give up.", "Look at what {Name} wanted to do.", SAD + "|discourag|give up|quit"],
      ["infer", "2+", "", "What would have happened if they had given up after the first hour?", "They would not have raised any money for {cause}.", "Think about what happened after the idea.", "no money|not raise|wouldn't|would not|nothing| no |not help"]
    ] });

  /* ================= DOJO STORIES =================
     Karate is about respect, focus, self-control and kindness.
     Nobody is ever hurt; weapons appear only in demonstrations. */
  const DOJO = [];
  const SENSEIS = [["Sensei Mara", 1], ["Sensei Joe", 0], ["Sensei Dana", 1], ["Sensei Ken", 0], ["Sensei Ana", 1], ["Sensei Sam", 0]];
  const BELTS = [["white", "yellow"], ["yellow", "orange"], ["orange", "green"], ["green", "blue"], ["blue", "purple"], ["purple", "brown"]];
  function dojoKid(c) {
    kid(c); pal(c);
    const s = P(SENSEIS); c.sensei = s[0]; c.senseiK = "sensei|teacher|instructor|" + s[0].split(" ")[1].toLowerCase(); pron(c, "s", !!s[1]);
    const b = P(BELTS); c.belt = b[0]; c.next = b[1];
    return c;
  }

  DOJO.push({ k: "kata", g: "dojo",
    set: function (c) {
      dojoKid(c);
      slot(c, "trouble", ["kept forgetting the middle part~forget|forgot|middle", "kept turning the wrong way~turn|wrong way|direction", "kept mixing up two of the blocks~mix|block|wrong"]);
      slot(c, "tip", ["break the kata into small parts and learn one part at a time~small|part|piece|one at a time|break", "say each move out loud while doing it~out loud|say|aloud|name", "go very slowly first, then a little faster each time~slow|faster|speed"]);
      c.subject = "kata:" + c.troubleN;
    },
    title: ["{Name}'s New Kata", "One Move at a Time", "Practice in the Living Room", "The Tricky Kata", "{Name} Remembers", "Slow, Then Fast"],
    beats: [
      ["0", 1, "", "{Name} is learning a new kata at the dojo.", "At karate, {Name} learns a new kata."],
      ["0", 1, "", "But {he} {trouble}.", "It is hard. {Name} {trouble}."],
      ["0", 1, "", "{Sensei} says to {tip}.", "{Sensei} shows {him} how to {tip}."],
      ["0", 0.8, "", "{Name} practices at home every day.", "{Name} practices and practices."],
      ["0", 1, "", "Now {Name} can do the whole kata! {He} bows to {Sensei}.", "At class, {he} does the whole kata. {Sensei} smiles."],
      ["1+", 1, "", "At the ^dojo, {Name} was learning a new ^kata for {his} {next} belt.", "@2 To earn {his} {next} belt, {Name} had to learn a new ^kata, a set of karate moves done in order."],
      ["1+", 1, "", "But {he} {trouble}.", "@2 The first part was easy, but {Name} {trouble}."],
      ["1+", 0.5, "", "{Name} felt ^frustrated.", "@2 Every time it went wrong, {Name} felt more ^frustrated.", "@3 After a week of mistakes, {Name} began to doubt {self}."],
      ["1+", 1, "", "After class, {sensei} told {him} to {tip}.", "@2 After class, {sensei} knelt beside {him} and suggested that {he} {tip}."],
      ["2+", 0.6, "", "\"Every black belt was once a beginner,\" {she} said.", "@3 \"A black belt is a white belt who never quit,\" {she} said with a smile."],
      ["1+", 1, "", "{Name} practiced in {his} living room every night.", "@2 Every night, {Name} cleared a space in the living room and practiced the kata with great ^focus."],
      ["2+", 0.6, "", "{His} little dog watched from the couch.", "@2 Sometimes {his} family watched and cheered {him} on."],
      ["1+", 1, "", "At the next class, {Name} did the whole kata without a mistake.", "@2 At the next class, {Name} moved through the entire kata smoothly, from the first bow to the last."],
      ["1+", 0.5, "", "{Sensei} bowed to {him} and said, \"Great work.\"", "@2 {Sensei} nodded and said, \"That is what practice looks like.\""],
      ["2+", 0.6, "", "{Name} learned that hard things get easier with practice.", "@3 {Name} realized that patience and practice had turned something impossible into something {he} could do."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} learns a new kata at karate.", "What is {Name} learning?", "kata|karate|move|learn"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Who is learning the kata?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} had trouble learning a new kata, but {he} practiced every night until {he} could do it.", "Think about the problem and how {Name} solved it.", "kata|move|karate|learn", "practic|trouble|hard|forget|finally|could|did it|mistake|tip"],
      ["main", "2+", "", ["What lesson does this story teach?", "What lesson does {Name} learn?"], "Practice and patience make hard things easier.", "Think about what changed between the first class and the last.", "practic|patien|give up|keep|try|easier|work"],
      ["main", "3", "", "What is the theme of this story?", "Hard work and patience turn something difficult into something you can do.", "What did {sensei} mean about black belts?", "practic|patien|give up|quit|work|keep|try|persever"],
      ["detail", "0", "", "Where does {Name} learn the kata?", "At the dojo, or karate class.", "Look at the first sentence.", "dojo|karate|class"],
      ["detail", "0", "", "What does {sensei} tell {Name} to do?", "To {tip}.", "What does {sensei} say?", "{tipK}"],
      ["detail", "1+", "", "What was hard for {Name}?", "{He} {trouble}.", "Find the word \"But.\"", "{troubleK}"],
      ["detail", "1+", "", "What did {sensei} tell {Name} to do?", "To {tip}.", "Find what {sensei} said after class.", "{tipK}"],
      ["detail", "1+", "", "Where did {Name} practice at home?", "In {his} living room.", "Find the word \"practiced.\"", "living room|home|house"],
      ["detail", "1+", "", "What belt was {Name} working toward?", "{His} {next} belt.", "Reread the first sentence.", "{next}"],
      ["infer", "0", "", "How does {Name} feel at the end?", "Proud and happy.", "{Name} did the whole kata!", HAPPY],
      ["infer", "1+", "", "How did {Name} feel when {he} kept making mistakes?", "{He} felt frustrated.", "Look right after the problem.", SAD + "|doubt"],
      ["infer", "1+", "", "Why do you think {sensei}'s tip helped?", "It made the kata easier to learn, so {Name} could focus on one thing at a time.", "Think about how the tip changed the practice.", "easier|easy|small|slow|one|focus|remember|time|simple|part|step"],
      ["infer", "2+", "", "Why did {sensei} say that every black belt was once a beginner?", "To show {Name} that everyone struggles at first, so {he} should not give up.", "Who is {sensei} talking to, and how is that person feeling?", "everyone|beginner|start|give up|quit|keep|struggl|mistake|encourag|hard"]
    ] });

  DOJO.push({ k: "test", g: "dojo",
    set: function (c) {
      dojoKid(c);
      slot(c, "calm", ["took a slow, deep breath~breath|breathe", "pictured {him}self doing every move perfectly~picture|imagine|see", "remembered all of {his} hard practice~remember|practic"]);
      c.subject = "test:" + c.next;
    },
    title: ["Belt Test Day", "The {Next} Belt", "{Name}'s Big Test", "Ready, Set, Kiai!", "A New Belt for {Name}", "Test Day Jitters"],
    beats: [
      ["0", 1, "", "Today is {Name}'s belt test.", "{Name} has a belt test at the dojo today."],
      ["0", 1, "", "{He} feels ^nervous.", "{Name}'s legs feel ^wobbly."],
      ["0", 1, "", "{He} takes a big breath.", "{Name} takes a slow, deep breath."],
      ["0", 1, "", "{He} kicks and punches and yells, \"Kiai!\"", "{He} does {his} kicks and blocks."],
      ["0", 1, "", "{Name} gets a {next} belt! {He} is so ^proud.", "{Sensei} gives {him} a new {next} belt!"],
      ["1+", 1, "", "Today was {Name}'s test for {his} {next} belt.", "@2 After three months of training, it was finally the day of {Name}'s {next} belt test."],
      ["1+", 1, "", "{His} hands were sweaty, and {his} heart was pounding.", "@2 As {he} tied {his} {belt} belt, {his} fingers trembled.", "@3 {Name}'s stomach fluttered as families filled the chairs along the wall."],
      ["1+", 0.5, "", "{Name} worried that {he} would forget {his} kata.", "@2 What if {he} forgot {his} kata in front of everyone?"],
      ["1+", 1, "", "So {he} {calm}.", "@2 To calm down, {Name} closed {his} eyes and {calm}."],
      ["1+", 1, "", "When {sensei} called {his} name, {Name} bowed and stepped onto the mat.", "@2 When {his} name was called, {Name} bowed, stepped onto the mat, and let {his} training take over."],
      ["1+", 1, "", "{He} did {his} kicks, blocks, and kata with a loud ^kiai.", "@2 {He} moved through {his} kicks, blocks, and kata with sharp ^focus, finishing with a strong ^kiai."],
      ["1+", 1, "", "At the end, {sensei} tied a new {next} belt around {his} waist.", "@2 At the end of the test, {sensei} handed {him} a crisp new {next} belt."],
      ["1+", 0.7, "", "Everyone clapped, and {Name} bowed to {sensei}.", "@2 The room filled with ^applause, and {Name} bowed deeply to {sensei}."],
      ["1+", 0.6, "smile", "{Name} could not stop smiling.", "@2 {Name} felt ten feet tall."],
      ["2+", 0.6, "", "{Name} learned that all {his} practice had prepared {him} for this moment.", "@3 {Name} understood that ^confidence comes from preparation."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} takes a belt test and gets a new belt.", "What happens at the dojo today?", "belt|test"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Whose test is it?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} was nervous at {his} belt test, but {he} stayed calm and earned {his} {next} belt.", "Think about how {Name} felt at the start and what happened at the end.", "test|belt", "nervous|calm|earn|pass|new|got|{next}|did it"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "If you prepare and stay calm, you can do your best even when you are nervous.", "Think about what helped {Name} succeed.", "practic|prepar|calm|breath|nervous|brave|train|focus|best"],
      ["detail", "0", "", "What color is {Name}'s new belt?", "{Next}.", "Look at the end.", "{next}"],
      ["detail", "0", "", "Where is the belt test?", "At the dojo.", "Where does {Name} do karate?", "dojo|karate|class"],
      ["detail", "1+", "", "What belt was {Name} testing for?", "The {next} belt.", "Reread the first sentence.", "{next}"],
      ["detail", "1+", "", "What did {Name} do to calm down?", "{He} {calm}.", "Find the word \"calm\" or \"So.\"", "{calmK}"],
      ["detail", "1+", "", "What did {Name} do when {his} name was called?", "{He} bowed and stepped onto the mat.", "Find when {sensei} called {his} name.", "bow|mat|step"],
      ["detail", "1+", "", "What did {sensei} give {Name} at the end?", "A new {next} belt.", "Look near the end.", "belt|{next}"],
      ["infer", "0", "", "How does {Name} feel at first?", "Nervous.", "Look at the beginning.", "nervous|scared|afraid|worr|wobbl|shak"],
      ["infer", "0", "", "How does {Name} feel at the end?", "Proud and happy.", "Look at the end.", HAPPY],
      ["infer", "1+", "", "How did {Name} feel before the test? How do you know?", "{He} felt nervous, because {his} body was shaking or {his} heart was pounding.", "Look at what {Name}'s body was doing.", "nervous|scared|afraid|worr|anxious|fear|shak|sweat|pound|trembl"],
      ["infer", "1+", "", "Why did {Name} bow to {sensei}?", "To show respect and thanks to {his} teacher.", "Think about what a bow means in the dojo.", "respect|thank|polite|honor|manners"],
      ["infer", "2+", "smile", "Why do you think {Name} could not stop smiling?", "Because {he} was proud that {he} passed and earned {his} new belt.", "Think about how long {Name} had trained.", "proud|happy|pass|earn|new belt|did it|excit|glad"]
    ] });

  DOJO.push({ k: "newstudent", g: "dojo",
    set: function (c) {
      dojoKid(c);
      slot(c, "showed", ["how to bow at the door~bow|door", "how to tie {palhis} belt~tie|belt|knot", "where to line up~line|stand|spot"]);
      c.subject = "newstudent:" + c.showedN;
    },
    title: ["The New Student", "{Pal}'s First Class", "A Helping Hand at the Dojo", "Welcome to the Dojo", "{Name} Shows the Way"],
    beats: [
      ["0", 1, "", "A new kid named {pal} comes to karate.", "{Pal} is new at the dojo."],
      ["0", 1, "", "{Pal} does not know what to do.", "{Pal} looks ^shy."],
      ["0", 1, "", "{Name} shows {palhim} {showed}.", "{Name} helps {pal}. {He} shows {palhim} {showed}."],
      ["0", 1, "", "They practice kicks together.", "They do jumping jacks side by side."],
      ["0", 1, "", "{Pal} smiles. {Palhe} has a new friend!", "{Pal} says, \"Thank you, {name}!\""],
      ["1+", 1, "", "One day, a new student named {pal} came to {Name}'s karate class.", "@2 On Tuesday, a new student named {pal} stood at the edge of the mat, looking unsure."],
      ["1+", 1, "", "{Pal} did not know the rules of the ^dojo.", "@2 {Pal} did not know any of the dojo's customs, and {palhe} looked ^nervous."],
      ["1+", 0.4, "", "{Palhe} stood alone and watched the other kids.", "@2 {Palhe} kept tugging at {palhis} brand-new white belt."],
      ["1+", 0.5, "", "{Name} remembered {his} own first class.", "@2 {Name} remembered how confusing {his} own first class had been."],
      ["1+", 1, "", "So {Name} walked over and showed {pal} {showed}.", "@2 So {Name} walked over, smiled, and quietly showed {pal} {showed}."],
      ["2+", 0.6, "", "{He} also explained that everyone bows to show ^respect.", "@3 {He} explained that the bow is a way of showing ^respect to your teacher and your partners."],
      ["1+", 1, "", "During class, {Name} stood next to {pal} so {palhe} could copy the moves.", "@2 During class, {Name} stayed beside {pal}, so {palhe} could follow along."],
      ["1+", 1, "", "At the end, {pal} was smiling.", "@2 By the end of class, {pal} was laughing and trying every kick."],
      ["1+", 0.7, "thank", "{Sensei} noticed and thanked {Name} for being so kind.", "@2 {Sensei} told {Name} that helping others is what a true martial artist does."],
      ["2+", 0.6, "", "{Name} learned that kindness is part of karate.", "@3 {Name} realized that being a leader means helping others feel welcome."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} helps a new kid at karate.", "What does {Name} do for {pal}?", "help|show|friend|kind|new"],
      ["main", "0", "", "Who is new at karate?", "{Pal}.", "Look at the first sentence.", "{palK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} helped a new student named {pal} feel welcome at the dojo.", "Think about what {Name} did for {pal}.", "help|show|kind|welcome|friend|teach", "{palK}|new|student"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "Being kind and helping others is part of being a good martial artist.", "Think about what {sensei} said to {Name}.", "kind|help|welcome|leader|respect|nice|care"],
      ["detail", "0", "", "What does {Name} show {pal}?", "{Showed}.", "What does {Name} help with?", "{showedK}"],
      ["detail", "1+", "", "Who was the new student?", "{Pal}.", "Reread the first sentence.", "{palK}"],
      ["detail", "1+", "", "What did {Name} show {pal}?", "{Showed}.", "Find the word \"showed.\"", "{showedK}"],
      ["detail", "1+", "", "Where did {Name} stand during class?", "Next to {pal}, so {palhe} could copy the moves.", "Find the words \"During class.\"", "next|beside|{palK}|side"],
      ["infer", "0", "", "How does {pal} feel at the start?", "Shy or nervous.", "{Pal} does not know what to do.", "shy|nervous|scared|worr|afraid|sad|alone|lost"],
      ["infer", "0", "", "How does {pal} feel at the end?", "Happy.", "Look at the end.", HAPPY],
      ["infer", "1+", "", "How did {pal} feel at the beginning? How do you know?", "{Palhe} felt nervous, because {palhe} did not know what to do.", "Look at what {pal} did before class.", "nervous|shy|scared|worr|afraid|unsure|confus|alone|lost|sad"],
      ["infer", "1+", "", "Why did {Name} help {pal}?", "{He} remembered how hard the first class was and wanted {pal} to feel welcome.", "Think about what {Name} remembered or noticed.", "remember|new|hard|confus|welcome|kind|nice|help|nervous|alone|first"],
      ["infer", "2+", "thank", "Why do you think {sensei} thanked {Name}?", "Because {Name} was kind and acted like a leader.", "What did {sensei} see {Name} do?", "kind|help|leader|nice|respect|good|example"]
    ] });

  DOJO.push({ k: "board", g: "dojo",
    set: function (c) {
      dojoKid(c);
      slot(c, "strike", ["palm strike~palm|strike|hand", "hammer fist~hammer|fist|hand", "front kick~kick|front|foot", "side kick~kick|side|foot"]);
      slot(c, "tip", ["look at a spot just past the board~past|beyond|behind|through|spot", "breathe out and kiai as {he} strikes~breath|kiai|shout|yell", "keep {his} eyes on the target and trust {his} training~eye|target|trust|focus"]);
      c.subject = "board:" + c.strikeN;
    },
    title: ["The Board Break", "Focus!", "{Name} Breaks the Board", "Through the Board", "The Second Try", "Snap!"],
    beats: [
      ["0", 1, "", "{Name} wants to break a board at karate.", "Today {Name} gets to break a wood board."],
      ["0", 1, "", "{Sensei} holds the board.", "{Sensei} holds the board tight."],
      ["0", 1, "", "{Name} tries a {strike}. The board does not break.", "The first time, the board does not break."],
      ["0", 1, "", "{Sensei} says to {tip}.", "{Sensei} says, \"Try again. Focus!\""],
      ["0", 1, "", "Snap! The board breaks! {Name} cheers.", "This time, snap! The board breaks in two."],
      ["1+", 1, "", "Today was board-breaking day at the ^dojo.", "@2 For weeks, {Name} had practiced {his} {strike} for board-breaking day at the ^dojo."],
      ["1+", 0.6, "safe", "Students only break boards with their instructor holding them, so everyone stays safe.", "@2 In {Name}'s dojo, students break boards only with an instructor, and only after learning how to do it safely."],
      ["1+", 1, "", "{Sensei} held up a thin wood board.", "@2 {Sensei} held a thin pine board firmly at the right height."],
      ["1+", 1, "", "{Name} tried {his} {strike}, but the board did not break.", "@2 {Name} struck the board with a {strike}, but it only wobbled."],
      ["1+", 0.5, "", "{Name}'s face felt hot, and {he} wanted to sit down.", "@2 {Name} felt embarrassed, and {his} ^confidence began to shrink."],
      ["1+", 1, "", "{Sensei} told {him} to {tip}.", "@2 \"You have the skill,\" {sensei} said. \"This time, {tip}.\""],
      ["1+", 0.6, "", "{Name} took a breath, focused, and tried again.", "@2 {Name} took a deep breath and gathered all of {his} ^focus."],
      ["1+", 1, "", "Snap! The board split in two.", "@2 With a loud snap, the board broke cleanly in half."],
      ["1+", 1, "", "The class cheered, and {Name} bowed to {sensei}.", "@2 The class cheered, and {Name} bowed to {sensei} with a huge grin."],
      ["2+", 0.6, "", "{Name} learned that focus and believing in {self} can make a big difference.", "@3 {Name} learned that ^focus and ^confidence matter as much as strength."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} breaks a board at karate.", "What does {Name} want to do?", "board|break"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Who breaks the board?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} could not break the board at first, but {he} focused and broke it on the second try.", "Think about the first try and the second try.", "board", "focus|again|second|try|break|broke|split"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "Focus and believing in yourself can help you succeed.", "Think about what changed on the second try.", "focus|believ|confiden|try|again|give up|trust"],
      ["detail", "0", "", "Who holds the board?", "{Sensei}.", "Look at the second sentence.", "{senseiK}"],
      ["detail", "0", "", "What happens the first time?", "The board does not break.", "Listen to the first try.", "not break|doesn't break|did not break|didn't break|does not break| no "],
      ["detail", "1+", "", "What kind of strike did {Name} use?", "A {strike}.", "Find the word \"tried\" or \"struck.\"", "{strikeK}"],
      ["detail", "1+", "", "What happened on the first try?", "The board did not break.", "Find the first try.", "not break|didn't break|did not break|wobbl| no "],
      ["detail", "1+", "", "What did {sensei} tell {Name} to do?", "To {tip}.", "Find what {sensei} said.", "{tipK}"],
      ["detail", "1+", "safe", "How do students stay safe when they break boards?", "They only break boards with an instructor.", "Find the word \"safe\" or \"safely.\"", "instructor|teacher|sensei|hold|safe|learn"],
      ["infer", "0", "", "How does {Name} feel at the end?", "Happy and proud.", "{Name} cheers!", HAPPY],
      ["infer", "1+", "", "How did {Name} feel when the board did not break?", "{He} felt embarrassed and less sure of {self}.", "Look at {Name}'s face after the first try.", SAD + "|embarrass|hot|sit down|less sure|confiden"],
      ["infer", "1+", "", "Why did the second try work?", "Because {Name} focused and followed {sensei}'s tip.", "What did {Name} do differently?", "focus|tip|breath|believ|{tipK}"],
      ["infer", "2+", "safe", "Why does the dojo have rules about breaking boards?", "To keep everyone safe while they learn.", "Think about what could go wrong without an instructor.", "safe|hurt|injur|careful|learn"]
    ] });

  DOJO.push({ k: "showoff", g: "dojo",
    set: function (c) {
      dojoKid(c);
      slot(c, "oops", ["knocked {pal}'s lunch tray out of {palhis} hands~tray|lunch|knock|drop", "knocked over the tower {pal} was building~tower|knock|block", "sent {pal}'s water bottle flying~bottle|water|knock"]);
      c.subject = "showoff:" + c.oopsN;
    },
    title: ["Karate Is Not for Showing Off", "Self-Control", "{Name} Makes It Right", "A Lesson at Recess", "The Kick at Recess"],
    beats: [
      ["0", 1, "", "{Name} shows {his} kicks at school.", "At recess, {Name} does big karate kicks."],
      ["0", 1, "", "Oops! {He} {oops}.", "Oh no! {His} kick {oops}."],
      ["0", 1, "", "{Name} says, \"I am sorry.\" {He} helps clean up.", "{Name} says sorry to {pal} and helps {palhim}."],
      ["0", 1, "", "{Sensei} says karate is for the dojo, not for showing off.", "{Sensei} says, \"We kick only in class.\""],
      ["0", 0.8, "", "Now {Name} uses {his} kicks only in class.", "{Name} and {pal} are still friends."],
      ["1+", 1, "", "At recess, {Name} wanted to show everyone {his} new jumping kick.", "@2 {Name} had just learned a jumping kick, and at recess {he} could not wait to show it off."],
      ["1+", 1, "", "\"Watch this!\" {he} shouted, and {he} kicked high into the air.", "@2 \"Everyone, watch!\" {he} called, spinning into a high kick without checking who was nearby."],
      ["1+", 1, "", "{His} foot {oops}.", "@2 {His} foot {oops}."],
      ["1+", 0.5, "", "{Pal} looked upset, and some kids laughed.", "@2 {Pal}'s face fell, and a few kids giggled, which only made it worse."],
      ["1+", 1, "", "{Name} felt terrible. {He} said sorry and helped {pal} clean up.", "@2 {Name}'s cheeks burned. {He} ^apologized right away and helped {pal} clean up."],
      ["1+", 0.7, "told", "At karate that night, {Name} told {sensei} what had happened.", "@2 That evening at the dojo, {Name} told {sensei} the whole story."],
      ["1+", 1, "", "{Sensei} said, \"Karate is for ^self-control, not for showing off.\"", "@2 {Sensei} said, \"A martial artist uses ^self-control. We never use karate to show off or to hurt anyone.\""],
      ["2+", 0.6, "", "{Sensei} was glad that {Name} had apologized and told the truth.", "@3 {Sensei} added that owning up to a mistake shows real ^respect."],
      ["1+", 1, "", "From then on, {Name} saved {his} kicks for the dojo.", "@2 After that, {Name} practiced {his} kicks only in class, where it was safe."],
      ["2+", 0.6, "", "{Name} learned that true strength means being in control.", "@3 {Name} learned that real strength is knowing when not to use it."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} shows off a kick and makes a mess, so {he} says sorry.", "What happened when {Name} showed {his} kicks?", "kick|show", "sorry|oops|knock|mess|help"],
      ["main", "0", "", "Who is this story about?", "{Name} and {pal}.", "Who does the kick?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} showed off a kick at recess and {oops}, so {he} apologized and learned to use self-control.", "Think about the mistake and what {Name} learned.", "show|kick|recess", "sorry|apolog|self-control|control|learn|lesson|class|dojo"],
      ["main", "2+", "", ["What lesson does this story teach?", "What lesson does {Name} learn?"], "Karate is for self-control, not for showing off.", "Think about what {sensei} said.", "control|show off|showing off|careful|safe|respect|strength|hurt"],
      ["main", "3", "", "What is the theme of this story?", "Real strength means using self-control and taking responsibility for mistakes.", "What does strength mean to {sensei}?", "control|strength|responsib|respect|mistake|apolog|show off"],
      ["detail", "0", "", "What did {Name}'s kick do?", "It {oops}.", "Find the word \"Oops\" or \"Oh no.\"", "{oopsK}"],
      ["detail", "0", "", "What did {Name} say to {pal}?", "\"I am sorry.\"", "What did {Name} do after the mess?", "sorry|apolog"],
      ["detail", "1+", "", "What did {Name} want to show everyone?", "{His} new jumping kick.", "Reread the first sentence.", "kick"],
      ["detail", "1+", "", "What happened when {Name} kicked?", "{His} foot {oops}.", "Find what {his} foot did.", "{oopsK}"],
      ["detail", "1+", "", "What did {sensei} say karate is for?", "Self-control, not showing off.", "Find what {sensei} said.", "self-control|control"],
      ["infer", "0", "", "How does {pal} feel after the kick?", "Sad or upset.", "How would you feel?", SAD],
      ["infer", "1+", "", "How did {Name} feel after the accident?", "{He} felt terrible and embarrassed.", "Look at what {Name} felt and did right after.", SAD + "|embarrass|guilt|sorry|ashamed|burn"],
      ["infer", "1+", "", "Why did {sensei} say karate is not for showing off?", "Because showing off can cause accidents, and karate should be used carefully.", "Think about what happened at recess.", "accident|hurt|safe|careful|mess|control|knock|respect|danger"],
      ["infer", "2+", "told", "Why do you think {Name} told {sensei} what happened?", "Because {he} wanted to be honest and learn from the mistake.", "Think about what kind of student {Name} is.", "honest|truth|learn|sorry|mistake|right|respect|help"]
    ] });

  DOJO.push({ k: "bo", g: "dojo",
    set: function (c) {
      dojoKid(c);
      slot(c, "event", ["family night~family|night", "the town fall festival~festival|fall|town", "the school talent show~talent|show|school", "the dojo open house~open house|dojo"]);
      c.subject = "bo:" + c.eventN;
    },
    title: ["The Bo Staff Show", "Spin, Twirl, Bow", "{Name}'s Big Demo", "Slow Is Smooth", "Practice With the Bo"],
    beats: [
      ["0", 1, "", "{Name} has a long wood stick called a bo.", "At the dojo, {Name} learns to spin a bo staff."],
      ["0", 1, "", "{Name} will spin it in a show at {event}.", "{He} practices for a show at {event}."],
      ["0", 1, "", "Oops! {He} drops it.", "At first, the bo falls with a clunk."],
      ["0", 1, "", "{Sensei} says, \"Go slow.\"", "{Sensei} says to spin it slowly."],
      ["0", 1, "", "At the show, {Name} spins the bo and bows. Everyone claps!", "At {event}, {Name} does it! Everyone claps."],
      ["1+", 1, "", "{Name}'s dojo was putting on a demonstration at {event}.", "@2 {Name}'s dojo had been invited to put on a ^demonstration at {event}."],
      ["1+", 1, "", "{Name} would spin a bo staff, a long wooden pole, to music.", "@2 {Name}'s part was a bo staff routine, spinning a long wooden pole in smooth circles to music."],
      ["1+", 0.6, "space", "In karate, the bo is used for practice and shows, never to hurt anyone.", "@2 In {Name}'s dojo, students use the bo only for practice and shows, and they always check for plenty of space first."],
      ["1+", 1, "", "At practice, {Name} tried to spin it fast, but it slipped and fell.", "@2 During practice, {Name} tried to spin the bo as fast as the older students, but it slipped from {his} hands and clattered to the floor."],
      ["1+", 0.5, "", "{Name} felt ^frustrated.", "@2 {Name} sighed, picked it up, and dropped it again."],
      ["1+", 1, "", "{Sensei} said, \"Slow is smooth, and smooth is fast.\"", "@2 {Sensei} reminded {him}, \"Slow is smooth, and smooth becomes fast.\""],
      ["1+", 1, "", "So {Name} practiced slowly every day.", "@2 So {Name} practiced every move slowly, one spin at a time, until {his} hands knew the pattern."],
      ["1+", 1, "", "At {event}, {Name} spun the bo smoothly and finished with a bow.", "@2 On the night of {event}, {Name} spun the bo in smooth, steady circles and finished with a respectful bow."],
      ["1+", 0.6, "", "The crowd clapped and cheered.", "@2 The crowd burst into ^applause."],
      ["2+", 0.6, "", "{Name} learned that going slow can help you get better faster.", "@3 {Name} learned that patience in practice leads to ^confidence on stage."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} learns to spin a bo for a show.", "What does {Name} practice?", " bo |staff|stick|spin|show"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Who spins the bo?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} kept dropping the bo staff, but {he} practiced slowly and did a great job in the show.", "Think about the problem and how {Name} solved it.", " bo |staff|spin|pole", "slow|practic|show|drop|did|great|smooth"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "Practicing slowly and carefully helps you get better.", "Think about what {sensei} said.", "slow|careful|practic|patien|smooth"],
      ["detail", "0", "", "What is a bo?", "A long wood stick.", "Look at the first sentence.", "stick|pole|wood|staff|long"],
      ["detail", "0", "", "What does {sensei} tell {Name}?", "To go slow.", "What does {sensei} say?", "slow"],
      ["detail", "1+", "", "What is a bo staff?", "A long wooden pole.", "Find the words \"bo staff.\"", "pole|stick|wood|long"],
      ["detail", "1+", "", "Where was the show?", "At {event}.", "Reread the first sentence.", "{eventK}"],
      ["detail", "1+", "", "What happened when {Name} spun the bo too fast?", "It slipped and fell.", "Find what happened at practice.", "slip|fell|drop|fall|clatter"],
      ["detail", "1+", "", "What did {sensei} say?", "\"Slow is smooth, and smooth is fast.\"", "Find {sensei}'s words.", "slow|smooth"],
      ["infer", "0", "", "How does {Name} feel at the end?", "Happy and proud.", "Everyone claps!", HAPPY],
      ["infer", "1+", "", "What did {sensei} mean by \"slow is smooth\"?", "Practicing slowly helps you do the moves right, and then you can get faster.", "Think about what happened when {Name} went too fast.", "slow|right|careful|correct|faster|better|mistake|learn"],
      ["infer", "1+", "space", "Why do students check for space before using the bo?", "So they don't bump into anyone or anything.", "Think about how long the bo is.", "safe|hit|bump|hurt|space|room|anyone|careful"],
      ["infer", "2+", "", "How do you think {Name} felt when the crowd cheered?", "Proud, because {his} slow practice had worked.", "Think about how hard {Name} practiced.", HAPPY]
    ] });

  DOJO.push({ k: "tourney", g: "dojo",
    set: function (c) {
      dojoKid(c);
      slot(c, "place", ["second place~second|2nd|silver", "third place~third|3rd|bronze"]);
      c.subject = "tourney:" + c.placeN;
    },
    title: ["The Kata Tournament", "{Name}'s Medal", "A Good Sport", "Win or Learn", "The Handshake"],
    beats: [
      ["0", 1, "", "{Name} did {his} kata at a tournament.", "{Name} went to a karate tournament."],
      ["0", 1, "", "{Pal} won first place.", "Another kid, {pal}, won first place."],
      ["0", 1, "", "{Name} got {place}.", "{Name} won {place}."],
      ["0", 1, "", "{Name} shook {pal}'s hand and said, \"Great job!\"", "{Name} bowed to {pal} and smiled."],
      ["0", 0.8, "", "{Sensei} was ^proud of {Name}.", "{Name} was a good sport."],
      ["1+", 1, "", "{Name} had practiced {his} kata for months for the big tournament.", "@2 For two months, {Name} had trained for {his} first kata tournament."],
      ["1+", 1, "", "When it was {his} turn, {Name} did {his} best.", "@2 When {his} name was called, {Name} bowed to the judges and performed {his} kata with strong ^focus."],
      ["2+", 1, "", "Another student, {pal}, did an amazing kata too.", "@2 But another student, {pal}, performed a kata so sharp and powerful that the crowd gasped."],
      ["1+", 1, "", "{Pal} won first place, and {Name} won {place}.", "@2 When the scores came in, {pal} took first place, and {Name} earned {place}."],
      ["1+", 0.8, "", "For a moment, {Name} felt ^disappointed.", "@2 For a moment, {Name}'s smile wobbled. {He} had really wanted to win."],
      ["1+", 1, "", "Then {he} walked over, bowed, and shook {pal}'s hand.", "@2 Then {Name} walked across the mat, bowed to {pal}, and shook {palhis} hand."],
      ["1+", 0.6, "", "\"Your kata was awesome,\" {Name} said.", "#ask @2 \"Your kata was amazing. Can you show me how you do that turn?\" {Name} asked."],
      ["1+", 0.5, "", "{Pal} smiled and thanked {him}.", "@2 {Pal} grinned, and the two started talking like old friends."],
      ["1+", 1, "", "{Sensei} said {he} was proud of how {Name} acted.", "@2 Later, {sensei} told {Name} that {his} ^sportsmanship made {shim} prouder than any medal."],
      ["2+", 0.6, "", "{Name} learned that how you act matters more than winning.", "@3 {Name} learned that being ^gracious when you lose is a kind of victory, too."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} goes to a tournament and is a good sport.", "What does {Name} do after {pal} wins?", "tournament|good sport|hand|great job|bow|kind"],
      ["main", "0", "", "Who is this story about?", "{Name} and {pal}.", "Who went to the tournament?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name} won {place} at a kata tournament and was a good sport by congratulating {pal}, who won.", "Think about how the tournament ended and what {Name} did.", "tournament|kata|place|won|win|lost|lose", "good sport|sportsman|congrat|hand|shook|bow|kind|nice|respect"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "Being a good sport and showing respect matters more than winning.", "Think about what made {sensei} proud.", "good sport|sportsman|respect|kind|more than|matter|win|lose|lost"],
      ["main", "3", "", "What is the theme of this story?", "How you treat others when you lose shows your true character.", "Why was {sensei} proud even without a first-place win?", "character|respect|good sport|sportsman|gracious|kind|win|lose|treat"],
      ["detail", "0", "", "Who won first place?", "{Pal}.", "Look at the second sentence.", "{palK}"],
      ["detail", "0", "", "What place did {Name} get?", "{Place}.", "What did {Name} win?", "{placeK}"],
      ["detail", "1+", "", "Who won first place?", "{Pal} won first place.", "Find the words \"first place.\"", "{palK}"],
      ["detail", "1+", "", "What place did {Name} earn?", "{Place}.", "Find {Name}'s score.", "{placeK}"],
      ["detail", "1+", "", "What did {Name} do after the scores came in?", "{He} bowed and shook {pal}'s hand.", "Find the word \"Then.\"", "bow|shook|shake|hand"],
      ["infer", "0", "", "Was {Name} a good sport? How do you know?", "Yes, because {he} was kind to {pal}.", "What did {Name} do after {pal} won?", "yes|kind|nice|hand|great job|bow|smil"],
      ["infer", "1+", "", "How did {Name} feel when {he} did not win first place?", "{He} felt disappointed at first.", "Look at the moment after the scores came in.", SAD + "|wobbl"],
      ["infer", "1+", "", "Why was {sensei} proud of {Name}?", "Because {Name} was a good sport and showed respect even though {he} did not win.", "Think about what {Name} did after losing.", "good sport|sportsman|respect|kind|nice|hand|bow|congrat|acted"],
      ["infer", "2+", "ask", "Why do you think {Name} asked {pal} about {palhis} kata?", "Because {Name} wanted to learn from {pal} and get better.", "What could {Name} gain from {pal}?", "learn|better|improve|friend|respect|teach|show"]
    ] });

  DOJO.push({ k: "kiai", g: "dojo",
    set: function (c) {
      dojoKid(c);
      slot(c, "trick", ["shout from {his} belly, not {his} throat~belly|stomach|tummy|throat", "imagine cheering for {his} favorite team~cheer|team|imagine", "breathe in deep and push all the air out at once~breath|air|push"]);
      c.subject = "kiai:" + c.trickN;
    },
    title: ["The Quiet Kiai", "{Name} Finds {His} Voice", "Louder!", "The Big Kiai", "From a Whisper to a Shout"],
    beats: [
      ["0", 1, "", "At karate, kids yell \"Kiai!\" when they kick.", "{Name} goes to karate. Everyone yells \"Kiai!\""],
      ["0", 1, "", "But {Name}'s kiai is very quiet.", "{Name} is ^shy. {His} kiai is a whisper."],
      ["0", 1, "", "{Sensei} says to {trick}.", "{Sensei} shows {him} how to {trick}."],
      ["0", 1, "", "{Name} tries. \"KIAI!\" It is so loud!", "{Name} kicks and yells, \"KIAI!\""],
      ["0", 1, "", "Everyone cheers for {Name}.", "{Name} smiles a big smile."],
      ["1+", 1, "", "At {Name}'s ^dojo, students shout \"Kiai!\" when they kick or punch.", "@2 In karate, a ^kiai is a short, powerful shout that students use to show energy and ^focus."],
      ["1+", 1, "", "But {Name} was ^shy, and {his} kiai came out as a tiny squeak.", "@2 {Name} was naturally quiet, and {his} kiai came out as a nervous squeak."],
      ["1+", 0.5, "", "Some kids giggled, and {Name}'s face turned red.", "@2 {Name} felt {his} cheeks burn every time {he} tried."],
      ["1+", 1, "", "After class, {sensei} told {him} to {trick}.", "@2 After class, {sensei} kneeled down and suggested that {Name} {trick}."],
      ["2+", 0.6, "", "\"Your kiai is your spirit,\" {she} said. \"Let it out.\"", "@3 \"Your kiai shows the world your spirit,\" {sensei} explained. \"It is not about being loud. It is about being brave.\""],
      ["1+", 1, "", "{Name} practiced at home, a little louder each day.", "@2 At home, {Name} practiced in the backyard, getting a little louder each day."],
      ["1+", 1, "", "At the next class, {Name} did a front kick and shouted, \"KIAI!\"", "@2 At the next class, {Name} threw a sharp front kick and let out a kiai that echoed off the walls."],
      ["1+", 1, "", "The whole class cheered.", "@2 For a second, the dojo was silent. Then the whole class cheered."],
      ["1+", 0.5, "", "{Name} felt strong and brave.", "@2 {Name} felt stronger than ever."],
      ["2+", 0.6, "", "{Name} learned that being brave can start with something small.", "@3 {Name} discovered that ^confidence grows when you practice being brave."]
    ],
    qs: [
      ["main", "0", "", "What is this story about?", "{Name} learns to do a loud kiai.", "What is hard for {Name}?", "kiai|loud|yell|shout"],
      ["main", "0", "", "Who is this story about?", "{Name}.", "Whose kiai is quiet?", "{nameK}"],
      ["main", "1+", "", ["What happens in this story?", "What is this story mostly about?"], "{Name}'s kiai was very quiet, but {he} practiced and learned to shout it loudly.", "Think about how {Name}'s kiai changed.", "kiai|shout|yell|voice", "quiet|loud|practic|brave|learn|shy"],
      ["main", "2+", "", ["What lesson does this story teach?", "What is the lesson of this story?"], "Practicing being brave helps you grow more confident.", "Think about how {Name} changed from the beginning to the end.", "brave|confiden|practic|try|shy|courage"],
      ["detail", "0", "", "What do kids yell at karate?", "\"Kiai!\"", "Look at the first sentence.", "kiai"],
      ["detail", "0", "", "What does {sensei} tell {Name}?", "To {trick}.", "What does {sensei} say?", "{trickK}"],
      ["detail", "1+", "", "When do students shout \"Kiai\"?", "When they kick or punch.", "Reread the first sentence.", "kick|punch|move|strike"],
      ["detail", "1+", "", "What did {sensei} tell {Name} to do?", "To {trick}.", "Find what {sensei} said after class.", "{trickK}"],
      ["detail", "1+", "", "Where did {Name} practice?", "At home.", "Find the word \"practiced.\"", "home|backyard|yard"],
      ["infer", "0", "", "How does {Name} feel at the end?", "Happy and brave.", "Everyone cheers!", HAPPY + "|brave|strong"],
      ["infer", "1+", "", "How did {Name} feel about {his} quiet kiai?", "{He} felt shy and embarrassed.", "Look at {Name}'s face or cheeks.", SAD + "|shy|embarrass|red|burn"],
      ["infer", "1+", "", "Why did the class cheer at the end?", "Because {Name} finally did a loud, strong kiai.", "What was different at the next class?", "loud|strong|kiai|finally|brave|did it|shout"],
      ["infer", "2+", "", "What did {sensei} mean when {she} talked about spirit?", "That a kiai is about showing courage and energy, not just being loud.", "Reread what {sensei} said.", "brave|courage|energy|spirit|confiden|strong|inside|heart"]
    ] });

  /* ================= ANIMAL FACTS =================
     [name, plural, group, home ("lives ..."), keys, food, keys, body feature ("+" = plural), keys,
      what the feature helps it do, keys, babies (a sentence), keys, special skill ("it can ..."), keys,
      why the skill helps, keys, flags (H/C/O diet, n = nocturnal), extra fact]
     Facts are kept simple and true for the common kind of each animal. */
  const FACTS = [
    ["octopus", "octopuses", "", "in the ocean", "ocean|sea|water", "crabs, clams, and small fish", "crab|clam|fish", "+eight long arms covered with suckers", "arm|sucker|eight|8|tentacle",
      "grab food and hold on to rocks", "grab|hold|food|catch|grip|rock", "A mother octopus guards her eggs in a rocky den until they ^hatch.", "egg|guard|den|hatch|protect",
      "change color to blend in with rocks and plants", "color|colour|blend|camouflag|hide", "hide from sharks and other hunters", "hide|safe|shark|enemy|predator|hunter|danger|eaten|attack", "C",
      "An octopus has three hearts and blue blood."],
    ["frog", "frogs", "amphibian", "in and near ponds and other wet places", "pond|wet|water|swamp|marsh|lake|stream", "insects such as flies and crickets", "insect|bug|fly|flies|cricket",
      "a long, sticky tongue", "tongue|sticky", "catch insects in a flash", "catch|grab|insect|bug|food|eat", "Frogs lay eggs in water, and the eggs ^hatch into tadpoles.", "tadpole|egg",
      "jump many times the length of its own body", "jump|leap|hop", "escape from danger and catch food", "escape|away|safe|danger|food|catch", "C",
      "Many frogs can breathe through their skin."],
    ["honeybee", "honeybees", "insect", "in hives with thousands of other bees", "hive|nest|colony", "nectar and pollen from flowers", "nectar|pollen|flower|honey",
      "a fuzzy body", "fuzz|hair|body", "carry pollen from flower to flower", "pollen|carry|flower", "The queen bee lays all of the eggs in the hive.", "queen|egg",
      "do a waggle dance", "dance|waggle", "show other bees where to find flowers", "show|tell|where|flower|food|find|other bee", "H",
      "Bees turn nectar into honey and store it for winter."],
    ["penguin", "penguins", "bird", "along cold southern coasts and oceans", "cold|ice|ocean|sea|south|antarctic|coast|water|snow", "fish, squid, and tiny shrimp-like animals called krill", "fish|squid|krill|shrimp",
      "+wings shaped like flippers", "flipper|wing", "swim fast through the water", "swim|water|fast|push|dive", "Penguin parents take turns keeping their egg warm.", "egg|warm|turn|parent|mom|dad",
      "slide on its belly across the ice", "slid|belly|tummy|ice", "move quickly over snow and ice", "fast|quick|move|travel|speed|faster|energy", "C",
      "Penguins are birds, but they cannot fly."],
    ["elephant", "elephants", "mammal", "in grasslands and forests in Africa and Asia", "africa|asia|grass|forest|savanna", "grass, leaves, bark, and fruit", "grass|leaves|leaf|bark|fruit|plant",
      "a long trunk", "trunk|nose", "pick up food, drink water, and smell", "pick|grab|food|drink|water|smell|spray|lift", "A baby elephant, called a calf, stays close to its mother for years.", "calf|mother|mom|close",
      "flap its big ears", "ear|flap|fan", "cool off on hot days", "cool|hot|heat|temperature", "H",
      "Elephants are the largest animals that live on land."],
    ["giraffe", "giraffes", "mammal", "on the grasslands of Africa", "africa|grass|savanna|plain", "leaves from tall trees, especially acacia trees", "leaves|leaf|tree|acacia",
      "a very long neck", "neck|long|tall", "reach leaves high in the trees", "reach|high|top|tall|leaves|leaf|food|eat", "A baby giraffe can stand up within about an hour of being born.", "stand|hour|born",
      "see far across the grasslands from high up", "see|spot|watch|far|look", "spot lions and other danger from far away", "safe|lion|danger|predator|warn|escape|run|spot", "H",
      "A giraffe's tongue is dark purple and very long."],
    ["owl", "owls", "bird", "in forests, fields, and even deserts", "forest|wood|tree|field|desert|barn", "mice and other small animals", "mice|mouse|small animal|rodent|bug|insect",
      "+soft feathers with fluffy edges", "feather|soft|fluff", "fly almost silently", "quiet|silent|sound|noise|hear", "Baby owls are called owlets.", "owlet",
      "turn its head very far around", "turn|head|neck|twist|look", "look around without moving its body", "look|see|eye|around|behind|move", "Cn",
      "Owls cannot move their eyes, so they turn their heads instead."],
    ["bat", "bats", "mammal", "in caves, trees, and old buildings", "cave|tree|building|barn|attic", "insects, fruit, or flower nectar, depending on the kind of bat", "insect|bug|fruit|nectar|moth|mosquito",
      "+wings made of thin skin stretched over long finger bones", "wing|skin|finger", "fly and turn quickly in the air", "fly|flying|air|turn", "A baby bat is called a pup, and it clings to its mother.", "pup|cling|hold|mother|mom",
      "hang upside down to rest", "upside|hang", "drop into the air and fly off quickly", "fly|drop|quick|ready|escape|take off|safe", "n",
      "Bats are the only mammals that can truly fly."],
    ["beaver", "beavers", "mammal", "in streams, rivers, and ponds", "stream|river|pond|water|lake", "bark, twigs, leaves, and water plants", "bark|twig|leaves|leaf|plant|wood|tree",
      "+strong orange teeth that never stop growing", "teeth|tooth", "chew through trees", "chew|cut|tree|wood|gnaw|bite", "Baby beavers are called kits, and they live in the family lodge.", "kit|lodge",
      "build dams out of sticks and mud", "dam|build|stick|mud", "make a deep pond where it can build a safe home", "pond|home|lodge|safe|water|deep", "H",
      "The door to a beaver's lodge is underwater."],
    ["kangaroo", "kangaroos", "mammal", "in grasslands and open forests in Australia", "australia|grass|forest|bush", "grass and other plants", "grass|plant|leaves",
      "+strong back legs and a long tail", "leg|tail", "hop and keep its balance", "hop|jump|balance|bounce", "A baby kangaroo, called a joey, grows inside its mother's pouch.", "joey|pouch",
      "hop very fast for long distances", "hop|jump|fast|far", "travel far to find food and water", "travel|far|food|water|move|escape|away", "H",
      "A kangaroo cannot walk backward easily."],
    ["polar bear", "polar bears", "mammal", "on the sea ice of the Arctic", "arctic|ice|north|snow|cold", "seals", "seal",
      "a thick layer of fat and two layers of fur", "fat|fur|blubber|thick", "stay warm in freezing weather", "warm|cold|freez|heat", "Mother polar bears dig dens in the snow, where their cubs are born in winter.", "den|snow|cub",
      "swim for many hours in icy water", "swim|water|paddle", "travel between pieces of ice and hunt seals", "hunt|seal|ice|food|travel|catch", "C",
      "Under its white fur, a polar bear's skin is black."],
    ["sea turtle", "sea turtles", "reptile", "in warm oceans around the world", "ocean|sea|water|warm", "sea grass, jellyfish, and other sea creatures, depending on the kind of turtle", "grass|jellyfish|jelly|crab|sponge|plant|sea",
      "a hard, smooth shell", "shell", "protect its soft body", "protect|safe|body|cover|armor|hard", "Mother sea turtles crawl onto beaches to lay their eggs in the sand.", "egg|sand|beach",
      "swim thousands of miles across the ocean", "swim|mile|far|ocean|travel", "reach places to feed and to nest", "food|feed|eat|nest|egg|beach|home|lay", "",
      "Sea turtles cannot pull their heads into their shells."],
    ["cheetah", "cheetahs", "mammal", "on the grasslands of Africa", "africa|grass|savanna|plain", "animals such as gazelles and antelope", "gazelle|antelope|impala|meat|animal",
      "a long tail", "tail", "keep its balance and turn while running fast", "balance|turn|steer|run", "Cheetah cubs have fluffy gray fur on their backs when they are small.", "cub|fluff|fur",
      "run faster than any other land animal", "fast|run|speed|quick", "catch quick animals for food", "catch|food|prey|hunt|eat|chase", "C",
      "A cheetah can go from standing still to top speed in just a few seconds."],
    ["hummingbird", "hummingbirds", "bird", "in gardens, forests, and meadows in North and South America", "garden|forest|meadow|flower|america", "nectar from flowers and tiny insects", "nectar|flower|insect|bug|sugar",
      "a long, thin beak", "beak|bill", "reach the nectar deep inside flowers", "nectar|reach|flower|drink|inside|deep", "Hummingbirds build tiny nests about the size of half a walnut shell.", "nest|tiny|small|walnut",
      "hover in one spot and even fly backward", "hover|backward|still|one spot|fly", "sip from flowers while flying", "flower|sip|drink|nectar|eat|food", "",
      "A hummingbird's wings beat so fast that they hum."],
    ["monarch butterfly", "monarch butterflies", "insect", "in fields and meadows across North America", "field|meadow|flower|america|garden", "nectar from flowers", "nectar|flower",
      "a long, tube-shaped mouth called a ^proboscis", "proboscis|tube|straw|mouth|tongue", "sip nectar like a straw", "sip|drink|nectar|straw|suck", "Monarch caterpillars eat only milkweed leaves.", "milkweed|caterpillar",
      "fly thousands of miles each fall", "fly|mile|far|travel|migrat|south|mexico", "reach warm places to spend the winter", "warm|winter|cold|south|mexico", "H",
      "A monarch starts life as a tiny egg, then becomes a caterpillar, then a chrysalis, and finally a butterfly."],
    ["raccoon", "raccoons", "mammal", "in forests, near streams, and in towns and cities", "forest|stream|town|city|tree|wood", "fruit, nuts, insects, fish, and frogs", "fruit|nut|insect|bug|fish|frog|anything|everything|crayfish",
      "+nimble front paws that work almost like hands", "paw|hand|finger", "open things and grab food", "open|grab|hold|pick|food|feel", "Baby raccoons are called kits.", "kit",
      "climb trees easily", "climb|tree", "rest and stay safe up high", "rest|sleep|safe|high|hide|danger", "On",
      "Raccoons often dip their food in water before they eat it."],
    ["hedgehog", "hedgehogs", "mammal", "in hedges, gardens, fields, and woods", "hedge|garden|field|wood|forest", "insects, worms, and beetles", "insect|bug|worm|beetle|slug",
      "+thousands of sharp spines on its back", "spine|spike|quill|prickl|sharp", "stay safe from hungry animals", "protect|safe|hungry|predator|enemy|danger|attack|hurt", "Baby hedgehogs are called hoglets.", "hoglet",
      "roll up into a tight, prickly ball", "roll|ball|curl", "keep its soft belly safe", "belly|safe|protect|soft|hide|danger|tummy", "n",
      "A hedgehog snuffles and grunts like a tiny pig while it looks for food."],
    ["koala", "koalas", "mammal", "in eucalyptus forests in Australia", "eucalyptus|gum|forest|tree|australia", "eucalyptus leaves", "eucalyptus|leaves|leaf|gum",
      "+sharp claws and a strong grip", "claw|grip|hand|paw", "hold on to tree branches", "hold|grip|climb|branch|tree|fall", "A baby koala, called a joey, lives in its mother's pouch for about six months.", "joey|pouch",
      "sleep up to eighteen hours a day", "sleep|rest|hour", "save energy, because its leafy food gives it very little energy", "energy|tired|save|leaves|food|little|rest", "Hn",
      "Koalas get most of the water they need from leaves."],
    ["giant panda", "giant pandas", "mammal", "in cool, misty mountain forests in China", "china|mountain|forest|bamboo", "bamboo shoots, stems, and leaves", "bamboo",
      "a special wrist bone that works like a thumb", "thumb|wrist|bone|hand", "grip bamboo stems while eating", "grip|hold|grab|bamboo|eat", "A newborn panda cub is tiny and pink, about the size of a stick of butter.", "tiny|small|pink|butter|cub",
      "eat for up to fourteen hours a day", "eat|hour|chew|bamboo|day", "get enough energy, because bamboo is not very filling", "energy|enough|full|bamboo|need|food|nutri|hungry", "",
      "A panda can eat more than twenty pounds of bamboo in one day."],
    ["sloth", "sloths", "mammal", "in the rainforests of Central and South America", "rainforest|forest|jungle|tree|america", "leaves and buds", "leaves|leaf|bud|plant",
      "+long, curved claws", "claw|hook", "hang from branches", "hang|hold|branch|tree|grip", "A baby sloth clings to its mother's belly.", "cling|hold|belly|mother|mom|ride",
      "move very slowly and stay still for a long time", "slow|still|quiet", "save energy and stay hidden from hunters such as eagles", "hide|hidden|energy|safe|notice|see|eagle|predator", "H",
      "Tiny green plants called algae can grow in a sloth's fur."],
    ["zebra", "zebras", "mammal", "on the grasslands of Africa", "africa|grass|savanna|plain", "grass", "grass",
      "+strong, flat teeth", "teeth|tooth", "grind tough grass", "grind|chew|grass|eat|food", "A baby zebra, called a foal, can stand and walk soon after it is born.", "foal|stand|walk",
      "live and travel in large groups called herds", "herd|group|together", "watch for lions and stay safer", "safe|lion|danger|watch|predator|protect", "H",
      "No two zebras have exactly the same stripes."],
    ["crocodile", "crocodiles", "reptile", "in rivers, lakes, and swamps in warm places", "river|lake|swamp|water|warm", "fish, birds, and other animals", "fish|bird|animal|meat",
      "+eyes and nostrils on top of its head", "eye|nostril|nose|top|head", "see and breathe while the rest of its body hides underwater", "see|breath|underwater|hide|water", "Mother crocodiles gently carry their babies in their mouths.", "mouth|carry",
      "stay underwater for a long time without breathing", "underwater|breath|water", "wait quietly for food to come close", "wait|food|hunt|catch|sneak|surprise|close|hide", "C",
      "Crocodiles often lie in the sun to warm up."],
    ["chameleon", "chameleons", "reptile", "in trees in warm places such as Africa and Madagascar", "tree|forest|africa|madagascar|warm", "insects such as crickets and grasshoppers", "insect|bug|cricket|grasshopper",
      "+eyes that can move in two different directions at once", "eye|two|direction", "look for insects all around it", "look|see|insect|bug|around|food|watch", "Most chameleons ^hatch from eggs.", "egg|hatch",
      "shoot out a long, sticky tongue", "tongue|sticky", "catch insects from far away", "catch|insect|bug|food|eat|grab", "C",
      "Chameleons change color to show their mood and to warm up or cool down."],
    ["humpback whale", "humpback whales", "mammal", "in oceans all around the world", "ocean|sea|water", "tiny shrimp-like animals called krill and small fish", "krill|shrimp|fish",
      "+baleen plates instead of teeth", "baleen|plate|filter", "strain food from big gulps of water", "strain|filter|food|water|catch|sift", "A baby whale, called a calf, drinks its mother's milk.", "calf|milk",
      "sing long, complex songs", "sing|song|sound", "communicate with other whales", "communicat|talk|other whale|call|message|mate", "C",
      "Humpback whales travel thousands of miles between their feeding and breeding waters."],
    ["ant", "ants", "insect", "in underground nests called colonies", "nest|underground|colony|ground|tunnel|dirt|hill", "seeds, leaves, other insects, and sweet foods", "seed|leaves|leaf|insect|bug|sweet|sugar|crumb|food",
      "+strong jaws", "jaw|mouth|mandible", "carry food and dig tunnels", "carry|dig|food|tunnel|hold|bite", "The queen ant lays the eggs, and worker ants care for the young.", "queen|egg|worker",
      "carry things much heavier than its own body", "carry|lift|heavy|strong", "bring food back to the nest", "food|nest|home|colony|bring|back", "",
      "Ants leave scent trails so other ants can follow them to food."],
    ["dolphin", "dolphins", "mammal", "in oceans all around the world", "ocean|sea|water", "fish and squid", "fish|squid",
      "a blowhole on top of its head", "blowhole|hole|head", "breathe air at the surface", "breath|air|surface", "A baby dolphin, called a calf, swims right beside its mother.", "calf|mother|mom|beside",
      "use clicking sounds and echoes to find food", "click|sound|echo", "find fish even in dark or cloudy water", "find|fish|food|dark|see|murky|cloud|hunt", "C",
      "Dolphins live and travel in groups called pods."],
    ["camel", "camels", "mammal", "in deserts", "desert|sand|dry", "desert plants, even thorny ones", "plant|thorn|grass|leaves|bush",
      "+humps that store fat", "hump|fat", "have energy when food is hard to find", "energy|food|hungry|without|store|save", "A baby camel, called a calf, can walk a few hours after it is born.", "calf|walk|hour",
      "go for many days without drinking water", "water|drink|without|day|thirst", "survive in hot, dry places with little water", "desert|dry|hot|little water|no water|survive|live", "H",
      "Camels have long eyelashes that keep sand out of their eyes."],
    ["squirrel", "squirrels", "mammal", "in trees in forests, parks, and backyards", "tree|forest|park|yard|nest", "nuts, seeds, fruit, and acorns", "nut|seed|fruit|acorn",
      "a big, bushy tail", "tail|bushy", "keep its balance as it jumps from branch to branch", "balance|jump|branch|climb|steady|fall", "Baby squirrels are born in a nest of leaves called a drey.", "nest|drey|leaves",
      "bury nuts in many hiding spots", "bury|hide|dig|store|save", "have food to eat in winter", "winter|food|later|cold|save|eat|hungry", "",
      "Some of the nuts squirrels forget grow into new trees."],
    ["bald eagle", "bald eagles", "bird", "near lakes, rivers, and coasts in North America", "lake|river|coast|water|america|tree", "fish, along with some birds and small animals", "fish",
      "+sharp, curved claws called ^talons", "talon|claw", "grab fish out of the water", "grab|catch|fish|hold|snatch", "Eagle parents build huge nests of sticks high in trees.", "nest|stick|tree|huge|big",
      "see small animals from very far away", "see|eye|far|sight|spot", "spot food from high in the sky", "food|fish|hunt|spot|find|catch", "C",
      "A bald eagle is not really bald. White feathers cover its head."],
    ["snail", "snails", "", "in gardens, forests, and other damp places", "garden|forest|damp|wet|moist|leaf", "leaves and other plants", "leaves|leaf|plant|lettuce|flower",
      "a hard, coiled shell", "shell", "protect its soft body and keep it from drying out", "protect|safe|hide|dry|cover|body", "Baby snails ^hatch from tiny eggs and already have thin shells.", "egg|shell|hatch",
      "make slime to glide over the ground", "slime|slim|mucus|glide|slide", "move smoothly over rough or sharp things", "move|smooth|glide|slide|safe|sharp|rough|easy", "H",
      "A snail moves on one big, muscular foot."],
    ["seahorse", "seahorses", "fish", "in shallow, warm ocean waters with sea grass and coral", "ocean|sea|water|grass|coral|reef|shallow", "tiny shrimp and plankton", "shrimp|plankton|tiny",
      "a curly tail", "tail|curl", "hold on to sea grass so the water does not push it away", "hold|grab|wrap|grass|hang on|grip|drift|away", "The father seahorse carries the eggs in a pouch until they ^hatch.", "father|dad|male|pouch",
      "change color to match its surroundings", "color|colour|blend|match|camouflag|hide", "hide from fish and crabs that might eat it", "hide|safe|eat|enemy|danger|predator", "C",
      "A seahorse is a kind of fish, even though it looks like a tiny horse."],
    ["arctic fox", "arctic foxes", "mammal", "in the cold Arctic tundra", "arctic|tundra|cold|north|snow|ice", "lemmings, birds, eggs, and fish", "lemming|bird|egg|fish|rodent|small animal",
      "thick fur, even on the bottoms of its feet", "fur|feet|foot|thick", "stay warm and walk on ice and snow", "warm|cold|ice|snow|walk", "Arctic fox babies, called kits, are born in dens.", "kit|den",
      "change its fur color with the seasons", "fur|color|colour|season|white|brown|change", "blend in with snow in winter and with rocks and plants in summer", "blend|hide|camouflag|snow|match|see|notice", "",
      "An arctic fox wraps its bushy tail around itself like a blanket."],
    ["woodpecker", "woodpeckers", "bird", "in forests and wooded areas", "forest|wood|tree", "insects that live in tree bark", "insect|bug|beetle|ant|larva|grub|bark",
      "a strong, sharp beak", "beak|bill", "drill holes in tree trunks", "drill|hole|peck|tree|wood|hammer", "Woodpeckers raise their babies in holes they carve in trees.", "hole|tree|carve",
      "tap on trees very fast", "tap|peck|fast|drum|knock", "find insects and make homes", "insect|bug|food|home|nest|hole|find|eat", "",
      "A woodpecker has a long tongue that reaches insects deep in the wood."],
    ["sea star", "sea stars", "", "in oceans, often on rocks and in tide pools", "ocean|sea|rock|tide pool|pool|water", "clams, mussels, and oysters", "clam|mussel|oyster|shell",
      "+rows of tiny tube feet under its arms", "tube|feet|foot|arm", "move slowly and pull open shells", "move|crawl|open|pry|pull|walk|grip", "Sea star babies drift in the ocean before they settle down.", "drift|float|ocean|settle",
      "grow back an arm it has lost", "grow|regrow|arm|back|new", "survive after an injury", "surviv|attack|hurt|lost|lose|injur|heal|live", "C",
      "Sea stars are not really fish, even though some people call them starfish."],
    ["wolf", "wolves", "mammal", "in forests, mountains, and open plains", "forest|mountain|plain|tundra|wood", "deer, elk, and other large animals", "deer|elk|moose|meat|animal",
      "a strong sense of smell", "smell|nose|sniff", "track animals from far away", "track|find|smell|follow|hunt|food|far", "Wolf pups are born in dens and are cared for by the whole pack.", "pup|den|pack",
      "howl to talk to the rest of its pack", "howl|call|talk|communicat", "find each other and keep the pack together", "find|together|pack|family|other wolves|each other|warn|keep", "C",
      "A wolf pack is a family that lives and hunts together."],
    ["lion", "lions", "mammal", "on the grasslands of Africa", "africa|grass|savanna|plain", "zebras, antelope, and other large animals", "zebra|antelope|wildebeest|buffalo|meat|animal",
      "a loud roar that can be heard miles away", "roar|loud", "warn other lions to stay out of its land", "warn|away|territory|land|stay out|other lion|keep", "Lion cubs are born with spots that fade as they grow.", "cub|spot",
      "live and hunt in family groups called prides", "pride|group|family|together|team", "work together to catch large animals", "together|team|catch|large|big|hunt|share|food", "C",
      "Lions rest for up to twenty hours a day."],
    ["tiger", "tigers", "mammal", "in forests and grasslands in Asia", "asia|forest|jungle|grass|india", "deer, wild pigs, and other animals", "deer|pig|boar|meat|animal",
      "orange fur with dark stripes", "stripe|fur|orange", "blend in with tall grass and shadows", "blend|hide|camouflag|grass|shadow|see|notice", "Tiger cubs stay with their mother for about two years.", "cub|mother|mom|two|year",
      "swim well and often cool off in water", "swim|water|cool", "stay cool in hot weather and cross rivers", "cool|hot|heat|river|travel|cross", "C",
      "Tigers are the biggest wild cats in the world."],
    ["gorilla", "gorillas", "mammal", "in the rainforests of central Africa", "africa|rainforest|forest|jungle", "leaves, stems, and fruit", "leaves|leaf|stem|fruit|plant|bamboo",
      "+strong arms and hands with thumbs", "arm|hand|thumb|strong", "climb, carry things, and pick food", "climb|carry|pick|grab|hold|food", "A baby gorilla often rides on its mother's back.", "ride|back|mother|mom|carry",
      "build a new nest of leaves to sleep in each night", "nest|leaves|leaf|bed|build|sleep", "have a soft, safe place to rest", "soft|safe|rest|sleep|comfort|bed", "",
      "Gorillas live in family groups called troops."],
    ["skunk", "skunks", "mammal", "in forests, fields, and neighborhoods", "forest|field|neighbor|wood|yard", "insects, grubs, fruit, and small animals", "insect|bug|grub|fruit|small animal|mice|worm",
      "a black coat with bold white stripes", "stripe|white|black", "warn other animals to stay away", "warn|away|stay|danger|back off", "Baby skunks are called kits.", "kit",
      "spray a stinky liquid", "spray|stink|smell|liquid", "protect itself from danger", "protect|safe|danger|enemy|predator|away|scare|attack", "On",
      "Before it sprays, a skunk stamps its feet as a warning."],
    ["porcupine", "porcupines", "mammal", "in forests", "forest|tree|wood", "bark, twigs, leaves, and other plants", "bark|twig|leaves|leaf|plant",
      "+thousands of sharp quills", "quill|spike|spine|sharp|needle", "stay safe from animals that might attack it", "protect|safe|attack|danger|enemy|predator|hurt", "A baby porcupine is called a porcupette, and its quills are soft when it is born.", "porcupette|soft|quill",
      "climb trees well", "climb|tree", "find food and rest safely", "food|eat|rest|safe|sleep|bark|leaves|leaf", "Hn",
      "Porcupines cannot shoot their quills, but the quills come loose easily when touched."],
    ["walrus", "walruses", "mammal", "on sea ice and rocky shores in the Arctic", "arctic|ice|shore|cold|north|rock|sea", "clams and other shellfish on the sea floor", "clam|shellfish|shell",
      "+two long tusks", "tusk", "pull its heavy body up onto the ice", "pull|climb|ice|haul|lift", "A walrus calf stays with its mother for about two years.", "calf|mother|mom|year",
      "find clams with its sensitive whiskers", "whisker|feel|find|clam", "find food in dark, muddy water", "food|find|dark|mud|see|eat|clam", "C",
      "Walruses gather in big, noisy groups on the ice to rest."],
    ["flamingo", "flamingos", "bird", "in shallow lakes and lagoons", "lake|lagoon|water|shallow|wetland|marsh", "tiny shrimp, algae, and other small creatures", "shrimp|algae|tiny|small",
      "a bent beak", "beak|bill", "strain food from the water", "strain|filter|food|water|sift|scoop", "Flamingo chicks have gray feathers and turn pink later.", "gray|grey|chick|feather",
      "stand on one leg for a long time", "one leg|stand|leg|balance", "rest while standing in the water", "rest|sleep|water|warm|energy|tired|heat", "",
      "A flamingo's pink color comes from the food it eats."],
    ["ostrich", "ostriches", "bird", "in dry grasslands and deserts in Africa", "africa|grass|desert|dry|savanna", "plants, seeds, and sometimes insects", "plant|seed|insect|bug|leaves|grass",
      "+long, strong legs", "leg", "run very fast", "run|fast|speed|quick", "Ostriches lay the biggest eggs of any bird alive today.", "egg|big|biggest|large",
      "run faster than any other bird", "run|fast|speed", "escape from lions and other hunters", "escape|away|safe|lion|danger|predator|hunter", "",
      "Ostriches are the largest birds in the world, and they cannot fly."],
    ["sea otter", "sea otters", "mammal", "in shallow ocean waters along the Pacific coast", "ocean|sea|coast|water|pacific|kelp", "sea urchins, crabs, and clams", "urchin|crab|clam|shell",
      "the thickest fur of any animal", "fur|thick", "stay warm in cold water", "warm|cold|water|heat", "Sea otter pups float on their mothers' bellies.", "float|belly|mother|mom|pup|chest",
      "use rocks as tools to crack open shells", "rock|tool|crack|open|shell|stone", "get to the food inside", "food|eat|inside|meat|get", "C",
      "Sea otters sometimes hold paws while they sleep so they do not drift apart."],
    ["hippo", "hippos", "mammal", "in rivers and lakes in Africa", "river|lake|water|africa|mud", "grass", "grass|plant",
      "+eyes, ears, and nostrils on top of its head", "eye|ear|nostril|nose|top|head", "see, hear, and breathe while mostly underwater", "see|hear|breath|underwater|water", "Baby hippos can be born underwater.", "underwater|water|born",
      "stay in the water for most of the day", "water|day|stay|underwater", "keep its skin cool and safe from the hot sun", "cool|hot|sun|skin|burn|heat|wet", "H",
      "Hippos come out of the water at night to eat grass."],
    ["rabbit", "rabbits", "mammal", "in meadows, woods, and fields, often in underground burrows", "meadow|wood|forest|field|burrow|underground|hole|warren|grass", "grass, clover, and other plants", "grass|clover|plant|carrot|vegetable|leaves|leaf",
      "+long ears", "ear", "hear danger coming", "hear|listen|danger|sound|enemy", "Baby rabbits are called kits.", "kit",
      "thump its back feet on the ground", "thump|stomp|feet|foot|stamp", "warn other rabbits that danger is near", "warn|danger|tell|other|signal|alert", "H",
      "A rabbit's teeth never stop growing."],
    ["red fox", "red foxes", "mammal", "in forests, fields, and even cities", "forest|field|city|town|wood|den", "mice, rabbits, berries, and insects", "mice|mouse|rabbit|berr|insect|bug|fruit",
      "+excellent ears", "ear|hear", "hear mice moving under snow or grass", "hear|mice|mouse|under|snow|food|find|hunt", "Baby foxes are called kits, and they are born in a den.", "kit|den",
      "pounce high into the air and dive onto its food", "pounce|jump|leap|dive", "catch mice hidden under snow or grass", "catch|mice|mouse|food|hunt|eat", "On",
      "A fox uses its bushy tail to keep warm when it curls up."],
    ["white-tailed deer", "white-tailed deer", "mammal", "in forests, fields, and at the edges of woods", "forest|field|wood|edge|meadow", "leaves, twigs, acorns, and grass", "leaves|leaf|twig|acorn|grass|plant",
      "a white tail", "tail|white", "flash a warning to other deer", "warn|signal|flash|danger|tell|other", "Baby deer are called fawns, and they have white spots.", "fawn|spot",
      "leap over tall fences and logs", "leap|jump", "escape from danger quickly", "escape|danger|away|safe|run|predator", "H",
      "Male deer grow new antlers every year."],
    ["salmon", "salmon", "fish", "in rivers and oceans", "river|ocean|sea|water|stream", "insects when young, and small fish and shrimp in the ocean", "insect|bug|fish|shrimp",
      "a strong tail", "tail|fin", "swim upstream and leap up waterfalls", "swim|leap|jump|upstream|waterfall", "Salmon lay their eggs in gravel at the bottom of rivers.", "egg|gravel|river|bottom",
      "find its way back to the river where it hatched", "back|home|river|return|find|way|hatch", "lay its own eggs there", "egg|lay|baby|babies", "C",
      "Salmon are born in rivers, grow up in the ocean, and return to the river as adults."],
    ["great white shark", "great white sharks", "fish", "in cool ocean waters around the world, often near coasts", "ocean|sea|coast|water", "seals, fish, and sea lions", "seal|fish|sea lion",
      "+rows of sharp teeth that are replaced when they fall out", "teeth|tooth|row|sharp", "bite and tear food", "bite|tear|eat|food|catch|chew", "Great white shark pups are born ready to swim and hunt on their own.", "pup|swim|own|alone|hunt",
      "sense tiny electric signals from other animals", "sense|electric|signal|feel", "find animals that are hiding", "find|prey|food|hunt|hiding|hidden|catch", "C",
      "Sharks have skeletons made of bendy cartilage instead of bone."],
    ["jellyfish", "jellyfish", "", "in oceans all over the world", "ocean|sea|water", "tiny fish, shrimp, and plankton", "fish|shrimp|plankton|tiny",
      "+long tentacles that can sting", "tentacle|sting", "catch food and defend itself", "catch|food|defend|protect|safe|sting|grab", "Young jellyfish start out as tiny polyps attached to rocks.", "polyp|rock|attach",
      "drift with the ocean currents", "drift|float|current|wave", "travel without using much energy", "energy|travel|move|easy|float|rest|without", "C",
      "A jellyfish has no brain, no heart, and no bones."],
    ["parrot", "parrots", "bird", "in warm rainforests and woodlands", "rainforest|forest|jungle|tree|warm|wood", "seeds, nuts, fruit, and flowers", "seed|nut|fruit|flower|berr",
      "a strong, curved beak", "beak|bill", "crack open hard nuts and seeds", "crack|open|nut|seed|break", "Many parrots lay their eggs in holes in trees.", "egg|hole|tree",
      "copy sounds it hears", "copy|sound|talk|repeat|mimic|word|voice", "fit in and communicate with its flock", "flock|fit|communicat|group|friend|family|belong|talk", "",
      "Some parrots can live for more than fifty years."],
    ["brown pelican", "brown pelicans", "bird", "along ocean coasts", "coast|ocean|sea|water|beach|shore", "fish", "fish",
      "a big pouch under its bill", "pouch|bill|beak|throat", "scoop up fish and water", "scoop|catch|fish|hold|water|net", "Pelicans build nests, and both parents feed the chicks.", "nest|parent|chick|feed",
      "dive into the water from high in the air", "dive|plunge|water|air|high", "catch fish swimming near the surface", "catch|fish|food|eat|hunt", "C",
      "A pelican tips its bill to drain out the water before it swallows the fish."],
    ["armadillo", "armadillos", "mammal", "in grasslands, forests, and deserts in the Americas", "grass|forest|desert|america|texas|burrow", "insects, grubs, and worms", "insect|bug|grub|worm|ant|beetle",
      "a shell made of bony plates", "shell|armor|plate|bone", "protect its body", "protect|safe|body|hurt|shield", "Nine-banded armadillos almost always have four identical babies at once.", "four|4|identical|same",
      "dig quickly with strong claws", "dig|claw|burrow", "find food and make burrows to hide in", "food|burrow|hide|home|safe|find|eat", "n",
      "An armadillo can hold its breath for several minutes."],
    ["platypus", "platypuses", "mammal", "in rivers and streams in eastern Australia", "river|stream|australia|water", "insects, worms, and shrimp from the riverbed", "insect|bug|worm|shrimp|crayfish",
      "a bill like a duck's", "bill|beak|duck", "sense food in muddy water", "sense|feel|find|food|mud|water", "A platypus is a mammal that lays eggs.", "egg|mammal",
      "swim with its eyes, ears, and nose closed", "swim|eye|close|shut", "keep water out while it hunts with its bill", "water|out|protect|hunt|bill|sense|feel", "Cn",
      "Platypus babies drink milk, just like other mammal babies."],
    ["bison", "bison", "mammal", "on the grasslands and prairies of North America", "grass|prairie|plain|america", "grass and other plants", "grass|plant|sedge",
      "a big hump of muscle on its shoulders", "hump|muscle|shoulder", "swing its huge head to push snow out of the way", "push|snow|swing|head|plow|clear|dig", "A baby bison is called a calf and has reddish-orange fur.", "calf|red|orange",
      "run as fast as a horse", "run|fast", "escape from wolves and other danger", "escape|wolf|wolves|danger|safe|away", "H",
      "Bison are the heaviest land animals in North America."],
    ["puffin", "puffins", "bird", "on rocky cliffs and islands by the cold northern ocean", "cliff|island|ocean|sea|rock|north|cold", "small fish", "fish|eel|herring",
      "+wings that work for both flying and swimming", "wing", "fly in the air and swim underwater", "fly|swim|underwater|water|air", "A baby puffin is called a puffling.", "puffling",
      "carry many small fish in its beak at once", "carry|fish|beak|many|hold|at once", "bring plenty of food back to its chick", "chick|food|baby|bring|feed|back", "C",
      "Puffins dig burrows in the ground to make their nests."],
    ["black bear", "black bears", "mammal", "in forests and mountains in North America", "forest|mountain|wood|america", "berries, nuts, plants, insects, and fish", "berr|nut|plant|insect|bug|fish|honey|fruit",
      "+short, curved claws", "claw", "climb trees", "climb|tree", "Black bear cubs are born in winter while their mother rests in a den.", "cub|winter|den",
      "sleep through much of the winter", "sleep|winter|hibernat|rest|den", "save energy when food is hard to find", "energy|food|hard|cold|little|save|hungry|scarce", "O",
      "Black bears are not always black. Some are brown or even cinnamon colored."],
    ["chicken", "chickens", "bird", "on farms", "farm|coop|barn", "seeds, grain, bugs, and worms", "seed|grain|corn|bug|worm|insect",
      "a sharp beak", "beak", "peck food off the ground", "peck|food|eat|pick|ground", "Baby chickens, called chicks, ^hatch from eggs.", "chick|egg|hatch",
      "scratch the ground with its feet", "scratch|dig|feet|foot|ground", "find bugs and seeds to eat", "bug|seed|food|find|eat|worm", "O",
      "A mother hen clucks to call her chicks."],
    ["cow", "cows", "mammal", "on farms and in grassy fields", "farm|field|grass|barn|pasture", "grass and hay", "grass|hay|plant",
      "a stomach with four parts", "stomach|four|4|tummy|belly", "break down tough grass", "break|digest|grass|food|chew|tough", "A baby cow is called a calf.", "calf",
      "chew its cud, which is food it brings back up to chew again", "cud|chew|again", "get more from tough grass", "food|digest|break|grass|tough|energy|more", "H",
      "Cows spend many hours each day eating and chewing."],
    ["duck", "ducks", "bird", "on ponds, lakes, and rivers", "pond|lake|river|water", "water plants, seeds, insects, and small fish", "plant|seed|insect|bug|fish|snail|weed",
      "+webbed feet", "web|feet|foot", "paddle through the water", "paddle|swim|water|push", "Baby ducks, called ducklings, follow their mother in a line.", "duckling|follow|line|mother|mom",
      "spread oil on its feathers", "oil|feather|preen", "keep its feathers waterproof", "waterproof|dry|water|wet|float", "O",
      "A duck's feathers keep it warm even in cold water."],
    ["sheep", "sheep", "mammal", "on farms and in hilly fields", "farm|field|hill|meadow|pasture|grass", "grass and clover", "grass|clover|hay|plant",
      "a thick coat of wool", "wool|coat|fur|fleece", "keep warm", "warm|cold", "A baby sheep is called a lamb.", "lamb",
      "remember the faces of other sheep", "face|recogni|remember|knows", "stay close to its flock", "flock|friend|together|group|family|close", "H",
      "Farmers cut a sheep's wool once a year, and it grows back."],
    ["horse", "horses", "mammal", "on farms, ranches, and open grasslands", "farm|ranch|grass|field|stable|barn|pasture", "grass, hay, and oats", "grass|hay|oat|grain|carrot|apple",
      "+strong legs and hard hooves", "leg|hoof|hooves", "run fast and walk on rough ground", "run|fast|walk|ground|gallop", "A baby horse, called a foal, can stand within an hour or two of being born.", "foal|stand|hour",
      "sleep standing up", "sleep|stand", "be ready to run from danger right away", "run|danger|ready|escape|quick|safe|away", "H",
      "Horses can see almost all the way around their bodies."],
    ["goat", "goats", "mammal", "on farms and on rocky mountains", "farm|mountain|rock|hill|cliff", "grass, leaves, twigs, and shrubs", "grass|leaves|leaf|twig|shrub|bush|plant|hay",
      "+split hooves with soft pads", "hoof|hooves|pad|feet|foot", "grip rocky ground", "grip|rock|climb|slip|hold|steep", "A baby goat is called a kid.", "kid",
      "climb steep rocks and cliffs", "climb|rock|cliff|steep", "find food and stay away from danger", "food|danger|safe|away|escape|eat", "H",
      "Goats are curious and like to explore everything."],
    ["pig", "pigs", "mammal", "on farms", "farm|pen|barn|mud|sty", "corn, grains, vegetables, and fruit", "corn|grain|vegetable|fruit|food|scrap",
      "a flat, round snout", "snout|nose", "dig in the dirt for food", "dig|dirt|ground|root|food|sniff|smell", "Baby pigs are called piglets.", "piglet",
      "roll in mud", "mud|roll|wallow", "stay cool, because pigs cannot sweat much", "cool|sweat|hot|heat|sun|temperature", "O",
      "Pigs are very smart and can learn tricks."],
    ["dog", "dogs", "mammal", "in homes all around the world", "home|house|family|people", "dog food made from meat and grains", "food|meat|kibble|dog food",
      "an amazing nose", "nose|smell|sniff", "smell things people cannot", "smell|sniff|find|track", "Baby dogs are called puppies.", "pupp",
      "learn many words and commands", "learn|word|command|trick|sit|listen", "work and play with people", "people|help|work|play|human|owner|family", "O",
      "Some dogs help people by guiding them, herding sheep, or finding lost hikers."],
    ["cat", "cats", "mammal", "in homes, barns, and neighborhoods", "home|house|barn|neighbor|family", "cat food made from meat or fish", "food|meat|fish|mice|mouse",
      "+long whiskers", "whisker", "feel things around it, even in the dark", "feel|touch|dark|sense|space|fit|squeeze", "Baby cats are called kittens.", "kitten",
      "twist in the air to land on its feet", "land|feet|foot|fall|flip|twist|turn", "keep from getting hurt when it falls", "hurt|safe|injur|pain|keep", "C",
      "A cat's rough tongue works like a comb to clean its fur."],
    ["goldfish", "goldfish", "fish", "in ponds and fish tanks", "pond|tank|bowl|water|aquarium", "fish flakes, plants, and tiny bugs", "flake|food|plant|bug|insect",
      "+gills", "gill", "breathe underwater", "breath|water|air|oxygen", "Goldfish lay eggs that stick to water plants.", "egg|plant",
      "remember things for months", "remember|memory|month", "learn when it is feeding time", "food|feed|time|learn|eat", "O",
      "Goldfish can grow much bigger in a pond than in a small bowl."],
    ["box turtle", "box turtles", "reptile", "in forests and grassy fields, often near water", "forest|wood|field|grass|water", "worms, berries, mushrooms, and plants", "worm|berr|mushroom|plant|insect|bug|fruit",
      "a hard, high shell", "shell", "protect its body", "protect|safe|body|hide|hard", "Box turtles ^hatch from eggs buried in the soil.", "egg|soil|dirt|bury|ground|hatch",
      "close its shell up tight like a box", "close|shut|shell|tight|box|hide", "hide safely from danger", "hide|safe|danger|enemy|predator|protect", "O",
      "Some box turtles live for more than fifty years."],
    ["field mouse", "field mice", "mammal", "in fields, forests, and sometimes houses", "field|forest|house|nest|grass|barn|wood", "seeds, grains, and insects", "seed|grain|insect|bug|corn|nut",
      "+long whiskers", "whisker", "feel its way in the dark", "feel|dark|way|sense|touch", "Baby mice are called pups.", "pup",
      "squeeze through tiny holes", "squeeze|hole|tiny|small|fit|gap", "get to food and escape from cats and owls", "food|escape|safe|hide|cat|owl|danger|away", "On",
      "A mouse's long tail helps it balance when it climbs."],
    ["garter snake", "garter snakes", "reptile", "in fields, forests, gardens, and wet places", "field|forest|garden|grass|wet|water|marsh|pond", "worms, frogs, slugs, and small fish", "worm|frog|slug|fish|toad|bug",
      "a forked tongue", "tongue|fork", "smell the air", "smell|sniff|scent|air|taste", "Garter snakes give birth to live babies instead of laying eggs.", "live|birth|born|not egg|no egg",
      "shed its skin as it grows", "shed|skin|molt", "make room to grow bigger", "grow|room|bigger|big|tight|new", "C",
      "Garter snakes warm up by lying in the sun."],
    ["gecko", "geckos", "reptile", "in warm places around the world, often on walls and trees", "warm|wall|tree|rock|house|tropic|desert|forest", "insects such as crickets and moths", "insect|bug|cricket|moth|fly",
      "+toes covered in tiny hairs", "toe|hair|feet|foot|pad", "stick to walls and even ceilings", "stick|wall|ceiling|climb|grip|cling", "Most geckos lay eggs, often two at a time.", "egg|two|2",
      "drop its tail if something grabs it", "tail|drop|lose|break", "escape while the tail wiggles", "escape|away|run|safe|distract|trick|predator|danger", "C",
      "A gecko can grow a new tail after losing one."],
    ["earthworm", "earthworms", "", "underground in soil", "soil|dirt|ground|underground|mud|earth", "dead leaves and bits of plants in the soil", "leaves|leaf|plant|dead|soil|dirt",
      "+tiny bristles on its body", "bristle|hair|body", "grip the soil as it moves", "grip|move|crawl|hold|dig|soil|push", "Baby worms ^hatch from small cocoons in the soil.", "cocoon|egg|hatch",
      "dig tunnels in the soil", "tunnel|dig", "let air and water into the ground, which helps plants grow", "air|water|plant|grow|soil|help|garden", "",
      "Earthworms have no eyes, but they can sense light."],
    ["crab", "crabs", "", "on beaches, in tide pools, and on the ocean floor", "beach|tide|pool|ocean|sea|sand|shore|rock|floor", "algae, small animals, and bits of food", "algae|small|food|bits|plant|fish|worm|clam",
      "+two strong claws", "claw|pincer|pinch", "grab food and protect itself", "grab|food|protect|pinch|hold|catch|defend", "Crabs ^hatch from eggs as tiny babies that float in the ocean.", "egg|float|tiny|hatch",
      "walk sideways", "sideways|side", "move quickly, because of the way its legs bend", "quick|fast|leg|bend|move|easy|way", "O",
      "A crab grows by shedding its old shell and making a bigger one."],
    ["dragonfly", "dragonflies", "insect", "near ponds, lakes, and streams", "pond|lake|stream|water|river", "mosquitoes, flies, and other flying insects", "mosquito|fly|flies|insect|bug|gnat",
      "+four see-through wings", "wing|four|4|clear|see-through", "fly forward, backward, and hover", "fly|forward|backward|hover|turn", "Young dragonflies, called nymphs, live underwater.", "nymph|underwater|water",
      "catch insects while flying", "catch|insect|bug|fly|air|hunt", "eat without having to land", "eat|food|land|stop|fly|air|without", "C",
      "Dragonflies have huge eyes that see in almost every direction."],
    ["moose", "moose", "mammal", "in cold northern forests near lakes and wetlands", "forest|north|cold|lake|wet|swamp|marsh|pond|canada|alaska", "leaves, twigs, and water plants", "leaves|leaf|twig|plant|bark|water plant",
      "+huge antlers on the males", "antler|horn", "show off their strength to other moose", "strength|strong|show|other|male|impress", "A baby moose, called a calf, can outrun a person when it is only a few days old.", "calf|run|day|fast",
      "swim well and dive for water plants", "swim|dive|water", "reach food at the bottom of lakes", "food|plant|bottom|lake|eat|reach", "H",
      "Moose are the largest members of the deer family."],
    ["toucan", "toucans", "bird", "in rainforests of Central and South America", "rainforest|forest|jungle|tree|america", "fruit, insects, and small animals", "fruit|berr|insect|bug|small animal|egg",
      "a huge, colorful bill that is light and hollow inside", "bill|beak|color", "reach fruit at the ends of branches", "reach|fruit|branch|food|pick|grab|eat", "Toucans nest in holes in trees.", "hole|tree|nest",
      "give off heat through its big bill", "heat|bill|beak|cool", "stay cool in the hot rainforest", "cool|hot|heat|temperature", "O",
      "A toucan tosses fruit into the air and catches it in its bill."],
    ["snow leopard", "snow leopards", "mammal", "high in the cold, rocky mountains of Central Asia", "mountain|rock|cold|asia|snow|high|himalaya", "wild sheep and goats", "sheep|goat|animal|meat",
      "a long, thick tail", "tail|thick|long", "keep its balance and wrap around its body for warmth", "balance|warm|wrap|cold|steady|fall", "Snow leopard cubs are born in rocky dens.", "cub|den|rock|cave",
      "leap a long way across rocky ground", "leap|jump|far", "catch food on steep mountain slopes", "catch|food|hunt|prey|steep|mountain|slope|rock|chase", "C",
      "Snow leopards have wide, furry paws that work like snowshoes."],
    ["orangutan", "orangutans", "mammal", "in rainforests on islands in Southeast Asia", "rainforest|forest|jungle|asia|island|borneo|sumatra|tree", "fruit, leaves, and bark", "fruit|fig|leaves|leaf|bark",
      "+very long, strong arms", "arm|long|strong", "swing and climb through the trees", "swing|climb|tree|branch|move", "A baby orangutan stays with its mother for about seven or eight years.", "mother|mom|year|seven|eight|7|8|long",
      "use big leaves as umbrellas when it rains", "leaves|leaf|umbrella|rain|cover", "stay dry", "dry|wet|rain|cover|water", "",
      "Orangutans spend most of their lives up in the trees."],
    ["manatee", "manatees", "mammal", "in warm, shallow coastal waters and rivers", "warm|shallow|coast|water|river|ocean|sea|florida|spring", "sea grass and other water plants", "grass|plant|weed|seagrass",
      "a flat, paddle-shaped tail", "tail|paddle|flat", "push itself slowly through the water", "push|swim|move|water|slow", "A manatee calf drinks its mother's milk underwater.", "calf|milk",
      "hold its breath for up to twenty minutes while resting", "breath|minute|hold|underwater", "rest underwater", "rest|sleep|underwater|water|stay under", "H",
      "Manatees are sometimes called sea cows because they graze on plants."],
    ["harbor seal", "harbor seals", "mammal", "along cool ocean coasts", "ocean|sea|coast|shore|beach|rock|cold|cool", "fish, squid, and crabs", "fish|squid|crab|shrimp",
      "a thick layer of fat called ^blubber", "blubber|fat|thick", "stay warm in cold water", "warm|cold|water", "A seal pup can swim within hours of being born.", "pup|swim|hour",
      "sense moving fish with its whiskers", "whisker|sense|feel|fish", "find food in dark or cloudy water", "find|food|fish|dark|cloud|murky|see|hunt", "C",
      "Seals rest on rocks and beaches between swims."],
    ["ladybug", "ladybugs", "insect", "in gardens, fields, and forests", "garden|field|forest|plant|leaf|leaves", "tiny insects called aphids", "aphid|insect|bug",
      "a bright red or orange shell with spots", "red|orange|spot|shell|color|bright", "warn birds that it tastes bad", "warn|bad|taste|bird|eat|danger|yuck", "Ladybugs lay their eggs on leaves near aphids.", "egg|leaves|leaf|aphid",
      "play dead when it is in danger", "dead|still|play", "trick hungry animals into leaving it alone", "trick|alone|safe|eat|danger|predator|fool", "C",
      "Gardeners like ladybugs because they eat bugs that harm plants."]
  ];

  const GROUPDEF = {
    mammal: "an animal with hair or fur that feeds its babies milk", bird: "an animal with feathers that hatches from an egg",
    reptile: "an animal with dry, scaly skin", amphibian: "an animal that can live both in water and on land",
    insect: "a small animal with six legs and three body parts", fish: "an animal that lives in water and breathes with gills"
  };
  const DIET = { H: ["herbivore", "eats only plants"], C: ["carnivore", "eats other animals"], O: ["omnivore", "eats both plants and animals"] };
  function lastWord(s) { return s.split(/[ -]/).pop().toLowerCase(); }
  function animalPassage(c) {
    const a = P(FACTS), b = c.band, fl = a[17] || "";
    const featPl = a[7].charAt(0) === "+";
    Object.assign(c, { kind: "passage", an: a[0], pl: a[1], grp: a[2], home: a[3], homeK: a[4], food: a[5], foodK: a[6],
      feat: featPl ? a[7].slice(1) : a[7], featK: a[8], use: a[9], useK: a[10], baby: a[11], babyK: a[12], skill: a[13], skillK: a[14], why: a[15], whyK: a[16],
      featIt: featPl ? "they" : "it", featHelps: featPl ? "help" : "helps", featDoes: featPl ? "do" : "does", hunt: fl.indexOf("C") !== -1 ? "hunt for" : "look for" });
    const names = [lastWord(a[0]), stem(lastWord(a[1])), a[0].toLowerCase()];
    ["bee", "fish", "worm", "bug", "bird", "star", "monarch"].forEach(function (x) { if (a[0].indexOf(x) !== -1) names.push(x); });
    c.nK = uniq(names).join("|");
    c.subject = "animal:" + a[0];
    const f = c.f, s = [];
    const say = function (t) { s.push(fill(t, c, true)); };
    const omit = c.focus === "infer" ? 0.85 : 0.35;
    const keepUse = !chance(omit), keepWhy = !chance(omit);
    if (b === 0) {
      if (chance(0.6)) say(P(["This is {a:an}.", "Look at the {an}!", "Have you ever seen {a:an}?", "Meet the {an}."]));
      const drop = chance(0.5) ? P(["home", "food", "feat", "skill"]) : "";
      if (drop !== "home") { f.home = 1; say("{A:an} lives {home}."); }
      if (drop !== "food") { f.food = 1; say("It eats {food}."); }
      if (drop !== "feat") { f.feat = 1; say("It has {feat}."); }
      if (drop !== "skill") { f.skill = 1; say(P(["It can {skill}!", "{A:an} can {skill}."])); }
    } else {
      const open = [["Have you ever seen {a:an}?", "{Pl} are amazing animals.", "Let's learn about {pl}.", "What do you know about {pl}?", "{A:an} is a very interesting animal."],
        ["{Pl} are fascinating animals.", "Few animals are as interesting as the {an}.", "Scientists have learned a lot about how {pl} live.", "What lives {home}, eats {food}, and can {skill}? The {an} does!"],
        ["Few animals are as well suited to their surroundings as the {an}.", "Every animal has its own ways of surviving, and the {an} is no exception.",
          "Scientists who study {pl} have discovered many ^remarkable things about how they live.", "At first glance, {a:an} may seem ordinary, but its body and habits are full of surprises."]][Math.min(2, b - 1)];
      if (chance(b === 1 ? 0.6 : 0.8)) say(P(open));
      if (c.grp && chance(0.45)) { f.grp = 1; say(b === 1 ? "{A:an} is {a:grp}." : "{A:an} is " + an(c.grp).replace(/ (\w+)$/, " ^$1") + ", " + GROUPDEF[c.grp] + "."); }
      f.home = 1;
      say(b === 1 ? P(["{Pl} live {home}.", "You can find {pl} {home}."]) : P(["The {an} makes its home {home}.", "{Pl} are found {home}.", "The {an}'s ^habitat is {home}."]));
      const diet = DIET[fl.replace(/[^HCO]/g, "")];
      if (diet && b >= 2 && chance(0.5)) { f.diet = 1; c.dietW = diet[0]; say("{A:an} is " + an(diet[0]).replace(/ (\w+)$/, " ^$1") + ", which means it " + diet[1] + "."); }
      if (chance(0.85)) { f.food = 1; say(b === 1 ? P(["They eat {food}.", "{Pl} eat {food}."]) : P(["{Pl} eat {food}.", "For food, {pl} {hunt} {food}."])); }
      f.feat = 1;
      if (keepUse) { f.use = 1; say(b === 1 ? "{A:an} has {feat}. " + (featPl ? "These help" : "This helps") + " it {use}." : P(["Thanks to {feat}, {a:an} can {use}.", "{A:an} has {feat}, and " + c.featIt + " " + c.featHelps + " it {use}."])); }
      else say(featPl ? "{A:an} has {feat}." : P(["{A:an} has {feat}.", "One special thing about {a:an} is {feat}."]));
      if (b === 3 && chance(0.45)) { f.adapt = 1; say("A helpful body part like this is called an ^adaptation."); }
      f.skill = 1;
      if (keepWhy) { f.why = 1; say(b === 1 ? P(["{A:an} can also {skill}. This helps it {why}.", "{A:an} can {skill}. It does this to {why}."]) : P(["{A:an} can {skill}, which helps it {why}.", "{A:an} is able to {skill}. This helps it {why}."])); }
      else say(b === 1 ? "{A:an} can also {skill}." : P(["Another amazing fact is that {a:an} can {skill}.", "{A:an} can also {skill}."]));
      if (b >= 2 && /blend/.test(c.skillK + c.useK) && chance(0.5)) say("Blending in like this is called ^camouflage.");
      if (b >= 2 && fl.indexOf("n") !== -1 && chance(0.6)) { f.night = 1; say(P(["{Pl} are ^nocturnal, which means they are most active at night.", "{Pl} are ^nocturnal, so they rest during the day and are busy at night."])); }
      if (b >= 2 && /predator/.test(c.whyK) && chance(0.35)) say("Animals that hunt other animals for food are called ^predators.");
      if (chance(0.6)) { f.baby = 1; say(c.baby); }
      if (a[18] && chance(b === 1 ? 0.3 : 0.5)) say(a[18]);
      if (b >= 2 && chance(0.5)) say(P(["{Pl} are well suited for life {home}.", "The next time you see {a:an}, think about all the ways it is built to survive.",
        "@3 Every part of the {an}'s body and behavior helps it survive.", "@3 Its body and habits work together to help it survive {home}."].map(function (v) { const r = parseVar(v, c); return r ? r.t : null; }).filter(Boolean)));
    }
    const Q = [
      ["main", "0", "", "What animal is this about?", "It is about {a:an}.", "Look at the first sentence.", "{nK}"],
      ["main", "0", "", "What is this mostly about?", "It is about {pl} and how they live.", "What animal is in every sentence?", "{nK}"],
      ["main", "1+", "", ["What is this passage mostly about?", "What is the topic of this passage?"], "It is about {pl}: where they live, what they eat, and how they stay safe.", "What animal is in almost every sentence, and what do you learn about it?", "{nK}", "live|home|eat|food|safe|body|special|fact|grow|skill|surviv|how|baby|babies"],
      ["main", "1-2", "", "What would be a good title for this passage?", "A good title would be \"All About {Pl}.\"", "What is every sentence about?", "{nK}"],
      ["main", "2+", "", "What is the main idea of this passage?", "{Pl} have special bodies and skills that help them live {home}.", "What do most of the facts have in common?", "{nK}", "body|skill|special|help|surviv|live|adapt|feature|built"],
      ["main", "3", "", ["Why did the author write this passage?", "What is the author's purpose?"], "To inform readers about how {pl} live and survive.", "Is the author telling a story, giving facts, or trying to change your mind?", "inform|teach|learn|explain|tell|fact|show|knows|educat"],
      ["detail", "", "home", ["Where do {pl} live?", "Where can you find {pl}?"], "{Pl} live {home}.", "Find the sentence that tells where they live.", "{homeK}"],
      ["detail", "", "food", "What do {pl} eat?", "They eat {food}.", "Look for the word \"eat\" or \"food.\"", "{foodK}"],
      ["detail", "", "feat", ["What special body part does {a:an} have?", "What body part does the passage describe?"], "It has {feat}.", "Look for a part of the body.", "{featK}"],
      ["detail", "", "use", "How " + c.featDoes + " {feat} help {a:an}?", cap(c.featIt) + " " + c.featHelps + " it {use}.", "Find the sentence about {feat}.", "{useK}"],
      ["detail", "", "skill", ["What special thing can {a:an} do?", "What skill does the passage describe?"], "It can {skill}.", "Look for the word \"can.\"", "{skillK}"],
      ["detail", "", "why", "Why is it helpful for {a:an} to {skill}?", "It helps it {why}.", "Find the sentence about what {a:an} can do.", "{whyK}"],
      ["detail", "1+", "baby", "What does the passage tell you about baby {pl}?", c.baby, "Find the sentence about babies.", "{babyK}"],
      ["detail", "1+", "grp", "What kind of animal is {a:an}?", "It is {a:grp}.", "Find the sentence that names the group.", "{grp}"],
      ["detail", "2+", "night", "When are {pl} most active?", "At night.", "Find the word \"nocturnal.\"", "night|dark|evening"],
      ["infer", "", "feat !use", "How do you think {feat} " + (featPl ? "help" : "helps") + " {a:an}?", cap(c.featIt) + " " + c.featHelps + " it {use}.", "Think about what {a:an} needs to do to eat and stay safe.", "{useK}"],
      ["infer", "", "skill !why", "Why do you think it is useful for {a:an} to {skill}?", "So it can {why}.", "Think about what {a:an} needs to find food and stay safe.", "{whyK}"],
      ["infer", "2+", "food", "What might happen to {pl} if they could not find the foods they eat?", "They would go hungry and might have to move somewhere else to find food.", "Think about what every animal needs to survive.", "hungry|starv|food|move|die|find|eat|weak|surviv"]
    ];
    return { title: fill(P(b === 0 ? ["The {An}", "Look at the {An}!", "Meet the {An}", "{Pl}!"] :
      ["All About {Pl}", "The Amazing {An}", "{Pl} Up Close", "How {Pl} Live", "Meet the {An}", "{Pl}: Built to Survive", "The Secret Life of {Pl}", "Life as {a:an}"]), c),
      sents: s, qs: runQs(c, Q), subject: c.subject };
  }

  /* ================= HOW-TO TEXTS =================
     [bands, task ("how to ..."), keys, you will need, keys, purpose ("so you can ..."), result sentence, safety note,
      young step numbers, ...steps "do this~short name~keys~reason (so/because/to ...)~keys"] */
  const HOWTO = [
    ["", "plant a bean seed", "plant|seed|grow|bean", "a paper cup, some soil, a bean seed, and water", "cup|soil|dirt|seed|water", "watch a plant grow", "In about a week, a tiny green sprout should poke up.", "", "1,2,3",
      "poke a few small holes in the bottom of a paper cup~poke holes in the cup~hole|poke|bottom~so extra water can drain out~water|drain|out|extra|too much",
      "fill the cup with soil~fill the cup~soil|dirt|fill~so the seed has a place to grow roots~root|grow|place|home",
      "push the seed about one inch into the soil~push in the seed~seed|push|inch~so it stays dark and ^damp while it starts to grow~dark|damp|wet|cover|safe",
      "water the soil until it is damp but not ^soggy~water the soil~water|damp~because seeds need water to start growing~water|need|grow|drink",
      "set the cup in a sunny window~set the cup in the window~sun|window|light~because plants need sunlight to make food~sun|light|food|grow"],
    ["", "wash your hands", "wash|hand|clean", "soap, clean water, and a towel", "soap|water|towel", "keep germs away", "Now your hands are clean and ready.", "", "0,1,3,4",
      "wet your hands with clean water~wet your hands~wet|water~so the soap can spread easily~soap|spread|easy|bubbl",
      "rub soap all over your hands, even between your fingers~rub on soap~soap|rub|finger~because soap helps lift germs off your skin~germ|dirt|clean|lift",
      "scrub for twenty seconds, about as long as humming a short song twice~scrub for twenty seconds~scrub|twenty|20|second|song~because it takes time to get rid of germs~time|germ|long|clean",
      "rinse off all the soap~rinse off the soap~rinse|soap|water~to wash the germs down the drain~germ|drain|away|wash|off",
      "dry your hands with a clean towel~dry your hands~dry|towel~because germs spread more easily from wet hands~germ|wet|spread"],
    ["2+", "make a paper airplane", "airplane|plane|paper|fly", "one sheet of paper", "paper|sheet", "fly a plane across the room", "With a little practice, your plane will glide across the room.", "", "0,3,5",
      "fold the paper in half the long way, then open it back up~fold it in half~fold|half~to make a ^crease down the middle~crease|line|middle|center",
      "fold the two top corners down to the middle crease~fold the corners~corner|fold|top~to make a pointed nose~point|nose|front",
      "fold the slanted edges to the middle again~fold the edges again~edge|fold|again~to make the nose narrow and strong~narrow|thin|strong|sharp|point",
      "fold the plane in half along the first crease~fold it in half again~half|fold~so both sides match~match|same|even|both",
      "fold each side down to make the wings~fold down the wings~wing|fold~so the plane can float on the air~float|air|fly|glide|lift",
      "throw it gently, straight ahead~throw it gently~throw|gentl|toss~because a hard throw makes it crash~crash|hard|fall|dive"],
    ["", "make lemonade", "lemonade|lemon", "lemons, sugar, cold water, ice, and a pitcher", "lemon|sugar|water|ice|pitcher", "cool off on a hot day", "Pour a glass and enjoy your lemonade!", "Ask a grown-up to cut the lemons, because knives are sharp.", "0,1,2,3",
      "ask a grown-up to cut the lemons in half~ask a grown-up to cut the lemons~cut|lemon|half~because knives are sharp~sharp|knife|safe|cut|hurt",
      "squeeze the juice into a pitcher~squeeze the juice~squeez|juice~because the juice gives lemonade its flavor~flavor|taste|lemon|sour",
      "stir in the sugar until it ^dissolves~stir in the sugar~stir|sugar|dissolv~so the lemonade is sweet instead of sour~sweet|sour|taste",
      "add cold water and stir again~add the water~water|cold~because plain lemon juice is too strong~strong|sour|too|juice",
      "add ice and take a sip to taste it~add ice~ice|taste|sip~so you can check if it needs more sugar~sugar|sweet|check|taste|right"],
    ["", "make a pinecone bird feeder", "bird|feeder|pinecone|pine cone", "a pinecone, string, sunflower seed butter, birdseed, and a plate", "pinecone|pine cone|string|butter|birdseed|seed|plate", "help birds in winter", "Soon, hungry birds will come to visit.", "", "0,1,2,3",
      "tie a long string around the top of the pinecone~tie on the string~tie|string~so you can hang it up later~hang|later|up",
      "spread sunflower seed butter all over the pinecone with a spoon~spread on the seed butter~spread|butter|spoon~so the seeds will stick~stick|seed|glue",
      "roll the pinecone in birdseed on a plate~roll it in birdseed~roll|birdseed|seed~so birds have plenty to eat~bird|eat|food|plenty",
      "hang it on a tree branch~hang it on a branch~hang|tree|branch~so birds can find it~bird|find|see|reach",
      "watch quietly from a window~watch from a window~watch|window|quiet~so you do not scare the birds away~scare|bird|away|fly"],
    ["", "brush your teeth", "brush|teeth|tooth", "a toothbrush, toothpaste, and water", "toothbrush|brush|toothpaste|paste|water", "keep your teeth healthy", "Now your smile is clean and fresh.", "", "0,1,2,4",
      "squeeze a pea-sized bit of toothpaste onto your toothbrush~add the toothpaste~toothpaste|paste|pea~because a little toothpaste is enough~little|enough|small|too much",
      "brush the fronts of your teeth in small, gentle circles~brush the fronts~front|circle|gentl~because brushing too hard can hurt your gums~gum|hurt|hard|gentl",
      "brush the backs and tops of your teeth too~brush the backs and tops~back|top~because food hides in the back teeth~food|hide|back|germ|stuck",
      "keep brushing for two minutes~brush for two minutes~two|2|minute~because it takes time to clean every tooth~time|every|clean|all",
      "spit out the toothpaste and rinse your brush~spit and rinse~spit|rinse~to get the leftover toothpaste out~clean|out|leftover|paste|germ"],
    ["", "set the table", "table|set|dinner|meal", "plates, forks, knives, spoons, cups, and napkins", "plate|fork|knife|knives|spoon|cup|napkin", "get ready for a family dinner", "Now the table is ready, and everyone can sit down to eat.", "", "0,1,2,3",
      "put a plate in front of each chair~put out the plates~plate|chair~so everyone has a place to eat~everyone|place|each|eat",
      "set a fork on the left side of each plate~set the forks~fork|left~because that is where people expect to find it~expect|find|reach|hand|always|usual",
      "put a knife and a spoon on the right side~put out the knives and spoons~knife|knives|spoon|right~so they are easy to reach~reach|easy|hand",
      "place a cup above the knife~place the cups~cup|above|glass~so it is easy to grab without spilling~spill|grab|easy|reach",
      "fold a napkin and put it beside each plate~add the napkins~napkin|fold~so people can wipe their hands and mouths~wipe|clean|hand|mouth|mess"],
    ["", "build a snowman", "snowman|snow", "lots of sticky snow, two sticks, small stones, and a carrot", "snow|stick|stone|rock|carrot", "make a friendly snow figure", "Now your snowman is ready to wave hello.", "", "1,2,3,4",
      "pack some snow into a small, hard ball~pack a small snowball~pack|ball|snowball~because a hard ball holds together~hold|together|hard|fall apart",
      "roll the ball across the snow until it is big and round~roll the snowball~roll|big~so it picks up more snow and grows~grow|bigger|pick|more",
      "make a second ball and a third, smaller ball the same way~make two more balls~second|third|small|two|more~because a snowman has three parts~three|3|part|body|head",
      "stack the balls with the biggest on the bottom~stack the balls~stack|bottom|big~so the snowman does not tip over~tip|fall|over|balance|steady",
      "add stones for eyes, a carrot nose, and stick arms~add the face and arms~stone|rock|carrot|stick|arm|eye|nose~to give it a face and arms~face|arm|look|friend"],
    ["", "make a thank-you card", "card|thank", "paper, crayons or markers, and an envelope", "paper|crayon|marker|envelope", "show someone you are grateful", "When you give your card, you will make someone smile.", "", "0,1,2,3",
      "fold a sheet of paper in half~fold the paper~fold|half|paper~so it opens like a book~open|book|card",
      "draw a bright picture on the front~draw on the front~draw|picture|front~to make the card cheerful~cheer|pretty|happy|bright|nice",
      "write a thank-you message inside~write a message~write|message|inside|thank~so the person knows why you are thankful~knows|why|thank",
      "sign your name at the bottom~sign your name~sign|name~so they know who it is from~who|knows|from",
      "put the card in an envelope and give it to the person~give the card~envelope|give|deliver~so it stays clean until they open it~clean|safe|surprise|open"],
    ["", "build a sandcastle", "sandcastle|castle|sand", "a bucket, a shovel, sand, and water", "bucket|shovel|sand|water", "build a castle at the beach", "Now you have a castle fit for a crab king.", "", "0,1,2,4",
      "mix water into the sand until it is damp~wet the sand~water|wet|damp~because damp sand sticks together~stick|together|hold|shape",
      "pack the damp sand tightly into a bucket~pack the bucket~pack|bucket|tight~so the tower keeps its shape~shape|hold|strong|fall",
      "flip the bucket over and lift it slowly~flip the bucket~flip|lift|over~so the tower slides out in one piece~piece|whole|break|crumbl|slide",
      "dig a ^moat around the castle with your shovel~dig a moat~dig|moat|ditch~to protect the castle from waves~wave|water|protect",
      "decorate the towers with shells and pebbles~decorate it~shell|pebble|decorat~to make the castle beautiful~beautiful|pretty|fancy|nice|cool"],
    ["", "bow in the dojo", "bow|dojo|karate|respect", "just yourself and a place to stand", "yourself|place|stand", "show respect in karate class", "A good bow shows respect to everyone in the dojo.", "", "0,1,3,4",
      "stand up tall with your feet together~stand tall~stand|tall|feet|together~so you look ready and calm~ready|calm|still|attention",
      "put your hands flat against your sides~put your hands at your sides~hand|side|flat~to show you are not distracted~distract|still|calm|focus|ready|attention",
      "look toward your teacher or partner~look at your partner~look|partner|teacher~to show you are paying attention~attention|respect|focus|listen",
      "bend forward from your waist and pause~bend from the waist~bend|waist|forward~because the bow is the sign of respect~respect|polite|honor|thank",
      "stand back up slowly~stand back up~stand|up|slow~so the bow looks calm and careful~calm|careful|respect|slow|smooth"],
    ["", "warm up before exercise", "warm|exercise|stretch", "comfortable clothes and a little space", "clothes|space|room|shoe", "get your body ready to move", "Now your muscles are warm and ready for action.", "", "0,1,2,4",
      "jog in place for one minute~jog in place~jog|run|minute~to get your heart pumping~heart|pump|blood|warm",
      "make ten big arm circles forward and ten backward~do arm circles~arm|circle~to loosen up your shoulders~shoulder|loose|arm",
      "do ten jumping jacks~do jumping jacks~jumping jack|jump~to warm up your whole body~whole|body|warm|muscle",
      "swing each leg forward and back ten times~swing your legs~leg|swing~to loosen your hips and legs~hip|leg|loose",
      "stretch gently, without bouncing~stretch gently~stretch|gentl~because bouncing can strain your muscles~muscle|hurt|strain|pull|injur"],
    ["", "recycle at home", "recycl|bin", "a recycling bin and a few empty containers", "bin|container|recycl", "help the planet", "Recycling turns old things into new ones and keeps trash out of landfills.", "", "0,1,3,4",
      "rinse out cans, jars, and bottles~rinse the containers~rinse|can|jar|bottle|clean~because food left inside can spoil a whole load~food|spoil|dirty|mess|smell",
      "flatten cardboard boxes~flatten the boxes~flat|cardboard|box~so they take up less space~space|room|fit|less",
      "check the recycling symbol on plastic containers~check the symbol~check|symbol|plastic|number~because not every plastic can be recycled~not every|some|can't|cannot|plastic",
      "keep plastic bags out of the bin~keep out plastic bags~bag|plastic~because bags can tangle the sorting machines~tangle|machine|stuck|jam",
      "put everything in the recycling bin on collection day~put out the bin~bin|collect|truck~so the truck can pick it up~truck|pick|collect"],
    ["2+", "make a rain gauge", "rain|gauge|measur", "a clear plastic bottle, a ruler, tape, and a handful of pebbles", "bottle|ruler|tape|pebble", "measure how much rain falls", "Over a month, you can keep a record of how much rain fell.", "Ask a grown-up to cut the bottle, because cut plastic can be sharp.", "0,3,5",
      "ask a grown-up to cut the top off the bottle~ask a grown-up to cut the bottle~cut|top~because the cut edge can be sharp~sharp|safe|cut|hurt",
      "put a layer of pebbles in the bottom~add the pebbles~pebble|bottom|stone~so the gauge will not blow over~blow|tip|fall|wind|heavy|steady",
      "turn the top upside down and set it in the bottle like a funnel~add the funnel~funnel|upside|top~to catch the rain and keep leaves out~catch|rain|leaves|leaf|out",
      "tape a ruler to the side of the bottle~tape on the ruler~tape|ruler|side~so you can read how high the water is~measure|read|high|level|water|how much",
      "set the gauge outside in an open spot~set it outside~outside|open|spot~so trees and roofs do not block the rain~tree|roof|block|catch",
      "check the water level after each rain and write it down~record the rain~check|record|write|level~so you can compare rainfalls over time~compare|track|record|time|remember"],
    ["2+", "start a compost bin", "compost|bin|soil", "a bin with a lid, dry leaves, fruit and vegetable scraps, and a shovel", "bin|lid|leaves|leaf|scrap|shovel", "turn kitchen scraps into rich soil", "In a few months, the pile will turn into dark, crumbly soil for a garden.", "Never add meat or dairy foods, because they smell bad and attract pests.", "0,1,3",
      "put a thick layer of dry leaves in the bottom of the bin~add dry leaves~leaves|leaf|dry|bottom~because dry leaves add carbon and let air in~air|carbon|dry|brown",
      "add fruit and vegetable scraps on top~add the scraps~scrap|fruit|vegetable|peel~because scraps add nitrogen that helps the pile break down~nitrogen|break|rot|decompos|food",
      "keep the pile about as damp as a wrung-out sponge~keep it damp~damp|wet|sponge|water~because the tiny living things that break it down need water~water|living|need|tiny|microbe|worm|bacteria",
      "turn the pile with a shovel once a week~turn the pile~turn|mix|stir|shovel|week~to mix in fresh air~air|oxygen|mix|faster"],
    ["3", "build a simple circuit", "circuit|electric|bulb|battery", "a battery in a holder, two wires, and a small bulb in a holder", "battery|wire|bulb|holder", "make a bulb light up", "When the loop is complete, the bulb glows.", "Use only a small battery for this activity, never a wall outlet.", "0,2,3",
      "connect one wire from the positive end of the battery to the bulb holder~connect the first wire~wire|positive|plus|battery|bulb~so electricity can flow out of the battery~electric|flow|current|out",
      "connect a second wire from the bulb holder to the negative end of the battery~connect the second wire~second|negative|minus|wire~to complete the loop~loop|circle|complete|close|path",
      "watch the bulb light up~watch the bulb~light|glow|bulb~because electricity now flows in a complete ^circuit~circuit|loop|flow|complete|path",
      "unhook one wire~unhook a wire~unhook|disconnect|wire|remove~to break the loop and turn the light off~break|off|open|stop"],
    ["2+", "write a friendly letter", "letter|write", "paper, a pencil, and an envelope", "paper|pencil|pen|envelope", "share news with someone far away", "A letter is a gift that someone can read again and again.", "", "0,2,4",
      "write the date in the top right corner~write the date~date|top|corner~so the reader knows when you wrote it~when|day|knows",
      "write a greeting, such as \"Dear Grandma,\"~write the greeting~greeting|dear~to show who the letter is for~who|for|name|person",
      "write the body of the letter with your news and questions~write the body~body|news|question~because this is the main part of the letter~main|news|tell|share|most important",
      "add a closing, such as \"Love\" or \"Your friend\"~add the closing~closing|love|friend~to end the letter kindly~ end |ending|kind|nice|finish|polite",
      "sign your name under the closing~sign your name~sign|name~so the reader knows who wrote it~who|wrote|knows|from"],
    ["3", "make a water filter model", "filter|water|clean", "a plastic bottle, cotton balls, sand, small gravel, and big gravel", "bottle|cotton|sand|gravel|rock", "see how layers can clean muddy water", "The water that drips out looks clearer, but it is still not safe to drink.", "Ask a grown-up to cut the bottle, and never drink the water from this model.", "0,2,4",
      "ask a grown-up to cut a plastic bottle in half~ask a grown-up to cut the bottle~cut|bottle|half~because cut plastic can be sharp~sharp|safe|cut",
      "turn the top half upside down and push cotton balls into the neck~add the cotton~cotton|neck|upside~to catch the tiniest bits of dirt~tiny|small|dirt|catch|bits",
      "pour in a layer of sand, then small gravel, then big gravel~add the layers~sand|gravel|layer~because each layer traps different sizes of dirt~size|trap|catch|dirt|different",
      "slowly pour muddy water over the top~pour in muddy water~pour|muddy|mud|water~so it has time to trickle through every layer~time|slow|layer|through|trickle",
      "compare the water that drips out with the muddy water~compare the water~compare|clear|drip~to see how much dirt the filter removed~dirt|remov|clean|clear|differen"]
  ];
  function howtoPassage(c) {
    const list = HOWTO.filter(function (t) { return inBand(t[0], c.band); }), t = P(list), b = c.band;
    c.kind = b === 0 ? "story" : "text"; c.task = t[1]; c.taskK = t[2]; c.need = t[3]; c.needK = t[4]; c.purpose = t[5]; c.subject = "howto:" + t[1];
    let steps = t.slice(9).map(function (x) { const p = x.split("~"); return { t: p[0], ref: p[1], k: p[2], why: p[3], whyK: p[4] }; });
    if (b === 0) steps = t[8].split(",").map(function (i) { return steps[+i]; });
    else if (b === 1 && chance(0.5)) steps = t[8].split(",").map(function (i) { return steps[+i]; });
    const s = [], f = c.f, say = function (x) { s.push(fill(x, c, true)); };
    if (b === 0) {
      if (chance(0.5)) { kid(c); c.task2 = t[1].replace(/\byour\b/g, c.his); say(P(["{Name} wants to {task2}.", "{Name} likes to {task2}."])); }
      else say(P(["Here is how to " + t[1] + ".", "Do you want to " + t[1] + "?"]));
    } else {
      if (chance(0.5)) {
        kid(c); f.kid = 1;
        const mine = function (x) { return x.replace(/\byourself\b/g, c.self).replace(/\byour\b/g, c.his); };
        c.purpose2 = mine(t[5]); c.task2 = mine(t[1]);
        say(P(["{Name} wanted to {purpose2}, so {he} learned how to {task2}.", "When {Name} wanted to {purpose2}, {his} family showed {him} how to {task2}."]));
      }
      else say(P(["Do you want to {purpose}? Here is how to {task}.", "It is easy to {task} if you follow these steps.", "@2 Learning how to {task} takes only a few simple steps.", "@3 With a few simple materials and a little patience, you can {task}."].map(function (v) { const r = parseVar(v, c); return r ? r.t : null; }).filter(Boolean)));
      if (chance(0.8)) { f.need = 1; say(P(["You will need {need}.", "Before you start, gather {need}."])); }
      if (t[7] && chance(0.7)) say(t[7]);
    }
    const n = steps.length, stated = [];
    let lastTr = "";
    steps.forEach(function (st, i) {
      const tr = i === 0 ? P(["First, ", b ? "To begin, " : "First, "]) : i === n - 1 ? P(["Last, ", "Finally, "]) : P(["Next, ", "Then ", "After that, "].filter(function (x) { return x !== lastTr; }));
      lastTr = tr;
      const why = b >= 2 && chance(b === 3 ? 0.45 : 0.3) && !(c.focus === "infer" && stated.length >= n - 2);
      stated[i] = why;
      say(tr + st.t + (why ? (/^because/.test(st.why) ? ", " : " ") + st.why : "") + ".");
    });
    if (chance(b === 0 ? 0.5 : 0.8)) { f.end = 1; say(t[6]); }
    if (b >= 2 && chance(0.5)) say(P(["Now you know how to {task}!", "With a little practice, you will be able to {task} all by yourself."]));
    c.first = steps[0]; c.last = steps[n - 1];
    const Q = [
      ["main", "", "", b === 0 ? "What is this about?" : ["What does this text teach you to do?", "What is this text mostly about?"], "It teaches how to {task}.", "Look at the first sentence.", "{taskK}"],
      ["main", "2+", "", ["What is the author's purpose?", "Why did the author write this text?"], "To explain how to {task}, step by step.", "Does the text tell a story, give facts, or give directions?", "explain|teach|how|instruct|direction|step|show|tell"],
      ["main", "0-1", "", b === 0 ? "What do you do in this?" : "What would you make or do if you followed these steps?", "You would {task}.", "What is every step about?", "{taskK}"],
      ["detail", "", "", ["What is the first step?", "What do you do first?"], cap(steps[0].t) + ".", "Find the word \"First\" or \"To begin.\"", steps[0].k],
      ["detail", "", "", ["What is the last step?", "What do you do last?"], cap(steps[n - 1].t) + ".", "Find the word \"Last\" or \"Finally.\"", steps[n - 1].k],
      ["detail", "1+", "need", "What will you need?", "You will need {need}.", "Find the list of things you need.", "{needK}"]
    ];
    for (let i = 0; i < n - 1; i++) Q.push(["detail", i === 0 ? "1+" : "", "", "What do you do right after you " + steps[i].ref + "?", cap(steps[i + 1].t) + ".", "Find the step that comes after you " + steps[i].ref + ".", steps[i + 1].k]);
    steps.forEach(function (st, i) {
      Q.push([stated[i] ? "detail" : "infer", "", "", (stated[i] ? "Why should you " : "Why do you think you should ") + st.ref + "?", cap(st.why) + ".", stated[i] ? "Reread the step where you " + st.ref + "." : "Think about what would go wrong if you skipped that step.", st.whyK]);
    });
    if (b >= 1) Q.push(["infer", "", "", "Why is it important to do the steps in order?", "Because each step gets things ready for the next one.", "What would happen if you did the last step first?", "order|next|ready|before|after|work|wrong|mess|first"]);
    const title = b === 0 ? ["How to " + titleCase(t[1]), "Let's " + titleCase(t[1]) + "!"] : ["How to " + titleCase(t[1]), "Step by Step: " + titleCase(t[1]), "You Can " + titleCase(t[1]), titleCase(t[1]) + " in " + n + " Steps"];
    return { title: P(title), sents: s, qs: runQs(c, Q), subject: c.subject };
  }

  /* ================= COMMUNITY HELPERS =================
     [job, plural, keys, works ..., keys, tools, keys, does (verb phrase), keys, also, keys, safety tip, keys, why it matters, keys] */
  const HELPS = [
    ["firefighter", "firefighters", "firefight|fire", "at a fire station", "station|fire", "a fire truck, long hoses, and tall ladders", "truck|hose|ladder",
      "put out fires and rescue people", "fire|rescue|save|put out", "teach kids about fire safety", "safety|teach|safe", "get low and go outside if there is smoke", "low|crawl|outside|get out|go", "keep everyone safe", "safe|help|protect"],
    ["librarian", "librarians", "librarian|library", "at the library", "library", "computers, book carts, and a scanner for library cards", "computer|cart|book|scan",
      "help people find books and information", "find|book|information|help", "lead story times for young children", "story|read", "treat library books gently and return them on time", "gentl|return|on time|care", "help everyone learn and enjoy reading", "learn|read|book"],
    ["mail carrier", "mail carriers", "mail|carrier|postal", "at the post office and along a mail route", "post office|route|mail", "a mail bag, a mail truck, and a scanner", "bag|truck|scan",
      "deliver letters and packages to homes and businesses", "deliver|letter|package|mail", "walk or drive many miles each day", "walk|drive|mile", "write the address clearly on every letter", "address|clear", "help people stay in touch", "touch|connect|send|get|mail|letter"],
    ["doctor", "doctors", "doctor", "at a clinic or hospital", "clinic|hospital|office", "a stethoscope, a thermometer, and a blood pressure cuff", "stethoscope|thermometer|cuff",
      "check people's health and help them get well", "health|well|better|check|sick|heal", "give check-ups to make sure people are growing strong", "check|grow|strong", "wash your hands and get plenty of sleep", "wash|hand|sleep", "keep people healthy", "health|well|sick"],
    ["veterinarian", "veterinarians", "vet|veterinarian|animal doctor", "at an animal clinic", "clinic|animal|hospital", "a stethoscope, a scale, and a bag of treats", "stethoscope|scale|treat",
      "take care of sick and hurt animals", "animal|pet|sick|hurt|care", "give pets check-ups and shots", "check|shot|pet", "bring pets for a check-up every year", "check|year|bring", "keep pets and other animals healthy", "animal|pet|health"],
    ["farmer", "farmers", "farmer|farm", "on a farm", "farm", "a tractor, a plow, and lots of seeds", "tractor|plow|seed",
      "grow food such as corn, wheat, fruit, and vegetables", "grow|food|crop|corn|wheat|vegetable|fruit", "care for animals such as cows and chickens", "animal|cow|chicken|care", "wash fruits and vegetables before you eat them", "wash", "grow the food that families eat", "food|eat|grow"],
    ["crossing guard", "crossing guards", "guard|crossing", "at busy street corners near schools", "corner|street|school|crosswalk", "a bright vest and a stop sign", "vest|sign|stop",
      "help children cross the street safely", "cross|street|safe", "watch for cars in every kind of weather", "car|weather|watch", "look left, right, and left again before you cross", "look|left|right", "keep walkers safe from cars", "safe|car|walk"],
    ["baker", "bakers", "baker|bak", "at a bakery", "bakery", "big ovens, mixers, and measuring cups", "oven|mixer|measur",
      "bake bread, muffins, and cakes", "bak|bread|cake|muffin", "start work very early in the morning", "early|morning", "measure ingredients carefully when you bake", "measur|careful", "make fresh food for the town", "food|fresh|bread|eat"],
    ["dentist", "dentists", "dentist", "at a dental office", "office|dental|clinic", "a tiny mirror, a bright light, and special cleaning tools", "mirror|light|tool",
      "check and clean people's teeth", "teeth|tooth|clean|check", "fix small holes in teeth called cavities", "cavit|fix|hole", "brush twice a day and floss", "brush|floss", "keep teeth healthy and strong", "teeth|tooth|health|strong"],
    ["park ranger", "park rangers", "ranger|park", "at state and national parks", "park", "maps, radios, and binoculars", "map|radio|binocular",
      "protect plants, animals, and trails", "protect|plant|animal|trail", "teach visitors about nature", "teach|nature|visitor", "stay on the trail and never feed wild animals", "trail|feed|wild", "keep parks safe and beautiful", "safe|beautiful|protect|nature|clean"],
    ["bus driver", "bus drivers", "bus|driver", "on a school bus route", "bus|route|school|road", "a big yellow bus with mirrors and flashing lights", "bus|mirror|light",
      "drive children to and from school safely", "drive|school|safe", "check the bus before every trip", "check|trip", "stay seated and keep your hands inside the bus", "seat|sit|inside|hand", "help kids get to school safely and on time", "school|time|safe"],
    ["sanitation worker", "sanitation workers", "sanitation|trash|garbage|worker", "on trash and recycling routes", "trash|recycl|route|street", "a large truck with a lifting arm", "truck|arm|lift",
      "collect trash and recycling from homes", "collect|trash|recycl|garbage|pick", "start work before the sun comes up", "early|sun|morning", "put only clean, empty items in the recycling bin", "clean|empty|recycl", "keep the town clean and healthy", "clean|health"],
    ["nurse", "nurses", "nurse", "at hospitals, clinics, and schools", "hospital|clinic|school", "bandages, thermometers, and charts", "bandage|thermometer|chart",
      "care for patients and help them feel better", "care|patient|better|help|sick", "explain to families how to care for someone who is sick", "explain|famil|care", "cover your cough with your elbow", "cough|elbow|cover", "help sick people heal", "heal|better|health|sick|well"],
    ["teacher", "teachers", "teacher", "at a school", "school|class", "books, whiteboards, and computers", "book|whiteboard|board|computer",
      "help students learn to read, write, and solve problems", "learn|read|write|teach|problem", "plan lessons every week", "plan|lesson", "ask questions when you do not understand", "ask|question", "help kids learn and grow", "learn|grow"],
    ["lifeguard", "lifeguards", "lifeguard|guard", "at pools and beaches", "pool|beach", "a whistle, a rescue tube, and a tall chair", "whistle|tube|chair",
      "watch swimmers and help anyone in trouble", "watch|swim|help|rescue|trouble", "practice rescues to stay ready", "practic|rescue|ready", "always swim where a lifeguard can see you", "lifeguard|see|swim", "keep swimmers safe", "safe|swim"],
    ["zookeeper", "zookeepers", "zookeeper|keeper|zoo", "at a zoo", "zoo", "buckets of food, hoses, and brooms", "bucket|food|hose|broom",
      "feed the animals and keep their homes clean", "feed|food|clean|animal", "watch for signs that an animal is sick", "sick|sign|watch", "never tap on the glass at animal exhibits", "tap|glass", "keep zoo animals healthy", "animal|health"],
    ["police officer", "police officers", "police|officer", "at a police station and around town", "station|police|town", "a radio, a patrol car, and a map", "radio|car|map",
      "help keep the community safe", "safe|help|protect|community", "help people who are lost or in trouble", "lost|trouble|help", "find a police officer or another trusted grown-up if you are ever lost", "police|grown|adult|trust|officer", "keep people safe", "safe|help|protect"],
    ["pilot", "pilots", "pilot", "at airports and up in the sky", "airport|sky|plane", "a cockpit full of controls, maps, and radios", "cockpit|control|map|radio",
      "fly airplanes that carry people and packages", "fly|plane|carry", "check the weather before every flight", "weather|check", "keep your seat belt on during a flight", "seat belt|seatbelt|belt", "help people travel far away quickly", "travel|far|quick|fast"]
  ];
  function commPassage(c) {
    const h = P(HELPS), b = c.band, s = [], f = c.f, say = function (x) { s.push(fill(x, c, true)); };
    Object.assign(c, { kind: b === 0 ? "story" : "passage", job: h[0], jobs: h[1], jobK: h[2], where: h[3], whereK: h[4], tools: h[5], toolsK: h[6], does: h[7], doesK: h[8], also: h[9], alsoK: h[10], tip: h[11], tipK: h[12], why: h[13], whyK: h[14] });
    c.subject = "comm:" + h[0];
    const visit = chance(0.55);
    if (visit) { kid(c); f.visit = 1; }
    if (b === 0) {
      say(visit ? "{A:job} came to {Name}'s class." : P(["This is {a:job}.", "{A:job} is a helper in our town."]));
      say(P(["The {job} works {where}.", "{Jobs} work {where}."]));
      if (chance(0.7)) { f.tools = 1; say("{Jobs} use {tools}."); }
      say("{Jobs} {does}.");
      if (chance(0.5)) { f.tip = 1; say("{A:job} says, \"Remember to {tip}.\""); }
      else if (visit) say(P(["{Name} said, \"Thank you!\"", "{Name} waved goodbye."]));
    } else {
      if (visit) say(P(["On Friday, {a:job} visited {Name}'s class.", "@2 {Name}'s class had a special guest on Friday: {a:job} from their town."].map(function (v) { const r = parseVar(v, c); return r ? r.t : null; }).filter(Boolean)));
      else say(P(["{Jobs} are important helpers in a ^community.", "Every town needs {jobs}.", "@2 Have you ever wondered what {jobs} do all day?"].map(function (v) { const r = parseVar(v, c); return r ? r.t : null; }).filter(Boolean)));
      say(P(["{Jobs} work {where}.", "Most {jobs} work {where}."]));
      say(P(["Their main job is to {does}.", "{Jobs} {does}."]));
      if (chance(0.8)) { f.tools = 1; say(P(["They use {tools}.", "They use special ^equipment, such as {tools}.", "@2 To do their work, they use ^equipment such as {tools}."].map(function (v) { const r = parseVar(v, c); return r ? r.t : null; }).filter(Boolean))); }
      if (chance(0.7)) { f.also = 1; say(P(["{Jobs} also {also}.", "Many {jobs} also {also}."])); }
      if (chance(0.75)) { f.tip = 1; say(visit ? "The {job} told the class, \"Remember to {tip}.\"" : "{Jobs} often say, \"Remember to {tip}.\""); }
      if (b >= 2 && chance(0.6)) { f.whyS = 1; say(P(["{Jobs} work hard to {why}.", "Without {jobs}, it would be much harder to {why}."])); }
      if (visit && chance(0.7)) { f.feel = 1; say(P(["{Name} thought the visit was exciting.", "{Name} asked lots of questions and listened carefully.", "@2 After the visit, {Name} decided that {he} might want to be {a:job} someday."].map(function (v) { const r = parseVar(v, c); return r ? r.t : null; }).filter(Boolean))); }
      if (b === 3) say(P(["Being {a:job} takes skill, training, and a lot of patience.", "Most {jobs} train for a long time before they start working.", "The job can be tiring, but many {jobs} say that helping others makes it worthwhile."]));
      if (b === 1 && !visit && chance(0.5)) say("Every ^community needs helpers like {jobs}.");
      if (b >= 2 && chance(b === 3 ? 0.7 : 0.4)) say("Community helpers like {jobs} make life better for everyone.");
    }
    const Q = [
      ["main", "0", "visit", "Who came to {Name}'s class?", "{A:job} came.", "Look at the first sentence.", "{jobK}"],
      ["main", "0", "", "What is this mostly about?", "It is about {a:job} and the work {jobs} do.", "What helper is this about?", "{jobK}"],
      ["main", "1+", "", ["What is this passage mostly about?", "What is the main idea of this passage?"], "It is about how {jobs} help the community.", "Think about what you learned about {jobs}.", "{jobK}", "help|work|job|do|community|keep|safe|care|town"],
      ["main", "1-2", "", "What job is this passage about?", "It is about the job of {a:job}.", "Which helper is named again and again?", "{jobK}"],
      ["main", "3", "", "Why did the author write this passage?", "To inform readers about the important work {jobs} do.", "Is this passage mostly facts or mostly made up?", "inform|teach|explain|tell|learn|show|fact"],
      ["detail", "", "", "Where do {jobs} work?", "{Jobs} work {where}.", "Find the word \"work.\"", "{whereK}"],
      ["detail", "", "tools", "What tools do {jobs} use?", "They use {tools}.", "Find the word \"use.\"", "{toolsK}"],
      ["detail", "", "", "What do {jobs} do?", "{Jobs} {does}.", "Find what their main job is.", "{doesK}"],
      ["detail", "1+", "also", "What else do many {jobs} do?", "They also {also}.", "Find the word \"also.\"", "{alsoK}"],
      ["detail", "", "tip", "What safety tip does the passage give?", "Remember to {tip}.", "Find the word \"Remember.\"", "{tipK}"],
      ["infer", "", "", "Why are {jobs} important to a town?", "Because they help {why}.", "Think about what would happen without them.", "{whyK}"],
      ["infer", "1+", "tools", "Why do you think {jobs} need {tools}?", "Because those tools help them {does}.", "Think about what their main job is.", "{doesK}|help|job|work"],
      ["infer", "", "visit", "How do you think {Name} felt about the visit?", "{He} felt excited and curious.", "Think about what {Name} did during the visit.", "excit|curious|interest|happy|fun|amaz|cool|glad|proud|thank"],
      ["infer", "2+", "tip", "Why do you think the {job} gave that safety tip?", "To help people stay safe and healthy.", "Think about what the tip protects people from.", "safe|health|hurt|danger|careful|protect|sick"]
    ];
    return { title: P(b === 0 ? ["{A:job} Helps", "Our Friend the {Job}", "The {Job}"] : ["A Visit from {a:job}", "What Does {a:job} Do?", "Community Helpers: {Jobs}", "Meet {a:job}", "A Day with {a:job}"]).replace(/\{[^}]+\}/g, function (m) { return fill(m, c); }),
      sents: s, qs: runQs(c, Q), subject: c.subject };
  }

  /* ================= LONG AGO =================
     [title, people ___ ("light their homes"), keys, how it was done long ago (sentence), old-way keys, detail (sentence),
      problem with the old way, keys, what replaced it, keys, when it changed (sentence), today (sentence), keys, effect (sentence), keys] */
  const PAST = [
    ["Lighting the Night", "light their homes", "light|lamp|candle", "Long ago, people lit their homes with candles and oil lamps.", "candle|lamp|oil", "People made candles from beeswax or animal fat.",
      "the flames gave only ^dim light and could start fires", "dim|fire|dark|danger", "electric light bulbs", "electric|bulb|light", "In the late 1800s, electric lights began to brighten homes and streets.",
      "Today, we flip a switch to light up a whole room.", "switch|flip|electric|bulb", "People could read, work, and play safely after dark.", "night|dark|later|safe|read|work"],
    ["Keeping Food Cold", "keep food cold", "food|cold|ice|fridge|refrigerat", "Long ago, many families kept food cold in an icebox, a wooden cabinet that held a big block of ice.", "icebox|ice|block|cabinet", "Workers cut ice from frozen lakes in winter and packed it in sawdust so it would last into summer.",
      "the ice melted, so someone had to deliver a new block every few days", "melt|deliver|new|ice", "electric refrigerators", "refrigerator|fridge|electric", "Electric refrigerators became ^common in American homes in the 1930s and 1940s.",
      "Today, refrigerators keep food cold all day and all night.", "refrigerator|fridge|cold", "Food stayed fresh longer, and families no longer needed ice deliveries.", "fresh|longer|ice|safe|spoil"],
    ["Wash Day", "wash their clothes", "wash|cloth|laundry", "Long ago, people washed clothes by hand in a tub with a washboard.", "washboard|tub|hand|scrub", "They scrubbed each piece of clothing against the bumpy board and then wrung out the water.",
      "washing clothes could take a whole day of hard work", "day|hard|long|tir|work", "washing machines", "washing machine|machine", "Electric washing machines spread to many homes in the early 1900s.",
      "Today, a machine can wash a load of clothes in about an hour.", "machine|hour", "Families had more free time for other things.", "time|free|easier|faster"],
    ["The One-Room School", "go to school", "school|learn|class", "Long ago, many children went to one-room schoolhouses.", "one-room|one room|schoolhouse", "Students of all ages learned together with one teacher, and they wrote on small chalkboards called ^slates.",
      "one teacher had to teach every grade at the same time", "every grade|all ages|one teacher|same time|busy|hard", "larger schools with a separate class for each grade", "grade|classroom|separate|bigger|larger", "As towns grew, they built bigger schools with many classrooms.",
      "Today, most students have a class for their own grade and use paper, books, and computers.", "grade|paper|computer|book", "Teachers could plan lessons for one age group at a time.", "age|grade|one group|easier|plan"],
    ["Crossing the Country", "travel long distances", "travel|trip|wagon|train", "Long ago, many families traveled across the country in covered wagons pulled by oxen or horses.", "wagon|horse|oxen|ox", "A trip from the middle of the country to the West Coast could take four to six months.",
      "trips were slow, bumpy, and sometimes dangerous", "slow|bump|danger|long|month", "railroads, and later cars and airplanes", "train|railroad|car|plane", "In 1869, a railroad was finished that crossed the United States, and the trip took only about a week.",
      "Today, an airplane can fly across the country in about six hours.", "plane|airplane|hour|fly", "People and goods could travel much faster.", "fast|quick|time"],
    ["Sending a Message", "send messages", "message|letter|news|telegraph", "Long ago, letters were carried by horse, stagecoach, or ship.", "letter|horse|ship|stagecoach", "A letter could take weeks or even months to arrive.",
      "news traveled very slowly", "slow|week|month|long", "the telegraph, which sent messages over wires using a code of dots and dashes", "telegraph|wire|code|dot|dash|morse", "By the 1860s, telegraph wires connected many cities across America.",
      "Today, we can send a message across the world in seconds.", "second|phone|computer|email|text|fast", "News could travel across the country in minutes instead of weeks.", "minute|fast|quick"],
    ["Fetching Water", "get water", "water|well|faucet", "Long ago, many families carried water in buckets from wells, springs, and streams.", "bucket|well|stream|spring|carr", "Children often helped by hauling heavy buckets home every day.",
      "carrying water was heavy, tiring work, and the water was not always clean", "heavy|tir|clean|dirty|hard", "pipes that brought clean water into homes", "pipe|faucet|tap|plumbing", "Cities built water systems with pipes, pumps, and filters.",
      "Today, we turn on a faucet to get clean water.", "faucet|tap|turn|sink", "People stayed healthier and saved hours of work each week.", "health|clean|time|save|sick"],
    ["Books by Hand", "make books", "book|print|copy", "Long ago, every book was copied by hand, one page at a time.", "hand|copy|copied|write", "Making a single book could take months, so books were ^rare and costly.",
      "only a few people could own books", "few|rare|expensive|cost", "the printing press with movable type", "printing press|press|print", "In the 1400s, printing presses in Europe began making many copies of a book quickly.",
      "Today, millions of books are printed, and many can be read on screens.", "million|print|screen", "Books became cheaper, and many more people learned to read.", "cheap|more people|read|learn"],
    ["Plowing the Fields", "plow their fields", "plow|farm|field|tractor", "Long ago, farmers plowed their fields with plows pulled by horses or oxen.", "plow|horse|ox", "A farmer walked behind the plow all day to break up the soil.",
      "it took many weeks to plow a big field", "slow|week|long|hard|tir", "tractors with gas engines", "tractor|engine|machine", "In the early 1900s, tractors began to replace horses on many farms.",
      "Today, one farmer with a tractor can plow a huge field in a day or two.", "tractor|day|huge", "Farms could grow much more food with fewer workers.", "more food|fewer|faster|bigger|more"],
    ["The Lighthouse Keeper", "keep ships safe at night", "lighthouse|ship|light|keeper", "Long ago, lighthouse keepers climbed tall towers every evening to keep a lamp burning all night.", "keeper|lamp|climb|tower", "Keepers trimmed wicks, polished the glass, and watched for ships in trouble.",
      "the work never stopped, even during storms", "storm|never|night|hard|every", "^automatic electric lights", "automatic|electric", "During the 1900s, most lighthouses in the United States were changed to automatic lights.",
      "Today, many lighthouses run by themselves, and ships also use satellites to find their way.", "automatic|themselves|satellite|gps|by itself", "Ships still stay safe, but keepers no longer have to live at the lighthouse.", "safe|keeper|no longer|automatic"],
    ["The General Store", "shop for food", "store|shop|food", "Long ago, most towns had a general store that sold everything from flour to nails.", "general store|store", "Shopkeepers scooped flour, sugar, and beans from big barrels.",
      "shoppers had to ask a clerk for each item, which took a long time", "clerk|ask|time|wait|long", "self-service grocery stores", "self-service|grocery|supermarket|shelves", "In the early 1900s, stores began letting shoppers take items off the shelves themselves.",
      "Today, we push carts through big supermarkets.", "cart|supermarket|grocery", "Shopping became faster, and stores could offer many more kinds of food.", "fast|more|choice|quick"],
    ["Telling Time", "tell time", "time|clock|sundial", "Long ago, people told time with sundials, which used shadows to show the hour.", "sundial|shadow|sun", "As the sun moved across the sky, a shadow moved across the dial.",
      "sundials did not work at night or on cloudy days", "night|cloud|dark", "mechanical clocks with gears", "clock|gear", "Clocks with gears and weights were built in Europe in the 1300s.",
      "Today, clocks and phones show the exact time.", "clock|phone|watch", "People could tell time day or night, rain or shine.", "night|cloud|any time|always|day"],
    ["Cooking Over a Fire", "cook their food", "cook|food|stove", "Long ago, people cooked over open fires and on wood-burning stoves.", "fire|wood|stove", "Someone had to chop wood and keep the fire going all day.",
      "cooking was hot, smoky, and slow", "hot|smok|slow|wood", "gas and electric stoves", "gas|electric|stove", "Gas and electric stoves spread to many homes in the early 1900s.",
      "Today, we can turn a knob and start cooking right away.", "knob|turn|right away|stove", "Cooking became faster, cleaner, and safer.", "fast|clean|safe|easy"],
    ["Spinning and Weaving", "make cloth", "cloth|spin|weav|fabric", "Long ago, families made cloth at home with spinning wheels and looms.", "spinning|wheel|loom|spin|weav", "They spun wool into yarn and then wove the yarn into cloth by hand.",
      "making enough cloth for one shirt took many hours", "hour|slow|long|time|hard", "factories with machines that spun and wove cloth", "factor|machine", "In the late 1700s and the 1800s, new machines in factories made cloth much faster.",
      "Today, most clothes are made in factories and bought in stores.", "factor|store|buy", "Cloth became cheaper, and people could own more clothes.", "cheap|more|fast"]
  ];
  function histPassage(c) {
    const h = P(PAST), b = c.band, s = [], f = c.f, say = function (x) { s.push(fill(x, c, true)); };
    Object.assign(c, { kind: "passage", topic: h[1], topicK: h[2], oldK: h[4], prob: h[6], probK: h[7], neu: h[8], neuK: h[9], nowK: h[12], effK: h[14] });
    c.subject = "hist:" + h[0];
    if (b >= 2 && chance(0.6)) say(P(["Life long ago was very different from life today.", "Have you ever wondered how people managed to {topic} long ago?", "Imagine trying to {topic} without any modern tools.",
      "@3 Many things we use every day began as answers to old problems."].map(function (v) { const r = parseVar(v, c); return r ? r.t : null; }).filter(Boolean)));
    say(h[3]);
    if (chance(b === 1 ? 0.5 : 0.85)) { f.det = 1; say(h[5]); }
    say(b === 1 ? "But {prob}." : P(["There was a problem: {prob}.", "The trouble was that {prob}.", "@3 This way of life had a serious drawback: {prob}."].map(function (v) { const r = parseVar(v, c); return r ? r.t : null; }).filter(Boolean)));
    say(b === 1 ? (/School|Store|Water/.test(h[0]) ? "Later, people began to use {neu}." : P(["Later, people began to use {neu}.", "Later, people ^invented {neu}."])) : P(["Over time, people switched to {neu}.", /School|Store|Water/.test(h[0]) ? "@2 In time, things changed, and people began to use {neu}." : "@2 In time, new ^inventions changed everything, including {neu}."].map(function (v) { const r = parseVar(v, c); return r ? r.t : null; }).filter(Boolean)));
    if (b >= 2 && chance(0.8)) { f.when = 1; say(h[10]); }
    if (b >= 2 || chance(0.6)) { f.eff = 1; say(h[13]); }
    f.now = 1; say(h[11]);
    if (b === 3 && chance(0.5)) say(P(["It is easy to take these changes for granted, but each one made daily life a little easier.", "Looking back helps us see how much everyday life has changed."]));
    const Q = [
      ["main", "1-2", "", "What is the topic of this passage?", "How people {topic} long ago and today.", "What is the first sentence about?", "{topicK}"],
      ["main", "", "", ["What is this passage mostly about?", "What is the main idea of this passage?"], "It is about how people {topic} long ago and how that changed over time.", "Think about the beginning and the end of the passage.", "{topicK}", "long ago|past|old|before|chang|today| now |then|history|used to|different"],
      ["main", "3", "", ["Why did the author write this passage?", "What is the author's purpose?"], "To explain how the way people {topic} changed over time.", "Does the author tell a story, give facts, or try to convince you?", "explain|inform|teach|show|tell|learn|fact"],
      ["detail", "", "", "How did people {topic} long ago?", h[3].replace(/^Long ago, /, "").replace(/^./, function (x) { return x.toUpperCase(); }), "Find the words \"Long ago.\"", "{oldK}"],
      ["detail", "", "", "What was the problem with the old way?", cap(h[6]) + ".", "Find the word \"problem,\" \"trouble,\" or \"But.\"", "{probK}"],
      ["detail", "", "", "What did people begin to use instead?", cap(h[8]) + ".", "Find the words \"Later\" or \"Over time.\"", "{neuK}"],
      ["detail", "", " now ", "How do we {topic} today?", h[11].replace(/^Today, /, "").replace(/^./, function (x) { return x.toUpperCase(); }), "Find the word \"Today.\"", "{nowK}"],
      ["detail", "2+", "eff", "How did the change make life better?", h[13], "Find the sentence that tells what happened after the change.", "{effK}"],
      ["infer", "", "", "Why do you think people switched to {neu}?", "Because the old way had a problem: {prob}.", "Think about the problem with the old way.", "{probK}"],
      ["infer", "", "", "Would you rather {topic} the old way or the new way? Why?", "The new way, because the old way meant {prob}.", "Compare the problem with today.", "new|today| now |modern|old|easier|faster|safer|better|{probK}"],
      ["infer", "2+", "!eff", "How do you think the change made people's lives better?", h[13], "Think about the problem it solved.", "{effK}|easier|better|faster"]
    ];
    return { title: P([h[0], h[0] + " Long Ago", "Then and Now: " + h[0]]), sents: s, qs: runQs(c, Q), subject: c.subject };
  }

  /* ================= BUILDING A PASSAGE ================= */
  function parseVar(v, c) {
    const flags = [];
    for (;;) {
      let m = /^#(\w+) /.exec(v);
      if (m) { flags.push(m[1]); v = v.slice(m[0].length); continue; }
      m = /^@(\d) /.exec(v);
      if (m) { if (c.band < +m[1]) return null; v = v.slice(m[0].length); continue; }
      return { t: v, f: flags };
    }
  }
  function needOk(need, c) {
    if (!need) return true;
    return need.split(/[ ,]+/).every(function (n) {
      if (!n) return true;
      const neg = n.charAt(0) === "!";
      if (neg) n = n.slice(1);
      return neg ? !c.f[n] : !!c.f[n];
    });
  }
  function runBeats(c, beats) {
    const out = [];
    beats.forEach(function (bt) {
      if (!inBand(bt[0], c.band)) return;
      const fl = String(bt[2] || "").split(" ").filter(Boolean);
      if (!needOk(fl.filter(function (x) { return x.charAt(0) === "?"; }).map(function (x) { return x.slice(1); }).join(","), c)) return;
      if (bt[1] < 1 && !chance(bt[1])) return;
      const vs = bt.slice(3).map(function (v) { return parseVar(v, c); }).filter(Boolean);
      if (!vs.length) return;
      const v = P(vs);
      fl.forEach(function (x) { if (x.charAt(0) !== "?") c.f[x] = 1; });
      v.f.forEach(function (x) { c.f[x] = 1; });
      out.push(fill(v.t, c, true));
    });
    return out;
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function mkQ(c, y, q, a, h, keys) {
    return { type: y, q: fill(Array.isArray(q) ? P(q) : q, c), answer: fill(a, c), hint: fill(h, c),
      keys: keys.map(function (g) { return uniq(fill(g, c).toLowerCase().split("|").filter(function (k) { return k.trim().length > 0; })); }) };
  }
  function runQs(c, qs) {
    return qs.filter(function (q) { return inBand(q[1], c.band) && needOk(q[2], c); })
      .map(function (q) { return mkQ(c, q[0], q[3], q[4], q[5], q.slice(6)); });
  }
  let vocRe = null;
  function vocabQs(c, text) {
    if (!vocRe) vocRe = Object.keys(VOC).map(function (w) { return [w, new RegExp("\\b" + w.replace(/ /g, "\\s+") + "\\b", "i")]; });
    vocRe.forEach(function (x) { if (c._voc.indexOf(x[0]) === -1 && x[1].test(text)) c._voc.push(x[0]); });
    return c._voc.filter(function (w) { return VOC[w] && VOC[w][0] <= c.band; }).map(function (w) {
      const v = VOC[w], kind = c.kind || "story";
      const q = c.band === 0 ? P(["What does \"" + w + "\" mean?", "What does the word \"" + w + "\" mean?"])
        : P(["What does the word \"" + w + "\" mean in this " + kind + "?", "The " + kind + " uses the word \"" + w + "\". What does it mean?",
          "What does \"" + w + "\" mean? Use clues from the " + kind + ".", "In this " + kind + ", what does \"" + w + "\" mean?"]);
      const h = c.band === 0 ? "Listen to the sentence with \"" + w + "\" again." : P(["Find \"" + w + "\" and reread the sentences around it.",
        "Reread the sentence with \"" + w + "\". Try putting your own word in its place.", "Look for clues right before and after \"" + w + "\"."]);
      return { type: "vocab", q: q, answer: "It means " + v[1] + ".", hint: h, keys: [v[2].split("|")] };
    });
  }
  function runPlot(c, list) {
    const pl = P(list.filter(function (x) { return inBand(x.b, c.band); }));
    c.kind = "story";
    pl.set(c);
    const sents = runBeats(c, pl.beats);
    const qs = runQs(c, pl.qs);
    if (c.band >= 1 && c.band <= 2) qs.push(mkQ(c, "main", "Who is the main character in this story?", "{Name} is the main character.", "Think about who the story is mostly about.", ["{nameK}"]));
    return { title: fill(P(pl.title), c), sents: sents, qs: qs, subject: c.subject || pl.k };
  }
  const SMALL = " a an the and or of to in on at for with from by but as ";
  function titleCase(t) {
    const ws = t.split(" ");
    return ws.map(function (w, i) { return i > 0 && !/:$/.test(ws[i - 1]) && SMALL.indexOf(" " + w.toLowerCase() + " ") !== -1 ? w.toLowerCase() : cap(w); }).join(" ");
  }

  /* own copy of the reading game's keyword check, used to prove each answer passes its own keys */
  function kwScore(keys, answer) {
    const a = " " + String(answer).toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ") + " ";
    const hit = keys.filter(function (g) { return g.some(function (k) { return a.indexOf(k.toLowerCase()) !== -1; }); }).length;
    return !keys.length ? 1 : hit === keys.length ? 2 : hit > 0 ? 1 : 0;
  }

  const GEN = {
    story: function (c) { return runPlot(c, STORY); },
    dojo: function (c) { return runPlot(c, DOJO); },
    animal: animalPassage,
    howto: howtoPassage,
    comm: commPassage,
    hist: histPassage
  };
  /* 8 genre slots per band; the seed picks one, so genres can be asked for */
  const GENRES = [
    ["story", "animal", "story", "animal", "dojo", "howto", "comm", "dojo"],
    ["story", "animal", "story", "animal", "dojo", "howto", "comm", "hist"],
    ["story", "animal", "dojo", "howto", "comm", "hist", "story", "animal"],
    ["story", "animal", "dojo", "howto", "comm", "hist", "story", "animal"]
  ];
  const TYPES = ["main", "detail", "infer", "vocab"];
  const FOCI = [null, "main", "detail", "infer", "vocab"];
  const LEN = { "-1": [3, 5], 0: [3, 5], 1: [5, 7], 2: [5, 7], 3: [6, 8], 4: [6, 9], 5: [7, 9], 6: [8, 10], 7: [8, 11], 8: [9, 12] };
  function countSent(t) { const m = t.match(/[.!?]+["'”]?(?=\s|$)/g); return m ? m.length : 0; }

  function chooseQs(cands, band, focus) {
    const by = { main: [], detail: [], infer: [], vocab: [] };
    shuffle(cands).forEach(function (q) { if (by[q.type]) by[q.type].push(q); });
    let plan;
    if (focus) plan = focus === "main" ? ["main", "main", "detail"] : ["main", focus, focus];
    else plan = [
      ["main", "detail", P(["detail", "infer", "detail"])],
      ["main", "detail", P(["detail", "infer", "infer", "vocab"])],
      ["main", P(["detail", "detail", "infer", "vocab"]), P(["infer", "vocab", "infer"])],
      ["main", P(["detail", "infer", "vocab"]), P(["infer", "vocab", "infer"])]][band];
    const used = [], answers = [];
    plan.forEach(function (t) {
      const order = [t].concat(["detail", "infer", "main", "vocab"].filter(function (x) { return x !== t; }));
      for (let i = 0; i < order.length; i++) {
        const list = by[order[i]];
        while (list.length) {
          const q = list.shift();
          if (answers.indexOf(q.answer) === -1 && used.every(function (u) { return u.q !== q.q; })) { used.push(q); answers.push(q.answer); return; }
        }
      }
    });
    return used;
  }

  /* 6th to 8th grade: author's purpose (a main-idea skill) and text
     structure (a reading-between-the-lines skill), on top of each genre's own
     questions. 3rd to 5th get the text structure question only. */
  function middleQs(genre, out) {
    const fiction = genre === "story" || genre === "dojo";
    const subj = String(out.subject || "this topic").replace(/^(a|an|the) /i, "");
    const PURPOSE = {
      fiction: ["To entertain readers and teach a lesson.", [["entertain", "fun", "enjoy", "lesson", "teach", "moral"]]],
      animal: ["To inform readers with facts about " + subj + ".", [["inform", "teach", "fact", "learn", "explain", "tell"]]],
      howto: ["To explain how to do something, step by step.", [["explain", "teach", "how to", "show", "step", "instruct"]]],
      hist: ["To inform readers how something changed from long ago to today.", [["inform", "teach", "explain", "change", "compar", "learn", "fact"]]],
      comm: ["To inform readers about a job and how it helps people.", [["inform", "teach", "explain", "job", "help", "learn"]]]
    };
    const STRUCT = {
      fiction: ["How is this story organized?", "In time order: a problem, and then how it gets solved.", [["order", "sequence", "time", "first", "problem", "solv", "solution", "beginning", "chronolog"]]],
      howto: ["How is this text organized?", "In sequence: steps in the order you do them.", [["sequence", "order", "step", "first", "chronolog"]]],
      hist: ["How is this passage organized?", "It compares long ago and today: a problem, then the change that solved it.", [["compar", "contrast", "then and now", "long ago", "before", "problem", "solution", "cause", "effect", "change"]]],
      animal: ["How is this passage organized?", "It describes the topic with facts and details.", [["describ", "fact", "detail", "descript", "inform"]]],
      comm: ["How is this passage organized?", "It describes a job: where, what tools, and how it helps.", [["describ", "fact", "detail", "descript", "inform", "explain"]]]
    };
    const k = fiction ? "fiction" : genre, pu = PURPOSE[k], st = STRUCT[k], qs = [];
    if (pu) qs.push({ type: "main", q: fiction ? "Why do you think the author wrote this story?" : "What is the author's purpose in this passage?", answer: pu[0], hint: fiction ? "Is it mostly to give facts, or to tell a story with a message?" : "Is it mostly to give facts, to persuade, or to entertain?", keys: pu[1] });
    if (st) qs.push({ type: "infer", q: st[0], answer: st[1], hint: "Look at how it moves: in order, comparing, or describing?", keys: st[2] });
    return qs;
  }

  /* seed = ((base * 5) + focus) * 8 + genre slot */
  function makeSeed(base, focus, slotIx) { return (base * 5 + Math.max(0, FOCI.indexOf(focus || null))) * 8 + slotIx; }
  const cache = {};
  let cacheN = 0;
  function build(grade, seed) {
    grade = Math.max(-1, Math.min(8, Math.round(Number(grade) || 0)));
    seed = Math.floor(Math.abs(Number(seed) || 0));
    const id = "sg-" + grade + "-" + seed;
    if (cache[id]) return cache[id];
    const band = bandOf(grade), focus = FOCI[Math.floor(seed / 8) % 5], genre = GENRES[band][seed % 8];
    const len = LEN[grade], keep = rnd;
    rnd = prng(seed * 2654435761 + grade * 97 + 13);
    let best = null;
    try {
      for (let attempt = 0; attempt < 40; attempt++) {
        const c = { grade: grade, band: band, focus: focus, _voc: [], f: {} };
        const out = GEN[genre](c);
        const text = out.sents.join(" ").replace(/\s+/g, " ").trim();
        const n = countSent(text);
        const cands = out.qs.concat(vocabQs(c, text), band === 3 ? middleQs(genre, out) : band === 2 ? middleQs(genre, out).filter(function (q) { return q.type === "infer"; }) : []) // 3rd-5th: text structure (RI.3.8, RI.4.5, RI.5.5).filter(function (q) { return q.keys.length && kwScore(q.keys, q.answer) === 2; });
        const qs = chooseQs(cands, band, focus);
        const lenOk = n >= len[0] && n <= len[1];
        const focusOk = !focus || qs.filter(function (q) { return q.type === focus; }).length >= 2;
        const score = (lenOk ? 2 : 0) + (focusOk ? 1 : 0) + (qs.length === 3 ? 1 : 0);
        if (!best || score > best.score) best = { score: score, out: out, text: text, qs: qs, cands: cands };
        if (score === 4) break;
      }
    } finally { rnd = keep; }
    const ps = { id: id, grade: grade, title: titleCase(best.out.title), text: best.text,
      questions: best.qs.map(function (q) { return { type: q.type, q: q.q, answer: q.answer, hint: q.hint, keys: q.keys }; }), source: "gen" };
    meta[id] = { genre: genre, subject: best.out.subject, focus: focus, cands: best.cands };
    if (++cacheN > 800) { Object.keys(cache).forEach(function (k) { delete cache[k]; delete meta[k]; }); cacheN = 0; }
    cache[id] = ps;
    return ps;
  }
  const meta = {};
  function info(ps) { if (!ps || !meta[ps.id]) { if (ps && /^sg-/.test(ps.id)) fromId(ps.id); } return ps ? meta[ps.id] : null; }
  function fromId(id) {
    const m = /^sg-(-?\d)-(\d{1,12})$/.exec(String(id || ""));
    if (!m || +m[1] < -1 || +m[1] > 8) return null;
    return build(+m[1], +m[2]);
  }
  function randBase() { return 1 + Math.floor(Math.random() * 16000000); }
  function slotsFor(band, genre) { const out = []; GENRES[band].forEach(function (g, i) { if (!genre || g === genre) out.push(i); }); return out.length ? out : [0, 1, 2, 3, 4, 5, 6, 7]; }

  /* generate(grade, {focus, avoid, seed, genre}) */
  function generate(grade, opts) {
    opts = opts || {};
    grade = Math.max(-1, Math.min(8, Math.round(Number(grade) || 0)));
    if (opts.seed != null) return build(grade, opts.seed);
    const avoid = opts.avoid instanceof Set ? opts.avoid : new Set(opts.avoid || []);
    const focus = TYPES.indexOf(opts.focus) !== -1 ? opts.focus : null;
    const slots = slotsFor(bandOf(grade), opts.genre);
    for (let i = 0; i < 50; i++) {
      const ps = build(grade, makeSeed(randBase(), focus, slots[Math.floor(Math.random() * slots.length)]));
      if (!avoid.has(ps.id)) return ps;
    }
    return build(grade, makeSeed(randBase(), focus, slots[0]));
  }

  /* ================= ADAPTIVE PICKING ================= */
  const mem = { r: {}, lastGenre: null, recent: [], grade: null };
  function note(type, ok, grade) {
    if (TYPES.indexOf(type) === -1) return;
    const g = grade == null ? (mem.grade == null ? "x" : mem.grade) : Math.round(Number(grade));
    const m = mem.r[g] || (mem.r[g] = {});
    const a = m[type] || (m[type] = []);
    a.push(ok ? 1 : 0);
    if (a.length > 20) a.shift();
  }
  /* Miss rate for each type, from saved recent answers plus this session's. */
  function typeNeeds(p, grade) {
    const saved = (p && p.readRecent && p.readRecent[grade]) || {}, sess = mem.r[grade] || {}, any = mem.r.x || {};
    const out = {};
    TYPES.forEach(function (t) {
      const a = [].concat(Array.isArray(saved[t]) ? saved[t].slice(-20) : [], sess[t] || [], any[t] || []);
      const n = a.length, right = a.reduce(function (s, x) { return s + (x ? 1 : 0); }, 0);
      out[t] = { n: n, miss: n ? (n - right + 0.5) / (n + 1) : 0 };
    });
    return out;
  }
  function weakType(p, grade) {
    const need = typeNeeds(p, grade);
    const cand = TYPES.filter(function (t) { return need[t].n >= 2 && need[t].miss > 0.3; })
      .sort(function (a, b) { return need[b].miss - need[a].miss; });
    return cand[0] || null;
  }
  function sig(ps) { const m = /^.*?[.!?]["'\u201d]?(\s|$)/.exec(ps.text); return ps.title.toLowerCase() + "|" + (m ? m[0] : ps.text).trim().toLowerCase(); }

  /* pick(p, grade, count, focus, exclude) → `count` new passages for a round */
  function pick(p, grade, count, focus, exclude) {
    grade = Math.max(-1, Math.min(8, Math.round(Number(grade) || 0)));
    count = Math.max(1, Math.min(10, count || 2));
    mem.grade = grade;
    const band = bandOf(grade);
    const seenList = (p && Array.isArray(p.seenPassages)) ? p.seenPassages : [];
    const seen = new Set(seenList);
    const sigs = new Set(), recentSubj = mem.recent.slice(-12);
    (exclude || []).forEach(function (x) { const id = typeof x === "string" ? x : x && x.id; if (id) seen.add(id); });
    seen.forEach(function (id) {
      if (!/^sg-/.test(id)) return;
      const ps = fromId(id);
      if (ps) { sigs.add(sig(ps)); sigs.add(ps.text); }
    });
    seenList.slice(0, 12).forEach(function (id) { const ps = /^sg-/.test(id) && fromId(id); if (ps) recentSubj.push(info(ps).subject); });
    const weak = TYPES.indexOf(focus) !== -1 ? focus : weakType(p, grade);
    let lastGenre = mem.lastGenre;
    const out = [];
    for (let i = 0; i < count; i++) {
      const want = weak && (focus || Math.random() < 0.75) ? weak : null;
      const genres = uniq(GENRES[band]).filter(function (g) { return g !== lastGenre; });
      let got = null;
      for (let tries = 0; tries < 80 && !got; tries++) {
        const g = genres[Math.floor(Math.random() * genres.length)];
        const sl = slotsFor(band, g);
        const ps = build(grade, makeSeed(randBase(), want, sl[Math.floor(Math.random() * sl.length)]));
        const m = info(ps);
        if (seen.has(ps.id) || sigs.has(sig(ps)) || sigs.has(ps.text)) continue;
        if (tries < 60 && recentSubj.indexOf(m.subject) !== -1) continue;
        if (tries < 40 && want && ps.questions.filter(function (q) { return q.type === want; }).length < 2) continue;
        got = ps;
      }
      if (!got) got = generate(grade, { avoid: seen });
      out.push(got); seen.add(got.id); sigs.add(sig(got)); sigs.add(got.text);
      const gi = info(got);
      recentSubj.push(gi.subject); mem.recent.push(gi.subject);
      lastGenre = gi.genre;
    }
    if (mem.recent.length > 30) mem.recent.splice(0, mem.recent.length - 30);
    mem.lastGenre = lastGenre;
    return out;
  }

  /* Called by storage.js on every load/save. StoryGen adds no new saved
     fields; it only keeps p.seenPassages a short list of plain ids. */
  function sanitize(p) {
    if (!p || p.seenPassages === undefined) return p;
    p.seenPassages = Array.isArray(p.seenPassages)
      ? p.seenPassages.filter(function (x, i, a) { return typeof x === "string" && x.length <= 60 && /^[a-z0-9-]+$/i.test(x) && a.indexOf(x) === i; }).slice(0, 300)
      : [];
    return p;
  }

  return {
    generate: generate, fromId: fromId, pick: pick, note: note, sanitize: sanitize,
    weakType: weakType, info: info, bandOf: bandOf,
    _mem: mem, _kwScore: kwScore, _genres: GENRES, _test: { build: build, makeSeed: makeSeed, countSent: countSent, VOC: VOC, FACTS: FACTS, LEN: LEN }
  };
})();
