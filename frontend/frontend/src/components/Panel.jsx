import React from 'react';

/** Card with a title row. Used for every section of the dashboard. */
export default function Panel({ title, subtitle, extra, className = '', children }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}
