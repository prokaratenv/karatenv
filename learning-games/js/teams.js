/* CHARACTER TEAMS — Leadership Team (Orange Belt), Athlete Team (Green Belt)
   and Black Belt Club (Brown Belt). Students who join get the team's E on
   their uniform (purple, green, the Engage brand gradient; gold is for Engage
   instructors only), the team shirt and shorts, and one character lesson a
   week: a real moment, told for their age, with three questions (What could
   you do? What's the right response? What should you say?), then their own
   words. Parents see the answers in the Parents area as talking points.
   Upkeep: miss 3 weekly lessons in a row, or more than 3 in all, and the
   membership (and the team E and team outfit) ends; students can rejoin. */
window.BD = window.BD || {};

BD.Teams = (function () {
  const LESSON_XP = 5, DAY = 864e5, MAX_IN_ROW = 3, MAX_TOTAL = 3;
  /* Engage brand Earthtone Gradient (brand guide): bright green, teal, bright purple. */
  const BRAND_STOPS = ["#65D94A", "#5CBFC1", "#4F6CEE"];
  const GRADIENT = "linear-gradient(135deg, #65D94A 0%, #5CBFC1 50%, #4F6CEE 100%)";
  const TEAMS = [
    { id: "leadership", name: "Leadership Team", short: "Leadership", belt: 2, focus: "Leadership character skills", color: "#8B4BE0", e: "purple E" },
    { id: "athlete", name: "Athlete Team", short: "Athlete", belt: 4, focus: "Performance and bravery skills", color: "#2FA866", e: "green E" },
    { id: "bbc", name: "Black Belt Club", short: "BBC", belt: 6, focus: "Dedication and perseverance skills", color: "#5CBFC1", gradient: GRADIENT, e: "Engage gradient E" }
  ];
  const byId = function (id) { return TEAMS.find(function (t) { return t.id === id; }); };

  /* Lessons: m = [Little (Pre-K to 1st), Kids (2nd to 4th), Juniors (5th to 8th)],
     each [moment, what you could do, the right response, what to say].
     no = the "not quite" choices for each question. */
  const L = {
    leadership: [
      { title: "Lead by example", value: "Character", talk: "Character is how you act when no one is watching. Leaders don't wait to be told. They do the right thing first, and others follow.",
        m: [["Toys are all over the floor after playtime. Nobody is cleaning up.", "Start picking up toys, even the ones you didn't use.", "Helpful and happy, not grumpy.", "\"I'll start! Who wants to help?\""],
          ["Your class is noisy while the teacher waits to start.", "Sit tall, eyes on the teacher, voice off.", "Calm and ready, even if others aren't.", "\"Let's be ready so we don't miss anything.\""],
          ["Your group project is due Friday and two teammates are messing around.", "Start your part now and share a simple plan with the group.", "Focused, not bossy or annoyed.", "\"I'll take the slides. Can you two do the research by Wednesday?\""]],
        no: [["Wait for someone else to go first.", "Tell on everyone right away."], ["Grumpy, but do it anyway.", "Annoyed at everyone."], ["\"That's not my job.\"", "\"Why do I always have to do it?\""]],
        tip: "Leaders go first and stay positive.", mission: "Do one job at home before anyone asks you." },
      { title: "Include others", value: "Connection", talk: "Leaders notice who's left out. Everyone belongs on our team, and a leader makes that happen.",
        m: [["A new kid is standing alone at recess.", "Walk over and invite them to play.", "Friendly and brave.", "\"Hi! Want to play with us?\""],
          ["Teams are being picked and the same kid is always picked last.", "When it's your turn to pick, pick them early.", "Kind, and fair to everyone.", "\"I pick you. Let's go!\""],
          ["Your friends start a group chat and leave out one person from your group.", "Add them, or ask the group why they were left out.", "Respectful, not dramatic.", "\"Hey, can we add them? They're part of our group too.\""]],
        no: [["Let someone else handle it.", "Just watch and do nothing."], ["Worried about what friends will think.", "Bored. It's not my problem."], ["Nothing. Pretend you didn't notice.", "\"We already have enough people.\""]],
        tip: "Leaders make sure everyone belongs.", mission: "Invite a family member to play a game or join something you're doing." },
      { title: "Speak up with respect", value: "Communication Comes First", talk: "We use words, not emotions, to solve problems. A leader speaks clearly, kindly and at the right time.",
        m: [["Your brother took your toy without asking.", "Use your words instead of grabbing it back.", "Calm body, strong voice.", "\"Can I have that back please? You can have it after me.\""],
          ["Your teammate keeps telling you how to do your form, and it's bugging you.", "Tell them how you feel, then ask for help your way.", "Calm, not snappy.", "\"Thanks, but let me try first. I'll ask if I need help.\""],
          ["A teacher marked your answer wrong, and you think it was right.", "Wait until after class and ask privately.", "Respectful and curious, not arguing.", "\"Can you show me what I missed on number 4? I thought my answer worked.\""]],
        no: [["Yell or grab.", "Stay quiet and stay upset."], ["Angry and loud.", "Embarrassed, so give up."], ["\"That's not fair! You always do this!\"", "\"Whatever.\""]],
        tip: "Words first: calm body, clear voice.", mission: "Solve one problem at home with words only, then tell your parent what you said." },
      { title: "Own your choices", value: "Personal Accountability", talk: "Leaders look inward before pointing outward. When you make a mistake, own it, fix it and learn from it.",
        m: [["You spilled juice on the table.", "Tell a grown-up and help clean it up.", "Calm. It was an accident.", "\"I spilled. Can you help me clean it?\""],
          ["You forgot your homework and your friend says to blame the dog.", "Tell the truth and ask how to make it up.", "Responsible, not scared.", "\"I forgot it. Can I bring it tomorrow?\""],
          ["You said something rude about a friend, and they found out.", "Apologize directly and make it right.", "Own it, no excuses.", "\"I'm sorry I said that. It wasn't okay, and I won't do it again.\""]],
        no: [["Blame someone else.", "Hide it and hope nobody notices."], ["Scared, so make an excuse.", "Upset that you got caught."], ["\"It wasn't me.\"", "\"Sorry, but it wasn't my fault.\""]],
        tip: "Own it, fix it, learn from it.", mission: "Own one mistake this week out loud, then share how you fixed it." }
    ],
    athlete: [
      { title: "Brave first try", value: "Confidence", talk: "Confidence isn't faked. It's earned by trying. Brave doesn't mean you're not nervous. It means you try anyway.",
        m: [["Coach asks who wants to show a new kick in front of the class.", "Raise your hand and try it.", "Excited. A little nervous is okay.", "\"Me! I'll try!\""],
          ["Your PE class is trying a sport you've never played.", "Jump in and learn the rules as you go.", "Curious, not embarrassed.", "\"I've never played this. Can someone show me?\""],
          ["There's a school talent show and you've been practicing a form.", "Sign up, even though you're nervous.", "Nervous is energy. Use it.", "\"I'm signing up. If I mess up, I'll keep going.\""]],
        no: [["Say \"I can't\" before trying.", "Let a friend go instead."], ["Too nervous to try.", "Wait until you're perfect."], ["\"No way, I'll mess up.\"", "\"Maybe next time.\""]],
        tip: "Brave means you try anyway.", mission: "Try one new thing this week (a food, a skill, a game) and tell your parent how it went." },
      { title: "Perform under pressure", value: "Focus", talk: "Everyone feels pressure. Athletes have a plan: big breath, eyes forward, one move at a time.",
        m: [["Everyone is watching you do your form, and you feel shaky.", "Take a big breath and start.", "Calm body, strong stance.", "(to yourself) \"Big breath. I can do this.\""],
          ["You're up next to read out loud in class, and your heart is pounding.", "Breathe, stand tall and read slowly.", "Steady, not rushed.", "(to yourself) \"Slow and loud. One line at a time.\""],
          ["It's a big test (or your belt test), and you go blank on a question.", "Skip it, finish the rest and come back.", "Composed, not panicked.", "(to yourself) \"Next one. I'll come back to it.\""]],
        no: [["Stop and give up.", "Rush through to get it over with."], ["Panicked.", "Frozen and stuck."], ["(to yourself) \"I'm going to mess up.\"", "(to yourself) \"Everyone is staring at me.\""]],
        tip: "Big breath, eyes forward, one move at a time.", mission: "Teach your family your breathing plan, then use it once this week when you feel nervous." },
      { title: "Win well, lose well", value: "Connection", talk: "How you act after the match says more than the score. We respect every partner, every time.",
        m: [["You lost a game of tag and you're sad.", "Take a breath, then play again.", "It's okay to be sad. Then smile and keep playing.", "\"Good game! Can we play again?\""],
          ["You won the relay race and your friend's team lost.", "Shake hands and cheer for their effort.", "Proud, not showing off.", "\"Good race. You were super fast at the end.\""],
          ["You lost the tournament final, in Brain Dojo or a real game.", "Congratulate the winner, then figure out one thing to improve.", "Disappointed is fine. Respect comes first.", "\"Congrats, you earned it. Rematch next weekend?\""]],
        no: [["Quit the game.", "Brag about winning."], ["Mad at everyone.", "Showing off."], ["\"That wasn't fair!\"", "\"I'm way better than you.\""]],
        tip: "Respect every partner, win or lose.", mission: "Play a game with your family. Win or lose, end with a handshake and \"good game.\"" },
      { title: "Brave voice", value: "Choice Is Always an Option", talk: "Bravery isn't only about kicks. It's choosing to do the right thing when it's hard, and getting help from a grown-up when someone could get hurt.",
        m: [["A kid keeps pushing your friend in line.", "Tell a grown-up right away.", "Brave and calm.", "\"Teacher, someone is pushing my friend.\""],
          ["Some kids are making fun of a classmate's clothes.", "Stand next to your classmate, and tell a teacher if it keeps happening.", "Confident, not mean back.", "\"Stop. That's not cool. Come sit with me.\""],
          ["Your friends dare you to do something unsafe and film it.", "Say no and walk away, even if they tease you.", "Confident in your choice.", "\"No thanks. I'm not doing that.\""]],
        no: [["Join in so you fit in.", "Fight back with your hands."], ["Scared, so stay quiet.", "Mean right back."], ["Nothing. Hope it stops.", "Laugh along with them."]],
        tip: "Choose what's right, and get a grown-up when someone could get hurt.", mission: "Practice your strong \"No thanks\" voice with a parent. Make eye contact and stand tall." }
    ],
    bbc: [
      { title: "Keep going", value: "C.A.N.I. (Constant And Never-ending Improvement)", talk: "Inches or leaps, we keep moving forward. Hard means you're growing, not failing.",
        m: [["You're building a tall tower and it falls down.", "Build it again, a little different.", "Frustrated for a second, then try again.", "\"Oops! Let me try again.\""],
          ["You've practiced a hard kick for a week and it still isn't right.", "Ask your coach for one tip, then keep practicing.", "Patient with yourself.", "\"I don't have it yet. What should I fix first?\""],
          ["Math is getting harder and your grade dropped.", "Make a plan: extra practice, ask the teacher, use Brain Dojo practice.", "Determined, not defeated.", "\"I'm not there yet. Can you show me where I'm getting stuck?\""]],
        no: [["Quit because it's hard.", "Get mad and walk away."], ["Defeated.", "Blaming the activity."], ["\"I'm just bad at this.\"", "\"This is too hard. I quit.\""]],
        tip: "Hard means you're growing. Keep going.", mission: "Pick one hard thing and practice it for 5 minutes every day this week." },
      { title: "Show up anyway", value: "Consistency Is Key", talk: "Consistency builds confidence. Champions practice on the days they feel like it and the days they don't.",
        m: [["It's time to brush your teeth, but you want to keep playing.", "Brush now, then go back to play.", "Doing it even when you don't want to.", "\"Okay! Teeth first, then play.\""],
          ["It's class day, it's cold out, and you'd rather stay on the couch.", "Get your uniform on and go.", "Committed, not grumpy.", "\"I always feel better after class. Let's go.\""],
          ["You're on a 20-day practice streak and you're tired tonight.", "Do a short practice to keep your promise to yourself.", "Disciplined and proud of your streak.", "\"Even 5 minutes counts. I'm keeping my word.\""]],
        no: [["Skip it just this once.", "Wait until you feel like it."], ["Grumpy and making excuses.", "It doesn't matter anyway."], ["\"I'll do it tomorrow.\"", "\"I don't feel like it.\""]],
        tip: "Show up on the hard days too.", mission: "Choose one daily habit (reading, practice, a chore) and check it off every day for 7 days." },
      { title: "Learn from setbacks", value: "Fierce Optimism", talk: "A setback is a lesson, not the end. We look for what we learned and come back stronger.",
        m: [["You didn't get picked to be line leader today.", "Be a great helper in line instead.", "Okay to be sad, then be a good sport.", "\"Maybe tomorrow! I'll be a good helper today.\""],
          ["You didn't pass part of your test and have to try again.", "Ask what to work on and practice it.", "Disappointed, then determined.", "\"What do I need to practice so I pass next time?\""],
          ["You didn't make the team you tried out for.", "Ask the coach for feedback, keep training and try again next season.", "Hopeful and hungry to improve.", "\"Thanks for the chance. What can I work on for next time?\""]],
        no: [["Give up on it.", "Pretend you didn't care."], ["Blaming the coach or the test.", "Upset for the rest of the day."], ["\"I'm never trying again.\"", "\"That wasn't fair.\""]],
        tip: "A setback is a lesson, not the end.", mission: "Tell a parent about a time you didn't get it right the first time and what you learned." },
      { title: "Lift others up", value: "Community", talk: "Black Belt Club members expand our circle of influence. We become the person newer students look up to.",
        m: [["Your little cousin can't tie a karate belt.", "Show them slowly, step by step.", "Patient and kind.", "\"Watch me. We'll do it together.\""],
          ["A new white belt in class looks lost during warm-ups.", "Stand next to them and show the moves.", "Welcoming, like someone did for you.", "\"Just follow me. You're doing great.\""],
          ["A younger student is about to quit because a form is too hard.", "Share how you got through it and practice with them.", "Encouraging, not showing off.", "\"I almost quit that form too. Want to practice it together after class?\""]],
        no: [["Do it for them.", "Ignore them. They're not your friend."], ["Impatient.", "Showing off."], ["\"It's easy. Just do it.\"", "\"Figure it out yourself.\""]],
        tip: "Be the person newer students look up to.", mission: "Teach a family member one thing you learned in class or in Brain Dojo this week." }
    ]
  };
  const QUESTIONS = ["What could you do?", "What's the right response?", "What should you say?"];
  const AGES = ["Engage Ninjas", "Core Kids", "Pre-Teen/Teens"]; // Pre-K to 1st, 2nd to 4th, 5th to 8th

  /* ---------- state ---------- */
  const esc = function (s) { return BD.UI.esc(s); };
  const dstr = function (t) { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const weekKey = function (t) { return dstr(BD.Parent.weekStart(t || Date.now())); };
  function eligible(p, id) { const t = byId(id); return !!t && BD.Badges.reached(p, t.belt); }
  function joined(p, id) { return !!(p && p.teams && p.teams[id]); }
  function myTeams(p) { return TEAMS.filter(function (t) { return joined(p, t.id); }); }
  function invites(p) { return TEAMS.filter(function (t) { return eligible(p, t.id) && !joined(p, t.id); }); }
  /* The E on the uniform: the team outfit's own color, else the highest team joined.
     Gold stays with Engage instructors; everyone else wears a white E. */
  function logo(p, outfit) {
    if (!p) return null;
    const own = byId(outfit);
    const t = own && joined(p, own.id) ? own : myTeams(p).slice(-1)[0];
    return t ? (t.gradient || t.color) : null;
  }
  function ageGroup(p) { const g = BD.Rank.dojoGrade(p); return g <= 1 ? 0 : g <= 4 ? 1 : 2; }
  function lessonIndex(p, id) {
    const start = BD.Parent.weekStart(new Date(p.teams[id] + "T12:00:00").getTime());
    return Math.max(0, Math.round((BD.Parent.weekStart(Date.now()) - start) / (7 * DAY))) % L[id].length;
  }
  function week(p, id) { const log = (p.teamLog = p.teamLog || {}); log[id] = log[id] || {}; return log[id][weekKey()] || null; }
  function setWeek(p, id, v) { const log = (p.teamLog = p.teamLog || {}); log[id] = log[id] || {}; log[id][weekKey()] = Object.assign({ l: lessonIndex(p, id) }, log[id][weekKey()] || {}, v); }
  /* Upkeep: weeks after the joining week that ended without the lesson. */
  function upkeep(p, id) {
    if (!joined(p, id)) return { missed: 0, inRow: 0 };
    const start = BD.Parent.weekStart(new Date(p.teams[id] + "T12:00:00").getTime()), now = BD.Parent.weekStart(Date.now());
    const log = (p.teamLog || {})[id] || {};
    let missed = 0, inRow = 0;
    for (let w = start + 7 * DAY; w < now - DAY; w += 7 * DAY) {
      const k = dstr(BD.Parent.weekStart(w + DAY)); // DST-safe week key
      if (log[k] && log[k].done) inRow = 0; else { missed++; inRow++; }
    }
    return { missed: missed, inRow: inRow };
  }
  function lapsed(u) { return u.inRow >= MAX_IN_ROW || u.missed > MAX_TOTAL; }
  /* Ends memberships that weren't kept up. Returns the teams that just ended. */
  function enforce(p) {
    const ended = myTeams(p).filter(function (t) { return lapsed(upkeep(p, t.id)); });
    if (!ended.length) return [];
    p.teamLost = p.teamLost || {};
    ended.forEach(function (t) { delete p.teams[t.id]; p.teamLost[t.id] = BD.today(); if (p.outfit === t.id) p.outfit = "gi"; });
    BD.Store.save(p);
    return ended;
  }
  function upkeepLine(p, id) {
    const u = upkeep(p, id), w = week(p, id) || {};
    const left = Math.min(MAX_IN_ROW - u.inRow, MAX_TOTAL + 1 - u.missed);
    return (w.done ? "This week's lesson is done ✓. " : "Do this week's lesson to keep your spot. ") +
      "Missed weeks: " + u.missed + (u.missed || u.inRow ? " (" + left + " more " + (left === 1 ? "miss" : "misses") + " ends your membership)" : "") + ".";
  }
  function lessonsDone(p, id) { return Object.keys((p.teamLog || {})[id] || {}).filter(function (k) { return p.teamLog[id][k].done; }).length; }

  function join(p, id) {
    if (!eligible(p, id) || joined(p, id)) return false;
    p.teams = p.teams || {}; p.teams[id] = BD.today();
    if (p.teamLost) delete p.teamLost[id];
    if (BD.Badges.canWear(p)) p.outfit = id;
    BD.Store.save(p);
    return true;
  }

  /* ---------- home card ---------- */
  function patch(t) { return '<span class="team-e team-' + t.id + '" aria-hidden="true">E</span>'; }
  function card(p) {
    const el = document.getElementById("teamCard"); if (!el) return;
    const ended = enforce(p);
    if (ended.length) setTimeout(function () { if (!BD.UI.sheetOpen()) lostSheet(p, ended); }, 700);
    const mine = myTeams(p), inv = invites(p);
    el.hidden = !mine.length && !inv.length;
    if (el.hidden) return;
    const todo = mine.filter(function (t) { const w = week(p, t.id); return !w || !w.done; });
    el.dataset.cta = inv.length ? "Join" : todo.length ? "Lesson" : "Open";
    el.innerHTML = '<span class="team-patches">' + (mine.length ? mine : inv).map(patch).join("") + '</span><span><strong>' +
      (inv.length ? "You're invited: " + esc(inv[0].name) + "!" : "My Teams") + '</strong><span class="boss-sub">' +
      (inv.length ? (p.teamLost && p.teamLost[inv[0].id] ? "Rejoin and keep up with the weekly lessons" : "Join the team and get its E on your uniform") : todo.length ? "This week's lesson is ready · do it to keep your spot" : "Lessons done this week ✓") + '</span></span>';
  }

  /* ---------- hub ---------- */
  function hubHTML(p) {
    return '<p class="muted small">Three Engage teams for students who lead, compete and keep going. Each team has a weekly character lesson. Upkeep matters: miss 3 weeks in a row, or more than 3 in all, and the membership ends.</p>' +
      TEAMS.map(function (t) {
        const isIn = joined(p, t.id), can = eligible(p, t.id);
        let body;
        if (isIn) {
          const li = lessonIndex(p, t.id), les = L[t.id][li], w = week(p, t.id) || {};
          body = '<p class="team-week"><strong>This week: ' + esc(les.title) + '</strong> <span class="muted">(' + esc(les.value) + ')</span></p>' +
            '<div class="team-actions"><button type="button" class="btn btn-small ' + (w.done ? "btn-quiet" : "btn-primary") + '" data-team-lesson="' + t.id + '">' + (w.done ? "Do it again" : "Start lesson · +" + LESSON_XP + " XP") + '</button></div>' +
            '<p class="small team-mission"><strong>Try it this week:</strong> ' + esc(les.mission) + '</p>' +
            '<p class="small team-upkeep">' + esc(upkeepLine(p, t.id)) + '</p>' +
            '<p class="muted small">' + lessonsDone(p, t.id) + (lessonsDone(p, t.id) === 1 ? " lesson" : " lessons") + ' done · Team shirt and shorts in your Gear locker</p>';
        } else if (can) {
          body = '<p>' + esc(t.focus) + '. Join to get the ' + esc(t.e) + ' on your uniform and the team shirt and shorts.</p>' +
            '<p class="muted small">To stay on the team, finish the weekly lesson. Missing 3 weeks in a row, or more than 3 weeks in all, ends the membership and its gear.</p>' +
            '<div class="team-actions"><button type="button" class="btn btn-small btn-gold" data-team-join="' + t.id + '">Join the ' + esc(t.name) + '</button></div>';
        } else body = '<p class="muted">' + esc(t.focus) + '. Opens at ' + BD.BELTS[t.belt].name + ' Belt.</p>';
        return '<section class="team-block' + (isIn ? " in" : can ? "" : " locked") + '">' +
          '<h4>' + patch(t) + ' ' + esc(t.name) + (isIn ? ' <span class="team-ok">Member</span>' : "") + '</h4>' + body + '</section>';
      }).join("");
  }
  function openHub() {
    const p = BD.Store.current(); if (!p) return;
    BD.UI.sheet("Engage Teams", hubHTML(p));
    document.getElementById("infoBody").onclick = function (e) {
      const j = e.target.closest("[data-team-join]"), l = e.target.closest("[data-team-lesson]");
      if (j) { if (join(p, j.dataset.teamJoin)) welcome(p, byId(j.dataset.teamJoin)); }
      else if (l) startLesson(p, l.dataset.teamLesson);
    };
  }
  function welcome(p, t) {
    BD.UI.sheet("Welcome to the team!", '<div class="unlock">' +
      (BD.Badges.canWear(p) ? '<div class="unlock-outfit">' + BD.UI.championHTML(p, t.id) + '</div>' : '') +
      '<h3>' + patch(t) + ' ' + esc(t.name) + '</h3><p>Your uniform now has the <strong>' + esc(t.e) + '</strong>, and the ' + esc(t.short) + ' shirt and shorts are in your Gear locker.</p>' +
      '<p class="muted">Every week there\'s a new character lesson, and finishing it keeps your spot on the team. Your first one is ready.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="teamFirst">Start my first lesson</button><button type="button" class="btn btn-quiet" id="teamLater">Later</button></div></div>');
    BD.Sound.belt(); BD.confetti(140);
    document.getElementById("teamFirst").onclick = function () { startLesson(p, t.id); };
    document.getElementById("teamLater").onclick = function () { document.getElementById("infoClose").click(); };
    if (BD.UI.refreshStage) BD.UI.refreshStage();
    const hf = document.getElementById("homeFighter"); if (hf) hf.innerHTML = BD.UI.championHTML(p);
    card(p);
  }

  /* ---------- a lesson ---------- */
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function startLesson(p, id) {
    const t = byId(id), li = lessonIndex(p, id), les = L[id][li], ag = ageGroup(p), mo = les.m[ag];
    const firstTime = !(week(p, id) || {}).done, picks = [];
    let q = 0, tries = 0;
    const intro = function () {
      BD.UI.sheet(t.name, '<div class="lesson">' +
        '<p class="eyebrow">' + patch(t) + ' Week lesson · ' + AGES[ag] + ' · ' + esc(les.value) + '</p><h3>' + esc(les.title) + '</h3>' +
        '<div class="coach-row"><img class="coach-face" src="img/face-cd.webp" alt=""><p class="coach-say">' + esc(les.talk) + '</p></div>' +
        '<p class="lesson-moment"><strong>The moment:</strong> ' + esc(mo[0]) + '</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="lessonGo">I\'m ready</button></div></div>');
      document.getElementById("lessonGo").onclick = ask;
    };
    const ask = function () {
      const opts = shuffle([0, 1, 2]); // 0 = the best answer, 1-2 = the "not quite" choices
      const text = function (c) { return c === 0 ? mo[q + 1] : les.no[q][c - 1]; };
      BD.UI.sheet(t.name, '<div class="lesson">' +
        '<p class="eyebrow">Question ' + (q + 1) + ' of 3</p>' +
        '<p class="lesson-moment">' + esc(mo[0]) + '</p><h3>' + QUESTIONS[q] + '</h3>' +
        '<div class="lesson-opts">' + opts.map(function (c) { return '<button type="button" class="lesson-opt" data-code="' + c + '" data-ok="' + (c === 0 ? 1 : 0) + '">' + esc(text(c)) + '</button>'; }).join("") + '</div>' +
        '<p class="lesson-note" id="lessonNote" aria-live="polite"></p></div>');
      document.getElementById("infoBody").onclick = function (e) {
        const b = e.target.closest(".lesson-opt"); if (!b || b.disabled) return;
        if (picks[q] === undefined) picks[q] = Number(b.dataset.code); // their first choice is what parents see
        if (b.dataset.ok === "1") {
          b.classList.add("right"); BD.Sound.right();
          document.querySelectorAll(".lesson-opt").forEach(function (x) { x.disabled = true; });
          document.getElementById("lessonNote").innerHTML = '<strong>' + (tries ? "There it is." : "Yes!") + '</strong> ' + esc(les.tip);
          setTimeout(function () { q++; tries = 0; if (q < 3) ask(); else ownWords(); }, 1300);
        } else {
          tries++; b.classList.add("wrong"); b.disabled = true; BD.Sound.wrong();
          document.getElementById("lessonNote").innerHTML = '<strong>Not quite.</strong> ' + esc(les.tip) + ' Try another one.';
        }
      };
    };
    /* A last challenge: say it in their own words (optional). */
    const ownWords = function () {
      BD.UI.sheet(t.name, '<div class="lesson">' +
        '<p class="eyebrow">Your turn</p><p class="lesson-moment">' + esc(mo[0]) + '</p>' +
        '<h3>How would YOU say it?</h3><p class="muted small">Use your own words. Your parents can see this in the Parents area.</p>' +
        '<textarea id="lessonSay" class="lesson-say" maxlength="140" rows="3" placeholder="I would say…"></textarea>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="lessonSaySave">Done</button><button type="button" class="btn btn-quiet" id="lessonSaySkip">Skip</button></div></div>');
      document.getElementById("lessonSaySave").onclick = function () { finish(clean(document.getElementById("lessonSay").value)); };
      document.getElementById("lessonSaySkip").onclick = function () { finish(""); };
      setTimeout(function () { const el = document.getElementById("lessonSay"); if (el) el.focus(); }, 60);
    };
    const finish = function (said) {
      let xp = 0;
      if (firstTime) {
        setWeek(p, id, { done: BD.today(), l: li, a: ag, picks: picks.slice(0, 3), say: said || undefined });
        xp = BD.addXP(p, LESSON_XP);
        BD.Store.recordSession(p, { game: "team", grade: BD.Rank.dojoGrade(p), correct: picks.filter(function (c) { return c === 0; }).length, total: 3, xp: xp, mode: id });
      } else if (said) setWeek(p, id, { say: said });
      BD.Store.save(p);
      BD.UI.sheet(t.name, '<div class="unlock lesson">' + '<div class="chest-prize">' + patch(t) + '</div>' +
        '<h3>Lesson complete!</h3>' + (xp ? '<p class="xp-pop">+' + xp + ' XP</p>' : '<p class="muted">Already counted this week. Great review!</p>') +
        '<p><strong>Try it this week:</strong> ' + esc(les.mission) + '</p><p class="muted small">You\'re keeping your spot on the ' + esc(t.name) + '. See you next week!</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="lessonDone">Osu!</button></div></div>');
      BD.Sound.belt(); BD.confetti(80);
      document.getElementById("lessonDone").onclick = function () { document.getElementById("infoClose").click(); if (BD.UI.home) BD.UI.home(); };
    };
    intro();
  }
  function clean(s) { return String(s || "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 140); }

  function lostSheet(p, ended) {
    BD.UI.sheet("Team membership ended", '<div class="unlock">' + ended.map(patch).join(" ") +
      '<h3>' + ended.map(function (t) { return esc(t.name); }).join(" and ") + '</h3>' +
      '<p>The weekly lessons were missed ' + MAX_IN_ROW + ' weeks in a row (or more than ' + MAX_TOTAL + ' weeks in all), so the membership, the team E and the team outfit are paused.</p>' +
      '<p class="muted">Upkeep is part of being on the team. You can rejoin from Engage Teams and start fresh.</p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary" id="lostOk">Rejoin</button><button type="button" class="btn btn-quiet" id="lostLater">Later</button></div></div>');
    document.getElementById("lostOk").onclick = function () { openHub(); };
    document.getElementById("lostLater").onclick = function () { document.getElementById("infoClose").click(); };
    if (BD.UI.refreshStage) BD.UI.refreshStage();
    const hf = document.getElementById("homeFighter"); if (hf) hf.innerHTML = BD.UI.championHTML(p);
  }

  /* ---------- Parents area: talking points from the student's answers ---------- */
  function answersHTML(id, w) {
    const les = L[id][w.l || 0], mo = les.m[w.a === undefined ? 1 : w.a], picks = w.picks || [];
    return '<p class="tp-moment"><strong>' + esc(les.title) + '</strong> (' + esc(les.value) + '): ' + esc(mo[0]) + '</p><ul class="tp-list">' +
      QUESTIONS.map(function (qq, i) {
        const c = picks[i]; if (c === undefined) return "";
        const chose = c === 0 ? mo[i + 1] : les.no[i][c - 1];
        const qt = function (x) { return /^["(]/.test(x) ? esc(x) : '"' + esc(x) + '"'; };
        return '<li><span class="muted">' + qq + '</span> They chose: ' + qt(chose) + (c === 0 ? ' <span class="team-ok">✓ best answer</span>' : ' <span class="muted">(then found: ' + qt(mo[i + 1]) + ')</span>') + '</li>';
      }).join("") + '</ul>' +
      (w.say ? '<p class="tp-say">In their own words: "' + esc(w.say) + '"</p>' : "") +
      '<p class="muted small">Talking point: ask when a moment like this came up for them, and try this together: ' + esc(les.mission) + '</p>';
  }
  function parentHTML(p) {
    const mine = myTeams(p), lost = Object.keys(p.teamLost || {}).map(byId).filter(Boolean);
    if (!mine.length && !lost.length) return "";
    return '<div class="pd team-pd"><h4 class="label">Engage Teams · talking points</h4>' + mine.map(function (t) {
      const log = (p.teamLog || {})[t.id] || {}, keys = Object.keys(log).filter(function (k) { return log[k].done; }).sort();
      const last = keys.length ? log[keys[keys.length - 1]] : null, u = upkeep(p, t.id), w = week(p, t.id) || {};
      return '<div class="pd-row team-tp"><span class="pd-k">' + patch(t) + ' ' + esc(t.short) + '</span><span>' +
        '<span class="small">' + (w.done ? '<span class="team-ok">This week\'s lesson done</span>' : "This week's lesson not done yet") + ' · missed weeks: ' + u.missed + (u.inRow ? " (" + u.inRow + " in a row)" : "") + '</span>' +
        (last ? answersHTML(t.id, last) : '<p class="muted small">Their answers show here after the first lesson.</p>') + '</span></div>';
    }).join("") + lost.map(function (t) {
      return '<div class="pd-row"><span class="pd-k">' + patch(t) + ' ' + esc(t.short) + '</span><span class="muted">Membership ended on ' + esc(p.teamLost[t.id]) + ' after missed weekly lessons. They can rejoin anytime.</span></div>';
    }).join("") + '</div>';
  }

  function sanitize(p) {
    if (p.teams && typeof p.teams === "object") { const t = {}; TEAMS.forEach(function (x) { if (typeof p.teams[x.id] === "string" && /^\d{4}-\d\d-\d\d$/.test(p.teams[x.id])) t[x.id] = p.teams[x.id]; }); p.teams = t; } else delete p.teams;
    if (p.teamLog && typeof p.teamLog === "object") {
      const out = {};
      TEAMS.forEach(function (x) {
        const src = p.teamLog[x.id]; if (!src || typeof src !== "object") return;
        const keep = {}; Object.keys(src).filter(function (k) { return /^\d{4}-\d\d-\d\d$/.test(k) && src[k] && typeof src[k] === "object"; }).sort().slice(-60).forEach(function (k) {
          const v = src[k], o = { l: Math.max(0, Math.min(9, Number(v.l) || 0)) };
          if (typeof v.done === "string" && /^\d{4}-\d\d-\d\d$/.test(v.done)) o.done = v.done;
          if (Array.isArray(v.picks)) o.picks = v.picks.slice(0, 3).map(function (c) { return Math.max(0, Math.min(2, Math.round(Number(c) || 0))); });
          if (v.a !== undefined) o.a = Math.max(0, Math.min(2, Math.round(Number(v.a) || 0)));
          if (typeof v.say === "string" && v.say.trim()) o.say = clean(v.say);
          keep[k] = o;
        });
        out[x.id] = keep;
      });
      p.teamLog = out;
    } else delete p.teamLog;
    if (p.teamLost && typeof p.teamLost === "object") { const l = {}; TEAMS.forEach(function (x) { if (typeof p.teamLost[x.id] === "string" && /^\d{4}-\d\d-\d\d$/.test(p.teamLost[x.id]) && !(p.teams && p.teams[x.id])) l[x.id] = p.teamLost[x.id]; }); p.teamLost = l; } else delete p.teamLost;
  }
  function bind() {
    const c = document.getElementById("teamCard");
    if (c) c.addEventListener("click", function () { BD.Sound.tap(); openHub(); });
  }
  return { TEAMS: TEAMS, LESSONS: L, LESSON_XP: LESSON_XP, GRADIENT: GRADIENT, BRAND_STOPS: BRAND_STOPS, upkeep: upkeep, enforce: enforce, byId: byId, eligible: eligible, joined: joined, myTeams: myTeams, invites: invites, logo: logo, join: join, card: card, openHub: openHub, startLesson: startLesson, parentHTML: parentHTML, lessonIndex: lessonIndex, ageGroup: ageGroup, sanitize: sanitize, bind: bind };
})();
