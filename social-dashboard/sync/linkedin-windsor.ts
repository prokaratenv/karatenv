/**
 * LinkedIn company page from Windsor.ai (linkedin_organic connector) into public/data/linkedin.json and
 * linkedin-accounts.json.
 *
 * The weekly Claude run calls Windsor's get_data (connector linkedin_organic, date_preset last_30dT) and saves:
 *   posts fields:  share_id, ugc_post_id, share_created_time, share_text, share_post_type, share_impression_count,
 *                  share_unique_impressions_count, share_like_count, share_comment_count, share_count,
 *                  share_clicks_count, share_video_views, share_video_watch_time
 *   daily fields:  date, organization_follower_count
 * Input file: { "account": "li-engage", "name": "Engage Lifestyle Martial Arts", "posts": [...], "daily": [...] }
 *
 *   npx tsx sync/linkedin-windsor.ts <input.json>
 *
 * "Views" for a LinkedIn post are its impressions (LinkedIn's main reach number for every post type).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Post, PostFormat } from '../src/types';

export interface WindsorShare {
  share_id: string;
  ugc_post_id?: string | null;
  share_created_time: string;
  share_text?: string | null;
  share_post_type?: string | null;
  share_impression_count?: number | null;
  share_unique_impressions_count?: number | null;
  share_like_count?: number | null;
  share_comment_count?: number | null;
  share_count?: number | null;
  share_clicks_count?: number | null;
  share_video_views?: number | null;
  share_video_watch_time?: number | null;
}

const here = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(here, '../public/data');
const num = (v: number | null | undefined) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

/** LinkedIn's API text marks hashtags as {hashtag|\#|Name} and escapes punctuation with backslashes. */
export function cleanLinkedInText(t: string): string {
  return t
    .replace(/\{hashtag\|\\?#\|([^}]+)\}/g, '#$1')
    .replace(/\\([#()\\[\]_*~-])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

const FORMAT: Record<string, PostFormat> = { video: 'video', image: 'image', multiImage: 'carousel', document: 'carousel', article: 'text', text: 'text', poll: 'other' };

export function shareToPost(s: WindsorShare, accountId: string, now: string): Post {
  const caption = cleanLinkedInText(s.share_text ?? '');
  const firstLine = caption.split(/(?<=[.!?])\s|\n/)[0] ?? '';
  const title = (firstLine.length > 20 ? firstLine : caption).replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s+/g, ' ').trim().slice(0, 140) || 'LinkedIn post';
  const impressions = num(s.share_impression_count) ?? 0;
  const watchMs = num(s.share_video_watch_time);
  const videoViews = num(s.share_video_views);
  return {
    id: `${accountId}:${s.share_id}`,
    accountId,
    platform: 'linkedin',
    externalId: s.share_id,
    title,
    caption,
    url: `https://www.linkedin.com/feed/update/urn:li:${s.ugc_post_id ? 'ugcPost' : 'share'}:${s.share_id}`,
    // Windsor gives the date only; noon UTC keeps it on the same day in Pacific time.
    publishedAt: new Date(`${s.share_created_time.slice(0, 10)}T12:00:00Z`).toISOString(),
    format: FORMAT[s.share_post_type ?? ''] ?? 'other',
    views: impressions,
    impressions,
    reach: num(s.share_unique_impressions_count),
    likes: num(s.share_like_count) ?? 0,
    comments: num(s.share_comment_count) ?? 0,
    shares: num(s.share_count) ?? 0,
    saves: 0,
    watchTimeHours: watchMs ? watchMs / 3_600_000 : undefined,
    avgViewDurationSec: watchMs && videoViews ? watchMs / 1000 / videoViews : undefined,
    hashtags: [...caption.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1]),
    importedAt: now,
    source: 'Windsor.ai',
  };
}

export function mergeLinkedIn(existing: Post[], shares: WindsorShare[], accountId: string, now: string): Post[] {
  const fresh = shares.filter((s) => s.share_id).map((s) => shareToPost(s, accountId, now));
  const ids = new Set(fresh.map((p) => p.id));
  return [...existing.filter((p) => !ids.has(p.id)), ...fresh].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: npx tsx sync/linkedin-windsor.ts <input.json>');
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(input, 'utf8')) as {
    account: string;
    name: string;
    posts: WindsorShare[];
    daily?: { date: string | null; organization_follower_count?: number | null }[];
  };
  const now = new Date().toISOString();
  const postsFile = resolve(DATA, 'linkedin.json');
  const existing: Post[] = existsSync(postsFile) ? JSON.parse(readFileSync(postsFile, 'utf8')) : [];
  const merged = mergeLinkedIn(existing, raw.posts, raw.account, now);
  writeFileSync(postsFile, JSON.stringify(merged, null, 1) + '\n');

  const accFile = resolve(DATA, 'linkedin-accounts.json');
  const acc: { date: string; accountId: string; platform: string; name: string; followers: number }[] = existsSync(accFile) ? JSON.parse(readFileSync(accFile, 'utf8')) : [];
  for (const d of raw.daily ?? []) {
    const f = num(d.organization_follower_count);
    if (f === undefined || f <= 0 || !d.date) continue;
    const row = { date: d.date as string, accountId: raw.account, platform: 'linkedin', name: raw.name, followers: f };
    const i = acc.findIndex((a) => a.accountId === raw.account && a.date === d.date);
    if (i >= 0) acc[i] = row;
    else acc.push(row);
  }
  acc.sort((a, b) => a.date.localeCompare(b.date));
  writeFileSync(accFile, JSON.stringify(acc, null, 1) + '\n');
  const shares = raw.posts.reduce((n, s) => n + (num(s.share_count) ?? 0), 0);
  console.log(`LinkedIn ${raw.account}: ${raw.posts.length} posts from Windsor (${shares} reshares), ${merged.length} stored, ${acc.length} follower snapshots.`);
}
