/* BOSS BATTLES — every belt in every grade has a boss. Right answers are
   kicks that knock down the boss's health; wrong answers let the boss
   strike back and cost a heart. Questions mix every subject at the
   student's grade and belt.
   The ladder ends with the Engage instructors: Agent Bridgette (Brown),
   Star Force Mrs. Young (Red) and the final boss, Iron Master Young (Black).
   Gear helps: headgear and chest gear add a heart each, gloves power up
   every third hit in a row. */
window.BD = window.BD || {};

/* Shared tap-to-answer question card (Boss Battles and Dojo Duels). */
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
    { name: "Glacier", title: "the Polar Bear", img: "img/boss-3.webp", hits: 11, hi: "Brrr! Time to freeze your brain!", lose: "You melted my ice! Great fight." },
    { name: "Bamboo", title: "the Panda Master", img: "img/boss-4.webp", hits: 12, hi: "My bamboo staff has never lost!", lose: "You have the heart of a true master." },
    { name: "Shadow", title: "the Ninja Cat", img: "img/boss-5.webp", hits: 12, hi: "You can't hit what you can't see!", lose: "Meow! You found me. Well done." },
    { name: "Agent Bridgette", title: "Secret Agent", img: "img/boss-6.webp", hits: 13, hi: "Mission: stop you. Ready, champion?", lose: "Mission failed... because you're amazing!", instructor: true },
    { name: "Star Force Mrs. Young", title: "Cosmic Hero", img: "img/boss-7.webp", hits: 14, hi: "Show me the power of a true Engage champion!", lose: "You shine brighter than the stars!", instructor: true },
    { name: "Iron Master Young", title: "the Final Boss", img: "img/boss-8.webp", hits: 16, hi: "So you made it to the top. Bow in, champion. Let's see your best!", lose: "Incredible! You beat the Final Boss. I'm proud of you!", instructor: true, final: true }
  ];
  const XP = 50;
  let S = null;

  function wins(p, grade) { p.bossWins = p.bossWins || {}; return p.bossWins[grade] = p.bossWins[grade] || []; }
  function bossFor(p) { const g = BD.Rank.dojoGrade(p); return { grade: g, belt: BD.Rank.rec(p, g).belt, boss: BOSSES[BD.Rank.rec(p, g).belt] }; }

  /* Home card. */
  function card(p) {
    const el = $("bossCard"); if (!el || !p) return;
    const b = bossFor(p), beat = wins(p, b.grade).indexOf(b.belt) !== -1;
    el.innerHTML = '<img class="boss-thumb" src="' + b.boss.img + '" alt="">' +
      '<span class="boss-txt"><span class="boss-k">' + (b.boss.final ? "🔥 Final Boss" : "🥊 " + BD.BELTS[b.belt].name + " Belt Boss") + '</span>' +
      '<strong>' + esc(b.boss.name) + '</strong><span class="boss-sub">' + (beat ? "Defeated ✓ · tap for a rematch" : "Beat " + (b.boss.instructor ? "them" : "this boss") + " for a trophy and +" + XP + " XP") + '</span></span>';
  }

  /* The ladder + fight button. */
  function open() {
    const p = BD.Store.current(); if (!p) return;
    const b = bossFor(p), w = wins(p, b.grade);
    BD.UI.sheet("Boss ladder · " + BD.gradeLabel(b.grade),
      '<div class="boss-intro"><img src="' + b.boss.img + '" alt=""><div><p class="boss-k">' + BD.BELTS[b.belt].name + ' Belt Boss</p><h3>' + esc(b.boss.name) + '</h3><p class="muted">' + esc(b.boss.title) + '</p><p class="boss-quote">“' + esc(b.boss.hi) + '”</p></div></div>' +
      '<p class="muted small">' + b.boss.hits + ' hits to win. You have ' + hearts(p) + ' hearts' + (hearts(p) > 3 ? ' (your gear adds extra!)' : '') + '. Gloves power up every 3rd hit in a row.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="bossFight">Fight ' + esc(b.boss.name) + '!</button></div>' +
      '<h4 class="label">The ladder</h4><ol class="boss-ladder">' + BOSSES.map(function (x, i) {
        const st = w.indexOf(i) !== -1 ? "beat" : i === b.belt ? "now" : i > b.belt ? "locked" : "";
        return '<li class="' + st + '"><span class="belt-swatch" style="--belt:' + BD.BELTS[i].color + '"></span><img src="' + x.img + '" alt=""><span>' + (st === "locked" ? "???" : esc(x.name)) + '</span><em>' + (st === "beat" ? "✓" : st === "now" ? "Now" : st === "locked" ? "🔒" : "") + '</em></li>';
      }).join("") + '</ol>');
    $("bossFight").onclick = function () { $("infoClose").click(); start(); };
  }

  function hearts(p) {
    const eq = BD.Badges.equipped(p);
    return 3 + (eq.indexOf("headgear") !== -1 ? 1 : 0) + (eq.indexOf("chest") !== -1 ? 1 : 0);
  }
  function gloves(p) { return BD.Badges.equipped(p).some(function (g) { return BD.GearFit.handSlot(g); }); }

  function start() {
    const p = BD.Store.current(); if (!p) return;
    const b = bossFor(p);
    S = { grade: b.grade, belt: b.belt, boss: b.boss, hp: b.boss.hits, max: b.boss.hits, hearts: hearts(p), maxHearts: hearts(p), streak: 0, gloves: gloves(p), right: 0, asked: 0, busy: false };
    $("bossName").textContent = b.boss.name;
    $("bossImg").src = b.boss.img; $("bossImg").alt = b.boss.name;
    $("bossTitle").textContent = (b.boss.final ? "Final Boss · " : "") + BD.gradeLabel(b.grade) + " · " + BD.BELTS[b.belt].name + " Belt";
    $("bossSay").textContent = b.boss.hi;
    $("bossOver").hidden = true;
    BD.UI.show("screen-boss");
    BD.Mini.fill($("screen-boss"));
    hud();
    next();
  }
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
      const power = S.gloves && S.streak % 3 === 0;
      const dmg = power ? 2 : 1;
      S.hp -= dmg;
      BD.Sound.right();
      arena.classList.remove("boss-hit", "boss-strike"); void arena.offsetWidth; arena.classList.add("boss-hit");
      pop(power ? "POWER PUNCH! −2" : "−1", "dmg");
      $("bossSay").textContent = power ? "Oof! Those gloves pack a punch!" : ["Ow!", "Hey!", "Lucky shot!", "Not bad!", "Whoa!"][Math.floor(Math.random() * 5)];
    } else {
      S.streak = 0; S.hearts--;
      BD.Sound.wrong();
      arena.classList.remove("boss-hit", "boss-strike"); void arena.offsetWidth; arena.classList.add("boss-strike");
      pop("−♥", "hurt");
      $("bossSay").textContent = "Ha! The answer was " + S.q.answer + ".";
    }
    hud();
    setTimeout(function () {
      if (!S) return;
      if (S.hp <= 0) return end(true);
      if (S.hearts <= 0) return end(false);
      next();
    }, v === S.q.answer ? 750 : 1500);
  }
  function end(won) {
    const p = BD.Store.current(), boss = S.boss, w = wins(p, S.grade), first = won && w.indexOf(S.belt) === -1;
    if (first) { w.push(S.belt); p.xp = (p.xp || 0) + XP; }
    BD.Store.recordSession(p, { game: "boss", grade: S.grade, correct: S.right, total: S.asked, xp: first ? XP : 0, boss: boss.name, won: won });
    $("bossOver").hidden = false;
    $("bossOverTitle").textContent = won ? (boss.final ? "You beat the Final Boss!" : "You beat " + boss.name + "!") : boss.name + " wins this round";
    $("bossOverSay").textContent = "“" + (won ? boss.lose : "Train hard and come back. I'll be waiting!") + "”";
    $("bossOverPrize").textContent = won ? (first ? "🏆 Boss trophy + " + XP + " XP" : "🏆 Rematch won!") : "You landed " + (S.max - Math.max(0, S.hp)) + " of " + S.max + " hits. So close!";
    $("bossAgain").textContent = won ? "Rematch" : "Try again";
    if (won) { BD.Sound.belt(); BD.confetti(boss.final ? 280 : 160); BD.Mini.react("bow"); } else BD.Sound.wrong();
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
