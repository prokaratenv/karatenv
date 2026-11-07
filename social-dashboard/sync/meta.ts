/**
 * Pulls Instagram (professional accounts) and Facebook Page posts with their metrics
 * from Meta's Graph API into public/data/meta.json, plus a follower snapshot per account
 * in public/data/meta-accounts.json.
 *
 * Auth: a Meta system-user access token. In the cloud environment the network proxy adds it as
 * "Authorization: Bearer ..." for graph.facebook.com; locally, set META_ACCESS_TOKEN.
 *
 *   npx tsx sync/meta.ts --accounts   # list the Pages / Instagram accounts the token can see
 *   npx tsx sync/meta.ts              # sync
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Platform, Post, PostFormat } from '../src/types';
import { extractHashtags } from '../src/import/normalize';
import { mergePosts } from '../src/import/parse';

const here = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(here, 'meta-config.json');
const DATA_DIR = resolve(here, '../public/data');
export const META_POSTS_PATH = resolve(DATA_DIR, 'meta.json');
export const META_ACCOUNTS_PATH = resolve(DATA_DIR, 'meta-accounts.json');
export const SOURCE = 'Meta sync';

interface MetaConfig {
  apiVersion: string;
  /** Only fetch per-post insights for posts this recent (older ones keep basic counts). */
  insightsDays: number;
  maxPostsPerAccount: number;
  /** Graph id -> dashboard account id. Filled on first run; edit to fix a mismatch. */
  accounts: Record<string, string>;
}

const DEFAULT_CONFIG: MetaConfig = { apiVersion: 'v25.0', insightsDays: 120, maxPostsPerAccount: 600, accounts: {} };

export interface FollowerSnapshot {
  date: string;
  accountId: string;
  platform: Platform;
  name: string;
  followers: number;
}

export class GraphError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: number,
  ) {
    super(message);
  }
}

function loadConfig(): MetaConfig {
  return existsSync(CONFIG_PATH) ? { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) } : { ...DEFAULT_CONFIG };
}

let version = DEFAULT_CONFIG.apiVersion;

/**
 * `pageToken`: Facebook Page endpoints need a Page access token. It's fetched at run time from
 * me/accounts using the system-user token and only ever kept in memory.
 */
