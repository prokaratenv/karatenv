/* STORY SCROLLS — read a short passage and answer questions in your own words.
   Feedback comes from Sensei (Claude) when available, otherwise from the
   built-in keyword check. New passages are written by Claude when the bank
   for a grade runs low, aimed at the kinds of questions the child misses. */
window.BD = window.BD || {};

BD.Reading = (function () {
  const PASSAGES_PER_ROUND = 1, TRIES = 2, PASS = 60; // one story (3 questions) per round; one miss is never a fail
  const XP = [[0, 15, 30], [0, 10, 20]]; // [try][score]: typed answers take longer, so they earn more
  /* "Partly there" counts most of a question: 1 = got it, 0.75 = partly, 0 = not yet. */
  function credit(best) { return best === 2 ? 1 : best === 1 ? 0.75 : 0; }
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

  /* Hand-written (and Claude-written) passages the student hasn't read come
     first; after that, BD.StoryGen writes new ones, so the stories never run
     out and never repeat. */
  function unseenWritten(p, grade, focus, exclude) {
    const w = weights(p, grade, focus);
    const all = BD.PASSAGES.filter(function (x) { return x.grade === grade; }).concat(bankItems(grade));
    const seen = p.seenPassages || [], skip = (exclude || []).map(function (x) { return x.id; });
    const score = function (x) { return x.questions.reduce(function (a, q) { return a + (w[q.type] || 1); }, 0) * (0.7 + Math.random() * 0.6); };
    return all.filter(function (x) { return seen.indexOf(x.id) === -1 && skip.indexOf(x.id) === -1; }).sort(function (a, b) { return score(b) - score(a); });
  }
  function choose(p, grade, focus) {
    const all = BD.PASSAGES.filter(function (x) { return x.grade === grade; }).concat(bankItems(grade));
    const seen = p.seenPassages;
    let pool = unseenWritten(p, grade, focus).slice(0, PASSAGES_PER_ROUND);
    if (pool.length < PASSAGES_PER_ROUND && BD.StoryGen) {
      try { pool = pool.concat(BD.StoryGen.pick(p, grade, PASSAGES_PER_ROUND - pool.length, focus || null, pool)); } catch (e) { /* fall back to rereading */ }
    }
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
      let next = unseenWritten(p, g, null, out)[0];
      if (!next && BD.StoryGen) { try { next = BD.StoryGen.pick(p, g, 1, null, out)[0]; } catch (e) { next = null; } }
      if (!next) next = choose(p, g, null).concat(choose(p, grade, null)).filter(function (x) { return out.indexOf(x) === -1; })[0];
      if (next) out.push(next);
    }
    return out;
  }

  /* One part of the Comprehension stripe test: 4 questions of one kind
     (main idea, details, reading between the lines, word meaning), from as few
     short stories as possible (stories are written to lean on that kind).
     Falls back to a whole story if that kind is rare. */
  function partPassages(p, grade, beltIndex, type) {
    const out = [], seen = [];
    let n = 0;
    for (let k = 0; k < 6 && n < 4; k++) {
      const g = BD.Rank.itemGrade(grade, beltIndex);
      let x = null;
      if (BD.StoryGen) { try { x = BD.StoryGen.pick(p, g, 1, type, out.concat(seen.map(function (id) { return { id: id }; })))[0]; } catch (e) { x = null; } }
      if (!x) x = beltPassages(p, grade, beltIndex)[0];
      if (!x || seen.indexOf(x.id) !== -1) continue; seen.push(x.id);
      const qs = (x.questions || []).filter(function (q) { return q.type === type; }).slice(0, 4 - n);
      if (qs.length) { out.push(Object.assign({}, x, { questions: qs })); n += qs.length; }
    }
    if (n < 2) { const one = beltPassages(p, grade, beltIndex)[0]; return one ? [one] : out; }
    return out;
  }

  function start(focus, stripe) {
    const p = BD.Store.current();
    if (BD.Little && BD.Little.take("reading", stripe)) return; // Preschool and Pre-K: the Little Ninjas picture games
    if (stripe) stripe = BD.Rank.gate(p, "reading", stripe); // practice first: locked parts start as practice
    if (typeof focus !== "string") focus = null;
    if (stripe) p.readingGrade = stripe.grade;
    else if (p.retry && p.retry.reading) p.readingGrade = p.retry.reading.grade;
    const grade = p.readingGrade;
    R = { grade: grade, focus: focus, passages: stripe ? (stripe.test && stripe.skill && stripe.skill.type ? partPassages(p, grade, stripe.belt, stripe.skill.type) : beltPassages(p, grade, stripe.belt)) : choose(p, grade, focus), pi: 0, qi: 0, xp: 0, results: [], stripe: stripe || null, test: !!(stripe && stripe.test) };
    BD.UI.show("screen-read-play");
    BD.UI.testMode("screen-read-play", R.test ? "Comprehension stripe test" + (stripe.skill ? " · Part " + (stripe.part + 1) + " of 4: " + stripe.skill.label : "") : stripe ? "Comprehension stripe practice · " + BD.BELTS[stripe.belt].name + " Belt" : "", R.test);
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
    const ok = BD.ReadAloud.readingOK(R.grade);
    $("readListen").hidden = !BD.Speech.available || !ok;
    $("readQRead").hidden = !ok;
    $("readListen").textContent = "Read the story";
    $("readQRead").setAttribute("aria-label", "Read the question"); $("readQRead").title = "Read the question";
    R.autoStory = true; // read-along: the first question of a story also reads the story (when reading is automatic)
    if (R.grade <= 1) BD.Cast.say("readSay", null, "Read this story together with a grown-up, or tap Read the story.");
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
    if (BD.ReadAloud.auto(R.grade) && BD.ReadAloud.readingOK(R.grade)) {
      const withStory = R.autoStory; R.autoStory = false;
      setTimeout(function () { if (R && question() === q) { if (withStory) readStory(); else readQuestion(); } }, 300);
    }
    $("readInput").value = ""; $("readInput").readOnly = false;
    $("readFeedback").innerHTML = ""; $("readFeedback").className = "read-feedback";
    $("readCheck").hidden = false; $("readCheck").disabled = false; $("readCheck").textContent = "Check my answer";
    $("readNext").hidden = true;
    $("readHint").hidden = true; // the Hint bar replaces the old single hint
    if (R.marked) { R.marked = false; $("readText").textContent = passage().text; }
    BD.Hints.bar($("readFeedback").parentNode, "read", $("readFeedback"));
    BD.Hints.reset("read", storyHints(q), { grade: R.grade, off: R.test });
    $("readTries").textContent = "";
    if (BD.ReadAlong) BD.ReadAlong.mic.sync($("readInput"));
    if (R.qi === 0) window.scrollTo(0, 0);
  }

  /* Read-along (js/readalong.js): the story, then the question, word by word. */
  function readStory() {
    if (!R || !BD.ReadAloud.readingOK(R.grade)) return;
    if (!R) return;
    BD.ReadAloud.read([$("readTitle"), $("readText"), $("readQuestion")], { id: "story", button: $("readListen"), stopLabel: "■ Stop" });
  }
  function readQuestion() {
    if (!R || !BD.ReadAloud.readingOK(R.grade)) return;
    if (!R) return;
    BD.ReadAloud.read($("readQuestion"), { id: "question", button: $("readQRead") });
  }

  /* 2 hints: 1) highlight the sentence in the story where the answer is,
     2) a key word the answer should use. */
  function bestSentence(q) {
    const ps = passage(), sents = ps.text.match(/[^.!?]+[.!?]+["”']?\s*|[^.!?]+$/g) || [ps.text];
    const keys = [].concat.apply([], q.keys || []).map(function (k) { return String(k).toLowerCase(); });
    const qw = String(q.q).toLowerCase().match(/[a-z]{4,}/g) || [];
    let best = 0, bi = 0;
    sents.forEach(function (t, i) {
      const low = t.toLowerCase();
      const sc = keys.filter(function (k) { return k && low.indexOf(k) !== -1; }).length * 3 + qw.filter(function (w) { return low.indexOf(w) !== -1; }).length;
      if (sc > best) { best = sc; bi = i; }
    });
    return { sents: sents, i: bi, found: best > 0 };
  }
  function storyHints(q) {
    return function (level) {
      R.usedHint = true;
      if (level === 1) {
        const b = bestSentence(q);
        return { html: BD.UI.esc(q.hint) + (b.found ? ' <span class="muted">Look at the highlighted part of the story.</span>' : ''), text: q.hint,
          act: function () {
            if (!b.found) return;
            if (BD.ReadAlong && BD.ReadAlong.stop) BD.ReadAlong.stop();
            $("readText").innerHTML = b.sents.map(function (t, i) { return i === b.i ? '<mark class="hint-mark">' + BD.UI.esc(t) + '</mark>' : BD.UI.esc(t); }).join("");
            R.marked = true;
            const m = $("readText").querySelector(".hint-mark"); if (m && m.scrollIntoView) m.scrollIntoView({ block: "center", behavior: "smooth" });
          } };
      }
      const typed = " " + $("readInput").value.toLowerCase() + " ";
      const groups = (q.keys || []).filter(function (g) { return g.length && !g.some(function (k) { return typed.indexOf(String(k).toLowerCase()) !== -1; }); });
      if (groups.length) return { html: 'Your answer should use an idea like <strong>"' + BD.UI.esc(groups[0][0]) + '"</strong>.', text: "Your answer should use an idea like " + groups[0][0] + "." };
      const start = String(q.answer).split(/\s+/).slice(0, 3).join(" ");
      return { html: 'Try starting your answer like this: <strong>' + BD.UI.esc(start) + '…</strong>', text: "Try starting your answer with: " + start };
    };
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
      const gain = Math.max(0, Math.round(XP[Math.min(R.tries, TRIES) - 1][res.score] * BD.Hints.factor(BD.Hints.used("read"))));
      BD.Hints.close("read");
      R.xp += gain;
      if (!R.test && res.score > 0 && BD.Correct) BD.Correct.hit(p);
      R.results.push({ type: q.type, best: R.best, q: q.q, answer: q.answer });
      record(p, R.grade, q.type, R.best === 2 && R.tries === 1 && !R.usedHint);
      if (BD.StoryGen && BD.StoryGen.note) BD.StoryGen.note(q.type, R.best === 2 && R.tries === 1 && !R.usedHint, R.grade);
      const st = p.readStats[R.grade] || (p.readStats[R.grade] = { r: 0, w: 0 });
      if (R.best === 2) st.r++; else st.w++;
      BD.Store.save(p);
      if (res.score === 2) BD.Sound.right(); else BD.Sound.wrong();
      html += (gain ? '<p class="xp-line">+' + gain + ' XP</p>' : '') +
        '<div class="model"><span class="label">A strong answer</span><p>' + BD.UI.esc(q.answer) + '</p></div>';
      $("readCheck").hidden = true; $("readHint").hidden = true; $("readNext").hidden = false;
      $("readInput").readOnly = true;
      if (BD.ReadAlong) BD.ReadAlong.mic.sync($("readInput"));
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
    const max = R.results.length;
    const pts = R.results.reduce(function (a, x) { return a + credit(x.best); }, 0);
    const acc = Math.round(100 * pts / Math.max(1, max));
    const full = R.results.filter(function (x) { return x.best === 2; }).length;
    if (R.test) {
      p.seenPassages = R.passages.map(function (x) { return x.id; }).concat(p.seenPassages).slice(0, 200);
      const review = R.results.filter(function (x) { return x.best < 2; }).map(function (x) { return x.q + " → " + x.answer; });
      // Story tests: everything right but one question passes (3 of 4, 4 of 5, 5 of 6), even below the % bar.
      const passPct = R.results.length >= 3 && pts >= R.results.length - 1 ? Math.max(acc, BD.Rank.PASS) : acc;
      BD.UI.stripeResult({ subject: "comprehension", grade: grade, part: R.stripe ? R.stripe.part : undefined, pct: passPct, realPct: acc, oneMiss: passPct > acc, score: (Math.round(pts * 4) / 4) + " / " + max + " questions", review: review, again: function () { start(null, Object.assign({}, R.stripe, { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: true })); } });
      return;
    }
    const stripeAgain = R.stripe ? { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: false } : null;
    if (acc === 100) R.xp += 25;
    const failed = acc < PASS;
    p.retry = p.retry || {};
    const wasRetry = !!p.retry.reading;
    p.retry.reading = failed ? { grade: grade } : null;
    const belt = BD.Rank.practice(p, "reading", grade, R.xp - (R.banked || 0)); R.banked = R.xp;
    BD.Store.recordSession(p, { game: "reading", grade: grade, correct: full, total: R.results.length, xp: R.xp, score: acc });
    const weakTypes = [];
    R.results.forEach(function (x) { if (x.best < 2 && weakTypes.indexOf(x.type) === -1) weakTypes.push(x.type); });
    const ready = !failed && acc >= 90 && grade < BD.MAX_GRADE;
    BD.UI.results({
      title: failed ? "Let's train this again" : wasRetry ? "Level passed!" : acc >= 90 ? "Outstanding reading!" : "Strong reading!",
      subtitle: "Story Scrolls · " + BD.gradeLabel(grade) + (R.focus ? " · Focus: " + BD.READ_TYPES[R.focus].label : ""),
      failed: failed ? "You scored " + acc + "%. You need " + PASS + "% to pass " + BD.gradeLabel(grade) + ". Read the reading tips below, then try a new story at this level." : null,
      passedRetry: wasRetry && !failed ? "You passed with " + acc + "%. All grade levels are unlocked again." : null,
      stats: [["Got it", full + " / " + R.results.length], ["Score", acc + "%"], ["Stories", R.passages.length], ["XP earned", "+" + R.xp]],
      belt: belt,
      lesson: weakTypes.length ? tipsHTML(weakTypes) : "",
      listTitle: "", list: [],
      levelUp: ready ? { text: "You scored " + acc + "% at " + BD.gradeLabel(grade) + ". Ready for " + BD.gradeLabel((grade + 1)) + " stories?", action: function () { p.readingGrade = grade + 1; BD.Store.save(p); start(); } } : null,
      again: function () { start(null, stripeAgain); },
      againLabel: failed ? "Redo this level" : "New story",
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
    if (p.retry && p.retry.reading) return [{ kind: "readRetry", title: "Pass " + BD.gradeLabel(p.retry.reading.grade) + " Story Scrolls", sub: "Score " + PASS + "% to unlock other grades." }];
    const g = p.readingGrade;
    const rates = Object.keys(BD.READ_TYPES).map(function (t) { const a = (p.readRecent[g] || {})[t]; return { t: t, n: a ? a.length : 0, r: BD.Coach.rate(a) }; }).filter(function (x) { return x.n >= 3; });
    const weak = rates.filter(function (x) { return x.r < 0.7; }).sort(function (a, b) { return a.r - b.r; })[0];
    if (weak) items.push({ kind: "readFocus", type: weak.t, title: "Practice " + BD.READ_TYPES[weak.t].label.toLowerCase() + " questions", sub: BD.gradeLabel(g) + " stories · " + Math.round(weak.r * 100) + "% lately." });
    else if (g < BD.MAX_GRADE && rates.length >= 3 && rates.every(function (x) { return x.r >= 0.85 && x.n >= 5; }))
      items.push({ kind: "readUp", grade: g + 1, title: "Ready for " + BD.gradeLabel((g + 1)) + " stories", sub: "You're understanding almost everything at " + BD.gradeLabel(g) + "." });
    else if (!p.sessions.some(function (x) { return x.game === "reading"; })) items.push({ kind: "readStart", title: "Try Story Scrolls", sub: "Read a short story and answer in your own words." });
    return items;
  }

  function stop() { if (R) BD.Rank.bank(R, "reading"); R = null; BD.Speech.stop(); }
  function bankNow() { if (R) BD.Rank.bank(R, "reading"); }
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
    $("readQRead").addEventListener("click", function () {
      if (BD.ReadAlong && BD.ReadAlong.active() === "question") { BD.ReadAlong.stop(); return; }
      readQuestion();
    });
    $("readListen").addEventListener("click", function () {
      if (BD.ReadAlong ? BD.ReadAlong.active() === "story" : BD.Speech.speaking()) { BD.Speech.stop(); return; }
      readStory();
    });
    $("readTips").addEventListener("click", function () { BD.UI.sheet("Reading tips", tipsHTML(Object.keys(BD.READ_TYPES))); });
    $("readAsk").addEventListener("click", function () { if (R) BD.Sensei.open(senseiContext()); });
  }

  function peek() { return R && R.passages[R.pi] && R.passages[R.pi].questions[R.qi]; }

  return { bankNow: bankNow, peek: peek, stop: stop, start: start, bind: bind, applyRemoteBank: applyRemoteBank, planItems: planItems, keywordCheck: keywordCheck, validPassage: validPassage, PASS: PASS, bankItems: bankItems };
})();
