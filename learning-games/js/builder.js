/* BUILD YOUR OWN FIGHTER — a drawn (SVG) character kids design themselves.
   The belt they wear is always the belt they've earned. */
window.BD = window.BD || {};

BD.Builder = (function () {
  const $ = function (id) { return document.getElementById(id); };

  const OPTIONS = {
    look: { label: "Champion", type: "chips", values: [["boy", "Boy"], ["girl", "Girl"]] },
    height: { label: "Height", type: "chips", values: [["short", "Short"], ["mid", "Medium"], ["tall", "Tall"]] },
    build: { label: "Build", type: "chips", values: [["slim", "Slim"], ["regular", "Regular"], ["strong", "Strong"]] },
    skin: { label: "Skin tone", type: "swatch", values: ["#FFE0C4", "#F6CBA3", "#E5AE84", "#C98B5E", "#9B6640", "#6E4429"] },
    hairStyle: { label: "Hairstyle", type: "chips", values: [["buzz", "Buzz"], ["short", "Short"], ["spiky", "Spiky"], ["curly", "Curly"], ["long", "Long"], ["ponytail", "Ponytail"], ["pigtails", "Pigtails"], ["bun", "Bun"]] },
    hair: { label: "Hair color", type: "swatch", values: ["#F2D27A", "#C89B5A", "#8A5A32", "#4A2E1B", "#1C1A1A", "#B5462A", "#5CBFC1", "#E58AC0"] },
    eyes: { label: "Eye color", type: "swatch", values: ["#6B3E1F", "#8E6B2E", "#3F8F4F", "#3C7BD9", "#7A8696"] },
    mouth: { label: "Smile", type: "chips", values: [["smile", "Smile"], ["grin", "Big grin"], ["focus", "Focused"]] },
    features: { label: "Face extras", type: "toggles", values: [["freckles", "Freckles"], ["glasses", "Glasses"], ["cheeks", "Rosy cheeks"]] },
    uniform: { label: "Uniform", type: "chips", values: [["black", "Black gi"], ["white", "White gi"], ["shirt", "Shorts + Engage shirt"]] }
  };
  const DEFAULT = { look: "boy", height: "mid", build: "regular", skin: "#F6CBA3", hairStyle: "short", hair: "#8A5A32", eyes: "#6B3E1F", mouth: "smile", features: { freckles: false, glasses: false, cheeks: true }, uniform: "black" };

  /* Only values the builder offers are kept (a save code can't inject anything). */
  function clean(cfg) {
    cfg = cfg && typeof cfg === "object" ? cfg : {};
    const c = Object.assign({}, DEFAULT);
    Object.keys(OPTIONS).forEach(function (key) {
      const o = OPTIONS[key];
      if (o.type === "toggles") return;
      const allowed = o.type === "swatch" ? o.values : o.values.map(function (v) { return v[0]; });
      if (allowed.indexOf(cfg[key]) !== -1) c[key] = cfg[key];
    });
    c.features = Object.assign({}, DEFAULT.features);
    const f = cfg.features && typeof cfg.features === "object" ? cfg.features : {};
    Object.keys(OPTIONS).forEach(function (key) {
      if (OPTIONS[key].type === "toggles") OPTIONS[key].values.forEach(function (v) { if (v[0] in f) c.features[v[0]] = !!f[v[0]]; });
    });
    return c;
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = function (v) { return Math.max(0, Math.min(255, Math.round(v * (1 + amt)))); };
    return "#" + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(function (v) { return v.toString(16).padStart(2, "0"); }).join("");
  }

  /* Draw the fighter. mode "full" = whole body, "face" = head portrait. */
  /* age: 0 = Pre-K/K, 1 = 1st–2nd, 2 = 3rd–5th, 3 = 6th–8th (younger = shorter, bigger head). */
  let clipN = 0;
  /* outfit: "gi" (their own uniform), "training", "sparring", "boxing" or "mma"
     — the same outfits the student characters wear, drawn to fit this body. */
  function svg(cfg, beltColor, mode, age, outfit) {
    const c = clean(cfg);
    let fit = ["training", "sparring", "boxing", "mma", "highrank"].indexOf(outfit) !== -1 ? outfit : "gi";
    const highRank = fit === "highrank";
    if (highRank) { fit = "gi"; c.uniform = "black"; } // black gi with a belt-colored collar
    if (fit !== "gi") c.uniform = fit === "sparring" ? "spar" : "shirt";
    const A = age === undefined || age === null ? 2 : Math.max(0, Math.min(3, age));
    const AB = [0.72, 0.84, 0.95, 1.06][A], AH = [1.1, 1.04, 1, 0.94][A], AW = [0.9, 0.95, 1, 1.04][A];
    const H = ({ short: 0.86, mid: 1, tall: 1.14 }[c.height] || 1) * AB;
    const B = ({ slim: 0.84, regular: 1, strong: 1.18 }[c.build] || 1) * AW;
    const skin = c.skin, skinD = shade(skin, -0.14), hair = c.hair, hairD = shade(hair, -0.25);
    const ink = "rgba(20,18,30,.35)";
    const th = 70 * H, lh = 74 * H, tw = 76 * B;
    const oy = 306 - (124 + th + lh + 10); // keep feet on the ground
    const tTop = 124, tBot = tTop + th, cx = 100;
    const gi = c.uniform === "white" ? "#F2F2F0" : "#1F1E26"; // spar: black pants
    const giEdge = highRank ? BD.collarColor(beltColor || "#3A3946") : c.uniform === "white" ? "#C9CBD3" : "#3A3946";
    const spar = c.uniform === "spar";
    const shirt = c.uniform === "shirt" || spar;
    const pants = !(c.uniform === "shirt");
    const top = shirt ? "#15151C" : gi;
    const legs = [], handsAt = [];
    let body = "", beltSvg = "";

    // legs / pants
    const legW = tw * 0.44, gap = 5;
    if (!pants) {
      const shortsH = lh * 0.42;
      body += '<path d="M' + (cx - tw * 0.48) + ' ' + (tBot - 4) + 'h' + (tw * 0.96) + 'l2 ' + shortsH + 'h' + (-(legW + 2)) + 'l-' + (gap / 2) + ' -' + (shortsH * 0.55) + 'l-' + (gap / 2) + ' ' + (shortsH * 0.55) + 'h' + (-(legW + 2)) + 'z" fill="#15151C" stroke="' + ink + '" stroke-width="2"/>';
      // white trim on the shorts
      body += '<path d="M' + (cx - tw * 0.48 - 1) + ' ' + (tBot + shortsH - 6) + 'h' + (legW + 3) + ' M' + (cx + tw * 0.48 + 1) + ' ' + (tBot + shortsH - 6) + 'h' + (-(legW + 3)) + '" stroke="#F2F2F0" stroke-width="2.5"/>';
      legs.push('<rect x="' + (cx - gap / 2 - legW * 0.78) + '" y="' + (tBot + shortsH - 4) + '" width="' + (legW * 0.62) + '" height="' + (lh - shortsH + 2) + '" rx="8" fill="' + skin + '" stroke="' + ink + '" stroke-width="2"/>');
      legs.push('<rect x="' + (cx + gap / 2 + legW * 0.16) + '" y="' + (tBot + shortsH - 4) + '" width="' + (legW * 0.62) + '" height="' + (lh - shortsH + 2) + '" rx="8" fill="' + skin + '" stroke="' + ink + '" stroke-width="2"/>');
    } else {
      legs.push('<path d="M' + (cx - tw * 0.48) + ' ' + (tBot - 6) + 'h' + (tw * 0.48 - gap / 2) + 'v' + (lh + 4) + 'h' + (-legW - 2) + 'z" fill="' + gi + '" stroke="' + ink + '" stroke-width="2"/>');
      legs.push('<path d="M' + (cx + gap / 2) + ' ' + (tBot - 6) + 'h' + (tw * 0.48 - gap / 2) + 'l2 ' + (lh + 4) + 'h' + (-legW - 2) + 'z" fill="' + gi + '" stroke="' + ink + '" stroke-width="2"/>');
    }
    // feet
    const fy = tBot + lh + 2;
    legs.push('<ellipse cx="' + (cx - gap / 2 - legW * 0.48) + '" cy="' + fy + '" rx="' + (legW * 0.5) + '" ry="7" fill="' + skin + '" stroke="' + ink + '" stroke-width="2"/>');
    legs.push('<ellipse cx="' + (cx + gap / 2 + legW * 0.48) + '" cy="' + fy + '" rx="' + (legW * 0.5) + '" ry="7" fill="' + skin + '" stroke="' + ink + '" stroke-width="2"/>');
    if (fit === "sparring") [-1, 1].forEach(function (side) {
      const fx = cx + side * (gap / 2 + legW * 0.48);
      legs.push('<path d="M' + (fx - legW * 0.5) + ' ' + (fy + 6) + 'v-16 q0 -6 6 -6 h' + (legW - 12) + ' q6 0 6 6 v16 z" fill="#17171D" stroke="' + ink + '" stroke-width="2"/>' +
        '<ellipse cx="' + fx + '" cy="' + (fy + 1) + '" rx="' + (legW * 0.56) + '" ry="8" fill="#17171D" stroke="' + ink + '" stroke-width="2"/>' +
        '<path d="M' + (fx - legW * 0.3) + ' ' + (fy - 6) + 'h' + (legW * 0.6) + '" stroke="#F2F2F0" stroke-width="2.5" stroke-linecap="round"/>');
    });
    body = legs.join("") + body;

    // arms (behind torso edges)
    const aw = 17 * B, ah = th * 0.98;
    [-1, 1].forEach(function (side) {
      const ax = side < 0 ? cx - tw / 2 - aw + 6 : cx + tw / 2 - 6;
      if (shirt) {
        body += '<rect x="' + ax + '" y="' + (tTop + 4) + '" width="' + aw + '" height="' + ah + '" rx="' + (aw / 2) + '" fill="' + skin + '" stroke="' + ink + '" stroke-width="2"/>';
        body += '<rect x="' + (ax - 2) + '" y="' + (tTop + 2) + '" width="' + (aw + 4) + '" height="' + (ah * 0.34) + '" rx="7" fill="' + top + '" stroke="' + ink + '" stroke-width="2"/>';
      } else {
        body += '<rect x="' + ax + '" y="' + (tTop + 4) + '" width="' + aw + '" height="' + (ah * 0.86) + '" rx="' + (aw / 2) + '" fill="' + gi + '" stroke="' + ink + '" stroke-width="2"/>';
      }
      body += '<circle cx="' + (ax + aw / 2) + '" cy="' + (tTop + ah * (shirt ? 0.98 : 0.88)) + '" r="' + (aw * 0.52) + '" fill="' + skin + '" stroke="' + ink + '" stroke-width="2"/>';
      handsAt.push([ax + aw / 2, tTop + ah * (shirt ? 0.98 : 0.88), side]);
    });

    // torso
    body += '<rect x="' + (cx - tw / 2) + '" y="' + tTop + '" width="' + tw + '" height="' + th + '" rx="16" fill="' + top + '" stroke="' + ink + '" stroke-width="2"/>';
    if (shirt) {
      body += '<path d="M' + (cx - 12) + ' ' + tTop + ' Q' + cx + ' ' + (tTop + 12) + ' ' + (cx + 12) + ' ' + tTop + '" fill="' + skin + '" stroke="' + ink + '" stroke-width="2"/>';
      if (spar) {
        body += '<rect x="' + (cx - tw * 0.42) + '" y="' + (tTop + 6) + '" width="' + (tw * 0.84) + '" height="' + (th * 0.7) + '" rx="14" fill="#1A1A21" stroke="#F2F2F0" stroke-width="2.5"/>' +
          '<path d="M' + (cx - tw * 0.3) + ' ' + (tTop + th * 0.42) + 'h' + (tw * 0.6) + '" stroke="rgba(255,255,255,.25)" stroke-width="2"/>';
        body += '<image href="img/engage-mark.webp" x="' + (cx - 14) + '" y="' + (tTop + th * 0.16) + '" width="28" height="16"/>';
      } else body += '<image href="img/engage-mark.webp" x="' + (cx + tw * 0.08) + '" y="' + (tTop + th * 0.18) + '" width="20" height="11"/>';
    } else {
      // crossed lapels
      body += '<path d="M' + (cx - 13) + ' ' + tTop + ' L' + (cx + 10) + ' ' + (tTop + th * 0.62) + '" stroke="' + giEdge + '" stroke-width="' + (highRank ? 7 : 5) + '" stroke-linecap="round"/>';
      body += '<path d="M' + (cx + 13) + ' ' + tTop + ' L' + (cx - 4) + ' ' + (tTop + th * 0.4) + '" stroke="' + giEdge + '" stroke-width="' + (highRank ? 7 : 5) + '" stroke-linecap="round"/>';
      body += '<path d="M' + (cx - 11) + ' ' + tTop + ' L' + cx + ' ' + (tTop + 13) + ' L' + (cx + 11) + ' ' + tTop + 'z" fill="' + skin + '"/>';
      body += '<image href="img/engage-mark.webp" x="' + (cx + tw * 0.12) + '" y="' + (tTop + 14) + '" width="17" height="10"/>';
    }
    if (c.uniform !== "shirt" || fit !== "gi") {
      // belt in the color they've earned (outfits wear it too, like the student characters)
      const bc = beltColor || "#FFFFFF";
      beltSvg = '<rect x="' + (cx - tw / 2 - 1) + '" y="' + (tBot - 16) + '" width="' + (tw + 2) + '" height="11" rx="3" fill="' + bc + '" stroke="' + ink + '" stroke-width="2"/>' +
        '<rect x="' + (cx - 7) + '" y="' + (tBot - 19) + '" width="14" height="16" rx="4" fill="' + bc + '" stroke="' + ink + '" stroke-width="2"/>' +
        '<path d="M' + (cx - 5) + ' ' + (tBot - 5) + 'l-8 26l8 1z M' + (cx + 5) + ' ' + (tBot - 5) + 'l8 25l-8 2z" fill="' + bc + '" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"/>';
      body += beltSvg;
    }
    // gloves
    if (fit !== "training" && fit !== "gi") handsAt.forEach(function (h) {
      const r = aw * (fit === "boxing" ? 0.95 : fit === "sparring" ? 0.78 : 0.66), x = h[0], y = h[1] + 2;
      body += '<rect x="' + (x - r * 0.62) + '" y="' + (y - r * 1.55) + '" width="' + (r * 1.24) + '" height="' + (r * 0.75) + '" rx="3" fill="#F2F2F0" stroke="' + ink + '" stroke-width="2"/>';
      if (fit === "mma") body += '<rect x="' + (x - r) + '" y="' + (y - r * 0.85) + '" width="' + (r * 2) + '" height="' + (r * 1.5) + '" rx="' + (r * 0.5) + '" fill="#18181E" stroke="' + ink + '" stroke-width="2"/>' +
        [-0.6, -0.2, 0.2, 0.6].map(function (k) { return '<rect x="' + (x + k * r - 2.4) + '" y="' + (y + r * 0.55) + '" width="4.8" height="' + (r * 0.55) + '" rx="2.4" fill="' + skin + '" stroke="' + ink + '" stroke-width="1.2"/>'; }).join("");
      else body += '<ellipse cx="' + x + '" cy="' + (y + r * 0.1) + '" rx="' + r + '" ry="' + (r * 1.12) + '" fill="#18181E" stroke="' + ink + '" stroke-width="2"/>' +
        '<path d="M' + (x - r * 0.5) + ' ' + (y - r * 0.4) + 'q' + (r * 0.5) + ' -' + (r * 0.35) + ' ' + r + ' 0" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/>';
    });
    // neck
    body += '<rect x="' + (cx - 9) + '" y="' + (tTop - 10) + '" width="18" height="16" rx="6" fill="' + skinD + '"/>';

    // ---- head ----
    const hx = cx, hy = 78;
    let back = "", front = "";
    const st = c.hairStyle;
    if (st === "long") back = '<path d="M50 74 Q50 22 100 22 Q150 22 150 74 L156 150 Q134 162 122 142 L78 142 Q66 162 44 150 Z" fill="' + hair + '" stroke="' + ink + '" stroke-width="2"/>';
    if (st === "ponytail") back = '<path d="M140 52 Q178 60 170 118 Q166 146 150 152 Q160 120 146 92 Z" fill="' + hair + '" stroke="' + ink + '" stroke-width="2"/><circle cx="146" cy="58" r="7" fill="#E0BA77"/>';
    if (st === "pigtails") back = '<ellipse cx="40" cy="104" rx="16" ry="30" fill="' + hair + '" stroke="' + ink + '" stroke-width="2"/><ellipse cx="160" cy="104" rx="16" ry="30" fill="' + hair + '" stroke="' + ink + '" stroke-width="2"/><circle cx="48" cy="78" r="6" fill="#E0BA77"/><circle cx="152" cy="78" r="6" fill="#E0BA77"/>';
    if (st === "bun") back = '<circle cx="100" cy="24" r="19" fill="' + hair + '" stroke="' + ink + '" stroke-width="2"/>';
    if (st === "curly") {
      [[56, 70], [60, 48], [76, 32], [100, 26], [124, 32], [140, 48], [144, 70], [52, 94], [148, 94]].forEach(function (p) {
        back += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="16" fill="' + hair + '" stroke="' + ink + '" stroke-width="2"/>';
      });
    }
    const ears = '<ellipse cx="54" cy="' + (hy + 6) + '" rx="8" ry="11" fill="' + skinD + '"/><ellipse cx="146" cy="' + (hy + 6) + '" rx="8" ry="11" fill="' + skinD + '"/>';
    const head = '<ellipse cx="' + hx + '" cy="' + hy + '" rx="46" ry="48" fill="' + skin + '" stroke="' + ink + '" stroke-width="2"/>';
    if (st === "buzz") front = '<path d="M55 72 Q56 30 100 30 Q144 30 145 72 Q138 50 100 47 Q62 50 55 72 Z" fill="' + hair + '" opacity=".85"/>';
    else if (st === "spiky") front = '<path d="M52 82 L50 50 L64 48 L64 24 L82 38 L90 12 L104 32 L120 14 L124 38 L142 28 L138 50 L150 54 L148 82 Q142 58 100 54 Q60 58 52 82 Z" fill="' + hair + '" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"/>';
    else if (st === "curly") front = '<path d="M56 74 Q58 40 100 38 Q142 40 144 74 Q132 56 116 60 Q100 50 84 60 Q68 56 56 74 Z" fill="' + hair + '"/>';
    else front = '<path d="M52 84 Q46 24 100 26 Q154 24 148 84 Q146 58 128 54 Q112 64 96 54 Q78 64 64 56 Q56 66 52 84 Z" fill="' + hair + '" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"/>';

    // face
    let face = "";
    face += '<path d="M72 66 q10 -6 20 0 M108 66 q10 -6 20 0" stroke="' + hairD + '" stroke-width="4" stroke-linecap="round" fill="none"/>';
    const girl = c.look === "girl";
    [82, 118].forEach(function (ex) {
      face += '<ellipse cx="' + ex + '" cy="84" rx="9" ry="10.5" fill="#fff"/>';
      face += '<circle cx="' + ex + '" cy="85" r="6.5" fill="' + c.eyes + '"/><circle cx="' + ex + '" cy="85" r="3.2" fill="#14121A"/><circle cx="' + (ex + 2.4) + '" cy="82" r="2" fill="#fff"/>';
      if (girl) { // eyelashes
        const out = ex < 100 ? -1 : 1;
        face += '<path d="M' + (ex - 9.5) + ' 82 Q' + ex + ' 70.5 ' + (ex + 9.5) + ' 82" stroke="#14121A" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
        face += '<path d="M' + (ex + out * 8) + ' 77 l' + (out * 5) + ' -4 M' + (ex + out * 9.5) + ' 81 l' + (out * 5.5) + ' -2" stroke="#14121A" stroke-width="2.2" stroke-linecap="round"/>';
      }
    });
    const lip = girl ? "#C2477A" : "#5A2A2E";
    face += '<path d="M97 96 q3 4 6 0" stroke="' + skinD + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
    if (c.mouth === "grin") face += '<path d="M85 104 Q100 124 115 104 Z" fill="#7A2B33" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"/><path d="M88 105 H112 L110 109 H90 Z" fill="#fff"/>';
    else if (c.mouth === "focus") face += '<path d="M89 108 Q100 110 112 104" stroke="' + lip + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    else face += '<path d="M87 104 Q100 115 113 104" stroke="' + lip + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    if (c.features.cheeks) face += '<ellipse cx="70" cy="100" rx="8" ry="5" fill="#FF8A8A" opacity=".45"/><ellipse cx="130" cy="100" rx="8" ry="5" fill="#FF8A8A" opacity=".45"/>';
    if (c.features.freckles) [[74, 94], [79, 98], [70, 98], [126, 94], [121, 98], [130, 98]].forEach(function (p) { face += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.6" fill="' + shade(skin, -0.38) + '"/>'; });
    if (c.features.glasses) face += '<g fill="rgba(255,255,255,.12)" stroke="#1B1B22" stroke-width="3.5"><circle cx="82" cy="84" r="13"/><circle cx="118" cy="84" r="13"/></g><path d="M95 83 h10 M69 82 l-14 -4 M131 82 l14 -4" stroke="#1B1B22" stroke-width="3.5" stroke-linecap="round"/>';

    if (fit === "sparring") {
      // padded headgear: covers the top, sides and chin, face open (big hair tucks in)
      if (["spiky", "curly", "bun"].indexOf(st) !== -1) { front = '<path d="M60 80 Q62 52 100 50 Q138 52 140 80 Q128 64 100 62 Q72 64 60 80 Z" fill="' + hair + '"/>'; if (st !== "curly") back = st === "bun" ? "" : back; else back = ""; }
      face += '<path fill-rule="evenodd" d="M100 22 C152 22 158 64 156 92 C154 124 136 140 100 142 C64 140 46 124 44 92 C42 64 48 22 100 22 Z M100 50 C132 50 142 70 142 92 C142 118 124 134 100 134 C76 134 58 118 58 92 C58 70 68 50 100 50 Z" fill="#18181E" stroke="' + ink + '" stroke-width="2"/>' +
        '<path d="M70 38 Q100 26 130 38" stroke="rgba(255,255,255,.3)" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<image href="img/engage-mark.webp" x="89" y="33" width="22" height="13"/>';
    }
    const headGroup = mode === "face" ? back + ears + head + front + face :
      '<g transform="translate(100 ' + hy + ') scale(' + AH + ') translate(-100 -' + hy + ')">' + back + ears + head + front + face + '</g>';
    if (mode === "face") {
      return '<svg viewBox="30 12 140 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Custom champion">' +
        '<rect x="30" y="12" width="140" height="140" fill="#24406A"/>' +
        '<g>' + body.replace(/<image[^>]*>/g, "") + '</g>' + headGroup + '</svg>';
    }
    const under = "", over = "", gTop = "", defs = "";
    return '<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Custom champion">' + defs +
      '<g transform="translate(0 ' + oy + ')">' + body + under + headGroup + over + gTop + '</g></svg>';
  }

  /* ---------- the builder sheet ---------- */
  let cfg = null, belt = null, onSave = null;
  function render() {
    const me = BD.Store.current();
    $("builderPreview").innerHTML = svg(cfg, belt, "full", me ? BD.Cast.ageBand(BD.Rank.dojoGrade(me)) : 2);
    $("builderOpts").innerHTML = Object.keys(OPTIONS).map(function (key) {
      const o = OPTIONS[key];
      let inner = "";
      if (o.type === "swatch") inner = o.values.map(function (v) {
        return '<button type="button" class="swatch' + (cfg[key] === v ? " on" : "") + '" data-key="' + key + '" data-val="' + v + '" style="--sw:' + v + '" aria-label="' + o.label + ' ' + v + '" aria-pressed="' + (cfg[key] === v) + '"></button>';
      }).join("");
      else if (o.type === "toggles") inner = o.values.map(function (v) {
        const on = !!cfg.features[v[0]];
        return '<button type="button" class="chip' + (on ? " on" : "") + '" data-key="features" data-val="' + v[0] + '" aria-pressed="' + on + '">' + v[1] + '</button>';
      }).join("");
      else inner = o.values.map(function (v) {
        return '<button type="button" class="chip' + (cfg[key] === v[0] ? " on" : "") + '" data-key="' + key + '" data-val="' + v[0] + '" aria-pressed="' + (cfg[key] === v[0]) + '">' + v[1] + '</button>';
      }).join("");
      return '<div class="opt-group"><p class="label">' + o.label + '</p><div class="chips">' + inner + '</div></div>';
    }).join("");
  }
  function open(startCfg, beltColor, save) {
    cfg = clean(startCfg); belt = beltColor; onSave = save;
    render();
    $("builderSheet").hidden = false; document.body.classList.add("sheet-lock");
  }
  function close() { $("builderSheet").hidden = true; document.body.classList.remove("sheet-lock"); }
  function random() {
    const pickV = function (o) { const v = o.values[Math.floor(Math.random() * o.values.length)]; return Array.isArray(v) ? v[0] : v; };
    ["look", "height", "build", "skin", "hairStyle", "hair", "eyes", "mouth", "uniform"].forEach(function (k) { cfg[k] = pickV(OPTIONS[k]); });
    cfg.features = { freckles: Math.random() < 0.35, glasses: Math.random() < 0.25, cheeks: Math.random() < 0.6 };
    render();
  }
  function bind() {
    $("builderOpts").addEventListener("click", function (e) {
      const b = e.target.closest("[data-key]"); if (!b) return;
      if (b.dataset.key === "features") cfg.features[b.dataset.val] = !cfg.features[b.dataset.val];
      else cfg[b.dataset.key] = b.dataset.val;
      // switching Boy/Girl suggests a matching hairstyle (they can still change it)
      if (b.dataset.key === "look" && b.dataset.val === "girl" && ["buzz", "short", "spiky"].indexOf(cfg.hairStyle) !== -1) cfg.hairStyle = "long";
      if (b.dataset.key === "look" && b.dataset.val === "boy" && ["long", "ponytail", "pigtails", "bun"].indexOf(cfg.hairStyle) !== -1) cfg.hairStyle = "short";
      BD.Sound.tap(); render();
    });
    $("builderRandom").addEventListener("click", random);
    $("builderClose").addEventListener("click", close);
    $("builderSheet").addEventListener("click", function (e) { if (e.target === $("builderSheet")) close(); });
    $("builderSave").addEventListener("click", function () { const c = cfg; close(); BD.Sound.right(); if (onSave) onSave(c); });
  }

  return { svg: svg, open: open, bind: bind, DEFAULT: DEFAULT, clean: clean };
})();
