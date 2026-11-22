/* WORD GAMES — Spanish Dojo and Spelling Bee share one quiz engine.
   Spanish: pick or type the matching word, hear it spoken.
   Spelling: six challenge styles (listen, missing letter, pick the spelling,
   spot the misspelling, fix it, unscramble). Quiet mode skips listening.
   Same rules as the other games: XP, streaks, missed words come back,
   70% to pass, lessons, grade changes and Sensei. */
window.BD = window.BD || {};

BD.WordQuiz = (function () {
  const ROUND = 10, PASS = 70;
  /* Pre-K to 2nd grade: shorter rounds (5) so a round ends before attention does. */
  const roundLen = function (grade) { return BD.Kid && BD.Kid.young(grade) ? 5 : ROUND; };
  const $ = function (id) { return document.getElementById(id); };
  const r = function (n) { return Math.floor(Math.random() * n); };
  const shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
  const plain = function (s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[¿?¡!.,'"]/g, "").replace(/\s+/g, " ").trim(); };
  let W = null;

  /* ---------- Spanish ---------- */
  const spanish = {
    key: "spanish", title: "Spanish Dojo", coach: "bridgette", field: "spanishGrade",
    topics: function (grade) { return BD.SPANISH.filter(function (t) { return t.g <= grade; }); },
    round: function (p, grade) {
      const topics = this.topics(grade);
      const weighted = [];
      topics.forEach(function (t) { const n = t.g >= grade - 1 ? 3 : 1; for (let i = 0; i < n; i++) weighted.push(t); });
      const missed = Object.values((p.wordMissed.spanish || {})).filter(function (m) { return m.grade === grade; }).slice(0, 3);
      const items = missed.map(function (m) { return makeSpanish(topics.find(function (t) { return t.topic === m.topic; }), m.es, grade); }).filter(Boolean);
      const used = new Set(items.map(function (x) { return x.id; }));
      let guard = 0;
      while (items.length < roundLen(grade) && guard++ < 200) {
        const t = weighted[r(weighted.length)], w = t.words[r(t.words.length)];
        if (used.has(t.topic + ":" + w[0])) continue;
        used.add(t.topic + ":" + w[0]);
        items.push(makeSpanish(t, w[0], grade));
      }
      return shuffle(items);
    }
  };
  function makeSpanish(topic, es, grade) {
    if (!topic) return null;
    const w = topic.words.find(function (x) { return x[0] === es; }); if (!w) return null;
    const roll = Math.random();
    const canType = grade >= 4 && !topic.phrase;
    let mode;
    if (canType && roll < (grade >= 6 ? 0.4 : 0.3)) mode = "type";
    else mode = Math.random() < (grade <= 1 ? 0.6 : 0.5) ? "es2en" : "en2es";
    const others = shuffle(topic.words.filter(function (x) { return x[0] !== es; })).slice(0, 3);
    while (others.length < 3) { // borrow from other topics if this one is small
      const t2 = BD.SPANISH[r(BD.SPANISH.length)], w2 = t2.words[r(t2.words.length)];
      if (w2[0] !== es && !others.some(function (o) { return o[0] === w2[0] || o[1] === w2[1]; })) others.push(w2);
    }
    const opts = shuffle([w].concat(others));
    const pic = w[2] && !topic.color ? w[2] : "";
    const swatch = topic.color ? w[2] : "";
    return {
      id: topic.topic + ":" + es, topic: topic.topic, es: es, en: w[1], mode: mode, color: !!topic.color,
      label: topic.topic,
      prompt: mode === "es2en" ? es : w[1],
      pic: mode === "es2en" ? "" : pic, swatch: mode === "es2en" ? "" : swatch,
      sub: mode === "es2en" ? "What does this mean?" : mode === "en2es" ? "How do you say this in Spanish?" : "Type it in Spanish",
      choices: mode === "type" ? null : opts.map(function (o) { return { value: mode === "es2en" ? o[1] : o[0], swatch: mode === "es2en" && topic.color ? o[2] : "" }; }),
      answer: mode === "es2en" ? w[1] : es,
      speakNow: mode === "es2en" ? { text: es, lang: "es-MX" } : null,
      speakAfter: { text: es, lang: "es-MX" },
      explain: es + " = " + w[1],
      facts: "Spanish practice. The Spanish \"" + es + "\" means \"" + w[1] + "\" (topic: " + topic.topic + ")."
    };
  }

  /* ---------- Spelling ---------- */
  /* Challenge styles (only "listen" needs sound):
     listen   – hear the word, type it
     missing  – a letter (or two) is missing; pick it
     pick     – choose the correct spelling out of 4
     check    – is the underlined word spelled right?
     fix      – the underlined word is misspelled; type it correctly
     scramble – unscramble the letter tiles */
  const STYLE_INFO = {
    listen: "Listen and spell", missing: "Missing letter", pick: "Pick the right spelling",
    check: "Spelling check", fix: "Fix the spelling", scramble: "Unscramble"
  };
  /* Quiet mode: no listening challenges. Also on when sound is off or the device can't talk. */
  function isQuiet(p) { return !BD.Speech.available || !!(BD.Store && BD.Store.muted) || !!(p && p.quietMode); }

  function styleWeights(grade, quiet) {
    const w = { listen: quiet ? 0 : 2, missing: grade <= 1 ? 3 : 2, pick: 2, check: grade >= 0 ? 2 : 0, fix: grade >= 2 ? 2 : 0, scramble: grade <= 4 ? (grade <= 1 ? 2 : 1.5) : 0 };
    return w;
  }
  /* Draws a mix of styles for a round, never the same style twice in a row. */
  function styleBag(grade, quiet) {
    const w = styleWeights(grade, quiet);
    let last = null;
    return function (avoid) {
      const keys = Object.keys(w).filter(function (k) { return w[k] > 0 && k !== last && k !== avoid; });
      let x = Math.random() * keys.reduce(function (t, k) { return t + w[k]; }, 0), pick = keys[keys.length - 1];
      for (let i = 0; i < keys.length; i++) { x -= w[keys[i]]; if (x <= 0) { pick = keys[i]; break; } }
      last = pick;
      return pick;
    };
  }

  /* Believable misspellings: sound-alike swaps first, then dropped, doubled or swapped letters. */
  const SUBS = [["ph", "f"], ["ck", "k"], ["tion", "shun"], ["tion", "sion"], ["sion", "tion"], ["ough", "uff"], ["ough", "ow"], ["ight", "ite"], ["igh", "i"],
    ["ea", "ee"], ["ee", "ea"], ["ai", "ay"], ["ay", "ai"], ["ie", "ei"], ["ei", "ie"], ["ou", "ow"], ["ow", "ou"], ["oo", "u"], ["wh", "w"], ["kn", "n"],
    ["wr", "r"], ["gh", ""], ["ture", "cher"], ["le", "el"], ["er", "ur"], ["ir", "ur"], ["or", "er"], ["ar", "er"], ["ce", "se"], ["ci", "si"], ["ge", "je"],
    ["qu", "kw"], ["ful", "full"], ["ly", "ley"], ["ent", "ant"], ["ant", "ent"], ["ence", "ance"], ["ance", "ence"], ["able", "ible"], ["ible", "able"],
    ["ss", "s"], ["sc", "s"], ["mn", "m"], ["rh", "r"], ["que", "k"], ["y", "ie"], ["c", "k"], ["k", "c"], ["x", "ks"], ["s", "z"], ["ed", "t"], ["ar", "or"]];
  const VOWELS = "aeiou";
  /* Real words a misspelling must never turn into (so "cat" never becomes "cut"). */
  const COMMON = new Set(("a an as at be by do go he if in is it me my no of on or so to up us we am id ox " +
    "bat bad bag bed bet bit big bog bud bug bun bus but cab can cap cot cut cub cud dig dip dot dug fat fit fin fun fog fox gap gas get got gum gut ham hat hit him his hot hop hug hum hut " +
    "jab jam jet jog jug kid kit lap led let lid lip lit log lot mad man map men met mix mob mop mud mug nap net nod not nut pan pat pet pin pit pod pot pun pup put rag ran rat red rib rid rim rip rod rot rub rug run sad sat set sip sit sob sun tab tag tan tap ten tin tip ton top tub tug van vet wag web wet wig win wit yes yet zip " +
    "ate eat tea sea see saw was how who why are art arm ear era oar our out owl own one won now new few sew sow the then than them they their there these those this that thus what when where were wear ware here hear her hare " +
    "bother brother other mother father later latter litter letter batter better bitter butter otter hotter cotter fried friend fiend bread bead bear beer bare bore boar dear deer door dare fair fare fear four for fore from form farm firm " +
    "hole whole hold old bold cold told sold gold fold mold load lord word work world worm warm ward wars was wad wed weed wood would could should shout short shirt sort salt silt slit slot lost last list lust past post pest " +
    "plan plane plain clan clean lean learn earn yearn early yearly pearl peal real reel rail roll role rule mile mole male meal mail tail tale tall toll tell till tile time tame team tear tore tire tier ware were wire " +
    "write wrote rite right writ white whit wit with wish wash which witch watch match much such touch thought though through threw three thrown throne tough trough cough enough rough laugh " +
    "lightening lighting liking lifting weight wait wade waste waist way weigh whey hey hay heir air err ere sight site cite night knight nit knit know now no knew new kneel kneed need knead " +
    "peace piece pace pacer price prize pride bride ride rid red read reed lead led lid laid paid pail pale peel pole pool pull poll pile pill pine pain pane pin pen pan pun").split(" "));
  /* Every word in the spelling bank, rebuilt only if the bank grows. */
  let bankSet = null, bankN = -1;
  function isRealWord(c) {
    c = c.toLowerCase();
    if (COMMON.has(c)) return true;
    let n = 0; Object.keys(BD.SPELLING).forEach(function (g) { n += BD.SPELLING[g].length; });
    if (!bankSet || n !== bankN) {
      bankSet = new Set(); bankN = n;
      Object.keys(BD.SPELLING).forEach(function (g) { BD.SPELLING[g].forEach(function (x) { bankSet.add(x[0].toLowerCase()); }); });
    }
    return bankSet.has(c);
  }
  function misspellings(word) {
    const w = word.toLowerCase(), sound = [], other = [];
    const add = function (arr, c) { if (c && c !== w && c.length >= 2 && arr.indexOf(c) === -1) arr.push(c); };
    SUBS.forEach(function (s) { const i = w.indexOf(s[0], 1); if (i > 0) add(sound, w.slice(0, i) + s[1] + w.slice(i + s[0].length)); });
    for (let i = 1; i < w.length; i++) {
      if (w[i] === w[i - 1]) add(sound, w.slice(0, i) + w.slice(i + 1));                      // undouble
      else if (VOWELS.indexOf(w[i]) === -1 && i < w.length - 1 && /[a-z]/.test(w[i])) add(other, w.slice(0, i) + w[i] + w.slice(i)); // double
      if (VOWELS.indexOf(w[i]) > -1) VOWELS.split("").forEach(function (v) { if (v !== w[i]) add(other, w.slice(0, i) + v + w.slice(i + 1)); });
      if (i < w.length - 1 && w[i] !== w[i + 1]) add(other, w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2)); // swap two letters
      if (w.length > 3 && i < w.length - 1) add(other, w.slice(0, i) + w.slice(i + 1));                     // drop a letter
    }
    if (w.slice(-1) === "e" && w.length > 3) add(sound, w.slice(0, -1)); else if (VOWELS.indexOf(w.slice(-1)) === -1) add(other, w + "e");
    if (VOWELS.indexOf(w[0]) > -1) VOWELS.split("").forEach(function (v) { if (v !== w[0]) add(other, v + w.slice(1)); });
    const keepCase = function (c) { return word[0] === word[0].toUpperCase() ? c[0].toUpperCase() + c.slice(1) : c; };
    const all = shuffle(sound).concat(shuffle(other)).filter(function (c, i, arr) { return arr.indexOf(c) === i && !isRealWord(c); });
    return all.map(keepCase);
  }

  /* Missing letter(s): blanks a tricky spot and offers look-alike choices. */
  const LOOK = [["c", "k", "s"], ["b", "d", "p"], ["m", "n"], ["f", "v"], ["g", "j"], ["t", "d"], ["l", "r"], ["w", "v"], ["s", "z"], ["h", "n"]];
  const CHUNKS = ["ie", "ei", "ea", "ee", "ai", "ay", "ou", "ow", "oo", "au", "ui", "ue"];
  function missingItem(word, grade) {
    const w = word.toLowerCase(), spots = [];
    for (let i = 0; i < w.length; i++) {
      if (i === 0 && word[0] !== w[0]) continue; // keep capital letters showing
      const v = VOWELS.indexOf(w[i]) > -1 || w[i] === "y";
      const n = (v ? 3 : 1) + (w[i] === w[i - 1] || w[i] === w[i + 1] ? 2 : 0) + (i === 0 ? -0.5 : 0);
      for (let k = 0; k < n * 2; k++) spots.push([i, 1]);
    }
    if (grade >= 3 && w.length >= 6) for (let i = 1; i < w.length - 1; i++) if (CHUNKS.indexOf(w.slice(i, i + 2)) > -1 || w[i] === w[i + 1]) for (let k = 0; k < 6; k++) spots.push([i, 2]);
    const sp = spots[r(spots.length)], at = sp[0], len = sp[1], ans = w.slice(at, at + len);
    let alts = [];
    if (len === 2) alts = ans[0] === ans[1] ? [ans[0], ans + ans[0], ans[0] === "s" ? "c" : ans[0] + "e"] : CHUNKS.filter(function (c) { return c !== ans; });
    else if (VOWELS.indexOf(ans) > -1 || ans === "y") alts = (VOWELS + "y").split("").filter(function (c) { return c !== ans; });
    else { const grp = LOOK.find(function (g) { return g.indexOf(ans) > -1; }); alts = (grp || []).filter(function (c) { return c !== ans; }).concat("bcdfghklmnprstvw".split("").filter(function (c) { return c !== ans; })); }
    const choices = [ans];
    shuffle(alts.slice(0, len === 2 ? alts.length : 8)).concat(shuffle(alts.slice(8))).forEach(function (c) {
      const made = w.slice(0, at) + c + w.slice(at + len);
      if (choices.length < 4 && choices.indexOf(c) === -1 && made !== w && !isRealWord(made)) choices.push(c);
    });
    const shown = word.slice(0, at), after = word.slice(at + len);
    return { ans: ans, choices: shuffle(choices), html: BD.UI.esc(shown) + '<span class="spell-blank">?</span>' + BD.UI.esc(after), plainShow: shown + "_".repeat(len) + after };
  }

  /* ---------- choosing spelling words ----------
     - Fresh words first: a word is not shown again until the student has
       seen the rest of the grade's list (recent window of RECENT words).
     - Spaced repetition: a missed word comes back next round, then a few
       rounds later, until it has been spelled right three times.
     - Weak patterns (BD.Phonics.weakest): about 40-50% of a round practices
       them, with missed words of that pattern plus new ones.
     - Otherwise a balanced spread of patterns. */
  const RECENT = 600;
  const Ph = function () { return BD.Phonics || null; };
  function seenList(p) {
    p.seenWords = p.seenWords || {};
    if (!Array.isArray(p.seenWords.spelling)) p.seenWords.spelling = [];
    return p.seenWords.spelling;
  }
  function markSeen(p, words) {
    const s = seenList(p);
    words.forEach(function (w) { const i = s.indexOf(w); if (i !== -1) s.splice(i, 1); s.push(w); });
    if (s.length > RECENT) s.splice(0, s.length - RECENT);
  }
  const tagsOf = function (w) { return Ph() ? Ph().tags(w) : []; };
  /* Pick words for one round. Returns { words: [[word, sentence]...], targeted: {word: true}, weak: [tags] } */
  function pickSpelling(p, grade, len, adapt) {
    const list = BD.SPELLING[String(grade)] || [];
    if (!list.length) return { words: [], targeted: {}, weak: [] };
    const byWord = {}; list.forEach(function (x) { byWord[x[0].toLowerCase()] = x; });
    const seq = Number(p.spellSeq) || 0;
    let seen = seenList(p);
    let seenSet = new Set(seen);
    let fresh = list.filter(function (x) { return !seenSet.has(x[0]); });
    if (fresh.length < len) {             // the whole list has been used: start it over
      const mine = new Set(list.map(function (x) { return x[0]; }));
      p.seenWords.spelling = seen = seen.filter(function (w) { return !mine.has(w); });
      seenSet = new Set(seen); fresh = list.slice();
    }
    const bucket = (p.wordMissed && p.wordMissed.spelling) || {};
    const missed = Object.keys(bucket).map(function (k) { return bucket[k]; })
      .filter(function (m) { return m && m.grade === grade && typeof m.word === "string" && byWord[m.word.toLowerCase()]; });
    const waiting = new Set(missed.filter(function (m) { return Number(m.due) > seq; }).map(function (m) { return m.word.toLowerCase(); }));
    const due = missed.filter(function (m) { return !(Number(m.due) > seq); })
      .sort(function (a, b) { return (Number(a.due) || 0) - (Number(b.due) || 0) || b.misses - a.misses; })
      .map(function (m) { return byWord[m.word.toLowerCase()]; });
    const weak = adapt && Ph() ? Ph().weakest(p, grade, 2) : [];
    const hasWeak = function (x) { const t = tagsOf(x[0]); return weak.some(function (w) { return t.indexOf(w) !== -1; }); };
    const out = [], used = {}, targeted = {}, tagCount = {};
    const take = function (x, isTarget) {
      if (!x || out.length >= len || used[x[0].toLowerCase()]) return false;
      used[x[0].toLowerCase()] = 1; out.push(x);
      if (isTarget) targeted[x[0]] = true;
      tagsOf(x[0]).forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; });
      return true;
    };
    const usable = function (x) { return !used[x[0].toLowerCase()] && !waiting.has(x[0].toLowerCase()); };
    /* 1. missed words that are due (weak-pattern ones first), up to 40% of the round */
    const dueMax = Math.max(1, Math.round(len * 0.4));
    const main = function (x) { return !!weak.length && tagsOf(x[0]).indexOf(weak[0]) !== -1; };
    due.filter(main).concat(due.filter(function (x) { return !main(x) && hasWeak(x); }), due.filter(function (x) { return !hasWeak(x); }))
      .slice(0, dueMax).forEach(function (x) { take(x, hasWeak(x)); });
    /* 2. weak patterns: fill to about 45% of the round with new words of that pattern
          (or, once those run out, the words of that pattern seen longest ago) */
    if (weak.length) {
      /* about 45%, and always at least one new word next to the ones coming back */
      const goal = Math.min(Math.max(Math.max(2, Math.round(len * 0.45)), out.filter(hasWeak).length + 1), Math.ceil(len * 0.6));
      const has = function (tag) { return function (x) { return tagsOf(x[0]).indexOf(tag) !== -1; }; };
      const have = function () { return out.filter(hasWeak).length; };
      /* the weakest pattern first (new words in a weighted random order, then the
         words of that pattern seen longest ago); the second one only fills gaps */
      weak.forEach(function (tag) {
        const pool = fresh.filter(function (x) { return usable(x) && has(tag)(x); })
          .map(function (x) { return [Math.pow(Math.random(), 1 / Ph().weight(x[0], weak)), x]; })
          .sort(function (a, b) { return b[0] - a[0]; }).map(function (k) { return k[1]; });
        const older = seen.map(function (w) { return byWord[w.toLowerCase()]; }).filter(function (x) { return x && usable(x) && has(tag)(x); });
        pool.concat(older).forEach(function (x) { if (have() < goal || (tag === weak[0] && out.filter(has(tag)).length < goal)) take(x, true); });
      });
    }
    /* 3. the rest: fresh words, spreading the patterns out */
    let rest = shuffle(fresh.filter(usable));
    while (out.length < len && rest.length) {
      const sample = rest.slice(0, 6);
      let best = sample[0], bestScore = Infinity;
      sample.forEach(function (x) {
        const sc = tagsOf(x[0]).reduce(function (t, tag) { return t + (tagCount[tag] || 0); }, 0) + Math.random() * 0.5;
        if (sc < bestScore) { bestScore = sc; best = x; }
      });
      take(best, false);
      rest = rest.filter(function (x) { return x !== best; });
    }
    /* tiny lists: allow repeats rather than a short round */
    shuffle(list).forEach(function (x) { if (out.length < len) take(x, false); });
    return { words: shuffle(out), targeted: targeted, weak: Object.keys(targeted).length ? weak : [] };
  }
  /* Build the items and the "Training:" line for a picked round. */
  function spellingItems(p, grade, pick, styleFor) {
    const train = Ph() && pick.weak.length ? Ph().trainingLine(pick.weak) : "";
    const short = pick.weak.length ? " · Training: " + Ph().label(pick.weak[0]).replace(/ \(.*\)$/, "") : "";
    const items = pick.words.map(function (x) {
      const q = makeSpelling(x, grade, styleFor());
      if (pick.targeted[x[0]]) { q.label += short; q.train = true; }
      return q;
    });
    items.train = train;
    markSeen(p, pick.words.map(function (x) { return x[0]; }));
    return items;
  }

  const spelling = {
    key: "spelling", title: "Spelling Bee", coach: "lauryn", field: "spellingGrade",
    round: function (p, grade) {
      p.spellSeq = (Number(p.spellSeq) || 0) + 1;
      const bag = styleBag(grade, isQuiet(p));
      return spellingItems(p, grade, pickSpelling(p, grade, roundLen(grade), true), function () { return bag(); });
    }
  };

  function makeSpelling(x, grade, style) {
    const word = x[0], sentence = x[1];
    const full = sentence.replace("___", word);
    const blankSent = sentence.replace("___", "_____");
    const underline = function (shown) { return BD.UI.esc(sentence).replace("___", '<u class="spell-u">' + BD.UI.esc(shown) + '</u>'); };
    const quiet = isQuiet(BD.Store.current && BD.Store.current());
    if (style === "listen" && quiet) style = "missing";
    if ((style === "check" || style === "fix") && !misspellings(word).length) style = "missing";
    if (style === "pick" && misspellings(word).length < 2) style = "missing";
    /* missing letter needs 3+ choices: try other spots, else unscramble */
    let miss = null;
    if (style === "missing") {
      for (let k = 0; k < 12 && (!miss || miss.choices.length < 3); k++) miss = missingItem(word, grade);
      if (miss.choices.length < 3) style = "scramble";
    }
    const base = {
      id: "spell:" + word, word: word, src: x, mode: style, label: STYLE_INFO[style], choices: null, answer: word,
      speakNow: null, speakAfter: quiet ? null : { text: word, lang: "en-US" },
      explain: word + ": " + word.split("").join("-"),
      facts: "Spelling practice (" + STYLE_INFO[style] + "). The word is \"" + word + "\", used in the sentence: " + full
    };
    if (style === "listen") return Object.assign(base, {
      typedSpell: true, small: true, prompt: "Listen, then spell the word", sub: blankSent,
      tiles: shuffle(word.split("")), tilesFirst: grade <= 1, speakAfter: null,
      speakNow: { text: word + ". " + full + " " + word + ".", lang: "en-US" }
    });
    if (style === "missing") {
      const m = miss;
      return Object.assign(base, {
        promptHTML: m.html, sub: blankSent, answer: m.ans, choices: m.choices.map(function (c) { return { value: c }; }),
        explain: word + ": the missing " + (m.ans.length > 1 ? "letters are" : "letter is") + " \"" + m.ans + "\" (" + word.split("").join("-") + ")",
        facts: base.facts + " The student sees \"" + m.plainShow + "\" and picks the missing letters."
      });
    }
    if (style === "pick") {
      const wrong = misspellings(word).slice(0, grade <= 0 ? 2 : 3);
      return Object.assign(base, {
        small: true, prompt: "Which spelling is correct?", sub: blankSent,
        choices: shuffle([word].concat(wrong)).map(function (c) { return { value: c }; })
      });
    }
    if (style === "check") {
      const right = Math.random() < 0.5, shown = right ? word : misspellings(word)[0];
      return Object.assign(base, {
        small: true, prompt: "Is the underlined word spelled correctly?", subHTML: underline(shown),
        answer: right ? "Spelled correctly" : "Misspelled", shown: shown,
        choices: [{ value: "Spelled correctly" }, { value: "Misspelled" }],
        explain: right ? "\"" + word + "\" is spelled correctly." : "\"" + shown + "\" is misspelled. It should be " + word + " (" + word.split("").join("-") + ").",
        facts: base.facts + " The sentence shows the word spelled \"" + shown + "\" and asks if it is spelled correctly."
      });
    }
    if (style === "fix") {
      const shown = misspellings(word)[0];
      return Object.assign(base, {
        typedSpell: true, small: true, prompt: "This word is misspelled. Type it the right way.", subHTML: underline(shown), shown: shown,
        tiles: shuffle(word.split("")), tilesFirst: false,
        explain: "\"" + shown + "\" should be " + word + " (" + word.split("").join("-") + ").",
        facts: base.facts + " The sentence shows it misspelled as \"" + shown + "\" and the student must type it correctly."
      });
    }
    // scramble
    let tiles = shuffle(word.split("")), guard = 0;
    while (tiles.join("") === word && guard++ < 20) tiles = shuffle(word.split(""));
    return Object.assign(base, {
      typedSpell: true, small: true, prompt: "Unscramble the letters to finish the sentence", sub: blankSent,
      tiles: tiles, tilesAlways: true,
      facts: base.facts + " The letters are shown scrambled: " + tiles.join(" ") + "."
    });
  }

  /* Belt rounds: words drawn from the grades around the belt grade (harder as belts go up). */
  /* skill (a stripe test part): size 0 short / 1 medium / 2 long words, -1 mixed; n items. */
  spelling.beltRound = function (p, grade, beltIndex, skill, n) {
    const out = [], used = new Set(), bag = styleBag(grade, isQuiet(p)), want = n || ROUND;
    const third = function (list, size) {
      if (size === undefined || size < 0) return list;
      const lens = list.map(function (x) { return x[0].length; }).sort(function (a, b) { return a - b; });
      const lo = lens[Math.floor(lens.length / 3)], hi = lens[Math.floor(2 * lens.length / 3)];
      const f = list.filter(function (x) { const L = x[0].length; return size === 0 ? L <= lo : size === 1 ? L > lo && L <= hi : L > hi; });
      return f.length >= want ? f : list;
    };
    let guard = 0;
    while (out.length < want && guard++ < 200) {
      const g = BD.Rank.itemGrade(grade, beltIndex), list = third(BD.SPELLING[String(g)] || BD.SPELLING[String(grade)], skill && skill.size);
      const x = list[r(list.length)];
      if (used.has(x[0])) continue;
      used.add(x[0]); out.push(makeSpelling(x, grade, bag()));
    }
    return out;
  };
  /* skill (a stripe test part): { topics: [names] } limits the words to those topics. */
  spanish.beltRound = function (p, grade, beltIndex, skill, n) {
    const out = [], used = new Set(), want = n || ROUND, names = skill && skill.topics && skill.topics.length ? skill.topics : null;
    let guard = 0;
    while (out.length < want && guard++ < 300) {
      const topics = this.topics(BD.Rank.itemGrade(grade, beltIndex));
      let pool = topics.length ? topics : this.topics(grade);
      if (names) { const only = this.topics(grade).filter(function (t) { return names.indexOf(t.topic) !== -1; }); if (only.length) pool = only; }
      const t = pool[r(pool.length)], w = t.words[r(t.words.length)];
      if (used.has(t.topic + ":" + w[0])) continue;
      used.add(t.topic + ":" + w[0]);
      out.push(makeSpanish(t, w[0], grade + (beltIndex >= 6 ? 2 : beltIndex >= 3 ? 1 : 0)));
    }
    return out;
  };

  const GAMES = { spanish: spanish, spelling: spelling };

  /* Daily Spelling Flashcards: 10 words of one puzzle type. Finishing a set
     with 70%+ earns +2.5, once per type per day (up to +10 a day), like the
     math flashcards. */
  const FLASH_BONUS = 2.5;
  const FLASH_NAMES = { missing: "Missing letters", pick: "Pick the spelling", scramble: "Unscramble", fix: "Fix the spelling", check: "Spelling check" };
  function flashStyles(p) { return ["missing", "pick", "scramble", Number(p.spellingGrade) >= 2 ? "fix" : "check"]; }
  function flashToday(p) {
    const t = BD.today();
    if (!p.flashSpell || p.flashSpell.day !== t) p.flashSpell = { day: t, styles: [] };
    return p.flashSpell;
  }
  function flashRound(p, grade, style) {
    p.spellSeq = (Number(p.spellSeq) || 0) + 1;
    return spellingItems(p, grade, pickSpelling(p, grade, roundLen(grade), true), function () { return style; });
  }
  function flashHTML(p) {
    const done = flashToday(p).styles;
    return '<div class="flash-grid" id="spellFlashPick">' + flashStyles(p).map(function (s) {
      const got = done.indexOf(s) !== -1;
      return '<button type="button" class="flash-btn' + (got ? " done" : "") + '" data-spellflash="' + s + '"><span class="op-sym">Aa</span><span class="flash-name">' + FLASH_NAMES[s] + '</span><span class="flash-state">' + (got ? "✓ Bonus earned" : "+" + FLASH_BONUS + " bonus") + '</span></button>';
    }).join("") + '</div>';
  }
  function flashDone(p) { return flashToday(p).styles.length * FLASH_BONUS; }

  /* ---------- play ---------- */
  /* stripe = { grade, belt, test } when started from the belt panel. */
  /* school = "practice" or "test" for this week's school spelling words. */
  function start(game, stripe, school, flash) {
    const g = GAMES[game], p = BD.Store.current();
    if (school && !(BD.School && BD.School.has(p))) school = null;
    if (school) stripe = null;
    if (stripe) p[g.field] = stripe.grade;
    else if (p.retry && p.retry[game]) p[g.field] = p.retry[game].grade;
    const grade = p[g.field];
    if (flash) { stripe = null; school = null; }
    if (stripe) stripe = BD.Rank.gate(p, game, stripe); // practice first: locked parts start as practice
    W = { game: game, g: g, grade: grade, school: school || null, flash: flash || null, noRetry: school === "test", items: flash ? flashRound(p, grade, flash) : school ? BD.School.round(p, school === "test", grade) : stripe ? (stripe.test && stripe.skill ? g.beltRound(p, grade, stripe.belt, stripe.skill, 6) : g.beltRound(p, grade, stripe.belt)) : g.round(p, grade), i: 0, xp: 0, correct: 0, firstTry: 0, answered: 0, streak: 0, best: 0, missed: [], stripe: stripe || null, test: !!(stripe && stripe.test) };
    const label = BD.Rank.subject(BD.Rank.BY_GAME[game]).label;
    BD.UI.testMode("screen-word-play", W.test ? label + " stripe test" + (stripe.skill ? " · Part " + (stripe.part + 1) + " of 4: " + stripe.skill.label : "") : flash ? "⚡ Spelling flashcards · " + FLASH_NAMES[flash] : stripe ? label + " stripe practice · " + BD.BELTS[stripe.belt].name + " Belt" : school === "test" ? "School word test" : "", !BD.Rank.hintsAllowed(BD.Store.current(), grade));
    $("wordCoachFace").src = BD.Cast.face(g.coach);
    $("wordCoachName").textContent = BD.Cast.name(g.coach);
    BD.UI.syncGradeSelect("wordGradeSel", game);
    BD.UI.show("screen-word-play");
    BD.Cast.say("wordSay", "start");
    if (game === "spelling" && W.items.train) BD.Cast.say("wordSay", "start", W.items.train + ". You've got this!");
    load();
  }

  function item() { return W.items[W.i]; }

  function load() {
    const q = item();
    W.tries = 0; W.done = false; W.usedTiles = false;
    $("wordProgress").textContent = (W.i + 1) + " of " + W.items.length;
    $("wordScore").textContent = W.xp + " XP";
    $("wordStreak").textContent = W.streak >= 3 ? "Combo ×" + W.streak : "";
    $("wordTopic").textContent = q.label;
    $("wordPrompt").innerHTML = q.promptHTML ? '<span class="spell-word">' + q.promptHTML + '</span>' : (q.swatch ? '<span class="big-swatch" style="--sw:' + q.swatch + '"></span>' : "") +
      (q.pic ? '<span class="pic">' + BD.UI.esc(q.pic) + '</span>' : "") + '<span>' + BD.UI.esc(q.prompt) + '</span>' +
      (q.tilesAlways && q.answer ? '<span class="scramble-hint">Hint: it starts with <strong>' + BD.UI.esc(q.answer.charAt(0)) + '</strong></span>' : "");
    $("wordPrompt").className = "word-prompt" + (q.small ? " small" : "");
    if (q.subHTML) $("wordSub").innerHTML = q.subHTML; else $("wordSub").textContent = q.sub;
    syncQuiet();
    $("wordListen").hidden = !BD.Speech.available || !q.speakNow; // never read out the answer early
    $("wordFeedback").innerHTML = ""; $("wordFeedback").className = "word-feedback";
    $("wordNext").hidden = true;
    const typed = !q.choices;
    $("wordType").hidden = !typed;
    $("wordChoices").hidden = typed;
    if (typed) {
      $("wordInput").value = ""; $("wordInput").readOnly = false;
      $("wordInput").placeholder = q.typedSpell ? "Type the word" : "Type the Spanish word";
      $("wordCheck").hidden = false; $("wordCheck").disabled = false;
      W.noHints = !BD.Rank.hintsAllowed(BD.Store.current(), W.grade) || W.noRetry;
      showTiles(q.tilesAlways || (q.tilesFirst && !W.noHints));
      $("wordTilesBtn").hidden = !q.typedSpell || q.tilesFirst || q.tilesAlways || W.noRetry;
      setTimeout(function () { $("wordInput").focus(); }, 60);
    } else {
      $("wordChoices").innerHTML = q.choices.map(function (c, i) {
        return '<button type="button" class="choice' + (c.swatch ? " has-swatch" : "") + '" data-i="' + i + '">' +
          (c.swatch ? '<span class="big-swatch sm" style="--sw:' + c.swatch + '"></span>' : "") + BD.UI.esc(c.value) + '</button>';
      }).join("");
    }
    const quietNow = W.game === "spelling" && isQuiet(BD.Store.current());
    if (BD.ReadAloud.auto(W.grade) && !quietNow) setTimeout(function () { if (item() === q) readItem(); }, 250);
    else if (q.speakNow && !quietNow) setTimeout(function () { BD.Speech.say(q.speakNow.text, q.speakNow.lang, 0.85); }, 250);
  }

  function showTiles(on) {
    const q = item();
    $("wordTiles").hidden = !on || !q.tiles;
    if (on && q.tiles) $("wordTiles").innerHTML = q.tiles.map(function (ch) { return '<button type="button" class="tile" data-ch="' + BD.UI.esc(ch) + '">' + BD.UI.esc(ch) + '</button>'; }).join("") +
      '<button type="button" class="tile tile-back" data-ch="back" aria-label="Delete">⌫</button>';
    syncTiles();
  }
  /* Darken each letter tile once it's been used (typed or tapped). */
  function syncTiles() {
    const box = $("wordTiles"); if (!box || box.hidden) return;
    const left = $("wordInput").value.toLowerCase().split("");
    box.querySelectorAll(".tile:not(.tile-back)").forEach(function (t) {
      const i = left.indexOf(String(t.dataset.ch).toLowerCase());
      const used = i !== -1; if (used) left.splice(i, 1);
      t.classList.toggle("used", used); t.disabled = used; t.setAttribute("aria-pressed", used ? "true" : "false");
    });
  }

  function judge(answer) {
    const q = item();
    if (q.typedSpell) return answer.trim().toLowerCase() === q.answer.toLowerCase() ? "right" : "wrong";
    if (answer === q.answer) return "right";
    if (plain(answer) === plain(q.answer)) return q.mode === "type" && answer.trim() !== q.answer ? "accent" : "right";
    return "wrong";
  }

  function answer(value) {
    if (W.done) return;
    const q = item(), p = BD.Store.current();
    const verdict = judge(value);
    W.tries++;
    const typed = !q.choices;
    if (verdict === "wrong" && typed && W.tries < 2 && !W.test && !W.noRetry) {
      BD.Sound.wrong(); BD.Cast.say("wordSay", "wrong");
      $("wordFeedback").className = "word-feedback try-again";
      $("wordFeedback").innerHTML = "<p>Not quite. Try once more!</p>" + (q.typedSpell ? letterDiff(value, q.answer) : "");
      $("wordInput").select();
      return;
    }
    W.done = true; W.answered++;
    const ok = verdict !== "wrong";
    if (W.school && q.word) BD.School.mark(p, q.word, ok && W.tries === 1);
    const st = ((p.wordStats[W.game] = p.wordStats[W.game] || {})[W.grade] = (p.wordStats[W.game][W.grade] || { r: 0, w: 0 }));
    const missKey = q.id;
    const bucket = (p.wordMissed[W.game] = p.wordMissed[W.game] || {});
    const spellSR = W.game === "spelling" && !!q.word, seq = Number(p.spellSeq) || 0;
    if (spellSR && BD.Phonics) BD.Phonics.note(q.word, ok && W.tries === 1, p);
    if (ok) {
      W.correct++; if (W.tries === 1) W.firstTry++;
      W.streak++; W.best = Math.max(W.best, W.streak);
      const gain = (W.tries === 1 ? 10 + Math.min(W.streak - 1, 10) : 5) - (W.usedTiles ? 5 : 0);
      W.xp += Math.max(2, gain); st.r++;
      if (bucket[missKey]) {
        const m = bucket[missKey];
        m.misses--;
        /* spaced repetition: back next round after a retry, then a few rounds later */
        if (spellSR) { m.ok = (Number(m.ok) || 0) + 1; m.due = seq + (q.retry ? 1 : 3); }
        if (m.misses <= 0) delete bucket[missKey];
      }
      BD.Sound.right(); BD.Cast.say("wordSay", W.streak >= 3 && W.streak % 3 === 0 ? "streak" : "right");
      if (BD.Kid && BD.Kid.young(W.grade)) BD.Kid.celebrate($("wordPrompt"), W.grade);
      $("wordFeedback").className = "word-feedback solved";
      $("wordFeedback").innerHTML = '<p class="win-line">' + (W.game === "spanish" ? "¡Muy bien!" : q.mode === "check" ? "Sharp eyes!" : "Spelled it!") + ' +' + Math.max(2, gain) + ' XP</p>' +
        (verdict === "accent" ? '<p>Watch the accent: <strong>' + BD.UI.esc(q.answer) + '</strong></p>' : "") +
        '<p>' + BD.UI.esc(q.explain) + '</p>';
    } else {
      W.streak = 0; st.w++; W.missed.push(q);
      bucket[missKey] = { grade: W.grade, misses: spellSR ? 3 : Math.min(3, ((bucket[missKey] && bucket[missKey].misses) || 0) + 2), topic: q.topic, es: q.es, word: q.word };
      if (spellSR) { bucket[missKey].due = seq + 1; bucket[missKey].ok = 0; }
      if (!q.retry && !W.test && !W.noRetry) W.items.splice(Math.min(W.i + 3, W.items.length), 0,
        W.game === "spelling" ? Object.assign(makeSpelling(q.src, W.grade, styleBag(W.grade, isQuiet(p))(q.mode)), { retry: true, school: q.school, label: q.label }) : Object.assign({}, q, { retry: true }));
      BD.Sound.wrong(); BD.Cast.say("wordSay", "wrong");
      $("wordFeedback").className = "word-feedback revealed";
      $("wordFeedback").innerHTML = '<p>The answer is <strong>' + BD.UI.esc(q.answer) + '</strong>.</p><p>' + BD.UI.esc(q.explain) + '</p>' +
        (q.typedSpell ? letterDiff(value, q.answer) : "") + '<p class="muted small">This one will come back in a few turns.</p>';
    }
    if (q.choices) document.querySelectorAll("#wordChoices .choice").forEach(function (b) {
      const v = q.choices[Number(b.dataset.i)].value;
      b.disabled = true;
      if (v === q.answer) b.classList.add("is-right"); else if (v === value) b.classList.add("is-wrong");
    });
    if (!q.choices) { $("wordInput").readOnly = true; $("wordCheck").hidden = true; $("wordTilesBtn").hidden = true; }
    if (q.speakAfter && !(W.game === "spelling" && isQuiet(p))) BD.Speech.say(q.speakAfter.text, q.speakAfter.lang, 0.85);
    $("wordScore").textContent = W.xp + " XP";
    $("wordListen").hidden = !BD.Speech.available || !(q.speakNow || q.speakAfter) || (W.game === "spelling" && isQuiet(p));
    $("wordSwap").hidden = true;
    BD.Store.save(p);
    $("wordNext").hidden = false;
    $("wordNext").textContent = W.i + 1 < W.items.length ? "Next" : "See results";
    setTimeout(function () { $("wordNext").focus(); }, 50);
  }

  /* Show which letters were right (green) or wrong (red). */
  function letterDiff(tried, word) {
    tried = String(tried || "").trim().toLowerCase();
    const w = word.toLowerCase();
    let html = "";
    for (let i = 0; i < Math.max(tried.length, w.length); i++) {
      const ch = tried[i] || "_";
      html += '<span class="' + (tried[i] === w[i] ? "l-ok" : "l-bad") + '">' + BD.UI.esc(ch) + '</span>';
    }
    return '<p class="letters">' + html + '</p>';
  }

  /* What the speaker button says: the instructions, never the answer. */
  function readItem() {
    const q = item(); if (!q) return;
    const parts = [];
    const sent = function (s) { return BD.ReadAloud.words(s || ""); };
    if (W.game === "spelling") {
      const src = q.src || [q.word, ""];
      if (q.mode === "listen") { parts.push({ text: "Listen, then spell the word." }); parts.push(q.speakNow); }
      else if (q.mode === "missing") parts.push({ text: (q.answer.length > 1 ? "Pick the missing letters. " : "Pick the missing letter. ") + sent(src[1]) });
      else if (q.mode === "pick") parts.push({ text: "Which spelling is correct? " + sent(src[1]) });
      else if (q.mode === "check") parts.push({ text: "Look at the underlined word. Is it spelled correctly, or misspelled?" });
      else if (q.mode === "fix") parts.push({ text: "The underlined word is misspelled. Type it the right way. " + src[1].replace("___", q.word) });
      else parts.push({ text: "Unscramble the letters to finish the sentence. " + sent(src[1]) });
    } else {
      if (q.mode === "es2en") { parts.push({ text: "What does this mean?" }); parts.push({ text: q.es, lang: "es-MX" }); }
      else if (q.mode === "en2es") parts.push({ text: "How do you say " + q.en + " in Spanish?" });
      else parts.push({ text: "Type " + q.en + " in Spanish." });
    }
    // read-along hook: the prompt card glows while it is read
    BD.ReadAloud.read(parts.filter(Boolean).map(function (x) { return { text: x.text, lang: x.lang, el: $("wordPrompt") }; }));
  }

  /* Quiet mode and the swap button (spelling only). */
  function syncQuiet() {
    const sp = W && W.game === "spelling", q = W && item(), p = BD.Store.current();
    const btn = $("wordQuiet");
    btn.hidden = !sp || !BD.Speech.available || BD.Store.muted;
    btn.textContent = p && p.quietMode ? "Quiet mode: on" : "Quiet mode: off";
    btn.setAttribute("aria-pressed", p && p.quietMode ? "true" : "false");
    $("wordSwap").hidden = !sp || !q || q.mode !== "listen" || W.done;
  }
  /* Replace a listening challenge with a silent one for the same word. */
  function silentVersion(q) {
    return Object.assign(makeSpelling(q.src, W.grade, styleBag(W.grade, true)()), q.retry ? { retry: true } : {});
  }
  function swapCurrent() {
    if (!W || W.done || item().mode !== "listen") return;
    BD.Speech.stop();
    W.items[W.i] = silentVersion(item());
    load();
  }
  function toggleQuiet() {
    const p = BD.Store.current(); if (!W || !p) return;
    p.quietMode = !p.quietMode; BD.Store.save(p);
    if (p.quietMode) {
      BD.Speech.stop();
      for (let i = W.i + 1; i < W.items.length; i++) if (W.items[i].mode === "listen") W.items[i] = silentVersion(W.items[i]);
      if (!W.done && item().mode === "listen") { W.items[W.i] = silentVersion(item()); load(); return; }
    }
    syncQuiet();
  }

  function next() {
    W.i++;
    if (W.i < W.items.length) return load();
    finish();
  }

  function finish() {
    const p = BD.Store.current(), game = W.game, grade = W.grade, g = W.g;
    BD.Speech.stop();
    const acc = W.answered ? Math.round(100 * W.correct / W.answered) : 0;
    if (W.test) {
      const review = [];
      W.missed.forEach(function (q) { if (review.indexOf(q.explain) === -1) review.push(q.explain); });
      BD.UI.stripeResult({ subject: BD.Rank.BY_GAME[game], grade: grade, part: W.stripe ? W.stripe.part : undefined, pct: acc, score: W.correct + " / " + W.answered, review: review, again: function () { start(game, Object.assign({}, W.stripe, { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: true })); } });
      return;
    }
    const stripeAgain = W.stripe ? { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: false } : null;
    if (acc === 100 && W.answered >= 8) W.xp += 25;
    const school = W.school;
    const flash = W.flash;
    const failed = !school && !flash && acc < PASS;
    p.retry = p.retry || {};
    const wasRetry = !school && !flash && !!p.retry[game];
    if (!school && !flash) p.retry[game] = failed ? { grade: grade } : null;
    let flashNote = "";
    if (flash) {
      const ft = flashToday(p), left = flashStyles(p).filter(function (s) { return ft.styles.indexOf(s) === -1 && s !== flash; });
      let bonus = 0;
      if (W.answered >= roundLen(grade) && acc >= PASS && ft.styles.indexOf(flash) === -1) { ft.styles.push(flash); bonus = BD.addXP(p, FLASH_BONUS); }
      flashNote = bonus ? "⚡ +" + FLASH_BONUS + " spelling flashcard bonus! Today: +" + (ft.styles.length * FLASH_BONUS) + " of +" + (FLASH_BONUS * 4) + "." + (left.length ? " Still open today: " + left.map(function (s) { return FLASH_NAMES[s].toLowerCase(); }).join(", ") + "." : " All four done today!")
        : acc < PASS ? "Score " + PASS + "% or better on a set to earn the +" + FLASH_BONUS + " bonus. Try again!"
        : "You already earned today's " + FLASH_NAMES[flash].toLowerCase() + " bonus. Great extra practice!";
    }
    if (school === "test") BD.School.recordTest(p, W.correct, W.answered);
    if (game === "spelling") {
      markSeen(p, W.items.filter(function (q) { return q.word && !q.retry; }).map(function (q) { return q.word; }));
    }
    const belt = BD.Rank.practice(p, game, grade, W.xp - (W.banked || 0)); W.banked = W.xp;
    BD.Store.recordSession(p, Object.assign({ game: game, grade: grade, correct: W.correct, total: W.answered, xp: W.xp }, school ? { school: school } : {}));
    const missed = [];
    W.missed.forEach(function (q) { if (!missed.some(function (m) { return m.id === q.id; })) missed.push(q); });
    const ready = !school && !failed && acc >= 90 && grade < BD.MAX_GRADE;
    const nm = school ? BD.School.masteredCount(p) + " of " + BD.School.words(p).length + " school words mastered" : "";
    BD.UI.results({
      title: flash ? (acc >= PASS ? "Flashcards done!" : "Keep practicing!") : school === "test" ? "Word test: " + W.correct + " / " + W.answered + (acc === 100 ? " · perfect!" : acc >= 80 ? " · great job!" : "") : school ? (acc >= 90 ? "School words: crushed it!" : "School words practiced!") :
        failed ? "Let's train this again" : wasRetry ? "Level passed!" : acc >= 90 ? (game === "spanish" ? "¡Excelente!" : "Spelling champion!") : "Strong work!",
      subtitle: flash ? "⚡ Spelling flashcards · " + FLASH_NAMES[flash] + " · " + BD.gradeLabel(grade) : school ? "Spelling Bee · this week's school words · " + nm : g.title + " · " + BD.gradeLabel(grade),
      failed: failed ? "You got " + acc + "%. You need " + PASS + "% to pass " + BD.gradeLabel(grade) + ". Look over the words below, then try a new round." : null,
      passedRetry: wasRetry && !failed ? "You passed with " + acc + "%. All grade levels are unlocked again." : null,
      stats: [["Correct", W.correct + " / " + W.answered], ["First try", W.firstTry], ["Best streak", W.best], ["XP earned", "+" + W.xp]],
      belt: belt,
      lesson: (flashNote ? '<div class="tip flash-note"><p><strong>' + BD.UI.esc(flashNote) + '</strong></p></div>' : "") + (missed.length ? '<div class="tip"><h3>Words to practice</h3><ul>' + missed.map(function (q) { return "<li>" + BD.UI.esc(q.explain) + "</li>"; }).join("") + '</ul>' +
        (game === "spelling" ? '<p class="muted small">Tip: say the word slowly, clap each part, then write it three times.</p>' : '<p class="muted small">Tip: say each word out loud. Tap Hear it to copy the sound.</p>') + '</div>' : ""),
      listTitle: "", list: [],
      levelUp: ready && !flash ? { text: "You got " + acc + "% at " + BD.gradeLabel(grade) + ". Ready for " + BD.gradeLabel(grade + 1) + "?", action: function () { p[g.field] = grade + 1; BD.Store.save(p); start(game); } } : null,
      again: function () { start(game, stripeAgain, school, flash); },
      againLabel: school === "test" ? "Take the test again" : failed ? "Redo this level" : "Play again",
      setup: null
    });
  }

  function changeGrade(gr) {
    const game = W && W.game; if (!game) return;
    if (!BD.UI.setGrade(game, gr)) { BD.UI.syncGradeSelect("wordGradeSel", game); return; }
    start(game);
  }

  function senseiContext() {
    const q = item();
    return {
      title: W.game === "spelling" ? "Spelling: " + q.label : q.prompt, grade: W.grade, revealed: W.done,
      chips: W.game === "spanish" ? ["How do I say it?", "Give me a trick to remember it", "Use it in a sentence"] : ["Give me a hint", "How do I sound it out?", "Is there a spelling rule?"],
      facts: q.facts + (W.done ? " The answer has been shown." : " The student has not answered yet; for spelling, do NOT spell the whole word.")
    };
  }

  function planItems(p) {
    const out = [];
    ["spanish", "spelling"].forEach(function (game) {
      const r0 = p.retry && p.retry[game];
      if (r0) out.push({ kind: game + "Retry", game: game, title: "Pass " + BD.gradeLabel(r0.grade) + " " + GAMES[game].title, sub: "Get 70% to unlock other grades." });
    });
    return out;
  }

  function stop() { if (W) BD.Rank.bank(W, W.game); W = null; BD.Speech.stop(); }
  function bankNow() { if (W) BD.Rank.bank(W, W.game); }

  function bind() {
    $("wordChoices").addEventListener("click", function (e) {
      const b = e.target.closest("[data-i]"); if (!b || !W) return;
      answer(item().choices[Number(b.dataset.i)].value);
    });
    $("wordCheck").addEventListener("click", function () { if (W) answer($("wordInput").value); });
    $("wordInput").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); if (W && !W.done) answer($("wordInput").value); else if (W) next(); } });
    $("wordTiles").addEventListener("click", function (e) {
      const b = e.target.closest("[data-ch]"); if (!b || !W || W.done) return;
      const inp = $("wordInput");
      inp.value = b.dataset.ch === "back" ? inp.value.slice(0, -1) : inp.value + b.dataset.ch;
      BD.Sound.tap(); syncTiles();
    });
    $("wordInput").addEventListener("input", syncTiles);
    $("wordTilesBtn").addEventListener("click", function () { if (!W) return; W.usedTiles = true; showTiles(true); $("wordTilesBtn").hidden = true; });
    $("wordListen").addEventListener("click", function () {
      if (!W) return; const q = item();
      const s = q.speakNow || q.speakAfter; BD.Speech.say(s.text, s.lang, 0.8);
    });
    $("wordNext").addEventListener("click", next);
    $("wordSwap").addEventListener("click", swapCurrent);
    $("wordRead").addEventListener("click", function () { if (W) readItem(); });
    $("wordQuiet").addEventListener("click", toggleQuiet);
    $("wordQuit").addEventListener("click", BD.UI.back);
    $("wordGradeSel").addEventListener("change", function (e) { changeGrade(Number(e.target.value)); });
    $("wordAsk").addEventListener("click", function () { if (W) BD.Sensei.open(senseiContext()); });
  }

  function peek() { return W && W.items[W.i]; }
  function game() { return W ? W.game : null; }

  return { flashHTML: flashHTML, flashDone: flashDone, flashToday: flashToday, FLASH_NAMES: FLASH_NAMES, SPELL_FLASH_BONUS: FLASH_BONUS, styleBag: styleBag, STYLE_INFO: STYLE_INFO, bankNow: bankNow, isQuiet: isQuiet, misspellings: misspellings, makeSpelling: makeSpelling, peek: peek, game: game, start: start, stop: stop, bind: bind, planItems: planItems, PASS: PASS, GAMES: GAMES, plain: plain };
})();
