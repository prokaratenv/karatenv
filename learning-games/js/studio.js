/* CHAMPION STUDIO — kids build a 3D champion by choosing a look:
   skin tone, then hair style, then hair color, then extras. The Studio shows
   the 3D champions that match best (30 to choose from), and the one they pick
   wears their belt, stripes, gear, team E and outfits like the Engage kids.
   The drawn builder (BD.Builder) still works for anyone who prefers it. */
window.BD = window.BD || {};

BD.Studio = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const SKINS = ["#FFE0C4", "#F6CBA3", "#E5AE84", "#C98B5E", "#9B6640", "#6E4429"];
  const HAIR = [["any", "Any"], ["short", "Short"], ["buzz", "Buzz"], ["spiky", "Spiky"], ["curly", "Curly"], ["wavy", "Wavy"], ["long", "Long"], ["ponytail", "Ponytail"], ["braids", "Braids"], ["puffs", "Puffs"], ["locs", "Locs"], ["bun", "Bun"]];
  const COLORS = [["any", "Any", ""], ["black", "Black", "#1C1A1A"], ["brown", "Brown", "#6B4226"], ["blonde", "Blonde", "#E3B860"], ["red", "Red", "#B5462A"]];
  const EXTRAS = [["glasses", "Glasses"], ["hijab", "Hijab"], ["freckles", "Freckles"]];
  const NEAR = { curly: ["puffs", "locs"], puffs: ["curly"], locs: ["curly", "braids"], long: ["wavy", "ponytail"], wavy: ["long", "curly"], short: ["buzz", "spiky"], buzz: ["short"], spiky: ["short"], braids: ["ponytail", "locs"], ponytail: ["braids", "long", "bun"], bun: ["ponytail"] };

  let f = null, pick = null, belt = "#FFFFFF", onSave = null, all = false;

  /* How well a champion matches the choices (higher is better). */
  function score(s, q) {
    let n = 0; const d = Math.abs(s.skin - q.skin);
    n += d === 0 ? 3 : d === 1 ? 1.5 : d >= 3 ? -1.5 : 0;
    const hijab = q.extras.indexOf("hijab") !== -1, has = function (x) { return s.extras.indexOf(x) !== -1; };
    if (hijab) n += has("hijab") ? 6 : -3;
    else {
      if (has("hijab")) n -= 2;
      if (q.hair !== "any") n += s.hair === q.hair ? 3 : (NEAR[q.hair] || []).indexOf(s.hair) !== -1 ? 1 : 0;
      if (q.color !== "any") n += s.color === q.color ? 2 : 0;
    }
    ["glasses", "freckles"].forEach(function (x) { if (q.extras.indexOf(x) !== -1) n += has(x) ? 2.5 : 0; });
    return n;
  }
  function ranked() {
    return BD.Cast.STUDIO.map(function (s, i) { return { s: s, n: score(s, f) - i * 0.001 }; })
      .sort(function (a, b) { return b.n - a.n; }).map(function (x) { return x.s; });
  }
  /* Start from the student's current look: a Studio champion, or their drawn champion's choices. */
  function fromCurrent(p) {
    const q = { skin: 1, hair: "any", color: "any", extras: [] };
    const st = p && BD.Cast.STUDIO.find(function (s) { return s.key === p.avatar; });
    if (st) return { skin: st.skin, hair: st.hair === "covered" ? "any" : st.hair, color: st.color || "any", extras: st.extras.slice() };
    const c = p && p.custom;
    if (c) {
      const si = SKINS.indexOf(c.skin); if (si !== -1) q.skin = si;
      q.hair = { buzz: "buzz", short: "short", spiky: "spiky", curly: "curly", long: "long", ponytail: "ponytail", pigtails: "braids", bun: "bun" }[c.hairStyle] || "any";
      q.color = { "#F2D27A": "blonde", "#C89B5A": "blonde", "#8A5A32": "brown", "#4A2E1B": "brown", "#1C1A1A": "black", "#B5462A": "red" }[c.hair] || "any";
      if (c.features && c.features.glasses) q.extras.push("glasses");
      if (c.features && c.features.freckles) q.extras.push("freckles");
    }
    return q;
  }

  function render() {
    const list = ranked();
    if (!pick) pick = list[0].key;
    $("studioPreview").innerHTML = BD.UI.champArt(pick, belt, 3, "gi");
    const sw = SKINS.map(function (c, i) { return '<button type="button" class="swatch' + (f.skin === i ? " on" : "") + '" data-skin="' + i + '" style="--sw:' + c + '" aria-label="Skin tone ' + (i + 1) + '" aria-pressed="' + (f.skin === i) + '"></button>'; }).join("");
    const chips = function (opts, key, cur, off) {
      return opts.map(function (o) { return '<button type="button" class="chip' + (cur === o[0] ? " on" : "") + '" data-' + key + '="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '"' + (off ? " disabled" : "") + '>' + (o[2] ? '<i class="hair-dot" style="background:' + o[2] + '"></i>' : '') + o[1] + '</button>'; }).join("");
    };
    const hijab = f.extras.indexOf("hijab") !== -1;
    const ex = EXTRAS.map(function (o) { const on = f.extras.indexOf(o[0]) !== -1; return '<button type="button" class="chip' + (on ? " on" : "") + '" data-extra="' + o[0] + '" aria-pressed="' + on + '">' + o[1] + '</button>'; }).join("");
    const shown = all ? list : list.slice(0, 8);
    $("studioOpts").innerHTML =
      '<div class="opt-group"><p class="label">1. Skin tone</p><div class="chips">' + sw + '</div></div>' +
      '<div class="opt-group"><p class="label">2. Hair style</p><div class="chips">' + chips(HAIR, "hair", f.hair, hijab) + '</div></div>' +
      '<div class="opt-group"><p class="label">3. Hair color</p><div class="chips">' + chips(COLORS, "color", f.color, hijab) + '</div></div>' +
      '<div class="opt-group"><p class="label">4. Extras</p><div class="chips">' + ex + '</div></div>' +
      '<div class="opt-group"><p class="label">5. Pick your champion</p><div class="studio-grid">' + shown.map(function (s, i) {
        return '<button type="button" class="studio-pick' + (s.key === pick ? " on" : "") + '" data-pick="' + s.key + '" aria-pressed="' + (s.key === pick) + '" aria-label="Champion ' + (BD.Cast.STUDIO.indexOf(s) + 1) + (i === 0 ? ", best match" : "") + '"><img src="' + BD.Cast.face(s.key) + '" alt="" loading="lazy">' + (i === 0 ? '<span class="best">Best match</span>' : '') + '</button>';
      }).join("") + '</div>' + (all ? '' : '<button type="button" class="btn btn-quiet btn-small" id="studioAll">See all 30 champions</button>') + '</div>';
  }
  function open(p, beltColor, save) {
    f = fromCurrent(p); pick = p && BD.Cast.isStudio(p.avatar) ? p.avatar : null; all = false;
    belt = beltColor || "#FFFFFF"; onSave = save;
    render();
    $("studioSheet").hidden = false; document.body.classList.add("sheet-lock");
  }
  function close() { $("studioSheet").hidden = true; document.body.classList.remove("sheet-lock"); }
  function bind() {
    $("studioOpts").addEventListener("click", function (e) {
      const b = e.target.closest("button"); if (!b || b.disabled) return;
      const d = b.dataset;
      if (b.id === "studioAll") { all = true; render(); return; }
      if (d.pick) { pick = d.pick; BD.Sound.tap(); render(); return; }
      if (d.skin !== undefined) f.skin = Number(d.skin);
      else if (d.hair) f.hair = d.hair;
      else if (d.color) f.color = d.color;
      else if (d.extra) { const i = f.extras.indexOf(d.extra); if (i === -1) f.extras.push(d.extra); else f.extras.splice(i, 1); }
      else return;
      pick = null; // show the best match for the new choices
      BD.Sound.tap(); render();
    });
    $("studioClose").addEventListener("click", close);
    $("studioSheet").addEventListener("click", function (e) { if (e.target === $("studioSheet")) close(); });
    $("studioSave").addEventListener("click", function () { const k = pick; close(); BD.Sound.right(); if (onSave && k) onSave(k); });
    $("studioDraw").addEventListener("click", function () { close(); if (BD.UI.openBuilder) BD.UI.openBuilder(); });
  }
  return { open: open, bind: bind, score: score, SKINS: SKINS };
})();
