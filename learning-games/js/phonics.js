/* PHONICS (Spelling Bee) — finds the spelling patterns in a word and keeps
   track of which patterns a student finds hard.
   - tags(word): pattern tags found automatically (short a, long a, vowel
     teams, r-controlled vowels, digraphs, blends, suffixes, prefixes, roots,
     homophones...). Word lists need no labels.
   - note(word, ok, p): remember a right or wrong answer. Kept in memory for
     this visit (works even when nothing can be saved) and, with a student,
     in a small record p.phon = { tag: [right, wrong] } that is capped and decays.
   - weakest(p, grade): the patterns this student misses most (2+ misses).
   - weight(word, weak): how much to favor a word when building a round.
   - parentLine(p): one short line for the parent report. */
window.BD = window.BD || {};

BD.Phonics = (function () {
  const LABELS = {
    "short-a": "short a (cat, map)", "short-e": "short e (bed, nest)", "short-i": "short i (pig, fish)",
    "short-o": "short o (hop, frog)", "short-u": "short u (sun, duck)",
    "long-a": "long a (ai, ay, a_e)", "long-e": "long e (ee, ea, y)", "long-i": "long i (igh, i_e, y)",
    "long-o": "long o (oa, ow, o_e)", "long-u": "long u (u_e, ew, ue)",
    "silent-e": "silent e (cake, bike, home)",
    "team-ai": "vowel team ai / ay (rain, play)", "team-ee": "vowel team ee / ea (feet, team)",
    "team-oa": "vowel team oa / ow (boat, snow)", "team-igh": "igh (night, light)",
    "team-oo": "oo (moon, book)", "team-ew": "ew / ue (new, blue)", "team-au": "au / aw (sauce, paw)",
    "team-ie": "ie / ei (piece, receive)",
    "r-ar": "ar (car, star)", "r-or": "or, ore (corn, more)", "r-er": "er, ir, ur (her, bird, fur)",
    "r-air": "air, are, ear (chair, care, bear)", "r-ear": "ear, eer (near, deer)",
    "oi-oy": "oi / oy (coin, boy)", "ou-ow": "ou / ow (cloud, cow)",
    "digraph-sh": "sh (ship, fish)", "digraph-ch": "ch (chin, lunch)", "digraph-th": "th (this, bath)",
    "digraph-wh": "wh (when, whale)", "digraph-ck": "ck (duck, back)", "digraph-ph": "ph (phone, graph)",
    "digraph-ng": "ng, nk (ring, pink)", "tch-dge": "-tch, -dge (catch, bridge)",
    "blend-start": "beginning blends (stop, frog, tree)", "blend-end": "ending blends (hand, nest, jump)",
    "double": "double letters (bell, rabbit, ladder)", "double-suffix": "doubling before -ing, -ed (running, stopped)",
    "drop-e": "drop the e before -ing, -ed (making, hoped)", "y-to-i": "change y to i (cries, happier)",
    "soft-c": "soft c (city, face)", "soft-g": "soft g (giant, page)",
    "silent-letter": "silent letters (knee, write, lamb)", "ough": "ough, augh (thought, caught)",
    "suffix-s": "plurals -s, -es (cats, boxes)", "plural-irregular": "irregular plurals (mice, wolves)",
    "suffix-ing": "-ing endings (jumping)", "suffix-ed": "-ed endings (played, wanted)",
    "suffix-er": "-er, -est endings (taller, tallest)", "suffix-ly": "-ly endings (quickly)",
    "suffix-ful": "-ful, -less (helpful, careless)", "suffix-ness": "-ness, -ment (kindness, payment)",
    "suffix-tion": "-tion, -sion, -cian (nation, vision)", "suffix-ture": "-ture, -sure (picture, treasure)",
    "suffix-ous": "-ous, -ious (famous, curious)", "suffix-able": "-able, -ible (washable, visible)",
    "suffix-ance": "-ance, -ence, -ant, -ent (balance, silent)", "suffix-le": "-le, -el, -al endings (table, camel)",
    "suffix-ize": "-ize, -ify, -ism, -ist", "suffix-ive": "-ive, -ic endings (active, magic)",
    "suffix-ary": "-ary, -ery, -ory (library, bakery)", "suffix-ity": "-ity endings (ability)",
    "schwa-end": "-or, -ar endings (doctor, dollar)",
    "prefix-un": "prefix un- (unhappy)", "prefix-re": "prefix re- (redo)", "prefix-dis": "prefixes dis-, mis- (dislike, mistake)",
    "prefix-pre": "prefix pre- (preview)", "prefix-in": "prefixes in-, im-, il-, ir- (impossible)",
    "prefix-over": "prefixes over-, under-, sub-, inter-", "prefix-number": "number prefixes (bi-, tri-, uni-)",
    "root-greek": "Greek roots (graph, phon, scope)", "root-latin": "Latin roots (port, ject, struct)",
    "homophone": "homophones and look-alikes (there, their)", "compound": "compound words (sunset)",
    "sight": "tricky heart words (said, they, of)", "suffix-ate": "-ate endings (create, celebrate)",
    "two-syllable": "two-syllable words (basket, robot)", "schwa": "unstressed vowels in long words (separate, chocolate)"
  };
  const TAGS = Object.keys(LABELS);
  /* Short name for the "Training:" line. */
  function label(tag) { return LABELS[tag] || tag; }

  /* ---------- word lists that rules can't guess ---------- */
  const set = function (s) { const o = {}; s.split(" ").forEach(function (w) { if (w) o[w] = 1; }); return o; };
  const SIGHT = set("a the of to do you said they were was what who where there their come some one done gone give live have love " +
    "move lose whose are been does goes could would should again any many says friend people once two eye buy laugh enough " +
    "through though thought school busy women woman sure sugar pretty very every only other mother brother from want wash water " +
    "walk talk warm word work world your four door floor break great steak heart hour our young touch country cousin double trouble " +
    "island answer beautiful because ocean special minute build built guess guest guard guide here none above glove dove shove prove " +
    "today into onto also both most only kind find mind child wild old cold hold gold told colonel");
  const HOMOPHONE = set(("to too two there their hear here right write know no knew new sea see son sun meet meat flour flower tail tale " +
    "mail male weak week road rode plain plane pair pear ate eight hour our wood would blew blue peace piece which witch whole hole " +
    "sail sale cent sent scent board bored break brake by buy bye hair hare dear deer waist waste heal heel horse hoarse beet beat " +
    "aunt ant steal steel toe tow red read be bee for four eye won one allowed aloud cereal serial cell sell berry bury course coarse " +
    "knead need knight night mist missed root route scene seen threw through wait weight cellar seller pedal peddle aisle isle guessed " +
    "guest site sight cite tide tied flea flee pail pale pain pane rain reign rein steak stake great grate pause paws hall haul chews " +
    "choose dye fir fur higher hire maid made poor pour rose rows tea tee creak creek due dew fair fare loan lone roll role seem seam " +
    "sew so sow groan grown boulder bolder chord cord duel dual phase gorilla hanger hangar miner minor peer pier prey pray sole soul " +
    "suite sweet thrown throne vain vane vein burrow doe dough feat feet manner presents presence raise rays principal principle capital " +
    "capitol stationary stationery discreet discrete alter altar ascent descent bizarre bazaar fowl foul naval profit wrapped residents " +
    "residence symbol cymbal troupe troop weighed yolk kernel lessen lesson meddle medal metal strait straight vary very complement " +
    "compliment council counsel flair flare forth fourth forward foreword hoard horde idle idol passed past peak peek wring ring mussel " +
    "muscle barren baron cache cash censor sensor patience patients whether weather knot not way weigh wear where knows nose " +
    "accept except affect effect desert dessert loose lose quiet quite advice advise device breath breathe adapt adopt averse adverse " +
    "farther further moral morale personal personnel eminent imminent allusion illusion elicit ensure insure emigrate immigrate " +
    "close clothes chose than then"));
  const IRREG_PLURAL = set("children geese mice teeth feet women men oxen wolves leaves knives shelves loaves halves elves cacti fungi larvae antennae criteria bacteria people");
  const NOT_ING = set("thing string spring sting swing bring ceiling morning evening during nothing something anything everything pudding lightning king ring sing wing sling cling");
  const NOT_ED = set("bed red fed led shed sled wed bred shred sped naked hundred sacred wicked embed");
  const NOT_LY = set("fly only holy jelly belly silly family lily bully early ugly reply supply apply july rely ally hilly curly");
  const NOT_MENT = set("moment comment element segment garment fragment pigment ornament sediment cement");
  const NOT_COMPOUND = set("season carpet target message manage passage bandage cabbage package garbage village cottage herself himself itself");
  const NOT_ER = set("flower corner letter butter ladder dinner summer hammer supper pepper banner matter litter bitter better batter offer power tower shower bother other mother father brother water after never over under winter paper river ever number finger hunger danger ginger timber member spider tiger cover silver sister lover hover clover border order corner partner monster thunder chapter computer whisper wonder gather shiver weather feather leather sweater sister rubber zipper slipper");
  const NOT_PREFIX = set("unit union unite inside into indoor income input inch repair record resign reward present invest insect inform island");
  const HARD_G = set("get give gift girl begin together finger tiger eager target gear geese gecko giggle forget anger hunger longer singer burger gift girls geyser");
  /* "ow" says /ow/ (cow) in these; elsewhere it is usually long o (snow). */
  function owDiphthong(w) {
    if (/(^|gr|kn|sh|bl|thr|fl|^s|^m)own(s|er|ed)?$/.test(w) || /bowl/.test(w)) return false;
    return /ow(?=[ldn]|er|el|der|se|ard)/.test(w) || /^(c|h|n|w|v|pl|br|ch|all|eyebr|someh|anyh)ow/.test(w) || /(^|[^a-z])(cow|how|now|wow)$/.test(w);
  }

  /* All bank words (and a few extra parts) for compound and prefix checks. */
  let known = null, knownSize = -1;
  const EXTRA = "sun set rain bow foot ball snow man bath tub back pack bed room out side in play ground some times with every one home work pop corn cup cake fire place light house star fish tooth brush paste water fall week end moon note book news paper body day dream hair cut lady bug mail box pan sea shell skate board flake where thing after noon air plane basket butter fly class down stairs grand mother father sail boat black berry bird camp print gold straw glass glasses thunder storm shoe lace eye brow finger nail flash grass hopper hand writing horse key life guard motor cycle paint pass word scare crow wild wood pecker your self them selves mean while how ever when through door bell drive way earth quake dish washer dragon draw bridge drum stick sight works fore head ginger bread heart beat sick ice berg jig saw time post card quick sand rattle snake shore short sky scraper suit case table spoon ware wheel barrow wind shield world wide cook farm flag pole green hall made jelly pine cone dust ship wreck space burn team mate tea tip toe pick wall mill bare car pool clock wise field count bulb fly bee hive tree top cow boy girl lunch pig pen pad lock gum drop chip munk cat net zig zag hill cob web sun up hold self view do read fill heat build cycle";
  function knownWords() {
    let n = 0; const S = BD.SPELLING || {};
    Object.keys(S).forEach(function (g) { n += S[g].length; });
    if (known && n === knownSize) return known;
    known = set(EXTRA); knownSize = n;
    Object.keys(S).forEach(function (g) { S[g].forEach(function (x) { known[String(x[0]).toLowerCase()] = 1; }); });
    return known;
  }
  const isWord = function (s) { return s.length >= 2 && !!knownWords()[s]; };

  function syllables(w) {
    const groups = (w.match(/[aeiouy]+/g) || []).length;
    const silent = /[^aeiou]e$/.test(w) && !/[^aeiouy]le$/.test(w) && groups > 1 ? 1 : 0;
    return Math.max(1, groups - silent);
  }
  /* The word with a common ending taken off, for vowel checks (jumping -> jump, hoped -> hope). */
  function stem(w) {
    let m;
    if ((m = w.match(/^(.*[^aeiou])\1(ing|ed|er|est|y)$/)) && m[1].length >= 2 && !/(ll|ss|ff|zz)$/.test(m[1] + m[1].slice(-1))) return { base: m[1], double: true };
    if ((m = w.match(/^(.+)ing$/)) && m[1].length >= 2 && !NOT_ING[w]) {
      if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(m[1]) && syllables(m[1]) === 1) return { base: m[1] + "e", dropE: true };
      return { base: m[1] };
    }
    if ((m = w.match(/^(.+[aeiou][^aeiouwxy])ed$/)) && /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(m[1]) && !NOT_ED[w]) return { base: m[1] + "e", dropE: true };
    if ((m = w.match(/^(.+[^e])ed$/)) && m[1].length >= 2 && !NOT_ED[w] && !/eed$/.test(w)) return { base: m[1] };
    if ((m = w.match(/^(.+(s|x|z|ch|sh))es$/))) return { base: m[1] };
    if ((m = w.match(/^(.+[^suie])s$/)) && m[1].length >= 3) return { base: m[1] };
    return { base: w };
  }

  const cache = {};
  function tags(word) {
    const w = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return [];
    if (cache[w]) return cache[w];
    const out = [], add = function (t) { if (out.indexOf(t) === -1) out.push(t); };
    const st = stem(w), b = st.base, syl = syllables(w), bsyl = syllables(b);
    const sight = !!SIGHT[w];
    if (sight) add("sight");
    if (HOMOPHONE[w]) add("homophone");
    if (IRREG_PLURAL[w]) add("plural-irregular");

    /* vowels */
    if (!sight) {
      const vce = /(^|[^aeiou])([aeiou])[^aeiouwxy]e$/.exec(b);
      const vceOk = vce && !/[^aeiouy]le$/.test(b) && (bsyl === 1 || (bsyl === 2 && !/(ture|sure|ive|age|ice|ure|ate|ine|ile|ise|ome|ove|ose)$/.test(b)));
      if (vceOk) {
        add("silent-e");
        add({ a: "long-a", e: "long-e", i: "long-i", o: "long-o", u: "long-u" }[vce[2]]);
      }
      if (/ai(?!r)|ay|eigh|ey$|ei[gn]/.test(w) && !/aisle|(capt|cert|mount|fount|curt|barg|vill|chieft|porcel)ain/.test(w)) { add("long-a"); if (/ai(?!r)|ay/.test(w)) add("team-ai"); }
      if (/ee(?!r)|ea(?!r)/.test(w) && !/bread|head|thread|spread|dead|read[yi]|heav|weath|feath|breath|meant|sweat|breakf|health|wealth|pleas|meas|treas|deaf|great|break|steak|ocean|idea|area|creat|instead|steady/.test(w)) { add("long-e"); add("team-ee"); }
      if (syl >= 2 && /[^aeiou]y$/.test(w)) add("long-e");
      if (/igh/.test(w)) { add("long-i"); add("team-igh"); }
      if (syl === 1 && /[^aeiou]y$/.test(w)) add("long-i");
      if (/^[^aeiou]+ie$/.test(w) || /(^|[^aeiou])(ind|ild)$/.test(b)) add("long-i");
      if (/oa|oe$/.test(w) || (/ow/.test(w) && !owDiphthong(w)) || /^[^aeiou]*o(ld|lt|st)$/.test(b) && !/cost|lost|frost/.test(b)) { add("long-o"); if (/oa|ow/.test(w)) add("team-oa"); }
      if (/ew|ue(?!s?t)/.test(w) && !/que|gue/.test(w)) { add("long-u"); add("team-ew"); }
      if (/oo/.test(w)) add("team-oo");
      if (/au|aw/.test(w)) add("team-au");
      if (/[^aeiou]ie[^sw]|ei/.test(w) && !/ie$|eigh|ei[gn]|their|ier$/.test(w)) add("team-ie");
      /* short vowels: one-syllable words (after taking off an ending) with one plain vowel */
      const bq = b.replace(/qu/g, "q");
      if (bsyl === 1 && !vceOk && !/[aeiou]{2}|[aeiou]r|[aeiou]w|.y|gh/.test(bq)) {
        const v = bq.match(/[aeiou]/g);
        if (v && v.length === 1 && !/(all|alk|old|olt|ost|ind|ild)$/.test(b) && !/[aeiou]$/.test(b)) add("short-" + v[0]);
      }
      const open = /^[^aeiouy]+([eoi])$/.exec(w);
      if (open && w.length <= 3) add({ e: "long-e", o: "long-o", i: "long-i" }[open[1]]);
      /* r-controlled */
      if (/air|are(?![aeiouy])|(b|p|w|sw|t)ear$|(b|p|w)ears?$/.test(w)) add("r-air");
      else if (/eer|ear(?!n|l|t|ch|d)|ier/.test(w)) add("r-ear");
      if (/ear(n|l|th|ch|d)/.test(w) || /(^|[^aeiou])[eiu]r(?![aeiouyr])/.test(w) || /wor/.test(w)) add("r-er");
      if (/ar(?![aeiouyr])/.test(w) && !/war|quar|are$/.test(w)) add("r-ar");
      if (/or(?![aeiouyr])|ore$|oar|war|quar|(f|y|p|c|s|m)our/.test(w) && !/wor(?!e|n)|(^|[^a-z])our$|hour|flour|sour/.test(w)) add("r-or");
      /* diphthongs */
      if (/oi|oy/.test(w) && !/choir|oir/.test(w)) add("oi-oy");
      if ((/ou/.test(w) && !/ough|ould|^you|ous$|ously$|touch|young|countr|double|trouble|cousin|couple|soup|group|youth|through|tour|route|coupon|souven|bouti|cougar|courage|courte|journ|four|your|pour|court|course|source|mourn/.test(w)) || (/ow/.test(w) && owDiphthong(w))) add("ou-ow");
    }

    /* consonants */
    if (/sh/.test(w)) add("digraph-sh");
    if (/ch/.test(w) && !/tch/.test(w)) add("digraph-ch");
    if (/th/.test(w)) add("digraph-th");
    if (/^wh/.test(w)) add("digraph-wh");
    if (/ck/.test(w)) add("digraph-ck");
    if (/ph/.test(w)) add("digraph-ph");
    if (/n[gk]/.test(b)) add("digraph-ng");
    if (/tch|dge/.test(w)) add("tch-dge");
    if (/^(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|sk|sl|sm|sn|sp|st|sw|tr|tw|scr|spl|spr|str|squ|thr|shr)/.test(w)) add("blend-start");
    if (/(nd|nt|st|mp|sk|sp|ft|lt|lk|lf|lp|ld|pt|ct|xt)$/.test(b) && syl <= 2) add("blend-end");
    if (/([bcdfgklmnprstz])\1/.test((st.double ? w.replace(/([^aeiou])\1(ing|ed|er|est|y)$/, "$1$2") : w).replace(/(ness|less)$/, ""))) add("double");
    if (st.double) add("double-suffix");
    if (st.dropE) add("drop-e");
    if (/c[eiy]/.test(w) && !/cc[ei]/.test(w)) add("soft-c");
    if ((/g[eiy]/.test(w) || /dge/.test(w)) && !HARD_G[w] && !/(^|[^a-z])g(et|ift|irl|ive|ear|ee|ig)/.test(w) && (!/ng(er|ing|est|y)/.test(w) || /(dan|stran|ran|ssen|ven|llen)ger/.test(w))) add("soft-g");
    if (/^(kn|wr|gn|ps|pn|rh)|mb$|mn$|gn$|bt|stle$|sten$|alk$|alf|alm|^honest|^honor|^heir|^hour|island|aisle|answer|sword|ghost|yacht|salmon|wednesday|often|buil|guil|guar|guid|guit|guest|guess|scien|scis|musc/.test(w)) add("silent-letter");
    if (/ough|augh/.test(w)) add("ough");

    /* endings */
    if (/[^aeiou](ies|ied|ier|iest|iness|ily)$/.test(w) && w.length > 4 && !/^(species|series|family|lily|movies|cookies)$/.test(w)) add("y-to-i");
    if (/ing$/.test(w) && w.length >= 5 && !NOT_ING[w]) add("suffix-ing");
    if (/ed$/.test(w) && w.length >= 5 && !NOT_ED[w] && !/eed$/.test(w)) add("suffix-ed");
    if (!IRREG_PLURAL[w] && ((/(s|x|z|ch|sh)es$/.test(w) && isWord(w.slice(0, -2))) || (/[^su]s$/.test(w) && isWord(w.slice(0, -1))) || (/ies$/.test(w) && isWord(w.slice(0, -3) + "y")) || (/ves$/.test(w) && (isWord(w.slice(0, -3) + "f") || isWord(w.slice(0, -3) + "fe"))))) add("suffix-s");
    if (/(er|est)$/.test(w) && w.length >= 5 && !NOT_ER[w]) {
      const r = w.replace(/(er|est)$/, "");
      if (isWord(r) || isWord(r + "e") || (st.double && isWord(r.slice(0, -1))) || (/i$/.test(r) && isWord(r.slice(0, -1) + "y"))) add("suffix-er");
    }
    if (/ly$/.test(w) && w.length >= 5 && !NOT_LY[w]) add("suffix-ly");
    if (/(ful|less)(ly|ness)?$/.test(w) && w.length > 5) add("suffix-ful");
    if (/(ness|ment)s?$/.test(w) && w.length > 6 && !NOT_MENT[w]) add("suffix-ness");
    if (/(tion|sion|cian)s?$/.test(w)) add("suffix-tion");
    if (/(ture|sure)$/.test(w) && w.length > 5) add("suffix-ture");
    if (/ous(ly|ness)?$/.test(w)) add("suffix-ous");
    if (/(able|ible|ably|ibly)$/.test(w) && w.length > 5 && !/^(table|cable|fable|stable)$/.test(w)) add("suffix-able");
    if (/(ance|ence|ancy|ency|ant|ent)s?$/.test(w) && w.length >= 6 && !/(^|[^a-z])(spent|event|invent|prevent|present|comment|moment)$/.test(w)) add("suffix-ance");
    if (syl >= 2 && out.indexOf("suffix-able") === -1 && (/[^aeiou]le$/.test(w) || /[^aeiou](el|al)$/.test(w))) add("suffix-le");
    if (/(ize|ise|ify|ism|ist)s?$/.test(w) && w.length >= 7 && !/(wise|rise|noise|promise|exercise|surprise|advertise|raise|praise|cruise|assist|insist|persist|resist|consist|exist|twist|wrist)$/.test(w)) add("suffix-ize");
    if (/(ive|ical|ic)$/.test(w) && w.length >= 6) add("suffix-ive");
    if (/(ary|ery|ory)$/.test(w) && w.length >= 6) add("suffix-ary");
    if (/ity$/.test(w) && w.length >= 6) add("suffix-ity");
    if (syl >= 2 && /[^aeiou](or|ar)$/.test(w)) add("schwa-end");

    /* prefixes: the rest must be a word we know (or long enough to be one) */
    const pre = function (p, tag, minRest) {
      if (w.indexOf(p) !== 0 || NOT_PREFIX[w]) return;
      const rest = w.slice(p.length);
      if (rest.length >= 2 && (isWord(rest) || isWord(stem(rest).base) || (minRest && rest.length >= minRest))) add(tag);
    };
    pre("un", "prefix-un"); pre("re", "prefix-re"); pre("dis", "prefix-dis", 6); pre("mis", "prefix-dis"); pre("pre", "prefix-pre");
    pre("non", "prefix-in"); pre("in", "prefix-in"); pre("im", "prefix-in"); pre("il", "prefix-in"); pre("ir", "prefix-in");
    pre("over", "prefix-over"); pre("under", "prefix-over"); pre("sub", "prefix-over", 5); pre("inter", "prefix-over", 5); pre("mid", "prefix-over");
    if (/^(bi(cycle|lingual|weekly|nocular|nary|ceps|plane|sect|cameral|partisan|lateral|ennial|focal|ped)|tri(angle|cycle|pod|logy|athlon|ple|o$)|uni(form|corn|cycle|vers|son|fy)|semi|multi|oct(a|o)|dec(ade|imal|agon)|centi|centu|centen|kilo|milli|mono|poly|pent(a|agon)|hex(a|agon)|quadr)/.test(w)) add("prefix-number");

    /* roots */
    if (/graph|gram$|phon|scope|tele|photo|micro|bio|geo|therm|meter|metr|auto|chron|log(y|ue|ist)|path(y|o|ic)|phil|hydr|astro|aster|cycl|demo|cracy|crat|psych|phob|soph|gene(t|ra|al)|genome|morph|derm|zoo/.test(w)) add("root-greek");
    if (w.length >= 7 && /port|ject|struct|rupt|dict|scrib|script|spect|duct|tract|gress|cred|vert|vers|voc|flect|flex|fract|frag|junct|mand|pend|puls|sequ|aud|vis|vid|jur|jud|mort|viv|terr|aqu|manu|ped(e|i|al|es)|cede|ceed|sede|mit|miss/.test(w)) add("root-latin");

    /* compound: two words we know (each at least 3 letters) */
    if (!NOT_COMPOUND[w] && w.length >= 6 && !/(able|ible|less|ful|ness|ment)$/.test(w) && !out.some(function (t) { return t.indexOf("prefix-") === 0; })) {
      for (let i = 3; i <= w.length - 3; i++) if (isWord(w.slice(0, i)) && isWord(w.slice(i))) { add("compound"); break; }
    }
    if (/[^aeiou]ate$/.test(w) && w.length >= 6) add("suffix-ate");
    const vowelTag = out.some(function (t) { return /^(short|long|silent-e|team|r-|oi|ou)/.test(t); });
    if (syl >= 3 && !/^(short|long)/.test(out.join(" "))) add("schwa");
    else if (syl === 2 && !vowelTag) add("two-syllable");
    cache[w] = out;
    return out;
  }

  /* ---------- the skill model ---------- */
  const CAP = 24, KEEP = 0.75, MAX_TAGS = 80;
  const session = {};           // { studentKey: { tag: [right, wrong] } } for this visit
  const keyOf = function (p) { return (p && p.id) || "_guest"; };
  function bump(rec, tag, ok) {
    const c = rec[tag] = rec[tag] || [0, 0];
    c[ok ? 0 : 1] += 1;
    if (c[0] + c[1] > CAP) { c[0] = Math.round(c[0] * KEEP * 10) / 10; c[1] = Math.round(c[1] * KEEP * 10) / 10; }
  }
  function note(word, ok, p) {
    const t = tags(word); if (!t.length) return t;
    const s = session[keyOf(p)] = session[keyOf(p)] || {};
    t.forEach(function (tag) { bump(s, tag, ok); });
    if (p && typeof p === "object") {
      if (!p.phon || typeof p.phon !== "object" || Array.isArray(p.phon)) p.phon = {};
      t.forEach(function (tag) { bump(p.phon, tag, ok); });
      const keys = Object.keys(p.phon);
      if (keys.length > MAX_TAGS) keys.sort(function (a, b) { return (p.phon[a][0] + p.phon[a][1]) - (p.phon[b][0] + p.phon[b][1]); }).slice(0, keys.length - MAX_TAGS).forEach(function (k) { delete p.phon[k]; });
    }
    return t;
  }
  /* What we know: the saved record, topped up with this visit's notes
     (in case the saved copy was replaced, e.g. by a sync). */
  function record(p) {
    const out = {}, s = session[keyOf(p)] || {}, saved = (p && p.phon && typeof p.phon === "object") ? p.phon : {};
    Object.keys(saved).forEach(function (k) { if (LABELS[k] && Array.isArray(saved[k])) out[k] = [Number(saved[k][0]) || 0, Number(saved[k][1]) || 0]; });
    Object.keys(s).forEach(function (k) { const o = out[k] || [0, 0]; out[k] = [Math.max(o[0], s[k][0]), Math.max(o[1], s[k][1])]; });
    return out;
  }
  /* Patterns that appear in a grade's word list (and how often). */
  const gradeCounts = {};
  function patternCounts(grade) {
    const list = (BD.SPELLING && BD.SPELLING[String(grade)]) || [];
    const c = gradeCounts[grade];
    if (c && c._n === list.length) return c;
    const out = { _n: list.length };
    list.forEach(function (x) { tags(x[0]).forEach(function (t) { out[t] = (out[t] || 0) + 1; }); });
    return (gradeCounts[grade] = out);
  }
  /* The patterns missed most: at least 2 misses and a high miss rate.
     With a grade, only patterns that grade has enough words for. */
  function weakest(p, grade, max) {
    const rec = record(p), have = grade === undefined || grade === null ? null : patternCounts(grade);
    const list = Object.keys(rec).filter(function (t) {
      const c = rec[t];
      return c[1] >= 2 && (c[1] + 0.5) / (c[0] + c[1] + 1) >= 0.34 && (!have || (have[t] || 0) >= 4);
    }).map(function (t) {
      const c = rec[t], rate = (c[1] + 0.5) / (c[0] + c[1] + 1);
      /* specific patterns beat broad ones when the misses are similar */
      const broad = /^(blend-|double$|suffix-s$|sight|compound|digraph-ng)/.test(t) ? 0.8 : 1;
      return { tag: t, score: rate * Math.min(c[1], 6) * broad };
    }).sort(function (a, b) { return b.score - a.score; }).map(function (x) { return x.tag; });
    return list.slice(0, max || 3);
  }
  /* Picker weight for a word: 1 normally, more for each weak pattern it has. */
  function weight(word, weak) {
    if (weak && !Array.isArray(weak)) weak = weakest(weak);
    if (!weak || !weak.length) return 1;
    const t = tags(word);
    let n = 0;
    weak.forEach(function (w, i) { if (t.indexOf(w) !== -1) n += i === 0 ? 3 : 2; });
    return 1 + n;
  }
  function trainingLine(tagsList) {
    if (!tagsList || !tagsList.length) return "";
    return "Training: " + label(tagsList[0]);
  }
  function parentLine(p) {
    const weak = weakest(p, null, 3);
    if (!weak.length) return "";
    return "Spelling patterns to practice: " + weak.map(function (t) { return label(t).replace(/ \(.*\)$/, ""); }).join(", ") + ".";
  }

  /* ---------- keep saved data tidy (called by storage.js) ---------- */
  function sanitize(p) {
    if (!p || typeof p !== "object") return p;
    if (p.phon !== undefined) {
      if (!p.phon || typeof p.phon !== "object" || Array.isArray(p.phon)) delete p.phon;
      else {
        const clean = {};
        Object.keys(p.phon).slice(0, 200).forEach(function (k) {
          const v = p.phon[k];
          if (!LABELS[k] || !Array.isArray(v) || v.length !== 2) return;
          const r = Math.max(0, Math.min(CAP, Number(v[0]) || 0)), w = Math.max(0, Math.min(CAP, Number(v[1]) || 0));
          if (r + w > 0) clean[k] = [Math.round(r * 10) / 10, Math.round(w * 10) / 10];
        });
        p.phon = clean;
      }
    }
    if (p.spellSeq !== undefined) { const n = Math.round(Number(p.spellSeq)); if (isFinite(n) && n >= 0) p.spellSeq = Math.min(n, 1e7); else delete p.spellSeq; }
    const wm = p.wordMissed && p.wordMissed.spelling;
    if (wm && typeof wm === "object") Object.keys(wm).forEach(function (k) {
      const m = wm[k];
      if (!m || typeof m !== "object" || typeof m.word !== "string" || !/^[A-Za-z]{1,40}$/.test(m.word)) { delete wm[k]; return; }
      m.grade = Math.max(-1, Math.min(8, Math.round(Number(m.grade)) || 0));
      m.misses = Math.max(0, Math.min(3, Number(m.misses) || 0));
      if (m.due !== undefined) { const d = Math.round(Number(m.due)); if (isFinite(d) && d >= 0) m.due = d; else delete m.due; }
      if (m.ok !== undefined) m.ok = Math.max(0, Math.min(9, Math.round(Number(m.ok)) || 0));
    });
    return p;
  }

  return { tags: tags, label: label, LABELS: LABELS, TAGS: TAGS, note: note, record: record, weakest: weakest, weight: weight,
    patternCounts: patternCounts, trainingLine: trainingLine, parentLine: parentLine, sanitize: sanitize };
})();
