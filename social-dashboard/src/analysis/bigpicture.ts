import type { Analysis, EnrichedPost } from './analyze';
import { DURATION_BUCKETS, durationBucket, MIN_N } from './analyze';
import type { Platform, Topic } from '../types';
import { PLATFORMS, PLATFORM_LABEL } from '../platforms';
import { groupBy, median, sum } from '../lib/stats';

/** Topics made for current families rather than discovery. Judged separately. */
export const MEMBER_TOPICS = new Set(['promo', 'belts', 'bts']);

export interface MatrixCell {
  topic: string;
  platform: Platform;
  n: number;
  lift: number;
}

export interface Pillar {
  id: string;
  label: string;
  lift: number;
  n: number;
  clips: number;
  sharesPer1k: number;
  bestPlatform?: Platform;
  example?: EnrichedPost;
  /** Top few posts, used to vary the weekly plan. */
  examples: EnrichedPost[];
}

export interface Finding {
  id: string;
  headline: string;
  detail: string;
  action: string;
  tone: 'good' | 'bad' | 'neutral';
}

export interface FormulaPart {
  label: string;
  value: string;
  why: string;
}

export interface PlanDay {
  day: string;
  pillar: string;
  idea: string;
  format: string;
  when: string;
  lead: string;
}

export interface BigPicture {
  enough: boolean;
  summary: string[];
  formula: FormulaPart[];
  pillars: { more: Pillar[]; rethink: Pillar[]; members: Pillar[] };
  matrix: MatrixCell[];
  matrixTopics: { id: string; label: string }[];
  matrixPlatforms: Platform[];
  spreaders: { post: EnrichedPost; per1k: number; kind: 'shares' | 'saves' }[];
  hallOfFame: { post: EnrichedPost; reasons: string[] }[];
  findings: Finding[];
  plan: PlanDay[];
}

const CAPTION_BUCKETS = [
  { key: 'c1', label: 'under 100 characters', max: 100 },
  { key: 'c2', label: '100–250 characters', max: 250 },
  { key: 'c3', label: '250–600 characters', max: 600 },
  { key: 'c4', label: 'over 600 characters', max: Infinity },
];

const WINDOWS = [
  { label: 'late night (9pm–2am)', test: (h: number) => h >= 21 || h < 2 },
  { label: 'early morning (5–9am)', test: (h: number) => h >= 5 && h < 9 },
  { label: 'midday (11am–2pm)', test: (h: number) => h >= 11 && h < 14 },
  { label: 'after school (3–6pm)', test: (h: number) => h >= 15 && h < 18 },
  { label: 'evening (6–9pm)', test: (h: number) => h >= 18 && h < 21 },
];

const FORMAT_NAME: Record<string, string> = {
  short: 'short video (Reel / Short)',
  video: 'long video',
  image: 'photo',
  carousel: 'carousel',
  text: 'text post',
  other: 'other',
};

const FORMAT_PLURAL: Record<string, string> = {
  short: 'short videos (Reels / Shorts)',
  video: 'long videos',
  image: 'photos',
  carousel: 'carousels',
  text: 'text posts',
  other: 'other posts',
};

const lx = (x: number) => `${x >= 10 ? x.toFixed(0) : x.toFixed(1)}×`;
const pctOf = (x: number) => `${Math.round(Math.abs(x - 1) * 100)}%`;

