/* DAILY GOALS AND PLAY LIMITS — healthy play parents can trust.
   - A daily goal per student (rounds or minutes). When it's met: "Training
     complete! See you tomorrow." with a Power Break or reading suggestion,
     and a check mark on the home screen.
   - An optional daily time limit. When it's reached, starting a new round
     shows "Time's up for today" (the current round can finish). A parent can
     unlock 15 more minutes with the Parents PIN.
   Time counts only while a learning or game screen is open and the app is
   visible. Settings live in the Parents area. */
window.BD = window.BD || {};

BD.Goals = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const PLAY = /^screen-(math-play|sentence-play|read-play|word-play|boss|tourney|duel)$/;
  const GOALS = [["r1", "1 round"], ["r2", "2 rounds"], ["r3", "3 rounds"], ["r5", "5 rounds"], ["m10", "10 minutes"], ["m15", "15 minutes"], ["m20", "20 minutes"], ["m30", "30 minutes"], ["off", "No daily goal"]];
  const LIMITS = [["off", "No limit"], ["20", "20 minutes"], ["30", "30 minutes"], ["45", "45 minutes"], ["60", "1 hour"], ["90", "1½ hours"]];

  function day(p) {
    const t = BD.today();
    if (!p.today || p.today.d !== t) p.today = { d: t, s: 0, r: 0, extra: 0, done: false };
    return p.today;
  }
  function settings(p) { return { goal: p.goal || "r3", limit: p.limit || "off" }; }
  function goalParts(p) {
    const g = settings(p).goal; if (g === "off") return null;
    return { kind: g.charAt(0) === "m" ? "min" : "rounds", n: Number(g.slice(1)) };
  }
  function progress(p) {
    const d = day(p), g = goalParts(p); if (!g) return null;
    const have = g.kind === "min" ? Math.floor(d.s / 60) : d.r;
    return { have: Math.min(have, g.n), need: g.n, kind: g.kind, met: have >= g.n };
  }
  function limitLeft(p) {
    const l = settings(p).limit; if (l === "off") return Infinity;
    const d = day(p); return Number(l) * 60 + (d.extra || 0) * 60 - d.s;
  }

  /* ---------- timing ---------- */
  let cur = null, last = 0, ticker = null;
  function tick() {
    const p = BD.Store.current();
    if (!p || !cur || !PLAY.test(cur) || document.visibilityState !== "visible") { last = Date.now(); return; }
    const now = Date.now(), dt = Math.min(30, Math.max(0, (now - last) / 1000)); last = now;
    const d = day(p); d.s = Math.round(d.s + dt);
    if (Math.round(d.s) % 30 === 0) BD.Store.save(p);
    checkGoal(p);
  }
  function start() { if (!ticker) { last = Date.now(); ticker = setInterval(tick, 5000); } }

  /* ---------- goal met ---------- */
  function checkGoal(p) {
    const pr = progress(p), d = day(p);
    if (!pr || !pr.met || d.done) return;
    d.done = true; BD.Store.save(p);
    // celebrate after the current round, on the results or home screen
    pending = true;
  }
  let pending = false;
  function celebrate() {
    if (!pending) return; pending = false;
    const p = BD.Store.current(); if (!p) return;
    BD.UI.sheet("Training complete!", '<div class="unlock"><div class="chest-prize">🥋</div><h3>You hit today\'s goal, ' + esc(p.name) + '!</h3>' +
      '<p>Great work. See you tomorrow, champion.</p><p class="muted">Want more? Take a Power Break, read a Story Scroll, or keep training. Every extra round still counts.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="goalOk">Osu!</button></div></div>');
    BD.Sound.belt(); BD.confetti(120);
    $("goalOk").onclick = function () { $("infoClose").click(); };
  }

  /* ---------- time limit ---------- */
  function blockIfOver(id) {
    const p = BD.Store.current(); if (!p || !PLAY.test(id)) return false;
    if (limitLeft(p) > 0) return false;
    // let the game finish starting, then stop it and go home (never mid-call)
    setTimeout(function () {
      [BD.MathGame, BD.SentenceGame, BD.Reading, BD.WordQuiz, BD.Boss, BD.Tourney, BD.Duel].forEach(function (m) { try { if (m && m.stop) m.stop(); } catch (e) { /* ignore */ } });
      if (BD.UI.home) BD.UI.home();
    }, 0);
    setTimeout(function () {
      BD.UI.sheet("Time's up for today", '<div class="unlock"><div class="chest-prize">🌙</div><h3>That\'s today\'s training time, ' + esc(p.name) + '!</h3>' +
        '<p>Rest is part of training. Your progress is saved. See you tomorrow!</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-quiet" id="limitMore">Parent: 15 more minutes</button><button type="button" class="btn btn-primary" id="limitOk">Osu!</button></div></div>');
      $("limitOk").onclick = function () { $("infoClose").click(); };
      $("limitMore").onclick = function () { BD.Parent.gate(function () { const d = day(p); d.extra = (d.extra || 0) + 15; BD.Store.save(p); if (!$("infoSheet").hidden) $("infoClose").click(); BD.UI.home(); }); };
    }, 150);
    return true;
  }

  /* ---------- home line ---------- */
  function homeLine(p) {
    let el = $("goalLine");
    const anchor = $("homeToday"); if (!anchor) return;
    if (!el) { el = document.createElement("p"); el.id = "goalLine"; el.className = "goal-line"; anchor.insertAdjacentElement("afterend", el); }
    const pr = progress(p), left = limitLeft(p);
    if (!pr && left === Infinity) { el.hidden = true; return; }
    el.hidden = false;
    const pct = pr ? Math.round(100 * pr.have / pr.need) : 0;
    el.innerHTML = (pr ? '<span class="goal-ring' + (pr.met ? " met" : "") + '" style="--pct:' + pct + '"><span>' + (pr.met ? "✓" : pr.have) + '</span></span><span><strong>' + (pr.met ? "Today's goal done!" : "Today's goal") + '</strong> ' +
      (pr.met ? "" : pr.have + " of " + pr.need + (pr.kind === "min" ? " minutes" : pr.need === 1 ? " round" : " rounds")) + '</span>' : '') +
      (left !== Infinity ? '<span class="goal-left">' + (left > 0 ? Math.ceil(left / 60) + " min left today" : "Time's up for today") + '</span>' : '');
  }

  /* ---------- Parents area ---------- */
  BD.Settings.add({
    id: "goals", scope: "student", title: "Daily goal and play time",
    html: function (p) {
      const s = settings(p), d = day(p), pr = progress(p);
      const opt = function (list, v) { return list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === v ? " selected" : "") + '>' + o[1] + '</option>'; }).join(""); };
      return '<p class="muted small">A daily goal gives ' + esc(p.name) + ' a clear finish line. The time limit is optional; the round in progress can always finish.</p>' +
        '<div class="set-row"><label>Daily goal <select data-goal>' + opt(GOALS, s.goal) + '</select></label>' +
        '<label>Time limit <select data-limit>' + opt(LIMITS, s.limit) + '</select></label></div>' +
        '<p class="small">Today: ' + Math.floor(d.s / 60) + ' min, ' + d.r + (d.r === 1 ? ' round' : ' rounds') + (pr ? (pr.met ? ' · goal done ✓' : ' · goal ' + pr.have + ' of ' + pr.need) : '') + '</p>';
    },
    bind: function (el, p, rerender) {
      el.querySelector("[data-goal]").onchange = function () { p.goal = this.value; day(p).done = false; BD.Store.save(p); rerender(); };
      el.querySelector("[data-limit]").onchange = function () { p.limit = this.value; BD.Store.save(p); rerender(); };
    }
  });

  function sanitize(p) {
    if (p.goal !== undefined && !GOALS.some(function (g) { return g[0] === p.goal; })) delete p.goal;
    if (p.limit !== undefined && !LIMITS.some(function (g) { return g[0] === p.limit; })) delete p.limit;
    if (p.today && !(typeof p.today === "object" && /^\d{4}-\d\d-\d\d$/.test(p.today.d))) delete p.today;
    else if (p.today) p.today = { d: p.today.d, s: Math.max(0, Math.min(86400, Number(p.today.s) || 0)), r: Math.max(0, Math.min(500, Number(p.today.r) || 0)), extra: Math.max(0, Math.min(600, Number(p.today.extra) || 0)), done: !!p.today.done };
  }

  BD.on("screen", function (id) {
    const was = cur; cur = id; last = Date.now(); start();
    if (PLAY.test(id) && !PLAY.test(was || "")) blockIfOver(id);
    if (id === "screen-results" || id === "screen-home") setTimeout(celebrate, 1900);
  });
  BD.on("results", function (e) { if (!e || !e.p) return; const d = day(e.p); d.r++; BD.Store.save(e.p); checkGoal(e.p); });
  BD.on("home", function (p) { homeLine(p); });
  document.addEventListener("visibilitychange", function () { last = Date.now(); });

  return { progress: progress, limitLeft: limitLeft, settings: settings, sanitize: sanitize, homeLine: homeLine, GOALS: GOALS, LIMITS: LIMITS };
})();
