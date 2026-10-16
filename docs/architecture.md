# Architecture

```
CSV ledgers -> reconcile.py -> detect_anomalies -> narrative.py (Gemini) -> review queue -> audit log
                                                                              |
                                              React dashboard <-- FastAPI <---+
```

- `backend/reconcile.py`: matching, duplicate/outlier detection, category variance
- `backend/narrative.py`: Gemini-written summary with offline fallback
- `backend/pipeline.py`: runs the whole close and builds the review items
- `backend/store.py`: JSON-file store for review decisions and the audit log
- `backend/main.py`: FastAPI endpoints (`/run-close`, `/run-close-upload`, `/review/{id}`, `/audit`)
- `frontend/src/App.jsx`: dashboard, review queue, audit table

Human in the loop: the agent never marks anything posted. `ready_to_post`
is true only when every flagged item has been approved by a person.
