import { useMemo, useRef, useState, type ReactNode } from 'react';
import { TipRow, useTipProps, useTooltip } from './Tooltip';
import { compact, shortDate } from '../lib/format';

/* ---------- Stat tile ---------- */

export function StatTile({ label, value, delta, hint }: { label: string; value: string; delta?: number; hint?: string }) {
  return (
    <div className="tile">
      <div className="tile-label">{label}</div>
      <div className="tile-value">{value}</div>
      {delta !== undefined && Number.isFinite(delta) ? (
        <div className={`tile-delta ${delta >= 0 ? 'up' : 'down'}`}>
          <span aria-hidden>{delta >= 0 ? '▲' : '▼'}</span> {Math.abs(delta * 100).toFixed(0)}% <span className="muted">vs previous period</span>
        </div>
      ) : hint ? (
        <div className="tile-delta muted">{hint}</div>
      ) : null}
    </div>
  );
}

/* ---------- Horizontal bar list (single series) ---------- */

export interface BarDatum {
  key: string;
  label: ReactNode;
  value: number;
  display: string;
  tip?: ReactNode;
  dim?: boolean;
}

/**
 * One measure, one hue. `reference` draws a hairline (e.g. 1× = a typical post).
 */
export function BarList({ data, max, reference, referenceLabel }: { data: BarDatum[]; max?: number; reference?: number; referenceLabel?: string }) {
  const tip = useTipProps();
  const m = Math.max(max ?? 0, reference ?? 0, ...data.map((d) => d.value)) || 1;
  if (!data.length) return <Empty />;
  return (
    <div className="barlist" role="list">
      {data.map((d) => (
        <div className="barlist-row" role="listitem" key={d.key} {...(d.tip ? tip(d.tip) : {})}>
          <div className="barlist-label">{d.label}</div>
          <div className="barlist-track">
            <div className={`barlist-bar ${d.dim ? 'dim' : ''}`} style={{ width: `${Math.max(0.5, (d.value / m) * 100)}%` }} />
            {reference !== undefined && <div className="barlist-ref" style={{ left: `${(reference / m) * 100}%` }} />}
          </div>
          <div className="barlist-value">{d.display}</div>
        </div>
      ))}
      {reference !== undefined && referenceLabel && (
        <div className="barlist-foot muted">
          <span className="ref-key" aria-hidden /> {referenceLabel}
        </div>
      )}
    </div>
  );
}

/* ---------- Multi-series line chart with crosshair ---------- */

export interface Series {
  key: string;
  label: string;
  color: string;
  values: number[];
}

