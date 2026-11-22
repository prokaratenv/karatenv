/* READ-ALONG AND VOICE ANSWERS
   BD.ReadAlong.read(target, opts) reads text aloud and lights up each word as
   it is spoken, so children who are learning to read can follow along.
     target: an element (its words are highlighted), or a list of parts:
       { el }          read the element, word by word
       { el, text }    say `text` while the whole element glows (e.g. "3 + 4" said as "3 plus 4")
       { text, lang }  just say it
     opts: { id, button, onend, rate }
   Word timing comes from the speech engine's word-boundary events (charIndex).
   Some voices (Chrome's network voices, some Android voices) never send them,
   so after a short wait the highlight is timed from the reading speed instead.

   Voice answers: BD.ReadAlong.mic.sync(textarea) adds a microphone button
   under an answer box. Off by default; a parent turns it on in the Parents
   area, because the browser may send audio to its maker's speech service.

   Settings (this device, localStorage "brainDojo.readalong"):
     mode: "auto" (Pre-K to 1st, default) | "always" | "tap"
     speed: "slow" | "normal"; highlight: true|false; voice: false|true */
window.BD = window.BD || {};

BD.ReadAlong = (function () {
  const KEY = "brainDojo.readalong";
  const DEF = { mode: "auto", speed: "normal", highlight: true, voice: false };
  const RATES = { slow: 0.7, normal: 0.9 };
  const synth = typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function" ? window.speechSynthesis : null;

  /* ---------- settings ---------- */
  function clean(o) {
    o = o || {};
    return {
      mode: ["auto", "always", "tap"].indexOf(o.mode) !== -1 ? o.mode : DEF.mode,
      speed: RATES[o.speed] ? o.speed : DEF.speed,
      highlight: o.highlight !== false,
      voice: o.voice === true
    };
  }
  let prefs = (function () { try { return clean(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { return clean({}); } })();
  function settings(patch) {
    if (patch && typeof patch === "object") {
      prefs = clean(Object.assign({}, prefs, patch));
      try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* private mode: keep for this visit */ }
      if (!prefs.voice) mic.stopAll();
      document.querySelectorAll("textarea[data-ra-mic]").forEach(function (t) { mic.sync(t); });
    }
    return Object.assign({}, prefs);
  }
  function rate() { return RATES[prefs.speed] || 0.9; }
  function canSpeak() { return !!synth && !(BD.Store && BD.Store.muted); }

  /* ---------- words ---------- */
  /* How a printed word is said (math symbols and blanks). */
  function sayWord(w) {
    if (/^_{2,}[.,!?]*$/.test(w)) return "blank";
    const map = { "+": "plus", "−": "minus", "-": "minus", "×": "times", "÷": "divided by", "=": "equals", "&": "and" };
    if (map[w]) return map[w];
    return w.replace(/_{2,}/g, " blank ").replace(/\s+/g, " ").trim();
  }
  function isBlock(node) {
    const el = node && node.nodeType === 1 ? node : node && node.parentNode;
    try { return el && /^(block|flex|grid|list-item|table)/.test(getComputedStyle(el).display); } catch (e) { return false; }
  }
  function unwrap(el) {
    el.querySelectorAll("span.ra-w").forEach(function (s) { s.replaceWith(document.createTextNode(s.textContent)); });
    el.normalize();
  }
  /* Wrap every word of el in <span class="ra-w"> and return [{ span, say }]. */
  function wrap(el) {
    unwrap(el);
    const nodes = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walk.nextNode())) {
      const par = n.parentNode;
      if (!n.nodeValue.trim() || (par.closest && par.closest("button,textarea,input,select,script,style,[aria-hidden='true'],.ra-skip,.sr-only"))) continue;
      nodes.push(n);
    }
    const words = [];
    const blockOf = function (node) { let e = node.parentNode; while (e && e !== el && !isBlock(e)) e = e.parentNode; return e; };
    let tail = "", prevBlock = null;
    nodes.forEach(function (node) {
      const t = node.nodeValue, frag = document.createDocumentFragment(), re = /\S+/g, blk = blockOf(node);
      // "un<b>der</b>line" is one spoken word; text in separate blocks is not.
      const joins = !!tail && !/\s/.test(tail) && !/^\s/.test(t) && blk === prevBlock;
      tail = t.slice(-1); prevBlock = blk;
      let m, last = 0;
      while ((m = re.exec(t))) {
        if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
        const sp = document.createElement("span");
        sp.className = "ra-w"; sp.textContent = m[0];
        frag.appendChild(sp);
        const said = sayWord(m[0]);
        if (said) words.push({ span: sp, say: said, glue: joins && m.index === 0 && words.length > 0 });
        last = m.index + m[0].length;
      }
      if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
    return words;
  }
  /* Split words into sentence-sized utterances (Chrome cuts off long ones). */
  function chunk(words, lang) {
    const out = [];
    let cur = null;
    words.forEach(function (w) {
      if (!cur) { cur = { text: "", lang: lang, words: [] }; out.push(cur); }
      const sep = cur.text && !w.glue ? " " : "";
      const start = cur.text.length + sep.length;
      cur.text += sep + w.say;
      cur.words.push({ span: w.span, start: start, end: start + w.say.length, len: w.say.length, pause: /[.!?]["')\]]*$/.test(w.say) ? 320 : /[,;:]["')\]]*$/.test(w.say) ? 160 : 0 });
      if (/[.!?]["')\]]*$/.test(w.say) || cur.text.length > 220) cur = null;
    });
    return out;
  }

  /* ---------- reading ---------- */
  let S = null, boundaryOK = false;
  const raw = { stop: null, say: null, sayAll: null };

  function toParts(target) {
    if (!target) return [];
    if (target.nodeType === 1) return [{ el: target }];
    if (typeof target === "string") return [{ text: target }];
    return (Array.isArray(target) ? target : [target]).map(function (x) {
      if (!x) return null;
      if (x.nodeType === 1) return { el: x };
      if (typeof x === "string") return { text: x };
      return x;
    }).filter(Boolean);
  }

  /* Highlighting helpers */
  function mark(w) {
    if (!S || !w || w === S.word) return;
    if (S.word) { S.word.span.classList.remove("ra-cur"); S.word.span.classList.add("ra-done"); }
    S.word = w;
    w.span.classList.add("ra-cur");
    try {
      const r = w.span.getBoundingClientRect(), h = window.innerHeight || 0;
      if (h && (r.bottom > h - 20 || r.top < 0)) w.span.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch (e) { /* ignore */ }
  }
  function clearMarks(st) {
    if (!st) return;
    clearTimeout(st.timer); clearTimeout(st.wait);
    st.els.forEach(function (el) {
      el.classList.remove("ra-reading", "ra-block");
      el.querySelectorAll(".ra-cur,.ra-done").forEach(function (s) { s.classList.remove("ra-cur", "ra-done"); });
    });
    if (st.button) { st.button.classList.remove("ra-playing"); st.button.setAttribute("aria-pressed", "false"); if (st.label != null) st.button.textContent = st.label; }
    st.word = null;
  }
  function finish(st, completed) {
    if (!st || st.over) return;
    st.over = true;
    clearMarks(st);
    if (S === st) S = null;
    if (typeof st.onend === "function") try { st.onend(!!completed); } catch (e) { /* ignore */ }
  }

  /* Timed highlighting when the voice sends no word boundaries. */
  function timed(st, seg, from) {
    if (st.over || S !== st || !seg.words.length) return;
    let i = from || 0;
    const step = function () {
      if (st.over || S !== st || seg.gotBoundary || st.seg !== seg || i >= seg.words.length) return;
      const w = seg.words[i++];
      mark(w);
      st.timer = setTimeout(step, (70 + w.len * 62 + w.pause) / st.rate);
    };
    step();
  }

  function speakSeg(st, seg, isLast) {
    const u = new SpeechSynthesisUtterance(seg.text);
    u.lang = seg.lang || "en-US";
    const v = BD.Speech.voiceFor ? BD.Speech.voiceFor(u.lang) : null;
    if (v) u.voice = v;
    u.rate = st.rate;
    u.onstart = function () {
      if (st.over || S !== st) return;
      st.seg = seg;
      clearTimeout(st.timer); clearTimeout(st.wait);
      if (seg.block && st.hl) seg.block.classList.add("ra-block");
      if (seg.el && st.hl) seg.el.classList.add("ra-reading");
      if (seg.words.length && st.hl) {
        mark(seg.words[0]);
        // No boundary event soon after starting? Time the words ourselves.
        st.wait = setTimeout(function () { if (!seg.gotBoundary) timed(st, seg, 1); }, boundaryOK ? 900 : 450);
      }
    };
    u.onboundary = function (e) {
      if (st.over || S !== st || !st.hl || !seg.words.length) return;
      if (e && e.name && e.name !== "word") return;
      seg.gotBoundary = true; boundaryOK = true;
      clearTimeout(st.timer); clearTimeout(st.wait);
      const ci = Number(e && e.charIndex) || 0;
      let w = seg.words[0];
      for (let i = 0; i < seg.words.length; i++) { if (seg.words[i].start <= ci) w = seg.words[i]; else break; }
      mark(w);
    };
    u.onend = function () {
      if (st.over || S !== st) return;
      clearTimeout(st.timer); clearTimeout(st.wait);
      if (seg.block) seg.block.classList.remove("ra-block");
      if (seg.words.length && st.hl) seg.words.forEach(function (w) { w.span.classList.remove("ra-cur"); w.span.classList.add("ra-done"); });
      st.word = null;
      if (isLast) finish(st, true);
    };
    u.onerror = function (e) {
      if (st.over || S !== st) return;
      // "interrupted"/"canceled" = something else started talking: stop cleanly.
      finish(st, false);
    };
    synth.speak(u);
  }

  function read(target, opts) {
    opts = opts || {};
    stop();
    if (!canSpeak()) return false;
    const hl = prefs.highlight && opts.highlight !== false;
    const parts = toParts(target);
    const segs = [];
    const st = { id: opts.id || null, rate: opts.rate || rate(), hl: hl, els: [], button: opts.button || null, onend: opts.onend, over: false, word: null, label: null };
    parts.forEach(function (p) {
      if (p.el && !p.text) {
        if (!p.el.textContent.trim()) return;
        if (hl) {
          st.els.push(p.el);
          chunk(wrap(p.el), p.lang || "en-US").forEach(function (c) { c.el = p.el; segs.push(c); });
        } else {
          segs.push({ text: p.el.textContent.replace(/\s+/g, " ").trim(), lang: p.lang || "en-US", words: [] });
        }
      } else if (p.text) {
        if (p.el && hl) st.els.push(p.el);
        segs.push({ text: String(p.text), lang: p.lang || "en-US", words: [], block: p.el && hl ? p.el : null });
      }
    });
    if (!segs.length) return false;
    S = st;
    if (st.button) {
      st.button.classList.add("ra-playing"); st.button.setAttribute("aria-pressed", "true");
      if (opts.stopLabel) { st.label = st.button.textContent; st.button.textContent = opts.stopLabel; }
    }
    try {
      segs.forEach(function (seg, i) { speakSeg(st, seg, i === segs.length - 1); });
    } catch (e) { finish(st, false); return false; }
    return true;
  }

  function stop() {
    mic.stopAll();
    const st = S;
    S = null;
    if (raw.stop) raw.stop(); else if (synth) try { synth.cancel(); } catch (e) { /* ignore */ }
    if (st) finish(st, false);
  }
  function active() { return S ? (S.id || true) : null; }

  /* Anything else that talks or stops talking ends the read-along cleanly. */
  function patchSpeech() {
    if (!BD.Speech || BD.Speech._ra) return;
    raw.stop = BD.Speech.stop; raw.say = BD.Speech.say; raw.sayAll = BD.Speech.sayAll;
    const drop = function () { const st = S; S = null; if (st) finish(st, false); };
    BD.Speech.stop = function () { drop(); return raw.stop.apply(this, arguments); };
    BD.Speech.say = function () { drop(); return raw.say.apply(this, arguments); };
    BD.Speech.sayAll = function () { drop(); return raw.sayAll.apply(this, arguments); };
    BD.Speech.speaking = (function (orig) { return function () { return !!S || orig.apply(this, arguments); }; })(BD.Speech.speaking);
    BD.Speech._ra = true;
  }
  patchSpeech();

  /* ---------- voice answers ---------- */
  const mic = (function () {
    const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    let rec = null, cur = null, heard = false, errored = false, safety = 0;
    const SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8.5 21h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    function available() { return typeof SR === "function"; }
    function rowFor(input) { return input && input.parentNode ? input.parentNode.querySelector('.ra-mic-row[data-for="' + input.id + '"]') : null; }
    function ui(input, listening, msg) {
      const row = rowFor(input); if (!row) return;
      const b = row.querySelector(".ra-mic");
      b.classList.toggle("listening", !!listening);
      b.setAttribute("aria-pressed", listening ? "true" : "false");
      b.querySelector(".ra-mic-txt").textContent = listening ? "Listening… tap to stop" : "Say my answer";
      if (msg !== undefined) row.querySelector(".ra-mic-msg").textContent = msg;
    }
    function tidy(t) {
      t = String(t || "").replace(/\s+/g, " ").trim();
      return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
    }
    function start(input) {
      if (!available()) return;
      stopAll();
      // Don't let the reading voice talk over the child (or be heard by the mic).
      const st = S; S = null; if (st) finish(st, false);
      if (raw.stop) raw.stop();
      let r;
      try { r = new SR(); } catch (e) { ui(input, false, "Voice answers aren't working in this browser. You can type your answer."); return; }
      rec = r; cur = input; heard = false; errored = false;
      const base = input.value.trim();
      r.lang = "en-US"; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
      r.onresult = function (e) {
        if (rec !== r) return;
        let said = "", final = true;
        for (let i = 0; i < e.results.length; i++) { said += e.results[i][0].transcript + " "; if (!e.results[i].isFinal) final = false; }
        said = tidy(said);
        if (!said) return;
        heard = true;
        if (final && !/[.!?]$/.test(said)) said += ".";
        input.value = (base ? base + " " : "") + said;
        try { input.dispatchEvent(new Event("input", { bubbles: true })); } catch (er) { /* ignore */ }
      };
      r.onerror = function (e) {
        if (rec !== r) return;
        errored = true;
        const code = e && e.error;
        const msg = code === "not-allowed" || code === "service-not-allowed" ? "The microphone isn't allowed. A grown-up can turn it on in the browser's settings, or you can type your answer."
          : code === "no-speech" ? "I didn't hear anything. Tap the microphone and try again."
          : code === "audio-capture" ? "No microphone was found. You can type your answer instead."
          : code === "network" ? "Voice answers need the internet right now. You can type your answer instead."
          : code === "aborted" ? ""
          : "That didn't work. Try again, or type your answer.";
        ui(input, false, msg);
      };
      r.onend = function () {
        if (rec !== r) return;
        clearTimeout(safety);
        rec = null; cur = null;
        ui(input, false, errored ? undefined : heard ? "Check your answer. You can fix any words." : "I didn't hear anything. Tap the microphone and try again.");
      };
      try { r.start(); } catch (e) { rec = null; cur = null; ui(input, false, "The microphone is busy. Try again in a moment."); return; }
      ui(input, true, "");
      clearTimeout(safety);
      safety = setTimeout(function () { if (rec === r) try { r.stop(); } catch (e) { /* ignore */ } }, 20000);
    }
    function stopAll(abort) {
      clearTimeout(safety);
      const r = rec, input = cur;
      rec = null; cur = null;
      if (r) { try { if (abort === false) r.stop(); else r.abort(); } catch (e) { /* ignore */ } }
      if (input) ui(input, false, "");
    }
    /* Add (once) and show/hide the mic button under an answer box. */
    function sync(input) {
      if (!input || !input.parentNode) return;
      input.setAttribute("data-ra-mic", "1");
      let row = rowFor(input);
      if (!row) {
        row = document.createElement("div");
        row.className = "ra-mic-row"; row.setAttribute("data-for", input.id);
        row.innerHTML = '<button type="button" class="btn ra-mic" aria-pressed="false">' + SVG + '<span class="ra-mic-txt">Say my answer</span></button><span class="ra-mic-msg" aria-live="polite"></span>';
        input.insertAdjacentElement("afterend", row);
        row.querySelector(".ra-mic").addEventListener("click", function () {
          if (rec && cur === input) stopAll(false); else start(input);
        });
      }
      if (cur === input) stopAll();
      row.hidden = !(prefs.voice && available()) || input.readOnly || input.disabled;
      row.querySelector(".ra-mic-msg").textContent = "";
    }
    return { available: available, sync: sync, stopAll: stopAll, listening: function () { return !!rec; } };
  })();

  function voiceEnabled() { return !!prefs.voice && mic.available(); }

  /* ---------- Parents area: "Read aloud" ---------- */
  function radio(name, val, cur, label) {
    return '<label class="ra-pill"><input type="radio" name="' + name + '" value="' + val + '"' + (cur === val ? " checked" : "") + '><span>' + label + '</span></label>';
  }
  if (BD.Settings) BD.Settings.add({
    id: "readalong", scope: "family", title: "Read aloud",
    html: function () {
      const s = prefs, micOK = mic.available();
      return '<div class="ra-set">' +
        (!synth ? '<p class="muted small">This browser can\'t read aloud.</p>' : "") +
        '<fieldset class="ra-group"><legend>Read instructions, questions and stories aloud</legend>' +
          radio("raMode", "auto", s.mode, "Automatically for Pre-K to 1st grade") +
          radio("raMode", "always", s.mode, "Always, for every grade") +
          radio("raMode", "tap", s.mode, "Only when the speaker is tapped") +
        '</fieldset>' +
        '<fieldset class="ra-group ra-row"><legend>Reading speed</legend>' +
          radio("raSpeed", "slow", s.speed, "Slow") + radio("raSpeed", "normal", s.speed, "Normal") +
          (synth ? '<button type="button" class="btn btn-small" data-ra-try>▶ Try it</button>' : "") +
        '</fieldset>' +
        '<p class="ra-sample" data-ra-sample>Let\'s read together. Watch each word light up!</p>' +
        '<label class="sound-row"><span><strong>Highlight words</strong><span class="muted small">Each word lights up as it\'s read, so kids can follow along.</span></span>' +
          '<input type="checkbox" class="switch" data-ra-hl' + (s.highlight ? " checked" : "") + '></label>' +
        '<label class="sound-row"><span><strong>Voice answers</strong><span class="muted small">A microphone button on Story Scrolls answers, so kids who can\'t type yet can say their answer.</span></span>' +
          '<input type="checkbox" class="switch" data-ra-voice' + (s.voice && micOK ? " checked" : "") + (micOK ? "" : " disabled") + '></label>' +
        '<p class="muted small ra-disclose">Speech is turned into text by your device or browser\'s speech service; Brain Dojo does not record or keep audio.</p>' +
        (micOK ? "" : '<p class="muted small">This browser can\'t turn speech into text. Try Chrome, Edge or Safari.</p>') +
        '</div>';
    },
    bind: function (root) {
      root.querySelectorAll('input[name="raMode"]').forEach(function (i) { i.addEventListener("change", function () { if (i.checked) settings({ mode: i.value }); }); });
      root.querySelectorAll('input[name="raSpeed"]').forEach(function (i) { i.addEventListener("change", function () { if (i.checked) settings({ speed: i.value }); }); });
      const hl = root.querySelector("[data-ra-hl]"); if (hl) hl.addEventListener("change", function () { settings({ highlight: hl.checked }); });
      const vo = root.querySelector("[data-ra-voice]"); if (vo) vo.addEventListener("change", function () { settings({ voice: vo.checked }); });
      const t = root.querySelector("[data-ra-try]");
      if (t) t.addEventListener("click", function () {
        if (active() === "try") { stop(); return; }
        if (!read(root.querySelector("[data-ra-sample]"), { id: "try", button: t }) && BD.Store && BD.Store.muted) {
          const smp = root.querySelector("[data-ra-sample]"); smp.textContent = "Sound is off. Turn on sound effects & voice (🔊 Sound) to hear it.";
        }
      });
    }
  });

  /* Leaving a screen stops reading and listening. */
  if (BD.on) BD.on("screen", function () { stop(); });

  return { read: read, stop: stop, settings: settings, voiceEnabled: voiceEnabled, rate: rate, active: active, mic: mic, wrap: wrap };
})();
