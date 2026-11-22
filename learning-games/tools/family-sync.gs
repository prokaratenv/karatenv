/**
 * Brain Dojo FAMILY ACCOUNTS — sign in with a parent's email, and each
 * student's progress follows them to every device.
 *
 * How it works: a parent types their email, gets a 6-digit code from your
 * Gmail, and types it in. That device is then linked to the family.
 *
 * Privacy by design: this script never stores an email address, a child's
 * name or any readable progress. Each device encrypts every student before
 * sending it (with a key made from the parent's email, which never leaves
 * the device as a key), so each family's file in the "Brain Dojo Family
 * Data" folder holds only: an anonymous family number, scrambled student
 * data, and fingerprints of the linked devices' keys. The email is used once
 * to send the code and is not saved. The opt-in weekly parent email works the
 * same way: the parent's device sends the email with each week's short note,
 * the email must be the family's own sign-in email, and it isn't saved.
 *
 * Updating: paste this file over the old code, Save, then Deploy → Manage
 * deployments → Edit (pencil) → Version: New version → Deploy. Same URL.
 *
 * Setup (about 5 minutes, free):
 *  1. Go to script.google.com → New project. Name it "Brain Dojo Family Sync".
 *  2. Delete what's there and paste this whole file. Save.
 *  3. (Optional) Change STUDIO below to your school's name.
 *  4. Deploy → New deployment → type "Web app".
 *       Execute as: Me.   Who has access: Anyone.   → Deploy.
 *     Allow the permissions it asks for (Drive files it creates, and sending
 *     email as you).
 *  5. Copy the Web app URL (ends in /exec) into js/config.js as accountEndpoint.
 *
 * Limits: Gmail lets a regular Google account send about 100 code emails a
 * day (Google Workspace: about 1,500). Each family's file holds up to 10
 * students.
 */
var STUDIO = "Engage Lifestyle Martial Arts";
var FOLDER = "Brain Dojo Family Data";
var FROM_EMAIL = "info@engagelma.com"; // must be a "Send mail as" address in the deploying account's Gmail
var MAX_PLAYERS = 10, MAX_BYTES = 1500000, MAX_DEVICES = 20;
var CODE_MINUTES = 10, CODES_PER_HOUR = 5, TRIES = 5;

