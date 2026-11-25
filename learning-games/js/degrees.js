/* BLACK BELT DEGREE TEST — after a Black Belt's 4 degree stripes are full,
   a mixed test (math, spelling and reading questions, no hints) promotes them
   to the next degree: 1st, 2nd and 3rd Degree (+250 XP each), 4th and 5th
   Degree (+500 XP each). 5th Degree is Master Rank. 80% to pass; try again
   any time. */
window.BD = window.BD || {};

BD.Degrees = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const COUNT = 15;
  let T = null;

  function makeQuestions(grade) {
    const out = [], kinds = ["math", "spelling", "grammar"];
    for (let i = 0; i < COUNT; i++) {
      const k = kinds[i % 3]; let q = null;
      try { q = k === "math" ? BD.Quick.math(Math.min(BD.MAX_GRADE, grade), grade) : BD.Quick[k](grade); } catch (e) { q = null; }
      out.push(q || BD.Quick.math(grade, grade));
    }
    return out.sort(function () { return Math.random() - 0.5; });
  }

  function start() {
    const p = BD.Store.current(); if (!p) return;
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), d = BD.Rank.degInfo(r);
    if (r.belt < 8 || d.master) return;
    if (!d.ready) {
      BD.UI.sheet("Not yet!", '<div class="unlock"><p>Fill all 4 degree stripes first: <strong>' + d.xp + ' of ' + d.max + ' Belt XP</strong>. Practice any subject to fill them.</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="dgPractice">Practice</button></div></div>');
      $("dgPractice").onclick = function () { $("infoClose").click(); BD.UI.launchStripe(BD.Rank.REQUIRED[0], false); };
      return;
    }
    BD.UI.sheet(d.nextName + " test",
      '<div class="dg-test"><p><strong>' + esc(BD.gradeLabel(g)) + ' · ' + esc(d.name) + '.</strong> ' + COUNT + ' mixed questions from every subject. No hints. Score <strong>' + BD.Rank.PASS + '%</strong> to earn your ' + esc(d.nextName) + ' (+' + d.testXP + ' XP).</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="dgGo">Begin</button></div></div>');
    $("dgGo").onclick = function () { T = { grade: g, qs: makeQuestions(g), i: 0, right: 0, d: d }; ask(); };
  }
  function ask() {
    if (!T) return;
    const body = $("infoBody");
    body.innerHTML = '<div class="dg-test"><p class="eyebrow">' + esc(T.d.nextName) + ' test · ' + (T.i + 1) + ' of ' + COUNT + '</p><div class="dg-bar"><i style="width:' + Math.round(100 * T.i / COUNT) + '%"></i></div><div id="dgQ" class="dg-q"></div></div>';
    const q = T.qs[T.i];
    BD.QuickUI.render($("dgQ"), q, function (v) {
      const ok = v === q.answer; if (ok) { T.right++; BD.Sound.right(); } else BD.Sound.wrong();
      BD.QuickUI.mark($("dgQ"), q, v);
      setTimeout(function () { T.i++; if (T.i >= COUNT) finish(); else ask(); }, ok ? 650 : 1300);
    }, { read: true, grade: T.grade, hints: false });
  }
  function finish() {
    const p = BD.Store.current(), pct = Math.round(100 * T.right / COUNT), t = T; T = null;
    const res = BD.Rank.degreeDone(p, t.grade, pct);
    BD.Store.recordSession(p, { game: "test-degree", grade: t.grade, correct: pct, total: 100, xp: res.xp });
    if (res.passed) {
      BD.Sound.belt(); BD.confetti(260);
      $("infoBody").innerHTML = '<div class="unlock dg-win"><div class="bd-belt">' + BD.Rank.beltSVG(8, {}, { degree: res.to }) + '</div>' +
        '<h3>' + esc(res.title) + '!</h3><p>' + esc(p.name) + ' scored ' + pct + '% and earned the <strong>' + esc(res.title) + '</strong> in ' + esc(BD.gradeLabel(t.grade)) + '. +' + res.xp + ' XP</p>' +
        (res.master ? '<p>Master Rank: every degree earned. Outstanding in the line of discipline!</p>' : '<p class="muted">Next: ' + esc(BD.Rank.DEG_NAMES[Math.min(5, res.to + 1)]) + '. Keep training!</p>') +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="dgCert">Certificate</button><button type="button" class="btn btn-quiet" id="dgDone">Awesome!</button></div></div>';
      $("dgCert").onclick = function () { BD.Certificate.open(p, { to: BD.BELTS[8], grade: t.grade, degree: res.to, date: new Date().toISOString() }); };
      $("dgDone").onclick = function () { $("infoClose").click(); BD.UI.home(); };
      setTimeout(function () { BD.Badges.award(p); }, 1800);
    } else {
      $("infoBody").innerHTML = '<div class="unlock"><h3>Not yet. Keep training!</h3><p>You scored ' + pct + '% (need ' + BD.Rank.PASS + '%). Your degree stripes stay full, so you can try again any time.</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="dgAgain">Try again</button><button type="button" class="btn btn-quiet" id="dgDone">Practice first</button></div></div>';
      $("dgAgain").onclick = function () { start(); };
      $("dgDone").onclick = function () { $("infoClose").click(); BD.UI.launchStripe(BD.Rank.REQUIRED[0], false); };
    }
  }
  function stop() { T = null; }
  return { start: start, stop: stop, COUNT: COUNT };
})();
