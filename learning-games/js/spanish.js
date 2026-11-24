/* SPANISH DOJO: learn first, then practice (like Duolingo).
   - Course: data/spanish-course.js, units by band (Pre-K to 2nd, 3rd to 5th,
     6th to 8th). A lesson teaches 4 new words: a LEARN card for each (picture,
     Spanish, English, tap to hear, slow replay), then quick exercises that move
     from recognizing to remembering: pick the picture, match pairs, listen and
     choose, fill the blank, build the phrase, type it (3rd grade and up,
     accents forgiven with a gentle note), and a mini review of older words.
   - Mistakes come back at the end of the lesson. No hearts, no penalties.
   - Spaced review per word: strength 1 to 5, next review after 1, 2, 4, 8 or
     16 days. "Review" pulls the words that are due. Practice only ever uses
     words the student has learned.
   - Saved per student as p.esp = { w: { "unit:word": [strength, dueDay] } }.
   - XP goes to the Spanish bonus meter (BD.Rank.practice "spanish") plus +2
     for each right answer (BD.Correct). */
window.BD = window.BD || {};

BD.Spanish = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const r = function (n) { return Math.floor(Math.random() * n); };
  const shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
  const plain = function (s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[¿?¡!.,'"]/g, "").replace(/\s+/g, " ").trim(); };
  const tidy = function (s) { return String(s).toLowerCase().replace(/[¿?¡!.,'"]/g, "").replace(/\s+/g, " ").trim(); };
  const INTERVAL = [0, 1, 2, 4, 8, 16];
  const LESSON_NEW = 4, REVIEW_LEN = 8;
  const BANDS = [["young", "Pre-K to 2nd grade"], ["mid", "3rd to 5th grade"], ["teen", "6th to 8th grade"]];

  /* ---------- course ---------- */
  const UNITS = (BD.SPANISH_COURSE || []).map(function (u) {
    const words = u.words.filter(function (w) { return !(BD.WordSafe && BD.WordSafe.bad(w[1])); }).map(function (w) { return { id: u.id + ":" + w[0], unit: u.id, es: w[0], en: w[1], pic: w[2] || "" }; });
    return { id: u.id, band: u.band, title: u.title, icon: u.icon, words: words, phrases: (u.phrases || []).filter(function (x) { return !(BD.WordSafe && BD.WordSafe.bad(x[1])); }) };
  });
  const WORDS = {}; UNITS.forEach(function (u) { u.words.forEach(function (w) { WORDS[w.id] = w; }); });
  const unitOf = function (id) { return UNITS.find(function (u) { return u.id === id; }); };
  function bandOf(g) { g = Number(g); return g <= 2 ? "young" : g <= 5 ? "mid" : "teen"; }
  function gradeOf(p) { const g = Number(p.spanishGrade !== undefined ? p.spanishGrade : BD.Rank.dojoGrade(p)); return isFinite(g) ? g : 3; }

  /* ---------- days and memory ---------- */
  function dayNum(iso) { const s = iso || BD.today(); return Math.round(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5); }
  function mem(p) { if (!p.esp || typeof p.esp !== "object") p.esp = { w: {} }; if (!p.esp.w) p.esp.w = {}; return p.esp.w; }
  function learned(p) { const m = mem(p); return Object.keys(m).filter(function (id) { return WORDS[id]; }); }
  function due(p) { const m = mem(p), t = dayNum(); return learned(p).filter(function (id) { return m[id][1] <= t; }).sort(function (a, b) { return m[a][1] - m[b][1] || m[a][0] - m[b][0]; }); }
  function learn(p, id) { const m = mem(p); if (!m[id]) m[id] = [1, dayNum() + INTERVAL[1]]; }
  /* A first-try answer about a word: right moves it up (once a day, only when due), wrong brings it back tomorrow. */
  function remember(p, id, ok) {
    const m = mem(p), e = m[id]; if (!e) return;
    const t = dayNum();
    if (ok) { if (e[1] <= t) { e[0] = Math.min(5, e[0] + 1); e[1] = t + INTERVAL[e[0]]; } }
    else { e[0] = Math.max(1, e[0] - 1); e[1] = t + 1; }
  }
  function strength(p, id) { const e = mem(p)[id]; return e ? e[0] : 0; }
  function unitsFor(p) { const b = bandOf(gradeOf(p)); return UNITS.filter(function (u) { return u.band === b; }); }
  function unitDone(p, u) { const m = mem(p); return u.words.filter(function (w) { return m[w.id]; }).length; }
  /* The next unit with words still to learn (in the student's band, then earlier bands, then later ones). */
  function nextUnit(p) {
    const b = bandOf(gradeOf(p)), order = ["young", "mid", "teen"], i = order.indexOf(b);
    const bands = [b].concat(order.slice(0, i).reverse(), order.slice(i + 1));
    for (const bb of bands) { const u = UNITS.find(function (x) { return x.band === bb && unitDone(p, x) < x.words.length; }); if (u) return u; }
    return null;
  }
  function counts(p) { return { learned: learned(p).length, due: due(p).length, mastered: learned(p).filter(function (id) { return mem(p)[id][0] >= 4; }).length }; }

  /* ---------- exercises ---------- */
  function others(w, n, key) {
    const u = unitOf(w.unit), seen = {}; seen[w[key]] = 1;
    const pool = shuffle(u.words).concat(shuffle(UNITS.filter(function (x) { return x.band === u.band && x.id !== u.id; }).reduce(function (a, x) { return a.concat(x.words); }, [])));
    const out = [];
    pool.forEach(function (x) { if (out.length < n && !seen[x[key]] && (key !== "pic" || x.pic)) { seen[x[key]] = 1; out.push(x); } });
    return out;
  }
  const hasPic = function (w) { return !!w.pic; };
  function ex(type, w, extra) { return Object.assign({ type: type, w: w, id: w ? w.id : null, tries: 0 }, extra || {}); }
  function recognize(w) { return hasPic(w) && Math.random() < 0.6 ? ex("pick", w) : ex("es2en", w); }
  function recall(w, g) { return g >= 3 && Math.random() < 0.5 ? ex("type", w) : ex("en2es", w); }
  /* Phrases that use this word (so fill and build only use words being taught). */
  function phraseFor(w) {
    const u = unitOf(w.unit);
    const re = new RegExp("(^|[\\s¿¡,])" + w.es.replace(/[.*+?^${}()|[\]\\¿?¡]/g, "\\$&") + "($|[\\s?!,.])", "i");
    return (u.phrases || []).filter(function (ph) { return re.test(ph[0]); });
  }
  function lessonPlan(p, u) {
    const g = gradeOf(p), m = mem(p);
    let fresh = u.words.filter(function (w) { return !m[w.id]; });
    const take = fresh.length === LESSON_NEW + 1 ? LESSON_NEW + 1 : LESSON_NEW;
    fresh = fresh.slice(0, take);
    if (!fresh.length) return reviewPlan(p, u.words.map(function (w) { return w.id; }));
    const steps = [];
    fresh.forEach(function (w) { steps.push(ex("learn", w)); steps.push(recognize(w)); });
    if (fresh.length >= 3) steps.push({ type: "match", words: shuffle(fresh).slice(0, 4), tries: 0 });
    shuffle(fresh).slice(0, 2).forEach(function (w) { steps.push(recall(w, g)); });
    if (window.speechSynthesis && BD.Speech && BD.Speech.available) steps.push(ex("listen", fresh[r(fresh.length)]));
    // a tiny sentence with a new word: fill the blank, and (3rd grade up) build it from tiles
    const withPh = fresh.filter(function (w) { return phraseFor(w).length; });
    if (withPh.length) { const w = withPh[r(withPh.length)]; steps.push(ex("fill", w, { ph: phraseFor(w)[0] })); }
    const ph2 = u.phrases.filter(function (ph) { return fresh.some(function (w) { return ph[0].indexOf(w.es) !== -1; }); });
    if (ph2.length && (g >= 1 || ph2[0][0].split(" ").length <= 3)) steps.push({ type: "build", ph: ph2[r(ph2.length)], tries: 0 });
    // mini review of older words (due first)
    const old = due(p).concat(shuffle(learned(p))).filter(function (id, i, a) { return a.indexOf(id) === i && fresh.every(function (w) { return w.id !== id; }); }).slice(0, 3);
    old.forEach(function (id) { const w = WORDS[id]; steps.push(strength(p, id) >= 3 ? recall(w, g) : recognize(w)); });
    return { kind: "lesson", unit: u, fresh: fresh, steps: steps };
  }
  function reviewPlan(p, onlyIds) {
    const g = gradeOf(p);
    let ids = due(p);
    if (onlyIds) ids = ids.filter(function (id) { return onlyIds.indexOf(id) !== -1; });
    const rest = shuffle(learned(p)).filter(function (id) { return ids.indexOf(id) === -1 && (!onlyIds || onlyIds.indexOf(id) !== -1); })
      .sort(function (a, b) { return strength(p, a) - strength(p, b); });
    ids = ids.concat(rest).slice(0, REVIEW_LEN);
    if (!ids.length) return null;
    const steps = ids.map(function (id) {
      const w = WORDS[id], s = strength(p, id);
      if (s <= 1) return recognize(w);
      if (s === 2) return Math.random() < 0.5 && window.speechSynthesis ? ex("listen", w) : ex("en2es", w);
      const ph = phraseFor(w);
      if (ph.length && Math.random() < 0.4) return ex("fill", w, { ph: ph[0] });
      return recall(w, g);
    });
    if (ids.length >= 4) steps.splice(2, 0, { type: "match", words: shuffle(ids).slice(0, 4).map(function (id) { return WORDS[id]; }), tries: 0 });
    return { kind: "review", steps: shuffle(steps) };
  }

  /* ---------- audio ---------- */
  function hear(text, slow) { if (BD.Store && BD.Store.muted) return; if (BD.Speech && BD.Speech.available) BD.Speech.say(text, "es-MX", slow ? 0.55 : 0.85); }
  const SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function hearBtns(text) {
    return '<span class="sp-hear"><button type="button" class="btn btn-small sp-say" data-say="' + esc(text) + '" aria-label="Hear it">' + SPK + ' Hear it</button>' +
      '<button type="button" class="btn btn-small btn-quiet sp-say" data-say="' + esc(text) + '" data-slow="1" aria-label="Hear it slowly">Slow</button></span>';
  }
  function picHTML(w, big) {
    if (!w.pic) return "";
    if (w.pic.charAt(0) === "#") return '<span class="sp-swatch' + (big ? " big" : "") + '" style="background:' + w.pic + '"></span>';
    return '<span class="sp-pic' + (big ? " big" : "") + '" aria-hidden="true">' + w.pic + '</span>';
  }

  /* ---------- the screen ---------- */
  let S = null;
  function open() {
    const p = BD.Store.current(); if (!p) return;
    S = null;
    BD.UI.show("screen-spanish-play");
    path();
  }
  function bar(title, pct) {
    $("spTitle").textContent = title;
    $("spBar").style.width = Math.max(0, Math.min(100, pct || 0)) + "%";
    $("spBarWrap").hidden = pct === null;
  }
  function path() {
    const p = BD.Store.current(); if (!p) return;
    S = null; bar("Spanish Dojo", null);
    const c = counts(p), nu = nextUnit(p), myBand = bandOf(gradeOf(p));
    $("spXP").textContent = c.learned + " words";
    const row = function (u) {
      const done = unitDone(p, u), pct = Math.round(100 * done / u.words.length), cur = nu && nu.id === u.id;
      return '<button type="button" class="sp-unit' + (cur ? " current" : "") + (done === u.words.length ? " done" : "") + '" data-unit="' + u.id + '">' +
        '<span class="sp-ring" style="--pct:' + pct + '"><span>' + u.icon + '</span></span>' +
        '<span class="sp-unit-txt"><strong>' + esc(u.title) + '</strong><span class="muted small">' + done + ' of ' + u.words.length + ' words' + (cur ? ' · up next' : done === u.words.length ? ' · tap to review' : '') + '</span></span>' +
        '<span class="sp-chev" aria-hidden="true">›</span></button>';
    };
    const band = function (b) { return UNITS.filter(function (u) { return u.band === b[0]; }); };
    $("spBody").innerHTML =
      '<div class="sp-hero"><img class="sp-coach" src="' + BD.Cast.face("bridgette") + '" alt="">' +
        '<div><p class="eyebrow">Ms. Bridgette</p><p class="sp-hero-say">' + (c.learned ? '¡Hola! You know <strong>' + c.learned + '</strong> Spanish words. ' + (c.due ? '<strong>' + c.due + '</strong> are ready for review.' : 'Nothing due for review today.') : '¡Hola! Let\'s learn your first Spanish words. Listen, look, then practice.') + '</p></div></div>' +
      '<div class="sp-actions">' +
        (nu ? '<button type="button" class="btn btn-primary btn-big" id="spLearn">Learn new words<span class="start-sub">' + esc(nu.title) + '</span></button>' : '<p class="muted">You learned every word in the course. ¡Excelente!</p>') +
        '<button type="button" class="btn ' + (c.due ? "btn-primary" : "btn-quiet") + '" id="spReview"' + (c.learned ? "" : " disabled") + '>' + (c.due ? 'Review ' + c.due + ' due words' : c.learned ? 'Practice words I know' : 'Review opens after your first lesson') + '</button>' +
      '</div>' +
      '<h3 class="label">' + esc(BANDS.find(function (b) { return b[0] === myBand; })[1]) + '</h3><div class="sp-units">' + band([myBand]).map(row).join("") + '</div>' +
      '<details class="sp-more"><summary>Other levels</summary>' + BANDS.filter(function (b) { return b[0] !== myBand; }).map(function (b) { return '<h3 class="label">' + esc(b[1]) + '</h3><div class="sp-units">' + band(b).map(row).join("") + '</div>'; }).join("") + '</details>' +
      '<p class="muted small sp-foot">Words come back for review after 1, 2, 4, 8 and 16 days, so they stick.</p>';
    if ($("spLearn")) $("spLearn").onclick = function () { start(lessonPlan(p, nu)); };
    $("spReview").onclick = function () { const pl = reviewPlan(p); if (pl) start(pl); };
    $("spBody").querySelectorAll("[data-unit]").forEach(function (b) {
      b.onclick = function () { const u = unitOf(b.dataset.unit), pl = unitDone(p, u) < u.words.length ? lessonPlan(p, u) : reviewPlan(p, u.words.map(function (w) { return w.id; })); if (pl) start(pl); };
    });
  }
  function start(plan) {
    const p = BD.Store.current();
    S = { p: p, plan: plan, steps: plan.steps.slice(), i: 0, total: plan.steps.length, right: 0, answers: 0, xp: 0, belt: null, firsts: {}, wrongIds: {}, requeued: 0 };
    BD.Sound.tap();
    step();
  }
  function step() {
    const st = S.steps[S.i];
    if (!st) return finish();
    bar(S.plan.kind === "lesson" ? S.plan.unit.title : "Review", 100 * S.i / S.steps.length);
    $("spXP").textContent = S.xp + " XP";
    S.locked = false;
    const body = $("spBody"), w = st.w;
    let h = "";
    if (st.type === "learn") {
      learn(S.p, w.id); BD.Store.save(S.p);
      h = '<p class="sp-kind">New word</p><div class="sp-learn">' + picHTML(w, true) +
        '<p class="sp-es">' + esc(w.es) + '</p><p class="sp-en">' + esc(w.en) + '</p>' + hearBtns(w.es) +
        '<p class="muted small">Say it out loud two times!</p></div>' +
        '<button type="button" class="btn btn-primary btn-big sp-next" id="spGo">Got it</button>';
      body.innerHTML = h; bindSay();
      setTimeout(function () { hear(w.es); }, 250);
      $("spGo").onclick = function () { BD.Sound.tap(); S.i++; step(); };
      return;
    }
    if (st.type === "match") return renderMatch(st);
    if (st.type === "build") return renderBuild(st);
    if (st.type === "type") return renderType(st);
    // choice exercises
    let prompt = "", choices = [], answer = "", lead = "";
    if (st.type === "pick") {
      prompt = 'Which one is <strong class="sp-es-inline">' + esc(w.es) + '</strong>?'; lead = hearBtns(w.es);
      choices = shuffle([w].concat(others(w, 3, "pic"))).map(function (x) { return { v: x.id, html: picHTML(x) + '<span class="sp-cap">' + esc(x.en) + '</span>' }; }); answer = w.id;
      setTimeout(function () { hear(w.es); }, 250);
    } else if (st.type === "es2en") {
      prompt = 'What does <strong class="sp-es-inline">' + esc(w.es) + '</strong> mean?'; lead = hearBtns(w.es);
      choices = shuffle([w].concat(others(w, 3, "en"))).map(function (x) { return { v: x.en, html: esc(x.en) }; }); answer = w.en;
      setTimeout(function () { hear(w.es); }, 250);
    } else if (st.type === "en2es") {
      prompt = 'How do you say <strong>' + esc(w.en) + '</strong> in Spanish?'; lead = w.pic ? '<div class="sp-mid">' + picHTML(w, true) + '</div>' : "";
      choices = shuffle([w].concat(others(w, 3, "es"))).map(function (x) { return { v: x.es, html: esc(x.es) }; }); answer = w.es;
    } else if (st.type === "listen") {
      prompt = 'Listen. Which word did you hear?'; lead = '<div class="sp-mid"><button type="button" class="btn btn-primary sp-say sp-listen" data-say="' + esc(w.es) + '">' + SPK + ' Play</button> <button type="button" class="btn btn-quiet sp-say" data-say="' + esc(w.es) + '" data-slow="1">Slow</button></div>';
      choices = shuffle([w].concat(others(w, 3, "es"))).map(function (x) { return { v: x.es, html: esc(x.es) }; }); answer = w.es;
      setTimeout(function () { hear(w.es); }, 250);
    } else if (st.type === "fill") {
      const re = new RegExp(w.es.replace(/[.*+?^${}()|[\]\\¿?¡]/g, "\\$&"), "i");
      prompt = 'Fill the blank'; lead = '<p class="sp-sentence">' + esc(st.ph[0]).replace(re, '<span class="sp-blank">____</span>') + '</p><p class="muted">' + esc(st.ph[1]) + '</p>';
      choices = shuffle([w].concat(others(w, 2, "es"))).map(function (x) { return { v: x.es, html: esc(x.es) }; }); answer = w.es;
    }
    st.answer = answer;
    body.innerHTML = '<p class="sp-kind">' + prompt + '</p>' + lead + '<div class="sp-choices' + (st.type === "pick" ? " pics" : "") + '">' +
      choices.map(function (c) { return '<button type="button" class="sp-choice" data-v="' + esc(c.v) + '">' + c.html + '</button>'; }).join("") + '</div><div class="sp-fb" id="spFb" aria-live="polite"></div>';
    bindSay();
    body.querySelectorAll(".sp-choice").forEach(function (b) {
      b.onclick = function () {
        if (S.locked) return;
        const ok = b.dataset.v === answer;
        body.querySelectorAll(".sp-choice").forEach(function (x) { if (x.dataset.v === answer) x.classList.add("is-right"); else if (x === b) x.classList.add("is-wrong"); x.disabled = true; });
        result(st, ok, b, st.type === "pick" ? w.es + " = " + w.en : st.type === "es2en" ? w.es + " = " + w.en : w.en + " = " + w.es);
      };
    });
  }
  function bindSay() {
    $("spBody").querySelectorAll(".sp-say").forEach(function (b) { b.onclick = function () { hear(b.dataset.say, !!b.dataset.slow); }; });
  }
  /* After any exercise: XP and memory on the first try; a miss comes back at the end. */
  function result(st, ok, el, show, note) {
    S.locked = true;
    const p = S.p, first = st.tries === 0;
    st.tries++; S.answers++;
    if (ok) {
      S.right++;
      const raw = first ? 10 : 5;
      const res = BD.Rank.practice(p, "spanish", gradeOf(p), raw); S.belt = res; S.xp += res.earned;
      if (BD.Correct) S.xp += BD.Correct.hit(p, el);
      BD.Sound.right(); if (BD.Kid && BD.Kid.young(gradeOf(p))) BD.Kid.celebrate(el, gradeOf(p));
    } else {
      BD.Sound.wrong();
      if (S.requeued < 6) { S.steps.push(Object.assign({}, st, { tries: st.tries })); S.requeued++; }
    }
    if (st.id && first) { remember(p, st.id, ok); if (!ok) S.wrongIds[st.id] = 1; }
    try { const ws = p.wordStats.spanish = p.wordStats.spanish || {}, g = gradeOf(p); const o = ws[g] || (ws[g] = { r: 0, w: 0 }); if (ok) o.r++; else o.w++; } catch (e) { /* stats never break a lesson */ }
    BD.Store.save(p);
    $("spXP").textContent = S.xp + " XP";
    const fb = $("spFb");
    fb.innerHTML = (ok ? '<p class="win-line">' + ["¡Muy bien!", "¡Excelente!", "¡Perfecto!", "¡Sí! Nice!"][r(4)] + (note ? ' <span class="muted small">' + esc(note) + '</span>' : '') + '</p>'
      : '<p class="lose-line">Almost! <strong>' + esc(show) + '</strong>. It will come back so you can try again.</p>') +
      '<button type="button" class="btn btn-primary btn-big sp-next" id="spGo">Continue</button>';
    fb.className = "sp-fb " + (ok ? "ok" : "no");
    const w = st.w || null; if (w && ok) setTimeout(function () { hear(w.es); }, 150);
    $("spGo").onclick = function () { S.i++; step(); };
    $("spGo").focus();
  }
  function renderMatch(st) {
    const words = st.words, left = shuffle(words.slice()), right = shuffle(words.slice());
    const useP = words.every(hasPic) && Math.random() < 0.5;
    $("spBody").innerHTML = '<p class="sp-kind">Match the pairs</p><div class="sp-match"><div>' +
      left.map(function (w) { return '<button type="button" class="sp-m" data-side="es" data-id="' + w.id + '">' + esc(w.es) + '</button>'; }).join("") + '</div><div>' +
      right.map(function (w) { return '<button type="button" class="sp-m" data-side="en" data-id="' + w.id + '">' + (useP ? picHTML(w) : esc(w.en)) + '</button>'; }).join("") + '</div></div><div class="sp-fb" id="spFb" aria-live="polite"></div>';
    let pick = null, left2 = words.length, miss = 0;
    $("spBody").querySelectorAll(".sp-m").forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains("gone") || S.locked) return;
        if (b.dataset.side === "es") hear(WORDS[b.dataset.id].es);
        if (!pick || pick.dataset.side === b.dataset.side) { if (pick) pick.classList.remove("sel"); pick = b; b.classList.add("sel"); return; }
        if (pick.dataset.id === b.dataset.id) {
          [pick, b].forEach(function (x) { x.classList.remove("sel"); x.classList.add("gone"); x.disabled = true; });
          BD.Sound.tap(); pick = null; left2--;
          if (!left2) result(st, miss <= 1, b, "", miss ? "" : "All pairs!");
        } else {
          miss++; BD.Sound.wrong(); const a = pick; [a, b].forEach(function (x) { x.classList.add("is-wrong"); setTimeout(function () { x.classList.remove("is-wrong", "sel"); }, 450); }); pick = null;
        }
      };
    });
  }
  function renderBuild(st) {
    const words = st.ph[0].split(" ");
    const u = S.plan.unit || unitOf((st.w || {}).unit) || UNITS[0];
    const extra = shuffle(u.words.map(function (w) { return w.es; }).filter(function (x) { return x.indexOf(" ") === -1 && words.indexOf(x) === -1; })).slice(0, words.length > 3 ? 2 : 1);
    const tiles = shuffle(words.concat(extra)).map(function (t, i) { return { t: t, i: i }; });
    const built = [];
    const draw = function () {
      $("spLine").innerHTML = built.length ? built.map(function (b, k) { return '<button type="button" class="sp-tile in" data-k="' + k + '">' + esc(b.t) + '</button>'; }).join("") : '<span class="muted">Tap the words in order</span>';
      $("spTiles").querySelectorAll(".sp-tile").forEach(function (b) { b.disabled = built.some(function (x) { return x.i === Number(b.dataset.i); }); });
      $("spCheck").disabled = !built.length;
    };
    $("spBody").innerHTML = '<p class="sp-kind">Build it in Spanish</p><p class="sp-sentence en">' + esc(st.ph[1]) + '</p>' +
      '<div class="sp-line" id="spLine"></div><div class="sp-tiles" id="spTiles">' + tiles.map(function (t) { return '<button type="button" class="sp-tile" data-i="' + t.i + '">' + esc(t.t) + '</button>'; }).join("") + '</div>' +
      '<button type="button" class="btn btn-primary btn-big" id="spCheck">Check</button><div class="sp-fb" id="spFb" aria-live="polite"></div>';
    $("spTiles").onclick = function (e) { const b = e.target.closest(".sp-tile"); if (!b || b.disabled || S.locked) return; const t = tiles.find(function (x) { return x.i === Number(b.dataset.i); }); built.push(t); BD.Sound.tap(); draw(); };
    $("spLine").onclick = function (e) { const b = e.target.closest(".sp-tile"); if (!b || S.locked) return; built.splice(Number(b.dataset.k), 1); draw(); };
    $("spCheck").onclick = function () {
      if (S.locked || !built.length) return;
      const said = built.map(function (b) { return b.t; }).join(" ");
      const ok = plain(said) === plain(st.ph[0]);
      $("spCheck").hidden = true;
      result(st, ok, $("spLine"), st.ph[0] + " = " + st.ph[1]);
      if (ok) hear(st.ph[0]);
    };
    draw();
  }
  function renderType(st) {
    const w = st.w;
    $("spBody").innerHTML = '<p class="sp-kind">Type <strong>' + esc(w.en) + '</strong> in Spanish</p>' + (w.pic ? '<div class="sp-mid">' + picHTML(w, true) + '</div>' : '') +
      '<form id="spForm" class="sp-type" autocomplete="off"><input id="spIn" class="sp-in" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Your answer in Spanish">' +
      '<button type="submit" class="btn btn-primary">Check</button></form>' +
      '<p class="muted small">Accents like á, é, ñ are nice but not required. <button type="button" class="btn btn-small btn-quiet" id="spPeek">First letter</button></p><div class="sp-fb" id="spFb" aria-live="polite"></div>';
    $("spPeek").onclick = function () { const i = $("spIn"); if (!i.value) i.value = w.es.replace(/^[¿¡]/, "").charAt(0); i.focus(); };
    $("spForm").onsubmit = function (e) {
      e.preventDefault(); if (S.locked) return;
      const v = $("spIn").value; if (!v.trim()) return;
      const exact = tidy(v) === tidy(w.es), close = plain(v) === plain(w.es);
      $("spIn").disabled = true;
      result(st, close, $("spIn"), w.en + " = " + w.es, close && !exact ? "Watch the accents: " + w.es : "");
    };
    setTimeout(function () { try { $("spIn").focus(); } catch (e) { /* ok */ } }, 50);
  }
  function finish() {
    const p = S.p, plan = S.plan, total = S.answers || 1;
    const acc = Math.round(100 * S.right / total);
    BD.Store.recordSession(p, { game: "spanish", mode: plan.kind, grade: gradeOf(p), correct: S.right, total: S.answers, xp: S.xp });
    const fresh = plan.kind === "lesson" ? plan.fresh : [];
    const c = counts(p);
    const done = S; S = null;
    BD.UI.results({
      title: plan.kind === "lesson" ? "¡Lección completa!" : "¡Repaso completo!",
      subtitle: "Spanish Dojo · " + (plan.kind === "lesson" ? plan.unit.title : "Review") + " · " + c.learned + " words learned",
      stats: [["Right", done.right + " / " + done.answers], ["New words", String(fresh.length)], ["Due next", c.due ? c.due + " words" : "none today"], ["XP earned", "+" + done.xp]],
      belt: done.belt,
      lesson: (fresh.length ? '<div class="tip"><h3>New words</h3><ul class="sp-list">' + fresh.map(function (w) { return '<li>' + picHTML(w) + ' <strong>' + esc(w.es) + '</strong> = ' + esc(w.en) + '</li>'; }).join("") + '</ul></div>' : "") +
        '<p class="muted small">These words come back for review tomorrow, then after 2, 4, 8 and 16 days.</p>',
      listTitle: "", list: [],
      again: function () { open(); },
      againLabel: "Back to Spanish Dojo",
      setup: null
    });
    if (acc >= 0) BD.emit("spanishDone", { p: p, kind: plan.kind });
  }

  /* ---------- Daily Training item ---------- */
  /* Uses only learned words. With none learned yet: a mini LEARN card + one question, and the word is learned. */
  function mixedItem(p) {
    let ids = due(p); if (!ids.length) ids = learned(p);
    let w, card = "";
    if (!ids.length) {
      const u = nextUnit(p); if (!u) return null;
      w = u.words.find(function (x) { return !mem(p)[x.id]; }); if (!w) return null;
      learn(p, w.id); BD.Store.save(p);
      card = '<div class="sp-mini">' + picHTML(w) + '<span><span class="sp-kind">New Spanish word</span><strong class="sp-es-inline">' + esc(w.es) + '</strong> = ' + esc(w.en) + '</span></div>';
    } else w = WORDS[ids[r(Math.min(ids.length, 4))]];
    const toEn = !!card || strength(p, w.id) <= 2;
    const ch = toEn ? shuffle([w].concat(others(w, 3, "en"))).map(function (x) { return x.en; }) : shuffle([w].concat(others(w, 3, "es"))).map(function (x) { return x.es; });
    return {
      subject: "spanish", g: gradeOf(p), kind: "choice", label: "Spanish",
      prompt: toEn ? 'What does "' + w.es + '" mean?' : 'How do you say "' + w.en + '" in Spanish?',
      html: card || (w.pic ? '<div class="sp-mid">' + picHTML(w, true) + '</div>' : ""),
      choices: ch, answer: toEn ? w.en : w.es, topic: unitOf(w.unit).title,
      say: toEn ? w.es : w.en,
      onResult: function (ok) { if (!card) remember(p, w.id, ok); }
    };
  }

  /* ---------- parents ---------- */
  function line(p) { const c = counts(p); return c.learned ? "Spanish: " + c.learned + " words learned, " + c.due + " due for review" : ""; }
  if (BD.Settings) BD.Settings.add({
    id: "spanish-words", scope: "student", title: "Spanish Dojo",
    html: function (p) {
      const c = counts(p);
      return '<p class="small">' + (c.learned ? '<strong>' + c.learned + '</strong> words learned · ' + c.mastered + ' strong · ' + c.due + ' due for review today.' : 'No Spanish words yet. Each lesson teaches 4 new words, then practices them.') + '</p>' +
        '<p class="muted small">Words come back for review after 1, 2, 4, 8 and 16 days, so they stick. Try them at home: ask "¿Cómo se dice ...?" (How do you say ...?).</p>';
    },
    bind: function () {}
  });

  function sanitize(p) {
    if (p.esp === undefined) return;
    if (!p.esp || typeof p.esp !== "object" || !p.esp.w || typeof p.esp.w !== "object") { delete p.esp; return; }
    const o = {};
    Object.keys(p.esp.w).forEach(function (id) {
      const e = p.esp.w[id];
      if (WORDS[id] && Array.isArray(e)) o[id] = [Math.max(1, Math.min(5, Math.round(Number(e[0]) || 1))), Math.max(0, Math.min(200000, Math.round(Number(e[1]) || 0)))];
    });
    p.esp = { w: o };
  }

  /* ---------- hook the old entry points ---------- */
  // Every way into Spanish Dojo (game tile, quest, path, belt panel) opens the course.
  if (BD.WordQuiz && BD.WordQuiz.start) {
    const orig = BD.WordQuiz.start;
    BD.WordQuiz.start = function (game) { if (game === "spanish") { open(); return; } return orig.apply(this, arguments); };
    BD.WordQuiz.startClassic = orig;
    // Practice rounds (if ever used) only use learned words.
    const G = BD.WordQuiz.GAMES && BD.WordQuiz.GAMES.spanish;
    if (G) {
      const learnedTopics = function (p, grade) {
        const ids = learned(p); if (!ids.length) return null;
        const byUnit = {};
        ids.forEach(function (id) { const w = WORDS[id]; (byUnit[w.unit] = byUnit[w.unit] || []).push([w.es, w.en, w.pic && w.pic.charAt(0) !== "#" ? w.pic : ""]); });
        return Object.keys(byUnit).map(function (u) { return { topic: unitOf(u).title, g: grade, words: byUnit[u] }; });
      };
      const topicsOrig = G.topics;
      G.topics = function (grade) { const p = BD.Store.current(), t = p && learnedTopics(p, grade); return t && t.length ? t : topicsOrig.call(this, grade); };
    }
  }

  function bind() {
    $("spQuit").addEventListener("click", function () {
      if (S) { S = null; path(); return; } // words already learned stay learned
      BD.UI.back();
    });
  }

  return { open: open, path: path, startPlan: start, lessonPlan: lessonPlan, reviewPlan: reviewPlan, mixedItem: mixedItem, learned: learned, due: due, counts: counts, line: line, learn: learn, remember: remember, strength: strength, sanitize: sanitize, bind: bind, UNITS: UNITS, WORDS: WORDS, bandOf: bandOf, dayNum: dayNum, state: function () { return S; } };
})();
