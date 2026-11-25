/* QUICK QUESTIONS — fast, tap-to-answer questions from every subject, used
   by Boss Battles and Partner Challenges. Each has 2-4 choices.
   { kind, label, prompt, sub, html?, choices: [..], answer, say } */
window.BD = window.BD || {};

BD.Quick = (function () {
  const r = function (n) { return Math.floor(Math.random() * n); };
  const shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
  const esc = function (s) { return BD.UI.esc(s); };

  function math(grade, base) {
    if (Number(base !== undefined ? base : grade) <= -1 && BD.Little) return BD.Little.quick(grade, "math");
    // A harder grade mixed in keeps the student's own kinds of problems (no × for a 1st grader).
    const own = base === undefined ? null : BD.MathGame.opsFor(base);
    const ops = BD.MathGame.opsFor(grade).filter(function (o) { return !own || own.indexOf(o) !== -1; });
    if (!ops.length) ops.push(BD.MathGame.opsFor(base)[0]);
    const q = BD.MathGame.makeProblem(ops[r(ops.length)], grade);
    const ans = q.answer, neg = grade >= 6 || ans < 0;
    const cands = shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans * 2, Math.round(ans / 2), ans + 5, ans - 3]);
    const wrong = [];
    cands.forEach(function (c) { if (wrong.length < 3 && c !== ans && wrong.indexOf(c) === -1 && (neg || c >= 0) && Number.isInteger(c)) wrong.push(c); });
    const fmt = function (n) { return String(n).replace("-", "−"); };
    const shown = BD.MathGame.show(q) + " = ?";
    return { kind: "math", label: "Math", prompt: shown, choices: shuffle([ans].concat(wrong)).map(fmt), answer: fmt(ans), say: q.say || "What is " + BD.ReadAloud.words(BD.MathGame.show(q)) + "?" };
  }

  function spelling(grade) {
    if (Number(grade) <= -1 && BD.Little) return BD.Little.quick(grade, "spelling");
    const list = BD.SPELLING[String(grade)] || BD.SPELLING["3"];
    const x = list[r(list.length)];
    const style = ["pick", "missing", "check"][r(3)];
    const q = BD.WordQuiz.makeSpelling(x, grade, style);
    const sentence = q.subHTML ? q.subHTML : esc(q.sub || "");
    return {
      kind: "spelling", label: "Spelling", prompt: q.mode === "missing" ? "" : q.prompt, html: q.promptHTML || "", sub: sentence, subIsHTML: true,
      choices: q.choices.map(function (c) { return c.value; }), answer: q.answer,
      say: q.mode === "missing" ? "Pick the missing letter." : q.prompt
    };
  }

  /* Middle school language items. Clear pronouns (6th+), dangling modifiers (7th+), active and passive voice (8th). */
  const PAIRS = [["the coach", "the player"], ["the teacher", "the student"], ["the pilot", "the mechanic"], ["the doctor", "the nurse"], ["my aunt", "my cousin"], ["the captain", "the new member"], ["the artist", "the reporter"], ["the driver", "the guard"]];
  const PRON = [["talked to", "smiled"], ["met", "laughed"], ["called", "was happy"], ["thanked", "felt proud"], ["helped", "felt better"]];
  const MODS = [["walking to school", "the rain started"], ["opening the box", "a spring popped out"], ["climbing the hill", "the sun came out"], ["reading the map", "a bird landed nearby"], ["waiting for the bus", "the wind picked up"], ["cleaning my room", "an old photo fell out"]];
  const VOICE = [["The chef", "cooked", "the soup", "cooked"], ["Our class", "planted", "the garden", "planted"], ["The storm", "damaged", "the roof", "damaged"], ["The students", "wrote", "the report", "written"], ["The band", "played", "the song", "played"], ["The scientist", "tested", "the sample", "tested"], ["The mayor", "opened", "the new park", "opened"], ["The team", "won", "the championship", "won"], ["My brother", "painted", "the fence", "painted"], ["The dog", "chased", "the ball", "chased"]];
  const cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
  function middleLang(grade) {
    const kinds = ["pronoun"].concat(grade >= 7 ? ["modifier"] : [], grade >= 8 ? ["voice", "voice"] : []);
    const k = kinds[r(kinds.length)];
    if (k === "pronoun") {
      const p = PAIRS[r(PAIRS.length)], v = PRON[r(PRON.length)];
      const right = "When " + p[0] + " " + v[0] + " " + p[1] + ", " + p[0] + " " + v[1] + ".";
      const vague = "When " + p[0] + " " + v[0] + " " + p[1] + ", they " + v[1].replace(/^was /, "were ").replace(/^felt /, "felt ") + ".";
      const frag = "When " + p[0] + " " + v[0] + " " + p[1] + ".";
      return { kind: "grammar", label: "Reading", skill: "pronouns", prompt: "Which sentence makes it clear who did it?", choices: shuffle([cap(right), cap(vague), cap(frag)]), answer: cap(right), long: true, say: "Which sentence makes it clear who did it?" };
    }
    if (k === "modifier") {
      const m = MODS[r(MODS.length)];
      const right = "While I was " + m[0] + ", " + m[1] + ".";
      const dangle = cap(m[0]) + ", " + m[1] + ".";
      const comma = "While I was " + m[0] + " " + m[1].replace(/ (\w+)$/, ", $1") + ".";
      return { kind: "grammar", label: "Reading", skill: "modifiers", prompt: "Which sentence is written correctly?", choices: shuffle([right, dangle, comma]), answer: right, long: true, say: "Which sentence is written correctly?" };
    }
    const v = VOICE[r(VOICE.length)], wantActive = Math.random() < 0.5;
    const active = v[0] + " " + v[1] + " " + v[2] + ".";
    const passive = cap(v[2]) + " was " + v[3] + " by " + v[0].toLowerCase() + ".";
    const noAgent = cap(v[2]) + " was " + v[3] + ".";
    return { kind: "grammar", label: "Reading", skill: "voice", prompt: wantActive ? "Which sentence uses the active voice?" : "Which sentence uses the passive voice and names who did it?", choices: shuffle([active, passive, noAgent]), answer: wantActive ? active : passive, long: true, say: wantActive ? "Which sentence uses the active voice?" : "Which sentence uses the passive voice and names who did it?" };
  }

  function grammar(grade) {
    if (Number(grade) <= -1 && BD.Little) return BD.Little.quick(grade, "grammar");
    // 4th grade and up: complete sentences vs fragments and run-ons (Common Core L.4.1f), a quarter of the time
    if (Number(grade) >= 4 && Math.random() < 0.25 && BD.SentenceGen && BD.SentenceGen.choice) {
      try {
        const st = BD.Store && BD.Store.current();
        const starts = /^(The|A|An|My|Our|Your|Their|His|Her|We|They|It|This|That|These|Those|Some|Many|Every|After|When|If|Today|Yesterday)\b/;
        const plain = function (t) { return t && !/["“”]/.test(t) && starts.test(t); };
        const pickPlain = function () { for (let k = 0; k < 8; k++) { const c = BD.SentenceGen.choice(grade, st); if (c && plain(c.right)) return c.right; } return null; };
        const s1 = pickPlain(), s2 = pickPlain();
        if (plain(s1) && plain(s2) && s1 !== s2 && /[.!]$/.test(s1) && s1.length < 90 && s2.length < 90) {
          const lc = function (t) { return /^I\b/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1); };
          const runOn = s1.replace(/[.!]$/, "") + " " + lc(s2);
          const frag = "Because " + lc(s1);
          return { kind: "grammar", label: "Reading", skill: "sentences", prompt: "Which sentence is written correctly?", choices: shuffle([s1, runOn, frag]), answer: s1, long: true, say: "Which one is a complete sentence, written correctly?" };
        }
      } catch (e) { /* fall through to the usual item */ }
    }
    // 6th to 8th grade language skills as "pick the best sentence" (Common Core L.6.1d, L.7.1c, L.8.1b)
    if (Number(grade) >= 6 && Math.random() < 0.3) { const ms = middleLang(grade); if (ms) return ms; }
    // endless sentences from the generator first (never the same one twice for this student)
    if (BD.SentenceGen && BD.SentenceGen.choice) {
      try {
        const c = BD.SentenceGen.choice(grade, BD.Store && BD.Store.current());
        if (c && c.right && c.wrong && c.wrong[0] && c.wrong[0] !== c.right) {
          const right = c.right, wrong = [c.wrong[0]];
          const slip = right.replace(/[.!?]$/, "");
          if (slip !== right && wrong.indexOf(slip) === -1) wrong.push(slip);
          return { kind: "grammar", label: "Reading", prompt: "Which sentence is written correctly?", choices: shuffle([right].concat(wrong)), answer: right, long: true, say: "Which sentence is written correctly?" };
        }
      } catch (e) { /* fall back to the hand-written bank */ }
    }
    const g = Math.max(1, grade);
    let pool = (BD.SENTENCES || []).filter(function (s) { return s.grade === g; });
    if (!pool.length) pool = (BD.SENTENCES || []).filter(function (s) { return Math.abs(s.grade - g) <= 1; });
    if (!pool.length) return null;
    const s = pool[r(pool.length)];
    const right = s.answer, wrong = [s.text];
    // a near miss: the right sentence with one slip put back
    const slips = [
      right.charAt(0).toLowerCase() + right.slice(1),
      right.replace(/[.!?]$/, ""),
      right.replace(/\b(is|are|was|were)\b/, function (m) { return { is: "are", are: "is", was: "were", were: "was" }[m]; })
    ].filter(function (v) { return v !== right && wrong.indexOf(v) === -1; });
    if (slips.length) wrong.push(slips[r(slips.length)]);
    return { kind: "grammar", label: "Reading", prompt: "Which sentence is written correctly?", choices: shuffle([right].concat(wrong)), answer: right, long: true, say: "Which sentence is written correctly?" };
  }

  function spanish(grade) {
    const topics = BD.SPANISH.filter(function (t) { return t.g <= Math.max(grade, -1) && !t.phrase; });
    if (!topics.length) return null;
    const t = topics[r(topics.length)];
    if (t.words.length < 3) return null;
    const w = t.words[r(t.words.length)];
    const others = shuffle(t.words.filter(function (o) { return o[0] !== w[0]; })).slice(0, 3);
    const toEs = Math.random() < 0.5;
    return {
      kind: "spanish", label: "Spanish",
      prompt: toEs ? "How do you say " + w[1] + " in Spanish?" : "What does " + w[0] + " mean?",
      html: !t.color && w[2] ? '<span class="pic">' + esc(w[2]) + '</span>' : "",
      choices: shuffle([w].concat(others)).map(function (o) { return toEs ? o[0] : o[1]; }), answer: toEs ? w[0] : w[1],
      say: toEs ? "How do you say " + w[1] + " in Spanish?" : "What does this mean?"
    };
  }

  /* One question at the grade and belt (higher belts lean harder). */
  function question(grade, belt) {
    if (Number(grade) <= -1 && BD.Little) return BD.Little.quick(grade); // picture questions for Preschool and Pre-K
    const g = BD.Rank && belt !== undefined ? BD.Rank.itemGrade(grade, belt) : grade;
    const roll = Math.random();
    const maker = roll < 0.42 ? math : roll < 0.68 ? spelling : roll < 0.86 ? grammar : spanish;
    let q = null;
    try { q = maker === math ? math(g, grade) : maker(g); } catch (e) { q = null; }
    return q || math(g, grade);
  }

  return { question: question, math: math, spelling: spelling, grammar: grammar, spanish: spanish };
})();
