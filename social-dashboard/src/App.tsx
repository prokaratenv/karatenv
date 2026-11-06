import { useEffect, useMemo, useState } from 'react';
import { useStore, DEMO_SOURCE } from './store';
import type { Filters, Platform } from './types';
import { analyze } from './analysis/analyze';
import { recommend } from './analysis/recommendations';
import { PLATFORMS, PLATFORM_LABEL, accountLabel, platformColor } from './platforms';
import { TooltipProvider } from './components/Tooltip';
import { Overview } from './views/Overview';
import { Suggestions } from './views/Suggestions';
import { Insights } from './views/Insights';
import { Content } from './views/Content';
import { Clips } from './views/Clips';
import { ImportView } from './views/Import';
import { SettingsView } from './views/Settings';

const TABS = ['Overview', 'Suggestions', 'Insights', 'Content', 'Clips', 'Import', 'Settings'] as const;
type Tab = (typeof TABS)[number];

const HASH: Record<Tab, string> = {
  Overview: 'overview',
  Suggestions: 'suggestions',
  Insights: 'insights',
  Content: 'content',
  Clips: 'clips',
  Import: 'import',
  Settings: 'setup',
};
const tabFromHash = (): Tab => (Object.keys(HASH) as Tab[]).find((t) => `#${HASH[t]}` === location.hash) ?? 'Overview';

const RANGES: { days: number; label: string }[] = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
  { days: 0, label: 'All' },
];

export default function App() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>(tabFromHash);
  useEffect(() => {
    const on = () => setTab(tabFromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const [filters, setFilters] = useState<Filters>({ rangeDays: 30, platforms: [], accountIds: [] });

  const analysis = useMemo(
    () => analyze(store.posts, store.accounts, filters, store.settings.topics),
    [store.posts, store.accounts, filters, store.settings.topics],
  );
  const recs = useMemo(() => recommend(analysis), [analysis]);
  const isDemo = store.posts.length > 0 && store.posts.every((p) => p.source === DEMO_SOURCE);
  const presentPlatforms = PLATFORMS.filter((p) => store.posts.some((x) => x.platform === p));

  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, '', `#${HASH[t]}`);
  };
  const togglePlatform = (p: Platform) =>
    setFilters((f) => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p], accountIds: [] }));

  const showFilters = !['Import', 'Settings'].includes(tab);

  return (
    <TooltipProvider>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <h1>Engage Social Dashboard</h1>
            <small>
              Engage Lifestyle Martial Arts · CD Young
              {store.posts.length > 0 && ` · data through ${new Date(analysis.asOf).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </small>
          </div>
        </header>

        {isDemo && (
          <div className="notice warn" style={{ marginBottom: 12 }}>
            You're looking at <strong>demo data</strong>. Go to <a href="#import" onClick={(e) => { e.preventDefault(); go('Import'); }}>Import</a> and add your own exports; the demo is removed as soon as you do.
          </div>
        )}
        {store.persistError && <div className="notice warn" style={{ marginBottom: 12 }}>{store.persistError}</div>}

        <nav className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" className="tab" aria-selected={tab === t} onClick={() => go(t)}>
              {t}
              {t === 'Suggestions' && recs.length > 0 ? ` (${recs.length})` : ''}
            </button>
          ))}
        </nav>

        {showFilters && (
          <div className="filters">
            <div className="seg" role="group" aria-label="Date range">
              {RANGES.map((r) => (
                <button key={r.days} aria-pressed={filters.rangeDays === r.days} onClick={() => setFilters((f) => ({ ...f, rangeDays: r.days }))}>
                  {r.label}
                </button>
              ))}
            </div>
            {presentPlatforms.map((p) => (
              <button key={p} className="chip" aria-pressed={filters.platforms.includes(p)} onClick={() => togglePlatform(p)}>
                <span className="dot" style={{ background: platformColor(p) }} />
                {PLATFORM_LABEL[p]}
              </button>
            ))}
            <select
              aria-label="Account"
              value={filters.accountIds[0] ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, accountIds: e.target.value ? [e.target.value] : [] }))}
            >
              <option value="">All accounts</option>
              {store.accounts
                .filter((a) => (!filters.platforms.length || filters.platforms.includes(a.platform)) && store.posts.some((p) => p.accountId === a.id))
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {accountLabel(a)}
                  </option>
                ))}
            </select>
          </div>
        )}

        {!store.loaded ? (
          <div className="empty muted">Loading…</div>
        ) : (
          <main>
            {tab === 'Overview' && <Overview a={analysis} recs={recs} onSeeAll={() => go('Suggestions')} />}
            {tab === 'Suggestions' && <Suggestions a={analysis} recs={recs} apiKey={store.settings.anthropicApiKey} />}
            {tab === 'Insights' && <Insights a={analysis} />}
            {tab === 'Content' && <Content a={analysis} topics={store.settings.topics} />}
            {tab === 'Clips' && <Clips a={analysis} />}
            {tab === 'Import' && <ImportView store={store} />}
            {tab === 'Settings' && <SettingsView store={store} />}
          </main>
        )}
      </div>
    </TooltipProvider>
  );
}
