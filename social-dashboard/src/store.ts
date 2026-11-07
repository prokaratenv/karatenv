import { useCallback, useEffect, useRef, useState } from 'react';
import { get, set } from 'idb-keyval';
import type { Account, Post, Settings } from './types';
import { DEFAULT_ACCOUNTS } from './platforms';
import { DEFAULT_TOPICS } from './analysis/topics';
import { mergePosts } from './import/parse';
import { generateSample } from './data/sample';

const KEY = 'engage-social-dashboard-v1';

export interface Stored {
  posts: Post[];
  accounts: Account[];
  settings: Settings;
}

const initial = (): Stored => ({
  posts: [],
  accounts: DEFAULT_ACCOUNTS,
  settings: { topics: DEFAULT_TOPICS, seenDefaultTopics: DEFAULT_TOPICS.map((t) => t.id) },
});

export const DEMO_SOURCE = 'Demo data';

export function useStore() {
  const [state, setState] = useState<Stored>(initial);
  const [loaded, setLoaded] = useState(false);
  const [persistError, setPersistError] = useState<string>();
  const first = useRef(true);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    get<Stored>(KEY)
      .then((s) => {
        if (s) {
          // Add default topics introduced after this browser first saved its settings.
          const seen = new Set(s.settings?.seenDefaultTopics ?? s.settings?.topics?.map((t) => t.id) ?? []);
          const added = DEFAULT_TOPICS.filter((t) => !seen.has(t.id) && !s.settings.topics.some((x) => x.id === t.id));
          setState({
            ...initial(),
            ...s,
            settings: {
              ...initial().settings,
              ...s.settings,
              topics: [...s.settings.topics, ...added],
              seenDefaultTopics: DEFAULT_TOPICS.map((t) => t.id),
            },
          });
        }
        else setState((x) => ({ ...x, posts: generateSample(x.accounts) }));
      })
      .catch(() => {
        setPersistError('Browser storage is unavailable; changes will not be saved.');
        setState((x) => ({ ...x, posts: generateSample(x.accounts) }));
      })
      .finally(() => setLoaded(true));
  }, []);

  // Pull in data synced on a schedule (public/data/youtube.json), if this build has it.
  useEffect(() => {
    if (!loaded) return;
    fetch('data/youtube.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((synced: unknown) => {
        if (Array.isArray(synced) && synced.length) addPosts(synced as Post[]);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    if (first.current) {
      first.current = false;
      return;
    }
    set(KEY, state).catch(() => setPersistError('Could not save to browser storage.'));
  }, [state, loaded]);

  const addPosts = useCallback((incoming: Post[]) => {
    const s = ref.current;
    // Real data replaces the demo set automatically.
    const base = incoming.some((p) => p.source !== DEMO_SOURCE) ? s.posts.filter((p) => p.source !== DEMO_SOURCE) : s.posts;
    const m = mergePosts(base, incoming);
    const next = { ...s, posts: m.posts };
    ref.current = next;
    setState(next);
    return { added: m.added, updated: m.updated };
  }, []);

  const removeSource = useCallback((source: string) => setState((s) => ({ ...s, posts: s.posts.filter((p) => p.source !== source) })), []);
  const loadDemo = useCallback(() => setState((s) => ({ ...s, posts: [...s.posts.filter((p) => p.source !== DEMO_SOURCE), ...generateSample(s.accounts)] })), []);
  const setAccounts = useCallback((accounts: Account[]) => setState((s) => ({ ...s, accounts })), []);
  const setSettings = useCallback((settings: Settings) => setState((s) => ({ ...s, settings })), []);
  const replaceAll = useCallback((next: Stored) => setState({ ...initial(), ...next }), []);

  return { ...state, loaded, persistError, addPosts, removeSource, loadDemo, setAccounts, setSettings, replaceAll };
}

export type Store = ReturnType<typeof useStore>;
