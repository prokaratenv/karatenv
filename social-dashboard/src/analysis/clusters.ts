import type { Post } from '../types';

/** One clip, posted to several accounts (Opus Clip cross-posts the same title/caption). */
export interface Cluster<P extends Post = Post> {
  key: string;
  title: string;
  posts: P[];
  firstPublished: string;
  totalViews: number;
}

const WINDOW_MS = 3 * 86_400_000;

export function titleTokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/#[\p{L}\p{N}_]+/gu, ' ')
      .replace(/['’]/g, '')
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 1),
  );
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export function buildClusters<P extends Post>(posts: P[], threshold = 0.6): Cluster<P>[] {
  // Exact matches from Opus Clip's records come first; title matching handles everything else.
  const exact: Cluster<P>[] = [];
  const byClip = new Map<string, P[]>();
  for (const p of posts) if (p.opusClipId) byClip.set(p.opusClipId, [...(byClip.get(p.opusClipId) ?? []), p]);
  for (const [key, ps] of byClip) {
    const first = [...ps].sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))[0];
    exact.push({ key: `opus:${key}`, title: first.title, posts: ps, firstPublished: first.publishedAt, totalViews: ps.reduce((n, p) => n + p.views, 0) });
  }
  return [...exact, ...buildTitleClusters(posts.filter((p) => !p.opusClipId), threshold)].sort((a, b) => b.totalViews - a.totalViews);
}

function buildTitleClusters<P extends Post>(posts: P[], threshold: number): Cluster<P>[] {
  const sorted = [...posts].sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  const clusters: { c: Cluster<P>; tokens: Set<string>; t: number; accounts: Set<string> }[] = [];
  let lo = 0;
  for (const p of sorted) {
    const t = Date.parse(p.publishedAt);
    const tokens = titleTokens(`${p.title}`);
    if (tokens.size < 2) continue;
    while (lo < clusters.length && t - clusters[lo].t > WINDOW_MS) lo++;
    let best: (typeof clusters)[number] | undefined;
    let bestScore = threshold;
    for (let i = lo; i < clusters.length; i++) {
      const k = clusters[i];
      if (k.accounts.has(p.accountId)) continue;
      const s = jaccard(tokens, k.tokens);
      if (s >= bestScore) {
        bestScore = s;
        best = k;
      }
    }
    if (best) {
      best.c.posts.push(p);
      best.c.totalViews += p.views;
      best.accounts.add(p.accountId);
    } else {
      clusters.push({
        c: { key: p.id, title: p.title, posts: [p], firstPublished: p.publishedAt, totalViews: p.views },
        tokens,
        t,
        accounts: new Set([p.accountId]),
      });
    }
  }
  return clusters.map((k) => k.c).sort((a, b) => b.totalViews - a.totalViews);
}
