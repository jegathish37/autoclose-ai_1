"""
Core reconciliation + anomaly detection logic for AutoClose AI.

This is intentionally simple and readable so it's easy to demo and explain
to judges — the "agent" part comes from chaining these steps together
and having the LLM reason over the flagged items.
"""

import pandas as pd


def load_ledger(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


def reconcile(ledger_a: pd.DataFrame, ledger_b: pd.DataFrame) -> dict:
    """
    Compares two ledgers by transaction_id and flags:
      - matched: same id, same amount -> auto-approved
      - mismatched: same id, different amount -> needs review
      - missing_in_b: exists in A but not B -> needs review
      - missing_in_a: exists in B but not A -> needs review
    """
    merged = ledger_a.merge(
        ledger_b, on="transaction_id", how="outer",
        suffixes=("_a", "_b"), indicator=True
    )

    matched = []
    mismatched = []
    missing_in_b = []
    missing_in_a = []

    for _, row in merged.iterrows():
        if row["_merge"] == "both":
            if row["amount_a"] == row["amount_b"]:
                matched.append(row["transaction_id"])
            else:
                mismatched.append({
                    "transaction_id": row["transaction_id"],
                    "description": row.get("description_a", row.get("description_b")),
                    "amount_a": row["amount_a"],
                    "amount_b": row["amount_b"],
                    "diff": round(row["amount_b"] - row["amount_a"], 2),
                })
        elif row["_merge"] == "left_only":
            missing_in_b.append({
                "transaction_id": row["transaction_id"],
                "description": row.get("description_a"),
                "amount": row.get("amount_a"),
            })
        else:
            missing_in_a.append({
                "transaction_id": row["transaction_id"],
                "description": row.get("description_b"),
                "amount": row.get("amount_b"),
            })

    return {
        "matched": matched,
        "mismatched": mismatched,
        "missing_in_b": missing_in_b,
        "missing_in_a": missing_in_a,
    }


def detect_anomalies(ledger: pd.DataFrame, threshold_pct: float = 50.0) -> list:
    """
    Flags categories whose total spend jumped more than `threshold_pct`
    compared to the average of other categories' spend.
    Simple stand-in for a more advanced model — good enough for a demo.
    """
    totals = ledger.groupby("category")["amount"].sum()
    avg = totals.mean()
    anomalies = []

    for category, total in totals.items():
        pct_diff = ((total - avg) / avg) * 100
        if pct_diff > threshold_pct:
            anomalies.append({
                "category": category,
                "total": round(total, 2),
                "pct_above_average": round(pct_diff, 1),
            })

    return anomalies
