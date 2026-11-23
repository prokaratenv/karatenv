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

  /* ---------- fuel up: a healthy snack and water tip with each reminder ----------
     General wellness for kids, not medical advice. No calorie counting, no
     "bad food" talk: everyday foods and sometimes foods. */
  const TIPS = [
    "Water is the best drink for training. Take a few sips right now!",
    "Snack idea: apple slices with peanut butter (or sunflower butter if you're allergic to peanuts).",
    "Snack idea: veggie sticks with hummus. Crunchy, colorful and full of power.",
    "Snack idea: a cheese stick and a handful of grapes.",
    "Snack idea: yogurt with berries. Berries are great brain food!",
    "Snack idea: whole-grain crackers with cheese.",
    "Snack idea: a hard-boiled egg and some orange slices.",
    "Snack idea: a banana. It's nature's grab-and-go snack.",
    "Snack idea: trail mix with nuts and raisins, if you're not allergic to nuts.",
    "Snack idea: half a turkey or cheese sandwich on whole-grain bread.",
    "Power combo: pair a fruit or veggie with a protein (like cheese, yogurt, eggs or beans). It keeps your energy steady.",
    "Eat the rainbow: red, orange, yellow, green and purple foods each bring different vitamins.",
    "Thirsty, tired or a headache? Your body might need water. Drink up!",
    "Keep a water bottle nearby when you train, at school and at practice.",
    "Breakfast fuels your brain for the whole morning. Champions eat breakfast!",
    "Sweets and chips are sometimes foods. Fruits, veggies, whole grains and protein are everyday foods.",
    "Brain foods: berries, eggs, whole grains, leafy greens, beans, and nuts or seeds if you're not allergic.",
    "Feeling hungry between meals? A small snack 2 to 3 hours after a meal keeps you sharp.",
    "Sleep is fuel too! Kids need about 9 to 12 hours, teens about 8 to 10.",
    "Drink extra water when it's hot or after you move a lot, like karate class!"
  ];
  function waterLine(p) {
    const g = BD.Rank ? BD.Rank.dojoGrade(p) : Number(p.mathGrade) || 3;
    return g <= 2 ? "Kids your age need about 5 cups of water a day." : g <= 7 ? "Kids your age need about 7 to 8 cups of water a day." : "Teens need about 8 to 11 cups of water a day.";
  }
  function fuelCard(p) {
    const n = Math.max(0, Number(p.fuelN) || 0), tip = TIPS[n % TIPS.length];
    p.fuelN = (n + 1) % 1000;
    return { tip: tip, html: '<div class="fuel-card"><p class="fuel-h"><span aria-hidden="true">🍎💧</span> Fuel your brain and body</p>' +
      '<p class="fuel-tip">' + esc(tip) + '</p><p class="fuel-water">' + esc(waterLine(p)) + ' Ask a grown-up before you grab a snack.</p>' +
      '<button type="button" class="btn btn-small btn-quiet" id="fuelMore">Learn more about fueling up</button></div>' };
  }
  function fuelGuide() {
    const p = BD.Store.current();
    BD.UI.sheet("Fuel Up guide", '<div class="fuel-guide">' +
      '<p>Champions fuel up with water, everyday foods and good sleep. Here\'s how.</p>' +
      '<h4 class="label">💧 Water</h4><ul class="plan-text">' +
        '<li>Ages 4 to 8 (about Pre-K to 2nd grade): about 5 cups a day.</li>' +
        '<li>Ages 9 to 13 (about 3rd to 8th grade): about 7 to 8 cups a day.</li>' +
        '<li>Teens: about 8 to 11 cups a day.</li>' +
        '<li>Drink more when it\'s hot or after you move a lot.</li>' +
        '<li>Thirsty, tired or a headache can mean you need water.</li>' +
        '<li>Keep a water bottle nearby and sip while you train. Water is the best drink.</li></ul>' +
      '<h4 class="label">🍎 Healthy snacks</h4><p>Pair a fruit or veggie with a protein or whole grain. It keeps your energy steady.</p><ul class="plan-text">' +
        '<li>Apple slices with peanut or sunflower butter</li><li>Veggie sticks with hummus</li><li>Cheese stick and grapes</li>' +
        '<li>Yogurt with berries</li><li>Whole-grain crackers with cheese</li><li>Hard-boiled egg and orange slices</li>' +
        '<li>Trail mix with nuts and raisins, if you\'re not allergic</li></ul>' +
      '<h4 class="label">🧠 Brain foods</h4><p>Berries, eggs, whole grains (like oatmeal and whole-wheat bread), leafy greens, beans, fish, and nuts or seeds if you\'re not allergic.</p>' +
      '<h4 class="label">🥋 Champion habits</h4><ul class="plan-text">' +
        '<li>Eat breakfast to fuel your morning.</li><li>Have a small snack 2 to 3 hours after a meal if you\'re hungry.</li>' +
        '<li>Eat the rainbow: lots of colors on your plate.</li><li>Sweets and chips are sometimes foods. That\'s OK sometimes!</li>' +
        '<li>Sleep is fuel too: about 9 to 12 hours for kids, 8 to 10 for teens.</li></ul>' +
      '<p class="muted small">Every body is different. Ask your doctor about allergies or special diets.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="fuelDone">I fueled up!</button><button type="button" class="btn btn-quiet" id="fuelBack">Keep training</button></div></div>');
    $("fuelDone").onclick = function () { BD.Sound.right(); BD.confetti(40); $("infoClose").click(); };
    $("fuelBack").onclick = function () { $("infoClose").click(); };
    if (p && BD.ReadAloud && BD.ReadAloud.auto(BD.Rank ? BD.Rank.dojoGrade(p) : 3)) { try { BD.ReadAloud.say("Fuel up guide. Water is the best drink. " + waterLine(p)); } catch (e) {} }
  }

  /* ---------- the reminder (between rounds only) ----------
     One simple message: today's goal is reached, see you tomorrow. "Keep
     training" closes it and starts the clock for the next reminder. Each
     reminder also carries one fuel-up tip (healthy snack or water). */
  function show() {
    if (!pending) return;
    if (BD.UI.sheetOpen && BD.UI.sheetOpen()) return setTimeout(show, 1500);
    const p = BD.Store.current(); if (!p) return;
    const first = pending === "goal"; pending = null;
    const fuel = fuelCard(p);
    const resetClock = function () { const d = day(p), e = settings(p).every; if (e !== "off") d.nb = d.s + Number(e) * 60; BD.Store.save(p); };
    BD.UI.sheet("Goal reached!", '<div class="unlock"><div class="chest-prize">🥋</div><h3>Great training, ' + esc(p.name) + '!</h3>' +
      '<p>You reached your goal for today. See you training tomorrow!</p>' + fuel.html +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="goalOk">Keep training</button></div></div>');
    if (first) { BD.Sound.belt(); BD.confetti(120); } else BD.Sound.tap();
    BD.Store.save(p);
    if (BD.ReadAloud && BD.ReadAloud.auto(BD.Rank ? BD.Rank.dojoGrade(p) : 3)) { try { BD.ReadAloud.say("You reached your goal for today. Fuel your brain and body. " + fuel.tip); } catch (e) {} }
    $("goalOk").onclick = function () { resetClock(); $("infoClose").click(); };
    $("fuelMore").onclick = function () { resetClock(); fuelGuide(); };
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
      return '<p class="muted small">Works on its own: after about 30 minutes ' + esc(p.name) + ' sees "You reached your goal for today. See you training tomorrow!" If they tap Keep training, it reminds them again every 30 minutes. Each reminder includes a quick tip about water and healthy snacks. Nothing is ever locked. Change it here if you like.</p>' +
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
    if (p.fuelN !== undefined) { const n = Math.round(Number(p.fuelN)); if (n >= 0 && n < 1000) p.fuelN = n; else delete p.fuelN; }
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

  return { fuelGuide: fuelGuide, TIPS: TIPS, progress: progress, settings: settings, sanitize: sanitize, homeLine: homeLine, check: check, GOALS: GOALS, EVERY: EVERY };
})();
