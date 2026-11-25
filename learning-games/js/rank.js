/* RANKS — belts, stripes and graduation.
   - Every grade has its own belt path: White → Yellow → Orange → Blue → Green
     → Purple → Brown → Red → Black.
   - Each belt needs 4 stripes: Math, Reading, Spelling, Comprehension.
     Spanish is bonus training only: practice earns extra XP (up to 100 per
     belt, refilled each new belt), but there is no Spanish stripe or test.
   - A stripe is earned by passing its stripe test (80% or better), any time.
   - Practice fills a stripe meter in Belt XP (about 10 Belt XP per minute of
     focused practice in any subject; see NORM). A stripe meter grows with the
     belt: White 450, Yellow 900, Orange 1200, Blue 1650, Green 2100, Purple
     2550, Brown 2850, Red 3300 Belt XP (about 100 hours White to Black).
   - Belt power: each day the first 600 Belt XP count in full; after that the
     belt still grows at 8% (so even 4 hours a day takes about 80+ days,
     30 to 40 minutes a day about 5 to 6 months). Total XP for the leaderboard
     is always earned in full. Resets at local midnight.
   - Black Belt degrees: 1st to 3rd Degree need 4 stripes of 250 Belt XP plus a
     Degree Test (worth 250 XP); 4th and 5th need 4 x 500 plus a 500 XP test.
     5th Degree is Master Rank. Practice in any subject fills the degree meter
     (daily full power 50 Belt XP for 1st to 3rd, 70 for 4th and 5th, then 3%:
     about 2 to 3 weeks a degree at 30 to 40 minutes a day).
   - The 4th stripe graduates them to the next belt automatically.
   - Tests and belt practice get harder with each belt inside a grade.
   - PACING (so the journey lasts):
     * A stripe test comes in 4 parts, each a different skill. Part 1 opens at
       25% of the stripe meter, part 2 at 50%, part 3 at 75%, part 4 when full. Pass all 4
       (80% each) to earn the stripe. Earned stripes "Retest" as one mixed test.
     * Easier work earns fewer points. Each subject has a level (p.peak: the
       highest grade placed or moved up to; clicking a lower grade never lowers
       it). Practice below that level still builds THAT grade's belt, at
       1 grade below 60%, 2 below 40%, 3 or more below 25%. */
window.BD = window.BD || {};

