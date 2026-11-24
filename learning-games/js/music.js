/* MUSIC — an original Brain Dojo soundtrack, played by little synthesizers
   in code (no audio files, so it works offline and loads instantly).
   Pieces:
     dojo   "Morning Bow"    welcome, home and parent screens (bright koto, flute and a light beat)
     map    "Path of Belts"  the Adventure Map (bright flute adventure)
     focus  "Quiet Mind"     while kids answer questions (very soft, no melody)
     boss   "Rival Stance"   boss battles and Partner Challenge (taiko drive)
     final  "Iron Tower"     Black Belt and Final Boss Master Young (heavier)
     win    a short victory fanfare after wins and graduations
   Quiet by default, ducks while a voice reads aloud, pauses when the app is
   hidden, and can be switched off (with its own volume) in the Sound menu. */
window.BD = window.BD || {};

BD.Music = (function () {
  const KEY = "brainDojo.audio";
  const DEFAULT_VOL = 15; // music starts at 15%
  const load = function () {
    let p = {};
    try { p = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { p = {}; }
    // earlier versions saved 35% as the starting level: move those to the new 15% start
    if (!p.v2) { if (p.vol === 35 || p.vol === undefined) p.vol = DEFAULT_VOL; p.v2 = true; }
    return Object.assign({ music: true, vol: DEFAULT_VOL, v2: true }, p);
  };
  let prefs = load();
  const savePrefs = function () { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* storage blocked */ } };

  /* ---------- notes ---------- */
  const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function midi(n) { const m = /^([A-G])([#b]?)(-?\d)$/.exec(n); return m ? 12 * (Number(m[3]) + 1) + NAMES[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) : null; }
  const hz = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  /* "A4 - C5 . D5" → steps: a note starts, "-" holds it, "." rests. */
  function line(str) {
    const out = [];
    str.replace(/\|/g, " ").trim().split(/\s+/).forEach(function (tok) {
      if (tok === "-") { for (let i = out.length - 1; i >= 0; i--) if (out[i]) { out[i].len++; break; } else if (out[i] === null) break; out.push(undefined); }
      else if (tok === ".") out.push(null);
      else out.push({ m: midi(tok), len: 1 });
    });
    return out;
  }
  const chord = function (names) { return names.split(" ").map(midi); };

  /* ---------- the pieces ---------- */
  function arp(chords, order, up) { // one bar (8 eighths) per chord
    const steps = [];
    chords.forEach(function (c) { order.forEach(function (i) { steps.push({ m: c[i % c.length] + (up || 0) + (i >= c.length ? 12 : 0), len: 1 }); }); });
    return steps;
  }
  function perBar(chords, at, len, fn) { // chord events on given steps of each 8-step bar
    const steps = [];
    chords.forEach(function (c) { for (let s = 0; s < 8; s++) steps.push(at.indexOf(s) !== -1 ? { ms: fn ? fn(c, s) : c, len: len } : null); });
    return steps;
  }
  function beat(vels) { return vels.map(function (v) { return v ? { v: v, len: 1 } : null; }); }

  const DOJO_CH = [chord("D3 F3 A3 C4"), chord("Bb2 D3 F3 A3"), chord("G2 Bb2 D3 F3"), chord("A2 D3 E3 G3")];
  const MAP_CH = [chord("G2 B2 D3"), chord("E2 G2 B2"), chord("C3 E3 G3"), chord("D3 F#3 A3")];
  const FOCUS_CH = [chord("A2 E3 B3 C4"), chord("F2 C3 E3 A3"), chord("C3 G3 B3 E4"), chord("G2 D3 E3 B3")];
  const BOSS_CH = [chord("E3 G3 B3"), chord("E3 G3 B3"), chord("F3 A3 C4"), chord("D3 F#3 A3")];
  const FINAL_CH = [chord("D3 F3 A3"), chord("D3 F3 A3"), chord("Bb2 D3 F3"), chord("A2 C#3 E3")];
  const riff = function (chords, rel) { const s = []; chords.forEach(function (c) { rel.forEach(function (r) { s.push({ m: c[0] - 12 + r, len: 1 }); }); }); return s; };

  const TRACKS = {
    dojo: { bpm: 100, gain: 1, parts: [
      { inst: "pad", vel: 0.12, steps: perBar(DOJO_CH, [0], 8) },
      { inst: "koto", vel: 0.3, steps: arp(DOJO_CH, [0, 2, 1, 3, 2, 1, 3, 2], 12) },
      { inst: "bass", vel: 0.3, steps: perBar(DOJO_CH, [0, 3, 4, 6], 1, function (c, s) { return [c[0] - 12 + (s === 4 ? 7 : s === 6 ? 12 : 0)]; }) },
      { inst: "taiko", vel: 0.38, steps: beat([1, 0, 0, 0.5, 0.8, 0, 0.4, 0]) },
      { inst: "shaker", vel: 0.1, steps: beat([0.7, 0.4, 0.7, 0.4, 0.7, 0.4, 0.7, 0.5]) },
      { inst: "flute", vel: 0.2, steps: line("D5 - F5 - A5 - G5 F5 | D5 - - - C5 - D5 - | G4 - Bb4 - D5 - F5 - | E5 - - - D5 - C5 - | A4 - C5 - D5 - F5 - | G5 - F5 D5 - - C5 - | Bb4 - D5 - G5 - F5 - | E5 - D5 - C#5 - - .") }
    ] },
    map: { bpm: 100, gain: 1, parts: [
      { inst: "pad", vel: 0.12, steps: perBar(MAP_CH, [0], 8) },
      { inst: "koto", vel: 0.26, steps: arp(MAP_CH, [0, 1, 2, 1, 0, 1, 2, 1], 12) },
      { inst: "bass", vel: 0.3, steps: perBar(MAP_CH, [0, 3, 4], 1, function (c) { return [c[0] - 12]; }) },
      { inst: "shaker", vel: 0.12, steps: beat([0.7, 0.4, 0.7, 0.4, 0.7, 0.4, 0.7, 0.5]) },
      { inst: "taiko", vel: 0.3, steps: beat([1, 0, 0, 0, 0.6, 0, 0, 0]) },
      { inst: "flute", vel: 0.22, steps: line("D5 - B4 - G4 - A4 B4 | E5 - D5 - B4 - - - | C5 - E5 - G5 - E5 D5 | D5 - - - A4 - - - | G4 - A4 - B4 - D5 - | E5 - G5 - E5 - D5 - | C5 - B4 - A4 - G4 - | A4 - - - - - - .") }
    ] },
    focus: { bpm: 66, gain: 0.7, parts: [
      { inst: "pad", vel: 0.14, steps: perBar(FOCUS_CH, [0], 8) },
      { inst: "koto", vel: 0.2, steps: perBar(FOCUS_CH, [0, 5], 3, function (c, s) { return [c[s === 0 ? c.length - 1 : 1] + 12]; }) },
      { inst: "bell", vel: 0.07, steps: Array(24).fill(null).concat(line("E5 - - - - - - - | . . . . . . . .")) }
    ] },
    boss: { bpm: 132, gain: 1, parts: [
      { inst: "bass", vel: 0.34, steps: riff(BOSS_CH, [0, 0, 12, 0, 3, 0, 7, 5]) },
      { inst: "taiko", vel: 0.55, steps: beat([1, 0, 0, 0.8, 0.5, 0, 0.8, 0.5]) },
      { inst: "shaker", vel: 0.1, steps: beat([0.6, 0.4, 0.6, 0.4, 0.6, 0.4, 0.6, 0.4]) },
      { inst: "stab", vel: 0.12, steps: perBar(BOSS_CH, [0, 3], 1) },
      { inst: "koto", vel: 0.3, steps: Array(32).fill(null).concat(line("E5 . G5 . B5 A5 G5 . | F5 . E5 . D5 . E5 - | E5 . G5 . B5 A5 G5 . | A5 . G5 . F#5 . E5 -")) }
    ] },
    final: { bpm: 144, gain: 1, parts: [
      { inst: "pad", vel: 0.1, steps: perBar(FINAL_CH, [0], 8) },
      { inst: "bass", vel: 0.36, steps: riff(FINAL_CH, [0, 0, 12, 0, 0, 12, 10, 7]) },
      { inst: "taiko", vel: 0.6, steps: beat([1, 0.4, 0.7, 0.4, 1, 0.4, 0.8, 0.6]) },
      { inst: "shaker", vel: 0.12, steps: beat([0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5]) },
      { inst: "stab", vel: 0.13, steps: perBar(FINAL_CH, [0, 2, 5], 1) },
      { inst: "flute", vel: 0.2, steps: line("D5 . F5 . A5 . G5 F5 | E5 . C5 . D5 - - - | A5 . G5 . F5 . E5 . | F5 - E5 - C#5 - - -") }
    ] }
  };

  /* ---------- the instruments ---------- */
  let ac = null, out = null, duck = null, noise = null;
  function setup() {
    if (ac) return ac;
    ac = BD.Sound && BD.Sound.ctx ? BD.Sound.ctx() : null;
    if (!ac) return null;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    duck = ac.createGain(); out = ac.createGain(); out.gain.value = 0;
    out.connect(duck); duck.connect(comp); comp.connect(ac.destination);
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }
  function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function osc(type, f, t, end, dest, detune) { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; if (detune) o.detune.value = detune; o.connect(dest); o.start(t); o.stop(end); return o; }
  function filt(type, f, dest) { const x = ac.createBiquadFilter(); x.type = type; x.frequency.value = f; x.connect(dest); return x; }
  const INST = {
    koto: function (m, t, dur, v, bus) {
      const g = ac.createGain(); g.connect(bus); const lp = filt("lowpass", 3200, g);
      env(g, t, 0.005, v, Math.min(1.4, dur + 0.7));
      osc("triangle", hz(m), t, t + dur + 1, lp); osc("sine", hz(m) * 2, t, t + 0.3, lp);
    },
    flute: function (m, t, dur, v, bus) {
      const g = ac.createGain(); g.connect(bus);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.07);
      g.gain.setValueAtTime(v, t + Math.max(0.08, dur - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
      const o = osc("sine", hz(m), t, t + dur + 0.3, g);
      const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5; lg.gain.value = hz(m) * 0.006; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t + 0.15); lfo.stop(t + dur + 0.3);
      osc("triangle", hz(m), t, t + dur + 0.3, (function () { const q = ac.createGain(); q.gain.value = 0.15; q.connect(g); return q; })());
    },
    pad: function (ms, t, dur, v, bus) {
      const g = ac.createGain(); g.connect(bus); const lp = filt("lowpass", 900, g);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.6, dur / 2));
      g.gain.setValueAtTime(v, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
      ms.forEach(function (m) { osc("sawtooth", hz(m), t, t + dur + 0.7, lp, -7); osc("sawtooth", hz(m), t, t + dur + 0.7, lp, 7); });
    },
    bass: function (m, t, dur, v, bus) {
      const g = ac.createGain(); g.connect(bus); const lp = filt("lowpass", 600, g);
      env(g, t, 0.01, v, Math.max(0.15, dur));
      osc("triangle", hz(m), t, t + dur + 0.3, lp); osc("sine", hz(m), t, t + dur + 0.3, lp);
    },
    taiko: function (_, t, dur, v, bus) {
      const g = ac.createGain(); g.connect(bus); env(g, t, 0.003, v, 0.4);
      const o = ac.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.3); o.connect(g); o.start(t); o.stop(t + 0.5);
      const n = ac.createBufferSource(), ng = ac.createGain(); n.buffer = noise; ng.connect(bus); const lp = filt("lowpass", 500, ng); n.connect(lp); env(ng, t, 0.002, v * 0.5, 0.12); n.start(t); n.stop(t + 0.2);
    },
    shaker: function (_, t, dur, v, bus) {
      const n = ac.createBufferSource(), g = ac.createGain(); n.buffer = noise; g.connect(bus); const hp = filt("highpass", 6500, g); n.connect(hp);
      env(g, t, 0.004, v, 0.05); n.start(t, Math.random() * 0.5); n.stop(t + 0.08);
    },
    stab: function (ms, t, dur, v, bus) {
      const g = ac.createGain(); g.connect(bus); const lp = filt("lowpass", 1400, g); env(g, t, 0.005, v, 0.18);
      ms.forEach(function (m) { osc("sawtooth", hz(m), t, t + 0.3, lp); });
    },
    bell: function (m, t, dur, v, bus) {
      const g = ac.createGain(); g.connect(bus); env(g, t, 0.004, v, 2.2);
      osc("sine", hz(m), t, t + 2.4, g); const h = ac.createGain(); h.gain.value = 0.25; h.connect(g); osc("sine", hz(m) * 2.76, t, t + 1.2, h);
    }
  };

  /* ---------- the player ---------- */
  let cur = null, wanted = "dojo", timer = null, unlocked = false;
  function level() { return prefs.music ? Math.pow(prefs.vol / 100, 2) * 0.35 : 0; }
  function applyVolume(fast) {
    if (!out) return;
    const t = ac.currentTime;
    out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t);
    out.gain.linearRampToValueAtTime(level(), t + (fast ? 0.05 : 0.6));
  }
  function startTrack(name) {
    if (!setup() || !TRACKS[name]) return;
    const t = ac.currentTime;
    if (cur) { const old = cur.bus; old.gain.cancelScheduledValues(t); old.gain.setValueAtTime(old.gain.value, t); old.gain.linearRampToValueAtTime(0.0001, t + 0.8); setTimeout(function () { try { old.disconnect(); } catch (e) { /* gone */ } }, 1200); }
    const bus = ac.createGain(); bus.connect(out);
    bus.gain.setValueAtTime(0.0001, t); bus.gain.linearRampToValueAtTime(TRACKS[name].gain, t + 0.9);
    cur = { name: name, tr: TRACKS[name], bus: bus, step: 0, next: t + 0.1 };
  }
  function tick() {
    if (!cur || !ac) return;
    // duck under read-aloud
    const speaking = BD.Speech && BD.Speech.speaking && BD.Speech.speaking();
    duck.gain.setTargetAtTime(speaking ? 0.3 : 1, ac.currentTime, 0.15);
    const tr = cur.tr, stepDur = 60 / tr.bpm / 2;
    while (cur.next < ac.currentTime + 0.15) {
      tr.parts.forEach(function (p) {
        const ev = p.steps[cur.step % p.steps.length];
        if (!ev) return;
        const chordInst = p.inst === "pad" || p.inst === "stab";
        const note = chordInst ? (ev.ms || [ev.m]) : (ev.m != null ? ev.m : ev.ms ? ev.ms[0] : 0);
        try { INST[p.inst](note, cur.next, ev.len * stepDur, p.vel * (ev.v || 1), cur.bus); } catch (e) { /* skip a note */ }
      });
      cur.step++; cur.next += stepDur;
    }
  }
  function run() {
    if (timer || !unlocked || !prefs.music || document.visibilityState === "hidden") return;
    if (!setup()) return;
    if (ac.state === "suspended") ac.resume();
    if (!cur || cur.name !== wanted) startTrack(wanted);
    applyVolume();
    timer = setInterval(tick, 30); tick();
  }
  function halt(keep) {
    clearInterval(timer); timer = null;
    if (out) applyVolume(true);
    if (out && !keep) { const t = ac.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + 0.3); }
    if (!keep) cur = null;
  }

  /* Pick the piece for what's on screen. */
  const SCREEN = { "screen-math-play": "focus", "screen-sentence-play": "focus", "screen-read-play": "focus", "screen-word-play": "focus", "screen-spanish-play": "focus", "screen-little-play": "focus", "screen-boss": "boss", "screen-duel": "boss" };
  let screenTrack = "dojo";
  function scene(name) {
    wanted = name;
    if (timer && cur && cur.name !== name) startTrack(name);
    else run();
  }
  function forScreen(id) { screenTrack = SCREEN[id] || "dojo"; scene(screenTrack); }
  function back() { scene(screenTrack); }

  /* A short victory fanfare over a quieter track. */
  function fanfare() {
    if (!prefs.music || !unlocked || !setup()) return;
    const t = ac.currentTime + 0.05, bus = ac.createGain(); bus.connect(out); bus.gain.value = 1.3;
    if (cur) { cur.bus.gain.setTargetAtTime(0.25, t, 0.1); cur.bus.gain.setTargetAtTime(cur.tr.gain, t + 2.6, 0.4); }
    ["C5", "E5", "G5", "C6"].forEach(function (n, i) { INST.koto(midi(n), t + i * 0.13, 0.3, 0.4, bus); });
    INST.pad(chord("C4 E4 G4 C5"), t + 0.52, 1.6, 0.18, bus);
    INST.flute(midi("G5"), t + 0.52, 0.4, 0.22, bus); INST.flute(midi("C6"), t + 0.95, 1.1, 0.22, bus);
    INST.taiko(0, t + 0.52, 0.3, 0.5, bus);
    setTimeout(function () { try { bus.disconnect(); } catch (e) { /* gone */ } }, 4000);
  }

  function set(o) {
    prefs = Object.assign(prefs, o); savePrefs();
    if (!prefs.music) halt(); else { if (timer) applyVolume(); else run(); }
  }

  /* Browsers only allow sound after a tap: start on the first one. */
  function unlock() {
    if (unlocked) return; unlocked = true;
    run();
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) { document.addEventListener(ev, unlock, { once: true, passive: true, capture: true }); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") halt(true); else run(); });

  /* Render a piece to audio (for previews and tests): resolves to an AudioBuffer. */
  function render(name, seconds) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, tr = TRACKS[name];
    if (!OAC || !tr) return Promise.reject(new Error("no offline audio"));
    const live = { ac: ac, noise: noise };
    const oac = new OAC(2, Math.round(44100 * seconds), 44100);
    ac = oac;
    noise = oac.createBuffer(1, oac.sampleRate, oac.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const bus = oac.createGain(); bus.gain.value = tr.gain * Math.pow(prefs.vol / 100, 2) * 0.35 * 6; bus.connect(oac.destination); // louder than in-app, for listening
    const stepDur = 60 / tr.bpm / 2;
    for (let step = 0, t = 0.05; t < seconds - 0.5; step++, t += stepDur) {
      tr.parts.forEach(function (p) {
        const ev = p.steps[step % p.steps.length]; if (!ev) return;
        const chordInst = p.inst === "pad" || p.inst === "stab";
        try { INST[p.inst](chordInst ? (ev.ms || [ev.m]) : (ev.m != null ? ev.m : ev.ms ? ev.ms[0] : 0), t, ev.len * stepDur, p.vel * (ev.v || 1), bus); } catch (e) { /* skip */ }
      });
    }
    ac = live.ac; noise = live.noise;
    return oac.startRendering();
  }

  return { render: render, scene: scene, forScreen: forScreen, back: back, fanfare: fanfare, set: set, prefs: function () { return Object.assign({}, prefs); }, playing: function () { return !!timer; }, current: function () { return cur && cur.name; }, TRACKS: Object.keys(TRACKS) };
})();