export function LineChart({ x, series, height = 240, format = compact }: { x: string[]; series: Series[]; height?: number; format?: (n: number) => string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const { show, hide } = useTooltip();
  const W = 720;
  const H = height;
  const pad = { l: 48, r: 96, t: 12, b: 28 };
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const sx = (i: number) => pad.l + (x.length <= 1 ? 0 : (i / (x.length - 1)) * (W - pad.l - pad.r));
  const sy = (v: number) => pad.t + (1 - v / top) * (H - pad.t - pad.b);
  const labelEvery = Math.max(1, Math.ceil(x.length / 8));

  // End labels, nudged only when they'd overlap; dropped (legend covers it) if still crowded.
  const ends = useMemo(() => {
    const items = series.map((s) => ({ s, y: sy(s.values[s.values.length - 1] ?? 0) })).sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i++) if (items[i].y - items[i - 1].y < 14) items[i].y = items[i - 1].y + 14;
    return items.filter((it) => it.y < H - pad.b + 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, top]);

  if (!x.length) return <Empty />;

  const onMove = (e: React.PointerEvent) => {
    const svg = ref.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (x.length - 1));
    const idx = Math.max(0, Math.min(x.length - 1, i));
    setHover(idx);
    show(
      e.clientX,
      e.clientY,
      <>
        <div className="tip-title">Week of {shortDate(x[idx])}</div>
        {[...series].sort((a, b) => b.values[idx] - a.values[idx]).map((s) => (
          <TipRow key={s.key} color={s.color} value={format(s.values[idx])} label={s.label} />
        ))}
      </>,
    );
  };

  return (
    <div className="chart">
      <Legend items={series.map((s) => ({ key: s.key, label: s.label, color: s.color, kind: 'line' }))} />
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="chart-svg"
        role="img"
        aria-label={`Line chart: ${series.map((s) => s.label).join(', ')} by week`}
        onPointerMove={onMove}
        onPointerLeave={() => {
          setHover(null);
          hide();
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className={t === 0 ? 'axis' : 'grid'} />
            <text x={pad.l - 8} y={sy(t)} className="tick" textAnchor="end" dominantBaseline="middle">
              {compact(t)}
            </text>
          </g>
        ))}
        {x.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d} x={sx(i)} y={H - 8} className="tick" textAnchor="middle">
              {shortDate(d)}
            </text>
          ) : null,
        )}
        {hover !== null && <line x1={sx(hover)} x2={sx(hover)} y1={pad.t} y2={H - pad.b} className="crosshair" />}
        {series.map((s) => (
          <path
            key={s.key}
            d={s.values.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join('')}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {series.map((s) => {
          const i = hover ?? s.values.length - 1;
          return <circle key={s.key} cx={sx(i)} cy={sy(s.values[i] ?? 0)} r={4} fill={s.color} stroke="var(--surface-1)" strokeWidth={2} />;
        })}
        {series.length <= 5 &&
          ends.map(({ s, y }) => (
            <text key={s.key} x={W - pad.r + 10} y={y} className="end-label" dominantBaseline="middle">
              {s.label}
            </text>
          ))}
      </svg>
    </div>
  );
}

export function niceTicks(max: number, count = 4): number[] {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = 0; v <= max + step * 0.999; v += step) out.push(v);
  return out.length > 1 ? out : [0, step];
}

/* ---------- Heatmap (sequential, one hue) ---------- */

const RAMP = ['var(--seq-100)', 'var(--seq-200)', 'var(--seq-300)', 'var(--seq-400)', 'var(--seq-500)', 'var(--seq-600)', 'var(--seq-700)'];

export function Heatmap({
  rows,
  cols,
  value,
  tip,
  label,
}: {
  rows: string[];
  cols: string[];
  value: (r: number, c: number) => number | undefined;
  tip: (r: number, c: number) => ReactNode;
  label: (v: number) => string;
}) {
  const tp = useTipProps();
  const vals = rows.flatMap((_, r) => cols.map((_, c) => value(r, c))).filter((v): v is number => v !== undefined);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const step = (v: number) => (hi === lo ? 3 : Math.round(((v - lo) / (hi - lo)) * (RAMP.length - 1)));
  return (
    <div className="heatmap" style={{ gridTemplateColumns: `3em repeat(${cols.length}, minmax(0, 1fr))` }}>
      <div />
      {cols.map((c) => (
        <div key={c} className="heat-col muted">
          {c}
        </div>
      ))}
      {rows.map((rl, r) => (
        <div className="heat-row" key={rl} style={{ display: 'contents' }}>
          <div className="heat-rowlabel muted">{rl}</div>
          {cols.map((_, c) => {
            const v = value(r, c);
            if (v === undefined) return <div key={c} className="heat-cell empty" aria-label="Not enough posts" />;
            const s = step(v);
            return (
              <div key={c} className="heat-cell" style={{ background: RAMP[s] }} {...tp(tip(r, c))}>
                <span className={s >= 4 ? 'on-dark' : 'on-light'}>{label(v)}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ---------- Legend & misc ---------- */

export function Legend({ items }: { items: { key: string; label: string; color: string; kind: 'line' | 'rect' }[] }) {
  if (items.length < 2) return null;
  return (
    <div className="legend">
      {items.map((it) => (
        <span key={it.key} className="legend-item">
          <span className={`legend-key ${it.kind}`} style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function Empty({ children = 'Not enough data yet.' }: { children?: ReactNode }) {
  return <div className="empty muted">{children}</div>;
}

/** Small inline bar for tables. */
export function InlineBar({ value, max, color = 'var(--series-1)' }: { value: number; max: number; color?: string }) {
  return (
    <span className="inline-bar">
      <span style={{ width: `${Math.max(2, (value / (max || 1)) * 100)}%`, background: color }} />
    </span>
  );
}
