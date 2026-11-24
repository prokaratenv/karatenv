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
/* High Rank Uniform collar stripe: the belt color, or gold at Black Belt. */
BD.collarColor = function (beltColor) { return String(beltColor).toUpperCase() === BD.BELTS[8].color.toUpperCase() ? "#F2C230" : beltColor; };
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
/* BD.Rank.at: the grade being played right now (a game shows that grade's belt). */
BD.beltOf = function (p) { return BD.Rank ? BD.Rank.belt(p, BD.Rank.at !== null && BD.Rank.at !== undefined ? BD.Rank.at : undefined) : BD.BELTS[0]; };
/* Days in a row with practice, counting today (or up to yesterday if they
   haven't trained yet today, so the streak isn't lost before they play). */
BD.streak = function (p) {
  const days = new Set((p.days || []).concat(p.shielded || [])); // a streak shield fills a missed day
  const key = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const d = new Date();
  const today = days.has(key(d));
  if (!today) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(key(d))) { n++; d.setDate(d.getDate() - 1); }
  return { days: n, today: today };
};
/* Every point a student earns goes through here, so the weekly leaderboard can count it. */
/* A tiny event bus so features can hook in without editing each other:
   "screen" (id), "home" (p), "playerAdded" (p), "results" ({p, o}), "parentRendered" (rootEl). */
