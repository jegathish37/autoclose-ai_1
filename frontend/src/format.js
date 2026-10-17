// Small formatting helpers shared by the dashboard components.

export const money = (value) =>
  Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/** $1,250 -> $1.3k, -$72,000 -> -$72k, $1,200,000 -> $1.2M (for chart axes). */
export function compactMoney(value) {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(abs >= 1e4 ? 0 : 1).replace(/\.0$/, '')}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

/** "amount_mismatch" -> "Amount Mismatch" */
export const titleCase = (text) =>
  String(text || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function formatDateTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Round-number axis ticks from 0 up to just above `max`.
 * niceTicks(72000) -> [0, 20000, 40000, 60000, 80000]
 */
export function niceTicks(max, target = 4) {
  if (!max || max <= 0) return [0, 1];
  const rough = max / target;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const factor = [1, 2, 2.5, 5, 10].find((f) => normalised <= f);
  const step = factor * magnitude;
  const ticks = [];
  for (let value = 0; value < max + step; value += step) {
    ticks.push(Math.round(value * 100) / 100);
    if (value >= max) break;
  }
  return ticks;
}

/**
 * Axis ticks covering [min, max] and always including 0, so charts can show
 * negative values (e.g. revenue stored as a credit).
 * niceScale(-55000, 46000) -> [-60000, -40000, ..., 40000, 60000]
 */
export function niceScale(min, max, target = 4) {
  const hi = Math.max(0, max);
  const lo = Math.min(0, min);
  if (hi === 0 && lo === 0) return [0, 1];
  const rough = (hi - lo) / target;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const factor = [1, 2, 2.5, 5, 10].find((f) => rough / magnitude <= f);
  const step = factor * magnitude;
  const ticks = [];
  for (let v = Math.floor(lo / step) * step; v <= Math.ceil(hi / step) * step + step / 2; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return ticks;
}
