/* FIX-IT SENTENCES — find and fix capitalization, punctuation, spelling and grammar. */
window.BD = window.BD || {};

BD.SentenceGame = (function () {
  const ROUND = 8, TRIES = 3, POINTS = [30, 20, 10], HINT_COST = 5;
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

  function pickRound(p, grade) {
    const pool = BD.SENTENCES.filter(function (s) { return s.grade === grade; });
    const fresh = pool.filter(function (s) { return p.seenSentences.indexOf(s.id) === -1; });
    const shuffle = function (arr) { return arr.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
    let pick = shuffle(fresh).slice(0, ROUND);
    if (pick.length < ROUND) pick = pick.concat(shuffle(pool.filter(function (s) { return pick.indexOf(s) === -1; })).slice(0, ROUND - pick.length));
    return pick;
  }

  function start() {
    const p = BD.Store.current();
    S = { grade: p.sentenceGrade, items: pickRound(p, p.sentenceGrade), i: 0, xp: 0, solved: 0, firstTry: 0, results: [] };
    BD.UI.show("screen-sentence-play");
    load();
  }

  function load() {
    const item = S.items[S.i];
    S.tries = 0; S.hints = 0; S.done = false;
    $("sentProgress").textContent = "Sentence " + (S.i + 1) + " of " + S.items.length;
    $("sentScore").textContent = S.xp + " XP";
    $("sentGradeTag").textContent = "Grade " + S.grade;
    $("sentOriginal").textContent = item.text;
    const input = $("sentInput");
    input.value = item.text; input.readOnly = false;
    autoSize();

    const counts = {};
    item.fixes.forEach(function (f) { counts[f.type] = (counts[f.type] || 0) + 1; });
    $("sentMistakes").innerHTML = '<span class="mistake-count">' + item.fixes.length + (item.fixes.length === 1 ? " mistake" : " mistakes") + ' to fix</span>' +
      Object.keys(BD.FIX_TYPES).filter(function (k) { return counts[k]; }).map(function (k) {
        return '<span class="fix-tag fix-' + k + '">' + BD.FIX_TYPES[k].label + (counts[k] > 1 ? " ×" + counts[k] : "") + '</span>';
      }).join("");
    $("sentHints").innerHTML = "";
    $("sentFeedback").innerHTML = "";
    $("sentFeedback").className = "sent-feedback";
    $("sentTries").textContent = TRIES + " tries";
    $("sentCheck").hidden = false; $("sentHint").hidden = false; $("sentReset").hidden = false;
    $("sentNext").hidden = true;
    $("sentHint").disabled = false;
    setTimeout(function () { input.focus(); }, 50);
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
    if (accepted.some(function (a) { return norm(a) === norm(typed); })) return solved();

    S.tries++;
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
    reveal(true, gain);
  }

  function reveal(won, gain) {
    const item = S.items[S.i], p = BD.Store.current();
    S.done = true;
    S.results.push({ id: item.id, won: won, tries: S.tries + (won ? 1 : 0) });
    const st = p.sentenceStats[S.grade] || (p.sentenceStats[S.grade] = { r: 0, w: 0, firstTry: 0 });
    if (won) { st.r++; if (S.tries === 0) st.firstTry++; } else st.w++;
    p.seenSentences = [item.id].concat(p.seenSentences.filter(function (x) { return x !== item.id; })).slice(0, 40);
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
    if (S.solved === total) S.xp += 25;
    const belt = BD.Store.addXP(p, S.xp);
    BD.Store.recordSession(p, { game: "sentence", grade: grade, correct: S.solved, firstTry: S.firstTry, total: total, xp: S.xp });
    const missedItems = S.results.filter(function (x) { return !x.won; }).map(function (x) {
      const it = BD.SENTENCES.find(function (s) { return s.id === x.id; });
      return answers(it)[0];
    });
    const ready = S.firstTry >= Math.ceil(total * 0.75) && grade < 7;
    BD.UI.results({
      title: acc === 100 ? "Outstanding!" : acc >= 75 ? "Sharp eyes!" : "Good training!",
      subtitle: "Fix-It Sentences · Grade " + grade,
      stats: [["Fixed", S.solved + " / " + total], ["First try", S.firstTry], ["Accuracy", acc + "%"], ["XP earned", "+" + S.xp]],
      belt: belt,
      listTitle: missedItems.length ? "Sentences to read again" : "",
      list: missedItems,
      levelUp: ready ? { text: "You fixed " + S.firstTry + " of " + total + " on the first try. Ready for Grade " + (grade + 1) + "?", action: function () { p.sentenceGrade = grade + 1; BD.Store.save(); start(); } } : null,
      again: start,
      againLabel: "New sentences",
      setup: null
    });
  }

  function reset() {
    $("sentInput").value = S.items[S.i].text; autoSize(); $("sentInput").focus();
  }

  function quit() { S = null; BD.UI.home(); }

  function bind() {
    $("sentCheck").addEventListener("click", check);
    $("sentHint").addEventListener("click", hint);
    $("sentReset").addEventListener("click", reset);
    $("sentNext").addEventListener("click", next);
    $("sentQuit").addEventListener("click", quit);
    $("sentInput").addEventListener("input", autoSize);
    $("sentInput").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); if (S && !S.done) check(); else if (S) next(); }
    });
  }

  return { start: start, bind: bind, compare: compare, norm: norm };
})();
