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

  /* Award anything newly earned. Returns the new badges (oldest first). */
  function check(p) {
    if (!p) return [];
    p.badges = p.badges || {};
    p.gear = p.gear || [];
    const fresh = [];
    BADGES.forEach(function (b) {
      if (p.badges[b.id]) return;
      let ok = false; try { ok = b.test(p); } catch (e) { ok = false; }
      if (ok) {
        p.badges[b.id] = new Date().toISOString(); if (p.gear.indexOf(b.gear) === -1) p.gear.push(b.gear); fresh.push(b);
        // new gloves go on; any other pair comes off
        if (BD.GearFit && BD.GearFit.handSlot(b.gear)) { p.gearHidden = (p.gearHidden || []).filter(function (g) { return g !== b.gear; }); BD.GearFit.HANDS.forEach(function (g) { if (g !== b.gear && p.gearHidden.indexOf(g) === -1) p.gearHidden.push(g); }); }
      }
    });
    if (fresh.length) BD.Store.save(p);
    return fresh;
  }

  function earned(p) { return BADGES.filter(function (b) { return p.badges && p.badges[b.id]; }); }
  function hidden(p) { return p.gearHidden || []; }
  function equipped(p) { return earned(p).map(function (b) { return b.gear; }).filter(function (g) { return hidden(p).indexOf(g) === -1; }); }

  /* Small gear row for the champion stage. */
  function rack(p) {
    const list = equipped(p);
    if (!list.length) return "";
    return '<span class="gear-rack" aria-label="Gear: ' + list.map(function (g) { return GEAR[g].name; }).join(", ") + '">' +
      list.map(function (g) { return '<img src="' + GEAR[g].img + '" alt="" title="' + GEAR[g].name + '">'; }).join("") + '</span>';
  }

  /* ---------- screens ---------- */
  const esc = function (s) { return BD.UI.esc(s); };
  function lockerHTML(p) {
    const have = earned(p).length, hide = hidden(p);
    return '<div class="locker-model">' + BD.UI.championHTML(p) + '</div>' +
      '<p class="muted">' + have + ' of ' + BADGES.length + ' badges earned. Each badge unlocks real Engage gear for your champion. Tap gear you have to put it on or take it off. Gloves: one pair at a time.</p>' +
      '<div class="locker">' + BADGES.map(function (b) {
        const got = p.badges && p.badges[b.id], g = GEAR[b.gear], on = got && hide.indexOf(b.gear) === -1;
        return '<button type="button" class="locker-item' + (got ? " got" : " locked") + (on ? " on" : "") + '"' + (got ? ' data-gear="' + b.gear + '" aria-pressed="' + !!on + '"' : ' disabled') + '>' +
          '<img src="' + g.img + '" alt="">' +
          '<strong>' + g.name + '</strong>' +
          '<span class="locker-badge">' + (got ? "🏅 " + esc(b.name) : "🔒 " + esc(b.how)) + '</span>' +
          (got ? '<span class="locker-state">' + (on ? "Wearing" : "In the bag") + '</span>' : '') +
          '</button>';
      }).join("") + '</div>';
  }
  function openLocker() {
    const p = BD.Store.current(); if (!p) return;
    check(p);
    BD.UI.sheet("Gear locker", lockerHTML(p));
    document.getElementById("infoBody").onclick = function (e) {
      const b = e.target.closest("[data-gear]"); if (!b) return;
      const g = b.dataset.gear, h = p.gearHidden = p.gearHidden || [];
      const i = h.indexOf(g); if (i === -1) h.push(g); else h.splice(i, 1);
      // one pair of gloves at a time
      if (i !== -1 && BD.GearFit.handSlot(g)) BD.GearFit.HANDS.forEach(function (o) { if (o !== g && h.indexOf(o) === -1) h.push(o); });
      BD.Store.save(p); BD.Sound.tap();
      document.getElementById("infoBody").innerHTML = lockerHTML(p);
      if (BD.UI.refreshStage) BD.UI.refreshStage();
    };
  }
  /* Celebrate new badges one at a time. */
  function celebrate(list, done) {
    if (!list || !list.length) { if (done) done(); return; }
    const b = list[0], g = GEAR[b.gear];
    BD.UI.sheet("New gear unlocked!",
      '<div class="unlock"><img class="unlock-img" src="' + g.img + '" alt="">' +
      '<h3>' + g.name + '</h3><p>🏅 <strong>' + esc(b.name) + '</strong> badge: ' + esc(b.how) + '</p>' +
      '<p class="muted">It\'s in your Gear locker, and your champion is wearing it now.</p>' +
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

  return { GEAR: GEAR, BADGES: BADGES, check: check, award: award, earned: earned, equipped: equipped, rack: rack, openLocker: openLocker };
})();
