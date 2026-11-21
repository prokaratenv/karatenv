/* DOJO DUEL — two players, one phone or tablet. The screen splits in two
   (the top half flips to face the player across the table). Each player gets
   questions at their own grade, so a 2nd grader can duel a 6th grader fairly.
   First to the goal wins; a wrong answer freezes that player for a moment. */
window.BD = window.BD || {};

BD.Duel = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const FREEZE = 1500, XP = 20;
  let D = null;

  function playerOptions(sel) {
    const list = BD.Store.players();
    return list.map(function (p) { return '<option value="' + p.id + '"' + (p.id === sel ? " selected" : "") + '>' + esc(p.name) + ' · ' + BD.gradeShort(BD.Rank.dojoGrade(p)) + '</option>'; }).join("") +
      '<option value="guest"' + (sel === "guest" ? " selected" : "") + '>Guest player</option>';
  }
  function setup() {
    const me = BD.Store.current(), list = BD.Store.players();
    const other = list.find(function (p) { return !me || p.id !== me.id; });
    const grades = BD.GRADES.map(function (g) { return '<option value="' + g + '">' + BD.gradeLabel(g) + '</option>'; }).join("");
    BD.UI.sheet("Dojo Duel",
      '<p>Two players, one screen. Each player answers questions at <strong>their own grade</strong>. First to the goal wins. A wrong answer freezes you for a moment!</p>' +
      [1, 2].map(function (n) {
        const sel = n === 1 ? (me ? me.id : "guest") : (other ? other.id : "guest");
        return '<div class="duel-pick"><span class="duel-tag p' + n + '">Player ' + n + '</span>' +
          '<select id="duelP' + n + '">' + playerOptions(sel) + '</select>' +
          '<span class="duel-guest" id="duelG' + n + '"' + (sel === "guest" ? "" : " hidden") + '><input id="duelN' + n + '" maxlength="12" placeholder="Name"><select id="duelGr' + n + '">' + grades + '</select></span></div>';
      }).join("") +
      '<div class="duel-pick"><span class="duel-tag">Goal</span><select id="duelGoal"><option value="5">First to 5</option><option value="10" selected>First to 10</option><option value="15">First to 15</option></select></div>' +
      '<label class="duel-face"><input type="checkbox" id="duelFlip" checked> Sitting across from each other (flip the top half)</label>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="duelGo">Start the duel!</button></div>');
    [1, 2].forEach(function (n) {
      $("duelGr" + n).value = "3";
      $("duelP" + n).onchange = function () { $("duelG" + n).hidden = this.value !== "guest"; };
    });
    $("duelGo").onclick = function () {
      const who = [1, 2].map(function (n) {
        const v = $("duelP" + n).value;
        if (v === "guest") return { id: null, name: ($("duelN" + n).value.trim().slice(0, 12) || "Player " + n), grade: Number($("duelGr" + n).value) };
        const p = BD.Store.get(v); return { id: p.id, name: p.name, grade: BD.Rank.dojoGrade(p) };
      });
      if (who[0].id && who[0].id === who[1].id) { alert("Pick two different players."); return; }
      $("infoClose").click();
      start(who, Number($("duelGoal").value), $("duelFlip").checked);
    };
  }

  function start(who, goal, flip) {
    D = { goal: goal, over: false, players: who.map(function (w, i) { return Object.assign({ n: i + 1, score: 0, right: 0, asked: 0, frozenUntil: 0 }, w); }) };
    $("duelArena").classList.toggle("flip", !!flip);
    $("duelOver").hidden = true;
    BD.UI.show("screen-duel");
    D.players.forEach(function (pl) { $("duelName" + pl.n).textContent = pl.name + " · " + BD.gradeShort(pl.grade); hud(pl); ask(pl); });
  }
  function hud(pl) {
    $("duelScore" + pl.n).textContent = pl.score + " / " + D.goal;
    $("duelBar" + pl.n).style.width = (100 * pl.score / D.goal) + "%";
  }
  function ask(pl) {
    if (!D || D.over) return;
    pl.q = BD.Quick.question(pl.grade);
    BD.QuickUI.render($("duelQ" + pl.n), pl.q, function (v) { pick(pl, v); });
  }
  function pick(pl, v) {
    if (!D || D.over || Date.now() < pl.frozenUntil || pl.busy) return;
    pl.busy = true; pl.asked++;
    BD.QuickUI.mark($("duelQ" + pl.n), pl.q, v);
    const half = $("duelHalf" + pl.n);
    if (v === pl.q.answer) {
      pl.score++; pl.right++; hud(pl); BD.Sound.right();
      half.classList.remove("good", "frozen"); void half.offsetWidth; half.classList.add("good");
      if (pl.score >= D.goal) return win(pl);
      setTimeout(function () { pl.busy = false; ask(pl); }, 450);
    } else {
      BD.Sound.wrong();
      pl.frozenUntil = Date.now() + FREEZE;
      half.classList.remove("good"); half.classList.add("frozen");
      setTimeout(function () { half.classList.remove("frozen"); pl.busy = false; ask(pl); }, FREEZE);
    }
  }
  function win(pl) {
    D.over = true;
    const loser = D.players[pl.n === 1 ? 1 : 0];
    D.players.forEach(function (x) {
      if (!x.id) return;
      const p = BD.Store.get(x.id); if (!p) return;
      const won = x === pl;
      if (won) { p.xp = (p.xp || 0) + XP; p.duelWins = (p.duelWins || 0) + 1; }
      BD.Store.recordSession(p, { game: "duel", grade: x.grade, correct: x.right, total: x.asked, xp: won ? XP : 0, won: won, vs: (won ? loser : pl).name });
    });
    $("duelOver").hidden = false;
    $("duelOver").classList.toggle("top-won", pl.n === 1);
    $("duelOverTitle").textContent = pl.name + " wins the duel!";
    $("duelOverSub").textContent = pl.score + " to " + loser.score + (pl.id ? " · +" + XP + " XP" : "") + ". Bow to your opponent!";
    BD.Sound.belt(); BD.confetti(180);
  }
  function stop() { D = null; }

  function bind() {
    $("duelCard").addEventListener("click", setup);
    $("duelQuit").addEventListener("click", function () { stop(); BD.UI.home(); });
    $("duelAgain").addEventListener("click", function () { if (!D) return; const who = D.players.map(function (x) { return { id: x.id, name: x.name, grade: x.grade }; }); start(who, D.goal, $("duelArena").classList.contains("flip")); });
    $("duelHome").addEventListener("click", function () { stop(); BD.UI.home(); });
  }
  return { setup: setup, start: start, stop: stop, bind: bind, state: function () { return D; } };
})();
