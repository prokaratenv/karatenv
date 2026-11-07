import type { Post, Topic } from '../types';

/**
 * Starter topic library tuned for a martial-arts school + founder brand.
 * Every topic is editable in Settings; matching is whole-word / whole-phrase on title + caption + hashtags.
 */
export const DEFAULT_TOPICS: Topic[] = [
  { id: 'kids', label: 'Kids & parenting', keywords: ['kid', 'kids', 'child', 'children', 'parent', 'parents', 'parenting', 'son', 'daughter', 'mom', 'dad', 'family', 'toddler', 'little ninjas', 'youth'] },
  { id: 'selfdefense', label: 'Self-defense', keywords: ['self defense', 'self-defense', 'selfdefense', 'defend', 'attacker', 'escape', 'grab', 'choke', 'street', 'safety', 'protect', 'stranger'] },
  { id: 'bullying', label: 'Bullying & confidence', keywords: ['bully', 'bullying', 'bullied', 'confidence', 'confident', 'shy', 'stand up'] },
  { id: 'discipline', label: 'Discipline & character', keywords: ['discipline', 'respect', 'focus', 'character', 'integrity', 'habits', 'responsibility', 'values', 'manners', 'yes sir', 'yes ma\'am'] },
  { id: 'mindset', label: 'Mindset & motivation', keywords: ['mindset', 'motivation', 'motivational', 'never give up', 'goals', 'success', 'mental', 'believe', 'growth', 'fear', 'courage', 'resilience', 'mindset monday', 'grind'] },
  { id: 'technique', label: 'Technique & drills', keywords: ['technique', 'drill', 'drills', 'kick', 'kicks', 'punch', 'block', 'strike', 'kata', 'form', 'stance', 'footwork', 'combo', 'roundhouse', 'side kick', 'jab', 'takedown', 'sweep', 'tutorial', 'how to'] },
  { id: 'belts', label: 'Belt tests & milestones', keywords: ['belt', 'black belt', 'belt test', 'testing', 'graduation', 'promotion', 'stripe', 'milestone', 'ceremony'] },
  { id: 'sparring', label: 'Sparring & competition', keywords: ['sparring', 'spar', 'tournament', 'competition', 'fight', 'match', 'compete', 'medal', 'champion'] },
  { id: 'fitness', label: 'Fitness & health', keywords: ['fitness', 'workout', 'cardio', 'flexibility', 'stretch', 'stretching', 'health', 'weight loss', 'conditioning', 'strength', 'energy', 'calories'] },
  { id: 'adults', label: 'Adult training & lifestyle', keywords: ['adult', 'adults', 'stress', 'lifestyle', 'busy', 'over 40', 'women', 'moms', 'beginner', 'never too late'] },
  { id: 'stories', label: 'Student stories & results', keywords: ['student', 'students', 'transformation', 'journey', 'story', 'testimonial', 'proud', 'before and after', 'results', 'first class'] },
  { id: 'bts', label: 'Behind the scenes & community', keywords: ['studio', 'dojo', 'behind the scenes', 'bts', 'class', 'instructor', 'sensei', 'coach', 'team', 'community', 'event', 'day in the life'] },
  { id: 'business', label: 'Business & leadership', keywords: ['business', 'entrepreneur', 'entrepreneurship', 'leadership', 'leader', 'owner', 'marketing', 'money', 'sales', 'ceo', 'hiring', 'school owner'] },
  { id: 'promo', label: 'Promos & announcements', keywords: ['sale', 'promo', 'special', 'offer', 'discount', 'register', 'registration', 'sign up', 'enroll', 'open house', 'spots', 'limited', 'deadline', 'graduation weekend', 'cookies', 'winter sale', 'summer camp', 'birthday party', 'private lessons', 'free class', 'free trial', 'team intro'] },
  { id: 'humor', label: 'Humor & trends', keywords: ['funny', 'lol', 'trend', 'challenge', 'prank', 'fail', 'wait for it', 'pov', 'when your', 'meme'] },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function compileTopics(topics: Topic[]) {
  return topics.map((t) => ({
    ...t,
    re: new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${t.keywords.map((k) => escape(k.toLowerCase().replace(/^#/, ''))).join('|')})(?=$|[^\\p{L}\\p{N}])`, 'iu'),
  }));
}

export type CompiledTopics = ReturnType<typeof compileTopics>;

export function postText(p: Post): string {
  return `${p.title}\n${p.caption}\n${p.hashtags.map((h) => h.slice(1)).join(' ')}`.toLowerCase();
}

export function tagPost(p: Post, compiled: CompiledTopics): string[] {
  const text = postText(p);
  return compiled.filter((t) => t.keywords.length && t.re.test(text)).map((t) => t.id);
}

const STOP = new Set(
  `a an the and or but if then so of to in on at by for with from up down out over under again about into than too very can will just
  is are was were be been being have has had do does did not no nor only own same such that this these those there here when where why how
  what which who whom i me my we our you your he him his she her it its they them their am im youre dont didnt cant wont its thats
  all any both each few more most other some as also get got go going like know make one two new now day today time way want need
  shorts reels fyp foryou foryoupage viral explore trending video watch follow link bio tag comment share subscribe`.split(/\s+/),
);

/** Unigrams + bigrams for keyword discovery (beyond the fixed topics). */
export function terms(p: Post): string[] {
  const out = new Set<string>();
  const keep = (w: string) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w);
  // Split into phrases first so bigrams never cross a sentence, line or title/caption boundary.
  const chunks = `${p.title}\n${p.caption}`
    .toLowerCase()
    .replace(/#[\p{L}\p{N}_]+/gu, '\n')
    .replace(/https?:\/\/\S+/g, '\n')
    .replace(/['’]/g, '')
    .split(/[\n.!?:;,|()"“”–—-]+/);
  for (const chunk of chunks) {
    const raw = chunk.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    for (const w of raw) if (keep(w)) out.add(w);
    for (let i = 0; i + 1 < raw.length; i++) if (keep(raw[i]) && keep(raw[i + 1])) out.add(`${raw[i]} ${raw[i + 1]}`);
  }
  return [...out];
}
