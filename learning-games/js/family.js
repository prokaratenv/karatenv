/* FAMILY ACCOUNTS — sign in with a parent's email so each student's progress
   follows them to any device (phone, iPad, laptop), with no codes to copy.
   A parent types their email, gets a 6-digit code, types it in, and the
   device is linked. From then on every save goes to the family account and
   every linked device picks it up. Works on your own website through
   BD.CONFIG.accountEndpoint (tools/family-sync.gs, in your Google account). */
window.BD = window.BD || {};

BD.Family = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const KEY = "brainDojo.family";
  const read = function () { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
  const write = function (v) { try { if (v) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); } catch (e) { /* blocked */ } };
  const endpoint = function () { const u = (BD.CONFIG || {}).accountEndpoint; return typeof u === "string" && /^(https:\/\/|http:\/\/localhost[:/])[^\s"<>]+$/i.test(u) ? u : ""; };

  let acct = read();
  // Older links without an encryption key sign in again once (nothing readable is kept on the server).
  if (acct && (typeof acct.token !== "string" || !/^[a-f0-9]{32}\.[a-f0-9]{64}$/.test(acct.token) || typeof acct.k !== "string")) { acct = null; write(null); }

  /* ---------- end-to-end encryption ----------
     Each student is encrypted on the device (AES-GCM) before it's sent, with a
     key made from the parent's email and a random per-family salt (PBKDF2).
     The server only ever holds scrambled data; it never gets the key or the email. */
  const b64 = function (buf) { let s = ""; new Uint8Array(buf).forEach(function (c) { s += String.fromCharCode(c); }); return btoa(s); };
  const unb64 = function (str) { const s = atob(str), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; };
  let keyObj = null;
  async function deriveKey(email, salt) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode("brain-dojo-family-v1:" + email), "PBKDF2", false, ["deriveKey"]);
    const k = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 310000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    return b64(await crypto.subtle.exportKey("raw", k));
  }
  async function key() {
    if (!keyObj) keyObj = await crypto.subtle.importKey("raw", unb64(acct.k), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    return keyObj;
  }
  async function seal(p) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, await key(), new TextEncoder().encode(JSON.stringify(p)));
    const out = new Uint8Array(12 + ct.byteLength); out.set(iv, 0); out.set(new Uint8Array(ct), 12);
    return { id: p.id, updatedAt: p.updatedAt || 0, enc: b64(out) };
  }
  async function open(rp) {
    try {
      const all = unb64(rp.enc);
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: all.slice(0, 12) }, await key(), all.slice(12));
      const p = JSON.parse(new TextDecoder().decode(pt));
      return p && p.id === rp.id ? p : null; // a copy can't be swapped onto another student
    } catch (e) { return null; }
  }
  let status = "off", timer = null, flushing = false, pollTimer = null;
  const pending = new Map();      // player id -> player
  let removed = [];               // [{ id, at }]

  function enabled() { return !!endpoint(); }
  function linked() { return !!(acct && acct.token && enabled()); }
  function masked(email) {
    const m = String(email || "").match(/^(.)[^@]*(@.*)$/);
    return m ? m[1] + "•••" + m[2] : "";
  }
  function setStatus(s) {
    status = s;
    const el = $("syncStatus"); if (!el || !linked()) return;
    const LABEL = { syncing: "Syncing to " + acct.hint + "…", synced: "Synced to " + acct.hint + " · every linked device", offline: "Offline: saving on this device, will sync when back online" };
    if (LABEL[s]) { el.dataset.state = s === "synced" ? "synced" : s === "offline" ? "offline" : "saving"; el.textContent = LABEL[s]; }
  }

  async function call(action, data) {
    const ctl = typeof AbortController === "function" ? new AbortController() : null;
    const t = ctl ? setTimeout(function () { ctl.abort(); }, 25000) : null;
    try {
      // A plain-text body keeps this a "simple" request (no CORS preflight), which Apps Script needs.
      const res = await fetch(endpoint(), { method: "POST", body: JSON.stringify(Object.assign({ action: action }, data || {})), redirect: "follow", credentials: "omit", cache: "no-store", signal: ctl ? ctl.signal : undefined });
      const out = await res.json();
      return out && typeof out === "object" ? out : { ok: false, error: "server" };
    } catch (e) { return { ok: false, error: "network" }; }
    finally { if (t) clearTimeout(t); }
  }

  /* Bring the account's copy in: newer students replace older ones, removed ones go. */
  async function apply(res) {
    if (!res || !res.ok) return;
    const remoteIds = {};
    (Array.isArray(res.removed) ? res.removed : []).forEach(function (r) {
      const p = r && BD.Store.get(r.id);
      if (p && (p.updatedAt || 0) <= (Number(r.at) || 0) && !pending.has(p.id)) BD.Store.applyRemoteRemoval(p.id);
    });
    for (const rp of (Array.isArray(res.players) ? res.players : [])) {
      if (!rp || typeof rp !== "object" || typeof rp.id !== "string" || typeof rp.enc !== "string") continue;
      remoteIds[rp.id] = rp.updatedAt || 0;
      const local = BD.Store.get(rp.id);
      if (local && (rp.updatedAt || 0) <= (local.updatedAt || 0)) continue;
      const p = await open(rp);
      if (p) BD.Store.applyRemote(Object.assign(p, { updatedAt: rp.updatedAt || 0 }));
    }
    // anything newer here (or only here) goes up
    BD.Store.players().forEach(function (p) { if (!(p.id in remoteIds) || (p.updatedAt || 0) > remoteIds[p.id]) pending.set(p.id, p); });
    if (pending.size) schedule(300);
  }
  function signedOut() {
    acct = null; keyObj = null; write(null); pending.clear(); removed = [];
    const el = $("syncStatus"); if (el) { el.dataset.state = "local"; el.textContent = "Saved on this device"; }
    refreshUI();
  }

  async function pull() {
    if (!linked()) return;
    setStatus("syncing");
    const res = await call("pull", { token: acct.token });
    if (res.error === "signed_out") return signedOut();
    if (!res.ok) return setStatus("offline");
    await apply(res); setStatus(pending.size ? "syncing" : "synced");
  }
  function schedule(ms) { clearTimeout(timer); timer = setTimeout(flush, ms === undefined ? 2000 : ms); }
  async function flush() {
    if (!linked() || (!pending.size && !removed.length)) return;
    if (flushing) return schedule();
    flushing = true; setStatus("syncing");
    const sent = [];
    for (const p of Array.from(pending.values())) sent.push({ p: p, at: p.updatedAt || 0, sealed: await seal(p) });
    const gone = removed.slice();
    const res = await call("push", { token: acct.token, players: sent.map(function (x) { return x.sealed; }), removed: gone });
    flushing = false;
    if (res.error === "signed_out") return signedOut();
    if (!res.ok) { setStatus("offline"); schedule(res.error === "too_big" ? 600000 : 15000); return; }
    sent.forEach(function (x) { if (pending.get(x.p.id) === x.p && (x.p.updatedAt || 0) <= x.at) pending.delete(x.p.id); });
    removed = removed.filter(function (r) { return gone.indexOf(r) === -1; });
    await apply(res);
    setStatus(pending.size || removed.length ? "syncing" : "synced");
  }

  /* ---------- sign in ---------- */
  function deviceLabel() {
    const ua = navigator.userAgent || "";
    const kind = /iPad|Macintosh.*Mobile|Macintosh(?=.*Safari)(?!.*Chrome)/.test(ua) && navigator.maxTouchPoints > 1 ? "iPad" : /iPhone/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : /CrOS/.test(ua) ? "Chromebook" : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows PC" : "Device";
    return kind + " · " + new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  function openSignIn(done) {
    BD.UI.sheet("Sign in with a parent's email",
      '<div class="lead-form"><p>Link this device to your <strong>family account</strong> so each student\'s belts, stripes and points show up on <strong>every phone, iPad or computer</strong> they use. No codes to copy.</p>' +
      '<label class="lf"><span>Parent or guardian email</span><input id="faEmail" type="email" autocomplete="email" inputmode="email" maxlength="254"></label>' +
      '<label class="lf-check lf-adult"><input type="checkbox" id="faAgree"> <span>I\'m the parent or guardian (18+). I agree that my children\'s Brain Dojo profiles may be stored, <strong>encrypted on this device first</strong> so no one else can read them, to sync them across our devices, as described in the <button type="button" class="link-btn" id="faTerms">Terms &amp; Privacy</button>.</span></label>' +
      '<p class="lf-msg" id="faMsg" aria-live="polite"></p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="faSend">Email me a code</button></div>' +
      '<p class="muted small">We\'ll email a 6-digit code. Your email isn\'t saved by the family account: it only sends the code and makes your family\'s private lock. It doesn\'t sign you up for marketing emails.</p></div>');
    const msg = function (t, good) { $("faMsg").textContent = t; $("faMsg").className = "lf-msg" + (good ? " good" : ""); };
    $("faTerms").onclick = function () { const em = $("faEmail").value; BD.Leads.openTerms(function () { openSignIn(done); $("faEmail").value = em; }); };
    $("faSend").onclick = async function () {
      const email = String($("faEmail").value || "").trim().toLowerCase();
      if (!/^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/.test(email)) return msg("Please check the email address.");
      if (!$("faAgree").checked) return msg("Please confirm you're the parent or guardian and agree.");
      $("faSend").disabled = true; msg("Sending your code…", true);
      const res = await call("request", { email: email });
      $("faSend").disabled = false;
      if (!res.ok) return msg(res.error === "too_many" ? "Too many codes asked for. Try again in an hour." : res.error === "network" ? "Can't reach the family account right now. Check the internet and try again." : "Couldn't send the code. Check the email address.");
      codeStep(email, done);
    };
    setTimeout(function () { if ($("faEmail")) $("faEmail").focus(); }, 80);
  }
  function codeStep(email, done) {
    BD.UI.sheet("Check your email",
      '<div class="lead-form"><p>We sent a 6-digit code to <strong>' + esc(email) + '</strong>. Type it here. (Check spam if it isn\'t there in a minute.)</p>' +
      '<div class="pin-row"><label class="sr-only" for="faCode">Code</label><input id="faCode" class="pin-input code-input" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••"><button type="button" class="btn btn-primary" id="faGo">Link</button></div>' +
      '<p class="lf-msg" id="faMsg" aria-live="polite"></p>' +
      '<p><button type="button" class="link-btn" id="faBack">Use a different email or send a new code</button></p></div>');
    const msg = function (t, good) { $("faMsg").textContent = t; $("faMsg").className = "lf-msg" + (good ? " good" : ""); };
    let busy = false;
    const go = async function () {
      if (busy) return;
      const code = $("faCode").value.replace(/\D/g, "");
      if (code.length !== 6) return msg("Type all 6 digits.");
      busy = true; $("faGo").disabled = true; msg("Linking…", true);
      const res = await call("verify", { email: email, code: code, device: deviceLabel() });
      busy = false; $("faGo").disabled = false;
      if (!res.ok) return msg(res.error === "expired" ? "That code expired. Tap below to get a new one." : res.error === "network" ? "Can't reach the family account. Try again." : "That code isn't right." + (res.left ? " " + res.left + " tries left." : ""));
      if (!/^[a-f0-9]{32}$/.test(res.salt || "") || !(window.crypto && crypto.subtle)) { busy = false; return msg("This browser can't lock the data safely. Please update it and try again."); }
      // only a short hint of the email is kept on the device; the email itself becomes the lock's key
      acct = { token: res.token, hint: masked(email), k: await deriveKey(email, res.salt), at: new Date().toISOString() }; keyObj = null; write(acct);
      const before = BD.Store.players().length;
      await apply(res);
      await flush();
      const n = BD.Store.players().length;
      BD.Sound.right(); BD.confetti(70);
      BD.UI.sheet("Linked!", '<div class="chest-wrap opened"><div class="chest-prize">🔗</div><h3>This device is linked</h3>' +
        '<p>' + n + (n === 1 ? " student is" : " students are") + ' in your family account' + (n > before ? " (" + (n - before) + " brought to this device)" : "") + '. Progress now saves to <strong>' + esc(masked(email)) + '</strong> and shows on every device you link.</p>' +
        '<p class="muted small">On another device, open Brain Dojo and tap <strong>Sign in with a parent\'s email</strong>.</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="faDone">Let\'s train</button></div></div>');
      $("faDone").onclick = function () { $("infoClose").click(); refreshUI(); if (done) done(); };
      startPolling();
    };
    $("faGo").onclick = go;
    $("faCode").onkeydown = function (e) { if (e.key === "Enter") go(); };
    $("faCode").oninput = function () { if ($("faCode").value.replace(/\D/g, "").length === 6) go(); };
    $("faBack").onclick = function () { openSignIn(done); $("faEmail").value = email; };
    setTimeout(function () { if ($("faCode")) $("faCode").focus(); }, 80);
  }

  /* ---------- Parent corner card ---------- */
  function cardHTML() {
    if (!enabled()) return "";
    if (!linked()) return '<div class="family-card"><span class="lead-icon" aria-hidden="true">🔗</span><div><strong>Use Brain Dojo on every device</strong><p class="muted small">Link this device to your email so your kids\' progress shows on any phone, iPad or computer they use.</p></div><button type="button" class="btn btn-gold" id="faOpen">Sign in with email</button></div>';
    return '<div class="family-card linked"><span class="lead-icon" aria-hidden="true">🔗</span><div><strong>Family account: ' + esc(acct.hint) + ' ✓</strong><p class="muted small">This device syncs automatically. To add another device, open Brain Dojo there and sign in with the same email.</p></div>' +
      '<div class="family-actions"><button type="button" class="btn btn-small btn-quiet" id="faSignOut">Sign out this device</button><button type="button" class="btn btn-small btn-quiet" id="faMore">More</button></div></div>';
  }
  function bindCard(after) {
    if ($("faOpen")) $("faOpen").onclick = function () { openSignIn(after); };
    if ($("faSignOut")) $("faSignOut").onclick = async function () {
      await flush();
      const t = acct && acct.token; signedOut();
      if (t) call("signout", { token: t });
      if (after) after();
    };
    if ($("faMore")) $("faMore").onclick = function () {
      BD.UI.sheet("Family account", '<p>Linked to <strong>' + esc(acct.hint) + '</strong>.</p>' +
        '<div class="res-actions" style="justify-content:flex-start"><button type="button" class="btn btn-quiet" id="faAll">Sign out all devices</button></div>' +
        '<p class="muted small">Every device will need the email code again. Students stay in the family account.</p>' +
        '<h4 class="label">Delete family data</h4><p class="muted small">Deletes the family account and the copy of your students\' progress stored with it. Students stay on this device until you remove them.</p>' +
        '<div class="res-actions" style="justify-content:flex-start"><button type="button" class="btn btn-quiet danger" id="faDel">Delete family data</button></div><p class="lf-msg" id="faMsg"></p>');
      $("faAll").onclick = async function () { const t = acct.token; await call("signoutAll", { token: t }); signedOut(); $("infoClose").click(); if (after) after(); };
      $("faDel").onclick = async function () {
        if ($("faDel").dataset.sure !== "1") { $("faDel").dataset.sure = "1"; $("faDel").textContent = "Yes, delete it"; $("faMsg").textContent = "Tap again to delete. This can't be undone."; return; }
        const res = await call("delete", { token: acct.token });
        if (!res.ok && res.error === "network") { $("faMsg").textContent = "Can't reach the family account. Try again."; return; }
        signedOut(); $("infoClose").click(); if (after) after();
      };
    };
  }

  function welcome() {
    const w = $("welcomeFamily");
    if (w) { w.hidden = !enabled(); w.innerHTML = linked() ? "🔗 Linked to " + esc(acct.hint) + " · progress syncs to every device" : "🔗 <strong>Already training on another device?</strong> Sign in with a parent's email ›"; w.disabled = linked(); w.classList.toggle("linked", linked()); }
  }
  function refreshUI() { welcome(); if (BD.UI && BD.UI.refresh) BD.UI.refresh(); }
  function startPolling() {
    clearInterval(pollTimer);
    pollTimer = setInterval(function () { if (document.visibilityState === "visible") pull(); }, 120000);
  }

  function init() {
    if ($("welcomeFamily")) $("welcomeFamily").addEventListener("click", function () { if (!linked()) openSignIn(function () { BD.UI.players(); }); });
    refreshUI();
    if (!linked()) return;
    pull(); startPolling();
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") flush(); else pull();
    });
    window.addEventListener("online", function () { pull(); });
  }

  return {
    init: init, welcome: welcome, enabled: enabled, linked: linked, cardHTML: cardHTML, bindCard: bindCard, openSignIn: openSignIn, refreshUI: refreshUI,
    queue: function (p) { if (!linked() || !p) return; pending.set(p.id, p); schedule(); },
    remove: function (id) { if (!linked()) return; pending.delete(id); removed.push({ id: id, at: Date.now() }); schedule(0); },
    flushNow: flush, pull: pull, status: function () { return status; }
  };
})();
