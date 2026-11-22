/* EASY-READ OPTIONS — text size and an easy-read font, for every student on
   this device. Kept in this browser only (localStorage). */
window.BD = window.BD || {};

BD.Prefs = (function () {
  const KEY = "brainDojo.prefs";
  const SIZES = [["normal", "Normal"], ["large", "Large"], ["xl", "Extra large"]];
  function get() { try { return Object.assign({ size: "normal", font: false }, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { return { size: "normal", font: false }; } }
  function set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode: just this visit */ } apply(v); }
  let fontLoaded = false;
  function apply(v) {
    v = v || get();
    const root = document.documentElement;
    root.classList.toggle("text-large", v.size === "large");
    root.classList.toggle("text-xl", v.size === "xl");
    root.classList.toggle("easy-font", !!v.font);
    if (v.font && !fontLoaded) {
      fontLoaded = true;
      const l = document.createElement("link"); l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap";
      document.head.appendChild(l);
    }
  }
  if (BD.Settings) BD.Settings.add({
    id: "prefs", scope: "family", title: "Easy-read options (this device)",
    html: function () {
      const v = get();
      return '<p class="muted small">Bigger text and a font designed for early and struggling readers (including dyslexia).</p><div class="set-row">' +
        '<label>Text size <select data-size>' + SIZES.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === v.size ? " selected" : "") + '>' + s[1] + '</option>'; }).join("") + '</select></label>' +
        '<label class="set-check"><input type="checkbox" data-font' + (v.font ? " checked" : "") + '> Easy-read font</label></div>';
    },
    bind: function (el) {
      el.querySelector("[data-size]").onchange = function () { const v = get(); v.size = this.value; set(v); };
      el.querySelector("[data-font]").onchange = function () { const v = get(); v.font = this.checked; set(v); };
    }
  });
  apply();
  return { get: get, set: set, apply: apply };
})();
