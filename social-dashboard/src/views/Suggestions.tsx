import { useState } from 'react';
import type { Analysis } from '../analysis/analyze';
import { CATEGORY_LABEL, type Recommendation } from '../analysis/recommendations';
import { buildBrief, STRATEGIST_PROMPT } from '../analysis/brief';
import { describeError, generateStrategy } from '../lib/ai';
import { Empty } from '../components/charts';
import { HOSTED } from '../env';

const impact = (score: number) => (score >= 50 ? 'High' : score >= 25 ? 'Medium' : 'Low');

export function RecCard({ r, compact }: { r: Recommendation; compact?: boolean }) {
  const level = impact(r.score);
  return (
    <article className={compact ? 'rec' : 'rec card'}>
      <div className={`rec-bar ${level === 'High' ? '' : level === 'Medium' ? 'mid' : 'low'}`} aria-hidden />
      <div>
        <h3>{r.title}</h3>
        <p className="why">{r.why}</p>
        {!compact && (
          <p className="action">
            <strong>Do this:</strong> {r.action}
          </p>
        )}
        <div className="meta">
          <span className="impact">{level} impact</span>
          <span>{CATEGORY_LABEL[r.category]}</span>
          {!compact && <span>Based on {r.evidence}</span>}
        </div>
      </div>
    </article>
  );
}

export function Suggestions({ a, recs, apiKey }: { a: Analysis; recs: Recommendation[]; apiKey?: string }) {
  const [copied, setCopied] = useState(false);
  const [ai, setAi] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const brief = () => buildBrief(a, recs);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${STRATEGIST_PROMPT}\n\n---\n\n${brief()}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErr(HOSTED ? 'Clipboard is blocked here. Select the text below and copy it.' : 'Clipboard is blocked in this browser. Use "Download brief" instead.');
    }
  };
  const download = () => {
    const blob = new Blob([`${STRATEGIST_PROMPT}\n\n---\n\n${brief()}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-brief-${a.asOf.slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const run = async () => {
    if (!apiKey) return;
    setBusy(true);
    setErr(undefined);
    setAi('');
    try {
      await generateStrategy(apiKey, brief(), setAi);
    } catch (e) {
      setErr(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid split" style={{ alignItems: 'start' }}>
      <section>
        <div className="card-head">
          <h2>What to do next</h2>
          <p>Ranked by expected impact × how much evidence backs it. Posts under 2 days old are left out.</p>
        </div>
        {recs.length ? (
          <div className="recs">
            {recs.map((r) => (
              <RecCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <Empty>No strong patterns in this slice. Widen the date range or include more accounts.</Empty>
        )}
      </section>
      <section className="card sticky">
        <div className="card-head">
          <h2>AI content strategist</h2>
        </div>
        <p className="secondary" style={{ marginBottom: 12 }}>
          Hands the numbers behind these suggestions to Claude and gets back a 7-day content plan, hook lines and title rewrites based on your data.
        </p>
        <div className="row" style={{ marginBottom: 12 }}>
          {!HOSTED && (
            <button className="btn primary" onClick={run} disabled={!apiKey || busy}>
              {busy ? 'Writing…' : 'Generate plan with Claude'}
            </button>
          )}
          <button className={HOSTED ? 'btn primary' : 'btn'} onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy brief'}
          </button>
          {!HOSTED && (
            <button className="btn" onClick={download}>
              Download brief
            </button>
          )}
        </div>
        {HOSTED && (
          <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
            Copy the brief and paste it into a new Claude chat. It includes the instructions and your numbers.
          </p>
        )}
        {err && HOSTED && <textarea readOnly rows={8} value={`${STRATEGIST_PROMPT}\n\n---\n\n${brief()}`} onFocus={(e) => e.currentTarget.select()} aria-label="Brief to copy" />}
        {!HOSTED && !apiKey && (
          <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
            Add an Anthropic API key in Settings to generate here, or copy the brief and paste it into Claude.
          </p>
        )}
        {err && <div className="notice warn" style={{ marginBottom: 12 }}>{err}</div>}
        {ai && <div className="ai-output">{ai}</div>}
      </section>
    </div>
  );
}
