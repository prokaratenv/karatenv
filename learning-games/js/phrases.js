/* DAILY POWER PHRASE + POWER PHRASE MEMORY
   - Every day, the first time a student taps Start training, Master Young
     shows "Today's Power Phrase": a short, positive phrase to say out loud,
     then "Say it with me!" (call and response, one chunk at a time).
   - Phrases come from Engage's Power Phrase Leadership Training worksheets
     (worksheet number in w), picked for kids and fitted to Engage standards,
     and tagged by age group: n = Engage Ninjas (Pre-K to K), c = Core Kids
     (1st to 5th), t = Pre-Teen/Teens (6th to 8th).
   - Memory: each phrase seen is tracked. The Power Phrase Memory game
     (3 quick items: missing word, put it in order, finish the phrase; memory grows by spacing across days, not by many reps at once) brings
     back phrases that are due, spaced out over days. A phrase is mastered
     (gold star) after it's answered right on 3 different days.
   Saved on the student: p.pp = { d: day, id: today's phrase, shown: day,
     log: [[day, id]], seen: {id: [firstDay, lastDay]}, ok: {id: [days right]},
     xpDay: day } */
window.BD = window.BD || {};

BD.Phrases = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };

  const LIST = [
    // Engage Ninjas (Pre-K to K): short and easy to shout
    { id: "icanwill", t: "I can, I will, that's easy!", g: "nct", th: "Confidence", w: 26 },
    { id: "turnup", t: "Champions don't give up, they turn up.", g: "nct", th: "Perseverance", w: 11 },
    { id: "drills", t: "Drills build skills.", g: "nc", th: "Practice", w: 9 },
    { id: "dreamwork", t: "Teamwork makes the dream work.", g: "nc", th: "Teamwork", w: 35 },
    { id: "showgrow", t: "Respect: show it, grow it.", g: "nc", th: "Respect", w: 54 },
    { id: "kindpower", t: "Kindness is a superpower.", g: "nct", th: "Kindness", w: 59 },
    { id: "lastround", t: "Last round, best round!", g: "nc", th: "Effort", w: 10 },
    { id: "showup", t: "Showing up is going up.", g: "nct", th: "Discipline", w: 4 },
    { id: "eattrain", t: "Eat, train, sleep, repeat.", g: "nc", th: "Health", w: 57 },
    { id: "knockt", t: "Knock the T out of can't!", g: "nc", th: "Confidence", w: 26 },
    { id: "seeit", t: "See it, believe it, achieve it.", g: "nct", th: "Belief", w: 25 },
    { id: "goalget", t: "Be a goal setter and a goal getter.", g: "nc", th: "Goals", w: 30 },
    { id: "twice", t: "Do it twice to make it nice.", g: "nc", th: "Practice", w: 42 },
    { id: "everyclass", t: "Every class makes you better.", g: "nc", th: "Practice", w: 3 },
    { id: "messup", t: "Messing up means I'm going up!", g: "nc", th: "Mistakes", w: 20 },
    { id: "eatbetter", t: "Eat better, feel better.", g: "nc", th: "Health", w: 57 },
    { id: "thankful", t: "Always thankful, forever grateful.", g: "nc", th: "Gratitude", w: 58 },
    { id: "smileteam", t: "Smile team, fun is forever!", g: "n", th: "Attitude", w: 1 },
    { id: "trainmore", t: "Train more, gain more.", g: "nc", th: "Effort", w: 3 },
    // Core Kids (1st to 5th)
    { id: "winlearn", t: "Win some, learn some.", g: "ct", th: "Sportsmanship", w: 19 },
    { id: "nofail", t: "There is no failure: you win or you learn.", g: "ct", th: "Mistakes", w: 19 },
    { id: "staydown", t: "Falling down happens, getting up is a choice.", g: "ct", th: "Perseverance", w: 21 },
    { id: "humble", t: "Train hard, stay humble.", g: "ct", th: "Humility", w: 22 },
    { id: "coachable", t: "When you are coachable, you are unstoppable.", g: "ct", th: "Coachable", w: 23 },
    { id: "learnearn", t: "First learn it, then go earn it.", g: "ct", th: "Coachable", w: 23 },
    { id: "uptome", t: "If it's to be, it's up to me.", g: "ct", th: "Belief", w: 25 },
    { id: "saycan", t: "Say you can and you will.", g: "ct", th: "Confidence", w: 26 },
    { id: "quest", t: "Go on the quest to be your best.", g: "ct", th: "Effort", w: 26 },
    { id: "beltskills", t: "Belts change colors, skills change lives.", g: "ct", th: "Growth", w: 27 },
    { id: "become", t: "It's not the belt you get, it's the person you become.", g: "ct", th: "Character", w: 29 },
    { id: "smallgoals", t: "Small goals add up to big dreams.", g: "ct", th: "Goals", w: 31 },
    { id: "team", t: "T.E.A.M.: Together Everyone Achieves More.", g: "ct", th: "Teamwork", w: 34 },
    { id: "weme", t: "We is always stronger than me.", g: "ct", th: "Teamwork", w: 36 },
    { id: "prevail", t: "We don't fail, we prevail.", g: "ct", th: "Perseverance", w: 36 },
    { id: "basics", t: "Better basics, better scores.", g: "ct", th: "Practice", w: 38 },
    { id: "altitude", t: "Your attitude increases your altitude.", g: "ct", th: "Attitude", w: 18 },
    { id: "higher", t: "The harder you try, the higher you go.", g: "ct", th: "Effort", w: 18 },
    { id: "tensec", t: "You can do anything for 10 more seconds.", g: "ct", th: "Perseverance", w: 17 },
    { id: "hustle", t: "Hustle beats talent when talent doesn't hustle.", g: "ct", th: "Effort", w: 15 },
    { id: "focusgrow", t: "Where the focus goes, the success grows.", g: "ct", th: "Focus", w: 7 },
    { id: "details", t: "Small details add up to big results.", g: "ct", th: "Focus", w: 7 },
    { id: "respectall", t: "Respect yourself, your teachers and your family.", g: "ct", th: "Respect", w: 54 },
    { id: "grateful", t: "Be grateful, not hateful.", g: "ct", th: "Gratitude", w: 58 },
    { id: "oneact", t: "One small act of kindness can change someone's day.", g: "ct", th: "Kindness", w: 59 },
    { id: "yourbest", t: "Don't try to beat the rest, strive to be your best.", g: "ct", th: "Character", w: 59 },
    { id: "standtall", t: "Confidence is standing tall, even when you hit a wall.", g: "ct", th: "Confidence", w: 44 },
    { id: "fearsmall", t: "Every time you face your fears, they get smaller.", g: "ct", th: "Courage", w: 52 },
    { id: "goalswe", t: "Goals we set are goals we get.", g: "ct", th: "Goals", w: 30 },
    // Pre-Teen/Teens (6th to 8th)
    { id: "discdo", t: "Discipline is doing what needs to be done.", g: "t", th: "Discipline", w: 56 },
    { id: "motivation", t: "Motivation gets you going, discipline gets you there.", g: "t", th: "Discipline", w: 55 },
    { id: "smallsum", t: "Success is small efforts, repeated every day.", g: "t", th: "Consistency", w: 42 },
    { id: "persist", t: "Persistent, you get it. Consistent, you keep it.", g: "t", th: "Consistency", w: 43 },
    { id: "become2", t: "You become exactly what you do every day.", g: "t", th: "Habits", w: 46 },
    { id: "watching", t: "Self-respect is doing what's best when no one is watching.", g: "t", th: "Integrity", w: 53 },
    { id: "inspire", t: "Lead by inspiration, not intimidation.", g: "t", th: "Leadership", w: 51 },
    { id: "example", t: "The best leaders lead by example.", g: "ct", th: "Leadership", w: 50 },
    { id: "cantwrong", t: "Practice until you can't get it wrong.", g: "t", th: "Practice", w: 13 },
    { id: "popular", t: "Being respected is greater than being popular.", g: "t", th: "Respect", w: 54 },
    { id: "inch", t: "Inch by inch, it's a cinch. Yard by yard, it's hard.", g: "t", th: "Goals", w: 47 },
    { id: "hardwork", t: "Respect is earned through hard work, not hard words.", g: "t", th: "Respect", w: 53 },
    { id: "belief", t: "Doubt is the root of fear, belief is the root of confidence.", g: "t", th: "Confidence", w: 52 },
    { id: "goodgreat", t: "A good attitude gets you started, a great one keeps you going.", g: "t", th: "Attitude", w: 18 },
    { id: "chooser", t: "You are not born a winner, you are born a chooser.", g: "t", th: "Habits", w: 46 },
    { id: "grow", t: "You grow the most when you give the most.", g: "ct", th: "Effort", w: 15 }
  ];
  const BY = {}; LIST.forEach(function (x) { BY[x.id] = x; });

  /* ---------- helpers ---------- */
  function today() { return BD.today(); }
  function grade(p) { return BD.Rank ? BD.Rank.dojoGrade(p) : Number(p.mathGrade) || 3; }
  function group(p) { const g = grade(p); return g <= 0 ? "n" : g <= 5 ? "c" : "t"; }
  function pool(p) { const gr = group(p); return LIST.filter(function (x) { return x.g.indexOf(gr) !== -1; }); }
  function st(p) {
    if (!p.pp || typeof p.pp !== "object") p.pp = {};
    const s = p.pp; s.seen = s.seen || {}; s.ok = s.ok || {}; s.log = s.log || [];
    return s;
  }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shuffle(a, seed) { a = a.slice(); let s = seed || 1; for (let i = a.length - 1; i > 0; i--) { s = (Math.imul(s, 1103515245) + 12345) >>> 0; const j = s % (i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  const rnd = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  function daysBetween(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); }
  function mastered(p, id) { return (st(p).ok[id] || []).length >= 3; }
  function chunks(text) {
    const parts = text.replace(/[.!]+$/, "").replace(/([,:.])\s+/g, "$1\n").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
    return parts.length > 1 ? parts : [text.replace(/[.!]+$/, "")];
  }

  /* ---------- today's phrase: same all day, all phrases before any repeat ---------- */
  function todays(p) {
    const s = st(p), t = today();
    if (s.d === t && BY[s.id]) return BY[s.id];
    const list = shuffle(pool(p), hash(String(p.id || p.name || "kid")));
    const fresh = list.filter(function (x) { return !s.seen[x.id]; });
    const pick = fresh.length ? fresh[0] : list.slice().sort(function (a, b) { return String((s.seen[a.id] || [])[1] || "").localeCompare(String((s.seen[b.id] || [])[1] || "")); })[0];
    s.d = t; s.id = pick.id;
    s.seen[pick.id] = [(s.seen[pick.id] || [])[0] || t, t];
    if (!s.log.length || s.log[s.log.length - 1][0] !== t) s.log.push([t, pick.id]);
    s.log = s.log.slice(-60);
    BD.Store.save(p);
    return pick;
  }
  function shownToday(p) { return st(p).shown === today(); }

  /* ---------- the card before training ---------- */
  function coachRow(line) {
    return '<div class="pp-coach"><img class="coach-face" src="' + BD.Cast.face("cd") + '" alt=""><div class="coach-say"><span class="coach-name">Master Young</span><p>' + esc(line) + '</p></div></div>';
  }
  function say(text) { try { if (BD.ReadAloud && BD.ReadAloud.can()) BD.ReadAloud.say(text); } catch (e) { /* no speech */ } }
  function open(p, then) {
    p = p || BD.Store.current(); if (!p) return;
    const ph = todays(p);
    const s = st(p); s.shown = today(); BD.Store.save(p);
    const done = function () { $("infoClose").click(); if (then) setTimeout(then, 60); };
    BD.UI.sheet("Today's Power Phrase", '<div class="pp-card">' + coachRow("Say it loud, say it proud!") +
      '<p class="pp-big" id="ppBig">' + esc(ph.t) + '</p>' +
      '<p class="pp-theme">' + esc(ph.th) + '</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="ppSay">Say it with me!</button>' +
      '<button type="button" class="btn btn-quiet" id="ppGo">' + (then ? "Let's train!" : "Done") + '</button></div>' +
      '<button type="button" class="btn btn-small btn-quiet pp-link" id="ppGame">Play Power Phrase Memory</button></div>');
    if (BD.ReadAloud && BD.ReadAloud.auto(grade(p))) say("Today's power phrase. " + ph.t);
    $("ppGo").onclick = function () { BD.Sound.tap(); done(); };
    $("ppGame").onclick = function () { BD.Sound.tap(); game(p); };
    $("ppSay").onclick = function () { BD.Sound.tap(); callResponse(p, ph, then); };
  }
  /* Call and response: Master Young says a chunk, then "Your turn!". */
  function callResponse(p, ph, then) {
    const parts = chunks(ph.t);
    let i = 0;
    const step = function () {
      const shown = parts.map(function (c, k) { return '<span class="pp-chunk' + (k < i ? " said" : k === i ? " now" : "") + '">' + esc(c) + '</span>'; }).join(" ");
      if (i >= parts.length) {
        BD.UI.sheet("Today's Power Phrase", '<div class="pp-card">' + coachRow("Now all together, nice and loud!") +
          '<p class="pp-big">' + esc(ph.t) + '</p><p class="pp-note">Say it again before class, and teach it to someone at home!</p>' +
          '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="ppGo">' + (then ? "Let's train!" : "Done") + '</button>' +
          '<button type="button" class="btn btn-quiet" id="ppGame">Play Power Phrase Memory</button></div></div>');
        BD.Sound.right(); BD.confetti(60); say(ph.t);
        $("ppGo").onclick = function () { BD.Sound.tap(); $("infoClose").click(); if (then) setTimeout(then, 60); };
        $("ppGame").onclick = function () { BD.Sound.tap(); game(p); };
        return;
      }
      BD.UI.sheet("Say it with me!", '<div class="pp-card">' + coachRow(i === 0 ? "I say it, then you say it. Ready?" : "Great! Next part.") +
        '<p class="pp-big pp-chunks">' + shown + '</p><p class="pp-turn" id="ppTurn">Listen…</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="ppNext" disabled>I said it!</button>' +
        '<button type="button" class="btn btn-quiet btn-small" id="ppHear">Hear it again</button></div>' +
        '<p class="pp-step muted small">Part ' + (i + 1) + ' of ' + parts.length + '</p></div>');
      say(parts[i]);
      setTimeout(function () { const b = $("ppNext"), t = $("ppTurn"); if (b) b.disabled = false; if (t) t.textContent = "Your turn! Say: " + parts[i]; }, 900);
      $("ppHear").onclick = function () { say(parts[i]); };
      $("ppNext").onclick = function () { BD.Sound.tap(); i++; step(); };
    };
    step();
  }
  /* Like the Belt Assessment: automated browsers skip it unless a test sets window.__BD_TEST__ = false. */
  function autoOK() { if (window.__BD_TEST__ === true) return false; if (window.__BD_TEST__ === false) return true; return !(navigator && navigator.webdriver); }
  /* Called by Start training: the phrase first, once a day. Returns true when it took over. */
  function beforeTraining(then) {
    const p = BD.Store.current(); if (!p || shownToday(p) || !autoOK()) return false;
    open(p, then);
    return true;
  }

  /* ---------- Power Phrase Memory ---------- */
  const STOP = ["the", "and", "you", "your", "are", "that", "with", "when", "what", "it's", "can't", "don't", "they", "them", "then", "than", "into", "from", "for", "every", "always", "being", "doing", "is", "a", "an", "to", "of", "on", "in", "be", "it", "we", "me", "my", "i", "i'm", "go", "get", "you'll", "not", "one", "who"];
  function words(t) { return t.replace(/[.!:]/g, "").split(/\s+/); }
  function keyWord(ph) {
    const w = words(ph.t).map(function (x) { return x.replace(/,$/, ""); }).filter(function (x) { return x.length >= 4 && STOP.indexOf(x.toLowerCase()) === -1 && /^[A-Za-z']+$/.test(x); });
    return w.length ? w.sort(function (a, b) { return b.length - a.length; })[Math.random() < 0.5 ? 0 : Math.min(1, w.length - 1)] : null;
  }
  function distractWords(ph, ans, n) {
    const bad = words(ph.t).map(function (x) { return x.replace(/,$/, "").toLowerCase(); });
    const all = [];
    LIST.forEach(function (x) { if (x.id === ph.id) return; words(x.t).forEach(function (w) { w = w.replace(/,$/, ""); const lw = w.toLowerCase(); if (w.length >= 4 && /^[A-Za-z]+$/.test(w) && STOP.indexOf(lw) === -1 && bad.indexOf(lw) === -1 && all.indexOf(lw) === -1 && !(BD.WordSafe && BD.WordSafe.unsafe(lw))) all.push(lw); }); });
    return shuffle(all, Math.floor(Math.random() * 1e9)).slice(0, n);
  }
  function pieces(ph) {
    const w = words(ph.t), n = w.length <= 4 ? 2 : w.length <= 7 ? 3 : 4, out = [];
    let at = 0;
    for (let k = 0; k < n; k++) { const take = Math.round((w.length - at) / (n - k)); out.push(w.slice(at, at + take).join(" ").replace(/,$/, "")); at += take; }
    return out.filter(Boolean);
  }
  function firstPart(ph) { const c = chunks(ph.t); if (c.length > 1) return { a: c[0], b: c.slice(1).join(" ") }; const w = words(ph.t), h = Math.ceil(w.length / 2); return { a: w.slice(0, h).join(" "), b: w.slice(h).join(" ") }; }
  /* Which phrases to practice: due ones first (spaced 1, 2, 4, 8 days by how
     many times they've been right), then the most recent. */
  function practiceList(p) {
    const s = st(p), t = today();
    let seen = Object.keys(s.seen).filter(function (id) { return BY[id]; });
    if (!seen.length) { todays(p); seen = Object.keys(s.seen); }
    const gap = function (id) { const n = (s.ok[id] || []).length; return [1, 2, 4, 8, 16][Math.min(4, n)]; };
    const last = function (id) { const ok = s.ok[id] || []; return ok.length ? ok[ok.length - 1] : (s.seen[id] || [])[0]; };
    const due = seen.filter(function (id) { return !last(id) || daysBetween(last(id), t) >= gap(id) || !(s.ok[id] || []).length; });
    const recent = seen.slice().sort(function (a, b) { return String((s.seen[b] || [])[1]).localeCompare(String((s.seen[a] || [])[1])); });
    const order = due.concat(recent.filter(function (id) { return due.indexOf(id) === -1; }));
    const out = [];
    for (let i = 0; out.length < 3; i++) out.push(order[i % order.length]);
    return out.map(function (id) { return BY[id]; });
  }
  function makeItem(ph, kind) {
    if (kind === "missing") {
      const kw = keyWord(ph); if (!kw) return makeItem(ph, "order");
      const opts = shuffle([kw.toLowerCase()].concat(distractWords(ph, kw, 2)), Math.floor(Math.random() * 1e9));
      return { kind: kind, ph: ph, prompt: ph.t.replace(new RegExp("\\b" + kw + "\\b"), "____"), answer: kw.toLowerCase(), opts: opts };
    }
    if (kind === "finish") {
      const fp = firstPart(ph), others = shuffle(LIST.filter(function (x) { return x.id !== ph.id; }), Math.floor(Math.random() * 1e9)).slice(0, 2).map(function (x) { return firstPart(x).b; });
      return { kind: kind, ph: ph, prompt: fp.a + " …", answer: fp.b, opts: shuffle([fp.b].concat(others), Math.floor(Math.random() * 1e9)) };
    }
    const pc = pieces(ph);
    let sh = shuffle(pc, Math.floor(Math.random() * 1e9));
    if (sh.join("|") === pc.join("|")) sh = pc.slice().reverse();
    return { kind: "order", ph: ph, answer: pc, opts: sh };
  }
  let G = null;
  function game(p) {
    p = p || BD.Store.current(); if (!p) return;
    const kinds = shuffle(["missing", "order", "finish"], Math.floor(Math.random() * 1e9));
    G = { p: p, items: practiceList(p).map(function (ph, i) { return makeItem(ph, kinds[i]); }), i: 0, right: 0 };
    showItem();
  }
  function mark(p, id, ok) {
    const s = st(p), t = today();
    s.seen[id] = [(s.seen[id] || [])[0] || t, (s.seen[id] || [])[1] || t];
    if (ok) { const a = s.ok[id] || []; if (a.indexOf(t) === -1) a.push(t); s.ok[id] = a.slice(-10); }
    BD.Store.save(p);
  }
  function showItem() {
    const it = G.items[G.i];
    if (!it) return finish();
    const head = '<p class="pp-step muted small">Phrase ' + (G.i + 1) + ' of ' + G.items.length + ' · ' + (it.kind === "missing" ? "Missing word" : it.kind === "finish" ? "Finish the phrase" : "Put it in order") + '</p>';
    let body = "";
    if (it.kind === "order") {
      it.picked = [];
      body = '<p class="pp-q">Tap the parts in order:</p><p class="pp-built" id="ppBuilt">&nbsp;</p><div class="pp-opts" id="ppOpts">' +
        it.opts.map(function (o, k) { return '<button type="button" class="btn pp-opt" data-k="' + k + '">' + esc(o) + '</button>'; }).join("") + '</div>' +
        '<button type="button" class="btn btn-small btn-quiet" id="ppReset">Start over</button>';
    } else {
      body = '<p class="pp-q">' + (it.kind === "missing" ? "Which word is missing?" : "How does it end?") + '</p><p class="pp-big pp-prompt">' + esc(it.prompt) + '</p><div class="pp-opts">' +
        it.opts.map(function (o, k) { return '<button type="button" class="btn pp-opt" data-k="' + k + '">' + esc(o) + '</button>'; }).join("") + '</div>';
    }
    BD.UI.sheet("Power Phrase Memory", '<div class="pp-card pp-game">' + head + body + '<p class="pp-fb" id="ppFb" aria-live="polite"></p></div>');
    if (BD.ReadAloud && BD.ReadAloud.auto(grade(G.p)) && it.kind !== "order") say(it.prompt.replace("____", "blank").replace(" …", ""));
    const fb = $("ppFb");
    const result = function (ok) {
      mark(G.p, it.ph.id, ok); if (ok) G.right++;
      fb.innerHTML = (ok ? '<strong class="good">Yes!</strong> ' : '<strong>Almost!</strong> It goes: ') + '<span>' + esc(it.ph.t) + '</span>';
      ok ? BD.Sound.right() : BD.Sound.wrong();
      document.querySelectorAll(".pp-opt").forEach(function (b) { b.disabled = true; });
      const nx = document.createElement("button"); nx.type = "button"; nx.className = "btn btn-primary"; nx.id = "ppNextQ"; nx.textContent = G.i + 1 < G.items.length ? "Next" : "Finish";
      nx.onclick = function () { G.i++; showItem(); };
      fb.appendChild(document.createElement("br")); fb.appendChild(nx);
    };
    document.querySelectorAll(".pp-opt").forEach(function (b) {
      b.onclick = function () {
        const o = it.opts[Number(b.dataset.k)];
        if (it.kind !== "order") { b.classList.add(o === it.answer ? "right" : "wrong"); return result(o === it.answer); }
        b.disabled = true; it.picked.push(o); BD.Sound.tap();
        $("ppBuilt").textContent = it.picked.join(" ");
        if (it.picked.length === it.answer.length) result(it.picked.join("|") === it.answer.join("|"));
      };
    });
    if ($("ppReset")) $("ppReset").onclick = function () { showItem(); };
  }
  function finish() {
    const p = G.p, s = st(p), t = today();
    let xp = 0;
    if (s.xpDay !== t && G.right >= 2) { xp = 5; s.xpDay = t; BD.addXP(p, xp); }
    BD.Store.save(p);
    const m = Object.keys(s.ok).filter(function (id) { return mastered(p, id); }).length;
    BD.UI.sheet("Power Phrase Memory", '<div class="pp-card"><div class="chest-prize">🧠</div><h3>' + G.right + ' of ' + G.items.length + ' right!</h3>' +
      (xp ? '<p class="chest-xp">+' + xp + ' XP</p>' : '<p class="muted small">' + (G.right >= 2 ? "You earned today's memory XP already. Great extra practice!" : "Get 2 right to earn +5 XP (once a day).") + '</p>') +
      '<p>' + m + ' Power Phrase' + (m === 1 ? "" : "s") + ' mastered. Say them out loud to lock them in!</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="ppAgain">Play again</button><button type="button" class="btn btn-quiet" id="ppMine">My Power Phrases</button></div></div>');
    if (G.right >= 2) BD.confetti(60);
    $("ppAgain").onclick = function () { game(p); };
    $("ppMine").onclick = function () { collection(p); };
  }

  /* ---------- My Power Phrases ---------- */
  function collection(p) {
    p = p || BD.Store.current(); if (!p) return;
    todays(p);
    const s = st(p), ids = Object.keys(s.seen).filter(function (id) { return BY[id]; }).sort(function (a, b) { return String((s.seen[b] || [])[1]).localeCompare(String((s.seen[a] || [])[1])); });
    const m = ids.filter(function (id) { return mastered(p, id); }).length;
    BD.UI.sheet("My Power Phrases", '<div class="pp-card"><p class="muted small">' + ids.length + ' learned · ' + m + ' mastered ⭐. A phrase is mastered when you get it right on 3 different days.</p><ul class="pp-list">' +
      ids.map(function (id) { const n = Math.min(3, (s.ok[id] || []).length); return '<li class="' + (n >= 3 ? "mastered" : "") + '"><span class="pp-stars" aria-label="' + n + ' of 3">' + "★".repeat(n) + '<i>' + "★".repeat(3 - n) + '</i></span><span>' + esc(BY[id].t) + '</span></li>'; }).join("") +
      '</ul><div class="res-actions"><button type="button" class="btn btn-primary" id="ppPlay">Play Power Phrase Memory</button><button type="button" class="btn btn-quiet" id="ppToday">Today\'s phrase</button></div></div>');
    $("ppPlay").onclick = function () { game(p); };
    $("ppToday").onclick = function () { open(p); };
  }

  /* ---------- home card, parents, weekly email ---------- */
  function homeCard(p) {
    const c = $("ppCard"); if (!c || !p) return;
    const ph = todays(p), s = st(p), m = Object.keys(s.ok).filter(function (id) { return mastered(p, id); }).length;
    c.hidden = false;
    c.innerHTML = '<span class="duel-icon" aria-hidden="true">' + BD.Icon.svg("chat", 28) + '</span><span><strong>Power Phrases</strong><span class="boss-sub">Today: "' + esc(ph.t) + '"</span><span class="boss-sub pp-sub">' + Object.keys(s.seen).length + ' learned · ' + m + ' mastered · tap to play the memory game</span></span>';
  }
  function weekPhrases(p, from, to) {
    const s = st(p);
    return s.log.filter(function (x) { const t = new Date(x[0] + "T12:00:00").getTime(); return t >= from && t < to; }).map(function (x) { return BY[x[1]]; }).filter(Boolean);
  }
  BD.Settings.add({
    id: "phrases", scope: "student", title: "Power Phrases",
    html: function (p) {
      const s = st(p), ph = BY[s.id] || null;
      const now = Date.now(), wk = weekPhrases(p, now - 7 * 864e5, now + 1);
      const m = Object.keys(s.ok).filter(function (id) { return mastered(p, id); }).length;
      return '<p class="small">' + (ph ? 'Today\'s phrase: <strong>"' + esc(ph.t) + '"</strong>' : 'A new Power Phrase appears each day before training.') + '</p>' +
        (wk.length ? '<p class="small">This week: ' + wk.map(function (x) { return '"' + esc(x.t) + '"'; }).join(", ") + '</p>' : '') +
        '<p class="small">' + Object.keys(s.seen).length + ' learned, ' + m + ' mastered.</p>' +
        '<p class="muted small">Talking point: ask ' + esc(p.name) + ' to say today\'s phrase with you and tell you when they could use it.</p>';
    },
    bind: function () { /* read only */ }
  });
  /* One line for the weekly email's wins list (kept under 80 characters). */
  function digestLine(p, from, to) {
    const wk = weekPhrases(p, from, to); if (!wk.length) return null;
    const ph = wk[wk.length - 1];
    return ("Power phrase: " + ph.t).slice(0, 80);
  }

  function sanitize(p) {
    if (p.pp === undefined) return;
    if (!p.pp || typeof p.pp !== "object" || Array.isArray(p.pp)) { delete p.pp; return; }
    const D = /^\d{4}-\d\d-\d\d$/, s = p.pp, o = { seen: {}, ok: {}, log: [] };
    if (D.test(s.d) && BY[s.id]) { o.d = s.d; o.id = s.id; }
    if (D.test(s.shown)) o.shown = s.shown;
    if (D.test(s.xpDay)) o.xpDay = s.xpDay;
    if (s.seen && typeof s.seen === "object") Object.keys(s.seen).forEach(function (id) { const v = s.seen[id]; if (BY[id] && Array.isArray(v) && D.test(v[0]) && D.test(v[1])) o.seen[id] = [v[0], v[1]]; });
    if (s.ok && typeof s.ok === "object") Object.keys(s.ok).forEach(function (id) { const v = s.ok[id]; if (BY[id] && Array.isArray(v)) { const d = v.filter(function (x) { return D.test(x); }).slice(-10); if (d.length) o.ok[id] = d; } });
    if (Array.isArray(s.log)) o.log = s.log.filter(function (x) { return Array.isArray(x) && D.test(x[0]) && BY[x[1]]; }).map(function (x) { return [x[0], x[1]]; }).slice(-60);
    p.pp = o;
  }
  function bind() { const c = $("ppCard"); if (c) c.addEventListener("click", function () { BD.Sound.tap(); collection(); }); }
  BD.on("home", function (p) { homeCard(p); });

  return { LIST: LIST, todays: todays, open: open, beforeTraining: beforeTraining, game: game, collection: collection, chunks: chunks, pieces: pieces, group: group, pool: pool, mastered: mastered, sanitize: sanitize, digestLine: digestLine, bind: bind, homeCard: homeCard, _makeItem: makeItem };
})();
