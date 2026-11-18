import { useEffect, useState } from 'react';

/**
 * "Refresh stats now": fires the on-demand scheduled task ("Dashboard refresh now"), which runs the full sync
 * (YouTube, Meta, Windsor TikTok/LinkedIn, Opus, Business Profile email) in CD's Claude session and republishes
 * this dashboard. Only in the hosted build, through the viewer's built-in Claude Code Remote connector.
 */
export const REFRESH_TRIGGER_ID = 'trig_01GHpruptHZy98K5fK5mDKNW';
const SERVER = 'Claude Code Remote';
const TOOL = 'fire_trigger';
const KEY = 'engage.refreshStartedAt';
const COOLDOWN_MS = 30 * 60_000;

type McpError = { code?: string; message?: string };
type Mcp = {
  callTool: (server: string, tool: string, input?: unknown, opts?: unknown) => Promise<unknown>;
  listTools: (server?: string) => Promise<{ servers: { server: string; authStatus: string; tools: { name: string }[] }[] }>;
};
type State = { kind: 'idle' } | { kind: 'busy' } | { kind: 'started'; at: number } | { kind: 'error'; text: string } | { kind: 'unavailable'; text: string };

const readStarted = () => {
  try {
    const v = Number(localStorage.getItem(KEY));
    return v && Date.now() - v < COOLDOWN_MS ? v : 0;
  } catch {
    return 0;
  }
};
const time = (ms: number) => new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

function messageFor(e: McpError): State {
  switch (e.code) {
    case 'not_in_manifest':
    case 'approval_required':
    case 'consent_required':
      return { kind: 'error', text: 'The dashboard needs your OK to start the refresh. Press the button again and choose Allow, or turn it on in the dashboard’s Permissions menu.' };
    case 'needs_reauth':
      return { kind: 'error', text: 'Your Claude sign-in for scheduled tasks lapsed. Reload this page, sign in if asked, and press the button again.' };
    case 'server_not_connected':
    case 'selection_required':
    case 'server_not_found':
      return { kind: 'unavailable', text: 'Scheduled tasks can’t be reached from this view. Open the dashboard on claude.ai while signed in to start a refresh.' };
    case 'blocked_by_policy':
      return { kind: 'unavailable', text: 'Your organization’s settings don’t allow starting scheduled tasks from a page.' };
    case 'tool_error':
      return { kind: 'error', text: `The refresh task didn’t start: ${e.message ?? 'unknown reason'}. Tell Claude in the dashboard chat.` };
    case 'server_unavailable':
    case 'upstream_error':
    case 'cancelled':
      return { kind: 'error', text: 'No answer came back, so the refresh may or may not have started. Wait a minute, then check the time next to “data through” before pressing again.' };
    case 'not_granted':
    case 'capability_disabled':
    case 'capability_removed':
      return { kind: 'unavailable', text: 'This view can’t start a refresh. Open the dashboard on claude.ai.' };
    default:
      return { kind: 'error', text: `Couldn’t start the refresh (${e.code ?? 'error'}). Try again in a minute.` };
  }
}

export function RefreshButton() {
  const [mcp, setMcp] = useState<Mcp | null | undefined>(undefined);
  const [state, setState] = useState<State>(() => {
    const at = readStarted();
    return at ? { kind: 'started', at } : { kind: 'idle' };
  });

  useEffect(() => {
    const c = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
    if (!c?.use) return setMcp(null);
    c.use('mcp').then((m) => setMcp((m as Mcp) ?? null), () => setMcp(null));
  }, []);

  if (mcp === undefined || mcp === null) return null; // not on claude.ai: no button

  const start = async () => {
    setState({ kind: 'busy' });
    try {
      const list = await mcp.listTools(SERVER).catch(() => null);
      const s = list?.servers.find((x) => x.server === SERVER);
      if (s && s.authStatus === 'connected' && s.tools.length && !s.tools.some((t) => t.name === TOOL)) {
        setState({ kind: 'unavailable', text: 'Your account can’t start scheduled tasks from a page. Use “Run now” on the Dashboard refresh now task in claude.ai instead.' });
        return;
      }
      await mcp.callTool(SERVER, TOOL, { trigger_id: REFRESH_TRIGGER_ID }, { cache: false });
      const at = Date.now();
      try {
        localStorage.setItem(KEY, String(at));
      } catch {
        /* per-viewer convenience only */
      }
      setState({ kind: 'started', at });
    } catch (e) {
      setState(messageFor(e as McpError));
    }
  };

  const cooling = state.kind === 'started' && Date.now() - state.at < COOLDOWN_MS;
  return (
    <div className="refresh">
      <button className="btn primary" onClick={start} disabled={state.kind === 'busy' || cooling || state.kind === 'unavailable'}>
        {state.kind === 'busy' ? 'Starting…' : cooling ? 'Refresh running' : 'Refresh stats now'}
      </button>
      <span className="refresh-note" role="status">
        {state.kind === 'started' &&
          `Started at ${time(state.at)}. Fresh numbers in about 25 minutes, when Claude republishes the dashboard; reopen it then.`}
        {(state.kind === 'error' || state.kind === 'unavailable') && state.text}
        {state.kind === 'idle' && 'Pulls the latest numbers from every platform (about 25 minutes). No email is sent.'}
      </span>
    </div>
  );
}
