// Rebuilds data/near-words.js. Usage: node tools/near-words.js <wordlist.txt>  (one word per line, e.g. WordNet 3.1 lemmas plus regular endings)
global.window=global;require(__dirname+'/../data/spelling-bank.js');const fs=require('fs');
const LIST=process.argv[2];
const big=new Set(fs.readFileSync(LIST,'utf8').split('\n'));
const src=fs.readFileSync(__dirname+'/../js/word-quiz.js','utf8');const subs=eval(src.match(/const SUBS = (\[[\s\S]*?\]\]);/)[1]);
const CH=['ie','ei','ea','ee','ai','ay','ou','ow','oo','au','ui','ue'];const L='abcdefghijklmnopqrstuvwxyz';
const bank=new Set();for(const g in BD.SPELLING)for(const [W] of BD.SPELLING[g])bank.add(W.toLowerCase());
const near=new Set();
for(const w of bank){const c=new Set();
 for(let i=0;i<w.length;i++){for(const x of L){c.add(w.slice(0,i)+x+w.slice(i+1));c.add(w.slice(0,i)+x+w.slice(i));}c.add(w.slice(0,i)+w.slice(i+1));if(i<w.length-1)c.add(w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2));
  if(i<w.length-1){for(const x of CH)c.add(w.slice(0,i)+x+w.slice(i+2));c.add(w.slice(0,i)+w[i]+w.slice(i+2));c.add(w.slice(0,i)+w.slice(i,i+2)+w[i]+w.slice(i+2));}}
 for(const x of L)c.add(w+x);
 for(const [a,b] of subs){let i=w.indexOf(a,1);if(i>0)c.add(w.slice(0,i)+b+w.slice(i+a.length));}
 for(const x of c)if(x!==w&&big.has(x)&&!bank.has(x))near.add(x);}
const out='/* NEAR WORDS: common real English words that are one small change away from a\n   spelling-bank word (from WordNet 3.1 lemmas plus regular endings). A missing-letter choice or a misspelling must never make one of\n   these, so every question has exactly one right answer. Rebuild with the\n   near-words tool when the spelling bank changes.\n   WordNet 3.1 Copyright 2011 by Princeton University. All rights reserved. */\nwindow.BD = window.BD || {};\nBD.NEAR_WORDS = "'+[...near].sort().join(' ')+'";\n';
fs.writeFileSync(__dirname+'/../data/near-words.js',out);console.log(near.size,out.length);
