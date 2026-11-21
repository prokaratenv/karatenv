/* BADGES AND GEAR — every badge unlocks a piece of real Engage gear for the
   student's champion: start with a mouthguard, finish with MMA gloves.
   Badges are checked after rounds, tests and graduations, and on the home
   screen (for streaks). Earned gear lives in the Gear locker; equipped
   gear shows on the champion's stage. */
window.BD = window.BD || {};

BD.Badges = (function () {
  const GEAR = {
    mouthguard: { name: "Mouthguard", img: "img/gear-mouthguard.webp" },
    shorts: { name: "Black Training Shorts", img: "img/gear-shorts.webp" },
    shirt: { name: "Engage Black Training Shirt", img: "img/gear-shirt.webp" },
    sparring: { name: "Sparring Gloves", img: "img/gear-sparring.webp" },
    boots: { name: "Sparring Boots", img: "img/gear-boots.webp" },
    headgear: { name: "Sparring Headgear", img: "img/gear-headgear.webp" },
    chest: { name: "Sparring Chest Gear", img: "img/gear-chest.webp" },
    boxing: { name: "Boxing Gloves", img: "img/gear-boxing.webp" },
    mma: { name: "MMA Gloves", img: "img/gear-mma.webp" }
  };

  const weekAgo = function () { return Date.now() - 7 * 864e5; };
  const belts = function (p) { return Object.keys(p.rank || {}).reduce(function (a, g) { return a + ((p.rank[g].grads || []).length); }, 0); };
  const stripes = function (p) { return (p.stripeLog || []).length || Object.keys(p.rank || {}).reduce(function (a, g) { return a + Object.keys(p.rank[g].stripes || {}).length; }, 0) + belts(p) * 4; };

  /* In order: each one is a little harder than the last. */
  const BADGES = [
    { id: "first-round", name: "First Bow", how: "Finish your first round.", gear: "mouthguard", test: function (p) { return (p.sessions || []).length >= 1; } },
    { id: "streak-3", name: "On Fire", how: "Train 3 days in a row.", gear: "shorts", test: function (p) { return BD.streak(p).days >= 3; } },
    { id: "first-stripe", name: "First Stripe", how: "Earn your first stripe.", gear: "shirt", test: function (p) { return stripes(p) >= 1; } },
    { id: "perfect", name: "Flawless", how: "Get every answer right in a round of 8 or more.", gear: "sparring",
      test: function (p) { return (p.sessions || []).some(function (s) { return s.total >= 8 && s.correct >= s.total; }); } },
    { id: "all-rounder", name: "All-Rounder", how: "Practice Math, Fix-It, Spelling and Story Scrolls in one week.", gear: "boots",
      test: function (p) {
        const since = weekAgo(), games = new Set();
        (p.sessions || []).forEach(function (s) { if (new Date(s.date).getTime() >= since) games.add(s.game); });
        return ["math", "sentence", "spelling", "reading"].every(function (g) { return games.has(g); });
      } },
    { id: "graduate", name: "Graduate", how: "Earn a new belt.", gear: "headgear", test: function (p) { return belts(p) >= 1; } },
    { id: "streak-7", name: "Iron Will", how: "Train 7 days in a row.", gear: "chest", test: function (p) { return BD.streak(p).days >= 7; } },
    { id: "xp-1000", name: "Hard Worker", how: "Earn 1,000 XP.", gear: "boxing", test: function (p) { return (p.xp || 0) >= 1000; } },
    { id: "belts-3", name: "Dojo Legend", how: "Earn 3 belts.", gear: "mma", test: function (p) { return belts(p) >= 3; } }
  ];

  /* OUTFITS — what the champion actually wears. Each outfit is drawn as its
     own picture (so the gear really fits), and unlocks when its gear is earned. */
  const OUTFITS = [
    { id: "gi", name: "Karate Gi", needs: [], gear: [] },
    { id: "training", name: "Engage Training", needs: ["shirt", "shorts"], gear: ["shirt", "shorts"] },
    { id: "sparring", name: "Sparring Gear", needs: ["sparring", "boots", "headgear", "chest"], gear: ["shirt", "sparring", "boots", "headgear", "chest"] },
    { id: "boxing", name: "Boxing", needs: ["boxing", "shirt", "shorts"], gear: ["shirt", "shorts", "boxing"] },
    { id: "mma", name: "MMA", needs: ["mma", "shirt", "shorts"], gear: ["shirt", "shorts", "mma"] }
  ];
  const outfitById = function (id) { return OUTFITS.find(function (o) { return o.id === id; }) || OUTFITS[0]; };
  function hasGear(p, g) { return (p.gear || []).indexOf(g) !== -1; }
  function outfitUnlocked(p, o) { return o.needs.every(function (g) { return hasGear(p, g); }); }
  /* Outfits are drawn for the student characters (Kimmy, Billy, Tommy, Mackenzie, Rylan). */
  function canWearOutfits(p) { return BD.Cast.KIDS.indexOf(BD.UI.fighterKey(p)) !== -1; }
  function outfit(p) {
    const o = outfitById(p.outfit);
    return o.id !== "gi" && outfitUnlocked(p, o) && canWearOutfits(p) ? o.id : "gi";
  }

  /* Award anything newly earned. Returns the new badges (oldest first);
     a badge that completes an outfit puts that outfit on. */
  function check(p) {
    if (!p) return [];
    p.badges = p.badges || {};
    p.gear = p.gear || [];
    const fresh = [];
    BADGES.forEach(function (b) {
      if (p.badges[b.id]) return;
      let ok = false; try { ok = b.test(p); } catch (e) { ok = false; }
      if (ok) {
        const before = OUTFITS.filter(function (o) { return outfitUnlocked(p, o); }).map(function (o) { return o.id; });
        p.badges[b.id] = new Date().toISOString(); if (p.gear.indexOf(b.gear) === -1) p.gear.push(b.gear);
        const opened = OUTFITS.filter(function (o) { return before.indexOf(o.id) === -1 && outfitUnlocked(p, o); });
        if (opened.length) p.outfit = opened[opened.length - 1].id;
        fresh.push(Object.assign({ outfit: opened.length ? opened[opened.length - 1] : null }, b));
      }
    });
    if (fresh.length) BD.Store.save(p);
    return fresh;
  }

  function earned(p) { return BADGES.filter(function (b) { return p.badges && p.badges[b.id]; }); }
  /* The gear the champion is wearing right now (from the outfit). */
  function equipped(p) { return outfitById(outfit(p)).gear.slice(); }
  function rack() { return ""; }

  /* ---------- screens ---------- */
  const esc = function (s) { return BD.UI.esc(s); };
  function lockerHTML(p) {
    const have = earned(p).length, now = outfit(p), kid = canWearOutfits(p);
    return '<div class="locker-model">' + BD.UI.championHTML(p) + '</div>' +
      '<h4 class="label">Outfits</h4>' +
      (kid ? '<p class="muted small">Earn the gear to unlock each outfit. Tap one to wear it.</p>' :
        '<p class="muted small">Outfits are drawn for the student champions: Kimmy, Billy, Tommy, Mackenzie and Rylan. Pick one of them as your champion to wear your gear.</p>') +
      '<div class="outfits">' + OUTFITS.map(function (o) {
        const open = outfitUnlocked(p, o), on = now === o.id;
        const missing = o.needs.filter(function (g) { return !hasGear(p, g); }).map(function (g) { return GEAR[g].name; });
        return '<button type="button" class="outfit' + (on ? " on" : "") + (open && kid ? "" : " locked") + '"' + (open && kid ? ' data-outfit="' + o.id + '" aria-pressed="' + on + '"' : ' disabled') + '>' +
          '<span class="outfit-art">' + BD.UI.championHTML(p, o.id) + '</span>' +
          '<strong>' + esc(o.name) + '</strong>' +
          '<span class="locker-state">' + (on ? "Wearing" : open ? (kid ? "Tap to wear" : "Unlocked") : "🔒 Need: " + esc(missing.join(", "))) + '</span></button>';
      }).join("") + '</div>' +
      '<h4 class="label">Gear collection · ' + have + ' of ' + BADGES.length + '</h4>' +
      '<div class="locker">' + BADGES.map(function (b) {
        const got = p.badges && p.badges[b.id], g = GEAR[b.gear];
        return '<div class="locker-item' + (got ? " got" : " locked") + '">' +
          '<img src="' + g.img + '" alt="">' +
          '<strong>' + g.name + '</strong>' +
          '<span class="locker-badge">' + (got ? "🏅 " + esc(b.name) : "🔒 " + esc(b.how)) + '</span></div>';
      }).join("") + '</div>';
  }
  function openLocker() {
    const p = BD.Store.current(); if (!p) return;
    check(p);
    BD.UI.sheet("Gear locker", lockerHTML(p));
    document.getElementById("infoBody").onclick = function (e) {
      const b = e.target.closest("[data-outfit]"); if (!b) return;
      p.outfit = b.dataset.outfit; BD.Store.save(p); BD.Sound.tap();
      document.getElementById("infoBody").innerHTML = lockerHTML(p);
      if (BD.UI.refreshStage) BD.UI.refreshStage();
      if (BD.UI.home && document.getElementById("screen-home") && !document.getElementById("screen-home").hidden) document.getElementById("homeFighter").innerHTML = BD.UI.championHTML(p);
    };
  }
  /* Celebrate new badges one at a time. */
  function celebrate(list, done) {
    if (!list || !list.length) { if (done) done(); return; }
    const b = list[0], g = GEAR[b.gear];
    BD.UI.sheet("New gear unlocked!",
      '<div class="unlock"><img class="unlock-img" src="' + g.img + '" alt="">' +
      '<h3>' + g.name + '</h3><p>🏅 <strong>' + esc(b.name) + '</strong> badge: ' + esc(b.how) + '</p>' +
      (b.outfit && canWearOutfits(BD.Store.current()) ? '<div class="unlock-outfit">' + BD.UI.championHTML(BD.Store.current(), b.outfit.id) + '<p><strong>New outfit: ' + esc(b.outfit.name) + '!</strong> Your champion is wearing it now.</p></div>' :
        '<p class="muted">It\'s in your Gear locker.' + (b.outfit ? ' It unlocks the ' + esc(b.outfit.name) + ' outfit.' : ' Collect more gear to unlock a new outfit.') + '</p>') +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="unlockNext">' + (list.length > 1 ? "Next unlock" : "Awesome!") + '</button>' +
      '<button type="button" class="btn btn-quiet" id="unlockLocker">Open my locker</button></div></div>');
    BD.Sound.belt(); BD.confetti(120);
    document.getElementById("unlockNext").onclick = function () { celebrate(list.slice(1), done); if (list.length === 1) document.getElementById("infoClose").click(); };
    document.getElementById("unlockLocker").onclick = function () { openLocker(); };
  }
  /* Check and celebrate (call after a round, a test or on the home screen). */
  function award(p, done) {
    const fresh = check(p);
    if (fresh.length) celebrate(fresh, done); else if (done) done();
    return fresh;
  }

  return { GEAR: GEAR, BADGES: BADGES, OUTFITS: OUTFITS, outfit: outfit, outfitUnlocked: outfitUnlocked, check: check, award: award, earned: earned, equipped: equipped, rack: rack, openLocker: openLocker };
})();
