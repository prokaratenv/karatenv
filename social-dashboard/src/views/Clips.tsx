import { useState } from 'react';
import type { Analysis } from '../analysis/analyze';
import { PLATFORM_LABEL, platformColor } from '../platforms';
import { compact, lift, pct, shortDate } from '../lib/format';
import { BarList, Empty } from '../components/charts';
import { TipRow } from '../components/Tooltip';

export function Clips({ a, backlog = [] }: { a: Analysis; backlog?: { clipId: string; score: number; title: string; durationSec?: number }[] }) {
  const [limit, setLimit] = useState(30);
  if (!a.clusters.length) {
    return <Empty>No clips found on more than one account yet. When Opus Clip posts the same clip to several platforms, it shows up here.</Empty>;
  }
  return (
    <>
      {backlog.length > 0 && (
        <section className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <h2>Ready to post: Opus Clip's best unposted clips</h2>
            <p>Clips Opus made and scored highly that never went out. Open them in Opus Clip to schedule.</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Clip</th>
                  <th className="num">Opus score</th>
                  <th className="num">Length</th>
                </tr>
              </thead>
              <tbody>
                {backlog.map((c) => (
                  <tr key={c.clipId}>
                    <td className="title-cell">{c.title}</td>
                    <td className="num">{c.score}</td>
                    <td className="num">{c.durationSec ? `${c.durationSec}s` : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
            So far Opus's score has barely predicted your real results, so pick by topic and length first (see Home).
          </p>
        </section>
      )}
      <section className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <h2>Which platform gets the most out of the same clip?</h2>
          <p>Share of cross-posted clips where each platform beat its own normal by the most</p>
        </div>
        {a.platformWins.length ? (
          <BarList
            data={a.platformWins.map((w) => ({
              key: w.platform,
              label: (
                <span className="row" style={{ gap: 6 }}>
                  <span className="dot" style={{ background: platformColor(w.platform) }} />
                  {PLATFORM_LABEL[w.platform]}
                </span>
              ),
              value: w.wins / w.appearances,
              display: pct(w.wins / w.appearances, 0),
              tip: (
                <>
                  <div className="tip-title">{PLATFORM_LABEL[w.platform]}</div>
                  <TipRow value={w.wins} label={`wins out of ${w.appearances} clips`} />
                </>
              ),
            }))}
          />
        ) : (
          <Empty>Need clips that are at least 2 days old.</Empty>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Cross-posted clips ({a.clusters.length})</h2>
          <p>Same clip matched by title within 3 days. Sorted by total views.</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Clip</th>
                <th>First posted</th>
                <th className="num">Total views</th>
                <th>Per account (views · lift)</th>
              </tr>
            </thead>
            <tbody>
              {a.clusters.slice(0, limit).map((c) => {
                const best = c.posts.reduce((x, y) => (y.lift > x.lift ? y : x));
                return (
                  <tr key={c.key}>
                    <td className="title-cell">
                      <span className="t">{c.title}</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{shortDate(c.firstPublished)}</td>
                    <td className="num">{compact(c.totalViews)}</td>
                    <td>
                      {[...c.posts]
                        .sort((x, y) => y.views - x.views)
                        .map((p) => (
                          <span key={p.id} className={`pill ${p === best ? 'strong' : ''}`} title={p.account?.name}>
                            <span className="dot" style={{ background: platformColor(p.platform), marginRight: 4 }} />
                            {PLATFORM_LABEL[p.platform]}
                            {p.account?.kind === 'personal' ? ' (personal)' : ''} {compact(p.views)} · {p.mature ? lift(p.lift) : 'new'}
                          </span>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {a.clusters.length > limit && (
          <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
            <button className="btn" onClick={() => setLimit((l) => l + 30)}>
              Show more
            </button>
          </div>
        )}
      </section>
    </>
  );
}
