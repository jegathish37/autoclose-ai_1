"""The full close pipeline, independent of the web framework."""

import store
from narrative import generate_close_summary
from reconcile import (
    reconcile, detect_anomalies, category_variance, validate_ledger,
)


def build_review_items(reconciliation: dict, anomalies: list) -> list:
    """Everything the agent is NOT allowed to post without a human decision."""
    items = []
    for m in reconciliation["mismatched"]:
        items.append({
            "id": f"mismatch:{m['transaction_id']}", "type": "mismatch",
            "transaction_id": m["transaction_id"], "description": m["description"],
            "detail": f"Ledger A {m['amount_a']:.2f} vs Ledger B {m['amount_b']:.2f} (diff {m['diff']:+.2f})",
        })
    for key, label in (("missing_in_a", "Ledger A"), ("missing_in_b", "Ledger B")):
        for m in reconciliation[key]:
            items.append({
                "id": f"{key}:{m['transaction_id']}", "type": key,
                "transaction_id": m["transaction_id"], "description": m["description"],
                "detail": f"Missing from {label} ({m['amount']:.2f})",
            })
    for a in anomalies:
        items.append({
            "id": f"{a['type']}:{a['transaction_id']}", "type": a["type"],
            "transaction_id": a["transaction_id"], "description": a["description"],
            "detail": a["reason"],
        })
    return items


def run_pipeline(ledger_a, ledger_b) -> dict:
    validate_ledger(ledger_a, "Ledger A")
    validate_ledger(ledger_b, "Ledger B")

    reconciliation = reconcile(ledger_a, ledger_b)
    store.log_event("agent", "reconciled", {
        "matched": len(reconciliation["matched"]),
        "mismatched": len(reconciliation["mismatched"]),
        "missing_in_a": len(reconciliation["missing_in_a"]),
        "missing_in_b": len(reconciliation["missing_in_b"]),
    })

    anomalies = detect_anomalies(ledger_b)
    store.log_event("agent", "anomalies_detected", {"count": len(anomalies)})

    summary = generate_close_summary(reconciliation, anomalies)
    store.log_event("agent", "summary_generated")

    decisions = store.get_decisions()
    review_items = build_review_items(reconciliation, anomalies)
    for item in review_items:
        item["status"] = decisions.get(item["id"], {}).get("decision", "pending")

    total = (len(reconciliation["matched"]) + len(reconciliation["mismatched"])
             + len(reconciliation["missing_in_a"]) + len(reconciliation["missing_in_b"]))
    stats = {
        "total_transactions": total,
        "matched": len(reconciliation["matched"]),
        "match_rate": round(100 * len(reconciliation["matched"]) / total, 1) if total else 100.0,
        "needs_review": len(review_items),
        "net_variance": round(sum(m["diff"] for m in reconciliation["mismatched"]), 2),
    }

    return {
        "reconciliation": reconciliation,
        "anomalies": anomalies,
        "review_items": review_items,
        "category_variance": category_variance(ledger_a, ledger_b),
        "stats": stats,
        "summary": summary,
        "ready_to_post": all(i["status"] == "approved" for i in review_items),
    }
