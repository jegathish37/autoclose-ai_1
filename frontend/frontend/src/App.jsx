import React, { useCallback, useEffect, useState } from 'react';
import './styles.css';

import { fetchAudit, runSampleClose, runUploadClose, submitDecision } from './api';
import { money } from './format';

import Sidebar, { NAV_ITEMS } from './components/Sidebar';
import Topbar from './components/Topbar';
import Icon from './components/Icon';
import Panel from './components/Panel';
import MetricCard from './components/MetricCard';
import UploadPanel from './components/UploadPanel';
import SpendChart from './components/SpendChart';
import MatchDonut from './components/MatchDonut';
import VarianceChart from './components/VarianceChart';
import ReadinessRing from './components/ReadinessRing';
import VarianceTable from './components/VarianceTable';
import SummaryPanel from './components/SummaryPanel';
import ReviewQueue from './components/ReviewQueue';
import AuditTable from './components/AuditTable';
import EmptyState from './components/EmptyState';
import { PanelSkeleton } from './components/Skeleton';

export default function App() {
  const [result, setResult] = useState(null); // latest response from the backend
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [active, setActive] = useState('overview');
  const [busyId, setBusyId] = useState(null); // review item being saved
  const [backend, setBackend] = useState('unknown'); // unknown | online | offline

  const loadAudit = useCallback(async () => {
    try {
      const data = await fetchAudit();
      setAudit(Array.isArray(data) ? data : []);
      setBackend('online');
    } catch (e) {
      if (e.network) setBackend('offline');
    }
  }, []);

  // Also tells us straight away whether the backend is reachable.
  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const runClose = async (useUploads) => {
    setLoading(true);
    setError('');
    try {
      const data = useUploads ? await runUploadClose(fileA, fileB) : await runSampleClose();
      setResult(data);
      setBackend('online');
      await loadAudit();
      setActive('overview');
    } catch (e) {
      if (e.network) {
        setBackend('offline');
        setError(`${e.message}. Start it with: python -m uvicorn main:app --reload --port 8000`);
      } else {
        setError(`Could not run close: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const decide = async (item, decision) => {
    setBusyId(item.id);
    setError('');
    try {
      await submitDecision(item.id, decision);
      setResult((prev) => {
        if (!prev) return prev;
        const review_items = prev.review_items.map((i) =>
          i.id === item.id ? { ...i, status: decision } : i,
        );
        return {
          ...prev,
          review_items,
          ready_to_post: review_items.every((i) => i.status === 'approved'),
        };
      });
      await loadAudit();
    } catch (e) {
      setError(`Review update failed: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  };

  // Print from the overview so every section ends up in the report.
  const exportReport = () => {
    setActive('overview');
    setTimeout(() => window.print(), 150);
  };

  const stats = result?.stats || {};
  const rows = result?.category_variance || [];
  const reviews = result?.review_items || [];
  const pendingCount = reviews.filter((r) => (r.status || 'pending') === 'pending').length;
  const sectionLabel = NAV_ITEMS.find((n) => n.id === active)?.label;
  const show = (id) => active === 'overview' || active === id;

  return (
    <div className="app">
      <Sidebar active={active} onSelect={setActive} pendingCount={pendingCount} backend={backend} />

      <div className="main">
        <Topbar section={sectionLabel} />

        <main className={`content ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
          {result && (
            <div className="print-header">
              <h1>AutoClose AI · Month-End Close Report</h1>
              <p>
                Generated {new Date().toLocaleString('en-GB')} ·{' '}
                {result.ready_to_post ? 'Ready to post' : 'Pending human review'}
              </p>
            </div>
          )}

          <section className="hero">
            <div>
              <div className="eyebrow">
                <Icon name="sparkle" size={13} /> AI-POWERED FINANCIAL CLOSE
              </div>
              <h1>{active === 'overview' ? 'Financial command center' : sectionLabel}</h1>
              <p>Reconcile ledgers, investigate exceptions, and confidently close your books.</p>
            </div>
            <div className="hero-actions">
              {result && (
                <button type="button" className="btn ghost" onClick={exportReport}>
                  <Icon name="printer" size={17} /> Export report
                </button>
              )}
              <button type="button" className="btn primary" onClick={() => runClose(false)} disabled={loading}>
                <Icon name={loading ? 'refresh' : 'sparkle'} size={17} className={loading ? 'spin' : ''} />
                {loading ? 'Processing…' : result ? 'Re-run sample close' : 'Run sample close'}
              </button>
            </div>
          </section>

          {error && (
            <div className="alert" role="alert">
              <Icon name="alert" size={18} />
              <span>{error}</span>
            </div>
          )}

          {active === 'overview' && (
            <>
              <div className="metrics">
                <MetricCard
                  label="Transactions"
                  icon="rows"
                  tone="blue"
                  loading={loading && !result}
                  value={result ? Number(stats.total_transactions || 0).toLocaleString() : '—'}
                  hint="Processed across ledgers"
                />
                <MetricCard
                  label="Auto-matched"
                  icon="check"
                  tone="teal"
                  loading={loading && !result}
                  value={result ? `${stats.match_rate}%` : '—'}
                  hint="Reconciliation match rate"
                />
                <MetricCard
                  label="Needs review"
                  icon="info"
                  tone="amber"
                  loading={loading && !result}
                  value={result ? stats.needs_review : '—'}
                  hint="Exceptions requiring action"
                />
                <MetricCard
                  label="Net variance"
                  icon="trend"
                  tone="violet"
                  loading={loading && !result}
                  value={result ? money(stats.net_variance) : '—'}
                  hint="Difference across ledgers"
                />
              </div>

              <UploadPanel
                fileA={fileA}
                fileB={fileB}
                onFileA={setFileA}
                onFileB={setFileB}
                onRun={() => runClose(true)}
                loading={loading}
              />
            </>
          )}

          {!result && active !== 'audit' && (
            loading ? (
              <>
                <PanelSkeleton title="Spend by category" lines={5} />
                <PanelSkeleton title="AI close report" lines={4} />
              </>
            ) : (
              <EmptyState onRun={() => runClose(false)} loading={loading} />
            )
          )}

          {result && (
            <>
              {show('analytics') && (
                <>
                  <div className="grid two-one">
                    <Panel
                      title="Spend by category"
                      subtitle="Ledger A compared with Ledger B"
                      extra={<span className="tag">LIVE RESULTS</span>}
                    >
                      <SpendChart rows={rows} />
                    </Panel>
                    <Panel title="Match status" subtitle="How every transaction was reconciled">
                      <MatchDonut reconciliation={result.reconciliation} stats={stats} />
                    </Panel>
                  </div>

                  <div className="grid one-one">
                    <Panel title="Variance by category" subtitle="Ledger B minus Ledger A">
                      <VarianceChart rows={rows} />
                    </Panel>
                    <Panel title="Close readiness" subtitle="Approval status of flagged items">
                      <ReadinessRing reviews={reviews} ready={result.ready_to_post} />
                    </Panel>
                  </div>

                  <VarianceTable rows={rows} />
                </>
              )}

              {show('summary') && <SummaryPanel summary={result.summary} />}

              {show('reviews') && (
                <ReviewQueue
                  reviews={reviews}
                  ready={result.ready_to_post}
                  busyId={busyId}
                  onDecide={decide}
                />
              )}
            </>
          )}

          {show('audit') && <AuditTable audit={audit} onRefresh={loadAudit} />}

          <footer className="footer">
            AutoClose AI <span>·</span> Intelligent finance operations <span>·</span> Human-approved closing
          </footer>
        </main>
      </div>
    </div>
  );
}
