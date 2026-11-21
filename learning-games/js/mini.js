/* THE CHAMPION IN EVERY GAME — a small version of the student's champion
   (in their belt and gear) beside each game. It throws a kick on a right
   answer, shakes it off on a miss and bows at the end of a round.
   Hooked to the game sounds, so every game gets it for free. */
window.BD = window.BD || {};

BD.Mini = (function () {
  const SAY = {
    right: ["Hi-yah!", "Pow!", "Kiai!", "Boom!", "Yes!"],
    wrong: ["Shake it off!", "Again!", "Focus!", "Oof!"],
    bow: ["Osu!", "Bow!"]
  };
  function fill(root) {
    const p = BD.Store.current(); if (!p) return;
    (root || document).querySelectorAll("[data-mini]").forEach(function (el) {
      el.innerHTML = '<span class="mini-body">' + BD.UI.championHTML(p) + '</span><span class="mini-say" aria-hidden="true"></span>';
    });
  }
  function react(kind) {
    document.querySelectorAll(".screen:not([hidden]) [data-mini], .boss-arena [data-mini]").forEach(function (el) {
      if (!el.offsetParent) return;
      el.classList.remove("kick", "oops", "bow");
      void el.offsetWidth; // restart the animation
      el.classList.add(kind === "right" ? "kick" : kind === "wrong" ? "oops" : "bow");
      const list = SAY[kind] || SAY.right, s = el.querySelector(".mini-say");
      if (s) s.textContent = list[Math.floor(Math.random() * list.length)];
    });
  }
  // every game already plays these sounds at the right moments
  const right = BD.Sound.right, wrong = BD.Sound.wrong;
  BD.Sound.right = function () { right.apply(BD.Sound, arguments); react("right"); };
  BD.Sound.wrong = function () { wrong.apply(BD.Sound, arguments); react("wrong"); };
  return { fill: fill, react: react };
})();
