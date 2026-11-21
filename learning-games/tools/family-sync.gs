/**
 * Brain Dojo FAMILY SYNC — private, code-based sync across a family's devices.
 *
 * This script never sees anyone's personal information. Each family's device
 * makes a random Family Sync Code and locks (encrypts) the students' progress
 * with it before uploading. This script only keeps that locked blob, filed
 * under a fingerprint of the code. There's no email, no names, no device
 * details, and nobody here can read or recover the data.
 *
 * Setup (about 5 minutes, free):
 *  1. Go to script.google.com → New project. Name it "Brain Dojo Family Sync".
 *  2. Delete what's there and paste this whole file. Save.
 *  3. Deploy → New deployment → type "Web app".
 *       Execute as: Me.   Who has access: Anyone.   → Deploy.
 *     Allow the permission it asks for (the Drive files it creates).
 *  4. Copy the Web app URL (ends in /exec) into js/config.js as accountEndpoint.
 *
 * Limits: each family's locked copy can be up to about 1.5 MB.
 */
var FOLDER = "Brain Dojo Sync (encrypted)";
var MAX_BLOB = 1500000;
var WRITES_PER_10MIN = 120, NEW_PER_HOUR = 300;

function doPost(e) {
  var req = {};
  try { req = JSON.parse((e && e.postData && e.postData.contents) || "{}"); } catch (err) { return reply({ ok: false, error: "bad_request" }); }
  try {
    var id = String(req.id || "");
    if (!/^[a-f0-9]{64}$/.test(id)) return reply({ ok: false, error: "bad_request" });
    switch (String(req.action)) {
      case "get": return reply(getDoc(id));
      case "put": return reply(putDoc(id, req));
      case "delete": return reply(deleteDoc(id));
      default: return reply({ ok: false, error: "bad_request" });
    }
  } catch (err) {
    return reply({ ok: false, error: "server" });
  }
}
function doGet() { return reply({ ok: true, service: "Brain Dojo family sync (encrypted)" }); }
function reply(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- helpers ---------- */
function hex(bytes) { return bytes.map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join(""); }
function sha(s) { return hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8)); }
// The file name is a second fingerprint, so even Drive file names can't be matched back to a code.
function fileName(id) { return "s-" + sha("bd-store:" + id).slice(0, 40) + ".json"; }
function folder() {
  var it = DriveApp.getFoldersByName(FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
}
function fileFor(id) { var it = folder().getFilesByName(fileName(id)); return it.hasNext() ? it.next() : null; }
function load(file) {
  try { var d = JSON.parse(file.getBlob().getDataAsString()) || {}; return { rev: Number(d.rev) || 0, blob: typeof d.blob === "string" ? d.blob : null }; }
  catch (e) { return { rev: 0, blob: null }; }
}
function locked(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function allow(key, max, seconds) {
  var cache = CacheService.getScriptCache(), n = Number(cache.get(key) || 0);
  if (n >= max) return false;
  cache.put(key, String(n + 1), seconds);
  return true;
}

/* ---------- actions ---------- */
function getDoc(id) {
  var f = fileFor(id);
  if (!f) return { ok: true, rev: 0, blob: null };
  var d = load(f);
  return { ok: true, rev: d.rev, blob: d.blob };
}
/* Saves only if nobody saved since this device last looked (rev matches). */
function putDoc(id, req) {
  var blob = String(req.blob || "");
  if (!blob || blob.length > MAX_BLOB) return { ok: false, error: blob ? "too_big" : "bad_request" };
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(blob)) return { ok: false, error: "bad_request" };
  if (!allow("w:" + sha(id).slice(0, 16), WRITES_PER_10MIN, 600)) return { ok: false, error: "too_many" };
  return locked(function () {
    var f = fileFor(id), cur = f ? load(f) : { rev: 0, blob: null };
    if ((Number(req.rev) || 0) !== cur.rev) return { ok: false, error: "conflict", rev: cur.rev, blob: cur.blob };
    if (!f && !allow("new", NEW_PER_HOUR, 3600)) return { ok: false, error: "too_many" };
    var next = JSON.stringify({ rev: cur.rev + 1, blob: blob });
    if (f) f.setContent(next); else folder().createFile(fileName(id), next, "application/json");
    return { ok: true, rev: cur.rev + 1 };
  });
}
function deleteDoc(id) {
  return locked(function () {
    var f = fileFor(id);
    if (f) f.setTrashed(true);
    return { ok: true };
  });
}
