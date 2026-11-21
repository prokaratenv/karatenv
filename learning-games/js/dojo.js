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
  /* Names other families see: letters only, short, and never a rude word. */
  const BLOCK = ["fuck", "shit", "bitch", "ass", "dick", "cock", "pussy", "cunt", "damn", "hell", "sex", "porn", "nude", "boob", "penis", "vagina", "nigg", "fag", "retard", "slut", "whore", "rape", "kill", "die", "hate", "poop", "butt", "fart", "pee", "crap", "stupid", "idiot", "dumb", "loser", "suck"];
  function firstName(n) {
    const w = String(n || "").trim().split(/\s+/)[0].replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'-]/g, "").slice(0, 14);
    const low = w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
    if (!w || BLOCK.some(function (b) { return low.indexOf(b) !== -1 && !(b === "ass" && /^(cass|bass|tass|jass|vass|lass|kass)/.test(low)) && !(b === "die" && /^(dieg|dier|diet)/.test(low)) && !(b === "hell" && /^(hellen|helle|shell)/.test(low)); })) return "Champion";
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
  /* What other families see: a nickname the student picks, or a first initial.
     No names ever leave the device. */
  function initial(n) { const f = firstName(n); return f === "Champion" ? "C." : f.charAt(0).toUpperCase() + "."; }
  const ADJ = ["Swift", "Brave", "Mighty", "Clever", "Lucky", "Golden", "Silent", "Rapid", "Fierce", "Happy", "Cosmic", "Thunder", "Shadow", "Turbo", "Super", "Steady", "Bright", "Wild", "Calm", "Jolly", "Iron", "Blazing", "Frosty", "Sunny"];
  const ANIMAL = ["Panda", "Tiger", "Dragon", "Falcon", "Fox", "Owl", "Bear", "Wolf", "Shark", "Eagle", "Lion", "Turtle", "Cobra", "Crane", "Raccoon", "Otter", "Hawk", "Rhino", "Koala", "Phoenix", "Ninja", "Comet", "Rocket", "Storm"];
  function nickParts(s) { const m = /^([A-Za-z]+) ([A-Za-z]+) ([1-9][0-9]?)$/.exec(String(s || "")); return m && ADJ.indexOf(m[1]) !== -1 && ANIMAL.indexOf(m[2]) !== -1 ? m : null; }
  function lev(a, b) { const d = []; for (let i = 0; i <= a.length; i++) { d[i] = [i]; for (let j = 1; j <= b.length; j++) d[i][j] = i ? Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) : j; } return d[a.length][b.length]; }
  /* A nickname word may not match, contain, start like, or nearly spell the student's name. */
  function tooClose(word, name) {
    const w = word.toLowerCase(), n = String(name || "").toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
    if (n.length < 2) return false;
    return n.indexOf(w) !== -1 || w.indexOf(n) !== -1 || (n.length >= 3 && w.slice(0, 3) === n.slice(0, 3)) || lev(w, n) <= Math.max(1, Math.floor(n.length / 3));
  }
  function nickOk(nick, name) { const m = nickParts(nick); return !!m && !tooClose(m[1], name) && !tooClose(m[2], name); }
  function randomNick(name) {
    for (let i = 0; i < 200; i++) {
      const n = ADJ[Math.floor(Math.random() * ADJ.length)] + " " + ANIMAL[Math.floor(Math.random() * ANIMAL.length)] + " " + (1 + Math.floor(Math.random() * 99));
      if (nickOk(n, name)) return n;
    }
    return null;
  }
  function display(p) { return p.nick && nickOk(p.nick, p.name) ? p.nick : initial(p.name); }
  function sid(id) { let h1 = 0x811c9dc5, h2 = 0x1b873593; for (let i = 0; i < id.length; i++) { h1 = Math.imul(h1 ^ id.charCodeAt(i), 16777619); h2 = Math.imul(h2 ^ id.charCodeAt(i), 2246822519); } return ((h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0")); }
  /* Entries come from other families: keep only what the board needs, checked. */
  const BELT_BY_NAME = {};
  function cleanEntry(e) {
    if (!e || typeof e !== "object" || typeof e.week !== "string" || !Array.isArray(e.players)) return null;
    BD.BELTS.forEach(function (b) { BELT_BY_NAME[b.name] = b; });
    return {
      week: e.week.slice(0, 10),
      players: e.players.slice(0, 6).map(function (pl) {
        const b = BELT_BY_NAME[pl && pl.belt] || BD.BELTS[0];
        const reps = Math.max(0, Math.min(1500, Math.round(Number(pl && pl.reps) || 0))); // no one answers 1,500+ in a week
        const xp = Math.max(0, Math.min(10000, Math.round((Number(pl && pl.xp) || 0) * 2) / 2));
        const nm = pl && pl.name;
        return { name: nickParts(nm) ? nm : /^[A-Z]\.$/.test(nm || "") ? nm : initial(nm), belt: b.name, color: b.color, reps: reps, xp: xp };
      })
    };
  }

  /* On your own website the board runs through the family account script:
     anyone can see it; signed-in families with the parent's OK appear on it. */
  let web = false, webRows = [], webTotal = 0, webTimer = null, webCh = false;
  function webOn() { return !!(BD.Family && BD.Family.enabled()) && !(window.claude && window.claude.use); }
  async function webLoad() {
    const res = await BD.Family.call("board", { token: BD.Family.token() || "" });
    if (!res || !res.ok) return;
    BD.BELTS.forEach(function (b) { BELT_BY_NAME[b.name] = b; });
    webRows = (Array.isArray(res.rows) ? res.rows : []).map(function (r) {
      const e = cleanEntry({ week: weekId(), players: [r] }); const x = e && e.players[0];
      if (!x) return null;
      x.me = !!r.me;
      if (typeof r.h === "string" && /^[a-f0-9]{16}$/.test(r.h)) x.h = r.h;
      if (x.me && typeof r.sid === "string" && /^[a-f0-9]{16}$/.test(r.sid)) x.sid = r.sid;
      return x;
    }).filter(Boolean);
    webCh = res.challenges === true; // the deployed script knows friend challenges
    webTotal = Math.max(0, Math.min(10000000, Number(res.total) || 0));
    render();
  }
  async function init() {
    if (webOn()) {
      web = true; ready = true; render(); webLoad(); push();
      clearInterval(webTimer); webTimer = setInterval(function () { if (document.visibilityState === "visible") webLoad(); }, 120000);
      return;
    }
    if (!window.claude || typeof window.claude.use !== "function") return;
    let db = null, user = null;
    try { const r = await Promise.all([window.claude.use("db"), window.claude.use("user")]); db = r[0]; user = r[1]; } catch (e) { return; }
    if (!db || !user) return;
    try { uid = await user.id(); } catch (e) { uid = null; }
    if (!uid) return;
    col = db.collection("dojo");
    try {
      const snap = await col.get();
      snap.docs.forEach(function (d) { if (d.exists) entries[d.id] = cleanEntry(d.data()); });
      col.onSnapshot(function (qs) {
        qs.docs.forEach(function (d) { entries[d.id] = cleanEntry(d.data()); });
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
      return { sid: sid(p.id), name: display(p), belt: belt.name, reps: Math.min(1500, w.correct), xp: Math.min(10000, BD.xpSince(p, ws)) };
    });
  }
  let lastWeb = "";
  function push() {
    if (!ready) return;
    clearTimeout(timer);
    if (web) {
      timer = setTimeout(async function () {
        if (!BD.Family.linked()) return;
        const players = mine(), sig = JSON.stringify(players);
        if (sig === lastWeb) return;
        const res = await BD.Family.call("boardPost", { token: BD.Family.token(), players: players });
        if (res && res.ok) { lastWeb = sig; webLoad(); }
      }, 2500);
      return;
    }
    timer = setTimeout(async function () {
      const doc = { week: weekId(), players: mine().map(function (x) { delete x.sid; return x; }), updatedAt: Date.now() };
      const was = entries[uid];
      if (!doc.players.length && !was) return;
      if (was && JSON.stringify(was.players.map(function (x) { return [x.name, x.belt, x.reps, x.xp]; })) === JSON.stringify(doc.players.map(function (x) { return [x.name, x.belt, x.reps, x.xp]; })) && was.week === doc.week) return;
      try { await col.doc(uid).set(doc); entries[uid] = cleanEntry(doc); render(); } catch (e) { /* can't write here: the board stays read-only */ }
    }, 1500);
  }

  function board() {
    if (web) return { rows: webRows, total: webTotal, goal: GOAL };
    const wk = weekId(), rows = [];
    Object.keys(entries).forEach(function (id) {
      const e = entries[id];
      if (!e || e.week !== wk) return;
      (e.players || []).forEach(function (pl) { rows.push(Object.assign({ me: id === uid }, pl)); });
    });
    rows.sort(function (a, b) { return (b.xp - a.xp) || (b.reps - a.reps); }); // leaderboard: points this week
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
      (p && !p.dojoOptIn ? " <span class='muted'>Tap to see the leaderboard. Ask a parent to join you in.</span>" : " <span class='muted'>Tap for the leaderboard.</span>") + '</p>';
  }
  function openBoard() {
    if (!ready) return;
    const b = board(), p = BD.Store.current();
    const canCh = !!(p && BD.Challenge && BD.Challenge.canSend(p));
    BD.UI.sheet("Dojo Challenge",
      (p ? '<div class="nick-bar"><span>Your leaderboard name: <strong>' + BD.UI.esc(display(p)) + '</strong>' + (p.dojoOptIn ? '' : ' <span class="muted small">(not on the board yet: ask a parent)</span>') + '</span><button type="button" class="btn btn-small btn-gold" id="nickPick">' + (p.nick ? "Change nickname" : "Pick a nickname") + '</button></div>' : '') +
      '<p><strong>' + b.total.toLocaleString() + '</strong> of <strong>' + b.goal.toLocaleString() + '</strong> right answers this week (team goal). Resets every Monday.</p>' +
      '<h4 class="label">Leaderboard · XP this week</h4>' +
      (b.rows.length ? '<ol class="dojo-list">' + b.rows.map(function (r) {
        return '<li' + (r.me ? ' class="me"' : '') + '><span class="belt-swatch" style="--belt:' + r.color + '"></span><span class="dl-name">' + BD.UI.esc(r.name) + '</span><span class="dl-belt">' + BD.UI.esc(r.belt) + '</span><span class="dl-n">' + r.xp.toLocaleString() + ' XP</span>' +
          (canCh && !r.me && r.h ? '<button type="button" class="btn btn-small btn-quiet dl-ch" data-ch="' + r.h + '" aria-label="Challenge ' + BD.UI.esc(r.name) + '">⚔️ Challenge</button>' : '') + '</li>';
      }).join("") + '</ol>' : '<p class="muted">No one has joined yet this week. Be the first!</p>') +
      (BD.Challenge ? BD.Challenge.boardNote(p, canCh) : '') +
      '<p class="muted small">XP comes from doing the work: practice (up to 100 per stripe), graduation bonuses earned by that practice (up to +100), Daily Flashcards (up to +10 a day), bosses, challenges and daily chests. Stripe tests alone give no points. No names are ever shown: only nicknames (or first initials) and belts. Parents can join or leave in the Parent corner.</p>');
    if ($("nickPick")) $("nickPick").onclick = function () { pickNick(p, openBoard); };
    document.querySelectorAll("#infoBody [data-ch]").forEach(function (btn) {
      btn.onclick = function () { const r = b.rows.find(function (x) { return x.h === btn.dataset.ch; }); if (r) BD.Challenge.send(p, r); };
    });
  }

  /* The nickname picker: words from kid-safe lists, never close to the real name. */
  function pickNick(p, after) {
    const cur = nickParts(p.nick) || nickParts(randomNick(p.name) || "Swift Panda 7");
    let a = cur[1], b = cur[2], n = cur[3];
    const opt = function (list, v) { return list.map(function (x) { return '<option' + (x === v ? " selected" : "") + (tooClose(x, p.name) ? " disabled" : "") + '>' + x + '</option>'; }).join(""); };
    const draw = function () {
      const nick = a + " " + b + " " + n, ok = nickOk(nick, p.name);
      BD.UI.sheet("Pick your nickname",
        '<p>Your nickname is what other families see on the leaderboard, instead of your name. Words that sound like your real name are grayed out.</p>' +
        '<div class="nick-preview">🥷 ' + BD.UI.esc(nick) + '</div>' +
        '<div class="nick-pick"><label><span>Word 1</span><select id="nkA">' + opt(ADJ, a) + '</select></label>' +
        '<label><span>Word 2</span><select id="nkB">' + opt(ANIMAL, b) + '</select></label>' +
        '<label><span>Number</span><select id="nkN">' + Array.from({ length: 99 }, function (_, i) { return '<option' + (String(i + 1) === String(n) ? " selected" : "") + '>' + (i + 1) + '</option>'; }).join("") + '</select></label></div>' +
        '<p class="lf-msg" id="nkMsg">' + (ok ? "" : "That's too close to your real name. Pick different words.") + '</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="nkSave"' + (ok ? "" : " disabled") + '>Save nickname</button><button type="button" class="btn btn-quiet" id="nkRoll">🎲 Surprise me</button>' +
        (p.nick ? '<button type="button" class="btn btn-quiet" id="nkClear">Use my initial instead</button>' : '') + '</div>');
      $("nkA").onchange = function () { a = this.value; draw(); };
      $("nkB").onchange = function () { b = this.value; draw(); };
      $("nkN").onchange = function () { n = this.value; draw(); };
      $("nkRoll").onclick = function () { const r = nickParts(randomNick(p.name)); if (r) { a = r[1]; b = r[2]; n = r[3]; } BD.Sound.tap(); draw(); };
      $("nkSave").onclick = function () { if (!nickOk(a + " " + b + " " + n, p.name)) return; p.nick = a + " " + b + " " + n; BD.Store.save(p); BD.Sound.right(); push(); if (after) after(); else $("infoClose").click(); };
      if ($("nkClear")) $("nkClear").onclick = function () { delete p.nick; BD.Store.save(p); push(); if (after) after(); else $("infoClose").click(); };
    };
    draw();
  }

  /* Parent corner toggle. */
  function toggle(p, after) {
    if (web && !BD.Family.linked() && !p.dojoOptIn) {
      BD.UI.sheet("Dojo Challenge", '<p>To put ' + BD.UI.esc(p.name) + ' on the leaderboard, first sign in with a parent\'s email (it keeps the board safe from strangers).</p><div class="res-actions"><button type="button" class="btn btn-primary" id="dojoSign">Sign in with email</button></div>');
      $("dojoSign").onclick = function () { BD.Family.openSignIn(function () { toggle(p, after); }); };
      return;
    }
    if (!ready) {
      BD.UI.sheet("Dojo Challenge", '<p>The Dojo Challenge works when Brain Dojo is opened from the shared Engage link while signed in to Claude, so families can add up their right answers together.</p>');
      return;
    }
    if (p.dojoOptIn) { p.dojoOptIn = false; BD.Store.save(p); push(); if (after) after(); return; }
    BD.UI.sheet("Join the Dojo Challenge?",
      '<p>' + BD.UI.esc(p.name) + '\'s right answers will count toward the whole dojo\'s weekly goal.</p>' +
      '<p>Other families will see only <strong>' + BD.UI.esc(display(p)) + '</strong> (a nickname ' + BD.UI.esc(p.name) + ' can pick, or a first initial), their belt and their weekly points. No names, photos or other details. You can leave any time.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="dojoYes">Join</button><button type="button" class="btn btn-quiet" id="dojoNo">Not now</button></div>');
    $("dojoYes").onclick = function () { p.dojoOptIn = true; BD.Store.save(p); push(); $("infoClose").click(); if (after) after(); };
    $("dojoNo").onclick = function () { $("infoClose").click(); };
  }

  return { sid: sid, web: function () { return web; }, webChallenges: function () { return web && webCh; }, myRow: function (p) { const id = sid(p.id); return webRows.find(function (r) { return r.me && r.sid === id; }) || null; }, reload: function () { return web ? webLoad() : Promise.resolve(); }, nickOk: nickOk, randomNick: randomNick, pickNick: pickNick, display: display, init: init, push: push, render: render, openBoard: openBoard, toggle: toggle, board: board, ready: function () { return ready; } };
})();
