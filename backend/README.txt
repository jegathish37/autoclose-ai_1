AUTOCLOSE AI — GEMINI INTEGRATION

1. Back up your original backend folder.
2. Copy narrative.py into your existing backend folder, replacing the old narrative.py.
3. Replace backend/requirements.txt with this requirements.txt.
4. main.py and pipeline.py are included for reference; they are unchanged and do not need replacing.
5. Keep backend/.env with GEMINI_API_KEY=<your real key> (never share or commit it).
6. In VS Code terminal, from the backend folder:
   python -m pip install -r requirements.txt
   python -m uvicorn main:app --reload --port 8000
7. Keep your React frontend running, then click Run sample close or upload CSV ledgers.

The AI summary will use Gemini (default gemini-2.5-flash). You can set GEMINI_MODEL in .env if needed.
If Gemini is unavailable, the system generates a clearly labeled rule-based summary.

Note: AI only drafts narrative text. It does not change ledger values or post accounting entries.
