/* CHRISTMAS TREE READING CHALLENGE (BD.XmasTree)
   - Turn it on during the holiday season: a blank tree appears right away.
   - 10 reading days, one per calendar day. Read 10+ pages, log the book, the
     pages and a 3 to 5 sentence summary, tap Done: the next decoration goes on
     the tree (tinsel, lights, 4 ornaments, candy canes, train, star, presents).
   - Once started it stays open until it's finished, even after December 31.
   - Finishing all 10 earns the "Christmas Tree" for the gear locker, kept
     forever, with a switch to show it beside the champion any time.
   - +15 XP per reading day (leaderboard XP only, not belt meters); a reading
     day counts as a training day for the streak.
   Saved on the profile as p.xtree = { on, logs:[{d, book, a, b, sum}], won, show }. */
window.BD = window.BD || {};

BD.XmasTree = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const DAYS = 10, XP = 15, MIN_PAGES = 10;
  const STEPS = ["The tree", "Tinsel", "Lights", "Ornament 1", "Ornament 2", "Ornament 3", "Ornament 4", "Candy canes", "Train around the base", "Star on top", "Presents under the tree"];
  const SEASON_FROM = "2026-11-28", SEASON_TO = "2026-12-31";

  /* ---------- state ---------- */
  function st(p) { return p && p.xtree && typeof p.xtree === "object" ? p.xtree : null; }
  function n(p) { const s = st(p); return s ? Math.min(DAYS, s.logs.length) : 0; }
  function started(p) { return !!st(p); }
  function won(p) { const s = st(p); return !!(s && s.won); }
  function doneToday(p) { const s = st(p); return !!(s && s.logs.some(function (l) { return l.d === BD.today(); })); }
  function season() {
    // the holiday season (dates and the owner kill switch), not the per-device decorations switch
    if (BD.Holiday && typeof BD.Holiday.inSeason === "function") return !!BD.Holiday.inSeason();
    const t = BD.today(); return t >= SEASON_FROM && t <= SEASON_TO;
  }
  function canStart(p) { return !!p && !started(p) && season(); }
  function young(p) { return Number(BD.Rank && BD.Rank.dojoGrade ? BD.Rank.dojoGrade(p) : p.dojoGrade) <= -1; }
  function pages(p) { const s = st(p); return s ? s.logs.reduce(function (a, l) { return a + (l.b - l.a + 1); }, 0) : 0; }

  /* ---------- the tree (layered SVG) ---------- */
  function treeSVG(k, opts) {
    opts = opts || {};
    const L = function (i, body) {
      if (i > k && !(opts.next && i === k + 1)) return "";
      const cls = "xt-layer" + (i > k ? " xt-next" : "") + (opts.pop && i === k ? " xt-pop" : "");
      return '<g class="' + cls + '" data-layer="' + i + '">' + body + '</g>';
    };
    const tree = '<g data-layer="0" class="xt-layer">' +
      '<rect x="92" y="196" width="16" height="22" rx="3" fill="#7A4A26"/>' +
      '<path d="M100 22 L150 92 L132 92 L168 148 L144 148 L182 204 L18 204 L56 148 L32 148 L68 92 L50 92 Z" fill="#1F8A4C" stroke="#14653A" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M100 22 L132 92 L68 92 Z M100 92 L144 148 L56 148 Z" fill="#27A35A" opacity=".55"/></g>';
    const tinsel = '<path d="M64 98 Q100 118 138 96 M50 154 Q100 178 150 152 M40 190 Q100 206 160 188" fill="none" stroke="#E9C46A" stroke-width="5" stroke-linecap="round"/><path d="M64 98 Q100 118 138 96 M50 154 Q100 178 150 152 M40 190 Q100 206 160 188" fill="none" stroke="#FFF3B0" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round"/>';
    const lightSpots = [[78, 76, "#FF5A5F"], [120, 70, "#4FC3F7"], [100, 56, "#FFD54F"], [66, 128, "#7CFC6B"], [100, 136, "#FF5A5F"], [136, 126, "#FFD54F"], [52, 182, "#4FC3F7"], [86, 188, "#FF8A65"], [118, 186, "#7CFC6B"], [152, 180, "#FF5A5F"]];
    const lights = lightSpots.map(function (l, i) { return '<circle class="xt-bulb" style="animation-delay:' + (i % 4) * 0.35 + 's" cx="' + l[0] + '" cy="' + l[1] + '" r="4.2" fill="' + l[2] + '"/>'; }).join("");
    const orn = [
      '<circle cx="86" cy="108" r="8" fill="#D62839"/><rect x="83" y="97" width="6" height="4" rx="1" fill="#E9C46A"/><path d="M80 106 Q86 102 92 106" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/>',
      '<circle cx="124" cy="160" r="8" fill="#3A86FF"/><rect x="121" y="149" width="6" height="4" rx="1" fill="#E9C46A"/><circle cx="121" cy="157" r="2" fill="#fff" opacity=".6"/>',
      '<circle cx="70" cy="168" r="8" fill="#E9C46A"/><rect x="67" y="157" width="6" height="4" rx="1" fill="#C9A23A"/><path d="M62 168 H78" stroke="#D62839" stroke-width="2"/>',
      '<circle cx="114" cy="104" r="7" fill="#8E44AD"/><rect x="111" y="94" width="6" height="4" rx="1" fill="#E9C46A"/><circle cx="111" cy="101" r="2" fill="#fff" opacity=".6"/>'
    ];
    const cane = function (x, y) { return '<path d="M' + x + ' ' + (y + 18) + ' V' + (y + 4) + ' Q' + x + ' ' + y + ' ' + (x + 5) + ' ' + y + ' Q' + (x + 10) + ' ' + y + ' ' + (x + 10) + ' ' + (y + 5) + '" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M' + x + ' ' + (y + 18) + ' V' + (y + 4) + ' Q' + x + ' ' + y + ' ' + (x + 5) + ' ' + y + ' Q' + (x + 10) + ' ' + y + ' ' + (x + 10) + ' ' + (y + 5) + '" fill="none" stroke="#D62839" stroke-width="4" stroke-dasharray="3 3" stroke-linecap="round"/>'; };
    const canes = cane(140, 98) + cane(46, 152) + cane(100, 166);
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const train = '<ellipse cx="100" cy="226" rx="86" ry="9" fill="none" stroke="#6B4E37" stroke-width="2.5" stroke-dasharray="4 3"/>' +
      '<g class="xt-train"' + (still ? ' transform="translate(150 232)"' : '') + '><rect x="-26" y="-9" width="14" height="9" rx="2" fill="#3A86FF"/><rect x="-10" y="-9" width="14" height="9" rx="2" fill="#2BB673"/><rect x="6" y="-13" width="18" height="13" rx="2" fill="#D62839"/><rect x="18" y="-19" width="5" height="7" fill="#333"/>' +
      '<circle cx="-22" cy="1" r="2.6" fill="#222"/><circle cx="-6" cy="1" r="2.6" fill="#222"/><circle cx="11" cy="1" r="2.8" fill="#222"/><circle cx="20" cy="1" r="2.8" fill="#222"/>' +
      (still ? '' : '<animateMotion dur="9s" repeatCount="indefinite" path="M14 226 A86 9 0 1 0 186 226 A86 9 0 1 0 14 226"/>') + '</g>';
    const star = '<g class="xt-star"><path d="M100 4 L106 18 L121 18 L109 27 L113 41 L100 33 L87 41 L91 27 L79 18 L94 18 Z" fill="#FFD54F" stroke="#E0A800" stroke-width="2" stroke-linejoin="round"/></g>';
    const gift = function (x, w, h, c, r) { return '<rect x="' + x + '" y="' + (244 - h) + '" width="' + w + '" height="' + h + '" rx="2" fill="' + c + '"/><rect x="' + (x + w / 2 - 2) + '" y="' + (244 - h) + '" width="4" height="' + h + '" fill="' + r + '"/><rect x="' + x + '" y="' + (244 - h / 2 - 2) + '" width="' + w + '" height="4" fill="' + r + '"/><path d="M' + (x + w / 2) + ' ' + (244 - h) + ' q-7 -8 -9 0 q4 3 9 0 q7 -8 9 0 q-4 3 -9 0" fill="' + r + '"/>'; };
    const presents = gift(26, 26, 18, "#D62839", "#E9C46A") + gift(56, 20, 24, "#3A86FF", "#fff") + gift(124, 22, 20, "#2BB673", "#D62839") + gift(150, 26, 16, "#8E44AD", "#E9C46A");
    // the train runs in front of the trunk; presents sit in front of the train track
    return '<svg class="xt-tree' + (opts.small ? " small" : "") + '" viewBox="0 0 200 250" role="img" aria-label="Christmas tree with ' + k + ' of ' + DAYS + ' decorations">' +
      tree + L(1, tinsel) + L(2, lights) + L(3, orn[0]) + L(4, orn[1]) + L(5, orn[2]) + L(6, orn[3]) + L(7, canes) + L(8, train) + L(9, star) + L(10, presents) + '</svg>';
  }

  /* ---------- the challenge sheet ---------- */
  function sentences(t) {
    return String(t || "").split(/[.!?]+/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length; });
  }
  function check(f) {
    const book = String(f.book || "").trim(), a = Number(f.a), b = Number(f.b), sum = String(f.sum || "").trim();
    if (book.length < 2) return "Add the name of your book.";
    if (book.length > 80) return "That book title is too long. Use 80 letters or fewer.";
    if (!isFinite(a) || !isFinite(b) || a < 1 || b < 1 || Math.floor(a) !== a || Math.floor(b) !== b) return "Add the page you started on and the page you finished on.";
    if (a > 5000 || b > 5000) return "Those page numbers look too big. Check them again.";
    if (b < a) return "The last page should come after the first page.";
    if (b - a + 1 < MIN_PAGES) return "Read at least " + MIN_PAGES + " pages today. That's " + (b - a + 1) + " so far. Keep reading!";
    if (b - a + 1 > 300) return "That's a lot of pages for one day. Check the page numbers.";
    if (sum.length < 20) return "Write a few sentences about what you read.";
    if (sum.length > 600) return "Your summary is a little long. Keep it to 3 to 5 sentences.";
    const ss = sentences(sum);
    if (ss.length < 3) return "Write at least 3 sentences. You have " + ss.length + ". End each one with a period.";
    if (ss.length > 5) return "Keep it to 5 sentences or fewer. You have " + ss.length + ".";
    if (ss.some(function (s) { return s.split(/\s+/).filter(Boolean).length < 3; })) return "Each sentence needs at least 3 words.";
    return null;
  }
  function mask(t) { return String(t).replace(/[A-Za-z]+/g, function (w) { return BD.WordSafe && BD.WordSafe.unsafe(w) ? "•••" : w; }); }

  function sheetHTML(p, msg) {
    const s = st(p), k = n(p), y = young(p);
    if (!s) {
      return '<div class="xt"><div class="xt-art">' + treeSVG(0, { next: true }) + '</div>' +
        '<p class="xt-lead">Read <strong>' + MIN_PAGES + ' pages a day</strong>' + (y ? ' together' : '') + ' for ' + DAYS + ' days. Each day you finish adds a decoration: tinsel, lights, 4 ornaments, candy canes, a train, the star and presents!</p>' +
        '<p class="muted small">Finish all ' + DAYS + ' days to keep your Christmas tree forever in your gear locker.</p>' +
        (season() ? '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" data-xt="start">Turn on the challenge</button></div>' : '<p class="muted">The Christmas Tree Reading Challenge opens during the holiday season.</p>') + '</div>';
    }
    const next = STEPS[k + 1];
    const head = '<div class="xt"><div class="xt-art">' + treeSVG(k, { next: k < DAYS, pop: msg === "pop" }) + '</div>' +
      '<p class="xt-day"><strong>Day ' + Math.min(k + (k < DAYS && !doneToday(p) ? 1 : 0), DAYS) + ' of ' + DAYS + '</strong> · ' + k + ' of ' + DAYS + ' decorations · ' + pages(p) + ' pages read</p>';
    if (s.won) {
      return head + '<p class="xt-lead"><strong>You finished the Christmas Tree Reading Challenge!</strong> Your tree is in your gear locker forever.</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" data-xt="locker">Open my gear locker</button></div>' + logList(p) + '</div>';
    }
    if (doneToday(p)) {
      return head + '<p class="xt-lead">Great reading today! Come back tomorrow for your next decoration: <strong>' + esc(next) + '</strong>.</p>' + logList(p) + '</div>';
    }
    return head + '<p class="xt-lead">Next decoration: <strong>' + esc(next) + '</strong>. Read ' + MIN_PAGES + ' pages' + (y ? ' together' : '') + ', then tell us about it.</p>' +
      '<form class="xt-form" data-xt-form novalidate>' +
        '<label>Book title<input type="text" name="book" maxlength="80" autocomplete="off" required></label>' +
        '<div class="xt-pages"><label>First page<input type="number" name="a" inputmode="numeric" min="1" max="5000" required></label>' +
        '<label>Last page<input type="number" name="b" inputmode="numeric" min="1" max="5000" required></label></div>' +
        '<label>' + (y ? 'Grown-up types what you read together' : 'What happened? Write 3 to 5 sentences.') +
          '<textarea name="sum" rows="4" maxlength="600" placeholder="' + (y ? 'We read about a bear who found a lost mitten. He looked all over the forest. In the end he gave it back to his friend.' : 'Who was in it? What happened? What did you like?') + '"></textarea></label>' +
        '<p class="xt-msg" data-xt-msg role="alert">' + (msg && msg !== "pop" ? esc(msg) : "") + '</p>' +
        '<button type="submit" class="btn btn-primary btn-big">Done! Add my decoration</button>' +
      '</form>' + logList(p) + '</div>';
  }
  function logList(p) {
    const s = st(p); if (!s || !s.logs.length) return "";
    return '<details class="xt-logs"><summary>My reading log (' + s.logs.length + ')</summary><ol>' + s.logs.map(function (l, i) {
      return '<li><strong>Day ' + (i + 1) + ': ' + esc(STEPS[i + 1]) + '</strong> · ' + esc(mask(l.book)) + ', pages ' + l.a + ' to ' + l.b + '<br><span class="muted small">' + esc(mask(l.sum)) + '</span></li>';
    }).join("") + '</ol></details>';
  }
  function open(msg) {
    const p = BD.Store.current(); if (!p) return;
    BD.UI.sheet("Christmas Tree Reading Challenge", sheetHTML(p, msg));
    bind(p);
    if (!msg && BD.ReadAloud && BD.ReadAloud.auto(BD.Rank.dojoGrade(p))) {
      const lead = document.querySelector("#infoBody .xt-lead"); if (lead) BD.ReadAloud.say(lead.textContent);
    }
  }
  function bind(p) {
    const body = $("infoBody"); if (!body) return;
    body.onclick = function (e) {
      const b = e.target.closest("[data-xt]"); if (!b) return;
      const a = b.dataset.xt;
      if (a === "start") { start(p); return; }
      if (a === "locker") { if (BD.Badges) BD.Badges.openLocker(); }
    };
    const f = body.querySelector("[data-xt-form]");
    if (f) f.onsubmit = function (e) {
      e.preventDefault();
      const r = log(p, { book: f.book.value, a: f.a.value, b: f.b.value, sum: f.sum.value });
      if (r.error) { const m = body.querySelector("[data-xt-msg]"); m.textContent = r.error; BD.Sound.wrong && BD.Sound.wrong(); return; }
    };
  }
  function start(p) {
    if (!canStart(p)) return false;
    p.xtree = { on: BD.today(), logs: [], won: false, show: true };
    BD.Store.save(p); BD.Sound.tap();
    open(); refresh(p);
    return true;
  }
  function log(p, f) {
    const s = st(p);
    if (!s) return { error: "Turn on the challenge first." };
    if (s.won || s.logs.length >= DAYS) return { error: "You already finished the challenge!" };
    if (doneToday(p)) return { error: "You already added today's decoration. Come back tomorrow!" };
    const err = check(f); if (err) return { error: err };
    const clean = function (t, max) { return String(t).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); };
    s.logs.push({ d: BD.today(), book: clean(f.book, 80), a: Number(f.a), b: Number(f.b), sum: clean(f.sum, 600) });
    BD.addXP(p, XP);
    const t = BD.today(); p.days = p.days || []; if (p.days.indexOf(t) === -1) p.days.push(t); // a reading day keeps the streak going
    if (s.logs.length >= DAYS) { s.won = true; s.show = true; }
    BD.Store.save(p);
    if (BD.confetti) BD.confetti(s.won ? 220 : 120);
    if (BD.Sound) (s.won ? BD.Sound.belt : BD.Sound.right || BD.Sound.tap).call(BD.Sound);
    open("pop");
    const body = $("infoBody");
    if (body) {
      const lead = body.querySelector(".xt-lead");
      if (lead) lead.insertAdjacentHTML("beforebegin", '<p class="xt-cheer">' + (s.won ? '🎄 You finished all ' + DAYS + ' days! The Christmas Tree is yours to keep forever. +' + XP + ' XP' : '✨ ' + esc(STEPS[s.logs.length]) + ' added! +' + XP + ' XP') + '</p>');
    }
    refresh(p);
    return { ok: true, step: s.logs.length, won: s.won };
  }

  /* ---------- cards and the hero tree ---------- */
  function cardHTML(p) {
    const k = n(p);
    return '<span class="xt-mini" aria-hidden="true">' + treeSVG(started(p) ? k : 0, { small: true }) + '</span>' +
      '<span><span class="boss-k">Holiday challenge</span><strong>Christmas Tree Reading</strong><span class="boss-sub">' +
      (!started(p) ? 'Read ' + MIN_PAGES + ' pages a day to decorate your tree' : doneToday(p) ? 'Day ' + k + ' of ' + DAYS + ' done · next decoration tomorrow' : k + ' of ' + DAYS + ' decorations · read today to add ' + esc(STEPS[k + 1].toLowerCase())) + '</span></span>';
  }
  function showCard(p) { return !!p && ((started(p) && !won(p)) || canStart(p)); }
  function ensureCards() {
    if (!$("xtCardTrain")) {
      const pp = $("ppCard");
      if (pp) pp.insertAdjacentHTML("afterend", '<button type="button" class="team-card xt-card" id="xtCardTrain" data-cta="Open" hidden></button>');
    }
    if (!$("xtCardGames")) {
      const dt = $("dailyTile");
      if (dt) dt.insertAdjacentHTML("afterend", '<button type="button" class="team-card xt-card" id="xtCardGames" data-cta="Open" hidden></button>');
    }
    ["xtCardTrain", "xtCardGames"].forEach(function (id) { const c = $(id); if (c && !c._xt) { c._xt = 1; c.addEventListener("click", function () { BD.Sound.tap(); open(); }); } });
  }
  function heroTree(p) {
    const on = won(p) && st(p).show !== false;
    const col = document.querySelector("#panelTrain .stage-col");
    let h = $("xtHero");
    if (col) {
      if (on && !h) { col.insertAdjacentHTML("beforeend", '<span class="xt-hero" id="xtHero" aria-label="My Christmas tree"></span>'); h = $("xtHero"); }
      if (h) { h.hidden = !on; if (on) h.innerHTML = treeSVG(DAYS, { small: true }); }
    }
    // Little Ninjas picture home: the tree beside the champion, and a challenge button
    const lh = $("littleHome");
    if (lh && !lh.hidden) {
      const top = lh.querySelector(".lh-top");
      if (top && on && !top.querySelector(".xt-hero")) top.insertAdjacentHTML("beforeend", '<span class="xt-hero lh-xt" aria-label="My Christmas tree">' + treeSVG(DAYS, { small: true }) + '</span>');
      const row = lh.querySelector(".lh-row");
      if (row && showCard(p) && !row.querySelector("[data-xt-lh]")) {
        row.insertAdjacentHTML("afterbegin", '<button type="button" class="lh-small" data-xt-lh="1"><span>🎄</span><span>Tree ' + n(p) + '/' + DAYS + '</span></button>');
        row.querySelector("[data-xt-lh]").addEventListener("click", function (e) { e.stopPropagation(); BD.Sound.tap(); if (BD.ReadAloud) BD.ReadAloud.say("Christmas tree reading!"); open(); });
      }
    }
  }
  function refresh(p) {
    p = p || BD.Store.current(); if (!p) return;
    ensureCards();
    ["xtCardTrain", "xtCardGames"].forEach(function (id) { const c = $(id); if (!c) return; const on = showCard(p); c.hidden = !on; if (on) c.innerHTML = cardHTML(p); });
    heroTree(p);
  }

  /* ---------- gear locker ---------- */
  function lockerHTML(p) {
    const w = won(p), s = st(p);
    return '<h4 class="label">Holiday gear</h4><div class="locker xt-locker">' +
      '<div class="locker-item' + (w ? " got" : " locked") + '"><span class="xt-locker-art">' + treeSVG(w ? DAYS : n(p), { small: true }) + '</span><strong>Christmas Tree</strong>' +
      '<span class="locker-badge">' + (w ? "🏅 Christmas Tree Reading Challenge" : started(p) ? "🔒 " + n(p) + " of " + DAYS + " reading days" : "🔒 Finish the Christmas Tree Reading Challenge") + '</span>' +
      (w ? '<label class="xt-toggle"><input type="checkbox" data-xtree-toggle' + (s.show !== false ? " checked" : "") + '> Show my Christmas tree</label>' : '') +
      '</div></div>';
  }
  function toggle(p, on) { const s = st(p); if (!s || !s.won) return; s.show = !!on; BD.Store.save(p); refresh(p); }

  /* ---------- parents ---------- */
  function parentHTML(p) {
    const s = st(p); if (!s) return "";
    return '<div class="xt-parent"><h4 class="label">Christmas Tree Reading: day ' + n(p) + ' of ' + DAYS + (s.won ? ' · finished!' : '') + '</h4>' +
      '<p class="muted small">' + pages(p) + ' pages read. Talking points: ask about the books below.</p>' +
      (s.logs.length ? '<ol class="xt-plog">' + s.logs.map(function (l) {
        return '<li><strong>' + esc(mask(l.book)) + '</strong>, pages ' + l.a + ' to ' + l.b + ' <span class="muted small">(' + esc(l.d) + ')</span><br>' + esc(mask(l.sum)) + '</li>';
      }).join("") + '</ol>' : '') + '</div>';
  }
  function digestLine(p) { const s = st(p); return s ? "Christmas Tree Reading: " + n(p) + " of " + DAYS + " days, " + pages(p) + " pages" : ""; }

  function sanitize(p) {
    const s = p.xtree;
    if (s === undefined) return;
    if (!s || typeof s !== "object" || !/^\d{4}-\d\d-\d\d$/.test(String(s.on))) { delete p.xtree; return; }
    const clean = function (t, max) { return String(t || "").replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max); };
    const logs = (Array.isArray(s.logs) ? s.logs : []).filter(function (l) { return l && /^\d{4}-\d\d-\d\d$/.test(String(l.d)); }).slice(0, DAYS).map(function (l) {
      const a = Math.max(1, Math.min(5000, Math.round(Number(l.a) || 1))), b = Math.max(a, Math.min(5000, Math.round(Number(l.b) || a)));
      return { d: l.d, book: clean(l.book, 80), a: a, b: b, sum: clean(l.sum, 600) };
    });
    p.xtree = { on: s.on, logs: logs, won: !!s.won || logs.length >= DAYS, show: s.show !== false };
  }

  if (BD.on) BD.on("home", function (p) { refresh(p); });

  return { STEPS: STEPS, DAYS: DAYS, treeSVG: treeSVG, check: check, sentences: sentences, open: open, start: start, log: log, refresh: refresh,
    started: started, won: won, count: n, pages: pages, doneToday: doneToday, canStart: canStart, season: season,
    lockerHTML: lockerHTML, toggle: toggle, parentHTML: parentHTML, digestLine: digestLine, sanitize: sanitize };
})();
