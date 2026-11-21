/* FAMILY SYNC — private, code-based sync so each student's progress follows
   them to every device (phone, iPad, laptop) WITHOUT the studio keeping any
   personal information.

   How it works
   - The first device makes a random Family Sync Code (128 bits). It never
     leaves the family's devices except by the parent sharing it themselves
     (typing it, scanning the QR, or opening the link).
   - Before anything is uploaded, students' names and progress are locked on
     the device with AES-GCM, using a key derived from the code (HKDF).
   - The server (tools/family-sync.gs, BD.CONFIG.accountEndpoint) only stores
     that locked blob, filed under a separate fingerprint of the code. No email,
     no names, no device details. The studio can't read it or recover it.
   - Lose the code AND every linked device, and the synced copy can't be
     recovered by anyone. The parent is warned before turning sync on. */
window.BD = window.BD || {};

BD.Family = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const KEY = "brainDojo.familySync", OLD_KEY = "brainDojo.family";
  const ALPHA = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32: no I, L, O, U
  const read = function () { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
  const write = function (v) { try { if (v) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); } catch (e) { /* blocked */ } };
  const endpoint = function () { const u = (BD.CONFIG || {}).accountEndpoint; return typeof u === "string" && /^(https:\/\/|http:\/\/localhost[:/])[^\s"<>]+$/i.test(u) ? u : ""; };
  const cryptoOk = function () { return !!(window.crypto && crypto.subtle && crypto.getRandomValues && window.TextEncoder); };

  // The old email sign-in is retired: forget its token. Students stay on this device.
  try { localStorage.removeItem(OLD_KEY); } catch (e) { /* blocked */ }

  let saved = read();                       // { code, rev }
  if (saved && !parseCode(saved.code)) { saved = null; write(null); }
  let keys = null;                          // { id, aes } derived from the code
  let remote = { players: [], removed: [] }; // last copy we unlocked from the server
  let status = "off", timer = null, flushing = false, pollTimer = null, listening = false;
  const pending = new Map();                // player id -> player
  let removed = [];                         // [{ id, at }]

  function enabled() { return !!endpoint() && cryptoOk(); }
  function linked() { return !!(saved && saved.code && enabled()); }

  /* ---------- the code ---------- */
  function encode(bytes) {
    let bits = 0, val = 0, out = "";
    for (let i = 0; i < bytes.length; i++) {
      val = (val << 8) | bytes[i]; bits += 8;
      while (bits >= 5) { out += ALPHA[(val >>> (bits - 5)) & 31]; bits -= 5; }
    }
    if (bits > 0) out += ALPHA[(val << (5 - bits)) & 31];
    return out;
  }
  function parseCode(input) {
    const s = String(input || "").toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
    if (s.length !== 26 || /[^0-9A-HJKMNP-TV-Z]/.test(s)) return null;
    const bytes = new Uint8Array(16);
    let bits = 0, val = 0, n = 0;
    for (let i = 0; i < s.length; i++) {
      val = (val << 5) | ALPHA.indexOf(s[i]); bits += 5;
      if (bits >= 8) { if (n < 16) bytes[n++] = (val >>> (bits - 8)) & 255; bits -= 8; }
      val &= 0xff;
    }
    return n === 16 ? bytes : null;
  }
  function pretty(code) { const b = parseCode(code); return b ? encode(b).match(/.{1,4}/g).join("-") : ""; }
  function newCode() { return pretty(encode(crypto.getRandomValues(new Uint8Array(16)))); }
  function linkFor(code) { return location.origin + location.pathname + "#sync=" + pretty(code).replace(/-/g, ""); }

  async function derive(code) {
    const raw = parseCode(code); if (!raw) throw new Error("bad code");
    const enc = new TextEncoder(), salt = enc.encode("brain-dojo-family-sync-v1");
    const base = await crypto.subtle.importKey("raw", raw, "HKDF", false, ["deriveBits", "deriveKey"]);
    const idBits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: salt, info: enc.encode("lookup id") }, base, 256);
    const aes = await crypto.subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt: salt, info: enc.encode("lock key") }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    const id = Array.from(new Uint8Array(idBits)).map(function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    return { id: id, aes: aes };
  }
  const b64 = function (u8) { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = function (s) { const bin = atob(s), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8; };
  async function lock(k, doc) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, k.aes, new TextEncoder().encode(JSON.stringify(doc))));
    const all = new Uint8Array(iv.length + ct.length); all.set(iv); all.set(ct, iv.length);
    return b64(all);
  }
  async function unlock(k, blob) {
    const all = unb64(blob);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: all.subarray(0, 12) }, k.aes, all.subarray(12));
    const doc = JSON.parse(new TextDecoder().decode(pt));
    return { players: Array.isArray(doc.players) ? doc.players : [], removed: Array.isArray(doc.removed) ? doc.removed : [] };
  }

  /* ---------- server ---------- */
  async function call(action, data) {
    const ctl = typeof AbortController === "function" ? new AbortController() : null;
    const t = ctl ? setTimeout(function () { ctl.abort(); }, 25000) : null;
    try {
      // A plain-text body keeps this a "simple" request (no CORS preflight), which Apps Script needs.
      const res = await fetch(endpoint(), { method: "POST", body: JSON.stringify(Object.assign({ action: action }, data || {})), redirect: "follow", credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", signal: ctl ? ctl.signal : undefined });
      const out = await res.json();
      return out && typeof out === "object" ? out : { ok: false, error: "server" };
    } catch (e) { return { ok: false, error: "network" }; }
    finally { if (t) clearTimeout(t); }
  }

  function setStatus(s) {
    status = s;
    const el = $("syncStatus"); if (!el || !linked()) return;
    const LABEL = { syncing: "Syncing your family…", synced: "Family Sync on · every linked device", offline: "Offline: saving on this device, will sync when back online", error: "Family Sync paused. Check your code in the Parent corner." };
    if (LABEL[s]) { el.dataset.state = s === "synced" ? "synced" : s === "offline" || s === "error" ? "offline" : "saving"; el.textContent = LABEL[s]; }
  }

  /* ---------- merging ---------- */
  const valid = function (p) { return p && typeof p === "object" && typeof p.id === "string" && /^[a-z0-9]{4,40}$/i.test(p.id) && typeof p.name === "string"; };
  /* Bring a remote copy onto this device: newer students win, removals stick. */
  function applyRemote(doc) {
    const remoteAt = {};
    doc.removed.forEach(function (r) {
      const p = r && BD.Store.get(r.id);
      if (p && (p.updatedAt || 0) <= (Number(r.at) || 0) && !pending.has(p.id)) BD.Store.applyRemoteRemoval(p.id);
    });
    doc.players.forEach(function (rp) {
      if (!valid(rp)) return;
      remoteAt[rp.id] = rp.updatedAt || 0;
      const local = BD.Store.get(rp.id);
      if (!local || (rp.updatedAt || 0) > (local.updatedAt || 0)) BD.Store.applyRemote(rp);
    });
    BD.Store.players().forEach(function (p) { if (!(p.id in remoteAt) || (p.updatedAt || 0) > remoteAt[p.id]) pending.set(p.id, p); });
  }
  /* Build the next copy to upload: the remote copy plus this device's changes. */
  function merged(base, ups, gone) {
    const byId = {}; let rem = base.removed.slice();
    base.players.forEach(function (p) { if (valid(p)) byId[p.id] = p; });
    gone.forEach(function (r) {
      if (byId[r.id] && (byId[r.id].updatedAt || 0) > r.at) return;
      delete byId[r.id];
      rem = rem.filter(function (x) { return x.id !== r.id; }).concat({ id: r.id, at: r.at });
    });
    ups.forEach(function (p) {
      if (!valid(p)) return;
      const g = rem.filter(function (x) { return x.id === p.id; })[0];
      if (g && (p.updatedAt || 0) <= g.at) return;
      if (!byId[p.id] || (p.updatedAt || 0) >= (byId[p.id].updatedAt || 0)) byId[p.id] = JSON.parse(JSON.stringify(p));
      if (g) rem = rem.filter(function (x) { return x.id !== p.id; });
    });
    return { players: Object.keys(byId).map(function (k) { return byId[k]; }).slice(0, 12), removed: rem.slice(-50) };
  }

  /* ---------- sync ---------- */
  async function ensureKeys() { if (!keys && linked()) keys = await derive(saved.code); return keys; }
  async function take(res) {
    // res: { rev, blob } from the server. Unlock it and bring it onto this device.
    saved.rev = Number(res.rev) || 0; write(saved);
    remote = res.blob ? await unlock(keys, res.blob) : { players: [], removed: [] };
    applyRemote(remote);
  }
  async function pull() {
    if (!linked()) return;
    setStatus("syncing");
    try { await ensureKeys(); } catch (e) { return setStatus("error"); }
    const res = await call("get", { id: keys.id });
    if (!res.ok) return setStatus("offline");
    try { await take(res); } catch (e) { return setStatus("error"); }
    if (pending.size || removed.length) schedule(300); else setStatus("synced");
  }
  function schedule(ms) { clearTimeout(timer); timer = setTimeout(flush, ms === undefined ? 2000 : ms); }
  async function flush() {
    if (!linked() || (!pending.size && !removed.length)) return;
    if (flushing) return schedule();
    flushing = true; setStatus("syncing");
    try {
      await ensureKeys();
      for (let tries = 0; tries < 4; tries++) {
        const ups = Array.from(pending.values()).map(function (p) { return { p: p, at: p.updatedAt || 0 }; });
        const gone = removed.slice();
        const doc = merged(remote, ups.map(function (x) { return x.p; }), gone);
        const blob = await lock(keys, doc);
        const res = await call("put", { id: keys.id, rev: saved.rev || 0, blob: blob });
        if (res.ok) {
          saved.rev = Number(res.rev) || 0; write(saved); remote = doc;
          ups.forEach(function (x) { if (pending.get(x.p.id) === x.p && (x.p.updatedAt || 0) <= x.at) pending.delete(x.p.id); });
          removed = removed.filter(function (r) { return gone.indexOf(r) === -1; });
          break;
        }
        if (res.error === "conflict") { await take(res); continue; }  // another device saved first: merge and retry
        flushing = false; setStatus("offline"); schedule(res.error === "too_big" ? 600000 : 15000); return;
      }
    } catch (e) { flushing = false; setStatus("error"); return; }
    flushing = false;
    setStatus(pending.size || removed.length ? "syncing" : "synced");
    if (pending.size || removed.length) schedule();
  }

  /* ---------- turning it on ---------- */
  const WARNING = '<div class="sync-warn" role="note"><strong>⚠️ Keep this code safe. It\'s the only key.</strong>' +
    '<p>Your family\'s progress is locked with this code before it leaves this device. Engage <strong>can\'t see it, reset it or recover it</strong>. ' +
    'If you lose this code <em>and</em> every device that\'s linked, your synced progress is gone for good.</p>' +
    '<p class="muted small">Save it in your password manager, take a screenshot, or print this page. You can also keep a file copy any time with <strong>Back up progress</strong> in the Parent corner.</p></div>';
  function qrSVG(text) {
    if (typeof window.qrcode !== "function") return "";
    try { const q = window.qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 5, margin: 2, scalable: true, alt: "QR code to link a device" }); } catch (e) { return ""; }
  }
  function codeCard(code) {
    return '<div class="sync-code-card"><div class="sync-qr" aria-hidden="true">' + qrSVG(linkFor(code)) + '</div>' +
      '<div><p class="label">Your Family Sync Code</p><p class="sync-code" id="fsCodeText">' + esc(pretty(code)) + '</p>' +
      '<div class="res-actions" style="justify-content:flex-start"><button type="button" class="btn btn-small" id="fsCopy">Copy code</button><button type="button" class="btn btn-small btn-quiet" id="fsCopyLink">Copy link</button><button type="button" class="btn btn-small btn-quiet" id="fsPrint">Print</button></div>' +
      '<p class="muted small">On another device, scan the QR with its camera, open the link, or tap <strong>Link with a code</strong> and type it.</p></div></div>';
  }
  function bindCodeCard(code) {
    const copy = function (t, btn) { const done = function () { btn.textContent = "Copied ✓"; setTimeout(function () { btn.textContent = btn.dataset.l; }, 1600); }; btn.dataset.l = btn.dataset.l || btn.textContent; if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {}); };
    if ($("fsCopy")) $("fsCopy").onclick = function () { copy(pretty(code), $("fsCopy")); };
    if ($("fsCopyLink")) $("fsCopyLink").onclick = function () { copy(linkFor(code), $("fsCopyLink")); };
    if ($("fsPrint")) $("fsPrint").onclick = function () { window.print(); };
  }
  function msgFn() { return function (t, good) { if ($("fsMsg")) { $("fsMsg").textContent = t; $("fsMsg").className = "lf-msg" + (good ? " good" : ""); } }; }

  function openStart(done) {
    BD.UI.sheet("Use Brain Dojo on every device",
      '<div class="lead-form"><p>Turn on <strong>Family Sync</strong> so each student\'s belts, stripes and points show up on <strong>every phone, iPad or computer</strong> your family uses.</p>' +
      '<p class="muted small">No email or sign-up. Your device makes a private code, and progress is locked with it before it\'s synced. Engage never sees your children\'s names or progress.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="fsNew">Create a Family Sync Code</button></div>' +
      '<div class="res-actions"><button type="button" class="btn btn-quiet" id="fsHave">I already have a code</button></div></div>');
    $("fsNew").onclick = function () { openCreate(done); };
    $("fsHave").onclick = function () { openJoin(done); };
  }
  function openCreate(done) {
    const code = newCode();
    BD.UI.sheet("Your Family Sync Code",
      '<div class="lead-form">' + codeCard(code) + WARNING +
      '<label class="lf-check lf-adult"><input type="checkbox" id="fsAgree"> <span>I\'m the parent or guardian. I saved this code, and I understand Engage can\'t recover it or my family\'s synced progress if it\'s lost.</span></label>' +
      '<p class="lf-msg" id="fsMsg" aria-live="polite"></p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="fsOn">Turn on Family Sync</button></div></div>');
    bindCodeCard(code);
    const msg = msgFn();
    $("fsOn").onclick = async function () {
      if (!$("fsAgree").checked) return msg("Please save the code and check the box first.");
      $("fsOn").disabled = true; msg("Turning on Family Sync…", true);
      const ok = await start(code, true);
      $("fsOn").disabled = false;
      if (!ok.ok) return msg(ok.msg);
      linkedSheet(done, ok.added);
    };
  }
  function openJoin(done, prefill) {
    BD.UI.sheet("Link with your Family Sync Code",
      '<div class="lead-form"><p>Type the Family Sync Code from a device that\'s already linked (Parent corner → <strong>Show code</strong>), or scan its QR code with this device\'s camera.</p>' +
      '<label class="lf"><span>Family Sync Code</span><input id="fsCode" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XX" value="' + esc(prefill ? pretty(prefill) : "") + '"></label>' +
      '<p class="lf-msg" id="fsMsg" aria-live="polite"></p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="fsLink">Link this device</button></div>' +
      '<p class="muted small">Students already on this device are added to your family.</p></div>');
    const msg = msgFn();
    const go = async function () {
      const code = $("fsCode").value;
      if (!parseCode(code)) return msg("That doesn't look like a Family Sync Code. It has 26 letters and numbers.");
      $("fsLink").disabled = true; msg("Linking…", true);
      const ok = await start(pretty(code), false);
      $("fsLink").disabled = false;
      if (!ok.ok) return msg(ok.msg);
      linkedSheet(done, ok.added);
    };
    $("fsLink").onclick = go;
    $("fsCode").onkeydown = function (e) { if (e.key === "Enter") go(); };
    setTimeout(function () { if ($("fsCode") && !prefill) $("fsCode").focus(); }, 80);
  }
  /* Link this device to the code. fresh = a brand-new code from this device. */
  async function start(code, fresh) {
    let k;
    try { k = await derive(code); } catch (e) { return { ok: false, msg: "That code isn't valid." }; }
    const res = await call("get", { id: k.id });
    if (!res.ok) return { ok: false, msg: res.error === "network" ? "Can't reach Family Sync right now. Check the internet and try again." : "Family Sync isn't available right now. Try again later." };
    if (!fresh && !res.blob) return { ok: false, msg: "No family found with that code. Check each letter and try again." };
    let doc = { players: [], removed: [] };
    if (res.blob) { try { doc = await unlock(k, res.blob); } catch (e) { return { ok: false, msg: "That code doesn't match. Check each letter and try again." }; } }
    const before = BD.Store.players().length;
    saved = { code: pretty(code), rev: Number(res.rev) || 0 }; keys = k; remote = doc; write(saved);
    pending.clear(); removed = [];
    applyRemote(doc);
    BD.Store.players().forEach(function (p) { pending.set(p.id, p); });
    await flush();
    listen(); startPolling();
    return { ok: true, added: Math.max(0, BD.Store.players().length - before) };
  }
  function linkedSheet(done, added) {
    const n = BD.Store.players().length;
    BD.Sound.right(); BD.confetti(70);
    BD.UI.sheet("Family Sync is on", '<div class="chest-wrap opened"><div class="chest-prize">🔗</div><h3>This device is linked</h3>' +
      '<p>' + n + (n === 1 ? " student syncs" : " students sync") + ' across your family\'s devices' + (added ? " (" + added + " brought to this device)" : "") + '.</p>' +
      '<p class="muted small">To add another device, open the Parent corner here and tap <strong>Show code</strong>, then scan the QR or type the code on the new device.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="fsDone">Let\'s train</button></div></div>');
    $("fsDone").onclick = function () { $("infoClose").click(); refreshUI(); if (done) done(); };
  }

  /* ---------- Parent corner card ---------- */
  function cardHTML() {
    if (!enabled()) return "";
    if (!linked()) return '<div class="family-card"><span class="lead-icon" aria-hidden="true">🔗</span><div><strong>Use Brain Dojo on every device</strong><p class="muted small">Turn on Family Sync to keep your kids\' progress on every phone, iPad or computer. No email needed, and Engage never sees their names or progress.</p></div>' +
      '<div class="family-actions"><button type="button" class="btn btn-gold" id="faOpen">Turn on Family Sync</button></div></div>';
    return '<div class="family-card linked"><span class="lead-icon" aria-hidden="true">🔗</span><div><strong>Family Sync is on ✓</strong><p class="muted small">This device syncs automatically. Keep your code safe: Engage can\'t recover it.</p></div>' +
      '<div class="family-actions"><button type="button" class="btn btn-small" id="faShow">Show code</button><button type="button" class="btn btn-small btn-quiet" id="faMore">More</button></div></div>';
  }
  function bindCard(after) {
    if ($("faOpen")) $("faOpen").onclick = function () { openStart(after); };
    if ($("faShow")) $("faShow").onclick = function () {
      BD.UI.sheet("Your Family Sync Code", '<div class="lead-form">' + codeCard(saved.code) + WARNING + '</div>');
      bindCodeCard(saved.code);
    };
    if ($("faMore")) $("faMore").onclick = function () {
      BD.UI.sheet("Family Sync", '<h4 class="label">Turn off on this device</h4><p class="muted small">Students stay on this device and stop syncing. Other linked devices keep syncing.</p>' +
        '<div class="res-actions" style="justify-content:flex-start"><button type="button" class="btn btn-quiet" id="faOff">Turn off on this device</button></div>' +
        '<h4 class="label">Delete synced data</h4><p class="muted small">Deletes the locked copy from Family Sync for every device. Students stay on each device until you remove them there.</p>' +
        '<div class="res-actions" style="justify-content:flex-start"><button type="button" class="btn btn-quiet danger" id="faDel">Delete synced data</button></div><p class="lf-msg" id="fsMsg"></p>');
      $("faOff").onclick = async function () { await flush(); turnOff(); $("infoClose").click(); if (after) after(); };
      $("faDel").onclick = async function () {
        if ($("faDel").dataset.sure !== "1") { $("faDel").dataset.sure = "1"; $("faDel").textContent = "Yes, delete it"; $("fsMsg").textContent = "Tap again to delete the synced copy for every device. This can't be undone."; return; }
        await ensureKeys();
        const res = await call("delete", { id: keys.id });
        if (!res.ok) { $("fsMsg").textContent = "Can't reach Family Sync. Try again."; return; }
        turnOff(); $("infoClose").click(); if (after) after();
      };
    };
  }
  function turnOff() {
    saved = null; keys = null; remote = { players: [], removed: [] }; write(null); pending.clear(); removed = [];
    clearInterval(pollTimer);
    const el = $("syncStatus"); if (el) { el.dataset.state = "local"; el.textContent = "Saved on this device"; }
    refreshUI();
  }

  function welcome() {
    const w = $("welcomeFamily");
    if (w) { w.hidden = !enabled(); w.innerHTML = linked() ? "🔗 Family Sync on · progress syncs to every device" : "🔗 <strong>Already training on another device?</strong> Link with your Family Sync Code ›"; w.disabled = linked(); w.classList.toggle("linked", linked()); }
  }
  function refreshUI() { welcome(); if (BD.UI && BD.UI.refresh) BD.UI.refresh(); }
  function startPolling() {
    clearInterval(pollTimer);
    pollTimer = setInterval(function () { if (document.visibilityState === "visible") pull(); }, 120000);
  }
  function listen() {
    if (listening) return; listening = true;
    document.addEventListener("visibilitychange", function () { if (!linked()) return; if (document.visibilityState === "hidden") flush(); else pull(); });
    window.addEventListener("online", function () { pull(); });
  }
  /* A link like brain.example.com/#sync=CODE (from the QR) opens the link step. */
  function fromLink() {
    const m = String(location.hash || "").match(/[#&]sync=([0-9A-Za-z-]{20,40})/);
    if (!m) return;
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { location.hash = ""; }
    if (!enabled() || (linked() && pretty(m[1]) === saved.code)) return;
    if (parseCode(m[1])) setTimeout(function () { openJoin(function () { BD.UI.players(); }, m[1]); }, 300);
  }

  function init() {
    if ($("welcomeFamily")) $("welcomeFamily").addEventListener("click", function () { if (!linked()) openJoin(function () { BD.UI.players(); }); });
    refreshUI();
    fromLink();
    if (!linked()) return;
    listen(); pull(); startPolling();
  }

  return {
    init: init, welcome: welcome, enabled: enabled, linked: linked, cardHTML: cardHTML, bindCard: bindCard, openSignIn: openStart, refreshUI: refreshUI,
    queue: function (p) { if (!linked() || !p) return; pending.set(p.id, p); schedule(); },
    remove: function (id) { if (!linked()) return; pending.delete(id); removed.push({ id: id, at: Date.now() }); schedule(0); },
    flushNow: flush, pull: pull, status: function () { return status; },
    _test: { parseCode: parseCode, pretty: pretty, newCode: newCode, derive: derive, lock: lock, unlock: unlock, start: start }
  };
})();
