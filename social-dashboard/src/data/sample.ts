import type { Account, Post } from '../types';
import { extractHashtags } from '../import/normalize';

/** Deterministic PRNG so demo data is stable between reloads. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLIPS: { topic: string; weight: number; titles: string[]; tags: string[] }[] = [
  { topic: 'kids', weight: 1.9, tags: ['#kidsmartialarts', '#parenting'], titles: [
    'What 3 months of karate did for my shy son', 'Parents: this is why your kid needs martial arts', 'How to build confidence in kids who get picked on', 'Watch this 6 year old break his first board', 'The one thing every parent should teach their kid',
  ] },
  { topic: 'selfdefense', weight: 1.6, tags: ['#selfdefense', '#safety'], titles: [
    'How to escape a wrist grab in 2 seconds', 'Never do this if someone grabs you', 'Self defense move every woman should know', 'Stranger danger drill we teach our kids', '3 self defense mistakes you are making',
  ] },
  { topic: 'mindset', weight: 1.0, tags: ['#mindset', '#motivation'], titles: [
    'Discipline beats motivation every time', 'Why I never let my students quit', 'The black belt mindset in 30 seconds', 'Your goals need a plan not a wish', 'What fear taught me about success',
  ] },
  { topic: 'technique', weight: 0.85, tags: ['#karate', '#technique'], titles: [
    'Roundhouse kick breakdown', 'Fix your stance with this drill', 'Footwork drill for beginners', 'Jab cross combo tutorial', 'Side kick power tip',
  ] },
  { topic: 'belts', weight: 1.25, tags: ['#blackbelt', '#belttest'], titles: [
    'She earned her black belt at 62', 'Belt test day emotions', 'From white belt to black belt journey', 'Graduation day at Engage', 'The moment he got his stripe',
  ] },
  { topic: 'business', weight: 0.6, tags: ['#entrepreneur', '#leadership'], titles: [
    'What running a martial arts school taught me about leadership', 'Hiring lessons from the dojo', 'Marketing my school on zero budget', 'Why I started Engage', 'Leadership is a daily habit',
  ] },
  { topic: 'humor', weight: 1.35, tags: ['#funny', '#pov'], titles: [
    'POV: your kid tries karate on the dog', 'When the 4 year olds run warmups', 'Wait for it… board breaking fail', 'Every dad at belt testing', 'POV: first day of class',
  ] },
  { topic: 'fitness', weight: 0.75, tags: ['#fitness', '#workout'], titles: [
    'Adult karate class workout', 'Burn calories without the gym', 'Flexibility stretch routine for adults', 'Conditioning drill for busy parents', 'Over 40 and getting stronger',
  ] },
];

const PLATFORM_BASE: Record<string, { base: number; bestHour: number; likeRate: number; shareRate: number; commentRate: number; saveRate: number }> = {
  'yt-engage': { base: 1400, bestHour: 19, likeRate: 0.035, shareRate: 0.004, commentRate: 0.0025, saveRate: 0 },
  'ig-engage': { base: 2100, bestHour: 12, likeRate: 0.045, shareRate: 0.012, commentRate: 0.003, saveRate: 0.006 },
  'ig-cdyoung': { base: 650, bestHour: 7, likeRate: 0.06, shareRate: 0.008, commentRate: 0.005, saveRate: 0.004 },
  'fb-engage': { base: 900, bestHour: 18, likeRate: 0.03, shareRate: 0.015, commentRate: 0.004, saveRate: 0 },
  'fb-cdyoung': { base: 500, bestHour: 20, likeRate: 0.05, shareRate: 0.01, commentRate: 0.008, saveRate: 0 },
  'tt-engage': { base: 3200, bestHour: 21, likeRate: 0.05, shareRate: 0.006, commentRate: 0.0015, saveRate: 0.004 },
  'tt-cdyoung': { base: 1100, bestHour: 21, likeRate: 0.055, shareRate: 0.005, commentRate: 0.002, saveRate: 0.003 },
};

function durationEffect(sec: number): number {
  if (sec < 15) return 0.7;
  if (sec < 30) return 1.5;
  if (sec < 60) return 1.1;
  if (sec < 90) return 0.8;
  return 0.6;
}

/** ~120 days of nightly Opus Clip posting across the business accounts, plus some personal posts. */
export function generateSample(accounts: Account[], days = 120, end = new Date()): Post[] {
  const r = rng(42);
  const posts: Post[] = [];
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const importedAt = endDay.toISOString();
  const has = new Set(accounts.map((a) => a.id));
  const normal = () => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());

  for (let d = days; d >= 1; d--) {
    const clipsToday = r() < 0.85 ? 1 : 2;
    for (let c = 0; c < clipsToday; c++) {
      const group = CLIPS[Math.floor(r() * CLIPS.length)];
      const title = group.titles[Math.floor(r() * group.titles.length)];
      const dur = Math.round(10 + r() * r() * 150);
      const quality = Math.exp(normal() * 0.55); // shared across platforms: good clips are good everywhere
      const targets = ['yt-engage', 'ig-engage', 'fb-engage', 'tt-engage'].filter(() => r() < 0.9);
      if (group.topic === 'business' || group.topic === 'mindset') targets.push('ig-cdyoung', 'fb-cdyoung', 'tt-cdyoung');
      for (const acc of targets) {
        if (!has.has(acc)) continue;
        const cfg = PLATFORM_BASE[acc];
        const hourJitter = r() < 0.6 ? 21 : [7, 12, 18, 19, 20, 22][Math.floor(r() * 6)];
        const date = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() - d, hourJitter, Math.floor(r() * 60));
        const timeEffect = Math.abs(hourJitter - cfg.bestHour) <= 1 ? 1.35 : 1;
        const weekend = date.getDay() === 0 || date.getDay() === 6 ? 0.85 : 1;
        const growth = 1 + (days - d) / days * 0.5;
        const titleEffect = /\?|how to|never|mistake/i.test(title) ? 1.2 : 1;
        const views = Math.round(cfg.base * group.weight * durationEffect(dur) * quality * timeEffect * weekend * growth * titleEffect * Math.exp(normal() * 0.35));
        const shareBoost = group.topic === 'kids' || group.topic === 'selfdefense' ? 1.8 : 1;
        const caption = `${title} ${group.tags.join(' ')} #martialarts #engagelifestyle`;
        const platform = acc.startsWith('yt') ? 'youtube' : acc.startsWith('ig') ? 'instagram' : acc.startsWith('fb') ? 'facebook' : 'tiktok';
        const scoreNoise = Math.round(Math.min(99, Math.max(40, 70 + normal() * 12 + Math.log(quality) * 3)));
        posts.push({
          id: `${acc}:demo-${d}-${c}`,
          accountId: acc,
          platform,
          title,
          caption,
          publishedAt: date.toISOString(),
          durationSec: dur,
          format: 'short',
          views,
          likes: Math.round(views * cfg.likeRate * (0.7 + r() * 0.6)),
          comments: Math.round(views * cfg.commentRate * (0.5 + r())),
          shares: Math.round(views * cfg.shareRate * shareBoost * (0.5 + r())),
          saves: Math.round(views * cfg.saveRate * (0.5 + r())),
          followersGained: Math.round(views * 0.002 * (0.5 + r())),
          watchTimeHours: platform === 'youtube' ? +((views * dur * 0.55) / 3600).toFixed(1) : undefined,
          viaOpus: true,
          viralityScore: scoreNoise,
          hashtags: extractHashtags(caption),
          importedAt,
          source: 'Demo data',
        });
      }
    }
    // Occasional hand-made posts on personal accounts.
    if (r() < 0.25) {
      const acc = ['ig-cdyoung', 'fb-cdyoung', 'li-cdyoung'][Math.floor(r() * 3)];
      if (!has.has(acc)) continue;
      const titles = ['Family day after Saturday class', 'Grateful for this community', 'Lessons from 20 years on the mat', 'Coffee with my instructors', 'Why I wake up at 5am'];
      const title = titles[Math.floor(r() * titles.length)];
      const date = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() - d, 8 + Math.floor(r() * 10), 0);
      const base = acc === 'li-cdyoung' ? 400 : 550;
      const views = Math.round(base * Math.exp(normal() * 0.6));
      const platform = acc.startsWith('ig') ? 'instagram' : acc.startsWith('fb') ? 'facebook' : 'linkedin';
      posts.push({
        id: `${acc}:demo-native-${d}`,
        accountId: acc,
        platform,
        title,
        caption: title,
        publishedAt: date.toISOString(),
        format: r() < 0.5 ? 'image' : 'carousel',
        views,
        likes: Math.round(views * 0.08),
        comments: Math.round(views * 0.012),
        shares: Math.round(views * 0.004),
        saves: Math.round(views * 0.003),
        hashtags: [],
        importedAt,
        source: 'Demo data',
      });
    }
  }
  return posts;
}
