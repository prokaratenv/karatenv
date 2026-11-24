import { hendersonGoals, type AudienceSnapshot } from '../import/audience';

const fmt = (v: number | undefined, share?: boolean) => (v === undefined ? '–' : share ? `${Math.round(v * 100)}%` : v.toLocaleString('en-US'));
const day = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** Henderson goals: are local parents finding us? Updated every Monday from Instagram and Facebook audience data. */
export function HendersonSection({ data }: { data?: AudienceSnapshot[] }) {
  if (!data?.length) return null;
  const last = data[data.length - 1];
  const first = data[0];
  const goals = hendersonGoals(data);
  const igF = last.ig?.followers?.cities;
  const fbF = last.fb?.followers?.cities;
  const reachTop = last.ig?.reach?.cities?.top.slice(0, 5) ?? [];

  return (
    <>
      <div className="home-band" style={{ marginTop: 32 }}>
        <h2 className="home-heading">Henderson</h2>
        <span className="home-sub">
          Local parents near the studio · as of {day(last.date)}
          {data.length > 1 && `, compared with ${day(first.date)}`} · updated every Monday
        </span>
      </div>
      <div className="goals">
        {goals.map((g) => {
          const progress = g.now === undefined ? 0 : Math.min(1, g.now / g.target);
          const diff = g.now !== undefined && g.start !== undefined && data.length > 1 ? g.now - g.start : undefined;
          return (
            <section key={g.id} className="tile goal">
              <div className="tile-label">{g.label}</div>
              <div className="tile-value">
                {fmt(g.now, g.share)} <span className="goal-target">of {fmt(g.target, g.share)} goal</span>
              </div>
              <div className="goal-bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${g.label}: ${Math.round(progress * 100)}% of goal`}>
                <span style={{ width: `${progress * 100}%` }} />
              </div>
              {diff !== undefined && diff !== 0 && (
                <div className={`tile-delta ${diff > 0 ? 'up' : 'down'}`}>
                  {diff > 0 ? '▲ +' : '▼ '}
                  {g.share ? `${Math.round(Math.abs(diff) * 100)} points` : Math.abs(diff).toLocaleString('en-US')} since {day(first.date)}
                </div>
              )}
              <div className="goal-how">{g.how}</div>
            </section>
          );
        })}
      </div>
      <section className="card">
        <div className="card-head">
          <h2>What this means</h2>
        </div>
        <ul className="bp-summary" style={{ fontSize: 15 }}>
          {igF && fbF && (
            <li>
              Your followers are already local: <strong>{fmt(igF.henderson / igF.known, true)}</strong> of Instagram followers and{' '}
              <strong>{fmt(fbF.henderson / fbF.known, true)}</strong> of Facebook followers live in Henderson, and about{' '}
              {fmt((igF.valley + fbF.valley) / (igF.known + fbF.known), true)} live in the valley.
            </li>
          )}
          {goals[2].now !== undefined && goals[3].now !== undefined && (
            <li>
              New reach is not local yet: only <strong>{fmt(goals[2].now, true)}</strong> of the people Instagram showed your posts to this month are in Henderson, and{' '}
              <strong>{fmt(goals[3].now, true)}</strong> are women. Videos for parents, tagged with Henderson, move both numbers.
            </li>
          )}
          {reachTop.length > 0 && <li>Where this month's Instagram reach went: {reachTop.map((c) => `${c.city.split(',')[0]} ${c.count.toLocaleString('en-US')}`).join(', ')}.</li>}
        </ul>
      </section>
    </>
  );
}