BD.Rank = (function () {
  const PASS = 80; // 5 of 6, 4 of 5 and 8 of 10 all pass
  /* Belt XP per stripe for each belt (White to Red); Black works on degrees. */
  const STRIPE_XP = [450, 900, 1200, 1650, 2100, 2550, 2850, 3300];
  /* Belt XP per game XP: evens out how fast each game pays (about 10 Belt XP a minute). */
  const NORM = { math: 0.14, reading: 0.2, spelling: 0.18, comprehension: 0.4, spanish: 0.18 };
  const DAY_FULL = 600, DAY_AFTER = 0.08, DEG_AFTER = 0.03; // belts: full-power Belt XP a day, then 8% (degrees 3%)
  const DEG_NAMES = ["Black Belt", "1st Degree Black Belt", "2nd Degree Black Belt", "3rd Degree Black Belt", "4th Degree Black Belt", "5th Degree Black Belt"];
  function degStripe(d) { return d < 3 ? 250 : 500; }   // d = degrees already earned (0..4): working toward d+1
  function degDay(d) { return d < 3 ? 50 : 70; }
  /* Little Ninjas (Preschool and Pre-K): short daily sessions, so a stripe is a quarter the size and
     the day's full belt power is 150 Belt XP (about 15 minutes). White to Black is still about 3+ months. */
  const LITTLE = 0.25, LITTLE_DAY = 150;
  const little = function (g) { return Number(g) <= -1; };
  function stripeMax(beltIndex, g) { const m = STRIPE_XP[Math.min(beltIndex, STRIPE_XP.length - 1)]; return little(g) ? Math.round(m * LITTLE) : m; }
  function dayFull(g) { return little(g) ? LITTLE_DAY : DAY_FULL; }
  function maxFor(r) { return r && r.belt >= 8 ? degStripe(r.deg || 0) : stripeMax(r ? r.belt : 0, r ? r.g : undefined); }
  const GRAD_XP = 100;
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
    if (!p.rank[g]) p.rank[g] = { belt: 0, stripes: {}, xp: {}, parts: {}, grads: [], mastered: false, deg: 0, dxp: 0, dgrads: [] };
    const r = p.rank[g];
    r.g = Number(g);
    r.stripes = r.stripes || {}; r.xp = r.xp || {}; r.parts = r.parts || {}; r.grads = r.grads || [];
    r.deg = r.deg || 0; r.dxp = r.dxp || 0; r.dgrads = r.dgrads || [];
    return r;
  }
  function dojoGrade(p) {
    if (p.dojoGrade === undefined || p.dojoGrade === null) p.dojoGrade = p.mathGrade !== undefined ? p.mathGrade : 3;
    return p.dojoGrade;
  }
  function belt(p, grade) { return BD.BELTS[rec(p, grade === undefined ? dojoGrade(p) : grade).belt]; }
  function stripeCount(r) { return REQUIRED.filter(function (k) { return r.stripes[k]; }).length; }
  /* Graduation bonus grows with the belt (the meters are full by the time all 4 parts pass). */
  function gradBonus(r) { return GRAD_XP + 50 * (r ? r.belt : 0); }
  function beltXP(r) { if (r.belt >= 8) return Math.floor(r.dxp || 0); const m = maxFor(r); return Math.floor(REQUIRED.reduce(function (a, k) { return a + Math.min(m, r.xp[k] || 0); }, 0)); }
  function beltMax(r) { return 4 * maxFor(r); }
  /* Rank name: "Blue Belt", "2nd Degree Black Belt", "5th Degree Black Belt · Master Rank". */
  function title(r) { if (!r || r.belt < 8) return BD.BELTS[r ? r.belt : 0].name + " Belt"; return DEG_NAMES[Math.min(5, r.deg || 0)] + ((r.deg || 0) >= 5 ? " · Master Rank" : ""); }

  /* ---------- belt power (a daily full-power amount, then 8%) ---------- */
  function powerDay(p) { const t = BD.today(); if (!p.bp || p.bp.d !== t) p.bp = { d: t, u: 0 }; return p.bp; }
  /* Today's belt power for a record: { full, used, left, bonus } in that belt's Belt XP. */
  function power(p, grade) {
    const r = rec(p, grade === undefined ? dojoGrade(p) : grade), full = r.belt >= 8 ? degDay(r.deg || 0) : dayFull(r.g), u = powerDay(p).u;
    const used = Math.min(full, Math.round(u * full));
    return { full: full, used: used, left: full - used, bonus: u >= 1 };
  }
  /* Credit Belt XP through today's power: full until the day's amount is used, then DAY_AFTER. */
  function powered(p, amt, full, after) {
    const d = powerDay(p), leftFrac = Math.max(0, 1 - d.u), fullPart = Math.min(amt, leftFrac * full);
    d.u = Math.min(1, d.u + fullPart / full);
    return fullPart + (amt - fullPart) * (after === undefined ? DAY_AFTER : after);
  }
  const r1 = function (x) { return Math.round(x * 10) / 10; };

  /* Practice at a grade. Game XP counts in full for the leaderboard (after the
     review discount); the stripe meter grows in Belt XP through today's belt
     power. Stripe tests add no XP. At Black Belt, practice in any subject fills
     the degree meter. */
  function practice(p, gameKey, grade, amount) {
    const key = BY_GAME[gameKey] || gameKey;
    const r = rec(p, grade);
    const lv = level(p, key), f = factor(lv, grade);
    const raw = Math.max(0, Math.round(amount * f));
    BD.addXP(p, raw);
    const sj = subject(key), bx = raw * (NORM[key] || 0.2);
    let gained = 0, now, max, beforeFull = powerDay(p).u < 1;
    if (sj && sj.optional) { // Spanish: bonus meter, no belt power used
      max = stripeMax(Math.min(r.belt, 7), grade); const b = r.xp[key] || 0; now = Math.min(max, r1(b + bx)); gained = now - b; r.xp[key] = now;
    } else if (r.belt >= 8) {
      max = 4 * degStripe(r.deg || 0);
      if ((r.deg || 0) >= 5) { now = max; }
      else { const b = r.dxp || 0, c = powered(p, bx, degDay(r.deg || 0), DEG_AFTER); now = Math.min(max, r1(b + c)); gained = now - b; r.dxp = now; }
    } else {
      max = stripeMax(r.belt, grade); const b = r.xp[key] || 0, c = powered(p, bx, dayFull(grade)); now = Math.min(max, r1(b + c)); gained = now - b; r.xp[key] = now;
    }
    BD.Store.save(p);
    const pw = power(p, grade);
    return { subject: key, grade: grade, gained: Math.round(gained), earned: raw, factor: f, level: lv, now: Math.floor(now), max: max, maxed: now >= max, hasStripe: !!r.stripes[key], locked: false, belt: BD.BELTS[r.belt], degree: r.belt >= 8, title: title(r), power: pw, bonusPower: !beforeFull || pw.bonus, optional: !!(sj && sj.optional) };
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
    if (!r.stripes[key] && (typeof part !== "number" || (r.xp[key] || 0) < partNeed(part, r))) {
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
    if (out.passed && r.belt < 8 && REQUIRED.every(function (k) { return r.stripes[k]; })) {
      const from = r.belt;
      r.grads.push({ belt: from, date: new Date().toISOString() });
      // The graduation bonus is earned by practice: a quarter of the belt's practice XP
      // (all 400 practiced = the full +100; tests alone = +0).
      const bonus = gradBonus(r);
      BD.addXP(p, bonus);
      r.belt = Math.min(from + 1, BD.BELTS.length - 1); r.stripes = {}; r.xp = {}; r.parts = {};
      if (r.belt >= 8) { r.deg = r.deg || 0; r.dxp = 0; }
      out.graduated = { from: BD.BELTS[from], to: BD.BELTS[r.belt], mastered: r.mastered, grade: grade, bonus: bonus };
    }
    out.belt = BD.BELTS[r.belt];
    out.stripes = Object.assign({}, r.stripes);
    BD.Store.save(p);
    return out;
  }

  /* ---------- 4-part stripe tests ---------- */
  const PARTS = 4;
  function partList(r, key) {
    const a = Array.isArray(r.parts[key]) ? r.parts[key] : [];
    r.parts[key] = [0, 1, 2, 3].map(function (i) { return !!a[i]; });
    return r.parts[key];
  }
  function partsDone(r, key) { return r.stripes[key] ? PARTS : (Array.isArray(r.parts[key]) ? r.parts[key].filter(Boolean).length : 0); }
  /* Belt XP that opens part i (0-based): 25%, 50%, 75%, 100% of the stripe meter. */
  function partNeed(i, r) { return Math.round(maxFor(r) * (i + 1) / PARTS); }
  /* The next part to take: { i, open, need } (null once the stripe is earned). */
  function nextPart(r, key) {
    if (r.stripes[key] || r.belt >= 8) return null;
    const list = Array.isArray(r.parts[key]) ? r.parts[key] : [];
    let i = 0; while (i < PARTS && list[i]) i++;
    if (i >= PARTS) i = PARTS - 1;
    return { i: i, open: (r.xp[key] || 0) >= partNeed(i, r), need: partNeed(i, r) };
  }
  /* Strict gate: practice comes first. Given the stripe a game is about to
     start, returns the stripe it may really start. A test for a stripe not
     earned yet always becomes the next part, and a part that isn't unlocked
     (N x 25 practice XP) becomes stripe practice instead. Earned stripes can
     always Retest (one mixed test). */
  function gate(p, gameOrKey, stripe) {
    if (!stripe || !stripe.test || !p) return stripe;
    const key = BY_GAME[gameOrKey] || gameOrKey, r = rec(p, stripe.grade);
    if (r.belt >= 8) { const o = Object.assign({}, stripe, { test: false }); delete o.part; delete o.skill; return o; } // Black Belt: degree practice (the Degree Test is its own)
    if (subject(key) && subject(key).optional) { const o = Object.assign({}, stripe, { test: false }); delete o.part; delete o.skill; return o; } // bonus training: no test
    if (r.stripes[key]) { const o = Object.assign({}, stripe); delete o.part; delete o.skill; return o; }
    const n = nextPart(r, key);
    if (!n || !n.open) { const o = Object.assign({}, stripe, { test: false, blocked: true }); delete o.part; delete o.skill; return o; }
    return Object.assign({}, stripe, { part: n.i, skill: partSkills(key, stripe.grade)[n.i] });
  }
  function canTest(p, key, grade) { if (subject(key) && subject(key).optional) return false; const r = rec(p, grade); if (r.belt >= 8) return false; if (r.stripes[key]) return true; const n = nextPart(r, key); return !!(n && n.open); }

  /* What each part tests, by subject and grade. */
  function partSkills(key, grade) {
    grade = Number(grade);
    if (grade <= -1 && key !== "spanish" && BD.Little) { const ls = BD.Little.partSkills(key, grade); if (ls) return ls; } // Little Ninjas picture games
    if (key === "math") {
      const ops = BD.MathGame ? BD.MathGame.opsFor(grade) : ["add", "sub"];
      const L = { add: "Addition", sub: "Subtraction", mul: "Multiplication", div: "Division" };
      const one = ops.map(function (o) { return { label: L[o] || (BD.MathGame && BD.MathGame.opLabel ? BD.MathGame.opLabel(o, grade) : o), ops: [o] }; }); // 6th to 8th: the four strands
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

  /* ---------- Black Belt degrees ---------- */
  function degInfo(r) {
    const d = r.deg || 0, size = degStripe(Math.min(d, 4)), x = Math.min(4 * size, r.dxp || 0);
    return { deg: d, next: Math.min(5, d + 1), master: d >= 5, size: size, xp: Math.floor(x), max: 4 * size, stripes: d >= 5 ? 4 : Math.min(4, Math.floor(x / size)), ready: d < 5 && x >= 4 * size, testXP: size, day: degDay(Math.min(d, 4)), name: DEG_NAMES[Math.min(5, d)], nextName: DEG_NAMES[Math.min(5, d + 1)] };
  }
  /* A Degree Test result (mixed questions, 80% to pass). */
  function degreeDone(p, grade, pct) {
    const r = rec(p, grade), i = degInfo(r), out = { grade: grade, pct: pct, passed: pct >= PASS && i.ready, from: i.deg, xp: 0 };
    if (out.passed) {
      r.deg = i.deg + 1; r.dxp = 0; r.dgrads.push({ deg: r.deg, date: new Date().toISOString() });
      if (r.deg >= 5) r.mastered = true;
      out.xp = i.testXP; BD.addXP(p, i.testXP);
      p.stripeLog = (p.stripeLog || []).concat({ subject: "degree", grade: grade, deg: r.deg, date: new Date().toISOString() }).slice(-300);
    }
    out.to = r.deg; out.title = title(r); out.master = r.deg >= 5;
    BD.Store.save(p);
    return out;
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
    if (p.bp !== undefined && !(p.bp && typeof p.bp === "object" && /^\d{4}-\d\d-\d\d$/.test(p.bp.d))) delete p.bp;
    else if (p.bp) p.bp = { d: p.bp.d, u: Math.max(0, Math.min(1, Number(p.bp.u) || 0)) };
    const migrate = (p.rankV || 1) < 2;
    if (p.rank && typeof p.rank === "object") Object.keys(p.rank).forEach(function (g) {
      const r = p.rank[g]; if (!r || typeof r !== "object") return;
      r.g = Number(g);
      r.belt = Math.max(0, Math.min(8, Math.round(Number(r.belt) || 0)));
      if (migrate) {
        // Old meters were 0-100 per stripe: keep the same share of the new, longer meters.
        if (r.belt < 8) Object.keys(r.xp || {}).forEach(function (k) { r.xp[k] = Math.round(Math.min(100, Number(r.xp[k]) || 0) / 100 * stripeMax(r.belt)); });
        else { const n = REQUIRED.filter(function (k) { return r.stripes && r.stripes[k]; }).length; r.deg = r.mastered ? 1 : 0; r.dxp = r.mastered ? 0 : n * 250; r.mastered = false; r.stripes = {}; r.xp = {}; r.parts = {}; if (r.deg) r.dgrads = [{ deg: 1, date: new Date().toISOString() }]; }
      }
      r.deg = Math.max(0, Math.min(5, Math.round(Number(r.deg) || 0)));
      r.dxp = Math.max(0, Math.min(2000, Number(r.dxp) || 0));
      r.dgrads = Array.isArray(r.dgrads) ? r.dgrads.filter(function (x) { return x && typeof x.date === "string"; }).slice(-10) : [];
      r.mastered = r.deg >= 5;
      if (r.xp && typeof r.xp === "object") Object.keys(r.xp).forEach(function (k) { r.xp[k] = Math.max(0, Math.min(stripeMax(Math.min(r.belt, 7), r.g), Number(r.xp[k]) || 0)); });
      const parts = r.parts && typeof r.parts === "object" && !Array.isArray(r.parts) ? r.parts : {}, out = {};
      REQUIRED.forEach(function (k) { if (Array.isArray(parts[k])) out[k] = [0, 1, 2, 3].map(function (i) { return !!parts[k][i]; }); });
      r.parts = out; // Spanish is bonus training: no parts
    });
    p.rankV = 2;
  }

  /* Difficulty inside a grade: lower belts mix in the grade below,
     higher belts mix in the grade above. Returns the grade to draw one item from. */
  function itemGrade(grade, beltIndex) {
    const prev = Math.max(0, 0.6 - 0.15 * beltIndex), next = Math.max(0, 0.15 * (beltIndex - 5));
    const x = Math.random();
    if (x < prev && grade > BD.MIN_GRADE) return grade - 1;
    if (x > 1 - next && grade < BD.MAX_GRADE && (grade >= 3 || grade + 1 <= 2)) return grade + 1; // Pre-K to 2nd never reach 3rd-grade work
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
    return '<svg class="belt-svg" viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (opts.degree ? DEG_NAMES[Math.min(5, opts.degree)] : b.name + ' belt') + ' with ' + stripeCount({ stripes: s }) + ' of 4 stripes">' +
      '<rect x="8" y="16" width="244" height="26" rx="7" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<rect x="8" y="34" width="244" height="8" rx="4" fill="rgba(0,0,0,.12)"/>' +
      '<g transform="rotate(16 112 40)"><rect x="99" y="40" width="26" height="72" rx="5" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<g transform="translate(99 0)">' + slot(s.math, 82, nw === "math") + pips("math", 82) + slot(s.reading, 95, nw === "reading") + pips("reading", 95) + '</g></g>' +
      '<g transform="rotate(-13 148 40)"><rect x="135" y="40" width="26" height="72" rx="5" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<g transform="translate(135 0)">' + slot(s.spelling, 82, nw === "spelling") + pips("spelling", 82) + slot(s.comprehension, 95, nw === "comprehension") + pips("comprehension", 95) + '</g></g>' +
      '<rect x="112" y="8" width="36" height="42" rx="9" fill="' + col + '" stroke="' + edge + '" stroke-width="2"/>' +
      (opts.degree ? '<g transform="translate(16 20)">' + Array.from({ length: Math.min(5, opts.degree) }, function (_, i) { return '<rect x="' + (i * 14) + '" y="0" width="8" height="18" rx="1.5" fill="#E0BA77" stroke="#7A5A1E" stroke-width="1"/>'; }).join("") + '</g>' : '') +
      '</svg>';
  }

  function lowKey(r) { return REQUIRED.slice().sort(function (a, b) { return (r.xp[a] || 0) - (r.xp[b] || 0); })[0]; }
  /* Plan suggestions for Sensei's plan. */
  function planItems(p) {
    const g = dojoGrade(p), r = rec(p, g), out = [];
    if (r.belt >= 8) {
      const d = degInfo(r);
      if (d.master) return [{ kind: "degree", title: "Master Rank!", sub: "You earned every degree in " + BD.gradeLabel(g) + ". Keep your skills sharp." }];
      if (d.ready) return [{ kind: "degreeTest", title: d.nextName + " test", sub: "Mixed questions from every subject. Score " + PASS + "% to promote." }];
      return [{ kind: "stripePractice", subject: lowKey(r), title: "Train for your " + d.nextName, sub: d.xp + " / " + d.max + " Belt XP · " + d.stripes + " of 4 degree stripes. Practice any subject." }];
    }
    const open = SUBJECTS.filter(function (s) { return !s.optional && !r.stripes[s.key]; });
    const ready = open.filter(function (s) { const n = nextPart(r, s.key); return n && n.open; });
    ready.forEach(function (s) {
      const n = nextPart(r, s.key), sk = partSkills(s.key, g)[n.i];
      out.push({ kind: "stripeTest", subject: s.key, title: s.label + " stripe test: Part " + (n.i + 1) + " of 4", sub: sk.label + ". Score " + PASS + "% to pass this part." });
    });
    if (!ready.length && open.length) {
      const low = open.slice().sort(function (a, b) { return (r.xp[a.key] || 0) - (r.xp[b.key] || 0); })[0];
      const n = nextPart(r, low.key);
      out.push({ kind: "stripePractice", subject: low.key, title: "Practice " + low.label + " for your stripe", sub: Math.floor(r.xp[low.key] || 0) + " / " + maxFor(r) + " Belt XP on your " + BD.BELTS[r.belt].name + " Belt. Part " + (n.i + 1) + " opens at " + n.need + "." });
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
    bank: bank, hintsAllowed: hintsAllowed, PASS: PASS, GRAD_XP: GRAD_XP, STRIPE_XP: STRIPE_XP, NORM: NORM, DAY_FULL: DAY_FULL, DAY_AFTER: DAY_AFTER, DEG_NAMES: DEG_NAMES, stripeMax: stripeMax, dayFull: dayFull, LITTLE: LITTLE, maxFor: maxFor, beltMax: beltMax, title: title, power: power, degInfo: degInfo, degreeDone: degreeDone, degStripe: degStripe, SUBJECTS: SUBJECTS, REQUIRED: REQUIRED, BY_GAME: BY_GAME,
    subject: subject, gradBonus: gradBonus, rec: rec, dojoGrade: dojoGrade, belt: belt, stripeCount: stripeCount, beltXP: beltXP,
    practice: practice, testDone: testDone, PARTS: PARTS, partNeed: partNeed, nextPart: nextPart, gate: gate, canTest: canTest, partsDone: partsDone, partSkills: partSkills, level: level, raise: raise, setLevel: setLevel, factor: factor, factorFor: factorFor, peek: peek, sanitize: sanitize, at: null, itemGrade: itemGrade, levelNote: levelNote, beltSVG: beltSVG, planItems: planItems
  };
})();
