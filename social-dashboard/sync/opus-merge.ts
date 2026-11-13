/**
 * Merges a week of Opus Clip data into public/data/opus.json.
 *
 * Input (a JSON file the weekly Claude run writes from the OpusClip connector):
 *   { "posts": [...opusclip_list_scheduled_posts().posts], "clips": [...opusclip_list_clips().clips for each project posted] }
 *
 *   npx tsx sync/opus-merge.ts <input.json>
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { OpusClipRecord, OpusData } from '../src/import/opus';

interface RawPost {
  clip_id: string;
  project_id: string;
  publish_at: string;
  status: string;
  platform: string;
  post_url?: string;
}
interface RawClip {
  clip_id: string;
  project_id: string;
  score?: number;
  title?: string;
  duration_sec?: number;
}

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../public/data/opus.json');

/** Opus platform name + post URL -> our platform key and the platform's own post id. */
export function postRef(p: RawPost): { key: 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin'; id: string } | undefined {
  const url = p.post_url ?? '';
  if (p.platform === 'YOUTUBE') {
    const id = url.match(/(?:v=|shorts\/)([\w-]{6,})/)?.[1];
    return id ? { key: 'youtube', id } : undefined;
  }
  if (p.platform.startsWith('INSTAGRAM')) {
    const id = url.match(/\/(?:reel|p|tv)\/([\w-]+)/)?.[1];
    return id ? { key: 'instagram', id } : undefined;
  }
  if (p.platform === 'FACEBOOK_PAGE') {
    const id = url.match(/\/(?:reel|videos)\/(\d+)/)?.[1];
    return id ? { key: 'facebook', id } : undefined;
  }
  if (p.platform.startsWith('TIKTOK')) {
    const id = url.match(/\/video\/(\d+)/)?.[1];
    return id ? { key: 'tiktok', id } : undefined;
  }
  if (p.platform === 'LINKEDIN') return { key: 'linkedin', id: url };
  return undefined;
}

export function mergeOpus(existing: OpusData | undefined, raw: { posts: RawPost[]; clips: RawClip[] }, today: string): OpusData {
  const clips = new Map<string, OpusClipRecord>((existing?.clips ?? []).map((c) => [c.clipId, { ...c, posts: { ...c.posts }, reposts: c.reposts ? [...c.reposts] : undefined }]));
  const meta = new Map(raw.clips.map((c) => [c.clip_id, c]));
  for (const p of raw.posts.filter((x) => x.status === 'posted')) {
    const ref = postRef(p);
    if (!ref) continue;
    const rec = clips.get(p.clip_id) ?? { clipId: p.clip_id, projectId: p.project_id, publishedAt: p.publish_at, posts: {}, linkedinPosts: 0 };
    if (Date.parse(p.publish_at) < Date.parse(rec.publishedAt)) rec.publishedAt = p.publish_at;
    if (ref.key === 'linkedin') rec.linkedinPosts = (rec.linkedinPosts ?? 0) + 1;
    else if (!rec.posts[ref.key] || rec.posts[ref.key] === ref.id) rec.posts[ref.key] = ref.id;
    else {
      // Same clip posted again: keep the first post and remember the repeat, so both count as Opus posts.
      const tag = `${ref.key}:${ref.id}`;
      if (!(rec.reposts ?? []).includes(tag)) rec.reposts = [...(rec.reposts ?? []), tag];
    }
    clips.set(p.clip_id, rec);
  }
  for (const rec of clips.values()) {
    const m = meta.get(rec.clipId);
    if (m) {
      if (m.score !== undefined) rec.score = m.score;
      if (m.title) rec.title = m.title;
      if (m.duration_sec) rec.durationSec = m.duration_sec;
    }
  }
  const posted = new Set(clips.keys());
  const backlog = [
    ...(existing?.backlog ?? []).filter((b) => !posted.has(b.clipId) && !meta.has(b.clipId)),
    ...raw.clips
      .filter((c) => !posted.has(c.clip_id) && (c.score ?? 0) >= 80)
      .map((c) => ({ clipId: c.clip_id, projectId: c.project_id, score: c.score!, title: c.title ?? c.clip_id, durationSec: c.duration_sec })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  const all = [...clips.values()].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  return {
    ...(existing ?? {}),
    updated: today,
    window: { start: existing?.window.start ?? all[0]?.publishedAt.slice(0, 10) ?? today, end: today },
    clips: all,
    backlog,
  } as OpusData;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: npx tsx sync/opus-merge.ts <input.json>');
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(input, 'utf8'));
  const existing: OpusData | undefined = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : undefined;
  const before = existing?.clips.length ?? 0;
  const merged = mergeOpus(existing, raw, new Date().toISOString().slice(0, 10));
  writeFileSync(OUT, JSON.stringify(merged, null, 1) + '\n');
  console.log(`Opus: ${merged.clips.length - before} new clips, ${merged.clips.length} total, ${merged.backlog?.length ?? 0} in the ready-to-post list.`);
}
