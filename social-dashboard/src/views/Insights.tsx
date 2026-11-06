import { useState } from 'react';
import type { Analysis, GroupStat } from '../analysis/analyze';
import { MIN_N } from '../analysis/analyze';
import { BarList, Empty, Heatmap, type BarDatum } from '../components/charts';
import { TipRow } from '../components/Tooltip';
import { PLATFORM_LABEL, platformColor } from '../platforms';
import { DAYS, compact, hourLabel, lift, pct } from '../lib/format';
import type { Platform } from '../types';

function liftBars(groups: GroupStat[], limit = 14): BarDatum[] {
  return groups.slice(0, limit).map((g) => ({
    key: g.key,
    label: g.label,
    value: g.medianLift,
    display: lift(g.medianLift),
    dim: g.n < MIN_N,
    tip: (
      <>
        <div className="tip-title">{g.label}</div>
        <TipRow value={lift(g.medianLift)} label="median lift" />
        <TipRow value={g.n} label={`posts (${g.clips} distinct clips)`} />
        <TipRow value={compact(g.medianViews)} label="median views" />
        <TipRow value={pct(g.engRate)} label="engagement" />
        <TipRow value={g.sharesPer1k.toFixed(1)} label="shares / 1K views" />
        {g.top[0] && <div className="muted" style={{ marginTop: 4 }}>Best: "{g.top[0].title}"</div>}
      </>
    ),
  }));
}

const REF = 'Line = a typical post (1×). Grey bars: fewer than 4 posts, treat as a hint.';

export function Insights({ a }: { a: Analysis }) {
  const [durPlatform, setDurPlatform] = useState<Platform | 'all'>('all');
  if (a.mature.length < MIN_N) return <Empty>Need more posts (2+ days old) in this range to find patterns.</Empty>;
  const durs = durPlatform === 'all' ? a.durations : a.durationsByPlatform[durPlatform] ?? [];
  const blocks = Array.from({ length: 8 }, (_, i) => hourLabel(i * 3));
  const cell = (r: number, c: number) => a.heat.find((h) => h.day === r && h.block === c)!;
  const topKw = a.keywords.slice(0, 12);
  const lowKw = [...a.keywords].reverse().slice(0, 8);

  return (
    <>
      <p className="secondary" style={{ marginBottom: 16 }}>
        Every comparison uses <strong>lift</strong>: a post's views divided by the typical (median) post on the same account. That way a TikTok clip and a
        LinkedIn post can be compared fairly, even though their audiences are different sizes.
      </p>
      <div className="grid cols-2">
        <section className="card">
          <div className="card-head">
            <h2>Topics your audience wants</h2>
            <p>Edit topics in Settings</p>
          </div>
          <BarList data={liftBars(a.topics)} reference={1} referenceLabel={REF} />
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Words that pull views</h2>
            <p>Found automatically in titles and captions</p>
          </div>
          <BarList data={liftBars(topKw)} reference={1} referenceLabel={REF} />
          {lowKw.length > 0 && (
            <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
              Weakest: {lowKw.map((k) => `${k.key} (${lift(k.medianLift)})`).join(' · ')}
            </p>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Best video length</h2>
            <select value={durPlatform} onChange={(e) => setDurPlatform(e.target.value as Platform | 'all')} aria-label="Platform for video length">
              <option value="all">All platforms</option>
              {(Object.keys(a.durationsByPlatform) as Platform[]).map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          {durs.length ? <BarList data={liftBars(durs)} reference={1} referenceLabel={REF} /> : <Empty>No duration data in these exports.</Empty>}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Title & hook patterns</h2>
            <p>Lift with the pattern vs without it</p>
          </div>
          {a.hooks.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pattern</th>
                    <th className="num">With</th>
                    <th className="num">Without</th>
                    <th className="num">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {a.hooks.map((h) => (
                    <tr key={h.key}>
                      <td>{h.label}</td>
                      <td className="num">
                        {lift(h.withLift)} <span className="muted">n={h.withN}</span>
                      </td>
                      <td className="num">
                        {lift(h.withoutLift)} <span className="muted">n={h.withoutN}</span>
                      </td>
                      <td className="num" style={{ color: h.ratio >= 1.15 ? 'var(--good)' : h.ratio <= 0.87 ? 'var(--bad)' : undefined }}>
                        {h.ratio >= 1 ? '+' : '−'}
                        {Math.abs((h.ratio - 1) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>When to post</h2>
            <p>Median lift by day and start time (your local time). Darker = better.</p>
          </div>
          <Heatmap
            rows={DAYS}
            cols={blocks}
            value={(r, c) => {
              const h = cell(r, c);
              return h.n >= 2 ? h.medianLift : undefined;
            }}
            label={(v) => lift(v)}
            tip={(r, c) => {
              const h = cell(r, c);
              return (
                <>
                  <div className="tip-title">
                    {DAYS[r]} {hourLabel(c * 3)}–{hourLabel((c * 3 + 3) % 24)}
                  </div>
                  <TipRow value={lift(h.medianLift)} label="median lift" />
                  <TipRow value={h.n} label={`posts (${h.clips} clips)`} />
                </>
              );
            }}
          />
          {Object.keys(a.bestHourByPlatform).length > 0 && (
            <div className="row" style={{ marginTop: 12, fontSize: 13 }}>
              <span className="muted">Best hour:</span>
              {Object.entries(a.bestHourByPlatform).map(([p, h]) => (
                <span key={p} className="row" style={{ gap: 4 }}>
                  <span className="dot" style={{ background: platformColor(p as Platform) }} />
                  {PLATFORM_LABEL[p as Platform]} {hourLabel(h!.hour)} <span className="muted">({lift(h!.medianLift)})</span>
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Hashtags</h2>
            <p>Used on 4+ posts</p>
          </div>
          {a.hashtags.length ? <BarList data={liftBars(a.hashtags, 12)} reference={1} referenceLabel={REF} /> : <Empty>No repeated hashtags.</Empty>}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Format</h2>
          </div>
          <BarList data={liftBars(a.formats)} reference={1} referenceLabel={REF} />
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Opus Clip</h2>
          </div>
          {a.opus ? (
            <div className="kv">
              <span className="muted">Opus Clip posts</span>
              <span>
                {a.opus.nOpus} · median lift {lift(a.opus.opusLift)}
              </span>
              <span className="muted">Other posts</span>
              <span>
                {a.opus.nNative} · median lift {a.opus.nNative ? lift(a.opus.nativeLift) : '–'}
              </span>
              <span className="muted">Virality score vs results</span>
              <span>
                {a.opus.viralityCorr !== undefined
                  ? `${a.opus.viralityCorr.toFixed(2)} rank correlation over ${a.opus.viralityN} clips (${Math.abs(a.opus.viralityCorr) < 0.2 ? 'not predictive' : a.opus.viralityCorr > 0 ? 'somewhat predictive' : 'inversely related'})`
                  : 'Import an Opus Clip export with virality scores to check this.'}
              </span>
            </div>
          ) : (
            <Empty>
              Mark imports as "Posted by Opus Clip" on the Import tab (or import an Opus Clip export) to compare Opus posts with everything else.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
