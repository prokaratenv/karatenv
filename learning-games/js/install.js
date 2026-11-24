/* INSTALL — "Add Brain Dojo to your home screen" so it opens full screen like
   an app. Android/Chrome: a button that calls the browser's own install
   prompt. iPhone/iPad Safari: a small card with the Share > Add to Home
   Screen steps. Never inside the Claude version, never once installed.
   Shows on the 2nd visit or after the first finished round; "Not now" hides
   it for 14 days. The Me tab always has "Install the app". */
window.BD = window.BD || {};

BD.Install = (function () {
  const KEY = "brainDojo.install", WAIT = 14 * 864e5;
  let deferred = null, shownThisVisit = false;
  function st() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  function inClaude() { return !!(window.claude && typeof window.claude.use === "function"); }
  function standalone() {
    try { if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true; } catch (e) { /* old browser */ }
    return window.navigator.standalone === true;
  }
  function ios() {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  }
  function iosSafari() { const ua = navigator.userAgent || ""; return ios() && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua); }
  function possible() { return !inClaude() && !standalone() && (!!deferred || iosSafari()); }
  function snoozed() { const s = st(); return s.no && Date.now() - s.no < WAIT; }

  /* count visits once per page load */
  (function () { const s = st(); s.visits = (s.visits || 0) + 1; save(s); })();

  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; maybeShow(); renderMe(); });
  window.addEventListener("appinstalled", function () { deferred = null; hide(); const s = st(); s.done = Date.now(); save(s); renderMe(); });

  function eligible() { const s = st(); return possible() && !snoozed() && !s.done && ((s.visits || 0) >= 2 || s.round); }
  function maybeShow() {
    if (shownThisVisit || !eligible()) return;
    if (!document.getElementById("screen-home") || document.getElementById("screen-home").hidden) return;
    if (BD.UI && BD.UI.sheetOpen && BD.UI.sheetOpen()) { setTimeout(maybeShow, 2500); return; } // never on top of another message
    show();
  }
  function stepsHTML() {
    return '<ol class="inst-steps"><li>Tap ' + BD.Icon.svg("share", 18) + ' <strong>Share</strong> in Safari</li><li>Choose ' + BD.Icon.svg("plusSquare", 18) + ' <strong>Add to Home Screen</strong></li><li>Tap <strong>Add</strong>. Brain Dojo opens full screen from your home screen.</li></ol>';
  }
  function show() {
    if (document.getElementById("installCard")) return;
    shownThisVisit = true;
    const c = document.createElement("div"); c.className = "install-card"; c.id = "installCard"; c.setAttribute("role", "dialog"); c.setAttribute("aria-label", "Add Brain Dojo to your home screen");
    c.innerHTML = '<button type="button" class="inst-x" data-inst="no" aria-label="Not now">' + BD.Icon.svg("close", 18) + '</button>' +
      '<div class="inst-head"><img src="img/apple-touch-icon.png" alt="" width="44" height="44"><div><strong>Add Brain Dojo to your home screen</strong><span>Opens full screen, like an app.</span></div></div>' +
      (deferred ? '<div class="inst-actions"><button type="button" class="btn btn-primary btn-small" data-inst="go">Install</button><button type="button" class="btn btn-quiet btn-small" data-inst="no">Not now</button></div>' : stepsHTML() + '<div class="inst-actions"><button type="button" class="btn btn-quiet btn-small" data-inst="no">Not now</button></div>');
    c.addEventListener("click", function (e) {
      const b = e.target.closest("[data-inst]"); if (!b) return;
      if (b.dataset.inst === "no") { const s = st(); s.no = Date.now(); save(s); hide(); }
      else install();
    });
    document.body.appendChild(c);
  }
  function hide() { const c = document.getElementById("installCard"); if (c) c.remove(); }
  function install() {
    if (deferred) {
      const d = deferred; deferred = null; hide();
      try { d.prompt(); if (d.userChoice) d.userChoice.then(function (r) { if (r && r.outcome === "accepted") { const s = st(); s.done = Date.now(); save(s); } renderMe(); }); } catch (e) { /* ignore */ }
      return;
    }
    if (inClaude()) { BD.UI.sheet("Install the app", '<p>Brain Dojo installs from <strong>brain.engagelma.com</strong>. Open it in Safari or Chrome, then add it to your home screen.</p>'); return; }
    if (standalone()) { BD.UI.sheet("Install the app", '<p>Brain Dojo is already installed on this device. Nice!</p>'); return; }
    BD.UI.sheet("Install the app", (iosSafari() ? '<p>On iPhone and iPad:</p>' + stepsHTML() :
      '<p>In Chrome or Edge, open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p><p class="muted small">On iPhone or iPad, open brain.engagelma.com in Safari, tap Share, then Add to Home Screen.</p>'));
  }
  /* Me tab: permanent item. */
  function renderMe() {
    const host = document.querySelector("#panelMe .me-actions"); if (!host) return;
    let b = document.getElementById("meInstall");
    if (!b) {
      b = document.createElement("button"); b.type = "button"; b.className = "me-btn"; b.id = "meInstall";
      b.innerHTML = '<span class="me-ico" aria-hidden="true">' + BD.Icon.svg("install", 22) + '</span><span>Install the app</span>';
      b.addEventListener("click", function () { BD.Sound.tap(); install(); });
      host.appendChild(b);
    }
    b.hidden = inClaude() || standalone();
  }
  if (BD.on) {
    BD.on("home", function () { renderMe(); setTimeout(maybeShow, 1200); });
    BD.on("results", function () { const s = st(); if (!s.round) { s.round = 1; save(s); } });
    BD.on("screen", function (id) { if (id !== "screen-home") hide(); });
  }
  return { possible: possible, eligible: eligible, show: show, hide: hide, install: install, standalone: standalone, iosSafari: iosSafari, renderMe: renderMe, _st: st };
})();
