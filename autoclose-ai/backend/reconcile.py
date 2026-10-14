"""
Core reconciliation + anomaly detection logic for AutoClose AI.

Kept intentionally simple and readable so it is easy to demo and explain.
The "agent" part comes from chaining these steps together and having the
LLM reason over the flagged items.
"""

import pandas as pd


def load_ledger(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


def _py(value):
    """Convert numpy/pandas scalars to plain Python types (JSON safe)."""
    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value


def reconcile(ledger_a: pd.DataFrame, ledger_b: pd.DataFrame) -> dict:
    """
    Compares two ledgers by transaction_id and sorts every row into:
      - matched: same id, same amount -> auto-approved
      - mismatched: same id, different amount -> needs review
      - missing_in_b: exists in A but not B -> needs review
      - missing_in_a: exists in B but not A -> needs review
    """
    merged = ledger_a.merge(
        ledger_b, on="transaction_id", how="outer",
        suffixes=("_a", "_b"), indicator=True,
    )

    matched, mismatched, missing_in_b, missing_in_a = [], [], [], []

    for _, row in merged.iterrows():
        txn_id = _py(row["transaction_id"])
        if row["_merge"] == "both":
            if round(row["amount_a"], 2) == round(row["amount_b"], 2):
                matched.append(txn_id)
            else:
                mismatched.append({
                    "transaction_id": txn_id,
                    "description": _py(row["description_a"]),
                    "amount_a": _py(row["amount_a"]),
                    "amount_b": _py(row["amount_b"]),
                    "diff": round(float(row["amount_b"] - row["amount_a"]), 2),
                })
        elif row["_merge"] == "left_only":
            missing_in_b.append({
                "transaction_id": txn_id,
                "description": _py(row["description_a"]),
                "amount": _py(row["amount_a"]),
            })
        else:
            missing_in_a.append({
                "transaction_id": txn_id,
                "description": _py(row["description_b"]),
                "amount": _py(row["amount_b"]),
            })

    return {
        "matched": matched,
        "mismatched": mismatched,
        "missing_in_b": missing_in_b,
        "missing_in_a": missing_in_a,
    }


def detect_anomalies(ledger: pd.DataFrame, window_days: int = 14,
                     outlier_multiple: float = 3.0) -> list:
    """
    Flags two kinds of unusual transactions in a ledger:
      - possible_duplicate: same description + amount within `window_days`
      - outlier: amount is more than `outlier_multiple` x the median of its
        category (only checked for categories with 3+ transactions)
    """
    df = ledger.copy()
    df["date"] = pd.to_datetime(df["date"])
    anomalies = []

    # Possible duplicates
    for (desc, amount), grp in df.groupby(["description", "amount"]):
        if len(grp) < 2:
            continue
        grp = grp.sort_values("date")
        for i in range(1, len(grp)):
            prev, cur = grp.iloc[i - 1], grp.iloc[i]
            gap = (cur["date"] - prev["date"]).days
            if gap <= window_days:
                anomalies.append({
                    "type": "possible_duplicate",
                    "transaction_id": _py(cur["transaction_id"]),
                    "duplicate_of": _py(prev["transaction_id"]),
                    "description": _py(desc),
                    "amount": _py(amount),
                    "reason": (
                        f"Same description and amount as {prev['transaction_id']} "
                        f"posted {gap} days earlier."
                    ),
                })

    # Category outliers
    for category, grp in df.groupby("category"):
        if len(grp) < 3:
            continue
        median = grp["amount"].median()
        for _, row in grp.iterrows():
            if median > 0 and row["amount"] > outlier_multiple * median:
                anomalies.append({
                    "type": "outlier",
                    "transaction_id": _py(row["transaction_id"]),
                    "description": _py(row["description"]),
                    "amount": _py(row["amount"]),
                    "reason": (
                        f"{row['amount']:.2f} is more than {outlier_multiple:g}x the "
                        f"{category} median of {median:.2f}."
                    ),
                })

    return anomalies


REQUIRED_COLUMNS = {"transaction_id", "date", "description", "category", "amount"}


def validate_ledger(df: pd.DataFrame, name: str) -> None:
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"{name} is missing columns: {', '.join(sorted(missing))}")


def category_variance(ledger_a: pd.DataFrame, ledger_b: pd.DataFrame) -> list:
    """Total spend per category in each ledger, plus the difference (B - A)."""
    a = ledger_a.groupby("category")["amount"].sum()
    b = ledger_b.groupby("category")["amount"].sum()
    rows = []
    for category in sorted(set(a.index) | set(b.index)):
        total_a = float(a.get(category, 0.0))
        total_b = float(b.get(category, 0.0))
        rows.append({
            "category": category,
            "ledger_a": round(total_a, 2),
            "ledger_b": round(total_b, 2),
            "variance": round(total_b - total_a, 2),
        })
    return rows
