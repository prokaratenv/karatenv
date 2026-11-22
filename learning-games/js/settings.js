/* PARENT SETTINGS — a registry so features add their own settings to the
   Parents area without editing app.js.
   BD.Settings.add({ id, scope: "family" | "student", title, html: function (p) -> string,
                     bind: function (rootEl, p, rerender) }) */
window.BD = window.BD || {};

BD.Settings = (function () {
  const list = [];
  function add(s) { if (s && s.id && !list.some(function (x) { return x.id === s.id; })) list.push(s); }
  function section(s, p) {
    let body = ""; try { body = s.html(p) || ""; } catch (e) { body = ""; }
    if (!body) return "";
    return '<section class="set-sec" data-set="' + s.id + '"' + (p ? ' data-pid="' + p.id + '"' : '') + '><h4 class="label">' + BD.UI.esc(s.title) + '</h4>' + body + '</section>';
  }
  function familyHTML() { const h = list.filter(function (s) { return s.scope === "family"; }).map(function (s) { return section(s, null); }).join(""); return h ? '<div class="set-family">' + h + '</div>' : ""; }
  function studentHTML(p) { const h = list.filter(function (s) { return s.scope === "student"; }).map(function (s) { return section(s, p); }).join(""); return h ? '<div class="set-student">' + h + '</div>' : ""; }
  function bindAll(root) {
    if (!root) return;
    root.querySelectorAll(".set-sec").forEach(function (el) {
      const s = list.find(function (x) { return x.id === el.dataset.set; }); if (!s || !s.bind) return;
      const p = el.dataset.pid ? BD.Store.get(el.dataset.pid) : null;
      const rerender = function () { const tmp = document.createElement("div"); tmp.innerHTML = section(s, p); const n = tmp.firstChild; if (n) { el.replaceWith(n); bindOne(n, s, p); } };
      bindOne(el, s, p, rerender);
    });
  }
  function bindOne(el, s, p, rerender) { try { s.bind(el, p, rerender || function () {}); } catch (e) { if (window.console) console.error(e); } }
  BD.on("parentRendered", bindAll);
  return { add: add, familyHTML: familyHTML, studentHTML: studentHTML, list: list };
})();
