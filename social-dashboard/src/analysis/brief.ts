import type { Analysis } from './analyze';
import type { Recommendation } from './recommendations';
import { PLATFORM_LABEL } from '../platforms';
import { DAYS, compact, lift, pct } from '../lib/format';
import { blockLabel } from './recommendations';

/** A compact, numbers-first summary to hand to an AI strategist (or paste anywhere). */
export function buildBrief(a: Analysis, recs: Recommendation[]): string {
  const L: string[] = [];
  L.push(`# Social performance brief (data through ${a.asOf.slice(0, 10)})`);
  L.push('Creator: CD Young / Engage Lifestyle Martial Arts. Clips are mostly cut and auto-posted nightly by Opus Clip.');
  L.push('"Lift" = a post\'s views ÷ the median views of the same account (1.0× = typical post).');
  L.push('');
  L.push(`## Totals: ${a.totals.posts} posts, ${compact(a.totals.views)} views, ${pct(a.totals.engRate)} engagement, ${compact(a.totals.shares)} shares, ${compact(a.totals.followersGained)} followers gained`);
  L.push('');
  L.push('## Accounts');
  for (const x of a.byAccount) {
    L.push(`- ${PLATFORM_LABEL[x.account.platform]} / ${x.account.name}: ${x.posts} posts, ${compact(x.views)} views, median ${compact(x.medianViews)}/post, ${pct(x.engRate)} eng, ${x.sharesPer1k.toFixed(1)} shares/1K`);
  }
  L.push('');
  L.push('## Topics (median lift, n)');
  for (const t of a.topics) L.push(`- ${t.label}: ${lift(t.medianLift)} (n=${t.n}), ${t.sharesPer1k.toFixed(1)} shares/1K`);
  L.push('');
  L.push('## Strongest keywords');
  L.push(a.keywords.slice(0, 15).map((k) => `${k.key} ${lift(k.medianLift)} (n=${k.n})`).join('; '));
  L.push('');
  L.push('## Weakest keywords');
  L.push(a.keywords.slice(-8).map((k) => `${k.key} ${lift(k.medianLift)} (n=${k.n})`).join('; '));
  L.push('');
  L.push('## Length');
  for (const d of a.durations) L.push(`- ${d.label}: ${lift(d.medianLift)} (n=${d.n})`);
  L.push('');
  L.push('## Title hooks (with vs without)');
  for (const h of a.hooks) L.push(`- ${h.label}: ${lift(h.withLift)} vs ${lift(h.withoutLift)} (n=${h.withN}/${h.withoutN})`);
  L.push('');
  const cells = a.heat.filter((c) => c.n >= 4).sort((x, y) => y.medianLift - x.medianLift);
  if (cells.length) {
    L.push('## Best posting windows (local time)');
    for (const c of cells.slice(0, 5)) L.push(`- ${DAYS[c.day]} ${blockLabel(c.block)}: ${lift(c.medianLift)} (n=${c.n})`);
    L.push('');
  }
  L.push('## Top 12 posts by lift');
  for (const p of [...a.mature].sort((x, y) => y.lift - x.lift).slice(0, 12)) {
    L.push(`- [${PLATFORM_LABEL[p.platform]}] "${p.title}": ${compact(p.views)} views, ${lift(p.lift)}, ${p.shares} shares, ${p.comments} comments`);
  }
  L.push('');
  L.push('## Bottom 8 posts by lift');
  for (const p of [...a.mature].sort((x, y) => x.lift - y.lift).slice(0, 8)) {
    L.push(`- [${PLATFORM_LABEL[p.platform]}] "${p.title}": ${compact(p.views)} views, ${lift(p.lift)}`);
  }
  L.push('');
  L.push('## Automated findings');
  for (const r of recs.slice(0, 10)) L.push(`- ${r.title}: ${r.why}`);
  return L.join('\n');
}

export const STRATEGIST_PROMPT = `You are a short-form video strategist for a martial arts school owner (Engage Lifestyle Martial Arts) and his personal brand (CD Young).
Using ONLY the data below, write:
1. The 3 biggest insights about what his audience wants, each citing specific numbers.
2. A 7-day content plan: 7 clip ideas (one per day) with a hook line (first 2 seconds), the topic, the target length, the platform to lead with and the posting time.
3. Five title rewrites: take weak titles from the bottom posts and rewrite them in the style of the top posts.
4. One experiment to run next week, and how to tell if it worked.
Be concrete and brief. No generic social media advice.`;
