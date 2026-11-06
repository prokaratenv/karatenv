// The artifact host supplies <!doctype>, <html>, <head> and <body>; keep only what goes inside them.
import { readFileSync, writeFileSync } from 'node:fs';
const file = process.argv[2];
let html = readFileSync(file, 'utf8');
html = html
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?html[^>]*>/gi, '')
  .replace(/<\/?head>/gi, '')
  .replace(/<\/?body[^>]*>/gi, '')
  .replace(/<meta charset="UTF-8" \/>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '');
const title = html.match(/<title>.*?<\/title>/)[0];
html = `${title}\n<meta name="claude:viewport-fit-sides" content="cover">\n${html.replace(title, '').trim()}\n`;
writeFileSync(file, html);
