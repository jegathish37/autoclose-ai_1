import React from 'react';

// Donut showing how the transactions were reconciled.

const RADIUS = 62;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MatchDonut({ reconciliation, stats }) {
  const matched = reconciliation.matched.length;
  const mismatched = reconciliation.mismatched.length;
  const missing = reconciliation.missing_in_a.length + reconciliation.missing_in_b.length;
  const total = matched + mismatched + missing;

  const segments = [
    { label: 'Auto-matched', value: matched, color: 'var(--teal)' },
    { label: 'Amount mismatch', value: mismatched, color: 'var(--amber)' },
    { label: 'Missing in a ledger', value: missing, color: 'var(--red)' },
  ];

  let offset = 0;
  const visible = segments.filter((s) => s.value > 0).length;
  const gap = visible > 1 ? 4 : 0;

  return (
    <div className="donut">
      <div className="donut-chart">
        <svg viewBox="0 0 160 160" role="img" aria-label={`${stats.match_rate}% of transactions auto-matched`}>
          <circle cx="80" cy="80" r={RADIUS} className="donut-track" />
          {total > 0 &&
            segments.map((segment) => {
              if (!segment.value) return null;
              const length = (segment.value / total) * CIRCUMFERENCE;
              const dash = Math.max(length - gap, 0.5);
              const circle = (
                <circle
                  key={segment.label}
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="14"
                  strokeLinecap="butt"
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 80 80)"
                  className="donut-segment"
                />
              );
              offset += length;
              return circle;
            })}
        </svg>
        <div className="donut-center">
          <strong>{stats.match_rate}%</strong>
          <span>matched</span>
        </div>
      </div>

      <ul className="donut-legend">
        {segments.map((segment) => (
          <li key={segment.label}>
            <i className="dot" style={{ background: segment.color }} />
            <span>{segment.label}</span>
            <b>{segment.value}</b>
          </li>
        ))}
        <li className="donut-total">
          <span>Total transactions</span>
          <b>{total}</b>
        </li>
      </ul>
    </div>
  );
}
