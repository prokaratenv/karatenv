/* LITTLE CHAMPIONS — extra fun for Pre-K to 2nd grade, and the Sticker Book
   for everyone.
   - young(grade): Pre-K, K, 1st and 2nd grade get shorter rounds, picture
     answers in Math Dojo and a celebration after every right answer.
   - celebrate(el): a burst of stars and a cheer (spoken for the youngest).
   - Sticker Book: every finished round, boss match, tournament or team
     lesson adds a sticker. Collect all 48; extras become shiny. */
window.BD = window.BD || {};

BD.Kid = (function () {
  const esc = function (s) { return BD.UI.esc(s); };
  function young(grade) { return Number(grade) <= 2; }

  /* ---------- a cheer after every right answer ---------- */
  const PRAISE = ["Hi-ya!", "Awesome!", "You got it!", "Super kick!", "Great job!", "Yes!", "Way to go!", "Boom!", "Nice!", "Osu!"];
  const BURST = ["⭐", "✨", "🌟", "💥", "🥋", "🎉"];
  function celebrate(el, grade) {
    const box = el && el.getBoundingClientRect ? el.getBoundingClientRect() : { left: innerWidth / 2 - 40, top: innerHeight / 2, width: 80, height: 40 };
    const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    const word = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    const w = document.createElement("span"); w.className = "kid-praise"; w.textContent = word;
    w.style.left = cx + "px"; w.style.top = cy + "px"; document.body.appendChild(w);
    setTimeout(function () { w.remove(); }, 1200);
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("span"); s.className = "kid-star"; s.textContent = BURST[i % BURST.length];
      const a = (i / 8) * Math.PI * 2, d = 60 + Math.random() * 50;
      s.style.left = cx + "px"; s.style.top = cy + "px";
      s.style.setProperty("--dx", Math.round(Math.cos(a) * d) + "px"); s.style.setProperty("--dy", Math.round(Math.sin(a) * d) + "px");
      document.body.appendChild(s); setTimeout(function () { s.remove(); }, 900);
    }
    if (BD.Mini && BD.Mini.react) BD.Mini.react("right");
    if (grade !== undefined && BD.ReadAloud && BD.ReadAloud.auto(grade) && !(BD.Store && BD.Store.muted)) BD.Speech.say(word, "en-US", 1);
  }

  /* ---------- counting pictures (Math Dojo for Pre-K to 2nd) ---------- */
  const THINGS = ["🍎", "⭐", "🐟", "🍪", "🎈", "🦆", "🐞", "🍓", "⚽", "🌸", "🐢", "🥋"];
  function thing() { return THINGS[Math.floor(Math.random() * THINGS.length)]; }
  const NUM_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
  /* Tapping a picture makes it bounce and counts it out loud. */
  function bindCount(box) {
    let n = 0;
    box.onclick = function (e) {
      const t = e.target.closest(".count-it"); if (!t) return;
      if (!t.classList.contains("counted")) { n++; t.classList.add("counted"); t.dataset.n = n; }
      t.classList.remove("bounce"); void t.offsetWidth; t.classList.add("bounce");
      BD.Sound.tap();
      if (!(BD.Store && BD.Store.muted)) BD.Speech.say(NUM_WORDS[Number(t.dataset.n)] || t.dataset.n, "en-US", 1.1);
    };
  }

  /* ---------- Sticker Book ---------- */
  const STICKERS = [
    ["dragon", "🐉", "Dragon"], ["tiger", "🐯", "Tiger"], ["panda", "🐼", "Panda"], ["fox", "🦊", "Fox"], ["owl", "🦉", "Owl"], ["lion", "🦁", "Lion"],
    ["eagle", "🦅", "Eagle"], ["turtle", "🐢", "Turtle"], ["shark", "🦈", "Shark"], ["unicorn", "🦄", "Unicorn"], ["octopus", "🐙", "Octopus"], ["dino", "🦖", "Dino"],
    ["belt", "🥋", "Karate Gi"], ["medal", "🏅", "Medal"], ["trophy", "🏆", "Trophy"], ["glove", "🥊", "Glove"], ["fist", "🤜", "Fist Bump"], ["muscle", "💪", "Strong"],
    ["target", "🎯", "Bullseye"], ["fire", "🔥", "On Fire"], ["bolt", "⚡", "Lightning"], ["star", "⭐", "Star"], ["sparkle", "🌟", "Shining Star"], ["crown", "👑", "Crown"],
    ["rocket", "🚀", "Rocket"], ["planet", "🪐", "Planet"], ["moon", "🌙", "Moon"], ["comet", "☄️", "Comet"], ["rainbow", "🌈", "Rainbow"], ["sun", "☀️", "Sunshine"],
    ["book", "📚", "Books"], ["pencil", "✏️", "Pencil"], ["brain", "🧠", "Big Brain"], ["abc", "🔤", "ABC"], ["numbers", "🔢", "123"], ["globe", "🌎", "World"],
    ["pizza", "🍕", "Pizza"], ["taco", "🌮", "Taco"], ["donut", "🍩", "Donut"], ["icecream", "🍦", "Ice Cream"], ["apple", "🍎", "Apple"], ["cookie", "🍪", "Cookie"],
    ["gem", "💎", "Gem"], ["key", "🗝️", "Secret Key"], ["shield", "🛡️", "Shield"], ["map", "🗺️", "Treasure Map"], ["ninja", "🥷", "Ninja"], ["heart", "💛", "Kind Heart"]
  ];
  const PAGES = [["Dojo Animals", 0, 12], ["Champion Gear", 12, 24], ["Space and Sky", 24, 30], ["Brain Power", 30, 36], ["Snack Attack", 36, 42], ["Treasure", 42, 48]];
  const byId = {}; STICKERS.forEach(function (s) { byId[s[0]] = s; });
  function book(p) { if (!p.stickers || typeof p.stickers !== "object") p.stickers = {}; return p.stickers; }
  function count(p) { return Object.keys(book(p)).length; }
  /* One sticker per training day (a round of 5+ questions, a boss match, a
     tournament or a team lesson): a new one while any are missing, else a shiny
     repeat. 48 stickers take about 2 to 3 months of training days. */
  function earn(p, s) {
    if (!p || !s) return null;
    const big = s.game === "boss" || s.game === "team" || s.game === "tournament" || (Number(s.total) || 0) >= 5;
    if (!big || String(s.game).indexOf("test-") === 0) return null;
    const today = BD.today(); if (p.stickerDay === today) return null;
    p.stickerDay = today;
    const b = book(p), missing = STICKERS.filter(function (x) { return !b[x[0]]; });
    const pick = (missing.length ? missing : STICKERS)[Math.floor(Math.random() * (missing.length || STICKERS.length))];
    b[pick[0]] = (b[pick[0]] || 0) + 1;
    p.stickerNew = pick[0];
    setTimeout(function () { toast(pick, !!missing.length); }, 1400);
    return pick[0];
  }
  function toast(st, isNew) {
    const t = document.createElement("button"); t.type = "button"; t.className = "sticker-toast";
    t.innerHTML = '<span class="st-big">' + st[1] + '</span><span><strong>' + (isNew ? "New sticker!" : "Shiny sticker!") + '</strong><span>' + esc(st[2]) + ' · tap to open your Sticker Book</span></span>';
    t.onclick = function () { t.remove(); open(); };
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 500); }, 4200);
  }
  function homeLink(p) {
    const el = document.getElementById("stickerLink"); if (!el || !p) return;
    el.innerHTML = 'Sticker Book · <strong>' + count(p) + '</strong> of ' + STICKERS.length;
  }
  function open() {
    const p = BD.Store.current(); if (!p) return;
    const b = book(p), fresh = p.stickerNew;
    BD.UI.sheet("📒 Sticker Book", '<p class="muted small">Train each day to earn a sticker: one a day for a round of 5 or more questions, a boss match, a tournament or a team lesson. <strong>' + count(p) + ' of ' + STICKERS.length + '</strong> collected' + (count(p) >= STICKERS.length ? ': the whole book! Extras turn shiny ✨' : '') + '.</p>' +
      PAGES.map(function (pg) {
        const list = STICKERS.slice(pg[1], pg[2]), got = list.filter(function (s) { return b[s[0]]; }).length;
        return '<h4 class="label">' + esc(pg[0]) + ' · ' + got + '/' + list.length + '</h4><div class="sticker-page">' + list.map(function (s) {
          const n = b[s[0]] || 0;
          return '<span class="sticker' + (n ? " got" : "") + (n > 1 ? " shiny" : "") + (s[0] === fresh ? " fresh" : "") + '" title="' + esc(n ? s[2] : "Not yet") + '"><span class="st-icon">' + (n ? s[1] : "?") + '</span><span class="st-name">' + esc(n ? s[2] : "???") + '</span>' + (n > 1 ? '<span class="st-x">×' + n + '</span>' : '') + '</span>';
        }).join("") + '</div>';
      }).join(""));
    if (fresh) { delete p.stickerNew; BD.Store.save(p); }
  }
  function sanitize(p) {
    if (p.stickers && typeof p.stickers === "object") { const o = {}; Object.keys(p.stickers).forEach(function (k) { if (byId[k]) o[k] = Math.max(1, Math.min(999, Math.round(Number(p.stickers[k]) || 1))); }); p.stickers = o; } else delete p.stickers;
    if (p.stickerNew !== undefined && !byId[p.stickerNew]) delete p.stickerNew;
    if (p.stickerDay !== undefined && !/^\d{4}-\d\d-\d\d$/.test(String(p.stickerDay))) delete p.stickerDay;
  }
  function bind() { const l = document.getElementById("stickerLink"); if (l) l.addEventListener("click", function () { BD.Sound.tap(); open(); }); }
  return { young: young, celebrate: celebrate, thing: thing, bindCount: bindCount, STICKERS: STICKERS, earn: earn, count: count, open: open, homeLink: homeLink, sanitize: sanitize, bind: bind };
})();
