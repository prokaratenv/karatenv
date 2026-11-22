/* PLACEMENT AND AUTO-LEVELING
   1) The Belt Assessment: a short, playful check that finds a new student's
      starting level in Math, Reading (Fix-It Sentences), Spelling and Story
      reading (Story Scrolls). Each subject is a small up/down staircase that
      starts at the grade the parent picked: two right in a row moves up a
      grade, a miss moves down, and it stops once the level is steady.
   2) Quiet auto-leveling: after each round, if the last two rounds at the
      current grade were 90%+ the grade moves up one; if both were 50% or
      lower it moves down one (at most once per subject per day, never during
      a redo, never touching the belt-path grade p.dojoGrade).
   Saved fields (checked by BD.Placement.sanitize):
     p.placed = { date, math, reading, spelling, comprehension }  (grades or null)
     p.autoLevelOff = true when the parent turned auto-leveling off
     p.levelLog = { <game>: { d: "YYYY-MM-DD", at: ms, from, to } }  last automatic change
   Tests: the assessment doesn't open by itself under browser automation
   (navigator.webdriver) or when window.__BD_TEST__ === true, so older tests
   that add a student and go straight to the home screen keep working. Set
   window.__BD_TEST__ = false to let it open by itself in a test. */
window.BD = window.BD || {};

