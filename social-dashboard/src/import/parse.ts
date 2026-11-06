import Papa from 'papaparse';
import type { Account, Platform, Post, PostFormat } from '../types';
import { autoMap, detectPlatform, looksLikeOpus, platformFromCell, type Mapping } from './columns';
import { extractHashtags, parseDate, parseDuration, parseNumber, parsePercent } from './normalize';

export type Row = Record<string, string>;

export interface ParsedFile {
  fileName: string;
  headers: string[];
  rows: Row[];
  mapping: Mapping;
  platform: Platform | 'multi' | undefined;
  viaOpus: boolean;
}

/** Some exports (YouTube Studio, TikTok) put a title line or blank lines above the real header. */
function findHeaderLine(lines: string[][]): number {
  let best = 0;
  let bestScore = -1;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const m = autoMap(lines[i].filter(Boolean));
    const score = Object.keys(m).length;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

export function parseCsv(text: string, fileName = ''): ParsedFile {
  const raw = Papa.parse<string[]>(text.replace(/^﻿/, ''), { skipEmptyLines: 'greedy' }).data;
  const headerIdx = findHeaderLine(raw);
  const headers = (raw[headerIdx] ?? []).map((h) => h.trim());
  const rows: Row[] = raw.slice(headerIdx + 1).map((cells) => {
    const r: Row = {};
    headers.forEach((h, i) => {
      if (h) r[h] = (cells[i] ?? '').trim();
    });
    return r;
  });
  return {
    fileName,
    headers: headers.filter(Boolean),
    rows,
    mapping: autoMap(headers.filter(Boolean)),
    platform: detectPlatform(headers, fileName),
    viaOpus: looksLikeOpus(headers, fileName),
  };
}

export interface BuildContext {
  /** Platform for single-platform files. */
  platform?: Platform;
  /** Resolve the account a row belongs to. */
  accountFor: (platform: Platform, accountName?: string) => Account | undefined;
  viaOpus: boolean;
  source: string;
  now?: string;
}

export interface BuildResult {
  posts: Post[];
  skipped: { row: number; reason: string }[];
}

function inferFormat(platform: Platform, postType: string, durationSec?: number): PostFormat {
  const t = postType.toLowerCase();
  if (t.includes('carousel') || t.includes('album')) return 'carousel';
  if (t.includes('image') || t.includes('photo')) return 'image';
  if (t.includes('text') || t.includes('status') || t.includes('article')) return 'text';
  if (t.includes('reel') || t.includes('short')) return 'short';
  if (durationSec !== undefined) return durationSec <= 180 ? 'short' : 'video';
  if (t.includes('video')) return 'video';
  return platform === 'tiktok' ? 'short' : 'other';
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

export function buildPosts(file: Pick<ParsedFile, 'rows' | 'mapping'>, ctx: BuildContext): BuildResult {
  const m = file.mapping;
  const get = (r: Row, f: keyof Mapping) => (m[f] ? r[m[f]!] ?? '' : '');
  const num = (r: Row, f: keyof Mapping) => parseNumber(get(r, f));
  const posts: Post[] = [];
  const skipped: BuildResult['skipped'] = [];
  const now = ctx.now ?? new Date().toISOString();

  file.rows.forEach((r, i) => {
    const rowNo = i + 2;
    const extId = get(r, 'externalId');
    const title = get(r, 'title');
    const caption = get(r, 'caption');
    if (/^total$/i.test(extId) || /^total$/i.test(title)) return; // summary rows
    const publishedAt = parseDate(get(r, 'publishedAt'));
    if (!publishedAt) {
      if (title || caption || extId) skipped.push({ row: rowNo, reason: 'No readable publish date' });
      return;
    }
    const platform = (m.platform ? platformFromCell(get(r, 'platform')) : undefined) ?? ctx.platform;
    if (!platform) {
      skipped.push({ row: rowNo, reason: 'Unknown platform' });
      return;
    }
    const account = ctx.accountFor(platform, get(r, 'accountName') || undefined);
    if (!account) {
      skipped.push({ row: rowNo, reason: `No account chosen for ${platform}` });
      return;
    }
    const views = num(r, 'views') ?? num(r, 'impressions') ?? 0;
    const durationSec = parseDuration(get(r, 'durationSec'));
    const avgView = get(r, 'avgViewDurationSec');
    const url = get(r, 'url') || undefined;
    const displayTitle = title || firstLine(caption) || '(untitled)';
    const key = extId || url || `${slug(displayTitle)}-${publishedAt.slice(0, 16)}`;
    const text = `${title} ${caption}`;
    posts.push({
      id: `${account.id}:${key}`,
      accountId: account.id,
      platform,
      externalId: extId || undefined,
      title: displayTitle,
      caption,
      url,
      publishedAt,
      durationSec,
      format: inferFormat(platform, get(r, 'postType'), durationSec),
      views,
      impressions: num(r, 'impressions'),
      reach: num(r, 'reach'),
      likes: num(r, 'likes') ?? 0,
      comments: num(r, 'comments') ?? 0,
      shares: num(r, 'shares') ?? 0,
      saves: num(r, 'saves') ?? 0,
      watchTimeHours: num(r, 'watchTimeHours'),
      avgViewDurationSec: avgView ? parseDuration(avgView) : undefined,
      avgPercentViewed: parsePercent(get(r, 'avgPercentViewed')),
      followersGained: num(r, 'followersGained'),
      viaOpus: ctx.viaOpus || undefined,
      viralityScore: num(r, 'viralityScore'),
      hashtags: extractHashtags(text),
      importedAt: now,
      source: ctx.source,
    });
  });
  return { posts, skipped };
}

function firstLine(s: string): string {
  const line = s.split(/\r?\n/).find((l) => l.trim()) ?? '';
  return line.length > 90 ? line.slice(0, 87) + '…' : line;
}

/** Merge new posts into existing ones. Re-importing a post refreshes its metrics. */
export function mergePosts(existing: Post[], incoming: Post[]): { posts: Post[]; added: number; updated: number } {
  const byId = new Map(existing.map((p) => [p.id, p]));
  let added = 0;
  let updated = 0;
  for (const p of incoming) {
    const prev = byId.get(p.id);
    if (prev) {
      updated++;
      byId.set(p.id, {
        ...prev,
        ...stripUndefined(p),
        viaOpus: prev.viaOpus || p.viaOpus,
        viralityScore: p.viralityScore ?? prev.viralityScore,
      });
    } else {
      added++;
      byId.set(p.id, p);
    }
  }
  return { posts: [...byId.values()], added, updated };
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}
