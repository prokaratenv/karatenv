/* Little sounds (made in code, no files) and confetti. */
window.BD = window.BD || {};

BD.Sound = (function () {
  let ctx = null;
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, vol) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    const t = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function play(fn) { if (BD.Store.muted) return; try { fn(); } catch (e) { /* no audio */ } }
  return {
    right: function () { play(function () { tone(660, 0, 0.12, "triangle"); tone(990, 0.08, 0.18, "triangle"); }); },
    wrong: function () { play(function () { tone(196, 0, 0.22, "square", 0.06); }); },
    tap: function () { play(function () { tone(520, 0, 0.05, "sine", 0.05); }); },
    win: function () { play(function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.25, "triangle"); }); }); },
    belt: function () { play(function () { [392, 523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * 0.1, 0.35, "triangle", 0.2); }); }); }
  };
})();

BD.confetti = function (amount) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.getElementById("confetti");
  if (!canvas) return;
  const g = canvas.getContext("2d");
  const W = canvas.width = window.innerWidth, H = canvas.height = window.innerHeight;
  const colors = BD.BELTS.slice(1).map(function (b) { return b.color; });
  const parts = [];
  for (let i = 0; i < (amount || 120); i++) {
    parts.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.4, y: H * 0.35, vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4, c: colors[i % colors.length],
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3 });
  }
  let frames = 0;
  const run = BD.confetti.run = (BD.confetti.run || 0) + 1;
  (function step() {
    if (run !== BD.confetti.run) return;
    g.clearRect(0, 0, W, H);
    parts.forEach(function (p) {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c;
      g.fillRect(-p.r, -p.r / 3, p.r * 2, p.r / 1.5); g.restore();
    });
    if (++frames < 150) requestAnimationFrame(step); else g.clearRect(0, 0, W, H);
  })();
};

BD.confetti.stop = function () {
  BD.confetti.run = (BD.confetti.run || 0) + 1;
  const canvas = document.getElementById("confetti");
  if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
};
