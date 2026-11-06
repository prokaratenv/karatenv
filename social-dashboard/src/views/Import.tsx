import { useMemo, useRef, useState } from 'react';
import type { Store } from '../store';
import { DEMO_SOURCE } from '../store';
import type { Platform } from '../types';
import { buildPosts, parseCsv, type ParsedFile } from '../import/parse';
import { FIELDS, FIELD_LABEL, type Field } from '../import/columns';
import { PLATFORMS, PLATFORM_LABEL, accountLabel } from '../platforms';
import { compact, shortDate } from '../lib/format';
import { HOSTED } from '../env';

const HOWTO: { platform: string; steps: string[] }[] = [
  {
    platform: 'YouTube (Engage Lifestyle Martial Arts)',
    steps: [
      'Open YouTube Studio → Analytics → Advanced mode (top right).',
      'Pick the date range (e.g. last 90 days). On the Content tab, add the metrics Views, Watch time, Subscribers, Impressions, Likes, Comments, Shares, Average view duration.',
      'Click the download arrow → Comma-separated values (.csv). Unzip and import "Table data.csv".',
    ],
  },
  {
    platform: 'Instagram + Facebook (business and personal)',
    steps: [
      'Open Meta Business Suite → Insights → Content.',
      'Choose the account (Engage or CD Young), set the date range, then click Export data → CSV.',
      'Repeat for each Page / Instagram account. For a personal Facebook profile, switch it to Professional mode to get these insights.',
    ],
  },
  {
    platform: 'TikTok (business and personal)',
    steps: [
      'Desktop: TikTok Studio → Analytics → Content → Download data. Pick the date range and CSV.',
      'Do this once per TikTok account. If the export has no titles, the caption becomes the title.',
    ],
  },
  {
    platform: 'LinkedIn',
    steps: ['Your profile → Analytics → Post impressions → Export. Import the "All posts"/"Top posts" sheet saved as CSV.'],
  },
  {
    platform: 'Opus Clip',
    steps: [
      'Opus Clip posts the same clip to several platforms. Import the platform exports above and tick "Posted by Opus Clip" so the dashboard can compare Opus posts with everything else.',
      'If you export a clip list from Opus Clip that includes a Platform column and a virality score, import it directly; each row is routed to the right account.',
    ],
  },
];

interface Pending {
  file: ParsedFile;
  platform: Platform | undefined;
  accountByPlatform: Partial<Record<Platform, string>>;
  viaOpus: boolean;
}

