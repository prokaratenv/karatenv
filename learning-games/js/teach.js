/* TEACH ME — short, visual math lessons built from the problem on screen.
   BD.Teach.topicOf(problem) -> lesson id for any problem the math games make
   BD.Teach.open(problem, { grade, key, onDone }) -> step-by-step lesson sheet:
     1. The big idea (one sentence)
     2. A worked example that uses the problem's own numbers when it can
     3. "Your turn": one easy question of the same kind, then back to the problem
   BD.Teach.button(extraClass) -> the "Teach me" button markup
   Never shown inside stripe tests or degree tests (those stay hint-free);
   missed test problems get Teach me on the results screen instead.
   Parents see which lessons were used this week (p.teach). */
window.BD = window.BD || {};

BD.Teach = (function () {
  const esc = function (s) { return BD.UI.esc(s); };
  const $ = function (id) { return document.getElementById(id); };
  const n = function (v) { return v < 0 ? "−" + Math.abs(v) : String(v); };
  const fmt = function (v) { return n(v).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
  /* every number in a problem's text, in order (handles −, commas and decimals) */
  function nums(t) { return (String(t).replace(/,(?=\d{3})/g, "").replace(/−/g, "-").match(/-?\d+(\.\d+)?/g) || []).map(Number); }

  /* ================= lessons ================= */
  const L = {
    "mean": { title: "Mean (average)", idea: "The mean is the fair share: add them all up, then divide by how many numbers there are." },
    "median": { title: "Median", idea: "The median is the middle number. Put the numbers in order, then find the one in the middle." },
    "counting": { title: "Counting on", idea: "The number after is one more. Say the number, then count one more." },
    "compare": { title: "Bigger and smaller", idea: "The bigger number has more. Compare the tens first, then the ones." },
    "add-small": { title: "Adding small numbers", idea: "Adding puts groups together. Start with the bigger number and count up." },
    "add": { title: "Adding", idea: "Adding puts numbers together. Line up the places and add the ones first." },
    "add-regroup": { title: "Adding with regrouping", idea: "When a column makes 10 or more, write the ones and carry the ten to the next column." },
    "sub": { title: "Subtracting", idea: "Subtracting takes away. Start with the ones column and work left." },
    "sub-borrow": { title: "Subtracting with borrowing", idea: "If the top digit is too small, borrow 1 from the next column. It is worth 10 here." },
    "missing": { title: "Missing number", idea: "A missing addend is how far you count up from the first number to reach the total." },
    "mul-facts": { title: "Multiplication facts", idea: "Multiplying is adding equal groups. Use a fact you know to find one you don't." },
    "mul-multi": { title: "Multiplying bigger numbers", idea: "Break the big number into tens and ones, multiply each part, then add." },
    "div-facts": { title: "Division facts", idea: "Division is sharing into equal groups. Ask: what times the divisor makes the total?" },
    "div-long": { title: "Long division", idea: "Divide, multiply, subtract, bring down. Repeat until every digit is used." },
    "integers": { title: "Positive and negative numbers", idea: "Think of a number line: adding a negative moves left, subtracting a negative moves right." },
    "arrays": { title: "Rows and columns", idea: "Rows of equal size: add the row again and again, or multiply rows × how many in each." },
    "skip": { title: "Skip counting", idea: "Skip counting adds the same number each time. Find the jump, then keep jumping." },
    "place": { title: "Place value", idea: "Each digit's place tells its value: ones, tens, hundreds, thousands." },
    "rounding": { title: "Rounding", idea: "Find the two round numbers it sits between. Look at the digit to the right: 5 or more rounds up, 4 or less rounds down." },
    "money": { title: "Counting money", idea: "Quarter = 25¢, dime = 10¢, nickel = 5¢, penny = 1¢. Count the biggest coins first." },
    "time": { title: "Telling time", idea: "The short hand shows the hour. The long hand shows minutes: count by 5s for each number." },
    "measure": { title: "Changing units", idea: "Know how many small units are in 1 big unit, then multiply by how many big units." },
    "perimeter": { title: "Perimeter", idea: "Perimeter is the distance all the way around. Add every side." },
    "area": { title: "Area", idea: "Area is how many squares cover a shape. For a rectangle: length × width." },
    "area-shapes": { title: "Area of triangles and parallelograms", idea: "A parallelogram is base × height. A triangle is half of a parallelogram: ½ × base × height." },
    "volume": { title: "Volume", idea: "Volume is how many cubes fill a box: length × width × height." },
    "volume-round": { title: "Cylinders and cones", idea: "Cylinder volume = π × r² × h. A cone holds one third of that." },
    "shapes": { title: "Shapes and corners", idea: "Count the corners where two sides meet. A triangle has 3, a square has 4." },
    "angles": { title: "Angles", idea: "A right angle is 90°, a straight line is 180°, a triangle's angles add to 180°." },
    "fraction-parts": { title: "Fraction parts", idea: "The bottom number tells how many equal parts make one whole." },
    "fraction-equiv": { title: "Equivalent fractions", idea: "Multiply the top and bottom by the same number. The fraction keeps the same size." },
    "fraction-add": { title: "Adding fractions", idea: "Make the bottoms match, then add the tops. The bottom stays the same." },
    "fraction-mul": { title: "Multiplying fractions", idea: "Whole number × fraction: multiply the top. The bottom stays the same." },
    "fraction-of": { title: "A fraction of a number", idea: "Divide by the bottom number to find one part, then multiply by the top number." },
    "fraction-div": { title: "Dividing fractions", idea: "Keep, change, flip: keep the first number, change ÷ to ×, flip the second fraction." },
    "decimals": { title: "Decimals", idea: "Decimals are tenths and hundredths. Line up the decimal points. × 10 moves the point one place right." },
    "multiples": { title: "Multiples", idea: "Multiples are what you get when you count by a number: 4, 8, 12, 16…" },
    "gcf-lcm": { title: "GCF and LCM", idea: "GCF is the biggest number that divides both. LCM is the smallest number both divide into." },
    "order-ops": { title: "Order of operations", idea: "Parentheses first, then × and ÷, then + and −, left to right." },
    "exponents": { title: "Exponents", idea: "The small number tells how many times to multiply the base by itself." },
    "roots": { title: "Square roots", idea: "A square root asks: what number times itself makes this?" },
    "scientific": { title: "Scientific notation", idea: "Count how many places the decimal point moves. That count is the power of 10." },
    "absolute": { title: "Absolute value", idea: "Absolute value is the distance from 0. Distance is never negative." },
    "opposites": { title: "Opposites", idea: "Opposites are the same distance from 0 on different sides: 7 and −7." },
    "percent": { title: "Percent of a number", idea: "Percent means out of 100. Find 10% by dividing by 10, then build from there." },
    "percent-money": { title: "Discounts and tax", idea: "Find the percent of the price. Take it off for a discount, add it on for tax." },
    "percent-change": { title: "Percent change", idea: "Change ÷ starting amount, then × 100." },
    "unit-rate": { title: "Unit rates", idea: "A unit rate is the amount for 1. Divide the total by how many." },
    "ratios": { title: "Ratios", idea: "Equivalent ratios multiply both parts by the same number." },
    "proportional": { title: "Proportional relationships", idea: "When y is proportional to x, y = k × x. Find k by dividing y by x." },
    "probability": { title: "Probability", idea: "Chance = the ways you want ÷ all the ways. × 100 to make a percent." },
    "evaluate": { title: "Evaluating expressions", idea: "Put the number in place of the letter, then follow the order of operations." },
    "eq-one": { title: "One-step equations", idea: "Do the opposite operation to both sides to get x by itself." },
    "eq-two": { title: "Two-step equations", idea: "Undo adding or subtracting first, then undo multiplying." },
    "eq-multi": { title: "Multi-step equations", idea: "Distribute, collect the x's on one side, then solve like a two-step equation." },
    "like-terms": { title: "Combining like terms", idea: "Add or subtract the numbers in front of x. x's go with x's." },
    "functions": { title: "Functions", idea: "A function is a rule. Put the input in for x and work it out." },
    "linear": { title: "Lines: y = mx + b", idea: "m is the slope (steepness), b is where the line crosses the y-axis. Plug in x to find y." },
    "slope": { title: "Slope", idea: "Slope = rise ÷ run: change in y divided by change in x." },
    "systems": { title: "Systems of equations", idea: "Both equations equal y, so set them equal to each other and solve for x." },
    "circles": { title: "Circles", idea: "Circumference = 2πr. Area = πr². Leave π as π when the answer asks for ?π." },
    "pythagorean": { title: "The Pythagorean theorem", idea: "In a right triangle, a² + b² = c². The hypotenuse c is the longest side." }
  };
  const has = function (id) { return !!L[id]; };

  /* ================= which lesson fits this problem ================= */
  function topicOf(q) {
    if (!q) return null;
    const t = q.text || "";
    if (t) {
      // a plain "a op b" written as text (fact warm-ups, integer drills): classify like a number problem
      const pm = t.replace(/−/g, "-").match(/^(-?\d+) ([+\-×÷]) \(?(-?\d+)\)?$/);
      if (pm) { const o = { "+": "add", "-": "sub", "×": "mul", "÷": "div" }[pm[2]]; return topicOf({ op: o, a: Number(pm[1]), b: Number(pm[3]), answer: q.answer }); }
      if (/^\d+(\.\d+)? × 10+$/.test(t)) return "decimals";
      const eq = t.match(/^If (.+?), then x$/);
      if (eq) { const e = eq[1]; return /\(/.test(e) || (e.match(/x/g) || []).length > 1 ? "eq-multi" : /^\d+x [+−] \d+ =/.test(e) ? "eq-two" : "eq-one"; }
      const R = [
        [/^Mean of/, "mean"], [/^Median of/, "median"], [/^Round /, "rounding"], [/\(cents\)/, "money"],
        [/hand|Minutes after the hour|^Starts at/, "time"], [/^Perimeter/, "perimeter"],
        [/^Area of a (triangle|parallelogram)/, "area-shapes"], [/^Area of a|rectangle has area/, "area"],
        [/^Volume of a box/, "volume"], [/^(Cylinder|Cone)/, "volume-round"], [/^Circle with radius/, "circles"],
        [/[Hh]ypotenuse|leg|²\s*\+\s*\d+²/, "pythagorean"], [/angle|°/, "angles"], [/^Corners on/, "shapes"],
        [/^Equal parts in|in one whole$/, "fraction-parts"], [/^0\.\d+ = \?\/100/, "decimals"],
        [/\d\/\d+ of \d/, "fraction-of"], [/÷ \d+\/\d+/, "fraction-div"], [/× \d+\/\d+ = \?/, "fraction-mul"],
        [/\d\/\d+ \+ \d+\/\d+/, "fraction-add"], [/\d\/\d+ = \?\/\d+/, "fraction-equiv"],
        [/to what power/, "scientific"], [/√/, "roots"], [/to the power of|[²³⁴⁵⁶]/, "exponents"], [/\d\.\d/, "decimals"],
        [/^From .*Percent (in|de)crease/, "percent-change"], [/tax|% off/, "percent-money"], [/marbles/, "probability"], [/% of /, "percent"],
        [/Cost of 1|Miles per hour/, "unit-rate"], [/^Ratio /, "ratios"], [/proportional/, "proportional"],
        [/^Slope/, "slope"], [/ and y = /, "systems"], [/y = mx|^y = /, "linear"], [/^f\(x\)/, "functions"], [/^Simplify/, "like-terms"],
        [/^If x = −?\d+, what is/, "evaluate"],
        [/^(GCF|LCM)/, "gcf-lcm"], [/^\|/, "absolute"], [/^The opposite/, "opposites"],
        [/hundreds, .*tens|tens and \d+ ones|digit in|more than \d/, "place"], [/^(Skip count|Count by)/, "skip"],
        [/Missing number/, "missing"], [/rows of/, "arrays"], [/multiple of/, "multiples"],
        [/^(Inches|Feet|Minutes|Ounces|Centimeters|Grams|Milliliters) in/, "measure"],
        [/^The number after/, "counting"], [/^The bigger number/, "compare"], [/^\d+ and \d+ more/, "add-small"],
        [/\(|\d+ [+−] \d+ × \d+/, "order-ops"]
      ];
      for (let i = 0; i < R.length; i++) if (R[i][0].test(t)) return R[i][1];
      return null;
    }
    const a = q.a, b = q.b, ans = q.answer;
    if (a < 0 || b < 0 || ans < 0) return "integers";
    if (q.op === "add") { if (a <= 10 && b <= 10) return a + b > 10 ? "add-regroup" : "add-small"; return carries(a, b) ? "add-regroup" : "add"; }
    if (q.op === "sub") return borrows(a, b) ? "sub-borrow" : "sub";
    if (q.op === "mul") return a <= 12 && b <= 12 ? "mul-facts" : "mul-multi";
    if (q.op === "div") return b <= 12 && ans <= 12 ? "div-facts" : "div-long";
    return null;
  }
  function carries(a, b) { while (a > 0 || b > 0) { if (a % 10 + b % 10 >= 10) return true; a = Math.floor(a / 10); b = Math.floor(b / 10); } return false; }
  function borrows(a, b) { while (b > 0) { if (a % 10 < b % 10) return true; a = Math.floor(a / 10); b = Math.floor(b / 10); } return false; }

  /* ================= worked steps (from the problem's own numbers) ================= */
  const chip = function (v, cls) { return '<span class="tm-chip' + (cls ? " " + cls : "") + '">' + esc(fmt(v)) + '</span>'; };
  function stepsFor(id, q) {
    const v = nums(q.text || "");
    if (id === "mean" && v.length >= 3) {
      const tot = v.reduce(function (s, x) { return s + x; }, 0), k = v.length;
      return [
        { text: "Here are the numbers. The mean is the fair share: what each would be if they were evened out.", html: '<div class="tm-row">' + v.map(function (x) { return chip(x); }).join("") + '</div>' },
        { text: "Step 1: Add them all up. " + v.join(" + ") + " = " + tot + ".", html: '<div class="tm-row">' + v.map(function (x) { return chip(x); }).join('<b>+</b>') + '<b>=</b>' + chip(tot, "gold") + '</div>' },
        { text: "Step 2: Count how many numbers there are: " + k + ".", html: '<div class="tm-row">' + v.map(function (x, i) { return '<span class="tm-chip"><small>' + (i + 1) + '</small>' + x + '</span>'; }).join("") + '</div>' },
        { text: "Step 3: Divide the total by how many. " + tot + " ÷ " + k + " = " + (tot / k) + ". The mean is " + (tot / k) + ".", html: '<div class="tm-row">' + chip(tot) + '<b>÷</b>' + chip(k) + '<b>=</b>' + chip(tot / k, "gold big") + '</div>' }
      ];
    }
    if (id === "median" && v.length >= 3) {
      const s = v.slice().sort(function (x, y) { return x - y; }), k = s.length, mid = Math.floor(k / 2);
      const row = function (cross, circle) { return '<div class="tm-row">' + s.map(function (x, i) { const out = i < cross || i >= k - cross; return chip(x, (out ? "out" : "") + (circle && i === mid ? " gold big" : "")); }).join("") + '</div>'; };
      const out = [
        { text: "Here are the numbers. The median is the middle number once they're in order.", html: '<div class="tm-row">' + v.map(function (x) { return chip(x); }).join("") + '</div>' },
        { text: "Step 1: Put them in order from smallest to biggest: " + s.join(", ") + ".", html: row(0, false) }
      ];
      for (let c = 1; c <= mid; c++) out.push({ text: "Step " + (c + 1) + ": Cross off one number from each end.", html: row(c, false) });
      out.push({ text: "The one left in the middle is the median: " + s[mid] + ".", html: row(mid, true) });
      return out;
    }
    if (id === "rounding" && v.length >= 2) {
      const x = v[0], t = v[1], lo = Math.floor(x / t) * t, hi = lo + t, d = Math.floor((x % t) / (t / 10)), up = x - lo >= t / 2, ans = up ? hi : lo;
      const place = t === 10 ? "ones" : t === 100 ? "tens" : t === 1000 ? "hundreds" : "next";
      return [
        { text: "Round " + fmt(x) + " to the nearest " + fmt(t) + ". First find the two round numbers it sits between: " + fmt(lo) + " and " + fmt(hi) + ".", html: numberLine(lo, hi, x, null) },
        { text: "Halfway between them is " + fmt(lo + t / 2) + ". Look at the " + place + " digit: it is " + d + ".", html: numberLine(lo, hi, x, lo + t / 2) },
        { text: d >= 5 ? d + " is 5 or more, so round up to " + fmt(hi) + "." : d + " is 4 or less, so round down to " + fmt(lo) + ".", html: numberLine(lo, hi, x, lo + t / 2, ans) },
        { text: fmt(x) + " rounded to the nearest " + fmt(t) + " is " + fmt(ans) + ".", html: '<div class="tm-row">' + chip(x) + '<b>≈</b>' + chip(ans, "gold big") + '</div>' }
      ];
    }
    if (id === "place" && /digit in/.test(q.text || "") && v.length) {
      const x = v[v.length - 1], ds = String(Math.abs(x)).split(""), names = ["ones", "tens", "hundreds", "thousands", "ten thousands"];
      const want = (q.text.match(/The (.+?) digit/) || [])[1];
      const cols = ds.map(function (dg, i) { const nm = names[ds.length - 1 - i]; return '<span class="tm-pv' + (nm === want ? " on" : "") + '"><small>' + esc(nm) + '</small><b>' + dg + '</b></span>'; }).join("");
      return [
        { text: "Write each digit under its place. From the right: ones, tens, hundreds, thousands.", html: '<div class="tm-row">' + cols.replace(/ on"/g, '"') + '</div>' },
        { text: "Find the " + want + " place. The digit there is " + q.answer + ".", html: '<div class="tm-row">' + cols + '</div>' }
      ];
    }
    if (id === "money") {
      const coins = { quarter: 25, dime: 10, nickel: 5, penn: 1 }, parts = [], t = q.text;
      Object.keys(coins).forEach(function (c) { const m = t.match(new RegExp("(\\d+) " + c)); if (m) parts.push([Number(m[1]), c, coins[c]]); });
      let run = 0;
      const out = [{ text: "Quarter = 25¢, dime = 10¢, nickel = 5¢, penny = 1¢. Start with the biggest coins.", html: '<div class="tm-row">' + parts.map(function (p) { return '<span class="tm-chip">' + p[0] + ' × ' + p[2] + '¢</span>'; }).join("") + '</div>' }];
      parts.forEach(function (p) { run += p[0] * p[2]; out.push({ text: p[0] + " " + (p[1] === "penn" ? (p[0] > 1 ? "pennies" : "penny") : p[1] + (p[0] > 1 ? "s" : "")) + " = " + (p[0] * p[2]) + "¢. Running total: " + run + "¢.", html: '<div class="tm-row">' + chip(run + "¢", "gold") + '</div>' }); });
      return out;
    }
    if (id === "area" && /^Area of a \d+ by \d+/.test(q.text || "") && v.length >= 2) {
      const l = v[0], w = v[1];
      return [
        { text: "Area counts the squares inside. This rectangle is " + l + " long and " + w + " wide.", html: grid(l, w) },
        { text: "There are " + w + " rows with " + l + " squares in each row. " + l + " × " + w + " = " + (l * w) + " square units.", html: grid(l, w, true) }
      ];
    }
    if (id === "integers" && !q.text && q.op) return lineSteps(q).concat([{ text: "So " + BD.MathGame.show(q) + " = " + n(q.answer) + "." }]);
    // everything else: the problem's own worked steps
    const base = (q.steps && q.steps.length ? q.steps : (BD.Explain && !q.text ? BD.Explain.math(q) : (q.hints || [])));
    const out = base.filter(Boolean).map(function (s) { return { text: s }; });
    if (!out.length || !/=/.test(out[out.length - 1].text) || out[out.length - 1].text.indexOf(fmt(q.answer)) === -1) out.push({ text: "So the answer is " + fmt(q.answer) + "." });
    return out;
  }
  function lineSteps(q) {
    const a = q.a, b = q.b;
    if (q.op === "mul" || q.op === "div") return [{ text: "Do the numbers without signs first: " + Math.abs(a) + " " + (q.op === "mul" ? "×" : "÷") + " " + Math.abs(b) + " = " + Math.abs(q.answer) + "." },
      { text: "Same signs make a positive answer. Different signs make a negative answer." }];
    const move = q.op === "add" ? b : -b;
    return [{ text: "Start at " + n(a) + " on the number line.", html: numberLine(Math.min(a, a + move) - 2, Math.max(a, a + move) + 2, a, null) },
      { text: (q.op === "sub" ? "Subtracting " + n(b) + " is the same as adding " + n(-b) + ". " : "") + (move < 0 ? "Move " + Math.abs(move) + " to the left." : "Move " + move + " to the right."), html: numberLine(Math.min(a, a + move) - 2, Math.max(a, a + move) + 2, a, null, a + move) }];
  }
  /* a number line from lo to hi with the number marked, an optional halfway tick and an optional landing spot */
  function numberLine(lo, hi, x, half, land) {
    const W = 300, P = 20, sx = function (v) { return P + (W - 2 * P) * (v - lo) / Math.max(1, hi - lo); };
    let s = '<svg class="tm-line" viewBox="0 0 ' + W + ' 80" role="img" aria-label="number line from ' + lo + ' to ' + hi + '">' +
      '<line x1="' + P + '" y1="44" x2="' + (W - P) + '" y2="44" stroke="currentColor" stroke-width="3"/>' +
      [lo, hi].map(function (v) { return '<line x1="' + sx(v) + '" y1="34" x2="' + sx(v) + '" y2="54" stroke="currentColor" stroke-width="3"/><text x="' + sx(v) + '" y="74" text-anchor="middle" font-size="14" fill="currentColor">' + fmt(v) + '</text>'; }).join("");
    if (half !== null && half !== undefined) s += '<line x1="' + sx(half) + '" y1="38" x2="' + sx(half) + '" y2="50" stroke="#E0BA77" stroke-width="2" stroke-dasharray="3 2"/><text x="' + sx(half) + '" y="74" text-anchor="middle" font-size="11" fill="#E0BA77">half ' + fmt(half) + '</text>';
    s += '<circle cx="' + sx(x) + '" cy="44" r="7" fill="#5CBFC1"/><text x="' + sx(x) + '" y="24" text-anchor="middle" font-size="14" font-weight="800" fill="#5CBFC1">' + fmt(x) + '</text>';
    if (land !== undefined && land !== null) s += '<path d="M' + sx(x) + ' 36 Q' + ((sx(x) + sx(land)) / 2) + ' 6 ' + sx(land) + ' 36" fill="none" stroke="#65D94A" stroke-width="3"/><circle cx="' + sx(land) + '" cy="44" r="7" fill="#65D94A"/>';
    return s + '</svg>';
  }
  function grid(l, w, nums2) {
    const c = Math.min(l, 12), r = Math.min(w, 12); let h = '<div class="tm-grid" style="grid-template-columns:repeat(' + c + ',1fr)">';
    for (let i = 0; i < r * c; i++) h += '<i>' + (nums2 && i % c === c - 1 ? Math.floor(i / c) * c + c : "") + '</i>';
    return h + '</div>' + (l > 12 || w > 12 ? '<p class="muted small">(Shown smaller: the real one is ' + l + ' by ' + w + '.)</p>' : '');
  }

  /* ================= your turn: an easy problem of the same kind ================= */
  function practiceFor(id, q) {
    const g = Number(q.grade !== undefined ? q.grade : 3);
    for (let k = 0; k < 400; k++) {
      let c = null;
      try {
        if (q.text && BD.MathTopics && q.op && BD.MathTopics.STRANDS.indexOf(q.op) !== -1 && !q.strand) c = BD.MathTopics.make(q.op, Math.max(5, g));
        else if (q.strand && BD.MathTopics) c = BD.MathTopics.elem(q.op, g);
        else c = BD.MathGame.makeProblem(q.op || "add", Math.max(0, Math.min(8, g)), true);
      } catch (e) { c = null; }
      if (c && topicOf(c) === id && BD.MathGame.show(c) !== BD.MathGame.show(q)) return c;
    }
    return null;
  }
  function choicesFor(ans) {
    const out = [ans], c = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans * 2].filter(function (x) { return Number.isInteger(x) && (ans < 0 || x >= 0) && x !== ans; });
    for (let i = 0; i < c.length && out.length < 3; i++) if (out.indexOf(c[i]) === -1) out.push(c[i]);
    return out.sort(function () { return Math.random() - 0.5; });
  }

  /* ================= the lesson sheet ================= */
  let T = null;
  function open(q, o) {
    o = o || {};
    const id = topicOf(q);
    if (!id || !has(id)) return false;
    const les = L[id];
    const steps = stepsFor(id, q);
    T = { q: q, id: id, les: les, steps: steps, i: -1, o: o, grade: Number(o.grade !== undefined ? o.grade : q.grade) };
    log(id);
    BD.Sound.tap();
    BD.UI.sheet("Teach me: " + les.title, '<div class="teach" id="teachBox"></div>');
    draw();
    return true;
  }
  function speak(text) { if (T && BD.ReadAloud && BD.ReadAloud.auto && BD.ReadAloud.auto(T.grade)) BD.ReadAloud.say(text); }
  function draw() {
    const box = $("teachBox"); if (!box || !T) return;
    const total = T.steps.length;
    let h = '<p class="tm-problem"><span class="muted small">Your problem</span><strong>' + esc(BD.MathGame.show(T.q)) + '</strong></p>';
    if (T.i < 0) {
      h += '<div class="tm-idea"><span class="tm-k">The big idea</span><p>' + esc(T.les.idea) + '</p></div>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" data-tm="next">Show me how</button></div>';
    } else if (T.i < total) {
      const s = T.steps[T.i];
      h += '<div class="tm-dots" aria-label="Step ' + (T.i + 1) + ' of ' + total + '">' + T.steps.map(function (_, k) { return '<i class="' + (k < T.i ? "done" : k === T.i ? "on" : "") + '"></i>'; }).join("") + '</div>' +
        '<div class="tm-step">' + (s.html ? '<div class="tm-vis">' + s.html + '</div>' : "") + '<p>' + esc(s.text) + '</p></div>' +
        '<div class="res-actions"><button type="button" class="btn btn-quiet" data-tm="back">Back</button><button type="button" class="btn btn-primary" data-tm="next">' + (T.i === total - 1 ? "Your turn" : "Next") + '</button>' +
        '<button type="button" class="btn btn-quiet btn-small" data-tm="say" aria-label="Read this step">🔊</button></div>';
    } else {
      if (!T.yt) { const c = practiceFor(T.id, T.q); T.yt = c ? { q: c, choices: choicesFor(c.answer) } : { none: true }; }
      if (T.yt.none) {
        h += '<div class="tm-idea"><p>You\'ve got the steps. Try your problem now!</p></div><div class="res-actions"><button type="button" class="btn btn-primary btn-big" data-tm="done">Back to my problem</button></div>';
      } else {
        h += '<div class="tm-idea"><span class="tm-k">Your turn</span><p class="tm-yt">' + esc(BD.MathGame.show(T.yt.q)) + ' = ?</p></div>' +
          '<div class="qq-choices tm-choices">' + T.yt.choices.map(function (c, i) { return '<button type="button" class="choice qq-choice" data-tm="pick" data-i="' + i + '">' + esc(fmt(c)) + '</button>'; }).join("") + '</div>' +
          '<p class="tm-fb" id="teachFb" role="status" aria-live="polite"></p>' +
          '<div class="res-actions"><button type="button" class="btn btn-quiet" data-tm="back">See the steps again</button><button type="button" class="btn btn-primary" data-tm="done">Back to my problem</button></div>';
      }
    }
    box.innerHTML = h;
    box.onclick = click;
    if (T.i < 0) speak(T.les.idea); else if (T.i < total) speak(T.steps[T.i].text); else if (T.yt && T.yt.q) speak("Your turn. " + (T.yt.q.say || BD.MathGame.show(T.yt.q)));
  }
  function click(e) {
    const b = e.target.closest("[data-tm]"); if (!b || !T) return;
    const a = b.dataset.tm;
    if (a === "next") { T.i = Math.min(T.steps.length, T.i + 1); BD.Sound.tap(); draw(); }
    else if (a === "back") { T.i = Math.max(-1, Math.min(T.i, T.steps.length) - 1); BD.Sound.tap(); draw(); }
    else if (a === "say") { const s = T.steps[T.i]; if (s && BD.ReadAloud) BD.ReadAloud.say(s.text); }
    else if (a === "pick") {
      const v = T.yt.choices[Number(b.dataset.i)], ok = v === T.yt.q.answer;
      b.classList.add(ok ? "is-right" : "is-wrong");
      if (ok) { document.querySelectorAll("#teachBox .qq-choice").forEach(function (x) { x.disabled = true; }); BD.Sound.right(); $("teachFb").textContent = "Yes! " + fmt(v) + " is right. You've got it. Now try your problem."; }
      else { b.disabled = true; BD.Sound.wrong(); $("teachFb").textContent = "Not quite. Look at the steps again, or try another choice."; }
    }
    else if (a === "done") { const o = T.o; T = null; $("infoClose").click(); if (o.onDone) o.onDone(); }
  }

  /* ================= button + parent log ================= */
  function button(cls) { return '<button type="button" class="btn btn-quiet teach-btn' + (cls ? " " + cls : "") + '" data-teach="1"><span aria-hidden="true">🎓</span><span>Teach me</span></button>'; }
  function weekKey() { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function log(id) {
    const p = BD.Store && BD.Store.current(); if (!p) return;
    const w = weekKey();
    if (!p.teach || p.teach.w !== w) p.teach = { w: w, t: {}, last: p.teach && p.teach.t ? p.teach.t : {} };
    p.teach.t[id] = Math.min(99, (p.teach.t[id] || 0) + 1);
    BD.Store.save(p);
  }
  function title(id) { return L[id] ? L[id].title : id; }
  function summary(p) {
    if (!p || !p.teach) return null;
    const cur = p.teach.w === weekKey() ? p.teach.t : {};
    const list = Object.keys(cur).sort(function (a, b) { return cur[b] - cur[a]; }).map(function (k) { return title(k) + " ×" + cur[k]; });
    return list.length ? list.join(", ") : null;
  }
  function sanitize(p) {
    const ok = function (o) { const r = {}; if (o && typeof o === "object") Object.keys(o).forEach(function (k) { if (L[k] && Number(o[k]) > 0) r[k] = Math.min(99, Math.round(Number(o[k]))); }); return r; };
    if (p.teach === undefined) return;
    if (!p.teach || typeof p.teach !== "object" || !/^\d{4}-\d\d-\d\d$/.test(p.teach.w)) { delete p.teach; return; }
    p.teach = { w: p.teach.w, t: ok(p.teach.t), last: ok(p.teach.last) };
  }
  function addSettings() {
    if (!BD.Settings || addSettings.done) return; addSettings.done = true;
    BD.Settings.add({
      id: "teach-log", scope: "student", title: "Teach me lessons",
      html: function (p) {
        const s = summary(p), last = p.teach && p.teach.last ? Object.keys(p.teach.last).map(function (k) { return title(k) + " ×" + p.teach.last[k]; }).join(", ") : "";
        return '<p class="small">' + (s ? '<strong>This week:</strong> ' + esc(s) + '. A good talking point: ask ' + esc(p.name) + ' to teach you how to do one.' : 'No Teach me lessons this week.') + '</p>' +
          (last ? '<p class="muted small">Last week: ' + esc(last) + '</p>' : '') +
          '<p class="muted small">Teach me is the 🎓 button on math problems. It shows the steps with the problem\'s own numbers, then a quick "your turn" check.</p>';
      },
      bind: function () {}
    });
  }
  if (BD.Settings) addSettings(); else document.addEventListener("DOMContentLoaded", addSettings);

  return { topicOf: topicOf, open: open, button: button, stepsFor: stepsFor, practiceFor: practiceFor, summary: summary, sanitize: sanitize, LESSONS: L, has: has, isOpen: function () { return !!T; }, _yt: function () { return T && T.yt && T.yt.q ? T.yt.q.answer : null; } };
})();
