/* BACKUP AND RESTORE — a student's progress as a save code or a save file.
   For families who play at home without signing in to Claude: progress is
   kept in the browser, and a save code moves it to another device, keeps a
   copy if the browser clears its storage, or brings it back to the dojo.
   Nothing is sent anywhere; the code holds the progress itself. */
window.BD = window.BD || {};

BD.Backup = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };

  /* ---------- encoding ---------- */
  function toB64(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function fromB64(b64) {
    const s = atob(b64), out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  async function pipe(bytes, stream) {
    const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await res.arrayBuffer());
  }
  const canZip = typeof CompressionStream === "function" && typeof DecompressionStream === "function";

  /* BDZ: gzip + base64 (short). BD1: plain base64 (older browsers). */
  async function encode(p) {
    const json = JSON.stringify({ app: "brain-dojo", v: 1, savedAt: Date.now(), player: p });
    const bytes = new TextEncoder().encode(json);
    if (canZip) try { return "BDZ:" + toB64(await pipe(bytes, new CompressionStream("gzip"))); } catch (e) { /* fall back */ }
    return "BD1:" + toB64(bytes);
  }
  async function decode(code) {
    code = String(code || "").replace(/\s+/g, "");
    let json;
    if (code.indexOf("BDZ:") === 0) {
      if (!canZip) throw new Error("This browser can't open that save code. Try the save file, or update the browser.");
      json = new TextDecoder().decode(await pipe(fromB64(code.slice(4)), new DecompressionStream("gzip")));
    } else if (code.indexOf("BD1:") === 0) json = new TextDecoder().decode(fromB64(code.slice(4)));
    else if (code.charAt(0) === "{") json = code; // a save file's contents
    else throw new Error("That doesn't look like a Brain Dojo save code.");
    const data = JSON.parse(json);
    if (!data || data.app !== "brain-dojo" || !data.player || !data.player.id || !data.player.name) throw new Error("That save code is incomplete.");
    return data;
  }

  /* ---------- back up ---------- */
  async function openBackup(p) {
    BD.UI.sheet("Back up " + p.name + "'s progress", '<p class="muted">Making the save code…</p>');
    const code = await encode(p);
    const json = JSON.stringify({ app: "brain-dojo", v: 1, savedAt: Date.now(), player: p });
    const belt = BD.beltOf(p);
    BD.UI.sheet("Back up " + p.name + "'s progress",
      '<p>' + esc(p.name) + ' · ' + belt.name + ' Belt · ' + (p.xp || 0).toLocaleString() + ' XP</p>' +
      '<p class="muted">Keep this save code somewhere safe, like a note or an email to yourself. On any device, open Brain Dojo, tap <strong>Restore a student</strong> on the "Who\'s training today?" screen, and paste it in.</p>' +
      '<label class="sr-only" for="backupCode">Save code</label>' +
      '<textarea id="backupCode" class="backup-code" readonly rows="5">' + esc(code) + '</textarea>' +
      '<div class="backup-actions">' +
      '<button type="button" class="btn btn-primary" id="backupCopy">Copy save code</button>' +
      '<button type="button" class="btn btn-quiet" id="backupFile">Download save file</button>' +
      '</div><p class="muted small" id="backupMsg" aria-live="polite"></p>');
    const msg = function (t) { $("backupMsg").textContent = t; };
    $("backupCode").addEventListener("focus", function () { this.select(); });
    $("backupCopy").addEventListener("click", async function () {
      const box = $("backupCode");
      try { await navigator.clipboard.writeText(code); msg("Copied. Paste it somewhere safe."); return; } catch (e) { /* fall back */ }
      box.focus(); box.select();
      try { if (document.execCommand("copy")) { msg("Copied. Paste it somewhere safe."); return; } } catch (e) { /* ignore */ }
      msg("The code is selected. Copy it with your device's Copy button.");
    });
    $("backupFile").addEventListener("click", async function () {
      const name = "brain-dojo-" + p.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + "-" + BD.today() + ".json";
      // Inside the shared Claude link, files go through Claude's save prompt.
      let dl = null;
      if (window.claude && typeof window.claude.use === "function") { try { dl = await window.claude.use("downloads"); } catch (e) { dl = null; } }
      if (dl) {
        try { await dl.save({ filename: name, data: json }); msg("Saved. Keep the file somewhere safe."); }
        catch (e) { msg(e && e.code === "declined" ? "No file saved. You can still copy the save code." : "Saving a file isn't available here. Use Copy save code instead."); }
        return;
      }
      try {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
        a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        msg("If no file appears, use Copy save code instead.");
      } catch (e) { msg("This browser can't save files here. Use Copy save code instead."); }
    });
  }

  /* ---------- restore ---------- */
  function openRestore() {
    BD.UI.sheet("Restore a student",
      '<p class="muted">Paste a save code, or choose a save file. This brings back the student\'s belts, stripes, XP and stats on this device.</p>' +
      '<label class="sr-only" for="restoreCode">Save code</label>' +
      '<textarea id="restoreCode" class="backup-code" rows="5" placeholder="Paste the save code here (it starts with BDZ: or BD1:)"></textarea>' +
      '<div class="backup-actions">' +
      '<button type="button" class="btn btn-primary" id="restoreGo">Restore</button>' +
      '<label class="btn btn-quiet file-btn">Choose save file<input type="file" id="restoreFile" accept=".json,application/json,text/plain" hidden></label>' +
      '</div><div id="restoreMsg" aria-live="polite"></div>');
    const show = function (html) { $("restoreMsg").innerHTML = html; };
    async function check(text) {
      let data;
      try { data = await decode(text); } catch (e) { show('<p class="restore-bad">' + esc(e.message || "That save code didn't work.") + '</p>'); return; }
      const p = data.player, have = BD.Store.get(p.id), belt = BD.BELTS[(BD.Rank.rec(JSON.parse(JSON.stringify(p)), BD.Rank.dojoGrade(JSON.parse(JSON.stringify(p))))).belt];
      const when = new Date(data.savedAt || p.updatedAt || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      const newer = have && (have.updatedAt || 0) > (p.updatedAt || 0);
      show('<div class="restore-card"><p><strong>' + esc(p.name) + '</strong> · ' + belt.name + ' Belt · ' + (p.xp || 0).toLocaleString() + ' XP · saved ' + when + '</p>' +
        (have ? '<p class="restore-bad">' + esc(have.name) + ' is already on this device' + (newer ? ' with <strong>newer</strong> progress' : '') + '. Restoring replaces that copy.</p>' : '') +
        '<button type="button" class="btn btn-primary" id="restoreYes">' + (have ? "Replace with this save" : "Add " + esc(p.name)) + '</button></div>');
      $("restoreYes").addEventListener("click", function () {
        BD.Store.importPlayer(p);
        BD.UI.sheet("Welcome back, " + p.name + "!", '<p>' + esc(p.name) + '\'s progress is restored on this device.</p><button type="button" class="btn btn-primary" id="restoreDone">Let\'s train</button>');
        $("restoreDone").addEventListener("click", function () { $("infoClose").click(); BD.UI.home(); });
      });
    }
    $("restoreGo").addEventListener("click", function () { check($("restoreCode").value); });
    $("restoreFile").addEventListener("change", function () {
      const f = this.files && this.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = function () { $("restoreCode").value = String(rd.result).slice(0, 200) + (String(rd.result).length > 200 ? "…" : ""); check(String(rd.result)); };
      rd.readAsText(f);
    });
  }

  return { encode: encode, decode: decode, openBackup: openBackup, openRestore: openRestore };
})();
