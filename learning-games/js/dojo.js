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
  /* Cheers: fist bumps, high-fives, applause and thumbs up for friends on the board. */
  const CHEERS = [{ k: "f", icon: "🤜", name: "fist bump" }, { k: "h", icon: "🙌", name: "high-five" }, { k: "c", icon: "👏", name: "applause" }, { k: "u", icon: "👍", name: "thumbs up" }];
  const CK = CHEERS.map(function (c) { return c.k; });
  const cleanCounts = function (t) { const o = {}; CK.forEach(function (k) { const n = Math.max(0, Math.min(100000, Math.round(Number(t && t[k]) || 0))); if (n) o[k] = n; }); return o; };
  const total = function (t) { return CK.reduce(function (a, k) { return a + ((t && t[k]) || 0); }, 0); };

  /* Entries come from other families: keep only what the board needs, checked. */
  const BELT_BY_NAME = {};
  function cleanPlayer(pl) {
    BD.BELTS.forEach(function (b) { BELT_BY_NAME[b.name] = b; });
    const b = BELT_BY_NAME[pl && pl.belt] || BD.BELTS[0];
    const reps = Math.max(0, Math.min(1500, Math.round(Number(pl && pl.reps) || 0))); // no one answers 1,500+ in a week
    const xp = Math.max(0, Math.min(10000, Math.round((Number(pl && pl.xp) || 0) * 2) / 2));
    const life = Math.max(0, Math.min(1000000, Math.round((Number(pl && pl.life) || 0) * 2) / 2));
    const st = Math.max(0, Math.min(3650, Math.round(Number(pl && pl.st) || 0)));
    const nm = pl && pl.name;
    return { name: nickParts(nm) ? nm : /^[A-Z]\.$/.test(nm || "") ? nm : initial(nm), belt: b.name, color: b.color, rank: BD.BELTS.indexOf(b), reps: reps, xp: xp, life: Math.max(life, xp), st: st,
      sid: typeof (pl && pl.sid) === "string" && /^[a-f0-9]{16}$/.test(pl.sid) ? pl.sid : "" };
  }
  function cleanEntry(e) {
    if (!e || typeof e !== "object" || typeof e.week !== "string" || !Array.isArray(e.players)) return null;
    const wk = e.week.slice(0, 10);
    return {
      week: wk,
      players: e.players.slice(0, 6).map(cleanPlayer),
      // cheers this family gave this week (Claude link): [{ to: "doc:sid", by: sid, k, d }]
      given: wk === weekId() && Array.isArray(e.given) ? e.given.slice(-600).filter(function (g) { return g && typeof g.to === "string" && g.to.length < 120 && CK.indexOf(g.k) !== -1 && /^\d{4}-\d\d-\d\d$/.test(g.d) && /^[a-f0-9]{16}$/.test(g.by); }).map(function (g) { return { to: g.to, by: g.by, k: g.k, d: g.d }; }) : []
    };
  }

  /* On your own website the board runs through the family account script:
     anyone can see it; signed-in families with the parent's OK appear on it. */
  let web = false, webRows = [], webTotal = 0, webTimer = null, webCh = false, webV2 = false;
  function webOn() { return !!(BD.Family && BD.Family.enabled()) && !(window.claude && window.claude.use); }
  async function webLoad() {
    const res = await BD.Family.call("board", { token: BD.Family.token() || "" });
    if (!res || !res.ok) return;
    webRows = (Array.isArray(res.rows) ? res.rows : []).slice(0, 300).map(function (r) {
      const x = cleanPlayer(r);
      x.me = !!r.me; x.sid = "";
      x.cw = Math.max(0, Math.min(100000, Math.round(Number(r.cw) || 0)));
      if (typeof r.h === "string" && /^[a-f0-9]{16}$/.test(r.h)) x.h = x.key = r.h;
      if (x.me && typeof r.sid === "string" && /^[a-f0-9]{16}$/.test(r.sid)) {
        x.sid = r.sid;
        const ch = r.ch && typeof r.ch === "object" ? r.ch : {}, days = {};
        Object.keys(ch.d || {}).slice(0, 8).forEach(function (d) { if (/^\d{4}-\d\d-\d\d$/.test(d)) days[d] = cleanCounts(ch.d[d]); });
        const by = []; Object.keys(ch.by || {}).forEach(function (n) { if (nickParts(n) || /^[A-Z]\.$/.test(n)) by.push([n, Math.max(1, Math.round(Number(ch.by[n]) || 1))]); });
        x.cheers = { week: cleanCounts(ch.t), days: days, by: by.sort(function (a, b) { return b[1] - a[1]; }).slice(0, 12) };
      }
      return x.key ? x : null;
    }).filter(Boolean);
    webCh = res.challenges === true; // the deployed script knows friend challenges
    webV2 = res.v === 2 && res.cheers === true; // ... and the all-time / streak boards and cheers
    webTotal = Math.max(0, Math.min(10000000, Number(res.total) || 0));
    render();
    splash();
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
        render(); splash();
      }, function () { /* keep what we have */ });
    } catch (e) { col = null; return; }
    ready = true;
    render(); splash();
    push();
  }

  /* This family's joined students: points this week, all-time points and streak. */
  function mine() {
    const ws = BD.Parent.weekStart(), now = Date.now() + 864e5;
    return BD.Store.players().filter(function (p) { return p.dojoOptIn; }).map(function (p) {
      const w = BD.Parent.weekStats(p, ws, now), belt = BD.beltOf(p);
      return { sid: sid(p.id), name: display(p), belt: belt.name, reps: Math.min(1500, w.correct), xp: Math.min(10000, BD.xpSince(p, ws)), life: Math.min(1000000, p.xp || 0), st: Math.min(3650, BD.streak(p).days) };
    });
  }
  let lastWeb = "", given = [];
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
      const was = entries[uid];
      const gv = (was && was.week === weekId() ? was.given : []).concat(given).slice(-600); given = [];
      const doc = { week: weekId(), players: mine(), given: gv, updatedAt: Date.now() };
      if (!doc.players.length && !was) return;
      if (was && !gv.length && JSON.stringify(was.players.map(function (x) { return [x.name, x.belt, x.reps, x.xp, x.life, x.st]; })) === JSON.stringify(doc.players.map(function (x) { return [x.name, x.belt, x.reps, x.xp, x.life, x.st]; })) && was.week === doc.week && !(was.given || []).length) return;
      try { await col.doc(uid).set(doc); entries[uid] = cleanEntry(doc); render(); } catch (e) { /* can't write here: the board stays read-only */ }
    }, 1500);
  }

  /* Everyone on the board (Claude link): all-time and streaks carry over; this week's XP only for this week. */
  function board() {
    if (web) return { rows: webRows, total: webTotal, goal: GOAL, v2: webV2 };
    const wk = weekId(), rows = [], cheersIn = {};
    Object.keys(entries).forEach(function (id) {
      const e = entries[id]; if (!e) return;
      e.given.forEach(function (g) {
        const from = e.players.find(function (x) { return x.sid === g.by; });
        const c = cheersIn[g.to] = cheersIn[g.to] || { week: {}, days: {}, by: {} };
        c.week[g.k] = (c.week[g.k] || 0) + 1;
        c.days[g.d] = c.days[g.d] || {}; c.days[g.d][g.k] = (c.days[g.d][g.k] || 0) + 1;
        if (from) c.by[from.name] = (c.by[from.name] || 0) + 1;
      });
    });
    Object.keys(entries).forEach(function (id) {
      const e = entries[id]; if (!e) return;
      e.players.forEach(function (pl) {
        if (!pl.sid) return;
        const key = id + ":" + pl.sid, c = cheersIn[key], cur = e.week === wk;
        rows.push(Object.assign({}, pl, { me: id === uid, key: key, xp: cur ? pl.xp : 0, reps: cur ? pl.reps : 0, cw: c ? total(c.week) : 0,
          cheers: id === uid ? { week: c ? c.week : {}, days: c ? c.days : {}, by: c ? Object.keys(c.by).map(function (n) { return [n, c.by[n]]; }).sort(function (a, b) { return b[1] - a[1]; }) : [] } : undefined }));
      });
    });
    rows.sort(function (a, b) { return (b.xp - a.xp) || (b.reps - a.reps); });
    return { rows: rows, total: rows.reduce(function (a, r) { return a + (r.reps || 0); }, 0), goal: GOAL, v2: true };
  }
  const SORTS = {
    week: { label: "This week", sort: function (a, b) { return (b.xp - a.xp) || (b.reps - a.reps); }, val: function (r) { return r.xp.toLocaleString() + " XP"; }, raw: function (r) { return r.xp; } },
    life: { label: "All-time", sort: function (a, b) { return (b.life - a.life) || (b.rank - a.rank); }, val: function (r) { return r.life.toLocaleString() + " XP"; }, raw: function (r) { return r.life; } },
    streak: { label: "Streaks", sort: function (a, b) { return (b.st - a.st) || (b.life - a.life); }, val: function (r) { return "🔥 " + r.st + (r.st === 1 ? " day" : " days"); }, raw: function (r) { return r.st; } }
  };
  function myRowFor(p, rows) { if (!p) return null; const id = sid(p.id); return rows.find(function (r) { return r.me && r.sid === id; }) || null; }

  /* ---------- cheering ---------- */
  const SUPPORT_DAYS = [3, 5], SUPPORT_XP = 5;
  function supportWeek(p) {
    const wk = weekId();
    if (!p.support || p.support.wk !== wk) p.support = { wk: wk, days: [], paid: 0 };
    return p.support;
  }
  /* Being a consistent supporter earns XP: cheer friends on 3 different days in a week (+5), then 5 days (+5 more). */
  function noteSupport(p) {
    const s = supportWeek(p), t = BD.today();
    if (s.days.indexOf(t) === -1) s.days.push(t);
    let xp = 0;
    while (s.paid < SUPPORT_DAYS.length && s.days.length >= SUPPORT_DAYS[s.paid]) { s.paid++; xp += BD.addXP(p, SUPPORT_XP); }
    BD.Store.save(p);
    return xp;
  }
  async function sendCheer(p, r, kind, btn) {
    const me = myRowFor(p, board().rows); if (!me || r.me) return false;
    let ok = false;
    if (web) {
      const res = await BD.Family.call("cheer", { token: BD.Family.token(), sid: me.sid, to: r.key, kind: kind, day: BD.today() });
      ok = !!(res && res.ok);
    } else {
      given.push({ to: r.key, by: me.sid, k: kind, d: BD.today() }); ok = true; push();
    }
    if (!ok) { if (btn) btn.classList.add("cheer-fail"); return false; }
    r.cw = (r.cw || 0) + 1;
    const xp = noteSupport(p);
    pop(btn, CHEERS.find(function (c) { return c.k === kind; }).icon, xp);
    BD.Sound.tap();
    const cnt = btn && btn.closest("li") && btn.closest("li").querySelector(".dl-cw");
    if (cnt) cnt.textContent = "💛 " + r.cw;
    const sp = $("supportLine"); if (sp) sp.innerHTML = supportLine(p);
    return true;
  }
  function pop(btn, icon, xp) {
    if (!btn) return;
    const rc = btn.getBoundingClientRect(), el = document.createElement("span");
    el.className = "cheer-pop"; el.textContent = icon + (xp ? " +" + xp + " XP" : " +1");
    el.style.left = (rc.left + rc.width / 2) + "px"; el.style.top = rc.top + "px";
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 1100);
  }
  function supportLine(p) {
    const s = supportWeek(p), n = s.days.length, next = SUPPORT_DAYS.find(function (d) { return d > n; });
    return '💛 <strong>Supporter:</strong> cheered friends on ' + n + (n === 1 ? " day" : " days") + ' this week. ' +
      (next ? (next - n) + " more " + (next - n === 1 ? "day" : "days") + " for +" + SUPPORT_XP + " XP." : "Super Supporter! +" + (SUPPORT_XP * SUPPORT_DAYS.length) + " XP earned this week.");
  }
  function cheerIcons(t) { return CHEERS.filter(function (c) { return t && t[c.k]; }).map(function (c) { return '<span class="ci">' + c.icon + '<b>' + t[c.k] + '</b></span>'; }).join(""); }

  /* When cheers have come in since the student last looked: a burst of icons on the screen. */
  function splash() {
    const p = BD.Store.current(); if (!p || !p.dojoOptIn) return;
    const me = myRowFor(p, board().rows); if (!me || !me.cheers) return;
    const wk = weekId(), n = total(me.cheers.week), seen = p.cheerSeen && p.cheerSeen.wk === wk ? p.cheerSeen.n : 0;
    if (n <= seen) return;
    p.cheerSeen = { wk: wk, n: n }; BD.Store.save(p);
    const today = me.cheers.days[BD.today()] || {};
    const toast = document.createElement("div");
    toast.className = "cheer-toast"; toast.setAttribute("role", "status");
    toast.innerHTML = '<strong>Your dojo is cheering for you!</strong><span>' + (total(today) ? "Today: " + cheerIcons(today) + " · " : "") + "This week: " + cheerIcons(me.cheers.week) + '</span>';
    document.body.appendChild(toast);
    const icons = []; CHEERS.forEach(function (c) { for (let i = 0; i < Math.min(8, (me.cheers.week[c.k] || 0)); i++) icons.push(c.icon); });
    icons.slice(0, 24).forEach(function (ic, i) {
      const f = document.createElement("span"); f.className = "cheer-float"; f.textContent = ic;
      f.style.left = (8 + Math.random() * 84) + "vw"; f.style.animationDelay = (i * 0.12) + "s";
      document.body.appendChild(f); setTimeout(function () { f.remove(); }, 3600 + i * 120);
    });
    setTimeout(function () { toast.classList.add("out"); setTimeout(function () { toast.remove(); }, 600); }, 5200);
  }

  /* Home screen card. */
  function render() {
    const el = $("dojoCard"); if (!el) return;
    if (!ready) { el.hidden = true; return; }
    const b = board(), pct = Math.min(100, Math.round(100 * b.total / b.goal)), p = BD.Store.current();
    const me = myRowFor(p, b.rows), rank = me ? b.rows.slice().sort(SORTS.week.sort).indexOf(me) + 1 : 0;
    el.hidden = false;
    el.innerHTML = '<div class="dojo-head"><span class="dojo-title">🏆 Dojo Leaderboard</span><span class="dojo-num">' + b.total.toLocaleString() + ' / ' + b.goal.toLocaleString() + '</span></div>' +
      '<div class="dojo-bar"><i style="width:' + pct + '%"></i></div>' +
      '<p class="dojo-sub">' + (me ? 'You\'re <strong>#' + rank + '</strong> this week · ' + me.belt + ' Belt · ' + me.life.toLocaleString() + ' XP all-time' + (me.cheers && total(me.cheers.week) ? ' · ' + cheerIcons(me.cheers.week) : '') + '. ' : '') +
      (pct >= 100 ? "Team goal smashed!" : "Team goal: right answers this week from " + b.rows.filter(function (r) { return r.xp > 0 || r.reps > 0; }).length + " champions.") +
      (p && !p.dojoOptIn ? " <span class='muted'>Tap to see the leaderboard. Ask a parent to join you in.</span>" : " <span class='muted'>Tap to see the boards and cheer on friends.</span>") + '</p>';
  }
  let tab = "week";
  function openBoard(which) {
    if (!ready) return;
    if (which) tab = which;
    const b = board(), p = BD.Store.current();
    if (!b.v2) tab = "week";
    const canCh = !!(p && BD.Challenge && BD.Challenge.canSend(p));
    const me = myRowFor(p, b.rows), canCheer = !!(me && b.v2);
    const S = SORTS[tab], rows = b.rows.slice().sort(S.sort);
    const myIdx = me ? rows.indexOf(me) : -1;
    const ahead = myIdx > 0 ? rows[myIdx - 1] : null, gap = ahead ? S.raw(ahead) - S.raw(me) : 0;
    const medal = ["🥇", "🥈", "🥉"];
    const podium = rows.slice(0, 3).map(function (r, i) {
      return '<div class="pod pod-' + (i + 1) + (r.me ? " me" : "") + '"><span class="pod-medal">' + medal[i] + '</span><span class="pod-name">' + BD.UI.esc(r.name) + '</span><span class="belt-swatch" style="--belt:' + r.color + '"></span><span class="pod-val">' + S.val(r) + '</span></div>';
    });
    const order = podium.length === 3 ? [podium[1], podium[0], podium[2]] : podium;
    BD.UI.sheet("Dojo Leaderboard",
      (p ? '<div class="nick-bar"><span>Your leaderboard name: <strong>' + BD.UI.esc(display(p)) + '</strong>' + (p.dojoOptIn ? '' : ' <span class="muted small">(not on the board yet: ask a parent)</span>') + '</span><button type="button" class="btn btn-small btn-gold" id="nickPick">' + (p.nick ? "Change nickname" : "Pick a nickname") + '</button></div>' : '') +
      (me ? '<div class="my-card"><span class="belt-swatch big" style="--belt:' + me.color + '"></span><div><strong>' + BD.UI.esc(me.name) + '</strong> · ' + me.belt + ' Belt' +
        '<div class="my-stats"><span><b>#' + (rows.indexOf(me) + 1 || "–") + '</b> ' + S.label.toLowerCase() + '</span><span><b>' + me.xp.toLocaleString() + '</b> XP this week</span><span><b>' + me.life.toLocaleString() + '</b> XP all-time</span><span><b>🔥 ' + me.st + '</b> day streak</span></div>' +
        (me.cheers && total(me.cheers.week) ? '<div class="my-cheers">Cheers this week: ' + cheerIcons(me.cheers.week) + (me.cheers.by.length ? ' <span class="muted small">from ' + me.cheers.by.slice(0, 5).map(function (x) { return BD.UI.esc(x[0]); }).join(", ") + (me.cheers.by.length > 5 ? " and more" : "") + '</span>' : '') + '</div>' : '') +
        '</div></div>' : '') +
      (b.v2 ? '<div class="lb-tabs" role="tablist">' + Object.keys(SORTS).map(function (k) { return '<button type="button" role="tab" class="lb-tab' + (k === tab ? " on" : "") + '" aria-selected="' + (k === tab) + '" data-tab="' + k + '">' + SORTS[k].label + '</button>'; }).join("") + '</div>' : '<h4 class="label">Leaderboard · XP this week</h4>') +
      (ahead && gap >= 0 ? '<p class="lb-chase">' + (tab === "streak" ? "Keep training: " + (gap + 1) + (gap + 1 === 1 ? " more day" : " more days") + " passes " : "Only " + (Math.floor(gap) + 1).toLocaleString() + " XP to pass ") + '<strong>' + BD.UI.esc(ahead.name) + '</strong>! You\'ve got this. 💪</p>' : myIdx === 0 ? '<p class="lb-chase">You\'re leading the dojo! Lead by example and cheer on your teammates. 🏆</p>' : '') +
      (rows.length ? '<div class="podium">' + order.join("") + '</div>' +
        '<ol class="dojo-list lb">' + rows.map(function (r, i) {
          return '<li' + (r.me ? ' class="me"' : '') + ' data-key="' + BD.UI.esc(r.key) + '"><span class="dl-rank">' + (i + 1) + '</span><span class="belt-swatch" style="--belt:' + r.color + '"></span><span class="dl-name">' + BD.UI.esc(r.name) + '<span class="dl-belt">' + BD.UI.esc(r.belt) + ' Belt</span></span><span class="dl-n">' + S.val(r) + '</span>' +
            '<span class="dl-cw" title="Cheers this week">' + (r.cw ? "💛 " + r.cw : "") + '</span>' +
            (canCheer && !r.me ? '<span class="dl-cheers">' + CHEERS.map(function (c) { return '<button type="button" class="cheer-btn" data-cheer="' + c.k + '" aria-label="Give ' + BD.UI.esc(r.name) + ' a ' + c.name + '">' + c.icon + '</button>'; }).join("") + '</span>' : '') +
            (canCh && !r.me && r.h ? '<button type="button" class="btn btn-small btn-quiet dl-ch" data-ch="' + r.h + '" aria-label="Challenge ' + BD.UI.esc(r.name) + '">⚔️ Challenge</button>' : '') + '</li>';
        }).join("") + '</ol>' : '<p class="muted">No one is on this board yet. Be the first!</p>') +
      (canCheer ? '<p class="support-line" id="supportLine">' + supportLine(p) + '</p>' : b.v2 && p && !p.dojoOptIn ? '<p class="muted small">Join the leaderboard (ask a parent in the Parent corner) to cheer on friends.</p>' : '') +
      '<p class="muted small">Cheer as often as you like: 🤜 fist bump, 🙌 high-five, 👏 applause, 👍 thumbs up. Supporting others is a black belt skill.</p>' +
      (BD.Challenge ? BD.Challenge.boardNote(p, canCh) : '') +
      '<p><strong>' + b.total.toLocaleString() + '</strong> of <strong>' + b.goal.toLocaleString() + '</strong> right answers this week (team goal). This week\'s board resets every Monday.</p>' +
      '<p class="muted small">XP comes from doing the work: practice (up to 100 per stripe), graduation bonuses earned by that practice (up to +100), Daily Flashcards, bosses, challenges, team lessons and daily chests. Stripe tests alone give no points. No names are ever shown: only nicknames (or first initials) and belts. Parents can join or leave in the Parent corner.</p>');
    if ($("nickPick")) $("nickPick").onclick = function () { pickNick(p, function () { openBoard(); }); };
    $("infoBody").onclick = function (e) {
      const t = e.target.closest("[data-tab]");
      if (t) { BD.Sound.tap(); openBoard(t.dataset.tab); return; }
      const c = e.target.closest("[data-cheer]");
      if (c) { const li = c.closest("li"), r = rows.find(function (x) { return x.key === li.dataset.key; }); if (r) sendCheer(p, r, c.dataset.cheer, c); return; }
      const ch = e.target.closest("[data-ch]");
      if (ch) { const r = rows.find(function (x) { return x.h === ch.dataset.ch; }); if (r) BD.Challenge.send(p, r); }
    };
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

  return { CHEERS: CHEERS, splash: splash, supportWeek: supportWeek, sendCheer: sendCheer, sid: sid, web: function () { return web; }, webChallenges: function () { return web && webCh; }, myRow: function (p) { const id = sid(p.id); return webRows.find(function (r) { return r.me && r.sid === id; }) || null; }, reload: function () { return web ? webLoad() : Promise.resolve(); }, nickOk: nickOk, randomNick: randomNick, pickNick: pickNick, display: display, init: init, push: push, render: render, openBoard: openBoard, toggle: toggle, board: board, ready: function () { return ready; } };
})();
