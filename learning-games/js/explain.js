/* SENSEI'S EXPLANATIONS — built-in, step-by-step help that works offline.
   BD.Explain.math(problem)  -> list of steps for one flashcard
   BD.Explain.TIPS[op]       -> a short strategy lesson for each skill
   BD.Explain.RULES[type]    -> the rule book for each kind of sentence mistake */
window.BD = window.BD || {};

BD.Explain = (function () {
  const PLACES = ["ones", "tens", "hundreds", "thousands", "ten-thousands", "hundred-thousands"];
  const num = function (n) { return n < 0 ? "−" + Math.abs(n) : String(n); };
  const paren = function (n) { return n < 0 ? "(" + num(n) + ")" : num(n); };
  const digits = function (n) { return String(n).split("").reverse().map(Number); };

  /* ---------- addition ---------- */
  function add(a, b) {
    if (a <= 10 && b <= 10 && a + b > 10) {
      const big = Math.max(a, b), small = Math.min(a, b), need = 10 - big;
      return [
        "Make a ten! Start with the bigger number, " + big + ".",
        big + " needs " + need + " more to make 10. Take " + need + " from the " + small + ".",
        big + " + " + need + " = 10, and there is " + (small - need) + " left over.",
        "10 + " + (small - need) + " = " + (a + b) + "."
      ];
    }
    if (a < 10 && b < 10) return ["Start at " + Math.max(a, b) + " and count up " + Math.min(a, b) + " more: " + (a + b) + "."];
    const A = digits(a), B = digits(b), steps = ["Line the numbers up by place value and add one column at a time, starting on the right."];
    let carry = 0;
    const n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i++) {
      const da = A[i] || 0, db = B[i] || 0, s = da + db + carry;
      let t = "The " + PLACES[i] + ": " + da + " + " + db + (carry ? " + 1 (carried)" : "") + " = " + s;
      if (s >= 10 && i < n - 1) t += ". Write " + (s % 10) + " and carry the 1 to the " + PLACES[i + 1] + ".";
      else if (s >= 10) t += ". Write " + s + ".";
      else t += ".";
      steps.push(t);
      carry = s >= 10 ? 1 : 0;
    }
    steps.push("So " + a + " + " + b + " = " + (a + b) + ".");
    return steps;
  }

  /* ---------- subtraction ---------- */
  function sub(a, b) {
    if (a <= 20 && b <= 10) {
      if (a > 10 && b < 10 && a - b < 10) {
        return [
          "Count up from the smaller number. Think: " + b + " + ? = " + a + ".",
          "From " + b + " up to 10 is " + (10 - b) + ".",
          "From 10 up to " + a + " is " + (a - 10) + ".",
          (10 - b) + " + " + (a - 10) + " = " + (a - b) + ", so " + a + " − " + b + " = " + (a - b) + "."
        ];
      }
      return ["Think addition: " + b + " + ? = " + a + ".", b + " + " + (a - b) + " = " + a + ", so the answer is " + (a - b) + "."];
    }
    const A = digits(a), B = digits(b), steps = ["Line the numbers up by place value. Subtract one column at a time, starting on the right."];
    let borrow = 0;
    for (let i = 0; i < A.length; i++) {
      let da = A[i] - borrow;
      const db = B[i] || 0;
      if (i >= B.length && borrow === 0) {
        steps.push("The " + PLACES[i] + ": nothing to take away, so bring down the " + da + ".");
        continue;
      }
      if (i === A.length - 1 && i >= B.length && da - db === 0) continue;
      if (da < db) {
        steps.push("The " + PLACES[i] + ": " + (borrow ? A[i] + " minus the 1 you lent" : da) + " is too small to take away " + db + ", so borrow 1 from the " + PLACES[i + 1] + ". Now it's " + (da + 10) + " − " + db + " = " + (da + 10 - db) + ".");
        borrow = 1;
      } else {
        steps.push("The " + PLACES[i] + ": " + da + " − " + db + " = " + (da - db) + (borrow ? " (after lending 1)." : "."));
        borrow = 0;
      }
    }
    steps.push("So " + a + " − " + b + " = " + (a - b) + ". Check it: " + (a - b) + " + " + b + " = " + a + ".");
    return steps;
  }

  /* ---------- multiplication ---------- */
  function mulFact(a, b) {
    const p = a * b;
    if (a === 0 || b === 0) return ["Anything times 0 is 0. Zero groups of something is nothing!"];
    if (a === 1 || b === 1) return ["Anything times 1 stays the same. One group of " + Math.max(a, b) + " is " + p + "."];
    if (a === 10 || b === 10) { const o = a === 10 ? b : a; return ["Times 10: put a 0 on the end. " + o + " becomes " + p + "."]; }
    if (a === 9 || b === 9) { const o = a === 9 ? b : a; return ["Nines trick: multiply by 10, then take one group away.", o + " × 10 = " + (o * 10) + ".", (o * 10) + " − " + o + " = " + p + "."]; }
    if (a === 2 || b === 2) { const o = a === 2 ? b : a; return ["Times 2 means double it.", o + " + " + o + " = " + p + "."]; }
    if (a === 11 || b === 11) { const o = a === 11 ? b : a; return ["Times 11 = times 10, plus one more group.", o + " × 10 = " + (o * 10) + ", plus " + o + " = " + p + "."]; }
    if (a === 12 || b === 12) { const o = a === 12 ? b : a; return ["Break 12 into 10 + 2.", o + " × 10 = " + (o * 10) + " and " + o + " × 2 = " + (o * 2) + ".", (o * 10) + " + " + (o * 2) + " = " + p + "."]; }
    if (a === 4 || b === 4) { const o = a === 4 ? b : a; return ["Times 4 means double, then double again.", "Double " + o + " is " + (o * 2) + ".", "Double " + (o * 2) + " is " + p + "."]; }
    if (a === 5 || b === 5) { const o = a === 5 ? b : a; return ["Times 5 is half of times 10.", o + " × 10 = " + (o * 10) + ".", "Half of " + (o * 10) + " is " + p + "."]; }
    // split the bigger factor into 5 + the rest
    const big = Math.max(a, b), small = Math.min(a, b);
    return [
      "Break " + big + " into 5 + " + (big - 5) + ". Facts with 5 are easy!",
      small + " × 5 = " + (small * 5) + ".",
      small + " × " + (big - 5) + " = " + (small * (big - 5)) + ".",
      (small * 5) + " + " + (small * (big - 5)) + " = " + p + "."
    ];
  }

  function mul(a, b) {
    if (a <= 12 && b <= 12) return mulFact(a, b);
    // a = multi-digit, b = the smaller factor
    let big = a, small = b;
    if (b > a) { big = b; small = a; }
    if (small >= 10) {
      const tens = Math.floor(small / 10) * 10, ones = small % 10;
      return [
        "Break " + small + " into " + tens + " + " + ones + ".",
        big + " × " + tens + " = " + (big * tens) + ".",
        big + " × " + ones + " = " + (big * ones) + ".",
        "Add them: " + (big * tens) + " + " + (big * ones) + " = " + (big * small) + "."
      ];
    }
    const parts = digits(big).map(function (d, i) { return d * Math.pow(10, i); }).filter(Boolean).reverse();
    const steps = ["Break " + big + " into place values: " + parts.join(" + ") + "."];
    parts.forEach(function (pt) { steps.push(pt + " × " + small + " = " + (pt * small) + "."); });
    steps.push("Add them up: " + parts.map(function (pt) { return pt * small; }).join(" + ") + " = " + (big * small) + ".");
    return steps;
  }

  /* ---------- division ---------- */
  function div(a, b) {
    const q = a / b;
    if (b <= 12 && q <= 12) {
      return [
        "Division is multiplication backwards. Think: " + b + " × ? = " + a + ".",
        b + " × " + q + " = " + a + ", so " + a + " ÷ " + b + " = " + q + "."
      ];
    }
    const steps = ["Use long division. Work from the left, one digit at a time."];
    const ds = String(a);
    let rem = 0, started = false;
    for (let i = 0; i < ds.length; i++) {
      rem = rem * 10 + Number(ds[i]);
      const qd = Math.floor(rem / b);
      if (!started && qd === 0) continue;
      if (!started) steps.push("Start with " + rem + ", the first part big enough for " + b + ".");
      started = true;
      steps.push("How many " + b + "s fit in " + rem + "? " + qd + " (" + b + " × " + qd + " = " + (b * qd) + "). " + rem + " − " + (b * qd) + " = " + (rem - b * qd) + " left" + (i < ds.length - 1 ? ", then bring down the next digit." : "."));
      rem -= qd * b;
    }
    steps.push("So " + a + " ÷ " + b + " = " + q + ". Check it: " + q + " × " + b + " = " + a + ".");
    return steps;
  }

  /* ---------- integers (negative numbers) ---------- */
  function intAdd(a, b) {
    const s = a + b;
    if (a < 0 && b < 0) return ["Both numbers are negative, so add their sizes and keep the minus sign.", Math.abs(a) + " + " + Math.abs(b) + " = " + Math.abs(s) + ", so the answer is " + num(s) + "."];
    if (a >= 0 && b >= 0) return add(a, b);
    const big = Math.abs(a) >= Math.abs(b) ? a : b;
    return [
      "The signs are different, so subtract the sizes: " + Math.max(Math.abs(a), Math.abs(b)) + " − " + Math.min(Math.abs(a), Math.abs(b)) + " = " + Math.abs(s) + ".",
      "The answer gets the sign of the number farther from zero, " + num(big) + ". So it's " + (s < 0 ? "negative" : "positive") + ".",
      num(a) + " + " + paren(b) + " = " + num(s) + "."
    ];
  }

  function integers(p) {
    const a = p.a, b = p.b, ans = p.answer;
    if (p.op === "add") return intAdd(a, b);
    if (p.op === "sub") {
      return ["Subtracting is the same as adding the opposite: " + num(a) + " − " + paren(b) + " becomes " + num(a) + " + " + paren(-b) + "."]
        .concat(intAdd(a, -b));
    }
    const word = p.op === "mul" ? "Multiply" : "Divide";
    const sizeAns = p.op === "mul" ? Math.abs(a) * Math.abs(b) : Math.abs(a) / Math.abs(b);
    const same = (a < 0) === (b < 0);
    return [
      word + " the sizes first: " + Math.abs(a) + (p.op === "mul" ? " × " : " ÷ ") + Math.abs(b) + " = " + sizeAns + ".",
      ans === 0 ? "Zero has no sign, so the answer is 0." :
        same ? "The signs are the same, so the answer is positive." : "The signs are different, so the answer is negative.",
      "Answer: " + num(ans) + "."
    ];
  }

  function math(p) {
    if (p.steps && p.steps.length) return p.steps.slice(); // middle school strands carry their own steps
    if (p.a < 0 || p.b < 0 || p.answer < 0) return integers(p);
    if (p.op === "add") return add(p.a, p.b);
    if (p.op === "sub") return sub(p.a, p.b);
    if (p.op === "mul") return mul(p.a, p.b);
    return div(p.a, p.b);
  }

  const TIPS = {
    add: { title: "Adding", points: [
      "Make a ten: 8 + 5 → 8 + 2 = 10, then 3 more = 13.",
      "Big numbers: line them up by place value and start on the right (ones).",
      "If a column adds to 10 or more, write the ones digit and carry the 1 to the next column."
    ] },
    sub: { title: "Subtracting", points: [
      "Count up: for 13 − 8, go 8 → 10 (that's 2), then 10 → 13 (that's 3). 2 + 3 = 5.",
      "Big numbers: start on the right. If the top digit is smaller, borrow 1 from the next column (it's worth 10).",
      "Check your answer by adding it back: answer + the number you took away = the starting number."
    ] },
    mul: { title: "Multiplying", points: [
      "×2 = double. ×4 = double, double. ×5 = half of ×10. ×10 = add a zero.",
      "×9 trick: times 10, then take one group away. 9 × 7 = 70 − 7 = 63.",
      "Hard fact? Split it: 7 × 8 = 7 × 5 + 7 × 3 = 35 + 21 = 56.",
      "Big numbers: break them into place values. 23 × 4 = 20 × 4 + 3 × 4 = 80 + 12 = 92."
    ] },
    div: { title: "Dividing", points: [
      "Division is multiplication backwards. For 56 ÷ 7, ask: 7 × what = 56?",
      "Long division: Divide, Multiply, Subtract, Bring down, and repeat.",
      "Check: answer × the number you divided by = the starting number."
    ] },
    ratio: { title: "Ratios, rates and percents", points: [
      "A unit rate is the amount for 1: divide. $12 for 4 → $3 each.",
      "Percent means out of 100. Find 10% by dividing by 10, then build: 20% is double, 5% is half.",
      "Discount: find the percent, then subtract. Tax or tip: find the percent, then add.",
      "Proportional: y = kx, so k = y ÷ x. Slope = rise ÷ run = change in y ÷ change in x."
    ] },
    expr: { title: "Expressions and equations", points: [
      "Keep the equation balanced: whatever you do to one side, do to the other.",
      "Undo in reverse order: first undo + or −, then undo × or ÷. 3x + 5 = 20 → 3x = 15 → x = 5.",
      "Like terms combine: 4x + 7x − 2x = 9x. Distribute first: 2(x + 3) = 2x + 6.",
      "Check it: put your answer back in and see if both sides match."
    ] },
    numsys: { title: "Number system", points: [
      "Dividing by a fraction: keep, change, flip. 3/4 ÷ 1/8 = 3/4 × 8/1 = 6.",
      "Same signs multiply or divide to a positive; different signs give a negative.",
      "Exponents: 2⁵ = 2 × 2 × 2 × 2 × 2 = 32. A square root undoes squaring: √81 = 9.",
      "× 10³ moves the decimal point 3 places right: 4.2 × 10³ = 4,200."
    ] },
    geo: { title: "Geometry and data", points: [
      "Triangle area = ½ × base × height. Parallelogram = base × height.",
      "Circle: area = πr², circumference = 2πr. Angles in a triangle add to 180°.",
      "Pythagorean theorem: a² + b² = c² (3, 4, 5 is the classic right triangle).",
      "Mean = total ÷ how many. Median = the middle number in order."
    ] },
    fact: { title: "Fact fluency", points: [
      "Break big numbers apart: 23 × 14 = 23 × 10 + 23 × 4.",
      "Division is multiplication backwards: 96 ÷ 12 → 12 × what = 96?"
    ] },
    int: { title: "Negative numbers", points: [
      "Same signs when adding: add the sizes, keep the sign. −4 + −3 = −7.",
      "Different signs when adding: subtract the sizes, keep the sign of the bigger size. −9 + 4 = −5.",
      "Subtracting a negative is adding: 5 − (−3) = 5 + 3 = 8.",
      "× and ÷: same signs make a positive, different signs make a negative."
    ] }
  };

  const RULES = {
    cap: { title: "Capital letters", points: [
      "The first word of every sentence: The dog ran.",
      "The word I, always: Sam and I went.",
      "Names of people, pets, places, days, months, holidays: Maria, Texas, Friday, July.",
      "Important words in titles: Charlotte's Web."
    ] },
    punct: { title: "Punctuation", points: [
      "End marks: telling sentence → period (.), question → question mark (?), excitement → exclamation point (!).",
      "Contractions need an apostrophe where letters are missing: can't, it's (= it is), they're.",
      "Ownership: one owner → dog's bone. Many owners ending in s → girls' team.",
      "Commas: in lists (apples, oranges, and grapes), dates (July 4, 2025), city and state (Denver, Colorado), and before and/but/so joining two sentences.",
      "Quotes: the punctuation goes inside: \"Can I go?\" asked Maria."
    ] },
    spell: { title: "Spelling and sound-alike words", points: [
      "their (belongs to them), there (a place), they're (they are).",
      "your (belongs to you), you're (you are). its (belongs to it), it's (it is).",
      "to (direction), too (also / more than enough), two (2). than (compare), then (time).",
      "Sound it out slowly and look for double letters: dinner, letters, traffic."
    ] },
    grammar: { title: "Grammar", points: [
      "Match the verb: one → is / has / was. More than one → are / have / were.",
      "Use I as a subject (Sam and I went) and me after action words or to/for/between (gave it to Sam and me).",
      "Tricky past tense: go → went, run → ran, see → saw, make → made.",
      "Don't glue two sentences with only a comma. Use a period, or add and / but / so."
    ] }
  };

  return { math: math, TIPS: TIPS, RULES: RULES, num: num };
})();
