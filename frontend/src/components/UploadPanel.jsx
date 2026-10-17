import React, { useState } from 'react';
import Panel from './Panel';
import Icon from './Icon';
import { formatFileSize } from '../format';

/** One drag-and-drop / click-to-browse CSV slot. */
function FileDrop({ label, file, onChange }) {
  const [dragging, setDragging] = useState(false);

  const accept = (candidate) => {
    if (candidate && candidate.name.toLowerCase().endsWith('.csv')) onChange(candidate);
  };

  return (
    <label
      className={`file-drop ${file ? 'has-file' : ''} ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        accept(e.dataTransfer.files?.[0]);
      }}
    >
      <span className="file-icon">
        <Icon name={file ? 'check' : 'upload'} size={20} />
      </span>
      <b>{label}</b>
      <small>{file ? `${file.name} · ${formatFileSize(file.size)}` : 'Drop a CSV here or click to browse'}</small>
      <input type="file" accept=".csv,text/csv" onChange={(e) => accept(e.target.files?.[0])} />
    </label>
  );
}

export default function UploadPanel({ fileA, fileB, onFileA, onFileB, onRun, loading }) {
  return (
    <Panel
      className="upload-panel"
      title="Start a reconciliation"
      subtitle="Upload two CSV ledgers, or use the sample dataset above"
      extra={
        <span className="tag">
          <Icon name="shield" size={14} /> SECURE WORKFLOW
        </span>
      }
    >
      <div className="upload-grid">
        <FileDrop label="Ledger A" file={fileA} onChange={onFileA} />
        <FileDrop label="Ledger B" file={fileB} onChange={onFileB} />
        <div className="upload-action">
          <p>Ready to reconcile?</p>
          <small>Required columns: transaction_id, date, description, category, amount</small>
          <button
            type="button"
            className="btn primary"
            onClick={onRun}
            disabled={loading || !fileA || !fileB}
          >
            {loading ? 'Processing…' : 'Run uploaded ledgers'} <Icon name="arrow" size={17} />
          </button>
        </div>
      </div>
    </Panel>
  );
}
