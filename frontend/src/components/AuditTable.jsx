import React from 'react';
import Panel from './Panel';
import Icon from './Icon';
import { formatDateTime, titleCase } from '../format';

/** {matched: 9, mismatched: 1} -> small key/value chips */
function Details({ details }) {
  const entries = Object.entries(details || {});
  if (entries.length === 0) return <span className="muted">—</span>;
  return (
    <div className="kv-list">
      {entries.map(([key, value]) => (
        <span className="kv" key={key}>
          <i>{titleCase(key)}</i>
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      ))}
    </div>
  );
}

export default function AuditTable({ audit, onRefresh }) {
  const latest = [...audit].reverse().slice(0, 25);

  return (
    <Panel
      title="Audit trail"
      subtitle="Every agent action and human decision, newest first"
      extra={
        <button type="button" className="btn ghost" onClick={onRefresh}>
          <Icon name="refresh" size={16} /> Refresh
        </button>
      }
    >
      {latest.length === 0 ? (
        <div className="empty-inline">No audit events yet. Run a close to create some.</div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((event, i) => (
                <tr key={`${event.timestamp}-${i}`}>
                  <td className="time-cell">{formatDateTime(event.timestamp)}</td>
                  <td>
                    <span className={`actor ${event.actor}`}>{event.actor}</span>
                  </td>
                  <td className="strong-cell">{titleCase(event.action)}</td>
                  <td>
                    <Details details={event.details} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