export function ImportView({ store }: { store: Store }) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [msg, setMsg] = useState<string>();
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);

  const defaultAccount = (p: Platform, name?: string) => {
    const opts = store.accounts.filter((a) => a.platform === p);
    const byName = name && opts.find((a) => a.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(a.name.toLowerCase().split(' ')[0]));
    return (byName || opts.find((a) => a.kind === 'business') || opts[0])?.id;
  };

  const readFiles = async (files: FileList | File[]) => {
    const next: Pending[] = [];
    for (const f of Array.from(files)) {
      if (!/\.(csv|tsv|txt)$/i.test(f.name)) {
        setMsg(`${f.name}: please export as CSV (Excel files can be saved as CSV).`);
        continue;
      }
      const parsed = parseCsv(await f.text(), f.name);
      const platform = parsed.platform === 'multi' ? undefined : parsed.platform;
      const firstAccountName = parsed.mapping.accountName ? parsed.rows[0]?.[parsed.mapping.accountName] : undefined;
      const accountByPlatform: Pending['accountByPlatform'] = {};
      for (const p of PLATFORMS) accountByPlatform[p] = defaultAccount(p, firstAccountName);
      next.push({ file: parsed, platform, accountByPlatform, viaOpus: parsed.viaOpus });
    }
    setPending((x) => [...x, ...next]);
  };

  const commit = (i: number) => {
    const pd = pending[i];
    const { posts, skipped } = buildPosts(pd.file, {
      platform: pd.platform,
      viaOpus: pd.viaOpus,
      source: pd.file.fileName,
      accountFor: (p) => store.accounts.find((a) => a.id === pd.accountByPlatform[p]),
    });
    if (!posts.length) {
      setMsg(`${pd.file.fileName}: no posts could be read. ${skipped[0]?.reason ?? 'Check the column mapping.'}`);
      return;
    }
    const r = store.addPosts(posts);
    setMsg(`${pd.file.fileName}: ${r.added} new posts, ${r.updated} refreshed${skipped.length ? `, ${skipped.length} rows skipped (${skipped[0].reason})` : ''}.`);
    setPending((x) => x.filter((_, j) => j !== i));
  };

  const sources = useMemo(() => {
    const m = new Map<string, { n: number; latest: string; platforms: Set<Platform> }>();
    for (const p of store.posts) {
      const s = m.get(p.source) ?? { n: 0, latest: p.importedAt, platforms: new Set() };
      s.n++;
      s.platforms.add(p.platform);
      if (p.importedAt > s.latest) s.latest = p.importedAt;
      m.set(p.source, s);
    }
    return [...m.entries()];
  }, [store.posts]);

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ posts: store.posts, accounts: store.accounts, settings: { ...store.settings, anthropicApiKey: undefined } })], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `engage-social-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const importBackup = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.posts) || !Array.isArray(data.accounts)) throw new Error('Not a dashboard backup file.');
      store.replaceAll({ posts: data.posts, accounts: data.accounts, settings: { ...data.settings, anthropicApiKey: store.settings.anthropicApiKey } });
      setMsg(`Restored ${data.posts.length} posts from backup.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not read backup.');
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <section className="card">
        <div className="card-head">
          <h2>Import platform exports</h2>
          <p>Files stay in this browser; nothing is uploaded anywhere.</p>
        </div>
        <div
          className={`drop ${over ? 'over' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => input.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            readFiles(e.dataTransfer.files);
          }}
        >
          <strong>Drop CSV files here</strong> or click to choose
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            YouTube Studio · Meta Business Suite (Instagram, Facebook) · TikTok Studio · LinkedIn · Opus Clip. Re-importing a file refreshes its numbers.
          </div>
          <input ref={input} type="file" accept=".csv,.tsv,.txt" multiple hidden onChange={(e) => e.target.files && readFiles(e.target.files)} />
        </div>
        {msg && <div className="notice" style={{ marginTop: 12 }}>{msg}</div>}
      </section>

      {pending.map((pd, i) => (
        <PendingCard
          key={pd.file.fileName + i}
          pd={pd}
          store={store}
          onChange={(next) => setPending((x) => x.map((y, j) => (j === i ? next : y)))}
          onCommit={() => commit(i)}
          onCancel={() => setPending((x) => x.filter((_, j) => j !== i))}
        />
      ))}

      <section className="card">
        <div className="card-head">
          <h2>Where to find each export</h2>
        </div>
        {HOWTO.map((h) => (
          <details key={h.platform} className="howto">
            <summary>{h.platform}</summary>
            <ol>
              {h.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </details>
        ))}
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
          Tip: export every Sunday (or monthly) and re-import. Views on older posts keep growing, and re-importing keeps those numbers current.
        </p>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Your data</h2>
          <p>{compact(store.posts.length)} posts stored in this browser</p>
        </div>
        {sources.length > 0 && (
          <div className="table-wrap" style={{ marginBottom: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>Source file</th>
                  <th>Platforms</th>
                  <th className="num">Posts</th>
                  <th>Imported</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sources.map(([src, s]) => (
                  <tr key={src}>
                    <td>{src}</td>
                    <td>{[...s.platforms].map((p) => PLATFORM_LABEL[p]).join(', ')}</td>
                    <td className="num">{s.n}</td>
                    <td>{shortDate(s.latest)}</td>
                    <td className="num">
                      <button className="btn danger" onClick={() => store.removeSource(src)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="row">
          {!sources.some(([s]) => s === DEMO_SOURCE) && (
            <button className="btn" onClick={store.loadDemo}>
              Load demo data
            </button>
          )}
          {!HOSTED && (
            <button className="btn" onClick={exportBackup}>
              Download backup
            </button>
          )}
          <button className="btn" onClick={() => backupInput.current?.click()}>
            Restore backup
          </button>
          <input ref={backupInput} type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
        </div>
      </section>
    </div>
  );
}

function PendingCard({
  pd,
  store,
  onChange,
  onCommit,
  onCancel,
}: {
  pd: Pending;
  store: Store;
  onChange: (p: Pending) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const f = pd.file;
  const multi = f.platform === 'multi';
  const built = useMemo(
    () =>
      buildPosts(
        { rows: f.rows, mapping: f.mapping },
        {
          platform: pd.platform,
          viaOpus: pd.viaOpus,
          source: f.fileName,
          accountFor: (p) => store.accounts.find((a) => a.id === pd.accountByPlatform[p]),
        },
      ),
    [f, pd, store.accounts],
  );
  const preview = built.posts.slice(0, 5);
  const missing = (['publishedAt', 'views'] as Field[]).filter((x) => !f.mapping[x]);
  const setMap = (field: Field, header: string) => onChange({ ...pd, file: { ...f, mapping: { ...f.mapping, [field]: header || undefined } } });
  const accountSelect = (p: Platform) => (
    <label key={p} className="row" style={{ gap: 6 }}>
      <span className="muted">{PLATFORM_LABEL[p]} account</span>
      <select value={pd.accountByPlatform[p] ?? ''} onChange={(e) => onChange({ ...pd, accountByPlatform: { ...pd.accountByPlatform, [p]: e.target.value } })}>
        {store.accounts
          .filter((a) => a.platform === p)
          .map((a) => (
            <option key={a.id} value={a.id}>
              {accountLabel(a)} ({a.kind})
            </option>
          ))}
      </select>
    </label>
  );

  return (
    <section className="card">
      <div className="card-head">
        <h2>{f.fileName}</h2>
        <p>{f.rows.length} rows</p>
      </div>
      <div className="row" style={{ marginBottom: 12 }}>
        {!multi && (
          <label className="row" style={{ gap: 6 }}>
            <span className="muted">Platform</span>
            <select value={pd.platform ?? ''} onChange={(e) => onChange({ ...pd, platform: (e.target.value || undefined) as Platform | undefined })}>
              <option value="">Choose…</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
        )}
        {multi ? PLATFORMS.map(accountSelect) : pd.platform && accountSelect(pd.platform)}
        <label className="row" style={{ gap: 6 }}>
          <input type="checkbox" checked={pd.viaOpus} onChange={(e) => onChange({ ...pd, viaOpus: e.target.checked })} />
          Posted by Opus Clip
        </label>
      </div>
      {multi && <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>This file has a platform column, so each row goes to the account chosen for its platform.</p>}
      {missing.length > 0 && (
        <div className="notice warn" style={{ marginBottom: 12 }}>
          Couldn't find a column for {missing.map((m) => FIELD_LABEL[m]).join(' and ')}. Pick it below.
        </div>
      )}
      <details className="howto" open={missing.length > 0}>
        <summary>Column mapping ({Object.keys(f.mapping).length} matched)</summary>
        <div className="mapping">
          {FIELDS.map((field) => (
            <label key={field}>
              {FIELD_LABEL[field]}
              <select value={f.mapping[field] ?? ''} onChange={(e) => setMap(field, e.target.value)}>
                <option value="">—</option>
                {f.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </details>
      {preview.length > 0 && (
        <div className="table-wrap" style={{ margin: '12px -16px' }}>
          <table>
            <thead>
              <tr>
                <th>Preview: title</th>
                <th>Platform</th>
                <th>Published</th>
                <th className="num">Views</th>
                <th className="num">Likes</th>
                <th className="num">Comments</th>
                <th className="num">Shares</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((p) => (
                <tr key={p.id}>
                  <td className="title-cell">
                    <span className="t">{p.title}</span>
                  </td>
                  <td>{PLATFORM_LABEL[p.platform]}</td>
                  <td>{new Date(p.publishedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="num">{compact(p.views)}</td>
                  <td className="num">{compact(p.likes)}</td>
                  <td className="num">{compact(p.comments)}</td>
                  <td className="num">{compact(p.shares)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="row">
        <button className="btn primary" onClick={onCommit} disabled={!built.posts.length}>
          Import {built.posts.length} posts
        </button>
        {built.skipped.length > 0 && (
          <span className="muted" style={{ fontSize: 13 }}>
            {built.skipped.length} rows will be skipped ({built.skipped[0].reason})
          </span>
        )}
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}
