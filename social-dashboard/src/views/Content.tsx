import { useMemo, useState } from 'react';
import type { Analysis, EnrichedPost } from '../analysis/analyze';
import type { Topic } from '../types';
import { PLATFORM_LABEL, platformColor } from '../platforms';
import { compact, duration, pct, shortDate } from '../lib/format';
import { Empty } from '../components/charts';
import { LiftPill } from '../components/LiftPill';

export function PostLink({ p }: { p: EnrichedPost }) {
  return p.url ? (
    <a className="t" href={p.url} target="_blank" rel="noreferrer noopener" title={p.title}>
      {p.title}
    </a>
  ) : (
    <span className="t" title={p.title}>
      {p.title}
    </span>
  );
}

type SortKey = 'publishedAt' | 'views' | 'lift' | 'engRate' | 'shares' | 'comments' | 'durationSec';

const COLS: { key: SortKey; label: string }[] = [
  { key: 'publishedAt', label: 'Date' },
  { key: 'views', label: 'Views' },
  { key: 'lift', label: 'Lift' },
  { key: 'engRate', label: 'Engagement' },
  { key: 'shares', label: 'Shares' },
  { key: 'comments', label: 'Comments' },
  { key: 'durationSec', label: 'Length' },
];

const PAGE = 100;

export function Content({ a, topics }: { a: Analysis; topics: Topic[] }) {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'lift', dir: -1 });
  const [limit, setLimit] = useState(PAGE);
  const topicLabel = new Map(topics.map((t) => [t.id, t.label]));

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const val = (p: EnrichedPost) => (sort.key === 'publishedAt' ? Date.parse(p.publishedAt) : (p[sort.key] as number | undefined) ?? -1);
    return a.posts
      .filter((p) => (!topic || p.topics.includes(topic)) && (!needle || `${p.title} ${p.caption}`.toLowerCase().includes(needle)))
      .sort((x, y) => (val(x) - val(y)) * sort.dir);
  }, [a.posts, q, topic, sort]);

  const setSortKey = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : -1 }));
  const arrow = (k: SortKey) => (sort.key === k ? (sort.dir === -1 ? ' ↓' : ' ↑') : '');

  return (
    <section className="card">
      <div className="card-head">
        <h2>All posts ({rows.length})</h2>
        <div className="row">
          <input type="search" placeholder="Search titles and captions" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search posts" />
          <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Topic">
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {rows.length === 0 ? (
        <Empty>No posts match.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Account</th>
                {COLS.map((c) => (
                  <th
                    key={c.key}
                    className={`sortable ${c.key === 'publishedAt' ? '' : 'num'}`}
                    onClick={() => setSortKey(c.key)}
                    aria-sort={sort.key === c.key ? (sort.dir === -1 ? 'descending' : 'ascending') : 'none'}
                  >
                    {c.label}
                    {arrow(c.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, limit).map((p) => (
                <tr key={p.id}>
                  <td className="title-cell">
                    <PostLink p={p} />
                    <div>
                      {p.topics.map((t) => (
                        <span key={t} className="pill">
                          {topicLabel.get(t) ?? t}
                        </span>
                      ))}
                      {p.viaOpus && <span className="pill">Opus Clip</span>}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="dot" style={{ background: platformColor(p.platform), marginRight: 6 }} />
                    {PLATFORM_LABEL[p.platform]}
                    <div className="muted">{p.account?.name}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{shortDate(p.publishedAt)}</td>
                  <td className="num">{compact(p.views)}</td>
                  <td className="num">{p.mature ? <LiftPill value={p.lift} /> : <span className="muted">new</span>}</td>
                  <td className="num">{pct(p.engRate)}</td>
                  <td className="num">{compact(p.shares)}</td>
                  <td className="num">{compact(p.comments)}</td>
                  <td className="num">{duration(p.durationSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length > limit && (
        <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
          <button className="btn" onClick={() => setLimit((l) => l + PAGE)}>
            Show more ({rows.length - limit} left)
          </button>
        </div>
      )}
    </section>
  );
}
