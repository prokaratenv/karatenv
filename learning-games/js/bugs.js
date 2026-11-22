/* REPORT A BUG — a small button in the top bar on every screen.
   Tap it: the app takes a screenshot of what's on screen right then, then
   opens a sheet with the picture (removable), an optional note and an
   "attach a photo instead" option. Send posts it to the family script
   (action "bug"), which emails it to the Engage team and keeps nothing.
   The team's address lives only in the script, never in the app.
   Inside Claude there is no family script, so the sheet points to
   brain.engagelma.com and offers to copy the note. */
window.BD = window.BD || {};

BD.Bugs = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const H2C = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  const MAX_SIDE = 1280, MAX_BYTES = 1500000, NOTE_MAX = 500;
  const inClaude = function () { return !!(window.claude && typeof window.claude.use === "function"); };
  const canSend = function () { return !inClaude() && !!(BD.Family && BD.Family.enabled && BD.Family.enabled()); };
  let busy = false, shot = null, h2cLoad = null;

  /* ---------- screenshot ---------- */
  function loadH2C() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    if (h2cLoad) return h2cLoad;
    h2cLoad = new Promise(function (ok, no) {
      const s = document.createElement("script");
      s.src = H2C; s.async = true; s.crossOrigin = "anonymous"; s.referrerPolicy = "no-referrer";
      s.onload = function () { window.html2canvas ? ok(window.html2canvas) : no(new Error("no html2canvas")); };
      s.onerror = function () { h2cLoad = null; no(new Error("load failed")); };
      document.head.appendChild(s);
      setTimeout(function () { no(new Error("timeout")); }, 8000);
    });
    return h2cLoad;
  }
  /* Scale a canvas or image down to MAX_SIDE and encode as JPEG under MAX_BYTES. */
  function shrink(src, w, h) {
    let k = Math.min(1, MAX_SIDE / Math.max(w, h, 1)), q = 0.7, out = "";
    for (let tries = 0; tries < 6; tries++) {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
      const g = c.getContext("2d"); g.fillStyle = "#0B1426"; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(src, 0, 0, c.width, c.height);
      out = c.toDataURL("image/jpeg", q);
      if (out.length * 0.75 <= MAX_BYTES) return out;
      if (q > 0.45) q -= 0.15; else k *= 0.7;
    }
    return out.length * 0.75 <= MAX_BYTES ? out : null;
  }
  async function capture() {
    try {
      const h2c = await loadH2C();
      const bg = getComputedStyle(document.body).backgroundColor;
      const canvas = await Promise.race([
        h2c(document.body, {
          backgroundColor: bg && bg !== "rgba(0, 0, 0, 0)" ? bg : "#0B1426", logging: false, useCORS: true,
          x: window.scrollX, y: window.scrollY, width: window.innerWidth, height: window.innerHeight,
          windowWidth: window.innerWidth, windowHeight: window.innerHeight, scale: Math.min(window.devicePixelRatio || 1, 2),
          ignoreElements: function (el) { return el.id === "bugBtn" || el.classList.contains("bug-toast"); }
        }),
        new Promise(function (_, no) { setTimeout(function () { no(new Error("timeout")); }, 10000); })
      ]);
      return shrink(canvas, canvas.width, canvas.height);
    } catch (e) { return null; } // offline or blocked: report without a picture
  }
  function fromFile(file) {
    return new Promise(function (ok) {
      if (!file || !/^image\//.test(file.type) || file.size > 25e6) return ok(null);
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = function () { const d = shrink(im, im.naturalWidth, im.naturalHeight); URL.revokeObjectURL(url); ok(d); };
      im.onerror = function () { URL.revokeObjectURL(url); ok(null); };
      im.src = url;
    });
  }

  /* ---------- details sent along (no names) ---------- */
  function meta() {
    const scr = Array.prototype.find.call(document.querySelectorAll(".screen"), function (s) { return !s.hidden; });
    const p = BD.Store && BD.Store.current(), v = document.querySelector('script[src*="js/app.js"]');
    const m = v && v.getAttribute("src").match(/[?&]v=([A-Za-z0-9.]+)/);
    let grade = "", belt = "";
    try { if (p) { grade = BD.Rank.dojoGrade(p); belt = BD.beltOf(p).name; } } catch (e) { /* no profile */ }
    const id = scr ? scr.id.replace(/^screen-/, "") : "unknown";
    return { screen: id, version: m ? m[1] : "", grade: grade, belt: belt, game: id, vw: window.innerWidth, vh: window.innerHeight, ua: String(navigator.userAgent || "").slice(0, 300), time: new Date().toString().slice(0, 40) };
  }

  /* ---------- sheet ---------- */
  function shotHTML() {
    return shot ? '<div class="bug-shot"><img src="' + shot + '" alt="Screenshot of the screen"><button type="button" class="btn btn-quiet btn-small" id="bugRemove">Remove screenshot</button></div>'
      : '<p class="muted small bug-noshot">No screenshot. You can attach a photo instead.</p>';
  }
  function open() {
    const send = canSend();
    BD.UI.sheet("Report a bug",
      '<div class="bug-sheet">' +
      (send ? '<p class="muted small">Sends this screenshot and your note to the Engage team to fix it. Don\'t include personal info.</p>'
        : '<p class="muted small">Bug reports send from <strong>brain.engagelma.com</strong>. Open it there to send one, or copy your note below.</p>') +
      '<div id="bugShotWrap">' + (send ? shotHTML() : '') + '</div>' +
      '<label class="bug-label" for="bugNote">What happened?</label>' +
      '<textarea id="bugNote" class="bug-note" maxlength="' + NOTE_MAX + '" rows="4" placeholder="What happened? What did you expect?"></textarea>' +
      '<p class="muted small bug-count"><span id="bugCount">0</span> / ' + NOTE_MAX + '</p>' +
      (send ? '<label class="btn btn-quiet btn-small bug-file">Attach a photo instead<input type="file" accept="image/*" id="bugFile" hidden></label>' : '') +
      '<p class="bug-err" id="bugErr" role="alert" hidden></p>' +
      '<div class="res-actions">' + (send ? '<button type="button" class="btn btn-primary btn-big" id="bugSend">Send report</button>' : '<button type="button" class="btn btn-primary" id="bugCopy">Copy my note</button>') + '</div></div>');
    const note = $("bugNote");
    note.oninput = function () { $("bugCount").textContent = note.value.length; };
    const rebindShot = function () { $("bugShotWrap").innerHTML = shotHTML(); if ($("bugRemove")) $("bugRemove").onclick = function () { shot = null; rebindShot(); }; };
    if (send) rebindShot();
    if ($("bugFile")) $("bugFile").onchange = async function () {
      const d = await fromFile(this.files && this.files[0]);
      if (d) { shot = d; rebindShot(); err(""); } else err("That file isn't a picture we can use. Try a different photo.");
      this.value = "";
    };
    if ($("bugCopy")) $("bugCopy").onclick = function () {
      const t = note.value.trim();
      try { navigator.clipboard.writeText(t).then(function () { toast("Copied. Paste it when you report the bug on brain.engagelma.com."); }, function () { toast("Couldn't copy. Select the text and copy it."); }); }
      catch (e) { toast("Couldn't copy. Select the text and copy it."); }
    };
    if ($("bugSend")) $("bugSend").onclick = sendIt;
  }
  function err(t) { const e = $("bugErr"); if (!e) return; e.textContent = t; e.hidden = !t; }
  const ERRORS = {
    limit: "Too many reports right now, try again later.",
    too_big: "That picture is too big. Remove it or attach a smaller one.",
    empty: "Add a note or a screenshot first.",
    bad_request: "The studio needs to update the family script before bug reports can send.",
    network: "Couldn't send. Check your internet and try again."
  };
  async function sendIt() {
    const btn = $("bugSend"), comment = $("bugNote").value.trim().slice(0, NOTE_MAX);
    if (!comment && !shot) { err(ERRORS.empty); return; }
    btn.disabled = true; btn.textContent = "Sending…"; err("");
    const linked = BD.Family.linked && BD.Family.linked();
    const res = await BD.Family.call("bug", { token: linked ? BD.Family.token() : undefined, comment: comment, image: shot || "", meta: meta() });
    if (res && res.ok) {
      shot = null;
      $("infoClose").click();
      toast("Thanks! The Engage team got your report.");
      return;
    }
    btn.disabled = false; btn.textContent = "Send report";
    err(ERRORS[res && res.error] || ERRORS.network);
  }

  function toast(t) {
    const el = document.createElement("div"); el.className = "bug-toast"; el.setAttribute("role", "status"); el.textContent = t;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add("out"); setTimeout(function () { el.remove(); }, 400); }, 3600);
  }

  async function report() {
    if (busy) return; busy = true;
    const b = $("bugBtn"); if (b) b.classList.add("busy");
    try {
      if (BD.Sound) BD.Sound.tap();
      shot = canSend() ? await capture() : null; // picture first, before the sheet covers the screen
      open();
    } finally { busy = false; if (b) b.classList.remove("busy"); }
  }
  function bind() { const b = $("bugBtn"); if (b) b.addEventListener("click", report); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind); else bind();

  return { report: report, capture: capture, meta: meta };
})();
