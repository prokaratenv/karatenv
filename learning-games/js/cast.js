/* THE ENGAGE CAST — characters from the Engage Higgsfield workspace (cartoon set).
   Instructors coach each game; kids pick a fighter for their profile. */
window.BD = window.BD || {};

BD.Cast = (function () {
  const PEOPLE = {
    zumi: { name: "Zumi", role: "Dojo mascot" },
    cd: { name: "Master Young", role: "Master Instructor" },
    michele: { name: "Master Mrs. Young", role: "Main Instructor" },
    bridgette: { name: "Ms. Bridgette", role: "Lead Instructor" },
    kyra: { name: "Ms. Kyra", role: "Instructor" },
    lauryn: { name: "Ms. Lauryn", role: "Studio Manager" },
    kimmy: { name: "Kimmy", role: "White belt" },
    billy: { name: "Billy", role: "Blue belt" },
    tommy: { name: "Tommy", role: "Yellow belt" },
    mackenzie: { name: "Mackenzie", role: "Purple belt" },
    rylan: { name: "Rylan", role: "Red belt" }
  };
  /* Kids, Zumi, and the instructors are all playable. */
  const FIGHTERS = ["kimmy", "billy", "tommy", "mackenzie", "rylan", "zumi", "cd", "michele", "bridgette", "kyra", "lauryn"];
  const COACH = { math: "cd", sentence: "michele", reading: "kyra", plan: "michele", host: "zumi" };

  const LINES = {
    start: ["Bow in. Let's train!", "Eyes up, focus on. Let's go!", "Ready stance. Begin!", "Show me your best effort!"],
    right: ["Hi-yah! Nice!", "Clean technique!", "That's how it's done!", "Strong!", "Yes! Keep it rolling!", "Sharp focus!"],
    streak: ["You're on fire!", "Combo! Don't stop now!", "Black belt focus!", "Unstoppable!"],
    wrong: ["Shake it off. Look at the steps.", "Good try. Let's learn it.", "Mistakes make us stronger.", "Breathe. You've got the next one."],
    win: ["Outstanding in the line of discipline!", "That's black belt effort!", "Proud of you, champ!"],
    retry: ["Every black belt was once a white belt. Let's train it again!", "Not yet means not yet. You'll get it!", "Reset, refocus, try again!"]
  };
  const pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  function img(key) { return "img/" + key + ".webp"; }
  function face(key) { return "img/face-" + key + ".webp"; }
  function name(key) { return /^s\d\d$/.test(key) ? "My champion" : (PEOPLE[key] || PEOPLE.zumi).name; }
  function line(kind) { return pick(LINES[kind] || LINES.start); }

  /* Default fighter for older profiles, so everyone has a character. */
  function defaultFighter(p) {
    let h = 0; String(p.id).split("").forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) % 997; });
    return FIGHTERS[h % 5];
  }

  /* Make a coach say something in a game's speech bubble. */
  function say(elId, kind, text) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = text || line(kind);
    el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
  }

  /* Student characters grow up with the grade: 0 = Pre-K/K, 1 = 1st–2nd,
     2 = 3rd–5th, 3 = 6th–8th. Instructors and Zumi stay as they are. */
  const KIDS = ["kimmy", "billy", "tommy", "mackenzie", "rylan"];
  function ageBand(grade) { grade = Number(grade); return grade <= 0 ? 0 : grade <= 2 ? 1 : grade <= 5 ? 2 : 3; }
  /* White-belt art and its belt mask for a character at a grade. */
  function art(key, grade, outfit) {
    if (isStudio(key)) { // one age for every grade
      // The Claude version can hold only some files: Studio boxing and MMA show the gi there (the website has every outfit).
      if ((outfit === "boxing" || outfit === "mma" || outfit === "bbu") && window.claude && typeof window.claude.use === "function") outfit = "gi";
      if (outfit && outfit !== "gi") return { src: "img/fit-" + key + "-" + outfit + ".webp", mask: key + "-" + outfit, collar: outfit === "highrank" ? key + "-hrcollar" : null, logo: outfit === "sparring" || outfit === "bbu" ? null : key + "-" + outfit + "-logo", band: 2 };
      return { src: "img/age-" + key + ".webp", mask: key, logo: key + "-logo", band: 2 };
    }
    if (KIDS.indexOf(key) === -1) return { src: "img/wb-" + key + ".webp", mask: key, band: null };
    const b = ageBand(grade === undefined ? 3 : grade);
    // The Claude version holds only some pictures: the Black Belt Uniform shows the gi there.
    if (outfit === "bbu" && window.claude && typeof window.claude.use === "function") outfit = "gi";
    if (outfit && outfit !== "gi") return { src: "img/fit-" + key + "-" + b + "-" + outfit + ".webp", mask: key + "-" + b + "-" + outfit, collar: outfit === "highrank" ? key + "-" + b + "-hrcollar" : null, logo: outfit === "sparring" || outfit === "bbu" ? null : key + "-" + b + "-" + outfit + "-logo", band: b };
    return { src: "img/age-" + key + "-" + b + ".webp", mask: key + "-" + b, logo: key + "-" + b + "-logo", band: b };
  }

  /* CHAMPION STUDIO: 30 original 3D champions (one age, every outfit) that
     students pick by look: [look, skin 0-5 light to deep, hair style, hair
     color, extras]. Keys s01..s30; art in img/age-sNN, img/fit-sNN-<outfit>. */
  const STUDIO = [
    ["boy", 5, "short", "black", ""], ["girl", 5, "puffs", "black", ""], ["girl", 4, "braids", "black", ""], ["boy", 4, "locs", "black", ""],
    ["boy", 4, "buzz", "black", "glasses"], ["girl", 4, "curly", "brown", ""], ["girl", 3, "covered", "", "hijab"], ["girl", 2, "covered", "", "hijab glasses"],
    ["boy", 3, "short", "black", ""], ["girl", 3, "braids", "black", ""], ["boy", 1, "short", "black", ""], ["girl", 1, "ponytail", "black", ""],
    ["boy", 2, "wavy", "brown", ""], ["girl", 3, "long", "brown", ""], ["boy", 0, "curly", "red", "freckles"], ["girl", 0, "braids", "red", "freckles"],
    ["boy", 0, "spiky", "blonde", ""], ["girl", 0, "long", "blonde", "glasses"], ["boy", 1, "short", "brown", "glasses"], ["girl", 1, "bun", "red", ""],
    ["boy", 5, "curly", "black", "glasses"], ["girl", 5, "curly", "black", ""], ["boy", 4, "curly", "brown", ""], ["girl", 4, "locs", "black", ""],
    ["boy", 2, "buzz", "brown", ""], ["girl", 1, "wavy", "brown", "freckles"], ["boy", 3, "bun", "black", ""], ["girl", 3, "short", "brown", ""],
    ["boy", 5, "buzz", "black", ""], ["girl", 1, "bun", "black", "glasses"]
  ].map(function (a, i) { return { key: "s" + (i < 9 ? "0" : "") + (i + 1), look: a[0], skin: a[1], hair: a[2], color: a[3], extras: a[4] ? a[4].split(" ") : [] }; });
  const STUDIO_KEYS = STUDIO.map(function (s) { return s.key; });
  function isStudio(key) { return STUDIO_KEYS.indexOf(key) !== -1; }
  /* Students who wear belts, gear and outfits (the 5 Engage kids and every Studio champion). */
  function isStudent(key) { return KIDS.indexOf(key) !== -1 || isStudio(key); }

  return { KIDS: KIDS, STUDIO: STUDIO, isStudio: isStudio, isStudent: isStudent, ageBand: ageBand, art: art, PEOPLE: PEOPLE, FIGHTERS: FIGHTERS, COACH: COACH, img: img, face: face, name: name, line: line, say: say, defaultFighter: defaultFighter };
})();
