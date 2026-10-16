import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";

const API = "http://localhost:8000";

const statusStyle = {
  pending: { background: "#fef3c7", color: "#92400e" },
  approved: { background: "#dcfce7", color: "#166534" },
  rejected: { background: "#fee2e2", color: "#991b1b" },
};

const money = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function Tile({ label, value, color }) {
  return (
    <div style={{ flex: 1, minWidth: 150, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 13, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || "#0f172a" }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [result, setResult] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);

  const loadAudit = async () => {
    try {
      const res = await fetch(`${API}/audit`);
      setAudit(await res.json());
    } catch (e) {
      /* audit is non-critical */
    }
  };

  const run = async (useUpload) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (useUpload) {
        const form = new FormData();
        form.append("ledger_a", fileA);
        form.append("ledger_b", fileB);
        res = await fetch(`${API}/run-close-upload`, { method: "POST", body: form });
      } else {
        res = await fetch(`${API}/run-close`);
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Server returned ${res.status}`);
      }
      setResult(await res.json());
      await loadAudit();
    } catch (err) {
      setError(`Could not run close: ${err.message}. Is the backend running on ${API}?`);
    }
    setLoading(false);
  };

  const decide = async (item, decision) => {
    await fetch(`${API}/review/${item.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setResult((prev) => {
      const review_items = prev.review_items.map((i) =>
        i.id === item.id ? { ...i, status: decision } : i
      );
      return {
        ...prev,
        review_items,
        ready_to_post: review_items.every((i) => i.status === "approved"),
      };
    });
    loadAudit();
  };

  const btn = { padding: "10px 20px", color: "white", border: "none", borderRadius: 6, cursor: "pointer" };

  return (
    <div style={{ maxWidth: 940, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 4 }}>AutoClose AI</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        An AI agent that reconciles ledgers, flags problems and drafts the close report. You approve before anything is posted.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => run(false)} disabled={loading} style={{ ...btn, background: "#2563eb" }}>
          {loading ? "Running close..." : "Run Close (sample data)"}
        </button>
        <span style={{ color: "#94a3b8" }}>or upload your own:</span>
        <label style={{ fontSize: 13 }}>
          Ledger A <input type="file" accept=".csv" onChange={(e) => setFileA(e.target.files[0])} />
        </label>
        <label style={{ fontSize: 13 }}>
          Ledger B <input type="file" accept=".csv" onChange={(e) => setFileB(e.target.files[0])} />
        </label>
        <button
          onClick={() => run(true)}
          disabled={loading || !fileA || !fileB}
          style={{ ...btn, background: !fileA || !fileB ? "#94a3b8" : "#0f766e" }}
        >
          Run on uploads
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#94a3b8" }}>
        CSV columns required: transaction_id, date, description, category, amount
      </p>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Tile label="Transactions" value={result.stats.total_transactions} />
            <Tile label="Auto-matched" value={`${result.stats.match_rate}%`} color="#166534" />
            <Tile label="Needs review" value={result.stats.needs_review} color={result.stats.needs_review ? "#b45309" : "#166534"} />
            <Tile label="Net variance" value={money(result.stats.net_variance)} />
          </div>

          <h2>Spend by Category</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={result.category_variance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(v) => money(v)} />
                <Legend />
                <Bar dataKey="ledger_a" name="Ledger A" fill="#94a3b8" />
                <Bar dataKey="ledger_b" name="Ledger B" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2>Variance by Category</h2>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                <th>Category</th><th>Ledger A</th><th>Ledger B</th><th>Variance</th>
              </tr>
            </thead>
            <tbody>
              {result.category_variance.map((r) => (
                <tr key={r.category} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td>{r.category}</td>
                  <td>{money(r.ledger_a)}</td>
                  <td>{money(r.ledger_b)}</td>
                  <td style={{ color: r.variance ? "#b91c1c" : "#166534", fontWeight: 600 }}>
                    {r.variance ? money(r.variance) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>AI Summary</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
            {result.summary}
          </pre>

          <h2>Needs Review ({result.review_items.length})</h2>
          {result.review_items.length === 0 && <p>Nothing to review. Clean close.</p>}
          {result.review_items.map((item) => (
            <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{item.transaction_id} — {item.description}</strong>
                <span style={{ ...statusStyle[item.status], padding: "2px 10px", borderRadius: 12, fontSize: 13 }}>
                  {item.status}
                </span>
              </div>
              <div style={{ color: "#555", margin: "6px 0" }}>
                <em>{item.type.replace(/_/g, " ")}</em>: {item.detail}
              </div>
              <button onClick={() => decide(item, "approved")} style={{ marginRight: 8 }}>Approve</button>
              <button onClick={() => decide(item, "rejected")}>Reject</button>
            </div>
          ))}

          <p style={{ fontWeight: 600, color: result.ready_to_post ? "#166534" : "#b45309" }}>
            {result.ready_to_post
              ? "All items approved. Ready to post."
              : "Not ready to post: pending or rejected items remain."}
          </p>

          <h2>Audit Trail</h2>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                <th>Time</th><th>Actor</th><th>Action</th><th>Details</th>
              </tr>
            </thead>
            <tbody>
              {[...audit].reverse().slice(0, 25).map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td>{new Date(e.timestamp).toLocaleTimeString()}</td>
                  <td>{e.actor}</td>
                  <td>{e.action}</td>
                  <td>{JSON.stringify(e.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
