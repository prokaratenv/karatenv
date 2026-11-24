/* DAILY TRAINING — one mixed round with every subject, like a real class:
   math, Fix-It sentences, spelling and a short story with questions, plus
   Spanish if the student turns it on. About 12 to 16 items (8 to 10 minutes).
   - Each item comes from that subject's own generator, at the subject's grade
     and belt (BD.Rank.itemGrade), with 2 hints and the usual read-aloud rules.
   - Each right answer fills THAT subject's stripe meter (BD.Rank.practice, so
     belt power and review points apply as in the single games) and earns the
     +2 right-answer XP. Spanish fills its bonus meter.
   - One session { game: "mixed", parts: { math: {c, t, g}, ... } } so quests,
     stickers, goals and the parent report count it. */
window.BD = window.BD || {};

BD.Mixed = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const r = function (n) { return Math.floor(Math.random() * n); };
  const shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
  const SUBJ = {
    math: { label: "Math", game: "math", field: "mathGrade", xp: 30 },
    reading: { label: "Reading", game: "sentence", field: "sentenceGrade", xp: 25 },
    spelling: { label: "Spelling", game: "spelling", field: "spellingGrade", xp: 28 },
    comprehension: { label: "Stories", game: "reading", field: "readingGrade", xp: 18 },
    spanish: { label: "Spanish", game: "spanish", field: "spanishGrade", xp: 28 }
  };
  const KEY = "brainDojo.mixedSpanish";
  let S = null, advT = null;

  function spanishOn() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function setSpanish(on) { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) { /* this device only */ } }
  function gradeOf(p, k) { const g = Number(p[SUBJ[k].field]); return isFinite(g) ? g : BD.Rank.dojoGrade(p); }
  function itemGrade(p, k) { const g = gradeOf(p, k); try { return BD.Rank.itemGrade(g, BD.Rank.rec(p, g).belt); } catch (e) { return g; } }

  /* ---------- items ---------- */
  function mathItem(p) {
    const base = gradeOf(p, "math"), g = itemGrade(p, "math");
    if (g <= 0 && BD.Placement && BD.Placement._makeItem) { // Pre-K and K: picture counting with choices
      const it = BD.Placement._makeItem("math", Math.max(-1, g), {});
      if (it) return Object.assign({ subject: "math", g: base, kind: "choice", label: "Math" }, it, { mq: null });
    }
    const own = BD.MathGame.opsFor(base), ops = BD.MathGame.opsFor(g).filter(function (o) { return own.indexOf(o) !== -1; });
    if (!ops.length) ops.push(own[0]);
    const q = BD.MathGame.makeProblem(ops[r(ops.length)], g);
    return { subject: "math", g: base, kind: "math", label: "Math", prompt: BD.MathGame.show(q) + " =", answer: String(q.answer), mq: q, neg: q.answer < 0,
      say: q.say || "What is " + BD.ReadAloud.words(BD.MathGame.show(q)) + "?" };
  }
  function readingItem(p) {
    const base = gradeOf(p, "reading"), q = BD.Quick.grammar(Math.max(-1, itemGrade(p, "reading")));
    if (!q) return null;
    return { subject: "reading", g: base, kind: "choice", label: "Reading", prompt: "Which sentence is written correctly?", choices: q.choices, answer: q.answer, long: true,
      say: [{ text: "Which sentence is written correctly?" }].concat(q.choices.map(function (c, i) { return { text: (i + 1) + ". " + c }; })) };
  }
  function spellingItem(p, used) {
    const base = gradeOf(p, "spelling"), g = itemGrade(p, "spelling");
    const list = BD.SPELLING[String(g)] || BD.SPELLING[String(base)] || BD.SPELLING["3"];
    let weak = null; try { weak = BD.Phonics ? BD.Phonics.weakest(p, g) : null; } catch (e) { weak = null; }
    for (let k = 0; k < 14; k++) {
      // lean toward word patterns this student finds hard
      let x = list[r(list.length)];
      if (weak && weak.length && k < 6) { const y = list[r(list.length)]; if (BD.Phonics.weight(y[0], weak) > BD.Phonics.weight(x[0], weak)) x = y; }
      if (used[x[0]] && k < 12) continue;
      let q = null;
      try { q = BD.WordQuiz.makeSpelling(x, g, Math.random() < 0.55 ? "pick" : "missing"); } catch (e) { q = null; }
      if (!q || !q.choices || q.choices.length < 2) continue;
      used[x[0]] = 1;
      const full = x[1].replace("___", x[0]);
      return { subject: "spelling", g: base, kind: "choice", label: "Spelling", word: x[0], mode: q.mode,
        prompt: q.mode === "pick" ? "Which spelling is right?" : "Pick the missing letter", html: q.mode === "pick" ? "" : '<div class="pl-spell">' + q.promptHTML + '</div>',
        sub: x[1].replace("___", "_____"), choices: q.choices.map(function (c) { return c.value; }), answer: q.answer, spellQ: q,
        say: (q.mode === "pick" ? "Which is the right way to spell " + x[0] + "? " : "Pick the missing letter in " + x[0] + ". ") + full };
    }
    return null;
  }
  function spanishItem(p) {
    if (BD.Spanish && BD.Spanish.mixedItem) { const it = BD.Spanish.mixedItem(p); if (it) return it; } // only words the student has learned
    const base = gradeOf(p, "spanish"), q = BD.Quick.spanish(Math.max(-1, itemGrade(p, "spanish")));
    if (!q) return null;
    return { subject: "spanish", g: base, kind: "choice", label: "Spanish", prompt: q.prompt, html: q.html, choices: q.choices, answer: q.answer, say: q.say, topic: "" };
  }
  /* A short story with 2 or 3 questions (main idea and details), each with
     wrong choices from other stories or other details of this story. */
  function storyItems(p, n) {
    if (!BD.StoryGen) return [];
    const base = gradeOf(p, "comprehension"), g = Math.max(-1, itemGrade(p, "comprehension"));
    const norm = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, "").trim(); };
    for (let k = 0; k < 5; k++) {
      let ps = null; try { ps = BD.StoryGen.pick(p, g, 1)[0]; } catch (e) { ps = null; }
      if (!ps) { try { ps = BD.StoryGen.generate(g); } catch (e) { ps = null; } }
      if (!ps || !ps.questions) continue;
      const meta = BD.StoryGen.info(ps) || {};
      const qs = shuffle(ps.questions.filter(function (q) { return q.type === "detail" || q.type === "main"; })).slice(0, n);
      const out = [];
      qs.forEach(function (q) {
        const right = q.answer, wrong = [], seen = [norm(right)];
        const ok = function (a) { const v = norm(a); if (!v || seen.indexOf(v) !== -1) return false; return v.indexOf(norm(right)) === -1 && norm(right).indexOf(v) === -1; };
        if (q.type === "detail" && meta.cands) {
          const same = shuffle(meta.cands.filter(function (c) { return c.type === "detail" && c.q !== q.q && ok(c.answer); }));
          if (same[0]) { wrong.push(same[0].answer); seen.push(norm(same[0].answer)); }
        }
        for (let t = 0; t < 10 && wrong.length < 2; t++) {
          const other = BD.StoryGen.generate(g);
          if (other.id === ps.id || (BD.StoryGen.info(other) || {}).subject === meta.subject) continue;
          const pool = (BD.StoryGen.info(other) || { cands: other.questions }).cands || other.questions;
          const m = pool.filter(function (c) { return c.q === q.q && ok(c.answer); })[0] || shuffle(pool.filter(function (c) { return c.type === q.type && ok(c.answer); }))[0];
          if (m) { wrong.push(m.answer); seen.push(norm(m.answer)); }
        }
        if (wrong.length >= 2) out.push({ subject: "comprehension", g: base, kind: "choice", label: "Stories", passage: ps.text, title: ps.title, prompt: q.q, qtype: q.type,
          hint: q.hint, choices: shuffle([right].concat(wrong)), answer: right, long: true, say: [{ text: q.q }] });
      });
      if (out.length >= Math.min(2, n)) { out.forEach(function (it, i) { it.storyIx = i; it.storyN = out.length; }); return out; }
    }
    return [];
  }

  /* The round: singles shuffled, the story's questions kept together. */
  function build(p, withSpanish) {
    const young = BD.Kid ? BD.Kid.young(BD.Rank.dojoGrade(p)) : false, used = {};
    const plan = young ? { math: 3, reading: 2, spelling: 3 } : { math: 4, reading: 3, spelling: 3 };
    if (withSpanish) plan.spanish = 2;
    let singles = [];
    Object.keys(plan).forEach(function (k) {
      for (let i = 0; i < plan[k]; i++) {
        let it = null;
        try { it = k === "math" ? mathItem(p) : k === "reading" ? readingItem(p) : k === "spelling" ? spellingItem(p, used) : spanishItem(p); } catch (e) { it = null; }
        if (it) singles.push(it);
      }
    });
    singles = shuffle(singles);
    // no two in a row from the same subject when it can be helped
    for (let i = 1; i < singles.length; i++) if (singles[i].subject === singles[i - 1].subject) {
      const j = singles.findIndex(function (x, k) { return k > i && x.subject !== singles[i].subject && (!singles[i + 1] || x.subject !== singles[i - 1].subject); });
      if (j !== -1) { const t = singles[i]; singles[i] = singles[j]; singles[j] = t; }
    }
    const story = storyItems(p, young ? 2 : 3);
    const at = Math.min(singles.length, 3 + r(Math.max(1, singles.length - 4)));
    return singles.slice(0, at).concat(story, singles.slice(at));
  }

  /* ---------- screen ---------- */
  function start() {
    const p = BD.Store.current(); if (!p) return;
    if (BD.Little && BD.Little.young(p)) { BD.Little.start("mixed"); return; } // Little Ninjas Daily Training
    stop();
    S = { p: p, phase: "intro" };
    BD.UI.show("screen-mixed-play");
    intro();
  }
  function intro() {
    const p = S.p, on = spanishOn(), g = BD.Rank.dojoGrade(p), pw = BD.Rank.power ? BD.Rank.power(p, g) : null;
    $("mixProgress").textContent = "Daily Training";
    $("mixScore").textContent = "";
    $("mixSay").textContent = "One round, every subject. Let's train!";
    $("mixBody").innerHTML = '<div class="mix-intro">' +
      '<p class="mix-k">Daily Training</p><h2>Train every subject in one round</h2>' +
      '<p class="muted">Math, reading, spelling and a short story, all mixed together. About 8 minutes. Each right answer grows that subject\'s stripe.</p>' +
      '<div class="mix-chips">' + ["math", "reading", "spelling", "comprehension"].map(function (k) { return '<span class="mix-chip mc-' + k + '">' + SUBJ[k].label + '</span>'; }).join("") +
        '<button type="button" class="mix-chip mc-spanish mix-toggle' + (on ? " on" : "") + '" id="mixSpanish" aria-pressed="' + on + '">' + (on ? "Spanish added" : "Add Spanish") + '</button></div>' +
      (pw ? '<p class="mix-power' + (pw.bonus ? " bonus" : "") + '">' + (pw.bonus ? "Bonus practice today: your belt still grows a little, and every right answer earns XP." : "Today's belt XP: " + pw.used + " of " + pw.full + " at full power") + '</p>' : '') +
      '<button type="button" class="btn btn-primary btn-big" id="mixGo">Let\'s train!</button></div>';
    $("mixSpanish").onclick = function () { const v = !spanishOn(); setSpanish(v); BD.Sound.tap(); intro(); };
    $("mixGo").onclick = function () { BD.Sound.tap(); begin(); };
  }
  function begin() {
    const p = S.p, items = build(p, spanishOn());
    S = { p: p, phase: "play", items: items, i: 0, right: 0, xp: 0, by: {}, before: partState(p), done: false };
    next();
  }
  function partState(p) {
    const o = {};
    ["math", "reading", "spelling", "comprehension"].forEach(function (k) {
      const g = gradeOf(p, k), rr = BD.Rank.rec(p, g), n = BD.Rank.nextPart ? BD.Rank.nextPart(rr, k) : null;
      o[k] = n && !rr.stripes[k] && rr.belt < 8 ? (n.open ? n.i : -1) : -1;
    });
    return o;
  }
  function next() {
    clearTimeout(advT);
    if (!S || S.phase !== "play") return;
    if (S.i >= S.items.length) return finish();
    const it = S.items[S.i];
    $("mixProgress").textContent = (S.i + 1) + " of " + S.items.length;
    $("mixScore").textContent = S.xp + " XP";
    $("mixSay").textContent = { math: "Math time. Sharp focus!", reading: "Find the sentence with no mistakes.", spelling: "Spell it like a champion.", comprehension: "Read carefully, then answer.", spanish: "¡Vamos! Spanish time." }[it.subject];
    const prev = S.items[S.i - 1], sameStory = it.passage && prev && prev.passage === it.passage;
    const readOK = it.passage ? BD.ReadAloud.readingOK(it.g) : true;
    $("mixBody").innerHTML =
      (it.passage ? '<article class="mix-story"><h3>Read the story</h3><p id="mixPassage">' + esc(it.passage) + '</p>' +
        (readOK && BD.ReadAloud.can() ? '<button type="button" class="btn btn-small btn-quiet" id="mixReadStory">Read the story</button>' : '') + '</article>' : '') +
      '<div class="mix-card mc-' + it.subject + '" id="mixCard"><span class="mix-tag">' + esc(it.label) + (it.passage ? ' · question ' + (it.storyIx + 1) + ' of ' + it.storyN : '') + '</span>' +
        '<div id="mixQ"></div><div class="mix-fb" id="mixFb" aria-live="polite"></div></div>';
    const q = $("mixQ");
    if (BD.Scratch && BD.Scratch.isOpen()) BD.Scratch.close();
    if (it.kind === "math") renderMath(q, it); else renderChoice(q, it);
    // hints: 2 per item, from the subject's own helpers
    BD.Hints.bar($("mixCard"), "mix", $("mixFb"));
    BD.Hints.reset("mix", provider(it), { grade: it.g });
    if ($("mixReadStory")) $("mixReadStory").onclick = function () { BD.ReadAloud.read([{ el: $("mixPassage") }, { text: it.prompt }]); };
    // read-aloud: younger grades automatically (stories follow the reading rule)
    const autoOK = BD.ReadAloud.auto(it.g) && (!it.passage || readOK);
    if (autoOK) {
      if (it.passage && !sameStory) BD.ReadAloud.read([{ el: $("mixPassage") }, { text: it.prompt }]);
      else BD.ReadAloud.say(typeof it.say === "string" ? it.say : it.say || it.prompt);
    }
    if (it.passage && sameStory) { const st = document.querySelector(".mix-story"); if (st) st.classList.add("again"); }
  }
  function provider(it) {
    if (it.kind === "math" && it.mq) return BD.Hints.math(it.mq);
    const ctx = { choices: function () { return document.querySelectorAll("#mixQ .qq-choice"); }, isRight: function (b) { return it.choices[Number(b.dataset.i)] === it.answer; } };
    if (it.subject === "spelling") return BD.Hints.spelling({ word: it.word, answer: it.answer, choices: it.choices, mode: it.mode, shown: it.spellQ && it.spellQ.shown }, it.g, ctx);
    if (it.subject === "spanish") return BD.Hints.spanish({ choices: it.choices, answer: it.answer, topic: it.topic }, ctx);
    if (it.subject === "comprehension") return function (level) {
      if (level === 1) return { text: (it.hint ? it.hint + " " : "") + (it.qtype === "main" ? "Think about what the whole story is mostly about." : "Look back in the story for the words in the question.") };
      const k = BD.Hints.ruleOut(ctx.choices(), ctx.isRight, 1); return { text: k ? "I took away a wrong answer." : "Only the right answer is left!" };
    };
    if (it.subject === "reading") return function (level) {
      if (level === 1) return { text: "Check each sentence: a capital letter at the start, an end mark, names with capitals, and words spelled right." };
      const k = BD.Hints.ruleOut(ctx.choices(), ctx.isRight, 1); return { text: k ? "I took away a sentence with a mistake." : "Only the right one is left!" };
    };
    return function () { const k = BD.Hints.ruleOut(ctx.choices(), ctx.isRight, 1); return { text: k ? "I took away a wrong answer." : "Only the right answer is left!" }; };
  }
  function renderChoice(el, it) {
    el.innerHTML = (it.html ? '<div class="qq-art">' + it.html + '</div>' : '') +
      (it.prompt ? '<p class="qq-prompt">' + esc(it.prompt) + '</p>' : '') +
      (it.sub ? '<p class="qq-sub">' + esc(it.sub) + '</p>' : '') +
      '<div class="qq-choices' + (it.long ? ' long' : '') + '">' + it.choices.map(function (c, i) { return '<button type="button" class="choice qq-choice" data-i="' + i + '">' + esc(c) + '</button>'; }).join("") + '</div>';
    el.onclick = function (e) {
      const b = e.target.closest(".qq-choice"); if (!b || b.disabled || S.answered) return;
      answer(String(it.choices[Number(b.dataset.i)]) === String(it.answer), b, it.choices[Number(b.dataset.i)]);
    };
  }
  function renderMath(el, it) {
    S.typed = "";
    el.innerHTML = '<p class="mix-problem">' + esc(it.prompt) + ' <span class="mix-ans" id="mixAns">?</span></p>' +
      '<button type="button" class="btn btn-quiet scratch-btn mix-scratch" id="mixScratch">' + '<span aria-hidden="true">✏️</span><span>Scratch paper</span></button>' +
      '<div class="keypad mix-keys" id="mixKeys">' + ["7", "8", "9", "4", "5", "6", "1", "2", "3", it.neg ? "−" : "", "0", "⌫"].map(function (k) {
        return k ? '<button type="button" class="key' + (k === "⌫" ? " key-back" : k === "−" ? " key-minus" : "") + '" data-k="' + k + '">' + k + '</button>' : '<span></span>';
      }).join("") + '<button type="button" class="key key-go" data-k="go">Check</button></div>';
    const keys = el.querySelector("#mixKeys");
    // the handler lives on the keypad itself, so it keeps working while scratch paper borrows the keypad
    keys.onclick = function (e) {
      const b = e.target.closest(".key"); if (!b || S.answered) return;
      const k = b.dataset.k;
      if (k === "go") {
        if (S.typed === "" || S.typed === "-") return;
        if (BD.Scratch && BD.Scratch.isOpen()) BD.Scratch.close();
        answer(String(Number(S.typed)) === String(it.answer), b, S.typed); return;
      }
      if (k === "⌫") S.typed = S.typed.slice(0, -1);
      else if (k === "−") S.typed = S.typed.charAt(0) === "-" ? S.typed.slice(1) : "-" + S.typed;
      else if (S.typed.replace("-", "").length < 6) S.typed += k;
      BD.Sound.tap();
      $("mixAns").textContent = S.typed ? S.typed.replace("-", "−") : "?";
    };
    el.querySelector("#mixScratch").onclick = function () {
      if (!BD.Scratch) return;
      BD.Scratch.clear();
      BD.Scratch.open({ problem: function () { return it.prompt; }, answerEl: $("mixAns"), keypadEl: keys });
    };
  }
  function answer(ok, el, picked) {
    const it = S.items[S.i], p = S.p;
    S.answered = true;
    const hintsUsed = BD.Hints.used("mix"); BD.Hints.close("mix");
    const k = it.subject, b = S.by[k] || (S.by[k] = { c: 0, t: 0, raw: 0, belt: 0, g: it.g });
    b.t++;
    note(p, it, ok);
    document.querySelectorAll("#mixQ .qq-choice").forEach(function (x) {
      const v = it.choices[Number(x.dataset.i)]; x.disabled = true;
      if (String(v) === String(it.answer)) x.classList.add("is-right"); else if (v === picked) x.classList.add("is-wrong");
    });
    if (ok) {
      b.c++; S.right++;
      const raw = Math.max(2, Math.round(SUBJ[k].xp * BD.Hints.factor(hintsUsed)));
      const res = BD.Rank.practice(p, SUBJ[k].game, it.g, raw);
      b.raw += res.earned; b.belt += res.gained || 0; S.xp += res.earned;
      b.res = res;
      if (BD.Correct) S.xp += BD.Correct.hit(p, el);
      BD.Sound.right(); if (BD.Kid && BD.Kid.young(it.g)) BD.Kid.celebrate(el, it.g);
      if (BD.Mini && BD.Mini.react) BD.Mini.react("right");
      $("mixFb").innerHTML = '<p class="win-line">' + ["Hi-yah! Nice!", "Clean technique!", "Strong!", "Yes! Keep it rolling!"][r(4)] + ' +' + res.earned + ' XP</p>';
      $("mixScore").textContent = S.xp + " XP";
      if (it.kind === "math") $("mixCard").classList.add("is-right");
      advT = setTimeout(go, 1000);
    } else {
      BD.Sound.wrong();
      if (BD.Mini && BD.Mini.react) BD.Mini.react("wrong");
      if (it.kind === "math") $("mixCard").classList.add("is-wrong");
      $("mixFb").innerHTML = '<p class="lose-line">The answer is <strong>' + esc(String(it.answer).replace("-", "−")) + '</strong>.</p><button type="button" class="btn btn-primary" id="mixNext">Next</button>';
      $("mixNext").onclick = go;
    }
    BD.Store.save(p);
  }
  function go() { clearTimeout(advT); if (!S || S.phase !== "play") return; S.answered = false; S.i++; next(); }
  /* Keep each subject's own skill records up to date. */
  function note(p, it, ok) {
    const bump = function (o) { if (ok) o.r++; else o.w++; };
    if (it.onResult) try { it.onResult(ok); } catch (e) { /* ok */ }
    try {
      if (it.subject === "math" && it.mq) { const key = it.g + "-" + it.mq.op; bump(p.mathStats[key] || (p.mathStats[key] = { r: 0, w: 0 })); }
      else if (it.subject === "reading") bump(p.sentenceStats[it.g] || (p.sentenceStats[it.g] = { r: 0, w: 0, firstTry: 0 }));
      else if (it.subject === "comprehension") { bump(p.readStats[it.g] || (p.readStats[it.g] = { r: 0, w: 0 })); if (BD.StoryGen && BD.StoryGen.note) BD.StoryGen.note(it.qtype, ok, it.g); }
      else if (it.subject === "spelling" || it.subject === "spanish") {
        const w = p.wordStats[it.subject] = p.wordStats[it.subject] || {}; bump(w[it.g] || (w[it.g] = { r: 0, w: 0 }));
        if (it.subject === "spelling" && BD.Phonics) BD.Phonics.note(it.word, ok, p);
      }
    } catch (e) { /* records never break a round */ }
  }

  function finish() {
    const p = S.p, total = S.items.length, after = partState(p);
    S.phase = "done";
    const parts = {}; Object.keys(S.by).forEach(function (k) { parts[k] = { c: S.by[k].c, t: S.by[k].t, g: S.by[k].g }; });
    BD.Store.recordSession(p, { game: "mixed", grade: BD.Rank.dojoGrade(p), correct: S.right, total: total, xp: S.xp, parts: parts });
    const order = ["math", "reading", "spelling", "comprehension", "spanish"].filter(function (k) { return S.by[k]; });
    const gains = order.map(function (k) { return SUBJ[k].label + " +" + Math.round(S.by[k].belt); }).join(" · ");
    const unlocked = ["math", "reading", "spelling", "comprehension"].filter(function (k) { return after[k] !== -1 && after[k] !== S.before[k]; });
    const anyRes = order.map(function (k) { return S.by[k].res; }).filter(Boolean)[0];
    const pw = anyRes && anyRes.power;
    const lesson = '<div class="mix-res"><p class="mix-gains"><strong>Belt XP by subject:</strong> ' + esc(gains || "Keep training to fill your stripes!") + '</p>' +
      '<ul class="mix-meters">' + order.filter(function (k) { return S.by[k].res; }).map(function (k) {
        const res = S.by[k].res, pct = res.max ? Math.round(100 * res.now / res.max) : 0;
        return '<li><span>' + SUBJ[k].label + ' <small>' + S.by[k].c + ' of ' + S.by[k].t + ' right</small></span><span class="mini-track"><i style="width:' + pct + '%"></i></span><small>' + res.now + ' / ' + res.max + '</small></li>';
      }).join("") + '</ul>' +
      (unlocked.length ? '<p class="mix-unlock">' + unlocked.map(function (k) { return 'Part ' + (after[k] + 1) + ' of the ' + BD.Rank.subject(k).label + ' stripe test is ready!'; }).join(" ") + '</p>' : '') +
      (pw ? '<p class="power-note' + (pw.bonus ? " bonus" : "") + '">' + (pw.bonus ? "Bonus practice: your belt still grows a little, and every point counts on the leaderboard." : "Today's belt XP: " + pw.used + " of " + pw.full + " at full power.") + '</p>' : '') + '</div>';
    const acc = Math.round(100 * S.right / Math.max(1, total));
    BD.UI.results({
      title: acc >= 90 ? "Outstanding training!" : acc >= 70 ? "Great training!" : "Good work, keep training!",
      subtitle: "Daily Training · every subject",
      stats: [["Right", S.right + " / " + total], ["Accuracy", acc + "%"], ["XP earned", "+" + S.xp]],
      lesson: lesson,
      again: function () { start(); }, againLabel: "Train again"
    });
  }
  function stop() { if (BD.Scratch && BD.Scratch.isOpen()) BD.Scratch.close(); clearTimeout(advT); if (S) S.phase = "stopped"; }
  function active() { return !!(S && S.phase === "play"); }
  function bind() { if ($("mixQuit")) $("mixQuit").addEventListener("click", function () { stop(); BD.UI.back(); }); }
  return { start: start, stop: stop, active: active, bind: bind, build: build, _state: function () { return S; }, SUBJ: SUBJ };
})();
