import type { Analysis } from '../analysis/analyze';
import type { Topic } from '../types';
import { bigPicture, type Finding } from '../analysis/bigpicture';
import { PLATFORM_LABEL, platformColor } from '../platforms';
import { compact, shortDate } from '../lib/format';
import { Empty } from '../components/charts';
import { TipRow, useTipProps } from '../components/Tooltip';
import { LiftPill } from '../components/LiftPill';
import { PostLink } from './Content';

const TONE: Record<Finding['tone'], { icon: string; label: string }> = {
  good: { icon: '▲', label: 'Working' },
  bad: { icon: '▼', label: 'Fix this' },
  neutral: { icon: '●', label: 'Good to know' },
};

/** Diverging scale centred on 1× (a typical post): red below, grey at 1×, blue above. */
function cellStyle(lift: number): { background: string; color: string } {
  const steps = [
    { max: 0.6, bg: 'var(--div-neg-3)', fg: '#fff' },
    { max: 0.8, bg: 'var(--div-neg-2)', fg: 'var(--text-primary)' },
    { max: 0.95, bg: 'var(--div-neg-1)', fg: 'var(--text-primary)' },
    { max: 1.1, bg: 'var(--div-mid)', fg: 'var(--text-primary)' },
    { max: 1.4, bg: 'var(--div-pos-1)', fg: 'var(--text-primary)' },
    { max: 2, bg: 'var(--div-pos-2)', fg: '#fff' },
    { max: Infinity, bg: 'var(--div-pos-3)', fg: '#fff' },
  ];
  const s = steps.find((x) => lift < x.max)!;
  return { background: s.bg, color: s.fg };
}

