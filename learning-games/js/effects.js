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

/* Text-to-speech using the device's built-in voices (no internet or login needed).
   Used to read stories aloud, say Spanish words, and say spelling words. */
BD.Speech = (function () {
  const ok = typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  function voiceFor(lang) {
    try {
      const vs = window.speechSynthesis.getVoices();
      return vs.find(function (v) { return v.lang && v.lang.toLowerCase() === lang.toLowerCase(); }) ||
        vs.find(function (v) { return v.lang && v.lang.toLowerCase().indexOf(lang.slice(0, 2).toLowerCase()) === 0; }) || null;
    } catch (e) { return null; }
  }
  function say(text, lang, rate) {
    if (!ok || !text) return false;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang || "en-US";
      const v = voiceFor(u.lang); if (v) u.voice = v;
      u.rate = rate || 0.9;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }
  function stop() { if (ok) try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  function speaking() { return ok && window.speechSynthesis.speaking; }
  if (ok) try { window.speechSynthesis.getVoices(); } catch (e) { /* warm up voice list */ }
  /* Several pieces in a row (e.g. English instructions, then a Spanish word). */
  function sayAll(parts, rate) {
    if (!ok) return false;
    try {
      window.speechSynthesis.cancel();
      parts.filter(function (x) { return x && x.text; }).forEach(function (x) {
        const u = new SpeechSynthesisUtterance(x.text);
        u.lang = x.lang || "en-US";
        const v = voiceFor(u.lang); if (v) u.voice = v;
        u.rate = x.rate || rate || 0.9;
        window.speechSynthesis.speak(u);
      });
      return true;
    } catch (e) { return false; }
  }
  return { available: ok, say: say, sayAll: sayAll, stop: stop, speaking: speaking };
})();

/* READ ALOUD — instructions spoken for children who can't read yet.
   Every game card has a speaker button. Pre-K to 1st grade hear the
   instructions automatically unless sound is off or Quiet mode is on. */
BD.ReadAloud = {
  can: function () { return BD.Speech.available && !(BD.Store && BD.Store.muted); },
  auto: function (grade) {
    const p = BD.Store && BD.Store.current();
    return this.can() && Number(grade) <= 1 && !(p && p.quietMode);
  },
  /* parts: a string, or [{text, lang}] */
  say: function (parts) {
    if (!this.can()) return false;
    return BD.Speech.sayAll(typeof parts === "string" ? [{ text: parts }] : parts, 0.9);
  },
  /* Math symbols and blanks as words. */
  words: function (t) {
    return String(t).replace(/_{2,}/g, " blank ").replace(/×/g, " times ").replace(/÷/g, " divided by ").replace(/−/g, " minus ")
      .replace(/\+/g, " plus ").replace(/=\s*\??\s*$/, "").replace(/\s+/g, " ").trim();
  }
};
