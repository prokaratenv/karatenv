export function compact(n: number | undefined): string {
  if (n === undefined || !Number.isFinite(n)) return '–';
  const a = Math.abs(n);
  if (a >= 1e9) return `${trim(n / 1e9)}B`;
  if (a >= 1e6) return `${trim(n / 1e6)}M`;
  if (a >= 1e4) return `${trim(n / 1e3)}K`;
  return Math.round(n).toLocaleString('en-US');
}

const trim = (x: number) => (Math.abs(x) >= 100 ? x.toFixed(0) : x.toFixed(1).replace(/\.0$/, ''));

export const full = (n: number | undefined) =>
  n === undefined || !Number.isFinite(n) ? '–' : Math.round(n).toLocaleString('en-US');

export const pct = (x: number | undefined, digits = 1) =>
  x === undefined || !Number.isFinite(x) ? '–' : `${(x * 100).toFixed(digits)}%`;

export const lift = (x: number) => (x > 0 && x < 0.1 ? '<0.1×' : `${x >= 10 ? x.toFixed(0) : x.toFixed(1)}×`);

export function duration(sec: number | undefined): string {
  if (sec === undefined) return '–';
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return m ? `${m}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
}

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function hourLabel(h: number): string {
  const hh = ((h + 11) % 12) + 1;
  return `${hh}${h < 12 ? 'am' : 'pm'}`;
}

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
