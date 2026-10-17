import React from 'react';

// Progress ring: how many flagged items a human has approved so far.

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ReadinessRing({ reviews, ready }) {
  const approved = reviews.filter((r) => r.status === 'approved').length;
  const rejected = reviews.filter((r) => r.status === 'rejected').length;
  const remaining = reviews.length - approved;
  const percent = reviews.length ? Math.round((approved / reviews.length) * 100) : 100;

  return (
    <div className="readiness">
      <div className={`ring ${ready ? 'ready' : ''}`}>
        <svg viewBox="0 0 140 140" role="img" aria-label={`${percent}% of review items approved`}>
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#55d6c8" />
              <stop offset="1" stopColor="#6a8cff" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r={RADIUS} className="ring-track" />
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            className="ring-progress"
            stroke="url(#ringGrad)"
            strokeDasharray={`${(percent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="ring-label">
          <strong>{percent}%</strong>
          <span>approved</span>
        </div>
      </div>
      <h3>{ready ? 'Ready to post' : 'Review in progress'}</h3>
      <p>
        {ready
          ? 'Every flagged item has been approved.'
          : `${remaining} item${remaining === 1 ? '' : 's'} still need a decision${
              rejected ? ` (${rejected} rejected)` : ''
            }.`}
      </p>
    </div>
  );
}