BD._ev = BD._ev || {};
BD.on = function (name, fn) { (BD._ev[name] = BD._ev[name] || []).push(fn); };
BD.emit = function (name, data) { (BD._ev[name] || []).forEach(function (fn) { try { fn(data); } catch (e) { if (window.console) console.error(e); } }); };
BD.addXP = function (p, n) {
  n = Math.max(0, Math.round((Number(n) || 0) * 2) / 2); if (!n) return 0; // half points allowed (flashcard bonus is 2.5)
  p.xp = (p.xp || 0) + n;
  const log = p.xpLog = p.xpLog && typeof p.xpLog === "object" ? p.xpLog : {}, t = BD.today();
  log[t] = (log[t] || 0) + n;
  Object.keys(log).sort().slice(0, -60).forEach(function (k) { delete log[k]; });
  return n;
};
/* Points earned since a time (ms), from the daily log. */
BD.xpSince = function (p, from) {
  const log = p.xpLog || {};
  return Object.keys(log).reduce(function (a, k) { const d = new Date(k + "T00:00:00").getTime(); return d >= from ? a + (log[k] || 0) : a; }, 0);
};
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
    sanitize(p);
    const has = function (v) { return v !== undefined && v !== null && v !== ""; };
    const base = has(p.sentenceGrade) ? p.sentenceGrade : has(p.mathGrade) ? p.mathGrade : 3;
    ["readingGrade", "spanishGrade", "spellingGrade"].forEach(function (k) { if (!has(p[k])) p[k] = base; });
    return p;
  }
  /* Check every field that ends up on screen, so a doctored save code or
     synced record can't inject anything into the page. */
  function sanitize(p) {
    const FIGHTER_KEYS = ["kimmy", "billy", "tommy", "mackenzie", "rylan", "zumi", "cd", "michele", "bridgette", "kyra", "lauryn", "custom"];
    const GEAR_KEYS = ["mouthguard", "shorts", "shirt", "sparring", "boots", "headgear", "chest", "boxing", "mma", "bag", "nunchucks", "kamas", "bo", "sword"];
    const gradeOk = function (g, dflt) { g = Number(g); return isFinite(g) ? Math.max(-1, Math.min(8, Math.round(g))) : dflt; };
    if (typeof p.id !== "string" || !/^[a-z0-9]{4,40}$/i.test(p.id)) p.id = "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    p.name = String(p.name == null ? "" : p.name).replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, 20) || "Champion";
    if (typeof p.color !== "string" || !/^#[0-9a-f]{6}$/i.test(p.color)) p.color = BD.AVATAR_COLORS[0];
    if (p.avatar !== undefined && FIGHTER_KEYS.indexOf(p.avatar) === -1 && !/^s(0[1-9]|[12][0-9]|30)$/.test(p.avatar)) delete p.avatar; // sNN = Champion Studio
    if (p.custom !== undefined && (typeof p.custom !== "object" || p.custom === null)) delete p.custom;
    ["mathGrade", "sentenceGrade", "readingGrade", "spanishGrade", "spellingGrade"].forEach(function (k) { if (p[k] !== undefined) p[k] = gradeOk(p[k], 3); });
    if (p.dojoGrade !== undefined && p.dojoGrade !== null) p.dojoGrade = gradeOk(p.dojoGrade, 3);
    p.xp = Math.max(0, Number(p.xp) || 0);
    p.gear = Array.isArray(p.gear) ? p.gear.filter(function (g) { return GEAR_KEYS.indexOf(g) !== -1; }) : [];
    p.gearHidden = Array.isArray(p.gearHidden) ? p.gearHidden.filter(function (g) { return GEAR_KEYS.indexOf(g) !== -1; }) : [];
    if (p.badges && typeof p.badges === "object") Object.keys(p.badges).forEach(function (k) { if (!/^[a-z0-9-]{2,30}$/.test(k) || typeof p.badges[k] !== "string") delete p.badges[k]; });
    p.dojoOptIn = !!p.dojoOptIn;
    if (p.flash && typeof p.flash === "object" && /^\d{4}-\d\d-\d\d$/.test(p.flash.day)) p.flash = { day: p.flash.day, ops: (Array.isArray(p.flash.ops) ? p.flash.ops : []).filter(function (o, i, a) { return ["add", "sub", "mul", "div"].indexOf(o) !== -1 && a.indexOf(o) === i; }) }; else delete p.flash;
    if (p.flashSpell && typeof p.flashSpell === "object" && /^\d{4}-\d\d-\d\d$/.test(p.flashSpell.day)) p.flashSpell = { day: p.flashSpell.day, styles: (Array.isArray(p.flashSpell.styles) ? p.flashSpell.styles : []).filter(function (o, i, a) { return ["missing", "pick", "scramble", "fix", "check"].indexOf(o) !== -1 && a.indexOf(o) === i; }) }; else delete p.flashSpell;
    if (p.support && typeof p.support === "object" && /^\d{4}-\d\d-\d\d$/.test(p.support.wk)) p.support = { wk: p.support.wk, days: (Array.isArray(p.support.days) ? p.support.days : []).filter(function (d, i, a) { return /^\d{4}-\d\d-\d\d$/.test(d) && a.indexOf(d) === i; }).slice(0, 7), paid: Math.max(0, Math.min(2, Math.round(Number(p.support.paid) || 0))) }; else delete p.support;
    if (p.cheerSeen && typeof p.cheerSeen === "object" && /^\d{4}-\d\d-\d\d$/.test(p.cheerSeen.wk)) p.cheerSeen = { wk: p.cheerSeen.wk, n: Math.max(0, Math.min(1e6, Math.round(Number(p.cheerSeen.n) || 0))) }; else delete p.cheerSeen;
    if (p.xpLog && typeof p.xpLog === "object") { const xl = {}; Object.keys(p.xpLog).forEach(function (k) { if (/^\d{4}-\d\d-\d\d$/.test(k)) xl[k] = Math.max(0, Math.min(10000, Math.round((Number(p.xpLog[k]) || 0) * 2) / 2)); }); p.xpLog = xl; } else delete p.xpLog;
    if (["gi", "training", "sparring", "boxing", "mma", "highrank", "leadership", "athlete", "bbc"].indexOf(p.outfit) === -1) p.outfit = "gi";
    if (p.nick !== undefined && (typeof p.nick !== "string" || !(BD.Dojo ? BD.Dojo.nickOk(p.nick, p.name) : /^[A-Za-z]+ [A-Za-z]+ [1-9][0-9]?$/.test(p.nick)))) delete p.nick;
    if (BD.School) BD.School.sanitize(p); else if (p.school && typeof p.school !== "object") delete p.school;
    if (BD.Quest) BD.Quest.sanitize(p);
    if (BD.Breaks) BD.Breaks.sanitize(p);
    if (BD.Placement) BD.Placement.sanitize(p);
    if (BD.Correct) BD.Correct.sanitize(p);
    if (BD.Rank && BD.Rank.sanitize) BD.Rank.sanitize(p);
    if (BD.Goals && BD.Goals.sanitize) BD.Goals.sanitize(p);
    if (BD.Phrases && BD.Phrases.sanitize) BD.Phrases.sanitize(p);
    if (BD.StoryGen && BD.StoryGen.sanitize) BD.StoryGen.sanitize(p);
    if (BD.Phonics && BD.Phonics.sanitize) BD.Phonics.sanitize(p);
    if (BD.SentenceGen && BD.SentenceGen.sanitize) BD.SentenceGen.sanitize(p);
    if (BD.Kid) BD.Kid.sanitize(p); else if (p.stickers !== undefined && (typeof p.stickers !== "object" || p.stickers === null)) delete p.stickers;
    if (BD.Teams) BD.Teams.sanitize(p); else { if (p.teams !== undefined && (typeof p.teams !== "object" || p.teams === null)) delete p.teams; if (p.teamLog !== undefined && (typeof p.teamLog !== "object" || p.teamLog === null)) delete p.teamLog; }
    if (BD.Tourney) BD.Tourney.sanitize(p); else if (p.medals !== undefined && !Array.isArray(p.medals)) delete p.medals;
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
    if (p) { p.updatedAt = Date.now(); if (BD.Sync) BD.Sync.queue(p); if (BD.Family) BD.Family.queue(p); }
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
      if (BD.Family) BD.Family.remove(id);
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
      if (BD.Kid) BD.Kid.earn(p, s); // a sticker for the Sticker Book
      save(p);
    }
  };
})();
