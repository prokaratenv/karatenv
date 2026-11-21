/* QUICK QUESTIONS — fast, tap-to-answer questions from every subject, used
   by Boss Battles and Partner Challenges. Each has 2-4 choices.
   { kind, label, prompt, sub, html?, choices: [..], answer, say } */
window.BD = window.BD || {};

BD.Quick = (function () {
  const r = function (n) { return Math.floor(Math.random() * n); };
  const shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
  const esc = function (s) { return BD.UI.esc(s); };

  function math(grade) {
    const ops = BD.MathGame.opsFor(grade);
    const q = BD.MathGame.makeProblem(ops[r(ops.length)], grade);
    const ans = q.answer, neg = grade >= 7;
    const cands = shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans * 2, Math.round(ans / 2), ans + 5, ans - 3]);
    const wrong = [];
    cands.forEach(function (c) { if (wrong.length < 3 && c !== ans && wrong.indexOf(c) === -1 && (neg || c >= 0) && Number.isInteger(c)) wrong.push(c); });
    const fmt = function (n) { return String(n).replace("-", "−"); };
    const shown = BD.MathGame.show(q) + " = ?";
    return { kind: "math", label: "Math", prompt: shown, choices: shuffle([ans].concat(wrong)).map(fmt), answer: fmt(ans), say: "What is " + BD.ReadAloud.words(BD.MathGame.show(q)) + "?" };
  }

  function spelling(grade) {
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

  function grammar(grade) {
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
    const g = BD.Rank && belt !== undefined ? BD.Rank.itemGrade(grade, belt) : grade;
    const roll = Math.random();
    const maker = roll < 0.42 ? math : roll < 0.68 ? spelling : roll < 0.86 ? grammar : spanish;
    let q = null;
    try { q = maker(g); } catch (e) { q = null; }
    return q || math(g);
  }

  return { question: question, math: math, spelling: spelling, grammar: grammar, spanish: spanish };
})();