export function BigPictureView({ a, topics }: { a: Analysis; topics: Topic[] }) {
  const tip = useTipProps();
  const bp = bigPicture(a, topics);
  if (!bp.enough) return <Empty>The big picture needs at least 30 posts from the last 12 months. Import or sync more data, or include more platforms above.</Empty>;

  return (
    <div className="bp">
      <section className="bp-hero card">
        <div className="eyebrow">The big picture</div>
        <ul className="bp-summary">
          {bp.summary.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="muted" style={{ fontSize: 13 }}>
          Every number here compares a post with a <strong>typical post on the same account</strong> (1× = normal, 2× = twice the views). It covers the
          last 12 months; use the platform buttons above to look at one platform at a time.
        </p>
      </section>

      <section>
        <h2 className="section-title">Your winning formula</h2>
        <div className="formula">
          {bp.formula.map((f) => (
            <div key={f.label} className="formula-card card">
              <div className="eyebrow">{f.label}</div>
              <div className="formula-value">{f.value}</div>
              <div className="muted formula-why">{f.why}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">What the data is telling you</h2>
        <div className="findings">
          {bp.findings.map((f) => (
            <article key={f.id} className={`finding card tone-${f.tone}`}>
              <div className="finding-tag">
                <span aria-hidden>{TONE[f.tone].icon}</span> {TONE[f.tone].label}
              </div>
              <h3>{f.headline}</h3>
              <p className="secondary">{f.detail}</p>
              <p className="finding-action">
                <strong>Do this:</strong> {f.action}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>What works where</h2>
          <p>Topic × platform. Blue = beats a typical post, red = below. Hover for counts.</p>
        </div>
        <div className="table-wrap">
          <div className="matrix" style={{ gridTemplateColumns: `minmax(170px, 1.6fr) repeat(${bp.matrixPlatforms.length}, minmax(84px, 1fr))` }}>
            <div />
            {bp.matrixPlatforms.map((p) => (
              <div key={p} className="matrix-col">
                <span className="dot" style={{ background: platformColor(p) }} /> {PLATFORM_LABEL[p]}
              </div>
            ))}
            {bp.matrixTopics.map((t) => (
              <div key={t.id} style={{ display: 'contents' }}>
                <div className="matrix-row">{t.label}</div>
                {bp.matrixPlatforms.map((p) => {
                  const c = bp.matrix.find((x) => x.topic === t.id && x.platform === p)!;
                  if (c.n < 4) return <div key={p} className="matrix-cell empty" aria-label="Not enough posts">–</div>;
                  return (
                    <div
                      key={p}
                      className="matrix-cell"
                      style={cellStyle(c.lift)}
                      {...tip(
                        <>
                          <div className="tip-title">
                            {t.label} on {PLATFORM_LABEL[p]}
                          </div>
                          <TipRow value={`${c.lift.toFixed(2)}×`} label="a typical post" />
                          <TipRow value={c.n} label="posts" />
                        </>,
                      )}
                    >
                      {c.lift >= 10 ? c.lift.toFixed(0) : c.lift.toFixed(1)}×
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="matrix-legend muted">
          <span className="matrix-swatch" style={{ background: 'var(--div-neg-3)' }} /> under 0.6×
          <span className="matrix-swatch" style={{ background: 'var(--div-mid)' }} /> about normal
          <span className="matrix-swatch" style={{ background: 'var(--div-pos-3)' }} /> 2× and up
        </div>
      </section>

      <div className="grid cols-3" style={{ marginTop: 16 }}>
        <section className="card">
          <div className="card-head">
            <h2>Do more</h2>
          </div>
          <PillarList items={bp.pillars.more} empty="No standout topic yet." />
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Rethink</h2>
          </div>
          <PillarList items={bp.pillars.rethink} empty="Nothing is clearly underperforming." />
        </section>
        <section className="card">
          <div className="card-head">
            <h2>For members</h2>
          </div>
          <PillarList items={bp.pillars.members} empty="No member-only content in this range." />
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            Event recaps, belt tests and promos keep current families engaged. They aren't meant to reach strangers.
          </p>
        </section>
      </div>

      <div className="grid cols-2" style={{ marginTop: 16 }}>
        <section className="card">
          <div className="card-head">
            <h2>Hall of fame</h2>
            <p>Your biggest wins vs their account's normal</p>
          </div>
          <ol className="hof">
            {bp.hallOfFame.map(({ post, reasons }) => (
              <li key={post.id}>
                <div className="hof-main">
                  <PostLink p={post} />
                  <div className="muted hof-meta">
                    <span className="dot" style={{ background: platformColor(post.platform) }} /> {PLATFORM_LABEL[post.platform]} · {shortDate(post.publishedAt)} ·{' '}
                    <span className="big-num">{compact(post.views)}</span> views
                  </div>
                  <div>
                    {reasons.map((r) => (
                      <span key={r} className="pill">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <LiftPill value={post.lift} />
              </li>
            ))}
          </ol>
        </section>
        <section className="card">
          <div className="card-head">
            <h2>What spreads</h2>
            <p>Shares and saves per 1,000 views. These bring in new people.</p>
          </div>
          {bp.spreaders.length ? (
            <ol className="hof">
              {bp.spreaders.map(({ post, per1k, kind }) => (
                <li key={post.id + kind}>
                  <div className="hof-main">
                    <PostLink p={post} />
                    <div className="muted hof-meta">
                      <span className="dot" style={{ background: platformColor(post.platform) }} /> {PLATFORM_LABEL[post.platform]} ·{' '}
                      <span className="big-num">{compact(post.views)}</span> views · {kind === 'shares' ? post.shares : post.saves} {kind}
                    </div>
                  </div>
                  <span className="spread-num">
                    <span className="big-num">{per1k.toFixed(0)}</span>
                    <span className="muted"> {kind}/1K</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <Empty>No shares or saves recorded yet. Instagram and Facebook syncs add them.</Empty>
          )}
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <h2>A week built from your formula</h2>
          <p>A starting point. Swap ideas freely; keep the topic mix and timing.</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Topic</th>
                <th>Idea</th>
                <th>Format</th>
                <th>Post</th>
                <th>Lead with</th>
              </tr>
            </thead>
            <tbody>
              {bp.plan.map((d) => (
                <tr key={d.day}>
                  <td>
                    <strong>{d.day}</strong>
                  </td>
                  <td>{d.pillar}</td>
                  <td className="title-cell">{d.idea}</td>
                  <td>{d.format}</td>
                  <td>{d.when}</td>
                  <td>{d.lead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <h2>Learn the numbers</h2>
        </div>
        <div className="glossary">
          <details className="howto">
            <summary>Lift: "2.5× a typical post"</summary>
            <p className="secondary">
              Views divided by the median (middle) post on the same account. It's how a 300-view Facebook post and a 3,000-view YouTube Short can be compared fairly.
              1× is normal for that account. Anything above 2× is a clear win; below 0.7× missed.
            </p>
          </details>
          <details className="howto">
            <summary>Why the median and not the average</summary>
            <p className="secondary">
              One viral post can make an average look great while most posts are flat. The median shows what usually happens, which is what you can plan around.
            </p>
          </details>
          <details className="howto">
            <summary>Shares and saves per 1,000 views</summary>
            <p className="secondary">
              Likes say "nice". Shares put your post in front of people who don't follow you, and saves tell Instagram the post is worth coming back to. Both push
              the algorithm to show it to more people. For a local school, shares to other parents are the most valuable number you have.
            </p>
          </details>
          <details className="howto">
            <summary>Engagement rate</summary>
            <p className="secondary">
              (likes + comments + shares + saves) ÷ views. It drops as a post reaches more strangers, so a viral post often has a lower rate. Compare it between
              similar posts, not across platforms.
            </p>
          </details>
          <details className="howto">
            <summary>Why new posts show "new" instead of a number</summary>
            <p className="secondary">Posts keep collecting views for a couple of days, so anything under 2 days old is left out of the patterns until it settles.</p>
          </details>
        </div>
      </section>
    </div>
  );
}

function PillarList({ items, empty }: { items: ReturnType<typeof bigPicture>['pillars']['more']; empty: string }) {
  if (!items.length) return <p className="muted">{empty}</p>;
  return (
    <ul className="pillars">
      {items.map((p) => (
        <li key={p.id}>
          <div className="pillar-head">
            <strong>{p.label}</strong>
            <LiftPill value={p.lift} />
          </div>
          <div className="muted pillar-meta">
            {p.n} posts{p.bestPlatform ? ` · best on ${PLATFORM_LABEL[p.bestPlatform]}` : ''}
            {p.sharesPer1k >= 1 ? ` · ${p.sharesPer1k.toFixed(1)} shares/1K` : ''}
          </div>
          {p.example && <div className="pillar-example">e.g. "{p.example.title.replace(/\s*#\S+/g, '').slice(0, 80)}"</div>}
        </li>
      ))}
    </ul>
  );
}
