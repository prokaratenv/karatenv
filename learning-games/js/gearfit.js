/* GEAR ON THE CHAMPION — where each piece of gear sits on each character.
   FIT holds hand-checked spots per character art (fractions of the image):
   face box, hand centers, feet (center x, bottom, width) and the belt band.
   layers() turns equipped gear into image layers (same fractions), used by
   the home screen (HTML) and by certificates (canvas). */
window.BD = window.BD || {};

BD.GearFit = (function () {
  const FIT = {"kimmy-0": {"ar": 1.5638, "face": [0.24, 0.11, 0.76, 0.39], "hands": [[0.08, 0.27], [0.79, 0.68]], "feet": [[0.3375, 0.992, 0.1626], [0.6719, 0.992, 0.1687]], "belt": [0.3438, 0.588, 0.6562, 0.744]}, "kimmy-1": {"ar": 1.9048, "face": [0.29, 0.07, 0.76, 0.31], "hands": [[0.08, 0.24], [0.8, 0.62]], "feet": [[0.3032, 0.9934, 0.1687], [0.6937, 0.9934, 0.175]], "belt": [0.3563, 0.5016, 0.6625, 0.6459]}, "kimmy-2": {"ar": 2.2619, "face": [0.33, 0.07, 0.68, 0.24], "hands": [[0.12, 0.2], [0.82, 0.62]], "feet": [[0.2969, 0.9972, 0.1813], [0.7688, 0.9972, 0.1875]], "belt": [0.3937, 0.4448, 0.7063, 0.6077]}, "kimmy-3": {"ar": 2.5166, "face": [0.36, 0.04, 0.66, 0.2], "hands": [[0.1, 0.17], [0.9, 0.57]], "feet": [[0.3125, 0.9926, 0.1874], [0.7843, 0.9926, 0.1937]], "belt": [0.4, 0.4144, 0.7438, 0.5931]}, "tommy-0": {"ar": 2.2157, "face": [0.25, 0.08, 0.82, 0.31], "hands": [[0.14, 0.35], [0.88, 0.57]], "feet": [[0.2438, 0.9972, 0.225], [0.7593, 0.9972, 0.2437]], "belt": [0.275, 0.5634, 0.7562, 0.6197]}, "tommy-1": {"ar": 2.5939, "face": [0.28, 0.06, 0.75, 0.24], "hands": [[0.17, 0.31], [0.78, 0.5]], "feet": [[0.2156, 0.9976, 0.2188], [0.7719, 0.9976, 0.2438]], "belt": [0.2812, 0.4867, 0.725, 0.653]}, "tommy-2": {"ar": 2.7941, "face": [0.3, 0.05, 0.68, 0.2], "hands": [[0.17, 0.26], [0.75, 0.47]], "feet": [[0.1937, 1.0, 0.2125], [0.7782, 0.9978, 0.2313]], "belt": [0.2812, 0.4273, 0.7, 0.6063]}, "tommy-3": {"ar": 2.8358, "face": [0.3, 0.04, 0.68, 0.18], "hands": [[0.2, 0.26], [0.78, 0.44]], "feet": [[0.175, 1.0, 0.225], [0.7562, 0.9956, 0.2375]], "belt": [0.2687, 0.4317, 0.6813, 0.4714]}, "mackenzie-0": {"ar": 2.31, "face": [0.27, 0.1, 0.78, 0.33], "hands": [[0.07, 0.66], [0.93, 0.66]], "feet": [[0.1875, 0.9946, 0.2375], [0.7688, 0.9946, 0.2375]], "belt": [0.2313, 0.5405, 0.75, 0.7541]}, "mackenzie-1": {"ar": 2.4437, "face": [0.3, 0.07, 0.68, 0.24], "hands": [[0.08, 0.56], [0.88, 0.56]], "feet": [[0.1094, 0.9949, 0.2188], [0.8813, 0.9949, 0.225]], "belt": [0.2313, 0.4118, 0.6937, 0.6113]}, "mackenzie-2": {"ar": 2.8358, "face": [0.32, 0.06, 0.68, 0.22], "hands": [[0.12, 0.55], [0.88, 0.55]], "feet": [[0.1157, 0.9956, 0.2187], [0.8938, 0.9934, 0.2125]], "belt": [0.2437, 0.3855, 0.6875, 0.5815]}, "mackenzie-3": {"ar": 2.7046, "face": [0.33, 0.05, 0.67, 0.2], "hands": [[0.15, 0.53], [0.85, 0.53]], "feet": [[0.1157, 0.9977, 0.2313], [0.8968, 1.0, 0.2063]], "belt": [0.25, 0.3741, 0.6937, 0.5704]}, "rylan-0": {"ar": 2.4204, "face": [0.2, 0.17, 0.82, 0.4], "hands": [[0.13, 0.67], [0.87, 0.67]], "feet": [[0.1719, 0.9871, 0.2937], [0.8031, 0.9922, 0.2938]], "belt": [0.2875, 0.5685, 0.7438, 0.7778]}, "rylan-1": {"ar": 2.7338, "face": [0.28, 0.1, 0.72, 0.27], "hands": [[0.12, 0.57], [0.88, 0.57]], "feet": [[0.1375, 0.9977, 0.2624], [0.8532, 0.9931, 0.2813]], "belt": [0.3125, 0.4485, 0.7188, 0.6453]}, "rylan-2": {"ar": 3.004, "face": [0.3, 0.08, 0.7, 0.23], "hands": [[0.1, 0.56], [0.9, 0.56]], "feet": [[0.1313, 0.9938, 0.2625], [0.8532, 0.9958, 0.2813]], "belt": [0.3063, 0.4116, 0.7125, 0.6112]}, "rylan-3": {"ar": 3.0645, "face": [0.32, 0.04, 0.68, 0.17], "hands": [[0.12, 0.55], [0.88, 0.55]], "feet": [[0.1344, 0.9918, 0.2562], [0.8532, 0.9898, 0.2813]], "belt": [0.3125, 0.4102, 0.7375, 0.6082]}, "cd": {"ar": 3.004, "face": [0.25, 0.05, 0.73, 0.26], "hands": [[0.2, 0.35], [0.78, 0.37]], "feet": [[0.2625, 0.9667, 0.3], [0.8218, 0.9979, 0.1813]], "belt": [0.2562, 0.499, 0.8063, 0.5343]}, "michele": {"ar": 2.2619, "face": [0.38, 0.04, 0.65, 0.2], "hands": [[0.08, 0.19], [0.67, 0.45]], "feet": [[0.2406, 0.9862, 0.2438], [0.7875, 0.9972, 0.15]], "belt": [0.3125, 0.4116, 0.6813, 0.4503]}, "bridgette": {"ar": 3.3188, "face": [0.33, 0.05, 0.68, 0.2], "hands": [[0.2, 0.34], [0.75, 0.34]], "feet": [[0.1656, 0.9699, 0.2938], [0.8249, 0.9981, 0.1875]], "belt": [0.2188, 0.4181, 0.725, 0.4482]}, "kyra": {"ar": 3.0769, "face": [0.32, 0.06, 0.68, 0.2], "hands": [[0.08, 0.55], [0.92, 0.55]], "feet": [[0.1843, 0.9858, 0.2937], [0.8187, 0.998, 0.1875]], "belt": [0.2062, 0.437, 0.7688, 0.4736]}, "lauryn": {"ar": 2.1777, "face": [0.36, 0.04, 0.62, 0.2], "hands": [[0.08, 0.55], [0.9, 0.56]], "feet": [[0.2875, 0.9684, 0.225], [0.7125, 1.0, 0.125]], "belt": [0.3063, 0.408, 0.6438, 0.4483]}, "zumi": {"ar": 1.9192, "face": [0.25, 0.12, 0.75, 0.38], "hands": [[0.06, 0.64], [0.93, 0.64]], "feet": [[0.3468, 0.9772, 0.0563], [0.7188, 0.9772, 0.0875]], "belt": [0.3375, 0.5537, 0.7312, 0.7101]}, "billy-0": {"ar": 2.6117, "face": [0.22, 0.12, 0.86, 0.36], "hands": [[0.08, 0.69], [0.92, 0.69]], "feet": [[0.2594, 0.9928, 0.2562], [0.7656, 0.9928, 0.2688]], "belt": [0.3, 0.5574, 0.75, 0.7368]}, "billy-1": {"ar": 2.9921, "face": [0.3, 0.1, 0.72, 0.27], "hands": [[0.1, 0.61], [0.9, 0.61]], "feet": [[0.2062, 0.9937, 0.2875], [0.7844, 0.9937, 0.2812]], "belt": [0.275, 0.4781, 0.725, 0.6326]}, "billy-2": {"ar": 3.2203, "face": [0.32, 0.1, 0.7, 0.24], "hands": [[0.1, 0.58], [0.9, 0.58]], "feet": [[0.1875, 0.9942, 0.275], [0.8031, 0.9942, 0.2812]], "belt": [0.2938, 0.4563, 0.7312, 0.6252]}, "billy-3": {"ar": 3.0159, "face": [0.33, 0.08, 0.68, 0.21], "hands": [[0.1, 0.58], [0.92, 0.58]], "feet": [[0.2063, 0.9938, 0.2625], [0.7937, 0.9959, 0.2751]], "belt": [0.2938, 0.4493, 0.7125, 0.4845]}};
  const ASPECT = {"headgear": 1.1111, "sparring": 1.4876, "boxing": 1.3953, "boots": 2.0455, "chest": 1.2245, "shirt": 1.0435, "shorts": 0.8611, "mouthguard": 0.4222, "mma": 1.5929}; // sprite height / width
  const HANDS = ["mma", "boxing", "sparring"]; // only one pair at a time
  const SRC = function (g) { return "img/worn-" + g + ".webp"; };

  /* Returns { under: [...], over: [...], redrawBelt, faceClip } — layers are
     { src, l, t, w, h, flip } in fractions of the art's box. */
  function layers(key, gear) {
    const f = FIT[key]; if (!f || !gear || !gear.length) return null;
    const has = function (g) { return gear.indexOf(g) !== -1; };
    const ar = f.ar, b = f.belt, bw = b[2] - b[0], bcx = (b[0] + b[2]) / 2;
    const fx0 = f.face[0], fy0 = f.face[1], fx1 = f.face[2], fy1 = f.face[3], fw = fx1 - fx0, fh = fy1 - fy0, fcx = (fx0 + fx1) / 2;
    const hOf = function (g, w) { return w * ASPECT[g] / ar; };
    const L = [];
    let redrawBelt = false;
    if (has("shorts")) {
      const w = bw * 1.28, t = b[3] - (b[3] - b[1]) * 0.35;
      L.push({ src: SRC("shorts"), l: bcx - w / 2, t: t, w: w, h: Math.max(0.08, (0.97 - t) * 0.42) }); redrawBelt = true;
    }
    if (has("shirt")) {
      const w = bw * 1.8, t = fy1 + 0.005, bot = b[1] + (b[3] - b[1]) * 0.6;
      L.push({ src: SRC("shirt"), l: bcx - w / 2, t: t, w: w, h: bot - t }); redrawBelt = true;
    }
    if (has("chest")) {
      const w = bw * 1.22, t = fy1 + 0.03, bot = b[1] + (b[3] - b[1]) * 0.5;
      L.push({ src: SRC("chest"), l: bcx - w / 2, t: t, w: w, h: bot - t }); redrawBelt = true;
    }
    const over = [];
    if (has("boots")) (f.feet || []).forEach(function (ft, i) {
      const w = ft[2] * 1.12, h = Math.min(hOf("boots", w), 0.16);
      over.push({ src: SRC("boots"), l: ft[0] - w / 2, t: ft[1] - h * 0.97, w: w, h: h, flip: i === 0 });
    });
    const glove = HANDS.find(has);
    if (glove) f.hands.forEach(function (hd) {
      const w = bw * 0.46, h = hOf(glove, w);
      over.push({ src: SRC(glove), l: hd[0] - w / 2, t: hd[1] - h / 2, w: w, h: h, flip: hd[0] < 0.5 });
    });
    let faceClip = null;
    if (has("headgear")) {
      const w = fw * 1.66, h = hOf("headgear", w);
      over.push({ src: SRC("headgear"), l: fcx - w / 2, t: fy0 - h * 0.40, w: w, h: h });
      faceClip = { cx: fcx, cy: fy0 + fh * 0.53, rx: fw * 0.5, ry: fh * 0.53 };
    }
    const top = [];
    if (has("mouthguard")) {
      // clipped to the belt at the hip (in the mouth it just looks like black teeth)
      const w = bw * 0.5, h = w / ar;
      top.push({ src: "img/gear-mouthguard.webp", l: b[2] - w * 0.45, t: b[1] + (b[3] - b[1]) * 0.15, w: w, h: h, cls: "mg" });
    }
    return { under: L, over: over, top: top, redrawBelt: redrawBelt, faceClip: faceClip };
  }

  /* Hand gear swaps: wearing one pair takes the others off. */
  function handSlot(g) { return HANDS.indexOf(g) !== -1; }

  return { FIT: FIT, ASPECT: ASPECT, HANDS: HANDS, layers: layers, handSlot: handSlot, has: function (k) { return !!FIT[k]; } };
})();
