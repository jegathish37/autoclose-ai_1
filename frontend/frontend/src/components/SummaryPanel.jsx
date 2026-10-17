import React from 'react';
import Panel from './Panel';
import Icon from './Icon';

// The backend returns plain text (Gemini markdown, or the rule-based fallback).
// This turns it into headings, bullet lists and paragraphs without using
// dangerouslySetInnerHTML, so text from the model can never inject HTML.

const FALLBACK_NOTE = /^\(Rule-based fallback;?\s*(.*?)\)?$/i;

/** **bold** -> <strong>bold</strong> */
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

function parse(text) {
  const blocks = [];
  let fallbackReason = null;

  text.split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line) return;

    const note = line.match(FALLBACK_NOTE);
    if (note) {
      fallbackReason = note[1] || 'AI unavailable';
      return;
    }

    const markdownHeading = line.match(/^#{1,6}\s+(.*)$/);
    const boldHeading = line.match(/^\*\*([^*]+)\*\*:?$/);
    const shouting = line === line.toUpperCase() && /[A-Z]{4}/.test(line) && line.length < 70;
    if (markdownHeading || boldHeading || shouting) {
      blocks.push({ type: 'heading', text: (markdownHeading || boldHeading || [null, line])[1] });
      return;
    }

    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'list') last.items.push(bullet[1]);
      else blocks.push({ type: 'list', items: [bullet[1]] });
      return;
    }

    blocks.push({ type: 'paragraph', text: line });
  });

  return { blocks, fallbackReason };
}

export default function SummaryPanel({ summary }) {
  const { blocks, fallbackReason } = parse(summary || '');
  const isFallback = fallbackReason !== null;

  return (
    <Panel
      title="AI close report"
      subtitle="Agent-generated reconciliation summary, for human review"
      extra={
        <span className={`ai-label ${isFallback ? 'muted' : ''}`}>
          <Icon name="sparkle" size={14} /> {isFallback ? 'RULE-BASED SUMMARY' : 'GEMINI INSIGHTS'}
        </span>
      }
    >
      {isFallback && (
        <div className="notice">
          <Icon name="info" size={18} />
          <span>
            The AI service was unavailable ({fallbackReason}), so this report was generated from
            fixed rules. The numbers are still exact.
          </span>
        </div>
      )}
      <div className="summary">
        {blocks.length === 0 && <p>No summary returned.</p>}
        {blocks.map((block, i) => {
          if (block.type === 'heading') return <h3 key={i}>{inline(block.text)}</h3>;
          if (block.type === 'list')
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </ul>
            );
          return <p key={i}>{inline(block.text)}</p>;
        })}
      </div>
    </Panel>
  );
}
