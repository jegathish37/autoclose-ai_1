import React from 'react';
import Icon from './Icon';

/** Friendly screen shown before the first reconciliation has been run. */
export default function EmptyState({ onRun, loading }) {
  return (
    <div className="empty-state">
      <svg className="empty-art" viewBox="0 0 220 140" role="img" aria-label="Two ledgers being compared">
        <defs>
          <linearGradient id="emptyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#55d6c8" />
            <stop offset="1" stopColor="#6a8cff" />
          </linearGradient>
        </defs>
        <rect x="14" y="26" width="86" height="104" rx="12" className="art-card" />
        <rect x="120" y="26" width="86" height="104" rx="12" className="art-card" />
        {[48, 64, 80, 96, 112].map((y, i) => (
          <g key={y}>
            <rect x="28" y={y} width={i % 2 ? 40 : 52} height="6" rx="3" className="art-line" />
            <rect x="134" y={y} width={i % 2 ? 52 : 40} height="6" rx="3" className="art-line" />
          </g>
        ))}
        <circle cx="110" cy="78" r="21" fill="url(#emptyGrad)" />
        <path
          d="M100 78.5l7 7 13-14"
          fill="none"
          stroke="#07111f"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h2>Your financial insights await</h2>
      <p>
        Run the sample close, or upload two ledgers, to see matched transactions, exceptions,
        analytics and a draft close report.
      </p>
      <button type="button" className="btn primary" onClick={onRun} disabled={loading}>
        <Icon name="sparkle" size={17} /> Run sample close
      </button>
    </div>
  );
}
