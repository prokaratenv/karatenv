/* ACCOUNT SYNC — keeps each student's progress (and your growing sentence
   bank) in your Claude account, so any device opened with the shared link
   and signed in to that account picks up where the kids left off.
   Without it (opened from a file, signed out, or view-only access) the game
   saves on the device as before. */
window.BD = window.BD || {};

BD.Sync = (function () {
  const LABEL = {
    local: "Saved on this device",
    connecting: "Connecting to your account…",
    synced: "Synced to your account",
    saving: "Saving to your account…",
    offline: "Can't reach your account. Saving on this device for now.",
    readonly: "Saved on this device only (needs Contributor access to sync)"
  };
  let col = null, uid = null, ready = false, status = "local";
  const queue = new Map();      // player id -> player
  const bankQueue = new Map();  // doc id -> data
  const removals = [];
  let flushing = false, timer = null;

  function setStatus(s) {
    status = s;
    const el = document.getElementById("syncStatus");
    if (el) { el.dataset.state = s; el.textContent = LABEL[s]; }
  }
  function knownKey() { return "brainDojo.known." + uid; }
  function known() { try { return JSON.parse(localStorage.getItem(knownKey()) || "[]"); } catch (e) { return []; } }
  function setKnown(list) { try { localStorage.setItem(knownKey(), JSON.stringify(list)); } catch (e) { /* ignore */ } }
  function markKnown(id, on) {
    const k = known().filter(function (x) { return x !== id; });
    if (on) k.push(id);
    setKnown(k);
  }
  function withTimeout(p, ms) {
    return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej({ code: "timeout" }); }, ms); })]);
  }
  const clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  async function init() {
    if (!window.claude || typeof window.claude.use !== "function") { setStatus("local"); return; }
    setStatus("connecting");
    let db = null, user = null;
    try { const r = await Promise.all([window.claude.use("db"), window.claude.use("user")]); db = r[0]; user = r[1]; } catch (e) { /* fall through */ }
    if (!db || !user) { setStatus("local"); return; }
    try { uid = await user.id(); } catch (e) { uid = null; }
    if (!uid) { setStatus("local"); return; }
    let canWrite = null;
    try { canWrite = await user.can("data.write"); } catch (e) { canWrite = null; }
    col = db.collection("data/users/" + uid);

    let snap;
    try { snap = await withTimeout(col.get(), 12000); }
    catch (e) { setStatus("offline"); col = null; return; }

    const remote = {};
    snap.docs.forEach(function (d) { if (d.exists) remote[d.id] = d.data(); });
    const wasKnown = known();
    const localPlayers = BD.Store.players().slice();

    // Students saved from other devices
    Object.keys(remote).forEach(function (k) {
      if (k.indexOf("player-") === 0 && remote[k].player) BD.Store.applyRemote(remote[k].player);
      if (k.indexOf("bank-read-") === 0 && BD.Reading) BD.Reading.applyRemoteBank(k, remote[k]);
      else if (k.indexOf("bank-") === 0 && BD.SentenceGen) BD.SentenceGen.applyRemoteBank(k, remote[k]);
    });
    // Students on this device: upload new ones, drop ones deleted elsewhere
    localPlayers.forEach(function (p) {
      const r = remote["player-" + p.id];
      if (!r) {
        if (wasKnown.indexOf(p.id) !== -1) BD.Store.applyRemoteRemoval(p.id);
        else queue.set(p.id, p);
      } else if ((p.updatedAt || 0) > ((r.player && r.player.updatedAt) || 0)) queue.set(p.id, p);
    });
    setKnown(Object.keys(remote).filter(function (k) { return k.indexOf("player-") === 0; }).map(function (k) { return k.slice(7); }));

    if (canWrite === false) { setStatus("readonly"); }
    else { ready = true; setStatus("synced"); }

    col.onSnapshot(function (qs) {
      qs.docChanges().forEach(function (ch) {
        const id = ch.doc.id;
        if (id.indexOf("player-") === 0) {
          const pid = id.slice(7);
          if (ch.type === "removed") BD.Store.applyRemoteRemoval(pid);
          else if (!queue.has(pid)) { const d = ch.doc.data(); if (d && d.player) BD.Store.applyRemote(d.player); }
        } else if (id.indexOf("bank-read-") === 0 && ch.type !== "removed" && BD.Reading) {
          BD.Reading.applyRemoteBank(id, ch.doc.data());
        } else if (id.indexOf("bank-") === 0 && ch.type !== "removed" && BD.SentenceGen) {
          BD.SentenceGen.applyRemoteBank(id, ch.doc.data());
        }
      });
    }, function () { if (status !== "readonly") setStatus("offline"); });

    if (BD.UI && BD.UI.refresh) BD.UI.refresh();
    schedule(0);
  }

  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(flush, ms === undefined ? 1200 : ms);
  }

  async function flush() {
    if (!ready || !col) return;
    if (flushing) { schedule(); return; }
    if (!queue.size && !bankQueue.size && !removals.length) return;
    flushing = true; setStatus("saving");
    try {
      while (removals.length) {
        const id = removals[0];
        await col.doc("player-" + id).delete();
        removals.shift(); markKnown(id, false);
      }
      for (const entry of Array.from(queue.entries())) {
        const p = entry[1], at = p.updatedAt || Date.now();
        await col.doc("player-" + p.id).set({ player: clone(p), updatedAt: at });
        // drop it from the queue unless it changed again while saving
        if (queue.get(entry[0]) === p && (p.updatedAt || 0) <= at) queue.delete(entry[0]);
        markKnown(p.id, true);
      }
      for (const entry of Array.from(bankQueue.entries())) {
        const data = entry[1];
        await col.doc(entry[0]).set(data);
        if (bankQueue.get(entry[0]) === data) bankQueue.delete(entry[0]);
      }
      setStatus("synced");
    } catch (e) {
      if (e && (e.code === "invalid_argument" || e.code === "not_granted" || e.code === "revoked")) { ready = false; setStatus("readonly"); }
      else { setStatus("offline"); }
    }
    flushing = false;
    if (ready && (queue.size || bankQueue.size || removals.length)) schedule(5000);
  }

  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(); });

  return {
    init: init,
    queue: function (p) { if (!col) return; queue.set(p.id, p); schedule(); },
    remove: function (id) { if (!col) return; queue.delete(id); removals.push(id); schedule(0); },
    saveBank: function (docId, data) { if (!col) return; bankQueue.set(docId, data); schedule(); },
    status: function () { return status; },
    label: function () { return LABEL[status]; },
    connected: function () { return ready; },
    flushNow: function () { return flush(); }
  };
})();
