/** Parsers for the messy cell formats social platforms export. */

export function parseNumber(raw: unknown): number | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  let s = String(raw).trim();
  if (!s || s === '-' || s === '--' || /^n\/?a$/i.test(s)) return undefined;
  s = s.replace(/[,\s%$]/g, '');
  const m = s.match(/^(-?\d*\.?\d+)([kmb])?$/i);
  if (!m) return undefined;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase() as 'k' | 'm' | 'b'] ?? 1;
  return parseFloat(m[1]) * mult;
}

/** Percent cells: "12.5%" or "12.5" -> 0.125; "0.125" (already a fraction) -> 0.125. */
export function parsePercent(raw: unknown): number | undefined {
  const n = parseNumber(raw);
  if (n === undefined) return undefined;
  const hadSign = String(raw).includes('%');
  return hadSign || n > 1 ? n / 100 : n;
}

/** "45", "45s", "0:45", "1:02:03", "PT1M5S", "1m 5s" -> seconds. */
export function parseDuration(raw: unknown): number | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === 'number') return raw;
  const s = String(raw).trim();
  if (!s) return undefined;
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  const colon = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?(\.\d+)?$/);
  if (colon) {
    const [a, b, c] = [colon[1], colon[2], colon[3]].map((x) => (x === undefined ? undefined : parseInt(x, 10)));
    return c === undefined ? a! * 60 + b! : a! * 3600 + b! * 60 + c;
  }
  const iso = s.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i);
  if (iso) return (+(iso[1] || 0)) * 3600 + (+(iso[2] || 0)) * 60 + +(iso[3] || 0);
  const words = s.match(/^(?:(\d+)\s*h\w*)?\s*(?:(\d+)\s*m\w*)?\s*(?:(\d+(?:\.\d+)?)\s*s\w*)?$/i);
  if (words && (words[1] || words[2] || words[3])) {
    return (+(words[1] || 0)) * 3600 + (+(words[2] || 0)) * 60 + +(words[3] || 0);
  }
  return undefined;
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Returns an ISO string. Treats zone-less timestamps as local time; slash dates as US M/D/Y. */
export function parseDate(raw: unknown): string | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === 'number') {
    // Unix seconds or ms.
    const ms = raw < 1e11 ? raw * 1000 : raw;
    return new Date(ms).toISOString();
  }
  const s = String(raw).trim();
  if (!s) return undefined;
  if (/^\d{10,13}$/.test(s)) return parseDate(Number(s));

  // 2025-03-04, 2025-03-04 18:05, 2025-03-04T18:05:00Z
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/);
  if (iso) {
    if (iso[7]) return new Date(s.replace(' ', 'T')).toISOString();
    const [, y, mo, d, h = '0', mi = '0', se = '0'] = iso;
    return new Date(+y, +mo - 1, +d, +h, +mi, +se).toISOString();
  }

  // 03/04/2025 6:05 PM  or 03/04/2025 18:05
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]\.?m\.?)?)?$/i);
  if (us) {
    const [, mo, d, yRaw, hRaw = '0', mi = '0', se = '0', ampm] = us;
    const y = yRaw.length === 2 ? 2000 + +yRaw : +yRaw;
    return new Date(y, +mo - 1, +d, to24(+hRaw, ampm), +mi, +se).toISOString();
  }

  // Mar 4, 2025 [6:05 PM]
  const named = s.match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})(?:,?\s+(?:at\s+)?(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?)?$/i);
  if (named) {
    const mo = MONTHS.indexOf(named[1].toLowerCase());
    if (mo >= 0) {
      return new Date(+named[3], mo, +named[2], to24(+(named[4] || 0), named[6]), +(named[5] || 0)).toISOString();
    }
  }

  const t = Date.parse(s);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString();
}

function to24(h: number, ampm?: string): number {
  if (!ampm) return h;
  const pm = ampm.toLowerCase().startsWith('p');
  if (pm && h < 12) return h + 12;
  if (!pm && h === 12) return 0;
  return h;
}

export function extractHashtags(text: string): string[] {
  const tags = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  return [...new Set(tags.map((t) => t.toLowerCase()))];
}

export const normalizeHeader = (h: string) =>
  h
    .toLowerCase()
    .replace(/\(.*?\)/g, (m) => ` ${m.slice(1, -1)} `)
    .replace(/[^a-z0-9%]+/g, ' ')
    .trim();
