import { normalizeHeader } from './normalize';
import type { Platform } from '../types';

export type Field =
  | 'externalId'
  | 'title'
  | 'caption'
  | 'url'
  | 'publishedAt'
  | 'durationSec'
  | 'postType'
  | 'views'
  | 'impressions'
  | 'reach'
  | 'likes'
  | 'comments'
  | 'shares'
  | 'saves'
  | 'watchTimeHours'
  | 'avgViewDurationSec'
  | 'avgPercentViewed'
  | 'followersGained'
  | 'viralityScore'
  | 'platform'
  | 'accountName';

export const FIELD_LABEL: Record<Field, string> = {
  externalId: 'Post / video ID',
  title: 'Title',
  caption: 'Caption / description',
  url: 'Link',
  publishedAt: 'Publish time',
  durationSec: 'Duration',
  postType: 'Post type',
  views: 'Views',
  impressions: 'Impressions',
  reach: 'Reach',
  likes: 'Likes / reactions',
  comments: 'Comments',
  shares: 'Shares',
  saves: 'Saves',
  watchTimeHours: 'Watch time (hours)',
  avgViewDurationSec: 'Avg view duration',
  avgPercentViewed: 'Avg % viewed',
  followersGained: 'Followers gained',
  viralityScore: 'Opus virality score',
  platform: 'Platform (multi-platform files)',
  accountName: 'Account name',
};

export const FIELDS = Object.keys(FIELD_LABEL) as Field[];

/**
 * Header aliases, already in normalizeHeader() form. Order matters: earlier aliases win
 * when several headers could map to the same field (e.g. "views" beats "3 second video views").
 * Covers YouTube Studio, Meta Business Suite (FB + IG), TikTok Studio, LinkedIn and Opus Clip exports.
 */
const ALIASES: Record<Field, string[]> = {
  externalId: ['content', 'video id', 'post id', 'media id', 'item id', 'id', 'clip id'],
  title: ['video title', 'title', 'post title', 'clip title', 'name', 'clip name'],
  caption: ['description', 'caption', 'post description', 'video description', 'message', 'text', 'post text', 'commentary'],
  url: ['permalink', 'post link', 'video link', 'url', 'link', 'share url', 'post url'],
  publishedAt: [
    'video publish time', 'publish time', 'published time', 'post time', 'posted time', 'publish date',
    'published date', 'date posted', 'created time', 'created date', 'post date', 'posted', 'published', 'date', 'created',
    'scheduled time',
  ],
  durationSec: ['duration', 'duration sec', 'duration seconds', 'video duration', 'video length', 'length', 'clip duration'],
  postType: ['post type', 'content type', 'media type', 'media product type', 'type', 'format'],
  views: ['views', 'video views', 'total views', 'plays', 'video plays', 'total plays', 'reels plays', 'impressions views', '3 second video views'],
  impressions: ['impressions', 'total impressions'],
  reach: ['reach', 'accounts reached', 'unique viewers', 'people reached'],
  likes: ['likes', 'total likes', 'reactions', 'total reactions', 'like count'],
  comments: ['comments', 'total comments', 'comment count'],
  shares: ['shares', 'total shares', 'reposts', 'share count'],
  saves: ['saves', 'total saves', 'saved', 'favorites', 'total favorites', 'add to favorites'],
  watchTimeHours: ['watch time hours', 'watch time', 'total watch time hours'],
  avgViewDurationSec: ['average view duration', 'avg view duration', 'average watch time', 'avg watch time', 'average time watched'],
  avgPercentViewed: ['average percentage viewed %', 'average percentage viewed', 'avg percentage viewed', 'average % viewed', 'retention rate'],
  followersGained: ['subscribers', 'subscribers gained', 'follows', 'new followers', 'followers gained', 'new follows', 'followers'],
  viralityScore: ['virality score', 'virality', 'ai virality score'],
  platform: ['platform', 'social network', 'network', 'social platform'],
  accountName: ['account name', 'page name', 'account username', 'channel', 'channel name', 'account', 'username'],
};

export type Mapping = Partial<Record<Field, string>>;

/** Map each field to the best-matching raw header (exact alias first, then prefix match). */
export function autoMap(headers: string[]): Mapping {
  const norm = headers.map((h) => ({ raw: h, n: normalizeHeader(h) }));
  const used = new Set<string>();
  const mapping: Mapping = {};
  const take = (f: Field, raw: string) => {
    mapping[f] = raw;
    used.add(raw);
  };
  // Pass 1: exact alias matches, in alias priority order.
  for (const f of FIELDS) {
    for (const alias of ALIASES[f]) {
      const hit = norm.find((h) => h.n === alias && !used.has(h.raw));
      if (hit) {
        take(f, hit.raw);
        break;
      }
    }
  }
  // Pass 2: headers that start with an alias ("views lifetime", "likes 7 days").
  for (const f of FIELDS) {
    if (mapping[f]) continue;
    for (const alias of ALIASES[f]) {
      if (alias.length < 4) continue;
      const hit = norm.find((h) => !used.has(h.raw) && h.n.startsWith(alias + ' '));
      if (hit) {
        take(f, hit.raw);
        break;
      }
    }
  }
  return mapping;
}

/** Guess the platform from header fingerprints and the file name. */
export function detectPlatform(headers: string[], fileName = ''): Platform | 'multi' | undefined {
  const h = headers.map(normalizeHeader);
  const has = (s: string) => h.some((x) => x.includes(s));
  const f = fileName.toLowerCase();
  if (has('platform') || has('social network')) return 'multi';
  if (f.includes('youtube') || has('impressions click through rate') || has('video publish time') || has('subscribers')) return 'youtube';
  if (f.includes('tiktok') || has('total favorites') || has('favorites')) return 'tiktok';
  if (f.includes('linkedin') || has('commentary') || has('clicks')) return 'linkedin';
  if (f.includes('instagram') || has('account username') || has('saves') || has('accounts reached')) return 'instagram';
  if (f.includes('facebook') || has('page name') || has('reactions')) return 'facebook';
  return undefined;
}

export function platformFromCell(v: string): Platform | undefined {
  const s = v.toLowerCase();
  if (s.includes('youtube') || s === 'yt') return 'youtube';
  if (s.includes('insta') || s === 'ig') return 'instagram';
  if (s.includes('facebook') || s === 'fb' || s.includes('meta')) return 'facebook';
  if (s.includes('tiktok') || s === 'tt') return 'tiktok';
  if (s.includes('linkedin') || s === 'li') return 'linkedin';
  return undefined;
}

/** Opus Clip exports carry a virality score; that's our tell. */
export const looksLikeOpus = (headers: string[], fileName = '') =>
  fileName.toLowerCase().includes('opus') || headers.some((h) => normalizeHeader(h).includes('virality'));
