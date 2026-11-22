/* RANKS — belts, stripes and graduation.
   - Every grade has its own belt path: White → Yellow → Orange → Blue → Green
     → Purple → Brown → Red → Black.
   - Each belt needs 4 stripes: Math, Reading, Spelling, Comprehension.
     Spanish is bonus training only: practice earns extra XP (up to 100 per
     belt, refilled each new belt), but there is no Spanish stripe or test.
   - A stripe is earned by passing its stripe test (85% or better), any time.
   - Practice earns XP toward a stripe, up to 100 XP each (400 per belt),
     plus 100 XP for graduating = 500 XP per belt.
   - The 4th stripe graduates them to the next belt automatically.
   - Tests and belt practice get harder with each belt inside a grade.
   - PACING (so the journey lasts):
     * A stripe test comes in 4 parts, each a different skill. Part 1 opens at
       25 practice XP, part 2 at 50, part 3 at 75, part 4 at 100. Pass all 4
       (85% each) to earn the stripe. Earned stripes "Retest" as one mixed test.
     * Easier work earns fewer points. Each subject has a level (p.peak: the
       highest grade placed or moved up to; clicking a lower grade never lowers
       it). Practice below that level still builds THAT grade's belt, at
       1 grade below 60%, 2 below 40%, 3 or more below 25%. */
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
    if (!p.rank[g]) p.rank[g] = { belt: 0, stripes: {}, xp: {}, parts: {}, grads: [], mastered: false };
    const r = p.rank[g];
    r.stripes = r.stripes || {}; r.xp = r.xp || {}; r.parts = r.parts || {}; r.grads = r.grads || [];
    return r;
  }
  function dojoGrade(p) {
    if (p.dojoGrade === undefined || p.dojoGrade === null) p.dojoGrade = p.mathGrade !== undefined ? p.mathGrade : 3;
    return p.dojoGrade;
  }
  function belt(p, grade) { return BD.BELTS[rec(p, grade === undefined ? dojoGrade(p) : grade).belt]; }
  function stripeCount(r) { return REQUIRED.filter(function (k) { return r.stripes[k]; }).length; }
  function gradBonus(r) { return Math.round(GRAD_XP * beltXP(r) / (PRACTICE_MAX * REQUIRED.length)); }
  function beltXP(r) { return REQUIRED.reduce(function (a, k) { return a + Math.min(PRACTICE_MAX, r.xp[k] || 0); }, 0); }

  /* Practice XP for a subject at a grade, capped at 100 per stripe.
     Points come only from doing the work: stripe tests add no XP. Practice
     stays open after a stripe is earned, until they move up a belt. */
  function practice(p, gameKey, grade, amount) {
    const key = BY_GAME[gameKey] || gameKey;
    const r = rec(p, grade);
    const before = r.xp[key] || 0, locked = false;
    const lv = level(p, key), f = factor(lv, grade);
    const gained = Math.max(0, Math.min(PRACTICE_MAX - before, Math.round(amount * f)));
    r.xp[key] = before + gained;
    BD.addXP(p, gained);
    BD.Store.save(p);
    return { subject: key, grade: grade, gained: gained, earned: Math.round(amount * f), factor: f, level: lv, now: r.xp[key], max: PRACTICE_MAX, maxed: r.xp[key] >= PRACTICE_MAX, hasStripe: !!r.stripes[key], locked: locked, belt: BD.BELTS[r.belt] };
  }

  /* Record a stripe test. Returns what happened, including graduation. */
  /* subjectKey is the stripe name: math, reading, spelling, comprehension or spanish. */
  function testDone(p, subjectKey, grade, pct, part) {
    const key = subjectKey;
    if (!subject(key)) throw new Error("Unknown stripe: " + key);
    if (subject(key).optional) { const r0 = rec(p, grade); return { subject: key, grade: grade, pct: pct, passed: false, bonusOnly: true, beltBefore: r0.belt, graduated: null, belt: BD.BELTS[r0.belt], stripes: Object.assign({}, r0.stripes) }; }
    const r = rec(p, grade);
    const out = { subject: key, grade: grade, pct: pct, passed: pct >= PASS, beltBefore: r.belt, graduated: null, already: !!r.stripes[key] };
    /* One part of a 4-part stripe test: the stripe comes when all 4 are passed. */
    if (!r.stripes[key] && (typeof part !== "number" || (r.xp[key] || 0) < partNeed(part))) {
      // practice comes first: no stripe credit for a locked part or an un-parted test
      out.passed = false; out.partOnly = true; out.locked = true; out.part = typeof part === "number" ? part : 0; out.partPassed = false;
      out.parts = partList(r, key).slice(); out.partsDone = out.parts.filter(Boolean).length;
      out.belt = BD.BELTS[r.belt]; out.stripes = Object.assign({}, r.stripes); return out;
    }
    if (typeof part === "number" && part >= 0 && part < PARTS && !r.stripes[key]) {
      const list = partList(r, key);
      out.part = part; out.partPassed = out.passed;
      if (out.passed) list[part] = true;
      out.parts = list.slice(); out.partsDone = list.filter(Boolean).length;
      if (out.partsDone < PARTS) { out.passed = false; out.partOnly = true; BD.Store.save(p); out.belt = BD.BELTS[r.belt]; out.stripes = Object.assign({}, r.stripes); return out; }
      out.passed = true; // all 4 parts: the stripe is earned
    }
    if (out.passed && !r.stripes[key]) {
      p.stripeLog = (p.stripeLog || []).concat({ subject: key, grade: grade, date: new Date().toISOString() }).slice(-300);
    }
    if (out.passed) r.stripes[key] = true;
    if (out.passed && !r.mastered && REQUIRED.every(function (k) { return r.stripes[k]; })) {
      const from = r.belt;
      r.grads.push({ belt: from, date: new Date().toISOString() });
      // The graduation bonus is earned by practice: a quarter of the belt's practice XP
      // (all 400 practiced = the full +100; tests alone = +0).
      const bonus = gradBonus(r);
      BD.addXP(p, bonus);
      if (from < BD.BELTS.length - 1) { r.belt = from + 1; r.stripes = {}; r.xp = {}; r.parts = {}; }
      else { r.mastered = true; }
      out.graduated = { from: BD.BELTS[from], to: BD.BELTS[r.belt], mastered: r.mastered, grade: grade, bonus: bonus };
    }
    out.belt = BD.BELTS[r.belt];
    out.stripes = Object.assign({}, r.stripes);
    BD.Store.save(p);
    return out;
  }

  /* ---------- 4-part stripe tests ---------- */
  const PARTS = 4, PART_STEP = PRACTICE_MAX / PARTS;
  function partList(r, key) {
    const a = Array.isArray(r.parts[key]) ? r.parts[key] : [];
    r.parts[key] = [0, 1, 2, 3].map(function (i) { return !!a[i]; });
    return r.parts[key];
  }
  function partsDone(r, key) { return r.stripes[key] ? PARTS : (Array.isArray(r.parts[key]) ? r.parts[key].filter(Boolean).length : 0); }
  /* Practice XP that opens part i (0-based): 25, 50, 75, 100. */
  function partNeed(i) { return Math.round(PART_STEP * (i + 1)); }
  /* The next part to take: { i, open, need } (null once the stripe is earned). */
  function nextPart(r, key) {
    if (r.stripes[key]) return null;
    const list = Array.isArray(r.parts[key]) ? r.parts[key] : [];
    let i = 0; while (i < PARTS && list[i]) i++;
    if (i >= PARTS) i = PARTS - 1;
    return { i: i, open: (r.xp[key] || 0) >= partNeed(i), need: partNeed(i) };
  }
  /* Strict gate: practice comes first. Given the stripe a game is about to
     start, returns the stripe it may really start. A test for a stripe not
     earned yet always becomes the next part, and a part that isn't unlocked
     (N x 25 practice XP) becomes stripe practice instead. Earned stripes can
     always Retest (one mixed test). */
  function gate(p, gameOrKey, stripe) {
    if (!stripe || !stripe.test || !p) return stripe;
    const key = BY_GAME[gameOrKey] || gameOrKey, r = rec(p, stripe.grade);
    if (subject(key) && subject(key).optional) { const o = Object.assign({}, stripe, { test: false }); delete o.part; delete o.skill; return o; } // bonus training: no test
    if (r.stripes[key]) { const o = Object.assign({}, stripe); delete o.part; delete o.skill; return o; }
    const n = nextPart(r, key);
    if (!n || !n.open) { const o = Object.assign({}, stripe, { test: false, blocked: true }); delete o.part; delete o.skill; return o; }
    return Object.assign({}, stripe, { part: n.i, skill: partSkills(key, stripe.grade)[n.i] });
  }
  function canTest(p, key, grade) { if (subject(key) && subject(key).optional) return false; const r = rec(p, grade); if (r.stripes[key]) return true; const n = nextPart(r, key); return !!(n && n.open); }

  /* What each part tests, by subject and grade. */
  function partSkills(key, grade) {
    grade = Number(grade);
    if (key === "math") {
      const ops = BD.MathGame ? BD.MathGame.opsFor(grade) : ["add", "sub"];
      const L = { add: "Addition", sub: "Subtraction", mul: "Multiplication", div: "Division" };
      const one = ops.map(function (o) { return { label: L[o], ops: [o] }; });
      if (one.length >= 4) return one.slice(0, 4);
      if (one.length === 3) return one.concat([{ label: "Mixed review", ops: ops.slice() }]);
      return one.concat([{ label: "Mixed review", ops: ops.slice() }, { label: "Challenge mix", ops: ops.slice(), up: true }]).slice(0, 4);
    }
    if (key === "reading") return [{ label: "Capitals", w: { cap: 1 } }, { label: "Punctuation", w: { punct: 1 } }, { label: "Spelling", w: { spell: 1 } }, { label: "Grammar", w: { grammar: 1 } }];
    if (key === "comprehension") return [{ label: "Main idea", type: "main" }, { label: "Details", type: "detail" }, { label: "Reading between the lines", type: "infer" }, { label: "Word meaning", type: "vocab" }];
    if (key === "spelling") return [{ label: "Short words", size: 0 }, { label: "Medium words", size: 1 }, { label: "Long words", size: 2 }, { label: "Mixed review", size: -1 }];
    if (key === "spanish") {
      let names = [];
      try { names = BD.WordQuiz.GAMES.spanish.topics(grade).map(function (t) { return t.topic; }); } catch (e) { names = []; }
      return [0, 1, 2, 3].map(function (i) {
        const mine = names.filter(function (_, k) { return k % 4 === i; });
        const use = mine.length ? mine : names.length ? [names[i % names.length]] : [];
        return { label: use.length ? (use.length > 2 ? use.slice(0, 2).join(", ") + " and more" : use.join(" and ")) : "Words " + (i + 1), topics: use };
      });
    }
    return [0, 1, 2, 3].map(function (i) { return { label: "Part " + (i + 1) }; });
  }

  /* ---------- subject level (for review practice) ---------- */
  const FIELD = { math: "mathGrade", reading: "sentenceGrade", spelling: "spellingGrade", comprehension: "readingGrade", spanish: "spanishGrade" };
  function level(p, key) {
    p.peak = p.peak && typeof p.peak === "object" ? p.peak : {};
    if (typeof p.peak[key] !== "number") {
      const f = Number(p[FIELD[key]]), d = Number(dojoGrade(p));
      p.peak[key] = Math.max(isFinite(f) ? f : BD.MIN_GRADE, isFinite(d) && !isFinite(f) ? d : BD.MIN_GRADE);
    }
    return p.peak[key];
  }
  /* Raise a subject's level (moving up a grade, a level-up). Never lowers. */
  function raise(p, keyOrGame, grade) {
    const key = BY_GAME[keyOrGame] || keyOrGame; if (!FIELD[key]) return;
    const g = Number(grade); if (!isFinite(g)) return;
    if (g > level(p, key)) p.peak[key] = g;
  }
  /* Set a measured level (Belt Assessment, automatic leveling). */
  function setLevel(p, keyOrGame, grade) {
    const key = BY_GAME[keyOrGame] || keyOrGame; if (!FIELD[key]) return;
    const g = Number(grade); if (!isFinite(g)) return;
    level(p, key); p.peak[key] = Math.max(BD.MIN_GRADE, Math.min(BD.MAX_GRADE, g));
  }
  /* Points for practicing at a grade below the subject's level. */
  function factor(lv, grade) {
    const gap = Number(lv) - Number(grade);
    return gap <= 0 ? 1 : gap === 1 ? 0.6 : gap === 2 ? 0.4 : 0.25;
  }
  function factorFor(p, gameKey, grade) { const key = BY_GAME[gameKey] || gameKey; return FIELD[key] ? factor(level(p, key), grade) : 1; }
  /* Belt at a grade without creating a record. */
  function peek(p, grade) {
    const r = p && p.rank && p.rank[String(grade)];
    return { belt: r ? r.belt || 0 : 0, stripes: r ? r.stripes || {} : {}, mastered: !!(r && r.mastered), trained: !!r };
  }
  function sanitize(p) {
    if (p.peak !== undefined && (typeof p.peak !== "object" || p.peak === null || Array.isArray(p.peak))) delete p.peak;
    const o = {};
    Object.keys(FIELD).forEach(function (k) {
      const v = p.peak ? Number(p.peak[k]) : NaN;
      if (isFinite(v)) o[k] = Math.max(BD.MIN_GRADE, Math.min(BD.MAX_GRADE, Math.round(v)));
      else { const f = Number(p[FIELD[k]]); if (isFinite(f)) o[k] = Math.max(BD.MIN_GRADE, Math.min(BD.MAX_GRADE, Math.round(f))); }
    });
    p.peak = o;
    if (p.rank && typeof p.rank === "object") Object.keys(p.rank).forEach(function (g) {
      const r = p.rank[g]; if (!r || typeof r !== "object") return;
      const parts = r.parts && typeof r.parts === "object" && !Array.isArray(r.parts) ? r.parts : {}, out = {};
      REQUIRED.forEach(function (k) { if (Array.isArray(parts[k])) out[k] = [0, 1, 2, 3].map(function (i) { return !!parts[k][i]; }); });
      r.parts = out; // Spanish is bonus training: no parts
    });
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

  /* The belt picture: two tails with two stripe slots each (Spanish is bonus training, so no bar). */
  function beltSVG(beltIndex, stripes, opts) {
    opts = opts || {};
    const b = BD.BELTS[beltIndex], col = b.color, edge = "rgba(0,0,0,.45)";
    const s = stripes || {};
    const pr = opts.parts || {};
    const pips = function (key, y) {
      if (s[key] || !Array.isArray(pr[key])) return "";
      return pr[key].map(function (on, i) { return '<rect x="' + (5 + i * 4.5) + '" y="' + (y + 2) + '" width="3.4" height="3.4" rx=".8" fill="' + (on ? "#E0BA77" : "rgba(255,255,255,.35)") + '" stroke="#22222A" stroke-width=".6"/>'; }).join("");
    };
    const slot = function (on, y, isNew) {
      return '<rect x="3" y="' + y + '" width="20" height="7" rx="1.5" fill="' + (on ? "#FFFFFF" : "rgba(0,0,0,.22)") + '" stroke="' + (on ? "#22222A" : "rgba(255,255,255,.35)") + '" stroke-width="' + (on ? 2 : 1.2) + '"' + (on ? "" : ' stroke-dasharray="2 2"') + (isNew ? ' class="stripe-new"' : "") + '/>';
    };
    const nw = opts.newStripe;
    return '<svg class="belt-svg" viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + b.name + ' belt with ' + stripeCount({ stripes: s }) + ' of 4 stripes">' +
      '<rect x="8" y="16" width="244" height="26" rx="7" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<rect x="8" y="34" width="244" height="8" rx="4" fill="rgba(0,0,0,.12)"/>' +
      '<g transform="rotate(16 112 40)"><rect x="99" y="40" width="26" height="72" rx="5" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<g transform="translate(99 0)">' + slot(s.math, 82, nw === "math") + pips("math", 82) + slot(s.reading, 95, nw === "reading") + pips("reading", 95) + '</g></g>' +
      '<g transform="rotate(-13 148 40)"><rect x="135" y="40" width="26" height="72" rx="5" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<g transform="translate(135 0)">' + slot(s.spelling, 82, nw === "spelling") + pips("spelling", 82) + slot(s.comprehension, 95, nw === "comprehension") + pips("comprehension", 95) + '</g></g>' +
      '<rect x="112" y="8" width="36" height="42" rx="9" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '</svg>';
  }

  /* Plan suggestions for Sensei's plan. */
  function planItems(p) {
    const g = dojoGrade(p), r = rec(p, g), out = [];
    const open = SUBJECTS.filter(function (s) { return !s.optional && !r.stripes[s.key]; });
    const ready = open.filter(function (s) { const n = nextPart(r, s.key); return n && n.open; });
    ready.forEach(function (s) {
      const n = nextPart(r, s.key), sk = partSkills(s.key, g)[n.i];
      out.push({ kind: "stripeTest", subject: s.key, title: s.label + " stripe test: Part " + (n.i + 1) + " of 4", sub: sk.label + ". Score 85% to pass this part." });
    });
    if (!ready.length && open.length) {
      const low = open.slice().sort(function (a, b) { return (r.xp[a.key] || 0) - (r.xp[b.key] || 0); })[0];
      const n = nextPart(r, low.key);
      out.push({ kind: "stripePractice", subject: low.key, title: "Practice " + low.label + " for your stripe", sub: (r.xp[low.key] || 0) + " / 100 XP on your " + BD.BELTS[r.belt].name + " Belt. Part " + (n.i + 1) + " opens at " + n.need + "." });
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

  /* Practice has hints at every belt (2 per question, each costs a little XP),
     so nobody gets stuck. Only stripe tests are hint-free. */
  function hintsAllowed() { return true; }

  /* The level rises only when a round at a higher grade goes well (70%+, 5+ items),
     so tapping up just to look never lowers the points at their old grade. */
  if (BD.on) BD.on("results", function (e) {
    const p = e && e.p, s = p && p.sessions && p.sessions[0];
    if (!s || !BD_GAME_OK(s) || (Number(s.total) || 0) < 5) return;
    if (s.correct / s.total >= 0.7 && Number(s.grade) > level(p, BY_GAME[s.game] || s.game)) { raise(p, s.game, Number(s.grade)); BD.Store.save(p); }
  });
  function BD_GAME_OK(s) { return !!BY_GAME[s.game] && !s.school; }

  return {
    bank: bank, hintsAllowed: hintsAllowed, PASS: PASS, PRACTICE_MAX: PRACTICE_MAX, GRAD_XP: GRAD_XP, SUBJECTS: SUBJECTS, REQUIRED: REQUIRED, BY_GAME: BY_GAME,
    subject: subject, gradBonus: gradBonus, rec: rec, dojoGrade: dojoGrade, belt: belt, stripeCount: stripeCount, beltXP: beltXP,
    practice: practice, testDone: testDone, PARTS: PARTS, partNeed: partNeed, nextPart: nextPart, gate: gate, canTest: canTest, partsDone: partsDone, partSkills: partSkills, level: level, raise: raise, setLevel: setLevel, factor: factor, factorFor: factorFor, peek: peek, sanitize: sanitize, at: null, itemGrade: itemGrade, levelNote: levelNote, beltSVG: beltSVG, planItems: planItems
  };
})();
