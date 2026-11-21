/* BADGES AND GEAR — every badge unlocks a piece of real Engage gear for the
   student's champion: start with a mouthguard, finish with MMA gloves.
   Badges are checked after rounds, tests and graduations, and on the home
   screen (for streaks). Earned gear lives in the Gear locker; equipped
   gear shows on the champion's stage. */
window.BD = window.BD || {};

BD.Badges = (function () {
  const GEAR = {
    mouthguard: { name: "Mouthguard", img: "img/gear-mouthguard.webp" },
    shorts: { name: "MMA Shorts", img: "img/gear-shorts.webp" },
    shirt: { name: "Engage Black Training Shirt", img: "img/gear-shirt.webp" },
    sparring: { name: "Sparring Gloves", img: "img/gear-sparring.webp" },
    boots: { name: "Sparring Boots", img: "img/gear-boots.webp" },
    headgear: { name: "Sparring Headgear", img: "img/gear-headgear.webp" },
    chest: { name: "Sparring Chest Gear", img: "img/gear-chest.webp" },
    boxing: { name: "Boxing Gloves", img: "img/gear-boxing.webp" },
    mma: { name: "MMA Gloves", img: "img/gear-mma.webp" },
    bag: { name: "Sparring Gear Bag", img: "img/gear-bag.webp" },
    // weapons: for show only (performed in Weapons tournaments, never used against anyone)
    nunchucks: { name: "Nunchucks", img: "img/weapon-nunchucks.webp", weapon: true },
    kamas: { name: "Kamas", img: "img/weapon-kamas.webp", weapon: true },
    bo: { name: "Bo Staff", img: "img/weapon-bo.webp", weapon: true },
    sword: { name: "Wooden Sword", img: "img/weapon-sword.webp", weapon: true }
  };

  const weekAgo = function () { return Date.now() - 7 * 864e5; };
  const belts = function (p) { return Object.keys(p.rank || {}).reduce(function (a, g) { return a + ((p.rank[g].grads || []).length); }, 0); };
  const stripes = function (p) { return (p.stripeLog || []).length || Object.keys(p.rank || {}).reduce(function (a, g) { return a + Object.keys(p.rank[g].stripes || {}).length; }, 0) + belts(p) * 4; };

  const daysTrained = function (p) { return (p.days || []).length; };
  /* Best Yellow Belt progress in any grade: stripes on Yellow, or 4 once past Yellow. */
  const yellowStripes = function (p) {
    return Object.keys(p.rank || {}).reduce(function (best, g) {
      const r = p.rank[g]; if (!r) return best;
      const n = r.belt > 1 || r.mastered ? 4 : r.belt === 1 ? BD.Rank.stripeCount(r) : 0;
      return Math.max(best, n);
    }, 0);
  };
  /* Reached a belt (0 White … 8 Black) in any grade. */
  const reached = function (p, belt) { return Object.keys(p.rank || {}).some(function (g) { return p.rank[g] && (p.rank[g].belt >= belt || p.rank[g].mastered); }); };
  const reachedOrange = function (p) { return reached(p, 2); };

  /* The gear path, in the order kids earn it (sparring starts at Orange Belt, like class). */
  const BADGES = [
    { id: "signup", name: "Welcome to the Dojo", how: "Sign up for Brain Dojo.", gear: "mouthguard", test: function () { return true; } },
    { id: "days-3", name: "3 Days In", how: "Train on 3 different days.", gear: "shirt", test: function (p) { return daysTrained(p) >= 3; } },
    { id: "days-10", name: "10 Days Strong", how: "Train on 10 different days.", gear: "shorts", test: function (p) { return daysTrained(p) >= 10; } },
    { id: "stripe-1", name: "First Stripe", how: "Earn your first stripe.", gear: "mma", test: function (p) { return stripes(p) >= 1; } },
    { id: "grad-1", name: "First Graduation", how: "Graduate to your next belt.", gear: "bag", test: function (p) { return belts(p) >= 1; } },
    { id: "yellow-1", name: "Yellow Belt · 1 Stripe", how: "Earn 1 stripe on your Yellow Belt.", gear: "sparring", test: function (p) { return yellowStripes(p) >= 1; } },
    { id: "yellow-2", name: "Yellow Belt · 2 Stripes", how: "Earn 2 stripes on your Yellow Belt.", gear: "boots", test: function (p) { return yellowStripes(p) >= 2; } },
    { id: "yellow-3", name: "Yellow Belt · 3 Stripes", how: "Earn 3 stripes on your Yellow Belt.", gear: "headgear", test: function (p) { return yellowStripes(p) >= 3; } },
    { id: "yellow-4", name: "Yellow Belt · 4 Stripes", how: "Earn all 4 stripes on your Yellow Belt.", gear: "chest", test: function (p) { return yellowStripes(p) >= 4; } },
    { id: "orange-spar", name: "Ready to Spar!", how: "Graduate from Yellow to Orange Belt. That's when sparring starts at Engage!", gear: null, unlocks: "sparring", test: reachedOrange },
    { id: "green-nunchucks", name: "Green Belt", how: "Reach Green Belt.", gear: "nunchucks", test: function (p) { return reached(p, 4); } },
    { id: "green-boxing", name: "Green Belt", how: "Reach Green Belt.", gear: "boxing", test: function (p) { return reached(p, 4); } },
    { id: "green-highrank", name: "High Rank", how: "Reach Green Belt: earn the High Rank Uniform, a black gi with a collar stripe in your belt color.", gear: null, unlocks: "highrank", test: function (p) { return reached(p, 4); } },
    { id: "green-judo", name: "Judo Moves", how: "Reach Green Belt. Every 5 right in a row becomes a judo throw in battles and sparring!", gear: null, skill: "judo", test: function (p) { return reached(p, 4); } },
    { id: "purple-kamas", name: "Purple Belt", how: "Reach Purple Belt.", gear: "kamas", test: function (p) { return reached(p, 5); } },
    { id: "brown-bo", name: "Brown Belt", how: "Reach Brown Belt.", gear: "bo", test: function (p) { return reached(p, 6); } },
    { id: "red-sword", name: "Red Belt", how: "Reach Red Belt.", gear: "sword", test: function (p) { return reached(p, 7); } }
  ];
  const GEAR_BADGES = BADGES.filter(function (b) { return b.gear && !GEAR[b.gear].weapon; });
  const WEAPON_BADGES = BADGES.filter(function (b) { return b.gear && GEAR[b.gear].weapon; });
  function hasSkill(p, skill) { return BADGES.some(function (b) { return b.skill === skill && p.badges && p.badges[b.id]; }); }
  function weapons(p) { return WEAPON_BADGES.filter(function (b) { return (p.gear || []).indexOf(b.gear) !== -1; }).map(function (b) { return b.gear; }); }

  /* OUTFITS — what the champion actually wears. Each outfit is drawn as its
     own picture (so the gear really fits). An outfit unlocks only when EVERY
     piece of it is earned, and contact outfits need a mouthguard, like in class. */
  const OUTFITS = [
    { id: "gi", name: "Karate Gi", gear: [] },
    { id: "training", name: "Engage Training", gear: ["shirt", "shorts"] },
    { id: "sparring", name: "Sparring Gear", gear: ["mouthguard", "shirt", "sparring", "headgear", "chest", "boots"], badge: "orange-spar" },
    { id: "boxing", name: "Boxing", gear: ["mouthguard", "shirt", "shorts", "boxing"] },
    { id: "mma", name: "MMA", gear: ["mouthguard", "shirt", "shorts", "mma"] },
    { id: "highrank", name: "High Rank Uniform", gear: [], badge: "green-highrank" }
  ];
  OUTFITS.forEach(function (o) { o.needs = o.gear; });
  const outfitById = function (id) { return OUTFITS.find(function (o) { return o.id === id; }) || OUTFITS[0]; };
  function hasGear(p, g) { return (p.gear || []).indexOf(g) !== -1; }
  function outfitUnlocked(p, o) { return o.needs.every(function (g) { return hasGear(p, g); }) && (!o.badge || !!(p.badges && p.badges[o.badge])); }
  /* Outfits are drawn for the student characters (Kimmy, Billy, Tommy, Mackenzie,
     Rylan) and for champions students build themselves. */
  function canWearOutfits(p) { const k = BD.UI.fighterKey(p); return k === "custom" || BD.Cast.KIDS.indexOf(k) !== -1; }
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
        const newGear = !!b.gear && p.gear.indexOf(b.gear) === -1;
        p.badges[b.id] = new Date().toISOString(); if (newGear) p.gear.push(b.gear);
        const opened = OUTFITS.filter(function (o) { return before.indexOf(o.id) === -1 && outfitUnlocked(p, o); });
        if (opened.length) p.outfit = opened[opened.length - 1].id;
        // gear a student already had from the old unlock rules is recorded quietly (no repeat celebration)
        if (newGear || opened.length || b.skill) fresh.push(Object.assign({ outfit: opened.length ? opened[opened.length - 1] : null }, b));
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
    const now = outfit(p), kid = canWearOutfits(p);
    return '<div class="locker-model">' + BD.UI.championHTML(p) + '</div>' +
      '<h4 class="label">Outfits</h4>' +
      (kid ? '<p class="muted small">Earn the gear to unlock each outfit. Tap one to wear it.</p>' :
        '<p class="muted small">Outfits are for the student champions (Kimmy, Billy, Tommy, Mackenzie, Rylan) and champions you build. Pick one of them to wear your gear.</p>') +
      '<div class="outfits">' + OUTFITS.map(function (o) {
        const open = outfitUnlocked(p, o), on = now === o.id;
        const missing = o.needs.filter(function (g) { return !hasGear(p, g); }).map(function (g) { return GEAR[g].name; })
          .concat(o.badge && !(p.badges && p.badges[o.badge]) ? [o.id === "highrank" ? "Green Belt" : "Orange Belt graduation"] : []);
        return '<button type="button" class="outfit' + (on ? " on" : "") + (open && kid ? "" : " locked") + '"' + (open && kid ? ' data-outfit="' + o.id + '" aria-pressed="' + on + '"' : ' disabled') + '>' +
          '<span class="outfit-art">' + BD.UI.championHTML(p, o.id) + '</span>' +
          '<strong>' + esc(o.name) + '</strong>' +
          '<span class="locker-state">' + (on ? "Wearing" : open ? (kid ? "Tap to wear" : "Unlocked") : "🔒 " + (o.badge ? (o.id === "highrank" ? "Unlocks at Green Belt" : "Unlocks at Orange Belt") : (o.needs.length - missing.length) + " of " + o.needs.length + " pieces")) + '</span>' +
          (open ? "" : '<span class="outfit-need">Still need: ' + esc(missing.join(", ")) + '</span>') + '</button>';
      }).join("") + '</div>' +
      '<h4 class="label">Gear collection · ' + GEAR_BADGES.filter(function (b) { return hasGear(p, b.gear); }).length + ' of ' + GEAR_BADGES.length + '</h4>' +
      '<div class="locker">' + GEAR_BADGES.map(function (b) {
        const got = hasGear(p, b.gear), g = GEAR[b.gear];
        return '<div class="locker-item' + (got ? " got" : " locked") + '">' +
          '<img src="' + g.img + '" alt="">' +
          '<strong>' + g.name + '</strong>' +
          '<span class="locker-badge">' + (got ? "🏅 " + esc(b.name) : "🔒 " + esc(b.how)) + '</span></div>';
      }).join("") + '</div>' +
      '<h4 class="label">Weapons · for show</h4><p class="muted small">Weapons are for show only. Perform with them in Weapons tournaments; they\'re never used against anyone or any boss.</p>' +
      '<div class="locker">' + WEAPON_BADGES.map(function (b) {
        const got = hasGear(p, b.gear), g = GEAR[b.gear];
        return '<div class="locker-item' + (got ? " got" : " locked") + '"><img src="' + g.img + '" alt=""><strong>' + g.name + '</strong><span class="locker-badge">' + (got ? "🏅 " + esc(b.name) : "🔒 " + esc(b.how)) + '</span></div>';
      }).join("") + '</div>' +
      '<h4 class="label">Skills</h4><div class="locker">' + BADGES.filter(function (b) { return b.skill; }).map(function (b) {
        const got = !!(p.badges && p.badges[b.id]);
        return '<div class="locker-item skill' + (got ? " got" : " locked") + '"><span class="skill-icon" aria-hidden="true">🥋</span><strong>' + esc(b.name) + '</strong><span class="locker-badge">' + (got ? "🏅 Unlocked: every 5 right in a row is a judo throw" : "🔒 " + esc(b.how)) + '</span></div>';
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
    const nextBtns = function () {
      document.getElementById("unlockNext").onclick = function () { celebrate(list.slice(1), done); if (list.length === 1) document.getElementById("infoClose").click(); };
      document.getElementById("unlockLocker").onclick = function () { openLocker(); };
    };
    if (b.skill) {
      BD.UI.sheet("New skill: Judo Moves!", '<div class="unlock"><div class="chest-prize">🥋</div><h3>Judo Moves unlocked!</h3><p>🏅 <strong>' + esc(b.name) + '</strong>: ' + esc(b.how) + '</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="unlockNext">' + (list.length > 1 ? "Next unlock" : "Hajime!") + '</button><button type="button" class="btn btn-quiet" id="unlockLocker">Open my locker</button></div></div>');
      BD.Sound.belt(); BD.confetti(120); nextBtns(); return;
    }
    if (g && g.weapon) {
      BD.UI.sheet("New weapon unlocked!", '<div class="unlock"><img class="unlock-img" src="' + g.img + '" alt=""><h3>' + g.name + '</h3><p>🏅 <strong>' + esc(b.name) + '</strong>: ' + esc(b.how) + '</p>' +
        '<p class="muted">Weapons are for show: perform a form with it in a Weapons tournament. It\'s never used against anyone or any boss.</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="unlockNext">' + (list.length > 1 ? "Next unlock" : "Awesome!") + '</button><button type="button" class="btn btn-quiet" id="unlockLocker">Open my locker</button></div></div>');
      BD.Sound.belt(); BD.confetti(120); nextBtns(); return;
    }
    if (!g) { // an outfit milestone: the full sparring outfit (Orange) or the High Rank Uniform (Green)
      const p = BD.Store.current(), o = b.outfit || outfitById(b.unlocks), hr = b.unlocks === "highrank";
      BD.UI.sheet(hr ? "High Rank Uniform!" : "Ready to spar!",
        '<div class="unlock">' + (canWearOutfits(p) ? '<div class="unlock-outfit">' + BD.UI.championHTML(p, o.id) + '</div>' : '') +
        '<h3>' + (hr ? "High Rank Uniform unlocked!" : "Full Sparring Gear outfit unlocked!") + '</h3><p>🏅 <strong>' + esc(b.name) + '</strong>: ' + esc(b.how) + '</p>' +
        (canWearOutfits(p) && b.outfit ? '<p class="muted">Your champion is wearing it now.</p>' : '<p class="muted">Find it in your Gear locker.</p>') +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="unlockNext">' + (list.length > 1 ? "Next unlock" : hr ? "Osu!" : "Let\'s spar!") + '</button>' +
        '<button type="button" class="btn btn-quiet" id="unlockLocker">Open my locker</button></div></div>');
      BD.Sound.belt(); BD.confetti(160);
      document.getElementById("unlockNext").onclick = function () { celebrate(list.slice(1), done); if (list.length === 1) document.getElementById("infoClose").click(); };
      document.getElementById("unlockLocker").onclick = function () { openLocker(); };
      return;
    }
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

  function gearName(b) { return b.gear ? GEAR[b.gear].name : b.name; }
  return { hasSkill: hasSkill, weapons: weapons, reached: reached, yellowStripes: yellowStripes, WEAPON_BADGES: WEAPON_BADGES, gearName: gearName, GEAR_BADGES: GEAR_BADGES, GEAR: GEAR, BADGES: BADGES, OUTFITS: OUTFITS, outfit: outfit, outfitUnlocked: outfitUnlocked, check: check, award: award, earned: earned, equipped: equipped, rack: rack, openLocker: openLocker };
})();
