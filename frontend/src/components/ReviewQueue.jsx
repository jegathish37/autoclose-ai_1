import React, { useState } from 'react';
import Panel from './Panel';
import Icon from './Icon';
import { titleCase } from '../format';

const FILTERS = ['all', 'pending', 'approved', 'rejected'];
const TYPE_TONE = { mismatch: 'amber', missing_in_a: 'red', missing_in_b: 'red' };

function StatusBadge({ status }) {
  const value = status || 'pending';
  return <span className={`badge ${value}`}>{value}</span>;
}

export default function ReviewQueue({ reviews, ready, busyId, onDecide }) {
  const [filter, setFilter] = useState('all');

  const count = (status) => reviews.filter((r) => (r.status || 'pending') === status).length;
  const approved = count('approved');
  const visible = reviews.filter((r) => filter === 'all' || (r.status || 'pending') === filter);

  return (
    <Panel
      title="Review queue"
      subtitle="The agent never posts anything. A person approves or rejects each exception."
      extra={<span className="tag">{reviews.length} ITEMS</span>}
    >
      {reviews.length === 0 ? (
        <div className="empty-inline">
          <Icon name="check" size={18} /> No exceptions found. Clean close.
        </div>
      ) : (
        <>
          <div className="review-progress">
            <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={reviews.length} aria-valuenow={approved}>
              <span style={{ width: `${(approved / reviews.length) * 100}%` }} />
            </div>
            <small>
              {approved} of {reviews.length} approved
            </small>
          </div>

          <div className="filters" role="tablist" aria-label="Filter review items">
            {FILTERS.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={filter === name}
                className={`chip ${filter === name ? 'selected' : ''}`}
                onClick={() => setFilter(name)}
              >
                {titleCase(name)} <em>{name === 'all' ? reviews.length : count(name)}</em>
              </button>
            ))}
          </div>

          <div className="review-list">
            {visible.length === 0 && <div className="empty-inline">Nothing in this view.</div>}
            {visible.map((item) => {
              const status = item.status || 'pending';
              const busy = busyId === item.id;
              return (
                <article className={`review ${status}`} key={item.id}>
                  <div className="review-info">
                    <div className="review-title">
                      <span className="txn-id">{item.transaction_id}</span>
                      <b>{item.description}</b>
                      <StatusBadge status={status} />
                    </div>
                    <p>
                      <span className={`type-pill ${TYPE_TONE[item.type] || 'blue'}`}>
                        {titleCase(item.type || 'issue')}
                      </span>
                      {item.detail}
                    </p>
                  </div>
                  <div className="review-actions">
                    <button
                      type="button"
                      className={`btn approve ${status === 'approved' ? 'active' : ''}`}
                      disabled={busy}
                      aria-pressed={status === 'approved'}
                      onClick={() => onDecide(item, 'approved')}
                    >
                      <Icon name="check" size={16} /> Approve
                    </button>
                    <button
                      type="button"
                      className={`btn reject ${status === 'rejected' ? 'active' : ''}`}
                      disabled={busy}
                      aria-pressed={status === 'rejected'}
                      onClick={() => onDecide(item, 'rejected')}
                    >
                      <Icon name="x" size={16} /> Reject
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <div className={`posting ${ready ? 'good' : ''}`}>
        <Icon name={ready ? 'check' : 'clock'} size={18} />
        {ready
          ? 'All items approved. This close is ready to post.'
          : 'Not ready to post: pending or rejected items remain.'}
      </div>
    </Panel>
  );
}
