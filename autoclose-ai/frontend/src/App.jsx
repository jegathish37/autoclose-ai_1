import React, { useState } from "react";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runClose = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/run-close");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>AutoClose AI</h1>
      <p style={{ color: "#555" }}>
        Run the month-end close agent on this month's ledgers.
      </p>

      <button
        onClick={runClose}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "Running close..." : "Run Close"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>Summary</h2>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
            {result.summary}
          </pre>

          <h2>Needs Review</h2>
          <ul>
            {result.reconciliation.mismatched.map((item) => (
              <li key={item.transaction_id}>
                {item.transaction_id} — {item.description}: diff of ${item.diff}
              </li>
            ))}
            {result.reconciliation.missing_in_a.map((item) => (
              <li key={item.transaction_id}>
                {item.transaction_id} — {item.description}: missing from Ledger A (${item.amount})
              </li>
            ))}
          </ul>

          <h2>Anomalies</h2>
          <ul>
            {result.anomalies.map((a) => (
              <li key={a.category}>
                {a.category}: ${a.total} ({a.pct_above_average}% above average)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
