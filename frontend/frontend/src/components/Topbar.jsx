import React from 'react';

export default function Topbar({ section }) {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        Workspace <span>/</span> <strong>{section}</strong>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{today}</span>
        <span className="live-pill">
          <span className="status-dot" /> FINANCIAL OPERATIONS
        </span>
        <div className="avatar" title="AutoClose AI workspace">
          AC
        </div>
      </div>
    </header>
  );
}
