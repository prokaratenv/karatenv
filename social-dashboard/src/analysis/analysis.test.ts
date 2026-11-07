import { describe, expect, it } from 'vitest';
import { analyze } from './analyze';
import { recommend } from './recommendations';
import { buildBrief } from './brief';
import { DEFAULT_TOPICS, compileTopics, tagPost } from './topics';
import { DEFAULT_ACCOUNTS } from '../platforms';
import { generateSample } from '../data/sample';
import { buildClusters } from './clusters';
import type { Post } from '../types';

const sample = generateSample(DEFAULT_ACCOUNTS, 120, new Date(2026, 10, 6));
const all = { rangeDays: 0, platforms: [], accountIds: [] };

describe('topic tagging', () => {
  it('matches whole words and phrases', () => {
    const c = compileTopics(DEFAULT_TOPICS);
    const p = { title: 'How to escape a wrist grab', caption: '', hashtags: ['#kidsmartialarts'] } as unknown as Post;
    expect(tagPost(p, c)).toEqual(expect.arrayContaining(['selfdefense', 'technique']));
    const q = { title: 'Skidding around', caption: '', hashtags: [] } as unknown as Post;
    expect(tagPost(q, c)).not.toContain('kids');
    // The brand name "Engage Lifestyle Martial Arts" must not tag every post as adult training.
    const brand = { title: 'Engage Winter Sale', caption: 'Engage Lifestyle Martial Arts, Henderson NV', hashtags: [] } as unknown as Post;
    expect(tagPost(brand, c)).not.toContain('adults');
    expect(tagPost(brand, c)).toContain('promo');
  });
});

describe('analyze on demo data', () => {
  const a = analyze(sample, DEFAULT_ACCOUNTS, all, DEFAULT_TOPICS);
  it('recovers the planted signal', () => {
    // Demo plants kids content as strongest and business as weakest.
    const kids = a.topics.find((t) => t.key === 'kids')!;
    const biz = a.topics.find((t) => t.key === 'business')!;
    expect(kids.medianLift).toBeGreaterThan(1.3);
    expect(biz.medianLift).toBeLessThan(0.9);
    const best = a.durations.reduce((x, y) => (y.medianLift > x.medianLift ? y : x));
    expect(best.key).toBe('d30');
    expect(a.durations.find((d) => d.key === 'd180')!.medianLift).toBeLessThan(0.8);
  });
  it('lift is ~1 at the median', () => {
    const lifts = a.mature.filter((p) => p.accountId === 'tt-engage').map((p) => p.lift).sort((x, y) => x - y);
    expect(lifts[Math.floor(lifts.length / 2)]).toBeGreaterThan(0.9);
    expect(lifts[Math.floor(lifts.length / 2)]).toBeLessThan(1.1);
  });
  it('clusters cross-posted clips', () => {
    expect(a.clusters.length).toBeGreaterThan(50);
    expect(a.clusters.every((c) => new Set(c.posts.map((p) => p.accountId)).size === c.posts.length)).toBe(true);
  });
  it('produces ranked recommendations and a brief', () => {
    const recs = recommend(a);
    expect(recs.length).toBeGreaterThan(4);
    expect(recs.some((r) => r.id === 'topic-up-kids')).toBe(true);
    expect(recs.some((r) => r.id === 'duration')).toBe(true);
    for (let i = 1; i < recs.length; i++) expect(recs[i - 1].score).toBeGreaterThanOrEqual(recs[i].score);
    expect(buildBrief(a, recs)).toContain('Kids & parenting');
  });
  it('filters by range and compares with the previous period', () => {
    const r = analyze(sample, DEFAULT_ACCOUNTS, { rangeDays: 30, platforms: ['tiktok'], accountIds: [] }, DEFAULT_TOPICS);
    expect(r.posts.every((p) => p.platform === 'tiktok')).toBe(true);
    expect(r.prevTotals?.posts).toBeGreaterThan(0);
  });
  it('asks for more data when there is little', () => {
    const r = analyze(sample.slice(0, 3), DEFAULT_ACCOUNTS, all, DEFAULT_TOPICS);
    expect(recommend(r)[0].id).toBe('need-data');
  });
});

describe('buildClusters', () => {
  it('does not join posts far apart in time', () => {
    const mk = (id: string, acc: string, day: number): Post => ({ id, accountId: acc, platform: 'tiktok', title: 'Wrist grab escape drill', caption: '', publishedAt: new Date(2025, 0, day).toISOString(), format: 'short', views: 1, likes: 0, comments: 0, shares: 0, saves: 0, hashtags: [], importedAt: '', source: '' });
    const c = buildClusters([mk('1', 'a', 1), mk('2', 'b', 2), mk('3', 'c', 20)]);
    expect(c.map((x) => x.posts.length).sort()).toEqual([1, 2]);
  });
});
