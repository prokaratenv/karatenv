/* HINTS — every practice question, at every belt, has up to 2 hints so
   nobody gets stuck and quits. Tap "Hint" once for hint 1, again for hint 2.
   Each hint lowers that question's points a little (hint 1 → 75%, hint 2 →
   50%) but never blocks an answer. Stripe tests and the Belt Assessment have
   no hints.

   BD.Hints.bar(card, key, before)  make (once) the Hint button + hint box in a card
   BD.Hints.reset(key, provider, o) new question: provider(n) → { html, text, act }
                                     o = { grade, off, max }
   BD.Hints.used(key)               hints used on this question (0, 1 or 2)
   BD.Hints.factor(n)               points multiplier for n hints
   BD.Hints.spelling / math / rule out choices: content helpers */
window.BD = window.BD || {};

BD.Hints = (function () {
  const esc = function (s) { return BD.UI.esc(s); };
  const FACTOR = [1, 0.75, 0.5];
  const S = {}; // key → { n, max, provider, grade, el }

  function factor(n) { return FACTOR[Math.max(0, Math.min(2, n || 0))]; }
  function used(key) { return S[key] ? S[key].n : 0; }

  function bar(card, key, before) {
    let el = card.querySelector('.hint-bar[data-hint="' + key + '"]');
    if (el) return el;
    el = document.createElement("div");
    el.className = "hint-bar"; el.dataset.hint = key; el.setAttribute("data-test-hide", "");
    el.innerHTML = '<button type="button" class="btn hint-btn"><span aria-hidden="true">💡</span> <span class="hint-label">Hint</span></button><div class="hint-box" aria-live="polite"></div>';
    if (before && before.parentNode === card) card.insertBefore(el, before); else card.appendChild(el);
    el.querySelector(".hint-btn").addEventListener("click", function () { take(key); });
    return el;
  }

  function reset(key, provider, o) {
    o = o || {};
    const st = S[key] = { n: 0, max: o.max || 2, provider: provider, grade: o.grade, el: o.el || document.querySelector('.hint-bar[data-hint="' + key + '"]'), off: !!o.off };
    if (!st.el) return;
    st.el.hidden = st.off || !provider;
    st.el.classList.toggle("young", BD.Kid ? BD.Kid.young(o.grade) : false);
    st.el.querySelector(".hint-box").innerHTML = "";
    sync(st);
  }
  function sync(st) {
    const b = st.el.querySelector(".hint-btn");
    b.disabled = st.n >= st.max;
    st.el.querySelector(".hint-label").textContent = st.n === 0 ? "Hint" : st.n < st.max ? "Hint " + (st.n + 1) + " of " + st.max : "No more hints";
    b.title = st.n < st.max ? "Uses a little of this question's points" : "";
  }
  /* Done with this question (answered): no more hints. */
  function close(key) { const st = S[key]; if (st && st.el) { st.n = st.max; sync(st); st.el.hidden = true; } }
  function hide(key, on) { const st = S[key]; if (st && st.el) st.el.hidden = !!on; }

  function take(key) {
    const st = S[key]; if (!st || st.off || st.n >= st.max) return;
    const h = st.provider(st.n + 1);
    if (!h) { st.n = st.max; sync(st); return; }
    st.n++;
    const line = document.createElement("p");
    line.className = "hint-line";
    line.innerHTML = '<strong>Hint ' + st.n + ':</strong> ' + (h.html || esc(h.text || ""));
    st.el.querySelector(".hint-box").appendChild(line);
    if (typeof h.act === "function") { try { h.act(); } catch (e) { /* a hint never breaks a round */ } }
    sync(st);
    if (BD.Sound) BD.Sound.tap();
    const say = h.say || h.text || line.textContent;
    if (say && BD.ReadAloud && BD.ReadAloud.auto(st.grade) && !(BD.Store && BD.Store.muted)) BD.ReadAloud.say(String(say).replace(/_/g, " blank "));
  }

  /* ---------- shared content helpers ---------- */
  /* Rule out wrong choice buttons (n of them), never the right one. */
  function ruleOut(buttons, isRight, n) {
    const wrong = Array.prototype.filter.call(buttons, function (b) { return !b.disabled && !isRight(b); });
    wrong.sort(function () { return Math.random() - 0.5; }).slice(0, n || 1).forEach(function (b) { b.disabled = true; b.classList.add("ruled-out"); b.setAttribute("aria-label", b.textContent + " (ruled out)"); });
    return Math.min(wrong.length, n || 1);
  }
  /* "b _ _ _ _ e" with the length. */
  function pattern(word, firstOnly) {
    const w = String(word);
    const mid = w.slice(1, firstOnly ? w.length : -1).split("").map(function (c) { return c === " " ? "  " : "_"; }).join(" ");
    return w.length <= 2 ? w.charAt(0) + " _" : w.charAt(0) + " " + mid + (firstOnly ? "" : " " + w.charAt(w.length - 1));
  }
  /* Rough syllable count (good enough for a hint). */
  function syllables(word) {
    const w = String(word).toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return 1;
    const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
    return Math.max(1, groups ? groups.length : 1);
  }
  /* The rhyming part: from the last vowel sound to the end (cat → at, heat → eat, make → ake). */
  function rime(w) {
    const m = /[aeiouy]+[^aeiouy]+e$/.exec(w) || /[aeiou]+[^aeiou]*$/.exec(w);
    return m && m.index > 0 && m[0].length >= 2 ? m[0] : null;
  }
  /* A word from the spelling bank that rhymes (same spelling of the rhyming part). */
  let ends = null;
  function rhyme(word) {
    const w = String(word).toLowerCase();
    if (!ends) {
      ends = {};
      Object.keys(BD.SPELLING || {}).forEach(function (g) {
        if (Number(g) > 3) return; // short, familiar rhyme words
        BD.SPELLING[g].forEach(function (x) { const k = x[0].toLowerCase(), m = rime(k); if (/^[a-z]+$/.test(k) && m) (ends[m] = ends[m] || []).push(k); });
      });
    }
    const pick = function (list) { list = (list || []).filter(function (x) { return x !== w && x.length <= w.length + 2 && x.indexOf(w) === -1 && w.indexOf(x) === -1; }); return list.length ? list[Math.floor(Math.random() * list.length)] : null; };
    const m = rime(w);
    return m ? pick(ends[m]) : null;
  }
  const SOUNDS = [
    [/igh/, "has the long i sound spelled igh"], [/(ai|ay)/, "has a long a vowel team (ai or ay)"], [/(ee|ea)/, "has a long e vowel team (ee or ea)"],
    [/(oa|ow)/, "has a long o sound (oa or ow)"], [/(oo)/, "has oo in the middle"], [/(ou|ow)/, "has the ow sound (ou or ow)"], [/(oi|oy)/, "has the oy sound (oi or oy)"],
    [/(ar)/, "has the ar sound"], [/(er|ir|ur)/, "has the er sound (er, ir or ur)"], [/(or)/, "has the or sound"],
    [/^(sh|ch|th|wh)/, "starts with two letters that make one sound"], [/(sh|ch|th|ck|ng)/, "has two letters that make one sound"],
    [/([bcdfgklmnprstz])\1/, "has a double letter"], [/[^aeiou]e$/, "ends with a silent e"], [/(tion|sion)$/, "ends with -tion or -sion (say shun)"],
    [/(ing|ed|er|est|ly|ful|less|ness)$/, "has an ending added to a base word"]
  ];
  function soundClue(word) {
    const w = String(word).toLowerCase();
    for (let i = 0; i < SOUNDS.length; i++) if (SOUNDS[i][0].test(w)) return "It " + SOUNDS[i][1] + ".";
    return "";
  }
  function meaning(word) {
    const d = BD.SPELL_DEFS && (BD.SPELL_DEFS[word] || BD.SPELL_DEFS[String(word).toLowerCase()]);
    return d || "";
  }

  /* Spelling Bee: q is the word-quiz item, grade the round grade. */
  function spelling(q, grade, ctx) {
    const word = q.word || q.answer, n = word.length, syl = syllables(word);
    const def = Number(grade) >= 2 ? meaning(word) : "";
    const count = n + " letters" + (syl > 1 ? ", " + syl + " syllables" : "");
    return function (level) {
      if (level === 1) {
        if (def) return { html: "It means: <em>" + esc(def) + "</em>. (" + count + ")", text: "It means: " + def + "." };
        const rh = rhyme(word), sc = soundClue(word);
        const t = (rh ? "It rhymes with " + rh + ". " : "") + (sc ? sc + " " : "") + "It has " + count + ".";
        return { text: t };
      }
      // hint 2
      if (q.choices && ctx && ctx.choices) {
        if (q.mode === "check") {
          if (q.shown && q.shown !== word) {
            let i = 0; while (i < word.length && word[i] === q.shown[i]) i++;
            return { text: "Look closely near letter " + (i + 1) + " of the underlined word. Sound it out slowly." };
          }
          return { text: "Sound it out slowly: " + splitSyl(word) + ". Do the letters match the sounds?" };
        }
        const k = ruleOut(ctx.choices(), ctx.isRight, q.choices.length > 3 ? 2 : 1);
        return { text: (k ? "I took away " + (k > 1 ? k + " wrong choices" : "a wrong choice") + ". " : "") + "The word starts with " + word.charAt(0) + " and ends with " + word.charAt(word.length - 1) + "." };
      }
      if (q.tilesAlways) return { html: "It ends with <strong>" + esc(word.charAt(word.length - 1)) + "</strong>: <span class='hint-pattern'>" + esc(pattern(word)) + "</span>", text: "It starts with " + word.charAt(0) + " and ends with " + word.charAt(word.length - 1) + "." };
      return { html: "First and last letters: <span class='hint-pattern'>" + esc(pattern(word)) + "</span> (" + n + " letters)", text: "It starts with " + word.charAt(0) + " and ends with " + word.charAt(word.length - 1) + ". It has " + n + " letters." };
    };
  }
  /* Split a word into syllable-ish chunks for "sound it out". */
  function splitSyl(word) {
    const parts = String(word).match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi);
    return parts && parts.join("") === String(word) && parts.length > 1 ? parts.join("-") : String(word).split("").join("-");
  }

  /* Spanish: choices are ruled out; typed words show letters. */
  function spanish(q, ctx) {
    return function (level) {
      if (q.choices && ctx && ctx.choices) {
        const k = ruleOut(ctx.choices(), ctx.isRight, 1);
        return { text: (level === 1 ? "It's a word about " + String(q.topic || "this topic").toLowerCase() + ". " : "") + (k ? "I took away a wrong choice." : "Only the right one is left!") };
      }
      const a = String(q.answer);
      if (level === 1) return { html: "It starts with <strong>" + esc(a.charAt(0)) + "</strong> and has " + a.replace(/ /g, "").length + " letters: <span class='hint-pattern'>" + esc(pattern(a, true)) + "</span>", text: "It starts with " + a.charAt(0) + "." };
      return { html: "First and last letters: <span class='hint-pattern'>" + esc(pattern(a)) + "</span>", text: "It starts with " + a.charAt(0) + " and ends with " + a.charAt(a.length - 1) + "." };
    };
  }

  /* ---------- Math ---------- */
  const N = function (n) { return BD.Explain ? BD.Explain.num(n) : String(n); };
  function line(from, steps, step) {
    const out = []; for (let i = 0; i <= steps && out.length < 12; i++) out.push(i === 0 ? String(from) : i === steps ? "?" : String(from + i * step));
    return out.join(" → ");
  }
  function math(q) {
    const a = q.a, b = q.b, op = q.op;
    if (q.hints && q.hints.length) return function (level) { return { text: q.hints[Math.min(level, q.hints.length) - 1] }; }; // middle school strands
    return function (level) {
      if (a < 0 || b < 0 || q.answer < 0) {
        if (level === 1) return { text: op === "add" || op === "sub" ? "Signs first: subtracting a negative is adding. Same signs add up, different signs subtract the sizes." : "Same signs make a positive answer, different signs make a negative answer." };
        const A = Math.abs(a), B = Math.abs(b);
        const core = op === "add" ? (Math.sign(a) === Math.sign(b) ? A + " + " + B : Math.max(A, B) + " − " + Math.min(A, B)) : op === "sub" ? "turn it into " + N(a) + " + " + N(-b) : op === "mul" ? A + " × " + B : A + " ÷ " + B;
        return { text: "Work with the sizes: " + core + ". Then decide if the answer is positive or negative." };
      }
      if (op === "add") {
        if (a <= 10 && b <= 10 && a + b > 10) {
          const big = Math.max(a, b), small = Math.min(a, b), need = 10 - big;
          if (level === 1) return { text: "Make a ten! " + big + " needs " + need + " more to make 10." };
          return { text: big + " + " + need + " = 10. You have " + (small - need) + " left from the " + small + ". What is 10 + " + (small - need) + "?" };
        }
        if (a < 10 && b < 10) {
          const big = Math.max(a, b), small = Math.min(a, b);
          if (level === 1) return { text: "Start at the bigger number, " + big + ", and count up " + small + " more." };
          return { html: "Count on with a number line: <span class='hint-pattern'>" + esc(line(big, small, 1)) + "</span>", text: "Count on from " + big + ", " + small + " more." };
        }
        const ao = a % 10, bo = b % 10;
        if (level === 1) return { text: "Line the numbers up by place value. Start with the ones: " + ao + " + " + bo + "." };
        const s = ao + bo;
        return { text: "Ones: " + ao + " + " + bo + " = " + s + (s >= 10 ? ". Write " + (s % 10) + " and carry the 1 to the tens." : ". Write " + s + ". Now add the tens.") };
      }
      if (op === "sub") {
        if (a <= 20 && b <= 10) {
          if (level === 1) return { text: a - b <= b ? "Count up from " + b + " to " + a + ". How many steps?" : "Start at " + a + " and count back " + b + "." };
          if (b < 10 && a > 10 && a - b < 10) return { text: "Count up: " + b + " to 10 is " + (10 - b) + ", then 10 to " + a + " is " + (a - 10) + ". Add those two." };
          return { html: "Count back on a number line: <span class='hint-pattern'>" + esc(line(a, b, -1)) + "</span>", text: "Count back " + b + " from " + a + "." };
        }
        const ao = a % 10, bo = b % 10;
        if (level === 1) return { text: "Line them up by place value and start with the ones: " + ao + " − " + bo + "." + (ao < bo ? " The top digit is smaller, so you'll need to borrow." : "") };
        return { text: ao < bo ? "Borrow 1 ten: the ones become " + (ao + 10) + ". " + (ao + 10) + " − " + bo + " = " + (ao + 10 - bo) + ". Now do the tens (one less on top)." : "Ones: " + ao + " − " + bo + " = " + (ao - bo) + ". Now subtract the tens." };
      }
      if (op === "mul") {
        const big = Math.max(a, b), small = Math.min(a, b);
        if (level === 1) {
          const t = small === 0 ? "Anything times 0 is 0." : small === 1 ? "Anything times 1 stays the same." : small === 2 ? "Times 2 means double it." : small === 4 ? "Times 4: double it, then double again." : small === 5 ? "Times 5 is half of times 10." : small === 10 ? "Times 10: add a zero." : small === 9 ? "Times 9: do times 10, then take one group away." : big > 12 ? "Break the big number into tens and ones, multiply each, then add." : "Skip count by " + big + ", " + small + " times.";
          return { text: t };
        }
        if (big > 12) { const t = Math.floor(big / 10) * 10, o = big % 10; return { text: big + " × " + small + " = " + t + " × " + small + " + " + o + " × " + small + " = " + (t * small) + " + " + (o * small) + "." }; }
        if (small >= 3 && big >= 6) { const k = Math.floor(small / 2); return { text: "Split it: " + big + " × " + small + " = " + big + " × " + k + " + " + big + " × " + (small - k) + " = " + (big * k) + " + " + (big * (small - k)) + "." }; }
        const seq = []; for (let i = 1; i < small && seq.length < 6; i++) seq.push(big * i);
        return { html: "Skip count by " + big + ": <span class='hint-pattern'>" + esc(seq.concat("?").join(", ")) + "</span>", text: "Skip count by " + big + "." };
      }
      // division
      if (level === 1) return { text: "Think multiplication: " + b + " × what = " + a + "?" };
      if (q.answer <= 12) {
        const seq = []; for (let i = 1; i < q.answer && seq.length < 8; i++) seq.push(b * i);
        return { html: "Skip count by " + b + " until you reach " + a + ": <span class='hint-pattern'>" + esc(seq.concat("…", a).join(", ")) + "</span>. How many jumps?", text: "Skip count by " + b + " until you reach " + a + ". Count the jumps." };
      }
      const t = Math.floor(q.answer / 10) * 10;
      return { text: b + " × " + t + " = " + (b * t) + ". That leaves " + (a - b * t) + ". How many " + b + "s are in " + (a - b * t) + "?" };
    };
  }

  /* Boss battles and tournaments: each hint rules out a wrong choice. */
  function quick(q, el) {
    return function (level) {
      const k = ruleOut(el.querySelectorAll(".qq-choice"), function (b) { return q.choices[Number(b.dataset.i)] === q.answer; }, 1);
      const extra = level === 1 && q.kind === "spelling" && meaning(q.answer) ? " It means: " + meaning(q.answer) + "." : "";
      return { text: (k ? "I took away a wrong answer." : "Only the right answer is left!") + extra };
    };
  }

  return { bar: bar, reset: reset, close: close, hide: hide, used: used, factor: factor, FACTOR: FACTOR, ruleOut: ruleOut, pattern: pattern, syllables: syllables, rhyme: rhyme, meaning: meaning, soundClue: soundClue, spelling: spelling, spanish: spanish, math: math, quick: quick };
})();
