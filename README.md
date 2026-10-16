# AutoClose AI
### An AI agent that helps finance teams close their books faster

## The Problem
Every month, finance controllers spend up to a week manually reconciling
transactions, chasing down mismatched numbers, flagging unusual spending,
and writing up explanations for leadership. It is slow, repetitive, and
takes time away from actual decision-making.

## What We Built
AutoClose AI is an agent that handles the repetitive parts of month-end
close so a controller does not have to do it by hand. A human stays in
control of the final call.

## Features
- Reconcile two ledgers by transaction ID (matched / mismatched / missing)
- Detect possible duplicate charges and category outliers
- AI-written close summary (Google Gemini), with a rule-based fallback when no API key is set
- Review queue: approve or reject every flagged item; "ready to post" only when all are approved
- Full audit trail of every agent action and human decision
- Dashboard: summary tiles, spend-by-category chart, variance table
- Upload your own two CSV ledgers

## Demo Walkthrough
1. Click **Run sample close**
2. The agent reconciles the two ledgers and auto-matches identical transactions
3. It flags mismatches, missing entries and likely duplicates for review
4. Approve or reject each item, then check the Audit Trail

## Tech Stack
- **Frontend:** React + Recharts
- **Backend:** Python (FastAPI)
- **AI:** Google Gemini API (narrative summary only)
- **Data:** mock ledger/transaction data (CSV)

## Project Structure

    autoclose-ai/
    |-- frontend/    React dashboard
    |-- backend/     API and agent logic
    |-- data/        sample ledger data
    +-- docs/        architecture notes

## Getting Started
Backend (terminal 1):

    cd backend
    pip install -r requirements.txt
    python -m uvicorn main:app --reload --port 8000

Frontend (terminal 2):

    cd frontend
    npm install
    npm start

Open http://localhost:3000.

For the AI summary, create `backend/.env` containing `GEMINI_API_KEY=your-key`
(see `backend/.env.example`). Without a key the app still runs and uses a
rule-based summary. The AI only drafts text; it never changes ledger values
or posts entries.

## Team
Jegathish
Prem
deepak
venkatesh

## Track
Track 4: AI Finance Controller