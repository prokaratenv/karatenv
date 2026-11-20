/* THE COACH — watches each student's recent answers and steers practice:
   - weak skills come up more often (math operations and sentence mistake types)
   - sentence difficulty rises or falls with how they're doing
   - "Sensei's plan" on the home screen says what to work on next */
window.BD = window.BD || {};

BD.Coach = (function () {
  const WINDOW = 20; // how many recent answers count

  function push(map, key, ok) {
    const arr = map[key] || (map[key] = []);
    arr.push(ok ? 1 : 0);
    if (arr.length > WINDOW) arr.splice(0, arr.length - WINDOW);
  }
  function rate(arr) { return arr && arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : null; }

  /* ---------- math ---------- */
  function recordMath(p, grade, op, ok) { push(p.recent, grade + "-" + op, ok); }
  function mathRate(p, grade, op) { return rate(p.recent[grade + "-" + op]); }
  /* Weak operations get picked up to 3× as often. */
  function pickOp(p, grade, ops) {
    const w = ops.map(function (op) {
      const arr = p.recent[grade + "-" + op], r = rate(arr);
      if (!arr || arr.length < 5) return 1.5;
      return 1 + 2 * (1 - r);
    });
    let x = Math.random() * w.reduce(function (a, b) { return a + b; }, 0);
    for (let i = 0; i < ops.length; i++) { x -= w[i]; if (x <= 0) return ops[i]; }
    return ops[ops.length - 1];
  }

  /* ---------- sentences ---------- */
  function recordType(p, grade, type, ok) {
    const g = p.typeRecent[grade] || (p.typeRecent[grade] = {});
    push(g, type, ok);
  }
  function typeRate(p, grade, type) { return rate((p.typeRecent[grade] || {})[type]); }
  function typeWeights(p, grade, focus) {
    const out = {};
    Object.keys(BD.FIX_TYPES).forEach(function (t) {
      const arr = (p.typeRecent[grade] || {})[t], r = rate(arr);
      out[t] = (!arr || arr.length < 4) ? 1.5 : 1 + 2.5 * (1 - r);
      if (focus === t) out[t] *= 3;
    });
    return out;
  }
  /* -1 (gentler), 0 (normal) or +1 (trickier): extra mistakes per sentence. */
  function sentLevel(p, grade) { return p.sentLevel[grade] || 0; }
  function adjustSentLevel(p, grade, firstTry, total) {
    const cur = sentLevel(p, grade);
    let next = cur;
    if (firstTry / total >= 0.85) next = Math.min(1, cur + 1);
    else if (firstTry / total <= 0.4) next = Math.max(-1, cur - 1);
    p.sentLevel[grade] = next;
    return next - cur;
  }

  /* ---------- Sensei's plan ---------- */
  function plan(p) {
    const items = [], OPS = BD.MathGame.OPS;
    const retry = p.retry || {};
    if (retry.math) items.push({ kind: "mathRetry", title: "Pass " + BD.gradeLabel(retry.math.grade) + " " + retry.math.ops.map(function (o) { return OPS[o].label.toLowerCase(); }).join(", "), sub: "Score 70% to unlock other levels." });
    if (retry.sentence) items.push({ kind: "sentRetry", title: "Pass " + BD.gradeLabel(retry.sentence.grade) + " Fix-It Sentences", sub: "Fix 70% to unlock other grades." });

    // Math: weakest skill, or ready to move up
    if (!retry.math) {
      const g = p.mathGrade;
      const rates = Object.keys(OPS).map(function (op) { const a = p.recent[g + "-" + op]; return { op: op, n: a ? a.length : 0, r: rate(a) }; }).filter(function (x) { return x.n >= 8; });
      const weak = rates.filter(function (x) { return x.r < 0.85; }).sort(function (a, b) { return a.r - b.r; })[0];
      if (weak) items.push({ kind: "mathFocus", op: weak.op, title: "Strengthen " + OPS[weak.op].label.toLowerCase(), sub: BD.gradeLabel(g) + " · " + Math.round(weak.r * 100) + "% lately. A focused round helps!" });
      else if (g < BD.MAX_GRADE && rates.length >= 2 && rates.every(function (x) { return x.r >= 0.9 && x.n >= 12; }))
        items.push({ kind: "mathUp", grade: g + 1, title: "Ready for " + BD.gradeLabel((g + 1)) + " math", sub: "You're scoring 90%+ on " + BD.gradeLabel(g) + "." });
      else if (!p.sessions.some(function (x) { return x.game === "math"; })) items.push({ kind: "mathStart", title: "Warm up with Practice Kata", sub: BD.gradeLabel(g) + " math, all four skills." });
    }
    // Sentences: weakest kind of mistake, or ready to move up
    if (!retry.sentence) {
      const g = p.sentenceGrade;
      const rates = Object.keys(BD.FIX_TYPES).map(function (t) { const a = (p.typeRecent[g] || {})[t]; return { t: t, n: a ? a.length : 0, r: rate(a) }; }).filter(function (x) { return x.n >= 5; });
      const weak = rates.filter(function (x) { return x.r < 0.75; }).sort(function (a, b) { return a.r - b.r; })[0];
      if (weak) items.push({ kind: "sentFocus", type: weak.t, title: "Practice " + BD.FIX_TYPES[weak.t].label.toLowerCase(), sub: BD.gradeLabel(g) + " sentences · " + Math.round(weak.r * 100) + "% on the first try lately." });
      else if (g < BD.MAX_GRADE && rates.length >= 3 && rates.every(function (x) { return x.r >= 0.85 && x.n >= 8; }) && sentLevel(p, g) >= 1)
        items.push({ kind: "sentUp", grade: g + 1, title: "Ready for " + BD.gradeLabel((g + 1)) + " sentences", sub: "You're catching almost every mistake at " + BD.gradeLabel(g) + "." });
    }
    if (BD.Reading) items.push.apply(items, BD.Reading.planItems(p));
    if (BD.WordQuiz) items.unshift.apply(items, BD.WordQuiz.planItems(p));
    if (BD.Rank) items.unshift.apply(items, BD.Rank.planItems(p));
    // redo items first, then one suggestion per game
    return items.slice(0, 4);
  }

  return {
    recordMath: recordMath, mathRate: mathRate, pickOp: pickOp,
    recordType: recordType, typeRate: typeRate, typeWeights: typeWeights,
    sentLevel: sentLevel, adjustSentLevel: adjustSentLevel, plan: plan, rate: rate
  };
})();
