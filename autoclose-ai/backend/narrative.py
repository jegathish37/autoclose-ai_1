"""
Turns raw reconciliation + anomaly results into a plain-English variance
report. Uses Claude when ANTHROPIC_API_KEY is set; otherwise (or if the API
call fails) falls back to a deterministic summary so the demo never breaks.
"""

import os
import json

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5")


def _fallback_summary(reconciliation: dict, anomalies: list) -> str:
    matched = len(reconciliation["matched"])
    issues = (
        len(reconciliation["mismatched"])
        + len(reconciliation["missing_in_a"])
        + len(reconciliation["missing_in_b"])
    )
    total = matched + issues
    lines = [
        f"{matched} of {total} transactions matched automatically; "
        f"{issues} need review and {len(anomalies)} anomalies were flagged.",
        "",
        "Items needing review:",
    ]
    for m in reconciliation["mismatched"]:
        lines.append(f"- {m['transaction_id']} ({m['description']}): amounts differ by {m['diff']:+.2f}")
    for m in reconciliation["missing_in_a"]:
        lines.append(f"- {m['transaction_id']} ({m['description']}): missing from Ledger A ({m['amount']:.2f})")
    for m in reconciliation["missing_in_b"]:
        lines.append(f"- {m['transaction_id']} ({m['description']}): missing from Ledger B ({m['amount']:.2f})")
    if anomalies:
        lines += ["", "Anomalies:"]
        for a in anomalies:
            lines.append(f"- {a['transaction_id']}: {a['reason']}")
    return "\n".join(lines)


def generate_close_summary(reconciliation: dict, anomalies: list) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _fallback_summary(reconciliation, anomalies)

    try:
        from anthropic import Anthropic

        client = Anthropic(api_key=api_key)
        prompt = f"""
You are a finance controller writing a short month-end close summary
for leadership. Be clear, plain-English, and confident. Use only the data
below. Do not invent numbers that aren't given.

Reconciliation results:
{json.dumps(reconciliation, indent=2)}

Anomalies detected:
{json.dumps(anomalies, indent=2)}

Write:
1. A 2-3 sentence overview of how clean the close was.
2. A short bullet list of items that need human review, and why.
3. A one-sentence plain-English explanation for each anomaly.
"""
        response = client.messages.create(
            model=MODEL,
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text
    except Exception as exc:  # network error, bad key, etc.
        return _fallback_summary(reconciliation, anomalies) + f"\n\n(AI summary unavailable: {exc})"
