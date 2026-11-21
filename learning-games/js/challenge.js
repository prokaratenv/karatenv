/* FRIEND CHALLENGES — tap a student on the Dojo leaderboard to challenge them
   to a Kata, Sparring or Weapons match for the weekend.
   - Send any day; matches are played Saturday 12:00 am through Sunday 11:59 pm
     (local time), then the challenge ends.
   - Each student plays their own run on their own device, at their own grade:
     Kata/Weapons = right answers in a row (up to 15); Sparring = points in a
     60-second round. Higher score wins: winner gold, the other silver (a tie is
     silver for both), with weekend double XP.
   - One challenge per pair per weekend; up to 3 scored challenges per student
     per weekend. Only nicknames (or initials) are ever shown.
   Runs through the family account script on the website (needs a signed-in
   family on the leaderboard); hidden inside Claude and when the script is older. */
window.BD = window.BD || {};

BD.Challenge = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const ERR = {
    already: "You've already challenged each other this weekend. One challenge per friend per weekend!",
    limit: "That's the weekend limit: up to 3 scored challenges (and 5 sent) each weekend.",
    busy: "That champion has a full inbox of challenges this weekend. Try someone else!",
    not_on_board: "You need to be on the leaderboard first. Ask a parent to join you in (Parent corner).",
    closed: "This challenge has ended. Challenges are played Saturday and Sunday.",
    signed_out: "Ask a parent to sign in with their email again (Parent corner).",
    network: "Can't reach the dojo right now. Check the internet and try again."
  };
  let list = [], loadedAt = 0, loading = null;

  /* ---------- the weekend window (local time) ---------- */
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const ymd = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  /* This weekend's Saturday (Sat/Sun), or the next one (Mon–Fri). */
  function weekendKey(now) {
    const d = new Date(now || Date.now()), day = d.getDay();
    d.setDate(d.getDate() + (day === 6 ? 0 : day === 0 ? -1 : 6 - day));
    return ymd(d);
  }
  function window_(wk) {
    const p = wk.split("-").map(Number), start = new Date(p[0], p[1] - 1, p[2]).getTime();
    return { start: start, end: new Date(p[0], p[1] - 1, p[2] + 2).getTime() }; // through Sunday 11:59 pm
  }
  function phase(c) { const w = window_(c.wk), t = Date.now(); return t < w.start ? "before" : t >= w.end ? "after" : "open"; }

  /* ---------- server ---------- */
  function on() { return !!(BD.Dojo && BD.Dojo.webChallenges() && BD.Family && BD.Family.linked()); }
  function canSend(p) { return on() && !!p.dojoOptIn && !!BD.Dojo.myRow(p); }
  async function call(action, data) { return BD.Family.call(action, Object.assign({ token: BD.Family.token() }, data)); }
  function clean(c) {
    if (!c || typeof c !== "object" || !/^[a-f0-9]{12}$/.test(c.id) || !/^\d{4}-\d\d-\d\d$/.test(c.wk) || ["kata", "sparring", "weapons"].indexOf(c.type) === -1 || !/^[a-f0-9]{16}$/.test(c.sid)) return null;
    const n = function (v) { return v === null || v === undefined ? null : Math.max(0, Math.min(40, Math.round(Number(v) || 0))); };
    const name = String(c.other || ""), okName = /^[A-Za-z]+ [A-Za-z]+ [1-9][0-9]?$/.test(name) || /^[A-Z]\.$/.test(name);
    return { id: c.id, wk: c.wk, type: c.type, st: ["pending", "accepted", "declined"].indexOf(c.st) !== -1 ? c.st : "pending", from: !!c.from, sid: c.sid,
      other: okName ? name : "A champion", otherBelt: BD.BELTS.some(function (b) { return b.name === c.otherBelt; }) ? c.otherBelt : "", my: n(c.my), their: n(c.their), theyPlayed: !!c.theyPlayed };
  }
  async function refresh(force) {
    if (!on()) { list = []; return list; }
    if (!force && Date.now() - loadedAt < 60000) return list;
    if (loading) return loading;
    loading = (async function () {
      const res = await call("chList", {});
      if (res && res.ok && Array.isArray(res.list)) { list = res.list.map(clean).filter(Boolean); loadedAt = Date.now(); settleAll(); }
      loading = null;
      return list;
    })();
    return loading;
  }
  function upsert(c) { c = clean(c); if (!c) return; list = list.filter(function (x) { return x.id !== c.id; }).concat(c); }
  function mineFor(p) { const id = BD.Dojo.sid(p.id); return list.filter(function (c) { return c.sid === id; }); }

  /* ---------- results + XP (once per challenge, on whichever device sees it first) ---------- */
  function outcome(c) {
    if (c.st !== "accepted" || c.my === null) return null;
    if (c.their !== null) return c.my > c.their ? "won" : c.my === c.their ? "tie" : "lost";
    return phase(c) === "after" ? "noshow" : null;
  }
  function settleAll() {
    BD.Store.players().forEach(function (p) {
      mineFor(p).forEach(function (c) {
        const o = outcome(c); if (!o) return;
        p.chDone = Array.isArray(p.chDone) ? p.chDone : [];
        if (p.chDone.indexOf(c.id) !== -1) return;
        const medal = o === "won" ? "gold" : "silver", xp = BD.Tourney.MEDAL_XP[medal] * 2; // weekend double
        p.chDone = p.chDone.concat(c.id).slice(-60);
        p.medals = (Array.isArray(p.medals) ? p.medals : []).concat({ t: c.type, m: medal, d: new Date().toISOString() }).slice(-300);
        BD.addXP(p, xp);
        BD.Store.save(p);
      });
    });
  }

  /* ---------- sending (from the leaderboard) ---------- */
  function boardNote(p, canCh) {
    if (window.claude && typeof window.claude.use === "function") return '<p class="muted small">⚔️ Weekend friend challenges are available at brain.engagelma.com.</p>';
    if (!BD.Dojo.webChallenges()) return "";
    if (canCh) return '<p class="muted small">⚔️ Tap Challenge to invite a friend to a weekend Kata, Sparring or Weapons match. Played Saturday and Sunday.</p>';
    return '<p class="muted small">⚔️ Join the leaderboard (a parent turns it on in the Parent corner) to challenge friends to weekend matches.</p>';
  }
  function send(p, row) {
    const types = Object.keys(BD.Tourney.TYPES).filter(function (t) { return BD.Tourney.open(p, t); });
    const wk = weekendKey(), w = window_(wk), opens = Date.now() < w.start;
    BD.UI.sheet("⚔️ Challenge " + row.name,
      '<p>Challenge <strong>' + esc(row.name) + '</strong> (' + esc(row.belt) + ' Belt) to a weekend match. You each play your own round at your own grade, and the higher score wins.</p>' +
      '<p class="muted small">' + (opens ? "Opens Saturday. " : "Play by Sunday night. ") + 'Winner 🥇 +' + BD.Tourney.MEDAL_XP.gold * 2 + ' XP · other 🥈 +' + BD.Tourney.MEDAL_XP.silver * 2 + ' XP (weekend double).</p>' +
      (types.length ? '<div class="ch-types">' + types.map(function (t) { const o = BD.Tourney.TYPES[t]; return '<button type="button" class="btn btn-gold" data-cht="' + t + '">' + o.icon + ' ' + esc(o.name.replace(" Tournament", "")) + '</button>'; }).join("") + '</div>'
        : '<p>Tournaments open at Yellow Belt with 2 stripes. Keep training and you can challenge friends soon!</p>') +
      '<p class="lf-msg" id="chMsg"></p>');
    document.querySelectorAll("#infoBody [data-cht]").forEach(function (btn) {
      btn.onclick = async function () {
        document.querySelectorAll("#infoBody [data-cht]").forEach(function (b) { b.disabled = true; });
        const res = await call("chSend", { sid: BD.Dojo.sid(p.id), to: row.h, type: btn.dataset.cht, wk: wk });
        if (res && res.ok) {
          upsert(res.challenge); BD.Sound.right();
          BD.UI.sheet("Challenge sent! ⚔️", '<p>You challenged <strong>' + esc(row.name) + '</strong> to ' + esc(BD.Tourney.TYPES[btn.dataset.cht].name.replace(" Tournament", "").toLowerCase()) + '. ' +
            (opens ? "When they accept, you can both play on Saturday or Sunday." : "When they accept, play any time before Sunday night.") + '</p><p class="muted small">Find it under Tournaments.</p>');
          BD.Tourney.card(p);
        } else {
          $("chMsg").textContent = ERR[res && res.error] || "That didn't work. Try again later.";
          document.querySelectorAll("#infoBody [data-cht]").forEach(function (b) { b.disabled = false; });
        }
      };
    });
  }

  /* ---------- the hub section + home notice ---------- */
  function inbox(p) { return mineFor(p).filter(function (c) { return !c.from && c.st === "pending" && phase(c) !== "after"; }); }
  function ready(p) { return mineFor(p).filter(function (c) { return c.st === "accepted" && c.my === null && phase(c) === "open"; }); }
  function homeLine(p) {
    if (!on() || !p) return "";
    const n = inbox(p).length, r = ready(p).length;
    return n ? " · ⚔️ " + n + " friend challenge" + (n === 1 ? "" : "s") + "!" : r ? " · ⚔️ Match ready!" : "";
  }
  function row(p, c) {
    const o = BD.Tourney.TYPES[c.type], ph = phase(c), what = o.icon + " " + o.name.replace(" Tournament", ""), who = '<strong>' + esc(c.other) + '</strong>' + (c.otherBelt ? ' <span class="muted small">' + esc(c.otherBelt) + '</span>' : '');
    let line = "", btns = "";
    const res = outcome(c);
    if (c.st === "declined") line = c.from ? who + " can't play this weekend." : "You passed on " + who + "'s challenge.";
    else if (res) {
      const medal = res === "won" ? "🥇" : "🥈", xp = BD.Tourney.MEDAL_XP[res === "won" ? "gold" : "silver"] * 2;
      line = res === "noshow" ? who + " didn't make it to the mat. You scored " + c.my + ". " + medal + " +" + xp + " XP"
        : "You " + c.my + " · " + who + " " + c.their + ": " + (res === "won" ? "you win! " : res === "tie" ? "a tie! " : "great match! ") + medal + " +" + xp + " XP";
    } else if (ph === "after") line = "This challenge with " + who + " has ended.";
    else if (c.st === "pending") {
      if (c.from) line = "Waiting for " + who + " to accept.";
      else if (!BD.Tourney.open(p, c.type)) { line = who + " challenged you to " + what + ", but that one opens at " + o.opens + ". Keep training, you'll get there!"; btns = '<button type="button" class="btn btn-small btn-quiet" data-chr="' + c.id + '" data-ok="0">OK</button>'; }
      else { line = who + " challenged you!"; btns = '<button type="button" class="btn btn-small btn-primary" data-chr="' + c.id + '" data-ok="1">Accept</button><button type="button" class="btn btn-small btn-quiet" data-chr="' + c.id + '" data-ok="0">Not this time</button>'; }
    } else if (c.my !== null) line = "You scored " + c.my + ". Waiting for " + who + " to play" + (c.theyPlayed ? "" : "") + ".";
    else if (ph === "before") { line = "Match on with " + who + "!"; btns = '<span class="ch-soon">Opens Saturday</span>'; }
    else if (!BD.Tourney.open(p, c.type)) line = "This one opens at " + o.opens + ".";
    else { line = "Match on with " + who + "!"; btns = '<button type="button" class="btn btn-small btn-primary" data-chp="' + c.id + '">Play now</button>'; }
    return '<li class="ch-row"><span class="ch-what">' + what + '</span><span class="ch-line">' + line + '</span>' + (btns ? '<span class="ch-btns">' + btns + '</span>' : '') + '</li>';
  }
  function hubSection(p) {
    if (!on()) return "";
    const mine = mineFor(p).sort(function (a, b) { return a.wk < b.wk ? 1 : -1; });
    return '<div class="ch-hub"><h4 class="label">⚔️ Friend challenges · weekends</h4>' +
      (mine.length ? '<ul class="ch-list">' + mine.map(function (c) { return row(p, c); }).join("") + '</ul>'
        : '<p class="muted small">Challenge a friend from the Dojo leaderboard (tap the Dojo Challenge card). Matches are played Saturday and Sunday.</p>') +
      '<p class="lf-msg" id="chHubMsg"></p></div>';
  }
  async function hubClick(e) {
    const p = BD.Store.current();
    const r = e.target.closest("[data-chr]");
    if (r) {
      r.disabled = true;
      const res = await call("chRespond", { sid: BD.Dojo.sid(p.id), id: r.dataset.chr, accept: r.dataset.ok === "1" });
      if (res && res.ok) { upsert(res.challenge); BD.Sound.tap(); BD.Tourney.hub(); } else { r.disabled = false; if ($("chHubMsg")) $("chHubMsg").textContent = ERR[res && res.error] || "That didn't work. Try again."; }
      return true;
    }
    const pl = e.target.closest("[data-chp]");
    if (pl) {
      const c = list.find(function (x) { return x.id === pl.dataset.chp; });
      if (c && phase(c) === "open") BD.Tourney.challenge(c);
      return true;
    }
    return false;
  }
  /* After a challenge round: send the score, then show where things stand. */
  async function submit(c, score) {
    const p = BD.Store.current();
    const res = await call("chScore", { sid: BD.Dojo.sid(p.id), id: c.id, score: score });
    if (res && res.ok) { upsert(res.challenge); settleAll(); }
    const now = list.find(function (x) { return x.id === c.id; }) || c;
    return { ok: !!(res && res.ok), error: res && res.error, c: now, outcome: outcome(now) };
  }
  function sanitize(p) {
    if (p.chDone !== undefined) p.chDone = Array.isArray(p.chDone) ? p.chDone.filter(function (x) { return typeof x === "string" && /^[a-f0-9]{12}$/.test(x); }).slice(-60) : [];
  }
  BD.Store.players().forEach(sanitize);

  return { on: on, canSend: canSend, refresh: refresh, send: send, boardNote: boardNote, hubSection: hubSection, hubClick: hubClick, homeLine: homeLine,
    submit: submit, sanitize: sanitize, weekendKey: weekendKey, phase: phase, outcome: outcome, list: function () { return list; } };
})();
