/* Player profiles, belts and progress. Everything is saved in this browser
   (localStorage) — no accounts, no internet, no payments. */
window.BD = window.BD || {};

BD.BELTS = [
  { name: "White", xp: 0, color: "#FFFFFF" },
  { name: "Yellow", xp: 200, color: "#F5C518" },
  { name: "Orange", xp: 500, color: "#F08A24" },
  { name: "Green", xp: 1000, color: "#2FA866" },
  { name: "Blue", xp: 1800, color: "#2D6CDF" },
  { name: "Purple", xp: 2800, color: "#7B4BC4" },
  { name: "Brown", xp: 4000, color: "#8A5A3B" },
  { name: "Red", xp: 5500, color: "#D63A2F" },
  { name: "Black", xp: 7500, color: "#17171C" }
];
BD.GRADES = [3, 4, 5, 6, 7];
BD.AVATAR_COLORS = ["#E2402F", "#2D6CDF", "#2FA866", "#7B4BC4", "#F08A24", "#0F9BA8"];

BD.beltFor = function (xp) {
  let belt = BD.BELTS[0];
  for (const b of BD.BELTS) if (xp >= b.xp) belt = b;
  return belt;
};
BD.nextBelt = function (xp) {
  return BD.BELTS.find(function (b) { return b.xp > xp; }) || null;
};
BD.today = function () {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

BD.Store = (function () {
  const KEY = "brainDojo.v1";
  let state = load();

  function blank() { return { players: [], currentId: null, muted: false }; }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? Object.assign(blank(), JSON.parse(raw)) : blank();
    } catch (e) { return blank(); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: play still works */ }
  }
  function newPlayer(name, grade) {
    return {
      id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name,
      color: BD.AVATAR_COLORS[state.players.length % BD.AVATAR_COLORS.length],
      mathGrade: grade,
      sentenceGrade: grade,
      mathOps: ["add", "sub", "mul", "div"],
      xp: 0,
      mathStats: {},      // "4-mul": { r: right, w: wrong }
      sentenceStats: {},  // "4": { r: solved, w: missed, firstTry: n }
      tricky: {},         // "7×8": { op, a, b, grade, misses }
      seenSentences: [],
      sessions: [],       // most recent first
      days: []            // dates practiced
    };
  }

  return {
    get muted() { return state.muted; },
    set muted(v) { state.muted = v; save(); },
    players: function () { return state.players; },
    get: function (id) { return state.players.find(function (p) { return p.id === id; }); },
    current: function () { return this.get(state.currentId) || null; },
    setCurrent: function (id) { state.currentId = id; save(); },
    addPlayer: function (name, grade) {
      const p = newPlayer(name, grade);
      state.players.push(p); state.currentId = p.id; save();
      return p;
    },
    removePlayer: function (id) {
      state.players = state.players.filter(function (p) { return p.id !== id; });
      if (state.currentId === id) state.currentId = null;
      save();
    },
    resetPlayer: function (id) {
      const p = this.get(id); if (!p) return;
      const fresh = newPlayer(p.name, p.mathGrade);
      fresh.id = p.id; fresh.color = p.color; fresh.sentenceGrade = p.sentenceGrade;
      Object.assign(p, fresh); save();
    },
    save: save,

    /* Add XP and report whether a new belt was earned. */
    addXP: function (p, amount) {
      const before = BD.beltFor(p.xp);
      p.xp += Math.max(0, Math.round(amount));
      const after = BD.beltFor(p.xp);
      save();
      return { before: before, after: after, promoted: after.name !== before.name };
    },
    recordSession: function (p, s) {
      s.date = new Date().toISOString();
      p.sessions.unshift(s);
      p.sessions = p.sessions.slice(0, 60);
      const t = BD.today();
      if (p.days.indexOf(t) === -1) p.days.push(t);
      save();
    }
  };
})();
