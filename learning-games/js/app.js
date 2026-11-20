/* Screens: choose player, dojo home, results, parent corner. */
window.BD = window.BD || {};

BD.UI = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };

  let currentScreen = null;
  function show(id) {
    currentScreen = id;
    if (id !== "screen-results") BD.confetti.stop();
    document.querySelectorAll(".screen").forEach(function (s) { s.hidden = s.id !== id; });
    const p = BD.Store.current();
    $("playerChip").hidden = !p || id === "screen-players";
    if (p) {
      const belt = BD.beltFor(p.xp);
      $("playerChip").innerHTML = avatar(p, "sm") + '<span>' + esc(p.name) + '</span>' + beltSwatch(belt);
    }
    window.scrollTo(0, 0);
  }

  function avatar(p, size) {
    return '<span class="avatar ' + (size || "") + '" style="--av:' + p.color + '">' + esc(p.name.charAt(0).toUpperCase()) + '</span>';
  }
  function beltSwatch(belt) {
    return '<span class="belt-swatch" style="--belt:' + belt.color + '" title="' + belt.name + ' belt"></span>';
  }
  function beltBar(xp) {
    const belt = BD.beltFor(xp), next = BD.nextBelt(xp);
    const pct = next ? Math.round(100 * (xp - belt.xp) / (next.xp - belt.xp)) : 100;
    return '<div class="belt-row">' +
      '<div class="belt" style="--belt:' + belt.color + '"><span class="belt-knot"></span></div>' +
      '<div class="belt-text"><strong>' + belt.name + ' Belt</strong><span>' + xp.toLocaleString() + ' XP' +
      (next ? ' · ' + (next.xp - xp).toLocaleString() + ' XP to ' + next.name : ' · Highest rank!') + '</span>' +
      '<div class="xp-track"><div class="xp-fill" style="width:' + pct + '%; --belt:' + (next ? next.color : belt.color) + '"></div></div></div></div>';
  }
  function gradePicker(id, selected, locked) {
    return '<div class="chips grade-chips" id="' + id + '" role="group" aria-label="Grade level">' +
      BD.GRADES.map(function (g) {
        return '<button type="button" class="chip' + (g === selected ? " on" : "") + '" data-grade="' + g + '" aria-pressed="' + (g === selected) + '"' + (locked && g !== selected ? " disabled" : "") + '>Grade ' + g + '</button>';
      }).join("") + '</div>';
  }

  /* ---------- choose player ---------- */
  function players() {
    const list = BD.Store.players();
    $("playerList").innerHTML = list.length ? list.map(function (p) {
      const belt = BD.beltFor(p.xp);
      return '<button type="button" class="player-card" data-id="' + p.id + '">' + avatar(p, "lg") +
        '<span class="pc-name">' + esc(p.name) + '</span>' +
        '<span class="pc-belt">' + beltSwatch(belt) + belt.name + ' Belt</span></button>';
    }).join("") : '<p class="muted empty-note">No students yet. Add each child below so their belts and progress are saved separately.</p>';
    $("newGrade").innerHTML = BD.GRADES.map(function (g) { return '<option value="' + g + '">Grade ' + g + '</option>'; }).join("");
    show("screen-players");
  }

  /* ---------- dojo home ---------- */
  function home() {
    const p = BD.Store.current();
    if (!p) return players();
    const today = BD.today();
    const todays = p.sessions.filter(function (s) { return s.date && s.date.slice(0, 10) === today; }).length;
    $("homeHello").textContent = "Ready to train, " + p.name + "?";
    $("homeBelt").innerHTML = beltBar(p.xp);
    $("homeToday").textContent = todays ? todays + (todays === 1 ? " round" : " rounds") + " completed today" : "No rounds yet today";
    const retry = p.retry || {};
    if (retry.sentence) p.sentenceGrade = retry.sentence.grade;
    $("homeMathGrade").textContent = "Grade " + (retry.math ? retry.math.grade : p.mathGrade);
    $("homeSentGrade").innerHTML = gradePicker("sentGradePick", p.sentenceGrade, !!retry.sentence);
    const notes = [];
    if (retry.math) notes.push("<strong>Math Dojo:</strong> redo Grade " + retry.math.grade + " " + retry.math.ops.map(function (o) { return BD.MathGame.OPS[o].sym; }).join(" ") + " and score " + BD.MathGame.PASS + "% to unlock other levels.");
    if (retry.sentence) notes.push("<strong>Fix-It Sentences:</strong> redo Grade " + retry.sentence.grade + " and fix " + BD.SentenceGame.PASS + "% to unlock other grades.");
    $("homeRedo").innerHTML = notes.map(function (n) { return "<p>" + n + "</p>"; }).join("");
    $("homeRedo").hidden = true; // redo items are shown in Sensei's plan instead
    renderPlan(p);
    show("screen-home");
  }

  /* ---------- Sensei's plan ---------- */
  let planItems = [];
  function renderPlan(p) {
    planItems = BD.Coach.plan(p);
    $("homePlan").hidden = !planItems.length;
    $("homePlanList").innerHTML = planItems.map(function (it, i) {
      return '<button type="button" class="plan-item plan-' + it.kind + '" data-plan="' + i + '"><strong>' + esc(it.title) + '</strong><span>' + esc(it.sub) + '</span></button>';
    }).join("");
  }
  function runPlan(it) {
    const p = BD.Store.current();
    if (it.kind === "mathRetry" || it.kind === "mathStart") BD.MathGame.openSetup();
    else if (it.kind === "mathFocus") BD.MathGame.start("practice", [it.op]);
    else if (it.kind === "mathUp") { p.mathGrade = it.grade; BD.Store.save(p); BD.MathGame.openSetup(); }
    else if (it.kind === "sentRetry") BD.SentenceGame.start();
    else if (it.kind === "sentFocus") BD.SentenceGame.start(it.type);
    else if (it.kind === "sentUp") { p.sentenceGrade = it.grade; BD.Store.save(p); home(); }
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
  function results(o) {
    lastResult = o;
    $("resTitle").textContent = o.title;
    $("resSubtitle").textContent = o.subtitle;
    $("resStats").innerHTML = o.stats.map(function (s) {
      return '<div class="stat"><span class="stat-val">' + esc(s[1]) + '</span><span class="stat-label">' + esc(s[0]) + '</span></div>';
    }).join("");
    const p = BD.Store.current();
    $("resBelt").innerHTML = (o.belt.promoted
      ? '<div class="promo" style="--belt:' + o.belt.after.color + '"><span class="promo-eyebrow">Promotion</span><strong>You earned your ' + o.belt.after.name + ' Belt!</strong></div>'
      : "") + beltBar(p.xp);
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
    $("resSetup").hidden = !o.setup;
    show("screen-results");
    if (o.belt.promoted) { BD.Sound.belt(); BD.confetti(200); }
    else if (!o.failed) { BD.Sound.win(); BD.confetti(80); }
  }

  /* ---------- parent corner ---------- */
  function pct(r, w) { return r + w ? Math.round(100 * r / (r + w)) + "%" : "–"; }
  function parent() {
    const list = BD.Store.players();
    if (!list.length) { $("parentBody").innerHTML = '<p class="muted">No students yet.</p>'; show("screen-parent"); return; }
    $("parentBody").innerHTML = list.map(function (p) {
      const belt = BD.beltFor(p.xp);
      const opRows = Object.keys(BD.MathGame.OPS).map(function (op) {
        return '<tr><th scope="row">' + BD.MathGame.OPS[op].sym + " " + BD.MathGame.OPS[op].label + '</th>' + BD.GRADES.map(function (g) {
          const s = p.mathStats[g + "-" + op]; return '<td>' + (s ? pct(s.r, s.w) + '<small>' + (s.r + s.w) + '</small>' : "–") + '</td>';
        }).join("") + '</tr>';
      }).join("");
      const sentRow = '<tr><th scope="row">Fix-It Sentences</th>' + BD.GRADES.map(function (g) {
        const s = p.sentenceStats[g]; return '<td>' + (s ? pct(s.r, s.w) + '<small>' + (s.r + s.w) + '</small>' : "–") + '</td>';
      }).join("") + '</tr>';
      const tricky = Object.values(p.tricky).sort(function (a, b) { return b.misses - a.misses; }).slice(0, 16);
      const recent = p.sessions.slice(0, 8).map(function (s) {
        const d = new Date(s.date);
        const what = s.game === "math" ? "Math · " + (s.mode === "clock" ? "Speed" : "Practice") + " · " + s.ops.map(function (o) { return BD.MathGame.OPS[o].sym; }).join("") : "Sentences";
        return '<tr><td>' + d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + '</td><td>' + what + '</td><td>Gr ' + s.grade + '</td><td>' + s.correct + "/" + s.total + '</td><td>+' + s.xp + '</td></tr>';
      }).join("");
      const typeRow = '<tr><th scope="row">First-try rate by mistake type</th>' + BD.GRADES.map(function () { return "<td></td>"; }).join("") + '</tr>';
      const typeRows = Object.keys(BD.FIX_TYPES).map(function (t) {
        return '<tr><th scope="row" class="indent">' + BD.FIX_TYPES[t].label + '</th>' + BD.GRADES.map(function (g) {
          const a = (p.typeRecent[g] || {})[t]; return '<td>' + (a && a.length ? Math.round(100 * BD.Coach.rate(a)) + "%<small>" + a.length + "</small>" : "–") + '</td>';
        }).join("") + '</tr>';
      }).join("");
      const plan = BD.Coach.plan(p);
      return '<article class="report">' +
        '<header class="report-head">' + avatar(p, "lg") + '<div><h3>' + esc(p.name) + '</h3><p class="muted">' + belt.name + ' Belt · ' + p.xp.toLocaleString() + ' XP · practiced ' + p.days.length + (p.days.length === 1 ? " day" : " days") + '</p></div></header>' +
        (p.retry && (p.retry.math || p.retry.sentence) ? '<div class="redo-note"><strong>Redo needed</strong><p>' +
          [p.retry.math ? "Math Dojo Grade " + p.retry.math.grade + " (" + p.retry.math.ops.map(function (o) { return BD.MathGame.OPS[o].label.toLowerCase(); }).join(", ") + ")" : "",
           p.retry.sentence ? "Fix-It Sentences Grade " + p.retry.sentence.grade : ""].filter(Boolean).join(" and ") +
          '. Scored under ' + BD.MathGame.PASS + '%, so this level stays locked in until they pass it.</p><button type="button" class="btn btn-small" data-act="clearRedo">Unlock all levels</button></div>' : '') +
        '<h4 class="label">Accuracy by grade <span class="muted">(number answered underneath)</span></h4>' +
        '<div class="table-wrap"><table class="grid"><thead><tr><th></th>' + BD.GRADES.map(function (g) { return '<th>Gr ' + g + '</th>'; }).join("") + '</tr></thead><tbody>' + opRows + sentRow + typeRow + typeRows + '</tbody></table></div>' +
        (plan.length ? '<h4 class="label">What Sensei is working on next</h4><ul class="plan-text">' + plan.map(function (it) { return '<li><strong>' + esc(it.title) + '.</strong> ' + esc(it.sub) + '</li>'; }).join("") + '</ul>' : '') +
        '<h4 class="label">Tricky math facts</h4>' +
        (tricky.length ? '<ul class="tricky">' + tricky.map(function (t) { return '<li>' + BD.MathGame.show(t) + '</li>'; }).join("") + '</ul><p class="muted small">These come back in practice rounds until they are answered correctly.</p>' : '<p class="muted">None right now.</p>') +
        '<h4 class="label">Recent rounds</h4>' +
        (recent ? '<div class="table-wrap"><table class="grid recent"><tbody>' + recent + '</tbody></table></div>' : '<p class="muted">No rounds yet.</p>') +
        '<div class="report-actions" data-id="' + p.id + '">' +
        '<button type="button" class="btn btn-quiet" data-act="reset">Reset progress</button>' +
        '<button type="button" class="btn btn-quiet danger" data-act="remove">Remove student</button>' +
        '<span class="confirm" hidden><span class="confirm-text"></span> <button type="button" class="btn btn-small danger" data-act="yes">Yes</button> <button type="button" class="btn btn-small" data-act="no">Cancel</button></span>' +
        '</div></article>';
    }).join("");
    show("screen-parent");
  }

  /* ---------- wiring ---------- */
  function bind() {
    $("playerList").addEventListener("click", function (e) {
      const b = e.target.closest("[data-id]"); if (!b) return;
      BD.Store.setCurrent(b.dataset.id); BD.Sound.tap(); home();
    });
    $("addPlayerForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const name = $("newName").value.trim().slice(0, 20);
      if (!name) { $("newName").focus(); return; }
      BD.Store.addPlayer(name, Number($("newGrade").value));
      $("newName").value = "";
      home();
    });
    $("playerChip").addEventListener("click", players);
    $("brandHome").addEventListener("click", function () { BD.Store.current() ? home() : players(); });
    $("muteBtn").addEventListener("click", function () {
      BD.Store.muted = !BD.Store.muted; syncMute();
    });
    $("parentBtn").addEventListener("click", parent);
    $("parentBack").addEventListener("click", function () { BD.Store.current() ? home() : players(); });
    $("playMath").addEventListener("click", function () { BD.MathGame.openSetup(); });
    $("playSent").addEventListener("click", function () { BD.SentenceGame.start(); });
    $("homePlanList").addEventListener("click", function (e) {
      const b = e.target.closest("[data-plan]"); if (b && planItems[Number(b.dataset.plan)]) runPlan(planItems[Number(b.dataset.plan)]);
    });
    $("homeSentGrade").addEventListener("click", function (e) {
      const b = e.target.closest("[data-grade]"); if (!b) return;
      const p = BD.Store.current(); if (p.retry && p.retry.sentence) return; p.sentenceGrade = Number(b.dataset.grade); BD.Store.save(); BD.Sound.tap(); home();
    });
    $("mathSetupBack").addEventListener("click", home);
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
    $("infoSheet").addEventListener("click", function (e) { if (e.target === $("infoSheet")) closeSheet(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("infoSheet").hidden) closeSheet(); });
    BD.MathGame.bind();
    BD.SentenceGame.bind();
    BD.Sensei.bind();
  }
  /* A simple pop-up sheet for lessons and rule books. */
  function sheet(title, html) {
    $("infoTitle").textContent = title;
    $("infoBody").innerHTML = html;
    $("infoSheet").hidden = false;
    document.body.classList.add("sheet-lock");
    setTimeout(function () { $("infoClose").focus(); }, 50);
  }
  function closeSheet() { $("infoSheet").hidden = true; if ($("senseiSheet").hidden) document.body.classList.remove("sheet-lock"); }
  function sheetOpen() { return !$("infoSheet").hidden || !$("senseiSheet").hidden; }

  function syncMute() {
    $("muteBtn").textContent = BD.Store.muted ? "Sound off" : "Sound on";
    $("muteBtn").setAttribute("aria-pressed", String(!BD.Store.muted));
  }

  function init() {
    bind(); syncMute(); BD.Sensei.init();
    BD.Store.onChange(refresh);
    BD.Sync.init();
    BD.Store.current() ? home() : players();
  }

  return { refresh: refresh, sheet: sheet, sheetOpen: sheetOpen, show: show, esc: esc, home: home, players: players, results: results, gradePicker: gradePicker, init: init };
})();

document.addEventListener("DOMContentLoaded", BD.UI.init);
