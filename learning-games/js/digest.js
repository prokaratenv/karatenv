/* WEEKLY PARENT EMAIL — an opt-in note every Monday: what each child
   practiced last week, their wins, what they're working on, the Engage Teams
   talking points and one thing to try at home. Parents never have to open
   the app to read it.
   Privacy: the parent's email stays on this device (localStorage
   "brainDojo.digest"). When the app is opened on or after Monday of a new week
   and the family is signed in, this device builds last week's summary from
   its own student data and asks the family script (action "digest") to send
   it. The script checks the email is the family's own sign-in email, sends at
   most one weekly note per family, builds the email itself from plain fields,
   and doesn't keep the email. */
window.BD = window.BD || {};

BD.Digest = (function () {
  const KEY = "brainDojo.digest", DAY = 864e5, RETRY = 30 * 60e3;
  const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/;
  const SUBJECTS = { math: "Math", reading: "Reading", spelling: "Spelling", comprehension: "Comprehension", spanish: "Spanish" };
  const QUESTIONS = ["What could you do?", "What's the right response?", "What should you say?"];
  const esc = function (s) { return BD.UI.esc(s); };
  const inClaude = function () { return !!(window.claude && typeof window.claude.use === "function"); };

  const read = function () { try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return v && typeof v === "object" ? v : {}; } catch (e) { return {}; } };
  const write = function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
  const update = function (o) { const v = Object.assign(read(), o); Object.keys(v).forEach(function (k) { if (v[k] === undefined) delete v[k]; }); write(v); return v; };
  const okEmail = function (e) { return EMAIL_RE.test(String(e || "")); };
  const dstr = function (t) { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const weekKey = function (t) { return dstr(BD.Parent.weekStart(t || Date.now())); };

  /* The email typed at family sign-in this session (memory only), to prefill the field. */
  let typed = "";
  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest || !e.target.closest("#faSend")) return;
    const el = document.getElementById("faEmail"); if (el && okEmail(el.value.trim())) typed = el.value.trim().toLowerCase();
  }, true);

  /* ---------- one child's summary for [from, to) ---------- */
  function kid(p, from, to) {
    const w = BD.Parent.weekStats(p, from, to), inRange = function (iso) { const t = new Date(iso).getTime(); return t >= from && t < to; };
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), sess = (p.sessions || []).filter(function (s) { return s.date && inRange(s.date); });
    const wins = [];
    w.belts.forEach(function (b) { wins.push("Earned the " + b.to.name + " Belt (" + BD.gradeLabel(b.grade) + ")"); });
    w.stripes.forEach(function (x) { wins.push("Earned a " + (SUBJECTS[x.subject] || "new") + " stripe"); });
    w.badges.forEach(function (b) { wins.push("New badge: " + BD.Badges.gearName(b)); });
    const bosses = []; sess.forEach(function (s) { if (s.game === "boss" && s.won && s.boss && bosses.indexOf(s.boss) === -1) bosses.push(s.boss); });
    bosses.forEach(function (b) { wins.push("Beat the boss " + b); });
    const medals = { gold: 0, silver: 0, bronze: 0 };
    sess.forEach(function (s) { if (s.game === "tournament" && medals[s.medal] !== undefined) medals[s.medal]++; });
    ["gold", "silver", "bronze"].forEach(function (m) { if (medals[m]) wins.push(medals[m] + " tournament " + m + " medal" + (medals[m] > 1 ? "s" : "")); });
    if (BD.Kid) {
      const st = sess.filter(function (s) { return String(s.game).indexOf("test-") !== 0 && (s.game === "boss" || s.game === "team" || s.game === "tournament" || (Number(s.total) || 0) >= 3); }).length;
      if (st) wins.push(st + (st === 1 ? " sticker" : " stickers") + " for the Sticker Book");
    }

    const weak = [], ins = BD.Parent.insight(p);
    const addWeak = function (s) { if (s && weak.indexOf(s) === -1) weak.push(s); };
    if (ins && ins.weak) addWeak(ins.weak.label.charAt(0).toUpperCase() + ins.weak.label.slice(1) + " (" + Math.round(ins.weak.r * 100) + "% right lately)");
    try { if (BD.SentenceGen && BD.SentenceGen.weakSkill) { const s = BD.SentenceGen.weakSkill(p, p.sentenceGrade); if (s) addWeak("Fix-It Sentences: " + BD.SentenceGen.skillLabel(s)); } } catch (e) { /* no data */ }
    try { if (BD.StoryGen && BD.StoryGen.weakType) { const t = BD.StoryGen.weakType(p, p.readingGrade); const RT = BD.READ_TYPES || {}; if (t && RT[t]) addWeak("Story Scrolls: " + RT[t].label.toLowerCase() + " questions"); } } catch (e) { /* no data */ }
    try { if (BD.Phonics && BD.Phonics.parentLine) addWeak(BD.Phonics.parentLine(p)); } catch (e) { /* no data */ }

    const teams = [];
    if (BD.Teams) {
      const wk = dstr(BD.Parent.weekStart(from + DAY)); // DST-safe key of the summarized week
      BD.Teams.myTeams(p).forEach(function (t) {
        const v = ((p.teamLog || {})[t.id] || {})[wk];
        if (!v || !v.done) { teams.push({ team: t.name, done: false }); return; }
        const les = (BD.Teams.LESSONS[t.id] || [])[v.l || 0]; if (!les) return;
        const mo = les.m[v.a === undefined ? 1 : v.a] || les.m[1];
        teams.push({ team: t.name, done: true, title: les.title, value: les.value, moment: mo[0], say: v.say || "", mission: les.mission,
          picks: (v.picks || []).slice(0, 3).map(function (c, i) { return { q: QUESTIONS[i], chose: c === 0 ? mo[i + 1] : les.no[i][c - 1], best: c === 0, found: c === 0 ? "" : mo[i + 1] }; }) });
      });
    }
    return {
      name: p.name, belt: BD.BELTS[r.belt].name, grade: BD.gradeLabel(g),
      days: w.days, rounds: w.rounds, answers: w.answers, pct: w.answers ? Math.round(100 * w.correct / w.answers) : 0, streak: BD.streak(p).days,
      games: Object.keys(w.games).sort(function (a, b) { return w.games[b] - w.games[a]; }).map(function (id) { return { id: id, n: w.games[id] }; }),
      wins: wins, weak: weak.slice(0, 4), teams: teams, _tip: ins && ins.weak ? ins.tip : null, _anyTip: ins && ins.tip
    };
  }
  /* Everything the email needs. kind "weekly": last week; "sample": this week so far. */
  function summary(kind) {
    const ws = BD.Parent.weekStart(Date.now());
    const from = kind === "sample" ? ws : BD.Parent.weekStart(ws - 3 * DAY), to = kind === "sample" ? Date.now() + 1 : ws;
    const kids = BD.Store.players().slice(0, 6).map(function (p) { return kid(p, from, to); });
    let tip = null;
    kids.some(function (k) { tip = k._tip; return !!tip; });
    if (!tip) kids.some(function (k) { const t = k.teams.find(function (x) { return x.done && x.mission; }); tip = t ? t.mission : null; return !!tip; });
    if (!tip) kids.some(function (k) { tip = k._anyTip; return !!tip; });
    if (!tip) tip = "Ask your child to teach you one thing they learned in Brain Dojo this week. Teaching it locks it in.";
    kids.forEach(function (k) { delete k._tip; delete k._anyTip; });
    return { week: weekKey(), kids: kids, tip: tip };
  }

  /* ---------- sending ---------- */
  let busy = false;
  async function send(kind, email) {
    const s = summary(kind);
    return BD.Family.call("digest", { token: BD.Family.token(), email: email, kind: kind, week: s.week, kids: s.kids, tip: s.tip });
  }
  /* On or after Monday of a new week: send last week's note once. */
  async function maybeSend() {
    const s = read(), wk = weekKey();
    if (busy || inClaude() || !s.on || !okEmail(s.email) || !BD.Family || !BD.Family.linked()) return null;
    if (s.lastSentWeek && s.lastSentWeek >= wk) return null;
    if (s.lastTry && Date.now() - s.lastTry < RETRY && Date.now() >= s.lastTry) return null;
    if (!BD.Store.players().length) return null;
    busy = true;
    let res;
    try { res = await send("weekly", s.email); } finally { busy = false; }
    if (res.ok) update({ lastSentWeek: wk, lastSentAt: new Date().toISOString(), lastTry: undefined, error: undefined });
    else if (res.error === "already") update({ lastSentWeek: wk, lastTry: undefined }); // another device sent it
    else if (res.error === "wrong_email") update({ lastSentWeek: wk, error: "wrong_email", lastTry: undefined });
    else if (res.error !== "signed_out") update({ lastTry: Date.now() });
    return res;
  }
  const soon = function () { setTimeout(function () { maybeSend(); }, 2500); };
  BD.on("home", soon);
  window.addEventListener("load", function () { setTimeout(maybeSend, 4000); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") soon(); });

  /* ---------- Parents area setting ---------- */
  let note = null; // { t, good } shown after a re-render
  function lastLine(s) {
    if (s.lastSentAt) return "Last sent: " + new Date(s.lastSentAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    return "Last sent: not yet" + (s.on ? " · the first one comes Monday" : "");
  }
  BD.Settings.add({
    id: "digest", scope: "family", title: "Weekly progress email",
    html: function () {
      if (inClaude()) return '<p class="muted small dg-off">📧 The weekly progress email is available on <strong>brain.engagelma.com</strong>, where you sign in with a parent\'s email.</p>';
      if (!BD.Family || !BD.Family.enabled()) return "";
      const s = read(), linked = BD.Family.linked(), on = !!(s.on && linked);
      const email = s.email || typed || "";
      return '<div class="dg">' +
        '<label class="dg-row"><span><strong>Weekly progress email</strong><span class="muted small">Every Monday: what each child practiced, their wins, what to work on, Engage Teams talking points and one thing to try at home. No need to open the app.</span></span>' +
        '<input type="checkbox" class="switch" data-dg-on' + (on ? " checked" : "") + (linked ? "" : " disabled") + ' aria-label="Weekly progress email"></label>' +
        (linked ? '<label class="lf dg-email"><span>Parent email (the one you signed in with)</span><input type="email" data-dg-email autocomplete="email" inputmode="email" maxlength="254" value="' + esc(email) + '" placeholder="you@example.com"></label>' +
          '<p class="muted small dg-note">We use your email only to send this weekly note; it isn\'t stored on our server. It\'s kept on this device, which sends the note when Brain Dojo is opened on or after Monday.</p>' +
          '<div class="dg-actions"><button type="button" class="btn btn-small btn-quiet" data-dg-sample>Send me a sample now</button><span class="small muted" data-dg-last>' + esc(lastLine(s)) + '</span></div>' +
          (s.on && s.error === "wrong_email" ? '<p class="lf-msg">Last week\'s email wasn\'t sent: that email isn\'t the one this family signed in with.</p>' : '')
          : '<p class="muted small">Sign in with a parent\'s email first (family account), then turn this on.</p><div class="dg-actions"><button type="button" class="btn btn-small btn-gold" data-dg-signin>Sign in with email</button></div>') +
        '<p class="lf-msg' + (note && note.good ? " good" : "") + '" data-dg-msg aria-live="polite">' + (note ? esc(note.t) : "") + '</p></div>';
    },
    bind: function (el, p, rerender) {
      note = null;
      const q = function (sel) { return el.querySelector(sel); };
      const msg = function (t, good) { const m = q("[data-dg-msg]"); if (m) { m.textContent = t; m.className = "lf-msg" + (good ? " good" : ""); } };
      const field = function () { const f = q("[data-dg-email]"); return f ? f.value.trim().toLowerCase() : ""; };
      const done = function (t, good) { note = { t: t, good: good }; rerender(); };
      const why = function (res) {
        return res.error === "wrong_email" ? "That isn't the email this family signed in with. Use the same email as your family account."
          : res.error === "limit" ? "That's the most for today. Try again tomorrow."
          : res.error === "signed_out" ? "This device isn't signed in to the family account anymore. Sign in again first."
          : res.error === "network" ? "Can't reach the family account right now. Check the internet and try again."
          : "The family account couldn't send it. If this keeps happening, the studio may need to update the family script.";
      };
      if (q("[data-dg-signin]")) q("[data-dg-signin]").onclick = function () { BD.Family.openSignIn(); };
      const sw = q("[data-dg-on]");
      if (sw && !sw.disabled) sw.onchange = async function () {
        if (!sw.checked) { update({ on: false, email: undefined, error: undefined }); return done("Off. No more weekly emails, and your email was removed from this device.", true); }
        const email = field();
        if (!okEmail(email)) { sw.checked = false; return msg("Type the parent email you signed in with first."); }
        sw.disabled = true; msg("Checking…", true);
        const res = await BD.Family.call("digest", { token: BD.Family.token(), email: email, kind: "check" });
        sw.disabled = false;
        if (!res.ok) { sw.checked = false; return msg(why(res)); }
        update({ on: true, email: email, lastSentWeek: weekKey(), error: undefined, lastTry: undefined });
        done("On. The first email comes next Monday. Want to see one now? Send a sample.", true);
      };
      const f = q("[data-dg-email]");
      if (f) f.onchange = async function () {
        const s = read(); if (!s.on) return;
        const email = field(); if (email === s.email) return;
        if (!okEmail(email)) return msg("Please check the email address.");
        msg("Checking…", true);
        const res = await BD.Family.call("digest", { token: BD.Family.token(), email: email, kind: "check" });
        if (!res.ok) return msg(why(res));
        update({ email: email, error: undefined }); msg("Saved. Weekly emails go to " + email + ".", true);
      };
      const b = q("[data-dg-sample]");
      if (b) b.onclick = async function () {
        const email = field();
        if (!okEmail(email)) return msg("Type the parent email you signed in with first.");
        if (!BD.Store.players().length) return msg("Add a student first.");
        b.disabled = true; msg("Sending a sample…", true);
        const res = await send("sample", email);
        if (!res.ok) { b.disabled = false; return msg(why(res)); }
        msg("Sample sent to " + email + ". Check your inbox (and the spam folder)." + (res.left === 0 ? " That's the last sample for today." : ""), true);
      };
    }
  });

  return { summary: summary, maybeSend: maybeSend, state: read, weekKey: weekKey, KEY: KEY };
})();