BD.Placement = (function () {
  const SUBJECTS = [
    { key: "math", field: "mathGrade", game: "math", label: "Math", game2: "Math Dojo", icon: "🔢" },
    { key: "reading", field: "sentenceGrade", game: "sentence", label: "Reading", game2: "Fix-It Sentences", icon: "✏️" },
    { key: "spelling", field: "spellingGrade", game: "spelling", label: "Spelling", game2: "Spelling Bee", icon: "🐝" },
    { key: "comprehension", field: "readingGrade", game: "reading", label: "Stories", game2: "Story Scrolls", icon: "📜" }
  ];
  /* Games that auto-level, and the grade field each one uses. */
  const AUTO = {
    math: { field: "mathGrade", label: "Math" },
    sentence: { field: "sentenceGrade", label: "Fix-It Sentences" },
    reading: { field: "readingGrade", label: "Story Scrolls" },
    spelling: { field: "spellingGrade", label: "Spelling" },
    spanish: { field: "spanishGrade", label: "Spanish" }
  };
  const UP = 0.9, DOWN = 0.5, MIN_ITEMS = 5;
  const esc = function (s) { return BD.UI.esc(s); };
  const r = function (n) { return Math.floor(Math.random() * n); };
  const shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
  const clampG = function (g) { return Math.max(BD.MIN_GRADE, Math.min(BD.MAX_GRADE, Math.round(Number(g)))); };
  const gradeWords = function (g) { g = Number(g); return g === -1 ? "Pre-K" : g === 0 ? "Kindergarten" : BD.gradeShort(g) + " grade"; };

  /* ================= QUESTIONS ================= */
  /* Each item: { prompt, html (already safe), sub, passage, choices: [text], answer, say, long } */
  const PICS = ["🍎", "⭐", "🐟", "🎈", "🍪", "🌸"];
  function mathItem(grade) {
    const ops = BD.MathGame.opsFor(grade);
    // older grades: lean on the grade's newest skill so levels are easier to tell apart
    const op = grade >= 2 && Math.random() < 0.55 ? ops[ops.length - 1] : ops[r(ops.length)];
    const q = BD.MathGame.makeProblem(op, grade);
    const ans = q.answer, neg = grade >= 7, young = grade <= 0;
    const cands = shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans * 2, Math.round(ans / 2), ans + 5, ans - 3]);
    const wrong = [];
    cands.forEach(function (c) { if (wrong.length < (young ? 2 : 3) && c !== ans && wrong.indexOf(c) === -1 && (neg || c >= 0) && Number.isInteger(c) && (!young || Math.abs(c - ans) <= 3)) wrong.push(c); });
    while (wrong.length < (young ? 2 : 3)) { const c = ans + wrong.length + 3; if (wrong.indexOf(c) === -1) wrong.push(c); }
    const fmt = function (n) { return String(n).replace("-", "−"); };
    let html = "";
    if (young && (q.op === "add" || q.op === "sub") && q.a <= 10 && q.b <= 10 && q.a >= 0 && q.b >= 0) {
      const pic = PICS[r(PICS.length)];
      const row = function (n, cls) { let s = ""; for (let i = 0; i < n; i++) s += '<span class="pl-pic' + (cls ? " " + cls : "") + '">' + pic + '</span>'; return s; };
      html = '<div class="pl-pics" aria-hidden="true">' + (q.op === "add"
        ? row(q.a) + '<span class="pl-op">+</span>' + row(q.b)
        : row(q.a - q.b) + row(q.b, "gone")) + '</div>';
    }
    return {
      prompt: BD.MathGame.show(q) + " = ?", html: html, choices: shuffle([ans].concat(wrong)).map(fmt), answer: fmt(ans),
      say: "What is " + BD.ReadAloud.words(BD.MathGame.show(q)) + "?"
    };
  }

  function grammarItem(grade) {
    const q = BD.Quick.grammar(Math.max(grade, -1));
    if (!q) return null;
    return { prompt: "Which sentence is written correctly?", choices: q.choices, answer: q.answer, long: true,
      say: [{ text: "Which sentence is written correctly?" }].concat(q.choices.map(function (c, i) { return { text: (i + 1) + ". " + c }; })) };
  }

  function spellingItem(grade, used) {
    const list = BD.SPELLING[String(grade)] || BD.SPELLING["3"];
    for (let k = 0; k < 12; k++) {
      const x = list[r(list.length)];
      if (used[x[0]] && k < 10) continue;
      let q = null;
      try { q = BD.WordQuiz.makeSpelling(x, grade, "pick"); } catch (e) { q = null; }
      if (!q || !q.choices || q.choices.length < 2) { try { q = BD.WordQuiz.makeSpelling(x, grade, "missing"); } catch (e) { q = null; } }
      if (!q || !q.choices || q.choices.length < 2) continue;
      used[x[0]] = 1;
      const full = x[1].replace("___", x[0]);
      if (q.mode === "pick") {
        return { prompt: "Which spelling is right?", sub: x[1].replace("___", "_____"), choices: q.choices.map(function (c) { return c.value; }), answer: q.answer,
          say: "Which is the right way to spell " + x[0] + "? " + full };
      }
      return { prompt: "Pick the missing letter", html: '<div class="pl-spell">' + q.promptHTML + '</div>', sub: x[1].replace("___", "_____"),
        choices: q.choices.map(function (c) { return c.value; }), answer: q.answer, say: "Pick the missing letter in " + x[0] + ". " + full };
    }
    return null;
  }

  /* A short story with one question. The wrong choices are answers to the
     same kind of question about other stories, plus (for detail questions)
     another detail from this story, so the child has to read to choose. */
  function storyItem(grade, used) {
    if (!BD.StoryGen) return null;
    const norm = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, "").trim(); };
    for (let k = 0; k < 6; k++) {
      const ps = BD.StoryGen.generate(grade, { avoid: Object.keys(used) });
      const qs = ps.questions.filter(function (q) { return q.type === "detail" || q.type === "main"; });
      if (!qs.length) continue;
      const q = qs.filter(function (x) { return x.type === "detail"; })[0] && Math.random() < 0.65 ? qs.filter(function (x) { return x.type === "detail"; })[0] : qs[r(qs.length)];
      const right = q.answer, wrong = [], seen = [norm(right)];
      const ok = function (a) { const n = norm(a); if (!n || seen.indexOf(n) !== -1) return false; if (n.indexOf(norm(right)) !== -1 || norm(right).indexOf(n) !== -1) return false; return true; };
      const meta = BD.StoryGen.info(ps);
      if (q.type === "detail" && meta && meta.cands && grade >= 1) {
        const same = shuffle(meta.cands.filter(function (c) { return c.type === "detail" && c.q !== q.q && ok(c.answer) && ps.text.toLowerCase().indexOf(norm(c.answer).split(" ").slice(0, 3).join(" ")) !== -1; }));
        if (same[0]) { wrong.push(same[0].answer); seen.push(norm(same[0].answer)); }
      }
      for (let t = 0; t < 10 && wrong.length < 2; t++) {
        const other = BD.StoryGen.generate(grade);
        if (other.id === ps.id || (BD.StoryGen.info(other) || {}).subject === (meta || {}).subject) continue;
        const pool = (BD.StoryGen.info(other) || { cands: other.questions }).cands || other.questions;
        const match = pool.filter(function (c) { return c.q === q.q && ok(c.answer); })[0] || shuffle(pool.filter(function (c) { return c.type === q.type && ok(c.answer); }))[0];
        if (match) { wrong.push(match.answer); seen.push(norm(match.answer)); }
      }
      if (wrong.length < 2) continue;
      used[ps.id] = 1;
      return {
        passage: ps.text, title: ps.title, prompt: q.q, choices: shuffle([right].concat(wrong)), answer: right, long: true,
        say: [{ text: ps.title + ". " + ps.text }, { text: q.q }]
      };
    }
    return null;
  }

  function makeItem(subject, grade, used) {
    let it = null;
    try {
      if (subject === "math") it = mathItem(grade);
      else if (subject === "reading") it = grammarItem(grade);
      else if (subject === "spelling") it = spellingItem(grade, used);
      else it = storyItem(grade, used);
    } catch (e) { if (window.console) console.error(e); it = null; }
    return it;
  }

  /* ================= STAIRCASE ================= */
  function maxItems(subject, start) {
    if (start <= 0) return subject === "comprehension" ? 3 : 4;
    return subject === "comprehension" ? 5 : 7;
  }
  function stair(subject, start) {
    return { subject: subject, start: start, grade: start, prev: start, streak: 0, n: 0, lastMove: 0, reversals: 0, floor: 0, ceil: 0, max: maxItems(subject, start), log: [], done: false, result: null };
  }
  /* Record one answer; returns the move made (+1, -1 or 0). */
  function step(st, ok) {
    st.log.push({ g: st.grade, ok: !!ok });
    st.n++;
    let move = 0;
    if (ok) {
      st.streak++;
      if (st.streak >= 2) { st.streak = 0; if (st.grade < BD.MAX_GRADE) move = 1; else st.ceil++; }
    } else {
      st.streak = 0;
      if (st.grade > BD.MIN_GRADE) move = -1; else st.floor++;
    }
    if (move) {
      if (st.lastMove && st.lastMove !== move) st.reversals++;
      st.lastMove = move; st.prev = st.grade; st.grade += move;
    }
    // very young (or dropping into Pre-K/K): keep it short
    const cap = st.grade <= 0 ? Math.min(st.max, Math.max(4, st.n)) : st.max;
    if (st.reversals >= 2) { st.done = true; st.result = Math.min(st.grade, st.prev); }
    else if (st.ceil >= 1) { st.done = true; st.result = BD.MAX_GRADE; }
    else if (st.floor >= 2) { st.done = true; st.result = BD.MIN_GRADE; }
    else if (st.n >= cap) { st.done = true; st.result = st.grade; }
    return move;
  }

  /* ================= THE FLOW ================= */
  let S = null, el = null, autoTimer = null;
  const pending = {}; // student id → open the assessment once home is showing

  function root() {
    if (el && document.body.contains(el)) return el;
    el = document.createElement("div");
    el.className = "sheet-backdrop place-backdrop";
    el.id = "placeSheet";
    el.hidden = true;
    el.innerHTML = '<div class="sheet place-sheet" role="dialog" aria-modal="true" aria-labelledby="placeTitle">' +
      '<div class="sheet-head"><h2 id="placeTitle">Belt Assessment</h2><button type="button" class="btn btn-quiet btn-small" id="placeSkip">Skip for now</button></div>' +
      '<div class="place-body" id="placeBody"></div></div>';
    document.body.appendChild(el);
    el.querySelector("#placeSkip").addEventListener("click", function () { skip(); });
    el.addEventListener("click", onClick);
    return el;
  }
  function body() { return root().querySelector("#placeBody"); }
  function isOpen() { return !!(el && !el.hidden); }

  /* start(p, { isNew, from }) opens the assessment for a student. */
  function start(p, opts) {
    opts = opts || {};
    p = p || BD.Store.current(); if (!p) return false;
    if (BD.Store.current() !== p) BD.Store.setCurrent(p.id);
    delete pending[p.id];
    S = { p: p, isNew: !!opts.isNew, from: opts.from || "", idx: -1, stairs: {}, used: { spelling: {}, comprehension: {} }, item: null, locked: false, results: {} };
    SUBJECTS.forEach(function (s) { const g = clampG(p[s.field] === undefined ? 3 : p[s.field]); S.stairs[s.key] = stair(s.key, g); });
    root().hidden = false;
    root().querySelector("#placeSkip").textContent = "Skip for now";
    document.body.classList.add("sheet-lock");
    intro();
    return true;
  }

  function intro() {
    const p = S.p, young = Math.min.apply(null, SUBJECTS.map(function (s) { return S.stairs[s.key].start; })) <= 0;
    body().innerHTML =
      '<div class="place-intro">' +
      '<div class="place-champ">' + safeChamp(p) + '</div>' +
      '<h3 class="place-big">Let\'s find your starting belt level!</h3>' +
      '<p>' + esc(p.name) + ', answer a few quick questions in ' + SUBJECTS.map(function (s) { return s.icon + " " + s.label; }).join(", ") + '. ' +
      (young ? "Tap the 🔊 button to hear each question." : "It takes about 5 minutes.") + '</p>' +
      '<p class="muted">It\'s okay to miss some. That\'s how we find just the right level. No points, no pressure!</p>' +
      '<button type="button" class="btn btn-primary btn-big" data-pl="go">Let\'s go!</button></div>';
    setTimeout(function () { const b = body().querySelector('[data-pl="go"]'); if (b) b.focus(); }, 60);
  }
  function safeChamp(p) { try { return BD.UI.championHTML(p); } catch (e) { return '<span class="place-emoji">🥋</span>'; } }

  function nextSubject() {
    S.idx++;
    if (S.idx >= SUBJECTS.length) return finish();
    const s = SUBJECTS[S.idx];
    body().innerHTML = '<div class="place-intro">' + track() +
      '<span class="place-emoji" aria-hidden="true">' + s.icon + '</span>' +
      '<h3 class="place-big">' + (S.idx ? "Next up: " : "First up: ") + esc(s.label) + '</h3>' +
      '<p class="muted">' + esc(s.game2) + '</p>' +
      '<button type="button" class="btn btn-primary btn-big" data-pl="ready">Ready!</button></div>';
    if (BD.ReadAloud.auto(S.stairs[s.key].start)) BD.ReadAloud.say((S.idx ? "Next up: " : "First up: ") + s.label);
    setTimeout(function () { const b = body().querySelector('[data-pl="ready"]'); if (b) b.focus(); }, 60);
  }
  /* The four subjects along the top. */
  function track() {
    return '<ol class="place-track">' + SUBJECTS.map(function (s, i) {
      return '<li class="' + (i < S.idx ? "done" : i === S.idx ? "on" : "") + '"><span aria-hidden="true">' + s.icon + '</span>' + esc(s.label) + '</li>';
    }).join("") + '</ol>';
  }

  function ask() {
    const s = SUBJECTS[S.idx], st = S.stairs[s.key];
    let it = null;
    for (let k = 0; k < 4 && !it; k++) it = makeItem(s.key, st.grade, S.used[s.key] || {});
    if (!it) { st.done = true; st.result = st.n ? st.grade : null; return nextSubject(); }
    S.item = it; S.locked = false;
    const dots = []; for (let i = 0; i < st.max; i++) dots.push('<span class="' + (i < st.n ? "done" : i === st.n ? "on" : "") + '"></span>');
    const young = st.grade <= 0;
    body().innerHTML = track() +
      '<div class="place-card' + (young ? " young" : "") + '" data-grade="' + st.grade + '">' +
      '<div class="place-qhead"><span class="place-dots" aria-label="Question ' + (st.n + 1) + '">' + dots.join("") + '</span>' +
      '<button type="button" class="btn btn-quiet btn-small place-say" data-pl="say" aria-label="Read it to me">🔊</button></div>' +
      (it.passage ? '<div class="place-passage"><strong>' + esc(it.title || "") + '</strong><p>' + esc(it.passage) + '</p></div>' : "") +
      (it.html || "") +
      '<p class="place-prompt">' + esc(it.prompt) + '</p>' +
      (it.sub ? '<p class="place-sub">' + esc(it.sub) + '</p>' : "") +
      '<div class="place-choices' + (it.long ? " long" : "") + (it.choices.length === 3 && !it.long ? " three" : "") + '">' +
      it.choices.map(function (c, i) { return '<button type="button" class="choice place-choice" data-pl="pick" data-i="' + i + '">' + esc(c) + '</button>'; }).join("") +
      '</div><p class="place-feedback" id="placeFeedback" role="status" aria-live="polite"></p></div>';
    if (BD.ReadAloud.auto(st.grade)) speak();
  }
  function speak() {
    const it = S && S.item; if (!it) return;
    let parts = typeof it.say === "string" ? [{ text: it.say }] : (it.say || [{ text: it.prompt }]).slice();
    if (it.passage) parts = parts.concat(it.choices.map(function (c, i) { return { text: (i + 1) + ". " + c }; }));
    BD.ReadAloud.say(parts);
  }

  const CHEERS_RIGHT = ["Nice!", "You got it!", "Great job!", "Super!", "Hi-yah!"];
  const CHEERS_MISS = ["Good try!", "Nice effort!", "That one was tricky!", "Keep going!"];
  function pick(i) {
    if (!S || S.locked || !S.item) return;
    S.locked = true;
    const s = SUBJECTS[S.idx], st = S.stairs[s.key], it = S.item;
    const ok = it.choices[i] === it.answer;
    const btns = body().querySelectorAll(".place-choice");
    btns.forEach(function (b) { b.disabled = true; if (it.choices[Number(b.dataset.i)] === it.answer) b.classList.add("is-right"); });
    if (!ok && btns[i]) btns[i].classList.add("is-wrong");
    const fb = body().querySelector("#placeFeedback");
    if (fb) { fb.textContent = ok ? CHEERS_RIGHT[r(CHEERS_RIGHT.length)] : CHEERS_MISS[r(CHEERS_MISS.length)]; fb.className = "place-feedback " + (ok ? "good" : "soft"); }
    if (BD.Speech && BD.Speech.stop) try { BD.Speech.stop(); } catch (e) { /* fine */ }
    if (ok && BD.Sound && BD.Sound.right) try { BD.Sound.right(); } catch (e) { /* fine */ }
    step(st, ok);
    S.timer = setTimeout(function () {
      if (!S) return;
      if (st.done) { S.results[s.key] = st.result; nextSubject(); } else ask();
    }, ok ? 750 : 1300);
  }

  /* Save the placed grades. Skipped subjects keep their grade. */
  function apply(p, res) {
    const out = { date: BD.today(), math: null, reading: null, spelling: null, comprehension: null };
    const kept = [];
    SUBJECTS.forEach(function (s) {
      const g = res[s.key];
      if (g === undefined || g === null) return;
      out[s.key] = g;
      const lock = p.retry && p.retry[s.game];
      if (lock) { kept.push(s.key); return; } // a redo is in progress: leave it alone
      p[s.field] = g;
    });
    const got = SUBJECTS.map(function (s) { return out[s.key]; }).filter(function (g) { return g !== null; });
    if (!got.length) return null;
    if (S && S.isNew && got.length) {
      const a = got.slice().sort(function (x, y) { return x - y; }), m = a.length;
      const med = m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2;
      p.dojoGrade = clampG(Math.round(med)) + 0;
    }
    p.placed = out;
    BD.Store.save(p);
    return { placed: out, kept: kept };
  }

  function finish() {
    const p = S.p, done = apply(p, S.results);
    if (BD.Sound && BD.Sound.win) try { BD.Sound.win(); } catch (e) { /* fine */ }
    if (BD.confetti) try { BD.confetti(60); } catch (e) { /* fine */ }
    const rows = SUBJECTS.map(function (s) {
      const g = S.results[s.key];
      const kept = done && done.kept.indexOf(s.key) !== -1;
      return '<li><span class="place-ricon" aria-hidden="true">' + s.icon + '</span><span><strong>' + esc(s.label) + '</strong><small>' + esc(s.game2) + '</small></span>' +
        '<span class="place-rgrade">' + (g === undefined || g === null ? "–" : esc(gradeWords(g))) + (kept ? '<small>redo in progress, kept ' + esc(gradeWords(p[s.field])) + '</small>' : "") + '</span></li>';
    }).join("");
    body().innerHTML = '<div class="place-result">' +
      '<div class="place-champ sm">' + safeChamp(p) + '</div>' +
      '<h3 class="place-big">Your training levels are set!</h3>' +
      '<ul class="place-rows">' + rows + '</ul>' +
      (S.isNew ? '<p class="muted small">Your belt path starts at ' + esc(gradeWords(BD.Rank.dojoGrade(p))) + '.</p>' : "") +
      '<p class="muted small">Levels keep adjusting as you train. Grown-ups can change them in the Parents area.</p>' +
      '<button type="button" class="btn btn-primary btn-big" data-pl="done">Start training!</button></div>';
    S.finished = true;
    root().querySelector("#placeSkip").textContent = "Close";
    const say = SUBJECTS.filter(function (s) { return S.results[s.key] !== undefined && S.results[s.key] !== null; }).map(function (s) { return s.label + ": " + gradeWords(S.results[s.key]); }).join(". ");
    if (BD.ReadAloud.auto(Math.min.apply(null, SUBJECTS.map(function (s) { return S.stairs[s.key].start; })))) BD.ReadAloud.say("Your training levels are set! " + say);
  }

  /* Skip for now: subjects already finished still count. */
  function skip() {
    if (!S) return close();
    if (!S.finished) {
      const res = S.results;
      if (Object.keys(res).length) apply(S.p, res);
    }
    close(true);
  }
  function close(goHome) {
    if (S && S.timer) clearTimeout(S.timer);
    const from = S && S.from;
    S = null;
    if (el) el.hidden = true;
    if (BD.Speech && BD.Speech.stop) try { BD.Speech.stop(); } catch (e) { /* fine */ }
    if (!document.querySelector(".sheet-backdrop:not([hidden])")) document.body.classList.remove("sheet-lock");
    if (goHome && from === "parent") BD.UI.refresh(); // show any levels already placed
    else if (goHome && BD.Store.current()) BD.UI.home();
  }

  function onClick(e) {
    const b = e.target.closest("[data-pl]"); if (!b || !S) return;
    const act = b.dataset.pl;
    if (act === "go" || act === "ready") { if (BD.Sound) BD.Sound.tap(); if (act === "go") nextSubject(); else ask(); }
    else if (act === "say") speak();
    else if (act === "pick") pick(Number(b.dataset.i));
    else if (act === "done") { if (BD.Sound) BD.Sound.tap(); close(false); BD.UI.home(); } // either way the student is ready to train
  }

  /* ---------- opening it for a brand-new student ---------- */
  function autoAllowed() {
    if (window.__BD_TEST__ === true) return false;
    if (window.__BD_TEST__ === false) return true;
    return !(navigator && navigator.webdriver);
  }
  function anySheetOpen() { return !!document.querySelector(".sheet-backdrop:not([hidden])"); }
  function tryOpen(tries) {
    clearTimeout(autoTimer);
    const p = BD.Store.current();
    if (!p || !pending[p.id] || isOpen()) return;
    const home = document.getElementById("screen-home");
    if (!home || home.hidden) return; // wait for the next home screen
    if (anySheetOpen()) { if (tries < 240) autoTimer = setTimeout(function () { tryOpen(tries + 1); }, 1000); return; }
    start(p, { isNew: true, from: "new" });
  }
  BD.on("playerAdded", function (p) { if (p && p.id && autoAllowed()) pending[p.id] = true; });
  BD.on("home", function (p) { if (p && pending[p.id]) { clearTimeout(autoTimer); autoTimer = setTimeout(function () { tryOpen(0); }, 1200); } });
  /* If a game starts while it's open (shouldn't happen), step aside. */
  BD.on("screen", function (id) { if (isOpen() && id !== "screen-home" && id !== "screen-parent" && id !== "screen-players") close(false); });

  /* ================= QUIET AUTO-LEVELING ================= */
  const accOf = function (s, game) {
    const right = game === "sentence" && typeof s.firstTry === "number" ? s.firstTry : Number(s.correct) || 0;
    return s.total ? right / s.total : 0;
  };
  /* Called after every round's results. Returns { game, from, to, text } or null. */
  function autoLevel(p, o) {
    if (!p || p.autoLevelOff || !Array.isArray(p.sessions) || !p.sessions.length) return null;
    const s = p.sessions[0], game = s && s.game, a = AUTO[game];
    if (!a) return null;
    if (s.date && Date.now() - new Date(s.date).getTime() > 10 * 60 * 1000) return null; // not this round
    if (s.school || (o && o.belt && o.belt.test)) return null;
    const cur = Number(p[a.field]);
    if (!isFinite(cur) || Number(s.grade) !== cur) return null;
    if (p.retry && p.retry[game]) return null;
    const log = p.levelLog && p.levelLog[game];
    if (log && log.d === BD.today()) return null;
    const since = log ? Number(log.at) || 0 : 0;
    const rounds = p.sessions.filter(function (x) {
      return x && x.game === game && Number(x.grade) === cur && Number(x.total) >= MIN_ITEMS && !x.school && (!x.date || new Date(x.date).getTime() > since);
    }).slice(0, 2);
    if (rounds.length < 2 || rounds[0] !== s) return null;
    let to = cur;
    if (rounds.every(function (x) { return accOf(x, game) >= UP; }) && cur < BD.MAX_GRADE) to = cur + 1;
    else if (rounds.every(function (x) { return accOf(x, game) <= DOWN; }) && cur > BD.MIN_GRADE) to = cur - 1;
    if (to === cur) return null;
    p[a.field] = to;
    p.levelLog = p.levelLog && typeof p.levelLog === "object" ? p.levelLog : {};
    p.levelLog[game] = { d: BD.today(), at: Date.now(), from: cur, to: to };
    BD.Store.save(p);
    const text = to > cur ? "Leveled up! " + a.label + " is now " + gradeWords(to) + "."
      : "Let's practice " + gradeWords(to) + " " + a.label.toLowerCase().replace("fix-it sentences", "Fix-It Sentences").replace("story scrolls", "Story Scrolls") + " a bit more.";
    return { game: game, from: cur, to: to, up: to > cur, text: text };
  }

  function toast(ch) {
    const scr = document.getElementById("screen-results"); if (!scr) return;
    const old = scr.querySelector(".level-toast"); if (old) old.remove();
    if (!ch) return;
    const t = document.createElement("div");
    t.className = "level-toast " + (ch.up ? "up" : "down");
    t.setAttribute("role", "status");
    t.innerHTML = '<span class="level-toast-icon" aria-hidden="true">' + (ch.up ? "⬆️" : "💪") + '</span><span>' + esc(ch.text) + '</span>';
    const hero = scr.querySelector(".results-hero");
    if (hero && hero.nextSibling) scr.insertBefore(t, hero.nextSibling); else scr.prepend(t);
    if (ch.up) { const lv = document.getElementById("resLevel"); if (lv) lv.hidden = true; } // the game's own "move up" offer is done already
  }
  BD.on("results", function (e) {
    if (!e || !e.p) return;
    let ch = null;
    try { ch = autoLevel(e.p, e.o); } catch (err) { if (window.console) console.error(err); }
    toast(ch);
  });
  BD.on("screen", function (id) { if (id !== "screen-results") { const t = document.querySelector("#screen-results .level-toast"); if (t) t.remove(); } });

  /* ================= SAVED FIELDS ================= */
  function sanitize(p) {
    if (!p || typeof p !== "object") return p;
    const gOk = function (g) { if (g === null || g === undefined || g === "") return null; g = Number(g); return isFinite(g) ? clampG(g) : null; };
    const dOk = function (d) { return typeof d === "string" && /^\d{4}-\d\d-\d\d$/.test(d); };
    if (p.placed !== undefined) {
      const x = p.placed;
      if (x && typeof x === "object" && !Array.isArray(x) && dOk(x.date)) p.placed = { date: x.date, math: gOk(x.math), reading: gOk(x.reading), spelling: gOk(x.spelling), comprehension: gOk(x.comprehension) };
      else delete p.placed;
    }
    if (p.autoLevelOff !== undefined) { if (p.autoLevelOff === true) p.autoLevelOff = true; else delete p.autoLevelOff; }
    if (p.levelLog !== undefined) {
      const out = {};
      if (p.levelLog && typeof p.levelLog === "object" && !Array.isArray(p.levelLog)) Object.keys(AUTO).forEach(function (k) {
        const v = p.levelLog[k];
        if (v && typeof v === "object" && dOk(v.d) && gOk(v.from) !== null && gOk(v.to) !== null) out[k] = { d: v.d, at: Math.max(0, Math.min(1e13, Math.round(Number(v.at) || 0))), from: gOk(v.from), to: gOk(v.to) };
      });
      if (Object.keys(out).length) p.levelLog = out; else delete p.levelLog;
    }
    return p;
  }

  /* ================= PARENTS AREA ================= */
  if (BD.Settings) BD.Settings.add({
    id: "levels", scope: "student", title: "Levels and Belt Assessment",
    html: function (p) {
      const on = !p.autoLevelOff, pl = p.placed, log = p.levelLog || {};
      const rows = Object.keys(AUTO).map(function (k) {
        const a = AUTO[k], ch = log[k], lock = p.retry && p.retry[k];
        return '<li><strong>' + esc(a.label) + '</strong> ' + esc(gradeWords(p[a.field])) +
          (lock ? ' <span class="muted small">(redo in progress)</span>' : "") +
          (ch ? ' <span class="muted small">· auto ' + (ch.to > ch.from ? "up" : "down") + ' from ' + esc(BD.gradeShort(ch.from)) + ' on ' + esc(ch.d.slice(5).replace("-", "/")) + '</span>' : "") + '</li>';
      }).join("");
      return '<label class="set-check place-set-check"><input type="checkbox" data-auto' + (on ? " checked" : "") + '> <strong>Adjust levels automatically</strong></label>' +
        '<p class="muted small">After two rounds in a row at 90% or better, that subject moves up a grade; after two at 50% or lower, it moves down one. At most one change per subject per day, never during a redo. The belt path grade is never changed.</p>' +
        '<ul class="place-levels">' + rows + '</ul>' +
        '<p class="small">' + (pl ? "Belt Assessment taken " + esc(pl.date) + ": " + SUBJECTS.map(function (s) { return s.label + " " + (pl[s.key] === null ? "–" : BD.gradeShort(pl[s.key])); }).join(", ") + "." : "The Belt Assessment hasn't been taken yet.") + '</p>' +
        '<button type="button" class="btn btn-small" data-retake>' + (pl ? "Retake the Belt Assessment" : "Start the Belt Assessment") + '</button>';
    },
    bind: function (root, p, rerender) {
      root.querySelector("[data-auto]").onchange = function () { if (this.checked) delete p.autoLevelOff; else p.autoLevelOff = true; BD.Store.save(p); rerender(); };
      root.querySelector("[data-retake]").onclick = function () { start(p, { from: "parent" }); };
    }
  });

  return { start: start, sanitize: sanitize, autoLevel: autoLevel, isOpen: isOpen, skip: skip, _state: function () { return S; }, _step: step, _stair: stair, _makeItem: makeItem, SUBJECTS: SUBJECTS };
})();
