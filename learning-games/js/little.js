/* LITTLE NINJAS — picture-first, voice-led learning for Preschool (ages 3 to 4)
   and Pre-K (ages 4 to 5). Nothing to read: every prompt is spoken, every
   answer is a big picture, number or letter to tap.
   Four games fill the four stripe slots, so belts, stripes, test parts and
   Daily Training work just like the big-kid games:
     Numbers (math)            number names, counting, more and fewer
     Letters (reading)         letter names, big and small letters, letter or number
     Sounds (spelling)         listen and find, first sounds, rhymes, letter sounds
     Shapes & Colors (stories) colors, shapes, big and small, patterns, sorting, what comes next
   Kindergarten-level items (lv 0) exist for the young placement check.
   Also here: the simple picture home and the young placement check. */
window.BD = window.BD || {};

/* Banks keyed by grade: Preschool (-2) borrows Pre-K's so nothing ever reads a missing bank. */
/* Kindergarten spelling stays at K level: short CVC words and the color and number sight words.
   Longer blends and two-syllable words (crunch, spring, pumpkin, magnet) wait for 1st grade. */
(function () {
  try {
    const L = BD.SPELLING && BD.SPELLING["0"]; if (!Array.isArray(L)) return;
    const SIGHT = ["three", "black", "white", "brown", "yellow", "green", "seven", "eight"];
    const keep = L.filter(function (x) { const w = String(Array.isArray(x) ? x[0] : x && (x.w || x.word) || x).toLowerCase(); return w.length <= 4 || SIGHT.indexOf(w) !== -1; });
    if (keep.length >= 150) BD.SPELLING["0"] = keep;
  } catch (e) { /* keep the list as is */ }
})();
(function () {
  ["SPELLING", "SENTENCES", "READING", "SPANISH", "READING_BANK", "SENTENCE_BANK", "SPANISH_BANK"].forEach(function (k) {
    try { const b = BD[k]; if (b && typeof b === "object" && b["-1"] && !b["-2"]) b["-2"] = b["-1"]; } catch (e) { /* ok */ }
  });
})();

