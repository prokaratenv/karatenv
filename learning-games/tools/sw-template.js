/* OFFLINE — Brain Dojo keeps itself on the device so it opens and plays with
   no internet. Built by tools/build-sw.py (don't edit sw.js by hand).
   - The app's own files are kept on the first visit (the big character
     pictures come down quietly afterwards).
   - Pages load from the network when online (so updates arrive) and from the
     device when offline. Everything else loads from the device first.
   - Saving progress, family sync and sign-ups are never cached: they wait on
     the device and send when the connection is back. */
const VERSION = "__VERSION__";
const CACHE = "brain-dojo-" + VERSION;
const STAMP = "__STAMP__"; // the ?v= the current pages ask for
const FONTS = "brain-dojo-fonts";
const CORE = __CORE__;
const LATER = __LATER__;

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("brain-dojo-") === 0 && k !== CACHE && k !== FONTS; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* The page asks for the rest once it's settled: fetch them a few at a time. */
self.addEventListener("message", function (e) {
  if (!e.data || e.data.type !== "warm") return;
  e.waitUntil(caches.open(CACHE).then(async function (c) {
    const todo = [];
    for (const u of LATER) if (!(await c.match(u))) todo.push(u);
    for (let i = 0; i < todo.length; i += 4) {
      await Promise.all(todo.slice(i, i + 4).map(function (u) { return fetch(u).then(function (r) { if (r.ok) return c.put(u, r); }).catch(function () {}); }));
    }
  }));
});
self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET") return; // saves and sign-ups go straight to the network
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === "navigate") {
      // online: fresh page (updates arrive); offline or slow: the kept copy
      e.respondWith(Promise.race([
        fetch(req).then(function (r) { if (r.ok) caches.open(CACHE).then(function (c) { c.put("index.html", r.clone()); }); return r; }),
        new Promise(function (_, rej) { setTimeout(rej, 4000); })
      ]).catch(function () { return caches.match("index.html", { ignoreSearch: true }); }));
      return;
    }
    // A page from a newer version asks for ?v=<other stamp>: get those files fresh, never mix versions.
    const v = url.searchParams.get("v");
    if (v && v !== STAMP) {
      e.respondWith(fetch(req).catch(function () { return caches.match(req, { ignoreSearch: true }); }));
      return;
    }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(req).then(function (r) {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return r;
      });
    }));
    return;
  }
  // Google Fonts: keep a copy so the lettering looks right offline
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(function (c) {
      return c.match(req).then(function (hit) {
        const net = fetch(req).then(function (r) { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(function () { return hit; });
        return hit || net;
      });
    }));
  }
});
