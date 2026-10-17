import React from 'react';

/** Shimmering placeholder shown while the backend is working. */
export default function Skeleton({ className = '', style }) {
  return <span className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

/** Placeholder for a whole panel (chart or table) while loading. */
export function PanelSkeleton({ title, lines = 4 }) {
  return (
    <section className="panel" aria-busy="true" aria-label={`Loading ${title}`}>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <Skeleton className="skeleton-line short" />
        </div>
      </div>
      <div className="skeleton-stack">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className="skeleton-line" style={{ width: `${100 - i * 9}%` }} />
        ))}
      </div>
    </section>
  );
}
