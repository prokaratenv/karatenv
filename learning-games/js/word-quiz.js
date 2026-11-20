/* WORD GAMES — Spanish Dojo and Spelling Bee share one quiz engine.
   Spanish: pick or type the matching word, hear it spoken.
   Spelling: hear the word, see it in a sentence, spell it (letter tiles help).
   Same rules as the other games: XP, streaks, missed words come back,
   70% to pass, lessons, grade changes and Sensei. */
window.BD = window.BD || {};

BD.WordQuiz = (function () {
  const ROUND = 10, PASS = 70;
  const $ = function (id) { return document.getElementById(id); };
  const r = function (n) { return Math.floor(Math.random() * n); };
  const shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
  const plain = function (s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[¿?¡!.,'"]/g, "").replace(/\s+/g, " ").trim(); };
  let W = null;

  /* ---------- Spanish ---------- */
  const spanish = {
    key: "spanish", title: "Spanish Dojo", coach: "lauryn", field: "spanishGrade",
    topics: function (grade) { return BD.SPANISH.filter(function (t) { return t.g <= grade; }); },
    round: function (p, grade) {
      const topics = this.topics(grade);
      const weighted = [];
      topics.forEach(function (t) { const n = t.g >= grade - 1 ? 3 : 1; for (let i = 0; i < n; i++) weighted.push(t); });
      const missed = Object.values((p.wordMissed.spanish || {})).filter(function (m) { return m.grade === grade; }).slice(0, 3);
      const items = missed.map(function (m) { return makeSpanish(topics.find(function (t) { return t.topic === m.topic; }), m.es, grade); }).filter(Boolean);
      const used = new Set(items.map(function (x) { return x.id; }));
      let guard = 0;
      while (items.length < ROUND && guard++ < 200) {
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
  const spelling = {
    key: "spelling", title: "Spelling Bee", coach: "michele", field: "spellingGrade",
    round: function (p, grade) {
      const list = BD.SPELLING[String(grade)] || [];
      const seen = (p.seenWords.spelling = p.seenWords.spelling || []);
      const missed = Object.values(p.wordMissed.spelling || {}).filter(function (m) { return m.grade === grade; }).map(function (m) { return m.word; });
      const fresh = list.filter(function (x) { return seen.indexOf(x[0]) === -1 && missed.indexOf(x[0]) === -1; });
      const order = missed.slice(0, 4).map(function (wd) { return list.find(function (x) { return x[0] === wd; }); }).filter(Boolean)
        .concat(shuffle(fresh)).concat(shuffle(list));
      const out = [], used = new Set();
      order.forEach(function (x) { if (out.length < ROUND && !used.has(x[0])) { used.add(x[0]); out.push(makeSpelling(x, grade)); } });
      return out;
    }
  };
  function makeSpelling(x, grade) {
    const word = x[0], sentence = x[1];
    const full = sentence.replace("___", word);
    return {
      id: "spell:" + word, word: word, mode: "spell", label: "Spell the word",
      prompt: BD.Speech.available ? "Listen, then spell the word" : "Use the sentence and the letter tiles",
      sub: sentence.replace("___", "_____"),
      choices: null, answer: word,
      tiles: shuffle(word.split("")),
      tilesFirst: grade <= 1 || !BD.Speech.available,
      speakNow: { text: word + ". " + full + " " + word + ".", lang: "en-US" },
      speakAfter: { text: word, lang: "en-US" },
      explain: word + ": " + word.split("").join("-"),
      facts: "Spelling practice. The word is \"" + word + "\", used in the sentence: " + full
    };
  }

  /* Belt rounds: words drawn from the grades around the belt grade (harder as belts go up). */
  spelling.beltRound = function (p, grade, beltIndex) {
    const out = [], used = new Set();
    let guard = 0;
    while (out.length < ROUND && guard++ < 200) {
      const g = BD.Rank.itemGrade(grade, beltIndex), list = BD.SPELLING[String(g)] || BD.SPELLING[String(grade)];
      const x = list[r(list.length)];
      if (used.has(x[0])) continue;
      used.add(x[0]); out.push(makeSpelling(x, grade));
    }
    return out;
  };
  spanish.beltRound = function (p, grade, beltIndex) {
    const out = [], used = new Set();
    let guard = 0;
    while (out.length < ROUND && guard++ < 300) {
      const topics = this.topics(BD.Rank.itemGrade(grade, beltIndex));
      const pool = topics.length ? topics : this.topics(grade);
      const t = pool[r(pool.length)], w = t.words[r(t.words.length)];
      if (used.has(t.topic + ":" + w[0])) continue;
      used.add(t.topic + ":" + w[0]);
      out.push(makeSpanish(t, w[0], grade + (beltIndex >= 6 ? 2 : beltIndex >= 3 ? 1 : 0)));
    }
    return out;
  };

  const GAMES = { spanish: spanish, spelling: spelling };

  /* ---------- play ---------- */
  /* stripe = { grade, belt, test } when started from the belt panel. */
  function start(game, stripe) {
    const g = GAMES[game], p = BD.Store.current();
    if (stripe) p[g.field] = stripe.grade;
    else if (p.retry && p.retry[game]) p[g.field] = p.retry[game].grade;
    const grade = p[g.field];
    W = { game: game, g: g, grade: grade, items: stripe ? g.beltRound(p, grade, stripe.belt) : g.round(p, grade), i: 0, xp: 0, correct: 0, firstTry: 0, answered: 0, streak: 0, best: 0, missed: [], stripe: stripe || null, test: !!(stripe && stripe.test) };
    const label = BD.Rank.subject(BD.Rank.BY_GAME[game]).label;
    BD.UI.testMode("screen-word-play", W.test ? label + " stripe test" : stripe ? label + " stripe practice · " + BD.BELTS[stripe.belt].name + " Belt" : "", !BD.Rank.hintsAllowed(BD.Store.current(), grade));
    $("wordCoachFace").src = BD.Cast.face(g.coach);
    $("wordCoachName").textContent = BD.Cast.name(g.coach);
    BD.UI.syncGradeSelect("wordGradeSel", game);
    BD.UI.show("screen-word-play");
    BD.Cast.say("wordSay", "start");
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
    $("wordPrompt").innerHTML = (q.swatch ? '<span class="big-swatch" style="--sw:' + q.swatch + '"></span>' : "") +
      (q.pic ? '<span class="pic">' + BD.UI.esc(q.pic) + '</span>' : "") + '<span>' + BD.UI.esc(q.prompt) + '</span>';
    $("wordPrompt").className = "word-prompt" + (q.mode === "spell" ? " small" : "");
    $("wordSub").textContent = q.sub;
    $("wordListen").hidden = !BD.Speech.available || !q.speakNow; // never read out the answer early
    $("wordFeedback").innerHTML = ""; $("wordFeedback").className = "word-feedback";
    $("wordNext").hidden = true;
    const typed = !q.choices;
    $("wordType").hidden = !typed;
    $("wordChoices").hidden = typed;
    if (typed) {
      $("wordInput").value = ""; $("wordInput").readOnly = false;
      $("wordInput").placeholder = q.mode === "spell" ? "Type the word" : "Type the Spanish word";
      $("wordCheck").hidden = false; $("wordCheck").disabled = false;
      W.noHints = !BD.Rank.hintsAllowed(BD.Store.current(), W.grade);
      showTiles(q.tilesFirst && !W.noHints);
      $("wordTilesBtn").hidden = q.mode !== "spell" || q.tilesFirst;
      setTimeout(function () { $("wordInput").focus(); }, 60);
    } else {
      $("wordChoices").innerHTML = q.choices.map(function (c, i) {
        return '<button type="button" class="choice' + (c.swatch ? " has-swatch" : "") + '" data-i="' + i + '">' +
          (c.swatch ? '<span class="big-swatch sm" style="--sw:' + c.swatch + '"></span>' : "") + BD.UI.esc(c.value) + '</button>';
      }).join("");
    }
    if (q.speakNow) setTimeout(function () { BD.Speech.say(q.speakNow.text, q.speakNow.lang, 0.85); }, 250);
  }

  function showTiles(on) {
    const q = item();
    $("wordTiles").hidden = !on || !q.tiles;
    if (on && q.tiles) $("wordTiles").innerHTML = q.tiles.map(function (ch) { return '<button type="button" class="tile" data-ch="' + BD.UI.esc(ch) + '">' + BD.UI.esc(ch) + '</button>'; }).join("") +
      '<button type="button" class="tile tile-back" data-ch="back" aria-label="Delete">⌫</button>';
  }

  function judge(answer) {
    const q = item();
    if (q.mode === "spell") return answer.trim().toLowerCase() === q.answer.toLowerCase() ? "right" : "wrong";
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
    if (verdict === "wrong" && typed && W.tries < 2 && !W.test) {
      BD.Sound.wrong(); BD.Cast.say("wordSay", "wrong");
      $("wordFeedback").className = "word-feedback try-again";
      $("wordFeedback").innerHTML = "<p>Not quite. Try once more!</p>" + (q.mode === "spell" ? letterDiff(value, q.answer) : "");
      $("wordInput").select();
      return;
    }
    W.done = true; W.answered++;
    const ok = verdict !== "wrong";
    const st = ((p.wordStats[W.game] = p.wordStats[W.game] || {})[W.grade] = (p.wordStats[W.game][W.grade] || { r: 0, w: 0 }));
    const missKey = q.id;
    const bucket = (p.wordMissed[W.game] = p.wordMissed[W.game] || {});
    if (ok) {
      W.correct++; if (W.tries === 1) W.firstTry++;
      W.streak++; W.best = Math.max(W.best, W.streak);
      const gain = (W.tries === 1 ? 10 + Math.min(W.streak - 1, 10) : 5) - (W.usedTiles ? 5 : 0);
      W.xp += Math.max(2, gain); st.r++;
      if (bucket[missKey]) { bucket[missKey].misses--; if (bucket[missKey].misses <= 0) delete bucket[missKey]; }
      BD.Sound.right(); BD.Cast.say("wordSay", W.streak >= 3 && W.streak % 3 === 0 ? "streak" : "right");
      $("wordFeedback").className = "word-feedback solved";
      $("wordFeedback").innerHTML = '<p class="win-line">' + (W.game === "spanish" ? "¡Muy bien!" : "Spelled it!") + ' +' + Math.max(2, gain) + ' XP</p>' +
        (verdict === "accent" ? '<p>Watch the accent: <strong>' + BD.UI.esc(q.answer) + '</strong></p>' : "") +
        '<p>' + BD.UI.esc(q.explain) + '</p>';
    } else {
      W.streak = 0; st.w++; W.missed.push(q);
      bucket[missKey] = { grade: W.grade, misses: Math.min(3, ((bucket[missKey] && bucket[missKey].misses) || 0) + 2), topic: q.topic, es: q.es, word: q.word };
      if (!q.retry && !W.test) W.items.splice(Math.min(W.i + 3, W.items.length), 0, Object.assign({}, q, { retry: true }));
      BD.Sound.wrong(); BD.Cast.say("wordSay", "wrong");
      $("wordFeedback").className = "word-feedback revealed";
      $("wordFeedback").innerHTML = '<p>The answer is <strong>' + BD.UI.esc(q.answer) + '</strong>.</p><p>' + BD.UI.esc(q.explain) + '</p>' +
        (q.mode === "spell" ? letterDiff(value, q.answer) : "") + '<p class="muted small">This one will come back in a few turns.</p>';
    }
    if (q.choices) document.querySelectorAll("#wordChoices .choice").forEach(function (b) {
      const v = q.choices[Number(b.dataset.i)].value;
      b.disabled = true;
      if (v === q.answer) b.classList.add("is-right"); else if (v === value) b.classList.add("is-wrong");
    });
    if (!q.choices) { $("wordInput").readOnly = true; $("wordCheck").hidden = true; $("wordTilesBtn").hidden = true; }
    if (q.speakAfter && q.mode !== "spell") BD.Speech.say(q.speakAfter.text, q.speakAfter.lang, 0.85);
    $("wordScore").textContent = W.xp + " XP";
    $("wordListen").hidden = !BD.Speech.available;
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
      BD.UI.stripeResult({ subject: BD.Rank.BY_GAME[game], grade: grade, pct: acc, score: W.correct + " / " + W.answered, review: review, again: function () { start(game, { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: true }); } });
      return;
    }
    const stripeAgain = W.stripe ? { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: false } : null;
    if (acc === 100 && W.answered >= 8) W.xp += 25;
    const failed = acc < PASS;
    p.retry = p.retry || {};
    const wasRetry = !!p.retry[game];
    p.retry[game] = failed ? { grade: grade } : null;
    if (game === "spelling") {
      const seen = p.seenWords.spelling = p.seenWords.spelling || [];
      W.items.forEach(function (q) { if (q.word && seen.indexOf(q.word) === -1) seen.push(q.word); });
      p.seenWords.spelling = seen.slice(-300);
    }
    const belt = BD.Rank.practice(p, game, grade, W.xp);
    BD.Store.recordSession(p, { game: game, grade: grade, correct: W.correct, total: W.answered, xp: W.xp });
    const missed = [];
    W.missed.forEach(function (q) { if (!missed.some(function (m) { return m.id === q.id; })) missed.push(q); });
    const ready = !failed && acc >= 90 && grade < BD.MAX_GRADE;
    BD.UI.results({
      title: failed ? "Let's train this again" : wasRetry ? "Level passed!" : acc >= 90 ? (game === "spanish" ? "¡Excelente!" : "Spelling champion!") : "Strong work!",
      subtitle: g.title + " · " + BD.gradeLabel(grade),
      failed: failed ? "You got " + acc + "%. You need " + PASS + "% to pass " + BD.gradeLabel(grade) + ". Look over the words below, then try a new round." : null,
      passedRetry: wasRetry && !failed ? "You passed with " + acc + "%. All grade levels are unlocked again." : null,
      stats: [["Correct", W.correct + " / " + W.answered], ["First try", W.firstTry], ["Best streak", W.best], ["XP earned", "+" + W.xp]],
      belt: belt,
      lesson: missed.length ? '<div class="tip"><h3>Words to practice</h3><ul>' + missed.map(function (q) { return "<li>" + BD.UI.esc(q.explain) + "</li>"; }).join("") + '</ul>' +
        (game === "spelling" ? '<p class="muted small">Tip: say the word slowly, clap each part, then write it three times.</p>' : '<p class="muted small">Tip: say each word out loud. Tap Hear it to copy the sound.</p>') + '</div>' : "",
      listTitle: "", list: [],
      levelUp: ready ? { text: "You got " + acc + "% at " + BD.gradeLabel(grade) + ". Ready for " + BD.gradeLabel(grade + 1) + "?", action: function () { p[g.field] = grade + 1; BD.Store.save(p); start(game); } } : null,
      again: function () { start(game, stripeAgain); },
      againLabel: failed ? "Redo this level" : "Play again",
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
      title: q.mode === "spell" ? "Spelling: listen and spell" : q.prompt, grade: W.grade, revealed: W.done,
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

  function stop() { W = null; BD.Speech.stop(); }

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
      BD.Sound.tap();
    });
    $("wordTilesBtn").addEventListener("click", function () { if (!W) return; W.usedTiles = true; showTiles(true); $("wordTilesBtn").hidden = true; });
    $("wordListen").addEventListener("click", function () {
      if (!W) return; const q = item();
      const s = q.speakNow || q.speakAfter; BD.Speech.say(s.text, s.lang, 0.8);
    });
    $("wordNext").addEventListener("click", next);
    $("wordQuit").addEventListener("click", BD.UI.back);
    $("wordGradeSel").addEventListener("change", function (e) { changeGrade(Number(e.target.value)); });
    $("wordAsk").addEventListener("click", function () { if (W) BD.Sensei.open(senseiContext()); });
  }

  function peek() { return W && W.items[W.i]; }

  return { peek: peek, start: start, stop: stop, bind: bind, planItems: planItems, PASS: PASS, GAMES: GAMES, plain: plain };
})();
