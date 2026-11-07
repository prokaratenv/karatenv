import type { Analysis } from './analyze';
import { MIN_N } from './analyze';
import { PLATFORM_LABEL } from '../platforms';
import { DAYS, hourLabel, lift, pct } from '../lib/format';
import { median } from '../lib/stats';

export type Category = 'content' | 'format' | 'timing' | 'platform' | 'engagement' | 'consistency' | 'opus';

export interface Recommendation {
  id: string;
  category: Category;
  /** 0-100: how much this is likely to move the needle, scaled by evidence strength. */
  score: number;
  title: string;
  why: string;
  action: string;
  evidence: string;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  content: 'Content',
  format: 'Format',
  timing: 'Timing',
  platform: 'Platform',
  engagement: 'Engagement',
  consistency: 'Consistency',
  opus: 'Opus Clip',
};

/** Shrinks a score when the sample is small, so 4 lucky posts don't outrank 40 solid ones. */
const confidence = (n: number) => Math.min(1, Math.log2(1 + n) / Math.log2(1 + 30));

const scoreOf = (effect: number, n: number) => Math.round(Math.min(100, Math.abs(Math.log2(Math.max(effect, 0.01))) * 60 * confidence(n)));

export function recommend(a: Analysis): Recommendation[] {
  const recs: Recommendation[] = [];
  const n = a.mature.length;
  if (n < MIN_N * 2) {
    return [
      {
        id: 'need-data',
        category: 'consistency',
        score: 100,
        title: 'Import more posts to unlock suggestions',
        why: `Only ${n} posts are old enough (2+ days) to judge. Patterns need a few dozen.`,
        action: 'Import the last 90 days from each platform (see the Import tab for where each export lives).',
        evidence: `${n} mature posts in the current filter.`,
      },
    ];
  }

  // Content: winning and losing topics.
  const topics = a.topics.filter((t) => t.key !== '_none' && t.n >= MIN_N && t.clips >= 3);
  for (const t of topics.filter((t) => t.medianLift >= 1.3).slice(0, 3)) {
    const ex = t.top[0];
    recs.push({
      id: `topic-up-${t.key}`,
      category: 'content',
      score: scoreOf(t.medianLift, t.clips),
      title: `Make more "${t.label}" content`,
      why: `Posts on this topic get ${lift(t.medianLift)} the views of a typical post on the same account.`,
      action: `Plan 2–3 more ${t.label.toLowerCase()} clips this week. Your best one, "${ex?.title ?? ''}", is the template: reuse its opening and angle.`,
      evidence: `${t.n} posts (${t.clips} distinct clips) · ${t.sharesPer1k.toFixed(1)} shares per 1K views · ${pct(t.engRate)} engagement`,
    });
  }
  const weak = topics.filter((t) => t.medianLift <= 0.7 && t.n >= MIN_N + 2).slice(-2);
  for (const t of weak) {
    if (t.key === 'promo' || t.key === 'belts') {
      // These serve current families, not discovery. Say so instead of "cut back".
      recs.push({
        id: `topic-down-${t.key}`,
        category: 'content',
        score: Math.round(scoreOf(t.medianLift, t.clips) * 0.5),
        title: `"${t.label}" posts don't grow your audience`,
        why: `They run at ${lift(t.medianLift)} of a typical post. That's expected: they're made for current families, and the algorithm doesn't push them to new people.`,
        action: `Keep them for members (Stories, Facebook group, email), and don't count them toward your growth posts. If you post one publicly, open with a hook from your best-performing topic.`,
        evidence: `${t.n} posts`,
      });
      continue;
    }
    recs.push({
      id: `topic-down-${t.key}`,
      category: 'content',
      score: Math.round(scoreOf(t.medianLift, t.clips) * 0.7),
      title: `Rework or cut back on "${t.label}"`,
      why: `This topic runs at ${lift(t.medianLift)} of normal views. Your audience is skipping it as currently packaged.`,
      action: `Try one ${t.label.toLowerCase()} post with a stronger hook borrowed from your top topic, or shift that slot to a winning topic.`,
      evidence: `${t.n} posts`,
    });
  }

  // Keywords the topic list doesn't cover.
  const kw = a.keywords.filter((k) => k.medianLift >= 1.6 && k.n >= MIN_N && k.clips >= 3).slice(0, 2);
  for (const k of kw) {
    recs.push({
      id: `kw-${k.key}`,
      category: 'content',
      score: Math.round(scoreOf(k.medianLift, k.clips) * 0.8),
      title: `Lean into "${k.key}"`,
      why: `Titles or captions mentioning "${k.key}" reach ${lift(k.medianLift)} normal views.`,
      action: `Use "${k.key}" in the first line of an upcoming caption or as the clip's on-screen text, and ask Opus Clip to find more moments about it.`,
      evidence: `${k.n} posts (${k.clips} distinct clips)`,
    });
  }

  // Hooks.
  // Both sides must be real audiences: a pattern vs a pile of near-zero uploads is not a hook insight.
  const hook = a.hooks.find((h) => h.ratio >= 1.25 && h.withoutLift >= 0.25);
  if (hook) {
    recs.push({
      id: `hook-${hook.key}`,
      category: 'format',
      score: scoreOf(hook.ratio, Math.min(hook.withN, hook.withoutN)),
      title: `Hook pattern that works: ${hook.label.toLowerCase()}`,
      why: `Posts with this pattern get ${lift(hook.withLift)} typical views vs ${lift(hook.withoutLift)} without it.`,
      action: `Edit Opus Clip titles before they publish so more of them follow this pattern.`,
      evidence: `${hook.withN} with · ${hook.withoutN} without`,
    });
  }
  const badHook = a.hooks.find((h) => h.ratio <= 0.75 && h.withN >= MIN_N * 2 && h.withLift >= 0.25);
  if (badHook) {
    recs.push({
      id: `hook-bad-${badHook.key}`,
      category: 'format',
      score: Math.round(scoreOf(badHook.ratio, badHook.withN) * 0.6),
      title: `Pattern to avoid: ${badHook.label.toLowerCase()}`,
      why: `These posts run at ${lift(badHook.withLift)} vs ${lift(badHook.withoutLift)}.`,
      action: 'Drop this from default title templates and see if the gap closes over two weeks.',
      evidence: `${badHook.withN} with · ${badHook.withoutN} without`,
    });
  }

  // Duration sweet spot.
  const durs = a.durations.filter((d) => d.clips >= MIN_N);
  if (durs.length >= 2) {
    const best = durs.reduce((x, y) => (y.medianLift > x.medianLift ? y : x));
    const rest = median(durs.filter((d) => d !== best).map((d) => d.medianLift)) || 1;
    if (best.medianLift / rest >= 1.2) {
      const perPlatform = Object.entries(a.durationsByPlatform)
        .map(([pl, ds]) => {
          const ok = (ds ?? []).filter((d) => d.n >= MIN_N);
          if (ok.length < 2) return '';
          const b = ok.reduce((x, y) => (y.medianLift > x.medianLift ? y : x));
          return `${PLATFORM_LABEL[pl as keyof typeof PLATFORM_LABEL]}: ${b.label}`;
        })
        .filter(Boolean);
      recs.push({
        id: 'duration',
        category: 'format',
        score: scoreOf(best.medianLift / rest, best.clips),
        title: `Sweet-spot length: ${best.label}`,
        why: `Clips ${best.label.toLowerCase()} get ${lift(best.medianLift)} typical views; other lengths average ${lift(rest)}.`,
        action: `Set Opus Clip's target length to ${best.label.toLowerCase()}.${perPlatform.length ? ` Per platform: ${perPlatform.join(' · ')}.` : ''}`,
        evidence: `${best.n} clips in that range`,
      });
    }
  }

  // Timing.
  const cells = a.heat.filter((c) => c.clips >= MIN_N);
  if (cells.length >= 3) {
    const best = cells.reduce((x, y) => (y.medianLift > x.medianLift ? y : x));
    const busiest = cells.reduce((x, y) => (y.n > x.n ? y : x));
    if (best !== busiest && best.medianLift / Math.max(busiest.medianLift, 0.01) >= 1.2) {
      recs.push({
        id: 'timing',
        category: 'timing',
        score: scoreOf(best.medianLift / Math.max(busiest.medianLift, 0.01), best.clips),
        title: `Test posting ${DAYS[best.day]} ${blockLabel(best.block)}`,
        why: `Posts in that window get ${lift(best.medianLift)} typical views. Your most common slot (${DAYS[busiest.day]} ${blockLabel(busiest.block)}) gets ${lift(busiest.medianLift)}.`,
        action: `Move part of the Opus Clip schedule into this window for 2 weeks and compare.`,
        evidence: `${best.clips} clips in best window · ${busiest.clips} in busiest`,
      });
    }
    const hours = Object.entries(a.bestHourByPlatform)
      .map(([pl, h]) => `${PLATFORM_LABEL[pl as keyof typeof PLATFORM_LABEL]} ${hourLabel(h!.hour)} (${lift(h!.medianLift)})`)
      .join(' · ');
    if (hours && Object.keys(a.bestHourByPlatform).length >= 2) {
      recs.push({
        id: 'timing-platform',
        category: 'timing',
        score: 25,
        title: 'Stagger publish times by platform',
        why: 'Each platform has its own best hour. One nightly time for every platform leaves views on the table.',
        action: `Schedule each platform at its own best hour: ${hours}.`,
        evidence: 'hours with 4+ posts',
      });
    }
  }

  // Platform focus: same clip, which platform wins?
  if (a.platformWins.length >= 2) {
    const top = a.platformWins[0];
    const rate = top.wins / top.appearances;
    if (top.appearances >= MIN_N && rate >= 0.4) {
      recs.push({
        id: 'platform-wins',
        category: 'platform',
        score: Math.round(40 * confidence(top.appearances) + rate * 30),
        title: `${PLATFORM_LABEL[top.platform]} gets the most out of each clip`,
        why: `When the same clip goes everywhere, ${PLATFORM_LABEL[top.platform]} beats its own typical video by the most ${pct(rate, 0)} of the time.`,
        action: `Publish there first, reply to comments in the first hour, and save platform-native extras (trending audio, polls, pinned comments) for it.`,
        evidence: `${top.appearances} cross-posted clips`,
      });
    }
  }

  // Engagement: shares drive reach.
  const shareStars = a.topics.filter((t) => t.clips >= 3 && t.key !== '_none').sort((x, y) => y.sharesPer1k - x.sharesPer1k);
  if (shareStars.length >= 2 && shareStars[0].sharesPer1k > 1.5 * (median(shareStars.map((s) => s.sharesPer1k)) || 1)) {
    const s = shareStars[0];
    recs.push({
      id: 'shares',
      category: 'engagement',
      score: Math.round(45 * confidence(s.clips)),
      title: `"${s.label}" is your most shareable content`,
      why: `Shares are how new people find you. This topic earns ${s.sharesPer1k.toFixed(1)} shares per 1K views, the most of any topic.`,
      action: 'Close these clips with a share prompt ("Send this to a parent who needs it") instead of "follow for more".',
      evidence: `${s.n} posts`,
    });
  }
  const lowComments = a.byAccount.filter((x) => x.posts >= MIN_N && x.views > 0).sort((x, y) => x.commentsPer1k - y.commentsPer1k)[0];
  const topComments = a.byAccount.filter((x) => x.posts >= MIN_N && x.views > 0).sort((x, y) => y.commentsPer1k - x.commentsPer1k)[0];
  if (lowComments && topComments && lowComments !== topComments && topComments.commentsPer1k > 3 * Math.max(lowComments.commentsPer1k, 0.05)) {
    recs.push({
      id: 'comments',
      category: 'engagement',
      score: 30,
      title: `Spark more conversation on ${PLATFORM_LABEL[lowComments.account.platform]} (${lowComments.account.name})`,
      why: `It gets ${lowComments.commentsPer1k.toFixed(2)} comments per 1K views vs ${topComments.commentsPer1k.toFixed(2)} on ${PLATFORM_LABEL[topComments.account.platform]}.`,
      action: 'End captions with one specific question (e.g. "What age did your kid start?") and pin your own reply.',
      evidence: `${lowComments.posts} posts`,
    });
  }

  // Breakouts worth remixing.
  if (a.breakouts.length) {
    const b = a.breakouts[0];
    recs.push({
      id: 'breakout',
      category: 'content',
      score: Math.round(Math.min(70, 25 + 10 * Math.log2(b.lift))),
      title: `Remix your breakout: "${b.title}"`,
      why: `It hit ${lift(b.lift)} the normal views on ${PLATFORM_LABEL[b.platform]}. Breakouts tell you what the algorithm wants more of.`,
      action: 'Film a part 2, a reaction or a "here\'s what happened next", and repost the original to accounts that skipped it.',
      evidence: `${a.breakouts.length} posts in this period hit 3×+ normal.`,
    });
  }

  // Opus Clip.
  if (a.opus && a.opus.nOpus >= MIN_N && a.opus.nNative >= MIN_N) {
    const r = a.opus.opusLift / Math.max(a.opus.nativeLift, 0.01);
    recs.push({
      id: 'opus-vs-native',
      category: 'opus',
      score: scoreOf(r, Math.min(a.opus.nOpus, a.opus.nNative)),
      title: r >= 1 ? 'Opus Clip posts are pulling their weight' : 'Your hand-made posts beat Opus Clip auto-posts',
      why: `Opus Clip posts get ${lift(a.opus.opusLift)} typical views, other posts get ${lift(a.opus.nativeLift)}.`,
      action:
        r >= 1
          ? 'Keep the nightly schedule. Spend the time saved replying to comments on the top 2 clips each morning.'
          : 'Review Opus titles and first frames before they go out, and add one hand-made post per week.',
      evidence: `${a.opus.nOpus} Opus · ${a.opus.nNative} other`,
    });
  }
  if (a.opus?.viralityCorr !== undefined) {
    const c = a.opus.viralityCorr;
    recs.push({
      id: 'opus-virality',
      category: 'opus',
      score: 30,
      title: Math.abs(c) < 0.2 ? "Opus Clip's virality score doesn't predict your results" : "Opus Clip's virality score is a useful filter",
      why: `Correlation between the score and actual performance: ${c.toFixed(2)} (1.0 = perfect, 0 = none).`,
      action:
        Math.abs(c) < 0.2
          ? 'Pick clips by topic and hook (see Insights) instead of by score alone.'
          : 'Post the highest-scored clips at your best times and skip the lowest-scored ones.',
      evidence: `${a.opus.viralityN} scored clips`,
    });
  }

  // Consistency.
  if (a.cadence.weeks >= 6 && a.cadence.corr >= 0.3) {
    recs.push({
      id: 'cadence',
      category: 'consistency',
      score: Math.round(30 + a.cadence.corr * 30),
      title: 'More posts = more views (so far)',
      why: `Weeks with more posts reliably bring more total views (correlation ${a.cadence.corr.toFixed(2)}). You're not saturating your audience yet.`,
      action: `You average ${a.cadence.postsPerWeek.toFixed(0)} posts/week across accounts. Add one more daily slot on your best platform.`,
      evidence: `${a.cadence.weeks} weeks`,
    });
  }

  return recs.filter((r) => r.score >= 8).sort((x, y) => y.score - x.score);
}

export function blockLabel(block: number): string {
  return `${hourLabel(block * 3)}–${hourLabel((block * 3 + 3) % 24)}`;
}
