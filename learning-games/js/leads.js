/* PARENT REPORT SIGN-UP — students always play free with no sign-up.
   In the Parent corner, a grown-up unlocks the free Parent Progress Report
   once (per device) with their first and last name and email. Signing up also
   enrolls them in Engage's free Parent Handbook email series (GoHighLevel),
   as the form and the Terms say. Optional extras: free-class offers and
   text messages (each its own unchecked box).
   Kid-safe (COPPA): only reached behind the parent PIN, the grown-up
   confirms they're 18+, and nothing at all is collected about the child.
   Sign-ups go to every URL in BD.CONFIG.leadEndpoints (GoHighLevel inbound
   webhook, Google Sheet) and, on the Claude link, an owner-only list. */
window.BD = window.BD || {};

BD.Leads = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return BD.UI.esc(s); };
  const DONE_KEY = "brainDojo.signedUp", PENDING_KEY = "brainDojo.leadPending";
  const TERMS_VERSION = "2026-11-23";
  const read = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = function (k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* blocked */ } };
  const cfg = function () { return BD.CONFIG || {}; };
  const studio = function () { return cfg().studioName || "Engage Lifestyle Martial Arts"; };
  function endpoints() {
    const list = [].concat(cfg().leadEndpoints || [], cfg().leadEndpoint || []);
    return list.filter(function (u, i) { return typeof u === "string" && /^(https:\/\/|http:\/\/localhost[:/])[^\s"<>]+$/i.test(u) && list.indexOf(u) === i; });
  }

  let db = null, user = null, ready = null, owner = false, dbOk = false;
  function connect() {
    if (ready) return ready;
    ready = (async function () {
      if (!window.claude || typeof window.claude.use !== "function") return;
      try { const r = await Promise.all([window.claude.use("db"), window.claude.use("user")]); db = r[0]; user = r[1]; } catch (e) { db = null; user = null; }
      try { owner = !!(user && user.isOwner()); } catch (e) { owner = false; }
      // Only gate on the Claude link when this viewer can actually save a sign-up.
      try { dbOk = !!(db && user && (await user.id()) && user.can && user.can("data.write") !== false); } catch (e) { dbOk = false; }
    })();
    return ready;
  }
  function signedUp() { return !!read(DONE_KEY); }
  /* The report is locked until sign-up, but only where a sign-up can be delivered
     (never lock parents out because nothing is set up) and never for the owner. */
  function locked() { return !signedUp() && !owner && (endpoints().length > 0 || dbOk); }

  /* ---------- checks ---------- */
  const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/;
  function cleanLead(f) {
    const clean = function (v) { return String(v || "").replace(/[\u0000-\u001f\u007f<>{}[\]\\`"=]/g, "").trim().slice(0, 40); };
    const name = clean(f.name), last = clean(f.last);
    const email = String(f.email || "").trim().toLowerCase().slice(0, 254);
    const phone = String(f.phone || "").replace(/[^\d+()\- .]/g, "").trim().slice(0, 20);
    if (!name) return { error: "Please add your first name." };
    if (!last) return { error: "Please add your last name." };
    if (!EMAIL_RE.test(email)) return { error: "Please check your email address." };
    if (f.sms && phone.replace(/\D/g, "").length < 10) return { error: "Add your mobile number for texts, or uncheck the text box." };
    if (!f.sms && f.phone && String(f.phone).trim()) return { error: "To get texts, check the text message box (or clear the number)." };
    if (!f.adult) return { error: "Please confirm you're a parent or guardian, 18 or older, and agree to the Terms." };
    const tags = ["Brain Dojo", "Parent Progress Report", "Parent Handbook"].concat(f.offers ? ["Free Class Offers"] : [], f.sms ? ["SMS Opt-In"] : [], f.member === "yes" ? ["Engage Member"] : ["Prospect"]);
    return { lead: {
      source: "Brain Dojo", first_name: name, last_name: last, email: email, phone: f.sms ? phone : "",
      member: f.member === "yes" ? "Engage member" : "Not a member yet",
      handbook: true, offers: !!f.offers, sms_consent: !!f.sms,
      tags: tags.join(","),
      consent: "Parent/guardian 18+ agreed to the Brain Dojo Terms (" + TERMS_VERSION + ") and to emails from " + studio() + ", including the free Parent Handbook series" +
        (f.offers ? ", plus free class offers and events" : "") + (f.sms ? ", plus text messages to the number given" : "") + ". Unsubscribe any time.",
      terms_version: TERMS_VERSION,
      date: new Date().toISOString()
    } };
  }

  /* ---------- sending ---------- */
  async function send(lead) {
    let ok = false;
    for (const url of endpoints()) {
      try {
        // Form-encoded, no-cors: GoHighLevel inbound webhooks and Google Apps Script both read it.
        const body = new URLSearchParams();
        Object.keys(lead).forEach(function (k) { body.append(k, String(lead[k])); });
        await fetch(url, { method: "POST", mode: "no-cors", body: body, credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer" });
        ok = true;
      } catch (e) { /* offline or blocked */ }
    }
    await connect();
    if (db && user) {
      try { const id = await user.id(); if (id) { await db.doc("leads/" + id).set(lead); ok = true; } } catch (e) { /* this viewer can't write here */ }
    }
    return ok;
  }
  async function flush() {
    const raw = read(PENDING_KEY); if (!raw) return;
    let lead = null; try { lead = JSON.parse(raw); } catch (e) { write(PENDING_KEY, null); return; }
    if (lead && typeof lead === "object" && await send(lead)) write(PENDING_KEY, null);
  }

  /* ---------- terms ---------- */
  function termsHTML() {
    const s = esc(studio()), site = esc(cfg().studioSite || "");
    return '<div class="terms">' +
      '<p class="muted small">Version ' + TERMS_VERSION + '</p>' +
      '<h4 class="label">Free for students</h4><p>Brain Dojo is free. Students can play every game without anyone signing up. Only the Parent Progress Report asks for a parent\'s email.</p>' +
      '<h4 class="label">What we collect</h4><p>From the parent or guardian only: first and last name, email, whether your family trains at ' + s + ', and, only if you choose texts, a mobile number. That\'s all. We never collect anything about your child for our email list: no names, no ages or grades, no progress. Your child\'s first name and progress stay on your own devices.</p>' +
      '<h4 class="label">How we use it</h4><p>When you unlock the free Parent Progress Report, you\'re added to ' + s + '\'s free <strong>Parent Handbook</strong> email series: tips on focus, confidence, respect and habits at home, plus news from our school. If you check the box, we\'ll also send free trial class offers, events and specials. If you opt in to texts, we\'ll text class reminders and offers. Message frequency varies; message and data rates may apply. Reply STOP to stop texts or HELP for help.</p>' +
      '<h4 class="label">Your choices</h4><p>Every email has an unsubscribe link, and you can leave any time. Unsubscribing doesn\'t lock the report on this device. Texts are never required.</p>' +
      '<h4 class="label">Family account (optional)</h4><p>If you sign in with your email to use Brain Dojo on several devices, your children\'s profiles (first name and Brain Dojo progress) are <strong>encrypted on your device before they\'re sent</strong>, using a key made from your email. We store only that scrambled data, an anonymous family number and fingerprints of your linked devices. We don\'t store your email address or your children\'s names in readable form, and we can\'t read your family\'s data. Your email is used only to send the 6-digit sign-in code, which isn\'t marketing. You can sign out any device, or delete your family data from the Parent corner at any time.</p>' +
      '<h4 class="label">Leaderboard (optional)</h4><p>If you add your child to the Dojo Challenge (you\'ll need to sign in with your email), other families see only a nickname your child builds from our kid-safe word lists (like "Swift Panda 27", never close to their real name) or a first initial, plus their belt color and weekly points. No names are ever stored or shown.</p>' +
      '<h4 class="label">We never sell it</h4><p>We don\'t sell, rent or share your information with other companies for their marketing. It\'s kept in our customer system (for example, GoHighLevel) only to send what you asked for.</p>' +
      '<h4 class="label">Kids\' privacy</h4><p>Brain Dojo is for kids, so the sign-up is behind the parent PIN and only a parent or guardian 18 or older may sign up. If you think a child gave us information, contact us and we\'ll delete it.</p>' +
      '<h4 class="label">Questions or deletion requests</h4><p>Contact ' + s + (site ? ' at <a href="' + site + '" target="_blank" rel="noopener noreferrer">' + site.replace(/^https?:\/\//, "") + '</a>' : '') + '. Brain Dojo is a free learning game for practice at home and doesn\'t replace your child\'s school or teacher.</p></div>';
  }
  function openTerms(back) {
    BD.UI.sheet("Brain Dojo Terms & Privacy", termsHTML() + (back ? '<div class="res-actions"><button type="button" class="btn btn-primary" id="termsBack">Back</button></div>' : ''));
    if (back && $("termsBack")) $("termsBack").onclick = back;
  }

  /* ---------- the unlock form (shown in the Parent corner) ---------- */
  let openedAt = 0;
  function formHTML() {
    return '<div class="unlock-report">' +
      '<div class="ur-head"><span class="ur-icon" aria-hidden="true">📊</span><div><h2>Unlock your free Parent Progress Report</h2>' +
      '<p>See each child\'s week, belt progress, strengths, what to work on and tips to try at home, and share a weekly progress card. Free, one time on this device.</p></div></div>' +
      '<ul class="ur-gets"><li>📊 Parent Progress Report for every child</li><li>📘 Engage\'s free <strong>Parent Handbook</strong> email series</li><li>📝 School Words and weekly progress cards</li></ul>' +
      '<div class="lead-form">' +
      '<div class="lf-row"><label class="lf"><span>Your first name</span><input id="lfName" type="text" autocomplete="given-name" maxlength="40" required></label>' +
      '<label class="lf"><span>Your last name</span><input id="lfLast" type="text" autocomplete="family-name" maxlength="40" required></label></div>' +
      '<label class="lf"><span>Email</span><input id="lfEmail" type="email" autocomplete="email" inputmode="email" maxlength="254" required></label>' +
      '<label class="lf hp" aria-hidden="true"><span>Company</span><input id="lfCompany" type="text" tabindex="-1" autocomplete="off"></label>' +
      '<fieldset class="lf-set"><legend>Does your child train at ' + esc(studio().split(" ")[0]) + '?</legend>' +
      '<label class="lf-chip"><input type="radio" name="lfMember" value="yes"> Yes, we\'re members</label>' +
      '<label class="lf-chip"><input type="radio" name="lfMember" value="no" checked> Not yet</label></fieldset>' +
      '<fieldset class="lf-set"><legend>Optional extras</legend>' +
      '<label class="lf-check"><input type="checkbox" id="lfOffers"> Also send me free trial class offers, events and specials</label>' +
      '<label class="lf-check"><input type="checkbox" id="lfSms"> Text me class reminders and offers</label>' +
      '<label class="lf" id="lfPhoneRow" hidden><span>Mobile number</span><input id="lfPhone" type="tel" autocomplete="tel" maxlength="20"></label></fieldset>' +
      '<label class="lf-check lf-adult"><input type="checkbox" id="lfAdult"> <span>I\'m a parent or guardian, 18 or older, and I agree to the <button type="button" class="link-btn" id="lfTerms">Terms &amp; Privacy</button>.</span></label>' +
      '<p class="muted small lf-fine">By tapping <strong>Unlock my free report</strong>, you agree to receive emails from ' + esc(studio()) + ', including the free Parent Handbook series' +
      ', and any extras you checked. Unsubscribe any time. Texts only if you opt in; message and data rates may apply; reply STOP to cancel. We never sell your information or collect information from children.</p>' +
      '<p class="lf-msg" id="lfMsg" aria-live="polite"></p>' +
      '<div class="res-actions"><button type="button" class="btn btn-primary btn-big" id="lfGo">Unlock my free report</button></div>' +
      '<p class="muted small center">Students can keep playing Brain Dojo for free either way.</p></div></div>';
  }
  /* Renders the form into el; onDone runs once they're signed up. */
  function renderUnlock(el, onDone) {
    openedAt = Date.now();
    el.innerHTML = formHTML();
    const saved = {};
    const keep = function () { ["lfName", "lfLast", "lfEmail", "lfPhone"].forEach(function (id) { saved[id] = $(id) ? $(id).value : ""; }); };
    $("lfSms").onchange = function () { $("lfPhoneRow").hidden = !$("lfSms").checked; if ($("lfSms").checked) $("lfPhone").focus(); };
    $("lfTerms").onclick = function (e) { e.preventDefault(); keep(); openTerms(function () { $("infoClose").click(); }); };
    $("lfGo").onclick = async function () {
      const msg = function (t, good) { $("lfMsg").textContent = t; $("lfMsg").className = "lf-msg" + (good ? " good" : ""); };
      if ($("lfCompany").value || Date.now() - openedAt < 2500) { msg("One moment… tap again.", true); openedAt = Date.now() - 2500 + 800; return; }
      const memberEl = document.querySelector('input[name="lfMember"]:checked');
      const c = cleanLead({ name: $("lfName").value, last: $("lfLast").value, email: $("lfEmail").value, phone: $("lfSms").checked ? $("lfPhone").value : "", sms: $("lfSms").checked, member: memberEl ? memberEl.value : "no", offers: $("lfOffers").checked, adult: $("lfAdult").checked });
      if (c.error) { msg(c.error); return; }
      $("lfGo").disabled = true; msg("Unlocking…", true);
      const ok = await send(c.lead);
      if (!ok) write(PENDING_KEY, JSON.stringify(c.lead));
      write(DONE_KEY, new Date().toISOString());
      BD.Sound.right(); BD.confetti(80);
      BD.UI.sheet("Report unlocked!", '<div class="chest-wrap opened"><div class="chest-prize">📊</div><h3>Welcome, ' + esc(c.lead.first_name) + '!</h3>' +
        '<p>Your Parent Progress Report is unlocked on this device.</p><p>' + (ok ? "Watch your inbox: the first Parent Handbook email from " + esc(studio()) + " is on its way." : "You seem to be offline. We'll send your sign-up the next time Brain Dojo opens.") + '</p>' +
        '<div class="res-actions"><button type="button" class="btn btn-primary" id="lfDone">See my report</button></div></div>');
      $("lfDone").onclick = function () { $("infoClose").click(); if (onDone) onDone(); };
    };
    setTimeout(function () { if ($("lfName")) $("lfName").focus(); }, 80);
  }

  /* ---------- owner tools on the Claude link ---------- */
  function ownerHTML() {
    return owner ? '<div class="lead-owner"><span>🔒 Owner only: Parent report sign-ups saved on this link</span><button type="button" class="btn btn-small" id="leadExport">Download sign-ups (CSV)</button><span class="muted small" id="leadCount"></span></div>' : "";
  }
  function bindOwner() { if ($("leadExport")) $("leadExport").onclick = exportCsv; }
  async function exportCsv() {
    await connect(); if (!db) return;
    let rows = [];
    try { const snap = await db.collection("leads").get(); rows = snap.docs.map(function (d) { return d.data() || {}; }); }
    catch (e) { $("leadCount").textContent = "Couldn't read the list here."; return; }
    const cols = ["date", "first_name", "last_name", "email", "phone", "sms_consent", "member", "handbook", "offers", "tags", "consent", "terms_version", "source"];
    const cell = function (v) { v = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    const csv = [cols.join(",")].concat(rows.map(function (r) { return cols.map(function (c) { return cell(r[c] !== undefined ? r[c] : c === "first_name" ? r.name : ""); }).join(","); })).join("\r\n");
    $("leadCount").textContent = rows.length + (rows.length === 1 ? " sign-up" : " sign-ups");
    const blob = new Blob([csv], { type: "text/csv" }), name = "brain-dojo-signups-" + BD.today() + ".csv";
    let dl = null; try { dl = await window.claude.use("downloads"); } catch (e) { dl = null; }
    if (dl) { try { await dl.save({ filename: name, data: blob }); } catch (e) { /* declined */ } return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  /* Welcome screen: a link for grown-ups that goes to the (PIN-protected) Parent corner. */
  function welcomeLink() {
    const el = $("welcomeLead"); if (!el) return;
    el.hidden = !locked() || !BD.Store.players().length;
  }
  function bind() {
    if ($("welcomeLead")) $("welcomeLead").addEventListener("click", function () { $("parentBtn").click(); });
    flush();
    connect().then(function () { welcomeLink(); if (BD.UI.refresh) BD.UI.refresh(); });
    welcomeLink();
  }

  return { locked: locked, signedUp: signedUp, renderUnlock: renderUnlock, openTerms: openTerms, ownerHTML: ownerHTML, bindOwner: bindOwner, cleanLead: cleanLead, bind: bind, welcomeLink: welcomeLink, connect: connect };
})();
