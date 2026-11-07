/**
 * Builds the weekly summary email from the synced YouTube data.
 * Writes sync/out/weekly-report.json: { subject, html, text }.
 *
 *   npx tsx sync/weekly-report.ts [--dashboard <url>]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Post } from '../src/types';
import { analyze } from '../src/analysis/analyze';
import { recommend, type Recommendation } from '../src/analysis/recommendations';
import { DEFAULT_ACCOUNTS } from '../src/platforms';
import { DEFAULT_TOPICS } from '../src/analysis/topics';
import { compact, lift, pct } from '../src/lib/format';
import type { ChannelSnapshot } from './youtube';
import type { FollowerSnapshot } from './meta';
import { PLATFORM_LABEL } from '../src/platforms';

const here = dirname(fileURLToPath(import.meta.url));
const DAY = 86_400_000;

export interface WeeklyReport {
  subject: string;
  html: string;
  text: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Change over the ~7 days before `asOf`, from daily channel snapshots. */
function channelDelta(history: ChannelSnapshot[], asOf: number) {
  if (history.length < 2) return undefined;
  const latest = history[history.length - 1];
  const target = asOf - 7 * DAY;
  // Snapshot closest to a week ago (but at least 5 days back).
  const past = [...history]
    .filter((h) => Date.parse(h.date) <= asOf - 5 * DAY)
    .sort((a, b) => Math.abs(Date.parse(a.date) - target) - Math.abs(Date.parse(b.date) - target))[0];
  if (!past) return undefined;
  return { views: latest.views - past.views, subscribers: latest.subscribers - past.subscribers, since: past.date, latest };
}

/** Latest follower count per account, with the change since ~a week ago when we have it. */
export function followerChanges(snaps: FollowerSnapshot[], asOf: number) {
  const byAcc = new Map<string, FollowerSnapshot[]>();
  for (const s of snaps) byAcc.set(s.accountId, [...(byAcc.get(s.accountId) ?? []), s]);
  return [...byAcc.values()].map((list) => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const past = sorted.filter((h) => Date.parse(h.date) <= asOf - 5 * DAY).pop();
    return { ...latest, change: past ? latest.followers - past.followers : undefined };
  });
}

