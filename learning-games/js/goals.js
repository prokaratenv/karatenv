/* DAILY GOAL AND BREAK REMINDERS — healthy play with no parent involvement.
   - Daily goal (default 30 minutes of training). When it's met: "You reached
     your goal for today. See you training tomorrow!" with one button, Keep
     training, which resets the reminder.
   - If they keep going, the same message comes back every 30 minutes of play.
     Nothing is ever locked: students can always keep training.
   Reminders appear between rounds (results or home screen), never in the
   middle of a question. Time counts only while a game screen is open and
   the app is visible. Parents can change the goal or reminder spacing in
   the Parents area, but don't have to. */
window.BD = window.BD || {};

BD.Goals = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const PLAY = /^screen-(math-play|sentence-play|read-play|word-play|boss|tourney|duel)$/;
  const GOALS = [["m30", "30 minutes"], ["m20", "20 minutes"], ["m15", "15 minutes"], ["m45", "45 minutes"], ["r3", "3 rounds"], ["r5", "5 rounds"], ["off", "No daily goal"]];
  const EVERY = [["30", "Every 30 minutes"], ["20", "Every 20 minutes"], ["45", "Every 45 minutes"], ["60", "Every hour"], ["off", "Only once a day"]];

  function day(p) {
    const t = BD.today();
    if (!p.today || p.today.d !== t) p.today = { d: t, s: 0, r: 0, done: false, nb: 0 };
    return p.today;
  }
  function settings(p) { return { goal: p.goal || "m30", every: p.every || "30" }; }
  function goalParts(p) {
    const g = settings(p).goal; if (g === "off") return null;
    return { kind: g.charAt(0) === "m" ? "min" : "rounds", n: Number(g.slice(1)) };
  }
  function progress(p) {
    const d = day(p), g = goalParts(p); if (!g) return null;
    const have = g.kind === "min" ? Math.floor(d.s / 60) : d.r;
    return { have: Math.min(have, g.n), need: g.n, kind: g.kind, met: have >= g.n };
  }
  /* Seconds of play when the next break reminder is due. */
  function nextBreak(p) {
    const e = settings(p).every; if (e === "off") return Infinity;
    const d = day(p), gap = Number(e) * 60;
    return d.nb || gap;
  }

  /* ---------- timing ---------- */
  let cur = null, last = 0, ticker = null, pending = null;
  function tick() {
    const p = BD.Store.current();
    if (!p || !cur || !PLAY.test(cur) || document.visibilityState !== "visible") { last = Date.now(); return; }
    const now = Date.now(), dt = Math.min(30, Math.max(0, (now - last) / 1000)); last = now;
    const d = day(p); d.s = Math.round(d.s + dt);
    if (d.s % 30 < 5) BD.Store.save(p);
    check(p);
  }
  function start() { if (!ticker) { last = Date.now(); ticker = setInterval(tick, 5000); } }
  function check(p) {
    const d = day(p), pr = progress(p);
    if (pr && pr.met && !d.done) {
      d.done = true; pending = "goal";
      d.nb = d.s + (settings(p).every === "off" ? Infinity : Number(settings(p).every) * 60); // next reminder counts from here
      BD.Store.save(p); return;
    }
    if (d.s >= nextBreak(p)) {
      pending = pending || "break";
      d.nb = d.s + Number(settings(p).every) * 60;
      BD.Store.save(p);
    }
  }

  /* ---------- the reminder (between rounds only) ----------
     One simple message: today's goal is reached, see you tomorrow. "Keep
     training" closes it and starts the clock for the next reminder. */
  function show() {
    if (!pending) return;
    if (BD.UI.sheetOpen && BD.UI.sheetOpen()) return setTimeout(show, 1500);
    const p = BD.Store.current(); if (!p) return;
    const first = pending === "goal"; pending = null;
    BD.UI.sheet("Goal reached!", '<div class="unlock"><div class="chest-prize">🥋</div><h3>Great training, ' + esc(p.name) + '!</h3>' +
      '<p>You reached your goal for today. See you training tomorrow!</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="goalOk">Keep training</button></div></div>');
    if (first) { BD.Sound.belt(); BD.confetti(120); } else BD.Sound.tap();
    $("goalOk").onclick = function () {
      const d = day(p), e = settings(p).every;
      if (e !== "off") d.nb = d.s + Number(e) * 60; // reset: next reminder from now
      BD.Store.save(p); $("infoClose").click();
    };
  }

  /* ---------- home line ---------- */
  function homeLine(p) {
    let el = $("goalLine");
    const anchor = $("homeToday"); if (!anchor) return;
    if (!el) { el = document.createElement("p"); el.id = "goalLine"; el.className = "goal-line"; anchor.insertAdjacentElement("afterend", el); }
    const pr = progress(p);
    if (!pr) { el.hidden = true; return; }
    el.hidden = false;
    const pct = Math.round(100 * pr.have / pr.need);
    el.innerHTML = '<span class="goal-ring' + (pr.met ? " met" : "") + '" style="--pct:' + pct + '"><span>' + (pr.met ? "✓" : pr.have) + '</span></span><span><strong>' + (pr.met ? "Today's training done!" : "Today's training") + '</strong> ' +
      (pr.met ? '<span class="muted">Extra rounds still count.</span>' : pr.have + " of " + pr.need + (pr.kind === "min" ? " minutes" : pr.need === 1 ? " round" : " rounds")) + '</span>';
  }

  /* ---------- Parents area (optional) ---------- */
  BD.Settings.add({
    id: "goals", scope: "student", title: "Daily training and break reminders",
    html: function (p) {
      const s = settings(p), d = day(p), pr = progress(p);
      const opt = function (list, v) { return list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === v ? " selected" : "") + '>' + o[1] + '</option>'; }).join(""); };
      return '<p class="muted small">Works on its own: after about 30 minutes ' + esc(p.name) + ' sees "You reached your goal for today. See you training tomorrow!" If they tap Keep training, it reminds them again every 30 minutes. Nothing is ever locked. Change it here if you like.</p>' +
        '<div class="set-row"><label>Daily goal <select data-goal>' + opt(GOALS, s.goal) + '</select></label>' +
        '<label>Remind again <select data-every>' + opt(EVERY, s.every) + '</select></label></div>' +
        '<p class="small">Today: ' + Math.floor(d.s / 60) + ' min, ' + d.r + (d.r === 1 ? ' round' : ' rounds') + (pr ? (pr.met ? ' · goal done ✓' : ' · goal ' + pr.have + ' of ' + pr.need) : '') + '</p>';
    },
    bind: function (el, p, rerender) {
      el.querySelector("[data-goal]").onchange = function () { p.goal = this.value; day(p).done = false; BD.Store.save(p); rerender(); };
      el.querySelector("[data-every]").onchange = function () { p.every = this.value; const d = day(p); d.nb = this.value === "off" ? 0 : d.s + Number(this.value) * 60; BD.Store.save(p); rerender(); };
    }
  });

  function sanitize(p) {
    if (p.goal !== undefined && !GOALS.some(function (g) { return g[0] === p.goal; })) delete p.goal;
    if (p.every !== undefined && !EVERY.some(function (g) { return g[0] === p.every; })) delete p.every;
    delete p.limit;
    if (p.today && !(typeof p.today === "object" && /^\d{4}-\d\d-\d\d$/.test(p.today.d))) delete p.today;
    else if (p.today) p.today = { d: p.today.d, s: Math.max(0, Math.min(86400, Number(p.today.s) || 0)), r: Math.max(0, Math.min(500, Number(p.today.r) || 0)), done: !!p.today.done, nb: Math.max(0, Math.min(172800, Number(p.today.nb) || 0)) };
  }

  BD.on("screen", function (id) {
    cur = id; last = Date.now(); start();
    if (id === "screen-results" || id === "screen-home") setTimeout(show, 1900);
  });
  BD.on("results", function (e) { if (!e || !e.p) return; const d = day(e.p); d.r++; BD.Store.save(e.p); check(e.p); });
  BD.on("home", function (p) { homeLine(p); });
  document.addEventListener("visibilitychange", function () { last = Date.now(); });

  return { progress: progress, settings: settings, sanitize: sanitize, homeLine: homeLine, check: check, GOALS: GOALS, EVERY: EVERY };
})();
