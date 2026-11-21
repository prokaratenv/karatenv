/* Screens: choose player, dojo home, results, parent corner. */
window.BD = window.BD || {};

BD.UI = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };

  let currentScreen = null, goingBack = false;
  const trail = [];   // screens visited, for the Back button
  const PLAY = ["screen-math-play", "screen-sentence-play", "screen-read-play", "screen-word-play"];
  function show(id) {
    if (!goingBack && currentScreen && currentScreen !== id) {
      trail.push(currentScreen);
      if (trail.length > 30) trail.shift();
    }
    if (id === "screen-players" || id === "screen-home") trail.length = 0; // home is the top
    currentScreen = id;
    if (BD.Music) BD.Music.forScreen(id);
    document.body.classList.toggle("on-players", id === "screen-players");
    if (id !== "screen-results") BD.confetti.stop();
    document.querySelectorAll(".screen").forEach(function (s) { s.hidden = s.id !== id; });
    if (BD.Mini && $(id).querySelector("[data-mini]")) BD.Mini.fill($(id));
    const p = BD.Store.current();
    $("playerChip").hidden = !p || id === "screen-players";
    if (p) {
      const belt = BD.beltOf(p);
      $("playerChip").innerHTML = avatar(p, "sm") + '<span>' + esc(p.name) + '</span>' + beltSwatch(belt);
    }
    window.scrollTo(0, 0);
  }

  function fighterOf(p) { return p.avatar || BD.Cast.defaultFighter(p); }
  /* The student's character: a cast member, or the fighter they built. */
  function fighterArt(p, mode, outfit) {
    const g = BD.Rank.dojoGrade(p);
    if (fighterOf(p) === "custom") return BD.Builder.svg(p.custom, BD.beltOf(p).color, mode, BD.Cast.ageBand(g), outfit || BD.Badges.outfit(p));
    if (mode === "face") return '<img src="' + BD.Cast.face(fighterOf(p)) + '" alt="' + esc(BD.Cast.name(fighterOf(p))) + '">';
    return champArt(fighterOf(p), BD.beltOf(p).color, g, outfit || BD.Badges.outfit(p));
  }
  /* A playable character wearing the belt the student has earned (white-belt
     art + the belt area tinted) and, for the student characters, their outfit. */
  function champArt(key, beltColor, grade, outfit) {
    const a = BD.Cast.art(key, grade, outfit);
    const m = "url(" + (BD.MASKS && BD.MASKS[a.mask] ? BD.MASKS[a.mask] : "img/mask-" + a.mask + ".png") + ")";
    return '<span class="champ' + (a.band !== null ? " age-" + a.band : "") + '" style="--belt:' + beltColor + '"><img src="' + a.src + '" alt="' + esc(BD.Cast.name(key)) + '">' +
      '<i class="champ-belt" style="-webkit-mask-image:' + m + ';mask-image:' + m + '"></i></span>';
  }
  /* Round portrait of the student's chosen character, ringed in their belt color. */
  function avatar(p, size) {
    const belt = BD.beltOf(p);
    return '<span class="avatar ' + (size || "") + '" style="--av:' + p.color + ';--ring:' + belt.color + '">' + fighterArt(p, "face") + '</span>';
  }
  function openBuilder(p) {
    BD.Builder.open(p.custom, BD.beltOf(p).color, function (cfg) {
      p.custom = cfg; p.avatar = "custom"; BD.Store.save(p); home();
    });
  }
  /* Character picker: kids choose a fighter from the Engage cast. */
  let newFighter = "kimmy";
  function fighterPicker(elId, selected, big) {
    const me = BD.Store.current();
    const beltCol = big && me ? BD.beltOf(me).color : "#FFFFFF";
    const myGrade = me ? BD.Rank.dojoGrade(me) : 3;
    const opt = function (k) {
      return '<button type="button" class="fighter-opt" role="radio" data-fighter="' + k + '" aria-checked="' + (k === selected) + '">' +
        (big ? champArt(k, beltCol, myGrade, me && BD.Cast.KIDS.indexOf(k) !== -1 && BD.Badges.outfitUnlocked(me, BD.Badges.OUTFITS.find(function (o) { return o.id === (me.outfit || "gi"); }) || BD.Badges.OUTFITS[0]) ? me.outfit : "gi") : '<img src="' + BD.Cast.face(k) + '" alt="">') + BD.Cast.name(k) + '</button>';
    };
    const kids = BD.Cast.FIGHTERS.slice(0, 6), teachers = BD.Cast.FIGHTERS.slice(6);
    const customCfg = big && me && me.custom ? me.custom : BD.Builder.DEFAULT;
    const build = '<button type="button" class="fighter-opt build-opt" role="radio" data-fighter="custom" aria-checked="' + (selected === "custom") + '">' +
      '<span class="build-art">' + BD.Builder.svg(customCfg, beltCol, big ? "full" : "face", BD.Cast.ageBand(myGrade)) + '</span>' + (big && me && me.custom ? "My champion" : "Build your own") + '</button>';
    $(elId).innerHTML = '<p class="fighter-group">Create</p>' + build +
      (big && me && me.custom ? '<button type="button" class="fighter-opt edit-opt" data-edit="1"><span class="build-art edit-icon">✎</span>Edit my champion</button>' : '') +
      '<p class="fighter-group">Students</p>' + kids.map(opt).join("") +
      '<p class="fighter-group">Instructors</p>' + teachers.map(opt).join("");
  }
  function beltSwatch(belt) {
    return '<span class="belt-swatch" style="--belt:' + belt.color + '" title="' + belt.name + ' belt"></span>';
  }
  /* ---------- belt rank panel ---------- */
  function rankPanel(p) {
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), belt = BD.BELTS[r.belt];
    const count = BD.Rank.stripeCount(r), xp = BD.Rank.beltXP(r);
    const rows = BD.Rank.SUBJECTS.map(function (sj) {
      const got = !!r.stripes[sj.key], x = Math.min(BD.Rank.PRACTICE_MAX, r.xp[sj.key] || 0);
      return '<div class="stripe-row' + (got ? " earned" : "") + (sj.optional ? " optional" : "") + '">' +
        '<span class="stripe-chip" aria-hidden="true"></span>' +
        '<div class="sr-main"><strong>' + sj.label + (sj.optional ? ' <em>bonus</em>' : '') + '</strong>' +
        '<span class="sr-sub">' + (got ? "Stripe earned" : x + " / 100 practice XP") + (sj.note ? " · " + sj.note : "") + '</span>' +
        '<span class="mini-track"><i style="width:' + x + '%"></i></span></div>' +
        '<div class="sr-actions"><button type="button" class="btn btn-small" data-stripe-practice="' + sj.key + '">Practice</button>' +
        '<button type="button" class="btn btn-small btn-primary" data-stripe-test="' + sj.key + '">' + (got ? "Retest" : "Stripe test") + '</button></div></div>';
    }).join("");
    return '<div class="rank-card">' +
      '<div class="rank-top"><label class="grade-select"><span class="eyebrow">Dojo grade</span><select id="dojoGradeSel">' +
      BD.GRADES.map(function (x) { return '<option value="' + x + '"' + (x === g ? " selected" : "") + '>' + BD.gradeLabel(x) + '</option>'; }).join("") +
      '</select></label><span class="rank-xp">Belt XP <strong>' + xp + '</strong> / 500</span></div>' +
      '<button type="button" class="rank-belt" id="rankBeltBtn" aria-label="See belt details">' + BD.Rank.beltSVG(r.belt, r.stripes) + '<span class="rank-tap">Tap your belt for details</span></button>' +
      '<h2 class="rank-name">' + BD.gradeLabel(g) + ' · ' + belt.name + ' Belt</h2>' +
      (r.mastered ? '<p class="rank-note mastered">Grade mastered! You earned every belt in ' + BD.gradeLabel(g) + '.' + (g < BD.MAX_GRADE ? ' <button type="button" class="btn btn-small btn-primary" id="rankNextGrade">Start ' + BD.gradeLabel(g + 1) + '</button>' : '') + '</p>'
        : '<p class="rank-note">' + count + ' of 4 stripes · score ' + BD.Rank.PASS + '% on a stripe test to earn it · ' + BD.Rank.levelNote(r.belt) + '</p>') +
      '<div class="xp-track"><div class="xp-fill" style="width:' + Math.round(100 * xp / 500) + '%"></div></div>' +
      '<div class="stripe-list">' + rows + '</div></div>';
  }

  /* ---------- belt details (tap the belt) ---------- */
  function beltDetails(g) {
    const p = BD.Store.current(); if (!p) return;
    if (g === undefined) g = BD.Rank.dojoGrade(p);
    const r = BD.Rank.rec(p, g), belt = BD.BELTS[r.belt], next = BD.BELTS[r.belt + 1];
    const tabs = '<div class="bd-grades" role="tablist">' + BD.GRADES.map(function (x) {
      const has = p.rank && p.rank[String(x)], bx = has ? BD.BELTS[p.rank[String(x)].belt] : BD.BELTS[0];
      return '<button type="button" class="bd-grade' + (x === g ? " on" : "") + '" data-bd-grade="' + x + '" role="tab" aria-selected="' + (x === g) + '">' +
        '<span class="belt-swatch" style="--belt:' + bx.color + '"></span>' + BD.gradeShort(x) + '</button>';
    }).join("") + '</div>';
    const rows = BD.Rank.SUBJECTS.map(function (sj) {
      const got = !!r.stripes[sj.key], x = Math.min(100, r.xp[sj.key] || 0);
      return '<tr><th scope="row">' + sj.label + (sj.optional ? ' <em class="bonus">bonus</em>' : '') + '</th>' +
        '<td>' + (got ? '<span class="got">Earned</span>' : '<span class="muted">Not yet</span>') + '</td>' +
        '<td><span class="mini-track"><i style="width:' + x + '%"></i></span><small>' + x + ' / 100 XP</small></td></tr>';
    }).join("");
    const ladder = '<ol class="bd-ladder">' + BD.BELTS.map(function (b, i) {
      const st = i < r.belt || (i === r.belt && r.mastered) ? "done" : i === r.belt ? "now" : "";
      return '<li class="' + st + '"><span class="belt-swatch" style="--belt:' + b.color + '"></span>' + b.name + '</li>';
    }).join("") + '</ol>';
    const grads = r.grads.length ? '<ul class="plan-text bd-grads">' + r.grads.map(function (x, i) {
      return '<li><span>Graduated from ' + BD.BELTS[x.belt].name + ' · ' + new Date(x.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) + '</span>' +
        '<button type="button" class="btn btn-small btn-quiet" data-cert="' + i + '">Certificate</button></li>';
    }).join("") + '</ul>' : '<p class="muted">No graduations yet at this grade.</p>';
    const nextLine = r.mastered ? "Grade mastered! Every belt earned." : next ? "Next belt: <strong>" + next.name + "</strong>. Earn the " + (4 - BD.Rank.stripeCount(r)) + " remaining stripe" + (4 - BD.Rank.stripeCount(r) === 1 ? "" : "s") + " to graduate." : "Black Belt is the top belt. Earn all 4 stripes to master " + BD.gradeLabel(g) + ".";
    sheet("My belt",
      tabs +
      '<div class="bd-belt">' + BD.Rank.beltSVG(r.belt, r.stripes) + '</div>' +
      '<h3 class="bd-name">' + BD.gradeLabel(g) + ' · ' + belt.name + ' Belt</h3>' +
      '<p class="bd-next">' + BD.Rank.stripeCount(r) + ' of 4 stripes · ' + nextLine + '</p>' +
      '<p class="bd-xp">Belt XP <strong>' + BD.Rank.beltXP(r) + '</strong> / 500 <span class="muted">(up to 100 per stripe from practice + a graduation bonus of up to 100, earned by that practice)</span></p>' +
      '<div class="table-wrap"><table class="grid bd-table"><thead><tr><th>Stripe</th><th>Status</th><th>Practice XP</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<h4 class="label">Belt path</h4>' + ladder +
      '<h4 class="label">Graduations</h4>' + grads +
      (g !== BD.Rank.dojoGrade(p) ? '<div class="res-actions"><button type="button" class="btn btn-primary" id="bdTrain">Train at ' + BD.gradeLabel(g) + '</button></div>' : '<p class="muted small">This is the grade you are training at now.</p>'));
    $("infoBody").onclick = function (e) {
      const t = e.target.closest("[data-bd-grade]");
      if (t) { beltDetails(Number(t.dataset.bdGrade)); return; }
      const c = e.target.closest("[data-cert]");
      if (c) {
        const x = r.grads[Number(c.dataset.cert)], last = BD.BELTS.length - 1;
        BD.Certificate.open(p, { to: BD.BELTS[Math.min(last, x.belt + 1)], grade: g, mastered: x.belt === last, date: x.date });
        return;
      }
      if (e.target.id === "bdTrain") { p.dojoGrade = g; BD.Store.save(p); closeSheet(); home(); }
    };
    const tabsEl = $("infoBody").querySelector(".bd-grades"), on = tabsEl && tabsEl.querySelector(".bd-grade.on");
    if (on) tabsEl.scrollLeft = Math.max(0, on.offsetLeft - tabsEl.clientWidth / 2 + on.clientWidth / 2);
    $("infoBody").scrollTop = 0;
  }

  /* Start practice or a stripe test for a subject at the dojo grade. */
  function launchStripe(key, test) {
    const p = BD.Store.current(), g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g);
    const stripe = { grade: g, belt: r.belt, test: !!test };
    if (key === "math") BD.MathGame.start("practice", null, stripe);
    else if (key === "reading") BD.SentenceGame.start(null, stripe);
    else if (key === "comprehension") BD.Reading.start(null, stripe);
    else BD.WordQuiz.start(key, stripe);
  }
  function confirmTest(key) {
    const p = BD.Store.current(), g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), sj = BD.Rank.subject(key);
    const what = { math: "20 problems", reading: "8 sentences to fix", spelling: "10 words to spell", comprehension: "2 stories with 6 questions", spanish: "10 Spanish words" }[key];
    sheet(sj.label + " stripe test",
      '<p><strong>' + BD.gradeLabel(g) + ' · ' + BD.BELTS[r.belt].name + ' Belt.</strong> ' + what + '. No hints. Score <strong>' + BD.Rank.PASS + '%</strong> or better to earn your ' + sj.label + ' stripe.</p>' +
      (function () {
        const x = Math.min(100, r.xp[key] || 0), last = !r.stripes[key] && BD.Rank.stripeCount(r) === 3 && !sj.optional;
        if (x >= 100 && !last) return '<p class="muted">All 100 practice XP earned for this stripe. You can take the test any time, and try again as often as you need.</p>';
        if (last) return '<div class="xp-warn"><strong>🎓 This is your last stripe: passing it graduates you!</strong><p>Your graduation bonus comes from practice: right now it would be <strong>+' + BD.Rank.gradBonus(r) + ' XP</strong> of 100. ' +
          (BD.Rank.beltXP(r) < 400 ? 'Practice XP you haven\'t earned on this belt (' + (400 - BD.Rank.beltXP(r)) + ' left) is gone once you move up. Practice first to grow your bonus and climb the leaderboard!' : 'You did all the practice. Full bonus!') + '</p></div>';
        return '<div class="xp-warn"><strong>⚠️ The test doesn\'t give points. Practice does.</strong><p>You have ' + x + ' of 100 practice XP for this stripe. You can still practice after you earn it, until you move up a belt. Doing the work is what climbs the leaderboard.</p></div>';
      })() +
      '<div class="res-actions">' + ((r.xp[key] || 0) < 100 || (!r.stripes[key] && BD.Rank.stripeCount(r) === 3 && BD.Rank.beltXP(r) < 400) ? '<button type="button" class="btn btn-primary btn-big" id="testPractice">Practice first</button><button type="button" class="btn btn-quiet" id="testGo">Take the test now</button>' :
        '<button type="button" class="btn btn-primary btn-big" id="testGo">Start the test</button><button type="button" class="btn btn-quiet" id="testPractice">Practice more</button>') + '</div>');
    $("testGo").onclick = function () { closeSheet(); launchStripe(key, true); };
    $("testPractice").onclick = function () { closeSheet(); launchStripe(key, false); };
  }

  /* Banner + hidden helpers while a stripe test or belt practice runs. */
  /* noHints: Brown, Red and Black belts work on their own (no hints, tiles, rule books or Sensei). */
  function testMode(screenId, label, noHints) {
    const scr = $(screenId);
    let b = scr.querySelector(".mode-banner");
    if (!b) { b = document.createElement("p"); b.className = "mode-banner"; scr.insertBefore(b, scr.firstChild); }
    b.textContent = (label || "") + (noHints && label ? " · no hints" : ""); b.hidden = !label;
    scr.classList.toggle("testing", /stripe test/i.test(label || ""));
    scr.classList.toggle("no-hints", !!noHints);
  }

  /* After a stripe test. */
  let lastStripe = null;
  function stripeResult(o) {
    const p = BD.Store.current();
    const res = BD.Rank.testDone(p, o.subject, o.grade, o.pct);
    lastStripe = o;
    const sj = BD.Rank.subject(o.subject);
    BD.Store.recordSession(p, { game: "test-" + o.subject, grade: o.grade, correct: o.pct, total: 100, xp: res.graduated ? res.graduated.bonus : 0 });
    $("stripeSub").textContent = sj.label + " stripe test · " + BD.gradeLabel(o.grade);
    $("stripeTitle").textContent = res.passed ? (res.already ? "Stripe kept strong!" : sj.label + " stripe earned!") : "Not yet. Keep training!";
    $("stripeScore").textContent = o.score + " · " + o.pct + "%" + (res.passed ? "" : " (need " + BD.Rank.PASS + "%)");
    const r = BD.Rank.rec(p, o.grade);
    const shownBelt = res.graduated ? res.beltBefore : r.belt;
    const shownStripes = res.graduated ? BD.Rank.REQUIRED.reduce(function (a, k) { a[k] = true; return a; }, {}) : r.stripes;
    $("stripeBelt").innerHTML = BD.Rank.beltSVG(shownBelt, shownStripes, { newStripe: res.passed && !res.already ? o.subject : null });
    $("stripeSay").textContent = "Zumi: " + (res.passed ? BD.Cast.line("win") : BD.Cast.line("retry"));
    $("stripeReview").hidden = !o.review || !o.review.length;
    $("stripeReviewList").innerHTML = (o.review || []).slice(0, 12).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    $("stripeRetry").hidden = res.passed;
    $("stripeHome").textContent = res.graduated ? "Graduate!" : "Back to my belt";
    $("stripeHome").onclick = function () { if (res.graduated) graduation(res); else home(); };
    $("stripePractice").onclick = function () { launchStripe(o.subject, false); };
    $("stripeRetry").onclick = function () { o.again(); };
    show("screen-stripe");
    if (res.passed) { BD.Sound.win(); BD.confetti(res.graduated ? 160 : 90); } else BD.Sound.wrong();
    BD.Dojo.push();
    if (!res.graduated) setTimeout(function () { if (currentScreen === "screen-stripe" && !sheetOpen()) BD.Badges.award(p); }, 1400);
  }

  /* Graduation celebration. */
  function graduation(res) {
    const p = BD.Store.current(), gr = res.graduated;
    $("gradChamp").innerHTML = fighterArt(p, "full");
    $("gradLine").innerHTML = gr.mastered
      ? esc(p.name) + " earned all 4 stripes on the <strong>Black Belt</strong>. " + BD.gradeLabel(gr.grade) + " mastered!"
      : esc(p.name) + " graduated from <strong>" + gr.from.name + "</strong> to <strong>" + gr.to.name + " Belt</strong> in " + BD.gradeLabel(gr.grade) + "!";
    $("gradBelt").innerHTML = BD.Rank.beltSVG(BD.BELTS.indexOf(gr.to), gr.mastered ? BD.Rank.REQUIRED.reduce(function (a, k) { a[k] = true; return a; }, {}) : {});
    $("gradBelt").style.setProperty("--belt", gr.to.color);
    $("gradSay").textContent = "Zumi: " + BD.Cast.line("win") + " Bow in to your new belt!";
    $("gradXP").textContent = gr.bonus ? "+" + gr.bonus + " XP graduation bonus" + (gr.bonus < BD.Rank.GRAD_XP ? " (practice every stripe to 100 for the full +100)" : " · full bonus for doing all the practice!") : "No graduation bonus this time: it comes from practice. Practice each stripe to 100 on your next belt for +100!";
    $("gradNextGrade").hidden = !(gr.mastered && gr.grade < BD.MAX_GRADE);
    $("gradNextGrade").onclick = function () { p.dojoGrade = gr.grade + 1; BD.Store.save(p); home(); };
    $("gradCert").onclick = function () { BD.Certificate.open(p, { to: gr.to, grade: gr.grade, mastered: gr.mastered, date: new Date().toISOString() }); };
    show("screen-grad");
    setTimeout(function () { if (currentScreen === "screen-grad" && !sheetOpen()) BD.Badges.award(p); }, 2600);
    BD.Sound.belt(); BD.confetti(260);
    setTimeout(function () { BD.confetti(180); }, 900);
  }

  /* Leaving the app mid-round (switching apps, locking the phone, closing
     the tab): bank the XP earned so far and push the save right away. */
  function saveEverything() {
    [BD.MathGame, BD.SentenceGame, BD.Reading, BD.WordQuiz].forEach(function (g) { if (g && g.bankNow) try { g.bankNow(); } catch (e) { /* keep going */ } });
    if (BD.Sync && BD.Sync.flushNow) BD.Sync.flushNow();
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") saveEverything(); });
  window.addEventListener("pagehide", saveEverything);

  /* ---------- Back button ---------- */
  function stopGames() {
    if (BD.MathGame.stop) BD.MathGame.stop();
    if (BD.SentenceGame.stop) BD.SentenceGame.stop();
    if (BD.Reading.stop) BD.Reading.stop();
    if (BD.WordQuiz.stop) BD.WordQuiz.stop();
    if (BD.Boss) BD.Boss.stop();
    if (BD.Duel) BD.Duel.stop();
  }
  function back() {
    BD.Sound.tap();
    stopGames();
    let target = null;
    while (trail.length) {
      const t = trail.pop();
      if (t !== currentScreen && PLAY.indexOf(t) === -1) { target = t; break; }
    }
    goingBack = true;
    try {
      if (target === "screen-math-setup") BD.MathGame.openSetup();
      else if (target === "screen-parent") parent();
      else if (target === "screen-players") players();
      else if (target === "screen-results" && lastResult) results(lastResult, true);
      else if (BD.Store.current()) home();
      else players();
    } finally { goingBack = false; }
  }

  /* ---------- grade levels (each game has its own) ---------- */
  const GRADE_FIELD = { math: "mathGrade", sentence: "sentenceGrade", reading: "readingGrade", spanish: "spanishGrade", spelling: "spellingGrade" };
  /* Change one game's grade. Going DOWN is always allowed, even during a redo
     (it ends the redo). Going UP waits until the redo is passed. */
  function setGrade(game, g) {
    const p = BD.Store.current(); if (!p) return false;
    p.retry = p.retry || {};
    const r = p.retry[game];
    if (r && g > r.grade) return false;
    if (r && g < r.grade) p.retry[game] = null;
    p[GRADE_FIELD[game]] = g;
    BD.Store.save(p);
    return true;
  }
  /* The grade drop-down shown inside each game. */
  function syncGradeSelect(selId, game) {
    const p = BD.Store.current(), sel = $(selId);
    const r = p.retry && p.retry[game];
    const cur = p[GRADE_FIELD[game]];
    sel.innerHTML = BD.GRADES.map(function (g) {
      return '<option value="' + g + '"' + (r && g > r.grade ? " disabled" : "") + '>' + BD.gradeLabel(g) + (r && g > r.grade ? " (locked)" : "") + '</option>';
    }).join("");
    sel.value = String(cur);
  }

  function gradePicker(id, selected, locked) {
    return '<div class="chips grade-chips" id="' + id + '" role="group" aria-label="Grade level">' +
      BD.GRADES.map(function (g) {
        return '<button type="button" class="chip' + (g === selected ? " on" : "") + '" data-grade="' + g + '" aria-pressed="' + (g === selected) + '"' + (locked && g > selected ? " disabled" : "") + ' title="' + BD.gradeLabel(g) + '">' + BD.gradeShort(g) + '</button>';
      }).join("") + '</div>';
  }

  /* ---------- choose player ---------- */
  /* The welcome screen: one big button. "Start here" for a new family,
     "Resume my training" for whoever trained last. */
  function lastPlayer() {
    const list = BD.Store.players();
    return BD.Store.current() || list.slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); })[0] || null;
  }
  function showAddForm() {
    $("addPlayerForm").hidden = false;
    $("addPlayerForm").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(function () { $("newName").focus(); }, 350);
  }
  function players() {
    const all = BD.Store.players(), last = lastPlayer();
    if (last) {
      const belt = BD.beltOf(last);
      $("welcomeCta").innerHTML =
        '<button type="button" class="btn btn-primary btn-big cta-main" id="welcomeResume">' + avatar(last, "md") +
        '<span class="cta-text"><span class="cta-title">Resume my training</span><span class="cta-sub">' + esc(last.name) + ' · ' + BD.gradeLabel(BD.Rank.dojoGrade(last)) + ' · ' + belt.name + ' Belt</span></span><span class="cta-arrow" aria-hidden="true">▶</span></button>' +
        '<button type="button" class="btn btn-quiet cta-new" id="welcomeNew">＋ New student</button>';
      $("zumiSay").textContent = "Welcome back, " + last.name + "! Tap the big button to keep training.";
    } else {
      $("welcomeCta").innerHTML = '<button type="button" class="btn btn-primary btn-big cta-main cta-start" id="welcomeStart"><span class="cta-text"><span class="cta-title">Start here</span><span class="cta-sub">Add your name and pick your champion</span></span><span class="cta-arrow" aria-hidden="true">▶</span></button>';
      $("zumiSay").textContent = "Hi, I'm Zumi! Tap Start here to begin your training.";
    }
    $("addPlayerForm").hidden = true;
    const others = all.filter(function (p) { return !last || p.id !== last.id; });
    $("switchLabel").hidden = !others.length;
    $("playerList").innerHTML = others.map(function (p) {
      const belt = BD.beltOf(p);
      return '<button type="button" class="player-card" data-id="' + p.id + '">' + avatar(p, "lg") +
        '<span class="pc-name">' + esc(p.name) + '</span>' +
        '<span class="pc-belt">' + beltSwatch(belt) + BD.gradeShort(BD.Rank.dojoGrade(p)) + ' · ' + belt.name + ' Belt</span></button>';
    }).join("");
    $("newGrade").innerHTML = BD.GRADES.map(function (g) { return '<option value="' + g + '">' + BD.gradeLabel(g) + '</option>'; }).join("");
    $("newGrade").value = "3";
    fighterPicker("newFighter", newFighter, false);
    BD.Leads.welcomeLink();
    BD.Family.welcome();
    show("screen-players");
  }

  /* ---------- dojo home ---------- */
  function home() {
    const p = BD.Store.current();
    if (!p) return players();
    const today = BD.today();
    const todays = p.sessions.filter(function (s) { return s.date && s.date.slice(0, 10) === today; }).length;
    $("homeHello").textContent = "Ready to train, " + p.name + "?";
    $("homeFighter").innerHTML = fighterArt(p, "full");
    refreshStage();
    BD.Dojo.render();
    BD.Boss.card(p);
    setTimeout(function () { if (currentScreen === "screen-home" && !sheetOpen()) BD.Badges.award(BD.Store.current(), refreshStage); }, 500);
    $("homeBelt").innerHTML = rankPanel(p);
    $("homeToday").textContent = todays ? todays + (todays === 1 ? " round" : " rounds") + " completed today" : "No rounds yet today";
    const saved = BD.Quest.protect(p);
    const st = BD.streak(p);
    $("homeStreak").innerHTML = saved ? '<span class="flame" aria-hidden="true">🛡️</span> Your streak shield saved your ' + st.days + '-day streak!' : st.days >= 1
      ? '<span class="flame" aria-hidden="true">🔥</span> ' + st.days + "-day streak" + (st.today ? "" : ' <span class="muted">· train today to keep it!</span>')
      : '<span class="flame" aria-hidden="true">🔥</span> Start a streak today!';
    $("homeStreak").classList.toggle("lit", st.today);
    const retry = p.retry || {};
    if (retry.sentence) p.sentenceGrade = retry.sentence.grade;
    if (retry.math) p.mathGrade = retry.math.grade;
    $("homeMathGrade").innerHTML = gradePicker("mathHomePick", p.mathGrade, !!retry.math);
    $("homeSentGrade").innerHTML = gradePicker("sentGradePick", p.sentenceGrade, !!retry.sentence);
    if (retry.reading) p.readingGrade = retry.reading.grade;
    $("homeReadGrade").innerHTML = gradePicker("readGradePick", p.readingGrade, !!retry.reading);
    if (retry.spelling) p.spellingGrade = retry.spelling.grade;
    if (retry.spanish) p.spanishGrade = retry.spanish.grade;
    $("homeSpellGrade").innerHTML = gradePicker("spellGradePick", p.spellingGrade, !!retry.spelling);
    $("homeSpanishGrade").innerHTML = gradePicker("spanishGradePick", p.spanishGrade, !!retry.spanish);
    const hasSchool = BD.School.has(p);
    $("homeSchool").hidden = !hasSchool;
    $("homeSchool").innerHTML = hasSchool ? '<button type="button" class="gt-inner" data-school="practice"><span class="gt-emoji" aria-hidden="true">📝</span><span class="gt-name">School Words</span><span class="gt-grade">' + BD.School.masteredCount(p) + ' of ' + BD.School.words(p).length + ' mastered</span></button>' +
      '<button type="button" class="gt-test" data-school="test">Word test</button>' : "";
    [["gtMath", "mathGrade"], ["gtSent", "sentenceGrade"], ["gtRead", "readingGrade"], ["gtSpell", "spellingGrade"], ["gtSpanish", "spanishGrade"]].forEach(function (x) { $(x[0]).textContent = BD.gradeLabel(p[x[1]]); });
    $("flashCard").innerHTML = BD.MathGame.flashTile(p);
    beltSummary(p);
    const notes = [];
    if (retry.math) notes.push("<strong>Math Dojo:</strong> redo " + BD.gradeLabel(retry.math.grade) + " " + retry.math.ops.map(function (o) { return BD.MathGame.OPS[o].sym; }).join(" ") + " and score " + BD.MathGame.PASS + "% to unlock other levels.");
    if (retry.sentence) notes.push("<strong>Fix-It Sentences:</strong> redo " + BD.gradeLabel(retry.sentence.grade) + " and fix " + BD.SentenceGame.PASS + "% to unlock other grades.");
    $("homeRedo").innerHTML = notes.map(function (n) { return "<p>" + n + "</p>"; }).join("");
    $("homeRedo").hidden = true; // redo items are shown in Sensei's plan instead
    renderPlan(p);
    BD.Quest.render(p);
    show("screen-home");
  }

  /* The one-line belt summary; tapping it opens stripes, practice and tests. */
  function beltSummary(p) {
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), sc = BD.Rank.stripeCount(r);
    $("beltSummary").innerHTML = '<span class="bs-belt">' + BD.Rank.beltSVG(r.belt, r.stripes) + '</span>' +
      '<span class="bs-txt"><strong>' + BD.gradeLabel(g) + ' · ' + BD.BELTS[r.belt].name + ' Belt</strong><span class="muted small">' + (r.mastered ? "Grade mastered!" : sc + " of 4 stripes · " + BD.Rank.beltXP(r) + " / 500 belt XP") + '</span></span>' +
      '<span class="bs-open">Stripes &amp; tests <span aria-hidden="true">›</span></span>';
    try { $("beltFold").open = sessionStorage.getItem("bd.beltOpen") === "1"; } catch (e) { /* default closed */ }
  }

  /* Gear the champion is wearing, under the home stage. */
  function refreshStage() {
    const p = BD.Store.current(); if (!p) return;
    const n = BD.Badges.earned(p).length;
    $("homeGear").innerHTML = "";
    $("gearLabel").textContent = n ? "Gear locker · " + n + "/" + BD.Badges.BADGES.length : "Gear locker · earn gear!";
  }

  /* ---------- Sensei's plan ---------- */
  let planItems = [];
  function renderPlan(p) {
    planItems = BD.Coach.plan(p);
    const first = nextStep(p);
    $("startNext").textContent = first ? "Next: " + first.title : "";
    $("homePlan").hidden = true; // Start training runs Sensei's top pick; the list stays off the home screen to keep it simple
    $("homePlanList").innerHTML = planItems.map(function (it, i) {
      return '<button type="button" class="plan-item plan-' + it.kind + '" data-plan="' + i + '"><strong>' + esc(it.title) + '</strong><span>' + esc(it.sub) + '</span></button>';
    }).join("");
  }
  /* The one-tap "Start training" pick: Sensei's top suggestion, or practice
     for the stripe with the least XP at their dojo grade. */
  function nextStep(p) {
    if (planItems[0]) return planItems[0];
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g);
    const open = BD.Rank.SUBJECTS.filter(function (s) { return !s.optional && !r.stripes[s.key]; });
    if (!open.length) return { kind: "mathStart", title: "Warm up with Math Dojo" };
    const low = open.sort(function (a, b) { return (r.xp[a.key] || 0) - (r.xp[b.key] || 0); })[0];
    return { kind: "stripePractice", subject: low.key, title: "Practice " + low.label + " for your stripe" };
  }
  function startTraining() {
    const p = BD.Store.current(); if (!p) return;
    BD.Sound.tap();
    runPlan(nextStep(p));
  }
  function runPlan(it) {
    const p = BD.Store.current();
    if (it.kind === "mathRetry" || it.kind === "mathStart") BD.MathGame.openSetup();
    else if (it.kind === "mathFocus") BD.MathGame.start("practice", [it.op]);
    else if (it.kind === "mathUp") { p.mathGrade = it.grade; BD.Store.save(p); BD.MathGame.openSetup(); }
    else if (it.kind === "sentRetry") BD.SentenceGame.start();
    else if (it.kind === "sentFocus") BD.SentenceGame.start(it.type);
    else if (it.kind === "sentUp") { p.sentenceGrade = it.grade; BD.Store.save(p); home(); }
    else if (it.kind === "readRetry" || it.kind === "readStart") BD.Reading.start();
    else if (it.kind === "readFocus") BD.Reading.start(it.type);
    else if (it.kind === "readUp") { p.readingGrade = it.grade; BD.Store.save(p); home(); }
    else if (it.kind === "spanishRetry" || it.kind === "spellingRetry") BD.WordQuiz.start(it.game);
    else if (it.kind === "stripeTest") confirmTest(it.subject);
    else if (it.kind === "stripePractice") launchStripe(it.subject, false);
    else if (it.kind === "school") BD.WordQuiz.start("spelling", null, "practice");
    else if (it.kind === "schoolTest") BD.WordQuiz.start("spelling", null, "test");
  }

  /* Re-draw when progress arrives from another device. */
  function refresh() {
    if (currentScreen === "screen-home") home();
    else if (currentScreen === "screen-players") players();
    else if (currentScreen === "screen-parent") parent();
    else if (BD.Store.current() === null && currentScreen !== "screen-players") players();
  }

  /* ---------- results ---------- */
  let lastResult = null;
  function results(o, quiet) {
    lastResult = o;
    $("resTitle").textContent = o.title;
    $("resSubtitle").textContent = o.subtitle;
    $("resStats").innerHTML = o.stats.map(function (s) {
      return '<div class="stat"><span class="stat-val">' + esc(s[1]) + '</span><span class="stat-label">' + esc(s[0]) + '</span></div>';
    }).join("");
    const p = BD.Store.current();
    const rk = o.belt || {};
    const sjr = BD.Rank.subject(rk.subject) || { label: "" };
    $("resBelt").innerHTML = rk.subject ? '<div class="belt-row stripe-xp">' +
      '<div class="belt-text"><strong>' + sjr.label + ' stripe practice</strong>' +
      '<span>' + (rk.gained ? "+" + rk.gained + " XP · " : "") + rk.now + " / 100 XP on your " + BD.gradeLabel(rk.grade) + " " + rk.belt.name + " Belt" +
      (rk.locked ? "" : rk.earned > rk.gained ? " (this stripe's practice is maxed at 100, so extra XP doesn't add up)" : "") + '</span>' +
      '<div class="xp-track"><div class="xp-fill" style="width:' + rk.now + '%"></div></div>' +
      (rk.hasStripe ? '<span class="muted">You already have this stripe. Practice still earns XP for it (up to 100) until you move up a belt.</span>' : '<button type="button" class="btn btn-small btn-primary" id="resStripeTest">' + (rk.maxed ? "All 100 XP! Take the " + sjr.label + " stripe test" : "Take the " + sjr.label + " stripe test") + '</button>' + (rk.maxed ? "" : '<span class="muted small">Tests don\'t give points. ' + (100 - rk.now) + ' more practice XP is waiting for this stripe.</span>')) +
      '</div></div>' : "";
    if ($("resStripeTest")) $("resStripeTest").onclick = function () { p.dojoGrade = rk.grade; BD.Store.save(p); confirmTest(rk.subject); };
    $("resFailed").hidden = !o.failed;
    $("resFailedText").textContent = o.failed || "";
    $("resPassed").hidden = !o.passedRetry;
    $("resPassed").textContent = o.passedRetry || "";
    $("resCoach").hidden = !o.coachNote;
    $("resCoach").textContent = o.coachNote || "";
    $("resLesson").hidden = !o.lesson;
    $("resLessonBody").innerHTML = o.lesson || "";
    $("resListTitle").textContent = o.listTitle || "";
    $("resListTitle").hidden = !o.listTitle;
    $("resList").innerHTML = (o.list || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    $("resLevel").hidden = !o.levelUp;
    if (o.levelUp) $("resLevelText").textContent = o.levelUp.text;
    $("resAgain").textContent = o.againLabel || "Play again";
    $("resSay").textContent = "Zumi: " + (o.failed ? BD.Cast.line("retry") : BD.Cast.line("right"));
    $("resSetup").hidden = !o.setup;
    show("screen-results");
    BD.Dojo.push();
    setTimeout(function () { BD.Mini.react("bow"); }, 350);
    setTimeout(function () { if (currentScreen === "screen-results" && !sheetOpen()) BD.Badges.award(BD.Store.current()); }, 1400);
    if (quiet) { /* returning with Back: no fanfare */ }
    else if (!o.failed) { BD.Sound.win(); BD.confetti(80); }
  }

  /* ---------- parent corner ---------- */
  function redoList(p) {
    const r0 = p.retry || {}, names = { sentence: "Fix-It Sentences", reading: "Story Scrolls", spelling: "Spelling Bee", spanish: "Spanish Dojo" };
    const out = [];
    if (r0.math) out.push("Math Dojo " + BD.gradeLabel(r0.math.grade) + " (" + r0.math.ops.map(function (o) { return BD.MathGame.OPS[o].label.toLowerCase(); }).join(", ") + ")");
    Object.keys(names).forEach(function (k) { if (r0[k]) out.push(names[k] + " " + BD.gradeLabel(r0[k].grade)); });
    return out;
  }
  function pct(r, w) { return r + w ? Math.round(100 * r / (r + w)) + "%" : "–"; }
  /* Grades with any activity (so the tables skip empty columns). */
  function playedGrades(p) {
    const set = new Set([BD.Rank.dojoGrade(p)]);
    (p.sessions || []).forEach(function (x) { if (x.grade !== undefined) set.add(Number(x.grade)); });
    Object.keys(p.rank || {}).forEach(function (g) { set.add(Number(g)); });
    Object.keys(p.mathStats || {}).forEach(function (k) { set.add(Number(k.split("-")[0])); });
    ["sentenceStats", "readStats"].forEach(function (f) { Object.keys(p[f] || {}).forEach(function (g) { set.add(Number(g)); }); });
    Object.values(p.wordStats || {}).forEach(function (m) { Object.keys(m || {}).forEach(function (g) { set.add(Number(g)); }); });
    return BD.GRADES.filter(function (g) { return set.has(g); });
  }
  function parent() {
    const list = BD.Store.players();
    $("parentLead").innerHTML = BD.Family.cardHTML() + BD.Leads.ownerHTML(); $("parentLead").hidden = !$("parentLead").innerHTML; BD.Leads.bindOwner(); BD.Family.bindCard(parent);
    if (list.length && BD.Leads.locked()) {
      // The report unlocks with a free parent sign-up (students play free regardless).
      BD.Leads.renderUnlock($("parentBody"), parent);
      $("parentBody").insertAdjacentHTML("beforeend", '<div class="ur-manage"><h4 class="label">Manage students</h4>' + list.map(function (p) {
        return '<div class="report-actions" data-id="' + p.id + '">' + avatar(p, "sm") + '<strong>' + esc(p.name) + '</strong><button type="button" class="btn btn-small btn-quiet" data-act="backup">Back up progress</button></div>';
      }).join("") + '</div>');
      show("screen-parent"); return;
    }
    if (!list.length) { $("parentBody").innerHTML = '<p class="muted">No students yet.</p>'; show("screen-parent"); return; }
    $("parentBody").innerHTML = list.map(function (p) {
      const belt = BD.beltOf(p);
      const cols = playedGrades(p);
      const opRows = Object.keys(BD.MathGame.OPS).map(function (op) {
        return '<tr><th scope="row">' + BD.MathGame.OPS[op].sym + " " + BD.MathGame.OPS[op].label + '</th>' + cols.map(function (g) {
          const s = p.mathStats[g + "-" + op]; return '<td>' + (s ? pct(s.r, s.w) + '<small>' + (s.r + s.w) + '</small>' : "–") + '</td>';
        }).join("") + '</tr>';
      }).join("");
      const sentRow = '<tr><th scope="row">Fix-It Sentences</th>' + cols.map(function (g) {
        const s = p.sentenceStats[g]; return '<td>' + (s ? pct(s.r, s.w) + '<small>' + (s.r + s.w) + '</small>' : "–") + '</td>';
      }).join("") + '</tr>';
      const tricky = Object.values(p.tricky).sort(function (a, b) { return b.misses - a.misses; }).slice(0, 16);
      const recent = p.sessions.slice(0, 8).map(function (s) {
        const d = new Date(s.date);
        const what = s.game === "boss" ? "Boss Battle · " + (s.boss || "") + (s.won ? " (won)" : "") : s.game === "duel" ? "Partner Challenge vs " + (s.vs || "") + (s.won ? " (won)" : "") : String(s.game).indexOf("test-") === 0 ? "Stripe test" : s.game === "spelling" ? "Spelling Bee" : s.game === "spanish" ? "Spanish Dojo" : s.game === "reading" ? "Story Scrolls" : s.game === "math" ? "Math · " + (s.mode === "clock" ? "Speed" : "Practice") + " · " + s.ops.map(function (o) { return BD.MathGame.OPS[o].sym; }).join("") : "Sentences";
        return '<tr><td>' + d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + '</td><td>' + what + '</td><td>' + BD.gradeShort(s.grade) + '</td><td>' + s.correct + "/" + s.total + '</td><td>+' + s.xp + '</td></tr>';
      }).join("");
      const readRow = '<tr><th scope="row">Story Scrolls</th>' + cols.map(function (g) {
        const s = p.readStats[g]; return '<td>' + (s ? pct(s.r, s.w) + '<small>' + (s.r + s.w) + '</small>' : "–") + '</td>';
      }).join("") + '</tr>' + Object.keys(BD.READ_TYPES).map(function (t) {
        return '<tr><th scope="row" class="indent">' + BD.READ_TYPES[t].label + '</th>' + cols.map(function (g) {
          const a = (p.readRecent[g] || {})[t]; return '<td>' + (a && a.length ? Math.round(100 * BD.Coach.rate(a)) + "%<small>" + a.length + "</small>" : "–") + '</td>';
        }).join("") + '</tr>';
      }).join("");
      const wordRows = [["spelling", "Spelling Bee"], ["spanish", "Spanish Dojo"]].map(function (gm) {
        return '<tr><th scope="row">' + gm[1] + '</th>' + cols.map(function (g) {
          const s = (p.wordStats[gm[0]] || {})[g]; return '<td>' + (s ? pct(s.r, s.w) + '<small>' + (s.r + s.w) + '</small>' : "–") + '</td>';
        }).join("") + '</tr>';
      }).join("");
      const typeRow = '<tr><th scope="row">First-try rate by mistake type</th>' + cols.map(function () { return "<td></td>"; }).join("") + '</tr>';
      const typeRows = Object.keys(BD.FIX_TYPES).map(function (t) {
        return '<tr><th scope="row" class="indent">' + BD.FIX_TYPES[t].label + '</th>' + cols.map(function (g) {
          const a = (p.typeRecent[g] || {})[t]; return '<td>' + (a && a.length ? Math.round(100 * BD.Coach.rate(a)) + "%<small>" + a.length + "</small>" : "–") + '</td>';
        }).join("") + '</tr>';
      }).join("");
      const plan = BD.Coach.plan(p);
      return '<article class="report">' +
        '<header class="report-head">' + avatar(p, "lg") + '<div><h3>' + esc(p.name) + '</h3><p class="muted">' + belt.name + ' Belt · ' + p.xp.toLocaleString() + ' XP · practiced ' + p.days.length + (p.days.length === 1 ? " day" : " days") + '</p></div></header>' +
        BD.Parent.card(p) +
        BD.School.parentHTML(p) +
        (redoList(p).length ? '<div class="redo-note"><strong>Redo needed</strong><p>' + redoList(p).join(", ") +
          '. Scored under ' + BD.MathGame.PASS + '%, so this level stays locked in until they pass it.</p><button type="button" class="btn btn-small" data-act="clearRedo">Unlock all levels</button></div>' : '') +
        '<div class="pd-actions" data-id="' + p.id + '"><button type="button" class="btn btn-primary" data-act="share">Share this week</button>' +
        '<button type="button" class="btn btn-quiet" data-act="challenge">' + (p.dojoOptIn ? "Dojo Challenge: on" : "Join the Dojo Challenge") + '</button></div>' +
        '<details class="report-more"><summary>See details</summary>' +
        '<h4 class="label">Belts by grade</h4><p class="belt-summary">' + Object.keys(p.rank || {}).map(Number).sort(function (a, b) { return a - b; }).map(function (g) {
          const r = BD.Rank.rec(p, g);
          return '<span>' + beltSwatch(BD.BELTS[r.belt]) + ' <strong>' + BD.gradeShort(g) + '</strong> ' + BD.BELTS[r.belt].name + (r.mastered ? " (mastered)" : " · " + BD.Rank.stripeCount(r) + "/4 stripes") + (r.stripes.spanish ? " + Spanish" : "") + '</span>';
        }).join("") + '</p>' +
        '<h4 class="label">Accuracy by grade <span class="muted">(number answered underneath)</span></h4>' +
        '<div class="table-wrap"><table class="grid"><thead><tr><th></th>' + cols.map(function (g) { return '<th>' + BD.gradeShort(g) + '</th>'; }).join("") + '</tr></thead><tbody>' + opRows + sentRow + typeRow + typeRows + readRow + wordRows + '</tbody></table></div>' +
        (plan.length ? '<h4 class="label">What Sensei is working on next</h4><ul class="plan-text">' + plan.map(function (it) { return '<li><strong>' + esc(it.title) + '.</strong> ' + esc(it.sub) + '</li>'; }).join("") + '</ul>' : '') +
        '<h4 class="label">Tricky math facts</h4>' +
        (tricky.length ? '<ul class="tricky">' + tricky.map(function (t) { return '<li>' + BD.MathGame.show(t) + '</li>'; }).join("") + '</ul><p class="muted small">These come back in practice rounds until they are answered correctly.</p>' : '<p class="muted">None right now.</p>') +
        '<h4 class="label">Recent rounds</h4>' +
        (recent ? '<div class="table-wrap"><table class="grid recent"><tbody>' + recent + '</tbody></table></div>' : '<p class="muted">No rounds yet.</p>') +
        '</details>' +
        '<div class="report-actions" data-id="' + p.id + '">' +
        '<button type="button" class="btn btn-primary" data-act="backup">Back up progress</button>' +
        '<button type="button" class="btn btn-quiet" data-act="reset">Reset progress</button>' +
        '<button type="button" class="btn btn-quiet danger" data-act="remove">Remove student</button>' +
        '<span class="confirm" hidden><span class="confirm-text"></span> <button type="button" class="btn btn-small danger" data-act="yes">Yes</button> <button type="button" class="btn btn-small" data-act="no">Cancel</button></span>' +
        '</div></article>';
    }).join("");
    show("screen-parent");
  }

  /* ---------- wiring ---------- */
  function bind() {
    $("welcomeCta").addEventListener("click", function (e) {
      if (e.target.closest("#welcomeResume")) { const p = lastPlayer(); if (p) { BD.Store.setCurrent(p.id); BD.Sound.tap(); home(); } }
      else if (e.target.closest("#welcomeStart, #welcomeNew")) { BD.Sound.tap(); showAddForm(); }
    });
    $("playerList").addEventListener("click", function (e) {
      const b = e.target.closest("[data-id]"); if (!b) return;
      BD.Store.setCurrent(b.dataset.id); BD.Sound.tap(); home();
    });
    $("addPlayerForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const name = $("newName").value.trim().slice(0, 20);
      if (!name) { $("newName").focus(); return; }
      const np = BD.Store.addPlayer(name, Number($("newGrade").value), newFighter === "custom" ? null : newFighter);
      if (newFighter === "custom") { home(); openBuilder(np); return; }
      $("newName").value = "";
      home();
    });
    $("playerChip").addEventListener("click", players);
    $("brandHome").addEventListener("click", function () { BD.Store.current() ? home() : players(); });
    $("muteBtn").addEventListener("click", soundMenu);
    $("parentBtn").addEventListener("click", function () { BD.Parent.gate(parent); });
    $("parentBack").addEventListener("click", back);
    [["homeMathGrade", "math"], ["homeSentGrade", "sentence"], ["homeReadGrade", "reading"], ["homeSpellGrade", "spelling"], ["homeSpanishGrade", "spanish"]].forEach(function (pair) {
      $(pair[0]).addEventListener("click", function (e) {
        const b = e.target.closest("[data-grade]"); if (!b || b.disabled) return;
        if (setGrade(pair[1], Number(b.dataset.grade))) { BD.Sound.tap(); home(); }
      });
    });
    $("playMath").addEventListener("click", function () { BD.MathGame.openSetup(); });
    $("playSent").addEventListener("click", function () { BD.SentenceGame.start(); });
    $("homeBelt").addEventListener("click", function (e) {
      const pr = e.target.closest("[data-stripe-practice]"), te = e.target.closest("[data-stripe-test]");
      if (pr) launchStripe(pr.dataset.stripePractice, false);
      else if (te) confirmTest(te.dataset.stripeTest);
      else if (e.target.closest("#rankBeltBtn")) beltDetails();
      else if (e.target.id === "rankNextGrade") { const p = BD.Store.current(); p.dojoGrade = BD.Rank.dojoGrade(p) + 1; BD.Store.save(p); home(); }
    });
    $("homeBelt").addEventListener("change", function (e) {
      if (e.target.id !== "dojoGradeSel") return;
      const p = BD.Store.current(); p.dojoGrade = Number(e.target.value); BD.Store.save(p); BD.Sound.tap(); home();
    });
    $("gradContinue").addEventListener("click", home);
    $("startTraining").addEventListener("click", startTraining);
    $("gearBtn").addEventListener("click", function () { BD.Badges.openLocker(); });
    $("dojoCard").addEventListener("click", function () { BD.Dojo.openBoard(); });
    $("flashCard").addEventListener("click", function () { BD.MathGame.openFlash(); });
    $("beltFold").addEventListener("toggle", function () { try { sessionStorage.setItem("bd.beltOpen", $("beltFold").open ? "1" : "0"); } catch (e) { /* ignore */ } });
    $("parentHow").addEventListener("click", function () {
      sheet("How Brain Dojo works",
        '<h4 class="label">Belts and stripes</h4><p>Each grade has its own belt path: White, Yellow, Orange, Blue, Green, Purple, Brown, Red, Black. A belt needs 4 stripes (Math, Reading, Spelling, Comprehension), each earned by scoring 85% on a stripe test. The 4th stripe graduates them to the next belt. Spanish is a bonus stripe.</p>' +
        '<h4 class="label">Practice and hints</h4><p>Points come from doing the work. Practice earns up to 100 XP per stripe; stripe tests add no XP (practice to 56, pass the test, and it stays 56). They can keep practicing a stripe after earning it, until they move up a belt. Graduating adds a bonus earned by practice: a quarter of the belt\'s practice XP (all 400 = +100; tests only = +0). The Dojo leaderboard ranks XP earned this week, so practice beats rushing tests. White through Purple belts can use hints. Brown, Red and Black belts work without them. Pre-K to 1st grade hear instructions read aloud.</p>' +
        '<h4 class="label">Badges and gear</h4><p>Badges for streaks, perfect rounds, stripes and belts unlock real Engage gear for their champion, from a mouthguard to MMA gloves.</p>' +
        '<h4 class="label">Saving</h4><p>Progress saves automatically, even mid-round. Opened from the shared link while signed in to Claude, it is kept in that Claude account and follows you to any device. Otherwise it stays in this browser. Use <strong>Back up progress</strong> to get a save code that moves a student to another device or restores them if the browser is cleared.</p>' +
        '<h4 class="label">Parent PIN</h4><p>The Parent corner is protected by your PIN so kids can\'t reset or remove progress. Forgot it? Tap Forgot PIN and answer the grown-up math question.</p>');
    });
    $("playRead").addEventListener("click", function () { BD.Reading.start(); });
    $("playSpell").addEventListener("click", function () { BD.WordQuiz.start("spelling"); });
    $("playSpanish").addEventListener("click", function () { BD.WordQuiz.start("spanish"); });
    $("homeSchool").addEventListener("click", function (e) { const b = e.target.closest("[data-school]"); if (b) BD.WordQuiz.start("spelling", null, b.dataset.school); });
    $("homePlanList").addEventListener("click", function (e) {
      const b = e.target.closest("[data-plan]"); if (b && planItems[Number(b.dataset.plan)]) runPlan(planItems[Number(b.dataset.plan)]);
    });
    $("mathSetupBack").addEventListener("click", back);
    $("resAgain").addEventListener("click", function () { lastResult && lastResult.again(); });
    $("resSetup").addEventListener("click", function () { lastResult && lastResult.setup && lastResult.setup(); });
    $("resHome").addEventListener("click", home);
    $("resLevelBtn").addEventListener("click", function () { lastResult && lastResult.levelUp && lastResult.levelUp.action(); });
    $("parentBody").addEventListener("click", function (e) {
      const b = e.target.closest("[data-act]"); if (!b) return;
      const box = b.closest(".report-actions") || b.closest(".report").querySelector(".report-actions"), id = box.dataset.id, confirm = box.querySelector(".confirm");
      const p = BD.Store.get(id);
      if (b.dataset.act === "clearRedo") {
        const pl = BD.Store.get(b.closest(".report").querySelector(".report-actions").dataset.id);
        pl.retry = {}; BD.Store.save(pl); parent(); return;
      }
      if (b.dataset.act === "backup") { BD.Backup.openBackup(p); return; }
      if (b.dataset.act === "school") { BD.School.openEditor(p, parent); return; }
      if (b.dataset.act === "share") { BD.Parent.share(p); return; }
      if (b.dataset.act === "challenge") { if (BD.Dojo) BD.Dojo.toggle(p, parent); return; }
      if (b.dataset.act === "reset" || b.dataset.act === "remove") {
        box.dataset.pending = b.dataset.act;
        confirm.querySelector(".confirm-text").textContent = b.dataset.act === "reset" ? "Erase all of " + p.name + "'s XP and stats?" : "Remove " + p.name + " and all progress?";
        confirm.hidden = false;
      } else if (b.dataset.act === "no") confirm.hidden = true;
      else if (b.dataset.act === "yes") {
        if (box.dataset.pending === "reset") BD.Store.resetPlayer(id); else BD.Store.removePlayer(id);
        parent();
      }
    });
    $("infoClose").addEventListener("click", closeSheet);
    $("restoreBtn").addEventListener("click", function () { BD.Backup.openRestore(); });
    $("infoSheet").addEventListener("click", function (e) { if (e.target === $("infoSheet")) closeSheet(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("infoSheet").hidden) closeSheet(); });
    BD.Scratch.bind();
    BD.Boss.bind();
    BD.Duel.bind();
    BD.MathGame.bind();
    BD.SentenceGame.bind();
    BD.Reading.bind();
    BD.WordQuiz.bind();
    BD.Sensei.bind();
    $("newFighter").addEventListener("click", function (e) {
      const b = e.target.closest("[data-fighter]"); if (!b) return;
      newFighter = b.dataset.fighter; BD.Sound.tap(); fighterPicker("newFighter", newFighter, false);
    });
    $("changeFighter").addEventListener("click", function () {
      const p = BD.Store.current(); if (!p) return;
      fighterPicker("fighterPick", fighterOf(p), true);
      $("fighterSheet").hidden = false; document.body.classList.add("sheet-lock");
    });
    const closeFighter = function () { $("fighterSheet").hidden = true; document.body.classList.remove("sheet-lock"); };
    $("fighterClose").addEventListener("click", closeFighter);
    $("fighterSheet").addEventListener("click", function (e) { if (e.target === $("fighterSheet")) closeFighter(); });
    $("fighterPick").addEventListener("click", function (e) {
      const p = BD.Store.current();
      if (e.target.closest("[data-edit]")) { closeFighter(); openBuilder(p); return; }
      const b = e.target.closest("[data-fighter]"); if (!b) return;
      if (b.dataset.fighter === "custom" && !p.custom) { closeFighter(); openBuilder(p); return; }
      p.avatar = b.dataset.fighter; BD.Store.save(p);
      BD.Sound.right(); closeFighter(); home();
    });
    BD.Builder.bind();
    BD.Quest.bind();
    BD.Leads.bind();
  }
  /* OFFLINE: keep the app on the device (own website only; not inside Claude). */
  function offline() {
    const ok = "serviceWorker" in navigator && (location.protocol === "https:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) && !(window.claude && window.claude.use);
    if (ok) {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        // once settled, fetch the rest of the pictures in the background
        setTimeout(function () { const w = reg.active || reg.waiting || reg.installing; if (w) w.postMessage({ type: "warm" }); }, 8000);
      }).catch(function () { /* plays online only */ });
    }
    const note = function () {
      document.body.classList.toggle("is-offline", !navigator.onLine);
      const el = $("syncStatus"); if (!el || (BD.Family && BD.Family.linked())) return;
      if (!navigator.onLine) { el.dataset.state = "offline"; el.textContent = "Offline · playing and saving on this device"; }
      else if (el.dataset.state === "offline") { el.dataset.state = BD.Sync && BD.Sync.connected() ? "synced" : "local"; el.textContent = BD.Sync && BD.Sync.connected() ? BD.Sync.label() : "Saved on this device"; }
    };
    window.addEventListener("online", function () { note(); if (BD.Sync && BD.Sync.flushNow) BD.Sync.flushNow(); });
    window.addEventListener("offline", note);
    note();
  }

  /* A simple pop-up sheet for lessons and rule books. */
  function sheet(title, html) {
    $("infoBody").onclick = null;
    $("infoTitle").textContent = title;
    $("infoBody").innerHTML = html;
    $("infoSheet").hidden = false;
    document.body.classList.add("sheet-lock");
    setTimeout(function () { $("infoClose").focus(); }, 50);
  }
  function closeSheet() { if (BD.Music) BD.Music.back(); $("infoSheet").hidden = true; if ($("senseiSheet").hidden) document.body.classList.remove("sheet-lock"); }
  function sheetOpen() { return !$("infoSheet").hidden || !$("senseiSheet").hidden; }

  function syncMute() {
    document.body.classList.toggle("no-speech", !BD.Speech.available || BD.Store.muted);
    const m = BD.Music.prefs().music, fx = !BD.Store.muted;
    $("muteBtn").textContent = m && fx ? "🔊 Sound" : m || fx ? "🔉 Sound" : "🔇 Sound";
    $("muteBtn").setAttribute("aria-label", "Sound settings: music " + (m ? "on" : "off") + ", sound effects " + (fx ? "on" : "off"));
  }
  /* Sound menu: music on/off and volume, sound effects (and read-aloud voice) on/off. */
  function soundMenu() {
    const draw = function () {
      const m = BD.Music.prefs(), fx = !BD.Store.muted;
      sheet("Sound",
        '<div class="sound-menu">' +
        '<label class="sound-row"><span><strong>🎵 Music</strong><span class="muted small">Calm music in the dojo, adventure on the map, boss music in battles.</span></span>' +
        '<input type="checkbox" class="switch" id="sndMusic"' + (m.music ? " checked" : "") + '></label>' +
        '<label class="sound-vol' + (m.music ? "" : " off") + '"><span>Music volume</span><input type="range" id="sndVol" min="5" max="100" step="5" value="' + m.vol + '"' + (m.music ? "" : " disabled") + '></label>' +
        '<label class="sound-row"><span><strong>🔔 Sound effects &amp; voice</strong><span class="muted small">Dings, cheers and read-aloud instructions.</span></span>' +
        '<input type="checkbox" class="switch" id="sndFx"' + (fx ? " checked" : "") + '></label></div>');
      $("sndMusic").onchange = function () { BD.Music.set({ music: this.checked }); syncMute(); draw(); };
      $("sndVol").oninput = function () { BD.Music.set({ vol: Number(this.value) }); };
      $("sndFx").onchange = function () { BD.Store.muted = !this.checked; if (BD.Store.muted) BD.Speech.stop(); else BD.Sound.tap(); syncMute(); };
    };
    draw();
  }

  function init() {
    bind(); syncMute(); BD.Sensei.init();
    BD.Store.onChange(refresh);
    BD.Sync.init();
    BD.Dojo.init();
    players(); // always open on the welcome screen: Start here / Resume my training
    BD.Family.init();
    offline();
  }

  return { championHTML: function (p, outfit) { return fighterArt(p, "full", outfit); }, refreshStage: refreshStage, fighterKey: function (p) { return fighterOf(p); }, beltDetails: beltDetails, testMode: testMode, stripeResult: stripeResult, back: back, setGrade: setGrade, syncGradeSelect: syncGradeSelect, refresh: refresh, sheet: sheet, sheetOpen: sheetOpen, show: show, esc: esc, home: home, players: players, results: results, gradePicker: gradePicker, init: init };
})();

document.addEventListener("DOMContentLoaded", BD.UI.init);