BD.Little = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const r = function (n) { return Math.floor(Math.random() * n); };
  const pick = function (a) { return a[r(a.length)]; };
  const shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
  const safe = function (w) { try { return !(BD.WordSafe && BD.WordSafe.unsafe && BD.WordSafe.unsafe(w)); } catch (e) { return true; } };

  /* The four games, keyed by stripe subject. */
  const DOM = {
    math: { key: "math", game: "math", field: "mathGrade", name: "Numbers", icon: "🔢", art: "123", color: "#2D6CDF" },
    reading: { key: "reading", game: "sentence", field: "sentenceGrade", name: "Letters", icon: "🔤", art: "ABC", color: "#8B4BE0" },
    spelling: { key: "spelling", game: "spelling", field: "spellingGrade", name: "Sounds", icon: "👂", art: "🔊", color: "#E0457B" },
    comprehension: { key: "comprehension", game: "reading", field: "readingGrade", name: "Shapes & Colors", icon: "🎨", art: "🔺🔵", color: "#2FA866" }
  };
  const ORDER = ["math", "reading", "spelling", "comprehension"];
  const BY_GAME = { math: "math", sentence: "reading", spelling: "spelling", reading: "comprehension" };
  const lvOf = function (g) { g = Number(g); return !isFinite(g) ? -1 : Math.max(-2, Math.min(0, g)); };
  const LEVEL = { "-2": "Preschool", "-1": "Pre-K", "0": "Kindergarten" };

  /* ================= PICTURE DATA ================= */
  const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
  const COUNT = [["🍎", "apples"], ["⭐", "stars"], ["🐟", "fish"], ["🎈", "balloons"], ["🦆", "ducks"], ["🐞", "ladybugs"], ["🍓", "strawberries"], ["⚽", "balls"], ["🌸", "flowers"], ["🐢", "turtles"], ["🍪", "cookies"], ["🐶", "puppies"]];
  /* Picture words: emoji, word, first sound (for first-sound games). */
  const WORDS = [
    ["🐻", "bear", "b"], ["🚌", "bus", "b"], ["🍌", "banana", "b"], ["🐝", "bee", "b"], ["⚽", "ball", "b"], ["🐦", "bird", "b"],
    ["🐱", "cat", "k"], ["🚗", "car", "k"], ["🎂", "cake", "k"], ["🐮", "cow", "k"], ["🔑", "key", "k"], ["🪁", "kite", "k"],
    ["🐶", "dog", "d"], ["🦆", "duck", "d"], ["🥁", "drum", "d"], ["🚪", "door", "d"],
    ["🐟", "fish", "f"], ["🦊", "fox", "f"], ["🐸", "frog", "f"], ["🌸", "flower", "f"],
    ["🐐", "goat", "g"], ["🍇", "grapes", "g"], ["🎁", "gift", "g"],
    ["🎩", "hat", "h"], ["🐴", "horse", "h"], ["🏠", "house", "h"],
    ["🦁", "lion", "l"], ["🍋", "lemon", "l"], ["🍃", "leaf", "l"],
    ["🌙", "moon", "m"], ["🐭", "mouse", "m"], ["🐵", "monkey", "m"], ["🥛", "milk", "m"],
    ["👃", "nose", "n"], ["🥜", "nut", "n"],
    ["🐷", "pig", "p"], ["🍕", "pizza", "p"], ["🍐", "pear", "p"], ["🐧", "penguin", "p"],
    ["🐰", "rabbit", "r"], ["🤖", "robot", "r"], ["🚀", "rocket", "r"], ["💍", "ring", "r"],
    ["☀️", "sun", "s"], ["🧦", "sock", "s"], ["⭐", "star", "s"], ["🐍", "snake", "s"],
    ["🐯", "tiger", "t"], ["🌳", "tree", "t"], ["🚂", "train", "t"], ["🐢", "turtle", "t"],
    ["🦓", "zebra", "z"], ["🐳", "whale", "w"]
  ].filter(function (w) { return safe(w[1]); }).map(function (w) { return { e: w[0], w: w[1], s: w[2] }; });
  const WORD = {}; WORDS.forEach(function (w) { WORD[w.w] = w; });
  /* How a first sound is spoken, and the letter that makes it. */
  const SOUND = { b: ["buh", "B"], k: ["kuh", "C"], d: ["duh", "D"], f: ["fff", "F"], g: ["guh", "G"], h: ["huh", "H"], l: ["lll", "L"], m: ["mmm", "M"], n: ["nnn", "N"], p: ["puh", "P"], r: ["rrr", "R"], s: ["sss", "S"], t: ["tuh", "T"], z: ["zzz", "Z"], w: ["wuh", "W"] };
  const PS_SOUNDS = ["m", "s", "b", "t", "p"];
  /* Rhyme families (no two families rhyme with each other). */
  const RHYMES = [["cat", "hat"], ["dog", "frog"], ["bee", "tree"], ["car", "star"], ["cake", "snake"], ["mouse", "house"], ["goat", "boat"], ["bear", "pear"], ["moon", "spoon"], ["sock", "clock"], ["fox", "box"], ["ring", "king"]];
  const EXTRA = { boat: "⛵", spoon: "🥄", clock: "⏰", box: "📦", king: "🤴" };
  const em = function (w) { return WORD[w] ? WORD[w].e : EXTRA[w]; };
  const COLORS = [["red", "#E53935", "🔴"], ["blue", "#1E6FE0", "🔵"], ["yellow", "#FDD835", "🟡"], ["green", "#43A047", "🟢"], ["orange", "#FB8C00", "🟠"], ["purple", "#8E44AD", "🟣"], ["brown", "#8D6E63", "🟤"], ["black", "#212121", "⚫"], ["white", "#FAFAFA", "⚪"], ["pink", "#F06292", ""]];
  const PS_COLORS = ["red", "blue", "yellow", "green"];
  const COLOR_THINGS = [["🍌", "banana", "yellow"], ["🍎", "apple", "red"], ["🍃", "leaf", "green"], ["🐸", "frog", "green"], ["🍊", "orange", "orange"], ["🍇", "grapes", "purple"], ["🥕", "carrot", "orange"], ["🍓", "strawberry", "red"], ["🍋", "lemon", "yellow"], ["🥦", "broccoli", "green"], ["🍒", "cherries", "red"], ["🌽", "corn", "yellow"], ["🐻", "bear", "brown"]];
  const SHAPES = {
    circle: '<circle cx="50" cy="50" r="40"/>',
    square: '<rect x="12" y="12" width="76" height="76" rx="4"/>',
    triangle: '<polygon points="50,8 93,88 7,88"/>',
    rectangle: '<rect x="4" y="26" width="92" height="48" rx="4"/>',
    star: '<polygon points="50,5 61,38 96,38 68,59 78,93 50,72 22,93 32,59 4,38 39,38"/>',
    heart: '<path d="M50 88 C20 66 6 48 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 48 80 66 50 88Z"/>',
    oval: '<ellipse cx="50" cy="50" rx="45" ry="28"/>',
    diamond: '<polygon points="50,4 92,50 50,96 8,50"/>',
    hexagon: '<polygon points="27,8 73,8 96,50 73,92 27,92 4,50"/>'
  };
  const PS_SHAPES = ["circle", "square", "triangle"], PK_SHAPES = ["circle", "square", "triangle", "rectangle", "star", "heart", "oval"], K_SHAPES = PK_SHAPES.concat(["diamond", "hexagon"]);
  const SHAPE_FILL = ["#5CBFC1", "#E0BA77", "#4F6CEE", "#F28C38", "#65D94A"];
  const shapeSVG = function (k, fill) { return '<svg class="lit-shape" viewBox="0 0 100 100" aria-hidden="true"><g fill="' + (fill || SHAPE_FILL[0]) + '" stroke="rgba(0,0,0,.35)" stroke-width="3">' + SHAPES[k] + '</g></svg>'; };
  const dotSVG = function (c) { return '<svg class="lit-dot" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="' + c[1] + '" stroke="' + (c[0] === "black" ? "#FFFFFF" : "rgba(0,0,0,.35)") + '" stroke-width="4"/></svg>'; };
  const SORTS = [
    { q: "Which one is an animal?", yes: ["🐶", "🐱", "🐮", "🐷", "🦁", "🐸", "🐰", "🦆"], no: ["🍎", "🚗", "🏠", "⚽", "🍌", "🚌"] },
    { q: "Which one can you eat?", yes: ["🍎", "🍌", "🍇", "🥕", "🍕", "🍪", "🍓"], no: ["🚗", "🧦", "🔑", "⚽", "🚪", "🎩"] },
    { q: "Which one has wheels?", yes: ["🚗", "🚌", "🚂", "🚲"], no: ["🐟", "🍎", "🌳", "🏠", "🎈", "🐶"] },
    { q: "Which one can fly?", yes: ["🐦", "🦆", "🐝", "🚀", "🦋"], no: ["🐢", "🐶", "🍎", "🚗", "🏠", "🐍"] }
  ];
  const SEQS = [["🥚", "🐣", "🐔"], ["🌱", "🌿", "🌳"], ["☁️", "🌧️", "🌈"], ["🌅", "☀️", "🌙"], ["🧊", "💧", "☁️"]];
  const DIFF = [["🐶", "🐱"], ["🍎", "🍌"], ["⭐", "🌙"], ["🚗", "🚌"], ["🐟", "🐸"], ["⚽", "🎈"], ["🌸", "🌳"]];
  const PS_LETTERS = ["A", "B", "C", "D", "E", "M", "O", "P", "S", "T"];
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  /* Letters that look alike stay apart for the youngest (never b next to d). */
  const LOOKALIKE = { b: "dpq", d: "bpq", p: "bdq", q: "bdp", m: "nw", n: "mu", u: "nv", w: "mv" };

  /* ================= ITEMS =================
     { d, type, lv, say, show, choices: [{ h, v, t, say }], answer, praise } */
  function nChoices(lv, belt) { return Math.min(4, (lv <= -2 ? 2 : 3) + ((belt || 0) >= 5 ? 1 : 0)); }
  function distinct(n, gen, first) { const out = [first]; let g = 0; while (out.length < n && g++ < 200) { const x = gen(); if (out.indexOf(x) === -1) out.push(x); } return out; }
  function row(e, n, cls) { let s = ""; for (let i = 0; i < n; i++) s += '<span class="lit-pic' + (cls ? " " + cls : "") + '">' + e + '</span>'; return s; }
  function groups(e, n) { // rows of 5, like a ten-frame
    let s = "", left = n; while (left > 0) { s += '<span class="lit-row">' + row(e, Math.min(5, left)) + '</span>'; left -= 5; } return s;
  }
  const numChoice = function (v) { return { h: '<span class="lit-num">' + v + '</span>', v: String(v), t: String(v), say: NUM[v] || String(v) }; };

  const MAKERS = {
    /* ---- Numbers ---- */
    numID: function (lv, n) {
      const hi = lv <= -2 ? 5 : lv === -1 ? 10 : 20, lo = lv <= -2 ? 1 : lv === -1 ? 0 : 6;
      const a = lo + r(hi - lo + 1);
      const vals = distinct(n, function () { return lo + r(hi - lo + 1); }, a);
      return { d: "math", say: "Tap the number " + NUM[a] + ".", show: '<span class="lit-ear">🔊</span>', choices: shuffle(vals.map(numChoice)), answer: String(a), praise: "That's " + NUM[a] + "!" };
    },
    count: function (lv, n) {
      const hi = lv <= -2 ? 5 : lv === -1 ? 10 : 20, lo = lv === 0 ? 5 : 1, c = pick(COUNT), a = lo + r(hi - lo + 1);
      const vals = distinct(n, function () { const x = a + pick(lv <= -2 ? [-2, -1, 1, 2] : [-2, -1, 1, 2, 3]); return x >= 1 && x <= hi + 2 ? x : a + 1; }, a);
      return { d: "math", say: "How many " + c[1] + "? Count them, then tap the number.", show: '<div class="lit-count" data-count>' + groups(c[0], a) + '</div>', showText: row(c[0], a), choices: shuffle(vals.map(numChoice)), answer: String(a), praise: NUM[a] + " " + c[1] + "!" };
    },
    more: function (lv) {
      const fewer = lv >= -1 && Math.random() < 0.4, c = pick(COUNT), gap = lv <= -2 ? 2 + r(2) : 1 + r(2);
      const small = 1 + r(lv <= -2 ? 3 : 6), big = Math.min(lv <= -2 ? 5 : 10, small + gap), want = fewer ? small : big;
      const opts = shuffle([small, big]);
      return { d: "math", say: "Which group has " + (fewer ? "fewer" : "more") + " " + c[1] + "?", show: "", wide: true,
        choices: opts.map(function (k) { return { h: '<span class="lit-group">' + groups(c[0], k) + '</span>', v: String(k), t: row(c[0], k), say: NUM[k] + " " + c[1] }; }), answer: String(want), praise: (fewer ? "Fewer! Only " : "More! ") + NUM[want] + "!" };
    },
    compare: function (lv, n) { // K: which number is bigger
      const a = 1 + r(18), b = distinct(2, function () { return 1 + r(19); }, a)[1], want = Math.max(a, b);
      return { d: "math", say: "Which number is bigger?", show: "", choices: shuffle([a, b].map(numChoice)), answer: String(want), praise: NUM[want] + " is bigger!" };
    },
    addPics: function (lv, n) { // K: add within 5 with pictures
      const c = pick(COUNT), a = 1 + r(3), b = 1 + r(5 - a), s = a + b;
      const vals = distinct(n, function () { const x = s + pick([-1, 1, 2]); return x >= 1 ? x : s + 2; }, s);
      return { d: "math", say: NUM[a] + " " + c[1] + " and " + NUM[b] + " more. How many in all?", show: '<div class="lit-count">' + row(c[0], a) + '<b class="lit-op">+</b>' + row(c[0], b, "b") + '</div>', showText: row(c[0], a) + " + " + row(c[0], b), choices: shuffle(vals.map(numChoice)), answer: String(s), praise: NUM[s] + " in all!" };
    },
    /* ---- Letters ---- */
    letterID: function (lv, n) {
      const lower = lv >= 0, set = lv <= -2 ? PS_LETTERS : ABC, a = pick(set);
      const look = LOOKALIKE[a.toLowerCase()] || "";
      const vals = distinct(n, function () { const x = pick(set); return look.indexOf(x.toLowerCase()) === -1 ? x : a; }, a);
      const show = function (x) { return lower ? x.toLowerCase() : x; };
      return { d: "reading", say: "Tap the letter " + a + ".", show: '<span class="lit-ear">🔊</span>', choices: shuffle(vals.map(function (x) { return { h: '<span class="lit-letter">' + show(x) + '</span>', v: x, t: show(x), say: "the letter " + x }; })), answer: a, praise: "That's " + a + "!" };
    },
    matchCase: function (lv, n) {
      const a = pick(ABC), look = LOOKALIKE[a.toLowerCase()] || "";
      const vals = distinct(n, function () { const x = pick(ABC); return look.indexOf(x.toLowerCase()) === -1 ? x : a; }, a);
      return { d: "reading", say: "This is big " + a + ". Tap the little " + a + ".", show: '<span class="lit-letter big">' + a + '</span>', showText: a,
        choices: shuffle(vals.map(function (x) { return { h: '<span class="lit-letter">' + x.toLowerCase() + '</span>', v: x, t: x.toLowerCase(), say: "little " + x }; })), answer: a, praise: "Big " + a + " and little " + a.toLowerCase() + "!" };
    },
    letterOrNum: function (lv, n) {
      const wantNum = lv >= -1 && Math.random() < 0.4;
      const L = pick(lv <= -2 ? PS_LETTERS : ABC), N = String(1 + r(9)), P = pick(["⭐", "🍎", "🐶", "🎈"]);
      const opts = [{ h: '<span class="lit-letter">' + L + '</span>', v: "L", t: L, say: "the letter " + L }, { h: '<span class="lit-num">' + N + '</span>', v: "N", t: N, say: "the number " + NUM[Number(N)] }];
      if (n >= 3) opts.push({ h: '<span class="lit-pic big">' + P + '</span>', v: "P", t: P, say: "a picture" });
      return { d: "reading", say: wantNum ? "Which one is a number?" : "Which one is a letter?", show: "", choices: shuffle(opts), answer: wantNum ? "N" : "L", praise: wantNum ? "Yes, " + N + " is a number!" : "Yes, " + L + " is a letter!" };
    },
    /* ---- Sounds ---- */
    listen: function (lv, n) {
      const a = pick(WORDS), vals = distinct(n, function () { return pick(WORDS); }, a);
      return { d: "spelling", say: "Tap the " + a.w + ".", show: '<span class="lit-ear">🔊</span>', choices: shuffle(vals.map(function (w) { return { h: '<span class="lit-pic big">' + w.e + '</span>', v: w.w, t: w.e, say: w.w }; })), answer: a.w, praise: "The " + a.w + "!" };
    },
    firstSound: function (lv, n) {
      const sounds = lv <= -2 ? PS_SOUNDS : Object.keys(SOUND), s = pick(sounds);
      const yes = WORDS.filter(function (w) { return w.s === s; }), no = WORDS.filter(function (w) { return w.s !== s; });
      if (!yes.length) return null;
      const a = pick(yes), others = distinct(n, function () { return pick(no); }, a).slice(1);
      const ph = SOUND[s][0];
      return { d: "spelling", say: "Which one starts with " + ph + "? " + ph + ".", show: '<span class="lit-ear">🔊 ' + esc(ph) + '</span>', showText: "🔊 " + ph,
        choices: shuffle([a].concat(others).map(function (w) { return { h: '<span class="lit-pic big">' + w.e + '</span>', v: w.w, t: w.e, say: w.w }; })), answer: a.w, praise: a.w + " starts with " + ph + "!" };
    },
    rhyme: function (lv, n) {
      const fam = pick(RHYMES), others = shuffle(RHYMES.filter(function (f) { return f !== fam; })).slice(0, n - 1).map(function (f) { return f[r(2)]; });
      const choices = [fam[1]].concat(others).filter(function (w) { return em(w); });
      return { d: "spelling", say: "Which one rhymes with " + fam[0] + "? " + fam[0] + ".", show: '<span class="lit-pic big">' + em(fam[0]) + '</span>', showText: em(fam[0]),
        choices: shuffle(choices.map(function (w) { return { h: '<span class="lit-pic big">' + em(w) + '</span>', v: w, t: em(w), say: w }; })), answer: fam[1], praise: fam[0] + ", " + fam[1] + "! They rhyme!" };
    },
    letterSound: function (lv, n) {
      const keys = Object.keys(SOUND), s = pick(keys), L = SOUND[s][1];
      const vals = distinct(n, function () { return SOUND[pick(keys)][1]; }, L), lower = lv >= 0;
      return { d: "spelling", say: "Which letter says " + SOUND[s][0] + "?", show: '<span class="lit-ear">🔊 ' + esc(SOUND[s][0]) + '</span>', showText: "🔊 " + SOUND[s][0],
        choices: shuffle(vals.map(function (x) { return { h: '<span class="lit-letter">' + (lower ? x.toLowerCase() : x) + '</span>', v: x, t: lower ? x.toLowerCase() : x, say: "the letter " + x }; })), answer: L, praise: L + " says " + SOUND[s][0] + "!" };
    },
    blend: function (lv, n) { // K: c-a-t, which picture?
      const cvc = ["cat", "dog", "sun", "pig", "bus", "hat", "fox", "nut", "sock"].filter(function (w) { return em(w); });
      const a = pick(cvc), others = distinct(n, function () { return pick(cvc); }, a).slice(1);
      return { d: "spelling", say: "Listen. " + a.split("").join(", ") + ". What word is it?", show: '<span class="lit-ear">🔊</span>', choices: shuffle([a].concat(others).map(function (w) { return { h: '<span class="lit-pic big">' + em(w) + '</span>', v: w, t: em(w), say: w }; })), answer: a, praise: a + "!" };
    },
    /* ---- Shapes & Colors ---- */
    color: function (lv, n) {
      const set = COLORS.filter(function (c) { return lv <= -2 ? PS_COLORS.indexOf(c[0]) !== -1 : true; }), a = pick(set);
      const vals = distinct(n, function () { return pick(set); }, a);
      return { d: "comprehension", say: "Tap " + a[0] + ".", show: '<span class="lit-ear">🔊</span>', choices: shuffle(vals.map(function (c) { return { h: dotSVG(c), v: c[0], t: c[2] || c[0], say: c[0] }; })), answer: a[0], praise: a[0] + "!" };
    },
    colorThing: function (lv, n) {
      const t = pick(COLOR_THINGS), a = COLORS.find(function (c) { return c[0] === t[2]; });
      const vals = distinct(n, function () { return pick(COLORS.slice(0, 9)); }, a);
      return { d: "comprehension", say: "What color is the " + t[1] + "?", show: '<span class="lit-pic huge">' + t[0] + '</span>', showText: t[0], choices: shuffle(vals.map(function (c) { return { h: dotSVG(c), v: c[0], t: c[2] || c[0], say: c[0] }; })), answer: a[0], praise: "The " + t[1] + " is " + a[0] + "!" };
    },
    shape: function (lv, n) {
      const set = lv <= -2 ? PS_SHAPES : lv === -1 ? PK_SHAPES : K_SHAPES, a = pick(set), fill = pick(SHAPE_FILL);
      const vals = distinct(n, function () { return pick(set); }, a);
      return { d: "comprehension", noText: true, say: "Tap the " + a + ".", show: '<span class="lit-ear">🔊</span>', choices: shuffle(vals.map(function (k) { return { h: shapeSVG(k, fill), v: k, t: k, say: "a " + k }; })), answer: a, praise: "A " + a + "!" };
    },
    size: function (lv, n) {
      const e = pick(["🐘", "🐶", "🍎", "⚽", "🐟", "🎈", "🐢"]), big = Math.random() < 0.5, sizes = n >= 3 ? ["s", "m", "l"] : ["s", "l"];
      const want = big ? "l" : "s", word = n >= 3 ? (big ? "biggest" : "smallest") : (big ? "big" : "small");
      return { d: "comprehension", noText: true, say: "Tap the " + word + " one.", show: "", choices: shuffle(sizes.map(function (z) { return { h: '<span class="lit-pic sz-' + z + '">' + e + '</span>', v: z, t: z, say: { s: "small", m: "middle", l: "big" }[z] }; })), answer: want, praise: "Yes! The " + word + " one!" };
    },
    different: function (lv, n) {
      const pair = shuffle(pick(DIFF)), same = pair[0], odd = pair[1], k = Math.max(3, n);
      const items = []; for (let i = 0; i < k - 1; i++) items.push({ e: same, v: "same" + i }); items.push({ e: odd, v: "odd" });
      return { d: "comprehension", say: "Which one is different?", show: "", choices: shuffle(items.map(function (x) { return { h: '<span class="lit-pic big">' + x.e + '</span>', v: x.v, t: x.e, say: "" }; })), answer: "odd", praise: "That one is different!" };
    },
    pattern: function (lv, n) {
      const pool = shuffle(["🍎", "🍌", "⭐", "🔵", "🐶", "🌸", "🚗", "🟡"]), A = pool[0], B = pool[1], C = pool[2];
      const kind = lv >= 0 ? pick(["AB", "ABB", "ABC"]) : pick(["AB", "AB", "ABB"]);
      const unit = kind === "AB" ? [A, B] : kind === "ABB" ? [A, B, B] : [A, B, C];
      const seq = []; for (let i = 0; seq.length < (unit.length === 2 ? 5 : 5); i++) seq.push(unit[i % unit.length]);
      const want = unit[seq.length % unit.length];
      const vals = distinct(Math.max(3, n), function () { return pool[r(4)]; }, want);
      return { d: "comprehension", say: "What comes next?", show: '<div class="lit-seq">' + seq.map(function (e) { return '<span class="lit-pic">' + e + '</span>'; }).join("") + '<span class="lit-pic lit-q">?</span></div>', showText: seq.join(" ") + " ?",
        choices: shuffle(vals.map(function (e) { return { h: '<span class="lit-pic big">' + e + '</span>', v: e, t: e, say: "" }; })), answer: want, praise: "You found the pattern!" };
    },
    sort: function (lv, n) {
      const s = pick(SORTS), a = pick(s.yes), others = shuffle(s.no).slice(0, Math.max(2, n) - 1);
      return { d: "comprehension", say: s.q, show: "", choices: shuffle([a].concat(others).map(function (e) { return { h: '<span class="lit-pic big">' + e + '</span>', v: e, t: e, say: "" }; })), answer: a, praise: "Yes!" };
    },
    sequence: function (lv, n) {
      const s = pick(SEQS), want = s[2], others = shuffle(SEQS.filter(function (x) { return x !== s; }).map(function (x) { return x[2]; }).filter(function (e) { return s.indexOf(e) === -1; })).slice(0, Math.max(3, n) - 1);
      return { d: "comprehension", say: "What comes next?", show: '<div class="lit-seq">' + '<span class="lit-pic">' + s[0] + '</span><b class="lit-op">→</b><span class="lit-pic">' + s[1] + '</span><b class="lit-op">→</b><span class="lit-pic lit-q">?</span></div>', showText: s[0] + " → " + s[1] + " → ?",
        choices: shuffle([want].concat(others).map(function (e) { return { h: '<span class="lit-pic big">' + e + '</span>', v: e, t: e, say: "" }; })), answer: want, praise: "That's what comes next!" };
    }
  };
  /* Which kinds of items each game uses at each level. */
  const MIX = {
    math: { "-2": ["numID", "count", "count", "more"], "-1": ["numID", "count", "count", "more"], "0": ["numID", "count", "compare", "addPics"] },
    reading: { "-2": ["letterID", "letterID", "letterOrNum"], "-1": ["letterID", "matchCase", "letterOrNum"], "0": ["letterID", "matchCase"] },
    spelling: { "-2": ["listen", "listen", "firstSound"], "-1": ["firstSound", "firstSound", "rhyme", "letterSound", "listen"], "0": ["letterSound", "rhyme", "blend", "firstSound"] },
    comprehension: { "-2": ["color", "shape", "size", "different"], "-1": ["colorThing", "shape", "pattern", "sort", "sequence", "color"], "0": ["shape", "pattern", "sequence", "sort"] }
  };
  /* The 4 stripe-test parts for each game (Preschool and Pre-K). */
  const PARTS = {
    math: { "-2": [["Number names", ["numID"]], ["Counting", ["count"]], ["More", ["more"]], ["Mixed review", null]], "-1": [["Number names", ["numID"]], ["Counting", ["count"]], ["More and fewer", ["more"]], ["Mixed review", null]] },
    reading: { "-2": [["Letter names", ["letterID"]], ["Letter or number?", ["letterOrNum"]], ["Letter names review", ["letterID"]], ["Mixed review", null]], "-1": [["Letter names", ["letterID"]], ["Big and little letters", ["matchCase"]], ["Letter or number?", ["letterOrNum"]], ["Mixed review", null]] },
    spelling: { "-2": [["Listen and find", ["listen"]], ["First sounds", ["firstSound"]], ["Listen and find review", ["listen"]], ["Mixed review", null]], "-1": [["First sounds", ["firstSound"]], ["Rhymes", ["rhyme"]], ["Letter sounds", ["letterSound"]], ["Mixed review", null]] },
    comprehension: { "-2": [["Colors", ["color"]], ["Shapes", ["shape"]], ["Big and small", ["size"]], ["Mixed review", null]], "-1": [["Colors", ["colorThing", "color"]], ["Shapes", ["shape"]], ["Patterns", ["pattern"]], ["Sorting and what comes next", ["sort", "sequence"]]] }
  };
  function partSkills(key, grade) {
    const lv = String(Math.max(-2, Math.min(-1, Number(grade))));
    const list = PARTS[key] && PARTS[key][lv];
    return list ? list.map(function (x) { return { label: x[0], types: x[1] }; }) : null;
  }
  function make(dom, lv, opts) {
    opts = opts || {};
    const types = opts.types || MIX[dom][String(lvOf(lv))];
    for (let g = 0; g < 20; g++) {
      const type = pick(types), it = MAKERS[type](lvOf(lv), opts.n || nChoices(lvOf(lv), opts.belt));
      if (it && it.choices && it.choices.length >= 2 && it.choices.some(function (c) { return c.v === it.answer; })) { it.type = type; it.lv = lvOf(lv); return it; }
    }
    return null;
  }
  function round(dom, lv, n, opts) {
    const out = [], seen = {};
    for (let g = 0; out.length < n && g < n * 8; g++) {
      const it = make(dom, lv, opts); if (!it) continue;
      const sig = it.type + ":" + it.answer + ":" + it.say; if (seen[sig]) continue; seen[sig] = 1; out.push(it);
    }
    // a small skill (like numbers 1 to 5) can repeat once the new ones run out, never twice in a row
    for (let g = 0; out.length < n && g < n * 8; g++) { const it = make(dom, lv, opts); if (it && (!out.length || out[out.length - 1].answer !== it.answer)) out.push(it); }
    return out;
  }

  /* ================= WHO GETS WHAT ================= */
  function gradeOf(p, dom) { const g = Number(p[DOM[dom].field]); return isFinite(g) ? g : BD.Rank.dojoGrade(p); }
  function young(p) { return !!p && Number(BD.Rank.dojoGrade(p)) <= -1; }
  function isLittle(g) { return Number(g) <= -1; }
  /* Called at the top of each game's start(): Preschool and Pre-K play the picture games instead. */
  function take(gameKey, stripe, opts) {
    const p = BD.Store.current(), dom = BY_GAME[gameKey]; if (!p || !dom) return false;
    const g = stripe && stripe.grade !== undefined ? Number(stripe.grade) : gradeOf(p, dom);
    if (!isLittle(g)) return false;
    if (stripe) { stripe = BD.Rank.gate(p, gameKey, Object.assign({}, stripe, { grade: g })); }
    start(dom, Object.assign({ stripe: stripe || null, grade: g }, opts || {}));
    return true;
  }

  /* ================= PLAYING ================= */
  let S = null, advT = null;
  function speak(t) { try { if (t && BD.ReadAloud && BD.ReadAloud.can()) BD.Speech.say(t, "en-US", 0.88); } catch (e) { /* ok */ } }
  function start(dom, opts) {
    opts = opts || {};
    const p = BD.Store.current(); if (!p) return;
    stop();
    const mixed = dom === "mixed";
    let items = [];
    const stripe = opts.stripe || null, test = !!(stripe && stripe.test);
    if (mixed) {
      const per = young(p) && BD.Rank.dojoGrade(p) <= -2 ? [2, 2, 1, 1] : [2, 2, 2, 2];
      ORDER.forEach(function (k, i) { const g = gradeOf(p, k), rr = BD.Rank.rec(p, Math.min(g, 0)); items = items.concat(round(k, Math.min(0, g), per[i], { belt: rr.belt }).map(function (it) { it.g = g; return it; })); });
      items = shuffle(items);
    } else {
      const g = opts.grade !== undefined ? opts.grade : gradeOf(p, dom), rr = BD.Rank.rec(p, g);
      const types = stripe && stripe.skill && stripe.skill.types ? stripe.skill.types : null;
      items = round(dom, g, test ? 8 : g <= -2 ? 6 : 8, { belt: rr.belt, types: types }).map(function (it) { it.g = g; return it; });
    }
    S = { p: p, dom: dom, mixed: mixed, items: items, i: 0, first: 0, xp: 0, belt: 0, by: {}, miss: 0, stripe: stripe, test: test, res: null, lockT: 0 };
    BD.UI.show("screen-little-play");
    BD.UI.testMode("screen-little-play", test ? DOM[dom].name + " stripe test" + (stripe.skill ? " · Part " + (stripe.part + 1) + " of 4: " + stripe.skill.label : "") : "", false);
    $("litTitle").textContent = mixed ? "Play!" : DOM[dom].name;
    next();
  }
  function stars() {
    $("litStars").innerHTML = S.items.map(function (_, i) { return '<span class="lit-star' + (i < S.i ? " on" : i === S.i ? " now" : "") + '">' + (i < S.i ? "⭐" : "•") + '</span>'; }).join("");
  }
  function next() {
    clearTimeout(advT);
    if (!S) return;
    if (S.i >= S.items.length) { finish(); return; }
    const it = S.items[S.i];
    S.miss = 0; S.done = false;
    stars();
    $("litShow").innerHTML = it.show || "";
    $("litFb").textContent = "";
    $("litChoices").className = "lit-choices n" + it.choices.length + (it.wide ? " wide" : "");
    $("litChoices").innerHTML = it.choices.map(function (c, i) { return '<button type="button" class="lit-choice" data-i="' + i + '" aria-label="' + esc(c.say || c.t || "choice") + '">' + c.h + '</button>'; }).join("");
    $("litScore").textContent = S.xp ? "+" + S.xp + " XP" : "";
    setTimeout(function () { if (S && S.items[S.i] === it) speak(it.say); }, 250);
  }
  function tap(i) {
    if (!S || S.done) return;
    const it = S.items[S.i], c = it.choices[i], btn = $("litChoices").querySelector('[data-i="' + i + '"]');
    if (!c || !btn || btn.disabled) return;
    const k = it.d, b = S.by[k] || (S.by[k] = { c: 0, t: 0, g: it.g, belt: 0, raw: 0 });
    if (c.v === it.answer) {
      S.done = true;
      const firstTry = S.miss === 0;
      b.t++; if (firstTry) { b.c++; S.first++; }
      btn.classList.add("is-right");
      $("litChoices").querySelectorAll(".lit-choice").forEach(function (x) { if (x !== btn) x.disabled = true; });
      const p = S.p;
      if (!S.test) {
        const wantBelt = firstTry ? 2 : 1, norm = (BD.Rank.NORM && BD.Rank.NORM[k]) || 0.2;
        const res = BD.Rank.practice(p, DOM[k].game, it.g, Math.max(1, Math.round(wantBelt / norm)));
        S.xp += res.earned; b.belt += res.gained || 0; b.raw += res.earned; S.res = res; b.res = res;
      }
      if (firstTry && BD.Correct) S.xp += BD.Correct.hit(p, btn) || 0;
      BD.Sound.right(); if (BD.Kid) BD.Kid.celebrate(btn);
      if (BD.Mini && BD.Mini.react) BD.Mini.react("right");
      $("litFb").textContent = it.praise || "Yes!";
      speak(it.praise || "Yes!");
      $("litScore").textContent = S.xp ? "+" + S.xp + " XP" : "";
      advT = setTimeout(function () { if (!S) return; S.i++; next(); }, 1500);
      return;
    }
    // a gentle retry: never a lose screen
    S.miss++;
    btn.classList.add("is-wrong"); btn.disabled = true;
    BD.Sound.wrong();
    const msg = (c.say ? "That's " + c.say + ". " : "") + "Try again!";
    $("litFb").textContent = "Try again!";
    if (!S.test && S.miss >= 2) {
      const ri = it.choices.findIndex(function (x) { return x.v === it.answer; }), rb = $("litChoices").querySelector('[data-i="' + ri + '"]');
      if (rb) rb.classList.add("lit-hint");
      speak(msg + " " + it.say + " Tap the one that's glowing.");
    } else speak(msg);
    const left = [].slice.call($("litChoices").querySelectorAll(".lit-choice:not([disabled])"));
    if (S.test || left.length <= 1) { if (S.test) { b.t++; S.done = true; advT = setTimeout(function () { if (!S) return; S.i++; next(); }, 1100); } }
  }
  function finish() {
    const p = S.p, total = S.items.length;
    S.phase = "done";
    const acc = Math.round(100 * S.first / Math.max(1, total));
    if (S.test) {
      const g = S.stripe.grade;
      BD.UI.stripeResult({ subject: S.dom, grade: g, part: S.stripe.part, pct: acc, score: S.first + " / " + total, review: [],
        again: (function (st) { return function () { start(st.dom, { stripe: Object.assign({}, st.stripe, { belt: BD.Rank.rec(p, g).belt, test: true }), grade: g }); }; })(S) });
      return;
    }
    if (S.mixed) {
      const parts = {}; Object.keys(S.by).forEach(function (k) { parts[k] = { c: S.by[k].c, t: S.by[k].t, g: S.by[k].g }; });
      BD.Store.recordSession(p, { game: "mixed", grade: BD.Rank.dojoGrade(p), correct: S.first, total: total, xp: S.xp, parts: parts, little: true });
    } else BD.Store.recordSession(p, { game: DOM[S.dom].game, grade: S.items[0] ? S.items[0].g : gradeOf(p, S.dom), correct: S.first, total: total, xp: S.xp, little: true });
    const starRow = '<p class="lit-res-stars" aria-label="' + S.first + ' stars">' + Array.from({ length: total }, function (_, i) { return i < S.first ? "⭐" : "☆"; }).join("") + '</p>';
    const gains = S.mixed ? '<p class="lit-res-gains">' + ORDER.filter(function (k) { return S.by[k]; }).map(function (k) { return DOM[k].icon + " " + esc(DOM[k].name) + " +" + Math.round(S.by[k].belt); }).join(" · ") + '</p>' : "";
    const msg = acc >= 85 ? "Amazing! You're a Little Ninja!" : acc >= 60 ? "Great job! Keep training!" : "Good try! Let's play again!";
    speak(msg + " You got " + NUM[Math.min(20, S.first)] + " stars!");
    const dom = S.dom, mixed = S.mixed;
    BD.UI.results({
      title: msg, subtitle: (mixed ? "Little Ninjas · every game" : DOM[dom].name) + " · " + BD.gradeLabel(mixed ? BD.Rank.dojoGrade(p) : (S.items[0] ? S.items[0].g : -1)),
      stats: [["Stars", S.first + " / " + total], ["XP earned", "+" + S.xp]],
      belt: mixed ? null : S.res,
      lesson: '<div class="lit-res">' + starRow + gains + '</div>',
      again: function () { start(dom); }, againLabel: "Play again"
    });
  }
  function stop() { clearTimeout(advT); if (S) S.phase = "stopped"; S = null; try { BD.Speech.stop(); } catch (e) { /* ok */ } }
  function active() { return !!S; }

  /* ================= BOSS / TOURNAMENT QUESTIONS (text-only pictures) ================= */
  function quick(grade, kind) {
    const lv = lvOf(grade), dom = kind === "math" ? "math" : kind === "spelling" ? "spelling" : kind === "grammar" ? "reading" : pick(ORDER);
    for (let g = 0; g < 20; g++) {
      const it = make(dom, lv, { n: lv <= -2 ? 2 : 3 });
      if (!it || it.noText || it.wide) continue;
      const ans = it.choices.find(function (c) { return c.v === it.answer; });
      return { kind: { math: "math", reading: "grammar", spelling: "spelling", comprehension: "reading" }[dom], label: DOM[dom].name, prompt: it.say, html: it.showText !== undefined ? '<span class="lit-quick">' + esc(it.showText) + '</span>' : (it.type === "color" || it.type === "listen" || it.type === "numID" || it.type === "letterID" ? "" : it.show),
        choices: it.choices.map(function (c) { return c.t; }), answer: ans.t, say: it.say };
    }
    return { kind: "math", label: "Numbers", prompt: "Tap the number three.", choices: ["3", "5"], answer: "3", say: "Tap the number three." };
  }

  /* ================= SIMPLE PICTURE HOME ================= */
  function homeOn(p) { if (!p) return false; return p.picHome === true || (p.picHome === undefined && Number(BD.Rank.dojoGrade(p)) <= -1); }
  let greeted = "";
  function renderHome(p) {
    const on = homeOn(p), el = $("littleHome");
    document.body.classList.toggle("little-on", on);
    if (!el) return on;
    el.hidden = !on;
    if (!on) return false;
    const g = BD.Rank.dojoGrade(p), rr = BD.Rank.rec(p, g), n = BD.Rank.stripeCount(rr);
    el.innerHTML =
      '<div class="lh-top">' +
        '<button type="button" class="lh-champ" data-lh="hi" aria-label="Say hi">' + BD.UI.championHTML(p) + '</button>' +
        '<div class="lh-side"><p class="lh-hi">Hi, ' + esc(p.name) + '!</p>' +
          '<div class="lh-belt" aria-label="' + esc(BD.BELTS[rr.belt].name + " belt, " + n + " of 4 stars") + '">' + BD.Rank.beltSVG(rr.belt, rr.stripes) +
          '<span class="lh-stars">' + [0, 1, 2, 3].map(function (i) { return i < n ? "⭐" : "☆"; }).join("") + '</span></div>' +
          '<button type="button" class="lh-play" data-lh="play"><span class="lh-play-ico">▶</span><span>Play!</span></button></div>' +
      '</div>' +
      '<div class="lh-tiles">' + ORDER.map(function (k) {
        return '<button type="button" class="lh-tile" data-lh="' + k + '" style="--tc:' + DOM[k].color + '" aria-label="' + esc(DOM[k].name) + '"><span class="lh-art">' + DOM[k].art + '</span><span class="lh-name">' + esc(DOM[k].name) + '</span></button>';
      }).join("") + '</div>' +
      '<div class="lh-row">' +
        '<button type="button" class="lh-small" data-lh="stickers"><span>📒</span><span>Stickers · ' + (BD.Kid ? BD.Kid.count(p) : 0) + '</span></button>' +
        '<button type="button" class="lh-small lh-grown" data-lh="grownups"><span>🔒</span><span>Grown-ups</span></button>' +
      '</div>';
    const key = p.id + BD.today();
    if (greeted !== key) { greeted = key; setTimeout(function () { if (homeOn(BD.Store.current()) && !document.querySelector(".sheet-backdrop:not([hidden])")) speak("Hi " + p.name + "! Tap Play to train!"); }, 700); }
    return true;
  }
  function homeTap(e) {
    const b = e.target.closest("[data-lh]"); if (!b) return;
    const a = b.dataset.lh, p = BD.Store.current(); if (!p) return;
    BD.Sound.tap();
    if (a === "hi") { speak(pick(["Hi-ya! Let's train!", "You can do it!", "Ready, set, play!", "Osu! Let's go!"])); return; }
    if (a === "play") { speak("Let's play!"); const go = function () { start("mixed"); }; if (BD.Phrases && BD.Phrases.beforeTraining(go)) return; setTimeout(go, 400); return; }
    if (a === "stickers") { speak("Your stickers!"); if (BD.Kid) BD.Kid.open(); return; }
    if (a === "grownups") { const pb = $("parentBtn"); if (pb) pb.click(); return; }
    if (DOM[a]) { speak(DOM[a].name + "!"); setTimeout(function () { start(a); }, 450); }
  }

  /* ================= YOUNG PLACEMENT ================= */
  /* Voice-led picture check: places each game at Preschool, Pre-K or Kindergarten. */
  let P = null;
  function placesYoung(p) { const g = Number(p.dojoGrade !== undefined ? p.dojoGrade : p.mathGrade); return isFinite(g) && g <= 0; }
  function placeRoot() { return $("littlePlace"); }
  function place(p, opts) {
    opts = opts || {};
    p = p || BD.Store.current(); if (!p) return false;
    if (P && placeRoot() && !placeRoot().hidden) return true; // already open
    if (BD.Store.current() !== p) BD.Store.setCurrent(p.id);
    const start = lvOf(p.dojoGrade !== undefined ? p.dojoGrade : -1);
    P = { p: p, opts: opts, di: 0, start: start, res: {}, st: null, item: null, busy: false };
    placeRoot().hidden = false; document.body.classList.add("sheet-lock");
    placeIntro();
    return true;
  }
  function placeIntro() {
    const p = P.p;
    $("lpBody").innerHTML = '<div class="lp-intro"><div class="lp-champ">' + BD.UI.championHTML(p) + '</div>' +
      '<h2>Let\'s play a picture game, ' + esc(p.name) + '!</h2>' +
      '<p class="muted">Grown-ups: a quick check (about 3 minutes) finds the right level for numbers, letters, sounds and shapes. Your child just listens and taps. Or pick by age.</p>' +
      '<button type="button" class="btn btn-primary btn-big" data-lp="go">▶ Start the picture game</button>' +
      '<p class="lp-ages"><span class="muted small">Pick by age instead:</span> <button type="button" class="btn btn-small btn-quiet" data-lp="age" data-a="3">Age 3</button><button type="button" class="btn btn-small btn-quiet" data-lp="age" data-a="4">Age 4</button><button type="button" class="btn btn-small btn-quiet" data-lp="age" data-a="5">Age 5</button></p></div>';
  }
  function placeStair(dom) { return { dom: dom, lv: P.start, asked: 0, right: 0, n: 0, passed: {}, failed: {}, done: false, result: null, total: 0 }; }
  function placeNextDomain() {
    if (P.di >= ORDER.length) return placeDone();
    P.st = placeStair(ORDER[P.di]);
    $("lpBody").innerHTML = '<div class="lp-dom"><span class="lp-dom-ico" style="--tc:' + DOM[P.st.dom].color + '">' + DOM[P.st.dom].art + '</span><h2>' + esc(DOM[P.st.dom].name) + '</h2></div>';
    speak(DOM[P.st.dom].name + "!");
    setTimeout(placeAsk, 900);
  }
  function placeAsk() {
    if (!P) return;
    const st = P.st, it = make(st.dom, st.lv, { n: st.lv <= -2 ? 2 : 3 });
    P.item = it; P.busy = false;
    $("lpBody").innerHTML = '<div class="lp-q"><div class="lp-prog">' + ORDER.map(function (k, i) { return '<span class="lp-pip' + (i < P.di ? " done" : i === P.di ? " now" : "") + '">' + DOM[k].icon + '</span>'; }).join("") + '</div>' +
      '<button type="button" class="lit-zumi" data-lp="say" aria-label="Hear it again"><img src="img/face-zumi.webp" alt=""><span>🔊</span></button>' +
      '<div class="lit-show">' + (it.show || "") + '</div>' +
      '<div class="lit-choices n' + it.choices.length + (it.wide ? " wide" : "") + '">' + it.choices.map(function (c, i) { return '<button type="button" class="lit-choice" data-lp="pick" data-i="' + i + '" aria-label="' + esc(c.say || c.t) + '">' + c.h + '</button>'; }).join("") + '</div></div>';
    setTimeout(function () { if (P && P.item === it) speak(it.say); }, 250);
  }
  function placePick(i) {
    if (!P || P.busy) return;
    P.busy = true;
    const st = P.st, it = P.item, ok = it.choices[i] && it.choices[i].v === it.answer;
    const btn = $("lpBody").querySelector('[data-i="' + i + '"]'); if (btn) btn.classList.add(ok ? "is-right" : "picked");
    if (ok) { BD.Sound.right(); speak("Yes!"); } else BD.Sound.tap();
    st.n++; st.total++; if (ok) st.right++;
    // 3 items at a level: 2 or more right passes
    if (st.n >= 3) {
      const pass = st.right >= 2, lv = st.lv;
      if (pass) st.passed[lv] = true; else st.failed[lv] = true;
      st.n = 0; st.right = 0;
      if (pass) { if (lv >= 0 || st.failed[lv + 1]) { st.result = lv; st.done = true; } else st.lv = lv + 1; }
      else { if (lv <= -2) { st.result = -2; st.done = true; } else if (st.passed[lv - 1]) { st.result = lv - 1; st.done = true; } else st.lv = lv - 1; }
      if (st.total >= 9 && !st.done) { st.result = st.lv; st.done = true; }
    }
    setTimeout(function () {
      if (!P) return;
      if (st.done) { P.res[st.dom] = st.result; P.di++; placeNextDomain(); } else placeAsk();
    }, ok ? 800 : 500);
  }
  function applyPlacement(res, how) {
    const p = P.p, vals = ORDER.map(function (k) { return res[k]; }).sort(function (a, b) { return a - b; });
    const dojo = Math.floor((vals[1] + vals[2]) / 2);
    ORDER.forEach(function (k) { p[DOM[k].field] = res[k]; if (BD.Rank.setLevel) BD.Rank.setLevel(p, DOM[k].game, res[k]); });
    p.dojoGrade = dojo;
    if (p.spanishGrade === undefined || Number(p.spanishGrade) < -1) p.spanishGrade = Math.max(-1, dojo);
    p.placed = { date: BD.today(), math: res.math, reading: res.reading, spelling: res.spelling, comprehension: res.comprehension };
    if (how) p.placedHow = how;
    BD.Store.save(p);
    return dojo;
  }
  function placeDone(byAge) {
    const p = P.p, dojo = applyPlacement(P.res, byAge ? "age" : "check");
    const ceiling = !byAge && ORDER.every(function (k) { return P.res[k] >= 0; });
    BD.Sound.win && BD.Sound.win(); BD.confetti && BD.confetti(80);
    speak("Great job, " + p.name + "! Let's train!");
    $("lpBody").innerHTML = '<div class="lp-res"><div class="lp-champ">' + BD.UI.championHTML(p) + '</div><h2>Ready to train!</h2>' +
      '<ul class="lp-levels">' + ORDER.map(function (k) { return '<li><span class="lp-dom-ico" style="--tc:' + DOM[k].color + '">' + DOM[k].art + '</span><strong>' + esc(DOM[k].name) + '</strong><span>' + esc(LEVEL[String(P.res[k])]) + '</span></li>'; }).join("") + '</ul>' +
      '<p class="muted small">Grown-ups: ' + esc(p.name) + ' starts at ' + esc(BD.gradeLabel(dojo)) + '. Levels adjust as they play. ' + (homeOn(p) ? 'The simple picture home is on (change it in Parents).' : '') + '</p>' +
      (ceiling ? '<button type="button" class="btn btn-quiet" data-lp="big">Aced it! Try the full Belt Assessment</button>' : '') +
      '<button type="button" class="btn btn-primary btn-big" data-lp="done">Let\'s play!</button></div>';
  }
  function placeAge(a) {
    const lv = a <= 3 ? -2 : a === 4 ? -1 : 0, res = {}; ORDER.forEach(function (k) { res[k] = lv; });
    P.res = res; placeDone(true);
  }
  function placeClose() { if (placeRoot()) placeRoot().hidden = true; document.body.classList.remove("sheet-lock"); P = null; try { BD.Speech.stop(); } catch (e) { /* ok */ } }
  function placeClick(e) {
    const b = e.target.closest("[data-lp]"); if (!b || !P) return;
    const a = b.dataset.lp;
    if (a === "go") { BD.Sound.tap(); placeNextDomain(); }
    else if (a === "age") { BD.Sound.tap(); placeAge(Number(b.dataset.a)); }
    else if (a === "say") { if (P.item) speak(P.item.say); }
    else if (a === "pick") placePick(Number(b.dataset.i));
    else if (a === "big") { const p = P.p; placeClose(); if (BD.Placement) BD.Placement.start(p, { from: "parent", standard: true }); }
    else if (a === "done") { BD.Sound.tap(); placeClose(); BD.UI.home(); }
  }

  /* Parents-area controls. little.js loads before settings.js, so register once the page is ready. */
  function addSettings() {
    if (!BD.Settings || addSettings.done) return; addSettings.done = true;
  /* ================= PARENTS: change the child's grade (all subjects) ================= */
    BD.Settings.add({
    id: "grade-level", scope: "student", title: "Grade level",
    html: function (p) {
      const g = Number(BD.Rank.dojoGrade(p));
      return '<label class="set-row"><span><strong>' + esc(p.name) + '\'s grade</strong><span class="muted small">Sets every subject to this grade and picks the right home screen. Belts and stripes earned at each grade are kept.</span></span>' +
        '<select data-gl-grade>' + BD.GRADES.map(function (x) { return '<option value="' + x + '"' + (x === g ? " selected" : "") + '>' + esc(BD.gradeLabel(x)) + '</option>'; }).join("") + '</select></label>';
    },
    bind: function (el, p, rerender) {
      const sel = el.querySelector("[data-gl-grade]");
      if (sel) sel.addEventListener("change", function () {
        const g = Number(sel.value);
        p.dojoGrade = g;
        ["mathGrade", "sentenceGrade", "readingGrade", "spellingGrade", "spanishGrade"].forEach(function (f) { p[f] = g; });
        p.retry = {}; // a parent's choice ends any redo
        if (BD.Rank.setLevel) ["math", "reading", "spelling", "comprehension", "spanish"].forEach(function (k) { BD.Rank.setLevel(p, k, g); });
        delete p.picHome; // home screen follows the new grade (picture home for Preschool and Pre-K)
        BD.Store.save(p);
        BD.Sound.tap();
        if (rerender) rerender();
      });
    }
  });

  /* ================= PARENTS: picture home switch ================= */
    BD.Settings.add({
    id: "little-home", scope: "student", title: "Simple picture home",
    html: function (p) {
      return '<label class="sound-row"><span><strong>Simple picture home for ' + esc(p.name) + '</strong><span class="muted small">Big picture buttons and a spoken greeting, made for children who aren\'t reading yet. On by default for Preschool and Pre-K. Leaderboards, teams and quests stay in the Parents area.</span></span>' +
        '<input type="checkbox" class="switch" data-lh-home' + (homeOn(p) ? " checked" : "") + '></label>' +
        (placesYoung(p) || Number(BD.Rank.dojoGrade(p)) <= 0 ? '<button type="button" class="btn btn-small" data-lh-place>Retake the picture check</button>' : '');
    },
    bind: function (el, p, rerender) {
      const c = el.querySelector("[data-lh-home]");
      if (c) c.addEventListener("change", function () { p.picHome = !!c.checked; BD.Store.save(p); rerender && rerender(); });
      const b = el.querySelector("[data-lh-place]");
      if (b) b.addEventListener("click", function () { place(p, { from: "parent" }); });
    }
  });
  }
  if (BD.Settings) addSettings(); else document.addEventListener("DOMContentLoaded", addSettings);

  function sanitize(p) {
    if (p.picHome !== undefined && typeof p.picHome !== "boolean") delete p.picHome;
    if (p.placedHow !== undefined && p.placedHow !== "age" && p.placedHow !== "check") delete p.placedHow;
  }

  function bind() {
    if ($("litQuit")) $("litQuit").addEventListener("click", function () { stop(); BD.UI.back(); });
    if ($("litSay")) $("litSay").addEventListener("click", function () { if (S && S.items[S.i]) speak(S.items[S.i].say); });
    if ($("litChoices")) $("litChoices").addEventListener("click", function (e) { const b = e.target.closest(".lit-choice"); if (b) tap(Number(b.dataset.i)); });
    if ($("litShow")) $("litShow").addEventListener("click", function (e) { if (S && S.items[S.i]) speak(S.items[S.i].say); });
    if ($("littleHome")) $("littleHome").addEventListener("click", homeTap);
    if (placeRoot()) placeRoot().addEventListener("click", placeClick);
  }

  return {
    DOM: DOM, ORDER: ORDER, BY_GAME: BY_GAME, LEVEL: LEVEL, MAKERS: MAKERS, MIX: MIX, WORDS: WORDS, RHYMES: RHYMES,
    make: make, round: round, partSkills: partSkills, take: take, start: start, stop: stop, active: active, young: young, isLittle: isLittle,
    quick: quick, homeOn: homeOn, renderHome: renderHome, placesYoung: placesYoung, place: place, placeClose: placeClose, sanitize: sanitize, bind: bind,
    _state: function () { return S; }, _place: function () { return P; }, _tap: tap
  };
})();
