/* SCHOOL WORDS — parents type (or photograph) this week's spelling list
   from school. The words become Spelling Bee practice (every challenge
   style, quiet mode included) and a word test. Parents see which words
   are mastered. Nothing about the child leaves the device. */
window.BD = window.BD || {};

BD.School = (function () {
  const MAX = 25, ROUND = 10;
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };

  /* ---------- cleaning (a typed list, a photo or a save code can't inject anything) ---------- */
  function cleanWord(w) {
    w = String(w == null ? "" : w).trim().replace(/[‘’]/g, "'").replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
    return /^[A-Za-z][A-Za-z'-]{0,19}$/.test(w) ? w : null;
  }
  function parse(text) {
    const out = [];
    String(text || "").split(/[\s,;/|]+/).forEach(function (raw) {
      if (/[<>=(){}[\]\\&#@$%^*+~`"]/.test(raw)) return; // not a spelling word
      const w = cleanWord(raw.replace(/^\d+[.)]?/, ""));
      if (w && w.length >= 2 && out.length < MAX && !out.some(function (x) { return x.toLowerCase() === w.toLowerCase(); })) out.push(w);
    });
    return out;
  }
  const wordRe = function (w) { return new RegExp("\\b" + w.replace(/[-']/g, "\\$&") + "\\b", "i"); };
  /* A kid-friendly sentence with the word blanked out ("___"). */
  function cleanSentence(s, word) {
    s = String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f<>{}[\]\\`]/g, " ").replace(/\s+/g, " ").trim();
    if (s.length < 8 || s.length > 140) return null;
    if (s.indexOf("___") !== -1) return s.split("___").length === 2 ? s : null;
    const m = s.match(wordRe(word));
    return m ? s.slice(0, m.index) + "___" + s.slice(m.index + m[0].length) : null;
  }
  const GENERIC = ["Can you spell the word ___?", "Our spelling word is ___.", "Write the word ___ in your best letters.", "Today we practice the word ___.", "Spell ___ like a champion!"];
  function bankSentence(word) {
    let hit = null;
    Object.keys(BD.SPELLING || {}).some(function (g) { hit = BD.SPELLING[g].find(function (x) { return x[0].toLowerCase() === word.toLowerCase(); }); return !!hit; });
    return hit ? hit[1] : null;
  }
  function genericSentence(word) { let h = 0; for (let i = 0; i < word.length; i++) h += word.charCodeAt(i); return GENERIC[h % GENERIC.length]; }

  /* p.school = { words: [{ w, s }], set: ISO, stats: { word: { r, x, last } }, tests: [{ date, right, total }] } */
  function sanitize(p) {
    const s = p.school;
    if (!s || typeof s !== "object") { delete p.school; return; }
    const words = Array.isArray(s.words) ? s.words : [];
    const clean = [];
    words.forEach(function (x) {
      const w = cleanWord(x && x.w);
      if (!w || clean.length >= MAX || clean.some(function (c) { return c.w.toLowerCase() === w.toLowerCase(); })) return;
      clean.push({ w: w, s: cleanSentence(x.s, w) || bankSentence(w) || genericSentence(w) });
    });
    const stats = {};
    if (s.stats && typeof s.stats === "object") clean.forEach(function (c) {
      const v = s.stats[c.w];
      if (v && typeof v === "object") stats[c.w] = { r: Math.max(0, Math.min(999, Number(v.r) || 0)), x: Math.max(0, Math.min(999, Number(v.x) || 0)), last: v.last ? 1 : 0 };
    });
    const tests = (Array.isArray(s.tests) ? s.tests : []).filter(function (t) { return t && typeof t.date === "string" && /^\d{4}-\d\d-\d\dT/.test(t.date); })
      .slice(-12).map(function (t) { return { date: t.date.slice(0, 30), right: Math.max(0, Math.min(MAX, Number(t.right) || 0)), total: Math.max(0, Math.min(MAX, Number(t.total) || 0)) }; });
    p.school = { words: clean, set: typeof s.set === "string" && /^\d{4}-\d\d-\d\dT/.test(s.set) ? s.set.slice(0, 30) : new Date().toISOString(), stats: stats, tests: tests };
    if (!clean.length) delete p.school;
  }

  function words(p) { return p && p.school ? p.school.words : []; }
  function has(p) { return words(p).length > 0; }
  function mastered(p, w) { const s = p.school && p.school.stats[w]; return !!(s && s.r >= 2 && s.last); }
  function masteredCount(p) { return words(p).filter(function (x) { return mastered(p, x.w); }).length; }
  function testedSinceSet(p) { return (p.school.tests || []).filter(function (t) { return t.date >= p.school.set; }); }

  /* ---------- rounds ---------- */
  /* Practice: up to 10 words, the shakiest first. Test: every word once. */
  function round(p, test, grade) {
    const WQ = BD.WordQuiz, quiet = WQ.isQuiet(p);
    const list = words(p).map(function (x) { return [x.w, x.s]; });
    const score = function (w) { const s = p.school.stats[w] || { r: 0, x: 0, last: 0 }; return (mastered(p, w) ? 10 : 0) + s.r - s.x * 2 + Math.random() * 2; };
    let pick = test ? shuffle(list) : list.slice().sort(function (a, b) { return score(a[0]) - score(b[0]); }).slice(0, ROUND);
    pick = test ? pick : shuffle(pick);
    // a real test is listen-and-spell; quiet mode uses the silent styles that still make them produce the spelling
    const QUIET_TEST = ["fix", "missing", "pick", "scramble"];
    const bag = WQ.styleBag(grade, quiet);
    return pick.map(function (x, i) {
      const style = test ? (quiet ? QUIET_TEST[i % QUIET_TEST.length] : "listen") : bag();
      return Object.assign(WQ.makeSpelling(x, grade, style), { school: true, label: test ? "📝 Word test" : "📝 " + WQ.STYLE_INFO[style === "listen" && quiet ? "missing" : style] });
    });
  }
  function mark(p, word, ok) {
    if (!p.school) return;
    const s = p.school.stats[word] = p.school.stats[word] || { r: 0, x: 0, last: 0 };
    if (ok) s.r++; else s.x++;
    s.last = ok ? 1 : 0;
  }
  function recordTest(p, right, total) {
    if (!p.school) return;
    p.school.tests.push({ date: new Date().toISOString(), right: right, total: total });
    p.school.tests = p.school.tests.slice(-12);
  }

  /* Sensei's plan: school words come first while there are unmastered words. */
  function planItems(p) {
    if (!has(p)) return [];
    const n = words(p).length, m = masteredCount(p), tested = testedSinceSet(p);
    const practiced = Object.keys(p.school.stats).length;
    const out = [];
    if (m < n) out.push({ kind: "school", title: "Practice this week's school words", sub: n + " words from school · " + m + " mastered so far" });
    if (practiced >= Math.min(n, 5) && (!tested.length || m === n)) out.push({ kind: "schoolTest", title: tested.length ? "Retake your school word test" : "Take your school word test", sub: "Every word, once. Show what you know!" });
    return out.slice(0, 1);
  }

  /* ---------- parent corner ---------- */
  function parentHTML(p) {
    if (!has(p)) return '<div class="school-box"><div><strong>📝 School spelling words</strong><p class="muted small">Add this week\'s spelling list from school. It becomes practice and a word test in Spelling Bee.</p></div>' +
      '<button type="button" class="btn btn-small btn-primary" data-act="school">Add this week\'s words</button></div>';
    const last = testedSinceSet(p).slice(-1)[0];
    return '<div class="school-box"><div><strong>📝 School spelling words</strong> <span class="muted small">added ' + new Date(p.school.set).toLocaleDateString(undefined, { month: "short", day: "numeric" }) + '</span>' +
      '<p class="school-words">' + words(p).map(function (x) {
        const s = p.school.stats[x.w], st = mastered(p, x.w) ? "ok" : s && s.x && !s.last ? "bad" : s ? "go" : "";
        return '<span class="sw ' + st + '">' + esc(x.w) + '</span>';
      }).join("") + '</p>' +
      '<p class="muted small">' + masteredCount(p) + ' of ' + words(p).length + ' mastered' + (last ? ' · last word test: <strong>' + last.right + '/' + last.total + '</strong>' : ' · no word test yet') +
      ' · <span class="sw ok">mastered</span> <span class="sw go">practicing</span> <span class="sw bad">missed last time</span></p></div>' +
      '<button type="button" class="btn btn-small" data-act="school">New list</button></div>';
  }

  /* The editor sheet: type or photograph the list. */
  let sampleFn = null;
  function getSample() {
    if (sampleFn !== null || !window.claude || typeof window.claude.use !== "function") return Promise.resolve(sampleFn);
    return window.claude.use("sample").then(function (fn) { sampleFn = fn || null; return sampleFn; }).catch(function () { return null; });
  }
  function openEditor(p, done) {
    BD.UI.sheet("School spelling words · " + p.name,
      '<p>Type or paste this week\'s spelling words from school (up to ' + MAX + '), separated by spaces, commas or new lines.</p>' +
      '<label class="sr-only" for="schoolIn">Spelling words</label>' +
      '<textarea id="schoolIn" class="school-in" rows="5" maxlength="800" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="because, friend, said, people, ...">' + esc(words(p).map(function (x) { return x.w; }).join(", ")) + '</textarea>' +
      '<div class="school-photo" id="schoolPhotoRow" hidden><label class="btn btn-quiet" for="schoolPhoto">📷 Read a photo of the list</label><input type="file" id="schoolPhoto" accept="image/*" capture="environment" hidden></div>' +
      '<p class="muted small" id="schoolMsg" aria-live="polite"></p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="schoolSave">Save words</button>' + (has(p) ? '<button type="button" class="btn btn-quiet" id="schoolClear">Clear list</button>' : '') + '</div>');
    const msg = function (t) { $("schoolMsg").textContent = t; };
    getSample().then(function (fn) {
      if (!fn || !$("schoolPhotoRow")) return;
      Promise.resolve(fn.limits ? fn.limits() : null).then(function (l) { if (l && l.images && $("schoolPhotoRow")) $("schoolPhotoRow").hidden = false; }).catch(function () { /* no photos */ });
    });
    $("schoolPhoto").onchange = function (e) {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      if (f.size > 8e6) { msg("That picture is too big. Try a closer photo."); return; }
      msg("Reading the list…");
      sampleFn.json("This photo shows a child's school spelling list. Return JSON {\"words\": [..]} with only the spelling words, exactly as written, in order, at most " + MAX + ". No numbers, no headings, no sentences.", { images: [f], modelTier: "quick" })
        .then(function (r) {
          const got = parse(Array.isArray(r && r.words) ? r.words.join(" ") : "");
          if (!got.length) { msg("I couldn't find words in that photo. Try again or type them."); return; }
          $("schoolIn").value = got.join(", "); msg("Found " + got.length + " words. Check them, then tap Save.");
        }).catch(function () { msg("Couldn't read the photo here. Please type the words."); });
    };
    $("schoolSave").onclick = function () {
      const list = parse($("schoolIn").value);
      if (!list.length) { msg("Add at least one word."); return; }
      const old = p.school || { stats: {}, tests: [] };
      const same = has(p) && list.length === words(p).length && list.every(function (w, i) { return w.toLowerCase() === words(p)[i].w.toLowerCase(); });
      p.school = {
        words: list.map(function (w) { const prev = words(p).find(function (x) { return x.w.toLowerCase() === w.toLowerCase(); }); return { w: w, s: prev ? prev.s : bankSentence(w) || genericSentence(w) }; }),
        set: same ? old.set : new Date().toISOString(), stats: {}, tests: old.tests || []
      };
      list.forEach(function (w) { if (old.stats && old.stats[w]) p.school.stats[w] = old.stats[w]; });
      sanitize(p); BD.Store.save(p);
      msg("Saved! " + list.length + " words are ready in Spelling Bee.");
      improveSentences(p);
      setTimeout(function () { $("infoClose").click(); if (done) done(); }, 700);
    };
    if ($("schoolClear")) $("schoolClear").onclick = function () { delete p.school; BD.Store.save(p); $("infoClose").click(); if (done) done(); };
  }
  /* Where Sensei is available, write a real sentence for words that only have a generic one. */
  function improveSentences(p) {
    const need = words(p).filter(function (x) { return GENERIC.indexOf(x.s) !== -1; });
    if (!need.length) return;
    getSample().then(function (fn) {
      if (!fn) return;
      const grade = BD.gradeLabel(p.spellingGrade);
      return fn.json("Write one short, kid-friendly sentence (6 to 14 words, " + grade + " reading level, nothing scary) that uses each spelling word exactly as written. " +
        "Return JSON {\"sentences\": {\"word\": \"sentence\"}}. Words: " + JSON.stringify(need.map(function (x) { return x.w; })), { modelTier: "quick" })
        .then(function (r) {
          const map = r && r.sentences && typeof r.sentences === "object" ? r.sentences : {};
          let changed = false;
          words(p).forEach(function (x) { const s = cleanSentence(map[x.w], x.w); if (s && GENERIC.indexOf(x.s) !== -1) { x.s = s; changed = true; } });
          if (changed) BD.Store.save(p);
        });
    }).catch(function () { /* generic sentences still work */ });
  }

  BD.Store.players().forEach(sanitize); // saves loaded before this file

  return { parse: parse, sanitize: sanitize, words: words, has: has, mastered: mastered, masteredCount: masteredCount, round: round, mark: mark, recordTest: recordTest, planItems: planItems, parentHTML: parentHTML, openEditor: openEditor, cleanSentence: cleanSentence };
})();
