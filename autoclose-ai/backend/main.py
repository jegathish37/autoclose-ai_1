from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from reconcile import load_ledger, reconcile, detect_anomalies
from narrative import generate_close_summary

app = FastAPI(title="AutoClose AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/run-close")
def run_close():
    """
    Runs the full agent pipeline end-to-end:
    load -> reconcile -> detect anomalies -> generate summary
    """
    ledger_a = load_ledger("../data/ledger_a.csv")
    ledger_b = load_ledger("../data/ledger_b.csv")

    reconciliation = reconcile(ledger_a, ledger_b)
    anomalies = detect_anomalies(ledger_b)
    summary = generate_close_summary(reconciliation, anomalies)

    return {
        "reconciliation": reconciliation,
        "anomalies": anomalies,
        "summary": summary,
    }


@app.get("/")
def root():
    return {"status": "AutoClose AI backend running"}
