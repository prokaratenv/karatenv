/* STORY SCROLLS — read a short passage and answer questions in your own words.
   Feedback comes from Sensei (Claude) when available, otherwise from the
   built-in keyword check. New passages are written by Claude when the bank
   for a grade runs low, aimed at the kinds of questions the child misses. */
window.BD = window.BD || {};

BD.Reading = (function () {
  const PASSAGES_PER_ROUND = 2, TRIES = 2, PASS = 70;
  const XP = [[0, 12, 25], [0, 8, 15]]; // [try][score]
  const $ = function (id) { return document.getElementById(id); };
  let R = null;

  /* ---------- bank (built-in + Claude-written, synced to the account) ---------- */
  const BANK_KEY = "brainDojo.readBank";
  let bank = (function () { try { return JSON.parse(localStorage.getItem(BANK_KEY) || "{}"); } catch (e) { return {}; } })();
  function saveLocal() { try { localStorage.setItem(BANK_KEY, JSON.stringify(bank)); } catch (e) { /* ignore */ } }
  function bankItems(grade) { return ((bank["bank-read-g" + grade] || {}).items) || []; }
  function applyRemoteBank(docId, data) {
    if (!data || !Array.isArray(data.items)) return;
    const mine = (bank[docId] || {}).items || [];
    const ids = new Set(mine.map(function (x) { return x.id; }));
    bank[docId] = { items: mine.concat(data.items.filter(function (x) { return x && !ids.has(x.id); })).slice(-60), updatedAt: Date.now() };
    saveLocal();
  }
  function addToBank(grade, items) {
    const id = "bank-read-g" + grade;
    bank[id] = { items: bankItems(grade).concat(items).slice(-60), updatedAt: Date.now() };
    saveLocal();
    if (BD.Sync) BD.Sync.saveBank(id, bank[id]);
  }

  /* ---------- adaptive tracking ---------- */
  function record(p, grade, type, ok) {
    const g = p.readRecent[grade] || (p.readRecent[grade] = {});
    const a = g[type] || (g[type] = []);
    a.push(ok ? 1 : 0); if (a.length > 20) a.splice(0, a.length - 20);
  }
  function weights(p, grade, focus) {
    const out = {};
    Object.keys(BD.READ_TYPES).forEach(function (t) {
      const a = (p.readRecent[grade] || {})[t], r = BD.Coach.rate(a);
      out[t] = (!a || a.length < 3) ? 1.5 : 1 + 2.5 * (1 - r);
      if (focus === t) out[t] *= 3;
    });
    return out;
  }

  function choose(p, grade, focus) {
    const w = weights(p, grade, focus);
    const all = BD.PASSAGES.filter(function (x) { return x.grade === grade; }).concat(bankItems(grade));
    const seen = p.seenPassages;
    const score = function (x) { return x.questions.reduce(function (a, q) { return a + (w[q.type] || 1); }, 0) * (0.7 + Math.random() * 0.6); };
    let pool = all.filter(function (x) { return seen.indexOf(x.id) === -1; }).sort(function (a, b) { return score(b) - score(a); });
    if (pool.length < PASSAGES_PER_ROUND) {
      // Everything has been read: bring back the ones read longest ago.
      const old = all.filter(function (x) { return pool.indexOf(x) === -1; })
        .sort(function (a, b) { return seen.indexOf(b.id) - seen.indexOf(a.id); });
      pool = pool.concat(old);
    }
    return pool.slice(0, PASSAGES_PER_ROUND);
  }

  /* ---------- Claude writes new passages ---------- */
  let generating = false, lastTry = 0;
  function validPassage(x) {
    if (!x || typeof x.title !== "string" || typeof x.text !== "string" || !Array.isArray(x.questions)) return false;
    if (x.text.length < 100 || x.text.length > 1600 || x.questions.length !== 3) return false;
    return x.questions.every(function (q) {
      return q && BD.READ_TYPES[q.type] && typeof q.q === "string" && typeof q.answer === "string" && typeof q.hint === "string" &&
        Array.isArray(q.keys) && q.keys.length >= 1 && q.keys.length <= 3 &&
        q.keys.every(function (g) { return Array.isArray(g) && g.length && g.every(function (k) { return typeof k === "string" && k.length < 30; }); });
    });
  }
  function topUp(p, grade) {
    const sampler = BD.Sensei && BD.Sensei.sampler();
    if (generating || Date.now() - lastTry < 90000 || !sampler || typeof sampler.json !== "function") return;
    const seen = p.seenPassages;
    const unseen = BD.PASSAGES.filter(function (x) { return x.grade === grade; }).concat(bankItems(grade)).filter(function (x) { return seen.indexOf(x.id) === -1; }).length;
    if (unseen >= 4) return;
    generating = true; lastTry = Date.now();
    const w = weights(p, grade);
    const focus = Object.keys(w).sort(function (a, b) { return w[b] - w[a]; }).slice(0, 2).map(function (k) { return BD.READ_TYPES[k].label.toLowerCase(); });
    const titles = BD.PASSAGES.concat(bankItems(grade)).map(function (x) { return x.title; }).slice(-40).join("; ");
    const ex = BD.PASSAGES.find(function (x) { return x.grade === grade; }) || BD.PASSAGES[0];
    const words = { "-1": "25-40", 0: "30-50", 1: "40-60", 2: "50-70", 3: "60-80", 4: "80-100", 5: "90-110", 6: "100-120", 7: "110-130", 8: "120-150" }[grade];
    const prompt = [
      "Write 3 NEW short reading passages for a homeschool reading-comprehension game, " + BD.gradeLabel(grade) + "." + (grade <= 0 ? " These are read aloud by a grown-up: very short, simple sentences and easy questions." : ""),
      "- Each passage: " + words + " words, one paragraph, original, accurate, kid-appropriate. Mix fiction (with a clear problem and feelings) and nonfiction (science, history, nature, sports, karate, US places).",
      "- Don't repeat these titles or topics: " + titles + ".",
      "- Each passage has exactly 3 questions. Types: main (main idea, summary or theme), detail (answer is stated in the text), infer (reading between the lines: why, how did they feel, what will happen), vocab (meaning of a word or phrase from context). Always include one main question. Lean toward: " + focus.join(" and ") + ".",
      "- answer: a strong 1-2 sentence answer a " + BD.gradeLabel(grade) + " student could write (or say).",
      "- hint: points to the part of the passage to reread, without giving the answer.",
      "- keys: 1 to 3 groups of short lowercase words or word stems. A correct answer contains at least one word from each group (example: [[\"bee\",\"pollinat\"],[\"food\",\"fruit\"]]).",
      "Reply with only a JSON array of objects shaped like this example:",
      JSON.stringify({ title: ex.title, text: ex.text, questions: ex.questions })
    ].join("\n");
    sampler.json(prompt, { cache: false }).then(function (arr) {
      if (!Array.isArray(arr)) return;
      const good = arr.filter(validPassage).map(function (x) {
        return { id: "air-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), grade: grade, title: x.title.slice(0, 80), text: x.text,
          questions: x.questions.map(function (q) { return { type: q.type, q: q.q, answer: q.answer, hint: q.hint, keys: q.keys.map(function (g) { return g.map(function (k) { return k.toLowerCase(); }); }) }; }), source: "ai" };
      });
      if (good.length) addToBank(grade, good);
    }).catch(function (e) {
      if (e && ["not_granted", "sampling_disabled", "not_declared"].indexOf(e.code) !== -1) lastTry = Date.now() + 3600000;
    }).then(function () { generating = false; });
  }

  /* ---------- checking an answer ---------- */
  function keywordCheck(q, answer) {
    const a = " " + answer.toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ") + " ";
    const groups = q.keys || [];
    const hit = groups.filter(function (g) { return g.some(function (k) { return a.indexOf(k.toLowerCase()) !== -1; }); }).length;
    const score = !groups.length ? 1 : hit === groups.length ? 2 : hit > 0 ? 1 : 0;
    const feedback = score === 2 ? "Nice work! Your answer has the key idea."
      : score === 1 ? "You're on the right track, but something important is missing. " + q.hint
      : "Not quite yet. " + q.hint;
    return { score: score, feedback: feedback };
  }

  function senseiCheck(passage, q, answer, attempt) {
    const sampler = BD.Sensei && BD.Sensei.sampler();
    if (!sampler || typeof sampler.json !== "function") return Promise.reject({ code: "unavailable" });
    const prompt = [
      "You are Sensei, a warm, encouraging reading tutor. Check a " + BD.gradeLabel(R.grade) + " student's answer to a reading-comprehension question.",
      "Passage title: " + passage.title,
      "Passage: " + passage.text,
      "Question (" + BD.READ_TYPES[q.type].label + "): " + q.q,
      "A strong answer: " + q.answer,
      "Student's answer (attempt " + attempt + " of " + TRIES + "): " + answer.slice(0, 600),
      "",
      "Grade the MEANING, not spelling or grammar. Accept any answer that shows the same understanding, even in different words or with extra true details.",
      "score: 2 = got the key idea; 1 = partly right or too vague; 0 = wrong, off-topic, or doesn't answer the question.",
      "feedback: 1-3 short sentences to the student, in simple words. Say something specific they did well. If score < 2, nudge them toward what's missing and which part of the passage to reread, WITHOUT giving the answer. Don't use markdown.",
      "Reply with only JSON: {\"score\": 0|1|2, \"feedback\": \"...\"}"
    ].join("\n");
    return sampler.json(prompt, { modelTier: "quick", cache: false }).then(function (res) {
      const s = Number(res && res.score);
      if (!(s === 0 || s === 1 || s === 2) || typeof res.feedback !== "string") throw { code: "bad_reply" };
      return { score: s, feedback: res.feedback.slice(0, 600), sensei: true };
    });
  }

  /* ---------- playing ---------- */
  /* Belt passages: lower belts can draw from the grade below, higher belts from the grade above. */
  function beltPassages(p, grade, beltIndex) {
    const out = [];
    for (let i = 0; i < PASSAGES_PER_ROUND; i++) {
      const g = BD.Rank.itemGrade(grade, beltIndex);
      const pool = choose(p, g, null).concat(choose(p, grade, null)).filter(function (x) { return out.indexOf(x) === -1; });
      if (pool.length) out.push(pool[0]);
    }
    return out;
  }

  /* stripe = { grade, belt, test } when started from the belt panel. */
  function start(focus, stripe) {
    const p = BD.Store.current();
    if (typeof focus !== "string") focus = null;
    if (stripe) p.readingGrade = stripe.grade;
    else if (p.retry && p.retry.reading) p.readingGrade = p.retry.reading.grade;
    const grade = p.readingGrade;
    R = { grade: grade, focus: focus, passages: stripe ? beltPassages(p, grade, stripe.belt) : choose(p, grade, focus), pi: 0, qi: 0, xp: 0, results: [], stripe: stripe || null, test: !!(stripe && stripe.test) };
    BD.UI.show("screen-read-play");
    BD.UI.testMode("screen-read-play", R.test ? "Comprehension stripe test" : stripe ? "Comprehension stripe practice · " + BD.BELTS[stripe.belt].name + " Belt" : "");
    BD.Cast.say("readSay", "start");
    loadPassage();
    topUp(p, grade);
  }

  function passage() { return R.passages[R.pi]; }
  function question() { return passage().questions[R.qi]; }

  function loadPassage() {
    const ps = passage();
    $("readTitle").textContent = ps.title;
    $("readText").textContent = ps.text;
    BD.Speech.stop();
    $("readListen").hidden = !BD.Speech.available;
    if (R.grade <= 1) BD.Cast.say("readSay", null, "Read this story together with a grown-up, or tap Read it to me.");
    BD.UI.syncGradeSelect("readGradeSel", "reading");
    loadQuestion();
  }

  function loadQuestion() {
    const q = question();
    R.tries = 0; R.best = 0; R.done = false; R.busy = false; R.usedHint = false;
    const total = R.passages.reduce(function (a, x) { return a + x.questions.length; }, 0);
    const n = R.passages.slice(0, R.pi).reduce(function (a, x) { return a + x.questions.length; }, 0) + R.qi + 1;
    $("readProgress").textContent = "Question " + n + " of " + total;
    $("readScore").textContent = R.xp + " XP";
    $("readQType").textContent = BD.READ_TYPES[q.type].label;
    $("readQType").className = "q-type q-" + q.type;
    $("readQuestion").textContent = q.q;
    $("readInput").value = ""; $("readInput").readOnly = false;
    $("readFeedback").innerHTML = ""; $("readFeedback").className = "read-feedback";
    $("readCheck").hidden = false; $("readCheck").disabled = false; $("readCheck").textContent = "Check my answer";
    $("readNext").hidden = true;
    $("readHint").hidden = false; $("readHint").disabled = false;
    $("readTries").textContent = "";
    if (R.qi === 0) window.scrollTo(0, 0);
  }

  function hint() {
    if (R.done) return;
    $("readFeedback").className = "read-feedback hinting";
    $("readFeedback").innerHTML = '<p><strong>Hint:</strong> ' + BD.UI.esc(question().hint) + '</p>';
    $("readHint").disabled = true; R.usedHint = true;
  }

  function check() {
    if (R.done || R.busy) return;
    const ps = passage(), q = question();
    const answer = $("readInput").value.trim();
    if (answer.split(/\s+/).filter(Boolean).length < 2) {
      $("readFeedback").className = "read-feedback try-again";
      $("readFeedback").innerHTML = "<p>Write your answer in a full sentence, in your own words.</p>";
      $("readInput").focus();
      return;
    }
    R.busy = true; R.tries++;
    $("readCheck").disabled = true; $("readCheck").textContent = "Checking…";
    $("readFeedback").className = "read-feedback thinking";
    $("readFeedback").innerHTML = "<p>Sensei is reading your answer…</p>";
    senseiCheck(ps, q, answer, R.tries).catch(function () { return keywordCheck(q, answer); }).then(function (res) {
      R.busy = false;
      R.best = Math.max(R.best, res.score);
      showResult(res, answer);
    });
  }

  function showResult(res, answer) {
    const q = question();
    const label = res.score === 2 ? "Got it!" : res.score === 1 ? "Partly there" : "Not yet";
    const finished = res.score === 2 || R.tries >= (R.test ? 1 : TRIES);
    let html = '<p class="verdict v' + res.score + '">' + label + '</p><p>' + BD.UI.esc(res.feedback) + '</p>';
    if (finished) {
      R.done = true;
      const p = BD.Store.current();
      const gain = Math.max(0, XP[Math.min(R.tries, TRIES) - 1][res.score] - (R.usedHint ? 5 : 0));
      R.xp += gain;
      R.results.push({ type: q.type, best: R.best, q: q.q, answer: q.answer });
      record(p, R.grade, q.type, R.best === 2 && R.tries === 1 && !R.usedHint);
      const st = p.readStats[R.grade] || (p.readStats[R.grade] = { r: 0, w: 0 });
      if (R.best === 2) st.r++; else st.w++;
      BD.Store.save(p);
      if (res.score === 2) BD.Sound.right(); else BD.Sound.wrong();
      html += (gain ? '<p class="xp-line">+' + gain + ' XP</p>' : '') +
        '<div class="model"><span class="label">A strong answer</span><p>' + BD.UI.esc(q.answer) + '</p></div>';
      $("readCheck").hidden = true; $("readHint").hidden = true; $("readNext").hidden = false;
      $("readInput").readOnly = true;
      const last = R.pi === R.passages.length - 1 && R.qi === passage().questions.length - 1;
      $("readNext").textContent = last ? "See results" : R.qi === passage().questions.length - 1 ? "Next story" : "Next question";
      setTimeout(function () { $("readNext").focus(); }, 50);
    } else {
      BD.Sound.wrong();
      html += '<p class="muted small">Change your answer and check again. You have ' + (TRIES - R.tries) + ' more try.</p>';
      $("readCheck").disabled = false; $("readCheck").textContent = "Check again";
      $("readInput").focus();
    }
    $("readFeedback").className = "read-feedback v" + res.score;
    BD.Cast.say("readSay", res.score === 2 ? "right" : "wrong");
    $("readFeedback").innerHTML = html;
    R.usedHint = finished ? false : R.usedHint;
  }

  function next() {
    if (R.qi < passage().questions.length - 1) { R.qi++; return loadQuestion(); }
    // passage finished
    const p = BD.Store.current(), id = passage().id;
    p.seenPassages = [id].concat(p.seenPassages.filter(function (x) { return x !== id; })).slice(0, 200);
    BD.Store.save(p);
    if (R.pi < R.passages.length - 1) { R.pi++; R.qi = 0; return loadPassage(); }
    finish();
  }

  function finish() {
    const p = BD.Store.current(), grade = R.grade;
    const max = R.results.length * 2;
    const pts = R.results.reduce(function (a, x) { return a + x.best; }, 0);
    const acc = Math.round(100 * pts / max);
    const full = R.results.filter(function (x) { return x.best === 2; }).length;
    if (R.test) {
      p.seenPassages = R.passages.map(function (x) { return x.id; }).concat(p.seenPassages).slice(0, 200);
      const review = R.results.filter(function (x) { return x.best < 2; }).map(function (x) { return x.q + " → " + x.answer; });
      BD.UI.stripeResult({ subject: "comprehension", grade: grade, pct: acc, score: pts + " / " + max + " points", review: review, again: function () { start(null, { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: true }); } });
      return;
    }
    const stripeAgain = R.stripe ? { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: false } : null;
    if (acc === 100) R.xp += 25;
    const failed = acc < PASS;
    p.retry = p.retry || {};
    const wasRetry = !!p.retry.reading;
    p.retry.reading = failed ? { grade: grade } : null;
    const belt = BD.Rank.practice(p, "reading", grade, R.xp);
    BD.Store.recordSession(p, { game: "reading", grade: grade, correct: full, total: R.results.length, xp: R.xp, score: acc });
    const weakTypes = [];
    R.results.forEach(function (x) { if (x.best < 2 && weakTypes.indexOf(x.type) === -1) weakTypes.push(x.type); });
    const ready = !failed && acc >= 90 && grade < BD.MAX_GRADE;
    BD.UI.results({
      title: failed ? "Let's train this again" : wasRetry ? "Level passed!" : acc >= 90 ? "Outstanding reading!" : "Strong reading!",
      subtitle: "Story Scrolls · " + BD.gradeLabel(grade) + (R.focus ? " · Focus: " + BD.READ_TYPES[R.focus].label : ""),
      failed: failed ? "You scored " + acc + "%. You need " + PASS + "% to pass " + BD.gradeLabel(grade) + ". Read the reading tips below, then try two new stories at this level." : null,
      passedRetry: wasRetry && !failed ? "You passed with " + acc + "%. All grade levels are unlocked again." : null,
      stats: [["Got it", full + " / " + R.results.length], ["Score", acc + "%"], ["Stories", R.passages.length], ["XP earned", "+" + R.xp]],
      belt: belt,
      lesson: weakTypes.length ? tipsHTML(weakTypes) : "",
      listTitle: "", list: [],
      levelUp: ready ? { text: "You scored " + acc + "% at " + BD.gradeLabel(grade) + ". Ready for " + BD.gradeLabel((grade + 1)) + " stories?", action: function () { p.readingGrade = grade + 1; BD.Store.save(p); start(); } } : null,
      again: function () { start(null, stripeAgain); },
      againLabel: failed ? "Redo this level" : "Two new stories",
      setup: null
    });
  }

  function tipsHTML(types) {
    return types.map(function (t) {
      const r = BD.READ_TYPES[t];
      return '<div class="tip"><h3><span class="q-type q-' + t + '">' + r.label + '</span></h3><ul>' + r.tips.map(function (x) { return "<li>" + BD.UI.esc(x) + "</li>"; }).join("") + '</ul></div>';
    }).join("");
  }

  function senseiContext() {
    const ps = passage(), q = question();
    return {
      title: q.q, grade: R.grade, revealed: R.done,
      chips: R.done ? ["Why is that the answer?", "How do I get better at this kind of question?", "Explain it a different way"]
                    : ["Where should I look in the story?", "What does this question mean?", "Is my answer on the right track?"],
      facts: "Reading-comprehension exercise. Passage \"" + ps.title + "\": " + ps.text + "\nQuestion (" + BD.READ_TYPES[q.type].label + "): " + q.q +
        "\nA strong answer: " + q.answer + "\nStudent's answer so far: \"" + $("readInput").value + "\"\n" +
        (R.done ? "This question is finished and the strong answer has been shown." : "The student is still working on it.")
    };
  }

  /* ---------- Sensei's plan items for reading ---------- */
  function planItems(p) {
    const items = [];
    if (p.retry && p.retry.reading) return [{ kind: "readRetry", title: "Pass " + BD.gradeLabel(p.retry.reading.grade) + " Story Scrolls", sub: "Score 70% to unlock other grades." }];
    const g = p.readingGrade;
    const rates = Object.keys(BD.READ_TYPES).map(function (t) { const a = (p.readRecent[g] || {})[t]; return { t: t, n: a ? a.length : 0, r: BD.Coach.rate(a) }; }).filter(function (x) { return x.n >= 3; });
    const weak = rates.filter(function (x) { return x.r < 0.7; }).sort(function (a, b) { return a.r - b.r; })[0];
    if (weak) items.push({ kind: "readFocus", type: weak.t, title: "Practice " + BD.READ_TYPES[weak.t].label.toLowerCase() + " questions", sub: BD.gradeLabel(g) + " stories · " + Math.round(weak.r * 100) + "% lately." });
    else if (g < BD.MAX_GRADE && rates.length >= 3 && rates.every(function (x) { return x.r >= 0.85 && x.n >= 5; }))
      items.push({ kind: "readUp", grade: g + 1, title: "Ready for " + BD.gradeLabel((g + 1)) + " stories", sub: "You're understanding almost everything at " + BD.gradeLabel(g) + "." });
    else if (!p.sessions.some(function (x) { return x.game === "reading"; })) items.push({ kind: "readStart", title: "Try Story Scrolls", sub: "Read two short stories and answer in your own words." });
    return items;
  }

  function stop() { R = null; BD.Speech.stop(); }
  function changeGrade(g) {
    const focus = R && R.focus;
    if (!BD.UI.setGrade("reading", g)) { BD.UI.syncGradeSelect("readGradeSel", "reading"); return; }
    start(focus);
  }

  function bind() {
    $("readCheck").addEventListener("click", check);
    $("readHint").addEventListener("click", hint);
    $("readNext").addEventListener("click", next);
    $("readQuit").addEventListener("click", BD.UI.back);
    $("readGradeSel").addEventListener("change", function (e) { changeGrade(Number(e.target.value)); });
    $("readListen").addEventListener("click", function () {
      if (BD.Speech.speaking()) { BD.Speech.stop(); return; }
      if (R) BD.Speech.say(passage().title + ". " + passage().text + " " + question().q, "en-US", 0.88);
    });
    $("readTips").addEventListener("click", function () { BD.UI.sheet("Reading tips", tipsHTML(Object.keys(BD.READ_TYPES))); });
    $("readAsk").addEventListener("click", function () { if (R) BD.Sensei.open(senseiContext()); });
  }

  function peek() { return R && R.passages[R.pi] && R.passages[R.pi].questions[R.qi]; }

  return { peek: peek, stop: stop, start: start, bind: bind, applyRemoteBank: applyRemoteBank, planItems: planItems, keywordCheck: keywordCheck, validPassage: validPassage, PASS: PASS, bankItems: bankItems };
})();
