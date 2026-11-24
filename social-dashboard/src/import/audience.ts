/** Henderson audience snapshots (public/data/audience.json), written weekly by sync/audience.ts. */

/** Cities that make up the Las Vegas valley in Meta's city names (Instagram: "Henderson, Nevada"; Facebook: "Henderson, NV"). */
const VALLEY = ['henderson', 'las vegas', 'enterprise', 'spring valley', 'whitney', 'sunrise manor', 'north las vegas', 'boulder city', 'paradise', 'summerlin south', 'winchester'];

export type Counts = Record<string, number>;

export interface CitySummary {
  /** People in Henderson. */
  henderson: number;
  /** People in the Las Vegas valley (Henderson included). */
  valley: number;
  /** People whose city Meta reports. */
  known: number;
  /** Top cities, largest first. */
  top: { city: string; count: number }[];
}

export interface AudienceSnapshot {
  date: string;
  ig?: {
    followers?: { cities?: CitySummary; age?: Counts; gender?: Counts };
    reach?: { cities?: CitySummary; age?: Counts; gender?: Counts; total?: number };
  };
  fb?: { followers?: { cities?: CitySummary } };
}

const cityKey = (name: string) => name.toLowerCase().split(',')[0].trim();
const isNevada = (name: string) => /,\s*(nevada|nv)\b/i.test(name);

export function summarizeCities(counts: Counts): CitySummary {
  let henderson = 0, valley = 0, known = 0;
  for (const [name, n] of Object.entries(counts)) {
    known += n;
    if (!isNevada(name)) continue;
    const k = cityKey(name);
    if (k === 'henderson') henderson += n;
    if (VALLEY.includes(k)) valley += n;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([city, count]) => ({ city, count }));
  return { henderson, valley, known, top };
}

/** One snapshot per date (a re-run replaces that day's), oldest first, two years kept. */
export function mergeSnapshot(existing: AudienceSnapshot[], snap: AudienceSnapshot): AudienceSnapshot[] {
  return [...existing.filter((s) => s.date !== snap.date), snap].sort((a, b) => a.date.localeCompare(b.date)).slice(-104);
}

export interface Goal {
  id: string;
  label: string;
  now?: number;
  /** First snapshot's value, for "since <date>". */
  start?: number;
  target: number;
  /** Shown as a percentage rather than a count. */
  share?: boolean;
  how: string;
}

const hReach = (s?: AudienceSnapshot) => (s?.ig?.reach?.cities && s.ig.reach.total ? s.ig.reach.cities.henderson / s.ig.reach.total : undefined);
const women = (s?: AudienceSnapshot) => (s?.ig?.reach?.gender?.F !== undefined && s.ig.reach.total ? s.ig.reach.gender.F / s.ig.reach.total : undefined);

/** The four Henderson targets from the Local Audience Plan (set 2026-11-24). */
export function hendersonGoals(snaps: AudienceSnapshot[]): Goal[] {
  const first = snaps[0], last = snaps[snaps.length - 1];
  return [
    { id: 'ig', label: 'Instagram followers in Henderson', now: last?.ig?.followers?.cities?.henderson, start: first?.ig?.followers?.cities?.henderson, target: 450, how: 'Parent Minutes, local tags and a small boost to parents within 5 miles.' },
    { id: 'fb', label: 'Facebook followers in Henderson', now: last?.fb?.followers?.cities?.henderson, start: first?.fb?.followers?.cities?.henderson, target: 600, how: 'Share each Parent Minute to Facebook and to Henderson parent groups you belong to.' },
    { id: 'reach', label: 'Instagram reach that is in Henderson', now: hReach(last), start: hReach(first), target: 0.3, share: true, how: 'Tag Henderson, the school, and local places; film parents and kids, not only adults.' },
    { id: 'women', label: 'Instagram reach that is women', now: women(last), start: women(first), target: 0.4, share: true, how: 'Moms 25 to 44 are your cheapest leads. Speak to parents in the first two seconds.' },
  ];
}
