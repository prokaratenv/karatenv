import { describe, expect, it } from 'vitest';
import { parseDate, parseDuration, parseNumber, parsePercent } from './normalize';
import { buildPosts, mergePosts, parseCsv } from './parse';
import { DEFAULT_ACCOUNTS } from '../platforms';

const accountFor = (platform: string) => DEFAULT_ACCOUNTS.find((a) => a.platform === platform && a.kind === 'business');

describe('cell parsers', () => {
  it('reads numbers in platform formats', () => {
    expect(parseNumber('1,234')).toBe(1234);
    expect(parseNumber('12.5K')).toBe(12500);
    expect(parseNumber('2M')).toBe(2_000_000);
    expect(parseNumber('--')).toBeUndefined();
    expect(parsePercent('45.2%')).toBeCloseTo(0.452);
    expect(parsePercent('45.2')).toBeCloseTo(0.452);
    expect(parsePercent('0.45')).toBeCloseTo(0.45);
  });
  it('reads durations', () => {
    expect(parseDuration('45')).toBe(45);
    expect(parseDuration('0:45')).toBe(45);
    expect(parseDuration('1:02:03')).toBe(3723);
    expect(parseDuration('PT1M5S')).toBe(65);
    expect(parseDuration('1m 5s')).toBe(65);
  });
  it('reads dates', () => {
    const d = new Date(parseDate('03/04/2025 6:05 PM')!);
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2025, 2, 4, 18, 5]);
    const n = new Date(parseDate('Mar 4, 2025')!);
    expect([n.getMonth(), n.getDate()]).toEqual([2, 4]);
    const i = new Date(parseDate('2025-03-04 21:00')!);
    expect(i.getHours()).toBe(21);
    expect(parseDate('2025-03-04T21:00:00Z')).toBe('2025-03-04T21:00:00.000Z');
  });
});

describe('YouTube Studio export', () => {
  const csv = `Content,Video title,Video publish time,Duration,Views,Watch time (hours),Subscribers,Impressions,Impressions click-through rate (%)
Total,,,,"12,000",300.5,40,90000,5.1
abc123,How to escape a wrist grab,"Mar 4, 2025",42,"8,100",120.2,30,50000,6.2
def456,Belt test day,"Mar 5, 2025",58,"3,900",80.3,10,40000,4.0`;
  it('maps columns, skips the total row', () => {
    const f = parseCsv(csv, 'Table data.csv');
    expect(f.platform).toBe('youtube');
    expect(f.mapping.externalId).toBe('Content');
    expect(f.mapping.views).toBe('Views');
    const { posts } = buildPosts(f, { platform: 'youtube', accountFor, viaOpus: false, source: 't' });
    expect(posts).toHaveLength(2);
    expect(posts[0]).toMatchObject({ title: 'How to escape a wrist grab', views: 8100, durationSec: 42, followersGained: 30, watchTimeHours: 120.2, accountId: 'yt-engage' });
  });
});

describe('Meta Business Suite (Instagram) export', () => {
  const csv = `Post ID,Account ID,Account username,Account name,Description,Duration (sec),Publish time,Permalink,Post type,Views,Reach,Likes,Shares,Follows,Comments,Saves
1789,99,engagelma,Engage Lifestyle Martial Arts,"Parents: this is why #kidsmartialarts",28,03/04/2025 21:00,https://instagram.com/reel/x,IG reel,"14,200",9000,610,180,22,31,95`;
  it('detects instagram and reads engagement', () => {
    const f = parseCsv(csv, 'export.csv');
    expect(f.platform).toBe('instagram');
    const { posts } = buildPosts(f, { platform: 'instagram', accountFor, viaOpus: false, source: 't' });
    expect(posts[0]).toMatchObject({ views: 14200, reach: 9000, likes: 610, shares: 180, saves: 95, comments: 31, format: 'short', hashtags: ['#kidsmartialarts'] });
    expect(posts[0].title).toContain('Parents');
  });
});

describe('multi-platform (Opus Clip style) export with preamble line', () => {
  const csv = `Opus Clip analytics export
Clip title,Platform,Published,Views,Likes,Comments,Shares,Virality score
Wrist grab escape,TikTok,2025-03-04 21:00,5000,300,10,40,88
Wrist grab escape,YouTube Shorts,2025-03-04 21:00,2000,80,3,5,88`;
  it('routes rows by platform cell', () => {
    const f = parseCsv(csv, 'opus.csv');
    expect(f.platform).toBe('multi');
    expect(f.viaOpus).toBe(true);
    const { posts, skipped } = buildPosts(f, { accountFor, viaOpus: f.viaOpus, source: 't' });
    expect(skipped).toEqual([]);
    expect(posts.map((p) => p.platform)).toEqual(['tiktok', 'youtube']);
    expect(posts[0].viralityScore).toBe(88);
  });
});

describe('mergePosts', () => {
  it('refreshes metrics on re-import', () => {
    const base = { id: 'a:1', accountId: 'a', platform: 'tiktok' as const, title: 't', caption: '', publishedAt: '2025-01-01T00:00:00Z', format: 'short' as const, views: 10, likes: 1, comments: 0, shares: 0, saves: 0, hashtags: [], importedAt: 'x', source: 's', viaOpus: true };
    const { posts, added, updated } = mergePosts([base], [{ ...base, views: 99, viaOpus: undefined }]);
    expect([added, updated]).toEqual([0, 1]);
    expect(posts[0].views).toBe(99);
    expect(posts[0].viaOpus).toBe(true);
  });
});
