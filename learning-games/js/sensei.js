/* ASK SENSEI — a kid-friendly AI tutor.
   It only switches on where the page can reach Claude (the shared Claude
   link). Everywhere else the button stays hidden and the built-in
   step-by-step help still works. */
window.BD = window.BD || {};

BD.Sensei = (function () {
  const $ = function (id) { return document.getElementById(id); };
  let sample = null, ctx = null, turns = [], ctl = null, busy = false;

  function init() {
    if (!window.claude || typeof window.claude.use !== "function") return;
    window.claude.use("sample").then(function (fn) {
      if (fn) { sample = fn; document.body.classList.add("has-sensei"); }
    }).catch(function () { /* stays hidden */ });
  }

  function disable() {
    sample = null;
    document.body.classList.remove("has-sensei");
  }

  function rules() {
    return [
      "You are Sensei, a warm, patient tutor inside a homeschool practice game with a karate theme.",
      "The student is a child in grade " + ctx.grade + " (about age " + (ctx.grade + 5) + ").",
      "How to answer:",
      "- Use short, simple sentences and words a " + ctx.grade + "th grader knows. Stay under 120 words.",
      "- Teach one idea at a time. Short numbered steps are good. Small examples are good.",
      "- Plain text only. No markdown headings, bold, tables or LaTeX. Use × and ÷ for times and divide.",
      "- Be encouraging, but don't overdo praise. End with a quick question or a next step when it helps.",
      ctx.revealed
        ? "- The answer has already been shown to the student, so you may explain it fully."
        : "- The student has NOT finished this yet. Do NOT tell them the final answer or write out the corrected sentence. Guide them with hints, questions and similar examples so they figure it out.",
      "- Only help with schoolwork. If they ask about something unrelated, kindly steer them back to practice.",
      "- The facts below are correct. Trust them over your own arithmetic.",
      "",
      "What the student is looking at:",
      ctx.facts
    ].join("\n");
  }

  function open(context) {
    if (!context) return;
    ctx = context; turns = [];
    $("senseiContext").textContent = context.title;
    $("senseiLog").innerHTML = '<p class="bubble sensei">' + (context.revealed
      ? "What would you like to know about this one? Ask me anything."
      : "Stuck? I'll help you figure it out without just giving you the answer. What's confusing?") + "</p>";
    $("senseiChips").innerHTML = context.chips.map(function (c) {
      return '<button type="button" class="chip" data-q="' + BD.UI.esc(c) + '">' + BD.UI.esc(c) + "</button>";
    }).join("");
    $("senseiInput").value = "";
    $("senseiSheet").hidden = false;
    document.body.classList.add("sheet-lock");
    setTimeout(function () { $("senseiInput").focus(); }, 50);
  }

  function close() {
    if (ctl) ctl.abort();
    $("senseiSheet").hidden = true;
    document.body.classList.remove("sheet-lock");
  }

  function bubble(cls, text) {
    const p = document.createElement("p");
    p.className = "bubble " + cls;
    p.textContent = text;
    $("senseiLog").appendChild(p);
    $("senseiLog").scrollTop = $("senseiLog").scrollHeight;
    return p;
  }

  const MESSAGES = {
    rate_limited: "Sensei needs a short break. Try again in a minute, or use the step-by-step help.",
    refused: "Sensei can only help with schoolwork questions. Try asking about this problem.",
    session_expired: "Please sign in to Claude again, then ask your question.",
    empty_completion: "Sensei didn't catch that. Try asking a different way."
  };
  const OFF = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"];

  function ask(q) {
    q = String(q || "").trim();
    if (!q || busy || !sample) return;
    busy = true;
    bubble("kid", q);
    turns.push({ role: "user", content: q });
    turns = turns.slice(-10);
    if (turns[0].role !== "user") turns.shift();
    const out = bubble("sensei thinking", "Sensei is thinking…");
    $("senseiSend").disabled = true; $("senseiStop").hidden = false;
    ctl = new AbortController();
    sample([{ role: "user", content: rules() }].concat(turns), {
      modelTier: "quick",
      cache: false,
      signal: ctl.signal,
      onText: function (u) { out.classList.remove("thinking"); out.textContent = u.text; $("senseiLog").scrollTop = $("senseiLog").scrollHeight; }
    }).then(function (res) {
      out.classList.remove("thinking");
      out.textContent = res.text;
      turns.push({ role: "assistant", content: res.text });
    }).catch(function (e) {
      out.classList.remove("thinking");
      const code = e && e.code;
      if (code === "cancelled") { out.textContent = (e.text || "") + (e.text ? " …" : "Stopped."); }
      else if (OFF.indexOf(code) !== -1) {
        out.textContent = "Sensei isn't available here. Use the step-by-step help and the rule book instead.";
        disable();
      } else {
        out.textContent = (e && e.text ? e.text + "\n\n" : "") + (MESSAGES[code] || "Something went wrong. Tap Ask to try again.");
      }
      turns.pop();
    }).then(function () {
      busy = false;
      $("senseiSend").disabled = false; $("senseiStop").hidden = true;
      $("senseiLog").scrollTop = $("senseiLog").scrollHeight;
    });
  }

  function bind() {
    $("senseiClose").addEventListener("click", close);
    $("senseiSheet").addEventListener("click", function (e) { if (e.target === $("senseiSheet")) close(); });
    $("senseiStop").addEventListener("click", function () { if (ctl) ctl.abort(); });
    $("senseiChips").addEventListener("click", function (e) {
      const b = e.target.closest("[data-q]"); if (b) ask(b.dataset.q);
    });
    $("senseiForm").addEventListener("submit", function (e) {
      e.preventDefault();
      ask($("senseiInput").value); $("senseiInput").value = "";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("senseiSheet").hidden) close(); });
  }

  return { init: init, bind: bind, open: open, close: close, available: function () { return !!sample; } };
})();
