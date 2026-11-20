/* ENDLESS SENTENCES
   1. A built-in generator: correct sentences from templates (thousands of
      combinations), then mistakes are planted on purpose, chosen to target
      the kinds of mistakes your child misses most. Works offline, forever.
   2. When the game is opened through the shared Claude link, Claude also
      writes fresh sentences aimed at your child's weak spots. They're added
      to your account's sentence bank, which keeps growing. */
window.BD = window.BD || {};

BD.SentenceGen = (function () {
  const pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  const r = function (lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); };
  function pick2(a) { const x = pick(a); let y = pick(a); while (y === x) y = pick(a); return [x, y]; }
  function pickN(a, n) { const c = a.slice(), out = []; while (out.length < n && c.length) out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]); return out; }

  /* ---------- word lists ---------- */
  const W = {
    name: ["Maya", "Leo", "Ava", "Eli", "Sofia", "Noah", "Grace", "Mateo", "Ruby", "Owen", "Zoe", "Caleb", "Nora", "Isaac", "Lily", "Jonah", "Hazel", "Miles", "Ivy", "Theo", "Aria", "Kai"],
    place: [["Denver", "Colorado"], ["Austin", "Texas"], ["Reno", "Nevada"], ["Boston", "Massachusetts"], ["Miami", "Florida"], ["Portland", "Oregon"], ["Phoenix", "Arizona"], ["Nashville", "Tennessee"], ["Chicago", "Illinois"], ["Seattle", "Washington"], ["Atlanta", "Georgia"], ["Omaha", "Nebraska"], ["Las Vegas", "Nevada"], ["San Diego", "California"]],
    day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    weekend: ["Saturday", "Sunday"],
    month: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    spot: ["park", "beach", "lake", "library", "playground", "zoo", "museum", "pool", "garden"],
    act: ["played tag", "built a sandcastle", "rode our bikes", "fed the ducks", "flew a kite", "had a picnic", "looked for shells", "read books", "played soccer", "practiced karate"],
    rel: ["sister", "brother", "cousin", "aunt", "uncle", "grandma", "grandpa", "neighbor"],
    adj: ["fluffy", "tiny", "noisy", "friendly", "sleepy", "spotted", "curious", "playful"],
    pet: ["dog", "cat", "bunny", "hamster", "parrot", "turtle", "puppy", "kitten"],
    petName: ["Biscuit", "Pepper", "Rocket", "Daisy", "Ziggy", "Mochi", "Scout", "Peanut", "Luna", "Bear"],
    meal: ["lunch", "dinner", "breakfast", "practice", "class"],
    animals: ["birds", "frogs", "ducks", "puppies", "kittens", "horses", "rabbits", "squirrels"],
    doing: ["playing", "sleeping", "splashing", "running", "resting", "hiding"],
    habitat: ["yard", "pond", "barn", "field", "garden", "meadow"],
    thing: ["backpack", "lunchbox", "jacket", "water bottle", "notebook", "pencil", "umbrella", "soccer ball"],
    item: ["apples", "bread", "milk", "eggs", "carrots", "rice", "cheese", "grapes", "bananas", "pancakes"],
    store: ["market", "store", "farm stand", "bakery"],
    bigAct: ["visited the museum", "moved to a new house", "adopted a puppy", "went camping", "watched fireworks", "earned a new belt"],
    furniture: ["couch", "table", "bed", "porch", "stairs"],
    plural: ["toys", "books", "shoes", "socks", "crayons", "blocks"],
    surface: ["floor", "table", "stairs", "couch"],
    last: ["Lee", "Garcia", "Patel", "Brown", "Kim", "Lopez", "Nguyen", "Carter"],
    topic: ["volcanoes", "fractions", "the planets", "plants", "the ocean", "electricity", "the Civil War", "magnets"],
    event: ["game", "concert", "movie", "storm", "meeting", "parade", "tournament"],
    snack: ["snack", "cookie", "glass of water", "turn", "pencil", "hint"],
    gear: ["umbrella", "raincoat", "boots", "jacket"],
    contest: ["game", "spelling bee", "race", "tournament", "science fair"],
    group: ["girls", "boys", "players", "students"],
    landmark: ["Grand Canyon", "Hoover Dam", "Statue of Liberty", "Golden Gate Bridge", "Lake Tahoe", "Rocky Mountains"],
    subject: ["math", "science", "spelling", "history"],
    hobby: [["hiking", "swimming", "riding bikes"], ["drawing", "singing", "building forts"], ["reading", "cooking", "playing chess"], ["kicking", "blocking", "sparring"]]
  };

  /* ---------- correct sentences (grade = the lowest grade that uses it) ---------- */
  const T = [
    [3, function () { return pick(W.name) + " and I " + pick(W.act) + " at the " + pick(W.spot) + " on " + pick(W.day) + "."; }],
    [3, function () { return "My " + pick(W.rel) + " has a " + pick(W.adj) + " " + pick(W.pet) + " named " + pick(W.petName) + "."; }],
    [3, function () { return "Can we go to the " + pick(W.spot) + " after " + pick(W.meal) + "?"; }],
    [3, function () { return "We were so happy because it was " + pick(W.name) + "'s birthday."; }],
    [3, function () { return "The " + pick(W.animals) + " are " + pick(W.doing) + " in the " + pick(W.habitat) + "."; }],
    [3, function () { return pick(W.name) + " has a new " + pick(W.thing) + " for school."; }],
    [3, function () { return "I can't find my " + pick(W.thing) + " anywhere."; }],
    [3, function () { return "We don't have school on " + pick(W.weekend) + "."; }],
    [3, function () { return "Did you see the " + pick(W.adj) + " " + pick(W.pet) + " at the " + pick(W.spot) + "?"; }],
    [3, function () { const n = pick2(W.name); return n[0] + " went to " + pick(W.place)[0] + " with " + n[1] + " in " + pick(W.month) + "."; }],
    [3, function () { return "Yesterday we went to the " + pick(W.spot) + " and saw a " + pick(W.adj) + " " + pick(W.pet) + "."; }],
    [3, function () { return "My friend " + pick(W.name) + " lives in " + pick(W.place)[1] + "."; }],
    [4, function () { const i = pickN(W.item, 3); return "We bought " + i[0] + ", " + i[1] + ", and " + i[2] + " at the " + pick(W.store) + "."; }],
    [4, function () { return "On " + pick(W.month) + " " + r(1, 28) + ", " + r(2019, 2026) + ", we " + pick(W.bigAct) + "."; }],
    [4, function () { return pick(W.name) + "'s " + pick(W.pet) + " is sleeping under the " + pick(W.furniture) + "."; }],
    [4, function () { const p = pick(W.place); return "They're going to visit their " + pick(W.rel) + " in " + p[0] + ", " + p[1] + "."; }],
    [4, function () { return "There are too many " + pick(W.plural) + " on the " + pick(W.surface) + "."; }],
    [4, function () { return "Mr. " + pick(W.last) + " is teaching us about " + pick(W.topic) + "."; }],
    [4, function () { const n = pick2(W.name); return n[0] + " gave the " + pick(W.thing) + " to " + n[1] + " and me."; }],
    [4, function () { return "Your " + pick(W.thing) + " is on the " + pick(W.surface) + " by the door."; }],
    [5, function () { return "After the " + pick(W.event) + " ended, we went to the " + pick(W.spot) + "."; }],
    [5, function () { return "\"Can I have a " + pick(W.snack) + "?\" asked " + pick(W.name) + "."; }],
    [5, function () { return "It's going to rain, so bring your " + pick(W.gear) + "."; }],
    [5, function () { const n = pick2(W.name); return n[0] + " and " + n[1] + " practiced hard, and they won the " + pick(W.contest) + "."; }],
    [5, function () { const p = pick(W.place); return "Have you ever been to " + p[0] + ", " + p[1] + "?"; }],
    [5, function () { return "Each of the students has a " + pick(W.thing) + "."; }],
    [5, function () { return "We should have left earlier because the traffic was bad."; }],
    [6, function () { return "The " + pick(W.group) + "' team won its first game on " + pick(W.day) + "."; }],
    [6, function () { const n = pick2(W.name); return n[0] + " is taller than " + n[1] + ", but " + n[1] + " is faster."; }],
    [6, function () { return "The storm affected our plans for " + pick(W.day) + "."; }],
    [6, function () { return "We visited the " + pick(W.landmark) + ", and it was more beautiful than we imagined."; }],
    [6, function () { return "Whose " + pick(W.thing) + " is lying on the floor?"; }],
    [6, function () { return "Neither the teacher nor the students were ready for the " + pick(W.event) + "."; }],
    [7, function () { return "There were fewer people at the " + pick(W.event) + " than we expected."; }],
    [7, function () { return "My " + pick(W.rel) + ", who lives in " + pick(W.place)[1] + ", sends us letters every month."; }],
    [7, function () { return "I wanted to go to the " + pick(W.spot) + "; however, I had too much homework."; }],
    [7, function () { const h = pick(W.hobby); return pick(W.name) + " likes " + h[0] + ", " + h[1] + ", and " + h[2] + "."; }],
    [7, function () { return "If I had studied, I would have passed the " + pick(W.subject) + " test."; }],
    [7, function () { return "The effects of the " + pick(W.event) + " surprised everyone in " + pick(W.place)[0] + "."; }]
  ];

  /* ---------- planting mistakes ---------- */
  function tokenize(s) {
    return s.split(" ").map(function (w) {
      const m = w.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9']*)$/);
      return { pre: m[1], core: m[2], post: m[3] };
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
  const STATES = W.place.map(function (p) { return p[1]; });

  const CONTRACTIONS = { "can't": "can not", "don't": "do not", "didn't": "did not", "isn't": "is not", "it's": "it is", "It's": "it is", "They're": "they are", "they're": "they are", "won't": "will not", "I'm": "I am" };
  const HOMOPHONES = [
    { g: 3, words: { "to": "too", "two": "to" }, hint: "Check every to / too / two.", explain: "to = toward, too = also or more than enough, two = 2." },
    { g: 3, words: { "too": "to" }, hint: "Check every to / too / two.", explain: "too means also or more than enough. to shows direction." },
    { g: 3, words: { "week": "weak", "ate": "eight", "for": "four", "by": "buy", "new": "knew", "our": "are", "hear": "here" }, hint: "One word sounds right but is the wrong word.", explain: "" },
    { g: 4, words: { "their": "there", "there": "their", "They're": "Their", "they're": "their", "There": "Their" }, hint: "Check the their / there / they're word.", explain: "their = belongs to them, there = a place (or 'there is/are'), they're = they are." },
    { g: 4, words: { "your": "you're", "Your": "You're" }, hint: "Check the your / you're word.", explain: "your = belongs to you, you're = you are." },
    { g: 5, words: { "its": "it's" }, hint: "Check the its / it's word.", explain: "its = belongs to it. it's = it is." },
    { g: 5, words: { "than": "then" }, hint: "Check the than / then word.", explain: "than compares things. then is about time." },
    { g: 6, words: { "Whose": "Who's", "affected": "effected", "effects": "affects", "lying": "laying" }, hint: "One word is a commonly mixed-up word.", explain: "" }
  ];
  const HOMO_EXPLAIN = { week: "A week is 7 days. Weak means not strong.", ate: "ate = had food. eight = 8.", for: "for is a little helper word. four = 4.", by: "by means next to or through. buy means to pay for.", new: "new = not old. knew = past of know.", our: "our = belongs to us. are is a verb (we are).", hear: "hear = with your ears. here = this place.",
    Whose: "Whose asks who owns something. Who's = who is.", affected: "affected is the verb (it changed something). effect is usually the noun.", effects: "effects are results (a noun). affect is usually the verb.", lying: "Something resting is lying. You lay something down." };
  const MISSPELL = { because: "becuase", friend: "freind", said: "sed", people: "peeple", library: "libary", school: "scool", really: "realy", again: "agen", different: "diffrent", believe: "beleive", museum: "musuem", family: "famly", birthday: "berthday", before: "befor", until: "untill", every: "evry", together: "togather", letters: "leters", umbrella: "umbrela", homework: "homwork", dinner: "diner", beach: "beech", surprised: "suprised", science: "sience", tournament: "turnament", concert: "consert", carrots: "carots", apples: "aples", cheese: "chees", bunny: "buny", parrot: "parot", turtle: "turtel", water: "watter", bottle: "bottel", jacket: "jaket", pencil: "pensil", playground: "playgrownd", garden: "gardin", anywhere: "anywere", happy: "hapy", traffic: "trafic", earlier: "erlier", beautiful: "beutiful", imagined: "imajined", expected: "expeckted", everyone: "evryone", studied: "studyed", passed: "past", teaching: "teeching", sleeping: "sleping", kitten: "kitton", puppy: "pupy", friendly: "frendly", curious: "curius", birds: "berds", squirrels: "squirels", fireworks: "firewerks", ready: "redy", month: "munth", meeting: "meating", spelling: "speling", history: "histery", camping: "campping", notebook: "noteboke", breakfast: "brekfast", lunch: "lunsh", anything: "anythin" };
  const AGREE = { is: ["are", "Use is for one thing and are for more than one."], are: ["is", "Use are for more than one (or with you/we/they)."], was: ["were", "Use was for one thing and were for more than one (or with we/you/they)."], were: ["was", "Use were for more than one (or with we/you/they)."], has: ["have", "Use has with he, she, it or one person (each of them has)."], have: ["has", "Use have with I, you, we, they and after helper words like would."] };
  const PAST = { went: "goed", ran: "runned", saw: "seen", made: "maked", ate: "eated", brought: "bringed", built: "builded", found: "finded", took: "taked", won: "winned", wrote: "writed", rode: "rided", fed: "feeded", bought: "buyed", gave: "gived", flew: "flied", had: "haved" };
  const PAST_BASE = { went: "go", ran: "run", saw: "see", made: "make", ate: "eat", brought: "bring", built: "build", found: "find", took: "take", won: "win", wrote: "write", rode: "ride", fed: "feed", bought: "buy", gave: "give", flew: "fly", had: "have" };

  const INJECT = {
    cap: [
      function capFirst(t, used) {
        if (used.has(0) || !/^[A-Z]/.test(t[0].core)) return null;
        t[0].core = t[0].core === "I" ? "i" : lowerFirst(t[0].core); used.add(0);
        return { hint: "Look at the very first word.", explain: "A sentence always starts with a capital letter." };
      },
      function capI(t, used) {
        const i = each(t, used, function (x, k) { return k > 0 && (x.core === "I" || x.core === "I'm"); });
        if (i < 0) return null;
        t[i].core = lowerFirst(t[i].core); used.add(i);
        return { hint: "Look for the word that means you.", explain: "The word I is always a capital letter." };
      },
      function capProper(t, used) {
        const i = each(t, used, function (x, k) { return k > 0 && /^[A-Z][a-z]/.test(x.core) && x.core !== "Mr" && x.pre.indexOf('"') === -1; });
        if (i < 0) return null;
        const word = t[i].core;
        t[i].core = lowerFirst(word); used.add(i);
        return { hint: "Look for the name of a person, pet, place, day or month.", explain: word + " is a name, so it starts with a capital letter." };
      }
    ],
    punct: [
      function endMark(t, used) {
        const i = t.length - 1, end = t[i].post;
        if (used.has(i) || !/[.?]$/.test(end)) return null;
        const q = /\?$/.test(end);
        t[i].post = end.slice(0, -1) + (q && Math.random() < 0.5 ? "." : ""); used.add(i);
        return q ? { hint: "Is this sentence telling or asking?", explain: "A question ends with a question mark." }
                 : { hint: "How does this sentence end?", explain: "A telling sentence ends with a period." };
      },
      function apostrophe(t, used) {
        const i = each(t, used, function (x) { return /'/.test(x.core); });
        if (i < 0) return null;
        const tok = t[i];
        if (/s'$/.test(tok.core)) { // plural possessive: girls'
          const w = tok.core; tok.core = w.slice(0, -1); used.add(i);
          return { hint: "Something belongs to a group. How do you show that?", explain: w + " shows that something belongs to more than one, so the apostrophe goes after the s." };
        }
        const word = tok.core;
        tok.core = word.replace("'", ""); used.add(i);
        if (CONTRACTIONS[word]) return { hint: "Look for a word that is short for two words.", explain: word + " is short for " + CONTRACTIONS[word] + ", so it needs an apostrophe." };
        return { hint: "Something belongs to someone. How do you show that?", explain: word + " shows that something belongs to " + word.replace("'s", "") + ", so it needs 's." };
      },
      function comma(t, used) {
        const i = each(t, used, function (x, k) { return /,$/.test(x.post) && k < t.length - 1 && ["and", "or"].indexOf(t[k + 1].core) === -1; });
        if (i < 0) return null;
        const next = t[i + 1].core, prev = t[i].core;
        t[i].post = t[i].post.replace(/,$/, ""); used.add(i);
        let why = "Commas separate parts of a sentence so it's easy to read.";
        if (STATES.indexOf(next) !== -1 || STATES.some(function (s) { return s.indexOf(next) === 0; })) why = "Put a comma between a city and its state.";
        else if (/^\d+$/.test(prev) && Number(prev) < 32) why = "Dates need a comma between the day and the year.";
        else if (/^\d{4}$/.test(prev)) why = "Put a comma after the year when the sentence keeps going.";
        else if (next === "so" || next === "but") why = "Use a comma before " + next + " when it joins two complete sentences.";
        else if (prev === "however") why = "Put a comma after however.";
        else if (next === "who" || STATES.indexOf(prev) !== -1) why = "Put commas around extra information like 'who lives in...'.";
        else if (i < 5 && /^(After|When|If|On|Before)$/.test(t[0].core)) why = "Put a comma after an opening part like 'After the game ended'.";
        else if (/^(asked|said)$/.test(next) || /"$/.test(t[i].post)) why = "Quoted words are followed by a comma or question mark inside the quotes.";
        else why = "Use commas to separate items in a list.";
        return { hint: "A comma is missing somewhere.", explain: why };
      }
    ],
    spell: [
      function misspell(t, used) {
        const i = each(t, used, function (x) { return MISSPELL[x.core.toLowerCase()] && x.core === x.core.toLowerCase(); });
        if (i < 0) return null;
        const word = t[i].core;
        t[i].core = MISSPELL[word]; used.add(i);
        return { hint: "One word is spelled wrong. Sound each word out slowly.", explain: word + " is spelled " + spellOut(word) + "." };
      },
      function homophone(t, used, grade) {
        const groups = HOMOPHONES.filter(function (h) { return h.g <= grade; });
        const options = [];
        t.forEach(function (x, k) {
          if (used.has(k)) return;
          groups.forEach(function (h) { if (h.words[x.core]) options.push([k, h]); });
        });
        if (!options.length) return null;
        const o = pick(options), k = o[0], h = o[1], word = t[k].core;
        t[k].core = h.words[word]; used.add(k);
        return { hint: h.hint, explain: h.explain || HOMO_EXPLAIN[word] || (word + " is the right word here.") };
      }
    ],
    grammar: [
      function agreement(t, used) {
        const i = each(t, used, function (x) { return AGREE[x.core]; });
        if (i < 0) return null;
        const word = t[i].core;
        t[i].core = AGREE[word][0]; used.add(i);
        return { hint: "Does the verb match who is doing it? (is/are, was/were, has/have)", explain: "It should be " + word + ". " + AGREE[word][1] };
      },
      function pastTense(t, used) {
        const i = each(t, used, function (x) { return PAST[x.core]; });
        if (i < 0) return null;
        const word = t[i].core;
        t[i].core = PAST[word]; used.add(i);
        return { hint: "One action word has the wrong past-tense form.", explain: "The past tense of " + PAST_BASE[word] + " is " + word + "." };
      },
      function pronoun(t, used) {
        const i = each(t, used, function (x, k) { return k > 0 && t[k - 1].core === "and" && (x.core === "I" || x.core === "me"); });
        if (i < 0) return null;
        const word = t[i].core;
        t[i].core = word === "I" ? "me" : "I"; used.add(i);
        return word === "I"
          ? { hint: "Take out the other person's name. Does the sentence still sound right?", explain: "Use I when you're one of the people doing the action: '... and I went'." }
          : { hint: "Take out the other person's name. Does the sentence still sound right?", explain: "Use me after action words and words like to or with: 'gave it to ... and me'." };
      }
    ]
  };

  const BASE_ERRORS = { 3: 2, 4: 2, 5: 3, 6: 3, 7: 4 };

  /* Build one fresh sentence with mistakes, aimed at the student's weak spots. */
  function make(grade, weights, extra) {
    const pool = T.filter(function (x) { return x[0] <= grade && x[0] >= grade - 2; });
    const want = Math.max(1, Math.min(5, BASE_ERRORS[grade] + (extra || 0)));
    for (let attempt = 0; attempt < 6; attempt++) {
      const answer = pick(pool)[1]();
      const t = tokenize(answer), used = new Set(), fixes = [];
      const limit = Math.max(1, Math.min(want, Math.floor(t.length / 2.5))); // keep short sentences readable
      for (let n = 0; n < 40 && fixes.length < limit; n++) {
        const type = weighted(weights);
        const fn = pick(INJECT[type]);
        const before = join(t);
        const f = fn(t, used, grade);
        if (f && join(t) !== before) fixes.push({ type: type, hint: f.hint, explain: f.explain });
      }
      const text = join(t);
      if (fixes.length && text !== answer) {
        return { id: "gen-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), grade: grade, text: text, answer: answer, fixes: fixes, source: "gen" };
      }
    }
    return null;
  }
  function weighted(w) {
    const keys = Object.keys(w);
    let x = Math.random() * keys.reduce(function (a, k) { return a + w[k]; }, 0);
    for (const k of keys) { x -= w[k]; if (x <= 0) return k; }
    return keys[keys.length - 1];
  }

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
    const w = BD.Coach.typeWeights(p, grade);
    const focus = Object.keys(w).sort(function (a, b) { return w[b] - w[a]; }).slice(0, 2).map(function (k) { return BD.FIX_TYPES[k].label; });
    const n = Math.max(1, Math.min(5, BASE_ERRORS[grade] + BD.Coach.sentLevel(p, grade)));
    const examples = BD.SENTENCES.filter(function (s) { return s.grade === grade; }).slice(0, 2).map(function (s) { return JSON.stringify({ text: s.text, answer: Array.isArray(s.answer) ? s.answer[0] : s.answer, fixes: s.fixes }); }).join("\n");
    const prompt = [
      "Write 8 NEW sentence-correction exercises for a homeschool student in grade " + grade + ".",
      "Each one is a sentence (8 to 18 words) with mistakes planted in it, plus the corrected sentence.",
      "Rules:",
      "- Plant " + n + " mistakes per sentence (one fewer or one more is fine). Each mistake changes ONE word or ONE punctuation mark. Never add or remove whole words; the text and answer must have the same number of words.",
      "- Mistake types: cap (capitalization), punct (end marks, commas, apostrophes, quotation marks), spell (misspelling or wrong sound-alike word), grammar (verb agreement, verb tense, pronoun case).",
      "- Focus most on: " + focus.join(" and ") + ".",
      "- Use grade " + grade + " vocabulary and rules. Topics: animals, sports, karate, family, science, history, holidays, places in the USA. Use real US cities and states.",
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
     match weak spots, topped up with freshly generated ones. */
  function round(p, grade, size, focus) {
    const w = BD.Coach.typeWeights(p, grade, focus);
    const seen = new Set(p.seenSentences);
    const curated = BD.SENTENCES.filter(function (s) { return s.grade === grade; }).concat(bankItems(grade))
      .filter(function (s) { return !seen.has(s.id); })
      .map(function (s) {
        const score = s.fixes.reduce(function (a, f) { return a + (w[f.type] || 1); }, 0) / s.fixes.length;
        return { s: s, score: score * (0.75 + Math.random() * 0.5) };
      })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (x) { return x.s; });
    const out = curated.slice(0, Math.min(5, size));
    const extra = BD.Coach.sentLevel(p, grade);
    let guard = 0;
    while (out.length < size && guard++ < 40) { const g = make(grade, w, extra); if (g) out.push(g); }
    // shuffle
    return out.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; });
  }

  return { make: make, round: round, topUp: topUp, applyRemoteBank: applyRemoteBank, bankItems: bankItems, valid: valid, TEMPLATES: T };
})();
