/* GRADUATION CERTIFICATE — an Engage-branded certificate for each new belt,
   drawn on a canvas so parents can save, print or share it. */
window.BD = window.BD || {};

BD.Certificate = (function () {
  const W = 1600, H = 1130;
  const GOLD = "#E0BA77", GOLD_D = "#B08A4A", INK = "#F4F4F4", NAVY = "#0D1830";
  const DISPLAY = '"Montserrat", "Arial Black", sans-serif', BODY = '"Cabin", "Trebuchet MS", sans-serif';

  function load(src) {
    return new Promise(function (res) {
      const im = new Image();
      im.onload = function () { res(im); }; im.onerror = function () { res(null); };
      im.src = src;
    });
  }
  function svgSrc(svg) { return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); }

  /* The champion in the new belt: white-belt art, belt area tinted (same as on screen). */
  async function champion(p, beltColor) {
    const key = BD.UI.fighterKey(p);
    if (key === "custom") return load(svgSrc(BD.Builder.svg(p.custom, beltColor, "full")));
    const img = await load("img/wb-" + key + ".webp");
    const mask = await load(BD.MASKS && BD.MASKS[key] ? BD.MASKS[key] : "img/mask-" + key + ".png");
    if (!img) return null;
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    if (mask) {
      const m = document.createElement("canvas"); m.width = c.width; m.height = c.height;
      const mx = m.getContext("2d");
      mx.drawImage(mask, 0, 0, c.width, c.height);
      mx.globalCompositeOperation = "source-in"; mx.fillStyle = beltColor; mx.fillRect(0, 0, c.width, c.height);
      x.globalCompositeOperation = "multiply"; x.drawImage(m, 0, 0);
      x.globalCompositeOperation = "destination-in"; x.drawImage(img, 0, 0); // keep the original outline
    }
    return c;
  }

  function fitText(x, text, font, max, start) {
    let size = start;
    do { x.font = font.replace("{s}", size); size -= 4; } while (x.measureText(text).width > max && size > 20);
  }
  function fitDraw(x, img, cx, bottom, maxW, maxH) {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const s = Math.min(maxW / w, maxH / h);
    x.drawImage(img, cx - w * s / 2, bottom - h * s, w * s, h * s);
  }

  /* g = { to: belt, grade, mastered, date } */
  async function draw(p, g) {
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { /* ignore */ }
    const beltIdx = BD.BELTS.indexOf(g.to), belt = g.to;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d");

    // Background and gold frame
    const bg = x.createRadialGradient(W / 2, -100, 100, W / 2, H / 2, 1100);
    bg.addColorStop(0, "#2A4C7E"); bg.addColorStop(0.55, "#12223F"); bg.addColorStop(1, "#070D1C");
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const frame = x.createLinearGradient(0, 0, W, H);
    frame.addColorStop(0, GOLD); frame.addColorStop(0.5, "#F6DDA8"); frame.addColorStop(1, GOLD_D);
    x.strokeStyle = frame; x.lineWidth = 14; x.strokeRect(34, 34, W - 68, H - 68);
    x.lineWidth = 3; x.strokeRect(62, 62, W - 124, H - 124);

    const [logo, zumi, champ, beltImg] = await Promise.all([
      load("img/engage-logo.webp"), load("img/zumi.webp"), champion(p, belt.color),
      load(svgSrc(BD.Rank.beltSVG(beltIdx, g.mastered ? { math: true, reading: true, spelling: true, comprehension: true } : {})))
    ]);

    x.textAlign = "center"; x.textBaseline = "alphabetic";
    if (logo) fitDraw(x, logo, W / 2, 230, 150, 140);
    x.fillStyle = INK; x.font = "italic 900 92px " + DISPLAY; x.fillText("BRAIN DOJO", W / 2, 330);
    x.fillStyle = GOLD; x.font = "800 30px " + DISPLAY;
    x.fillText(g.mastered ? "C E R T I F I C A T E   O F   M A S T E R Y" : "C E R T I F I C A T E   O F   P R O M O T I O N", W / 2, 385);

    x.fillStyle = "#A3B4CE"; x.font = "600 36px " + BODY; x.fillText("This certifies that", W / 2, 465);
    x.fillStyle = INK; fitText(x, p.name, "italic 900 {s}px " + DISPLAY, 820, 120); x.fillText(p.name, W / 2, 580);
    x.strokeStyle = GOLD; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2 - 360, 610); x.lineTo(W / 2 + 360, 610); x.stroke();

    x.fillStyle = "#A3B4CE"; x.font = "600 36px " + BODY;
    x.fillText(g.mastered ? "earned every stripe on the Black Belt and mastered" : "has earned the rank of", W / 2, 652);
    const rank = g.mastered ? BD.gradeLabel(g.grade).toUpperCase() : belt.name.toUpperCase() + " BELT";
    fitText(x, rank, "italic 900 {s}px " + DISPLAY, 760, 96);
    x.lineWidth = 8; x.strokeStyle = beltIdx === 0 || beltIdx === 8 ? (beltIdx === 0 ? "#1A2C45" : GOLD) : "rgba(0,0,0,.35)";
    x.strokeText(rank, W / 2, 745);
    x.fillStyle = beltIdx === 8 ? "#17171C" : belt.color; x.fillText(rank, W / 2, 745);
    if (beltImg) fitDraw(x, beltImg, W / 2, 885, 360, 110);
    x.fillStyle = INK; x.font = "700 34px " + BODY;
    x.fillText(g.mastered ? "Brain Dojo by Engage" : BD.gradeLabel(g.grade) + " · Brain Dojo by Engage", W / 2, 930);

    // Champion left, Zumi right
    if (champ) fitDraw(x, champ, 250, 975, 300, 620);
    if (zumi) fitDraw(x, zumi, W - 250, 975, 260, 540);

    // Date and signatures
    const date = new Date(g.date || Date.now()).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    x.font = "700 28px " + BODY; x.fillStyle = INK;
    [[W / 2 - 290, BD.Cast.name("cd")], [W / 2 + 290, BD.Cast.name("michele")]].forEach(function (s) {
      x.strokeStyle = "rgba(224,186,119,.7)"; x.lineWidth = 2;
      x.beginPath(); x.moveTo(s[0] - 150, 975); x.lineTo(s[0] + 150, 975); x.stroke();
      x.fillText(s[1], s[0], 1010);
    });
    x.fillStyle = GOLD; x.font = "800 26px " + DISPLAY; x.fillText(date.toUpperCase(), W / 2, 1010);
    x.fillStyle = "#7F92B0"; x.font = "600 22px " + BODY; x.fillText("Engage Lifestyle Martial Arts", W / 2, 1045);
    return c;
  }

  function toBlob(c) {
    return new Promise(function (res, rej) {
      try { c.toBlob(function (b) { b ? res(b) : rej(new Error("no image")); }, "image/jpeg", 0.92); } catch (e) { rej(e); }
    });
  }

  /* Opens a sheet with the certificate and Save / Share buttons. */
  async function open(p, g) {
    BD.UI.sheet("Your certificate", '<p class="muted">Making your certificate…</p>');
    let blob;
    try { blob = await toBlob(await draw(p, g)); }
    catch (e) { BD.UI.sheet("Your certificate", '<p>Sorry, the certificate couldn\'t be made on this device.</p>'); return; }
    const url = URL.createObjectURL(blob);
    const name = "brain-dojo-" + p.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + "-" + (g.mastered ? "mastered-" + BD.gradeShort(g.grade).toLowerCase() : g.to.name.toLowerCase() + "-belt") + ".jpg";
    const file = typeof File === "function" ? new File([blob], name, { type: "image/jpeg" }) : null;
    const canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
    BD.UI.sheet("Your certificate",
      '<img class="cert-img" src="' + url + '" alt="Brain Dojo certificate for ' + BD.UI.esc(p.name) + '">' +
      '<div class="backup-actions"><button type="button" class="btn btn-primary" id="certSave">Save certificate</button>' +
      (canShare ? '<button type="button" class="btn btn-quiet" id="certShare">Share</button>' : '') + '</div>' +
      '<p class="muted small" id="certMsg" aria-live="polite">Save it to print, text it to family, or post it. Tag Engage!</p>');
    const msg = function (t) { document.getElementById("certMsg").textContent = t; };
    document.getElementById("certSave").addEventListener("click", async function () {
      let dl = null;
      if (window.claude && typeof window.claude.use === "function") { try { dl = await window.claude.use("downloads"); } catch (e) { dl = null; } }
      if (dl) {
        try { await dl.save({ filename: name, data: blob }); msg("Saved!"); }
        catch (e) { msg(e && e.code === "declined" ? "Not saved. Tap Save certificate to try again." : "Saving isn't available here. Press and hold the picture to save it."); }
        return;
      }
      try {
        const a = document.createElement("a"); a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        msg("Saved! If nothing downloaded, press and hold the picture to save it.");
      } catch (e) { msg("Press and hold the picture to save it."); }
    });
    if (canShare) document.getElementById("certShare").addEventListener("click", function () {
      navigator.share({ files: [file], title: p.name + " earned a new belt!", text: p.name + " just earned the " + (g.mastered ? BD.gradeLabel(g.grade) + " mastery" : g.to.name + " Belt") + " in Brain Dojo by Engage!" }).catch(function () { /* cancelled */ });
    });
  }

  return { draw: draw, open: open };
})();
