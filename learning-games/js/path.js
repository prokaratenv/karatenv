/* LEARNING PATH + CONTINUE — one big button that always knows what's next,
   and a winding path of the current belt (Duolingo style).
   - next(p): the next best activity, with a clear label.
   - render(p): the path for the Dojo grade's current belt, themed by the
     belt's Adventure Map region (banner opens the full map).
   Path order rotates subjects: Math 25, Reading 25, Spelling 25, Stories 25,
   then each Part 1, then 50 XP, Part 2 ... then the belt boss and graduation.
   Any ready node can be tapped; locked nodes explain what opens them.
   Shown as a compact belt card + "Your next moves" (2 or 3 open steps; 2 for
   Pre-K to 2nd), with a Coming up card for what's next. */
window.BD = window.BD || {};

BD.Path = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const ORDER = ["math", "reading", "spelling", "comprehension"];
  const NAME = { math: "Math", reading: "Reading", spelling: "Spelling", comprehension: "Stories", spanish: "Spanish" };
  const GAME = { math: "Math Dojo", reading: "Fix-It Sentences", spelling: "Spelling Bee", comprehension: "Story Scrolls", spanish: "Spanish Dojo" };
  const ICON = {
    math: '<path d="M7 12h10M12 7v10"/>',
    reading: '<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>',
    spelling: '<path d="M4 18l4-12 4 12M5.5 14h5"/><path d="M15 6v12h3a3 3 0 0 0 0-6h-3"/>',
    comprehension: '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/>',
    spanish: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16"/>',
    test: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
    grad: '<path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v5c2 2 8 2 10 0v-5"/>',
    lock: '<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/>',
    check: '<path d="M5 12l5 5 9-10"/>'
  };
  const svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg>'; };
  const CH = ["Warm Up", "Build Up", "Power Up", "Belt Battle"];
  const CH_SUB = ["25 XP in each subject, then Part 1 tests", "50 XP in each subject, then Part 2 tests", "75 XP in each subject, then Part 3 tests", "100 XP, Part 4 tests, the belt boss and graduation"];

  /* ---------- what's next ---------- */
  function bossInfo(p) {
    const g = BD.Rank.dojoGrade(p), belt = BD.Rank.rec(p, g).belt;
    const w = BD.Boss.wins(p, g), idx = belt === 8 && w.indexOf(8) !== -1 ? 9 : belt;
    return { boss: BD.Boss.BOSSES[idx], beat: w.indexOf(idx) !== -1 };
  }
  function lowestPractice(p, r) {
    let best = null;
    ORDER.forEach(function (k) {
      if (r.stripes[k]) return;
      const x = Math.min(BD.Rank.PRACTICE_MAX, r.xp[k] || 0);
      if (x >= BD.Rank.PRACTICE_MAX) return;
      if (!best || x < best.x) best = { key: k, x: x };
    });
    return best;
  }
  /* The next best activity. Never a locked test part. */
  function next(p) {
    const plan = BD.Coach ? BD.Coach.plan(p) : [];
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g);
    let it = null;
    // 1. A redo or this week's school words come first (they unlock other levels).
    if (plan[0] && /Retry$|^school/.test(plan[0].kind)) it = plan[0];
    // 2. A stripe-test part that is open now.
    // (lowest part first, so a chapter gets finished before the next one starts)
    if (!it) {
      const open = ORDER.filter(function (k) { return BD.Rank.canTest(p, k, g) && !r.stripes[k]; })
        .map(function (k) { return { k: k, n: BD.Rank.nextPart(r, k) }; }).sort(function (a, b) { return a.n.i - b.n.i; });
      if (open.length) { const o = open[0]; it = { kind: "stripeTest", subject: o.k, title: NAME[o.k] + " stripe test, Part " + (o.n.i + 1), node: "part-" + o.k + "-" + o.n.i }; }
    }
    // 3. Today's quest chest is waiting.
    if (!it && BD.Quest) { const q = BD.Quest.current(p); if (q.done && !q.claimed) it = { kind: "quest", title: "Open your quest chest" }; }
    // 4. The belt boss, once the belt is well under way.
    if (!it) {
      const b = bossInfo(p);
      if (!b.beat && (BD.Rank.stripeCount(r) >= 2 || BD.Rank.beltXP(r) >= 200)) it = { kind: "boss", title: "Beat the boss " + b.boss.name, node: "boss" };
    }
    // 5. Practice the subject with the least XP.
    if (!it) {
      const low = lowestPractice(p, r);
      if (low) it = { kind: "stripePractice", subject: low.key, title: NAME[low.key] + " practice (" + low.x + " of " + BD.Rank.PRACTICE_MAX + " XP)", node: "prac-" + low.key + "-" + nextNeedIndex(low.x) };
    }
    // 6. Everything practiced: today's quest, the boss, or a warm-up.
    if (!it && BD.Quest) { const q = BD.Quest.current(p); if (!q.done) it = { kind: "quest", title: "Today's quest: " + q.q.title }; }
    if (!it) { const b = bossInfo(p); if (!b.beat) it = { kind: "boss", title: "Beat the boss " + b.boss.name, node: "boss" }; }
    if (!it) it = { kind: "mathStart", title: "Warm up with Math Dojo" };
    const goal = BD.Goals && BD.Goals.progress ? BD.Goals.progress(p) : null;
    it.label = (goal && goal.met ? "Keep training: " : "Next: ") + it.title;
    return it;
  }
  function nextNeedIndex(x) { let i = 0; while (i < BD.Rank.PARTS - 1 && x >= BD.Rank.partNeed(i)) i++; return i; }

  /* ---------- the path ---------- */
  function nodes(p) {
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), out = [];
    const PARTS = BD.Rank.PARTS;
    for (let m = 0; m < PARTS; m++) {
      const need = BD.Rank.partNeed(m);
      ORDER.forEach(function (k) {
        const x = r.xp[k] || 0, done = !!r.stripes[k] || x >= need;
        const firstOpen = !r.stripes[k] && nextNeedIndex(Math.min(x, BD.Rank.PRACTICE_MAX)) === m && x < need;
        out.push({ ch: m, id: "prac-" + k + "-" + m, kind: "practice", subject: k, need: need, icon: k, label: NAME[k] + " " + need,
          state: done ? "done" : firstOpen ? "ready" : "locked",
          aria: NAME[k] + " practice to " + need + " XP", have: Math.min(x, BD.Rank.PRACTICE_MAX) });
      });
      ORDER.forEach(function (k) {
        const parts = Array.isArray(r.parts && r.parts[k]) ? r.parts[k] : [];
        const done = !!r.stripes[k] || !!parts[m], n = BD.Rank.nextPart(r, k);
        const ready = !done && n && n.i === m && n.open;
        out.push({ ch: m, id: "part-" + k + "-" + m, kind: "part", subject: k, part: m, need: need, icon: "test", num: m + 1, label: NAME[k] + " Part " + (m + 1),
          state: done ? "done" : ready ? "ready" : "locked", aria: NAME[k] + " stripe test part " + (m + 1),
          have: Math.min(r.xp[k] || 0, BD.Rank.PRACTICE_MAX), prevOpen: !n || n.i >= m });
      });
      if (m === 1) {
        const sx = Math.min(BD.Rank.PRACTICE_MAX, r.xp.spanish || 0);
        out.push({ ch: 1, id: "spanish", kind: "spanish", subject: "spanish", icon: "spanish", label: "Spanish bonus", side: true, state: sx >= BD.Rank.PRACTICE_MAX ? "done" : "ready", aria: "Spanish bonus practice", have: sx });
      }
    }
    const b = bossInfo(p);
    out.push({ ch: 3, id: "boss", kind: "boss", label: b.boss.name, img: b.boss.img, state: b.beat ? "done" : "ready", aria: "Belt boss " + b.boss.name });
    const nextBelt = BD.BELTS[Math.min(BD.BELTS.length - 1, r.belt + 1)];
    out.push({ ch: 3, id: "grad", kind: "grad", icon: "grad", label: r.belt >= BD.BELTS.length - 1 ? "Master the grade" : nextBelt.name + " Belt", state: r.mastered ? "done" : "locked", aria: "Graduation", stripes: BD.Rank.stripeCount(r), nextBelt: nextBelt });
    return out;
  }
  /* The belt is 4 short chapters. The Train tab shows a compact belt card
     (belt, chapter, region) and "Your next moves": the next 2 or 3 open steps
     in kid language, like an instructor's class plan. Done steps never show
     as upcoming. A "Coming up" card always points to the next place to go. */
  function chapterOf(list, cur) {
    if (cur !== -1) return list[cur].ch;
    for (let c = 0; c < 4; c++) if (list.some(function (n) { return n.ch === c && !n.side && n.state !== "done"; })) return c;
    return 3;
  }
  const LEN = { math: "10 problems", reading: "5 sentences", spelling: "6 words", comprehension: "3 to 4 questions" };
  function skillOf(n, g) {
    try { const sk = BD.Rank.partSkills(n.subject, g)[n.part]; return sk && sk.label ? sk.label : ""; } catch (e) { return ""; }
  }
  /* Kid-friendly title and sub-line for a step. */
  function words(n, g) {
    if (n.kind === "practice") {
      const left = Math.max(0, n.need - n.have);
      return { t: NAME[n.subject] + " practice", s: left + " XP to unlock Part " + (n.ch + 1), icon: n.subject };
    }
    if (n.kind === "part") {
      const sk = skillOf(n, g);
      return { t: NAME[n.subject] + " test · Part " + (n.part + 1), s: n.state === "locked" ? lockShort(n) : (sk ? sk + " · " : "") + LEN[n.subject], icon: "test" };
    }
    if (n.kind === "boss") return { t: "Beat " + n.label, s: n.state === "done" ? "Beaten! Rematch any time" : "Belt boss · win a trophy", img: n.img };
    if (n.kind === "grad") return { t: n.label === "Master the grade" ? "Master the grade" : "Graduate to " + n.label, s: "Earn all 4 stripes (" + n.stripes + " of 4)", icon: "grad" };
    return { t: n.label, s: "", icon: n.icon || "lock" };
  }
  function moveHTML(n, g, first) {
    const w = words(n, g), locked = n.state === "locked";
    const ic = w.img ? '<img src="' + w.img + '" alt="">' : svg(locked ? "lock" : w.icon);
    return '<li><button type="button" class="mv' + (first ? " mv-first" : "") + (locked ? " mv-locked" : "") + (n.subject ? " mv-s-" + n.subject : n.kind === "boss" ? " mv-boss" : "") + '" data-node="' + n.id + '" aria-label="' + esc(w.t + ". " + w.s + (locked ? ". Locked" : first ? ". Next up" : "")) + '">' +
      '<span class="mv-ic">' + ic + '</span><span class="mv-txt"><strong>' + esc(w.t) + '</strong><span>' + esc(w.s) + '</span></span>' +
      (first ? '<span class="mv-tag">Next</span>' : '') + '<span class="mv-chev" aria-hidden="true">›</span></button></li>';
  }
  /* The next open steps (current chapter first, then the next), done steps skipped. */
  function moves(p, list, nx, howMany) {
    const order = list.filter(function (n) { return !n.side; });
    const open = order.filter(function (n) { return n.state === "ready"; });
    const cur = open.findIndex(function (n) { return n.id === nx.node; });
    if (cur > 0) open.unshift(open.splice(cur, 1)[0]);
    // The boss is always "ready" in data; offer it only when Continue does or nothing else is open.
    const openNoBoss = open.filter(function (n, i) { return n.kind !== "boss" || i === 0; });
    let pick = openNoBoss.slice(0, howMany);
    if (pick.length < howMany && open.some(function (n) { return n.kind === "boss"; }) && pick.every(function (n) { return n.kind !== "boss"; }) && openNoBoss.length === 0) pick.push(open.find(function (n) { return n.kind === "boss"; }));
    if (pick.length < howMany) {
      const locked = order.find(function (n) { return n.state === "locked" && n.kind === "part"; }) || order.find(function (n) { return n.state === "locked"; });
      if (locked) pick.push(locked);
    }
    return pick.slice(0, howMany);
  }
  function render(p) {
    const box = $("learnPath"); if (!box || !p) return;
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), belt = BD.BELTS[r.belt];
    const REG = BD.Quest.REGIONS, reg = REG[Math.min(r.belt, REG.length - 1)], nreg = REG[Math.min(r.belt + 1, REG.length - 1)];
    const list = nodes(p), nx = next(p), little = Number(g) <= 2;
    let cur = list.findIndex(function (n) { return n.id === nx.node && n.state !== "done"; });
    if (cur === -1) cur = list.findIndex(function (n) { return n.state === "ready" && !n.side && n.kind !== "boss"; });
    const ch = chapterOf(list, -1); // the earliest chapter with steps left
    const inCh = list.filter(function (n) { return n.ch === ch && !n.side; }), chDone = inCh.filter(function (n) { return n.state === "done"; }).length;
    const mv = moves(p, list, nx, little ? 2 : 3);
    const b = bossInfo(p), last = r.belt >= BD.BELTS.length - 1, nextBelt = BD.BELTS[Math.min(BD.BELTS.length - 1, r.belt + 1)];
    const thenLine = last ? "Then: master " + BD.gradeLabel(g) + "!" : "Then: " + nextBelt.name + " Belt in " + nreg.name;
    const coming = '<div class="path-next" style="--sky:' + nreg.sky + ';--ground:' + nreg.ground + '">' +
      '<span class="pnx-icon" aria-hidden="true">' + (ch < 3 ? nreg.icon : (b.boss.img ? '<img src="' + b.boss.img + '" alt="">' : nreg.icon)) + '</span><span class="pnx-txt"><span class="pnx-k">Coming up</span>' +
      (ch < 3 ? '<strong>Chapter ' + (ch + 2) + ': ' + esc(CH[ch + 1]) + '</strong>' : '<strong>' + (b.beat ? esc(thenLine.replace(/^Then: /, "")) : 'The belt boss ' + esc(b.boss.name)) + '</strong>') +
      '<span>' + (ch < 3 ? esc(thenLine) : b.beat ? "Earn all 4 stripes to graduate" : esc(thenLine)) + '</span></span></div>';
    box.innerHTML =
      '<button type="button" class="belt-card" id="pathBanner" style="--sky:' + reg.sky + ';--ground:' + reg.ground + '" aria-label="' + esc(belt.name + " Belt, chapter " + (ch + 1) + " of 4, " + reg.name + ". Open the Adventure Map") + '">' +
        '<span class="bc-belt">' + BD.Rank.beltSVG(r.belt, r.stripes, { parts: r.parts }) + '</span>' +
        '<span class="bc-txt"><span class="bc-k">Chapter ' + (ch + 1) + ' of 4</span><strong>' + esc(belt.name) + ' Belt · ' + esc(CH[ch]) + '</strong>' +
        '<span class="ch-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + inCh.length + '" aria-valuenow="' + chDone + '"><i style="width:' + Math.round(100 * chDone / inCh.length) + '%"></i></span>' +
        '<span class="bc-sub"><span aria-hidden="true">' + reg.icon + '</span> ' + esc(reg.name) + ' · ' + chDone + ' of ' + inCh.length + ' steps · map ›</span></span></button>' +
      '<h3 class="mv-head">Your next moves</h3>' +
      '<ol class="moves' + (little ? " moves-little" : "") + '">' + mv.map(function (n, i) { return moveHTML(n, g, i === 0 && n.state !== "locked"); }).join("") + '</ol>' +
      coming +
      '<button type="button" class="path-whole" id="pathWhole">See the whole belt</button>';
  }
  function chapterSheet(p, only) {
    const list = nodes(p);
    const html = CH.map(function (nm, c) {
      if (only !== undefined && c !== only) return "";
      const items = list.filter(function (n) { return n.ch === c; });
      const d = items.filter(function (n) { return n.state === "done" && !n.side; }).length, t = items.filter(function (n) { return !n.side; }).length;
      return '<div class="ch-list"><h4 class="label">Chapter ' + (c + 1) + ': ' + esc(nm) + ' · ' + d + '/' + t + (d === t ? ' ' + '<span class="ch-ok">' + svg("check") + '</span>' : '') + '</h4><ul>' +
        items.map(function (n) { const w = words(n, BD.Rank.dojoGrade(p)); return '<li class="' + n.state + '">' + (n.state === "done" ? svg("check") : n.state === "locked" ? '<span class="ch-lock">' + svg("lock") + '</span>' : '<span class="ch-dot"></span>') + esc(n.side ? "Spanish bonus practice" : w.t + (n.kind === "practice" ? " to " + n.need + " XP" : "")) + (n.side ? ' <em>bonus</em>' : '') + '</li>'; }).join("") + '</ul></div>';
    }).join("");
    BD.UI.sheet(only !== undefined ? "Chapter " + (only + 1) + " complete" : "The whole belt", '<div class="ch-sheet">' + html + '</div>');
  }
  function lockShort(n) {
    if (n.kind === "practice") return n.have + " / " + n.need + " XP";
    if (n.kind === "part") return n.prevOpen ? "Opens at " + n.need + " XP" : "Pass Part " + n.part + " first";
    if (n.kind === "grad") return n.stripes + " of 4 stripes";
    return "Locked";
  }

  /* ---------- tapping a node ---------- */
  function tap(id) {
    const p = BD.Store.current(); if (!p) return;
    const n = nodes(p).find(function (x) { return x.id === id; }); if (!n) return;
    BD.Sound.tap();
    if (n.state === "done") {
      const what = n.kind === "practice" ? "You reached " + n.need + " practice XP in " + GAME[n.subject] + "."
        : n.kind === "part" ? "You passed " + NAME[n.subject] + " Part " + (n.part + 1) + "."
        : n.kind === "boss" ? "You beat " + n.label + "! Rematch any time."
        : n.kind === "spanish" ? "You earned all your Spanish bonus XP on this belt." : "You graduated!";
      BD.UI.sheet("Done!", '<div class="unlock"><div class="chest-prize" aria-hidden="true">' + svg("check") + '</div><p>' + esc(what) + '</p>' +
        '<div class="res-actions">' + (n.kind === "boss" ? '<button type="button" class="btn btn-primary" id="pnAgain">Rematch</button>' : n.subject ? '<button type="button" class="btn btn-primary" id="pnAgain">Practice ' + esc(NAME[n.subject]) + ' again</button>' : '') +
        '<button type="button" class="btn btn-quiet" id="pnOk">Close</button></div></div>');
      $("pnOk").onclick = function () { $("infoClose").click(); };
      if ($("pnAgain")) $("pnAgain").onclick = function () { $("infoClose").click(); n.kind === "boss" ? BD.Boss.open() : BD.UI.launchStripe(n.subject, false); };
      return;
    }
    if (n.state === "locked") {
      let why;
      if (n.kind === "practice") why = "Keep practicing " + GAME[n.subject] + ". You have " + n.have + " of " + n.need + " XP.";
      else if (n.kind === "part") why = n.prevOpen ? NAME[n.subject] + " Part " + (n.part + 1) + " opens at " + n.need + " practice XP. You have " + n.have + "." : "Pass " + NAME[n.subject] + " Part " + n.part + " first. Each part opens after more practice.";
      else why = "Earn all 4 stripes (" + n.stripes + " of 4 so far) to graduate to " + n.nextBelt.name + " Belt.";
      BD.UI.sheet("Not yet!", '<div class="unlock"><div class="chest-prize" aria-hidden="true">' + svg("lock") + '</div><p>' + esc(why) + '</p><p class="muted small">Practice is how you open every step. Every round counts!</p>' +
        '<div class="res-actions">' + (n.subject ? '<button type="button" class="btn btn-primary" id="pnGo">Practice ' + esc(NAME[n.subject]) + '</button>' : '') + '<button type="button" class="btn btn-quiet" id="pnOk">OK</button></div></div>');
      $("pnOk").onclick = function () { $("infoClose").click(); };
      if ($("pnGo")) $("pnGo").onclick = function () { $("infoClose").click(); BD.UI.launchStripe(n.subject, false); };
      return;
    }
    if (n.kind === "practice" || n.kind === "spanish") BD.UI.launchStripe(n.subject, false);
    else if (n.kind === "part") BD.UI.confirmTest(n.subject);
    else if (n.kind === "boss") BD.Boss.open();
  }

  function bind() {
    const box = $("learnPath"); if (!box) return;
    box.addEventListener("click", function (e) {
      const b = e.target.closest("[data-node]"); if (b) return tap(b.dataset.node);
      if (e.target.closest("#pathBanner")) { BD.Sound.tap(); BD.Quest.openMap(); return; }
      const pk = e.target.closest("[data-chpeek]"); if (pk) { BD.Sound.tap(); chapterSheet(BD.Store.current(), Number(pk.dataset.chpeek)); return; }
      if (e.target.closest("#pathWhole")) { BD.Sound.tap(); chapterSheet(BD.Store.current()); }
    });
  }

  return { next: next, nodes: nodes, render: render, tap: tap, bind: bind, chapterSheet: chapterSheet, CH: CH };
})();
