import React from 'react';
import Icon from './Icon';
import Skeleton from './Skeleton';

/** One headline number. `tone` picks the accent colour of the icon chip. */
export default function MetricCard({ label, value, hint, icon, tone = 'teal', loading }) {
  return (
    <div className={`metric tone-${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">
          <Icon name={icon} size={18} />
        </span>
      </div>
      {loading ? <Skeleton className="skeleton-value" /> : <strong>{value}</strong>}
      <small>{hint}</small>
    </div>
  );
}
