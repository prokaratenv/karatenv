/* THE CHAMPION COMES ALIVE + WEEKLY STREAK CALENDAR (Train tab).
   - Idle: the home champion breathes and shifts its stance a little
     (CSS, class "alive"; off with reduced motion).
   - Tap the champion: a fist bump, a cheer, or a Power Phrase in a speech
     bubble. "Change champion" under it still opens the champion picker.
   - Mood: one speech bubble per visit, based on the streak and today's goal.
   - Week calendar: Mon to Sun with flames on trained days and shields on
     days a streak shield covered. Tap for the last 4 weeks. */
window.BD = window.BD || {};

BD.Alive = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const reduce = function () { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); };
  const key = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 3.2-.6 5-2 6.6C8.6 10.2 7 12 7 14.6A5 5 0 0 0 12 20a5 5 0 0 0 5-5.4c0-2.2-1.2-3.6-2.2-4.6.2 1.6-.4 2.8-1.4 3.2.4-3.6-.2-7.2-1.4-11.2z" fill="currentColor"/></svg>';
  const SHIELD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z" fill="currentColor"/></svg>';
  const FIST = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="20" width="40" height="28" rx="10" fill="#F2C28B" stroke="#7A4A22" stroke-width="3"/><path d="M18 20v12M27 20v12M36 20v12" stroke="#7A4A22" stroke-width="3" stroke-linecap="round"/><rect x="44" y="26" width="12" height="16" rx="6" fill="#F2C28B" stroke="#7A4A22" stroke-width="3"/></svg>';
  const CHEERS = ["Osu!", "Let's go!", "You've got this!", "Hi-yah!", "Champions train!"];

  /* ---------- streak helpers ---------- */
  function sets(p) { return { days: new Set(p.days || []), shield: new Set(p.shielded || []) }; }
  function best(p) {
    const all = Array.from(new Set((p.days || []).concat(p.shielded || []))).sort();
    let b = 0, run = 0, prev = null;
    all.forEach(function (d) {
      const t = new Date(d + "T12:00:00");
      run = prev && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1;
      b = Math.max(b, run); prev = t;
    });
    return b;
  }
  function monday(d) { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function weekCells(p, start, now) {
    const s = sets(p), tk = key(now), out = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = key(d);
      out.push({ k: k, label: "MTWTFSS"[i], trained: s.days.has(k), shield: !s.days.has(k) && s.shield.has(k), today: k === tk, future: k > tk });
    }
    return out;
  }
  function cellHTML(c) {
    return '<span class="wc-day' + (c.trained ? " on" : "") + (c.shield ? " shield" : "") + (c.today ? " today" : "") + (c.future ? " future" : "") + '" data-day="' + c.k + '">' +
      '<span class="wc-dot">' + (c.trained ? FLAME : c.shield ? SHIELD : "") + '</span><span class="wc-l">' + c.label + '</span></span>';
  }

  /* ---------- weekly calendar ---------- */
  function calendar(p, now) {
    now = now || new Date();
    let el = $("weekCal");
    const anchor = $("homeStreak"); if (!anchor) return;
    if (!el) {
      el = document.createElement("button"); el.type = "button"; el.id = "weekCal"; el.className = "week-cal";
      anchor.insertAdjacentElement("afterend", el);
      el.addEventListener("click", function () { BD.Sound.tap(); openCal(BD.Store.current()); });
    }
    const st = BD.streak(p), cells = weekCells(p, monday(now), now), b = best(p);
    el.setAttribute("aria-label", st.days + " day streak. Best " + b + ". Tap to see the last 4 weeks.");
    el.innerHTML = '<span class="wc-row">' + cells.map(cellHTML).join("") + '</span>' +
      '<span class="wc-cap"><strong>' + st.days + '-day streak</strong> · Best: ' + b + '</span>';
  }
  function openCal(p) {
    if (!p) return;
    const now = new Date(), start = monday(now); start.setDate(start.getDate() - 21);
    let rows = "";
    for (let w = 0; w < 4; w++) {
      const ws = new Date(start); ws.setDate(start.getDate() + w * 7);
      rows += '<div class="wc-row">' + weekCells(p, ws, now).map(cellHTML).join("") + '</div>';
    }
    const st = BD.streak(p), n = Math.max(0, Number(p.shields) || 0);
    BD.UI.sheet("My training streak", '<div class="wc-sheet">' +
      '<p class="wc-big">' + FLAME + '<strong>' + st.days + '-day streak</strong></p>' +
      '<p class="muted small">Best streak: ' + best(p) + ' days · Streak shields: ' + n + ' of 2</p>' + rows +
      '<p class="muted small">A flame means you trained that day. A shield means a streak shield saved your streak. Finish today\'s quest to win shields.</p></div>');
  }

  /* ---------- mood (once per visit) ---------- */
  function mood(p, now) {
    now = now || new Date();
    const st = BD.streak(p), pr = BD.Goals && BD.Goals.progress ? BD.Goals.progress(p) : null;
    const played = (p.sessions || []).length > 0 || (p.days || []).length > 0;
    if (!played) return { text: "Ready to start your journey?", kind: "wave" };
    if (pr && pr.met) return { text: "Goal reached! See you tomorrow, champ!", kind: "proud" };
    if (!st.today && st.days >= 1 && now.getHours() >= 15) return { text: "Let's keep our streak alive!", kind: "wave" };
    if (st.days >= 3) return { text: st.days + " days strong! Keep it going!", kind: "proud" };
    if (st.today) return { text: "Great work today!", kind: "proud" };
    return { text: "Let's train, champ!", kind: "wave" };
  }
  let shownFor = null, bubbleT = null;
  function bubble(text, kind) {
    const host = $("changeFighter"); if (!host) return;
    let b = $("champSay");
    if (!b) { b = document.createElement("span"); b.id = "champSay"; b.className = "champ-say"; b.setAttribute("role", "status"); host.parentNode.insertBefore(b, host); }
    b.textContent = text; b.classList.remove("show"); void b.offsetWidth; b.classList.add("show");
    act(kind);
    clearTimeout(bubbleT); bubbleT = setTimeout(function () { b.classList.remove("show"); }, 3600);
  }
  function act(kind) {
    const art = $("homeFighter"); if (!art || !kind || reduce()) return;
    art.classList.remove("act-wave", "act-proud", "act-bump"); void art.offsetWidth;
    art.classList.add("act-" + kind);
    setTimeout(function () { art.classList.remove("act-" + kind); }, 1200);
  }

  /* ---------- tap reactions ---------- */
  let lastTap = 0, turn = 0;
  function react() {
    const now = Date.now(); if (now - lastTap < 1200) return null;
    lastTap = now;
    const p = BD.Store.current(); if (!p) return null;
    const kind = ["bump", "cheer", "phrase"][turn++ % 3];
    if (kind === "bump") {
      BD.Sound.tap(); bubble("Fist bump!", "bump"); burst();
      if (navigator.vibrate) try { navigator.vibrate(25); } catch (e) { /* ignore */ }
    } else if (kind === "cheer") {
      BD.Sound.tap(); bubble(CHEERS[Math.floor(Math.random() * CHEERS.length)], "proud");
    } else {
      const ph = BD.Phrases && BD.Phrases.todays ? BD.Phrases.todays(p) : null;
      const t = ph ? ph.t : "I can, I will, that's easy!";
      bubble(t, "proud");
      if (BD.ReadAloud && BD.ReadAloud.auto(p.dojoGrade !== undefined ? p.dojoGrade : 3)) BD.ReadAloud.say(t);
    }
    return kind;
  }
  function burst() {
    const host = $("homeFighter"); if (!host || reduce()) return;
    const f = document.createElement("span"); f.className = "fist-burst"; f.innerHTML = FIST;
    host.appendChild(f); setTimeout(function () { f.remove(); }, 900);
  }

  /* ---------- wiring ---------- */
  function bind() {
    const btn = $("changeFighter"); if (!btn || btn.dataset.alive) return;
    btn.dataset.alive = "1";
    btn.setAttribute("aria-label", "Your champion. Tap for a fist bump. Tap Change champion to pick another.");
    // Tapping the champion reacts; the "Change champion" label still opens the picker.
    btn.addEventListener("click", function (e) {
      if (e.target.closest(".fighter-change")) return;
      e.stopImmediatePropagation(); e.preventDefault();
      react();
    }, true);
  }
  function onHome(p) {
    bind();
    const art = $("homeFighter"); if (art) art.classList.toggle("alive", !reduce());
    calendar(p);
    const visit = p.id + ":" + BD.today();
    if (shownFor !== visit) {
      shownFor = visit;
      const m = mood(p);
      setTimeout(function () { if (BD.UI.sheetOpen && !BD.UI.sheetOpen()) bubble(m.text, m.kind); }, 700);
    }
  }
  BD.on("home", onHome);
  /* A new visit after coming back to the app later. */
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") shownFor = null; });

  return { mood: mood, calendar: calendar, openCal: openCal, react: react, best: best, weekCells: weekCells, monday: monday, _reset: function () { lastTap = 0; shownFor = null; } };
})();
