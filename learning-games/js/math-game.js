/* MATH DOJO — flashcards for + − × ÷ at grades 3 to 7. */
window.BD = window.BD || {};

BD.MathGame = (function () {
  const OPS = {
    add: { sym: "+", label: "Addition" },
    sub: { sym: "−", label: "Subtraction" },
    mul: { sym: "×", label: "Multiplication" },
    div: { sym: "÷", label: "Division" }
  };
  const PRACTICE_CARDS = 20;
  const CLOCK_SECONDS = 60;

  const r = function (lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); };
  const chance = function (p) { return Math.random() < p; };
  const sumUnder = function (lo, hi, max) { const a = r(lo, hi); return [a, r(1, Math.max(1, max - a))]; };

  /* Each grade defines how to build addition and multiplication problems.
     Subtraction and division are built as the reverse, so answers are always whole. */
  const LEVELS = {
    3: {
      about: "Facts to 10, two-digit adding and subtracting, times tables to 10×10",
      add: function () { return chance(0.6) ? [r(0, 10), r(0, 10)] : sumUnder(10, 89, 99); },
      mul: function () { return [r(0, 10), r(1, 10)]; }
    },
    4: {
      about: "Numbers up to 1,000, times tables to 12×12",
      add: function () {
        if (chance(0.3)) return [r(2, 12), r(2, 12)];
        if (chance(0.55)) return [r(10, 99), r(10, 99)];
        return sumUnder(100, 899, 999);
      },
      mul: function () { return chance(0.8) ? [r(0, 12), r(1, 12)] : [r(11, 30), r(2, 9)]; }
    },
    5: {
      about: "Four-digit adding, 2-digit × 1-digit, long division with whole answers",
      add: function () { return chance(0.5) ? [r(100, 999), r(100, 999)] : [r(1000, 8999), r(100, 999)]; },
      mul: function () { return chance(0.3) ? [r(2, 12), r(2, 12)] : [r(12, 99), r(2, 9)]; },
      div: function () { return chance(0.4) ? null : (function () { const d = r(2, 9), q = r(11, 99); return [d * q, d]; })(); }
    },
    6: {
      about: "Bigger multi-digit problems, 2-digit × 2-digit, 2-digit divisors",
      add: function () { return chance(0.5) ? [r(1000, 9999), r(1000, 9999)] : [r(100, 999), r(100, 999)]; },
      mul: function () {
        const roll = Math.random();
        if (roll < 0.4) return [r(11, 25), r(11, 19)];
        if (roll < 0.7) return [r(100, 999), r(2, 9)];
        return [r(12, 99), r(2, 9)];
      },
      div: function () {
        if (chance(0.5)) { const d = r(2, 9), q = r(20, 199); return [d * q, d]; }
        const d2 = r(11, 25), q2 = r(2, 15); return [d2 * q2, d2];
      }
    },
    7: {
      about: "Integers: positive and negative numbers with all four operations",
      integers: true
    }
  };

  function negPair(lo, hi, nonzeroB) {
    for (;;) {
      const a = r(lo, hi), b = r(lo, hi);
      if (nonzeroB && b === 0) continue;
      if (a < 0 || b < 0) return [a, b];
    }
  }

  function makeProblem(op, grade) {
    let a, b;
    const L = LEVELS[grade];
    if (L.integers && chance(0.75)) {
      if (op === "add" || op === "sub") { const p = negPair(-50, 50); a = p[0]; b = p[1]; }
      else if (op === "mul") { const p = negPair(-12, 12); a = p[0]; b = p[1]; }
      else { const p = negPair(-12, 12, true); a = p[0] * p[1]; b = p[1]; }
      return build(op, a, b, grade);
    }
    const lv = L.integers ? LEVELS[6] : L;
    if (op === "add") { const p = lv.add(); a = p[0]; b = p[1]; }
    else if (op === "sub") { const p = lv.add(); a = p[0] + p[1]; b = p[1]; }
    else if (op === "mul") { const p = lv.mul(); a = p[0]; b = p[1]; }
    else {
      const p = (lv.div && lv.div()) || (function () { const m = lv === LEVELS[3] || lv === LEVELS[4] ? lv.mul() : [r(2, 12), r(1, 12)]; return [m[0] * Math.max(1, m[1]), Math.max(1, m[1])]; })();
      a = p[0]; b = p[1];
    }
    return build(op, a, b, grade);
  }

  function build(op, a, b, grade) {
    const answer = op === "add" ? a + b : op === "sub" ? a - b : op === "mul" ? a * b : a / b;
    return { op: op, a: a, b: b, answer: answer, grade: grade, key: a + OPS[op].sym + b };
  }

  const num = function (n) { return n < 0 ? "−" + Math.abs(n) : String(n); };
  function show(p) {
    const right = p.b < 0 ? "(" + num(p.b) + ")" : num(p.b);
    return num(p.a) + " " + OPS[p.op].sym + " " + right;
  }

  /* ---------- session ---------- */
  let S = null;
  const $ = function (id) { return document.getElementById(id); };

  function trickyFor(player, grade, ops) {
    return Object.values(player.tricky || {})
      .filter(function (t) { return t.grade === grade && ops.indexOf(t.op) !== -1; })
      .sort(function (x, y) { return y.misses - x.misses; });
  }

  function freshProblem() {
    const recent = S.queue.slice(-5).map(function (q) { return q.key; });
    let p;
    for (let tries = 0; tries < 12; tries++) {
      p = makeProblem(S.ops[r(0, S.ops.length - 1)], S.grade);
      if (recent.indexOf(p.key) === -1) break;
    }
    return p;
  }

  function openSetup() {
    const p = BD.Store.current();
    const grade = p.mathGrade;
    const ops = p.mathOps && p.mathOps.length ? p.mathOps : ["add", "sub", "mul", "div"];
    $("mathSetupBody").innerHTML =
      '<div class="setup-block"><h3 class="label">Grade level</h3>' + BD.UI.gradePicker("mathGradePick", grade) +
      '<p class="muted" id="mathLevelAbout">' + LEVELS[grade].about + '</p></div>' +
      '<div class="setup-block"><h3 class="label">Which skills?</h3><div class="chips" id="mathOpsPick">' +
      Object.keys(OPS).map(function (k) {
        return '<button type="button" class="chip op-chip' + (ops.indexOf(k) !== -1 ? ' on' : '') + '" data-op="' + k + '" aria-pressed="' + (ops.indexOf(k) !== -1) + '">' +
          '<span class="op-sym">' + OPS[k].sym + '</span>' + OPS[k].label + '</button>';
      }).join("") + '</div></div>' +
      '<div class="setup-block"><h3 class="label">Pick a challenge</h3><div class="mode-grid">' +
      '<button type="button" class="mode-card" data-mode="practice" id="mathModePractice"><strong>Practice Kata</strong><span>' + PRACTICE_CARDS + ' cards, no clock. Missed cards come back so you can get them right.</span></button>' +
      '<button type="button" class="mode-card" data-mode="clock" id="mathModeClock"><strong>Speed Sparring</strong><span>' + CLOCK_SECONDS + ' seconds. How many can you get right?' +
      (bestFor(p, grade) ? ' Your best: ' + bestFor(p, grade) + '.' : '') + '</span></button>' +
      '</div></div>';

    $("mathGradePick").addEventListener("click", function (e) {
      const b = e.target.closest("[data-grade]"); if (!b) return;
      p.mathGrade = Number(b.dataset.grade); BD.Store.save(); BD.Sound.tap(); openSetup();
    });
    $("mathOpsPick").addEventListener("click", function (e) {
      const b = e.target.closest("[data-op]"); if (!b) return;
      const k = b.dataset.op, cur = p.mathOps.slice();
      const i = cur.indexOf(k);
      if (i !== -1 && cur.length > 1) cur.splice(i, 1); else if (i === -1) cur.push(k);
      p.mathOps = Object.keys(OPS).filter(function (o) { return cur.indexOf(o) !== -1; });
      BD.Store.save(); BD.Sound.tap(); openSetup();
    });
    document.querySelectorAll("#mathSetupBody .mode-card").forEach(function (btn) {
      btn.addEventListener("click", function () { start(btn.dataset.mode); });
    });
    BD.UI.show("screen-math-setup");
  }

  function bestFor(p, grade) { return (p.bestClock && p.bestClock[grade]) || 0; }

  function start(mode) {
    const p = BD.Store.current();
    S = {
      mode: mode, grade: p.mathGrade, ops: p.mathOps.slice(), queue: [], i: 0,
      input: "", locked: false, correct: 0, answered: 0, streak: 0, bestStreak: 0,
      xp: 0, missed: [], timer: null, endsAt: 0, xpBefore: p.xp
    };
    if (mode === "practice") {
      const tricky = trickyFor(p, S.grade, S.ops).slice(0, 4).map(function (t) { return build(t.op, t.a, t.b, t.grade); });
      for (let n = 0; n < PRACTICE_CARDS - tricky.length; n++) S.queue.push(freshProblem());
      tricky.forEach(function (t) { S.queue.splice(r(2, S.queue.length), 0, t); });
    } else {
      S.queue.push(freshProblem());
      S.endsAt = Date.now() + CLOCK_SECONDS * 1000;
      S.timer = setInterval(tick, 200);
    }
    buildKeypad();
    BD.UI.show("screen-math-play");
    render();
  }

  function tick() {
    const left = Math.max(0, S.endsAt - Date.now());
    $("mathProgress").textContent = "0:" + String(Math.ceil(left / 1000)).padStart(2, "0");
    $("mathProgress").classList.toggle("hurry", left < 10000);
    if (left <= 0) finish();
  }

  function current() { return S.queue[S.i]; }

  function render() {
    const q = current();
    $("mathProblem").textContent = show(q) + " =";
    $("mathAnswer").textContent = S.input || "?";
    $("mathAnswer").classList.toggle("empty", !S.input);
    $("mathFeedback").textContent = "";
    $("mathCard").className = "flashcard";
    if (S.mode === "practice") $("mathProgress").textContent = "Card " + (S.i + 1) + " of " + S.queue.length;
    else tick();
    $("mathStreak").textContent = S.streak >= 3 ? S.streak + " in a row!" : "";
    $("mathScore").textContent = S.xp + " XP";
    $("mathKeyMinus").hidden = S.grade < 7;
  }

  function buildKeypad() {
    const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "−", "0", "⌫"];
    $("mathKeypad").innerHTML = keys.map(function (k) {
      const id = k === "−" ? ' id="mathKeyMinus"' : "";
      const cls = k === "⌫" ? "key key-back" : k === "−" ? "key key-minus" : "key";
      return '<button type="button" class="' + cls + '" data-key="' + k + '"' + id + ' aria-label="' + (k === "⌫" ? "Delete" : k === "−" ? "Minus" : k) + '">' + k + '</button>';
    }).join("") + '<button type="button" class="key key-go" data-key="go">Check</button>';
  }

  function press(k) {
    if (!S || S.locked) return;
    if (k === "go") return submit();
    if (k === "⌫") S.input = S.input.slice(0, -1);
    else if (k === "−") { if (S.grade >= 7) S.input = S.input.charAt(0) === "-" ? S.input.slice(1) : "-" + S.input; }
    else if (S.input.replace("-", "").length < 6) S.input += k;
    BD.Sound.tap();
    $("mathAnswer").textContent = S.input ? S.input.replace("-", "−") : "?";
    $("mathAnswer").classList.toggle("empty", !S.input);
    // Below grade 7, check automatically once enough digits are typed.
    const q = current();
    if (S.grade < 7 && S.input.length >= String(q.answer).length) submit();
  }

  function submit() {
    if (!S.input || S.input === "-") return;
    const q = current(), p = BD.Store.current();
    const right = Number(S.input) === q.answer;
    S.answered++; S.locked = true;
    const statKey = q.grade + "-" + q.op;
    const st = p.mathStats[statKey] || (p.mathStats[statKey] = { r: 0, w: 0 });
    const tk = p.tricky[q.key];

    if (right) {
      S.correct++; S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak); st.r++;
      const gain = 10 + Math.min(S.streak - 1, 10);
      S.xp += gain;
      if (tk) { tk.misses--; if (tk.misses <= 0) delete p.tricky[q.key]; }
      $("mathCard").className = "flashcard is-right";
      $("mathFeedback").textContent = "+" + gain + (S.streak >= 3 ? "  streak!" : "");
      BD.Sound.right();
      setTimeout(advance, 380);
    } else {
      S.streak = 0; st.w++;
      S.missed.push(q);
      p.tricky[q.key] = { op: q.op, a: q.a, b: q.b, grade: q.grade, misses: Math.min(3, (tk ? tk.misses : 0) + 2) };
      if (S.mode === "practice" && !q.retry) {
        const again = Object.assign({}, q, { retry: true });
        S.queue.splice(Math.min(S.i + 3, S.queue.length), 0, again);
      }
      $("mathCard").className = "flashcard is-wrong";
      $("mathFeedback").textContent = show(q) + " = " + num(q.answer);
      BD.Sound.wrong();
      setTimeout(advance, 1600);
    }
    BD.Store.save();
  }

  function advance() {
    if (!S) return;
    S.input = ""; S.locked = false; S.i++;
    if (S.mode === "clock") {
      if (Date.now() >= S.endsAt) return finish();
      S.queue.push(chance(0.2) ? (function () {
        const t = trickyFor(BD.Store.current(), S.grade, S.ops)[0];
        return t ? build(t.op, t.a, t.b, t.grade) : freshProblem();
      })() : freshProblem());
    } else if (S.i >= S.queue.length) return finish();
    render();
  }

  function quit() {
    if (!S) return;
    clearInterval(S.timer); S = null;
    BD.UI.home();
  }

  function finish() {
    if (!S || S.done) return;
    S.done = true; clearInterval(S.timer);
    const p = BD.Store.current(), mode = S.mode, grade = S.grade;
    const acc = S.answered ? Math.round(100 * S.correct / S.answered) : 0;
    let record = false;
    if (S.mode === "clock") {
      p.bestClock = p.bestClock || {};
      if (S.correct > (p.bestClock[S.grade] || 0)) { p.bestClock[S.grade] = S.correct; record = S.correct > 0; }
    }
    // Bonus for a strong round
    if (acc === 100 && S.answered >= 10) S.xp += 25;
    const belt = BD.Store.addXP(p, S.xp);
    BD.Store.recordSession(p, {
      game: "math", mode: S.mode, grade: S.grade, ops: S.ops, correct: S.correct, total: S.answered, xp: S.xp
    });

    const uniqueMissed = [];
    S.missed.forEach(function (q) { if (!uniqueMissed.some(function (u) { return u.key === q.key; })) uniqueMissed.push(q); });
    const enough = S.mode === "practice" ? S.answered >= 15 : S.correct >= 15;
    const ready = acc >= 90 && enough && S.grade < 7;

    BD.UI.results({
      title: S.mode === "clock" ? (record ? "New record!" : "Time!") : (acc >= 90 ? "Outstanding!" : acc >= 70 ? "Strong work!" : "Good training!"),
      subtitle: "Math Dojo · Grade " + S.grade + " · " + S.ops.map(function (o) { return OPS[o].sym; }).join(" "),
      stats: [["Correct", S.correct + (S.mode === "practice" ? " / " + S.answered : "")], ["Accuracy", acc + "%"], ["Best streak", S.bestStreak], ["XP earned", "+" + S.xp]],
      belt: belt,
      listTitle: uniqueMissed.length ? "Facts to practice" : "",
      list: uniqueMissed.slice(0, 12).map(function (q) { return show(q) + " = " + num(q.answer); }),
      levelUp: ready ? { text: "You got " + acc + "% at Grade " + grade + ". Ready to try Grade " + (grade + 1) + "?", action: function () { p.mathGrade = grade + 1; BD.Store.save(); openSetup(); } } : null,
      again: function () { start(mode); },
      againLabel: "Go again",
      setup: openSetup
    });
  }

  // Physical keyboard support
  document.addEventListener("keydown", function (e) {
    if (!S || S.done || document.getElementById("screen-math-play").hidden) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === "Backspace") press("⌫");
    else if (e.key === "-") press("−");
    else if (e.key === "Enter") press("go");
    else return;
    e.preventDefault();
  });

  function bind() {
    $("mathKeypad").addEventListener("click", function (e) {
      const b = e.target.closest("[data-key]"); if (b) press(b.dataset.key);
    });
    $("mathQuit").addEventListener("click", quit);
  }

  return { openSetup: openSetup, bind: bind, makeProblem: makeProblem, LEVELS: LEVELS, OPS: OPS, show: show };
})();
