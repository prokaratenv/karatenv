/* TOURNAMENTS — single-elimination brackets of 6 to 12 competitors.
   Enter as many as you like. Medals: Gold +10 XP, Silver +7.5, Bronze +5
   (both semifinal losers take bronze, like martial arts tournaments),
   and double XP on weekends.
   - Kata (opens at Yellow Belt with 2 stripes): perform by getting answers
     right in a row; the longer the run (up to 15), the higher the score.
   - Sparring (opens at Orange Belt): head to head against a computer
     opponent, first to 5 points. Judo Moves (Green Belt) add judo throws.
   - Weapons (opens at Green Belt): a kata performed with a weapon you've
     earned. Weapons are for show only: never used against anyone.
   Questions mix every subject at the student's dojo grade and belt. */
window.BD = window.BD || {};

BD.Tourney = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const MEDAL_XP = { gold: 10, silver: 7.5, bronze: 5 };
  const KATA_MAX = 15, SPAR_TO = 5;
  const TYPES = {
    kata: { name: "Kata Tournament", icon: "🥋", opens: "Yellow Belt with 2 stripes", about: "Perform a kata: get answers right in a row. Up to 15 in a row; the longer your run, the higher the judges' score." },
    sparring: { name: "Sparring Tournament", icon: "🥊", opens: "Orange Belt", about: "Head to head against your opponent: first to 5 points wins the match." },
    weapons: { name: "Weapons Tournament", icon: "🏯", opens: "Green Belt", about: "Perform a weapons form: get answers right in a row with the weapon you choose. Weapons are for show only." }
  };
  let T = null, M = null;

  function isWeekend() { const d = new Date().getDay(); return d === 0 || d === 6; }
  function open(p, type) {
    if (type === "kata") return BD.Badges.yellowStripes(p) >= 2 || BD.Badges.reached(p, 2);
    if (type === "sparring") return BD.Badges.reached(p, 2);
    if (type === "weapons") return BD.Badges.reached(p, 4) && BD.Badges.weapons(p).length > 0;
    return false;
  }
  function medals(p) { return Array.isArray(p.medals) ? p.medals : []; }
  function sanitize(p) {
    if (p.chDone !== undefined) p.chDone = Array.isArray(p.chDone) ? p.chDone.filter(function (x) { return typeof x === "string" && /^[a-f0-9]{12}$/.test(x); }).slice(-60) : [];
    p.medals = medals(p).filter(function (m) { return m && TYPES[m.t] && MEDAL_XP[m.m] && typeof m.d === "string" && /^\d{4}-\d\d-\d\dT/.test(m.d); })
      .slice(-300).map(function (m) { return { t: m.t, m: m.m, d: m.d.slice(0, 30) }; });
  }
  function count(p, m) { return medals(p).filter(function (x) { return x.m === m; }).length; }

  /* ---------- home card + hub ---------- */
  function card(p) {
    const el = $("tourneyCard"); if (!el || !p) return;
    const any = Object.keys(TYPES).some(function (t) { return open(p, t); });
    el.innerHTML = '<span class="duel-icon" aria-hidden="true">' + BD.Icon.svg("trophy", 28) + '</span><span><strong>Tournaments</strong><span class="boss-sub">' +
      (any ? (count(p, "gold") + count(p, "silver") + count(p, "bronze") ? "🥇" + count(p, "gold") + " 🥈" + count(p, "silver") + " 🥉" + count(p, "bronze") : "Kata · Sparring · Weapons") : "Opens at Yellow Belt · 2 stripes") +
      (isWeekend() ? " · 2× XP today!" : "") + (BD.Challenge ? esc(BD.Challenge.homeLine(p)) : "") + '</span></span>';
    if (BD.Challenge && BD.Challenge.on() && !card.busy) { card.busy = true; BD.Challenge.refresh().then(function () { card.busy = false; const n = BD.Store.current(); if (n && n.id === p.id && el.isConnected) { const sub = el.querySelector(".boss-sub"); if (sub && sub.textContent.indexOf("⚔️") === -1 && BD.Challenge.homeLine(n)) sub.textContent += BD.Challenge.homeLine(n); } }); }
  }
  function hub(opts) {
    const p = BD.Store.current(); if (!p) return;
    stopMatch(); T = null;
    $("tnTitle").textContent = "Tournaments";
    $("tnBody").innerHTML =
      '<div class="tn-head"><p>Single-elimination brackets of 6 to 12 competitors. Enter as many as you like!</p>' +
      '<p class="tn-prizes">🥇 Gold <strong>+' + MEDAL_XP.gold * (isWeekend() ? 2 : 1) + ' XP</strong> · 🥈 Silver <strong>+' + MEDAL_XP.silver * (isWeekend() ? 2 : 1) + '</strong> · 🥉 Bronze <strong>+' + MEDAL_XP.bronze * (isWeekend() ? 2 : 1) + '</strong>' +
      (isWeekend() ? ' <span class="tn-weekend">🎉 Weekend: double XP!</span>' : ' <span class="muted small">(double XP on weekends)</span>') + '</p>' +
      '<p class="tn-case">Your medals: 🥇 ' + count(p, "gold") + ' · 🥈 ' + count(p, "silver") + ' · 🥉 ' + count(p, "bronze") + '</p></div>' +
      (BD.Challenge ? BD.Challenge.hubSection(p) : '') +
      '<div class="tn-types">' + Object.keys(TYPES).map(function (t) {
        const o = TYPES[t], ok = open(p, t);
        return '<button type="button" class="tn-type' + (ok ? "" : " locked") + '" data-tn="' + t + '"' + (ok ? "" : " disabled") + '>' +
          '<span class="tn-icon" aria-hidden="true">' + o.icon + '</span><strong>' + o.name + '</strong><span>' + esc(o.about) + '</span>' +
          '<em>' + (ok ? "Enter" : "🔒 Opens at " + o.opens + (t === "weapons" && BD.Badges.reached(p, 4) ? " (earn a weapon)" : "")) + '</em></button>';
      }).join("") + '</div>' +
      '<div class="tn-friend"><span>Want to spar a friend instead? Two players, one screen.</span><button type="button" class="btn btn-small btn-quiet" id="tnFriend">⚔️ Partner Challenge</button></div>';
    if (BD.Challenge && BD.Challenge.on() && opts !== true) BD.Challenge.refresh(true).then(function () { if (!T && !M && !$("screen-tourney").hidden && BD.Store.current() === p) hub(true); });
    $("tnBody").onclick = async function (e) {
      if (BD.Challenge && await BD.Challenge.hubClick(e)) return;
      const b = e.target.closest("[data-tn]"); if (b && !b.disabled) { BD.Sound.tap(); return b.dataset.tn === "weapons" ? pickWeapon() : enter(b.dataset.tn); }
      if (e.target.closest("#tnFriend")) $("duelCard").click();
    };
    BD.UI.show("screen-tourney");
    if (BD.Music) BD.Music.scene("map");
  }
  function pickWeapon(then) {
    const p = BD.Store.current(), list = BD.Badges.weapons(p);
    $("tnBody").innerHTML = '<div class="tn-head"><h2>Choose your weapon</h2><p class="muted">Weapons are for show: you perform a form with it for the judges. They\'re never used against anyone.</p></div>' +
      '<div class="tn-weapons">' + list.map(function (w) { const g = BD.Badges.GEAR[w]; return '<button type="button" class="tn-weapon" data-w="' + w + '"><img src="' + g.img + '" alt=""><strong>' + esc(g.name) + '</strong></button>'; }).join("") + '</div>' +
      '<div class="res-actions"><button type="button" class="btn btn-quiet" id="tnBackHub">‹ Back</button></div>';
    $("tnBody").onclick = function (e) {
      const b = e.target.closest("[data-w]"); if (b) { BD.Sound.tap(); return then ? then(b.dataset.w) : enter("weapons", b.dataset.w); }
      if (e.target.closest("#tnBackHub")) hub();
    };
  }

  /* ---------- the bracket ---------- */
  function competitorName(used) {
    for (let i = 0; i < 50; i++) { const n = BD.Dojo.randomNick("") || ("Champion " + (10 + i)); if (used.indexOf(n) === -1) { used.push(n); return n; } }
    return "Champion " + used.length;
  }
  function enter(type, weapon) {
    const p = BD.Store.current(); if (!p || !open(p, type)) return hub();
    const size = 6 + Math.floor(Math.random() * 7), slots = size <= 8 ? 8 : 16, used = [];
    const people = [{ name: BD.Dojo.display(p), you: true, skill: 0.6 }];
    for (let i = 1; i < size; i++) people.push({ name: competitorName(used), you: false, skill: 0.35 + Math.random() * 0.5 });
    // byes go to the first entries in the draw; you are placed at random
    const order = people.slice(1).sort(function () { return Math.random() - 0.5; });
    order.splice(Math.floor(Math.random() * (order.length + 1)), 0, people[0]);
    const byes = slots - size, first = [];
    let k = 0;
    for (let m = 0; m < slots / 2; m++) {
      const a = order[k++], b = m < byes ? null : order[k++];
      first.push({ a: a, b: b, w: b ? null : a, score: b ? null : "bye" });
    }
    const rounds = [first];
    for (let n = slots / 4; n >= 1; n /= 2) rounds.push(Array.from({ length: n }, function () { return { a: null, b: null, w: null, score: null }; }));
    T = { type: type, weapon: weapon || null, size: size, rounds: rounds, r: 0, out: false, grade: BD.Rank.dojoGrade(p), belt: BD.Rank.rec(p, BD.Rank.dojoGrade(p)).belt, right: 0, asked: 0 };
    feed(0);
    // drew a bye? the other first-round matches are fought, and you start in round 2
    if (!yourMatch()) { T.rounds[0].forEach(function (x) { if (!x.w && x.a && x.b) simulate(x); }); feed(0); T.r = 1; }
    const bye = !!first.find(function (m) { return m.w && m.w.you && m.score === "bye"; });
    bracket("Your bracket: " + size + " competitors. " + (bye ? "You drew a bye (a free pass) into round 2. " : "") + "Win " + (rounds.length - (bye ? 1 : 0)) + " matches for gold!");
  }
  const roundName = function (i) { const left = T.rounds.length - i; return left === 1 ? "Final" : left === 2 ? "Semifinals" : left === 3 ? "Quarterfinals" : "Round 1"; };
  /* Move this round's winners into the next round. */
  function feed(i) {
    const next = T.rounds[i + 1]; if (!next) return;
    T.rounds[i].forEach(function (m, j) { if (m.w) { const slot = next[Math.floor(j / 2)]; if (j % 2) slot.b = m.w; else slot.a = m.w; } });
  }
  function simulate(m) {
    const p = m.a.skill / (m.a.skill + m.b.skill);
    m.w = Math.random() < p ? m.a : m.b;
    if (T.type === "sparring") { const l = Math.floor(Math.random() * SPAR_TO); m.score = SPAR_TO + "–" + l; }
    else { const hi = 6 + Math.floor(Math.random() * 9), lo = Math.max(1, hi - 1 - Math.floor(Math.random() * 4)); m.score = hi + " vs " + lo; }
  }
  function yourMatch() { return T.rounds[T.r].find(function (m) { return !m.w && ((m.a && m.a.you) || (m.b && m.b.you)); }); }
  function bracket(msg) {
    const o = TYPES[T.type], mine = !T.out && yourMatch();
    $("tnTitle").textContent = o.icon + " " + o.name + (T.weapon ? " · " + BD.Badges.GEAR[T.weapon].name : "");
    $("tnBody").innerHTML = (msg ? '<p class="tn-msg">' + esc(msg) + '</p>' : '') +
      '<div class="tn-bracket">' + T.rounds.map(function (round, i) {
        const shown = i === 0 ? round.filter(function (m) { return m.score !== "bye"; }) : round;
        if (!shown.length) return "";
        return '<div class="tn-round' + (i === T.r ? " now" : "") + '"><h4 class="label">' + roundName(i) + '</h4>' + shown.map(function (m) {
          const row = function (c) { return c ? '<span class="tn-c' + (c.you ? " you" : "") + (m.w === c ? " win" : m.w ? " lose" : "") + '">' + esc(c.name) + (c.you ? " (you)" : "") + '</span>' : '<span class="tn-c tbd">' + (m.score === "bye" ? "bye" : "—") + '</span>'; };
          return '<div class="tn-m">' + row(m.a) + row(m.b) + (m.score && m.score !== "bye" ? '<span class="tn-score">' + esc(m.score) + '</span>' : '') + '</div>';
        }).join("") + '</div>';
      }).join("") + '</div>' +
      '<div class="res-actions">' + (mine ? '<button type="button" class="btn btn-primary btn-big" id="tnPlay">' + (roundName(T.r) === "Final" ? "🏆 Go for gold!" : "Start your " + roundName(T.r).toLowerCase().replace(/s$/, "") + " match") + '</button>' : '') +
      '<button type="button" class="btn btn-quiet" id="tnLeave">' + (mine ? "Leave tournament" : "Back") + '</button></div>';
    $("tnBody").onclick = function (e) {
      if (e.target.closest("#tnPlay")) return play(mine);
      if (e.target.closest("#tnLeave")) return hub();
    };
    BD.UI.show("screen-tourney");
    if (BD.Music) BD.Music.scene("map");
  }

  /* ---------- your match ---------- */
  function q() {
    const belt = T.type === "weapons" ? Math.min(8, T.belt + 1) : T.belt;
    return BD.Quick.question(T.grade, belt);
  }
  function play(m) {
    const opp = m.a.you ? m.b : m.a, lvl = Math.min(0.95, opp.skill + 0.06 * T.r);
    M = { m: m, opp: opp, lvl: lvl, streak: 0, best: 0, timers: [] };
    if (T.type === "sparring") return spar();
    kata();
  }
  function stopMatch() { if (M) M.timers.forEach(clearTimeout); M = null; }
  function later(fn, ms) { const id = setTimeout(fn, ms); M.timers.push(id); return id; }
  function done(won, score) {
    const m = M.m, you = m.a.you ? m.a : m.b;
    m.w = won ? you : M.opp; m.score = score;
    stopMatch();
    if (!won) T.out = true;
    // the rest of this round, then (if you're out) the rest of the tournament
    const finishRound = function (i) { T.rounds[i].forEach(function (x) { if (!x.w && x.a && x.b) simulate(x); }); feed(i); };
    finishRound(T.r);
    if (T.out) { for (let i = T.r + 1; i < T.rounds.length; i++) finishRound(i); return result(); }
    if (T.r === T.rounds.length - 1) return result();
    T.r++;
    bracket(won ? "You won! On to the " + roundName(T.r).toLowerCase() + "." : "");
  }

  /* Kata and Weapons: the opponent performs, then you try to beat their run. */
  function oppRun(lvl) { let n = 0; const p = Math.min(0.94, 0.55 + 0.4 * lvl); while (n < KATA_MAX && Math.random() < p) n++; return n; }
  const judges = function (n) { return (5 + 5 * n / KATA_MAX).toFixed(1); };
  function kata() {
    const target = oppRun(M.lvl);
    M.target = target;
    const weapon = T.weapon ? BD.Badges.GEAR[T.weapon] : null;
    $("tnBody").innerHTML = '<div class="tn-perf">' + (weapon ? '<img class="tn-wimg" src="' + weapon.img + '" alt="">' : '') +
      '<p><strong>' + esc(M.opp.name) + '</strong> performed a ' + (weapon ? weapon.name.toLowerCase() + ' form' : 'kata') + ': <strong>' + target + ' in a row</strong> · judges\' score <strong>' + judges(target) + '</strong></p>' +
      '<p class="tn-goal">Your turn! Get <strong>' + (target + 1) + '</strong> or more right in a row to win (up to ' + KATA_MAX + ').</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="tnBegin">Bow in and begin</button></div></div>';
    $("tnBody").onclick = function (e) { if (e.target.closest("#tnBegin")) { BD.Sound.tap(); if (BD.Music) BD.Music.scene("focus"); kataQ(); } };
  }
  function kataQ() {
    if (!M) return;
    const weapon = T.weapon ? BD.Badges.GEAR[T.weapon] : null;
    M.q = q(); M.busy = false;
    $("tnBody").innerHTML = '<div class="tn-kata"><div class="tn-run">' + (weapon ? '<img class="tn-wimg sm" src="' + weapon.img + '" alt="">' : '<span class="mini-champ" data-mini></span>') +
      '<div><span class="tn-k">In a row</span><strong id="tnRun">' + M.streak + '</strong><span class="tn-k">/ ' + KATA_MAX + '</span></div>' +
      (M.target === null ? '<div><span class="tn-k">Judges</span><strong>' + judges(M.streak) + '</strong></div></div>' : '<div><span class="tn-k">To beat</span><strong>' + M.target + '</strong></div></div>') +
      '<div class="tn-meter"><i style="width:' + (100 * M.streak / KATA_MAX) + '%"></i>' + (M.target === null ? '' : '<b style="left:' + (100 * M.target / KATA_MAX) + '%"></b>') + '</div>' +
      '<div class="qq-card"><div id="tnQ"></div></div></div>';
    if (BD.Mini && !weapon) BD.Mini.fill($("tnBody"));
    BD.QuickUI.render($("tnQ"), M.q, kataPick, { read: true, grade: T.grade, hints: true });
  }
  function kataPick(v) {
    if (!M || M.busy) return;
    M.busy = true; T.asked++;
    BD.QuickUI.mark($("tnQ"), M.q, v);
    if (v === M.q.answer) {
      M.streak++; T.right++; if (BD.Correct) BD.Correct.hit(BD.Store.current()); BD.Sound.right(); if (BD.Mini) BD.Mini.react("kick");
      if (M.streak >= KATA_MAX) return later(function () { kataEnd(); }, 600);
      later(kataQ, 550);
    } else { BD.Sound.wrong(); later(kataEnd, 1300); }
  }
  function kataEnd() {
    if (T.ch) return chFinish(M.streak);
    const mine = M.streak, target = M.target;
    if (mine === target) return suddenDeath(mine);
    const won = mine > target;
    showOutcome(won, "You: " + mine + " in a row (score " + judges(mine) + ") · " + M.opp.name + ": " + target + " (" + judges(target) + ")", mine + " vs " + target);
  }
  function suddenDeath(n) {
    M.q = q(); M.busy = false;
    $("tnBody").innerHTML = '<div class="tn-kata"><p class="tn-goal">⚖️ Tied at ' + n + '! The judges ask for one more technique: get this one right to win.</p><div class="qq-card"><div id="tnQ"></div></div></div>';
    BD.QuickUI.render($("tnQ"), M.q, function (v) {
      if (!M || M.busy) return; M.busy = true; T.asked++;
      BD.QuickUI.mark($("tnQ"), M.q, v);
      const ok = v === M.q.answer; if (ok) { T.right++; if (BD.Correct) BD.Correct.hit(BD.Store.current()); }
      if (ok) BD.Sound.right(); else BD.Sound.wrong();
      later(function () { showOutcome(ok, ok ? "Sudden victory! The judges give it to you." : "So close! The judges give it to " + M.opp.name + ".", n + " vs " + n + (ok ? "+" : "−")); }, 900);
    }, { read: true, grade: T.grade, hints: true });
  }

  /* Sparring: race your opponent to 5 points. */
  function spar() {
    M.you = 0; M.them = 0; M.judo = BD.Badges.hasSkill(BD.Store.current(), "judo");
    if (BD.Music) BD.Music.scene(roundName(T.r) === "Final" ? "final" : "boss");
    sparQ();
  }
  function sparQ() {
    if (!M) return;
    M.timers.forEach(clearTimeout); M.timers = [];
    M.q = q(); M.busy = false; M.frozen = false;
    const secs = Math.max(2.8, 8 - 5 * M.lvl), acc = Math.min(0.92, 0.6 + 0.3 * M.lvl);
    $("tnBody").innerHTML = '<div class="tn-spar"><div class="tn-board"><div class="tn-side you"><span class="mini-champ" data-mini></span><strong>' + esc(BD.Dojo.display(BD.Store.current())) + '</strong><b id="tnYou">' + M.you + '</b></div>' +
      '<span class="tn-vs">VS</span><div class="tn-side them"><strong>' + esc(M.opp.name) + '</strong><b id="tnThem">' + M.them + '</b><span class="tn-clock"><i id="tnClock"></i></span></div></div>' +
      '<p class="tn-say" id="tnSay">First to ' + SPAR_TO + ' points! Answer before ' + esc(M.opp.name) + ' does.' + (M.judo ? ' 🥋 5 in a row = judo throw (+2)!' : '') + '</p>' +
      '<div class="qq-card"><div id="tnQ"></div></div></div>';
    if (BD.Mini) BD.Mini.fill($("tnBody"));
    BD.QuickUI.render($("tnQ"), M.q, sparPick, { read: false, grade: T.grade });
    const clock = $("tnClock"); clock.style.transition = "none"; clock.style.width = "0%"; void clock.offsetWidth;
    clock.style.transition = "width " + secs + "s linear"; clock.style.width = "100%";
    later(function () { // the opponent answers
      if (!M || M.busy) return;
      M.busy = true;
      if (Math.random() < acc) { M.them++; BD.Sound.wrong(); say(M.opp.name + " scores!"); BD.QuickUI.mark($("tnQ"), M.q, null); }
      else { say(M.opp.name + " missed! Next one."); BD.QuickUI.mark($("tnQ"), M.q, null); }
      score(); later(nextOrEnd, 1100);
    }, secs * 1000);
  }
  function say(t) { const el = $("tnSay"); if (el) el.textContent = t; }
  function score() { if ($("tnYou")) $("tnYou").textContent = M.you; if ($("tnThem")) $("tnThem").textContent = M.them; }
  function sparPick(v) {
    if (!M || M.busy || M.frozen) return;
    T.asked++;
    if (v === M.q.answer) {
      M.busy = true; T.right++; M.streak++; if (BD.Correct) BD.Correct.hit(BD.Store.current());
      const judo = M.judo && M.streak % 5 === 0;
      M.you += judo ? 2 : 1;
      BD.QuickUI.mark($("tnQ"), M.q, v); BD.Sound.right(); if (BD.Mini) BD.Mini.react("kick");
      say(judo ? "🥋 JUDO THROW! +2" : "Point for you!");
      score(); later(nextOrEnd, 800);
    } else {
      // a miss freezes you for a moment, like Partner Challenge
      M.streak = 0; M.frozen = true; BD.Sound.wrong(); if (BD.Mini) BD.Mini.react("oops");
      const btn = document.querySelector('#tnQ .qq-choice[data-i="' + M.q.choices.indexOf(v) + '"]'); if (btn) { btn.classList.add("is-wrong"); btn.disabled = true; }
      say("Missed! Frozen for a moment…");
      later(function () { if (M) { M.frozen = false; say("Back in! Answer before " + M.opp.name + "."); } }, 1300);
    }
  }
  function nextOrEnd() {
    if (!M) return;
    if (M.you >= SPAR_TO || M.them >= SPAR_TO) return showOutcome(M.you > M.them, "Final score " + M.you + "–" + M.them, M.you + "–" + M.them);
    sparQ();
  }

  function showOutcome(won, line, scoreText) {
    const mm = M; if (!mm) return;
    mm.timers.forEach(clearTimeout); mm.timers = [];
    if (won) { BD.Sound.win(); BD.confetti(60); } else BD.Sound.wrong();
    $("tnBody").innerHTML = '<div class="tn-perf"><h2>' + (won ? "You win the match!" : esc(mm.opp.name) + " wins this match") + '</h2><p>' + esc(line) + '</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="tnCont">' + (won ? "Continue" : "See results") + '</button></div></div>';
    $("tnBody").onclick = function (e) { if (e.target.closest("#tnCont")) done(won, scoreText); };
  }

  /* ---------- weekend friend challenge: your own round, scored ---------- */
  const CH_SECS = 60;
  function challenge(c, weapon) {
    const p = BD.Store.current(); if (!p || !open(p, c.type)) return hub();
    if (c.type === "weapons" && !weapon) return pickWeapon(function (w) { challenge(c, w); });
    stopMatch();
    T = { type: c.type, weapon: weapon || null, ch: c, rounds: [], r: 0, grade: BD.Rank.dojoGrade(p), belt: BD.Rank.rec(p, BD.Rank.dojoGrade(p)).belt, right: 0, asked: 0 };
    M = { opp: { name: c.other }, lvl: 0.5, streak: 0, best: 0, timers: [], target: null };
    const o = TYPES[c.type], w = T.weapon ? BD.Badges.GEAR[T.weapon] : null;
    $("tnTitle").textContent = "⚔️ " + o.name.replace(" Tournament", "") + " vs " + c.other;
    $("tnBody").innerHTML = '<div class="tn-perf">' + (w ? '<img class="tn-wimg" src="' + w.img + '" alt="">' : '') +
      '<h2>Friend challenge: ' + esc(c.other) + '</h2>' +
      (c.type === "sparring" ? '<p>One ' + CH_SECS + '-second round: score as many points as you can. A miss freezes you for a moment.' + (BD.Badges.hasSkill(p, "judo") ? ' 🥋 5 in a row = judo throw (+2)!' : '') + '</p>'
        : '<p>Perform your ' + (w ? w.name.toLowerCase() + ' form' : 'kata') + ': as many right in a row as you can, up to ' + KATA_MAX + '. One miss ends the form.</p>') +
      '<p class="muted">' + esc(c.other) + ' plays their own round. The higher score wins: 🥇 +' + MEDAL_XP.gold * 2 + ' XP, 🥈 +' + MEDAL_XP.silver * 2 + ' XP. You get one try!</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="tnBegin">Bow in and begin</button><button type="button" class="btn btn-quiet" id="tnBackHub">Not yet</button></div></div>';
    $("tnBody").onclick = function (e) {
      if (e.target.closest("#tnBackHub")) { stopMatch(); T = null; return hub(); }
      if (!e.target.closest("#tnBegin")) return;
      BD.Sound.tap(); M.started = true;
      if (c.type === "sparring") { M.you = 0; M.judo = BD.Badges.hasSkill(p, "judo"); M.ends = Date.now() + CH_SECS * 1000; if (BD.Music) BD.Music.scene("boss"); later(function () { chFinish(M.you); }, CH_SECS * 1000); chSparQ(); }
      else { if (BD.Music) BD.Music.scene("focus"); kataQ(); }
    };
    BD.UI.show("screen-tourney");
  }
  function chSparQ() {
    if (!M) return;
    M.q = q(); M.busy = false; M.frozen = false;
    const left = Math.max(0, (M.ends - Date.now()) / 1000);
    $("tnBody").innerHTML = '<div class="tn-spar"><div class="tn-board"><div class="tn-side you"><span class="mini-champ" data-mini></span><strong>' + esc(BD.Dojo.display(BD.Store.current())) + '</strong><b id="tnYou">' + M.you + '</b></div>' +
      '<span class="tn-vs">⏱</span><div class="tn-side them"><strong>Time</strong><span class="tn-clock"><i id="tnClock"></i></span></div></div>' +
      '<p class="tn-say" id="tnSay">Score as many points as you can!</p><div class="qq-card"><div id="tnQ"></div></div></div>';
    if (BD.Mini) BD.Mini.fill($("tnBody"));
    BD.QuickUI.render($("tnQ"), M.q, chSparPick, { read: false, grade: T.grade });
    const clock = $("tnClock"); clock.style.transition = "none"; clock.style.width = (100 - 100 * left / CH_SECS) + "%"; void clock.offsetWidth;
    clock.style.transition = "width " + left + "s linear"; clock.style.width = "100%";
  }
  function chSparPick(v) {
    if (!M || M.busy || M.frozen) return;
    T.asked++;
    if (v === M.q.answer) {
      M.busy = true; T.right++; M.streak++; if (BD.Correct) BD.Correct.hit(BD.Store.current());
      const judo = M.judo && M.streak % 5 === 0;
      M.you += judo ? 2 : 1;
      BD.QuickUI.mark($("tnQ"), M.q, v); BD.Sound.right(); if (BD.Mini) BD.Mini.react("kick");
      say(judo ? "🥋 JUDO THROW! +2" : "Point!"); if ($("tnYou")) $("tnYou").textContent = M.you;
      later(chSparQ, 600);
    } else {
      M.streak = 0; M.frozen = true; BD.Sound.wrong(); if (BD.Mini) BD.Mini.react("oops");
      const btn = document.querySelector('#tnQ .qq-choice[data-i="' + M.q.choices.indexOf(v) + '"]'); if (btn) { btn.classList.add("is-wrong"); btn.disabled = true; }
      say("Missed! Frozen for a moment…");
      later(function () { if (M) { M.frozen = false; say("Back in!"); } }, 1300);
    }
  }
  async function chFinish(score) {
    if (!M || !T || !T.ch) return;
    const c = T.ch, type = T.type, grade = T.grade, right = T.right, asked = T.asked;
    stopMatch();
    $("tnBody").innerHTML = '<div class="tn-perf"><h2>' + (type === "sparring" ? "Time! " + score + " points" : score + " in a row · judges' score " + judges(score)) + '</h2><p class="muted">Sending your score…</p></div>';
    const r = await BD.Challenge.submit(c, score);
    const p = BD.Store.current(), o = r.outcome, medal = o === "won" ? "gold" : o ? "silver" : "", xp = medal ? MEDAL_XP[medal] * 2 : 0;
    BD.Store.recordSession(p, { game: "tournament", grade: grade, correct: right, total: asked, xp: xp, mode: type, medal: medal });
    T = null;
    $("tnTitle").textContent = "⚔️ Friend challenge";
    const head = type === "sparring" ? "You scored " + score + " points!" : "You performed " + score + " in a row!";
    $("tnBody").innerHTML = '<div class="tn-result"><div class="tn-medal" aria-hidden="true">' + (medal === "gold" ? "🥇" : medal ? "🥈" : "⚔️") + '</div><h2>' + esc(head) + '</h2>' +
      (!r.ok ? '<p class="muted">' + esc(r.error === "limit" ? "That's the weekend limit of 3 scored challenges, so this score wasn't sent." : r.error === "closed" ? "This challenge has ended, so the score wasn't sent." : "We couldn't send your score. Check the internet; ask a grown-up for help if it keeps happening.") + '</p>'
        : o ? '<p>' + esc(c.other) + ': ' + r.c.their + '. ' + (o === "won" ? "You win! 🥇" : o === "tie" ? "It's a tie! 🥈" : "Great match! 🥈") + '</p><p class="chest-xp">+' + xp + ' XP (weekend double!)</p>'
        : '<p>When ' + esc(c.other) + ' plays, your medal shows up under Tournaments. Winner 🥇 +' + MEDAL_XP.gold * 2 + ' XP, the other 🥈 +' + MEDAL_XP.silver * 2 + ' XP.</p>') +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="tnHub">Back to tournaments</button></div></div>';
    if (medal) { BD.Sound.belt(); BD.confetti(medal === "gold" ? 200 : 100); } else BD.Sound.win();
    $("tnBody").onclick = function (e) { if (e.target.closest("#tnHub")) hub(); };
    if (BD.Music) BD.Music.scene("map");
    setTimeout(function () { BD.Badges.award(BD.Store.current()); }, 1500);
  }

  /* ---------- results ---------- */
  function result() {
    const p = BD.Store.current(), last = T.rounds.length - 1, fin = T.rounds[last][0];
    let medal = null;
    if (fin.w && fin.w.you) medal = "gold";
    else if (fin.a && fin.b && (fin.a.you || fin.b.you)) medal = "silver";
    else if (last >= 1 && T.rounds[last - 1].some(function (m) { return (m.a && m.a.you) || (m.b && m.b.you); })) medal = "bronze";
    const xp = medal ? MEDAL_XP[medal] * (isWeekend() ? 2 : 1) : 0;
    if (medal) { p.medals = medals(p).concat({ t: T.type, m: medal, d: new Date().toISOString() }).slice(-300); BD.addXP(p, xp); }
    BD.Store.recordSession(p, { game: "tournament", grade: T.grade, correct: T.right, total: T.asked, xp: xp, mode: T.type, medal: medal || "" });
    const o = TYPES[T.type];
    $("tnTitle").textContent = o.icon + " " + o.name + " · Results";
    $("tnBody").innerHTML = '<div class="tn-result"><div class="tn-medal" aria-hidden="true">' + (medal === "gold" ? "🥇" : medal === "silver" ? "🥈" : medal === "bronze" ? "🥉" : "🎖️") + '</div>' +
      '<h2>' + (medal === "gold" ? "Gold medal! Tournament champion!" : medal === "silver" ? "Silver medal! You made the final!" : medal === "bronze" ? "Bronze medal! Great tournament!" : "Great effort! Train and try again.") + '</h2>' +
      (medal ? '<p class="chest-xp">+' + xp + ' XP' + (isWeekend() ? " (weekend double!)" : "") + '</p>' : '<p class="muted">Medals go to the top 4: gold, silver and two bronzes. Enter again any time!</p>') +
      '<p class="muted">Champion: <strong>' + esc(fin.w ? fin.w.name : "") + '</strong> · ' + T.size + ' competitors</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="tnAgain">Enter another ' + o.name.toLowerCase().replace(" tournament", "") + ' tournament</button>' +
      '<button type="button" class="btn btn-quiet" id="tnBracket">See the bracket</button><button type="button" class="btn btn-quiet" id="tnHub">All tournaments</button></div></div>';
    if (medal) { BD.Sound.belt(); BD.confetti(medal === "gold" ? 220 : 120); }
    const type = T.type, weapon = T.weapon;
    $("tnBody").onclick = function (e) {
      if (e.target.closest("#tnAgain")) return type === "weapons" ? pickWeapon() : enter(type, weapon);
      if (e.target.closest("#tnBracket")) return bracket(medal ? "Final bracket" : "");
      if (e.target.closest("#tnHub")) return hub();
    };
    setTimeout(function () { BD.Badges.award(BD.Store.current()); }, 1500);
  }

  function bind() {
    if ($("tourneyCard")) $("tourneyCard").addEventListener("click", hub);
    $("tnQuit").addEventListener("click", function () {
      if (T && T.ch && M && M.started) return chFinish(T.type === "sparring" ? M.you : M.streak); // one try: leaving mid-round keeps the score so far
      if (M || T) { stopMatch(); T = null; hub(); } else BD.UI.home(); });
  }

  BD.Store.players().forEach(sanitize); // saves loaded before this file

  return { TYPES: TYPES, challenge: challenge, open: open, card: card, hub: hub, enter: enter, sanitize: sanitize, bind: bind, isWeekend: isWeekend, MEDAL_XP: MEDAL_XP, state: function () { return { T: T, M: M }; }, stop: function () { stopMatch(); T = null; } };
})();
