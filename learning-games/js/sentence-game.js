/* FIX-IT SENTENCES — find and fix capitalization, punctuation, spelling and grammar. */
window.BD = window.BD || {};

BD.SentenceGame = (function () {
  const ROUND = 8, TRIES = 3, POINTS = [30, 20, 10], HINT_COST = 5, PASS = 70;
  const $ = function (id) { return document.getElementById(id); };
  let S = null;

  /* Treat curly quotes like straight ones and ignore extra spaces. */
  function norm(s) {
    return String(s).replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
      .replace(/\s+/g, " ").trim();
  }
  const words = function (s) { return norm(s).split(" ").filter(Boolean); };
  const answers = function (item) { return Array.isArray(item.answer) ? item.answer : [item.answer]; };

  /* Word-by-word comparison (longest common subsequence) so we can point at
     the words that still need work without giving away the fix. */
  function compare(user, target) {
    const a = words(user), b = words(target);
    const m = a.length, n = b.length;
    const L = [];
    for (let i = 0; i <= m; i++) { L.push(new Array(n + 1).fill(0)); }
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
      L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const ok = new Array(m).fill(false);
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (a[i] === b[j]) { ok[i] = true; i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
    }
    return { words: a, ok: ok, matched: L[0][0], missing: n - L[0][0] - ok.filter(function (x) { return !x; }).length };
  }

  /* Belt items: more mistakes per sentence as the belts go up, mixing in the grades around it. */
  function beltItems(grade, beltIndex, n, w) {
    const extra = beltIndex <= 2 ? -1 : beltIndex <= 5 ? 0 : 1, out = [], p = BD.Store.current();
    let guard = 0;
    while (out.length < n && guard++ < 60) {
      const it = BD.SentenceGen.make(BD.Rank.itemGrade(grade, beltIndex), w || { cap: 1, punct: 1, spell: 1, grammar: 1 }, extra, { p: p });
      if (it) out.push(it);
    }
    return out;
  }

  /* stripe = { grade, belt, test } when started from the belt panel. */
  function start(focus, stripe) {
    const p = BD.Store.current();
    if (typeof focus !== "string") focus = null;
    if (stripe) p.sentenceGrade = stripe.grade;
    else if (p.retry && p.retry.sentence) p.sentenceGrade = p.retry.sentence.grade;
    const items = stripe ? (stripe.test && stripe.skill ? beltItems(stripe.grade, stripe.belt, 5, stripe.skill.w) : beltItems(stripe.grade, stripe.belt, 8)) : BD.SentenceGen.round(p, p.sentenceGrade, BD.Kid && BD.Kid.young(p.sentenceGrade) ? 5 : ROUND, focus);
    S = { grade: p.sentenceGrade, items: items, training: items.training || null, focus: focus, i: 0, xp: 0, solved: 0, firstTry: 0, results: [], stripe: stripe || null, test: !!(stripe && stripe.test) };
    BD.UI.show("screen-sentence-play");
    BD.UI.testMode("screen-sentence-play", S.test ? "Reading stripe test" + (stripe.skill ? " · Part " + (stripe.part + 1) + " of 4: " + stripe.skill.label : "") : stripe ? "Reading stripe practice · " + BD.BELTS[stripe.belt].name + " Belt" : "", !BD.Rank.hintsAllowed(BD.Store.current(), S.grade));
    BD.Cast.say("sentSay", "start");
    load();
    BD.SentenceGen.topUp(p, S.grade); // ask Claude for more sentences if the bank is running low
  }

  function load() {
    const item = S.items[S.i];
    S.tries = 0; S.hints = 0; S.done = false; S.first = null; S.hintsAtFirst = 0;
    $("sentProgress").textContent = "Sentence " + (S.i + 1) + " of " + S.items.length;
    $("sentScore").textContent = S.xp + " XP";
    BD.UI.syncGradeSelect("sentGradeSel", "sentence");
    $("sentOriginal").textContent = item.text;
    const input = $("sentInput");
    input.value = item.text; input.readOnly = false;
    autoSize();

    const counts = {};
    item.fixes.forEach(function (f) { counts[f.type] = (counts[f.type] || 0) + 1; });
    $("sentMistakes").innerHTML = '<span class="mistake-count">' + item.fixes.length + (item.fixes.length === 1 ? " mistake" : " mistakes") + ' to fix</span>' +
      Object.keys(BD.FIX_TYPES).filter(function (k) { return counts[k]; }).map(function (k) {
        return '<span class="fix-tag fix-' + k + '">' + BD.FIX_TYPES[k].label + (counts[k] > 1 ? " ×" + counts[k] : "") + '</span>';
      }).join("") +
      (S.training && item.target === S.training.skill ? '<p class="sent-training" style="margin:6px 0 0;font-size:.85rem;font-weight:700;opacity:.8">Training: ' + BD.UI.esc(S.training.label) + '</p>' : "");
    $("sentHints").innerHTML = "";
    $("sentFeedback").innerHTML = "";
    $("sentFeedback").className = "sent-feedback";
    $("sentTries").textContent = TRIES + " tries";
    $("sentCheck").hidden = false; $("sentHint").hidden = false; $("sentReset").hidden = false;
    $("sentNext").hidden = true;
    $("sentHint").disabled = false;
    setTimeout(function () { input.focus(); }, 50);
    readItem(true);
  }
  /* Read the sentence out loud (automatic for Pre-K to 1st grade). */
  function readItem(auto) {
    if (!S || (auto && !BD.ReadAloud.auto(S.grade))) return;
    // read-along hook: the sentence is highlighted word by word
    BD.ReadAloud.read([{ text: "Fix the mistakes in this sentence." }, $("sentOriginal").textContent.trim() ? { el: $("sentOriginal") } : { text: S.items[S.i].text }]);
  }

  function autoSize() {
    const el = $("sentInput");
    el.style.height = "auto"; el.style.height = el.scrollHeight + "px";
  }

  function hint() {
    const item = S.items[S.i];
    if (S.done || S.hints >= item.fixes.length) return;
    const f = item.fixes[S.hints++];
    $("sentHints").insertAdjacentHTML("beforeend",
      '<li><span class="fix-tag fix-' + f.type + '">' + BD.FIX_TYPES[f.type].short + '</span> ' + BD.UI.esc(f.hint) + '</li>');
    if (S.hints >= item.fixes.length) $("sentHint").disabled = true;
    BD.Sound.tap();
  }

  function check() {
    if (S.done) return;
    const item = S.items[S.i];
    const typed = $("sentInput").value;
    const accepted = answers(item);
    if (!S.first) { S.first = words(typed); S.hintsAtFirst = S.hints; } // first attempt: which planted mistakes were fixed
    // The comma before "and"/"or" in a list is optional, so accept it either way.
    const loose = function (x) { return norm(x).replace(/,( (?:and|or) )/g, "$1"); };
    if (accepted.some(function (a) { return norm(a) === norm(typed) || loose(a) === loose(typed); })) return solved();

    S.tries++;
    BD.Cast.say("sentSay", "wrong");
    // Find the accepted answer closest to what they typed.
    let best = null;
    accepted.forEach(function (a) { const c = compare(typed, a); if (!best || c.matched > best.matched) best = c; });
    const wrongWords = best.ok.filter(function (x) { return !x; }).length;
    BD.Sound.wrong();

    if (S.tries >= TRIES) return reveal(false);

    const left = TRIES - S.tries;
    $("sentTries").textContent = left + (left === 1 ? " try left" : " tries left");
    const marked = best.words.map(function (w, i) {
      return '<span class="' + (best.ok[i] ? "w-ok" : "w-bad") + '">' + BD.UI.esc(w) + '</span>';
    }).join(" ");
    let msg = wrongWords ? "Not quite. Look closely at the " + (wrongWords === 1 ? "word" : "words") + " marked in red." : "Close! Something is missing. Read it out loud slowly.";
    if (wrongWords && best.missing > 0) msg += " Something may also be missing.";
    $("sentFeedback").className = "sent-feedback try-again";
    $("sentFeedback").innerHTML = '<p>' + msg + '</p><p class="marked">' + marked + '</p>';
    const card = $("sentCard"); card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
  }

  function solved() {
    const item = S.items[S.i];
    const gain = Math.max(5, POINTS[S.tries] - S.hints * HINT_COST);
    S.xp += gain; S.solved++;
    if (S.tries === 0) S.firstTry++;
    BD.Sound.right();
    BD.Cast.say("sentSay", "right");
    if (BD.Kid && BD.Kid.young(S.grade)) BD.Kid.celebrate(document.getElementById("sentSay"), S.grade);
    reveal(true, gain);
  }

  function reveal(won, gain) {
    const item = S.items[S.i], p = BD.Store.current();
    S.done = true;
    S.results.push({ id: item.id, won: won, tries: S.tries + (won ? 1 : 0) });
    const st = p.sentenceStats[S.grade] || (p.sentenceStats[S.grade] = { r: 0, w: 0, firstTry: 0 });
    if (won) { st.r++; if (S.tries === 0) st.firstTry++; } else st.w++;
    const clean = won && S.tries === 0 && S.hints === 0;
    // Score each planted mistake on its own: fixed on the first try without its hint?
    const target = words(answers(item)[0]);
    item.fixes.forEach(function (f, i) {
      let ok = clean;
      if (!clean && typeof f.at === "number" && S.first && S.first.length === target.length) ok = i >= S.hintsAtFirst && S.first[f.at] === target[f.at];
      BD.Coach.recordType(p, S.grade, f.type, ok);
      if (BD.SentenceGen.note) BD.SentenceGen.note(f.type, ok, f.skill, p);
    });
    if (item.source !== "gen") p.seenSentences = [item.id].concat(p.seenSentences.filter(function (x) { return x !== item.id; })).slice(0, 400);
    BD.Store.save();

    $("sentInput").readOnly = true;
    $("sentCheck").hidden = true; $("sentHint").hidden = true; $("sentReset").hidden = true;
    $("sentNext").hidden = false;
    $("sentNext").textContent = S.i + 1 < S.items.length ? "Next sentence" : "See results";
    $("sentScore").textContent = S.xp + " XP";
    const correct = answers(item)[0];
    $("sentFeedback").className = "sent-feedback " + (won ? "solved" : "revealed");
    $("sentFeedback").innerHTML =
      (won ? '<p class="win-line">Fixed it! <strong>+' + gain + ' XP</strong></p>'
           : '<p>Out of tries. Here is the fixed sentence. Read it and see what changed:</p><p class="answer-line">' + BD.UI.esc(correct) + '</p>') +
      '<ul class="explain">' + item.fixes.map(function (f) {
        return '<li><span class="fix-tag fix-' + f.type + '">' + BD.FIX_TYPES[f.type].short + '</span> ' + BD.UI.esc(f.explain) + '</li>';
      }).join("") + '</ul>';
    $("sentTries").textContent = "";
    setTimeout(function () { $("sentNext").focus(); }, 50);
  }

  function next() {
    S.i++;
    if (S.i < S.items.length) return load();
    finish();
  }

  function finish() {
    const p = BD.Store.current(), grade = S.grade;
    const total = S.items.length;
    const acc = Math.round(100 * S.solved / total);
    if (S.test) {
      const review = S.results.filter(function (x) { return !x.won; }).map(function (x) { const it = S.items.find(function (s) { return s.id === x.id; }); return answers(it)[0]; });
      BD.UI.stripeResult({ subject: "reading", grade: grade, part: S.stripe ? S.stripe.part : undefined, pct: acc, score: S.solved + " / " + total, review: review, again: function () { start(null, Object.assign({}, S.stripe, { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: true })); } });
      return;
    }
    const stripeAgain = S.stripe ? { grade: grade, belt: BD.Rank.rec(p, grade).belt, test: false } : null;
    if (S.solved === total) S.xp += 25;
    const levelShift = BD.Coach.adjustSentLevel(p, grade, S.firstTry, total);
    const belt = BD.Rank.practice(p, "sentence", grade, S.xp - (S.banked || 0)); S.banked = S.xp;
    BD.Store.recordSession(p, { game: "sentence", grade: grade, correct: S.solved, firstTry: S.firstTry, total: total, xp: S.xp });
    const missedItems = S.results.filter(function (x) { return !x.won; }).map(function (x) {
      const it = S.items.find(function (s) { return s.id === x.id; });
      return answers(it)[0];
    });
    const failed = acc < PASS;
    p.retry = p.retry || {};
    const wasRetry = !!p.retry.sentence;
    if (failed) p.retry.sentence = { grade: grade }; else p.retry.sentence = null;
    BD.Store.save();
    const ready = !failed && S.firstTry >= Math.ceil(total * 0.75) && grade < BD.MAX_GRADE;
    const types = [];
    S.results.forEach(function (x) {
      const it = S.items.find(function (s) { return s.id === x.id; });
      if (!x.won || x.tries > 1) it.fixes.forEach(function (f) { if (types.indexOf(f.type) === -1) types.push(f.type); });
    });
    BD.UI.results({
      title: failed ? "Let's train this again" : wasRetry ? "Level passed!" : acc === 100 ? "Outstanding!" : "Sharp eyes!",
      failed: failed ? "You fixed " + acc + "%. You need " + PASS + "% to pass " + BD.gradeLabel(grade) + ". Read the rules below, then try a new set of sentences at this level." : null,
      passedRetry: wasRetry && !failed ? "You passed with " + acc + "%. All grade levels are unlocked again." : null,
      lesson: types.length ? rulesHTML(types) : "",
      subtitle: "Fix-It Sentences · " + BD.gradeLabel(grade) + (S.focus ? " · Focus: " + BD.FIX_TYPES[S.focus].label : ""),
      coachNote: levelShift > 0 ? "Great eyes! Sensei is adding an extra mistake to your next sentences." : levelShift < 0 ? "Sensei will use fewer mistakes per sentence for a bit while you build up." : "",
      stats: [["Fixed", S.solved + " / " + total], ["First try", S.firstTry], ["Accuracy", acc + "%"], ["XP earned", "+" + S.xp]],
      belt: belt,
      listTitle: missedItems.length ? "Sentences to read again" : "",
      list: missedItems,
      levelUp: ready ? { text: "You fixed " + S.firstTry + " of " + total + " on the first try. Ready for " + BD.gradeLabel((grade + 1)) + "?", action: function () { p.sentenceGrade = grade + 1; BD.Store.save(); start(); } } : null,
      again: function () { start(null, stripeAgain); },
      againLabel: failed ? "Redo this level" : "New sentences",
      setup: null
    });
  }

  function rulesHTML(types) {
    return types.map(function (k) {
      const r = BD.Explain.RULES[k];
      return '<div class="tip tip-' + k + '"><h3><span class="fix-tag fix-' + k + '">' + BD.FIX_TYPES[k].short + '</span> ' + r.title + '</h3><ul>' +
        r.points.map(function (x) { return "<li>" + BD.UI.esc(x) + "</li>"; }).join("") + '</ul></div>';
    }).join("");
  }

  function openRules() {
    const item = S.items[S.i], types = [];
    item.fixes.forEach(function (f) { if (types.indexOf(f.type) === -1) types.push(f.type); });
    BD.UI.sheet("Rule book", rulesHTML(types) + '<details class="worked"><summary>See all the rules</summary>' +
      rulesHTML(Object.keys(BD.Explain.RULES).filter(function (k) { return types.indexOf(k) === -1; })) + '</details>');
  }

  function senseiContext() {
    const item = S.items[S.i];
    return {
      title: item.text,
      grade: S.grade,
      revealed: S.done,
      chips: S.done ? ["Why was it wrong?", "Explain the rule again", "Give me another example"]
                    : ["Give me a hint", "What does this kind of mistake mean?", "Is my sentence close?"],
      facts: "Sentence-fixing exercise (grade " + S.grade + "). The sentence with mistakes: \"" + item.text + "\"\n" +
        "Correct version: \"" + answers(item)[0] + "\"\n" +
        "Mistakes to fix: " + item.fixes.map(function (f) { return BD.FIX_TYPES[f.type].label + " (" + f.explain + ")"; }).join("; ") + "\n" +
        "Student's current attempt: \"" + $("sentInput").value + "\"\n" +
        (S.done ? "This sentence is finished and the correct version has been shown." : "The student is still working on it.")
    };
  }

  function reset() {
    $("sentInput").value = S.items[S.i].text; autoSize(); $("sentInput").focus();
  }

  function stop() { if (S) BD.Rank.bank(S, "sentence"); S = null; }
  function bankNow() { if (S) BD.Rank.bank(S, "sentence"); }
  function changeGrade(g) {
    const focus = S && S.focus;
    if (!BD.UI.setGrade("sentence", g)) { BD.UI.syncGradeSelect("sentGradeSel", "sentence"); return; }
    start(focus);
  }

  function bind() {
    $("sentCheck").addEventListener("click", check);
    $("sentHint").addEventListener("click", hint);
    $("sentReset").addEventListener("click", reset);
    $("sentNext").addEventListener("click", next);
    $("sentQuit").addEventListener("click", BD.UI.back);
    $("sentRead").addEventListener("click", function () { readItem(false); });
    $("sentGradeSel").addEventListener("change", function (e) { changeGrade(Number(e.target.value)); });
    $("sentRules").addEventListener("click", openRules);
    $("sentAsk").addEventListener("click", function () { if (S) BD.Sensei.open(senseiContext()); });
    $("sentInput").addEventListener("input", autoSize);
    $("sentInput").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); if (S && !S.done) check(); else if (S) next(); }
    });
  }

  /* Read-only view of the current item (used by automated tests). */
  function peek() { return S && S.items[S.i]; }

  return { bankNow: bankNow, peek: peek, stop: stop, PASS: PASS, start: start, bind: bind, compare: compare, norm: norm };
})();
