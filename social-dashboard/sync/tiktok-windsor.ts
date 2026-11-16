/**
 * TikTok from Windsor.ai (tiktok_organic connector) into public/data/tiktok.json + tiktok-accounts.json.
 *
 * The weekly Claude run calls Windsor's get_data and saves the rows to a file:
 *   videos:  connector tiktok_organic, date_preset last_30dT, fields
 *            video_id, video_create_datetime, video_caption, video_duration, video_views_count, video_likes,
 *            video_comments, video_shares, video_favorites, video_average_time_watched, video_full_watched_rate,
 *            video_new_followers, video_profile_views, video_reach
 *   account: fields date, total_followers_count, total_likes, profile_views, video_views, likes, comments, shares
 * Input file: { "account": "tt-cdyoung", "handle": "cdyoung", "videos": [...rows], "daily": [...rows] }
 *
 *   npx tsx sync/tiktok-windsor.ts <input.json>
 *
 * Videos are matched by TikTok video id. A screenshot-only row for the same post (same account, posted within
 * 2 minutes) is replaced, so nothing is counted twice. Older posts outside the 30-day window keep their last numbers.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Post } from '../src/types';

export interface WindsorVideo {
  video_id: string;
  video_create_datetime: string;
  video_caption?: string;
  video_duration?: number | null;
  video_views_count?: number | null;
  video_likes?: number | null;
  video_comments?: number | null;
  video_shares?: number | null;
  video_favorites?: number | null;
  video_average_time_watched?: number | null;
  video_full_watched_rate?: number | null;
  video_new_followers?: number | null;
  video_profile_views?: number | null;
  video_reach?: number | null;
}
export interface WindsorDaily {
  date: string;
  total_followers_count?: number | null;
  total_likes?: number | null;
  profile_views?: number | null;
  video_views?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
}

const here = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(here, '../public/data');

const num = (v: number | null | undefined) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

/** Windsor's create time has no zone; it is UTC (it matches Opus Clip's publish times to the second). */
const utc = (s: string) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z').toISOString();

export function videoToPost(v: WindsorVideo, accountId: string, handle: string, now: string): Post {
  const caption = (v.video_caption ?? '').trim();
  const title = caption.replace(/\s*(#[\p{L}\p{N}_]+|@[\w.]+(?: [A-Z][\w]+)*)/gu, '').replace(/\s+/g, ' ').trim().slice(0, 140) || 'TikTok post (no caption)';
  const dur = num(v.video_duration);
  const p: Post = {
    id: `${accountId}:${v.video_id}`,
    accountId,
    platform: 'tiktok',
    title,
    caption,
    url: `https://www.tiktok.com/@${handle}/video/${v.video_id}`,
    publishedAt: utc(v.video_create_datetime),
    format: dur ? 'short' : 'image',
    views: num(v.video_views_count) ?? 0,
    likes: num(v.video_likes) ?? 0,
    comments: num(v.video_comments) ?? 0,
    shares: num(v.video_shares) ?? 0,
    saves: num(v.video_favorites) ?? 0,
    avgViewDurationSec: num(v.video_average_time_watched),
    followersGained: num(v.video_new_followers),
    reach: num(v.video_reach),
    hashtags: [...caption.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1]),
    importedAt: now,
    source: 'Windsor.ai',
  };
  if (dur) p.durationSec = dur;
  return p;
}

export function mergeTikTok(existing: Post[], videos: WindsorVideo[], accountId: string, handle: string, now: string): Post[] {
  const fresh = videos.filter((v) => v.video_id).map((v) => videoToPost(v, accountId, handle, now));
  const byId = new Map(fresh.map((p) => [p.id, p]));
  const near = (a: Post, b: Post) => a.accountId === b.accountId && Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt)) <= 120_000;
  const kept = existing.filter((p) => {
    if (byId.has(p.id)) return false; // replaced by the fresh copy
    if (p.accountId === accountId && /:shot-\d+$/.test(p.id) && fresh.some((f) => near(f, p))) return false; // screenshot twin
    return true;
  });
  return [...kept, ...fresh].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: npx tsx sync/tiktok-windsor.ts <input.json>');
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(input, 'utf8')) as { account: string; handle: string; name?: string; videos: WindsorVideo[]; daily?: WindsorDaily[] };
  const now = new Date().toISOString();
  const postsFile = resolve(DATA, 'tiktok.json');
  const existing: Post[] = existsSync(postsFile) ? JSON.parse(readFileSync(postsFile, 'utf8')) : [];
  const merged = mergeTikTok(existing, raw.videos, raw.account, raw.handle, now);
  writeFileSync(postsFile, JSON.stringify(merged, null, 1) + '\n');

  // Follower snapshots: one per day Windsor reports, newest wins for the same date.
  const accFile = resolve(DATA, 'tiktok-accounts.json');
  const acc: { date: string; accountId: string; platform: string; name: string; followers: number }[] = existsSync(accFile) ? JSON.parse(readFileSync(accFile, 'utf8')) : [];
  const name = raw.name ?? acc.find((a) => a.accountId === raw.account)?.name ?? raw.handle;
  for (const d of raw.daily ?? []) {
    const f = num(d.total_followers_count);
    if (f === undefined || f <= 0 || !d.date) continue; // Windsor sometimes reports 0 for a day it hasn't counted
    const i = acc.findIndex((a) => a.accountId === raw.account && a.date === d.date);
    const row = { date: d.date, accountId: raw.account, platform: 'tiktok', name, followers: f };
    if (i >= 0) acc[i] = row;
    else acc.push(row);
  }
  acc.sort((a, b) => a.date.localeCompare(b.date) || a.accountId.localeCompare(b.accountId));
  writeFileSync(accFile, JSON.stringify(acc, null, 1) + '\n');

  const n = raw.videos.length;
  const shares = raw.videos.reduce((s, v) => s + (num(v.video_shares) ?? 0), 0);
  console.log(`TikTok ${raw.account}: ${n} videos from Windsor (${shares} shares), ${merged.length} posts stored, ${acc.length} follower snapshots.`);
}
