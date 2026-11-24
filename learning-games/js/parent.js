/* PARENT CORNER — a short, plain-language dashboard for each child, a
   parent PIN so kids can't reset or remove progress, and a weekly progress
   card to share with family or Engage instructors. */
window.BD = window.BD || {};

BD.Parent = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const DAY = 864e5;

  /* ---------- weeks ---------- */
  function weekStart(d) {
    const x = new Date(d || Date.now()); x.setHours(0, 0, 0, 0);
    const dow = (x.getDay() + 6) % 7; // Monday = 0
    x.setDate(x.getDate() - dow);
    return x.getTime();
  }
  const SUBJECT_NAMES = { math: "Math", reading: "Reading", spelling: "Spelling", comprehension: "Comprehension", spanish: "Spanish" };
  function weekStats(p, from, to) {
    const inRange = function (iso) { const t = new Date(iso).getTime(); return t >= from && t < to; };
    const rounds = (p.sessions || []).filter(function (s) { return s.date && inRange(s.date) && String(s.game).indexOf("test-") !== 0; });
    const tests = (p.sessions || []).filter(function (s) { return s.date && inRange(s.date) && String(s.game).indexOf("test-") === 0; });
    const days = new Set((p.sessions || []).filter(function (s) { return s.date && inRange(s.date); }).map(function (s) { return s.date.slice(0, 10); }));
    const answers = rounds.reduce(function (a, s) { return a + (s.total || 0); }, 0);
    const correct = rounds.reduce(function (a, s) { return a + Math.min(s.correct || 0, s.total || 0); }, 0);
    const stripes = (p.stripeLog || []).filter(function (x) { return inRange(x.date); });
    const belts = [];
    Object.keys(p.rank || {}).forEach(function (g) { (p.rank[g].grads || []).forEach(function (x) { if (inRange(x.date)) belts.push({ grade: Number(g), to: BD.BELTS[Math.min(BD.BELTS.length - 1, x.belt + 1)] }); }); });
    const badges = BD.Badges.BADGES.filter(function (b) { return p.badges && p.badges[b.id] && inRange(p.badges[b.id]); });
    const games = {};
    rounds.forEach(function (s) { games[s.game] = (games[s.game] || 0) + 1; });
    return { days: days.size, rounds: rounds.length, tests: tests.length, answers: answers, correct: correct, stripes: stripes, belts: belts, badges: badges, games: games };
  }

  /* ---------- strengths and next steps ---------- */
  const TIPS = {
    "math-add": "Play \"make 10\" with snacks or coins: how many more to make 10?",
    "math-sub": "Count back out loud on the way to school: start at 30 and take away 3 each time.",
    "math-mul": "Quiz one times table at dinner, like the 7s, until it's quick. Skip-counting out loud helps.",
    "math-div": "Turn a multiplication fact around: if 6 × 7 = 42, then 42 ÷ 7 = 6.",
    "sent-cap": "When reading together, point out capital letters at the start of sentences and in names.",
    "sent-punct": "Read a sentence aloud with feeling, then ask: question, excitement or telling? That picks the end mark.",
    "sent-spell": "Have them read their writing back slowly, one word at a time, to catch spelling slips.",
    "sent-grammar": "Say sentences out loud: \"he run\" or \"he runs\"? Hearing it makes grammar click.",
    "read-main": "After a story or show, ask: \"What was it mostly about, in one sentence?\"",
    "read-detail": "Ask who, what, where and when questions about a book you read together.",
    "read-infer": "Ask \"How do you think they felt? What clue tells you?\" while reading.",
    "read-vocab": "When you hit a new word, guess its meaning from the sentence before looking it up.",
    "spelling": "Have them spell three tricky words out loud in the car, then write them once at home.",
    "spanish": "Name things around the house in Spanish: la mesa, la puerta, el perro."
  };
  function skills(p) {
    const out = [], rate = BD.Coach.rate;
    const add = function (key, label, arr) { if (arr && arr.length >= 8) out.push({ key: key, label: label, r: rate(arr), n: arr.length }); };
    const mg = p.mathGrade, sg = p.sentenceGrade, rg = p.readingGrade;
    [["add", "addition"], ["sub", "subtraction"], ["mul", "multiplication facts"], ["div", "division"]].forEach(function (o) { add("math-" + o[0], o[1], (p.recent || {})[mg + "-" + o[0]]); });
    [["cap", "capital letters"], ["punct", "punctuation"], ["spell", "spelling in sentences"], ["grammar", "grammar"]].forEach(function (o) { add("sent-" + o[0], o[1], ((p.typeRecent || {})[sg] || {})[o[0]]); });
    const RT = BD.READ_TYPES || {};
    Object.keys(RT).forEach(function (t) {
      const k = /main/.test(t) ? "read-main" : /infer|between/.test(t) ? "read-infer" : /vocab|word/.test(t) ? "read-vocab" : "read-detail";
      add(k, "reading: " + RT[t].label.toLowerCase(), ((p.readRecent || {})[rg] || {})[t]);
    });
    ["spelling", "spanish"].forEach(function (gm) {
      const s = ((p.wordStats || {})[gm] || {})[p[gm + "Grade"]];
      if (s && s.r + s.w >= 8) out.push({ key: gm, label: gm === "spelling" ? "spelling" : "Spanish words", r: s.r / (s.r + s.w), n: s.r + s.w });
    });
    return out;
  }
  function insight(p) {
    const list = skills(p);
    if (!list.length) return null;
    const sorted = list.slice().sort(function (a, b) { return b.r - a.r; });
    const strong = sorted[0].r >= 0.8 ? sorted[0] : null;
    const weak = sorted.slice().reverse().find(function (x) { return x.r < 0.8 && x !== strong; }) || null;
    return { strong: strong, weak: weak, tip: weak ? TIPS[weak.key] : strong ? "Keep the streak going: a short round every day beats one long one." : null };
  }

  /* ---------- the summary card ---------- */
  function list(arr) { return arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1]; }
  function weekLine(w) {
    if (!w.rounds && !w.tests) return "No training yet.";
    const bits = [w.days + (w.days === 1 ? " day" : " days"), w.rounds + (w.rounds === 1 ? " round" : " rounds")];
    if (w.answers) bits.push(w.answers + " questions (" + Math.round(100 * w.correct / Math.max(1, w.answers)) + "% right)");
    const wins = w.stripes.map(function (x) { return x.subject === "degree" ? BD.Rank.DEG_NAMES[Math.min(5, x.deg || 1)] : SUBJECT_NAMES[x.subject] + " stripe"; }).concat(w.belts.map(function (b) { return b.to.name + " Belt"; }));
    return bits.join(" · ") + (wins.length ? ". Earned: " + list(wins) + "." : ".");
  }
  function card(p) {
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), belt = BD.BELTS[r.belt], next = BD.BELTS[r.belt + 1];
    const now = Date.now(), ws = weekStart(now);
    const tw = weekStats(p, ws, now + DAY), lw = weekStats(p, ws - 7 * DAY, ws);
    const st = BD.streak(p), ins = insight(p), sc = BD.Rank.stripeCount(r);
    const left = 4 - sc;
    const monday = new Date().getDay() === 1 || new Date().getDay() === 2;
    const recap = '<div class="pd-row' + (monday ? " pd-recap" : "") + '"><span class="pd-k">' + (monday ? "📬 Last week" : "Last week") + '</span><span>' + esc(weekLine(lw)) + '</span></div>';
    return '<div class="pd">' +
      (monday ? recap : "") +
      '<div class="pd-row"><span class="pd-k">This week</span><span>' + esc(weekLine(tw)) + (st.days ? ' <strong class="pd-streak">🔥 ' + st.days + '-day streak</strong>' : "") + '</span></div>' +
      '<div class="pd-row"><span class="pd-k">Belt</span><span><span class="belt-swatch" style="--belt:' + belt.color + '"></span> ' + BD.gradeLabel(g) + ' · <strong>' + esc(BD.Rank.title(r)) + '</strong> · ' +
        (r.belt >= 8 ? (function () { const d = BD.Rank.degInfo(r); return d.master ? "Master Rank!" : d.stripes + " of 4 degree stripes toward the " + d.nextName; })() : sc + ' of 4 stripes · ' + left + " more to " + next.name) +
        ' · <span class="muted">today: ' + BD.Rank.power(p, g).used + ' of ' + BD.Rank.power(p, g).full + ' full-power Belt XP</span></span></div>' +
      (ins ? '<div class="pd-row"><span class="pd-k">How it\'s going</span><span>' +
        (ins.strong ? 'Strong at <strong>' + esc(ins.strong.label) + '</strong> (' + Math.round(ins.strong.r * 100) + '%). ' : '') +
        (ins.weak ? 'Work on <strong>' + esc(ins.weak.label) + '</strong> (' + Math.round(ins.weak.r * 100) + '%).' : 'No weak spots right now.') + '</span></div>' : '') +
      (ins && ins.tip ? '<div class="pd-row pd-tip"><span class="pd-k">Try at home</span><span>' + esc(ins.tip) + '</span></div>' : '') +
      (BD.Phonics && BD.Phonics.parentLine(p) ? '<div class="pd-row"><span class="pd-k">Spelling focus</span><span>' + esc(BD.Phonics.parentLine(p)) + '</span></div>' : '') +
      (!monday ? recap : "") +
      '<div class="pd-row"><span class="pd-k">Badges</span><span>' + BD.Badges.earned(p).length + ' of ' + BD.Badges.BADGES.length + ' earned' + (BD.Badges.earned(p).length ? ' · newest: ' + esc(BD.Badges.gearName(BD.Badges.earned(p).slice(-1)[0])) : '') + '</span></div>' +
      '</div>';
  }

  /* ---------- weekly share card (image) ---------- */
  async function shareImage(p) {
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { /* ignore */ }
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d");
    const g = BD.Rank.dojoGrade(p), r = BD.Rank.rec(p, g), belt = BD.BELTS[r.belt];
    const now = Date.now(), ws = weekStart(now), tw = weekStats(p, ws, now + DAY), st = BD.streak(p), ins = insight(p);
    const D = '"Montserrat", "Arial Black", sans-serif', B = '"Cabin", "Trebuchet MS", sans-serif';
    const bg = x.createRadialGradient(W / 2, -80, 80, W / 2, H / 2, 1000);
    bg.addColorStop(0, "#2A4C7E"); bg.addColorStop(0.6, "#12223F"); bg.addColorStop(1, "#070D1C");
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    x.strokeStyle = "#E0BA77"; x.lineWidth = 10; x.strokeRect(28, 28, W - 56, H - 56);
    const load = function (src) { return new Promise(function (res) { const im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = src; }); };
    const champ = await BD.Certificate.champion(p, belt.color);
    const logo = await load("img/engage-logo.webp");
    x.textAlign = "center";
    if (logo) { const s = Math.min(110 / logo.width, 104 / logo.height); x.drawImage(logo, W / 2 - logo.width * s / 2, 60, logo.width * s, logo.height * s); }
    x.fillStyle = "#F4F4F4"; x.font = "italic 900 64px " + D; x.fillText("BRAIN DOJO", W / 2, 236);
    x.fillStyle = "#E0BA77"; x.font = "800 26px " + D;
    const range = new Date(ws).toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " – " + new Date(ws + 6 * DAY).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    x.fillText("WEEKLY PROGRESS · " + range.toUpperCase(), W / 2, 282);
    if (champ) { const w = champ.naturalWidth || champ.width, h = champ.naturalHeight || champ.height, s = Math.min(330 / w, 560 / h); x.drawImage(champ, 210 - w * s / 2, 900 - h * s, w * s, h * s); }
    x.textAlign = "left";
    let y = 380;
    x.fillStyle = "#F4F4F4"; x.font = "italic 900 74px " + D;
    let fs = 74; while (x.measureText(p.name).width > 600 && fs > 36) { fs -= 4; x.font = "italic 900 " + fs + "px " + D; }
    x.fillText(p.name, 400, y);
    y += 58; x.fillStyle = belt.color === "#17171C" ? "#E0BA77" : belt.color; x.font = "900 40px " + D; x.fillText(belt.name.toUpperCase() + " BELT", 400, y);
    y += 44; x.fillStyle = "#A3B4CE"; x.font = "700 30px " + B; x.fillText(BD.gradeLabel(g) + " · " + BD.Rank.stripeCount(r) + " of 4 stripes", 400, y);
    const stat = function (label, val, yy) {
      x.fillStyle = "#E0BA77"; x.font = "900 58px " + D; x.fillText(String(val), 400, yy);
      const w = x.measureText(String(val)).width;
      x.fillStyle = "#F4F4F4"; x.font = "700 32px " + B; x.fillText(label, 400 + w + 16, yy);
    };
    y += 96; stat(tw.days === 1 ? "day trained" : "days trained", tw.days, y);
    y += 82; stat(tw.rounds === 1 ? "round" : "rounds", tw.rounds, y);
    y += 82; stat("questions", tw.answers, y);
    if (st.days) { y += 82; stat("day streak 🔥", st.days, y); }
    x.textAlign = "center";
    y = 990;
    const wins = tw.stripes.map(function (s) { return s.subject === "degree" ? BD.Rank.DEG_NAMES[Math.min(5, s.deg || 1)] : SUBJECT_NAMES[s.subject] + " stripe"; }).concat(tw.belts.map(function (b) { return b.to.name + " Belt"; })).concat(tw.badges.map(function (b) { return BD.Badges.gearName(b); }));
    const wrap = function (text, yy, font, color, max) {
      x.font = font; x.fillStyle = color;
      const words = text.split(" "); let line = "";
      words.forEach(function (w) { const t = line ? line + " " + w : w; if (x.measureText(t).width > max) { x.fillText(line, W / 2, yy); yy += 46; line = w; } else line = t; });
      if (line) { x.fillText(line, W / 2, yy); yy += 46; }
      return yy;
    };
    if (wins.length) y = wrap("🏅 Earned this week: " + list(wins), y, "800 34px " + B, "#F6DDA8", 900) + 14;
    if (ins && ins.strong) y = wrap("Strong at " + ins.strong.label + ".", y, "700 32px " + B, "#F4F4F4", 900);
    if (ins && ins.weak) y = wrap("Working on " + ins.weak.label + ".", y, "700 32px " + B, "#A3B4CE", 900);
    x.fillStyle = "#7F92B0"; x.font = "700 26px " + B; x.fillText("Brain Dojo by Engage Lifestyle Martial Arts", W / 2, H - 70);
    return new Promise(function (res, rej) { c.toBlob(function (b) { b ? res(b) : rej(new Error("no image")); }, "image/jpeg", 0.9); });
  }
  async function share(p) {
    BD.UI.sheet("Share " + p.name + "'s week", '<p class="muted">Making the progress card…</p>');
    let blob;
    try { blob = await shareImage(p); } catch (e) { BD.UI.sheet("Share " + p.name + "'s week", "<p>Sorry, the card couldn't be made on this device.</p>"); return; }
    BD.Certificate.offer(blob, "brain-dojo-" + p.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + "-week-" + BD.today() + ".jpg",
      "Share " + p.name + "'s week", p.name + "'s Brain Dojo week", p.name + " trained in Brain Dojo by Engage this week!",
      "Send it to family, or text it to your Engage instructor so they can cheer them on in class.");
  }

  /* ---------- parent PIN ---------- */
  const PIN_KEY = "brainDojo.parentPin";
  let unlockedUntil = 0;
  const hash = function (s) { let h = 5381; s = "bd-pin:" + s; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); };
  const getPin = function () { try { return localStorage.getItem(PIN_KEY); } catch (e) { return null; } };
  const setPin = function (v) { try { localStorage.setItem(PIN_KEY, hash(v)); } catch (e) { /* storage blocked */ } };
  function pinForm(title, intro, onDone, extra) {
    BD.UI.sheet(title, '<p>' + intro + '</p>' +
      '<div class="pin-row"><label class="sr-only" for="pinIn">PIN</label><input id="pinIn" class="pin-input" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="••••">' +
      '<button type="button" class="btn btn-primary" id="pinGo">OK</button></div><p class="pin-msg" id="pinMsg" aria-live="polite"></p>' + (extra || ""));
    const go = function () { onDone($("pinIn").value.replace(/\D/g, "")); };
    $("pinGo").onclick = go;
    $("pinIn").onkeydown = function (e) { if (e.key === "Enter") go(); };
    setTimeout(function () { $("pinIn").focus(); }, 60);
  }
  function createPin(then) {
    pinForm("Set a parent PIN", "Choose a 4-digit PIN for the Parent corner. It keeps kids from resetting or removing progress.", function (a) {
      if (a.length !== 4) { $("pinMsg").textContent = "Use 4 digits."; return; }
      pinForm("Set a parent PIN", "Type the same 4 digits again to confirm.", function (b) {
        if (b !== a) { $("pinMsg").textContent = "Those didn't match. Start again."; setTimeout(function () { createPin(then); }, 900); return; }
        setPin(a); unlockedUntil = Date.now() + 15 * 60e3; $("infoClose").click(); then();
      });
    });
  }
  function forgot(then) {
    const a = 13 + Math.floor(Math.random() * 12), b = 13 + Math.floor(Math.random() * 12);
    pinForm("Reset the parent PIN", "Grown-up check: what is <strong>" + a + " × " + b + "</strong>?", function (v) {
      if (Number(v) === a * b) createPin(then); else $("pinMsg").textContent = "Not quite. Try again.";
    });
    $("pinIn").maxLength = 4;
  }
  /* Run fn once the parent is in (PIN asked at most every 15 minutes). */
  function gate(fn) {
    if (Date.now() < unlockedUntil) return fn();
    if (!getPin()) return createPin(fn);
    pinForm("Parent corner", "Enter your parent PIN.", function (v) {
      if (hash(v) === getPin()) { unlockedUntil = Date.now() + 15 * 60e3; $("infoClose").click(); fn(); }
      else { $("pinMsg").textContent = "That PIN isn't right."; $("pinIn").value = ""; }
    }, '<button type="button" class="btn btn-quiet btn-small" id="pinForgot">Forgot PIN?</button>');
    $("pinForgot").onclick = function () { forgot(fn); };
  }
  function lock() { unlockedUntil = 0; }

  return { card: card, weekStats: weekStats, weekStart: weekStart, insight: insight, share: share, shareImage: shareImage, gate: gate, lock: lock };
})();
