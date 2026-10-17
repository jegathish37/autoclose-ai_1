import React from 'react';
import Panel from './Panel';
import { money } from '../format';

export default function VarianceTable({ rows }) {
  const totals = rows.reduce(
    (sum, r) => ({
      a: sum.a + Number(r.ledger_a || 0),
      b: sum.b + Number(r.ledger_b || 0),
    }),
    { a: 0, b: 0 },
  );
  const totalVariance = totals.b - totals.a;

  return (
    <Panel title="Category variance" subtitle="Detailed ledger reconciliation breakdown">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th className="num">Ledger A</th>
              <th className="num">Ledger B</th>
              <th className="num">Variance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const variance = Number(row.variance);
              return (
                <tr key={row.category}>
                  <td className="strong-cell">{row.category}</td>
                  <td className="num">{money(row.ledger_a)}</td>
                  <td className="num">{money(row.ledger_b)}</td>
                  <td className="num">
                    {variance ? (
                      <span className={`delta ${variance > 0 ? 'over' : 'under'}`}>
                        {variance > 0 ? '+' : '−'}
                        {money(Math.abs(variance))}
                      </span>
                    ) : (
                      <span className="delta none">Matched</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="num">{money(totals.a)}</td>
              <td className="num">{money(totals.b)}</td>
              <td className="num">
                {totalVariance ? (
                  <span className={`delta ${totalVariance > 0 ? 'over' : 'under'}`}>
                    {totalVariance > 0 ? '+' : '−'}
                    {money(Math.abs(totalVariance))}
                  </span>
                ) : (
                  <span className="delta none">Matched</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Panel>
  );
}
