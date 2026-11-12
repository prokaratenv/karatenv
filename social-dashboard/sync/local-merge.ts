/**
 * Website + Google Business Profile numbers for the dashboard, kept in public/data/local.json.
 *
 *   npx tsx sync/local-merge.ts gbp-email <plaintext-file> [profileName]
 *       Parses a Google Business Profile "your performance report for <Month YYYY>" email body.
 *   npx tsx sync/local-merge.ts website <json>
 *       Adds one website (Search Console) period, e.g.
 *       '{"period":"2026-10-06/2026-11-02","clicks":53,"impressions":3150,"ctr":0.017,"avgPosition":4.9,"indexedPages":35,
 *         "prev":{"clicks":23,"impressions":1250,"avgPosition":6.9,"indexedPages":19},"source":"Monthly SEO report"}'
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { GbpMonth, LocalData, WebsitePeriod } from '../src/import/local';
export type { GbpMonth, LocalData, WebsitePeriod };

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const FIELDS: [keyof GbpMonth, RegExp][] = [
  ['calls', /^calls$/i],
  ['chatClicks', /^chat clicks$/i],
  ['directions', /^people asked for directions$/i],
  ['websiteVisits', /^website visits from profile$/i],
  ['profileViews', /^profile views$/i],
  ['searches', /^searches$/i],
];

/** Parse Google's monthly Business Profile performance email (plain text). */
export function parseGbpEmail(text: string, profileName?: string): GbpMonth {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const head = text.match(/performance for (\w+) (\d{4}):\s*([\d,]+) interactions/i);
  if (!head) throw new Error('Not a Business Profile performance email (no "performance for <Month YYYY>" line).');
  const month = `${head[2]}-${String(MONTHS.indexOf(head[1].toLowerCase()) + 1).padStart(2, '0')}`;
  const profile = profileName ?? text.match(/See how (.+?) at /)?.[1]?.trim() ?? 'Business Profile';
  const out: GbpMonth = { month, profile, interactions: Number(head[3].replace(/,/g, '')), change: {}, topSearchTerms: [] };
  for (let i = 1; i < lines.length; i++) {
    for (const [key, re] of FIELDS) {
      if (!re.test(lines[i])) continue;
      const value = Number(lines[i - 1].replace(/,/g, ''));
      if (Number.isFinite(value)) (out as unknown as Record<string, number>)[key] = value;
      const next = lines[i + 1] ?? '';
      const pct = next.match(/^([+-]?\d+)%$/);
      if (pct) out.change[key] = Number(pct[1]) / 100;
      else if (/^no change$/i.test(next)) out.change[key] = 0;
    }
  }
  const terms = lines.indexOf('Top search terms');
  if (terms >= 0) {
    for (let i = terms + 1; i + 2 < lines.length && /^\d+$/.test(lines[i]) && Number(lines[i]) <= 10; i += 3) {
      out.topSearchTerms.push({ term: lines[i + 1], count: lines[i + 2] });
    }
  }
  return out;
}

export function mergeLocal(existing: LocalData | undefined, add: { gbp?: GbpMonth; website?: WebsitePeriod }): LocalData {
  const data: LocalData = { gbp: [...(existing?.gbp ?? [])], website: [...(existing?.website ?? [])] };
  if (add.gbp) {
    data.gbp = data.gbp.filter((g) => !(g.month === add.gbp!.month && g.profile === add.gbp!.profile));
    data.gbp.push(add.gbp);
    data.gbp.sort((a, b) => a.month.localeCompare(b.month));
  }
  if (add.website) {
    data.website = data.website.filter((w) => w.period !== add.website!.period);
    data.website.push(add.website);
    data.website.sort((a, b) => a.period.localeCompare(b.period));
  }
  return data;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/local.json');
  const existing: LocalData | undefined = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : undefined;
  const [kind, arg, name] = process.argv.slice(2);
  let next: LocalData;
  if (kind === 'gbp-email') {
    const g = parseGbpEmail(readFileSync(arg, 'utf8'), name);
    next = mergeLocal(existing, { gbp: g });
    console.log(`Business Profile ${g.profile} ${g.month}: ${g.profileViews} views, ${g.interactions} interactions`);
  } else if (kind === 'website') {
    const w = JSON.parse(arg) as WebsitePeriod;
    next = mergeLocal(existing, { website: w });
    console.log(`Website ${w.period}: ${w.clicks} clicks, ${w.impressions} impressions`);
  } else {
    console.error('Usage: local-merge.ts gbp-email <file> [profileName] | website <json>');
    process.exit(1);
  }
  writeFileSync(OUT, JSON.stringify(next, null, 1) + '\n');
}
