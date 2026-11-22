#!/usr/bin/env python3
"""Run after changing any app file:
    python3 tools/build-sw.py
1. Stamps every script and style link in index.html with a fingerprint of the
   files (?v=...), so browsers and Cloudflare's 4-hour cache fetch new files
   right away instead of mixing old scripts with a new page.
2. Writes sw.js (offline play) with the file list and a version made from the
   contents, so phones pick up updates on their next visit."""
import hashlib, os, json, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
# 1. version stamp for scripts and styles
stamp = hashlib.sha256()
for top in ["css", "js", "data"]:
    for dp, _, fs in os.walk(top):
        for f in sorted(fs):
            p = os.path.join(dp, f).replace(os.sep, "/")
            with open(p, "rb") as fh: stamp.update(p.encode() + fh.read())
STAMP = stamp.hexdigest()[:10]
html = open("index.html", encoding="utf-8").read()
html2 = re.sub(r'((?:src|href)="(?:css|js|data)/[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"', lambda m: m.group(1) + "?v=" + STAMP + '"', html)
if html2 != html: open("index.html", "w", encoding="utf-8").write(html2)
CORE, LATER = ["./", "index.html", "manifest.webmanifest"], []
h = hashlib.sha256()
for top in ["css", "js", "data", "img"]:
    for dp, _, fs in os.walk(top):
        for f in sorted(fs):
            p = os.path.join(dp, f).replace(os.sep, "/")
            if p == "js/masks.js": continue  # inline masks are for the Claude version only; the website uses img/mask-*.png
            with open(p, "rb") as fh: h.update(p.encode() + fh.read())
            # big character variations come down in the background after the first visit
            (LATER if p.startswith(("img/fit-", "img/age-", "img/boss-", "img/mask-")) or re.match(r"img/face-s\d\d\.webp$", p) else CORE).append(p)
for p in ["index.html", "manifest.webmanifest"]:
    with open(p, "rb") as fh: h.update(p.encode() + fh.read())
version = h.hexdigest()[:12]
tpl = open("tools/sw-template.js").read()
out = tpl.replace("__VERSION__", version).replace("__CORE__", json.dumps(sorted(set(CORE)), indent=0)).replace("__LATER__", json.dumps(sorted(LATER), indent=0))
open("sw.js", "w").write(out)
print("scripts/styles stamp", STAMP, "· sw.js version", version, "·", len(CORE), "core files,", len(LATER), "background files")
