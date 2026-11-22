/* POWER BREAKS — a short, earned movement break between learning rounds.
   Learning comes first: a break is offered only on the results screen after
   finished rounds (every round for Pre-K to 2nd, every 2nd round after
   that), at most 4 a day, about 20 to 30 seconds each, no XP. Then it's
   straight back to training.
   Moves: jumping jacks, push-ups and sit-ups (real movement, counted out
   loud), focus pads and throwing stars (tap games where you hit the right
   answer, so the brain keeps working) and a board break (timing). Throwing
   stars hit wooden targets only, never a person or a boss. */
window.BD = window.BD || {};

BD.Breaks = (function () {
  const MAX_A_DAY = 4, TAP_SECONDS = 20;
  const esc = function (s) { return BD.UI.esc(s); };
  const $ = function (id) { return document.getElementById(id); };
  const r = function (n) { return Math.floor(Math.random() * n); };
  const shuffle = function (a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = r(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"];

  function day(p) { const t = BD.today(); if (!p.brk || p.brk.d !== t) p.brk = { d: t, n: 0, r: 0 }; return p.brk; }
  function grade(p) { return BD.Rank.dojoGrade(p); }
  function young(p) { return BD.Kid && BD.Kid.young(grade(p)); }
  /* Called when a round's results show: counts the round and offers a break when earned. */
  function offer(p, o) {
    const el = $("resBreak"); if (!el) return;
    el.innerHTML = ""; if (!p || !o || o.failed) return;
    const b = day(p); b.r++; BD.Store.save(p);
    const every = young(p) ? 1 : 2;
    if (b.n >= MAX_A_DAY || b.r < every) return;
    el.innerHTML = '<button type="button" class="break-offer" id="breakGo"><span class="bo-icon" aria-hidden="true">⚡</span><span><strong>Power Break earned!</strong><span>A 20-second dojo break, then back to training.</span></span></button>';
    $("breakGo").onclick = function () { BD.Sound.tap(); pick(p); };
  }

  const MOVES = [
    { id: "jacks", icon: "🤸", name: "Jumping Jacks", kind: "body", reps: [8, 10], say: "jumping jacks" },
    { id: "pushups", icon: "💪", name: "Push-ups", kind: "body", reps: [3, 5], say: "push-ups" },
    { id: "situps", icon: "🧘", name: "Sit-ups", kind: "body", reps: [5, 8], say: "sit-ups" },
    { id: "pads", icon: "🥊", name: "Focus Pads", kind: "pads" },
    { id: "stars", icon: "⭐", name: "Throwing Stars", kind: "stars" },
    { id: "board", icon: "🪵", name: "Board Break", kind: "board" }
  ];
  function pick(p) {
    BD.UI.sheet("⚡ Power Break", '<p class="muted small">Pick one. About 20 seconds, then back to training!</p><div class="break-grid">' +
      MOVES.map(function (m) { return '<button type="button" class="break-card" data-move="' + m.id + '"><span class="bc-icon" aria-hidden="true">' + m.icon + '</span><strong>' + m.name + '</strong></button>'; }).join("") + '</div>');
    $("infoBody").onclick = function (e) {
      const c = e.target.closest("[data-move]"); if (!c) return;
      const m = MOVES.find(function (x) { return x.id === c.dataset.move; });
      const b = day(p); b.n++; b.r = 0; BD.Store.save(p);
      BD.Sound.tap();
      ({ body: body, pads: pads, stars: stars, board: board })[m.kind](p, m);
    };
  }
  function speak(t) { if (!(BD.Store && BD.Store.muted) && BD.Speech && BD.Speech.available) BD.Speech.say(t, "en-US", 1.05); }
  function backBtn(label) { return '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="breakBack">' + (label || "Back to training") + '</button></div>'; }
  function done(html) {
    BD.UI.sheet("⚡ Power Break", '<div class="unlock">' + html + backBtn() + '</div>');
    BD.Sound.belt(); BD.confetti(60);
    $("breakBack").onclick = back;
  }
  /* Straight back to learning: the next round in Sensei's plan. */
  function back() {
    stopTimers();
    if (!$("infoSheet").hidden) $("infoClose").click();
    BD.UI.home();
    setTimeout(function () { const s = $("startTraining"); if (s) s.click(); }, 150);
  }
  let timers = [];
  function stopTimers() { timers.forEach(function (t) { clearInterval(t); clearTimeout(t); }); timers = []; }

  /* ---------- jumping jacks, push-ups, sit-ups: real movement, counted out loud ---------- */
  function body(p, m) {
    const n = m.reps[young(p) ? 0 : 1];
    let i = 0;
    BD.UI.sheet("⚡ " + m.name, '<div class="break-body">' +
      '<p class="bb-task">Stand up! Do <strong>' + n + ' ' + m.say + '</strong> with your champion.</p>' +
      '<div class="bb-champ mv-' + m.id + '">' + BD.UI.championHTML(p) + '</div>' +
      '<div class="bb-count" id="bbCount">Ready…</div>' + backBtn("I did them! Back to training") + '</div>');
    $("breakBack").onclick = back;
    speak("Stand up! Let's do " + n + " " + m.say + ". Ready? Go!");
    const t = setTimeout(function () {
      const tick = setInterval(function () {
        i++;
        $("bbCount") && ($("bbCount").textContent = i + " / " + n);
        const c = document.querySelector(".bb-champ"); if (c) { c.classList.remove("rep"); void c.offsetWidth; c.classList.add("rep"); }
        speak(NUM[i] || String(i)); BD.Sound.tap();
        if (i >= n) { clearInterval(tick); setTimeout(function () { if ($("bbCount")) $("bbCount").textContent = "Osu! Great work!"; speak("Osu! Great work!"); BD.confetti(50); }, 700); }
      }, m.id === "pushups" ? 1700 : 1300);
      timers.push(tick);
    }, 2600);
    timers.push(t);
  }

  /* A quick question for the tap games, at the student's level. */
  function mathQ(g) {
    if (g <= 0) { const a = 1 + r(4), b = 1 + r(4); return { q: a + " + " + b, a: a + b }; }
    if (g <= 2) { const a = 2 + r(8), b = 1 + r(9); return Math.random() < 0.5 ? { q: a + " + " + b, a: a + b } : { q: (a + b) + " − " + b, a: a }; }
    const a = 2 + r(g >= 4 ? 11 : 9), b = 2 + r(9);
    return Math.random() < 0.6 || g < 4 ? { q: a + " × " + b, a: a * b } : { q: (a * b) + " ÷ " + b, a: a };
  }
  function opts(ans) { const o = [ans]; while (o.length < 6) { const v = ans + (r(2) ? 1 : -1) * (1 + r(Math.max(3, Math.round(ans * 0.3)))); if (v >= 0 && o.indexOf(v) === -1) o.push(v); } return shuffle(o); }
  function countdown(sec, onEnd) {
    let left = sec;
    const t = setInterval(function () { left--; const el = $("brTime"); if (el) el.textContent = left + "s"; if (left <= 0) { clearInterval(t); onEnd(); } }, 1000);
    timers.push(t);
  }

  /* ---------- focus pads: hit the pad with the right answer ---------- */
  function pads(p) {
    const g = grade(p); let hits = 0, q = null;
    const draw = function () {
      if (!$("padQ")) return;
      q = mathQ(g);
      $("padQ").textContent = "Hit: " + q.q + " = ?";
      $("padGrid").innerHTML = opts(q.a).map(function (v) { return '<button type="button" class="pad" data-v="' + v + '">' + v + '</button>'; }).join("");
    };
    BD.UI.sheet("🥊 Focus Pads", '<div class="break-game"><div class="bg-top"><span id="padQ"></span><span class="bg-score">🥊 <b id="padHits">0</b> · <span id="brTime">' + TAP_SECONDS + 's</span></span></div><div class="pad-grid" id="padGrid"></div></div>');
    draw();
    $("infoBody").onclick = function (e) {
      const b = e.target.closest(".pad"); if (!b || b.disabled) return;
      if (Number(b.dataset.v) === q.a) {
        hits++; if ($("padHits")) $("padHits").textContent = hits; b.classList.add("smack"); b.textContent = "POW!"; BD.Sound.right();
        setTimeout(draw, 280);
      } else { b.classList.add("miss"); b.disabled = true; BD.Sound.wrong(); }
    };
    countdown(TAP_SECONDS, function () { $("infoBody").onclick = null; done('<div class="chest-prize">🥊</div><h3>' + hits + (hits === 1 ? " pad hit!" : " pad hits!") + '</h3><p>Fast hands, sharp brain.</p>'); });
  }

  /* ---------- throwing stars: at wooden targets, the right one only ---------- */
  function starQ(p) {
    const g = grade(p);
    if (g <= 1) { const L = "ABCDEFGHIJKLMNOPRSTW", c = L[r(L.length)], pool = shuffle(L.replace(c, "").split("")).slice(0, 2); return { q: "the letter " + c, a: c, o: shuffle([c].concat(pool)) }; }
    const list = BD.SPELLING && (BD.SPELLING[String(Math.min(8, g))] || BD.SPELLING["3"]);
    const w = list && list[r(list.length)][0], bad = w && BD.WordQuiz.misspellings(w);
    if (w && bad && bad.length >= 2) return { q: "the right spelling", a: w, o: shuffle([w, bad[0], bad[1]]) };
    const m = mathQ(g); return { q: m.q, a: String(m.a), o: shuffle([String(m.a)].concat(opts(m.a).filter(function (v) { return v !== m.a; }).slice(0, 2).map(String))) };
  }
  function stars(p) {
    let hits = 0, q = null;
    const draw = function () {
      if (!$("starQ")) return;
      q = starQ(p);
      $("starQ").textContent = "Throw at " + q.q + "!";
      $("starRow").innerHTML = q.o.map(function (v, i) { return '<button type="button" class="target t' + i + '" data-v="' + esc(v) + '"><span>' + esc(v) + '</span></button>'; }).join("");
    };
    BD.UI.sheet("⭐ Throwing Stars", '<div class="break-game"><div class="bg-top"><span id="starQ"></span><span class="bg-score">⭐ <b id="starHits">0</b> · <span id="brTime">' + TAP_SECONDS + 's</span></span></div><p class="muted small">Wooden targets only. Throwing stars are for practice, never at a person.</p><div class="target-row" id="starRow"></div></div>');
    draw();
    $("infoBody").onclick = function (e) {
      const t = e.target.closest(".target"); if (!t || t.disabled) return;
      const rc = t.getBoundingClientRect(), s = document.createElement("span");
      s.className = "throw-star"; s.textContent = "✴️";
      s.style.setProperty("--tx", (rc.left + rc.width / 2) + "px"); s.style.setProperty("--ty", (rc.top + rc.height / 2) + "px");
      document.body.appendChild(s); setTimeout(function () { s.remove(); }, 420);
      setTimeout(function () {
        if (!$("starHits") || !t.isConnected) return;
        if (t.dataset.v === q.a) { hits++; $("starHits").textContent = hits; t.classList.add("hit"); BD.Sound.right(); setTimeout(draw, 320); }
        else { t.classList.add("miss"); t.disabled = true; BD.Sound.wrong(); }
      }, 380);
    };
    countdown(TAP_SECONDS, function () { $("infoBody").onclick = null; done('<div class="chest-prize">⭐</div><h3>' + hits + (hits === 1 ? " bullseye!" : " bullseyes!") + '</h3><p>Great aim and a sharp mind.</p>'); });
  }

  /* ---------- board break: stop the power meter in the green zone ---------- */
  function board(p) {
    let level = 0, pos = 0, dir = 1, broke = 0;
    const LEVELS = [{ boards: 1, speed: 1.4 }, { boards: 2, speed: 2 }, { boards: 3, speed: 2.7 }];
    BD.UI.sheet("🪵 Board Break", '<div class="break-game"><p class="bg-top"><span id="bdTitle"></span></p>' +
      '<div class="boards" id="bdBoards"></div><div class="meter-bar"><i class="zone" id="bdZone"></i><i class="needle" id="bdNeedle"></i></div>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="bdHit">🥋 Strike!</button></div></div>');
    let zone = [0, 0];
    const setup = function () {
      const L = LEVELS[level], w = 26 - level * 6, start = 18 + r(60 - w);
      zone = [start, start + w];
      $("bdTitle").textContent = "Board " + (level + 1) + " of 3: " + L.boards + (L.boards === 1 ? " board" : " boards") + ". Strike in the green!";
      $("bdBoards").innerHTML = Array.from({ length: L.boards }, function () { return '<span class="wood"></span>'; }).join("");
      $("bdZone").style.left = zone[0] + "%"; $("bdZone").style.width = w + "%";
    };
    setup();
    const t = setInterval(function () {
      pos += dir * LEVELS[level].speed; if (pos >= 100) { pos = 100; dir = -1; } if (pos <= 0) { pos = 0; dir = 1; }
      const n = $("bdNeedle"); if (n) n.style.left = pos + "%"; else clearInterval(t);
    }, 16);
    timers.push(t);
    $("bdHit").onclick = function () {
      const ok = pos >= zone[0] && pos <= zone[1];
      const wood = document.querySelectorAll("#bdBoards .wood");
      if (ok) {
        broke += wood.length; wood.forEach(function (w) { w.classList.add("snap"); }); BD.Sound.right(); speak("Hi-ya!");
        level++;
        if (level >= LEVELS.length) { clearInterval(t); setTimeout(function () { done('<div class="chest-prize">🪵</div><h3>' + broke + ' boards broken!</h3><p>Focus plus power. That\'s a black belt combo.</p>'); }, 700); }
        else setTimeout(setup, 700);
      } else { BD.Sound.wrong(); wood.forEach(function (w) { w.classList.remove("wobble"); void w.offsetWidth; w.classList.add("wobble"); }); }
    };
  }

  function sanitize(p) { if (p.brk && !(typeof p.brk === "object" && /^\d{4}-\d\d-\d\d$/.test(p.brk.d))) delete p.brk; else if (p.brk) p.brk = { d: p.brk.d, n: Math.max(0, Math.min(9, Number(p.brk.n) || 0)), r: Math.max(0, Math.min(99, Number(p.brk.r) || 0)) }; }
  return { offer: offer, pick: pick, back: back, stop: stopTimers, sanitize: sanitize, MOVES: MOVES };
})();
