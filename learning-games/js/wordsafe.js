/* WORD SAFETY: keeps rude, mature or confusing words out of every question.
   - unsafe(word): true for a blocked word (profanity, sexual, slurs, insults,
     and a few words that are fine in a sentence but must never be made by a
     misspelling or a wrong answer choice).
   - bad(text): true if a finished sentence, story or meaning has a blocked word.
   - hidden(letters): true if a run of letters (like scrambled tiles) spells a
     strong word anywhere inside it.
   The lists are stored encoded (ROT13) so the source reads cleanly. */
window.BD = window.BD || {};

BD.WordSafe = (function () {
  const rot = function (s) { return s.replace(/[a-z]/g, function (c) { return String.fromCharCode((c.charCodeAt(0) - 97 + 13) % 26 + 97); }); };
  const WORDS = new Set("shpx shpxf shpxre shpxref shpxvat shpxrq zbgureshpxre spx shx fuvg fuvgf fuvggl fuvgr ohyyfuvg ovgpu ovgpurf ovgpul onfgneq qnza qnzarq qnzzvg tbqqnza penc penccl cvff cvffrq cvffrf qvpx qvpxf qvpxurnq pbpx pbpxf phag phagf gjng cevpx cevpxf chffl chffvrf cravf cravfrf intvan obbo obbof obbol gvg gvgf gvggl gvggvrf avccyr nff nffrf nefr nffubyr ohggf ohggubyr snt sntf snttbg fyhg fyhgf juber juberf ubr ubrf fxnax avttre avttref avttn avttnf ergneq ergneqf ergneqrq gneq fcvp fcvpx puvax puvaxf xvxr tbbx wnc pbba pbbaf jrgonpx qlxr genaal ubzb dhrre yrfob tnl frk frkl frkhny ahqr ahqrf anxrq cbea cbeab ubeal obare qvyqb wvmm phz phzf frzra encr encrq encvfg nany nahf betnfz rerpgvba pbaqbz oen fgevccre fcnax fcnaxvat jnax jnaxre obyybpxf ohttre qbhpur qbhpuront sneg snegf gheq gheqf pebgpu vqvbg vqvbgf zbeba zbebaf ybfre ybfref fuhghc xvyyre zheqre qehax orre jvar ibqxn juvfxrl obbmr qeht qehtf zrgu pbpnvar anmv anmvf".split(" ").map(rot));
  const SOFT = new Set("fhpx fhpxf fhpxre fhpxref jrrq penpx fgevc qrnq qvr xvyy ungr qhzo fghcvq ohz ohgg uryy".split(" ").map(rot));
  const STRONG = "shpx fuvg phag qvpx pbpx gjng fyhg juber snt avtt cbea frk gvg nff phz ovgpu cvff qlxr encr nany ubzb penc qnza uryy obbo ohgg gheq".split(" ").map(rot);
  function norm(w) { return String(w || "").toLowerCase().replace(/[^a-z]/g, ""); }
  function hit(set, w) { return set.has(w) || (w.length > 3 && /s$/.test(w) && set.has(w.slice(0, -1))); }
  function unsafe(w) { w = norm(w); return !!w && (hit(WORDS, w) || hit(SOFT, w)); }
  function bad(text) {
    const m = String(text || "").toLowerCase().match(/[a-z]+/g) || [];
    return m.some(function (w) { return hit(WORDS, w); });
  }
  function hidden(letters) {
    const s = norm(Array.isArray(letters) ? letters.join("") : letters);
    return STRONG.some(function (x) { return s.indexOf(x) !== -1; });
  }
  return { unsafe: unsafe, bad: bad, hidden: hidden };
})();
