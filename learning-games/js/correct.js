/* RIGHT ANSWERS — every right answer in practice and games earns +2 XP for the
   leaderboard (separate from the belt meters, so XP keeps flowing after the
   day's belt power is used). Up to 600 right answers a day earn the +2.
   Stripe tests, Degree Tests and Duels don't count. Also keeps each student's
   right answers this week, for the Dojo goal (3,000 right answers a week
   together) and the weekly parent email. */
window.BD = window.BD || {};

BD.Correct = (function () {
  const XP = 2, DAY_CAP = 600;
  let round = 0;
  /* The Dojo week (same week the leaderboard uses), as a local date key. */
  function weekKey() {
    const d = new Date(BD.Parent && BD.Parent.weekStart ? BD.Parent.weekStart() : Date.now());
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function week(p) { const w = weekKey(); if (!p.caw || p.caw.w !== w) p.caw = { w: w, n: 0 }; return p.caw; }
  function day(p) { const t = BD.today(); if (!p.ca || p.ca.d !== t) p.ca = { d: t, n: 0 }; return p.ca; }
  /* One right answer. el: optional element to float "+2" from. */
  function hit(p, el) {
    p = p || BD.Store.current(); if (!p) return 0;
    week(p).n++;
    const d = day(p); if (d.n >= DAY_CAP) return 0;
    d.n++; round++;
    BD.addXP(p, XP);
    float(el);
    return XP;
  }
  function float(el) {
    try {
      const f = document.createElement("span"); f.className = "ca-plus"; f.textContent = "+" + XP;
      const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      f.style.left = (r ? r.left + r.width / 2 : innerWidth / 2) + "px"; f.style.top = (r ? r.top : innerHeight * 0.4) + "px";
      document.body.appendChild(f); setTimeout(function () { f.remove(); }, 1000);
    } catch (e) { /* no screen */ }
  }
  function thisWeek(p) { return p ? week(p).n : 0; }
  function sanitize(p) {
    if (p.ca && !(typeof p.ca === "object" && /^\d{4}-\d\d-\d\d$/.test(p.ca.d))) delete p.ca;
    else if (p.ca) p.ca = { d: p.ca.d, n: Math.max(0, Math.min(DAY_CAP, Math.round(Number(p.ca.n) || 0))) };
    if (p.caw && !(typeof p.caw === "object" && /^\d{4}-\d\d-\d\d$/.test(p.caw.w))) delete p.caw;
    else if (p.caw) p.caw = { w: p.caw.w, n: Math.max(0, Math.min(100000, Math.round(Number(p.caw.n) || 0))) };
  }
  // a new round starts the "+N XP for right answers" count again
  BD.on("screen", function (id) { if (/-play$|^screen-(boss|tourney)$/.test(id) && id !== "screen-duel") round = 0; });
  BD.on("results", function (e) {
    if (!round) return; const box = document.getElementById("resBelt"); if (!box) return;
    const n = round / XP; round = 0;
    box.insertAdjacentHTML("afterbegin", '<p class="ca-line">+' + (n * XP) + ' XP for ' + n + ' right answer' + (n === 1 ? '' : 's') + ' · ' + thisWeek(e.p) + ' right this week</p>');
  });
  return { hit: hit, thisWeek: thisWeek, sanitize: sanitize, XP: XP, DAY_CAP: DAY_CAP };
})();
