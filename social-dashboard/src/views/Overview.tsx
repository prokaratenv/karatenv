import type { Analysis, Totals } from '../analysis/analyze';
import type { Recommendation } from '../analysis/recommendations';
import { LineChart, StatTile, Empty, InlineBar } from '../components/charts';
import { PLATFORM_LABEL, platformColor } from '../platforms';
import { compact, full, lift, pct, shortDate } from '../lib/format';
import { RecCard } from './Suggestions';
import { PostLink } from './Content';

const delta = (cur: number, prev?: number) => (prev ? cur / prev - 1 : undefined);

export function Overview({ a, recs, onSeeAll }: { a: Analysis; recs: Recommendation[]; onSeeAll: () => void }) {
  if (!a.posts.length) return <Empty>No posts in this range. Try a wider date range or import data.</Empty>;
  const t = a.totals;
  const p: Totals | undefined = a.prevTotals;
  const platforms = a.byPlatform.map((x) => x.platform);
  // The current week is still in progress; plotting it would look like a crash.
  const weeks = a.weekly.filter((w) => Date.parse(a.asOf) - new Date(`${w.week}T00:00:00`).getTime() >= 7 * 86_400_000);
  const series = platforms.map((pl) => ({
    key: pl,
    label: PLATFORM_LABEL[pl],
    color: platformColor(pl),
    values: weeks.map((w) => w.views[pl]),
  }));
  const maxAcc = Math.max(...a.byAccount.map((x) => x.views));
  const top = [...a.posts].sort((x, y) => y.views - x.views).slice(0, 8);

  return (
    <>
      <div className="tiles">
        <div className="tile hero">
          <div className="tile-label">Views</div>
          <div className="tile-value">{compact(t.views)}</div>
          {p && (
            <div className={`tile-delta ${t.views >= p.views ? 'up' : 'down'}`}>
              <span aria-hidden>{t.views >= p.views ? '▲' : '▼'}</span> {Math.abs((t.views / p.views - 1) * 100).toFixed(0)}%{' '}
              <span className="muted">vs previous period ({compact(p.views)})</span>
            </div>
          )}
        </div>
        <StatTile label="Posts" value={full(t.posts)} delta={delta(t.posts, p?.posts)} />
        <StatTile label="Engagement rate" value={pct(t.engRate)} delta={p ? t.engRate / p.engRate - 1 : undefined} hint="likes + comments + shares + saves ÷ views" />
        <StatTile label="Shares" value={compact(t.shares)} delta={delta(t.shares, p?.shares)} />
        <StatTile label="Followers gained" value={compact(t.followersGained)} delta={delta(t.followersGained, p?.followersGained)} hint="where the export includes it" />
      </div>

      <div className="grid split">
        <section className="card">
          <div className="card-head">
            <h2>Weekly views by platform</h2>
            <p>Complete weeks only · hover for numbers</p>
          </div>
          {weeks.length > 1 ? <LineChart x={weeks.map((w) => w.week)} series={series} /> : <Empty>Need at least two complete weeks of data.</Empty>}
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Top suggestions</h2>
            <button className="btn" onClick={onSeeAll}>
              See all {recs.length}
            </button>
          </div>
          <div className="recs">
            {recs.slice(0, 3).map((r) => (
              <RecCard key={r.id} r={r} compact />
            ))}
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <h2>Accounts</h2>
          <p>Median views = what a typical post on that account gets; the baseline for "lift"</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th className="num">Posts</th>
                <th className="num">Posts / wk</th>
                <th className="num">Views</th>
                <th className="num">Median / post</th>
                <th className="num">Engagement</th>
                <th className="num">Shares / 1K</th>
                <th className="num">Comments / 1K</th>
                <th className="num">Followers +</th>
              </tr>
            </thead>
            <tbody>
              {a.byAccount.map((x) => (
                <tr key={x.account.id}>
                  <td>
                    <span className="dot" style={{ background: platformColor(x.account.platform), marginRight: 8 }} />
                    {PLATFORM_LABEL[x.account.platform]} · {x.account.name} <span className="muted">({x.account.kind})</span>
                  </td>
                  <td className="num">{x.posts}</td>
                  <td className="num">{x.postsPerWeek.toFixed(1)}</td>
                  <td className="num">
                    {compact(x.views)}
                    <InlineBar value={x.views} max={maxAcc} color={platformColor(x.account.platform)} />
                  </td>
                  <td className="num">{compact(x.medianViews)}</td>
                  <td className="num">{pct(x.engRate)}</td>
                  <td className="num">{x.sharesPer1k.toFixed(1)}</td>
                  <td className="num">{x.commentsPer1k.toFixed(1)}</td>
                  <td className="num">{x.followersGained ? compact(x.followersGained) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <h2>Most-viewed posts</h2>
          <p>Lift = views ÷ that account's typical post</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Account</th>
                <th>Date</th>
                <th className="num">Views</th>
                <th className="num">Lift</th>
                <th className="num">Engagement</th>
                <th className="num">Shares</th>
              </tr>
            </thead>
            <tbody>
              {top.map((x) => (
                <tr key={x.id}>
                  <td className="title-cell">
                    <PostLink p={x} />
                  </td>
                  <td>
                    <span className="dot" style={{ background: platformColor(x.platform), marginRight: 6 }} />
                    {PLATFORM_LABEL[x.platform]} · {x.account?.name}
                  </td>
                  <td>{shortDate(x.publishedAt)}</td>
                  <td className="num">{compact(x.views)}</td>
                  <td className="num">{x.mature ? lift(x.lift) : <span className="muted">new</span>}</td>
                  <td className="num">{pct(x.engRate)}</td>
                  <td className="num">{compact(x.shares)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
