#!/usr/bin/env python3
"""Writes sw.js with the list of files to keep for offline play and a version
made from their contents. Run it after changing any app file:
    python3 tools/build-sw.py
(The version changes whenever a file changes, so phones pick up updates.)"""
import hashlib, os, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
CORE, LATER = ["./", "index.html", "manifest.webmanifest"], []
h = hashlib.sha256()
for top in ["css", "js", "data", "img"]:
    for dp, _, fs in os.walk(top):
        for f in sorted(fs):
            p = os.path.join(dp, f).replace(os.sep, "/")
            if p.startswith("img/mask-") and p.endswith(".png"): continue  # masks are built into js/masks.js
            with open(p, "rb") as fh: h.update(p.encode() + fh.read())
            # big character variations come down in the background after the first visit
            (LATER if p.startswith(("img/fit-", "img/age-", "img/boss-")) else CORE).append(p)
for p in ["index.html", "manifest.webmanifest"]:
    with open(p, "rb") as fh: h.update(p.encode() + fh.read())
version = h.hexdigest()[:12]
tpl = open("tools/sw-template.js").read()
out = tpl.replace("__VERSION__", version).replace("__CORE__", json.dumps(sorted(set(CORE)), indent=0)).replace("__LATER__", json.dumps(sorted(LATER), indent=0))
open("sw.js", "w").write(out)
print("sw.js version", version, "·", len(CORE), "core files,", len(LATER), "background files")
