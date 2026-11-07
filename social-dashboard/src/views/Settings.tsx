import { useState } from 'react';
import type { Store } from '../store';
import type { Account, Platform, Topic } from '../types';
import { PLATFORMS, PLATFORM_LABEL } from '../platforms';
import { DEFAULT_TOPICS } from '../analysis/topics';
import { slug } from '../import/parse';
import { HOSTED } from '../env';

export function SettingsView({ store }: { store: Store }) {
  const [key, setKey] = useState(store.settings.anthropicApiKey ?? '');
  const [newAcc, setNewAcc] = useState<{ platform: Platform; name: string; kind: Account['kind'] }>({ platform: 'linkedin', name: '', kind: 'business' });
  const topics = store.settings.topics;
  const setTopics = (t: Topic[]) => store.setSettings({ ...store.settings, topics: t });
  const counts = new Map<string, number>();
  for (const p of store.posts) counts.set(p.accountId, (counts.get(p.accountId) ?? 0) + 1);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <section className="card">
        <div className="card-head">
          <h2>Accounts</h2>
          <p>Each import is assigned to one of these</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Platform</th>
                <th>Name</th>
                <th>Type</th>
                <th className="num">Posts</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {store.accounts.map((a) => (
                <tr key={a.id}>
                  <td>{PLATFORM_LABEL[a.platform]}</td>
                  <td>
                    <input
                      type="text"
                      value={a.name}
                      aria-label="Account name"
                      onChange={(e) => store.setAccounts(store.accounts.map((x) => (x.id === a.id ? { ...x, name: e.target.value } : x)))}
                    />
                  </td>
                  <td>
                    <select
                      value={a.kind}
                      aria-label="Account type"
                      onChange={(e) => store.setAccounts(store.accounts.map((x) => (x.id === a.id ? { ...x, kind: e.target.value as Account['kind'] } : x)))}
                    >
                      <option value="business">Business</option>
                      <option value="personal">Personal</option>
                    </select>
                  </td>
                  <td className="num">{counts.get(a.id) ?? 0}</td>
                  <td className="num">
                    <button
                      className="btn danger"
                      disabled={(counts.get(a.id) ?? 0) > 0}
                      title={(counts.get(a.id) ?? 0) > 0 ? 'Remove its imports first' : undefined}
                      onClick={() => store.setAccounts(store.accounts.filter((x) => x.id !== a.id))}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <select value={newAcc.platform} onChange={(e) => setNewAcc({ ...newAcc, platform: e.target.value as Platform })} aria-label="New account platform">
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABEL[p]}
              </option>
            ))}
          </select>
          <input type="text" placeholder="Account name" value={newAcc.name} onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })} />
          <select value={newAcc.kind} onChange={(e) => setNewAcc({ ...newAcc, kind: e.target.value as Account['kind'] })} aria-label="New account type">
            <option value="business">Business</option>
            <option value="personal">Personal</option>
          </select>
          <button
            className="btn"
            disabled={!newAcc.name.trim()}
            onClick={() => {
              const id = `${newAcc.platform}-${slug(newAcc.name)}-${Date.now().toString(36)}`;
              store.setAccounts([...store.accounts, { id, ...newAcc, name: newAcc.name.trim() }]);
              setNewAcc({ ...newAcc, name: '' });
            }}
          >
            Add account
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Topics</h2>
          <p>Posts are tagged when a title, caption or hashtag contains one of the keywords (comma-separated)</p>
        </div>
        <div className="grid" style={{ gap: 8 }}>
          {topics.map((t, i) => (
            <div key={t.id} className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 3fr) auto', gap: 8, alignItems: 'start' }}>
              <input type="text" value={t.label} aria-label="Topic name" onChange={(e) => setTopics(topics.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <textarea
                rows={2}
                aria-label={`Keywords for ${t.label}`}
                defaultValue={t.keywords.join(', ')}
                onBlur={(e) =>
                  setTopics(
                    topics.map((x, j) =>
                      j === i
                        ? {
                            ...x,
                            keywords: e.target.value
                              .split(',')
                              .map((k) => k.trim().toLowerCase())
                              .filter(Boolean),
                          }
                        : x,
                    ),
                  )
                }
              />
              <button className="btn danger" onClick={() => setTopics(topics.filter((_, j) => j !== i))}>
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => setTopics([...topics, { id: `t-${Date.now().toString(36)}`, label: 'New topic', keywords: [] }])}>
            Add topic
          </button>
          <button className="btn" onClick={() => setTopics(DEFAULT_TOPICS)}>
            Reset to defaults
          </button>
        </div>
      </section>

      {!HOSTED && <section className="card">
        <div className="card-head">
          <h2>Claude API key (optional)</h2>
          <p>Only needed for "Generate plan with Claude" on the To-do list tab</p>
        </div>
        <div className="row">
          <input type="password" placeholder="sk-ant-…" value={key} onChange={(e) => setKey(e.target.value)} style={{ minWidth: 280 }} aria-label="Anthropic API key" />
          <button className="btn primary" onClick={() => store.setSettings({ ...store.settings, anthropicApiKey: key.trim() || undefined })}>
            Save
          </button>
          {store.settings.anthropicApiKey && (
            <button
              className="btn"
              onClick={() => {
                setKey('');
                store.setSettings({ ...store.settings, anthropicApiKey: undefined });
              }}
            >
              Remove
            </button>
          )}
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
          Stored only in this browser and sent only to Anthropic's API. It is never included in backups. Get a key at console.anthropic.com.
        </p>
      </section>}
    </div>
  );
}
