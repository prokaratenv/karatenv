/* FEEL — short phone vibrations for big moments (right answers, stripe and
   part passes, graduation, fist bumps). On by default; a family setting turns
   it off for this device. Separate from sound: muting sound keeps vibration
   and the other way round. Only phones that support it buzz (most Android). */
window.BD = window.BD || {};

BD.Feel = (function () {
  const PATTERNS = { tap: 12, right: 18, bump: 25, pass: [30, 60, 30], big: [40, 70, 40, 70, 90] };
  function on() { try { return !(BD.Prefs && BD.Prefs.get().vib === false); } catch (e) { return true; } }
  function buzz(kind) {
    if (!on() || !navigator.vibrate) return false;
    try { navigator.vibrate(PATTERNS[kind] || PATTERNS.tap); return true; } catch (e) { return false; }
  }
  /* Ride along with the existing sounds so every game gets it for free. */
  function wrap() {
    const S = BD.Sound; if (!S || S.__felt) return;
    const right = S.right, belt = S.belt;
    if (right) S.right = function () { buzz("right"); return right.apply(this, arguments); };
    if (belt) S.belt = function () { buzz("big"); return belt.apply(this, arguments); };
    S.__felt = true;
  }
  wrap();
  /* Stripe test parts and stripes passed: a double buzz. */
  if (BD.on) BD.on("screen", function (id) {
    if (id !== "screen-stripe") return;
    setTimeout(function () { const t = document.getElementById("stripeTitle"); if (t && !/not yet/i.test(t.textContent)) buzz("pass"); }, 60);
  });
  if (BD.Settings) BD.Settings.add({
    id: "vibration", scope: "family", title: "Vibration (this device)",
    html: function () {
      const p = BD.Prefs ? BD.Prefs.get() : {};
      return '<p class="muted small">A short buzz on right answers, stripes and graduations. Works on most Android phones.</p>' +
        '<div class="set-row"><label class="set-check"><input type="checkbox" data-vib' + (p.vib === false ? "" : " checked") + '> Vibration on</label></div>';
    },
    bind: function (el) {
      el.querySelector("[data-vib]").onchange = function () { const v = BD.Prefs.get(); v.vib = this.checked; BD.Prefs.set(v); if (this.checked) buzz("tap"); };
    }
  });
  return { buzz: buzz, on: on, PATTERNS: PATTERNS };
})();
