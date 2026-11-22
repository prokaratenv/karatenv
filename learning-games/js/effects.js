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
  const music = function () { if (BD.Music) try { BD.Music.fanfare(); } catch (e) { /* no music */ } };
  return {
    ctx: ac,
    right: function () { play(function () { tone(660, 0, 0.12, "triangle"); tone(990, 0.08, 0.18, "triangle"); }); },
    wrong: function () { play(function () { tone(196, 0, 0.22, "square", 0.06); }); },
    tap: function () { play(function () { tone(520, 0, 0.05, "sine", 0.05); }); },
    win: function () { play(function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.25, "triangle"); }); }); music(); },
    belt: function () { play(function () { [392, 523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * 0.1, 0.35, "triangle", 0.2); }); }); music(); }
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
  /* Novelty voices (mostly macOS/iOS) that are hard for children to understand. */
  const ODD = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|pipe organ|ralph|junior|fred/i;
  /* The clearest voice for a language: exact language match first, on-device
     ("local") voices before network ones (local voices also tend to report
     word boundaries, which the read-along highlighting uses), then the default. */
  function voiceFor(lang) {
    try {
      const vs = window.speechSynthesis.getVoices(), want = String(lang || "en-US").toLowerCase().replace("_", "-");
      const norm = function (v) { return String(v.lang || "").toLowerCase().replace("_", "-"); };
      const score = function (v) {
        const l = norm(v);
        let s = l === want ? 40 : l.indexOf(want.slice(0, 2)) === 0 ? 20 : -1000;
        if (v.localService) s += 8;
        if (v.default) s += 2;
        if (ODD.test(v.name || "")) s -= 30;
        if (/enhanced|premium|natural|samantha|google us english/i.test(v.name || "")) s += 3;
        return s;
      };
      let best = null, bs = -1;
      vs.forEach(function (v) { const s = score(v); if (s > bs) { best = v; bs = s; } });
      return bs >= 0 ? best : null;
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
  return { available: ok, say: say, sayAll: sayAll, stop: stop, speaking: speaking, voiceFor: voiceFor };
})();

/* READ ALOUD — instructions spoken for children who can't read yet.
   Every game card has a speaker button. Pre-K to 1st grade hear the
   instructions automatically unless sound is off or Quiet mode is on. */
BD.ReadAloud = {
  can: function () { return BD.Speech.available && !(BD.Store && BD.Store.muted); },
  /* Should this grade hear things automatically? Follows the family's
     "Read aloud" setting (BD.ReadAlong, js/readalong.js): "auto" = Pre-K to
     1st grade (the original behaviour), "always" = every grade, "tap" = never. */
  auto: function (grade) {
    const p = BD.Store && BD.Store.current();
    if (!this.can() || (p && p.quietMode)) return false;
    const mode = BD.ReadAlong && BD.ReadAlong.settings ? BD.ReadAlong.settings().mode : "auto";
    return mode === "always" ? true : mode === "tap" ? false : Number(grade) <= 1;
  },
  /* The family's reading speed. */
  rate: function () { return BD.ReadAlong && BD.ReadAlong.rate ? BD.ReadAlong.rate() : 0.9; },
  /* parts: a string, or [{text, lang}] */
  say: function (parts) {
    if (!this.can()) return false;
    return BD.Speech.sayAll(typeof parts === "string" ? [{ text: parts }] : parts, this.rate());
  },
  /* Read with word highlighting when js/readalong.js is loaded.
     target: an element, or a list of parts { el?, text?, lang? } (see BD.ReadAlong.read). */
  read: function (target, opts) {
    if (BD.ReadAlong && BD.ReadAlong.read) return BD.ReadAlong.read(target, opts);
    const list = Array.isArray(target) ? target : [target];
    return this.say(list.map(function (x) { return x && x.nodeType ? { text: x.textContent } : x; }).filter(function (x) { return x && (x.text || (x.el && x.el.textContent)); })
      .map(function (x) { return { text: x.text || x.el.textContent, lang: x.lang }; }));
  },
  /* Math symbols and blanks as words. */
  words: function (t) {
    return String(t).replace(/_{2,}/g, " blank ").replace(/×/g, " times ").replace(/÷/g, " divided by ").replace(/−/g, " minus ")
      .replace(/\+/g, " plus ").replace(/=\s*\??\s*$/, "").replace(/\s+/g, " ").trim();
  }
};
