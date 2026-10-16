from pathlib import Path
from typing import Literal

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import store
from pipeline import run_pipeline
from reconcile import load_ledger

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

app = FastAPI(title="AutoClose AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/run-close")
def run_close():
    """Run the agent on the bundled sample ledgers."""
    return run_pipeline(
        load_ledger(DATA_DIR / "ledger_a.csv"),
        load_ledger(DATA_DIR / "ledger_b.csv"),
    )


@app.post("/run-close-upload")
def run_close_upload(ledger_a: UploadFile = File(...), ledger_b: UploadFile = File(...)):
    """Run the agent on two uploaded CSV ledgers."""
    try:
        a = pd.read_csv(ledger_a.file)
        b = pd.read_csv(ledger_b.file)
        return run_pipeline(a, b)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the CSV files.")


class ReviewDecision(BaseModel):
    decision: Literal["approved", "rejected"]
    note: str = ""


@app.post("/review/{item_id:path}")
def review(item_id: str, body: ReviewDecision):
    if ":" not in item_id:
        raise HTTPException(status_code=400, detail="Invalid item id")
    return store.set_decision(item_id, body.decision, body.note)


@app.get("/audit")
def audit():
    return store.get_audit()


@app.get("/")
def root():
    return {"status": "AutoClose AI backend running"}
