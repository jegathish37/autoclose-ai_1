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

## Tech Stack
- **Frontend:** React + Recharts (dashboard, variance charts)
- **Backend:** Python (FastAPI) or Node.js
- **AI:** Claude API for reasoning + narrative generation
- **Data:** mock ledger/transaction data (CSV)

## Project Structure
```
autoclose-ai/
├── frontend/       # React dashboard
├── backend/        # API + agent logic
├── data/           # sample/mock ledger data
├── docs/           # notes, diagrams, writeup
└── README.md
```

## Getting Started
```bash
# backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# frontend
cd frontend
npm install
npm start
```

## Team
_Add your team names here_

## Track
Track 4: AI Finance Controller
