# AutoClose AI 🧾🤖
### An AI agent that helps finance teams close their books faster

## The Problem
Every month, finance controllers spend up to a week manually reconciling
transactions, chasing down mismatched numbers, flagging weird spending,
and writing up explanations for leadership. It's slow, repetitive, and
takes time away from actual decision-making.

## What We Built
AutoClose AI is an agent that handles the repetitive parts of "month-end
close" so a controller doesn't have to do it by hand:

- **Reconciliation** — matches transactions across two ledgers automatically
- **Anomaly detection** — flags unusual spend and explains *why* it looks off
- **Narrative generation** — drafts the variance report a controller
  normally writes manually
- **Human review** — every flagged item goes to a simple dashboard where
  a human approves or rejects before anything is "posted"
- **Audit trail** — every action the agent takes is logged, since this
  matters a lot in finance

The goal: turn a multi-day close process into something that takes minutes,
with a human still in control of the final call.

## Features
- Reconcile two ledgers by transaction ID (matched / mismatched / missing)
- Detect possible duplicate charges and category outliers
- AI-written close summary (Claude), with an offline fallback when no API key is set
- Review queue: approve or reject every flagged item; "ready to post" only when all are approved
- Full audit trail of every agent action and human decision
- Dashboard: summary tiles, spend-by-category chart, variance table
- Upload your own two CSV ledgers

## Demo Walkthrough
1. Click **Run Close (sample data)**
2. The agent finds 9 of 11 transactions match automatically
3. It flags T009 (consulting fees differ by $450), T011 (missing from Ledger A)
   and T011 again as a likely duplicate of T006 (same $6,200 Google Ads charge)
4. Approve or reject each item, then check the Audit Trail

## Tech Stack
- **Frontend:** React + Recharts (dashboard, variance charts)
- **Backend:** Python (FastAPI)
- **AI:** Claude API for reasoning + narrative generation
- **Data:** mock ledger/transaction data (CSV)

## Project Structure
```
autoclose-ai/
├── frontend/       # React dashboard
├── backend/        # API + agent logic
├── data/           # sample/mock ledger data
├── docs/           # architecture notes
└── README.md
```

## Getting Started
```bash
# backend (terminal 1)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# frontend (terminal 2)
cd frontend
npm install
npm start
```
Open http://localhost:3000. To use Claude for the summary, set
`ANTHROPIC_API_KEY` before starting the backend (see `backend/.env.example`);
without it the app uses a built-in summary.

## Team
_Add your team names here_

## Track
Track 4: AI Finance Controller
