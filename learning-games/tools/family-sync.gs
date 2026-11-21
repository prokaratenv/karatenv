/**
 * Brain Dojo FAMILY ACCOUNTS — sign in with a parent's email, and each
 * student's progress follows them to every device.
 *
 * How it works: a parent types their email, gets a 6-digit code from your
 * Gmail, and types it in. That device is then linked to the family. Each
 * family's students are kept as one private file in a "Brain Dojo Family
 * Data" folder in your Google Drive. Nothing is shared publicly.
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
      case "pull": return reply(withFamily(req, function (fam) { return { ok: true, players: fam.players, removed: fam.removed }; }));
      case "push": return reply(push(req));
      case "signout": return reply(signOut(req, false));
      case "signoutAll": return reply(signOut(req, true));
      case "delete": return reply(deleteFamily(req));
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
function familyId(email) { return sha("bd-family:" + email).slice(0, 32); }
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
    d.email = email;
    d.devices.push({ h: sha(secret), label: String(req.device || "Device").replace(/[^\w .,'()-]/g, "").slice(0, 40), at: new Date().toISOString() });
    d.devices = d.devices.slice(-MAX_DEVICES);
    save(file, d);
    return { ok: true, token: fid + "." + secret, players: d.players, removed: d.removed };
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
function validPlayer(p) { return p && typeof p === "object" && typeof p.id === "string" && /^[a-z0-9]{4,40}$/i.test(p.id) && typeof p.name === "string"; }
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
      if (!byId[p.id] || (p.updatedAt || 0) > (byId[p.id].updatedAt || 0)) byId[p.id] = p;
      if (gone) d.removed = d.removed.filter(function (x) { return x.id !== p.id; });
    });
    var list = Object.keys(byId).map(function (k) { return byId[k]; }).slice(0, MAX_PLAYERS);
    var next = { email: d.email, players: list, removed: d.removed, devices: d.devices };
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
function deleteFamily(req) {
  return locked(function () {
    var a = auth(req); if (!a) return { ok: false, error: "signed_out" };
    a.file.setTrashed(true);
    return { ok: true };
  });
}