async function graph<T>(path: string, params: Record<string, string> = {}, pageToken?: string): Promise<T> {
  const url = new URL(path.startsWith('https://') ? path : `https://graph.facebook.com/${version}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (pageToken && !url.searchParams.has('access_token')) url.searchParams.set('access_token', pageToken);
  const headers: Record<string, string> = {};
  if (process.env.META_ACCESS_TOKEN) headers.Authorization = `Bearer ${process.env.META_ACCESS_TOKEN}`;
  const res = await fetch(url, { headers });
  const body = (await res.json().catch(() => ({}))) as { error?: { message: string; code?: number } };
  if (!res.ok || body.error) {
    const e = body.error;
    const hint = res.status === 401 || e?.code === 190 ? ' (the access token is missing, expired or invalid)' : '';
    throw new GraphError(`Graph API ${path.split('?')[0]}: ${e?.message ?? res.status}${hint}`, res.status, e?.code);
  }
  return body as T;
}

/** Follow `paging.next` until `max` items. */
async function all<T>(path: string, params: Record<string, string>, max: number, pageToken?: string): Promise<T[]> {
  const out: T[] = [];
  let page = await graph<{ data: T[]; paging?: { next?: string } }>(path, params, pageToken);
  for (;;) {
    out.push(...page.data);
    if (!page.paging?.next || out.length >= max) break;
    page = await graph(page.paging.next, {}, pageToken);
  }
  return out.slice(0, max);
}

/**
 * Ask for several insight metrics at once; if Meta rejects the set (a metric was renamed or
 * retired), fall back to asking one at a time and remember which ones work for the rest of the run.
 */
const metricOk = new Map<string, boolean>();
async function insights(objectId: string, metrics: string[], pageToken?: string, edge = 'insights'): Promise<Record<string, number>> {
  const want = metrics.filter((m) => metricOk.get(m) !== false);
  const read = (data: { name: string; values?: { value: unknown }[]; total_value?: { value: number } }[]) => {
    const out: Record<string, number> = {};
    for (const d of data) {
      const v = d.total_value?.value ?? d.values?.[0]?.value;
      if (typeof v === 'number') out[d.name] = v;
    }
    return out;
  };
  if (!want.length) return {};
  try {
    const r = await graph<{ data: Parameters<typeof read>[0] }>(`${objectId}/${edge}`, { metric: want.join(',') }, pageToken);
    want.forEach((m) => metricOk.set(m, true));
    return read(r.data);
  } catch (e) {
    if (!(e instanceof GraphError) || e.code === 190 || e.code === 4 || e.code === 17 || e.code === 32) throw e;
    const out: Record<string, number> = {};
    for (const m of want) {
      try {
        const r = await graph<{ data: Parameters<typeof read>[0] }>(`${objectId}/${edge}`, { metric: m }, pageToken);
        Object.assign(out, read(r.data));
        metricOk.set(m, true);
      } catch {
        // Metric not available for this object type (e.g. a photo has no watch time). Only blacklist on repeat.
        if (metricOk.get(m) === undefined) metricOk.set(m, false);
      }
    }
    return out;
  }
}

/* ---------------- Mapping (pure, tested) ---------------- */

export interface IgMedia {
  id: string;
  caption?: string;
  media_type: string; // IMAGE | VIDEO | CAROUSEL_ALBUM
  media_product_type?: string; // FEED | REELS | STORY | AD
  permalink?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export function igToPost(m: IgMedia, accountId: string, ins: Record<string, number>, now: string): Post {
  const caption = m.caption ?? '';
  const format: PostFormat =
    m.media_product_type === 'REELS' || m.media_type === 'VIDEO' ? 'short' : m.media_type === 'CAROUSEL_ALBUM' ? 'carousel' : 'image';
  return {
    id: `${accountId}:${m.id}`,
    accountId,
    platform: 'instagram',
    externalId: m.id,
    title: firstLine(caption) || '(no caption)',
    caption,
    url: m.permalink,
    publishedAt: new Date(m.timestamp).toISOString(),
    format,
    views: ins.views ?? ins.reach ?? 0,
    reach: ins.reach,
    likes: m.like_count ?? ins.likes ?? 0,
    comments: m.comments_count ?? ins.comments ?? 0,
    shares: ins.shares ?? 0,
    saves: ins.saved ?? 0,
    avgViewDurationSec: ins.ig_reels_avg_watch_time !== undefined ? ins.ig_reels_avg_watch_time / 1000 : undefined,
    followersGained: ins.follows,
    hashtags: extractHashtags(caption),
    importedAt: now,
    source: SOURCE,
  };
}

export interface FbPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
  status_type?: string;
  shares?: { count: number };
  reactions?: { summary?: { total_count: number } };
  comments?: { summary?: { total_count: number } };
  attachments?: { data: { media_type?: string; type?: string }[] };
}

export function fbToPost(p: FbPost, accountId: string, ins: Record<string, number>, now: string): Post {
  const caption = p.message ?? '';
  const att = p.attachments?.data?.[0];
  const kind = `${att?.media_type ?? ''} ${att?.type ?? ''} ${p.status_type ?? ''}`.toLowerCase();
  const format: PostFormat = /video|reel/.test(kind) ? 'short' : /album/.test(kind) ? 'carousel' : /photo/.test(kind) ? 'image' : caption ? 'text' : 'other';
  return {
    id: `${accountId}:${p.id}`,
    accountId,
    platform: 'facebook',
    externalId: p.id,
    title: firstLine(caption) || '(no text)',
    caption,
    url: p.permalink_url,
    publishedAt: new Date(p.created_time).toISOString(),
    format,
    views: ins.post_media_view ?? ins.post_video_views ?? ins.post_impressions_unique ?? 0,
    reach: ins.post_impressions_unique,
    likes: p.reactions?.summary?.total_count ?? 0,
    comments: p.comments?.summary?.total_count ?? 0,
    shares: p.shares?.count ?? 0,
    saves: 0,
    hashtags: extractHashtags(caption),
    importedAt: now,
    source: SOURCE,
  };
}

function firstLine(s: string): string {
  const line = s.split(/\r?\n/).find((l) => l.trim())?.trim() ?? '';
  return line.length > 90 ? `${line.slice(0, 87)}…` : line;
}

/** Guess which dashboard account a Page / IG account is. Engage-branded -> business, otherwise CD Young. */
export function guessAccountId(platform: 'facebook' | 'instagram', name: string): string {
  const engage = /engage|karate ?nv|lifestyle martial/i.test(name);
  if (platform === 'facebook') return engage ? 'fb-engage' : 'fb-cdyoung';
  return engage ? 'ig-engage' : 'ig-cdyoung';
}

/* ---------------- Sync ---------------- */

interface PageRow {
  id: string;
  name: string;
  access_token?: string;
  followers_count?: number;
  fan_count?: number;
  instagram_business_account?: { id: string; username?: string; followers_count?: number };
}

async function discover(withTokens = false): Promise<PageRow[]> {
  return all<PageRow>(
    'me/accounts',
    {
      fields: `id,name,followers_count,fan_count,instagram_business_account{id,username,followers_count}${withTokens ? ',access_token' : ''}`,
      limit: '100',
    },
    100,
  );
}

export async function syncMeta() {
  const cfg = loadConfig();
  version = cfg.apiVersion;
  const now = new Date().toISOString();
  const insightsSince = Date.now() - cfg.insightsDays * 86_400_000;
  const pages = await discover(true);
  if (!pages.length) throw new Error('The token sees no Facebook Pages. Assign the Pages to the system user in Business settings.');

  const posts: Post[] = [];
  const snaps: FollowerSnapshot[] = [];
  const log: string[] = [];

  for (const pg of pages) {
    // Facebook Page
    const fbId = (cfg.accounts[pg.id] ??= guessAccountId('facebook', pg.name));
    snaps.push({ date: now.slice(0, 10), accountId: fbId, platform: 'facebook', name: pg.name, followers: pg.followers_count ?? pg.fan_count ?? 0 });
    try {
      const raw = await all<FbPost>(
        `${pg.id}/published_posts`,
        {
          fields:
            'id,message,created_time,permalink_url,status_type,shares,reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0),attachments{media_type,type}',
          limit: '50',
        },
        cfg.maxPostsPerAccount,
        pg.access_token,
      );
      for (const p of raw) {
        const ins =
          Date.parse(p.created_time) > insightsSince
            ? await insights(p.id, ['post_media_view', 'post_impressions_unique', 'post_video_views'], pg.access_token)
            : {};
        posts.push(fbToPost(p, fbId, ins, now));
      }
      log.push(`Facebook "${pg.name}" -> ${fbId}: ${raw.length} posts`);
    } catch (e) {
      log.push(`Facebook "${pg.name}": skipped (${e instanceof Error ? e.message : e})`);
    }

    // Linked Instagram professional account
    const ig = pg.instagram_business_account;
    if (!ig) continue;
    const igName = ig.username ?? ig.id;
    const igId = (cfg.accounts[ig.id] ??= guessAccountId('instagram', `${igName} ${pg.name}`));
    snaps.push({ date: now.slice(0, 10), accountId: igId, platform: 'instagram', name: `@${igName}`, followers: ig.followers_count ?? 0 });
    try {
      const media = await all<IgMedia>(
        `${ig.id}/media`,
        { fields: 'id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count', limit: '50' },
        cfg.maxPostsPerAccount,
      );
      for (const m of media) {
        const isVideo = m.media_product_type === 'REELS' || m.media_type === 'VIDEO';
        const metrics = ['views', 'reach', 'saved', 'shares', 'follows', ...(isVideo ? ['ig_reels_avg_watch_time'] : [])];
        const ins = Date.parse(m.timestamp) > insightsSince && m.media_product_type !== 'STORY' ? await insights(m.id, metrics) : {};
        posts.push(igToPost(m, igId, ins, now));
      }
      log.push(`Instagram @${igName} -> ${igId}: ${media.length} posts`);
    } catch (e) {
      log.push(`Instagram @${igName}: skipped (${e instanceof Error ? e.message : e})`);
    }
  }

  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + '\n');
  mkdirSync(DATA_DIR, { recursive: true });
  const existing: Post[] = existsSync(META_POSTS_PATH) ? JSON.parse(readFileSync(META_POSTS_PATH, 'utf8')) : [];
  const merged = mergePosts(existing, posts);
  merged.posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  writeFileSync(META_POSTS_PATH, JSON.stringify(merged.posts, null, 1) + '\n');

  const history: FollowerSnapshot[] = existsSync(META_ACCOUNTS_PATH) ? JSON.parse(readFileSync(META_ACCOUNTS_PATH, 'utf8')) : [];
  const next = [...history.filter((h) => !(h.date === now.slice(0, 10) && snaps.some((s) => s.accountId === h.accountId))), ...snaps].sort(
    (a, b) => a.date.localeCompare(b.date) || a.accountId.localeCompare(b.accountId),
  );
  writeFileSync(META_ACCOUNTS_PATH, JSON.stringify(next, null, 1) + '\n');

  return { log, added: merged.added, updated: merged.updated, total: merged.posts.length, snaps };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  (async () => {
    if (process.argv.includes('--accounts')) {
      version = loadConfig().apiVersion;
      for (const p of await discover()) {
        console.log(
          `Page "${p.name}" (${p.id}) followers ${p.followers_count ?? p.fan_count ?? '?'} -> ${guessAccountId('facebook', p.name)}` +
            (p.instagram_business_account
              ? `\n  Instagram @${p.instagram_business_account.username} (${p.instagram_business_account.id}) followers ${p.instagram_business_account.followers_count ?? '?'} -> ${guessAccountId('instagram', `${p.instagram_business_account.username} ${p.name}`)}`
              : '\n  (no Instagram professional account linked to this Page)'),
        );
      }
      return;
    }
    const r = await syncMeta();
    r.log.forEach((l) => console.log(l));
    console.log(`Meta sync: ${r.added} new, ${r.updated} refreshed, ${r.total} posts stored.`);
    for (const s of r.snaps) console.log(`  ${s.platform} ${s.name}: ${s.followers} followers`);
  })().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
