import React from 'react';
import Icon from './Icon';
import { API_URL } from '../api';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'reviews', label: 'Review queue', icon: 'review' },
  { id: 'summary', label: 'AI close report', icon: 'sparkle' },
  { id: 'audit', label: 'Audit trail', icon: 'clock' },
];

const BACKEND_LABEL = {
  online: 'Backend connected',
  offline: 'Backend offline',
  unknown: 'Checking backend…',
};

export default function Sidebar({ active, onSelect, pendingCount, backend }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Icon name="sparkle" size={22} />
        </span>
        <div>
          <b>
            AutoClose<span> AI</span>
          </b>
          <small>FINANCE INTELLIGENCE</small>
        </div>
      </div>

      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${active === item.id ? 'selected' : ''}`}
            aria-current={active === item.id ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
          >
            <Icon name={item.icon} size={19} />
            <span className="nav-label">{item.label}</span>
            {item.id === 'reviews' && pendingCount > 0 && (
              <em className="nav-count" aria-label={`${pendingCount} pending`}>
                {pendingCount}
              </em>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`backend-status ${backend}`}>
          <span className="status-dot" />
          {BACKEND_LABEL[backend]}
        </div>
        <small>{API_URL.replace(/^https?:\/\//, '')}</small>
      </div>
    </aside>
  );
}
