/* HOLIDAY THEME: snowflakes, twinkling lights, snow caps and a festive greeting.

   HOW TO TURN IT OFF (owner):
   - Set on: false below (one switch turns off everything), or
   - delete the <script src="js/holiday.js"> tag in index.html.
   It also turns itself off after the "to" date (local device date), with no
   code change: from 2027-01-01 nothing runs.

   Parents can turn it off on one device in Parents ("Holiday decorations").
   Every holiday visual lives under the html.holiday class or in elements this
   file creates (#holSnow, .hol-lights, .hol-sub), so turning off removes all
   of it at once: no leftover DOM, timers or animation frames. */
window.BD = window.BD || {};

BD.HOLIDAY = { on: true, from: "2026-11-28", to: "2026-12-31" };

BD.Holiday = (function () {
  const KEY = "brainDojo.holiday";
  const SNOW_SCREENS = /^screen-(home|players|results|parent|stripe|grad)$/; // never during questions
  const COLORS = ["#E53935", "#2E9E4F", "#E0BA77", "#FFFFFF", "#C62828", "#43A047"];
  let canvas = null, raf = 0, flakes = [], last = 0, screen = "", applied = false;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dayStr(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  /* In season by the owner switch and the device's local date. */
  function inSeason(d) {
    const H = BD.HOLIDAY; if (!H || !H.on) return false;
    const s = dayStr(d || new Date());
    return s >= H.from && s <= H.to;
  }
  function userOff() { try { return localStorage.getItem(KEY) === "off"; } catch (e) { return false; } }
  function active() { return inSeason() && !userOff(); }
  function reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  const esc = function (s) { return BD.UI && BD.UI.esc ? BD.UI.esc(s) : String(s); };

  /* ---------- snow: one canvas, about 40 flakes, about 30 fps ---------- */
  function makeFlakes() {
    const W = innerWidth, H = innerHeight, n = W < 500 ? 32 : 44;
    flakes = [];
    for (let i = 0; i < n; i++) flakes.push({ x: Math.random() * W, y: Math.random() * H, r: 1.2 + Math.random() * 2.8, s: 0.35 + Math.random() * 0.9, d: Math.random() * 6.28, a: 0.45 + Math.random() * 0.45 });
  }
  function draw() {
    if (!canvas) return;
    const g = canvas.getContext("2d"); g.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < flakes.length; i++) { const f = flakes[i]; g.globalAlpha = f.a; g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.283); g.fill(); }
    g.globalAlpha = 1;
  }
  function step(t) {
    raf = 0;
    if (!canvas || !snowWanted()) return;
    if (t - last >= 33) {
      last = t;
      const W = canvas.width, H = canvas.height;
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i]; f.y += f.s; f.d += 0.01; f.x += Math.sin(f.d) * 0.35;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
      }
      draw();
    }
    raf = requestAnimationFrame(step);
  }
  function snowWanted() { return applied && SNOW_SCREENS.test(screen || "screen-home") && document.visibilityState !== "hidden"; }
  function sizeCanvas() { if (!canvas) return; canvas.width = innerWidth; canvas.height = innerHeight; const g = canvas.getContext("2d"); g.fillStyle = "#FFFFFF"; }
  function startSnow() {
    if (!canvas) {
      canvas = document.createElement("canvas"); canvas.id = "holSnow"; canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas); sizeCanvas(); makeFlakes();
    }
    canvas.hidden = !SNOW_SCREENS.test(screen || "screen-home");
    if (reduced()) { draw(); return; } // a still sprinkle of snow, no motion
    if (!raf && snowWanted()) raf = requestAnimationFrame(step);
  }
  function stopSnow() { if (raf) cancelAnimationFrame(raf); raf = 0; if (canvas) canvas.remove(); canvas = null; flakes = []; }

  /* ---------- lights and greeting ---------- */
  function lights() {
    const bar = document.querySelector(".topbar"); if (!bar || bar.querySelector(".hol-lights")) return;
    const el = document.createElement("div"); el.className = "hol-lights"; el.setAttribute("aria-hidden", "true");
    let h = ""; for (let i = 0; i < 18; i++) h += '<i style="--c:' + COLORS[i % 4] + ';--d:' + (i % 3) * 0.4 + 's"></i>';
    el.innerHTML = h; bar.appendChild(el);
  }
  const HOLLY = '<svg class="hol-holly" viewBox="0 0 40 24" width="28" height="17" aria-hidden="true"><path d="M20 12c-4-7-11-8-16-6 3 2 3 6 1 8 4-1 9 0 15-2z" fill="#2E9E4F"/><path d="M20 12c4-7 11-8 16-6-3 2-3 6-1 8-4-1-9 0-15-2z" fill="#43A047"/><circle cx="17" cy="14" r="3" fill="#E53935"/><circle cx="23" cy="14" r="3" fill="#C62828"/><circle cx="20" cy="17" r="3" fill="#E53935"/></svg>';
  function greet(p) {
    if (!applied || !p) return;
    const h = document.getElementById("homeHello");
    if (h && !h.querySelector(".hol-sub")) h.innerHTML = "Merry Christmas, " + esc(p.name) + "!" + '<span class="hol-sub">' + HOLLY + 'Keep training this holiday season.</span>';
    const lh = document.querySelector(".lh-hi");
    if (lh && !lh.dataset.hol) { lh.dataset.hol = "1"; lh.textContent = "Happy holidays, " + p.name + "!"; }
  }

  /* ---------- on / off ---------- */
  function on() {
    applied = true;
    document.documentElement.classList.add("holiday");
    lights(); startSnow();
    const p = BD.Store && BD.Store.current(); if (p) greet(p);
  }
  function off() {
    const was = applied;
    applied = false;
    document.documentElement.classList.remove("holiday");
    stopSnow();
    document.querySelectorAll(".hol-lights, .hol-sub").forEach(function (e) { e.remove(); });
    document.querySelectorAll(".lh-hi[data-hol]").forEach(function (e) { delete e.dataset.hol; });
    // put the everyday greeting back right away
    if (was && BD.UI && BD.UI.home && BD.Store && BD.Store.current() && document.getElementById("screen-home") && !document.getElementById("screen-home").hidden) BD.UI.home();
  }
  function apply() { if (active()) on(); else off(); }

  /* ---------- hooks ---------- */
  if (BD.on) {
    BD.on("screen", function (id) { screen = id; if (!applied) return; startSnow(); });
    BD.on("home", function (p) { if (applied) { greet(p); setTimeout(function () { greet(p); }, 0); } });
  }
  document.addEventListener("visibilitychange", function () { if (applied && document.visibilityState === "visible") startSnow(); });
  window.addEventListener("resize", function () { if (canvas) { sizeCanvas(); makeFlakes(); if (reduced()) draw(); } });

  /* Parents: a per-device switch, shown only while in season. */
  function addSetting() {
    if (!BD.Settings || addSetting.done) return; addSetting.done = true;
    BD.Settings.add({
      id: "holiday", scope: "family", title: "Holiday decorations",
      html: function () {
        if (!inSeason()) return "";
        return '<label class="sound-row"><span><strong>Holiday decorations (this device)</strong><span class="muted small">Snowflakes, lights and a holiday greeting through December 31.</span></span>' +
          '<input type="checkbox" class="switch" data-hol-on' + (userOff() ? "" : " checked") + '></label>';
      },
      bind: function (el) {
        const c = el.querySelector("[data-hol-on]"); if (!c) return;
        c.addEventListener("change", function () { try { if (c.checked) localStorage.removeItem(KEY); else localStorage.setItem(KEY, "off"); } catch (e) {} apply(); });
      }
    });
  }
  function boot() { addSetting(); apply(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  return { active: function () { return applied; }, inSeason: inSeason, apply: apply, colors: function () { return COLORS; } };
})();