export function bigPicture(a: Analysis, topics: Topic[]): BigPicture {
  const m = a.mature;
  const topicLabel = new Map(topics.map((t) => [t.id, t.label]));
  const empty: BigPicture = {
    enough: false,
    summary: [],
    formula: [],
    pillars: { more: [], rethink: [], members: [] },
    matrix: [],
    matrixTopics: [],
    matrixPlatforms: [],
    spreaders: [],
    hallOfFame: [],
    findings: [],
    plan: [],
  };
  if (m.length < 30) return empty;

  const platforms = PLATFORMS.filter((p) => m.some((x) => x.platform === p));

  /* ---- Pillars: topics ranked, with the platform where each works best ---- */
  const pillarOf = (t: Topic): Pillar | undefined => {
    const ps = m.filter((p) => p.topics.includes(t.id));
    if (ps.length < MIN_N * 2) return undefined;
    const views = sum(ps.map((p) => p.views));
    let bestPlatform: Platform | undefined;
    let bestLift = 0;
    for (const [pl, g] of groupBy(ps, (p) => p.platform)) {
      if (g.length < MIN_N) continue;
      const l = median(g.map((p) => p.lift));
      if (l > bestLift) {
        bestLift = l;
        bestPlatform = pl;
      }
    }
    return {
      id: t.id,
      label: t.label,
      lift: median(ps.map((p) => p.lift)),
      n: ps.length,
      clips: new Set(ps.map((p) => p.title.toLowerCase().slice(0, 40) + p.publishedAt.slice(0, 10))).size,
      sharesPer1k: views ? (sum(ps.map((p) => p.shares)) / views) * 1000 : 0,
      bestPlatform,
      examples: dedupeTitles([...ps].filter((p) => p.views >= 100).sort((x, y) => y.lift - x.lift)).slice(0, 4),
      example: undefined,
    };
  };
  const all = topics
    .map(pillarOf)
    .filter((p): p is Pillar => !!p)
    .map((p): Pillar => ({ ...p, example: p.examples[0] }))
    .sort((x, y) => y.lift - x.lift);
  const growth = all.filter((p) => !MEMBER_TOPICS.has(p.id));
  const more = growth.filter((p) => p.lift >= 1.1).slice(0, 4);
  const rethink = growth.filter((p) => p.lift < 0.85).slice(-3).reverse();
  const members = all.filter((p) => MEMBER_TOPICS.has(p.id) && p.lift < 1);

  /* ---- Topic × platform matrix ---- */
  const matrix: MatrixCell[] = [];
  for (const t of all) {
    for (const pl of platforms) {
      const g = m.filter((p) => p.platform === pl && p.topics.includes(t.id));
      matrix.push({ topic: t.id, platform: pl, n: g.length, lift: g.length ? median(g.map((p) => p.lift)) : 0 });
    }
  }

  /* ---- Formula parts ---- */
  const formula: FormulaPart[] = [];
  if (more[0]) {
    formula.push({
      label: 'Topic',
      value: more.slice(0, 2).map((p) => p.label).join(' + '),
      why: `${more[0].label} runs at ${lx(more[0].lift)} a typical post across ${more[0].n} posts.`,
    });
  }
  const fmts = [...groupBy(m, (p) => p.format)]
    .filter(([, g]) => g.length >= 15)
    .map(([k, g]) => ({ k, lift: median(g.map((p) => p.lift)), n: g.length }))
    .sort((x, y) => y.lift - x.lift);
  const photo = fmts.find((f) => f.k === 'image');
  const video = fmts.find((f) => f.k === 'short');
  // Carousels are mostly event albums; when short video also beats normal, lead with video and keep carousels for recaps.
  const mainFormat = fmts[0]?.k === 'carousel' && video && video.lift >= 1 ? video : fmts[0];
  if (mainFormat) {
    const carousel = fmts.find((f) => f.k === 'carousel');
    formula.push({
      label: 'Format',
      value: `${FORMAT_NAME[mainFormat.k] ?? mainFormat.k}${mainFormat.k === 'short' && carousel && carousel.lift > 1 ? ', carousels for event recaps' : ''}`,
      why: [mainFormat.k === 'short' && `Short video ${lx(mainFormat.lift)}`, carousel && carousel.lift > 1 && `carousels ${lx(carousel.lift)}`, photo && `photos ${lx(photo.lift)}`]
        .filter(Boolean)
        .join(', ') + ' (vs a typical post).',
    });
  }
  const durs = a.durations.filter((d) => d.n >= 15).sort((x, y) => y.medianLift - x.medianLift);
  if (durs[0]) formula.push({ label: 'Length', value: durs[0].label, why: `${lx(durs[0].medianLift)} typical across ${durs[0].n} videos.` });
  const caps = CAPTION_BUCKETS.map((b, i) => {
    const lo = i ? CAPTION_BUCKETS[i - 1].max : 0;
    const g = m.filter((p) => !p.topics.includes('promo') && p.caption.length >= lo && p.caption.length < b.max);
    return { ...b, n: g.length, lift: median(g.map((p) => p.lift)) };
  })
    .filter((c) => c.n >= 20)
    .sort((x, y) => y.lift - x.lift);
  if (caps[0]) formula.push({ label: 'Caption', value: caps[0].label, why: `${lx(caps[0].lift)} typical; the longest captions do worse.` });
  const wins = WINDOWS.map((w) => {
    const g = m.filter((p) => w.test(new Date(p.publishedAt).getHours()));
    return { ...w, n: g.length, lift: median(g.map((p) => p.lift)) };
  }).filter((w) => w.n >= 15);
  const bestWin = [...wins].sort((x, y) => y.lift - x.lift)[0];
  const worstWin = [...wins].sort((x, y) => x.lift - y.lift)[0];
  if (bestWin) formula.push({ label: 'When', value: bestWin.label, why: `${lx(bestWin.lift)} typical across ${bestWin.n} posts (your local time).` });
  const lead = a.platformWins.find((w) => w.appearances >= 10);
  if (lead) {
    formula.push({
      label: 'Lead platform',
      value: PLATFORM_LABEL[lead.platform],
      why: `Wins ${Math.round((lead.wins / lead.appearances) * 100)}% of clips posted to several platforms.`,
    });
  }
  const goodHook = a.hooks.find((h) => h.ratio >= 1.1 && h.withN >= 15);
  if (goodHook) formula.push({ label: 'Hook', value: goodHook.label, why: `${lx(goodHook.withLift)} with it vs ${lx(goodHook.withoutLift)} without.` });

  /* ---- What spreads (shares and saves bring new people) ---- */
  const spreadPool = m.filter((p) => p.views >= 200);
  const byShares = spreadPool.filter((p) => p.shares >= 3).map((p) => ({ post: p, per1k: (p.shares / p.views) * 1000, kind: 'shares' as const }));
  const bySaves = spreadPool.filter((p) => p.saves >= 3).map((p) => ({ post: p, per1k: (p.saves / p.views) * 1000, kind: 'saves' as const }));
  const seen = new Set<string>();
  const spreaders = [...byShares.sort((x, y) => y.per1k - x.per1k).slice(0, 4), ...bySaves.sort((x, y) => y.per1k - x.per1k).slice(0, 3)].filter((s) => {
    if (seen.has(s.post.id)) return false;
    seen.add(s.post.id);
    return true;
  });

  /* ---- Hall of fame with "why it worked" tags ---- */
  const hallOfFame = [...m]
    .filter((p) => p.views >= 300)
    .sort((x, y) => y.lift - x.lift)
    .slice(0, 8)
    .map((post) => {
      const reasons = [
        ...post.topics.filter((t) => more.some((p) => p.id === t)).map((t) => topicLabel.get(t) ?? t),
        post.format === 'short' ? 'short video' : FORMAT_NAME[post.format],
        durationBucket(post.durationSec)?.label,
        post.shares >= 10 ? `${post.shares} shares` : undefined,
        post.saves >= 10 ? `${post.saves} saves` : undefined,
      ].filter((r): r is string => !!r);
      return { post, reasons };
    });

  /* ---- Findings: the bigger patterns, each with what to do about it ---- */
  const findings: Finding[] = [];
  if (more[0]) {
    const strongest = matrix.filter((c) => c.topic === more[0].id && c.n >= MIN_N).sort((x, y) => y.lift - x.lift);
    findings.push({
      id: 'pillar',
      tone: 'good',
      headline: `${more[0].label} is your signature content`,
      detail: `It beats a typical post by ${pctOf(more[0].lift)}${strongest.length > 1 ? `, and it wins on ${strongest.filter((c) => c.lift >= 1.1).map((c) => PLATFORM_LABEL[c.platform]).join(', ') || 'most platforms'}` : ''}.${more[0].example ? ` Your best example: "${trimTitle(more[0].example.title)}" (${lx(more[0].example.lift)}).` : ''}`,
      action: `Make it the backbone of the calendar: about half of your clips. Ask Opus Clip to pull more moments on this topic from every class recording.`,
    });
  }
  if (photo && mainFormat && mainFormat.k !== 'image' && photo.lift < 0.85) {
    findings.push({
      id: 'video',
      tone: 'good',
      headline: 'Video beats photos everywhere',
      detail: `Photos get ${lx(photo.lift)} a typical post; ${FORMAT_PLURAL[mainFormat.k]} get ${lx(mainFormat.lift)}.`,
      action: 'Turn photo posts into 10–20 second clips (photo slideshow with music, or a quick clip from the same moment). Keep photos for carousels of events.',
    });
  }
  const parentSpread = spreaders.find((s) => /parent|kid|child/i.test(s.post.caption));
  if (parentSpread) {
    findings.push({
      id: 'parents',
      tone: 'good',
      headline: 'Parents share the "why" posts',
      detail: `"${trimTitle(parentSpread.post.title)}" earned ${parentSpread.per1k.toFixed(0)} ${parentSpread.kind} per 1,000 views, one of your most-passed-along posts. Shares put you in front of parents who don't follow you yet.`,
      action: 'Answer the big questions parents ask before enrolling (Why martial arts? Will it make my kid aggressive? What age?) in 20–30 second clips that end with "Send this to a parent who…".',
    });
  }
  const kids = all.find((p) => p.id === 'kids');
  if (kids && kids.lift < 0.85) {
    findings.push({
      id: 'kids-tips',
      tone: 'bad',
      headline: 'Generic parenting tips fall flat',
      detail: `Kids & parenting posts run at ${lx(kids.lift)} overall, even though parents are your customers. Small tips ("Parent tip: …") get scrolled past; big "why" answers get shared.`,
      action: 'Fewer quick tips, more stories and outcomes: a shy kid who found confidence, what a first class looks like, why discipline at home improved.',
    });
  }
  if (members.length) {
    findings.push({
      id: 'members',
      tone: 'neutral',
      headline: 'Event and promo posts are for members, not growth',
      detail: `${members.map((p) => `${p.label} (${lx(p.lift)})`).join(', ')} reach fewer people. That's normal: the algorithm doesn't push them to strangers.`,
      action: 'Keep posting them, but in Stories, the members group and email. Don\'t count them toward your daily growth posts.',
    });
  }
  if (bestWin && worstWin && bestWin !== worstWin && worstWin.lift < 0.8 && worstWin.n >= 15) {
    findings.push({
      id: 'timing',
      tone: 'bad',
      headline: `Posts in the ${worstWin.label.split(' (')[0]} underperform`,
      detail: `${worstWin.n} posts went out ${worstWin.label} and got ${lx(worstWin.lift)} typical. Posts ${bestWin.label} got ${lx(bestWin.lift)}.`,
      action: `Move those to ${bestWin.label}. Schedule them in Opus Clip so it happens without you.`,
    });
  }
  // Volume: did the busiest month dilute per-post reach?
  for (const pl of platforms) {
    const months = [...groupBy(m.filter((p) => p.platform === pl), (p) => p.publishedAt.slice(0, 7))].filter(([, g]) => g.length >= 8);
    if (months.length < 4) continue;
    const busiest = months.reduce((x, y) => (y[1].length > x[1].length ? y : x));
    const others = months.filter((x) => x !== busiest);
    const typicalCount = median(others.map(([, g]) => g.length));
    const busyViews = median(busiest[1].map((p) => p.views));
    const otherViews = median(others.map(([, g]) => median(g.map((p) => p.views))));
    if (busiest[1].length >= typicalCount * 1.8 && busyViews < otherViews * 0.75) {
      const month = new Date(`${busiest[0]}-15`).toLocaleDateString('en-US', { month: 'long' });
      findings.push({
        id: `volume-${pl}`,
        tone: 'neutral',
        headline: `More ${PLATFORM_LABEL[pl]} posts, less reach per post`,
        detail: `In ${month} you posted ${busiest[1].length} times on ${PLATFORM_LABEL[pl]} (usually about ${Math.round(typicalCount)}), and the typical post fell to ${Math.round(busyViews)} views from about ${Math.round(otherViews)}.`,
        action: `Total views still rose, so volume isn't bad. But past roughly ${Math.round(typicalCount * 1.5)} posts a month, put the extra clips on the platform with room to grow instead.`,
      });
      break;
    }
  }
  const reels = m.filter((p) => p.avgViewDurationSec !== undefined);
  if (reels.length >= 15) {
    const watch = median(reels.map((p) => p.avgViewDurationSec!));
    if (watch < 10) {
      findings.push({
        id: 'hook',
        tone: 'neutral',
        headline: `People decide in the first ${Math.max(2, Math.round(watch / 2))} seconds`,
        detail: `The average Instagram viewer watches ${watch.toFixed(1)} seconds of a Reel.`,
        action: 'Open on the most surprising moment (the throw, the fall, the reaction) with on-screen text stating the payoff. Never open on a logo or a slow setup.',
      });
    }
  }
  const emoji = a.hooks.find((h) => h.key === 'emoji');
  if (emoji && emoji.ratio < 0.85 && emoji.withN >= 15) {
    findings.push({
      id: 'emoji',
      tone: 'bad',
      headline: 'Emoji-led titles underperform',
      detail: `Posts whose first line uses emoji get ${lx(emoji.withLift)} vs ${lx(emoji.withoutLift)}.`,
      action: 'Lead with words that state the payoff ("Learn to fall safely"), and put emoji at the end, if at all.',
    });
  }
  if (a.cadence.weeks >= 8 && a.cadence.corr >= 0.4) {
    findings.push({
      id: 'cadence',
      tone: 'good',
      headline: 'Consistency is paying off',
      detail: `Across ${a.cadence.weeks} weeks, weeks with more posts brought more total views (correlation ${a.cadence.corr.toFixed(2)}).`,
      action: 'Protect the nightly Opus Clip schedule. Missing days costs more than an imperfect clip.',
    });
  }

  /* ---- A 7-day plan built from the formula ---- */
  const plan: PlanDay[] = [];
  const order = [more[0], more[1], more[0], more[2] ?? more[0], more[1] ?? more[0], more[0], more[3] ?? more[1] ?? more[0]].filter(
    (p): p is Pillar => !!p,
  );
  const fmtLabel = !mainFormat || mainFormat.k === 'short' ? 'Reel/Short' : FORMAT_NAME[mainFormat.k];
  const len = durs[0]?.label ?? DURATION_BUCKETS[1].label;
  const when = bestWin?.label ?? 'your best window';
  const angles = ['A new angle on', 'Part 2 of', 'The mistake behind', 'Teach the one key step from', 'A student story like', 'Answer the question behind', 'Behind the drill in'];
  const used = new Map<string, number>();
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d, i) => {
    const p = order[i % order.length];
    if (!p) return;
    // Rotate through each pillar's best posts so the week doesn't repeat one example.
    const k = used.get(p.id) ?? 0;
    used.set(p.id, k + 1);
    const pick = p.examples.length ? p.examples[k % p.examples.length] : undefined;
    const ex = pick ? `"${trimTitle(pick.title, 60)}"` : p.label.toLowerCase();
    plan.push({
      day: d,
      pillar: p.label,
      idea: i === 3 && parentSpread ? `Answer a big parent question, in the style of "${trimTitle(parentSpread.post.title, 60)}"` : `${angles[i % angles.length]} ${ex}`,
      format: `${fmtLabel}, ${len}`,
      when,
      lead: lead ? PLATFORM_LABEL[lead.platform] : p.bestPlatform ? PLATFORM_LABEL[p.bestPlatform] : 'your best platform',
    });
  });

  /* ---- Five-sentence summary ---- */
  const summary: string[] = [];
  if (more[0]) summary.push(`Your audience comes for ${more.slice(0, 2).map((p) => p.label.toLowerCase()).join(' and ')}.`);
  if (mainFormat && photo && mainFormat.k !== 'image') summary.push(`They want ${FORMAT_PLURAL[mainFormat.k]}, not photos (${lx(mainFormat.lift)} vs ${lx(photo.lift)}).`);
  if (lead) summary.push(`${PLATFORM_LABEL[lead.platform]} gets the most out of each clip, so it should get every clip first.`);
  if (parentSpread) summary.push('Posts that answer why parents should choose martial arts are your most shared, and shares are how new families find you.');
  if (members.length) summary.push('Promos and event recaps are for current families; they reach fewer new people, and that is fine.');

  return {
    enough: true,
    summary,
    formula,
    pillars: { more, rethink, members },
    matrix,
    matrixTopics: all.map((p) => ({ id: p.id, label: p.label })),
    matrixPlatforms: platforms,
    spreaders,
    hallOfFame,
    findings,
    plan,
  };
}

/** Keep one post per near-identical caption (the same clip cross-posted). */
function dedupeTitles(ps: EnrichedPost[]): EnrichedPost[] {
  const seen = new Set<string>();
  return ps.filter((p) => {
    const k = trimTitle(p.title, 30).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function trimTitle(t: string, max = 70): string {
  const s = t.replace(/\s*#\S+/g, '').trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
