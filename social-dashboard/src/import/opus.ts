import type { Platform, Post } from '../types';

/** What we keep from Opus Clip: which clip went to which post on each platform, and its score. */
export interface OpusClipRecord {
  clipId: string;
  projectId: string;
  publishedAt: string;
  posts: Partial<Record<'youtube' | 'instagram' | 'facebook' | 'tiktok', string>>;
  /** The same clip posted again later (Opus re-posts): extra post ids per platform. */
  reposts?: string[];
  linkedinPosts?: number;
  score?: number;
  title?: string;
  durationSec?: number;
}

export interface OpusData {
  updated: string;
  window: { start: string; end: string };
  clips: OpusClipRecord[];
  backlog?: { clipId: string; projectId: string; score: number; title: string; durationSec?: number }[];
}

/** The platform's own id for a post, from our stored post. Matches the ids Opus records. */
export function platformPostId(p: Post): string | undefined {
  const url = p.url ?? '';
  switch (p.platform) {
    case 'youtube':
      return p.externalId ?? url.match(/(?:v=|shorts\/)([\w-]{6,})/)?.[1];
    case 'instagram':
      return url.match(/\/(?:reel|p|tv)\/([\w-]+)/)?.[1];
    case 'facebook':
      return url.match(/\/(?:reel|videos)\/(\d+)/)?.[1];
    case 'tiktok':
      return url.match(/\/video\/(\d+)/)?.[1];
    default:
      return undefined;
  }
}

/**
 * Tag posts that Opus Clip published (viaOpus, opusClipId, viralityScore). Posts on Opus-connected
 * platforms dated inside the Opus records' window get opusChecked, so an unmatched one is known to be
 * hand-posted rather than just missing from the records.
 */
export function applyOpus(posts: Post[], opus: OpusData | undefined): Post[] {
  if (!opus?.clips?.length) return posts;
  const index = new Map<string, OpusClipRecord>();
  for (const c of opus.clips) {
    for (const [platform, id] of Object.entries(c.posts)) if (id) index.set(`${platform}:${id}`, c);
    for (const ref of c.reposts ?? []) index.set(ref, c); // "platform:id"
  }
  const covered = new Set<Platform>();
  for (const c of opus.clips) for (const k of Object.keys(c.posts)) covered.add(k as Platform);
  const start = Date.parse(opus.window.start);
  const end = Date.parse(opus.window.end) + 86_400_000;
  return posts.map((p) => {
    const id = platformPostId(p);
    const rec = id ? index.get(`${p.platform}:${id}`) : undefined;
    const t = Date.parse(p.publishedAt);
    const inWindow = covered.has(p.platform) && t >= start && t < end;
    if (rec) return { ...p, viaOpus: true, opusClipId: rec.clipId, viralityScore: rec.score ?? p.viralityScore, opusChecked: true };
    return inWindow ? { ...p, opusChecked: true } : p;
  });
}
