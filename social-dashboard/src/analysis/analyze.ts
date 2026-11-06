import type { Account, Filters, Platform, Post, Topic } from '../types';
import { PLATFORMS } from '../platforms';
import { groupBy, median, spearman, sum } from '../lib/stats';
import { compileTopics, tagPost, terms } from './topics';
import { buildClusters, titleTokens, type Cluster } from './clusters';

const DAY = 86_400_000;
/** Posts younger than this are still collecting views; keep them out of pattern analysis. */
export const MATURE_AFTER_DAYS = 2;
/** Minimum sample size before we call something a pattern. */
export const MIN_N = 4;

export interface EnrichedPost extends Post {
  account?: Account;
  engagements: number;
  engRate: number;
  /** views ÷ the account's median views: 1× = a typical post for that account. */
  lift: number;
  topics: string[];
  mature: boolean;
}

export interface Totals {
  posts: number;
  views: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
  watchTimeHours: number;
  engRate: number;
}

export interface GroupStat {
  key: string;
  label: string;
  n: number;
  /** Distinct clips (a clip cross-posted to 4 accounts counts once). Use this for confidence. */
  clips: number;
  medianLift: number;
  medianViews: number;
  totalViews: number;
  engRate: number;
  sharesPer1k: number;
  /** Example posts, best first. */
  top: EnrichedPost[];
}

export interface AccountSummary extends Totals {
  account: Account;
  medianViews: number;
  postsPerWeek: number;
  sharesPer1k: number;
  commentsPer1k: number;
}

export interface FeatureStat {
  key: string;
  label: string;
  withN: number;
  withoutN: number;
  withLift: number;
  withoutLift: number;
  /** withLift ÷ withoutLift */
  ratio: number;
}

export interface HeatCell {
  day: number;
  block: number; // 0..7 -> 3-hour blocks starting at 0:00
  n: number;
  clips: number;
  medianLift: number;
}

export interface Analysis {
  asOf: string;
  rangeStart?: string;
  posts: EnrichedPost[];
  mature: EnrichedPost[];
  totals: Totals;
  prevTotals?: Totals;
  weekly: { week: string; views: Record<Platform, number>; posts: number }[];
  byAccount: AccountSummary[];
  byPlatform: (Totals & { platform: Platform; medianLift: number })[];
  topics: GroupStat[];
  keywords: GroupStat[];
  hashtags: GroupStat[];
  durations: GroupStat[];
  durationsByPlatform: Partial<Record<Platform, GroupStat[]>>;
  formats: GroupStat[];
  heat: HeatCell[];
  bestHourByPlatform: Partial<Record<Platform, { hour: number; medianLift: number; n: number }>>;
  hooks: FeatureStat[];
  clusters: Cluster<EnrichedPost>[];
  platformWins: { platform: Platform; wins: number; appearances: number }[];
  opus?: { nOpus: number; nNative: number; opusLift: number; nativeLift: number; viralityCorr?: number; viralityN: number };
  breakouts: EnrichedPost[];
  cadence: { postsPerWeek: number; corr: number; weeks: number; activeAccounts: number };
}

export function totalsOf(posts: Post[]): Totals {
  const views = sum(posts.map((p) => p.views));
  const likes = sum(posts.map((p) => p.likes));
  const comments = sum(posts.map((p) => p.comments));
  const shares = sum(posts.map((p) => p.shares));
  const saves = sum(posts.map((p) => p.saves));
  const engagements = likes + comments + shares + saves;
  return {
    posts: posts.length,
    views,
    engagements,
    likes,
    comments,
    shares,
    saves,
    followersGained: sum(posts.map((p) => p.followersGained ?? 0)),
    watchTimeHours: sum(posts.map((p) => p.watchTimeHours ?? 0)),
    engRate: views ? engagements / views : 0,
  };
}

export function asOfDate(posts: Post[]): number {
  let t = 0;
  for (const p of posts) {
    t = Math.max(t, Date.parse(p.importedAt) || 0, Date.parse(p.publishedAt));
  }
  return t || Date.now();
}

export function applyFilters(posts: Post[], f: Filters, asOf: number): { current: Post[]; previous?: Post[]; start?: number } {
  const scoped = posts.filter(
    (p) => (!f.platforms.length || f.platforms.includes(p.platform)) && (!f.accountIds.length || f.accountIds.includes(p.accountId)),
  );
  if (!f.rangeDays) return { current: scoped };
  const start = asOf - f.rangeDays * DAY;
  const prevStart = start - f.rangeDays * DAY;
  return {
    current: scoped.filter((p) => Date.parse(p.publishedAt) > start),
    previous: scoped.filter((p) => {
      const t = Date.parse(p.publishedAt);
      return t > prevStart && t <= start;
    }),
    start,
  };
}

