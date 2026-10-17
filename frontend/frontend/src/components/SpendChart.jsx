import React, { useState } from 'react';
import { compactMoney, money, niceTicks } from '../format';

// Grouped bar chart: Ledger A vs Ledger B spend for every category.
// Drawn directly in SVG so the project needs no charting library.

const WIDTH = 720;
const HEIGHT = 300;
const MARGIN = { top: 16, right: 16, bottom: 46, left: 54 };

/** Bar with rounded top corners only. */
function barPath(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h);
  if (h <= 0) return '';
  return (
    `M${x},${y + h}V${y + radius}Q${x},${y} ${x + radius},${y}` +
    `H${x + w - radius}Q${x + w},${y} ${x + w},${y + radius}V${y + h}Z`
  );
}

const shorten = (text, max = 11) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export default function SpendChart({ rows }) {
  const [hovered, setHovered] = useState(null);

  const innerW = WIDTH - MARGIN.left - MARGIN.right;
  const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const maxValue = Math.max(0, ...rows.flatMap((r) => [r.ledger_a, r.ledger_b]));
  const ticks = niceTicks(maxValue);
  const top = ticks[ticks.length - 1];
  const y = (value) => MARGIN.top + innerH - (value / top) * innerH;

  const groupW = innerW / Math.max(rows.length, 1);
  const barW = Math.min(28, groupW * 0.3);
  const gap = 5;

  const active = hovered !== null ? rows[hovered] : null;
  const tooltipLeft = hovered !== null ? ((MARGIN.left + groupW * (hovered + 0.5)) / WIDTH) * 100 : 0;
  const tooltipShift = tooltipLeft < 22 ? '-12%' : tooltipLeft > 78 ? '-88%' : '-50%';

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="chart-svg"
        role="img"
        aria-label="Spend per category, Ledger A compared with Ledger B"
      >
        <defs>
          <linearGradient id="gradLedgerA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7d9bff" />
            <stop offset="1" stopColor="#4a63b8" />
          </linearGradient>
          <linearGradient id="gradLedgerB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6ae6d8" />
            <stop offset="1" stopColor="#2f9c92" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(tick)}
              y2={y(tick)}
              className={tick === 0 ? 'axis-line' : 'grid-line'}
            />
            <text x={MARGIN.left - 10} y={y(tick) + 4} textAnchor="end" className="axis-text">
              {compactMoney(tick)}
            </text>
          </g>
        ))}

        {rows.map((row, i) => {
          const cx = MARGIN.left + groupW * (i + 0.5);
          const xA = cx - barW - gap / 2;
          const xB = cx + gap / 2;
          return (
            <g
              key={row.category}
              className={`bar-group ${hovered === i ? 'is-hovered' : ''}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              aria-label={`${row.category}: Ledger A ${money(row.ledger_a)}, Ledger B ${money(row.ledger_b)}`}
            >
              <rect
                x={cx - groupW / 2}
                y={MARGIN.top}
                width={groupW}
                height={innerH}
                className="hover-band"
              />
              <path
                d={barPath(xA, y(row.ledger_a), barW, MARGIN.top + innerH - y(row.ledger_a), 6)}
                fill="url(#gradLedgerA)"
                className="bar"
                style={{ animationDelay: `${i * 60}ms` }}
              />
              <path
                d={barPath(xB, y(row.ledger_b), barW, MARGIN.top + innerH - y(row.ledger_b), 6)}
                fill="url(#gradLedgerB)"
                className="bar"
                style={{ animationDelay: `${i * 60 + 40}ms` }}
              />
              <text x={cx} y={HEIGHT - 20} textAnchor="middle" className="axis-text">
                {shorten(row.category)}
              </text>
            </g>
          );
        })}
      </svg>

      {active && (
        <div
          className="chart-tooltip"
          style={{ left: `${tooltipLeft}%`, transform: `translateX(${tooltipShift})` }}
          role="status"
        >
          <b>{active.category}</b>
          <span>
            <i className="dot a" /> Ledger A <em>{money(active.ledger_a)}</em>
          </span>
          <span>
            <i className="dot b" /> Ledger B <em>{money(active.ledger_b)}</em>
          </span>
          <span className="tooltip-diff">
            Variance <em>{Number(active.variance) ? money(active.variance) : 'none'}</em>
          </span>
        </div>
      )}

      <div className="legend">
        <span>
          <i className="dot a" /> Ledger A
        </span>
        <span>
          <i className="dot b" /> Ledger B
        </span>
      </div>
    </div>
  );
}
