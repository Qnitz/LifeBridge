# LifeBridge Backend (FastAPI, Local-first)

## Run
```bash
cd lifebridge_backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open: http://localhost:8000

## What you get
- Serves the UI (index.html + static assets)
- Local SQLite DB (events, alerts, config) in `lifebridge.db`
- Built-in simulator generates activity + occasional fall events so you can demo the full flow
- REST APIs:
  - GET /api/status
  - GET /api/activity?limit=30
  - GET /api/alerts?limit=10
  - POST /api/alerts/{id}/ack
  - GET /api/config
  - PUT /api/config
  - GET /api/logs/export (CSV)
