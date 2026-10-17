import React from 'react';
import Icon from './Icon';
import { money } from '../format';

// Horizontal bars centred on zero: how far Ledger B is from Ledger A per category.

export default function VarianceChart({ rows }) {
  const maxAbs = Math.max(0, ...rows.map((r) => Math.abs(Number(r.variance) || 0)));

  if (maxAbs === 0) {
    return (
      <div className="empty-inline">
        <Icon name="check" size={16} className="ok-icon" /> Every category matches between the two ledgers.
      </div>
    );
  }

  return (
    <div>
      <ul className="variance-list">
        {rows.map((row) => {
          const value = Number(row.variance) || 0;
          const width = (Math.abs(value) / maxAbs) * 50;
          const direction = value > 0 ? 'over' : value < 0 ? 'under' : 'none';
          return (
            <li key={row.category}>
              <span className="variance-label">{row.category}</span>
              <span className="variance-track" aria-hidden="true">
                <span className="variance-center" />
                {value !== 0 && (
                  <span
                    className={`variance-bar ${direction}`}
                    style={{
                      width: `${width}%`,
                      left: value > 0 ? '50%' : `${50 - width}%`,
                    }}
                  />
                )}
              </span>
              <span className={`variance-value ${direction}`}>
                {value === 0 ? '—' : `${value > 0 ? '+' : '−'}${money(Math.abs(value))}`}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="legend">
        <span>
          <i className="dot amber" /> Ledger B higher
        </span>
        <span>
          <i className="dot blue" /> Ledger B lower
        </span>
      </div>
    </div>
  );
}
