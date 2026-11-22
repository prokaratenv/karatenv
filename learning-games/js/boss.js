/* BOSS BATTLES — every belt in every grade has a boss. Right answers are
   kicks that knock down the boss's health; wrong answers let the boss
   strike back and cost a heart. Questions mix every subject at the
   student's grade and belt.
   The ladder ends with the Engage instructors: Agent Bridgette (Brown),
   Star Force Mrs. Young (Red) and the final boss, Iron Master Young (Black).
   Gear helps: headgear and chest gear add a heart each, gloves power up
   every third hit in a row. */
window.BD = window.BD || {};

/* Shared tap-to-answer question card (Boss Battles and Partner Challenges). */
BD.QuickUI = (function () {
  const esc = function (s) { return BD.UI.esc(s); };
  function render(el, q, onPick, opts) {
    opts = opts || {};
    el.innerHTML =
      '<p class="qq-label">' + esc(q.label) + '</p>' +
      (q.html ? '<div class="qq-art">' + q.html + '</div>' : '') +
      (q.prompt ? '<p class="qq-prompt">' + esc(q.prompt) + '</p>' : '') +
      (q.sub ? '<p class="qq-sub">' + (q.subIsHTML ? q.sub : esc(q.sub)) + '</p>' : '') +
      '<div class="qq-choices' + (q.long ? ' long' : '') + '">' + q.choices.map(function (c, i) {
        return '<button type="button" class="choice qq-choice" data-i="' + i + '">' + esc(c) + '</button>';
      }).join("") + '</div>';
    el.onclick = function (e) {
      const b = e.target.closest(".qq-choice"); if (!b || b.disabled) return;
      onPick(q.choices[Number(b.dataset.i)], b);
    };
    if (opts.read && BD.ReadAloud.auto(opts.grade)) BD.ReadAloud.say(q.say || q.prompt);
  }
  /* Show which choice was right. */
  function mark(el, q, picked) {
    el.querySelectorAll(".qq-choice").forEach(function (b) {
      const v = q.choices[Number(b.dataset.i)];
      b.disabled = true;
      if (v === q.answer) b.classList.add("is-right"); else if (v === picked) b.classList.add("is-wrong");
    });
  }
  return { render: render, mark: mark };
})();

