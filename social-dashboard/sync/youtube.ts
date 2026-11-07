/**
 * Pulls the Engage YouTube channel's videos and public stats (views, likes, comments)
 * from the YouTube Data API v3 and merges them into public/data/youtube.json,
 * which the dashboard loads automatically.
 *
 * Auth: an API key. In the cloud environment the network proxy adds it as the
 * X-Goog-Api-Key header; locally, set YOUTUBE_API_KEY.
 *
 *   npx tsx sync/youtube.ts            # sync
 *   npx tsx sync/youtube.ts --find     # list channels matching config.searchQuery
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Post } from '../src/types';
import { parseDuration, extractHashtags } from '../src/import/normalize';
import { mergePosts } from '../src/import/parse';

const here = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(here, 'config.json');
export const DATA_DIR = resolve(here, '../public/data');
export const POSTS_PATH = resolve(DATA_DIR, 'youtube.json');
export const CHANNEL_PATH = resolve(DATA_DIR, 'youtube-channel.json');
export const SOURCE = 'YouTube sync';

interface Config {
  accountId: string;
  channelId: string;
  searchQuery: string;
  maxVideos: number;
}

export interface YtVideo {
  id: string;
  snippet: { title: string; description?: string; publishedAt: string; tags?: string[] };
  contentDetails: { duration: string };
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
}

export interface ChannelSnapshot {
  date: string;
  subscribers: number;
  views: number;
  videos: number;
}

/** Map one API video to the dashboard's Post shape. */
export function videoToPost(v: YtVideo, accountId: string, now: string): Post {
  const durationSec = parseDuration(v.contentDetails.duration);
  const caption = v.snippet.description ?? '';
  const title = v.snippet.title;
  return {
    id: `${accountId}:${v.id}`,
    accountId,
    platform: 'youtube',
    externalId: v.id,
    title,
    caption,
    url: durationSec !== undefined && durationSec <= 180 ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`,
    publishedAt: new Date(v.snippet.publishedAt).toISOString(),
    durationSec,
    format: durationSec !== undefined && durationSec <= 180 ? 'short' : 'video',
    views: Number(v.statistics.viewCount ?? 0),
    likes: Number(v.statistics.likeCount ?? 0),
    comments: Number(v.statistics.commentCount ?? 0),
    shares: 0,
    saves: 0,
    hashtags: [...new Set([...extractHashtags(`${title} ${caption}`), ...(v.snippet.tags ?? []).filter((t) => !t.includes(' ')).map((t) => `#${t.toLowerCase()}`)])],
    importedAt: now,
    source: SOURCE,
  };
}

async function api<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const headers: Record<string, string> = {};
  if (process.env.YOUTUBE_API_KEY) headers['X-Goog-Api-Key'] = process.env.YOUTUBE_API_KEY;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text();
    const hint =
      res.status === 403
        ? ' (no API key reached Google, or the YouTube Data API v3 is not enabled for the key\'s project)'
        : '';
    throw new Error(`YouTube API ${path} returned ${res.status}${hint}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

async function findChannels(q: string) {
  const r = await api<{ items: { id: { channelId: string }; snippet: { title: string; description: string } }[] }>('search', {
    part: 'snippet',
    type: 'channel',
    q,
    maxResults: '5',
  });
  return r.items.map((i) => ({ id: i.id.channelId, title: i.snippet.title, description: i.snippet.description }));
}

export async function sync(): Promise<{ added: number; updated: number; total: number; channel: ChannelSnapshot }> {
  const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as Config;
  if (!cfg.channelId) throw new Error('Set channelId in sync/config.json (run with --find to look it up).');
  const now = new Date().toISOString();

  const ch = await api<{ items: { contentDetails: { relatedPlaylists: { uploads: string } }; statistics: Record<string, string> }[] }>('channels', {
    part: 'contentDetails,statistics',
    id: cfg.channelId,
  });
  if (!ch.items?.length) throw new Error(`Channel ${cfg.channelId} not found.`);
  const uploads = ch.items[0].contentDetails.relatedPlaylists.uploads;
  const stats = ch.items[0].statistics;

  const ids: string[] = [];
  let pageToken = '';
  do {
    const page = await api<{ items: { contentDetails: { videoId: string } }[]; nextPageToken?: string }>('playlistItems', {
      part: 'contentDetails',
      playlistId: uploads,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    });
    ids.push(...page.items.map((i) => i.contentDetails.videoId));
    pageToken = page.nextPageToken ?? '';
  } while (pageToken && ids.length < cfg.maxVideos);

  const posts: Post[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await api<{ items: YtVideo[] }>('videos', { part: 'snippet,contentDetails,statistics', id: ids.slice(i, i + 50).join(',') });
    posts.push(...r.items.map((v) => videoToPost(v, cfg.accountId, now)));
  }

  mkdirSync(DATA_DIR, { recursive: true });
  const existing: Post[] = existsSync(POSTS_PATH) ? JSON.parse(readFileSync(POSTS_PATH, 'utf8')) : [];
  const merged = mergePosts(existing, posts);
  merged.posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  writeFileSync(POSTS_PATH, JSON.stringify(merged.posts, null, 1) + '\n');

  // Channel-level history: one row per sync day, for audience growth over time.
  const snap: ChannelSnapshot = {
    date: now.slice(0, 10),
    subscribers: Number(stats.subscriberCount ?? 0),
    views: Number(stats.viewCount ?? 0),
    videos: Number(stats.videoCount ?? 0),
  };
  const history: ChannelSnapshot[] = existsSync(CHANNEL_PATH) ? JSON.parse(readFileSync(CHANNEL_PATH, 'utf8')) : [];
  const next = [...history.filter((h) => h.date !== snap.date), snap].sort((a, b) => a.date.localeCompare(b.date));
  writeFileSync(CHANNEL_PATH, JSON.stringify(next, null, 1) + '\n');

  return { added: merged.added, updated: merged.updated, total: merged.posts.length, channel: snap };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  (async () => {
    if (process.argv.includes('--find')) {
      const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as Config;
      console.log(JSON.stringify(await findChannels(cfg.searchQuery), null, 2));
      return;
    }
    const r = await sync();
    console.log(
      `YouTube sync: ${r.added} new, ${r.updated} refreshed, ${r.total} videos stored. Channel: ${r.channel.subscribers} subscribers, ${r.channel.views} total views.`,
    );
  })().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
