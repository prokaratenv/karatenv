/* PARENT SIGN-UP — grown-ups can join Engage's parent newsletter and/or
   free-class offers. Kid-safe by design (COPPA): the form is only reached
   through the Parent corner or a grown-up check, asks the grown-up to
   confirm they're a parent or guardian, collects nothing about the child
   except their grade, and nothing is pre-checked.
   Sign-ups go to BD.CONFIG.leadEndpoint (your Google Sheet or CRM) and,
   on the Claude-hosted version, to a private list only the owner can read. */
window.BD = window.BD || {};

BD.Leads = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const DONE_KEY = "brainDojo.signedUp", PENDING_KEY = "brainDojo.leadPending";
  const read = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = function (k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* blocked */ } };
  const cfg = function () { return BD.CONFIG || {}; };

  let db = null, user = null, ready = null;
  function connect() {
    if (ready) return ready;
    ready = (async function () {
      if (!window.claude || typeof window.claude.use !== "function") return;
      try { const r = await Promise.all([window.claude.use("db"), window.claude.use("user")]); db = r[0]; user = r[1]; } catch (e) { db = null; user = null; }
    })();
    return ready;
  }
  /* Somewhere to send a sign-up? (Your endpoint, or the Claude-hosted private list.) */
  async function available() {
    if (cfg().leadEndpoint) return true;
    await connect();
    return !!db;
  }
  function signedUp() { return !!read(DONE_KEY); }

  /* ---------- checks ---------- */
  const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/;
  function cleanLead(f) {
    const name = String(f.name || "").replace(/[\u0000-\u001f\u007f<>{}[\]\\`"]/g, "").trim().slice(0, 40);
    const email = String(f.email || "").trim().toLowerCase().slice(0, 254);
    const phone = String(f.phone || "").replace(/[^\d+()\- .]/g, "").trim().slice(0, 20);
    if (!name) return { error: "Please add your first name." };
    if (!EMAIL_RE.test(email)) return { error: "Please check your email address." };
    if (phone && phone.replace(/\D/g, "").length < 7) return { error: "Please check the phone number, or leave it blank." };
    if (!f.newsletter && !f.offers) return { error: "Pick at least one: the parent newsletter or free class offers." };
    if (!f.adult) return { error: "Please confirm you're a parent or guardian, 18 or older." };
    const kids = BD.Store.players().map(function (p) { return BD.gradeLabel(BD.Rank.dojoGrade(p)); });
    return { lead: {
      source: "Brain Dojo", name: name, email: email, phone: phone,
      member: f.member === "yes" ? "Engage member" : "Not a member yet",
      newsletter: !!f.newsletter, offers: !!f.offers,
      childGrades: kids.filter(function (g, i) { return kids.indexOf(g) === i; }).join(", ").slice(0, 80),
      consent: "Parent/guardian 18+ agreed to emails from " + (cfg().studioName || "Engage") + " about: " + [f.newsletter ? "parent newsletter" : "", f.offers ? "free class offers and events" : ""].filter(Boolean).join(" and ") + ". Unsubscribe any time.",
      date: new Date().toISOString()
    } };
  }

  /* ---------- sending ---------- */
  async function send(lead) {
    let ok = false;
    if (cfg().leadEndpoint) {
      try {
        // Form-encoded, no-cors: works with a Google Apps Script web app or a CRM inbound webhook.
        const body = new URLSearchParams();
        Object.keys(lead).forEach(function (k) { body.append(k, String(lead[k])); });
        await fetch(cfg().leadEndpoint, { method: "POST", mode: "no-cors", body: body, credentials: "omit", cache: "no-store" });
        ok = true;
      } catch (e) { /* offline or blocked */ }
    }
    await connect();
    if (db && user) {
      try { const id = await user.id(); if (id) { await db.doc("leads/" + id).set(lead); ok = true; } } catch (e) { /* this viewer can't write here */ }
    }
    return ok;
  }
  /* Retry a sign-up that couldn't be sent (offline). */
  async function flush() {
    const raw = read(PENDING_KEY); if (!raw) return;
    let lead = null; try { lead = JSON.parse(raw); } catch (e) { write(PENDING_KEY, null); return; }
    if (await send(lead)) write(PENDING_KEY, null);
  }

  /* ---------- the form ---------- */
  let openedAt = 0;
  function form(onDone) {
    openedAt = Date.now();
    BD.UI.sheet("Free parent tips & a free class",
      '<div class="lead-form">' +
      '<p>Get <strong>' + esc(cfg().studioName || "Engage") + '</strong>\'s parent newsletter (tips that build focus, confidence and good habits) and/or offers for a <strong>free trial class</strong> and family events.</p>' +
      '<label class="lf"><span>Your first name</span><input id="lfName" type="text" autocomplete="given-name" maxlength="40" required></label>' +
      '<label class="lf"><span>Email</span><input id="lfEmail" type="email" autocomplete="email" inputmode="email" maxlength="254" required></label>' +
      '<label class="lf"><span>Mobile <em class="muted">(optional, for class reminders)</em></span><input id="lfPhone" type="tel" autocomplete="tel" maxlength="20"></label>' +
      '<label class="lf hp" aria-hidden="true"><span>Company</span><input id="lfCompany" type="text" tabindex="-1" autocomplete="off"></label>' +
      '<fieldset class="lf-set"><legend>Does your child train at Engage?</legend>' +
      '<label class="lf-chip"><input type="radio" name="lfMember" value="yes"> Yes, we\'re members</label>' +
      '<label class="lf-chip"><input type="radio" name="lfMember" value="no" checked> Not yet</label></fieldset>' +
      '<fieldset class="lf-set"><legend>Send me:</legend>' +
      '<label class="lf-check"><input type="checkbox" id="lfNews"> The Engage parent newsletter</label>' +
      '<label class="lf-check"><input type="checkbox" id="lfOffers"> Free trial class offers, events and specials</label></fieldset>' +
      '<label class="lf-check lf-adult"><input type="checkbox" id="lfAdult"> I\'m a parent or guardian, 18 or older</label>' +
      '<p class="muted small">By signing up you agree that ' + esc(cfg().studioName || "Engage") + ' may email you (and text you, if you add a number) about what you picked. Unsubscribe any time. We never collect information from children, and we never sell or share your details.</p>' +
      '<p class="lf-msg" id="lfMsg" aria-live="polite"></p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="lfGo">Sign me up</button></div></div>');
    $("lfGo").onclick = async function () {
      const msg = function (t, good) { $("lfMsg").textContent = t; $("lfMsg").className = "lf-msg" + (good ? " good" : ""); };
      if ($("lfCompany").value || Date.now() - openedAt < 2500) { msg("Thanks!", true); return; } // a bot filled the hidden field or was too fast
      const memberEl = document.querySelector('input[name="lfMember"]:checked');
      const c = cleanLead({ name: $("lfName").value, email: $("lfEmail").value, phone: $("lfPhone").value, member: memberEl ? memberEl.value : "no", newsletter: $("lfNews").checked, offers: $("lfOffers").checked, adult: $("lfAdult").checked });
      if (c.error) { msg(c.error); return; }
      $("lfGo").disabled = true; msg("Sending…", true);
      const ok = await send(c.lead);
      if (!ok) write(PENDING_KEY, JSON.stringify(c.lead));
      write(DONE_KEY, new Date().toISOString());
      document.getElementById("infoBody").innerHTML = '<div class="chest-wrap opened"><div class="chest-prize">📬</div><h3>You\'re on the list, ' + esc(c.lead.name) + '!</h3>' +
        '<p>' + (ok ? "Watch your inbox for a welcome email from " + esc(cfg().studioName || "Engage") + "." : "You seem to be offline. We'll send your sign-up the next time Brain Dojo opens.") + '</p>' +
        (c.lead.offers && c.lead.member !== "Engage member" ? '<p class="muted">Your free trial class: we\'ll be in touch to find a time that works for your family.</p>' : '') +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="lfDone">Done</button></div></div>';
      $("lfDone").onclick = function () { $("infoClose").click(); welcomeLink(); if (onDone) onDone(); };
    };
    setTimeout(function () { if ($("lfName")) $("lfName").focus(); }, 80);
  }

  /* A grown-up check before the form (when it isn't opened from the Parent corner). */
  function grownUp(then) {
    const a = 12 + Math.floor(Math.random() * 9), b = 3 + Math.floor(Math.random() * 6);
    BD.UI.sheet("For grown-ups", '<p>This part is for parents and guardians. Grown-up check: what is <strong>' + a + ' × ' + b + '</strong>?</p>' +
      '<div class="pin-row"><label class="sr-only" for="guIn">Answer</label><input id="guIn" class="pin-input" type="text" inputmode="numeric" maxlength="4" autocomplete="off">' +
      '<button type="button" class="btn btn-primary" id="guGo">OK</button></div><p class="pin-msg" id="guMsg" aria-live="polite"></p>');
    const go = function () { if (Number($("guIn").value) === a * b) then(); else $("guMsg").textContent = "Not quite. Ask a grown-up!"; };
    $("guGo").onclick = go; $("guIn").onkeydown = function (e) { if (e.key === "Enter") go(); };
    setTimeout(function () { $("guIn").focus(); }, 60);
  }
  function openFromKid() { grownUp(function () { form(); }); }

  /* ---------- Parent corner card + owner export ---------- */
  async function parentCard(el) {
    if (!el) return;
    const can = await available();
    let isOwner = false;
    if (user) { try { isOwner = user.isOwner(); } catch (e) { isOwner = false; } }
    const done = signedUp();
    el.hidden = !can && !isOwner;
    el.innerHTML = (can ? '<div class="lead-card"><span class="lead-icon" aria-hidden="true">📬</span><div><strong>' + (done ? "You're signed up ✓" : "Free parent tips & a free trial class") + '</strong>' +
      '<p class="muted small">' + (done ? "Thanks for joining the " + esc(cfg().studioName || "Engage") + " family list." : "Join the " + esc(cfg().studioName || "Engage") + " parent newsletter and get free class offers. Takes 20 seconds.") + '</p></div>' +
      (done ? '' : '<button type="button" class="btn btn-gold" id="leadOpen">Sign me up</button>') + '</div>' : '') +
      (isOwner ? '<div class="lead-owner"><span>🔒 Owner only: parent sign-ups saved here</span><button type="button" class="btn btn-small" id="leadExport">Download sign-ups (CSV)</button><span class="muted small" id="leadCount"></span></div>' : '');
    if ($("leadOpen")) $("leadOpen").onclick = function () { form(function () { parentCard(el); }); };
    if ($("leadExport")) $("leadExport").onclick = exportCsv;
  }
  async function exportCsv() {
    await connect(); if (!db) return;
    let rows = [];
    try { const snap = await db.collection("leads").get(); rows = snap.docs.map(function (d) { return d.data() || {}; }); }
    catch (e) { $("leadCount").textContent = "Couldn't read the list here."; return; }
    const cols = ["date", "name", "email", "phone", "member", "newsletter", "offers", "childGrades", "consent", "source"];
    const cell = function (v) { v = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    const csv = [cols.join(",")].concat(rows.map(function (r) { return cols.map(function (c) { return cell(r[c]); }).join(","); })).join("\r\n");
    $("leadCount").textContent = rows.length + (rows.length === 1 ? " sign-up" : " sign-ups");
    const blob = new Blob([csv], { type: "text/csv" }), name = "brain-dojo-signups-" + BD.today() + ".csv";
    let dl = null; try { dl = await window.claude.use("downloads"); } catch (e) { dl = null; }
    if (dl) { try { await dl.save({ filename: name, data: blob }); } catch (e) { /* declined */ } return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  /* Welcome screen link for grown-ups. */
  async function welcomeLink() {
    const el = $("welcomeLead"); if (!el) return;
    el.hidden = !(await available()) || signedUp();
  }
  function bind() {
    if ($("welcomeLead")) $("welcomeLead").addEventListener("click", openFromKid);
    flush(); welcomeLink();
  }

  return { form: form, openFromKid: openFromKid, parentCard: parentCard, cleanLead: cleanLead, available: available, bind: bind, welcomeLink: welcomeLink };
})();
