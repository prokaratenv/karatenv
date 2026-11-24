/* LEARNING PATH + CONTINUE — one big button that always knows what's next,
   and a winding path of the current belt (Duolingo style).
   - next(p): the next best activity, with a clear label.
   - render(p): the path for the Dojo grade's current belt, themed by the
     belt's Adventure Map region (banner opens the full map).
   Path order rotates subjects: Math 25, Reading 25, Spelling 25, Stories 25,
   then each Part 1, then 50 XP, Part 2 ... then the belt boss and graduation.
   Any ready node can be tapped; locked nodes explain what opens them.
   Shown as 4 short chapters (only the current one as a path; Pre-K to 2nd
   see just the next 4 steps), with a Coming up card for what's next. */
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
    if (!it) ORDER.some(function (k) {
      if (!BD.Rank.canTest(p, k, g) || r.stripes[k]) return false;
      const n = BD.Rank.nextPart(r, k);
      it = { kind: "stripeTest", subject: k, title: NAME[k] + " stripe test, Part " + (n.i + 1), node: "part-" + k + "-" + n.i };
      return true;
    });
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
  const OFFS = [0, 42, 72, 42, 0, -42, -72, -42];
  /* The belt is shown as 4 short chapters so it never feels daunting:
     finished chapters fold into gold badges, only the current chapter is a
     path, and a "Coming up" card always shows the next place to go. */
  function chapterOf(list, cur) {
    if (cur !== -1) return list[cur].ch;
    for (let c = 0; c < 4; c++) if (list.some(function (n) { return n.ch === c && !n.side && n.state !== "done"; })) return c;
    return 3;
  }
  function nodeHTML(n, off, face, extra) {
    const inner = n.state === "done" ? svg("check") : n.state === "locked" ? (n.img ? '<img src="' + n.img + '" alt="">' : svg(n.icon || "lock")) + '<span class="pn-lock">' + svg("lock") + '</span>'
      : n.img ? '<img src="' + n.img + '" alt="">' : svg(n.icon);
    const sub = n.state === "locked" ? lockShort(n) : n.state === "done" ? "Done" : n.current ? "Start" : "Ready";
    return '<li class="pn-row' + (extra ? " " + extra : "") + '" style="--off:' + off + 'px">' +
      '<button type="button" class="pn pn-' + n.kind + ' pn-' + n.state + (n.current ? " pn-current" : "") + (n.side ? " pn-side" : "") + (n.subject ? " pn-s-" + n.subject : "") + '" data-node="' + n.id + '" aria-label="' + esc(n.aria + ", " + (n.current ? "next up" : n.state)) + '">' +
        '<span class="pn-disc">' + inner + (n.num && n.state !== "done" ? '<span class="pn-num">' + n.num + '</span>' : '') + '</span>' +
        (n.current ? '<span class="pn-face">' + face + '</span>' : '') +
        '<span class="pn-label">' + esc(n.label) + '<small>' + esc(sub) + '</small></span></button></li>';
  }
  function render(p) {
    const box = $("learnPath"); if (!box || !p) return;
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), belt = BD.BELTS[r.belt];
    const REG = BD.Quest.REGIONS, reg = REG[Math.min(r.belt, REG.length - 1)], nreg = REG[Math.min(r.belt + 1, REG.length - 1)];
    const list = nodes(p), nx = next(p);
    let cur = list.findIndex(function (n) { return n.id === nx.node && n.state !== "done"; });
    if (cur === -1) cur = list.findIndex(function (n) { return n.state === "ready" && !n.side; });
    if (cur !== -1) list[cur].current = true;
    const ch = chapterOf(list, cur), little = Number(g) <= 2;
    let shown = list.filter(function (n) { return n.ch === ch; });
    if (little) { // little kids: just the next 4 steps
      let at = shown.findIndex(function (n) { return n.current; });
      if (at === -1) at = Math.max(0, shown.findIndex(function (n) { return n.state !== "done" && !n.side; }));
      shown = shown.slice(at, at + 4);
    }
    const face = BD.UI.avatar ? BD.UI.avatar(p, "sm") : "";
    let k = 0;
    const rows = shown.map(function (n) { return nodeHTML(n, n.side ? 96 : OFFS[k++ % OFFS.length], face); }).join("");
    const inCh = list.filter(function (n) { return n.ch === ch && !n.side; }), chDone = inCh.filter(function (n) { return n.state === "done"; }).length;
    const teaser = ch < 3 ? list.filter(function (n) { return n.ch === ch + 1 && !n.side; }).slice(0, little ? 1 : 2).map(function (n) { return nodeHTML(n, OFFS[k++ % OFFS.length], face, "pn-teaser"); }).join("") : "";
    const b = bossInfo(p), last = r.belt >= BD.BELTS.length - 1, nextBelt = BD.BELTS[Math.min(BD.BELTS.length - 1, r.belt + 1)];
    const thenLine = last ? "Then: master " + BD.gradeLabel(g) + "!" : "Then: " + nextBelt.name + " Belt in " + nreg.name;
    const coming = '<div class="path-next" style="--sky:' + nreg.sky + ';--ground:' + nreg.ground + '">' +
      '<span class="pnx-icon" aria-hidden="true">' + (ch < 3 ? nreg.icon : (b.boss.img ? '<img src="' + b.boss.img + '" alt="">' : nreg.icon)) + '</span><span class="pnx-txt"><span class="pnx-k">Coming up</span>' +
      (ch < 3 ? '<strong>Chapter ' + (ch + 2) + ': ' + esc(CH[ch + 1]) + '</strong><span>' + esc(CH_SUB[ch + 1]) + '</span>' : '') +
      '<span>' + (b.beat ? "" : 'Next stop: the belt boss ' + esc(b.boss.name) + '. ') + esc(thenLine) + '</span></span></div>';
    const badges = ch > 0 ? '<div class="ch-done-row">' + CH.slice(0, ch).map(function (nm, i) {
      return '<button type="button" class="ch-done" data-chpeek="' + i + '"><span aria-hidden="true">' + svg("check") + '</span>Chapter ' + (i + 1) + ' complete</button>'; }).join("") + '</div>' : '';
    const doneN = list.filter(function (n) { return n.state === "done" && !n.side; }).length, totalN = list.filter(function (n) { return !n.side; }).length;
    box.innerHTML = '<button type="button" class="path-banner" id="pathBanner" style="--sky:' + reg.sky + ';--ground:' + reg.ground + '" aria-label="' + esc(belt.name + " Belt, " + reg.name + ". Open the Adventure Map") + '">' +
      '<span class="pb-icon" aria-hidden="true">' + reg.icon + '</span><span class="pb-txt"><span class="pb-k">' + esc(BD.gradeLabel(g)) + ' · ' + esc(belt.name) + ' Belt</span><strong>' + esc(reg.name) + '</strong>' +
      '<span class="pb-bar"><i style="width:' + Math.round(100 * doneN / totalN) + '%"></i></span><span class="pb-sub">' + doneN + ' of ' + totalN + ' steps · tap for the map</span></span></button>' +
      badges +
      '<div class="ch-head"><span class="ch-k">Chapter ' + (ch + 1) + ' of 4</span><strong>' + esc(CH[ch]) + '</strong>' +
      '<span class="ch-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + inCh.length + '" aria-valuenow="' + chDone + '"><i style="width:' + Math.round(100 * chDone / inCh.length) + '%"></i></span>' +
      '<span class="ch-sub">' + chDone + ' of ' + inCh.length + ' steps in this chapter</span></div>' +
      '<ol class="path" style="--sky:' + reg.sky + '">' + rows + teaser + '</ol>' + coming +
      '<button type="button" class="path-whole" id="pathWhole">See the whole belt</button>';
  }
  function chapterSheet(p, only) {
    const list = nodes(p);
    const html = CH.map(function (nm, c) {
      if (only !== undefined && c !== only) return "";
      const items = list.filter(function (n) { return n.ch === c; });
      const d = items.filter(function (n) { return n.state === "done" && !n.side; }).length, t = items.filter(function (n) { return !n.side; }).length;
      return '<div class="ch-list"><h4 class="label">Chapter ' + (c + 1) + ': ' + esc(nm) + ' · ' + d + '/' + t + (d === t ? ' ' + '<span class="ch-ok">' + svg("check") + '</span>' : '') + '</h4><ul>' +
        items.map(function (n) { return '<li class="' + (n.state === "done" ? "done" : "") + '">' + (n.state === "done" ? svg("check") : '<span class="ch-dot"></span>') + esc(n.label) + (n.side ? ' <em>bonus</em>' : '') + '</li>'; }).join("") + '</ul></div>';
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