function doPost(e) {
  var req = {};
  try { req = JSON.parse((e && e.postData && e.postData.contents) || "{}"); } catch (err) { return reply({ ok: false, error: "bad_request" }); }
  try {
    switch (String(req.action)) {
      case "request": return reply(requestCode(req));
      case "verify": return reply(verifyCode(req));
      case "pull": return reply(withFamily(req, function (fam) { return { ok: true, players: fam.players.filter(validPlayer), removed: fam.removed }; }));
      case "push": return reply(push(req));
      case "signout": return reply(signOut(req, false));
      case "signoutAll": return reply(signOut(req, true));
      case "delete": return reply(deleteFamily(req));
      case "board": return reply(board(req));
      case "boardPost": return reply(boardPost(req));
      case "cheer": return reply(cheer(req));
      case "chList": return reply(chList(req));
      case "chSend": return reply(chSend(req));
      case "chRespond": return reply(chRespond(req));
      case "chScore": return reply(chScore(req));
      case "digest": return reply(digest(req));
      default: return reply({ ok: false, error: "bad_request" });
    }
  } catch (err) {
    return reply({ ok: false, error: "server" });
  }
}
function doGet() { return reply({ ok: true, service: "Brain Dojo family sync" }); }
function reply(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- helpers ---------- */
function hex(bytes) { return bytes.map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join(""); }
function sha(s) { return hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8)); }
function cleanEmail(x) {
  var s = String(x || "").trim().toLowerCase();
  return /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9.-]{1,190}\.[a-z]{2,24}$/.test(s) ? s : null;
}
/* A secret made once for this script, so family numbers can't be matched to emails. */
function pepper() {
  var props = PropertiesService.getScriptProperties(), p = props.getProperty("PEPPER");
  if (!p) { p = Utilities.getUuid() + Utilities.getUuid(); props.setProperty("PEPPER", p); }
  return p;
}
function familyId(email) { return sha("bd-family:" + pepper() + ":" + email).slice(0, 32); }
function newSalt() { return sha(Utilities.getUuid() + Utilities.getUuid()).slice(0, 32); }
function folder() {
  var it = DriveApp.getFoldersByName(FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
}
function fileFor(fid, create) {
  var f = folder(), it = f.getFilesByName("family-" + fid + ".json");
  if (it.hasNext()) return it.next();
  return create ? f.createFile("family-" + fid + ".json", "{}", "application/json") : null;
}
function load(file) {
  var d = {}; try { d = JSON.parse(file.getBlob().getDataAsString()) || {}; } catch (e) { d = {}; }
  d.players = Array.isArray(d.players) ? d.players : [];
  d.removed = Array.isArray(d.removed) ? d.removed : [];
  d.devices = Array.isArray(d.devices) ? d.devices : [];
  return d;
}
function save(file, d) { file.setContent(JSON.stringify(d)); }
function locked(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ---------- sign in with an emailed code ---------- */
function requestCode(req) {
  var email = cleanEmail(req.email);
  if (!email) return { ok: false, error: "email" };
  var cache = CacheService.getScriptCache(), fid = familyId(email);
  var sent = Number(cache.get("sent:" + fid) || 0);
  if (sent >= CODES_PER_HOUR) return { ok: false, error: "too_many" };
  cache.put("sent:" + fid, String(sent + 1), 3600);
  var code = String(Math.floor(100000 + Math.random() * 900000));
  cache.put("code:" + fid, JSON.stringify({ h: sha(fid + ":" + code), tries: 0 }), CODE_MINUTES * 60);
  GmailApp.sendEmail(email, "Your Brain Dojo sign-in code: " + code,
    "Your Brain Dojo sign-in code is " + code + "\n\nType it on the device you want to link. It works for " + CODE_MINUTES + " minutes.\n\n" +
      "Didn't ask for this? You can ignore this email; nothing changes without the code.\n\n— Brain Dojo by " + STUDIO,
    { name: "Brain Dojo by " + STUDIO, from: FROM_EMAIL, replyTo: FROM_EMAIL });
  return { ok: true };
}
function verifyCode(req) {
  var email = cleanEmail(req.email), code = String(req.code || "").replace(/\D/g, "");
  if (!email || code.length !== 6) return { ok: false, error: "code" };
  var cache = CacheService.getScriptCache(), fid = familyId(email);
  var raw = cache.get("code:" + fid);
  if (!raw) return { ok: false, error: "expired" };
  var c = JSON.parse(raw);
  if (c.tries >= TRIES) { cache.remove("code:" + fid); return { ok: false, error: "expired" }; }
  if (c.h !== sha(fid + ":" + code)) {
    c.tries++; cache.put("code:" + fid, JSON.stringify(c), CODE_MINUTES * 60);
    return { ok: false, error: "code", left: TRIES - c.tries };
  }
  cache.remove("code:" + fid);
  var secret = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  return locked(function () {
    var file = fileFor(fid, true), d = load(file);
    delete d.email; // never kept
    if (!/^[a-f0-9]{32}$/.test(d.salt || "")) d.salt = newSalt(); // random per family, used for the device-side encryption key
    d.devices.push({ h: sha(secret), label: String(req.device || "Device").replace(/[^\w .,'()-]/g, "").slice(0, 40), at: new Date().toISOString() });
    d.devices = d.devices.slice(-MAX_DEVICES);
    save(file, d);
    return { ok: true, token: fid + "." + secret, salt: d.salt, players: d.players.filter(validPlayer), removed: d.removed };
  });
}

/* ---------- linked devices ---------- */
function auth(req) {
  var t = String(req.token || ""), m = t.match(/^([a-f0-9]{32})\.([a-f0-9]{64})$/);
  if (!m) return null;
  var file = fileFor(m[1], false); if (!file) return null;
  var d = load(file), h = sha(m[2]);
  for (var i = 0; i < d.devices.length; i++) if (d.devices[i].h === h) return { file: file, d: d, h: h };
  return null;
}
function withFamily(req, fn) {
  var a = auth(req);
  return a ? fn(a.d, a) : { ok: false, error: "signed_out" };
}
/* Only encrypted students are kept: { id, updatedAt, enc }. Anything readable is refused. */
function validPlayer(p) {
  return p && typeof p === "object" && typeof p.id === "string" && /^[a-z0-9]{4,40}$/i.test(p.id) &&
    typeof p.enc === "string" && /^[A-Za-z0-9+/=]{24,1400000}$/.test(p.enc) && Object.keys(p).every(function (k) { return k === "id" || k === "updatedAt" || k === "enc"; });
}
function slim(p) { return { id: p.id, updatedAt: Math.max(0, Number(p.updatedAt) || 0), enc: p.enc }; }
/* Newest copy of each student wins; removals are remembered so they don't come back. */
function push(req) {
  return locked(function () {
    var a = auth(req); if (!a) return { ok: false, error: "signed_out" };
    var d = a.d, byId = {};
    d.players.forEach(function (p) { byId[p.id] = p; });
    (Array.isArray(req.removed) ? req.removed : []).forEach(function (r) {
      var id = String(r && r.id || ""), at = Number(r && r.at) || Date.now();
      if (!/^[a-z0-9]{4,40}$/i.test(id)) return;
      if (byId[id] && (byId[id].updatedAt || 0) > at) return;
      delete byId[id];
      d.removed = d.removed.filter(function (x) { return x.id !== id; }).concat({ id: id, at: at }).slice(-50);
    });
    (Array.isArray(req.players) ? req.players : []).forEach(function (p) {
      if (!validPlayer(p)) return;
      var gone = d.removed.filter(function (x) { return x.id === p.id; })[0];
      if (gone && (p.updatedAt || 0) <= gone.at) return;
      if (!byId[p.id] || (p.updatedAt || 0) > (byId[p.id].updatedAt || 0)) byId[p.id] = slim(p);
      if (gone) d.removed = d.removed.filter(function (x) { return x.id !== p.id; });
    });
    var list = Object.keys(byId).map(function (k) { return byId[k]; }).filter(validPlayer).slice(0, MAX_PLAYERS);
    var next = { salt: d.salt, players: list, removed: d.removed, devices: d.devices };
    if (JSON.stringify(next).length > MAX_BYTES) return { ok: false, error: "too_big" };
    save(a.file, next);
    return { ok: true, players: list, removed: d.removed };
  });
}
function signOut(req, all) {
  return locked(function () {
    var a = auth(req); if (!a) return { ok: true };
    a.d.devices = all ? [] : a.d.devices.filter(function (x) { return x.h !== a.h; });
    save(a.file, a.d);
    return { ok: true };
  });
}
/* ---------- Dojo leaderboard (no names: nicknames from word lists, or an initial) ---------- */
var ADJ = ["Swift","Brave","Mighty","Clever","Lucky","Golden","Silent","Rapid","Fierce","Happy","Cosmic","Thunder","Shadow","Turbo","Super","Steady","Bright","Wild","Calm","Jolly","Iron","Blazing","Frosty","Sunny"];
var ANIMAL = ["Panda","Tiger","Dragon","Falcon","Fox","Owl","Bear","Wolf","Shark","Eagle","Lion","Turtle","Cobra","Crane","Raccoon","Otter","Hawk","Rhino","Koala","Phoenix","Ninja","Comet","Rocket","Storm"];
var BELTS = ["White","Yellow","Orange","Blue","Green","Purple","Brown","Red","Black"];
function nickOk(s) { var m = /^([A-Za-z]+) ([A-Za-z]+) ([1-9][0-9]?)$/.exec(String(s || "")); return !!(m && ADJ.indexOf(m[1]) !== -1 && ANIMAL.indexOf(m[2]) !== -1); }
function initialOk(s) { return /^[A-Z]\.$/.test(String(s || "")); }
function weekKey() { var d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); }
function boardFile() { var f = folder(), it = f.getFilesByName("leaderboard.json"); return it.hasNext() ? it.next() : f.createFile("leaderboard.json", "{}", "application/json"); }
/* Rows carry over from week to week (for the all-time and streak boards); a new
   week starts this week's XP at zero. Rows not updated for 60 days are dropped. */
function boardData(file) {
  var d = {}; try { d = JSON.parse(file.getBlob().getDataAsString()) || {}; } catch (e) { d = {}; }
  d.rows = d.rows && typeof d.rows === "object" ? d.rows : {};
  if (d.week !== weekKey()) {
    Object.keys(d.rows).forEach(function (k) { var r = d.rows[k]; if (!r || Date.now() - (Number(r.at) || 0) > 60 * 864e5) delete d.rows[k]; else { r.xp = 0; r.reps = 0; } });
    d.week = weekKey();
  }
  return d;
}
function board(req) {
  var d = boardData(boardFile()), mine = null, t = String(req.token || "").match(/^([a-f0-9]{32})\./);
  if (t) mine = t[1];
  var cd = cheerData(cheerFile());
  var rows = Object.keys(d.rows).map(function (k) {
    var r = d.rows[k], me = !!(mine && k.indexOf(mine + ":") === 0), c = cd.r[k];
    var o = { name: r.name, belt: r.belt, xp: r.xp, reps: r.reps, life: r.life || 0, st: r.st || 0, cw: c ? sum(c.t) : 0, me: me, h: handle(k) };
    if (me) { o.sid = k.slice(33); o.ch = c ? { t: c.t, d: c.d, by: c.by } : null; o.gave = cd.g[k] || null; }
    return o;
  });
  rows.sort(function (a, b) { return (b.xp - a.xp) || (b.reps - a.reps); });
  return { ok: true, week: d.week, rows: rows.slice(0, 300), total: rows.reduce(function (a, r) { return a + (r.reps || 0); }, 0), count: rows.length, challenges: true, cheers: true, v: 2 };
}
function boardPost(req) {
  return locked(function () {
    var a = auth(req); if (!a) return { ok: false, error: "signed_out" };
    var fid = String(req.token).slice(0, 32), file = boardFile(), d = boardData(file);
    Object.keys(d.rows).forEach(function (k) { if (k.indexOf(fid + ":") === 0) delete d.rows[k]; });
    (Array.isArray(req.players) ? req.players : []).slice(0, 6).forEach(function (p) {
      var sid = String(p && p.sid || ""), name = String(p && p.name || "");
      if (!/^[a-f0-9]{16}$/.test(sid) || !(nickOk(name) || initialOk(name)) || BELTS.indexOf(p.belt) === -1) return;
      d.rows[fid + ":" + sid] = { name: name, belt: p.belt, xp: Math.max(0, Math.min(10000, Math.round(Number(p.xp) * 2 || 0) / 2)), reps: Math.max(0, Math.min(1500, Math.round(Number(p.reps) || 0))),
        life: Math.max(0, Math.min(1000000, Math.round(Number(p.life) * 2 || 0) / 2)), st: Math.max(0, Math.min(3650, Math.round(Number(p.st) || 0))), at: Date.now() };
    });
    file.setContent(JSON.stringify(d));
    return { ok: true };
  });
}

/* ---------- Cheers: fist bumps, high-fives, applause, thumbs up ----------
   A student on the leaderboard cheers another. Only counts are kept (per kind,
   per day, this week) and the senders' nicknames; everything resets each week. */
var CHEER_KINDS = ["f", "h", "c", "u"], CHEERS_PER_DAY = 500;
function sum(t) { var n = 0; Object.keys(t || {}).forEach(function (k) { n += Number(t[k]) || 0; }); return n; }
function cheerFile() { var f = folder(), it = f.getFilesByName("cheers.json"); return it.hasNext() ? it.next() : f.createFile("cheers.json", "{}", "application/json"); }
function cheerData(file) {
  var d = {}; try { d = JSON.parse(file.getBlob().getDataAsString()) || {}; } catch (e) { d = {}; }
  if (d.wk !== weekKey()) d = { wk: weekKey(), r: {}, g: {} };
  d.r = d.r || {}; d.g = d.g || {};
  return d;
}
function cheer(req) {
  return locked(function () {
    var a = auth(req); if (!a) return { ok: false, error: "signed_out" };
    var sid = String(req.sid || ""), to = String(req.to || ""), kind = String(req.kind || ""), day = String(req.day || "");
    if (!/^[a-f0-9]{16}$/.test(sid) || !/^[a-f0-9]{16}$/.test(to) || CHEER_KINDS.indexOf(kind) === -1) return { ok: false, error: "bad_request" };
    if (!/^\d{4}-\d\d-\d\d$/.test(day) || Math.abs(dayNum(day) - todayNum()) > 1) day = new Date().toISOString().slice(0, 10);
    var me = String(req.token).slice(0, 32) + ":" + sid, bd = boardData(boardFile()), from = bd.rows[me];
    if (!from) return { ok: false, error: "not_on_board" };
    var target = null; Object.keys(bd.rows).some(function (k) { if (handle(k) === to) { target = k; return true; } return false; });
    if (!target || target === me) return { ok: false, error: "not_found" };
    var file = cheerFile(), d = cheerData(file), g = d.g[me] = d.g[me] && d.g[me].day === day ? d.g[me] : { day: day, n: 0 };
    if (g.n >= CHEERS_PER_DAY) return { ok: false, error: "limit" };
    g.n++;
    var r = d.r[target] = d.r[target] || { t: {}, d: {}, by: {} };
    r.t[kind] = (r.t[kind] || 0) + 1;
    r.d[day] = r.d[day] || {}; r.d[day][kind] = (r.d[day][kind] || 0) + 1;
    if (r.by[from.name] || Object.keys(r.by).length < 30) r.by[from.name] = (r.by[from.name] || 0) + 1;
    file.setContent(JSON.stringify(d));
    return { ok: true, gave: g.n };
  });
}

/* ---------- Weekend friend challenges (from the leaderboard; nicknames only) ----------
   A student on the leaderboard challenges another to a kata, sparring or weapons
   match for a weekend (wk = that Saturday's date). Each plays their own run on
   their own device, at their own grade; the higher score wins. Played Saturday
   and Sunday only, then cleared. One challenge per pair per weekend; at most 3
   scored challenges per student per weekend; no names or emails are kept. */
var CH_TYPES = ["kata", "sparring", "weapons"], CH_SCORED = 3, CH_SENT = 5, CH_INBOX = 10;
function handle(rowKey) { return sha("bd-ch:" + pepper() + ":" + rowKey).slice(0, 16); }
function dayNum(s) { return Math.floor(Date.parse(s + "T00:00:00Z") / 864e5); }
function todayNum() { return Math.floor(Date.now() / 864e5); }
function wkOk(wk) { return /^\d{4}-\d\d-\d\d$/.test(String(wk)) && new Date(wk + "T00:00:00Z").getUTCDay() === 6 && dayNum(wk) - todayNum() <= 7 && todayNum() - dayNum(wk) <= 2; }
function chFile() { var f = folder(), it = f.getFilesByName("challenges.json"); return it.hasNext() ? it.next() : f.createFile("challenges.json", "{}", "application/json"); }
function chData(file) {
  var d = {}; try { d = JSON.parse(file.getBlob().getDataAsString()) || {}; } catch (e) { d = {}; }
  d.list = (Array.isArray(d.list) ? d.list : []).filter(function (c) { return c && todayNum() - dayNum(c.wk) <= 3; }); // gone after the weekend
  return d;
}
function chMe(req) {
  var a = auth(req); if (!a) return null;
  var sid = String(req.sid || ""); if (!/^[a-f0-9]{16}$/.test(sid)) return null;
  return { fid: String(req.token).slice(0, 32), key: String(req.token).slice(0, 32) + ":" + sid };
}
function chView(c, fid) {
  var a = c.a.indexOf(fid + ":") === 0, mine = a ? c.sa : c.sb, theirs = a ? c.sb : c.sa;
  return { id: c.id, wk: c.wk, type: c.type, st: c.st, from: a, sid: (a ? c.a : c.b).slice(33), other: a ? c.bn : c.an, otherBelt: a ? c.bb : c.ab,
    my: mine, their: mine === null ? null : theirs, theyPlayed: theirs !== null };
}
function chList(req) {
  var a = auth(req); if (!a) return { ok: false, error: "signed_out" };
  var fid = String(req.token).slice(0, 32), d = chData(chFile());
  return { ok: true, list: d.list.filter(function (c) { return c.a.indexOf(fid + ":") === 0 || c.b.indexOf(fid + ":") === 0; }).map(function (c) { return chView(c, fid); }) };
}
function chSend(req) {
  return locked(function () {
    var me = chMe(req); if (!me) return { ok: false, error: "signed_out" };
    if (CH_TYPES.indexOf(req.type) === -1 || !wkOk(req.wk)) return { ok: false, error: "bad_request" };
    var bd = boardData(boardFile()), mine = bd.rows[me.key]; if (!mine) return { ok: false, error: "not_on_board" };
    var to = null; Object.keys(bd.rows).forEach(function (k) { if (handle(k) === String(req.to)) to = k; });
    if (!to || to.indexOf(me.fid + ":") === 0) return { ok: false, error: "bad_request" };
    var file = chFile(), d = chData(file), wk = String(req.wk), same = function (c) { return c.wk === wk; };
    if (d.list.some(function (c) { return same(c) && ((c.a === me.key && c.b === to) || (c.a === to && c.b === me.key)); })) return { ok: false, error: "already" };
    if (d.list.filter(function (c) { return same(c) && c.a === me.key; }).length >= CH_SENT) return { ok: false, error: "limit" };
    if (d.list.filter(function (c) { return same(c) && c.b === to && c.st === "pending"; }).length >= CH_INBOX) return { ok: false, error: "busy" };
    var c = { id: sha(Utilities.getUuid()).slice(0, 12), wk: wk, type: req.type, a: me.key, b: to, an: mine.name, ab: mine.belt, bn: bd.rows[to].name, bb: bd.rows[to].belt, st: "pending", sa: null, sb: null, at: Date.now() };
    d.list.push(c); file.setContent(JSON.stringify(d));
    return { ok: true, challenge: chView(c, me.fid) };
  });
}
function chRespond(req) {
  return locked(function () {
    var me = chMe(req); if (!me) return { ok: false, error: "signed_out" };
    var file = chFile(), d = chData(file), c = d.list.filter(function (x) { return x.id === String(req.id); })[0];
    if (!c || c.b !== me.key || c.st !== "pending") return { ok: false, error: "bad_request" };
    c.st = req.accept === true ? "accepted" : "declined";
    file.setContent(JSON.stringify(d));
    return { ok: true, challenge: chView(c, me.fid) };
  });
}
function chScore(req) {
  return locked(function () {
    var me = chMe(req); if (!me) return { ok: false, error: "signed_out" };
    var file = chFile(), d = chData(file), c = d.list.filter(function (x) { return x.id === String(req.id); })[0];
    if (!c || c.st !== "accepted" || (c.a !== me.key && c.b !== me.key)) return { ok: false, error: "bad_request" };
    var n = todayNum() - dayNum(c.wk); if (n < -1 || n > 2) return { ok: false, error: "closed" }; // Saturday and Sunday (with time-zone slack)
    var side = c.a === me.key ? "sa" : "sb"; if (c[side] !== null) return { ok: false, error: "already" };
    var scored = d.list.filter(function (x) { return x.wk === c.wk && ((x.a === me.key && x.sa !== null) || (x.b === me.key && x.sb !== null)); }).length;
    if (scored >= CH_SCORED) return { ok: false, error: "limit" };
    c[side] = Math.max(0, Math.min(40, Math.round(Number(req.score) || 0)));
    file.setContent(JSON.stringify(d));
    return { ok: true, challenge: chView(c, me.fid) };
  });
}

/* ---------- Weekly parent email (opt-in, set up in the app's Parents area) ----------
   The parent's device sends its own email with a short summary of last week;
   the email is checked against this family (only the family's own sign-in
   email can get it), the note is built here from plain fields (everything
   escaped, capped), sent, and the email is forgotten. digests.json keeps only
   the family number and the week of the last weekly email. Kids' first names
   appear in the email (it goes to their own parent) and are never stored.
   kind "weekly": one per family per week. "sample": up to 3 a day. "check": no email,
   just whether this email is the family's. */
var DIGEST_SAMPLES_PER_DAY = 3, DIGEST_CHECKS_PER_HOUR = 10, DIGEST_KIDS = 6;
var DIGEST_GAMES = { math: "Math Dojo", sentence: "Fix-It Sentences", reading: "Story Scrolls", spelling: "Spelling Bee", spanish: "Spanish Dojo", boss: "Boss battles",
  duel: "Duels", tournament: "Tournaments", team: "Engage Teams lesson", quick: "Quick rounds", mini: "Mini games", phonics: "Phonics", readalong: "Read-along", flash: "Flash facts", school: "School words" };
var BELT_COLORS = { White: "#FFFFFF", Yellow: "#F5C518", Orange: "#F08A24", Blue: "#2D6CDF", Green: "#2FA866", Purple: "#7B4BC4", Brown: "#8A5A3B", Red: "#D63A2F", Black: "#17171C" };
function digestFile() { var f = folder(), it = f.getFilesByName("digests.json"); return it.hasNext() ? it.next() : f.createFile("digests.json", "{}", "application/json"); }
function digestData(file) {
  var d = {}; try { d = JSON.parse(file.getBlob().getDataAsString()) || {}; } catch (e) { d = {}; }
  var w = d.w && typeof d.w === "object" ? d.w : {}, out = {};
  Object.keys(w).forEach(function (k) { if (/^[a-f0-9]{32}$/.test(k) && /^\d{4}-\d\d-\d\d$/.test(w[k]) && todayNum() - dayNum(w[k]) <= 60) out[k] = w[k]; });
  return { w: out };
}
/* Plain text only: no control characters, no markup, no links; then capped. */
function dText(x, max) {
  return String(x === undefined || x === null ? "" : x).replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029<>]/g, " ").replace(/(https?:\/\/|www\.)/gi, "").replace(/\s+/g, " ").trim().slice(0, max);
}
function dNum(x, max) { return Math.max(0, Math.min(max, Math.round(Number(x) || 0))); }
function dList(x, n) { return Array.isArray(x) ? x.slice(0, n) : []; }
function escH(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function cleanKid(k) {
  if (!k || typeof k !== "object") return null;
  var name = dText(k.name, 20); if (!name) return null;
  var games = [];
  dList(k.games, 12).forEach(function (g) { var id = String(g && g.id || ""); if (DIGEST_GAMES.hasOwnProperty(id) && games.length < 8) games.push({ name: DIGEST_GAMES[id], n: dNum(g.n, 500) }); });
  return {
    name: name, belt: BELTS.indexOf(k.belt) !== -1 ? k.belt : "", grade: dText(k.grade, 24),
    days: dNum(k.days, 7), rounds: dNum(k.rounds, 500), answers: dNum(k.answers, 20000), pct: dNum(k.pct, 100), streak: dNum(k.streak, 3650),
    games: games,
    wins: dList(k.wins, 10).map(function (x) { return dText(x, 80); }).filter(Boolean),
    weak: dList(k.weak, 4).map(function (x) { return dText(x, 160); }).filter(Boolean),
    teams: dList(k.teams, 3).map(function (t) {
      if (!t || typeof t !== "object") return null;
      return { team: dText(t.team, 30), done: t.done === true, title: dText(t.title, 60), value: dText(t.value, 60), moment: dText(t.moment, 240), say: dText(t.say, 140), mission: dText(t.mission, 200),
        picks: dList(t.picks, 3).map(function (q) { return q && typeof q === "object" ? { q: dText(q.q, 40), chose: dText(q.chose, 160), best: q.best === true, found: dText(q.found, 160) } : null; }).filter(function (q) { return q && q.chose; }) };
    }).filter(function (t) { return t && t.team; })
  };
}
function dDate(n) { var d = new Date(n * 864e5); return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()] + " " + d.getUTCDate(); }
function digestMail(kids, tip, range, sample) {
  var names = kids.map(function (k) { return k.name; });
  var who = names.length <= 1 ? names.join("") : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  var subject = (sample ? "Sample: " : "") + "Brain Dojo weekly: " + who + "'s week (" + range + ")";
  var H = [], T = [];
  var p = function (html, text) { H.push(html); if (text !== undefined) T.push(text); };
  p('<div style="margin:0;padding:0;background:#0B1528"><div style="max-width:600px;margin:0 auto;padding:20px 16px;font-family:Arial,Helvetica,sans-serif;color:#1B2433">');
  p('<div style="background:#12223F;color:#F4F4F4;border-radius:14px 14px 0 0;padding:18px 20px"><div style="font-size:22px;font-weight:900;letter-spacing:.5px">BRAIN DOJO</div>' +
    '<div style="color:#E0BA77;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px">' + (sample ? "Sample · " : "") + "Weekly progress · " + escH(range) + '</div></div>',
    (sample ? "SAMPLE · " : "") + "BRAIN DOJO WEEKLY PROGRESS · " + range + "\n");
  p('<div style="background:#FFFFFF;border-radius:0 0 14px 14px;padding:6px 20px 18px">');
  kids.forEach(function (k) {
    var bc = BELT_COLORS[k.belt] || "#CCCCCC";
    p('<h2 style="margin:18px 0 4px;font-size:20px;color:#12223F">' + escH(k.name) + '</h2>' +
      '<div style="font-size:13px;color:#5A6578;margin-bottom:8px">' + (k.belt ? '<span style="display:inline-block;width:22px;height:9px;border-radius:3px;background:' + bc + ';border:1px solid #888;vertical-align:middle"></span> ' + escH(k.belt) + ' Belt' : '') + (k.grade ? (k.belt ? " · " : "") + escH(k.grade) : '') + '</div>',
      "\n" + k.name.toUpperCase() + (k.belt ? " · " + k.belt + " Belt" : "") + (k.grade ? " · " + k.grade : ""));
    var line = k.rounds ? k.days + (k.days === 1 ? " day" : " days") + ", " + k.rounds + (k.rounds === 1 ? " round" : " rounds") + (k.answers ? ", " + k.answers + " questions (" + k.pct + "% right)" : "") : "No practice " + (sample ? "yet this week" : "last week") + ". A short round today gets things rolling again.";
    var games = k.games.map(function (g) { return g.name + (g.n > 1 ? " ×" + g.n : ""); }).join(", ");
    p('<p style="margin:6px 0"><strong>Practiced:</strong> ' + escH(line) + (games ? '<br><span style="color:#5A6578">' + escH(games) + '</span>' : '') + '</p>', "Practiced: " + line + (games ? "\n  " + games : ""));
    var wins = k.wins.slice(); if (k.streak) wins.unshift(k.streak + "-day streak");
    if (wins.length) p('<p style="margin:6px 0"><strong>Wins:</strong></p><ul style="margin:4px 0 8px;padding-left:20px">' + wins.map(function (w) { return '<li>' + escH(w) + '</li>'; }).join("") + '</ul>', "Wins:\n" + wins.map(function (w) { return "  - " + w; }).join("\n"));
    if (k.weak.length) p('<p style="margin:6px 0"><strong>Working on:</strong></p><ul style="margin:4px 0 8px;padding-left:20px">' + k.weak.map(function (w) { return '<li>' + escH(w) + '</li>'; }).join("") + '</ul>', "Working on:\n" + k.weak.map(function (w) { return "  - " + w; }).join("\n"));
    k.teams.forEach(function (t) {
      var h = '<div style="border-left:4px solid #8B4BE0;background:#F5F1FC;border-radius:8px;padding:10px 12px;margin:10px 0"><div style="font-weight:700;color:#4A2A86">Engage Teams · ' + escH(t.team) + '</div>', tx = "Engage Teams · " + t.team;
      if (!t.done) { h += '<div style="margin-top:4px">The weekly lesson wasn\'t done' + (sample ? ' yet this week.' : ' last week.') + ' Doing it each week keeps their spot on the team.</div>'; tx += "\n  The weekly lesson wasn't done" + (sample ? " yet this week." : " last week.") + " Doing it each week keeps their spot on the team."; }
      else {
        if (t.title) { h += '<div style="margin-top:4px"><strong>' + escH(t.title) + '</strong>' + (t.value ? ' (' + escH(t.value) + ')' : '') + (t.moment ? ': ' + escH(t.moment) : '') + '</div>'; tx += "\n  " + t.title + (t.value ? " (" + t.value + ")" : "") + (t.moment ? ": " + t.moment : ""); }
        if (t.picks.length) { h += '<ul style="margin:6px 0;padding-left:18px">' + t.picks.map(function (q) { return '<li>' + (q.q ? '<span style="color:#5A6578">' + escH(q.q) + '</span> ' : '') + 'They chose: ' + escH(q.chose) + (q.best ? ' <span style="color:#1E8A4C;font-weight:700">(best answer)</span>' : q.found ? ' <span style="color:#5A6578">(then found: ' + escH(q.found) + ')</span>' : '') + '</li>'; }).join("") + '</ul>';
          t.picks.forEach(function (q) { tx += "\n  - " + (q.q ? q.q + " " : "") + "They chose: " + q.chose + (q.best ? " (best answer)" : q.found ? " (then found: " + q.found + ")" : ""); }); }
        if (t.say) { h += '<div style="font-style:italic">In their own words: "' + escH(t.say) + '"</div>'; tx += '\n  In their own words: "' + t.say + '"'; }
        h += '<div style="color:#5A6578;font-size:13px;margin-top:4px">Talking point: ask when a moment like this came up for them' + (t.mission ? ', and try this together: ' + escH(t.mission) : '.') + '</div>';
        tx += "\n  Talking point: ask when a moment like this came up for them" + (t.mission ? ", and try this together: " + t.mission : ".");
      }
      p(h + '</div>', tx);
    });
  });
  if (tip) p('<div style="background:#FFF7E6;border:1px solid #E0BA77;border-radius:10px;padding:12px 14px;margin:16px 0 4px"><strong>Try this at home:</strong> ' + escH(tip) + '</div>', "\nTry this at home: " + tip);
  p('</div><p style="color:#A3B4CE;font-size:12px;line-height:1.5;margin:14px 4px 0">You get this because you turned on the weekly progress email in Brain Dojo. ' +
    '<strong>Unsubscribe:</strong> turn it off in the app\'s Parents area (Weekly progress email). Your email isn\'t stored on our server; it\'s only used to send this note.<br>Brain Dojo by ' + escH(STUDIO) + '</p></div></div>',
    "\n--\nYou get this because you turned on the weekly progress email in Brain Dojo.\nUnsubscribe: turn it off in the app's Parents area (Weekly progress email). Your email isn't stored on our server; it's only used to send this note.\nBrain Dojo by " + STUDIO);
  return { subject: subject, html: H.join(""), text: T.join("\n") };
}
function digest(req) {
  var a = auth(req); if (!a) return { ok: false, error: "signed_out" };
  var fid = String(req.token).slice(0, 32), email = cleanEmail(req.email), kind = String(req.kind || "weekly");
  if (["weekly", "sample", "check"].indexOf(kind) === -1) return { ok: false, error: "bad_request" };
  var cache = CacheService.getScriptCache();
  if (kind === "check") {
    var c = Number(cache.get("dcheck:" + fid) || 0);
    if (c >= DIGEST_CHECKS_PER_HOUR) return { ok: false, error: "limit" };
    cache.put("dcheck:" + fid, String(c + 1), 3600);
  }
  if (!email || familyId(email) !== fid) return { ok: false, error: "wrong_email" }; // only the family's own sign-in email
  if (kind === "check") return { ok: true };
  var week = String(req.week || "");
  if (!/^\d{4}-\d\d-\d\d$/.test(week) || new Date(week + "T00:00:00Z").getUTCDay() !== 1 || dayNum(week) < todayNum() - 7 || dayNum(week) > todayNum() + 1) return { ok: false, error: "bad_request" };
  var kids = dList(req.kids, DIGEST_KIDS).map(cleanKid).filter(Boolean);
  if (!kids.length) return { ok: false, error: "bad_request" };
  var sample = kind === "sample", wn = dayNum(week);
  var range = sample ? dDate(wn) + " – " + dDate(Math.max(wn, Math.min(wn + 6, todayNum()))) : dDate(wn - 7) + " – " + dDate(wn - 1);
  var mail = digestMail(kids, dText(req.tip, 240), range, sample);
  var send = function () {
    GmailApp.sendEmail(email, mail.subject, mail.text, { htmlBody: mail.html, name: "Brain Dojo by " + STUDIO, from: FROM_EMAIL, replyTo: FROM_EMAIL });
  };
  if (sample) {
    var key = "dsample:" + fid + ":" + todayNum(), n = Number(cache.get(key) || 0);
    if (n >= DIGEST_SAMPLES_PER_DAY) return { ok: false, error: "limit" };
    cache.put(key, String(n + 1), 86400);
    send();
    return { ok: true, left: DIGEST_SAMPLES_PER_DAY - n - 1 };
  }
  return locked(function () {
    var file = digestFile(), d = digestData(file);
    if (d.w[fid] && d.w[fid] >= week) return { ok: false, error: "already", week: d.w[fid] };
    send(); // if Gmail fails, nothing is recorded and the device tries again later
    d.w[fid] = week; // only the family number and the week
    file.setContent(JSON.stringify(d));
    return { ok: true, week: week };
  });
}

function deleteFamily(req) {
  return locked(function () {
    var a = auth(req); if (!a) return { ok: false, error: "signed_out" };
    a.file.setTrashed(true);
    var fid = String(req.token).slice(0, 32), bf = boardFile(), bd = boardData(bf);
    Object.keys(bd.rows).forEach(function (k) { if (k.indexOf(fid + ":") === 0) delete bd.rows[k]; });
    bf.setContent(JSON.stringify(bd));
    var hf = cheerFile(), hd = cheerData(hf);
    Object.keys(hd.r).forEach(function (k) { if (k.indexOf(fid + ":") === 0) delete hd.r[k]; });
    Object.keys(hd.g).forEach(function (k) { if (k.indexOf(fid + ":") === 0) delete hd.g[k]; });
    hf.setContent(JSON.stringify(hd));
    var cf = chFile(), cd = chData(cf);
    cd.list = cd.list.filter(function (c) { return c.a.indexOf(fid + ":") !== 0 && c.b.indexOf(fid + ":") !== 0; });
    cf.setContent(JSON.stringify(cd));
    var df = digestFile(), dd = digestData(df);
    if (dd.w[fid]) { delete dd.w[fid]; df.setContent(JSON.stringify(dd)); }
    return { ok: true };
  });
}
