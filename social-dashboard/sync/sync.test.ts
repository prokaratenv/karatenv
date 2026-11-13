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

import { igToPost, fbToPost, guessAccountId } from './meta';
import { followerChanges } from './weekly-report';

describe('Meta mapping', () => {
  it('maps an Instagram reel with insights', () => {
    const p = igToPost(
      { id: '179', caption: 'Parents: watch this\n#kidsmartialarts', media_type: 'VIDEO', media_product_type: 'REELS', permalink: 'https://instagram.com/reel/x', timestamp: '2026-11-01T04:00:00+0000', like_count: 120, comments_count: 9 },
      'ig-engage',
      { views: 5400, reach: 3900, saved: 31, shares: 44, ig_reels_avg_watch_time: 8300 },
      'now',
    );
    expect(p).toMatchObject({ id: 'ig-engage:179', platform: 'instagram', title: 'Parents: watch this', format: 'short', views: 5400, reach: 3900, saves: 31, shares: 44, likes: 120, comments: 9, avgViewDurationSec: 8.3, hashtags: ['#kidsmartialarts'] });
  });
  it('falls back to reach when views are missing, and keeps carousels', () => {
    const p = igToPost({ id: '1', media_type: 'CAROUSEL_ALBUM', timestamp: '2026-11-01T04:00:00+0000' }, 'ig-cdyoung', { reach: 700 }, 'now');
    expect(p).toMatchObject({ views: 700, format: 'carousel', title: '(no caption)' });
  });
  it('maps a Facebook page post', () => {
    const p = fbToPost(
      { id: '12_34', message: 'Belt test day!', created_time: '2026-11-02T01:00:00+0000', permalink_url: 'https://facebook.com/x', shares: { count: 7 }, reactions: { summary: { total_count: 88 } }, comments: { summary: { total_count: 5 } }, attachments: { data: [{ media_type: 'video' }] } },
      'fb-engage',
      { post_media_view: 2300, post_impressions_unique: 1500 },
      'now',
    );
    expect(p).toMatchObject({ platform: 'facebook', views: 2300, reach: 1500, likes: 88, comments: 5, shares: 7, format: 'short' });
  });
  it('guesses business vs personal accounts', () => {
    expect(guessAccountId('instagram', 'engagelma Engage Lifestyle Martial Arts')).toBe('ig-engage');
    expect(guessAccountId('instagram', 'cdyoung CD Young')).toBe('ig-cdyoung');
    expect(guessAccountId('facebook', 'Engage Lifestyle Martial Arts')).toBe('fb-engage');
  });
});

describe('followerChanges', () => {
  it('reports weekly change once a week of history exists', () => {
    const now = Date.parse('2026-11-16T15:00:00Z');
    const r = followerChanges(
      [
        { date: '2026-11-09', accountId: 'ig-engage', platform: 'instagram', name: '@engagelma', followers: 4000 },
        { date: '2026-11-16', accountId: 'ig-engage', platform: 'instagram', name: '@engagelma', followers: 4065 },
        { date: '2026-11-16', accountId: 'fb-engage', platform: 'facebook', name: 'Engage', followers: 2100 },
      ],
      now,
    );
    expect(r.find((x) => x.accountId === 'ig-engage')).toMatchObject({ followers: 4065, change: 65 });
    expect(r.find((x) => x.accountId === 'fb-engage')?.change).toBeUndefined();
  });
});

import { mergeOpus } from './opus-merge';
import { applyOpus } from '../src/import/opus';