BD.Boss = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const BOSSES = [
    { name: "Rascal", title: "the Raccoon Ninja", img: "img/boss-0.webp", hits: 8, hi: "Hee hee! Bet you can't land a single kick!", lose: "No fair! You're way too quick!" },
    { name: "Professor Hoot", title: "the Wise Owl", img: "img/boss-1.webp", hits: 9, hi: "Whooo dares challenge my brain?", lose: "Whooo-ah! Brilliant work, young champion." },
    { name: "Blaze", title: "the Fire Fox", img: "img/boss-2.webp", hits: 10, hi: "I'm the fastest kicker in the forest!", lose: "You put out my fire! Respect." },
    { name: "Glacier", title: "the Polar Bear", img: "img/boss-3.webp", hits: 11, hi: "Brrr! Time to freeze your brain!", lose: "You melted my ice! Great match." },
    { name: "Bamboo", title: "the Panda Master", img: "img/boss-4.webp", hits: 12, hi: "My bamboo staff has never lost!", lose: "You have the heart of a true master." },
    { name: "Shadow", title: "the Ninja Cat", img: "img/boss-5.webp", hits: 12, hi: "You can't hit what you can't see!", lose: "Meow! You found me. Well done." },
    { name: "Agent Bridgette", title: "Secret Agent", img: "img/boss-6.webp", hits: 13, hi: "Mission: stop you. Ready, champion?", lose: "Mission failed... because you're amazing!", instructor: true },
    { name: "Star Force Mrs. Young", title: "Cosmic Hero", img: "img/boss-7.webp", hits: 14, hi: "Show me the power of a true Engage champion!", lose: "You shine brighter than the stars!", instructor: true },
    { name: "Iron Master Young", title: "the Final Boss", img: "img/boss-8.webp", hits: 16, hi: "So you made it to the top. Bow in, champion. Let's see your best!", lose: "Incredible! You beat me... or did you?", instructor: true, final: true },
    // secret: unlocked by beating Iron Master Young
    { name: "Final Boss Master Young", title: "the true Final Boss", img: "img/boss-9.webp", hits: 18, hi: "You thought you won? Behold... my FINAL BOSS form!", lose: "Impossible! You are the true master of this dojo!", instructor: true, secret: true }
  ];
  const XP = 50;
  let S = null;

  function wins(p, grade) { p.bossWins = p.bossWins || {}; return p.bossWins[grade] = p.bossWins[grade] || []; }
  /* The boss for the belt; at Black Belt, beating Iron Master Young unlocks Final Boss Master Young. */
  function bossFor(p) {
    const g = BD.Rank.dojoGrade(p), belt = BD.Rank.rec(p, g).belt;
    const idx = belt === 8 && wins(p, g).indexOf(8) !== -1 ? 9 : belt;
    return { grade: g, belt: belt, idx: idx, boss: BOSSES[idx] };
  }
  const label = function (b) { return b.boss.secret ? "👑 Final Boss" : b.boss.final ? "🔥 Black Belt Boss" : "🥊 " + BD.BELTS[b.belt].name + " Belt Boss"; };

  /* Home card. */
  function card(p) {
    const el = $("bossCard"); if (!el || !p) return;
    const b = bossFor(p), beat = wins(p, b.grade).indexOf(b.idx) !== -1;
    el.innerHTML = '<img class="boss-thumb" src="' + b.boss.img + '" alt="">' +
      '<span class="boss-txt"><span class="boss-k">' + label(b) + '</span>' +
      '<strong>' + esc(b.boss.name) + '</strong><span class="boss-sub">' + (beat ? "Defeated ✓ · tap for a rematch" : "Beat " + (b.boss.instructor ? "them" : "this boss") + " for a trophy and +" + prize(b.boss) + " XP") + '</span></span>';
  }

  /* The ladder + fight button. */
  function open() {
    const p = BD.Store.current(); if (!p) return;
    const b = bossFor(p), w = wins(p, b.grade);
    BD.UI.sheet("Boss ladder · " + BD.gradeLabel(b.grade),
      '<div class="boss-intro"><img src="' + b.boss.img + '" alt=""><div><p class="boss-k">' + label(b) + '</p><h3>' + esc(b.boss.name) + '</h3><p class="muted">' + esc(b.boss.title) + '</p><p class="boss-quote">“' + esc(b.boss.hi) + '”</p></div></div>' +
      '<p class="muted small">' + b.boss.hits + ' hits to win. You have ' + hearts(p) + ' hearts' + (hearts(p) > 3 ? ' (your gear adds extra!)' : '') + (gloves(p) ? '. Your gloves power up every 3rd hit in a row' : '') + (BD.Badges.hasSkill(p, "judo") ? '. 🥋 Every 5th hit in a row is a judo throw (−3)' : '') + '. Weapons are for show, never for fighting.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="bossFight">Begin vs ' + esc(b.boss.name) + '</button></div>' +
      '<h4 class="label">The ladder</h4><ol class="boss-ladder">' + BOSSES.map(function (x, i) {
        if (x.secret && b.idx !== 9 && w.indexOf(9) === -1) return '<li class="locked secret"><span class="belt-swatch" style="--belt:#17171C"></span><img src="' + x.img + '" alt=""><span>??? Secret boss</span><em>🔒</em></li>';
        const st = w.indexOf(i) !== -1 ? "beat" : i === b.idx ? "now" : i > b.idx ? "locked" : "";
        return '<li class="' + st + (x.secret ? " secret" : "") + '"><span class="belt-swatch" style="--belt:' + BD.BELTS[Math.min(8, i)].color + '"></span><img src="' + x.img + '" alt=""><span>' + (st === "locked" ? "???" : esc(x.name)) + '</span><em>' + (st === "beat" ? "✓" : st === "now" ? "Now" : st === "locked" ? "🔒" : "") + '</em></li>';
      }).join("") + '</ol>');
    $("bossFight").onclick = function () { $("infoClose").click(); start(); };
  }

  function hearts(p) {
    const eq = BD.Badges.equipped(p);
    return 3 + (eq.indexOf("headgear") !== -1 ? 1 : 0) + (eq.indexOf("chest") !== -1 ? 1 : 0);
  }
  function gloves(p) { return BD.Badges.equipped(p).some(function (g) { return ["sparring", "boxing", "mma"].indexOf(g) !== -1; }); }

  function start() {
    const p = BD.Store.current(); if (!p) return;
    const b = bossFor(p);
    S = { grade: b.grade, belt: b.belt, idx: b.idx, boss: b.boss, hp: b.boss.hits, max: b.boss.hits, hearts: hearts(p), maxHearts: hearts(p), streak: 0, gloves: gloves(p), judo: BD.Badges.hasSkill(p, "judo"), right: 0, asked: 0, busy: false };
    $("bossName").textContent = b.boss.name;
    $("bossImg").src = b.boss.img; $("bossImg").alt = b.boss.name;
    $("bossTitle").textContent = (b.boss.secret ? "Final Boss · " : "") + BD.gradeLabel(b.grade) + " · " + BD.BELTS[b.belt].name + " Belt";
    $("bossArena").classList.toggle("ultimate", !!b.boss.secret);
    $("bossSay").textContent = b.boss.hi;
    $("bossOver").hidden = true;
    BD.UI.show("screen-boss");
    if (BD.Music) BD.Music.scene(b.boss.final || b.boss.secret ? "final" : "boss");
    BD.Mini.fill($("screen-boss"));
    hud();
    const arena = $("bossArena");
    arena.classList.remove("ko", "down", "fx-attack", "fx-power", "fx-judo", "fx-hurt", "shake");
    arena.style.setProperty("--combo", 0);
    // the transformation, the first time Final Boss Master Young appears
    if (b.boss.secret && wins(p, b.grade).indexOf(9) === -1) return morph(intro);
    intro();
  }
  /* "Round N… Begin!": both step onto the mat and bow, then the first question. */
  function intro() {
    if (!S) return;
    const p = BD.Store.current(), today = BD.today();
    const n = (p.sessions || []).filter(function (s) { return s.game === "boss" && s.date && s.date.slice(0, 10) === today; }).length + 1;
    $("bossRound").textContent = "Round " + n;
    $("bossQ").innerHTML = "";
    const arena = $("bossArena"), box = $("bossIntro");
    arena.classList.remove("intro"); void arena.offsetWidth; arena.classList.add("intro");
    box.hidden = false; box.classList.remove("go"); void box.offsetWidth; box.classList.add("go");
    BD.Sound.tap(); setTimeout(function () { BD.Sound.right(); }, 900);
    setTimeout(function () { box.hidden = true; arena.classList.remove("intro"); if (S) next(); }, 1800);
  }
  /* One move of the match: the champion dashes in, or the boss does. */
  function fx(kind) {
    const arena = $("bossArena");
    arena.classList.remove("fx-attack", "fx-power", "fx-judo", "fx-hurt", "shake"); void arena.offsetWidth;
    arena.classList.add("fx-" + kind);
    if (kind !== "attack") setTimeout(function () { arena.classList.add("shake"); }, kind === "hurt" ? 260 : 220);
    if (kind !== "hurt") { const im = $("bossImpact"); im.classList.remove("go"); void im.offsetWidth; setTimeout(function () { im.classList.add("go"); }, 200); }
  }
  function morph(then) {
    const m = $("bossMorph");
    $("bossQ").innerHTML = "";
    m.hidden = false; m.classList.remove("go"); void m.offsetWidth; m.classList.add("go");
    BD.Sound.belt();
    setTimeout(function () { m.hidden = true; if (S) then(); }, 3200);
  }
  function prize(boss) { return boss.secret ? 100 : XP; }
  function hud() {
    $("bossHp").style.width = Math.max(0, 100 * S.hp / S.max) + "%";
    $("bossHpNum").textContent = Math.max(0, S.hp) + " / " + S.max;
    $("bossHearts").innerHTML = Array.from({ length: S.maxHearts }, function (_, i) { return '<span class="' + (i < S.hearts ? "on" : "") + '">♥</span>'; }).join("");
  }
  function next() {
    if (!S) return;
    S.q = BD.Quick.question(S.grade, S.belt); S.busy = false;
    BD.QuickUI.render($("bossQ"), S.q, pick, { read: true, grade: S.grade });
  }
  function pop(text, cls) {
    const el = $("bossPop"); el.textContent = text; el.className = "boss-pop " + cls;
    void el.offsetWidth; el.classList.add("go");
  }
  function pick(v) {
    if (!S || S.busy) return;
    S.busy = true; S.asked++;
    BD.QuickUI.mark($("bossQ"), S.q, v);
    const arena = $("bossArena");
    if (v === S.q.answer) {
      S.right++; S.streak++;
      const judo = S.judo && S.streak % 5 === 0;
      const power = !judo && S.gloves && S.streak % 3 === 0;
      const dmg = judo ? 3 : power ? 2 : 1;
      S.hp -= dmg;
      BD.Sound.right();
      fx(judo ? "judo" : power ? "power" : "attack");
      arena.style.setProperty("--combo", Math.min(5, S.streak));
      pop(judo ? "JUDO THROW! −3" : power ? "POWER PUNCH! −2" : "−1", "dmg");
      $("bossSay").textContent = judo ? "Whoa! What a judo throw!" : power ? "Oof! Those gloves pack a punch!" : ["Ow!", "Hey!", "Lucky shot!", "Not bad!", "Whoa!"][Math.floor(Math.random() * 5)];
    } else {
      S.streak = 0; S.hearts--;
      BD.Sound.wrong();
      fx("hurt");
      arena.style.setProperty("--combo", 0);
      pop("−♥", "hurt");
      $("bossSay").textContent = "Ha! The answer was " + S.q.answer + ".";
    }
    hud();
    setTimeout(function () {
      if (!S) return;
      if (S.hp <= 0) return finale(true);
      if (S.hearts <= 0) return finale(false);
      next();
    }, v === S.q.answer ? 900 : 1500);
  }
  /* The knockout (boss tips over, stars spin, champion celebrates) or the champion
     sits down dizzy, then the results. */
  function finale(won) {
    const arena = $("bossArena"); $("bossQ").innerHTML = "";
    arena.classList.remove("fx-attack", "fx-power", "fx-judo", "fx-hurt", "shake"); void arena.offsetWidth;
    arena.classList.add(won ? "ko" : "down");
    $("bossSay").textContent = won ? "K.O.! " + (S.boss.lose || "") : "Oof… I need a breather!";
    if (won) { BD.Sound.belt(); BD.Mini.react("bow"); }
    const s = S;
    setTimeout(function () { if (S === s) end(won); }, won ? 1700 : 1300);
  }
  function end(won) {
    const p = BD.Store.current(), boss = S.boss, w = wins(p, S.grade), first = won && w.indexOf(S.idx) === -1;
    if (first) { w.push(S.idx); BD.addXP(p, prize(boss)); }
    BD.Store.recordSession(p, { game: "boss", grade: S.grade, correct: S.right, total: S.asked, xp: first ? prize(boss) : 0, boss: boss.name, won: won });
    $("bossOver").hidden = false;
    $("bossOverTitle").textContent = won ? (boss.secret ? "You beat Final Boss Master Young!" : "You beat " + boss.name + "!") : boss.name + " wins this round";
    $("bossOverSay").textContent = "“" + (won ? boss.lose : "Train hard and come back. I'll be waiting!") + "”";
    $("bossOverPrize").textContent = won ? (first ? (boss.secret ? "👑 Final Boss trophy + " : "🏆 Boss trophy + ") + prize(boss) + " XP" : "🏆 Rematch won!") : "You landed " + (S.max - Math.max(0, S.hp)) + " of " + S.max + " hits. So close!";
    // beating Iron Master Young the first time: he's not done yet...
    const twist = !!(won && first && boss.final);
    $("bossAgain").textContent = twist ? "⚡ Wait... something's happening!" : won ? "Rematch" : "Try again";
    $("bossOver").classList.toggle("twist", twist);
    if (won) { BD.Sound.belt(); BD.confetti(boss.final || boss.secret ? 280 : 160); BD.Mini.react("bow"); } else BD.Sound.wrong();
    S = null;
    if (won) setTimeout(function () { BD.Badges.award(BD.Store.current()); }, 1600);
  }
  function stop() { S = null; }

  function bind() {
    $("bossCard").addEventListener("click", open);
    $("bossQuit").addEventListener("click", function () { stop(); BD.UI.home(); });
    $("bossAgain").addEventListener("click", start);
    $("bossHome").addEventListener("click", function () { BD.UI.home(); });
    $("bossRead").addEventListener("click", function () { if (S && S.q) BD.ReadAloud.say(S.q.say || S.q.prompt); });
  }

  return { BOSSES: BOSSES, card: card, open: open, start: start, stop: stop, bind: bind, wins: wins, peek: function () { return S && S.q; } };
})();
