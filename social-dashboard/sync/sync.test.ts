import { describe, expect, it } from 'vitest';
import { videoToPost, type YtVideo } from './youtube';
import { buildWeeklyReport } from './weekly-report';
import { generateSample } from '../src/data/sample';
import { DEFAULT_ACCOUNTS } from '../src/platforms';

const v: YtVideo = {
  id: 'abc123',
  snippet: { title: 'How to escape a wrist grab #selfdefense', description: 'Parents, watch this', publishedAt: '2026-11-01T04:00:00Z', tags: ['karate', 'self defense'] },
  contentDetails: { duration: 'PT42S' },
  statistics: { viewCount: '8100', likeCount: '300', commentCount: '12' },
};

describe('videoToPost', () => {
  it('maps a short with stats and tags', () => {
    const p = videoToPost(v, 'yt-engage', '2026-11-07T00:00:00Z');
    expect(p).toMatchObject({ id: 'yt-engage:abc123', platform: 'youtube', views: 8100, likes: 300, comments: 12, durationSec: 42, format: 'short', url: 'https://www.youtube.com/shorts/abc123' });
    expect(p.hashtags).toEqual(['#selfdefense']); // hidden YouTube tags are not hashtags
  });
  it('treats long videos as watch links', () => {
    const p = videoToPost({ ...v, contentDetails: { duration: 'PT12M3S' } }, 'yt-engage', '');
    expect(p.format).toBe('video');
    expect(p.url).toContain('watch?v=');
  });
});

describe('buildWeeklyReport', () => {
  const now = new Date(2026, 10, 9, 7);
  const posts = generateSample(DEFAULT_ACCOUNTS, 120, now).filter((p) => p.platform === 'youtube');
  it('includes channel deltas once two snapshots exist', () => {
    const r = buildWeeklyReport(posts, [
      { date: '2026-11-02', subscribers: 1000, views: 500000, videos: 300 },
      { date: '2026-11-09', subscribers: 1042, views: 531000, videos: 307 },
    ], 'https://example.com/dash', now);
    expect(r.subject).toContain('+31K YouTube views, +42 subscribers');
    expect(r.html).toContain('Top suggestions');
    expect(r.html).toContain('https://example.com/dash');
    expect(r.text).toContain('Do this:');
  });
  it('works on the first run with one snapshot', () => {
    const r = buildWeeklyReport(posts, [{ date: '2026-11-09', subscribers: 1042, views: 531000, videos: 307 }], 'x', now);
    expect(r.text).toContain('Week-over-week change starts next week');
  });
  it('escapes titles in HTML', () => {
    const evil = [{ ...posts[0], title: '<script>x</script>', publishedAt: new Date(now.getTime() - 86400000).toISOString() }];
    expect(buildWeeklyReport([...posts, ...evil], [], 'x', now).html).not.toContain('<script>');
  });
});