export function buildWeeklyReport(
  posts: Post[],
  history: ChannelSnapshot[],
  dashboardUrl: string,
  now = new Date(),
  followerSnaps: FollowerSnapshot[] = [],
): WeeklyReport {
  const asOf = now.getTime();
  const weekAgo = asOf - 7 * DAY;
  const all = { rangeDays: 0, platforms: [], accountIds: [] };
  const a90 = analyze(posts, DEFAULT_ACCOUNTS, { ...all, rangeDays: 90 }, DEFAULT_TOPICS);
  const recs: Recommendation[] = recommend(a90).slice(0, 3);
  const enriched = analyze(posts, DEFAULT_ACCOUNTS, all, DEFAULT_TOPICS).posts;

  const newThisWeek = enriched.filter((p) => Date.parse(p.publishedAt) > weekAgo).sort((x, y) => y.views - x.views);
  const prevWeek = enriched.filter((p) => {
    const t = Date.parse(p.publishedAt);
    return t > weekAgo - 7 * DAY && t <= weekAgo;
  });
  const last30 = enriched.filter((p) => p.mature && Date.parse(p.publishedAt) > asOf - 30 * DAY).sort((x, y) => y.lift - x.lift);
  const delta = channelDelta(history, asOf);
  const latest = history[history.length - 1];
  const followers = followerChanges(followerSnaps, asOf);
  const platforms = [...new Set(posts.map((p) => p.platform))];
  const label = (p: Post) => PLATFORM_LABEL[p.platform];
  const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });

  const headline = delta
    ? `${delta.views >= 0 ? '+' : ''}${compact(delta.views)} YouTube views, ${delta.subscribers >= 0 ? '+' : ''}${delta.subscribers} subscribers`
    : `${newThisWeek.length} new posts`;
  const subject = `Weekly social report (${dateLabel}): ${headline}`;

  // ---- plain text ----
  const T: string[] = [];
  T.push(`Weekly social report, week ending ${dateLabel}`, '');
  if (delta) {
    T.push(`YouTube channel: ${delta.views >= 0 ? '+' : ''}${delta.views.toLocaleString('en-US')} views and ${delta.subscribers >= 0 ? '+' : ''}${delta.subscribers} subscribers since ${delta.since}.`);
    T.push(`Now at ${delta.latest.subscribers.toLocaleString('en-US')} subscribers and ${delta.latest.views.toLocaleString('en-US')} lifetime views.`);
  } else if (latest) {
    T.push(`YouTube channel: ${latest.subscribers.toLocaleString('en-US')} subscribers, ${latest.views.toLocaleString('en-US')} lifetime views. Week-over-week change starts next week.`);
  }
  for (const f of followers) {
    T.push(`${PLATFORM_LABEL[f.platform]} ${f.name}: ${f.followers.toLocaleString('en-US')} followers${f.change !== undefined ? ` (${f.change >= 0 ? '+' : ''}${f.change} this week)` : ''}`);
  }
  T.push('', `New posts this week: ${newThisWeek.length} (previous week: ${prevWeek.length})`);
  for (const p of newThisWeek.slice(0, 7)) T.push(`- [${label(p)}] ${p.title}: ${compact(p.views)} views, ${p.likes} likes, ${p.comments} comments`);
  T.push('', 'Best performers, last 30 days (vs a typical post on the same account):');
  for (const p of last30.slice(0, 5)) T.push(`- [${label(p)}] ${p.title}: ${lift(p.lift)}, ${compact(p.views)} views`);
  T.push('', 'Top suggestions:');
  recs.forEach((r, i) => T.push(`${i + 1}. ${r.title}`, `   ${r.why}`, `   Do this: ${r.action}`));
  T.push('', `Open the dashboard: ${dashboardUrl}`);
  T.push(`Synced automatically: ${platforms.map((x) => PLATFORM_LABEL[x]).join(', ')}. Import the rest (personal Facebook, TikTok) on the Add data tab.`);

  // ---- HTML (inline styles for email clients) ----
  const ink = '#1a1a19';
  const muted = '#6f6d68';
  const accent = '#2a78d6';
  const row = (cells: string[], head = false) =>
    `<tr>${cells
      .map(
        (c, i) =>
          `<${head ? 'th' : 'td'} style="padding:6px 8px;border-bottom:1px solid #e1e0d9;text-align:${i === 0 ? 'left' : 'right'};font-size:13px;${head ? `color:${muted};font-weight:600;` : ''}">${c}</${head ? 'th' : 'td'}>`,
      )
      .join('')}</tr>`;
  const stat = (label: string, value: string) =>
    `<td style="padding:12px 16px;border:1px solid #e1e0d9;border-radius:8px;"><div style="font-size:12px;color:${muted};">${label}</div><div style="font-size:24px;font-weight:600;color:${ink};">${value}</div></td>`;

  const H: string[] = [];
  H.push(`<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:${ink};max-width:640px;margin:0 auto;">`);
  H.push(`<h1 style="font-size:20px;margin:0 0 4px;">Weekly social report</h1><div style="color:${muted};font-size:13px;margin-bottom:16px;">Engage Lifestyle Martial Arts · week ending ${dateLabel}</div>`);
  H.push('<table role="presentation" cellspacing="8" style="border-collapse:separate;margin:0 -8px 8px;"><tr>');
  if (delta) {
    H.push(stat('YouTube views this week', `${delta.views >= 0 ? '+' : ''}${compact(delta.views)}`));
    H.push(stat('Subscribers', `${delta.subscribers >= 0 ? '+' : ''}${delta.subscribers}`));
  } else if (latest) {
    H.push(stat('Subscribers', compact(latest.subscribers)));
  }
  H.push(stat('New posts', `${newThisWeek.length}`));
  H.push('</tr></table>');
  if (followers.length) {
    H.push(`<h2 style="font-size:16px;margin:20px 0 8px;">Followers</h2><table style="border-collapse:collapse;width:100%;">`);
    H.push(row(['Account', 'Followers', 'This week'], true));
    for (const f of followers)
      H.push(row([`${PLATFORM_LABEL[f.platform]} · ${esc(f.name)}`, f.followers.toLocaleString('en-US'), f.change === undefined ? 'starts next week' : `${f.change >= 0 ? '+' : ''}${f.change}`]));
    H.push('</table>');
  }
  if (!delta && latest) H.push(`<p style="color:${muted};font-size:13px;">Week-over-week change starts with next week's report.</p>`);

  H.push(`<h2 style="font-size:16px;margin:20px 0 8px;">Top suggestions</h2>`);
  if (recs.length) {
    recs.forEach((r) =>
      H.push(
        `<div style="border-left:3px solid ${accent};padding:4px 0 4px 12px;margin-bottom:12px;"><div style="font-weight:600;">${esc(r.title)}</div><div style="color:${muted};font-size:13px;">${esc(r.why)}</div><div style="font-size:13px;margin-top:4px;"><strong>Do this:</strong> ${esc(r.action)}</div></div>`,
      ),
    );
  } else {
    H.push(`<p style="font-size:13px;color:${muted};">Not enough data for confident suggestions yet.</p>`);
  }

  if (newThisWeek.length) {
    H.push(`<h2 style="font-size:16px;margin:20px 0 8px;">New this week</h2><table style="border-collapse:collapse;width:100%;">`);
    H.push(row(['Post', 'Views', 'Likes', 'Comments'], true));
    for (const p of newThisWeek.slice(0, 10))
      H.push(row([`<span style="color:${muted};">${label(p)}</span> <a href="${esc(p.url ?? '#')}" style="color:${ink};">${esc(p.title)}</a>`, compact(p.views), compact(p.likes), compact(p.comments)]));
    H.push('</table>');
  }
  if (last30.length) {
    H.push(`<h2 style="font-size:16px;margin:20px 0 8px;">Best performers, last 30 days</h2><table style="border-collapse:collapse;width:100%;">`);
    H.push(row(['Post', 'vs typical', 'Views', 'Engagement'], true));
    for (const p of last30.slice(0, 5))
      H.push(row([`<span style="color:${muted};">${label(p)}</span> <a href="${esc(p.url ?? '#')}" style="color:${ink};">${esc(p.title)}</a>`, lift(p.lift), compact(p.views), pct(p.engRate)]));
    H.push('</table>');
  }
  H.push(
    `<p style="margin:24px 0 8px;"><a href="${esc(dashboardUrl)}" style="background:${accent};color:#fff;text-decoration:none;padding:9px 14px;border-radius:8px;font-size:14px;">Open the dashboard</a></p>`,
  );
  H.push(
    `<p style="color:${muted};font-size:12px;">Synced automatically every Monday: ${platforms.map((x) => PLATFORM_LABEL[x]).join(', ')}. For anything else (personal Facebook, TikTok), import exports on the dashboard's Add data tab. "vs typical" compares a post's views with the median post on the same account.</p></div>`,
  );

  return { subject, html: H.join('\n'), text: T.join('\n') };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const i = process.argv.indexOf('--dashboard');
  const dashboardUrl = i > 0 ? process.argv[i + 1] : 'https://claude.ai/artifact/CxTSLnZ9V1cXZEebotPqos';
  const dataDir = resolve(here, '../public/data');
  const load = <T,>(f: string, fallback: T): T => (existsSync(resolve(dataDir, f)) ? JSON.parse(readFileSync(resolve(dataDir, f), 'utf8')) : fallback);
  const posts: Post[] = [...load<Post[]>('youtube.json', []), ...load<Post[]>('meta.json', [])];
  const followerSnaps = load<FollowerSnapshot[]>('meta-accounts.json', []);
  const history: ChannelSnapshot[] = existsSync(resolve(dataDir, 'youtube-channel.json'))
    ? JSON.parse(readFileSync(resolve(dataDir, 'youtube-channel.json'), 'utf8'))
    : [];
  if (!posts.length) {
    console.error('No synced data. Run npm run sync:youtube (and sync:meta) first.');
    process.exit(1);
  }
  const report = buildWeeklyReport(posts, history, dashboardUrl, new Date(), followerSnaps);
  mkdirSync(resolve(here, 'out'), { recursive: true });
  writeFileSync(resolve(here, 'out/weekly-report.json'), JSON.stringify(report, null, 2));
  console.log(report.subject);
}
