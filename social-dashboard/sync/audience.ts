/**
 * Henderson audience snapshot: where Instagram and Facebook followers live, and who Instagram reached this month.
 * Appends one snapshot per run to public/data/audience.json (newest last, one per date, 104 kept).
 *
 *   npm run sync:audience
 *
 * Uses the same Meta system user token as sync:meta (added by the network proxy). Facebook Page metrics need a
 * Page token, fetched at run time from me/accounts and kept in memory only.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { graph, discover } from './meta';
import { summarizeCities, mergeSnapshot, type AudienceSnapshot, type Counts } from '../src/import/audience';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../public/data/audience.json');
const FB_PAGE_ID = '427414610628538';

type Breakdown = { data?: { total_value?: { breakdowns?: { results?: { dimension_values: string[]; value: number }[] }[] } }[] };
const toCounts = (b: Breakdown): Counts =>
  Object.fromEntries((b.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? []).map((r) => [r.dimension_values.join(' '), r.value]));

async function igBreakdown(igId: string, metric: string, breakdown: string, timeframe?: string): Promise<Counts | undefined> {
  try {
    const p: Record<string, string> = { metric, period: 'lifetime', metric_type: 'total_value', breakdown };
    if (timeframe) p.timeframe = timeframe;
    return toCounts(await graph<Breakdown>(`${igId}/insights`, p));
  } catch (e) {
    console.warn(`  Instagram ${metric} by ${breakdown}: ${(e as Error).message}`);
    return undefined;
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const pages = await discover(true);
  const page = pages.find((p) => p.id === FB_PAGE_ID) ?? pages[0];
  const igId = page?.instagram_business_account?.id;
  const snap: AudienceSnapshot = { date: new Date().toISOString().slice(0, 10) };

  if (igId) {
    const fCity = await igBreakdown(igId, 'follower_demographics', 'city');
    const rCity = await igBreakdown(igId, 'reached_audience_demographics', 'city', 'this_month');
    const rGender = await igBreakdown(igId, 'reached_audience_demographics', 'gender', 'this_month');
    snap.ig = {
      followers: {
        cities: fCity && summarizeCities(fCity),
        age: await igBreakdown(igId, 'follower_demographics', 'age'),
        gender: await igBreakdown(igId, 'follower_demographics', 'gender'),
      },
      reach: {
        cities: rCity && summarizeCities(rCity),
        age: await igBreakdown(igId, 'reached_audience_demographics', 'age', 'this_month'),
        gender: rGender,
        total: rGender ? Object.values(rGender).reduce((a, b) => a + b, 0) : undefined,
      },
    };
  }
  if (page?.access_token) {
    try {
      type Ins = { data?: { values?: { value: Counts }[] }[] };
      const r = await graph<Ins>(`${page.id}/insights`, { metric: 'page_follows_city', period: 'day' }, page.access_token);
      const v = r.data?.[0]?.values?.slice(-1)[0]?.value;
      if (v) snap.fb = { followers: { cities: summarizeCities(v) } };
    } catch (e) {
      console.warn(`  Facebook page_follows_city: ${(e as Error).message}`);
    }
  }
  const existing: AudienceSnapshot[] = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];
  writeFileSync(OUT, JSON.stringify(mergeSnapshot(existing, snap), null, 1) + '\n');
  const pct = (a?: number, b?: number) => (a !== undefined && b ? `${Math.round((100 * a) / b)}%` : '–');
  const ig = snap.ig, fb = snap.fb;
  console.log(
    `Audience: Instagram followers in Henderson ${ig?.followers?.cities?.henderson ?? '–'} (${pct(ig?.followers?.cities?.henderson, ig?.followers?.cities?.known)}), ` +
      `Facebook ${fb?.followers?.cities?.henderson ?? '–'} (${pct(fb?.followers?.cities?.henderson, fb?.followers?.cities?.known)}); ` +
      `Instagram reach this month ${ig?.reach?.total ?? '–'}, women ${pct(ig?.reach?.gender?.F, ig?.reach?.total)}.`,
  );
}