describe('mergeOpus', () => {
  it('adds a week of posts, keeps old clips, and builds the backlog', () => {
    const existing = { updated: '2026-11-09', window: { start: '2026-10-10', end: '2026-11-09' }, clips: [{ clipId: 'old', projectId: 'P0', publishedAt: '2026-10-10T07:00:00Z', posts: { youtube: 'abc123def' } }] };
    const raw = {
      posts: [
        { clip_id: 'new', project_id: 'P1', publish_at: '2026-11-10T08:00:00Z', status: 'posted', platform: 'YOUTUBE', post_url: 'https://www.youtube.com/watch?v=XYZxyz12345' },
        { clip_id: 'new', project_id: 'P1', publish_at: '2026-11-10T08:00:01Z', status: 'posted', platform: 'INSTAGRAM_BUSINESS', post_url: 'https://www.instagram.com/reel/DfABC/' },
        { clip_id: 'new', project_id: 'P1', publish_at: '2026-11-10T08:00:01Z', status: 'posted', platform: 'LINKEDIN', post_url: 'https://www.linkedin.com/feed/update/1' },
        { clip_id: 'later', project_id: 'P1', publish_at: '2026-11-20T08:00:00Z', status: 'scheduled', platform: 'YOUTUBE' },
      ],
      clips: [
        { clip_id: 'new', project_id: 'P1', score: 88, title: 'New clip', duration_sec: 22 },
        { clip_id: 'unposted', project_id: 'P1', score: 93, title: 'Great unposted clip', duration_sec: 30 },
        { clip_id: 'weak', project_id: 'P1', score: 60, title: 'Weak' },
      ],
    };
    const m = mergeOpus(existing, raw, '2026-11-16');
    expect(m.clips.map((c) => c.clipId)).toEqual(['old', 'new']);
    expect(m.clips[1]).toMatchObject({ score: 88, title: 'New clip', posts: { youtube: 'XYZxyz12345', instagram: 'DfABC' }, linkedinPosts: 1 });
    expect(m.backlog?.map((b) => b.clipId)).toEqual(['unposted']);
    expect(m.window).toEqual({ start: '2026-10-10', end: '2026-11-16' });
  });

  it('keeps both posts when Opus posts the same clip again', () => {
    const tt = (id: string, at: string) => ({ clip_id: 'c', project_id: 'P', publish_at: at, status: 'posted', platform: 'TIKTOK_BUSINESS', post_url: `https://www.tiktok.com/@cdyoung/video/${id}` });
    const m = mergeOpus(undefined, { posts: [tt('111', '2026-11-09T10:22:00Z'), tt('222', '2026-11-11T09:40:00Z')], clips: [] }, '2026-11-13');
    expect(m.clips[0].posts.tiktok).toBe('111');
    expect(m.clips[0].reposts).toEqual(['tiktok:222']);
    const again = mergeOpus(m, { posts: [tt('222', '2026-11-11T09:40:00Z')], clips: [] }, '2026-11-14');
    expect(again.clips[0].reposts).toEqual(['tiktok:222']);
    const tagged = applyOpus([{ id: 'x', platform: 'tiktok', url: 'https://www.tiktok.com/@cdyoung/video/222', publishedAt: '2026-11-11T09:40:00Z' } as any], m);
    expect(tagged[0]).toMatchObject({ viaOpus: true, opusClipId: 'c' });
  });
});

import { parseGbpEmail } from './local-merge';

describe('parseGbpEmail', () => {
  it('reads the monthly Business Profile performance email', () => {
    const text = `Your business performance for October 2026: 153 interactions\n\nSee how Engage Lifestyle Martial Arts at 70 E Horizon Ridge Pkwy\n\n7\n\ncalls\n\n-46%\n\n103\n\npeople asked for directions\n-16%\n\n42\n\nwebsite visits from profile\n\n-4%\n\n599\n\nprofile views\n\n+5%\n\n38\n\nsearches\n\nNo change\n\nTop search terms\n\n1\n\ndojo\n\n22\n\n2\n\nengage\n\n<15\n\nAre your hours accurate?`;
    const g = parseGbpEmail(text);
    expect(g).toMatchObject({ month: '2026-10', profile: 'Engage Lifestyle Martial Arts', interactions: 153, calls: 7, directions: 103, websiteVisits: 42, profileViews: 599, searches: 38 });
    expect(g.change).toMatchObject({ calls: -0.46, directions: -0.16, profileViews: 0.05, searches: 0 });
    expect(g.topSearchTerms).toEqual([{ term: 'dojo', count: '22' }, { term: 'engage', count: '<15' }]);
  });
});
