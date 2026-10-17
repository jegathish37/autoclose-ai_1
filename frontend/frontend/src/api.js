// Thin wrapper around the AutoClose AI backend (FastAPI).
// Override the address with REACT_APP_API_URL if the backend runs elsewhere.

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    const error = new Error(`Cannot reach the backend at ${API_URL}`);
    error.network = true;
    throw error;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Server returned ${response.status}`);
  }
  return response.json();
}

/** Run the agent on the bundled sample ledgers. */
export const runSampleClose = () => request('/run-close');

/** Run the agent on two CSV files chosen by the user. */
export function runUploadClose(ledgerA, ledgerB) {
  const form = new FormData();
  form.append('ledger_a', ledgerA);
  form.append('ledger_b', ledgerB);
  return request('/run-close-upload', { method: 'POST', body: form });
}

/** Record a human approve / reject decision for one review item. */
export const submitDecision = (itemId, decision) =>
  request(`/review/${itemId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  });

/** Full audit trail (agent actions and human decisions). */
export const fetchAudit = () => request('/audit');
