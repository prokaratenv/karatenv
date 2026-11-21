/* DOJO CHALLENGE — a weekly team goal for everyone using the shared link.
   Each family that joins (a parent turns it on in the Parent corner) adds
   their students' right answers for the week; the board shows the dojo's
   total and, for joined students, a first name and belt only.
   Needs the shared Claude link and a signed-in viewer; hidden otherwise. */
window.BD = window.BD || {};

BD.Dojo = (function () {
  const GOAL = 3000; // right answers per week, whole dojo
  const $ = function (id) { return document.getElementById(id); };
  let col = null, uid = null, entries = {}, ready = false, timer = null;

  function weekId() { const d = new Date(BD.Parent.weekStart()); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function firstName(n) { return String(n || "").trim().split(/\s+/)[0].slice(0, 14) || "Champion"; }

  async function init() {
    if (!window.claude || typeof window.claude.use !== "function") return;
    let db = null, user = null;
    try { const r = await Promise.all([window.claude.use("db"), window.claude.use("user")]); db = r[0]; user = r[1]; } catch (e) { return; }
    if (!db || !user) return;
    try { uid = await user.id(); } catch (e) { uid = null; }
    if (!uid) return;
    col = db.collection("dojo");
    try {
      const snap = await col.get();
      snap.docs.forEach(function (d) { if (d.exists) entries[d.id] = d.data(); });
      col.onSnapshot(function (qs) {
        qs.docs.forEach(function (d) { entries[d.id] = d.data(); });
        render();
      }, function () { /* keep what we have */ });
    } catch (e) { col = null; return; }
    ready = true;
    render();
    push();
  }

  /* This family's joined students and their right answers this week. */
  function mine() {
    const ws = BD.Parent.weekStart(), now = Date.now() + 864e5;
    return BD.Store.players().filter(function (p) { return p.dojoOptIn; }).map(function (p) {
      const w = BD.Parent.weekStats(p, ws, now), belt = BD.beltOf(p);
      return { pid: p.id, name: firstName(p.name), belt: belt.name, color: belt.color, reps: w.correct };
    });
  }
  function push() {
    if (!ready) return;
    clearTimeout(timer);
    timer = setTimeout(async function () {
      const doc = { week: weekId(), players: mine(), updatedAt: Date.now() };
      const was = entries[uid];
      if (!doc.players.length && !was) return;
      if (was && JSON.stringify(was.players) === JSON.stringify(doc.players) && was.week === doc.week) return;
      try { await col.doc(uid).set(doc); entries[uid] = doc; render(); } catch (e) { /* can't write here: the board stays read-only */ }
    }, 1500);
  }

  function board() {
    const wk = weekId(), rows = [];
    Object.keys(entries).forEach(function (id) {
      const e = entries[id];
      if (!e || e.week !== wk) return;
      (e.players || []).forEach(function (pl) { rows.push(Object.assign({ me: id === uid }, pl)); });
    });
    rows.sort(function (a, b) { return b.reps - a.reps; });
    const total = rows.reduce(function (a, r) { return a + (r.reps || 0); }, 0);
    return { rows: rows, total: total, goal: GOAL };
  }

  /* Home screen card. */
  function render() {
    const el = $("dojoCard"); if (!el) return;
    if (!ready) { el.hidden = true; return; }
    const b = board(), pct = Math.min(100, Math.round(100 * b.total / b.goal)), p = BD.Store.current();
    el.hidden = false;
    el.innerHTML = '<div class="dojo-head"><span class="dojo-title">🥋 Dojo Challenge</span><span class="dojo-num">' + b.total.toLocaleString() + ' / ' + b.goal.toLocaleString() + '</span></div>' +
      '<div class="dojo-bar"><i style="width:' + pct + '%"></i></div>' +
      '<p class="dojo-sub">' + (pct >= 100 ? "Goal smashed! The whole dojo did it this week." : "Right answers this week from " + b.rows.length + (b.rows.length === 1 ? " champion" : " champions") + ". Every right answer counts!") +
      (p && !p.dojoOptIn ? " <span class='muted'>Ask a parent to join you in.</span>" : "") + '</p>';
  }
  function openBoard() {
    if (!ready) return;
    const b = board();
    BD.UI.sheet("Dojo Challenge",
      '<p><strong>' + b.total.toLocaleString() + '</strong> of <strong>' + b.goal.toLocaleString() + '</strong> right answers this week. Resets every Monday.</p>' +
      (b.rows.length ? '<ol class="dojo-list">' + b.rows.map(function (r) {
        return '<li' + (r.me ? ' class="me"' : '') + '><span class="belt-swatch" style="--belt:' + r.color + '"></span><span class="dl-name">' + BD.UI.esc(r.name) + '</span><span class="dl-belt">' + BD.UI.esc(r.belt) + '</span><span class="dl-n">' + r.reps.toLocaleString() + '</span></li>';
      }).join("") + '</ol>' : '<p class="muted">No one has joined yet this week. Be the first!</p>') +
      '<p class="muted small">Only first names and belts are shown. Parents can join or leave in the Parent corner.</p>');
  }

  /* Parent corner toggle. */
  function toggle(p, after) {
    if (!ready) {
      BD.UI.sheet("Dojo Challenge", '<p>The Dojo Challenge works when Brain Dojo is opened from the shared Engage link while signed in to Claude, so families can add up their right answers together.</p>');
      return;
    }
    if (p.dojoOptIn) { p.dojoOptIn = false; BD.Store.save(p); push(); if (after) after(); return; }
    BD.UI.sheet("Join the Dojo Challenge?",
      '<p>' + BD.UI.esc(p.name) + '\'s right answers will count toward the whole dojo\'s weekly goal.</p>' +
      '<p>Other families will see only the first name <strong>' + BD.UI.esc(firstName(p.name)) + '</strong>, their belt and their weekly count. No last names, photos or other details. You can leave any time.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="dojoYes">Join</button><button type="button" class="btn btn-quiet" id="dojoNo">Not now</button></div>');
    $("dojoYes").onclick = function () { p.dojoOptIn = true; BD.Store.save(p); push(); $("infoClose").click(); if (after) after(); };
    $("dojoNo").onclick = function () { $("infoClose").click(); };
  }

  return { init: init, push: push, render: render, openBoard: openBoard, toggle: toggle, board: board, ready: function () { return ready; } };
})();
