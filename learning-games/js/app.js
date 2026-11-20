/* Screens: choose player, dojo home, results, parent corner. */
window.BD = window.BD || {};

BD.UI = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };

  function show(id) {
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
  function gradePicker(id, selected) {
    return '<div class="chips grade-chips" id="' + id + '" role="group" aria-label="Grade level">' +
      BD.GRADES.map(function (g) {
        return '<button type="button" class="chip' + (g === selected ? " on" : "") + '" data-grade="' + g + '" aria-pressed="' + (g === selected) + '">Grade ' + g + '</button>';
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
    $("homeMathGrade").textContent = "Grade " + p.mathGrade;
    $("homeSentGrade").innerHTML = gradePicker("sentGradePick", p.sentenceGrade);
    show("screen-home");
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
    $("resListTitle").textContent = o.listTitle || "";
    $("resListTitle").hidden = !o.listTitle;
    $("resList").innerHTML = (o.list || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    $("resLevel").hidden = !o.levelUp;
    if (o.levelUp) $("resLevelText").textContent = o.levelUp.text;
    $("resAgain").textContent = o.againLabel || "Play again";
    $("resSetup").hidden = !o.setup;
    show("screen-results");
    if (o.belt.promoted) { BD.Sound.belt(); BD.confetti(200); }
    else { BD.Sound.win(); BD.confetti(80); }
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
      return '<article class="report">' +
        '<header class="report-head">' + avatar(p, "lg") + '<div><h3>' + esc(p.name) + '</h3><p class="muted">' + belt.name + ' Belt · ' + p.xp.toLocaleString() + ' XP · practiced ' + p.days.length + (p.days.length === 1 ? " day" : " days") + '</p></div></header>' +
        '<h4 class="label">Accuracy by grade <span class="muted">(number answered underneath)</span></h4>' +
        '<div class="table-wrap"><table class="grid"><thead><tr><th></th>' + BD.GRADES.map(function (g) { return '<th>Gr ' + g + '</th>'; }).join("") + '</tr></thead><tbody>' + opRows + sentRow + '</tbody></table></div>' +
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
    $("homeSentGrade").addEventListener("click", function (e) {
      const b = e.target.closest("[data-grade]"); if (!b) return;
      const p = BD.Store.current(); p.sentenceGrade = Number(b.dataset.grade); BD.Store.save(); BD.Sound.tap(); home();
    });
    $("mathSetupBack").addEventListener("click", home);
    $("resAgain").addEventListener("click", function () { lastResult && lastResult.again(); });
    $("resSetup").addEventListener("click", function () { lastResult && lastResult.setup && lastResult.setup(); });
    $("resHome").addEventListener("click", home);
    $("resLevelBtn").addEventListener("click", function () { lastResult && lastResult.levelUp && lastResult.levelUp.action(); });
    $("parentBody").addEventListener("click", function (e) {
      const b = e.target.closest("[data-act]"); if (!b) return;
      const box = b.closest(".report-actions"), id = box.dataset.id, confirm = box.querySelector(".confirm");
      const p = BD.Store.get(id);
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
    BD.MathGame.bind();
    BD.SentenceGame.bind();
  }
  function syncMute() {
    $("muteBtn").textContent = BD.Store.muted ? "Sound off" : "Sound on";
    $("muteBtn").setAttribute("aria-pressed", String(!BD.Store.muted));
  }

  function init() {
    bind(); syncMute();
    BD.Store.current() ? home() : players();
  }

  return { show: show, esc: esc, home: home, players: players, results: results, gradePicker: gradePicker, init: init };
})();

document.addEventListener("DOMContentLoaded", BD.UI.init);
