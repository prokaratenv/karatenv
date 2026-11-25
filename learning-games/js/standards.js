/* ABOUT OUR LEARNING — a reference section in the Parents area.
   Where Brain Dojo's skills come from and how each subject lines up with
   grade-level standards. Reference only: Brain Dojo is a practice tool, not a
   certified or complete curriculum. Reviewed November 2026. */
window.BD = window.BD || {};

BD.Standards = (function () {
  const SOURCES = [
    ["Common Core State Standards for Mathematics", "Grade-level math skills for Kindergarten to 8th grade (counting, place value, operations, fractions, ratios, equations, geometry).", "https://corestandards.org/wp-content/uploads/2023/09/Math_Standards1.pdf"],
    ["Common Core State Standards for English Language Arts", "Reading foundations (phonics, word recognition), language conventions and reading comprehension for Kindergarten to 8th grade.", "https://corestandards.org/wp-content/uploads/2023/09/ELA_Standards1.pdf"],
    ["Head Start Early Learning Outcomes Framework (ELOF)", "What children ages 3 to 5 typically learn in math, literacy and language. Used for our Preschool and Pre-K picture games.", "https://headstart.gov/interactive-head-start-early-learning-outcomes-framework-ages-birth-five"],
    ["National Reading Panel (2000) and the IES guide on foundational reading skills (2016)", "Research on teaching phonemic awareness, phonics and spelling in order. Used for our Sounds and Spelling Bee sequence.", "https://ies.ed.gov/ncee/wwc/PracticeGuide/21"],
    ["ACTFL Can-Do Statements (Novice)", "What true beginners can do in a new language. Used for our Spanish Dojo lessons.", "https://www.actfl.org/uploads/files/general/Resources-Publications/Can-Do-Novice.pdf"],
    ["Learning science: practice testing, spaced review and mixed practice", "Short quizzes, reviews spread over days and mixing subjects help skills stick (Dunlosky et al., 2013; IES practice guide, 2007).", "https://ies.ed.gov/ncee/wwc/PracticeGuide/1"]
  ];
  // [level band, [subject, skills practiced, example standard codes]]
  const BANDS = [
    ["Preschool and Pre-K", [
      ["Numbers", "Number names, counting objects, more and fewer, adding to and taking away with pictures", "ELOF Mathematics: counting, cardinality, operations"],
      ["Letters", "Letter names, big and little letters, letters vs numbers", "ELOF Literacy: alphabet knowledge"],
      ["Sounds", "First sounds, rhymes, letter sounds", "ELOF Literacy: phonological awareness"],
      ["Shapes and Colors", "Colors, shapes, size, patterns, sorting, position words, what happens first", "ELOF Mathematics: geometry, patterns, spatial sense"]
    ]],
    ["Kindergarten to 2nd grade", [
      ["Math", "Counting and counting by 10s, adding and subtracting, place value, time and money", "K.CC, K.OA, 1.OA, 1.NBT, 2.NBT, 2.MD"],
      ["Fix-It Sentences", "Capitals, end marks, spelling patterns, simple grammar", "L.K.2, L.1.1, L.1.2, L.2.1, L.2.2"],
      ["Spelling", "Short vowels, blends, digraphs, long vowels and vowel teams, sight words", "RF.K.3, RF.1.3, RF.2.3, L.2.2"],
      ["Story Scrolls", "Main idea and key details in short stories and facts", "RL.1.1 to 1.3, RI.2.1 to 2.2"]
    ]],
    ["3rd to 5th grade", [
      ["Math", "Multiplication and division, fractions and decimals, area, perimeter, measurement", "3.OA, 3.NF, 4.NF, 5.NF, 5.NBT, 3.MD, 4.MD"],
      ["Fix-It Sentences", "Commas, quotation marks, verb tenses, complete sentences vs fragments and run-ons", "L.3.1, L.3.2, L.4.1f, L.5.2"],
      ["Spelling", "Prefixes, suffixes and multi-syllable words", "RF.3.3, RF.4.3, L.4.2"],
      ["Story Scrolls", "Main idea, details, inference, word meaning, text structure, finding the supporting sentence", "RL/RI.3.1 to 5.5"]
    ]],
    ["6th to 8th grade", [
      ["Math", "Ratios and percents, integers, equations, slope and functions, exponents, geometry and volume", "6.RP, 6.EE, 7.RP, 7.EE, 8.EE, 8.F, 8.G"],
      ["Fix-It Sentences", "Commas and semicolons, agreement, commonly confused words, clear pronouns, modifiers, active and passive voice", "L.6.1d, L.7.1c, L.8.1b, L.6.2 to 8.2"],
      ["Spelling", "Greek and Latin roots, academic words, commonly confused words", "L.6.4b to 8.4b"],
      ["Story Scrolls", "Central idea, inference, author's purpose, text structure, text evidence", "RL/RI.6.1 to 8.5"]
    ]],
    ["Spanish (bonus, every age)", [
      ["Spanish Dojo", "Learn new words first, then match, listen, build phrases and review over days", "ACTFL Novice Low to Novice Mid"]
    ]]
  ];
  const a = function (t, u) { return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + t + '</a>'; };
  function html() {
    const esc = BD.UI.esc;
    return '<details class="std-wrap"><summary><strong>Where our skills come from and how they line up</strong> <span class="muted small">(tap to open)</span></summary>' +
      '<p class="small">Brain Dojo helps kids build skills in different ways: quick practice, games, belts and review. The skills match what kids learn in school at each grade, from Preschool through 8th grade. It is a practice tool that supports school and is not a full curriculum or a certified program.</p>' +
      '<h4 class="label">Where our skills come from</h4><ul class="std-src">' +
      SOURCES.map(function (s) { return '<li><strong>' + a(esc(s[0]), s[2]) + '</strong><span class="muted small">' + esc(s[1]) + '</span></li>'; }).join("") + '</ul>' +
      '<h4 class="label">How each subject lines up</h4>' +
      BANDS.map(function (b) {
        return '<div class="std-band"><h5>' + esc(b[0]) + '</h5><div class="table-wrap"><table class="grid std-table"><thead><tr><th>Subject</th><th>Skills practiced</th><th>Examples</th></tr></thead><tbody>' +
          b[1].map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td><td class="std-code">' + esc(r[2]) + '</td></tr>'; }).join("") + '</tbody></table></div></div>';
      }).join("") +
      '<p class="muted small">Practice tool, not a full curriculum. Brain Dojo covers quick-recall skills; it does not cover writing, speaking or hands-on projects. Codes are examples of the standards each game practices. Reviewed November 2026.</p></details>';
  }
  function register() {
    if (!BD.Settings || register.done) return; register.done = true;
    BD.Settings.add({ id: "standards", scope: "family", title: "About our learning", html: html, bind: function () {} });
  }
  if (BD.Settings) register(); else document.addEventListener("DOMContentLoaded", register);
  return { SOURCES: SOURCES, BANDS: BANDS, html: html };
})();
