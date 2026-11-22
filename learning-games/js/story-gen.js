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
    "Lauryn Kyra Bridgette Jada Mei Elena Tessa Naomi Isla Aria Leah Gemma Talia Nina Daisy June Keira Anya Lena Willa").split(" ");
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
    impatient: [1, "not wanting to wait", "wait|hurry|now|rush|can't|couldn't|annoy|quick|fast|soon"],
    sprout: [1, "a new little plant just starting to grow", "plant|grow|baby|new|little|small|shoot|green|seedling|leaf"],
    harvest: [2, "the food or crops that are picked when they are ready", "food|crop|pick|vegetable|fruit|grew|grow|ready|plant|gather"],
    patience: [3, "being able to wait calmly", "wait|calm|without|time|slow|not rush|don't rush|not upset"],
    butterflies: [1, "a fluttery, nervous feeling in your stomach", "nervous|scared|worr|flutter|jitter|anxious|afraid|tummy|stomach"],
    applause: [2, "clapping to show you liked something", "clap|cheer"],
    vanished: [3, "went away completely", "gone|away|disappear|went|left|no longer|not there"],
    courage: [3, "being brave even when you are afraid", "brave|bold|not afraid|fear|scared|afraid|strong|hero"]
  };

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
      ["infer", "2+", "", "What would have happened if {Name} had given up?", "{He} would never have learned to {skill}.", "Think about what the practice gave {him}.", "never|not learn|wouldn't|would not|couldn't|could not|not be able|still|no"]
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
      ["0", 1, "", "{He} gives it water every day.", "{Name} waters the seed."],
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
    ["a soccer game~soccer|game", "played balloon soccer in the hallway~balloon|hallway|soccer"],
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
      ["0", 1, "", "{Name} was ready for {plan}.", "Today was the day for {plan}!"],
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
      ["infer", "2+", "", "Why do you think the timer helped?", "It made the turns fair, so nobody had to argue about whose turn it was.", "Think about what they were fighting about before.", "fair|same|equal|argu|fight|both|turn|know|whose"]
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
      ["infer", "1+", "", "Why do you think {helper} laughed?", "To show {Name} that the mistake was not a big deal and could be fixed.", "Think about what {helper} said right after.", "okay|ok|not a big deal|fine|everyone|mistake|fix|feel better|cheer|funny|silly"],
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
      ["0", 0.7, "", "At first, nobody came.", "Nobody stopped. {Name} was sad."],
      ["0", 1, "", "Then they {idea}.", "So they {idea}."],
      ["0", 1, "", "Lots of people came! They gave the money to {cause}.", "Then people came! The friends felt ^proud."],
      ["1+", 1, "", "{Name} and {pal} wanted to raise money for {cause}.", "@2 When {Name} and {pal} learned that {cause} needed help, they made a plan."],
      ["1+", 1, "", "They set up a stand to sell {sell}.", "@2 On Saturday, they set up a table on the sidewalk to sell {sell}."],
      ["1+", 1, "", "For the first hour, nobody stopped.", "@2 For a whole hour, people walked right past without stopping."],
      ["1+", 0.8, "", "{Name} wanted to give up.", "@2 {Name} felt ^discouraged and wanted to pack up.", "@3 The friends began to feel ^discouraged as the ice in the pitcher melted."],
      ["1+", 1, "", "Then {pal} had an idea, and they {idea}.", "@2 \"Wait, I have an idea!\" {pal} said. So they {idea}."],
      ["1+", 1, "", "Soon, people began to stop.", "@2 Before long, ^customers were lining up."],
      ["1+", 1, "", "By the end of the day, they had raised {money}.", "@2 By sunset, they had sold everything and raised {money}."],
      ["1+", 1, "", "They gave all the money to {cause} to {use}.", "@2 The next day, they ^donated every dollar to {cause} to help {use}."],
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
      ["infer", "1+", "", "Why do you think people started to stop after the idea?", "Because now people could see what the stand was for.", "Think about what changed.", "see|notice|saw|know|knew|sign|closer|attention|for|help"],
      ["infer", "1+", "", "How did {Name} feel when nobody stopped?", "{He} felt discouraged and wanted to give up.", "Look at what {Name} wanted to do.", SAD + "|discourag|give up|quit"],
      ["infer", "2+", "", "What would have happened if they had given up after the first hour?", "They would not have raised any money for {cause}.", "Think about what happened after the idea.", "no money|not raise|wouldn't|would not|nothing|no|not help"]
    ] });
  const DOJO = STORY, FACTS = [];
  function animalPassage(c) { return runPlot(c, STORY); }
  const howtoPassage = animalPassage, commPassage = animalPassage, histPassage = animalPassage;

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
  function vocabQs(c) {
    return c._voc.filter(function (w) { return VOC[w] && VOC[w][0] <= c.band; }).map(function (w) {
      const v = VOC[w], kind = c.kind || "story";
      const q = c.band === 0 ? P(["What does \"" + w + "\" mean?", "What does the word \"" + w + "\" mean?"])
        : P(["What does the word \"" + w + "\" mean in this " + kind + "?", "The " + kind + " uses the word \"" + w + "\". What does it mean?",
          "What does \"" + w + "\" mean? Use clues from the " + kind + ".", "What is another way to say \"" + w + "\"?"]);
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
    return { title: fill(P(pl.title), c), sents: sents, qs: runQs(c, pl.qs), subject: c.subject || pl.k };
  }
  const SMALL = " a an the and or of to in on at for with from by but as ";
  function titleCase(t) {
    return t.split(" ").map(function (w, i) { return i > 0 && SMALL.indexOf(" " + w.toLowerCase() + " ") !== -1 ? w.toLowerCase() : cap(w); }).join(" ");
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
  const LEN = { "-1": [3, 5], 0: [3, 5], 1: [5, 6], 2: [5, 7], 3: [6, 8], 4: [6, 9], 5: [7, 9], 6: [8, 10], 7: [8, 11], 8: [9, 12] };
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
        const cands = out.qs.concat(vocabQs(c)).filter(function (q) { return q.keys.length && kwScore(q.keys, q.answer) === 2; });
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
    if (++cacheN > 3000) { Object.keys(cache).forEach(function (k) { delete cache[k]; delete meta[k]; }); cacheN = 0; }
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
      if (ps) { sigs.add(sig(ps)); }
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
        if (seen.has(ps.id) || sigs.has(sig(ps))) continue;
        if (tries < 60 && recentSubj.indexOf(m.subject) !== -1) continue;
        if (tries < 40 && want && ps.questions.filter(function (q) { return q.type === want; }).length < 2) continue;
        got = ps;
      }
      if (!got) got = generate(grade, { avoid: seen });
      out.push(got); seen.add(got.id); sigs.add(sig(got));
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
