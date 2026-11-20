/* Player profiles, belts and progress.
   Progress is always saved in this browser (works offline). When the game
   is opened through the shared Claude link and you're signed in, BD.Sync
   also saves each student to your Claude account so it follows you to
   any phone, tablet or computer. */
window.BD = window.BD || {};

BD.BELTS = [
  { name: "White", color: "#FFFFFF" },
  { name: "Yellow", color: "#F5C518" },
  { name: "Orange", color: "#F08A24" },
  { name: "Blue", color: "#2D6CDF" },
  { name: "Green", color: "#2FA866" },
  { name: "Purple", color: "#7B4BC4" },
  { name: "Brown", color: "#8A5A3B" },
  { name: "Red", color: "#D63A2F" },
  { name: "Black", color: "#17171C" }
];
BD.GRADES = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8]; // -1 = Pre-K, 0 = Kindergarten
BD.MIN_GRADE = -1;
BD.MAX_GRADE = 8;
BD.gradeLabel = function (g) { g = Number(g); return g === -1 ? "Pre-K" : g === 0 ? "Kindergarten" : "Grade " + g; };
BD.gradeShort = function (g) {
  g = Number(g);
  if (g === -1) return "Pre-K";
  if (g === 0) return "K";
  return g + (g === 1 ? "st" : g === 2 ? "nd" : g === 3 ? "rd" : "th");
};
BD.AVATAR_COLORS = ["#E2402F", "#2D6CDF", "#2FA866", "#7B4BC4", "#F08A24", "#0F9BA8"];

/* The student's belt at the grade they're training (see js/rank.js). */
BD.beltOf = function (p) { return BD.Rank ? BD.Rank.belt(p) : BD.BELTS[0]; };
BD.today = function () {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

BD.Store = (function () {
  const KEY = "brainDojo.v1";
  let state = load();
  const listeners = [];

  function blank() { return { players: [], currentId: null, muted: false }; }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const s = raw ? Object.assign(blank(), JSON.parse(raw)) : blank();
      s.players.forEach(upgrade);
      return s;
    } catch (e) { return blank(); }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: play still works */ }
  }
  /* Fill in fields added in later versions so older saves keep working. */
  function upgrade(p) {
    const d = {
      mathOps: ["add", "sub", "mul", "div"], mathStats: {}, sentenceStats: {}, tricky: {}, seenSentences: [],
      sessions: [], days: [], retry: {}, recent: {}, typeRecent: {}, sentLevel: {}, bestClock: {}, updatedAt: 0,
      readRecent: {}, readStats: {}, seenPassages: [],
      wordStats: {}, wordMissed: {}, seenWords: {}
    };
    Object.keys(d).forEach(function (k) { if (p[k] === undefined || p[k] === null) p[k] = d[k]; });
    const has = function (v) { return v !== undefined && v !== null && v !== ""; };
    const base = has(p.sentenceGrade) ? p.sentenceGrade : has(p.mathGrade) ? p.mathGrade : 3;
    ["readingGrade", "spanishGrade", "spellingGrade"].forEach(function (k) { if (!has(p[k])) p[k] = base; });
    return p;
  }
  function newPlayer(name, grade) {
    return upgrade({
      id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name,
      color: BD.AVATAR_COLORS[state.players.length % BD.AVATAR_COLORS.length],
      mathGrade: grade,
      sentenceGrade: grade,
      readingGrade: grade,
      spanishGrade: grade,
      spellingGrade: grade,
      xp: 0
    });
  }
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { /* keep going */ } }); }
  function current() { return state.players.find(function (p) { return p.id === state.currentId; }) || null; }

  /* Save a student (default: the one playing). */
  function save(p) {
    p = p || current();
    if (p) { p.updatedAt = Date.now(); if (BD.Sync) BD.Sync.queue(p); }
    persist();
  }

  return {
    get muted() { return state.muted; },
    set muted(v) { state.muted = v; persist(); },
    players: function () { return state.players; },
    get: function (id) { return state.players.find(function (p) { return p.id === id; }); },
    current: current,
    setCurrent: function (id) { state.currentId = id; persist(); },
    addPlayer: function (name, grade, avatar) {
      const p = newPlayer(name, grade);
      if (avatar) p.avatar = avatar;
      state.players.push(p); state.currentId = p.id; save(p);
      return p;
    },
    removePlayer: function (id) {
      state.players = state.players.filter(function (p) { return p.id !== id; });
      if (state.currentId === id) state.currentId = null;
      persist();
      if (BD.Sync) BD.Sync.remove(id);
    },
    resetPlayer: function (id) {
      const p = this.get(id); if (!p) return;
      const fresh = newPlayer(p.name, p.mathGrade);
      fresh.id = p.id; fresh.color = p.color; fresh.sentenceGrade = p.sentenceGrade; fresh.avatar = p.avatar;
      Object.keys(p).forEach(function (k) { delete p[k]; });
      Object.assign(p, fresh); save(p);
    },
    save: save,
    upgrade: upgrade,
    /* Bring in a student from a save code (replaces the copy on this device). */
    importPlayer: function (data) {
      const p = upgrade(JSON.parse(JSON.stringify(data)));
      const existing = this.get(p.id);
      if (existing) { Object.keys(existing).forEach(function (k) { delete existing[k]; }); Object.assign(existing, p); }
      else state.players.push(p);
      const live = this.get(p.id);
      state.currentId = live.id;
      save(live); emit();
      return live;
    },
    onChange: function (fn) { listeners.push(fn); },

    /* Called by BD.Sync with a student saved from another device. Updates
       in place so a game in progress keeps working. */
    applyRemote: function (data) {
      const existing = this.get(data.id);
      if (existing) {
        if ((data.updatedAt || 0) <= (existing.updatedAt || 0)) return false;
        Object.keys(existing).forEach(function (k) { delete existing[k]; });
        Object.assign(existing, upgrade(JSON.parse(JSON.stringify(data))));
      } else {
        state.players.push(upgrade(JSON.parse(JSON.stringify(data))));
      }
      persist(); emit();
      return true;
    },
    applyRemoteRemoval: function (id) {
      if (!this.get(id)) return;
      state.players = state.players.filter(function (p) { return p.id !== id; });
      if (state.currentId === id) state.currentId = null;
      persist(); emit();
    },

    recordSession: function (p, s) {
      s.date = new Date().toISOString();
      p.sessions.unshift(s);
      p.sessions = p.sessions.slice(0, 60);
      const t = BD.today();
      if (p.days.indexOf(t) === -1) p.days.push(t);
      p.days = p.days.slice(-400);
      save(p);
    }
  };
})();
