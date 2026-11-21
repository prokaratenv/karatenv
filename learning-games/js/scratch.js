/* SCRATCH PAPER — draw with a finger, stylus or mouse to work a problem out.
   Opens over the game with the problem pinned at the top and the game's own
   keypad underneath, so the answer can be typed without closing it.
   Graph-paper lines are a background, so the eraser never wipes them.
   Nothing drawn is saved or sent anywhere. */
window.BD = window.BD || {};

BD.Scratch = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const COLORS = ["#1A2C6B", "#D63A2F", "#1E8A4C"];
  let cfg = null, cv = null, ctx = null, strokes = [], cur = null, color = COLORS[0], erasing = false, home = null, observer = null;

  function size() {
    const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d));
    ctx = cv.getContext("2d"); ctx.setTransform(d, 0, 0, d, 0, 0);
    redraw();
  }
  function drawStroke(s) {
    const pts = s.pts; if (!pts.length) return;
    ctx.save();
    ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
    ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineWidth = s.w; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], s.w / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const last = pts[pts.length - 1]; ctx.lineTo(last[0], last[1]); ctx.stroke(); ctx.restore();
  }
  function redraw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    strokes.forEach(drawStroke);
    if (cur) drawStroke(cur);
    $("scratchUndo").disabled = !strokes.length; $("scratchClear").disabled = !strokes.length;
  }
  function pt(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

  function bind() {
    cv = $("scratchCanvas");
    cv.addEventListener("pointerdown", function (e) {
      if (cur) return; // one finger at a time (ignores a resting palm)
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
      cur = { id: e.pointerId, erase: erasing, color: color, w: erasing ? 26 : 4, pts: [pt(e)] };
      redraw();
    });
    cv.addEventListener("pointermove", function (e) {
      if (!cur || e.pointerId !== cur.id) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      evs.forEach(function (ev) { cur.pts.push(pt(ev)); });
      redraw();
    });
    const end = function (e) {
      if (!cur || e.pointerId !== cur.id) return;
      strokes.push(cur); cur = null; redraw();
    };
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    $("scratchTools").addEventListener("click", function (e) {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.color) { color = b.dataset.color; erasing = false; }
      else if (b.id === "scratchErase") erasing = true;
      else if (b.id === "scratchUndo") { strokes.pop(); redraw(); }
      else if (b.id === "scratchClear") { strokes = []; redraw(); }
      syncTools();
    });
    $("scratchClose").addEventListener("click", close);
    window.addEventListener("resize", function () { if (!$("scratchSheet").hidden) size(); });
  }
  function syncTools() {
    document.querySelectorAll("#scratchTools [data-color]").forEach(function (b) {
      const on = !erasing && b.dataset.color === color; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
    });
    $("scratchErase").classList.toggle("on", erasing); $("scratchErase").setAttribute("aria-pressed", erasing);
  }

  /* o = { problem: () => text, answerEl, keypadEl } */
  function open(o) {
    cfg = o || {};
    $("scratchProblem").textContent = cfg.problem ? cfg.problem() : "";
    // borrow the game's keypad so the answer can be typed right here
    if (cfg.keypadEl) { home = { parent: cfg.keypadEl.parentNode, next: cfg.keypadEl.nextSibling }; $("scratchKeys").appendChild(cfg.keypadEl); }
    $("scratchKeys").hidden = !cfg.keypadEl;
    if (cfg.answerEl) {
      const sync = function () { $("scratchAnswer").textContent = cfg.answerEl.textContent; };
      sync(); observer = new MutationObserver(sync); observer.observe(cfg.answerEl, { childList: true, characterData: true, subtree: true });
    }
    $("scratchAnswer").hidden = !cfg.answerEl;
    $("scratchSheet").hidden = false; document.body.classList.add("sheet-lock", "scratch-open");
    syncTools();
    requestAnimationFrame(size);
  }
  function close() {
    if ($("scratchSheet").hidden) return;
    $("scratchSheet").hidden = true; document.body.classList.remove("sheet-lock", "scratch-open");
    if (observer) { observer.disconnect(); observer = null; }
    if (home && cfg.keypadEl) { home.parent.insertBefore(cfg.keypadEl, home.next); home = null; }
  }
  /* A fresh page (new problem). */
  function clear() { strokes = []; cur = null; redraw(); }
  function isOpen() { return !$("scratchSheet").hidden; }
  function refreshProblem() { if (isOpen() && cfg && cfg.problem) $("scratchProblem").textContent = cfg.problem(); }

  return { bind: bind, open: open, close: close, clear: clear, isOpen: isOpen, refreshProblem: refreshProblem, strokes: function () { return strokes.length; } };
})();
