/* RANKS — belts, stripes and graduation.
   - Every grade has its own belt path: White → Yellow → Orange → Blue → Green
     → Purple → Brown → Red → Black.
   - Each belt needs 4 stripes: Math, Reading, Spelling, Comprehension.
     Spanish is an optional bonus stripe.
   - A stripe is earned by passing its stripe test (85% or better), any time.
   - Practice earns XP toward a stripe, up to 100 XP each (400 per belt),
     plus 100 XP for graduating = 500 XP per belt.
   - The 4th stripe graduates them to the next belt automatically.
   - Tests and belt practice get harder with each belt inside a grade. */
window.BD = window.BD || {};

BD.Rank = (function () {
  const PASS = 85, PRACTICE_MAX = 100, GRAD_XP = 100;
  const SUBJECTS = [
    { key: "math", label: "Math", game: "math", coach: "cd" },
    { key: "reading", label: "Reading", game: "sentence", coach: "michele", note: "Fix-It Sentences" },
    { key: "spelling", label: "Spelling", game: "spelling", coach: "lauryn", note: "Spelling Bee" },
    { key: "comprehension", label: "Comprehension", game: "reading", coach: "kyra", note: "Story Scrolls" },
    { key: "spanish", label: "Spanish", game: "spanish", coach: "bridgette", note: "Spanish Dojo", optional: true }
  ];
  const REQUIRED = SUBJECTS.filter(function (s) { return !s.optional; }).map(function (s) { return s.key; });
  const BY_GAME = {}; SUBJECTS.forEach(function (s) { BY_GAME[s.game] = s.key; });
  const subject = function (key) { return SUBJECTS.find(function (s) { return s.key === key; }); };

  function rec(p, grade) {
    p.rank = p.rank || {};
    const g = String(grade);
    if (!p.rank[g]) p.rank[g] = { belt: 0, stripes: {}, xp: {}, grads: [], mastered: false };
    const r = p.rank[g];
    r.stripes = r.stripes || {}; r.xp = r.xp || {}; r.grads = r.grads || [];
    return r;
  }
  function dojoGrade(p) {
    if (p.dojoGrade === undefined || p.dojoGrade === null) p.dojoGrade = p.mathGrade !== undefined ? p.mathGrade : 3;
    return p.dojoGrade;
  }
  function belt(p, grade) { return BD.BELTS[rec(p, grade === undefined ? dojoGrade(p) : grade).belt]; }
  function stripeCount(r) { return REQUIRED.filter(function (k) { return r.stripes[k]; }).length; }
  function beltXP(r) { return REQUIRED.reduce(function (a, k) { return a + Math.min(PRACTICE_MAX, r.xp[k] || 0); }, 0); }

  /* Practice XP for a subject at a grade, capped at 100 per stripe. */
  function practice(p, gameKey, grade, amount) {
    const key = BY_GAME[gameKey] || gameKey;
    const r = rec(p, grade);
    const before = r.xp[key] || 0;
    const gained = Math.max(0, Math.min(PRACTICE_MAX - before, Math.round(amount)));
    r.xp[key] = before + gained;
    p.xp = (p.xp || 0) + gained;
    BD.Store.save(p);
    return { subject: key, grade: grade, gained: gained, earned: Math.round(amount), now: r.xp[key], max: PRACTICE_MAX, maxed: r.xp[key] >= PRACTICE_MAX, hasStripe: !!r.stripes[key], belt: BD.BELTS[r.belt] };
  }

  /* Record a stripe test. Returns what happened, including graduation. */
  /* subjectKey is the stripe name: math, reading, spelling, comprehension or spanish. */
  function testDone(p, subjectKey, grade, pct) {
    const key = subjectKey;
    if (!subject(key)) throw new Error("Unknown stripe: " + key);
    const r = rec(p, grade);
    const out = { subject: key, grade: grade, pct: pct, passed: pct >= PASS, beltBefore: r.belt, graduated: null, already: !!r.stripes[key] };
    if (out.passed && !r.stripes[key]) {
      p.stripeLog = (p.stripeLog || []).concat({ subject: key, grade: grade, date: new Date().toISOString() }).slice(-300);
    }
    if (out.passed) r.stripes[key] = true;
    if (out.passed && !r.mastered && REQUIRED.every(function (k) { return r.stripes[k]; })) {
      const from = r.belt;
      r.grads.push({ belt: from, date: new Date().toISOString() });
      p.xp = (p.xp || 0) + GRAD_XP;
      if (from < BD.BELTS.length - 1) { r.belt = from + 1; r.stripes = {}; r.xp = {}; }
      else { r.mastered = true; }
      out.graduated = { from: BD.BELTS[from], to: BD.BELTS[r.belt], mastered: r.mastered, grade: grade };
    }
    out.belt = BD.BELTS[r.belt];
    out.stripes = Object.assign({}, r.stripes);
    BD.Store.save(p);
    return out;
  }

  /* Difficulty inside a grade: lower belts mix in the grade below,
     higher belts mix in the grade above. Returns the grade to draw one item from. */
  function itemGrade(grade, beltIndex) {
    const prev = Math.max(0, 0.6 - 0.15 * beltIndex), next = Math.max(0, 0.15 * (beltIndex - 5));
    const x = Math.random();
    if (x < prev && grade > BD.MIN_GRADE) return grade - 1;
    if (x > 1 - next && grade < BD.MAX_GRADE) return grade + 1;
    return grade;
  }
  /* Short description of what a belt's test covers. */
  function levelNote(beltIndex) {
    return ["warm-up level", "warm-up level", "building level", "building level", "core grade level", "core grade level", "challenge level", "challenge level", "master level"][beltIndex];
  }

  /* The belt picture: two tails with two stripe slots each, plus a gold Spanish bar on the knot. */
  function beltSVG(beltIndex, stripes, opts) {
    opts = opts || {};
    const b = BD.BELTS[beltIndex], col = b.color, edge = "rgba(0,0,0,.45)";
    const s = stripes || {};
    const slot = function (on, y, isNew) {
      return '<rect x="3" y="' + y + '" width="20" height="7" rx="1.5" fill="' + (on ? "#FFFFFF" : "rgba(0,0,0,.22)") + '" stroke="' + (on ? "#22222A" : "rgba(255,255,255,.35)") + '" stroke-width="' + (on ? 2 : 1.2) + '"' + (on ? "" : ' stroke-dasharray="2 2"') + (isNew ? ' class="stripe-new"' : "") + '/>';
    };
    const nw = opts.newStripe;
    return '<svg class="belt-svg" viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + b.name + ' belt with ' + stripeCount({ stripes: s }) + ' of 4 stripes">' +
      '<rect x="8" y="16" width="244" height="26" rx="7" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<rect x="8" y="34" width="244" height="8" rx="4" fill="rgba(0,0,0,.12)"/>' +
      '<g transform="rotate(16 112 40)"><rect x="99" y="40" width="26" height="72" rx="5" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<g transform="translate(99 0)">' + slot(s.math, 82, nw === "math") + slot(s.reading, 95, nw === "reading") + '</g></g>' +
      '<g transform="rotate(-13 148 40)"><rect x="135" y="40" width="26" height="72" rx="5" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<g transform="translate(135 0)">' + slot(s.spelling, 82, nw === "spelling") + slot(s.comprehension, 95, nw === "comprehension") + '</g></g>' +
      '<rect x="112" y="8" width="36" height="42" rx="9" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<rect x="127" y="12" width="6" height="34" rx="2" fill="' + (s.spanish ? "#E0BA77" : "rgba(0,0,0,.15)") + '"' + (nw === "spanish" ? ' class="stripe-new"' : "") + '/>' +
      '</svg>';
  }

  /* Plan suggestions for Sensei's plan. */
  function planItems(p) {
    const g = dojoGrade(p), r = rec(p, g), out = [];
    const open = SUBJECTS.filter(function (s) { return !s.optional && !r.stripes[s.key]; });
    const ready = open.filter(function (s) { return (r.xp[s.key] || 0) >= PRACTICE_MAX; });
    ready.forEach(function (s) { out.push({ kind: "stripeTest", subject: s.key, title: "Take your " + s.label + " stripe test", sub: "Practice is maxed at 100 XP. Score 85% to earn the stripe." }); });
    if (!ready.length && open.length) {
      const low = open.slice().sort(function (a, b) { return (r.xp[a.key] || 0) - (r.xp[b.key] || 0); })[0];
      out.push({ kind: "stripePractice", subject: low.key, title: "Practice " + low.label + " for your stripe", sub: (r.xp[low.key] || 0) + " / 100 XP on your " + BD.BELTS[r.belt].name + " Belt." });
    }
    return out.slice(0, 2);
  }

  /* Bank the practice XP earned so far in a round that hasn't finished
     (Back button, grade change, app closed or put in the background).
     st is the game's round state: { xp, banked, grade, test }. */
  function bank(st, gameKey) {
    if (!st || st.test) return null;
    const p = BD.Store.current(); if (!p) return null;
    const amt = (st.xp || 0) - (st.banked || 0);
    st.banked = st.xp || 0;
    if (amt <= 0) return null;
    const t = BD.today(); if (p.days && p.days.indexOf(t) === -1) p.days.push(t);
    return practice(p, gameKey, st.grade, amt);
  }

  /* White through Purple may use hints; Brown, Red and Black do it on their own. */
  function hintsAllowed(p, grade) { return rec(p, grade).belt <= 5; }

  return {
    bank: bank, hintsAllowed: hintsAllowed, PASS: PASS, PRACTICE_MAX: PRACTICE_MAX, GRAD_XP: GRAD_XP, SUBJECTS: SUBJECTS, REQUIRED: REQUIRED, BY_GAME: BY_GAME,
    subject: subject, rec: rec, dojoGrade: dojoGrade, belt: belt, stripeCount: stripeCount, beltXP: beltXP,
    practice: practice, testDone: testDone, itemGrade: itemGrade, levelNote: levelNote, beltSVG: beltSVG, planItems: planItems
  };
})();
