/* ADVENTURE MAP + DAILY QUEST
   - The map: one region per belt at the dojo grade, from Rascal's Forest
     (White) to the Iron Tower (Black). The champion stands where they are;
     stripes light the path; each region's boss guards the way.
   - Daily quest: one short goal a day (about 5 minutes). Finishing it opens
     a mystery chest: bonus XP plus a sticker or a streak shield.
   - Streak shield: covers one missed day so a streak doesn't break. */
window.BD = window.BD || {};

BD.Quest = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };

  const REGIONS = [
    { name: "Rascal's Forest", sky: "#1F5B3A", ground: "#2E7D4F", icon: "🌲" },
    { name: "Hoot's Library", sky: "#3B2A63", ground: "#5A3F8C", icon: "📚" },
    { name: "Blaze Canyon", sky: "#7A2E12", ground: "#B8501E", icon: "🔥" },
    { name: "Glacier Peaks", sky: "#1D4E7A", ground: "#5EA4D6", icon: "🏔️" },
    { name: "Bamboo Grove", sky: "#24512A", ground: "#4F8F3A", icon: "🎋" },
    { name: "Shadow Village", sky: "#241A3D", ground: "#4A3670", icon: "🏯" },
    { name: "Agent Bridgette's HQ", sky: "#2A2A33", ground: "#5C4A3A", icon: "🕵️" },
    { name: "Star Force Station", sky: "#1B1F4F", ground: "#A3263B", icon: "🚀" },
    { name: "Iron Tower", sky: "#1A1A20", ground: "#7A1F1F", icon: "🗼" }
  ];

  const STICKERS = [
    ["🥋", "Gi"], ["🐉", "Dragon"], ["🐯", "Tiger"], ["🦊", "Fox"], ["🐼", "Panda"], ["🦉", "Owl"], ["🐻", "Bear"], ["🐺", "Wolf"],
    ["🦅", "Eagle"], ["🦁", "Lion"], ["🐢", "Turtle"], ["🦈", "Shark"], ["⚡", "Lightning"], ["🔥", "Fire"], ["🌟", "Star"], ["🏆", "Trophy"],
    ["🎯", "Bullseye"], ["💎", "Diamond"], ["🌙", "Moon"], ["☄️", "Comet"], ["🌊", "Wave"], ["🍀", "Clover"], ["🎖️", "Medal"], ["👑", "Crown"]
  ];
  const MAX_SHIELDS = 2;

  /* ---------- saved state ---------- */
  const DAY_RE = /^\d{4}-\d\d-\d\d$/;
  function sanitize(p) {
    const q = p.quest;
    p.quest = q && typeof q === "object" && DAY_RE.test(q.day) ? { day: q.day, id: /^[a-z0-9-]{2,20}$/.test(q.id) ? q.id : "", claimed: !!q.claimed } : null;
    if (!p.quest) delete p.quest;
    p.shields = Math.max(0, Math.min(MAX_SHIELDS, Math.round(Number(p.shields) || 0)));
    p.shielded = (Array.isArray(p.shielded) ? p.shielded : []).filter(function (d) { return typeof d === "string" && DAY_RE.test(d); }).slice(-30);
    p.stickers = (Array.isArray(p.stickers) ? p.stickers : []).map(Number).filter(function (i, k, a) { return i >= 0 && i < STICKERS.length && Math.floor(i) === i && a.indexOf(i) === k; });
    p.chests = Math.max(0, Math.min(99999, Math.round(Number(p.chests) || 0)));
  }

  /* ---------- today's quest ---------- */
  function todays(p) {
    const t = BD.today();
    return (p.sessions || []).filter(function (s) { return s.date && s.date.slice(0, 10) === t; });
  }
  const GAME_NAMES = { math: "Math Dojo", sentence: "Fix-It Sentences", reading: "Story Scrolls", spelling: "Spelling Bee", spanish: "Spanish Dojo" };
  /* Each quest: title, goal, and how far along today's sessions are. */
  function questList(p) {
    const list = [
      { id: "rounds2", title: "Finish 2 rounds", goal: 2, count: function (ss) { return ss.filter(function (s) { return s.game !== "duel"; }).length; } },
      { id: "answers25", title: "Answer 25 questions", goal: 25, count: function (ss) { return ss.reduce(function (a, s) { return a + (s.total || 0); }, 0); } },
      { id: "sharp", title: "Score 90% or better in a round", goal: 1, count: function (ss) { return ss.filter(function (s) { return s.total >= 5 && s.correct / s.total >= 0.9; }).length; } },
      { id: "boss", title: "Fight your belt boss", goal: 1, count: function (ss) { return ss.filter(function (s) { return s.game === "boss"; }).length; } }
    ];
    Object.keys(GAME_NAMES).forEach(function (g) {
      list.push({ id: "play-" + g, title: "Play a round of " + GAME_NAMES[g], goal: 1, count: function (ss) { return ss.filter(function (s) { return s.game === g && !s.school; }).length; }, game: g });
    });
    if (BD.School && BD.School.has(p)) {
      const school = { id: "school", title: "Practice your school words", goal: 1, count: function (ss) { return ss.filter(function (s) { return s.school; }).length; } };
      list.push(school, school); // twice as likely while there's a list
    }
    return list;
  }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function current(p) {
    const t = BD.today();
    const list = questList(p);
    if (!p.quest || p.quest.day !== t) p.quest = { day: t, id: list[hash(p.id + t) % list.length].id, claimed: false };
    const q = list.find(function (x) { return x.id === p.quest.id; }) || list[hash(p.id + t) % list.length]; // today's quest stays put
    const n = Math.min(q.goal, q.count(todays(p)));
    return { q: q, n: n, done: n >= q.goal, claimed: p.quest.claimed };
  }

  /* ---------- streak shield ---------- */
  function key(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  /* Called on the home screen: if yesterday was missed but the day before
     counted, a shield fills yesterday in. Returns the saved streak length. */
  function protect(p) {
    if (!p.shields) return 0;
    const have = new Set((p.days || []).concat(p.shielded || []));
    const y = new Date(); y.setDate(y.getDate() - 1);
    const y2 = new Date(); y2.setDate(y2.getDate() - 2);
    if (have.has(key(y)) || !have.has(key(y2))) return 0;
    p.shielded.push(key(y)); p.shields--;
    BD.Store.save(p);
    return BD.streak(p).days;
  }

  /* ---------- the chest ---------- */
  function openChest(p) {
    const c = current(p);
    if (!c.done || c.claimed) return null;
    const xp = [20, 25, 30, 40, 50][Math.floor(Math.random() * 5)];
    BD.addXP(p, xp);
    p.quest.claimed = true; p.chests++;
    const missing = STICKERS.map(function (_, i) { return i; }).filter(function (i) { return p.stickers.indexOf(i) === -1; });
    let prize;
    if (p.shields < MAX_SHIELDS && (Math.random() < 0.35 || !missing.length)) { p.shields++; prize = { kind: "shield" }; }
    else if (missing.length) { const i = missing[Math.floor(Math.random() * missing.length)]; p.stickers.push(i); prize = { kind: "sticker", i: i }; }
    else prize = { kind: "xp" };
    BD.Store.save(p);
    return { xp: xp, prize: prize };
  }
  function chestSheet(p) {
    BD.UI.sheet("Mystery chest!",
      '<div class="chest-wrap"><button type="button" class="chest" id="chestBtn" aria-label="Open the chest">🎁</button><p class="muted">Quest complete! Tap the chest to open it.</p></div>');
    $("chestBtn").onclick = function () {
      const r = openChest(p);
      if (!r) { $("infoClose").click(); return; }
      BD.Sound.belt(); BD.confetti(140);
      const pz = r.prize;
      document.getElementById("infoBody").innerHTML = '<div class="chest-wrap opened">' +
        (pz.kind === "shield" ? '<div class="chest-prize">🛡️</div><h3>Streak shield!</h3><p>If you miss a day, it saves your streak. You have ' + p.shields + ' of ' + MAX_SHIELDS + '.</p>' :
          pz.kind === "sticker" ? '<div class="chest-prize">' + STICKERS[pz.i][0] + '</div><h3>New sticker: ' + STICKERS[pz.i][1] + '!</h3><p>It\'s in your sticker book on the Adventure Map (' + p.stickers.length + ' of ' + STICKERS.length + ').</p>' :
            '<div class="chest-prize">⭐</div><h3>Bonus treasure!</h3>') +
        '<p class="chest-xp">+' + r.xp + ' XP</p><p class="muted small">Come back tomorrow for a new quest.</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="chestDone">Awesome!</button><button type="button" class="btn btn-quiet" id="chestMap">See my map</button></div></div>';
      $("chestDone").onclick = function () { $("infoClose").click(); BD.UI.home(); };
      $("chestMap").onclick = function () { openMap(); };
    };
  }

  /* ---------- home cards ---------- */
  function render(p) {
    const qc = $("questCard"), mc = $("mapCard"); if (!qc || !mc || !p) return;
    const c = current(p), pct = Math.round(100 * c.n / c.q.goal);
    qc.className = "quest-card" + (c.done && !c.claimed ? " ready" : "") + (c.claimed ? " claimed" : "");
    qc.innerHTML = '<span class="quest-icon" aria-hidden="true">' + (c.claimed ? "✅" : c.done ? "🎁" : "⭐") + '</span>' +
      '<span class="quest-txt"><span class="boss-k">Today\'s quest' + (p.shields ? ' · 🛡️' + (p.shields > 1 ? "×" + p.shields : "") : '') + '</span><strong>' + esc(c.q.title) + '</strong>' +
      (c.claimed ? '<span class="boss-sub">Done! New quest tomorrow.</span>' : c.done ? '<span class="boss-sub">Quest complete! Tap to open your chest</span>' :
        '<span class="quest-bar"><span style="width:' + pct + '%"></span></span><span class="boss-sub">' + c.n + ' / ' + c.q.goal + (c.q.goal === 25 ? " questions" : "") + '</span>') + '</span>';
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), reg = REGIONS[r.belt];
    mc.innerHTML = '<span class="map-mini" style="--sky:' + reg.sky + ';--ground:' + reg.ground + '" aria-hidden="true">' + reg.icon + '</span>' +
      '<span class="quest-txt"><span class="boss-k">🗺️ Adventure Map</span><strong>' + esc(r.mastered ? "Grade mastered!" : reg.name) + '</strong><span class="boss-sub">' +
      (r.mastered ? "Every region cleared" : BD.Rank.stripeCount(r) + ' of 4 stripes to the next region') + '</span></span>';
  }
  function questTap() {
    const p = BD.Store.current(); if (!p) return;
    const c = current(p);
    if (c.done && !c.claimed) return chestSheet(p);
    if (c.claimed) return openMap();
    // take them straight to the quest
    if (c.q.game === "math") BD.MathGame.openSetup();
    else if (c.q.game === "sentence") BD.SentenceGame.start();
    else if (c.q.game === "reading") BD.Reading.start();
    else if (c.q.game === "spelling" || c.q.game === "spanish") BD.WordQuiz.start(c.q.game);
    else if (c.q.id === "school") BD.WordQuiz.start("spelling", null, "practice");
    else if (c.q.id === "boss") BD.Boss.open();
    else $("startTraining").click();
  }

  /* ---------- the map ---------- */
  function openMap() {
    const p = BD.Store.current(); if (!p) return;
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), beat = BD.Boss.wins(p, g);
    const here = r.mastered ? 9 : r.belt;
    const sc = BD.Rank.stripeCount(r);
    const html = '<p class="muted small">' + BD.gradeLabel(g) + ' · Earn 4 stripes to clear a region. Beat each boss for a trophy.</p><ol class="map">' +
      REGIONS.map(function (reg, i) {
        const st = i < here ? "cleared" : i === here ? "here" : "locked", b = BD.Boss.BOSSES[i];
        const dots = [0, 1, 2, 3].map(function (k) { return '<span class="map-dot' + (st === "cleared" || (st === "here" && k < sc) ? " on" : "") + '"></span>'; }).join("");
        return '<li class="region ' + st + '" style="--sky:' + reg.sky + ';--ground:' + reg.ground + ';--belt:' + BD.BELTS[i].color + '"' + (st === "here" ? ' id="mapHere"' : '') + '>' +
          '<div class="region-scene" aria-hidden="true"><span class="region-icon">' + reg.icon + '</span>' +
          (st === "here" ? '<span class="region-champ">' + BD.UI.championHTML(p) + '</span>' : '') +
          '<img class="region-boss" src="' + b.img + '" alt="">' + (beat.indexOf(i) !== -1 ? '<span class="region-trophy" title="Boss beaten">🏆</span>' : '') + '</div>' +
          '<div class="region-info"><span class="belt-swatch" style="--belt:' + BD.BELTS[i].color + '"></span> <strong>' + esc(st === "locked" ? "???" : reg.name) + '</strong>' +
          '<span class="region-sub">' + BD.BELTS[i].name + ' Belt · ' + (st === "cleared" ? "Cleared ✓" : st === "here" ? "You are here" : "Locked 🔒") + '</span>' +
          '<span class="map-dots" aria-label="' + (st === "here" ? sc : st === "cleared" ? 4 : 0) + ' of 4 stripes">' + dots + '</span>' +
          (st === "here" ? '<button type="button" class="btn btn-small btn-primary" id="mapBoss">Boss: ' + esc(b.name) + '</button>' : '') + '</div></li>';
      }).join("") + '</ol>' +
      (r.mastered ? '<p class="map-done">👑 You cleared every region in ' + BD.gradeLabel(g) + '!</p>' : '') +
      '<h4 class="label">Sticker book · ' + p.stickers.length + ' of ' + STICKERS.length + '</h4><div class="stickers">' +
      STICKERS.map(function (s, i) { const got = p.stickers.indexOf(i) !== -1; return '<span class="sticker' + (got ? " got" : "") + '" title="' + (got ? s[1] : "Not found yet") + '">' + (got ? s[0] : "?") + '</span>'; }).join("") + '</div>' +
      '<p class="muted small">Finish your daily quest to open a mystery chest: bonus XP plus a sticker or a 🛡️ streak shield (you have ' + p.shields + ' of ' + MAX_SHIELDS + ').</p>';
    BD.UI.sheet("Adventure Map", html);
    if ($("mapBoss")) $("mapBoss").onclick = function () { BD.Boss.open(); };
    setTimeout(function () { const h = $("mapHere"); if (h && h.scrollIntoView) h.scrollIntoView({ block: "center" }); }, 80);
  }

  function bind() {
    if ($("questCard")) $("questCard").addEventListener("click", questTap);
    if ($("mapCard")) $("mapCard").addEventListener("click", openMap);
  }

  BD.Store.players().forEach(sanitize); // saves loaded before this file

  return { REGIONS: REGIONS, STICKERS: STICKERS, sanitize: sanitize, current: current, protect: protect, openChest: openChest, render: render, openMap: openMap, bind: bind };
})();
