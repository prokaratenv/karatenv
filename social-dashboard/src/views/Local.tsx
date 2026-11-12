import type { LocalData } from '../import/local';
import { compact, pct } from '../lib/format';

function Change({ value, invert }: { value?: number; invert?: boolean }) {
  if (value === undefined) return null;
  if (value === 0) return <span className="score-change muted">no change</span>;
  const good = invert ? value < 0 : value > 0;
  return (
    <span className={`score-change ${good ? 'up' : 'down'}`}>
      {value > 0 ? '▲ +' : '▼ '}
      {Math.round(Math.abs(value) * 100)}%
    </span>
  );
}

const rel = (cur: number, prev?: number) => (prev ? cur / prev - 1 : undefined);

/** Google Business Profile + website search: where social reach turns into visits, calls and directions. */
export function LocalSection({ data }: { data?: LocalData }) {
  const gbp = data?.gbp?.length ? data.gbp[data.gbp.length - 1] : undefined;
  const site = data?.website?.length ? data.website[data.website.length - 1] : undefined;
  if (!gbp && !site) return null;
  const monthName = gbp ? new Date(`${gbp.month}-15`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
  const actions = gbp ? (gbp.calls ?? 0) + (gbp.directions ?? 0) + (gbp.websiteVisits ?? 0) + (gbp.chatClicks ?? 0) : 0;

  return (
    <>
      <div className="home-band" style={{ marginTop: 32 }}>
        <h2 className="home-heading">Website &amp; local</h2>
        <span className="home-sub">Where views turn into visits, calls and directions · updated monthly</span>
      </div>
      <div className="scoreboard">
        {gbp && (
          <section className="score card" style={{ borderTopColor: 'var(--series-3)' }}>
            <h2 className="score-title">Google Business Profile</h2>
            <div className="muted" style={{ fontSize: 13, marginTop: -6 }}>
              {gbp.profile} · {monthName}
            </div>
            <dl className="score-grid">
              <div className="score-item wide">
                <dt>Profile views</dt>
                <dd>
                  {compact(gbp.profileViews ?? 0)} <Change value={gbp.change.profileViews} />
                </dd>
              </div>
              <div className="score-item">
                <dt>Direction requests</dt>
                <dd>
                  {gbp.directions ?? '–'} <Change value={gbp.change.directions} />
                </dd>
              </div>
              <div className="score-item">
                <dt>Calls</dt>
                <dd>
                  {gbp.calls ?? '–'} <Change value={gbp.change.calls} />
                </dd>
              </div>
              <div className="score-item">
                <dt>Website clicks</dt>
                <dd>
                  {gbp.websiteVisits ?? '–'} <Change value={gbp.change.websiteVisits} />
                </dd>
              </div>
              <div className="score-item">
                <dt>Searches</dt>
                <dd>
                  {gbp.searches ?? '–'} <Change value={gbp.change.searches} />
                </dd>
              </div>
            </dl>
            {gbp.topSearchTerms.length > 0 && (
              <div className="score-best">
                <div className="eyebrow">What people searched</div>
                <div>
                  {gbp.topSearchTerms.map((t) => (
                    <span key={t.term} className="pill">
                      {t.term} · {t.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
        {site && (
          <section className="score card" style={{ borderTopColor: 'var(--series-1)' }}>
            <h2 className="score-title">Website from Google Search</h2>
            <div className="muted" style={{ fontSize: 13, marginTop: -6 }}>
              engagelma.com · 28 days to {new Date(`${site.period.split('/')[1]}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <dl className="score-grid">
              <div className="score-item wide">
                <dt>Clicks from Google</dt>
                <dd>
                  {compact(site.clicks)} <Change value={rel(site.clicks, site.prev?.clicks)} />
                </dd>
              </div>
              <div className="score-item">
                <dt>Times shown in search</dt>
                <dd>
                  {compact(site.impressions)} <Change value={rel(site.impressions, site.prev?.impressions)} />
                </dd>
              </div>
              <div className="score-item">
                <dt>Click rate</dt>
                <dd>{site.ctr !== undefined ? pct(site.ctr) : '–'}</dd>
              </div>
              <div className="score-item">
                <dt>Average position</dt>
                <dd>
                  {site.avgPosition ?? '–'}
                  {site.prev?.avgPosition !== undefined && site.avgPosition !== undefined && site.prev.avgPosition !== site.avgPosition && (
                    // Lower is better in Google: say it in words instead of a confusing down-arrow.
                    <span className={`score-change ${site.avgPosition < site.prev.avgPosition ? 'up' : 'down'}`}>
                      {site.avgPosition < site.prev.avgPosition ? '▲ better than ' : '▼ worse than '}
                      {site.prev.avgPosition}
                    </span>
                  )}
                </dd>
              </div>
              <div className="score-item">
                <dt>Pages on Google</dt>
                <dd>
                  {site.indexedPages ?? '–'} <Change value={site.indexedPages !== undefined ? rel(site.indexedPages, site.prev?.indexedPages) : undefined} />
                </dd>
              </div>
            </dl>
          </section>
        )}
      </div>
      {gbp && (
        <section className="card">
          <div className="card-head">
            <h2>What this means</h2>
          </div>
          <ul className="bp-summary" style={{ fontSize: 15 }}>
            {gbp.directions !== undefined && actions > 0 && (
              <li>
                <strong>{Math.round((gbp.directions / actions) * 100)}%</strong> of actions on your Google profile are direction requests. Most people who find you on
                Google want to come to the studio, so your address, hours and photos matter more than anything else on the profile.
              </li>
            )}
            {gbp.topSearchTerms.length > 0 && (
              <li>
                People mostly find you by searching your name or "{gbp.topSearchTerms[0].term}". Few find you through searches like "kids karate Henderson", which is
                the gap to close with Google reviews and local pages on your site.
              </li>
            )}
            {site && site.ctr !== undefined && site.ctr < 0.03 && (
              <li>
                Your site shows up in Google {compact(site.impressions)} times a month but only {pct(site.ctr)} click. Stronger page titles and descriptions (from
                the SEO report) are the quickest way to more visits.
              </li>
            )}
            <li>
              Short videos already reach thousands of people a week. Adding "Engage Lifestyle Martial Arts, Henderson" on screen and in captions turns more of
              those viewers into the people searching for you here.
            </li>
          </ul>
        </section>
      )}
    </>
  );
}
