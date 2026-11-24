/* MATH TOPICS — 6th to 8th grade math (and 5th grade review for lower belts).
   Middle school math is no longer + − × ÷ drills. It moves into ratios and
   percents, expressions and equations, the number system (fractions, integers,
   exponents) and geometry and data, following the Common Core strands.

   Four strands (the same keys every grade, so grades can mix):
     ratio  : 6 ratios, unit rates, percent of · 7 proportions, percent change,
              discount, tax · 8 slope, lines and functions
     expr   : 6 evaluate, one-step equations · 7 two-step equations, like terms
              · 8 multi-step equations, distributing, tiny systems
     numsys : 6 fraction division, absolute value, opposites, GCF/LCM, order of
              operations · 7 integer + − × ÷ · 8 exponents, square roots,
              scientific notation
     geo    : 6 areas, mean, median · 7 circles, angle pairs, probability
              · 8 Pythagorean theorem, cylinder and cone volume
   Every answer is a whole number (positive or negative) so it fits the number
   pad. Items are sized for quick recall: about 20 to 60 seconds each.
   make(op, grade) -> { op, grade, text, say, answer, hints: [h1, h2], steps, key } */
window.BD = window.BD || {};

BD.MathTopics = (function () {
  const r = function (lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); };
  const pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  const n = function (v) { return v < 0 ? "−" + Math.abs(v) : String(v); };
  const p = function (v) { return v < 0 ? "(" + n(v) + ")" : n(v); };
  const gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; };
  const SUP = { 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶" };
  const STRANDS = ["ratio", "expr", "numsys", "geo"];
  /* Part names for the stripe tests, by grade. */
  const LABELS = {
    5: { ratio: "Fractions of numbers", expr: "Order of operations", numsys: "Decimals and place value", geo: "Volume and area" },
    6: { ratio: "Ratios and percents", expr: "Expressions and equations", numsys: "Fractions and integers", geo: "Geometry and data" },
    7: { ratio: "Proportions and percents", expr: "Equations and expressions", numsys: "Integers", geo: "Geometry and probability" },
    8: { ratio: "Lines and functions", expr: "Equations and systems", numsys: "Exponents and roots", geo: "Pythagoras and volume" }
  };

  function mk(text, answer, say, h1, h2, steps) { return { text: text, answer: answer, say: say, hints: [h1, h2], steps: steps }; }

  /* ================= 5th grade review (lower belts of 6th) ================= */
  const G5 = {
    ratio: function () {
      const d = pick([2, 3, 4, 5, 6, 8, 10]), k = r(2, 9), num = r(1, d - 1), whole = d * k;
      return mk(num + "/" + d + " of " + whole, num * k, num + " " + (d === 2 ? "half" : "over " + d) + " of " + whole,
        "Find 1/" + d + " first: divide " + whole + " by " + d + ".", "1/" + d + " of " + whole + " is " + k + ". Now take " + num + " of those.",
        ["1/" + d + " of " + whole + " = " + whole + " ÷ " + d + " = " + k + ".", num + " × " + k + " = " + (num * k) + "."]);
    },
    expr: function () {
      const a = r(2, 9), b = r(2, 9), c = r(2, 6);
      if (Math.random() < 0.5) return mk("(" + a + " + " + b + ") × " + c, (a + b) * c, "open parenthesis " + a + " plus " + b + " close parenthesis times " + c,
        "Parentheses first: " + a + " + " + b + ".", (a + b) + " × " + c + ".", ["Inside the parentheses: " + a + " + " + b + " = " + (a + b) + ".", (a + b) + " × " + c + " = " + ((a + b) * c) + "."]);
      return mk(a + " + " + b + " × " + c, a + b * c, a + " plus " + b + " times " + c,
        "Multiply before you add.", b + " × " + c + " = " + (b * c) + ". Now add " + a + ".", ["Multiply first: " + b + " × " + c + " = " + (b * c) + ".", a + " + " + (b * c) + " = " + (a + b * c) + "."]);
    },
    numsys: function () {
      const t = pick([10, 100]), v = r(11, 99) / 10;
      const ans = Math.round(v * t);
      return mk(v + " × " + t, ans, v + " times " + t, "Times " + t + " moves the decimal point " + (t === 10 ? "1 place" : "2 places") + " to the right.",
        "Slide the point: " + v + " becomes " + ans + ".", ["× " + t + ": move the decimal point " + (t === 10 ? "one" : "two") + " place" + (t === 10 ? "" : "s") + " right.", v + " × " + t + " = " + ans + "."]);
    },
    geo: function () {
      const l = r(2, 9), w = r(2, 6), h = r(2, 5);
      return mk("Volume of a box " + l + " by " + w + " by " + h, l * w * h, "volume of a box " + l + " by " + w + " by " + h,
        "Volume = length × width × height.", l + " × " + w + " = " + (l * w) + ". Now × " + h + ".", ["V = l × w × h.", l + " × " + w + " × " + h + " = " + (l * w * h) + "."]);
    }
  };

  /* ================= 6th grade ================= */
  const G6 = {
    ratio: function () {
      const t = r(0, 3);
      if (t === 0) { const each = r(2, 9), qty = r(3, 8), cost = each * qty;
        return mk("$" + cost + " for " + qty + " notebooks. Cost of 1 ($)", each, cost + " dollars for " + qty + " notebooks. What does one cost in dollars?",
          "A unit rate is the price for 1. Divide the cost by how many.", cost + " ÷ " + qty + ".", ["Unit rate = total ÷ number of items.", cost + " ÷ " + qty + " = " + each + " dollars each."]); }
      if (t === 1) { const pct = pick([10, 20, 25, 50, 75, 5, 40]), base = pct === 25 || pct === 75 ? 4 * r(2, 25) : pct === 5 ? 20 * r(1, 9) : 10 * r(2, 20);
        const ans = pct * base / 100;
        return mk(pct + "% of " + base, ans, pct + " percent of " + base,
          pct === 50 ? "50% is half." : pct === 25 ? "25% is one quarter: divide by 4." : pct === 75 ? "75% is three quarters." : "Find 10% first by dividing by 10.",
          pct === 10 ? "10% of " + base + " = " + (base / 10) + "." : pct === 5 ? "10% is " + (base / 10) + ", so 5% is half of that." : pct === 20 ? "10% is " + (base / 10) + ", so 20% is double." : pct === 40 ? "10% is " + (base / 10) + ", so 40% is 4 times that." : "One quarter of " + base + " is " + (base / 4) + ".",
          [pct + "% means " + pct + " out of 100.", pct + "/100 × " + base + " = " + ans + "."]); }
      if (t === 2) { const a = r(2, 6), b = r(2, 9), k = r(2, 6);
        return mk("Ratio " + a + " : " + b + " = " + (a * k) + " : ?", b * k, "the ratio " + a + " to " + b + " equals " + (a * k) + " to what?",
          "Equivalent ratios multiply both parts by the same number.", a + " became " + (a * k) + ", so it was multiplied by " + k + ".", [a + " × " + k + " = " + (a * k) + ", so multiply " + b + " by " + k + " too.", b + " × " + k + " = " + (b * k) + "."]); }
      const sp = r(4, 12), hrs = r(2, 6);
      return mk("A bike goes " + (sp * hrs) + " miles in " + hrs + " hours. Miles per hour", sp, "A bike goes " + (sp * hrs) + " miles in " + hrs + " hours. How many miles per hour?",
        "Per hour means for 1 hour: divide.", (sp * hrs) + " ÷ " + hrs + ".", ["Speed = distance ÷ time.", (sp * hrs) + " ÷ " + hrs + " = " + sp + " miles per hour."]);
    },
    expr: function () {
      const t = r(0, 3);
      if (t === 0) { const x = r(3, 30), a = r(3, 25);
        return mk("If x + " + a + " = " + (x + a) + ", then x", x, "If x plus " + a + " equals " + (x + a) + ", what is x?",
          "Undo adding " + a + " by subtracting " + a + " from both sides.", (x + a) + " − " + a + ".", ["x + " + a + " = " + (x + a) + ".", "Subtract " + a + " from both sides: x = " + x + "."]); }
      if (t === 1) { const x = r(2, 12), a = r(2, 9);
        return mk("If " + a + "x = " + (a * x) + ", then x", x, "If " + a + " x equals " + (a * x) + ", what is x?",
          a + "x means " + a + " times x. Undo it by dividing.", (a * x) + " ÷ " + a + ".", ["Divide both sides by " + a + ".", "x = " + (a * x) + " ÷ " + a + " = " + x + "."]); }
      if (t === 2) { const x = r(2, 9), a = r(2, 6), b = r(1, 12);
        return mk("If x = " + x + ", what is " + a + "x + " + b, a * x + b, "If x equals " + x + ", what is " + a + " x plus " + b + "?",
          "Put " + x + " in place of x.", a + " × " + x + " = " + (a * x) + ". Now add " + b + ".", ["Substitute: " + a + " × " + x + " + " + b + ".", (a * x) + " + " + b + " = " + (a * x + b) + "."]); }
      const x = r(12, 40), a = r(3, 11);
      return mk("If x − " + a + " = " + (x - a) + ", then x", x, "If x minus " + a + " equals " + (x - a) + ", what is x?",
        "Undo subtracting " + a + " by adding " + a + ".", (x - a) + " + " + a + ".", ["Add " + a + " to both sides.", "x = " + (x - a) + " + " + a + " = " + x + "."]);
    },
    numsys: function () {
      const t = r(0, 4);
      if (t === 0) { const w = r(2, 9), d = pick([2, 3, 4, 5]);
        return mk(w + " ÷ 1/" + d, w * d, w + " divided by one " + (d === 2 ? "half" : d === 4 ? "fourth" : "over " + d),
          "Dividing by a unit fraction: how many 1/" + d + "s fit in " + w + "?", "Each whole holds " + d + " of them. " + w + " × " + d + ".", ["Dividing by 1/" + d + " is the same as multiplying by " + d + ".", w + " × " + d + " = " + (w * d) + "."]); }
      if (t === 1) { const big = pick([[3, 4, 1, 8], [1, 2, 1, 6], [2, 3, 1, 9], [3, 5, 1, 10], [1, 2, 1, 4], [5, 6, 1, 12]]);
        const ans = (big[0] * big[3]) / (big[1] * big[2]);
        return mk(big[0] + "/" + big[1] + " ÷ " + big[2] + "/" + big[3], ans, big[0] + " over " + big[1] + " divided by " + big[2] + " over " + big[3],
          "Keep, change, flip: keep the first fraction, change ÷ to ×, flip the second.", big[0] + "/" + big[1] + " × " + big[3] + "/" + big[2] + ".", ["Flip the second fraction and multiply.", big[0] + " × " + big[3] + " = " + (big[0] * big[3]) + ", and " + big[1] + " × " + big[2] + " = " + (big[1] * big[2]) + ". " + (big[0] * big[3]) + " ÷ " + (big[1] * big[2]) + " = " + ans + "."]); }
      if (t === 2) { const v = r(3, 60) * (Math.random() < 0.6 ? -1 : 1);
        return Math.random() < 0.5
          ? mk("|" + n(v) + "|", Math.abs(v), "the absolute value of " + n(v), "Absolute value is the distance from 0 on the number line.", "Distance is never negative.", ["|" + n(v) + "| is how far " + n(v) + " is from 0.", "That distance is " + Math.abs(v) + "."])
          : mk("The opposite of " + n(v), -v, "the opposite of " + n(v), "Opposites are the same distance from 0 on opposite sides.", "Flip the sign of " + n(v) + ".", ["The opposite of a number has the other sign.", "The opposite of " + n(v) + " is " + n(-v) + "."]); }
      if (t === 3) { const g = pick([2, 3, 4, 5, 6, 8]), a = g * r(2, 6); let b = g * r(2, 7); if (b === a) b += g;
        if (Math.random() < 0.5) { const G = gcd(a, b);
          return mk("GCF of " + a + " and " + b, G, "the greatest common factor of " + a + " and " + b, "List the factors of the smaller number. Which is the biggest that also divides " + Math.max(a, b) + "?", "Try " + G + " or numbers near it.", ["Factors that divide both " + a + " and " + b + ": the biggest is " + G + "."]); }
        const A = r(2, 9), B = r(2, 9), L = A * B / gcd(A, B);
        return mk("LCM of " + A + " and " + B, L, "the least common multiple of " + A + " and " + B, "Count by " + Math.max(A, B) + " until you hit a multiple of " + Math.min(A, B) + ".", "Multiples of " + Math.max(A, B) + ": " + [1, 2, 3, 4].map(function (k) { return Math.max(A, B) * k; }).join(", ") + ", …", ["Smallest number both " + A + " and " + B + " go into: " + L + "."]); }
      const a = r(2, 9), b = r(2, 6), c = r(2, 5), d = r(1, Math.min(9, a + b * c - 1));
      return mk(a + " + " + b + " × " + c + " − " + d, a + b * c - d, a + " plus " + b + " times " + c + " minus " + d,
        "Order of operations: multiply before adding and subtracting.", b + " × " + c + " = " + (b * c) + ". Then go left to right.", [b + " × " + c + " = " + (b * c) + ".", a + " + " + (b * c) + " − " + d + " = " + (a + b * c - d) + "."]);
    },
    geo: function () {
      const t = r(0, 3);
      if (t === 0) { const b = 2 * r(2, 9), h = r(3, 12);
        return mk("Area of a triangle, base " + b + ", height " + h, b * h / 2, "the area of a triangle with base " + b + " and height " + h,
          "Triangle area = half of base × height.", b + " × " + h + " = " + (b * h) + ". Now take half.", ["A = ½ × b × h.", "½ × " + b + " × " + h + " = " + (b * h / 2) + "."]); }
      if (t === 1) { const b = r(3, 12), h = r(3, 12);
        return mk("Area of a parallelogram, base " + b + ", height " + h, b * h, "the area of a parallelogram with base " + b + " and height " + h,
          "Parallelogram area = base × height.", b + " × " + h + ".", ["A = b × h.", b + " × " + h + " = " + (b * h) + "."]); }
      if (t === 2) { const k = r(3, 5), m = r(4, 15), vals = [];
        for (let i = 0; i < k - 1; i++) vals.push(m + r(-4, 4));
        vals.push(m * k - vals.reduce(function (s, v) { return s + v; }, 0));
        if (vals.some(function (v) { return v < 0; })) return G6.geo();
        return mk("Mean of " + vals.join(", "), m, "the mean of " + vals.join(", "),
          "Mean: add them up, then divide by how many there are (" + k + ").", "The total is " + (m * k) + ".", ["Total: " + vals.join(" + ") + " = " + (m * k) + ".", (m * k) + " ÷ " + k + " = " + m + "."]); }
      const vals = []; for (let i = 0; i < 5; i++) vals.push(r(1, 30));
      const sorted = vals.slice().sort(function (a, b) { return a - b; });
      return mk("Median of " + vals.join(", "), sorted[2], "the median of " + vals.join(", "),
        "Median: put the numbers in order and find the middle one.", "In order: " + sorted.join(", ") + ".", ["Order them: " + sorted.join(", ") + ".", "The middle number is " + sorted[2] + "."]);
    }
  };

  /* ================= 7th grade ================= */
  const G7 = {
    ratio: function () {
      const t = r(0, 3);
      if (t === 0) { const price = 10 * r(2, 12), off = pick([10, 20, 25, 50]); const sale = price - price * off / 100;
        if (sale % 1) return G7.ratio();
        return mk("$" + price + " shirt, " + off + "% off. Sale price ($)", sale, "A " + price + " dollar shirt is " + off + " percent off. What is the sale price?",
          "Find " + off + "% of " + price + ", then subtract it.", off + "% of " + price + " = " + (price * off / 100) + ".", [off + "% of " + price + " = " + (price * off / 100) + ".", price + " − " + (price * off / 100) + " = " + sale + " dollars."]); }
      if (t === 1) { const price = 10 * r(2, 9), tax = pick([5, 10]); const total = price + price * tax / 100;
        if (total % 1) return G7.ratio();
        return mk("$" + price + " plus " + tax + "% tax. Total ($)", total, price + " dollars plus " + tax + " percent tax. What is the total?",
          "Find " + tax + "% of " + price + " and add it on.", tax + "% of " + price + " = " + (price * tax / 100) + ".", [tax + "% of " + price + " = " + (price * tax / 100) + ".", price + " + " + (price * tax / 100) + " = " + total + "."]); }
      if (t === 2) { const from = pick([20, 40, 50, 80, 25]), pct = pick([10, 20, 25, 50]) * (Math.random() < 0.7 ? 1 : -1); const to = from + from * pct / 100;
        if (to % 1) return G7.ratio();
        return mk("From " + from + " to " + to + ". Percent " + (pct > 0 ? "increase" : "decrease"), Math.abs(pct), "From " + from + " to " + to + ". What is the percent " + (pct > 0 ? "increase" : "decrease") + "?",
          "Percent change = change ÷ original × 100.", "The change is " + Math.abs(to - from) + ". Compare it to " + from + ".", ["Change: " + Math.abs(to - from) + ".", Math.abs(to - from) + " ÷ " + from + " = " + (Math.abs(pct) / 100) + " = " + Math.abs(pct) + "%."]); }
      const k = r(2, 9), x = r(2, 9);
      return mk("y is proportional to x. y = " + (k * x) + " when x = " + x + ". Constant k", k, "y is proportional to x. y is " + (k * x) + " when x is " + x + ". What is the constant k?",
        "In y = kx, k = y ÷ x.", (k * x) + " ÷ " + x + ".", ["k = y ÷ x.", (k * x) + " ÷ " + x + " = " + k + "."]);
    },
    expr: function () {
      const t = r(0, 2);
      if (t === 0) { const x = r(-6, 12), a = r(2, 7), b = r(-15, 20);
        if (x === 0) return G7.expr();
        const c = a * x + b;
        return mk("If " + a + "x " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + " = " + n(c) + ", then x", x, "If " + a + " x " + (b < 0 ? "minus " + Math.abs(b) : "plus " + b) + " equals " + n(c) + ", what is x?",
          "Two steps: undo the " + (b < 0 ? "subtraction" : "addition") + " first, then the multiplication.", (b < 0 ? "Add " + Math.abs(b) : "Subtract " + b) + " from both sides: " + a + "x = " + n(c - b) + ".", [a + "x = " + n(c) + " " + (b < 0 ? "+ " + Math.abs(b) : "− " + b) + " = " + n(c - b) + ".", "x = " + n(c - b) + " ÷ " + a + " = " + n(x) + "."]); }
      if (t === 1) { const a = r(3, 9), b = r(2, 9), c = r(2, Math.min(6, a + b - 2));
        return mk("Simplify " + a + "x + " + b + "x − " + c + "x. How many x", a + b - c, "Simplify " + a + " x plus " + b + " x minus " + c + " x. How many x's?",
          "Like terms: just combine the numbers in front of x.", a + " + " + b + " − " + c + ".", ["Combine the coefficients: " + a + " + " + b + " − " + c + " = " + (a + b - c) + ".", "So it is " + (a + b - c) + "x."]); }
      const x = r(2, 8), a = r(2, 5), b = r(1, 6);
      return mk("If x = " + n(-x) + ", what is " + a + "x + " + b, a * -x + b, "If x is negative " + x + ", what is " + a + " x plus " + b + "?",
        "Put " + n(-x) + " in for x. A positive times a negative is negative.", a + " × " + p(-x) + " = " + n(-a * x) + ". Now add " + b + ".", [a + " × " + p(-x) + " = " + n(-a * x) + ".", n(-a * x) + " + " + b + " = " + n(-a * x + b) + "."]);
    },
    numsys: function () {
      const t = r(0, 3);
      const nz = function (lo, hi) { let v; do { v = r(lo, hi); } while (v === 0); return v; };
      if (t === 0) { const a = nz(-12, 12), b = nz(-12, 12);
        if (a > 0 && b > 0) return G7.numsys();
        return mk(n(a) + " × " + p(b), a * b, n(a) + " times " + n(b), "Multiply the sizes. Same signs: positive. Different signs: negative.", Math.abs(a) + " × " + Math.abs(b) + " = " + Math.abs(a * b) + ". " + ((a < 0) === (b < 0) ? "Same signs." : "Different signs."), [Math.abs(a) + " × " + Math.abs(b) + " = " + Math.abs(a * b) + ".", ((a < 0) === (b < 0) ? "Same signs, so positive: " : "Different signs, so negative: ") + n(a * b) + "."]); }
      if (t === 1) { const q = nz(-12, 12), d = nz(-9, 9);
        if (q > 0 && d > 0) return G7.numsys();
        const a = q * d;
        return mk(n(a) + " ÷ " + p(d), q, n(a) + " divided by " + n(d), "Divide the sizes, then decide the sign.", Math.abs(a) + " ÷ " + Math.abs(d) + " = " + Math.abs(q) + ". " + ((a < 0) === (d < 0) ? "Same signs." : "Different signs."), [Math.abs(a) + " ÷ " + Math.abs(d) + " = " + Math.abs(q) + ".", ((a < 0) === (d < 0) ? "Same signs, so positive: " : "Different signs, so negative: ") + n(q) + "."]); }
      if (t === 2) { const a = nz(-40, 30), b = nz(-40, 40);
        if (a > 0 && b > 0) return G7.numsys();
        return mk(n(a) + " + " + p(b), a + b, n(a) + " plus " + n(b), (a < 0) === (b < 0) ? "Same signs: add the sizes and keep the sign." : "Different signs: subtract the sizes, keep the sign of the bigger size.", Math.abs(a) + " and " + Math.abs(b) + ".", ["Sizes: " + Math.abs(a) + " and " + Math.abs(b) + ".", "Answer: " + n(a + b) + "."]); }
      const a = nz(-20, 20), b = nz(-20, 20);
      if (b > 0) return mk(n(a) + " − " + b, a - b, n(a) + " minus " + b, "Subtracting moves left on the number line.", "Start at " + n(a) + " and go " + b + " to the left.", ["Think " + n(a) + " + " + p(-b) + ".", "Answer: " + n(a - b) + "."]);
      return mk(n(a) + " − " + p(b), a - b, n(a) + " minus " + n(b), "Subtracting a negative is adding.", n(a) + " − " + p(b) + " = " + n(a) + " + " + Math.abs(b) + ".", ["Change − (" + n(b) + ") to + " + Math.abs(b) + ".", n(a) + " + " + Math.abs(b) + " = " + n(a - b) + "."]);
    },
    geo: function () {
      const t = r(0, 3);
      if (t === 0) { const rad = r(2, 10);
        return Math.random() < 0.5
          ? mk("Circle with radius " + rad + ". Area = ?π", rad * rad, "A circle has radius " + rad + ". Its area is how many pi?", "Area of a circle = π × r × r.", rad + " × " + rad + " = " + (rad * rad) + ".", ["A = πr².", rad + "² = " + (rad * rad) + ", so the area is " + (rad * rad) + "π."])
          : mk("Circle with radius " + rad + ". Circumference = ?π", 2 * rad, "A circle has radius " + rad + ". Its circumference is how many pi?", "Circumference = 2 × π × r (or π × diameter).", "The diameter is " + (2 * rad) + ".", ["C = 2πr.", "2 × " + rad + " = " + (2 * rad) + ", so it is " + (2 * rad) + "π."]); }
      if (t === 1) { const sup = Math.random() < 0.5, a = sup ? r(20, 160) : r(10, 80);
        return mk((sup ? "Supplementary" : "Complementary") + " angle to " + a + "° (degrees)", (sup ? 180 : 90) - a, "What angle is " + (sup ? "supplementary" : "complementary") + " to " + a + " degrees?",
          sup ? "Supplementary angles add up to 180°." : "Complementary angles add up to 90°.", (sup ? 180 : 90) + " − " + a + ".", [(sup ? "180" : "90") + " − " + a + " = " + ((sup ? 180 : 90) - a) + "°."]); }
      if (t === 2) { const a = r(20, 80), b = r(20, 150 - a);
        return mk("A triangle has angles " + a + "° and " + b + "°. Third angle (degrees)", 180 - a - b, "A triangle has angles of " + a + " and " + b + " degrees. What is the third angle?",
          "A triangle's angles add up to 180°.", "180 − " + a + " − " + b + ".", [a + " + " + b + " = " + (a + b) + ".", "180 − " + (a + b) + " = " + (180 - a - b) + "°."]); }
      const tot = pick([4, 5, 10, 20]), red = r(1, tot - 1);
      return mk("A bag has " + red + " red and " + (tot - red) + " blue marbles. Chance of red (%)", red * 100 / tot, "A bag has " + red + " red and " + (tot - red) + " blue marbles. What is the chance of red, in percent?",
        "Probability = favorable ÷ total.", red + " out of " + tot + ". Turn it into a percent.", ["P(red) = " + red + "/" + tot + ".", red + "/" + tot + " = " + (red * 100 / tot) + "%."]);
    }
  };

  /* ================= 8th grade ================= */
  const G8 = {
    ratio: function () {
      const t = r(0, 3);
      if (t === 0) { const m = r(-4, 5) || 2, x1 = r(-3, 4), y1 = r(-6, 8), dx = r(1, 4), x2 = x1 + dx, y2 = y1 + m * dx;
        return mk("Slope of the line through (" + n(x1) + ", " + n(y1) + ") and (" + n(x2) + ", " + n(y2) + ")", m, "the slope of the line through " + n(x1) + " comma " + n(y1) + " and " + n(x2) + " comma " + n(y2),
          "Slope = rise ÷ run = (change in y) ÷ (change in x).", "Change in y: " + n(y2) + " − " + p(y1) + " = " + n(y2 - y1) + ". Change in x: " + dx + ".", ["Rise: " + n(y2 - y1) + ". Run: " + dx + ".", n(y2 - y1) + " ÷ " + dx + " = " + n(m) + "."]); }
      if (t === 1) { let m = r(-5, 6); if (m === 0 || m === 1) m = 3; const b = r(-9, 9), x = r(-4, 6), cm = m === -1 ? "−" : n(m);
        return mk("y = " + cm + "x " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + ". When x = " + n(x) + ", y", m * x + b, "y equals " + n(m) + " x " + (b < 0 ? "minus " + Math.abs(b) : "plus " + b) + ". When x is " + n(x) + ", what is y?",
          "Put " + n(x) + " in for x.", n(m) + " × " + p(x) + " = " + n(m * x) + ".", [n(m) + " × " + p(x) + " = " + n(m * x) + ".", n(m * x) + " " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + " = " + n(m * x + b) + "."]); }
      if (t === 2) { const m = r(2, 6), b = r(-8, 9), x = r(1, 5);
        return mk("The line y = mx " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + " passes through (" + x + ", " + n(m * x + b) + "). m", m, "The line y equals m x " + (b < 0 ? "minus " + Math.abs(b) : "plus " + b) + " passes through " + x + " comma " + n(m * x + b) + ". What is m?",
          "Put the point into the equation, then solve for m.", n(m * x + b) + " = m × " + x + " " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + ".", [(b < 0 ? "Add " + Math.abs(b) : "Subtract " + b) + ": " + (m * x) + " = " + x + "m.", "m = " + (m * x) + " ÷ " + x + " = " + m + "."]); }
      const a = r(2, 4), c = r(-6, 6), x = r(-3, 4);
      return mk("f(x) = " + a + "x² " + (c < 0 ? "− " + Math.abs(c) : "+ " + c) + ". f(" + n(x) + ")", a * x * x + c, "f of x equals " + a + " x squared " + (c < 0 ? "minus " + Math.abs(c) : "plus " + c) + ". What is f of " + n(x) + "?",
        "Square the input first: " + p(x) + "² = " + (x * x) + ".", a + " × " + (x * x) + " = " + (a * x * x) + ". Now " + (c < 0 ? "subtract " + Math.abs(c) : "add " + c) + ".", [p(x) + "² = " + (x * x) + ".", a + " × " + (x * x) + " " + (c < 0 ? "− " + Math.abs(c) : "+ " + c) + " = " + n(a * x * x + c) + "."]);
    },
    expr: function () {
      const t = r(0, 3);
      if (t === 0) { const x = r(1, 9) * (Math.random() < 0.3 ? -1 : 1), a = r(4, 9), c = r(2, a - 2), b = r(-10, 10), d = (a - c) * x + b;
        return mk("If " + a + "x " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + " = " + c + "x " + (d < 0 ? "− " + Math.abs(d) : "+ " + d) + ", then x", x,
          "If " + a + " x " + (b < 0 ? "minus " + Math.abs(b) : "plus " + b) + " equals " + c + " x " + (d < 0 ? "minus " + Math.abs(d) : "plus " + d) + ", what is x?",
          "Get the x terms on one side: subtract " + c + "x from both sides.", (a - c) + "x " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + " = " + n(d) + ".", ["Subtract " + c + "x: " + (a - c) + "x " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + " = " + n(d) + ".", (a - c) + "x = " + n(d - b) + ", so x = " + n(x) + "."]); }
      if (t === 1) { const a = r(2, 6), b = r(-5, 8), x = r(-4, 9), c = a * (x + b);
        return mk("If " + a + "(x " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + ") = " + n(c) + ", then x", x, "If " + a + " times the quantity x " + (b < 0 ? "minus " + Math.abs(b) : "plus " + b) + " equals " + n(c) + ", what is x?",
          "Divide both sides by " + a + " first (or distribute).", "x " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + " = " + n(c / a) + ".", ["Divide by " + a + ": x " + (b < 0 ? "− " + Math.abs(b) : "+ " + b) + " = " + n(c / a) + ".", "x = " + n(x) + "."]); }
      if (t === 2) { // a tiny system by substitution: y = x + b and y = a·x + d meet at x
        let x = r(-4, 6); if (x === 0) x = 2;
        const a = r(2, 5), b = r(1, 8) * (Math.random() < 0.3 ? -1 : 1), d = x + b - a * x, y = x + b;
        if (d === 0) return G8.expr();
        const sg = function (v) { return v < 0 ? "− " + Math.abs(v) : "+ " + v; }, sw = function (v) { return v < 0 ? "minus " + Math.abs(v) : "plus " + v; };
        return mk("y = x " + sg(b) + " and y = " + a + "x " + sg(d) + ". x", x, "y equals x " + sw(b) + " and y equals " + a + " x " + sw(d) + ". What is x?",
          "Both equal y, so set them equal: x " + sg(b) + " = " + a + "x " + sg(d) + ".", "Move the x's to one side: " + n(b - d) + " = " + (a - 1 === 1 ? "" : a - 1) + "x.",
          ["x " + sg(b) + " = " + a + "x " + sg(d) + ", so " + n(b - d) + " = " + (a - 1 === 1 ? "" : a - 1) + "x.", "x = " + n(x) + " (and y = " + n(y) + ")."]); }
      const a = r(2, 6), b = r(2, 9), c = r(2, 6), xs = r(2, 5);
      return mk("Simplify " + a + "(x + " + b + ") + " + c + "x. How many x", a + c, "Simplify " + a + " times the quantity x plus " + b + ", plus " + c + " x. How many x's?",
        "Distribute first: " + a + " × x and " + a + " × " + b + ".", a + "x + " + (a * b) + " + " + c + "x. Combine the x terms.", ["Distribute: " + a + "x + " + (a * b) + ".", "Add " + c + "x: " + (a + c) + "x + " + (a * b) + "."]);
    },
    numsys: function () {
      const t = r(0, 3);
      if (t === 0) { const b = r(2, 5), e = b <= 3 ? r(3, 5) : r(2, 3);
        return mk(b + SUP[e], Math.pow(b, e), b + " to the power of " + e, "An exponent says how many times to multiply the base by itself.", Array(e).fill(b).join(" × ") + ".", [Array(e).fill(b).join(" × ") + " = " + Math.pow(b, e) + "."]); }
      if (t === 1) { const s = r(4, 15);
        return Math.random() < 0.6
          ? mk("√" + (s * s), s, "the square root of " + (s * s), "Which number times itself is " + (s * s) + "?", "It's between " + Math.floor(s / 5) * 5 + " and " + (Math.floor(s / 5) * 5 + 5) + ".", [s + " × " + s + " = " + (s * s) + ", so √" + (s * s) + " = " + s + "."])
          : (function () { const a = r(2, 9), b = r(2, 9); return mk(a + "² + " + b + "²", a * a + b * b, a + " squared plus " + b + " squared", "Square each number first.", a + "² = " + (a * a) + ".", [a + "² = " + (a * a) + " and " + b + "² = " + (b * b) + ".", (a * a) + " + " + (b * b) + " = " + (a * a + b * b) + "."]); })(); }
      if (t === 2) { const m = r(11, 99) / 10, e = r(2, 4), ans = Math.round(m * Math.pow(10, e));
        return mk(m + " × 10" + SUP[e], ans, m + " times 10 to the " + e, "× 10" + SUP[e] + " moves the decimal point " + e + " places right.", m + " → " + ans + ".", ["Move the decimal point " + e + " places to the right.", m + " × 10" + SUP[e] + " = " + ans + "."]); }
      const m = r(11, 99), e = r(3, 5), val = m * Math.pow(10, e - 1);
      return mk(val.toLocaleString("en-US") + " = " + (m / 10) + " × 10 to what power", e, val.toLocaleString("en-US") + " equals " + (m / 10) + " times 10 to what power?",
        "Count how many places the decimal point moves to get from " + (m / 10) + " to " + val.toLocaleString("en-US") + ".", "Each place is one power of 10.", [(m / 10) + " needs the point moved " + e + " places right.", "So it's 10" + SUP[e] + "."]);
    },
    geo: function () {
      const t = r(0, 3);
      const trip = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20]]);
      if (t === 0) return mk("Right triangle, legs " + trip[0] + " and " + trip[1] + ". Hypotenuse", trip[2], "A right triangle has legs " + trip[0] + " and " + trip[1] + ". How long is the hypotenuse?",
        "Pythagorean theorem: a² + b² = c².", trip[0] + "² + " + trip[1] + "² = " + (trip[0] * trip[0] + trip[1] * trip[1]) + ". Take the square root.", [trip[0] + "² + " + trip[1] + "² = " + (trip[0] * trip[0]) + " + " + (trip[1] * trip[1]) + " = " + (trip[2] * trip[2]) + ".", "√" + (trip[2] * trip[2]) + " = " + trip[2] + "."]);
      if (t === 1) return mk("Right triangle, hypotenuse " + trip[2] + ", one leg " + trip[0] + ". Other leg", trip[1], "A right triangle has hypotenuse " + trip[2] + " and one leg " + trip[0] + ". How long is the other leg?",
        "a² + b² = c², so b² = c² − a².", (trip[2] * trip[2]) + " − " + (trip[0] * trip[0]) + " = " + (trip[1] * trip[1]) + ".", [trip[2] + "² − " + trip[0] + "² = " + (trip[1] * trip[1]) + ".", "√" + (trip[1] * trip[1]) + " = " + trip[1] + "."]);
      if (t === 2) { const rad = r(2, 6), h = r(2, 10);
        return mk("Cylinder, radius " + rad + ", height " + h + ". Volume = ?π", rad * rad * h, "A cylinder has radius " + rad + " and height " + h + ". Its volume is how many pi?",
          "Cylinder volume = π × r² × h.", rad + "² = " + (rad * rad) + ". Now × " + h + ".", ["V = πr²h.", (rad * rad) + " × " + h + " = " + (rad * rad * h) + ", so " + (rad * rad * h) + "π."]); }
      const rad = r(2, 6), h = 3 * r(1, 4);
      return mk("Cone, radius " + rad + ", height " + h + ". Volume = ?π", rad * rad * h / 3, "A cone has radius " + rad + " and height " + h + ". Its volume is how many pi?",
        "Cone volume = ⅓ × π × r² × h.", rad + "² × " + h + " = " + (rad * rad * h) + ". Now take one third.", ["V = ⅓πr²h.", (rad * rad * h) + " ÷ 3 = " + (rad * rad * h / 3) + ", so " + (rad * rad * h / 3) + "π."]);
    }
  };

  /* Fact fluency warm-up for 6th to 8th (a small share of practice only). */
  function fact(grade) {
    if (grade <= 6) {
      if (Math.random() < 0.5) { const a = r(12, 25), b = r(11, 19); return mk(a + " × " + b, a * b, a + " times " + b, "Break it apart: " + a + " × 10 + " + a + " × " + (b - 10) + ".", (a * 10) + " + " + (a * (b - 10)) + ".", [a + " × 10 = " + (a * 10) + ".", a + " × " + (b - 10) + " = " + (a * (b - 10)) + ".", (a * 10) + " + " + (a * (b - 10)) + " = " + (a * b) + "."]); }
      const d = r(11, 25), q = r(3, 15); return mk((d * q) + " ÷ " + d, q, (d * q) + " divided by " + d, "Think: " + d + " × what = " + (d * q) + "?", "Try " + d + " × 10 = " + (d * 10) + " first.", [d + " × " + q + " = " + (d * q) + ", so the answer is " + q + "."]);
    }
    return G7.numsys();
  }

  const BY = { 5: G5, 6: G6, 7: G7, 8: G8 };
  function make(op, grade) {
    grade = Math.max(5, Math.min(8, Number(grade)));
    let it;
    for (let k = 0; k < 8; k++) { // retry the rare non-whole result, and too-easy look-alikes like −37 + (−37)
      it = op === "fact" ? fact(grade) : (BY[grade][op] || BY[grade].ratio)();
      const same = /^(−?)(\d+) [+−×÷] \(?−?(\d+)\)?$/.exec(it ? it.text : "");
      if (same && same[2] === same[3]) continue;
      if (it && Number.isInteger(it.answer) && Math.abs(it.answer) < 1000000) break;
    }
    it.op = op; it.grade = grade; it.key = it.text;
    return it;
  }
  function label(op, grade) { const L = LABELS[Math.max(5, Math.min(8, Number(grade)))] || LABELS[6]; return op === "fact" ? "Fact fluency" : L[op] || op; }
  return { make: make, label: label, STRANDS: STRANDS, LABELS: LABELS };
})();
