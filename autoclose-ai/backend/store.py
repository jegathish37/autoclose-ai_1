"""
Tiny JSON-file store for human review decisions and the audit trail.
Swap for SQLite/Postgres later; the interface is deliberately small.
"""

import json
import threading
from datetime import datetime, timezone
from pathlib import Path

DATA_FILE = Path(__file__).parent / "state.json"
_lock = threading.Lock()


def _load() -> dict:
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text())
    return {"decisions": {}, "audit": []}


def _save(state: dict) -> None:
    DATA_FILE.write_text(json.dumps(state, indent=2))


def log_event(actor: str, action: str, details: dict | None = None) -> dict:
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": actor,  # "agent" or "human"
        "action": action,
        "details": details or {},
    }
    with _lock:
        state = _load()
        state["audit"].append(event)
        _save(state)
    return event


def set_decision(item_id: str, decision: str, note: str = "") -> dict:
    with _lock:
        state = _load()
        state["decisions"][item_id] = {"decision": decision, "note": note}
        state["audit"].append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actor": "human",
            "action": f"review_{decision}",
            "details": {"item_id": item_id, "note": note},
        })
        _save(state)
    return state["decisions"][item_id]


def get_decisions() -> dict:
    with _lock:
        return _load()["decisions"]


def get_audit() -> list:
    with _lock:
        return _load()["audit"]
