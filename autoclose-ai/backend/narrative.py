"""
Uses Claude to turn raw reconciliation + anomaly results into a
plain-English variance report — the thing a controller would
normally write by hand.
"""

import os
import json
from anthropic import Anthropic

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def generate_close_summary(reconciliation: dict, anomalies: list) -> str:
    prompt = f"""
You are a finance controller writing a short month-end close summary
for leadership. Be clear, plain-English, and confident. Use the data
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
        model="claude-sonnet-4-5",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text