/** Same title on the same day = the same clip cross-posted. */
export const clipKey = (p: Post) => {
  const d = new Date(p.publishedAt);
  return `${[...titleTokens(p.title)].sort().join(' ') || p.id}|${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

function groupStat(key: string, label: string, ps: EnrichedPost[]): GroupStat {
  const t = totalsOf(ps);
  return {
    key,
    label,
    n: ps.length,
    clips: new Set(ps.map(clipKey)).size,
    medianLift: median(ps.map((p) => p.lift)),
    medianViews: median(ps.map((p) => p.views)),
    totalViews: t.views,
    engRate: t.engRate,
    sharesPer1k: t.views ? (t.shares / t.views) * 1000 : 0,
    top: [...ps].sort((a, b) => b.lift - a.lift).slice(0, 3),
  };
}

export const DURATION_BUCKETS: { key: string; label: string; max: number }[] = [
  { key: 'd15', label: 'Under 15s', max: 15 },
  { key: 'd30', label: '15–30s', max: 30 },
  { key: 'd60', label: '30–60s', max: 60 },
  { key: 'd90', label: '60–90s', max: 90 },
  { key: 'd180', label: '90s–3 min', max: 180 },
  { key: 'dlong', label: 'Over 3 min', max: Infinity },
];

export function durationBucket(sec: number | undefined) {
  if (sec === undefined || sec <= 0) return undefined;
  return DURATION_BUCKETS.find((b) => sec < b.max) ?? DURATION_BUCKETS[DURATION_BUCKETS.length - 1];
}

const HOOKS: { key: string; label: string; test: (p: Post) => boolean }[] = [
  { key: 'question', label: 'Title asks a question', test: (p) => /\?/.test(p.title) },
  { key: 'number', label: 'Title has a number', test: (p) => /\d/.test(p.title) },
  { key: 'howto', label: '"How to" / tip framing', test: (p) => /\b(how to|tips?|ways? to|secret|mistakes?|steps?)\b/i.test(p.title) },
  { key: 'you', label: 'Speaks to "you"', test: (p) => /\b(you|your|you're)\b/i.test(p.title) },
  { key: 'negative', label: 'Warning / negative hook', test: (p) => /\b(never|stop|don'?t|worst|mistake|wrong|avoid)\b/i.test(p.title) },
  { key: 'short', label: 'Short title (≤ 6 words)', test: (p) => p.title.split(/\s+/).filter(Boolean).length <= 6 },
  { key: 'caps', label: 'Has an ALL-CAPS word', test: (p) => /\b[A-Z]{3,}\b/.test(p.title) },
  { key: 'emoji', label: 'Uses emoji', test: (p) => /\p{Extended_Pictographic}/u.test(p.title) },
  { key: 'hashtags', label: '4+ hashtags', test: (p) => p.hashtags.length >= 4 },
];

function weekKey(t: number): string {
  const d = new Date(t);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
  return monday.toISOString().slice(0, 10);
}

export function analyze(allPosts: Post[], accounts: Account[], filters: Filters, topics: Topic[]): Analysis {
  const asOf = asOfDate(allPosts);
  const accById = new Map(accounts.map((a) => [a.id, a]));
  const { current, previous, start } = applyFilters(allPosts, filters, asOf);
  const compiled = compileTopics(topics);

  // Baselines: each account's median views over its mature posts in the window,
  // falling back to all-time when the window is thin.
  const isMature = (p: Post) => asOf - Date.parse(p.publishedAt) >= MATURE_AFTER_DAYS * DAY;
  const baseline = new Map<string, number>();
  for (const [acc, ps] of groupBy(current.filter(isMature), (p) => p.accountId)) {
    const pool = ps.length >= 5 ? ps : allPosts.filter((p) => p.accountId === acc && isMature(p));
    baseline.set(acc, Math.max(1, median(pool.map((p) => p.views))));
  }

  const posts: EnrichedPost[] = current.map((p) => {
    const engagements = p.likes + p.comments + p.shares + p.saves;
    return {
      ...p,
      account: accById.get(p.accountId),
      engagements,
      engRate: p.views ? engagements / p.views : 0,
      lift: p.views / (baseline.get(p.accountId) ?? Math.max(1, p.views)),
      topics: tagPost(p, compiled),
      mature: isMature(p),
    };
  });
  const mature = posts.filter((p) => p.mature);

  // Weekly views per platform.
  const weeks = new Map<string, { views: Record<Platform, number>; posts: number }>();
  for (const p of posts) {
    const k = weekKey(Date.parse(p.publishedAt));
    const w = weeks.get(k) ?? { views: Object.fromEntries(PLATFORMS.map((x) => [x, 0])) as Record<Platform, number>, posts: 0 };
    w.views[p.platform] += p.views;
    w.posts++;
    weeks.set(k, w);
  }
  const weekly = [...weeks.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([week, w]) => ({ week, ...w }));

  // Per account.
  const spanWeeks = Math.max(1, (filters.rangeDays || spanDays(posts)) / 7);
  const byAccount: AccountSummary[] = [...groupBy(posts, (p) => p.accountId)].map(([id, ps]) => {
    const t = totalsOf(ps);
    return {
      ...t,
      account: accById.get(id) ?? { id, platform: ps[0].platform, name: id, kind: 'business' },
      medianViews: median(ps.map((p) => p.views)),
      postsPerWeek: ps.length / spanWeeks,
      sharesPer1k: t.views ? (t.shares / t.views) * 1000 : 0,
      commentsPer1k: t.views ? (t.comments / t.views) * 1000 : 0,
    };
  });
  byAccount.sort((a, b) => b.views - a.views);

  const byPlatform = PLATFORMS.map((platform) => {
    const ps = posts.filter((p) => p.platform === platform);
    return { platform, ...totalsOf(ps), medianLift: median(ps.filter((p) => p.mature).map((p) => p.lift)) };
  }).filter((x) => x.posts > 0);

  // Topics.
  const topicStats = topics
    .map((t) => groupStat(t.id, t.label, mature.filter((p) => p.topics.includes(t.id))))
    .filter((g) => g.n > 0);
  const untagged = mature.filter((p) => !p.topics.length);
  if (untagged.length) topicStats.push(groupStat('_none', 'No topic matched', untagged));
  topicStats.sort((a, b) => b.medianLift - a.medianLift);

  // Keyword discovery.
  const termPosts = new Map<string, EnrichedPost[]>();
  for (const p of mature) {
    for (const t of terms(p)) {
      const arr = termPosts.get(t);
      if (arr) arr.push(p);
      else termPosts.set(t, [p]);
    }
  }
  const minKw = Math.max(MIN_N, Math.round(mature.length * 0.02));
  const keywords = [...termPosts]
    .filter(([, ps]) => ps.length >= minKw && ps.length <= mature.length * 0.6)
    .map(([k, ps]) => groupStat(k, k, ps))
    .filter((g) => g.clips >= 2)
    // Ties go to the phrase: "year old" says more than "year".
    .sort((a, b) => b.medianLift - a.medianLift || b.key.split(' ').length - a.key.split(' ').length);
  const dedupedKeywords = dedupeTerms(keywords);

  const hashtags = [...groupBy(mature.flatMap((p) => p.hashtags.map((h) => ({ h, p }))), (x) => x.h)]
    .filter(([, xs]) => xs.length >= MIN_N)
    .map(([h, xs]) => groupStat(h, h, xs.map((x) => x.p)))
    .sort((a, b) => b.medianLift - a.medianLift);

  // Duration.
  const videos = mature.filter((p) => p.durationSec);
  const durationsOf = (ps: EnrichedPost[]) =>
    DURATION_BUCKETS.map((b) => groupStat(b.key, b.label, ps.filter((p) => durationBucket(p.durationSec)?.key === b.key))).filter((g) => g.n > 0);
  const durations = durationsOf(videos);
  const durationsByPlatform: Analysis['durationsByPlatform'] = {};
  for (const [pl, ps] of groupBy(videos, (p) => p.platform)) durationsByPlatform[pl] = durationsOf(ps);

  const formats = [...groupBy(mature, (p) => p.format)].map(([k, ps]) => groupStat(k, FORMAT_LABEL[k] ?? k, ps)).sort((a, b) => b.medianLift - a.medianLift);

  // Timing heatmap: weekday x 3-hour block, median lift (local time).
  const heat: HeatCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let block = 0; block < 8; block++) {
      const ps = mature.filter((p) => {
        const d = new Date(p.publishedAt);
        return d.getDay() === day && Math.floor(d.getHours() / 3) === block;
      });
      heat.push({ day, block, n: ps.length, clips: new Set(ps.map(clipKey)).size, medianLift: ps.length ? median(ps.map((p) => p.lift)) : 0 });
    }
  }
  const bestHourByPlatform: Analysis['bestHourByPlatform'] = {};
  for (const [pl, ps] of groupBy(mature, (p) => p.platform)) {
    let best: { hour: number; medianLift: number; n: number } | undefined;
    for (const [hour, hs] of groupBy(ps, (p) => new Date(p.publishedAt).getHours())) {
      if (hs.length < MIN_N) continue;
      const ml = median(hs.map((p) => p.lift));
      if (!best || ml > best.medianLift) best = { hour, medianLift: ml, n: hs.length };
    }
    if (best) bestHourByPlatform[pl] = best;
  }

  // Title / hook features.
  const hooks: FeatureStat[] = HOOKS.map((h) => {
    const w = mature.filter(h.test);
    const wo = mature.filter((p) => !h.test(p));
    const withLift = median(w.map((p) => p.lift));
    const withoutLift = median(wo.map((p) => p.lift));
    return { key: h.key, label: h.label, withN: w.length, withoutN: wo.length, withLift, withoutLift, ratio: withoutLift ? withLift / withoutLift : 0 };
  }).filter((h) => h.withN >= MIN_N && h.withoutN >= MIN_N);
  hooks.sort((a, b) => b.ratio - a.ratio);

  // Same clip across platforms.
  const clusters = buildClusters(posts).filter((c) => c.posts.length >= 2);
  const winTally = new Map<Platform, { wins: number; appearances: number }>();
  for (const c of clusters.filter((c) => c.posts.every((p) => p.mature))) {
    const best = c.posts.reduce((a, b) => (b.lift > a.lift ? b : a));
    const seen = new Set<Platform>();
    for (const p of c.posts) {
      if (seen.has(p.platform)) continue;
      seen.add(p.platform);
      const t = winTally.get(p.platform) ?? { wins: 0, appearances: 0 };
      t.appearances++;
      if (p === best) t.wins++;
      winTally.set(p.platform, t);
    }
  }
  const platformWins = [...winTally]
    .filter(([, t]) => t.appearances >= MIN_N)
    .map(([platform, t]) => ({ platform, ...t })).sort((a, b) => b.wins / b.appearances - a.wins / a.appearances);

  // Opus Clip vs everything else.
  const opusPosts = mature.filter((p) => p.viaOpus);
  const native = mature.filter((p) => !p.viaOpus);
  const scored = mature.filter((p) => p.viralityScore !== undefined);
  const opus =
    opusPosts.length || scored.length
      ? {
          nOpus: opusPosts.length,
          nNative: native.length,
          opusLift: median(opusPosts.map((p) => p.lift)),
          nativeLift: median(native.map((p) => p.lift)),
          viralityN: scored.length,
          viralityCorr: scored.length >= 8 ? spearman(scored.map((p) => p.viralityScore!), scored.map((p) => p.lift)) : undefined,
        }
      : undefined;

  const breakouts = mature.filter((p) => p.lift >= 3).sort((a, b) => b.lift - a.lift);

  // Cadence: does posting more in a week go with more total views?
  const weekly2 = weekly.filter((w) => w.posts > 0);
  const corr = weekly2.length >= 6 ? spearman(weekly2.map((w) => w.posts), weekly2.map((w) => sum(Object.values(w.views)))) : 0;

  return {
    asOf: new Date(asOf).toISOString(),
    rangeStart: start ? new Date(start).toISOString() : undefined,
    posts,
    mature,
    totals: totalsOf(posts),
    prevTotals: previous && previous.length ? totalsOf(previous) : undefined,
    weekly,
    byAccount,
    byPlatform,
    topics: topicStats,
    keywords: dedupedKeywords.slice(0, 40),
    hashtags: hashtags.slice(0, 30),
    durations,
    durationsByPlatform,
    formats,
    heat,
    bestHourByPlatform,
    hooks,
    clusters,
    platformWins,
    opus,
    breakouts,
    cadence: { postsPerWeek: posts.length / spanWeeks, corr, weeks: weekly2.length, activeAccounts: byAccount.length },
  };
}

const FORMAT_LABEL: Record<string, string> = {
  short: 'Short-form video',
  video: 'Long-form video',
  image: 'Image',
  carousel: 'Carousel',
  text: 'Text post',
  other: 'Other',
};

function spanDays(posts: Post[]): number {
  if (!posts.length) return 7;
  const ts = posts.map((p) => Date.parse(p.publishedAt));
  return Math.max(7, (Math.max(...ts) - Math.min(...ts)) / DAY);
}

/** Drop a bigram's parts (or a unigram inside a bigram) when they cover the same posts. */
function dedupeTerms(stats: GroupStat[]): GroupStat[] {
  // Prefer phrases: process bigrams first, then keep a word only if it isn't just a phrase's shadow.
  const words = (k: string) => k.split(' ');
  const covered = (s: GroupStat, o: GroupStat) =>
    words(o.key).some((w) => words(s.key).includes(w)) && Math.abs(o.n - s.n) <= Math.max(1, Math.max(o.n, s.n) * 0.2);
  const phrases: GroupStat[] = [];
  for (const s of stats.filter((x) => x.key.includes(' '))) if (!phrases.some((o) => covered(s, o))) phrases.push(s);
  const singles = stats.filter((x) => !x.key.includes(' ') && !phrases.some((o) => covered(x, o)));
  return [...phrases, ...singles].sort((a, b) => b.medianLift - a.medianLift);
}
